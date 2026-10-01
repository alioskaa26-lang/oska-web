import { getSql } from "@/lib/db";

const allowedTypes = new Set([
  "system_canary",
  "lead_discovery",
  "lead_verify",
  "contact_enrich",
  "outbound_email",
  "outbound_whatsapp",
]);

export async function POST(request: Request) {
  const body = (await request.json()) as {
    jobId?: string;
    type?: string;
    payload?: Record<string, unknown>;
    priority?: number;
    preferredProviders?: string[];
  };

  if (!body.jobId || !body.type || !body.payload || !allowedTypes.has(body.type)) {
    return Response.json(
      { ok: false, error: "Valid jobId, type and payload are required" },
      { status: 400 },
    );
  }

  const sql = getSql();
  const approval =
    body.type === "outbound_email" || body.type === "outbound_whatsapp"
      ? "pending"
      : "not_required";

  const rows = await sql`
    INSERT INTO oska_jobs (
      id, type, payload, priority, preferred_providers, approval_status
    )
    VALUES (
      ${body.jobId},
      ${body.type},
      ${JSON.stringify(body.payload)}::jsonb,
      ${Number.isFinite(body.priority) ? body.priority : 0},
      ${JSON.stringify(body.preferredProviders ?? [])}::jsonb,
      ${approval}
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id, status, approval_status
  `;

  if (rows.length === 0) {
    const existing = await sql`
      SELECT id, status, approval_status, attempt_count, updated_at
      FROM oska_jobs WHERE id = ${body.jobId}
    `;
    return Response.json({ ok: true, duplicate: true, job: existing[0] });
  }

  await sql`
    INSERT INTO oska_job_events (job_id, event_type, detail)
    VALUES (${body.jobId}, 'queued', ${JSON.stringify({ source: "api" })}::jsonb)
  `;

  return Response.json({ ok: true, duplicate: false, job: rows[0] }, { status: 202 });
}
