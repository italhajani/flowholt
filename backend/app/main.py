from __future__ import annotations

import base64
import httpx
import json
import logging
import mimetypes
import re
import secrets
import smtplib
import time
from datetime import UTC, datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse

from .assistant_tools import (
    build_assistant_actions,
    build_assistant_chat_response,
    build_assistant_plan,
    build_assistant_workflow_name,
    build_draft_definition,
    build_existing_workflow_name_suggestion,
    build_workflow_summary,
    extend_workflow_definition,
    stream_assistant_chat_response,
)
from .auth import create_session_token, get_supabase_auth_mode, hash_password, verify_password, verify_session_token, verify_supabase_token
from .config import get_settings
from .db import get_database_backend, get_db, init_db, row_to_dict
from .executor import run_workflow_definition
from .help_content import list_help_articles
from .models import (
    AuthDevLoginRequest,
    AuthLoginRequest,
    AuthPreflightResponse,
    AuthSessionTokenResponse,
    AuthSignupRequest,
    AssistantCapabilitiesResponse,
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantDraftWorkflowRequest,
    AssistantDraftWorkflowResponse,
    AssistantNameRequest,
    AssistantNameResponse,
    AssistantPlanRequest,
    AssistantPlanResponse,
    AssistantSuggestedNode,
    AssistantTemplateMatch,
    AssistantTemplateMatchResponse,
    AssistantWorkflowContextResponse,
    AssistantWorkflowExtendRequest,
    AssistantWorkflowExtendResponse,
    AssistantWorkflowRenameRequest,
    AssistantWorkflowRenameResponse,
    AssistantWorkflowRepairRequest,
    AssistantWorkflowRepairResponse,
    AssistantWorkflowSummaryResponse,
    AuditEventSummary,
    BulkDeleteRequest,
    BulkDeleteResponse,
    ChatTriggerRequest,
    ChatTriggerResponse,
    ChatTriggerMessage,
    PublicChatTriggerInfoResponse,
    ChatMessageItem,
    ChatAttachmentItem,
    ChatAttachmentUploadResponse,
    ChatSendRequest,
    ChatSendResponse,
    ChatThreadCreate,
    ChatThreadDetail,
    ChatThreadListResponse,
    ChatThreadSummary,
    ChatThreadUpdateRequest,
    ExecutionArtifactPruneRequest,
    ExecutionArtifactListResponse,
    ExecutionArtifactPruneResponse,
    ExecutionArtifactSummary,
    ExecutionEventSummary,
    ExecutionInspectorResponse,
    ExecutionReplayRequest,
    ExecutionReplayResponse,
    ExecutionPauseSummary,
    ExecutionStepResult,
    ExecutionStepInspectorResponse,
    ExecutionSummary,
    HealthResponse,
    HumanTaskCancelRequest,
    HumanTaskCompleteRequest,
    HumanTaskSummary,
    IntegrationAppSummary,
    IntegrationCatalogResponse,
    IntegrationOperationDetail,
    JobProcessResponse,
    LLMProviderInfo,
    NodeCatalogResponse,
    NotificationCreate,
    NotificationItem,
    NotificationListResponse,
    NodeConfigTestRequest,
    NodeConfigTestResponse,
    NodeConfigValidationResponse,
    NodeDraftRequest,
    NodeDraftResponse,
    NodeDefinitionSummary,
    NodeDynamicPropsRequest,
    NodeDynamicPropsResponse,
    NodeEditorResponse,
    NodePreviewRequest,
    NodePreviewResponse,
    NodeResourcesResponse,
    ResumeExecutionRequest,
    ResumePausedExecutionsResponse,
    RunWorkflowRequest,
    ScheduledRunResponse,
    SessionResponse,
    SetupReportResponse,
    VaultAssetCreate,
    VaultAssetAccessResponse,
    VaultAssetAccessUpdate,
    VaultAssetHealthResponse,
    VaultAssetVerifyResponse,
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
    WorkflowExportBundle,
    WorkflowImportRequest,
    WorkflowImportResponse,
    WorkflowPublishRequest,
    WorkflowQueueRunRequest,
    WorkflowRepairResponse,
    WorkflowRepairSummary,
    WorkflowSettings,
    WorkflowObservabilityResponse,
    WorkflowEnvironmentsResponse,
    WorkflowCompareChange,
    WorkflowCompareResponse,
    WorkflowCompareStats,
    WorkflowDeploymentDetail,
    WorkflowDeploymentReviewDecisionRequest,
    WorkflowDeploymentReviewDetail,
    WorkflowDeploymentReviewSummary,
    WorkflowDeploymentSummary,
    WorkflowEnvironmentVersion,
    WorkflowPromotionRequest,
    WorkflowPromotionRequestCreate,
    WorkflowRollbackRequest,
    WorkflowPolicyResponse,
    WorkflowStepHistoryEntry,
    WorkflowStepHistoryResponse,
    StudioStepEditorEntry,
    StudioInsertStepRequest,
    StudioStepAccessResponse,
    StudioStepAssetBinding,
    StudioStepTestRequest,
    StudioStepTestResponse,
    StudioUpdateStepRequest,
    StudioWorkflowBundleResponse,
    WorkspaceMemberInviteRequest,
    WorkspaceMemberUpdateRequest,
    WorkspaceMemberSummary,
    WorkspaceSettingsResponse,
    WorkspaceSettingsUpdate,
    WorkspaceSummary,
    WorkflowStep,
    WorkflowDefinition,
    WorkflowUpdate,
    WorkflowVersionCreateRequest,
    WorkflowVersionDetail,
    WorkflowVersionSummary,
    WorkflowJobSummary,
    WorkflowSummary,
    WorkflowValidationResponse,
)
from .node_registry import get_node_definition, list_node_definitions, normalize_workflow_definition, validate_workflow_definition
from .node_registry import repair_workflow_definition
from .integration_registry import get_integration_app, get_integration_operation, list_integration_apps, resolve_dynamic_operation_fields
from .studio_nodes import build_node_catalog, build_node_draft, build_node_editor_response, resolve_node_preview
from .studio_resources import build_node_resources, build_vault_asset_health
from .studio_contracts import validate_workflow_cluster_configuration
from .studio_runtime import test_node_configuration, validate_node_configuration
from .studio_workflows import (
    delete_step_from_definition,
    duplicate_step_in_definition,
    insert_step_into_definition,
    test_step_in_definition,
    update_step_in_definition,
)
from .repository import (
    attach_trigger_event_execution,
    build_vault_runtime_context,
    cancel_workflow_job,
    claim_pending_workflow_jobs,
    complete_workflow_job,
    complete_human_task,
    create_audit_event,
    create_execution_artifact,
    create_execution_event,
    create_trigger_event,
    create_execution_pause,
    create_human_task,
    create_vault_asset,
    create_execution_record,
    complete_invited_user_signup,
    create_user_with_workspace,
    create_workflow,
    create_workflow_job,
    create_workflow_deployment,
    create_workflow_deployment_review,
    create_workflow_version,
    delete_execution_storage,
    fail_workflow_job,
    finish_execution_record,
    get_published_workflow_version,
    get_staging_workflow_version,
    get_execution,
    get_execution_artifact,
    get_execution_pause,
    get_execution_pause_by_token,
    get_human_task,
    get_human_task_by_pause_id,
    get_template,
    get_vault_asset,
    get_vault_asset_access,
    get_vault_asset_by_name,
    get_trigger_event_by_key,
    get_user_by_email,
    get_workflow,
    get_workflow_deployment,
    get_workflow_deployment_review,
    get_workflow_version,
    get_workflow_job,
    get_workspace_member_by_role,
    get_workspace_settings,
    list_audit_events,
    list_due_execution_pauses,
    list_execution_artifacts,
    list_execution_events,
    list_executions,
    count_executions_by_status,
    count_workflows_by_status,
    list_human_tasks,
    list_templates,
    list_user_workspaces,
    list_vault_assets,
    list_vault_assets_grouped,
    list_workflow_executions,
    list_workflow_versions,
    list_workflow_jobs,
    list_workflow_deployments,
    list_workflow_deployment_reviews,
    list_workflows_by_trigger,
    list_workflows,
    list_workspace_members,
    invite_workspace_member,
    resolve_supabase_session,
    resolve_session,
    touch_workflow_run,
    cancel_human_task,
    prune_execution_artifacts,
    set_workflow_environment_version,
    update_workflow_deployment_review,
    update_execution_pause_status,
    update_workflow_version_status,
    update_workspace_settings,
    update_vault_asset,
    update_vault_asset_access,
    update_workflow,
    delete_workflow,
    delete_vault_asset,
    delete_execution,
    list_user_notifications,
    create_user_notification,
    mark_notification_as_read,
    mark_all_notifications_read_for_user,
    delete_template,
    remove_workspace_member,
    resume_execution_record,
    update_workspace_member_role,
)
from .security import verify_webhook_signature
from .seeds import seed_data
from .worker import start_in_process_worker, request_shutdown
from .llm_router import (
    AnthropicProvider,
    GeminiProvider,
    GroqProvider,
    MockProvider,
    OllamaProvider,
    OpenAICompatibleProvider,
    get_llm_router,
)
from .scheduler import is_workflow_due, start_scheduler, request_shutdown as scheduler_request_shutdown
from .plugin_loader import merge_plugins_into_registry, get_plugin_registry
from .rate_limiter import RateLimitMiddleware

settings = get_settings()

# ── Production safety checks ─────────────────────────────────────────
if settings.app_env == "production":
    if settings.session_secret == "flowholt-local-dev-secret":
        raise RuntimeError("SESSION_SECRET must be changed from default in production")
    if not settings.vault_encryption_key:
        raise RuntimeError("VAULT_ENCRYPTION_KEY must be set in production")
    if settings.allow_dev_login:
        import logging as _boot_log
        _boot_log.getLogger("flowholt.boot").warning(
            "ALLOW_DEV_LOGIN is True in production — forcing to False"
        )
        settings.allow_dev_login = False

app = FastAPI(title=settings.app_name, version="0.1.0")


class PublicChatCorsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        cors_context = resolve_public_chat_cors_context(request)
        origin = request.headers.get("origin")

        if request.method == "OPTIONS" and PUBLIC_CHAT_PATH_RE.match(request.url.path):
            if cors_context is None:
                return Response(status_code=403)
            response = Response(status_code=204)
            for header, value in build_public_chat_cors_headers(
                origin=origin,
                allowed_origins_value=str(cors_context.get("allowed_origins") or "*"),
                requested_headers=request.headers.get("access-control-request-headers"),
            ).items():
                response.headers[header] = value
            return response

        response = await call_next(request)
        if cors_context is not None:
            for header, value in build_public_chat_cors_headers(
                origin=origin,
                allowed_origins_value=str(cors_context.get("allowed_origins") or "*"),
                requested_headers=request.headers.get("access-control-request-headers"),
            ).items():
                response.headers[header] = value
        return response

# ── Security headers middleware ──────────────────────────────────────
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    if request.url.path.startswith("/chat/"):
        response.headers.pop("X-Frame-Options", None)
        response.headers["Content-Security-Policy"] = "frame-ancestors 'self' http: https:"
    else:
        response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.app_env == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origin.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(PublicChatCorsMiddleware)

if settings.app_env != "test":
    app.add_middleware(
        RateLimitMiddleware,
        requests_per_minute=120,
        burst_limit=30,
        system_requests_per_minute=30,
        sensitive_paths_rpm={
            "/auth/dev-login": 10,
            "/auth/login": 15,
            "/auth/signup": 10,
            "/oauth2/": 20,
            "/sandbox/execute": 15,
            "/workflows/run": 30,
        },
    )

_logger = logging.getLogger("flowholt.api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — log full traceback, return safe 500."""
    _logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


def require_workspace_role(session: dict[str, Any], *allowed_roles: str) -> None:
    current_role = str(session["workspace"].get("role", "viewer"))
    if current_role not in allowed_roles:
        raise HTTPException(status_code=403, detail="You do not have permission for this action")


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


def _list_active_workspace_members(workspace_id: str) -> list[dict[str, Any]]:
    return [
        item
        for item in list_workspace_members(workspace_id)
        if str(item.get("status") or "") == "active"
    ]


def _send_workspace_alert_email(*, to_email: str, subject: str, body: str) -> None:
    if not to_email or not settings.smtp_host:
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_from
        msg["To"] = to_email
        msg.attach(MIMEText(body, "plain"))
        html_body = f"<div style='font-family:sans-serif;padding:16px'>{body.replace(chr(10), '<br>')}</div>"
        msg.attach(MIMEText(html_body, "html"))

        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15)
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_from, [to_email], msg.as_string())
        server.quit()
    except Exception as exc:  # noqa: BLE001
        _logger.warning("Failed to send workspace alert email to %s: %s", to_email, exc)


def _deliver_workspace_alert(
    *,
    workspace_id: str,
    recipient_user_ids: list[str],
    title: str,
    body: str,
    kind: str = "info",
    link: str | None = None,
    email_subject: str | None = None,
) -> None:
    if not recipient_user_ids:
        return

    members_by_user_id = {
        str(item["user_id"]): item
        for item in _list_active_workspace_members(workspace_id)
    }
    if not members_by_user_id:
        return

    email_enabled = bool(get_workspace_settings(workspace_id).get("email_notifications_enabled", False))
    seen: set[str] = set()
    for user_id in recipient_user_ids:
        normalized_user_id = str(user_id)
        if not normalized_user_id or normalized_user_id in seen:
            continue
        member = members_by_user_id.get(normalized_user_id)
        if member is None:
            continue
        seen.add(normalized_user_id)
        create_user_notification(
            user_id=normalized_user_id,
            workspace_id=workspace_id,
            title=title,
            body=body,
            kind=kind,
            link=link,
        )
        if email_enabled:
            member_email = str(member.get("email") or "").strip()
            if member_email:
                _send_workspace_alert_email(
                    to_email=member_email,
                    subject=email_subject or title,
                    body=body,
                )


def _workspace_execution_alert_recipients(
    *,
    workspace_id: str,
    initiated_by_user_id: str | None,
    include_workspace_admins: bool,
) -> list[str]:
    members = _list_active_workspace_members(workspace_id)
    recipients: list[str] = []
    active_user_ids = {str(item["user_id"]) for item in members}
    if initiated_by_user_id and str(initiated_by_user_id) in active_user_ids:
        recipients.append(str(initiated_by_user_id))
    if include_workspace_admins:
        recipients.extend(
            str(item["user_id"])
            for item in members
            if get_role_rank(str(item.get("role") or "viewer")) >= get_role_rank("admin")
        )
    return recipients


def _deliver_execution_alerts(
    *,
    workflow: dict[str, Any],
    execution_id: str,
    workspace_settings: dict[str, Any],
    status: str,
    trigger_type: str,
    environment: str,
    duration_ms: int,
    initiated_by_user_id: str | None,
    error_text: str | None,
) -> None:
    if status not in {"success", "failed"}:
        return
    if status == "failed" and not bool(workspace_settings.get("notify_on_failure", True)):
        return
    if status == "success" and not bool(workspace_settings.get("notify_on_success", False)):
        return

    workspace_id = str(workflow["workspace_id"])
    recipients = _workspace_execution_alert_recipients(
        workspace_id=workspace_id,
        initiated_by_user_id=initiated_by_user_id,
        include_workspace_admins=status == "failed" or not bool(initiated_by_user_id),
    )
    if not recipients:
        return

    trigger_label = trigger_type.replace(":", " / ").replace("_", " ")
    workflow_name = str(workflow.get("name") or "Workflow")
    if status == "failed":
        title = f"Workflow failed: {workflow_name}"
        body = (
            f"{workflow_name} failed in {environment} after {duration_ms} ms via {trigger_label}."
            f" Execution ID: {execution_id}."
        )
        if error_text:
            body = f"{body} Error: {error_text[:280]}"
        kind = "error"
    else:
        title = f"Workflow completed: {workflow_name}"
        body = (
            f"{workflow_name} completed successfully in {environment} via {trigger_label}."
            f" Duration: {duration_ms} ms."
        )
        kind = "success"

    _deliver_workspace_alert(
        workspace_id=workspace_id,
        recipient_user_ids=recipients,
        title=title,
        body=body,
        kind=kind,
        link=f"/dashboard/executions/{execution_id}",
        email_subject=title,
    )


def _reviewer_alert_recipients(
    *,
    workspace_id: str,
    settings_payload: dict[str, Any],
    requested_by_user_id: str,
) -> list[str]:
    min_role = str(settings_payload.get("deployment_approval_min_role") or "admin")
    allow_self_approval = bool(settings_payload.get("allow_self_approval", False))
    recipients: list[str] = []
    for member in _list_active_workspace_members(workspace_id):
        user_id = str(member["user_id"])
        if get_role_rank(str(member.get("role") or "viewer")) < get_role_rank(min_role):
            continue
        if not allow_self_approval and user_id == requested_by_user_id:
            continue
        recipients.append(user_id)
    return recipients


def _deliver_deployment_review_request_alert(
    *,
    workflow: dict[str, Any],
    session: dict[str, Any],
    target_environment: str,
    notes: str | None,
    settings_payload: dict[str, Any],
) -> None:
    if not bool(settings_payload.get("notify_on_approval_requests", True)):
        return

    workspace_id = str(workflow["workspace_id"])
    requested_by_user_id = str(session["user"]["id"])
    recipients = _reviewer_alert_recipients(
        workspace_id=workspace_id,
        settings_payload=settings_payload,
        requested_by_user_id=requested_by_user_id,
    )
    if not recipients:
        return

    requester_name = str(session["user"].get("name") or session["user"].get("email") or "A workspace member")
    workflow_name = str(workflow.get("name") or "Workflow")
    body = f"{requester_name} requested {target_environment} approval for {workflow_name}."
    if notes:
        body = f"{body} Note: {notes[:240]}"
    _deliver_workspace_alert(
        workspace_id=workspace_id,
        recipient_user_ids=recipients,
        title=f"Approval requested: {workflow_name}",
        body=body,
        kind="warning",
        link="/dashboard/environment",
        email_subject=f"{workflow_name} needs {target_environment} approval",
    )


def normalize_execution(item: dict[str, Any]) -> ExecutionSummary:
    normalized = dict(item)
    normalized["steps"] = normalized.pop("steps_json")
    return ExecutionSummary.model_validate(normalized)


def normalize_execution_artifact(item: dict[str, Any]) -> ExecutionArtifactSummary:
    normalized = dict(item)
    normalized["data"] = normalized.pop("data_json", {}) or {}
    return ExecutionArtifactSummary.model_validate(normalized)


def build_execution_inspector_response(
    *,
    execution: dict[str, Any],
    workspace_id: str,
    request: Request | None = None,
) -> ExecutionInspectorResponse:
    pause_record = get_execution_pause(str(execution["id"]), workspace_id=workspace_id)
    human_task_record = None
    if pause_record is not None:
        human_task_record = get_human_task_by_pause_id(str(pause_record["id"]))

    return ExecutionInspectorResponse(
        execution=normalize_execution(execution),
        events=[
            ExecutionEventSummary.model_validate({**item, "data": item.get("data_json") or {}})
            for item in list_execution_events(execution_id=str(execution["id"]), workspace_id=workspace_id)
        ],
        artifacts=[
            normalize_execution_artifact(item)
            for item in list_execution_artifacts(execution_id=str(execution["id"]), workspace_id=workspace_id)
        ],
        pause=build_execution_pause_response(pause_record, request) if pause_record is not None else None,
        human_task=HumanTaskSummary.model_validate(human_task_record) if human_task_record is not None else None,
    )


def build_execution_step_inspector_response(
    *,
    execution: dict[str, Any],
    step_id: str,
    workspace_id: str,
) -> ExecutionStepInspectorResponse:
    step_result_raw = next(
        (item for item in execution.get("steps_json", []) if str(item.get("step_id") or "") == step_id),
        None,
    )
    step_events = [
        ExecutionEventSummary.model_validate({**item, "data": item.get("data_json") or {}})
        for item in list_execution_events(execution_id=str(execution["id"]), workspace_id=workspace_id)
        if str(item.get("step_id") or "") == step_id
    ]
    step_artifacts = [
        normalize_execution_artifact(item)
        for item in list_execution_artifacts(execution_id=str(execution["id"]), workspace_id=workspace_id)
        if str(item.get("step_id") or "") == step_id
    ]
    latest_output = {}
    if step_result_raw and isinstance(step_result_raw.get("output"), dict):
        latest_output = dict(step_result_raw.get("output") or {})
    elif step_artifacts:
        latest_output = dict(step_artifacts[-1].data)

    step_name = ""
    step_type: str | None = None
    if step_result_raw:
        step_name = str(step_result_raw.get("name") or "")
        step_type = str(step_result_raw.get("step_type") or "") or None
    elif step_events:
        step_name = str(step_events[-1].step_name or "")
    elif step_artifacts:
        step_name = str(step_artifacts[-1].step_name or "")

    return ExecutionStepInspectorResponse(
        execution_id=str(execution["id"]),
        workflow_id=str(execution["workflow_id"]),
        step_id=step_id,
        step_name=step_name or step_id,
        step_type=step_type,
        result=ExecutionStepResult.model_validate(step_result_raw) if step_result_raw is not None else None,
        latest_output=latest_output,
        events=step_events,
        artifacts=step_artifacts,
    )


def build_workflow_observability_response(
    *,
    workflow: dict[str, Any],
    executions: list[dict[str, Any]],
    jobs: list[dict[str, Any]],
) -> WorkflowObservabilityResponse:
    total_runs = len(executions)
    success_count = sum(1 for item in executions if str(item.get("status")) == "success")
    failed_count = sum(1 for item in executions if str(item.get("status")) == "failed")
    paused_count = sum(1 for item in executions if str(item.get("status")) == "paused")
    cancelled_count = sum(1 for item in executions if str(item.get("status")) == "cancelled")
    average_duration_ms = int(
        sum(int(item.get("duration_ms") or 0) for item in executions) / total_runs
    ) if total_runs else 0
    last_run_at = executions[0].get("started_at") if executions else None
    last_success_at = next((item.get("finished_at") for item in executions if str(item.get("status")) == "success"), None)
    last_failed_at = next((item.get("finished_at") for item in executions if str(item.get("status")) == "failed"), None)
    active_job_count = sum(
        1
        for item in jobs
        if str(item.get("workflow_id")) == str(workflow["id"]) and str(item.get("status")) in {"pending", "processing"}
    )

    return WorkflowObservabilityResponse(
        workflow_id=str(workflow["id"]),
        workflow_name=str(workflow["name"]),
        total_runs=total_runs,
        success_count=success_count,
        failed_count=failed_count,
        paused_count=paused_count,
        cancelled_count=cancelled_count,
        success_rate=int((success_count / total_runs) * 100) if total_runs else 0,
        average_duration_ms=average_duration_ms,
        active_job_count=active_job_count,
        last_run_at=str(last_run_at) if last_run_at else None,
        last_success_at=str(last_success_at) if last_success_at else None,
        last_failed_at=str(last_failed_at) if last_failed_at else None,
        recent_executions=[normalize_execution(item) for item in executions[:8]],
    )


def build_workflow_step_history_response(
    *,
    workflow: dict[str, Any],
    step_id: str,
    executions: list[dict[str, Any]],
) -> WorkflowStepHistoryResponse:
    entries: list[WorkflowStepHistoryEntry] = []
    step_name: str | None = None

    for execution in executions:
        for step in execution.get("steps_json", []):
            if str(step.get("step_id") or "") != step_id:
                continue
            step_name = step_name or str(step.get("name") or "")
            entries.append(
                WorkflowStepHistoryEntry(
                    execution_id=str(execution["id"]),
                    workflow_id=str(workflow["id"]),
                    step_id=step_id,
                    step_name=str(step.get("name") or step_id),
                    step_type=str(step.get("step_type") or "") or None,
                    execution_status=str(execution.get("status") or "failed"),
                    step_status=str(step.get("status") or "failed"),
                    trigger_type=str(execution.get("trigger_type") or workflow.get("trigger_type") or "manual"),
                    started_at=str(execution.get("started_at")),
                    finished_at=str(execution.get("finished_at")) if execution.get("finished_at") else None,
                    duration_ms=int(step.get("duration_ms") or 0),
                    output=dict(step.get("output") or {}),
                )
            )

    return WorkflowStepHistoryResponse(
        workflow_id=str(workflow["id"]),
        step_id=step_id,
        step_name=step_name,
        total_matches=len(entries),
        entries=entries,
    )


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


def build_chat_event_key(request: Request, workflow_id: str, session_id: str) -> str:
    request_key = extract_event_key(request, workflow_id)
    if request_key:
        return request_key
    return f"chat:{workflow_id}:{session_id}:{secrets.token_hex(6)}"


def pick_chat_response_message(output: dict[str, Any]) -> str | None:
    for key in ("message", "text", "summary"):
        value = output.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    result_value = output.get("result")
    if isinstance(result_value, str) and result_value.strip():
        return result_value.strip()
    value = output.get("value")
    if isinstance(value, str) and value.strip():
        return value.strip()
    data = output.get("data")
    if isinstance(data, str) and data.strip():
        return data.strip()
    if isinstance(data, dict):
        for key in ("message", "text", "summary"):
            nested = data.get(key)
            if isinstance(nested, str) and nested.strip():
                return nested.strip()
    return None


def extract_chat_response_text(execution: dict[str, Any], runtime_definition: dict[str, Any]) -> str:
    step_config_by_id = {
        str(step.get("id") or ""): dict(step.get("config") or {})
        for step in (runtime_definition.get("steps") or [])
    }
    for step in reversed(list(execution.get("steps_json") or [])):
        output = dict(step.get("output") or {})
        step_type = str(step.get("step_type") or "")
        step_config = step_config_by_id.get(str(step.get("step_id") or ""), {})
        if step_type == "output":
            operation = str(step_config.get("operation") or "")
            response_mode = str(output.get("response_mode") or step_config.get("response_mode") or "")
            if operation == "respond" or response_mode in {"chat", "streaming", "using_response_nodes", "when_last_node_finishes"}:
                candidate = pick_chat_response_message(output)
                if candidate:
                    return candidate
        candidate = pick_chat_response_message(output)
        if candidate:
            return candidate

    result_payload = dict(execution.get("result_json") or {})
    summary = result_payload.get("summary")
    if isinstance(summary, str) and summary.strip():
        return summary.strip()
    context = dict(result_payload.get("context") or {})
    for key in ("text", "message"):
        value = context.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return "Workflow completed successfully."


def build_chat_trigger_payload(
    payload: ChatTriggerRequest,
    request: Request,
    *,
    trigger_config: dict[str, Any],
) -> tuple[dict[str, Any], str]:
    session_id = str(payload.session_id or f"cs-{secrets.token_hex(12)}")
    history = [item.model_dump() for item in payload.history]
    messages = list(history) if str(trigger_config.get("chat_load_previous_session") or "off") == "from_memory" else []
    messages.append({"role": "user", "content": payload.message})
    runtime_payload = {
        "message": payload.message,
        "text": payload.message,
        "session_id": session_id,
        "history": history,
        "messages": messages,
        "metadata": dict(payload.metadata or {}),
        "_trigger_type": "chat",
        "_headers": dict(request.headers),
        "_query": dict(request.query_params),
        "_chat": {
            "mode": str(trigger_config.get("chat_mode") or "hosted"),
            "response_mode": str(trigger_config.get("chat_response_mode") or "streaming"),
        },
    }
    return runtime_payload, session_id


def build_public_base_url(request: Request | None, workspace_id: str) -> str:
    workspace_settings = get_workspace_settings(workspace_id)
    return str(
        workspace_settings.get("public_base_url")
        or settings.public_base_url
        or (str(request.base_url).rstrip("/") if request is not None else "http://127.0.0.1:8000")
    ).rstrip("/")


def build_public_chat_urls(*, base_url: str, workspace_id: str, workflow_id: str) -> dict[str, str]:
    public_chat_path = f"{settings.api_prefix}/chat/{workspace_id}/{workflow_id}"
    public_chat_stream_path = f"{public_chat_path}/stream"
    hosted_chat_path = f"/chat/{workspace_id}/{workflow_id}"
    widget_script_path = "/flowholt-chat-widget.js"
    widget_embed_html = (
        f'<script src="{base_url}{widget_script_path}" '
        f'data-workspace-id="{workspace_id}" '
        f'data-workflow-id="{workflow_id}" async></script>'
    )
    return {
        "public_chat_path": public_chat_path,
        "public_chat_url": f"{base_url}{public_chat_path}",
        "public_chat_stream_path": public_chat_stream_path,
        "public_chat_stream_url": f"{base_url}{public_chat_stream_path}",
        "hosted_chat_path": hosted_chat_path,
        "hosted_chat_url": f"{base_url}{hosted_chat_path}",
        "widget_script_path": widget_script_path,
        "widget_script_url": f"{base_url}{widget_script_path}",
        "widget_embed_html": widget_embed_html,
    }


def build_hosted_chat_url(*, base_url: str, workspace_id: str, workflow_id: str) -> tuple[str, str]:
    urls = build_public_chat_urls(base_url=base_url, workspace_id=workspace_id, workflow_id=workflow_id)
    return urls["hosted_chat_path"], urls["hosted_chat_url"]


PUBLIC_CHAT_PATH_RE = re.compile(
    rf"^{re.escape(settings.api_prefix)}/chat/(?P<workspace_id>[^/]+)/(?P<workflow_id>[^/]+)(?:/stream)?/?$"
)


def normalize_chat_allowed_origins(value: str | None) -> list[str]:
    raw = str(value or "").strip()
    if raw in {"", "*"}:
        return ["*"]
    origins: list[str] = []
    for item in raw.split(","):
        cleaned = item.strip().rstrip("/")
        if cleaned and cleaned not in origins:
            origins.append(cleaned)
    return origins or ["*"]


def is_chat_origin_allowed(origin: str | None, allowed_origins_value: str | None) -> bool:
    if not origin:
        return True
    allowed_origins = normalize_chat_allowed_origins(allowed_origins_value)
    if "*" in allowed_origins:
        return True
    return origin.rstrip("/") in allowed_origins


def build_public_chat_cors_headers(
    *,
    origin: str | None,
    allowed_origins_value: str | None,
    requested_headers: str | None = None,
) -> dict[str, str]:
    if not origin or not is_chat_origin_allowed(origin, allowed_origins_value):
        return {}
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": requested_headers or "Authorization, Content-Type",
        "Access-Control-Max-Age": "600",
        "Vary": "Origin",
    }


def resolve_public_chat_cors_context(request: Request) -> dict[str, Any] | None:
    match = PUBLIC_CHAT_PATH_RE.match(request.url.path)
    if not match:
        return None

    workspace_id = match.group("workspace_id")
    workflow_id = match.group("workflow_id")
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None or str(workflow.get("trigger_type") or "") != "chat":
        return None

    workspace_settings = get_workspace_settings(workspace_id)
    if not bool(workspace_settings.get("allow_public_chat_triggers", True)):
        return None

    runtime_definition, _ = resolve_runtime_definition_for_environment(
        workflow,
        environment="production",
        use_published_version=True,
    )
    trigger_config = get_trigger_step_config(runtime_definition)
    if not bool(trigger_config.get("chat_public")):
        return None

    return {
        "allowed_origins": str(trigger_config.get("chat_allowed_origins") or "*") or "*",
    }


def decode_basic_auth_header(authorization: str) -> tuple[str, str] | None:
    if not authorization.lower().startswith("basic "):
        return None
    encoded = authorization[6:].strip()
    try:
        decoded = base64.b64decode(encoded, validate=True).decode("utf-8")
    except Exception:
        return None
    if ":" not in decoded:
        return None
    username, password = decoded.split(":", 1)
    return username, password


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
    persist_progress: bool = True,
) -> None:
    if not persist_progress:
        return
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


def record_execution_artifacts(
    *,
    execution_id: str,
    workflow_id: str,
    workspace_id: str,
    trigger_type: str,
    payload: dict[str, Any],
    step_results: list[dict[str, Any]],
    result: dict[str, Any] | None,
    error_text: str | None,
    pause_data: dict[str, Any] | None = None,
    persist_progress: bool = True,
    redact_payloads: bool = False,
) -> None:
    if not persist_progress:
        return
    create_execution_artifact(
        workspace_id=workspace_id,
        workflow_id=workflow_id,
        execution_id=execution_id,
        artifact_type="trigger_payload",
        direction="input",
        data={"trigger_type": trigger_type, "payload": {"redacted": True} if redact_payloads else payload},
    )
    for step in step_results:
        step_id = str(step.get("step_id") or "") or None
        step_name = str(step.get("name") or "") or None
        create_execution_artifact(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            execution_id=execution_id,
            step_id=step_id,
            step_name=step_name,
            artifact_type="step_result",
            direction="output",
            data={
                "status": step.get("status"),
                "duration_ms": step.get("duration_ms"),
                "step_type": step.get("step_type"),
                "output": {"redacted": True} if redact_payloads else step.get("output"),
            },
        )
    if pause_data is not None:
        create_execution_artifact(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            execution_id=execution_id,
            step_id=str(pause_data.get("step_id") or "") or None,
            step_name=str(pause_data.get("step_name") or "") or None,
            artifact_type="pause_state",
            direction="pause",
            data={"redacted": True} if redact_payloads else pause_data,
        )
    if result is not None:
        create_execution_artifact(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            execution_id=execution_id,
            artifact_type="execution_result",
            direction="summary",
            data={"redacted": True} if redact_payloads else result,
        )
    if error_text:
        create_execution_artifact(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            execution_id=execution_id,
            artifact_type="execution_error",
            direction="error",
            data={"message": error_text},
        )


def _should_persist_execution_history(
    *,
    workflow_settings: Any,
    trigger_type: str,
    status: str,
) -> bool:
    if status == "paused":
        return True
    if trigger_type == "manual" and not bool(getattr(workflow_settings, "save_manual_executions", True)):
        return False
    if status == "success" and getattr(workflow_settings, "save_successful_executions", "all") == "none":
        return False
    if status == "failed" and getattr(workflow_settings, "save_failed_executions", "all") == "none":
        return False
    return True


def _should_persist_execution_progress(*, workflow_settings: Any) -> bool:
    return bool(getattr(workflow_settings, "save_execution_progress", True))


def _workspace_execution_defaults(settings_payload: dict[str, Any] | None) -> dict[str, Any]:
    if not settings_payload:
        return {}
    save_execution_data = bool(settings_payload.get("save_execution_data", True))
    return {
        "timezone": str(settings_payload.get("timezone") or "UTC"),
        "timeout_seconds": int(settings_payload.get("execution_timeout_seconds") or 3600),
        "save_failed_executions": str(settings_payload.get("save_failed_executions") or ("all" if save_execution_data else "none")),
        "save_successful_executions": str(settings_payload.get("save_successful_executions") or ("all" if save_execution_data else "none")),
        "save_manual_executions": bool(settings_payload.get("save_manual_executions", save_execution_data)),
        "save_execution_progress": bool(settings_payload.get("save_execution_progress", False)),
    }


def _redact_execution_steps(steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    redacted: list[dict[str, Any]] = []
    for step in steps:
        item = dict(step)
        if "output" in item:
            item["output"] = {"redacted": True}
        redacted.append(item)
    return redacted


def _apply_execution_retention(
    *,
    execution_id: str,
    workspace_id: str,
    workflow_settings: Any,
    trigger_type: str,
    status: str,
) -> None:
    if _should_persist_execution_history(
        workflow_settings=workflow_settings,
        trigger_type=trigger_type,
        status=status,
    ):
        return
    delete_execution_storage(execution_id, workspace_id=workspace_id)


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


def get_workspace_binding_context(workspace_id: str) -> dict[str, list[dict[str, Any]]]:
    assets = list_vault_assets(workspace_id=workspace_id)
    return {
        "connections": [asset for asset in assets if asset["kind"] == "connection"],
        "credentials": [asset for asset in assets if asset["kind"] == "credential"],
        "variables": [asset for asset in assets if asset["kind"] == "variable"],
        "members": list_workspace_members(workspace_id),
    }


def can_edit_vault_asset(asset: dict[str, Any], session: dict[str, Any]) -> bool:
    role = str(session["workspace"].get("role", "viewer"))
    user_id = str(session["user"]["id"])
    if role in {"owner", "admin"}:
        return True

    visibility = str(asset.get("visibility") or "workspace")
    owner_user_id = str(asset.get("created_by_user_id") or "")
    allowed_roles = {str(item) for item in (asset.get("allowed_roles") or [])}
    allowed_user_ids = {str(item) for item in (asset.get("allowed_user_ids") or [])}

    if owner_user_id and owner_user_id == user_id:
        return True
    if visibility == "workspace":
        return True
    if visibility == "private":
        return False
    return role in allowed_roles or user_id in allowed_user_ids


def can_test_vault_asset(asset: dict[str, Any], session: dict[str, Any]) -> bool:
    del session
    return asset.get("workspace_id") is not None


def get_role_rank(role: str) -> int:
    return {
        "viewer": 0,
        "builder": 1,
        "admin": 2,
        "owner": 3,
    }.get(role, 0)


def session_meets_min_role(session: dict[str, Any], min_role: str) -> bool:
    return get_role_rank(str(session["workspace"].get("role", "viewer"))) >= get_role_rank(min_role)


def get_trigger_step_config(definition: dict[str, Any]) -> dict[str, Any]:
    trigger_step = next(
        (step for step in (definition.get("steps") or []) if str(step.get("type") or "") == "trigger"),
        None,
    )
    return dict(trigger_step.get("config") or {}) if trigger_step else {}


def normalize_chat_initial_messages(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if not isinstance(value, str):
        return []
    return [line.strip() for line in value.splitlines() if line.strip()]


def resolve_public_trigger_type(workflow_trigger_type: str, trigger_config: dict[str, Any]) -> str | None:
    if workflow_trigger_type == "webhook":
        return "webhook"
    if workflow_trigger_type == "chat" and bool(trigger_config.get("chat_public")):
        return "chat"
    return None


def public_trigger_is_allowed(settings_payload: dict[str, Any], public_trigger_type: str | None) -> bool:
    if public_trigger_type == "webhook":
        return bool(settings_payload.get("allow_public_webhooks", True))
    if public_trigger_type == "chat":
        return bool(settings_payload.get("allow_public_chat_triggers", True))
    return True


def get_step_asset_references(step: dict[str, Any]) -> list[tuple[str, str]]:
    config = dict(step.get("config") or {})
    references: list[tuple[str, str]] = []
    mapping = {
        "connection_name": "connection",
        "credential_name": "credential",
        "credential": "credential",
        "credential_id": "credential",
        "email_credential": "credential",
        "model_variable_name": "variable",
        "webhook_variable_name": "variable",
    }
    for key, kind in mapping.items():
        value = config.get(key)
        if value:
            references.append((kind, str(value)))
    for value in config.values():
        references.extend(extract_vault_references_from_value(value))
    return references


def extract_vault_references_from_value(value: Any) -> list[tuple[str, str]]:
    results: list[tuple[str, str]] = []
    if isinstance(value, str):
        for match in re.findall(r"\{\{\s*vault\.(connection|credential|variable)\.([^.\}]+)", value):
            results.append((match[0], match[1].strip()))
    elif isinstance(value, dict):
        for nested in value.values():
            results.extend(extract_vault_references_from_value(nested))
    elif isinstance(value, list):
        for nested in value:
            results.extend(extract_vault_references_from_value(nested))
    return results


def resolve_vault_asset_reference(
    *,
    kind: str,
    reference: str,
    workspace_id: str,
) -> dict[str, Any] | None:
    asset = get_vault_asset_by_name(kind=kind, name=reference, workspace_id=workspace_id)
    if asset is not None:
        return asset

    asset = get_vault_asset(reference, workspace_id=workspace_id)
    if asset is not None and str(asset.get("kind") or "") == kind:
        return asset

    return None


def get_step_asset_bindings(step: dict[str, Any], *, workspace_id: str, session: dict[str, Any]) -> list[StudioStepAssetBinding]:
    bindings: list[StudioStepAssetBinding] = []
    seen: set[tuple[str, str]] = set()
    for kind, reference in get_step_asset_references(step):
        if (kind, reference) in seen:
            continue
        seen.add((kind, reference))
        asset = resolve_vault_asset_reference(kind=kind, reference=reference, workspace_id=workspace_id)
        if asset is None:
            continue
        asset_name = str(asset.get("name") or reference)
        bindings.append(
            StudioStepAssetBinding(
                kind=kind,
                name=asset_name,
                editable=can_edit_vault_asset(asset, session),
                testable=can_test_vault_asset(asset, session),
                visibility=str(asset.get("visibility") or "workspace"),
            )
        )
    return bindings


def build_step_access_response(
    workflow_id: str,
    step: dict[str, Any],
    *,
    workspace_id: str,
    session: dict[str, Any],
) -> StudioStepAccessResponse:
    bindings = get_step_asset_bindings(step, workspace_id=workspace_id, session=session)
    warnings = [
        f"{binding.kind.capitalize()} '{binding.name}' is locked for editing in this workspace."
        for binding in bindings
        if not binding.editable
    ]
    return StudioStepAccessResponse(
        workflow_id=workflow_id,
        step_id=str(step.get("id") or ""),
        can_edit=all(binding.editable for binding in bindings) if bindings else True,
        can_test=all(binding.testable for binding in bindings) if bindings else True,
        bindings=bindings,
        warnings=warnings,
    )


def enforce_workflow_asset_access_or_raise(
    definition: dict[str, Any],
    *,
    workspace_id: str,
    session: dict[str, Any],
) -> None:
    blocked_assets: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for step in definition.get("steps", []):
        for kind, reference in get_step_asset_references(step):
            if (kind, reference) in seen:
                continue
            seen.add((kind, reference))
            asset = resolve_vault_asset_reference(kind=kind, reference=reference, workspace_id=workspace_id)
            if asset is None:
                continue
            if not can_edit_vault_asset(asset, session):
                blocked_assets.append(
                    {
                        "kind": kind,
                        "name": str(asset.get("name") or reference),
                        "visibility": str(asset.get("visibility") or "workspace"),
                        "step_id": str(step.get("id") or ""),
                        "step_name": str(step.get("name") or ""),
                    }
                )
    if blocked_assets:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Workflow references one or more locked Vault assets",
                "assets": blocked_assets,
            },
        )


def collect_referenced_assets(definition: dict[str, Any], *, workspace_id: str) -> list[dict[str, Any]]:
    assets: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for step in definition.get("steps", []):
        for kind, reference in get_step_asset_references(step):
            key = (kind, reference)
            if key in seen:
                continue
            seen.add(key)
            asset = resolve_vault_asset_reference(kind=kind, reference=reference, workspace_id=workspace_id)
            if asset is not None:
                assets.append(asset)
    return assets


def build_workflow_policy_response(
    workflow_id: str,
    *,
    workflow_trigger_type: str,
    definition: dict[str, Any],
    workspace_id: str,
    session: dict[str, Any],
) -> WorkflowPolicyResponse:
    settings_payload = get_workspace_settings(workspace_id)
    referenced_assets = collect_referenced_assets(definition, workspace_id=workspace_id)
    uses_production_assets = any(str(asset.get("scope") or "workspace") == "production" for asset in referenced_assets)
    trigger_config = get_trigger_step_config(definition)
    public_webhook_requested = workflow_trigger_type == "webhook"
    public_chat_trigger_requested = workflow_trigger_type == "chat" and bool(trigger_config.get("chat_public"))
    public_trigger_type = resolve_public_trigger_type(workflow_trigger_type, trigger_config)
    public_trigger_requested = public_trigger_type is not None
    warnings: list[str] = []
    if uses_production_assets:
        warnings.append("This workflow uses one or more production-scoped Vault assets.")
    if public_webhook_requested and not settings_payload.get("allow_public_webhooks", True):
        warnings.append("Workspace policy currently blocks publishing public webhook workflows.")
    if public_chat_trigger_requested and not settings_payload.get("allow_public_chat_triggers", True):
        warnings.append("Workspace policy currently blocks publishing public chat trigger workflows.")
    if not session_meets_min_role(session, str(settings_payload.get("staging_min_role") or "builder")):
        warnings.append("Your current role does not meet the minimum staging promotion policy for this workspace.")
    if not session_meets_min_role(session, str(settings_payload.get("publish_min_role") or "builder")):
        warnings.append("Your current role does not meet the minimum publish policy for this workspace.")
    if not session_meets_min_role(session, str(settings_payload.get("run_min_role") or "builder")):
        warnings.append("Your current role does not meet the minimum run policy for this workspace.")
    if uses_production_assets and not session_meets_min_role(session, str(settings_payload.get("production_asset_min_role") or "admin")):
        warnings.append("Your current role cannot operate workflows that bind to production-scoped assets.")
    if settings_payload.get("require_staging_approval", False):
        warnings.append("Staging promotions require an approval review in this workspace.")
    if settings_payload.get("require_production_approval", False):
        warnings.append("Production promotions require an approval review in this workspace.")
    return WorkflowPolicyResponse(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        can_run=session_meets_min_role(session, str(settings_payload.get("run_min_role") or "builder"))
        and (not uses_production_assets or session_meets_min_role(session, str(settings_payload.get("production_asset_min_role") or "admin"))),
        can_promote_to_staging=session_meets_min_role(session, str(settings_payload.get("staging_min_role") or "builder"))
        and (not uses_production_assets or session_meets_min_role(session, str(settings_payload.get("production_asset_min_role") or "admin"))),
        can_publish=session_meets_min_role(session, str(settings_payload.get("publish_min_role") or "builder"))
        and public_trigger_is_allowed(settings_payload, public_trigger_type)
        and (not uses_production_assets or session_meets_min_role(session, str(settings_payload.get("production_asset_min_role") or "admin"))),
        uses_production_assets=uses_production_assets,
        public_webhook_requested=public_webhook_requested,
        public_chat_trigger_requested=public_chat_trigger_requested,
        public_trigger_requested=public_trigger_requested,
        public_trigger_type=public_trigger_type,
        staging_min_role=str(settings_payload.get("staging_min_role") or "builder"),
        run_min_role=str(settings_payload.get("run_min_role") or "builder"),
        publish_min_role=str(settings_payload.get("publish_min_role") or "builder"),
        production_asset_min_role=str(settings_payload.get("production_asset_min_role") or "admin"),
        require_staging_before_production=bool(settings_payload.get("require_staging_before_production", False)),
        require_staging_approval=bool(settings_payload.get("require_staging_approval", False)),
        require_production_approval=bool(settings_payload.get("require_production_approval", False)),
        deployment_approval_min_role=str(settings_payload.get("deployment_approval_min_role") or "admin"),
        allow_self_approval=bool(settings_payload.get("allow_self_approval", False)),
        warnings=warnings,
    )


def build_workflow_environments_response(workflow: dict[str, Any], *, workspace_id: str) -> WorkflowEnvironmentsResponse:
    settings_payload = get_workspace_settings(workspace_id)
    staging = get_staging_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
    production = get_published_workflow_version(str(workflow["id"]), workspace_id=workspace_id)

    def _normalize(item: dict[str, Any] | None) -> WorkflowEnvironmentVersion | None:
        if item is None:
            return None
        return WorkflowEnvironmentVersion(
            version_id=str(item["id"]),
            version_number=int(item["version_number"]),
            status=str(item["status"]),
            notes=str(item.get("notes") or "") or None,
            created_at=str(item["created_at"]),
        )

    return WorkflowEnvironmentsResponse(
        workflow_id=str(workflow["id"]),
        workspace_id=workspace_id,
        require_staging_before_production=bool(settings_payload.get("require_staging_before_production", False)),
        staging=_normalize(staging),
        production=_normalize(production),
    )


def resolve_workflow_reference(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    ref: str,
    version_id: str | None = None,
) -> tuple[dict[str, Any], str]:
    if ref == "draft":
        return (
            {
                "id": None,
                "workflow_id": workflow["id"],
                "version_number": int(workflow.get("current_version_number") or 0),
                "status": "draft",
                "notes": None,
                "definition_json": workflow["definition_json"],
                "created_at": str(workflow.get("created_at") or ""),
            },
            "draft",
        )
    if ref == "staging":
        version = get_staging_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
        if version is None:
            raise HTTPException(status_code=404, detail="No staged version exists for this workflow")
        return version, "staging"
    if ref == "production":
        version = get_published_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
        if version is None:
            raise HTTPException(status_code=404, detail="No production version exists for this workflow")
        return version, "production"
    if ref == "version":
        if not version_id:
            raise HTTPException(status_code=400, detail="version_id is required when ref=version")
        version = get_workflow_version(version_id, workspace_id=workspace_id)
        if version is None or str(version["workflow_id"]) != str(workflow["id"]):
            raise HTTPException(status_code=404, detail="Workflow version not found")
        return version, f"version:{version_id}"
    raise HTTPException(status_code=400, detail=f"Unsupported workflow compare reference: {ref}")


def build_workflow_compare_response(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    from_ref: str,
    to_ref: str,
    from_version_id: str | None = None,
    to_version_id: str | None = None,
) -> WorkflowCompareResponse:
    left, left_label = resolve_workflow_reference(
        workflow,
        workspace_id=workspace_id,
        ref=from_ref,
        version_id=from_version_id,
    )
    right, right_label = resolve_workflow_reference(
        workflow,
        workspace_id=workspace_id,
        ref=to_ref,
        version_id=to_version_id,
    )
    left_definition = dict(left.get("definition_json") or {})
    right_definition = dict(right.get("definition_json") or {})

    left_steps = {str(item.get("id")): item for item in (left_definition.get("steps") or [])}
    right_steps = {str(item.get("id")): item for item in (right_definition.get("steps") or [])}
    left_edges = {str(item.get("id")): item for item in (left_definition.get("edges") or [])}
    right_edges = {str(item.get("id")): item for item in (right_definition.get("edges") or [])}

    changes: list[WorkflowCompareChange] = []
    stats = WorkflowCompareStats()

    for step_id in sorted(set(left_steps) | set(right_steps)):
        left_step = left_steps.get(step_id)
        right_step = right_steps.get(step_id)
        if left_step is None and right_step is not None:
            changes.append(
                WorkflowCompareChange(
                    entity_type="step",
                    change_type="added",
                    id=step_id,
                    label=str(right_step.get("name") or step_id),
                    summary=f"Step added as {right_step.get('type')}.",
                )
            )
            stats.steps_added += 1
        elif right_step is None and left_step is not None:
            changes.append(
                WorkflowCompareChange(
                    entity_type="step",
                    change_type="removed",
                    id=step_id,
                    label=str(left_step.get("name") or step_id),
                    summary=f"Step removed from {left_step.get('type')}.",
                )
            )
            stats.steps_removed += 1
        elif left_step != right_step and left_step is not None and right_step is not None:
            summary_bits: list[str] = []
            if str(left_step.get("name") or "") != str(right_step.get("name") or ""):
                summary_bits.append("name changed")
            if str(left_step.get("type") or "") != str(right_step.get("type") or ""):
                summary_bits.append("type changed")
            if dict(left_step.get("config") or {}) != dict(right_step.get("config") or {}):
                summary_bits.append("config changed")
            changes.append(
                WorkflowCompareChange(
                    entity_type="step",
                    change_type="modified",
                    id=step_id,
                    label=str(right_step.get("name") or left_step.get("name") or step_id),
                    summary=", ".join(summary_bits) or "Step definition changed.",
                )
            )
            stats.steps_modified += 1

    for edge_id in sorted(set(left_edges) | set(right_edges)):
        left_edge = left_edges.get(edge_id)
        right_edge = right_edges.get(edge_id)
        if left_edge is None and right_edge is not None:
            changes.append(
                WorkflowCompareChange(
                    entity_type="edge",
                    change_type="added",
                    id=edge_id,
                    label=edge_id,
                    summary=f"Edge added from {right_edge.get('source')} to {right_edge.get('target')}.",
                )
            )
            stats.edges_added += 1
        elif right_edge is None and left_edge is not None:
            changes.append(
                WorkflowCompareChange(
                    entity_type="edge",
                    change_type="removed",
                    id=edge_id,
                    label=edge_id,
                    summary=f"Edge removed from {left_edge.get('source')} to {left_edge.get('target')}.",
                )
            )
            stats.edges_removed += 1
        elif left_edge != right_edge and left_edge is not None and right_edge is not None:
            changes.append(
                WorkflowCompareChange(
                    entity_type="edge",
                    change_type="modified",
                    id=edge_id,
                    label=edge_id,
                    summary=f"Edge changed from {left_edge.get('source')}->{left_edge.get('target')} to {right_edge.get('source')}->{right_edge.get('target')}.",
                )
            )
            stats.edges_modified += 1

    warnings: list[str] = []
    if not changes:
        warnings.append("No structural differences found between these workflow references.")

    return WorkflowCompareResponse(
        workflow_id=str(workflow["id"]),
        from_ref=left_label,
        to_ref=right_label,
        from_version_id=str(left["id"]) if left.get("id") else None,
        to_version_id=str(right["id"]) if right.get("id") else None,
        from_version_number=int(left.get("version_number") or 0) if left.get("id") else None,
        to_version_number=int(right.get("version_number") or 0) if right.get("id") else None,
        stats=stats,
        changes=changes,
        warnings=warnings,
    )


def build_workflow_deployment_summary(deployment: dict[str, Any]) -> WorkflowDeploymentSummary:
    return WorkflowDeploymentSummary.model_validate(
        {
            **deployment,
            "metadata": deployment.get("metadata_json") or {},
        }
    )


def build_workflow_deployment_detail(
    deployment: dict[str, Any],
    *,
    workspace_id: str,
) -> WorkflowDeploymentDetail:
    to_version = get_workflow_version(str(deployment["to_version_id"]), workspace_id=workspace_id)
    if to_version is None:
        raise HTTPException(status_code=404, detail="Target deployment version not found")
    from_version = None
    if deployment.get("from_version_id"):
        from_version = get_workflow_version(str(deployment["from_version_id"]), workspace_id=workspace_id)
    return WorkflowDeploymentDetail(
        **build_workflow_deployment_summary(deployment).model_dump(),
        from_version=WorkflowVersionSummary.model_validate(from_version) if from_version else None,
        to_version=WorkflowVersionSummary.model_validate(to_version),
        can_rollback=bool(deployment.get("to_version_id")),
    )


def requires_deployment_approval(settings_payload: dict[str, Any], target_environment: str) -> bool:
    if target_environment == "staging":
        return bool(settings_payload.get("require_staging_approval", False))
    if target_environment == "production":
        return bool(settings_payload.get("require_production_approval", False))
    return False


def can_review_deployment(
    session: dict[str, Any],
    *,
    settings_payload: dict[str, Any],
    requested_by_user_id: str | None = None,
) -> bool:
    if not session_meets_min_role(session, str(settings_payload.get("deployment_approval_min_role") or "admin")):
        return False
    if not bool(settings_payload.get("allow_self_approval", False)) and requested_by_user_id:
        return str(session["user"]["id"]) != requested_by_user_id
    return True


def build_workflow_deployment_review_summary(review: dict[str, Any]) -> WorkflowDeploymentReviewSummary:
    return WorkflowDeploymentReviewSummary.model_validate(review)


def build_workflow_deployment_review_detail(
    review: dict[str, Any],
    *,
    workspace_id: str,
    session: dict[str, Any],
) -> WorkflowDeploymentReviewDetail:
    target_version = get_workflow_version(str(review["target_version_id"]), workspace_id=workspace_id)
    if target_version is None:
        raise HTTPException(status_code=404, detail="Review target version not found")
    members = {str(item["user_id"]): item for item in list_workspace_members(workspace_id)}
    settings_payload = get_workspace_settings(workspace_id)
    return WorkflowDeploymentReviewDetail(
        **review,
        target_version=WorkflowVersionSummary.model_validate(target_version),
        requested_by_name=str((members.get(str(review["requested_by_user_id"])) or {}).get("name") or "") or None,
        reviewed_by_name=str((members.get(str(review.get("reviewed_by_user_id") or "")) or {}).get("name") or "") or None,
        can_approve=str(review.get("status")) == "pending"
        and can_review_deployment(
            session,
            settings_payload=settings_payload,
            requested_by_user_id=str(review["requested_by_user_id"]),
        ),
        can_reject=str(review.get("status")) == "pending"
        and can_review_deployment(
            session,
            settings_payload=settings_payload,
            requested_by_user_id=str(review["requested_by_user_id"]),
        ),
    )


def build_assistant_template_match_response(
    prompt: str,
    *,
    workspace_id: str,
) -> AssistantTemplateMatchResponse:
    templates = list_templates(workspace_id=workspace_id)
    plan = build_assistant_plan(prompt, templates)
    return AssistantTemplateMatchResponse(
        prompt=prompt,
        matches=[AssistantTemplateMatch.model_validate(item) for item in plan["matched_templates"]],
    )


def build_assistant_plan_response(
    prompt: str,
    *,
    workspace_id: str,
) -> AssistantPlanResponse:
    templates = list_templates(workspace_id=workspace_id)
    plan = build_assistant_plan(prompt, templates)
    return AssistantPlanResponse(
        prompt=prompt,
        suggested_name=str(plan["suggested_name"]),
        trigger_type=str(plan["trigger_type"]),
        category=str(plan["category"]),
        summary=str(plan["summary"]),
        matched_templates=[AssistantTemplateMatch.model_validate(item) for item in plan["matched_templates"]],
        suggested_nodes=[AssistantSuggestedNode.model_validate(item) for item in plan["suggested_nodes"]],
        warnings=list(plan["warnings"]),
    )


def build_assistant_workflow_context_response(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    session: dict[str, Any],
) -> AssistantWorkflowContextResponse:
    snapshot = build_assistant_workflow_snapshot(
        workflow,
        workspace_id=workspace_id,
        session=session,
    )
    return AssistantWorkflowContextResponse(
        workflow=WorkflowDetail.model_validate({**workflow, "definition": workflow["definition_json"]}),
        observability=snapshot["observability"],
        policy=snapshot["policy"],
        environments=snapshot["environments"],
        validation=snapshot["validation"],
        versions=[
            WorkflowVersionSummary.model_validate(item)
            for item in list_workflow_versions(str(workflow["id"]), workspace_id=workspace_id)[:8]
        ],
        deployments=[
            WorkflowDeploymentSummary.model_validate(item)
            for item in list_workflow_deployments(str(workflow["id"]), workspace_id=workspace_id)[:8]
        ],
        summary=str(snapshot["summary"]),
        notable_steps=list(snapshot["notable_steps"]),
        warnings=list(snapshot["warnings"]),
        workflow_settings=snapshot["settings"],
        runtime_issues=snapshot["runtime_issues"],
    )


def enforce_workflow_governance_or_raise(
    definition: dict[str, Any],
    *,
    workflow_id: str,
    workflow_trigger_type: str,
    workspace_id: str,
    session: dict[str, Any],
    action: str,
) -> None:
    policy = build_workflow_policy_response(
        workflow_id,
        workflow_trigger_type=workflow_trigger_type,
        definition=definition,
        workspace_id=workspace_id,
        session=session,
    )
    if action == "run" and not policy.can_run:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Workspace policy blocks running this workflow",
                "policy": policy.model_dump(),
            },
        )
    if action == "stage" and not policy.can_promote_to_staging:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Workspace policy blocks promoting this workflow to staging",
                "policy": policy.model_dump(),
            },
        )
    if action == "publish" and not policy.can_publish:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Workspace policy blocks publishing this workflow",
                "policy": policy.model_dump(),
            },
        )
    if action == "save" and policy.uses_production_assets and not session_meets_min_role(session, policy.production_asset_min_role):
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Workspace policy blocks editing workflows that use production assets",
                "policy": policy.model_dump(),
            },
        )


def build_studio_workflow_bundle_payload(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    selected_step_id: str | None = None,
) -> StudioWorkflowBundleResponse:
    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None

    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    workflow_detail = WorkflowDetail.model_validate({**workflow, "definition": repaired_definition})
    integrity = WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            workflow["definition_json"],
            workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        )
    )
    catalog = NodeCatalogResponse.model_validate(build_node_catalog())
    binding_context = get_workspace_binding_context(workspace_id)

    step_editors: list[StudioStepEditorEntry] = []
    selected_editor: NodeEditorResponse | None = None
    for step in repaired_definition.get("steps", []):
        editor_payload = build_node_editor_response(
            str(step["type"]),
            config=dict(step.get("config") or {}),
            workflow_trigger_type=str(workflow.get("trigger_type") or ""),
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
            step_name=str(step.get("name") or ""),
        )
        editor = NodeEditorResponse.model_validate(editor_payload)
        step_entry = StudioStepEditorEntry(
            step_id=str(step["id"]),
            step_name=str(step["name"]),
            node_type=str(step["type"]),
            editor=editor,
        )
        step_editors.append(step_entry)
        if selected_step_id and str(step["id"]) == selected_step_id:
            selected_editor = editor

    if selected_editor is None and step_editors:
        selected_editor = step_editors[0].editor

    return StudioWorkflowBundleResponse(
        workflow=workflow_detail,
        integrity=integrity,
        catalog=catalog,
        selected_step_editor=selected_editor,
        step_editors=step_editors,
    )


def validate_or_raise(definition: dict[str, Any], *, workflow_trigger_type: str | None = None) -> WorkflowValidationResponse:
    result = validate_workflow_definition(definition, workflow_trigger_type=workflow_trigger_type)
    response = WorkflowValidationResponse.model_validate(result)
    errors = [issue for issue in response.issues if issue.level == "error"]
    if errors:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Workflow definition validation failed",
                "issues": [issue.model_dump() for issue in response.issues],
            },
        )
    return response


def collect_runtime_node_contract_issues(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None,
    workspace_id: str,
) -> list[dict[str, Any]]:
    binding_context = get_workspace_binding_context(workspace_id)
    node_issues: list[dict[str, Any]] = []

    for step in definition.get("steps", []):
        try:
            result = validate_node_configuration(
                str(step.get("type") or ""),
                config=dict(step.get("config") or {}),
                trigger_type=workflow_trigger_type,
                connections=binding_context["connections"],
                credentials=binding_context["credentials"],
                variables=binding_context["variables"],
                members=binding_context["members"],
                step_name=str(step.get("name") or ""),
            )
        except ValueError as exc:
            node_issues.append(
                {
                    "level": "error",
                    "code": "unknown_node_type",
                    "message": str(exc),
                    "field": None,
                    "step_id": str(step.get("id") or ""),
                    "step_name": str(step.get("name") or ""),
                    "node_type": str(step.get("type") or ""),
                }
            )
            continue

        for issue in result.get("issues", []):
            node_issues.append(
                {
                    **issue,
                    "step_id": str(step.get("id") or ""),
                    "step_name": str(step.get("name") or ""),
                    "node_type": str(step.get("type") or ""),
                }
            )

    node_issues.extend(validate_workflow_cluster_configuration(definition))
    return node_issues


def validate_runtime_node_contracts_or_raise(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None,
    workspace_id: str,
) -> None:
    node_issues = collect_runtime_node_contract_issues(
        definition,
        workflow_trigger_type=workflow_trigger_type,
        workspace_id=workspace_id,
    )

    if any(issue["level"] == "error" for issue in node_issues):
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Workflow runtime contract validation failed",
                "issues": node_issues,
            },
        )


def normalize_definition_for_storage(definition: dict[str, Any], *, workflow_trigger_type: str | None = None) -> dict[str, Any]:
    return normalize_workflow_definition(definition, workflow_trigger_type=workflow_trigger_type)


def repair_definition_for_storage(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
    template_definition: dict[str, Any] | None = None,
) -> tuple[dict[str, Any], list[str]]:
    return repair_workflow_definition(
        definition,
        workflow_trigger_type=workflow_trigger_type,
        template_definition=template_definition,
    )


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
        # Header-based fallback — only allowed in dev mode
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


def enforce_chat_trigger_access(
    request: Request,
    *,
    workflow: dict[str, Any],
    trigger_config: dict[str, Any],
    public: bool,
) -> dict[str, Any] | None:
    workspace_id = str(workflow["workspace_id"])
    workspace_settings = get_workspace_settings(workspace_id)

    if public and not bool(trigger_config.get("chat_public")):
        raise HTTPException(status_code=403, detail="This chat trigger is not published for public access")
    if public and not bool(workspace_settings.get("allow_public_chat_triggers", True)):
        raise HTTPException(status_code=403, detail="Workspace policy blocks public chat triggers")

    origin = request.headers.get("origin")
    allowed_origins = str(trigger_config.get("chat_allowed_origins") or "*").strip()
    if origin and not is_chat_origin_allowed(origin, allowed_origins):
        raise HTTPException(status_code=403, detail="Origin is not allowed for this chat trigger")

    auth_mode = str(trigger_config.get("chat_authentication") or "none")
    if auth_mode == "basic_auth":
        expected_username = str(trigger_config.get("chat_basic_username") or "")
        expected_password = str(trigger_config.get("chat_basic_password") or "")
        if not expected_username or not expected_password:
            raise HTTPException(status_code=409, detail="Basic auth is enabled but chat credentials are not configured")
        provided = decode_basic_auth_header(request.headers.get("authorization", ""))
        if provided != (expected_username, expected_password):
            raise HTTPException(
                status_code=401,
                detail="Invalid chat credentials",
                headers={"WWW-Authenticate": "Basic"},
            )
        return None

    if auth_mode == "user_auth":
        session = get_optional_session_context(request, workspace_id=workspace_id)
        if session is None:
            raise HTTPException(status_code=401, detail="Sign in to access this chat trigger")
        if str(session["workspace"].get("id") or "") != workspace_id:
            raise HTTPException(status_code=403, detail="Signed-in workspace does not match this chat trigger")
        return session

    return None


_worker_task = None
_scheduler_task = None


@app.on_event("startup")
async def on_startup() -> None:
    global _worker_task, _scheduler_task
    init_db()
    seed_data()
    merge_plugins_into_registry()
    if settings.execution_mode == "async":
        _worker_task = await start_in_process_worker()
    _scheduler_task = await start_scheduler()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    request_shutdown()
    scheduler_request_shutdown()
    if _worker_task is not None:
        _worker_task.cancel()
    if _scheduler_task is not None:
        _scheduler_task.cancel()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        environment=settings.app_env,
        llm_mode=settings.llm_mode,
        database_backend=get_database_backend(),
    )


@app.get(f"{settings.api_prefix}/llm/status")
def llm_status() -> dict[str, Any]:
    router = get_llm_router()
    return {
        "configured_provider": settings.llm_provider,
        "available_providers": router.available_providers,
        "default_provider": router._default_provider,
        "execution_mode": settings.execution_mode,
        "worker_active": _worker_task is not None and not _worker_task.done(),
        "scheduler_active": _scheduler_task is not None and not _scheduler_task.done(),
    }


# ---------------------------------------------------------------------------
# System Status (comprehensive dashboard data)
# ---------------------------------------------------------------------------

@app.get(f"{settings.api_prefix}/system/status")
def system_status(session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    workspace_id = str(session["workspace"]["id"])
    router = get_llm_router()
    plugin_registry = get_plugin_registry()

    # Job queue stats
    jobs = list_workflow_jobs(workspace_id)
    pending_jobs = sum(1 for j in jobs if str(j.get("status")) == "pending")
    processing_jobs = sum(1 for j in jobs if str(j.get("status")) == "processing")
    failed_jobs = sum(1 for j in jobs if str(j.get("status")) == "failed")
    completed_jobs = sum(1 for j in jobs if str(j.get("status")) == "completed")

    # Execution stats (aggregate counts, not full rows)
    exec_counts = count_executions_by_status(workspace_id)
    total_executions = sum(exec_counts.values())
    success_executions = exec_counts.get("success", 0)
    failed_executions = exec_counts.get("failed", 0)
    running_executions = exec_counts.get("running", 0)

    # Workflow stats (aggregate counts, not full rows)
    wf_counts = count_workflows_by_status(workspace_id)
    total_workflows = sum(wf_counts.values())
    active_workflows = wf_counts.get("active", 0)

    # Integration stats
    integration_apps = list_integration_apps()
    plugin_count = len(plugin_registry._plugins) if plugin_registry else 0

    return {
        "platform": {
            "version": "0.1.0",
            "environment": settings.app_env,
            "database_backend": get_database_backend(),
            "execution_mode": settings.execution_mode,
        },
        "llm": {
            "configured_provider": settings.llm_provider,
            "available_providers": router.available_providers,
            "default_provider": router._default_provider,
        },
        "worker": {
            "active": _worker_task is not None and not _worker_task.done(),
            "mode": settings.execution_mode,
        },
        "scheduler": {
            "active": _scheduler_task is not None and not _scheduler_task.done(),
        },
        "jobs": {
            "pending": pending_jobs,
            "processing": processing_jobs,
            "failed": failed_jobs,
            "completed": completed_jobs,
            "total": len(jobs),
        },
        "executions": {
            "total": total_executions,
            "success": success_executions,
            "failed": failed_executions,
            "running": running_executions,
        },
        "workflows": {
            "total": total_workflows,
            "active": active_workflows,
        },
        "integrations": {
            "builtin_count": len(integration_apps),
            "plugin_count": plugin_count,
            "total": len(integration_apps) + plugin_count,
        },
    }


# ---------------------------------------------------------------------------
# Global Search
# ---------------------------------------------------------------------------

@app.get(f"{settings.api_prefix}/search")
def global_search(
    q: str = "",
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Search across workflows, executions, and vault assets by keyword."""
    workspace_id = str(session["workspace"]["id"])
    query = q.strip().lower()
    if not query or len(query) < 2:
        return {"workflows": [], "executions": [], "vault_assets": []}

    # Search workflows
    all_workflows = list_workflows(workspace_id) or []
    matched_workflows = []
    for wf in all_workflows:
        name = str(wf.get("name") or "").lower()
        category = str(wf.get("category") or "").lower()
        if query in name or query in category:
            matched_workflows.append({
                "id": wf["id"],
                "name": wf.get("name"),
                "status": wf.get("status"),
                "category": wf.get("category"),
                "type": "workflow",
            })
        if len(matched_workflows) >= 10:
            break

    # Search executions
    all_executions = list_executions(workspace_id, limit=200) or []
    matched_executions = []
    for ex in all_executions:
        wf_name = str(ex.get("workflow_name") or "").lower()
        status = str(ex.get("status") or "").lower()
        error_text = str(ex.get("error_text") or "").lower()
        if query in wf_name or query in status or query in error_text:
            matched_executions.append({
                "id": ex["id"],
                "workflow_name": ex.get("workflow_name"),
                "status": ex.get("status"),
                "started_at": ex.get("started_at"),
                "type": "execution",
            })
        if len(matched_executions) >= 10:
            break

    # Search vault assets
    vault_data = list_vault_assets(workspace_id=workspace_id) or []
    matched_vault = []
    for asset in vault_data:
        name = str(asset.get("name") or asset.get("key") or "").lower()
        kind = str(asset.get("kind") or "").lower()
        if query in name or query in kind:
            matched_vault.append({
                "id": asset["id"],
                "name": asset.get("name") or asset.get("key"),
                "kind": asset.get("kind"),
                "type": "vault_asset",
            })
        if len(matched_vault) >= 10:
            break

    return {
        "workflows": matched_workflows,
        "executions": matched_executions,
        "vault_assets": matched_vault,
    }


@app.get(f"{settings.api_prefix}/help/articles")
def get_help_articles(
    category: str | None = None,
    q: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    _ = session
    return list_help_articles(category=category, query=q)


# ---------------------------------------------------------------------------
# Code Execution Sandbox
# ---------------------------------------------------------------------------

@app.post(f"{settings.api_prefix}/sandbox/execute")
async def sandbox_execute(request: Request, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin", "builder")
    body = await request.json()
    code = str(body.get("code", ""))
    language = str(body.get("language", "python"))
    input_data = body.get("input_data", {})
    timeout = int(body.get("timeout", 30))

    if not code.strip():
        raise HTTPException(status_code=400, detail="Code must not be empty.")

    from .sandbox import execute_code
    result = await execute_code(code=code, language=language, input_data=input_data, timeout=timeout)
    return result


# ---------------------------------------------------------------------------
# OAuth2 Flows
# ---------------------------------------------------------------------------

@app.get(f"{settings.api_prefix}/oauth2/providers")
def oauth2_list_providers() -> list[dict[str, str]]:
    from .oauth2 import list_providers
    return list_providers()


@app.post(f"{settings.api_prefix}/oauth2/authorize")
def oauth2_authorize(request_body: dict[str, Any] | None = None, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    from .oauth2 import build_authorize_url

    if request_body is None:
        request_body = {}
    provider = str(request_body.get("provider", ""))
    client_id = str(request_body.get("client_id", ""))
    redirect_uri = str(request_body.get("redirect_uri", ""))
    scopes = request_body.get("scopes")

    if not provider or not client_id or not redirect_uri:
        raise HTTPException(status_code=400, detail="provider, client_id, and redirect_uri are required.")

    workspace_id = str(session["workspace"]["id"])
    url, state = build_authorize_url(
        provider=provider,
        client_id=client_id,
        redirect_uri=redirect_uri,
        workspace_id=workspace_id,
        scopes=scopes,
    )
    return {"authorize_url": url, "state": state}


@app.post(f"{settings.api_prefix}/oauth2/callback")
async def oauth2_callback(request_body: dict[str, Any] | None = None, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    from .oauth2 import validate_state, exchange_code

    if request_body is None:
        request_body = {}
    code = str(request_body.get("code", ""))
    state = str(request_body.get("state", ""))
    client_secret = str(request_body.get("client_secret", ""))

    if not code or not state:
        raise HTTPException(status_code=400, detail="code and state are required.")

    state_data = validate_state(state)
    if state_data is None:
        raise HTTPException(status_code=400, detail="Invalid or expired state token.")

    token_data = await exchange_code(
        provider=state_data["provider"],
        code=code,
        client_id=state_data["client_id"],
        client_secret=client_secret,
        redirect_uri=state_data["redirect_uri"],
    )

    # Store as a reusable vault connection for workflow nodes.
    workspace_id = state_data["workspace_id"]
    provider = state_data["provider"]
    asset_name = f"{provider.title()} OAuth2"
    asset_payload = VaultAssetCreate(
        kind="connection",
        name=asset_name,
        app=provider,
        subtitle="Connected via OAuth2",
        logo_url=f"https://cdn.simpleicons.org/{provider}",
        credential_type="oauth2",
        scope="workspace",
        status="active",
        secret=token_data,
    )

    existing_asset = get_vault_asset_by_name(kind="connection", name=asset_name, workspace_id=workspace_id)
    if existing_asset is None:
        create_vault_asset(
            asset_payload,
            workspace_id=workspace_id,
            created_by_user_id=str(session["user"]["id"]),
        )
        message = f"{provider.title()} connected successfully."
    else:
        update_vault_asset(
            str(existing_asset["id"]),
            VaultAssetUpdate(
                name=asset_name,
                app=provider,
                subtitle="Connected via OAuth2",
                logo_url=f"https://cdn.simpleicons.org/{provider}",
                credential_type="oauth2",
                scope="workspace",
                status="active",
                workflows_count=int(existing_asset.get("workflows_count") or 0),
                people_with_access=int(existing_asset.get("people_with_access") or 0),
                masked=True,
                secret=token_data,
            ),
            workspace_id=workspace_id,
        )
        message = f"{provider.title()} connection refreshed successfully."

    return {"success": True, "provider": provider, "message": message}


@app.post(f"{settings.api_prefix}/oauth2/refresh")
async def oauth2_refresh_token(request_body: dict[str, Any] | None = None, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    from .oauth2 import refresh_token

    if request_body is None:
        request_body = {}
    provider = str(request_body.get("provider", ""))
    refresh_token_value = str(request_body.get("refresh_token", ""))
    client_id = str(request_body.get("client_id", ""))
    client_secret = str(request_body.get("client_secret", ""))

    if not provider or not refresh_token_value or not client_id or not client_secret:
        raise HTTPException(status_code=400, detail="provider, refresh_token, client_id, and client_secret are required.")

    token_data = await refresh_token(
        provider=provider,
        refresh_token_value=refresh_token_value,
        client_id=client_id,
        client_secret=client_secret,
    )
    return token_data


# ── Workflow Import / Export ──────────────────────────────────────────

@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/export", response_model=WorkflowExportBundle)
def export_workflow(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowExportBundle:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    definition = workflow.get("definition_json") or {"steps": [], "edges": []}
    detail = WorkflowDetail.model_validate({
        **workflow,
        "definition": definition,
        "current_version_number": workflow.get("current_version_number") or 1,
        "published_version_id": workflow.get("published_version_id"),
    })
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.exported",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"name": workflow.get("name")},
    )
    return WorkflowExportBundle(
        exported_at=datetime.now(UTC).isoformat(),
        workflow=detail,
        metadata={
            "source_workspace": workspace_id,
            "steps_count": len(definition.get("steps", [])),
            "edges_count": len(definition.get("edges", [])),
        },
    )


@app.post(f"{settings.api_prefix}/workflows/import", response_model=WorkflowImportResponse)
def import_workflow(
    payload: WorkflowImportRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowImportResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    bundle = payload.bundle

    # Validate bundle structure
    if bundle.get("platform") != "flowholt":
        raise HTTPException(status_code=400, detail="Invalid export bundle: unsupported platform")

    wf_data = bundle.get("workflow")
    if not wf_data or not isinstance(wf_data, dict):
        raise HTTPException(status_code=400, detail="Invalid export bundle: missing workflow data")

    definition = wf_data.get("definition") or {"steps": [], "edges": [], "settings": {}}
    steps = definition.get("steps", [])
    edges = definition.get("edges", [])
    workflow_settings = definition.get("settings") or {}

    name = payload.name_override or wf_data.get("name") or "Imported Workflow"
    status = payload.status_override or "draft"
    trigger_type = wf_data.get("trigger_type") or "manual"
    category = wf_data.get("category") or "Custom"

    warnings: list[str] = []
    if len(steps) == 0:
        warnings.append("Imported workflow has no steps.")

    # Re-generate step IDs to avoid collisions
    import uuid as _uuid
    id_map: dict[str, str] = {}
    for step in steps:
        old_id = step["id"]
        new_id = f"step-{_uuid.uuid4().hex[:10]}"
        id_map[old_id] = new_id
        step["id"] = new_id
    for edge in edges:
        edge["source"] = id_map.get(edge["source"], edge["source"])
        edge["target"] = id_map.get(edge["target"], edge["target"])
        edge["id"] = f"edge-{edge['source']}-{edge['target']}"

    create_payload = WorkflowCreate(
        name=name,
        trigger_type=trigger_type,
        category=category,
        status=status,
        definition=WorkflowDefinition(
            steps=[WorkflowStep(**s) for s in steps],
            edges=[WorkflowEdge(**e) for e in edges],
            settings=WorkflowSettings(**workflow_settings),
        ),
    )
    workflow = create_workflow(create_payload, workspace_id=workspace_id)
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.imported",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"name": name, "steps_count": len(steps), "source_platform": bundle.get("platform")},
    )
    return WorkflowImportResponse(
        workflow_id=str(workflow["id"]),
        workflow_name=name,
        status=status,
        steps_count=len(steps),
        edges_count=len(edges),
        warnings=warnings,
    )


# ── Deep Health Probes ────────────────────────────────────────────────

@app.get(f"{settings.api_prefix}/health/deep")
def deep_health_check() -> dict[str, Any]:
    """Deep health check — probes database, LLM, scheduler, and worker."""
    checks: dict[str, dict[str, Any]] = {}
    overall = True

    # Database probe
    try:
        with get_db() as conn:
            conn.execute("SELECT 1").fetchone()
        checks["database"] = {"status": "healthy", "backend": get_database_backend()}
    except Exception as exc:
        checks["database"] = {"status": "unhealthy", "error": str(exc)[:200]}
        overall = False

    # LLM probe
    try:
        from .llm_router import get_llm_router
        router = get_llm_router()
        providers = router.list_available()
        checks["llm"] = {"status": "healthy" if providers else "degraded", "providers": providers}
        if not providers:
            overall = False
    except Exception as exc:
        checks["llm"] = {"status": "unhealthy", "error": str(exc)[:200]}
        overall = False

    # Plugins probe
    try:
        reg = get_plugin_registry()
        plugin_count = len(reg._plugins)
        checks["plugins"] = {"status": "healthy", "count": plugin_count}
    except Exception as exc:
        checks["plugins"] = {"status": "unhealthy", "error": str(exc)[:200]}

    # Worker probe
    try:
        from .worker import _shutdown_event
        worker_running = _shutdown_event is not None and not _shutdown_event.is_set()
        checks["worker"] = {"status": "healthy" if worker_running else "idle"}
    except Exception:
        checks["worker"] = {"status": "unknown"}

    # Scheduler probe
    try:
        from .scheduler import _scheduler_shutdown_event
        scheduler_running = _scheduler_shutdown_event is not None and not _scheduler_shutdown_event.is_set()
        checks["scheduler"] = {"status": "healthy" if scheduler_running else "idle"}
    except Exception:
        checks["scheduler"] = {"status": "unknown"}

    return {
        "status": "healthy" if overall else "degraded",
        "checks": checks,
        "timestamp": datetime.now(UTC).isoformat(),
    }


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
        next_actions.append("Set PUBLIC_BASE_URL or workspace public_base_url before sharing webhook or chat URLs.")
    if not workspace_settings.get("require_webhook_signature"):
        next_actions.append("Enable require_webhook_signature in workspace settings before public webhooks.")
    if workspace_settings.get("require_webhook_signature") and not workspace_settings.get("webhook_signing_secret"):
        next_actions.append("Save a webhook_signing_secret in workspace settings.")
    if not bool(workspace_settings.get("allow_public_chat_triggers", True)):
        next_actions.append("Enable allow_public_chat_triggers in workspace settings before sharing public chat endpoints.")

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


@app.get(f"{settings.api_prefix}/studio/nodes", response_model=list[NodeDefinitionSummary])
def get_studio_nodes(session: dict[str, Any] = Depends(get_session_context)) -> list[NodeDefinitionSummary]:
    _ = session
    return [NodeDefinitionSummary.model_validate(item) for item in list_node_definitions()]


@app.get(f"{settings.api_prefix}/studio/catalog", response_model=NodeCatalogResponse)
def get_studio_catalog(session: dict[str, Any] = Depends(get_session_context)) -> NodeCatalogResponse:
    _ = session
    return NodeCatalogResponse.model_validate(build_node_catalog())


@app.get(f"{settings.api_prefix}/studio/integrations", response_model=IntegrationCatalogResponse)
def get_studio_integrations(session: dict[str, Any] = Depends(get_session_context)) -> IntegrationCatalogResponse:
    _ = session
    return IntegrationCatalogResponse(apps=[IntegrationAppSummary.model_validate(item) for item in list_integration_apps()])


@app.get(f"{settings.api_prefix}/studio/integrations/{{app_key}}", response_model=IntegrationAppSummary)
def get_studio_integration_app(app_key: str, session: dict[str, Any] = Depends(get_session_context)) -> IntegrationAppSummary:
    _ = session
    item = get_integration_app(app_key)
    if item is None:
        raise HTTPException(status_code=404, detail="Integration app not found")
    normalized = {
        **item,
        "operations": [{key: op[key] for key in ("key", "label", "direction", "description", "resource")} for op in item["operations"]],
    }
    return IntegrationAppSummary.model_validate(normalized)


@app.get(f"{settings.api_prefix}/studio/integrations/{{app_key}}/operations/{{operation_key}}", response_model=IntegrationOperationDetail)
def get_studio_integration_operation(
    app_key: str,
    operation_key: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> IntegrationOperationDetail:
    _ = session
    item = get_integration_operation(app_key, operation_key)
    if item is None:
        raise HTTPException(status_code=404, detail="Integration operation not found")
    return IntegrationOperationDetail.model_validate(item)


@app.get(f"{settings.api_prefix}/studio/nodes/{{node_type}}", response_model=NodeDefinitionSummary)
def get_studio_node_detail(node_type: str, session: dict[str, Any] = Depends(get_session_context)) -> NodeDefinitionSummary:
    _ = session
    item = get_node_definition(node_type)
    if item is None:
        raise HTTPException(status_code=404, detail="Node type not found")
    return NodeDefinitionSummary.model_validate(item)


@app.get(f"{settings.api_prefix}/studio/nodes/{{node_type}}/editor", response_model=NodeEditorResponse)
def get_studio_node_editor(
    node_type: str,
    trigger_type: str | None = None,
    workflow_id: str | None = None,
    step_id: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeEditorResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow_trigger_type = trigger_type
    step_name: str | None = None
    step_config: dict[str, Any] = {}

    if workflow_id:
        workflow = get_workflow(workflow_id, workspace_id=workspace_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        workflow_trigger_type = workflow_trigger_type or str(workflow.get("trigger_type") or "")
        if step_id:
            step = next((item for item in workflow["definition_json"].get("steps", []) if item.get("id") == step_id), None)
            if step is not None:
                step_name = str(step.get("name") or "")
                step_config = dict(step.get("config") or {})

    binding_context = get_workspace_binding_context(workspace_id)

    try:
        payload = build_node_editor_response(
            node_type,
            config=step_config,
            workflow_trigger_type=workflow_trigger_type,
            workflow_definition=workflow["definition_json"] if workflow_id and workflow is not None else None,
            current_step_id=step_id,
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
            step_name=step_name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return NodeEditorResponse.model_validate(payload)


@app.post(f"{settings.api_prefix}/studio/nodes/draft", response_model=NodeDraftResponse)
def post_studio_node_draft(
    payload: NodeDraftRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeDraftResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)

    try:
        item = build_node_draft(
            payload.node_type,
            workflow_trigger_type=payload.trigger_type,
            name=payload.name,
            config=payload.config,
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return NodeDraftResponse.model_validate(item)


@app.post(f"{settings.api_prefix}/studio/nodes/preview", response_model=NodePreviewResponse)
def post_studio_node_preview(
    payload: NodePreviewRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodePreviewResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)

    item = resolve_node_preview(
        payload.step.model_dump(),
        workflow_trigger_type=payload.trigger_type,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
    )
    return NodePreviewResponse.model_validate(item)


@app.post(f"{settings.api_prefix}/studio/nodes/{{node_type}}/validate", response_model=NodeConfigValidationResponse)
def post_studio_node_validate(
    node_type: str,
    payload: NodeConfigTestRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeConfigValidationResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)
    try:
        result = validate_node_configuration(
            node_type,
            config=payload.config,
            trigger_type=payload.trigger_type,
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
            step_name=payload.name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return NodeConfigValidationResponse.model_validate(result)


@app.post(f"{settings.api_prefix}/studio/nodes/{{node_type}}/test", response_model=NodeConfigTestResponse)
def post_studio_node_test(
    node_type: str,
    payload: NodeConfigTestRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeConfigTestResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)
    try:
        result = test_node_configuration(
            node_type,
            config=payload.config,
            trigger_type=payload.trigger_type,
            payload=payload.payload,
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
            step_name=payload.name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return NodeConfigTestResponse.model_validate(result)


@app.get(f"{settings.api_prefix}/studio/nodes/{{node_type}}/resources", response_model=NodeResourcesResponse)
def get_studio_node_resources(
    node_type: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeResourcesResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)
    result = build_node_resources(
        node_type,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
    )
    return NodeResourcesResponse.model_validate(result)


@app.post(f"{settings.api_prefix}/studio/nodes/{{node_type}}/dynamic-props", response_model=NodeDynamicPropsResponse)
def post_studio_node_dynamic_props(
    node_type: str,
    payload: NodeDynamicPropsRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeDynamicPropsResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)
    result = resolve_dynamic_operation_fields(
        node_type=node_type,
        config=payload.config,
        connections=binding_context["connections"],
        variables=binding_context["variables"],
    )
    return NodeDynamicPropsResponse.model_validate(result)


@app.post(f"{settings.api_prefix}/studio/validate", response_model=WorkflowValidationResponse)
def post_studio_validate(
    payload: WorkflowCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowValidationResponse:
    workspace_id = str(session["workspace"]["id"])
    response = validate_or_raise(
        payload.definition.model_dump(),
        workflow_trigger_type=payload.trigger_type,
    )
    validate_runtime_node_contracts_or_raise(
        payload.definition.model_dump(),
        workflow_trigger_type=payload.trigger_type,
        workspace_id=workspace_id,
    )
    return response


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


# ---------------------------------------------------------------------------
# Real Authentication: Signup & Login
# ---------------------------------------------------------------------------

@app.post(f"{settings.api_prefix}/auth/signup", response_model=AuthSessionTokenResponse, status_code=201)
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


@app.post(f"{settings.api_prefix}/auth/login", response_model=AuthSessionTokenResponse)
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


@app.put(f"{settings.api_prefix}/workspaces/current/settings", response_model=WorkspaceSettingsResponse)
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


@app.get(f"{settings.api_prefix}/workspaces/current/members", response_model=list[WorkspaceMemberSummary])
def get_current_workspace_members(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkspaceMemberSummary]:
    return [
        WorkspaceMemberSummary.model_validate(item)
        for item in list_workspace_members(str(session["workspace"]["id"]))
    ]


@app.post(f"{settings.api_prefix}/workspaces/current/members/invite", response_model=WorkspaceMemberSummary, status_code=201)
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
        details={
            "email": member["email"],
            "role": member["role"],
            "membership_status": member["status"],
        },
    )
    return WorkspaceMemberSummary.model_validate(member)


@app.patch(f"{settings.api_prefix}/workspaces/current/members/{{user_id}}", response_model=WorkspaceMemberSummary)
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


@app.delete(f"{settings.api_prefix}/workspaces/current/members/{{user_id}}")
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


@app.get(f"{settings.api_prefix}/assistant/capabilities", response_model=AssistantCapabilitiesResponse)
def get_assistant_capabilities(session: dict[str, Any] = Depends(get_session_context)) -> AssistantCapabilitiesResponse:
    _ = session
    return AssistantCapabilitiesResponse(
        tools=[
            "name_workflow",
            "match_templates",
            "plan_workflow",
            "draft_workflow",
            "workflow_context",
            "summarize_workflow",
            "rename_workflow",
            "extend_workflow",
            "repair_workflow",
            "validate_workflow",
            "compare_versions",
            "request_promotion",
        ],
        llm_runtime_mode=settings.llm_mode,
        recommended_local_stack=["Ollama", "LangGraph", "FlowHolt backend tools"],
    )


@app.post(f"{settings.api_prefix}/assistant/name", response_model=AssistantNameResponse)
def post_assistant_name(
    payload: AssistantNameRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantNameResponse:
    _ = session
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
    naming = build_assistant_workflow_name(payload.prompt)
    return AssistantNameResponse.model_validate(naming)


@app.post(f"{settings.api_prefix}/assistant/template-match", response_model=AssistantTemplateMatchResponse)
def post_assistant_template_match(
    payload: AssistantNameRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantTemplateMatchResponse:
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
    return build_assistant_template_match_response(
        payload.prompt,
        workspace_id=str(session["workspace"]["id"]),
    )


@app.post(f"{settings.api_prefix}/assistant/plan", response_model=AssistantPlanResponse)
def post_assistant_plan(
    payload: AssistantPlanRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantPlanResponse:
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
    return build_assistant_plan_response(
        payload.prompt,
        workspace_id=str(session["workspace"]["id"]),
    )


@app.post(f"{settings.api_prefix}/assistant/draft-workflow", response_model=AssistantDraftWorkflowResponse)
def post_assistant_draft_workflow(
    payload: AssistantDraftWorkflowRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantDraftWorkflowResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    workspace_id = str(session["workspace"]["id"])
    plan = build_assistant_plan(prompt, list_templates(workspace_id=workspace_id))
    template_match = None
    template_definition = None
    template_id = payload.template_id
    if template_id:
        template = get_template(template_id, workspace_id=workspace_id)
        if template is None:
            raise HTTPException(status_code=404, detail="Template not found")
        template_match = AssistantTemplateMatch(
            template_id=str(template["id"]),
            name=str(template["name"]),
            category=str(template["category"]),
            trigger_type=str(template["trigger_type"]),
            score=100,
            reason="Template was selected explicitly.",
        )
        template_definition = template["definition"]
        trigger_type = str(template["trigger_type"])
        category = str(template["category"])
    else:
        matches = plan["matched_templates"]
        if matches:
            template_match = AssistantTemplateMatch.model_validate(matches[0])
            matched_template = get_template(template_match.template_id, workspace_id=workspace_id)
            if matched_template and int(template_match.score) >= 28:
                template_definition = matched_template["definition"]
        trigger_type = str(plan["trigger_type"])
        category = str(plan["category"])

    used_template_definition = template_definition
    raw_definition = build_draft_definition(
        prompt,
        trigger_type=trigger_type,
        template_definition=used_template_definition,
    )
    normalized_definition, repair_actions = repair_definition_for_storage(
        raw_definition,
        workflow_trigger_type=trigger_type,
        template_definition=used_template_definition,
    )
    validation = validate_or_raise(normalized_definition, workflow_trigger_type=trigger_type)
    try:
        validate_runtime_node_contracts_or_raise(
            normalized_definition,
            workflow_trigger_type=trigger_type,
            workspace_id=workspace_id,
        )
    except HTTPException:
        if used_template_definition is None or payload.template_id:
            raise
        used_template_definition = None
        template_match = None
        raw_definition = build_draft_definition(prompt, trigger_type=trigger_type, template_definition=None)
        normalized_definition, repair_actions = repair_definition_for_storage(
            raw_definition,
            workflow_trigger_type=trigger_type,
            template_definition=None,
        )
        validation = validate_or_raise(normalized_definition, workflow_trigger_type=trigger_type)
        validate_runtime_node_contracts_or_raise(
            normalized_definition,
            workflow_trigger_type=trigger_type,
            workspace_id=workspace_id,
        )
    enforce_workflow_asset_access_or_raise(
        normalized_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        normalized_definition,
        workflow_id="assistant-draft",
        workflow_trigger_type=trigger_type,
        workspace_id=workspace_id,
        session=session,
        action="save",
    )

    saved_workflow = None
    suggested_name = payload.name or str(plan["suggested_name"])
    if payload.save:
        workflow = create_workflow(
            WorkflowCreate(
                name=suggested_name,
                trigger_type=trigger_type,
                category=category,
                status="draft",
                template_id=template_match.template_id if template_match else None,
                definition=WorkflowDefinition.model_validate(normalized_definition),
            ),
            workspace_id=workspace_id,
            created_by_user_id=str(session["user"]["id"]),
        )
        saved_workflow = WorkflowSummary.model_validate(workflow)
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="assistant.workflow_drafted",
            target_type="workflow",
            target_id=str(workflow["id"]),
            status="success",
            details={"prompt_preview": prompt[:120], "saved": True},
        )

    return AssistantDraftWorkflowResponse(
        prompt=prompt,
        suggested_name=suggested_name,
        summary=str(plan["summary"]),
        trigger_type=trigger_type,
        category=category,
        template_match=template_match,
        definition=WorkflowDefinition.model_validate(normalized_definition),
        validation=validation,
        saved_workflow=saved_workflow,
        warnings=list(plan["warnings"]) + repair_actions,
    )


@app.get(f"{settings.api_prefix}/assistant/workflows/{{workflow_id}}/context", response_model=AssistantWorkflowContextResponse)
def get_assistant_workflow_context(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantWorkflowContextResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_assistant_workflow_context_response(
        workflow,
        workspace_id=workspace_id,
        session=session,
    )


def build_assistant_workflow_snapshot(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    session: dict[str, Any],
    selected_step_id: str | None = None,
    selected_step_name: str | None = None,
    selected_step_type: str | None = None,
) -> dict[str, Any]:
    definition = dict(workflow.get("definition_json") or {})
    trigger_type = str(workflow.get("trigger_type") or "manual")
    workflow_settings = WorkflowSettings.model_validate(definition.get("settings") or {})
    executions = list_workflow_executions(str(workflow["id"]), workspace_id=workspace_id, limit=20)
    jobs = list_workflow_jobs(workspace_id=workspace_id, limit=50)
    observability = build_workflow_observability_response(
        workflow=workflow,
        executions=executions,
        jobs=jobs,
    )
    policy = build_workflow_policy_response(
        str(workflow["id"]),
        workflow_trigger_type=trigger_type,
        definition=definition,
        workspace_id=workspace_id,
        session=session,
    )
    environments = build_workflow_environments_response(workflow, workspace_id=workspace_id)
    validation = WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            definition,
            workflow_trigger_type=trigger_type,
        )
    )
    runtime_issues = collect_runtime_node_contract_issues(
        definition,
        workflow_trigger_type=trigger_type,
        workspace_id=workspace_id,
    )
    summary_payload = build_workflow_summary(
        workflow,
        observability=observability.model_dump(),
    )
    validation_error_count = sum(1 for issue in validation.issues if issue.level == "error")
    runtime_error_count = sum(1 for issue in runtime_issues if str(issue.get("level") or "") == "error")
    runtime_warning_count = sum(1 for issue in runtime_issues if str(issue.get("level") or "") == "warning")
    warnings = [
        *list(summary_payload["warnings"]),
        *list(policy.warnings),
    ]
    if validation_error_count:
        warnings.append(
            f"{validation_error_count} definition validation issue{'s' if validation_error_count != 1 else ''} still need attention."
        )
    if runtime_error_count:
        warnings.append(
            f"{runtime_error_count} runtime configuration issue{'s' if runtime_error_count != 1 else ''} are blocking this workflow."
        )
    elif runtime_warning_count:
        warnings.append(
            f"{runtime_warning_count} runtime warning{'s' if runtime_warning_count != 1 else ''} should be reviewed."
        )

    selected_step = None
    if selected_step_id:
        matched_step = next(
            (item for item in (definition.get("steps") or []) if str(item.get("id") or "") == selected_step_id),
            None,
        )
        if matched_step is not None:
            selected_step = {
                "id": str(matched_step.get("id") or ""),
                "name": str(matched_step.get("name") or selected_step_name or ""),
                "type": str(matched_step.get("type") or selected_step_type or ""),
            }
    elif selected_step_name or selected_step_type:
        selected_step = {
            "id": str(selected_step_id or ""),
            "name": str(selected_step_name or ""),
            "type": str(selected_step_type or ""),
        }

    return {
        "definition_json": definition,
        "trigger_type": trigger_type,
        "summary": str(summary_payload["summary"]),
        "notable_steps": list(summary_payload["notable_steps"]),
        "warnings": list(dict.fromkeys(item for item in warnings if item)),
        "validation": validation,
        "validation_issues": [issue.model_dump() for issue in validation.issues],
        "runtime_issues": runtime_issues,
        "observability": observability.model_dump(),
        "policy": policy.model_dump(),
        "environments": environments.model_dump(),
        "settings": workflow_settings.model_dump(),
        "selected_step": selected_step,
    }


@app.post(f"{settings.api_prefix}/assistant/workflows/{{workflow_id}}/rename", response_model=AssistantWorkflowRenameResponse)
def post_assistant_workflow_rename(
    workflow_id: str,
    payload: AssistantWorkflowRenameRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantWorkflowRenameResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    naming = build_existing_workflow_name_suggestion(workflow, prompt=payload.prompt)
    suggested_name = str(naming["name"])
    updated_workflow = None

    if payload.save and suggested_name and suggested_name != str(workflow["name"]):
        updated_workflow = update_workflow(
            workflow_id,
            WorkflowUpdate(
                name=suggested_name,
                trigger_type=str(workflow["trigger_type"]),
                category=str(workflow["category"]),
                status=str(workflow["status"]),
                definition=WorkflowDefinition.model_validate(workflow["definition_json"]),
            ),
            workspace_id=workspace_id,
        )
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="assistant.workflow_renamed",
            target_type="workflow",
            target_id=workflow_id,
            status="success",
            details={"previous_name": workflow["name"], "new_name": suggested_name},
        )

    return AssistantWorkflowRenameResponse(
        workflow_id=workflow_id,
        previous_name=str(workflow["name"]),
        suggested_name=suggested_name,
        applied=bool(payload.save),
        reason=str(naming["reason"]),
        workflow=WorkflowSummary.model_validate(updated_workflow) if updated_workflow else None,
    )


@app.post(f"{settings.api_prefix}/assistant/workflows/{{workflow_id}}/extend", response_model=AssistantWorkflowExtendResponse)
def post_assistant_workflow_extend(
    workflow_id: str,
    payload: AssistantWorkflowExtendRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantWorkflowExtendResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    extension = extend_workflow_definition(
        workflow["definition_json"],
        prompt=prompt,
        trigger_type=str(workflow.get("trigger_type") or "manual"),
    )
    normalized_definition, repair_actions = repair_definition_for_storage(
        extension["definition"],
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
    )
    validation = validate_or_raise(
        normalized_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
    )
    validate_runtime_node_contracts_or_raise(
        normalized_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        normalized_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        normalized_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )

    updated_workflow = None
    if payload.save:
        updated_workflow = update_workflow(
            workflow_id,
            WorkflowUpdate(
                name=str(workflow["name"]),
                trigger_type=str(workflow["trigger_type"]),
                category=str(workflow["category"]),
                status=str(workflow["status"]),
                definition=WorkflowDefinition.model_validate(normalized_definition),
            ),
            workspace_id=workspace_id,
        )
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="assistant.workflow_extended",
            target_type="workflow",
            target_id=workflow_id,
            status="success",
            details={
                "prompt_preview": prompt[:120],
                "added_steps": [item["id"] for item in extension["added_steps"]],
            },
        )

    summary_payload = build_workflow_summary(
        {
            **workflow,
            "definition_json": normalized_definition,
        }
    )
    return AssistantWorkflowExtendResponse(
        workflow_id=workflow_id,
        prompt=prompt,
        summary=str(summary_payload["summary"]),
        added_steps=[WorkflowStep.model_validate(item) for item in extension["added_steps"]],
        updated_output=WorkflowStep.model_validate(extension["updated_output"]) if extension["updated_output"] else None,
        definition=WorkflowDefinition.model_validate(normalized_definition),
        validation=validation,
        warnings=list(extension["warnings"]) + repair_actions,
        workflow=WorkflowSummary.model_validate(updated_workflow) if updated_workflow else None,
    )


@app.post(f"{settings.api_prefix}/assistant/workflows/{{workflow_id}}/repair", response_model=AssistantWorkflowRepairResponse)
def post_assistant_workflow_repair(
    workflow_id: str,
    payload: AssistantWorkflowRepairRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantWorkflowRepairResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    repaired_definition, actions = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
    )
    validation = WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            repaired_definition,
            workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        )
    )
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )

    updated_workflow = None
    if payload.save and actions:
        updated_workflow = update_workflow(
            workflow_id,
            WorkflowUpdate(
                name=str(workflow["name"]),
                trigger_type=str(workflow["trigger_type"]),
                category=str(workflow["category"]),
                status=str(workflow["status"]),
                definition=WorkflowDefinition.model_validate(repaired_definition),
            ),
            workspace_id=workspace_id,
        )
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="assistant.workflow_repaired",
            target_type="workflow",
            target_id=workflow_id,
            status="success",
            details={"actions": actions},
        )
    return AssistantWorkflowRepairResponse(
        workflow_id=workflow_id,
        repaired=bool(actions),
        actions=actions,
        definition=WorkflowDefinition.model_validate(repaired_definition),
        validation=validation,
        workflow=WorkflowSummary.model_validate(updated_workflow) if updated_workflow else None,
    )


# ---------------------------------------------------------------------------
# Assistant — Chat (conversational AI)
# ---------------------------------------------------------------------------

@app.post(f"{settings.api_prefix}/assistant/chat", response_model=AssistantChatResponse)
def post_assistant_chat(
    payload: AssistantChatRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantChatResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    workflow_context = None
    if payload.workflow_id:
        workflow = get_workflow(payload.workflow_id, workspace_id=workspace_id)
        if workflow:
            workflow_context = build_assistant_workflow_snapshot(
                workflow,
                workspace_id=workspace_id,
                session=session,
                selected_step_id=payload.selected_step_id,
                selected_step_name=payload.selected_step_name,
                selected_step_type=payload.selected_step_type,
            )

    messages = _resolve_assistant_chat_messages(
        payload,
        workspace_id=workspace_id,
        user_id=user_id,
    )
    result = build_assistant_chat_response(
        messages,
        workflow_name=payload.workflow_name,
        step_count=payload.step_count,
        workflow_context=workflow_context,
    )
    if workflow_context is not None:
        result.setdefault("workflow_summary", str(workflow_context.get("summary") or "") or None)
        result.setdefault("context_warnings", list(workflow_context.get("warnings") or []))
        selected_step = dict(workflow_context.get("selected_step") or {})
        result.setdefault("selected_step_id", str(selected_step.get("id") or "") or None)
    return AssistantChatResponse.model_validate(result)


@app.post(f"{settings.api_prefix}/assistant/chat/stream")
def post_assistant_chat_stream(
    payload: AssistantChatRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StreamingResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    workflow_context = None
    if payload.workflow_id:
        workflow = get_workflow(payload.workflow_id, workspace_id=workspace_id)
        if workflow:
            workflow_context = build_assistant_workflow_snapshot(
                workflow,
                workspace_id=workspace_id,
                session=session,
                selected_step_id=payload.selected_step_id,
                selected_step_name=payload.selected_step_name,
                selected_step_type=payload.selected_step_type,
            )

    messages = _resolve_assistant_chat_messages(
        payload,
        workspace_id=workspace_id,
        user_id=user_id,
    )

    def event_generator():
        for event in stream_assistant_chat_response(
            messages,
            workflow_name=payload.workflow_name,
            step_count=payload.step_count,
            workflow_context=workflow_context,
        ):
            yield _format_sse_event(event.get("event", "message"), event.get("data", {}))

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _resolve_assistant_chat_messages(
    payload: AssistantChatRequest,
    *,
    workspace_id: str,
    user_id: str,
) -> list[dict[str, str]]:
    messages = [{"role": message.role, "content": message.content} for message in payload.messages]
    if payload.attachment_ids:
        with get_db() as db:
            attachment_rows = _resolve_chat_attachment_rows(
                db,
                payload.attachment_ids,
                workspace_id=workspace_id,
                user_id=user_id,
                thread_id=None,
            )
        attachment_context = _render_chat_attachment_context(attachment_rows)
        if attachment_context:
            for index in range(len(messages) - 1, -1, -1):
                if messages[index]["role"] != "user":
                    continue
                base_content = str(messages[index]["content"])
                messages[index]["content"] = f"{base_content}\n\n{attachment_context}" if base_content.strip() else attachment_context
                break
    return messages


def _format_sse_event(event: str, data: Any) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


CHAT_ATTACHMENT_TEXT_CONTENT_TYPES = {
    "application/json",
    "application/ld+json",
    "application/xml",
    "application/yaml",
    "application/x-yaml",
}

CHAT_ATTACHMENT_TEXT_EXTENSIONS = {
    ".csv",
    ".html",
    ".js",
    ".json",
    ".log",
    ".md",
    ".py",
    ".sql",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}


def _chat_attachment_root() -> Path:
    root = Path(settings.chat_attachment_dir)
    root.mkdir(parents=True, exist_ok=True)
    return root


def _sanitize_chat_attachment_name(file_name: str) -> str:
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(file_name or "attachment").name).strip("._")
    return safe_name or "attachment"


def _is_text_like_chat_attachment(file_name: str, content_type: str) -> bool:
    normalized_content_type = (content_type or "").lower()
    if normalized_content_type.startswith("text/") or normalized_content_type in CHAT_ATTACHMENT_TEXT_CONTENT_TYPES:
        return True
    return Path(file_name).suffix.lower() in CHAT_ATTACHMENT_TEXT_EXTENSIONS


def _extract_chat_attachment_preview(raw_bytes: bytes, file_name: str, content_type: str) -> str | None:
    if not _is_text_like_chat_attachment(file_name, content_type):
        return None
    decoded = raw_bytes.decode("utf-8", errors="ignore").replace("\x00", " ").strip()
    if not decoded:
        return None
    return decoded[: settings.chat_attachment_text_preview_chars]


def _build_chat_attachment_item(row: dict[str, Any]) -> ChatAttachmentItem:
    return ChatAttachmentItem(
        id=str(row["id"]),
        file_name=str(row["file_name"]),
        content_type=str(row.get("content_type") or "application/octet-stream"),
        size_bytes=int(row.get("size_bytes") or 0),
        preview_text=str(row["preview_text"]) if row.get("preview_text") else None,
        created_at=str(row["created_at"]),
    )


def _load_chat_attachment_rows_by_message(
    db: Any,
    message_ids: list[str],
    *,
    workspace_id: str,
    user_id: str,
) -> dict[str, list[dict[str, Any]]]:
    if not message_ids:
        return {}
    placeholders = ", ".join(["?"] * len(message_ids))
    params = tuple(message_ids + [workspace_id, user_id])
    rows = db.execute(
        f"SELECT * FROM chat_attachments WHERE message_id IN ({placeholders}) AND workspace_id = ? AND user_id = ? ORDER BY created_at ASC",
        params,
    ).fetchall()
    attachments_by_message: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        item = row_to_dict(row)
        message_id = str(item.get("message_id") or "")
        attachments_by_message.setdefault(message_id, []).append(item)
    return attachments_by_message


def _resolve_chat_attachment_rows(
    db: Any,
    attachment_ids: list[str],
    *,
    workspace_id: str,
    user_id: str,
    thread_id: str | None,
) -> list[dict[str, Any]]:
    if not attachment_ids:
        return []

    unique_ids = list(dict.fromkeys(attachment_ids))
    placeholders = ", ".join(["?"] * len(unique_ids))
    params = tuple(unique_ids + [workspace_id, user_id])
    rows = db.execute(
        f"SELECT * FROM chat_attachments WHERE id IN ({placeholders}) AND workspace_id = ? AND user_id = ?",
        params,
    ).fetchall()
    row_map = {str(item["id"]): row_to_dict(item) for item in rows}

    if len(row_map) != len(unique_ids):
        raise HTTPException(400, "One or more attachments could not be found.")

    resolved_rows: list[dict[str, Any]] = []
    for attachment_id in unique_ids:
        item = row_map[attachment_id]
        bound_thread_id = str(item.get("thread_id") or "")
        if bound_thread_id and bound_thread_id != (thread_id or ""):
            raise HTTPException(400, "One or more attachments are already linked to another conversation.")
        if item.get("message_id"):
            raise HTTPException(400, "One or more attachments were already sent in this conversation.")
        resolved_rows.append(item)
    return resolved_rows


def _render_chat_attachment_context(attachment_rows: list[dict[str, Any]]) -> str:
    if not attachment_rows:
        return ""

    lines = ["Attached files:"]
    for attachment in attachment_rows:
        lines.append(
            f"- {attachment['file_name']} ({attachment.get('content_type') or 'application/octet-stream'}, {attachment.get('size_bytes') or 0} bytes)"
        )
        if attachment.get("preview_text"):
            lines.append(f"  Preview:\n{attachment['preview_text']}")
        else:
            lines.append("  Preview unavailable because this file is binary or could not be decoded as text.")
    return "\n".join(lines)


def _hydrate_chat_messages(db: Any, *, thread_id: str, workspace_id: str, user_id: str) -> list[ChatMessageItem]:
    rows = [row_to_dict(row) for row in db.execute(
        "SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC",
        (thread_id,),
    ).fetchall()]
    attachments_by_message = _load_chat_attachment_rows_by_message(
        db,
        [str(row["id"]) for row in rows],
        workspace_id=workspace_id,
        user_id=user_id,
    )
    return [
        ChatMessageItem(
            id=str(row["id"]),
            thread_id=str(row["thread_id"]),
            role=str(row["role"]),
            content=str(row["content"]),
            model_used=str(row["model_used"]) if row.get("model_used") else None,
            actions=list(row.get("actions_json") or []),
            attachments=[
                _build_chat_attachment_item(attachment)
                for attachment in attachments_by_message.get(str(row["id"]), [])
            ],
            created_at=str(row["created_at"]),
        )
        for row in rows
    ]


@app.post(f"{settings.api_prefix}/chat/attachments", response_model=ChatAttachmentUploadResponse, status_code=201)
async def upload_chat_attachments(
    files: list[UploadFile] = File(...),
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatAttachmentUploadResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    attachment_root = _chat_attachment_root() / workspace_id / user_id
    attachment_root.mkdir(parents=True, exist_ok=True)

    attachments: list[ChatAttachmentItem] = []
    for uploaded in files:
        raw_bytes = await uploaded.read()
        if not raw_bytes:
            continue
        if len(raw_bytes) > settings.chat_attachment_max_bytes:
            raise HTTPException(413, f"{uploaded.filename or 'Attachment'} exceeds the {settings.chat_attachment_max_bytes // (1024 * 1024)}MB upload limit.")

        attachment_id = f"ca-{secrets.token_hex(12)}"
        safe_name = _sanitize_chat_attachment_name(uploaded.filename or "attachment")
        content_type = uploaded.content_type or mimetypes.guess_type(safe_name)[0] or "application/octet-stream"
        preview_text = _extract_chat_attachment_preview(raw_bytes, safe_name, content_type)
        now = datetime.now(UTC).isoformat()
        storage_path = attachment_root / f"{attachment_id}-{safe_name}"
        storage_path.write_bytes(raw_bytes)

        with get_db() as db:
            db.execute(
                """
                INSERT INTO chat_attachments (
                    id, workspace_id, user_id, thread_id, message_id, file_name, content_type, size_bytes, storage_path, preview_text, created_at
                ) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?)
                """,
                (
                    attachment_id,
                    workspace_id,
                    user_id,
                    safe_name,
                    content_type,
                    len(raw_bytes),
                    str(storage_path),
                    preview_text,
                    now,
                ),
            )

        attachments.append(ChatAttachmentItem(
            id=attachment_id,
            file_name=safe_name,
            content_type=content_type,
            size_bytes=len(raw_bytes),
            preview_text=preview_text,
            created_at=now,
        ))

    return ChatAttachmentUploadResponse(attachments=attachments)


@app.get(f"{settings.api_prefix}/chat/attachments/{{attachment_id}}")
def download_chat_attachment(
    attachment_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> FileResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM chat_attachments WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (attachment_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Attachment not found")
        attachment = row_to_dict(row)

    storage_path = Path(str(attachment["storage_path"]))
    if not storage_path.exists():
        raise HTTPException(404, "Attachment file is missing")
    return FileResponse(
        storage_path,
        media_type=str(attachment.get("content_type") or "application/octet-stream"),
        filename=str(attachment.get("file_name") or storage_path.name),
    )


# ---------------------------------------------------------------------------
# Chat threads — persistent conversational AI
# ---------------------------------------------------------------------------

@app.get(f"{settings.api_prefix}/chat/threads", response_model=ChatThreadListResponse)
def list_chat_threads(
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatThreadListResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM chat_threads WHERE workspace_id = ? AND user_id = ? ORDER BY pinned DESC, updated_at DESC",
            (workspace_id, user_id),
        ).fetchall()
        threads: list[ChatThreadSummary] = []
        for r in rows:
            row = dict(r)
            # fetch last message preview & count
            cnt = db.execute("SELECT COUNT(*) AS c FROM chat_messages WHERE thread_id = ?", (row["id"],)).fetchone()
            last = db.execute(
                "SELECT content, role FROM chat_messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1",
                (row["id"],),
            ).fetchone()
            threads.append(ChatThreadSummary(
                id=row["id"],
                title=row["title"],
                model=row.get("model") or "",
                pinned=bool(row.get("pinned", 0)),
                message_count=dict(cnt)["c"] if cnt else 0,
                last_message_preview=(dict(last)["content"][:100] if last else ""),
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            ))
    return ChatThreadListResponse(threads=threads)


@app.post(f"{settings.api_prefix}/chat/threads", response_model=ChatThreadDetail, status_code=201)
def create_chat_thread(
    payload: ChatThreadCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatThreadDetail:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    now = datetime.now(UTC).isoformat()
    thread_id = f"ct-{secrets.token_hex(12)}"
    selected_model = (payload.model or _get_default_chat_provider()).strip()
    with get_db() as db:
        db.execute(
            "INSERT INTO chat_threads (id, workspace_id, user_id, title, model, pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)",
            (thread_id, workspace_id, user_id, payload.title, selected_model, now, now),
        )
    messages: list[ChatMessageItem] = []
    thread_title = payload.title
    thread_updated_at = now
    # If initial message provided, send it immediately
    if payload.initial_message and payload.initial_message.strip():
        resp = _chat_send(
            thread_id,
            workspace_id,
            user_id,
            payload.initial_message.strip(),
            selected_model,
            payload.attachment_ids,
        )
        messages = [resp.user_message, resp.assistant_message]
        thread_title = resp.thread_title
        thread_updated_at = resp.assistant_message.created_at

    if not messages:
        with get_db() as db:
            thread_row = db.execute(
                "SELECT title, updated_at FROM chat_threads WHERE id = ?",
                (thread_id,),
            ).fetchone()
            if thread_row:
                thread_title = str(thread_row["title"])
                thread_updated_at = str(thread_row["updated_at"])

    return ChatThreadDetail(
        id=thread_id,
        title=thread_title,
        model=selected_model,
        pinned=False,
        messages=messages,
        created_at=now,
        updated_at=thread_updated_at,
    )


@app.get(f"{settings.api_prefix}/chat/threads/{{thread_id}}", response_model=ChatThreadDetail)
def get_chat_thread(
    thread_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatThreadDetail:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM chat_threads WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (thread_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Thread not found")
        thread = row_to_dict(row)
        messages = _hydrate_chat_messages(db, thread_id=thread_id, workspace_id=workspace_id, user_id=user_id)
    return ChatThreadDetail(
        id=thread["id"],
        title=thread["title"],
        model=thread.get("model") or "",
        pinned=bool(thread.get("pinned", 0)),
        messages=messages,
        created_at=thread["created_at"],
        updated_at=thread["updated_at"],
    )


@app.patch(f"{settings.api_prefix}/chat/threads/{{thread_id}}", response_model=ChatThreadDetail)
def update_chat_thread(
    thread_id: str,
    payload: ChatThreadUpdateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatThreadDetail:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    now = datetime.now(UTC).isoformat()
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM chat_threads WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (thread_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Thread not found")
        if payload.title is not None:
            db.execute("UPDATE chat_threads SET title = ?, updated_at = ? WHERE id = ?", (payload.title, now, thread_id))
        if payload.pinned is not None:
            db.execute("UPDATE chat_threads SET pinned = ?, updated_at = ? WHERE id = ?", (1 if payload.pinned else 0, now, thread_id))
    return get_chat_thread(thread_id, session)


@app.delete(f"{settings.api_prefix}/chat/threads/{{thread_id}}", status_code=204)
def delete_chat_thread(
    thread_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    with get_db() as db:
        row = db.execute(
            "SELECT id FROM chat_threads WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (thread_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Thread not found")
        db.execute("DELETE FROM chat_messages WHERE thread_id = ?", (thread_id,))
        db.execute("DELETE FROM chat_threads WHERE id = ?", (thread_id,))
    return Response(status_code=204)


@app.post(f"{settings.api_prefix}/chat/threads/{{thread_id}}/messages", response_model=ChatSendResponse)
def send_chat_message(
    thread_id: str,
    payload: ChatSendRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatSendResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    return _chat_send(thread_id, workspace_id, user_id, payload.message, payload.model, payload.attachment_ids)


@app.post(f"{settings.api_prefix}/chat/threads/{{thread_id}}/messages/stream")
def stream_chat_message(
    thread_id: str,
    payload: ChatSendRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StreamingResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    return _chat_send_stream(thread_id, workspace_id, user_id, payload.message, payload.model, payload.attachment_ids)


def _get_chat_provider_definitions() -> list[dict[str, Any]]:
    return [
        {
            "id": "xai",
            "name": "FlowHolt AI",
            "model": settings.xai_model,
            "base_url": "https://api.x.ai/v1",
            "requires_credential": False,
            "aliases": {"xai", "grok", "flowholt ai", "flowholt"},
            "env_api_key": settings.xai_api_key,
        },
        {
            "id": "groq",
            "name": "Groq",
            "model": settings.groq_model,
            "base_url": "https://api.groq.com/openai/v1",
            "requires_credential": False,
            "aliases": {"groq"},
            "env_api_key": settings.groq_api_key,
        },
        {
            "id": "gemini",
            "name": "Google Gemini",
            "model": settings.gemini_model,
            "base_url": None,
            "requires_credential": False,
            "aliases": {"gemini", "google", "google gemini"},
            "env_api_key": settings.gemini_api_key,
        },
        {
            "id": "openai",
            "name": "OpenAI",
            "model": settings.openai_model,
            "base_url": "https://api.openai.com/v1",
            "requires_credential": True,
            "aliases": {"openai", "chatgpt"},
            "env_api_key": settings.openai_api_key,
        },
        {
            "id": "anthropic",
            "name": "Anthropic Claude",
            "model": settings.anthropic_model,
            "base_url": "https://api.anthropic.com/v1",
            "requires_credential": True,
            "aliases": {"anthropic", "claude"},
            "env_api_key": settings.anthropic_api_key,
        },
        {
            "id": "deepseek",
            "name": "DeepSeek",
            "model": settings.deepseek_model,
            "base_url": "https://api.deepseek.com/v1",
            "requires_credential": True,
            "aliases": {"deepseek"},
            "env_api_key": settings.deepseek_api_key,
        },
        {
            "id": "ollama",
            "name": "Ollama",
            "model": settings.ollama_model,
            "base_url": settings.ollama_base_url,
            "requires_credential": False,
            "aliases": {"ollama"},
            "env_api_key": "",
        },
        {
            "id": "mock",
            "name": "Mock",
            "model": "mock",
            "base_url": None,
            "requires_credential": False,
            "aliases": {"mock"},
            "env_api_key": "",
        },
    ]


def _get_chat_provider_definition(provider_id: str) -> dict[str, Any] | None:
    normalized = provider_id.strip().lower()
    return next((item for item in _get_chat_provider_definitions() if item["id"] == normalized), None)


def _extract_chat_provider_secret(secret: dict[str, Any]) -> dict[str, str | None]:
    api_key = next(
        (
            str(secret[key]).strip()
            for key in ("api_key", "apiKey", "token", "bearer_token", "access_token", "key")
            if secret.get(key)
        ),
        "",
    )
    model = next(
        (
            str(secret[key]).strip()
            for key in ("model", "model_name", "default_model")
            if secret.get(key)
        ),
        "",
    )
    base_url = next(
        (
            str(secret[key]).strip()
            for key in ("base_url", "baseUrl", "endpoint", "url")
            if secret.get(key)
        ),
        "",
    )
    return {
        "api_key": api_key or None,
        "model": model or None,
        "base_url": base_url or None,
    }


def _resolve_workspace_chat_credential(provider_id: str, workspace_id: str | None = None) -> dict[str, str | None] | None:
    if not workspace_id:
        return None

    definition = _get_chat_provider_definition(provider_id)
    if definition is None:
        return None

    aliases = {alias.lower() for alias in definition["aliases"]}
    assets = list_vault_assets(kind="credential", workspace_id=workspace_id)

    for asset in assets:
        if str(asset.get("status") or "active").lower() not in {"active", "verified", "healthy"}:
            continue
        app_name = str(asset.get("app") or "").strip().lower()
        asset_name = str(asset.get("name") or "").strip().lower()
        if app_name not in aliases and not any(alias in asset_name for alias in aliases):
            continue
        secret = asset.get("secret")
        if not isinstance(secret, dict):
            continue
        resolved = _extract_chat_provider_secret(secret)
        if resolved.get("api_key") or provider_id == "ollama":
            return resolved

    return None


def _build_chat_provider_runtime(provider_id: str, workspace_id: str | None = None) -> dict[str, Any] | None:
    definition = _get_chat_provider_definition(provider_id)
    if definition is None:
        return None

    if provider_id == "mock":
        return {"provider": MockProvider(), "model": "mock"}

    vault_credential = _resolve_workspace_chat_credential(provider_id, workspace_id)

    if provider_id == "ollama":
        base_url = str((vault_credential or {}).get("base_url") or definition["base_url"] or "").strip()
        model = str((vault_credential or {}).get("model") or definition["model"] or settings.ollama_model).strip()
        if not base_url:
            return None
        return {"provider": OllamaProvider(base_url, model), "model": model}

    api_key = str((vault_credential or {}).get("api_key") or definition["env_api_key"] or "").strip()
    if not api_key:
        return None

    model = str((vault_credential or {}).get("model") or definition["model"] or "").strip()
    base_url = str((vault_credential or {}).get("base_url") or definition["base_url"] or "").strip()

    if provider_id == "gemini":
        return {"provider": GeminiProvider(api_key, model), "model": model}
    if provider_id == "groq":
        return {"provider": GroqProvider(api_key, model), "model": model}
    if provider_id == "anthropic":
        return {"provider": AnthropicProvider(api_key, model), "model": model}

    return {
        "provider": OpenAICompatibleProvider(
            name=provider_id,
            api_key=api_key,
            model=model,
            base_url=base_url,
        ),
        "model": model,
    }


def _get_default_chat_provider(workspace_id: str | None = None) -> str:
    if settings.llm_provider != "auto" and _is_chat_provider_available(settings.llm_provider, workspace_id):
        return settings.llm_provider
    for provider_id in ("xai", "groq", "gemini", "openai", "anthropic", "deepseek", "ollama", "mock"):
        if _is_chat_provider_available(provider_id, workspace_id):
            return provider_id
    return "mock"


def _is_chat_provider_available(provider_id: str, workspace_id: str | None = None) -> bool:
    runtime = _build_chat_provider_runtime(provider_id, workspace_id)
    return runtime is not None and bool(runtime["provider"].is_configured())


def _get_chat_provider_display_model(provider_id: str, workspace_id: str | None = None) -> str:
    runtime = _build_chat_provider_runtime(provider_id, workspace_id)
    if runtime is not None:
        return str(runtime.get("model") or "")
    definition = _get_chat_provider_definition(provider_id)
    return str(definition.get("model") if definition else "")


@app.get(f"{settings.api_prefix}/chat/models")
def list_chat_models(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[LLMProviderInfo]:
    workspace_id = str(session["workspace"]["id"])
    providers_info: list[LLMProviderInfo] = []
    default_provider = _get_default_chat_provider(workspace_id)
    for definition in _get_chat_provider_definitions():
        provider_id = str(definition["id"])
        if provider_id in {"mock", "ollama"}:
            continue
        providers_info.append(LLMProviderInfo(
            id=provider_id,
            name=str(definition["name"]),
            model=_get_chat_provider_display_model(provider_id, workspace_id),
            available=_is_chat_provider_available(provider_id, workspace_id),
            requires_credential=bool(definition["requires_credential"]),
            is_default=provider_id == default_provider,
        ))
    return providers_info


@app.get(f"{settings.api_prefix}/chat/providers/{{provider_id}}/models")
def list_provider_models(
    provider_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Dynamically fetch models from a provider's API using stored credentials."""
    workspace_id = str(session["workspace"]["id"])
    definition = _get_chat_provider_definition(provider_id)
    if definition is None:
        raise HTTPException(404, f"Unknown provider: {provider_id}")

    vault_credential = _resolve_workspace_chat_credential(provider_id, workspace_id)
    api_key = str((vault_credential or {}).get("api_key") or definition["env_api_key"] or "").strip()
    base_url = str((vault_credential or {}).get("base_url") or definition.get("base_url") or "").strip()

    if not api_key and provider_id != "ollama":
        return {"provider": provider_id, "models": [], "error": "No API key configured for this provider."}

    models_list: list[dict[str, Any]] = []

    try:
        if provider_id == "anthropic":
            ok, _msg, response = _runtime_request(
                "GET",
                f"{base_url or 'https://api.anthropic.com/v1'}/models",
                headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
            )
            if ok and response is not None:
                for m in (response.json().get("data") or []):
                    models_list.append({
                        "id": m.get("id", ""),
                        "name": m.get("display_name", m.get("id", "")),
                        "created": m.get("created_at", ""),
                        "context_window": m.get("context_window"),
                        "type": m.get("type", "model"),
                    })
        elif provider_id == "gemini":
            ok, _msg, response = _runtime_request(
                "GET",
                "https://generativelanguage.googleapis.com/v1beta/models",
                params={"key": api_key},
            )
            if ok and response is not None:
                for m in (response.json().get("models") or []):
                    model_id = str(m.get("name", "")).replace("models/", "")
                    models_list.append({
                        "id": model_id,
                        "name": m.get("displayName", model_id),
                        "created": "",
                        "context_window": m.get("inputTokenLimit"),
                        "type": "model",
                    })
        elif provider_id == "ollama":
            ollama_url = base_url or settings.ollama_base_url or "http://127.0.0.1:11434"
            ok, _msg, response = _runtime_request("GET", f"{ollama_url}/api/tags")
            if ok and response is not None:
                for m in (response.json().get("models") or []):
                    models_list.append({
                        "id": m.get("name", ""),
                        "name": m.get("name", ""),
                        "created": m.get("modified_at", ""),
                        "context_window": None,
                        "type": "model",
                    })
        else:
            compatible_defaults = {
                "openai": "https://api.openai.com/v1",
                "groq": "https://api.groq.com/openai/v1",
                "deepseek": "https://api.deepseek.com/v1",
                "xai": "https://api.x.ai/v1",
            }
            endpoint = f"{base_url or compatible_defaults.get(provider_id, 'https://api.openai.com/v1')}/models"
            ok, _msg, response = _runtime_request(
                "GET", endpoint, headers={"Authorization": f"Bearer {api_key}"},
            )
            if ok and response is not None:
                payload = response.json() or {}
                for m in (payload.get("data") or payload.get("models") or []):
                    models_list.append({
                        "id": m.get("id", ""),
                        "name": m.get("id", ""),
                        "created": str(m.get("created", "")),
                        "context_window": None,
                        "type": m.get("type", "model"),
                    })
    except Exception:
        return {"provider": provider_id, "models": [], "error": "Failed to fetch models from provider API."}

    return {"provider": provider_id, "models": models_list, "error": None}


@app.get(f"{settings.api_prefix}/chat/providers/{{provider_id}}/status")
def get_provider_status(
    provider_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Get usage/status info for a connected AI provider."""
    workspace_id = str(session["workspace"]["id"])
    definition = _get_chat_provider_definition(provider_id)
    if definition is None:
        raise HTTPException(404, f"Unknown provider: {provider_id}")

    vault_credential = _resolve_workspace_chat_credential(provider_id, workspace_id)
    api_key = str((vault_credential or {}).get("api_key") or definition["env_api_key"] or "").strip()
    base_url = str((vault_credential or {}).get("base_url") or definition.get("base_url") or "").strip()
    is_available = _is_chat_provider_available(provider_id, workspace_id)
    current_model = _get_chat_provider_display_model(provider_id, workspace_id)

    status_info: dict[str, Any] = {
        "provider": provider_id,
        "name": definition["name"],
        "connected": is_available,
        "current_model": current_model,
        "has_api_key": bool(api_key),
        "base_url": base_url or definition.get("base_url") or "",
        "rate_limits": None,
        "usage": None,
        "error": None,
    }

    if not api_key and provider_id != "ollama":
        status_info["error"] = "No API key configured."
        return status_info

    # Try to get rate limit / usage info where available
    try:
        if provider_id == "anthropic":
            # Anthropic doesn't have a public usage endpoint but we can report connection status
            ok, msg, _ = _runtime_request(
                "GET",
                f"{base_url or 'https://api.anthropic.com/v1'}/models",
                headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
            )
            status_info["rate_limits"] = {"status": "active" if ok else "error", "detail": msg}
        elif provider_id == "openai":
            # OpenAI doesn't expose usage via simple API, report connection health
            ok, msg, _ = _runtime_request(
                "GET",
                f"{base_url or 'https://api.openai.com/v1'}/models",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            status_info["rate_limits"] = {"status": "active" if ok else "error", "detail": msg}
        else:
            compatible_defaults = {
                "groq": "https://api.groq.com/openai/v1",
                "deepseek": "https://api.deepseek.com/v1",
                "xai": "https://api.x.ai/v1",
            }
            endpoint = base_url or compatible_defaults.get(provider_id, "")
            if endpoint:
                ok, msg, _ = _runtime_request(
                    "GET", f"{endpoint}/models",
                    headers={"Authorization": f"Bearer {api_key}"},
                )
                status_info["rate_limits"] = {"status": "active" if ok else "error", "detail": msg}
    except Exception:
        status_info["error"] = "Failed to check provider status."

    return status_info


def _chat_send(
    thread_id: str,
    workspace_id: str,
    user_id: str,
    message: str,
    model_hint: str,
    attachment_ids: list[str] | None = None,
) -> ChatSendResponse:
    preparation = _prepare_chat_send(
        thread_id,
        workspace_id,
        user_id,
        message,
        model_hint,
        attachment_ids,
    )

    provider_runtime = _build_chat_provider_runtime(preparation["selected_provider"], workspace_id)
    if provider_runtime is None:
        raise HTTPException(400, "Selected model is not configured. Add the credential in Credentials before using it.")

    provider_client = provider_runtime["provider"]
    system_prompt = (
        "You are FlowHolt AI, the primary workspace agent for the FlowHolt workflow automation platform. "
        "Help users plan work, design workflows, reason through integrations, and propose concrete next actions. "
        "When a request would change the workspace, explain the safest next step and stay specific. "
        "Be concise, helpful, and structured. Use markdown formatting when appropriate."
    )
    # Build messages for LLM
    llm_messages = [{"role": "system", "content": system_prompt}] + preparation["history"]
    actions = build_assistant_actions(message)

    model_used = preparation["selected_provider"]
    try:
        reply = provider_client.chat(llm_messages, temperature=0.7, max_tokens=4096)
    except HTTPException:
        raise
    except Exception:
        reply = "I'm sorry, I'm unable to respond right now. Please check your LLM provider configuration."
        model_used = "error"

    return _finalize_chat_send(
        thread_id=thread_id,
        message=message,
        reply=reply,
        model_used=model_used,
        actions=actions,
        preparation=preparation,
    )


def _chat_send_stream(
    thread_id: str,
    workspace_id: str,
    user_id: str,
    message: str,
    model_hint: str,
    attachment_ids: list[str] | None = None,
) -> StreamingResponse:
    preparation = _prepare_chat_send(
        thread_id,
        workspace_id,
        user_id,
        message,
        model_hint,
        attachment_ids,
    )

    provider_runtime = _build_chat_provider_runtime(preparation["selected_provider"], workspace_id)
    if provider_runtime is None:
        raise HTTPException(400, "Selected model is not configured. Add the credential in Credentials before using it.")

    provider_client = provider_runtime["provider"]
    system_prompt = (
        "You are FlowHolt AI, the primary workspace agent for the FlowHolt workflow automation platform. "
        "Help users plan work, design workflows, reason through integrations, and propose concrete next actions. "
        "When a request would change the workspace, explain the safest next step and stay specific. "
        "Be concise, helpful, and structured. Use markdown formatting when appropriate."
    )
    llm_messages = [{"role": "system", "content": system_prompt}] + preparation["history"]
    actions = build_assistant_actions(message)

    def event_generator():
        chunks: list[str] = []
        model_used = preparation["selected_provider"]
        stream_completed = False
        try:
            for chunk in provider_client.stream_chat(llm_messages, temperature=0.7, max_tokens=4096):
                if not chunk:
                    continue
                chunks.append(chunk)
                yield _format_sse_event("delta", {"delta": chunk})
            stream_completed = True
        except HTTPException:
            raise
        except Exception:
            model_used = "error"
            fallback_reply = "I'm sorry, I'm unable to respond right now. Please check your LLM provider configuration."
            if not chunks:
                for chunk in fallback_reply.split():
                    piece = f"{chunk} "
                    chunks.append(piece)
                    yield _format_sse_event("delta", {"delta": piece})
            stream_completed = True
        reply_text = "".join(chunks).strip()
        if reply_text:
            response = _finalize_chat_send(
                thread_id=thread_id,
                message=message,
                reply=reply_text,
                model_used=model_used,
                actions=actions,
                preparation=preparation,
            )
            if stream_completed:
                yield _format_sse_event("done", response.model_dump())
            return

        if not stream_completed:
            return

        with get_db() as db:
            cnt = db.execute("SELECT COUNT(*) AS c FROM chat_messages WHERE thread_id = ?", (thread_id,)).fetchone()
            if dict(cnt)["c"] <= 1:
                _auto_title_thread(thread_id, message)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _prepare_chat_send(
    thread_id: str,
    workspace_id: str,
    user_id: str,
    message: str,
    model_hint: str,
    attachment_ids: list[str] | None = None,
) -> dict[str, Any]:
    now = datetime.now(UTC).isoformat()
    user_msg_id = f"cm-{secrets.token_hex(12)}"
    asst_msg_id = f"cm-{secrets.token_hex(12)}"
    requested_attachment_ids = attachment_ids or []

    with get_db() as db:
        row = db.execute(
            "SELECT * FROM chat_threads WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (thread_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Thread not found")
        thread = dict(row)
        selected_provider = (model_hint or thread.get("model") or _get_default_chat_provider(workspace_id)).strip().lower()
        if not _is_chat_provider_available(selected_provider, workspace_id):
            raise HTTPException(400, "Selected model is not configured. Add the credential in Credentials before using it.")
        if selected_provider != (thread.get("model") or ""):
            db.execute("UPDATE chat_threads SET model = ?, updated_at = ? WHERE id = ?", (selected_provider, now, thread_id))
        attachment_rows = _resolve_chat_attachment_rows(
            db,
            requested_attachment_ids,
            workspace_id=workspace_id,
            user_id=user_id,
            thread_id=thread_id,
        )
        db.execute(
            "INSERT INTO chat_messages (id, thread_id, role, content, model_used, actions_json, created_at) VALUES (?, ?, 'user', ?, NULL, NULL, ?)",
            (user_msg_id, thread_id, message, now),
        )
        for attachment in attachment_rows:
            db.execute(
                "UPDATE chat_attachments SET thread_id = ?, message_id = ? WHERE id = ?",
                (thread_id, user_msg_id, str(attachment["id"])),
            )

        history_rows = [row_to_dict(row) for row in db.execute(
            "SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC",
            (thread_id,),
        ).fetchall()]
        attachments_by_message = _load_chat_attachment_rows_by_message(
            db,
            [str(item["id"]) for item in history_rows],
            workspace_id=workspace_id,
            user_id=user_id,
        )
        history = []
        for item in history_rows:
            content = str(item["content"])
            attachment_context = _render_chat_attachment_context(attachments_by_message.get(str(item["id"]), []))
            if attachment_context and str(item.get("role")) == "user":
                content = f"{content}\n\n{attachment_context}" if content.strip() else attachment_context
            history.append({"role": str(item["role"]), "content": content})

    return {
        "now": now,
        "user_msg_id": user_msg_id,
        "assistant_msg_id": asst_msg_id,
        "selected_provider": selected_provider,
        "history": history,
        "user_attachments": [_build_chat_attachment_item(item) for item in attachment_rows],
    }


def _finalize_chat_send(
    *,
    thread_id: str,
    message: str,
    reply: str,
    model_used: str,
    actions: list[dict[str, Any]],
    preparation: dict[str, Any],
) -> ChatSendResponse:
    asst_now = datetime.now(UTC).isoformat()
    with get_db() as db:
        db.execute(
            "INSERT INTO chat_messages (id, thread_id, role, content, model_used, actions_json, created_at) VALUES (?, ?, 'assistant', ?, ?, ?, ?)",
            (preparation["assistant_msg_id"], thread_id, reply, model_used, json.dumps(actions) if actions else None, asst_now),
        )
        db.execute("UPDATE chat_threads SET updated_at = ? WHERE id = ?", (asst_now, thread_id))

    with get_db() as db:
        cnt = db.execute("SELECT COUNT(*) AS c FROM chat_messages WHERE thread_id = ?", (thread_id,)).fetchone()
        if dict(cnt)["c"] <= 2:
            _auto_title_thread(thread_id, message)
        thread_row = db.execute("SELECT title FROM chat_threads WHERE id = ?", (thread_id,)).fetchone()

    return ChatSendResponse(
        user_message=ChatMessageItem(
            id=preparation["user_msg_id"],
            thread_id=thread_id,
            role="user",
            content=message,
            model_used=None,
            actions=[],
            attachments=preparation["user_attachments"],
            created_at=preparation["now"],
        ),
        assistant_message=ChatMessageItem(
            id=preparation["assistant_msg_id"],
            thread_id=thread_id,
            role="assistant",
            content=reply,
            model_used=model_used,
            actions=actions,
            attachments=[],
            created_at=asst_now,
        ),
        thread_title=dict(thread_row)["title"] if thread_row else "New chat",
    )


def _auto_title_thread(thread_id: str, first_message: str) -> None:
    """Generate a short title for the thread from the first user message."""
    title = first_message[:60].strip()
    if len(first_message) > 60:
        title = title.rsplit(" ", 1)[0] + "..."
    with get_db() as db:
        db.execute("UPDATE chat_threads SET title = ? WHERE id = ?", (title, thread_id))


# ---------------------------------------------------------------------------
# Bulk operations
# ---------------------------------------------------------------------------

@app.post(f"{settings.api_prefix}/workflows/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_workflows(
    payload: BulkDeleteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> BulkDeleteResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    deleted = 0
    errors: list[str] = []
    for wf_id in payload.ids:
        try:
            delete_workflow(wf_id, workspace_id=workspace_id)
            deleted += 1
        except Exception as exc:
            errors.append(f"{wf_id}: {exc}")
    if deleted:
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="workflows.bulk_deleted",
            target_type="workflow",
            target_id="bulk",
            status="success",
            details={"count": deleted, "ids": payload.ids[:20]},
        )
    return BulkDeleteResponse(deleted=deleted, errors=errors)


@app.post(f"{settings.api_prefix}/vault/assets/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_vault_assets(
    payload: BulkDeleteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> BulkDeleteResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    deleted = 0
    errors: list[str] = []
    for asset_id in payload.ids:
        try:
            delete_vault_asset(asset_id, workspace_id=workspace_id)
            deleted += 1
        except Exception as exc:
            errors.append(f"{asset_id}: {exc}")
    if deleted:
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="vault.bulk_deleted",
            target_type="vault_asset",
            target_id="bulk",
            status="success",
            details={"count": deleted, "ids": payload.ids[:20]},
        )
    return BulkDeleteResponse(deleted=deleted, errors=errors)


@app.post(f"{settings.api_prefix}/executions/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_executions(
    payload: BulkDeleteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> BulkDeleteResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    deleted = 0
    errors: list[str] = []
    for exec_id in payload.ids:
        try:
            delete_execution(exec_id, workspace_id=workspace_id)
            deleted += 1
        except Exception as exc:
            errors.append(f"{exec_id}: {exc}")
    if deleted:
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="executions.bulk_deleted",
            target_type="execution",
            target_id="bulk",
            status="success",
            details={"count": deleted, "ids": payload.ids[:20]},
        )
    return BulkDeleteResponse(deleted=deleted, errors=errors)


# ---------------------------------------------------------------------------
# Plugin registry
# ---------------------------------------------------------------------------

@app.get(f"{settings.api_prefix}/studio/plugins")
def get_plugins(session: dict[str, Any] = Depends(get_session_context)) -> list[dict[str, Any]]:
    _ = session
    from .plugin_loader import get_plugin_registry
    registry = get_plugin_registry()
    return [plugin.to_registry_entry() for plugin in registry.list_all()]


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

@app.get(f"{settings.api_prefix}/notifications", response_model=NotificationListResponse)
def list_notifications(
    session: dict[str, Any] = Depends(get_session_context),
) -> NotificationListResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    items = list_user_notifications(user_id=user_id, workspace_id=workspace_id)
    unread = sum(1 for n in items if not n.get("read"))
    return NotificationListResponse(
        items=[NotificationItem.model_validate(n) for n in items],
        unread_count=unread,
    )


@app.post(f"{settings.api_prefix}/notifications", response_model=NotificationItem, status_code=201)
def create_notification(
    payload: NotificationCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> NotificationItem:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    item = create_user_notification(
        user_id=user_id,
        workspace_id=workspace_id,
        title=payload.title,
        body=payload.body,
        kind=payload.kind,
        link=payload.link,
    )
    return NotificationItem.model_validate(item)


@app.patch(f"{settings.api_prefix}/notifications/{{notification_id}}/read")
def mark_notification_read(
    notification_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    mark_notification_as_read(notification_id, user_id=user_id, workspace_id=workspace_id)
    return Response(status_code=204)


@app.post(f"{settings.api_prefix}/notifications/read-all")
def mark_all_notifications_read(
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    mark_all_notifications_read_for_user(user_id=user_id, workspace_id=workspace_id)
    return Response(status_code=204)


@app.get(f"{settings.api_prefix}/templates/{{template_id}}", response_model=TemplateDetail)
def get_template_detail(template_id: str, session: dict[str, Any] = Depends(get_session_context)) -> TemplateDetail:
    template = get_template(template_id, workspace_id=str(session["workspace"]["id"]))
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateDetail.model_validate(template)


@app.delete(f"{settings.api_prefix}/templates/{{template_id}}")
def delete_template_endpoint(template_id: str, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    deleted = delete_template(template_id, workspace_id=workspace_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Template not found")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="template.delete",
        target_type="template",
        target_id=template_id,
        status="success",
    )
    return {"deleted": True}


@app.get(f"{settings.api_prefix}/workflows", response_model=list[WorkflowSummary])
def get_workflows(
    limit: int = 200,
    offset: int = 0,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowSummary]:
    return [
        WorkflowSummary.model_validate(item)
        for item in list_workflows(workspace_id=str(session["workspace"]["id"]), limit=min(limit, 500), offset=offset)
    ]


@app.get(f"{settings.api_prefix}/vault", response_model=VaultOverviewResponse)
def get_vault_overview(session: dict[str, Any] = Depends(get_session_context)) -> VaultOverviewResponse:
    workspace_id = str(session["workspace"]["id"])
    grouped = list_vault_assets_grouped(workspace_id=workspace_id)
    connections = [VaultConnectionSummary.model_validate(item) for item in grouped.get("connection", [])]
    credentials = [VaultCredentialSummary.model_validate(item) for item in grouped.get("credential", [])]
    variables = [VaultVariableSummary.model_validate(item) for item in grouped.get("variable", [])]
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


@app.get(f"{settings.api_prefix}/vault/assets/{{asset_id}}")
def get_vault_asset_route(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, object]:
    require_workspace_role(session, "owner", "admin")
    asset = get_vault_asset(asset_id, workspace_id=str(session["workspace"]["id"]))
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
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


@app.delete(f"{settings.api_prefix}/vault/assets/{{asset_id}}")
def delete_vault_asset_route(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    asset = get_vault_asset(asset_id, workspace_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    delete_vault_asset(asset_id, workspace_id=workspace_id)
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="vault.asset.deleted",
        target_type="vault_asset",
        target_id=asset_id,
        status="success",
        details={"kind": str(asset.get("kind")), "name": str(asset.get("name"))},
    )
    return Response(status_code=204)


@app.get(f"{settings.api_prefix}/vault/assets/{{asset_id}}/access", response_model=VaultAssetAccessResponse)
def get_vault_asset_access_route(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> VaultAssetAccessResponse:
    workspace_id = str(session["workspace"]["id"])
    asset = get_vault_asset_access(asset_id, workspace_id=workspace_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    return VaultAssetAccessResponse(
        asset_id=str(asset["id"]),
        workspace_id=workspace_id,
        name=str(asset["name"]),
        kind=str(asset["kind"]),
        visibility=str(asset.get("visibility") or "workspace"),
        owner_user_id=str(asset.get("created_by_user_id") or "") or None,
        allowed_roles=[str(item) for item in asset.get("allowed_roles") or []],
        allowed_user_ids=[str(item) for item in asset.get("allowed_user_ids") or []],
        can_edit=can_edit_vault_asset(asset, session),
        can_test=can_test_vault_asset(asset, session),
    )


@app.put(f"{settings.api_prefix}/vault/assets/{{asset_id}}/access", response_model=VaultAssetAccessResponse)
def put_vault_asset_access_route(
    asset_id: str,
    payload: VaultAssetAccessUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> VaultAssetAccessResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    asset = update_vault_asset_access(
        asset_id,
        workspace_id=workspace_id,
        visibility=payload.visibility,
        allowed_roles=[str(item) for item in payload.allowed_roles],
        allowed_user_ids=[str(item) for item in payload.allowed_user_ids],
    )
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="vault.asset.access.updated",
        target_type="vault_asset",
        target_id=asset_id,
        status="success",
        details={
            "visibility": payload.visibility,
            "allowed_roles": [str(item) for item in payload.allowed_roles],
            "allowed_user_ids": [str(item) for item in payload.allowed_user_ids],
        },
    )
    return VaultAssetAccessResponse(
        asset_id=str(asset["id"]),
        workspace_id=workspace_id,
        name=str(asset["name"]),
        kind=str(asset["kind"]),
        visibility=str(asset.get("visibility") or "workspace"),
        owner_user_id=str(asset.get("created_by_user_id") or "") or None,
        allowed_roles=[str(item) for item in asset.get("allowed_roles") or []],
        allowed_user_ids=[str(item) for item in asset.get("allowed_user_ids") or []],
        can_edit=can_edit_vault_asset(asset, session),
        can_test=can_test_vault_asset(asset, session),
    )


def _build_runtime_verification_check(code: str, label: str, passed: bool, message: str) -> dict[str, Any]:
    return {
        "code": code,
        "label": label,
        "passed": passed,
        "severity": "info" if passed else "error",
        "message": message,
    }


def _response_excerpt(response: httpx.Response) -> str:
    text = response.text.strip()
    if not text:
        return ""
    return " ".join(text.split())[:180]


def _runtime_request(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    params: dict[str, str] | None = None,
) -> tuple[bool, str, httpx.Response | None]:
    try:
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            response = client.request(method, url, headers=headers, params=params)
    except httpx.HTTPError as exc:
        return False, f"Request failed: {exc}", None

    if 200 <= response.status_code < 300:
        return True, f"HTTP {response.status_code}", response

    excerpt = _response_excerpt(response)
    message = f"HTTP {response.status_code}"
    if excerpt:
        message = f"{message} - {excerpt}"
    return False, message, response


def _missing_runtime_secret_result() -> dict[str, Any]:
    return {
        "attempted": True,
        "verified": False,
        "checks": [
            _build_runtime_verification_check(
                "runtime_secret",
                "Live provider check",
                False,
                "Missing secret required for live verification.",
            )
        ],
    }


def _verify_connection_runtime(asset: dict[str, Any]) -> dict[str, Any]:
    secret = dict(asset.get("secret") or {})
    provider = str(asset.get("app") or asset.get("name") or "").strip().lower()
    access_token = str(secret.get("access_token") or secret.get("token") or "").strip()
    if provider not in {"github", "slack", "notion", "google", "microsoft"}:
        return {"attempted": False, "verified": True, "checks": []}
    if not access_token:
        return _missing_runtime_secret_result()

    if provider == "github":
        ok, message, response = _runtime_request(
            "GET",
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )
        if ok and response is not None:
            login = str((response.json() or {}).get("login") or "authenticated user")
            message = f"GitHub token accepted for {login}."
    elif provider == "slack":
        ok, message, response = _runtime_request(
            "POST",
            "https://slack.com/api/auth.test",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if ok and response is not None:
            payload = response.json() or {}
            ok = bool(payload.get("ok"))
            message = (
                f"Slack token accepted for workspace {payload.get('team') or 'unknown'}."
                if ok
                else f"Slack rejected the token: {payload.get('error') or 'unknown_error'}."
            )
    elif provider == "notion":
        ok, message, response = _runtime_request(
            "GET",
            "https://api.notion.com/v1/users/me",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Notion-Version": "2022-06-28",
            },
        )
        if ok:
            message = "Notion token accepted."
    elif provider == "google":
        ok, message, response = _runtime_request(
            "GET",
            "https://www.googleapis.com/oauth2/v3/tokeninfo",
            params={"access_token": access_token},
        )
        if ok and response is not None:
            audience = str((response.json() or {}).get("aud") or "verified audience")
            message = f"Google token is valid for audience {audience}."
    else:
        ok, message, response = _runtime_request(
            "GET",
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if ok and response is not None:
            user_principal_name = str((response.json() or {}).get("userPrincipalName") or "authenticated user")
            message = f"Microsoft token accepted for {user_principal_name}."

    return {
        "attempted": True,
        "verified": ok,
        "checks": [
            _build_runtime_verification_check(
                "runtime_connection",
                "Live provider check",
                ok,
                message,
            )
        ],
    }


def _verify_credential_runtime(asset: dict[str, Any]) -> dict[str, Any]:
    secret = dict(asset.get("secret") or {})
    provider = str(asset.get("app") or asset.get("name") or "").strip().lower()
    if provider not in {
        "anthropic",
        "deepseek",
        "gemini",
        "google",
        "googleai",
        "groq",
        "ollama",
        "openai",
        "openrouter",
        "xai",
    }:
        return {"attempted": False, "verified": True, "checks": []}

    api_key = str(secret.get("api_key") or secret.get("token") or secret.get("value") or "").strip()
    base_url = str(secret.get("base_url") or "").strip().rstrip("/")

    if provider in {"gemini", "google", "googleai"}:
        if not api_key:
            return _missing_runtime_secret_result()
        ok, message, response = _runtime_request(
            "GET",
            "https://generativelanguage.googleapis.com/v1beta/models",
            params={"key": api_key},
        )
        if ok and response is not None:
            models = response.json().get("models") or []
            message = f"Gemini API key accepted. Models visible: {len(models)}."
    elif provider == "anthropic":
        if not api_key:
            return _missing_runtime_secret_result()
        ok, message, response = _runtime_request(
            "GET",
            "https://api.anthropic.com/v1/models",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
        )
        if ok and response is not None:
            models = response.json().get("data") or []
            message = f"Anthropic API key accepted. Models visible: {len(models)}."
    elif provider == "ollama":
        endpoint = f"{base_url or 'http://127.0.0.1:11434'}/api/tags"
        ok, message, response = _runtime_request("GET", endpoint)
        if ok and response is not None:
            models = response.json().get("models") or []
            message = f"Ollama endpoint reachable. Models visible: {len(models)}."
    else:
        if not api_key:
            return _missing_runtime_secret_result()
        compatible_defaults = {
            "openai": "https://api.openai.com/v1",
            "groq": "https://api.groq.com/openai/v1",
            "openrouter": "https://openrouter.ai/api/v1",
            "deepseek": "https://api.deepseek.com/v1",
            "xai": "https://api.x.ai/v1",
        }
        endpoint = f"{base_url or compatible_defaults.get(provider, 'https://api.openai.com/v1')}/models"
        ok, message, response = _runtime_request(
            "GET",
            endpoint,
            headers={"Authorization": f"Bearer {api_key}"},
        )
        if ok and response is not None:
            payload = response.json() or {}
            models = payload.get("data") or payload.get("models") or []
            message = f"{provider.title()} credential accepted. Models visible: {len(models)}."

    return {
        "attempted": True,
        "verified": ok,
        "checks": [
            _build_runtime_verification_check(
                "runtime_credential",
                "Live provider check",
                ok,
                message,
            )
        ],
    }


def _verify_vault_asset_runtime(asset: dict[str, Any]) -> dict[str, Any]:
    kind = str(asset.get("kind") or "")
    if kind == "connection":
        return _verify_connection_runtime(asset)
    if kind == "credential":
        return _verify_credential_runtime(asset)
    return {"attempted": False, "verified": True, "checks": []}


@app.get(f"{settings.api_prefix}/vault/assets/{{asset_id}}/health", response_model=VaultAssetHealthResponse)
def get_vault_asset_health(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> VaultAssetHealthResponse:
    workspace_id = str(session["workspace"]["id"])
    asset = get_vault_asset(asset_id, workspace_id=workspace_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    return VaultAssetHealthResponse.model_validate(build_vault_asset_health(asset, workspace_id=workspace_id))


@app.post(f"{settings.api_prefix}/vault/assets/{{asset_id}}/verify", response_model=VaultAssetVerifyResponse)
def post_vault_asset_verify(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> VaultAssetVerifyResponse:
    workspace_id = str(session["workspace"]["id"])
    asset = get_vault_asset(asset_id, workspace_id=workspace_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    health = build_vault_asset_health(asset, workspace_id=workspace_id)
    runtime_result = _verify_vault_asset_runtime(asset) if health["healthy"] else {"attempted": False, "verified": False, "checks": []}
    checks = [*health["checks"], *runtime_result["checks"]]
    verified = bool(health["healthy"]) and bool(runtime_result["verified"] if runtime_result["attempted"] else True)
    mode = "runtime" if runtime_result["attempted"] else "static"
    next_steps: list[str] = []
    if not health["healthy"]:
        next_steps.append("Open this asset in Vault and fill the missing required fields.")
    elif mode == "runtime" and not verified:
        if str(asset.get("kind")) == "connection":
            next_steps.append("Reconnect this provider or refresh its token, then run verification again.")
        elif str(asset.get("kind")) == "credential":
            next_steps.append("Check the API key or base URL, then rerun verification.")
    if str(asset.get("kind")) == "connection":
        next_steps.append("Use this verified connection in studio node configuration.")
    elif str(asset.get("kind")) == "credential":
        next_steps.append("Bind this credential to the matching provider node in studio.")
    else:
        next_steps.append("Reference this variable from a node config or shared runtime binding.")
    if mode == "static":
        next_steps.append("This asset currently supports structural validation only, not a live provider handshake.")

    sample_request = {}
    if str(asset.get("app") or "").lower() == "slack":
        sample_request = {"channel": dict(asset.get("secret") or {}).get("channel"), "message": "FlowHolt verification ping"}
    elif str(asset.get("app") or "").lower() in {"openai", "anthropic"}:
        sample_request = {"model": dict(asset.get("secret") or {}).get("model"), "prompt": "Return a short health check response."}
    elif str(asset.get("kind")) == "variable":
        sample_request = {"value_preview": dict(asset.get("secret") or {}).get("value")}

    return VaultAssetVerifyResponse(
        asset_id=str(asset["id"]),
        workspace_id=workspace_id,
        verified=verified,
        mode=mode,
        checks=checks,
        sample_request=sample_request,
        next_steps=next_steps,
    )


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}", response_model=WorkflowDetail)
def get_workflow_detail(workflow_id: str, session: dict[str, Any] = Depends(get_session_context)) -> WorkflowDetail:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None
    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    return WorkflowDetail.model_validate(
        {
            **workflow,
            "definition": repaired_definition,
        }
    )


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/policy", response_model=WorkflowPolicyResponse)
def get_workflow_policy(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowPolicyResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_workflow_policy_response(
        workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        definition=workflow["definition_json"],
        workspace_id=workspace_id,
        session=session,
    )


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/environments", response_model=WorkflowEnvironmentsResponse)
def get_workflow_environments(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowEnvironmentsResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_workflow_environments_response(workflow, workspace_id=workspace_id)


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/deployments", response_model=list[WorkflowVersionSummary])
def get_workflow_deployments(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowVersionSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    versions = [
        item for item in list_workflow_versions(workflow_id, workspace_id=workspace_id)
        if str(item.get("status")) in {"staging", "published"}
    ]
    return [WorkflowVersionSummary.model_validate(item) for item in versions]


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/deployment-history", response_model=list[WorkflowDeploymentSummary])
def get_workflow_deployment_history(
    workflow_id: str,
    environment: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowDeploymentSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    history = list_workflow_deployments(workflow_id, workspace_id=workspace_id, environment=environment)
    return [build_workflow_deployment_summary(item) for item in history]


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/deployment-history/{{deployment_id}}", response_model=WorkflowDeploymentDetail)
def get_workflow_deployment_detail(
    workflow_id: str,
    deployment_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentDetail:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    deployment = get_workflow_deployment(deployment_id, workspace_id=workspace_id)
    if deployment is None or str(deployment["workflow_id"]) != workflow_id:
        raise HTTPException(status_code=404, detail="Workflow deployment not found")
    return build_workflow_deployment_detail(deployment, workspace_id=workspace_id)


@app.get(f"{settings.api_prefix}/deployment-reviews", response_model=list[WorkflowDeploymentReviewSummary])
def get_workspace_deployment_reviews(
    status: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowDeploymentReviewSummary]:
    workspace_id = str(session["workspace"]["id"])
    reviews = list_workflow_deployment_reviews(workspace_id=workspace_id, status=status)
    return [build_workflow_deployment_review_summary(item) for item in reviews]


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/deployment-reviews", response_model=list[WorkflowDeploymentReviewSummary])
def get_workflow_deployment_reviews(
    workflow_id: str,
    status: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowDeploymentReviewSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    reviews = list_workflow_deployment_reviews(workspace_id=workspace_id, workflow_id=workflow_id, status=status)
    return [build_workflow_deployment_review_summary(item) for item in reviews]


@app.get(f"{settings.api_prefix}/deployment-reviews/{{review_id}}", response_model=WorkflowDeploymentReviewDetail)
def get_deployment_review_detail(
    review_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentReviewDetail:
    workspace_id = str(session["workspace"]["id"])
    review = get_workflow_deployment_review(review_id, workspace_id=workspace_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Deployment review not found")
    return build_workflow_deployment_review_detail(review, workspace_id=workspace_id, session=session)


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/request-promotion", response_model=WorkflowDeploymentReviewSummary, status_code=201)
def request_workflow_promotion(
    workflow_id: str,
    payload: WorkflowPromotionRequestCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentReviewSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None
    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )

    settings_payload = get_workspace_settings(workspace_id)
    public_trigger_type = resolve_public_trigger_type(
        str(workflow.get("trigger_type") or ""),
        get_trigger_step_config(repaired_definition),
    )
    if payload.target_environment == "production" and not public_trigger_is_allowed(settings_payload, public_trigger_type):
        if public_trigger_type == "chat":
            raise HTTPException(status_code=403, detail="Workspace policy blocks public chat trigger workflows from being promoted to production")
        raise HTTPException(status_code=403, detail="Workspace policy blocks public webhook workflows from being promoted to production")
    if payload.target_environment == "production" and settings_payload.get("require_staging_before_production"):
        staged_version = get_staging_workflow_version(workflow_id, workspace_id=workspace_id)
        if staged_version is None:
            raise HTTPException(status_code=409, detail="Stage this workflow before requesting production approval")
        if dict(staged_version.get("definition_json") or {}) != repaired_definition:
            raise HTTPException(
                status_code=409,
                detail="Current workflow draft differs from the staged version. Promote to staging again before requesting production approval.",
            )

    pending_reviews = list_workflow_deployment_reviews(workspace_id=workspace_id, workflow_id=workflow_id, status="pending")
    if any(str(item.get("target_environment")) == payload.target_environment for item in pending_reviews):
        raise HTTPException(status_code=409, detail=f"A pending {payload.target_environment} review already exists for this workflow")

    workflow = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    ) or workflow

    snapshot = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="draft_snapshot",
        notes=payload.notes or f"Pending {payload.target_environment} approval snapshot",
    )
    review = create_workflow_deployment_review(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        requested_by_user_id=str(session["user"]["id"]),
        target_environment=payload.target_environment,
        target_version_id=str(snapshot["id"]),
        notes=payload.notes,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.review_requested.{payload.target_environment}",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"review_id": review["id"], "target_version_id": snapshot["id"]},
    )
    _deliver_deployment_review_request_alert(
        workflow=workflow,
        session=session,
        target_environment=payload.target_environment,
        notes=payload.notes,
        settings_payload=settings_payload,
    )
    return build_workflow_deployment_review_summary(review)


@app.post(f"{settings.api_prefix}/deployment-reviews/{{review_id}}/approve", response_model=WorkflowDeploymentSummary)
def approve_deployment_review(
    review_id: str,
    payload: WorkflowDeploymentReviewDecisionRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentSummary:
    workspace_id = str(session["workspace"]["id"])
    review = get_workflow_deployment_review(review_id, workspace_id=workspace_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Deployment review not found")
    if str(review.get("status")) != "pending":
        raise HTTPException(status_code=409, detail="Deployment review is not pending")

    settings_payload = get_workspace_settings(workspace_id)
    if not can_review_deployment(
        session,
        settings_payload=settings_payload,
        requested_by_user_id=str(review["requested_by_user_id"]),
    ):
        raise HTTPException(status_code=403, detail="You do not have permission to approve this deployment review")

    workflow = get_workflow(str(review["workflow_id"]), workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    target_version = get_workflow_version(str(review["target_version_id"]), workspace_id=workspace_id)
    if target_version is None:
        raise HTTPException(status_code=404, detail="Review target version not found")

    if str(review["target_environment"]) == "production" and settings_payload.get("require_staging_before_production"):
        staged_version = get_staging_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
        if staged_version is None or str(staged_version["id"]) != str(target_version["id"]):
            raise HTTPException(
                status_code=409,
                detail="Production approval requires the same version to be currently staged first",
            )

    enforce_workflow_asset_access_or_raise(
        target_version["definition_json"],
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        target_version["definition_json"],
        workflow_id=str(workflow["id"]),
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="stage" if str(review["target_environment"]) == "staging" else "publish",
    )

    updated = set_workflow_environment_version(
        str(workflow["id"]),
        workspace_id=workspace_id,
        environment=str(review["target_environment"]),
        version_id=str(target_version["id"]),
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to apply approved deployment")
    update_workflow_version_status(
        str(target_version["id"]),
        workspace_id=workspace_id,
        status="staging" if str(review["target_environment"]) == "staging" else "published",
    )
    approved = update_workflow_deployment_review(
        review_id,
        workspace_id=workspace_id,
        status="approved",
        reviewed_by_user_id=str(session["user"]["id"]),
        review_comment=payload.comment,
    )
    if approved is None:
        raise HTTPException(status_code=500, detail="Failed to update deployment review")

    current_pointer_id = None
    if str(review["target_environment"]) == "staging":
        current_pointer_id = str(workflow.get("staging_version_id")) if workflow.get("staging_version_id") else None
    else:
        current_pointer_id = str(workflow.get("published_version_id")) if workflow.get("published_version_id") else None

    deployment = create_workflow_deployment(
        workflow_id=str(workflow["id"]),
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        environment=str(review["target_environment"]),
        action="promote",
        from_version_id=current_pointer_id,
        to_version_id=str(target_version["id"]),
        notes=review.get("notes") or f"Approved for {review['target_environment']}",
        metadata={"source": "review", "review_id": review_id},
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.review_approved.{review['target_environment']}",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"review_id": review_id, "deployment_id": deployment["id"], "target_version_id": target_version["id"]},
    )
    return build_workflow_deployment_summary(deployment)


@app.post(f"{settings.api_prefix}/deployment-reviews/{{review_id}}/reject", response_model=WorkflowDeploymentReviewSummary)
def reject_deployment_review(
    review_id: str,
    payload: WorkflowDeploymentReviewDecisionRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentReviewSummary:
    workspace_id = str(session["workspace"]["id"])
    review = get_workflow_deployment_review(review_id, workspace_id=workspace_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Deployment review not found")
    if str(review.get("status")) != "pending":
        raise HTTPException(status_code=409, detail="Deployment review is not pending")

    settings_payload = get_workspace_settings(workspace_id)
    if not can_review_deployment(
        session,
        settings_payload=settings_payload,
        requested_by_user_id=str(review["requested_by_user_id"]),
    ):
        raise HTTPException(status_code=403, detail="You do not have permission to reject this deployment review")

    rejected = update_workflow_deployment_review(
        review_id,
        workspace_id=workspace_id,
        status="rejected",
        reviewed_by_user_id=str(session["user"]["id"]),
        review_comment=payload.comment,
    )
    if rejected is None:
        raise HTTPException(status_code=500, detail="Failed to update deployment review")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.review_rejected.{review['target_environment']}",
        target_type="workflow",
        target_id=str(review["workflow_id"]),
        status="success",
        details={"review_id": review_id, "target_version_id": review["target_version_id"]},
    )
    return build_workflow_deployment_review_summary(rejected)


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/compare", response_model=WorkflowCompareResponse)
def compare_workflow_versions(
    workflow_id: str,
    from_ref: str = "draft",
    to_ref: str = "production",
    from_version_id: str | None = None,
    to_version_id: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowCompareResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_workflow_compare_response(
        workflow,
        workspace_id=workspace_id,
        from_ref=from_ref,
        to_ref=to_ref,
        from_version_id=from_version_id,
        to_version_id=to_version_id,
    )


@app.get(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/bundle", response_model=StudioWorkflowBundleResponse)
def get_studio_workflow_bundle(
    workflow_id: str,
    selected_step_id: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_studio_workflow_bundle_payload(
        workflow,
        workspace_id=workspace_id,
        selected_step_id=selected_step_id,
    )


@app.get(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/editor", response_model=NodeEditorResponse)
def get_studio_workflow_step_editor(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeEditorResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")

    binding_context = get_workspace_binding_context(workspace_id)
    payload = build_node_editor_response(
        str(step["type"]),
        config=dict(step.get("config") or {}),
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workflow_definition=workflow["definition_json"],
        current_step_id=step_id,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        step_name=str(step.get("name") or ""),
    )
    return NodeEditorResponse.model_validate(payload)


@app.get(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/access", response_model=StudioStepAccessResponse)
def get_studio_workflow_step_access(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioStepAccessResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    return build_step_access_response(workflow_id, step, workspace_id=workspace_id, session=session)


@app.get(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/resources", response_model=NodeResourcesResponse)
def get_studio_workflow_step_resources(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeResourcesResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    binding_context = get_workspace_binding_context(workspace_id)
    result = build_node_resources(
        str(step["type"]),
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        config=dict(step.get("config") or {}),
    )
    return NodeResourcesResponse.model_validate(result)


@app.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/dynamic-props", response_model=NodeDynamicPropsResponse)
def post_studio_workflow_step_dynamic_props(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeDynamicPropsResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    binding_context = get_workspace_binding_context(workspace_id)
    result = resolve_dynamic_operation_fields(
        node_type=str(step["type"]),
        config=dict(step.get("config") or {}),
        connections=binding_context["connections"],
        variables=binding_context["variables"],
    )
    return NodeDynamicPropsResponse.model_validate(result)


@app.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/validate", response_model=NodeConfigValidationResponse)
def post_studio_workflow_step_validate(
    workflow_id: str,
    step_id: str,
    payload: NodeConfigTestRequest | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeConfigValidationResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    binding_context = get_workspace_binding_context(workspace_id)
    result = validate_node_configuration(
        str(step["type"]),
        config=dict(payload.config if payload is not None else step.get("config") or {}),
        trigger_type=str((payload.trigger_type if payload is not None and payload.trigger_type is not None else workflow.get("trigger_type")) or ""),
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        step_name=str((payload.name if payload is not None and payload.name is not None else step.get("name")) or ""),
    )
    definition = dict(workflow.get("definition_json") or {})
    candidate_steps: list[dict[str, Any]] = []
    for item in (definition.get("steps") or []):
        if str(item.get("id") or "") != step_id:
            candidate_steps.append(dict(item or {}))
            continue
        candidate_steps.append(
            {
                **dict(item or {}),
                "name": payload.name if payload is not None and payload.name is not None else item.get("name"),
                "config": dict(payload.config if payload is not None else item.get("config") or {}),
            }
        )
    definition["steps"] = candidate_steps
    cluster_issues = [
        issue
        for issue in validate_workflow_cluster_configuration(definition)
        if str(issue.get("step_id") or "") == step_id
    ]
    if cluster_issues:
        merged_issues = [
            *list(result.get("issues") or []),
            *[
                {
                    "level": issue["level"],
                    "code": issue["code"],
                    "message": issue["message"],
                    "field": issue.get("field"),
                }
                for issue in cluster_issues
            ],
        ]
        result = {
            **result,
            "valid": not any(issue["level"] == "error" for issue in merged_issues),
            "issues": merged_issues,
        }
    return NodeConfigValidationResponse.model_validate(result)


@app.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/test-config", response_model=NodeConfigTestResponse)
def post_studio_workflow_step_test_config(
    workflow_id: str,
    step_id: str,
    payload: StudioStepTestRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeConfigTestResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    binding_context = get_workspace_binding_context(workspace_id)
    result = test_node_configuration(
        str(step["type"]),
        config=dict(step.get("config") or {}),
        trigger_type=str(workflow.get("trigger_type") or ""),
        payload=payload.payload,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        step_name=str(step.get("name") or ""),
    )
    return NodeConfigTestResponse.model_validate(result)


@app.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/insert", response_model=StudioWorkflowBundleResponse)
def post_studio_insert_step(
    workflow_id: str,
    payload: StudioInsertStepRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    binding_context = get_workspace_binding_context(workspace_id)
    draft = build_node_draft(
        payload.node_type,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        name=payload.name,
        config=payload.config,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
    )
    next_definition = insert_step_into_definition(
        workflow["definition_json"],
        draft["step"],
        after_step_id=payload.after_step_id,
        branch_label=payload.branch_label,
        connect_to_step_id=payload.connect_to_step_id,
    )
    repaired_definition, _ = repair_definition_for_storage(
        next_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    updated = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to insert step")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="studio.step.inserted",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"step_id": draft["step"]["id"], "node_type": payload.node_type},
    )
    return build_studio_workflow_bundle_payload(updated, workspace_id=workspace_id, selected_step_id=str(draft["step"]["id"]))


@app.put(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}", response_model=StudioWorkflowBundleResponse)
def put_studio_step(
    workflow_id: str,
    step_id: str,
    payload: StudioUpdateStepRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if not any(str(step.get("id")) == step_id for step in workflow["definition_json"].get("steps", [])):
        raise HTTPException(status_code=404, detail="Workflow step not found")

    next_definition = update_step_in_definition(
        workflow["definition_json"],
        step_id,
        name=payload.name,
        config=payload.config,
        replace_config=payload.replace_config,
    )
    repaired_definition, _ = repair_definition_for_storage(
        next_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    updated = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to update step")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="studio.step.updated",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"step_id": step_id},
    )
    return build_studio_workflow_bundle_payload(updated, workspace_id=workspace_id, selected_step_id=step_id)


@app.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/duplicate", response_model=StudioWorkflowBundleResponse)
def post_studio_duplicate_step(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    try:
        next_definition, duplicate_id = duplicate_step_in_definition(workflow["definition_json"], step_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    repaired_definition, _ = repair_definition_for_storage(
        next_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    updated = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to duplicate step")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="studio.step.duplicated",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"step_id": step_id, "duplicate_id": duplicate_id},
    )
    return build_studio_workflow_bundle_payload(updated, workspace_id=workspace_id, selected_step_id=duplicate_id)


@app.delete(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}", response_model=StudioWorkflowBundleResponse)
def delete_studio_step(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    next_definition = delete_step_from_definition(workflow["definition_json"], step_id)
    repaired_definition, _ = repair_definition_for_storage(
        next_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    updated = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to delete step")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="studio.step.deleted",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"step_id": step_id},
    )
    fallback_selected = updated["definition_json"].get("steps", [{}])[0].get("id") if updated["definition_json"].get("steps") else None
    return build_studio_workflow_bundle_payload(updated, workspace_id=workspace_id, selected_step_id=fallback_selected)


@app.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/test", response_model=StudioStepTestResponse)
def post_studio_test_step(
    workflow_id: str,
    step_id: str,
    payload: StudioStepTestRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioStepTestResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in workflow["definition_json"].get("steps", []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")

    vault_context = build_vault_runtime_context(workspace_id)
    result = test_step_in_definition(
        workflow["definition_json"],
        target_step_id=step_id,
        payload=payload.payload,
        vault_context=vault_context,
    )
    binding_context = get_workspace_binding_context(workspace_id)
    preview_payload = resolve_node_preview(
        step,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
    )
    return StudioStepTestResponse(
        workflow_id=workflow_id,
        step_id=step_id,
        reached_target=bool(result["reached_target"]),
        status=str(result["status"]),
        executed_step_ids=result["executed_step_ids"],
        target_step_result=result["target_step_result"],
        warnings=result["warnings"],
        preview=NodePreviewResponse.model_validate(preview_payload),
    )


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/integrity", response_model=WorkflowValidationResponse)
def get_workflow_integrity(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowValidationResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            workflow["definition_json"],
            workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        )
    )


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/repair", response_model=WorkflowDetail)
def post_workflow_repair(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDetail:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None

    issues_before = WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            workflow["definition_json"],
            workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        )
    )
    repaired_definition, actions = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    updated = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to repair workflow")
    create_workflow_version(
        updated,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="draft_snapshot",
        notes="Auto-repaired legacy workflow definition",
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.repaired",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={
            "actions": actions,
            "issues_before": [issue.model_dump() for issue in issues_before.issues],
        },
    )
    return WorkflowDetail.model_validate({**updated, "definition": updated["definition_json"]})


@app.post(f"{settings.api_prefix}/system/repair-workflows", response_model=WorkflowRepairResponse)
def post_repair_workspace_workflows(
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowRepairResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflows = list_workflows(workspace_id=workspace_id)
    results: list[WorkflowRepairSummary] = []
    repaired_count = 0

    for workflow in workflows:
        validation_before = WorkflowValidationResponse.model_validate(
            validate_workflow_definition(
                workflow["definition_json"],
                workflow_trigger_type=str(workflow.get("trigger_type") or ""),
            )
        )

        template_definition = None
        if workflow.get("template_id"):
            template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
            template_definition = template.get("definition") if template else None

        repaired_definition, actions = repair_definition_for_storage(
            workflow["definition_json"],
            workflow_trigger_type=str(workflow.get("trigger_type") or ""),
            template_definition=template_definition,
        )
        validation_after = WorkflowValidationResponse.model_validate(
            validate_workflow_definition(
                repaired_definition,
                workflow_trigger_type=str(workflow.get("trigger_type") or ""),
            )
        )
        runtime_validation_blocked = False
        try:
            validate_runtime_node_contracts_or_raise(
                repaired_definition,
                workflow_trigger_type=str(workflow.get("trigger_type") or ""),
                workspace_id=workspace_id,
            )
        except HTTPException:
            runtime_validation_blocked = True
        issues_before_dump = [issue.model_dump() for issue in validation_before.issues]
        issues_after_dump = [issue.model_dump() for issue in validation_after.issues]
        should_repair = bool(actions) or len(issues_after_dump) < len(issues_before_dump)

        if not should_repair:
            results.append(
                WorkflowRepairSummary(
                    workflow_id=str(workflow["id"]),
                    workflow_name=str(workflow["name"]),
                    repaired=False,
                    actions=actions,
                    issues_before=validation_before.issues,
                    issues_after=validation_after.issues,
                )
            )
            continue
        if [issue for issue in validation_after.issues if issue.level == "error"] or runtime_validation_blocked:
            results.append(
                WorkflowRepairSummary(
                    workflow_id=str(workflow["id"]),
                    workflow_name=str(workflow["name"]),
                    repaired=False,
                    actions=actions,
                    issues_before=validation_before.issues,
                    issues_after=validation_after.issues,
                )
            )
            continue

        updated = update_workflow(
            str(workflow["id"]),
            WorkflowUpdate(
                name=str(workflow["name"]),
                trigger_type=str(workflow["trigger_type"]),
                category=str(workflow["category"]),
                status=str(workflow["status"]),
                definition=WorkflowDefinition.model_validate(repaired_definition),
            ),
            workspace_id=workspace_id,
        )
        if updated is None:
            results.append(
                WorkflowRepairSummary(
                    workflow_id=str(workflow["id"]),
                    workflow_name=str(workflow["name"]),
                    repaired=False,
                    actions=actions,
                    issues_before=validation_before.issues,
                    issues_after=validation_after.issues,
                )
            )
            continue

        create_workflow_version(
            updated,
            workspace_id=workspace_id,
            created_by_user_id=str(session["user"]["id"]),
            status="draft_snapshot",
            notes="Auto-repaired legacy workflow definition",
        )
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="workflow.repaired",
            target_type="workflow",
            target_id=str(workflow["id"]),
            status="success",
            details={"actions": actions},
        )
        repaired_count += 1
        results.append(
            WorkflowRepairSummary(
                workflow_id=str(workflow["id"]),
                workflow_name=str(workflow["name"]),
                repaired=True,
                actions=actions,
                issues_before=validation_before.issues,
                issues_after=validation_after.issues,
            )
        )

    return WorkflowRepairResponse(
        total_checked=len(workflows),
        repaired_count=repaired_count,
        results=results,
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
    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None
    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="publish",
    )
    workspace_settings = get_workspace_settings(workspace_id)
    if requires_deployment_approval(workspace_settings, "production"):
        raise HTTPException(
            status_code=409,
            detail="Production publish requires an approval request in this workspace",
        )
    if workspace_settings.get("require_staging_before_production"):
        staged_version = get_staging_workflow_version(workflow_id, workspace_id=workspace_id)
        if staged_version is None:
            raise HTTPException(status_code=409, detail="Stage this workflow before promoting it to production")
        if dict(staged_version.get("definition_json") or {}) != repaired_definition:
            raise HTTPException(
                status_code=409,
                detail="Current workflow draft differs from the staged version. Promote to staging again before production.",
            )
    workflow = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    ) or workflow

    version = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="published",
        notes=payload.notes,
    )
    create_workflow_deployment(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        environment="production",
        action="promote",
        from_version_id=str(workflow.get("published_version_id")) if workflow.get("published_version_id") else None,
        to_version_id=str(version["id"]),
        notes=payload.notes or "Published to production",
        metadata={"source": "publish"},
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


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/promote", response_model=WorkflowVersionSummary, status_code=201)
def promote_workflow(
    workflow_id: str,
    payload: WorkflowPromotionRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowVersionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None
    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )

    action = "stage" if payload.target_environment == "staging" else "publish"
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action=action,
    )
    workspace_settings = get_workspace_settings(workspace_id)
    if requires_deployment_approval(workspace_settings, payload.target_environment):
        raise HTTPException(
            status_code=409,
            detail=f"{payload.target_environment.title()} promotion requires an approval request in this workspace",
        )

    if payload.target_environment == "production":
        if workspace_settings.get("require_staging_before_production"):
            staged_version = get_staging_workflow_version(workflow_id, workspace_id=workspace_id)
            if staged_version is None:
                raise HTTPException(status_code=409, detail="Stage this workflow before promoting it to production")
            if dict(staged_version.get("definition_json") or {}) != repaired_definition:
                raise HTTPException(
                    status_code=409,
                    detail="Current workflow draft differs from the staged version. Promote to staging again before production.",
                )

    workflow = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    ) or workflow

    version = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="staging" if payload.target_environment == "staging" else "published",
        notes=payload.notes or f"Promoted to {payload.target_environment}",
    )
    from_version_id = None
    if payload.target_environment == "staging":
        from_version_id = str(workflow.get("staging_version_id")) if workflow.get("staging_version_id") else None
    else:
        from_version_id = str(workflow.get("published_version_id")) if workflow.get("published_version_id") else None
    create_workflow_deployment(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        environment=payload.target_environment,
        action="promote",
        from_version_id=from_version_id,
        to_version_id=str(version["id"]),
        notes=payload.notes or f"Promoted to {payload.target_environment}",
        metadata={"source": "promote"},
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.promoted.{payload.target_environment}",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"version_id": version["id"], "version_number": version["version_number"]},
    )
    return WorkflowVersionSummary.model_validate(version)


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/rollback", response_model=WorkflowDeploymentSummary, status_code=201)
def rollback_workflow_environment(
    workflow_id: str,
    payload: WorkflowRollbackRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    current_version = (
        get_staging_workflow_version(workflow_id, workspace_id=workspace_id)
        if payload.target_environment == "staging"
        else get_published_workflow_version(workflow_id, workspace_id=workspace_id)
    )
    if current_version is None:
        raise HTTPException(status_code=409, detail=f"No current {payload.target_environment} deployment exists for this workflow")

    target_version = None
    if payload.target_version_id:
        target_version = get_workflow_version(payload.target_version_id, workspace_id=workspace_id)
        if target_version is None or str(target_version["workflow_id"]) != workflow_id:
            raise HTTPException(status_code=404, detail="Target workflow version not found")
    else:
        history = list_workflow_deployments(
            workflow_id,
            workspace_id=workspace_id,
            environment=payload.target_environment,
        )
        for item in history:
            if str(item.get("to_version_id")) != str(current_version["id"]):
                target_version = get_workflow_version(str(item["to_version_id"]), workspace_id=workspace_id)
                if target_version is not None:
                    break
        if target_version is None:
            fallback_versions = [
                version
                for version in list_workflow_versions(workflow_id, workspace_id=workspace_id)
                if str(version["id"]) != str(current_version["id"])
            ]
            if fallback_versions:
                target_version = fallback_versions[0]

    if target_version is None:
        raise HTTPException(status_code=409, detail=f"No rollback target is available for {payload.target_environment}")

    action = "stage" if payload.target_environment == "staging" else "publish"
    enforce_workflow_asset_access_or_raise(
        target_version["definition_json"],
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        target_version["definition_json"],
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action=action,
    )

    updated = set_workflow_environment_version(
        workflow_id,
        workspace_id=workspace_id,
        environment=payload.target_environment,
        version_id=str(target_version["id"]),
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to update workflow deployment target")
    update_workflow_version_status(
        str(target_version["id"]),
        workspace_id=workspace_id,
        status="staging" if payload.target_environment == "staging" else "published",
    )

    deployment = create_workflow_deployment(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        environment=payload.target_environment,
        action="rollback",
        from_version_id=str(current_version["id"]),
        to_version_id=str(target_version["id"]),
        notes=payload.notes or f"Rolled back {payload.target_environment}",
        metadata={"source": "rollback"},
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.rollback.{payload.target_environment}",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={
            "from_version_id": current_version["id"],
            "to_version_id": target_version["id"],
            "environment": payload.target_environment,
        },
    )
    return build_workflow_deployment_summary(deployment)


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
    workspace_id = str(session["workspace"]["id"])
    repaired_definition, _ = repair_definition_for_storage(
        payload.definition.model_dump(),
        workflow_trigger_type=payload.trigger_type,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=payload.trigger_type)
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=payload.trigger_type,
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id="new",
        workflow_trigger_type=payload.trigger_type,
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    payload = payload.model_copy(
        update={
            "definition": WorkflowDefinition.model_validate(
                repaired_definition
            )
        }
    )
    workflow = create_workflow(
        payload,
        workspace_id=workspace_id,
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


@app.delete(f"{settings.api_prefix}/workflows/{{workflow_id}}")
def delete_workflow_route(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    delete_workflow(workflow_id, workspace_id=workspace_id)
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.deleted",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"name": str(workflow.get("name"))},
    )
    return Response(status_code=204)


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
    enforce_workflow_governance_or_raise(
        workflow["definition_json"],
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=str(workflow["workspace_id"]),
        session=session,
        action="run",
    )
    _, queued_version_id = resolve_runtime_definition_for_environment(
        workflow,
        workspace_id=str(workflow["workspace_id"]),
        environment=payload.environment,
    )

    job = create_workflow_job(
        workspace_id=str(workflow["workspace_id"]),
        workflow_id=str(workflow["id"]),
        workflow_version_id=queued_version_id,
        initiated_by_user_id=str(session["user"]["id"]),
        environment=payload.environment,
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
    workspace_id = str(session["workspace"]["id"])
    repaired_definition, _ = repair_definition_for_storage(
        payload.definition.model_dump(),
        workflow_trigger_type=payload.trigger_type,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=payload.trigger_type)
    # Runtime contract validation is advisory during drafts — only enforce on publish
    if payload.status == "active":
        validate_runtime_node_contracts_or_raise(
            repaired_definition,
            workflow_trigger_type=payload.trigger_type,
            workspace_id=workspace_id,
        )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=payload.trigger_type,
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    payload = payload.model_copy(
        update={
            "definition": WorkflowDefinition.model_validate(
                repaired_definition
            )
        }
    )
    workflow = update_workflow(workflow_id, payload, workspace_id=workspace_id)
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
    validate_or_raise(
        template["definition"],
        workflow_trigger_type=str(template.get("trigger_type") or ""),
    )
    validate_runtime_node_contracts_or_raise(
        template["definition"],
        workflow_trigger_type=str(template.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        template["definition"],
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        template["definition"],
        workflow_id="template",
        workflow_trigger_type=str(template.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    normalized_template_definition, _ = repair_definition_for_storage(
        template["definition"],
        workflow_trigger_type=str(template.get("trigger_type") or ""),
    )

    workflow = create_workflow(
        WorkflowCreate(
            name=payload.name or f"{template['name']} Copy",
            trigger_type=template["trigger_type"],
            category=template["category"],
            status="draft",
            template_id=template["id"],
            definition=normalized_template_definition,
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
    workspace_id = str(session["workspace"]["id"])
    plan = build_assistant_plan(prompt, list_templates(workspace_id=workspace_id))
    template_definition = None
    template_id = None
    if plan["matched_templates"]:
        top_match = plan["matched_templates"][0]
        if int(top_match["score"]) >= 28:
            template = get_template(str(top_match["template_id"]), workspace_id=workspace_id)
            if template is not None:
                template_definition = template["definition"]
                template_id = str(template["id"])

    trigger_type = str(plan["trigger_type"])
    category = str(plan["category"])
    used_template_definition = template_definition
    used_template_id = template_id
    raw_definition = build_draft_definition(
        prompt,
        trigger_type=trigger_type,
        template_definition=used_template_definition,
    )
    normalized_definition, _ = repair_definition_for_storage(
        raw_definition,
        workflow_trigger_type=trigger_type,
        template_definition=used_template_definition,
    )
    validate_or_raise(normalized_definition, workflow_trigger_type=trigger_type)
    try:
        validate_runtime_node_contracts_or_raise(
            normalized_definition,
            workflow_trigger_type=trigger_type,
            workspace_id=workspace_id,
        )
    except HTTPException:
        if used_template_definition is None:
            raise
        used_template_definition = None
        used_template_id = None
        raw_definition = build_draft_definition(
            prompt,
            trigger_type=trigger_type,
            template_definition=None,
        )
        normalized_definition, _ = repair_definition_for_storage(
            raw_definition,
            workflow_trigger_type=trigger_type,
            template_definition=None,
        )
        validate_or_raise(normalized_definition, workflow_trigger_type=trigger_type)
        validate_runtime_node_contracts_or_raise(
            normalized_definition,
            workflow_trigger_type=trigger_type,
            workspace_id=workspace_id,
        )
    enforce_workflow_asset_access_or_raise(
        normalized_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        normalized_definition,
        workflow_id="generated",
        workflow_trigger_type=trigger_type,
        workspace_id=workspace_id,
        session=session,
        action="save",
    )

    workflow = create_workflow(
        WorkflowCreate(
            name=payload.name or str(plan["suggested_name"]),
            trigger_type=trigger_type,
            category=category,
            status="draft",
            template_id=used_template_id,
            definition=WorkflowDefinition.model_validate(normalized_definition),
        ),
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.generated",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"prompt_preview": prompt[:120], "template_id": used_template_id},
    )
    return WorkflowSummary.model_validate(workflow)


@app.get(f"{settings.api_prefix}/executions", response_model=list[ExecutionSummary])
def get_executions(
    limit: int = 200,
    offset: int = 0,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[ExecutionSummary]:
    return [
        normalize_execution(item)
        for item in list_executions(workspace_id=str(session["workspace"]["id"]), limit=min(limit, 500), offset=offset)
    ]


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/executions", response_model=list[ExecutionSummary])
def get_workflow_execution_list(
    workflow_id: str,
    status: str | None = None,
    limit: int = 50,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[ExecutionSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return [
        normalize_execution(item)
        for item in list_workflow_executions(
            workflow_id,
            workspace_id=workspace_id,
            limit=max(1, min(limit, 100)),
            status=status,
        )
    ]


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/observability", response_model=WorkflowObservabilityResponse)
def get_workflow_observability(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowObservabilityResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    executions = list_workflow_executions(workflow_id, workspace_id=workspace_id, limit=100)
    jobs = list_workflow_jobs(workspace_id, limit=100)
    return build_workflow_observability_response(workflow=workflow, executions=executions, jobs=jobs)


@app.get(f"{settings.api_prefix}/executions/{{execution_id}}", response_model=ExecutionSummary)
def get_execution_detail(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    execution = get_execution(execution_id, workspace_id=str(session["workspace"]["id"]))
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return normalize_execution(execution)


@app.delete(f"{settings.api_prefix}/executions/{{execution_id}}")
def delete_execution_route(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    delete_execution(execution_id, workspace_id=workspace_id)
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="execution.deleted",
        target_type="execution",
        target_id=execution_id,
        status="success",
    )
    return Response(status_code=204)


@app.get(f"{settings.api_prefix}/executions/{{execution_id}}/bundle", response_model=ExecutionInspectorResponse)
def get_execution_bundle(
    execution_id: str,
    request: Request,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionInspectorResponse:
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return build_execution_inspector_response(execution=execution, workspace_id=workspace_id, request=request)


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


# ---------------------------------------------------------------------------
# SSE: Execution live stream
# ---------------------------------------------------------------------------

import asyncio

@app.get(f"{settings.api_prefix}/executions/{{execution_id}}/stream")
async def stream_execution(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> StreamingResponse:
    """Stream execution status changes via Server-Sent Events.

    The client connects and receives periodic SSE messages with the current
    execution state. The stream ends when the execution reaches a terminal
    state (success, failed, cancelled) or after a maximum of 5 minutes.
    """
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")

    terminal_statuses = {"success", "failed", "cancelled"}

    async def event_generator():
        max_iterations = 150  # 5 minutes at 2-second intervals
        last_status = None
        last_event_count = 0

        for _ in range(max_iterations):
            ex = get_execution(execution_id, workspace_id=workspace_id)
            if ex is None:
                yield f"event: error\ndata: {json.dumps({'error': 'Execution not found'})}\n\n"
                return

            events = list_execution_events(execution_id=execution_id, workspace_id=workspace_id)
            current_event_count = len(events)
            current_status = ex.get("status", "unknown")

            # Only emit when something changed
            if current_status != last_status or current_event_count != last_event_count:
                payload = {
                    "id": execution_id,
                    "status": current_status,
                    "started_at": ex.get("started_at"),
                    "finished_at": ex.get("finished_at"),
                    "duration_ms": ex.get("duration_ms"),
                    "error_text": ex.get("error_text"),
                    "event_count": current_event_count,
                    "steps": ex.get("steps_json") if isinstance(ex.get("steps_json"), list) else [],
                }
                yield f"data: {json.dumps(payload)}\n\n"
                last_status = current_status
                last_event_count = current_event_count

            if current_status in terminal_statuses:
                yield f"event: done\ndata: {json.dumps({'status': current_status})}\n\n"
                return

            await asyncio.sleep(2)

        yield f"event: timeout\ndata: {json.dumps({'message': 'Stream timed out after 5 minutes'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get(f"{settings.api_prefix}/executions/{{execution_id}}/artifacts", response_model=ExecutionArtifactListResponse)
def get_execution_artifacts(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionArtifactListResponse:
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    artifacts = [
        normalize_execution_artifact(item)
        for item in list_execution_artifacts(execution_id=execution_id, workspace_id=workspace_id)
    ]
    return ExecutionArtifactListResponse(
        execution_id=execution_id,
        count=len(artifacts),
        artifacts=artifacts,
    )


@app.get(f"{settings.api_prefix}/executions/{{execution_id}}/artifacts/{{artifact_id}}", response_model=ExecutionArtifactSummary)
def get_execution_artifact_detail(
    execution_id: str,
    artifact_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionArtifactSummary:
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    artifact = get_execution_artifact(artifact_id, execution_id=execution_id, workspace_id=workspace_id)
    if artifact is None:
        raise HTTPException(status_code=404, detail="Execution artifact not found")
    return normalize_execution_artifact(artifact)


@app.get(f"{settings.api_prefix}/executions/{{execution_id}}/steps/{{step_id}}", response_model=ExecutionStepInspectorResponse)
def get_execution_step_detail(
    execution_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionStepInspectorResponse:
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    response = build_execution_step_inspector_response(execution=execution, step_id=step_id, workspace_id=workspace_id)
    if response.result is None and not response.events and not response.artifacts:
        raise HTTPException(status_code=404, detail="Execution step data not found")
    return response


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/steps/{{step_id}}/history", response_model=WorkflowStepHistoryResponse)
def get_workflow_step_history(
    workflow_id: str,
    step_id: str,
    limit: int = 50,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowStepHistoryResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    executions = list_workflow_executions(workflow_id, workspace_id=workspace_id, limit=max(1, min(limit, 100)))
    response = build_workflow_step_history_response(workflow=workflow, step_id=step_id, executions=executions)
    if response.total_matches == 0:
        workflow_steps = workflow.get("definition_json", {}).get("steps", [])
        if not any(str(step.get("id")) == step_id for step in workflow_steps):
            raise HTTPException(status_code=404, detail="Workflow step not found")
    return response


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
        environment=str(execution.get("environment") or "draft"),
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


@app.post(f"{settings.api_prefix}/executions/{{execution_id}}/replay", response_model=ExecutionReplayResponse)
def replay_execution(
    execution_id: str,
    payload: ExecutionReplayRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionReplayResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")

    workflow = get_workflow(str(execution["workflow_id"]), workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    runtime_definition = workflow["definition_json"]
    runtime_version_id: str | None = None
    replay_mode = payload.mode
    if replay_mode == "same_version" and execution.get("workflow_version_id"):
        version = get_workflow_version(str(execution["workflow_version_id"]), workspace_id=workspace_id)
        if version is not None:
            runtime_definition = version["definition_json"]
            runtime_version_id = str(version["id"])
    elif replay_mode == "latest_published":
        published_version = get_published_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
        if published_version is not None:
            runtime_definition = published_version["definition_json"]
            runtime_version_id = str(published_version["id"])

    replay_payload = dict(execution.get("payload_json") or {})
    replay_payload.update(payload.payload_override or {})
    replay_payload["_replay_of_execution_id"] = execution_id
    replay_payload["_trigger_type"] = "replay"
    replay_payload["_replay_mode"] = replay_mode

    if payload.queued:
        job = create_workflow_job(
            workspace_id=workspace_id,
            workflow_id=str(workflow["id"]),
            workflow_version_id=runtime_version_id,
            initiated_by_user_id=str(session["user"]["id"]),
            environment=("production" if replay_mode == "latest_published" else str(execution.get("environment") or "draft") if replay_mode == "same_version" else "draft"),
            trigger_type="replay",
            payload=replay_payload,
        )
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="execution.replay_queued",
            target_type="execution",
            target_id=execution_id,
            status="success",
            details={"job_id": job["id"], "mode": replay_mode, "workflow_id": workflow["id"]},
        )
        return ExecutionReplayResponse(
            mode=replay_mode,
            queued=True,
            job=WorkflowJobSummary.model_validate(job),
        )

    replayed_execution = _execute_workflow(
        workflow,
        replay_payload,
        trigger_type="replay",
        environment=("production" if replay_mode == "latest_published" else str(execution.get("environment") or "draft") if replay_mode == "same_version" else "draft"),
        initiated_by_user_id=str(session["user"]["id"]),
        runtime_definition_override=runtime_definition,
        runtime_version_id_override=runtime_version_id,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="execution.replayed",
        target_type="execution",
        target_id=execution_id,
        status="success",
        details={"mode": replay_mode, "replayed_execution_id": replayed_execution.id, "workflow_id": workflow["id"]},
    )
    return ExecutionReplayResponse(
        mode=replay_mode,
        queued=False,
        execution=replayed_execution,
    )


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
    enforce_workflow_governance_or_raise(
        workflow["definition_json"],
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=str(workflow["workspace_id"]),
        session=session,
        action="run",
    )

    return _execute_workflow(
        workflow,
        payload.payload,
        trigger_type=payload.payload.get("_trigger_type", "manual"),
        environment=payload.environment,
        initiated_by_user_id=str(session["user"]["id"]),
    )


class TestStepRequest(BaseModel):
    step: dict[str, Any]
    payload: dict[str, Any] = {}


class TestStepResponse(BaseModel):
    status: str
    output: dict[str, Any] | None = None
    error: str | None = None
    duration_ms: int


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/test-step", response_model=TestStepResponse)
def test_workflow_step(
    workflow_id: str,
    request_body: TestStepRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> TestStepResponse:
    """Test a single step in isolation with provided payload."""
    require_workspace_role(session, "owner", "admin", "builder")
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    step = request_body.step
    payload = request_body.payload

    single_def = {"steps": [step], "edges": []}
    try:
        outcome = run_workflow_definition(single_def, payload, use_pinned_data=True)
        results = outcome.get("step_results", [])
        if results:
            r = results[0]
            return TestStepResponse(
                status=r.get("status", "success"),
                output=r.get("output"),
                error=r["output"].get("error") if r.get("status") == "failed" else None,
                duration_ms=r.get("duration_ms", 0),
            )
        return TestStepResponse(status="success", output={}, duration_ms=0)
    except RuntimeError as exc:
        return TestStepResponse(status="failed", error=str(exc), duration_ms=0)
    except Exception as exc:
        return TestStepResponse(status="error", error=str(exc), duration_ms=0)


@app.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/trigger-details", response_model=TriggerDetailsResponse)
def get_workflow_trigger_details(
    workflow_id: str,
    request: Request,
    environment: str = "production",
    session: dict[str, Any] = Depends(get_session_context),
) -> TriggerDetailsResponse:
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    webhook_path = None
    webhook_url = None
    test_webhook_path = None
    test_webhook_url = None
    production_webhook_path = None
    production_webhook_url = None
    chat_path = None
    chat_url = None
    test_chat_path = None
    test_chat_url = None
    production_chat_path = None
    production_chat_url = None
    public_chat_stream_path = None
    public_chat_stream_url = None
    hosted_chat_path = None
    hosted_chat_url = None
    widget_script_path = None
    widget_script_url = None
    widget_embed_html = None
    schedule_hint = None

    workspace_settings = get_workspace_settings(str(session["workspace"]["id"]))
    resolved_version_id = None
    resolved_version_number = None
    exposure = "public"
    allow_public_webhooks = bool(workspace_settings.get("allow_public_webhooks", True))
    allow_public_chat_triggers = bool(workspace_settings.get("allow_public_chat_triggers", True))
    base_url = (
        workspace_settings.get("public_base_url")
        or settings.public_base_url
        or str(request.base_url).rstrip("/")
    )
    base_url = str(base_url).rstrip("/")
    runtime_definition_for_details = workflow["definition_json"]
    trigger_config = get_trigger_step_config(runtime_definition_for_details)

    if environment != "draft":
        resolved_version, _ = resolve_workflow_reference(
            workflow,
            workspace_id=str(session["workspace"]["id"]),
            ref=environment,
        )
        resolved_version_id = str(resolved_version["id"])
        resolved_version_number = int(resolved_version["version_number"])
        runtime_definition_for_details = resolved_version["definition_json"]
        trigger_config = get_trigger_step_config(runtime_definition_for_details)

    if workflow["trigger_type"] == "webhook":
        test_webhook_path = f"{settings.api_prefix}/triggers/webhook/{workflow_id}"
        test_webhook_url = f"{base_url}{test_webhook_path}"

        if allow_public_webhooks:
            production_webhook_path = f"{settings.api_prefix}/webhooks/{session['workspace']['id']}/{workflow_id}"
            production_webhook_url = f"{base_url}{production_webhook_path}"
            exposure = "public"
        else:
            exposure = "internal"

        if environment == "production" and production_webhook_url:
            webhook_path = production_webhook_path
            webhook_url = production_webhook_url
        else:
            webhook_path = test_webhook_path
            webhook_url = test_webhook_url
    elif workflow["trigger_type"] == "chat":
        test_chat_path = f"{settings.api_prefix}/triggers/chat/{workflow_id}"
        test_chat_url = f"{base_url}{test_chat_path}"

        if bool(trigger_config.get("chat_public")) and allow_public_chat_triggers:
            chat_urls = build_public_chat_urls(
                base_url=base_url,
                workspace_id=str(session["workspace"]["id"]),
                workflow_id=workflow_id,
            )
            production_chat_path = chat_urls["public_chat_path"]
            production_chat_url = chat_urls["public_chat_url"]
            public_chat_stream_path = chat_urls["public_chat_stream_path"]
            public_chat_stream_url = chat_urls["public_chat_stream_url"]
            hosted_chat_path = chat_urls["hosted_chat_path"]
            hosted_chat_url = chat_urls["hosted_chat_url"]
            widget_script_path = chat_urls["widget_script_path"]
            widget_script_url = chat_urls["widget_script_url"]
            widget_embed_html = chat_urls["widget_embed_html"]
            exposure = "public"
        else:
            exposure = "internal"

        if environment == "production" and production_chat_url:
            chat_path = production_chat_path
            chat_url = production_chat_url
        else:
            chat_path = test_chat_path
            chat_url = test_chat_url
    elif workflow["trigger_type"] == "schedule":
        if environment == "production":
            schedule_hint = "Call POST /api/system/run-scheduled from a free cron service to execute active scheduled workflows."
            exposure = "public"
        else:
            schedule_hint = f"{environment.title()} schedule preview only. Public scheduler dispatch runs production workflows."
            exposure = "internal"

    return TriggerDetailsResponse(
        workflow_id=workflow_id,
        trigger_type=workflow["trigger_type"],
        environment=environment,
        deployed_version_id=resolved_version_id,
        deployed_version_number=resolved_version_number,
        webhook_path=webhook_path,
        webhook_url=webhook_url,
        test_webhook_path=test_webhook_path,
        test_webhook_url=test_webhook_url,
        production_webhook_path=production_webhook_path,
        production_webhook_url=production_webhook_url,
        chat_path=chat_path,
        chat_url=chat_url,
        test_chat_path=test_chat_path,
        test_chat_url=test_chat_url,
        production_chat_path=production_chat_path,
        production_chat_url=production_chat_url,
        public_chat_stream_path=public_chat_stream_path,
        public_chat_stream_url=public_chat_stream_url,
        hosted_chat_path=hosted_chat_path,
        hosted_chat_url=hosted_chat_url,
        widget_script_path=widget_script_path,
        widget_script_url=widget_script_url,
        widget_embed_html=widget_embed_html,
        chat_public_enabled=bool(trigger_config.get("chat_public")),
        chat_mode=str(trigger_config.get("chat_mode") or "") or None,
        chat_authentication=str(trigger_config.get("chat_authentication") or "") or None,
        chat_response_mode=str(trigger_config.get("chat_response_mode") or "") or None,
        chat_load_previous_session=str(trigger_config.get("chat_load_previous_session") or "") or None,
        chat_title=str(trigger_config.get("chat_title") or "") or None,
        chat_subtitle=str(trigger_config.get("chat_subtitle") or "") or None,
        chat_input_placeholder=str(trigger_config.get("chat_input_placeholder") or "") or None,
        chat_initial_messages=normalize_chat_initial_messages(trigger_config.get("chat_initial_messages")),
        chat_allowed_origins=str(trigger_config.get("chat_allowed_origins") or "") or None,
        chat_require_button_click=bool(trigger_config.get("chat_require_button_click")),
        signature_header="x-flowholt-signature" if workflow["trigger_type"] == "webhook" else None,
        timestamp_header="x-flowholt-timestamp" if workflow["trigger_type"] == "webhook" else None,
        webhook_secret_configured=bool(workspace_settings.get("webhook_signing_secret")),
        schedule_hint=schedule_hint,
        exposure=exposure,
    )


@app.get(f"{settings.api_prefix}/chat/{{workspace_id}}/{{workflow_id}}", response_model=PublicChatTriggerInfoResponse)
async def get_public_chat_trigger_info(
    workspace_id: str,
    workflow_id: str,
    request: Request,
) -> PublicChatTriggerInfoResponse:
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if str(workflow.get("trigger_type") or "") != "chat":
        raise HTTPException(status_code=404, detail="Workflow is not a chat trigger")
    if workflow["status"] != "active":
        raise HTTPException(status_code=409, detail="Workflow is not active")

    runtime_definition, _ = resolve_runtime_definition_for_environment(
        workflow,
        environment="production",
        use_published_version=True,
    )
    trigger_config = get_trigger_step_config(runtime_definition)
    if not bool(trigger_config.get("chat_public")):
        raise HTTPException(status_code=403, detail="This chat trigger is not published for public access")

    workspace_settings = get_workspace_settings(workspace_id)
    if not bool(workspace_settings.get("allow_public_chat_triggers", True)):
        raise HTTPException(status_code=403, detail="Workspace policy blocks public chat triggers")

    base_url = build_public_base_url(request, workspace_id)
    chat_urls = build_public_chat_urls(
        base_url=base_url,
        workspace_id=workspace_id,
        workflow_id=workflow_id,
    )

    return PublicChatTriggerInfoResponse(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        mode=str(trigger_config.get("chat_mode") or "hosted"),
        authentication=str(trigger_config.get("chat_authentication") or "none"),
        response_mode=str(trigger_config.get("chat_response_mode") or "streaming"),
        load_previous_session=str(trigger_config.get("chat_load_previous_session") or "off"),
        title=str(trigger_config.get("chat_title") or "") or str(workflow.get("name") or "") or None,
        subtitle=str(trigger_config.get("chat_subtitle") or "") or None,
        input_placeholder=str(trigger_config.get("chat_input_placeholder") or "") or None,
        initial_messages=normalize_chat_initial_messages(trigger_config.get("chat_initial_messages")),
        require_button_click=bool(trigger_config.get("chat_require_button_click")),
        public_chat_url=chat_urls["public_chat_url"],
        public_chat_stream_url=chat_urls["public_chat_stream_url"],
        hosted_chat_url=chat_urls["hosted_chat_url"],
        widget_script_url=chat_urls["widget_script_url"],
        widget_embed_html=chat_urls["widget_embed_html"],
    )


def execute_chat_trigger_request(
    *,
    workflow: dict[str, Any],
    request: Request,
    payload: ChatTriggerRequest,
    public: bool,
) -> ChatTriggerResponse:
    if workflow["status"] != "active":
        raise HTTPException(status_code=409, detail="Workflow is not active")

    runtime_definition, _ = resolve_runtime_definition_for_environment(
        workflow,
        workspace_id=str(workflow["workspace_id"]),
        environment="production",
    )
    trigger_config = get_trigger_step_config(runtime_definition)
    if str(trigger_config.get("source") or workflow.get("trigger_type") or "") != "chat":
        raise HTTPException(status_code=400, detail="Workflow is not chat-triggered")

    enforce_chat_trigger_access(request, workflow=workflow, trigger_config=trigger_config, public=public)
    runtime_payload, session_id = build_chat_trigger_payload(payload, request, trigger_config=trigger_config)
    event_key = build_chat_event_key(request, str(workflow["id"]), session_id)
    existing_event = get_trigger_event_by_key(
        workspace_id=str(workflow["workspace_id"]),
        workflow_id=str(workflow["id"]),
        event_key=event_key,
    )
    if existing_event and existing_event.get("execution_id"):
        existing_execution = get_execution(str(existing_event["execution_id"]), workspace_id=str(workflow["workspace_id"]))
        if existing_execution is not None:
            message = extract_chat_response_text(existing_execution, runtime_definition)
            return ChatTriggerResponse(
                workflow_id=str(workflow["id"]),
                execution_id=str(existing_execution["id"]),
                session_id=session_id,
                mode=str(trigger_config.get("chat_mode") or "hosted"),
                response_mode=str(trigger_config.get("chat_response_mode") or "streaming"),
                message=message,
                messages=[ChatTriggerMessage(role="assistant", content=message)],
                title=str(trigger_config.get("chat_title") or "") or None,
                subtitle=str(trigger_config.get("chat_subtitle") or "") or None,
                input_placeholder=str(trigger_config.get("chat_input_placeholder") or "") or None,
            )
    if existing_event:
        raise HTTPException(status_code=409, detail="Chat event is already being processed")

    trigger_event = create_trigger_event(
        workspace_id=str(workflow["workspace_id"]),
        workflow_id=str(workflow["id"]),
        trigger_type="chat",
        event_key=event_key,
        payload=runtime_payload,
    )
    record_audit_event(
        session=None,
        workspace_id=str(workflow["workspace_id"]),
        action="workflow.chat.received",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"public": public, "session_id": session_id},
    )
    execution = _execute_workflow(
        workflow,
        runtime_payload,
        trigger_type="chat",
        environment="production",
        use_published_version=True,
    )
    attach_trigger_event_execution(str(trigger_event["id"]), execution_id=execution.id)
    stored_execution = get_execution(execution.id, workspace_id=str(workflow["workspace_id"]))
    if stored_execution is None:
        raise HTTPException(status_code=500, detail="Chat execution result could not be loaded")
    message = extract_chat_response_text(stored_execution, runtime_definition)
    return ChatTriggerResponse(
        workflow_id=str(workflow["id"]),
        execution_id=execution.id,
        session_id=session_id,
        mode=str(trigger_config.get("chat_mode") or "hosted"),
        response_mode=str(trigger_config.get("chat_response_mode") or "streaming"),
        message=message,
        messages=[ChatTriggerMessage(role="assistant", content=message)],
        title=str(trigger_config.get("chat_title") or "") or None,
        subtitle=str(trigger_config.get("chat_subtitle") or "") or None,
        input_placeholder=str(trigger_config.get("chat_input_placeholder") or "") or None,
    )


def iter_chat_response_stream_chunks(message: str, target_chunk_size: int = 28) -> list[str]:
    if not message:
        return []
    parts = re.findall(r"\S+\s*|\n+", message)
    chunks: list[str] = []
    current = ""
    for part in parts:
        if current and len(current) + len(part) > target_chunk_size:
            chunks.append(current)
            current = part
        else:
            current += part
    if current:
        chunks.append(current)
    return chunks


@app.post(f"{settings.api_prefix}/triggers/chat/{{workflow_id}}", response_model=ChatTriggerResponse)
async def trigger_workflow_chat(
    workflow_id: str,
    payload: ChatTriggerRequest,
    request: Request,
) -> ChatTriggerResponse:
    workflow = get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return execute_chat_trigger_request(
        workflow=workflow,
        request=request,
        payload=payload,
        public=False,
    )


@app.post(f"{settings.api_prefix}/chat/{{workspace_id}}/{{workflow_id}}/stream")
async def public_chat_trigger_stream(
    workspace_id: str,
    workflow_id: str,
    payload: ChatTriggerRequest,
    request: Request,
) -> StreamingResponse:
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    async def event_generator():
        try:
            response = await asyncio.to_thread(
                execute_chat_trigger_request,
                workflow=workflow,
                request=request,
                payload=payload,
                public=True,
            )
        except HTTPException as exc:
            message = exc.detail if isinstance(exc.detail, str) else "Chat trigger failed"
            yield _format_sse_event("error", {"message": message})
            return
        except Exception as exc:  # noqa: BLE001
            yield _format_sse_event("error", {"message": str(exc) or "Chat trigger failed"})
            return

        if response.response_mode != "streaming":
            yield _format_sse_event("done", response.model_dump())
            return

        for chunk in iter_chat_response_stream_chunks(response.message):
            if chunk:
                yield _format_sse_event("delta", {"delta": chunk})
                await asyncio.sleep(0.03)

        yield _format_sse_event("done", response.model_dump())

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post(f"{settings.api_prefix}/chat/{{workspace_id}}/{{workflow_id}}", response_model=ChatTriggerResponse)
async def public_chat_trigger(
    workspace_id: str,
    workflow_id: str,
    payload: ChatTriggerRequest,
    request: Request,
) -> ChatTriggerResponse:
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return execute_chat_trigger_request(
        workflow=workflow,
        request=request,
        payload=payload,
        public=True,
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

    execution = _execute_workflow(workflow, payload, trigger_type="webhook", environment="production", use_published_version=True)
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
    now = datetime.now(UTC)

    for workflow in scheduled_workflows:
        trigger_step = next(
            (step for step in workflow["definition_json"].get("steps", []) if step.get("type") == "trigger"),
            None,
        )
        if trigger_step is None:
            skipped_workflow_ids.append(workflow["id"])
            continue
        if not is_workflow_due(workflow, now):
            skipped_workflow_ids.append(workflow["id"])
            continue

        event_key = f"sched-{workflow['id']}-{now.strftime('%Y-%m-%dT%H:%M')}"
        existing_event = get_trigger_event_by_key(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            event_key=event_key,
        )
        if existing_event is not None:
            skipped_workflow_ids.append(workflow["id"])
            continue

        payload = {
            "_trigger_type": "schedule",
            "_schedule": trigger_step.get("config", {}),
            "_scheduled_at": now.isoformat(),
            "message": f"Scheduled run for {workflow['name']}",
        }
        trigger_event = create_trigger_event(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            trigger_type="schedule",
            event_key=event_key,
            payload=payload,
        )

        execution = _execute_workflow(workflow, payload, trigger_type="schedule", environment="production", use_published_version=True)
        attach_trigger_event_execution(str(trigger_event["id"]), execution_id=execution.id)
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

        runtime_definition = None
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
                environment=str(job.get("environment") or "draft"),
                initiated_by_user_id=str(job["initiated_by_user_id"]) if job.get("initiated_by_user_id") else None,
                runtime_definition_override=runtime_definition,
                runtime_version_id_override=runtime_version_id,
            )
            trigger_event_id = str(job["payload_json"].get("_trigger_event_id") or "") if isinstance(job.get("payload_json"), dict) else ""
            if trigger_event_id:
                attach_trigger_event_execution(trigger_event_id, execution_id=execution.id)
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
                    "trigger_event_id": trigger_event_id or None,
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


@app.post(f"{settings.api_prefix}/system/prune-execution-artifacts", response_model=ExecutionArtifactPruneResponse)
def post_prune_execution_artifacts(
    request: Request,
    payload: ExecutionArtifactPruneRequest | None = None,
) -> ExecutionArtifactPruneResponse:
    if settings.scheduler_secret:
        scheduler_secret = request.headers.get("x-flowholt-scheduler-secret", "")
        if scheduler_secret != settings.scheduler_secret:
            raise HTTPException(status_code=401, detail="Invalid scheduler secret")
    retention_days = (
        payload.retention_days
        if payload is not None and payload.retention_days is not None
        else settings.execution_artifact_retention_days
    )
    deleted_count = prune_execution_artifacts(retention_days=retention_days)
    return ExecutionArtifactPruneResponse(
        deleted_count=deleted_count,
        retention_days=retention_days,
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


# ─── Webhook Receiver Endpoints ───────────────────────────────────────────────

from .webhooks import receive_webhook, receive_workspace_webhook


@app.post(f"{settings.api_prefix}/webhooks/{{workspace_id}}/{{workflow_id}}")
async def webhook_receiver(
    workspace_id: str,
    workflow_id: str,
    request: Request,
) -> dict[str, Any]:
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    headers = {k.lower(): v for k, v in request.headers.items()}
    result = receive_webhook(
        workspace_id=workspace_id,
        workflow_id=workflow_id,
        payload=payload,
        headers=headers,
    )
    if result["status"] == "error":
        status_map = {
            "workflow_not_found": 404,
            "workflow_inactive": 409,
            "wrong_trigger": 400,
            "invalid_signature": 401,
        }
        raise HTTPException(
            status_code=status_map.get(result["code"], 400),
            detail=result["message"],
        )
    return result


@app.post(f"{settings.api_prefix}/webhooks/{{workspace_id}}")
async def workspace_webhook_receiver(
    workspace_id: str,
    request: Request,
) -> dict[str, Any]:
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    headers = {k.lower(): v for k, v in request.headers.items()}
    return receive_workspace_webhook(
        workspace_id=workspace_id,
        payload=payload,
        headers=headers,
    )


def build_workflow_name(prompt: str) -> str:
    cleaned = " ".join(prompt.split())
    words = cleaned.split(" ")
    name = " ".join(words[:5]).strip()
    return name[:60] if name else "Generated Workflow"


def resolve_runtime_definition_for_environment(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    environment: str,
    runtime_definition_override: dict[str, Any] | None = None,
    runtime_version_id_override: str | None = None,
) -> tuple[dict[str, Any], str | None]:
    if runtime_definition_override is not None:
        return runtime_definition_override, runtime_version_id_override

    if environment == "production":
        published_version = get_published_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
        if published_version is not None:
            return published_version["definition_json"], str(published_version["id"])
        raise HTTPException(status_code=409, detail="No production version exists for this workflow")

    if environment == "staging":
        staging_version = get_staging_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
        if staging_version is None:
            raise HTTPException(status_code=409, detail="No staged version exists for this workflow")
        return staging_version["definition_json"], str(staging_version["id"])

    return workflow["definition_json"], None


def _workflow_settings_from_definition(
    definition: dict[str, Any],
    *,
    workspace_settings: dict[str, Any] | None = None,
) -> WorkflowSettings:
    raw_settings = (definition.get("settings") or {}) if isinstance(definition, dict) else {}
    return WorkflowSettings.model_validate({**_workspace_execution_defaults(workspace_settings), **raw_settings})


def _build_error_workflow_payload(
    *,
    workflow: dict[str, Any],
    execution_id: str,
    trigger_type: str,
    environment: str,
    workflow_version_id: str | None,
    original_payload: dict[str, Any],
    error_text: str | None,
    duration_ms: int,
    step_results: list[dict[str, Any]],
) -> dict[str, Any]:
    last_step = step_results[-1] if step_results else None
    return {
        "execution": {
            "id": execution_id,
            "workflow_id": str(workflow["id"]),
            "workflow_name": str(workflow["name"]),
            "workflow_version_id": workflow_version_id,
            "environment": environment,
            "mode": trigger_type,
            "status": "failed",
            "duration_ms": duration_ms,
            "last_node_executed": str((last_step or {}).get("name") or "") or None,
            "error": {
                "message": error_text or "Workflow execution failed.",
                "stack": error_text or "Workflow execution failed.",
            },
        },
        "workflow": {
            "id": str(workflow["id"]),
            "name": str(workflow["name"]),
        },
        "trigger": {
            "mode": trigger_type,
            "payload": original_payload,
        },
        "original_payload": original_payload,
    }


def _dispatch_error_workflow(
    *,
    source_workflow: dict[str, Any],
    error_workflow_id: str,
    original_payload: dict[str, Any],
    execution_id: str,
    trigger_type: str,
    environment: str,
    workflow_version_id: str | None,
    error_text: str | None,
    duration_ms: int,
    step_results: list[dict[str, Any]],
    persist_progress: bool,
) -> str | None:
    if not error_workflow_id or trigger_type == "error" or error_workflow_id == str(source_workflow["id"]):
        return None

    workspace_id = str(source_workflow["workspace_id"])
    error_workflow = get_workflow(error_workflow_id, workspace_id=workspace_id)
    if error_workflow is None:
        record_execution_event(
            execution_id=execution_id,
            workflow_id=str(source_workflow["id"]),
            workspace_id=workspace_id,
            event_type="execution.error_handler.failed",
            status="failed",
            message="Configured error workflow could not be found.",
            data={"error_workflow_id": error_workflow_id},
            persist_progress=persist_progress,
        )
        create_audit_event(
            workspace_id=workspace_id,
            actor_user_id=None,
            actor_email=None,
            action="workflow.error_handler.dispatch_failed",
            target_type="workflow",
            target_id=str(source_workflow["id"]),
            status="failed",
            details={"execution_id": execution_id, "error_workflow_id": error_workflow_id, "reason": "not_found"},
        )
        return None

    error_payload = _build_error_workflow_payload(
        workflow=source_workflow,
        execution_id=execution_id,
        trigger_type=trigger_type,
        environment=environment,
        workflow_version_id=workflow_version_id,
        original_payload=original_payload,
        error_text=error_text,
        duration_ms=duration_ms,
        step_results=step_results,
    )
    dispatch_environment = environment if environment in {"draft", "staging", "production"} else "draft"

    try:
        try:
            handled_execution = _execute_workflow(
                error_workflow,
                error_payload,
                trigger_type="error",
                environment=dispatch_environment,
                initiated_by_user_id=None,
                dispatch_error_workflow=False,
            )
        except HTTPException as exc:
            if dispatch_environment != "draft" and exc.status_code == 409:
                handled_execution = _execute_workflow(
                    error_workflow,
                    error_payload,
                    trigger_type="error",
                    environment="draft",
                    initiated_by_user_id=None,
                    dispatch_error_workflow=False,
                )
            else:
                raise
    except Exception as exc:  # noqa: BLE001
        record_execution_event(
            execution_id=execution_id,
            workflow_id=str(source_workflow["id"]),
            workspace_id=workspace_id,
            event_type="execution.error_handler.failed",
            status="failed",
            message="Configured error workflow failed to execute.",
            data={"error_workflow_id": error_workflow_id, "error": str(exc)},
            persist_progress=persist_progress,
        )
        create_audit_event(
            workspace_id=workspace_id,
            actor_user_id=None,
            actor_email=None,
            action="workflow.error_handler.dispatch_failed",
            target_type="workflow",
            target_id=str(source_workflow["id"]),
            status="failed",
            details={"execution_id": execution_id, "error_workflow_id": error_workflow_id, "reason": str(exc)},
        )
        return None

    record_execution_event(
        execution_id=execution_id,
        workflow_id=str(source_workflow["id"]),
        workspace_id=workspace_id,
        event_type="execution.error_handler.dispatched",
        status="success",
        message="Configured error workflow executed successfully.",
        data={"error_workflow_id": error_workflow_id, "handler_execution_id": handled_execution.id},
        persist_progress=persist_progress,
    )
    create_audit_event(
        workspace_id=workspace_id,
        actor_user_id=None,
        actor_email=None,
        action="workflow.error_handler.dispatched",
        target_type="workflow",
        target_id=str(source_workflow["id"]),
        status="success",
        details={
            "execution_id": execution_id,
            "error_workflow_id": error_workflow_id,
            "handler_execution_id": handled_execution.id,
        },
    )
    return handled_execution.id


def _execute_workflow(
    workflow: dict[str, object],
    payload: dict[str, object],
    *,
    trigger_type: str,
    environment: str = "draft",
    initiated_by_user_id: str | None = None,
    use_published_version: bool = False,
    runtime_definition_override: dict[str, Any] | None = None,
    runtime_version_id_override: str | None = None,
    dispatch_error_workflow: bool = True,
) -> ExecutionSummary:
    effective_environment = "production" if use_published_version else environment
    runtime_definition, runtime_version_id = resolve_runtime_definition_for_environment(
        workflow,
        workspace_id=str(workflow["workspace_id"]),
        environment=effective_environment,
        runtime_definition_override=runtime_definition_override,
        runtime_version_id_override=runtime_version_id_override,
    )
    workspace_settings = get_workspace_settings(str(workflow["workspace_id"]))
    workflow_settings = _workflow_settings_from_definition(runtime_definition, workspace_settings=workspace_settings)
    workflow_timeout_seconds = int(workflow_settings.timeout_seconds or 0)
    persist_execution_progress = _should_persist_execution_progress(workflow_settings=workflow_settings)
    redact_execution_payloads = bool(workspace_settings.get("redact_execution_payloads", False))
    _enforce_workspace_concurrency_limit(
        workspace_id=str(workflow["workspace_id"]),
        workspace_settings=workspace_settings,
    )

    execution = create_execution_record(
        workflow,
        {"redacted": True} if redact_execution_payloads else payload,
        trigger_type=trigger_type,
        initiated_by_user_id=initiated_by_user_id,
        workflow_version_id=runtime_version_id,
        environment=effective_environment,
    )
    record_execution_event(
        execution_id=str(execution["id"]),
        workflow_id=str(workflow["id"]),
        workspace_id=str(workflow["workspace_id"]),
        event_type="execution.started",
        status="running",
        message=f"Execution started via {trigger_type}",
        data={"trigger_type": trigger_type, "workflow_version_id": runtime_version_id, "environment": effective_environment},
        persist_progress=persist_execution_progress,
    )
    started = time.perf_counter()
    vault_context = build_vault_runtime_context(str(workflow["workspace_id"]), environment=effective_environment)

    try:
        outcome = run_workflow_definition(
            runtime_definition,
            payload,
            vault_context=vault_context,
            use_pinned_data=effective_environment != "production" and trigger_type == "manual",
            workflow_timeout_seconds=workflow_timeout_seconds if workflow_timeout_seconds > 0 else None,
        )
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
        steps=_redact_execution_steps(step_results) if redact_execution_payloads else step_results,
        result={"redacted": True} if redact_execution_payloads and result is not None else result,
        error_text=error_text,
    )
    pause_data_for_artifacts = outcome["pause"] if status == "paused" else None
    record_execution_artifacts(
        execution_id=str(execution["id"]),
        workflow_id=str(workflow["id"]),
        workspace_id=str(workflow["workspace_id"]),
        trigger_type=trigger_type,
        payload=dict(payload),
        step_results=step_results,
        result=result,
        error_text=error_text,
        pause_data=pause_data_for_artifacts,
        persist_progress=persist_execution_progress,
        redact_payloads=redact_execution_payloads,
    )
    _deliver_execution_alerts(
        workflow=workflow,
        execution_id=str(execution["id"]),
        workspace_settings=workspace_settings,
        status=status,
        trigger_type=trigger_type,
        environment=effective_environment,
        duration_ms=duration_ms,
        initiated_by_user_id=initiated_by_user_id,
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
                persist_progress=persist_execution_progress,
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
                "environment": effective_environment,
            },
            persist_progress=persist_execution_progress,
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
                "environment": effective_environment,
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
            step_id=str(step.get("step_id") or "") or None,
            step_name=str(step["name"]),
            status=str(step["status"]),
            message=f"Step {step['name']} finished with {step['status']}",
            data={
                "duration_ms": int(step.get("duration_ms") or 0),
                "output": output,
            },
            persist_progress=persist_execution_progress,
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
            "environment": effective_environment,
        },
        persist_progress=persist_execution_progress,
    )
    error_handler_execution_id = None
    if status == "failed" and dispatch_error_workflow and workflow_settings.error_workflow_id:
        error_handler_execution_id = _dispatch_error_workflow(
            source_workflow=workflow,
            error_workflow_id=str(workflow_settings.error_workflow_id),
            original_payload=dict(payload),
            execution_id=str(execution["id"]),
            trigger_type=trigger_type,
            environment=effective_environment,
            workflow_version_id=runtime_version_id,
            error_text=error_text,
            duration_ms=duration_ms,
            step_results=step_results,
            persist_progress=persist_execution_progress,
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
            "environment": effective_environment,
            "duration_ms": duration_ms,
            "step_count": len(step_results),
            "error": error_text,
            "error_handler_execution_id": error_handler_execution_id,
        },
    )
    _apply_execution_retention(
        execution_id=str(execution["id"]),
        workspace_id=str(workflow["workspace_id"]),
        workflow_settings=workflow_settings,
        trigger_type=trigger_type,
        status=status,
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

    execution_environment = str(execution.get("environment") or "draft")
    runtime_definition = workflow["definition_json"]
    runtime_version_id = str(pause["workflow_version_id"]) if pause.get("workflow_version_id") else None
    if runtime_version_id:
        version = get_workflow_version(runtime_version_id, workspace_id=str(pause["workspace_id"]))
        if version is not None:
            runtime_definition = version["definition_json"]
    workspace_settings = get_workspace_settings(str(workflow["workspace_id"]))
    workflow_settings = _workflow_settings_from_definition(runtime_definition, workspace_settings=workspace_settings)
    persist_execution_progress = _should_persist_execution_progress(workflow_settings=workflow_settings)
    redact_execution_payloads = bool(workspace_settings.get("redact_execution_payloads", False))
    _enforce_workspace_concurrency_limit(
        workspace_id=str(workflow["workspace_id"]),
        workspace_settings=workspace_settings,
    )
    resume_execution_record(str(execution["id"]))

    started = time.perf_counter()
    vault_context = build_vault_runtime_context(str(workflow["workspace_id"]), environment=execution_environment)
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
        data={"pause_id": str(pause["id"]), "decision": resume_decision, "payload": resume_payload, "environment": execution_environment},
        persist_progress=persist_execution_progress,
    )
    try:
        remaining_timeout_seconds = int(workflow_settings.timeout_seconds or 0)
        if remaining_timeout_seconds > 0:
            remaining_timeout_seconds -= int(execution.get("duration_ms") or 0) // 1000
            if remaining_timeout_seconds <= 0:
                raise RuntimeError(
                    f"Workflow exceeded configured timeout of {workflow_settings.timeout_seconds} seconds."
                )
        outcome = run_workflow_definition(
            runtime_definition,
            execution["payload_json"],
            vault_context=vault_context,
            state=dict(pause.get("state_json") or {}),
            resume_payload=resume_payload,
            resume_decision=resume_decision,
            workflow_timeout_seconds=remaining_timeout_seconds if remaining_timeout_seconds > 0 else None,
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
        steps=_redact_execution_steps(step_results) if redact_execution_payloads else step_results,
        result={"redacted": True} if redact_execution_payloads and result is not None else result,
        error_text=error_text,
    )
    record_execution_artifacts(
        execution_id=str(execution["id"]),
        workflow_id=str(workflow["id"]),
        workspace_id=str(workflow["workspace_id"]),
        trigger_type=f"resume:{pause['wait_type']}",
        payload={
            "pause_id": str(pause["id"]),
            "resume_payload": resume_payload,
            "resume_decision": resume_decision,
        },
        step_results=step_results[previous_step_count:],
        result=result,
        error_text=error_text,
        pause_data=outcome["pause"] if status == "paused" else None,
        persist_progress=persist_execution_progress,
        redact_payloads=redact_execution_payloads,
    )
    _deliver_execution_alerts(
        workflow=workflow,
        execution_id=str(execution["id"]),
        workspace_settings=workspace_settings,
        status=status,
        trigger_type=f"resume:{pause['wait_type']}",
        environment=execution_environment,
        duration_ms=duration_ms,
        initiated_by_user_id=str(execution.get("initiated_by_user_id") or "") or None,
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
                persist_progress=persist_execution_progress,
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
                "environment": execution_environment,
            },
            persist_progress=persist_execution_progress,
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
            persist_progress=persist_execution_progress,
        )
    for step in step_results[previous_step_count:]:
        record_execution_event(
            execution_id=str(execution["id"]),
            workflow_id=str(workflow["id"]),
            workspace_id=str(workflow["workspace_id"]),
            event_type="step.completed",
            step_id=str(step.get("step_id") or "") or None,
            step_name=str(step["name"]),
            status=str(step["status"]),
            message=f"Step {step['name']} finished with {step['status']}",
            data={
                "duration_ms": int(step.get("duration_ms") or 0),
                "output": dict(step.get("output") or {}),
            },
            persist_progress=persist_execution_progress,
        )
    record_execution_event(
        execution_id=str(execution["id"]),
        workflow_id=str(workflow["id"]),
        workspace_id=str(workflow["workspace_id"]),
        event_type="execution.finished",
        status=status,
        message=f"Execution finished with status {status}",
        data={"duration_ms": duration_ms, "error": error_text, "environment": execution_environment},
        persist_progress=persist_execution_progress,
    )
    error_handler_execution_id = None
    if status == "failed" and workflow_settings.error_workflow_id:
        error_handler_execution_id = _dispatch_error_workflow(
            source_workflow=workflow,
            error_workflow_id=str(workflow_settings.error_workflow_id),
            original_payload={
                **dict(execution.get("payload_json") or {}),
                "_resume_payload": resume_payload,
                "_resume_decision": resume_decision,
            },
            execution_id=str(execution["id"]),
            trigger_type=f"resume:{pause['wait_type']}",
            environment=execution_environment,
            workflow_version_id=runtime_version_id,
            error_text=error_text,
            duration_ms=duration_ms,
            step_results=step_results,
            persist_progress=persist_execution_progress,
        )
    record_audit_event(
        session=session,
        workspace_id=str(workflow["workspace_id"]),
        action="workflow.execution.resumed",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success" if status != "failed" else "failed",
        details={
            "execution_id": str(execution["id"]),
            "pause_id": str(pause["id"]),
            "decision": resume_decision,
            "error_handler_execution_id": error_handler_execution_id,
        },
    )
    _apply_execution_retention(
        execution_id=str(execution["id"]),
        workspace_id=str(workflow["workspace_id"]),
        workflow_settings=workflow_settings,
        trigger_type=str(execution.get("trigger_type") or "manual"),
        status=status,
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
    workflow = get_workflow(str(pause["workflow_id"]), workspace_id=str(pause["workspace_id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    runtime_definition = workflow["definition_json"]
    if pause.get("workflow_version_id"):
        version = get_workflow_version(str(pause["workflow_version_id"]), workspace_id=str(pause["workspace_id"]))
        if version is not None:
            runtime_definition = version["definition_json"]
    workspace_settings = get_workspace_settings(str(workflow["workspace_id"]))
    workflow_settings = _workflow_settings_from_definition(runtime_definition, workspace_settings=workspace_settings)
    persist_execution_progress = _should_persist_execution_progress(workflow_settings=workflow_settings)
    stored = finish_execution_record(
        str(execution["id"]),
        status="cancelled",
        duration_ms=int(execution.get("duration_ms") or 0),
        steps=execution.get("steps_json") or [],
        result=None,
        error_text="Execution cancelled while paused.",
    )
    update_execution_pause_status(str(pause["id"]), status="cancelled")
    create_execution_artifact(
        workspace_id=str(pause["workspace_id"]),
        workflow_id=str(pause["workflow_id"]),
        execution_id=str(execution["id"]),
        step_id=str(pause["step_id"]),
        step_name=str(pause["step_name"]),
        artifact_type="cancel_state",
        direction="state",
        data={
            "pause_id": str(pause["id"]),
            "wait_type": str(pause["wait_type"]),
            "status": "cancelled",
        },
    ) if persist_execution_progress else None
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
            persist_progress=persist_execution_progress,
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
        persist_progress=persist_execution_progress,
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
    _apply_execution_retention(
        execution_id=str(execution["id"]),
        workspace_id=str(pause["workspace_id"]),
        workflow_settings=workflow_settings,
        trigger_type=str(execution.get("trigger_type") or "manual"),
        status="cancelled",
    )
    stored["steps"] = stored.pop("steps_json")
    return ExecutionSummary.model_validate(stored)
