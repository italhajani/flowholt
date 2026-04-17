"""
Identity router — authentication, session, workspaces, and workspace members.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from ..auth import create_session_token, hash_password, verify_password
from ..config import get_settings
from ..deps import get_session_context, record_audit_event, require_workspace_role
from ..models import (
    AuthDevLoginRequest,
    AuthLoginRequest,
    AuthSessionTokenResponse,
    AuthSignupRequest,
    SessionResponse,
    WorkspaceMemberInviteRequest,
    WorkspaceMemberSummary,
    WorkspaceMemberUpdateRequest,
    WorkspaceSettingsResponse,
    WorkspaceSettingsUpdate,
    WorkspaceSummary,
)
from ..repository import (
    complete_invited_user_signup,
    create_user_with_workspace,
    get_user_by_email,
    get_workspace_settings,
    invite_workspace_member,
    list_user_workspaces,
    list_workspace_members,
    remove_workspace_member,
    resolve_session,
    update_workspace_member_role,
    update_workspace_settings,
)

settings = get_settings()
router = APIRouter()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@router.post(f"{settings.api_prefix}/auth/dev-login", response_model=AuthSessionTokenResponse)
def post_dev_login(payload: AuthDevLoginRequest) -> AuthSessionTokenResponse:
    if not settings.allow_dev_login:
        raise HTTPException(status_code=403, detail="Dev login is disabled")

    session = resolve_session(user_id=payload.user_id, workspace_id=payload.workspace_id)
    if session is None:
        raise HTTPException(status_code=404, detail="User or workspace membership not found")

    token, expires_at = create_session_token(
        user_id=str(session["user"]["id"]),
        workspace_id=str(session["workspace"]["id"]),
        role=str(session["workspace"]["role"]),
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="auth.dev_login",
        target_type="session",
        target_id=str(session["user"]["id"]),
        status="success",
        details={"workspace_id": session["workspace"]["id"], "role": session["workspace"]["role"]},
    )
    return AuthSessionTokenResponse(
        access_token=token,
        expires_at=expires_at,
        session=SessionResponse.model_validate(session),
    )


@router.post(f"{settings.api_prefix}/auth/signup", response_model=AuthSessionTokenResponse, status_code=201)
def post_signup(payload: AuthSignupRequest) -> AuthSessionTokenResponse:
    email = payload.email.strip().lower()
    existing = get_user_by_email(email)
    if existing is not None:
        if existing.get("password_hash"):
            raise HTTPException(status_code=409, detail="An account with this email already exists")

        pw_hash = hash_password(payload.password)
        session = complete_invited_user_signup(
            name=payload.name.strip(),
            email=email,
            password_hash=pw_hash,
        )
        if session is None:
            raise HTTPException(status_code=500, detail="Failed to activate invited account")

        token, expires_at = create_session_token(
            user_id=str(session["user"]["id"]),
            workspace_id=str(session["workspace"]["id"]),
            role=str(session["workspace"]["role"]),
        )
        return AuthSessionTokenResponse(
            access_token=token,
            expires_at=expires_at,
            session=SessionResponse.model_validate(session),
        )

    pw_hash = hash_password(payload.password)
    session = create_user_with_workspace(
        name=payload.name.strip(),
        email=email,
        password_hash=pw_hash,
    )
    if session is None:
        raise HTTPException(status_code=500, detail="Failed to create account")

    token, expires_at = create_session_token(
        user_id=str(session["user"]["id"]),
        workspace_id=str(session["workspace"]["id"]),
        role=str(session["workspace"]["role"]),
    )
    return AuthSessionTokenResponse(
        access_token=token,
        expires_at=expires_at,
        session=SessionResponse.model_validate(session),
    )


@router.post(f"{settings.api_prefix}/auth/login", response_model=AuthSessionTokenResponse)
def post_login(payload: AuthLoginRequest) -> AuthSessionTokenResponse:
    email = payload.email.strip().lower()
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored_hash = user.get("password_hash")
    if not stored_hash or not verify_password(payload.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    session = resolve_session(user_id=str(user["id"]))
    if session is None:
        raise HTTPException(status_code=401, detail="No active workspace found for this account")

    token, expires_at = create_session_token(
        user_id=str(session["user"]["id"]),
        workspace_id=str(session["workspace"]["id"]),
        role=str(session["workspace"]["role"]),
    )
    return AuthSessionTokenResponse(
        access_token=token,
        expires_at=expires_at,
        session=SessionResponse.model_validate(session),
    )


# ---------------------------------------------------------------------------
# Session
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/session", response_model=SessionResponse)
def get_session(session: dict[str, Any] = Depends(get_session_context)) -> SessionResponse:
    return SessionResponse.model_validate(session)


# ---------------------------------------------------------------------------
# Workspaces
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/workspaces", response_model=list[WorkspaceSummary])
def get_workspaces(session: dict[str, Any] = Depends(get_session_context)) -> list[WorkspaceSummary]:
    return [
        WorkspaceSummary.model_validate(item)
        for item in list_user_workspaces(str(session["user"]["id"]))
    ]


@router.get(f"{settings.api_prefix}/workspaces/current", response_model=WorkspaceSummary)
def get_current_workspace(session: dict[str, Any] = Depends(get_session_context)) -> WorkspaceSummary:
    return WorkspaceSummary.model_validate(session["workspace"])


def _workspace_settings_to_response(item: dict[str, Any]) -> WorkspaceSettingsResponse:
    return WorkspaceSettingsResponse(
        workspace_id=str(item["workspace_id"]),
        public_base_url=item.get("public_base_url"),
        require_webhook_signature=bool(item.get("require_webhook_signature")),
        webhook_secret_configured=bool(item.get("webhook_signing_secret")),
        staging_min_role=str(item.get("staging_min_role") or "builder"),
        publish_min_role=str(item.get("publish_min_role") or "builder"),
        run_min_role=str(item.get("run_min_role") or "builder"),
        production_asset_min_role=str(item.get("production_asset_min_role") or "admin"),
        allow_public_webhooks=bool(item.get("allow_public_webhooks", True)),
        allow_public_chat_triggers=bool(item.get("allow_public_chat_triggers", True)),
        require_staging_before_production=bool(item.get("require_staging_before_production", False)),
        require_staging_approval=bool(item.get("require_staging_approval", False)),
        require_production_approval=bool(item.get("require_production_approval", False)),
        deployment_approval_min_role=str(item.get("deployment_approval_min_role") or "admin"),
        allow_self_approval=bool(item.get("allow_self_approval", False)),
        timezone=str(item.get("timezone") or "UTC"),
        execution_timeout_seconds=int(item.get("execution_timeout_seconds") or 3600),
        save_execution_data=bool(item.get("save_execution_data", True)),
        save_failed_executions=str(item.get("save_failed_executions") or "all"),
        save_successful_executions=str(item.get("save_successful_executions") or "all"),
        save_manual_executions=bool(item.get("save_manual_executions", True)),
        execution_data_retention_days=int(item.get("execution_data_retention_days") or 14),
        save_execution_progress=bool(item.get("save_execution_progress", False)),
        redact_execution_payloads=bool(item.get("redact_execution_payloads", False)),
        max_concurrent_executions=int(item.get("max_concurrent_executions") or 10),
        log_level=str(item.get("log_level") or "info"),
        email_notifications_enabled=bool(item.get("email_notifications_enabled", False)),
        notify_on_failure=bool(item.get("notify_on_failure", True)),
        notify_on_success=bool(item.get("notify_on_success", False)),
        notify_on_approval_requests=bool(item.get("notify_on_approval_requests", True)),
        updated_at=str(item["updated_at"]),
    )


@router.get(f"{settings.api_prefix}/workspaces/current/settings", response_model=WorkspaceSettingsResponse)
def get_current_workspace_settings(
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkspaceSettingsResponse:
    item = get_workspace_settings(str(session["workspace"]["id"]))
    return _workspace_settings_to_response(item)


@router.put(f"{settings.api_prefix}/workspaces/current/settings", response_model=WorkspaceSettingsResponse)
def put_current_workspace_settings(
    payload: WorkspaceSettingsUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkspaceSettingsResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    current = get_workspace_settings(workspace_id)
    changes = payload.model_dump(exclude_unset=True)
    item = update_workspace_settings(
        workspace_id,
        public_base_url=changes.get("public_base_url", current.get("public_base_url")),
        require_webhook_signature=bool(changes.get("require_webhook_signature", current.get("require_webhook_signature", False))),
        webhook_signing_secret=payload.webhook_signing_secret if "webhook_signing_secret" in changes else None,
        staging_min_role=str(changes.get("staging_min_role", current.get("staging_min_role") or "builder")),
        publish_min_role=str(changes.get("publish_min_role", current.get("publish_min_role") or "builder")),
        run_min_role=str(changes.get("run_min_role", current.get("run_min_role") or "builder")),
        production_asset_min_role=str(changes.get("production_asset_min_role", current.get("production_asset_min_role") or "admin")),
        allow_public_webhooks=bool(changes.get("allow_public_webhooks", current.get("allow_public_webhooks", True))),
        allow_public_chat_triggers=bool(changes.get("allow_public_chat_triggers", current.get("allow_public_chat_triggers", True))),
        require_staging_before_production=bool(changes.get("require_staging_before_production", current.get("require_staging_before_production", False))),
        require_staging_approval=bool(changes.get("require_staging_approval", current.get("require_staging_approval", False))),
        require_production_approval=bool(changes.get("require_production_approval", current.get("require_production_approval", False))),
        deployment_approval_min_role=str(changes.get("deployment_approval_min_role", current.get("deployment_approval_min_role") or "admin")),
        allow_self_approval=bool(changes.get("allow_self_approval", current.get("allow_self_approval", False))),
        timezone=str(changes.get("timezone", current.get("timezone") or "UTC")),
        execution_timeout_seconds=int(changes.get("execution_timeout_seconds", current.get("execution_timeout_seconds") or 3600)),
        save_execution_data=bool(changes.get("save_execution_data", current.get("save_execution_data", True))),
        save_failed_executions=str(changes.get("save_failed_executions", current.get("save_failed_executions") or "all")),
        save_successful_executions=str(changes.get("save_successful_executions", current.get("save_successful_executions") or "all")),
        save_manual_executions=bool(changes.get("save_manual_executions", current.get("save_manual_executions", True))),
        execution_data_retention_days=int(changes.get("execution_data_retention_days", current.get("execution_data_retention_days") or 14)),
        save_execution_progress=bool(changes.get("save_execution_progress", current.get("save_execution_progress", False))),
        redact_execution_payloads=bool(changes.get("redact_execution_payloads", current.get("redact_execution_payloads", False))),
        max_concurrent_executions=int(changes.get("max_concurrent_executions", current.get("max_concurrent_executions") or 10)),
        log_level=str(changes.get("log_level", current.get("log_level") or "info")),
        email_notifications_enabled=bool(changes.get("email_notifications_enabled", current.get("email_notifications_enabled", False))),
        notify_on_failure=bool(changes.get("notify_on_failure", current.get("notify_on_failure", True))),
        notify_on_success=bool(changes.get("notify_on_success", current.get("notify_on_success", False))),
        notify_on_approval_requests=bool(changes.get("notify_on_approval_requests", current.get("notify_on_approval_requests", True))),
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workspace.settings.updated",
        target_type="workspace",
        target_id=workspace_id,
        status="success",
        details={
            "changed_fields": sorted(changes.keys()),
            "public_base_url": item.get("public_base_url"),
            "require_webhook_signature": bool(item.get("require_webhook_signature")),
            "webhook_secret_changed": "webhook_signing_secret" in changes and payload.webhook_signing_secret is not None,
            "staging_min_role": item.get("staging_min_role"),
            "publish_min_role": item.get("publish_min_role"),
            "run_min_role": item.get("run_min_role"),
            "production_asset_min_role": item.get("production_asset_min_role"),
            "allow_public_webhooks": bool(item.get("allow_public_webhooks", True)),
            "allow_public_chat_triggers": bool(item.get("allow_public_chat_triggers", True)),
            "require_staging_before_production": bool(item.get("require_staging_before_production", False)),
            "require_staging_approval": bool(item.get("require_staging_approval", False)),
            "require_production_approval": bool(item.get("require_production_approval", False)),
            "deployment_approval_min_role": item.get("deployment_approval_min_role"),
            "allow_self_approval": bool(item.get("allow_self_approval", False)),
            "save_failed_executions": str(item.get("save_failed_executions") or "all"),
            "save_successful_executions": str(item.get("save_successful_executions") or "all"),
            "save_manual_executions": bool(item.get("save_manual_executions", True)),
            "execution_data_retention_days": int(item.get("execution_data_retention_days") or 14),
            "save_execution_progress": bool(item.get("save_execution_progress", False)),
            "redact_execution_payloads": bool(item.get("redact_execution_payloads", False)),
            "notify_on_approval_requests": bool(item.get("notify_on_approval_requests", True)),
        },
    )
    return _workspace_settings_to_response(item)


# ---------------------------------------------------------------------------
# Workspace members
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/workspaces/current/members", response_model=list[WorkspaceMemberSummary])
def get_current_workspace_members(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkspaceMemberSummary]:
    return [
        WorkspaceMemberSummary.model_validate(item)
        for item in list_workspace_members(str(session["workspace"]["id"]))
    ]


@router.post(f"{settings.api_prefix}/workspaces/current/members/invite", response_model=WorkspaceMemberSummary, status_code=201)
def invite_current_workspace_member(
    payload: WorkspaceMemberInviteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkspaceMemberSummary:
    require_workspace_role(session, "owner", "admin")
    if payload.role == "owner":
        raise HTTPException(status_code=400, detail="Owner role cannot be assigned through invites")

    workspace_id = str(session["workspace"]["id"])
    try:
        member = invite_workspace_member(
            workspace_id=workspace_id,
            email=payload.email,
            role=payload.role,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workspace.member_invited",
        target_type="user",
        target_id=str(member["user_id"]),
        status="success",
        details={"email": member["email"], "role": member["role"], "membership_status": member["status"]},
    )
    return WorkspaceMemberSummary.model_validate(member)


@router.patch(f"{settings.api_prefix}/workspaces/current/members/{{user_id}}", response_model=WorkspaceMemberSummary)
def patch_workspace_member(
    user_id: str,
    payload: WorkspaceMemberUpdateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkspaceMemberSummary:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    current_user_id = str(session["user"]["id"])
    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot change your own role from the workspace settings")
    if payload.role == "owner":
        raise HTTPException(status_code=400, detail="Owner role cannot be assigned from the workspace settings")

    existing_member = next(
        (item for item in list_workspace_members(workspace_id) if str(item["user_id"]) == user_id),
        None,
    )
    if existing_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    if str(existing_member.get("role")) == "owner":
        raise HTTPException(status_code=400, detail="Owner role cannot be changed from the workspace settings")

    updated_member = update_workspace_member_role(
        workspace_id=workspace_id,
        user_id=user_id,
        role=payload.role,
    )
    if updated_member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workspace.member_role_updated",
        target_type="user",
        target_id=user_id,
        status="success",
        details={
            "previous_role": existing_member.get("role"),
            "new_role": updated_member.get("role"),
            "membership_status": updated_member.get("status"),
        },
    )
    return WorkspaceMemberSummary.model_validate(updated_member)


@router.delete(f"{settings.api_prefix}/workspaces/current/members/{{user_id}}")
def delete_workspace_member(
    user_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    current_user_id = str(session["user"]["id"])
    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself from the workspace")

    target_member = next(
        (item for item in list_workspace_members(workspace_id) if str(item["user_id"]) == user_id),
        None,
    )
    if target_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    if str(target_member.get("role")) == "owner":
        raise HTTPException(status_code=400, detail="Owner cannot be removed from the workspace")

    removed = remove_workspace_member(workspace_id, user_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Member not found")

    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workspace.member_invite_cancelled" if str(target_member.get("status")) == "invited" else "workspace.member_removed",
        target_type="user",
        target_id=user_id,
        status="success",
        details={
            "email": target_member.get("email"),
            "role": target_member.get("role"),
            "membership_status": target_member.get("status"),
        },
    )
    return {"removed": True}
