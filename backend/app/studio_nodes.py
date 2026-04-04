from __future__ import annotations

import uuid
from typing import Any

from .integration_registry import normalize_integration_config
from .node_registry import get_node_definition, list_node_definitions, normalize_workflow_definition


LLM_PROVIDER_MODELS: dict[str, list[dict[str, str]]] = {
    "openai": [
        {"value": "gpt-4.1-mini", "label": "GPT-4.1 Mini"},
        {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
        {"value": "gpt-4.1", "label": "GPT-4.1"},
    ],
    "anthropic": [
        {"value": "claude-sonnet-4", "label": "Claude Sonnet 4"},
        {"value": "claude-opus-4.1", "label": "Claude Opus 4.1"},
    ],
    "ollama": [
        {"value": "llama3.2", "label": "Llama 3.2"},
        {"value": "qwen2.5-coder", "label": "Qwen 2.5 Coder"},
        {"value": "mistral-small", "label": "Mistral Small"},
    ],
    "gemini": [
        {"value": "gemini-2.0-flash", "label": "Gemini 2.0 Flash"},
        {"value": "gemini-1.5-pro", "label": "Gemini 1.5 Pro"},
    ],
    "custom": [
        {"value": "custom-endpoint", "label": "Custom endpoint"},
    ],
}


NODE_GROUPS: list[dict[str, Any]] = [
    {
        "id": "start",
        "label": "Start",
        "description": "Trigger and entry steps that start a workflow.",
        "categories": {"Start"},
    },
    {
        "id": "ai",
        "label": "AI",
        "description": "Model-driven steps and reasoning blocks.",
        "categories": {"AI"},
    },
    {
        "id": "actions",
        "label": "Actions",
        "description": "Delivery and side-effect steps.",
        "categories": {"Action"},
    },
    {
        "id": "logic",
        "label": "Logic",
        "description": "Routing, branching, and data transformations.",
        "categories": {"Data", "Logic", "Control Flow"},
    },
    {
        "id": "approvals",
        "label": "Approvals",
        "description": "Human review and callback-driven steps.",
        "categories": {"Approvals", "Integrations"},
    },
]


def build_node_catalog() -> dict[str, Any]:
    nodes = list_node_definitions()
    groups: list[dict[str, Any]] = []
    for group in NODE_GROUPS:
        node_types = [node["type"] for node in nodes if node["category"] in group["categories"]]
        groups.append(
            {
                "id": group["id"],
                "label": group["label"],
                "description": group["description"],
                "node_types": node_types,
                "count": len(node_types),
            }
        )
    return {
        "groups": groups,
        "nodes": nodes,
    }


def _binding_reference_from_asset(asset: dict[str, Any]) -> dict[str, Any]:
    secret = dict(asset.get("secret") or {})
    return {
        "kind": asset["kind"],
        "name": asset["name"],
        "label": asset["name"],
        "app": asset.get("app"),
        "scope": asset.get("scope"),
        "fields": sorted(secret.keys()),
    }


def _binding_reference_from_member(member: dict[str, Any]) -> dict[str, Any]:
    return {
        "kind": "member",
        "name": member["user_id"],
        "label": f"{member['name']} ({member['role']})",
        "app": None,
        "scope": member.get("role"),
        "fields": [],
    }


def _to_option(value: str, label: str | None = None) -> dict[str, str]:
    return {"value": value, "label": label or value}


def _infer_output_channel_options(connections: list[dict[str, Any]]) -> list[dict[str, str]]:
    options: list[dict[str, str]] = []
    seen: set[str] = set()
    for asset in connections:
        secret = dict(asset.get("secret") or {})
        for key in ("channel", "queue", "destination", "topic"):
            value = secret.get(key)
            if isinstance(value, str) and value and value not in seen:
                seen.add(value)
                options.append(_to_option(value, f"{value} ({asset['name']})"))
    return options


def _filter_assets_by_app(assets: list[dict[str, Any]], *, app_names: set[str]) -> list[dict[str, Any]]:
    return [asset for asset in assets if str(asset.get("app") or "").lower() in app_names]


def _build_dynamic_fields(
    node_type: str,
    config: dict[str, Any],
    *,
    connections: list[dict[str, Any]],
    credentials: list[dict[str, Any]],
    variables: list[dict[str, Any]],
    members: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if node_type == "llm":
        provider = str(config.get("provider") or "openai").lower()
        provider_apps = {provider}
        if provider == "openai":
            provider_apps.add("openai")
        if provider == "anthropic":
            provider_apps.add("anthropic")
        llm_connections = _filter_assets_by_app(connections, app_names=provider_apps)
        llm_credentials = _filter_assets_by_app(credentials, app_names=provider_apps)
        model_variable_options = [
            _to_option(asset["name"], f"{asset['name']} ({asset.get('secret', {}).get('value', '')})")
            for asset in variables
            if "model" in str(asset["name"]).lower()
        ]
        return [
            {
                "key": "connection_name",
                "label": "Connection",
                "type": "select",
                "required": False,
                "help": "Pick a saved provider connection from Vault.",
                "value": config.get("connection_name"),
                "options": [_to_option("", "No saved connection"), *[_to_option(asset["name"], asset["name"]) for asset in llm_connections]],
                "bindable": True,
                "binding_kinds": ["connection"],
                "source": "vault",
            },
            {
                "key": "credential_name",
                "label": "Credential",
                "type": "select",
                "required": False,
                "help": "Use a specific credential when the provider requires explicit auth.",
                "value": config.get("credential_name"),
                "options": [_to_option("", "No explicit credential"), *[_to_option(asset["name"], asset["name"]) for asset in llm_credentials]],
                "bindable": True,
                "binding_kinds": ["credential"],
                "source": "vault",
            },
            {
                "key": "model_variable_name",
                "label": "Model variable",
                "type": "select",
                "required": False,
                "help": "Optionally drive the model from a shared Vault variable.",
                "value": config.get("model_variable_name"),
                "options": [_to_option("", "Use the model field"), *model_variable_options],
                "bindable": True,
                "binding_kinds": ["variable"],
                "source": "vault",
            },
        ]

    if node_type == "output":
        channel_options = _infer_output_channel_options(connections)
        webhook_variable_options = [
            _to_option(asset["name"], asset["name"])
            for asset in variables
            if "webhook" in str(asset["name"]).lower() or "url" in str(asset["name"]).lower()
        ]
        return [
            {
                "key": "connection_name",
                "label": "Connection",
                "type": "select",
                "required": False,
                "help": "Pick a saved connection and FlowHolt will fill destination fields from it.",
                "value": config.get("connection_name"),
                "options": [_to_option("", "No saved connection"), *[_to_option(asset["name"], asset["name"]) for asset in connections]],
                "bindable": True,
                "binding_kinds": ["connection"],
                "source": "vault",
            },
            {
                "key": "webhook_variable_name",
                "label": "Webhook variable",
                "type": "select",
                "required": False,
                "help": "Use a shared Vault variable for the outbound webhook URL.",
                "value": config.get("webhook_variable_name"),
                "options": [_to_option("", "Use webhook URL field"), *webhook_variable_options],
                "bindable": True,
                "binding_kinds": ["variable"],
                "source": "vault",
            },
            {
                "key": "channel",
                "label": "Resolved channel",
                "type": "select",
                "required": False,
                "help": "Suggested channels or queues from saved workspace connections.",
                "value": config.get("channel"),
                "options": channel_options,
                "source": "workspace",
            },
        ]

    if node_type == "human":
        member_options = [_to_option("", "Assign later")] + [_to_option(member["user_id"], member["name"]) for member in members]
        return [
            {
                "key": "assignee_user_id",
                "label": "Assignee",
                "type": "select",
                "required": False,
                "help": "Route the human task directly to a workspace member.",
                "value": config.get("assignee_user_id"),
                "options": member_options,
                "bindable": True,
                "binding_kinds": ["member"],
                "source": "workspace",
            }
        ]

    if node_type == "callback":
        return [
            {
                "key": "connection_name",
                "label": "Callback connection",
                "type": "select",
                "required": False,
                "help": "Link this wait step to a known connection or endpoint owner.",
                "value": config.get("connection_name"),
                "options": [_to_option("", "No saved connection"), *[_to_option(asset["name"], asset["name"]) for asset in connections]],
                "bindable": True,
                "binding_kinds": ["connection"],
                "source": "vault",
            }
        ]

    return []


def _group_fields(node_type: str, fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    config_fields = list(fields)
    if node_type == "trigger":
        split_at = min(len(config_fields), 2)
        return [
            {"id": "entry", "title": "Entry settings", "description": "Choose how the workflow begins.", "fields": config_fields[:split_at]},
            {"id": "runtime", "title": "Runtime details", "description": "Optional timing and routing settings.", "fields": config_fields[split_at:]},
        ]
    if node_type == "llm":
        return [
            {"id": "provider", "title": "Provider & model", "description": "Choose a provider, model, and saved auth sources.", "fields": [field for field in config_fields if field["key"] in {"provider", "model", "connection_name", "credential_name", "model_variable_name"}]},
            {"id": "generation", "title": "Generation settings", "description": "Prompt and token controls.", "fields": [field for field in config_fields if field["key"] not in {"provider", "model", "connection_name", "credential_name", "model_variable_name"}]},
        ]
    if node_type == "output":
        return [
            {"id": "delivery", "title": "Delivery settings", "description": "Choose where the workflow sends its result.", "fields": config_fields},
        ]
    if node_type == "human":
        return [
            {"id": "review", "title": "Review settings", "description": "Control who reviews this task and how they respond.", "fields": config_fields},
        ]
    if node_type == "callback":
        return [
            {"id": "callback", "title": "Callback settings", "description": "Configure how external systems resume the flow.", "fields": config_fields},
        ]
    return [{"id": "general", "title": "General settings", "description": None, "fields": config_fields}]


def _sample_output(node_type: str, config: dict[str, Any]) -> dict[str, Any]:
    if node_type == "trigger":
        return {"received": True, "source": config.get("source", "manual")}
    if node_type == "transform":
        return {"message": config.get("template") or "Transformed workflow payload"}
    if node_type == "condition":
        return {"matched": True, "branch": "true"}
    if node_type == "llm":
        return {"text": "Drafted model response", "provider": config.get("provider"), "model": config.get("model")}
    if node_type == "output":
        return {"delivered": True, "channel": config.get("channel") or "default"}
    if node_type == "delay":
        return {"wait_type": "delay", "resume_after": "2026-04-03T12:00:00Z"}
    if node_type == "human":
        return {"wait_type": "human", "choices": config.get("choices") or ["approved", "rejected"]}
    if node_type == "callback":
        return {"wait_type": "callback", "mode": config.get("mode") or "payload"}
    return {}


def _apply_binding_hints(
    node_type: str,
    config: dict[str, Any],
    *,
    connections: list[dict[str, Any]],
    credentials: list[dict[str, Any]],
    variables: list[dict[str, Any]],
) -> dict[str, Any]:
    enriched = dict(config)

    if node_type == "llm":
        if not enriched.get("connection_name"):
            provider = str(enriched.get("provider") or "openai").lower()
            matching_connection = next((asset for asset in connections if str(asset.get("app") or "").lower() == provider), None)
            if matching_connection:
                enriched["connection_name"] = matching_connection["name"]
        if not enriched.get("credential_name"):
            provider = str(enriched.get("provider") or "openai").lower()
            matching_credential = next((asset for asset in credentials if str(asset.get("app") or "").lower() == provider), None)
            if matching_credential:
                enriched["credential_name"] = matching_credential["name"]
        if not enriched.get("model_variable_name"):
            model_variable = next((asset for asset in variables if "model" in str(asset["name"]).lower()), None)
            if model_variable:
                enriched["model_variable_name"] = model_variable["name"]

    if node_type == "output" and not enriched.get("connection_name") and connections:
        output_connection = next(
            (
                asset
                for asset in connections
                if any(key in dict(asset.get("secret") or {}) for key in ("channel", "webhook_url", "destination", "queue", "topic"))
            ),
            connections[0],
        )
        enriched["connection_name"] = output_connection["name"]
    if node_type == "callback" and not enriched.get("connection_name") and connections:
        enriched["connection_name"] = connections[0]["name"]

    if enriched.get("connection_name"):
        selected_connection = next((asset for asset in connections if asset["name"] == enriched["connection_name"]), None)
        if selected_connection:
            secret = dict(selected_connection.get("secret") or {})
            for key in ("channel", "webhook_url", "base_url", "model", "workspace", "api_key", "bot_token"):
                if key not in enriched and key in secret:
                    enriched[key] = secret[key]

    if enriched.get("credential_name"):
        selected_credential = next((asset for asset in credentials if asset["name"] == enriched["credential_name"]), None)
        if selected_credential:
            secret = dict(selected_credential.get("secret") or {})
            for key, value in secret.items():
                enriched.setdefault(key, value)

    if enriched.get("model_variable_name"):
        selected_variable = next((asset for asset in variables if asset["name"] == enriched["model_variable_name"]), None)
        if selected_variable:
            variable_value = dict(selected_variable.get("secret") or {}).get("value")
            if variable_value:
                enriched["model"] = variable_value

    if enriched.get("webhook_variable_name"):
        selected_variable = next((asset for asset in variables if asset["name"] == enriched["webhook_variable_name"]), None)
        if selected_variable:
            variable_value = dict(selected_variable.get("secret") or {}).get("value")
            if variable_value:
                enriched["webhook_url"] = variable_value

    return enriched


def _warnings_for_node(
    node_type: str,
    config: dict[str, Any],
    *,
    connections: list[dict[str, Any]],
    credentials: list[dict[str, Any]],
    members: list[dict[str, Any]],
) -> list[str]:
    warnings: list[str] = []
    if node_type == "llm":
        provider = str(config.get("provider") or "openai").lower()
        app_names = {provider}
        if provider == "openai":
            app_names.add("openai")
        if provider == "anthropic":
            app_names.add("anthropic")
        if not _filter_assets_by_app(connections, app_names=app_names) and not _filter_assets_by_app(credentials, app_names=app_names):
            warnings.append("No saved Vault connection or credential matches this AI provider yet.")
    if node_type == "output" and not connections:
        warnings.append("No workspace connections are available yet for output delivery.")
    if node_type == "human" and not members:
        warnings.append("This workspace has no active members to assign human tasks to.")
    if node_type == "callback" and not connections:
        warnings.append("No saved connections are available to own this callback route.")
    return warnings


def build_node_editor_response(
    node_type: str,
    *,
    config: dict[str, Any] | None = None,
    workflow_trigger_type: str | None = None,
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

    normalized = normalize_workflow_definition(
        {
            "steps": [
                {
                    "id": "draft-node",
                    "type": node_type,
                    "name": step_name or definition["label"],
                    "config": normalize_integration_config(node_type, config or {}),
                }
            ],
            "edges": [],
        },
        workflow_trigger_type=workflow_trigger_type,
    )["steps"][0]
    current_config = dict(normalized.get("config") or {})

    base_fields = []
    for field in definition["fields"]:
        field_copy = dict(field)
        field_copy["value"] = current_config.get(field["key"])
        field_copy.setdefault("options", list(field.get("options") or []))
        field_copy.setdefault("bindable", False)
        field_copy.setdefault("binding_kinds", [])
        field_copy.setdefault("source", "static")
        field_copy.setdefault("placeholder", None)
        if node_type == "llm" and field_copy["key"] == "model":
            provider = str(current_config.get("provider") or field_copy.get("default") or "openai").lower()
            field_copy["options"] = LLM_PROVIDER_MODELS.get(provider, [])
            field_copy["source"] = "provider"
        base_fields.append(field_copy)

    dynamic_fields = _build_dynamic_fields(
        node_type,
        current_config,
        connections=connections,
        credentials=credentials,
        variables=variables,
        members=members,
    )
    sections = _group_fields(node_type, [*base_fields, *dynamic_fields])
    warnings = _warnings_for_node(
        node_type,
        current_config,
        connections=connections,
        credentials=credentials,
        members=members,
    )
    available_bindings = [
        *[_binding_reference_from_asset(asset) for asset in connections],
        *[_binding_reference_from_asset(asset) for asset in credentials],
        *[_binding_reference_from_asset(asset) for asset in variables],
        *[_binding_reference_from_member(member) for member in members],
    ]

    return {
        "node_type": node_type,
        "label": definition["label"],
        "description": definition["description"],
        "icon": definition["icon"],
        "step_name_default": step_name or definition["label"],
        "sections": sections,
        "warnings": warnings,
        "sample_output": _sample_output(node_type, current_config),
        "available_bindings": available_bindings,
    }


def build_node_draft(
    node_type: str,
    *,
    workflow_trigger_type: str | None = None,
    name: str | None = None,
    config: dict[str, Any] | None = None,
    connections: list[dict[str, Any]] | None = None,
    credentials: list[dict[str, Any]] | None = None,
    variables: list[dict[str, Any]] | None = None,
    members: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    definition = get_node_definition(node_type)
    if definition is None:
        raise ValueError(f"Unknown node type: {node_type}")
    editor = build_node_editor_response(
        node_type,
        config=config,
        workflow_trigger_type=workflow_trigger_type,
        connections=connections,
        credentials=credentials,
        variables=variables,
        members=members,
        step_name=name or definition["label"],
    )
    merged_config = _apply_binding_hints(
        node_type,
        normalize_integration_config(node_type, config or {}),
        connections=connections or [],
        credentials=credentials or [],
        variables=variables or [],
    )
    for section in editor["sections"]:
        for field in section["fields"]:
            if field["key"] not in merged_config and field.get("value") not in (None, "", []):
                merged_config[field["key"]] = field["value"]

    step = normalize_workflow_definition(
        {
            "steps": [
                {
                    "id": f"step-{uuid.uuid4().hex[:10]}",
                    "type": node_type,
                    "name": name or definition["label"],
                    "config": merged_config,
                }
            ],
            "edges": [],
        },
        workflow_trigger_type=workflow_trigger_type,
    )["steps"][0]
    return {
        "step": step,
        "editor": editor,
    }


def resolve_node_preview(
    step: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
    connections: list[dict[str, Any]] | None = None,
    credentials: list[dict[str, Any]] | None = None,
    variables: list[dict[str, Any]] | None = None,
    members: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    editor = build_node_editor_response(
        str(step["type"]),
        config=dict(step.get("config") or {}),
        workflow_trigger_type=workflow_trigger_type,
        connections=connections,
        credentials=credentials,
        variables=variables,
        members=members,
        step_name=str(step.get("name") or ""),
    )
    normalized_step = build_node_draft(
        str(step["type"]),
        workflow_trigger_type=workflow_trigger_type,
        name=str(step.get("name") or editor["step_name_default"]),
        config=dict(step.get("config") or {}),
        connections=connections,
        credentials=credentials,
        variables=variables,
        members=members,
    )["step"]
    resolved_config = _apply_binding_hints(
        str(step["type"]),
        dict(normalized_step.get("config") or {}),
        connections=connections or [],
        credentials=credentials or [],
        variables=variables or [],
    )
    return {
        "step_id": normalized_step["id"],
        "node_type": normalized_step["type"],
        "resolved_config": resolved_config,
        "sample_output": _sample_output(str(step["type"]), resolved_config),
        "warnings": editor["warnings"],
    }
