from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Any

import httpx

from .config import get_settings


_JWKS_CACHE: dict[str, tuple[float, str]] = {}


def create_session_token(*, user_id: str, workspace_id: str, role: str) -> tuple[str, int]:
    settings = get_settings()
    issued_at = int(time.time())
    expires_at = issued_at + (settings.session_ttl_hours * 3600)
    payload = {
        "sub": user_id,
        "workspace_id": workspace_id,
        "role": role,
        "iat": issued_at,
        "exp": expires_at,
        "iss": "flowholt-backend",
        "aud": "flowholt-app",
    }
    token = _encode_signed_payload(payload, settings.session_secret)
    return token, expires_at


def verify_session_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    payload = _decode_signed_payload(token, settings.session_secret)
    now = int(time.time())
    if int(payload.get("exp", 0)) <= now:
        raise ValueError("Session token expired")
    if payload.get("iss") != "flowholt-backend":
        raise ValueError("Invalid session token issuer")
    if payload.get("aud") != "flowholt-app":
        raise ValueError("Invalid session token audience")
    return payload


def verify_supabase_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    if settings.supabase_jwt_secret:
        header, payload = _decode_hs256_jwt(token, settings.supabase_jwt_secret)
        if header.get("alg") != "HS256":
            raise ValueError("Unsupported Supabase token algorithm")
    elif settings.supabase_url:
        header, payload = _decode_jwks_token(token, settings.supabase_url, settings.supabase_jwks_cache_ttl_seconds)
    else:
        raise ValueError("Supabase JWT verification is not configured")

    now = int(time.time())
    if int(payload.get("exp", 0)) <= now:
        raise ValueError("Supabase token expired")

    expected_issuer = settings.supabase_url.rstrip("/") + "/auth/v1" if settings.supabase_url else ""
    if expected_issuer and payload.get("iss") != expected_issuer:
        raise ValueError("Invalid Supabase token issuer")

    audience = payload.get("aud")
    expected_audience = settings.supabase_expected_audience
    if expected_audience:
        if isinstance(audience, list):
            if expected_audience not in audience:
                raise ValueError("Invalid Supabase token audience")
        elif audience != expected_audience:
            raise ValueError("Invalid Supabase token audience")

    if not payload.get("sub"):
        raise ValueError("Supabase token missing subject")
    return payload


def get_supabase_auth_mode() -> str:
    settings = get_settings()
    if settings.supabase_jwt_secret:
        return "jwt_secret"
    if settings.supabase_url:
        return "jwks"
    return "none"


def _encode_signed_payload(payload: dict[str, Any], secret: str) -> str:
    encoded_payload = base64.urlsafe_b64encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    ).decode("utf-8").rstrip("=")
    signature = hmac.new(
        secret.encode("utf-8"),
        encoded_payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
    return f"{encoded_payload}.{encoded_signature}"


def _decode_signed_payload(token: str, secret: str) -> dict[str, Any]:
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
    except ValueError as exc:
        raise ValueError("Malformed session token") from exc

    expected_signature = hmac.new(
        secret.encode("utf-8"),
        encoded_payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    actual_signature = _urlsafe_b64decode(encoded_signature)

    if not hmac.compare_digest(actual_signature, expected_signature):
        raise ValueError("Invalid session token signature")

    payload_bytes = _urlsafe_b64decode(encoded_payload)
    try:
        payload = json.loads(payload_bytes.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("Malformed session payload") from exc

    if not isinstance(payload, dict):
        raise ValueError("Malformed session payload")
    return payload


def _decode_hs256_jwt(token: str, secret: str) -> tuple[dict[str, Any], dict[str, Any]]:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
    except ValueError as exc:
        raise ValueError("Malformed Supabase token") from exc

    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    expected_signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    actual_signature = _urlsafe_b64decode(encoded_signature)
    if not hmac.compare_digest(actual_signature, expected_signature):
        raise ValueError("Invalid Supabase token signature")

    try:
        header = json.loads(_urlsafe_b64decode(encoded_header).decode("utf-8"))
        payload = json.loads(_urlsafe_b64decode(encoded_payload).decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("Malformed Supabase token payload") from exc

    if not isinstance(header, dict) or not isinstance(payload, dict):
        raise ValueError("Malformed Supabase token payload")
    return header, payload


def _decode_jwks_token(token: str, supabase_url: str, cache_ttl_seconds: int) -> tuple[dict[str, Any], dict[str, Any]]:
    try:
        import jwt
        from jwt import PyJWKClient
    except ImportError as exc:
        raise ValueError(
            "JWKS verification requires PyJWT with crypto support. Install backend requirements before using Supabase JWKS mode."
        ) from exc

    jwks_url = supabase_url.rstrip("/") + "/auth/v1/.well-known/jwks.json"
    cache_key = jwks_url
    now = time.time()

    cached = _JWKS_CACHE.get(cache_key)
    if cached and cached[0] > now:
        jwks_data = cached[1]
    else:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(jwks_url)
            response.raise_for_status()
            jwks_data = response.text
        _JWKS_CACHE[cache_key] = (now + cache_ttl_seconds, jwks_data)

    jwk_client = PyJWKClient(jwks_url)
    jwk_client.fetch_data = lambda: json.loads(jwks_data)  # type: ignore[method-assign]
    signing_key = jwk_client.get_signing_key_from_jwt(token)
    header = jwt.get_unverified_header(token)
    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=[header.get("alg", "RS256")],
        options={"verify_aud": False},
    )

    if not isinstance(header, dict) or not isinstance(payload, dict):
        raise ValueError("Malformed Supabase JWKS token payload")
    return header, payload


def _urlsafe_b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)
