from __future__ import annotations

from typing import Any


_HELP_ARTICLES: list[dict[str, Any]] = [
    {
        "id": "help-guide-connect-app",
        "category": "guides",
        "title": "Connect your first app",
        "summary": "Create a workspace connection, verify it, and reuse it across triggers and actions.",
        "action_label": "Open Vault",
        "action_href": "/dashboard/environment",
        "action_kind": "link",
    },
    {
        "id": "help-guide-ai-provider",
        "category": "guides",
        "title": "Add AI providers",
        "summary": "Connect Gemini, Groq, Ollama, or OpenAI-compatible credentials and verify them before use.",
        "action_label": "Open Providers",
        "action_href": "/dashboard/providers",
        "action_kind": "link",
    },
    {
        "id": "help-guide-webhooks",
        "category": "guides",
        "title": "Set up webhook security",
        "summary": "Configure public base URLs, signing secrets, and runtime access rules for inbound events.",
        "action_label": "Open Settings",
        "action_href": "/dashboard/settings",
        "action_kind": "link",
    },
    {
        "id": "help-troubleshooting-oauth",
        "category": "troubleshooting",
        "title": "OAuth connection failed",
        "summary": "Verify redirect URI, client credentials, and provider scopes, then reconnect the app.",
        "action_label": "Reconnect in Providers",
        "action_href": "/dashboard/providers",
        "action_kind": "link",
    },
    {
        "id": "help-troubleshooting-webhook",
        "category": "troubleshooting",
        "title": "Webhook is not firing",
        "summary": "Check public base URL, trigger path, and whether signature validation is blocking the request.",
        "action_label": "Inspect Webhooks",
        "action_href": "/dashboard/webhooks",
        "action_kind": "link",
    },
    {
        "id": "help-troubleshooting-llm",
        "category": "troubleshooting",
        "title": "Model request failed",
        "summary": "Review provider availability, stored API credentials, and fallback order before rerunning.",
        "action_label": "Review Providers",
        "action_href": "/dashboard/providers",
        "action_kind": "link",
    },
    {
        "id": "help-security-vault",
        "category": "security",
        "title": "Protect shared credentials",
        "summary": "Use workspace-owned vault assets, restrict production access, and verify health before deployment.",
        "action_label": "Review Vault",
        "action_href": "/dashboard/environment",
        "action_kind": "link",
    },
    {
        "id": "help-security-rbac",
        "category": "security",
        "title": "Harden workspace access",
        "summary": "Review member roles, publish permissions, and self-approval rules in workspace settings.",
        "action_label": "Open Settings",
        "action_href": "/dashboard/settings",
        "action_kind": "link",
    },
    {
        "id": "help-security-audit",
        "category": "security",
        "title": "Trace admin activity",
        "summary": "Use the audit log to inspect connection changes, settings updates, and credential access events.",
        "action_label": "Open Audit Log",
        "action_href": "/dashboard/audit",
        "action_kind": "link",
    },
    {
        "id": "help-contact-support",
        "category": "contact",
        "title": "General support",
        "summary": "Email support for implementation issues, debugging help, or setup questions.",
        "action_label": "support@flowholt.com",
        "action_href": "mailto:support@flowholt.com",
        "action_kind": "email",
    },
    {
        "id": "help-contact-success",
        "category": "contact",
        "title": "Workspace success",
        "summary": "Reach out for rollout guidance, integration planning, and governance design help.",
        "action_label": "success@flowholt.com",
        "action_href": "mailto:success@flowholt.com",
        "action_kind": "email",
    },
    {
        "id": "help-contact-priority",
        "category": "contact",
        "title": "Urgent incident",
        "summary": "Use the in-product support chat path for production incidents or broken credentials.",
        "action_label": "Open support chat",
        "action_href": None,
        "action_kind": "chat",
    },
]


def list_help_articles(*, category: str | None = None, query: str | None = None) -> list[dict[str, Any]]:
    category_filter = (category or "").strip().lower()
    query_filter = (query or "").strip().lower()

    items = _HELP_ARTICLES
    if category_filter:
        items = [item for item in items if item["category"] == category_filter]
    if query_filter:
        items = [
            item for item in items
            if query_filter in item["title"].lower() or query_filter in item["summary"].lower()
        ]
    return items
