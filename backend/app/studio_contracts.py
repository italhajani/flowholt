from __future__ import annotations

from collections import defaultdict
from typing import Any


_CLUSTER_SLOT_LABELS = {
    "model": "Model",
    "memory": "Memory",
    "tool": "Tool",
    "output_parser": "Output Parser",
}

_CLUSTER_ROOT_SPECS = {
    "ai_agent": {
        "label": "AI Agent",
        "allowed_slots": {"model", "memory", "tool", "output_parser"},
        "required_slots": {"model", "tool"},
        "multi_slots": {"tool"},
    },
    "ai_summarize": {
        "label": "AI Summarize",
        "allowed_slots": {"model"},
        "required_slots": {"model"},
        "multi_slots": set(),
    },
    "ai_extract": {
        "label": "AI Extract",
        "allowed_slots": {"model", "output_parser"},
        "required_slots": {"model"},
        "multi_slots": set(),
    },
    "ai_classify": {
        "label": "AI Classify",
        "allowed_slots": {"model", "output_parser"},
        "required_slots": {"model"},
        "multi_slots": set(),
    },
    "ai_sentiment": {
        "label": "AI Sentiment",
        "allowed_slots": {"model"},
        "required_slots": {"model"},
        "multi_slots": set(),
    },
}

_CLUSTER_CHILD_SLOT_BY_TYPE = {
    "ai_chat_model": "model",
    "ai_memory": "memory",
    "ai_tool": "tool",
    "ai_output_parser": "output_parser",
}


def _slot_label(slot_key: str) -> str:
    return _CLUSTER_SLOT_LABELS.get(slot_key, slot_key.replace("_", " ").title())


def _issue(
    *,
    level: str,
    code: str,
    message: str,
    step: dict[str, Any],
    field: str | None = None,
) -> dict[str, Any]:
    return {
        "level": level,
        "code": code,
        "message": message,
        "field": field,
        "step_id": str(step.get("id") or ""),
        "step_name": str(step.get("name") or ""),
        "node_type": str(step.get("type") or ""),
    }


def validate_workflow_cluster_configuration(definition: dict[str, Any]) -> list[dict[str, Any]]:
    steps = [dict(step or {}) for step in (definition.get("steps") or [])]
    steps_by_id = {
        str(step.get("id") or ""): step
        for step in steps
        if str(step.get("id") or "")
    }
    children_by_parent: dict[str, dict[str, list[dict[str, Any]]]] = defaultdict(
        lambda: defaultdict(list)
    )
    issues: list[dict[str, Any]] = []

    for step in steps:
        step_id = str(step.get("id") or "")
        node_type = str(step.get("type") or "")
        config = dict(step.get("config") or {})
        parent_id_raw = config.get("cluster_parent_id")
        parent_id = str(parent_id_raw or "")
        slot_key = str(config.get("cluster_slot") or "")
        expected_slot = _CLUSTER_CHILD_SLOT_BY_TYPE.get(node_type)

        if expected_slot and not parent_id:
            issues.append(
                _issue(
                    level="error",
                    code="orphan_cluster_sub_node",
                    message=f"{step.get('name') or 'This sub-node'} must be attached to an AI root node.",
                    step=step,
                    field="cluster_parent_id",
                )
            )
            continue

        if (parent_id and not slot_key) or (slot_key and not parent_id):
            issues.append(
                _issue(
                    level="error",
                    code="incomplete_cluster_attachment",
                    message="Cluster attachments need both a parent node and a slot.",
                    step=step,
                    field="cluster_slot" if not slot_key else "cluster_parent_id",
                )
            )

        if not parent_id:
            continue

        parent_step = steps_by_id.get(parent_id)
        if parent_step is None:
            issues.append(
                _issue(
                    level="error",
                    code="cluster_parent_missing",
                    message="This attached AI node points to a parent that no longer exists.",
                    step=step,
                    field="cluster_parent_id",
                )
            )
            continue

        parent_type = str(parent_step.get("type") or "")
        parent_spec = _CLUSTER_ROOT_SPECS.get(parent_type)
        if parent_spec is None:
            issues.append(
                _issue(
                    level="error",
                    code="invalid_cluster_parent_type",
                    message=f"{parent_step.get('name') or 'This parent node'} does not support AI sub-node attachments.",
                    step=step,
                    field="cluster_parent_id",
                )
            )
            continue

        children_by_parent[parent_id][slot_key].append(step)

        if slot_key not in parent_spec["allowed_slots"]:
            issues.append(
                _issue(
                    level="error",
                    code="invalid_cluster_slot",
                    message=f"{parent_spec['label']} does not accept an attached {_slot_label(slot_key)} node.",
                    step=step,
                    field="cluster_slot",
                )
            )

        if expected_slot is None:
            issues.append(
                _issue(
                    level="error",
                    code="invalid_cluster_child_type",
                    message="Only AI sub-nodes can be attached into an AI cluster slot.",
                    step=step,
                    field="cluster_parent_id",
                )
            )
            continue

        if slot_key != expected_slot:
            issues.append(
                _issue(
                    level="error",
                    code="cluster_slot_mismatch",
                    message=f"{step.get('name') or 'This sub-node'} must use the {_slot_label(expected_slot)} slot.",
                    step=step,
                    field="cluster_slot",
                )
            )

    for step in steps:
        step_id = str(step.get("id") or "")
        node_type = str(step.get("type") or "")
        spec = _CLUSTER_ROOT_SPECS.get(node_type)
        if spec is None:
            continue

        attachments = children_by_parent.get(step_id, {})

        for required_slot in spec["required_slots"]:
            if attachments.get(required_slot):
                continue
            if required_slot == "tool":
                message = f"{spec['label']} requires at least one Tool sub-node."
            else:
                message = f"{spec['label']} requires an attached {_slot_label(required_slot)} sub-node."
            issues.append(
                _issue(
                    level="error",
                    code="required_cluster_slot_missing",
                    message=message,
                    step=step,
                    field=required_slot,
                )
            )

        for slot_key, attached_steps in attachments.items():
            if slot_key not in spec["allowed_slots"]:
                continue
            if slot_key in spec["multi_slots"] or len(attached_steps) <= 1:
                continue
            issues.append(
                _issue(
                    level="error",
                    code="duplicate_cluster_slot",
                    message=f"{spec['label']} only supports one attached {_slot_label(slot_key)} sub-node.",
                    step=step,
                    field=slot_key,
                )
            )

    return issues