import importlib.util
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "runtime" / "oska_agents.py"

spec = importlib.util.spec_from_file_location("oska_agents", MODULE)
oska_agents = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules["oska_agents"] = oska_agents
spec.loader.exec_module(oska_agents)


class AgentPackTests(unittest.TestCase):
    def test_registry_has_exactly_ten_agents(self):
        registry = oska_agents.load_registry()
        self.assertEqual(len(registry["agents"]), 10)
        self.assertEqual(len({a["id"] for a in registry["agents"]}), 10)

    def test_registry_invariants(self):
        self.assertEqual(oska_agents.validate_registry(), [])

    def test_no_agent_has_external_write(self):
        for agent in oska_agents.load_registry()["agents"]:
            self.assertFalse(agent["external_write"], agent["id"])

    def test_t3_always_requires_approval(self):
        policy = oska_agents.load_policy()
        for action in policy["always_t3_actions"]:
            self.assertEqual(oska_agents.classify_action(action), "T3")
            self.assertTrue(oska_agents.requires_human_approval(action))

    def test_reversible_dedup_can_be_t2(self):
        self.assertEqual(
            oska_agents.classify_action(
                "dedup_merge",
                reversible=True,
                audited=True,
                history_retained=True,
            ),
            "T2",
        )

    def test_nonreversible_dedup_is_t3(self):
        self.assertEqual(oska_agents.classify_action("dedup_merge"), "T3")

    def test_unknown_side_effect_is_conservative(self):
        self.assertEqual(oska_agents.classify_action("mystery_side_effect"), "T3")

    def test_deterministic_routing(self):
        self.assertEqual(oska_agents.route_task("Türkiye brass marketplace müşteri araştır"), "market_scout")
        self.assertEqual(oska_agents.route_task("mükerrer firmaları tekilleştir"), "master_lead_dedup")
        self.assertEqual(oska_agents.route_task("stok yorum traffic replenishment kontrol"), "commerce_intelligence")
        self.assertEqual(oska_agents.route_task("müşteri için teklif katalog taslağı hazırla"), "sales_pack_agent")


if __name__ == "__main__":
    unittest.main()
