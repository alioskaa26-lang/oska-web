import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_NOT_CONFIGURED");

const sql = postgres(url, { max: 3, connect_timeout: 15 });

const recovered = await sql`
  UPDATE oska_jobs
  SET status = CASE WHEN attempt_count >= max_attempts THEN 'dead_letter' ELSE 'retry' END,
      last_error = 'STALE_LOCK_RECOVERED',
      locked_by = NULL,
      locked_at = NULL,
      next_run_at = now(),
      updated_at = now()
  WHERE status = 'running'
    AND locked_at < now() - interval '3 minutes'
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

const benignClosed = await sql`
  UPDATE oska_jobs
  SET status = 'completed',
      result = jsonb_build_object(
        'accepted', false,
        'reason', 'no_new_candidates_this_round',
        'selfHealed', true
      ),
      last_error = NULL,
      locked_by = NULL,
      locked_at = NULL,
      completed_at = COALESCE(completed_at, now()),
      updated_at = now()
  WHERE status = 'dead_letter'
    AND type = 'lead_discovery'
    AND (
      last_error ILIKE '%ZERO_API_DISCOVERY_NO_CANDIDATES%'
      OR last_error ILIKE '%NO_DISCOVERY_CANDIDATES%'
    )
  RETURNING id
`;

if (benignClosed.length) {
  console.log(
    "SELF_HEAL_BENIGN_DISCOVERY",
    JSON.stringify({ closed: benignClosed.length }),
  );
}

const transientRecovered = await sql`
  UPDATE oska_jobs
  SET status = 'pending',
      attempt_count = 0,
      last_error = NULL,
      locked_by = NULL,
      locked_at = NULL,
      next_run_at = now(),
      updated_at = now()
  WHERE status = 'dead_letter'
    AND type IN (
      'lead_discovery','lead_verify','contact_enrich',
      'market_research','content_brief','visibility_audit'
    )
    AND (
      last_error ILIKE '%ALL_PROVIDERS_FAILED%'
      OR last_error ILIKE '%OPENAI_HTTP_429%'
      OR last_error ILIKE '%VERIFIER_HTTP_%'
      OR last_error ILIKE '%STALE_LOCK_RECOVERED%'
    )
  RETURNING id
`;

if (transientRecovered.length) {
  console.log(
    "SELF_HEAL_DEAD_LETTER",
    JSON.stringify({ recovered: transientRecovered.length }),
  );
}

const intervalMinutes = Math.max(
  10,
  Number(process.env.OSKA_DISCOVERY_INTERVAL_MINUTES || 20),
);
const batchSize = Math.max(
  3,
  Math.min(10, Number(process.env.OSKA_DISCOVERY_BATCH_SIZE || 6)),
);
const maxBacklog = Math.max(
  25,
  Number(process.env.OSKA_MAX_PIPELINE_BACKLOG || 120),
);

const lanes = [
  {
    id: "tr-925-retail",
    geography: "Türkiye",
    turkeyPriority: "domestic",
    material: "925 silver",
    customerTypes: ["premium retailer", "multibrand", "stockist", "e-commerce"],
    goal: "Find new Turkey-first premium retailers, multibrand stores, stockists and e-commerce buyers with strong 925 silver fit, pricing power and replenishment signals.",
  },
  {
    id: "tr-brass",
    geography: "Türkiye",
    turkeyPriority: "domestic",
    material: "brass bronze",
    customerTypes: ["retailer", "wholesaler", "importer", "private-label buyer"],
    goal: "Find new Turkey-first brass/bronze jewelry buyers, wholesalers, importers and private-label prospects with active e-commerce or repeat-order potential.",
  },
  {
    id: "tr-distribution",
    geography: "Türkiye",
    turkeyPriority: "domestic",
    material: "925 silver and brass bronze",
    customerTypes: ["distributor", "wholesaler", "importer", "direct buyer"],
    goal: "Find new Turkish distributors, wholesalers, importers and direct B2B jewelry buyers suitable for OSKA production.",
  },
  {
    id: "tr-premium-multibrand",
    geography: "Türkiye",
    turkeyPriority: "domestic",
    material: "925 silver and brass bronze",
    customerTypes: ["premium multibrand", "concept store", "menswear retailer", "department store"],
    goal: "Find new Turkey-based premium multibrand, concept-store, menswear and department-store buyers with jewelry replenishment potential.",
  },
  {
    id: "turkey-linked-global-925",
    geography: "Global",
    turkeyPriority: "turkey-linked",
    material: "925 silver",
    customerTypes: ["premium retailer", "multibrand", "stockist", "importer"],
    goal: "Find global buyers with a concrete Turkey connection: Turkish jewelry brands in assortment, Made in Turkey products, Istanbul/Turkey sourcing, Turkish suppliers, or imports from Turkey; prioritize 925 silver.",
  },
  {
    id: "turkey-linked-global-brass",
    geography: "Global",
    turkeyPriority: "turkey-linked",
    material: "brass bronze",
    customerTypes: ["brand", "retailer", "private-label buyer", "wholesaler"],
    goal: "Find global brass/bronze jewelry buyers with a concrete Turkey connection such as Turkish-made products, Istanbul sourcing, Turkish suppliers, or existing Turkish brands.",
  },
  {
    id: "turkey-linked-agents",
    geography: "Global",
    turkeyPriority: "turkey-linked",
    material: "925 silver and brass bronze",
    customerTypes: ["agent", "showroom", "distributor", "sales representative"],
    goal: "Find global agents, showrooms and distributors already representing Turkish jewelry/accessory brands or sourcing from Turkey.",
  },
  {
    id: "turkey-linked-sourcing",
    geography: "Global",
    turkeyPriority: "turkey-linked",
    material: "925 silver and brass bronze",
    customerTypes: ["sourcing office", "RFQ buyer", "buying office", "importer"],
    goal: "Find global sourcing offices, buying offices, RFQ buyers and importers with explicit Turkey/Istanbul sourcing or Turkish supplier relationships.",
  },
  {
    id: "global-premium-retail",
    geography: "Global",
    turkeyPriority: "general-global",
    material: "925 silver",
    customerTypes: ["premium retailer", "menswear retailer", "multibrand", "stockist"],
    goal: "Find new global premium retailers and stockists with current 925 sterling silver jewelry assortment and strong e-commerce/replenishment signals.",
  },
  {
    id: "global-sourcing",
    geography: "Global",
    turkeyPriority: "general-global",
    material: "925 silver and brass bronze",
    customerTypes: ["sourcing office", "RFQ buyer", "agent", "showroom", "distributor"],
    goal: "Find new global sourcing offices, RFQ buyers, agents, showrooms and distributors open to external jewelry supply.",
  },
];

const backlogRows = await sql`
  SELECT
    count(*) FILTER (
      WHERE (
        type IN ('lead_discovery','lead_verify')
        OR type = 'contact_enrich'
      )
      AND id NOT LIKE 'historical-enrich-%'
    )::int AS growth_backlog,
    count(*) FILTER (
      WHERE type = 'contact_enrich'
        AND id LIKE 'historical-enrich-%'
    )::int AS historical_backlog,
    count(*)::int AS total_backlog
  FROM oska_jobs
  WHERE status IN ('pending','retry','running')
`;
const growthBacklog = Number(backlogRows[0]?.growth_backlog || 0);
const historicalBacklog = Number(backlogRows[0]?.historical_backlog || 0);
const backlog = Number(backlogRows[0]?.total_backlog || 0);

let scheduled = null;

if (growthBacklog < maxBacklog) {
  const bucketMs = intervalMinutes * 60_000;
  const bucket = Math.floor(Date.now() / bucketMs);
  const lane = lanes[bucket % lanes.length];
  const jobId = `lead-discovery-${bucket}-${lane.id}`;

  const payload = {
    lane: lane.id,
    geography: lane.geography,
    material: lane.material,
    customerTypes: lane.customerTypes,
    limit: batchSize,
    searchVariant: bucket % 10,
    turkeyPriority: lane.turkeyPriority,
    goal: lane.goal,
    rules: {
      turkeyFirst: true,
      turkeyConnectionPriority: lane.turkeyPriority === "turkey-linked",
      excludeGrandBazaarFirms: true,
      requireEvidenceUrls: true,
      noInventedContacts: true,
      whatsappMustBeExplicitlyVerified: true,
      strongSignals: [
        "active e-commerce",
        "high retail price",
        "stock movement or replenishment",
        "international shipping",
        "external sourcing or B2B relevance",
      ],
    },
  };

  const inserted = await sql`
    INSERT INTO oska_jobs (
      id, type, payload, status, priority,
      preferred_providers, max_attempts, approval_status
    )
    VALUES (
      ${jobId},
      'lead_discovery',
      ${sql.json(payload)},
      'pending',
      100,
      '[]'::jsonb,
      3,
      'not_required'
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;

  if (inserted[0]) {
    await sql`
      INSERT INTO oska_job_events (job_id, event_type, detail)
      VALUES (
        ${jobId},
        'scheduled_discovery',
        ${sql.json({
          lane: lane.id,
          batchSize,
          intervalMinutes,
          backlogBefore: growthBacklog,
        })}
      )
    `;

    scheduled = {
      jobId,
      lane: lane.id,
      batchSize,
    };

    console.log(
      "DISCOVERY_JOB_ENQUEUED",
      JSON.stringify({
        jobId,
        lane: lane.id,
        batchSize,
        backlogBefore: growthBacklog,
      }),
    );
  }
} else {
  console.log(
    "DISCOVERY_SCHEDULER_PAUSED_BACKLOG",
    JSON.stringify({ growthBacklog, historicalBacklog, maxBacklog }),
  );
}


const directorIntervalMinutes = Math.max(
  60,
  Number(process.env.OSKA_DIRECTOR_INTERVAL_MINUTES || 360),
);
const directorBucketMs = directorIntervalMinutes * 60_000;
const directorBucket = Math.floor(Date.now() / directorBucketMs);
const directorJobId = `director-cycle-${directorBucket}`;

const directorBacklogRows = await sql`
  SELECT count(*)::int AS count
  FROM oska_jobs
  WHERE type IN ('director_cycle','market_research','content_brief','visibility_audit')
    AND status IN ('pending','retry','running')
`;
const directorBacklog = Number(directorBacklogRows[0]?.count || 0);
let directorScheduled = null;

if (directorBacklog < 6) {
  const inserted = await sql`
    INSERT INTO oska_jobs (
      id, type, payload, status, priority,
      preferred_providers, max_attempts, approval_status
    )
    VALUES (
      ${directorJobId},
      'director_cycle',
      ${sql.json({
        cycle: directorBucket,
        source: "watchdog",
        goal:
          "Run a compact evidence-grounded OSKA marketing intelligence cycle using existing shared state. Research only; no publish, no ad spend, no outbound.",
        rules: {
          turkeyFirst: true,
          sharedState: "postgres",
          humanApprovalForExternalActions: true,
        },
      })},
      'pending',
      190,
      '[]'::jsonb,
      3,
      'not_required'
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;

  if (inserted[0]) {
    await sql`
      INSERT INTO oska_job_events (job_id, event_type, detail)
      VALUES (
        ${directorJobId},
        'scheduled_director_cycle',
        ${sql.json({
          intervalMinutes: directorIntervalMinutes,
          backlogBefore: directorBacklog,
        })}
      )
    `;
    directorScheduled = {
      jobId: directorJobId,
      intervalMinutes: directorIntervalMinutes,
    };
    console.log("DIRECTOR_CYCLE_ENQUEUED", JSON.stringify(directorScheduled));
  }
}

const counts = await sql`
  SELECT status, count(*)::int AS count
  FROM oska_jobs
  GROUP BY status
  ORDER BY status
`;

const leadCounts = await sql`
  SELECT
    count(*)::int AS total,
    count(*) FILTER (WHERE status = 'contact_ready')::int AS contact_ready,
    count(*) FILTER (WHERE updated_at >= now() - interval '24 hours')::int AS last_24h
  FROM oska_leads
`;

console.log(
  JSON.stringify({
    recovered: recovered.length,
    benignClosed: benignClosed.length,
    transientRecovered: transientRecovered.length,
    growthBacklog,
    historicalBacklog,
    backlog,
    scheduled,
    directorScheduled,
    directorBacklog,
    counts,
    leads: leadCounts[0] ?? { total: 0, contact_ready: 0, last_24h: 0 },
  }),
);

await sql.end();
