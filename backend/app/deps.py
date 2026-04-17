"""
Shared FastAPI dependencies and utility functions used across routers and main.py.
"""
from __future__ import annotations

from typing import Any

from fastapi import HTTPException, Request

from .auth import get_supabase_auth_mode, verify_session_token, verify_supabase_token
from .config import get_settings
from .db import get_db
from .repository import (
    count_executions_by_status,
    create_audit_event,
    list_vault_assets,
    list_workspace_members,
    resolve_session,
    resolve_supabase_session,
)

settings = get_settings()


# ---------------------------------------------------------------------------
# Session / auth dependencies
# ---------------------------------------------------------------------------

def get_session_context(request: Request) -> dict[str, Any]:
    authorization = request.headers.get("authorization", "")
    bearer_token = None
    if authorization.lower().startswith("bearer "):
        bearer_token = authorization[7:].strip()

    if bearer_token:
        session = None
        local_error: ValueError | None = None
        supabase_error: ValueError | None = None

        try:
            claims = verify_session_token(bearer_token)
            session = resolve_session(
                user_id=str(claims.get("sub") or ""),
                workspace_id=str(claims.get("workspace_id") or ""),
            )
        except ValueError as exc:
            local_error = exc

        if session is None and get_supabase_auth_mode() != "none":
            try:
                supabase_claims = verify_supabase_token(bearer_token)
                session = resolve_supabase_session(
                    subject=str(supabase_claims.get("sub") or ""),
                    email=str(supabase_claims.get("email") or "") or None,
                    workspace_id=request.headers.get("x-flowholt-workspace-id"),
                )
            except ValueError as exc:
                supabase_error = exc

        if session is None and local_error is not None and supabase_error is None:
            raise HTTPException(status_code=401, detail=str(local_error)) from local_error
        if session is None and supabase_error is not None:
            raise HTTPException(status_code=401, detail=str(supabase_error)) from supabase_error
    else:
        if settings.allow_dev_login:
            session = resolve_session(
                user_id=request.headers.get("x-flowholt-user-id"),
                workspace_id=request.headers.get("x-flowholt-workspace-id"),
            )
        else:
            raise HTTPException(status_code=401, detail="Authorization header required")
    if session is None:
        raise HTTPException(status_code=401, detail="No active session found")
    return session


def get_optional_session_context(request: Request, *, workspace_id: str | None = None) -> dict[str, Any] | None:
    authorization = request.headers.get("authorization", "")
    bearer_token = authorization[7:].strip() if authorization.lower().startswith("bearer ") else None
    session = None

    if bearer_token:
        try:
            claims = verify_session_token(bearer_token)
            session = resolve_session(
                user_id=str(claims.get("sub") or ""),
                workspace_id=str(claims.get("workspace_id") or workspace_id or ""),
            )
        except ValueError:
            session = None

        if session is None and get_supabase_auth_mode() != "none":
            try:
                supabase_claims = verify_supabase_token(bearer_token)
                session = resolve_supabase_session(
                    subject=str(supabase_claims.get("sub") or ""),
                    email=str(supabase_claims.get("email") or "") or None,
                    workspace_id=workspace_id or request.headers.get("x-flowholt-workspace-id"),
                )
            except ValueError:
                session = None
    elif settings.allow_dev_login:
        session = resolve_session(
            user_id=request.headers.get("x-flowholt-user-id"),
            workspace_id=workspace_id or request.headers.get("x-flowholt-workspace-id"),
        )

    return session


# ---------------------------------------------------------------------------
# Role / RBAC helpers
# ---------------------------------------------------------------------------

def require_workspace_role(session: dict[str, Any], *allowed_roles: str) -> None:
    current_role = str(session["workspace"].get("role", "viewer"))
    if current_role not in allowed_roles:
        raise HTTPException(status_code=403, detail="You do not have permission for this action")


def get_role_rank(role: str) -> int:
    return {"viewer": 0, "builder": 1, "admin": 2, "owner": 3}.get(role, 0)


def session_meets_min_role(session: dict[str, Any], min_role: str) -> bool:
    return get_role_rank(str(session["workspace"].get("role", "viewer"))) >= get_role_rank(min_role)


def _enforce_workspace_concurrency_limit(*, workspace_id: str, workspace_settings: dict[str, Any]) -> None:
    configured_limit = int(workspace_settings.get("max_concurrent_executions") or 0)
    if configured_limit <= 0:
        return
    running_count = count_executions_by_status(workspace_id).get("running", 0)
    if running_count >= configured_limit:
        raise HTTPException(
            status_code=429,
            detail=f"This workspace has reached its execution limit of {configured_limit} concurrent runs.",
        )


# ---------------------------------------------------------------------------
# Audit
# ---------------------------------------------------------------------------

def record_audit_event(
    *,
    session: dict[str, Any] | None,
    workspace_id: str,
    action: str,
    target_type: str,
    target_id: str | None,
    status: str,
    details: dict[str, Any] | None = None,
) -> None:
    actor_user_id = str(session["user"]["id"]) if session else None
    actor_email = str(session["user"]["email"]) if session else None
    create_audit_event(
        workspace_id=workspace_id,
        actor_user_id=actor_user_id,
        actor_email=actor_email,
        action=action,
        target_type=target_type,
        target_id=target_id,
        status=status,
        details=details,
    )


# ---------------------------------------------------------------------------
# Workspace binding context (vault assets + members for node editor)
# ---------------------------------------------------------------------------

def get_workspace_binding_context(workspace_id: str) -> dict[str, list[dict[str, Any]]]:
    assets = list_vault_assets(workspace_id=workspace_id)
    return {
        "connections": [a for a in assets if a["kind"] == "connection"],
        "credentials": [a for a in assets if a["kind"] == "credential"],
        "variables": [a for a in assets if a["kind"] == "variable"],
        "members": list_workspace_members(workspace_id),
    }
