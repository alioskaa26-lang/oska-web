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
`);

console.log("OSKA Control Plane schema ready");
await sql.end();
