"""
Agents router — AI Agent CRUD + chat endpoint.
"""
from __future__ import annotations

import json
from typing import Any

from .._router_imports import *  # noqa: F401,F403

from ..models import (
    AgentChatRequest,
    AgentChatResponse,
    AgentCreate,
    AgentDetail,
    AgentMemoryConfig,
    AgentModelConfig,
    AgentSummary,
    AgentToolConfig,
    AgentUpdate,
)
from ..repository import create_agent, delete_agent, get_agent, list_agents, update_agent

router = APIRouter()


def _agent_row_to_summary(row: dict[str, Any]) -> AgentSummary:
    tools = json.loads(row.get("tools_json") or "[]")
    return AgentSummary(
        id=row["id"],
        name=row["name"],
        description=row.get("description", ""),
        agent_type=row.get("agent_type", "tools_agent"),
        status=row.get("status", "draft"),
        icon=row.get("icon", "bot"),
        color=row.get("color", "#7c3aed"),
        tools_count=len(tools),
        created_at=row.get("created_at", ""),
        updated_at=row.get("updated_at", ""),
    )


def _agent_row_to_detail(row: dict[str, Any]) -> AgentDetail:
    tools_raw = json.loads(row.get("tools_json") or "[]")
    tools = [AgentToolConfig(**t) for t in tools_raw]
    memory_raw = json.loads(row.get("memory_json") or "{}")
    memory = AgentMemoryConfig(**memory_raw) if memory_raw else AgentMemoryConfig()
    model_raw = json.loads(row.get("model_config_json") or "{}")
    model_cfg = AgentModelConfig(**model_raw) if model_raw else AgentModelConfig()

    return AgentDetail(
        id=row["id"],
        name=row["name"],
        description=row.get("description", ""),
        agent_type=row.get("agent_type", "tools_agent"),
        status=row.get("status", "draft"),
        icon=row.get("icon", "bot"),
        color=row.get("color", "#7c3aed"),
        tools_count=len(tools),
        created_at=row.get("created_at", ""),
        updated_at=row.get("updated_at", ""),
        tools=tools,
        memory=memory,
        model_config_data=model_cfg,
        max_iterations=int(row.get("max_iterations") or 10),
    )


@router.get(f"{settings.api_prefix}/agents")
def api_list_agents(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[AgentSummary]:
    workspace_id = str(session["workspace"]["id"])
    rows = list_agents(workspace_id=workspace_id)
    return [_agent_row_to_summary(r) for r in rows]


@router.post(f"{settings.api_prefix}/agents", status_code=201)
def api_create_agent(
    body: AgentCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> AgentDetail:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    row = create_agent(body, workspace_id=workspace_id, created_by_user_id=user_id)
    return _agent_row_to_detail(row)


@router.get(f"{settings.api_prefix}/agents/{{agent_id}}")
def api_get_agent(
    agent_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> AgentDetail:
    workspace_id = str(session["workspace"]["id"])
    row = get_agent(agent_id, workspace_id=workspace_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return _agent_row_to_detail(row)


@router.put(f"{settings.api_prefix}/agents/{{agent_id}}")
def api_update_agent(
    agent_id: str,
    body: AgentUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> AgentDetail:
    workspace_id = str(session["workspace"]["id"])
    existing = get_agent(agent_id, workspace_id=workspace_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    row = update_agent(agent_id, body, workspace_id=workspace_id)
    if row is None:
        raise HTTPException(status_code=500, detail="Update failed")
    return _agent_row_to_detail(row)


@router.delete(f"{settings.api_prefix}/agents/{{agent_id}}", status_code=204)
def api_delete_agent(
    agent_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> None:
    workspace_id = str(session["workspace"]["id"])
    deleted = delete_agent(agent_id, workspace_id=workspace_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Agent not found")


@router.post(f"{settings.api_prefix}/agents/{{agent_id}}/chat")
def api_agent_chat(
    agent_id: str,
    body: AgentChatRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AgentChatResponse:
    workspace_id = str(session["workspace"]["id"])
    row = get_agent(agent_id, workspace_id=workspace_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Agent not found")

    detail = _agent_row_to_detail(row)

    # Build config for executor's ai_agent handler
    config = {
        "agent_type": detail.agent_type,
        "system_message": detail.model_config_data.system_message,
        "prompt": body.message,
        "max_iterations": detail.max_iterations,
        "provider": detail.model_config_data.provider,
        "model": detail.model_config_data.model,
        "temperature": detail.model_config_data.temperature,
        "max_tokens": detail.model_config_data.max_tokens,
        "tools": [t.model_dump() for t in detail.tools],
        "memory_enabled": detail.memory.enabled,
        "memory_window": detail.memory.window_size,
        "memory_session_key": body.session_key,
    }

    # Use the LLM router directly for a simple chat
    router_instance = get_llm_router()
    provider = router_instance.resolve(
        config.get("provider") or None,
        config.get("model") or None,
    ) if hasattr(router_instance, "resolve") else router_instance

    messages: list[dict[str, str]] = []
    if config.get("system_message"):
        messages.append({"role": "system", "content": config["system_message"]})
    messages.append({"role": "user", "content": body.message})

    try:
        answer = provider.chat(
            messages,
            temperature=float(config.get("temperature", 0.7)),
            max_tokens=int(config.get("max_tokens", 2048)),
        )
    except Exception as e:
        answer = f"LLM error: {e}"

    return AgentChatResponse(
        answer=answer,
        agent_type=detail.agent_type,
        iterations=1,
        tools_used=[],
    )
