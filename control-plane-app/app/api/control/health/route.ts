import { getSql } from "@/lib/db";

export async function GET() {
  try {
    const sql = getSql();
    await sql`SELECT 1 AS ok`;

    const canaries = await sql`
      SELECT id, type, status, attempt_count, max_attempts,
             (last_error IS NOT NULL) AS has_error,
             updated_at, completed_at
      FROM oska_jobs
      WHERE id IN (
        'system-canary-2026-10-01-v2',
        'lead-canary-careofcarl-2026-10-02-v1'
      )
      ORDER BY id
    `;

    const integrations = {
      openai: Boolean(process.env.OPENAI_API_KEY),
      internalToken: Boolean(process.env.OSKA_INTERNAL_TOKEN),
    };

    return Response.json({
      service: "oska-control-plane",
      version: "1.2.0",
      runtime: "railway-postgres-worker",
      database: "ok",
      readyForInfrastructure: true,
      readyForDiscovery: integrations.openai && integrations.internalToken,
      humanApprovalRequiredForOutbound: true,
      integrations,
      canaries,
    });
  } catch (error) {
    return Response.json(
      {
        service: "oska-control-plane",
        version: "1.2.0",
        database: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}
