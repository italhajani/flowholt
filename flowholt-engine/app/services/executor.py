from collections import deque
from datetime import datetime, timezone

from app.schemas.workflow import WorkflowPayload, WorkflowRunLog, WorkflowRunResult, WorkflowRunSummary
from app.services.node_handlers import execute_node


def _ordered_node_ids(payload: WorkflowPayload) -> list[str]:
    node_ids = [node.id for node in payload.nodes]
    indegree = {node_id: 0 for node_id in node_ids}
    adjacency: dict[str, list[str]] = {node_id: [] for node_id in node_ids}

    for edge in payload.edges:
        if edge.source in adjacency and edge.target in indegree:
            adjacency[edge.source].append(edge.target)
            indegree[edge.target] += 1

    queue = deque(node_id for node_id in node_ids if indegree[node_id] == 0)
    ordered: list[str] = []

    while queue:
        node_id = queue.popleft()
        ordered.append(node_id)
        for next_node in adjacency[node_id]:
            indegree[next_node] -= 1
            if indegree[next_node] == 0:
                queue.append(next_node)

    for node_id in node_ids:
        if node_id not in ordered:
            ordered.append(node_id)

    return ordered


def run_workflow(payload: WorkflowPayload) -> WorkflowRunResult:
    started_at = datetime.now(timezone.utc)
    node_map = {node.id: node for node in payload.nodes}
    ordered_node_ids = _ordered_node_ids(payload)

    logs: list[WorkflowRunLog] = [
        WorkflowRunLog(
            message="Workflow accepted by FlowHolt engine.",
            payload={
                "workflow_id": payload.workflow_id,
                "run_id": payload.run_id,
                "workflow_name": payload.workflow_name,
                "node_count": len(payload.nodes),
                "edge_count": len(payload.edges),
            },
        )
    ]

    executed_nodes: list[str] = []
    node_outputs: dict[str, object] = {}

    for index, node_id in enumerate(ordered_node_ids, start=1):
        node = node_map[node_id]
        result = execute_node(node, payload, index)
        executed_nodes.append(node.id)
        logs.extend(result.logs)
        node_outputs[node.id] = result.output

    finished_at = datetime.now(timezone.utc)
    summary = WorkflowRunSummary(
        workflow_id=payload.workflow_id,
        run_id=payload.run_id,
        workflow_name=payload.workflow_name,
        node_count=len(payload.nodes),
        edge_count=len(payload.edges),
        executed_nodes=executed_nodes,
        trigger_source=payload.trigger_source,
    )

    output = {
        "summary_text": f"{payload.workflow_name} completed {len(executed_nodes)} steps.",
        "executed_nodes": executed_nodes,
        "last_node_id": executed_nodes[-1] if executed_nodes else None,
        "trigger_source": payload.trigger_source,
        "node_outputs": node_outputs,
    }

    return WorkflowRunResult(
        status="succeeded",
        started_at=started_at,
        finished_at=finished_at,
        summary=summary,
        output=output,
        logs=logs,
    )
