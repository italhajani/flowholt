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
from ..repository import (
    create_agent, delete_agent, get_agent, list_agents, update_agent,
    create_thread, list_threads, get_thread, delete_thread,
    save_message, get_messages, get_windowed_messages,
    list_knowledge_bases, search_knowledge_chunks,
)

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

    # ── Thread management: find or create a conversation thread ──
    thread_id = body.thread_id if hasattr(body, "thread_id") and body.thread_id else None
    if not thread_id:
        session_key = body.session_key or "default"
        threads = list_threads(agent_id)
        existing = next((t for t in threads if t.get("resource_id") == session_key), None)
        if existing:
            thread_id = existing["id"]
        else:
            thread_row = create_thread(agent_id, title=f"Chat ({session_key})", resource_id=session_key)
            thread_id = thread_row["id"]

    # ── Load conversation history from DB ──
    window_size = detail.memory.window_size if detail.memory.enabled else 0
    history_msgs: list[dict[str, str]] = []
    if window_size > 0:
        past = get_windowed_messages(thread_id, window_size=window_size)
        for m in past:
            history_msgs.append({"role": m["role"], "content": m["content"]})

    # ── Save user message ──
    save_message(thread_id, "user", body.message)

    # ── Knowledge context: retrieve relevant chunks from linked KBs ──
    knowledge_context = ""
    knowledge_ids_json = json.loads(row.get("knowledge_ids_json") or "[]")
    if knowledge_ids_json:
        all_chunks = []
        for kb_id in knowledge_ids_json[:5]:
            chunks = search_knowledge_chunks(kb_id, body.message, top_k=3)
            all_chunks.extend(chunks)
        all_chunks.sort(key=lambda c: c.get("score", 0), reverse=True)
        top_chunks = all_chunks[:5]
        if top_chunks:
            chunk_texts = [f"[{c.get('filename', 'doc')}] {c['content']}" for c in top_chunks]
            knowledge_context = "\n\n--- Knowledge Base Context ---\n" + "\n---\n".join(chunk_texts) + "\n--- End Context ---\n"

    # ── Build messages for LLM ──
    messages: list[dict[str, str]] = []
    system_msg = detail.model_config_data.system_message or ""
    if knowledge_context:
        system_msg += knowledge_context
    if system_msg:
        messages.append({"role": "system", "content": system_msg})
    messages.extend(history_msgs)
    messages.append({"role": "user", "content": body.message})

    # ── Call LLM ──
    router_instance = get_llm_router()
    provider = router_instance.resolve(
        detail.model_config_data.provider or None,
        detail.model_config_data.model or None,
    ) if hasattr(router_instance, "resolve") else router_instance

    try:
        answer = provider.chat(
            messages,
            temperature=float(detail.model_config_data.temperature or 0.7),
            max_tokens=int(detail.model_config_data.max_tokens or 2048),
        )
    except Exception as e:
        answer = f"LLM error: {e}"

    # ── Save assistant response ──
    save_message(thread_id, "assistant", answer)

    return AgentChatResponse(
        answer=answer,
        agent_type=detail.agent_type,
        iterations=1,
        tools_used=[],
        thread_id=thread_id,
    )


# ── Thread Management ──

from ..models import ChatThreadSummary, ChatMessageOut


@router.get("/agents/{agent_id}/threads", response_model=list[ChatThreadSummary])
async def api_list_threads(agent_id: str):
    return list_threads(agent_id)


@router.post("/agents/{agent_id}/threads", response_model=ChatThreadSummary, status_code=201)
async def api_create_thread(agent_id: str, title: str | None = None):
    row = create_thread(agent_id, title=title)
    return {**row, "message_count": 0, "last_message_at": None}


@router.delete("/agents/threads/{thread_id}", status_code=204)
async def api_delete_thread(thread_id: str):
    if not delete_thread(thread_id):
        raise HTTPException(status_code=404, detail="Thread not found")


@router.get("/agents/threads/{thread_id}/messages", response_model=list[ChatMessageOut])
async def api_get_messages(thread_id: str, limit: int = 50):
    return get_messages(thread_id, limit=limit)


# ── Knowledge Base Linking ──

from ..models import KnowledgeBaseSummary


@router.get(f"{settings.api_prefix}/agents/{{agent_id}}/knowledge")
def api_get_agent_knowledge(
    agent_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[KnowledgeBaseSummary]:
    """Get knowledge bases linked to an agent."""
    workspace_id = str(session["workspace"]["id"])
    row = get_agent(agent_id, workspace_id=workspace_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    kb_ids = json.loads(row.get("knowledge_ids_json") or "[]")
    from ..repository import get_knowledge_base
    results = []
    for kb_id in kb_ids:
        kb = get_knowledge_base(kb_id)
        if kb:
            results.append(kb)
    return results


@router.post(f"{settings.api_prefix}/agents/{{agent_id}}/knowledge/{{kb_id}}", status_code=200)
def api_link_knowledge_to_agent(
    agent_id: str,
    kb_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Link a knowledge base to an agent."""
    workspace_id = str(session["workspace"]["id"])
    row = get_agent(agent_id, workspace_id=workspace_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    from ..repository import get_knowledge_base
    kb = get_knowledge_base(kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    kb_ids = json.loads(row.get("knowledge_ids_json") or "[]")
    if kb_id not in kb_ids:
        kb_ids.append(kb_id)
        from ..db import get_db
        with get_db() as conn:
            conn.execute(
                "UPDATE agents SET knowledge_ids_json = ?, updated_at = ? WHERE id = ?",
                (json.dumps(kb_ids), __import__("datetime").datetime.utcnow().isoformat() + "Z", agent_id),
            )
    return {"linked_knowledge_ids": kb_ids}


@router.delete(f"{settings.api_prefix}/agents/{{agent_id}}/knowledge/{{kb_id}}", status_code=200)
def api_unlink_knowledge_from_agent(
    agent_id: str,
    kb_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Unlink a knowledge base from an agent."""
    workspace_id = str(session["workspace"]["id"])
    row = get_agent(agent_id, workspace_id=workspace_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    kb_ids = json.loads(row.get("knowledge_ids_json") or "[]")
    if kb_id in kb_ids:
        kb_ids.remove(kb_id)
        from ..db import get_db
        with get_db() as conn:
            conn.execute(
                "UPDATE agents SET knowledge_ids_json = ?, updated_at = ? WHERE id = ?",
                (json.dumps(kb_ids), __import__("datetime").datetime.utcnow().isoformat() + "Z", agent_id),
            )
    return {"linked_knowledge_ids": kb_ids}
