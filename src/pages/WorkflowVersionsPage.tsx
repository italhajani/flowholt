import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GitBranch, Clock, ChevronRight, RotateCcw, Eye, ArrowLeftRight,
  Plus, Minus, Edit3, CheckCircle2, AlertTriangle, User, Calendar,
  ArrowLeft, Download, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowVersions } from "@/hooks/useApi";
import type { WorkflowVersionOut } from "@/lib/api";

/* ── Types ── */
interface WorkflowVersion {
  id: string;
  version: number;
  label: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  message: string;
  nodesAdded: number;
  nodesRemoved: number;
  nodesModified: number;
  isCurrent: boolean;
}

interface DiffNode {
  id: string;
  name: string;
  type: string;
  status: "added" | "removed" | "modified" | "unchanged";
  x: number;
  y: number;
  changes?: string[];
}

/* ── Mock data ── */
const mockVersions: WorkflowVersion[] = [
  { id: "v6", version: 6, label: "Current", author: "Gouhar Ali", authorAvatar: "GA", createdAt: "2 hrs ago", message: "Add error handling for API rate limits", nodesAdded: 1, nodesRemoved: 0, nodesModified: 2, isCurrent: true },
  { id: "v5", version: 5, label: "", author: "Sarah Chen", authorAvatar: "SC", createdAt: "1 day ago", message: "Optimize AI scoring prompt for better accuracy", nodesAdded: 0, nodesRemoved: 0, nodesModified: 1, isCurrent: false },
  { id: "v4", version: 4, label: "Stable", author: "Gouhar Ali", authorAvatar: "GA", createdAt: "3 days ago", message: "Add CRM update step and email notification", nodesAdded: 2, nodesRemoved: 0, nodesModified: 0, isCurrent: false },
  { id: "v3", version: 3, label: "", author: "Gouhar Ali", authorAvatar: "GA", createdAt: "1 week ago", message: "Replace Clearbit with Apollo for enrichment", nodesAdded: 1, nodesRemoved: 1, nodesModified: 1, isCurrent: false },
  { id: "v2", version: 2, label: "", author: "Sarah Chen", authorAvatar: "SC", createdAt: "2 weeks ago", message: "Add lead scoring AI node", nodesAdded: 1, nodesRemoved: 0, nodesModified: 0, isCurrent: false },
  { id: "v1", version: 1, label: "Initial", author: "Gouhar Ali", authorAvatar: "GA", createdAt: "Dec 8, 2025", message: "Initial workflow creation with webhook trigger", nodesAdded: 3, nodesRemoved: 0, nodesModified: 0, isCurrent: false },
];

const mockDiffNodes: DiffNode[] = [
  { id: "n1", name: "Webhook Trigger", type: "trigger", status: "unchanged", x: 60, y: 120 },
  { id: "n2", name: "Enrich Lead", type: "integration", status: "modified", x: 220, y: 120, changes: ["Changed provider from Clearbit to Apollo", "Updated API key reference"] },
  { id: "n3", name: "Score with AI", type: "ai", status: "modified", x: 380, y: 120, changes: ["Added retry on 429 errors", "Updated temperature to 0.2"] },
  { id: "n4", name: "Route by Score", type: "logic", status: "unchanged", x: 540, y: 120 },
  { id: "n5", name: "Update CRM", type: "integration", status: "unchanged", x: 700, y: 80 },
  { id: "n6", name: "Error Handler", type: "logic", status: "added", x: 700, y: 180 },
];

const diffStatusConfig = {
  added:     { color: "text-green-600", bg: "bg-green-50", border: "border-green-300", ring: "ring-green-400", icon: Plus, label: "Added" },
  removed:   { color: "text-red-600",   bg: "bg-red-50",   border: "border-red-300",   ring: "ring-red-400",   icon: Minus, label: "Removed" },
  modified:  { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", ring: "ring-amber-400", icon: Edit3, label: "Modified" },
  unchanged: { color: "text-zinc-400",  bg: "bg-white",    border: "border-zinc-200",  ring: "ring-zinc-200",  icon: CheckCircle2, label: "Unchanged" },
};

/* ── Component ── */
export function WorkflowVersionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVersion, setSelectedVersion] = useState<string>("v6");
  const [compareWith, setCompareWith] = useState<string>("v5");
  const [showDiff, setShowDiff] = useState(true);

  const { data: apiVersions } = useWorkflowVersions(id);

  const versions = useMemo(() => {
    if (apiVersions && apiVersions.length > 0) {
      return apiVersions.map((v: WorkflowVersionOut, i: number) => ({
        id: v.id,
        version: v.version_number,
        label: v.status === "published" ? "Published" : v.status === "staging" ? "Staging" : i === 0 ? "Current" : "",
        author: "You",
        authorAvatar: "GA",
        createdAt: v.created_at ? new Date(v.created_at).toLocaleDateString() : "—",
        message: v.notes || `Version ${v.version_number}`,
        nodesAdded: 0,
        nodesRemoved: 0,
        nodesModified: 0,
        isCurrent: i === 0,
      })) as WorkflowVersion[];
    }
    return mockVersions;
  }, [apiVersions]);

  const selected = versions.find(v => v.id === selectedVersion) || versions[0];
  const compared = versions.find(v => v.id === compareWith);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-zinc-50">
      {/* Left: Version timeline */}
      <div className="w-80 border-r border-zinc-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-100">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 mb-2 transition-colors">
            <ArrowLeft size={12} /> Back to workflow
          </button>
          <h2 className="text-[15px] font-semibold text-zinc-900 flex items-center gap-2">
            <GitBranch size={16} className="text-violet-500" /> Version History
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">{versions.length} versions · Lead Qualification Pipeline</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {versions.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setSelectedVersion(v.id)}
              className={cn(
                "w-full rounded-xl p-3 text-left transition-all relative",
                selectedVersion === v.id
                  ? "bg-zinc-900 text-white shadow-md"
                  : "bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-sm"
              )}
            >
              {/* Timeline connector */}
              {i < versions.length - 1 && (
                <div className={cn("absolute left-[22px] top-full w-0.5 h-1 z-0", selectedVersion === v.id ? "bg-zinc-700" : "bg-zinc-200")} />
              )}

              <div className="flex items-center gap-2 mb-1">
                <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold flex-shrink-0",
                  selectedVersion === v.id ? "bg-white text-zinc-900" : "bg-zinc-100 text-zinc-500"
                )}>
                  v{v.version}
                </div>
                <span className={cn("text-[12px] font-medium truncate", selectedVersion === v.id ? "text-white" : "text-zinc-700")}>
                  {v.message}
                </span>
              </div>

              <div className={cn("flex items-center gap-2 text-[10px] ml-7", selectedVersion === v.id ? "text-zinc-300" : "text-zinc-400")}>
                <span>{v.author}</span>
                <span>·</span>
                <span>{v.createdAt}</span>
                {v.label && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[8px] font-semibold",
                    selectedVersion === v.id ? "bg-white/20 text-white" : "bg-violet-50 text-violet-600"
                  )}>
                    {v.label}
                  </span>
                )}
              </div>

              <div className={cn("flex items-center gap-2 text-[9px] ml-7 mt-1", selectedVersion === v.id ? "text-zinc-400" : "text-zinc-300")}>
                {v.nodesAdded > 0 && <span className="text-green-500">+{v.nodesAdded} added</span>}
                {v.nodesRemoved > 0 && <span className="text-red-500">-{v.nodesRemoved} removed</span>}
                {v.nodesModified > 0 && <span className="text-amber-500">~{v.nodesModified} modified</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Diff viewer */}
      <div className="flex-1 flex flex-col">
        {/* Diff toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-medium">Comparing:</span>
            <select
              value={compareWith}
              onChange={e => setCompareWith(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600"
            >
              {versions.filter(v => v.id !== selectedVersion).map(v => (
                <option key={v.id} value={v.id}>v{v.version} — {v.message.slice(0, 40)}</option>
              ))}
            </select>
            <ArrowLeftRight size={12} className="text-zinc-300" />
            <span className="text-[11px] font-medium text-zinc-700">v{selected.version} (selected)</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-green-600"><Plus size={10} /> {mockDiffNodes.filter(n => n.status === "added").length} added</span>
            <span className="flex items-center gap-1 text-amber-600"><Edit3 size={10} /> {mockDiffNodes.filter(n => n.status === "modified").length} modified</span>
            <span className="flex items-center gap-1 text-red-600"><Minus size={10} /> {mockDiffNodes.filter(n => n.status === "removed").length} removed</span>
          </div>

          <div className="flex items-center gap-1.5 ml-3">
            {!selected.isCurrent && (
              <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800 transition-colors">
                <RotateCcw size={11} /> Restore this version
              </button>
            )}
            <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] text-zinc-500 hover:bg-zinc-50 transition-colors">
              <Download size={11} /> Export
            </button>
          </div>
        </div>

        {/* Visual diff canvas */}
        <div className="flex-1 relative overflow-auto bg-zinc-50 p-8">
          {/* Legend */}
          <div className="absolute top-4 right-4 flex items-center gap-3 rounded-lg bg-white border border-zinc-200 px-3 py-2 shadow-sm z-10">
            {(["added", "modified", "removed", "unchanged"] as const).map(s => {
              const c = diffStatusConfig[s];
              return (
                <span key={s} className={cn("flex items-center gap-1 text-[9px] font-medium", c.color)}>
                  <c.icon size={9} /> {c.label}
                </span>
              );
            })}
          </div>

          {/* Diff nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 900, minHeight: 300 }}>
            {/* Edges */}
            {[
              { from: "n1", to: "n2" }, { from: "n2", to: "n3" },
              { from: "n3", to: "n4" }, { from: "n4", to: "n5" }, { from: "n4", to: "n6" },
            ].map(edge => {
              const fromNode = mockDiffNodes.find(n => n.id === edge.from)!;
              const toNode = mockDiffNodes.find(n => n.id === edge.to)!;
              const isNew = toNode.status === "added";
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={fromNode.x + 70} y1={fromNode.y + 20}
                  x2={toNode.x} y2={toNode.y + 20}
                  stroke={isNew ? "#22c55e" : "#d4d4d8"}
                  strokeWidth={isNew ? 2 : 1.5}
                  strokeDasharray={isNew ? "4 2" : "none"}
                />
              );
            })}
          </svg>

          <div className="relative" style={{ minWidth: 900, minHeight: 300 }}>
            {mockDiffNodes.map(node => {
              const c = diffStatusConfig[node.status];
              return (
                <DiffNodeCard key={node.id} node={node} config={c} />
              );
            })}
          </div>
        </div>

        {/* Version detail panel */}
        <div className="bg-white border-t border-zinc-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white">{selected.authorAvatar}</div>
            <div>
              <p className="text-[12px] font-medium text-zinc-700">{selected.message}</p>
              <p className="text-[10px] text-zinc-400">{selected.author} · {selected.createdAt} · Version {selected.version}</p>
            </div>
            {selected.label && (
              <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-medium text-violet-600">
                <Tag size={8} /> {selected.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Diff Node Card ── */
function DiffNodeCard({ node, config }: { node: DiffNode; config: typeof diffStatusConfig[keyof typeof diffStatusConfig] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="absolute"
      style={{ left: node.x, top: node.y }}
    >
      <button
        onClick={() => node.changes && setExpanded(e => !e)}
        className={cn(
          "w-[140px] rounded-xl border-2 px-3 py-2.5 text-left transition-all shadow-sm",
          config.border, config.bg,
          node.status !== "unchanged" && "ring-2 ring-offset-1",
          node.status !== "unchanged" && config.ring,
          node.changes && "cursor-pointer hover:shadow-md"
        )}
      >
        <div className="flex items-center gap-1.5">
          <config.icon size={10} className={config.color} />
          <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color)}>{config.label}</span>
        </div>
        <p className="text-[11px] font-medium text-zinc-700 mt-1 truncate">{node.name}</p>
        <p className="text-[9px] text-zinc-400">{node.type}</p>
      </button>

      {expanded && node.changes && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-zinc-200 bg-white shadow-lg z-20 p-2 space-y-1">
          <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Changes</p>
          {node.changes.map((c, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <Edit3 size={8} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-zinc-600">{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
