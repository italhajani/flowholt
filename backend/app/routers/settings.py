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
