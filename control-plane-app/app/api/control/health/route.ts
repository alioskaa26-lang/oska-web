import { getSql } from "@/lib/db";

export async function GET() {
  try {
    const sql = getSql();
    await sql`SELECT 1 AS ok`;

    const [canaries, leadStatsRows, pipelineRows, knownRows] = await Promise.all([
      sql`
        SELECT id, type, status, attempt_count, max_attempts,
               (last_error IS NOT NULL) AS has_error,
               updated_at, completed_at
        FROM oska_jobs
        WHERE id IN (
          'system-canary-2026-10-01-v2',
          'lead-canary-careofcarl-2026-10-02-v1'
        )
        ORDER BY id
      `,
      sql`
        SELECT
          count(*)::int AS total,
          count(*) FILTER (WHERE status = 'contact_ready')::int AS contact_ready,
          count(*) FILTER (WHERE updated_at >= now() - interval '24 hours')::int AS last_24h,
          count(*) FILTER (
            WHERE lower(COALESCE(material,'')) ~ '(925|sterling|silver|gümüş)'
          )::int AS silver,
          count(*) FILTER (
            WHERE lower(COALESCE(material,'')) ~ '(brass|bronze|pirinç|bronz)'
          )::int AS brass_bronze,
          count(*) FILTER (WHERE email IS NOT NULL)::int AS email_ready,
          count(*) FILTER (WHERE phone_whatsapp IS NOT NULL)::int AS whatsapp_ready,
          count(*) FILTER (WHERE decision_maker IS NOT NULL)::int AS decision_maker_ready
        FROM oska_leads
      `,
      sql`
        SELECT
          count(*) FILTER (
            WHERE type = 'lead_discovery'
              AND status IN ('pending','retry','running')
          )::int AS discovery,
          count(*) FILTER (
            WHERE type = 'lead_verify'
              AND status IN ('pending','retry','running')
          )::int AS verification,
          count(*) FILTER (
            WHERE type = 'contact_enrich'
              AND status IN ('pending','retry','running')
          )::int AS contact_enrich,
          count(*) FILTER (
            WHERE type IN ('lead_discovery','lead_verify','contact_enrich')
              AND status IN ('pending','retry','running')
          )::int AS total_backlog,
          count(*) FILTER (
            WHERE type = 'lead_discovery'
              AND created_at >= now() - interval '24 hours'
          )::int AS discovery_jobs_24h,
          count(*) FILTER (
            WHERE type = 'lead_verify'
              AND status = 'completed'
              AND completed_at >= now() - interval '24 hours'
          )::int AS verify_completed_24h
        FROM oska_jobs
      `,
      sql`
        SELECT count(*)::int AS total
        FROM oska_known_entities
      `,
    ]);

    const integrations = {
      openai: Boolean(process.env.OPENAI_API_KEY),
      internalToken: Boolean(process.env.OSKA_INTERNAL_TOKEN),
    };

    return Response.json({
      service: "oska-control-plane",
      version: "1.3.0",
      runtime: "railway-postgres-worker",
      database: "ok",
      readyForInfrastructure: true,
      readyForDiscovery: integrations.openai && integrations.internalToken,
      humanApprovalRequiredForOutbound: true,
      integrations,
      knownHistoricalEntities: knownRows[0]?.total ?? 0,
      leads: leadStatsRows[0] ?? {},
      pipeline: pipelineRows[0] ?? {},
      canaries,
    });
  } catch (error) {
    return Response.json(
      {
        service: "oska-control-plane",
        version: "1.3.0",
        database: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}
