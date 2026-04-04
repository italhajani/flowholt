from __future__ import annotations

from typing import Any


NODE_DEFINITIONS: list[dict[str, Any]] = [
    {
        "type": "trigger",
        "label": "Trigger",
        "category": "Start",
        "description": "Start a workflow from a manual, webhook, schedule, or event source.",
        "icon": "zap",
        "supports_branches": False,
        "fields": [
            {
                "key": "source",
                "label": "Trigger source",
                "type": "select",
                "required": True,
                "default": "manual",
                "options": [
                    {"value": "manual", "label": "Manual"},
                    {"value": "webhook", "label": "Webhook"},
                    {"value": "schedule", "label": "Schedule"},
                    {"value": "event", "label": "Event"},
                ],
                "help": "Choose how this workflow starts.",
            },
            {
                "key": "webhook_path",
                "label": "Webhook path",
                "type": "string",
                "required": False,
                "help": "Optional custom path hint for incoming webhook triggers.",
            },
            {
                "key": "frequency",
                "label": "Schedule frequency",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "hourly", "label": "Hourly"},
                    {"value": "daily", "label": "Daily"},
                    {"value": "weekly", "label": "Weekly"},
                ],
            },
            {
                "key": "time",
                "label": "Run time",
                "type": "string",
                "required": False,
                "help": "For scheduled triggers, use a local time like 09:00.",
            },
        ],
    },
    {
        "type": "transform",
        "label": "Transform",
        "category": "Data",
        "description": "Map, reshape, or template payload data into the next step.",
        "icon": "wand",
        "supports_branches": False,
        "fields": [
            {
                "key": "template",
                "label": "Template",
                "type": "textarea",
                "required": True,
                "help": "Use {{field}} placeholders to reshape incoming payload data.",
            },
            {
                "key": "output_key",
                "label": "Store as",
                "type": "string",
                "required": False,
                "help": "Optional key name for downstream steps.",
            },
        ],
    },
    {
        "type": "condition",
        "label": "Condition",
        "category": "Logic",
        "description": "Branch the workflow based on field comparisons.",
        "icon": "git-branch",
        "supports_branches": True,
        "fields": [
            {
                "key": "field",
                "label": "Field",
                "type": "string",
                "required": True,
                "help": "Payload or context key to inspect.",
            },
            {
                "key": "operator",
                "label": "Operator",
                "type": "select",
                "required": True,
                "default": "equals",
                "options": [
                    {"value": "equals", "label": "Equals"},
                    {"value": "not_equals", "label": "Does not equal"},
                    {"value": "contains", "label": "Contains"},
                    {"value": "exists", "label": "Exists"},
                ],
            },
            {
                "key": "equals",
                "label": "Compare value",
                "type": "string",
                "required": False,
                "help": "Value used for equals, not equals, or contains.",
            },
        ],
    },
    {
        "type": "llm",
        "label": "AI Model",
        "category": "AI",
        "description": "Send context to a model provider and use the generated output downstream.",
        "icon": "sparkles",
        "supports_branches": False,
        "fields": [
            {
                "key": "provider",
                "label": "Provider",
                "type": "select",
                "required": True,
                "default": "openai",
                "options": [
                    {"value": "openai", "label": "OpenAI"},
                    {"value": "anthropic", "label": "Anthropic"},
                    {"value": "ollama", "label": "Ollama"},
                    {"value": "custom", "label": "Custom LLM"},
                ],
            },
            {
                "key": "model",
                "label": "Model",
                "type": "string",
                "required": False,
                "help": "Model or deployment identifier for the selected provider.",
            },
            {
                "key": "prompt",
                "label": "Prompt",
                "type": "textarea",
                "required": True,
                "help": "Instructions sent to the model. Variables can reference payload fields.",
            },
            {
                "key": "temperature",
                "label": "Temperature",
                "type": "number",
                "required": False,
                "default": 0.2,
            },
            {
                "key": "max_tokens",
                "label": "Max tokens",
                "type": "number",
                "required": False,
                "default": 800,
            },
        ],
    },
    {
        "type": "output",
        "label": "Output",
        "category": "Action",
        "description": "Send the final or intermediate result to a channel, endpoint, or queue.",
        "icon": "send",
        "supports_branches": False,
        "fields": [
            {
                "key": "channel",
                "label": "Channel",
                "type": "string",
                "required": True,
                "help": "Target channel, queue, or destination key.",
            },
            {
                "key": "message",
                "label": "Message override",
                "type": "textarea",
                "required": False,
                "help": "Optional message body if you do not want the default context summary.",
            },
            {
                "key": "webhook_url",
                "label": "Webhook URL",
                "type": "string",
                "required": False,
                "help": "Optional URL for outbound webhook delivery.",
            },
        ],
    },
    {
        "type": "delay",
        "label": "Delay",
        "category": "Control Flow",
        "description": "Pause execution and resume later without blocking the worker.",
        "icon": "clock-3",
        "supports_branches": False,
        "fields": [
            {"key": "seconds", "label": "Seconds", "type": "number", "required": False, "default": 0},
            {"key": "minutes", "label": "Minutes", "type": "number", "required": False, "default": 0},
            {"key": "hours", "label": "Hours", "type": "number", "required": False, "default": 0},
        ],
    },
    {
        "type": "human",
        "label": "Human Task",
        "category": "Approvals",
        "description": "Create a task for a human reviewer and resume when they respond.",
        "icon": "users",
        "supports_branches": True,
        "fields": [
            {"key": "title", "label": "Task title", "type": "string", "required": True},
            {"key": "instructions", "label": "Instructions", "type": "textarea", "required": True},
            {
                "key": "choices",
                "label": "Choices",
                "type": "tags",
                "required": True,
                "default": ["approved", "rejected"],
                "help": "Allowed decision paths for the reviewer.",
            },
            {
                "key": "priority",
                "label": "Priority",
                "type": "select",
                "required": False,
                "default": "normal",
                "options": [
                    {"value": "low", "label": "Low"},
                    {"value": "normal", "label": "Normal"},
                    {"value": "high", "label": "High"},
                ],
            },
            {"key": "assignee_email", "label": "Assignee email", "type": "string", "required": False},
            {"key": "assignee_role", "label": "Assignee role", "type": "select", "required": False, "options": [
                {"value": "owner", "label": "Owner"},
                {"value": "admin", "label": "Admin"},
                {"value": "builder", "label": "Builder"},
            ]},
            {"key": "due_hours", "label": "Due in hours", "type": "number", "required": False},
        ],
    },
    {
        "type": "callback",
        "label": "Callback Wait",
        "category": "Integrations",
        "description": "Pause until an external system calls back with payload or a decision.",
        "icon": "link",
        "supports_branches": False,
        "fields": [
            {"key": "instructions", "label": "Instructions", "type": "textarea", "required": True},
            {"key": "expected_fields", "label": "Expected fields", "type": "tags", "required": False},
            {
                "key": "mode",
                "label": "Resume mode",
                "type": "select",
                "required": False,
                "default": "payload",
                "options": [
                    {"value": "payload", "label": "Payload"},
                    {"value": "decision", "label": "Decision"},
                ],
            },
            {"key": "choices", "label": "Decision choices", "type": "tags", "required": False},
        ],
    },
]


NODE_REGISTRY = {item["type"]: item for item in NODE_DEFINITIONS}


def list_node_definitions() -> list[dict[str, Any]]:
    return NODE_DEFINITIONS


def get_node_definition(node_type: str) -> dict[str, Any] | None:
    return NODE_REGISTRY.get(node_type)


def _infer_field_default(
    step: dict[str, Any],
    field: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
) -> Any | None:
    node_type = str(step.get("type") or "")
    key = str(field.get("key") or "")
    step_name = str(step.get("name") or "").strip()

    if node_type == "trigger" and key == "source":
        return workflow_trigger_type or "manual"
    if node_type == "transform" and key == "template":
        return f"Transform the workflow payload for {step_name or 'the next step'}."
    if node_type == "condition" and key == "field":
        return "status"
    if node_type == "llm" and key == "prompt":
        return f"Complete the '{step_name or 'AI'}' step using the current workflow context."
    if node_type == "output" and key == "channel":
        return "default"
    if node_type == "human" and key == "title":
        return step_name or "Review task"
    if node_type == "human" and key == "instructions":
        return "Review this item and choose the next path."
    if node_type == "callback" and key == "instructions":
        return "Resume this workflow when the external callback arrives."
    return None


def normalize_workflow_definition(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
) -> dict[str, Any]:
    normalized_steps: list[dict[str, Any]] = []

    for step in definition.get("steps", []):
        node_type = str(step.get("type") or "")
        node_definition = get_node_definition(node_type)
        config = dict(step.get("config") or {})

        if node_definition is not None:
            for field in node_definition["fields"]:
                key = field["key"]
                if key not in config and "default" in field:
                    default_value = field.get("default")
                    if isinstance(default_value, list):
                        config[key] = list(default_value)
                    elif isinstance(default_value, dict):
                        config[key] = dict(default_value)
                    else:
                        config[key] = default_value
                if key not in config:
                    inferred_default = _infer_field_default(step, field, workflow_trigger_type=workflow_trigger_type)
                    if inferred_default is not None:
                        config[key] = inferred_default

        if node_type == "trigger" and not config.get("source") and workflow_trigger_type:
            config["source"] = workflow_trigger_type
        if node_type == "condition" and "operator" not in config:
            config["operator"] = "equals"
        if node_type == "human" and not config.get("choices"):
            config["choices"] = ["approved", "rejected"]
        if node_type == "callback" and config.get("mode") == "decision" and not config.get("choices"):
            config["choices"] = ["approved", "rejected"]

        normalized_steps.append(
            {
                **step,
                "config": config,
            }
        )

    return {
        "steps": normalized_steps,
        "edges": list(definition.get("edges") or []),
    }


def _build_linear_edges(steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "id": f"edge-{steps[index]['id']}-{steps[index + 1]['id']}",
            "source": steps[index]["id"],
            "target": steps[index + 1]["id"],
            "label": None,
        }
        for index in range(len(steps) - 1)
    ]


def repair_workflow_definition(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
    template_definition: dict[str, Any] | None = None,
) -> tuple[dict[str, Any], list[str]]:
    actions: list[str] = []
    repaired = normalize_workflow_definition(definition, workflow_trigger_type=workflow_trigger_type)
    steps = list(repaired.get("steps") or [])
    edges = list(repaired.get("edges") or [])

    if not steps and template_definition and template_definition.get("steps"):
        repaired = normalize_workflow_definition(template_definition, workflow_trigger_type=workflow_trigger_type)
        steps = list(repaired.get("steps") or [])
        edges = list(repaired.get("edges") or [])
        actions.append("hydrated_from_template")

    if not steps:
        starter_trigger = {
            "id": "trigger-1",
            "type": "trigger",
            "name": "Start workflow",
            "config": {"source": workflow_trigger_type or "manual"},
        }
        starter_output = {
            "id": "output-1",
            "type": "output",
            "name": "Complete workflow",
            "config": {"channel": "default"},
        }
        steps = [starter_trigger, starter_output]
        edges = _build_linear_edges(steps)
        actions.append("seeded_starter_flow")

    trigger_steps = [step for step in steps if str(step.get("type")) == "trigger"]
    if not trigger_steps:
        trigger_id = "trigger-auto"
        trigger_step = {
            "id": trigger_id,
            "type": "trigger",
            "name": "Workflow trigger",
            "config": {"source": workflow_trigger_type or "manual"},
        }
        first_step_id = steps[0]["id"]
        steps = [trigger_step, *steps]
        edges = [{"id": f"edge-{trigger_id}-{first_step_id}", "source": trigger_id, "target": first_step_id, "label": None}, *edges]
        actions.append("inserted_trigger_step")
        trigger_steps = [steps[0]]

    if len(trigger_steps) > 1:
        primary_trigger_id = str(trigger_steps[0]["id"])
        rewritten_steps: list[dict[str, Any]] = []
        for step in steps:
            if str(step.get("type")) == "trigger" and str(step.get("id")) != primary_trigger_id:
                rewritten_steps.append(
                    {
                        **step,
                        "type": "transform",
                        "name": f"{step.get('name') or 'Trigger'} follow-up",
                        "config": {
                            **dict(step.get("config") or {}),
                            "template": f"Continue the workflow after {step.get('name') or 'the previous step'}.",
                        },
                    }
                )
            else:
                rewritten_steps.append(step)
        steps = rewritten_steps
        actions.append("demoted_extra_triggers")

    if workflow_trigger_type:
        rewritten_steps = []
        trigger_source_fixed = False
        for step in steps:
            if str(step.get("type")) == "trigger":
                config = dict(step.get("config") or {})
                if config.get("source") != workflow_trigger_type:
                    config["source"] = workflow_trigger_type
                    trigger_source_fixed = True
                rewritten_steps.append({**step, "config": config})
            else:
                rewritten_steps.append(step)
        if trigger_source_fixed:
            steps = rewritten_steps
            actions.append("aligned_trigger_source")

    if len(steps) > 1 and not edges:
        edges = _build_linear_edges(steps)
        actions.append("rebuilt_linear_edges")

    repaired = normalize_workflow_definition(
        {
            "steps": steps,
            "edges": edges,
        },
        workflow_trigger_type=workflow_trigger_type,
    )
    return repaired, actions


def validate_workflow_definition(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
) -> dict[str, Any]:
    definition = normalize_workflow_definition(definition, workflow_trigger_type=workflow_trigger_type)
    issues: list[dict[str, Any]] = []
    steps = definition.get("steps", [])
    edges = definition.get("edges", [])

    step_ids = [step.get("id") for step in steps]
    edge_ids = [edge.get("id") for edge in edges]
    step_lookup = {step.get("id"): step for step in steps if step.get("id")}
    outgoing: dict[str, list[dict[str, Any]]] = {}
    incoming_count: dict[str, int] = {}

    if len(step_ids) != len({item for item in step_ids if item}):
        issues.append({"level": "error", "code": "duplicate_step_id", "message": "Workflow step ids must be unique."})
    if len(edge_ids) != len({item for item in edge_ids if item}):
        issues.append({"level": "error", "code": "duplicate_edge_id", "message": "Workflow edge ids must be unique."})
    if not steps:
        issues.append({"level": "error", "code": "missing_steps", "message": "Workflow must contain at least one node."})

    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")
        if source not in step_lookup:
            issues.append({"level": "error", "code": "missing_edge_source", "message": f"Edge source '{source}' does not exist.", "edge_id": edge.get("id")})
        if target not in step_lookup:
            issues.append({"level": "error", "code": "missing_edge_target", "message": f"Edge target '{target}' does not exist.", "edge_id": edge.get("id")})
        outgoing.setdefault(str(source), []).append(edge)
        incoming_count[str(target)] = incoming_count.get(str(target), 0) + 1

    trigger_steps = [step for step in steps if step.get("type") == "trigger"]
    if len(trigger_steps) == 0:
        issues.append({"level": "warning", "code": "missing_trigger", "message": "Workflows usually start with a trigger node."})
    elif len(trigger_steps) > 1:
        issues.append({"level": "warning", "code": "multiple_triggers", "message": "Multiple trigger nodes were found. Most workflow tools use one primary trigger."})

    if workflow_trigger_type and trigger_steps:
        trigger_source = str(trigger_steps[0].get("config", {}).get("source") or workflow_trigger_type)
        if workflow_trigger_type != trigger_source and trigger_source not in {"manual", "event"}:
            issues.append({
                "level": "warning",
                "code": "trigger_type_mismatch",
                "message": f"Workflow trigger_type '{workflow_trigger_type}' does not match trigger node source '{trigger_source}'.",
                "step_id": trigger_steps[0].get("id"),
            })

    entry_steps = [step for step in steps if incoming_count.get(str(step.get("id")), 0) == 0]
    if not entry_steps and steps:
        issues.append({"level": "warning", "code": "no_entry_step", "message": "No clear entry node was found. The graph may contain a cycle."})

    for step in steps:
        step_id = str(step.get("id") or "")
        node_type = str(step.get("type") or "")
        config = step.get("config", {}) or {}
        node_definition = get_node_definition(node_type)
        if node_definition is None:
            issues.append({"level": "error", "code": "unknown_node_type", "message": f"Unsupported node type '{node_type}'.", "step_id": step_id})
            continue

        for field in node_definition["fields"]:
            key = field["key"]
            required = bool(field.get("required"))
            field_type = field["type"]
            value = config.get(key)
            if required and (value is None or value == "" or value == []):
                issues.append({"level": "error", "code": "missing_required_field", "message": f"{node_definition['label']} requires '{key}'.", "step_id": step_id, "field": key})
                continue
            if value is None:
                continue
            if field_type in {"string", "textarea", "select"} and not isinstance(value, str):
                issues.append({"level": "error", "code": "invalid_field_type", "message": f"Field '{key}' must be a string.", "step_id": step_id, "field": key})
            elif field_type == "number" and not isinstance(value, (int, float)):
                issues.append({"level": "error", "code": "invalid_field_type", "message": f"Field '{key}' must be numeric.", "step_id": step_id, "field": key})
            elif field_type == "tags" and not isinstance(value, list):
                issues.append({"level": "error", "code": "invalid_field_type", "message": f"Field '{key}' must be a list.", "step_id": step_id, "field": key})

        if node_type == "condition":
            labels = {str(edge.get("label") or "").lower() for edge in outgoing.get(step_id, [])}
            if labels and not {"true", "false"}.issuperset(labels):
                issues.append({"level": "warning", "code": "condition_branch_labels", "message": "Condition branches should usually use 'true' and 'false' labels.", "step_id": step_id})
        if node_type == "human":
            choices = config.get("choices") or []
            if len(choices) < 2:
                issues.append({"level": "warning", "code": "human_choices_short", "message": "Human task nodes usually define at least two choices.", "step_id": step_id})
        if node_type == "delay":
            total = int(config.get("seconds") or 0) + int(config.get("minutes") or 0) + int(config.get("hours") or 0)
            if total <= 0:
                issues.append({"level": "error", "code": "delay_duration_missing", "message": "Delay nodes require a positive duration.", "step_id": step_id})
        if node_type == "callback":
            mode = str(config.get("mode") or "payload")
            if mode == "decision" and not config.get("choices"):
                issues.append({"level": "warning", "code": "callback_choices_missing", "message": "Decision-mode callback nodes should define choices.", "step_id": step_id})

    valid = not any(issue["level"] == "error" for issue in issues)
    return {
        "valid": valid,
        "issues": issues,
        "stats": {
            "steps_count": len(steps),
            "edges_count": len(edges),
            "entry_steps_count": len(entry_steps),
            "trigger_steps_count": len(trigger_steps),
        },
    }
