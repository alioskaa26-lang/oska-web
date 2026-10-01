import { getSql } from "@/lib/db";

export async function GET() {
  const sql = getSql();
  const rows = await sql`
    SELECT id, type, status, payload, last_error
    FROM oska_jobs
    WHERE id = 'historical-enrich-c313c06e080e1035f02b'
    LIMIT 1
  `;
  const row = rows[0] ?? null;
  if (!row) return Response.json({ ok:false, error:"NOT_FOUND" }, { status:404 });
  return Response.json({
    ok:true,
    id:row.id,
    type:row.type,
    status:row.status,
    payloadKeys: row.payload && typeof row.payload === "object" ? Object.keys(row.payload) : [],
    payload: row.payload,
    lastError: row.last_error,
  });
}
