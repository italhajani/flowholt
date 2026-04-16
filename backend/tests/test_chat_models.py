from __future__ import annotations

import unittest
from unittest.mock import patch

from backend.app import main


class ChatModelSelectionTests(unittest.TestCase):
    def test_default_chat_provider_prefers_xai_when_available(self) -> None:
        with patch.object(main.settings, "llm_provider", "auto"), \
             patch.object(main.settings, "xai_api_key", "xai-key"), \
             patch.object(main.settings, "groq_api_key", "groq-key"), \
             patch.object(main.settings, "gemini_api_key", ""), \
             patch.object(main.settings, "openai_api_key", ""), \
             patch.object(main.settings, "anthropic_api_key", ""), \
             patch.object(main.settings, "deepseek_api_key", ""), \
             patch.object(main.settings, "ollama_base_url", ""):
            self.assertEqual("xai", main._get_default_chat_provider())

    def test_provider_availability_requires_configured_secret(self) -> None:
        with patch.object(main.settings, "anthropic_api_key", ""):
            self.assertFalse(main._is_chat_provider_available("anthropic"))

        with patch.object(main.settings, "anthropic_api_key", "anthropic-key"):
            self.assertTrue(main._is_chat_provider_available("anthropic"))

    def test_provider_availability_uses_workspace_vault_credentials(self) -> None:
        vault_assets = [
            {
                "id": "va-openai",
                "kind": "credential",
                "name": "OpenAI key",
                "app": "openai",
                "status": "active",
                "secret": {"api_key": "vault-openai-key", "model": "gpt-4.1-mini"},
            }
        ]

        with patch.object(main.settings, "openai_api_key", ""), \
             patch.object(main, "list_vault_assets", return_value=vault_assets):
            self.assertTrue(main._is_chat_provider_available("openai", "ws-123"))
            self.assertEqual("gpt-4.1-mini", main._get_chat_provider_display_model("openai", "ws-123"))

    def test_default_chat_provider_prefers_workspace_vault_xai(self) -> None:
        vault_assets = [
            {
                "id": "va-xai",
                "kind": "credential",
                "name": "Grok free tier",
                "app": "xai",
                "status": "active",
                "secret": {"api_key": "vault-xai-key", "model": "grok-3"},
            }
        ]

        with patch.object(main.settings, "llm_provider", "auto"), \
             patch.object(main.settings, "xai_api_key", ""), \
             patch.object(main.settings, "groq_api_key", ""), \
             patch.object(main.settings, "gemini_api_key", ""), \
             patch.object(main.settings, "openai_api_key", ""), \
             patch.object(main.settings, "anthropic_api_key", ""), \
             patch.object(main.settings, "deepseek_api_key", ""), \
             patch.object(main.settings, "ollama_base_url", ""), \
             patch.object(main, "list_vault_assets", return_value=vault_assets):
            self.assertEqual("xai", main._get_default_chat_provider("ws-123"))


if __name__ == "__main__":
    unittest.main()