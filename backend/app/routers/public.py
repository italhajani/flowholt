"""Public-facing endpoints — invites, public forms, public chat agents."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
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
