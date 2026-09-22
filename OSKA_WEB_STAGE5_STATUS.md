# OSKA WEB — Stage 5 QA continuation

Authoritative upstream staging: `oska-web-safe-staging-8ud231` version `1790039448920`.

This branch preserves that staging source under `safe-staging/` and applies only the next unfinished Stage 5 work:
- visible EN/TR cleanup across PLP/PDP/footer/helper labels
- 390px header density reduction; Favorites moves into the mobile drawer on narrow screens
- search and mobile drawer initial focus, focus containment, Escape close, focus return and body-scroll lock
- responsive footer accordion behavior
- exact 1280 / 820 / 390 automated EN/TR route/overflow/runtime QA harness
- build gate remains lint + typecheck + Vite build

Hero/video source contract is unchanged. No cart/checkout. No production publish or DNS mutation.

Provider blocker: AppDeploy stated its daily deployment budget resets at 2026-09-23T00:00:00Z. Until then, this branch is the safe continuation source and the existing AppDeploy preview remains the last deployed version.
