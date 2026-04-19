"""
Workflows router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403

router = APIRouter()

@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/export", response_model=WorkflowExportBundle)
def export_workflow(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowExportBundle:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    definition = workflow.get("definition_json") or {"steps": [], "edges": []}
    detail = WorkflowDetail.model_validate({
        **workflow,
        "definition": definition,
        "current_version_number": workflow.get("current_version_number") or 1,
        "published_version_id": workflow.get("published_version_id"),
    })
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.exported",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"name": workflow.get("name")},
    )
    return WorkflowExportBundle(
        exported_at=datetime.now(UTC).isoformat(),
        workflow=detail,
        metadata={
            "source_workspace": workspace_id,
            "steps_count": len(definition.get("steps", [])),
            "edges_count": len(definition.get("edges", [])),
        },
    )



@router.post(f"{settings.api_prefix}/workflows/import", response_model=WorkflowImportResponse)
def import_workflow(
    payload: WorkflowImportRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowImportResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    bundle = payload.bundle

    # Validate bundle structure
    if bundle.get("platform") != "flowholt":
        raise HTTPException(status_code=400, detail="Invalid export bundle: unsupported platform")

    wf_data = bundle.get("workflow")
    if not wf_data or not isinstance(wf_data, dict):
        raise HTTPException(status_code=400, detail="Invalid export bundle: missing workflow data")

    definition = wf_data.get("definition") or {"steps": [], "edges": [], "settings": {}}
    steps = definition.get("steps", [])
    edges = definition.get("edges", [])
    workflow_settings = definition.get("settings") or {}

    name = payload.name_override or wf_data.get("name") or "Imported Workflow"
    status = payload.status_override or "draft"
    trigger_type = wf_data.get("trigger_type") or "manual"
    category = wf_data.get("category") or "Custom"

    warnings: list[str] = []
    if len(steps) == 0:
        warnings.append("Imported workflow has no steps.")

    # Re-generate step IDs to avoid collisions
    import uuid as _uuid
    id_map: dict[str, str] = {}
    for step in steps:
        old_id = step["id"]
        new_id = f"step-{_uuid.uuid4().hex[:10]}"
        id_map[old_id] = new_id
        step["id"] = new_id
    for edge in edges:
        edge["source"] = id_map.get(edge["source"], edge["source"])
        edge["target"] = id_map.get(edge["target"], edge["target"])
        edge["id"] = f"edge-{edge['source']}-{edge['target']}"

    create_payload = WorkflowCreate(
        name=name,
        trigger_type=trigger_type,
        category=category,
        status=status,
        definition=WorkflowDefinition(
            steps=[WorkflowStep(**s) for s in steps],
            edges=[WorkflowEdge(**e) for e in edges],
            settings=WorkflowSettings(**workflow_settings),
        ),
    )
    workflow = create_workflow(create_payload, workspace_id=workspace_id)
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.imported",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"name": name, "steps_count": len(steps), "source_platform": bundle.get("platform")},
    )
    return WorkflowImportResponse(
        workflow_id=str(workflow["id"]),
        workflow_name=name,
        status=status,
        steps_count=len(steps),
        edges_count=len(edges),
        warnings=warnings,
    )



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/activity", response_model=list[AuditEventSummary])
def get_workflow_activity(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[AuditEventSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return [
        AuditEventSummary.model_validate(item)
        for item in list_audit_events(workspace_id, target_type="workflow", target_id=workflow_id)
    ]



def _chat_send(
    thread_id: str,
    workspace_id: str,
    user_id: str,
    message: str,
    model_hint: str,
    attachment_ids: list[str] | None = None,
) -> ChatSendResponse:
    preparation = _prepare_chat_send(
        thread_id,
        workspace_id,
        user_id,
        message,
        model_hint,
        attachment_ids,
    )

    provider_runtime = _build_chat_provider_runtime(preparation["selected_provider"], workspace_id)
    if provider_runtime is None:
        raise HTTPException(400, "Selected model is not configured. Add the credential in Credentials before using it.")

    provider_client = provider_runtime["provider"]
    system_prompt = (
        "You are FlowHolt AI, the primary workspace agent for the FlowHolt workflow automation platform. "
        "Help users plan work, design workflows, reason through integrations, and propose concrete next actions. "
        "When a request would change the workspace, explain the safest next step and stay specific. "
        "Be concise, helpful, and structured. Use markdown formatting when appropriate."
    )
    # Build messages for LLM
    llm_messages = [{"role": "system", "content": system_prompt}] + preparation["history"]
    actions = build_assistant_actions(message)

    model_used = preparation["selected_provider"]
    try:
        reply = provider_client.chat(llm_messages, temperature=0.7, max_tokens=4096)
    except HTTPException:
        raise
    except Exception:
        reply = "I'm sorry, I'm unable to respond right now. Please check your LLM provider configuration."
        model_used = "error"

    return _finalize_chat_send(
        thread_id=thread_id,
        message=message,
        reply=reply,
        model_used=model_used,
        actions=actions,
        preparation=preparation,
    )



def _chat_send_stream(
    thread_id: str,
    workspace_id: str,
    user_id: str,
    message: str,
    model_hint: str,
    attachment_ids: list[str] | None = None,
) -> StreamingResponse:
    preparation = _prepare_chat_send(
        thread_id,
        workspace_id,
        user_id,
        message,
        model_hint,
        attachment_ids,
    )

    provider_runtime = _build_chat_provider_runtime(preparation["selected_provider"], workspace_id)
    if provider_runtime is None:
        raise HTTPException(400, "Selected model is not configured. Add the credential in Credentials before using it.")

    provider_client = provider_runtime["provider"]
    system_prompt = (
        "You are FlowHolt AI, the primary workspace agent for the FlowHolt workflow automation platform. "
        "Help users plan work, design workflows, reason through integrations, and propose concrete next actions. "
        "When a request would change the workspace, explain the safest next step and stay specific. "
        "Be concise, helpful, and structured. Use markdown formatting when appropriate."
    )
    llm_messages = [{"role": "system", "content": system_prompt}] + preparation["history"]
    actions = build_assistant_actions(message)

    def event_generator():
        chunks: list[str] = []
        model_used = preparation["selected_provider"]
        stream_completed = False
        try:
            for chunk in provider_client.stream_chat(llm_messages, temperature=0.7, max_tokens=4096):
                if not chunk:
                    continue
                chunks.append(chunk)
                yield _format_sse_event("delta", {"delta": chunk})
            stream_completed = True
        except HTTPException:
            raise
        except Exception:
            model_used = "error"
            fallback_reply = "I'm sorry, I'm unable to respond right now. Please check your LLM provider configuration."
            if not chunks:
                for chunk in fallback_reply.split():
                    piece = f"{chunk} "
                    chunks.append(piece)
                    yield _format_sse_event("delta", {"delta": piece})
            stream_completed = True
        reply_text = "".join(chunks).strip()
        if reply_text:
            response = _finalize_chat_send(
                thread_id=thread_id,
                message=message,
                reply=reply_text,
                model_used=model_used,
                actions=actions,
                preparation=preparation,
            )
            if stream_completed:
                yield _format_sse_event("done", response.model_dump())
            return

        if not stream_completed:
            return

        with get_db() as db:
            cnt = db.execute("SELECT COUNT(*) AS c FROM chat_messages WHERE thread_id = ?", (thread_id,)).fetchone()
            if dict(cnt)["c"] <= 1:
                _auto_title_thread(thread_id, message)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )



def _prepare_chat_send(
    thread_id: str,
    workspace_id: str,
    user_id: str,
    message: str,
    model_hint: str,
    attachment_ids: list[str] | None = None,
) -> dict[str, Any]:
    now = datetime.now(UTC).isoformat()
    user_msg_id = f"cm-{secrets.token_hex(12)}"
    asst_msg_id = f"cm-{secrets.token_hex(12)}"
    requested_attachment_ids = attachment_ids or []

    with get_db() as db:
        row = db.execute(
            "SELECT * FROM chat_threads WHERE id = ? AND workspace_id = ? AND user_id = ?",
            (thread_id, workspace_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Thread not found")
        thread = dict(row)
        selected_provider = (model_hint or thread.get("model") or _get_default_chat_provider(workspace_id)).strip().lower()
        if not _is_chat_provider_available(selected_provider, workspace_id):
            raise HTTPException(400, "Selected model is not configured. Add the credential in Credentials before using it.")
        if selected_provider != (thread.get("model") or ""):
            db.execute("UPDATE chat_threads SET model = ?, updated_at = ? WHERE id = ?", (selected_provider, now, thread_id))
        attachment_rows = _resolve_chat_attachment_rows(
            db,
            requested_attachment_ids,
            workspace_id=workspace_id,
            user_id=user_id,
            thread_id=thread_id,
        )
        db.execute(
            "INSERT INTO chat_messages (id, thread_id, role, content, model_used, actions_json, created_at) VALUES (?, ?, 'user', ?, NULL, NULL, ?)",
            (user_msg_id, thread_id, message, now),
        )
        for attachment in attachment_rows:
            db.execute(
                "UPDATE chat_attachments SET thread_id = ?, message_id = ? WHERE id = ?",
                (thread_id, user_msg_id, str(attachment["id"])),
            )

        history_rows = [row_to_dict(row) for row in db.execute(
            "SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC",
            (thread_id,),
        ).fetchall()]
        attachments_by_message = _load_chat_attachment_rows_by_message(
            db,
            [str(item["id"]) for item in history_rows],
            workspace_id=workspace_id,
            user_id=user_id,
        )
        history = []
        for item in history_rows:
            content = str(item["content"])
            attachment_context = _render_chat_attachment_context(attachments_by_message.get(str(item["id"]), []))
            if attachment_context and str(item.get("role")) == "user":
                content = f"{content}\n\n{attachment_context}" if content.strip() else attachment_context
            history.append({"role": str(item["role"]), "content": content})

    return {
        "now": now,
        "user_msg_id": user_msg_id,
        "assistant_msg_id": asst_msg_id,
        "selected_provider": selected_provider,
        "history": history,
        "user_attachments": [_build_chat_attachment_item(item) for item in attachment_rows],
    }



def _finalize_chat_send(
    *,
    thread_id: str,
    message: str,
    reply: str,
    model_used: str,
    actions: list[dict[str, Any]],
    preparation: dict[str, Any],
) -> ChatSendResponse:
    asst_now = datetime.now(UTC).isoformat()
    with get_db() as db:
        db.execute(
            "INSERT INTO chat_messages (id, thread_id, role, content, model_used, actions_json, created_at) VALUES (?, ?, 'assistant', ?, ?, ?, ?)",
            (preparation["assistant_msg_id"], thread_id, reply, model_used, json.dumps(actions) if actions else None, asst_now),
        )
        db.execute("UPDATE chat_threads SET updated_at = ? WHERE id = ?", (asst_now, thread_id))

    with get_db() as db:
        cnt = db.execute("SELECT COUNT(*) AS c FROM chat_messages WHERE thread_id = ?", (thread_id,)).fetchone()
        if dict(cnt)["c"] <= 2:
            _auto_title_thread(thread_id, message)
        thread_row = db.execute("SELECT title FROM chat_threads WHERE id = ?", (thread_id,)).fetchone()

    return ChatSendResponse(
        user_message=ChatMessageItem(
            id=preparation["user_msg_id"],
            thread_id=thread_id,
            role="user",
            content=message,
            model_used=None,
            actions=[],
            attachments=preparation["user_attachments"],
            created_at=preparation["now"],
        ),
        assistant_message=ChatMessageItem(
            id=preparation["assistant_msg_id"],
            thread_id=thread_id,
            role="assistant",
            content=reply,
            model_used=model_used,
            actions=actions,
            attachments=[],
            created_at=asst_now,
        ),
        thread_title=dict(thread_row)["title"] if thread_row else "New chat",
    )



def _auto_title_thread(thread_id: str, first_message: str) -> None:
    """Generate a short title for the thread from the first user message."""
    title = first_message[:60].strip()
    if len(first_message) > 60:
        title = title.rsplit(" ", 1)[0] + "..."
    with get_db() as db:
        db.execute("UPDATE chat_threads SET title = ? WHERE id = ?", (title, thread_id))



@router.post(f"{settings.api_prefix}/workflows/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_workflows(
    payload: BulkDeleteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> BulkDeleteResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    deleted = 0
    errors: list[str] = []
    for wf_id in payload.ids:
        try:
            delete_workflow(wf_id, workspace_id=workspace_id)
            deleted += 1
        except Exception as exc:
            errors.append(f"{wf_id}: {exc}")
    if deleted:
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="workflows.bulk_deleted",
            target_type="workflow",
            target_id="bulk",
            status="success",
            details={"count": deleted, "ids": payload.ids[:20]},
        )
    return BulkDeleteResponse(deleted=deleted, errors=errors)



@router.get(f"{settings.api_prefix}/workflows", response_model=list[WorkflowSummary])
def get_workflows(
    limit: int = 200,
    offset: int = 0,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowSummary]:
    return [
        WorkflowSummary.model_validate(item)
        for item in list_workflows(workspace_id=str(session["workspace"]["id"]), limit=min(limit, 500), offset=offset)
    ]



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}", response_model=WorkflowDetail)
def get_workflow_detail(workflow_id: str, session: dict[str, Any] = Depends(get_session_context)) -> WorkflowDetail:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None
    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    return WorkflowDetail.model_validate(
        {
            **workflow,
            "definition": repaired_definition,
        }
    )



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/policy", response_model=WorkflowPolicyResponse)
def get_workflow_policy(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowPolicyResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_workflow_policy_response(
        workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        definition=workflow["definition_json"],
        workspace_id=workspace_id,
        session=session,
    )



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/environments", response_model=WorkflowEnvironmentsResponse)
def get_workflow_environments(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowEnvironmentsResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_workflow_environments_response(workflow, workspace_id=workspace_id)



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/deployments", response_model=list[WorkflowVersionSummary])
def get_workflow_deployments(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowVersionSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    versions = [
        item for item in list_workflow_versions(workflow_id, workspace_id=workspace_id)
        if str(item.get("status")) in {"staging", "published"}
    ]
    return [WorkflowVersionSummary.model_validate(item) for item in versions]



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/deployment-history", response_model=list[WorkflowDeploymentSummary])
def get_workflow_deployment_history(
    workflow_id: str,
    environment: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowDeploymentSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    history = list_workflow_deployments(workflow_id, workspace_id=workspace_id, environment=environment)
    return [build_workflow_deployment_summary(item) for item in history]



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/deployment-history/{{deployment_id}}", response_model=WorkflowDeploymentDetail)
def get_workflow_deployment_detail(
    workflow_id: str,
    deployment_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentDetail:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    deployment = get_workflow_deployment(deployment_id, workspace_id=workspace_id)
    if deployment is None or str(deployment["workflow_id"]) != workflow_id:
        raise HTTPException(status_code=404, detail="Workflow deployment not found")
    return build_workflow_deployment_detail(deployment, workspace_id=workspace_id)



@router.get(f"{settings.api_prefix}/deployment-reviews", response_model=list[WorkflowDeploymentReviewSummary])
def get_workspace_deployment_reviews(
    status: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowDeploymentReviewSummary]:
    workspace_id = str(session["workspace"]["id"])
    reviews = list_workflow_deployment_reviews(workspace_id=workspace_id, status=status)
    return [build_workflow_deployment_review_summary(item) for item in reviews]



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/deployment-reviews", response_model=list[WorkflowDeploymentReviewSummary])
def get_workflow_deployment_reviews(
    workflow_id: str,
    status: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowDeploymentReviewSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    reviews = list_workflow_deployment_reviews(workspace_id=workspace_id, workflow_id=workflow_id, status=status)
    return [build_workflow_deployment_review_summary(item) for item in reviews]



@router.get(f"{settings.api_prefix}/deployment-reviews/{{review_id}}", response_model=WorkflowDeploymentReviewDetail)
def get_deployment_review_detail(
    review_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentReviewDetail:
    workspace_id = str(session["workspace"]["id"])
    review = get_workflow_deployment_review(review_id, workspace_id=workspace_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Deployment review not found")
    return build_workflow_deployment_review_detail(review, workspace_id=workspace_id, session=session)



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/request-promotion", response_model=WorkflowDeploymentReviewSummary, status_code=201)
def request_workflow_promotion(
    workflow_id: str,
    payload: WorkflowPromotionRequestCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentReviewSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None
    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )

    settings_payload = get_workspace_settings(workspace_id)
    public_trigger_type = resolve_public_trigger_type(
        str(workflow.get("trigger_type") or ""),
        get_trigger_step_config(repaired_definition),
    )
    if payload.target_environment == "production" and not public_trigger_is_allowed(settings_payload, public_trigger_type):
        if public_trigger_type == "chat":
            raise HTTPException(status_code=403, detail="Workspace policy blocks public chat trigger workflows from being promoted to production")
        raise HTTPException(status_code=403, detail="Workspace policy blocks public webhook workflows from being promoted to production")
    if payload.target_environment == "production" and settings_payload.get("require_staging_before_production"):
        staged_version = get_staging_workflow_version(workflow_id, workspace_id=workspace_id)
        if staged_version is None:
            raise HTTPException(status_code=409, detail="Stage this workflow before requesting production approval")
        if dict(staged_version.get("definition_json") or {}) != repaired_definition:
            raise HTTPException(
                status_code=409,
                detail="Current workflow draft differs from the staged version. Promote to staging again before requesting production approval.",
            )

    pending_reviews = list_workflow_deployment_reviews(workspace_id=workspace_id, workflow_id=workflow_id, status="pending")
    if any(str(item.get("target_environment")) == payload.target_environment for item in pending_reviews):
        raise HTTPException(status_code=409, detail=f"A pending {payload.target_environment} review already exists for this workflow")

    workflow = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    ) or workflow

    snapshot = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="draft_snapshot",
        notes=payload.notes or f"Pending {payload.target_environment} approval snapshot",
    )
    review = create_workflow_deployment_review(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        requested_by_user_id=str(session["user"]["id"]),
        target_environment=payload.target_environment,
        target_version_id=str(snapshot["id"]),
        notes=payload.notes,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.review_requested.{payload.target_environment}",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"review_id": review["id"], "target_version_id": snapshot["id"]},
    )
    _deliver_deployment_review_request_alert(
        workflow=workflow,
        session=session,
        target_environment=payload.target_environment,
        notes=payload.notes,
        settings_payload=settings_payload,
    )
    return build_workflow_deployment_review_summary(review)



@router.post(f"{settings.api_prefix}/deployment-reviews/{{review_id}}/approve", response_model=WorkflowDeploymentSummary)
def approve_deployment_review(
    review_id: str,
    payload: WorkflowDeploymentReviewDecisionRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentSummary:
    workspace_id = str(session["workspace"]["id"])
    review = get_workflow_deployment_review(review_id, workspace_id=workspace_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Deployment review not found")
    if str(review.get("status")) != "pending":
        raise HTTPException(status_code=409, detail="Deployment review is not pending")

    settings_payload = get_workspace_settings(workspace_id)
    if not can_review_deployment(
        session,
        settings_payload=settings_payload,
        requested_by_user_id=str(review["requested_by_user_id"]),
    ):
        raise HTTPException(status_code=403, detail="You do not have permission to approve this deployment review")

    workflow = get_workflow(str(review["workflow_id"]), workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    target_version = get_workflow_version(str(review["target_version_id"]), workspace_id=workspace_id)
    if target_version is None:
        raise HTTPException(status_code=404, detail="Review target version not found")

    if str(review["target_environment"]) == "production" and settings_payload.get("require_staging_before_production"):
        staged_version = get_staging_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
        if staged_version is None or str(staged_version["id"]) != str(target_version["id"]):
            raise HTTPException(
                status_code=409,
                detail="Production approval requires the same version to be currently staged first",
            )

    enforce_workflow_asset_access_or_raise(
        target_version["definition_json"],
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        target_version["definition_json"],
        workflow_id=str(workflow["id"]),
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="stage" if str(review["target_environment"]) == "staging" else "publish",
    )

    updated = set_workflow_environment_version(
        str(workflow["id"]),
        workspace_id=workspace_id,
        environment=str(review["target_environment"]),
        version_id=str(target_version["id"]),
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to apply approved deployment")
    update_workflow_version_status(
        str(target_version["id"]),
        workspace_id=workspace_id,
        status="staging" if str(review["target_environment"]) == "staging" else "published",
    )
    approved = update_workflow_deployment_review(
        review_id,
        workspace_id=workspace_id,
        status="approved",
        reviewed_by_user_id=str(session["user"]["id"]),
        review_comment=payload.comment,
    )
    if approved is None:
        raise HTTPException(status_code=500, detail="Failed to update deployment review")

    current_pointer_id = None
    if str(review["target_environment"]) == "staging":
        current_pointer_id = str(workflow.get("staging_version_id")) if workflow.get("staging_version_id") else None
    else:
        current_pointer_id = str(workflow.get("published_version_id")) if workflow.get("published_version_id") else None

    deployment = create_workflow_deployment(
        workflow_id=str(workflow["id"]),
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        environment=str(review["target_environment"]),
        action="promote",
        from_version_id=current_pointer_id,
        to_version_id=str(target_version["id"]),
        notes=review.get("notes") or f"Approved for {review['target_environment']}",
        metadata={"source": "review", "review_id": review_id},
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.review_approved.{review['target_environment']}",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"review_id": review_id, "deployment_id": deployment["id"], "target_version_id": target_version["id"]},
    )
    return build_workflow_deployment_summary(deployment)



@router.post(f"{settings.api_prefix}/deployment-reviews/{{review_id}}/reject", response_model=WorkflowDeploymentReviewSummary)
def reject_deployment_review(
    review_id: str,
    payload: WorkflowDeploymentReviewDecisionRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentReviewSummary:
    workspace_id = str(session["workspace"]["id"])
    review = get_workflow_deployment_review(review_id, workspace_id=workspace_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Deployment review not found")
    if str(review.get("status")) != "pending":
        raise HTTPException(status_code=409, detail="Deployment review is not pending")

    settings_payload = get_workspace_settings(workspace_id)
    if not can_review_deployment(
        session,
        settings_payload=settings_payload,
        requested_by_user_id=str(review["requested_by_user_id"]),
    ):
        raise HTTPException(status_code=403, detail="You do not have permission to reject this deployment review")

    rejected = update_workflow_deployment_review(
        review_id,
        workspace_id=workspace_id,
        status="rejected",
        reviewed_by_user_id=str(session["user"]["id"]),
        review_comment=payload.comment,
    )
    if rejected is None:
        raise HTTPException(status_code=500, detail="Failed to update deployment review")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.review_rejected.{review['target_environment']}",
        target_type="workflow",
        target_id=str(review["workflow_id"]),
        status="success",
        details={"review_id": review_id, "target_version_id": review["target_version_id"]},
    )
    return build_workflow_deployment_review_summary(rejected)



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/compare", response_model=WorkflowCompareResponse)
def compare_workflow_versions(
    workflow_id: str,
    from_ref: str = "draft",
    to_ref: str = "production",
    from_version_id: str | None = None,
    to_version_id: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowCompareResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_workflow_compare_response(
        workflow,
        workspace_id=workspace_id,
        from_ref=from_ref,
        to_ref=to_ref,
        from_version_id=from_version_id,
        to_version_id=to_version_id,
    )



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/integrity", response_model=WorkflowValidationResponse)
def get_workflow_integrity(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowValidationResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            workflow["definition_json"],
            workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        )
    )



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/repair", response_model=WorkflowDetail)
def post_workflow_repair(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDetail:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None

    issues_before = WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            workflow["definition_json"],
            workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        )
    )
    repaired_definition, actions = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    updated = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to repair workflow")
    create_workflow_version(
        updated,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="draft_snapshot",
        notes="Auto-repaired legacy workflow definition",
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.repaired",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={
            "actions": actions,
            "issues_before": [issue.model_dump() for issue in issues_before.issues],
        },
    )
    return WorkflowDetail.model_validate({**updated, "definition": updated["definition_json"]})



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/versions", response_model=list[WorkflowVersionSummary])
def get_workflow_versions(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[WorkflowVersionSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return [
        WorkflowVersionSummary.model_validate(item)
        for item in list_workflow_versions(workflow_id, workspace_id=workspace_id)
    ]



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/versions/{{version_id}}", response_model=WorkflowVersionDetail)
def get_workflow_version_detail(
    workflow_id: str,
    version_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowVersionDetail:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    version = get_workflow_version(version_id, workspace_id=workspace_id)
    if version is None or str(version["workflow_id"]) != workflow_id:
        raise HTTPException(status_code=404, detail="Workflow version not found")

    return WorkflowVersionDetail.model_validate(
        {
            **version,
            "definition": version["definition_json"],
        }
    )



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/versions", response_model=WorkflowVersionSummary, status_code=201)
def post_workflow_version(
    workflow_id: str,
    payload: WorkflowVersionCreateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowVersionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    version = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="draft_snapshot",
        notes=payload.notes,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.version.created",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"version_id": version["id"], "version_number": version["version_number"], "version_status": version["status"]},
    )
    return WorkflowVersionSummary.model_validate(version)



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/publish", response_model=WorkflowVersionSummary, status_code=201)
def publish_workflow(
    workflow_id: str,
    payload: WorkflowPublishRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowVersionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None
    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="publish",
    )
    workspace_settings = get_workspace_settings(workspace_id)
    if requires_deployment_approval(workspace_settings, "production"):
        raise HTTPException(
            status_code=409,
            detail="Production publish requires an approval request in this workspace",
        )
    if workspace_settings.get("require_staging_before_production"):
        staged_version = get_staging_workflow_version(workflow_id, workspace_id=workspace_id)
        if staged_version is None:
            raise HTTPException(status_code=409, detail="Stage this workflow before promoting it to production")
        if dict(staged_version.get("definition_json") or {}) != repaired_definition:
            raise HTTPException(
                status_code=409,
                detail="Current workflow draft differs from the staged version. Promote to staging again before production.",
            )
    workflow = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    ) or workflow

    version = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="published",
        notes=payload.notes,
    )
    create_workflow_deployment(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        environment="production",
        action="promote",
        from_version_id=str(workflow.get("published_version_id")) if workflow.get("published_version_id") else None,
        to_version_id=str(version["id"]),
        notes=payload.notes or "Published to production",
        metadata={"source": "publish"},
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.published",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"version_id": version["id"], "version_number": version["version_number"]},
    )
    return WorkflowVersionSummary.model_validate(version)



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/promote", response_model=WorkflowVersionSummary, status_code=201)
def promote_workflow(
    workflow_id: str,
    payload: WorkflowPromotionRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowVersionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    template_definition = None
    if workflow.get("template_id"):
        template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
        template_definition = template.get("definition") if template else None
    repaired_definition, _ = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        template_definition=template_definition,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )

    action = "stage" if payload.target_environment == "staging" else "publish"
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action=action,
    )
    workspace_settings = get_workspace_settings(workspace_id)
    if requires_deployment_approval(workspace_settings, payload.target_environment):
        raise HTTPException(
            status_code=409,
            detail=f"{payload.target_environment.title()} promotion requires an approval request in this workspace",
        )

    if payload.target_environment == "production":
        if workspace_settings.get("require_staging_before_production"):
            staged_version = get_staging_workflow_version(workflow_id, workspace_id=workspace_id)
            if staged_version is None:
                raise HTTPException(status_code=409, detail="Stage this workflow before promoting it to production")
            if dict(staged_version.get("definition_json") or {}) != repaired_definition:
                raise HTTPException(
                    status_code=409,
                    detail="Current workflow draft differs from the staged version. Promote to staging again before production.",
                )

    workflow = update_workflow(
        workflow_id,
        WorkflowUpdate(
            name=str(workflow["name"]),
            trigger_type=str(workflow["trigger_type"]),
            category=str(workflow["category"]),
            status=str(workflow["status"]),
            definition=WorkflowDefinition.model_validate(repaired_definition),
        ),
        workspace_id=workspace_id,
    ) or workflow

    version = create_workflow_version(
        workflow,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        status="staging" if payload.target_environment == "staging" else "published",
        notes=payload.notes or f"Promoted to {payload.target_environment}",
    )
    from_version_id = None
    if payload.target_environment == "staging":
        from_version_id = str(workflow.get("staging_version_id")) if workflow.get("staging_version_id") else None
    else:
        from_version_id = str(workflow.get("published_version_id")) if workflow.get("published_version_id") else None
    create_workflow_deployment(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        environment=payload.target_environment,
        action="promote",
        from_version_id=from_version_id,
        to_version_id=str(version["id"]),
        notes=payload.notes or f"Promoted to {payload.target_environment}",
        metadata={"source": "promote"},
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.promoted.{payload.target_environment}",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"version_id": version["id"], "version_number": version["version_number"]},
    )
    return WorkflowVersionSummary.model_validate(version)



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/rollback", response_model=WorkflowDeploymentSummary, status_code=201)
def rollback_workflow_environment(
    workflow_id: str,
    payload: WorkflowRollbackRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDeploymentSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    current_version = (
        get_staging_workflow_version(workflow_id, workspace_id=workspace_id)
        if payload.target_environment == "staging"
        else get_published_workflow_version(workflow_id, workspace_id=workspace_id)
    )
    if current_version is None:
        raise HTTPException(status_code=409, detail=f"No current {payload.target_environment} deployment exists for this workflow")

    target_version = None
    if payload.target_version_id:
        target_version = get_workflow_version(payload.target_version_id, workspace_id=workspace_id)
        if target_version is None or str(target_version["workflow_id"]) != workflow_id:
            raise HTTPException(status_code=404, detail="Target workflow version not found")
    else:
        history = list_workflow_deployments(
            workflow_id,
            workspace_id=workspace_id,
            environment=payload.target_environment,
        )
        for item in history:
            if str(item.get("to_version_id")) != str(current_version["id"]):
                target_version = get_workflow_version(str(item["to_version_id"]), workspace_id=workspace_id)
                if target_version is not None:
                    break
        if target_version is None:
            fallback_versions = [
                version
                for version in list_workflow_versions(workflow_id, workspace_id=workspace_id)
                if str(version["id"]) != str(current_version["id"])
            ]
            if fallback_versions:
                target_version = fallback_versions[0]

    if target_version is None:
        raise HTTPException(status_code=409, detail=f"No rollback target is available for {payload.target_environment}")

    action = "stage" if payload.target_environment == "staging" else "publish"
    enforce_workflow_asset_access_or_raise(
        target_version["definition_json"],
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        target_version["definition_json"],
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action=action,
    )

    updated = set_workflow_environment_version(
        workflow_id,
        workspace_id=workspace_id,
        environment=payload.target_environment,
        version_id=str(target_version["id"]),
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to update workflow deployment target")
    update_workflow_version_status(
        str(target_version["id"]),
        workspace_id=workspace_id,
        status="staging" if payload.target_environment == "staging" else "published",
    )

    deployment = create_workflow_deployment(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
        environment=payload.target_environment,
        action="rollback",
        from_version_id=str(current_version["id"]),
        to_version_id=str(target_version["id"]),
        notes=payload.notes or f"Rolled back {payload.target_environment}",
        metadata={"source": "rollback"},
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action=f"workflow.rollback.{payload.target_environment}",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={
            "from_version_id": current_version["id"],
            "to_version_id": target_version["id"],
            "environment": payload.target_environment,
        },
    )
    return build_workflow_deployment_summary(deployment)



@router.post(f"{settings.api_prefix}/workflows", response_model=WorkflowSummary, status_code=201)
def post_workflow(payload: WorkflowCreate, session: dict[str, Any] = Depends(get_session_context)) -> WorkflowSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    repaired_definition, _ = repair_definition_for_storage(
        payload.definition.model_dump(),
        workflow_trigger_type=payload.trigger_type,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=payload.trigger_type)
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=payload.trigger_type,
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id="new",
        workflow_trigger_type=payload.trigger_type,
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    payload = payload.model_copy(
        update={
            "definition": WorkflowDefinition.model_validate(
                repaired_definition
            )
        }
    )
    workflow = create_workflow(
        payload,
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="workflow.created",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"name": payload.name, "trigger_type": payload.trigger_type, "category": payload.category},
    )
    return WorkflowSummary.model_validate(workflow)



@router.delete(f"{settings.api_prefix}/workflows/{{workflow_id}}")
def delete_workflow_route(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    delete_workflow(workflow_id, workspace_id=workspace_id)
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.deleted",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"name": str(workflow.get("name"))},
    )
    return Response(status_code=204)



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/queue-run", response_model=WorkflowJobSummary, status_code=201)
def queue_workflow_run(
    workflow_id: str,
    payload: WorkflowQueueRunRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowJobSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    enforce_workflow_governance_or_raise(
        workflow["definition_json"],
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=str(workflow["workspace_id"]),
        session=session,
        action="run",
    )
    _, queued_version_id = resolve_runtime_definition_for_environment(
        workflow,
        workspace_id=str(workflow["workspace_id"]),
        environment=payload.environment,
    )

    job = create_workflow_job(
        workspace_id=str(workflow["workspace_id"]),
        workflow_id=str(workflow["id"]),
        workflow_version_id=queued_version_id,
        initiated_by_user_id=str(session["user"]["id"]),
        environment=payload.environment,
        trigger_type=payload.payload.get("_trigger_type", "manual"),
        payload=payload.payload,
    )
    record_audit_event(
        session=session,
        workspace_id=str(workflow["workspace_id"]),
        action="workflow.queued",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"job_id": job["id"], "trigger_type": job["trigger_type"]},
    )
    return WorkflowJobSummary.model_validate(job)



@router.put(f"{settings.api_prefix}/workflows/{{workflow_id}}", response_model=WorkflowDetail)
def put_workflow(
    workflow_id: str,
    payload: WorkflowUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDetail:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    repaired_definition, _ = repair_definition_for_storage(
        payload.definition.model_dump(),
        workflow_trigger_type=payload.trigger_type,
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=payload.trigger_type)
    # Runtime contract validation is advisory during drafts — only enforce on publish
    if payload.status == "active":
        validate_runtime_node_contracts_or_raise(
            repaired_definition,
            workflow_trigger_type=payload.trigger_type,
            workspace_id=workspace_id,
        )
    enforce_workflow_asset_access_or_raise(
        repaired_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        repaired_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=payload.trigger_type,
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    payload = payload.model_copy(
        update={
            "definition": WorkflowDefinition.model_validate(
                repaired_definition
            )
        }
    )
    workflow = update_workflow(workflow_id, payload, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="workflow.updated",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"name": payload.name, "status": payload.status, "trigger_type": payload.trigger_type},
    )
    return WorkflowDetail.model_validate(
        {
            **workflow,
            "definition": workflow["definition_json"],
        }
    )



@router.post(f"{settings.api_prefix}/workflows/from-template", response_model=WorkflowSummary, status_code=201)
def post_workflow_from_template(
    payload: WorkflowFromTemplateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    template = get_template(payload.template_id, workspace_id=workspace_id)
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    validate_or_raise(
        template["definition"],
        workflow_trigger_type=str(template.get("trigger_type") or ""),
    )
    validate_runtime_node_contracts_or_raise(
        template["definition"],
        workflow_trigger_type=str(template.get("trigger_type") or ""),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        template["definition"],
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        template["definition"],
        workflow_id="template",
        workflow_trigger_type=str(template.get("trigger_type") or ""),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )
    normalized_template_definition, _ = repair_definition_for_storage(
        template["definition"],
        workflow_trigger_type=str(template.get("trigger_type") or ""),
    )

    workflow = create_workflow(
        WorkflowCreate(
            name=payload.name or f"{template['name']} Copy",
            trigger_type=template["trigger_type"],
            category=template["category"],
            status="draft",
            template_id=template["id"],
            definition=normalized_template_definition,
        ),
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.created_from_template",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"template_id": payload.template_id, "name": workflow["name"]},
    )
    return WorkflowSummary.model_validate(workflow)



@router.post(f"{settings.api_prefix}/workflows/generate", response_model=WorkflowSummary, status_code=201)
def post_generated_workflow(
    payload: WorkflowGenerateRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    workspace_id = str(session["workspace"]["id"])
    plan = build_assistant_plan(prompt, list_templates(workspace_id=workspace_id))
    template_definition = None
    template_id = None
    if plan["matched_templates"]:
        top_match = plan["matched_templates"][0]
        if int(top_match["score"]) >= 28:
            template = get_template(str(top_match["template_id"]), workspace_id=workspace_id)
            if template is not None:
                template_definition = template["definition"]
                template_id = str(template["id"])

    trigger_type = str(plan["trigger_type"])
    category = str(plan["category"])
    used_template_definition = template_definition
    used_template_id = template_id
    raw_definition = build_draft_definition(
        prompt,
        trigger_type=trigger_type,
        template_definition=used_template_definition,
    )
    normalized_definition, _ = repair_definition_for_storage(
        raw_definition,
        workflow_trigger_type=trigger_type,
        template_definition=used_template_definition,
    )
    validate_or_raise(normalized_definition, workflow_trigger_type=trigger_type)
    try:
        validate_runtime_node_contracts_or_raise(
            normalized_definition,
            workflow_trigger_type=trigger_type,
            workspace_id=workspace_id,
        )
    except HTTPException:
        if used_template_definition is None:
            raise
        used_template_definition = None
        used_template_id = None
        raw_definition = build_draft_definition(
            prompt,
            trigger_type=trigger_type,
            template_definition=None,
        )
        normalized_definition, _ = repair_definition_for_storage(
            raw_definition,
            workflow_trigger_type=trigger_type,
            template_definition=None,
        )
        validate_or_raise(normalized_definition, workflow_trigger_type=trigger_type)
        validate_runtime_node_contracts_or_raise(
            normalized_definition,
            workflow_trigger_type=trigger_type,
            workspace_id=workspace_id,
        )
    enforce_workflow_asset_access_or_raise(
        normalized_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        normalized_definition,
        workflow_id="generated",
        workflow_trigger_type=trigger_type,
        workspace_id=workspace_id,
        session=session,
        action="save",
    )

    workflow = create_workflow(
        WorkflowCreate(
            name=payload.name or str(plan["suggested_name"]),
            trigger_type=trigger_type,
            category=category,
            status="draft",
            template_id=used_template_id,
            definition=WorkflowDefinition.model_validate(normalized_definition),
        ),
        workspace_id=workspace_id,
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.generated",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"prompt_preview": prompt[:120], "template_id": used_template_id},
    )
    return WorkflowSummary.model_validate(workflow)



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/observability", response_model=WorkflowObservabilityResponse)
def get_workflow_observability(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowObservabilityResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    executions = list_workflow_executions(workflow_id, workspace_id=workspace_id, limit=100)
    jobs = list_workflow_jobs(workspace_id, limit=100)
    return build_workflow_observability_response(workflow=workflow, executions=executions, jobs=jobs)



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/steps/{{step_id}}/history", response_model=WorkflowStepHistoryResponse)
def get_workflow_step_history(
    workflow_id: str,
    step_id: str,
    limit: int = 50,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowStepHistoryResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    executions = list_workflow_executions(workflow_id, workspace_id=workspace_id, limit=max(1, min(limit, 100)))
    response = build_workflow_step_history_response(workflow=workflow, step_id=step_id, executions=executions)
    if response.total_matches == 0:
        workflow_steps = workflow.get("definition_json", {}).get("steps", [])
        if not any(str(step.get("id")) == step_id for step in workflow_steps):
            raise HTTPException(status_code=404, detail="Workflow step not found")
    return response



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/run", response_model=ExecutionSummary)
def run_workflow(
    workflow_id: str,
    payload: RunWorkflowRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    enforce_workflow_governance_or_raise(
        workflow["definition_json"],
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workspace_id=str(workflow["workspace_id"]),
        session=session,
        action="run",
    )

    return _execute_workflow(
        workflow,
        payload.payload,
        trigger_type=payload.payload.get("_trigger_type", "manual"),
        environment=payload.environment,
        initiated_by_user_id=str(session["user"]["id"]),
    )



@router.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/test-step", response_model=TestStepResponse)
def test_workflow_step(
    workflow_id: str,
    request_body: TestStepRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> TestStepResponse:
    """Test a single step in isolation with provided payload."""
    require_workspace_role(session, "owner", "admin", "builder")
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    step = request_body.step
    payload = request_body.payload

    single_def = {"steps": [step], "edges": []}
    try:
        outcome = run_workflow_definition(single_def, payload, use_pinned_data=True)
        results = outcome.get("step_results", [])
        if results:
            r = results[0]
            return TestStepResponse(
                status=r.get("status", "success"),
                output=r.get("output"),
                error=r["output"].get("error") if r.get("status") == "failed" else None,
                duration_ms=r.get("duration_ms", 0),
            )
        return TestStepResponse(status="success", output={}, duration_ms=0)
    except RuntimeError as exc:
        return TestStepResponse(status="failed", error=str(exc), duration_ms=0)
    except Exception as exc:
        return TestStepResponse(status="error", error=str(exc), duration_ms=0)



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/trigger-details", response_model=TriggerDetailsResponse)
def get_workflow_trigger_details(
    workflow_id: str,
    request: Request,
    environment: str = "production",
    session: dict[str, Any] = Depends(get_session_context),
) -> TriggerDetailsResponse:
    workflow = get_workflow(workflow_id, workspace_id=str(session["workspace"]["id"]))
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    webhook_path = None
    webhook_url = None
    test_webhook_path = None
    test_webhook_url = None
    production_webhook_path = None
    production_webhook_url = None
    chat_path = None
    chat_url = None
    test_chat_path = None
    test_chat_url = None
    production_chat_path = None
    production_chat_url = None
    public_chat_stream_path = None
    public_chat_stream_url = None
    hosted_chat_path = None
    hosted_chat_url = None
    widget_script_path = None
    widget_script_url = None
    widget_embed_html = None
    schedule_hint = None

    workspace_settings = get_workspace_settings(str(session["workspace"]["id"]))
    resolved_version_id = None
    resolved_version_number = None
    exposure = "public"
    allow_public_webhooks = bool(workspace_settings.get("allow_public_webhooks", True))
    allow_public_chat_triggers = bool(workspace_settings.get("allow_public_chat_triggers", True))
    base_url = (
        workspace_settings.get("public_base_url")
        or settings.public_base_url
        or str(request.base_url).rstrip("/")
    )
    base_url = str(base_url).rstrip("/")
    runtime_definition_for_details = workflow["definition_json"]
    trigger_config = get_trigger_step_config(runtime_definition_for_details)

    if environment != "draft":
        resolved_version, _ = resolve_workflow_reference(
            workflow,
            workspace_id=str(session["workspace"]["id"]),
            ref=environment,
        )
        resolved_version_id = str(resolved_version["id"])
        resolved_version_number = int(resolved_version["version_number"])
        runtime_definition_for_details = resolved_version["definition_json"]
        trigger_config = get_trigger_step_config(runtime_definition_for_details)

    if workflow["trigger_type"] == "webhook":
        test_webhook_path = f"{settings.api_prefix}/triggers/webhook/{workflow_id}"
        test_webhook_url = f"{base_url}{test_webhook_path}"

        if allow_public_webhooks:
            production_webhook_path = f"{settings.api_prefix}/webhooks/{session['workspace']['id']}/{workflow_id}"
            production_webhook_url = f"{base_url}{production_webhook_path}"
            exposure = "public"
        else:
            exposure = "internal"

        if environment == "production" and production_webhook_url:
            webhook_path = production_webhook_path
            webhook_url = production_webhook_url
        else:
            webhook_path = test_webhook_path
            webhook_url = test_webhook_url
    elif workflow["trigger_type"] == "chat":
        test_chat_path = f"{settings.api_prefix}/triggers/chat/{workflow_id}"
        test_chat_url = f"{base_url}{test_chat_path}"

        if bool(trigger_config.get("chat_public")) and allow_public_chat_triggers:
            chat_urls = build_public_chat_urls(
                base_url=base_url,
                workspace_id=str(session["workspace"]["id"]),
                workflow_id=workflow_id,
            )
            production_chat_path = chat_urls["public_chat_path"]
            production_chat_url = chat_urls["public_chat_url"]
            public_chat_stream_path = chat_urls["public_chat_stream_path"]
            public_chat_stream_url = chat_urls["public_chat_stream_url"]
            hosted_chat_path = chat_urls["hosted_chat_path"]
            hosted_chat_url = chat_urls["hosted_chat_url"]
            widget_script_path = chat_urls["widget_script_path"]
            widget_script_url = chat_urls["widget_script_url"]
            widget_embed_html = chat_urls["widget_embed_html"]
            exposure = "public"
        else:
            exposure = "internal"

        if environment == "production" and production_chat_url:
            chat_path = production_chat_path
            chat_url = production_chat_url
        else:
            chat_path = test_chat_path
            chat_url = test_chat_url
    elif workflow["trigger_type"] == "schedule":
        if environment == "production":
            schedule_hint = "Call POST /api/system/run-scheduled from a free cron service to execute active scheduled workflows."
            exposure = "public"
        else:
            schedule_hint = f"{environment.title()} schedule preview only. Public scheduler dispatch runs production workflows."
            exposure = "internal"

    return TriggerDetailsResponse(
        workflow_id=workflow_id,
        trigger_type=workflow["trigger_type"],
        environment=environment,
        deployed_version_id=resolved_version_id,
        deployed_version_number=resolved_version_number,
        webhook_path=webhook_path,
        webhook_url=webhook_url,
        test_webhook_path=test_webhook_path,
        test_webhook_url=test_webhook_url,
        production_webhook_path=production_webhook_path,
        production_webhook_url=production_webhook_url,
        chat_path=chat_path,
        chat_url=chat_url,
        test_chat_path=test_chat_path,
        test_chat_url=test_chat_url,
        production_chat_path=production_chat_path,
        production_chat_url=production_chat_url,
        public_chat_stream_path=public_chat_stream_path,
        public_chat_stream_url=public_chat_stream_url,
        hosted_chat_path=hosted_chat_path,
        hosted_chat_url=hosted_chat_url,
        widget_script_path=widget_script_path,
        widget_script_url=widget_script_url,
        widget_embed_html=widget_embed_html,
        chat_public_enabled=bool(trigger_config.get("chat_public")),
        chat_mode=str(trigger_config.get("chat_mode") or "") or None,
        chat_authentication=str(trigger_config.get("chat_authentication") or "") or None,
        chat_response_mode=str(trigger_config.get("chat_response_mode") or "") or None,
        chat_load_previous_session=str(trigger_config.get("chat_load_previous_session") or "") or None,
        chat_title=str(trigger_config.get("chat_title") or "") or None,
        chat_subtitle=str(trigger_config.get("chat_subtitle") or "") or None,
        chat_input_placeholder=str(trigger_config.get("chat_input_placeholder") or "") or None,
        chat_initial_messages=normalize_chat_initial_messages(trigger_config.get("chat_initial_messages")),
        chat_allowed_origins=str(trigger_config.get("chat_allowed_origins") or "") or None,
        chat_require_button_click=bool(trigger_config.get("chat_require_button_click")),
        signature_header="x-flowholt-signature" if workflow["trigger_type"] == "webhook" else None,
        timestamp_header="x-flowholt-timestamp" if workflow["trigger_type"] == "webhook" else None,
        webhook_secret_configured=bool(workspace_settings.get("webhook_signing_secret")),
        schedule_hint=schedule_hint,
        exposure=exposure,
    )


# ── Global Search Endpoint ──────────────────────────────────────────────

class SearchResultItem(BaseModel):
    id: str
    type: str   # workflow | execution | agent | credential
    label: str
    description: Optional[str] = None
    status: Optional[str] = None
    tags: list[str] = []
    path: str

class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
    total: int


@router.get(f"{settings.api_prefix}/search", response_model=SearchResponse)
def global_search(
    q: str = "",
    type: Optional[str] = None,
    limit: int = 20,
    session: dict[str, Any] = Depends(get_session_context),
) -> SearchResponse:
    """Search across workflows, executions, and AI agents."""
    workspace_id = str(session["workspace"]["id"])
    results: list[SearchResultItem] = []
    query_lower = q.lower().strip()

    if not query_lower:
        return SearchResponse(query=q, results=[], total=0)

    # Search workflows
    if type in (None, "workflows"):
        try:
            wf_rows = list_workflows(workspace_id=workspace_id)
            for wf in wf_rows:
                name = wf.get("name", "")
                desc = wf.get("description", "")
                tags = wf.get("tags") or []
                tag_names = [t.get("name", "") if isinstance(t, dict) else str(t) for t in tags]
                searchable = f"{name} {desc} {' '.join(tag_names)}".lower()
                if query_lower in searchable:
                    results.append(SearchResultItem(
                        id=str(wf["id"]),
                        type="workflow",
                        label=name,
                        description=desc[:100] if desc else None,
                        status="active" if wf.get("is_active") else "draft",
                        tags=tag_names[:3],
                        path=f"/workflows/{wf['id']}",
                    ))
        except Exception:
            pass

    # Search executions
    if type in (None, "executions"):
        try:
            exec_rows = list_executions(workspace_id=workspace_id, limit=100)
            for ex in exec_rows:
                label = f"Execution #{ex.get('id', '')}"
                wf_name = ex.get("workflow_name", "")
                searchable = f"{label} {wf_name}".lower()
                if query_lower in searchable:
                    results.append(SearchResultItem(
                        id=str(ex["id"]),
                        type="execution",
                        label=label,
                        description=wf_name[:80] if wf_name else None,
                        status=ex.get("status", "unknown"),
                        path=f"/executions/{ex['id']}",
                    ))
        except Exception:
            pass

    results = results[:limit]
    return SearchResponse(query=q, results=results, total=len(results))


# ── Workflow Diff Endpoint ───────────────────────────────────────────────

class NodeDiffItem(BaseModel):
    node_id: str
    name: str
    node_type: str
    status: str  # added | removed | modified | unchanged
    changes: list[dict[str, str]] = []

class WorkflowDiffResponse(BaseModel):
    workflow_id: str
    from_version: int
    to_version: int
    added_nodes: list[NodeDiffItem]
    removed_nodes: list[NodeDiffItem]
    modified_nodes: list[NodeDiffItem]
    unchanged_count: int


@router.get(
    f"{settings.api_prefix}/workflows/{{workflow_id}}/diff",
    response_model=WorkflowDiffResponse,
)
def get_workflow_diff(
    workflow_id: str,
    from_version: int = 1,
    to_version: Optional[int] = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowDiffResponse:
    """Compare two versions of a workflow definition."""
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    current_def = workflow.get("definition_json") or {"steps": [], "edges": []}
    current_steps = {s.get("id"): s for s in current_def.get("steps", [])}

    # For now compare current version against an empty "from" (no version history yet)
    from_steps: dict[str, Any] = {}

    added, removed, modified = [], [], []
    unchanged = 0

    for sid, step in current_steps.items():
        if sid not in from_steps:
            added.append(NodeDiffItem(
                node_id=sid,
                name=step.get("name", sid),
                node_type=step.get("type", "unknown"),
                status="added",
            ))
        else:
            old = from_steps[sid]
            changes = []
            for key in set(list(step.keys()) + list(old.keys())):
                if key in ("id", "position"):
                    continue
                if str(step.get(key)) != str(old.get(key)):
                    changes.append({"field": key, "before": str(old.get(key, "")), "after": str(step.get(key, ""))})
            if changes:
                modified.append(NodeDiffItem(
                    node_id=sid,
                    name=step.get("name", sid),
                    node_type=step.get("type", "unknown"),
                    status="modified",
                    changes=changes,
                ))
            else:
                unchanged += 1

    for sid, step in from_steps.items():
        if sid not in current_steps:
            removed.append(NodeDiffItem(
                node_id=sid,
                name=step.get("name", sid),
                node_type=step.get("type", "unknown"),
                status="removed",
            ))

    actual_to = to_version or workflow.get("current_version_number", 1)
    return WorkflowDiffResponse(
        workflow_id=workflow_id,
        from_version=from_version,
        to_version=actual_to,
        added_nodes=added,
        removed_nodes=removed,
        modified_nodes=modified,
        unchanged_count=unchanged,
    )


