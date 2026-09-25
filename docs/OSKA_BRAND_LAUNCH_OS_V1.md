# OSKA Brand Launch OS v1

Purpose: reuse the proven operating system for OSKA, Zuma Silver and the next brand without cloning brand identity or customer data.

## Shared modules
- Shopify theme component library: accessibility, responsive grids, performance guards, RFQ/lead forms, tracking hooks.
- Event taxonomy: brand_id + rfq_start/submit, sample_request, shortlist, catalogue, AI/live-chat, WhatsApp, collection/model view.
- AI backend contract: shared runtime, isolated knowledge bases and brand prompts; no cross-brand response leakage.
- Media/CAD pipeline: asset_id, brand_id, model_code, collection, angle, material, finish, version, approval_status.
- QA gates: JSON/Liquid/JS validation, broken links, localization, mobile/tablet/desktop, accessibility, privacy/consent, no-secret checks.
- CRM schema: brand_id, lead_id, source/UTM, buyer_type, material, target market, pipeline stage.

## Brand-isolated modules
- Domain, sender identity, SPF/DKIM/DMARC and mailbox reputation.
- Store/customer/order databases and access roles.
- SEO canonicals, Search Console properties, sitemaps, editorial clusters and keyword strategy.
- Legal/privacy/cookie wording and consent records.
- AI brand voice, product facts, policies and commercial rules.
- Creative identity: logo, typography, color tokens, photography, collection naming and storytelling.

## Clone-safe launch sequence
### One-day foundation
1. Create isolated store/staging and brand_id.
2. Apply component/theme baseline.
3. Set brand tokens and navigation.
4. Connect brand-specific catalogue/media data.
5. Configure TR/EN or target-market locale.
6. Install analytics event hooks without activating unapproved trackers.
7. Run automated QA and keep staging unpublished.

### One-week launch
1. Product/collection content and image QA.
2. SEO metadata/schema/internal links.
3. AI knowledge base and handoff.
4. CRM/source attribution.
5. Consent/legal owner review.
6. Domain/email/auth owner gates.
7. Final multi-device QA.
8. Owner publish approval.

## Freeze rule
After launch, change architecture only for a verified bug/security issue, conversion evidence, new product requirement or explicit owner request. Brand content can evolve without modifying the shared core.

## Zuma note
Zuma Silver is retail-first, so it should reuse technical modules but NOT OSKA's B2B wording, lead pipeline semantics or manufacturer positioning.
