import { getToolRegistryItem, toolRegistry } from "./tool-registry.ts";

export type AgentToolAccessMode = "workspace_default" | "all" | "selected" | "none";

const VALID_ACCESS_MODES = new Set<AgentToolAccessMode>([
  "workspace_default",
  "all",
  "selected",
  "none",
]);

export function normalizeAgentToolAccessConfig(config: Record<string, unknown> = {}) {
  const requestedMode =
    typeof config.tool_access_mode === "string" ? config.tool_access_mode.trim().toLowerCase() : "";
  const toolAccessMode = VALID_ACCESS_MODES.has(requestedMode as AgentToolAccessMode)
    ? (requestedMode as AgentToolAccessMode)
    : "workspace_default";

  const requestedToolKeys = Array.isArray(config.allowed_tool_keys)
    ? config.allowed_tool_keys
    : typeof config.allowed_tool_keys === "string"
      ? config.allowed_tool_keys.split(",")
      : [];

  const allowedToolKeys = [
    ...new Set(
      requestedToolKeys
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
        .filter((value) => toolRegistry.some((item) => item.key === value)),
    ),
  ];

  return {
    tool_access_mode: toolAccessMode,
    allowed_tool_keys: toolAccessMode === "selected" ? allowedToolKeys : [],
  };
}

export function canAgentUseToolKey(config: Record<string, unknown> = {}, toolKey: string) {
  const normalized = normalizeAgentToolAccessConfig(config);
  const resolvedToolKey = getToolRegistryItem(toolKey).key;

  switch (normalized.tool_access_mode) {
    case "none":
      return false;
    case "all":
    case "workspace_default":
      return true;
    case "selected":
      return normalized.allowed_tool_keys.includes(resolvedToolKey);
    default:
      return true;
  }
}

export function summarizeAgentToolAccess(config: Record<string, unknown> = {}) {
  const normalized = normalizeAgentToolAccessConfig(config);

  if (normalized.tool_access_mode === "none") {
    return "No tools";
  }

  if (normalized.tool_access_mode === "all") {
    return "All tools";
  }

  if (normalized.tool_access_mode === "workspace_default") {
    return "Workspace default";
  }

  if (!normalized.allowed_tool_keys.length) {
    return "Selected tools (none picked yet)";
  }

  return `Selected tools (${normalized.allowed_tool_keys.length})`;
}
