from dataclasses import dataclass

from app.schemas.workflow import WorkflowNode, WorkflowPayload, WorkflowRunLog


@dataclass
class NodeExecutionResult:
    logs: list[WorkflowRunLog]
    output: dict[str, object]


def _base_payload(node: WorkflowNode, sequence: int) -> dict[str, object]:
    return {
        "node_type": node.type,
        "sequence": sequence,
        "config_keys": sorted(node.config.keys()),
        "position": node.position or {},
    }


def handle_trigger(node: WorkflowNode, _: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="info",
                message=f"Running step {sequence}: {node.label}",
                payload=_base_payload(node, sequence),
            ),
            WorkflowRunLog(
                node_id=node.id,
                level="debug",
                message=f"Trigger is ready for {node.label.lower()}.",
                payload={
                    **_base_payload(node, sequence),
                    "mode": node.config.get("mode", "manual"),
                },
            ),
        ],
        output={"started": True, "trigger_label": node.label},
    )


def handle_agent(node: WorkflowNode, payload: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    prompt = payload.settings.get("originalPrompt") if isinstance(payload.settings, dict) else None
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="info",
                message=f"Running step {sequence}: {node.label}",
                payload=_base_payload(node, sequence),
            ),
            WorkflowRunLog(
                node_id=node.id,
                level="debug",
                message=f"Agent planned work for {node.label.lower()}.",
                payload={
                    **_base_payload(node, sequence),
                    "prompt_excerpt": str(prompt)[:140] if prompt else "",
                },
            ),
        ],
        output={"agent_label": node.label, "status": "prepared"},
    )


def handle_tool(node: WorkflowNode, _: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    tool_target = node.config.get("target", "integration-placeholder")
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="info",
                message=f"Running step {sequence}: {node.label}",
                payload=_base_payload(node, sequence),
            ),
            WorkflowRunLog(
                node_id=node.id,
                level="debug",
                message=f"Tool step mapped to {tool_target}.",
                payload={
                    **_base_payload(node, sequence),
                    "target": tool_target,
                },
            ),
        ],
        output={"tool_label": node.label, "target": tool_target},
    )


def handle_condition(node: WorkflowNode, _: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="info",
                message=f"Running step {sequence}: {node.label}",
                payload=_base_payload(node, sequence),
            ),
            WorkflowRunLog(
                node_id=node.id,
                level="debug",
                message=f"Condition defaulted to continue from {node.label.lower()}.",
                payload={
                    **_base_payload(node, sequence),
                    "branch": "default-continue",
                },
            ),
        ],
        output={"branch": "default-continue"},
    )


def handle_loop(node: WorkflowNode, _: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="info",
                message=f"Running step {sequence}: {node.label}",
                payload=_base_payload(node, sequence),
            ),
            WorkflowRunLog(
                node_id=node.id,
                level="debug",
                message=f"Loop placeholder completed one pass for {node.label.lower()}.",
                payload=_base_payload(node, sequence),
            ),
        ],
        output={"iterations": 1},
    )


def handle_memory(node: WorkflowNode, _: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="info",
                message=f"Running step {sequence}: {node.label}",
                payload=_base_payload(node, sequence),
            ),
            WorkflowRunLog(
                node_id=node.id,
                level="debug",
                message=f"Loaded saved context for {node.label.lower()}.",
                payload=_base_payload(node, sequence),
            ),
        ],
        output={"memory_loaded": True},
    )


def handle_retriever(node: WorkflowNode, _: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="info",
                message=f"Running step {sequence}: {node.label}",
                payload=_base_payload(node, sequence),
            ),
            WorkflowRunLog(
                node_id=node.id,
                level="debug",
                message=f"Retriever prepared supporting knowledge for {node.label.lower()}.",
                payload=_base_payload(node, sequence),
            ),
        ],
        output={"documents_found": 0},
    )


def handle_output(node: WorkflowNode, _: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="info",
                message=f"Running step {sequence}: {node.label}",
                payload=_base_payload(node, sequence),
            ),
            WorkflowRunLog(
                node_id=node.id,
                level="debug",
                message=f"Finalized the result in {node.label.lower()}.",
                payload=_base_payload(node, sequence),
            ),
        ],
        output={"finalized": True, "output_label": node.label},
    )


def handle_unknown(node: WorkflowNode, _: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    return NodeExecutionResult(
        logs=[
            WorkflowRunLog(
                node_id=node.id,
                level="warn",
                message=f"Step {sequence} uses an unsupported type and was treated as a placeholder.",
                payload=_base_payload(node, sequence),
            )
        ],
        output={"status": "placeholder"},
    )


NODE_HANDLERS = {
    "trigger": handle_trigger,
    "agent": handle_agent,
    "tool": handle_tool,
    "condition": handle_condition,
    "loop": handle_loop,
    "memory": handle_memory,
    "retriever": handle_retriever,
    "output": handle_output,
}


def execute_node(node: WorkflowNode, payload: WorkflowPayload, sequence: int) -> NodeExecutionResult:
    handler = NODE_HANDLERS.get(node.type, handle_unknown)
    return handler(node, payload, sequence)
