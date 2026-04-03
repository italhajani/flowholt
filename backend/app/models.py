from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


WorkflowStatus = Literal["active", "draft", "paused"]
ExecutionStatus = Literal["success", "failed", "running", "paused", "cancelled"]
StepStatus = Literal["success", "failed", "skipped", "running", "paused", "cancelled"]
VaultAssetKind = Literal["connection", "credential", "variable"]
VaultScope = Literal["workspace", "staging", "production"]
WorkspaceRole = Literal["owner", "admin", "builder", "viewer"]
JobStatus = Literal["pending", "processing", "completed", "failed", "cancelled"]


class TemplateSummary(BaseModel):
    id: str
    name: str
    description: str
    category: str
    trigger_type: str
    estimated_time: str
    complexity: str
    color: str
    owner: str
    installs: str
    outcome: str
    tags: list[str]


class TemplateDetail(TemplateSummary):
    definition: "WorkflowDefinition"


class WorkflowSummary(BaseModel):
    id: str
    name: str
    status: WorkflowStatus
    trigger_type: str
    category: str
    success_rate: int
    created_at: str
    last_run_at: str | None = None
    template_id: str | None = None
    current_version_number: int = 0
    published_version_id: str | None = None


class WorkflowDetail(WorkflowSummary):
    definition: "WorkflowDefinition"


class WorkflowStep(BaseModel):
    id: str
    type: Literal["trigger", "transform", "condition", "llm", "output", "delay", "human", "callback"]
    name: str
    config: dict[str, Any] = Field(default_factory=dict)


class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str | None = None


class WorkflowDefinition(BaseModel):
    steps: list[WorkflowStep]
    edges: list[WorkflowEdge] = Field(default_factory=list)


class WorkflowCreate(BaseModel):
    name: str
    trigger_type: str = "manual"
    category: str = "Custom"
    status: WorkflowStatus = "draft"
    template_id: str | None = None
    definition: WorkflowDefinition


class WorkflowUpdate(BaseModel):
    name: str
    trigger_type: str
    category: str
    status: WorkflowStatus
    definition: WorkflowDefinition


class WorkflowFromTemplateRequest(BaseModel):
    template_id: str
    name: str | None = None


class WorkflowGenerateRequest(BaseModel):
    prompt: str
    name: str | None = None


class AuthDevLoginRequest(BaseModel):
    user_id: str
    workspace_id: str | None = None


class AuthSessionTokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_at: int
    session: "SessionResponse"


class AuthPreflightResponse(BaseModel):
    local_dev_login_enabled: bool
    supabase_configured: bool
    supabase_auth_mode: Literal["none", "jwt_secret", "jwks"]
    database_backend: str


class SetupReportResponse(BaseModel):
    database_backend: str
    database_url_configured: bool
    supabase_url_configured: bool
    supabase_auth_mode: Literal["none", "jwt_secret", "jwks"]
    scheduler_secret_configured: bool
    public_base_url_configured: bool
    webhook_signature_required: bool
    workspace_id: str
    next_actions: list[str]


class AuditEventSummary(BaseModel):
    id: str
    workspace_id: str
    actor_user_id: str | None = None
    actor_email: str | None = None
    action: str
    target_type: str
    target_id: str | None = None
    status: str
    details: dict[str, Any]
    created_at: str


class WorkflowVersionSummary(BaseModel):
    id: str
    workflow_id: str
    version_number: int
    status: Literal["draft_snapshot", "published"]
    notes: str | None = None
    created_at: str


class WorkflowVersionDetail(WorkflowVersionSummary):
    definition: "WorkflowDefinition"


class WorkflowVersionCreateRequest(BaseModel):
    notes: str | None = None


class WorkflowPublishRequest(BaseModel):
    notes: str | None = None


class WorkflowQueueRunRequest(BaseModel):
    payload: dict[str, Any] = Field(default_factory=dict)


class WorkflowJobSummary(BaseModel):
    id: str
    workspace_id: str
    workflow_id: str
    workflow_version_id: str | None = None
    initiated_by_user_id: str | None = None
    trigger_type: str
    status: JobStatus
    attempts: int
    max_attempts: int
    available_at: str
    leased_until: str | None = None
    execution_id: str | None = None
    error_text: str | None = None
    created_at: str
    updated_at: str


class JobProcessResponse(BaseModel):
    claimed_count: int
    completed_count: int
    failed_count: int
    execution_ids: list[str]
    job_ids: list[str]


class ExecutionStepResult(BaseModel):
    name: str
    status: StepStatus
    duration_ms: int
    output: dict[str, Any] | None = None


class ExecutionSummary(BaseModel):
    id: str
    workflow_id: str
    workflow_version_id: str | None = None
    workflow_name: str
    status: ExecutionStatus
    trigger_type: str
    started_at: str
    finished_at: str | None = None
    duration_ms: int | None = None
    error_text: str | None = None
    steps: list[ExecutionStepResult]


class ExecutionPauseSummary(BaseModel):
    id: str
    execution_id: str
    workflow_id: str
    step_id: str
    step_name: str
    wait_type: Literal["delay", "human", "callback"]
    status: Literal["paused", "resumed", "cancelled"]
    resume_after: str | None = None
    resume_url: str
    cancel_url: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class ResumeExecutionRequest(BaseModel):
    payload: dict[str, Any] = Field(default_factory=dict)
    decision: str | None = None


class RunWorkflowRequest(BaseModel):
    payload: dict[str, Any] = Field(default_factory=dict)


class UserSummary(BaseModel):
    id: str
    name: str
    email: str
    avatar_initials: str


class WorkspaceSummary(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    role: WorkspaceRole
    members_count: int


class WorkspaceMemberSummary(BaseModel):
    user_id: str
    name: str
    email: str
    avatar_initials: str
    role: WorkspaceRole
    status: str


class SessionResponse(BaseModel):
    user: UserSummary
    workspace: WorkspaceSummary


class WorkspaceSettingsResponse(BaseModel):
    workspace_id: str
    public_base_url: str | None = None
    require_webhook_signature: bool = False
    webhook_secret_configured: bool = False
    updated_at: str


class WorkspaceSettingsUpdate(BaseModel):
    public_base_url: str | None = None
    require_webhook_signature: bool = False
    webhook_signing_secret: str | None = None


class VaultConnectionSummary(BaseModel):
    id: str
    kind: Literal["connection"] = "connection"
    name: str
    app: str
    subtitle: str
    logo_url: str
    workflows_count: int
    people_with_access: int
    last_modified: str
    status: str


class VaultCredentialSummary(BaseModel):
    id: str
    kind: Literal["credential"] = "credential"
    name: str
    credential_type: str
    scope: VaultScope
    last_used: str
    status: str


class VaultVariableSummary(BaseModel):
    id: str
    kind: Literal["variable"] = "variable"
    key: str
    scope: VaultScope
    access: str
    updated_at: str
    masked: bool


class VaultOverviewResponse(BaseModel):
    connections: list[VaultConnectionSummary]
    credentials: list[VaultCredentialSummary]
    variables: list[VaultVariableSummary]


class VaultAssetCreate(BaseModel):
    kind: VaultAssetKind
    name: str
    app: str | None = None
    subtitle: str | None = None
    logo_url: str | None = None
    credential_type: str | None = None
    scope: VaultScope = "workspace"
    access: str | None = None
    status: str = "active"
    workflows_count: int = 0
    people_with_access: int = 0
    masked: bool = True
    secret: dict[str, Any] = Field(default_factory=dict)


class VaultAssetUpdate(BaseModel):
    name: str
    app: str | None = None
    subtitle: str | None = None
    logo_url: str | None = None
    credential_type: str | None = None
    scope: VaultScope = "workspace"
    access: str | None = None
    status: str = "active"
    workflows_count: int = 0
    people_with_access: int = 0
    masked: bool = True
    secret: dict[str, Any] = Field(default_factory=dict)


class TriggerDetailsResponse(BaseModel):
    workflow_id: str
    trigger_type: str
    webhook_path: str | None = None
    webhook_url: str | None = None
    signature_header: str | None = None
    timestamp_header: str | None = None
    webhook_secret_configured: bool = False
    schedule_hint: str | None = None


class ScheduledRunResponse(BaseModel):
    triggered_count: int
    execution_ids: list[str]
    skipped_workflow_ids: list[str]


class ResumePausedExecutionsResponse(BaseModel):
    resumed_count: int
    execution_ids: list[str]
    pause_ids: list[str]


class ExecutionEventSummary(BaseModel):
    id: str
    execution_id: str
    workflow_id: str
    workspace_id: str
    event_type: str
    step_name: str | None = None
    step_id: str | None = None
    status: str | None = None
    message: str | None = None
    data: dict[str, Any] = Field(default_factory=dict)
    created_at: str


class HumanTaskSummary(BaseModel):
    id: str
    workspace_id: str
    workflow_id: str
    execution_id: str
    pause_id: str
    step_id: str
    step_name: str
    title: str
    instructions: str
    status: Literal["open", "completed", "cancelled"]
    assigned_to_user_id: str | None = None
    assigned_to_email: str | None = None
    priority: Literal["low", "normal", "high"] = "normal"
    choices: list[str] = Field(default_factory=list)
    due_at: str | None = None
    decision: str | None = None
    comment: str | None = None
    response_payload: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str
    completed_at: str | None = None


class HumanTaskCompleteRequest(BaseModel):
    decision: str
    comment: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class HumanTaskCancelRequest(BaseModel):
    comment: str | None = None


class HealthResponse(BaseModel):
    status: str
    environment: str
    llm_mode: str
    database_backend: str
