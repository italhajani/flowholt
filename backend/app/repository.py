from __future__ import annotations

import json
import hashlib
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from .db import get_db, row_to_dict, utc_now
from .models import VaultAssetCreate, VaultAssetUpdate, WorkflowCreate, WorkflowUpdate


def create_user_with_workspace(
    *,
    name: str,
    email: str,
    password_hash: str,
) -> dict[str, Any]:
    """Create a new user, a personal workspace, and owner membership. Returns the session-shaped dict."""
    user_id = f"u-{uuid.uuid4().hex[:12]}"
    initials = "".join(w[0].upper() for w in name.split()[:2]) or name[:2].upper()
    workspace_id = f"ws-{uuid.uuid4().hex[:12]}"
    slug = f"{name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
    membership_id = f"wm-{uuid.uuid4().hex[:12]}"
    now = utcutc_now()

    with get_db() as conn:
        conn.execute(
            "INSERT INTO users (id, name, email, password_hash, avatar_initials, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, name, email, password_hash, initials, now),
        )
        conn.execute(
            "INSERT INTO workspaces (id, name, slug, plan, owner_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (workspace_id, f"{name}'s Workspace", slug, "free", user_id, now),
        )
        conn.execute(
            "INSERT INTO workspace_memberships (id, workspace_id, user_id, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (membership_id, workspace_id, user_id, "owner", "active", now),
        )
        # Also create workspace_settings row
        conn.execute(
            "INSERT INTO workspace_settings (workspace_id, updated_at) VALUES (?, ?)",
            (workspace_id, now),
        )

    return resolve_session(user_id=user_id, workspace_id=workspace_id)  # type: ignore[return-value]


def complete_invited_user_signup(
    *,
    name: str,
    email: str,
    password_hash: str,
) -> dict[str, Any] | None:
    normalized_email = email.strip().lower()
    user = get_user_by_email(normalized_email)
    if user is None or user.get("password_hash"):
        return None

    initials = "".join(word[0].upper() for word in name.split()[:2]) or name[:2].upper()
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET name = ?, password_hash = ?, avatar_initials = ? WHERE id = ?",
            (name, password_hash, initials, str(user["id"])),
        )
        conn.execute(
            "UPDATE workspace_memberships SET status = 'active' WHERE user_id = ? AND status = 'invited'",
            (str(user["id"]),),
        )

    return resolve_session(user_id=str(user["id"]))


def get_user_by_email(email: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE lower(email) = lower(?)", (email,)).fetchone()
    return row_to_dict(row) if row else None


def get_user_identity(*, provider: str, provider_subject: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM user_identities WHERE provider = ? AND provider_subject = ?",
            (provider, provider_subject),
        ).fetchone()
    return row_to_dict(row) if row else None


def upsert_user_identity(*, user_id: str, provider: str, provider_subject: str, email: str | None) -> dict[str, Any]:
    identity_id = f"uid-{uuid.uuid4().hex[:10]}"
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO user_identities (id, user_id, provider, provider_subject, email, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(provider, provider_subject) DO UPDATE SET
                user_id = excluded.user_id,
                email = excluded.email
            """,
            (identity_id, user_id, provider, provider_subject, email, utcutc_now()),
        )
        row = conn.execute(
            "SELECT * FROM user_identities WHERE provider = ? AND provider_subject = ?",
            (provider, provider_subject),
        ).fetchone()
    if row is None:
        raise RuntimeError("User identity upsert failed.")
    return row_to_dict(row)


def resolve_supabase_session(*, subject: str, email: str | None = None, workspace_id: str | None = None) -> dict[str, Any] | None:
    identity = get_user_identity(provider="supabase", provider_subject=subject)
    if identity is not None:
        return resolve_session(user_id=str(identity["user_id"]), workspace_id=workspace_id)

    if email:
        user = get_user_by_email(email)
        if user is not None:
            upsert_user_identity(
                user_id=str(user["id"]),
                provider="supabase",
                provider_subject=subject,
                email=email,
            )
            return resolve_session(user_id=str(user["id"]), workspace_id=workspace_id)

    return None


def resolve_session(*, user_id: str | None = None, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if user_id and workspace_id:
            row = conn.execute(
                """
                SELECT
                    u.id AS user_id,
                    u.name AS user_name,
                    u.email AS user_email,
                    u.avatar_initials AS user_avatar_initials,
                    w.id AS workspace_id,
                    w.name AS workspace_name,
                    w.slug AS workspace_slug,
                    w.plan AS workspace_plan,
                    wm.role AS membership_role,
                    wm.status AS membership_status,
                    (
                        SELECT COUNT(*)
                        FROM workspace_memberships member_counts
                        WHERE member_counts.workspace_id = w.id AND member_counts.status = 'active'
                    ) AS members_count
                FROM workspace_memberships wm
                JOIN users u ON u.id = wm.user_id
                JOIN workspaces w ON w.id = wm.workspace_id
                WHERE wm.user_id = ? AND wm.workspace_id = ? AND wm.status = 'active'
                """,
                (user_id, workspace_id),
            ).fetchone()
        elif user_id:
            row = conn.execute(
                """
                SELECT
                    u.id AS user_id,
                    u.name AS user_name,
                    u.email AS user_email,
                    u.avatar_initials AS user_avatar_initials,
                    w.id AS workspace_id,
                    w.name AS workspace_name,
                    w.slug AS workspace_slug,
                    w.plan AS workspace_plan,
                    wm.role AS membership_role,
                    wm.status AS membership_status,
                    (
                        SELECT COUNT(*)
                        FROM workspace_memberships member_counts
                        WHERE member_counts.workspace_id = w.id AND member_counts.status = 'active'
                    ) AS members_count
                FROM workspace_memberships wm
                JOIN users u ON u.id = wm.user_id
                JOIN workspaces w ON w.id = wm.workspace_id
                WHERE wm.user_id = ? AND wm.status = 'active'
                ORDER BY CASE wm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'builder' THEN 2 ELSE 3 END
                LIMIT 1
                """,
                (user_id,),
            ).fetchone()
        elif workspace_id:
            row = conn.execute(
                """
                SELECT
                    u.id AS user_id,
                    u.name AS user_name,
                    u.email AS user_email,
                    u.avatar_initials AS user_avatar_initials,
                    w.id AS workspace_id,
                    w.name AS workspace_name,
                    w.slug AS workspace_slug,
                    w.plan AS workspace_plan,
                    wm.role AS membership_role,
                    wm.status AS membership_status,
                    (
                        SELECT COUNT(*)
                        FROM workspace_memberships member_counts
                        WHERE member_counts.workspace_id = w.id AND member_counts.status = 'active'
                    ) AS members_count
                FROM workspace_memberships wm
                JOIN users u ON u.id = wm.user_id
                JOIN workspaces w ON w.id = wm.workspace_id
                WHERE wm.workspace_id = ? AND wm.status = 'active'
                ORDER BY CASE wm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'builder' THEN 2 ELSE 3 END
                LIMIT 1
                """,
                (workspace_id,),
            ).fetchone()
        else:
            row = conn.execute(
                """
                SELECT
                    u.id AS user_id,
                    u.name AS user_name,
                    u.email AS user_email,
                    u.avatar_initials AS user_avatar_initials,
                    w.id AS workspace_id,
                    w.name AS workspace_name,
                    w.slug AS workspace_slug,
                    w.plan AS workspace_plan,
                    wm.role AS membership_role,
                    wm.status AS membership_status,
                    (
                        SELECT COUNT(*)
                        FROM workspace_memberships member_counts
                        WHERE member_counts.workspace_id = w.id AND member_counts.status = 'active'
                    ) AS members_count
                FROM workspace_memberships wm
                JOIN users u ON u.id = wm.user_id
                JOIN workspaces w ON w.id = wm.workspace_id
                WHERE wm.status = 'active'
                ORDER BY CASE wm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'builder' THEN 2 ELSE 3 END, w.created_at ASC
                LIMIT 1
                """
            ).fetchone()

    if row is None:
        return None

    item = row_to_dict(row)
    return {
        "user": {
            "id": item["user_id"],
            "name": item["user_name"],
            "email": item["user_email"],
            "avatar_initials": item["user_avatar_initials"],
        },
        "workspace": {
            "id": item["workspace_id"],
            "name": item["workspace_name"],
            "slug": item["workspace_slug"],
            "plan": item["workspace_plan"],
            "role": item["membership_role"],
            "members_count": item["members_count"],
        },
    }


def list_user_workspaces(user_id: str) -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT
                w.id,
                w.name,
                w.slug,
                w.plan,
                wm.role,
                (
                    SELECT COUNT(*)
                    FROM workspace_memberships member_counts
                    WHERE member_counts.workspace_id = w.id AND member_counts.status = 'active'
                ) AS members_count
            FROM workspace_memberships wm
            JOIN workspaces w ON w.id = wm.workspace_id
            WHERE wm.user_id = ? AND wm.status = 'active'
            ORDER BY CASE wm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'builder' THEN 2 ELSE 3 END, w.name ASC
            """,
            (user_id,),
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def list_workspace_members(workspace_id: str) -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT
                u.id AS user_id,
                u.name,
                u.email,
                u.avatar_initials,
                wm.role,
                wm.status
            FROM workspace_memberships wm
            JOIN users u ON u.id = wm.user_id
            WHERE wm.workspace_id = ?
            ORDER BY CASE wm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'builder' THEN 2 ELSE 3 END, u.name ASC
            """,
            (workspace_id,),
        ).fetchall()
    return [
        {
            "user_id": row["user_id"],
            "name": row["name"],
            "email": row["email"],
            "avatar_initials": row["avatar_initials"],
            "role": row["role"],
            "status": row["status"],
        }
        for row in rows
    ]


def invite_workspace_member(*, workspace_id: str, email: str, role: str) -> dict[str, Any]:
    normalized_email = email.strip().lower()
    if not normalized_email:
        raise ValueError("Email is required")

    with get_db() as conn:
        existing_membership = conn.execute(
            """
            SELECT wm.user_id
            FROM workspace_memberships wm
            JOIN users u ON u.id = wm.user_id
            WHERE wm.workspace_id = ? AND lower(u.email) = lower(?)
            LIMIT 1
            """,
            (workspace_id, normalized_email),
        ).fetchone()
        if existing_membership is not None:
            raise ValueError("A member or invite with this email already exists in the workspace")

        user_row = conn.execute("SELECT * FROM users WHERE lower(email) = lower(?)", (normalized_email,)).fetchone()
        now = utcutc_now()

        if user_row is None:
            local_part = normalized_email.split("@", 1)[0]
            derived_name = " ".join(
                part.capitalize()
                for part in local_part.replace(".", " ").replace("_", " ").replace("-", " ").split()
            ) or normalized_email
            avatar_initials = "".join(word[0].upper() for word in derived_name.split()[:2]) or derived_name[:2].upper()
            user_id = f"u-{uuid.uuid4().hex[:12]}"
            conn.execute(
                "INSERT INTO users (id, name, email, password_hash, avatar_initials, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, derived_name, normalized_email, None, avatar_initials, now),
            )
            name = derived_name
            status = "invited"
        else:
            user = row_to_dict(user_row)
            user_id = str(user["id"])
            name = str(user["name"])
            avatar_initials = str(user["avatar_initials"])
            status = "active" if user.get("password_hash") else "invited"

        membership_id = f"wm-{uuid.uuid4().hex[:12]}"
        conn.execute(
            "INSERT INTO workspace_memberships (id, workspace_id, user_id, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (membership_id, workspace_id, user_id, role, status, now),
        )

    return {
        "user_id": user_id,
        "name": name,
        "email": normalized_email,
        "avatar_initials": avatar_initials,
        "role": role,
        "status": status,
    }


def update_workspace_member_role(*, workspace_id: str, user_id: str, role: str) -> dict[str, Any] | None:
    with get_db() as conn:
        conn.execute(
            "UPDATE workspace_memberships SET role = ? WHERE workspace_id = ? AND user_id = ?",
            (role, workspace_id, user_id),
        )
        row = conn.execute(
            """
            SELECT
                u.id AS user_id,
                u.name,
                u.email,
                u.avatar_initials,
                wm.role,
                wm.status
            FROM workspace_memberships wm
            JOIN users u ON u.id = wm.user_id
            WHERE wm.workspace_id = ? AND wm.user_id = ?
            """,
            (workspace_id, user_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def get_workspace_member_by_role(workspace_id: str, role: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT
                u.id AS user_id,
                u.name,
                u.email,
                u.avatar_initials,
                wm.role,
                wm.status
            FROM workspace_memberships wm
            JOIN users u ON u.id = wm.user_id
            WHERE wm.workspace_id = ? AND wm.role = ? AND wm.status = 'active'
            ORDER BY u.name ASC
            LIMIT 1
            """,
            (workspace_id, role),
        ).fetchone()
    return row_to_dict(row) if row else None


def create_audit_event(
    *,
    workspace_id: str,
    action: str,
    target_type: str,
    target_id: str | None,
    status: str,
    details: dict[str, Any] | None = None,
    actor_user_id: str | None = None,
    actor_email: str | None = None,
) -> dict[str, Any]:
    event_id = f"ae-{uuid.uuid4().hex[:10]}"
    created_at = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO audit_events (
                id, workspace_id, actor_user_id, actor_email, action, target_type, target_id, status, details_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_id,
                workspace_id,
                actor_user_id,
                actor_email,
                action,
                target_type,
                target_id,
                status,
                json.dumps(details or {}),
                created_at,
            ),
        )
        row = conn.execute("SELECT * FROM audit_events WHERE id = ?", (event_id,)).fetchone()
    if row is None:
        raise RuntimeError("Audit event creation failed.")
    return _normalize_audit_event(row_to_dict(row))


def list_audit_events(workspace_id: str, *, limit: int = 100, target_type: str | None = None, target_id: str | None = None) -> list[dict[str, Any]]:
    query = "SELECT * FROM audit_events WHERE workspace_id = ?"
    params: list[Any] = [workspace_id]
    if target_type:
        query += " AND target_type = ?"
        params.append(target_type)
    if target_id:
        query += " AND target_id = ?"
        params.append(target_id)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [_normalize_audit_event(row_to_dict(row)) for row in rows]


def get_workspace_settings(workspace_id: str) -> dict[str, Any]:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM workspace_settings WHERE workspace_id = ?",
            (workspace_id,),
        ).fetchone()
    if row is None:
        return {
            "workspace_id": workspace_id,
            "public_base_url": None,
            "require_webhook_signature": False,
            "webhook_signing_secret": None,
            "staging_min_role": "builder",
            "publish_min_role": "builder",
            "run_min_role": "builder",
            "production_asset_min_role": "admin",
            "allow_public_webhooks": True,
            "allow_public_chat_triggers": True,
            "require_staging_before_production": False,
            "require_staging_approval": False,
            "require_production_approval": False,
            "deployment_approval_min_role": "admin",
            "allow_self_approval": False,
            "timezone": "UTC",
            "execution_timeout_seconds": 3600,
            "save_execution_data": True,
            "save_failed_executions": "all",
            "save_successful_executions": "all",
            "save_manual_executions": True,
            "execution_data_retention_days": 14,
            "save_execution_progress": False,
            "redact_execution_payloads": False,
            "max_concurrent_executions": 10,
            "log_level": "info",
            "email_notifications_enabled": False,
            "notify_on_failure": True,
            "notify_on_success": False,
            "notify_on_approval_requests": True,
            "updated_at": utcutc_now(),
        }
    item = row_to_dict(row)
    item["require_webhook_signature"] = bool(item.get("require_webhook_signature", 0))
    item["allow_public_webhooks"] = bool(item.get("allow_public_webhooks", 1))
    item["allow_public_chat_triggers"] = bool(item.get("allow_public_chat_triggers", 1))
    item["require_staging_before_production"] = bool(item.get("require_staging_before_production", 0))
    item["require_staging_approval"] = bool(item.get("require_staging_approval", 0))
    item["require_production_approval"] = bool(item.get("require_production_approval", 0))
    item["allow_self_approval"] = bool(item.get("allow_self_approval", 0))
    item["save_execution_data"] = bool(item.get("save_execution_data", 1))
    item["save_failed_executions"] = str(item.get("save_failed_executions") or "all")
    item["save_successful_executions"] = str(item.get("save_successful_executions") or "all")
    item["save_manual_executions"] = bool(item.get("save_manual_executions", 1))
    item["execution_data_retention_days"] = int(item.get("execution_data_retention_days") or 14)
    item["save_execution_progress"] = bool(item.get("save_execution_progress", 0))
    item["redact_execution_payloads"] = bool(item.get("redact_execution_payloads", 0))
    item["email_notifications_enabled"] = bool(item.get("email_notifications_enabled", 0))
    item["notify_on_failure"] = bool(item.get("notify_on_failure", 1))
    item["notify_on_success"] = bool(item.get("notify_on_success", 0))
    item["notify_on_approval_requests"] = bool(item.get("notify_on_approval_requests", 1))
    return item


def update_workspace_settings(
    workspace_id: str,
    *,
    public_base_url: str | None,
    require_webhook_signature: bool,
    webhook_signing_secret: str | None,
    staging_min_role: str,
    publish_min_role: str,
    run_min_role: str,
    production_asset_min_role: str,
    allow_public_webhooks: bool,
    allow_public_chat_triggers: bool,
    require_staging_before_production: bool,
    require_staging_approval: bool,
    require_production_approval: bool,
    deployment_approval_min_role: str,
    allow_self_approval: bool,
    timezone: str = "UTC",
    execution_timeout_seconds: int = 3600,
    save_execution_data: bool = True,
    save_failed_executions: str = "all",
    save_successful_executions: str = "all",
    save_manual_executions: bool = True,
    execution_data_retention_days: int = 14,
    save_execution_progress: bool = False,
    redact_execution_payloads: bool = False,
    max_concurrent_executions: int = 10,
    log_level: str = "info",
    email_notifications_enabled: bool = False,
    notify_on_failure: bool = True,
    notify_on_success: bool = False,
    notify_on_approval_requests: bool = True,
) -> dict[str, Any]:
    now = utcutc_now()
    current = get_workspace_settings(workspace_id)
    next_secret = webhook_signing_secret if webhook_signing_secret is not None else current.get("webhook_signing_secret")
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workspace_settings (
                workspace_id, public_base_url, require_webhook_signature, webhook_signing_secret,
                staging_min_role, publish_min_role, run_min_role, production_asset_min_role,
                allow_public_webhooks, allow_public_chat_triggers, require_staging_before_production, require_staging_approval,
                require_production_approval, deployment_approval_min_role, allow_self_approval,
                timezone, execution_timeout_seconds, save_execution_data, save_failed_executions,
                save_successful_executions, save_manual_executions, execution_data_retention_days,
                save_execution_progress, redact_execution_payloads, max_concurrent_executions,
                log_level, email_notifications_enabled, notify_on_failure, notify_on_success,
                notify_on_approval_requests, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(workspace_id) DO UPDATE SET
                public_base_url = excluded.public_base_url,
                require_webhook_signature = excluded.require_webhook_signature,
                webhook_signing_secret = excluded.webhook_signing_secret,
                staging_min_role = excluded.staging_min_role,
                publish_min_role = excluded.publish_min_role,
                run_min_role = excluded.run_min_role,
                production_asset_min_role = excluded.production_asset_min_role,
                allow_public_webhooks = excluded.allow_public_webhooks,
                allow_public_chat_triggers = excluded.allow_public_chat_triggers,
                require_staging_before_production = excluded.require_staging_before_production,
                require_staging_approval = excluded.require_staging_approval,
                require_production_approval = excluded.require_production_approval,
                deployment_approval_min_role = excluded.deployment_approval_min_role,
                allow_self_approval = excluded.allow_self_approval,
                timezone = excluded.timezone,
                execution_timeout_seconds = excluded.execution_timeout_seconds,
                save_execution_data = excluded.save_execution_data,
                save_failed_executions = excluded.save_failed_executions,
                save_successful_executions = excluded.save_successful_executions,
                save_manual_executions = excluded.save_manual_executions,
                execution_data_retention_days = excluded.execution_data_retention_days,
                save_execution_progress = excluded.save_execution_progress,
                redact_execution_payloads = excluded.redact_execution_payloads,
                max_concurrent_executions = excluded.max_concurrent_executions,
                log_level = excluded.log_level,
                email_notifications_enabled = excluded.email_notifications_enabled,
                notify_on_failure = excluded.notify_on_failure,
                notify_on_success = excluded.notify_on_success,
                notify_on_approval_requests = excluded.notify_on_approval_requests,
                updated_at = excluded.updated_at
            """,
            (
                workspace_id,
                public_base_url,
                1 if require_webhook_signature else 0,
                next_secret,
                staging_min_role,
                publish_min_role,
                run_min_role,
                production_asset_min_role,
                1 if allow_public_webhooks else 0,
                1 if allow_public_chat_triggers else 0,
                1 if require_staging_before_production else 0,
                1 if require_staging_approval else 0,
                1 if require_production_approval else 0,
                deployment_approval_min_role,
                1 if allow_self_approval else 0,
                timezone,
                execution_timeout_seconds,
                1 if save_execution_data else 0,
                save_failed_executions,
                save_successful_executions,
                1 if save_manual_executions else 0,
                execution_data_retention_days,
                1 if save_execution_progress else 0,
                1 if redact_execution_payloads else 0,
                max_concurrent_executions,
                log_level,
                1 if email_notifications_enabled else 0,
                1 if notify_on_failure else 0,
                1 if notify_on_success else 0,
                1 if notify_on_approval_requests else 0,
                now,
            ),
        )
    return get_workspace_settings(workspace_id)


def list_templates(*, workspace_id: str | None = None) -> list[dict[str, Any]]:
    with get_db() as conn:
        if workspace_id is None:
            rows = conn.execute("SELECT * FROM templates ORDER BY name").fetchall()
        else:
            rows = conn.execute("SELECT * FROM templates WHERE workspace_id = ? ORDER BY name", (workspace_id,)).fetchall()
    return [_normalize_template(row_to_dict(row)) for row in rows]


def get_template(template_id: str, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if workspace_id is None:
            row = conn.execute("SELECT * FROM templates WHERE id = ?", (template_id,)).fetchone()
        else:
            row = conn.execute("SELECT * FROM templates WHERE id = ? AND workspace_id = ?", (template_id, workspace_id)).fetchone()
    if row is None:
        return None
    item = row_to_dict(row)
    return {
        "id": item["id"],
        "name": item["name"],
        "description": item["description"],
        "category": item["category"],
        "trigger_type": item["trigger_type"],
        "estimated_time": item["estimated_time"],
        "complexity": item["complexity"],
        "color": item["color"],
        "owner": item["owner"],
        "installs": item["installs"],
        "outcome": item["outcome"],
        "tags": item["tags_json"],
        "definition": item["definition_json"],
    }


def list_workflows(workspace_id: str | None = None, *, limit: int = 200, offset: int = 0) -> list[dict[str, Any]]:
    with get_db() as conn:
        if workspace_id is None:
            rows = conn.execute("SELECT * FROM workflows ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM workflows WHERE workspace_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", (workspace_id, limit, offset)).fetchall()
    return [row_to_dict(row) for row in rows]


def list_workflows_by_trigger(*, trigger_type: str, status: str | None = None, workspace_id: str | None = None) -> list[dict[str, Any]]:
    query = "SELECT * FROM workflows WHERE trigger_type = ?"
    params: list[Any] = [trigger_type]
    if workspace_id is not None:
        query += " AND workspace_id = ?"
        params.append(workspace_id)
    if status is not None:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [row_to_dict(row) for row in rows]


def get_workflow(workflow_id: str, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if workspace_id is None:
            row = conn.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
        else:
            row = conn.execute("SELECT * FROM workflows WHERE id = ? AND workspace_id = ?", (workflow_id, workspace_id)).fetchone()
    return row_to_dict(row) if row else None


def list_workflow_versions(workflow_id: str, *, workspace_id: str) -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT * FROM workflow_versions
            WHERE workflow_id = ? AND workspace_id = ?
            ORDER BY version_number DESC
            """,
            (workflow_id, workspace_id),
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def list_workflow_deployments(
    workflow_id: str,
    *,
    workspace_id: str,
    environment: str | None = None,
) -> list[dict[str, Any]]:
    query = """
        SELECT * FROM workflow_deployments
        WHERE workflow_id = ? AND workspace_id = ?
    """
    params: list[Any] = [workflow_id, workspace_id]
    if environment is not None:
        query += " AND environment = ?"
        params.append(environment)
    query += " ORDER BY created_at DESC"
    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [row_to_dict(row) for row in rows]


def get_workflow_deployment(deployment_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM workflow_deployments WHERE id = ? AND workspace_id = ?",
            (deployment_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def get_workflow_version(version_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM workflow_versions WHERE id = ? AND workspace_id = ?",
            (version_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def update_workflow_version_status(version_id: str, *, workspace_id: str, status: str) -> dict[str, Any] | None:
    with get_db() as conn:
        conn.execute(
            "UPDATE workflow_versions SET status = ? WHERE id = ? AND workspace_id = ?",
            (status, version_id, workspace_id),
        )
        row = conn.execute(
            "SELECT * FROM workflow_versions WHERE id = ? AND workspace_id = ?",
            (version_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def get_published_workflow_version(workflow_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT versions.*
            FROM workflow_versions versions
            JOIN workflows workflows ON workflows.published_version_id = versions.id
            WHERE workflows.id = ? AND workflows.workspace_id = ?
            """,
            (workflow_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def get_staging_workflow_version(workflow_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT versions.*
            FROM workflow_versions versions
            JOIN workflows workflows ON workflows.staging_version_id = versions.id
            WHERE workflows.id = ? AND workflows.workspace_id = ?
            """,
            (workflow_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def create_workflow_job(
    *,
    workspace_id: str,
    workflow_id: str,
    workflow_version_id: str | None,
    initiated_by_user_id: str | None,
    environment: str,
    trigger_type: str,
    payload: dict[str, Any],
    max_attempts: int = 3,
) -> dict[str, Any]:
    job_id = f"job-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workflow_jobs (
                id, workspace_id, workflow_id, workflow_version_id, initiated_by_user_id, environment, trigger_type, status,
                payload_json, attempts, max_attempts, available_at, leased_until, execution_id, error_text, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job_id,
                workspace_id,
                workflow_id,
                workflow_version_id,
                initiated_by_user_id,
                environment,
                trigger_type,
                "pending",
                json.dumps(payload),
                0,
                max_attempts,
                now,
                None,
                None,
                None,
                now,
                now,
            ),
        )
        row = conn.execute("SELECT * FROM workflow_jobs WHERE id = ?", (job_id,)).fetchone()
    if row is None:
        raise RuntimeError("Workflow job creation failed.")
    return row_to_dict(row)


def list_workflow_jobs(workspace_id: str, *, limit: int = 50) -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT * FROM workflow_jobs
            WHERE workspace_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (workspace_id, limit),
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def get_workflow_job(job_id: str, *, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if workspace_id is None:
            row = conn.execute("SELECT * FROM workflow_jobs WHERE id = ?", (job_id,)).fetchone()
        else:
            row = conn.execute(
                "SELECT * FROM workflow_jobs WHERE id = ? AND workspace_id = ?",
                (job_id, workspace_id),
            ).fetchone()
    return row_to_dict(row) if row else None


def cancel_workflow_job(job_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    now = utcutc_now()
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM workflow_jobs WHERE id = ? AND workspace_id = ?",
            (job_id, workspace_id),
        ).fetchone()
        if row is None:
            return None
        item = row_to_dict(row)
        if item.get("status") not in {"pending", "failed"}:
            return item
        conn.execute(
            """
            UPDATE workflow_jobs
            SET status = 'cancelled', leased_until = NULL, available_at = ?, error_text = ?, updated_at = ?
            WHERE id = ? AND workspace_id = ?
            """,
            (now, "Cancelled by user", now, job_id, workspace_id),
        )
        updated = conn.execute(
            "SELECT * FROM workflow_jobs WHERE id = ? AND workspace_id = ?",
            (job_id, workspace_id),
        ).fetchone()
    return row_to_dict(updated) if updated else None


def claim_pending_workflow_jobs(*, limit: int, lease_seconds: int) -> list[dict[str, Any]]:
    now = utcutc_now()
    claimed: list[dict[str, Any]] = []
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT * FROM workflow_jobs
            WHERE (status = 'pending' OR (status = 'failed' AND attempts < max_attempts))
              AND available_at <= ?
              AND (leased_until IS NULL OR leased_until <= ?)
            ORDER BY created_at ASC
            LIMIT ?
            """,
            (now, now, limit),
        ).fetchall()

        for row in rows:
            item = row_to_dict(row)
            leased_until = _shift_iso_seconds(now, lease_seconds)
            next_attempts = int(item.get("attempts") or 0) + 1
            conn.execute(
                """
                UPDATE workflow_jobs
                SET status = 'processing', attempts = ?, leased_until = ?, updated_at = ?, error_text = NULL
                WHERE id = ?
                """,
                (next_attempts, leased_until, now, item["id"]),
            )
            claimed_row = conn.execute("SELECT * FROM workflow_jobs WHERE id = ?", (item["id"],)).fetchone()
            if claimed_row is not None:
                claimed.append(row_to_dict(claimed_row))
    return claimed


def complete_workflow_job(job_id: str, *, execution_id: str | None) -> dict[str, Any] | None:
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            UPDATE workflow_jobs
            SET status = 'completed', leased_until = NULL, execution_id = ?, error_text = NULL, updated_at = ?
            WHERE id = ?
            """,
            (execution_id, now, job_id),
        )
        row = conn.execute("SELECT * FROM workflow_jobs WHERE id = ?", (job_id,)).fetchone()
    return row_to_dict(row) if row else None


def fail_workflow_job(job_id: str, *, error_text: str, retry_delay_seconds: int = 30) -> dict[str, Any] | None:
    now = utcutc_now()
    with get_db() as conn:
        row = conn.execute("SELECT * FROM workflow_jobs WHERE id = ?", (job_id,)).fetchone()
        if row is None:
            return None
        item = row_to_dict(row)
        max_attempts = int(item.get("max_attempts") or 3)
        attempts = int(item.get("attempts") or 0)
        has_retries = attempts < max_attempts
        # Exponential backoff: base_delay * 2^(attempt-1), capped at 15 minutes
        if has_retries:
            backoff = min(retry_delay_seconds * (2 ** max(0, attempts - 1)), 900)
            next_status = "pending"
            next_available_value = _shift_iso_seconds(now, int(backoff))
        else:
            next_status = "failed"
            next_available_value = now
        conn.execute(
            """
            UPDATE workflow_jobs
            SET status = ?, leased_until = NULL, available_at = ?, error_text = ?, updated_at = ?
            WHERE id = ?
            """,
            (next_status, next_available_value, error_text[:500], now, job_id),
        )
        updated = conn.execute("SELECT * FROM workflow_jobs WHERE id = ?", (job_id,)).fetchone()
    return row_to_dict(updated) if updated else None


def list_vault_assets(*, kind: str | None = None, workspace_id: str | None = None) -> list[dict[str, Any]]:
    query = "SELECT * FROM vault_assets"
    params: list[Any] = []
    clauses: list[str] = []
    if workspace_id is not None:
        clauses.append("workspace_id = ?")
        params.append(workspace_id)
    if kind is not None:
        clauses.append("kind = ?")
        params.append(kind)
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY updated_at DESC, name ASC"

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [_normalize_vault_asset(row_to_dict(row)) for row in rows]


def list_vault_assets_grouped(workspace_id: str | None = None) -> dict[str, list[dict[str, Any]]]:
    """Fetch all vault assets in a single query and group by kind."""
    query = "SELECT * FROM vault_assets"
    params: list[Any] = []
    if workspace_id is not None:
        query += " WHERE workspace_id = ?"
        params.append(workspace_id)
    query += " ORDER BY updated_at DESC, name ASC"

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()

    grouped: dict[str, list[dict[str, Any]]] = {"connection": [], "credential": [], "variable": []}
    for row in rows:
        item = _normalize_vault_asset(row_to_dict(row))
        kind = str(item.get("kind", "variable"))
        if kind in grouped:
            grouped[kind].append(item)
        else:
            grouped.setdefault(kind, []).append(item)
    return grouped


def get_vault_asset(asset_id: str, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if workspace_id is None:
            row = conn.execute("SELECT * FROM vault_assets WHERE id = ?", (asset_id,)).fetchone()
        else:
            row = conn.execute("SELECT * FROM vault_assets WHERE id = ? AND workspace_id = ?", (asset_id, workspace_id)).fetchone()
    return _normalize_vault_asset(row_to_dict(row)) if row else None


def get_vault_asset_by_name(*, kind: str, name: str, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if workspace_id is None:
            row = conn.execute(
                "SELECT * FROM vault_assets WHERE kind = ? AND name = ?",
                (kind, name),
            ).fetchone()
        else:
            row = conn.execute(
                "SELECT * FROM vault_assets WHERE workspace_id = ? AND kind = ? AND name = ?",
                (workspace_id, kind, name),
            ).fetchone()
    return _normalize_vault_asset(row_to_dict(row)) if row else None


def create_vault_asset(payload: VaultAssetCreate, *, workspace_id: str, created_by_user_id: str) -> dict[str, Any]:
    from .encryption import encrypt_secret
    asset_id = f"va-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    secret_str = json.dumps(payload.secret)
    encrypted_secret = encrypt_secret(secret_str)
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO vault_assets (
                id, workspace_id, created_by_user_id, kind, name, app, subtitle, logo_url, credential_type, scope,
                access_text, status, workflows_count, people_with_access, last_used_at,
                updated_at, masked, secret_json, visibility, allowed_roles_json, allowed_user_ids_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                asset_id,
                workspace_id,
                created_by_user_id,
                payload.kind,
                payload.name,
                payload.app,
                payload.subtitle,
                payload.logo_url,
                payload.credential_type,
                payload.scope,
                payload.access,
                payload.status,
                payload.workflows_count,
                payload.people_with_access,
                None,
                now,
                1 if payload.masked else 0,
                encrypted_secret,
                "workspace",
                json.dumps([]),
                json.dumps([]),
            ),
        )
    asset = get_vault_asset(asset_id, workspace_id)
    if asset is None:
        raise RuntimeError("Vault asset creation failed.")
    return asset


def update_vault_asset(asset_id: str, payload: VaultAssetUpdate, *, workspace_id: str) -> dict[str, Any] | None:
    from .encryption import encrypt_secret
    secret_str = json.dumps(payload.secret)
    encrypted_secret = encrypt_secret(secret_str)
    with get_db() as conn:
        conn.execute(
            """
            UPDATE vault_assets
            SET name = ?, app = ?, subtitle = ?, logo_url = ?, credential_type = ?, scope = ?,
                access_text = ?, status = ?, workflows_count = ?, people_with_access = ?,
                updated_at = ?, masked = ?, secret_json = ?
            WHERE id = ? AND workspace_id = ?
            """,
            (
                payload.name,
                payload.app,
                payload.subtitle,
                payload.logo_url,
                payload.credential_type,
                payload.scope,
                payload.access,
                payload.status,
                payload.workflows_count,
                payload.people_with_access,
                utcutc_now(),
                1 if payload.masked else 0,
                encrypted_secret,
                asset_id,
                workspace_id,
            ),
        )
    return get_vault_asset(asset_id, workspace_id)


def get_vault_asset_access(asset_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    return get_vault_asset(asset_id, workspace_id)


def update_vault_asset_access(
    asset_id: str,
    *,
    workspace_id: str,
    visibility: str,
    allowed_roles: list[str],
    allowed_user_ids: list[str],
) -> dict[str, Any] | None:
    with get_db() as conn:
        conn.execute(
            """
            UPDATE vault_assets
            SET visibility = ?, allowed_roles_json = ?, allowed_user_ids_json = ?, updated_at = ?
            WHERE id = ? AND workspace_id = ?
            """,
            (
                visibility,
                json.dumps(allowed_roles),
                json.dumps(allowed_user_ids),
                utcutc_now(),
                asset_id,
                workspace_id,
            ),
        )
    return get_vault_asset(asset_id, workspace_id)


def delete_vault_asset(asset_id: str, *, workspace_id: str) -> bool:
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM vault_assets WHERE id = ? AND workspace_id = ?",
            (asset_id, workspace_id),
        )
    return cur.rowcount > 0


def build_vault_runtime_context(workspace_id: str, *, environment: str = "draft") -> dict[str, dict[str, Any]]:
    assets = list_vault_assets(workspace_id=workspace_id)
    context: dict[str, dict[str, Any]] = {
        "variables": {},
        "credentials": {},
        "connections": {},
    }

    allowed_scopes = {"workspace"}
    if environment == "staging":
        allowed_scopes.add("staging")
    elif environment == "production":
        allowed_scopes.add("production")

    ordered_assets = [
        asset for asset in assets
        if str(asset.get("scope") or "workspace") == "workspace"
    ]
    if environment in {"staging", "production"}:
        ordered_assets.extend(
            asset for asset in assets
            if str(asset.get("scope") or "workspace") == environment
        )

    for asset in ordered_assets:
        scope = str(asset.get("scope") or "workspace")
        if scope not in allowed_scopes:
            continue
        secret = asset["secret"]
        if asset["kind"] == "variable":
            for key in (str(asset.get("name") or ""), str(asset.get("id") or "")):
                if key:
                    context["variables"][key] = secret.get("value", "")
        elif asset["kind"] == "credential":
            for key in (str(asset.get("name") or ""), str(asset.get("id") or "")):
                if key:
                    context["credentials"][key] = secret
        elif asset["kind"] == "connection":
            for key in (str(asset.get("name") or ""), str(asset.get("id") or "")):
                if key:
                    context["connections"][key] = secret

    return context


def update_workflow(workflow_id: str, payload: WorkflowUpdate, *, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        conn.execute(
            """
            UPDATE workflows
            SET name = ?, status = ?, trigger_type = ?, category = ?, definition_json = ?
            WHERE id = ? AND workspace_id = ?
            """,
            (
                payload.name,
                payload.status,
                payload.trigger_type,
                payload.category,
                payload.definition.model_dump_json(),
                workflow_id,
                workspace_id,
            ),
        )
        row = conn.execute("SELECT * FROM workflows WHERE id = ? AND workspace_id = ?", (workflow_id, workspace_id)).fetchone()
    return row_to_dict(row) if row else None


def delete_workflow(workflow_id: str, *, workspace_id: str) -> bool:
    with get_db() as conn:
        # Delete related data first
        conn.execute("DELETE FROM workflow_versions WHERE workflow_id = ? AND workspace_id = ?", (workflow_id, workspace_id))
        conn.execute("DELETE FROM executions WHERE workflow_id = ? AND workspace_id = ?", (workflow_id, workspace_id))
        cur = conn.execute("DELETE FROM workflows WHERE id = ? AND workspace_id = ?", (workflow_id, workspace_id))
    return cur.rowcount > 0


def create_workflow(payload: WorkflowCreate, *, workspace_id: str, created_by_user_id: str) -> dict[str, Any]:
    workflow_id = f"w-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workflows (
                id, workspace_id, created_by_user_id, current_version_number, staging_version_id, published_version_id, name, status, trigger_type,
                category, success_rate, template_id, definition_json, created_at, last_run_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                workflow_id,
                workspace_id,
                created_by_user_id,
                0,
                None,
                None,
                payload.name,
                payload.status,
                payload.trigger_type,
                payload.category,
                100,
                payload.template_id,
                payload.definition.model_dump_json(),
                now,
                None,
            ),
        )
        row = conn.execute(
            "SELECT * FROM workflows WHERE id = ? AND workspace_id = ?",
            (workflow_id, workspace_id),
        ).fetchone()
    if row is None:
        raise RuntimeError("Workflow creation failed.")
    return row_to_dict(row)


def create_workflow_version(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    created_by_user_id: str,
    status: str,
    notes: str | None = None,
) -> dict[str, Any]:
    version_id = f"wv-{uuid.uuid4().hex[:10]}"
    created_at = utcutc_now()
    next_version_number = int(workflow.get("current_version_number") or 0) + 1

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workflow_versions (
                id, workflow_id, workspace_id, created_by_user_id, version_number, status, notes, definition_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                version_id,
                workflow["id"],
                workspace_id,
                created_by_user_id,
                next_version_number,
                status,
                notes,
                json.dumps(workflow["definition_json"]),
                created_at,
            ),
        )
        if status == "published":
            conn.execute(
                """
                UPDATE workflows
                SET current_version_number = ?, published_version_id = ?, status = 'active'
                WHERE id = ? AND workspace_id = ?
                """,
                (next_version_number, version_id, workflow["id"], workspace_id),
            )
        elif status == "staging":
            conn.execute(
                """
                UPDATE workflows
                SET current_version_number = ?, staging_version_id = ?
                WHERE id = ? AND workspace_id = ?
                """,
                (next_version_number, version_id, workflow["id"], workspace_id),
            )
        else:
            conn.execute(
                """
                UPDATE workflows
                SET current_version_number = ?
                WHERE id = ? AND workspace_id = ?
                """,
                (next_version_number, workflow["id"], workspace_id),
            )

        row = conn.execute(
            "SELECT * FROM workflow_versions WHERE id = ? AND workspace_id = ?",
            (version_id, workspace_id),
        ).fetchone()

    if row is None:
        raise RuntimeError("Workflow version creation failed.")
    return row_to_dict(row)


def create_workflow_deployment(
    *,
    workflow_id: str,
    workspace_id: str,
    created_by_user_id: str | None,
    environment: str,
    action: str,
    to_version_id: str,
    from_version_id: str | None = None,
    notes: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    deployment_id = f"wd-{uuid.uuid4().hex[:10]}"
    created_at = utcutc_now()
    payload = metadata or {}
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workflow_deployments (
                id, workflow_id, workspace_id, created_by_user_id, environment, action,
                from_version_id, to_version_id, notes, metadata_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                deployment_id,
                workflow_id,
                workspace_id,
                created_by_user_id,
                environment,
                action,
                from_version_id,
                to_version_id,
                notes,
                json.dumps(payload),
                created_at,
            ),
        )
        row = conn.execute(
            "SELECT * FROM workflow_deployments WHERE id = ? AND workspace_id = ?",
            (deployment_id, workspace_id),
        ).fetchone()
    if row is None:
        raise RuntimeError("Workflow deployment creation failed.")
    return row_to_dict(row)


def create_workflow_deployment_review(
    *,
    workflow_id: str,
    workspace_id: str,
    requested_by_user_id: str,
    target_environment: str,
    target_version_id: str,
    notes: str | None = None,
) -> dict[str, Any]:
    review_id = f"wr-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workflow_deployment_reviews (
                id, workflow_id, workspace_id, requested_by_user_id, reviewed_by_user_id,
                target_environment, target_version_id, status, notes, review_comment,
                created_at, updated_at, reviewed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                review_id,
                workflow_id,
                workspace_id,
                requested_by_user_id,
                None,
                target_environment,
                target_version_id,
                "pending",
                notes,
                None,
                now,
                now,
                None,
            ),
        )
        row = conn.execute(
            "SELECT * FROM workflow_deployment_reviews WHERE id = ? AND workspace_id = ?",
            (review_id, workspace_id),
        ).fetchone()
    if row is None:
        raise RuntimeError("Workflow deployment review creation failed.")
    return row_to_dict(row)


def list_workflow_deployment_reviews(
    *,
    workspace_id: str,
    workflow_id: str | None = None,
    status: str | None = None,
) -> list[dict[str, Any]]:
    query = "SELECT * FROM workflow_deployment_reviews WHERE workspace_id = ?"
    params: list[Any] = [workspace_id]
    if workflow_id is not None:
        query += " AND workflow_id = ?"
        params.append(workflow_id)
    if status is not None:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [row_to_dict(row) for row in rows]


def get_workflow_deployment_review(review_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM workflow_deployment_reviews WHERE id = ? AND workspace_id = ?",
            (review_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def update_workflow_deployment_review(
    review_id: str,
    *,
    workspace_id: str,
    status: str,
    reviewed_by_user_id: str | None = None,
    review_comment: str | None = None,
) -> dict[str, Any] | None:
    now = utcutc_now()
    reviewed_at = now if status in {"approved", "rejected", "cancelled"} else None
    with get_db() as conn:
        conn.execute(
            """
            UPDATE workflow_deployment_reviews
            SET status = ?, reviewed_by_user_id = ?, review_comment = ?, updated_at = ?, reviewed_at = ?
            WHERE id = ? AND workspace_id = ?
            """,
            (
                status,
                reviewed_by_user_id,
                review_comment,
                now,
                reviewed_at,
                review_id,
                workspace_id,
            ),
        )
        row = conn.execute(
            "SELECT * FROM workflow_deployment_reviews WHERE id = ? AND workspace_id = ?",
            (review_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def set_workflow_environment_version(
    workflow_id: str,
    *,
    workspace_id: str,
    environment: str,
    version_id: str,
) -> dict[str, Any] | None:
    with get_db() as conn:
        if environment == "production":
            conn.execute(
                """
                UPDATE workflows
                SET published_version_id = ?, status = 'active'
                WHERE id = ? AND workspace_id = ?
                """,
                (version_id, workflow_id, workspace_id),
            )
        elif environment == "staging":
            conn.execute(
                """
                UPDATE workflows
                SET staging_version_id = ?
                WHERE id = ? AND workspace_id = ?
                """,
                (version_id, workflow_id, workspace_id),
            )
        else:
            raise ValueError(f"Unsupported workflow environment: {environment}")
        row = conn.execute(
            "SELECT * FROM workflows WHERE id = ? AND workspace_id = ?",
            (workflow_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def list_executions(workspace_id: str | None = None, *, limit: int = 200, offset: int = 0) -> list[dict[str, Any]]:
    with get_db() as conn:
        if workspace_id is None:
            rows = conn.execute("SELECT * FROM executions ORDER BY started_at DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM executions WHERE workspace_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?", (workspace_id, limit, offset)).fetchall()
    return [row_to_dict(row) for row in rows]


def count_executions_by_status(workspace_id: str | None = None) -> dict[str, int]:
    """Return {status: count} without loading full rows."""
    with get_db() as conn:
        if workspace_id is None:
            rows = conn.execute("SELECT status, COUNT(*) as cnt FROM executions GROUP BY status").fetchall()
        else:
            rows = conn.execute("SELECT status, COUNT(*) as cnt FROM executions WHERE workspace_id = ? GROUP BY status", (workspace_id,)).fetchall()
    result: dict[str, int] = {}
    for row in rows:
        d = row_to_dict(row)
        result[str(d.get("status", "unknown"))] = int(d.get("cnt", 0))
    return result


def count_workflows_by_status(workspace_id: str | None = None) -> dict[str, int]:
    """Return {status: count} without loading full rows."""
    with get_db() as conn:
        if workspace_id is None:
            rows = conn.execute("SELECT status, COUNT(*) as cnt FROM workflows GROUP BY status").fetchall()
        else:
            rows = conn.execute("SELECT status, COUNT(*) as cnt FROM workflows WHERE workspace_id = ? GROUP BY status", (workspace_id,)).fetchall()
    result: dict[str, int] = {}
    for row in rows:
        d = row_to_dict(row)
        result[str(d.get("status", "unknown"))] = int(d.get("cnt", 0))
    return result


def list_workflow_executions(
    workflow_id: str,
    *,
    workspace_id: str,
    limit: int = 50,
    status: str | None = None,
) -> list[dict[str, Any]]:
    with get_db() as conn:
        if status is None:
            rows = conn.execute(
                """
                SELECT * FROM executions
                WHERE workflow_id = ? AND workspace_id = ?
                ORDER BY started_at DESC
                LIMIT ?
                """,
                (workflow_id, workspace_id, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT * FROM executions
                WHERE workflow_id = ? AND workspace_id = ? AND status = ?
                ORDER BY started_at DESC
                LIMIT ?
                """,
                (workflow_id, workspace_id, status, limit),
            ).fetchall()
    return [row_to_dict(row) for row in rows]


def get_execution(execution_id: str, *, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if workspace_id is None:
            row = conn.execute("SELECT * FROM executions WHERE id = ?", (execution_id,)).fetchone()
        else:
            row = conn.execute(
                "SELECT * FROM executions WHERE id = ? AND workspace_id = ?",
                (execution_id, workspace_id),
            ).fetchone()
    return row_to_dict(row) if row else None


def delete_execution(execution_id: str, *, workspace_id: str) -> bool:
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM executions WHERE id = ? AND workspace_id = ?",
            (execution_id, workspace_id),
        )
    return cur.rowcount > 0


def delete_execution_storage(execution_id: str, *, workspace_id: str) -> bool:
    with get_db() as conn:
        conn.execute(
            "UPDATE workflow_jobs SET execution_id = NULL WHERE execution_id = ? AND workspace_id = ?",
            (execution_id, workspace_id),
        )
        conn.execute(
            "UPDATE trigger_events SET execution_id = NULL WHERE execution_id = ? AND workspace_id = ?",
            (execution_id, workspace_id),
        )
        conn.execute(
            "DELETE FROM human_tasks WHERE execution_id = ? AND workspace_id = ?",
            (execution_id, workspace_id),
        )
        conn.execute(
            "DELETE FROM execution_pauses WHERE execution_id = ? AND workspace_id = ?",
            (execution_id, workspace_id),
        )
        conn.execute(
            "DELETE FROM execution_events WHERE execution_id = ? AND workspace_id = ?",
            (execution_id, workspace_id),
        )
        conn.execute(
            "DELETE FROM execution_artifacts WHERE execution_id = ? AND workspace_id = ?",
            (execution_id, workspace_id),
        )
        cur = conn.execute(
            "DELETE FROM executions WHERE id = ? AND workspace_id = ?",
            (execution_id, workspace_id),
        )
    return cur.rowcount > 0


def create_execution_record(
    workflow: dict[str, Any],
    payload: dict[str, Any],
    *,
    trigger_type: str | None = None,
    initiated_by_user_id: str | None = None,
    workflow_version_id: str | None = None,
    environment: str = "draft",
) -> dict[str, Any]:
    execution_id = f"e-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    record = {
        "id": execution_id,
        "workspace_id": workflow["workspace_id"],
        "initiated_by_user_id": initiated_by_user_id,
        "workflow_version_id": workflow_version_id,
        "environment": environment,
        "workflow_id": workflow["id"],
        "workflow_name": workflow["name"],
        "status": "running",
        "trigger_type": trigger_type or workflow["trigger_type"],
        "started_at": now,
        "finished_at": None,
        "duration_ms": None,
        "payload_json": payload,
        "steps_json": [],
        "result_json": None,
        "error_text": None,
    }
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO executions (
                id, workspace_id, initiated_by_user_id, workflow_version_id, environment, workflow_id, workflow_name, status, trigger_type,
                started_at, finished_at, duration_ms, payload_json, steps_json, result_json, error_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["id"],
                record["workspace_id"],
                record["initiated_by_user_id"],
                record["workflow_version_id"],
                record["environment"],
                record["workflow_id"],
                record["workflow_name"],
                record["status"],
                record["trigger_type"],
                record["started_at"],
                record["finished_at"],
                record["duration_ms"],
                json.dumps(record["payload_json"]),
                json.dumps(record["steps_json"]),
                record["result_json"],
                record["error_text"],
            ),
        )
    return record


def finish_execution_record(
    execution_id: str,
    *,
    status: str,
    duration_ms: int,
    steps: list[dict[str, Any]],
    result: dict[str, Any] | None,
    error_text: str | None,
) -> dict[str, Any]:
    finished_at = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            UPDATE executions
            SET status = ?, finished_at = ?, duration_ms = ?, steps_json = ?, result_json = ?, error_text = ?
            WHERE id = ?
            """,
            (
                status,
                finished_at,
                duration_ms,
                json.dumps(steps),
                json.dumps(result) if result is not None else None,
                error_text,
                execution_id,
            ),
        )
        row = conn.execute("SELECT * FROM executions WHERE id = ?", (execution_id,)).fetchone()
    if row is None:
        raise RuntimeError("Execution update failed.")
    return row_to_dict(row)


def touch_workflow_run(workflow_id: str) -> None:
    with get_db() as conn:
        conn.execute("UPDATE workflows SET last_run_at = ? WHERE id = ?", (utcutc_now(), workflow_id))


def create_trigger_event(
    *,
    workspace_id: str,
    workflow_id: str,
    trigger_type: str,
    event_key: str,
    payload: dict[str, Any],
    execution_id: str | None = None,
) -> dict[str, Any]:
    event_id = f"te-{uuid.uuid4().hex[:10]}"
    payload_hash = hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
    created_at = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO trigger_events (
                id, workspace_id, workflow_id, trigger_type, event_key, execution_id, payload_hash, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_id,
                workspace_id,
                workflow_id,
                trigger_type,
                event_key,
                execution_id,
                payload_hash,
                created_at,
            ),
        )
        row = conn.execute("SELECT * FROM trigger_events WHERE id = ?", (event_id,)).fetchone()
    if row is None:
        raise RuntimeError("Trigger event creation failed.")
    return row_to_dict(row)


def get_trigger_event_by_key(*, workspace_id: str, workflow_id: str, event_key: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT * FROM trigger_events
            WHERE workspace_id = ? AND workflow_id = ? AND event_key = ?
            """,
            (workspace_id, workflow_id, event_key),
        ).fetchone()
    return row_to_dict(row) if row else None


def attach_trigger_event_execution(trigger_event_id: str, *, execution_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        conn.execute(
            "UPDATE trigger_events SET execution_id = ? WHERE id = ?",
            (execution_id, trigger_event_id),
        )
        row = conn.execute("SELECT * FROM trigger_events WHERE id = ?", (trigger_event_id,)).fetchone()
    return row_to_dict(row) if row else None


def create_execution_pause(
    *,
    workspace_id: str,
    workflow_id: str,
    execution_id: str,
    workflow_version_id: str | None,
    step_id: str,
    step_name: str,
    wait_type: str,
    resume_after: str | None,
    resume_token: str,
    cancel_token: str,
    state: dict[str, Any],
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    pause_id = f"ep-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO execution_pauses (
                id, workspace_id, workflow_id, execution_id, workflow_version_id, step_id, step_name, wait_type, status,
                resume_after, resume_token, cancel_token, state_json, metadata_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pause_id,
                workspace_id,
                workflow_id,
                execution_id,
                workflow_version_id,
                step_id,
                step_name,
                wait_type,
                "paused",
                resume_after,
                resume_token,
                cancel_token,
                json.dumps(state),
                json.dumps(metadata or {}),
                now,
                now,
            ),
        )
        row = conn.execute("SELECT * FROM execution_pauses WHERE id = ?", (pause_id,)).fetchone()
    if row is None:
        raise RuntimeError("Execution pause creation failed.")
    return row_to_dict(row)


def get_execution_pause(execution_id: str, *, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if workspace_id is None:
            row = conn.execute(
                "SELECT * FROM execution_pauses WHERE execution_id = ? ORDER BY created_at DESC LIMIT 1",
                (execution_id,),
            ).fetchone()
        else:
            row = conn.execute(
                """
                SELECT * FROM execution_pauses
                WHERE execution_id = ? AND workspace_id = ?
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (execution_id, workspace_id),
            ).fetchone()
    return row_to_dict(row) if row else None


def get_execution_pause_by_token(*, token: str, token_kind: str) -> dict[str, Any] | None:
    column = "resume_token" if token_kind == "resume" else "cancel_token"
    with get_db() as conn:
        row = conn.execute(
            f"SELECT * FROM execution_pauses WHERE {column} = ? ORDER BY created_at DESC LIMIT 1",
            (token,),
        ).fetchone()
    return row_to_dict(row) if row else None


def update_execution_pause_status(pause_id: str, *, status: str) -> dict[str, Any] | None:
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            "UPDATE execution_pauses SET status = ?, updated_at = ? WHERE id = ?",
            (status, now, pause_id),
        )
        row = conn.execute("SELECT * FROM execution_pauses WHERE id = ?", (pause_id,)).fetchone()
    return row_to_dict(row) if row else None


def list_due_execution_pauses(*, limit: int = 25) -> list[dict[str, Any]]:
    now = utcutc_now()
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT * FROM execution_pauses
            WHERE status = 'paused'
              AND wait_type = 'delay'
              AND resume_after IS NOT NULL
              AND resume_after <= ?
            ORDER BY resume_after ASC
            LIMIT ?
            """,
            (now, limit),
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def create_human_task(
    *,
    workspace_id: str,
    workflow_id: str,
    execution_id: str,
    pause_id: str,
    step_id: str,
    step_name: str,
    title: str,
    instructions: str,
    assigned_to_user_id: str | None,
    assigned_to_email: str | None,
    priority: str,
    choices: list[str],
    due_at: str | None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    task_id = f"ht-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO human_tasks (
                id, workspace_id, workflow_id, execution_id, pause_id, step_id, step_name, title, instructions,
                status, assigned_to_user_id, assigned_to_email, priority, choices_json, due_at, decision, comment,
                response_payload_json, metadata_json, created_at, updated_at, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                task_id,
                workspace_id,
                workflow_id,
                execution_id,
                pause_id,
                step_id,
                step_name,
                title,
                instructions,
                "open",
                assigned_to_user_id,
                assigned_to_email,
                priority,
                json.dumps(choices),
                due_at,
                None,
                None,
                json.dumps({}),
                json.dumps(metadata or {}),
                now,
                now,
                None,
            ),
        )
        row = conn.execute("SELECT * FROM human_tasks WHERE id = ?", (task_id,)).fetchone()
    if row is None:
        raise RuntimeError("Human task creation failed.")
    return _normalize_human_task(row_to_dict(row))


def list_human_tasks(
    workspace_id: str,
    *,
    status: str | None = None,
    assigned_to_user_id: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    query = "SELECT * FROM human_tasks WHERE workspace_id = ?"
    params: list[Any] = [workspace_id]
    if status:
        query += " AND status = ?"
        params.append(status)
    if assigned_to_user_id:
        query += " AND assigned_to_user_id = ?"
        params.append(assigned_to_user_id)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [_normalize_human_task(row_to_dict(row)) for row in rows]


def get_human_task(task_id: str, *, workspace_id: str | None = None) -> dict[str, Any] | None:
    with get_db() as conn:
        if workspace_id is None:
            row = conn.execute("SELECT * FROM human_tasks WHERE id = ?", (task_id,)).fetchone()
        else:
            row = conn.execute(
                "SELECT * FROM human_tasks WHERE id = ? AND workspace_id = ?",
                (task_id, workspace_id),
            ).fetchone()
    return _normalize_human_task(row_to_dict(row)) if row else None


def get_human_task_by_pause_id(pause_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM human_tasks WHERE pause_id = ?", (pause_id,)).fetchone()
    return _normalize_human_task(row_to_dict(row)) if row else None


def complete_human_task(
    task_id: str,
    *,
    decision: str,
    comment: str | None,
    response_payload: dict[str, Any],
) -> dict[str, Any] | None:
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            UPDATE human_tasks
            SET status = 'completed', decision = ?, comment = ?, response_payload_json = ?, updated_at = ?, completed_at = ?
            WHERE id = ?
            """,
            (decision, comment, json.dumps(response_payload), now, now, task_id),
        )
        row = conn.execute("SELECT * FROM human_tasks WHERE id = ?", (task_id,)).fetchone()
    return _normalize_human_task(row_to_dict(row)) if row else None


def cancel_human_task(task_id: str, *, comment: str | None = None) -> dict[str, Any] | None:
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            UPDATE human_tasks
            SET status = 'cancelled', comment = ?, updated_at = ?, completed_at = ?
            WHERE id = ?
            """,
            (comment, now, now, task_id),
        )
        row = conn.execute("SELECT * FROM human_tasks WHERE id = ?", (task_id,)).fetchone()
    return _normalize_human_task(row_to_dict(row)) if row else None


def create_execution_event(
    *,
    workspace_id: str,
    workflow_id: str,
    execution_id: str,
    event_type: str,
    step_id: str | None = None,
    step_name: str | None = None,
    status: str | None = None,
    message: str | None = None,
    data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    event_id = f"ee-{uuid.uuid4().hex[:10]}"
    created_at = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO execution_events (
                id, workspace_id, workflow_id, execution_id, event_type, step_id, step_name, status, message, data_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_id,
                workspace_id,
                workflow_id,
                execution_id,
                event_type,
                step_id,
                step_name,
                status,
                message,
                json.dumps(data or {}),
                created_at,
            ),
        )
        row = conn.execute("SELECT * FROM execution_events WHERE id = ?", (event_id,)).fetchone()
    if row is None:
        raise RuntimeError("Execution event creation failed.")
    return row_to_dict(row)


def list_execution_events(*, execution_id: str, workspace_id: str, limit: int = 200) -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT * FROM execution_events
            WHERE execution_id = ? AND workspace_id = ?
            ORDER BY created_at ASC
            LIMIT ?
            """,
            (execution_id, workspace_id, limit),
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def create_execution_artifact(
    *,
    workspace_id: str,
    workflow_id: str,
    execution_id: str,
    artifact_type: str,
    direction: str,
    data: dict[str, Any],
    step_id: str | None = None,
    step_name: str | None = None,
) -> dict[str, Any]:
    artifact_id = f"ea-{uuid.uuid4().hex[:10]}"
    payload = data or {}
    encoded = json.dumps(payload)
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO execution_artifacts (
                id, workspace_id, workflow_id, execution_id, step_id, step_name, artifact_type, direction, data_json, size_bytes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                artifact_id,
                workspace_id,
                workflow_id,
                execution_id,
                step_id,
                step_name,
                artifact_type,
                direction,
                encoded,
                len(encoded.encode("utf-8")),
                utcutc_now(),
            ),
        )
        row = conn.execute("SELECT * FROM execution_artifacts WHERE id = ?", (artifact_id,)).fetchone()
    if row is None:
        raise RuntimeError("Execution artifact creation failed.")
    return row_to_dict(row)


def list_execution_artifacts(*, execution_id: str, workspace_id: str, limit: int = 500) -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT * FROM execution_artifacts
            WHERE execution_id = ? AND workspace_id = ?
            ORDER BY created_at ASC
            LIMIT ?
            """,
            (execution_id, workspace_id, limit),
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def get_execution_artifact(artifact_id: str, *, execution_id: str, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT * FROM execution_artifacts
            WHERE id = ? AND execution_id = ? AND workspace_id = ?
            """,
            (artifact_id, execution_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def prune_execution_artifacts(*, retention_days: int) -> int:
    cutoff = (datetime.now(UTC) - timedelta(days=retention_days)).isoformat()
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id FROM execution_artifacts WHERE created_at < ?",
            (cutoff,),
        ).fetchall()
        count = len(rows)
        conn.execute(
            "DELETE FROM execution_artifacts WHERE created_at < ?",
            (cutoff,),
        )
    return count


def _normalize_template(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": item["id"],
        "name": item["name"],
        "description": item["description"],
        "category": item["category"],
        "trigger_type": item["trigger_type"],
        "estimated_time": item["estimated_time"],
        "complexity": item["complexity"],
        "color": item["color"],
        "owner": item["owner"],
        "installs": item["installs"],
        "outcome": item["outcome"],
        "tags": item["tags_json"],
    }


def _normalize_vault_asset(item: dict[str, Any]) -> dict[str, Any]:
    from .encryption import decrypt_secret
    raw_secret = item["secret_json"]
    if isinstance(raw_secret, dict):
        secret = raw_secret
    elif isinstance(raw_secret, str) and raw_secret:
        try:
            decrypted = decrypt_secret(raw_secret)
            secret = json.loads(decrypted)
        except (json.JSONDecodeError, ValueError):
            secret = {}
    else:
        secret = {}
    return {
        "id": item["id"],
        "workspace_id": item["workspace_id"],
        "created_by_user_id": item.get("created_by_user_id"),
        "kind": item["kind"],
        "name": item["name"],
        "app": item.get("app") or "",
        "subtitle": item.get("subtitle") or "",
        "logo_url": item.get("logo_url") or "",
        "credential_type": item.get("credential_type") or "",
        "scope": item.get("scope") or "workspace",
        "access": item.get("access_text") or "",
        "status": item.get("status") or "active",
        "workflows_count": item.get("workflows_count") or 0,
        "people_with_access": item.get("people_with_access") or 0,
        "last_used": item.get("last_used_at") or "Never",
        "last_modified": item.get("updated_at") or "",
        "updated_at": item.get("updated_at") or "",
        "visibility": item.get("visibility") or "workspace",
        "allowed_roles": item.get("allowed_roles_json") or [],
        "allowed_user_ids": item.get("allowed_user_ids_json") or [],
        "masked": bool(item.get("masked", 1)),
        "secret": secret,
        "key": item["name"],
    }


def _normalize_human_task(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": item["id"],
        "workspace_id": item["workspace_id"],
        "workflow_id": item["workflow_id"],
        "execution_id": item["execution_id"],
        "pause_id": item["pause_id"],
        "step_id": item["step_id"],
        "step_name": item["step_name"],
        "title": item["title"],
        "instructions": item["instructions"],
        "status": item["status"],
        "assigned_to_user_id": item.get("assigned_to_user_id"),
        "assigned_to_email": item.get("assigned_to_email"),
        "priority": item.get("priority") or "normal",
        "choices": item.get("choices_json") or [],
        "due_at": item.get("due_at"),
        "decision": item.get("decision"),
        "comment": item.get("comment"),
        "response_payload": item.get("response_payload_json") or {},
        "metadata": item.get("metadata_json") or {},
        "created_at": item["created_at"],
        "updated_at": item["updated_at"],
        "completed_at": item.get("completed_at"),
    }


def _normalize_audit_event(item: dict[str, Any]) -> dict[str, Any]:
    details = item.get("details_json")
    return {
        "id": item["id"],
        "workspace_id": item["workspace_id"],
        "actor_user_id": item.get("actor_user_id"),
        "actor_email": item.get("actor_email"),
        "action": item["action"],
        "target_type": item["target_type"],
        "target_id": item.get("target_id"),
        "status": item["status"],
        "details": details if isinstance(details, dict) else {},
        "created_at": item["created_at"],
    }


def _shift_iso_seconds(iso_value: str, seconds: int) -> str:
    current = datetime.fromisoformat(iso_value.replace("Z", "+00:00"))
    if current.tzinfo is None:
        current = current.replace(tzinfo=UTC)
    return (current + timedelta(seconds=seconds)).isoformat()


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

def _ensure_notifications_table() -> None:
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                body TEXT NOT NULL DEFAULT '',
                kind TEXT NOT NULL DEFAULT 'info',
                link TEXT,
                read INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_notif_user_ws ON notifications (user_id, workspace_id)")


def list_user_notifications(*, user_id: str, workspace_id: str, limit: int = 50) -> list[dict[str, Any]]:
    _ensure_notifications_table()
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM notifications WHERE user_id = ? AND workspace_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, workspace_id, limit),
        ).fetchall()
    return [
        {
            "id": r["id"],
            "title": r["title"],
            "body": r["body"],
            "kind": r["kind"],
            "link": r.get("link"),
            "read": bool(r["read"]),
            "created_at": r["created_at"],
        }
        for r in rows
    ]


def create_user_notification(
    *,
    user_id: str,
    workspace_id: str,
    title: str,
    body: str = "",
    kind: str = "info",
    link: str | None = None,
) -> dict[str, Any]:
    _ensure_notifications_table()
    notif_id = f"notif-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO notifications (id, workspace_id, user_id, title, body, kind, link, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)",
            (notif_id, workspace_id, user_id, title, body, kind, link, now),
        )
    return {
        "id": notif_id,
        "title": title,
        "body": body,
        "kind": kind,
        "link": link,
        "read": False,
        "created_at": now,
    }


def mark_notification_as_read(notification_id: str, *, user_id: str, workspace_id: str) -> None:
    _ensure_notifications_table()
    with get_db() as conn:
        conn.execute(
            "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ? AND workspace_id = ?",
            (notification_id, user_id, workspace_id),
        )


def mark_all_notifications_read_for_user(*, user_id: str, workspace_id: str) -> None:
    _ensure_notifications_table()
    with get_db() as conn:
        conn.execute(
            "UPDATE notifications SET read = 1 WHERE user_id = ? AND workspace_id = ? AND read = 0",
            (user_id, workspace_id),
        )


def delete_template(template_id: str, *, workspace_id: str) -> bool:
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM templates WHERE id = ? AND workspace_id = ?",
            (template_id, workspace_id),
        )
    return cur.rowcount > 0


def remove_workspace_member(workspace_id: str, user_id: str) -> bool:
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM workspace_memberships WHERE workspace_id = ? AND user_id = ?",
            (workspace_id, user_id),
        )
    return cur.rowcount > 0


def resume_execution_record(execution_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        conn.execute(
            "UPDATE executions SET status = 'running', finished_at = NULL, error_text = NULL WHERE id = ?",
            (execution_id,),
        )
        row = conn.execute("SELECT * FROM executions WHERE id = ?", (execution_id,)).fetchone()
    return row_to_dict(row) if row else None


# ── Agent CRUD ─────────────────────────────────────────────────────────

def create_agent(payload: Any, *, workspace_id: str, created_by_user_id: str) -> dict[str, Any]:
    agent_id = f"ag-{uuid.uuid4().hex[:10]}"
    now = utcutc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO agents (
                id, workspace_id, created_by_user_id, name, description, agent_type, status,
                icon, color, tools_json, memory_json, model_config_json, max_iterations,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                agent_id,
                workspace_id,
                created_by_user_id,
                payload.name,
                payload.description,
                payload.agent_type,
                payload.status,
                payload.icon,
                payload.color,
                json.dumps([t.model_dump() for t in payload.tools]),
                payload.memory.model_dump_json(),
                payload.model_config_data.model_dump_json(),
                payload.max_iterations,
                now,
                now,
            ),
        )
        row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
    if row is None:
        raise RuntimeError("Agent creation failed.")
    return row_to_dict(row)


def get_agent(agent_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM agents WHERE id = ? AND workspace_id = ?",
            (agent_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def list_agents(*, workspace_id: str) -> list[dict[str, Any]]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM agents WHERE workspace_id = ? ORDER BY updated_at DESC",
            (workspace_id,),
        ).fetchall()
    return [row_to_dict(r) for r in rows]


def update_agent(agent_id: str, payload: Any, *, workspace_id: str) -> dict[str, Any] | None:
    fields: list[str] = []
    values: list[Any] = []

    if payload.name is not None:
        fields.append("name = ?")
        values.append(payload.name)
    if payload.description is not None:
        fields.append("description = ?")
        values.append(payload.description)
    if payload.agent_type is not None:
        fields.append("agent_type = ?")
        values.append(payload.agent_type)
    if payload.status is not None:
        fields.append("status = ?")
        values.append(payload.status)
    if payload.icon is not None:
        fields.append("icon = ?")
        values.append(payload.icon)
    if payload.color is not None:
        fields.append("color = ?")
        values.append(payload.color)
    if payload.max_iterations is not None:
        fields.append("max_iterations = ?")
        values.append(payload.max_iterations)
    if payload.tools is not None:
        fields.append("tools_json = ?")
        values.append(json.dumps([t.model_dump() for t in payload.tools]))
    if payload.memory is not None:
        fields.append("memory_json = ?")
        values.append(payload.memory.model_dump_json())
    if payload.model_config_data is not None:
        fields.append("model_config_json = ?")
        values.append(payload.model_config_data.model_dump_json())

    if not fields:
        return get_agent(agent_id, workspace_id=workspace_id)

    fields.append("updated_at = ?")
    values.append(utcutc_now())
    values.extend([agent_id, workspace_id])

    with get_db() as conn:
        conn.execute(
            f"UPDATE agents SET {', '.join(fields)} WHERE id = ? AND workspace_id = ?",
            tuple(values),
        )
        row = conn.execute(
            "SELECT * FROM agents WHERE id = ? AND workspace_id = ?",
            (agent_id, workspace_id),
        ).fetchone()
    return row_to_dict(row) if row else None


def delete_agent(agent_id: str, *, workspace_id: str) -> bool:
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM agents WHERE id = ? AND workspace_id = ?",
            (agent_id, workspace_id),
        )
    return cur.rowcount > 0


# ── Chat Memory ──

def create_thread(agent_id: str, *, thread_id: str | None = None, title: str | None = None, resource_id: str = "default") -> dict:
    tid = thread_id or str(uuid.uuid4())
    now = utc_now()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO chat_threads (id, agent_id, resource_id, title, created_at, updated_at) VALUES (?,?,?,?,?,?)",
            (tid, agent_id, resource_id, title, now, now),
        )
    return {"id": tid, "agent_id": agent_id, "resource_id": resource_id, "title": title, "created_at": now, "updated_at": now}


def list_threads(agent_id: str, *, limit: int = 50) -> list[dict]:
    with get_db() as conn:
        rows = conn.execute(
            """SELECT t.*, (SELECT COUNT(*) FROM chat_messages m WHERE m.thread_id = t.id) AS message_count,
                      (SELECT MAX(m.created_at) FROM chat_messages m WHERE m.thread_id = t.id) AS last_message_at
               FROM chat_threads t WHERE t.agent_id = ? ORDER BY t.updated_at DESC LIMIT ?""",
            (agent_id, limit),
        ).fetchall()
    return [dict(r) for r in rows]


def get_thread(thread_id: str) -> dict | None:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM chat_threads WHERE id = ?", (thread_id,)).fetchone()
    return dict(row) if row else None


def delete_thread(thread_id: str) -> bool:
    with get_db() as conn:
        cur = conn.execute("DELETE FROM chat_threads WHERE id = ?", (thread_id,))
    return cur.rowcount > 0


def save_message(thread_id: str, role: str, content: str, *, msg_id: str | None = None, tool_call_json: str | None = None) -> dict:
    mid = msg_id or str(uuid.uuid4())
    now = utc_now()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO chat_messages (id, thread_id, role, content, tool_call_json, created_at) VALUES (?,?,?,?,?,?)",
            (mid, thread_id, role, content, tool_call_json, now),
        )
        conn.execute("UPDATE chat_threads SET updated_at = ? WHERE id = ?", (now, thread_id))
    return {"id": mid, "thread_id": thread_id, "role": role, "content": content, "tool_call_json": tool_call_json, "created_at": now}


def get_messages(thread_id: str, *, limit: int = 50, before_seq: int | None = None) -> list[dict]:
    with get_db() as conn:
        if before_seq is not None:
            rows = conn.execute(
                "SELECT * FROM chat_messages WHERE thread_id = ? AND seq < ? ORDER BY seq DESC LIMIT ?",
                (thread_id, before_seq, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY seq DESC LIMIT ?",
                (thread_id, limit),
            ).fetchall()
    return [dict(r) for r in reversed(rows)]


def get_windowed_messages(thread_id: str, *, window_size: int = 10) -> list[dict]:
    """Get last N message pairs (user+assistant) for context window."""
    return get_messages(thread_id, limit=window_size * 2)


# ── Knowledge Base ──

def create_knowledge_base(workspace_id: str, *, name: str, description: str = "", embedding_model: str = "mock", chunk_size: int = 500, chunk_overlap: int = 50) -> dict:
    kid = str(uuid.uuid4())
    now = utc_now()
    with get_db() as conn:
        conn.execute(
            """INSERT INTO knowledge_bases (id, workspace_id, name, description, embedding_model, chunk_size, chunk_overlap, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (kid, workspace_id, name, description, embedding_model, chunk_size, chunk_overlap, now, now),
        )
    return {"id": kid, "workspace_id": workspace_id, "name": name, "description": description,
            "embedding_model": embedding_model, "chunk_size": chunk_size, "chunk_overlap": chunk_overlap,
            "status": "active", "document_count": 0, "created_at": now, "updated_at": now}


def list_knowledge_bases(workspace_id: str) -> list[dict]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM knowledge_bases WHERE workspace_id = ? ORDER BY updated_at DESC",
            (workspace_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def get_knowledge_base(kb_id: str) -> dict | None:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM knowledge_bases WHERE id = ?", (kb_id,)).fetchone()
    return dict(row) if row else None


def update_knowledge_base(kb_id: str, **updates) -> dict | None:
    sets = []
    vals = []
    for k, v in updates.items():
        if v is not None:
            sets.append(f"{k} = ?")
            vals.append(v)
    if not sets:
        return get_knowledge_base(kb_id)
    sets.append("updated_at = ?")
    vals.append(utc_now())
    vals.append(kb_id)
    with get_db() as conn:
        conn.execute(f"UPDATE knowledge_bases SET {', '.join(sets)} WHERE id = ?", vals)
    return get_knowledge_base(kb_id)


def delete_knowledge_base(kb_id: str) -> bool:
    with get_db() as conn:
        cur = conn.execute("DELETE FROM knowledge_bases WHERE id = ?", (kb_id,))
    return cur.rowcount > 0


def add_knowledge_document(kb_id: str, *, filename: str, content: str, content_type: str = "text/plain", metadata: dict | None = None) -> dict:
    doc_id = str(uuid.uuid4())
    now = utc_now()
    meta_json = json.dumps(metadata or {})

    kb = get_knowledge_base(kb_id)
    chunk_size = kb["chunk_size"] if kb else 500
    chunk_overlap = kb["chunk_overlap"] if kb else 50
    chunks = _split_text(content, chunk_size, chunk_overlap)

    with get_db() as conn:
        conn.execute(
            """INSERT INTO knowledge_documents (id, kb_id, filename, content_type, char_count, chunk_count, status, metadata_json, created_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (doc_id, kb_id, filename, content_type, len(content), len(chunks), "ready", meta_json, now),
        )
        for i, chunk_text in enumerate(chunks):
            conn.execute(
                """INSERT INTO knowledge_chunks (id, doc_id, kb_id, chunk_index, content, metadata_json, created_at)
                   VALUES (?,?,?,?,?,?,?)""",
                (str(uuid.uuid4()), doc_id, kb_id, i, chunk_text, "{}", now),
            )
        conn.execute(
            "UPDATE knowledge_bases SET document_count = document_count + 1, updated_at = ? WHERE id = ?",
            (now, kb_id),
        )
    return {"id": doc_id, "kb_id": kb_id, "filename": filename, "content_type": content_type,
            "char_count": len(content), "chunk_count": len(chunks), "status": "ready", "created_at": now}


def list_knowledge_documents(kb_id: str) -> list[dict]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM knowledge_documents WHERE kb_id = ? ORDER BY created_at DESC", (kb_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def delete_knowledge_document(doc_id: str) -> bool:
    with get_db() as conn:
        row = conn.execute("SELECT kb_id FROM knowledge_documents WHERE id = ?", (doc_id,)).fetchone()
        if not row:
            return False
        conn.execute("DELETE FROM knowledge_documents WHERE id = ?", (doc_id,))
        conn.execute(
            "UPDATE knowledge_bases SET document_count = MAX(0, document_count - 1), updated_at = ? WHERE id = ?",
            (utc_now(), row["kb_id"]),
        )
    return True


def search_knowledge_chunks(kb_id: str, query: str, *, top_k: int = 5) -> list[dict]:
    """Simple keyword-based search (FTS fallback). Returns scored chunks."""
    query_lower = query.lower()
    query_words = query_lower.split()
    with get_db() as conn:
        rows = conn.execute(
            """SELECT c.id AS chunk_id, c.doc_id, d.filename, c.chunk_index, c.content
               FROM knowledge_chunks c JOIN knowledge_documents d ON c.doc_id = d.id
               WHERE c.kb_id = ?""",
            (kb_id,),
        ).fetchall()

    scored = []
    for r in rows:
        content_lower = r["content"].lower()
        score = sum(1 for w in query_words if w in content_lower) / max(len(query_words), 1)
        if score > 0:
            scored.append({**dict(r), "score": round(score, 3)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


def _split_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    """Split text into chunks with overlap."""
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start = end - chunk_overlap
    return chunks
