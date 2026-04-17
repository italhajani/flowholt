"""
OAuth2 router — provider listing, authorization, callback, and token refresh.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from ..config import get_settings
from ..deps import get_session_context, require_workspace_role
from ..models import VaultAssetCreate, VaultAssetUpdate
from ..repository import create_vault_asset, get_vault_asset_by_name, update_vault_asset

settings = get_settings()
router = APIRouter()


@router.get(f"{settings.api_prefix}/oauth2/providers")
def oauth2_list_providers() -> list[dict[str, str]]:
    from ..oauth2 import list_providers
    return list_providers()


@router.post(f"{settings.api_prefix}/oauth2/authorize")
def oauth2_authorize(request_body: dict[str, Any] | None = None, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    from ..oauth2 import build_authorize_url

    if request_body is None:
        request_body = {}
    provider = str(request_body.get("provider", ""))
    client_id = str(request_body.get("client_id", ""))
    redirect_uri = str(request_body.get("redirect_uri", ""))
    scopes = request_body.get("scopes")

    if not provider or not client_id or not redirect_uri:
        raise HTTPException(status_code=400, detail="provider, client_id, and redirect_uri are required.")

    workspace_id = str(session["workspace"]["id"])
    url, state = build_authorize_url(
        provider=provider,
        client_id=client_id,
        redirect_uri=redirect_uri,
        workspace_id=workspace_id,
        scopes=scopes,
    )
    return {"authorize_url": url, "state": state}


@router.post(f"{settings.api_prefix}/oauth2/callback")
async def oauth2_callback(request_body: dict[str, Any] | None = None, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    from ..oauth2 import validate_state, exchange_code

    if request_body is None:
        request_body = {}
    code = str(request_body.get("code", ""))
    state = str(request_body.get("state", ""))
    client_secret = str(request_body.get("client_secret", ""))

    if not code or not state:
        raise HTTPException(status_code=400, detail="code and state are required.")

    state_data = validate_state(state)
    if state_data is None:
        raise HTTPException(status_code=400, detail="Invalid or expired state token.")

    token_data = await exchange_code(
        provider=state_data["provider"],
        code=code,
        client_id=state_data["client_id"],
        client_secret=client_secret,
        redirect_uri=state_data["redirect_uri"],
    )

    # Store as a reusable vault connection for workflow nodes.
    workspace_id = state_data["workspace_id"]
    provider = state_data["provider"]
    asset_name = f"{provider.title()} OAuth2"
    asset_payload = VaultAssetCreate(
        kind="connection",
        name=asset_name,
        app=provider,
        subtitle="Connected via OAuth2",
        logo_url=f"https://cdn.simpleicons.org/{provider}",
        credential_type="oauth2",
        scope="workspace",
        status="active",
        secret=token_data,
    )

    existing_asset = get_vault_asset_by_name(kind="connection", name=asset_name, workspace_id=workspace_id)
    if existing_asset is None:
        create_vault_asset(
            asset_payload,
            workspace_id=workspace_id,
            created_by_user_id=str(session["user"]["id"]),
        )
        message = f"{provider.title()} connected successfully."
    else:
        update_vault_asset(
            str(existing_asset["id"]),
            VaultAssetUpdate(
                name=asset_name,
                app=provider,
                subtitle="Connected via OAuth2",
                logo_url=f"https://cdn.simpleicons.org/{provider}",
                credential_type="oauth2",
                scope="workspace",
                status="active",
                workflows_count=int(existing_asset.get("workflows_count") or 0),
                people_with_access=int(existing_asset.get("people_with_access") or 0),
                masked=True,
                secret=token_data,
            ),
            workspace_id=workspace_id,
        )
        message = f"{provider.title()} connection refreshed successfully."

    return {"success": True, "provider": provider, "message": message}


@router.post(f"{settings.api_prefix}/oauth2/refresh")
async def oauth2_refresh_token(request_body: dict[str, Any] | None = None, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin")
    from ..oauth2 import refresh_token

    if request_body is None:
        request_body = {}
    provider = str(request_body.get("provider", ""))
    refresh_token_value = str(request_body.get("refresh_token", ""))
    client_id = str(request_body.get("client_id", ""))
    client_secret = str(request_body.get("client_secret", ""))

    if not provider or not refresh_token_value or not client_id or not client_secret:
        raise HTTPException(status_code=400, detail="provider, refresh_token, client_id, and client_secret are required.")

    token_data = await refresh_token(
        provider=provider,
        refresh_token_value=refresh_token_value,
        client_id=client_id,
        client_secret=client_secret,
    )
    return token_data
