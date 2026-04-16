"""Twilio integration plugin.

Send SMS/WhatsApp messages and make calls via the Twilio REST API.
Uses Account SID + Auth Token stored in vault connections.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "twilio",
    "label": "Twilio",
    "category": "Communication",
    "auth_kind": "token",
    "node_types": ["trigger", "output"],
    "description": "Send SMS, WhatsApp messages, and make phone calls via Twilio.",
    "operations": [
        {
            "key": "send_sms",
            "label": "Send SMS",
            "direction": "action",
            "resource": "message",
            "description": "Send an SMS message via Twilio.",
            "fields": [
                {"key": "to", "label": "To", "type": "string", "required": True, "help": "Recipient phone number (E.164 format, e.g. +1234567890)."},
                {"key": "body", "label": "Message body", "type": "textarea", "required": True},
                {"key": "from_number", "label": "From number", "type": "string", "required": False, "help": "Your Twilio phone number. Uses account default if empty."},
            ],
        },
        {
            "key": "send_whatsapp",
            "label": "Send WhatsApp message",
            "direction": "action",
            "resource": "message",
            "description": "Send a WhatsApp message via Twilio.",
            "fields": [
                {"key": "to", "label": "To", "type": "string", "required": True, "help": "Recipient phone number (E.164 format)."},
                {"key": "body", "label": "Message body", "type": "textarea", "required": True},
                {"key": "from_number", "label": "From number", "type": "string", "required": False, "help": "Twilio WhatsApp-enabled number."},
            ],
        },
        {
            "key": "list_messages",
            "label": "List recent messages",
            "direction": "action",
            "resource": "message",
            "description": "Retrieve recent SMS messages from your Twilio account.",
            "fields": [
                {"key": "limit", "label": "Limit", "type": "number", "required": False, "help": "Number of messages (default 20)."},
                {"key": "to_filter", "label": "To filter", "type": "string", "required": False},
                {"key": "from_filter", "label": "From filter", "type": "string", "required": False},
            ],
        },
        {
            "key": "incoming_sms",
            "label": "Incoming SMS",
            "direction": "trigger",
            "resource": "message",
            "description": "Trigger when an SMS is received on your Twilio number.",
            "fields": [
                {"key": "phone_number", "label": "Twilio number", "type": "string", "required": False, "help": "Filter by specific Twilio number."},
            ],
        },
    ],
}


def _auth(config: dict[str, Any]) -> tuple[str, str]:
    account_sid = config.get("account_sid") or config.get("sid") or ""
    auth_token = config.get("auth_token") or config.get("token") or ""
    return account_sid, auth_token


async def send_sms(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    account_sid, auth_token = _auth(config)
    if not account_sid or not auth_token:
        return {
            "simulated": True,
            "to": payload.get("to", ""),
            "body": payload.get("body", "")[:50],
            "message": "No Twilio credentials configured — SMS simulated.",
        }

    to = str(payload.get("to", ""))
    body = str(payload.get("body", ""))
    from_number = str(payload.get("from_number", ""))

    form_data: dict[str, str] = {"To": to, "Body": body}
    if from_number:
        form_data["From"] = from_number

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
            auth=(account_sid, auth_token),
            data=form_data,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "sid": data.get("sid"),
            "status": data.get("status"),
            "to": data.get("to"),
            "from": data.get("from"),
            "body": data.get("body"),
        }


async def send_whatsapp(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    account_sid, auth_token = _auth(config)
    if not account_sid or not auth_token:
        return {
            "simulated": True,
            "to": payload.get("to", ""),
            "message": "No Twilio credentials — WhatsApp message simulated.",
        }

    to = f"whatsapp:{payload.get('to', '')}"
    body = str(payload.get("body", ""))
    from_number = payload.get("from_number", "")
    from_wa = f"whatsapp:{from_number}" if from_number else ""

    form_data: dict[str, str] = {"To": to, "Body": body}
    if from_wa:
        form_data["From"] = from_wa

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
            auth=(account_sid, auth_token),
            data=form_data,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        return {"sid": data.get("sid"), "status": data.get("status"), "to": data.get("to")}


async def list_messages(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    account_sid, auth_token = _auth(config)
    if not account_sid or not auth_token:
        return {
            "simulated": True,
            "messages": [
                {"sid": "sim-1", "to": "+1234567890", "body": "Simulated SMS 1", "status": "delivered"},
                {"sid": "sim-2", "to": "+0987654321", "body": "Simulated SMS 2", "status": "sent"},
            ],
        }

    params: dict[str, Any] = {"PageSize": int(payload.get("limit", 20))}
    if payload.get("to_filter"):
        params["To"] = str(payload["to_filter"])
    if payload.get("from_filter"):
        params["From"] = str(payload["from_filter"])

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
            auth=(account_sid, auth_token),
            params=params,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        messages = [
            {
                "sid": m.get("sid"),
                "to": m.get("to"),
                "from": m.get("from"),
                "body": m.get("body"),
                "status": m.get("status"),
                "date_sent": m.get("date_sent"),
            }
            for m in data.get("messages", [])
        ]
        return {"messages": messages, "count": len(messages)}


async def incoming_sms(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    return {
        "trigger": True,
        "type": "incoming_sms",
        "phone_number": payload.get("phone_number", ""),
        "message": "Twilio incoming SMS trigger configured — webhook will be registered.",
    }


ACTIONS = {
    "send_sms": send_sms,
    "send_whatsapp": send_whatsapp,
    "list_messages": list_messages,
    "incoming_sms": incoming_sms,
}
