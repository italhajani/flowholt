"""Telegram integration plugin.

Send messages via the Telegram Bot API.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "telegram",
    "label": "Telegram",
    "category": "Communication",
    "auth_kind": "token",
    "node_types": ["output"],
    "description": "Send messages and notifications via Telegram bots.",
    "operations": [
        {
            "key": "send_message",
            "label": "Send message",
            "direction": "action",
            "resource": "message",
            "description": "Send a text message to a Telegram chat.",
            "fields": [
                {"key": "bot_token", "label": "Bot token", "type": "string", "required": True, "help": "Telegram bot token from BotFather."},
                {"key": "chat_id", "label": "Chat ID", "type": "string", "required": True, "help": "Target chat, group, or channel ID."},
                {"key": "text", "label": "Message", "type": "textarea", "required": True},
                {"key": "parse_mode", "label": "Parse mode", "type": "select", "required": False, "default": "HTML", "options": [{"value": "HTML", "label": "HTML"}, {"value": "Markdown", "label": "Markdown"}, {"value": "", "label": "Plain text"}]},
            ],
        },
    ],
}


def send_message(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    bot_token = config.get("bot_token", "") or config.get("token", "")
    chat_id = config.get("chat_id", "")
    text = config.get("text", "") or context.get("message", "") or context.get("text", "Workflow notification")
    parse_mode = config.get("parse_mode", "HTML")

    if not bot_token:
        return {"app": "telegram", "operation": "send_message", "simulated": True, "chat_id": chat_id, "text": text[:100]}

    body: dict[str, Any] = {"chat_id": chat_id, "text": text}
    if parse_mode:
        body["parse_mode"] = parse_mode

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(f"https://api.telegram.org/bot{bot_token}/sendMessage", json=body)
        resp.raise_for_status()
        result = resp.json()

    msg = result.get("result", {})
    return {
        "app": "telegram",
        "operation": "send_message",
        "message_id": msg.get("message_id"),
        "chat_id": chat_id,
        "delivered": True,
    }


ACTIONS = {
    "send_message": send_message,
}
