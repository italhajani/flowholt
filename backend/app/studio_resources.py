from __future__ import annotations

from typing import Any


def _resource_item(
    item_id: str,
    label: str,
    *,
    kind: str,
    subtitle: str | None = None,
    state: str = "ready",
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "id": item_id,
        "label": label,
        "kind": kind,
        "subtitle": subtitle,
        "state": state,
        "metadata": metadata or {},
    }


def build_node_resources(
    node_type: str,
    *,
    connections: list[dict[str, Any]] | None = None,
    credentials: list[dict[str, Any]] | None = None,
    variables: list[dict[str, Any]] | None = None,
    members: list[dict[str, Any]] | None = None,
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    connections = list(connections or [])
    credentials = list(credentials or [])
    variables = list(variables or [])
    members = list(members or [])
    config = dict(config or {})

    warnings: list[str] = []
    groups: list[dict[str, Any]] = []

    if node_type == "llm":
        provider = str(config.get("provider") or "openai").lower()
        provider_connections = [
            _resource_item(
                asset["name"],
                asset["name"],
                kind="connection",
                subtitle=f"{asset.get('app') or provider} connection",
                metadata={"app": asset.get("app"), "scope": asset.get("scope")},
            )
            for asset in connections
            if str(asset.get("app") or "").lower() == provider
        ]
        provider_credentials = [
            _resource_item(
                asset["name"],
                asset["name"],
                kind="credential",
                subtitle=f"{asset.get('credential_type') or 'Credential'}",
                metadata={"app": asset.get("app"), "scope": asset.get("scope")},
            )
            for asset in credentials
            if str(asset.get("app") or "").lower() == provider
        ]
        model_variables = [
            _resource_item(
                asset["name"],
                asset["name"],
                kind="variable",
                subtitle=str(dict(asset.get("secret") or {}).get("value") or ""),
                metadata={"scope": asset.get("scope")},
            )
            for asset in variables
            if "model" in str(asset["name"]).lower()
        ]
        groups.extend(
            [
                {"id": "connections", "title": "Provider connections", "items": provider_connections},
                {"id": "credentials", "title": "Provider credentials", "items": provider_credentials},
                {"id": "variables", "title": "Model variables", "items": model_variables},
            ]
        )
        if not provider_connections and not provider_credentials:
            warnings.append("No saved AI provider auth sources are available for this node yet.")

    elif node_type == "output":
        output_connections = []
        channel_options = []
        for asset in connections:
            secret = dict(asset.get("secret") or {})
            has_delivery = any(secret.get(key) for key in ("channel", "webhook_url", "queue", "destination", "topic"))
            state = "ready" if has_delivery else "warning"
            output_connections.append(
                _resource_item(
                    asset["name"],
                    asset["name"],
                    kind="connection",
                    subtitle=str(asset.get("app") or "Connection"),
                    state=state,
                    metadata={"fields": sorted(secret.keys())},
                )
            )
            for key in ("channel", "queue", "destination", "topic"):
                if secret.get(key):
                    channel_options.append(
                        _resource_item(
                            f"{asset['name']}:{key}",
                            str(secret[key]),
                            kind="option",
                            subtitle=asset["name"],
                            metadata={"field": key},
                        )
                    )
        webhook_variables = [
            _resource_item(
                asset["name"],
                asset["name"],
                kind="variable",
                subtitle=str(dict(asset.get("secret") or {}).get("value") or ""),
                metadata={"scope": asset.get("scope")},
            )
            for asset in variables
            if "webhook" in str(asset["name"]).lower() or "url" in str(asset["name"]).lower()
        ]
        groups.extend(
            [
                {"id": "connections", "title": "Delivery connections", "items": output_connections},
                {"id": "channels", "title": "Suggested channels", "items": channel_options},
                {"id": "variables", "title": "Webhook variables", "items": webhook_variables},
            ]
        )
        if not output_connections and not webhook_variables:
            warnings.append("No saved delivery connections or webhook variables are available yet.")

    elif node_type == "human":
        groups.append(
            {
                "id": "members",
                "title": "Assignable members",
                "items": [
                    _resource_item(
                        member["user_id"],
                        member["name"],
                        kind="member",
                        subtitle=f"{member['role']} · {member['email']}",
                        metadata={"role": member["role"], "email": member["email"]},
                    )
                    for member in members
                ],
            }
        )
        if not members:
            warnings.append("No active workspace members are available to assign this task to.")

    elif node_type == "callback":
        callback_connections = [
            _resource_item(
                asset["name"],
                asset["name"],
                kind="connection",
                subtitle=str(asset.get("app") or "Connection"),
                metadata={"fields": sorted(dict(asset.get("secret") or {}).keys())},
            )
            for asset in connections
        ]
        groups.append({"id": "connections", "title": "Callback owners", "items": callback_connections})
        if not callback_connections:
            warnings.append("No saved connections are available to own callback routes.")

    else:
        shared_connections = [
            _resource_item(
                asset["name"],
                asset["name"],
                kind="connection",
                subtitle=str(asset.get("app") or "Connection"),
                metadata={"scope": asset.get("scope")},
            )
            for asset in connections
        ]
        shared_variables = [
            _resource_item(
                asset["name"],
                asset["name"],
                kind="variable",
                subtitle=str(dict(asset.get("secret") or {}).get("value") or ""),
                metadata={"scope": asset.get("scope")},
            )
            for asset in variables
        ]
        groups.extend(
            [
                {"id": "connections", "title": "Workspace connections", "items": shared_connections},
                {"id": "variables", "title": "Workspace variables", "items": shared_variables},
            ]
        )

    return {
        "node_type": node_type,
        "groups": groups,
        "warnings": warnings,
    }


def build_vault_asset_health(asset: dict[str, Any], *, workspace_id: str | None = None) -> dict[str, Any]:
    secret = dict(asset.get("secret") or {})
    kind = str(asset.get("kind") or "")
    app = str(asset.get("app") or "")
    checks: list[dict[str, Any]] = []

    if kind == "connection":
        required_keys = ["channel"] if app.lower() == "slack" else ["api_key", "base_url"] if app.lower() in {"openai", "anthropic"} else []
        if not required_keys:
            required_keys = list(secret.keys())[:2] or ["secret"]
        for key in required_keys:
            passed = bool(secret.get(key))
            checks.append(
                {
                    "code": f"secret.{key}",
                    "label": f"{key} configured",
                    "passed": passed,
                    "severity": "error" if not passed else "info",
                    "message": f"{key} is {'present' if passed else 'missing'} for this connection.",
                }
            )
    elif kind == "credential":
        passed = bool(secret)
        checks.append(
            {
                "code": "credential.secret_present",
                "label": "Credential data present",
                "passed": passed,
                "severity": "error" if not passed else "info",
                "message": "Credential contains secret fields." if passed else "Credential has no secret data configured.",
            }
        )
    elif kind == "variable":
        passed = "value" in secret and secret.get("value") not in (None, "")
        checks.append(
            {
                "code": "variable.value_present",
                "label": "Variable value present",
                "passed": passed,
                "severity": "error" if not passed else "info",
                "message": "Variable has a usable value." if passed else "Variable is missing a usable value.",
            }
        )

    healthy = all(check["passed"] for check in checks) if checks else False
    return {
        "asset_id": str(asset["id"]),
        "workspace_id": str(workspace_id or asset.get("workspace_id") or ""),
        "name": str(asset["name"]),
        "kind": kind,
        "app": asset.get("app"),
        "healthy": healthy,
        "checks": checks,
    }
