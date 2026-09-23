# OSKA CORE Agent Pack v1

This folder adds a specialist-agent layer to the locked **OSKA OS V1.2** architecture without redesigning the core.

Architecture stays:

Cloudflare Access/Tunnel → Thin OSKA Control API → PostgreSQL (single source of truth) → DBOS scheduler/queue → model-router → isolated workers → R2 evidence store → provider-diverse watchdog.

The pack is intentionally model-agnostic. It borrows the useful structural idea from Anthropic's public financial-services agent plugins — a small number of specialist agents with narrow jobs — but uses OSKA-specific roles, safety rules, evidence contracts, and deterministic routing.

## Ten OSKA agents

1. `market_scout` — discovers candidate companies and market signals.
2. `lead_scoring_builder` — produces brass/925/gold/lab-grown fit scores from evidence.
3. `commerce_intelligence` — checks price, stock, reviews, traffic and replenishment signals.
4. `sales_pack_agent` — prepares internal customer-specific offer/catalog drafts.
5. `account_brief_agent` — prepares pre-meeting account briefs and decision-maker context.
6. `lead_qa` — independently verifies whether a candidate should enter Sales Ready.
7. `master_lead_dedup` — proposes/executes reversible dedup merges with lineage.
8. `sales_ops_close` — produces internal pipeline/order/tahsilat close reports.
9. `data_auditor` — finds stale prices, broken contacts, duplicate or contradictory records.
10. `company_verifier` — verifies company identity, contact provenance and commercial footprint.

## Non-negotiable policy

- PostgreSQL remains authoritative; agents never own state.
- DBOS remains scheduler/queue authority.
- Every externally sourced factual claim needs evidence metadata.
- Agents that read untrusted external content are not allowed to hold secrets and external-write permission together.
- Outbound send, publish, payment, DNS/domain change, secret change, permission change, deletion and legal commitment are T3 and require signed human approval.
- Model consensus is not evidence. Evidence must be source/readback/retest based.
- No agent gets permission to change DNS, send customer messages, publish externally, spend money, or delete authoritative data by default.
- Dedup writes are T2 only when fully reversible and merge history is retained; otherwise they become T3.
- The pack does not make n8n, Paperclip, Temporal or any model provider a source of truth.

## Files

- `agent_registry.json`: machine-readable agent definitions and capability boundaries.
- `policy.json`: OSKA T0–T3 risk and approval policy.
- `runtime/oska_agents.py`: deterministic routing, policy checks and registry validation.
- `prompts/AGENT_PROMPTS.md`: production prompt contracts for each specialist.
- `integration/DBOS_POSTGRES_WIRING.md`: how to wire the pack into the existing core.
- `tests/test_agent_pack.py`: invariant tests.

## Quick validation

From repository root:

```bash
python -m unittest oska-core-agents/tests/test_agent_pack.py -v
```

This pack is safe to stage before provider keys are connected because it contains no credentials and no live outbound connectors.
