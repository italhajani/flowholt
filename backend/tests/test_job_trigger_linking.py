from __future__ import annotations

import unittest
from unittest.mock import patch

from backend.app import main, scheduler, worker


class JobTriggerLinkingTests(unittest.TestCase):
    def test_worker_links_trigger_event_on_job_completion(self) -> None:
        job = {
            "id": "job-1",
            "workspace_id": "ws-1",
            "workflow_id": "w-1",
            "workflow_version_id": None,
            "initiated_by_user_id": None,
            "environment": "draft",
            "trigger_type": "webhook",
            "payload_json": {"_trigger_event_id": "te-1"},
        }
        workflow_record = {"id": "w-1", "workspace_id": "ws-1", "definition_json": {"steps": []}}
        execution = type("Execution", (), {"id": "e-1"})()

        with patch.object(worker, "get_workflow", return_value=workflow_record), \
            patch.object(main, "_execute_workflow", return_value=execution), \
            patch.object(worker, "attach_trigger_event_execution") as attach_trigger_event_execution, \
            patch.object(worker, "complete_workflow_job"), \
            patch.object(worker, "create_audit_event"):
            execution_id = worker._process_single_job(job)

        self.assertEqual("e-1", execution_id)
        attach_trigger_event_execution.assert_called_once_with("te-1", execution_id="e-1")

    def test_process_jobs_links_trigger_event_on_completion(self) -> None:
        request = type("Request", (), {"headers": {}})()
        job = {
            "id": "job-1",
            "workspace_id": "ws-1",
            "workflow_id": "w-1",
            "workflow_version_id": None,
            "initiated_by_user_id": None,
            "environment": "draft",
            "trigger_type": "webhook",
            "payload_json": {"_trigger_event_id": "te-2"},
        }
        workflow_record = {"id": "w-1", "workspace_id": "ws-1", "definition_json": {"steps": []}}

        with patch.object(main, "claim_pending_workflow_jobs", return_value=[job]), \
            patch.object(main, "get_workflow", return_value=workflow_record), \
            patch.object(main, "_execute_workflow", return_value=type("Execution", (), {"id": "e-2"})()), \
            patch.object(main, "attach_trigger_event_execution") as attach_trigger_event_execution, \
            patch.object(main, "complete_workflow_job"), \
            patch.object(main, "record_audit_event"):
            response = main.process_workflow_jobs(request)

        self.assertEqual(1, response.completed_count)
        self.assertEqual(["e-2"], response.execution_ids)
        attach_trigger_event_execution.assert_called_once_with("te-2", execution_id="e-2")

    def test_scheduler_queues_trigger_event_id_in_job_payload(self) -> None:
        workflow_record = {
            "id": "w-1",
            "workspace_id": "ws-1",
            "published_version_id": None,
            "last_run_at": None,
            "definition_json": {
                "steps": [
                    {
                        "type": "trigger",
                        "config": {"source": "schedule", "frequency": "daily", "time": "09:00", "timezone": "UTC"},
                    }
                ]
            },
        }

        with patch.object(scheduler, "list_workflows_by_trigger", return_value=[workflow_record]), \
            patch.object(scheduler, "get_trigger_event_by_key", return_value=None), \
            patch.object(scheduler, "create_trigger_event", return_value={"id": "te-3"}), \
            patch.object(scheduler, "create_workflow_job", return_value={"id": "job-3"}) as create_workflow_job:
            result = scheduler.check_and_queue_schedules()

        self.assertEqual(1, result["queued"])
        payload = create_workflow_job.call_args.kwargs["payload"]
        self.assertEqual("te-3", payload["_trigger_event_id"])


if __name__ == "__main__":
    unittest.main()