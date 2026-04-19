import { useState } from "react";
import {
  ChevronRight, ChevronDown, Search, Eye, EyeOff, Zap, GitBranch,
  Code2, Bot, Mail, Database, Clock, Filter, MapPin, Layers, Map,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── mock workflow tree ── */
interface OutlineNode {
  id: string;
  name: string;
  family: string;
  status: "idle" | "success" | "error" | "disabled" | "running";
  children?: OutlineNode[];
  branch?: string;
}

const workflowTree: OutlineNode[] = [
  { id: "n1", name: "Typeform Trigger", family: "trigger", status: "success" },
  { id: "n2", name: "Clearbit Enrich", family: "integration", status: "success" },
  { id: "n3", name: "Score Lead (GPT-4o)", family: "ai", status: "success" },
  {
    id: "n4", name: "IF Score > 70", family: "logic", status: "success",
    children: [
      {
        id: "branch-true", name: "True Branch", family: "logic", status: "success", branch: "true",
        children: [
          { id: "n5", name: "Create in HubSpot", family: "integration", status: "success" },
          { id: "n6", name: "Slack Notification", family: "integration", status: "success" },
        ],
      },
      {
        id: "branch-false", name: "False Branch", family: "logic", status: "idle", branch: "false",
        children: [
          { id: "n7", name: "Add to Nurture List", family: "integration", status: "idle" },
          { id: "n8", name: "Schedule Follow-up", family: "logic", status: "disabled" },
        ],
      },
    ],
  },
  { id: "n9", name: "Error Handler", family: "logic", status: "idle" },
  { id: "n10", name: "Log to Database", family: "integration", status: "error" },
];

/* ── node map stats ── */
const mapStats = {
  totalNodes: 10,
  triggers: 1,
  actions: 5,
  logic: 3,
  ai: 1,
  branches: 2,
  depth: 4,
};

/* ── family icons ── */
const familyIcon: Record<string, typeof Zap> = {
  trigger: Zap,
  integration: Mail,
  ai: Bot,
  logic: GitBranch,
  code: Code2,
  data: Database,
};

const familyDot: Record<string, string> = {
  trigger: "bg-green-400",
  integration: "bg-blue-400",
  ai: "bg-violet-400",
  logic: "bg-amber-400",
  code: "bg-zinc-400",
  data: "bg-emerald-400",
};

const statusIndicator: Record<string, JSX.Element> = {
  success: <CheckCircle2 size={9} className="text-emerald-500" />,
  error: <AlertTriangle size={9} className="text-red-500" />,
  running: <Clock size={9} className="text-blue-500 animate-pulse" />,
  disabled: <EyeOff size={9} className="text-zinc-300" />,
  idle: <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />,
};

/* ── Tree Node component ── */
function TreeNode({ node, depth = 0, onJump, filter }: {
  node: OutlineNode; depth?: number; onJump: (id: string) => void; filter: string;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = familyIcon[node.family] || Code2;
  const dot = familyDot[node.family] || "bg-zinc-400";

  // Filter matching
  if (filter && !node.name.toLowerCase().includes(filter.toLowerCase())) {
    if (hasChildren) {
      const anyChildMatch = node.children!.some(function matches(c: OutlineNode): boolean {
        if (c.name.toLowerCase().includes(filter.toLowerCase())) return true;
        return c.children?.some(matches) ?? false;
      });
      if (!anyChildMatch) return null;
    } else {
      return null;
    }
  }

  return (
    <div>
      <button
        onClick={() => hasChildren ? setOpen(!open) : onJump(node.id)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors hover:bg-zinc-100 group",
          node.status === "disabled" && "opacity-50",
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {hasChildren
          ? (open
            ? <ChevronDown size={10} className="text-zinc-400 flex-shrink-0" />
            : <ChevronRight size={10} className="text-zinc-400 flex-shrink-0" />)
          : <span className="w-2.5 flex-shrink-0" />
        }
        {node.branch ? (
          <span className={cn(
            "rounded px-1 py-0 text-[8px] font-bold border",
            node.branch === "true" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-500 border-zinc-200"
          )}>
            {node.branch}
          </span>
        ) : (
          <span className={cn("h-2 w-2 rounded-full flex-shrink-0", dot)} />
        )}
        <span className={cn(
          "text-[11px] truncate flex-1",
          node.status === "error" ? "text-red-600 font-medium" : "text-zinc-700"
        )}>
          {node.name}
        </span>
        <span className="flex-shrink-0">{statusIndicator[node.status]}</span>
        <button
          onClick={e => { e.stopPropagation(); onJump(node.id); }}
          className="rounded p-0.5 text-zinc-300 opacity-0 group-hover:opacity-100 hover:bg-zinc-200 hover:text-zinc-500 transition-all flex-shrink-0"
          title="Jump to node"
        >
          <MapPin size={9} />
        </button>
      </button>
      {open && hasChildren && node.children!.map(child => (
        <TreeNode key={child.id} node={child} depth={depth + 1} onJump={onJump} filter={filter} />
      ))}
    </div>
  );
}

/* ── Main component ── */
interface WorkflowOutlineSidebarProps {
  open: boolean;
  onClose: () => void;
  onJumpToNode?: (nodeId: string) => void;
}

export function WorkflowOutlineSidebar({ open, onClose, onJumpToNode }: WorkflowOutlineSidebarProps) {
  const [view, setView] = useState<"tree" | "map">("tree");
  const [filter, setFilter] = useState("");
  const [showDisabled, setShowDisabled] = useState(true);

  const handleJump = (nodeId: string) => {
    onJumpToNode?.(nodeId);
  };

  const filteredTree = showDisabled
    ? workflowTree
    : workflowTree.filter(n => n.status !== "disabled");

  if (!open) return null;

  return (
    <div className="w-[260px] border-r border-zinc-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Layers size={13} className="text-zinc-500" />
          <span className="text-[12px] font-semibold text-zinc-700">Workflow Outline</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex rounded-md border border-zinc-200 p-0.5">
            <button
              onClick={() => setView("tree")}
              className={cn("rounded p-0.5 transition-colors", view === "tree" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600")}
              title="Tree view"
            >
              <GitBranch size={10} />
            </button>
            <button
              onClick={() => setView("map")}
              className={cn("rounded p-0.5 transition-colors", view === "map" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600")}
              title="Map view"
            >
              <Map size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-zinc-100">
        <div className="relative">
          <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter nodes…"
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1 pl-6 pr-2 text-[10px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
          />
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={() => setShowDisabled(!showDisabled)}
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] transition-colors",
              showDisabled ? "bg-zinc-100 text-zinc-600" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {showDisabled ? <Eye size={8} /> : <EyeOff size={8} />}
            {showDisabled ? "Show disabled" : "Hidden disabled"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-1">
        {view === "tree" ? (
          <div className="space-y-0.5">
            {filteredTree.map(node => (
              <TreeNode key={node.id} node={node} onJump={handleJump} filter={filter} />
            ))}
          </div>
        ) : (
          /* Map view */
          <div className="p-3 space-y-3">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Nodes", value: mapStats.totalNodes, color: "text-zinc-700" },
                { label: "Triggers", value: mapStats.triggers, color: "text-green-600" },
                { label: "Actions", value: mapStats.actions, color: "text-blue-600" },
                { label: "Logic", value: mapStats.logic, color: "text-amber-600" },
                { label: "AI", value: mapStats.ai, color: "text-violet-600" },
                { label: "Branches", value: mapStats.branches, color: "text-orange-600" },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2 text-center">
                  <p className={cn("text-[14px] font-bold", s.color)}>{s.value}</p>
                  <p className="text-[8px] text-zinc-400 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Branch density heatmap */}
            <div>
              <p className="text-[9px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Branch Density</p>
              <div className="space-y-1">
                {[
                  { label: "Depth 1: Trigger", density: 0.1 },
                  { label: "Depth 2: Enrich + Score", density: 0.3 },
                  { label: "Depth 3: IF Branch (2 paths)", density: 0.8 },
                  { label: "Depth 4: Actions (4 nodes)", density: 0.6 },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 w-[130px] truncate">{d.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          d.density > 0.7 ? "bg-red-400" : d.density > 0.4 ? "bg-amber-400" : "bg-emerald-400"
                        )}
                        style={{ width: `${d.density * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Node type distribution */}
            <div>
              <p className="text-[9px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Node Distribution</p>
              <div className="flex gap-1">
                {[
                  { label: "Trigger", count: 1, color: "bg-green-400" },
                  { label: "Integration", count: 5, color: "bg-blue-400" },
                  { label: "Logic", count: 3, color: "bg-amber-400" },
                  { label: "AI", count: 1, color: "bg-violet-400" },
                ].map(t => (
                  <div
                    key={t.label}
                    className={cn("rounded-sm h-6", t.color)}
                    style={{ flex: t.count }}
                    title={`${t.label}: ${t.count} nodes`}
                  />
                ))}
              </div>
              <div className="flex gap-3 mt-1.5">
                {[
                  { label: "Trigger", color: "bg-green-400" },
                  { label: "Integration", color: "bg-blue-400" },
                  { label: "Logic", color: "bg-amber-400" },
                  { label: "AI", color: "bg-violet-400" },
                ].map(t => (
                  <div key={t.label} className="flex items-center gap-1">
                    <span className={cn("h-1.5 w-1.5 rounded-full", t.color)} />
                    <span className="text-[8px] text-zinc-400">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution flow summary */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
              <p className="text-[9px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">Flow Summary</p>
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Trigger → Enrich → AI Score → Branch (2 paths) → 4 actions.
                Max depth: {mapStats.depth}. {mapStats.branches} conditional branches.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 px-3 py-2 flex items-center justify-between">
        <span className="text-[9px] text-zinc-400">{mapStats.totalNodes} nodes · {mapStats.branches} branches</span>
        <button className="text-[9px] text-blue-600 hover:text-blue-700 font-medium transition-colors">
          Fit to view
        </button>
      </div>
    </div>
  );
}
