# DBOS + PostgreSQL Wiring Plan

This plan adds the specialist pack to OSKA OS V1.2 without changing the locked architecture.

## 1. Work-order shape

Each DBOS job should carry at minimum:

```json
{
  "work_order_id": "OSKA-WO-...",
  "task": "natural-language task",
  "agent_id": "market_scout",
  "risk_class": "T0",
  "input_refs": [],
  "requested_capabilities": [],
  "idempotency_key": "...",
  "budget_scope": "...",
  "approval_id": null
}
```

Routing must happen before a worker receives privileges. `runtime/oska_agents.py` provides the deterministic first-pass router and action classifier.

## 2. Database records

Do not create a second source of truth. Store agent execution as child records of the existing work order.

Recommended logical records:
- `agent_runs`: work_order_id, agent_id, status, started_at, finished_at, model_route, cost ledger reference.
- `agent_outputs`: structured result envelope, validation status, output hash.
- `evidence_refs`: source URI, capture timestamp, R2 object URI, SHA-256/snapshot ID, provenance, verifier result.
- `approval_links`: requested T3 action, approval record, signer, expiry.
- `dedup_lineage`: canonical record, merged record IDs, reason, reversible state, rollback pointer.

If equivalent tables already exist, extend them instead of duplicating them.

## 3. DBOS workflow sequence

1. Receive/validate work order.
2. Check kill-switch.
3. Check idempotency key.
4. Route to agent.
5. Determine risk and requested capabilities.
6. Reject any forbidden capability combination.
7. Enforce budget circuit breaker.
8. Execute isolated worker.
9. Validate structured output.
10. Persist output + evidence metadata.
11. For T2 writes: require reversibility + audit + retained history.
12. For T3 actions: create `PENDING_APPROVAL`; do not execute.
13. Record audit-chain entry and readback result.
14. Complete or dead-letter the work order.

## 4. Capability boundary

External-reading workers may write only to internal evidence/output channels. They do not receive customer-send, publish, DNS, secret, permission, payment or deletion tools.

A later outbound worker, if created, must consume only verified internal drafts and a signed approval token. It should not browse untrusted content in the same execution context.

## 5. Material-lane discipline

Lead discovery and scoring must preserve separate lanes:
- Brass/Bronze
- 925 Silver
- Gold
- Diamond/Lab-grown

The material lane is an input to scoring and must not be inferred from a stale prior record when fresh evidence disagrees.

## 6. Sales-ready gate

A candidate reaches Sales Ready only after:
- company verification,
- commercial signal verification,
- scoring,
- independent lead QA,
- dedup against Master Lead Vault,
- evidence completeness threshold.

No single specialist may bypass this chain.

## 7. Deployment order

Safe order:
1. Add registry/policy files.
2. Run unit tests.
3. Wire read-only T0/T1 jobs.
4. Verify evidence persistence/readback.
5. Enable reversible T2 dedup/upsert canary.
6. Test approval gate with simulated T3 action.
7. Only after all existing OSKA acceptance checks pass, connect provider keys and any external-write worker.

Do not change DNS or create outbound automation as part of this pack.
