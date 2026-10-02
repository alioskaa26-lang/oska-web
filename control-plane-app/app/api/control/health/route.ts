import { getSql } from "@/lib/db";

export async function GET() {
  try {
    const sql = getSql();
    await sql`SELECT 1 AS ok`;

    const [canaries, leadStatsRows, pipelineRows, knownRows, providerRows, deadLetterRows, geoRows] = await Promise.all([
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
            WHERE status IN ('pending','retry','running')
              AND id LIKE 'historical-enrich-%'
          )::int AS historical_backlog,
          count(*) FILTER (
            WHERE status IN ('pending','retry','running')
              AND id NOT LIKE 'historical-enrich-%'
              AND type IN ('lead_discovery','lead_verify','contact_enrich')
          )::int AS growth_backlog,
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
          count(*) FILTER (WHERE status = 'dead_letter')::int AS dead_letter,
          count(*) FILTER (WHERE status = 'retry')::int AS retry,
          count(*) FILTER (WHERE status = 'running')::int AS running,
          COALESCE(
            max(EXTRACT(EPOCH FROM (now() - locked_at))) FILTER (WHERE status = 'running'),
            0
          )::int AS oldest_running_seconds,
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
      sql`
        SELECT provider, status, success_count, failure_count, last_error, last_seen_at
        FROM oska_provider_health
        WHERE provider IN ('zero-api-search','official-site-crawler')
        ORDER BY provider
      `,
      sql`
        SELECT
          type,
          CASE
            WHEN last_error ILIKE '%VERIFIED_LEAD_MISSING_IDENTITY%' THEN 'missing_identity'
            WHEN last_error ILIKE '%NO_DISCOVERY_CANDIDATES%' THEN 'no_candidates'
            WHEN last_error ILIKE '%ZERO_API_DISCOVERY_NO_CANDIDATES%' THEN 'no_candidates'
            WHEN last_error ILIKE '%ALL_PROVIDERS_FAILED%' THEN 'legacy_provider_failure'
            WHEN last_error ILIKE '%OPENAI_HTTP_429%' THEN 'legacy_provider_failure'
            WHEN last_error ILIKE '%VERIFIER_HTTP_%' THEN 'legacy_verifier_failure'
            WHEN last_error ILIKE '%STALE_LOCK%' THEN 'stale_lock'
            ELSE 'other'
          END AS reason,
          count(*)::int AS count
        FROM oska_jobs
        WHERE status = 'dead_letter'
        GROUP BY type, reason
        ORDER BY count DESC
      `,
      sql`
        SELECT
          count(*) FILTER (
            WHERE lower(trim(COALESCE(country,''))) IN ('türkiye','turkey')
          )::int AS turkey_domestic,
          count(*) FILTER (
            WHERE lower(trim(COALESCE(country,''))) NOT IN ('türkiye','turkey')
              AND (
                lower(COALESCE(signals::text,'')) ~ '(turkey|türkiye|istanbul|turkish)'
                OR lower(COALESCE(source_urls::text,'')) ~ '(turkey|türkiye|istanbul|turkish)'
              )
          )::int AS turkey_linked_global,
          count(*) FILTER (
            WHERE lower(trim(COALESCE(country,''))) IN ('türkiye','turkey')
              AND status = 'contact_ready'
          )::int AS turkey_domestic_contact_ready,
          count(*) FILTER (
            WHERE lower(trim(COALESCE(country,''))) IN ('türkiye','turkey')
              AND email IS NOT NULL
          )::int AS turkey_domestic_email_ready
        FROM oska_leads
      `    ]);

    const integrations = {
      zeroApiSearch: true,
      officialSiteCrawler: true,
      internalToken: Boolean(process.env.OSKA_INTERNAL_TOKEN),
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    };

    return Response.json({
      service: "oska-control-plane",
      version: "1.4.0",
      runtime: "railway-postgres-worker",
      database: "ok",
      readyForInfrastructure: true,
      readyForDiscovery: true,
      discoveryMode: "zero-api-primary",
      paidProviderRequired: false,
      humanApprovalRequiredForOutbound: true,
      integrations,
      activeProviders: ["zero-api-search", "official-site-crawler"],
      inactivePaidProviders: ["openai-api", "parallel-search", "tinyfish", "exa"],
      knownHistoricalEntities: knownRows[0]?.total ?? 0,
      geography: geoRows?.[0] ?? {},
      leads: leadStatsRows[0] ?? {},
      pipeline: pipelineRows[0] ?? {},
      providers: providerRows,
      deadLetterBreakdown: deadLetterRows,
      canaries,
    });
  } catch (error) {
    return Response.json(
      {
        service: "oska-control-plane",
        version: "1.4.0",
        database: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}
