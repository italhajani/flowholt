"""Cron-like scheduler for workflow triggers.

Supports:
- Interval-based schedules (every N minutes/hours)
- Cron expression schedules (e.g. "0 9 * * 1-5")
- Per-workflow schedule configuration stored in workflow definition trigger config

Runs as an asyncio background task alongside the worker,
checking for scheduled workflows that are due for execution.
"""

from __future__ import annotations

import asyncio
import logging
from calendar import monthrange
from datetime import UTC, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .config import get_settings
from .db import get_db, utc_now
from .repository import (
    create_workflow_job,
    get_trigger_event_by_key,
    create_trigger_event,
    list_workflows_by_trigger,
    dequeue_next_webhook,
    complete_webhook_queue_item,
    get_active_polling_triggers,
    mark_polling_trigger_polled,
    get_due_incomplete_executions,
    advance_incomplete_execution,
    record_workflow_error,
    reset_workflow_errors,
    auto_deactivate_workflow,
)

logger = logging.getLogger("flowholt.scheduler")

_shutdown_event: asyncio.Event | None = None


def _get_shutdown_event() -> asyncio.Event:
    global _shutdown_event
    if _shutdown_event is None:
        _shutdown_event = asyncio.Event()
    return _shutdown_event


def request_shutdown() -> None:
    event = _get_shutdown_event()
    event.set()


def parse_cron_field(field: str, min_val: int, max_val: int) -> set[int]:
    """Parse a single cron field into a set of matching values."""
    values: set[int] = set()
    for part in field.split(","):
        part = part.strip()
        if part == "*":
            values.update(range(min_val, max_val + 1))
        elif "/" in part:
            base, step_str = part.split("/", 1)
            step = int(step_str)
            start = min_val if base == "*" else int(base)
            values.update(range(start, max_val + 1, step))
        elif "-" in part:
            lo, hi = part.split("-", 1)
            values.update(range(int(lo), int(hi) + 1))
        else:
            values.add(int(part))
    return values


def matches_cron(cron_expr: str, dt: datetime) -> bool:
    """Check if a datetime matches a cron expression (minute hour day month dow)."""
    parts = cron_expr.strip().split()
    if len(parts) != 5:
        return False

    minute_field, hour_field, day_field, month_field, dow_field = parts

    minute_vals = parse_cron_field(minute_field, 0, 59)
    hour_vals = parse_cron_field(hour_field, 0, 23)
    day_vals = parse_cron_field(day_field, 1, 31)
    month_vals = parse_cron_field(month_field, 1, 12)
    dow_vals = parse_cron_field(dow_field, 0, 7)
    if 7 in dow_vals:
        dow_vals.discard(7)
        dow_vals.add(0)

    cron_weekday = (dt.weekday() + 1) % 7

    return (
        dt.minute in minute_vals
        and dt.hour in hour_vals
        and dt.day in day_vals
        and dt.month in month_vals
        and cron_weekday in dow_vals
    )


def _get_schedule_trigger_config(workflow: dict[str, Any]) -> dict[str, Any] | None:
    definition = workflow.get("definition_json") or {}
    steps = definition.get("steps", [])
    trigger_step = next((step for step in steps if step.get("type") == "trigger"), None)
    if trigger_step is None:
        return None
    config = trigger_step.get("config") or {}
    if not isinstance(config, dict):
        return None
    return config


def _resolve_schedule_timezone(config: dict[str, Any]) -> ZoneInfo:
    timezone_name = str(config.get("timezone") or "UTC")
    try:
        return ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError:
        return ZoneInfo("UTC")


def _parse_schedule_time(value: Any) -> tuple[int, int]:
    try:
        hour_text, minute_text = str(value or "09:00").split(":", 1)
        hour = max(0, min(23, int(hour_text)))
        minute = max(0, min(59, int(minute_text)))
        return hour, minute
    except (TypeError, ValueError):
        return 9, 0


def _parse_last_run(last_run: Any) -> datetime | None:
    if not last_run:
        return None
    try:
        return datetime.fromisoformat(str(last_run).replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None


def _is_legacy_schedule_due(*, workflow: dict[str, Any], config: dict[str, Any], now: datetime) -> bool:
    schedule_type = str(config.get("schedule_type") or "interval")
    if schedule_type == "cron":
        cron_expr = str(config.get("cron") or "")
        if not cron_expr:
            return False
        return matches_cron(cron_expr, now)

    interval_minutes = int(config.get("interval_minutes", 0) or 0)
    interval_hours = int(config.get("interval_hours", 0) or 0)
    total_minutes = interval_minutes + (interval_hours * 60)
    if total_minutes <= 0:
        total_minutes = 60

    last_run = _parse_last_run(workflow.get("last_run_at"))
    if last_run is None:
        return True
    return now >= last_run + timedelta(minutes=total_minutes)


def _is_daily_schedule_due(*, workflow: dict[str, Any], config: dict[str, Any], now: datetime) -> bool:
    timezone = _resolve_schedule_timezone(config)
    local_now = now.astimezone(timezone)
    hour, minute = _parse_schedule_time(config.get("time"))
    scheduled_at = local_now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if local_now < scheduled_at:
        return False
    last_run = _parse_last_run(workflow.get("last_run_at"))
    if last_run is None:
        return True
    return last_run.astimezone(timezone) < scheduled_at


def _is_weekly_schedule_due(*, workflow: dict[str, Any], config: dict[str, Any], now: datetime) -> bool:
    weekday_map = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6,
    }
    timezone = _resolve_schedule_timezone(config)
    local_now = now.astimezone(timezone)
    target_weekday = weekday_map.get(str(config.get("day_of_week") or "monday").lower(), 0)
    if local_now.weekday() != target_weekday:
        return False
    hour, minute = _parse_schedule_time(config.get("time"))
    scheduled_at = local_now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if local_now < scheduled_at:
        return False
    last_run = _parse_last_run(workflow.get("last_run_at"))
    if last_run is None:
        return True
    return last_run.astimezone(timezone) < scheduled_at


def _is_monthly_schedule_due(*, workflow: dict[str, Any], config: dict[str, Any], now: datetime) -> bool:
    timezone = _resolve_schedule_timezone(config)
    local_now = now.astimezone(timezone)
    created_at = _parse_last_run(workflow.get("created_at"))
    configured_day = int(config.get("day_of_month") or 0)
    target_day = configured_day or (created_at.astimezone(timezone).day if created_at else 1)
    target_day = max(1, min(target_day, monthrange(local_now.year, local_now.month)[1]))
    if local_now.day != target_day:
        return False
    hour, minute = _parse_schedule_time(config.get("time"))
    scheduled_at = local_now.replace(day=target_day, hour=hour, minute=minute, second=0, microsecond=0)
    if local_now < scheduled_at:
        return False
    last_run = _parse_last_run(workflow.get("last_run_at"))
    if last_run is None:
        return True
    return last_run.astimezone(timezone) < scheduled_at


def is_workflow_due(workflow: dict[str, Any], now: datetime) -> bool:
    """Check if a scheduled workflow is due for execution based on its trigger config."""
    config = _get_schedule_trigger_config(workflow)
    if config is None:
        return False

    if any(key in config for key in ("schedule_type", "cron", "interval_minutes", "interval_hours")):
        return _is_legacy_schedule_due(workflow=workflow, config=config, now=now)

    frequency = str(config.get("frequency") or "daily")
    timezone = _resolve_schedule_timezone(config)

    if frequency == "cron":
        cron_expr = str(config.get("cron_expression") or config.get("cron") or "")
        if not cron_expr:
            return False
        return matches_cron(cron_expr, now.astimezone(timezone))

    interval_frequencies = {
        "every_minute": 1,
        "every_5_min": 5,
        "every_15_min": 15,
        "every_30_min": 30,
        "hourly": 60,
    }
    if frequency in interval_frequencies:
        last_run = _parse_last_run(workflow.get("last_run_at"))
        if last_run is None:
            return True
        return now >= last_run + timedelta(minutes=interval_frequencies[frequency])

    if frequency == "daily":
        return _is_daily_schedule_due(workflow=workflow, config=config, now=now)
    if frequency == "weekly":
        return _is_weekly_schedule_due(workflow=workflow, config=config, now=now)
    if frequency == "monthly":
        return _is_monthly_schedule_due(workflow=workflow, config=config, now=now)

    last_run = _parse_last_run(workflow.get("last_run_at"))
    if last_run is None:
        return True
    return now >= last_run + timedelta(hours=1)


def check_and_queue_schedules() -> dict[str, Any]:
    """Check all scheduled workflows and queue jobs for ones that are due."""
    now = datetime.now(UTC)
    workflows = list_workflows_by_trigger(trigger_type="schedule", status="active")

    queued_count = 0
    skipped_count = 0
    job_ids: list[str] = []

    for workflow in workflows:
        if not is_workflow_due(workflow, now):
            skipped_count += 1
            continue

        workspace_id = str(workflow.get("workspace_id") or "")
        workflow_id = str(workflow["id"])

        # Deduplication: use a time-bucketed key to avoid double-scheduling
        time_bucket = now.strftime("%Y-%m-%dT%H:%M")
        event_key = f"sched-{workflow_id}-{time_bucket}"

        existing = get_trigger_event_by_key(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            event_key=event_key,
        )
        if existing is not None:
            skipped_count += 1
            continue

        # Record trigger event
        trigger_event = create_trigger_event(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            trigger_type="schedule",
            event_key=event_key,
        )

        # Determine environment
        environment = "production" if workflow.get("published_version_id") else "draft"

        # Queue the job
        job = create_workflow_job(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            workflow_version_id=str(workflow["published_version_id"]) if workflow.get("published_version_id") else None,
            initiated_by_user_id=None,
            environment=environment,
            trigger_type="schedule",
            payload={
                "_trigger_type": "schedule",
                "_trigger_event_id": str(trigger_event["id"]),
                "_scheduled_at": now.isoformat(),
            },
        )
        job_ids.append(job["id"])
        queued_count += 1
        logger.info("Scheduled workflow queued: %s (job %s)", workflow_id, job["id"])

    return {
        "checked": len(workflows),
        "queued": queued_count,
        "skipped": skipped_count,
        "job_ids": job_ids,
    }


async def scheduler_loop(*, check_interval: float = 30.0, max_iterations: int | None = None) -> None:
    """Continuously check for due scheduled workflows.

    Args:
        check_interval: Seconds between schedule checks.
        max_iterations: Stop after this many cycles (None = run forever).
    """
    shutdown = _get_shutdown_event()
    iteration = 0
    logger.info("Scheduler started (check_interval=%.1fs)", check_interval)

    while not shutdown.is_set():
        try:
            result = check_and_queue_schedules()
            if result["queued"] > 0:
                logger.info(
                    "Scheduler: checked=%d queued=%d skipped=%d",
                    result["checked"],
                    result["queued"],
                    result["skipped"],
                )
        except Exception:  # noqa: BLE001
            logger.exception("Scheduler check error")

        # Process webhook queue
        try:
            wq = process_webhook_queue(batch_size=10)
            if wq["processed"] > 0 or wq["failed"] > 0:
                logger.info("Webhook queue: processed=%d failed=%d", wq["processed"], wq["failed"])
        except Exception:  # noqa: BLE001
            logger.exception("Webhook queue processing error")

        # Process polling triggers
        try:
            pt = process_polling_triggers()
            if pt["queued"] > 0:
                logger.info("Polling triggers: queued=%d skipped=%d", pt["queued"], pt["skipped"])
        except Exception:  # noqa: BLE001
            logger.exception("Polling trigger processing error")

        # Process incomplete execution retries
        try:
            ie = process_incomplete_retries()
            if ie["retried"] > 0 or ie["exhausted"] > 0:
                logger.info("Incomplete retries: retried=%d exhausted=%d", ie["retried"], ie["exhausted"])
        except Exception:  # noqa: BLE001
            logger.exception("Incomplete execution retry error")

        # Expire webhooks & purge old delivery logs (every 10th cycle)
        if iteration % 10 == 0:
            try:
                from .repository import deactivate_expired_webhooks, purge_old_deliveries
                exp = deactivate_expired_webhooks()
                if exp > 0:
                    logger.info("Deactivated %d expired webhooks", exp)
                purged = purge_old_deliveries()
                if purged > 0:
                    logger.info("Purged %d old delivery log entries", purged)
            except Exception:  # noqa: BLE001
                logger.exception("Expiration/retention cleanup error")

        iteration += 1
        if max_iterations is not None and iteration >= max_iterations:
            break

        try:
            await asyncio.wait_for(shutdown.wait(), timeout=check_interval)
            break
        except asyncio.TimeoutError:
            continue

    logger.info("Scheduler stopped")


# ── Webhook Queue Processor ──

def process_webhook_queue(*, batch_size: int = 10) -> dict[str, int]:
    """Dequeue pending webhook items and trigger workflow executions."""
    processed = 0
    failed = 0
    for _ in range(batch_size):
        item = dequeue_next_webhook()
        if not item:
            break
        try:
            wh_id = item["webhook_id"]
            from .repository import get_webhook_endpoint, get_workflow
            endpoint = get_webhook_endpoint(wh_id)
            if not endpoint:
                complete_webhook_queue_item(item["id"], success=False, error="Webhook endpoint not found")
                failed += 1
                continue
            workflow_id = endpoint.get("workflow_id")
            if not workflow_id:
                complete_webhook_queue_item(item["id"], success=False, error="No workflow linked")
                failed += 1
                continue
            wf = get_workflow(workflow_id)
            if not wf:
                complete_webhook_queue_item(item["id"], success=False, error="Workflow not found")
                failed += 1
                continue
            import json
            payload = {}
            try:
                payload = json.loads(item.get("payload", "{}"))
            except (json.JSONDecodeError, TypeError):
                pass
            job = create_workflow_job(
                workspace_id=str(wf.get("workspace_id", "")),
                workflow_id=workflow_id,
                workflow_version_id=str(wf["published_version_id"]) if wf.get("published_version_id") else None,
                initiated_by_user_id=None,
                environment="draft",
                trigger_type="webhook",
                payload={"_trigger_type": "webhook", "_delivery_id": item["delivery_id"], **payload},
            )
            complete_webhook_queue_item(item["id"], success=True)
            processed += 1
            logger.debug("Webhook queue item %s → job %s", item["id"], job["id"])
        except Exception as exc:
            complete_webhook_queue_item(item["id"], success=False, error=str(exc))
            failed += 1
            logger.exception("Webhook queue processing error for %s", item["id"])
    return {"processed": processed, "failed": failed}


# ── Polling Trigger Processor ──

def process_polling_triggers() -> dict[str, int]:
    """Check due polling triggers and queue workflow jobs."""
    triggers = get_active_polling_triggers()
    queued = 0
    skipped = 0
    for pt in triggers:
        try:
            from .repository import get_workflow
            wf = get_workflow(pt["workflow_id"])
            if not wf or wf.get("status") == "inactive":
                skipped += 1
                continue
            dedup_key = f"poll-{pt['id']}-{utc_now()[:16]}"
            existing = get_trigger_event_by_key(dedup_key)
            if existing:
                skipped += 1
                continue
            import json
            create_trigger_event(
                workflow_id=pt["workflow_id"],
                trigger_type="polling",
                trigger_config_json=json.dumps({"polling_trigger_id": pt["id"], "url": pt.get("url", "")}),
                idempotency_key=dedup_key,
            )
            job = create_workflow_job(
                workspace_id=str(wf.get("workspace_id", "")),
                workflow_id=pt["workflow_id"],
                workflow_version_id=str(wf["published_version_id"]) if wf.get("published_version_id") else None,
                initiated_by_user_id=None,
                environment="draft",
                trigger_type="polling",
                payload={"_trigger_type": "polling", "_polling_trigger_id": pt["id"], "_url": pt.get("url", "")},
            )
            mark_polling_trigger_polled(pt["id"])
            queued += 1
            logger.info("Polling trigger %s → job %s", pt["id"], job["id"])
        except Exception:
            skipped += 1
            logger.exception("Polling trigger error for %s", pt["id"])
    return {"checked": len(triggers), "queued": queued, "skipped": skipped}


# ── Incomplete Execution Retry ──

def process_incomplete_retries() -> dict[str, int]:
    """Retry due incomplete executions."""
    due = get_due_incomplete_executions()
    retried = 0
    exhausted = 0
    for ie in due:
        try:
            from .repository import get_workflow
            wf = get_workflow(ie["workflow_id"])
            if not wf:
                advance_incomplete_execution(ie["id"], success=False, error_msg="Workflow not found")
                exhausted += 1
                continue
            job = create_workflow_job(
                workspace_id=str(wf.get("workspace_id", "")),
                workflow_id=ie["workflow_id"],
                workflow_version_id=str(wf["published_version_id"]) if wf.get("published_version_id") else None,
                initiated_by_user_id=None,
                environment="draft",
                trigger_type="retry",
                payload={"_trigger_type": "retry", "_incomplete_execution_id": ie["id"], "_original_execution_id": ie["execution_id"]},
            )
            retried += 1
            logger.info("Incomplete execution retry %s → job %s", ie["id"], job["id"])
        except Exception:
            advance_incomplete_execution(ie["id"], success=False, error_msg="Retry failed")
            exhausted += 1
            logger.exception("Incomplete execution retry error for %s", ie["id"])
    return {"due": len(due), "retried": retried, "exhausted": exhausted}


async def start_scheduler() -> asyncio.Task[None]:
    """Start the scheduler as an asyncio background task."""
    task = asyncio.create_task(
        scheduler_loop(check_interval=30.0),
        name="flowholt-scheduler",
    )
    logger.info("In-process scheduler started")
    return task
