# OSKA Automation and Cloud Rules

- Cloud-first: critical workflows must not depend on the user's computer staying on.
- No single-provider dependency when a verified fallback exists.
- Required patterns: watchdog, bounded retry, idempotency, queue/scheduler, checkpoint, failover, and exact readback.
- A provider failure, quota/credit issue, timeout, or quality degradation must route to the next verified fallback instead of looping indefinitely.
- Never replay/refetch a completed verified provider step.
- Preserve run IDs, packet/checkpoint identity, and dedup semantics across retries/failover.
- New tools/providers enter through a reversible canary and capability verification before active routing.
- Logs/events are not completion proof; materialized write plus independent verification is required.
- Payment/credit purchase, production deploy/publish, DNS/domain mutation, and irreversible changes remain Human Approval gated.
