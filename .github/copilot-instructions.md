# OSKA Repository Instructions

@OSKA_CORE_RULES.md

- OSKA MASTER — Ana Komuta is the canonical business and operating source.
- Read existing code and current state before editing.
- Preserve accepted work and make the smallest reversible change first.
- A task is not DONE until the write/materialization succeeds and a separate readback or equivalent verification passes.
- Never bypass the Human Approval Gate for production publish/deploy, DNS/domain, spend, outbound email/WhatsApp/DM, or destructive actions.
- Use verified provider/tool failover on quota, timeout, failure, or repeated quality degradation; do not replay already verified completed work.
- For website changes, verify every affected clickable route, product/category/gender/language mapping, and desktop/tablet/mobile behavior.
- Run relevant build/lint/tests before proposing merge or production-impacting changes.
- Keep unrelated code and structure untouched.
