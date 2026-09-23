import importlib.util
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "runtime"

pkg_spec = importlib.util.spec_from_file_location(
    "runtime",
    RUNTIME / "__init__.py",
    submodule_search_locations=[str(RUNTIME)],
)
runtime_pkg = importlib.util.module_from_spec(pkg_spec)
assert pkg_spec.loader is not None
sys.modules["runtime"] = runtime_pkg
pkg_spec.loader.exec_module(runtime_pkg)

guard_spec = importlib.util.spec_from_file_location(
    "runtime.approval_guard",
    RUNTIME / "approval_guard.py",
)
approval_guard = importlib.util.module_from_spec(guard_spec)
assert guard_spec.loader is not None
sys.modules["runtime.approval_guard"] = approval_guard
guard_spec.loader.exec_module(approval_guard)


class ApprovalGuardTests(unittest.TestCase):
    NOW = datetime(2026, 9, 24, 0, 0, tzinfo=timezone.utc)

    def test_t3_is_blocked_without_human_approval(self):
        d = approval_guard.evaluate_action("outbound_send", now=self.NOW)
        self.assertFalse(d.allowed)
        self.assertEqual(d.reason, "missing_human_approval")

    def test_wrong_action_approval_is_blocked(self):
        d = approval_guard.evaluate_action(
            "payment",
            now=self.NOW,
            approval={
                "approval_id": "APR-1",
                "status": "APPROVED",
                "action": "outbound_send",
                "signer": "human",
                "expires_at": "2026-09-25T00:00:00Z",
            },
        )
        self.assertFalse(d.allowed)
        self.assertEqual(d.reason, "approval_action_mismatch")

    def test_expired_approval_is_blocked(self):
        d = approval_guard.evaluate_action(
            "outbound_send",
            now=self.NOW,
            approval={
                "approval_id": "APR-2",
                "status": "APPROVED",
                "action": "outbound_send",
                "signer": "human",
                "expires_at": "2026-09-23T00:00:00Z",
            },
        )
        self.assertFalse(d.allowed)
        self.assertEqual(d.reason, "approval_expired")

    def test_valid_action_bound_approval_allows_t3(self):
        d = approval_guard.evaluate_action(
            "outbound_send",
            now=self.NOW,
            approval={
                "approval_id": "APR-3",
                "status": "APPROVED",
                "action": "outbound_send",
                "signer": "human",
                "expires_at": "2026-09-25T00:00:00Z",
            },
        )
        self.assertTrue(d.allowed)
        self.assertEqual(d.risk_class, "T3")
        self.assertEqual(d.approval_id, "APR-3")

    def test_reversible_audited_dedup_remains_t2(self):
        d = approval_guard.evaluate_action(
            "dedup_merge",
            reversible=True,
            audited=True,
            history_retained=True,
            now=self.NOW,
        )
        self.assertTrue(d.allowed)
        self.assertEqual(d.risk_class, "T2")

    def test_unknown_side_effect_is_t3_and_blocked(self):
        d = approval_guard.evaluate_action("unknown_write", now=self.NOW)
        self.assertFalse(d.allowed)
        self.assertEqual(d.risk_class, "T3")


if __name__ == "__main__":
    unittest.main()
