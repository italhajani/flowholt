"""
Shared helper functions extracted from main.py.

This module contains business-logic helpers used by multiple router modules.
It has NO dependency on the FastAPI app instance, avoiding circular imports.
"""
from __future__ import annotations

import base64
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

from fastapi import HTTPException, Request

from .config import get_settings
from .db import get_db
from .deps import (
    _enforce_workspace_concurrency_limit,
    get_optional_session_context,
    get_role_rank,
    get_workspace_binding_context,
    record_audit_event,
    session_meets_min_role,
)
from .executor import run_workflow_definition
from .models import (
    AuditEventSummary,
    AssistantCapabilitiesResponse,
    AssistantTemplateMatch,
    AssistantTemplateMatchResponse,
    ChatAttachmentItem,
    ChatMessageItem,
    ChatTriggerRequest,
    ExecutionArtifactSummary,
    ExecutionEventSummary,
    ExecutionInspectorResponse,
    ExecutionPauseSummary,
    ExecutionStepInspectorResponse,
    ExecutionStepResult,
    ExecutionSummary,
    HumanTaskSummary,
    NodeConfigValidationResponse,
    StudioStepAssetBinding,
    StudioStepAccessResponse,
    StudioWorkflowBundleResponse,
    WorkflowCompareChange,
    WorkflowCompareResponse,
    WorkflowCompareStats,
    WorkflowDefinition,
    WorkflowDeploymentDetail,
    WorkflowDeploymentSummary,
    WorkflowDeploymentReviewSummary,
    WorkflowDeploymentReviewDetail,
    WorkflowDetail,
    WorkflowEdge,
    WorkflowEnvironmentsResponse,
    WorkflowEnvironmentVersion,
    WorkflowObservabilityResponse,
    WorkflowPolicyResponse,
    WorkflowRepairSummary,
    WorkflowSettings,
    WorkflowStep,
    WorkflowStepHistoryEntry,
    WorkflowStepHistoryResponse,
    WorkflowValidationResponse,
    StudioStepEditorEntry,
)
from .node_registry import (
    get_node_definition,
    get_node_error_settings_fields,
    list_node_definitions,
    normalize_workflow_definition,
    repair_workflow_definition,
    validate_workflow_definition,
)
from .integration_registry import resolve_dynamic_operation_fields
from .studio_nodes import build_node_catalog, build_node_editor_response
from .studio_resources import build_vault_asset_health
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
    build_vault_runtime_context,
    cancel_human_task,
    complete_human_task,
    create_audit_event,
    create_execution_artifact,
    create_execution_event,
    create_execution_pause,
    create_human_task,
    create_user_notification,
    create_execution_record,
    delete_execution_storage,
    finish_execution_record,
    get_execution,
    get_execution_artifact,
    get_execution_pause,
    get_execution_pause_by_token,
    get_human_task_by_pause_id,
    get_published_workflow_version,
    get_staging_workflow_version,
    get_template,
    get_user_by_email,
    get_vault_asset,
    get_vault_asset_access,
    get_vault_asset_by_name,
    get_workflow,
    get_workflow_deployment,
    get_workflow_deployment_review,
    get_workflow_version,
    get_workspace_member_by_role,
    get_workspace_settings,
    list_audit_events,
    list_execution_artifacts,
    list_execution_events,
    list_executions,
    list_human_tasks,
    list_templates,
    list_vault_assets,
    list_workflow_deployments,
    list_workflow_executions,
    list_workflow_versions,
    list_workflow_jobs,
    list_workspace_members,
    resume_execution_record,
    set_workflow_environment_version,
    touch_workflow_run,
    update_execution_pause_status,
    update_workflow_version_status,
)
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

settings = get_settings()
_logger = logging.getLogger("flowholt.helpers")

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

