"""Google Sheets integration plugin.

Read from and write to Google Sheets via the Sheets API v4.
Uses service account credentials or API keys stored in vault.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "google_sheets",
    "label": "Google Sheets",
    "category": "Productivity",
    "auth_kind": "api_key",
    "node_types": ["trigger", "output", "transform"],
    "description": "Read, write, and append data to Google Sheets spreadsheets.",
    "operations": [
        {
            "key": "read_range",
            "label": "Read range",
            "direction": "action",
            "resource": "spreadsheet",
            "description": "Read values from a range in a spreadsheet.",
            "fields": [
                {"key": "spreadsheet_id", "label": "Spreadsheet ID", "type": "string", "required": True, "help": "The ID from the spreadsheet URL."},
                {"key": "range", "label": "Range", "type": "string", "required": True, "help": "e.g. Sheet1!A1:D10"},
            ],
        },
        {
            "key": "append_row",
            "label": "Append row",
            "direction": "action",
            "resource": "spreadsheet",
            "description": "Append a row of values to a spreadsheet.",
            "fields": [
                {"key": "spreadsheet_id", "label": "Spreadsheet ID", "type": "string", "required": True},
                {"key": "range", "label": "Sheet/Range", "type": "string", "required": True, "help": "e.g. Sheet1"},
                {"key": "values", "label": "Values", "type": "textarea", "required": True, "help": "JSON array of values, e.g. [\"Col1\", \"Col2\"]"},
            ],
        },
        {
            "key": "new_row_trigger",
            "label": "New row added",
            "direction": "trigger",
            "resource": "spreadsheet",
            "description": "Trigger when a new row is added to a spreadsheet (polling).",
            "fields": [
                {"key": "spreadsheet_id", "label": "Spreadsheet ID", "type": "string", "required": True},
                {"key": "sheet_name", "label": "Sheet name", "type": "string", "required": False, "default": "Sheet1"},
            ],
        },
    ],
}


def _get_api_key(config: dict[str, Any]) -> str:
    return str(config.get("api_key") or "")


def read_range(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    spreadsheet_id = config.get("spreadsheet_id", "")
    range_str = config.get("range", "Sheet1!A1:Z100")
    api_key = _get_api_key(config)

    if not api_key:
        return {"app": "google_sheets", "operation": "read_range", "simulated": True, "spreadsheet_id": spreadsheet_id, "range": range_str, "rows": []}

    url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{range_str}"
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(url, params={"key": api_key})
        resp.raise_for_status()
        data = resp.json()

    values = data.get("values", [])
    return {
        "app": "google_sheets",
        "operation": "read_range",
        "spreadsheet_id": spreadsheet_id,
        "range": data.get("range", range_str),
        "rows": values,
        "row_count": len(values),
    }


def append_row(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    spreadsheet_id = config.get("spreadsheet_id", "")
    range_str = config.get("range", "Sheet1")
    values_raw = config.get("values", "[]")
    api_key = _get_api_key(config)

    import json
    if isinstance(values_raw, str):
        try:
            values = json.loads(values_raw)
        except json.JSONDecodeError:
            values = [values_raw]
    else:
        values = values_raw if isinstance(values_raw, list) else [values_raw]

    if not api_key:
        return {"app": "google_sheets", "operation": "append_row", "simulated": True, "spreadsheet_id": spreadsheet_id, "values": values}

    url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{range_str}:append"
    body = {"values": [values], "majorDimension": "ROWS"}
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(url, json=body, params={"key": api_key, "valueInputOption": "USER_ENTERED", "insertDataOption": "INSERT_ROWS"})
        resp.raise_for_status()
        data = resp.json()

    return {
        "app": "google_sheets",
        "operation": "append_row",
        "spreadsheet_id": spreadsheet_id,
        "updated_range": data.get("updates", {}).get("updatedRange", ""),
        "delivered": True,
    }


def new_row_trigger(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    return {"received": True, "source": "google_sheets", "spreadsheet_id": config.get("spreadsheet_id", "")}


ACTIONS = {
    "read_range": read_range,
    "append_row": append_row,
    "new_row_trigger": new_row_trigger,
}
