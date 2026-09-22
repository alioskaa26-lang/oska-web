# OSKA WEB — MASTER SPEC V6
Date: 2026-09-22

## Non-negotiable reference rule
David Yurman is the master interaction/information-architecture reference: navigation logic, menu depth, page flow, hero behavior, collection flow, PLP/PDP rhythm, editorial/story sequencing, footer/service depth, and responsive behavior must be matched as closely as practical. Do not reuse David Yurman source code, logo, copy, photography, video, product names, or protected brand assets.

OSKA replaces all brand/content layers:
- OSKA SILVER name/logo/company/contact
- OSKA collection names and product/model names
- OSKA-owned/licensed photos, renders, videos, 3D assets
- OSKA stories, atelier/manufacturing copy and B2B/RFQ language

## Site purpose
Premium B2B/catalog-first jewelry site. No retail checkout in this phase. Primary conversion: shortlist -> AI concierge / WhatsApp / RFQ / appointment/contact.

## Required information architecture
- Home
- Women
  - Bracelets
  - Rings
  - Necklaces
  - Earrings
- Men
  - Bracelets
  - Rings
  - Necklaces
  - Earrings / Pendants where appropriate
- Collections
- Manufacturing
- Private Label / For Brands
- OSKA World
  - About
  - Atelier / Craftsmanship
  - Materials
  - Stories / Editorial / Films
- Search
- Favorites / Shortlist
- Contact / RFQ
- Legal / Privacy / Accessibility / Sitemap / FAQ / Care & Services

## Global product/content sourcing rule
Product-design inspiration is NOT limited to David Yurman. Research a broad global field (e.g. John Hardy, Tiffany, Bvlgari, Cartier, Chaumet, Repossi, Spinelli Kilcollin, Messika, premium independent jewelry brands) plus licensed CAD marketplaces (CGTrader, JewelryFileStore, Glaciera, JewelModel, MicroCAD, 3DExport, iJewel and other verified sources). Never copy a branded/protected product one-to-one. Use licensed bases or original concepts, then materially redesign geometry, proportions, stone layout, surface, motif, connection/clasp language and naming into OSKA-specific families.

## Content pipeline
For every important collection/product family:
1. design/reference research
2. CAD/3D or licensed base asset
3. manufacturability check
4. OSKA-specific redesign
5. packshot
6. multi-angle / macro
7. on-model editorial image
8. short motion / turntable video
9. collection/product story
10. localized TR/EN copy
11. QA before publish

## Live AI concierge — mandatory
Persistent but discreet premium assistant. It must:
- know current page, product, collection, material/finish, shortlist and current language
- answer product/category/material/manufacturing/private-label questions only from verified OSKA content
- recommend related products and collections
- help build a shortlist
- hand off to RFQ / WhatsApp / contact / appointment
- support TR and EN from day one; architecture ready for AR and RU
- never invent price, MOQ, lead time, stock, capacity or technical specs
- show graceful fallback when data is missing
- respect privacy; no hidden camera/mic use
- later support voice/realtime as an optional progressive enhancement
Use a server-side AI integration and keep secret keys off the browser.

## Admin / visual CMS — mandatory
Every major section must be editable manually after launch, without code:
- show/hide
- reorder
- duplicate/delete where safe
- width/height
- max-width
- section height/min-height
- top/bottom spacing
- media crop / object-position / focal point
- desktop/tablet/mobile-specific values
- text length / line clamp
- image/video replace
- poster/thumbnail
- CTA text and destination
- collection/product assignments
- story length / collapse behavior
- product page gallery order
- missing-content placeholder with example image + explanatory note
- draft / preview / publish
- undo / version history
- note-to-AI field: owner can write e.g. "shorten this section" or "make hero 12% shorter"; AI proposes change, human approves
- change log / who changed what
Do not rely on localStorage for production content. Persist settings centrally so edits made on iPad appear on every device.

## Hero controls
Admin must control:
- video/image source
- crop/focal point
- aspect ratio
- desktop/tablet/mobile height independently
- min/max height
- object-fit and object-position
- overlay intensity
- title/body width and position
- CTA visibility
- autoplay/mute/loop/poster
- reduced-motion fallback
- performance fallback
Missing media must show an editor-only sample slot and note, never a broken public block.

## Product page length control
Per-product/collection:
- short / standard / editorial modes
- story collapsed/expanded default
- gallery count
- related products count
- section visibility
- FAQ/disclosures count
- mobile-specific condensed mode
Admin can shorten/lengthen without deleting source content.

## Localization — critical, rebuild properly
The current mixed-language behavior is unacceptable. Use a single source of truth for all text and all routes.
Requirements:
- no hard-coded mixed-language strings in components
- TR and EN complete parity for every visible label, title, body, CTA, filter, form error, alt text and metadata
- locale-aware URLs or stable route-localization architecture
- locale persistence
- correct HTML lang
- localized metadata, OpenGraph, canonical and hreflang
- x-default fallback
- missing translation checker in CI/admin
- content editor shows TR and EN side-by-side and flags incomplete translations
- future AR/RU extension without component rewrites

## Search and discovery
- predictive search
- collection/category/material/stone/design keyword matching
- recent searches
- no-result recovery
- filters by category, collection, material, color/finish, stone, gender/audience, style
- favorites/shortlist persistence and sharing
- recently viewed
- related / complete-the-set suggestions
John Hardy-style strong filters and try-on signals are a useful benchmark, while OSKA remains inquiry-led rather than retail checkout.

## Virtual product experience
Progressive enhancement:
- 360/turntable where source asset exists
- zoom and macro
- 3D viewer for suitable CAD/GLB
- optional virtual try-on for rings/earrings/necklaces/bracelets after fidelity validation
- never use generic AI generation that changes product geometry for a product-truth view
- clearly separate artistic campaign imagery from exact product representation

## RFQ / B2B conversion
RFQ should support:
- company
- country/market
- name/email/phone/WhatsApp
- category
- material/finish
- target quantity
- reference product(s)/shortlist
- message
- file/reference upload
- preferred contact method
- consent
- anti-spam
- real success/failure state
- CRM/email/automation handoff
No fake submission success.

## Premium service layer
- WhatsApp
- AI concierge
- Contact / Product Specialist
- Request quotation
- Request sample
- Private-label consultation
- Appointment / video consultation option
- shareable shortlist / collection board for buyers
This should feel closer to a digital showroom and buying-room than a normal ecommerce store.

## Editorial / brand depth
Collection pages should include:
- hero film/image
- concise collection thesis
- featured products
- detail/macro craft story
- material story
- styling/editorial block
- related collection link
- CTA to shortlist/RFQ
Bvlgari-style collection storytelling and Chaumet-style advisor/contact depth are useful benchmarks.

## SEO / AI discoverability
- crawlable product/collection/story URLs
- server-renderable/indexable core content where possible
- Organization, BreadcrumbList, Product/ProductGroup where valid, VideoObject, FAQ where valid
- because this is B2B inquiry-led and not direct checkout, do not misuse merchant Offer markup for non-purchasable pages
- video sitemap / thumbnails / metadata
- XML sitemap
- robots rules
- Search Console
- canonical
- hreflang
- descriptive titles/meta
- strong internal linking
- AI-readable factual manufacturing/material pages

## Accessibility
Target WCAG 2.2 AA:
- keyboard navigation
- visible focus
- skip links
- correct semantics
- target sizes
- reduced motion
- captions/transcripts where appropriate
- contrast
- alt text
- error messages and labels
- no inaccessible mega-menu traps

## Performance
- responsive images / modern formats
- lazy loading below fold
- hero video poster + adaptive load
- preload only true critical assets
- reduced-data/reduced-motion fallback
- avoid layout shift
- route and asset budgets
- mobile-first QA on real iPhone/iPad widths
Premium appearance must not come at the cost of a slow site.

## Security / governance
- secrets server-side only
- admin authentication + role gating
- MFA where supported
- rate limiting
- upload validation
- CSP/security headers
- spam/bot protection
- audit log
- backups/version history
- no production admin controls exposed publicly

## Analytics / improvement
Privacy-aware events:
- hero/collection engagement
- search terms/no-result
- shortlist add/remove
- AI concierge opened / resolved / handoff
- RFQ start/complete/error
- WhatsApp/contact click
- language switch issues
- media performance
No dark patterns.

## QA gates before production
1. structure/reference parity
2. desktop visual
3. tablet visual
4. mobile visual
5. TR completeness
6. EN completeness
7. menu/route/link
8. search/filter
9. product/collection correctness
10. media fidelity
11. AI answer grounding / hallucination tests
12. RFQ
13. accessibility
14. performance
15. SEO/schema/hreflang
16. security
17. admin edit + publish + rollback
18. cross-device persistence
19. browser regression
20. final content/legal review

Production is not considered done until all gates pass.

## Current implementation note — 2026-09-22
- Existing project: OSKA Staging Hub / GitHub repo alioskaa26-lang/oska-web
- Existing visual editor already has early controls but production persistence must be upgraded from browser-local storage to central storage.
- Existing language implementation still contains hard-coded bilingual branches; it must be consolidated.
- Existing Digital Guide is not yet a live grounded AI concierge.
- New safe working branch: oska-web-cms-i18n-20260922
- Do not break the current published staging while the CMS/i18n/AI work is under QA.


## Differentiators beyond the reference site
These are additive features that must not disturb the reference site's familiar page flow:

### 1. Buyer Room / shareable board
- Buyer can build a shortlist across collections.
- Generate a shareable buyer-board link with selected products, notes and target material/finish.
- Optional private/gated collection access for selected B2B buyers.
- Export a clean line-sheet/PDF later from the same data source.
- Convert the board directly into RFQ / sample request.

### 2. Multimodal AI concierge
- Text + optional image/reference upload.
- Buyer can upload a screenshot/reference and ask for the nearest OSKA product family or private-label development route.
- AI may search only approved OSKA catalog/content for factual product answers.
- It can propose a curated collection brief (example: 12-piece men's sterling-silver assortment), but every generated proposal remains a draft until human approval.
- AI conversation follows the site's current locale without mixed-language UI.

### 3. Visual search
- Search by uploaded product/reference image where rights and privacy allow.
- Return visually related OSKA products/collections and a private-label path rather than pretending an unverified match is exact.

### 4. Product-truth + campaign-truth separation
Every media asset is tagged:
- EXACT PRODUCT: geometry/material/stone placement must match the actual product.
- EDITORIAL: artistic campaign interpretation; cannot be used as technical product proof.
- CONCEPT: not yet approved for manufacturing.
This distinction is visible in admin and used by AI grounding.

### 5. Rights / provenance ledger
For every purchased/generated asset:
- source
- license
- purchase/reference id
- allowed commercial usage
- model/CAD origin
- derivative/redesign status
- approval status
This is mandatory before public publish.

### 6. Product data single source of truth
Central product records feed PLP, PDP, search, AI, RFQ, SEO and translations. No duplicate product facts hard-coded in separate components.

### 7. Content completeness score
Admin flags missing:
- TR
- EN
- hero/media
- alt text
- product code
- collection
- material/finish
- story
- SEO title/description
- rights/provenance
Incomplete records can stay draft but cannot silently appear as finished public content.

### 8. Visual-regression reference lab
Automated screenshots at desktop/tablet/mobile for:
- header/mega menus
- hero
- home sections
- Women/Men
- collection pages
- PLP
- PDP
- search
- RFQ
- footer
Compare every build against the approved visual baseline; fail QA on unintended drift.

### 9. B2B smart inquiry basket
Shortlist is not a retail cart. It stores:
- product references
- requested material/finish
- quantity direction
- buyer note
- sample yes/no
- customization/private-label interest
Then sends one structured RFQ.

### 10. Fit / size intelligence
- ring-size guide
- bracelet/wrist fit guide
- necklace length visualization
- dimensions in localized units where needed
- AI explains fit only from verified product dimensions

### 11. Region layer separate from language
Language and market are separate concepts. A user can use English in Türkiye or Arabic in Qatar later without corrupting content architecture.

### 12. Failure-proof publishing
- draft -> preview -> QA -> publish
- rollback
- media fallback
- broken-link checker
- missing-translation gate
- schema validator
- no publish when required product-truth or rights fields are missing
