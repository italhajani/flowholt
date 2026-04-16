"""Discord integration plugin.

Send messages and embeds to Discord channels via webhooks.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "discord",
    "label": "Discord",
    "category": "Communication",
    "auth_kind": "token",
    "node_types": ["output"],
    "description": "Send messages and embeds to Discord channels.",
    "operations": [
        {
            "key": "send_webhook_message",
            "label": "Send webhook message",
            "direction": "action",
            "resource": "message",
            "description": "Send a message to a Discord channel via webhook URL.",
            "fields": [
                {"key": "webhook_url", "label": "Webhook URL", "type": "string", "required": True, "help": "Discord webhook URL."},
                {"key": "content", "label": "Message", "type": "textarea", "required": True, "help": "Text content to send."},
                {"key": "username", "label": "Username override", "type": "string", "required": False, "help": "Override the webhook display name."},
            ],
        },
        {
            "key": "send_embed",
            "label": "Send embed",
            "direction": "action",
            "resource": "message",
            "description": "Send a rich embed message to Discord.",
            "fields": [
                {"key": "webhook_url", "label": "Webhook URL", "type": "string", "required": True},
                {"key": "title", "label": "Embed title", "type": "string", "required": True},
                {"key": "description", "label": "Embed description", "type": "textarea", "required": False},
                {"key": "color", "label": "Color (hex)", "type": "string", "required": False, "default": "5865F2"},
                {"key": "url", "label": "Link URL", "type": "string", "required": False},
            ],
        },
    ],
}


def send_webhook_message(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    webhook_url = config.get("webhook_url", "")
    content = config.get("content", "") or context.get("message", "") or context.get("text", "Workflow notification")
    username = config.get("username")

    if not webhook_url:
        return {"app": "discord", "operation": "send_webhook_message", "simulated": True, "content": content}

    body: dict[str, Any] = {"content": content}
    if username:
        body["username"] = username

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(webhook_url, json=body)
        resp.raise_for_status()

    return {"app": "discord", "operation": "send_webhook_message", "delivered": True, "content": content[:100]}


def send_embed(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    webhook_url = config.get("webhook_url", "")
    title = config.get("title", "Notification")
    description = config.get("description", "") or context.get("message", "")
    color_hex = str(config.get("color", "5865F2")).lstrip("#")
    url = config.get("url")

    if not webhook_url:
        return {"app": "discord", "operation": "send_embed", "simulated": True, "title": title}

    embed: dict[str, Any] = {"title": title, "description": description}
    try:
        embed["color"] = int(color_hex, 16)
    except ValueError:
        embed["color"] = 0x5865F2
    if url:
        embed["url"] = url

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(webhook_url, json={"embeds": [embed]})
        resp.raise_for_status()

    return {"app": "discord", "operation": "send_embed", "delivered": True, "title": title}


ACTIONS = {
    "send_webhook_message": send_webhook_message,
    "send_embed": send_embed,
}
