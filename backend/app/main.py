from __future__ import annotations

import secrets
import time
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .auth import create_session_token, get_supabase_auth_mode, verify_session_token, verify_supabase_token
from .config import get_settings
from .db import get_database_backend, init_db
from .executor import run_workflow_definition
from .models import (
    AuthDevLoginRequest,
    AuthPreflightResponse,
    AuthSessionTokenResponse,
    AuditEventSummary,
    ExecutionEventSummary,
    ExecutionPauseSummary,
    ExecutionSummary,
    HealthResponse,
    HumanTaskCancelRequest,
    HumanTaskCompleteRequest,
    HumanTaskSummary,
    JobProcessResponse,
    ResumeExecutionRequest,
    ResumePausedExecutionsResponse,
    RunWorkflowRequest,
    ScheduledRunResponse,
    SessionResponse,
    SetupReportResponse,
    VaultAssetCreate,
    VaultAssetUpdate,
    VaultConnectionSummary,
    VaultCredentialSummary,
    VaultOverviewResponse,
    VaultVariableSummary,
    TemplateDetail,
    TemplateSummary,
    TriggerDetailsResponse,
    WorkflowCreate,
    WorkflowDetail,
    WorkflowEdge,
    WorkflowFromTemplateRequest,
    WorkflowGenerateRequest,
    WorkflowPublishRequest,
    WorkflowQueueRunRequest,
    WorkspaceMemberSummary,
    WorkspaceSettingsResponse,
    WorkspaceSettingsUpdate,
    WorkspaceSummary,
    WorkflowStep,
    WorkflowUpdate,
    WorkflowVersionCreateRequest,
    WorkflowVersionDetail,
    WorkflowVersionSummary,
    WorkflowJobSummary,
    WorkflowSummary,
)
from .repository import (
    attach_trigger_event_execution,
    build_vault_runtime_context,
    cancel_workflow_job,
    claim_pending_workflow_jobs,
    complete_workflow_job,
    complete_human_task,
    create_audit_event,
    create_execution_event,
    create_trigger_event,
    create_execution_pause,
    create_human_task,
    create_vault_asset,
    create_execution_record,
    create_workflow,
    create_workflow_job,
    create_workflow_version,
    fail_workflow_job,
    finish_execution_record,
    get_published_workflow_version,
    get_execution,
    get_execution_pause,
    get_execution_pause_by_token,
    get_human_task,
    get_human_task_by_pause_id,
    get_template,
    get_trigger_event_by_key,
    get_user_by_email,
    get_workflow,
    get_workflow_version,
    get_workflow_job,
    get_workspace_member_by_role,
    get_workspace_settings,
    list_audit_events,
    list_due_execution_pauses,
    list_execution_events,
    list_executions,
    list_human_tasks,
    list_templates,
    list_user_workspaces,
    list_vault_assets,
    list_workflow_versions,
    list_workflow_jobs,
    list_workflows_by_trigger,
    list_workflows,
    list_workspace_members,
    resolve_supabase_session,
    resolve_session,
    touch_workflow_run,
    cancel_human_task,
    update_execution_pause_status,
    update_workspace_settings,
    update_vault_asset,
    update_workflow,
)
from .security import verify_webhook_signature
from .seeds import seed_data

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_workspace_role(session: dict[str, Any], *allowed_roles: str) -> None:
    current_role = str(session["workspace"].get("role", "viewer"))
    if current_role not in allowed_roles:
        raise HTTPException(status_code=403, detail="You do not have permission for this action")


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


def normalize_execution(item: dict[str, Any]) -> ExecutionSummary:
    normalized = dict(item)
    normalized["steps"] = normalized.pop("steps_json")
    return ExecutionSummary.model_validate(normalized)


def extract_event_key(request: Request, workflow_id: str) -> str | None:
    for header_name in (
        "x-flowholt-idempotency-key",
        "idempotency-key",
        "x-request-id",
        "x-event-id",
    ):
        value = request.headers.get(header_name)
        if value:
            return f"{header_name}:{value.strip()}"
    query_value = request.query_params.get("event_key")
    if query_value:
        return f"query:{query_value.strip()}"
    return None


def build_public_base_url(request: Request | None, workspace_id: str) -> str:
    workspace_settings = get_workspace_settings(workspace_id)
    return str(
        workspace_settings.get("public_base_url")
        or settings.public_base_url
        or (str(request.base_url).rstrip("/") if request is not None else "http://127.0.0.1:8000")
    ).rstrip("/")


def build_execution_pause_response(pause: dict[str, Any], request: Request | None = None) -> ExecutionPauseSummary:
    base_url = build_public_base_url(request, str(pause["workspace_id"]))
    resume_url = f"{base_url}{settings.api_prefix}/executions/resume/{pause['resume_token']}"
    metadata = dict(pause.get("metadata_json") or {})
    if str(pause.get("wait_type")) == "callback":
        metadata.setdefault("callback_url", resume_url)
    return ExecutionPauseSummary(
        id=str(pause["id"]),
        execution_id=str(pause["execution_id"]),
        workflow_id=str(pause["workflow_id"]),
        step_id=str(pause["step_id"]),
        step_name=str(pause["step_name"]),
        wait_type=str(pause["wait_type"]),
        status=str(pause["status"]),
        resume_after=pause.get("resume_after"),
        resume_url=resume_url,
        cancel_url=f"{base_url}{settings.api_prefix}/executions/cancel/{pause['cancel_token']}",
        metadata=metadata,
        created_at=str(pause["created_at"]),
        updated_at=str(pause["updated_at"]),
    )


def record_execution_event(
    *,
    execution_id: str,
    workflow_id: str,
    workspace_id: str,
    event_type: str,
    step_id: str | None = None,
    step_name: str | None = None,
    status: str | None = None,
    message: str | None = None,
    data: dict[str, Any] | None = None,
) -> None:
    create_execution_event(
        execution_id=execution_id,
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        event_type=event_type,
        step_id=step_id,
        step_name=step_name,
        status=status,
        message=message,
        data=data,
    )


def resolve_human_task_assignment(
    *,
    workspace_id: str,
    metadata: dict[str, Any],
) -> tuple[str | None, str | None]:
    assignee_user_id = metadata.get("assignee_user_id")
    assignee_email = metadata.get("assignee_email")
    assignee_role = metadata.get("assignee_role")

    if assignee_user_id:
        return str(assignee_user_id), str(assignee_email) if assignee_email else None
    if assignee_email:
        user = get_user_by_email(str(assignee_email))
        if user is not None:
            return str(user["id"]), str(user["email"])
        return None, str(assignee_email)
    if assignee_role:
        member = get_workspace_member_by_role(workspace_id, str(assignee_role))
        if member is not None:
            return str(member["user_id"]), str(member["email"])
    return None, None


def ensure_task_actor_allowed(task: dict[str, Any], session: dict[str, Any]) -> None:
    current_role = str(session["workspace"].get("role", "viewer"))
    current_user_id = str(session["user"]["id"])
    assigned_user_id = task.get("assigned_to_user_id")
    if assigned_user_id and assigned_user_id != current_user_id and current_role not in {"owner", "admin"}:
        raise HTTPException(status_code=403, detail="This task is assigned to another workspace member")


def compute_task_due_at(metadata: dict[str, Any]) -> str | None:
    if metadata.get("due_at"):
        return str(metadata["due_at"])
    due_hours = metadata.get("due_hours")
    if due_hours is None:
        return None
    return (datetime.now(UTC) + timedelta(hours=int(due_hours))).isoformat()


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
        session = resolve_session(
            user_id=request.headers.get("x-flowholt-user-id"),
            workspace_id=request.headers.get("x-flowholt-workspace-id"),
        )
    if session is None:
        raise HTTPException(status_code=401, detail="No active session found")
    return session


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    seed_data()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        environment=settings.app_env,
        llm_mode=settings.llm_mode,
        database_backend=get_database_backend(),
    )


@app.get(f"{settings.api_prefix}/auth/preflight", response_model=AuthPreflightResponse)
def get_auth_preflight() -> AuthPreflightResponse:
    return AuthPreflightResponse(
        local_dev_login_enabled=settings.allow_dev_login,
        supabase_configured=bool(settings.supabase_url or settings.supabase_jwt_secret),
        supabase_auth_mode=get_supabase_auth_mode(),
        database_backend=get_database_backend(),
    )


@app.get(f"{settings.api_prefix}/system/setup-report", response_model=SetupReportResponse)
def get_setup_report(session: dict[str, Any] = Depends(get_session_context)) -> SetupReportResponse:
    workspace_id = str(session["workspace"]["id"])
    workspace_settings = get_workspace_settings(workspace_id)
    next_actions: list[str] = []

    if not settings.database_url:
        next_actions.append("Add DATABASE_URL to move from local SQLite to hosted Postgres.")
    if not settings.supabase_url:
        next_actions.append("Add SUPABASE_URL so the backend can verify real Supabase tokens.")
    if settings.supabase_url and get_supabase_auth_mode() == "none":
        next_actions.append("Configure SUPABASE_JWT_SECRET or use JWKS mode with installed backend auth dependencies.")
    if not settings.scheduler_secret:
        next_actions.append("Set SCHEDULER_SECRET before exposing scheduled processing online.")
    if not (workspace_settings.get("public_base_url") or settings.public_base_url):
        next_actions.append("Set PUBLIC_BASE_URL or workspace public_base_url before sharing webhook URLs.")
    if not workspace_settings.get("require_webhook_signature"):
        next_actions.append("Enable require_webhook_signature in workspace settings before public webhooks.")
    if workspace_settings.get("require_webhook_signature") and not workspace_settings.get("webhook_signing_secret"):
        next_actions.append("Save a webhook_signing_secret in workspace settings.")

    return SetupReportResponse(
        database_backend=get_database_backend(),
        database_url_configured=bool(settings.database_url),
        supabase_url_configured=bool(settings.supabase_url),
        supabase_auth_mode=get_supabase_auth_mode(),
        scheduler_secret_configured=bool(settings.scheduler_secret),
        public_base_url_configured=bool(workspace_settings.get("public_base_url") or settings.public_base_url),
        webhook_signature_required=bool(workspace_settings.get("require_webhook_signature")),
        workspace_id=workspace_id,
        next_actions=next_actions,
    )


@app.get(f"{settings.api_prefix}/audit-events", response_model=list[AuditEventSummary])
def get_audit_events(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[AuditEventSummary]:
    return [
        AuditEventSummary.model_validate(item)
        for item in list_audit_events(str(session["workspace"]["id"]))
    ]


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/activity", response_model=list[AuditEventSummary])
def get_workflow_activity(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[AuditEventSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return [
        AuditEventSummary.model_validate(item)
        for item in list_audit_events(workspace_id, target_type="workflow", target_id=workflow_id)
    ]


@app.post(f"{settings.api_prefix}/auth/dev-login", response_model=AuthSessionTokenResponse)
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


@app.get(f"{settings.api_prefix}/session", response_model=SessionResponse)
def get_session(session: dict[str, Any] = Depends(get_session_context)) -> SessionResponse:
    return SessionResponse.model_validate(session)


@app.get(f"{settings.api_prefix}/workspaces", response_model=list[WorkspaceSummary])
def get_workspaces(session: dict[str, Any] = Depends(get_session_context)) -> list[WorkspaceSummary]:
    return [
        WorkspaceSummary.model_validate(item)
        for item in list_user_workspaces(str(session["user"]["id"]))
    ]


@app.get(f"{settings.api_prefix}/workspaces/current", response_model=WorkspaceSummary)
def get_current_workspace(session: dict[str, Any] = Depends(get_session_context)) -> WorkspaceSummary:
    return WorkspaceSummary.model_validate(session["workspace"])


@app.get(f"{settings.api_prefix}/workspaces/current/settings", response_model=WorkspaceSettingsResponse)
def get_current_workspace_settings(
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkspaceSettingsResponse:
    item = get_workspace_settings(str(session["workspace"]["id"]))
    return WorkspaceSettingsResponse(
        workspace_id=str(item["workspace_id"]),
        public_base_url=item.get("public_base_url"),
        require_webhook_signature=bool(item.get("require_webhook_signature")),
        webhook_secret_configured=bool(item.get("webhook_signing_secret")),
        updated_at=str(item["updated_at"]),
    )


@app.put(f"{settings.api_prefix}/workspaces/current/settings", response_model=WorkspaceSettingsResponse)
def put_current_workspace_settings(
    payload: WorkspaceSettingsUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkspaceSettingsResponse:
    require_workspace_role(session, "owner", "admin")
    item = update_workspace_settings(
        str(session["workspace"]["id"]),
        public_base_url=payload.public_base_url,
        require_webhook_signature=payload.require_webhook_signature,
        webhook_signing_secret=payload.webhook_signing_secret,
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="workspace.settings.updated",
        target_type="workspace",
        target_id=str(session["workspace"]["id"]),
        status="success",
        details={
            "public_base_url": payload.public_base_url,
            "require_webhook_signature": payload.require_webhook_signature,
            "webhook_secret_changed": payload.webhook_signing_secret is not None,
        },
    )
    return WorkspaceSettingsResponse(
        workspace_id=str(item["workspace_id"]),
        public_base_url=item.get("public_base_url"),
        require_webhook_signature=bool(item.get("require_webhook_signature")),
        webhook_secret_configured=bool(item.get("webhook_signing_secret")),
        updated_at=str(item["updated_at"]),
    )


@app.get(f"{settings.api_prefix}/workspaces/current/members", response_model=list[WorkspaceMemberSummary])
def get_current_workspace_members(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkspaceMemberSummary]:
    return [
        WorkspaceMemberSummary.model_validate(item)
        for item in list_workspace_members(str(session["workspace"]["id"]))
    ]


@app.get(f"{settings.api_prefix}/inbox/tasks", response_model=list[HumanTaskSummary])
def get_inbox_tasks(
    mine: bool = False,
    status: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[HumanTaskSummary]:
    assigned_to_user_id = str(session["user"]["id"]) if mine else None
    return [
        HumanTaskSummary.model_validate(item)
        for item in list_human_tasks(
            str(session["workspace"]["id"]),
            status=status,
            assigned_to_user_id=assigned_to_user_id,
        )
    ]


@app.get(f"{settings.api_prefix}/inbox/tasks/{{task_id}}", response_model=HumanTaskSummary)
def get_inbox_task_detail(
    task_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> HumanTaskSummary:
    task = get_human_task(task_id, workspace_id=str(session["workspace"]["id"]))
    if task is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    return HumanTaskSummary.model_validate(task)


@app.post(f"{settings.api_prefix}/inbox/tasks/{{task_id}}/complete", response_model=ExecutionSummary)
def complete_inbox_task(
    task_id: str,
    payload: HumanTaskCompleteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    task = get_human_task(task_id, workspace_id=str(session["workspace"]["id"]))
    if task is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    if str(task.get("status")) != "open":
        raise HTTPException(status_code=409, detail="Task is not open")
    ensure_task_actor_allowed(task, session)

    completed = complete_human_task(
        task_id,
        decision=payload.decision,
        comment=payload.comment,
        response_payload=payload.payload,
    )
    if completed is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    pause = get_execution_pause(str(task["execution_id"]), workspace_id=str(session["workspace"]["id"]))
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=409, detail="The related execution is no longer paused")
    record_execution_event(
        execution_id=str(task["execution_id"]),
        workflow_id=str(task["workflow_id"]),
        workspace_id=str(session["workspace"]["id"]),
        event_type="human_task.completed",
        step_id=str(task["step_id"]),
        step_name=str(task["step_name"]),
        status="completed",
        message=f"Human task completed for {task['step_name']}",
        data={"task_id": task_id, "decision": payload.decision, "comment": payload.comment, "payload": payload.payload},
    )

    execution = _resume_paused_execution(
        pause,
        resume_payload=payload.payload,
        resume_decision=payload.decision,
        session=session,
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="human_task.completed",
        target_type="human_task",
        target_id=task_id,
        status="success",
        details={"decision": payload.decision, "execution_id": task["execution_id"]},
    )
    return execution


@app.post(f"{settings.api_prefix}/inbox/tasks/{{task_id}}/cancel", response_model=ExecutionSummary)
def cancel_inbox_task(
    task_id: str,
    payload: HumanTaskCancelRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    task = get_human_task(task_id, workspace_id=str(session["workspace"]["id"]))
    if task is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    if str(task.get("status")) != "open":
        raise HTTPException(status_code=409, detail="Task is not open")
    ensure_task_actor_allowed(task, session)
    cancelled = cancel_human_task(task_id, comment=payload.comment)
    if cancelled is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    pause = get_execution_pause(str(task["execution_id"]), workspace_id=str(session["workspace"]["id"]))
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=409, detail="The related execution is no longer paused")
    record_execution_event(
        execution_id=str(task["execution_id"]),
        workflow_id=str(task["workflow_id"]),
        workspace_id=str(session["workspace"]["id"]),
        event_type="human_task.cancelled",
        step_id=str(task["step_id"]),
        step_name=str(task["step_name"]),
        status="cancelled",
        message=f"Human task cancelled for {task['step_name']}",
        data={"task_id": task_id, "comment": payload.comment},
    )
    execution = _cancel_paused_execution(pause, session=session)
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="human_task.cancelled",
        target_type="human_task",
        target_id=task_id,
        status="success",
        details={"execution_id": task["execution_id"]},
    )
    return execution


@app.get(f"{settings.api_prefix}/templates", response_model=list[TemplateSummary])
def get_templates(session: dict[str, Any] = Depends(get_session_context)) -> list[TemplateSummary]:
    return [
        TemplateSummary.model_validate(item)
        for item in list_templates(workspace_id=str(session["workspace"]["id"]))
    ]


@app.get(f"{settings.api_prefix}/templates/{{template_id}}", response_model=TemplateDetail)
def get_template_detail(template_id: str, session: dict[str, Any] = Depends(get_session_context)) -> TemplateDetail:
    template = get_template(template_id, workspace_id=str(session["workspace"]["id"]))
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateDetail.model_validate(template)


@app.get(f"{settings.api_prefix}/workflows", response_model=list[WorkflowSummary])
def get_workflows(session: dict[str, Any] = Depends(get_session_context)) -> list[WorkflowSummary]:
    return [
        WorkflowSummary.model_validate(item)
        for item in list_workflows(workspace_id=str(session["workspace"]["id"]))
    ]


@app.get(f"{settings.api_prefix}/vault", response_model=VaultOverviewResponse)
def get_vault_overview(session: dict[str, Any] = Depends(get_session_context)) -> VaultOverviewResponse:
    workspace_id = str(session["workspace"]["id"])
    connections = [
        VaultConnectionSummary.model_validate(item)
        for item in list_vault_assets(kind="connection", workspace_id=workspace_id)
    ]
    credentials = [
        VaultCredentialSummary.model_validate(item)
        for item in list_vault_assets(kind="credential", workspace_id=workspace_id)
    ]
    variables = [
        VaultVariableSummary.model_validate(item)
        for item in list_vault_assets(kind="variable", workspace_id=workspace_id)
    ]
    return VaultOverviewResponse(
        connections=connections,
        credentials=credentials,
        variables=variables,
    )


@app.get(f"{settings.api_prefix}/vault/connections", response_model=list[VaultConnectionSummary])
def get_vault_connections(session: dict[str, Any] = Depends(get_session_context)) -> list[VaultConnectionSummary]:
    return [
        VaultConnectionSummary.model_validate(item)
        for item in list_vault_assets(kind="connection", workspace_id=str(session["workspace"]["id"]))
    ]


@app.get(f"{settings.api_prefix}/vault/credentials", response_model=list[VaultCredentialSummary])
def get_vault_credentials(session: dict[str, Any] = Depends(get_session_context)) -> list[VaultCredentialSummary]:
    return [
        VaultCredentialSummary.model_validate(item)
        for item in list_vault_assets(kind="credential", workspace_id=str(session["workspace"]["id"]))
    ]


@app.get(f"{settings.api_prefix}/vault/variables", response_model=list[VaultVariableSummary])
def get_vault_variables(session: dict[str, Any] = Depends(get_session_context)) -> list[VaultVariableSummary]:
    return [
        VaultVariableSummary.model_validate(item)
        for item in list_vault_assets(kind="variable", workspace_id=str(session["workspace"]["id"]))
    ]


@app.post(f"{settings.api_prefix}/vault/assets", status_code=201)
def post_vault_asset(
    payload: VaultAssetCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, object]:
    require_workspace_role(session, "owner", "admin")
    asset = create_vault_asset(
        payload,
        workspace_id=str(session["workspace"]["id"]),
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="vault.asset.created",
        target_type="vault_asset",
        target_id=str(asset["id"]),
        status="success",
        details={"kind": payload.kind, "name": payload.name},
    )
    return asset


@app.put(f"{settings.api_prefix}/vault/assets/{{asset_id}}")
def put_vault_asset(
    asset_id: str,
    payload: VaultAssetUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, object]:
    require_workspace_role(session, "owner", "admin")
    asset = update_vault_asset(asset_id, payload, workspace_id=str(session["workspace"]["id"]))
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="vault.asset.updated",
        target_type="vault_asset",
        target_id=asset_id,
        status="success",
        details={"name": payload.name, "scope": payload.scope, "status": payload.status},
    )
    return asset


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}", response_model=WorkflowDetail)
def get_workflow_detail(workflow_id: str, session: dict[str, Any] = Depends(get_session_context)) -> WorkflowDetail:
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowDetail.model_validate(
        {
            **workflow,
            "definition": workflow["definition_json"],
        }
    )


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/versions", response_model=list[WorkflowVersionSummary])
def get_workflow_versions(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowVersionSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return [
        WorkflowVersionSummary.model_validate(item)
        for item in list_workflow_versions(workflow_id, workspace_id=workspace_id)
    ]


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/versions/{{version_id}}", response_model=WorkflowVersionDetail)
def get_workflow_version_detail(
    workflow_id: str,
    version_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowVersionDetail:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    version = get_workflow_version(version_id, workspace_id=workspace_id)
    if version is None or str(version["workflow_id"]) != workflow_id:
        raise HTTPException(status_code=404, detail="Workflow version not found")

    return WorkflowVersionDetail.model_validate(
        {
            **version,
            "definition": version["definition_json"],
        }
    )


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/versions", response_model=WorkflowVersionSummary, status_code=201)
def post_workflow_version(
    workflow_id: str,
    payload: WorkflowVersionCreateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowVersionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    version = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="draft_snapshot",
        notes=payload.notes,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.version.created",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"version_id": version["id"], "version_number": version["version_number"], "version_status": version["status"]},
    )
    return WorkflowVersionSummary.model_validate(version)


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/publish", response_model=WorkflowVersionSummary, status_code=201)
def publish_workflow(
    workflow_id: str,
    payload: WorkflowPublishRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowVersionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    version = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="published",
        notes=payload.notes,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.published",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"version_id": version["id"], "version_number": version["version_number"]},
    )
    return WorkflowVersionSummary.model_validate(version)


@app.get(f"{settings.api_prefix}/jobs", response_model=list[WorkflowJobSummary])
def get_jobs(session: dict[str, Any] = Depends(get_session_context)) -> list[WorkflowJobSummary]:
    return [
        WorkflowJobSummary.model_validate(item)
        for item in list_workflow_jobs(str(session["workspace"]["id"]))
    ]


@app.post(f"{settings.api_prefix}/jobs/{{job_id}}/cancel", response_model=WorkflowJobSummary)
def cancel_job(
    job_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowJobSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    job = get_workflow_job(job_id, workspace_id=workspace_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.get("status")) not in {"pending", "failed"}:
        raise HTTPException(status_code=409, detail="Only pending or failed jobs can be cancelled")

    cancelled = cancel_workflow_job(job_id, workspace_id=workspace_id)
    if cancelled is None:
        raise HTTPException(status_code=404, detail="Job not found")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.job.cancelled",
        target_type="workflow_job",
        target_id=job_id,
        status="success",
        details={"workflow_id": cancelled["workflow_id"]},
    )
    return WorkflowJobSummary.model_validate(cancelled)


@app.post(f"{settings.api_prefix}/workflows", response_model=WorkflowSummary, status_code=201)
def post_workflow(payload: WorkflowCreate, session: dict[str, Any] = Depends(get_session_context)) -> WorkflowSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workflow = create_workflow(
        payload,
        workspace_id=str(session["workspace"]["id"]),
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="workflow.created",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"name": payload.name, "trigger_type": payload.trigger_type, "category": payload.category},
    )
    return WorkflowSummary.model_validate(workflow)


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/queue-run", response_model=WorkflowJobSummary, status_code=201)
def queue_workflow_run(
    workflow_id: str,
    payload: WorkflowQueueRunRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowJobSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    job = create_workflow_job(
        workspace_id=str(workflow["workspace_id"]),
        workflow_id=str(workflow["id"]),
        workflow_version_id=str(workflow["published_version_id"]) if workflow.get("published_version_id") else None,
        initiated_by_user_id=str(session["user"]["id"]),
        trigger_type=payload.payload.get("_trigger_type", "manual"),
        payload=payload.payload,
    )
    record_audit_event(
        session=session,
        workspace_id=str(workflow["workspace_id"]),
        action="workflow.queued",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"job_id": job["id"], "trigger_type": job["trigger_type"]},
    )
    return WorkflowJobSummary.model_validate(job)


@app.put(f"{settings.api_prefix}/workflows/{{workflow_id}}", response_model=WorkflowDetail)
def put_workflow(
    workflow_id: str,
    payload: WorkflowUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDetail:
    require_workspace_role(session, "owner", "admin", "builder")
    workflow = update_workflow(workflow_id, payload, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="workflow.updated",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"name": payload.name, "status": payload.status, "trigger_type": payload.trigger_type},
    )
    return WorkflowDetail.model_validate(
        {
            **workflow,
            "definition": workflow["definition_json"],
        }
    )


@app.post(f"{settings.api_prefix}/workflows/from-template", response_model=WorkflowSummary, status_code=201)
def post_workflow_from_template(
    payload: WorkflowFromTemplateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    template = get_template(payload.template_id, workspace_id=workspace_id)
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")

    workflow = create_workflow(
        WorkflowCreate(
            name=payload.name or f"{template['name']} Copy",
            trigger_type=template["trigger_type"],
            category=template["category"],
            status="draft",
            template_id=template["id"],
            definition=template["definition"],
        ),
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.created_from_template",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"template_id": payload.template_id, "name": workflow["name"]},
    )
    return WorkflowSummary.model_validate(workflow)


@app.post(f"{settings.api_prefix}/workflows/generate", response_model=WorkflowSummary, status_code=201)
def post_generated_workflow(
    payload: WorkflowGenerateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    lowered = prompt.lower()
    category = "Custom"
    if any(word in lowered for word in ["support", "ticket", "customer"]):
        category = "Customer Support"
    elif any(word in lowered for word in ["lead", "crm", "sales"]):
        category = "Sales Ops"
    elif any(word in lowered for word in ["invoice", "finance", "approval"]):
        category = "Finance"

    definition = {
        "steps": [
            WorkflowStep(id="trigger-1", type="trigger", name="Generated trigger", config={}),
            WorkflowStep(
                id="llm-1",
                type="llm",
                name="Interpret request",
                config={"prompt": f"Use this workflow intent to drive the next action: {prompt}"},
            ),
            WorkflowStep(
                id="output-1",
                type="output",
                name="Return generated result",
                config={"channel": "generated"},
            ),
        ],
        "edges": [
            WorkflowEdge(id="edge-trigger-llm", source="trigger-1", target="llm-1"),
            WorkflowEdge(id="edge-llm-output", source="llm-1", target="output-1"),
        ],
    }

    workflow = create_workflow(
        WorkflowCreate(
            name=payload.name or build_workflow_name(prompt),
            trigger_type="manual",
            category=category,
            status="draft",
            definition=definition,
        ),
        workspace_id=str(session["workspace"]["id"]),
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="workflow.generated",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"prompt_preview": prompt[:120]},
    )
    return WorkflowSummary.model_validate(workflow)


@app.get(f"{settings.api_prefix}/executions", response_model=list[ExecutionSummary])
def get_executions(session: dict[str, Any] = Depends(get_session_context)) -> list[ExecutionSummary]:
    return [
        normalize_execution(item)
        for item in list_executions(workspace_id=str(session["workspace"]["id"]))
    ]


@app.get(f"{settings.api_prefix}/executions/{{execution_id}}", response_model=ExecutionSummary)
def get_execution_detail(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    execution = get_execution(execution_id, workspace_id=str(session["workspace"]["id"]))
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return normalize_execution(execution)


@app.get(f"{settings.api_prefix}/executions/{{execution_id}}/events", response_model=list[ExecutionEventSummary])
def get_execution_events(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[ExecutionEventSummary]:
    execution = get_execution(execution_id, workspace_id=str(session["workspace"]["id"]))
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return [
        ExecutionEventSummary.model_validate(
            {
                **item,
                "data": item.get("data_json") or {},
            }
        )
        for item in list_execution_events(
            execution_id=execution_id,
            workspace_id=str(session["workspace"]["id"]),
        )
    ]


@app.get(f"{settings.api_prefix}/executions/{{execution_id}}/pause", response_model=ExecutionPauseSummary)
def get_execution_pause_detail(
    execution_id: str,
    request: Request,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionPauseSummary:
    pause = get_execution_pause(execution_id, workspace_id=str(session["workspace"]["id"]))
    if pause is None:
        raise HTTPException(status_code=404, detail="Paused execution not found")
    return build_execution_pause_response(pause, request)


@app.post(f"{settings.api_prefix}/executions/{{execution_id}}/retry", response_model=WorkflowJobSummary, status_code=201)
def retry_execution(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowJobSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")

    workflow = get_workflow(str(execution["workflow_id"]), workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    payload = dict(execution.get("payload_json") or {})
    payload["_retry_of_execution_id"] = execution_id
    payload["_trigger_type"] = str(execution.get("trigger_type") or "manual")

    job = create_workflow_job(
        workspace_id=workspace_id,
        workflow_id=str(workflow["id"]),
        workflow_version_id=str(execution["workflow_version_id"]) if execution.get("workflow_version_id") else None,
        initiated_by_user_id=str(session["user"]["id"]),
        trigger_type="retry",
        payload=payload,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="execution.retry_queued",
        target_type="execution",
        target_id=execution_id,
        status="success",
        details={"job_id": job["id"], "workflow_id": workflow["id"]},
    )
    return WorkflowJobSummary.model_validate(job)


@app.post(f"{settings.api_prefix}/executions/{{execution_id}}/resume", response_model=ExecutionSummary)
def resume_execution(
    execution_id: str,
    payload: ResumeExecutionRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    pause = get_execution_pause(execution_id, workspace_id=str(session["workspace"]["id"]))
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=404, detail="Paused execution not found")
    return _resume_paused_execution(
        pause,
        resume_payload=payload.payload,
        resume_decision=payload.decision,
        session=session,
    )


@app.post(f"{settings.api_prefix}/executions/{{execution_id}}/cancel", response_model=ExecutionSummary)
def cancel_execution(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    pause = get_execution_pause(execution_id, workspace_id=str(session["workspace"]["id"]))
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=404, detail="Paused execution not found")
    return _cancel_paused_execution(pause, session=session)


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/run", response_model=ExecutionSummary)
def run_workflow(
    workflow_id: str,
    payload: RunWorkflowRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return _execute_workflow(
        workflow,
        payload.payload,
        trigger_type=payload.payload.get("_trigger_type", "manual"),
        initiated_by_user_id=str(session["user"]["id"]),
    )


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/trigger-details", response_model=TriggerDetailsResponse)
def get_workflow_trigger_details(
    workflow_id: str,
    request: Request,
    session: dict[str, Any] = Depends(get_session_context),
) -> TriggerDetailsResponse:
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    webhook_path = None
    webhook_url = None
    schedule_hint = None

    workspace_settings = get_workspace_settings(str(session["workspace"]["id"]))
    if workflow["trigger_type"] == "webhook":
        webhook_path = f"{settings.api_prefix}/triggers/webhook/{workflow_id}"
        base_url = (
            workspace_settings.get("public_base_url")
            or settings.public_base_url
            or str(request.base_url).rstrip("/")
        )
        webhook_url = str(base_url).rstrip("/") + webhook_path
    elif workflow["trigger_type"] == "schedule":
        schedule_hint = "Call POST /api/system/run-scheduled from a free cron service to execute active scheduled workflows."

    return TriggerDetailsResponse(
        workflow_id=workflow_id,
        trigger_type=workflow["trigger_type"],
        webhook_path=webhook_path,
        webhook_url=webhook_url,
        signature_header="x-flowholt-signature" if workflow["trigger_type"] == "webhook" else None,
        timestamp_header="x-flowholt-timestamp" if workflow["trigger_type"] == "webhook" else None,
        webhook_secret_configured=bool(workspace_settings.get("webhook_signing_secret")),
        schedule_hint=schedule_hint,
    )


@app.post(f"{settings.api_prefix}/triggers/webhook/{{workflow_id}}", response_model=ExecutionSummary)
async def trigger_workflow_webhook(workflow_id: str, request: Request) -> ExecutionSummary:
    workflow = get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if workflow["status"] != "active":
        raise HTTPException(status_code=409, detail="Workflow is not active")

    body = await request.body()
    workspace_settings = get_workspace_settings(str(workflow["workspace_id"]))
    if workspace_settings.get("require_webhook_signature"):
        signing_secret = workspace_settings.get("webhook_signing_secret")
        timestamp = request.headers.get("x-flowholt-timestamp", "")
        signature = request.headers.get("x-flowholt-signature", "")
        if not signing_secret or not verify_webhook_signature(
            secret=str(signing_secret),
            timestamp=timestamp,
            signature=signature,
            body=body,
            tolerance_seconds=settings.webhook_signature_tolerance_seconds,
        ):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            payload = {"body": payload}
    except Exception:  # noqa: BLE001
        payload = {"raw_body": body.decode("utf-8", errors="ignore")}

    payload.setdefault("_trigger_type", "webhook")
    payload.setdefault("_headers", dict(request.headers))
    payload.setdefault("_query", dict(request.query_params))
    event_key = extract_event_key(request, workflow_id)
    if event_key:
        existing_event = get_trigger_event_by_key(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            event_key=event_key,
        )
        if existing_event and existing_event.get("execution_id"):
            existing_execution = get_execution(str(existing_event["execution_id"]), workspace_id=str(workflow["workspace_id"]))
            if existing_execution is not None:
                record_audit_event(
                    session=None,
                    workspace_id=str(workflow["workspace_id"]),
                    action="workflow.webhook.deduplicated",
                    target_type="workflow",
                    target_id=str(workflow["id"]),
                    status="success",
                    details={"event_key": event_key, "execution_id": existing_execution["id"]},
                )
                return normalize_execution(existing_execution)
        elif existing_event:
            raise HTTPException(status_code=409, detail="Webhook event is already being processed")

        trigger_event = create_trigger_event(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            trigger_type="webhook",
            event_key=event_key,
            payload=payload,
        )
    else:
        trigger_event = None
    record_audit_event(
        session=None,
        workspace_id=str(workflow["workspace_id"]),
        action="workflow.webhook.received",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"trigger_type": "webhook"},
    )

    execution = _execute_workflow(workflow, payload, trigger_type="webhook", use_published_version=True)
    if trigger_event is not None:
        attach_trigger_event_execution(str(trigger_event["id"]), execution_id=execution.id)
    return execution


@app.post(f"{settings.api_prefix}/system/run-scheduled", response_model=ScheduledRunResponse)
def run_scheduled_workflows(request: Request) -> ScheduledRunResponse:
    if settings.scheduler_secret:
        scheduler_secret = request.headers.get("x-flowholt-scheduler-secret", "")
        if scheduler_secret != settings.scheduler_secret:
            raise HTTPException(status_code=401, detail="Invalid scheduler secret")

    scheduled_workflows = list_workflows_by_trigger(trigger_type="schedule", status="active")
    execution_ids: list[str] = []
    skipped_workflow_ids: list[str] = []

    for workflow in scheduled_workflows:
        trigger_step = next(
            (step for step in workflow["definition_json"].get("steps", []) if step.get("type") == "trigger"),
            None,
        )
        if trigger_step is None:
            skipped_workflow_ids.append(workflow["id"])
            continue

        payload = {
            "_trigger_type": "schedule",
            "_schedule": trigger_step.get("config", {}),
            "message": f"Scheduled run for {workflow['name']}",
        }
        execution = _execute_workflow(workflow, payload, trigger_type="schedule", use_published_version=True)
        execution_ids.append(execution.id)
        record_audit_event(
            session=None,
            workspace_id=str(workflow["workspace_id"]),
            action="workflow.schedule.dispatched",
            target_type="workflow",
            target_id=str(workflow["id"]),
            status="success",
            details={"execution_id": execution.id, "trigger_type": "schedule"},
        )

    return ScheduledRunResponse(
        triggered_count=len(execution_ids),
        execution_ids=execution_ids,
        skipped_workflow_ids=skipped_workflow_ids,
    )


@app.post(f"{settings.api_prefix}/system/resume-paused", response_model=ResumePausedExecutionsResponse)
def resume_paused_executions(request: Request) -> ResumePausedExecutionsResponse:
    if settings.scheduler_secret:
        scheduler_secret = request.headers.get("x-flowholt-scheduler-secret", "")
        if scheduler_secret != settings.scheduler_secret:
            raise HTTPException(status_code=401, detail="Invalid scheduler secret")

    due_pauses = list_due_execution_pauses(limit=25)
    execution_ids: list[str] = []
    pause_ids: list[str] = []

    for pause in due_pauses:
        if str(pause.get("status")) != "paused":
            continue
        execution = _resume_paused_execution(
            pause,
            resume_payload={},
            resume_decision=None,
            session=None,
        )
        execution_ids.append(execution.id)
        pause_ids.append(str(pause["id"]))

    return ResumePausedExecutionsResponse(
        resumed_count=len(execution_ids),
        execution_ids=execution_ids,
        pause_ids=pause_ids,
    )


@app.post(f"{settings.api_prefix}/system/process-jobs", response_model=JobProcessResponse)
def process_workflow_jobs(request: Request) -> JobProcessResponse:
    if settings.scheduler_secret:
        scheduler_secret = request.headers.get("x-flowholt-scheduler-secret", "")
        if scheduler_secret != settings.scheduler_secret:
            raise HTTPException(status_code=401, detail="Invalid scheduler secret")

    claimed = claim_pending_workflow_jobs(limit=10, lease_seconds=settings.worker_lease_seconds)
    completed_count = 0
    failed_count = 0
    execution_ids: list[str] = []
    job_ids = [str(job["id"]) for job in claimed]

    for job in claimed:
        workflow = get_workflow(str(job["workflow_id"]))
        if workflow is None:
            fail_workflow_job(str(job["id"]), error_text="Workflow not found for queued job")
            record_audit_event(
                session=None,
                workspace_id=str(job["workspace_id"]),
                action="workflow.job.failed",
                target_type="workflow_job",
                target_id=str(job["id"]),
                status="failed",
                details={"reason": "Workflow not found for queued job"},
            )
            failed_count += 1
            continue

        runtime_definition = workflow["definition_json"]
        runtime_version_id = None
        if job.get("workflow_version_id"):
            version = get_workflow_version(str(job["workflow_version_id"]), workspace_id=str(job["workspace_id"]))
            if version is not None:
                runtime_definition = version["definition_json"]
                runtime_version_id = str(version["id"])

        try:
            execution = _execute_workflow(
                workflow,
                job["payload_json"],
                trigger_type=str(job["trigger_type"]),
                initiated_by_user_id=str(job["initiated_by_user_id"]) if job.get("initiated_by_user_id") else None,
                runtime_definition_override=runtime_definition,
                runtime_version_id_override=runtime_version_id,
            )
            complete_workflow_job(str(job["id"]), execution_id=execution.id)
            record_audit_event(
                session=None,
                workspace_id=str(job["workspace_id"]),
                action="workflow.job.completed",
                target_type="workflow_job",
                target_id=str(job["id"]),
                status="success",
                details={
                    "execution_id": execution.id,
                    "workflow_id": str(job["workflow_id"]),
                    "trigger_type": str(job["trigger_type"]),
                },
            )
            execution_ids.append(execution.id)
            completed_count += 1
        except Exception as exc:  # noqa: BLE001
            fail_workflow_job(str(job["id"]), error_text=str(exc))
            record_audit_event(
                session=None,
                workspace_id=str(job["workspace_id"]),
                action="workflow.job.failed",
                target_type="workflow_job",
                target_id=str(job["id"]),
                status="failed",
                details={
                    "workflow_id": str(job["workflow_id"]),
                    "trigger_type": str(job["trigger_type"]),
                    "error": str(exc),
                },
            )
            failed_count += 1

    return JobProcessResponse(
        claimed_count=len(claimed),
        completed_count=completed_count,
        failed_count=failed_count,
        execution_ids=execution_ids,
        job_ids=job_ids,
    )


@app.post(f"{settings.api_prefix}/executions/resume/{{resume_token}}", response_model=ExecutionSummary)
def resume_execution_by_token(
    resume_token: str,
    payload: ResumeExecutionRequest,
) -> ExecutionSummary:
    pause = get_execution_pause_by_token(token=resume_token, token_kind="resume")
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=404, detail="Resume token not found")
    return _resume_paused_execution(
        pause,
        resume_payload=payload.payload,
        resume_decision=payload.decision,
        session=None,
    )


@app.post(f"{settings.api_prefix}/executions/cancel/{{cancel_token}}", response_model=ExecutionSummary)
def cancel_execution_by_token(cancel_token: str) -> ExecutionSummary:
    pause = get_execution_pause_by_token(token=cancel_token, token_kind="cancel")
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=404, detail="Cancel token not found")
    return _cancel_paused_execution(pause, session=None)


def build_workflow_name(prompt: str) -> str:
    cleaned = " ".join(prompt.split())
    words = cleaned.split(" ")
    name = " ".join(words[:5]).strip()
    return name[:60] if name else "Generated Workflow"


def _execute_workflow(
    workflow: dict[str, object],
    payload: dict[str, object],
    *,
    trigger_type: str,
    initiated_by_user_id: str | None = None,
    use_published_version: bool = False,
    runtime_definition_override: dict[str, Any] | None = None,
    runtime_version_id_override: str | None = None,
) -> ExecutionSummary:
    runtime_definition = runtime_definition_override or workflow["definition_json"]
    runtime_version_id: str | None = runtime_version_id_override
    if use_published_version and runtime_definition_override is None:
        published_version = get_published_workflow_version(
            str(workflow["id"]),
            workspace_id=str(workflow["workspace_id"]),
        )
        if published_version is not None:
            runtime_definition = published_version["definition_json"]
            runtime_version_id = str(published_version["id"])

    execution = create_execution_record(
        workflow,
        payload,
        trigger_type=trigger_type,
        initiated_by_user_id=initiated_by_user_id,
        workflow_version_id=runtime_version_id,
    )
    record_execution_event(
        execution_id=str(execution["id"]),
        workflow_id=str(workflow["id"]),
        workspace_id=str(workflow["workspace_id"]),
        event_type="execution.started",
        status="running",
        message=f"Execution started via {trigger_type}",
        data={"trigger_type": trigger_type, "workflow_version_id": runtime_version_id},
    )
    started = time.perf_counter()
    vault_context = build_vault_runtime_context(str(workflow["workspace_id"]))

    try:
        outcome = run_workflow_definition(runtime_definition, payload, vault_context=vault_context)
        step_results = outcome["step_results"]
        result = outcome.get("result")
        status = "paused" if outcome["status"] == "paused" else "success"
        error_text = None
    except Exception as exc:  # noqa: BLE001
        step_results = []
        result = None
        status = "failed"
        error_text = str(exc)

    duration_ms = int((time.perf_counter() - started) * 1000)
    stored = finish_execution_record(
        execution["id"],
        status=status,
        duration_ms=duration_ms,
        steps=step_results,
        result=result,
        error_text=error_text,
    )
    if status == "paused":
        pause_data = outcome["pause"]
        resume_token = secrets.token_urlsafe(24)
        cancel_token = secrets.token_urlsafe(24)
        pause = create_execution_pause(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            execution_id=str(execution["id"]),
            workflow_version_id=runtime_version_id,
            step_id=str(pause_data["step_id"]),
            step_name=str(pause_data["step_name"]),
            wait_type=str(pause_data["wait_type"]),
            resume_after=pause_data.get("resume_after"),
            resume_token=resume_token,
            cancel_token=cancel_token,
            state=outcome["state"],
            metadata=dict(pause_data.get("metadata") or {}),
        )
        if pause_data["wait_type"] == "human":
            task_metadata = dict(pause_data.get("metadata") or {})
            assigned_to_user_id, assigned_to_email = resolve_human_task_assignment(
                workspace_id=str(workflow["workspace_id"]),
                metadata=task_metadata,
            )
            human_task = create_human_task(
                workspace_id=str(workflow["workspace_id"]),
                workflow_id=str(workflow["id"]),
                execution_id=str(execution["id"]),
                pause_id=str(pause["id"]),
                step_id=str(pause_data["step_id"]),
                step_name=str(pause_data["step_name"]),
                title=str(task_metadata.get("title") or pause_data["step_name"]),
                instructions=str(task_metadata.get("instructions") or "Review and decide."),
                assigned_to_user_id=assigned_to_user_id,
                assigned_to_email=assigned_to_email,
                priority=str(task_metadata.get("priority") or "normal"),
                choices=list(task_metadata.get("choices") or ["approved", "rejected"]),
                due_at=compute_task_due_at(task_metadata),
                metadata=task_metadata,
            )
            record_execution_event(
                execution_id=str(execution["id"]),
                workflow_id=str(workflow["id"]),
                workspace_id=str(workflow["workspace_id"]),
                event_type="human_task.created",
                step_id=str(pause_data["step_id"]),
                step_name=str(pause_data["step_name"]),
                status="open",
                message=f"Human task created for {pause_data['step_name']}",
                data={"task_id": str(human_task["id"]), "assigned_to_user_id": assigned_to_user_id, "assigned_to_email": assigned_to_email},
            )
        record_execution_event(
            execution_id=str(execution["id"]),
            workflow_id=str(workflow["id"]),
            workspace_id=str(workflow["workspace_id"]),
            event_type="execution.paused",
            step_id=str(pause_data["step_id"]),
            step_name=str(pause_data["step_name"]),
            status="paused",
            message=f"Paused at {pause_data['step_name']}",
            data={
                "pause_id": str(pause["id"]),
                "wait_type": pause_data["wait_type"],
                "resume_after": pause_data.get("resume_after"),
                "metadata": dict(pause_data.get("metadata") or {}),
            },
        )
        record_audit_event(
            session=None,
            workspace_id=str(workflow["workspace_id"]),
            action="workflow.execution.paused",
            target_type="workflow",
            target_id=str(workflow["id"]),
            status="success",
            details={
                "execution_id": str(execution["id"]),
                "trigger_type": trigger_type,
                "workflow_version_id": runtime_version_id,
                "wait_type": pause_data["wait_type"],
                "step_id": pause_data["step_id"],
                "resume_after": pause_data.get("resume_after"),
            },
        )
    touch_workflow_run(str(workflow["id"]))
    for step in step_results:
        output = dict(step.get("output") or {})
        record_execution_event(
            execution_id=str(execution["id"]),
            workflow_id=str(workflow["id"]),
            workspace_id=str(workflow["workspace_id"]),
            event_type="step.completed",
            step_name=str(step["name"]),
            status=str(step["status"]),
            message=f"Step {step['name']} finished with {step['status']}",
            data={
                "duration_ms": int(step.get("duration_ms") or 0),
                "output": output,
            },
        )
    record_execution_event(
        execution_id=str(execution["id"]),
        workflow_id=str(workflow["id"]),
        workspace_id=str(workflow["workspace_id"]),
        event_type="execution.finished",
        status=status,
        message=f"Execution finished with status {status}",
        data={
            "duration_ms": duration_ms,
            "error": error_text,
            "workflow_version_id": runtime_version_id,
        },
    )
    create_audit_event(
        workspace_id=str(workflow["workspace_id"]),
        actor_user_id=initiated_by_user_id,
        actor_email=None,
        action="workflow.execution.completed",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status=status,
        details={
            "execution_id": str(execution["id"]),
            "trigger_type": trigger_type,
            "workflow_version_id": runtime_version_id,
            "duration_ms": duration_ms,
            "step_count": len(step_results),
            "error": error_text,
        },
    )
    stored["steps"] = stored.pop("steps_json")
    stored["trigger_type"] = trigger_type
    return ExecutionSummary.model_validate(stored)


def _resume_paused_execution(
    pause: dict[str, Any],
    *,
    resume_payload: dict[str, Any],
    resume_decision: str | None,
    session: dict[str, Any] | None,
) -> ExecutionSummary:
    if str(pause.get("status")) != "paused":
        raise HTTPException(status_code=409, detail="Execution is not paused")

    execution = get_execution(str(pause["execution_id"]), workspace_id=str(pause["workspace_id"]))
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    workflow = get_workflow(str(pause["workflow_id"]), workspace_id=str(pause["workspace_id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    runtime_definition = workflow["definition_json"]
    runtime_version_id = str(pause["workflow_version_id"]) if pause.get("workflow_version_id") else None
    if runtime_version_id:
        version = get_workflow_version(runtime_version_id, workspace_id=str(pause["workspace_id"]))
        if version is not None:
            runtime_definition = version["definition_json"]

    started = time.perf_counter()
    vault_context = build_vault_runtime_context(str(workflow["workspace_id"]))
    previous_step_count = len(execution.get("steps_json") or [])
    record_execution_event(
        execution_id=str(execution["id"]),
        workflow_id=str(workflow["id"]),
        workspace_id=str(workflow["workspace_id"]),
        event_type="execution.resume_requested",
        step_id=str(pause["step_id"]),
        step_name=str(pause["step_name"]),
        status="running",
        message=f"Resuming execution from {pause['step_name']}",
        data={"pause_id": str(pause["id"]), "decision": resume_decision, "payload": resume_payload},
    )
    try:
        outcome = run_workflow_definition(
            runtime_definition,
            execution["payload_json"],
            vault_context=vault_context,
            state=dict(pause.get("state_json") or {}),
            resume_payload=resume_payload,
            resume_decision=resume_decision,
        )
        step_results = outcome["step_results"]
        result = outcome.get("result")
        status = "paused" if outcome["status"] == "paused" else "success"
        error_text = None
    except Exception as exc:  # noqa: BLE001
        step_results = execution.get("steps_json") or []
        result = None
        status = "failed"
        error_text = str(exc)

    duration_ms = int((time.perf_counter() - started) * 1000) + int(execution.get("duration_ms") or 0)
    stored = finish_execution_record(
        str(execution["id"]),
        status=status,
        duration_ms=duration_ms,
        steps=step_results,
        result=result,
        error_text=error_text,
    )
    update_execution_pause_status(str(pause["id"]), status="resumed")
    if status == "paused":
        pause_data = outcome["pause"]
        next_pause = create_execution_pause(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            execution_id=str(execution["id"]),
            workflow_version_id=runtime_version_id,
            step_id=str(pause_data["step_id"]),
            step_name=str(pause_data["step_name"]),
            wait_type=str(pause_data["wait_type"]),
            resume_after=pause_data.get("resume_after"),
            resume_token=secrets.token_urlsafe(24),
            cancel_token=secrets.token_urlsafe(24),
            state=outcome["state"],
            metadata=dict(pause_data.get("metadata") or {}),
        )
        if pause_data["wait_type"] == "human":
            task_metadata = dict(pause_data.get("metadata") or {})
            assigned_to_user_id, assigned_to_email = resolve_human_task_assignment(
                workspace_id=str(workflow["workspace_id"]),
                metadata=task_metadata,
            )
            human_task = create_human_task(
                workspace_id=str(workflow["workspace_id"]),
                workflow_id=str(workflow["id"]),
                execution_id=str(execution["id"]),
                pause_id=str(next_pause["id"]),
                step_id=str(pause_data["step_id"]),
                step_name=str(pause_data["step_name"]),
                title=str(task_metadata.get("title") or pause_data["step_name"]),
                instructions=str(task_metadata.get("instructions") or "Review and decide."),
                assigned_to_user_id=assigned_to_user_id,
                assigned_to_email=assigned_to_email,
                priority=str(task_metadata.get("priority") or "normal"),
                choices=list(task_metadata.get("choices") or ["approved", "rejected"]),
                due_at=compute_task_due_at(task_metadata),
                metadata=task_metadata,
            )
            record_execution_event(
                execution_id=str(execution["id"]),
                workflow_id=str(workflow["id"]),
                workspace_id=str(workflow["workspace_id"]),
                event_type="human_task.created",
                step_id=str(pause_data["step_id"]),
                step_name=str(pause_data["step_name"]),
                status="open",
                message=f"Human task created for {pause_data['step_name']}",
                data={"task_id": str(human_task["id"]), "assigned_to_user_id": assigned_to_user_id, "assigned_to_email": assigned_to_email},
            )
        record_execution_event(
            execution_id=str(execution["id"]),
            workflow_id=str(workflow["id"]),
            workspace_id=str(workflow["workspace_id"]),
            event_type="execution.paused",
            step_id=str(pause_data["step_id"]),
            step_name=str(pause_data["step_name"]),
            status="paused",
            message=f"Paused again at {pause_data['step_name']}",
            data={
                "pause_id": str(next_pause["id"]),
                "wait_type": pause_data["wait_type"],
                "resume_after": pause_data.get("resume_after"),
                "metadata": dict(pause_data.get("metadata") or {}),
            },
        )
    task = get_human_task_by_pause_id(str(pause["id"]))
    if task is not None and str(task.get("status")) == "open":
        complete_human_task(
            str(task["id"]),
            decision=resume_decision or "resumed",
            comment=None,
            response_payload=resume_payload,
        )
        record_execution_event(
            execution_id=str(execution["id"]),
            workflow_id=str(workflow["id"]),
            workspace_id=str(workflow["workspace_id"]),
            event_type="human_task.completed",
            step_id=str(pause["step_id"]),
            step_name=str(pause["step_name"]),
            status="completed",
            message=f"Human task completed for {pause['step_name']}",
            data={"task_id": str(task["id"]), "decision": resume_decision},
        )
    for step in step_results[previous_step_count:]:
        record_execution_event(
            execution_id=str(execution["id"]),
            workflow_id=str(workflow["id"]),
            workspace_id=str(workflow["workspace_id"]),
            event_type="step.completed",
            step_name=str(step["name"]),
            status=str(step["status"]),
            message=f"Step {step['name']} finished with {step['status']}",
            data={
                "duration_ms": int(step.get("duration_ms") or 0),
                "output": dict(step.get("output") or {}),
            },
        )
    record_execution_event(
        execution_id=str(execution["id"]),
        workflow_id=str(workflow["id"]),
        workspace_id=str(workflow["workspace_id"]),
        event_type="execution.finished",
        status=status,
        message=f"Execution finished with status {status}",
        data={"duration_ms": duration_ms, "error": error_text},
    )
    record_audit_event(
        session=session,
        workspace_id=str(workflow["workspace_id"]),
        action="workflow.execution.resumed",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success" if status != "failed" else "failed",
        details={"execution_id": str(execution["id"]), "pause_id": str(pause["id"]), "decision": resume_decision},
    )
    stored["steps"] = stored.pop("steps_json")
    return ExecutionSummary.model_validate(stored)


def _cancel_paused_execution(
    pause: dict[str, Any],
    *,
    session: dict[str, Any] | None,
) -> ExecutionSummary:
    execution = get_execution(str(pause["execution_id"]), workspace_id=str(pause["workspace_id"]))
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    stored = finish_execution_record(
        str(execution["id"]),
        status="cancelled",
        duration_ms=int(execution.get("duration_ms") or 0),
        steps=execution.get("steps_json") or [],
        result=None,
        error_text="Execution cancelled while paused.",
    )
    update_execution_pause_status(str(pause["id"]), status="cancelled")
    task = get_human_task_by_pause_id(str(pause["id"]))
    if task is not None and str(task.get("status")) == "open":
        cancel_human_task(str(task["id"]), comment="Execution cancelled while waiting for human input.")
        record_execution_event(
            execution_id=str(execution["id"]),
            workflow_id=str(pause["workflow_id"]),
            workspace_id=str(pause["workspace_id"]),
            event_type="human_task.cancelled",
            step_id=str(pause["step_id"]),
            step_name=str(pause["step_name"]),
            status="cancelled",
            message=f"Human task cancelled for {pause['step_name']}",
            data={"task_id": str(task["id"])},
        )
    record_execution_event(
        execution_id=str(execution["id"]),
        workflow_id=str(pause["workflow_id"]),
        workspace_id=str(pause["workspace_id"]),
        event_type="execution.cancelled",
        step_id=str(pause["step_id"]),
        step_name=str(pause["step_name"]),
        status="cancelled",
        message=f"Execution cancelled while paused at {pause['step_name']}",
        data={"pause_id": str(pause["id"])},
    )
    record_audit_event(
        session=session,
        workspace_id=str(pause["workspace_id"]),
        action="workflow.execution.cancelled",
        target_type="workflow",
        target_id=str(pause["workflow_id"]),
        status="success",
        details={"execution_id": str(execution["id"]), "pause_id": str(pause["id"])},
    )
    stored["steps"] = stored.pop("steps_json")
    return ExecutionSummary.model_validate(stored)
