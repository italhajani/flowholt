"""
Executions router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403

router = APIRouter()

@router.post(f"{settings.api_prefix}/executions/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_executions(
    payload: BulkDeleteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> BulkDeleteResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    deleted = 0
    errors: list[str] = []
    for exec_id in payload.ids:
        try:
            delete_execution(exec_id, workspace_id=workspace_id)
            deleted += 1
        except Exception as exc:
            errors.append(f"{exec_id}: {exc}")
    if deleted:
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="executions.bulk_deleted",
            target_type="execution",
            target_id="bulk",
            status="success",
            details={"count": deleted, "ids": payload.ids[:20]},
        )
    return BulkDeleteResponse(deleted=deleted, errors=errors)



@router.get(f"{settings.api_prefix}/executions", response_model=list[ExecutionSummary])
def get_executions(
    limit: int = 200,
    offset: int = 0,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[ExecutionSummary]:
    return [
        normalize_execution(item)
        for item in list_executions(workspace_id=str(session["workspace"]["id"]), limit=min(limit, 500), offset=offset)
    ]



@router.get(f"{settings.api_prefix}/workflows/{{workflow_id}}/executions", response_model=list[ExecutionSummary])
def get_workflow_execution_list(
    workflow_id: str,
    status: str | None = None,
    limit: int = 50,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[ExecutionSummary]:
    workspace_id = str(session["workspace"]["id"])
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return [
        normalize_execution(item)
        for item in list_workflow_executions(
            workflow_id,
            workspace_id=workspace_id,
            limit=max(1, min(limit, 100)),
            status=status,
        )
    ]



@router.get(f"{settings.api_prefix}/executions/{{execution_id}}", response_model=ExecutionSummary)
def get_execution_detail(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    execution = get_execution(execution_id, workspace_id=str(session["workspace"]["id"]))
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return normalize_execution(execution)



@router.delete(f"{settings.api_prefix}/executions/{{execution_id}}")
def delete_execution_route(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    delete_execution(execution_id, workspace_id=workspace_id)
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="execution.deleted",
        target_type="execution",
        target_id=execution_id,
        status="success",
    )
    return Response(status_code=204)



@router.get(f"{settings.api_prefix}/executions/{{execution_id}}/bundle", response_model=ExecutionInspectorResponse)
def get_execution_bundle(
    execution_id: str,
    request: Request,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionInspectorResponse:
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return build_execution_inspector_response(execution=execution, workspace_id=workspace_id, request=request)



@router.get(f"{settings.api_prefix}/executions/{{execution_id}}/events", response_model=list[ExecutionEventSummary])
def get_execution_events(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[ExecutionEventSummary]:
    execution = get_execution(execution_id, workspace_id=str(session["workspace"]["id"]))
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return [
        ExecutionEventSummary.model_validate(
            {
                **item,
                "data": item.get("data_json") or {},
            }
        )
        for item in list_execution_events(
            execution_id=execution_id,
            workspace_id=str(session["workspace"]["id"]),
        )
    ]



@router.get(f"{settings.api_prefix}/executions/{{execution_id}}/stream")
async def stream_execution(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> StreamingResponse:
    """Stream execution status changes via Server-Sent Events.

    The client connects and receives periodic SSE messages with the current
    execution state. The stream ends when the execution reaches a terminal
    state (success, failed, cancelled) or after a maximum of 5 minutes.
    """
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")

    terminal_statuses = {"success", "failed", "cancelled"}

    async def event_generator():
        max_iterations = 150  # 5 minutes at 2-second intervals
        last_status = None
        last_event_count = 0

        for _ in range(max_iterations):
            ex = get_execution(execution_id, workspace_id=workspace_id)
            if ex is None:
                yield f"event: error\ndata: {json.dumps({'error': 'Execution not found'})}\n\n"
                return

            events = list_execution_events(execution_id=execution_id, workspace_id=workspace_id)
            current_event_count = len(events)
            current_status = ex.get("status", "unknown")

            # Only emit when something changed
            if current_status != last_status or current_event_count != last_event_count:
                payload = {
                    "id": execution_id,
                    "status": current_status,
                    "started_at": ex.get("started_at"),
                    "finished_at": ex.get("finished_at"),
                    "duration_ms": ex.get("duration_ms"),
                    "error_text": ex.get("error_text"),
                    "event_count": current_event_count,
                    "steps": ex.get("steps_json") if isinstance(ex.get("steps_json"), list) else [],
                }
                yield f"data: {json.dumps(payload)}\n\n"
                last_status = current_status
                last_event_count = current_event_count

            if current_status in terminal_statuses:
                yield f"event: done\ndata: {json.dumps({'status': current_status})}\n\n"
                return

            await asyncio.sleep(2)

        yield f"event: timeout\ndata: {json.dumps({'message': 'Stream timed out after 5 minutes'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )



@router.get(f"{settings.api_prefix}/executions/{{execution_id}}/artifacts", response_model=ExecutionArtifactListResponse)
def get_execution_artifacts(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionArtifactListResponse:
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    artifacts = [
        normalize_execution_artifact(item)
        for item in list_execution_artifacts(execution_id=execution_id, workspace_id=workspace_id)
    ]
    return ExecutionArtifactListResponse(
        execution_id=execution_id,
        count=len(artifacts),
        artifacts=artifacts,
    )



@router.get(f"{settings.api_prefix}/executions/{{execution_id}}/artifacts/{{artifact_id}}", response_model=ExecutionArtifactSummary)
def get_execution_artifact_detail(
    execution_id: str,
    artifact_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionArtifactSummary:
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    artifact = get_execution_artifact(artifact_id, execution_id=execution_id, workspace_id=workspace_id)
    if artifact is None:
        raise HTTPException(status_code=404, detail="Execution artifact not found")
    return normalize_execution_artifact(artifact)



@router.get(f"{settings.api_prefix}/executions/{{execution_id}}/steps/{{step_id}}", response_model=ExecutionStepInspectorResponse)
def get_execution_step_detail(
    execution_id: str,
    step_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionStepInspectorResponse:
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    response = build_execution_step_inspector_response(execution=execution, step_id=step_id, workspace_id=workspace_id)
    if response.result is None and not response.events and not response.artifacts:
        raise HTTPException(status_code=404, detail="Execution step data not found")
    return response



@router.get(f"{settings.api_prefix}/executions/{{execution_id}}/pause", response_model=ExecutionPauseSummary)
def get_execution_pause_detail(
    execution_id: str,
    request: Request,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionPauseSummary:
    pause = get_execution_pause(execution_id, workspace_id=str(session["workspace"]["id"]))
    if pause is None:
        raise HTTPException(status_code=404, detail="Paused execution not found")
    return build_execution_pause_response(pause, request)



@router.post(f"{settings.api_prefix}/executions/{{execution_id}}/retry", response_model=WorkflowJobSummary, status_code=201)
def retry_execution(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowJobSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")

    workflow = get_workflow(str(execution["workflow_id"]), workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    payload = dict(execution.get("payload_json") or {})
    payload["_retry_of_execution_id"] = execution_id
    payload["_trigger_type"] = str(execution.get("trigger_type") or "manual")

    job = create_workflow_job(
        workspace_id=workspace_id,
        workflow_id=str(workflow["id"]),
        workflow_version_id=str(execution["workflow_version_id"]) if execution.get("workflow_version_id") else None,
        initiated_by_user_id=str(session["user"]["id"]),
        environment=str(execution.get("environment") or "draft"),
        trigger_type="retry",
        payload=payload,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="execution.retry_queued",
        target_type="execution",
        target_id=execution_id,
        status="success",
        details={"job_id": job["id"], "workflow_id": workflow["id"]},
    )
    return WorkflowJobSummary.model_validate(job)



@router.post(f"{settings.api_prefix}/executions/{{execution_id}}/replay", response_model=ExecutionReplayResponse)
def replay_execution(
    execution_id: str,
    payload: ExecutionReplayRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionReplayResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    execution = get_execution(execution_id, workspace_id=workspace_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")

    workflow = get_workflow(str(execution["workflow_id"]), workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    runtime_definition = workflow["definition_json"]
    runtime_version_id: str | None = None
    replay_mode = payload.mode
    if replay_mode == "same_version" and execution.get("workflow_version_id"):
        version = get_workflow_version(str(execution["workflow_version_id"]), workspace_id=workspace_id)
        if version is not None:
            runtime_definition = version["definition_json"]
            runtime_version_id = str(version["id"])
    elif replay_mode == "latest_published":
        published_version = get_published_workflow_version(str(workflow["id"]), workspace_id=workspace_id)
        if published_version is not None:
            runtime_definition = published_version["definition_json"]
            runtime_version_id = str(published_version["id"])

    replay_payload = dict(execution.get("payload_json") or {})
    replay_payload.update(payload.payload_override or {})
    replay_payload["_replay_of_execution_id"] = execution_id
    replay_payload["_trigger_type"] = "replay"
    replay_payload["_replay_mode"] = replay_mode

    if payload.queued:
        job = create_workflow_job(
            workspace_id=workspace_id,
            workflow_id=str(workflow["id"]),
            workflow_version_id=runtime_version_id,
            initiated_by_user_id=str(session["user"]["id"]),
            environment=("production" if replay_mode == "latest_published" else str(execution.get("environment") or "draft") if replay_mode == "same_version" else "draft"),
            trigger_type="replay",
            payload=replay_payload,
        )
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="execution.replay_queued",
            target_type="execution",
            target_id=execution_id,
            status="success",
            details={"job_id": job["id"], "mode": replay_mode, "workflow_id": workflow["id"]},
        )
        return ExecutionReplayResponse(
            mode=replay_mode,
            queued=True,
            job=WorkflowJobSummary.model_validate(job),
        )

    replayed_execution = _execute_workflow(
        workflow,
        replay_payload,
        trigger_type="replay",
        environment=("production" if replay_mode == "latest_published" else str(execution.get("environment") or "draft") if replay_mode == "same_version" else "draft"),
        initiated_by_user_id=str(session["user"]["id"]),
        runtime_definition_override=runtime_definition,
        runtime_version_id_override=runtime_version_id,
    )
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="execution.replayed",
        target_type="execution",
        target_id=execution_id,
        status="success",
        details={"mode": replay_mode, "replayed_execution_id": replayed_execution.id, "workflow_id": workflow["id"]},
    )
    return ExecutionReplayResponse(
        mode=replay_mode,
        queued=False,
        execution=replayed_execution,
    )



@router.post(f"{settings.api_prefix}/executions/{{execution_id}}/resume", response_model=ExecutionSummary)
def resume_execution(
    execution_id: str,
    payload: ResumeExecutionRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    pause = get_execution_pause(execution_id, workspace_id=str(session["workspace"]["id"]))
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=404, detail="Paused execution not found")
    return _resume_paused_execution(
        pause,
        resume_payload=payload.payload,
        resume_decision=payload.decision,
        session=session,
    )



@router.post(f"{settings.api_prefix}/executions/{{execution_id}}/cancel", response_model=ExecutionSummary)
def cancel_execution(
    execution_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    pause = get_execution_pause(execution_id, workspace_id=str(session["workspace"]["id"]))
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=404, detail="Paused execution not found")
    return _cancel_paused_execution(pause, session=session)



@router.post(f"{settings.api_prefix}/executions/resume/{{resume_token}}", response_model=ExecutionSummary)
def resume_execution_by_token(
    resume_token: str,
    payload: ResumeExecutionRequest,
) -> ExecutionSummary:
    pause = get_execution_pause_by_token(token=resume_token, token_kind="resume")
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=404, detail="Resume token not found")
    return _resume_paused_execution(
        pause,
        resume_payload=payload.payload,
        resume_decision=payload.decision,
        session=None,
    )



@router.post(f"{settings.api_prefix}/executions/cancel/{{cancel_token}}", response_model=ExecutionSummary)
def cancel_execution_by_token(cancel_token: str) -> ExecutionSummary:
    pause = get_execution_pause_by_token(token=cancel_token, token_kind="cancel")
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=404, detail="Cancel token not found")
    return _cancel_paused_execution(pause, session=None)



