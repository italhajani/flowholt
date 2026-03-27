import type { WorkflowNodeType } from "@/lib/flowholt/types";

export type NodeCatalogItem = {
  key: string;
  type: WorkflowNodeType;
  title: string;
  description: string;
  category: "input" | "thinking" | "action" | "control" | "output";
  executionMode: "builtin" | "integration" | "ai";
};

export const nodeCatalog: NodeCatalogItem[] = [
  {
    key: "manual-trigger",
    type: "trigger",
    title: "Manual trigger",
    description: "Starts a workflow when a user clicks run.",
    category: "input",
    executionMode: "builtin",
  },
  {
    key: "schedule-trigger",
    type: "trigger",
    title: "Schedule trigger",
    description: "Starts a workflow on a time-based schedule.",
    category: "input",
    executionMode: "builtin",
  },
  {
    key: "event-trigger",
    type: "trigger",
    title: "Event trigger",
    description: "Starts a workflow when a named workspace event is ingested.",
    category: "input",
    executionMode: "builtin",
  },
  {
    key: "task-planner",
    type: "agent",
    title: "Task planner",
    description: "Breaks a messy request into clean steps.",
    category: "thinking",
    executionMode: "ai",
  },
  {
    key: "research-agent",
    type: "agent",
    title: "Research agent",
    description: "Finds, compares, and summarizes information.",
    category: "thinking",
    executionMode: "ai",
  },
  {
    key: "http-request",
    type: "tool",
    title: "HTTP request",
    description: "Calls an external API or webhook.",
    category: "action",
    executionMode: "integration",
  },
  {
    key: "record-updater",
    type: "tool",
    title: "Record updater",
    description: "Writes data to a connected tool or system.",
    category: "action",
    executionMode: "integration",
  },
  {
    key: "decision-check",
    type: "condition",
    title: "Decision check",
    description: "Routes the flow based on a rule or score.",
    category: "control",
    executionMode: "builtin",
  },
  {
    key: "knowledge-memory",
    type: "memory",
    title: "Knowledge memory",
    description: "Loads saved context or background information.",
    category: "thinking",
    executionMode: "builtin",
  },
  {
    key: "knowledge-retriever",
    type: "retriever",
    title: "Knowledge retriever",
    description: "Looks up supporting material before acting.",
    category: "thinking",
    executionMode: "builtin",
  },
  {
    key: "final-output",
    type: "output",
    title: "Final output",
    description: "Packages the result for the user or next system.",
    category: "output",
    executionMode: "builtin",
  },
];

export function getCatalogPromptLines() {
  return nodeCatalog.map(
    (item) => `${item.title} [${item.type} | ${item.executionMode}] - ${item.description}`,
  );
}
