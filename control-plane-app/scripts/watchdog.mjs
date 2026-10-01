import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_NOT_CONFIGURED");
const sql = postgres(url, { max: 2, connect_timeout: 15 });

const recovered = await sql`
  UPDATE oska_jobs
  SET status = CASE WHEN attempt_count >= max_attempts THEN 'dead_letter' ELSE 'retry' END,
      last_error = 'STALE_LOCK_RECOVERED',
      locked_by = NULL,
      locked_at = NULL,
      next_run_at = now(),
      updated_at = now()
  WHERE status = 'running'
    AND locked_at < now() - interval '15 minutes'
  RETURNING id, status
`;

for (const job of recovered) {
  await sql`
    INSERT INTO oska_job_events (job_id, event_type, detail)
    VALUES (
      ${job.id},
      ${job.status === "dead_letter" ? "stale_lock_dead_letter" : "stale_lock_recovered"},
      '{}'::jsonb
    )
  `;
}

await sql`
  UPDATE oska_provider_health
  SET status = 'stale', updated_at = now()
  WHERE last_seen_at IS NOT NULL
    AND last_seen_at < now() - interval '30 minutes'
    AND status <> 'stale'
`;

const counts = await sql`
  SELECT status, count(*)::int AS count
  FROM oska_jobs
  GROUP BY status
  ORDER BY status
`;

console.log(JSON.stringify({ recovered: recovered.length, counts }));
await sql.end();
