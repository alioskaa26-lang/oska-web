import postgres from "postgres";
import { createHash, randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { freeOfficialContactEnrich } from "./free-enrich.mjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_NOT_CONFIGURED");

const concurrency = Math.max(
  1,
  Math.min(6, Number(process.env.OSKA_WORKER_CONCURRENCY || 3)),
);
const verifyMinScore = Math.max(
  50,
  Math.min(100, Number(process.env.OSKA_VERIFY_MIN_SCORE || 80)),
);
const enrichMinScore = Math.max(
  50,
  Math.min(100, Number(process.env.OSKA_ENRICH_MIN_SCORE || 70)),
);

const sql = postgres(url, {
  max: Math.max(8, concurrency * 3),
  connect_timeout: 15,
});

const workerId = process.env.RAILWAY_REPLICA_ID || `worker-${randomUUID()}`;
const defaultProviders = (
  process.env.OSKA_PROVIDERS ||
  "chatgpt-web,parallel-search,tinyfish,exa,openai-luna"
)
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

function clean(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text || null;
}

function normalizeDomain(value) {
  const raw = clean(value);
  if (!raw) return null;
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return raw
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .trim() || null;
  }
}

function canonicalKey(candidate) {
  const domain = normalizeDomain(candidate?.domain);
  if (domain) return `domain:${domain}`;

  const company = clean(candidate?.company)?.toLowerCase() || "unknown";
  const country = clean(candidate?.country)?.toLowerCase() || "unknown";
  return `company:${company}|${country}`;
}

function shortHash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 20);
}

function firstLead(providerResult, fallback = null) {
  const leads = providerResult?.evidence?.leads;
  if (Array.isArray(leads) && leads[0]) return leads[0];
  return fallback;
}

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
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function callProvider(provider, job) {
  const endpoint = process.env.OSKA_AGENT_DISPATCH_URL;
  if (!endpoint) throw new Error("OSKA_AGENT_DISPATCH_URL_NOT_CONFIGURED");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OSKA_INTERNAL_TOKEN || ""}`,
      "x-oska-provider": provider,
      "x-oska-idempotency-key": `${job.id}:${provider}`,
    },
    body: JSON.stringify({
      jobId: job.id,
      type: job.type,
      payload: job.payload,
      provider,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(
      `HTTP_${response.status}:${JSON.stringify(data).slice(0, 700)}`,
    );
  }
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
      await addEvent(job.id, "provider_failed", {
        provider,
        error: message.slice(0, 1000),
      });
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
      authorization: `Bearer ${process.env.OSKA_INTERNAL_TOKEN || ""}`,
      "x-oska-idempotency-key": `${job.id}:verify`,
    },
    body: JSON.stringify({ job, providerResult }),
    signal: AbortSignal.timeout(120_000),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(
      `VERIFIER_HTTP_${response.status}:${JSON.stringify(data).slice(0, 700)}`,
    );
  }

  return data;
}

async function sendOutbound(job, providerResult, verification) {
  const endpoint = process.env.OSKA_OUTBOUND_URL;
  if (!endpoint) throw new Error("OSKA_OUTBOUND_URL_NOT_CONFIGURED");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OSKA_INTERNAL_TOKEN || ""}`,
      "x-oska-idempotency-key": `${job.id}:outbound`,
    },
    body: JSON.stringify({ job, providerResult, verification }),
    signal: AbortSignal.timeout(120_000),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(
      `OUTBOUND_HTTP_${response.status}:${JSON.stringify(data).slice(0, 700)}`,
    );
  }
  return data;
}

async function enqueueJob({
  id,
  type,
  payload,
  priority = 0,
  preferredProviders = [],
  maxAttempts = 3,
}) {
  const rows = await sql`
    INSERT INTO oska_jobs (
      id, type, payload, status, priority,
      preferred_providers, max_attempts, approval_status
    )
    VALUES (
      ${id},
      ${type},
      ${JSON.stringify(payload)}::jsonb,
      'pending',
      ${priority},
      ${JSON.stringify(preferredProviders)}::jsonb,
      ${maxAttempts},
      'not_required'
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;

  if (rows[0]) {
    await addEvent(id, "queued_by_pipeline", {
      type,
      parentJobId: payload?.parentJobId ?? null,
    });
    return true;
  }
  return false;
}

async function enqueueVerificationChildren(job, providerResult) {
  const leads = Array.isArray(providerResult?.evidence?.leads)
    ? providerResult.evidence.leads
    : [];

  const queued = [];
  const skipped = [];

  for (const lead of leads) {
    const company = clean(lead?.company);
    const domain = normalizeDomain(lead?.domain);

    if (!company && !domain) {
      skipped.push("missing-company-domain");
      continue;
    }

    const key = canonicalKey({ ...lead, domain });

    const known = await sql`
      SELECT canonical_key
      FROM (
        SELECT canonical_key FROM oska_known_entities WHERE canonical_key = ${key}
        UNION ALL
        SELECT canonical_key FROM oska_leads WHERE canonical_key = ${key}
      ) AS known_match
      LIMIT 1
    `;

    if (known[0]) {
      skipped.push(key);
      await addEvent(job.id, "candidate_dedup_skipped", {
        canonicalKey: key,
        company,
        domain,
      });
      continue;
    }

    const id = `lead-verify-${shortHash(key)}`;

    const inserted = await enqueueJob({
      id,
      type: "lead_verify",
      payload: {
        candidate: { ...lead, domain },
        canonicalKey: key,
        parentJobId: job.id,
        goal:
          "Independently verify this specific company as a real OSKA B2B prospect. Verify company/domain, product-material fit, ecommerce or B2B/replenishment signals, and current public decision-maker/contact evidence. Do not invent contacts.",
      },
      priority: 500,
      preferredProviders: ["chatgpt-web", "openai-luna"],
      maxAttempts: 3,
    });

    if (inserted) queued.push(id);
  }

  return {
    candidates: leads.length,
    queued: queued.length,
    queuedIds: queued,
    skipped,
  };
}

async function upsertLead(job, candidate, verification) {
  if (!candidate) throw new Error("NO_VERIFIED_LEAD_PAYLOAD");

  const company = clean(candidate.company);
  const domain = normalizeDomain(candidate.domain);

  if (!company && !domain) {
    throw new Error("VERIFIED_LEAD_MISSING_IDENTITY");
  }

  const key = job.payload?.canonicalKey || canonicalKey({ ...candidate, domain });
  const email = clean(candidate.email);
  const phoneWhatsapp = clean(candidate.phoneWhatsapp);
  const decisionMaker = clean(candidate.decisionMaker);
  const status = email || phoneWhatsapp ? "contact_ready" : "verified";

  const rows = await sql`
    INSERT INTO oska_leads (
      canonical_key,
      company,
      domain,
      country,
      category,
      material,
      decision_maker,
      role,
      email,
      phone_whatsapp,
      signals,
      source_urls,
      verification_score,
      verification_reasons,
      source_job_id,
      parent_job_id,
      status,
      first_seen_at,
      last_verified_at,
      updated_at
    )
    VALUES (
      ${key},
      ${company || domain || "Unknown"},
      ${domain},
      ${clean(candidate.country)},
      ${clean(candidate.category)},
      ${clean(candidate.material)},
      ${decisionMaker},
      ${clean(candidate.role)},
      ${email},
      ${phoneWhatsapp},
      ${JSON.stringify(Array.isArray(candidate.signals) ? candidate.signals : [])}::jsonb,
      ${JSON.stringify(Array.isArray(candidate.sourceUrls) ? candidate.sourceUrls : [])}::jsonb,
      ${Number.isFinite(Number(verification?.score)) ? Number(verification.score) : null},
      ${JSON.stringify(Array.isArray(verification?.reasons) ? verification.reasons : [])}::jsonb,
      ${job.id},
      ${job.payload?.parentJobId ?? null},
      ${status},
      now(),
      now(),
      now()
    )
    ON CONFLICT (canonical_key) DO UPDATE SET
      company = COALESCE(EXCLUDED.company, oska_leads.company),
      domain = COALESCE(EXCLUDED.domain, oska_leads.domain),
      country = COALESCE(EXCLUDED.country, oska_leads.country),
      category = COALESCE(EXCLUDED.category, oska_leads.category),
      material = COALESCE(EXCLUDED.material, oska_leads.material),
      decision_maker = COALESCE(EXCLUDED.decision_maker, oska_leads.decision_maker),
      role = COALESCE(EXCLUDED.role, oska_leads.role),
      email = COALESCE(EXCLUDED.email, oska_leads.email),
      phone_whatsapp = COALESCE(EXCLUDED.phone_whatsapp, oska_leads.phone_whatsapp),
      signals = CASE
        WHEN jsonb_array_length(EXCLUDED.signals) > 0 THEN EXCLUDED.signals
        ELSE oska_leads.signals
      END,
      source_urls = CASE
        WHEN jsonb_array_length(EXCLUDED.source_urls) > 0 THEN EXCLUDED.source_urls
        ELSE oska_leads.source_urls
      END,
      verification_score = COALESCE(EXCLUDED.verification_score, oska_leads.verification_score),
      verification_reasons = CASE
        WHEN jsonb_array_length(EXCLUDED.verification_reasons) > 0 THEN EXCLUDED.verification_reasons
        ELSE oska_leads.verification_reasons
      END,
      source_job_id = EXCLUDED.source_job_id,
      parent_job_id = COALESCE(EXCLUDED.parent_job_id, oska_leads.parent_job_id),
      status = CASE
        WHEN COALESCE(EXCLUDED.email, oska_leads.email) IS NOT NULL
          OR COALESCE(EXCLUDED.phone_whatsapp, oska_leads.phone_whatsapp) IS NOT NULL
        THEN 'contact_ready'
        ELSE 'verified'
      END,
      last_verified_at = now(),
      updated_at = now()
    RETURNING *
  `;

  return rows[0];
}

async function maybeQueueContactEnrichment(lead) {
  if (!lead) return null;

  const needsEnrichment =
    !clean(lead.email) ||
    !clean(lead.decision_maker) ||
    !clean(lead.phone_whatsapp);

  if (!needsEnrichment) return null;

  const id = `contact-enrich-${shortHash(lead.canonical_key)}`;

  const inserted = await enqueueJob({
    id,
    type: "contact_enrich",
    payload: {
      canonicalKey: lead.canonical_key,
      parentJobId: lead.source_job_id,
      company: lead.company,
      domain: lead.domain,
      country: lead.country,
      currentEmail: lead.email,
      currentDecisionMaker: lead.decision_maker,
      currentPhoneWhatsapp: lead.phone_whatsapp,
      goal:
        "Find current public official company email, named buyer/purchasing/procurement/merchandising/sourcing contact, role, and explicitly verified company or decision-maker WhatsApp when available. Never label an ordinary phone as WhatsApp without proof.",
    },
    priority: 300,
    preferredProviders: ["chatgpt-web", "openai-luna"],
    maxAttempts: 3,
  });

  return inserted ? id : null;
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
    WHERE id = ${job.id}
      AND locked_by = ${workerId}
  `;

  await addEvent(job.id, "completed", { workerId });

  console.log(
    "JOB_COMPLETED",
    JSON.stringify({
      id: job.id,
      type: job.type,
      accepted: result?.accepted ?? null,
      candidateCount: result?.candidateCount ?? null,
      verificationScore: result?.verificationScore ?? null,
    }),
  );

  if (job.type === "system_canary") {
    console.log("SYSTEM_CANARY_PASS", job.id);
  }
}

async function fail(job, error) {
  const message = error instanceof Error ? error.message : String(error);
  const terminal = Number(job.attempt_count) >= Number(job.max_attempts);
  const delaySeconds = Math.min(
    900,
    15 * 2 ** Math.max(0, Number(job.attempt_count) - 1),
  );

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
    WHERE id = ${job.id}
      AND locked_by = ${workerId}
  `;

  await addEvent(
    job.id,
    terminal ? "dead_letter" : "retry_scheduled",
    {
      error: message.slice(0, 1500),
      attempt: job.attempt_count,
      delaySeconds: terminal ? null : delaySeconds,
    },
  );

  console.error(
    "JOB_FAILED",
    JSON.stringify({
      id: job.id,
      type: job.type,
      terminal,
      attempt: job.attempt_count,
      error: message.slice(0, 1000),
    }),
  );
}

async function processJob(job) {
  await addEvent(job.id, "claimed", {
    workerId,
    attempt: job.attempt_count,
  });

  if (job.type === "system_canary") {
    await complete(job, {
      ok: true,
      workerId,
      database: "ok",
      accepted: true,
    });
    return;
  }

  const isOutbound =
    job.type === "outbound_email" ||
    job.type === "outbound_whatsapp";

  if (job.type === "contact_enrich" && job.payload?.historicalBackfill === true) {
    const currentStatus = String(job.payload?.currentStatus || "").toLocaleUpperCase("tr-TR");
    const blocked = [
      "HOLD",
      "ARCHIVE",
      "NOT READY",
      "DEĞİL",
      "OUTBOUND READY=HAYIR",
      "OUTBOUND BLOCKED"
    ].some((token) => currentStatus.includes(token));

    const crawl = await freeOfficialContactEnrich(job.payload?.domain);

    const fallback = {
      company: job.payload?.company,
      domain: job.payload?.domain,
      country: job.payload?.country,
      category: job.payload?.currentCategory,
      material: job.payload?.currentMaterial,
      email: job.payload?.currentEmail,
      decisionMaker: job.payload?.currentDecisionMaker,
      role: job.payload?.currentRole,
      phoneWhatsapp: job.payload?.currentPhoneWhatsapp,
      sourceUrls: job.payload?.currentSourceUrl ? [job.payload.currentSourceUrl] : [],
      signals: [],
    };

    const sourceUrls = [
      ...(Array.isArray(fallback.sourceUrls) ? fallback.sourceUrls : []),
      ...(Array.isArray(crawl.sourceUrls) ? crawl.sourceUrls : []),
    ].filter(Boolean);

    const candidate = {
      ...fallback,
      email: clean(fallback.email) || clean(crawl.email),
      phoneWhatsapp: clean(fallback.phoneWhatsapp) || clean(crawl.phoneWhatsapp),
      sourceUrls: [...new Set(sourceUrls)],
      signals: [
        crawl.live ? "Official domain reachable during historical backfill." : "Official domain was not reachable during historical backfill.",
        crawl.email ? "Official-site email discovered without AI/API." : "No new official-site email discovered by deterministic crawl.",
        crawl.phoneWhatsapp ? "Explicit WhatsApp URL discovered on official site." : "No explicit WhatsApp URL discovered by deterministic crawl."
      ]
    };

    const verification = {
      ok: true,
      score: null,
      reasons: [
        "Historical lead retained from the existing OSKA master list.",
        "Contact enrichment used only the company's official domain and preserved existing contact fields."
      ]
    };

    const lead = await upsertLead(job, candidate, verification);

    if (blocked) {
      await sql`
        UPDATE oska_leads
        SET status = 'verified', updated_at = now()
        WHERE canonical_key = ${lead.canonical_key}
      `;
      lead.status = "verified";
    }

    await addEvent(job.id, "historical_free_enrich", {
      canonicalKey: lead.canonical_key,
      blocked,
      domainLive: crawl.live,
      pagesChecked: crawl.pagesChecked,
      emailFound: Boolean(lead.email),
      whatsappFound: Boolean(lead.phone_whatsapp),
    });

    await complete(job, {
      accepted: true,
      method: "official-site-zero-api",
      canonicalKey: lead.canonical_key,
      company: lead.company,
      blockedFromOutbound: blocked,
      contactReady: lead.status === "contact_ready",
      emailFound: Boolean(lead.email),
      decisionMakerFound: Boolean(lead.decision_maker),
      whatsappFound: Boolean(lead.phone_whatsapp),
      domainLive: crawl.live,
      pagesChecked: crawl.pagesChecked,
    });
    return;
  }

  if (isOutbound && job.approval_status !== "approved") {
    await sql`
      UPDATE oska_jobs
      SET status = 'waiting_approval',
          locked_by = NULL,
          locked_at = NULL,
          updated_at = now()
      WHERE id = ${job.id}
        AND locked_by = ${workerId}
    `;

    await addEvent(job.id, "waiting_human_approval");
    return;
  }

  const providerResult = await runFailover(job);
  if (!providerResult.ok) throw new Error(providerResult.error);

  if (job.type === "lead_discovery") {
    const children = await enqueueVerificationChildren(job, providerResult);

    if (children.candidates === 0) {
      throw new Error("NO_DISCOVERY_CANDIDATES");
    }

    await complete(job, {
      accepted: true,
      provider: providerResult.provider,
      candidateCount: children.candidates,
      verificationJobsQueued: children.queued,
      summary: providerResult?.evidence?.summary ?? null,
    });
    return;
  }

  const verification = await verify(job, providerResult);
  const verificationScore = Number(verification?.score || 0);

  if (job.type === "lead_verify") {
    const accepted =
      verification?.ok === true &&
      verificationScore >= verifyMinScore;

    if (!accepted) {
      await addEvent(job.id, "lead_rejected", {
        score: verificationScore,
        reasons: verification?.reasons ?? [],
      });

      await complete(job, {
        accepted: false,
        verificationScore,
        reasons: verification?.reasons ?? [],
      });
      return;
    }

    const candidate = firstLead(
      providerResult,
      job.payload?.candidate ?? null,
    );
    const lead = await upsertLead(job, candidate, verification);
    const contactJobId = await maybeQueueContactEnrichment(lead);

    await addEvent(job.id, "lead_accepted", {
      canonicalKey: lead.canonical_key,
      score: verificationScore,
      contactJobId,
    });

    await complete(job, {
      accepted: true,
      canonicalKey: lead.canonical_key,
      company: lead.company,
      domain: lead.domain,
      verificationScore,
      contactReady: lead.status === "contact_ready",
      contactJobId,
    });
    return;
  }

  if (job.type === "contact_enrich") {
    const accepted =
      verification?.ok === true &&
      verificationScore >= enrichMinScore;

    if (!accepted) {
      await complete(job, {
        accepted: false,
        verificationScore,
        reasons: verification?.reasons ?? [],
      });
      return;
    }

    const fallback = {
      company: job.payload?.company,
      domain: job.payload?.domain,
      country: job.payload?.country,
      category: job.payload?.currentCategory,
      material: job.payload?.currentMaterial,
      email: job.payload?.currentEmail,
      decisionMaker: job.payload?.currentDecisionMaker,
      role: job.payload?.currentRole,
      phoneWhatsapp: job.payload?.currentPhoneWhatsapp,
      sourceUrls: job.payload?.currentSourceUrl ? [job.payload.currentSourceUrl] : [],
      signals: [],
    };

    const found = firstLead(providerResult, null) || {};
    const candidate = {
      ...fallback,
      ...found,
      company: clean(found.company) || clean(fallback.company),
      domain: normalizeDomain(found.domain) || normalizeDomain(fallback.domain),
      country: clean(found.country) || clean(fallback.country),
      category: clean(found.category) || clean(fallback.category),
      material: clean(found.material) || clean(fallback.material),
      email: clean(found.email) || clean(fallback.email),
      decisionMaker: clean(found.decisionMaker) || clean(fallback.decisionMaker),
      role: clean(found.role) || clean(fallback.role),
      phoneWhatsapp: clean(found.phoneWhatsapp) || clean(fallback.phoneWhatsapp),
      sourceUrls:
        Array.isArray(found.sourceUrls) && found.sourceUrls.length
          ? found.sourceUrls
          : fallback.sourceUrls,
      signals:
        Array.isArray(found.signals) && found.signals.length
          ? found.signals
          : [],
    };

    const lead = await upsertLead(job, candidate, verification);

    await complete(job, {
      accepted: true,
      canonicalKey: lead.canonical_key,
      company: lead.company,
      verificationScore,
      contactReady: lead.status === "contact_ready",
      emailFound: Boolean(lead.email),
      decisionMakerFound: Boolean(lead.decision_maker),
      whatsappFound: Boolean(lead.phone_whatsapp),
    });
    return;
  }

  if (isOutbound) {
    if (verification?.ok !== true) {
      throw new Error(
        `VERIFIER_REJECTED:${JSON.stringify(verification).slice(0, 700)}`,
      );
    }

    const sent = await sendOutbound(
      job,
      providerResult,
      verification,
    );

    await complete(job, {
      accepted: true,
      verificationScore,
      sent,
    });
    return;
  }

  if (verification?.ok !== true) {
    throw new Error(
      `VERIFIER_REJECTED:${JSON.stringify(verification).slice(0, 700)}`,
    );
  }

  await complete(job, {
    accepted: true,
    provider: providerResult.provider,
    verificationScore,
  });
}

async function runStartupCanary() {
  const canaryId = "system-canary-2026-10-01-v2";

  const claimed = await sql.begin(async (tx) => {
    await tx`
      INSERT INTO oska_jobs (
        id, type, payload, status, priority,
        preferred_providers, approval_status
      )
      VALUES (
        ${canaryId},
        'system_canary',
        '{"source":"worker-startup-canary"}'::jsonb,
        'pending',
        1000,
        '[]'::jsonb,
        'not_required'
      )
      ON CONFLICT (id) DO NOTHING
    `;

    return await tx`
      UPDATE oska_jobs
      SET status = 'running',
          locked_by = ${workerId},
          locked_at = now(),
          attempt_count = attempt_count + 1,
          updated_at = now()
      WHERE id = ${canaryId}
        AND status IN ('pending','retry')
      RETURNING *
    `;
  });

  if (claimed[0]) {
    await processJob(claimed[0]);
  }

  const finalRows = await sql`
    SELECT id, status, attempt_count, result, last_error
    FROM oska_jobs
    WHERE id = ${canaryId}
  `;

  console.log(
    "SYSTEM_CANARY_FINAL",
    JSON.stringify(finalRows[0] ?? null),
  );

  if (finalRows[0]?.status !== "completed") {
    throw new Error(
      `SYSTEM_CANARY_FAILED:${JSON.stringify(finalRows[0] ?? null)}`,
    );
  }
}

async function workerLoop(slot) {
  console.log(
    "WORKER_SLOT_STARTED",
    JSON.stringify({ workerId, slot }),
  );

  while (true) {
    const job = await claimJob();

    if (!job) {
      await sleep(1500);
      continue;
    }

    try {
      await processJob(job);
    } catch (error) {
      await fail(job, error);
    }
  }
}

async function recoverHistoricalBackfill() {
  const rows = await sql`
    UPDATE oska_jobs
    SET status = 'pending',
        attempt_count = 0,
        last_error = NULL,
        locked_by = NULL,
        locked_at = NULL,
        next_run_at = now(),
        updated_at = now()
    WHERE id LIKE 'historical-enrich-%'
      AND status IN ('retry','dead_letter','running')
    RETURNING id
  `;

  console.log("HISTORICAL_BACKFILL_RECOVERED", JSON.stringify({ count: rows.length }));
}

async function main() {
  console.log(
    "OSKA_WORKER_STARTED",
    JSON.stringify({
      workerId,
      concurrency,
      verifyMinScore,
      enrichMinScore,
      providers: defaultProviders,
    }),
  );

  await runStartupCanary();
  await recoverHistoricalBackfill();

  await Promise.all(
    Array.from(
      { length: concurrency },
      (_, slot) => workerLoop(slot + 1),
    ),
  );
}

async function shutdown(signal) {
  console.log("WORKER_SHUTDOWN", signal);
  await sql.end({ timeout: 5 });
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

main().catch(async (error) => {
  console.error("WORKER_FATAL", error);
  await sql.end({ timeout: 5 });
  process.exit(1);
});
