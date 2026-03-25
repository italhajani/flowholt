from app.schemas.workflow import WorkflowPayload


def summarize_workflow(payload: WorkflowPayload) -> dict[str, object]:
    return {
        "workflow_id": payload.workflow_id,
        "node_count": len(payload.nodes),
        "edge_count": len(payload.edges),
        "status": "queued",
    }
