from __future__ import annotations

from typing import Any


INTEGRATION_APPS: list[dict[str, Any]] = [
    {
        "key": "slack",
        "label": "Slack",
        "category": "Communication",
        "auth_kind": "oauth",
        "node_types": ["output", "callback"],
        "description": "Post updates, route approvals, and coordinate human handoffs.",
        "operations": [
            {
                "key": "send_message",
                "label": "Send message",
                "direction": "action",
                "resource": "message",
                "description": "Send a message to a Slack channel.",
                "fields": [
                    {"key": "channel", "label": "Channel", "type": "string", "required": True, "help": "Slack channel name or ID."},
                    {"key": "message", "label": "Message", "type": "textarea", "required": True, "help": "Text to post to the channel."},
                    {"key": "thread_ts", "label": "Thread timestamp", "type": "string", "required": False, "help": "Optional thread timestamp for replies."},
                ],
            },
            {
                "key": "approval_buttons",
                "label": "Approval prompt",
                "direction": "callback",
                "resource": "interaction",
                "description": "Send an approval message and wait for a response.",
                "fields": [
                    {"key": "channel", "label": "Channel", "type": "string", "required": True, "help": "Where to send the approval message."},
                    {"key": "prompt", "label": "Prompt", "type": "textarea", "required": True, "help": "Message shown to the approver."},
                    {"key": "approve_label", "label": "Approve label", "type": "string", "required": False, "default": "Approve"},
                    {"key": "reject_label", "label": "Reject label", "type": "string", "required": False, "default": "Reject"},
                ],
            },
        ],
    },
    {
        "key": "webhook",
        "label": "Webhook",
        "category": "HTTP",
        "auth_kind": "none",
        "node_types": ["trigger", "output", "callback"],
        "description": "Receive JSON, send payloads, and wait for external callbacks.",
        "operations": [
            {
                "key": "receive_json",
                "label": "Receive JSON",
                "direction": "trigger",
                "resource": "request",
                "description": "Start a workflow from an inbound webhook.",
                "fields": [
                    {"key": "webhook_path", "label": "Webhook path", "type": "string", "required": False, "help": "Optional custom path suffix."},
                    {"key": "auth_mode", "label": "Auth mode", "type": "select", "required": False, "default": "signature", "options": [{"value": "none", "label": "None"}, {"value": "signature", "label": "Signed"}]},
                ],
            },
            {
                "key": "post_json",
                "label": "Send JSON",
                "direction": "action",
                "resource": "request",
                "description": "Send a JSON payload to an HTTP endpoint.",
                "fields": [
                    {"key": "webhook_url", "label": "URL", "type": "string", "required": True, "help": "Destination URL."},
                    {"key": "method", "label": "Method", "type": "select", "required": False, "default": "POST", "options": [{"value": "POST", "label": "POST"}, {"value": "PUT", "label": "PUT"}, {"value": "PATCH", "label": "PATCH"}]},
                    {"key": "message", "label": "Body template", "type": "textarea", "required": False, "help": "Optional JSON/body template."},
                ],
            },
            {
                "key": "resume_callback",
                "label": "Resume callback",
                "direction": "callback",
                "resource": "callback",
                "description": "Pause and resume the workflow from an external callback.",
                "fields": [
                    {"key": "instructions", "label": "Callback instructions", "type": "textarea", "required": True, "help": "What the external system should send back."},
                    {"key": "mode", "label": "Resume mode", "type": "select", "required": False, "default": "payload", "options": [{"value": "payload", "label": "Payload"}, {"value": "decision", "label": "Decision"}]},
                    {"key": "choices", "label": "Decision choices", "type": "tags", "required": False, "help": "Only used in decision mode."},
                ],
            },
        ],
    },
    {
        "key": "openai",
        "label": "OpenAI",
        "category": "AI",
        "auth_kind": "api_key",
        "node_types": ["llm"],
        "description": "Use saved OpenAI connections and model settings.",
        "operations": [
            {
                "key": "chat_completion",
                "label": "Chat completion",
                "direction": "ai",
                "resource": "completion",
                "description": "Generate text from a chat/completion prompt.",
                "fields": [
                    {"key": "model", "label": "Model", "type": "string", "required": False, "help": "Model id or deployment name."},
                    {"key": "temperature", "label": "Temperature", "type": "number", "required": False, "default": 0.2},
                    {"key": "max_tokens", "label": "Max tokens", "type": "number", "required": False, "default": 800},
                    {"key": "response_format", "label": "Response format", "type": "select", "required": False, "default": "text", "options": [{"value": "text", "label": "Text"}, {"value": "json", "label": "JSON"}]},
                ],
            }
        ],
    },
    {
        "key": "anthropic",
        "label": "Anthropic",
        "category": "AI",
        "auth_kind": "api_key",
        "node_types": ["llm"],
        "description": "Use saved Anthropic connections and Claude models.",
        "operations": [
            {
                "key": "messages_api",
                "label": "Messages API",
                "direction": "ai",
                "resource": "completion",
                "description": "Generate text with Claude models.",
                "fields": [
                    {"key": "model", "label": "Model", "type": "string", "required": False},
                    {"key": "temperature", "label": "Temperature", "type": "number", "required": False, "default": 0.2},
                    {"key": "max_tokens", "label": "Max tokens", "type": "number", "required": False, "default": 1000},
                ],
            }
        ],
    },
    {
        "key": "email",
        "label": "Email",
        "category": "Communication",
        "auth_kind": "token",
        "node_types": ["output"],
        "description": "Send email-style workflow notifications.",
        "operations": [
            {
                "key": "send_email",
                "label": "Send email",
                "direction": "action",
                "resource": "message",
                "description": "Send an email message.",
                "fields": [
                    {"key": "to", "label": "To", "type": "string", "required": True},
                    {"key": "subject", "label": "Subject", "type": "string", "required": True},
                    {"key": "message", "label": "Body", "type": "textarea", "required": True},
                ],
            }
        ],
    },
]


APP_REGISTRY = {item["key"]: item for item in INTEGRATION_APPS}


def list_integration_apps() -> list[dict[str, Any]]:
    apps: list[dict[str, Any]] = []
    for app in INTEGRATION_APPS:
        apps.append(
            {
                **{key: app[key] for key in ("key", "label", "category", "auth_kind", "node_types", "description")},
                "operations": [
                    {key: op[key] for key in ("key", "label", "direction", "description", "resource")}
                    for op in app["operations"]
                ],
            }
        )
    return apps


def get_integration_app(app_key: str) -> dict[str, Any] | None:
    app = APP_REGISTRY.get(app_key)
    if app is None:
        return None
    return {
        **{key: app[key] for key in ("key", "label", "category", "auth_kind", "node_types", "description")},
        "operations": [
            {key: op[key] for key in ("key", "label", "direction", "description", "resource", "fields")}
            for op in app["operations"]
        ],
    }


def get_integration_operation(app_key: str, operation_key: str) -> dict[str, Any] | None:
    app = APP_REGISTRY.get(app_key)
    if app is None:
        return None
    for op in app["operations"]:
        if op["key"] == operation_key:
            return {**op, "app": app_key}
    return None


def infer_app_and_operation(node_type: str, config: dict[str, Any] | None = None) -> tuple[str | None, str | None]:
    config = dict(config or {})
    app_key = str(config.get("app") or "").lower() or None
    operation_key = str(config.get("operation") or "").lower() or None

    if app_key is None:
        if node_type == "llm":
            provider = str(config.get("provider") or "").lower()
            if provider in APP_REGISTRY:
                app_key = provider
        elif node_type == "output":
            if config.get("to") or config.get("subject"):
                app_key = "email"
            elif config.get("webhook_url") or str(config.get("method") or "").upper() in {"POST", "PUT", "PATCH"}:
                app_key = "webhook"
            elif config.get("channel"):
                app_key = "slack"
        elif node_type == "callback":
            if str(config.get("connection_name") or "").lower().startswith("support escalation"):
                app_key = "slack"
            else:
                app_key = "webhook"
        elif node_type == "trigger":
            source = str(config.get("source") or "").lower()
            if source == "webhook":
                app_key = "webhook"

    if operation_key is None and app_key in APP_REGISTRY:
        operations = APP_REGISTRY[app_key]["operations"]
        for operation in operations:
            if operation["direction"] == "ai" and node_type == "llm":
                return app_key, operation["key"]
            if operation["direction"] == "callback" and node_type == "callback":
                return app_key, operation["key"]
            if operation["direction"] == "trigger" and node_type == "trigger":
                return app_key, operation["key"]
            if operation["direction"] == "action" and node_type == "output":
                return app_key, operation["key"]
        if operations:
            operation_key = operations[0]["key"]

    return app_key, operation_key


def normalize_integration_config(node_type: str, config: dict[str, Any] | None = None) -> dict[str, Any]:
    normalized = dict(config or {})
    app_key, operation_key = infer_app_and_operation(node_type, normalized)
    if app_key:
        normalized.setdefault("app", app_key)
    if operation_key:
        normalized.setdefault("operation", operation_key)

    operation = get_integration_operation(app_key or "", operation_key or "")
    if operation is not None:
        for field in operation["fields"]:
            key = field["key"]
            if key not in normalized and "default" in field:
                default_value = field.get("default")
                if isinstance(default_value, list):
                    normalized[key] = list(default_value)
                elif isinstance(default_value, dict):
                    normalized[key] = dict(default_value)
                else:
                    normalized[key] = default_value

    return normalized


def validate_integration_operation(node_type: str, config: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    normalized = normalize_integration_config(node_type, config)
    app_key = str(normalized.get("app") or "").lower() or None
    operation_key = str(normalized.get("operation") or "").lower() or None
    issues: list[dict[str, Any]] = []

    if app_key is None:
        return issues

    app = APP_REGISTRY.get(app_key)
    if app is None:
        issues.append({"level": "warning", "code": "integration_app_unknown", "message": "Selected integration app is not registered yet.", "field": "app"})
        return issues

    if node_type not in app["node_types"]:
        issues.append({"level": "error", "code": "integration_node_type_mismatch", "message": f"{app['label']} is not supported on {node_type} nodes.", "field": "app"})
        return issues

    operation = get_integration_operation(app_key, operation_key or "")
    if operation is None:
        issues.append({"level": "error", "code": "integration_operation_missing", "message": "Select a valid app operation for this node.", "field": "operation"})
        return issues

    for field in operation["fields"]:
        key = field["key"]
        if field.get("required") and normalized.get(key) in (None, "", []):
            issues.append(
                {
                    "level": "error",
                    "code": "integration_required_field_missing",
                    "message": f"{field['label']} is required for {operation['label']}.",
                    "field": key,
                }
            )

    if app_key == "webhook" and operation_key == "post_json" and not str(normalized.get("webhook_url") or "").startswith(("http://", "https://")):
        issues.append({"level": "warning", "code": "webhook_url_format", "message": "Webhook URLs usually start with http:// or https://.", "field": "webhook_url"})
    if app_key == "email" and operation_key == "send_email" and "@" not in str(normalized.get("to") or ""):
        issues.append({"level": "warning", "code": "email_to_format", "message": "Email recipients should contain @.", "field": "to"})
    if app_key == "slack" and normalized.get("channel") and not str(normalized.get("channel")).startswith(("#", "C")):
        issues.append({"level": "warning", "code": "slack_channel_format", "message": "Slack channels usually start with # or use a channel id.", "field": "channel"})

    return issues


def execute_integration_operation(
    node_type: str,
    config: dict[str, Any] | None = None,
    *,
    payload: dict[str, Any],
    context: dict[str, Any],
    llm_text: str | None = None,
) -> dict[str, Any] | None:
    normalized = normalize_integration_config(node_type, config)
    app_key = str(normalized.get("app") or "").lower() or None
    operation_key = str(normalized.get("operation") or "").lower() or None
    if app_key is None or operation_key is None:
        return None

    message = (
        normalized.get("message")
        or context.get("message")
        or context.get("text")
        or llm_text
        or payload.get("message")
        or "Workflow completed"
    )

    if node_type == "llm":
        if app_key in {"openai", "anthropic"}:
            return {
                "provider": app_key,
                "operation": operation_key,
                "model": normalized.get("model"),
                "text": llm_text or "",
                "response_format": normalized.get("response_format", "text"),
            }

    if node_type == "output":
        if app_key == "slack" and operation_key == "send_message":
            return {
                "app": "slack",
                "operation": "send_message",
                "channel": normalized.get("channel"),
                "message": message,
                "thread_ts": normalized.get("thread_ts"),
                "delivered": True,
            }
        if app_key == "webhook" and operation_key == "post_json":
            return {
                "app": "webhook",
                "operation": "post_json",
                "method": str(normalized.get("method") or "POST").upper(),
                "webhook_url": normalized.get("webhook_url"),
                "body": message,
                "delivered": True,
            }
        if app_key == "email" and operation_key == "send_email":
            return {
                "app": "email",
                "operation": "send_email",
                "to": normalized.get("to"),
                "subject": normalized.get("subject") or context.get("subject") or "FlowHolt notification",
                "body": message,
                "delivered": True,
            }

    if node_type == "callback":
        if app_key == "slack" and operation_key == "approval_buttons":
            return {
                "wait_type": "human",
                "channel": normalized.get("channel"),
                "instructions": normalized.get("prompt") or normalized.get("instructions") or "Review and choose a response.",
                "choices": [
                    normalized.get("approve_label") or "Approve",
                    normalized.get("reject_label") or "Reject",
                ],
                "title": normalized.get("title") or "Slack approval",
                "priority": normalized.get("priority") or "normal",
            }
        if app_key == "webhook" and operation_key == "resume_callback":
            return {
                "wait_type": "callback",
                "instructions": normalized.get("instructions") or "Waiting for callback.",
                "expected_fields": normalized.get("expected_fields") or [],
                "mode": normalized.get("mode") or "payload",
                "choices": normalized.get("choices") or [],
                "callback_owner": normalized.get("connection_name"),
            }

    if node_type == "trigger" and app_key == "webhook" and operation_key == "receive_json":
        return {
            "received": True,
            "source": "webhook",
            "webhook_path": normalized.get("webhook_path"),
            "auth_mode": normalized.get("auth_mode", "signature"),
        }

    return None


def resolve_dynamic_operation_fields(
    *,
    node_type: str,
    config: dict[str, Any] | None = None,
    connections: list[dict[str, Any]] | None = None,
    variables: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    config = dict(config or {})
    app_key = str(config.get("app") or "").lower() or None
    operation_key = str(config.get("operation") or "").lower() or None
    warnings: list[str] = []
    fields: list[dict[str, Any]] = []

    if app_key is None:
        return {"node_type": node_type, "app": None, "operation": None, "fields": [], "warnings": ["Select an app to load operation fields."]}

    app = APP_REGISTRY.get(app_key)
    if app is None:
        return {"node_type": node_type, "app": app_key, "operation": operation_key, "fields": [], "warnings": ["The selected app is not registered yet."]}

    if node_type not in app["node_types"]:
        warnings.append(f"{app['label']} is not normally used with {node_type} nodes.")

    if operation_key is None:
        default_op = app["operations"][0] if app["operations"] else None
        operation = default_op
    else:
        operation = next((op for op in app["operations"] if op["key"] == operation_key), None)

    if operation is None:
        warnings.append("Select an operation to load specific configuration fields.")
        return {"node_type": node_type, "app": app_key, "operation": operation_key, "fields": [], "warnings": warnings}

    variable_options = [
        {"value": asset["name"], "label": asset["name"]}
        for asset in (variables or [])
    ]
    connection_options = [
        {"value": asset["name"], "label": asset["name"]}
        for asset in (connections or [])
        if str(asset.get("app") or "").lower() == app_key or app_key in {"webhook", "email"}
    ]

    fields = [dict(field) for field in operation["fields"]]
    fields.insert(
        0,
        {
            "key": "connection_name",
            "label": "Saved connection",
            "type": "select",
            "required": False,
            "help": f"Use a saved {app['label']} connection when available.",
            "options": [{"value": "", "label": "No saved connection"}, *connection_options],
            "default": config.get("connection_name") or "",
            "source": "dynamic",
        },
    )
    if app_key in {"webhook", "slack", "email"}:
        fields.append(
            {
                "key": "message_variable",
                "label": "Message variable",
                "type": "select",
                "required": False,
                "help": "Optional shared variable to inject message or URL data.",
                "options": [{"value": "", "label": "No shared variable"}, *variable_options],
                "default": config.get("message_variable") or "",
                "source": "dynamic",
            }
        )

    return {
        "node_type": node_type,
        "app": app_key,
        "operation": operation["key"],
        "fields": fields,
        "warnings": warnings,
    }
