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
    settings_dict = payload.settings if isinstance(payload.settings, dict) else {}
    original_prompt = settings_dict.get("originalPrompt")
    trigger_payload = settings_dict.get("runtime_trigger_payload")
    trigger_meta = settings_dict.get("runtime_trigger_meta") if isinstance(settings_dict.get("runtime_trigger_meta"), dict) else {}

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


def _resolve_groq_model(config: dict[str, Any]) -> str:
    requested_model = str(config.get("model") or "").strip()
    configured_default = str(settings.groq_model or "").strip()

    for candidate in [requested_model, configured_default, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]:
        normalized = str(candidate or "").strip()
        if normalized and normalized.lower() not in {"default", "workspace-default", "use-workspace-default"}:
            return normalized

    return "llama-3.3-70b-versatile"


def _is_model_not_found(response: httpx.Response) -> bool:
    if response.status_code != 404:
        return False

    try:
        error_payload = response.json().get("error", {})
    except ValueError:
        return False

    return str(error_payload.get("code") or "").strip().lower() == "model_not_found"


def _call_groq(node: WorkflowNode, payload: WorkflowPayload, context: ExecutionContext) -> tuple[str, str]:
    config = _resolved_config(node, payload, context)
    prompt = config.get("instruction") or f"Complete the step named '{node.label}'."
    requested_model = str(config.get("model") or "").strip()
    resolved_model = _resolve_groq_model(config)
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

    model_candidates: list[str] = []
    for candidate in [requested_model, resolved_model, str(settings.groq_model or "").strip(), "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]:
        normalized = str(candidate or "").strip()
        if normalized and normalized.lower() not in {"default", "workspace-default", "use-workspace-default"} and normalized not in model_candidates:
            model_candidates.append(normalized)

    last_response: httpx.Response | None = None
    with httpx.Client(timeout=60) as client:
        for candidate_model in model_candidates:
            response = client.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": candidate_model,
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
            last_response = response

            if _is_model_not_found(response) and candidate_model != model_candidates[-1]:
                continue

            if response.status_code >= 400:
                raise RuntimeError(f"Groq request failed with {response.status_code}: {response.text[:200]}")

            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content")
            if not isinstance(content, str) or not content.strip():
                raise RuntimeError("Groq returned an empty response for the agent step.")

            return content.strip(), candidate_model

    if last_response is not None:
        raise RuntimeError(f"Groq request failed with {last_response.status_code}: {last_response.text[:200]}")

    raise RuntimeError("No Groq model candidates were available for this agent step.")


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


def _tool_result_contract_kind(capability: str) -> str:
    if capability == "knowledge_lookup":
        return "document_matches"
    if capability == "crm_writeback":
        return "record_sync"
    if capability == "spreadsheet_row":
        return "sheet_write"
    if capability == "webhook_reply":
        return "callback_ack"
    return "raw_response"


def _tool_result_orchestration_hint(capability: str) -> str:
    if capability == "knowledge_lookup":
        return "Use the matched items before a later reasoning or writeback step."
    if capability == "crm_writeback":
        return "Use after reasoning is done and the workflow is ready to sync a final business record."
    if capability == "spreadsheet_row":
        return "Good for operational logging or fan-out reporting after the main decision step."
    if capability == "webhook_reply":
        return "Use near the end of the workflow to send a final callback or acknowledgement."
    return "Use for flexible API calls when later steps need the raw response."


def _tool_items_from_payload(response_payload: Any) -> list[dict[str, Any]]:
    if isinstance(response_payload, list):
        return [item for item in response_payload if isinstance(item, dict)]

    if isinstance(response_payload, dict):
        items: list[dict[str, Any]] = []
        for key in ["documents", "matches", "items", "results", "rows"]:
            value = response_payload.get(key)
            if isinstance(value, list):
                items.extend(item for item in value if isinstance(item, dict))
        return items

    return []


def _first_non_empty_text(*values: Any) -> str:
    for value in values:
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def _tool_preview(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()[:180]

    try:
        return json.dumps(value, ensure_ascii=False)[:180]
    except TypeError:
        return str(value)[:180]


def _normalize_tool_response(
    *,
    tool_key: str,
    capability: str,
    method: str,
    url: str,
    status_code: int,
    response_payload: Any,
    connection_label: str,
) -> dict[str, Any]:
    payload_record = response_payload if isinstance(response_payload, dict) else {}
    items = _tool_items_from_payload(response_payload)
    success = 200 <= status_code < 400
    contract_kind = _tool_result_contract_kind(capability)
    orchestration_hint = _tool_result_orchestration_hint(capability)

    if capability == "knowledge_lookup":
        first_item = items[0] if items else {}
        result_text = _first_non_empty_text(
            first_item.get("title") if isinstance(first_item, dict) else None,
            first_item.get("name") if isinstance(first_item, dict) else None,
            first_item.get("summary") if isinstance(first_item, dict) else None,
            first_item.get("snippet") if isinstance(first_item, dict) else None,
        ) or ("Knowledge matches found." if items else "Knowledge search completed.")
        result = {
            "top_match": first_item,
            "source_count": len(items),
        }
    elif capability == "crm_writeback":
        result_text = _first_non_empty_text(
            payload_record.get("message") if isinstance(payload_record, dict) else None,
            payload_record.get("status") if isinstance(payload_record, dict) else None,
            payload_record.get("result") if isinstance(payload_record, dict) else None,
        ) or "CRM writeback completed."
        nested_data = payload_record.get("data") if isinstance(payload_record.get("data"), dict) else {}
        result = {
            "record_id": _first_non_empty_text(
                payload_record.get("record_id"),
                payload_record.get("id"),
                nested_data.get("id") if isinstance(nested_data, dict) else None,
            ),
            "sync_status": _first_non_empty_text(payload_record.get("status"), payload_record.get("result")) or "synced",
        }
    elif capability == "spreadsheet_row":
        result_text = _first_non_empty_text(payload_record.get("message"), payload_record.get("status")) or "Spreadsheet row written."
        nested_data = payload_record.get("data") if isinstance(payload_record.get("data"), dict) else {}
        result = {
            "row_id": _first_non_empty_text(payload_record.get("row_id"), payload_record.get("id")),
            "sheet": _first_non_empty_text(payload_record.get("sheet"), nested_data.get("sheet") if isinstance(nested_data, dict) else None),
            "write_status": _first_non_empty_text(payload_record.get("status")) or "written",
        }
    elif capability == "webhook_reply":
        result_text = _first_non_empty_text(payload_record.get("message"), payload_record.get("status")) or "Webhook reply delivered."
        result = {
            "delivery_status": _first_non_empty_text(payload_record.get("status")) or "sent",
        }
    else:
        result_text = _first_non_empty_text(payload_record.get("message"), payload_record.get("status"), payload_record.get("result")) or f"HTTP {status_code} response received."
        result = payload_record if isinstance(payload_record, dict) else {}

    return {
        "success": success,
        "result_text": result_text,
        "result": result,
        "items": items,
        "result_contract": {
            "kind": contract_kind,
            "success": success,
            "item_count": len(items),
            "primary_text": result_text,
            "preview": _tool_preview(response_payload),
            "orchestration_hint": orchestration_hint,
            "connection_label": connection_label,
            "tool_key": tool_key,
            "capability": capability,
        },
    }


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
    config = _resolved_config(node, payload, context)
    content, model = _call_groq(node, payload, context)
    provider = "groq" if model != "local-fallback" else "local-fallback"
    tool_access_mode = str(config.get("tool_access_mode") or "workspace_default").strip() or "workspace_default"
    tool_call_strategy = str(config.get("tool_call_strategy") or "workspace_default").strip() or "workspace_default"
    allowed_tool_keys = [str(item).strip() for item in config.get("allowed_tool_keys", []) if str(item).strip()] if isinstance(config.get("allowed_tool_keys"), list) else []
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
                    "tool_access_mode": tool_access_mode,
                    "tool_call_strategy": tool_call_strategy,
                    "allowed_tool_keys": allowed_tool_keys,
                },
            ),
        ],
        output={
            "text": content,
            "provider": provider,
            "model": model,
            "tool_access_mode": tool_access_mode,
            "tool_call_strategy": tool_call_strategy,
            "allowed_tool_keys": allowed_tool_keys,
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
    api_key = str(config.get("api_key") or "").strip()
    api_key_header = str(config.get("api_key_header") or "x-api-key").strip()
    tool_key = str(config.get("tool_key") or "http-request").strip()
    capability = str(config.get("capability") or "http_request").strip()
    connection_label = str(config.get("connection_label") or "").strip()
    body = _safe_json(config.get("body", context.previous_output))

    if bearer_token and "authorization" not in {key.lower() for key in headers}:
        headers["Authorization"] = f"Bearer {bearer_token}"

    if api_key and api_key_header and api_key_header.lower() not in {key.lower() for key in headers}:
        headers[api_key_header] = api_key

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
            output={"status": "not-configured", "method": method, "tool_key": tool_key, "capability": capability},
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
                    "tool_key": tool_key,
                    "capability": capability,
                    "connection_label": connection_label,
                },
            ),
        ],
        output={
            "status_code": response.status_code,
            "url": url,
            "method": method,
            "response": response_payload,
            "tool_key": tool_key,
            "capability": capability,
            "connection_label": connection_label,
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




