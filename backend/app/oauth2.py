"""OAuth2 authorization flow skeleton.

Implements the OAuth2 Authorization Code Grant flow for integrations
that require user consent (Google, GitHub, Slack, etc.).

Stores tokens in vault_assets. Handles token refresh automatically.
"""

from __future__ import annotations

import hashlib
import json
import secrets
import time
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import urlencode

import httpx

from .config import get_settings

# Pre-configured OAuth2 providers
OAUTH2_PROVIDERS: dict[str, dict[str, Any]] = {
    "google": {
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scopes": [
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.readonly",
        ],
        "extra_params": {"access_type": "offline", "prompt": "consent"},
    },
    "github": {
        "authorize_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "scopes": ["repo", "read:user", "read:org"],
        "extra_params": {},
    },
    "slack": {
        "authorize_url": "https://slack.com/oauth/v2/authorize",
        "token_url": "https://slack.com/api/oauth.v2.access",
        "scopes": ["chat:write", "channels:read", "users:read"],
        "extra_params": {},
    },
    "notion": {
        "authorize_url": "https://api.notion.com/v1/oauth/authorize",
        "token_url": "https://api.notion.com/v1/oauth/token",
        "scopes": [],
        "extra_params": {"owner": "user"},
    },
    "microsoft": {
        "authorize_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "scopes": ["openid", "email", "profile", "Mail.Send", "Mail.Read"],
        "extra_params": {},
    },
}

# In-memory state store for CSRF protection (production should use Redis/DB)
_pending_states: dict[str, dict[str, Any]] = {}


def get_provider_config(provider: str) -> dict[str, Any] | None:
    """Return the OAuth2 provider configuration if registered."""
    return OAUTH2_PROVIDERS.get(provider)


def list_providers() -> list[dict[str, str]]:
    """List all registered OAuth2 providers."""
    return [
        {"key": key, "authorize_url": cfg["authorize_url"], "scopes": ", ".join(cfg["scopes"])}
        for key, cfg in OAUTH2_PROVIDERS.items()
    ]


def build_authorize_url(
    *,
    provider: str,
    client_id: str,
    redirect_uri: str,
    workspace_id: str,
    scopes: list[str] | None = None,
    extra_params: dict[str, str] | None = None,
) -> tuple[str, str]:
    """Build the OAuth2 authorization URL.

    Returns:
        Tuple of (authorize_url, state_token).
    """
    cfg = OAUTH2_PROVIDERS.get(provider)
    if not cfg:
        raise ValueError(f"Unknown OAuth2 provider: {provider}")

    state = secrets.token_urlsafe(32)
    final_scopes = scopes or cfg["scopes"]

    params: dict[str, str] = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state,
    }
    if final_scopes:
        params["scope"] = " ".join(final_scopes)

    # Merge provider defaults + caller overrides
    merged_extra = {**cfg.get("extra_params", {}), **(extra_params or {})}
    params.update(merged_extra)

    # Store state for CSRF validation
    _pending_states[state] = {
        "provider": provider,
        "workspace_id": workspace_id,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "created_at": time.time(),
    }

    # Clean old states (>10 min)
    cutoff = time.time() - 600
    expired = [k for k, v in _pending_states.items() if v["created_at"] < cutoff]
    for k in expired:
        _pending_states.pop(k, None)

    url = f"{cfg['authorize_url']}?{urlencode(params)}"
    return url, state


def validate_state(state: str) -> dict[str, Any] | None:
    """Validate and consume a state token. Returns the stored metadata or None."""
    return _pending_states.pop(state, None)


async def exchange_code(
    *,
    provider: str,
    code: str,
    client_id: str,
    client_secret: str,
    redirect_uri: str,
) -> dict[str, Any]:
    """Exchange an authorization code for access/refresh tokens.

    Returns:
        Token response dict with access_token, refresh_token, expires_in, etc.
    """
    cfg = OAUTH2_PROVIDERS.get(provider)
    if not cfg:
        raise ValueError(f"Unknown OAuth2 provider: {provider}")

    token_url = cfg["token_url"]
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "client_secret": client_secret,
    }

    headers: dict[str, str] = {"Accept": "application/json"}

    # Notion uses Basic auth for token exchange
    auth = None
    if provider == "notion":
        import base64
        credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        headers["Authorization"] = f"Basic {credentials}"
        del payload["client_id"]
        del payload["client_secret"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data=payload, headers=headers, auth=auth, timeout=15)
        resp.raise_for_status()

        # GitHub returns form-encoded by default, handle both
        content_type = resp.headers.get("content-type", "")
        if "application/json" in content_type:
            data = resp.json()
        else:
            from urllib.parse import parse_qs
            parsed = parse_qs(resp.text)
            data = {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}

    result: dict[str, Any] = {
        "provider": provider,
        "access_token": data.get("access_token", ""),
        "token_type": data.get("token_type", "bearer"),
    }

    if data.get("refresh_token"):
        result["refresh_token"] = data["refresh_token"]
    if data.get("expires_in"):
        result["expires_in"] = int(data["expires_in"])
        result["expires_at"] = datetime.now(UTC).isoformat()
    if data.get("scope"):
        result["scope"] = data["scope"]

    # Extra fields specific to providers
    for extra_key in ("workspace_id", "bot_id", "team", "owner", "workspace_name"):
        if data.get(extra_key):
            result[extra_key] = data[extra_key]

    return result


async def refresh_token(
    *,
    provider: str,
    refresh_token_value: str,
    client_id: str,
    client_secret: str,
) -> dict[str, Any]:
    """Refresh an access token using a refresh token.

    Returns:
        Updated token dict with new access_token and optionally refresh_token.
    """
    cfg = OAUTH2_PROVIDERS.get(provider)
    if not cfg:
        raise ValueError(f"Unknown OAuth2 provider: {provider}")

    token_url = cfg["token_url"]
    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token_value,
        "client_id": client_id,
        "client_secret": client_secret,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data=payload, headers={"Accept": "application/json"}, timeout=15)
        resp.raise_for_status()
        data = resp.json()

    result: dict[str, Any] = {
        "provider": provider,
        "access_token": data.get("access_token", ""),
        "token_type": data.get("token_type", "bearer"),
    }
    if data.get("refresh_token"):
        result["refresh_token"] = data["refresh_token"]
    if data.get("expires_in"):
        result["expires_in"] = int(data["expires_in"])
        result["expires_at"] = datetime.now(UTC).isoformat()

    return result


def is_token_expired(token_data: dict[str, Any], buffer_seconds: int = 300) -> bool:
    """Check if a stored token is expired (with a buffer)."""
    expires_at = token_data.get("expires_at")
    if not expires_at:
        return False  # No expiry info — assume valid

    try:
        expiry = datetime.fromisoformat(expires_at)
        expires_in = token_data.get("expires_in", 3600)
        actual_expiry = expiry + timedelta(seconds=expires_in)
        return datetime.now(UTC) >= (actual_expiry - timedelta(seconds=buffer_seconds))
    except (ValueError, TypeError):
        return False
