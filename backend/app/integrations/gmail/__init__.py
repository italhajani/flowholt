"""Gmail integration plugin.

Send emails and read inbox via the Gmail API.
Uses OAuth2 credentials or app-specific passwords stored in vault connections.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "gmail",
    "label": "Gmail",
    "category": "Communication",
    "auth_kind": "oauth2",
    "node_types": ["trigger", "output"],
    "description": "Send emails, read inbox, and react to new messages via Gmail.",
    "operations": [
        {
            "key": "send_email",
            "label": "Send email",
            "direction": "action",
            "resource": "message",
            "description": "Send an email from the connected Gmail account.",
            "fields": [
                {"key": "to", "label": "To", "type": "string", "required": True, "help": "Recipient email address(es), comma-separated."},
                {"key": "subject", "label": "Subject", "type": "string", "required": True},
                {"key": "body", "label": "Body", "type": "textarea", "required": True, "help": "Email body (plain text or HTML)."},
                {"key": "cc", "label": "CC", "type": "string", "required": False},
                {"key": "bcc", "label": "BCC", "type": "string", "required": False},
                {"key": "html", "label": "Send as HTML", "type": "boolean", "required": False, "help": "If true, body is treated as HTML."},
            ],
        },
        {
            "key": "list_messages",
            "label": "List messages",
            "direction": "action",
            "resource": "message",
            "description": "Fetch recent messages from the inbox.",
            "fields": [
                {"key": "query", "label": "Search query", "type": "string", "required": False, "help": "Gmail search query (e.g. 'is:unread from:user@example.com')."},
                {"key": "max_results", "label": "Max results", "type": "number", "required": False, "help": "Number of messages to return (default 10)."},
            ],
        },
        {
            "key": "new_email_trigger",
            "label": "New email received",
            "direction": "trigger",
            "resource": "message",
            "description": "Trigger when a new email arrives matching filters.",
            "fields": [
                {"key": "label", "label": "Label filter", "type": "string", "required": False, "help": "Only trigger for emails with this label (e.g. INBOX, IMPORTANT)."},
                {"key": "from_filter", "label": "From filter", "type": "string", "required": False, "help": "Only trigger for emails from this address."},
            ],
        },
    ],
}


import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def _build_raw_email(to: str, subject: str, body: str, cc: str = "", bcc: str = "", html: bool = False) -> str:
    if html:
        msg = MIMEMultipart("alternative")
        msg.attach(MIMEText(body, "html"))
    else:
        msg = MIMEText(body, "plain")
    msg["To"] = to
    msg["Subject"] = subject
    if cc:
        msg["Cc"] = cc
    if bcc:
        msg["Bcc"] = bcc
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("ascii")
    return raw


async def send_email(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    token = config.get("access_token") or config.get("token") or ""
    if not token:
        return {
            "simulated": True,
            "to": payload.get("to", ""),
            "subject": payload.get("subject", ""),
            "message": "No Gmail OAuth token configured — email send simulated.",
        }

    to = str(payload.get("to", ""))
    subject = str(payload.get("subject", ""))
    body = str(payload.get("body", ""))
    cc = str(payload.get("cc", ""))
    bcc = str(payload.get("bcc", ""))
    html = bool(payload.get("html", False))

    raw = _build_raw_email(to, subject, body, cc, bcc, html)

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"raw": raw},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()


async def list_messages(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    token = config.get("access_token") or config.get("token") or ""
    if not token:
        return {
            "simulated": True,
            "messages": [
                {"id": "sim-1", "snippet": "Simulated inbox message 1", "from": "user@example.com"},
                {"id": "sim-2", "snippet": "Simulated inbox message 2", "from": "boss@company.com"},
            ],
        }

    query = str(payload.get("query", ""))
    max_results = int(payload.get("max_results", 10))

    params: dict[str, Any] = {"maxResults": max_results}
    if query:
        params["q"] = query

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            headers={"Authorization": f"Bearer {token}"},
            params=params,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        messages = data.get("messages", [])

        detailed = []
        for msg_ref in messages[:max_results]:
            msg_resp = await client.get(
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_ref['id']}",
                headers={"Authorization": f"Bearer {token}"},
                params={"format": "metadata", "metadataHeaders": ["From", "Subject"]},
                timeout=10,
            )
            if msg_resp.is_success:
                msg_data = msg_resp.json()
                headers_map = {h["name"]: h["value"] for h in msg_data.get("payload", {}).get("headers", [])}
                detailed.append({
                    "id": msg_data["id"],
                    "snippet": msg_data.get("snippet", ""),
                    "from": headers_map.get("From", ""),
                    "subject": headers_map.get("Subject", ""),
                })

        return {"messages": detailed, "result_count": len(detailed)}


async def new_email_trigger(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    return {
        "trigger": True,
        "type": "new_email",
        "label_filter": payload.get("label", "INBOX"),
        "from_filter": payload.get("from_filter", ""),
        "message": "Gmail trigger configured — will poll for new messages.",
    }


ACTIONS = {
    "send_email": send_email,
    "list_messages": list_messages,
    "new_email_trigger": new_email_trigger,
}
