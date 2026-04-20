import json
import sqlite3
import threading
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import urlparse

from .config import get_settings


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    avatar_initials TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL,
    owner_user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(owner_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(workspace_id, user_id),
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_subject TEXT NOT NULL,
    email TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(provider, provider_subject),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workspace_settings (
    workspace_id TEXT PRIMARY KEY,
    public_base_url TEXT,
    require_webhook_signature INTEGER NOT NULL DEFAULT 0,
    webhook_signing_secret TEXT,
    staging_min_role TEXT NOT NULL DEFAULT 'builder',
    publish_min_role TEXT NOT NULL DEFAULT 'builder',
    run_min_role TEXT NOT NULL DEFAULT 'builder',
    production_asset_min_role TEXT NOT NULL DEFAULT 'admin',
    allow_public_webhooks INTEGER NOT NULL DEFAULT 1,
    allow_public_chat_triggers INTEGER NOT NULL DEFAULT 1,
    require_staging_before_production INTEGER NOT NULL DEFAULT 0,
    require_staging_approval INTEGER NOT NULL DEFAULT 0,
    require_production_approval INTEGER NOT NULL DEFAULT 0,
    deployment_approval_min_role TEXT NOT NULL DEFAULT 'admin',
    allow_self_approval INTEGER NOT NULL DEFAULT 0,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    execution_timeout_seconds INTEGER NOT NULL DEFAULT 3600,
    save_execution_data INTEGER NOT NULL DEFAULT 1,
    save_failed_executions TEXT NOT NULL DEFAULT 'all',
    save_successful_executions TEXT NOT NULL DEFAULT 'all',
    save_manual_executions INTEGER NOT NULL DEFAULT 1,
    execution_data_retention_days INTEGER NOT NULL DEFAULT 14,
    save_execution_progress INTEGER NOT NULL DEFAULT 0,
    redact_execution_payloads INTEGER NOT NULL DEFAULT 0,
    max_concurrent_executions INTEGER NOT NULL DEFAULT 10,
    log_level TEXT NOT NULL DEFAULT 'info',
    email_notifications_enabled INTEGER NOT NULL DEFAULT 0,
    notify_on_failure INTEGER NOT NULL DEFAULT 1,
    notify_on_success INTEGER NOT NULL DEFAULT 0,
    notify_on_approval_requests INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    estimated_time TEXT NOT NULL,
    complexity TEXT NOT NULL,
    color TEXT NOT NULL,
    owner TEXT NOT NULL,
    installs TEXT NOT NULL,
    outcome TEXT NOT NULL,
    tags_json TEXT NOT NULL,
    definition_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    created_by_user_id TEXT,
    current_version_number INTEGER NOT NULL DEFAULT 0,
    staging_version_id TEXT,
    published_version_id TEXT,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    category TEXT NOT NULL,
    success_rate INTEGER NOT NULL,
    template_id TEXT,
    definition_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_run_at TEXT,
    FOREIGN KEY(template_id) REFERENCES templates(id),
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(created_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workflow_versions (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    created_by_user_id TEXT,
    version_number INTEGER NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    definition_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(workflow_id, version_number),
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(created_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workflow_deployments (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    created_by_user_id TEXT,
    environment TEXT NOT NULL,
    action TEXT NOT NULL,
    from_version_id TEXT,
    to_version_id TEXT NOT NULL,
    notes TEXT,
    metadata_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(created_by_user_id) REFERENCES users(id),
    FOREIGN KEY(from_version_id) REFERENCES workflow_versions(id),
    FOREIGN KEY(to_version_id) REFERENCES workflow_versions(id)
);

CREATE TABLE IF NOT EXISTS workflow_deployment_reviews (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    requested_by_user_id TEXT NOT NULL,
    reviewed_by_user_id TEXT,
    target_environment TEXT NOT NULL,
    target_version_id TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    review_comment TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    reviewed_at TEXT,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(requested_by_user_id) REFERENCES users(id),
    FOREIGN KEY(reviewed_by_user_id) REFERENCES users(id),
    FOREIGN KEY(target_version_id) REFERENCES workflow_versions(id)
);

CREATE TABLE IF NOT EXISTS executions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    initiated_by_user_id TEXT,
    workflow_version_id TEXT,
    environment TEXT NOT NULL DEFAULT 'draft',
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    status TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    duration_ms INTEGER,
    payload_json TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    result_json TEXT,
    error_text TEXT,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(initiated_by_user_id) REFERENCES users(id),
    FOREIGN KEY(workflow_version_id) REFERENCES workflow_versions(id)
);

CREATE TABLE IF NOT EXISTS workflow_jobs (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    workflow_version_id TEXT,
    initiated_by_user_id TEXT,
    environment TEXT NOT NULL DEFAULT 'draft',
    trigger_type TEXT NOT NULL,
    status TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    available_at TEXT NOT NULL,
    leased_until TEXT,
    execution_id TEXT,
    error_text TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(workflow_version_id) REFERENCES workflow_versions(id),
    FOREIGN KEY(initiated_by_user_id) REFERENCES users(id),
    FOREIGN KEY(execution_id) REFERENCES executions(id)
);

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    actor_user_id TEXT,
    actor_email TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    status TEXT NOT NULL,
    details_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(actor_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS trigger_events (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    event_key TEXT NOT NULL,
    execution_id TEXT,
    payload_hash TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(workspace_id, workflow_id, event_key),
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(execution_id) REFERENCES executions(id)
);

CREATE TABLE IF NOT EXISTS execution_pauses (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    execution_id TEXT NOT NULL UNIQUE,
    workflow_version_id TEXT,
    step_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    wait_type TEXT NOT NULL,
    status TEXT NOT NULL,
    resume_after TEXT,
    resume_token TEXT NOT NULL UNIQUE,
    cancel_token TEXT NOT NULL UNIQUE,
    state_json TEXT NOT NULL,
    metadata_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(execution_id) REFERENCES executions(id),
    FOREIGN KEY(workflow_version_id) REFERENCES workflow_versions(id)
);

CREATE TABLE IF NOT EXISTS execution_events (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    execution_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    step_id TEXT,
    step_name TEXT,
    status TEXT,
    message TEXT,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(execution_id) REFERENCES executions(id)
);

CREATE TABLE IF NOT EXISTS human_tasks (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    execution_id TEXT NOT NULL,
    pause_id TEXT NOT NULL UNIQUE,
    step_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    status TEXT NOT NULL,
    assigned_to_user_id TEXT,
    assigned_to_email TEXT,
    priority TEXT NOT NULL,
    choices_json TEXT NOT NULL,
    due_at TEXT,
    decision TEXT,
    comment TEXT,
    response_payload_json TEXT NOT NULL,
    metadata_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(execution_id) REFERENCES executions(id),
    FOREIGN KEY(pause_id) REFERENCES execution_pauses(id),
    FOREIGN KEY(assigned_to_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS execution_artifacts (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    execution_id TEXT NOT NULL,
    step_id TEXT,
    step_name TEXT,
    artifact_type TEXT NOT NULL,
    direction TEXT NOT NULL,
    data_json TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(workflow_id) REFERENCES workflows(id),
    FOREIGN KEY(execution_id) REFERENCES executions(id)
);

CREATE TABLE IF NOT EXISTS vault_assets (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    created_by_user_id TEXT,
    visibility TEXT NOT NULL DEFAULT 'workspace',
    allowed_roles_json TEXT NOT NULL DEFAULT '[]',
    allowed_user_ids_json TEXT NOT NULL DEFAULT '[]',
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    app TEXT,
    subtitle TEXT,
    logo_url TEXT,
    credential_type TEXT,
    scope TEXT NOT NULL,
    access_text TEXT,
    status TEXT NOT NULL,
    workflows_count INTEGER NOT NULL DEFAULT 0,
    people_with_access INTEGER NOT NULL DEFAULT 0,
    last_used_at TEXT,
    updated_at TEXT NOT NULL,
    masked INTEGER NOT NULL DEFAULT 1,
    secret_json TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(created_by_user_id) REFERENCES users(id)
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_trigger ON workflows(workspace_id, trigger_type, status);

CREATE INDEX IF NOT EXISTS idx_executions_workflow ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_workspace ON executions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_started ON executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_workflow_status ON executions(workflow_id, status);

CREATE INDEX IF NOT EXISTS idx_workflow_jobs_status ON workflow_jobs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_available ON workflow_jobs(status, available_at, leased_until);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_workspace ON workflow_jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_workflow ON workflow_jobs(workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_versions_workflow ON workflow_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_versions_status ON workflow_versions(workflow_id, status);

CREATE INDEX IF NOT EXISTS idx_audit_events_workspace ON audit_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action);

CREATE INDEX IF NOT EXISTS idx_execution_events_execution ON execution_events(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_events_workflow ON execution_events(workflow_id);

CREATE INDEX IF NOT EXISTS idx_execution_pauses_execution ON execution_pauses(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_pauses_status ON execution_pauses(status);

CREATE INDEX IF NOT EXISTS idx_human_tasks_workspace ON human_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_human_tasks_status ON human_tasks(status);
CREATE INDEX IF NOT EXISTS idx_human_tasks_assigned ON human_tasks(assigned_to_user_id);

CREATE INDEX IF NOT EXISTS idx_trigger_events_workflow ON trigger_events(workspace_id, workflow_id);

CREATE INDEX IF NOT EXISTS idx_execution_artifacts_execution ON execution_artifacts(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_artifacts_created ON execution_artifacts(created_at);

CREATE INDEX IF NOT EXISTS idx_vault_assets_workspace ON vault_assets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_vault_assets_kind ON vault_assets(workspace_id, kind);

CREATE INDEX IF NOT EXISTS idx_workspace_memberships_user ON workspace_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_workspace ON workspace_memberships(workspace_id);

CREATE INDEX IF NOT EXISTS idx_workflow_deployments_workflow ON workflow_deployments(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_deployment_reviews_workflow ON workflow_deployment_reviews(workflow_id);

CREATE TABLE IF NOT EXISTS chat_threads (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT '',
    pinned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    model_used TEXT,
    actions_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_attachments (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    thread_id TEXT,
    message_id TEXT,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    preview_text TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE,
    FOREIGN KEY(message_id) REFERENCES chat_messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_workspace_user ON chat_threads(workspace_id, user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_thread ON chat_attachments(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments(message_id, created_at);

CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    agent_type TEXT NOT NULL DEFAULT 'tools_agent',
    status TEXT NOT NULL DEFAULT 'draft',
    icon TEXT NOT NULL DEFAULT 'bot',
    color TEXT NOT NULL DEFAULT '#7c3aed',
    tools_json TEXT NOT NULL DEFAULT '[]',
    memory_json TEXT NOT NULL DEFAULT '{}',
    model_config_json TEXT NOT NULL DEFAULT '{}',
    knowledge_ids_json TEXT NOT NULL DEFAULT '[]',
    max_iterations INTEGER NOT NULL DEFAULT 10,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
);

CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents(workspace_id, updated_at DESC);

-- ── Chat Memory ──
CREATE TABLE IF NOT EXISTS chat_threads (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    resource_id TEXT NOT NULL DEFAULT 'default',
    title TEXT,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chat_threads_agent ON chat_threads(agent_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    thread_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('system','user','assistant','tool')),
    content TEXT NOT NULL,
    tool_call_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id, seq);

-- ── Knowledge Base ──
CREATE TABLE IF NOT EXISTS knowledge_bases (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    embedding_model TEXT NOT NULL DEFAULT 'mock',
    chunk_size INTEGER NOT NULL DEFAULT 500,
    chunk_overlap INTEGER NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'active',
    document_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
);
CREATE INDEX IF NOT EXISTS idx_kb_workspace ON knowledge_bases(workspace_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id TEXT PRIMARY KEY,
    kb_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text/plain',
    char_count INTEGER NOT NULL DEFAULT 0,
    chunk_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY(kb_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_kb_docs ON knowledge_documents(kb_id);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id TEXT PRIMARY KEY,
    doc_id TEXT NOT NULL,
    kb_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding_json TEXT,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY(doc_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    FOREIGN KEY(kb_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_doc ON knowledge_chunks(doc_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_kb ON knowledge_chunks(kb_id);
"""

SCHEMA_WEBHOOKS = """
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    path TEXT NOT NULL,
    method TEXT DEFAULT 'POST',
    auth_type TEXT DEFAULT 'none',
    auth_config TEXT DEFAULT '{}',
    rate_limit_max INTEGER DEFAULT 300,
    rate_limit_window_sec INTEGER DEFAULT 10,
    signing_secret TEXT,
    ip_whitelist TEXT,
    cors_origins TEXT DEFAULT '*',
    respond_mode TEXT DEFAULT 'immediately',
    response_status INTEGER DEFAULT 200,
    response_headers TEXT DEFAULT '{}',
    response_body TEXT,
    active INTEGER DEFAULT 1,
    expires_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_path ON webhook_endpoints(path, method);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id TEXT PRIMARY KEY,
    webhook_id TEXT NOT NULL,
    execution_id TEXT,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    headers TEXT DEFAULT '{}',
    body TEXT,
    query_params TEXT DEFAULT '{}',
    source_ip TEXT,
    status_code INTEGER DEFAULT 200,
    response_body TEXT,
    latency_ms INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(webhook_id) REFERENCES webhook_endpoints(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_webhook_del_wh ON webhook_deliveries(webhook_id, created_at);

CREATE TABLE IF NOT EXISTS webhook_queue (
    id TEXT PRIMARY KEY,
    webhook_id TEXT NOT NULL,
    delivery_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    next_retry_at TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TEXT NOT NULL,
    processed_at TEXT,
    FOREIGN KEY(webhook_id) REFERENCES webhook_endpoints(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_wh_queue_status ON webhook_queue(status, next_retry_at);

CREATE TABLE IF NOT EXISTS mcp_servers (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    transport TEXT NOT NULL DEFAULT 'stdio',
    api_key TEXT,
    health_check_interval INTEGER DEFAULT 60,
    auto_reconnect INTEGER DEFAULT 1,
    enabled_tools_json TEXT NOT NULL DEFAULT '[]',
    agent_ids_json TEXT NOT NULL DEFAULT '[]',
    status TEXT DEFAULT 'healthy',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_mcp_ws ON mcp_servers(workspace_id);

CREATE TABLE IF NOT EXISTS eval_datasets (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rows_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eval_runs (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    results_json TEXT NOT NULL DEFAULT '[]',
    summary_json TEXT NOT NULL DEFAULT '{}',
    started_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(dataset_id) REFERENCES eval_datasets(id) ON DELETE CASCADE,
    FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS polling_triggers (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Polling Trigger',
    url TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    headers_json TEXT DEFAULT '{}',
    auth_type TEXT DEFAULT 'none',
    auth_config_json TEXT DEFAULT '{}',
    interval_seconds INTEGER DEFAULT 300,
    last_polled_at TEXT,
    last_cursor TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS internal_events (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload_json TEXT DEFAULT '{}',
    source_workflow_id TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS consecutive_errors (
    workflow_id TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    last_error_at TEXT,
    auto_deactivated INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS incomplete_executions (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 8,
    next_retry_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    saved_state_json TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(execution_id) REFERENCES executions(id) ON DELETE CASCADE,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);
"""


class CompatCursor:
    def __init__(self, cursor: Any):
        self._cursor = cursor

    @property
    def rowcount(self) -> int:
        return int(getattr(self._cursor, "rowcount", -1))

    def fetchone(self) -> Any:
        return self._cursor.fetchone()

    def fetchall(self) -> list[Any]:
        return self._cursor.fetchall()


class PostgresCompatConnection:
    def __init__(self, conn: Any):
        self._conn = conn
        self.backend = "postgres"

    def execute(self, query: str, params: Any = None) -> CompatCursor:
        cursor = self._conn.cursor()
        cursor.execute(_normalize_query(query, "postgres"), _normalize_params(params))
        return CompatCursor(cursor)

    def executescript(self, script: str) -> None:
        cursor = self._conn.cursor()
        for statement in [part.strip() for part in script.split(";") if part.strip()]:
            cursor.execute(statement)
        cursor.close()

    def commit(self) -> None:
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def get_database_backend() -> str:
    settings = get_settings()
    target = settings.database_url or settings.database_path
    parsed = urlparse(target)
    if parsed.scheme in {"postgres", "postgresql"}:
        return "postgres"
    return "sqlite"


_pg_pool: Any = None  # psycopg_pool.ConnectionPool singleton
_pg_thread_local = threading.local()


def _get_pg_pool() -> Any:
    """Return a shared connection pool for Postgres. Created once on first call."""
    global _pg_pool
    if _pg_pool is not None:
        return _pg_pool

    settings = get_settings()
    try:
        from psycopg_pool import ConnectionPool
        from psycopg.rows import dict_row
    except ImportError:
        # Fall back to non-pooled connections
        return None

    min_size = int(getattr(settings, "db_pool_min", 2))
    max_size = int(getattr(settings, "db_pool_max", 10))
    _pg_pool = ConnectionPool(
        conninfo=settings.database_url,
        min_size=min_size,
        max_size=max_size,
        kwargs={"row_factory": dict_row},
    )
    return _pg_pool


def _connect_postgres() -> Any:
    settings = get_settings()
    try:
        import psycopg
        from psycopg.rows import dict_row
    except ImportError as exc:
        raise RuntimeError(
            "DATABASE_URL points to Postgres, but psycopg is not installed. "
            "Install backend requirements before using hosted Postgres."
        ) from exc

    return psycopg.connect(settings.database_url, row_factory=dict_row)


def _get_thread_local_pg_conn() -> Any:
    conn = getattr(_pg_thread_local, "conn", None)
    if conn is not None and not getattr(conn, "closed", False):
        return conn

    conn = _connect_postgres()
    _pg_thread_local.conn = conn
    return conn


def _reset_thread_local_pg_conn() -> None:
    conn = getattr(_pg_thread_local, "conn", None)
    if conn is None:
        return
    try:
        conn.close()
    except Exception:
        pass
    _pg_thread_local.conn = None


def _connect() -> Any:
    if get_database_backend() == "postgres":
        return PostgresCompatConnection(_connect_postgres())

    settings = get_settings()
    db_path = Path(settings.database_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db() -> Iterator[Any]:
    # Use connection pool for Postgres if available
    if get_database_backend() == "postgres":
        pool = _get_pg_pool()
        if pool is not None:
            with pool.connection() as conn:
                try:
                    yield PostgresCompatConnection(conn)
                    conn.commit()
                except Exception:
                    conn.rollback()
                    raise
            return

        conn = _get_thread_local_pg_conn()
        try:
            yield PostgresCompatConnection(conn)
            conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                _reset_thread_local_pg_conn()
            raise
        return

    conn = _connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(SCHEMA_SQL)
        _ensure_column(conn, "users", "password_hash", "TEXT")
        _ensure_column(conn, "templates", "workspace_id", "TEXT DEFAULT 'ws-flowholt'")
        _ensure_column(conn, "workflows", "workspace_id", "TEXT DEFAULT 'ws-flowholt'")
        _ensure_column(conn, "workflows", "created_by_user_id", "TEXT DEFAULT 'u-ital-hajani'")
        _ensure_column(conn, "workflows", "current_version_number", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workflows", "staging_version_id", "TEXT")
        _ensure_column(conn, "workflows", "published_version_id", "TEXT")
        _ensure_column(conn, "executions", "workspace_id", "TEXT DEFAULT 'ws-flowholt'")
        _ensure_column(conn, "executions", "initiated_by_user_id", "TEXT")
        _ensure_column(conn, "executions", "workflow_version_id", "TEXT")
        _ensure_column(conn, "executions", "environment", "TEXT NOT NULL DEFAULT 'draft'")
        _ensure_column(conn, "workflow_jobs", "environment", "TEXT NOT NULL DEFAULT 'draft'")
        _ensure_column(conn, "vault_assets", "workspace_id", "TEXT DEFAULT 'ws-flowholt'")
        _ensure_column(conn, "vault_assets", "created_by_user_id", "TEXT DEFAULT 'u-ital-hajani'")
        _ensure_column(conn, "vault_assets", "visibility", "TEXT NOT NULL DEFAULT 'workspace'")
        _ensure_column(conn, "vault_assets", "allowed_roles_json", "TEXT NOT NULL DEFAULT '[]'")
        _ensure_column(conn, "vault_assets", "allowed_user_ids_json", "TEXT NOT NULL DEFAULT '[]'")
        _ensure_column(conn, "workspace_settings", "staging_min_role", "TEXT NOT NULL DEFAULT 'builder'")
        _ensure_column(conn, "workspace_settings", "publish_min_role", "TEXT NOT NULL DEFAULT 'builder'")
        _ensure_column(conn, "workspace_settings", "run_min_role", "TEXT NOT NULL DEFAULT 'builder'")
        _ensure_column(conn, "workspace_settings", "production_asset_min_role", "TEXT NOT NULL DEFAULT 'admin'")
        _ensure_column(conn, "workspace_settings", "allow_public_webhooks", "INTEGER NOT NULL DEFAULT 1")
        _ensure_column(conn, "workspace_settings", "allow_public_chat_triggers", "INTEGER NOT NULL DEFAULT 1")
        _ensure_column(conn, "workspace_settings", "require_staging_before_production", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "require_staging_approval", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "require_production_approval", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "deployment_approval_min_role", "TEXT NOT NULL DEFAULT 'admin'")
        _ensure_column(conn, "workspace_settings", "allow_self_approval", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "timezone", "TEXT NOT NULL DEFAULT 'UTC'")
        _ensure_column(conn, "workspace_settings", "execution_timeout_seconds", "INTEGER NOT NULL DEFAULT 3600")
        _ensure_column(conn, "workspace_settings", "save_execution_data", "INTEGER NOT NULL DEFAULT 1")
        _ensure_column(conn, "workspace_settings", "save_failed_executions", "TEXT NOT NULL DEFAULT 'all'")
        _ensure_column(conn, "workspace_settings", "save_successful_executions", "TEXT NOT NULL DEFAULT 'all'")
        _ensure_column(conn, "workspace_settings", "save_manual_executions", "INTEGER NOT NULL DEFAULT 1")
        _ensure_column(conn, "workspace_settings", "execution_data_retention_days", "INTEGER NOT NULL DEFAULT 14")
        _ensure_column(conn, "workspace_settings", "save_execution_progress", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "redact_execution_payloads", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "max_concurrent_executions", "INTEGER NOT NULL DEFAULT 10")
        _ensure_column(conn, "workspace_settings", "log_level", "TEXT NOT NULL DEFAULT 'info'")
        _ensure_column(conn, "workspace_settings", "email_notifications_enabled", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "notify_on_failure", "INTEGER NOT NULL DEFAULT 1")
        _ensure_column(conn, "workspace_settings", "notify_on_success", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "notify_on_approval_requests", "INTEGER NOT NULL DEFAULT 1")
        _ensure_column(conn, "workflow_deployments", "metadata_json", "TEXT NOT NULL DEFAULT '{}'")
        _ensure_column(conn, "chat_messages", "actions_json", "TEXT")
        _ensure_column(conn, "agents", "knowledge_ids_json", "TEXT NOT NULL DEFAULT '[]'")
        conn.executescript(SCHEMA_WEBHOOKS)


def row_to_dict(row: Any) -> dict[str, Any]:
    item = dict(row)
    for key in ("tags_json", "definition_json", "payload_json", "steps_json", "result_json", "details_json", "state_json", "metadata_json", "data_json", "choices_json", "response_payload_json", "allowed_roles_json", "allowed_user_ids_json", "actions_json", "enabled_tools_json", "agent_ids_json", "rows_json", "results_json", "summary_json"):
        if key in item and item[key]:
            item[key] = json.loads(item[key])
    # Handle secret_json separately — may be encrypted
    if "secret_json" in item and item["secret_json"]:
        raw = item["secret_json"]
        try:
            item["secret_json"] = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            # Value is encrypted — decrypt first, then parse
            try:
                from .encryption import decrypt_secret
                decrypted = decrypt_secret(raw)
                item["secret_json"] = json.loads(decrypted)
            except Exception:  # noqa: BLE001
                import logging
                logging.getLogger("flowholt.db").warning(
                    "Failed to decrypt secret_json for row — returning empty dict"
                )
                item["secret_json"] = {}
    return item


def _ensure_column(conn: Any, table_name: str, column_name: str, column_definition: str) -> None:
    if get_database_backend() == "postgres":
        existing_columns = {
            row["column_name"]
            for row in conn.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = ?;
                """,
                (table_name,),
            ).fetchall()
        }
    else:
        existing_columns = {
            row["name"] for row in conn.execute(f"PRAGMA table_info({table_name})").fetchall()
        }
    if column_name not in existing_columns:
        conn.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}")


def _normalize_query(query: str, backend: str) -> str:
    if backend != "postgres":
        return query
    return query.replace("?", "%s")


def _normalize_params(params: Any) -> Any:
    if params is None:
        return ()
    if isinstance(params, list):
        return tuple(params)
    return params
