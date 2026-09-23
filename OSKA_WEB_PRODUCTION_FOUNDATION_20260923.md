# OSKA WEB — Production Foundation (2026-09-23)

This file records code staged on `oska-web-cms-i18n-20260922` without changing the currently published AppDeploy staging snapshot.

## Added, not yet wired into the published preview
- `safe-staging/backend/index.ts`: central DB persistence for CMS drafts/published versions/history/rollback; truthful RFQ persistence; grounded server-side AI concierge.
- `safe-staging/src/oskaPlatform.ts`: typed frontend API/auth adapter.
- `safe-staging/src/AdminPersistenceBridge.tsx`: admin sign-in + central draft/publish/load controls.
- `safe-staging/src/LiveConcierge.tsx`: live concierge UI with RFQ/optional WhatsApp handoff.
- `safe-staging/src/oskaLocale.ts`: TR/EN single-source dictionary for the new production flows.
- `safe-staging/src/appdeploy.d.ts`: CI-only type declarations so the safe branch can type-check before AppDeploy injects its SDK at deployment.

## Truth / safety gates
- No price, MOQ, lead-time, stock, capacity, dimension, weight or other technical spec is generated when absent. High-risk fact intents are short-circuited to a confirmation/RFQ response before the model is called.
- RFQ success is returned only after a database record is created.
- No outbound email/CRM claim exists yet.
- WhatsApp is enabled only when a verified public `whatsappUrl` exists in the published site config; no phone/URL is invented.
- Admin writes require AppDeploy auth plus an email allowlist supplied out-of-band as `OSKA_ADMIN_EMAILS`; there is no hard-coded owner email in the public repository.
- Current hero/video media and production/DNS remain untouched.

## Remaining integration gate
These modules deliberately remain unreferenced until the safe branch can be wired and tested as a frontend+backend AppDeploy build without replacing the currently published staging. Required next wiring:
1. load published CMS config at app boot, falling back to the checked-in safe defaults;
2. add `AdminPersistenceBridge` to the visual editor and remove production dependence on browser-local manual settings;
3. replace deterministic `DigitalGuide` with `LiveConcierge`;
4. change `ContactPage` to persist RFQs through `submitRFQ` and show success only on a confirmed DB write;
5. finish migration of every visible TR/EN string into one locale source and add a missing-translation CI gate;
6. run lint/type/build + 1280/820/390 + AI hallucination + RFQ + admin persistence/rollback + cross-device QA before applying any version to the authoritative staging app.
