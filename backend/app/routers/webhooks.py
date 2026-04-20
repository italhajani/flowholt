"""Webhook endpoints, delivery logs, queue management, and workflow trigger API."""
from __future__ import annotations

import hashlib
import hmac
import json
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, Response

from .. import repository as repo
from ..deps import get_session_context, require_workspace_role, record_audit_event

router = APIRouter(prefix="/api", tags=["webhooks"])

# In-memory sliding window counters for per-webhook rate limiting
_webhook_rate_windows: dict[str, list[float]] = {}

SIGNATURE_TIMESTAMP_WINDOW = 300  # 5 minute window for replay protection


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


# ── Webhook Queue ──

@router.get("/webhooks/queue/items")
def list_queue_items(
    status: str | None = None,
    webhook_id: str | None = None,
    limit: int = 50,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    """List webhook queue items (pending, processing, dead_letter)."""
    return repo.list_webhook_queue(status=status, webhook_id=webhook_id, limit=limit)


@router.post("/webhooks/queue/{q_id}/retry")
def retry_queue_item(
    q_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Reset a dead-lettered or failed queue item for retry."""
    require_workspace_role(session, "owner", "admin", "builder")
    result = repo.retry_webhook_queue_item(q_id)
    if not result:
        raise HTTPException(404, "Queue item not found")
    return result


@router.delete("/webhooks/queue/{q_id}")
def drop_queue_item(
    q_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, str]:
    """Remove a queue item (dead letter) permanently."""
    require_workspace_role(session, "owner", "admin")
    if not repo.delete_webhook_queue_item(q_id):
        raise HTTPException(404, "Queue item not found")
    return {"status": "deleted"}


# ── Polling Triggers ──

@router.get("/polling-triggers")
def list_polling_triggers(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    return repo.list_polling_triggers()


@router.post("/polling-triggers", status_code=201)
def create_polling_trigger(
    body: dict[str, Any],
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin", "builder")
    return repo.create_polling_trigger(body)


@router.patch("/polling-triggers/{trigger_id}")
def update_polling_trigger(
    trigger_id: str,
    body: dict[str, Any],
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin", "builder")
    result = repo.update_polling_trigger(trigger_id, body)
    if not result:
        raise HTTPException(404, "Polling trigger not found")
    return result


@router.delete("/polling-triggers/{trigger_id}", status_code=204)
def delete_polling_trigger(
    trigger_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> None:
    require_workspace_role(session, "owner", "admin")
    if not repo.delete_polling_trigger(trigger_id):
        raise HTTPException(404, "Polling trigger not found")


# ── Internal Event Bus ──

@router.post("/events/emit")
def emit_event(
    body: dict[str, Any],
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Emit an internal event that can trigger listening workflows."""
    require_workspace_role(session, "owner", "admin", "builder")
    return repo.emit_internal_event(body)


@router.get("/events")
def list_events(
    event_type: str | None = None,
    limit: int = 50,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    return repo.list_internal_events(event_type=event_type, limit=limit)


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

# ── Webhook Receive (incoming payloads) ──

@router.post("/webhooks/{wh_id}/test")
def test_webhook(
    wh_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Send a synthetic test delivery to verify webhook setup."""
    require_workspace_role(session, "owner", "admin", "builder")
    result = repo.send_webhook_test(wh_id)
    if "error" in result:
        raise HTTPException(404, result["error"])
    return result


# ── Consecutive Error Tracking ──

@router.get("/workflows/{workflow_id}/errors")
def get_workflow_errors(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    count = repo.get_workflow_error_count(workflow_id)
    return {"workflow_id": workflow_id, "consecutive_errors": count}


@router.post("/workflows/{workflow_id}/errors/reset")
def reset_errors(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, str]:
    require_workspace_role(session, "owner", "admin")
    repo.reset_workflow_errors(workflow_id)
    return {"status": "reset"}


@router.get("/error-tracked-workflows")
def list_error_tracked(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    return repo.list_error_tracked_workflows()


# ── Incomplete Execution Management ──

@router.get("/incomplete-executions")
def list_incomplete_execs(
    workflow_id: str | None = None,
    status: str | None = None,
    limit: int = 50,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    return repo.list_incomplete_executions(workflow_id=workflow_id, status=status, limit=limit)


@router.post("/incomplete-executions/{ie_id}/resolve")
def resolve_incomplete(
    ie_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin", "builder")
    result = repo.resolve_incomplete_execution(ie_id)
    if not result:
        raise HTTPException(404, "Incomplete execution not found")
    return result


@router.delete("/incomplete-executions/{ie_id}", status_code=204)
def delete_incomplete(
    ie_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> None:
    require_workspace_role(session, "owner", "admin")
    if not repo.delete_incomplete_execution(ie_id):
        raise HTTPException(404, "Incomplete execution not found")


# ── API Trigger ── Run workflow via API

@router.post("/workflows/{wf_id}/run")
def api_trigger_workflow(
    wf_id: str,
    body: dict[str, Any] | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Trigger a workflow run via API with optional input data."""
    require_workspace_role(session, "owner", "admin", "builder")
    wf = repo.get_workflow(wf_id)
    if not wf:
        raise HTTPException(404, "Workflow not found")
    input_data = body or {}
    job = repo.create_workflow_job(wf_id, trigger_type="api", input_data=json.dumps(input_data))
    return {"execution_id": job["id"], "workflow_id": wf_id, "status": "queued"}


def _verify_hmac_signature(
    signing_secret: str, raw_body: bytes, headers: dict[str, str],
) -> None:
    """Verify HMAC-SHA256 signature from X-FlowHolt-Signature header."""
    sig_header = headers.get("x-flowholt-signature", "")
    ts_header = headers.get("x-flowholt-timestamp", "")

    if not sig_header:
        raise HTTPException(401, "Missing X-FlowHolt-Signature header")

    # Replay protection
    if ts_header:
        try:
            ts = int(ts_header)
            if abs(time.time() - ts) > SIGNATURE_TIMESTAMP_WINDOW:
                raise HTTPException(401, "Signature timestamp expired")
        except ValueError:
            raise HTTPException(401, "Invalid X-FlowHolt-Timestamp")

    # Build signed payload: "timestamp.body"
    signed_payload = f"{ts_header}.".encode() + raw_body if ts_header else raw_body
    expected = hmac.new(
        signing_secret.encode(), signed_payload, hashlib.sha256
    ).hexdigest()

    # Accept "sha256=<hex>" or plain "<hex>"
    provided = sig_header.removeprefix("sha256=")
    if not hmac.compare_digest(expected, provided):
        raise HTTPException(401, "Invalid webhook signature")


def _check_ip_whitelist(ip_whitelist: str, source_ip: str | None) -> None:
    """Check if source IP is in the whitelist. Raise 403 if not."""
    if not ip_whitelist or not ip_whitelist.strip():
        return
    allowed = [ip.strip() for ip in ip_whitelist.split(",") if ip.strip()]
    if not allowed:
        return
    if not source_ip or source_ip not in allowed:
        raise HTTPException(403, f"IP {source_ip} not in webhook whitelist")


# ── Dead Letter Queue Management ──

@router.get("/webhooks/dead-letters")
def list_dead_letters(
    limit: int = 50,
    offset: int = 0,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict]:
    return repo.list_dead_letters(limit=limit, offset=offset)


@router.post("/webhooks/dead-letters/{queue_id}/replay")
def replay_dead_letter(
    queue_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict:
    result = repo.replay_dead_letter(queue_id)
    if not result:
        raise HTTPException(404, "Dead letter item not found")
    return {"status": "replayed", "queue_id": queue_id}


@router.delete("/webhooks/dead-letters")
def purge_dead_letters(
    session: dict[str, Any] = Depends(get_session_context),
) -> dict:
    count = repo.purge_dead_letters()
    return {"status": "purged", "count": count}


# ── Delivery Log Retention ──

@router.delete("/webhooks/deliveries/old")
def purge_old_deliveries(
    days: int | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict:
    count = repo.purge_old_deliveries(days=days)
    return {"status": "purged", "count": count}


@router.get("/webhooks/retention-info")
def get_retention_info(
    session: dict[str, Any] = Depends(get_session_context),
) -> dict:
    return {"retention_days": repo.WEBHOOK_LOG_RETENTION_DAYS}


@router.api_route("/webhook/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def receive_webhook(path: str, request: Request) -> Any:
    """Catch-all webhook receiver — enforces HMAC, IP whitelist, rate limits, expiration."""
    method = request.method
    headers = {k.lower(): v for k, v in request.headers.items()}
    query = dict(request.query_params)
    source_ip = request.client.host if request.client else None
    try:
        raw_body_bytes = await request.body()
        raw_body = raw_body_bytes.decode("utf-8", errors="replace")
    except Exception:
        raw_body_bytes = b""
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

    # HMAC signature verification
    signing_secret = target.get("signing_secret")
    if signing_secret:
        _verify_hmac_signature(signing_secret, raw_body_bytes, headers)

    # IP whitelist check
    ip_whitelist = target.get("ip_whitelist")
    if ip_whitelist:
        _check_ip_whitelist(ip_whitelist, source_ip)

    # Expiration check
    expires_at = target.get("expires_at")
    if expires_at:
        try:
            exp_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > exp_dt:
                _repo.update_webhook_endpoint(target["id"], {"active": False})
                raise HTTPException(410, "Webhook has expired")
        except (ValueError, TypeError):
            pass

    # Per-webhook rate limiting (sliding window)
    rate_max = target.get("rate_limit_max", 300)
    rate_window = target.get("rate_limit_window_sec", 10)
    wh_id = target["id"]
    now = time.time()
    window = _webhook_rate_windows.setdefault(wh_id, [])
    cutoff = now - rate_window
    _webhook_rate_windows[wh_id] = [t for t in window if t > cutoff]
    if len(_webhook_rate_windows[wh_id]) >= rate_max:
        raise HTTPException(429, f"Rate limit exceeded: {rate_max} requests per {rate_window}s")
    _webhook_rate_windows[wh_id].append(now)

    # Idempotency / dedup check
    idempotency_key = headers.get("idempotency-key") or headers.get("x-idempotency-key")
    if idempotency_key:
        dup = _repo.check_idempotency(target["id"], idempotency_key)
        if dup:
            return {"status": "duplicate", "original_delivery_id": dup["id"], "webhook_id": target["id"]}

    start = time.time()
    delivery = _repo.record_webhook_delivery({
        "webhook_id": target["id"],
        "method": method,
        "path": f"/{path}",
        "headers": headers,
        "body": raw_body,
        "query_params": query,
        "source_ip": source_ip,
        "idempotency_key": idempotency_key,
        "status_code": 200,
        "latency_ms": int((time.time() - start) * 1000),
    })

    _repo.enqueue_webhook(target["id"], delivery["id"], raw_body)

    # Custom response based on respond_mode
    respond_mode = target.get("respond_mode", "immediately")
    if respond_mode == "immediately":
        custom_status = target.get("response_status", 200)
        custom_body = target.get("response_body")
        custom_headers_raw = target.get("response_headers", "{}")
        try:
            custom_headers = json.loads(custom_headers_raw) if isinstance(custom_headers_raw, str) else (custom_headers_raw or {})
        except (json.JSONDecodeError, TypeError):
            custom_headers = {}

        base_response = {
            "status": "accepted",
            "delivery_id": delivery["id"],
            "webhook_id": target["id"],
            "workflow_id": target.get("workflow_id"),
        }

        if custom_body:
            return Response(
                content=custom_body,
                status_code=custom_status,
                headers=custom_headers,
                media_type=custom_headers.get("content-type", "application/json"),
            )
        return JSONResponse(content=base_response, status_code=custom_status, headers=custom_headers)

    # Default: return accepted
    return {
        "status": "accepted",
        "delivery_id": delivery["id"],
        "webhook_id": target["id"],
        "workflow_id": target.get("workflow_id"),
    }
