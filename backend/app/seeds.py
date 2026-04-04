from __future__ import annotations

import json
from typing import Any

from .db import get_db, row_to_dict, utc_now


USERS: list[dict[str, Any]] = [
    {
        "id": "u-ital-hajani",
        "name": "Ital Hajani",
        "email": "italhajani@gmail.com",
        "avatar_initials": "IH",
    },
    {
        "id": "u-muhammad-ops",
        "name": "Muhammad Ops",
        "email": "muhammad@flowholt.ai",
        "avatar_initials": "MO",
    },
]


WORKSPACES: list[dict[str, Any]] = [
    {
        "id": "ws-flowholt",
        "name": "FlowHolt Workspace",
        "slug": "flowholt-workspace",
        "plan": "free",
        "owner_user_id": "u-ital-hajani",
    },
    {
        "id": "ws-revenue-lab",
        "name": "Revenue Lab",
        "slug": "revenue-lab",
        "plan": "free",
        "owner_user_id": "u-muhammad-ops",
    },
]


WORKSPACE_MEMBERSHIPS: list[dict[str, Any]] = [
    {
        "id": "wm-ital-flowholt",
        "workspace_id": "ws-flowholt",
        "user_id": "u-ital-hajani",
        "role": "owner",
        "status": "active",
    },
    {
        "id": "wm-muhammad-flowholt",
        "workspace_id": "ws-flowholt",
        "user_id": "u-muhammad-ops",
        "role": "builder",
        "status": "active",
    },
    {
        "id": "wm-muhammad-revenue",
        "workspace_id": "ws-revenue-lab",
        "user_id": "u-muhammad-ops",
        "role": "owner",
        "status": "active",
    },
]


TEMPLATES: list[dict[str, Any]] = [
    {
        "id": "t-support-deflection",
        "workspace_id": "ws-flowholt",
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
                        "model": "{{vault.variable.OPENAI_MODEL_PRIMARY}}",
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
                    "config": {
                        "channel": "{{vault.connection.Support escalation connection.channel}}",
                        "webhook_url": "{{vault.variable.SUPPORT_ESCALATION_WEBHOOK}}",
                    },
                },
            ],
            "edges": [
                {"id": "edge-trigger-llm", "source": "trigger-1", "target": "llm-1"},
                {"id": "edge-llm-condition", "source": "llm-1", "target": "condition-1"},
                {"id": "edge-condition-true", "source": "condition-1", "target": "output-1", "label": "true"},
                {"id": "edge-condition-false", "source": "condition-1", "target": "output-1", "label": "false"},
            ],
        },
    },
    {
        "id": "t-lead-routing",
        "workspace_id": "ws-flowholt",
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
            ],
            "edges": [
                {"id": "edge-trigger-transform", "source": "trigger-1", "target": "transform-1"},
                {"id": "edge-transform-output", "source": "transform-1", "target": "output-1"},
            ],
        },
    },
    {
        "id": "t-renewal-watchtower",
        "workspace_id": "ws-revenue-lab",
        "name": "Renewal Watchtower",
        "description": "Detect churn risk, draft recovery notes, and route expansion-ready accounts to revenue ops.",
        "category": "Revenue",
        "trigger_type": "schedule",
        "estimated_time": "9 min",
        "complexity": "Standard",
        "color": "hsl(24,95%,53%)",
        "owner": "Revenue Lab",
        "installs": "182",
        "outcome": "Keeps renewals visible before risk becomes churn.",
        "tags": ["Renewals", "Health scoring", "CS Ops"],
        "definition": {
            "steps": [
                {
                    "id": "trigger-1",
                    "type": "trigger",
                    "name": "Daily account sweep",
                    "config": {"frequency": "daily", "time": "09:00"},
                },
                {
                    "id": "transform-1",
                    "type": "transform",
                    "name": "Build renewal summary",
                    "config": {"template": "Review renewal risk for {{account_name}} due on {{renewal_date}}"},
                },
                {
                    "id": "output-1",
                    "type": "output",
                    "name": "Send to revenue queue",
                    "config": {"channel": "{{vault.connection.Revenue routing connection.channel}}"},
                },
            ],
            "edges": [
                {"id": "edge-trigger-transform-revenue", "source": "trigger-1", "target": "transform-1"},
                {"id": "edge-transform-output-revenue", "source": "transform-1", "target": "output-1"},
            ],
        },
    },
]


WORKFLOWS: list[dict[str, Any]] = [
    {
        "id": "w-support-ticket-classifier",
        "workspace_id": "ws-flowholt",
        "created_by_user_id": "u-ital-hajani",
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
        "workspace_id": "ws-flowholt",
        "created_by_user_id": "u-muhammad-ops",
        "name": "Lead Scoring Pipeline",
        "status": "active",
        "trigger_type": "event",
        "category": "Sales Ops",
        "success_rate": 95,
        "template_id": "t-lead-routing",
        "definition": TEMPLATES[1]["definition"],
    },
    {
        "id": "w-renewal-watchtower",
        "workspace_id": "ws-revenue-lab",
        "created_by_user_id": "u-muhammad-ops",
        "name": "Renewal Watchtower",
        "status": "active",
        "trigger_type": "schedule",
        "category": "Revenue Ops",
        "success_rate": 97,
        "template_id": "t-renewal-watchtower",
        "definition": TEMPLATES[2]["definition"],
    },
]


VAULT_ASSETS: list[dict[str, Any]] = [
    {
        "id": "va-conn-slack",
        "workspace_id": "ws-flowholt",
        "created_by_user_id": "u-ital-hajani",
        "kind": "connection",
        "name": "Support escalation connection",
        "app": "Slack",
        "subtitle": "Shared workspace channel routing",
        "logo_url": "https://cdn.simpleicons.org/slack/4A154B",
        "credential_type": None,
        "scope": "workspace",
        "access_text": "Workspace owners",
        "status": "active",
        "workflows_count": 24,
        "people_with_access": 9,
        "last_used_at": "Apr 1, 2026",
        "masked": True,
        "secret": {
            "channel": "#support-escalation",
            "workspace": "flowholt-cx",
            "bot_token": "xoxb-demo-flowholt",
        },
    },
    {
        "id": "va-conn-openai",
        "workspace_id": "ws-flowholt",
        "created_by_user_id": "u-ital-hajani",
        "kind": "connection",
        "name": "Model inference connection",
        "app": "OpenAI",
        "subtitle": "Production text and agent requests",
        "logo_url": "https://cdn.simpleicons.org/openai/10A37F",
        "credential_type": None,
        "scope": "production",
        "access_text": "Builders and deployers",
        "status": "active",
        "workflows_count": 15,
        "people_with_access": 6,
        "last_used_at": "Mar 30, 2026",
        "masked": True,
        "secret": {
            "api_key": "sk-demo-flowholt-openai",
            "model": "gpt-4o-mini",
            "base_url": "https://api.openai.com/v1",
        },
    },
    {
        "id": "va-cred-openai-prod",
        "workspace_id": "ws-flowholt",
        "created_by_user_id": "u-ital-hajani",
        "kind": "credential",
        "name": "OpenAI Production",
        "app": "OpenAI",
        "subtitle": "",
        "logo_url": "",
        "credential_type": "API key",
        "scope": "production",
        "access_text": "Runtime only",
        "status": "active",
        "workflows_count": 0,
        "people_with_access": 0,
        "last_used_at": "3 min ago",
        "masked": True,
        "secret": {
            "api_key": "sk-demo-flowholt-production",
            "organization": "flowholt",
        },
    },
    {
        "id": "va-cred-slack-bot",
        "workspace_id": "ws-flowholt",
        "created_by_user_id": "u-muhammad-ops",
        "kind": "credential",
        "name": "Slack Bot Token",
        "app": "Slack",
        "subtitle": "",
        "logo_url": "",
        "credential_type": "OAuth 2.0",
        "scope": "workspace",
        "access_text": "Workspace editors",
        "status": "active",
        "workflows_count": 0,
        "people_with_access": 0,
        "last_used_at": "12 min ago",
        "masked": True,
        "secret": {
            "access_token": "xoxb-workspace-token",
            "team_id": "T123FLOW",
        },
    },
    {
        "id": "va-var-openai-model",
        "workspace_id": "ws-flowholt",
        "created_by_user_id": "u-ital-hajani",
        "kind": "variable",
        "name": "OPENAI_MODEL_PRIMARY",
        "app": "",
        "subtitle": "",
        "logo_url": "",
        "credential_type": None,
        "scope": "workspace",
        "access_text": "Builders can read",
        "status": "active",
        "workflows_count": 0,
        "people_with_access": 0,
        "last_used_at": None,
        "masked": False,
        "secret": {
            "value": "gpt-4o-mini",
        },
    },
    {
        "id": "va-var-escalation",
        "workspace_id": "ws-flowholt",
        "created_by_user_id": "u-ital-hajani",
        "kind": "variable",
        "name": "SUPPORT_ESCALATION_WEBHOOK",
        "app": "",
        "subtitle": "",
        "logo_url": "",
        "credential_type": None,
        "scope": "production",
        "access_text": "Owners and deployers",
        "status": "active",
        "workflows_count": 0,
        "people_with_access": 0,
        "last_used_at": None,
        "masked": True,
        "secret": {
            "value": "https://hooks.flowholt.local/support/escalation",
        },
    },
    {
        "id": "va-conn-revenue",
        "workspace_id": "ws-revenue-lab",
        "created_by_user_id": "u-muhammad-ops",
        "kind": "connection",
        "name": "Revenue routing connection",
        "app": "Slack",
        "subtitle": "Renewal and expansion routing",
        "logo_url": "https://cdn.simpleicons.org/slack/4A154B",
        "credential_type": None,
        "scope": "workspace",
        "access_text": "Revenue owners",
        "status": "active",
        "workflows_count": 6,
        "people_with_access": 3,
        "last_used_at": "Apr 2, 2026",
        "masked": True,
        "secret": {
            "channel": "#revenue-watchtower",
            "workspace": "revenue-lab",
            "bot_token": "xoxb-demo-revenue-lab",
        },
    },
    {
        "id": "va-var-revenue-model",
        "workspace_id": "ws-revenue-lab",
        "created_by_user_id": "u-muhammad-ops",
        "kind": "variable",
        "name": "RENEWAL_PRIORITY_MODEL",
        "app": "",
        "subtitle": "",
        "logo_url": "",
        "credential_type": None,
        "scope": "workspace",
        "access_text": "Revenue builders",
        "status": "active",
        "workflows_count": 0,
        "people_with_access": 0,
        "last_used_at": None,
        "masked": False,
        "secret": {
            "value": "local-renewal-priority",
        },
    },
]


def seed_data() -> None:
    now = utc_now()
    with get_db() as conn:
        users_count = _count_rows(conn, "users")
        if users_count == 0:
            for user in USERS:
                conn.execute(
                    """
                    INSERT INTO users (id, name, email, avatar_initials, created_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        user["id"],
                        user["name"],
                        user["email"],
                        user["avatar_initials"],
                        now,
                    ),
                )

        workspaces_count = _count_rows(conn, "workspaces")
        if workspaces_count == 0:
            for workspace in WORKSPACES:
                conn.execute(
                    """
                    INSERT INTO workspaces (id, name, slug, plan, owner_user_id, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        workspace["id"],
                        workspace["name"],
                        workspace["slug"],
                        workspace["plan"],
                        workspace["owner_user_id"],
                        now,
                    ),
                )

        memberships_count = _count_rows(conn, "workspace_memberships")
        if memberships_count == 0:
            for membership in WORKSPACE_MEMBERSHIPS:
                conn.execute(
                    """
                    INSERT INTO workspace_memberships (id, workspace_id, user_id, role, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        membership["id"],
                        membership["workspace_id"],
                        membership["user_id"],
                        membership["role"],
                        membership["status"],
                        now,
                    ),
                )

        templates_count = _count_rows(conn, "templates")
        if templates_count == 0:
            for template in TEMPLATES:
                conn.execute(
                    """
                    INSERT INTO templates (
                        id, workspace_id, name, description, category, trigger_type, estimated_time, complexity,
                        color, owner, installs, outcome, tags_json, definition_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        template["id"],
                        template["workspace_id"],
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

        workflows_count = _count_rows(conn, "workflows")
        if workflows_count == 0:
            for workflow in WORKFLOWS:
                conn.execute(
                    """
                    INSERT INTO workflows (
                        id, workspace_id, created_by_user_id, current_version_number, published_version_id, name, status,
                        trigger_type, category, success_rate, template_id, definition_json, created_at, last_run_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        workflow["id"],
                        workflow["workspace_id"],
                        workflow["created_by_user_id"],
                        0,
                        None,
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

        workflow_versions_count = _count_rows(conn, "workflow_versions")
        if workflow_versions_count == 0:
            for workflow in WORKFLOWS:
                if workflow["status"] != "active":
                    continue

                version_id = f"wv-seed-{workflow['id'].replace('w-', '')}"
                conn.execute(
                    """
                    INSERT INTO workflow_versions (
                        id, workflow_id, workspace_id, created_by_user_id, version_number, status, notes, definition_json, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        version_id,
                        workflow["id"],
                        workflow["workspace_id"],
                        workflow["created_by_user_id"],
                        1,
                        "published",
                        "Initial published seed",
                        json.dumps(workflow["definition"]),
                        now,
                    ),
                )
                conn.execute(
                    """
                    UPDATE workflows
                    SET current_version_number = 1, published_version_id = ?
                    WHERE id = ? AND workspace_id = ?
                    """,
                    (version_id, workflow["id"], workflow["workspace_id"]),
                )

        vault_count = _count_rows(conn, "vault_assets")
        if vault_count == 0:
            for asset in VAULT_ASSETS:
                conn.execute(
                    """
                    INSERT INTO vault_assets (
                        id, workspace_id, created_by_user_id, visibility, allowed_roles_json, allowed_user_ids_json,
                        kind, name, app, subtitle, logo_url, credential_type, scope,
                        access_text, status, workflows_count, people_with_access, last_used_at,
                        updated_at, masked, secret_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        asset["id"],
                        asset["workspace_id"],
                        asset["created_by_user_id"],
                        "workspace",
                        "[]",
                        "[]",
                        asset["kind"],
                        asset["name"],
                        asset["app"],
                        asset["subtitle"],
                        asset["logo_url"],
                        asset["credential_type"],
                        asset["scope"],
                        asset["access_text"],
                        asset["status"],
                        asset["workflows_count"],
                        asset["people_with_access"],
                        asset["last_used_at"],
                        now,
                        1 if asset["masked"] else 0,
                        json.dumps(asset["secret"]),
                    ),
                )


def _count_rows(conn: Any, table_name: str) -> int:
    row = conn.execute(f"SELECT COUNT(*) AS count FROM {table_name}").fetchone()
    if row is None:
        return 0
    item = row_to_dict(row)
    return int(item.get("count", 0))
