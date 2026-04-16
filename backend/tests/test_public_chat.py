from __future__ import annotations

import unittest

from backend.app import main


class PublicChatHelpersTests(unittest.TestCase):
    def test_normalize_chat_allowed_origins_supports_wildcard_and_csv(self) -> None:
        self.assertEqual(["*"], main.normalize_chat_allowed_origins("*"))
        self.assertEqual(
            ["https://app.example.com", "https://www.example.com"],
            main.normalize_chat_allowed_origins("https://app.example.com, https://www.example.com/"),
        )

    def test_is_chat_origin_allowed_handles_missing_and_exact_matches(self) -> None:
        self.assertTrue(main.is_chat_origin_allowed(None, "https://app.example.com"))
        self.assertTrue(main.is_chat_origin_allowed("https://app.example.com", "https://app.example.com"))
        self.assertFalse(main.is_chat_origin_allowed("https://evil.example.com", "https://app.example.com"))

    def test_build_public_chat_cors_headers_echoes_allowed_origin(self) -> None:
        headers = main.build_public_chat_cors_headers(
            origin="https://app.example.com",
            allowed_origins_value="https://app.example.com,https://www.example.com",
            requested_headers="Authorization, Content-Type",
        )

        self.assertEqual("https://app.example.com", headers["Access-Control-Allow-Origin"])
        self.assertEqual("GET, POST, OPTIONS", headers["Access-Control-Allow-Methods"])
        self.assertEqual("Authorization, Content-Type", headers["Access-Control-Allow-Headers"])

    def test_build_public_chat_urls_includes_stream_and_widget_metadata(self) -> None:
        urls = main.build_public_chat_urls(
            base_url="https://flowholt.example.com",
            workspace_id="ws-123",
            workflow_id="wf-456",
        )

        self.assertEqual(
            "https://flowholt.example.com/api/chat/ws-123/wf-456",
            urls["public_chat_url"],
        )
        self.assertEqual(
            "https://flowholt.example.com/api/chat/ws-123/wf-456/stream",
            urls["public_chat_stream_url"],
        )
        self.assertEqual(
            "https://flowholt.example.com/chat/ws-123/wf-456",
            urls["hosted_chat_url"],
        )
        self.assertEqual(
            "https://flowholt.example.com/flowholt-chat-widget.js",
            urls["widget_script_url"],
        )
        self.assertIn("data-workspace-id=\"ws-123\"", urls["widget_embed_html"])
        self.assertIn("data-workflow-id=\"wf-456\"", urls["widget_embed_html"])

    def test_iter_chat_response_stream_chunks_preserves_order(self) -> None:
        chunks = main.iter_chat_response_stream_chunks("Hello there from FlowHolt streaming")
        self.assertGreaterEqual(len(chunks), 2)
        self.assertEqual("Hello there from FlowHolt streaming", "".join(chunks).strip())


if __name__ == "__main__":
    unittest.main()