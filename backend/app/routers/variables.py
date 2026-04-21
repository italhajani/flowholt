"""
Variables router — workspace environment variables CRUD.
Variables are key-value pairs available to workflows at runtime via expressions.
"""
from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from ..config import get_settings
from ..db import get_db
from ..deps import get_session_context

settings = get_settings()
router = APIRouter()
PREFIX = f"{settings.api_prefix}/variables"


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class VariableCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    value: str = ""
    type: str = "string"  # string | number | boolean | connection | url
    scope: str = "shared"  # shared | development | staging | production
    secret: bool = False


class VariableUpdate(BaseModel):
    name: str | None = None
    value: str | None = None
    type: str | None = None
    scope: str | None = None
    secret: bool | None = None


class VariableResponse(BaseModel):
    id: str
    name: str
    value: str
    type: str
    scope: str
    secret: bool
    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

_TABLE = "variables"


def _ensure_table(db: Any):
    db.execute(f"""
        CREATE TABLE IF NOT EXISTS {_TABLE} (
            id TEXT PRIMARY KEY,
            workspace_id TEXT DEFAULT 'default',
            name TEXT NOT NULL,
            value TEXT DEFAULT '',
            type TEXT DEFAULT 'string',
            scope TEXT DEFAULT 'shared',
            secret INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    db.commit()


def _row_to_response(row: dict) -> VariableResponse:
    val = row["value"]
    if row.get("secret"):
        val = val[:4] + "..." + val[-4:] if len(val) > 8 else "••••••••"
    return VariableResponse(
        id=row["id"],
        name=row["name"],
        value=val,
        type=row.get("type", "string"),
        scope=row.get("scope", "shared"),
        secret=bool(row.get("secret", 0)),
        created_at=row.get("created_at", ""),
        updated_at=row.get("updated_at", ""),
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(PREFIX, response_model=list[VariableResponse])
async def list_variables(ctx=Depends(get_session_context)):
    with get_db() as db:
        _ensure_table(db)
        cursor = db.execute(
            f"SELECT * FROM {_TABLE} WHERE workspace_id = ? ORDER BY name",
            (ctx.get("workspace_id", "default"),),
        )
        rows = [dict(r) for r in cursor.fetchall()]
        return [_row_to_response(r) for r in rows]


@router.post(PREFIX, response_model=VariableResponse, status_code=201)
async def create_variable(body: VariableCreate, ctx=Depends(get_session_context)):
    with get_db() as db:
        _ensure_table(db)
        now = datetime.now(UTC).isoformat()
        var_id = f"var-{uuid.uuid4().hex[:12]}"
        workspace_id = ctx.get("workspace_id", "default")

        existing = db.execute(
            f"SELECT id FROM {_TABLE} WHERE workspace_id = ? AND name = ?",
            (workspace_id, body.name),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail=f"Variable '{body.name}' already exists")

        db.execute(
            f"""INSERT INTO {_TABLE} (id, workspace_id, name, value, type, scope, secret, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (var_id, workspace_id, body.name, body.value, body.type, body.scope, int(body.secret), now, now),
        )
        db.commit()

        row = dict(db.execute(f"SELECT * FROM {_TABLE} WHERE id = ?", (var_id,)).fetchone())
        return _row_to_response(row)


@router.get(f"{PREFIX}/{{var_id}}", response_model=VariableResponse)
async def get_variable(var_id: str, ctx=Depends(get_session_context)):
    with get_db() as db:
        _ensure_table(db)
        row = db.execute(f"SELECT * FROM {_TABLE} WHERE id = ?", (var_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Variable not found")
        return _row_to_response(dict(row))


@router.patch(f"{PREFIX}/{{var_id}}", response_model=VariableResponse)
async def update_variable(var_id: str, body: VariableUpdate, ctx=Depends(get_session_context)):
    with get_db() as db:
        _ensure_table(db)
        row = db.execute(f"SELECT * FROM {_TABLE} WHERE id = ?", (var_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Variable not found")

        updates = body.model_dump(exclude_unset=True)
        if "secret" in updates:
            updates["secret"] = int(updates["secret"])
        updates["updated_at"] = datetime.now(UTC).isoformat()

        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [var_id]
        db.execute(f"UPDATE {_TABLE} SET {set_clause} WHERE id = ?", values)
        db.commit()

        row = dict(db.execute(f"SELECT * FROM {_TABLE} WHERE id = ?", (var_id,)).fetchone())
        return _row_to_response(row)


@router.delete(f"{PREFIX}/{{var_id}}")
async def delete_variable(var_id: str, ctx=Depends(get_session_context)) -> Response:
    with get_db() as db:
        _ensure_table(db)
        row = db.execute(f"SELECT * FROM {_TABLE} WHERE id = ?", (var_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Variable not found")
        db.execute(f"DELETE FROM {_TABLE} WHERE id = ?", (var_id,))
        db.commit()
        return Response(status_code=204)
