"""GitHub integration plugin.

Provides actions for interacting with GitHub repositories via the REST API.
Uses personal access tokens stored in vault connections.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "github",
    "label": "GitHub",
    "category": "Development",
    "auth_kind": "token",
    "node_types": ["trigger", "output"],
    "description": "Create issues, manage PRs, and respond to repository events.",
    "operations": [
        {
            "key": "create_issue",
            "label": "Create issue",
            "direction": "action",
            "resource": "issue",
            "description": "Create a new issue in a GitHub repository.",
            "fields": [
                {"key": "owner", "label": "Owner", "type": "string", "required": True, "help": "Repository owner (user or org)."},
                {"key": "repo", "label": "Repository", "type": "string", "required": True, "help": "Repository name."},
                {"key": "title", "label": "Title", "type": "string", "required": True, "help": "Issue title."},
                {"key": "body", "label": "Body", "type": "textarea", "required": False, "help": "Issue body (Markdown)."},
                {"key": "labels", "label": "Labels", "type": "tags", "required": False, "help": "Comma-separated label names."},
            ],
        },
        {
            "key": "create_comment",
            "label": "Add comment",
            "direction": "action",
            "resource": "comment",
            "description": "Add a comment to an issue or pull request.",
            "fields": [
                {"key": "owner", "label": "Owner", "type": "string", "required": True},
                {"key": "repo", "label": "Repository", "type": "string", "required": True},
                {"key": "issue_number", "label": "Issue/PR number", "type": "number", "required": True},
                {"key": "body", "label": "Comment", "type": "textarea", "required": True},
            ],
        },
        {
            "key": "webhook_event",
            "label": "Repository event",
            "direction": "trigger",
            "resource": "event",
            "description": "Trigger on GitHub webhook events (push, PR, issue, etc.).",
            "fields": [
                {"key": "event_types", "label": "Event types", "type": "tags", "required": False, "help": "e.g. push, pull_request, issues"},
            ],
        },
    ],
}


def _get_token(config: dict[str, Any]) -> str:
    """Extract GitHub token from config (via vault connection or direct)."""
    return str(config.get("token") or config.get("api_key") or "")


def create_issue(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    owner = config.get("owner", "")
    repo = config.get("repo", "")
    title = config.get("title", "") or context.get("message", "Untitled")
    body = config.get("body", "") or context.get("text", "")
    labels = config.get("labels") or []
    if isinstance(labels, str):
        labels = [l.strip() for l in labels.split(",") if l.strip()]

    token = _get_token(config)
    if not token:
        return {"app": "github", "operation": "create_issue", "simulated": True, "owner": owner, "repo": repo, "title": title}

    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}
    data: dict[str, Any] = {"title": title, "body": body}
    if labels:
        data["labels"] = labels

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(f"https://api.github.com/repos/{owner}/{repo}/issues", json=data, headers=headers)
        resp.raise_for_status()
        result = resp.json()

    return {
        "app": "github",
        "operation": "create_issue",
        "issue_number": result.get("number"),
        "issue_url": result.get("html_url"),
        "title": result.get("title"),
        "delivered": True,
    }


def create_comment(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    owner = config.get("owner", "")
    repo = config.get("repo", "")
    issue_number = config.get("issue_number", "")
    body = config.get("body", "") or context.get("message", "")

    token = _get_token(config)
    if not token:
        return {"app": "github", "operation": "create_comment", "simulated": True, "issue_number": issue_number}

    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments",
            json={"body": body},
            headers=headers,
        )
        resp.raise_for_status()
        result = resp.json()

    return {
        "app": "github",
        "operation": "create_comment",
        "comment_id": result.get("id"),
        "comment_url": result.get("html_url"),
        "delivered": True,
    }


def webhook_event(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    return {"received": True, "source": "github", "event_types": config.get("event_types", [])}


ACTIONS = {
    "create_issue": create_issue,
    "create_comment": create_comment,
    "webhook_event": webhook_event,
}
