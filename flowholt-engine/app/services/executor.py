from collections import deque
from datetime import datetime, timezone

from app.schemas.workflow import WorkflowPayload, WorkflowRunLog, WorkflowRunResult, WorkflowRunSummary
from app.services.node_handlers import ExecutionContext, execute_node


def _build_graph(payload: WorkflowPayload) -> tuple[dict[str, list[str]], dict[str, int]]:
    node_ids = [node.id for node in payload.nodes]
    adjacency: dict[str, list[str]] = {node_id: [] for node_id in node_ids}
    indegree = {node_id: 0 for node_id in node_ids}

    for edge in payload.edges:
        if edge.source in adjacency and edge.target in indegree:
            adjacency[edge.source].append(edge.target)
            indegree[edge.target] += 1

    return adjacency, indegree


def _root_node_ids(payload: WorkflowPayload, indegree: dict[str, int]) -> list[str]:
    roots = [node.id for node in payload.nodes if indegree.get(node.id, 0) == 0]
    if roots:
        return roots
    return [payload.nodes[0].id] if payload.nodes else []


def _choose_next_targets(node_type: str, node_id: str, result_output: dict[str, object], adjacency: dict[str, list[str]]) -> list[str]:
    outgoing = adjacency.get(node_id, [])
    if node_type != "condition" or len(outgoing) <= 1:
        return outgoing

    branch = str(result_output.get("branch") or "default-continue").strip().lower()

    for target in outgoing:
        if target.lower() == branch:
            return [target]

    if branch in {"true", "yes", "continue", "default-continue", "pass"}:
        return outgoing[:1]

    if branch in {"false", "no", "fail", "stop"}:
        return outgoing[1:2] or outgoing[:1]

    return outgoing[:1]


def run_workflow(payload: WorkflowPayload) -> WorkflowRunResult:
    started_at = datetime.now(timezone.utc)
    node_map = {node.id: node for node in payload.nodes}
    adjacency, indegree = _build_graph(payload)
    queue = deque(_root_node_ids(payload, indegree))

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
    context = ExecutionContext(node_outputs={}, previous_output={})
    visited: set[str] = set()
    sequence = 1

    while queue or len(visited) < len(payload.nodes):
        if not queue:
            for node in payload.nodes:
                if node.id not in visited:
                    queue.append(node.id)
                    break

        node_id = queue.popleft()
        if node_id in visited:
            continue

        node = node_map[node_id]
        result = execute_node(node, payload, sequence, context)
        visited.add(node.id)
        executed_nodes.append(node.id)
        logs.extend(result.logs)
        node_outputs[node.id] = result.output
        context.node_outputs = node_outputs
        context.previous_output = result.output
        sequence += 1

        next_targets = _choose_next_targets(node.type, node.id, result.output, adjacency)
        if node.type == "condition" and next_targets:
            logs.append(
                WorkflowRunLog(
                    node_id=node.id,
                    level="info",
                    message=f"Condition routed the flow to {', '.join(next_targets)}.",
                    payload={
                        "branch": result.output.get("branch", "default-continue"),
                        "targets": next_targets,
                    },
                )
            )

        for target in next_targets:
            if target not in visited:
                queue.append(target)

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
