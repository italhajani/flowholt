"""Webhook receiver infrastructure for external event-driven workflows.

Provides:
- POST /webhooks/{workspace_id}/{workflow_id} — public webhook endpoint
- Signature verification using workspace webhook_signing_secret
- Automatic deduplication via trigger_events table
- Routes incoming payloads to active webhook-triggered workflows
"""

from __future__ import annotations

import hashlib
import json
import logging
import secrets
from typing import Any

from .config import get_settings
from .db import get_db, row_to_dict, utc_now
from .repository import (
    attach_trigger_event_execution,
    create_trigger_event,
    create_workflow_job,
    get_trigger_event_by_key,
    get_workflow,
    get_workspace_settings,
    list_workflows_by_trigger,
)
from .security import verify_webhook_signature

logger = logging.getLogger("flowholt.webhooks")


def compute_payload_hash(payload: dict[str, Any]) -> str:
    """Deterministic hash of a webhook payload for deduplication."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]


def receive_webhook(
    *,
    workspace_id: str,
    workflow_id: str,
    payload: dict[str, Any],
    headers: dict[str, str],
) -> dict[str, Any]:
    """Process an incoming webhook and enqueue workflow execution.

    Returns a result dict with status, job_id, etc.
    """
    settings = get_settings()

    # Look up the workflow
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        return {"status": "error", "code": "workflow_not_found", "message": "Workflow not found"}

    if str(workflow.get("status")) != "active":
        return {"status": "error", "code": "workflow_inactive", "message": "Workflow is not active"}

    if str(workflow.get("trigger_type")) != "webhook":
        return {"status": "error", "code": "wrong_trigger", "message": "Workflow is not webhook-triggered"}

    # Check workspace settings for signature verification
    ws_settings = get_workspace_settings(workspace_id)
    if ws_settings and ws_settings.get("require_webhook_signature"):
        signing_secret = ws_settings.get("webhook_signing_secret")
        if signing_secret:
            signature = headers.get("x-flowholt-signature", "")
            timestamp = headers.get("x-flowholt-timestamp", "")
            body_bytes = json.dumps(payload, separators=(",", ":"), default=str).encode()

            if not verify_webhook_signature(
                secret=signing_secret,
                timestamp=timestamp,
                signature=signature,
                body=body_bytes,
                tolerance_seconds=settings.webhook_signature_tolerance_seconds,
            ):
                return {"status": "error", "code": "invalid_signature", "message": "Webhook signature verification failed"}

    # Deduplication via trigger_events
    idempotency_key = headers.get("x-idempotency-key", "")
    if not idempotency_key:
        payload_hash = compute_payload_hash(payload)
        idempotency_key = f"wh-{workflow_id}-{payload_hash}"

    existing_event = get_trigger_event_by_key(
        workspace_id=workspace_id,
        workflow_id=workflow_id,
        event_key=idempotency_key,
    )
    if existing_event is not None:
        return {
            "status": "duplicate",
            "code": "already_processed",
            "message": "This webhook event has already been processed",
            "trigger_event_id": existing_event["id"],
            "execution_id": existing_event.get("execution_id"),
        }

    # Record the trigger event
    trigger_event = create_trigger_event(
        workspace_id=workspace_id,
        workflow_id=workflow_id,
        trigger_type="webhook",
        event_key=idempotency_key,
        payload_hash=compute_payload_hash(payload),
    )

    # Enrich payload with webhook metadata
    enriched_payload = {
        **payload,
        "_trigger_type": "webhook",
        "_trigger_event_id": trigger_event["id"],
        "_webhook_received_at": utc_now(),
    }

    # Determine environment — webhook-triggered workflows run against published version
    environment = "production" if workflow.get("published_version_id") else "draft"

    # Queue the job
    job = create_workflow_job(
        workspace_id=workspace_id,
        workflow_id=workflow_id,
        workflow_version_id=str(workflow["published_version_id"]) if workflow.get("published_version_id") else None,
        initiated_by_user_id=None,
        environment=environment,
        trigger_type="webhook",
        payload=enriched_payload,
    )

    # Link trigger event to execution (will be updated when job completes)
    logger.info(
        "Webhook received: workspace=%s workflow=%s job=%s",
        workspace_id,
        workflow_id,
        job["id"],
    )

    return {
        "status": "accepted",
        "code": "queued",
        "message": "Webhook received and queued for processing",
        "job_id": job["id"],
        "trigger_event_id": trigger_event["id"],
    }


def receive_workspace_webhook(
    *,
    workspace_id: str,
    payload: dict[str, Any],
    headers: dict[str, str],
) -> dict[str, Any]:
    """Receive a webhook for all active webhook-triggered workflows in a workspace.

    Useful when external systems send events to a workspace-level endpoint
    and all matching workflows should be triggered.
    """
    workflows = list_workflows_by_trigger(
        trigger_type="webhook",
        status="active",
        workspace_id=workspace_id,
    )

    if not workflows:
        return {
            "status": "no_match",
            "code": "no_active_webhooks",
            "message": "No active webhook-triggered workflows found",
            "triggered_count": 0,
        }

    results = []
    for workflow in workflows:
        result = receive_webhook(
            workspace_id=workspace_id,
            workflow_id=str(workflow["id"]),
            payload=payload,
            headers=headers,
        )
        results.append({"workflow_id": workflow["id"], **result})

    queued = [r for r in results if r.get("status") == "accepted"]
    return {
        "status": "accepted" if queued else "skipped",
        "triggered_count": len(queued),
        "results": results,
    }
