import json
import sqlite3
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
    require_staging_before_production INTEGER NOT NULL DEFAULT 0,
    require_staging_approval INTEGER NOT NULL DEFAULT 0,
    require_production_approval INTEGER NOT NULL DEFAULT 0,
    deployment_approval_min_role TEXT NOT NULL DEFAULT 'admin',
    allow_self_approval INTEGER NOT NULL DEFAULT 0,
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
"""


class CompatCursor:
    def __init__(self, cursor: Any):
        self._cursor = cursor

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


def _connect() -> Any:
    settings = get_settings()
    if get_database_backend() == "postgres":
        try:
            import psycopg
            from psycopg.rows import dict_row
        except ImportError as exc:
            raise RuntimeError(
                "DATABASE_URL points to Postgres, but psycopg is not installed. "
                "Install backend requirements before using hosted Postgres."
            ) from exc

        return PostgresCompatConnection(psycopg.connect(settings.database_url, row_factory=dict_row))

    db_path = Path(settings.database_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db() -> Iterator[Any]:
    conn = _connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(SCHEMA_SQL)
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
        _ensure_column(conn, "workspace_settings", "require_staging_before_production", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "require_staging_approval", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "require_production_approval", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workspace_settings", "deployment_approval_min_role", "TEXT NOT NULL DEFAULT 'admin'")
        _ensure_column(conn, "workspace_settings", "allow_self_approval", "INTEGER NOT NULL DEFAULT 0")
        _ensure_column(conn, "workflow_deployments", "metadata_json", "TEXT NOT NULL DEFAULT '{}'")


def row_to_dict(row: Any) -> dict[str, Any]:
    item = dict(row)
    for key in ("tags_json", "definition_json", "payload_json", "steps_json", "result_json", "secret_json", "details_json", "state_json", "metadata_json", "data_json", "choices_json", "response_payload_json", "allowed_roles_json", "allowed_user_ids_json"):
        if key in item and item[key]:
            item[key] = json.loads(item[key])
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
