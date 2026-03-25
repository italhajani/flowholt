from dataclasses import dataclass
import json
from typing import Any

import httpx

from app.core.config import settings
from app.schemas.workflow import WorkflowNode, WorkflowPayload, WorkflowRunLog


@dataclass
class ExecutionContext:
    node_outputs: dict[str, Any]
    previous_output: dict[str, Any]


@dataclass
class NodeExecutionResult:
    logs: list[WorkflowRunLog]
    output: dict[str, Any]


def _base_payload(node: WorkflowNode, sequence: int) -> dict[str, object]:
    return {
        "node_type": node.type,
        "sequence": sequence,
        "config_keys": sorted(node.config.keys()),
        "position": node.position or {},
    }


def _safe_json(value: Any) -> Any:
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    return value


def _call_groq(node: WorkflowNode, payload: WorkflowPayload, context: ExecutionContext) -> tuple[str, str]:
    prompt = node.config.get("instruction") or f"Complete the step named '{node.label}'."
    model = str(node.config.get("model") or settings.groq_model)
    original_prompt = payload.settings.get("originalPrompt") if isinstance(payload.settings, dict) else ""
    previous_output = json.dumps(context.previous_output, ensure_ascii=False)

    if not settings.groq_api_key:
        fallback = (
            f"Groq key is not configured in the engine, so {node.label} used a local placeholder response. "
            f"Original task: {str(original_prompt)[:160]}"
        )
        return fallback, "local-fallback"

    with httpx.Client(timeout=60) as client:
        response = client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "temperature": 0.2,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an execution agent inside FlowHolt. Complete the assigned workflow step clearly and concisely.",
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Workflow: {payload.workflow_name}\n"
                            f"Original task: {original_prompt}\n"
                            f"Current step: {node.label}\n"
                            f"Step instruction: {prompt}\n"
                            f"Previous step output: {previous_output}"
                        ),
                    },
                ],
            },
        )

    if response.status_code >= 400:
        raise RuntimeError(f"Groq request failed with {response.status_code}: {response.text[:200]}")

    data = response.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("Groq returned an empty response for the agent step.")

    return content.strip(), model


def handle_trigger(node: WorkflowNode, _: WorkflowPayload, sequence: int, __: ExecutionContext) -> NodeExecutionResult:
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


def handle_agent(
    node: WorkflowNode,
    payload: WorkflowPayload,
    sequence: int,
    context: ExecutionContext,
) -> NodeExecutionResult:
    content, model = _call_groq(node, payload, context)
    provider = "groq" if model != "local-fallback" else "local-fallback"
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
                message=f"Agent completed {node.label.lower()} using {provider}.",
                payload={
                    **_base_payload(node, sequence),
                    "provider": provider,
                    "model": model,
                },
            ),
        ],
        output={
            "text": content,
            "provider": provider,
            "model": model,
        },
    )


def handle_tool(
    node: WorkflowNode,
    _: WorkflowPayload,
    sequence: int,
    context: ExecutionContext,
) -> NodeExecutionResult:
    method = str(node.config.get("method") or "POST").upper()
    url = str(node.config.get("url") or "").strip()
    headers = node.config.get("headers") if isinstance(node.config.get("headers"), dict) else {}
    body = _safe_json(node.config.get("body", context.previous_output))

    if not url:
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
                    level="warn",
                    message=f"Tool step {node.label} has no URL configured yet.",
                    payload={
                        **_base_payload(node, sequence),
                        "method": method,
                    },
                ),
            ],
            output={"status": "not-configured", "method": method},
        )

    request_kwargs: dict[str, Any] = {
        "headers": headers,
        "timeout": 30,
        "follow_redirects": True,
    }

    if method != "GET":
        if isinstance(body, str):
            request_kwargs["content"] = body
        else:
            request_kwargs["json"] = body

    with httpx.Client() as client:
        response = client.request(method, url, **request_kwargs)

    if response.status_code >= 400:
        raise RuntimeError(f"Tool request failed with {response.status_code} for {url}")

    response_payload: Any
    try:
        response_payload = response.json()
    except ValueError:
        response_payload = response.text[:1200]

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
                message=f"Tool request completed for {node.label.lower()}.",
                payload={
                    **_base_payload(node, sequence),
                    "method": method,
                    "url": url,
                    "status_code": response.status_code,
                },
            ),
        ],
        output={
            "status_code": response.status_code,
            "url": url,
            "method": method,
            "response": response_payload,
        },
    )


def handle_condition(node: WorkflowNode, _: WorkflowPayload, sequence: int, context: ExecutionContext) -> NodeExecutionResult:
    branch = str(node.config.get("branch") or "default-continue")
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
                message=f"Condition defaulted to {branch} from {node.label.lower()}.",
                payload={
                    **_base_payload(node, sequence),
                    "branch": branch,
                    "previous_output_keys": sorted(context.previous_output.keys()),
                },
            ),
        ],
        output={"branch": branch},
    )


def handle_loop(node: WorkflowNode, _: WorkflowPayload, sequence: int, __: ExecutionContext) -> NodeExecutionResult:
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
        output={"iterations": int(node.config.get("iterations", 1) or 1)},
    )


def handle_memory(node: WorkflowNode, _: WorkflowPayload, sequence: int, __: ExecutionContext) -> NodeExecutionResult:
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


def handle_retriever(node: WorkflowNode, _: WorkflowPayload, sequence: int, __: ExecutionContext) -> NodeExecutionResult:
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


def handle_output(node: WorkflowNode, _: WorkflowPayload, sequence: int, context: ExecutionContext) -> NodeExecutionResult:
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
                payload={
                    **_base_payload(node, sequence),
                    "previous_output_keys": sorted(context.previous_output.keys()),
                },
            ),
        ],
        output={"finalized": True, "output_label": node.label, "result": context.previous_output},
    )


def handle_unknown(node: WorkflowNode, _: WorkflowPayload, sequence: int, __: ExecutionContext) -> NodeExecutionResult:
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


def execute_node(
    node: WorkflowNode,
    payload: WorkflowPayload,
    sequence: int,
    context: ExecutionContext,
) -> NodeExecutionResult:
    handler = NODE_HANDLERS.get(node.type, handle_unknown)
    return handler(node, payload, sequence, context)
