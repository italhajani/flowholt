from __future__ import annotations

import unittest

from backend.app.studio_contracts import validate_workflow_cluster_configuration


class ValidateWorkflowClusterConfigurationTests(unittest.TestCase):
    def test_ai_agent_requires_model_and_tool(self) -> None:
        definition = {
            "steps": [
                {"id": "agent-1", "type": "ai_agent", "name": "Agent", "config": {}},
            ],
            "edges": [],
        }

        issues = validate_workflow_cluster_configuration(definition)
        codes = {issue["code"] for issue in issues}

        self.assertIn("required_cluster_slot_missing", codes)
        self.assertEqual(2, sum(1 for issue in issues if issue["code"] == "required_cluster_slot_missing"))

    def test_valid_ai_agent_cluster_has_no_issues(self) -> None:
        definition = {
            "steps": [
                {"id": "agent-1", "type": "ai_agent", "name": "Agent", "config": {}},
                {
                    "id": "model-1",
                    "type": "ai_chat_model",
                    "name": "Agent Model",
                    "config": {"cluster_parent_id": "agent-1", "cluster_slot": "model"},
                },
                {
                    "id": "tool-1",
                    "type": "ai_tool",
                    "name": "Agent Tool",
                    "config": {"cluster_parent_id": "agent-1", "cluster_slot": "tool"},
                },
            ],
            "edges": [],
        }

        issues = validate_workflow_cluster_configuration(definition)

        self.assertEqual([], issues)

    def test_cluster_slot_mismatch_is_reported(self) -> None:
        definition = {
            "steps": [
                {"id": "agent-1", "type": "ai_agent", "name": "Agent", "config": {}},
                {
                    "id": "memory-1",
                    "type": "ai_memory",
                    "name": "Wrong Slot Memory",
                    "config": {"cluster_parent_id": "agent-1", "cluster_slot": "tool"},
                },
            ],
            "edges": [],
        }

        issues = validate_workflow_cluster_configuration(definition)
        codes = {issue["code"] for issue in issues}

        self.assertIn("cluster_slot_mismatch", codes)

    def test_duplicate_single_slot_is_reported(self) -> None:
        definition = {
            "steps": [
                {"id": "agent-1", "type": "ai_agent", "name": "Agent", "config": {}},
                {
                    "id": "model-1",
                    "type": "ai_chat_model",
                    "name": "Primary Model",
                    "config": {"cluster_parent_id": "agent-1", "cluster_slot": "model"},
                },
                {
                    "id": "model-2",
                    "type": "ai_chat_model",
                    "name": "Secondary Model",
                    "config": {"cluster_parent_id": "agent-1", "cluster_slot": "model"},
                },
                {
                    "id": "tool-1",
                    "type": "ai_tool",
                    "name": "Agent Tool",
                    "config": {"cluster_parent_id": "agent-1", "cluster_slot": "tool"},
                },
            ],
            "edges": [],
        }

        issues = validate_workflow_cluster_configuration(definition)
        codes = {issue["code"] for issue in issues}

        self.assertIn("duplicate_cluster_slot", codes)


if __name__ == "__main__":
    unittest.main()