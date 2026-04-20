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

export function runWorkflow(id: string, payload: Record<string, unknown> = {}, environment: ExecutionEnvironment = "draft") {
  return apiFetch<ExecutionSummary>(`/api/workflows/${id}/run`, {
    method: "POST",
    body: JSON.stringify({ payload, environment }),
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
  name: string;
  path: string;
  method: string;
  workflow_id: string;
  status: "active" | "paused" | "disabled";
  signing_secret: string | null;
  created_at: string;
  last_triggered: string | null;
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  status: "success" | "failed" | "pending";
  status_code: number;
  duration_ms: number;
  timestamp: string;
}

export function fetchWebhookEndpoints() {
  return apiFetch<WebhookEndpoint[]>("/api/webhooks");
}

export function createWebhookEndpoint(payload: { name: string; workflow_id: string; method?: string }) {
  return apiFetch<WebhookEndpoint>("/api/webhooks", { method: "POST", body: JSON.stringify(payload) });
}

export function updateWebhookEndpoint(id: string, payload: Partial<WebhookEndpoint>) {
  return apiFetch<WebhookEndpoint>(`/api/webhooks/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteWebhookEndpoint(id: string) {
  return apiFetch<void>(`/api/webhooks/${id}`, { method: "DELETE" });
}

export function fetchWebhookDeliveries(webhookId: string, limit?: number) {
  const qs = limit ? `?limit=${limit}` : "";
  return apiFetch<WebhookDelivery[]>(`/api/webhooks/${webhookId}/deliveries${qs}`);
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
  context?: Record<string, unknown>;
}

export interface AgentChatResponse {
  answer: string;
  agent_type: string;
  iterations: number;
  tools_used: string[];
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
