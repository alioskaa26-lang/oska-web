<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# OSKA Agent Instructions

Canonical cross-agent policy: read `OSKA_CORE_RULES.md` before starting work.

All agents must:
- preserve OSKA MASTER decisions and completed work;
- investigate current files/state before editing;
- use reversible changes and verified failover;
- require successful write plus independent readback before claiming DONE;
- keep payment/spend, domain/DNS, production publish, outbound customer sends, and irreversible actions behind Human Approval;
- avoid duplicate replay/refetch after a completed verified step;
- use evidence, dedup, checkpointing, and exact verification where applicable;
- replace persistently weak providers/agents instead of wasting repeated retries.

Department-specific guidance is under `.claude/rules/`. Non-Claude tools should apply the same intent even if they do not load Claude-specific rule files automatically.
