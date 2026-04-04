from __future__ import annotations

import re
import secrets
import time
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .assistant_tools import build_assistant_plan, build_assistant_workflow_name, build_draft_definition
from .auth import create_session_token, get_supabase_auth_mode, verify_session_token, verify_supabase_token
from .config import get_settings
from .db import get_database_backend, init_db
from .executor import run_workflow_definition
from .models import (
    AuthDevLoginRequest,
    AuthPreflightResponse,
    AuthSessionTokenResponse,
    AssistantCapabilitiesResponse,
    AssistantDraftWorkflowRequest,
    AssistantDraftWorkflowResponse,
    AssistantNameRequest,
    AssistantNameResponse,
    AssistantPlanRequest,
    AssistantPlanResponse,
    AssistantSuggestedNode,
    AssistantTemplateMatch,
    AssistantTemplateMatchResponse,
    AuditEventSummary,
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
    NodeCatalogResponse,
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
    WorkflowPublishRequest,
    WorkflowQueueRunRequest,
    WorkflowRepairResponse,
    WorkflowRepairSummary,
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
    create_workflow,
    create_workflow_job,
    create_workflow_deployment,
    create_workflow_deployment_review,
    create_workflow_version,
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
    list_human_tasks,
    list_templates,
    list_user_workspaces,
    list_vault_assets,
    list_workflow_executions,
    list_workflow_versions,
    list_workflow_jobs,
    list_workflow_deployments,
    list_workflow_deployment_reviews,
    list_workflows_by_trigger,
    list_workflows,
    list_workspace_members,
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
) -> None:
    create_execution_artifact(
        workspace_id=workspace_id,
        workflow_id=workflow_id,
        execution_id=execution_id,
        artifact_type="trigger_payload",
        direction="input",
        data={"trigger_type": trigger_type, "payload": payload},
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
                "output": step.get("output"),
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
            data=pause_data,
        )
    if result is not None:
        create_execution_artifact(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            execution_id=execution_id,
            artifact_type="execution_result",
            direction="summary",
            data=result,
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


def get_step_asset_references(step: dict[str, Any]) -> list[tuple[str, str]]:
    config = dict(step.get("config") or {})
    references: list[tuple[str, str]] = []
    mapping = {
        "connection_name": "connection",
        "credential_name": "credential",
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


def get_step_asset_bindings(step: dict[str, Any], *, workspace_id: str, session: dict[str, Any]) -> list[StudioStepAssetBinding]:
    bindings: list[StudioStepAssetBinding] = []
    seen: set[tuple[str, str]] = set()
    for kind, name in get_step_asset_references(step):
        if (kind, name) in seen:
            continue
        seen.add((kind, name))
        asset = get_vault_asset_by_name(kind=kind, name=name, workspace_id=workspace_id)
        if asset is None:
            continue
        bindings.append(
            StudioStepAssetBinding(
                kind=kind,
                name=name,
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
        for kind, name in get_step_asset_references(step):
            if (kind, name) in seen:
                continue
            seen.add((kind, name))
            asset = get_vault_asset_by_name(kind=kind, name=name, workspace_id=workspace_id)
            if asset is None:
                continue
            if not can_edit_vault_asset(asset, session):
                blocked_assets.append(
                    {
                        "kind": kind,
                        "name": name,
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
        for kind, name in get_step_asset_references(step):
            key = (kind, name)
            if key in seen:
                continue
            seen.add(key)
            asset = get_vault_asset_by_name(kind=kind, name=name, workspace_id=workspace_id)
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
    public_webhook_requested = workflow_trigger_type == "webhook"
    warnings: list[str] = []
    if uses_production_assets:
        warnings.append("This workflow uses one or more production-scoped Vault assets.")
    if public_webhook_requested and not settings_payload.get("allow_public_webhooks", True):
        warnings.append("Workspace policy currently blocks publishing public webhook workflows.")
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
        and (not public_webhook_requested or bool(settings_payload.get("allow_public_webhooks", True)))
        and (not uses_production_assets or session_meets_min_role(session, str(settings_payload.get("production_asset_min_role") or "admin"))),
        uses_production_assets=uses_production_assets,
        public_webhook_requested=public_webhook_requested,
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


def validate_runtime_node_contracts_or_raise(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None,
    workspace_id: str,
) -> None:
    binding_context = get_workspace_binding_context(workspace_id)
    node_issues: list[dict[str, Any]] = []

    for step in definition.get("steps", []):
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
        for issue in result.get("issues", []):
            node_issues.append(
                {
                    **issue,
                    "step_id": str(step.get("id") or ""),
                    "step_name": str(step.get("name") or ""),
                    "node_type": str(step.get("type") or ""),
                }
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
        require_staging_before_production=bool(item.get("require_staging_before_production", False)),
        require_staging_approval=bool(item.get("require_staging_approval", False)),
        require_production_approval=bool(item.get("require_production_approval", False)),
        deployment_approval_min_role=str(item.get("deployment_approval_min_role") or "admin"),
        allow_self_approval=bool(item.get("allow_self_approval", False)),
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
        staging_min_role=payload.staging_min_role,
        publish_min_role=payload.publish_min_role,
        run_min_role=payload.run_min_role,
        production_asset_min_role=payload.production_asset_min_role,
        allow_public_webhooks=payload.allow_public_webhooks,
        require_staging_before_production=payload.require_staging_before_production,
        require_staging_approval=payload.require_staging_approval,
        require_production_approval=payload.require_production_approval,
        deployment_approval_min_role=payload.deployment_approval_min_role,
        allow_self_approval=payload.allow_self_approval,
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
            "staging_min_role": payload.staging_min_role,
            "publish_min_role": payload.publish_min_role,
            "run_min_role": payload.run_min_role,
            "production_asset_min_role": payload.production_asset_min_role,
            "allow_public_webhooks": payload.allow_public_webhooks,
            "require_staging_before_production": payload.require_staging_before_production,
            "require_staging_approval": payload.require_staging_approval,
            "require_production_approval": payload.require_production_approval,
            "deployment_approval_min_role": payload.deployment_approval_min_role,
            "allow_self_approval": payload.allow_self_approval,
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
        require_staging_before_production=bool(item.get("require_staging_before_production", False)),
        require_staging_approval=bool(item.get("require_staging_approval", False)),
        require_production_approval=bool(item.get("require_production_approval", False)),
        deployment_approval_min_role=str(item.get("deployment_approval_min_role") or "admin"),
        allow_self_approval=bool(item.get("allow_self_approval", False)),
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


@app.get(f"{settings.api_prefix}/assistant/capabilities", response_model=AssistantCapabilitiesResponse)
def get_assistant_capabilities(session: dict[str, Any] = Depends(get_session_context)) -> AssistantCapabilitiesResponse:
    _ = session
    return AssistantCapabilitiesResponse(
        tools=[
            "name_workflow",
            "match_templates",
            "plan_workflow",
            "draft_workflow",
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
    next_steps: list[str] = []
    if not health["healthy"]:
        next_steps.append("Open this asset in Vault and fill the missing required fields.")
    if str(asset.get("kind")) == "connection":
        next_steps.append("Use this verified connection in studio node configuration.")
    elif str(asset.get("kind")) == "credential":
        next_steps.append("Bind this credential to the matching provider node in studio.")
    else:
        next_steps.append("Reference this variable from a node config or shared runtime binding.")

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
        verified=bool(health["healthy"]),
        mode="static",
        checks=health["checks"],
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
    if payload.target_environment == "production" and not bool(settings_payload.get("allow_public_webhooks", True)) and str(workflow.get("trigger_type") or "") == "webhook":
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
        config=dict(step.get("config") or {}),
        trigger_type=str(workflow.get("trigger_type") or ""),
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        step_name=str(step.get("name") or ""),
    )
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
def get_executions(session: dict[str, Any] = Depends(get_session_context)) -> list[ExecutionSummary]:
    return [
        normalize_execution(item)
        for item in list_executions(workspace_id=str(session["workspace"]["id"]))
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
    schedule_hint = None

    workspace_settings = get_workspace_settings(str(session["workspace"]["id"]))
    resolved_version_id = None
    resolved_version_number = None
    exposure = "public"

    if environment != "draft":
        resolved_version, _ = resolve_workflow_reference(
            workflow,
            workspace_id=str(session["workspace"]["id"]),
            ref=environment,
        )
        resolved_version_id = str(resolved_version["id"])
        resolved_version_number = int(resolved_version["version_number"])

    if workflow["trigger_type"] == "webhook":
        if environment == "production":
            webhook_path = f"{settings.api_prefix}/triggers/webhook/{workflow_id}"
            base_url = (
                workspace_settings.get("public_base_url")
                or settings.public_base_url
                or str(request.base_url).rstrip("/")
            )
            webhook_url = str(base_url).rstrip("/") + webhook_path
            exposure = "public"
        else:
            exposure = "internal"
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
        signature_header="x-flowholt-signature" if workflow["trigger_type"] == "webhook" else None,
        timestamp_header="x-flowholt-timestamp" if workflow["trigger_type"] == "webhook" else None,
        webhook_secret_configured=bool(workspace_settings.get("webhook_signing_secret")),
        schedule_hint=schedule_hint,
        exposure=exposure,
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
        execution = _execute_workflow(workflow, payload, trigger_type="schedule", environment="production", use_published_version=True)
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
) -> ExecutionSummary:
    effective_environment = "production" if use_published_version else environment
    runtime_definition, runtime_version_id = resolve_runtime_definition_for_environment(
        workflow,
        workspace_id=str(workflow["workspace_id"]),
        environment=effective_environment,
        runtime_definition_override=runtime_definition_override,
        runtime_version_id_override=runtime_version_id_override,
    )

    execution = create_execution_record(
        workflow,
        payload,
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
    )
    started = time.perf_counter()
    vault_context = build_vault_runtime_context(str(workflow["workspace_id"]), environment=effective_environment)

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
                "environment": effective_environment,
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

    execution_environment = str(execution.get("environment") or "draft")
    runtime_definition = workflow["definition_json"]
    runtime_version_id = str(pause["workflow_version_id"]) if pause.get("workflow_version_id") else None
    if runtime_version_id:
        version = get_workflow_version(runtime_version_id, workspace_id=str(pause["workspace_id"]))
        if version is not None:
            runtime_definition = version["definition_json"]

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
                "environment": execution_environment,
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
            step_id=str(step.get("step_id") or "") or None,
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
        data={"duration_ms": duration_ms, "error": error_text, "environment": execution_environment},
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
    )
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
