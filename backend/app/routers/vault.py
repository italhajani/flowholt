"""
Vault router — extracted from main.py.
"""
from __future__ import annotations

from .._router_imports import *  # noqa: F401,F403

router = APIRouter()

@router.post(f"{settings.api_prefix}/vault/assets/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_vault_assets(
    payload: BulkDeleteRequest,
    session: dict[str, Any] = Depends(get_session_context),
) -> BulkDeleteResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    deleted = 0
    errors: list[str] = []
    for asset_id in payload.ids:
        try:
            delete_vault_asset(asset_id, workspace_id=workspace_id)
            deleted += 1
        except Exception as exc:
            errors.append(f"{asset_id}: {exc}")
    if deleted:
        record_audit_event(
            session=session,
            workspace_id=workspace_id,
            action="vault.bulk_deleted",
            target_type="vault_asset",
            target_id="bulk",
            status="success",
            details={"count": deleted, "ids": payload.ids[:20]},
        )
    return BulkDeleteResponse(deleted=deleted, errors=errors)



@router.get(f"{settings.api_prefix}/vault", response_model=VaultOverviewResponse)
def get_vault_overview(session: dict[str, Any] = Depends(get_session_context)) -> VaultOverviewResponse:
    workspace_id = str(session["workspace"]["id"])
    grouped = list_vault_assets_grouped(workspace_id=workspace_id)
    connections = [VaultConnectionSummary.model_validate(item) for item in grouped.get("connection", [])]
    credentials = [VaultCredentialSummary.model_validate(item) for item in grouped.get("credential", [])]
    variables = [VaultVariableSummary.model_validate(item) for item in grouped.get("variable", [])]
    return VaultOverviewResponse(
        connections=connections,
        credentials=credentials,
        variables=variables,
    )



@router.get(f"{settings.api_prefix}/vault/connections", response_model=list[VaultConnectionSummary])
def get_vault_connections(session: dict[str, Any] = Depends(get_session_context)) -> list[VaultConnectionSummary]:
    return [
        VaultConnectionSummary.model_validate(item)
        for item in list_vault_assets(kind="connection", workspace_id=str(session["workspace"]["id"]))
    ]



@router.get(f"{settings.api_prefix}/vault/credentials", response_model=list[VaultCredentialSummary])
def get_vault_credentials(session: dict[str, Any] = Depends(get_session_context)) -> list[VaultCredentialSummary]:
    return [
        VaultCredentialSummary.model_validate(item)
        for item in list_vault_assets(kind="credential", workspace_id=str(session["workspace"]["id"]))
    ]



@router.get(f"{settings.api_prefix}/vault/variables", response_model=list[VaultVariableSummary])
def get_vault_variables(session: dict[str, Any] = Depends(get_session_context)) -> list[VaultVariableSummary]:
    return [
        VaultVariableSummary.model_validate(item)
        for item in list_vault_assets(kind="variable", workspace_id=str(session["workspace"]["id"]))
    ]



@router.post(f"{settings.api_prefix}/vault/assets", status_code=201)
def post_vault_asset(
    payload: VaultAssetCreate,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, object]:
    require_workspace_role(session, "owner", "admin")
    asset = create_vault_asset(
        payload,
        workspace_id=str(session["workspace"]["id"]),
        created_by_user_id=str(session["user"]["id"]),
    )
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="vault.asset.created",
        target_type="vault_asset",
        target_id=str(asset["id"]),
        status="success",
        details={"kind": payload.kind, "name": payload.name},
    )
    return asset



@router.get(f"{settings.api_prefix}/vault/assets/{{asset_id}}")
def get_vault_asset_route(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, object]:
    require_workspace_role(session, "owner", "admin")
    asset = get_vault_asset(asset_id, workspace_id=str(session["workspace"]["id"]))
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    return asset



@router.put(f"{settings.api_prefix}/vault/assets/{{asset_id}}")
def put_vault_asset(
    asset_id: str,
    payload: VaultAssetUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, object]:
    require_workspace_role(session, "owner", "admin")
    asset = update_vault_asset(asset_id, payload, workspace_id=str(session["workspace"]["id"]))
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="vault.asset.updated",
        target_type="vault_asset",
        target_id=asset_id,
        status="success",
        details={"name": payload.name, "scope": payload.scope, "status": payload.status},
    )
    return asset



@router.delete(f"{settings.api_prefix}/vault/assets/{{asset_id}}")
def delete_vault_asset_route(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> Response:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    asset = get_vault_asset(asset_id, workspace_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    delete_vault_asset(asset_id, workspace_id=workspace_id)
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="vault.asset.deleted",
        target_type="vault_asset",
        target_id=asset_id,
        status="success",
        details={"kind": str(asset.get("kind")), "name": str(asset.get("name"))},
    )
    return Response(status_code=204)



@router.get(f"{settings.api_prefix}/vault/assets/{{asset_id}}/access", response_model=VaultAssetAccessResponse)
def get_vault_asset_access_route(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> VaultAssetAccessResponse:
    workspace_id = str(session["workspace"]["id"])
    asset = get_vault_asset_access(asset_id, workspace_id=workspace_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    return VaultAssetAccessResponse(
        asset_id=str(asset["id"]),
        workspace_id=workspace_id,
        name=str(asset["name"]),
        kind=str(asset["kind"]),
        visibility=str(asset.get("visibility") or "workspace"),
        owner_user_id=str(asset.get("created_by_user_id") or "") or None,
        allowed_roles=[str(item) for item in asset.get("allowed_roles") or []],
        allowed_user_ids=[str(item) for item in asset.get("allowed_user_ids") or []],
        can_edit=can_edit_vault_asset(asset, session),
        can_test=can_test_vault_asset(asset, session),
    )



@router.put(f"{settings.api_prefix}/vault/assets/{{asset_id}}/access", response_model=VaultAssetAccessResponse)
def put_vault_asset_access_route(
    asset_id: str,
    payload: VaultAssetAccessUpdate,
    session: dict[str, Any] = Depends(get_session_context),
) -> VaultAssetAccessResponse:
    require_workspace_role(session, "owner", "admin")
    workspace_id = str(session["workspace"]["id"])
    asset = update_vault_asset_access(
        asset_id,
        workspace_id=workspace_id,
        visibility=payload.visibility,
        allowed_roles=[str(item) for item in payload.allowed_roles],
        allowed_user_ids=[str(item) for item in payload.allowed_user_ids],
    )
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    record_audit_event(
        session=session,
        workspace_id=workspace_id,
        action="vault.asset.access.updated",
        target_type="vault_asset",
        target_id=asset_id,
        status="success",
        details={
            "visibility": payload.visibility,
            "allowed_roles": [str(item) for item in payload.allowed_roles],
            "allowed_user_ids": [str(item) for item in payload.allowed_user_ids],
        },
    )
    return VaultAssetAccessResponse(
        asset_id=str(asset["id"]),
        workspace_id=workspace_id,
        name=str(asset["name"]),
        kind=str(asset["kind"]),
        visibility=str(asset.get("visibility") or "workspace"),
        owner_user_id=str(asset.get("created_by_user_id") or "") or None,
        allowed_roles=[str(item) for item in asset.get("allowed_roles") or []],
        allowed_user_ids=[str(item) for item in asset.get("allowed_user_ids") or []],
        can_edit=can_edit_vault_asset(asset, session),
        can_test=can_test_vault_asset(asset, session),
    )



def _build_runtime_verification_check(code: str, label: str, passed: bool, message: str) -> dict[str, Any]:
    return {
        "code": code,
        "label": label,
        "passed": passed,
        "severity": "info" if passed else "error",
        "message": message,
    }



def _response_excerpt(response: httpx.Response) -> str:
    text = response.text.strip()
    if not text:
        return ""
    return " ".join(text.split())[:180]



def _runtime_request(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    params: dict[str, str] | None = None,
) -> tuple[bool, str, httpx.Response | None]:
    try:
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            response = client.request(method, url, headers=headers, params=params)
    except httpx.HTTPError as exc:
        return False, f"Request failed: {exc}", None

    if 200 <= response.status_code < 300:
        return True, f"HTTP {response.status_code}", response

    excerpt = _response_excerpt(response)
    message = f"HTTP {response.status_code}"
    if excerpt:
        message = f"{message} - {excerpt}"
    return False, message, response



def _missing_runtime_secret_result() -> dict[str, Any]:
    return {
        "attempted": True,
        "verified": False,
        "checks": [
            _build_runtime_verification_check(
                "runtime_secret",
                "Live provider check",
                False,
                "Missing secret required for live verification.",
            )
        ],
    }



def _verify_connection_runtime(asset: dict[str, Any]) -> dict[str, Any]:
    secret = dict(asset.get("secret") or {})
    provider = str(asset.get("app") or asset.get("name") or "").strip().lower()
    access_token = str(secret.get("access_token") or secret.get("token") or "").strip()
    if provider not in {"github", "slack", "notion", "google", "microsoft"}:
        return {"attempted": False, "verified": True, "checks": []}
    if not access_token:
        return _missing_runtime_secret_result()

    if provider == "github":
        ok, message, response = _runtime_request(
            "GET",
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )
        if ok and response is not None:
            login = str((response.json() or {}).get("login") or "authenticated user")
            message = f"GitHub token accepted for {login}."
    elif provider == "slack":
        ok, message, response = _runtime_request(
            "POST",
            "https://slack.com/api/auth.test",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if ok and response is not None:
            payload = response.json() or {}
            ok = bool(payload.get("ok"))
            message = (
                f"Slack token accepted for workspace {payload.get('team') or 'unknown'}."
                if ok
                else f"Slack rejected the token: {payload.get('error') or 'unknown_error'}."
            )
    elif provider == "notion":
        ok, message, response = _runtime_request(
            "GET",
            "https://api.notion.com/v1/users/me",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Notion-Version": "2022-06-28",
            },
        )
        if ok:
            message = "Notion token accepted."
    elif provider == "google":
        ok, message, response = _runtime_request(
            "GET",
            "https://www.googleapis.com/oauth2/v3/tokeninfo",
            params={"access_token": access_token},
        )
        if ok and response is not None:
            audience = str((response.json() or {}).get("aud") or "verified audience")
            message = f"Google token is valid for audience {audience}."
    else:
        ok, message, response = _runtime_request(
            "GET",
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if ok and response is not None:
            user_principal_name = str((response.json() or {}).get("userPrincipalName") or "authenticated user")
            message = f"Microsoft token accepted for {user_principal_name}."

    return {
        "attempted": True,
        "verified": ok,
        "checks": [
            _build_runtime_verification_check(
                "runtime_connection",
                "Live provider check",
                ok,
                message,
            )
        ],
    }



def _verify_credential_runtime(asset: dict[str, Any]) -> dict[str, Any]:
    secret = dict(asset.get("secret") or {})
    provider = str(asset.get("app") or asset.get("name") or "").strip().lower()
    if provider not in {
        "anthropic",
        "deepseek",
        "gemini",
        "google",
        "googleai",
        "groq",
        "ollama",
        "openai",
        "openrouter",
        "xai",
    }:
        return {"attempted": False, "verified": True, "checks": []}

    api_key = str(secret.get("api_key") or secret.get("token") or secret.get("value") or "").strip()
    base_url = str(secret.get("base_url") or "").strip().rstrip("/")

    if provider in {"gemini", "google", "googleai"}:
        if not api_key:
            return _missing_runtime_secret_result()
        ok, message, response = _runtime_request(
            "GET",
            "https://generativelanguage.googleapis.com/v1beta/models",
            params={"key": api_key},
        )
        if ok and response is not None:
            models = response.json().get("models") or []
            message = f"Gemini API key accepted. Models visible: {len(models)}."
    elif provider == "anthropic":
        if not api_key:
            return _missing_runtime_secret_result()
        ok, message, response = _runtime_request(
            "GET",
            "https://api.anthropic.com/v1/models",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
        )
        if ok and response is not None:
            models = response.json().get("data") or []
            message = f"Anthropic API key accepted. Models visible: {len(models)}."
    elif provider == "ollama":
        endpoint = f"{base_url or 'http://127.0.0.1:11434'}/api/tags"
        ok, message, response = _runtime_request("GET", endpoint)
        if ok and response is not None:
            models = response.json().get("models") or []
            message = f"Ollama endpoint reachable. Models visible: {len(models)}."
    else:
        if not api_key:
            return _missing_runtime_secret_result()
        compatible_defaults = {
            "openai": "https://api.openai.com/v1",
            "groq": "https://api.groq.com/openai/v1",
            "openrouter": "https://openrouter.ai/api/v1",
            "deepseek": "https://api.deepseek.com/v1",
            "xai": "https://api.x.ai/v1",
        }
        endpoint = f"{base_url or compatible_defaults.get(provider, 'https://api.openai.com/v1')}/models"
        ok, message, response = _runtime_request(
            "GET",
            endpoint,
            headers={"Authorization": f"Bearer {api_key}"},
        )
        if ok and response is not None:
            payload = response.json() or {}
            models = payload.get("data") or payload.get("models") or []
            message = f"{provider.title()} credential accepted. Models visible: {len(models)}."

    return {
        "attempted": True,
        "verified": ok,
        "checks": [
            _build_runtime_verification_check(
                "runtime_credential",
                "Live provider check",
                ok,
                message,
            )
        ],
    }



def _verify_vault_asset_runtime(asset: dict[str, Any]) -> dict[str, Any]:
    kind = str(asset.get("kind") or "")
    if kind == "connection":
        return _verify_connection_runtime(asset)
    if kind == "credential":
        return _verify_credential_runtime(asset)
    return {"attempted": False, "verified": True, "checks": []}



@router.get(f"{settings.api_prefix}/vault/assets/{{asset_id}}/health", response_model=VaultAssetHealthResponse)
def get_vault_asset_health(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> VaultAssetHealthResponse:
    workspace_id = str(session["workspace"]["id"])
    asset = get_vault_asset(asset_id, workspace_id=workspace_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    return VaultAssetHealthResponse.model_validate(build_vault_asset_health(asset, workspace_id=workspace_id))



@router.post(f"{settings.api_prefix}/vault/assets/{{asset_id}}/verify", response_model=VaultAssetVerifyResponse)
def post_vault_asset_verify(
    asset_id: str,
    session: dict[str, Any] = Depends(get_session_context),
) -> VaultAssetVerifyResponse:
    workspace_id = str(session["workspace"]["id"])
    asset = get_vault_asset(asset_id, workspace_id=workspace_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Vault asset not found")
    health = build_vault_asset_health(asset, workspace_id=workspace_id)
    runtime_result = _verify_vault_asset_runtime(asset) if health["healthy"] else {"attempted": False, "verified": False, "checks": []}
    checks = [*health["checks"], *runtime_result["checks"]]
    verified = bool(health["healthy"]) and bool(runtime_result["verified"] if runtime_result["attempted"] else True)
    mode = "runtime" if runtime_result["attempted"] else "static"
    next_steps: list[str] = []
    if not health["healthy"]:
        next_steps.append("Open this asset in Vault and fill the missing required fields.")
    elif mode == "runtime" and not verified:
        if str(asset.get("kind")) == "connection":
            next_steps.append("Reconnect this provider or refresh its token, then run verification again.")
        elif str(asset.get("kind")) == "credential":
            next_steps.append("Check the API key or base URL, then rerun verification.")
    if str(asset.get("kind")) == "connection":
        next_steps.append("Use this verified connection in studio node configuration.")
    elif str(asset.get("kind")) == "credential":
        next_steps.append("Bind this credential to the matching provider node in studio.")
    else:
        next_steps.append("Reference this variable from a node config or shared runtime binding.")
    if mode == "static":
        next_steps.append("This asset currently supports structural validation only, not a live provider handshake.")

    sample_request = {}
    if str(asset.get("app") or "").lower() == "slack":
        sample_request = {"channel": dict(asset.get("secret") or {}).get("channel"), "message": "FlowHolt verification ping"}
    elif str(asset.get("app") or "").lower() in {"openai", "anthropic"}:
        sample_request = {"model": dict(asset.get("secret") or {}).get("model"), "prompt": "Return a short health check response."}
    elif str(asset.get("kind")) == "variable":
        sample_request = {"value_preview": dict(asset.get("secret") or {}).get("value")}

    return VaultAssetVerifyResponse(
        asset_id=str(asset["id"]),
        workspace_id=workspace_id,
        verified=verified,
        mode=mode,
        checks=checks,
        sample_request=sample_request,
        next_steps=next_steps,
    )



