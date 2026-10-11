# OSKA Toolchain — pilot branch only

Goal: integrate **Zod, Vitest, Sentry, Crawlee, Playwright, Langfuse**
into the existing `control-plane-app`. Existing PostgreSQL queue + worker + watchdog remain canonical.
The **only** allowed business Discovery Queue writer remains OSKA Lead Engine v3;
this code does not connect a second Queue writer.

## Actual integration status
- Zod: fail-closed public lead identity, seller apex, material, evidence QA in `lib/lead-quality.mjs`.
  `VERIFIER_PENDING` **is not** QUALIFIED, NET-NEW, Sales Ready, an order, or a purchase.
  Cross-system true legal firm+own apex dedup and independent verifier remain mandatory.
- Vitest: regression tests in `tests/lead-quality.test.mjs`, `npm test`.
- Sentry: optional `@sentry/node` error signals for the worker/watchdog.
  **Default OFF**. Only static error category/stage; no raw client details, messages or payloads.
- Langfuse: optional `@langfuse/tracing` + `@langfuse/otel` for per-job-type spans.
  **Default OFF**. Neither prompt, model response, customer record, contact nor secret is attached.
- Crawlee+Playwright: one-page public source pilot in `scripts/public-route-canary.mjs`.
  **Default OFF**, explicit allowed apex only, robots.txt respected, no recursive crawl,
  no login, no form, no paywall, no antibot bypass, no external customer action.
  Playwright requires a separately installed browser binary; no unattended download.
- Existing Railway services are NOT modified by this branch alone. No production publish/deploy.
- No external monitoring account, DSN or API key is created. No subscriptions or credits bought.

## Preview setup (authorized technical operator only)
Use Node 22+. In `control-plane-app`:
```bash
npm install
npm test
npm run typecheck
```
Set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` to avoid browser download during basic setup.

Optional public route (after checking public site terms and ownership):
```bash
OSKA_PUBLIC_CRAWL_ENABLED=true OSKA_PUBLIC_ROUTE_ALLOWLIST=example.com npm run pilot:route -- https://example.com --mode=html
```
Browser mode requires the operator to install Playwright Chromium once. 
`--mode=browser` remains preview-only until browser/sandbox/cost policy is approved.

## External credentials gate
```
OSKA_TELEMETRY_ENABLED=false
OSKA_SENTRY_ENABLED=false
SENTRY_DSN=
OSKA_LANGFUSE_ENABLED=false
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_BASE_URL=
OSKA_PUBLIC_CRAWL_ENABLED=false
OSKA_PUBLIC_ROUTE_ALLOWLIST=
```
Only connect DSN / Langfuse credentials in the provider's secret store after OWNER approval
and privacy review. Avoid putting credentials in source, CI logs, chat or the repository.
Server tracing intentionally omits raw prompts, lead payloads and secrets.

## Promotion gates
1. `npm test` + `npm run typecheck` verified PASS on the **test branch**.
2. Safety check: no replacement of Queue business writer; legacy Lean remains OFF.
3. Rollback/backup: known-good commit and previous Railway deployment IDs verified.
4. Operator approves preview deployment; independently test worker+watchdog heartbeat.
5. Independently verify a **real** fresh lead through Queue write + exact readback + Verifier PASS.
   Research route or scheduled task alone is not production lead count.
6. Owner approval separately required for **production** deployment, external credentials,
   payments or subscriptions, outbound contact and irreversible actions.

Current status: CODE STAGED FOR REVIEW. No unverified PASS/ACTIVE claim.
