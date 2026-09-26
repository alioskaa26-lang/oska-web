# OSKA FINAL SPRINT — Context Pack
Updated: 2026-09-26

## Source of truth
- Working final-sprint branch: `oska-final-sprint-20260926`
- Base snapshot: `oska-site-a-z-20260925`
- Production/main remains owner-gated and untouched.
- Current authoritative product direction: premium B2B catalogue, no retail checkout.

## Non-negotiable decisions
- TR + EN active; no mixed-language visible UI.
- Women / Men → category → collection/product flow.
- Primary conversion: RFQ / contact / private-label conversation.
- Unknown price, MOQ, lead time, capacity, certification, stock or commercial terms are never invented.
- Category media must match the category; no bracelet imagery relabelled as rings/necklaces/earrings.
- Human approval required for publish, domain/DNS, payment, secrets/2FA, legal/contract commitments and irreversible actions.

## AI assistant authority matrix
Allowed: open collections/products, navigate by natural-language intent, prepare RFQ draft, guide to contact/RFQ.
Forbidden without human approval: quote prices, promise discounts, confirm orders, accept payment, sign/accept contracts, promise company terms or binding delivery commitments.

## Concurrency / ownership
- One primary writer per page/file/task.
- Other agents may research, review or QA but must not write to the same writable worktree.
- Each parallel implementation gets its own branch/worktree/port.
- Merge only reviewed changes into final-sprint integration.
- Take a rollback point before each substantial change.

## Proof-before-Done
A task may be marked BITTI only with direct evidence: preview/readback, executed test, screenshot/flow result, or real lead/output.
Build PASS alone is insufficient for UI completion.

## Known existing proof
Stage-5 GitHub QA previously passed lint, typecheck, build, EN/TR, 1280/820/390, overflow, overlay focus/ESC and runtime-error gates.
Existing safe-staging already contains Women/Men, Collections, Bracelets, PDP, Manufacturing, Private Label, Contact/RFQ, Search, Favorites, admin editor and deterministic digital guide.

## Final open work
1. Mission Control/status discipline.
2. Critical E2E user flow across desktop/tablet/iPhone/Android.
3. Site AI upgrade with guarded natural-language navigation + analytics.
4. Header language mini-avatar.
5. Sign-up/welcome layer final review.
6. Hero + original production video integration with working audio/unmute.
7. Responsive visual QA and owner preview.
8. Publish remains blocked until explicit owner approval.
