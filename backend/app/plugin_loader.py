"""Integration plugin system for FlowHolt.

Inspired by Activepieces' "pieces" architecture — each integration is a
self-contained Python module with a manifest and action handlers.

Plugin structure:
    integrations/
        github/
            __init__.py      (exports MANIFEST and action functions)
        google_sheets/
            __init__.py
        discord/
            __init__.py

Each plugin module must export:
    MANIFEST: dict — Integration metadata (key, label, category, auth_kind, etc.)
    ACTIONS: dict[str, Callable] — Maps operation_key → handler function

Plugins are discovered at startup and merged into the existing integration registry.
"""

from __future__ import annotations

import importlib
import logging
from pathlib import Path
from typing import Any, Callable

logger = logging.getLogger("flowholt.plugins")


PluginAction = Callable[[dict[str, Any], dict[str, Any], dict[str, Any]], dict[str, Any] | None]


class IntegrationPlugin:
    """Represents a loaded integration plugin."""

    def __init__(
        self,
        *,
        key: str,
        label: str,
        category: str,
        auth_kind: str,
        node_types: list[str],
        description: str,
        operations: list[dict[str, Any]],
        actions: dict[str, PluginAction],
    ) -> None:
        self.key = key
        self.label = label
        self.category = category
        self.auth_kind = auth_kind
        self.node_types = node_types
        self.description = description
        self.operations = operations
        self.actions = actions

    def to_registry_entry(self) -> dict[str, Any]:
        """Convert to the format used by INTEGRATION_APPS in integration_registry.py."""
        return {
            "key": self.key,
            "label": self.label,
            "category": self.category,
            "auth_kind": self.auth_kind,
            "node_types": self.node_types,
            "description": self.description,
            "operations": self.operations,
        }

    def execute(
        self,
        operation_key: str,
        config: dict[str, Any],
        payload: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any] | None:
        """Execute a plugin action by operation key."""
        handler = self.actions.get(operation_key)
        if handler is None:
            return None
        return handler(config, payload, context)


class PluginRegistry:
    """Registry for dynamically loaded integration plugins."""

    def __init__(self) -> None:
        self._plugins: dict[str, IntegrationPlugin] = {}

    def register(self, plugin: IntegrationPlugin) -> None:
        self._plugins[plugin.key] = plugin
        logger.info("Registered plugin: %s (%s)", plugin.key, plugin.label)

    def get(self, key: str) -> IntegrationPlugin | None:
        return self._plugins.get(key)

    def list_all(self) -> list[IntegrationPlugin]:
        return list(self._plugins.values())

    @property
    def keys(self) -> list[str]:
        return list(self._plugins.keys())

    def execute(
        self,
        app_key: str,
        operation_key: str,
        config: dict[str, Any],
        payload: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any] | None:
        """Execute a plugin action. Returns None if plugin/operation not found."""
        plugin = self._plugins.get(app_key)
        if plugin is None:
            return None
        return plugin.execute(operation_key, config, payload, context)


_registry: PluginRegistry | None = None


def get_plugin_registry() -> PluginRegistry:
    global _registry
    if _registry is None:
        _registry = PluginRegistry()
        _discover_and_load_plugins(_registry)
    return _registry


def _discover_and_load_plugins(registry: PluginRegistry) -> None:
    """Discover and load all plugin modules from the integrations directory."""
    integrations_dir = Path(__file__).parent / "integrations"
    if not integrations_dir.is_dir():
        logger.info("No integrations directory found at %s — skipping plugin discovery", integrations_dir)
        return

    for child in sorted(integrations_dir.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith("_"):
            continue
        init_file = child / "__init__.py"
        if not init_file.exists():
            continue

        try:
            module = importlib.import_module(f".integrations.{child.name}", package=__package__)
            manifest = getattr(module, "MANIFEST", None)
            actions = getattr(module, "ACTIONS", None)

            if manifest is None:
                logger.warning("Plugin %s missing MANIFEST, skipping", child.name)
                continue

            plugin = IntegrationPlugin(
                key=manifest["key"],
                label=manifest["label"],
                category=manifest.get("category", "Other"),
                auth_kind=manifest.get("auth_kind", "none"),
                node_types=manifest.get("node_types", []),
                description=manifest.get("description", ""),
                operations=manifest.get("operations", []),
                actions=actions or {},
            )
            registry.register(plugin)
        except Exception:  # noqa: BLE001
            logger.exception("Failed to load plugin from %s", child.name)

    logger.info("Plugin discovery complete: %d plugins loaded", len(registry.keys))


def merge_plugins_into_registry() -> None:
    """Merge loaded plugins into the existing integration_registry.INTEGRATION_APPS."""
    from .integration_registry import INTEGRATION_APPS, APP_REGISTRY

    plugin_reg = get_plugin_registry()
    existing_keys = {app["key"] for app in INTEGRATION_APPS}

    for plugin in plugin_reg.list_all():
        if plugin.key in existing_keys:
            continue
        entry = plugin.to_registry_entry()
        INTEGRATION_APPS.append(entry)
        APP_REGISTRY[plugin.key] = entry
        logger.info("Merged plugin %s into integration registry", plugin.key)
