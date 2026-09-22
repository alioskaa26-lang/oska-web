# OSKA Shopify Migration

## Decision
Move OSKA WEB to Shopify Online Store 2.0 as a custom B2B/RFQ theme. Preserve the existing OSKA design system and information architecture. Do not enable cart/checkout in the initial launch.

## Preserve
- Hero video behavior and responsive crop logic
- Women / Men / Collections
- Premium collection rails and editorial rhythm
- PLP / PDP structure
- Search
- Manufacturing
- Private Label
- Contact / RFQ
- EN / TR
- B2B concierge/service band
- Desktop / tablet / mobile behavior
- Existing approved OSKA media; no unapproved hero replacement

## Shopify responsibilities
- Hosting / CDN / TLS
- Product and collection CMS
- Media management
- Theme editor
- Locale framework
- Form / customer data foundation
- Future inventory / account / commerce features if later enabled

## Architecture
Custom Online Store 2.0 Liquid theme under `shopify-theme/`.
JSON templates + reusable sections. No headless layer in phase 1.

## Migration order
1. Connect/create Shopify store.
2. Upload custom theme as unpublished development theme.
3. Build header/navigation/footer and language structure.
4. Map collections/products.
5. Build home/editorial sections.
6. Build collection PLP, product PDP, search.
7. Build Manufacturing / Private Label / Contact-RFQ pages.
8. Attach approved OSKA media.
9. QA at 1280 / 820 / 390 in EN/TR.
10. Publish only after explicit approval. DNS remains untouched until then.
