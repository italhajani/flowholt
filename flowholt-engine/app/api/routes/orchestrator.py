from fastapi import APIRouter

from app.schemas.workflow import WorkflowPayload
from app.services.executor import summarize_workflow

router = APIRouter(tags=["orchestrator"])


@router.post("/run")
def run_workflow(payload: WorkflowPayload) -> dict[str, object]:
    return {
        "message": "Workflow accepted by FlowHolt engine.",
        "summary": summarize_workflow(payload),
    }
