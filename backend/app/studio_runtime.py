from __future__ import annotations

import time
from typing import Any

from .executor import run_workflow_definition
from .integration_registry import normalize_integration_config, validate_integration_operation
from .node_registry import get_node_definition
from .studio_nodes import build_node_draft, resolve_node_preview


def _binding_names(config: dict[str, Any]) -> list[str]:
    names: list[str] = []
    for key in (
        "connection_name",
        "credential_name",
        "model_variable_name",
        "webhook_variable_name",
        "assignee_user_id",
        "assignee_email",
        "assignee_role",
    ):
        value = config.get(key)
        if isinstance(value, str) and value:
            names.append(f"{key}:{value}")
    return names


def _build_vault_context(
    *,
    connections: list[dict[str, Any]],
    credentials: list[dict[str, Any]],
    variables: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    return {
        "connections": {asset["name"]: dict(asset.get("secret") or {}) for asset in connections},
        "credentials": {asset["name"]: dict(asset.get("secret") or {}) for asset in credentials},
        "variables": {
            asset["name"]: dict(asset.get("secret") or {}).get("value")
            for asset in variables
        },
    }


def validate_node_configuration(
    node_type: str,
    *,
    config: dict[str, Any] | None = None,
    trigger_type: str | None = None,
    connections: list[dict[str, Any]] | None = None,
    credentials: list[dict[str, Any]] | None = None,
    variables: list[dict[str, Any]] | None = None,
    members: list[dict[str, Any]] | None = None,
    step_name: str | None = None,
) -> dict[str, Any]:
    definition = get_node_definition(node_type)
    if definition is None:
        raise ValueError(f"Unknown node type: {node_type}")

    connections = list(connections or [])
    credentials = list(credentials or [])
    variables = list(variables or [])
    members = list(members or [])

    draft = build_node_draft(
        node_type,
        workflow_trigger_type=trigger_type,
        name=step_name or definition["label"],
        config=normalize_integration_config(node_type, config or {}),
        connections=connections,
        credentials=credentials,
        variables=variables,
        members=members,
    )
    normalized_config = dict(draft["step"].get("config") or {})
    preview = resolve_node_preview(
        draft["step"],
        workflow_trigger_type=trigger_type,
        connections=connections,
        credentials=credentials,
        variables=variables,
        members=members,
    )

    issues: list[dict[str, Any]] = []

    for field in definition.get("fields", []):
        key = str(field.get("key") or "")
        required = bool(field.get("required"))
        value = normalized_config.get(key)
        if required and value in (None, "", []):
            issues.append(
                {
                    "level": "error",
                    "code": "required_field_missing",
                    "message": f"{field['label']} is required.",
                    "field": key,
                }
            )

    if node_type == "condition":
        operator = str(normalized_config.get("operator") or "equals")
        if operator in {"equals", "not_equals", "contains"} and normalized_config.get("equals") in (None, ""):
            issues.append(
                {
                    "level": "error",
                    "code": "condition_compare_missing",
                    "message": "A compare value is required for this condition operator.",
                    "field": "equals",
                }
            )

    if node_type == "llm":
        provider = str(normalized_config.get("provider") or "openai").lower()
        if provider == "custom" and not (normalized_config.get("base_url") or normalized_config.get("connection_name")):
            issues.append(
                {
                    "level": "error",
                    "code": "custom_provider_base_url_missing",
                    "message": "Custom LLM steps need a base URL or saved connection.",
                    "field": "base_url",
                }
            )
        if not (normalized_config.get("model") or normalized_config.get("model_variable_name")):
            issues.append(
                {
                    "level": "warning",
                    "code": "model_missing",
                    "message": "No explicit model is selected yet; the runtime may fall back to a default.",
                    "field": "model",
                }
            )

    if node_type == "output":
        if not any(normalized_config.get(key) for key in ("channel", "connection_name", "webhook_url", "webhook_variable_name")):
            issues.append(
                {
                    "level": "error",
                    "code": "output_destination_missing",
                    "message": "Output steps need a channel, webhook URL, or saved connection.",
                    "field": "channel",
                }
            )

    if node_type == "delay":
        total_seconds = int(normalized_config.get("seconds") or 0) + (int(normalized_config.get("minutes") or 0) * 60) + (int(normalized_config.get("hours") or 0) * 3600)
        if total_seconds <= 0:
            issues.append(
                {
                    "level": "error",
                    "code": "delay_duration_missing",
                    "message": "Delay steps need a duration greater than zero.",
                    "field": "seconds",
                }
            )

    if node_type == "human":
        choices = list(normalized_config.get("choices") or [])
        if len(choices) < 2:
            issues.append(
                {
                    "level": "warning",
                    "code": "human_choices_short",
                    "message": "Approval steps work better with at least two response choices.",
                    "field": "choices",
                }
            )
        if normalized_config.get("assignee_user_id") and not any(member["user_id"] == normalized_config["assignee_user_id"] for member in members):
            issues.append(
                {
                    "level": "warning",
                    "code": "human_assignee_missing",
                    "message": "The selected assignee is not an active member of this workspace.",
                    "field": "assignee_user_id",
                }
            )

    if node_type == "callback":
        mode = str(normalized_config.get("mode") or "payload")
        if mode == "decision" and not normalized_config.get("choices"):
            issues.append(
                {
                    "level": "error",
                    "code": "callback_choices_missing",
                    "message": "Decision callbacks need at least one decision choice.",
                    "field": "choices",
                }
            )

    issues.extend(validate_integration_operation(node_type, normalized_config))

    available_connections = {asset["name"] for asset in connections}
    available_credentials = {asset["name"] for asset in credentials}
    available_variables = {asset["name"] for asset in variables}
    if normalized_config.get("connection_name") and normalized_config["connection_name"] not in available_connections:
        issues.append({"level": "warning", "code": "connection_not_found", "message": "Saved connection could not be found in this workspace.", "field": "connection_name"})
    if normalized_config.get("credential_name") and normalized_config["credential_name"] not in available_credentials:
        issues.append({"level": "warning", "code": "credential_not_found", "message": "Saved credential could not be found in this workspace.", "field": "credential_name"})
    if normalized_config.get("model_variable_name") and normalized_config["model_variable_name"] not in available_variables:
        issues.append({"level": "warning", "code": "variable_not_found", "message": "Saved model variable could not be found in this workspace.", "field": "model_variable_name"})
    if normalized_config.get("webhook_variable_name") and normalized_config["webhook_variable_name"] not in available_variables:
        issues.append({"level": "warning", "code": "variable_not_found", "message": "Saved webhook variable could not be found in this workspace.", "field": "webhook_variable_name"})

    return {
        "node_type": node_type,
        "valid": not any(issue["level"] == "error" for issue in issues),
        "issues": issues,
        "normalized_config": dict(preview.get("resolved_config") or normalized_config),
        "sample_output": dict(preview.get("sample_output") or {}),
        "bindings_used": _binding_names(normalized_config),
    }


def test_node_configuration(
    node_type: str,
    *,
    config: dict[str, Any] | None = None,
    trigger_type: str | None = None,
    payload: dict[str, Any] | None = None,
    connections: list[dict[str, Any]] | None = None,
    credentials: list[dict[str, Any]] | None = None,
    variables: list[dict[str, Any]] | None = None,
    members: list[dict[str, Any]] | None = None,
    step_name: str | None = None,
) -> dict[str, Any]:
    connections = list(connections or [])
    credentials = list(credentials or [])
    variables = list(variables or [])
    members = list(members or [])
    sample_payload = dict(payload or {})

    validation = validate_node_configuration(
        node_type,
        config=config,
        trigger_type=trigger_type,
        connections=connections,
        credentials=credentials,
        variables=variables,
        members=members,
        step_name=step_name,
    )
    if not validation["valid"]:
        return {
            "node_type": node_type,
            "status": "failed",
            "valid": False,
            "normalized_config": validation["normalized_config"],
            "output": {},
            "warnings": [issue["message"] for issue in validation["issues"]],
            "bindings_used": validation["bindings_used"],
            "duration_ms": 0,
        }

    draft = build_node_draft(
        node_type,
        workflow_trigger_type=trigger_type,
        name=step_name,
        config=normalize_integration_config(node_type, config or {}),
        connections=connections,
        credentials=credentials,
        variables=variables,
        members=members,
    )
    step = draft["step"]
    definition = {
        "steps": [step],
        "edges": [],
    }
    if node_type != "trigger":
        definition = {
            "steps": [
                {"id": "trigger-test", "type": "trigger", "name": "Test trigger", "config": {"source": trigger_type or "manual"}},
                step,
            ],
            "edges": [{"id": "edge-trigger-test", "source": "trigger-test", "target": step["id"], "label": None}],
        }

    started = time.perf_counter()
    outcome = run_workflow_definition(
        definition,
        sample_payload,
        vault_context=_build_vault_context(connections=connections, credentials=credentials, variables=variables),
    )
    duration_ms = int((time.perf_counter() - started) * 1000)
    if outcome["status"] == "paused":
        output = dict(outcome.get("pause", {}).get("metadata") or {})
        status = "paused"
    else:
        target_step = next(
            (item for item in outcome.get("step_results", []) if str(item.get("step_id") or "") == str(step["id"])),
            None,
        )
        output = dict((target_step or {}).get("output") or {})
        status = "success"

    return {
        "node_type": node_type,
        "status": status,
        "valid": True,
        "normalized_config": validation["normalized_config"],
        "output": output,
        "warnings": [issue["message"] for issue in validation["issues"] if issue["level"] == "warning"],
        "bindings_used": validation["bindings_used"],
        "duration_ms": duration_ms,
    }
