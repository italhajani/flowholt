"""Jira integration plugin.

Create issues, search, and manage Jira projects via REST API v3.
Uses basic auth (email + API token) stored in vault connections.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "jira",
    "label": "Jira",
    "category": "Project Management",
    "auth_kind": "token",
    "node_types": ["trigger", "output"],
    "description": "Create issues, search tickets, and track project updates in Jira.",
    "operations": [
        {
            "key": "create_issue",
            "label": "Create issue",
            "direction": "action",
            "resource": "issue",
            "description": "Create a new issue in a Jira project.",
            "fields": [
                {"key": "domain", "label": "Jira domain", "type": "string", "required": True, "help": "Your Atlassian domain (e.g. mycompany.atlassian.net)."},
                {"key": "project_key", "label": "Project key", "type": "string", "required": True, "help": "Jira project key (e.g. PROJ)."},
                {"key": "summary", "label": "Summary", "type": "string", "required": True},
                {"key": "description", "label": "Description", "type": "textarea", "required": False},
                {"key": "issue_type", "label": "Issue type", "type": "string", "required": False, "help": "Task, Bug, Story, Epic (default Task)."},
                {"key": "priority", "label": "Priority", "type": "string", "required": False, "help": "Highest, High, Medium, Low, Lowest."},
                {"key": "assignee_id", "label": "Assignee account ID", "type": "string", "required": False},
                {"key": "labels", "label": "Labels", "type": "tags", "required": False},
            ],
        },
        {
            "key": "search_issues",
            "label": "Search issues (JQL)",
            "direction": "action",
            "resource": "issue",
            "description": "Search for issues using JQL.",
            "fields": [
                {"key": "domain", "label": "Jira domain", "type": "string", "required": True},
                {"key": "jql", "label": "JQL query", "type": "string", "required": True, "help": "Jira Query Language expression."},
                {"key": "max_results", "label": "Max results", "type": "number", "required": False, "help": "Default 25."},
            ],
        },
        {
            "key": "add_comment",
            "label": "Add comment",
            "direction": "action",
            "resource": "comment",
            "description": "Add a comment to an existing Jira issue.",
            "fields": [
                {"key": "domain", "label": "Jira domain", "type": "string", "required": True},
                {"key": "issue_key", "label": "Issue key", "type": "string", "required": True, "help": "e.g. PROJ-123."},
                {"key": "body", "label": "Comment body", "type": "textarea", "required": True},
            ],
        },
        {
            "key": "transition_issue",
            "label": "Transition issue",
            "direction": "action",
            "resource": "issue",
            "description": "Move an issue to a different status.",
            "fields": [
                {"key": "domain", "label": "Jira domain", "type": "string", "required": True},
                {"key": "issue_key", "label": "Issue key", "type": "string", "required": True},
                {"key": "transition_name", "label": "Transition name", "type": "string", "required": True, "help": "e.g. Done, In Progress, To Do."},
            ],
        },
    ],
}


def _build_auth(config: dict[str, Any]) -> tuple[str, str]:
    email = config.get("email", "")
    token = config.get("api_token") or config.get("token") or ""
    return email, token


async def create_issue(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    email, token = _build_auth(config)
    domain = str(payload.get("domain", ""))

    if not token or not domain:
        return {
            "simulated": True,
            "project_key": payload.get("project_key", ""),
            "summary": payload.get("summary", ""),
            "message": "No Jira credentials configured — issue creation simulated.",
        }

    project_key = str(payload.get("project_key", ""))
    summary = str(payload.get("summary", ""))
    description = str(payload.get("description", ""))
    issue_type = str(payload.get("issue_type", "Task"))
    priority = str(payload.get("priority", ""))
    assignee_id = str(payload.get("assignee_id", ""))
    labels = payload.get("labels", [])
    if isinstance(labels, str):
        labels = [l.strip() for l in labels.split(",") if l.strip()]

    fields: dict[str, Any] = {
        "project": {"key": project_key},
        "summary": summary,
        "issuetype": {"name": issue_type},
    }
    if description:
        fields["description"] = {
            "type": "doc",
            "version": 1,
            "content": [{"type": "paragraph", "content": [{"type": "text", "text": description}]}],
        }
    if priority:
        fields["priority"] = {"name": priority}
    if assignee_id:
        fields["assignee"] = {"accountId": assignee_id}
    if labels:
        fields["labels"] = labels

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://{domain}/rest/api/3/issue",
            auth=(email, token),
            json={"fields": fields},
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()


async def search_issues(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    email, token = _build_auth(config)
    domain = str(payload.get("domain", ""))

    if not token or not domain:
        return {
            "simulated": True,
            "jql": payload.get("jql", ""),
            "issues": [
                {"key": "SIM-1", "summary": "Simulated issue 1", "status": "To Do"},
                {"key": "SIM-2", "summary": "Simulated issue 2", "status": "In Progress"},
            ],
        }

    jql = str(payload.get("jql", ""))
    max_results = int(payload.get("max_results", 25))

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://{domain}/rest/api/3/search",
            auth=(email, token),
            json={"jql": jql, "maxResults": max_results, "fields": ["summary", "status", "priority", "assignee", "created", "updated"]},
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        issues = [
            {
                "key": issue["key"],
                "summary": issue["fields"]["summary"],
                "status": issue["fields"]["status"]["name"],
                "priority": issue["fields"].get("priority", {}).get("name", ""),
                "assignee": (issue["fields"].get("assignee") or {}).get("displayName", "Unassigned"),
            }
            for issue in data.get("issues", [])
        ]
        return {"issues": issues, "total": data.get("total", 0)}


async def add_comment(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    email, token = _build_auth(config)
    domain = str(payload.get("domain", ""))
    issue_key = str(payload.get("issue_key", ""))

    if not token or not domain:
        return {"simulated": True, "issue_key": issue_key, "message": "No Jira credentials — comment simulated."}

    body_text = str(payload.get("body", ""))
    body_adf = {
        "type": "doc",
        "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": body_text}]}],
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://{domain}/rest/api/3/issue/{issue_key}/comment",
            auth=(email, token),
            json={"body": body_adf},
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()


async def transition_issue(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    email, token = _build_auth(config)
    domain = str(payload.get("domain", ""))
    issue_key = str(payload.get("issue_key", ""))
    transition_name = str(payload.get("transition_name", ""))

    if not token or not domain:
        return {"simulated": True, "issue_key": issue_key, "transition": transition_name, "message": "Simulated."}

    async with httpx.AsyncClient() as client:
        tr_resp = await client.get(
            f"https://{domain}/rest/api/3/issue/{issue_key}/transitions",
            auth=(email, token),
            timeout=10,
        )
        tr_resp.raise_for_status()
        transitions = tr_resp.json().get("transitions", [])
        target = next((t for t in transitions if t["name"].lower() == transition_name.lower()), None)
        if not target:
            available = [t["name"] for t in transitions]
            return {"error": f"Transition '{transition_name}' not found. Available: {available}"}

        resp = await client.post(
            f"https://{domain}/rest/api/3/issue/{issue_key}/transitions",
            auth=(email, token),
            json={"transition": {"id": target["id"]}},
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        return {"issue_key": issue_key, "transitioned_to": transition_name}


ACTIONS = {
    "create_issue": create_issue,
    "search_issues": search_issues,
    "add_comment": add_comment,
    "transition_issue": transition_issue,
}
