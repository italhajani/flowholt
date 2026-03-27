import type { WorkflowGraph, WorkflowNodeType } from "./types.ts";
import { getToolMarketplaceKitByKey } from "./tool-marketplace.ts";
import { getDefaultToolConfig } from "./tool-registry.ts";

export type PackAwareFallbackDraft = {
  name: string;
  description: string;
  graph: WorkflowGraph;
  notes: string;
};

function positionedNode(
  id: string,
  type: WorkflowNodeType,
  label: string,
  index: number,
  config: Record<string, unknown>,
) {
  return {
    id,
    type,
    label,
    config,
    position: {
      x: 80 + (index % 3) * 220,
      y: 80 + Math.floor(index / 3) * 160,
    },
  };
}

export function buildPackAwareFallbackDraft(prompt: string, resourceKitKey: string): PackAwareFallbackDraft | null {
  const kit = getToolMarketplaceKitByKey(resourceKitKey);

  if (!kit || kit.family !== "workflow_pack") {
    return null;
  }

  if (resourceKitKey === "lead-intake-pack") {
    const graph: WorkflowGraph = {
      nodes: [
        positionedNode("lead-trigger", "trigger", "Lead trigger", 0, { mode: "manual" }),
        positionedNode("research-context", "tool", "Research context", 1, getDefaultToolConfig("knowledge-lookup")),
        positionedNode("qualify-lead", "agent", "Qualify lead", 2, {
          instruction: "Review the lead context, summarize qualification, and prepare CRM-ready notes.",
          model: "",
          tool_access_mode: "selected",
          allowed_tool_keys: ["knowledge-lookup", "crm-upsert"],
          tool_call_strategy: "read_then_write",
        }),
        positionedNode("update-crm", "tool", "Update CRM", 3, getDefaultToolConfig("crm-upsert")),
        positionedNode("final-output", "output", "Final summary", 4, { result: "{{previous}}" }),
      ],
      edges: [
        { source: "lead-trigger", target: "research-context" },
        { source: "research-context", target: "qualify-lead" },
        { source: "qualify-lead", target: "update-crm" },
        { source: "update-crm", target: "final-output" },
      ],
    };

    return {
      name: "Lead intake workflow",
      description: prompt || kit.description,
      graph,
      notes: "Local fallback draft shaped from the lead intake resource pack.",
    };
  }

  if (resourceKitKey === "support-resolution-pack") {
    const graph: WorkflowGraph = {
      nodes: [
        positionedNode("support-trigger", "trigger", "Support trigger", 0, { mode: "manual" }),
        positionedNode("lookup-knowledge", "tool", "Lookup knowledge", 1, getDefaultToolConfig("knowledge-lookup")),
        positionedNode("draft-response", "agent", "Draft response", 2, {
          instruction: "Use the gathered context to draft a helpful support response and resolution summary.",
          model: "",
          tool_access_mode: "selected",
          allowed_tool_keys: ["knowledge-lookup", "webhook-reply"],
          tool_call_strategy: "read_then_write",
        }),
        positionedNode("send-callback", "tool", "Send callback", 3, getDefaultToolConfig("webhook-reply")),
        positionedNode("final-output", "output", "Final summary", 4, { result: "{{previous}}" }),
      ],
      edges: [
        { source: "support-trigger", target: "lookup-knowledge" },
        { source: "lookup-knowledge", target: "draft-response" },
        { source: "draft-response", target: "send-callback" },
        { source: "send-callback", target: "final-output" },
      ],
    };

    return {
      name: "Support resolution workflow",
      description: prompt || kit.description,
      graph,
      notes: "Local fallback draft shaped from the support resolution resource pack.",
    };
  }

  if (resourceKitKey === "content-ops-pack") {
    const publishConfig = getDefaultToolConfig("http-request");
    publishConfig.url = "/v1/publish";
    const logConfig = getDefaultToolConfig("spreadsheet-row");

    const graph: WorkflowGraph = {
      nodes: [
        positionedNode("content-trigger", "trigger", "Content trigger", 0, { mode: "manual" }),
        positionedNode("create-content", "agent", "Create content", 1, {
          instruction: "Generate or refine the content and prepare downstream delivery and reporting outputs.",
          model: "",
          tool_access_mode: "selected",
          allowed_tool_keys: ["http-request", "spreadsheet-row"],
          tool_call_strategy: "fan_out",
        }),
        positionedNode("publish-content", "tool", "Publish content", 2, publishConfig),
        positionedNode("log-content", "tool", "Log content", 3, logConfig),
        positionedNode("final-output", "output", "Final summary", 4, { result: "{{previous}}" }),
      ],
      edges: [
        { source: "content-trigger", target: "create-content" },
        { source: "create-content", target: "publish-content" },
        { source: "create-content", target: "log-content" },
        { source: "publish-content", target: "final-output" },
        { source: "log-content", target: "final-output" },
      ],
    };

    return {
      name: "Content operations workflow",
      description: prompt || kit.description,
      graph,
      notes: "Local fallback draft shaped from the content ops resource pack.",
    };
  }

  return null;
}
