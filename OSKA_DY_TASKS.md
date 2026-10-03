# OSKA DY Reference Implementation Brief — 2026-10-03

## Safety / scope

- Work ONLY in local branch: oska-dy-private-preview-20261003.
- Do NOT push, deploy, publish, merge, change DNS, alter Shopify live theme, or touch payments.
- This repository is a Lovable/TanStack React prototype, NOT the Shopify Liquid theme.
- Preserve OSKA brand identity. Use David Yurman only as UX/information-architecture reference; do not copy logos, copyrighted copy, product names, or product photos.

## Primary reference

Figma master: https://www.figma.com/design/rvgwvG3nVNbR0cio9cVTx4
Reference page inside file: “DY LIVE REFERENCE — 03 OCT 2026”.

## Required OSKA route / click architecture

Home → Women/Men → Main Collection → Subcollection → Model Detail → RFQ / WhatsApp / Contact.

## Required UX behaviors

1. Premium editorial homepage with collection-led hero.
2. Header/mega-menu inspired by David Yurman hierarchy:
   - Women
   - Men
   - Collections
   - Atelier
   - About
   - Contact
   - Search / Favorites-shortlist / Language / RFQ affordances where appropriate.
3. Header hides on downward scroll and reappears on upward scroll.
4. Women and Men content are strictly separated.
5. Collections index is a clean directory of main collections.
6. Collection page contains ONLY products belonging to that collection.
7. Panther collection contains Panther products only.
8. Product/model detail standard:
   - 4 product images + 1 model/lifestyle image
   - model name, SKU, material, dimensions, weight, stones/finish
   - story
   - parent collection
   - related models (max 10)
   - set pieces
   - RFQ / WhatsApp / Contact CTA
9. Continue-exploring content must stay context-aware by gender/collection.
10. Desktop/tablet/mobile must not overflow.

## David Yurman patterns to adapt

- Homepage: editorial hero → Discover the Collection strip → category shortcuts → second collection/story → further discovery.
- Men landing: featured collection hero → 5-model strip → second collection → Shop by Category → other collections/new arrivals.
- Women landing mirrors system but content is independent.
- Collections index: featured collections + All Collections directory.
- Product page: identity/material/size/options/details and clear parent collection relationship.

## OSKA product/data expectations

Current Shopify connector shows:

- Collections: “Ana sayfa”, “Panther”.
- Panther collection currently has 0 products.
- Current catalog product: Double Panther Bracelet — Private Label, draft, 5 variants.
  Do not assume this React repo is the Shopify source of truth.

## Deliverables for writer

- Audit current routes/data first.
- Implement the architecture above in the prototype with reusable components and data-driven relationships.
- Prefer fixing/rewiring existing structures over adding duplicate parallel systems.
- Add clear data structures for gender, main collection, subcollection, model, related models and set pieces.
- Ensure every navigation/CTA maps to a real route or deliberate disabled state.
- Keep visual design OSKA-specific: dark premium, black/burgundy/deep tones, restrained typography, strong jewelry imagery placeholders only where assets are unavailable.
- Add/adjust automated checks where practical.
- Run npm install if needed, then npm run build and npm run lint.
- Leave a concise report in IMPLEMENTATION_REPORT.md with files changed, tests run, known blockers, and next Shopify-specific actions.

## Verifier acceptance criteria

- No dead-end primary nav.
- No gender leakage.
- No cross-collection leakage.
- Panther only Panther.
- Home → gender → collection → model → RFQ journey works.
- Responsive layout coherent at desktop/tablet/mobile widths.
- Build passes.
- Lint passes or remaining lint errors are documented.
- No deployment/push/publish performed.
