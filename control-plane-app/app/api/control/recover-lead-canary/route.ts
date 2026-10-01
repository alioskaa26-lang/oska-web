import { getSql } from "@/lib/db";

const CANARY_ID = "lead-canary-careofcarl-2026-10-02-v1";

export async function GET() {
  const sql = getSql();

  const rows = await sql`
    UPDATE oska_jobs
    SET status = 'retry',
        locked_by = NULL,
        locked_at = NULL,
        next_run_at = now(),
        last_error = NULL,
        updated_at = now()
    WHERE id = ${CANARY_ID}
      AND status = 'running'
    RETURNING id, status, attempt_count, updated_at
  `;

  const current = rows[0] ?? (await sql`
    SELECT id, status, attempt_count, updated_at
    FROM oska_jobs
    WHERE id = ${CANARY_ID}
  `)[0] ?? null;

  return Response.json({
    ok: true,
    canary: current,
    action: rows.length ? "recovered_to_retry" : "no_change",
  });
}
