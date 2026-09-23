-- OSKA CORE agent control plane.
-- Additive migration only: no DROP/DELETE/ALTER destructive operations.

CREATE TABLE IF NOT EXISTS oska_agent_runs (
    run_id text PRIMARY KEY,
    work_order_id text NOT NULL,
    agent_id text NOT NULL,
    risk_class text NOT NULL CHECK (risk_class IN ('T0','T1','T2','T3')),
    status text NOT NULL CHECK (status IN ('QUEUED','RUNNING','COMPLETE','PARTIAL','BLOCKED','FAILED','DEAD_LETTER')),
    idempotency_key text NOT NULL UNIQUE,
    model_route text,
    started_at timestamptz,
    finished_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oska_agent_runs_work_order
    ON oska_agent_runs(work_order_id);

CREATE TABLE IF NOT EXISTS oska_agent_outputs (
    output_id text PRIMARY KEY,
    run_id text NOT NULL REFERENCES oska_agent_runs(run_id),
    output_hash text NOT NULL,
    validation_status text NOT NULL CHECK (validation_status IN ('VALID','INVALID','PARTIAL')),
    result_json jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oska_evidence_refs (
    evidence_id text PRIMARY KEY,
    run_id text NOT NULL REFERENCES oska_agent_runs(run_id),
    source_uri text NOT NULL,
    captured_at timestamptz NOT NULL,
    snapshot_id text NOT NULL,
    provenance text NOT NULL,
    verifier_result text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oska_evidence_refs_run
    ON oska_evidence_refs(run_id);

CREATE TABLE IF NOT EXISTS oska_action_approvals (
    approval_id text PRIMARY KEY,
    work_order_id text NOT NULL,
    action text NOT NULL,
    status text NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED','CONSUMED')),
    signer text,
    requested_at timestamptz NOT NULL DEFAULT now(),
    approved_at timestamptz,
    expires_at timestamptz NOT NULL,
    approval_payload_hash text NOT NULL,
    consumed_at timestamptz,
    CHECK (
        status <> 'APPROVED'
        OR (signer IS NOT NULL AND approved_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_oska_action_approvals_work_order
    ON oska_action_approvals(work_order_id, status);

CREATE TABLE IF NOT EXISTS oska_dedup_lineage (
    lineage_id text PRIMARY KEY,
    canonical_record_id text NOT NULL,
    merged_record_id text NOT NULL,
    run_id text NOT NULL REFERENCES oska_agent_runs(run_id),
    reason text NOT NULL,
    reversible boolean NOT NULL DEFAULT true,
    rollback_pointer text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    rolled_back_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_oska_dedup_active_pair
    ON oska_dedup_lineage(canonical_record_id, merged_record_id)
    WHERE rolled_back_at IS NULL;
