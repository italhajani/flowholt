"""Linear integration plugin.

Create and manage issues in Linear via the GraphQL API.
Uses API keys stored in vault connections.
"""

from __future__ import annotations

from typing import Any

import httpx

LINEAR_API = "https://api.linear.app/graphql"

MANIFEST = {
    "key": "linear",
    "label": "Linear",
    "category": "Project Management",
    "auth_kind": "token",
    "node_types": ["trigger", "output"],
    "description": "Create issues, search projects, and track updates in Linear.",
    "operations": [
        {
            "key": "create_issue",
            "label": "Create issue",
            "direction": "action",
            "resource": "issue",
            "description": "Create a new issue in a Linear team.",
            "fields": [
                {"key": "team_key", "label": "Team key", "type": "string", "required": True, "help": "Linear team identifier (e.g. ENG)."},
                {"key": "title", "label": "Title", "type": "string", "required": True},
                {"key": "description", "label": "Description", "type": "textarea", "required": False, "help": "Markdown description."},
                {"key": "priority", "label": "Priority (0-4)", "type": "number", "required": False, "help": "0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low."},
                {"key": "assignee_email", "label": "Assignee email", "type": "string", "required": False},
                {"key": "labels", "label": "Label names", "type": "tags", "required": False},
            ],
        },
        {
            "key": "list_issues",
            "label": "List issues",
            "direction": "action",
            "resource": "issue",
            "description": "Query recent issues from a team.",
            "fields": [
                {"key": "team_key", "label": "Team key", "type": "string", "required": False},
                {"key": "status_filter", "label": "Status filter", "type": "string", "required": False, "help": "e.g. In Progress, Done, Backlog."},
                {"key": "limit", "label": "Limit", "type": "number", "required": False, "help": "Default 20."},
            ],
        },
        {
            "key": "update_issue",
            "label": "Update issue",
            "direction": "action",
            "resource": "issue",
            "description": "Update an existing Linear issue.",
            "fields": [
                {"key": "issue_id", "label": "Issue ID", "type": "string", "required": True, "help": "Linear issue UUID."},
                {"key": "title", "label": "New title", "type": "string", "required": False},
                {"key": "state_name", "label": "New status", "type": "string", "required": False, "help": "e.g. In Progress, Done."},
                {"key": "priority", "label": "New priority (0-4)", "type": "number", "required": False},
            ],
        },
        {
            "key": "webhook_event",
            "label": "Linear event",
            "direction": "trigger",
            "resource": "event",
            "description": "Trigger on Linear webhook events (issue created, updated, etc.).",
            "fields": [
                {"key": "event_types", "label": "Event types", "type": "tags", "required": False, "help": "e.g. Issue, Comment, Project."},
            ],
        },
    ],
}


def _headers(config: dict[str, Any]) -> dict[str, str]:
    token = config.get("api_key") or config.get("token") or ""
    return {
        "Authorization": token,
        "Content-Type": "application/json",
    }


async def create_issue(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    token = config.get("api_key") or config.get("token") or ""
    if not token:
        return {
            "simulated": True,
            "team_key": payload.get("team_key", ""),
            "title": payload.get("title", ""),
            "message": "No Linear API key configured — issue creation simulated.",
        }

    team_key = str(payload.get("team_key", ""))
    title = str(payload.get("title", ""))
    description = str(payload.get("description", ""))
    priority = payload.get("priority")

    # Resolve team ID from team key
    team_query = """query { teams { nodes { id key } } }"""
    async with httpx.AsyncClient() as client:
        team_resp = await client.post(LINEAR_API, headers=_headers(config), json={"query": team_query}, timeout=10)
        team_resp.raise_for_status()
        teams = team_resp.json().get("data", {}).get("teams", {}).get("nodes", [])
        team = next((t for t in teams if t["key"].upper() == team_key.upper()), None)
        if not team:
            return {"error": f"Team '{team_key}' not found. Available: {[t['key'] for t in teams]}"}

        mutation = """
        mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
                success
                issue { id identifier title url }
            }
        }
        """
        variables: dict[str, Any] = {"input": {"teamId": team["id"], "title": title}}
        if description:
            variables["input"]["description"] = description
        if priority is not None:
            variables["input"]["priority"] = int(priority)

        resp = await client.post(LINEAR_API, headers=_headers(config), json={"query": mutation, "variables": variables}, timeout=15)
        resp.raise_for_status()
        result = resp.json()
        issue_data = result.get("data", {}).get("issueCreate", {})
        return {"success": issue_data.get("success", False), "issue": issue_data.get("issue", {})}


async def list_issues(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    token = config.get("api_key") or config.get("token") or ""
    if not token:
        return {
            "simulated": True,
            "issues": [
                {"identifier": "ENG-1", "title": "Simulated issue", "status": "In Progress"},
                {"identifier": "ENG-2", "title": "Another simulated issue", "status": "Backlog"},
            ],
        }

    limit = int(payload.get("limit", 20))
    query = f"""
    query {{
        issues(first: {limit}, orderBy: updatedAt) {{
            nodes {{ id identifier title state {{ name }} priority assignee {{ name email }} url }}
        }}
    }}
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(LINEAR_API, headers=_headers(config), json={"query": query}, timeout=15)
        resp.raise_for_status()
        nodes = resp.json().get("data", {}).get("issues", {}).get("nodes", [])
        issues = [
            {
                "id": n["id"],
                "identifier": n["identifier"],
                "title": n["title"],
                "status": n.get("state", {}).get("name", ""),
                "priority": n.get("priority"),
                "assignee": (n.get("assignee") or {}).get("name", "Unassigned"),
                "url": n.get("url", ""),
            }
            for n in nodes
        ]
        return {"issues": issues, "count": len(issues)}


async def update_issue(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    token = config.get("api_key") or config.get("token") or ""
    issue_id = str(payload.get("issue_id", ""))

    if not token:
        return {"simulated": True, "issue_id": issue_id, "message": "No Linear API key — update simulated."}

    mutation = """
    mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
            success
            issue { id identifier title state { name } }
        }
    }
    """
    update_input: dict[str, Any] = {}
    if payload.get("title"):
        update_input["title"] = str(payload["title"])
    if payload.get("priority") is not None:
        update_input["priority"] = int(payload["priority"])

    # State transition requires looking up state ID
    if payload.get("state_name"):
        state_query = """query { workflowStates { nodes { id name } } }"""
        async with httpx.AsyncClient() as client:
            sr = await client.post(LINEAR_API, headers=_headers(config), json={"query": state_query}, timeout=10)
            sr.raise_for_status()
            states = sr.json().get("data", {}).get("workflowStates", {}).get("nodes", [])
            target = next((s for s in states if s["name"].lower() == str(payload["state_name"]).lower()), None)
            if target:
                update_input["stateId"] = target["id"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            LINEAR_API,
            headers=_headers(config),
            json={"query": mutation, "variables": {"id": issue_id, "input": update_input}},
            timeout=15,
        )
        resp.raise_for_status()
        result = resp.json()
        return result.get("data", {}).get("issueUpdate", {})


async def webhook_event(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    return {
        "trigger": True,
        "type": "linear_event",
        "event_types": payload.get("event_types", []),
        "message": "Linear webhook trigger configured.",
    }


ACTIONS = {
    "create_issue": create_issue,
    "list_issues": list_issues,
    "update_issue": update_issue,
    "webhook_event": webhook_event,
}
