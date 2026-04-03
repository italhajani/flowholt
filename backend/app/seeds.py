from __future__ import annotations

import json
from typing import Any

from .db import get_db, utc_now


TEMPLATES: list[dict[str, Any]] = [
    {
        "id": "t-support-deflection",
        "name": "Support Deflection Agent",
        "description": "Classify tickets, draft replies, and escalate only edge cases to humans.",
        "category": "Support",
        "trigger_type": "webhook",
        "estimated_time": "12 min",
        "complexity": "Complex",
        "color": "hsl(262,83%,58%)",
        "owner": "CX Systems",
        "installs": "1.1k",
        "outcome": "Deflects repetitive cases while preserving human review paths.",
        "tags": ["Support AI", "Escalation", "Service"],
        "definition": {
            "steps": [
                {"id": "trigger-1", "type": "trigger", "name": "Incoming request", "config": {}},
                {
                    "id": "llm-1",
                    "type": "llm",
                    "name": "Summarize issue",
                    "config": {
                        "prompt": "Summarize the customer issue and suggest a support priority using the payload.",
                    },
                },
                {
                    "id": "condition-1",
                    "type": "condition",
                    "name": "Needs escalation",
                    "config": {"field": "priority", "equals": "high"},
                },
                {
                    "id": "output-1",
                    "type": "output",
                    "name": "Send result",
                    "config": {"channel": "support"},
                },
            ]
        },
    },
    {
        "id": "t-lead-routing",
        "name": "Lead to CRM Pipeline",
        "description": "Qualify form submissions, enrich records, and create the next sales step.",
        "category": "Sales",
        "trigger_type": "webhook",
        "estimated_time": "15 min",
        "complexity": "Standard",
        "color": "hsl(142,71%,45%)",
        "owner": "Revenue Ops",
        "installs": "1.2k",
        "outcome": "Moves fresh leads into a clean qualification path.",
        "tags": ["CRM sync", "Lead scoring", "Sales"],
        "definition": {
            "steps": [
                {"id": "trigger-1", "type": "trigger", "name": "Lead received", "config": {}},
                {
                    "id": "transform-1",
                    "type": "transform",
                    "name": "Normalize lead",
                    "config": {
                        "template": "Lead {{name}} from {{company}} submitted {{source}}",
                    },
                },
                {
                    "id": "output-1",
                    "type": "output",
                    "name": "Store in CRM queue",
                    "config": {"channel": "crm"},
                },
            ]
        },
    },
]


WORKFLOWS: list[dict[str, Any]] = [
    {
        "id": "w-support-ticket-classifier",
        "name": "Support Ticket Classifier",
        "status": "active",
        "trigger_type": "webhook",
        "category": "Customer Support",
        "success_rate": 98,
        "template_id": "t-support-deflection",
        "definition": TEMPLATES[0]["definition"],
    },
    {
        "id": "w-lead-scoring-pipeline",
        "name": "Lead Scoring Pipeline",
        "status": "active",
        "trigger_type": "event",
        "category": "Sales Ops",
        "success_rate": 95,
        "template_id": "t-lead-routing",
        "definition": TEMPLATES[1]["definition"],
    },
]


def seed_data() -> None:
    now = utc_now()
    with get_db() as conn:
        templates_count = conn.execute("SELECT COUNT(*) FROM templates").fetchone()[0]
        if templates_count == 0:
            for template in TEMPLATES:
                conn.execute(
                    """
                    INSERT INTO templates (
                        id, name, description, category, trigger_type, estimated_time, complexity,
                        color, owner, installs, outcome, tags_json, definition_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        template["id"],
                        template["name"],
                        template["description"],
                        template["category"],
                        template["trigger_type"],
                        template["estimated_time"],
                        template["complexity"],
                        template["color"],
                        template["owner"],
                        template["installs"],
                        template["outcome"],
                        json.dumps(template["tags"]),
                        json.dumps(template["definition"]),
                        now,
                        now,
                    ),
                )

        workflows_count = conn.execute("SELECT COUNT(*) FROM workflows").fetchone()[0]
        if workflows_count == 0:
            for workflow in WORKFLOWS:
                conn.execute(
                    """
                    INSERT INTO workflows (
                        id, name, status, trigger_type, category, success_rate, template_id,
                        definition_json, created_at, last_run_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        workflow["id"],
                        workflow["name"],
                        workflow["status"],
                        workflow["trigger_type"],
                        workflow["category"],
                        workflow["success_rate"],
                        workflow["template_id"],
                        json.dumps(workflow["definition"]),
                        now,
                        None,
                    ),
                )
