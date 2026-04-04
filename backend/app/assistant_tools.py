from __future__ import annotations

import re
from typing import Any


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

    output_config: dict[str, Any] = {"app": "webhook", "operation": "respond"}
    output_name = "Return Result"
    if "slack" in lowered:
        output_config = {"app": "slack", "operation": "send_message", "channel": "#ops", "message": "Workflow completed"}
        output_name = "Send Slack Message"
    elif "email" in lowered:
        output_config = {"app": "email", "operation": "send_email", "to": "team@flowholt.local", "subject": "Workflow result"}
        output_name = "Send Email"
    elif "webhook" in lowered or trigger_type == "webhook":
        output_config = {"app": "webhook", "operation": "respond", "status_code": 200}
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
