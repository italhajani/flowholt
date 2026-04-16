"""HTTP Request integration plugin.

Generic HTTP client for calling any REST API — the universal integration.
"""

from __future__ import annotations

import json
from typing import Any

import httpx

MANIFEST = {
    "key": "http_request",
    "label": "HTTP Request",
    "category": "HTTP",
    "auth_kind": "none",
    "node_types": ["transform", "output"],
    "description": "Make HTTP requests to any API endpoint. The universal integration.",
    "operations": [
        {
            "key": "request",
            "label": "HTTP Request",
            "direction": "action",
            "resource": "request",
            "description": "Send an HTTP request and return the response.",
            "fields": [
                {"key": "url", "label": "URL", "type": "string", "required": True, "help": "The URL to send the request to."},
                {"key": "method", "label": "Method", "type": "select", "required": False, "default": "GET", "options": [
                    {"value": "GET", "label": "GET"},
                    {"value": "POST", "label": "POST"},
                    {"value": "PUT", "label": "PUT"},
                    {"value": "PATCH", "label": "PATCH"},
                    {"value": "DELETE", "label": "DELETE"},
                ]},
                {"key": "headers_json", "label": "Headers (JSON)", "type": "textarea", "required": False, "help": "Request headers as JSON object."},
                {"key": "body", "label": "Body", "type": "textarea", "required": False, "help": "Request body (for POST/PUT/PATCH)."},
                {"key": "timeout", "label": "Timeout (seconds)", "type": "number", "required": False, "default": 30},
            ],
        },
    ],
}


def request(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    url = config.get("url", "")
    method = str(config.get("method", "GET")).upper()
    timeout = float(config.get("timeout", 30))
    body_raw = config.get("body", "")

    if not url:
        return {"app": "http_request", "operation": "request", "error": "URL is required"}

    # Parse headers
    headers: dict[str, str] = {}
    if config.get("headers_json"):
        try:
            headers = json.loads(config["headers_json"])
        except json.JSONDecodeError:
            import logging
            logging.getLogger("flowholt.integrations.http_request").warning("Invalid headers_json, using empty headers")

    # Parse body
    json_body = None
    content_body = None
    if body_raw and method in {"POST", "PUT", "PATCH"}:
        try:
            json_body = json.loads(body_raw)
        except (json.JSONDecodeError, TypeError):
            content_body = str(body_raw)

    with httpx.Client(timeout=timeout) as client:
        resp = client.request(
            method,
            url,
            headers=headers,
            json=json_body,
            content=content_body.encode() if content_body else None,
        )

    # Try to parse response as JSON
    try:
        response_data = resp.json()
    except Exception:
        response_data = resp.text

    return {
        "app": "http_request",
        "operation": "request",
        "status_code": resp.status_code,
        "headers": dict(resp.headers),
        "data": response_data,
        "delivered": resp.is_success,
    }


ACTIONS = {
    "request": request,
}
