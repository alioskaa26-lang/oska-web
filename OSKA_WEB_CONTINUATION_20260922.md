# OSKA WEB — Safe Continuation State (2026-09-22)

## Scope lock
This branch is documentation-only and exists to preserve the active OSKA WEB staging state without overwriting the older/main Lovable-derived repository. No production publish, DNS change, cart, checkout, lead hunting, cloud operations, watchdog or general OSKA automation belongs here.

## Current authoritative staging
- AppDeploy app: `oska-web-safe-staging-8ud231`
- Preview: `https://oska-web-safe-staging-8ud231.v2.appdeploy.ai/`
- Applied snapshot/version: `1790039448920`
- Runtime status checked: deployed/ready, no frontend or backend runtime errors reported by AppDeploy QA.
- Current source is a React/Vite staging prototype with `npm run build = lint + typecheck + vite build`.
- Existing hero/video sources are intentionally not replaced; the staging hero is a safe placeholder contract. Final hero media remains the last stage.

## Completed stages carried forward
### 1. David Yurman → reusable pattern research
Do not copy proprietary text, images, logos, product names, visual trade dress or exact layouts. The reusable logic already extracted and reflected in the staging is:
- quiet utility/announcement layer + premium sticky navigation
- desktop primary nav with structured mega-menu; mobile drawer without hover dependency
- one dominant hero region followed by an alternating product/editorial rhythm
- clear Women/Men/Collections/category discovery paths
- PLP with restrained filtering/sorting and product-first visual hierarchy
- PDP with large media gallery + sticky product/CTA panel + progressive disclosures
- service/concierge layer near the bottom of commerce/content flows
- deep footer with collections, brand/manufacturing, support and contact paths
- touch targets, focus-visible states, reduced-motion accommodation and responsive collapse rules

### 2. OSKA design system / page templates / interaction spec
Current implemented token direction:
- paper: `#fdfcf9`
- ink: `#171717`
- stone: `#f1eee7`
- muted text: `#6f6d69`
- line: `#dfddd7`
- accent: `#8b7356`
- serif display: Georgia / Times fallback
- sans UI: Arial / Helvetica fallback
- minimum interactive target: 44px
- desktop content gutters: ~4.5vw
- large section rhythm: 64–118px responsive vertical spacing
- breakpoint intent: desktop >1100, tablet <=1100/820, mobile <=560

Page templates already present in staging:
- Home
- Women / Men landing
- Collections
- Bracelet PLP
- Rings / Necklaces / Earrings capability pages pending verified category media/inventory
- Product PDP
- Manufacturing
- Private Label
- OSKA World / atelier context
- Search
- Favorites / shortlist
- Contact / RFQ

Interaction rules already present:
- desktop mega-menu; tap-based mobile drawer
- hash-route navigation for safe staging
- search overlay + full search page
- local favorites/shortlist persistence
- product-specific finish/variant routing
- PLP filter/sort
- PDP disclosures
- deterministic OSKA Digital Guide (navigation only; not fake generative AI)
- RFQ validation with explicit staging/no-send truth state

### 3. B2B/RFQ adaptation
- No cart or checkout.
- Primary conversion = Request quotation / Request sample / Produce for my brand.
- Unknown MOQ, timing, material or dimensional facts are not fabricated.
- Favorites act as a client shortlist and can be referenced in RFQ.
- Manufacturing/private-label capability is surfaced without pretending unverified category inventory exists.

## Current staging screen state
Implemented and routed: Women, Men, Collections, Manufacturing, Private Label, Contact/RFQ, Bracelets PLP, PDP, Search, Favorites, Footer, mobile drawer, EN/TR switch, digital guide.

Category integrity rule remains active: bracelet imagery must not be relabeled as rings/necklaces/earrings. Those categories remain capability-led until category-correct verified OSKA media/inventory is loaded.

## Stage 5 QA — next incomplete work
Do not restart design research. Continue from these concrete QA items:
1. Complete visible EN/TR localization. Current staging still has several English-only labels in footer groups, PLP filter labels/options, PDP back/disclosure labels and a few helper strings.
2. 390px header: reduce right-side density. Keep search + brand + language/menu readable; move Favorites access into the mobile drawer if necessary rather than risking brand collision.
3. Add stronger overlay accessibility behavior for search/mobile drawer: focus return/initial focus and body-scroll lock; keep Escape close.
4. Re-run exact 1280 / 820 / 390 visual QA after the above changes; verify no horizontal overflow, sticky offsets, footer accordion behavior and RFQ layout.
5. Re-run build/type/lint and runtime/console checks after deployment.

## Stage 6 hero/video final plan — do not execute yet
Only after Stage 5 is green:
- map the existing approved OSKA hero/video asset into the single hero slot
- preserve original media source and geometry; do not regenerate or overwrite it silently
- define desktop/tablet/mobile crop/focal-point rules
- keep pause/play, reduced-motion and poster/fallback behavior
- verify LCP/performance after media integration
- final hero production/edit remains the last visual-production step

## Current blocker / provider state
At the latest continuation attempt, AppDeploy rejected new deployment work because the daily Free-tier deployment budget was below the minimum and reported reset at `2026-09-23T00:00:00Z`. Existing staging remains live and readable. Vercel connector currently exposes no teams/projects. Therefore no code mutation is being pushed to an older/behind repository or to production merely to bypass the credit gate.

## Safe next action
When a deploy-capable staging target is available, update the authoritative AppDeploy snapshot (or an explicitly verified equivalent staging clone) with only the Stage 5 QA fixes above, then run exact viewport QA. Do not touch hero media until that passes.
