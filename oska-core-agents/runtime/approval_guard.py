from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Mapping

from .oska_agents import classify_action


@dataclass(frozen=True)
class ApprovalDecision:
    allowed: bool
    risk_class: str
    reason: str
    approval_id: str | None = None


def _parse_utc(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def evaluate_action(
    action: str,
    *,
    approval: Mapping[str, Any] | None = None,
    reversible: bool = False,
    audited: bool = False,
    history_retained: bool = False,
    now: datetime | None = None,
) -> ApprovalDecision:
    """Deterministic side-effect gate.

    T0/T1 are allowed. T2 is allowed only when the action classifier itself
    proves the reversible/audited conditions. T3 is blocked unless a valid,
    unexpired, action-bound human approval record is supplied.
    """
    risk = classify_action(
        action,
        reversible=reversible,
        audited=audited,
        history_retained=history_retained,
    )

    if risk in {"T0", "T1", "T2"}:
        return ApprovalDecision(True, risk, "policy_allows_without_t3_approval")

    if not approval:
        return ApprovalDecision(False, "T3", "missing_human_approval")

    required = {"approval_id", "status", "action", "signer", "expires_at"}
    if not required.issubset(approval):
        return ApprovalDecision(False, "T3", "incomplete_human_approval")

    if approval["status"] != "APPROVED":
        return ApprovalDecision(False, "T3", "approval_not_approved")

    if approval["action"] != action:
        return ApprovalDecision(False, "T3", "approval_action_mismatch")

    if not str(approval["signer"]).strip():
        return ApprovalDecision(False, "T3", "missing_approval_signer")

    current = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    try:
        expires_at = _parse_utc(str(approval["expires_at"]))
    except (TypeError, ValueError):
        return ApprovalDecision(False, "T3", "invalid_approval_expiry")

    if expires_at <= current:
        return ApprovalDecision(False, "T3", "approval_expired")

    return ApprovalDecision(
        True,
        "T3",
        "valid_human_approval",
        approval_id=str(approval["approval_id"]),
    )
