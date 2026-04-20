/**
 * FlowHolt API client — centralized fetch wrapper with auth, error handling,
 * and typed endpoint helpers.
 *
 * Backend runs on :8001, Vite proxies /api → backend in dev.
 */

// ---------------------------------------------------------------------------
// Types mirroring backend Pydantic models
// ---------------------------------------------------------------------------

export type WorkflowStatus = "active" | "draft" | "paused";
export type ExecutionStatus = "success" | "failed" | "running" | "paused" | "cancelled";
export type StepStatus = "success" | "failed" | "skipped" | "running" | "paused" | "cancelled";
export type WorkspaceRole = "owner" | "admin" | "builder" | "viewer";
export type ExecutionEnvironment = "draft" | "staging" | "production";

export interface WorkflowSummary {
  id: string;
  name: string;
  status: WorkflowStatus;
  trigger_type: string;
  category: string;
  success_rate: number;
  created_at: string;
  last_run_at: string | null;
  template_id: string | null;
  current_version_number: number;
  published_version_id: string | null;
}

export interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label: string | null;
}

export interface WorkflowDefinition {
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  settings: Record<string, unknown>;
}

export interface WorkflowDetail extends WorkflowSummary {
  definition: WorkflowDefinition;
}

export interface ExecutionStepResult {
  step_id: string | null;
  step_type: string | null;
  name: string;
  status: StepStatus;
  duration_ms: number;
  output: Record<string, unknown> | null;
  pinned_data_used: boolean;
}

export interface ExecutionSummary {
  id: string;
  workflow_id: string;
  workflow_version_id: string | null;
  workflow_name: string;
  environment: ExecutionEnvironment;
  status: ExecutionStatus;
  trigger_type: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  error_text: string | null;
  steps: ExecutionStepResult[];
}

export interface NodeDefinitionSummary {
  type: string;
  label: string;
  category: string;
  description: string;
  icon: string;
  supports_branches: boolean;
  fields: unknown[];
}

export interface NodeCatalogGroup {
  id: string;
  label: string;
  description: string | null;
  node_types: string[];
  count: number;
}

export interface NodeCatalogResponse {
  groups: NodeCatalogGroup[];
  nodes: NodeDefinitionSummary[];
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar_initials: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: WorkspaceRole;
  members_count: number;
}

export interface SessionResponse {
  user: UserSummary;
  workspace: WorkspaceSummary;
}

export interface AuthSessionTokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_at: number;
  session: SessionResponse;
}

export interface HealthResponse {
  status: string;
  environment: string;
  llm_mode: string;
  database_backend: string;
}

// ---------------------------------------------------------------------------
// API Error
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public raw?: unknown,
  ) {
    super(`API ${status}: ${detail}`);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

const TOKEN_KEY = "flowholt_token";
const SESSION_KEY = "flowholt_session";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredSession(): SessionResponse | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: SessionResponse): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch { /* noop */ }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export async function devLogin(userId: string, workspaceId?: string) {
  const res = await apiFetch<AuthSessionTokenResponse>("/api/auth/dev-login", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, workspace_id: workspaceId ?? null }),
  });
  setToken(res.access_token);
  setStoredSession(res.session);
  return res;
}

export async function signup(email: string, password: string, name: string) {
  const res = await apiFetch<AuthSessionTokenResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  setToken(res.access_token);
  setStoredSession(res.session);
  return res;
}

export async function login(email: string, password: string) {
  const res = await apiFetch<AuthSessionTokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.access_token);
  setStoredSession(res.session);
  return res;
}

export function logout() {
  clearToken();
  window.location.hash = "#/auth/login";
}

// ---------------------------------------------------------------------------
// Workflow endpoints
// ---------------------------------------------------------------------------

export function fetchWorkflows(params?: { limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const query = qs.toString();
  return apiFetch<WorkflowSummary[]>(`/api/workflows${query ? `?${query}` : ""}`);
}

export function fetchWorkflow(id: string) {
  return apiFetch<WorkflowDetail>(`/api/workflows/${id}`);
}

export interface WorkflowCreatePayload {
  name: string;
  trigger_type?: string;
  category?: string;
  status?: WorkflowStatus;
  template_id?: string | null;
  definition: WorkflowDefinition;
}

export interface WorkflowUpdatePayload {
  name: string;
  trigger_type: string;
  category?: string;
  status: WorkflowStatus;
  definition: WorkflowDefinition;
}

export function createWorkflow(payload: WorkflowCreatePayload) {
  return apiFetch<WorkflowSummary>("/api/workflows", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateWorkflow(id: string, payload: WorkflowUpdatePayload) {
  return apiFetch<WorkflowDetail>(`/api/workflows/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteWorkflow(id: string) {
  return apiFetch<void>(`/api/workflows/${id}`, { method: "DELETE" });
}

export function runWorkflow(id: string, payload: Record<string, unknown> = {}, environment: ExecutionEnvironment = "draft", pinnedData?: Record<string, unknown>) {
  return apiFetch<ExecutionSummary>(`/api/workflows/${id}/run`, {
    method: "POST",
    body: JSON.stringify({ payload, environment, pinned_data: pinnedData }),
  });
}

export function publishWorkflow(id: string, notes?: string) {
  return apiFetch<WorkflowVersionSummary>(`/api/workflows/${id}/publish`, {
    method: "POST",
    body: JSON.stringify({ notes: notes ?? null }),
  });
}

export interface WorkflowVersionSummary {
  id: string;
  workflow_id: string;
  version_number: number;
  status: string;
  created_at: string;
}

export interface WorkflowJobSummary {
  id: string;
  workflow_id: string;
  status: string;
  trigger_type: string;
  created_at: string;
}

export function queueWorkflowRun(id: string, payload: Record<string, unknown> = {}, environment: ExecutionEnvironment = "draft") {
  return apiFetch<WorkflowJobSummary>(`/api/workflows/${id}/queue-run`, {
    method: "POST",
    body: JSON.stringify({ payload, environment }),
  });
}

// ---------------------------------------------------------------------------
// Execution endpoints
// ---------------------------------------------------------------------------

export function fetchExecutions(params?: { limit?: number; offset?: number; status?: ExecutionStatus }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  return apiFetch<ExecutionSummary[]>(`/api/executions${query ? `?${query}` : ""}`);
}

export function fetchExecution(id: string) {
  return apiFetch<ExecutionSummary>(`/api/executions/${id}`);
}

export function retryExecution(id: string) {
  return apiFetch<WorkflowJobSummary>(`/api/executions/${id}/retry`, { method: "POST" });
}

export function deleteExecution(id: string) {
  return apiFetch<void>(`/api/executions/${id}`, { method: "DELETE" });
}

export function fetchWorkflowExecutions(workflowId: string, params?: { limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetch<ExecutionSummary[]>(`/api/workflows/${workflowId}/executions${query ? `?${query}` : ""}`);
}

// ---------------------------------------------------------------------------
// Studio endpoints
// ---------------------------------------------------------------------------

export function fetchNodeCatalog() {
  return apiFetch<NodeCatalogResponse>("/api/studio/catalog");
}

export function fetchNodeDefinitions() {
  return apiFetch<NodeDefinitionSummary[]>("/api/studio/nodes");
}

export function fetchNodeDefinition(nodeType: string) {
  return apiFetch<NodeDefinitionSummary>(`/api/studio/nodes/${nodeType}`);
}

export function fetchNodeEditor(nodeType: string, opts?: { workflowId?: string; stepId?: string; triggerType?: string }) {
  const params = new URLSearchParams();
  if (opts?.workflowId) params.set("workflow_id", opts.workflowId);
  if (opts?.stepId) params.set("step_id", opts.stepId);
  if (opts?.triggerType) params.set("trigger_type", opts.triggerType);
  const qs = params.toString();
  return apiFetch<NodeEditorResponse>(`/api/studio/nodes/${nodeType}/editor${qs ? `?${qs}` : ""}`);
}

// Studio bundle — loads entire workflow + catalog + editors in one call
export interface StudioStepEditorEntry {
  step_id: string;
  editor: NodeEditorResponse;
}

export interface WorkflowValidationResponse {
  valid: boolean;
  errors: { step_id: string | null; message: string; severity: string }[];
  warnings: { step_id: string | null; message: string; severity: string }[];
}

export interface NodeEditorField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  default?: unknown;
  options?: { value: string; label: string }[];
  help?: string;
  placeholder?: string;
  depends_on?: Record<string, unknown>;
}

export interface NodeEditorSection {
  key: string;
  label: string;
  fields: NodeEditorField[];
  collapsed?: boolean;
}

export interface NodeEditorResponse {
  node_type: string;
  label: string;
  description: string;
  icon: string;
  step_name_default: string;
  sections: NodeEditorSection[];
  node_settings: NodeEditorSection[];
  warnings: string[];
  sample_output: Record<string, unknown>;
}

export interface StudioWorkflowBundle {
  workflow: WorkflowDetail;
  integrity: WorkflowValidationResponse;
  catalog: NodeCatalogResponse;
  selected_step_editor: NodeEditorResponse | null;
  step_editors: StudioStepEditorEntry[];
}

export function fetchStudioBundle(workflowId: string, stepId?: string) {
  const qs = stepId ? `?selected_step_id=${stepId}` : "";
  return apiFetch<StudioWorkflowBundle>(`/api/studio/workflows/${workflowId}/bundle${qs}`);
}

export function fetchStepEditor(workflowId: string, stepId: string) {
  return apiFetch<NodeEditorResponse>(`/api/studio/workflows/${workflowId}/steps/${stepId}/editor`);
}

export interface StudioInsertStepPayload {
  node_type: string;
  name?: string;
  config?: Record<string, unknown>;
  after_step_id?: string;
  branch_label?: "default" | "true" | "false";
  connect_to_step_id?: string;
}

export function insertWorkflowStep(workflowId: string, payload: StudioInsertStepPayload) {
  return apiFetch<StudioWorkflowBundle>(`/api/studio/workflows/${workflowId}/steps/insert`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface StudioUpdateStepPayload {
  name?: string;
  config?: Record<string, unknown>;
  replace_config?: boolean;
}

export function updateWorkflowStep(workflowId: string, stepId: string, payload: StudioUpdateStepPayload) {
  return apiFetch<StudioWorkflowBundle>(`/api/studio/workflows/${workflowId}/steps/${stepId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export interface TestStepPayload {
  step_id: string;
  payload?: Record<string, unknown>;
}

export interface TestStepResponse {
  status: string;
  output: Record<string, unknown> | null;
  error: string | null;
  duration_ms: number;
}

export function testWorkflowStep(workflowId: string, payload: TestStepPayload) {
  return apiFetch<TestStepResponse>(`/api/workflows/${workflowId}/test-step`, {
    method: "POST",
    body: JSON.stringify({ step: payload.step_id, payload: payload.payload ?? {} }),
  });
}

// ---------------------------------------------------------------------------
// System endpoints
// ---------------------------------------------------------------------------

export function fetchHealth() {
  return apiFetch<HealthResponse>("/health");
}

// ---------------------------------------------------------------------------
// Workspace endpoints
// ---------------------------------------------------------------------------

export function fetchWorkspaces() {
  return apiFetch<WorkspaceSummary[]>("/api/workspaces");
}

// ---------------------------------------------------------------------------
// Assistant / AI endpoints
// ---------------------------------------------------------------------------

export interface AssistantDraftRequest {
  prompt: string;
  template_id?: string | null;
}

export interface AssistantDraftResponse {
  workflow_definition: WorkflowDefinition;
  template_match?: { template_id: string; name: string; score: number } | null;
  validation_issues: { field: string; message: string; severity: string }[];
  repair_actions: string[];
}

export interface AssistantCapabilities {
  models: string[];
  tools: string[];
  max_steps: number;
}

export function draftWorkflowWithAI(payload: AssistantDraftRequest) {
  return apiFetch<AssistantDraftResponse>("/api/assistant/draft-workflow", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAssistantCapabilities() {
  return apiFetch<AssistantCapabilities>("/api/assistant/capabilities");
}

// Copilot chat SSE streaming
export interface CopilotChatPayload {
  messages: { role: string; content: string }[];
  model?: string;
  mode?: string;
  workflow_id?: string;
  node_context?: string;
}

export async function* streamCopilotChat(payload: CopilotChatPayload): AsyncGenerator<{ type: string; content?: string }> {
  const resp = await fetch(`/api/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`Copilot chat failed: ${resp.status}`);
  const reader = resp.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          yield JSON.parse(line.slice(6));
        } catch { /* skip malformed */ }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Global Search
// ---------------------------------------------------------------------------

export interface SearchResults {
  workflows: { id: string; name: string; status: string; category: string }[];
  executions: { id: string; workflow_name: string; status: string; started_at: string }[];
  vault_assets: { id: string; name: string; kind: string }[];
}

export function globalSearch(query: string) {
  return apiFetch<SearchResults>(`/api/system/search?q=${encodeURIComponent(query)}`);
}

// ---------------------------------------------------------------------------
// Template endpoints
// ---------------------------------------------------------------------------

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  node_count: number;
  use_count: number;
  tags?: string[];
  is_featured?: boolean;
}

export function fetchTemplates() {
  return apiFetch<TemplateSummary[]>("/api/templates");
}

export interface TemplateDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  definition: WorkflowDefinition;
  credentials_required: { service: string; required: boolean }[];
  author: string;
  rating: number;
  use_count: number;
}

export function fetchTemplate(templateId: string) {
  return apiFetch<TemplateDetail>(`/api/templates/${templateId}`);
}

export function instantiateTemplate(templateId: string, config: { name: string; folder?: string }) {
  return apiFetch<WorkflowSummary>("/api/workflows", {
    method: "POST",
    body: JSON.stringify({ name: config.name, template_id: templateId, trigger_type: "manual", category: "Custom", status: "draft", definition: {} }),
  });
}

// ---------------------------------------------------------------------------
// Notification endpoints
// ---------------------------------------------------------------------------

export interface NotificationItem {
  id: string;
  type: string;
  severity: "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  related_id?: string;
  action_url?: string;
}

export function fetchNotifications(params?: { limit?: number; offset?: number; read?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  if (params?.read !== undefined) qs.set("read", String(params.read));
  const q = qs.toString();
  return apiFetch<NotificationItem[]>(`/api/notifications${q ? `?${q}` : ""}`);
}

export function markNotificationRead(id: string) {
  return apiFetch<NotificationItem>(`/api/notifications/${id}/read`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Webhook endpoints
// ---------------------------------------------------------------------------

export interface WebhookEndpoint {
  id: string;
  workflow_id: string;
  path: string;
  method: string;
  auth_type: string;
  auth_config: Record<string, unknown>;
  rate_limit_max: number;
  rate_limit_window_sec: number;
  signing_secret?: string | null;
  ip_whitelist?: string | null;
  cors_origins?: string;
  respond_mode?: "immediately" | "last_node" | "respond_node";
  response_status?: number;
  response_headers?: Record<string, string>;
  response_body?: string | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  execution_id: string | null;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string | null;
  query_params: Record<string, string>;
  source_ip: string | null;
  status_code: number;
  response_body: string | null;
  latency_ms: number;
  created_at: string;
}

export interface WebhookQueueItem {
  id: string;
  webhook_id: string;
  delivery_id: string;
  payload: string;
  priority: number;
  attempts: number;
  max_retries: number;
  next_retry_at: string | null;
  status: "pending" | "processing" | "completed" | "dead_letter";
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface PollingTrigger {
  id: string;
  workflow_id: string;
  name: string;
  url: string;
  method: string;
  headers_json: Record<string, string>;
  auth_type: string;
  auth_config_json: Record<string, unknown>;
  interval_seconds: number;
  last_polled_at: string | null;
  last_cursor: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InternalEvent {
  id: string;
  workspace_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  source_workflow_id: string | null;
  created_at: string;
}

export function fetchWebhookEndpoints() {
  return apiFetch<WebhookEndpoint[]>("/api/webhooks");
}

export function fetchWebhookEndpoint(id: string) {
  return apiFetch<WebhookEndpoint>(`/api/webhooks/${id}`);
}

export function createWebhookEndpoint(payload: Record<string, unknown>) {
  return apiFetch<WebhookEndpoint>("/api/webhooks", { method: "POST", body: JSON.stringify(payload) });
}

export function updateWebhookEndpoint(id: string, payload: Partial<WebhookEndpoint>) {
  return apiFetch<WebhookEndpoint>(`/api/webhooks/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteWebhookEndpoint(id: string) {
  return apiFetch<void>(`/api/webhooks/${id}`, { method: "DELETE" });
}

export function fetchWebhookDeliveries(webhookId: string, limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<WebhookDelivery[]>(`/api/webhooks/${webhookId}/deliveries${qs}`);
}

export function fetchWebhookQueue(status?: string, webhookId?: string, limit?: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (webhookId) params.set("webhook_id", webhookId);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<WebhookQueueItem[]>(`/api/webhooks/queue/items${qs}`);
}

export function retryQueueItem(queueId: string) {
  return apiFetch<WebhookQueueItem>(`/api/webhooks/queue/${queueId}/retry`, { method: "POST" });
}

export function dropQueueItem(queueId: string) {
  return apiFetch<void>(`/api/webhooks/queue/${queueId}`, { method: "DELETE" });
}

export function fetchPollingTriggers() {
  return apiFetch<PollingTrigger[]>("/api/polling-triggers");
}

export function createPollingTrigger(payload: Record<string, unknown>) {
  return apiFetch<PollingTrigger>("/api/polling-triggers", { method: "POST", body: JSON.stringify(payload) });
}

export function updatePollingTrigger(id: string, payload: Partial<PollingTrigger>) {
  return apiFetch<PollingTrigger>(`/api/polling-triggers/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deletePollingTrigger(id: string) {
  return apiFetch<void>(`/api/polling-triggers/${id}`, { method: "DELETE" });
}

export function emitInternalEvent(payload: { event_type: string; payload?: Record<string, unknown>; source_workflow_id?: string }) {
  return apiFetch<InternalEvent>("/api/events/emit", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchInternalEvents(eventType?: string, limit?: number) {
  const params = new URLSearchParams();
  if (eventType) params.set("event_type", eventType);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<InternalEvent[]>(`/api/events${qs}`);
}

// Webhook test
export function testWebhook(id: string) {
  return apiFetch<{ delivery_id: string; webhook_id: string; test_payload: Record<string, unknown>; status: string }>(`/api/webhooks/${id}/test`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Consecutive Error Tracking
// ---------------------------------------------------------------------------

export interface WorkflowErrorInfo {
  workflow_id: string;
  consecutive_errors: number;
  count?: number;
  last_error?: string;
  last_error_at?: string;
  auto_deactivated?: boolean;
}

export function fetchWorkflowErrors(workflowId: string) {
  return apiFetch<WorkflowErrorInfo>(`/api/workflows/${workflowId}/errors`);
}

export function resetWorkflowErrors(workflowId: string) {
  return apiFetch<{ status: string }>(`/api/workflows/${workflowId}/errors/reset`, { method: "POST" });
}

export function fetchErrorTrackedWorkflows() {
  return apiFetch<WorkflowErrorInfo[]>(`/api/error-tracked-workflows`);
}

// ---------------------------------------------------------------------------
// Incomplete Execution Retry
// ---------------------------------------------------------------------------

export interface IncompleteExecution {
  id: string;
  execution_id: string;
  workflow_id: string;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  status: "pending" | "resolved" | "exhausted";
  error_message: string | null;
  saved_state_json?: string;
  created_at: string;
  updated_at: string;
}

export function fetchIncompleteExecutions(opts?: { workflow_id?: string; status?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (opts?.workflow_id) params.set("workflow_id", opts.workflow_id);
  if (opts?.status) params.set("status", opts.status);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<IncompleteExecution[]>(`/api/incomplete-executions${qs}`);
}

export function resolveIncompleteExecution(id: string) {
  return apiFetch<IncompleteExecution>(`/api/incomplete-executions/${id}/resolve`, { method: "POST" });
}

export function deleteIncompleteExecution(id: string) {
  return apiFetch<void>(`/api/incomplete-executions/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Human Task / Inbox endpoints
// ---------------------------------------------------------------------------

export interface HumanTaskSummary {
  id: string;
  workflow_id: string;
  execution_id: string;
  node_id: string;
  node_name: string;
  workflow_name: string;
  task_type: "approval" | "form" | "confirmation";
  assigned_to: string | null;
  created_at: string;
  expires_at: string | null;
  status: "active" | "completed" | "expired";
  priority: "high" | "medium" | "low";
  payload: Record<string, unknown>;
  previous_node_output: Record<string, unknown>;
}

export interface HumanTaskCompleteRequest {
  decision: "approve" | "reject" | "complete";
  form_values?: Record<string, unknown>;
  comment?: string;
}

export function fetchHumanTasks(params?: { mine?: boolean; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.mine) qs.set("mine", "true");
  if (params?.status) qs.set("status", params.status);
  const q = qs.toString();
  return apiFetch<HumanTaskSummary[]>(`/api/inbox/tasks${q ? `?${q}` : ""}`);
}

export function fetchHumanTask(taskId: string) {
  return apiFetch<HumanTaskSummary>(`/api/inbox/tasks/${taskId}`);
}

export function completeHumanTask(taskId: string, payload: HumanTaskCompleteRequest) {
  return apiFetch<ExecutionSummary>(`/api/inbox/tasks/${taskId}/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Agent types & endpoints
// ---------------------------------------------------------------------------

export type AgentStatus = "active" | "draft" | "disabled";
export type AgentType = "tools_agent" | "conversational" | "react" | "plan_and_execute" | "custom";

export interface AgentToolConfig {
  name: string;
  type: string;
  description: string;
  config: Record<string, unknown>;
}

export interface AgentMemoryConfig {
  enabled: boolean;
  type: string;
  window_size: number;
  session_key: string;
}

export interface AgentModelConfig {
  provider: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_message: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  description: string;
  agent_type: AgentType;
  status: AgentStatus;
  icon: string;
  color: string;
  tools_count: number;
  created_at: string;
  updated_at: string;
}

export interface AgentDetail extends AgentSummary {
  tools: AgentToolConfig[];
  memory: AgentMemoryConfig;
  model_config_data: AgentModelConfig;
  max_iterations: number;
}

export interface AgentCreate {
  name: string;
  description?: string;
  agent_type?: AgentType;
  status?: AgentStatus;
  tools?: AgentToolConfig[];
  memory?: Partial<AgentMemoryConfig>;
  model_config_data?: Partial<AgentModelConfig>;
  max_iterations?: number;
  icon?: string;
  color?: string;
}

export interface AgentUpdate {
  name?: string;
  description?: string;
  agent_type?: AgentType;
  status?: AgentStatus;
  tools?: AgentToolConfig[];
  memory?: Partial<AgentMemoryConfig>;
  model_config_data?: Partial<AgentModelConfig>;
  max_iterations?: number;
  icon?: string;
  color?: string;
}

export interface AgentChatRequest {
  message: string;
  session_key?: string;
  thread_id?: string;
  context?: Record<string, unknown>;
}

export interface AgentChatResponse {
  answer: string;
  agent_type: string;
  iterations: number;
  tools_used: string[];
  thread_id?: string;
}

export function fetchAgents() {
  return apiFetch<AgentSummary[]>("/api/agents");
}

export function fetchAgent(agentId: string) {
  return apiFetch<AgentDetail>(`/api/agents/${agentId}`);
}

export function createAgent(payload: AgentCreate) {
  return apiFetch<AgentDetail>("/api/agents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAgent(agentId: string, payload: AgentUpdate) {
  return apiFetch<AgentDetail>(`/api/agents/${agentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAgent(agentId: string) {
  return apiFetch<void>(`/api/agents/${agentId}`, { method: "DELETE" });
}

export function chatWithAgent(agentId: string, payload: AgentChatRequest) {
  return apiFetch<AgentChatResponse>(`/api/agents/${agentId}/chat`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


// ── Chat Threads ──

export interface ChatThread {
  id: string;
  agent_id: string;
  resource_id: string;
  title: string | null;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_json: Record<string, unknown> | null;
  created_at: string;
}

export function fetchAgentThreads(agentId: string) {
  return apiFetch<ChatThread[]>(`/api/agents/${agentId}/threads`);
}

export function createAgentThread(agentId: string, title?: string) {
  return apiFetch<ChatThread>(`/api/agents/${agentId}/threads`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function deleteAgentThread(threadId: string) {
  return apiFetch<void>(`/api/agents/threads/${threadId}`, { method: "DELETE" });
}

export function fetchThreadMessages(threadId: string, limit = 50) {
  return apiFetch<ChatMessage[]>(`/api/agents/threads/${threadId}/messages?limit=${limit}`);
}


// ── Knowledge Base ──

export interface KnowledgeBase {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  embedding_model: string;
  chunk_size: number;
  chunk_overlap: number;
  status: string;
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  kb_id: string;
  filename: string;
  content_type: string;
  char_count: number;
  chunk_count: number;
  status: string;
  created_at: string;
}

export interface KnowledgeSearchResult {
  chunk_id: string;
  doc_id: string;
  filename: string;
  chunk_index: number;
  content: string;
  score: number;
}

export interface KnowledgeBaseCreatePayload {
  name: string;
  description?: string;
  embedding_model?: string;
  chunk_size?: number;
  chunk_overlap?: number;
}

export function fetchKnowledgeBases() {
  return apiFetch<KnowledgeBase[]>("/api/knowledge");
}

export function createKnowledgeBase(payload: KnowledgeBaseCreatePayload) {
  return apiFetch<KnowledgeBase>("/api/knowledge", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchKnowledgeBase(kbId: string) {
  return apiFetch<KnowledgeBase>(`/api/knowledge/${kbId}`);
}

export function deleteKnowledgeBase(kbId: string) {
  return apiFetch<void>(`/api/knowledge/${kbId}`, { method: "DELETE" });
}

export function fetchKnowledgeDocuments(kbId: string) {
  return apiFetch<KnowledgeDocument[]>(`/api/knowledge/${kbId}/documents`);
}

export function uploadKnowledgeDocument(kbId: string, filename: string, content: string) {
  return apiFetch<KnowledgeDocument>(`/api/knowledge/${kbId}/documents`, {
    method: "POST",
    body: JSON.stringify({ filename, content }),
  });
}

export function deleteKnowledgeDocument(docId: string) {
  return apiFetch<void>(`/api/knowledge/documents/${docId}`, { method: "DELETE" });
}

export function searchKnowledge(kbId: string, query: string, topK = 5) {
  return apiFetch<KnowledgeSearchResult[]>(`/api/knowledge/${kbId}/search`, {
    method: "POST",
    body: JSON.stringify({ query, top_k: topK }),
  });
}

// ── Agent-Knowledge Linking ──

export function fetchAgentKnowledge(agentId: string) {
  return apiFetch<KnowledgeBase[]>(`/api/agents/${agentId}/knowledge`);
}

export function linkKnowledgeToAgent(agentId: string, kbId: string) {
  return apiFetch<{ linked_knowledge_ids: string[] }>(`/api/agents/${agentId}/knowledge/${kbId}`, {
    method: "POST",
  });
}

export function unlinkKnowledgeFromAgent(agentId: string, kbId: string) {
  return apiFetch<{ linked_knowledge_ids: string[] }>(`/api/agents/${agentId}/knowledge/${kbId}`, {
    method: "DELETE",
  });
}

// ── Workflow Run API ──

export function triggerWorkflowRun(workflowId: string, payload?: Record<string, unknown>) {
  return apiFetch<{ execution_id: string; status: string }>(`/api/workflows/${workflowId}/run`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}


// ── Audit Events ──

export interface AuditEventOut {
  id: string;
  workspace_id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  status: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export function fetchAuditEvents() {
  return apiFetch<AuditEventOut[]>("/api/audit-events");
}


// ── Analytics / Monitoring ──

export interface AnalyticsOverview {
  executions: {
    total: number;
    success: number;
    failed: number;
    running: number;
    paused: number;
    error_rate_pct: number;
  };
  workflows: {
    total: number;
    active: number;
    draft: number;
    paused: number;
  };
  workspace_id: string;
}

export function fetchAnalyticsOverview() {
  return apiFetch<AnalyticsOverview>("/api/analytics/overview");
}

export function fetchPrometheusMetrics() {
  return apiFetch<string>("/metrics");
}

export interface LogConfig {
  log_level: string;
  destinations: string[];
  supported_destinations: string[];
  retention_days: number;
}

export function fetchLogConfig() {
  return apiFetch<LogConfig>("/api/system/log-config");
}

export function updateLogConfig(config: Partial<LogConfig>) {
  return apiFetch<{ status: string; config: Partial<LogConfig> }>("/api/system/log-config", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

export interface LatencyPercentiles {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  count: number;
  avg_ms: number;
}

export function fetchLatencyPercentiles() {
  return apiFetch<LatencyPercentiles>("/api/analytics/latency");
}

export interface TimelineEntry {
  day: string;
  total: number;
  success: number;
  failed: number;
}

export function fetchExecutionTimeline(days = 7) {
  return apiFetch<TimelineEntry[]>(`/api/analytics/timeline?days=${days}`);
}


// ── Vault CRUD ──

export interface VaultAssetSummary {
  id: string;
  kind: "connection" | "credential" | "variable";
  name: string;
  app: string;
  subtitle: string | null;
  logo_url: string | null;
  credential_type: string | null;
  scope: string;
  status: "active" | "expiring" | "error";
  workflows_count: number;
  people_with_access: number;
  last_used_at: string | null;
  updated_at: string;
  masked: boolean;
  secret: Record<string, unknown> | null;
}

export interface VaultOverview {
  connections: VaultAssetSummary[];
  credentials: VaultAssetSummary[];
  variables: VaultAssetSummary[];
}

export interface VaultAssetCreate {
  kind: "connection" | "credential" | "variable";
  name: string;
  app?: string;
  subtitle?: string;
  logo_url?: string;
  credential_type?: string;
  scope?: string;
  status?: string;
  masked?: boolean;
  secret?: Record<string, unknown>;
}

export interface VaultAssetUpdate {
  name?: string;
  app?: string;
  subtitle?: string;
  credential_type?: string;
  scope?: string;
  status?: string;
  masked?: boolean;
  secret?: Record<string, unknown>;
}

export function fetchVaultOverview() {
  return apiFetch<VaultOverview>("/api/vault");
}

export function fetchVaultCredentials() {
  return apiFetch<VaultAssetSummary[]>("/api/vault/credentials");
}

export function fetchVaultConnections() {
  return apiFetch<VaultAssetSummary[]>("/api/vault/connections");
}

export function fetchVaultVariables() {
  return apiFetch<VaultAssetSummary[]>("/api/vault/variables");
}

export function createVaultAsset(payload: VaultAssetCreate) {
  return apiFetch<VaultAssetSummary>("/api/vault/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateVaultAsset(assetId: string, payload: VaultAssetUpdate) {
  return apiFetch<VaultAssetSummary>(`/api/vault/assets/${assetId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteVaultAsset(assetId: string) {
  return apiFetch<{ deleted: boolean }>(`/api/vault/assets/${assetId}`, { method: "DELETE" });
}

export function verifyVaultAsset(assetId: string) {
  return apiFetch<{ asset_id: string; healthy: boolean; checks: { check: string; status: string; detail: string }[] }>(
    `/api/vault/assets/${assetId}/verify`,
    { method: "POST" },
  );
}


// ── Vault Connection Test ──

export interface ConnectionTestResult {
  asset_id: string;
  connection_name: string;
  app: string;
  success: boolean;
  checks: { check: string; status: string; detail: string }[];
  latency_ms: number;
  tested_at: string;
}

export function testConnection(assetId: string) {
  return apiFetch<ConnectionTestResult>(`/api/vault/connections/${assetId}/test`, { method: "POST" });
}

export function rotateSecret(assetId: string) {
  return apiFetch<{ asset_id: string; name: string; rotation_status: string; message: string }>(
    `/api/vault/assets/${assetId}/rotate`,
    { method: "POST" },
  );
}

export function exportVault() {
  return apiFetch<{ workspace_id: string; count: number; assets: Record<string, unknown>[] }>("/api/vault/export");
}

export function importVault(assets: Record<string, unknown>[]) {
  return apiFetch<{ imported: number; errors: string[]; total: number }>("/api/vault/import", {
    method: "POST",
    body: JSON.stringify({ assets }),
  });
}


// ── MCP Server API ──

export interface MCPServer {
  id: string;
  workspace_id: string;
  name: string;
  url: string;
  transport: string;
  api_key: string | null;
  health_check_interval: number;
  auto_reconnect: number;
  enabled_tools_json: string[];
  agent_ids_json: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MCPServerCreatePayload {
  name: string;
  url: string;
  transport?: string;
  api_key?: string;
  health_check_interval?: number;
  auto_reconnect?: boolean;
  enabled_tools?: string[];
  agent_ids?: string[];
}

export function fetchMCPServers() {
  return apiFetch<MCPServer[]>("/api/mcp/servers");
}

export function createMCPServer(payload: MCPServerCreatePayload) {
  return apiFetch<MCPServer>("/api/mcp/servers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMCPServer(serverId: string) {
  return apiFetch<MCPServer>(`/api/mcp/servers/${serverId}`);
}

export function deleteMCPServer(serverId: string) {
  return apiFetch<void>(`/api/mcp/servers/${serverId}`, { method: "DELETE" });
}

export function callMCPTool(serverId: string, toolName: string, args?: Record<string, unknown>) {
  return apiFetch<{ server_id: string; tool_name: string; result: Record<string, unknown> }>("/api/mcp/call", {
    method: "POST",
    body: JSON.stringify({ server_id: serverId, tool_name: toolName, arguments: args }),
  });
}


// ── Evaluation API ──

export interface EvalDataset {
  id: string;
  workspace_id: string;
  agent_id: string;
  name: string;
  description: string | null;
  rows_json: { input: string; expected_output: string; tags?: string[] }[];
  created_at: string;
  updated_at: string;
}

export interface EvalRun {
  id: string;
  dataset_id: string;
  agent_id: string;
  status: string;
  results_json: { input: string; expected: string; actual: string; score: number; passed: boolean }[];
  summary_json: { total: number; passed: number; failed: number; avg_score: number };
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface EvalDatasetCreatePayload {
  agent_id: string;
  name: string;
  description?: string;
  rows?: { input: string; expected_output: string }[];
}

export function fetchEvalDatasets(agentId?: string) {
  const qs = agentId ? `?agent_id=${agentId}` : "";
  return apiFetch<EvalDataset[]>(`/api/eval/datasets${qs}`);
}

export function createEvalDataset(payload: EvalDatasetCreatePayload) {
  return apiFetch<EvalDataset>("/api/eval/datasets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteEvalDataset(datasetId: string) {
  return apiFetch<void>(`/api/eval/datasets/${datasetId}`, { method: "DELETE" });
}

export function fetchEvalRuns(agentId?: string, datasetId?: string) {
  const params = new URLSearchParams();
  if (agentId) params.set("agent_id", agentId);
  if (datasetId) params.set("dataset_id", datasetId);
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<EvalRun[]>(`/api/eval/runs${qs}`);
}

export function createEvalRun(datasetId: string, agentId: string) {
  return apiFetch<EvalRun>("/api/eval/runs", {
    method: "POST",
    body: JSON.stringify({ dataset_id: datasetId, agent_id: agentId }),
  });
}

export function fetchEvalRun(runId: string) {
  return apiFetch<EvalRun>(`/api/eval/runs/${runId}`);
}


// ── Expression Engine API ──

export interface ExpressionTestResult {
  success: boolean;
  result: unknown;
  result_type: string | null;
  error: string | null;
}

export interface ExpressionVariable {
  name: string;
  type: string;
  description: string;
  methods?: string[];
}

export interface ExpressionVariables {
  variables: ExpressionVariable[];
  functions: { name: string; description: string }[];
  methods: Record<string, string[]>;
}

export function testExpression(expression: string, contextData?: Record<string, unknown>, mode: string = "template") {
  return apiFetch<ExpressionTestResult>("/api/expressions/test", {
    method: "POST",
    body: JSON.stringify({ expression, context_data: contextData, mode }),
  });
}

export function fetchExpressionVariables() {
  return apiFetch<ExpressionVariables>("/api/expressions/variables");
}

// ── Sprint 43: Dead Letter Queue, Dedup, Retention ──

export interface DeadLetterItem {
  id: string;
  webhook_id: string;
  delivery_id?: string;
  payload?: string;
  status: string;
  updated_at: string;
}

export function fetchDeadLetters(limit = 50, offset = 0) {
  return apiFetch<DeadLetterItem[]>(`/api/webhooks/dead-letters?limit=${limit}&offset=${offset}`);
}

export function replayDeadLetter(queueId: string) {
  return apiFetch<{ status: string; queue_id: string }>(`/api/webhooks/dead-letters/${queueId}/replay`, { method: "POST" });
}

export function purgeDeadLetters() {
  return apiFetch<{ status: string; count: number }>("/api/webhooks/dead-letters", { method: "DELETE" });
}

export function purgeOldDeliveries(days?: number) {
  const q = days != null ? `?days=${days}` : "";
  return apiFetch<{ status: string; count: number }>(`/api/webhooks/deliveries/old${q}`, { method: "DELETE" });
}

export function fetchRetentionInfo() {
  return apiFetch<{ retention_days: number }>("/api/webhooks/retention-info");
}

// ── Settings: Profile, Preferences, API Keys ─────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_initials: string;
  bio: string;
  timezone: string;
  created_at: string;
}

export interface UserProfileUpdate {
  name?: string;
  bio?: string;
  timezone?: string;
  avatar_initials?: string;
}

export interface UserPreferences {
  theme: string;
  editor_font_size: number;
  editor_minimap: boolean;
  editor_word_wrap: boolean;
  code_theme: string;
  keyboard_shortcuts: string;
  language: string;
  sidebar_collapsed: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scope: string;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
}

export function fetchProfile() {
  return apiFetch<UserProfile>("/api/me/profile");
}

export function updateProfile(data: UserProfileUpdate) {
  return apiFetch<UserProfile>("/api/me/profile", { method: "PATCH", body: JSON.stringify(data) });
}

export function fetchPreferences() {
  return apiFetch<UserPreferences>("/api/me/preferences");
}

export function updatePreferences(data: Partial<UserPreferences>) {
  return apiFetch<UserPreferences>("/api/me/preferences", { method: "PATCH", body: JSON.stringify(data) });
}

export function fetchApiKeys() {
  return apiFetch<ApiKey[]>("/api/api-keys");
}

export function createApiKey(name = "Default") {
  return apiFetch<ApiKeyCreated>("/api/api-keys", { method: "POST", body: JSON.stringify({ name }) });
}

export function deleteApiKey(keyId: string) {
  return apiFetch<{ status: string }>(`/api/api-keys/${keyId}`, { method: "DELETE" });
}

/* ── Notification Preferences ── */
export interface NotificationPreferences {
  channels: Record<string, { email: boolean; inApp: boolean; slack: boolean; webhook: boolean }>;
  digest_frequency: string;
  failure_threshold: string;
  quiet_hours: { enabled: boolean; start: string; end: string };
  webhook_url: string;
}

export function fetchNotificationPreferences() {
  return apiFetch<NotificationPreferences>("/api/me/notification-preferences");
}

export function updateNotificationPreferences(data: Partial<NotificationPreferences>) {
  return apiFetch<NotificationPreferences>("/api/me/notification-preferences", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/* ── OAuth / Integrations ── */
export interface OAuthProvider {
  id: string;
  name: string;
  auth_url: string;
  token_url: string;
  logo_url: string;
  scopes: string[];
}

export function fetchOAuthProviders() {
  return apiFetch<OAuthProvider[]>("/api/oauth2/providers");
}

export function startOAuthAuthorize(provider: string, clientId: string, redirectUri: string, scopes?: string[]) {
  return apiFetch<{ authorize_url: string; state: string }>("/api/oauth2/authorize", {
    method: "POST",
    body: JSON.stringify({ provider, client_id: clientId, redirect_uri: redirectUri, scopes }),
  });
}

export function oauthCallback(provider: string, code: string, state: string, redirectUri: string) {
  return apiFetch<{ status: string; connection_id: string }>("/api/oauth2/callback", {
    method: "POST",
    body: JSON.stringify({ provider, code, state, redirect_uri: redirectUri }),
  });
}

export function refreshOAuthToken(connectionId: string) {
  return apiFetch<{ status: string }>("/api/oauth2/refresh", {
    method: "POST",
    body: JSON.stringify({ connection_id: connectionId }),
  });
}

// ── Workspace Members ──

export interface WorkspaceMember {
  user_id: string;
  name: string;
  email: string;
  avatar_initials: string;
  role: WorkspaceRole;
  status: "active" | "pending" | "inactive";
}

export function fetchWorkspaceMembers() {
  return apiFetch<WorkspaceMember[]>("/api/workspaces/current/members");
}

export function inviteWorkspaceMember(email: string, role: WorkspaceRole) {
  return apiFetch<WorkspaceMember>("/api/workspaces/current/members/invite", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function updateMemberRole(userId: string, role: WorkspaceRole) {
  return apiFetch<WorkspaceMember>(`/api/workspaces/current/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function removeMember(userId: string) {
  return apiFetch<{ status: string }>(`/api/workspaces/current/members/${userId}`, {
    method: "DELETE",
  });
}

// ── Workspace Settings ──

export interface WorkspaceSettingsData {
  execution_timeout_seconds: number;
  save_failed_executions: boolean;
  save_successful_executions: boolean;
  max_concurrent_executions: number;
  require_staging_before_publish: boolean;
  require_staging_approval: boolean;
  require_production_approval: boolean;
  require_webhook_signature: boolean;
  allow_public_webhooks: boolean;
  allow_public_chat_triggers: boolean;
  notify_on_execution_failure: boolean;
  notify_on_execution_success: boolean;
  [key: string]: unknown;
}

export function fetchWorkspaceSettings() {
  return apiFetch<WorkspaceSettingsData>("/api/workspaces/current/settings");
}

export function updateWorkspaceSettings(payload: Partial<WorkspaceSettingsData>) {
  return apiFetch<WorkspaceSettingsData>("/api/workspaces/current/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ── System Status (Dashboard analytics) ──

export interface SystemStatus {
  platform: { version: string; environment: string; database_backend: string; execution_mode: string };
  llm: { configured_provider: string; available_providers: string[]; default_provider: string };
  jobs: { pending: number; processing: number; failed: number; completed: number };
  executions: { total: number; success: number; failed: number; running: number };
  workflows: { total: number; active: number };
  integrations: { builtin_count: number; plugin_count: number; total: number };
}

export function fetchSystemStatus() {
  return apiFetch<SystemStatus>("/api/system/status");
}

// ── Variables (Environment Variables) ──

export interface VariableOut {
  id: string;
  name: string;
  value: string;
  type: string;
  scope: string;
  secret: boolean;
  created_at: string;
  updated_at: string;
}

export interface VariableCreate {
  name: string;
  value?: string;
  type?: string;
  scope?: string;
  secret?: boolean;
}

export function fetchVariables() {
  return apiFetch<VariableOut[]>("/api/variables");
}

export function createVariable(body: VariableCreate) {
  return apiFetch<VariableOut>("/api/variables", { method: "POST", body: JSON.stringify(body) });
}

export function updateVariable(id: string, body: Partial<VariableCreate>) {
  return apiFetch<VariableOut>(`/api/variables/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export function deleteVariable(id: string) {
  return apiFetch<void>(`/api/variables/${id}`, { method: "DELETE" });
}

// ── Model Directory ──

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  modality: string[];
  contextWindow: string;
  maxOutput: string;
  latencyTier: "fast" | "standard" | "slow";
  costTier: "free" | "low" | "medium" | "high" | "premium";
  status: "available" | "limited" | "deprecated";
  description: string;
  featured?: boolean;
}

export function fetchModels() {
  return apiFetch<ModelInfo[]>("/api/models");
}

// ── Workflow Versions ──

export interface WorkflowVersionOut {
  id: string;
  workflow_id: string;
  version_number: number;
  status: "draft_snapshot" | "staging" | "published";
  notes: string | null;
  created_at: string;
}

export function fetchWorkflowVersions(workflowId: string) {
  return apiFetch<WorkflowVersionOut[]>(`/api/workflows/${workflowId}/versions`);
}

/* ── Billing / Usage ── */
export interface UsageSummary {
  plan: string;
  creditsUsed: number;
  creditsLimit: number;
  renewalDate: string;
  costThisMonth: string;
}

export function fetchUsageSummary() {
  return apiFetch<UsageSummary>("/api/billing/usage");
}

/* ── Source Control ── */
export interface SourceControlConfig {
  provider: string;
  repoUrl: string;
  branch: string;
  connected: boolean;
  lastSync: string | null;
}

export function fetchSourceControlConfig() {
  return apiFetch<SourceControlConfig>("/api/source-control/config");
}

export function updateSourceControlConfig(payload: Partial<SourceControlConfig>) {
  return apiFetch<SourceControlConfig>("/api/source-control/config", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* ── Community Nodes Marketplace ── */
export interface CommunityNodeSummary {
  id: string;
  name: string;
  displayName: string;
  author: string;
  description: string;
  downloads: number;
  rating: number;
  installed: boolean;
  verified: boolean;
  version: string;
  tags: string[];
}

export function fetchCommunityNodes() {
  return apiFetch<CommunityNodeSummary[]>("/api/community-nodes");
}

export function installCommunityNode(nodeId: string) {
  return apiFetch<{ ok: boolean }>(`/api/community-nodes/${nodeId}/install`, { method: "POST" });
}

export function uninstallCommunityNode(nodeId: string) {
  return apiFetch<{ ok: boolean }>(`/api/community-nodes/${nodeId}/uninstall`, { method: "POST" });
}

/* ── Environment / Deployments ── */
export interface EnvironmentStage {
  name: string;
  status: "live" | "deploying" | "empty";
  version: string;
  workflows: number;
  lastDeploy: string | null;
  health: "healthy" | "warning" | "error";
}

export interface DeploymentSummary {
  id: string;
  version: string;
  from: string;
  to: string;
  status: "success" | "failed" | "in_progress";
  deployedBy: string;
  timestamp: string;
  workflows: number;
}

export function fetchEnvironmentStages() {
  return apiFetch<EnvironmentStage[]>("/api/environments/stages");
}

export function fetchDeployments() {
  return apiFetch<DeploymentSummary[]>("/api/environments/deployments");
}

export function promoteStage(from: string, to: string) {
  return apiFetch<DeploymentSummary>("/api/environments/promote", {
    method: "POST",
    body: JSON.stringify({ from, to }),
  });
}

/* ── Provider Detail ── */
export interface ProviderDetail {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "degraded" | "error";
  authMode: string;
  models: number;
  lastVerified: string;
  usageOps: string;
  createdAt: string;
  baseUrl: string;
}

export function fetchProviderDetail(id: string) {
  return apiFetch<ProviderDetail>(`/api/providers/${id}`);
}

/* ── Domain / Webhook Config ── */
export interface DomainConfig {
  baseUrl: string;
  webhookSignature: boolean;
  publicWebhooks: boolean;
  publicChat: boolean;
  queueAlertThreshold: number;
  expireAfterDays: number;
}

export function fetchDomainConfig() {
  return apiFetch<DomainConfig>("/api/settings/domains");
}

export function updateDomainConfig(payload: Partial<DomainConfig>) {
  return apiFetch<DomainConfig>("/api/settings/domains", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
