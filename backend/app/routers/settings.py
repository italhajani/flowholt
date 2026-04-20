"""
Settings router — user profile, preferences, and API key management.
"""
from __future__ import annotations

import hashlib
import secrets
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from ..config import get_settings
from ..db import get_db
from ..deps import get_session_context
from ..models import (
    ApiKeyCreate,
    ApiKeyCreatedResponse,
    ApiKeyResponse,
    UserPreferencesResponse,
    UserPreferencesUpdate,
    UserProfileResponse,
    UserProfileUpdate,
)

settings = get_settings()
router = APIRouter()

PREFIX = settings.api_prefix


# ---------------------------------------------------------------------------
# User Profile
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/me/profile", response_model=UserProfileResponse)
def get_profile(ctx: dict = Depends(get_session_context)) -> UserProfileResponse:
    user_id = ctx["user"]["id"]
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    # Try to get extended profile from user_preferences
    prefs = db.execute(
        "SELECT bio, timezone FROM user_preferences WHERE user_id = ?", (user_id,)
    ).fetchone()

    return UserProfileResponse(
        id=row["id"],
        name=row["name"],
        email=row["email"],
        avatar_initials=row["avatar_initials"],
        bio=prefs["bio"] if prefs else "",
        timezone=prefs["timezone"] if prefs else "UTC",
        created_at=row["created_at"],
    )


@router.patch(f"{PREFIX}/me/profile", response_model=UserProfileResponse)
def update_profile(
    payload: UserProfileUpdate, ctx: dict = Depends(get_session_context)
) -> UserProfileResponse:
    user_id = ctx["user"]["id"]
    db = get_db()
    now = datetime.now(UTC).isoformat()

    # Update core user fields
    if payload.name is not None:
        db.execute("UPDATE users SET name = ? WHERE id = ?", (payload.name, user_id))
    if payload.avatar_initials is not None:
        db.execute("UPDATE users SET avatar_initials = ? WHERE id = ?", (payload.avatar_initials, user_id))

    # Upsert extended profile in user_preferences
    db.execute(
        """INSERT INTO user_preferences (user_id, updated_at) VALUES (?, ?)
           ON CONFLICT(user_id) DO UPDATE SET updated_at = excluded.updated_at""",
        (user_id, now),
    )
    if payload.bio is not None:
        db.execute("UPDATE user_preferences SET bio = ?, updated_at = ? WHERE user_id = ?", (payload.bio, now, user_id))
    if payload.timezone is not None:
        db.execute("UPDATE user_preferences SET timezone = ?, updated_at = ? WHERE user_id = ?", (payload.timezone, now, user_id))

    db.commit()
    return get_profile(ctx)


# ---------------------------------------------------------------------------
# User Preferences
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/me/preferences", response_model=UserPreferencesResponse)
def get_preferences(ctx: dict = Depends(get_session_context)) -> UserPreferencesResponse:
    user_id = ctx["user"]["id"]
    db = get_db()
    row = db.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,)).fetchone()
    if not row:
        return UserPreferencesResponse()
    return UserPreferencesResponse(
        theme=row["theme"],
        editor_font_size=row["editor_font_size"],
        editor_minimap=bool(row["editor_minimap"]),
        editor_word_wrap=bool(row["editor_word_wrap"]),
        code_theme=row["code_theme"],
        keyboard_shortcuts=row["keyboard_shortcuts"],
        language=row["language"],
        sidebar_collapsed=bool(row["sidebar_collapsed"]),
    )


@router.patch(f"{PREFIX}/me/preferences", response_model=UserPreferencesResponse)
def update_preferences(
    payload: UserPreferencesUpdate, ctx: dict = Depends(get_session_context)
) -> UserPreferencesResponse:
    user_id = ctx["user"]["id"]
    db = get_db()
    now = datetime.now(UTC).isoformat()

    # Ensure row exists
    db.execute(
        """INSERT INTO user_preferences (user_id, updated_at) VALUES (?, ?)
           ON CONFLICT(user_id) DO UPDATE SET updated_at = excluded.updated_at""",
        (user_id, now),
    )

    updates = payload.model_dump(exclude_none=True)
    for col, val in updates.items():
        db.execute(f"UPDATE user_preferences SET {col} = ?, updated_at = ? WHERE user_id = ?", (val, now, user_id))

    db.commit()
    return get_preferences(ctx)


# ---------------------------------------------------------------------------
# API Keys
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/api-keys", response_model=list[ApiKeyResponse])
def list_api_keys(ctx: dict = Depends(get_session_context)) -> list[ApiKeyResponse]:
    ws_id = ctx["workspace"]["id"]
    db = get_db()
    rows = db.execute(
        "SELECT * FROM api_keys WHERE workspace_id = ? ORDER BY created_at DESC", (ws_id,)
    ).fetchall()
    return [
        ApiKeyResponse(
            id=r["id"], name=r["name"], key_prefix=r["key_prefix"],
            scope=r["scope"], last_used_at=r["last_used_at"], created_at=r["created_at"],
        )
        for r in rows
    ]


@router.post(f"{PREFIX}/api-keys", response_model=ApiKeyCreatedResponse, status_code=201)
def create_api_key(
    payload: ApiKeyCreate, ctx: dict = Depends(get_session_context)
) -> ApiKeyCreatedResponse:
    ws_id = ctx["workspace"]["id"]
    user_id = ctx["user"]["id"]
    db = get_db()
    now = datetime.now(UTC).isoformat()

    key_id = f"ak-{secrets.token_hex(8)}"
    raw_key = f"fh_{secrets.token_hex(24)}"
    key_prefix = raw_key[:10] + "..."
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

    db.execute(
        """INSERT INTO api_keys (id, workspace_id, name, key_prefix, key_hash, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (key_id, ws_id, payload.name, key_prefix, key_hash, user_id, now),
    )
    db.commit()

    return ApiKeyCreatedResponse(
        id=key_id, name=payload.name, key_prefix=key_prefix,
        scope="full", created_at=now, key=raw_key, last_used_at=None,
    )


@router.delete(f"{PREFIX}/api-keys/{{key_id}}")
def delete_api_key(key_id: str, ctx: dict = Depends(get_session_context)) -> dict[str, str]:
    ws_id = ctx["workspace"]["id"]
    db = get_db()
    deleted = db.execute(
        "DELETE FROM api_keys WHERE id = ? AND workspace_id = ?", (key_id, ws_id)
    ).rowcount
    db.commit()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Notification Preferences
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/me/notification-preferences")
def get_notification_prefs(ctx: dict = Depends(get_session_context)) -> dict:
    user_id = ctx["user"]["id"]
    db = get_db()
    row = db.execute(
        "SELECT prefs_json FROM user_preferences WHERE user_id = ?", (user_id,)
    ).fetchone()
    if row:
        import json
        try:
            return json.loads(row["prefs_json"] if isinstance(row, dict) else row[0])
        except Exception:
            pass
    return {
        "email_executions": True,
        "email_errors": True,
        "email_team": True,
        "push_executions": False,
        "push_errors": True,
        "push_team": False,
        "slack_enabled": False,
        "slack_webhook": "",
        "digest_frequency": "daily",
    }


@router.patch(f"{PREFIX}/me/notification-preferences")
def update_notification_prefs(body: dict, ctx: dict = Depends(get_session_context)) -> dict:
    import json
    user_id = ctx["user"]["id"]
    db = get_db()
    db.execute(
        """INSERT INTO user_preferences (user_id, prefs_json) VALUES (?, ?)
           ON CONFLICT(user_id) DO UPDATE SET prefs_json = excluded.prefs_json""",
        (user_id, json.dumps(body)),
    )
    db.commit()
    return body


# ---------------------------------------------------------------------------
# Billing / Usage Summary
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/billing/usage")
def get_usage_summary(ctx: dict = Depends(get_session_context)) -> dict:
    ws_id = ctx["workspace"]["id"]
    db = get_db()
    wf_count = db.execute(
        "SELECT COUNT(*) as c FROM workflows WHERE workspace_id = ?", (ws_id,)
    ).fetchone()
    exec_count = db.execute(
        "SELECT COUNT(*) as c FROM executions WHERE workspace_id = ?", (ws_id,)
    ).fetchone()
    return {
        "plan": "free",
        "credits_used": (exec_count["c"] if isinstance(exec_count, dict) else exec_count[0]) if exec_count else 0,
        "credits_limit": 10000,
        "renewal_date": "2026-06-01",
        "cost_usd": 0.0,
        "workflows_active": (wf_count["c"] if isinstance(wf_count, dict) else wf_count[0]) if wf_count else 0,
    }


# ---------------------------------------------------------------------------
# Source Control Config
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/source-control/config")
def get_source_control_config(ctx: dict = Depends(get_session_context)) -> dict:
    return {
        "provider": "github",
        "repo_url": "",
        "branch": "main",
        "connected": False,
        "branches": ["main", "staging", "production"],
    }


@router.patch(f"{PREFIX}/source-control/config")
def update_source_control_config(body: dict, ctx: dict = Depends(get_session_context)) -> dict:
    return body


# ---------------------------------------------------------------------------
# Community Nodes
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/community-nodes")
def list_community_nodes(ctx: dict = Depends(get_session_context)) -> list:
    return []


@router.post(f"{PREFIX}/community-nodes/{{node_id}}/install")
def install_community_node(node_id: str, ctx: dict = Depends(get_session_context)) -> dict:
    return {"ok": True, "node_id": node_id}


@router.post(f"{PREFIX}/community-nodes/{{node_id}}/uninstall")
def uninstall_community_node(node_id: str, ctx: dict = Depends(get_session_context)) -> dict:
    return {"ok": True, "node_id": node_id}


# ---------------------------------------------------------------------------
# Environment Stages & Deployments
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/environments/stages")
def list_environment_stages(ctx: dict = Depends(get_session_context)) -> list:
    return [
        {"id": "dev", "name": "Development", "status": "active", "workflow_count": 0},
        {"id": "staging", "name": "Staging", "status": "active", "workflow_count": 0},
        {"id": "prod", "name": "Production", "status": "active", "workflow_count": 0},
    ]


@router.get(f"{PREFIX}/environments/deployments")
def list_deployments(ctx: dict = Depends(get_session_context)) -> list:
    return []


@router.post(f"{PREFIX}/environments/promote")
def promote_stage(body: dict, ctx: dict = Depends(get_session_context)) -> dict:
    return {"ok": True}


# ---------------------------------------------------------------------------
# Provider Detail
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/providers/{{provider_id}}")
def get_provider_detail(provider_id: str) -> dict:
    return {
        "id": provider_id,
        "name": provider_id.replace("-", " ").title(),
        "description": f"Integration provider: {provider_id}",
        "status": "active",
        "node_count": 0,
        "auth_type": "oauth2",
    }


# ---------------------------------------------------------------------------
# Domain Config
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/settings/domains")
def get_domain_config(ctx: dict = Depends(get_session_context)) -> dict:
    return {
        "custom_domain": "",
        "webhook_domain": "",
        "ssl_enabled": True,
        "verified": False,
    }


@router.patch(f"{PREFIX}/settings/domains")
def update_domain_config(body: dict, ctx: dict = Depends(get_session_context)) -> dict:
    return body


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/models")
def list_models() -> list:
    return [
        {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "provider": "google", "free_tier": True},
        {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "provider": "groq", "free_tier": True},
        {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai", "free_tier": False},
    ]


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

@router.get(f"{PREFIX}/analytics/overview")
def analytics_overview(ctx: dict = Depends(get_session_context)) -> dict:
    ws_id = ctx["workspace"]["id"]
    db = get_db()
    total = db.execute(
        "SELECT COUNT(*) as c FROM executions WHERE workspace_id = ?", (ws_id,)
    ).fetchone()
    return {
        "total_executions": (total["c"] if isinstance(total, dict) else total[0]) if total else 0,
        "success_rate": 0.95,
        "avg_duration_ms": 1200,
        "active_workflows": 0,
    }


@router.get(f"{PREFIX}/analytics/latency")
def analytics_latency() -> dict:
    return {"p50": 450, "p90": 1200, "p99": 3500}


@router.get(f"{PREFIX}/analytics/timeline")
def analytics_timeline() -> list:
    return []


@router.get(f"{PREFIX}/audit-events")
def list_audit_events_endpoint(ctx: dict = Depends(get_session_context)) -> list:
    from ..repository import list_audit_events
    ws_id = ctx["workspace"]["id"]
    return list_audit_events(ws_id, limit=100)


# ---------------------------------------------------------------------------
# Metrics (Prometheus-style stub)
# ---------------------------------------------------------------------------

@router.get("/metrics")
def prometheus_metrics() -> str:
    return "# FlowHolt metrics stub\nflowholt_up 1\n"
