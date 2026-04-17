"""
Misc router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403

router = APIRouter()

@router.get(f"{settings.api_prefix}/templates", response_model=list[TemplateSummary])
def get_templates(session: dict[str, Any] = Depends(get_session_context)) -> list[TemplateSummary]:
    return [
        TemplateSummary.model_validate(item)
        for item in list_templates(workspace_id=str(session["workspace"]["id"]))
    ]



@router.get(f"{settings.api_prefix}/notifications", response_model=NotificationListResponse)
def list_notifications(
    session: dict[str, Any] = Depends(get_session_context),
) -> NotificationListResponse:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    items = list_user_notifications(user_id=user_id, workspace_id=workspace_id)
    unread = sum(1 for n in items if not n.get("read"))
    return NotificationListResponse(
        items=[NotificationItem.model_validate(n) for n in items],
        unread_count=unread,
    )



@router.post(f"{settings.api_prefix}/notifications", response_model=NotificationItem, status_code=201)
def create_notification(
    payload: NotificationCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> NotificationItem:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    item = create_user_notification(
        user_id=user_id,
        workspace_id=workspace_id,
        title=payload.title,
        body=payload.body,
        kind=payload.kind,
        link=payload.link,
    )
    return NotificationItem.model_validate(item)



@router.patch(f"{settings.api_prefix}/notifications/{{notification_id}}/read")
def mark_notification_read(
    notification_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    mark_notification_as_read(notification_id, user_id=user_id, workspace_id=workspace_id)
    return Response(status_code=204)



@router.post(f"{settings.api_prefix}/notifications/read-all")
def mark_all_notifications_read(
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    workspace_id = str(session["workspace"]["id"])
    user_id = str(session["user"]["id"])
    mark_all_notifications_read_for_user(user_id=user_id, workspace_id=workspace_id)
    return Response(status_code=204)



@router.get(f"{settings.api_prefix}/templates/{{template_id}}", response_model=TemplateDetail)
def get_template_detail(template_id: str, session: dict[str, Any] = Depends(get_session_context)) -> TemplateDetail:
    template = get_template(template_id, workspace_id=str(session["workspace"]["id"]))
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateDetail.model_validate(template)



@router.delete(f"{settings.api_prefix}/templates/{{template_id}}")
def delete_template_endpoint(template_id: str, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    deleted = delete_template(template_id, workspace_id=workspace_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Template not found")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="template.delete",
        target_type="template",
        target_id=template_id,
        status="success",
    )
    return {"deleted": True}



@router.get(f"{settings.api_prefix}/jobs", response_model=list[WorkflowJobSummary])
def get_jobs(session: dict[str, Any] = Depends(get_session_context)) -> list[WorkflowJobSummary]:
    return [
        WorkflowJobSummary.model_validate(item)
        for item in list_workflow_jobs(str(session["workspace"]["id"]))
    ]



@router.post(f"{settings.api_prefix}/jobs/{{job_id}}/cancel", response_model=WorkflowJobSummary)
def cancel_job(
    job_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> WorkflowJobSummary:
    require_workspace_role(session, "owner", "admin", "builder")
    workspace_id = str(session["workspace"]["id"])
    job = get_workflow_job(job_id, workspace_id=workspace_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.get("status")) not in {"pending", "failed"}:
        raise HTTPException(status_code=409, detail="Only pending or failed jobs can be cancelled")

    cancelled = cancel_workflow_job(job_id, workspace_id=workspace_id)
    if cancelled is None:
        raise HTTPException(status_code=404, detail="Job not found")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="workflow.job.cancelled",
        target_type="workflow_job",
        target_id=job_id,
        status="success",
        details={"workflow_id": cancelled["workflow_id"]},
    )
    return WorkflowJobSummary.model_validate(cancelled)



