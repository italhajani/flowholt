from dataclasses import dataclass
import json
from typing import Any
from urllib.parse import urljoin, urlparse

import httpx

from app.core.config import settings
from app.schemas.workflow import WorkflowNode, WorkflowPayload, WorkflowRunLog
from app.services.value_mapping import resolve_templates


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


def _runtime_context(payload: WorkflowPayload, context: ExecutionContext) -> dict[str, Any]:
    settings = payload.settings if isinstance(payload.settings, dict) else {}
    original_prompt = settings.get("originalPrompt")
    trigger_payload = settings.get("runtime_trigger_payload")
    trigger_meta = settings.get("runtime_trigger_meta") if isinstance(settings.get("runtime_trigger_meta"), dict) else {}

    return {
        "workflow": {
            "id": payload.workflow_id,
            "name": payload.workflow_name,
            "original_prompt": original_prompt,
            "trigger_source": payload.trigger_source,
            "trigger_payload": trigger_payload,
            "trigger_meta": trigger_meta,
        },
        "trigger": {
            "payload": trigger_payload,
            "meta": trigger_meta,
        },
        "previous": context.previous_output,
        "nodes": context.node_outputs,
    }


def _resolved_config(node: WorkflowNode, payload: WorkflowPayload, context: ExecutionContext) -> dict[str, Any]:
    raw_config = node.config if isinstance(node.config, dict) else {}
    return resolve_templates(raw_config, _runtime_context(payload, context))


def _call_groq(node: WorkflowNode, payload: WorkflowPayload, context: ExecutionContext) -> tuple[str, str]:
    config = _resolved_config(node, payload, context)
    prompt = config.get("instruction") or f"Complete the step named '{node.label}'."
    model = str(config.get("model") or settings.groq_model)
    base_url = str(config.get("base_url") or "https://api.groq.com/openai/v1").rstrip("/")
    api_key = str(config.get("api_key") or settings.groq_api_key).strip()
    original_prompt = payload.settings.get("originalPrompt") if isinstance(payload.settings, dict) else ""
    previous_output = json.dumps(context.previous_output, ensure_ascii=False)

    if not api_key:
        fallback = (
            f"Groq key is not configured in the engine, so {node.label} used a local placeholder response. "
            f"Original task: {str(original_prompt)[:160]}"
        )
        return fallback, "local-fallback"

    with httpx.Client(timeout=60) as client:
        response = client.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
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


def _resolve_tool_url(base_url: str, url: str) -> str:
    clean_base = base_url.strip()
    clean_url = url.strip()

    if clean_url and urlparse(clean_url).scheme:
        return clean_url

    if clean_base and clean_url:
        return urljoin(f"{clean_base.rstrip('/')}/", clean_url.lstrip("/"))

    if clean_base:
        return clean_base

    return clean_url


def _coerce_number(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _evaluate_condition(config: dict[str, Any], value: Any) -> tuple[bool, str]:
    if config.get("exists") is True:
        matched = value not in (None, "")
        return matched, "exists"

    if config.get("is_empty") is True:
        matched = value in (None, "", [], {})
        return matched, "is_empty"

    if "equals" in config:
        matched = value == config.get("equals")
        return matched, "equals"

    if "not_equals" in config:
        matched = value != config.get("not_equals")
        return matched, "not_equals"

    if "contains" in config:
        matched = str(config.get("contains")) in str(value)
        return matched, "contains"

    if "starts_with" in config:
        matched = str(value).startswith(str(config.get("starts_with")))
        return matched, "starts_with"

    if "ends_with" in config:
        matched = str(value).endswith(str(config.get("ends_with")))
        return matched, "ends_with"

    if "greater_than" in config:
        left = _coerce_number(value)
        right = _coerce_number(config.get("greater_than"))
        matched = left is not None and right is not None and left > right
        return matched, "greater_than"

    if "less_than" in config:
        left = _coerce_number(value)
        right = _coerce_number(config.get("less_than"))
        matched = left is not None and right is not None and left < right
        return matched, "less_than"

    if isinstance(value, bool):
        return value, "boolean"

    return bool(value), "truthy"


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
    payload: WorkflowPayload,
    sequence: int,
    context: ExecutionContext,
) -> NodeExecutionResult:
    config = _resolved_config(node, payload, context)
    method = str(config.get("method") or config.get("default_method") or "POST").upper()
    raw_url = str(config.get("url") or "").strip()
    base_url = str(config.get("base_url") or "").strip()
    url = _resolve_tool_url(base_url, raw_url)
    headers = dict(config.get("headers")) if isinstance(config.get("headers"), dict) else {}
    bearer_token = str(config.get("bearer_token") or "").strip()
    body = _safe_json(config.get("body", context.previous_output))

    if bearer_token and "authorization" not in {key.lower() for key in headers}:
        headers["Authorization"] = f"Bearer {bearer_token}"

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


def handle_condition(node: WorkflowNode, payload: WorkflowPayload, sequence: int, context: ExecutionContext) -> NodeExecutionResult:
    config = _resolved_config(node, payload, context)
    value = config.get("value", context.previous_output)
    matched, operator = _evaluate_condition(config, value)
    branch_on_match = str(config.get("branch_on_match") or "true")
    branch_on_miss = str(config.get("branch_on_miss") or "false")
    branch = branch_on_match if matched else branch_on_miss

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
                message=f"Condition evaluated branch {branch} for {node.label.lower()}.",
                payload={
                    **_base_payload(node, sequence),
                    "branch": branch,
                    "value": value,
                    "matched": matched,
                    "operator": operator,
                },
            ),
        ],
        output={"branch": branch, "value": value, "matched": matched, "operator": operator},
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


def handle_output(node: WorkflowNode, payload: WorkflowPayload, sequence: int, context: ExecutionContext) -> NodeExecutionResult:
    config = _resolved_config(node, payload, context)
    result = config.get("result", context.previous_output)
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
        output={"finalized": True, "output_label": node.label, "result": result},
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


