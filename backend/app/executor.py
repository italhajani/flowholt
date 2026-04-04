from __future__ import annotations

import re
import time
from datetime import UTC, datetime, timedelta
from string import Template
from typing import Any

import httpx

from .config import get_settings
from .integration_registry import execute_integration_operation, normalize_integration_config


VAULT_TOKEN_PATTERN = re.compile(r"\{\{\s*vault\.(variable|credential|connection)\.([A-Za-z0-9_\- ]+?)(?:\.([A-Za-z0-9_\-]+))?\s*\}\}")


def execute_workflow_definition(
    definition: dict[str, Any],
    payload: dict[str, Any],
    vault_context: dict[str, dict[str, Any]] | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    outcome = run_workflow_definition(definition, payload, vault_context=vault_context)
    if outcome["status"] != "completed":
        raise RuntimeError("Workflow paused before completion.")
    return outcome["step_results"], outcome["result"]


def run_workflow_definition(
    definition: dict[str, Any],
    payload: dict[str, Any],
    *,
    vault_context: dict[str, dict[str, Any]] | None = None,
    state: dict[str, Any] | None = None,
    resume_payload: dict[str, Any] | None = None,
    resume_decision: str | None = None,
) -> dict[str, Any]:
    context: dict[str, Any] = dict((state or {}).get("context") or {"payload": payload})
    context.setdefault("payload", payload)
    step_results: list[dict[str, Any]] = list((state or {}).get("step_results") or [])
    steps = definition.get("steps", [])
    edges = definition.get("edges", [])
    step_lookup = {step["id"]: step for step in steps}
    outgoing: dict[str, list[dict[str, Any]]] = {}
    incoming: dict[str, list[dict[str, Any]]] = {}

    for edge in edges:
        outgoing.setdefault(edge["source"], []).append(edge)
        incoming.setdefault(edge["target"], []).append(edge)

    if steps and not edges:
        for index in range(len(steps) - 1):
            edge = {"source": steps[index]["id"], "target": steps[index + 1]["id"], "label": None}
            outgoing.setdefault(edge["source"], []).append(edge)
            incoming.setdefault(edge["target"], []).append(edge)

    if state and state.get("next_step_id"):
        current_step = step_lookup.get(str(state["next_step_id"]))
    else:
        current_step = next((step for step in steps if not incoming.get(step["id"])), steps[0] if steps else None)

    visited: set[str] = set((state or {}).get("visited") or [])
    pending_label = str((state or {}).get("pending_label") or "") or None
    if resume_decision:
        pending_label = resume_decision.lower()
        context["human_decision"] = pending_label
    if resume_payload:
        context.setdefault("resume_payload", {}).update(resume_payload)
        context.update(resume_payload)

    while current_step is not None:
        step = current_step
        if step["id"] in visited:
            break
        visited.add(step["id"])
        started = time.perf_counter()
        output: dict[str, Any] | None = None
        status = "success"
        next_label: str | None = pending_label
        pending_label = None

        try:
            step_type = step["type"]
            config = _resolve_runtime_value(step.get("config", {}), vault_context or {})
            config = _enrich_config_with_bindings(step_type, config, vault_context or {})
            config = normalize_integration_config(step_type, config)

            if step_type == "trigger":
                output = execute_integration_operation(step_type, config, payload=payload, context=context) or {"received": True}
            elif step_type == "transform":
                output = {"message": _render_template(config.get("template", ""), payload)}
                context.update(output)
            elif step_type == "condition":
                field = config.get("field", "")
                expected = config.get("equals")
                actual = payload.get(field) or context.get(field)
                matched = actual == expected
                output = {"matched": matched, "priority": actual}
                next_label = "true" if matched else "false"
                context.update(output)
            elif step_type == "llm":
                prompt = config.get("prompt", "Summarize the payload")
                llm_text = _run_llm(prompt=prompt, payload=payload)
                output = execute_integration_operation(step_type, config, payload=payload, context=context, llm_text=llm_text) or {"text": llm_text}
                priority = "high" if str(output.get("text") or "").lower().find("urgent") != -1 or str(output.get("text") or "").lower().find("high") != -1 else "normal"
                output["priority"] = priority
                context.update(output)
            elif step_type == "output":
                output = execute_integration_operation(step_type, config, payload=payload, context=context) or {
                    "channel": config.get("channel", "default"),
                    "message": context.get("message") or context.get("text") or "Workflow completed",
                }
                if config.get("webhook_url"):
                    output["webhook_url"] = config.get("webhook_url")
            elif step_type == "delay":
                resume_after = _compute_resume_after(config)
                output = {"wait_type": "delay", "resume_after": resume_after}
                status = "paused"
            elif step_type == "human":
                choices = config.get("choices") or ["approved", "rejected"]
                output = {
                    "wait_type": "human",
                    "instructions": config.get("instructions") or config.get("prompt") or "Awaiting human decision.",
                    "choices": choices,
                    "title": config.get("title") or step["name"],
                    "priority": config.get("priority") or "normal",
                    "assignee_user_id": config.get("assignee_user_id"),
                    "assignee_email": config.get("assignee_email"),
                    "assignee_role": config.get("assignee_role"),
                    "due_hours": config.get("due_hours"),
                }
                status = "paused"
            elif step_type == "callback":
                output = execute_integration_operation(step_type, config, payload=payload, context=context) or {
                    "wait_type": "callback",
                    "instructions": config.get("instructions") or "Waiting for external callback payload.",
                    "expected_fields": config.get("expected_fields") or [],
                    "mode": config.get("mode") or "payload",
                }
                if config.get("choices") and "choices" not in output:
                    output["choices"] = config.get("choices")
                status = "paused"
            else:
                output = {"note": f"Unsupported step type '{step_type}' skipped."}
                status = "skipped"
        except Exception as exc:  # noqa: BLE001
            status = "failed"
            output = {"error": str(exc)}

        duration_ms = int((time.perf_counter() - started) * 1000)
        step_results.append(
            {
                "step_id": step["id"],
                "step_type": step["type"],
                "name": step["name"],
                "status": status,
                "duration_ms": duration_ms,
                "output": output,
            }
        )

        if status == "failed":
            raise RuntimeError(output["error"])

        next_step = _resolve_next_step(step["id"], step_lookup, outgoing, next_label)
        if status == "paused":
            return {
                "status": "paused",
                "step_results": step_results,
                "context": context,
                "pause": {
                    "step_id": step["id"],
                    "step_name": step["name"],
                    "wait_type": output["wait_type"],
                    "resume_after": output.get("resume_after"),
                    "metadata": output,
                },
                "state": {
                    "context": context,
                    "step_results": step_results,
                    "visited": list(visited),
                    "next_step_id": next_step["id"] if next_step else None,
                    "pending_label": None,
                },
            }

        current_step = next_step

    result = {
        "summary": context.get("text") or context.get("message") or "Workflow completed successfully.",
        "context": context,
    }
    return {
        "status": "completed",
        "step_results": step_results,
        "result": result,
        "context": context,
    }


def _resolve_next_step(
    step_id: str,
    step_lookup: dict[str, dict[str, Any]],
    outgoing: dict[str, list[dict[str, Any]]],
    preferred_label: str | None,
) -> dict[str, Any] | None:
    candidates = outgoing.get(step_id, [])
    if not candidates:
        return None

    if preferred_label is not None:
        for edge in candidates:
            if str(edge.get("label", "")).lower() == preferred_label:
                return step_lookup.get(edge["target"])

    return step_lookup.get(candidates[0]["target"])


def _render_template(template: str, payload: dict[str, Any]) -> str:
    normalized = template.replace("{{", "${").replace("}}", "}")
    return Template(normalized).safe_substitute(**payload)


def _run_llm(*, prompt: str, payload: dict[str, Any]) -> str:
    settings = get_settings()
    if settings.llm_mode == "ollama":
        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": f"{prompt}\n\nPayload:\n{payload}",
                    "stream": False,
                },
            )
            response.raise_for_status()
            return response.json().get("response", "").strip() or "Model returned no text."

    subject = payload.get("message") or payload.get("subject") or payload.get("name") or "the request"
    return f"Mock local summary for {subject}. Priority is high if the payload contains urgency or escalation signals."


def _compute_resume_after(config: dict[str, Any]) -> str:
    total_seconds = 0
    for key, multiplier in (("seconds", 1), ("minutes", 60), ("hours", 3600)):
        value = config.get(key)
        if value is not None:
            total_seconds += int(value) * multiplier
    if total_seconds <= 0:
        total_seconds = int(config.get("delay_seconds") or 60)
    return (datetime.now(UTC) + timedelta(seconds=total_seconds)).isoformat()


def _resolve_runtime_value(value: Any, vault_context: dict[str, dict[str, Any]]) -> Any:
    if isinstance(value, dict):
        return {key: _resolve_runtime_value(item, vault_context) for key, item in value.items()}
    if isinstance(value, list):
        return [_resolve_runtime_value(item, vault_context) for item in value]
    if not isinstance(value, str):
        return value

    exact_match = VAULT_TOKEN_PATTERN.fullmatch(value.strip())
    if exact_match is not None:
        return _lookup_vault_token(exact_match, vault_context)

    def replace_match(match: re.Match[str]) -> str:
        resolved = _lookup_vault_token(match, vault_context)
        if isinstance(resolved, (dict, list)):
            return str(resolved)
        return "" if resolved is None else str(resolved)

    return VAULT_TOKEN_PATTERN.sub(replace_match, value)


def _lookup_vault_token(match: re.Match[str], vault_context: dict[str, dict[str, Any]]) -> Any:
    asset_type, asset_name, field_name = match.groups()

    if asset_type == "variable":
        return vault_context.get("variables", {}).get(asset_name)

    if asset_type == "credential":
        credential = vault_context.get("credentials", {}).get(asset_name, {})
        if field_name:
            return credential.get(field_name)
        return credential

    connection = vault_context.get("connections", {}).get(asset_name, {})
    if field_name:
        return connection.get(field_name)
    return connection


def _enrich_config_with_bindings(
    step_type: str,
    config: dict[str, Any],
    vault_context: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    enriched = dict(config)
    connection_name = enriched.get("connection_name")
    credential_name = enriched.get("credential_name")
    model_variable_name = enriched.get("model_variable_name")
    webhook_variable_name = enriched.get("webhook_variable_name")

    if isinstance(connection_name, str) and connection_name:
        connection = dict(vault_context.get("connections", {}).get(connection_name) or {})
        if connection:
            enriched.setdefault("connection", connection)
            for key in ("channel", "webhook_url", "base_url", "model", "workspace", "api_key", "bot_token"):
                if key not in enriched and key in connection:
                    enriched[key] = connection[key]

    if isinstance(credential_name, str) and credential_name:
        credential = dict(vault_context.get("credentials", {}).get(credential_name) or {})
        if credential:
            enriched.setdefault("credential", credential)
            for key, value in credential.items():
                enriched.setdefault(key, value)

    if isinstance(model_variable_name, str) and model_variable_name:
        model_value = vault_context.get("variables", {}).get(model_variable_name)
        if model_value:
            enriched["model"] = model_value

    if isinstance(webhook_variable_name, str) and webhook_variable_name:
        webhook_value = vault_context.get("variables", {}).get(webhook_variable_name)
        if webhook_value:
            enriched["webhook_url"] = webhook_value

    if step_type == "llm" and "provider" in enriched and isinstance(enriched["provider"], str):
        enriched["provider"] = enriched["provider"].lower()

    return enriched
