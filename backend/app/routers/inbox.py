"""
Inbox router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403
from ..helpers import _resume_paused_execution, _cancel_paused_execution  # noqa: F401

router = APIRouter()

@router.get(f"{settings.api_prefix}/inbox/tasks", response_model=list[HumanTaskSummary])
def get_inbox_tasks(
    mine: bool = False,
    status: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[HumanTaskSummary]:
    assigned_to_user_id = str(session["user"]["id"]) if mine else None
    return [
        HumanTaskSummary.model_validate(item)
        for item in list_human_tasks(
            str(session["workspace"]["id"]),
            status=status,
            assigned_to_user_id=assigned_to_user_id,
        )
    ]



@router.get(f"{settings.api_prefix}/inbox/tasks/{{task_id}}", response_model=HumanTaskSummary)
def get_inbox_task_detail(
    task_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> HumanTaskSummary:
    task = get_human_task(task_id, workspace_id=str(session["workspace"]["id"]))
    if task is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    return HumanTaskSummary.model_validate(task)



@router.post(f"{settings.api_prefix}/inbox/tasks/{{task_id}}/complete", response_model=ExecutionSummary)
def complete_inbox_task(
    task_id: str,
    payload: HumanTaskCompleteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    task = get_human_task(task_id, workspace_id=str(session["workspace"]["id"]))
    if task is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    if str(task.get("status")) != "open":
        raise HTTPException(status_code=409, detail="Task is not open")
    ensure_task_actor_allowed(task, session)

    completed = complete_human_task(
        task_id,
        decision=payload.decision,
        comment=payload.comment,
        response_payload=payload.payload,
    )
    if completed is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    pause = get_execution_pause(str(task["execution_id"]), workspace_id=str(session["workspace"]["id"]))
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=409, detail="The related execution is no longer paused")
    record_execution_event(
        execution_id=str(task["execution_id"]),
        workflow_id=str(task["workflow_id"]),
        workspace_id=str(session["workspace"]["id"]),
        event_type="human_task.completed",
        step_id=str(task["step_id"]),
        step_name=str(task["step_name"]),
        status="completed",
        message=f"Human task completed for {task['step_name']}",
        data={"task_id": task_id, "decision": payload.decision, "comment": payload.comment, "payload": payload.payload},
    )

    execution = _resume_paused_execution(
        pause,
        resume_payload=payload.payload,
        resume_decision=payload.decision,
        session=session,
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="human_task.completed",
        target_type="human_task",
        target_id=task_id,
        status="success",
        details={"decision": payload.decision, "execution_id": task["execution_id"]},
    )
    return execution



@router.post(f"{settings.api_prefix}/inbox/tasks/{{task_id}}/cancel", response_model=ExecutionSummary)
def cancel_inbox_task(
    task_id: str,
    payload: HumanTaskCancelRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> ExecutionSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    task = get_human_task(task_id, workspace_id=str(session["workspace"]["id"]))
    if task is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    if str(task.get("status")) != "open":
        raise HTTPException(status_code=409, detail="Task is not open")
    ensure_task_actor_allowed(task, session)
    cancelled = cancel_human_task(task_id, comment=payload.comment)
    if cancelled is None:
        raise HTTPException(status_code=404, detail="Human task not found")
    pause = get_execution_pause(str(task["execution_id"]), workspace_id=str(session["workspace"]["id"]))
    if pause is None or str(pause.get("status")) != "paused":
        raise HTTPException(status_code=409, detail="The related execution is no longer paused")
    record_execution_event(
        execution_id=str(task["execution_id"]),
        workflow_id=str(task["workflow_id"]),
        workspace_id=str(session["workspace"]["id"]),
        event_type="human_task.cancelled",
        step_id=str(task["step_id"]),
        step_name=str(task["step_name"]),
        status="cancelled",
        message=f"Human task cancelled for {task['step_name']}",
        data={"task_id": task_id, "comment": payload.comment},
    )
    execution = _cancel_paused_execution(pause, session=session)
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="human_task.cancelled",
        target_type="human_task",
        target_id=task_id,
        status="success",
        details={"execution_id": task["execution_id"]},
    )
    return execution



