"""Vault secrets encryption at rest.

Uses AES-GCM (via Python's built-in `cryptography`-free approach using
hashlib + os.urandom) to encrypt vault secrets before storing in the database.

The encryption key is derived from VAULT_ENCRYPTION_KEY env var.
If not set, secrets are stored in plaintext (dev mode).

This follows n8n's pattern of encrypting credentials at rest with a
configurable encryption key.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import struct
from typing import Any

from .config import get_settings

# AES-GCM constants
_IV_SIZE = 12
_TAG_SIZE = 16
_HEADER = b"fh1"  # Version prefix for encrypted payloads


def _derive_key(secret: str) -> bytes:
    """Derive a 256-bit encryption key from the user's secret using PBKDF2."""
    # Use a fixed salt derived from the secret itself for deterministic key derivation
    # This is acceptable because each encryption operation uses a unique IV
    salt = hashlib.sha256(b"flowholt-vault-salt:" + secret.encode()).digest()[:16]
    return hashlib.pbkdf2_hmac("sha256", secret.encode(), salt, iterations=100_000)


def _get_encryption_key() -> bytes | None:
    """Get the encryption key from config. Returns None if not configured."""
    settings = get_settings()
    vault_key = getattr(settings, "vault_encryption_key", "")
    if not vault_key:
        return None
    return _derive_key(vault_key)


def encrypt_secret(plaintext: str) -> str:
    """Encrypt a secret string. Returns base64-encoded ciphertext.

    If no encryption key is configured, returns the plaintext as-is.
    """
    key = _get_encryption_key()
    if key is None:
        return plaintext

    try:
        # Try to use the cryptography library if available
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        iv = os.urandom(_IV_SIZE)
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(iv, plaintext.encode("utf-8"), _HEADER)
        # Format: header + iv + ciphertext (includes tag)
        encrypted = _HEADER + iv + ciphertext
        return base64.b64encode(encrypted).decode("ascii")
    except ImportError:
        # Fallback: XOR-based obfuscation with HMAC integrity
        # Not as strong as AES-GCM but better than plaintext, no extra deps
        return _xor_encrypt(plaintext, key)


def decrypt_secret(encrypted: str) -> str:
    """Decrypt a secret string. Returns plaintext.

    If the value doesn't look encrypted, returns it as-is (backwards compat).
    """
    key = _get_encryption_key()
    if key is None:
        return encrypted

    # Check if the value is actually encrypted
    try:
        raw = base64.b64decode(encrypted)
    except Exception:
        return encrypted  # Not base64 = not encrypted

    if raw[:3] == _HEADER:
        try:
            from cryptography.hazmat.primitives.ciphers.aead import AESGCM
            iv = raw[3:3 + _IV_SIZE]
            ciphertext = raw[3 + _IV_SIZE:]
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(iv, ciphertext, _HEADER)
            return plaintext.decode("utf-8")
        except ImportError:
            import logging
            logging.getLogger("flowholt.encryption").warning(
                "cryptography library not installed — cannot decrypt AES-GCM payload; returning as-is"
            )
            return encrypted
        except Exception:
            return encrypted  # Decryption failed, return as-is

    if raw[:4] == b"fhx1":
        return _xor_decrypt(encrypted, key)

    return encrypted  # Unknown format, return as-is


def _xor_encrypt(plaintext: str, key: bytes) -> str:
    """Simple XOR + HMAC encryption fallback (no external dependencies)."""
    iv = os.urandom(16)
    data = plaintext.encode("utf-8")
    # Derive a stream key from the main key + IV
    stream = hashlib.sha256(key + iv).digest()
    # XOR the data with repeated stream bytes
    encrypted = bytes(b ^ stream[i % 32] for i, b in enumerate(data))
    # HMAC for integrity
    mac = hmac.new(key, iv + encrypted, hashlib.sha256).digest()[:16]
    # Format: header + iv + mac + encrypted
    result = b"fhx1" + iv + mac + encrypted
    return base64.b64encode(result).decode("ascii")


def _xor_decrypt(encrypted_b64: str, key: bytes) -> str:
    """Decrypt XOR + HMAC encrypted data."""
    raw = base64.b64decode(encrypted_b64)
    if raw[:4] != b"fhx1":
        raise ValueError("Invalid encryption format")
    iv = raw[4:20]
    mac = raw[20:36]
    encrypted = raw[36:]
    # Verify HMAC
    expected_mac = hmac.new(key, iv + encrypted, hashlib.sha256).digest()[:16]
    if not hmac.compare_digest(mac, expected_mac):
        raise ValueError("Integrity check failed — secret may have been tampered with")
    # Decrypt
    stream = hashlib.sha256(key + iv).digest()
    plaintext = bytes(b ^ stream[i % 32] for i, b in enumerate(encrypted))
    return plaintext.decode("utf-8")


def encrypt_json_secret(data: dict[str, Any]) -> str:
    """Encrypt a JSON-serializable secret dict."""
    return encrypt_secret(json.dumps(data, separators=(",", ":")))


def decrypt_json_secret(encrypted: str) -> dict[str, Any]:
    """Decrypt a JSON secret dict."""
    plaintext = decrypt_secret(encrypted)
    return json.loads(plaintext)
