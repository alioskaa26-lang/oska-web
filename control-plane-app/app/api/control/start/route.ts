import { getSql } from "@/lib/db";

const allowedTypes = new Set([
  "system_canary",
  "lead_discovery",
  "lead_verify",
  "contact_enrich",
  "director_cycle",
  "market_research",
  "content_brief",
  "visibility_audit",
  "outbound_email",
  "outbound_whatsapp",
]);

export async function POST(request: Request) {
  const expected = process.env.OSKA_INTERNAL_TOKEN;
  const actual = request.headers.get("authorization");
  if (!expected || actual !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json()) as {
    jobId?: string;
    type?: string;
    payload?: Record<string, unknown>;
    priority?: number;
    preferredProviders?: string[];
  };

  const jobId = body.jobId;
  const type = body.type;
  const payload = body.payload;

  if (!jobId || !type || !payload || !allowedTypes.has(type)) {
    return Response.json(
      { ok: false, error: "Valid jobId, type and payload are required" },
      { status: 400 },
    );
  }

  const priority = Number.isFinite(body.priority) ? Number(body.priority) : 0;
  const preferredProviders = Array.isArray(body.preferredProviders)
    ? body.preferredProviders.filter((v): v is string => typeof v === "string" && v.length > 0)
    : [];
  const approval =
    type === "outbound_email" || type === "outbound_whatsapp"
      ? "pending"
      : "not_required";

  const sql = getSql();

  const rows = await sql`
    INSERT INTO oska_jobs (
      id, type, payload, priority, preferred_providers, approval_status
    )
    VALUES (
      ${jobId},
      ${type},
      ${sql.json(payload as any)},
      ${priority},
      ${sql.json(preferredProviders as any)},
      ${approval}
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id, status, approval_status
  `;

  if (rows.length === 0) {
    const existing = await sql`
      SELECT id, status, approval_status, attempt_count, updated_at
      FROM oska_jobs WHERE id = ${jobId}
    `;
    return Response.json({ ok: true, duplicate: true, job: existing[0] });
  }

  await sql`
    INSERT INTO oska_job_events (job_id, event_type, detail)
    VALUES (${jobId}, 'queued', ${sql.json({ source: "api" })})
  `;

  return Response.json({ ok: true, duplicate: false, job: rows[0] }, { status: 202 });
}
