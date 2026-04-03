from __future__ import annotations

import json
import hashlib
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from .db import get_db, row_to_dict, utc_now
from .models import VaultAssetCreate, VaultAssetUpdate, WorkflowCreate, WorkflowUpdate


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
            (identity_id, user_id, provider, provider_subject, email, utc_now()),
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
    created_at = utc_now()
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
            "updated_at": utc_now(),
        }
    item = row_to_dict(row)
    item["require_webhook_signature"] = bool(item.get("require_webhook_signature", 0))
    return item


def update_workspace_settings(
    workspace_id: str,
    *,
    public_base_url: str | None,
    require_webhook_signature: bool,
    webhook_signing_secret: str | None,
) -> dict[str, Any]:
    now = utc_now()
    current = get_workspace_settings(workspace_id)
    next_secret = webhook_signing_secret if webhook_signing_secret is not None else current.get("webhook_signing_secret")
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workspace_settings (
                workspace_id, public_base_url, require_webhook_signature, webhook_signing_secret, updated_at
            ) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(workspace_id) DO UPDATE SET
                public_base_url = excluded.public_base_url,
                require_webhook_signature = excluded.require_webhook_signature,
                webhook_signing_secret = excluded.webhook_signing_secret,
                updated_at = excluded.updated_at
            """,
            (
                workspace_id,
                public_base_url,
                1 if require_webhook_signature else 0,
                next_secret,
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


def list_workflows(workspace_id: str | None = None) -> list[dict[str, Any]]:
    with get_db() as conn:
        if workspace_id is None:
            rows = conn.execute("SELECT * FROM workflows ORDER BY created_at DESC").fetchall()
        else:
            rows = conn.execute("SELECT * FROM workflows WHERE workspace_id = ? ORDER BY created_at DESC", (workspace_id,)).fetchall()
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


def get_workflow_version(version_id: str, *, workspace_id: str) -> dict[str, Any] | None:
    with get_db() as conn:
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


def create_workflow_job(
    *,
    workspace_id: str,
    workflow_id: str,
    workflow_version_id: str | None,
    initiated_by_user_id: str | None,
    trigger_type: str,
    payload: dict[str, Any],
    max_attempts: int = 3,
) -> dict[str, Any]:
    job_id = f"job-{uuid.uuid4().hex[:10]}"
    now = utc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workflow_jobs (
                id, workspace_id, workflow_id, workflow_version_id, initiated_by_user_id, trigger_type, status,
                payload_json, attempts, max_attempts, available_at, leased_until, execution_id, error_text, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job_id,
                workspace_id,
                workflow_id,
                workflow_version_id,
                initiated_by_user_id,
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
    now = utc_now()
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
    now = utc_now()
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
    now = utc_now()
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
    now = utc_now()
    next_available = _shift_iso_seconds(now, retry_delay_seconds)
    with get_db() as conn:
        row = conn.execute("SELECT * FROM workflow_jobs WHERE id = ?", (job_id,)).fetchone()
        if row is None:
            return None
        item = row_to_dict(row)
        max_attempts = int(item.get("max_attempts") or 3)
        attempts = int(item.get("attempts") or 0)
        next_status = "failed" if attempts < max_attempts else "failed"
        next_available_value = next_available if attempts < max_attempts else now
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
    asset_id = f"va-{uuid.uuid4().hex[:10]}"
    now = utc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO vault_assets (
                id, workspace_id, created_by_user_id, kind, name, app, subtitle, logo_url, credential_type, scope,
                access_text, status, workflows_count, people_with_access, last_used_at,
                updated_at, masked, secret_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                json.dumps(payload.secret),
            ),
        )
    asset = get_vault_asset(asset_id, workspace_id)
    if asset is None:
        raise RuntimeError("Vault asset creation failed.")
    return asset


def update_vault_asset(asset_id: str, payload: VaultAssetUpdate, *, workspace_id: str) -> dict[str, Any] | None:
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
                utc_now(),
                1 if payload.masked else 0,
                json.dumps(payload.secret),
                asset_id,
                workspace_id,
            ),
        )
    return get_vault_asset(asset_id, workspace_id)


def build_vault_runtime_context(workspace_id: str) -> dict[str, dict[str, Any]]:
    assets = list_vault_assets(workspace_id=workspace_id)
    context: dict[str, dict[str, Any]] = {
        "variables": {},
        "credentials": {},
        "connections": {},
    }

    for asset in assets:
        secret = asset["secret"]
        if asset["kind"] == "variable":
            context["variables"][asset["name"]] = secret.get("value", "")
        elif asset["kind"] == "credential":
            context["credentials"][asset["name"]] = secret
        elif asset["kind"] == "connection":
            context["connections"][asset["name"]] = secret

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


def create_workflow(payload: WorkflowCreate, *, workspace_id: str, created_by_user_id: str) -> dict[str, Any]:
    workflow_id = f"w-{uuid.uuid4().hex[:10]}"
    now = utc_now()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO workflows (
                id, workspace_id, created_by_user_id, current_version_number, published_version_id, name, status, trigger_type,
                category, success_rate, template_id, definition_json, created_at, last_run_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                workflow_id,
                workspace_id,
                created_by_user_id,
                0,
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
    workflow = get_workflow(workflow_id, workspace_id)
    if workflow is None:
        raise RuntimeError("Workflow creation failed.")
    return workflow


def create_workflow_version(
    workflow: dict[str, Any],
    *,
    workspace_id: str,
    created_by_user_id: str,
    status: str,
    notes: str | None = None,
) -> dict[str, Any]:
    version_id = f"wv-{uuid.uuid4().hex[:10]}"
    created_at = utc_now()
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


def list_executions(workspace_id: str | None = None) -> list[dict[str, Any]]:
    with get_db() as conn:
        if workspace_id is None:
            rows = conn.execute("SELECT * FROM executions ORDER BY started_at DESC").fetchall()
        else:
            rows = conn.execute("SELECT * FROM executions WHERE workspace_id = ? ORDER BY started_at DESC", (workspace_id,)).fetchall()
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


def create_execution_record(
    workflow: dict[str, Any],
    payload: dict[str, Any],
    *,
    trigger_type: str | None = None,
    initiated_by_user_id: str | None = None,
    workflow_version_id: str | None = None,
) -> dict[str, Any]:
    execution_id = f"e-{uuid.uuid4().hex[:10]}"
    now = utc_now()
    record = {
        "id": execution_id,
        "workspace_id": workflow["workspace_id"],
        "initiated_by_user_id": initiated_by_user_id,
        "workflow_version_id": workflow_version_id,
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
                id, workspace_id, initiated_by_user_id, workflow_version_id, workflow_id, workflow_name, status, trigger_type,
                started_at, finished_at, duration_ms, payload_json, steps_json, result_json, error_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["id"],
                record["workspace_id"],
                record["initiated_by_user_id"],
                record["workflow_version_id"],
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
    finished_at = utc_now()
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
        conn.execute("UPDATE workflows SET last_run_at = ? WHERE id = ?", (utc_now(), workflow_id))


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
    created_at = utc_now()
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
    now = utc_now()
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
    now = utc_now()
    with get_db() as conn:
        conn.execute(
            "UPDATE execution_pauses SET status = ?, updated_at = ? WHERE id = ?",
            (status, now, pause_id),
        )
        row = conn.execute("SELECT * FROM execution_pauses WHERE id = ?", (pause_id,)).fetchone()
    return row_to_dict(row) if row else None


def list_due_execution_pauses(*, limit: int = 25) -> list[dict[str, Any]]:
    now = utc_now()
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
    now = utc_now()
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
    now = utc_now()
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
    now = utc_now()
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
    created_at = utc_now()
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
    secret = item["secret_json"]
    return {
        "id": item["id"],
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
        "masked": bool(item.get("masked", 1)),
        "secret": secret if isinstance(secret, dict) else {},
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
