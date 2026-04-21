"""Public-facing endpoints — invites, public forms, public chat agents, and workflow triggers."""

from __future__ import annotations

import json
import time
import uuid
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..deps import get_db
from ..config import get_settings

_settings = get_settings()
PREFIX = _settings.api_prefix

router = APIRouter(tags=["public"])


# ── Models ──────────────────────────────────────────────────────────

class InviteDetail(BaseModel):
    token: str
    workspace_name: str = "FlowHolt Workspace"
    workspace_icon: str = "F"
    inviter_name: str = "Admin"
    inviter_email: str = "admin@flowholt.com"
    inviter_avatar: str = "A"
    role: str = "editor"
    member_count: int = 3
    workflow_count: int = 12
    agent_count: int = 2


class InviteAcceptResponse(BaseModel):
    ok: bool = True


class PublicFormSubmission(BaseModel):
    ok: bool = True
    submission_id: str


class PublicChatRequest(BaseModel):
    message: str
    session_id: str = ""


class PublicChatResponse(BaseModel):
    reply: str
    session_id: str


# ── Invite endpoints ────────────────────────────────────────────────

@router.get(f"{PREFIX}/invites/{{token}}", response_model=InviteDetail)
async def get_invite(token: str):
    db = get_db()
    row = db.execute("SELECT * FROM workspace_invites WHERE token = ?", (token,)).fetchone()
    if row:
        return InviteDetail(
            token=token,
            workspace_name=row["workspace_name"] if "workspace_name" in row.keys() else "FlowHolt Workspace",
            role=row.get("role", "editor") if hasattr(row, "get") else "editor",
        )
    return InviteDetail(token=token)


@router.post(f"{PREFIX}/invites/{{token}}/accept", response_model=InviteAcceptResponse)
async def accept_invite(token: str):
    db = get_db()
    db.execute(
        "UPDATE workspace_invites SET status = 'accepted', accepted_at = ? WHERE token = ?",
        (datetime.utcnow().isoformat(), token),
    )
    db.commit()
    return InviteAcceptResponse(ok=True)


@router.post(f"{PREFIX}/invites/{{token}}/decline", response_model=InviteAcceptResponse)
async def decline_invite(token: str):
    db = get_db()
    db.execute(
        "UPDATE workspace_invites SET status = 'declined' WHERE token = ?",
        (token,),
    )
    db.commit()
    return InviteAcceptResponse(ok=True)


# ── Public form webhook ─────────────────────────────────────────────

@router.post(f"{PREFIX}/public/forms/{{workflow_id}}/submit", response_model=PublicFormSubmission)
async def submit_public_form(workflow_id: str, data: dict):
    db = get_db()
    submission_id = f"sub-{uuid.uuid4().hex[:12]}"
    db.execute(
        """INSERT INTO form_submissions (id, workflow_id, data, created_at)
           VALUES (?, ?, ?, ?)""",
        (submission_id, workflow_id, str(data), datetime.utcnow().isoformat()),
    )
    db.commit()
    return PublicFormSubmission(ok=True, submission_id=submission_id)


# ── Public chat agent ───────────────────────────────────────────────

@router.post(f"{PREFIX}/public/chat/{{agent_id}}", response_model=PublicChatResponse)
async def public_chat(agent_id: str, req: PublicChatRequest):
    session_id = req.session_id or f"sess-{uuid.uuid4().hex[:12]}"

    # Try to use the LLM router if available
    try:
        from ..helpers import llm_router  # type: ignore
        reply = await llm_router.chat(req.message)
    except Exception:
        reply = (
            "Thanks for your message! I can help with workflow automation, "
            "troubleshooting, and product questions. Could you provide more details?"
        )

    return PublicChatResponse(reply=reply, session_id=session_id)


# ── Public Workflow Trigger (no auth) ──────────────────────────────

class TriggerResponse(BaseModel):
    ok: bool
    execution_id: str
    status: str
    outputs: dict[str, Any] = {}
    error: Optional[str] = None


@router.api_route(
    f"{PREFIX}/trigger/{{workflow_id}}",
    methods=["GET", "POST", "PUT", "PATCH"],
    response_model=TriggerResponse,
    summary="Trigger workflow via public URL (no auth)",
)
async def trigger_workflow(workflow_id: str, request: Request) -> TriggerResponse:
    """Public endpoint — anyone with the URL can trigger this workflow.
    Pass JSON body as initial payload; query params are merged in as well.
    Returns execution results synchronously.
    """
    db = get_db()

    # Load workflow
    row = db.execute(
        "SELECT id, name, definition, active FROM workflows WHERE id = ?",
        (workflow_id,),
    ).fetchone()
    if not row:
        raise HTTPException(404, f"Workflow {workflow_id} not found")

    if not row["active"]:
        raise HTTPException(403, "Workflow is not active")

    # Parse payload
    payload: dict[str, Any] = {}
    try:
        body_bytes = await request.body()
        if body_bytes:
            payload = json.loads(body_bytes.decode("utf-8", errors="replace"))
    except Exception:
        payload = {}
    # Merge query params
    payload.update({k: v for k, v in request.query_params.items()})

    # Parse workflow definition
    try:
        definition = json.loads(row["definition"]) if isinstance(row["definition"], str) else row["definition"]
    except Exception:
        raise HTTPException(500, "Workflow definition is invalid JSON")

    # Create execution record
    exec_id = f"exec-{uuid.uuid4().hex[:12]}"
    started = datetime.utcnow().isoformat()
    db.execute(
        """INSERT INTO executions
           (id, workflow_id, workflow_name, status, trigger_type, started_at, payload_json, steps_json)
           VALUES (?, ?, ?, 'running', 'webhook', ?, ?, ?)""",
        (exec_id, workflow_id, row["name"], started, json.dumps(payload), "[]"),
    )
    db.commit()

    # Execute
    from ..executor import run_workflow_definition  # type: ignore
    try:
        t0 = time.time()
        result = run_workflow_definition(definition, payload)
        steps = result.get("step_results", []) if isinstance(result, dict) else []
        elapsed = int((time.time() - t0) * 1000)
        outputs = {s["node_id"]: s.get("output", {}) for s in steps if s.get("node_id")}
        status = result.get("status", "success") if isinstance(result, dict) else "success"
        error_msg = None
    except Exception as exc:
        steps = []
        outputs = {}
        elapsed = 0
        status = "error"
        error_msg = str(exc)

    # Update execution record
    db.execute(
        """UPDATE executions
           SET status = ?, finished_at = ?, duration_ms = ?, steps_json = ?, result_json = ?, error_text = ?
           WHERE id = ?""",
        (
            status,
            datetime.utcnow().isoformat(),
            elapsed,
            json.dumps(steps),
            json.dumps(outputs),
            error_msg,
            exec_id,
        ),
    )
    db.commit()

    return TriggerResponse(ok=status == "success", execution_id=exec_id, status=status, outputs=outputs, error=error_msg)

