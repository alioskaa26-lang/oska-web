from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

AGENT_PACK_ROOT = Path(__file__).resolve().parents[1]


def _load_json(name: str) -> Dict[str, Any]:
    with (AGENT_PACK_ROOT / name).open("r", encoding="utf-8") as fh:
        return json.load(fh)


def load_registry() -> Dict[str, Any]:
    return _load_json("agent_registry.json")


def load_policy() -> Dict[str, Any]:
    return _load_json("policy.json")


def _tokens(text: str) -> set[str]:
    return {part.strip(".,:;!?()[]{}").lower() for part in text.split() if part.strip()}


ROUTING_RULES: List[Tuple[str, Tuple[str, ...]]] = [
    ("master_lead_dedup", ("duplicate", "dedup", "mükerrer", "tekilleştir", "merge")),
    ("company_verifier", ("verify company", "şirket doğrula", "contact provenance", "firma gerçek", "company identity")),
    ("lead_qa", ("qa", "sales ready", "uygun mu", "lead quality", "kalite kontrol")),
    ("commerce_intelligence", ("stock", "review", "traffic", "replenishment", "stok", "yorum", "satış sinyali")),
    ("lead_scoring_builder", ("score", "scoring", "puan", "fit score", "uygunluk skoru")),
    ("sales_pack_agent", ("offer", "catalog", "pitch", "teklif", "katalog", "ürün öner")),
    ("account_brief_agent", ("meeting", "call prep", "görüşme", "toplantı", "decision maker")),
    ("sales_ops_close", ("close report", "month end", "weekly close", "kapanış", "tahsilat özeti")),
    ("data_auditor", ("audit", "stale", "broken", "contradiction", "denetim", "eski veri", "hatalı mail")),
    ("market_scout", ("discover", "research", "market", "marketplace", "bul", "araştır", "müşteri", "aday"))
]


def route_task(task: str) -> str:
    """Deterministic first-pass router.

    The model-router may refine execution later, but this function ensures
    orchestration never depends solely on a model deciding its own privileges.
    """
    lower = task.lower()
    task_tokens = _tokens(task)

    for agent_id, phrases in ROUTING_RULES:
        for phrase in phrases:
            if " " in phrase:
                if phrase in lower:
                    return agent_id
            elif phrase in task_tokens:
                return agent_id

    return "market_scout"


def classify_action(action: str, *, reversible: bool = False, audited: bool = False, history_retained: bool = False) -> str:
    policy = load_policy()
    if action in set(policy["always_t3_actions"]):
        return "T3"

    if action == "dedup_merge":
        return "T2" if reversible and audited and history_retained else "T3"

    if action == "master_lead_update":
        return "T2" if reversible and audited else "T3"

    if action in {"internal_draft", "internal_score", "internal_report"}:
        return "T1"

    if action in {"web_read", "marketplace_read", "evidence_read"}:
        return "T0"

    # Unknown side effects are conservative by design.
    return "T3"


def requires_human_approval(action: str, **kwargs: Any) -> bool:
    return classify_action(action, **kwargs) == "T3"


def validate_registry(registry: Dict[str, Any] | None = None) -> List[str]:
    registry = registry or load_registry()
    errors: List[str] = []
    agents = registry.get("agents", [])

    ids = [a.get("id") for a in agents]
    if len(ids) != len(set(ids)):
        errors.append("Agent IDs must be unique.")

    if len(agents) != 10:
        errors.append(f"Expected exactly 10 agents, found {len(agents)}.")

    required = {"id", "mission", "required_outputs", "capabilities", "untrusted_external_input", "secrets", "external_write", "default_risk"}

    for agent in agents:
        missing = sorted(required - set(agent))
        if missing:
            errors.append(f"{agent.get('id', '<unknown>')}: missing fields {missing}")

        if agent.get("untrusted_external_input") and agent.get("secrets") and agent.get("external_write"):
            errors.append(
                f"{agent.get('id')}: forbidden capability combination: untrusted external input + secrets + external write."
            )

        if agent.get("external_write"):
            errors.append(f"{agent.get('id')}: external_write must remain false in v1.")

        if agent.get("default_risk") not in {"T0", "T1", "T2", "T3"}:
            errors.append(f"{agent.get('id')}: invalid default_risk.")

    return errors


def assert_registry_valid() -> None:
    errors = validate_registry()
    if errors:
        raise ValueError("\n".join(errors))
