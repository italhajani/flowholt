"""Agent evaluation — golden dataset management + test run execution."""

import json
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from ..db import get_db, row_to_dict
from ..deps import get_session_context

router = APIRouter(prefix="/api/eval", tags=["evaluation"])


# ── Models ───────────────────────────────────────────────────────────

class EvalDatasetCreate(BaseModel):
    agent_id: str
    name: str
    description: str | None = None
    rows: list[dict] | None = None  # [{input, expected_output, tags?}]


class EvalDatasetUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    rows: list[dict] | None = None


class EvalRunCreate(BaseModel):
    dataset_id: str
    agent_id: str


# ── Dataset CRUD ─────────────────────────────────────────────────────

@router.get("/datasets")
def list_datasets(agent_id: str | None = None, ctx=get_session_context):
    with get_db() as conn:
        if agent_id:
            rows = conn.execute(
                "SELECT * FROM eval_datasets WHERE workspace_id = ? AND agent_id = ? ORDER BY created_at DESC",
                (ctx["workspace_id"], agent_id),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM eval_datasets WHERE workspace_id = ? ORDER BY created_at DESC",
                (ctx["workspace_id"],),
            ).fetchall()
    return [row_to_dict(r) for r in rows]


@router.post("/datasets", status_code=201)
def create_dataset(payload: EvalDatasetCreate, ctx=get_session_context):
    now = datetime.now(UTC).isoformat()
    ds_id = str(uuid.uuid4())
    with get_db() as conn:
        conn.execute(
            """INSERT INTO eval_datasets (id, workspace_id, agent_id, name, description, rows_json, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (ds_id, ctx["workspace_id"], payload.agent_id, payload.name,
             payload.description, json.dumps(payload.rows or []), now, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM eval_datasets WHERE id = ?", (ds_id,)).fetchone()
    return row_to_dict(row)


@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: str, ctx=get_session_context):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM eval_datasets WHERE id = ? AND workspace_id = ?",
            (dataset_id, ctx["workspace_id"]),
        ).fetchone()
    if not row:
        raise HTTPException(404, "Dataset not found")
    return row_to_dict(row)


@router.put("/datasets/{dataset_id}")
def update_dataset(dataset_id: str, payload: EvalDatasetUpdate, ctx=get_session_context):
    now = datetime.now(UTC).isoformat()
    with get_db() as conn:
        existing = conn.execute(
            "SELECT * FROM eval_datasets WHERE id = ? AND workspace_id = ?",
            (dataset_id, ctx["workspace_id"]),
        ).fetchone()
        if not existing:
            raise HTTPException(404, "Dataset not found")
        updates: dict = {}
        if payload.name is not None:
            updates["name"] = payload.name
        if payload.description is not None:
            updates["description"] = payload.description
        if payload.rows is not None:
            updates["rows_json"] = json.dumps(payload.rows)
        if updates:
            sets = ", ".join(f"{k} = ?" for k in updates)
            conn.execute(
                f"UPDATE eval_datasets SET {sets}, updated_at = ? WHERE id = ?",
                (*updates.values(), now, dataset_id),
            )
            conn.commit()
        row = conn.execute("SELECT * FROM eval_datasets WHERE id = ?", (dataset_id,)).fetchone()
    return row_to_dict(row)


@router.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: str, ctx=get_session_context) -> Response:
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM eval_datasets WHERE id = ? AND workspace_id = ?",
            (dataset_id, ctx["workspace_id"]),
        )
        conn.commit()
    if cur.rowcount == 0:
        raise HTTPException(404, "Dataset not found")
    return Response(status_code=204)


# ── Evaluation Runs ──────────────────────────────────────────────────

@router.get("/runs")
def list_runs(agent_id: str | None = None, dataset_id: str | None = None, ctx=get_session_context):
    with get_db() as conn:
        q = "SELECT r.* FROM eval_runs r JOIN eval_datasets d ON r.dataset_id = d.id WHERE d.workspace_id = ?"
        params: list = [ctx["workspace_id"]]
        if agent_id:
            q += " AND r.agent_id = ?"
            params.append(agent_id)
        if dataset_id:
            q += " AND r.dataset_id = ?"
            params.append(dataset_id)
        q += " ORDER BY r.created_at DESC"
        rows = conn.execute(q, params).fetchall()
    return [row_to_dict(r) for r in rows]


@router.post("/runs", status_code=201)
def create_run(payload: EvalRunCreate, ctx=get_session_context):
    """Start an evaluation run. Runs each dataset row through the agent
    and scores the results. Currently uses simple string-match scoring."""
    now = datetime.now(UTC).isoformat()
    run_id = str(uuid.uuid4())

    with get_db() as conn:
        ds = conn.execute(
            "SELECT * FROM eval_datasets WHERE id = ? AND workspace_id = ?",
            (payload.dataset_id, ctx["workspace_id"]),
        ).fetchone()
        if not ds:
            raise HTTPException(404, "Dataset not found")
        ds_dict = row_to_dict(ds)

        # Execute each row through the agent chat endpoint
        from .agents import _chat_with_agent
        test_rows = ds_dict.get("rows_json", [])
        if isinstance(test_rows, str):
            test_rows = json.loads(test_rows)

        results = []
        passed = 0
        total = len(test_rows)
        for row_data in test_rows:
            input_text = row_data.get("input", "")
            expected = row_data.get("expected_output", "")
            try:
                answer = _chat_with_agent(payload.agent_id, input_text, ctx)
                # Simple scoring: check if expected output keywords appear
                score = _score_response(answer, expected)
                results.append({
                    "input": input_text,
                    "expected": expected,
                    "actual": answer,
                    "score": score,
                    "passed": score >= 0.5,
                })
                if score >= 0.5:
                    passed += 1
            except Exception as e:
                results.append({
                    "input": input_text,
                    "expected": expected,
                    "actual": str(e),
                    "score": 0.0,
                    "passed": False,
                })

        summary = {
            "total": total,
            "passed": passed,
            "failed": total - passed,
            "avg_score": round(sum(r["score"] for r in results) / max(total, 1), 3),
        }

        conn.execute(
            """INSERT INTO eval_runs (id, dataset_id, agent_id, status, results_json, summary_json, started_at, completed_at, created_at)
               VALUES (?, ?, ?, 'completed', ?, ?, ?, ?, ?)""",
            (run_id, payload.dataset_id, payload.agent_id,
             json.dumps(results), json.dumps(summary), now, datetime.now(UTC).isoformat(), now),
        )
        conn.commit()
        run_row = conn.execute("SELECT * FROM eval_runs WHERE id = ?", (run_id,)).fetchone()
    return row_to_dict(run_row)


@router.get("/runs/{run_id}")
def get_run(run_id: str, ctx=get_session_context):
    with get_db() as conn:
        row = conn.execute(
            """SELECT r.* FROM eval_runs r JOIN eval_datasets d ON r.dataset_id = d.id
               WHERE r.id = ? AND d.workspace_id = ?""",
            (run_id, ctx["workspace_id"]),
        ).fetchone()
    if not row:
        raise HTTPException(404, "Run not found")
    return row_to_dict(row)


# ── Scoring helpers ──────────────────────────────────────────────────

def _score_response(actual: str, expected: str) -> float:
    """Simple keyword overlap scoring. Returns 0.0-1.0."""
    if not expected:
        return 1.0
    expected_words = set(expected.lower().split())
    actual_words = set(actual.lower().split())
    if not expected_words:
        return 1.0
    overlap = expected_words & actual_words
    return len(overlap) / len(expected_words)


def _chat_with_agent(agent_id: str, message: str, ctx: dict) -> str:
    """Synchronously call agent chat. Simplified for eval — no thread persistence."""
    from ..repository import get_agent
    from ..llm_router import get_llm_router

    agent = get_agent(agent_id)
    if not agent:
        raise HTTPException(404, f"Agent {agent_id} not found")

    system_prompt = agent.get("system_instructions", "You are a helpful assistant.")
    model_cfg = agent.get("model_config_data") or {}
    provider = model_cfg.get("provider", "echo")
    model = model_cfg.get("model", "echo")

    llm = get_llm_router().resolve(provider, model)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message},
    ]
    response = llm.chat(messages)
    return response.get("content", response.get("text", str(response)))
