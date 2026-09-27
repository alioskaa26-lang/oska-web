# OSKA Claude Code Instructions

@OSKA_CORE_RULES.md

## Project
- Repository: `alioskaa26-lang/oska-web`
- Stack: TypeScript, React 19, TanStack Start, Vite, Tailwind CSS.
- This repository is part of OSKA's website/staging workflow. Production-impacting publish remains owner-gated.

## Required workflow
1. Inspect relevant files before making claims or edits.
2. Check OSKA rules before changing architecture, navigation, content logic, automation, or deployment behavior.
3. Make the smallest reversible change first.
4. Run the most relevant checks available.
5. Re-read the changed files and verify the exact intended behavior before saying DONE.
6. Keep unrelated code and structure untouched.

## Commands
- Install: `npm i`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`

## OSKA-specific non-negotiables
- Do not publish/deploy to production, change DNS/domain, spend money, or send outbound customer communication without owner approval.
- Do not silently substitute a different product, gender/category, page target, language, or media asset.
- Do not mark a site task complete while a clickable route opens unrelated content.
- Responsive QA must cover desktop, tablet, and mobile for relevant UI changes.
- Preserve current accepted work; repair locally instead of rebuilding unrelated sections.
- If a provider/tool fails or degrades, use the verified failover path rather than looping on the same weak tool.
- Exact write + readback/verification is required before completion claims.

## Topic rules
Claude Code also loads the focused rule files in `.claude/rules/`. Apply the relevant rule set for Web, Lead Engine, Creative/CAD, and Automation/Cloud work.
