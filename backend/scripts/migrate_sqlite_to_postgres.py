from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any

from backend.app.db import get_db, init_db


TABLES: list[tuple[str, list[str]]] = [
    ("users", ["id", "name", "email", "avatar_initials", "created_at"]),
    ("workspaces", ["id", "name", "slug", "plan", "owner_user_id", "created_at"]),
    ("workspace_memberships", ["id", "workspace_id", "user_id", "role", "status", "created_at"]),
    ("user_identities", ["id", "user_id", "provider", "provider_subject", "email", "created_at"]),
    ("workspace_settings", ["workspace_id", "public_base_url", "require_webhook_signature", "webhook_signing_secret", "updated_at"]),
    (
        "templates",
        [
            "id",
            "workspace_id",
            "name",
            "description",
            "category",
            "trigger_type",
            "estimated_time",
            "complexity",
            "color",
            "owner",
            "installs",
            "outcome",
            "tags_json",
            "definition_json",
            "created_at",
            "updated_at",
        ],
    ),
    (
        "workflows",
        [
            "id",
            "workspace_id",
            "created_by_user_id",
            "current_version_number",
            "published_version_id",
            "name",
            "status",
            "trigger_type",
            "category",
            "success_rate",
            "template_id",
            "definition_json",
            "created_at",
            "last_run_at",
        ],
    ),
    (
        "workflow_versions",
        [
            "id",
            "workflow_id",
            "workspace_id",
            "created_by_user_id",
            "version_number",
            "status",
            "notes",
            "definition_json",
            "created_at",
        ],
    ),
    (
        "vault_assets",
        [
            "id",
            "workspace_id",
            "created_by_user_id",
            "kind",
            "name",
            "app",
            "subtitle",
            "logo_url",
            "credential_type",
            "scope",
            "access_text",
            "status",
            "workflows_count",
            "people_with_access",
            "last_used_at",
            "updated_at",
            "masked",
            "secret_json",
        ],
    ),
    (
        "executions",
        [
            "id",
            "workspace_id",
            "initiated_by_user_id",
            "workflow_version_id",
            "workflow_id",
            "workflow_name",
            "status",
            "trigger_type",
            "started_at",
            "finished_at",
            "duration_ms",
            "payload_json",
            "steps_json",
            "result_json",
            "error_text",
        ],
    ),
    (
        "workflow_jobs",
        [
            "id",
            "workspace_id",
            "workflow_id",
            "workflow_version_id",
            "initiated_by_user_id",
            "trigger_type",
            "status",
            "payload_json",
            "attempts",
            "max_attempts",
            "available_at",
            "leased_until",
            "execution_id",
            "error_text",
            "created_at",
            "updated_at",
        ],
    ),
]


def main() -> None:
    source_path = Path(os.getenv("SQLITE_SOURCE_PATH", "backend/flowholt.db"))
    database_url = os.getenv("DATABASE_URL", "").strip()

    if not source_path.exists():
        raise SystemExit(f"SQLite source database not found: {source_path}")
    if not database_url:
        raise SystemExit("DATABASE_URL is required for Postgres migration.")

    init_db()
    summary: list[str] = []
    deferred_workflow_updates: list[dict[str, Any]] = []

    with sqlite3.connect(source_path) as source_conn:
        source_conn.row_factory = sqlite3.Row
        source_workflow_ids = {
            row[0] for row in source_conn.execute("SELECT id FROM workflows").fetchall()
        }
        with get_db() as target_conn:
            for table_name, columns in TABLES:
                rows = source_conn.execute(f"SELECT * FROM {table_name}").fetchall()
                copied = 0
                if rows:
                    column_list = ", ".join(columns)
                    placeholders = ", ".join(["%s"] * len(columns))
                    update_clause = ", ".join(
                        f"{column} = EXCLUDED.{column}" for column in columns if column not in {"id", "workspace_id"} or table_name == "workspace_settings"
                    )
                    conflict_target = "workspace_id" if table_name == "workspace_settings" else "id"
                    sql = (
                        f"INSERT INTO {table_name} ({column_list}) VALUES ({placeholders}) "
                        f"ON CONFLICT ({conflict_target}) DO UPDATE SET {update_clause}"
                    )

                    for row in rows:
                        if table_name == "workflow_versions" and row["workflow_id"] not in source_workflow_ids:
                            continue
                        values = []
                        for column in columns:
                            value = row[column]
                            if table_name == "workflows" and column == "published_version_id":
                                deferred_workflow_updates.append(
                                    {
                                        "id": row["id"],
                                        "workspace_id": row["workspace_id"],
                                        "published_version_id": row["published_version_id"],
                                        "current_version_number": row["current_version_number"],
                                    }
                                )
                                value = None
                            values.append(_normalize_value(value))
                        target_conn.execute(sql, values)
                        copied += 1
                summary.append(f"{table_name}:{copied}")

            for workflow in deferred_workflow_updates:
                target_conn.execute(
                    """
                    UPDATE workflows
                    SET current_version_number = %s, published_version_id = %s
                    WHERE id = %s AND workspace_id = %s
                    """,
                    (
                        workflow["current_version_number"],
                        workflow["published_version_id"],
                        workflow["id"],
                        workflow["workspace_id"],
                    ),
                )

    print("MIGRATION_OK", " ".join(summary))


def _normalize_value(value: Any) -> Any:
    if isinstance(value, (dict, list)):
        return json.dumps(value)
    return value


if __name__ == "__main__":
    main()
