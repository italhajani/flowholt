import json
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterator

from .config import get_settings


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def _connect() -> sqlite3.Connection:
    db_path = Path(get_settings().database_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db() -> Iterator[sqlite3.Connection]:
    conn = _connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS templates (
                id TEXT PRIMARY KEY,
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
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                trigger_type TEXT NOT NULL,
                category TEXT NOT NULL,
                success_rate INTEGER NOT NULL,
                template_id TEXT,
                definition_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                last_run_at TEXT,
                FOREIGN KEY(template_id) REFERENCES templates(id)
            );

            CREATE TABLE IF NOT EXISTS executions (
                id TEXT PRIMARY KEY,
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
                FOREIGN KEY(workflow_id) REFERENCES workflows(id)
            );
            """
        )


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    item = dict(row)
    for key in ("tags_json", "definition_json", "payload_json", "steps_json", "result_json"):
        if key in item and item[key]:
            item[key] = json.loads(item[key])
    return item
