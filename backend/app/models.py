from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


WorkflowStatus = Literal["active", "draft", "paused"]
ExecutionStatus = Literal["success", "failed", "running", "paused", "cancelled"]
StepStatus = Literal["success", "failed", "skipped", "running", "paused", "cancelled"]
VaultAssetKind = Literal["connection", "credential", "variable"]
VaultScope = Literal["workspace", "staging", "production"]
WorkspaceRole = Literal["owner", "admin", "builder", "viewer"]
ExecutionEnvironment = Literal["draft", "staging", "production"]
JobStatus = Literal["pending", "processing", "completed", "failed", "cancelled"]
ArtifactDirection = Literal["input", "output", "state", "error", "summary", "pause"]
VaultVisibility = Literal["workspace", "private", "restricted"]


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


class WorkflowValidationIssue(BaseModel):
    level: Literal["error", "warning"]
    code: str
    message: str
    step_id: str | None = None
    edge_id: str | None = None
    field: str | None = None


class WorkflowValidationStats(BaseModel):
    steps_count: int
    edges_count: int
    entry_steps_count: int
    trigger_steps_count: int


class WorkflowValidationResponse(BaseModel):
    valid: bool
    issues: list[WorkflowValidationIssue]
    stats: WorkflowValidationStats


class WorkflowRepairSummary(BaseModel):
    workflow_id: str
    workflow_name: str
    repaired: bool
    actions: list[str] = Field(default_factory=list)
    issues_before: list[WorkflowValidationIssue] = Field(default_factory=list)
    issues_after: list[WorkflowValidationIssue] = Field(default_factory=list)


class WorkflowRepairResponse(BaseModel):
    total_checked: int
    repaired_count: int
    results: list[WorkflowRepairSummary]


class NodeFieldOption(BaseModel):
    value: str
    label: str


class NodeFieldDefinition(BaseModel):
    key: str
    label: str
    type: Literal["string", "textarea", "select", "number", "tags"]
    required: bool = False
    default: Any | None = None
    options: list[NodeFieldOption] = Field(default_factory=list)
    help: str | None = None


class NodeDefinitionSummary(BaseModel):
    type: str
    label: str
    category: str
    description: str
    icon: str
    supports_branches: bool = False
    fields: list[NodeFieldDefinition]


class NodeCatalogGroup(BaseModel):
    id: str
    label: str
    description: str | None = None
    node_types: list[str] = Field(default_factory=list)
    count: int = 0


class NodeCatalogResponse(BaseModel):
    groups: list[NodeCatalogGroup]
    nodes: list[NodeDefinitionSummary]


class NodeBindingReference(BaseModel):
    kind: Literal["connection", "credential", "variable", "member"]
    name: str
    label: str
    app: str | None = None
    scope: str | None = None
    fields: list[str] = Field(default_factory=list)


class NodeEditorField(BaseModel):
    key: str
    label: str
    type: Literal["string", "textarea", "select", "number", "tags"]
    required: bool = False
    help: str | None = None
    value: Any | None = None
    options: list[NodeFieldOption] = Field(default_factory=list)
    bindable: bool = False
    binding_kinds: list[Literal["connection", "credential", "variable", "member"]] = Field(default_factory=list)
    source: Literal["static", "provider", "workspace", "vault", "computed"] = "static"
    placeholder: str | None = None


class NodeEditorSection(BaseModel):
    id: str
    title: str
    description: str | None = None
    fields: list[NodeEditorField] = Field(default_factory=list)


class NodeEditorResponse(BaseModel):
    node_type: str
    label: str
    description: str
    icon: str
    step_name_default: str
    sections: list[NodeEditorSection]
    warnings: list[str] = Field(default_factory=list)
    sample_output: dict[str, Any] = Field(default_factory=dict)
    available_bindings: list[NodeBindingReference] = Field(default_factory=list)


class NodeDraftRequest(BaseModel):
    node_type: str
    name: str | None = None
    trigger_type: str | None = None
    config: dict[str, Any] = Field(default_factory=dict)


class NodeDraftResponse(BaseModel):
    step: WorkflowStep
    editor: NodeEditorResponse


class NodePreviewRequest(BaseModel):
    step: WorkflowStep
    trigger_type: str | None = None


class NodePreviewResponse(BaseModel):
    step_id: str
    node_type: str
    resolved_config: dict[str, Any] = Field(default_factory=dict)
    sample_output: dict[str, Any] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)


class NodeConfigValidationIssue(BaseModel):
    level: Literal["error", "warning"]
    code: str
    message: str
    field: str | None = None


class NodeConfigValidationResponse(BaseModel):
    node_type: str
    valid: bool
    issues: list[NodeConfigValidationIssue] = Field(default_factory=list)
    normalized_config: dict[str, Any] = Field(default_factory=dict)
    sample_output: dict[str, Any] = Field(default_factory=dict)
    bindings_used: list[str] = Field(default_factory=list)


class NodeConfigTestRequest(BaseModel):
    config: dict[str, Any] = Field(default_factory=dict)
    trigger_type: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    name: str | None = None


class NodeConfigTestResponse(BaseModel):
    node_type: str
    status: ExecutionStatus
    valid: bool
    normalized_config: dict[str, Any] = Field(default_factory=dict)
    output: dict[str, Any] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)
    bindings_used: list[str] = Field(default_factory=list)
    duration_ms: int = 0


class NodeResourceItem(BaseModel):
    id: str
    label: str
    kind: Literal["connection", "credential", "variable", "member", "option"]
    subtitle: str | None = None
    state: Literal["ready", "warning", "missing"] = "ready"
    metadata: dict[str, Any] = Field(default_factory=dict)


class NodeResourceGroup(BaseModel):
    id: str
    title: str
    items: list[NodeResourceItem] = Field(default_factory=list)


class NodeResourcesResponse(BaseModel):
    node_type: str
    groups: list[NodeResourceGroup] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class VaultAssetHealthCheck(BaseModel):
    code: str
    label: str
    passed: bool
    severity: Literal["info", "warning", "error"] = "info"
    message: str


class VaultAssetHealthResponse(BaseModel):
    asset_id: str
    workspace_id: str
    name: str
    kind: VaultAssetKind
    app: str | None = None
    healthy: bool
    checks: list[VaultAssetHealthCheck] = Field(default_factory=list)


class VaultAssetVerifyResponse(BaseModel):
    asset_id: str
    workspace_id: str
    verified: bool
    mode: Literal["static", "runtime"] = "static"
    checks: list[VaultAssetHealthCheck] = Field(default_factory=list)
    sample_request: dict[str, Any] = Field(default_factory=dict)
    next_steps: list[str] = Field(default_factory=list)


class VaultAssetAccessUpdate(BaseModel):
    visibility: VaultVisibility = "workspace"
    allowed_roles: list[WorkspaceRole] = Field(default_factory=list)
    allowed_user_ids: list[str] = Field(default_factory=list)


class VaultAssetAccessResponse(BaseModel):
    asset_id: str
    workspace_id: str
    name: str
    kind: VaultAssetKind
    visibility: VaultVisibility
    owner_user_id: str | None = None
    allowed_roles: list[WorkspaceRole] = Field(default_factory=list)
    allowed_user_ids: list[str] = Field(default_factory=list)
    can_edit: bool
    can_test: bool


class StudioStepAssetBinding(BaseModel):
    kind: Literal["connection", "credential", "variable"]
    name: str
    editable: bool
    testable: bool
    visibility: VaultVisibility


class StudioStepAccessResponse(BaseModel):
    workflow_id: str
    step_id: str
    can_edit: bool
    can_test: bool
    bindings: list[StudioStepAssetBinding] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class IntegrationOperationField(BaseModel):
    key: str
    label: str
    type: Literal["string", "textarea", "select", "number", "tags", "boolean"]
    required: bool = False
    help: str | None = None
    options: list[NodeFieldOption] = Field(default_factory=list)
    default: Any | None = None
    source: Literal["static", "dynamic"] = "static"
    display_when: dict[str, Any] = Field(default_factory=dict)


class IntegrationOperationSummary(BaseModel):
    key: str
    label: str
    direction: Literal["trigger", "action", "callback", "ai"]
    description: str
    resource: str


class IntegrationOperationDetail(IntegrationOperationSummary):
    fields: list[IntegrationOperationField] = Field(default_factory=list)


class IntegrationAppSummary(BaseModel):
    key: str
    label: str
    category: str
    auth_kind: Literal["oauth", "api_key", "token", "none", "database"]
    node_types: list[str] = Field(default_factory=list)
    description: str
    operations: list[IntegrationOperationSummary] = Field(default_factory=list)


class IntegrationCatalogResponse(BaseModel):
    apps: list[IntegrationAppSummary] = Field(default_factory=list)


class NodeDynamicPropsRequest(BaseModel):
    config: dict[str, Any] = Field(default_factory=dict)
    trigger_type: str | None = None
    name: str | None = None


class NodeDynamicPropsResponse(BaseModel):
    node_type: str
    app: str | None = None
    operation: str | None = None
    fields: list[IntegrationOperationField] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class StudioStepEditorEntry(BaseModel):
    step_id: str
    step_name: str
    node_type: str
    editor: NodeEditorResponse


class StudioWorkflowBundleResponse(BaseModel):
    workflow: WorkflowDetail
    integrity: WorkflowValidationResponse
    catalog: NodeCatalogResponse
    selected_step_editor: NodeEditorResponse | None = None
    step_editors: list[StudioStepEditorEntry] = Field(default_factory=list)


class StudioInsertStepRequest(BaseModel):
    node_type: str
    name: str | None = None
    config: dict[str, Any] = Field(default_factory=dict)
    after_step_id: str | None = None
    branch_label: Literal["default", "true", "false"] | None = None
    connect_to_step_id: str | None = None


class StudioUpdateStepRequest(BaseModel):
    name: str | None = None
    config: dict[str, Any] = Field(default_factory=dict)
    replace_config: bool = False


class StudioStepTestRequest(BaseModel):
    payload: dict[str, Any] = Field(default_factory=dict)


class StudioStepTestResponse(BaseModel):
    workflow_id: str
    step_id: str
    reached_target: bool
    status: ExecutionStatus
    executed_step_ids: list[str] = Field(default_factory=list)
    target_step_result: ExecutionStepResult | None = None
    warnings: list[str] = Field(default_factory=list)
    preview: NodePreviewResponse | None = None


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


class AssistantNameRequest(BaseModel):
    prompt: str


class AssistantNameResponse(BaseModel):
    name: str
    short_name: str
    reason: str


class AssistantTemplateMatch(BaseModel):
    template_id: str
    name: str
    category: str
    trigger_type: str
    score: int
    reason: str


class AssistantTemplateMatchResponse(BaseModel):
    prompt: str
    matches: list[AssistantTemplateMatch] = Field(default_factory=list)


class AssistantPlanRequest(BaseModel):
    prompt: str


class AssistantSuggestedNode(BaseModel):
    type: str
    label: str
    reason: str


class AssistantPlanResponse(BaseModel):
    prompt: str
    suggested_name: str
    trigger_type: str
    category: str
    summary: str
    matched_templates: list[AssistantTemplateMatch] = Field(default_factory=list)
    suggested_nodes: list[AssistantSuggestedNode] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class AssistantDraftWorkflowRequest(BaseModel):
    prompt: str
    name: str | None = None
    save: bool = False
    template_id: str | None = None


class AssistantDraftWorkflowResponse(BaseModel):
    prompt: str
    suggested_name: str
    summary: str
    trigger_type: str
    category: str
    template_match: AssistantTemplateMatch | None = None
    definition: WorkflowDefinition
    validation: WorkflowValidationResponse
    saved_workflow: WorkflowSummary | None = None
    warnings: list[str] = Field(default_factory=list)


class AssistantCapabilitiesResponse(BaseModel):
    tools: list[str] = Field(default_factory=list)
    can_draft_workflows: bool = True
    can_name_workflows: bool = True
    can_match_templates: bool = True
    can_request_promotions: bool = True
    can_validate_definitions: bool = True
    llm_runtime_mode: str = "mock"
    recommended_local_stack: list[str] = Field(default_factory=list)


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


class ExecutionArtifactSummary(BaseModel):
    id: str
    execution_id: str
    workflow_id: str
    workspace_id: str
    step_id: str | None = None
    step_name: str | None = None
    artifact_type: str
    direction: ArtifactDirection
    data: dict[str, Any] = Field(default_factory=dict)
    size_bytes: int
    created_at: str


class ExecutionArtifactListResponse(BaseModel):
    execution_id: str
    count: int
    artifacts: list[ExecutionArtifactSummary] = Field(default_factory=list)


class ExecutionArtifactPruneResponse(BaseModel):
    deleted_count: int
    retention_days: int


class ExecutionArtifactPruneRequest(BaseModel):
    retention_days: int | None = None


class WorkflowVersionSummary(BaseModel):
    id: str
    workflow_id: str
    version_number: int
    status: Literal["draft_snapshot", "staging", "published"]
    notes: str | None = None
    created_at: str


class WorkflowVersionDetail(WorkflowVersionSummary):
    definition: "WorkflowDefinition"


class WorkflowVersionCreateRequest(BaseModel):
    notes: str | None = None


class WorkflowPublishRequest(BaseModel):
    notes: str | None = None


class WorkflowPromotionRequest(BaseModel):
    target_environment: Literal["staging", "production"]
    notes: str | None = None


class WorkflowPromotionRequestCreate(BaseModel):
    target_environment: Literal["staging", "production"]
    notes: str | None = None


class WorkflowRollbackRequest(BaseModel):
    target_environment: Literal["staging", "production"]
    target_version_id: str | None = None
    notes: str | None = None


class WorkflowEnvironmentVersion(BaseModel):
    version_id: str
    version_number: int
    status: Literal["staging", "published"]
    notes: str | None = None
    created_at: str


class WorkflowEnvironmentsResponse(BaseModel):
    workflow_id: str
    workspace_id: str
    require_staging_before_production: bool = False
    staging: WorkflowEnvironmentVersion | None = None
    production: WorkflowEnvironmentVersion | None = None


class WorkflowDeploymentSummary(BaseModel):
    id: str
    workflow_id: str
    workspace_id: str
    created_by_user_id: str | None = None
    environment: Literal["staging", "production"]
    action: Literal["promote", "rollback"]
    from_version_id: str | None = None
    to_version_id: str
    notes: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: str


class WorkflowDeploymentDetail(WorkflowDeploymentSummary):
    from_version: WorkflowVersionSummary | None = None
    to_version: WorkflowVersionSummary
    can_rollback: bool = False


class WorkflowDeploymentReviewSummary(BaseModel):
    id: str
    workflow_id: str
    workspace_id: str
    requested_by_user_id: str
    reviewed_by_user_id: str | None = None
    target_environment: Literal["staging", "production"]
    target_version_id: str
    status: Literal["pending", "approved", "rejected", "cancelled"]
    notes: str | None = None
    review_comment: str | None = None
    created_at: str
    updated_at: str
    reviewed_at: str | None = None


class WorkflowDeploymentReviewDetail(WorkflowDeploymentReviewSummary):
    target_version: WorkflowVersionSummary
    requested_by_name: str | None = None
    reviewed_by_name: str | None = None
    can_approve: bool = False
    can_reject: bool = False


class WorkflowDeploymentReviewDecisionRequest(BaseModel):
    comment: str | None = None


class WorkflowCompareChange(BaseModel):
    entity_type: Literal["step", "edge"]
    change_type: Literal["added", "removed", "modified"]
    id: str
    label: str
    summary: str


class WorkflowCompareStats(BaseModel):
    steps_added: int = 0
    steps_removed: int = 0
    steps_modified: int = 0
    edges_added: int = 0
    edges_removed: int = 0
    edges_modified: int = 0


class WorkflowCompareResponse(BaseModel):
    workflow_id: str
    from_ref: str
    to_ref: str
    from_version_id: str | None = None
    to_version_id: str | None = None
    from_version_number: int | None = None
    to_version_number: int | None = None
    stats: WorkflowCompareStats
    changes: list[WorkflowCompareChange] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class WorkflowQueueRunRequest(BaseModel):
    payload: dict[str, Any] = Field(default_factory=dict)
    environment: ExecutionEnvironment = "draft"


class WorkflowJobSummary(BaseModel):
    id: str
    workspace_id: str
    workflow_id: str
    workflow_version_id: str | None = None
    initiated_by_user_id: str | None = None
    environment: ExecutionEnvironment = "draft"
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
    step_id: str | None = None
    step_type: str | None = None
    name: str
    status: StepStatus
    duration_ms: int
    output: dict[str, Any] | None = None


class ExecutionSummary(BaseModel):
    id: str
    workflow_id: str
    workflow_version_id: str | None = None
    workflow_name: str
    environment: ExecutionEnvironment = "draft"
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
    environment: ExecutionEnvironment = "draft"


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
    staging_min_role: WorkspaceRole = "builder"
    publish_min_role: WorkspaceRole = "builder"
    run_min_role: WorkspaceRole = "builder"
    production_asset_min_role: WorkspaceRole = "admin"
    allow_public_webhooks: bool = True
    require_staging_before_production: bool = False
    require_staging_approval: bool = False
    require_production_approval: bool = False
    deployment_approval_min_role: WorkspaceRole = "admin"
    allow_self_approval: bool = False
    updated_at: str


class WorkspaceSettingsUpdate(BaseModel):
    public_base_url: str | None = None
    require_webhook_signature: bool = False
    webhook_signing_secret: str | None = None
    staging_min_role: WorkspaceRole = "builder"
    publish_min_role: WorkspaceRole = "builder"
    run_min_role: WorkspaceRole = "builder"
    production_asset_min_role: WorkspaceRole = "admin"
    allow_public_webhooks: bool = True
    require_staging_before_production: bool = False
    require_staging_approval: bool = False
    require_production_approval: bool = False
    deployment_approval_min_role: WorkspaceRole = "admin"
    allow_self_approval: bool = False


class WorkflowPolicyResponse(BaseModel):
    workflow_id: str
    workspace_id: str
    can_run: bool
    can_promote_to_staging: bool
    can_publish: bool
    uses_production_assets: bool
    public_webhook_requested: bool
    staging_min_role: WorkspaceRole
    run_min_role: WorkspaceRole
    publish_min_role: WorkspaceRole
    production_asset_min_role: WorkspaceRole
    require_staging_before_production: bool = False
    require_staging_approval: bool = False
    require_production_approval: bool = False
    deployment_approval_min_role: WorkspaceRole = "admin"
    allow_self_approval: bool = False
    warnings: list[str] = Field(default_factory=list)


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
    environment: ExecutionEnvironment = "production"
    deployed_version_id: str | None = None
    deployed_version_number: int | None = None
    webhook_path: str | None = None
    webhook_url: str | None = None
    signature_header: str | None = None
    timestamp_header: str | None = None
    webhook_secret_configured: bool = False
    schedule_hint: str | None = None
    exposure: Literal["public", "internal"] = "public"


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


class ExecutionInspectorResponse(BaseModel):
    execution: ExecutionSummary
    events: list[ExecutionEventSummary] = Field(default_factory=list)
    artifacts: list[ExecutionArtifactSummary] = Field(default_factory=list)
    pause: ExecutionPauseSummary | None = None
    human_task: HumanTaskSummary | None = None


ExecutionReplayMode = Literal["same_version", "latest_published", "current_draft"]


class ExecutionReplayRequest(BaseModel):
    mode: ExecutionReplayMode = "same_version"
    queued: bool = True
    payload_override: dict[str, Any] = Field(default_factory=dict)


class ExecutionReplayResponse(BaseModel):
    mode: ExecutionReplayMode
    queued: bool
    execution: ExecutionSummary | None = None
    job: WorkflowJobSummary | None = None


class ExecutionStepInspectorResponse(BaseModel):
    execution_id: str
    workflow_id: str
    step_id: str
    step_name: str
    step_type: str | None = None
    result: ExecutionStepResult | None = None
    latest_output: dict[str, Any] = Field(default_factory=dict)
    events: list[ExecutionEventSummary] = Field(default_factory=list)
    artifacts: list[ExecutionArtifactSummary] = Field(default_factory=list)


class WorkflowStepHistoryEntry(BaseModel):
    execution_id: str
    workflow_id: str
    step_id: str
    step_name: str
    step_type: str | None = None
    execution_status: ExecutionStatus
    step_status: StepStatus
    trigger_type: str
    started_at: str
    finished_at: str | None = None
    duration_ms: int
    output: dict[str, Any] = Field(default_factory=dict)


class WorkflowStepHistoryResponse(BaseModel):
    workflow_id: str
    step_id: str
    step_name: str | None = None
    total_matches: int
    entries: list[WorkflowStepHistoryEntry] = Field(default_factory=list)


class WorkflowObservabilityResponse(BaseModel):
    workflow_id: str
    workflow_name: str
    total_runs: int
    success_count: int
    failed_count: int
    paused_count: int
    cancelled_count: int
    success_rate: int
    average_duration_ms: int
    active_job_count: int
    last_run_at: str | None = None
    last_success_at: str | None = None
    last_failed_at: str | None = None
    recent_executions: list[ExecutionSummary] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    environment: str
    llm_mode: str
    database_backend: str
