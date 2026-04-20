"""Webhook endpoints, delivery logs, and workflow trigger API."""
from __future__ import annotations

import json
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request

from .. import repository as repo
from ..deps import get_session_context, require_workspace_role, record_audit_event

router = APIRouter(prefix="/api", tags=["webhooks"])


# ── Webhook Endpoint CRUD ──

@router.get("/webhooks")
def list_webhooks(
    workflow_id: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    return repo.list_webhook_endpoints(workflow_id)


@router.post("/webhooks", status_code=201)
def create_webhook(
    body: dict[str, Any],
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin", "builder")
    result = repo.create_webhook_endpoint(body)
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="webhook.create",
        target_type="webhook",
        target_id=result.get("id"),
        status="success",
    )
    return result


@router.get("/webhooks/{wh_id}")
def get_webhook(
    wh_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    item = repo.get_webhook_endpoint(wh_id)
    if not item:
        raise HTTPException(404, "Webhook not found")
    return item


@router.patch("/webhooks/{wh_id}")
def update_webhook(
    wh_id: str,
    body: dict[str, Any],
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin", "builder")
    item = repo.update_webhook_endpoint(wh_id, body)
    if not item:
        raise HTTPException(404, "Webhook not found")
    return item


@router.delete("/webhooks/{wh_id}", status_code=204)
def delete_webhook(
    wh_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> None:
    require_workspace_role(session, "owner", "admin")
    if not repo.delete_webhook_endpoint(wh_id):
        raise HTTPException(404, "Webhook not found")


# ── Delivery Logs ──

@router.get("/webhooks/{wh_id}/deliveries")
def list_deliveries(
    wh_id: str,
    limit: int = 50,
    offset: int = 0,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    return repo.list_webhook_deliveries(wh_id, limit=limit, offset=offset)


# ── Workflow Run Trigger (API Trigger) ──

@router.post("/workflows/{workflow_id}/run")
def trigger_workflow_run(
    workflow_id: str,
    request: Request,
    body: dict[str, Any] | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Trigger a workflow execution via API. Like n8n's webhook trigger but explicit."""
    require_workspace_role(session, "owner", "admin", "builder")
    wf = repo.get_workflow(workflow_id)
    if not wf:
        raise HTTPException(404, "Workflow not found")

    start_ms = time.time()
    exec_data = {
        "workflow_id": workflow_id,
        "status": "running",
        "trigger_type": "api",
        "payload_json": json.dumps(body or {}),
    }
    execution = repo.create_execution(exec_data)
    latency = int((time.time() - start_ms) * 1000)

    return {
        "execution_id": execution["id"],
        "workflow_id": workflow_id,
        "status": "running",
        "trigger": "api",
        "latency_ms": latency,
        "input": body or {},
    }


# ── Webhook Receive (incoming payloads) ──

@router.api_route("/webhook/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def receive_webhook(path: str, request: Request) -> dict[str, Any]:
    """Catch-all webhook receiver — logs delivery, enqueues for processing."""
    method = request.method
    headers = dict(request.headers)
    query = dict(request.query_params)
    try:
        raw_body = (await request.body()).decode("utf-8", errors="replace")
    except Exception:
        raw_body = ""

    from .. import repository as _repo
    endpoints = _repo.list_webhook_endpoints()
    target = next((e for e in endpoints if e["path"].strip("/") == path.strip("/") and e.get("method", "POST").upper() == method.upper()), None)

    if not target:
        target = next((e for e in endpoints if e["path"].strip("/") == path.strip("/")), None)

    if not target:
        raise HTTPException(404, f"No webhook registered for /{path}")

    if not target.get("active", True):
        raise HTTPException(410, "Webhook is disabled")

    start = time.time()
    delivery = _repo.record_webhook_delivery({
        "webhook_id": target["id"],
        "method": method,
        "path": f"/{path}",
        "headers": headers,
        "body": raw_body,
        "query_params": query,
        "source_ip": request.client.host if request.client else None,
        "status_code": 200,
        "latency_ms": int((time.time() - start) * 1000),
    })

    _repo.enqueue_webhook(target["id"], delivery["id"], raw_body)

    return {
        "status": "accepted",
        "delivery_id": delivery["id"],
        "webhook_id": target["id"],
        "workflow_id": target.get("workflow_id"),
    }
