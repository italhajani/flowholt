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

// ---------------------------------------------------------------------------
// Studio endpoints
// ---------------------------------------------------------------------------

export function fetchNodeCatalog() {
  return apiFetch<NodeCatalogResponse>("/api/studio/catalog");
}

export function fetchNodeDefinitions() {
  return apiFetch<NodeDefinitionSummary[]>("/api/studio/nodes");
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
