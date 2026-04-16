const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "flowholt_token";
const SESSION_KEY = "flowholt_session";

function getDevProxyUnavailableMessage(response: Response): string | null {
  const contentType = response.headers?.get?.("content-type") || "";
  if (!import.meta.env.DEV || import.meta.env.TEST || API_BASE || response.status !== 500 || contentType.includes("application/json")) {
    return null;
  }

  return "Local API is unreachable. Start the backend server on http://127.0.0.1:8000 or run the 'Run backend dev server' task.";
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getCachedSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setCachedSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthState(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function isTokenExpired(token: string): boolean {
  try {
    const [payload] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded)) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
}

export interface AuthSession {
  user: { id: string; name: string; email: string; avatar_initials: string };
  workspace: { id: string; name: string; slug: string; plan: string; role: string; members_count: number };
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_at: number;
  session: AuthSession;
}

export interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  estimated_time: string;
  complexity: "Simple" | "Standard" | "Complex" | string;
  color: string;
  owner: string;
  installs: string;
  outcome: string;
  tags: string[];
}

export interface ApiTemplateDetail extends ApiTemplate {
  definition: {
    steps: Array<{
      id: string;
      type: ApiWorkflowStepType;
      name: string;
      config: Record<string, unknown>;
    }>;
    settings?: ApiWorkflowSettings;
  };
}

export interface ApiVaultConnection {
  id: string;
  kind: "connection";
  name: string;
  app: string;
  subtitle: string;
  logo_url: string;
  workflows_count: number;
  people_with_access: number;
  last_modified: string;
  status: string;
  secret?: Record<string, unknown>;
}

export interface ApiVaultCredential {
  id: string;
  kind: "credential";
  name: string;
  app?: string | null;
  credential_type: string;
  scope: "workspace" | "staging" | "production";
  last_used: string;
  status: string;
  secret?: Record<string, unknown>;
}

export interface ApiVaultVariable {
  id: string;
  kind: "variable";
  key: string;
  scope: "workspace" | "staging" | "production";
  access: string;
  updated_at: string;
  masked: boolean;
  secret?: Record<string, unknown>;
}

export interface ApiVaultAsset {
  id: string;
  kind: "connection" | "credential" | "variable";
  name: string;
  app?: string | null;
  subtitle?: string | null;
  logo_url?: string | null;
  credential_type?: string | null;
  scope: "workspace" | "staging" | "production";
  access?: string | null;
  status?: string;
  workflows_count?: number;
  people_with_access?: number;
  masked: boolean;
  secret: Record<string, unknown>;
}

export interface ApiHelpArticle {
  id: string;
  category: "guides" | "troubleshooting" | "security" | "contact";
  title: string;
  summary: string;
  action_label: string;
  action_href?: string | null;
  action_kind: "link" | "email" | "chat";
}

export interface ApiVaultOverview {
  connections: ApiVaultConnection[];
  credentials: ApiVaultCredential[];
  variables: ApiVaultVariable[];
}

export interface ApiWorkflow {
  id: string;
  name: string;
  status: "active" | "draft" | "paused";
  trigger_type: "webhook" | "chat" | "schedule" | "manual" | "event";
  category: string;
  success_rate: number;
  created_at: string;
  last_run_at: string | null;
  template_id: string | null;
}

export type ApiWorkflowStepType =
  | "trigger"
  | "transform"
  | "condition"
  | "llm"
  | "output"
  | "delay"
  | "human"
  | "callback"
  | "loop"
  | "code"
  | "http_request"
  | "filter"
  | "merge"
  | "ai_agent"
  | "ai_summarize"
  | "ai_extract"
  | "ai_classify"
  | "ai_sentiment"
  | "ai_chat_model"
  | "ai_memory"
  | "ai_tool"
  | "ai_output_parser";

export interface ApiWorkflowSettings {
  execution_order: "v1" | "legacy";
  error_workflow_id?: string | null;
  caller_policy: "inherit" | "isolated";
  timezone: string;
  save_failed_executions: "all" | "none";
  save_successful_executions: "all" | "none";
  save_manual_executions: boolean;
  save_execution_progress: boolean;
  timeout_seconds: number;
  time_saved_minutes: number;
}

export interface ApiWorkflowStep {
  id: string;
  type: ApiWorkflowStepType;
  name: string;
  config: Record<string, unknown>;
}

export interface ApiWorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string | null;
}

export interface ApiWorkflowDetail extends ApiWorkflow {
  definition: {
    steps: ApiWorkflowStep[];
    edges: ApiWorkflowEdge[];
    settings: ApiWorkflowSettings;
  };
}

export interface ApiExecutionStep {
  name: string;
  status: "success" | "failed" | "skipped" | "running" | "paused" | "cancelled";
  duration_ms: number;
  output?: Record<string, unknown> | null;
}

export interface ApiExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: "success" | "failed" | "running" | "paused" | "cancelled";
  trigger_type: "webhook" | "chat" | "schedule" | "manual" | "event";
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  error_text: string | null;
  steps: ApiExecutionStep[];
}

export interface ApiNotification {
  id: string;
  title: string;
  body: string;
  kind: "info" | "success" | "warning" | "error";
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface ApiTriggerDetails {
  workflow_id: string;
  trigger_type: "webhook" | "chat" | "schedule" | "manual" | "event";
  environment?: "draft" | "staging" | "production";
  deployed_version_id?: string | null;
  deployed_version_number?: number | null;
  webhook_path: string | null;
  webhook_url: string | null;
  test_webhook_path?: string | null;
  test_webhook_url?: string | null;
  production_webhook_path?: string | null;
  production_webhook_url?: string | null;
  chat_path?: string | null;
  chat_url?: string | null;
  test_chat_path?: string | null;
  test_chat_url?: string | null;
  production_chat_path?: string | null;
  production_chat_url?: string | null;
  public_chat_stream_path?: string | null;
  public_chat_stream_url?: string | null;
  hosted_chat_path?: string | null;
  hosted_chat_url?: string | null;
  widget_script_path?: string | null;
  widget_script_url?: string | null;
  widget_embed_html?: string | null;
  chat_public_enabled?: boolean;
  chat_mode?: string | null;
  chat_authentication?: string | null;
  chat_response_mode?: string | null;
  chat_load_previous_session?: string | null;
  chat_title?: string | null;
  chat_subtitle?: string | null;
  chat_input_placeholder?: string | null;
  chat_initial_messages?: string[];
  chat_allowed_origins?: string | null;
  chat_require_button_click?: boolean;
  signature_header?: string | null;
  timestamp_header?: string | null;
  webhook_secret_configured?: boolean;
  schedule_hint: string | null;
  exposure?: "public" | "internal";
}

export interface ApiScheduledRun {
  triggered_count: number;
  execution_ids: string[];
  skipped_workflow_ids: string[];
}

export interface ApiPublicChatTriggerInfo {
  workflow_id: string;
  workspace_id: string;
  trigger_type: "chat";
  mode: string;
  authentication: string;
  response_mode: string;
  load_previous_session: string;
  title?: string | null;
  subtitle?: string | null;
  input_placeholder?: string | null;
  initial_messages: string[];
  require_button_click: boolean;
  public_chat_url?: string | null;
  public_chat_stream_url?: string | null;
  hosted_chat_url?: string | null;
  widget_script_url?: string | null;
  widget_embed_html?: string | null;
}

export interface ApiPublicChatSendResponse {
  workflow_id: string;
  execution_id: string;
  session_id: string;
  trigger_type: "chat";
  mode: string;
  response_mode: string;
  message: string;
  messages: Array<{ role: "assistant" | "user" | "system"; content: string }>;
  title?: string | null;
  subtitle?: string | null;
  input_placeholder?: string | null;
}

// --- Integration Catalog ---

export interface ApiIntegrationOperation {
  key: string;
  label: string;
  direction: string;
  description: string;
  resource: string;
}

export interface ApiIntegrationApp {
  key: string;
  label: string;
  category: string;
  auth_kind: "oauth" | "api_key" | "token" | "none" | "database";
  node_types: string[];
  description: string;
  operations: ApiIntegrationOperation[];
}

// --- Node Definitions ---

export interface ApiNodeFieldOption {
  value: string;
  label: string;
}

export interface ApiNodeFieldShowWhen {
  field: string;
  equals?: unknown;
  value?: unknown;
}

export interface ApiNodeField {
  key: string;
  label: string;
  type:
    | "string"
    | "textarea"
    | "select"
    | "number"
    | "tags"
    | "code"
    | "password"
    | "boolean"
    | "credential"
    | "messages"
    | "keyvalue"
    | "json"
    | "datetime";
  required: boolean;
  default?: unknown;
  options?: ApiNodeFieldOption[];
  help?: string;
  group?: string;
  show_when?: ApiNodeFieldShowWhen;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export interface ApiNodeDefinition {
  type: string;
  label: string;
  category: string;
  description: string;
  icon: string;
  supports_branches: boolean;
  fields: ApiNodeField[];
}

export interface ApiNodeCatalogGroup {
  id: string;
  label: string;
  description?: string | null;
  node_types: string[];
  count: number;
}

export interface ApiNodeCatalogResponse {
  groups: ApiNodeCatalogGroup[];
  nodes: ApiNodeDefinition[];
}

export interface ApiNodeBindingReference {
  kind: "connection" | "credential" | "variable" | "member";
  name: string;
  label: string;
  app?: string | null;
  scope?: string | null;
  fields: string[];
}

export interface ApiNodeDataReference {
  source: "input" | "node";
  step_id: string;
  step_name: string;
  node_type: string;
  path: string;
  expression: string;
  expression_core?: string | null;
  namespace?: string | null;
  search_terms: string[];
  depth: number;
  is_root: boolean;
  preview?: string | null;
  value?: unknown;
}

export interface ApiNodeEditorField {
  key: string;
  label: string;
  type: ApiNodeField["type"];
  required: boolean;
  help?: string | null;
  value?: unknown;
  options: ApiNodeFieldOption[];
  bindable: boolean;
  binding_kinds: Array<"connection" | "credential" | "variable" | "member">;
  source: "static" | "provider" | "workspace" | "vault" | "computed" | "settings";
  placeholder?: string | null;
  group?: string | null;
  show_when?: ApiNodeFieldShowWhen | null;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string | null;
}

export interface ApiNodeEditorSection {
  id: string;
  title: string;
  description?: string | null;
  fields: ApiNodeEditorField[];
}

export interface ApiNodeEditorResponse {
  node_type: string;
  label: string;
  description: string;
  icon: string;
  step_name_default: string;
  sections: ApiNodeEditorSection[];
  node_settings?: ApiNodeEditorSection[];
  warnings: string[];
  sample_output: Record<string, unknown>;
  available_bindings: ApiNodeBindingReference[];
  data_references: ApiNodeDataReference[];
}

export interface ApiNodePreviewResponse {
  step_id: string;
  node_type: string;
  resolved_config: Record<string, unknown>;
  sample_output: Record<string, unknown>;
  warnings: string[];
  data_source: "live" | "pinned";
}

export interface ApiExecutionStepResult {
  step_id?: string | null;
  step_type?: string | null;
  name: string;
  status: "success" | "failed" | "skipped" | "running" | "paused" | "cancelled";
  duration_ms: number;
  output?: Record<string, unknown> | null;
  pinned_data_used?: boolean;
}

export interface ApiNodeValidationIssue {
  level: "error" | "warning";
  code: string;
  message: string;
  field?: string | null;
}

export interface ApiNodeConfigValidationResponse {
  node_type: string;
  valid: boolean;
  issues: ApiNodeValidationIssue[];
  normalized_config: Record<string, unknown>;
  sample_output: Record<string, unknown>;
  bindings_used: string[];
}

export interface ApiNodeConfigTestResponse {
  node_type: string;
  status: string;
  valid: boolean;
  normalized_config: Record<string, unknown>;
  output: Record<string, unknown>;
  warnings: string[];
  bindings_used: string[];
  duration_ms: number;
  pinned_data_used: boolean;
}

export interface ApiNodeDraftResponse {
  step: ApiWorkflowStep;
  editor: ApiNodeEditorResponse;
}

export interface ApiStudioStepTestResponse {
  workflow_id: string;
  step_id: string;
  reached_target: boolean;
  status: "success" | "failed" | "running" | "paused" | "cancelled";
  executed_step_ids: string[];
  target_step_result?: ApiExecutionStepResult | null;
  warnings: string[];
  preview?: ApiNodePreviewResponse | null;
}

export interface ApiAssistantWorkflowSummaryResponse {
  workflow_id: string;
  current_name: string;
  suggested_name: string;
  summary: string;
  notable_steps: string[];
  warnings: string[];
}

// --- Search ---

export interface ApiSearchResult {
  id: string;
  name?: string;
  workflow_name?: string;
  status?: string;
  category?: string;
  kind?: string;
  started_at?: string;
  type: "workflow" | "execution" | "vault_asset";
}

export interface ApiSearchResults {
  workflows: ApiSearchResult[];
  executions: ApiSearchResult[];
  vault_assets: ApiSearchResult[];
}

// --- System Status ---

export interface ApiSystemStatus {
  platform: {
    version: string;
    environment: string;
    database_backend: string;
    execution_mode: string;
  };
  llm: {
    configured_provider: string;
    available_providers: string[];
    default_provider: string;
  };
  worker: {
    active: boolean;
    mode: string;
  };
  scheduler: {
    active: boolean;
  };
  jobs: {
    pending: number;
    processing: number;
    failed: number;
    completed: number;
    total: number;
  };
  executions: {
    total: number;
    success: number;
    failed: number;
    running: number;
  };
  workflows: {
    total: number;
    active: number;
  };
  integrations: {
    builtin_count: number;
    plugin_count: number;
    total: number;
  };
}

export interface ApiLlmStatus {
  configured_provider: string;
  available_providers: string[];
  default_provider: string;
  execution_mode: string;
  worker_active: boolean;
  scheduler_active: boolean;
}

export interface ApiSandboxResult {
  status: "success" | "error" | "timeout";
  output: unknown;
  logs: string[];
  error?: string;
  duration_ms: number;
}

export interface ApiOAuth2Provider {
  key: string;
  authorize_url: string;
  scopes: string;
}

export interface ApiAuditEvent {
  id: string;
  workspace_id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ApiExecutionEvent {
  id: string;
  execution_id: string;
  workflow_id: string;
  event_type: string;
  step_name: string | null;
  step_id: string | null;
  status: string | null;
  message: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export interface ApiExecutionArtifactSummary {
  id: string;
  execution_id: string;
  workflow_id: string;
  workspace_id: string;
  step_id: string | null;
  step_name: string | null;
  artifact_type: string;
  direction: "input" | "output" | "state" | "error" | "summary" | "pause";
  data: Record<string, unknown>;
  size_bytes: number;
  created_at: string;
}

export interface ApiExecutionPauseSummary {
  id: string;
  execution_id: string;
  workflow_id: string;
  step_id: string;
  step_name: string;
  wait_type: "delay" | "human" | "callback";
  status: "paused" | "resumed" | "cancelled";
  resume_after: string | null;
  resume_url: string;
  cancel_url: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiHumanTaskSummary {
  id: string;
  workspace_id: string;
  workflow_id: string;
  execution_id: string;
  pause_id: string;
  step_id: string;
  step_name: string;
  title: string;
  instructions: string;
  status: "open" | "completed" | "cancelled";
  assigned_to_user_id: string | null;
  assigned_to_email: string | null;
  priority: "low" | "normal" | "high";
  choices: string[];
  due_at: string | null;
  decision: string | null;
  comment: string | null;
  response_payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ApiExecutionStepInspectorResponse {
  execution_id: string;
  workflow_id: string;
  step_id: string;
  step_name: string;
  step_type: string | null;
  result: ApiExecutionStepResult | null;
  latest_output: Record<string, unknown>;
  events: ApiExecutionEvent[];
  artifacts: ApiExecutionArtifactSummary[];
}

export interface ApiWorkflowStepHistoryEntry {
  execution_id: string;
  workflow_id: string;
  step_id: string;
  step_name: string;
  step_type: string | null;
  execution_status: "success" | "failed" | "running" | "paused" | "cancelled";
  step_status: "success" | "failed" | "skipped" | "running" | "paused" | "cancelled";
  trigger_type: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number;
  output: Record<string, unknown>;
}

export interface ApiWorkflowStepHistoryResponse {
  workflow_id: string;
  step_id: string;
  step_name: string | null;
  total_matches: number;
  entries: ApiWorkflowStepHistoryEntry[];
}

export interface ApiExecutionReplayResponse {
  mode: "same_version" | "latest_published" | "current_draft";
  queued: boolean;
  execution: ApiExecution | null;
  job: Record<string, unknown> | null;
}

export interface ApiExecutionBundle {
  execution: ApiExecution;
  events: ApiExecutionEvent[];
  artifacts: ApiExecutionArtifactSummary[];
  pause: ApiExecutionPauseSummary | null;
  human_task: ApiHumanTaskSummary | null;
}

export interface ApiWorkflowExportBundle {
  format_version: string;
  platform: string;
  exported_at: string;
  workflow: ApiWorkflowDetail;
  metadata: Record<string, unknown>;
}

export interface ApiWorkflowImportResponse {
  workflow_id: string;
  workflow_name: string;
  status: string;
  steps_count: number;
  edges_count: number;
  warnings: string[];
}

export interface ApiDeepHealth {
  status: "healthy" | "degraded" | "unhealthy";
  checks: Record<string, { status: string; error?: string; [key: string]: unknown }>;
  timestamp: string;
}

// --- Workspace Settings ---

export interface ApiWorkspaceSettings {
  workspace_id: string;
  public_base_url: string | null;
  require_webhook_signature: boolean;
  webhook_secret_configured: boolean;
  staging_min_role: string;
  publish_min_role: string;
  run_min_role: string;
  production_asset_min_role: string;
  allow_public_webhooks: boolean;
  allow_public_chat_triggers: boolean;
  require_staging_before_production: boolean;
  require_staging_approval: boolean;
  require_production_approval: boolean;
  deployment_approval_min_role: string;
  allow_self_approval: boolean;
  timezone: string;
  execution_timeout_seconds: number;
  save_execution_data: boolean;
  save_failed_executions: "all" | "none";
  save_successful_executions: "all" | "none";
  save_manual_executions: boolean;
  execution_data_retention_days: number;
  save_execution_progress: boolean;
  redact_execution_payloads: boolean;
  max_concurrent_executions: number;
  log_level: string;
  email_notifications_enabled: boolean;
  notify_on_failure: boolean;
  notify_on_success: boolean;
  notify_on_approval_requests: boolean;
  updated_at: string;
}

export interface ApiWorkspaceSettingsUpdate {
  public_base_url?: string | null;
  require_webhook_signature?: boolean;
  webhook_signing_secret?: string | null;
  staging_min_role?: string;
  publish_min_role?: string;
  run_min_role?: string;
  production_asset_min_role?: string;
  allow_public_webhooks?: boolean;
  allow_public_chat_triggers?: boolean;
  require_staging_before_production?: boolean;
  require_staging_approval?: boolean;
  require_production_approval?: boolean;
  deployment_approval_min_role?: string;
  allow_self_approval?: boolean;
  timezone?: string;
  execution_timeout_seconds?: number;
  save_execution_data?: boolean;
  save_failed_executions?: "all" | "none";
  save_successful_executions?: "all" | "none";
  save_manual_executions?: boolean;
  execution_data_retention_days?: number;
  save_execution_progress?: boolean;
  redact_execution_payloads?: boolean;
  max_concurrent_executions?: number;
  log_level?: string;
  email_notifications_enabled?: boolean;
  notify_on_failure?: boolean;
  notify_on_success?: boolean;
  notify_on_approval_requests?: boolean;
}

export type ApiWorkspaceRole = "owner" | "admin" | "builder" | "viewer";
export type ApiWorkspaceMemberStatus = "active" | "invited";

export interface ApiWorkspaceMember {
  user_id: string;
  name: string;
  email: string;
  avatar_initials: string;
  role: ApiWorkspaceRole;
  status: ApiWorkspaceMemberStatus;
}

export interface ApiWorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ApiWorkflowVersionSummary {
  id: string;
  workflow_id: string;
  version_number: number;
  status: "draft_snapshot" | "staging" | "published";
  notes: string | null;
  created_at: string;
}

export interface ApiWorkflowVersionDetail extends ApiWorkflowVersionSummary {
  definition: {
    steps: ApiWorkflowStep[];
    edges: ApiWorkflowEdge[];
    settings: ApiWorkflowSettings;
  };
}

export interface ApiWorkflowDeploymentReviewSummary {
  id: string;
  workflow_id: string;
  workspace_id: string;
  requested_by_user_id: string;
  reviewed_by_user_id: string | null;
  target_environment: "staging" | "production";
  target_version_id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  notes: string | null;
  review_comment: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

export interface ApiWorkflowDeploymentSummary {
  id: string;
  workflow_id: string;
  workspace_id: string;
  created_by_user_id: string | null;
  environment: "staging" | "production";
  action: "promote" | "rollback";
  from_version_id: string | null;
  to_version_id: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiWorkflowCreatePayload {
  name: string;
  trigger_type?: "webhook" | "schedule" | "manual" | "event";
  category?: string;
  status?: "active" | "draft" | "paused";
  template_id?: string | null;
  definition: {
    steps: Array<{
      id: string;
      type: ApiWorkflowStepType;
      name: string;
      config: Record<string, unknown>;
    }>;
    edges?: ApiWorkflowEdge[];
    settings?: ApiWorkflowSettings;
  };
}

export interface ApiWorkflowUpdatePayload {
  name: string;
  trigger_type: "webhook" | "chat" | "schedule" | "manual" | "event";
  category: string;
  status: "active" | "draft" | "paused";
  definition: {
    steps: ApiWorkflowStep[];
    edges: ApiWorkflowEdge[];
    settings: ApiWorkflowSettings;
  };
}

async function request<T>(path: string, init?: RequestInit, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const headers = new Headers(init?.headers || undefined);
      if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      const token = getToken();
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`${API_BASE}${path}`, {
        signal: AbortSignal.timeout(20_000),
        headers,
        ...init,
      });

      if (!response.ok) {
        let message = getDevProxyUnavailableMessage(response) ?? `Request failed: ${response.status}`;
        try {
          const body = await response.json();
          if (typeof body?.detail === "string") {
            message = body.detail;
          } else if (body?.detail?.message) {
            const firstIssue = Array.isArray(body.detail.issues) ? body.detail.issues[0] : null;
            message = firstIssue?.message
              ? `${body.detail.message}: ${firstIssue.message}`
              : body.detail.message;
          } else if (body?.message) {
            message = body.message;
          }
        } catch {
          // fall back to status-based error text when the response body is empty or not JSON
        }
        // On 401 clear token so UI can redirect to login.
        // HTTP error responses are surfaced immediately; only network/timeouts are retried.
        if (response.status === 401) { clearAuthState(); }
        const handledError = new Error(message) as Error & { handledResponse?: boolean };
        handledError.handledResponse = true;
        throw handledError;
      }

      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    } catch (err) {
      // Retry on network/timeout errors, but not on HTTP error responses we already handled
      if (attempt >= retries) throw err;
      if (err instanceof Error && (err as Error & { handledResponse?: boolean }).handledResponse) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error("Request failed after retries");
}

async function requestPublic<T>(path: string, init?: RequestInit, retries = 1): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const headers = new Headers(init?.headers || undefined);
      if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`${API_BASE}${path}`, {
        signal: AbortSignal.timeout(20_000),
        headers,
        ...init,
      });

      if (!response.ok) {
        let message = getDevProxyUnavailableMessage(response) ?? `Request failed: ${response.status}`;
        try {
          const body = await response.json();
          if (typeof body?.detail === "string") {
            message = body.detail;
          } else if (body?.message) {
            message = body.message;
          }
        } catch {
          // Use status fallback.
        }
        throw new Error(message);
      }

      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
  throw new Error("Request failed after retries");
}

async function requestEventStream<T>(
  path: string,
  init: RequestInit,
  options: {
    onDelta?: (delta: string) => void;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const headers = new Headers(init.headers || undefined);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    signal: options.signal ?? AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        message = body.detail;
      } else if (body?.detail?.message) {
        message = body.detail.message;
      } else if (body?.message) {
        message = body.message;
      }
    } catch {
      // Ignore JSON parse errors and fall back to the status-based message.
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("Streaming response body was empty.");
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = "";
  let donePayload: T | null = null;

  const processEventBlock = (block: string) => {
    const lines = block.split(/\r?\n/);
    let eventName = "message";
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (!dataLines.length) {
      return;
    }

    const payload = JSON.parse(dataLines.join("\n")) as Record<string, unknown>;
    if (eventName === "delta") {
      const delta = typeof payload.delta === "string" ? payload.delta : "";
      if (delta) {
        options.onDelta?.(delta);
      }
      return;
    }

    if (eventName === "done") {
      donePayload = payload as T;
      return;
    }

    if (eventName === "error") {
      throw new Error(typeof payload.message === "string" ? payload.message : "Streaming request failed.");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

    let delimiterIndex = buffer.indexOf("\n\n");
    while (delimiterIndex >= 0) {
      const eventBlock = buffer.slice(0, delimiterIndex).trim();
      buffer = buffer.slice(delimiterIndex + 2);
      if (eventBlock) {
        processEventBlock(eventBlock);
      }
      delimiterIndex = buffer.indexOf("\n\n");
    }

    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    processEventBlock(buffer.trim());
  }

  if (donePayload === null) {
    throw new Error("Stream ended before a final response was received.");
  }

  return donePayload;
}

async function requestPublicEventStream<T>(
  path: string,
  init: RequestInit,
  options: {
    onDelta?: (delta: string) => void;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const headers = new Headers(init.headers || undefined);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    signal: options.signal ?? AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        message = body.detail;
      } else if (body?.detail?.message) {
        message = body.detail.message;
      } else if (body?.message) {
        message = body.message;
      }
    } catch {
      // Ignore JSON parse errors and fall back to the status-based message.
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("Streaming response body was empty.");
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = "";
  let donePayload: T | null = null;

  const processEventBlock = (block: string) => {
    const lines = block.split(/\r?\n/);
    let eventName = "message";
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (!dataLines.length) {
      return;
    }

    const payload = JSON.parse(dataLines.join("\n")) as Record<string, unknown>;
    if (eventName === "delta") {
      const delta = typeof payload.delta === "string" ? payload.delta : "";
      if (delta) {
        options.onDelta?.(delta);
      }
      return;
    }

    if (eventName === "done") {
      donePayload = payload as T;
      return;
    }

    if (eventName === "error") {
      throw new Error(typeof payload.message === "string" ? payload.message : "Streaming request failed.");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

    let delimiterIndex = buffer.indexOf("\n\n");
    while (delimiterIndex >= 0) {
      const eventBlock = buffer.slice(0, delimiterIndex).trim();
      buffer = buffer.slice(delimiterIndex + 2);
      if (eventBlock) {
        processEventBlock(eventBlock);
      }
      delimiterIndex = buffer.indexOf("\n\n");
    }

    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    processEventBlock(buffer.trim());
  }

  if (donePayload === null) {
    throw new Error("Stream ended before a final response was received.");
  }

  return donePayload;
}

// ── Chat thread types ──────────────────────────────────────────────
export interface ApiWorkflowAssistantAction {
  type: "add_steps" | "run_workflow" | "open_node" | "create_workflow";
  label: string;
  steps?: ApiWorkflowStep[];
  edges?: ApiWorkflowEdge[];
  step_id?: string;
  prompt?: string;
  workflow_name?: string;
}

export interface ApiChatAttachment {
  id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  preview_text?: string | null;
  created_at: string;
}

export interface ApiChatMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  model_used?: string | null;
  actions: ApiWorkflowAssistantAction[];
  attachments: ApiChatAttachment[];
  created_at: string;
}

export interface ApiChatThreadSummary {
  id: string;
  title: string;
  model: string;
  pinned: boolean;
  message_count: number;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
}

export interface ApiChatThreadDetail {
  id: string;
  title: string;
  model: string;
  pinned: boolean;
  messages: ApiChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ApiChatThreadListResponse {
  threads: ApiChatThreadSummary[];
}

export interface ApiChatSendResponse {
  user_message: ApiChatMessage;
  assistant_message: ApiChatMessage;
  thread_title: string;
}

export interface ApiAssistantChatResponse {
  reply: string;
  suggestions: string[];
  actions: ApiWorkflowAssistantAction[];
  workflow_summary?: ApiAssistantWorkflowSummaryResponse | null;
  context_warnings?: string[];
  selected_step_id?: string | null;
}

export interface ApiChatAttachmentUploadResponse {
  attachments: ApiChatAttachment[];
}

export const chatThreadsQueryKey = ["chat-threads"] as const;

export interface ApiLLMProviderInfo {
  id: string;
  name: string;
  model: string;
  available: boolean;
  requires_credential: boolean;
  is_default: boolean;
}

export interface ApiProviderModel {
  id: string;
  name: string;
  created: string;
  context_window: number | null;
  type: string;
}

export interface ApiProviderModelsResponse {
  provider: string;
  models: ApiProviderModel[];
  error: string | null;
}

export interface ApiProviderStatusResponse {
  provider: string;
  name: string;
  connected: boolean;
  current_model: string;
  has_api_key: boolean;
  base_url: string;
  rate_limits: { status: string; detail: string } | null;
  usage: Record<string, unknown> | null;
  error: string | null;
}

export const api = {
  listTemplates: () => request<ApiTemplate[]>("/api/templates"),
  getTemplate: (templateId: string) => request<ApiTemplateDetail>(`/api/templates/${templateId}`),
  listWorkflows: () => request<ApiWorkflow[]>("/api/workflows"),
  getWorkflow: (workflowId: string) => request<ApiWorkflowDetail>(`/api/workflows/${workflowId}`),
  createWorkflow: (payload: ApiWorkflowCreatePayload) =>
    request<ApiWorkflow>("/api/workflows", { method: "POST", body: JSON.stringify(payload) }),
  updateWorkflow: (workflowId: string, payload: ApiWorkflowUpdatePayload) =>
    request<ApiWorkflowDetail>(`/api/workflows/${workflowId}`, { method: "PUT", body: JSON.stringify(payload) }),
  createWorkflowFromTemplate: (templateId: string, name?: string) =>
    request<ApiWorkflow>("/api/workflows/from-template", {
      method: "POST",
      body: JSON.stringify({ template_id: templateId, name }),
    }),
  generateWorkflow: (prompt: string, name?: string) =>
    request<ApiWorkflow>("/api/workflows/generate", {
      method: "POST",
      body: JSON.stringify({ prompt, name }),
    }),
  listExecutions: () => request<ApiExecution[]>("/api/executions"),
  getVaultOverview: () => request<ApiVaultOverview>("/api/vault"),
  listVaultConnections: () => request<ApiVaultConnection[]>("/api/vault/connections"),
  listVaultCredentials: () => request<ApiVaultCredential[]>("/api/vault/credentials"),
  listVaultVariables: () => request<ApiVaultVariable[]>("/api/vault/variables"),
  getVaultAsset: (assetId: string) => request<ApiVaultAsset>(`/api/vault/assets/${assetId}`),
  createVaultAsset: (payload: {
    kind: "connection" | "credential" | "variable";
    name: string;
    app?: string | null;
    subtitle?: string | null;
    credential_type?: string | null;
    scope?: "workspace" | "staging" | "production";
    access?: string | null;
    status?: string;
    masked?: boolean;
    secret?: Record<string, unknown>;
  }) => request<Record<string, unknown>>("/api/vault/assets", { method: "POST", body: JSON.stringify(payload) }),
  updateVaultAsset: (assetId: string, payload: {
    name: string;
    app?: string | null;
    subtitle?: string | null;
    credential_type?: string | null;
    scope?: "workspace" | "staging" | "production";
    access?: string | null;
    status?: string;
    masked?: boolean;
    secret?: Record<string, unknown>;
  }) => request<Record<string, unknown>>(`/api/vault/assets/${assetId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteVaultAsset: (assetId: string) => request<void>(`/api/vault/assets/${assetId}`, { method: "DELETE" }),
  runWorkflow: (workflowId: string, payload: Record<string, unknown> = {}) =>
    request<ApiExecution>(`/api/workflows/${workflowId}/run`, {
      method: "POST",
      body: JSON.stringify({ payload }),
    }),
  getWorkflowTriggerDetails: (workflowId: string, environment?: "draft" | "staging" | "production") =>
    request<ApiTriggerDetails>(`/api/workflows/${workflowId}/trigger-details${environment ? `?environment=${environment}` : ""}`),
  triggerWorkflowWebhook: (workflowId: string, payload: Record<string, unknown> = {}) =>
    request<ApiExecution>(`/api/triggers/webhook/${workflowId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getPublicChatTriggerInfo: (workspaceId: string, workflowId: string) =>
    requestPublic<ApiPublicChatTriggerInfo>(`/api/chat/${workspaceId}/${workflowId}`),
  sendPublicChatTriggerMessage: (
    workspaceId: string,
    workflowId: string,
    payload: { message: string; session_id?: string | null; history?: Array<{ role: "assistant" | "user" | "system"; content: string }>; metadata?: Record<string, unknown> },
    init?: RequestInit,
  ) =>
    requestPublic<ApiPublicChatSendResponse>(`/api/chat/${workspaceId}/${workflowId}`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: init?.headers,
      credentials: init?.credentials,
    }),
  sendPublicChatTriggerMessageStream: (
    workspaceId: string,
    workflowId: string,
    payload: { message: string; session_id?: string | null; history?: Array<{ role: "assistant" | "user" | "system"; content: string }>; metadata?: Record<string, unknown> },
    init?: RequestInit,
    options: { onDelta?: (delta: string) => void; signal?: AbortSignal } = {},
  ) =>
    requestPublicEventStream<ApiPublicChatSendResponse>(`/api/chat/${workspaceId}/${workflowId}/stream`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: init?.headers,
      credentials: init?.credentials,
    }, options),
  runScheduledWorkflows: () =>
    request<ApiScheduledRun>("/api/system/run-scheduled", {
      method: "POST",
      body: JSON.stringify({}),
    }),

  // System status
  getSystemStatus: () => request<ApiSystemStatus>("/api/system/status"),
  getLlmStatus: () => request<ApiLlmStatus>("/api/llm/status"),

  // Sandbox
  executeSandbox: (code: string, language: string = "python", input_data: Record<string, unknown> = {}, timeout: number = 30) =>
    request<ApiSandboxResult>("/api/sandbox/execute", {
      method: "POST",
      body: JSON.stringify({ code, language, input_data, timeout }),
    }),

  // OAuth2
  listOAuth2Providers: () => request<ApiOAuth2Provider[]>("/api/oauth2/providers"),
  startOAuth2: (provider: string, client_id: string, redirect_uri: string, scopes?: string[]) =>
    request<{ authorize_url: string; state: string }>("/api/oauth2/authorize", {
      method: "POST",
      body: JSON.stringify({ provider, client_id, redirect_uri, scopes }),
    }),
  completeOAuth2: (code: string, state: string, client_secret: string) =>
    request<{ success: boolean; provider: string; message: string }>("/api/oauth2/callback", {
      method: "POST",
      body: JSON.stringify({ code, state, client_secret }),
    }),

  // Audit events
  listAuditEvents: () => request<ApiAuditEvent[]>("/api/audit-events"),

  // Execution inspector
  getExecution: (executionId: string) => request<ApiExecution>(`/api/executions/${executionId}`),
  getExecutionBundle: (executionId: string) => request<ApiExecutionBundle>(`/api/executions/${executionId}/bundle`),
  getExecutionEvents: (executionId: string) => request<ApiExecutionEvent[]>(`/api/executions/${executionId}/events`),
  getExecutionStepDetail: (executionId: string, stepId: string) => request<ApiExecutionStepInspectorResponse>(`/api/executions/${executionId}/steps/${stepId}`),
  getExecutionPause: (executionId: string) => request<ApiExecutionPauseSummary>(`/api/executions/${executionId}/pause`),
  getWorkflowStepHistory: (workflowId: string, stepId: string, limit: number = 20) => request<ApiWorkflowStepHistoryResponse>(`/api/workflows/${workflowId}/steps/${stepId}/history?limit=${limit}`),
  replayExecution: (
    executionId: string,
    payload: {
      mode?: "same_version" | "latest_published" | "current_draft";
      queued?: boolean;
      payloadOverride?: Record<string, unknown>;
    } = {},
  ) =>
    request<ApiExecutionReplayResponse>(`/api/executions/${executionId}/replay`, {
      method: "POST",
      body: JSON.stringify({
        mode: payload.mode ?? "same_version",
        queued: payload.queued ?? false,
        payload_override: payload.payloadOverride ?? {},
      }),
    }),
  resumeExecution: (
    executionId: string,
    payload: { payload?: Record<string, unknown>; decision?: string | null } = {},
  ) =>
    request<ApiExecution>(`/api/executions/${executionId}/resume`, {
      method: "POST",
      body: JSON.stringify({
        payload: payload.payload ?? {},
        decision: payload.decision ?? null,
      }),
    }),
  completeHumanTask: (
    taskId: string,
    payload: { decision: string; comment?: string | null; payload?: Record<string, unknown> },
  ) =>
    request<ApiExecution>(`/api/inbox/tasks/${taskId}/complete`, {
      method: "POST",
      body: JSON.stringify({
        decision: payload.decision,
        comment: payload.comment ?? null,
        payload: payload.payload ?? {},
      }),
    }),
  cancelHumanTask: (taskId: string, comment?: string | null) =>
    request<ApiExecution>(`/api/inbox/tasks/${taskId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ comment: comment ?? null }),
    }),

  // Workflow import/export
  exportWorkflow: (workflowId: string) => request<ApiWorkflowExportBundle>(`/api/workflows/${workflowId}/export`),
  importWorkflow: (bundle: Record<string, unknown>, nameOverride?: string) =>
    request<ApiWorkflowImportResponse>("/api/workflows/import", {
      method: "POST",
      body: JSON.stringify({ bundle, name_override: nameOverride }),
    }),

  // Deep health
  getDeepHealth: () => request<ApiDeepHealth>("/api/health/deep"),

  // Step-level test
  testStep: (workflowId: string, step: ApiWorkflowStep, payload: Record<string, unknown> = {}) =>
    request<{ status: string; output: Record<string, unknown> | null; error: string | null; duration_ms: number }>(
      `/api/workflows/${workflowId}/test-step`,
      { method: "POST", body: JSON.stringify({ step, payload }) },
    ),

  // Workflow versions
  listWorkflowVersions: (workflowId: string) =>
    request<ApiWorkflowVersionSummary[]>(`/api/workflows/${workflowId}/versions`),
  getWorkflowVersion: (workflowId: string, versionId: string) =>
    request<ApiWorkflowVersionDetail>(`/api/workflows/${workflowId}/versions/${versionId}`),
  createWorkflowVersion: (workflowId: string, notes?: string) =>
    request<ApiWorkflowVersionSummary>(`/api/workflows/${workflowId}/versions`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),
  listDeploymentReviews: (status?: "pending" | "approved" | "rejected" | "cancelled") =>
    request<ApiWorkflowDeploymentReviewSummary[]>(`/api/deployment-reviews${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  approveDeploymentReview: (reviewId: string, comment?: string) =>
    request<ApiWorkflowDeploymentSummary>(`/api/deployment-reviews/${reviewId}/approve`, {
      method: "POST",
      body: JSON.stringify({ comment: comment?.trim() || null }),
    }),
  rejectDeploymentReview: (reviewId: string, comment?: string) =>
    request<ApiWorkflowDeploymentReviewSummary>(`/api/deployment-reviews/${reviewId}/reject`, {
      method: "POST",
      body: JSON.stringify({ comment: comment?.trim() || null }),
    }),
  publishWorkflow: (workflowId: string, notes?: string) =>
    request<ApiWorkflowVersionSummary>(`/api/workflows/${workflowId}/publish`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),
  promoteWorkflow: (workflowId: string, targetEnvironment: "staging" | "production", notes?: string) =>
    request<ApiWorkflowVersionSummary>(`/api/workflows/${workflowId}/promote`, {
      method: "POST",
      body: JSON.stringify({ target_environment: targetEnvironment, notes }),
    }),

  // Delete operations
  deleteWorkflow: (workflowId: string) =>
    request<void>(`/api/workflows/${workflowId}`, { method: "DELETE" }),
  deleteExecution: (executionId: string) =>
    request<void>(`/api/executions/${executionId}`, { method: "DELETE" }),

  // Execution retry/cancel
  retryExecution: (executionId: string) =>
    request<ApiExecution>(`/api/executions/${executionId}/retry`, { method: "POST" }),
  cancelExecution: (executionId: string) =>
    request<ApiExecution>(`/api/executions/${executionId}/cancel`, { method: "POST" }),

  // Assistant chat
  assistantChat: (payload: {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    workflow_id?: string;
    workflow_name?: string;
    step_count?: number;
    attachment_ids?: string[];
  }) =>
    request<ApiAssistantChatResponse>("/api/assistant/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  assistantChatStream: (
    payload: {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      workflow_id?: string;
      workflow_name?: string;
      step_count?: number;
      attachment_ids?: string[];
    },
    options: { onDelta?: (delta: string) => void; signal?: AbortSignal } = {},
  ) =>
    requestEventStream<ApiAssistantChatResponse>("/api/assistant/chat/stream", {
      method: "POST",
      body: JSON.stringify(payload),
    }, options),

  // Assistant extend workflow (add steps via AI)
  assistantExtendWorkflow: (workflowId: string, prompt: string, save = true) =>
    request<{
      workflow_id: string;
      prompt: string;
      added_steps: ApiWorkflowStep[];
      definition: { steps: ApiWorkflowStep[]; edges: ApiWorkflowEdge[]; settings?: ApiWorkflowSettings };
      warnings: string[];
      workflow: ApiWorkflow | null;
    }>(`/api/assistant/workflows/${workflowId}/extend`, {
      method: "POST",
      body: JSON.stringify({ prompt, save }),
    }),
  getAssistantWorkflowSummary: (workflowId: string) =>
    request<ApiAssistantWorkflowSummaryResponse>(`/api/assistant/workflows/${workflowId}/summarize`),

  // Bulk operations
  bulkDeleteWorkflows: (ids: string[]) =>
    request<{ deleted: number; errors: string[] }>("/api/workflows/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  bulkDeleteVaultAssets: (ids: string[]) =>
    request<{ deleted: number; errors: string[] }>("/api/vault/assets/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  bulkDeleteExecutions: (ids: string[]) =>
    request<{ deleted: number; errors: string[] }>("/api/executions/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  // Plugins
  listPlugins: () => request<Array<Record<string, unknown>>>("/api/studio/plugins"),

  // Studio node definitions (field schemas)
  listNodeDefinitions: () =>
    request<ApiNodeDefinition[]>("/api/studio/nodes"),
  getStudioCatalog: () =>
    request<ApiNodeCatalogResponse>("/api/studio/catalog"),
  getNodeDefinition: (nodeType: string) =>
    request<ApiNodeDefinition>(`/api/studio/nodes/${nodeType}`),
  draftStudioNode: (payload: {
    nodeType: string;
    name?: string;
    triggerType?: string;
    config?: Record<string, unknown>;
  }) =>
    request<ApiNodeDraftResponse>("/api/studio/nodes/draft", {
      method: "POST",
      body: JSON.stringify({
        node_type: payload.nodeType,
        name: payload.name,
        trigger_type: payload.triggerType,
        config: payload.config ?? {},
      }),
    }),
  getStudioNodeEditor: (nodeType: string, params?: { triggerType?: string; workflowId?: string; stepId?: string }) => {
    const search = new URLSearchParams();
    if (params?.triggerType) search.set('trigger_type', params.triggerType);
    if (params?.workflowId) search.set('workflow_id', params.workflowId);
    if (params?.stepId) search.set('step_id', params.stepId);
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return request<ApiNodeEditorResponse>(`/api/studio/nodes/${nodeType}/editor${suffix}`);
  },
  previewStudioNode: (payload: { step: ApiWorkflowStep; triggerType?: string }) =>
    request<ApiNodePreviewResponse>('/api/studio/nodes/preview', {
      method: 'POST',
      body: JSON.stringify({ step: payload.step, trigger_type: payload.triggerType }),
    }),
  validateStudioNode: (nodeType: string, payload: { config: Record<string, unknown>; triggerType?: string; name?: string }) =>
    request<ApiNodeConfigValidationResponse>(`/api/studio/nodes/${nodeType}/validate`, {
      method: 'POST',
      body: JSON.stringify({ config: payload.config, trigger_type: payload.triggerType, name: payload.name }),
    }),
  validateStudioWorkflowStep: (
    workflowId: string,
    stepId: string,
    payload?: { config?: Record<string, unknown>; triggerType?: string; name?: string },
  ) =>
    request<ApiNodeConfigValidationResponse>(`/api/studio/workflows/${workflowId}/steps/${stepId}/validate`, {
      method: 'POST',
      body: payload ? JSON.stringify({
        config: payload.config ?? {},
        trigger_type: payload.triggerType,
        name: payload.name,
      }) : undefined,
    }),
  testStudioNode: (nodeType: string, payload: { config: Record<string, unknown>; triggerType?: string; name?: string; runPayload?: Record<string, unknown> }) =>
    request<ApiNodeConfigTestResponse>(`/api/studio/nodes/${nodeType}/test`, {
      method: 'POST',
      body: JSON.stringify({
        config: payload.config,
        trigger_type: payload.triggerType,
        name: payload.name,
        payload: payload.runPayload ?? {},
      }),
    }),
  studioTestStep: (workflowId: string, stepId: string, payload: Record<string, unknown> = {}) =>
    request<ApiStudioStepTestResponse>(`/api/studio/workflows/${workflowId}/steps/${stepId}/test`, {
      method: "POST",
      body: JSON.stringify({ payload }),
    }),

  // Integration catalog
  listIntegrations: () => request<{ apps: ApiIntegrationApp[] }>("/api/studio/integrations"),
  getIntegration: (appKey: string) => request<ApiIntegrationApp>(`/api/studio/integrations/${appKey}`),

  // Global search
  search: (query: string) =>
    request<ApiSearchResults>(`/api/search?q=${encodeURIComponent(query)}`),

  // Execution SSE stream
  streamExecution: (executionId: string): EventSource => {
    return new EventSource(`${API_BASE}/api/executions/${executionId}/stream`);
  },

  // Notifications
  listNotifications: () =>
    request<{ items: ApiNotification[]; unread_count: number }>("/api/notifications"),
  createNotification: (payload: { title: string; body?: string; kind?: string; link?: string }) =>
    request<ApiNotification>("/api/notifications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  markNotificationRead: (notificationId: string) =>
    request<void>(`/api/notifications/${notificationId}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () =>
    request<void>("/api/notifications/read-all", { method: "POST" }),

  // Workspace settings
  getWorkspaceSettings: () =>
    request<ApiWorkspaceSettings>("/api/workspaces/current/settings"),
  updateWorkspaceSettings: (payload: ApiWorkspaceSettingsUpdate) =>
    request<ApiWorkspaceSettings>("/api/workspaces/current/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Workspace members
  getWorkspaceMembers: () =>
    request<ApiWorkspaceMember[]>("/api/workspaces/current/members"),
  inviteWorkspaceMember: (email: string, role: string) =>
    request<ApiWorkspaceMember>("/api/workspaces/current/members/invite", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  updateWorkspaceMemberRole: (userId: string, role: Exclude<ApiWorkspaceRole, "owner">) =>
    request<ApiWorkspaceMember>(`/api/workspaces/current/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeWorkspaceMember: (userId: string) =>
    request<void>(`/api/workspaces/current/members/${userId}`, { method: "DELETE" }),

  // Workspace info
  getCurrentWorkspace: () =>
    request<ApiWorkspaceSummary>("/api/workspaces/current"),

  // Auth
  authSignup: (name: string, email: string, password: string) =>
    request<AuthTokenResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  authLogin: (email: string, password: string) =>
    request<AuthTokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  authGetSession: () =>
    request<{ user: AuthSession["user"]; workspace: AuthSession["workspace"] }>("/api/session"),
  listHelpArticles: (category?: string, query?: string) =>
    request<ApiHelpArticle[]>(`/api/help/articles${category || query ? `?${new URLSearchParams({ ...(category ? { category } : {}), ...(query ? { q: query } : {}) }).toString()}` : ""}`),
  getVaultAssetHealth: (assetId: string) =>
    request<{ asset_id: string; healthy: boolean; checks: Array<{ code: string; label: string; passed: boolean; severity: string; message: string }> }>(`/api/vault/assets/${assetId}/health`),
  verifyVaultAsset: (assetId: string) =>
    request<{ asset_id: string; verified: boolean; checks: Array<{ code: string; label: string; passed: boolean; severity: string; message: string }>; next_steps: string[] }>(`/api/vault/assets/${assetId}/verify`, { method: "POST" }),
  refreshOAuth2: (provider: string, refresh_token: string, client_id: string, client_secret: string) =>
    request<{ success: boolean; provider: string; message: string }>("/api/oauth2/refresh", {
      method: "POST",
      body: JSON.stringify({ provider, refresh_token, client_id, client_secret }),
    }),

  // Chat threads
  listChatThreads: () =>
    request<ApiChatThreadListResponse>("/api/chat/threads"),
  createChatThread: (payload: { title?: string; model?: string; initial_message?: string; attachment_ids?: string[] }) =>
    request<ApiChatThreadDetail>("/api/chat/threads", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getChatThread: (threadId: string) =>
    request<ApiChatThreadDetail>(`/api/chat/threads/${threadId}`),
  updateChatThread: (threadId: string, payload: { title?: string; pinned?: boolean }) =>
    request<ApiChatThreadDetail>(`/api/chat/threads/${threadId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteChatThread: (threadId: string) =>
    request<void>(`/api/chat/threads/${threadId}`, { method: "DELETE" }),
  sendChatMessage: (threadId: string, message: string, model?: string, attachmentIds: string[] = []) =>
    request<ApiChatSendResponse>(`/api/chat/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message, model: model || "", attachment_ids: attachmentIds }),
    }),
  sendChatMessageStream: (
    threadId: string,
    message: string,
    model?: string,
    attachmentIds: string[] = [],
    options: { onDelta?: (delta: string) => void; signal?: AbortSignal } = {},
  ) =>
    requestEventStream<ApiChatSendResponse>(`/api/chat/threads/${threadId}/messages/stream`, {
      method: "POST",
      body: JSON.stringify({ message, model: model || "", attachment_ids: attachmentIds }),
    }, options),
  uploadChatAttachments: (files: File[]) => {
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    return request<ApiChatAttachmentUploadResponse>("/api/chat/attachments", {
      method: "POST",
      body,
    });
  },
  downloadChatAttachment: async (attachmentId: string) => {
    const headers = new Headers();
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const response = await fetch(`${API_BASE}/api/chat/attachments/${attachmentId}`, {
      signal: AbortSignal.timeout(20_000),
      headers,
    });
    if (!response.ok) {
      throw new Error(`Attachment download failed: ${response.status}`);
    }
    return response.blob();
  },
  listChatModels: () =>
    request<ApiLLMProviderInfo[]>("/api/chat/models"),
  listProviderModels: (providerId: string) =>
    request<ApiProviderModelsResponse>(`/api/chat/providers/${providerId}/models`),
  getProviderStatus: (providerId: string) =>
    request<ApiProviderStatusResponse>(`/api/chat/providers/${providerId}/status`),
};
