from __future__ import annotations

import unittest

from backend.app.studio_nodes import build_node_draft, build_node_editor_response


class StudioNodeBindingNormalizationTests(unittest.TestCase):
    def test_http_request_legacy_credential_id_resolves_to_credential_name(self) -> None:
        credential = {
            "id": "cred-http-1",
            "kind": "credential",
            "name": "HTTP API Key",
            "app": "custom",
            "secret": {"api_key": "secret-http-key"},
        }

        draft = build_node_draft(
            "http_request",
            config={"credential": "cred-http-1", "method": "GET", "url": "https://example.com"},
            credentials=[credential],
        )

        step_config = dict(draft["step"].get("config") or {})
        self.assertEqual("HTTP API Key", step_config.get("credential_name"))
        self.assertEqual("secret-http-key", step_config.get("api_key"))

    def test_email_trigger_legacy_email_credential_resolves_to_credential_name(self) -> None:
        credential = {
            "id": "cred-email-1",
            "kind": "credential",
            "name": "Mailbox Credential",
            "app": "email",
            "secret": {"username": "agent@example.com", "password": "secret"},
        }

        draft = build_node_draft(
            "trigger",
            config={"source": "email", "email_credential": "cred-email-1"},
            credentials=[credential],
        )

        step_config = dict(draft["step"].get("config") or {})
        self.assertEqual("Mailbox Credential", step_config.get("credential_name"))
        self.assertEqual("agent@example.com", step_config.get("username"))

    def test_editor_shows_canonical_credential_value_for_legacy_binding(self) -> None:
        credential = {
            "id": "cred-http-1",
            "kind": "credential",
            "name": "HTTP API Key",
            "app": "custom",
            "secret": {"api_key": "secret-http-key"},
        }

        editor = build_node_editor_response(
            "http_request",
            config={"credential": "cred-http-1", "method": "GET", "url": "https://example.com"},
            credentials=[credential],
        )

        request_fields = next(section for section in editor["sections"] if section["id"] == "request")["fields"]
        credential_field = next(field for field in request_fields if field["key"] == "credential")
        self.assertEqual("HTTP API Key", credential_field.get("value"))


if __name__ == "__main__":
    unittest.main()