# OSKA Core Rules

This is the provider-agnostic operating policy for OSKA work. Every agent, model, coding assistant, automation worker, and subagent must treat these rules as the shared baseline.

## Authority and precedence
1. OSKA MASTER — Ana Komuta is the canonical business and operating source.
2. This file is the repository-level shared policy.
3. `CLAUDE.md` and `.claude/rules/*.md` may specialize these rules but must not weaken or contradict them.
4. A task brief may add constraints but cannot override Human Approval, safety, verification, or canonical OSKA decisions.

## Work discipline
- Read relevant existing files and current state before changing anything.
- Do not restart completed work just because context changed.
- Prefer the smallest reversible change that can be verified.
- Do not claim success from intent, logs, or tool acceptance alone.
- A task is DONE only after successful write/materialization plus separate exact readback or equivalent independent verification.
- If verification fails, keep the task OPEN/FAILED_ACCEPTANCE and repair from current state.

## Human Approval Gate
Owner approval is required before:
- payment, spend, credit purchase, or billable upgrade;
- domain/DNS changes;
- production publish/deploy/merge when it can affect the live system;
- outbound email, WhatsApp, DM, or customer-contact send;
- destructive or difficult-to-reverse actions.

Preparation, validation, drafting, staging, canary testing, and reversible branch work may proceed without asking again.

## Provider and agent failover
- Never depend on one provider when an approved fallback exists.
- On quota/credit exhaustion, timeout, degraded quality, or provider failure, move to the next verified fallback.
- Never replay/refetch work that has already completed and passed checkpoint/readback.
- Preserve idempotency and checkpoint state across failover.
- New providers enter through a small canary before active routing.

## Performance management
- Score work on correctness, fidelity, verification, latency/retry behavior, cost/quota risk, rollback/checkpoint support, and integration quality.
- Repeated low-quality behavior moves a provider/agent to probation or retirement.
- Replace weak tools with verified stronger tools; do not waste cycles repeatedly retrying a known bad actor.

## OSKA priorities
- Website: premium B2B catalogue; no retail checkout unless explicitly changed in MASTER.
- Lead Engine: Türkiye first; Brass/Bronze priority; contactability is a hard gate; dedup and evidence required.
- Creative/CAD: preserve product identity, approved material/color/scale/variant logic, and production feasibility.
- Automation/Cloud: cloud-first, watchdog, retry, idempotency, queue/scheduler, checkpoint, failover, and exact readback.

## Repository safety
- Work on a staging or feature branch for changes that could affect live behavior.
- Do not force-push, rewrite shared history, delete protected resources, or publish to production without owner approval.
- Run relevant build/lint/tests before proposing merge when available.
