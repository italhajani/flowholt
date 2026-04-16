from __future__ import annotations

import unittest
from unittest.mock import patch

from backend.app import main


class ExecutionRetentionTests(unittest.TestCase):
    def test_record_execution_event_skips_storage_when_progress_disabled(self) -> None:
        with patch.object(main, "create_execution_event") as create_execution_event:
            main.record_execution_event(
                execution_id="e-1",
                workflow_id="w-1",
                workspace_id="ws-1",
                event_type="execution.started",
                persist_progress=False,
            )

        create_execution_event.assert_not_called()

    def test_record_execution_artifacts_skip_storage_when_progress_disabled(self) -> None:
        with patch.object(main, "create_execution_artifact") as create_execution_artifact:
            main.record_execution_artifacts(
                execution_id="e-1",
                workflow_id="w-1",
                workspace_id="ws-1",
                trigger_type="manual",
                payload={},
                step_results=[],
                result={"ok": True},
                error_text=None,
                persist_progress=False,
            )

        create_execution_artifact.assert_not_called()

    def test_helper_skips_manual_history_when_disabled(self) -> None:
        settings = main._workflow_settings_from_definition({
            "steps": [],
            "settings": {"save_manual_executions": False},
        })

        self.assertFalse(
            main._should_persist_execution_history(
                workflow_settings=settings,
                trigger_type="manual",
                status="success",
            )
        )

    def test_helper_keeps_paused_execution_even_when_manual_history_disabled(self) -> None:
        settings = main._workflow_settings_from_definition({
            "steps": [],
            "settings": {"save_manual_executions": False},
        })

        self.assertTrue(
            main._should_persist_execution_history(
                workflow_settings=settings,
                trigger_type="manual",
                status="paused",
            )
        )

    def test_execute_workflow_deletes_success_history_when_disabled(self) -> None:
        workflow = {
            "id": "w-1",
            "workspace_id": "ws-1",
            "name": "Retention flow",
            "trigger_type": "webhook",
            "definition_json": {"steps": [], "settings": {"save_successful_executions": "none"}},
        }
        execution = {
            "id": "e-1",
            "workspace_id": "ws-1",
            "trigger_type": "webhook",
        }
        stored = {
            "id": "e-1",
            "workspace_id": "ws-1",
            "workflow_id": "w-1",
            "workflow_name": "Retention flow",
            "status": "success",
            "trigger_type": "webhook",
            "started_at": "2026-04-08T00:00:00+00:00",
            "finished_at": "2026-04-08T00:00:01+00:00",
            "duration_ms": 12,
            "payload_json": {},
            "steps_json": [],
            "result_json": {"ok": True},
            "error_text": None,
            "initiated_by_user_id": None,
            "workflow_version_id": None,
            "environment": "draft",
        }

        with patch.object(main, "resolve_runtime_definition_for_environment", return_value=(workflow["definition_json"], None)), \
             patch.object(main, "create_execution_record", return_value=execution), \
             patch.object(main, "record_execution_event"), \
             patch.object(main, "record_execution_artifacts"), \
             patch.object(main, "build_vault_runtime_context", return_value={}), \
             patch.object(main, "run_workflow_definition", return_value={"status": "success", "step_results": [], "result": {"ok": True}}), \
             patch.object(main, "finish_execution_record", return_value=dict(stored)), \
             patch.object(main, "touch_workflow_run"), \
             patch.object(main, "create_audit_event"), \
             patch.object(main, "delete_execution_storage") as delete_execution_storage:
            result = main._execute_workflow(workflow, {}, trigger_type="webhook")

        self.assertEqual("success", result.status)
        delete_execution_storage.assert_called_once_with("e-1", workspace_id="ws-1")

    def test_execute_workflow_keeps_paused_manual_execution_until_resume(self) -> None:
        workflow = {
            "id": "w-1",
            "workspace_id": "ws-1",
            "name": "Paused manual flow",
            "trigger_type": "manual",
            "definition_json": {"steps": [], "settings": {"save_manual_executions": False}},
        }
        execution = {
            "id": "e-2",
            "workspace_id": "ws-1",
            "trigger_type": "manual",
        }
        stored = {
            "id": "e-2",
            "workspace_id": "ws-1",
            "workflow_id": "w-1",
            "workflow_name": "Paused manual flow",
            "status": "paused",
            "trigger_type": "manual",
            "started_at": "2026-04-08T00:00:00+00:00",
            "finished_at": "2026-04-08T00:00:01+00:00",
            "duration_ms": 12,
            "payload_json": {},
            "steps_json": [],
            "result_json": None,
            "error_text": None,
            "initiated_by_user_id": None,
            "workflow_version_id": None,
            "environment": "draft",
        }
        outcome = {
            "status": "paused",
            "step_results": [],
            "result": None,
            "pause": {
                "step_id": "s-1",
                "step_name": "Wait for approval",
                "wait_type": "delay",
                "resume_after": None,
                "metadata": {},
            },
            "state": {},
        }

        with patch.object(main, "resolve_runtime_definition_for_environment", return_value=(workflow["definition_json"], None)), \
             patch.object(main, "create_execution_record", return_value=execution), \
             patch.object(main, "record_execution_event"), \
             patch.object(main, "record_execution_artifacts"), \
             patch.object(main, "build_vault_runtime_context", return_value={}), \
             patch.object(main, "run_workflow_definition", return_value=outcome), \
             patch.object(main, "finish_execution_record", return_value=dict(stored)), \
             patch.object(main, "create_execution_pause", return_value={"id": "ep-1"}), \
             patch.object(main, "touch_workflow_run"), \
             patch.object(main, "record_audit_event"), \
             patch.object(main, "create_audit_event"), \
             patch.object(main, "delete_execution_storage") as delete_execution_storage:
            result = main._execute_workflow(workflow, {}, trigger_type="manual")

        self.assertEqual("paused", result.status)
        delete_execution_storage.assert_not_called()

    def test_execute_workflow_skips_progress_storage_when_disabled(self) -> None:
        workflow = {
            "id": "w-1",
            "workspace_id": "ws-1",
            "name": "Minimal history flow",
            "trigger_type": "webhook",
            "definition_json": {"steps": [], "settings": {"save_execution_progress": False}},
        }
        execution = {
            "id": "e-4",
            "workspace_id": "ws-1",
            "trigger_type": "webhook",
        }
        stored = {
            "id": "e-4",
            "workspace_id": "ws-1",
            "workflow_id": "w-1",
            "workflow_name": "Minimal history flow",
            "status": "success",
            "trigger_type": "webhook",
            "started_at": "2026-04-08T00:00:00+00:00",
            "finished_at": "2026-04-08T00:00:01+00:00",
            "duration_ms": 12,
            "payload_json": {},
            "steps_json": [],
            "result_json": {"ok": True},
            "error_text": None,
            "initiated_by_user_id": None,
            "workflow_version_id": None,
            "environment": "draft",
        }

        with patch.object(main, "resolve_runtime_definition_for_environment", return_value=(workflow["definition_json"], None)), \
             patch.object(main, "create_execution_record", return_value=execution), \
             patch.object(main, "create_execution_event") as create_execution_event, \
             patch.object(main, "create_execution_artifact") as create_execution_artifact, \
             patch.object(main, "build_vault_runtime_context", return_value={}), \
             patch.object(main, "run_workflow_definition", return_value={"status": "success", "step_results": [], "result": {"ok": True}}), \
             patch.object(main, "finish_execution_record", return_value=dict(stored)), \
             patch.object(main, "touch_workflow_run"), \
             patch.object(main, "create_audit_event"), \
             patch.object(main, "delete_execution_storage"):
            result = main._execute_workflow(workflow, {}, trigger_type="webhook")

        self.assertEqual("success", result.status)
        create_execution_event.assert_not_called()
        create_execution_artifact.assert_not_called()

    def test_resume_deletes_failed_history_when_disabled(self) -> None:
        pause = {
            "id": "ep-1",
            "execution_id": "e-3",
            "workflow_id": "w-1",
            "workspace_id": "ws-1",
            "workflow_version_id": None,
            "step_id": "s-1",
            "step_name": "Run risky step",
            "wait_type": "human",
            "status": "paused",
            "state_json": {},
        }
        execution = {
            "id": "e-3",
            "workspace_id": "ws-1",
            "payload_json": {},
            "steps_json": [],
            "duration_ms": 0,
            "trigger_type": "webhook",
            "environment": "draft",
        }
        workflow = {
            "id": "w-1",
            "workspace_id": "ws-1",
            "definition_json": {"steps": [], "settings": {"save_failed_executions": "none"}},
        }
        stored = {
            "id": "e-3",
            "workspace_id": "ws-1",
            "workflow_id": "w-1",
            "workflow_name": "Retention flow",
            "status": "failed",
            "trigger_type": "webhook",
            "started_at": "2026-04-08T00:00:00+00:00",
            "finished_at": "2026-04-08T00:00:01+00:00",
            "duration_ms": 12,
            "payload_json": {},
            "steps_json": [],
            "result_json": None,
            "error_text": "boom",
            "initiated_by_user_id": None,
            "workflow_version_id": None,
            "environment": "draft",
        }

        with patch.object(main, "get_execution", return_value=execution), \
             patch.object(main, "get_workflow", return_value=workflow), \
             patch.object(main, "build_vault_runtime_context", return_value={}), \
             patch.object(main, "record_execution_event"), \
             patch.object(main, "record_execution_artifacts"), \
             patch.object(main, "run_workflow_definition", side_effect=RuntimeError("boom")), \
             patch.object(main, "finish_execution_record", return_value=dict(stored)), \
             patch.object(main, "update_execution_pause_status"), \
             patch.object(main, "get_human_task_by_pause_id", return_value=None), \
             patch.object(main, "record_audit_event"), \
             patch.object(main, "delete_execution_storage") as delete_execution_storage:
            result = main._resume_paused_execution(pause, resume_payload={}, resume_decision=None, session=None)

        self.assertEqual("failed", result.status)
        delete_execution_storage.assert_called_once_with("e-3", workspace_id="ws-1")

    def test_resume_skips_progress_storage_when_disabled(self) -> None:
        pause = {
            "id": "ep-2",
            "execution_id": "e-5",
            "workflow_id": "w-1",
            "workspace_id": "ws-1",
            "workflow_version_id": None,
            "step_id": "s-1",
            "step_name": "Resume step",
            "wait_type": "human",
            "status": "paused",
            "state_json": {},
        }
        execution = {
            "id": "e-5",
            "workspace_id": "ws-1",
            "payload_json": {},
            "steps_json": [],
            "duration_ms": 0,
            "trigger_type": "webhook",
            "environment": "draft",
        }
        workflow = {
            "id": "w-1",
            "workspace_id": "ws-1",
            "definition_json": {"steps": [], "settings": {"save_execution_progress": False}},
        }
        stored = {
            "id": "e-5",
            "workspace_id": "ws-1",
            "workflow_id": "w-1",
            "workflow_name": "Retention flow",
            "status": "success",
            "trigger_type": "webhook",
            "started_at": "2026-04-08T00:00:00+00:00",
            "finished_at": "2026-04-08T00:00:01+00:00",
            "duration_ms": 12,
            "payload_json": {},
            "steps_json": [],
            "result_json": {"ok": True},
            "error_text": None,
            "initiated_by_user_id": None,
            "workflow_version_id": None,
            "environment": "draft",
        }

        with patch.object(main, "get_execution", return_value=execution), \
             patch.object(main, "get_workflow", return_value=workflow), \
             patch.object(main, "build_vault_runtime_context", return_value={}), \
             patch.object(main, "create_execution_event") as create_execution_event, \
             patch.object(main, "create_execution_artifact") as create_execution_artifact, \
             patch.object(main, "run_workflow_definition", return_value={"status": "success", "step_results": [], "result": {"ok": True}}), \
             patch.object(main, "finish_execution_record", return_value=dict(stored)), \
             patch.object(main, "update_execution_pause_status"), \
             patch.object(main, "get_human_task_by_pause_id", return_value=None), \
             patch.object(main, "record_audit_event"), \
             patch.object(main, "delete_execution_storage"):
            result = main._resume_paused_execution(pause, resume_payload={}, resume_decision=None, session=None)

        self.assertEqual("success", result.status)
        create_execution_event.assert_not_called()
        create_execution_artifact.assert_not_called()


if __name__ == "__main__":
    unittest.main()