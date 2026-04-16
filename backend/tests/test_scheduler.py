from __future__ import annotations

from datetime import UTC, datetime
import unittest
from unittest.mock import patch

from backend.app import main, scheduler


class SchedulerTests(unittest.TestCase):
    def test_daily_schedule_uses_time_and_timezone(self) -> None:
        workflow = {
            "id": "w-1",
            "created_at": "2026-04-01T08:00:00+00:00",
            "last_run_at": None,
            "definition_json": {
                "steps": [
                    {
                        "type": "trigger",
                        "config": {
                            "source": "schedule",
                            "frequency": "daily",
                            "time": "09:00",
                            "timezone": "UTC",
                        },
                    }
                ]
            },
        }

        self.assertFalse(scheduler.is_workflow_due(workflow, datetime(2026, 4, 8, 8, 59, tzinfo=UTC)))
        self.assertTrue(scheduler.is_workflow_due(workflow, datetime(2026, 4, 8, 9, 0, tzinfo=UTC)))

    def test_weekly_schedule_uses_day_and_time(self) -> None:
        workflow = {
            "id": "w-1",
            "created_at": "2026-04-01T08:00:00+00:00",
            "last_run_at": None,
            "definition_json": {
                "steps": [
                    {
                        "type": "trigger",
                        "config": {
                            "source": "schedule",
                            "frequency": "weekly",
                            "day_of_week": "thursday",
                            "time": "09:00",
                            "timezone": "UTC",
                        },
                    }
                ]
            },
        }

        self.assertFalse(scheduler.is_workflow_due(workflow, datetime(2026, 4, 8, 9, 0, tzinfo=UTC)))
        self.assertTrue(scheduler.is_workflow_due(workflow, datetime(2026, 4, 9, 9, 0, tzinfo=UTC)))

    def test_cron_schedule_uses_cron_expression_field(self) -> None:
        workflow = {
            "id": "w-1",
            "created_at": "2026-04-01T08:00:00+00:00",
            "last_run_at": None,
            "definition_json": {
                "steps": [
                    {
                        "type": "trigger",
                        "config": {
                            "source": "schedule",
                            "frequency": "cron",
                            "cron_expression": "0 9 * * 1",
                            "timezone": "UTC",
                        },
                    }
                ]
            },
        }

        self.assertTrue(scheduler.is_workflow_due(workflow, datetime(2026, 4, 13, 9, 0, tzinfo=UTC)))
        self.assertFalse(scheduler.is_workflow_due(workflow, datetime(2026, 4, 13, 9, 1, tzinfo=UTC)))

    def test_legacy_interval_schedule_still_supported(self) -> None:
        workflow = {
            "id": "w-1",
            "last_run_at": "2026-04-08T08:30:00+00:00",
            "definition_json": {
                "steps": [
                    {
                        "type": "trigger",
                        "config": {
                            "schedule_type": "interval",
                            "interval_minutes": 30,
                        },
                    }
                ]
            },
        }

        self.assertFalse(scheduler.is_workflow_due(workflow, datetime(2026, 4, 8, 8, 59, tzinfo=UTC)))
        self.assertTrue(scheduler.is_workflow_due(workflow, datetime(2026, 4, 8, 9, 0, tzinfo=UTC)))

    def test_run_scheduled_workflows_skips_not_due_and_deduplicates(self) -> None:
        request = type("Request", (), {"headers": {}})()
        workflow_due = {
            "id": "w-due",
            "workspace_id": "ws-1",
            "name": "Due flow",
            "published_version_id": None,
            "definition_json": {"steps": [{"type": "trigger", "config": {"source": "schedule", "frequency": "daily"}}]},
        }
        workflow_skip = {
            "id": "w-skip",
            "workspace_id": "ws-1",
            "name": "Skip flow",
            "published_version_id": None,
            "definition_json": {"steps": [{"type": "trigger", "config": {"source": "schedule", "frequency": "daily"}}]},
        }

        with patch.object(main, "list_workflows_by_trigger", return_value=[workflow_due, workflow_skip]), \
             patch.object(main, "is_workflow_due", side_effect=[True, False]), \
             patch.object(main, "get_trigger_event_by_key", return_value=None), \
             patch.object(main, "create_trigger_event", return_value={"id": "te-1"}) as create_trigger_event, \
             patch.object(main, "_execute_workflow", return_value=type("Execution", (), {"id": "e-1"})()) as execute_workflow, \
             patch.object(main, "attach_trigger_event_execution") as attach_trigger_event_execution, \
             patch.object(main, "record_audit_event"):
            response = main.run_scheduled_workflows(request)

        self.assertEqual(1, response.triggered_count)
        self.assertEqual(["e-1"], response.execution_ids)
        self.assertEqual(["w-skip"], response.skipped_workflow_ids)
        create_trigger_event.assert_called_once()
        execute_workflow.assert_called_once()
        attach_trigger_event_execution.assert_called_once_with("te-1", execution_id="e-1")


if __name__ == "__main__":
    unittest.main()