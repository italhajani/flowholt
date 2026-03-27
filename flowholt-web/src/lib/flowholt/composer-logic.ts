import type { WorkflowGraph, WorkflowNodeType, WorkflowRecord } from "./types.ts";

export type ComposerMode = "preview" | "apply";

export type ComposerGenerationMeta = {
  provider: string;
  model: string;
  notes?: string;
  originalPrompt?: string;
};

export type ComposerChange = {
  kind: "add" | "remove" | "update";
  node_id: string;
  label: string;
  node_type: WorkflowNodeType;
  reason: string;
};

export type ComposerProposal = {
  name: string;
  description: string;
  graph: WorkflowGraph;
  reasoning: string[];
  changes: ComposerChange[];
  generation: ComposerGenerationMeta;
};

export type ComposerHistoryItem = {
  at: string;
  mode: ComposerMode;
  message: string;
  proposal: {
    name: string;
    description: string;
    node_count: number;
    edge_count: number;
    provider: string;
    model: string;
  };
};

export type WorkflowRevisionInsert = {
  workflow_id: string;
  workspace_id: string;
  created_by_user_id: string;
  source: "compose_apply" | "restore" | "manual" | "api";
  message: string;
  before_name: string;
  before_description: string;
  before_graph: Record<string, unknown>;
  after_name: string;
  after_description: string;
  after_graph: Record<string, unknown>;
  change_summary: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function parseComposerMode(value: unknown): ComposerMode {
  if (typeof value === "string" && value.toLowerCase() === "apply") {
    return "apply";
  }

  return "preview";
}

export function sanitizeComposerHistory(value: unknown): ComposerHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const row = asRecord(item);
      const proposal = asRecord(row.proposal);
      const mode = parseComposerMode(row.mode);

      return {
        at: asString(row.at, new Date(0).toISOString()),
        mode,
        message: asString(row.message),
        proposal: {
          name: asString(proposal.name, "Untitled workflow"),
          description: asString(proposal.description),
          node_count: Number(proposal.node_count) || 0,
          edge_count: Number(proposal.edge_count) || 0,
          provider: asString(proposal.provider, "fallback"),
          model: asString(proposal.model, "unknown"),
        },
      } satisfies ComposerHistoryItem;
    })
    .filter((item) => item.message)
    .slice(-25);
}

export function buildComposerProposalSummary(proposal: ComposerProposal) {
  return {
    name: proposal.name,
    description: proposal.description,
    graph: proposal.graph,
    reasoning: proposal.reasoning,
    changes: proposal.changes,
    generation: proposal.generation,
    summary: {
      node_count: proposal.graph.nodes.length,
      edge_count: proposal.graph.edges.length,
      condition_count: proposal.graph.nodes.filter((node) => node.type === "condition").length,
      tool_count: proposal.graph.nodes.filter((node) => node.type === "tool").length,
    },
  };
}

export function buildComposerAssistantMessage(
  mode: ComposerMode,
  proposal: ComposerProposal,
  isValid: boolean,
  revisionId = "",
) {
  const actionText = mode === "apply" ? "Applied" : "Prepared";
  const validityText = isValid ? "valid" : "invalid";

  const headline = `${actionText} ${validityText} proposal: ${proposal.name}`;
  const reasons = proposal.reasoning.slice(0, 3).join(" ");

  if (mode === "apply" && revisionId) {
    return `${headline}. Revision saved: ${revisionId}. ${reasons}`.trim();
  }

  return `${headline}. ${reasons}`.trim();
}

export function buildComposerHistoryItem(
  mode: ComposerMode,
  message: string,
  proposal: ComposerProposal,
): ComposerHistoryItem {
  return {
    at: new Date().toISOString(),
    mode,
    message,
    proposal: {
      name: proposal.name,
      description: proposal.description,
      node_count: proposal.graph.nodes.length,
      edge_count: proposal.graph.edges.length,
      provider: proposal.generation.provider,
      model: proposal.generation.model,
    },
  };
}

export function withComposerSettings(
  currentSettings: unknown,
  mode: ComposerMode,
  message: string,
  proposal: ComposerProposal,
) {
  const settings = asRecord(currentSettings);
  const history = sanitizeComposerHistory(settings.composer_history);
  const item = buildComposerHistoryItem(mode, message, proposal);

  return {
    ...settings,
    composer: {
      last_message: message,
      last_mode: mode,
      last_updated_at: item.at,
      last_plan: {
        reasoning: proposal.reasoning,
        changes: proposal.changes,
        summary: {
          node_count: proposal.graph.nodes.length,
          edge_count: proposal.graph.edges.length,
        },
        generation: proposal.generation,
      },
    },
    composer_history: [...history, item].slice(-25),
  };
}

export function buildWorkflowRevisionInsert(
  workflow: WorkflowRecord,
  userId: string,
  message: string,
  proposal: ComposerProposal,
  validation: unknown,
): WorkflowRevisionInsert {
  return {
    workflow_id: workflow.id,
    workspace_id: workflow.workspace_id,
    created_by_user_id: userId,
    source: "compose_apply",
    message,
    before_name: workflow.name,
    before_description: workflow.description,
    before_graph: workflow.graph as unknown as Record<string, unknown>,
    after_name: proposal.name,
    after_description: proposal.description,
    after_graph: proposal.graph as unknown as Record<string, unknown>,
    change_summary: {
      mode: "apply",
      reasoning: proposal.reasoning,
      changes: proposal.changes,
      generation: proposal.generation,
      validation,
      summary: {
        node_count: proposal.graph.nodes.length,
        edge_count: proposal.graph.edges.length,
      },
    },
  };
}
