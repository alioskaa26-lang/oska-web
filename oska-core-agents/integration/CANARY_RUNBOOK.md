# OSKA Agent Pack — Canary Runbook

## Current state

The pack is **staged, not production-wired**. The repository currently contains no live PostgreSQL/DBOS service, provider credentials, R2 binding, or outbound worker. Do not describe it as a live autonomous system until those dependencies exist and readback checks pass.

## Phase 0 — Repository gate

1. CI must pass all agent-pack unit tests.
2. No agent may have `external_write=true`.
3. Unknown side effects must classify as T3.
4. The web app build/runtime must remain untouched by the pack.

Failure in any item blocks promotion.

## Phase 1 — T0/T1 dry run

Use only:
- public web/marketplace reads,
- internal scoring,
- internal drafts,
- internal verification.

Required output for every run:
- work order id,
- agent id,
- status,
- evidence refs,
- assumptions/conflicts,
- requested action risk.

No customer message, publish, payment, DNS/domain, secret, permission, delete or legal action is allowed.

## Phase 2 — Evidence persistence

Apply `sql/001_agent_control_plane.sql` to a non-production PostgreSQL database first.

Verify by readback:
- one `oska_agent_runs` row,
- one validated `oska_agent_outputs` row,
- evidence rows with source URI + capture time + snapshot id + provenance + verifier result,
- repeated idempotency key is rejected.

Do not continue if evidence readback is incomplete.

## Phase 3 — Reversible T2 canary

Test only a synthetic dedup record.

Requirements:
- reversible=true,
- audited=true,
- history_retained=true,
- non-empty rollback pointer,
- lineage preserved.

Then perform the rollback and verify the original canonical state can be reconstructed.

## Phase 4 — Simulated T3 gate

Create a simulated `outbound_send` action.

Expected behavior:
1. without approval -> BLOCKED;
2. expired/mismatched approval -> BLOCKED;
3. valid action-bound approval -> policy may return ALLOWED, but the canary must still use a fake/no-op sender.

Do **not** connect a real customer-send tool during this test.

## Production prerequisites

Before any live deployment:
- a chosen PostgreSQL environment,
- DBOS scheduler/queue runtime,
- evidence object store,
- model-provider routing and budget circuit breaker,
- kill switch,
- audit/readback,
- alerting/dead-letter monitoring,
- signed Human Approval Gate for T3,
- deployment target and rollback procedure.

## Rollback

The current agent pack is additive and isolated. Rollback is:
1. disable the agent worker/scheduler;
2. revert the agent-pack commit/PR;
3. leave evidence/audit records intact for forensics;
4. never delete authoritative lead data as part of rollback.
