import postgres from "postgres";
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_NOT_CONFIGURED");

const sql = postgres(url, { max: 4, connect_timeout: 15 });
const workerId = process.env.RAILWAY_REPLICA_ID || `worker-${randomUUID()}`;
const defaultProviders = (process.env.OSKA_PROVIDERS || "chatgpt-web,parallel-search,tinyfish,exa")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

async function addEvent(jobId, eventType, detail = {}) {
  await sql`
    INSERT INTO oska_job_events (job_id, event_type, detail)
    VALUES (${jobId}, ${eventType}, ${JSON.stringify(detail)}::jsonb)
  `;
}

async function markProvider(provider, ok, error = null) {
  await sql`
    INSERT INTO oska_provider_health (
      provider, status, success_count, failure_count, last_error, last_seen_at, updated_at
    )
    VALUES (
      ${provider},
      ${ok ? "healthy" : "degraded"},
      ${ok ? 1 : 0},
      ${ok ? 0 : 1},
      ${error},
      now(),
      now()
    )
    ON CONFLICT (provider) DO UPDATE SET
      status = EXCLUDED.status,
      success_count = oska_provider_health.success_count + ${ok ? 1 : 0},
      failure_count = oska_provider_health.failure_count + ${ok ? 0 : 1},
      last_error = EXCLUDED.last_error,
      last_seen_at = now(),
      updated_at = now()
  `;
}

async function claimJob() {
  const rows = await sql`
    WITH candidate AS (
      SELECT id
      FROM oska_jobs
      WHERE status IN ('pending','retry')
        AND next_run_at <= now()
      ORDER BY priority DESC, created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE oska_jobs AS j
    SET status = 'running',
        locked_by = ${workerId},
        locked_at = now(),
        attempt_count = j.attempt_count + 1,
        updated_at = now()
    FROM candidate
    WHERE j.id = candidate.id
    RETURNING j.*
  `;
  return rows[0] || null;
}

async function safeJson(response) {
  const text = await response.text();
  try { return text ? JSON.parse(text) : {}; }
  catch { return { raw: text }; }
}

async function callProvider(provider, job) {
  const endpoint = process.env.OSKA_AGENT_DISPATCH_URL;
  if (!endpoint) throw new Error("OSKA_AGENT_DISPATCH_URL_NOT_CONFIGURED");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-oska-provider": provider,
      "x-oska-idempotency-key": `${job.id}:${provider}`,
    },
    body: JSON.stringify({
      jobId: job.id,
      type: job.type,
      payload: job.payload,
      provider,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  const data = await safeJson(response);
  if (!response.ok) throw new Error(`HTTP_${response.status}:${JSON.stringify(data).slice(0,500)}`);
  return data;
}

async function runFailover(job) {
  const providers =
    Array.isArray(job.preferred_providers) && job.preferred_providers.length
      ? job.preferred_providers
      : defaultProviders;

  const failures = [];
  for (const provider of providers) {
    try {
      const evidence = await callProvider(provider, job);
      await markProvider(provider, true);
      await addEvent(job.id, "provider_success", { provider });
      return { ok: true, provider, evidence, failures };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ provider, error: message });
      await markProvider(provider, false, message);
      await addEvent(job.id, "provider_failed", { provider, error: message });
    }
  }

  return { ok: false, failures, error: "ALL_PROVIDERS_FAILED" };
}

async function verify(job, providerResult) {
  const endpoint = process.env.OSKA_VERIFIER_URL;
  if (!endpoint) throw new Error("OSKA_VERIFIER_URL_NOT_CONFIGURED");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-oska-idempotency-key": `${job.id}:verify`,
    },
    body: JSON.stringify({ job, providerResult }),
    signal: AbortSignal.timeout(60_000),
  });

  const data = await safeJson(response);
  if (!response.ok) throw new Error(`VERIFIER_HTTP_${response.status}`);
  if (!data?.ok) throw new Error(`VERIFIER_REJECTED:${JSON.stringify(data).slice(0,500)}`);
  return data;
}

async function sendOutbound(job, providerResult, verification) {
  const endpoint = process.env.OSKA_OUTBOUND_URL;
  if (!endpoint) throw new Error("OSKA_OUTBOUND_URL_NOT_CONFIGURED");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-oska-idempotency-key": `${job.id}:outbound`,
    },
    body: JSON.stringify({ job, providerResult, verification }),
    signal: AbortSignal.timeout(60_000),
  });

  const data = await safeJson(response);
  if (!response.ok) throw new Error(`OUTBOUND_HTTP_${response.status}`);
  return data;
}

async function complete(job, result) {
  await sql`
    UPDATE oska_jobs
    SET status = 'completed',
        result = ${JSON.stringify(result)}::jsonb,
        last_error = NULL,
        locked_by = NULL,
        locked_at = NULL,
        completed_at = now(),
        updated_at = now()
    WHERE id = ${job.id} AND locked_by = ${workerId}
  `;
  await addEvent(job.id, "completed", { workerId });
}

async function fail(job, error) {
  const message = error instanceof Error ? error.message : String(error);
  const terminal = Number(job.attempt_count) >= Number(job.max_attempts);
  const delaySeconds = Math.min(900, 15 * 2 ** Math.max(0, Number(job.attempt_count) - 1));

  await sql`
    UPDATE oska_jobs
    SET status = ${terminal ? "dead_letter" : "retry"},
        last_error = ${message.slice(0, 4000)},
        locked_by = NULL,
        locked_at = NULL,
        next_run_at = CASE
          WHEN ${terminal} THEN next_run_at
          ELSE now() + (${delaySeconds} * interval '1 second')
        END,
        updated_at = now()
    WHERE id = ${job.id} AND locked_by = ${workerId}
  `;

  await addEvent(job.id, terminal ? "dead_letter" : "retry_scheduled", {
    error: message,
    attempt: job.attempt_count,
    delaySeconds: terminal ? null : delaySeconds,
  });
}

async function processJob(job) {
  await addEvent(job.id, "claimed", { workerId, attempt: job.attempt_count });

  if (job.type === "system_canary") {
    await complete(job, { ok: true, workerId, database: "ok" });
    return;
  }

  const isOutbound = job.type === "outbound_email" || job.type === "outbound_whatsapp";
  if (isOutbound && job.approval_status !== "approved") {
    await sql`
      UPDATE oska_jobs
      SET status = 'waiting_approval',
          locked_by = NULL,
          locked_at = NULL,
          updated_at = now()
      WHERE id = ${job.id} AND locked_by = ${workerId}
    `;
    await addEvent(job.id, "waiting_human_approval");
    return;
  }

  const providerResult = await runFailover(job);
  if (!providerResult.ok) throw new Error(providerResult.error);

  const verification = await verify(job, providerResult);

  if (isOutbound) {
    const sent = await sendOutbound(job, providerResult, verification);
    await complete(job, { providerResult, verification, sent });
  } else {
    await complete(job, { providerResult, verification });
  }
}

async function main() {
  console.log(`OSKA worker started: ${workerId}`);

  while (true) {
    const job = await claimJob();
    if (!job) {
      await sleep(2000);
      continue;
    }

    try {
      await processJob(job);
    } catch (error) {
      console.error("job failed", job.id, error);
      await fail(job, error);
    }
  }
}

async function shutdown(signal) {
  console.log("shutdown", signal);
  await sql.end({ timeout: 5 });
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

main().catch(async (error) => {
  console.error(error);
  await sql.end({ timeout: 5 });
  process.exit(1);
});
