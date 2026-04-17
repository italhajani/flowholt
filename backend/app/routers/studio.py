"""
Studio router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403

router = APIRouter()

@router.get(f"{settings.api_prefix}/studio/nodes", response_model=list[NodeDefinitionSummary])
def get_studio_nodes(session: dict[str, Any] = Depends(get_session_context)) -> list[NodeDefinitionSummary]:
    _ = session
    return [NodeDefinitionSummary.model_validate(item) for item in list_node_definitions()]



@router.get(f"{settings.api_prefix}/studio/node-error-settings")
def get_node_error_settings(session: dict[str, Any] = Depends(get_session_context)) -> list[dict[str, Any]]:
    """Return the standard per-node error-handling fields rendered in the inspector Settings tab."""
    _ = session
    return get_node_error_settings_fields()



@router.get(f"{settings.api_prefix}/studio/catalog", response_model=NodeCatalogResponse)
def get_studio_catalog(session: dict[str, Any] = Depends(get_session_context)) -> NodeCatalogResponse:
    _ = session
    return NodeCatalogResponse.model_validate(build_node_catalog())



@router.get(f"{settings.api_prefix}/studio/integrations", response_model=IntegrationCatalogResponse)
def get_studio_integrations(session: dict[str, Any] = Depends(get_session_context)) -> IntegrationCatalogResponse:
    _ = session
    return IntegrationCatalogResponse(apps=[IntegrationAppSummary.model_validate(item) for item in list_integration_apps()])



@router.get(f"{settings.api_prefix}/studio/integrations/{{app_key}}", response_model=IntegrationAppSummary)
def get_studio_integration_app(app_key: str, session: dict[str, Any] = Depends(get_session_context)) -> IntegrationAppSummary:
    _ = session
    item = get_integration_app(app_key)
    if item is None:
        raise HTTPException(status_code=404, detail="Integration app not found")
    normalized = {
        **item,
        "operations": [{key: op[key] for key in ("key", "label", "direction", "description", "resource")} for op in item["operations"]],
    }
    return IntegrationAppSummary.model_validate(normalized)



@router.get(f"{settings.api_prefix}/studio/integrations/{{app_key}}/operations/{{operation_key}}", response_model=IntegrationOperationDetail)
def get_studio_integration_operation(
    app_key: str,
    operation_key: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> IntegrationOperationDetail:
    _ = session
    item = get_integration_operation(app_key, operation_key)
    if item is None:
        raise HTTPException(status_code=404, detail="Integration operation not found")
    return IntegrationOperationDetail.model_validate(item)



@router.get(f"{settings.api_prefix}/studio/nodes/{{node_type}}", response_model=NodeDefinitionSummary)
def get_studio_node_detail(node_type: str, session: dict[str, Any] = Depends(get_session_context)) -> NodeDefinitionSummary:
    _ = session
    item = get_node_definition(node_type)
    if item is None:
        raise HTTPException(status_code=404, detail="Node type not found")
    return NodeDefinitionSummary.model_validate(item)



@router.get(f"{settings.api_prefix}/studio/nodes/{{node_type}}/editor", response_model=NodeEditorResponse)
def get_studio_node_editor(
    node_type: str,
    trigger_type: str | None = None,
    workflow_id: str | None = None,
    step_id: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeEditorResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow_trigger_type = trigger_type
    step_name: str | None = None
    step_config: dict[str, Any] = {}

    if workflow_id:
        workflow = get_workflow(workflow_id, workspace_id=workspace_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        workflow_trigger_type = workflow_trigger_type or str(workflow.get("trigger_type") or "")
        if step_id:
            step = next((item for item in workflow["definition_json"].get("steps", []) if item.get("id") == step_id), None)
            if step is not None:
                step_name = str(step.get("name") or "")
                step_config = dict(step.get("config") or {})

    binding_context = get_workspace_binding_context(workspace_id)

    try:
        payload = build_node_editor_response(
            node_type,
            config=step_config,
            workflow_trigger_type=workflow_trigger_type,
            workflow_definition=workflow["definition_json"] if workflow_id and workflow is not None else None,
            current_step_id=step_id,
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
            step_name=step_name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return NodeEditorResponse.model_validate(payload)



@router.post(f"{settings.api_prefix}/studio/nodes/draft", response_model=NodeDraftResponse)
def post_studio_node_draft(
    payload: NodeDraftRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeDraftResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)

    try:
        item = build_node_draft(
            payload.node_type,
            workflow_trigger_type=payload.trigger_type,
            name=payload.name,
            config=payload.config,
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return NodeDraftResponse.model_validate(item)



@router.post(f"{settings.api_prefix}/studio/nodes/preview", response_model=NodePreviewResponse)
def post_studio_node_preview(
    payload: NodePreviewRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodePreviewResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)

    item = resolve_node_preview(
        payload.step.model_dump(),
        workflow_trigger_type=payload.trigger_type,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
    )
    return NodePreviewResponse.model_validate(item)



@router.post(f"{settings.api_prefix}/studio/nodes/{{node_type}}/validate", response_model=NodeConfigValidationResponse)
def post_studio_node_validate(
    node_type: str,
    payload: NodeConfigTestRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeConfigValidationResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)
    try:
        result = validate_node_configuration(
            node_type,
            config=payload.config,
            trigger_type=payload.trigger_type,
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
            step_name=payload.name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return NodeConfigValidationResponse.model_validate(result)



@router.post(f"{settings.api_prefix}/studio/nodes/{{node_type}}/test", response_model=NodeConfigTestResponse)
def post_studio_node_test(
    node_type: str,
    payload: NodeConfigTestRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeConfigTestResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)
    try:
        result = test_node_configuration(
            node_type,
            config=payload.config,
            trigger_type=payload.trigger_type,
            payload=payload.payload,
            connections=binding_context["connections"],
            credentials=binding_context["credentials"],
            variables=binding_context["variables"],
            members=binding_context["members"],
            step_name=payload.name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return NodeConfigTestResponse.model_validate(result)



@router.get(f"{settings.api_prefix}/studio/nodes/{{node_type}}/resources", response_model=NodeResourcesResponse)
def get_studio_node_resources(
    node_type: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeResourcesResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)
    result = build_node_resources(
        node_type,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
    )
    return NodeResourcesResponse.model_validate(result)



@router.post(f"{settings.api_prefix}/studio/nodes/{{node_type}}/dynamic-props", response_model=NodeDynamicPropsResponse)
def post_studio_node_dynamic_props(
    node_type: str,
    payload: NodeDynamicPropsRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeDynamicPropsResponse:
    workspace_id = str(session["workspace"]["id"])
    binding_context = get_workspace_binding_context(workspace_id)
    result = resolve_dynamic_operation_fields(
        node_type=node_type,
        config=payload.config,
        connections=binding_context["connections"],
        variables=binding_context["variables"],
    )
    return NodeDynamicPropsResponse.model_validate(result)



@router.post(f"{settings.api_prefix}/studio/validate", response_model=WorkflowValidationResponse)
def post_studio_validate(
    payload: WorkflowCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowValidationResponse:
    workspace_id = str(session["workspace"]["id"])
    response = validate_or_raise(
        payload.definition.model_dump(),
        workflow_trigger_type=payload.trigger_type,
    )
    validate_runtime_node_contracts_or_raise(
        payload.definition.model_dump(),
        workflow_trigger_type=payload.trigger_type,
        workspace_id=workspace_id,
    )
    return response



@router.get(f"{settings.api_prefix}/studio/plugins")
def get_plugins(session: dict[str, Any] = Depends(get_session_context)) -> list[dict[str, Any]]:
    _ = session
    from .plugin_loader import get_plugin_registry
    registry = get_plugin_registry()
    return [plugin.to_registry_entry() for plugin in registry.list_all()]



@router.get(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/bundle", response_model=StudioWorkflowBundleResponse)
def get_studio_workflow_bundle(
    workflow_id: str,
    selected_step_id: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return build_studio_workflow_bundle_payload(
        workflow,
        workspace_id=workspace_id,
        selected_step_id=selected_step_id,
    )



@router.get(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/editor", response_model=NodeEditorResponse)
def get_studio_workflow_step_editor(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeEditorResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")

    binding_context = get_workspace_binding_context(workspace_id)
    payload = build_node_editor_response(
        str(step["type"]),
        config=dict(step.get("config") or {}),
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        workflow_definition=workflow["definition_json"],
        current_step_id=step_id,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        step_name=str(step.get("name") or ""),
    )
    return NodeEditorResponse.model_validate(payload)



@router.get(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/access", response_model=StudioStepAccessResponse)
def get_studio_workflow_step_access(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioStepAccessResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    return build_step_access_response(workflow_id, step, workspace_id=workspace_id, session=session)



@router.get(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/resources", response_model=NodeResourcesResponse)
def get_studio_workflow_step_resources(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeResourcesResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    binding_context = get_workspace_binding_context(workspace_id)
    result = build_node_resources(
        str(step["type"]),
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        config=dict(step.get("config") or {}),
    )
    return NodeResourcesResponse.model_validate(result)



@router.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/dynamic-props", response_model=NodeDynamicPropsResponse)
def post_studio_workflow_step_dynamic_props(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeDynamicPropsResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    binding_context = get_workspace_binding_context(workspace_id)
    result = resolve_dynamic_operation_fields(
        node_type=str(step["type"]),
        config=dict(step.get("config") or {}),
        connections=binding_context["connections"],
        variables=binding_context["variables"],
    )
    return NodeDynamicPropsResponse.model_validate(result)



@router.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/validate", response_model=NodeConfigValidationResponse)
def post_studio_workflow_step_validate(
    workflow_id: str,
    step_id: str,
    payload: NodeConfigTestRequest | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeConfigValidationResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    binding_context = get_workspace_binding_context(workspace_id)
    result = validate_node_configuration(
        str(step["type"]),
        config=dict(payload.config if payload is not None else step.get("config") or {}),
        trigger_type=str((payload.trigger_type if payload is not None and payload.trigger_type is not None else workflow.get("trigger_type")) or ""),
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        step_name=str((payload.name if payload is not None and payload.name is not None else step.get("name")) or ""),
    )
    definition = dict(workflow.get("definition_json") or {})
    candidate_steps: list[dict[str, Any]] = []
    for item in (definition.get("steps") or []):
        if str(item.get("id") or "") != step_id:
            candidate_steps.append(dict(item or {}))
            continue
        candidate_steps.append(
            {
                **dict(item or {}),
                "name": payload.name if payload is not None and payload.name is not None else item.get("name"),
                "config": dict(payload.config if payload is not None else item.get("config") or {}),
            }
        )
    definition["steps"] = candidate_steps
    cluster_issues = [
        issue
        for issue in validate_workflow_cluster_configuration(definition)
        if str(issue.get("step_id") or "") == step_id
    ]
    if cluster_issues:
        merged_issues = [
            *list(result.get("issues") or []),
            *[
                {
                    "level": issue["level"],
                    "code": issue["code"],
                    "message": issue["message"],
                    "field": issue.get("field"),
                }
                for issue in cluster_issues
            ],
        ]
        result = {
            **result,
            "valid": not any(issue["level"] == "error" for issue in merged_issues),
            "issues": merged_issues,
        }
    return NodeConfigValidationResponse.model_validate(result)



@router.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/test-config", response_model=NodeConfigTestResponse)
def post_studio_workflow_step_test_config(
    workflow_id: str,
    step_id: str,
    payload: StudioStepTestRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> NodeConfigTestResponse:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in (workflow["definition_json"].get("steps") or []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    binding_context = get_workspace_binding_context(workspace_id)
    result = test_node_configuration(
        str(step["type"]),
        config=dict(step.get("config") or {}),
        trigger_type=str(workflow.get("trigger_type") or ""),
        payload=payload.payload,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
        step_name=str(step.get("name") or ""),
    )
    return NodeConfigTestResponse.model_validate(result)



@router.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/insert", response_model=StudioWorkflowBundleResponse)
def post_studio_insert_step(
    workflow_id: str,
    payload: StudioInsertStepRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    binding_context = get_workspace_binding_context(workspace_id)
    draft = build_node_draft(
        payload.node_type,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        name=payload.name,
        config=payload.config,
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
    )
    next_definition = insert_step_into_definition(
        workflow["definition_json"],
        draft["step"],
        after_step_id=payload.after_step_id,
        branch_label=payload.branch_label,
        connect_to_step_id=payload.connect_to_step_id,
    )
    repaired_definition, _ = repair_definition_for_storage(
        next_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
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
        raise HTTPException(status_code=500, detail="Failed to insert step")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="studio.step.inserted",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"step_id": draft["step"]["id"], "node_type": payload.node_type},
    )
    return build_studio_workflow_bundle_payload(updated, workspace_id=workspace_id, selected_step_id=str(draft["step"]["id"]))



@router.put(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}", response_model=StudioWorkflowBundleResponse)
def put_studio_step(
    workflow_id: str,
    step_id: str,
    payload: StudioUpdateStepRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if not any(str(step.get("id")) == step_id for step in workflow["definition_json"].get("steps", [])):
        raise HTTPException(status_code=404, detail="Workflow step not found")

    next_definition = update_step_in_definition(
        workflow["definition_json"],
        step_id,
        name=payload.name,
        config=payload.config,
        replace_config=payload.replace_config,
    )
    repaired_definition, _ = repair_definition_for_storage(
        next_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
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
        raise HTTPException(status_code=500, detail="Failed to update step")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="studio.step.updated",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"step_id": step_id},
    )
    return build_studio_workflow_bundle_payload(updated, workspace_id=workspace_id, selected_step_id=step_id)



@router.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/duplicate", response_model=StudioWorkflowBundleResponse)
def post_studio_duplicate_step(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    try:
        next_definition, duplicate_id = duplicate_step_in_definition(workflow["definition_json"], step_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    repaired_definition, _ = repair_definition_for_storage(
        next_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
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
        raise HTTPException(status_code=500, detail="Failed to duplicate step")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="studio.step.duplicated",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"step_id": step_id, "duplicate_id": duplicate_id},
    )
    return build_studio_workflow_bundle_payload(updated, workspace_id=workspace_id, selected_step_id=duplicate_id)



@router.delete(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}", response_model=StudioWorkflowBundleResponse)
def delete_studio_step(
    workflow_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioWorkflowBundleResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    next_definition = delete_step_from_definition(workflow["definition_json"], step_id)
    repaired_definition, _ = repair_definition_for_storage(
        next_definition,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
    )
    validate_or_raise(repaired_definition, workflow_trigger_type=str(workflow.get("trigger_type") or ""))
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
        raise HTTPException(status_code=500, detail="Failed to delete step")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="studio.step.deleted",
        target_type="workflow",
        target_id=workflow_id,
        status="success",
        details={"step_id": step_id},
    )
    fallback_selected = updated["definition_json"].get("steps", [{}])[0].get("id") if updated["definition_json"].get("steps") else None
    return build_studio_workflow_bundle_payload(updated, workspace_id=workspace_id, selected_step_id=fallback_selected)



@router.post(f"{settings.api_prefix}/studio/workflows/{{workflow_id}}/steps/{{step_id}}/test", response_model=StudioStepTestResponse)
def post_studio_test_step(
    workflow_id: str,
    step_id: str,
    payload: StudioStepTestRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> StudioStepTestResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    step = next((item for item in workflow["definition_json"].get("steps", []) if str(item.get("id")) == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Workflow step not found")

    vault_context = build_vault_runtime_context(workspace_id)
    result = test_step_in_definition(
        workflow["definition_json"],
        target_step_id=step_id,
        payload=payload.payload,
        vault_context=vault_context,
    )
    binding_context = get_workspace_binding_context(workspace_id)
    preview_payload = resolve_node_preview(
        step,
        workflow_trigger_type=str(workflow.get("trigger_type") or ""),
        connections=binding_context["connections"],
        credentials=binding_context["credentials"],
        variables=binding_context["variables"],
        members=binding_context["members"],
    )
    return StudioStepTestResponse(
        workflow_id=workflow_id,
        step_id=step_id,
        reached_target=bool(result["reached_target"]),
        status=str(result["status"]),
        executed_step_ids=result["executed_step_ids"],
        target_step_result=result["target_step_result"],
        warnings=result["warnings"],
        preview=NodePreviewResponse.model_validate(preview_payload),
    )



