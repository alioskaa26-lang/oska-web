# OSKA WEB — Hero / Video Final Integration Plan

## Gate
Stage 5 is green before hero integration:
- lint: PASS
- TypeScript: PASS
- Vite build: PASS
- automated EN/TR route/runtime/overflow/a11y QA: PASS
- exact viewports covered: 1280 / 820 / 390

## Current safe contract
The current safe source intentionally renders one dominant hero region through `Hero` + `hero-safe-media`.
Do not replace, delete, rename, regenerate or recompress any existing OSKA hero/video source until the source of truth is verified.
No second hero, no retail cart/checkout, no production/DNS change.

## Final integration sequence
1. Verify the authoritative existing OSKA hero media files and their ownership/source.
2. Record an immutable manifest before touching the hero:
   - source file/path or asset URL
   - duration
   - dimensions/aspect ratio
   - codec/container
   - file size
   - checksum where available
3. Keep the existing `Hero` copy, CTA routing, EN/TR behavior and single-hero layout contract.
4. Bind the verified media non-destructively:
   - autoplay only when browser policy allows
   - muted inline playback by default
   - pause/play control wired to the real video element
   - poster/fallback image for first paint and failure state
   - `preload="metadata"` unless measured performance justifies another choice
   - no layout shift when media loads
5. Preserve `prefers-reduced-motion`: show a stable poster/fallback instead of forced motion.
6. Use `object-fit: cover` with breakpoint-specific focal-position values; never crop jewelry-critical geometry without review.
7. Do not burn text/logo into the video. UI copy remains semantic HTML above the media.
8. Run the same exact 1280 / 820 / 390 EN/TR suite again plus:
   - autoplay blocked fallback
   - slow connection/poster behavior
   - pause/play keyboard and touch behavior
   - mobile Safari inline playback
   - no CLS/overflow
   - console/network errors
9. Only after the staging result is visually accepted may the hero placeholder note be removed.
10. Production publish/DNS remains a separate explicit approval gate.

## Acceptance
Hero final is accepted only when the verified OSKA source is preserved, the media is visually correct at 1280/820/390, controls are accessible, mobile behavior is stable, and the full Stage 5 QA remains green.
