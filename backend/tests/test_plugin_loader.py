from __future__ import annotations

import unittest

from backend.app import plugin_loader


class PluginLoaderTests(unittest.TestCase):
    def test_integrations_import_relative_to_module_package(self) -> None:
        module = plugin_loader.importlib.import_module(
            ".integrations.github",
            package=plugin_loader.__package__,
        )

        self.assertEqual("github", module.MANIFEST["key"])


if __name__ == "__main__":
    unittest.main()