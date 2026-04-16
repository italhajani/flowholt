from __future__ import annotations

import copy
import json
import logging
import re
from typing import Any

from .llm_router import get_llm_router

logger = logging.getLogger(__name__)


STOP_WORDS = {
    "a",
    "an",
    "and",
    "the",
    "to",
    "for",
    "of",
    "in",
    "on",
    "with",
    "from",
    "that",
    "this",
    "it",
    "my",
    "our",
    "into",
    "using",
    "use",
    "when",
    "then",
    "should",
    "would",
    "could",
    "can",
}


def tokenize_text(value: str) -> list[str]:
    return [token for token in re.findall(r"[a-z0-9]+", value.lower()) if token and token not in STOP_WORDS]


def build_assistant_workflow_name(prompt: str) -> dict[str, str]:
    cleaned = " ".join(prompt.split()).strip()
    tokens = tokenize_text(cleaned)
    title_words = tokens[:5]
    if not title_words:
        title_words = ["workflow"]
    name = " ".join(word.capitalize() for word in title_words)
    short_name = " ".join(word.capitalize() for word in title_words[:3])
    return {
        "name": name[:60] or "Generated Workflow",
        "short_name": short_name[:32] or "Workflow",
        "reason": "Reduced the request to the highest-signal task words for a short workflow title.",
    }


def infer_trigger_type(prompt: str) -> str:
    lowered = prompt.lower()
    if any(word in lowered for word in ["every day", "daily", "weekly", "hourly", "every hour", "schedule", "cron", "remind"]):
        return "schedule"
    if any(word in lowered for word in ["chatbot", "chat bot", "chat trigger", "chat widget", "live chat", "conversational", "conversation", "chat assistant"]):
        return "chat"
    if any(word in lowered for word in ["webhook", "form submit", "api call", "http request", "callback", "endpoint"]):
        return "webhook"
    return "manual"


def infer_category(prompt: str) -> str:
    lowered = prompt.lower()
    if any(word in lowered for word in ["support", "ticket", "customer", "helpdesk", "escalate"]):
        return "Customer Support"
    if any(word in lowered for word in ["lead", "crm", "sales", "prospect", "demo"]):
        return "Sales Ops"
    if any(word in lowered for word in ["invoice", "finance", "billing", "approval", "expense", "renewal"]):
        return "Finance"
    if any(word in lowered for word in ["model", "ai", "llm", "classify", "summarize", "extract"]):
        return "AI Operations"
    return "Custom"


def summarize_prompt(prompt: str) -> str:
    cleaned = " ".join(prompt.split()).strip()
    if len(cleaned) <= 140:
        return cleaned
    return cleaned[:137].rstrip() + "..."


def match_templates(prompt: str, templates: list[dict[str, Any]], *, limit: int = 3) -> list[dict[str, Any]]:
    prompt_tokens = set(tokenize_text(prompt))
    scored: list[dict[str, Any]] = []
    for template in templates:
        haystack_parts = [
            str(template.get("name") or ""),
            str(template.get("description") or ""),
            str(template.get("category") or ""),
            str(template.get("trigger_type") or ""),
            str(template.get("outcome") or ""),
            " ".join(template.get("tags") or []),
        ]
        haystack_tokens = set(tokenize_text(" ".join(haystack_parts)))
        overlap = prompt_tokens & haystack_tokens
        score = len(overlap) * 8
        if infer_category(prompt).lower() == str(template.get("category") or "").lower():
            score += 14
        if infer_trigger_type(prompt).lower() == str(template.get("trigger_type") or "").lower():
            score += 10
        if str(template.get("name") or "").lower() in prompt.lower():
            score += 16
        if score <= 0:
            continue
        scored.append(
            {
                "template_id": str(template["id"]),
                "name": str(template["name"]),
                "category": str(template["category"]),
                "trigger_type": str(template["trigger_type"]),
                "score": score,
                "reason": f"Matched on {max(1, len(overlap))} shared intent keywords and workflow metadata.",
            }
        )
    scored.sort(key=lambda item: item["score"], reverse=True)
    return scored[:limit]


def build_suggested_nodes(prompt: str, *, trigger_type: str) -> list[dict[str, str]]:
    lowered = prompt.lower()
    nodes: list[dict[str, str]] = [
        {"type": "trigger", "label": "Trigger", "reason": f"Start the workflow from a {trigger_type} event."}
    ]
    if any(word in lowered for word in ["if", "condition", "only when", "match", "route"]):
        nodes.append({"type": "condition", "label": "Condition", "reason": "Branch execution based on workflow rules."})
    if any(word in lowered for word in ["summarize", "classify", "extract", "rewrite", "ai", "llm", "analyze", "draft"]):
        nodes.append({"type": "llm", "label": "AI Model", "reason": "Use an AI step to interpret or generate content."})
    if any(word in lowered for word in ["approval", "review", "manager", "human"]):
        nodes.append({"type": "human", "label": "Human Approval", "reason": "Pause the workflow for a person to review or approve."})
    if any(word in lowered for word in ["wait", "delay", "later", "remind", "follow up"]):
        nodes.append({"type": "delay", "label": "Delay", "reason": "Pause before the next action or follow-up."})
    if any(word in lowered for word in ["callback", "response from external", "wait for response"]):
        nodes.append({"type": "callback", "label": "Callback", "reason": "Pause until an external system responds."})
    nodes.append({"type": "output", "label": "Output", "reason": "Deliver the result to Slack, email, webhook, or another destination."})
    return nodes


def prompt_requests_explicit_output_change(prompt: str) -> bool:
    lowered = prompt.lower()
    return any(word in lowered for word in ["slack", "email", "webhook", "send message", "notify", "post to"])


def build_assistant_plan(prompt: str, templates: list[dict[str, Any]]) -> dict[str, Any]:
    naming = build_assistant_workflow_name(prompt)
    trigger_type = infer_trigger_type(prompt)
    category = infer_category(prompt)
    matches = match_templates(prompt, templates)
    suggested_nodes = build_suggested_nodes(prompt, trigger_type=trigger_type)
    warnings: list[str] = []
    if not matches:
        warnings.append("No strong template match was found, so the assistant will draft a custom workflow.")
    if any(node["type"] == "human" for node in suggested_nodes):
        warnings.append("This workflow may require assignee configuration before it can run fully.")
    return {
        "prompt": prompt,
        "suggested_name": naming["name"],
        "trigger_type": trigger_type,
        "category": category,
        "summary": summarize_prompt(prompt),
        "matched_templates": matches,
        "suggested_nodes": suggested_nodes,
        "warnings": warnings,
    }


def build_draft_definition(prompt: str, *, trigger_type: str, template_definition: dict[str, Any] | None = None) -> dict[str, Any]:
    if template_definition:
        return template_definition

    lowered = prompt.lower()
    steps: list[dict[str, Any]] = [
        {
            "id": "trigger-1",
            "type": "trigger",
            "name": "Start Workflow",
            "config": {"source": trigger_type},
        }
    ]
    edges: list[dict[str, Any]] = []
    previous_id = "trigger-1"

    if any(word in lowered for word in ["if", "condition", "only when", "route", "match"]):
        steps.append(
            {
                "id": "condition-1",
                "type": "condition",
                "name": "Check Conditions",
                "config": {"operator": "contains", "field": "payload.text", "value": "urgent"},
            }
        )
        edges.append({"id": "edge-trigger-condition", "source": previous_id, "target": "condition-1"})
        previous_id = "condition-1"

    if any(word in lowered for word in ["summarize", "classify", "extract", "rewrite", "ai", "llm", "analyze", "draft"]):
        steps.append(
            {
                "id": "llm-1",
                "type": "llm",
                "name": "Interpret Request",
                "config": {
                    "app": "anthropic",
                    "operation": "messages_api",
                    "provider": "Anthropic",
                    "model": "Claude Opus 4.1",
                    "prompt": prompt,
                },
            }
        )
        edges.append({"id": f"edge-{previous_id}-llm", "source": previous_id, "target": "llm-1"})
        previous_id = "llm-1"

    if any(word in lowered for word in ["approval", "review", "manager", "human"]):
        steps.append(
            {
                "id": "human-1",
                "type": "human",
                "name": "Review Response",
                "config": {
                    "title": "Review workflow output",
                    "instructions": "Check the result and approve the next step.",
                    "choices": ["approve", "reject"],
                },
            }
        )
        edges.append({"id": f"edge-{previous_id}-human", "source": previous_id, "target": "human-1"})
        previous_id = "human-1"

    if any(word in lowered for word in ["wait", "delay", "later", "remind", "follow up"]):
        steps.append(
            {
                "id": "delay-1",
                "type": "delay",
                "name": "Wait Before Follow-up",
                "config": {"duration_minutes": 60},
            }
        )
        edges.append({"id": f"edge-{previous_id}-delay", "source": previous_id, "target": "delay-1"})
        previous_id = "delay-1"

    if any(word in lowered for word in ["callback", "external response", "wait for response"]):
        steps.append(
            {
                "id": "callback-1",
                "type": "callback",
                "name": "Wait for Callback",
                "config": {"mode": "resume"},
            }
        )
        edges.append({"id": f"edge-{previous_id}-callback", "source": previous_id, "target": "callback-1"})
        previous_id = "callback-1"

    output_config: dict[str, Any] = {"destination": "webhook", "channel": "response", "app": "webhook", "operation": "respond"}
    output_name = "Return Result"
    if "slack" in lowered:
        output_config = {"app": "slack", "operation": "send_message", "channel": "#ops", "message": "Workflow completed"}
        output_name = "Send Slack Message"
    elif "email" in lowered:
        output_config = {"app": "email", "operation": "send_email", "to": "team@flowholt.local", "subject": "Workflow result"}
        output_name = "Send Email"
    elif "chat" in lowered or trigger_type == "chat":
        output_config = {"destination": "webhook", "channel": "chat-response", "app": "webhook", "operation": "respond", "response_mode": "chat"}
        output_name = "Send Chat Response"
    elif "webhook" in lowered or trigger_type == "webhook":
        output_config = {"destination": "webhook", "channel": "http-response", "app": "webhook", "operation": "respond", "status_code": 200}
        output_name = "Respond to Webhook"

    steps.append(
        {
            "id": "output-1",
            "type": "output",
            "name": output_name,
            "config": output_config,
        }
    )
    edges.append({"id": f"edge-{previous_id}-output", "source": previous_id, "target": "output-1"})

    return {"steps": steps, "edges": edges}


def build_workflow_summary(
    workflow: dict[str, Any],
    *,
    observability: dict[str, Any] | None = None,
) -> dict[str, Any]:
    definition = workflow.get("definition_json") or {}
    steps = list(definition.get("steps") or [])
    edges = list(definition.get("edges") or [])
    trigger_type = str(workflow.get("trigger_type") or "manual")
    category = str(workflow.get("category") or "Custom")
    step_descriptions = [
        f"{str(step.get('name') or step.get('id') or 'Step')} ({str(step.get('type') or 'step')})"
        for step in steps[:5]
    ]
    summary_parts = [
        f"{str(workflow.get('name') or 'Workflow')} is a {category.lower()} workflow triggered by {trigger_type}.",
        f"It currently has {len(steps)} steps and {len(edges)} connections.",
    ]
    if step_descriptions:
        summary_parts.append("Main steps: " + ", ".join(step_descriptions) + ".")
    if observability:
        total_runs = int(observability.get("total_runs") or 0)
        success_rate = int(observability.get("success_rate") or 0)
        active_jobs = int(observability.get("active_job_count") or 0)
        summary_parts.append(
            f"It has {total_runs} recorded runs with a {success_rate}% success rate and {active_jobs} active queued jobs."
        )
    warnings: list[str] = []
    if not steps:
        warnings.append("This workflow has no steps yet.")
    if len(steps) == 1:
        warnings.append("This workflow still looks minimal and may need more automation steps.")
    if not any(str(step.get("type")) == "output" for step in steps):
        warnings.append("This workflow does not yet have an output or delivery step.")
    return {
        "summary": " ".join(summary_parts),
        "notable_steps": step_descriptions,
        "warnings": warnings,
    }


def build_existing_workflow_name_suggestion(workflow: dict[str, Any], prompt: str | None = None) -> dict[str, str]:
    summary = build_workflow_summary(workflow)["summary"]
    source_text = prompt.strip() if prompt and prompt.strip() else summary
    naming = build_assistant_workflow_name(source_text)
    naming["reason"] = "Used the workflow purpose and structure to create a shorter, clearer title."
    return naming


def _next_step_id(existing_ids: set[str], node_type: str) -> str:
    index = 1
    while f"{node_type}-{index}" in existing_ids:
        index += 1
    step_id = f"{node_type}-{index}"
    existing_ids.add(step_id)
    return step_id


def _next_edge_id(existing_ids: set[str]) -> str:
    index = 1
    while f"edge-assistant-{index}" in existing_ids:
        index += 1
    edge_id = f"edge-assistant-{index}"
    existing_ids.add(edge_id)
    return edge_id


def extend_workflow_definition(
    definition: dict[str, Any],
    *,
    prompt: str,
    trigger_type: str,
) -> dict[str, Any]:
    base_definition = copy.deepcopy(definition)
    steps = list(base_definition.get("steps") or [])
    edges = list(base_definition.get("edges") or [])
    if not steps:
        drafted = build_draft_definition(prompt, trigger_type=trigger_type)
        return {
            "definition": drafted,
            "added_steps": list(drafted.get("steps") or []),
            "updated_output": None,
            "warnings": ["The workflow was empty, so the assistant created a fresh starter flow."],
        }

    generated = build_draft_definition(prompt, trigger_type=trigger_type)
    candidate_steps = [step for step in generated.get("steps", []) if str(step.get("type")) != "trigger"]

    existing_step_ids = {str(step.get("id")) for step in steps}
    existing_edge_ids = {str(edge.get("id")) for edge in edges}
    existing_types = {str(step.get("type")) for step in steps}
    outgoing_sources = {str(edge.get("source")) for edge in edges}
    terminal_step_ids = [str(step.get("id")) for step in steps if str(step.get("id")) not in outgoing_sources]
    output_step = next((step for step in steps if str(step.get("type")) == "output"), None)

    warnings: list[str] = []
    added_steps: list[dict[str, Any]] = []
    updated_output: dict[str, Any] | None = None

    for candidate in candidate_steps:
        node_type = str(candidate.get("type") or "")
        if not node_type:
            continue
        if node_type == "output" and output_step is not None:
            if prompt_requests_explicit_output_change(prompt):
                merged_config = dict(output_step.get("config") or {})
                merged_config.update(dict(candidate.get("config") or {}))
                output_step["config"] = merged_config
                if candidate.get("name"):
                    output_step["name"] = candidate["name"]
                updated_output = copy.deepcopy(output_step)
            continue
        if node_type in existing_types and node_type in {"condition", "llm", "human", "delay", "callback"}:
            warnings.append(f"Skipped adding another {node_type} step because one already exists.")
            continue

        new_step = copy.deepcopy(candidate)
        new_step["id"] = _next_step_id(existing_step_ids, node_type)
        added_steps.append(new_step)
        existing_types.add(node_type)

    if not added_steps:
        return {
            "definition": {"steps": steps, "edges": edges},
            "added_steps": [],
            "updated_output": updated_output,
            "warnings": warnings or ["No new steps were added because the workflow already covers that intent."],
        }

    insertion_index = len(steps)
    if output_step is not None:
        insertion_index = next(
            (index for index, step in enumerate(steps) if str(step.get("id")) == str(output_step.get("id"))),
            len(steps),
        )
        incoming_edges = [edge for edge in edges if str(edge.get("target")) == str(output_step.get("id"))]
        if incoming_edges:
            for edge in incoming_edges:
                edge["target"] = str(added_steps[0]["id"])
            edges.append(
                {
                    "id": _next_edge_id(existing_edge_ids),
                    "source": str(added_steps[-1]["id"]),
                    "target": str(output_step["id"]),
                }
            )
            if len(incoming_edges) > 1:
                warnings.append("Inserted new assistant steps before the shared output step across multiple branches.")
        else:
            if terminal_step_ids:
                for terminal_step_id in terminal_step_ids:
                    if terminal_step_id == str(output_step["id"]):
                        continue
                    edges.append(
                        {
                            "id": _next_edge_id(existing_edge_ids),
                            "source": terminal_step_id,
                            "target": str(added_steps[0]["id"]),
                        }
                    )
            edges.append(
                {
                    "id": _next_edge_id(existing_edge_ids),
                    "source": str(added_steps[-1]["id"]),
                    "target": str(output_step["id"]),
                }
            )
    else:
        for terminal_step_id in terminal_step_ids:
            edges.append(
                {
                    "id": _next_edge_id(existing_edge_ids),
                    "source": terminal_step_id,
                    "target": str(added_steps[0]["id"]),
                }
            )

    for index in range(len(added_steps) - 1):
        edges.append(
            {
                "id": _next_edge_id(existing_edge_ids),
                "source": str(added_steps[index]["id"]),
                "target": str(added_steps[index + 1]["id"]),
            }
        )

    steps[insertion_index:insertion_index] = added_steps
    return {
        "definition": {"steps": steps, "edges": edges},
        "added_steps": added_steps,
        "updated_output": updated_output,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# LLM-enhanced assistant functions
# ---------------------------------------------------------------------------

def llm_generate_workflow_name(prompt: str) -> dict[str, str]:
    """Use LLM to generate a better workflow name, falling back to rule-based."""
    try:
        router = get_llm_router()
        if router._default_provider == "mock":
            return build_assistant_workflow_name(prompt)

        result = router.generate(
            f"Generate a short, clear workflow name (max 5 words) for this automation request:\n\n{prompt}\n\nRespond with ONLY the workflow name, nothing else.",
            system="You name automation workflows. Be concise. Only output the name.",
            temperature=0.3,
            max_tokens=30,
        )
        name = result.strip().strip('"').strip("'")[:60]
        short = " ".join(name.split()[:3])[:32]
        return {
            "name": name or "Generated Workflow",
            "short_name": short or "Workflow",
            "reason": "Generated by AI based on the request intent.",
        }
    except Exception:
        logger.debug("LLM workflow name generation failed, using rule-based", exc_info=True)
        return build_assistant_workflow_name(prompt)


def llm_analyze_prompt(prompt: str) -> dict[str, Any]:
    """Use LLM to analyze a workflow prompt and extract structured intent."""
    try:
        router = get_llm_router()
        if router._default_provider == "mock":
            return {
                "trigger_type": infer_trigger_type(prompt),
                "category": infer_category(prompt),
                "summary": summarize_prompt(prompt),
                "suggested_integrations": [],
                "complexity": "medium",
            }

        result = router.generate(
            f"""Analyze this workflow automation request and return a JSON object with:
- "trigger_type": one of "manual", "chat", "webhook", "schedule"
- "category": one of "Customer Support", "Sales Ops", "Finance", "AI Operations", "DevOps", "Marketing", "Custom"
- "summary": a one-sentence summary of what the workflow does
- "suggested_integrations": list of service names that would be needed (e.g., "slack", "gmail", "github")
- "complexity": one of "simple", "medium", "complex"

Request: {prompt}

Respond with ONLY valid JSON, no markdown.""",
            system="You are a workflow automation expert. Analyze requests and return structured JSON.",
            temperature=0.2,
            max_tokens=300,
        )
        parsed = _safe_parse_json(result)
        if parsed:
            parsed.setdefault("trigger_type", infer_trigger_type(prompt))
            parsed.setdefault("category", infer_category(prompt))
            parsed.setdefault("summary", summarize_prompt(prompt))
            parsed.setdefault("suggested_integrations", [])
            parsed.setdefault("complexity", "medium")
            return parsed
    except Exception:
        logger.debug("LLM prompt analysis failed, using rule-based", exc_info=True)

    return {
        "trigger_type": infer_trigger_type(prompt),
        "category": infer_category(prompt),
        "summary": summarize_prompt(prompt),
        "suggested_integrations": [],
        "complexity": "medium",
    }


def llm_repair_workflow(definition: dict[str, Any], error_context: str | None = None) -> dict[str, Any]:
    """Use LLM to suggest repairs for a broken workflow definition."""
    try:
        router = get_llm_router()
        if router._default_provider == "mock":
            return {"repairs": [], "explanation": "Mock mode — no repairs suggested."}

        def_str = json.dumps(definition, indent=2, default=str)[:3000]
        error_part = f"\n\nError context: {error_context}" if error_context else ""

        result = router.generate(
            f"""Analyze this workflow definition for issues and suggest repairs.
Return a JSON object with:
- "repairs": list of objects with "step_id", "issue", "fix"
- "explanation": overall explanation of what's wrong

Workflow definition:
{def_str}{error_part}

Respond with ONLY valid JSON, no markdown.""",
            system="You are a workflow debugging expert. Find issues and suggest fixes.",
            temperature=0.2,
            max_tokens=600,
        )
        parsed = _safe_parse_json(result)
        if parsed:
            return parsed
    except Exception:
        logger.debug("LLM repair failed", exc_info=True)

    return {"repairs": [], "explanation": "Could not analyze the workflow."}


def build_assistant_chat_response(
    messages: list[dict[str, str]],
    *,
    workflow_name: str | None = None,
    step_count: int = 0,
    workflow_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build an AI chat response using the LLM router with workflow context."""
    state = _build_assistant_chat_state(
        messages,
        workflow_name=workflow_name,
        step_count=step_count,
        workflow_context=workflow_context,
    )

    try:
        router = get_llm_router()
        if router._default_provider == "mock":
            return _build_rule_based_assistant_result(state)

        reply = router.generate(
            state["conversation"],
            system=state["system_prompt"],
            temperature=0.5,
            max_tokens=600,
        ).strip()
        return _finalize_assistant_chat_result(state, reply)
    except Exception:
        logger.debug("LLM chat failed, using rule-based", exc_info=True)
        return _build_rule_based_assistant_result(state)


def stream_assistant_chat_response(
    messages: list[dict[str, str]],
    *,
    workflow_name: str | None = None,
    step_count: int = 0,
    workflow_context: dict[str, Any] | None = None,
) -> Iterator[dict[str, Any]]:
    state = _build_assistant_chat_state(
        messages,
        workflow_name=workflow_name,
        step_count=step_count,
        workflow_context=workflow_context,
    )

    try:
        router = get_llm_router()
        if router._default_provider == "mock":
            final_result = _build_rule_based_assistant_result(state)
            for chunk in _chunk_stream_text(final_result["reply"]):
                yield {"event": "delta", "data": {"delta": chunk}}
            yield {"event": "done", "data": final_result}
            return

        chunks: list[str] = []
        for chunk in router.stream_generate(
            state["conversation"],
            system=state["system_prompt"],
            temperature=0.5,
            max_tokens=600,
        ):
            chunks.append(chunk)
            yield {"event": "delta", "data": {"delta": chunk}}

        yield {"event": "done", "data": _finalize_assistant_chat_result(state, "".join(chunks).strip())}
    except Exception:
        logger.debug("LLM stream chat failed, using rule-based", exc_info=True)
        final_result = _build_rule_based_assistant_result(state)
        for chunk in _chunk_stream_text(final_result["reply"]):
            yield {"event": "delta", "data": {"delta": chunk}}
        yield {"event": "done", "data": final_result}


def _build_assistant_chat_state(
    messages: list[dict[str, str]],
    *,
    workflow_name: str | None = None,
    step_count: int = 0,
    workflow_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    last_user_msg = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            last_user_msg = msg.get("content", "")
            break

    context_parts: list[str] = []
    if workflow_name:
        context_parts.append(f"Workflow: {workflow_name}")
    if step_count:
        context_parts.append(f"Steps: {step_count}")

    existing_steps: list[dict[str, Any]] = []
    workflow_definition: dict[str, Any] | None = None
    workflow_summary = None
    context_warnings: list[str] = []
    selected_step_id = None
    if workflow_context:
        workflow_definition = workflow_context.get("definition_json") or workflow_context.get("definition", {})
        existing_steps = workflow_definition.get("steps", []) if workflow_definition else []
        workflow_summary = str(workflow_context.get("summary") or "").strip() or None
        context_warnings = [str(item) for item in (workflow_context.get("warnings") or []) if str(item).strip()]
        selected_step = dict(workflow_context.get("selected_step") or {})
        selected_step_id = str(selected_step.get("id") or "") or None
        if existing_steps:
            step_names = [f"{s.get('name', s.get('id', '?'))} ({s.get('type', '?')})" for s in existing_steps[:8]]
            context_parts.append("Current steps: " + ", ".join(step_names))
        if workflow_summary:
            context_parts.append("Summary: " + workflow_summary)
        settings_snapshot = dict(workflow_context.get("settings") or {})
        if settings_snapshot:
            settings_parts = [
                f"timeout {int(settings_snapshot.get('timeout_seconds') or 3600)}s",
                f"execution order {settings_snapshot.get('execution_order') or 'v1'}",
                f"caller policy {settings_snapshot.get('caller_policy') or 'inherit'}",
            ]
            if settings_snapshot.get("error_workflow_id"):
                settings_parts.append("error workflow configured")
            if settings_snapshot.get("save_execution_progress") is False:
                settings_parts.append("progress capture disabled")
            context_parts.append("Settings: " + ", ".join(settings_parts))
        observability = dict(workflow_context.get("observability") or {})
        if observability:
            context_parts.append(
                "Recent runs: "
                + f"{int(observability.get('total_runs') or 0)} total, "
                + f"{int(observability.get('failed_count') or 0)} failed, "
                + f"{int(observability.get('success_rate') or 0)}% success"
            )
        environments = dict(workflow_context.get("environments") or {})
        if environments:
            staging = dict(environments.get("staging") or {})
            production = dict(environments.get("production") or {})
            environment_parts: list[str] = []
            if staging:
                environment_parts.append(f"staging v{staging.get('version_number')}")
            if production:
                environment_parts.append(f"production v{production.get('version_number')}")
            if environment_parts:
                context_parts.append("Environments: " + ", ".join(environment_parts))
        runtime_issues = [dict(issue or {}) for issue in (workflow_context.get("runtime_issues") or [])]
        validation_issues = [dict(issue or {}) for issue in (workflow_context.get("validation_issues") or [])]
        issue_lines: list[str] = []
        for issue in [*runtime_issues, *validation_issues][:5]:
            message = str(issue.get("message") or "").strip()
            if not message:
                continue
            step_name = str(issue.get("step_name") or "").strip()
            issue_lines.append(f"{step_name}: {message}" if step_name else message)
        if issue_lines:
            context_parts.append("Issues: " + " | ".join(issue_lines))
        if selected_step_id:
            selected_label = str(selected_step.get("name") or selected_step_id)
            selected_type = str(selected_step.get("type") or "")
            if selected_type:
                context_parts.append(f"Selected step: {selected_label} ({selected_type})")
            else:
                context_parts.append(f"Selected step: {selected_label}")
        if context_warnings:
            context_parts.append("Warnings: " + " | ".join(context_warnings[:4]))

    system_prompt = (
        "You are FlowHolt AI, a helpful workflow automation assistant. "
        "You help users build, optimize, debug, and understand their automation workflows. "
        "Be concise, actionable, and specific. Use markdown for formatting. "
        "When the user asks you to add steps, build something, or set things up, "
        "suggest concrete actions and offer to add nodes to the canvas."
    )
    if context_parts:
        system_prompt += "\n\nWorkflow context:\n" + "\n".join(context_parts)

    wants_build = _message_wants_build(last_user_msg)
    actions = build_assistant_actions(
        last_user_msg,
        workflow_context=workflow_context,
        workflow_definition=workflow_definition,
        existing_steps=existing_steps,
        wants_build=wants_build,
    )

    conversation = "\n".join(
        f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
        for m in messages[-10:]
    )

    return {
        "messages": messages,
        "last_user_msg": last_user_msg,
        "workflow_name": workflow_name,
        "step_count": step_count,
        "workflow_context": workflow_context,
        "workflow_summary": workflow_summary,
        "context_warnings": context_warnings,
        "selected_step_id": selected_step_id,
        "wants_build": wants_build,
        "actions": actions,
        "system_prompt": system_prompt,
        "conversation": conversation,
    }


def _finalize_assistant_chat_result(state: dict[str, Any], reply: str) -> dict[str, Any]:
    normalized_reply = reply.strip()
    if state["wants_build"] and state["actions"]:
        steps_desc = []
        for action in state["actions"]:
            if action["type"] == "add_steps":
                for step in action.get("steps", []):
                    steps_desc.append(f"- **{step.get('name', 'Step')}** ({step.get('type', '?')})")
        if steps_desc:
            normalized_reply += "\n\nI've prepared these nodes for you:\n" + "\n".join(steps_desc)
            normalized_reply += "\n\nClick **Add to Canvas** below to add them, or tell me to adjust anything."
        elif any(action.get("type") == "create_workflow" for action in state["actions"]):
            normalized_reply += "\n\nClick **Create workflow draft** below to open a generated starter flow in Studio."

    return {
        "reply": normalized_reply,
        "suggestions": _generate_suggestions(state["last_user_msg"], normalized_reply, workflow_context=state["workflow_context"]),
        "actions": state["actions"],
        "workflow_summary": state["workflow_summary"],
        "context_warnings": state["context_warnings"],
        "selected_step_id": state["selected_step_id"],
    }


def _build_rule_based_assistant_result(state: dict[str, Any]) -> dict[str, Any]:
    result = _rule_based_chat(
        state["last_user_msg"],
        workflow_name=state["workflow_name"],
        step_count=state["step_count"],
        wants_build=state["wants_build"],
        added_steps=[a.get("steps", []) for a in state["actions"] if a.get("type") == "add_steps"],
    )
    result["actions"] = state["actions"]
    result["workflow_summary"] = state["workflow_summary"]
    result["context_warnings"] = state["context_warnings"]
    result["selected_step_id"] = state["selected_step_id"]
    return result


def _chunk_stream_text(text: str) -> Iterator[str]:
    for token in text.split():
        yield f"{token} "


def _rule_based_chat(
    message: str,
    *,
    workflow_name: str | None = None,
    step_count: int = 0,
    wants_build: bool = False,
    added_steps: list[list[dict[str, Any]]] | None = None,
) -> dict[str, Any]:
    """Provide intelligent rule-based responses when LLM is unavailable."""
    lowered = message.lower()
    wf = workflow_name or "your workflow"

    # If we generated steps to add, describe them
    if wants_build and added_steps:
        all_steps = [s for group in added_steps for s in group]
        if all_steps:
            step_desc = "\n".join(f"- **{s.get('name', 'Step')}** ({s.get('type', '?')})" for s in all_steps)
            reply = (
                f"I've prepared the following nodes for **{wf}**:\n\n"
                f"{step_desc}\n\n"
                "Click **Add to Canvas** below to add them to your workflow. "
                "After adding, click each node to configure its settings (API keys, URLs, prompts, etc.). "
                "Then click **Run** to test the full execution."
            )
            suggestions = ["Configure all nodes", "Run this workflow", "Explain each step"]
            return {"reply": reply, "suggestions": suggestions}

    if any(w in lowered for w in ["optimize", "improve", "faster", "performance"]):
        reply = (
            f"Here are some optimization tips for **{wf}**:\n\n"
            "1. **Combine sequential transforms** — merge data-mapping steps that run back-to-back\n"
            "2. **Add conditions early** — filter data before expensive operations\n"
            "3. **Use parallel branches** — split independent operations into parallel paths\n"
            f"4. **Review {step_count} steps** — remove any that produce unused outputs"
        )
        suggestions = ["Add error handling", "Show step dependencies", "Add parallel branches"]
    elif any(w in lowered for w in ["error", "handle", "catch", "fail", "retry"]):
        reply = (
            "To add error handling:\n\n"
            "1. Add a **condition** step after risky operations to check for errors\n"
            "2. Configure **retry logic** on API/webhook steps (set `max_retries` in config)\n"
            "3. Add a **fallback output** step for the error branch\n"
            "4. Consider adding a **delay** step before retries"
        )
        suggestions = ["Add retry to all API steps", "Create error notification", "Test error scenarios"]
    elif any(w in lowered for w in ["test", "debug", "run", "execute"]):
        reply = (
            f"To test **{wf}**:\n\n"
            "1. Click any step → go to the **Test** tab → provide sample JSON payload → click **Run Test**\n"
            "2. Use the **Run** button in the toolbar for a full execution\n"
            "3. Check the **Executions** page for run history and logs"
        )
        suggestions = ["Generate test data", "Show last execution", "Validate workflow"]
    elif any(w in lowered for w in ["branch", "condition", "if", "split", "route"]):
        reply = (
            "To add conditional branching:\n\n"
            "1. Add a **Condition** step from the nodes panel\n"
            "2. Set the condition field (e.g., `payload.status == 'urgent'`)\n"
            "3. Connect the **true** branch to one path and the **false** branch to another\n"
            "4. Each branch can have its own output step"
        )
        suggestions = ["Add A/B routing", "Create approval branch", "Show branch coverage"]
    elif any(w in lowered for w in ["explain", "what", "how", "describe", "summary"]):
        summary = build_workflow_summary({"name": wf, "definition_json": {"steps": [], "edges": []}, "trigger_type": "manual", "category": "Custom"})
        reply = f"**{wf}** currently has {step_count} steps. " + summary.get("summary", "I can help you understand each step — just ask!")
        suggestions = ["Optimize this workflow", "Add error handling", "Generate documentation"]
    else:
        reply = (
            f"I can help with **{wf}**! Here's what I can do:\n\n"
            "- **Build** — tell me what you want to automate and I'll add the nodes\n"
            "- **Optimize** — improve performance and reduce redundancy\n"
            "- **Error handling** — add retries, fallbacks, and notifications\n"
            "- **Branching** — create conditional paths and parallel execution\n"
            "- **Testing** — generate test data and validate steps\n\n"
            "Try saying something like *\"Add an AI step that summarizes the input, then send it to Slack\"*"
        )
        suggestions = ["Build this workflow for me", "Add error handling", "Optimize this workflow", "Explain this workflow"]

    return {"reply": reply, "suggestions": suggestions}


def _message_wants_build(message: str) -> bool:
    lowered = message.lower()
    return any(w in lowered for w in [
        "add", "build", "create", "set up", "setup", "yes", "do it",
        "go ahead", "make it", "apply", "implement", "generate", "automate",
    ])


def _message_wants_run(message: str) -> bool:
    lowered = message.lower()
    return any(word in lowered for word in ["run", "test", "execute", "try it", "validate"])


def _message_wants_repair(message: str) -> bool:
    lowered = message.lower()
    return any(word in lowered for word in ["repair", "fix", "resolve", "debug", "warning", "issue", "broken"])


def _message_wants_open_step(message: str) -> bool:
    lowered = message.lower()
    return any(word in lowered for word in ["open", "inspect", "focus", "configure", "edit this node", "show node"])


def _dedupe_actions(actions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()
    for action in actions:
        key = (
            str(action.get("type") or ""),
            str(action.get("step_id") or ""),
            str(action.get("workflow_name") or ""),
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(action)
    return deduped


def build_assistant_actions(
    message: str,
    *,
    workflow_context: dict[str, Any] | None = None,
    workflow_definition: dict[str, Any] | None = None,
    existing_steps: list[dict[str, Any]] | None = None,
    wants_build: bool | None = None,
) -> list[dict[str, Any]]:
    wants_build = _message_wants_build(message) if wants_build is None else wants_build
    actions: list[dict[str, Any]] = []
    current_steps = existing_steps or []

    selected_step = dict((workflow_context or {}).get("selected_step") or {})
    selected_step_id = str(selected_step.get("id") or "") or None
    selected_step_name = str(selected_step.get("name") or "") or None
    runtime_issues = [dict(issue or {}) for issue in ((workflow_context or {}).get("runtime_issues") or [])]
    validation_issues = [dict(issue or {}) for issue in ((workflow_context or {}).get("validation_issues") or [])]

    if workflow_context and _message_wants_open_step(message):
        target_step_id = selected_step_id or next(
            (str(issue.get("step_id") or "") for issue in [*runtime_issues, *validation_issues] if str(issue.get("step_id") or "")),
            "",
        )
        if target_step_id:
            actions.append(
                {
                    "type": "open_node",
                    "step_id": target_step_id,
                    "label": f"Open {selected_step_name or 'selected node'}",
                }
            )

    if workflow_context and _message_wants_repair(message):
        repair_target = next(
            (issue for issue in [*runtime_issues, *validation_issues] if str(issue.get("step_id") or "")),
            None,
        )
        if repair_target is not None:
            actions.append(
                {
                    "type": "open_node",
                    "step_id": str(repair_target.get("step_id") or ""),
                    "label": f"Inspect {str(repair_target.get('step_name') or 'problem step')}",
                }
            )

    if workflow_context and _message_wants_run(message):
        actions.append({"type": "run_workflow", "label": "Run this workflow"})

    if not wants_build:
        return _dedupe_actions(actions)

    if workflow_context and workflow_definition:
        trigger_type = str(workflow_context.get("trigger_type") or "manual")
        extension = extend_workflow_definition(
            workflow_definition,
            prompt=message,
            trigger_type=trigger_type,
        )
        if extension.get("added_steps"):
            added = extension["added_steps"]
            new_edges = []
            if current_steps and added:
                anchor_id = current_steps[-1]["id"]
                for i, step in enumerate(added):
                    source = anchor_id if i == 0 else added[i - 1]["id"]
                    new_edges.append({
                        "id": f"edge-{source}-{step['id']}",
                        "source": source,
                        "target": step["id"],
                        "label": None,
                    })
            actions.append({
                "type": "add_steps",
                "steps": added,
                "edges": new_edges,
                "label": f"Add {len(added)} node{'s' if len(added) != 1 else ''} to canvas",
            })
            actions.append({"type": "run_workflow", "label": "Run this workflow"})
        return _dedupe_actions(actions)

    workflow_name = build_assistant_workflow_name(message)["name"]
    actions.append({
        "type": "create_workflow",
        "label": "Create workflow draft",
        "prompt": message,
        "workflow_name": workflow_name,
    })
    return _dedupe_actions(actions)


def _generate_suggestions(
    user_msg: str,
    reply: str,
    *,
    workflow_context: dict[str, Any] | None = None,
) -> list[str]:
    """Generate contextual follow-up suggestions."""
    lowered = (user_msg + " " + reply).lower()
    suggestions: list[str] = []
    if workflow_context:
        warnings = [str(item) for item in (workflow_context.get("warnings") or []) if str(item).strip()]
        runtime_issues = [dict(issue or {}) for issue in (workflow_context.get("runtime_issues") or [])]
        selected_step = dict(workflow_context.get("selected_step") or {})
        if warnings or runtime_issues:
            suggestions.append("Repair validation issues")
        if selected_step.get("id"):
            suggestions.append(f"Review {selected_step.get('name') or 'selected step'}")
        settings_snapshot = dict(workflow_context.get("settings") or {})
        if not settings_snapshot.get("error_workflow_id"):
            suggestions.append("Add error handling")
    if "error" in lowered or "retry" in lowered:
        suggestions.append("Add error notifications")
    if "step" in lowered:
        suggestions.append("Show step details")
    if "test" in lowered:
        suggestions.append("Run full workflow test")
    if "optimize" in lowered or "performance" in lowered:
        suggestions.append("Show bottleneck analysis")
    if not suggestions:
        suggestions = ["Optimize workflow", "Add a new step", "Explain this workflow"]
    return suggestions[:4]


def _safe_parse_json(text: str) -> dict[str, Any] | None:
    """Parse JSON from LLM output, handling markdown code blocks."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [line for line in lines if not line.strip().startswith("```")]
        text = "\n".join(lines).strip()
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return None
