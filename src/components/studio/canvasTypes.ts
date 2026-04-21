/* Shared canvas types & fallback data — extracted to break circular imports
   between StudioCanvas ↔ useCanvasStore */

export interface CanvasNodeData {
  id: string;
  name: string;
  subtitle: string;
  /** Technical type key used by the executor (e.g. "http_request", "llm"). Falls back to subtitle. */
  nodeType?: string;
  /** Node configuration object persisted with the workflow definition. */
  config?: Record<string, unknown>;
  family: "trigger" | "integration" | "logic" | "ai" | "data" | "code" | "human" | "error";
  top: number;
  left: number;
}

export type NodeExecState = "idle" | "running" | "success" | "error" | "disabled";

export const familyColors: Record<string, { border: string; dot: string; accent: string; bg: string }> = {
  trigger:     { border: "border-l-green-500",  dot: "bg-green-500",  accent: "#22c55e", bg: "bg-green-50" },
  integration: { border: "border-l-zinc-400",   dot: "bg-zinc-400",   accent: "#a1a1aa", bg: "bg-zinc-50" },
  logic:       { border: "border-l-blue-500",   dot: "bg-blue-500",   accent: "#3b82f6", bg: "bg-blue-50" },
  ai:          { border: "border-l-zinc-900",   dot: "bg-zinc-900",   accent: "#18181b", bg: "bg-zinc-100" },
  data:        { border: "border-l-teal-500",   dot: "bg-teal-500",   accent: "#14b8a6", bg: "bg-teal-50" },
  code:        { border: "border-l-amber-500",  dot: "bg-amber-500",  accent: "#f59e0b", bg: "bg-amber-50" },
  human:       { border: "border-l-rose-500",   dot: "bg-rose-500",   accent: "#f43f5e", bg: "bg-rose-50" },
  error:       { border: "border-l-red-500",    dot: "bg-red-500",    accent: "#ef4444", bg: "bg-red-50" },
};

export const canvasNodes: CanvasNodeData[] = [
  { id: "n1", name: "Webhook Trigger",  subtitle: "trigger",        nodeType: "trigger",     family: "trigger",     top: 120, left: 80  },
  { id: "n2", name: "Enrich Lead Data", subtitle: "http_request",   nodeType: "http_request",family: "integration", top: 120, left: 340 },
  { id: "n3", name: "Score with AI",    subtitle: "llm",            nodeType: "llm",         family: "ai",          top: 120, left: 600 },
  { id: "n4", name: "Route by Score",   subtitle: "condition",      nodeType: "condition",   family: "logic",       top: 250, left: 600 },
  { id: "n5", name: "Update CRM",       subtitle: "http_request",   nodeType: "http_request",family: "integration", top: 250, left: 860 },
];

/** Canvas sticky note annotation */
export interface StickyNoteData {
  id: string;
  text: string;
  top: number;
  left: number;
  color: string;
  width?: number;
}
