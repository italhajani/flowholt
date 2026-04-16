"""SendGrid integration plugin.

Send transactional and marketing emails via the SendGrid v3 API.
Uses API keys stored in vault connections.
"""

from __future__ import annotations

from typing import Any

import httpx

SENDGRID_API = "https://api.sendgrid.com/v3"

MANIFEST = {
    "key": "sendgrid",
    "label": "SendGrid",
    "category": "Communication",
    "auth_kind": "token",
    "node_types": ["output"],
    "description": "Send transactional emails, manage contacts, and track delivery via SendGrid.",
    "operations": [
        {
            "key": "send_email",
            "label": "Send email",
            "direction": "action",
            "resource": "mail",
            "description": "Send a transactional email via SendGrid.",
            "fields": [
                {"key": "to", "label": "To", "type": "string", "required": True, "help": "Recipient email address(es), comma-separated."},
                {"key": "from_email", "label": "From email", "type": "string", "required": True, "help": "Verified sender email address."},
                {"key": "from_name", "label": "From name", "type": "string", "required": False},
                {"key": "subject", "label": "Subject", "type": "string", "required": True},
                {"key": "body", "label": "Body", "type": "textarea", "required": True, "help": "Email body (plain text)."},
                {"key": "html_body", "label": "HTML body", "type": "textarea", "required": False, "help": "HTML version of the email body."},
                {"key": "template_id", "label": "Template ID", "type": "string", "required": False, "help": "SendGrid dynamic template ID."},
                {"key": "template_data", "label": "Template data (JSON)", "type": "textarea", "required": False, "help": "JSON object of template variables."},
            ],
        },
        {
            "key": "add_contact",
            "label": "Add/update contact",
            "direction": "action",
            "resource": "contact",
            "description": "Add or update a contact in SendGrid Marketing Contacts.",
            "fields": [
                {"key": "email", "label": "Email", "type": "string", "required": True},
                {"key": "first_name", "label": "First name", "type": "string", "required": False},
                {"key": "last_name", "label": "Last name", "type": "string", "required": False},
                {"key": "list_ids", "label": "List IDs", "type": "tags", "required": False, "help": "SendGrid contact list IDs (comma-separated)."},
            ],
        },
        {
            "key": "get_stats",
            "label": "Get email stats",
            "direction": "action",
            "resource": "stats",
            "description": "Retrieve email sending statistics.",
            "fields": [
                {"key": "start_date", "label": "Start date", "type": "string", "required": True, "help": "YYYY-MM-DD format."},
                {"key": "end_date", "label": "End date", "type": "string", "required": False, "help": "YYYY-MM-DD format. Defaults to today."},
            ],
        },
    ],
}


def _headers(config: dict[str, Any]) -> dict[str, str]:
    api_key = config.get("api_key") or config.get("token") or ""
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


async def send_email(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    api_key = config.get("api_key") or config.get("token") or ""
    if not api_key:
        return {
            "simulated": True,
            "to": payload.get("to", ""),
            "subject": payload.get("subject", ""),
            "message": "No SendGrid API key configured — email send simulated.",
        }

    to_emails = [addr.strip() for addr in str(payload.get("to", "")).split(",") if addr.strip()]
    from_email = str(payload.get("from_email", ""))
    from_name = str(payload.get("from_name", ""))
    subject = str(payload.get("subject", ""))
    body = str(payload.get("body", ""))
    html_body = str(payload.get("html_body", ""))
    template_id = str(payload.get("template_id", ""))

    personalizations: list[dict[str, Any]] = [{"to": [{"email": e} for e in to_emails]}]

    if template_id:
        template_data_raw = payload.get("template_data", "{}")
        if isinstance(template_data_raw, str):
            import json
            try:
                template_data = json.loads(template_data_raw)
            except (json.JSONDecodeError, ValueError):
                template_data = {}
        else:
            template_data = template_data_raw or {}
        personalizations[0]["dynamic_template_data"] = template_data

    mail_body: dict[str, Any] = {
        "personalizations": personalizations,
        "from": {"email": from_email},
        "subject": subject,
    }
    if from_name:
        mail_body["from"]["name"] = from_name
    if template_id:
        mail_body["template_id"] = template_id
    else:
        content = []
        if body:
            content.append({"type": "text/plain", "value": body})
        if html_body:
            content.append({"type": "text/html", "value": html_body})
        if not content:
            content.append({"type": "text/plain", "value": ""})
        mail_body["content"] = content

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SENDGRID_API}/mail/send",
            headers=_headers(config),
            json=mail_body,
            timeout=15,
        )
        if resp.status_code == 202:
            return {"success": True, "status_code": 202, "message": "Email accepted for delivery."}
        resp.raise_for_status()
        return {"success": True, "status_code": resp.status_code}


async def add_contact(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    api_key = config.get("api_key") or config.get("token") or ""
    if not api_key:
        return {
            "simulated": True,
            "email": payload.get("email", ""),
            "message": "No SendGrid API key — contact add simulated.",
        }

    contact: dict[str, Any] = {"email": str(payload.get("email", ""))}
    if payload.get("first_name"):
        contact["first_name"] = str(payload["first_name"])
    if payload.get("last_name"):
        contact["last_name"] = str(payload["last_name"])

    body: dict[str, Any] = {"contacts": [contact]}

    list_ids = payload.get("list_ids", [])
    if isinstance(list_ids, str):
        list_ids = [lid.strip() for lid in list_ids.split(",") if lid.strip()]
    if list_ids:
        body["list_ids"] = list_ids

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{SENDGRID_API}/marketing/contacts",
            headers=_headers(config),
            json=body,
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()


async def get_stats(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    api_key = config.get("api_key") or config.get("token") or ""
    if not api_key:
        return {
            "simulated": True,
            "stats": [
                {"date": "2024-01-15", "requests": 150, "delivered": 148, "opens": 89, "clicks": 34},
                {"date": "2024-01-16", "requests": 200, "delivered": 197, "opens": 112, "clicks": 45},
            ],
        }

    params: dict[str, str] = {"start_date": str(payload.get("start_date", ""))}
    if payload.get("end_date"):
        params["end_date"] = str(payload["end_date"])

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SENDGRID_API}/stats",
            headers=_headers(config),
            params=params,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        stats = []
        for entry in data:
            metrics = entry.get("stats", [{}])[0].get("metrics", {})
            stats.append({
                "date": entry.get("date", ""),
                "requests": metrics.get("requests", 0),
                "delivered": metrics.get("delivered", 0),
                "opens": metrics.get("opens", 0),
                "clicks": metrics.get("clicks", 0),
                "bounces": metrics.get("bounces", 0),
                "spam_reports": metrics.get("spam_reports", 0),
            })
        return {"stats": stats, "count": len(stats)}


ACTIONS = {
    "send_email": send_email,
    "add_contact": add_contact,
    "get_stats": get_stats,
}
