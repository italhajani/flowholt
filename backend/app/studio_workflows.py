from __future__ import annotations

import copy
import uuid
from typing import Any

from .executor import run_workflow_definition


def _copy_definition(definition: dict[str, Any]) -> dict[str, Any]:
    return {
        "steps": [copy.deepcopy(step) for step in (definition.get("steps") or [])],
        "edges": [copy.deepcopy(edge) for edge in (definition.get("edges") or [])],
    }


def insert_step_into_definition(
    definition: dict[str, Any],
    step: dict[str, Any],
    *,
    after_step_id: str | None = None,
    branch_label: str | None = None,
    connect_to_step_id: str | None = None,
) -> dict[str, Any]:
    next_definition = _copy_definition(definition)
    next_definition["steps"].append(copy.deepcopy(step))

    if not after_step_id:
        if len(next_definition["steps"]) > 1:
            previous = next_definition["steps"][-2]
            next_definition["edges"].append(
                {
                    "id": f"edge-{previous['id']}-{step['id']}",
                    "source": previous["id"],
                    "target": step["id"],
                    "label": None,
                }
            )
        return next_definition

    normalized_label = None if branch_label in (None, "", "default") else branch_label
    outgoing = [
        edge
        for edge in next_definition["edges"]
        if edge["source"] == after_step_id and ((edge.get("label") or "").lower() == (normalized_label or "").lower())
    ]
    preserved_target = connect_to_step_id or (outgoing[0]["target"] if outgoing else None)

    next_definition["edges"] = [
        edge
        for edge in next_definition["edges"]
        if not (edge["source"] == after_step_id and ((edge.get("label") or "").lower() == (normalized_label or "").lower()))
    ]
    next_definition["edges"].append(
        {
            "id": f"edge-{after_step_id}-{step['id']}-{normalized_label or 'default'}",
            "source": after_step_id,
            "target": step["id"],
            "label": normalized_label,
        }
    )
    if preserved_target:
        next_definition["edges"].append(
            {
                "id": f"edge-{step['id']}-{preserved_target}",
                "source": step["id"],
                "target": preserved_target,
                "label": None,
            }
        )
    return next_definition


def update_step_in_definition(
    definition: dict[str, Any],
    step_id: str,
    *,
    name: str | None = None,
    config: dict[str, Any] | None = None,
    replace_config: bool = False,
) -> dict[str, Any]:
    next_definition = _copy_definition(definition)
    for index, step in enumerate(next_definition["steps"]):
        if step["id"] != step_id:
            continue
        merged = dict(step.get("config") or {})
        if config:
            merged = dict(config) if replace_config else {**merged, **config}
        next_definition["steps"][index] = {
            **step,
            "name": name or step["name"],
            "config": merged,
        }
        break
    return next_definition


def duplicate_step_in_definition(definition: dict[str, Any], step_id: str) -> tuple[dict[str, Any], str]:
    next_definition = _copy_definition(definition)
    original = next((step for step in next_definition["steps"] if step["id"] == step_id), None)
    if original is None:
        raise ValueError("Step not found")

    duplicate_id = f"step-{uuid.uuid4().hex[:10]}"
    position = dict((original.get("config") or {}).get("ui_position") or {})
    if position:
        position = {"x": int(position.get("x", 0)) + 40, "y": int(position.get("y", 0)) + 40}
    duplicate = {
        **copy.deepcopy(original),
        "id": duplicate_id,
        "name": f"{original['name']} Copy",
        "config": {
            **dict(original.get("config") or {}),
            **({"ui_position": position} if position else {}),
        },
    }
    next_definition["steps"].append(duplicate)

    outgoing = [edge for edge in next_definition["edges"] if edge["source"] == step_id]
    if outgoing:
        primary = outgoing[0]
        next_definition["edges"].append(
            {
                "id": f"edge-{step_id}-{duplicate_id}",
                "source": step_id,
                "target": duplicate_id,
                "label": None,
            }
        )
        next_definition["edges"].append(
            {
                "id": f"edge-{duplicate_id}-{primary['target']}",
                "source": duplicate_id,
                "target": primary["target"],
                "label": primary.get("label"),
            }
        )
    return next_definition, duplicate_id


def delete_step_from_definition(definition: dict[str, Any], step_id: str) -> dict[str, Any]:
    next_definition = _copy_definition(definition)
    next_definition["steps"] = [step for step in next_definition["steps"] if step["id"] != step_id]

    incoming = [edge for edge in next_definition["edges"] if edge["target"] == step_id]
    outgoing = [edge for edge in next_definition["edges"] if edge["source"] == step_id]
    next_definition["edges"] = [
        edge for edge in next_definition["edges"] if edge["source"] != step_id and edge["target"] != step_id
    ]

    if len(outgoing) == 1 and (outgoing[0].get("label") in (None, "")):
        target_id = outgoing[0]["target"]
        for edge in incoming:
            next_definition["edges"].append(
                {
                    "id": f"edge-{edge['source']}-{target_id}-{(edge.get('label') or 'default')}",
                    "source": edge["source"],
                    "target": target_id,
                    "label": edge.get("label"),
                }
            )
    return next_definition


def build_execution_path_definition(definition: dict[str, Any], target_step_id: str) -> dict[str, Any]:
    steps = definition.get("steps") or []
    edges = definition.get("edges") or []
    incoming_by_target: dict[str, list[dict[str, Any]]] = {}
    for edge in edges:
        incoming_by_target.setdefault(edge["target"], []).append(edge)

    keep_ids: set[str] = set()
    stack = [target_step_id]
    while stack:
        current = stack.pop()
        if current in keep_ids:
            continue
        keep_ids.add(current)
        for edge in incoming_by_target.get(current, []):
            stack.append(edge["source"])

    kept_steps = [copy.deepcopy(step) for step in steps if step["id"] in keep_ids]
    kept_edges = [copy.deepcopy(edge) for edge in edges if edge["source"] in keep_ids and edge["target"] in keep_ids]
    return {
        "steps": kept_steps,
        "edges": kept_edges,
    }


def test_step_in_definition(
    definition: dict[str, Any],
    *,
    target_step_id: str,
    payload: dict[str, Any],
    vault_context: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    subset = build_execution_path_definition(definition, target_step_id)
    outcome = run_workflow_definition(subset, payload, vault_context=vault_context or {})
    results = outcome.get("step_results") or []
    target_result = next((step for step in results if step.get("step_id") == target_step_id), None)
    warnings: list[str] = []
    if target_result is None:
        warnings.append("The selected step was not reached with the provided sample payload.")
    if outcome.get("status") == "paused":
        warnings.append("The step path paused before completing.")
    return {
        "status": "success" if outcome.get("status") == "completed" else outcome.get("status", "failed"),
        "reached_target": target_result is not None,
        "executed_step_ids": [str(step.get("step_id") or "") for step in results if step.get("step_id")],
        "target_step_result": target_result,
        "warnings": warnings,
    }
