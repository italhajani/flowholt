import { useState } from "react";
import {
  GitBranch, Plus, Minus, Pencil, ArrowLeftRight, ChevronRight,
  ChevronDown, Eye, RotateCcw, Clock, User, Layers,
  Check, X, Zap, Wrench, Cpu, GitMerge,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface DiffNode {
  id: string;
  name: string;
  type: "trigger" | "integration" | "ai" | "logic" | "output" | "data";
  status: "added" | "removed" | "modified" | "unchanged";
  changes?: { field: string; before: string; after: string }[];
  position?: { x: number; y: number };
}

interface DiffConnection {
  from: string;
  to: string;
  status: "added" | "removed" | "unchanged";
}

interface WorkflowVersion {
  id: string;
  label: string;
  author: string;
  timestamp: string;
  nodeCount: number;
  connectionCount: number;
}

interface WorkflowDiffViewerProps {
  open: boolean;
  onClose: () => void;
  onRestore?: (versionId: string) => void;
}

/* ── Mock data ── */
const versions: WorkflowVersion[] = [
  { id: "v5", label: "v5 — Current", author: "Gouhar Ali", timestamp: "2 min ago", nodeCount: 8, connectionCount: 7 },
  { id: "v4", label: "v4 — Added error handling", author: "Gouhar Ali", timestamp: "1 hour ago", nodeCount: 7, connectionCount: 6 },
  { id: "v3", label: "v3 — Added AI scoring", author: "Sarah Chen", timestamp: "Yesterday", nodeCount: 6, connectionCount: 5 },
  { id: "v2", label: "v2 — Basic pipeline", author: "Gouhar Ali", timestamp: "3 days ago", nodeCount: 4, connectionCount: 3 },
  { id: "v1", label: "v1 — Initial scaffold", author: "Gouhar Ali", timestamp: "1 week ago", nodeCount: 2, connectionCount: 1 },
];

const mockDiff: Record<string, DiffNode[]> = {
  "v4": [
    { id: "n1", name: "Webhook Trigger", type: "trigger", status: "unchanged", position: { x: 50, y: 120 } },
    { id: "n2", name: "Score with AI", type: "ai", status: "modified",
      changes: [
        { field: "model", before: "gpt-4o-mini", after: "gpt-4o" },
        { field: "temperature", before: "0.5", after: "0.3" },
      ],
      position: { x: 280, y: 120 },
    },
    { id: "n3", name: "Route by Score", type: "logic", status: "unchanged", position: { x: 510, y: 120 } },
    { id: "n4", name: "Enrich via Clearbit", type: "integration", status: "modified",
      changes: [
        { field: "retry.enabled", before: "false", after: "true" },
        { field: "retry.maxAttempts", before: "—", after: "3" },
        { field: "retry.backoff", before: "—", after: "exponential" },
      ],
      position: { x: 740, y: 60 },
    },
    { id: "n5", name: "Notify on Slack", type: "output", status: "unchanged", position: { x: 740, y: 180 } },
    { id: "n6", name: "Log to Database", type: "data", status: "unchanged", position: { x: 970, y: 120 } },
    { id: "n7", name: "Error Handler", type: "logic", status: "added", position: { x: 970, y: 250 } },
    { id: "n8", name: "Error Notification", type: "output", status: "added", position: { x: 1200, y: 250 } },
  ],
  "v3": [
    { id: "n1", name: "Webhook Trigger", type: "trigger", status: "unchanged", position: { x: 50, y: 120 } },
    { id: "n2", name: "Score with AI", type: "ai", status: "added", position: { x: 280, y: 120 } },
    { id: "n3", name: "Route by Score", type: "logic", status: "added", position: { x: 510, y: 120 } },
    { id: "n4", name: "Enrich via Clearbit", type: "integration", status: "unchanged", position: { x: 740, y: 60 } },
    { id: "n5", name: "Notify on Slack", type: "output", status: "unchanged", position: { x: 740, y: 180 } },
    { id: "n6", name: "Log to Database", type: "data", status: "unchanged", position: { x: 970, y: 120 } },
  ],
};

const mockConnectionDiffs: Record<string, DiffConnection[]> = {
  "v4": [
    { from: "n1", to: "n2", status: "unchanged" },
    { from: "n2", to: "n3", status: "unchanged" },
    { from: "n3", to: "n4", status: "unchanged" },
    { from: "n3", to: "n5", status: "unchanged" },
    { from: "n4", to: "n6", status: "unchanged" },
    { from: "n4", to: "n7", status: "added" },
    { from: "n7", to: "n8", status: "added" },
  ],
  "v3": [
    { from: "n1", to: "n2", status: "added" },
    { from: "n2", to: "n3", status: "added" },
    { from: "n3", to: "n4", status: "unchanged" },
    { from: "n3", to: "n5", status: "unchanged" },
    { from: "n4", to: "n6", status: "unchanged" },
  ],
};

const statusColors: Record<string, string> = {
  added: "border-green-400 bg-green-50",
  removed: "border-red-400 bg-red-50",
  modified: "border-amber-400 bg-amber-50",
  unchanged: "border-zinc-200 bg-white",
};

const statusBadgeColors: Record<string, string> = {
  added: "bg-green-100 text-green-700",
  removed: "bg-red-100 text-red-700",
  modified: "bg-amber-100 text-amber-700",
  unchanged: "bg-zinc-100 text-zinc-500",
};

const statusIcons: Record<string, React.ElementType> = {
  added: Plus,
  removed: Minus,
  modified: Pencil,
  unchanged: Check,
};

const typeIcons: Record<string, React.ElementType> = {
  trigger: Zap,
  integration: Layers,
  ai: Cpu,
  logic: GitBranch,
  output: ArrowLeftRight,
  data: Wrench,
};

const NODE_W = 180;
const NODE_H = 52;

export function WorkflowDiffViewer({ open, onClose, onRestore }: WorkflowDiffViewerProps) {
  const [leftVersion, setLeftVersion] = useState("v4");
  const [rightVersion] = useState("v5");
  const [viewMode, setViewMode] = useState<"visual" | "list">("visual");
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  if (!open) return null;

  const diffNodes = mockDiff[leftVersion] ?? mockDiff["v4"]!;
  const diffConns = mockConnectionDiffs[leftVersion] ?? mockConnectionDiffs["v4"]!;

  const summary = {
    added: diffNodes.filter(n => n.status === "added").length,
    removed: diffNodes.filter(n => n.status === "removed").length,
    modified: diffNodes.filter(n => n.status === "modified").length,
    unchanged: diffNodes.filter(n => n.status === "unchanged").length,
    connAdded: diffConns.filter(c => c.status === "added").length,
    connRemoved: diffConns.filter(c => c.status === "removed").length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[90vw] max-w-[1200px] h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <GitMerge size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-800">Workflow Version Diff</h2>
              <p className="text-[11px] text-zinc-400">Compare changes between versions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
              {(["visual", "list"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[10px] font-medium transition-all",
                    viewMode === m ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {m === "visual" ? "Visual" : "List"}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Version selector strip */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-zinc-400 uppercase">Compare</span>
            <select
              value={leftVersion}
              onChange={(e) => setLeftVersion(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700"
            >
              {versions.filter(v => v.id !== rightVersion).map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
            <ArrowLeftRight size={12} className="text-zinc-300" />
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-500">
              {versions.find(v => v.id === rightVersion)?.label}
            </div>
          </div>

          {/* Summary pills */}
          <div className="ml-auto flex items-center gap-2">
            {summary.added > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[9px] font-semibold text-green-700">
                <Plus size={8} /> {summary.added} added
              </span>
            )}
            {summary.removed > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[9px] font-semibold text-red-700">
                <Minus size={8} /> {summary.removed} removed
              </span>
            )}
            {summary.modified > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                <Pencil size={8} /> {summary.modified} modified
              </span>
            )}
            {summary.connAdded > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[9px] font-semibold text-blue-700">
                <GitBranch size={8} /> +{summary.connAdded} connections
              </span>
            )}
          </div>
        </div>

        {/* Main diff area */}
        <div className="flex-1 overflow-auto">
          {viewMode === "visual" ? (
            /* ── Visual diff (mini-canvas) ── */
            <div className="relative w-full h-full min-h-[400px] bg-zinc-50/30">
              {/* Grid dots */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #e4e4e7 0.7px, transparent 0.7px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Connections SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                {diffConns.map((conn, i) => {
                  const fromNode = diffNodes.find(n => n.id === conn.from);
                  const toNode = diffNodes.find(n => n.id === conn.to);
                  if (!fromNode?.position || !toNode?.position) return null;
                  const x1 = fromNode.position.x + NODE_W;
                  const y1 = fromNode.position.y + NODE_H / 2;
                  const x2 = toNode.position.x;
                  const y2 = toNode.position.y + NODE_H / 2;
                  const mx = (x1 + x2) / 2;
                  return (
                    <path
                      key={i}
                      d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={conn.status === "added" ? "#22c55e" : conn.status === "removed" ? "#ef4444" : "#d4d4d8"}
                      strokeWidth={conn.status === "unchanged" ? 1.5 : 2}
                      strokeDasharray={conn.status === "removed" ? "4 3" : "none"}
                      opacity={conn.status === "unchanged" ? 0.4 : 0.8}
                    />
                  );
                })}
              </svg>

              {/* Diff nodes */}
              {diffNodes.map((node) => {
                if (!node.position) return null;
                const StatusIcon = statusIcons[node.status];
                const TypeIcon = typeIcons[node.type];
                return (
                  <div
                    key={node.id}
                    className={cn(
                      "absolute rounded-lg border-2 shadow-sm transition-all hover:shadow-md cursor-pointer",
                      statusColors[node.status],
                      node.status === "removed" && "opacity-60"
                    )}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: NODE_W,
                      height: NODE_H,
                      zIndex: 2,
                    }}
                    onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                  >
                    <div className="flex items-center gap-2 px-3 h-full">
                      <TypeIcon size={13} className="text-zinc-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-zinc-700 truncate">{node.name}</p>
                        <p className="text-[9px] text-zinc-400">{node.type}</p>
                      </div>
                      <span className={cn("flex h-4 w-4 items-center justify-center rounded-full", statusBadgeColors[node.status])}>
                        <StatusIcon size={8} />
                      </span>
                    </div>

                    {/* Expanded changes popover */}
                    {expandedNode === node.id && node.changes && (
                      <div className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-zinc-200 bg-white shadow-lg z-50 p-2">
                        <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Changes</p>
                        {node.changes.map((change, ci) => (
                          <div key={ci} className="flex items-center gap-2 py-1 border-b border-zinc-50 last:border-0">
                            <span className="text-[10px] font-medium text-zinc-600 w-24 truncate">{change.field}</span>
                            <span className="text-[10px] text-red-500 line-through font-mono">{change.before}</span>
                            <ArrowLeftRight size={8} className="text-zinc-300 flex-shrink-0" />
                            <span className="text-[10px] text-green-600 font-mono font-medium">{change.after}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── List diff view ── */
            <div className="p-5 space-y-2">
              {diffNodes.filter(n => n.status !== "unchanged").map((node) => {
                const StatusIcon = statusIcons[node.status];
                const TypeIcon = typeIcons[node.type];
                const isExpanded = expandedNode === node.id;
                return (
                  <div key={node.id} className={cn("rounded-lg border-l-4 bg-white shadow-xs", statusColors[node.status].split(" ")[0])}>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                      onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                    >
                      <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", statusBadgeColors[node.status])}>
                        <StatusIcon size={10} />
                      </span>
                      <TypeIcon size={13} className="text-zinc-400" />
                      <span className="text-[12px] font-medium text-zinc-800 flex-1">{node.name}</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase", statusBadgeColors[node.status])}>
                        {node.status}
                      </span>
                      {node.changes && (
                        <span className="text-[10px] text-zinc-400">{node.changes.length} changes</span>
                      )}
                      {node.changes && (
                        isExpanded ? <ChevronDown size={12} className="text-zinc-400" /> : <ChevronRight size={12} className="text-zinc-400" />
                      )}
                    </button>
                    {isExpanded && node.changes && (
                      <div className="border-t border-zinc-100 px-4 py-2 bg-zinc-50/50">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-zinc-400 font-medium">
                              <th className="text-left py-1 w-1/3">Field</th>
                              <th className="text-left py-1 w-1/3">Before</th>
                              <th className="text-left py-1 w-1/3">After</th>
                            </tr>
                          </thead>
                          <tbody>
                            {node.changes.map((change, ci) => (
                              <tr key={ci} className="border-t border-zinc-100">
                                <td className="py-1 font-medium text-zinc-600 font-mono">{change.field}</td>
                                <td className="py-1 text-red-500 font-mono line-through">{change.before}</td>
                                <td className="py-1 text-green-600 font-mono font-semibold">{change.after}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unchanged summary */}
              {summary.unchanged > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2.5 text-[11px] text-zinc-400">
                  <Check size={12} className="text-zinc-300" />
                  {summary.unchanged} nodes unchanged
                </div>
              )}

              {/* Connection changes */}
              {(summary.connAdded > 0 || summary.connRemoved > 0) && (
                <div className="rounded-lg border border-zinc-200 bg-white p-3 mt-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Connection Changes</p>
                  {diffConns.filter(c => c.status !== "unchanged").map((conn, i) => {
                    const fromName = diffNodes.find(n => n.id === conn.from)?.name ?? conn.from;
                    const toName = diffNodes.find(n => n.id === conn.to)?.name ?? conn.to;
                    return (
                      <div key={i} className="flex items-center gap-2 py-1 text-[11px]">
                        <span className={cn(
                          "rounded px-1 py-0.5 text-[8px] font-semibold uppercase",
                          conn.status === "added" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {conn.status}
                        </span>
                        <span className="text-zinc-700 font-medium">{fromName}</span>
                        <ArrowLeftRight size={10} className="text-zinc-300" />
                        <span className="text-zinc-700 font-medium">{toName}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 bg-zinc-50/50">
          <div className="flex items-center gap-3 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1"><Clock size={10} /> {versions.find(v => v.id === leftVersion)?.timestamp}</span>
            <span className="flex items-center gap-1"><User size={10} /> {versions.find(v => v.id === leftVersion)?.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-md px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">
              Close
            </button>
            <button className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Eye size={11} /> Side-by-Side
            </button>
            <button
              onClick={() => onRestore?.(leftVersion)}
              className="flex items-center gap-1 rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw size={11} /> Restore {versions.find(v => v.id === leftVersion)?.label.split(" — ")[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
