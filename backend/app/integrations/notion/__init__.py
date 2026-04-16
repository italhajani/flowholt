"""Notion integration plugin.

Create and update pages in Notion databases.
Uses Notion API v2022-06-28.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "notion",
    "label": "Notion",
    "category": "Productivity",
    "auth_kind": "token",
    "node_types": ["output", "transform"],
    "description": "Create pages, query databases, and update properties in Notion.",
    "operations": [
        {
            "key": "create_page",
            "label": "Create page",
            "direction": "action",
            "resource": "page",
            "description": "Create a new page in a Notion database.",
            "fields": [
                {"key": "database_id", "label": "Database ID", "type": "string", "required": True, "help": "The Notion database to add the page to."},
                {"key": "title", "label": "Title", "type": "string", "required": True, "help": "Page title."},
                {"key": "properties_json", "label": "Properties (JSON)", "type": "textarea", "required": False, "help": "Additional properties as JSON."},
            ],
        },
        {
            "key": "query_database",
            "label": "Query database",
            "direction": "action",
            "resource": "database",
            "description": "Query a Notion database with optional filters.",
            "fields": [
                {"key": "database_id", "label": "Database ID", "type": "string", "required": True},
                {"key": "filter_json", "label": "Filter (JSON)", "type": "textarea", "required": False, "help": "Notion filter object as JSON."},
                {"key": "page_size", "label": "Page size", "type": "number", "required": False, "default": 10},
            ],
        },
    ],
}


def _get_token(config: dict[str, Any]) -> str:
    return str(config.get("token") or config.get("api_key") or "")


def _notion_headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
    }


def create_page(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    database_id = config.get("database_id", "")
    title = config.get("title", "") or context.get("message", "Untitled")
    token = _get_token(config)

    if not token:
        return {"app": "notion", "operation": "create_page", "simulated": True, "database_id": database_id, "title": title}

    import json
    extra_props = {}
    if config.get("properties_json"):
        try:
            extra_props = json.loads(config["properties_json"])
        except json.JSONDecodeError:
            import logging
            logging.getLogger("flowholt.integrations.notion").warning("Invalid properties_json, using empty properties")

    properties: dict[str, Any] = {
        "Name": {"title": [{"text": {"content": title}}]},
        **extra_props,
    }

    body = {
        "parent": {"database_id": database_id},
        "properties": properties,
    }

    with httpx.Client(timeout=30.0) as client:
        resp = client.post("https://api.notion.com/v1/pages", json=body, headers=_notion_headers(token))
        resp.raise_for_status()
        result = resp.json()

    return {
        "app": "notion",
        "operation": "create_page",
        "page_id": result.get("id"),
        "page_url": result.get("url"),
        "delivered": True,
    }


def query_database(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    database_id = config.get("database_id", "")
    page_size = int(config.get("page_size", 10))
    token = _get_token(config)

    if not token:
        return {"app": "notion", "operation": "query_database", "simulated": True, "database_id": database_id, "results": []}

    import json
    body: dict[str, Any] = {"page_size": min(page_size, 100)}
    if config.get("filter_json"):
        try:
            body["filter"] = json.loads(config["filter_json"])
        except json.JSONDecodeError:
            import logging
            logging.getLogger("flowholt.integrations.notion").warning("Invalid filter_json, skipping filter")

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"https://api.notion.com/v1/databases/{database_id}/query",
            json=body,
            headers=_notion_headers(token),
        )
        resp.raise_for_status()
        data = resp.json()

    results = data.get("results", [])
    return {
        "app": "notion",
        "operation": "query_database",
        "database_id": database_id,
        "result_count": len(results),
        "results": [{"id": r.get("id"), "url": r.get("url")} for r in results],
    }


ACTIONS = {
    "create_page": create_page,
    "query_database": query_database,
}
