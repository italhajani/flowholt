"""Background worker that polls the job queue and executes workflows.

Supports two modes:
- **In-process** (dev/SQLite): Runs as an asyncio background task inside the FastAPI app.
- **Standalone** (prod/Postgres): Run as a separate process via `python -m app.worker`.

The worker polls `workflow_jobs` for pending/retryable jobs, claims them with a
lease, executes the workflow, and updates job status — mirroring the same logic
as the `/system/process-jobs` HTTP endpoint but running continuously.
"""

from __future__ import annotations

import asyncio
import logging
import signal
import sys
import time
from typing import Any

from .config import get_settings
from .db import get_db, init_db, row_to_dict, utc_now
from .repository import (
    attach_trigger_event_execution,
    claim_pending_workflow_jobs,
    complete_workflow_job,
    create_audit_event,
    fail_workflow_job,
    get_workflow,
    get_workflow_version,
)

logger = logging.getLogger("flowholt.worker")

_shutdown_event: asyncio.Event | None = None


def _get_shutdown_event() -> asyncio.Event:
    global _shutdown_event
    if _shutdown_event is None:
        _shutdown_event = asyncio.Event()
    return _shutdown_event


def _process_single_job(job: dict[str, Any]) -> str | None:
    """Process one claimed job. Returns execution_id on success, None on failure."""
    # Lazy imports to avoid circular dependency with main.py
    from .main import _execute_workflow, resolve_runtime_definition_for_environment

    workflow = get_workflow(str(job["workflow_id"]))
    if workflow is None:
        fail_workflow_job(str(job["id"]), error_text="Workflow not found for queued job")
        create_audit_event(
            workspace_id=str(job["workspace_id"]),
            actor_user_id=job.get("initiated_by_user_id"),
            actor_email=None,
            action="workflow.job.failed",
            target_type="workflow_job",
            target_id=str(job["id"]),
            status="failed",
            details={"reason": "Workflow not found"},
        )
        return None

    runtime_definition = None
    runtime_version_id = None
    if job.get("workflow_version_id"):
        version = get_workflow_version(
            str(job["workflow_version_id"]),
            workspace_id=str(job["workspace_id"]),
        )
        if version is not None:
            runtime_definition = version["definition_json"]
            runtime_version_id = str(version["id"])

    try:
        execution = _execute_workflow(
            workflow,
            job["payload_json"],
            trigger_type=str(job["trigger_type"]),
            environment=str(job.get("environment") or "draft"),
            initiated_by_user_id=str(job["initiated_by_user_id"]) if job.get("initiated_by_user_id") else None,
            runtime_definition_override=runtime_definition,
            runtime_version_id_override=runtime_version_id,
        )
        trigger_event_id = str(job["payload_json"].get("_trigger_event_id") or "") if isinstance(job.get("payload_json"), dict) else ""
        if trigger_event_id:
            attach_trigger_event_execution(trigger_event_id, execution_id=execution.id)
        complete_workflow_job(str(job["id"]), execution_id=execution.id)
        create_audit_event(
            workspace_id=str(job["workspace_id"]),
            actor_user_id=job.get("initiated_by_user_id"),
            actor_email=None,
            action="workflow.job.completed",
            target_type="workflow_job",
            target_id=str(job["id"]),
            status="success",
            details={
                "execution_id": execution.id,
                "workflow_id": str(job["workflow_id"]),
                "trigger_type": str(job["trigger_type"]),
                "trigger_event_id": trigger_event_id or None,
            },
        )
        return execution.id
    except Exception as exc:  # noqa: BLE001
        fail_workflow_job(str(job["id"]), error_text=str(exc)[:500])
        create_audit_event(
            workspace_id=str(job["workspace_id"]),
            actor_user_id=job.get("initiated_by_user_id"),
            actor_email=None,
            action="workflow.job.failed",
            target_type="workflow_job",
            target_id=str(job["id"]),
            status="failed",
            details={
                "workflow_id": str(job["workflow_id"]),
                "trigger_type": str(job["trigger_type"]),
                "error": str(exc)[:200],
            },
        )
        return None


def poll_and_process(*, batch_size: int = 5) -> dict[str, Any]:
    """Claim and process a batch of pending jobs. Returns summary stats."""
    settings = get_settings()
    claimed = claim_pending_workflow_jobs(
        limit=batch_size,
        lease_seconds=settings.worker_lease_seconds,
    )
    completed = 0
    failed = 0
    execution_ids: list[str] = []

    for job in claimed:
        exec_id = _process_single_job(job)
        if exec_id:
            execution_ids.append(exec_id)
            completed += 1
        else:
            failed += 1

    return {
        "claimed": len(claimed),
        "completed": completed,
        "failed": failed,
        "execution_ids": execution_ids,
    }


async def worker_loop(
    *,
    poll_interval: float = 2.0,
    batch_size: int = 5,
    max_iterations: int | None = None,
) -> None:
    """Continuously poll the job queue until shutdown is signalled.

    Args:
        poll_interval: Seconds between polls when queue is empty.
        batch_size: Max jobs to claim per cycle.
        max_iterations: Stop after this many cycles (None = run forever).
    """
    shutdown = _get_shutdown_event()
    iteration = 0
    logger.info(
        "Worker started (poll_interval=%.1fs, batch_size=%d)",
        poll_interval,
        batch_size,
    )

    while not shutdown.is_set():
        try:
            result = poll_and_process(batch_size=batch_size)
            if result["claimed"] > 0:
                logger.info(
                    "Processed %d jobs: %d completed, %d failed",
                    result["claimed"],
                    result["completed"],
                    result["failed"],
                )
        except Exception:  # noqa: BLE001
            logger.exception("Worker poll cycle error")

        iteration += 1
        if max_iterations is not None and iteration >= max_iterations:
            logger.info("Reached max iterations (%d), shutting down", max_iterations)
            break

        # Wait for poll_interval or until shutdown is signalled
        try:
            await asyncio.wait_for(shutdown.wait(), timeout=poll_interval)
            break  # shutdown was signalled
        except asyncio.TimeoutError:
            continue


async def start_in_process_worker() -> asyncio.Task[None]:
    """Start the worker as an asyncio background task (for dev/SQLite mode)."""
    settings = get_settings()
    poll_interval = 3.0 if settings.app_env == "development" else 2.0
    task = asyncio.create_task(
        worker_loop(poll_interval=poll_interval, batch_size=5),
        name="flowholt-worker",
    )
    logger.info("In-process background worker started")
    return task


def request_shutdown() -> None:
    """Signal the worker loop to stop gracefully."""
    event = _get_shutdown_event()
    event.set()
    logger.info("Worker shutdown requested")


def _handle_signal(signum: int, _frame: Any) -> None:
    logger.info("Received signal %d, requesting shutdown", signum)
    request_shutdown()


def main() -> None:
    """Entry point for standalone worker process: python -m app.worker"""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    )

    settings = get_settings()
    logger.info("FlowHolt Worker starting (env=%s)", settings.app_env)

    # Initialize database
    init_db()

    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    poll_interval = float(settings.worker_lease_seconds) / 20
    poll_interval = max(1.0, min(poll_interval, 5.0))

    asyncio.run(worker_loop(poll_interval=poll_interval, batch_size=10))
    logger.info("Worker shut down cleanly")


if __name__ == "__main__":
    main()
