"""MCP Server management + MCP Client call endpoints."""

import json
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from ..db import get_db, row_to_dict
from ..deps import get_session_context

router = APIRouter(prefix="/api/mcp", tags=["mcp"])


# ── Pydantic models ──────────────────────────────────────────────────

class MCPServerCreate(BaseModel):
    name: str
    url: str
    transport: str = "stdio"
    api_key: str | None = None
    health_check_interval: int = 60
    auto_reconnect: bool = True
    enabled_tools: list[str] | None = None
    agent_ids: list[str] | None = None


class MCPServerUpdate(BaseModel):
    name: str | None = None
    url: str | None = None
    transport: str | None = None
    api_key: str | None = None
    health_check_interval: int | None = None
    auto_reconnect: bool | None = None
    enabled_tools: list[str] | None = None
    status: str | None = None


class MCPToolCallRequest(BaseModel):
    server_id: str
    tool_name: str
    arguments: dict | None = None


# ── CRUD endpoints ───────────────────────────────────────────────────

@router.get("/servers")
def list_mcp_servers(ctx=get_session_context):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM mcp_servers WHERE workspace_id = ? ORDER BY created_at DESC",
            (ctx["workspace_id"],),
        ).fetchall()
    return [row_to_dict(r) for r in rows]


@router.post("/servers", status_code=201)
def create_mcp_server(payload: MCPServerCreate, ctx=get_session_context):
    now = datetime.now(UTC).isoformat()
    server_id = str(uuid.uuid4())
    with get_db() as conn:
        conn.execute(
            """INSERT INTO mcp_servers
               (id, workspace_id, name, url, transport, api_key, health_check_interval,
                auto_reconnect, enabled_tools_json, agent_ids_json, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'healthy', ?, ?)""",
            (
                server_id, ctx["workspace_id"], payload.name, payload.url,
                payload.transport, payload.api_key, payload.health_check_interval,
                int(payload.auto_reconnect),
                json.dumps(payload.enabled_tools or []),
                json.dumps(payload.agent_ids or []),
                now, now,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM mcp_servers WHERE id = ?", (server_id,)).fetchone()
    return row_to_dict(row)


@router.get("/servers/{server_id}")
def get_mcp_server(server_id: str, ctx=get_session_context):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM mcp_servers WHERE id = ? AND workspace_id = ?",
            (server_id, ctx["workspace_id"]),
        ).fetchone()
    if not row:
        raise HTTPException(404, "MCP server not found")
    return row_to_dict(row)


@router.put("/servers/{server_id}")
def update_mcp_server(server_id: str, payload: MCPServerUpdate, ctx=get_session_context):
    now = datetime.now(UTC).isoformat()
    with get_db() as conn:
        existing = conn.execute(
            "SELECT * FROM mcp_servers WHERE id = ? AND workspace_id = ?",
            (server_id, ctx["workspace_id"]),
        ).fetchone()
        if not existing:
            raise HTTPException(404, "MCP server not found")

        updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
        if "enabled_tools" in updates:
            updates["enabled_tools_json"] = json.dumps(updates.pop("enabled_tools"))
        sets = ", ".join(f"{k} = ?" for k in updates)
        if sets:
            conn.execute(
                f"UPDATE mcp_servers SET {sets}, updated_at = ? WHERE id = ?",
                (*updates.values(), now, server_id),
            )
            conn.commit()
        row = conn.execute("SELECT * FROM mcp_servers WHERE id = ?", (server_id,)).fetchone()
    return row_to_dict(row)


@router.delete("/servers/{server_id}")
def delete_mcp_server(server_id: str, ctx=get_session_context) -> Response:
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM mcp_servers WHERE id = ? AND workspace_id = ?",
            (server_id, ctx["workspace_id"]),
        )
        conn.commit()
    if cur.rowcount == 0:
        raise HTTPException(404, "MCP server not found")
    return Response(status_code=204)


# ── MCP Tool call (proxy to external MCP server) ────────────────────

@router.post("/call")
def call_mcp_tool(payload: MCPToolCallRequest, ctx=get_session_context):
    """Call a tool on an external MCP server. Currently returns a mock response;
    actual MCP HTTP/stdio transport will be added in a future sprint."""
    with get_db() as conn:
        server = conn.execute(
            "SELECT * FROM mcp_servers WHERE id = ? AND workspace_id = ?",
            (payload.server_id, ctx["workspace_id"]),
        ).fetchone()
    if not server:
        raise HTTPException(404, "MCP server not found")

    # TODO: Implement actual MCP protocol call (SSE/stdio/streamable-HTTP)
    return {
        "server_id": payload.server_id,
        "tool_name": payload.tool_name,
        "result": {
            "content": [{"type": "text", "text": f"Mock result from {payload.tool_name}"}],
            "isError": False,
        },
    }
