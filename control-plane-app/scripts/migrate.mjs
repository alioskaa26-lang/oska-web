import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_NOT_CONFIGURED");

const sql = postgres(url, { max: 1, connect_timeout: 15 });

await sql.unsafe(`
CREATE TABLE IF NOT EXISTS oska_jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','running','retry','waiting_approval','completed','dead_letter','cancelled')),
  priority INTEGER NOT NULL DEFAULT 0,
  preferred_providers JSONB NOT NULL DEFAULT '[]'::jsonb,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 4,
  approval_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (approval_status IN ('not_required','pending','approved','rejected')),
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error TEXT,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS oska_jobs_runnable_idx
  ON oska_jobs (status, next_run_at, priority DESC, created_at);

CREATE INDEX IF NOT EXISTS oska_jobs_locked_idx
  ON oska_jobs (status, locked_at);

CREATE TABLE IF NOT EXISTS oska_job_events (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES oska_jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oska_job_events_job_idx
  ON oska_job_events (job_id, created_at DESC);

CREATE TABLE IF NOT EXISTS oska_approvals (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES oska_jobs(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  approved_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oska_provider_health (
  provider TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'unknown',
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  last_seen_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oska_leads (
  id BIGSERIAL PRIMARY KEY,
  canonical_key TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  domain TEXT,
  country TEXT,
  category TEXT,
  material TEXT,
  decision_maker TEXT,
  role TEXT,
  email TEXT,
  phone_whatsapp TEXT,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_score INTEGER,
  verification_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_job_id TEXT,
  parent_job_id TEXT,
  status TEXT NOT NULL DEFAULT 'verified'
    CHECK (status IN ('verified','contact_ready')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oska_leads_domain_idx
  ON oska_leads (domain);

CREATE INDEX IF NOT EXISTS oska_leads_material_idx
  ON oska_leads (material);

CREATE INDEX IF NOT EXISTS oska_leads_country_idx
  ON oska_leads (country);

CREATE INDEX IF NOT EXISTS oska_leads_updated_idx
  ON oska_leads (updated_at DESC);

CREATE TABLE IF NOT EXISTS oska_known_entities (
  canonical_key TEXT PRIMARY KEY,
  company TEXT,
  domain TEXT,
  country TEXT,
  source TEXT NOT NULL DEFAULT 'historical-master',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oska_known_entities_domain_idx
  ON oska_known_entities (domain);
`);

try {
  const { readFile } = await import("node:fs/promises");
  const raw = await readFile(new URL("../data/known-entities.json", import.meta.url), "utf8");
  const known = JSON.parse(raw);

  if (Array.isArray(known) && known.length > 0) {
    await sql`
      INSERT INTO oska_known_entities ${sql(
        known,
        "canonical_key",
        "company",
        "domain",
        "country",
        "source",
      )}
      ON CONFLICT (canonical_key) DO UPDATE SET
        company = COALESCE(EXCLUDED.company, oska_known_entities.company),
        domain = COALESCE(EXCLUDED.domain, oska_known_entities.domain),
        country = COALESCE(EXCLUDED.country, oska_known_entities.country),
        source = EXCLUDED.source
    `;
    console.log("Known lead memory loaded:", known.length);
  }
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  console.log("Known lead seed file not present; continuing.");
}

await sql.unsafe(`
CREATE TABLE IF NOT EXISTS oska_customer_threads (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  external_customer_key TEXT,
  company TEXT,
  contact_name TEXT,
  language TEXT,
  country TEXT,
  b2b BOOLEAN,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','qualifying','qualified','rfq_draft','waiting_human','closed')),
  last_intent TEXT,
  last_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel, external_customer_key)
);

CREATE INDEX IF NOT EXISTS oska_customer_threads_status_idx
  ON oska_customer_threads (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS oska_customer_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES oska_customer_threads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL
    CHECK (direction IN ('inbound','assistant_draft','outbound')),
  channel TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oska_customer_messages_thread_idx
  ON oska_customer_messages (thread_id, created_at DESC);

CREATE TABLE IF NOT EXISTS oska_customer_actions (
  id BIGSERIAL PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES oska_customer_threads(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_approval','approved','rejected','completed')),
  approval_required BOOLEAN NOT NULL DEFAULT true,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oska_customer_actions_pending_idx
  ON oska_customer_actions (status, created_at);
`);




console.log("OSKA Control Plane schema ready");
await sql.end();
