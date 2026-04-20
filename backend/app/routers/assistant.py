"""
Assistant router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403

router = APIRouter()

@router.get(f"{settings.api_prefix}/assistant/capabilities", response_model=AssistantCapabilitiesResponse)
def get_assistant_capabilities(session: dict[str, Any] = Depends(get_session_context)) -> AssistantCapabilitiesResponse:
    _ = session
    return AssistantCapabilitiesResponse(
        tools=[
            "name_workflow",
            "match_templates",
            "plan_workflow",
            "draft_workflow",
            "workflow_context",
            "summarize_workflow",
            "rename_workflow",
            "extend_workflow",
            "repair_workflow",
            "validate_workflow",
            "compare_versions",
            "request_promotion",
        ],
        llm_runtime_mode=settings.llm_mode,
        recommended_local_stack=["Ollama", "LangGraph", "FlowHolt backend tools"],
    )



@router.post(f"{settings.api_prefix}/assistant/name", response_model=AssistantNameResponse)
def post_assistant_name(
    payload: AssistantNameRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantNameResponse:
    _ = session
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
    naming = build_assistant_workflow_name(payload.prompt)
    return AssistantNameResponse.model_validate(naming)



@router.post(f"{settings.api_prefix}/assistant/template-match", response_model=AssistantTemplateMatchResponse)
def post_assistant_template_match(
    payload: AssistantNameRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantTemplateMatchResponse:
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
    return build_assistant_template_match_response(
        payload.prompt,
        workspace_id=str(session["workspace"]["id"]),
    )



@router.post(f"{settings.api_prefix}/assistant/plan", response_model=AssistantPlanResponse)
def post_assistant_plan(
    payload: AssistantPlanRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantPlanResponse:
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
    return build_assistant_plan_response(
        payload.prompt,
        workspace_id=str(session["workspace"]["id"]),
    )



@router.post(f"{settings.api_prefix}/assistant/draft-workflow", response_model=AssistantDraftWorkflowResponse)
def post_assistant_draft_workflow(
    payload: AssistantDraftWorkflowRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantDraftWorkflowResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    workspace_id = str(session["workspace"]["id"])
    plan = build_assistant_plan(prompt, list_templates(workspace_id=workspace_id))
    template_match = None
    template_definition = None
    template_id = payload.template_id
    if template_id:
        template = get_template(template_id, workspace_id=workspace_id)
        if template is None:
            raise HTTPException(status_code=404, detail="Template not found")
        template_match = AssistantTemplateMatch(
            template_id=str(template["id"]),
            name=str(template["name"]),
            category=str(template["category"]),
            trigger_type=str(template["trigger_type"]),
            score=100,
            reason="Template was selected explicitly.",
        )
        template_definition = template["definition"]
        trigger_type = str(template["trigger_type"])
        category = str(template["category"])
    else:
        matches = plan["matched_templates"]
        if matches:
            template_match = AssistantTemplateMatch.model_validate(matches[0])
            matched_template = get_template(template_match.template_id, workspace_id=workspace_id)
            if matched_template and int(template_match.score) >= 28:
                template_definition = matched_template["definition"]
        trigger_type = str(plan["trigger_type"])
        category = str(plan["category"])

    used_template_definition = template_definition
    raw_definition = build_draft_definition(
        prompt,
        trigger_type=trigger_type,
        template_definition=used_template_definition,
    )
    normalized_definition, repair_actions = repair_definition_for_storage(
        raw_definition,
        workflow_trigger_type=trigger_type,
        template_definition=used_template_definition,
    )
    validation = validate_or_raise(normalized_definition, workflow_trigger_type=trigger_type)
    try:
        validate_runtime_node_contracts_or_raise(
            normalized_definition,
            workflow_trigger_type=trigger_type,
            workspace_id=workspace_id,
        )
    except HTTPException:
        if used_template_definition is None or payload.template_id:
            raise
        used_template_definition = None
        template_match = None
        raw_definition = build_draft_definition(prompt, trigger_type=trigger_type, template_definition=None)
        normalized_definition, repair_actions = repair_definition_for_storage(
            raw_definition,
            workflow_trigger_type=trigger_type,
            template_definition=None,
        )
        validation = validate_or_raise(normalized_definition, workflow_trigger_type=trigger_type)
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
        workflow_id="assistant-draft",
        workflow_trigger_type=trigger_type,
        workspace_id=workspace_id,
        session=session,
        action="save",
    )

    saved_workflow = None
    suggested_name = payload.name or str(plan["suggested_name"])
    if payload.save:
        workflow = create_workflow(
            WorkflowCreate(
                name=suggested_name,
                trigger_type=trigger_type,
                category=category,
                status="draft",
                template_id=template_match.template_id if template_match else None,
                definition=WorkflowDefinition.model_validate(normalized_definition),
            ),
            workspace_id=workspace_id,
            created_by_user_id=str(session["user"]["id"]),
        )
        saved_workflow = WorkflowSummary.model_validate(workflow)
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="assistant.workflow_drafted",
            target_type="workflow",
            target_id=str(workflow["id"]),
            status="success",
            details={"prompt_preview": prompt[:120], "saved": True},
        )

    return AssistantDraftWorkflowResponse(
        prompt=prompt,
        suggested_name=suggested_name,
        summary=str(plan["summary"]),
        trigger_type=trigger_type,
        category=category,
        template_match=template_match,
        definition=WorkflowDefinition.model_validate(normalized_definition),
        validation=validation,
        saved_workflow=saved_workflow,
        warnings=list(plan["warnings"]) + repair_actions,
    )



@router.get(f"{settings.api_prefix}/assistant/workflows/{{workflow_id}}/context", response_model=AssistantWorkflowContextResponse)
def get_assistant_workflow_context(
    workflow_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantWorkflowContextResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_assistant_workflow_context_response(
        workflow,
        workspace_id=workspace_id,
        session=session,
    )



def build_assistant_workflow_snapshot(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    session: dict[str, Any],
    selected_step_id: str | None = None,
    selected_step_name: str | None = None,
    selected_step_type: str | None = None,
) -> dict[str, Any]:
    definition = dict(workflow.get("definition_json") or {})
    trigger_type = str(workflow.get("trigger_type") or "manual")
    workflow_settings = WorkflowSettings.model_validate(definition.get("settings") or {})
    executions = list_workflow_executions(str(workflow["id"]), workspace_id=workspace_id, limit=20)
    jobs = list_workflow_jobs(workspace_id=workspace_id, limit=50)
    observability = build_workflow_observability_response(
        workflow=workflow,
        executions=executions,
        jobs=jobs,
    )
    policy = build_workflow_policy_response(
        str(workflow["id"]),
        workflow_trigger_type=trigger_type,
        definition=definition,
        workspace_id=workspace_id,
        session=session,
    )
    environments = build_workflow_environments_response(workflow, workspace_id=workspace_id)
    validation = WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            definition,
            workflow_trigger_type=trigger_type,
        )
    )
    runtime_issues = collect_runtime_node_contract_issues(
        definition,
        workflow_trigger_type=trigger_type,
        workspace_id=workspace_id,
    )
    summary_payload = build_workflow_summary(
        workflow,
        observability=observability.model_dump(),
    )
    validation_error_count = sum(1 for issue in validation.issues if issue.level == "error")
    runtime_error_count = sum(1 for issue in runtime_issues if str(issue.get("level") or "") == "error")
    runtime_warning_count = sum(1 for issue in runtime_issues if str(issue.get("level") or "") == "warning")
    warnings = [
        *list(summary_payload["warnings"]),
        *list(policy.warnings),
    ]
    if validation_error_count:
        warnings.append(
            f"{validation_error_count} definition validation issue{'s' if validation_error_count != 1 else ''} still need attention."
        )
    if runtime_error_count:
        warnings.append(
            f"{runtime_error_count} runtime configuration issue{'s' if runtime_error_count != 1 else ''} are blocking this workflow."
        )
    elif runtime_warning_count:
        warnings.append(
            f"{runtime_warning_count} runtime warning{'s' if runtime_warning_count != 1 else ''} should be reviewed."
        )

    selected_step = None
    if selected_step_id:
        matched_step = next(
            (item for item in (definition.get("steps") or []) if str(item.get("id") or "") == selected_step_id),
            None,
        )
        if matched_step is not None:
            selected_step = {
                "id": str(matched_step.get("id") or ""),
                "name": str(matched_step.get("name") or selected_step_name or ""),
                "type": str(matched_step.get("type") or selected_step_type or ""),
            }
    elif selected_step_name or selected_step_type:
        selected_step = {
            "id": str(selected_step_id or ""),
            "name": str(selected_step_name or ""),
            "type": str(selected_step_type or ""),
        }

    return {
        "definition_json": definition,
        "trigger_type": trigger_type,
        "summary": str(summary_payload["summary"]),
        "notable_steps": list(summary_payload["notable_steps"]),
        "warnings": list(dict.fromkeys(item for item in warnings if item)),
        "validation": validation,
        "validation_issues": [issue.model_dump() for issue in validation.issues],
        "runtime_issues": runtime_issues,
        "observability": observability.model_dump(),
        "policy": policy.model_dump(),
        "environments": environments.model_dump(),
        "settings": workflow_settings.model_dump(),
        "selected_step": selected_step,
    }



@router.post(f"{settings.api_prefix}/assistant/workflows/{{workflow_id}}/rename", response_model=AssistantWorkflowRenameResponse)
def post_assistant_workflow_rename(
    workflow_id: str,
    payload: AssistantWorkflowRenameRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantWorkflowRenameResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    naming = build_existing_workflow_name_suggestion(workflow, prompt=payload.prompt)
    suggested_name = str(naming["name"])
    updated_workflow = None

    if payload.save and suggested_name and suggested_name != str(workflow["name"]):
        updated_workflow = update_workflow(
            workflow_id,
            WorkflowUpdate(
                name=suggested_name,
                trigger_type=str(workflow["trigger_type"]),
                category=str(workflow["category"]),
                status=str(workflow["status"]),
                definition=WorkflowDefinition.model_validate(workflow["definition_json"]),
            ),
            workspace_id=workspace_id,
        )
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="assistant.workflow_renamed",
            target_type="workflow",
            target_id=workflow_id,
            status="success",
            details={"previous_name": workflow["name"], "new_name": suggested_name},
        )

    return AssistantWorkflowRenameResponse(
        workflow_id=workflow_id,
        previous_name=str(workflow["name"]),
        suggested_name=suggested_name,
        applied=bool(payload.save),
        reason=str(naming["reason"]),
        workflow=WorkflowSummary.model_validate(updated_workflow) if updated_workflow else None,
    )



@router.post(f"{settings.api_prefix}/assistant/workflows/{{workflow_id}}/extend", response_model=AssistantWorkflowExtendResponse)
def post_assistant_workflow_extend(
    workflow_id: str,
    payload: AssistantWorkflowExtendRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantWorkflowExtendResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    extension = extend_workflow_definition(
        workflow["definition_json"],
        prompt=prompt,
        trigger_type=str(workflow.get("trigger_type") or "manual"),
    )
    normalized_definition, repair_actions = repair_definition_for_storage(
        extension["definition"],
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
    )
    validation = validate_or_raise(
        normalized_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
    )
    validate_runtime_node_contracts_or_raise(
        normalized_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        workspace_id=workspace_id,
    )
    enforce_workflow_asset_access_or_raise(
        normalized_definition,
        workspace_id=workspace_id,
        session=session,
    )
    enforce_workflow_governance_or_raise(
        normalized_definition,
        workflow_id=workflow_id,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )

    updated_workflow = None
    if payload.save:
        updated_workflow = update_workflow(
            workflow_id,
            WorkflowUpdate(
                name=str(workflow["name"]),
                trigger_type=str(workflow["trigger_type"]),
                category=str(workflow["category"]),
                status=str(workflow["status"]),
                definition=WorkflowDefinition.model_validate(normalized_definition),
            ),
            workspace_id=workspace_id,
        )
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="assistant.workflow_extended",
            target_type="workflow",
            target_id=workflow_id,
            status="success",
            details={
                "prompt_preview": prompt[:120],
                "added_steps": [item["id"] for item in extension["added_steps"]],
            },
        )

    summary_payload = build_workflow_summary(
        {
            **workflow,
            "definition_json": normalized_definition,
        }
    )
    return AssistantWorkflowExtendResponse(
        workflow_id=workflow_id,
        prompt=prompt,
        summary=str(summary_payload["summary"]),
        added_steps=[WorkflowStep.model_validate(item) for item in extension["added_steps"]],
        updated_output=WorkflowStep.model_validate(extension["updated_output"]) if extension["updated_output"] else None,
        definition=WorkflowDefinition.model_validate(normalized_definition),
        validation=validation,
        warnings=list(extension["warnings"]) + repair_actions,
        workflow=WorkflowSummary.model_validate(updated_workflow) if updated_workflow else None,
    )



@router.post(f"{settings.api_prefix}/assistant/workflows/{{workflow_id}}/repair", response_model=AssistantWorkflowRepairResponse)
def post_assistant_workflow_repair(
    workflow_id: str,
    payload: AssistantWorkflowRepairRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantWorkflowRepairResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    repaired_definition, actions = repair_definition_for_storage(
        workflow["definition_json"],
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
    )
    validation = WorkflowValidationResponse.model_validate(
        validate_workflow_definition(
            repaired_definition,
            workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        )
    )
    validate_runtime_node_contracts_or_raise(
        repaired_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
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
        workflow_trigger_type=str(workflow.get("trigger_type") or "manual"),
        workspace_id=workspace_id,
        session=session,
        action="save",
    )

    updated_workflow = None
    if payload.save and actions:
        updated_workflow = update_workflow(
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
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="assistant.workflow_repaired",
            target_type="workflow",
            target_id=workflow_id,
            status="success",
            details={"actions": actions},
        )
    return AssistantWorkflowRepairResponse(
        workflow_id=workflow_id,
        repaired=bool(actions),
        actions=actions,
        definition=WorkflowDefinition.model_validate(repaired_definition),
        validation=validation,
        workflow=WorkflowSummary.model_validate(updated_workflow) if updated_workflow else None,
    )



@router.post(f"{settings.api_prefix}/assistant/chat", response_model=AssistantChatResponse)
def post_assistant_chat(
    payload: AssistantChatRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> AssistantChatResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    workflow_context = None
    if payload.workflow_id:
        workflow = get_workflow(payload.workflow_id, workspace_id=workspace_id)
        if workflow:
            workflow_context = build_assistant_workflow_snapshot(
                workflow,
                workspace_id=workspace_id,
                session=session,
                selected_step_id=payload.selected_step_id,
                selected_step_name=payload.selected_step_name,
                selected_step_type=payload.selected_step_type,
            )

    messages = _resolve_assistant_chat_messages(
        payload,
        workspace_id=workspace_id,
        user_id=user_id,
    )
    result = build_assistant_chat_response(
        messages,
        workflow_name=payload.workflow_name,
        step_count=payload.step_count,
        workflow_context=workflow_context,
    )
    if workflow_context is not None:
        result.setdefault("workflow_summary", str(workflow_context.get("summary") or "") or None)
        result.setdefault("context_warnings", list(workflow_context.get("warnings") or []))
        selected_step = dict(workflow_context.get("selected_step") or {})
        result.setdefault("selected_step_id", str(selected_step.get("id") or "") or None)
    return AssistantChatResponse.model_validate(result)



@router.post(f"{settings.api_prefix}/assistant/chat/stream")
def post_assistant_chat_stream(
    payload: AssistantChatRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StreamingResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    workflow_context = None
    if payload.workflow_id:
        workflow = get_workflow(payload.workflow_id, workspace_id=workspace_id)
        if workflow:
            workflow_context = build_assistant_workflow_snapshot(
                workflow,
                workspace_id=workspace_id,
                session=session,
                selected_step_id=payload.selected_step_id,
                selected_step_name=payload.selected_step_name,
                selected_step_type=payload.selected_step_type,
            )

    messages = _resolve_assistant_chat_messages(
        payload,
        workspace_id=workspace_id,
        user_id=user_id,
    )

    def event_generator():
        for event in stream_assistant_chat_response(
            messages,
            workflow_name=payload.workflow_name,
            step_count=payload.step_count,
            workflow_context=workflow_context,
        ):
            yield _format_sse_event(event.get("event", "message"), event.get("data", {}))

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Copilot Contextual Suggestions ──

_COPILOT_NODE_SUGGESTIONS: dict[str, list[dict[str, str]]] = {
    "trigger": [
        {"label": "Add input validation", "prompt": "Add input validation to the trigger payload", "category": "security"},
        {"label": "Configure rate limiting", "prompt": "Set up rate limiting for this trigger", "category": "reliability"},
        {"label": "Add authentication check", "prompt": "Add authentication to this trigger endpoint", "category": "security"},
        {"label": "Generate test payload", "prompt": "Generate sample test data for this trigger", "category": "testing"},
    ],
    "integration": [
        {"label": "Add error handling", "prompt": "Add retry logic and error handling to this API node", "category": "reliability"},
        {"label": "Map response fields", "prompt": "Map the response fields to the format I need", "category": "data"},
        {"label": "Add timeout config", "prompt": "Configure timeout and fallback for this integration", "category": "reliability"},
        {"label": "Test with mock data", "prompt": "Generate mock response data for testing", "category": "testing"},
    ],
    "ai": [
        {"label": "Optimize prompt", "prompt": "Optimize the AI prompt for better accuracy", "category": "optimization"},
        {"label": "Add fallback model", "prompt": "Add a fallback model in case the primary fails", "category": "reliability"},
        {"label": "Stream response", "prompt": "Configure streaming for faster perceived response", "category": "performance"},
        {"label": "Add output parsing", "prompt": "Parse the AI output into structured JSON", "category": "data"},
    ],
    "logic": [
        {"label": "Add missing branch", "prompt": "Check for missing branches in this logic node", "category": "correctness"},
        {"label": "Add default case", "prompt": "Add a default/fallback case to handle unexpected values", "category": "reliability"},
        {"label": "Simplify conditions", "prompt": "Simplify the conditions in this node", "category": "optimization"},
        {"label": "Add logging", "prompt": "Add debug logging to trace the decision path", "category": "debugging"},
    ],
    "output": [
        {"label": "Format message", "prompt": "Improve the output message formatting", "category": "ux"},
        {"label": "Add confirmation", "prompt": "Add a confirmation or success response", "category": "ux"},
        {"label": "Batch notifications", "prompt": "Batch multiple items into a single notification", "category": "performance"},
        {"label": "Add rich formatting", "prompt": "Add rich text/markdown formatting to the output", "category": "ux"},
    ],
    "data": [
        {"label": "Validate schema", "prompt": "Add schema validation for the data", "category": "security"},
        {"label": "Add deduplication", "prompt": "Add deduplication logic before storing", "category": "data"},
        {"label": "Batch inserts", "prompt": "Optimize with batch insert operations", "category": "performance"},
        {"label": "Add index hints", "prompt": "Suggest indexes for this data operation", "category": "optimization"},
    ],
}


@router.get(f"{settings.api_prefix}/copilot/suggestions")
def get_copilot_suggestions(
    node_type: str | None = None,
    workflow_id: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Return contextual copilot suggestions based on node type and workflow context."""
    suggestions = []
    if node_type and node_type in _COPILOT_NODE_SUGGESTIONS:
        suggestions = _COPILOT_NODE_SUGGESTIONS[node_type]

    workflow_hints: list[str] = []
    if workflow_id:
        workspace_id = str(session["workspace"]["id"])
        workflow = get_workflow(workflow_id, workspace_id=workspace_id)
        if workflow:
            steps = workflow.get("definition", {}).get("steps", [])
            if len(steps) > 0 and not any(s.get("type") == "error_trigger" for s in steps):
                workflow_hints.append("This workflow has no error handler — consider adding one.")
            if len(steps) > 5:
                workflow_hints.append("Complex workflow — consider splitting into sub-workflows.")
            has_http = any(s.get("type") in ("http_request", "webhook") for s in steps)
            if has_http and not any("retry" in str(s.get("config", {})).lower() for s in steps):
                workflow_hints.append("HTTP nodes without retry logic detected.")

    return {
        "suggestions": suggestions,
        "workflow_hints": workflow_hints,
        "node_type": node_type,
    }


@router.post(f"{settings.api_prefix}/copilot/feedback")
def post_copilot_feedback(
    payload: dict[str, Any],
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, str]:
    """Record copilot feedback (thumbs up/down, suggestion usage)."""
    from ..repository import log_audit_event
    log_audit_event(
        workspace_id=str(session["workspace"]["id"]),
        user_id=str(session["user"]["id"]),
        event_type="copilot_feedback",
        detail={
            "message_id": payload.get("message_id"),
            "rating": payload.get("rating"),
            "suggestion_used": payload.get("suggestion_used"),
            "context": payload.get("context"),
        },
    )
    return {"status": "recorded"}