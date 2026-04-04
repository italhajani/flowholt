from __future__ import annotations

import hashlib
import hmac
import time


def sign_webhook_payload(*, secret: str, timestamp: str, body: bytes) -> str:
    signed_payload = timestamp.encode("utf-8") + b"." + body
    digest = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def verify_webhook_signature(
    *,
    secret: str,
    timestamp: str,
    signature: str,
    body: bytes,
    tolerance_seconds: int,
) -> bool:
    if not timestamp or not signature:
        return False

    try:
        signed_at = int(timestamp)
    except ValueError:
        return False

    now = int(time.time())
    if abs(now - signed_at) > tolerance_seconds:
        return False

    expected = sign_webhook_payload(secret=secret, timestamp=timestamp, body=body)
    return hmac.compare_digest(signature, expected)
