from __future__ import annotations

import json
import uuid
from typing import Any

from .db import get_db, row_to_dict, utc_now
from .models import WorkflowCreate


def list_templates() -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM templates ORDER BY name").fetchall()
    return [_normalize_template(row_to_dict(row)) for row in rows]


def get_template(template_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM templates WHERE id = ?", (template_id,)).fetchone()
    if row is None:
        return None
    item = row_to_dict(row)
    return {
        "id": item["id"],
        "name": item["name"],
        "description": item["description"],
        "category": item["category"],
        "trigger_type": item["trigger_type"],
        "estimated_time": item["estimated_time"],
        "complexity": item["complexity"],
        "color": item["color"],
        "owner": item["owner"],
        "installs": item["installs"],
        "outcome": item["outcome"],
        "tags": item["tags_json"],
        "definition": item["definition_json"],
    }


def list_workflows() -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM workflows ORDER BY created_at DESC").fetchall()
    return [row_to_dict(row) for row in rows]


def get_workflow(workflow_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    return row_to_dict(row) if row else None


def create_workflow(payload: WorkflowCreate) -> dict[str, Any]:
    workflow_id = f"w-{uuid.uuid4().hex[:10]}"
    now = utc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workflows (
                id, name, status, trigger_type, category, success_rate, template_id,
                definition_json, created_at, last_run_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                workflow_id,
                payload.name,
                payload.status,
                payload.trigger_type,
                payload.category,
                100,
                payload.template_id,
                payload.definition.model_dump_json(),
                now,
                None,
            ),
        )
    workflow = get_workflow(workflow_id)
    if workflow is None:
        raise RuntimeError("Workflow creation failed.")
    return workflow


def list_executions() -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM executions ORDER BY started_at DESC").fetchall()
    return [row_to_dict(row) for row in rows]


def create_execution_record(workflow: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    execution_id = f"e-{uuid.uuid4().hex[:10]}"
    now = utc_now()
    record = {
        "id": execution_id,
        "workflow_id": workflow["id"],
        "workflow_name": workflow["name"],
        "status": "running",
        "trigger_type": workflow["trigger_type"],
        "started_at": now,
        "finished_at": None,
        "duration_ms": None,
        "payload_json": payload,
        "steps_json": [],
        "result_json": None,
        "error_text": None,
    }
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO executions (
                id, workflow_id, workflow_name, status, trigger_type, started_at, finished_at,
                duration_ms, payload_json, steps_json, result_json, error_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["id"],
                record["workflow_id"],
                record["workflow_name"],
                record["status"],
                record["trigger_type"],
                record["started_at"],
                record["finished_at"],
                record["duration_ms"],
                json.dumps(record["payload_json"]),
                json.dumps(record["steps_json"]),
                record["result_json"],
                record["error_text"],
            ),
        )
    return record


def finish_execution_record(
    execution_id: str,
    *,
    status: str,
    duration_ms: int,
    steps: list[dict[str, Any]],
    result: dict[str, Any] | None,
    error_text: str | None,
) -> dict[str, Any]:
    finished_at = utc_now()
    with get_db() as conn:
        conn.execute(
            """
            UPDATE executions
            SET status = ?, finished_at = ?, duration_ms = ?, steps_json = ?, result_json = ?, error_text = ?
            WHERE id = ?
            """,
            (
                status,
                finished_at,
                duration_ms,
                json.dumps(steps),
                json.dumps(result) if result is not None else None,
                error_text,
                execution_id,
            ),
        )
        row = conn.execute("SELECT * FROM executions WHERE id = ?", (execution_id,)).fetchone()
    if row is None:
        raise RuntimeError("Execution update failed.")
    return row_to_dict(row)


def touch_workflow_run(workflow_id: str) -> None:
    with get_db() as conn:
        conn.execute("UPDATE workflows SET last_run_at = ? WHERE id = ?", (utc_now(), workflow_id))


def _normalize_template(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": item["id"],
        "name": item["name"],
        "description": item["description"],
        "category": item["category"],
        "trigger_type": item["trigger_type"],
        "estimated_time": item["estimated_time"],
        "complexity": item["complexity"],
        "color": item["color"],
        "owner": item["owner"],
        "installs": item["installs"],
        "outcome": item["outcome"],
        "tags": item["tags_json"],
    }
