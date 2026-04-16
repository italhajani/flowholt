"""Stripe integration plugin.

Interact with Stripe for payment-related workflow automations.
"""

from __future__ import annotations

from typing import Any

import httpx

MANIFEST = {
    "key": "stripe",
    "label": "Stripe",
    "category": "Payments",
    "auth_kind": "api_key",
    "node_types": ["trigger", "output", "transform"],
    "description": "Process payments, manage customers, and handle Stripe events.",
    "operations": [
        {
            "key": "create_customer",
            "label": "Create customer",
            "direction": "action",
            "resource": "customer",
            "description": "Create a new Stripe customer.",
            "fields": [
                {"key": "email", "label": "Email", "type": "string", "required": True},
                {"key": "name", "label": "Name", "type": "string", "required": False},
                {"key": "description", "label": "Description", "type": "string", "required": False},
            ],
        },
        {
            "key": "list_charges",
            "label": "List charges",
            "direction": "action",
            "resource": "charge",
            "description": "List recent charges.",
            "fields": [
                {"key": "limit", "label": "Limit", "type": "number", "required": False, "default": 10},
                {"key": "customer", "label": "Customer ID", "type": "string", "required": False, "help": "Filter by customer."},
            ],
        },
        {
            "key": "webhook_event",
            "label": "Stripe event",
            "direction": "trigger",
            "resource": "event",
            "description": "Trigger on Stripe webhook events (payment, subscription, etc.).",
            "fields": [
                {"key": "event_types", "label": "Event types", "type": "tags", "required": False, "help": "e.g. payment_intent.succeeded, customer.created"},
            ],
        },
    ],
}


def _get_key(config: dict[str, Any]) -> str:
    return str(config.get("api_key") or config.get("secret_key") or "")


def create_customer(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    api_key = _get_key(config)
    email = config.get("email", "") or payload.get("email", "")
    name = config.get("name", "") or payload.get("name", "")

    if not api_key:
        return {"app": "stripe", "operation": "create_customer", "simulated": True, "email": email}

    data: dict[str, str] = {"email": email}
    if name:
        data["name"] = name
    if config.get("description"):
        data["description"] = config["description"]

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            "https://api.stripe.com/v1/customers",
            data=data,
            auth=(api_key, ""),
        )
        resp.raise_for_status()
        result = resp.json()

    return {
        "app": "stripe",
        "operation": "create_customer",
        "customer_id": result.get("id"),
        "email": result.get("email"),
        "delivered": True,
    }


def list_charges(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    api_key = _get_key(config)
    limit = int(config.get("limit", 10))

    if not api_key:
        return {"app": "stripe", "operation": "list_charges", "simulated": True, "charges": []}

    params: dict[str, Any] = {"limit": min(limit, 100)}
    if config.get("customer"):
        params["customer"] = config["customer"]

    with httpx.Client(timeout=30.0) as client:
        resp = client.get("https://api.stripe.com/v1/charges", params=params, auth=(api_key, ""))
        resp.raise_for_status()
        data = resp.json()

    charges = data.get("data", [])
    return {
        "app": "stripe",
        "operation": "list_charges",
        "charge_count": len(charges),
        "charges": [{"id": c.get("id"), "amount": c.get("amount"), "currency": c.get("currency"), "status": c.get("status")} for c in charges],
    }


def webhook_event(config: dict[str, Any], payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    return {"received": True, "source": "stripe", "event_types": config.get("event_types", [])}


ACTIONS = {
    "create_customer": create_customer,
    "list_charges": list_charges,
    "webhook_event": webhook_event,
}
