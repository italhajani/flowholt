"""Airtable integration plugin.

Read and write to Airtable bases via the Web API.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "airtable",
    "label": "Airtable",
    "category": "Productivity",
    "auth_kind": "token",
    "node_types": ["output", "transform"],
    "description": "Create, read, and update records in Airtable bases.",
    "operations": [
        {
            "key": "list_records",
            "label": "List records",
            "direction": "action",
            "resource": "record",
            "description": "List records from an Airtable table.",
            "fields": [
                {"key": "base_id", "label": "Base ID", "type": "string", "required": True, "help": "The Airtable base ID (starts with 'app')."},
                {"key": "table_name", "label": "Table name", "type": "string", "required": True},
                {"key": "max_records", "label": "Max records", "type": "number", "required": False, "default": 20},
                {"key": "view", "label": "View", "type": "string", "required": False, "help": "Optional view name to filter by."},
            ],
        },
        {
            "key": "create_record",
            "label": "Create record",
            "direction": "action",
            "resource": "record",
            "description": "Create a new record in an Airtable table.",
            "fields": [
                {"key": "base_id", "label": "Base ID", "type": "string", "required": True},
                {"key": "table_name", "label": "Table name", "type": "string", "required": True},
                {"key": "fields_json", "label": "Fields (JSON)", "type": "textarea", "required": True, "help": "Record fields as JSON object."},
            ],
        },
    ],
}


def _get_token(config: dict[str, Any]) -> str:
    return str(config.get("token") or config.get("api_key") or "")


def _airtable_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def list_records(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    base_id = config.get("base_id", "")
    table_name = config.get("table_name", "")
    max_records = int(config.get("max_records", 20))
    token = _get_token(config)

    if not token:
        return {"app": "airtable", "operation": "list_records", "simulated": True, "base_id": base_id, "records": []}

    params: dict[str, Any] = {"maxRecords": min(max_records, 100)}
    if config.get("view"):
        params["view"] = config["view"]

    with httpx.Client(timeout=30.0) as client:
        resp = client.get(
            f"https://api.airtable.com/v0/{base_id}/{table_name}",
            params=params,
            headers=_airtable_headers(token),
        )
        resp.raise_for_status()
        data = resp.json()

    records = data.get("records", [])
    return {
        "app": "airtable",
        "operation": "list_records",
        "record_count": len(records),
        "records": [{"id": r.get("id"), "fields": r.get("fields", {})} for r in records],
    }


def create_record(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    base_id = config.get("base_id", "")
    table_name = config.get("table_name", "")
    token = _get_token(config)

    import json
    fields = {}
    if config.get("fields_json"):
        try:
            fields = json.loads(config["fields_json"])
        except json.JSONDecodeError:
            import logging
            logging.getLogger("flowholt.integrations.airtable").warning("Invalid fields_json, using empty fields")

    if not token:
        return {"app": "airtable", "operation": "create_record", "simulated": True, "fields": fields}

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"https://api.airtable.com/v0/{base_id}/{table_name}",
            json={"fields": fields},
            headers=_airtable_headers(token),
        )
        resp.raise_for_status()
        result = resp.json()

    return {
        "app": "airtable",
        "operation": "create_record",
        "record_id": result.get("id"),
        "delivered": True,
    }


ACTIONS = {
    "list_records": list_records,
    "create_record": create_record,
}
