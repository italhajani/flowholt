"""
Chat router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403
from ..helpers import _execute_workflow  # noqa: F401

router = APIRouter()

def _resolve_assistant_chat_messages(
    payload: AssistantChatRequest,
    *,
    workspace_id: str,
    user_id: str,
) -> list[dict[str, str]]:
    messages = [{"role": message.role, "content": message.content} for message in payload.messages]
    if payload.attachment_ids:
        with get_db() as db:
            attachment_rows = _resolve_chat_attachment_rows(
                db,
                payload.attachment_ids,
                workspace_id=workspace_id,
                user_id=user_id,
                thread_id=None,
            )
        attachment_context = _render_chat_attachment_context(attachment_rows)
        if attachment_context:
            for index in range(len(messages) - 1, -1, -1):
                if messages[index]["role"] != "user":
                    continue
                base_content = str(messages[index]["content"])
                messages[index]["content"] = f"{base_content}\n\n{attachment_context}" if base_content.strip() else attachment_context
                break
    return messages



def _format_sse_event(event: str, data: Any) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"



def _chat_attachment_root() -> Path:
    root = Path(settings.chat_attachment_dir)
    root.mkdir(parents=True, exist_ok=True)
    return root



def _sanitize_chat_attachment_name(file_name: str) -> str:
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(file_name or "attachment").name).strip("._")
    return safe_name or "attachment"



def _is_text_like_chat_attachment(file_name: str, content_type: str) -> bool:
    normalized_content_type = (content_type or "").lower()
    if normalized_content_type.startswith("text/") or normalized_content_type in CHAT_ATTACHMENT_TEXT_CONTENT_TYPES:
        return True
    return Path(file_name).suffix.lower() in CHAT_ATTACHMENT_TEXT_EXTENSIONS



def _extract_chat_attachment_preview(raw_bytes: bytes, file_name: str, content_type: str) -> str | None:
    if not _is_text_like_chat_attachment(file_name, content_type):
        return None
    decoded = raw_bytes.decode("utf-8", errors="ignore").replace("\x00", " ").strip()
    if not decoded:
        return None
    return decoded[: settings.chat_attachment_text_preview_chars]



def _build_chat_attachment_item(row: dict[str, Any]) -> ChatAttachmentItem:
    return ChatAttachmentItem(
        id=str(row["id"]),
        file_name=str(row["file_name"]),
        content_type=str(row.get("content_type") or "application/octet-stream"),
        size_bytes=int(row.get("size_bytes") or 0),
        preview_text=str(row["preview_text"]) if row.get("preview_text") else None,
        created_at=str(row["created_at"]),
    )



def _load_chat_attachment_rows_by_message(
    db: Any,
    message_ids: list[str],
    *,
    workspace_id: str,
    user_id: str,
) -> dict[str, list[dict[str, Any]]]:
    if not message_ids:
        return {}
    placeholders = ", ".join(["?"] * len(message_ids))
    params = tuple(message_ids + [workspace_id, user_id])
    rows = db.execute(
        f"SELECT * FROM chat_attachments WHERE message_id IN ({placeholders}) AND workspace_id = ? AND user_id = ? ORDER BY created_at ASC",
        params,
    ).fetchall()
    attachments_by_message: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        item = row_to_dict(row)
        message_id = str(item.get("message_id") or "")
        attachments_by_message.setdefault(message_id, []).append(item)
    return attachments_by_message



def _resolve_chat_attachment_rows(
    db: Any,
    attachment_ids: list[str],
    *,
    workspace_id: str,
    user_id: str,
    thread_id: str | None,
) -> list[dict[str, Any]]:
    if not attachment_ids:
        return []

    unique_ids = list(dict.fromkeys(attachment_ids))
    placeholders = ", ".join(["?"] * len(unique_ids))
    params = tuple(unique_ids + [workspace_id, user_id])
    rows = db.execute(
        f"SELECT * FROM chat_attachments WHERE id IN ({placeholders}) AND workspace_id = ? AND user_id = ?",
        params,
    ).fetchall()
    row_map = {str(item["id"]): row_to_dict(item) for item in rows}

    if len(row_map) != len(unique_ids):
        raise HTTPException(400, "One or more attachments could not be found.")

    resolved_rows: list[dict[str, Any]] = []
    for attachment_id in unique_ids:
        item = row_map[attachment_id]
        bound_thread_id = str(item.get("thread_id") or "")
        if bound_thread_id and bound_thread_id != (thread_id or ""):
            raise HTTPException(400, "One or more attachments are already linked to another conversation.")
        if item.get("message_id"):
            raise HTTPException(400, "One or more attachments were already sent in this conversation.")
        resolved_rows.append(item)
    return resolved_rows



def _render_chat_attachment_context(attachment_rows: list[dict[str, Any]]) -> str:
    if not attachment_rows:
        return ""

    lines = ["Attached files:"]
    for attachment in attachment_rows:
        lines.append(
            f"- {attachment['file_name']} ({attachment.get('content_type') or 'application/octet-stream'}, {attachment.get('size_bytes') or 0} bytes)"
        )
        if attachment.get("preview_text"):
            lines.append(f"  Preview:\n{attachment['preview_text']}")
        else:
            lines.append("  Preview unavailable because this file is binary or could not be decoded as text.")
    return "\n".join(lines)



def _hydrate_chat_messages(db: Any, *, thread_id: str, workspace_id: str, user_id: str) -> list[ChatMessageItem]:
    rows = [row_to_dict(row) for row in db.execute(
        "SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC",
        (thread_id,),
    ).fetchall()]
    attachments_by_message = _load_chat_attachment_rows_by_message(
        db,
        [str(row["id"]) for row in rows],
        workspace_id=workspace_id,
        user_id=user_id,
    )
    return [
        ChatMessageItem(
            id=str(row["id"]),
            thread_id=str(row["thread_id"]),
            role=str(row["role"]),
            content=str(row["content"]),
            model_used=str(row["model_used"]) if row.get("model_used") else None,
            actions=list(row.get("actions_json") or []),
            attachments=[
                _build_chat_attachment_item(attachment)
                for attachment in attachments_by_message.get(str(row["id"]), [])
            ],
            created_at=str(row["created_at"]),
        )
        for row in rows
    ]



@router.post(f"{settings.api_prefix}/chat/attachments", response_model=ChatAttachmentUploadResponse, status_code=201)
async def upload_chat_attachments(
    files: list[UploadFile] = File(...),
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatAttachmentUploadResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    attachment_root = _chat_attachment_root() / workspace_id / user_id
    attachment_root.mkdir(parents=True, exist_ok=True)

    attachments: list[ChatAttachmentItem] = []
    for uploaded in files:
        raw_bytes = await uploaded.read()
        if not raw_bytes:
            continue
        if len(raw_bytes) > settings.chat_attachment_max_bytes:
            raise HTTPException(413, f"{uploaded.filename or 'Attachment'} exceeds the {settings.chat_attachment_max_bytes // (1024 * 1024)}MB upload limit.")

        attachment_id = f"ca-{secrets.token_hex(12)}"
        safe_name = _sanitize_chat_attachment_name(uploaded.filename or "attachment")
        content_type = uploaded.content_type or mimetypes.guess_type(safe_name)[0] or "application/octet-stream"
        preview_text = _extract_chat_attachment_preview(raw_bytes, safe_name, content_type)
        now = datetime.now(UTC).isoformat()
        storage_path = attachment_root / f"{attachment_id}-{safe_name}"
        storage_path.write_bytes(raw_bytes)

        with get_db() as db:
            db.execute(
                """
                INSERT INTO chat_attachments (
                    id, workspace_id, user_id, thread_id, message_id, file_name, content_type, size_bytes, storage_path, preview_text, created_at
                ) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?)
                """,
                (
                    attachment_id,
                    workspace_id,
                    user_id,
                    safe_name,
                    content_type,
                    len(raw_bytes),
                    str(storage_path),
                    preview_text,
                    now,
                ),
            )

        attachments.append(ChatAttachmentItem(
            id=attachment_id,
            file_name=safe_name,
            content_type=content_type,
            size_bytes=len(raw_bytes),
            preview_text=preview_text,
            created_at=now,
        ))

    return ChatAttachmentUploadResponse(attachments=attachments)



@router.get(f"{settings.api_prefix}/chat/attachments/{{attachment_id}}")
def download_chat_attachment(
    attachment_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> FileResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM chat_attachments WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (attachment_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Attachment not found")
        attachment = row_to_dict(row)

    storage_path = Path(str(attachment["storage_path"]))
    if not storage_path.exists():
        raise HTTPException(404, "Attachment file is missing")
    return FileResponse(
        storage_path,
        media_type=str(attachment.get("content_type") or "application/octet-stream"),
        filename=str(attachment.get("file_name") or storage_path.name),
    )



@router.get(f"{settings.api_prefix}/chat/threads", response_model=ChatThreadListResponse)
def list_chat_threads(
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatThreadListResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM chat_threads WHERE workspace_id = ? AND user_id = ? ORDER BY pinned DESC, updated_at DESC",
            (workspace_id, user_id),
        ).fetchall()
        threads: list[ChatThreadSummary] = []
        for r in rows:
            row = dict(r)
            # fetch last message preview & count
            cnt = db.execute("SELECT COUNT(*) AS c FROM chat_messages WHERE thread_id = ?", (row["id"],)).fetchone()
            last = db.execute(
                "SELECT content, role FROM chat_messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1",
                (row["id"],),
            ).fetchone()
            threads.append(ChatThreadSummary(
                id=row["id"],
                title=row["title"],
                model=row.get("model") or "",
                pinned=bool(row.get("pinned", 0)),
                message_count=dict(cnt)["c"] if cnt else 0,
                last_message_preview=(dict(last)["content"][:100] if last else ""),
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            ))
    return ChatThreadListResponse(threads=threads)



@router.post(f"{settings.api_prefix}/chat/threads", response_model=ChatThreadDetail, status_code=201)
def create_chat_thread(
    payload: ChatThreadCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatThreadDetail:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    now = datetime.now(UTC).isoformat()
    thread_id = f"ct-{secrets.token_hex(12)}"
    selected_model = (payload.model or _get_default_chat_provider()).strip()
    with get_db() as db:
        db.execute(
            "INSERT INTO chat_threads (id, workspace_id, user_id, title, model, pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)",
            (thread_id, workspace_id, user_id, payload.title, selected_model, now, now),
        )
    messages: list[ChatMessageItem] = []
    thread_title = payload.title
    thread_updated_at = now
    # If initial message provided, send it immediately
    if payload.initial_message and payload.initial_message.strip():
        resp = _chat_send(
            thread_id,
            workspace_id,
            user_id,
            payload.initial_message.strip(),
            selected_model,
            payload.attachment_ids,
        )
        messages = [resp.user_message, resp.assistant_message]
        thread_title = resp.thread_title
        thread_updated_at = resp.assistant_message.created_at

    if not messages:
        with get_db() as db:
            thread_row = db.execute(
                "SELECT title, updated_at FROM chat_threads WHERE id = ?",
                (thread_id,),
            ).fetchone()
            if thread_row:
                thread_title = str(thread_row["title"])
                thread_updated_at = str(thread_row["updated_at"])

    return ChatThreadDetail(
        id=thread_id,
        title=thread_title,
        model=selected_model,
        pinned=False,
        messages=messages,
        created_at=now,
        updated_at=thread_updated_at,
    )



@router.get(f"{settings.api_prefix}/chat/threads/{{thread_id}}", response_model=ChatThreadDetail)
def get_chat_thread(
    thread_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatThreadDetail:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM chat_threads WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (thread_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Thread not found")
        thread = row_to_dict(row)
        messages = _hydrate_chat_messages(db, thread_id=thread_id, workspace_id=workspace_id, user_id=user_id)
    return ChatThreadDetail(
        id=thread["id"],
        title=thread["title"],
        model=thread.get("model") or "",
        pinned=bool(thread.get("pinned", 0)),
        messages=messages,
        created_at=thread["created_at"],
        updated_at=thread["updated_at"],
    )



@router.patch(f"{settings.api_prefix}/chat/threads/{{thread_id}}", response_model=ChatThreadDetail)
def update_chat_thread(
    thread_id: str,
    payload: ChatThreadUpdateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatThreadDetail:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    now = datetime.now(UTC).isoformat()
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM chat_threads WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (thread_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Thread not found")
        if payload.title is not None:
            db.execute("UPDATE chat_threads SET title = ?, updated_at = ? WHERE id = ?", (payload.title, now, thread_id))
        if payload.pinned is not None:
            db.execute("UPDATE chat_threads SET pinned = ?, updated_at = ? WHERE id = ?", (1 if payload.pinned else 0, now, thread_id))
    return get_chat_thread(thread_id, session)



@router.delete(f"{settings.api_prefix}/chat/threads/{{thread_id}}", status_code=204)
def delete_chat_thread(
    thread_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    with get_db() as db:
        row = db.execute(
            "SELECT id FROM chat_threads WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (thread_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Thread not found")
        db.execute("DELETE FROM chat_messages WHERE thread_id = ?", (thread_id,))
        db.execute("DELETE FROM chat_threads WHERE id = ?", (thread_id,))
    return Response(status_code=204)



@router.post(f"{settings.api_prefix}/chat/threads/{{thread_id}}/messages", response_model=ChatSendResponse)
def send_chat_message(
    thread_id: str,
    payload: ChatSendRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ChatSendResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    return _chat_send(thread_id, workspace_id, user_id, payload.message, payload.model, payload.attachment_ids)



@router.post(f"{settings.api_prefix}/chat/threads/{{thread_id}}/messages/stream")
def stream_chat_message(
    thread_id: str,
    payload: ChatSendRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StreamingResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    return _chat_send_stream(thread_id, workspace_id, user_id, payload.message, payload.model, payload.attachment_ids)



def _get_chat_provider_definitions() -> list[dict[str, Any]]:
    return [
        {
            "id": "xai",
            "name": "FlowHolt AI",
            "model": settings.xai_model,
            "base_url": "https://api.x.ai/v1",
            "requires_credential": False,
            "aliases": {"xai", "grok", "flowholt ai", "flowholt"},
            "env_api_key": settings.xai_api_key,
        },
        {
            "id": "groq",
            "name": "Groq",
            "model": settings.groq_model,
            "base_url": "https://api.groq.com/openai/v1",
            "requires_credential": False,
            "aliases": {"groq"},
            "env_api_key": settings.groq_api_key,
        },
        {
            "id": "gemini",
            "name": "Google Gemini",
            "model": settings.gemini_model,
            "base_url": None,
            "requires_credential": False,
            "aliases": {"gemini", "google", "google gemini"},
            "env_api_key": settings.gemini_api_key,
        },
        {
            "id": "openai",
            "name": "OpenAI",
            "model": settings.openai_model,
            "base_url": "https://api.openai.com/v1",
            "requires_credential": True,
            "aliases": {"openai", "chatgpt"},
            "env_api_key": settings.openai_api_key,
        },
        {
            "id": "anthropic",
            "name": "Anthropic Claude",
            "model": settings.anthropic_model,
            "base_url": "https://api.anthropic.com/v1",
            "requires_credential": True,
            "aliases": {"anthropic", "claude"},
            "env_api_key": settings.anthropic_api_key,
        },
        {
            "id": "deepseek",
            "name": "DeepSeek",
            "model": settings.deepseek_model,
            "base_url": "https://api.deepseek.com/v1",
            "requires_credential": True,
            "aliases": {"deepseek"},
            "env_api_key": settings.deepseek_api_key,
        },
        {
            "id": "ollama",
            "name": "Ollama",
            "model": settings.ollama_model,
            "base_url": settings.ollama_base_url,
            "requires_credential": False,
            "aliases": {"ollama"},
            "env_api_key": "",
        },
        {
            "id": "mock",
            "name": "Mock",
            "model": "mock",
            "base_url": None,
            "requires_credential": False,
            "aliases": {"mock"},
            "env_api_key": "",
        },
    ]



def _get_chat_provider_definition(provider_id: str) -> dict[str, Any] | None:
    normalized = provider_id.strip().lower()
    return next((item for item in _get_chat_provider_definitions() if item["id"] == normalized), None)



def _extract_chat_provider_secret(secret: dict[str, Any]) -> dict[str, str | None]:
    api_key = next(
        (
            str(secret[key]).strip()
            for key in ("api_key", "apiKey", "token", "bearer_token", "access_token", "key")
            if secret.get(key)
        ),
        "",
    )
    model = next(
        (
            str(secret[key]).strip()
            for key in ("model", "model_name", "default_model")
            if secret.get(key)
        ),
        "",
    )
    base_url = next(
        (
            str(secret[key]).strip()
            for key in ("base_url", "baseUrl", "endpoint", "url")
            if secret.get(key)
        ),
        "",
    )
    return {
        "api_key": api_key or None,
        "model": model or None,
        "base_url": base_url or None,
    }



def _resolve_workspace_chat_credential(provider_id: str, workspace_id: str | None = None) -> dict[str, str | None] | None:
    if not workspace_id:
        return None

    definition = _get_chat_provider_definition(provider_id)
    if definition is None:
        return None

    aliases = {alias.lower() for alias in definition["aliases"]}
    assets = list_vault_assets(kind="credential", workspace_id=workspace_id)

    for asset in assets:
        if str(asset.get("status") or "active").lower() not in {"active", "verified", "healthy"}:
            continue
        app_name = str(asset.get("app") or "").strip().lower()
        asset_name = str(asset.get("name") or "").strip().lower()
        if app_name not in aliases and not any(alias in asset_name for alias in aliases):
            continue
        secret = asset.get("secret")
        if not isinstance(secret, dict):
            continue
        resolved = _extract_chat_provider_secret(secret)
        if resolved.get("api_key") or provider_id == "ollama":
            return resolved

    return None



def _build_chat_provider_runtime(provider_id: str, workspace_id: str | None = None) -> dict[str, Any] | None:
    definition = _get_chat_provider_definition(provider_id)
    if definition is None:
        return None

    if provider_id == "mock":
        return {"provider": MockProvider(), "model": "mock"}

    vault_credential = _resolve_workspace_chat_credential(provider_id, workspace_id)

    if provider_id == "ollama":
        base_url = str((vault_credential or {}).get("base_url") or definition["base_url"] or "").strip()
        model = str((vault_credential or {}).get("model") or definition["model"] or settings.ollama_model).strip()
        if not base_url:
            return None
        return {"provider": OllamaProvider(base_url, model), "model": model}

    api_key = str((vault_credential or {}).get("api_key") or definition["env_api_key"] or "").strip()
    if not api_key:
        return None

    model = str((vault_credential or {}).get("model") or definition["model"] or "").strip()
    base_url = str((vault_credential or {}).get("base_url") or definition["base_url"] or "").strip()

    if provider_id == "gemini":
        return {"provider": GeminiProvider(api_key, model), "model": model}
    if provider_id == "groq":
        return {"provider": GroqProvider(api_key, model), "model": model}
    if provider_id == "anthropic":
        return {"provider": AnthropicProvider(api_key, model), "model": model}

    return {
        "provider": OpenAICompatibleProvider(
            name=provider_id,
            api_key=api_key,
            model=model,
            base_url=base_url,
        ),
        "model": model,
    }



def _get_default_chat_provider(workspace_id: str | None = None) -> str:
    if settings.llm_provider != "auto" and _is_chat_provider_available(settings.llm_provider, workspace_id):
        return settings.llm_provider
    for provider_id in ("xai", "groq", "gemini", "openai", "anthropic", "deepseek", "ollama", "mock"):
        if _is_chat_provider_available(provider_id, workspace_id):
            return provider_id
    return "mock"



def _is_chat_provider_available(provider_id: str, workspace_id: str | None = None) -> bool:
    runtime = _build_chat_provider_runtime(provider_id, workspace_id)
    return runtime is not None and bool(runtime["provider"].is_configured())



def _get_chat_provider_display_model(provider_id: str, workspace_id: str | None = None) -> str:
    runtime = _build_chat_provider_runtime(provider_id, workspace_id)
    if runtime is not None:
        return str(runtime.get("model") or "")
    definition = _get_chat_provider_definition(provider_id)
    return str(definition.get("model") if definition else "")



@router.get(f"{settings.api_prefix}/chat/models")
def list_chat_models(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[LLMProviderInfo]:
    workspace_id = str(session["workspace"]["id"])
    providers_info: list[LLMProviderInfo] = []
    default_provider = _get_default_chat_provider(workspace_id)
    for definition in _get_chat_provider_definitions():
        provider_id = str(definition["id"])
        if provider_id in {"mock", "ollama"}:
            continue
        providers_info.append(LLMProviderInfo(
            id=provider_id,
            name=str(definition["name"]),
            model=_get_chat_provider_display_model(provider_id, workspace_id),
            available=_is_chat_provider_available(provider_id, workspace_id),
            requires_credential=bool(definition["requires_credential"]),
            is_default=provider_id == default_provider,
        ))
    return providers_info



@router.get(f"{settings.api_prefix}/chat/providers/{{provider_id}}/models")
def list_provider_models(
    provider_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Dynamically fetch models from a provider's API using stored credentials."""
    workspace_id = str(session["workspace"]["id"])
    definition = _get_chat_provider_definition(provider_id)
    if definition is None:
        raise HTTPException(404, f"Unknown provider: {provider_id}")

    vault_credential = _resolve_workspace_chat_credential(provider_id, workspace_id)
    api_key = str((vault_credential or {}).get("api_key") or definition["env_api_key"] or "").strip()
    base_url = str((vault_credential or {}).get("base_url") or definition.get("base_url") or "").strip()

    if not api_key and provider_id != "ollama":
        return {"provider": provider_id, "models": [], "error": "No API key configured for this provider."}

    models_list: list[dict[str, Any]] = []

    try:
        if provider_id == "anthropic":
            ok, _msg, response = _runtime_request(
                "GET",
                f"{base_url or 'https://api.anthropic.com/v1'}/models",
                headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
            )
            if ok and response is not None:
                for m in (response.json().get("data") or []):
                    models_list.append({
                        "id": m.get("id", ""),
                        "name": m.get("display_name", m.get("id", "")),
                        "created": m.get("created_at", ""),
                        "context_window": m.get("context_window"),
                        "type": m.get("type", "model"),
                    })
        elif provider_id == "gemini":
            ok, _msg, response = _runtime_request(
                "GET",
                "https://generativelanguage.googleapis.com/v1beta/models",
                params={"key": api_key},
            )
            if ok and response is not None:
                for m in (response.json().get("models") or []):
                    model_id = str(m.get("name", "")).replace("models/", "")
                    models_list.append({
                        "id": model_id,
                        "name": m.get("displayName", model_id),
                        "created": "",
                        "context_window": m.get("inputTokenLimit"),
                        "type": "model",
                    })
        elif provider_id == "ollama":
            ollama_url = base_url or settings.ollama_base_url or "http://127.0.0.1:11434"
            ok, _msg, response = _runtime_request("GET", f"{ollama_url}/api/tags")
            if ok and response is not None:
                for m in (response.json().get("models") or []):
                    models_list.append({
                        "id": m.get("name", ""),
                        "name": m.get("name", ""),
                        "created": m.get("modified_at", ""),
                        "context_window": None,
                        "type": "model",
                    })
        else:
            compatible_defaults = {
                "openai": "https://api.openai.com/v1",
                "groq": "https://api.groq.com/openai/v1",
                "deepseek": "https://api.deepseek.com/v1",
                "xai": "https://api.x.ai/v1",
            }
            endpoint = f"{base_url or compatible_defaults.get(provider_id, 'https://api.openai.com/v1')}/models"
            ok, _msg, response = _runtime_request(
                "GET", endpoint, headers={"Authorization": f"Bearer {api_key}"},
            )
            if ok and response is not None:
                payload = response.json() or {}
                for m in (payload.get("data") or payload.get("models") or []):
                    models_list.append({
                        "id": m.get("id", ""),
                        "name": m.get("id", ""),
                        "created": str(m.get("created", "")),
                        "context_window": None,
                        "type": m.get("type", "model"),
                    })
    except Exception:
        return {"provider": provider_id, "models": [], "error": "Failed to fetch models from provider API."}

    return {"provider": provider_id, "models": models_list, "error": None}



@router.get(f"{settings.api_prefix}/chat/providers/{{provider_id}}/status")
def get_provider_status(
    provider_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Get usage/status info for a connected AI provider."""
    workspace_id = str(session["workspace"]["id"])
    definition = _get_chat_provider_definition(provider_id)
    if definition is None:
        raise HTTPException(404, f"Unknown provider: {provider_id}")

    vault_credential = _resolve_workspace_chat_credential(provider_id, workspace_id)
    api_key = str((vault_credential or {}).get("api_key") or definition["env_api_key"] or "").strip()
    base_url = str((vault_credential or {}).get("base_url") or definition.get("base_url") or "").strip()
    is_available = _is_chat_provider_available(provider_id, workspace_id)
    current_model = _get_chat_provider_display_model(provider_id, workspace_id)

    status_info: dict[str, Any] = {
        "provider": provider_id,
        "name": definition["name"],
        "connected": is_available,
        "current_model": current_model,
        "has_api_key": bool(api_key),
        "base_url": base_url or definition.get("base_url") or "",
        "rate_limits": None,
        "usage": None,
        "error": None,
    }

    if not api_key and provider_id != "ollama":
        status_info["error"] = "No API key configured."
        return status_info

    # Try to get rate limit / usage info where available
    try:
        if provider_id == "anthropic":
            # Anthropic doesn't have a public usage endpoint but we can report connection status
            ok, msg, _ = _runtime_request(
                "GET",
                f"{base_url or 'https://api.anthropic.com/v1'}/models",
                headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
            )
            status_info["rate_limits"] = {"status": "active" if ok else "error", "detail": msg}
        elif provider_id == "openai":
            # OpenAI doesn't expose usage via simple API, report connection health
            ok, msg, _ = _runtime_request(
                "GET",
                f"{base_url or 'https://api.openai.com/v1'}/models",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            status_info["rate_limits"] = {"status": "active" if ok else "error", "detail": msg}
        else:
            compatible_defaults = {
                "groq": "https://api.groq.com/openai/v1",
                "deepseek": "https://api.deepseek.com/v1",
                "xai": "https://api.x.ai/v1",
            }
            endpoint = base_url or compatible_defaults.get(provider_id, "")
            if endpoint:
                ok, msg, _ = _runtime_request(
                    "GET", f"{endpoint}/models",
                    headers={"Authorization": f"Bearer {api_key}"},
                )
                status_info["rate_limits"] = {"status": "active" if ok else "error", "detail": msg}
    except Exception:
        status_info["error"] = "Failed to check provider status."

    return status_info



def execute_chat_trigger_request(
    *,
    workflow: dict[str, Any],
    request: Request,
    payload: ChatTriggerRequest,
    public: bool,
) -> ChatTriggerResponse:
    if workflow["status"] != "active":
        raise HTTPException(status_code=409, detail="Workflow is not active")

    runtime_definition, _ = resolve_runtime_definition_for_environment(
        workflow,
        workspace_id=str(workflow["workspace_id"]),
        environment="production",
    )
    trigger_config = get_trigger_step_config(runtime_definition)
    if str(trigger_config.get("source") or workflow.get("trigger_type") or "") != "chat":
        raise HTTPException(status_code=400, detail="Workflow is not chat-triggered")

    enforce_chat_trigger_access(request, workflow=workflow, trigger_config=trigger_config, public=public)
    runtime_payload, session_id = build_chat_trigger_payload(payload, request, trigger_config=trigger_config)
    event_key = build_chat_event_key(request, str(workflow["id"]), session_id)
    existing_event = get_trigger_event_by_key(
        workspace_id=str(workflow["workspace_id"]),
        workflow_id=str(workflow["id"]),
        event_key=event_key,
    )
    if existing_event and existing_event.get("execution_id"):
        existing_execution = get_execution(str(existing_event["execution_id"]), workspace_id=str(workflow["workspace_id"]))
        if existing_execution is not None:
            message = extract_chat_response_text(existing_execution, runtime_definition)
            return ChatTriggerResponse(
                workflow_id=str(workflow["id"]),
                execution_id=str(existing_execution["id"]),
                session_id=session_id,
                mode=str(trigger_config.get("chat_mode") or "hosted"),
                response_mode=str(trigger_config.get("chat_response_mode") or "streaming"),
                message=message,
                messages=[ChatTriggerMessage(role="assistant", content=message)],
                title=str(trigger_config.get("chat_title") or "") or None,
                subtitle=str(trigger_config.get("chat_subtitle") or "") or None,
                input_placeholder=str(trigger_config.get("chat_input_placeholder") or "") or None,
            )
    if existing_event:
        raise HTTPException(status_code=409, detail="Chat event is already being processed")

    trigger_event = create_trigger_event(
        workspace_id=str(workflow["workspace_id"]),
        workflow_id=str(workflow["id"]),
        trigger_type="chat",
        event_key=event_key,
        payload=runtime_payload,
    )
    record_audit_event(
        session=None,
        workspace_id=str(workflow["workspace_id"]),
        action="workflow.chat.received",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"public": public, "session_id": session_id},
    )
    execution = _execute_workflow(
        workflow,
        runtime_payload,
        trigger_type="chat",
        environment="production",
        use_published_version=True,
    )
    attach_trigger_event_execution(str(trigger_event["id"]), execution_id=execution.id)
    stored_execution = get_execution(execution.id, workspace_id=str(workflow["workspace_id"]))
    if stored_execution is None:
        raise HTTPException(status_code=500, detail="Chat execution result could not be loaded")
    message = extract_chat_response_text(stored_execution, runtime_definition)
    return ChatTriggerResponse(
        workflow_id=str(workflow["id"]),
        execution_id=execution.id,
        session_id=session_id,
        mode=str(trigger_config.get("chat_mode") or "hosted"),
        response_mode=str(trigger_config.get("chat_response_mode") or "streaming"),
        message=message,
        messages=[ChatTriggerMessage(role="assistant", content=message)],
        title=str(trigger_config.get("chat_title") or "") or None,
        subtitle=str(trigger_config.get("chat_subtitle") or "") or None,
        input_placeholder=str(trigger_config.get("chat_input_placeholder") or "") or None,
    )



def iter_chat_response_stream_chunks(message: str, target_chunk_size: int = 28) -> list[str]:
    if not message:
        return []
    parts = re.findall(r"\S+\s*|\n+", message)
    chunks: list[str] = []
    current = ""
    for part in parts:
        if current and len(current) + len(part) > target_chunk_size:
            chunks.append(current)
            current = part
        else:
            current += part
    if current:
        chunks.append(current)
    return chunks



@router.post(f"{settings.api_prefix}/triggers/chat/{{workflow_id}}", response_model=ChatTriggerResponse)
async def trigger_workflow_chat(
    workflow_id: str,
    payload: ChatTriggerRequest,
    request: Request,
) -> ChatTriggerResponse:
    workflow = get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return execute_chat_trigger_request(
        workflow=workflow,
        request=request,
        payload=payload,
        public=False,
    )



