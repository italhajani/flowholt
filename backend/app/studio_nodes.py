from __future__ import annotations

import re
import uuid
from typing import Any

from .integration_registry import normalize_integration_config
from .node_registry import get_node_definition, list_node_definitions, normalize_workflow_definition


LLM_PROVIDER_MODELS: dict[str, list[dict[str, str]]] = {
    "openai": [
        {"value": "gpt-4o", "label": "GPT-4o"},
        {"value": "gpt-4.1-mini", "label": "GPT-4.1 Mini"},
        {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
        {"value": "gpt-4.1", "label": "GPT-4.1"},
        {"value": "gpt-4-turbo", "label": "GPT-4 Turbo"},
        {"value": "o1", "label": "o1"},
        {"value": "o1-mini", "label": "o1 Mini"},
        {"value": "o3-mini", "label": "o3 Mini"},
    ],
    "anthropic": [
        {"value": "claude-sonnet-4-20250514", "label": "Claude Sonnet 4"},
        {"value": "claude-opus-4-20250514", "label": "Claude Opus 4"},
        {"value": "claude-3-5-sonnet-20241022", "label": "Claude 3.5 Sonnet"},
        {"value": "claude-3-5-haiku-20241022", "label": "Claude 3.5 Haiku"},
        {"value": "claude-3-haiku-20240307", "label": "Claude 3 Haiku"},
    ],
    "ollama": [
        {"value": "llama3.2", "label": "Llama 3.2"},
        {"value": "llama3.1", "label": "Llama 3.1"},
        {"value": "qwen2.5-coder", "label": "Qwen 2.5 Coder"},
        {"value": "mistral-small", "label": "Mistral Small"},
        {"value": "codellama", "label": "Code Llama"},
        {"value": "deepseek-coder-v2", "label": "DeepSeek Coder V2"},
    ],
    "gemini": [
        {"value": "gemini-2.0-flash", "label": "Gemini 2.0 Flash"},
        {"value": "gemini-1.5-pro", "label": "Gemini 1.5 Pro"},
        {"value": "gemini-1.5-flash", "label": "Gemini 1.5 Flash"},
    ],
    "groq": [
        {"value": "llama-3.3-70b-versatile", "label": "Llama 3.3 70B Versatile"},
        {"value": "llama-3.1-8b-instant", "label": "Llama 3.1 8B Instant"},
        {"value": "mixtral-8x7b-32768", "label": "Mixtral 8x7B"},
        {"value": "gemma2-9b-it", "label": "Gemma 2 9B IT"},
    ],
    "deepseek": [
        {"value": "deepseek-chat", "label": "DeepSeek Chat"},
        {"value": "deepseek-reasoner", "label": "DeepSeek Reasoner"},
    ],
    "xai": [
        {"value": "grok-2", "label": "Grok 2"},
        {"value": "grok-2-mini", "label": "Grok 2 Mini"},
    ],
    "together": [
        {"value": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "label": "Llama 3.1 70B Instruct"},
        {"value": "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", "label": "Llama 3.1 8B Instruct"},
        {"value": "mistralai/Mixtral-8x7B-Instruct-v0.1", "label": "Mixtral 8x7B Instruct"},
    ],
    "fireworks": [
        {"value": "accounts/fireworks/models/llama-v3p1-70b-instruct", "label": "Llama 3.1 70B Instruct"},
        {"value": "accounts/fireworks/models/llama-v3p1-8b-instruct", "label": "Llama 3.1 8B Instruct"},
    ],
    "mistral": [
        {"value": "mistral-large-latest", "label": "Mistral Large"},
        {"value": "mistral-small-latest", "label": "Mistral Small"},
        {"value": "codestral-latest", "label": "Codestral"},
    ],
    "perplexity": [
        {"value": "llama-3.1-sonar-large-128k-online", "label": "Sonar Large 128K Online"},
        {"value": "llama-3.1-sonar-small-128k-online", "label": "Sonar Small 128K Online"},
    ],
    "cohere": [
        {"value": "command-r-plus", "label": "Command R Plus"},
        {"value": "command-r", "label": "Command R"},
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


IDENTIFIER_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def _expression_segment(key: str) -> str:
    if IDENTIFIER_RE.match(key):
        return f".{key}"
    escaped = key.replace('\\', '\\\\').replace('"', '\\"')
    return f'["{escaped}"]'


def _preview_text(value: Any) -> str:
    if isinstance(value, dict):
        return f"{len(value)} field(s)"
    if isinstance(value, list):
        return f"array[{len(value)}]"
    if value is None:
        return "null"
    return str(value)


def _reference_search_terms(*, step_name: str, path_label: str, expression_base: str, namespace: str, source: str) -> list[str]:
    terms = [
        step_name,
        path_label,
        expression_base,
        namespace,
        source,
        f"{step_name} {path_label}",
    ]
    cleaned_path = path_label.replace("[", " ").replace("]", " ").replace(".", " ")
    cleaned_expression = expression_base.replace("[", " ").replace("]", " ").replace(".", " ").replace('"', " ")
    terms.extend(part for part in cleaned_path.split() if part)
    terms.extend(part for part in cleaned_expression.split() if part)
    return list(dict.fromkeys(term for term in terms if term))


def _collect_reference_paths(
    value: Any,
    expression_base: str,
    path_label: str,
    *,
    step_name: str,
    source: str,
    namespace: str | None = None,
    depth: int = 0,
    max_depth: int = 2,
) -> list[dict[str, Any]]:
    namespace_value = namespace or expression_base
    references: list[dict[str, Any]] = [
        {
            "path": path_label,
            "expression": f"{{{{{expression_base}}}}}",
            "expression_core": expression_base,
            "namespace": namespace_value,
            "search_terms": _reference_search_terms(
                step_name=step_name,
                path_label=path_label,
                expression_base=expression_base,
                namespace=namespace_value,
                source=source,
            ),
            "depth": depth,
            "is_root": depth == 0,
            "preview": _preview_text(value),
            "value": value,
        }
    ]
    if depth >= max_depth:
        return references

    if isinstance(value, dict):
        for key, nested in list(value.items())[:8]:
            child_expression = f"{expression_base}{_expression_segment(str(key))}"
            child_path = f"{path_label}.{key}" if path_label else str(key)
            references.extend(
                _collect_reference_paths(
                    nested,
                    child_expression,
                    child_path,
                    step_name=step_name,
                    source=source,
                    namespace=namespace_value,
                    depth=depth + 1,
                    max_depth=max_depth,
                )
            )
    elif isinstance(value, list) and value:
        child_expression = f"{expression_base}[0]"
        child_path = f"{path_label}[0]" if path_label else "[0]"
        references.extend(
            _collect_reference_paths(
                value[0],
                child_expression,
                child_path,
                step_name=step_name,
                source=source,
                namespace=namespace_value,
                depth=depth + 1,
                max_depth=max_depth,
            )
        )

    return references


def _workflow_upstream_step_ids(definition: dict[str, Any], current_step_id: str) -> list[str]:
    steps = list(definition.get("steps") or [])
    edges = list(definition.get("edges") or [])
    ordered_ids = [str(step.get("id")) for step in steps]
    if current_step_id not in ordered_ids:
        return []
    if not edges:
        return ordered_ids[:ordered_ids.index(current_step_id)]

    incoming: dict[str, list[str]] = {}
    for edge in edges:
        incoming.setdefault(str(edge.get("target")), []).append(str(edge.get("source")))

    seen: set[str] = set()

    def visit(step_id: str) -> None:
        for source_id in incoming.get(step_id, []):
            if source_id in seen:
                continue
            seen.add(source_id)
            visit(source_id)

    visit(current_step_id)
    return [step_id for step_id in ordered_ids if step_id in seen and step_id != current_step_id]


def _workflow_immediate_input_ids(definition: dict[str, Any], current_step_id: str) -> list[str]:
    steps = list(definition.get("steps") or [])
    edges = list(definition.get("edges") or [])
    ordered_ids = [str(step.get("id")) for step in steps]
    if current_step_id not in ordered_ids:
        return []
    if not edges:
        current_index = ordered_ids.index(current_step_id)
        return ordered_ids[current_index - 1:current_index] if current_index > 0 else []

    immediate_ids = [str(edge.get("source")) for edge in edges if str(edge.get("target")) == current_step_id]
    return [step_id for step_id in ordered_ids if step_id in immediate_ids and step_id != current_step_id]

def _workflow_input_references(definition: dict[str, Any] | None, current_step_id: str | None) -> list[dict[str, Any]]:
    if not definition or not current_step_id:
        return []

    step_lookup = {str(step.get("id")): step for step in (definition.get("steps") or [])}
    references: list[dict[str, Any]] = []
    for step_id in _workflow_immediate_input_ids(definition, current_step_id):
        step = step_lookup.get(step_id)
        if step is None:
            continue
        sample_output = _sample_output(str(step.get("type") or ""), dict(step.get("config") or {}))
        for item in _collect_reference_paths(
            sample_output,
            "json",
            "Input",
            step_name="Input",
            source="input",
            namespace="json",
        ):
            references.append(
                {
                    "source": "input",
                    "step_id": step_id,
                    "step_name": "Input",
                    "node_type": str(step.get("type") or ""),
                    "path": item["path"],
                    "expression": item["expression"],
                    "preview": item["preview"],
                    "value": item["value"],
                }
            )
        break
    return references[:16]


def _workflow_data_references(definition: dict[str, Any] | None, current_step_id: str | None) -> list[dict[str, Any]]:
    if not definition or not current_step_id:
        return []

    step_lookup = {str(step.get("id")): step for step in (definition.get("steps") or [])}
    references: list[dict[str, Any]] = _workflow_input_references(definition, current_step_id)

    for step_id in _workflow_upstream_step_ids(definition, current_step_id):
        step = step_lookup.get(step_id)
        if step is None:
            continue
        step_name = str(step.get("name") or step_id)
        escaped_name = step_name.replace('\\', '\\\\').replace('"', '\\"')
        sample_output = _sample_output(str(step.get("type") or ""), dict(step.get("config") or {}))
        namespace = f'steps["{escaped_name}"]'
        for item in _collect_reference_paths(
            sample_output,
            namespace,
            step_name,
            step_name=step_name,
            source="node",
            namespace=namespace,
        ):
            references.append(
                {
                    "source": "node",
                    "step_id": step_id,
                    "step_name": step_name,
                    "node_type": str(step.get("type") or ""),
                    "path": item["path"],
                    "expression": item["expression"],
                    "preview": item["preview"],
                    "value": item["value"],
                }
            )

    return references[:48]


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

    if node_type == "ai_agent":
        provider = str(config.get("provider") or "openai").lower()
        provider_apps = {provider}
        if provider == "openai":
            provider_apps.add("openai")
        if provider == "anthropic":
            provider_apps.add("anthropic")
        ai_connections = _filter_assets_by_app(connections, app_names=provider_apps)
        ai_credentials = _filter_assets_by_app(credentials, app_names=provider_apps)
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
                "options": [_to_option("", "No saved connection"), *[_to_option(asset["name"], asset["name"]) for asset in ai_connections]],
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
                "options": [_to_option("", "No explicit credential"), *[_to_option(asset["name"], asset["name"]) for asset in ai_credentials]],
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

    if node_type in {"ai_chat_model", "ai_summarize", "ai_extract", "ai_classify", "ai_sentiment"}:
        provider = str(config.get("provider") or "openai").lower()
        provider_apps = {provider}
        ai_connections = _filter_assets_by_app(connections, app_names=provider_apps)
        ai_credentials = _filter_assets_by_app(credentials, app_names=provider_apps)
        return [
            {
                "key": "connection_name",
                "label": "Connection",
                "type": "select",
                "required": False,
                "help": "Pick a saved provider connection from Vault.",
                "value": config.get("connection_name"),
                "options": [_to_option("", "No saved connection"), *[_to_option(asset["name"], asset["name"]) for asset in ai_connections]],
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
                "options": [_to_option("", "No explicit credential"), *[_to_option(asset["name"], asset["name"]) for asset in ai_credentials]],
                "bindable": True,
                "binding_kinds": ["credential"],
                "source": "vault",
            },
        ]

    return []


def _group_fields(node_type: str, fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Organise fields into UI sections.

    Uses *consumed‑key tracking* so that every field appears in exactly one
    section — no matter whether the match is by explicit key set or by group
    attribute.  Earlier sections take priority.
    """
    config_fields = list(fields)

    def _pick(pool: list[dict[str, Any]], *, keys: set[str] | None = None, group: str | None = None, groups: set[str] | None = None, exclude_keys: set[str] | None = None) -> list[dict[str, Any]]:
        """Return fields from *pool* that match, and **remove** them in place."""
        matched: list[dict[str, Any]] = []
        remaining: list[dict[str, Any]] = []
        for f in pool:
            hit = False
            if keys and f["key"] in keys:
                hit = True
            if group and f.get("group") == group:
                hit = True
            if groups and f.get("group") in groups:
                hit = True
            if exclude_keys and f["key"] in exclude_keys:
                hit = False
            if hit:
                matched.append(f)
            else:
                remaining.append(f)
        pool.clear()
        pool.extend(remaining)
        return matched

    if node_type == "trigger":
        entry_keys = {"source"}
        entry_fields = _pick(config_fields, keys=entry_keys)
        chat_keys = {
            "chat_public",
            "chat_mode",
            "chat_authentication",
            "chat_load_previous_session",
            "chat_response_mode",
            "chat_initial_messages",
            "chat_title",
            "chat_subtitle",
            "chat_input_placeholder",
            "chat_allowed_origins",
            "chat_require_button_click",
        }
        chat_fields = _pick(config_fields, keys=chat_keys)
        webhook_keys = {"webhook_path", "webhook_method", "webhook_auth", "webhook_secret", "respond_immediately"}
        webhook_fields = _pick(config_fields, keys=webhook_keys)
        schedule_keys = {"frequency", "time", "timezone", "cron_expression", "day_of_week"}
        schedule_fields = _pick(config_fields, keys=schedule_keys)
        event_keys = {"event_source", "event_filter"}
        event_fields = _pick(config_fields, keys=event_keys)
        form_keys = {"form_title", "form_description", "form_fields", "form_submit_label"}
        form_fields = _pick(config_fields, keys=form_keys)
        email_keys = {"imap_host", "imap_port", "email_credential", "email_folder"}
        email_fields = _pick(config_fields, keys=email_keys)
        secs: list[dict[str, Any]] = [
            {"id": "entry", "title": "Entry", "description": "Choose how the workflow begins.", "fields": entry_fields},
        ]
        if chat_fields:
            secs.append({"id": "chat", "title": "Chat Trigger", "description": "Public chat access, response mode, session memory, and hosted UI copy.", "fields": chat_fields})
        if webhook_fields:
            secs.append({"id": "webhook", "title": "Webhook", "description": "Endpoint path, method, and authentication.", "fields": webhook_fields})
        if schedule_fields:
            secs.append({"id": "schedule", "title": "Schedule", "description": "Frequency, run time, and timezone.", "fields": schedule_fields})
        if event_fields:
            secs.append({"id": "event", "title": "Event", "description": "Event source and filter criteria.", "fields": event_fields})
        if form_fields:
            secs.append({"id": "form", "title": "Form", "description": "Form title, description, and fields.", "fields": form_fields})
        if email_fields:
            secs.append({"id": "email", "title": "Email (IMAP)", "description": "IMAP server, credentials, and folder.", "fields": email_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type == "llm":
        provider_keys = {"provider", "model", "connection_name", "credential_name", "model_variable_name", "custom_model", "operation"}
        provider_fields = _pick(config_fields, keys=provider_keys)
        prompt_keys = {"system_message", "messages", "prompt"}
        prompt_fields = _pick(config_fields, keys=prompt_keys)
        model_params = _pick(config_fields, group="Model Parameters")
        output_opts = _pick(config_fields, group="Output Options")
        advanced = _pick(config_fields, group="Advanced")
        sections_out: list[dict[str, Any]] = [
            {"id": "provider", "title": "Provider & Model", "description": "Choose a provider, model, and saved auth sources.", "fields": provider_fields},
            {"id": "prompt", "title": "Prompt & Messages", "description": "System message, user prompt, and conversation history.", "fields": prompt_fields},
        ]
        if model_params:
            sections_out.append({"id": "model_params", "title": "Model Parameters", "description": "Temperature, tokens, penalties, and sampling controls.", "fields": model_params})
        if output_opts:
            sections_out.append({"id": "output", "title": "Output Options", "description": "Response format and storage.", "fields": output_opts})
        if advanced:
            sections_out.append({"id": "advanced", "title": "Advanced", "description": "Streaming, custom endpoints, and metadata.", "fields": advanced})
        if config_fields:
            sections_out.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return sections_out
    if node_type == "http_request":
        request_fields = _pick(config_fields, keys={"credential", "method", "url", "send_query", "query_params"})
        payload_fields = _pick(config_fields, keys={"send_headers", "headers", "send_body", "body_content_type", "body"})
        auth_fields = _pick(config_fields, group="Authentication")
        response_fields = _pick(config_fields, groups={"Response", "Options"})
        return [
            {"id": "request", "title": "Request", "description": "Method, endpoint, and credential defaults.", "fields": request_fields},
            {"id": "payload", "title": "Headers & body", "description": "Compose headers, query params, and request body content.", "fields": payload_fields},
            {"id": "auth", "title": "Authentication", "description": "Manual auth overrides and security settings.", "fields": auth_fields},
            {"id": "response", "title": "Response & options", "description": "Control parsing, timeouts, redirects, and network behavior.", "fields": response_fields},
        ]
    if node_type == "ai_agent":
        strategy_keys = {"agent_type", "prompt_source", "prompt", "require_specific_output", "provider", "model", "connection_name", "credential_name", "model_variable_name", "credential_id", "system_message"}
        strategy = _pick(config_fields, keys=strategy_keys)
        tools = _pick(config_fields, group="Tools")
        options = _pick(config_fields, group="Options")
        memory = _pick(config_fields, group="Memory")
        cluster = _pick(config_fields, group="Cluster")
        output = _pick(config_fields, group="Output")
        return [
            {"id": "strategy", "title": "Strategy", "description": "Choose the agent mode, provider, model, and top-level instruction.", "fields": strategy},
            {"id": "tools", "title": "Tools & permissions", "description": "Control tool availability and what the agent is allowed to do.", "fields": tools},
            {"id": "options", "title": "Options", "description": "Max iterations, temperature, tokens, and intermediate step output.", "fields": options},
            {"id": "memory", "title": "Memory", "description": "Persist conversational context between runs when needed.", "fields": memory},
            {"id": "cluster", "title": "Cluster", "description": "Optional sub-agents and delegation strategy for multi-agent workflows.", "fields": cluster},
            {"id": "output", "title": "Output", "description": "Shape the final response format.", "fields": output},
        ]
    if node_type == "output":
        dest_fields = _pick(config_fields, keys={"destination", "credential", "channel", "webhook_url"})
        msg_fields = _pick(config_fields, keys={"message"})
        option_fields = _pick(config_fields, group="Options")
        secs: list[dict[str, Any]] = [
            {"id": "destination", "title": "Destination", "description": "Choose where the workflow sends its result.", "fields": dest_fields},
        ]
        if msg_fields:
            secs.append({"id": "message", "title": "Message", "description": "Compose the output content.", "fields": msg_fields})
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Output format, headers, and metadata.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type == "human":
        task_fields = _pick(config_fields, keys={"title", "instructions", "choices"})
        assign_fields = _pick(config_fields, keys={"priority", "assignee_email", "assignee_role", "due_hours"})
        option_fields = _pick(config_fields, group="Options")
        secs = [
            {"id": "task", "title": "Task", "description": "Define the review task and available decisions.", "fields": task_fields},
        ]
        if assign_fields:
            secs.append({"id": "assignment", "title": "Assignment", "description": "Who should handle this task and when.", "fields": assign_fields})
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Comments, escalation, and auto-approval.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type == "callback":
        cb_fields = _pick(config_fields, keys={"instructions", "expected_fields", "mode", "choices"})
        option_fields = _pick(config_fields, group="Options")
        secs = [
            {"id": "callback", "title": "Callback", "description": "Configure how external systems resume the flow.", "fields": cb_fields},
        ]
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Timeout and payload validation.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type in {"ai_summarize", "ai_extract", "ai_classify", "ai_sentiment"}:
        top_fields = _pick(config_fields, keys={f["key"] for f in config_fields if not f.get("group")})
        chunking_fields = _pick(config_fields, group="Chunking")
        option_fields = _pick(config_fields, group="Options")
        sections: list[dict[str, Any]] = [{"id": "main", "title": "Parameters", "description": None, "fields": top_fields}]
        if chunking_fields:
            sections.append({"id": "chunking", "title": "Chunking", "description": "How to split long documents into chunks.", "fields": chunking_fields})
        if option_fields:
            sections.append({"id": "options", "title": "Options", "description": "Advanced settings and output configuration.", "fields": option_fields})
        return sections
    if node_type == "condition":
        condition_fields = _pick(config_fields, keys={"field", "operator", "equals"})
        option_fields = _pick(config_fields, group="Options")
        secs: list[dict[str, Any]] = [
            {"id": "condition", "title": "Condition", "description": "Define the comparison that determines the branch.", "fields": condition_fields},
        ]
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Data type casting and multi-condition logic.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type == "code":
        script_fields = _pick(config_fields, keys={"language", "mode", "script"})
        exec_fields = _pick(config_fields, keys={"timeout"})
        option_fields = _pick(config_fields, group="Options")
        secs = [
            {"id": "script", "title": "Script", "description": "Language, execution mode, and your code.", "fields": script_fields},
        ]
        if exec_fields:
            secs.append({"id": "execution", "title": "Execution", "description": "Timeout and resource constraints.", "fields": exec_fields})
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Allowed modules and memory limits.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type == "loop":
        iteration_fields = _pick(config_fields, keys={"items", "item_variable", "index_variable", "max_iterations"})
        processing_fields = _pick(config_fields, keys={"sub_prompt", "sub_template"})
        option_fields = _pick(config_fields, group="Options")
        secs = [
            {"id": "iteration", "title": "Iteration", "description": "Data source, variable names, and safety limits.", "fields": iteration_fields},
        ]
        if processing_fields:
            secs.append({"id": "processing", "title": "Processing", "description": "LLM prompt or template applied to each item.", "fields": processing_fields})
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Batch size, error handling, and result collection.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type == "delay":
        return [
            {"id": "timing", "title": "Timing", "description": "Configure when to resume execution.", "fields": config_fields},
        ]
    if node_type == "filter":
        filter_fields = _pick(config_fields, keys={"items", "field", "operator", "value"})
        option_fields = _pick(config_fields, group="Options")
        secs = [
            {"id": "filter", "title": "Filter condition", "description": "Define the criteria for keeping or removing items.", "fields": filter_fields},
        ]
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Keep/remove toggle and output storage.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type == "merge":
        source_fields = _pick(config_fields, keys={"mode", "sources", "join_field"})
        option_fields = _pick(config_fields, group="Options")
        secs = [
            {"id": "sources", "title": "Sources", "description": "Choose merge mode and data sources.", "fields": source_fields},
        ]
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Conflict resolution and output storage.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    if node_type == "transform":
        op_fields = _pick(config_fields, keys={"operation", "template", "fields_map", "rename_map", "remove_keys", "json_field", "output_key"})
        option_fields = _pick(config_fields, group="Options")
        secs = [
            {"id": "operation", "title": "Operation", "description": "Choose a transform and configure its inputs.", "fields": op_fields},
        ]
        if option_fields:
            secs.append({"id": "options", "title": "Options", "description": "Field retention and dot-notation access.", "fields": option_fields})
        if config_fields:
            secs.append({"id": "other", "title": "Other", "description": None, "fields": config_fields})
        return secs
    return [{"id": "general", "title": "General settings", "description": None, "fields": config_fields}]


def _sample_output(node_type: str, config: dict[str, Any]) -> dict[str, Any]:
    if "_pinned_data" in config:
        pinned_value = config.get("_pinned_data")
        return pinned_value if isinstance(pinned_value, dict) else {"value": pinned_value}
    if node_type == "trigger":
        return {"received": True, "source": config.get("source", "manual")}
    if node_type == "transform":
        return {"message": config.get("template") or "Transformed workflow payload"}
    if node_type == "condition":
        return {"matched": True, "branch": "true"}
    if node_type == "llm":
        return {"text": "Drafted model response", "provider": config.get("provider"), "model": config.get("model")}
    if node_type == "http_request":
        return {"status_code": 200, "url": config.get("url"), "body": {"ok": True}}
    if node_type == "ai_agent":
        return {"text": "Agent completed the task.", "model": config.get("model"), "tool_calls": list(config.get("tools") or [])[:3]}
    if node_type == "ai_summarize":
        return {"summary": "Condensed summary of the input text.", "model": config.get("model"), "method": config.get("summarization_method", "map_reduce")}
    if node_type == "ai_extract":
        return {"extracted": {"name": "John Doe", "email": "john@example.com"}, "model": config.get("model")}
    if node_type == "ai_classify":
        return {"category": "Positive", "confidence": 0.92, "model": config.get("model")}
    if node_type == "ai_sentiment":
        return {"sentiment": "positive", "score": 0.87, "explanation": "The text conveys a positive tone.", "model": config.get("model")}
    if node_type == "ai_chat_model":
        return {"provider": config.get("provider"), "model": config.get("model"), "ready": True}
    if node_type == "ai_memory":
        return {"memory_type": config.get("memory_type"), "session_key": config.get("session_key"), "ready": True}
    if node_type == "ai_tool":
        return {"tool_name": config.get("tool_name"), "tool_type": config.get("tool_type"), "ready": True}
    if node_type == "ai_output_parser":
        return {"parser_type": config.get("parser_type"), "strict_mode": config.get("strict_mode", True), "ready": True}
    if node_type == "output":
        return {"delivered": True, "channel": config.get("channel") or "default"}
    if node_type == "delay":
        return {"wait_type": "delay", "resume_after": "2026-04-03T12:00:00Z"}
    if node_type == "human":
        return {"wait_type": "human", "choices": config.get("choices") or ["approved", "rejected"]}
    if node_type == "callback":
        return {"wait_type": "callback", "mode": config.get("mode") or "payload"}
    return {}


def _resolve_asset_reference(
    assets: list[dict[str, Any]],
    reference: Any,
) -> dict[str, Any] | None:
    asset_ref = str(reference or "").strip()
    if not asset_ref:
        return None
    return next(
        (
            asset
            for asset in assets
            if asset_ref in {str(asset.get("name") or ""), str(asset.get("id") or "")}
        ),
        None,
    )


def _normalize_binding_references(
    config: dict[str, Any],
    *,
    connections: list[dict[str, Any]],
    credentials: list[dict[str, Any]],
    variables: list[dict[str, Any]],
) -> dict[str, Any]:
    normalized = dict(config)

    selected_connection = _resolve_asset_reference(connections, normalized.get("connection_name"))
    if selected_connection is not None:
        normalized["connection_name"] = selected_connection["name"]

    credential_reference = (
        normalized.get("credential_name")
        or normalized.get("credential_id")
        or normalized.get("credential")
        or normalized.get("email_credential")
    )
    selected_credential = _resolve_asset_reference(credentials, credential_reference)
    if selected_credential is not None:
        normalized["credential_name"] = selected_credential["name"]

    selected_model_variable = _resolve_asset_reference(variables, normalized.get("model_variable_name"))
    if selected_model_variable is not None:
        normalized["model_variable_name"] = selected_model_variable["name"]

    selected_webhook_variable = _resolve_asset_reference(variables, normalized.get("webhook_variable_name"))
    if selected_webhook_variable is not None:
        normalized["webhook_variable_name"] = selected_webhook_variable["name"]

    return normalized


def _apply_binding_hints(
    node_type: str,
    config: dict[str, Any],
    *,
    connections: list[dict[str, Any]],
    credentials: list[dict[str, Any]],
    variables: list[dict[str, Any]],
) -> dict[str, Any]:
    enriched = _normalize_binding_references(
        config,
        connections=connections,
        credentials=credentials,
        variables=variables,
    )

    if node_type in {"llm", "ai_agent", "ai_chat_model", "ai_summarize", "ai_extract", "ai_classify", "ai_sentiment"}:
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
    if node_type in {"llm", "ai_agent", "ai_chat_model", "ai_summarize", "ai_extract", "ai_classify", "ai_sentiment"}:
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


# ── Universal node settings (n8n-style) ──────────────────────────────────────

_NODE_SETTINGS_FIELDS: list[dict[str, Any]] = [
    {
        "key": "_enabled",
        "label": "Enabled",
        "type": "boolean",
        "default": True,
        "help": "Disable to skip this step during execution.",
        "group": "General",
    },
    {
        "key": "_always_output_data",
        "label": "Always Output Data",
        "type": "boolean",
        "default": False,
        "help": "Always pass data to the next step even when this step returns no data.",
        "group": "General",
    },
    {
        "key": "_execute_once",
        "label": "Execute Once",
        "type": "boolean",
        "default": False,
        "help": "Run this step only once, regardless of the number of input items.",
        "group": "General",
    },
    {
        "key": "_notes",
        "label": "Notes",
        "type": "textarea",
        "default": "",
        "help": "Add a note describing what this step does.",
        "group": "General",
    },
    {
        "key": "_display_note",
        "label": "Display Note in Flow",
        "type": "boolean",
        "default": False,
        "help": "Show the note text on the canvas node.",
        "group": "General",
    },
    {
        "key": "_continue_on_fail",
        "label": "Continue on Fail",
        "type": "boolean",
        "default": False,
        "help": "Continue workflow execution even if this step fails.",
        "group": "Error Handling",
    },
    {
        "key": "_on_error",
        "label": "On Error",
        "type": "select",
        "default": "stop",
        "options": [
            {"value": "stop", "label": "Stop Workflow"},
            {"value": "continue", "label": "Continue"},
            {"value": "continue_default", "label": "Continue with Default Output"},
        ],
        "help": "What to do when this step encounters an error.",
        "group": "Error Handling",
    },
    {
        "key": "_retry_on_fail",
        "label": "Retry on Fail",
        "type": "boolean",
        "default": False,
        "help": "Automatically retry this step if it fails.",
        "group": "Error Handling",
    },
    {
        "key": "_max_retries",
        "label": "Max Retries",
        "type": "number",
        "default": 3,
        "min": 1,
        "max": 10,
        "help": "Maximum number of retry attempts.",
        "group": "Error Handling",
        "show_when": {"field": "_retry_on_fail", "equals": True},
    },
    {
        "key": "_retry_wait_ms",
        "label": "Retry Wait",
        "type": "number",
        "default": 1000,
        "min": 100,
        "max": 60000,
        "suffix": "ms",
        "help": "Time to wait between retries.",
        "group": "Error Handling",
        "show_when": {"field": "_retry_on_fail", "equals": True},
    },
    {
        "key": "_retry_backoff",
        "label": "Backoff",
        "type": "select",
        "default": "fixed",
        "options": [
            {"value": "fixed", "label": "Fixed Interval"},
            {"value": "exponential", "label": "Exponential Backoff"},
            {"value": "exponential_jitter", "label": "Exponential + Jitter"},
        ],
        "help": "Retry timing strategy.",
        "group": "Error Handling",
        "show_when": {"field": "_retry_on_fail", "equals": True},
    },
    {
        "key": "_timeout_seconds",
        "label": "Timeout",
        "type": "number",
        "default": 300,
        "min": 1,
        "max": 3600,
        "suffix": "sec",
        "help": "Maximum time this step is allowed to run.",
        "group": "Error Handling",
    },
]


def _build_node_settings(config: dict[str, Any]) -> list[dict[str, Any]]:
    """Return universally applicable node settings grouped into sections."""
    groups: dict[str, list[dict[str, Any]]] = {}
    for field_def in _NODE_SETTINGS_FIELDS:
        field = dict(field_def)
        field["value"] = config.get(field["key"], field.get("default"))
        field.setdefault("options", [])
        field.setdefault("bindable", False)
        field.setdefault("source", "settings")
        group_key = field.pop("group", "General")
        groups.setdefault(group_key, []).append(field)
    return [
        {"id": "settings_general", "title": "General", "description": "Node identity and behaviour toggles.", "fields": groups.get("General", [])},
        {"id": "settings_error", "title": "Error Handling", "description": "Error recovery, retries, and timeouts.", "fields": groups.get("Error Handling", [])},
    ]


def build_node_editor_response(
    node_type: str,
    *,
    config: dict[str, Any] | None = None,
    workflow_trigger_type: str | None = None,
    workflow_definition: dict[str, Any] | None = None,
    current_step_id: str | None = None,
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
    current_config = _normalize_binding_references(
        dict(normalized.get("config") or {}),
        connections=connections,
        credentials=credentials,
        variables=variables,
    )

    base_fields = []
    for field in definition["fields"]:
        field_copy = dict(field)
        field_value = current_config.get(field["key"])
        if field_copy.get("type") == "credential":
            if field_value in (None, ""):
                field_value = (
                    current_config.get("credential_name")
                    or current_config.get("credential_id")
                    or current_config.get("credential")
                    or current_config.get("email_credential")
                )
            selected_credential = _resolve_asset_reference(credentials, field_value)
            if selected_credential is not None:
                field_value = selected_credential["name"]
        field_copy["value"] = field_value
        field_copy.setdefault("options", list(field.get("options") or []))
        field_copy.setdefault("bindable", False)
        field_copy.setdefault("binding_kinds", [])
        field_copy.setdefault("source", "static")
        field_copy.setdefault("placeholder", None)
        if node_type in {"llm", "ai_agent", "ai_chat_model", "ai_summarize", "ai_extract", "ai_classify", "ai_sentiment"} and field_copy["key"] == "model":
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
    # Deduplicate: when vault dynamic fields provide credential/connection
    # selectors, suppress base-definition fields that serve the same purpose.
    dynamic_keys = {f["key"] for f in dynamic_fields}
    dedup_pairs = [
        ("credential_id", "credential_name"),  # vault credential replaces inline cred
        ("credential", "credential_name"),
    ]
    suppressed: set[str] = set()
    for base_key, dyn_key in dedup_pairs:
        if dyn_key in dynamic_keys:
            suppressed.add(base_key)
    all_fields = [f for f in base_fields if f["key"] not in suppressed] + dynamic_fields
    sections = _group_fields(node_type, all_fields)

    # Universal node settings (n8n-style), returned separately so the
    # frontend Settings tab can render them without mixing into Parameters.
    node_settings = _build_node_settings(current_config)

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
    data_references = _workflow_data_references(workflow_definition, current_step_id)

    return {
        "node_type": node_type,
        "label": definition["label"],
        "description": definition["description"],
        "icon": definition["icon"],
        "step_name_default": step_name or definition["label"],
        "sections": sections,
        "node_settings": node_settings,
        "warnings": warnings,
        "sample_output": _sample_output(node_type, current_config),
        "available_bindings": available_bindings,
        "data_references": data_references,
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
        "data_source": "pinned" if "_pinned_data" in resolved_config else "live",
        "warnings": [
            *editor["warnings"],
            *(["Pinned data will be used for editor tests and manual runs."] if "_pinned_data" in resolved_config else []),
        ],
    }
