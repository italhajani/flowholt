"""
Triggers router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403
from ..helpers import _execute_workflow, _resume_paused_execution  # noqa: F401

router = APIRouter()

@router.post(f"{settings.api_prefix}/system/repair-workflows", response_model=WorkflowRepairResponse)
def post_repair_workspace_workflows(
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowRepairResponse:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    workflows = list_workflows(workspace_id=workspace_id)
    results: list[WorkflowRepairSummary] = []
    repaired_count = 0

    for workflow in workflows:
        validation_before = WorkflowValidationResponse.model_validate(
            validate_workflow_definition(
                workflow["definition_json"],
                workflow_trigger_type=str(workflow.get("trigger_type") or ""),
            )
        )

        template_definition = None
        if workflow.get("template_id"):
            template = get_template(str(workflow["template_id"]), workspace_id=workspace_id)
            template_definition = template.get("definition") if template else None

        repaired_definition, actions = repair_definition_for_storage(
            workflow["definition_json"],
            workflow_trigger_type=str(workflow.get("trigger_type") or ""),
            template_definition=template_definition,
        )
        validation_after = WorkflowValidationResponse.model_validate(
            validate_workflow_definition(
                repaired_definition,
                workflow_trigger_type=str(workflow.get("trigger_type") or ""),
            )
        )
        runtime_validation_blocked = False
        try:
            validate_runtime_node_contracts_or_raise(
                repaired_definition,
                workflow_trigger_type=str(workflow.get("trigger_type") or ""),
                workspace_id=workspace_id,
            )
        except HTTPException:
            runtime_validation_blocked = True
        issues_before_dump = [issue.model_dump() for issue in validation_before.issues]
        issues_after_dump = [issue.model_dump() for issue in validation_after.issues]
        should_repair = bool(actions) or len(issues_after_dump) < len(issues_before_dump)

        if not should_repair:
            results.append(
                WorkflowRepairSummary(
                    workflow_id=str(workflow["id"]),
                    workflow_name=str(workflow["name"]),
                    repaired=False,
                    actions=actions,
                    issues_before=validation_before.issues,
                    issues_after=validation_after.issues,
                )
            )
            continue
        if [issue for issue in validation_after.issues if issue.level == "error"] or runtime_validation_blocked:
            results.append(
                WorkflowRepairSummary(
                    workflow_id=str(workflow["id"]),
                    workflow_name=str(workflow["name"]),
                    repaired=False,
                    actions=actions,
                    issues_before=validation_before.issues,
                    issues_after=validation_after.issues,
                )
            )
            continue

        updated = update_workflow(
            str(workflow["id"]),
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
            results.append(
                WorkflowRepairSummary(
                    workflow_id=str(workflow["id"]),
                    workflow_name=str(workflow["name"]),
                    repaired=False,
                    actions=actions,
                    issues_before=validation_before.issues,
                    issues_after=validation_after.issues,
                )
            )
            continue

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
            target_id=str(workflow["id"]),
            status="success",
            details={"actions": actions},
        )
        repaired_count += 1
        results.append(
            WorkflowRepairSummary(
                workflow_id=str(workflow["id"]),
                workflow_name=str(workflow["name"]),
                repaired=True,
                actions=actions,
                issues_before=validation_before.issues,
                issues_after=validation_after.issues,
            )
        )

    return WorkflowRepairResponse(
        total_checked=len(workflows),
        repaired_count=repaired_count,
        results=results,
    )



@router.get(f"{settings.api_prefix}/chat/{{workspace_id}}/{{workflow_id}}", response_model=PublicChatTriggerInfoResponse)
async def get_public_chat_trigger_info(
    workspace_id: str,
    workflow_id: str,
    request: Request,
) -> PublicChatTriggerInfoResponse:
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if str(workflow.get("trigger_type") or "") != "chat":
        raise HTTPException(status_code=404, detail="Workflow is not a chat trigger")
    if workflow["status"] != "active":
        raise HTTPException(status_code=409, detail="Workflow is not active")

    runtime_definition, _ = resolve_runtime_definition_for_environment(
        workflow,
        environment="production",
        use_published_version=True,
    )
    trigger_config = get_trigger_step_config(runtime_definition)
    if not bool(trigger_config.get("chat_public")):
        raise HTTPException(status_code=403, detail="This chat trigger is not published for public access")

    workspace_settings = get_workspace_settings(workspace_id)
    if not bool(workspace_settings.get("allow_public_chat_triggers", True)):
        raise HTTPException(status_code=403, detail="Workspace policy blocks public chat triggers")

    base_url = build_public_base_url(request, workspace_id)
    chat_urls = build_public_chat_urls(
        base_url=base_url,
        workspace_id=workspace_id,
        workflow_id=workflow_id,
    )

    return PublicChatTriggerInfoResponse(
        workflow_id=workflow_id,
        workspace_id=workspace_id,
        mode=str(trigger_config.get("chat_mode") or "hosted"),
        authentication=str(trigger_config.get("chat_authentication") or "none"),
        response_mode=str(trigger_config.get("chat_response_mode") or "streaming"),
        load_previous_session=str(trigger_config.get("chat_load_previous_session") or "off"),
        title=str(trigger_config.get("chat_title") or "") or str(workflow.get("name") or "") or None,
        subtitle=str(trigger_config.get("chat_subtitle") or "") or None,
        input_placeholder=str(trigger_config.get("chat_input_placeholder") or "") or None,
        initial_messages=normalize_chat_initial_messages(trigger_config.get("chat_initial_messages")),
        require_button_click=bool(trigger_config.get("chat_require_button_click")),
        public_chat_url=chat_urls["public_chat_url"],
        public_chat_stream_url=chat_urls["public_chat_stream_url"],
        hosted_chat_url=chat_urls["hosted_chat_url"],
        widget_script_url=chat_urls["widget_script_url"],
        widget_embed_html=chat_urls["widget_embed_html"],
    )



@router.post(f"{settings.api_prefix}/chat/{{workspace_id}}/{{workflow_id}}/stream")
async def public_chat_trigger_stream(
    workspace_id: str,
    workflow_id: str,
    payload: ChatTriggerRequest,
    request: Request,
) -> StreamingResponse:
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    async def event_generator():
        try:
            response = await asyncio.to_thread(
                execute_chat_trigger_request,
                workflow=workflow,
                request=request,
                payload=payload,
                public=True,
            )
        except HTTPException as exc:
            message = exc.detail if isinstance(exc.detail, str) else "Chat trigger failed"
            yield _format_sse_event("error", {"message": message})
            return
        except Exception as exc:  # noqa: BLE001
            yield _format_sse_event("error", {"message": str(exc) or "Chat trigger failed"})
            return

        if response.response_mode != "streaming":
            yield _format_sse_event("done", response.model_dump())
            return

        for chunk in iter_chat_response_stream_chunks(response.message):
            if chunk:
                yield _format_sse_event("delta", {"delta": chunk})
                await asyncio.sleep(0.03)

        yield _format_sse_event("done", response.model_dump())

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )



@router.post(f"{settings.api_prefix}/chat/{{workspace_id}}/{{workflow_id}}", response_model=ChatTriggerResponse)
async def public_chat_trigger(
    workspace_id: str,
    workflow_id: str,
    payload: ChatTriggerRequest,
    request: Request,
) -> ChatTriggerResponse:
    workflow = get_workflow(workflow_id, workspace_id=workspace_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return execute_chat_trigger_request(
        workflow=workflow,
        request=request,
        payload=payload,
        public=True,
    )



@router.post(f"{settings.api_prefix}/triggers/webhook/{{workflow_id}}", response_model=ExecutionSummary)
async def trigger_workflow_webhook(workflow_id: str, request: Request) -> ExecutionSummary:
    workflow = get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if workflow["status"] != "active":
        raise HTTPException(status_code=409, detail="Workflow is not active")

    body = await request.body()
    workspace_settings = get_workspace_settings(str(workflow["workspace_id"]))
    if workspace_settings.get("require_webhook_signature"):
        signing_secret = workspace_settings.get("webhook_signing_secret")
        timestamp = request.headers.get("x-flowholt-timestamp", "")
        signature = request.headers.get("x-flowholt-signature", "")
        if not signing_secret or not verify_webhook_signature(
            secret=str(signing_secret),
            timestamp=timestamp,
            signature=signature,
            body=body,
            tolerance_seconds=settings.webhook_signature_tolerance_seconds,
        ):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            payload = {"body": payload}
    except Exception:  # noqa: BLE001
        payload = {"raw_body": body.decode("utf-8", errors="ignore")}

    payload.setdefault("_trigger_type", "webhook")
    payload.setdefault("_headers", dict(request.headers))
    payload.setdefault("_query", dict(request.query_params))
    event_key = extract_event_key(request, workflow_id)
    if event_key:
        existing_event = get_trigger_event_by_key(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            event_key=event_key,
        )
        if existing_event and existing_event.get("execution_id"):
            existing_execution = get_execution(str(existing_event["execution_id"]), workspace_id=str(workflow["workspace_id"]))
            if existing_execution is not None:
                record_audit_event(
                    session=None,
                    workspace_id=str(workflow["workspace_id"]),
                    action="workflow.webhook.deduplicated",
                    target_type="workflow",
                    target_id=str(workflow["id"]),
                    status="success",
                    details={"event_key": event_key, "execution_id": existing_execution["id"]},
                )
                return normalize_execution(existing_execution)
        elif existing_event:
            raise HTTPException(status_code=409, detail="Webhook event is already being processed")

        trigger_event = create_trigger_event(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            trigger_type="webhook",
            event_key=event_key,
            payload=payload,
        )
    else:
        trigger_event = None
    record_audit_event(
        session=None,
        workspace_id=str(workflow["workspace_id"]),
        action="workflow.webhook.received",
        target_type="workflow",
        target_id=str(workflow["id"]),
        status="success",
        details={"trigger_type": "webhook"},
    )

    execution = _execute_workflow(workflow, payload, trigger_type="webhook", environment="production", use_published_version=True)
    if trigger_event is not None:
        attach_trigger_event_execution(str(trigger_event["id"]), execution_id=execution.id)
    return execution



@router.post(f"{settings.api_prefix}/system/run-scheduled", response_model=ScheduledRunResponse)
def run_scheduled_workflows(request: Request) -> ScheduledRunResponse:
    if settings.scheduler_secret:
        scheduler_secret = request.headers.get("x-flowholt-scheduler-secret", "")
        if scheduler_secret != settings.scheduler_secret:
            raise HTTPException(status_code=401, detail="Invalid scheduler secret")

    scheduled_workflows = list_workflows_by_trigger(trigger_type="schedule", status="active")
    execution_ids: list[str] = []
    skipped_workflow_ids: list[str] = []
    now = datetime.now(UTC)

    for workflow in scheduled_workflows:
        trigger_step = next(
            (step for step in workflow["definition_json"].get("steps", []) if step.get("type") == "trigger"),
            None,
        )
        if trigger_step is None:
            skipped_workflow_ids.append(workflow["id"])
            continue
        if not is_workflow_due(workflow, now):
            skipped_workflow_ids.append(workflow["id"])
            continue

        event_key = f"sched-{workflow['id']}-{now.strftime('%Y-%m-%dT%H:%M')}"
        existing_event = get_trigger_event_by_key(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            event_key=event_key,
        )
        if existing_event is not None:
            skipped_workflow_ids.append(workflow["id"])
            continue

        payload = {
            "_trigger_type": "schedule",
            "_schedule": trigger_step.get("config", {}),
            "_scheduled_at": now.isoformat(),
            "message": f"Scheduled run for {workflow['name']}",
        }
        trigger_event = create_trigger_event(
            workspace_id=str(workflow["workspace_id"]),
            workflow_id=str(workflow["id"]),
            trigger_type="schedule",
            event_key=event_key,
            payload=payload,
        )

        execution = _execute_workflow(workflow, payload, trigger_type="schedule", environment="production", use_published_version=True)
        attach_trigger_event_execution(str(trigger_event["id"]), execution_id=execution.id)
        execution_ids.append(execution.id)
        record_audit_event(
            session=None,
            workspace_id=str(workflow["workspace_id"]),
            action="workflow.schedule.dispatched",
            target_type="workflow",
            target_id=str(workflow["id"]),
            status="success",
            details={"execution_id": execution.id, "trigger_type": "schedule"},
        )

    return ScheduledRunResponse(
        triggered_count=len(execution_ids),
        execution_ids=execution_ids,
        skipped_workflow_ids=skipped_workflow_ids,
    )



@router.post(f"{settings.api_prefix}/system/resume-paused", response_model=ResumePausedExecutionsResponse)
def resume_paused_executions(request: Request) -> ResumePausedExecutionsResponse:
    if settings.scheduler_secret:
        scheduler_secret = request.headers.get("x-flowholt-scheduler-secret", "")
        if scheduler_secret != settings.scheduler_secret:
            raise HTTPException(status_code=401, detail="Invalid scheduler secret")

    due_pauses = list_due_execution_pauses(limit=25)
    execution_ids: list[str] = []
    pause_ids: list[str] = []

    for pause in due_pauses:
        if str(pause.get("status")) != "paused":
            continue
        execution = _resume_paused_execution(
            pause,
            resume_payload={},
            resume_decision=None,
            session=None,
        )
        execution_ids.append(execution.id)
        pause_ids.append(str(pause["id"]))

    return ResumePausedExecutionsResponse(
        resumed_count=len(execution_ids),
        execution_ids=execution_ids,
        pause_ids=pause_ids,
    )



@router.post(f"{settings.api_prefix}/system/process-jobs", response_model=JobProcessResponse)
def process_workflow_jobs(request: Request) -> JobProcessResponse:
    if settings.scheduler_secret:
        scheduler_secret = request.headers.get("x-flowholt-scheduler-secret", "")
        if scheduler_secret != settings.scheduler_secret:
            raise HTTPException(status_code=401, detail="Invalid scheduler secret")

    claimed = claim_pending_workflow_jobs(limit=10, lease_seconds=settings.worker_lease_seconds)
    completed_count = 0
    failed_count = 0
    execution_ids: list[str] = []
    job_ids = [str(job["id"]) for job in claimed]

    for job in claimed:
        workflow = get_workflow(str(job["workflow_id"]))
        if workflow is None:
            fail_workflow_job(str(job["id"]), error_text="Workflow not found for queued job")
            record_audit_event(
                session=None,
                workspace_id=str(job["workspace_id"]),
                action="workflow.job.failed",
                target_type="workflow_job",
                target_id=str(job["id"]),
                status="failed",
                details={"reason": "Workflow not found for queued job"},
            )
            failed_count += 1
            continue

        runtime_definition = None
        runtime_version_id = None
        if job.get("workflow_version_id"):
            version = get_workflow_version(str(job["workflow_version_id"]), workspace_id=str(job["workspace_id"]))
            if version is not None:
                runtime_definition = version["definition_json"]
                runtime_version_id = str(version["id"])

        try:
            execution = _execute_workflow(
                workflow,
                job["payload_json"],
                trigger_type=str(job["trigger_type"]),
                environment=str(job.get("environment") or "draft"),
                initiated_by_user_id=str(job["initiated_by_user_id"]) if job.get("initiated_by_user_id") else None,
                runtime_definition_override=runtime_definition,
                runtime_version_id_override=runtime_version_id,
            )
            trigger_event_id = str(job["payload_json"].get("_trigger_event_id") or "") if isinstance(job.get("payload_json"), dict) else ""
            if trigger_event_id:
                attach_trigger_event_execution(trigger_event_id, execution_id=execution.id)
            complete_workflow_job(str(job["id"]), execution_id=execution.id)
            record_audit_event(
                session=None,
                workspace_id=str(job["workspace_id"]),
                action="workflow.job.completed",
                target_type="workflow_job",
                target_id=str(job["id"]),
                status="success",
                details={
                    "execution_id": execution.id,
                    "workflow_id": str(job["workflow_id"]),
                    "trigger_type": str(job["trigger_type"]),
                    "trigger_event_id": trigger_event_id or None,
                },
            )
            execution_ids.append(execution.id)
            completed_count += 1
        except Exception as exc:  # noqa: BLE001
            fail_workflow_job(str(job["id"]), error_text=str(exc))
            record_audit_event(
                session=None,
                workspace_id=str(job["workspace_id"]),
                action="workflow.job.failed",
                target_type="workflow_job",
                target_id=str(job["id"]),
                status="failed",
                details={
                    "workflow_id": str(job["workflow_id"]),
                    "trigger_type": str(job["trigger_type"]),
                    "error": str(exc),
                },
            )
            failed_count += 1

    return JobProcessResponse(
        claimed_count=len(claimed),
        completed_count=completed_count,
        failed_count=failed_count,
        execution_ids=execution_ids,
        job_ids=job_ids,
    )



@router.post(f"{settings.api_prefix}/system/prune-execution-artifacts", response_model=ExecutionArtifactPruneResponse)
def post_prune_execution_artifacts(
    request: Request,
    payload: ExecutionArtifactPruneRequest | None = None,
) -> ExecutionArtifactPruneResponse:
    if settings.scheduler_secret:
        scheduler_secret = request.headers.get("x-flowholt-scheduler-secret", "")
        if scheduler_secret != settings.scheduler_secret:
            raise HTTPException(status_code=401, detail="Invalid scheduler secret")
    retention_days = (
        payload.retention_days
        if payload is not None and payload.retention_days is not None
        else settings.execution_artifact_retention_days
    )
    deleted_count = prune_execution_artifacts(retention_days=retention_days)
    return ExecutionArtifactPruneResponse(
        deleted_count=deleted_count,
        retention_days=retention_days,
    )



@router.post(f"{settings.api_prefix}/webhooks/{{workspace_id}}/{{workflow_id}}")
async def webhook_receiver(
    workspace_id: str,
    workflow_id: str,
    request: Request,
) -> dict[str, Any]:
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    headers = {k.lower(): v for k, v in request.headers.items()}
    result = receive_webhook(
        workspace_id=workspace_id,
        workflow_id=workflow_id,
        payload=payload,
        headers=headers,
    )
    if result["status"] == "error":
        status_map = {
            "workflow_not_found": 404,
            "workflow_inactive": 409,
            "wrong_trigger": 400,
            "invalid_signature": 401,
        }
        raise HTTPException(
            status_code=status_map.get(result["code"], 400),
            detail=result["message"],
        )
    return result



@router.post(f"{settings.api_prefix}/webhooks/{{workspace_id}}")
async def workspace_webhook_receiver(
    workspace_id: str,
    request: Request,
) -> dict[str, Any]:
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    headers = {k.lower(): v for k, v in request.headers.items()}
    return receive_workspace_webhook(
        workspace_id=workspace_id,
        payload=payload,
        headers=headers,
    )



