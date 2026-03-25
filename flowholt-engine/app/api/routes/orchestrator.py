from fastapi import APIRouter

from app.schemas.workflow import WorkflowPayload, WorkflowRunResult
from app.services.executor import run_workflow

router = APIRouter(tags=["runs"])


@router.post("/run", response_model=WorkflowRunResult)
def run_workflow_route(payload: WorkflowPayload) -> WorkflowRunResult:
    return run_workflow(payload)
