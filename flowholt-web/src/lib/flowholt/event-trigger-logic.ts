import type { WorkflowNode, WorkflowRecord } from "@/lib/flowholt/types";

export type WorkspaceEventInput = {
  workspaceId: string;
  eventName: string;
  eventSource?: string;
  payload?: unknown;
  metadata?: Record<string, unknown>;
};

export type MatchingEventTrigger = {
  nodeId: string;
  nodeLabel: string;
  eventName: string;
  eventSource: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeEventToken(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function eventPatternMatches(pattern: string, eventName: string): boolean {
  const normalizedPattern = normalizeEventToken(pattern);
  const normalizedEventName = normalizeEventToken(eventName);

  if (!normalizedPattern || !normalizedEventName) {
    return false;
  }

  if (normalizedPattern === "*") {
    return true;
  }

  if (!normalizedPattern.includes("*")) {
    return normalizedPattern === normalizedEventName;
  }

  const escaped = normalizedPattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escaped.replace(/\*/g, ".*")}$`, "i");
  return regex.test(normalizedEventName);
}

export function readEventTriggerConfig(node: WorkflowNode) {
  const config = asRecord(node.config);
  const eventName =
    typeof config.event_name === "string"
      ? config.event_name
      : typeof config.eventName === "string"
        ? config.eventName
        : "";
  const eventSource =
    typeof config.event_source === "string"
      ? config.event_source
      : typeof config.eventSource === "string"
        ? config.eventSource
        : "";

  return {
    mode: typeof config.mode === "string" ? config.mode.trim().toLowerCase() : "manual",
    eventName,
    eventSource,
  };
}

export function isEventTriggerNode(node: WorkflowNode): boolean {
  return node.type === "trigger" && readEventTriggerConfig(node).mode === "event";
}

export function doesEventTriggerMatch(node: WorkflowNode, event: WorkspaceEventInput): boolean {
  if (!isEventTriggerNode(node)) {
    return false;
  }

  const config = readEventTriggerConfig(node);
  if (!eventPatternMatches(config.eventName, event.eventName)) {
    return false;
  }

  const configuredSource = normalizeEventToken(config.eventSource);
  if (!configuredSource) {
    return true;
  }

  return configuredSource === normalizeEventToken(event.eventSource);
}

export function findMatchingEventTriggers(
  workflow: Pick<WorkflowRecord, "graph">,
  event: WorkspaceEventInput,
): MatchingEventTrigger[] {
  return workflow.graph.nodes
    .filter((node) => doesEventTriggerMatch(node, event))
    .map((node) => {
      const config = readEventTriggerConfig(node);
      return {
        nodeId: node.id,
        nodeLabel: node.label,
        eventName: config.eventName,
        eventSource: config.eventSource,
      };
    });
}

export function buildEventTriggerMeta(
  event: WorkspaceEventInput,
  matches: MatchingEventTrigger[],
) {
  return {
    event_name: event.eventName,
    event_source: event.eventSource ?? "",
    event_metadata: asRecord(event.metadata),
    matched_trigger_ids: matches.map((match) => match.nodeId),
    matched_trigger_labels: matches.map((match) => match.nodeLabel),
    matched_trigger_count: matches.length,
  };
}
