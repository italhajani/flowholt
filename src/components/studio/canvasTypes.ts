/* Shared canvas types & fallback data — extracted to break circular imports
   between StudioCanvas ↔ useCanvasStore */

export interface CanvasNodeData {
  id: string;
  name: string;
  subtitle: string;
  family: "trigger" | "integration" | "logic" | "ai" | "data";
  top: number;
  left: number;
}

export type NodeExecState = "idle" | "running" | "success" | "error" | "disabled";

export const familyColors: Record<string, { border: string; dot: string; accent: string; bg: string }> = {
  trigger:     { border: "border-l-green-500", dot: "bg-green-500", accent: "#22c55e", bg: "bg-green-50" },
  integration: { border: "border-l-zinc-400",  dot: "bg-zinc-400",  accent: "#a1a1aa", bg: "bg-zinc-50" },
  logic:       { border: "border-l-blue-500",  dot: "bg-blue-500",  accent: "#3b82f6", bg: "bg-blue-50" },
  ai:          { border: "border-l-violet-600",dot: "bg-violet-600",accent: "#7c3aed", bg: "bg-violet-50" },
  data:        { border: "border-l-teal-500",  dot: "bg-teal-500",  accent: "#14b8a6", bg: "bg-teal-50" },
};

export const canvasNodes: CanvasNodeData[] = [
  { id: "n1", name: "Webhook Trigger",  subtitle: "Webhook",        family: "trigger",     top: 120, left: 80  },
  { id: "n2", name: "Enrich Lead Data", subtitle: "Clearbit",       family: "integration", top: 120, left: 340 },
  { id: "n3", name: "Score with AI",    subtitle: "OpenAI GPT-4o",  family: "ai",          top: 120, left: 600 },
  { id: "n4", name: "Route by Score",   subtitle: "IF / Switch",    family: "logic",       top: 250, left: 600 },
  { id: "n5", name: "Update CRM",       subtitle: "Salesforce",     family: "integration", top: 250, left: 860 },
];
