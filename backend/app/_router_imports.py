"""
Shared imports for router modules.

This module re-exports everything that route handlers commonly need so that
each router file can do a simple ``from .._router_imports import *``.
"""
from __future__ import annotations

# ── Standard library ───────────────────────────────────────────────────
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

# ── FastAPI / Starlette ────────────────────────────────────────────────
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from starlette.responses import StreamingResponse

# ── Internal config ────────────────────────────────────────────────────
from .config import get_settings

settings = get_settings()

# ── Auth ───────────────────────────────────────────────────────────────
from .auth import (
    create_session_token,
    get_supabase_auth_mode,
    hash_password,
    verify_password,
    verify_session_token,
    verify_supabase_token,
)

# ── Database ───────────────────────────────────────────────────────────
from .db import get_database_backend, get_db, init_db, row_to_dict

# ── Deps (session, RBAC, audit) ───────────────────────────────────────
from .deps import (
    _enforce_workspace_concurrency_limit,
    get_optional_session_context,
    get_role_rank,
    get_session_context,
    get_workspace_binding_context,
    record_audit_event,
    require_workspace_role,
    session_meets_min_role,
)

# ── Executor ───────────────────────────────────────────────────────────
from .executor import run_workflow_definition

# ── Assistant tools ────────────────────────────────────────────────────
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

# ── Models ─────────────────────────────────────────────────────────────
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
    TestStepRequest,
    TestStepResponse,
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

# ── Node / Integration registries ─────────────────────────────────────
from .node_registry import (
    get_node_definition,
    get_node_error_settings_fields,
    list_node_definitions,
    normalize_workflow_definition,
    repair_workflow_definition,
    validate_workflow_definition,
)
from .integration_registry import (
    get_integration_app,
    get_integration_operation,
    list_integration_apps,
    resolve_dynamic_operation_fields,
)

# ── Studio helpers ─────────────────────────────────────────────────────
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

# ── Repository (data layer) ───────────────────────────────────────────
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

# ── LLM router ────────────────────────────────────────────────────────
from .llm_router import (
    AnthropicProvider,
    GeminiProvider,
    GroqProvider,
    MockProvider,
    OllamaProvider,
    OpenAICompatibleProvider,
    get_llm_router,
)

# ── Security / Scheduler / Plugins ────────────────────────────────────
from .security import verify_webhook_signature
from .scheduler import is_workflow_due
from .plugin_loader import merge_plugins_into_registry, get_plugin_registry
from .help_content import list_help_articles
from . import runtime_state

# ── Shared helpers ─────────────────────────────────────────────────────
from .helpers import *  # noqa: F401,F403

_logger = logging.getLogger("flowholt.api")
