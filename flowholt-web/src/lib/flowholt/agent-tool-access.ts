import { getToolRegistryItem, toolRegistry, type ToolCapabilityKind } from "./tool-registry.ts";

export type AgentToolAccessMode = "workspace_default" | "all" | "selected" | "none";
export type AgentToolCallStrategy = "workspace_default" | "single" | "read_then_write" | "fan_out";

export type AgentToolOrchestrationCandidate = {
  targetId: string;
  targetLabel: string;
  nodeType: string;
  toolKey?: string;
  capability?: ToolCapabilityKind | string;
};

export type AgentToolOrchestrationPlan = {
  toolAccessMode: AgentToolAccessMode;
  toolCallStrategy: AgentToolCallStrategy;
  allowedToolKeys: string[];
  selectedTargets: AgentToolOrchestrationCandidate[];
  deferredTargets: AgentToolOrchestrationCandidate[];
  blockedTargets: AgentToolOrchestrationCandidate[];
};

const VALID_ACCESS_MODES = new Set<AgentToolAccessMode>([
  "workspace_default",
  "all",
  "selected",
  "none",
]);

const VALID_TOOL_CALL_STRATEGIES = new Set<AgentToolCallStrategy>([
  "workspace_default",
  "single",
  "read_then_write",
  "fan_out",
]);

function rankCapability(capability: string) {
  switch (capability) {
    case "knowledge_lookup":
      return 0;
    case "http_request":
      return 1;
    case "crm_writeback":
    case "spreadsheet_row":
      return 2;
    case "webhook_reply":
      return 3;
    default:
      return 1;
  }
}

function normalizeToolCandidate(candidate: AgentToolOrchestrationCandidate) {
  if (candidate.nodeType !== "tool") {
    return {
      ...candidate,
      toolKey: "",
      capability: "",
    };
  }

  const preset = getToolRegistryItem(candidate.toolKey);
  return {
    ...candidate,
    toolKey: preset.key,
    capability: candidate.capability || preset.capability,
  };
}

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

export function normalizeAgentToolPolicyConfig(config: Record<string, unknown> = {}) {
  const access = normalizeAgentToolAccessConfig(config);
  const requestedStrategy =
    typeof config.tool_call_strategy === "string" ? config.tool_call_strategy.trim().toLowerCase() : "";
  const toolCallStrategy = VALID_TOOL_CALL_STRATEGIES.has(requestedStrategy as AgentToolCallStrategy)
    ? (requestedStrategy as AgentToolCallStrategy)
    : "workspace_default";

  return {
    ...access,
    tool_call_strategy: toolCallStrategy,
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

export function planAgentToolOrchestration(
  config: Record<string, unknown> = {},
  candidates: AgentToolOrchestrationCandidate[] = [],
): AgentToolOrchestrationPlan {
  const normalized = normalizeAgentToolPolicyConfig(config);
  const normalizedCandidates = candidates.map(normalizeToolCandidate);
  const toolCandidates = normalizedCandidates.filter((candidate) => candidate.nodeType === "tool");
  const nonToolCandidates = normalizedCandidates.filter((candidate) => candidate.nodeType !== "tool");

  const blockedTargets = toolCandidates.filter(
    (candidate) => !canAgentUseToolKey(normalized, candidate.toolKey || ""),
  );
  const allowedToolTargets = toolCandidates.filter(
    (candidate) => canAgentUseToolKey(normalized, candidate.toolKey || ""),
  );

  let selectedToolTargets = allowedToolTargets;
  let deferredTargets: AgentToolOrchestrationCandidate[] = [];

  if (normalized.tool_call_strategy === "single" && allowedToolTargets.length > 1) {
    selectedToolTargets = allowedToolTargets.slice(0, 1);
    deferredTargets = allowedToolTargets.slice(1);
  }

  if (normalized.tool_call_strategy === "read_then_write" && allowedToolTargets.length > 1) {
    selectedToolTargets = [...allowedToolTargets].sort((left, right) => {
      const leftRank = rankCapability(String(left.capability || ""));
      const rightRank = rankCapability(String(right.capability || ""));
      return leftRank - rightRank;
    });
  }

  return {
    toolAccessMode: normalized.tool_access_mode,
    toolCallStrategy: normalized.tool_call_strategy,
    allowedToolKeys: normalized.allowed_tool_keys,
    selectedTargets: [...selectedToolTargets, ...nonToolCandidates],
    deferredTargets,
    blockedTargets,
  };
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

export function summarizeAgentToolStrategy(config: Record<string, unknown> = {}) {
  const { tool_call_strategy: strategy } = normalizeAgentToolPolicyConfig(config);

  switch (strategy) {
    case "single":
      return "One tool call at a time";
    case "read_then_write":
      return "Read first, then write";
    case "fan_out":
      return "Fan out to multiple tool steps";
    default:
      return "Workspace default strategy";
  }
}
