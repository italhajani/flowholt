import { useState } from "react";
import {
  Clock, Play, CheckCircle2, XCircle, Pause, SkipForward,
  ChevronRight, ZoomIn, ZoomOut, Maximize2, Filter,
  AlertTriangle, Zap, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mock execution timeline data ── */
interface TimelineNode {
  id: string;
  name: string;
  startMs: number;
  durationMs: number;
  status: "success" | "error" | "running" | "skipped" | "waiting";
  branch?: string;
  depth: number;
  items: number;
  retries?: number;
}

const totalDurationMs = 4850;

const timelineNodes: TimelineNode[] = [
  { id: "n1", name: "Typeform Trigger", startMs: 0, durationMs: 120, status: "success", depth: 0, items: 1 },
  { id: "n2", name: "Clearbit Enrich", startMs: 140, durationMs: 850, status: "success", depth: 0, items: 1 },
  { id: "n3", name: "GPT-4o Score Lead", startMs: 1010, durationMs: 2100, status: "success", depth: 0, items: 1 },
  { id: "n4", name: "IF Score > 70", startMs: 3130, durationMs: 12, status: "success", depth: 0, items: 1 },
  // True branch
  { id: "n5", name: "Create in HubSpot", startMs: 3160, durationMs: 450, status: "success", depth: 1, branch: "true", items: 1 },
  { id: "n6", name: "Slack Notification", startMs: 3160, durationMs: 230, status: "success", depth: 1, branch: "true", items: 1 },
  // False branch
  { id: "n7", name: "Add to Nurture List", startMs: 3160, durationMs: 320, status: "skipped", depth: 1, branch: "false", items: 0 },
  { id: "n8", name: "Schedule Follow-up", startMs: 3500, durationMs: 0, status: "skipped", depth: 1, branch: "false", items: 0 },
  // After merge
  { id: "n9", name: "Error Handler", startMs: 3630, durationMs: 45, status: "success", depth: 0, items: 1 },
  { id: "n10", name: "Log to Database", startMs: 3700, durationMs: 1150, status: "error", depth: 0, items: 1, retries: 2 },
];

const criticalPath = ["n1", "n2", "n3", "n4", "n5", "n9", "n10"];

/* ── Status config ── */
const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  success: { color: "text-emerald-600", bg: "bg-emerald-400", icon: CheckCircle2, label: "Success" },
  error: { color: "text-red-600", bg: "bg-red-400", icon: XCircle, label: "Error" },
  running: { color: "text-blue-600", bg: "bg-blue-400", icon: Play, label: "Running" },
  skipped: { color: "text-zinc-400", bg: "bg-zinc-300", icon: SkipForward, label: "Skipped" },
  waiting: { color: "text-amber-600", bg: "bg-amber-400", icon: Pause, label: "Waiting" },
};

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

export function ExecutionTimelinePage() {
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const barWidth = 600 * zoom;
  const rowHeight = 32;

  // Execution stats
  const successCount = timelineNodes.filter(n => n.status === "success").length;
  const errorCount = timelineNodes.filter(n => n.status === "error").length;
  const skippedCount = timelineNodes.filter(n => n.status === "skipped").length;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Execution Timeline</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Execution #48291 — Lead Scoring Pipeline —{" "}
            <span className="text-emerald-600 font-medium">Completed in {formatMs(totalDurationMs)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCriticalPath(!showCriticalPath)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              showCriticalPath ? "border-red-200 bg-red-50 text-red-600" : "border-zinc-200 bg-white text-zinc-600"
            )}
          >
            <Zap size={12} />
            Critical Path
          </button>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-0.5">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
              <ZoomOut size={12} />
            </button>
            <span className="text-[10px] text-zinc-500 w-8 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
              <ZoomIn size={12} />
            </button>
            <button onClick={() => setZoom(1)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
              <Maximize2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6">
        {[
          { label: "Total Time", value: formatMs(totalDurationMs), icon: Clock, color: "text-zinc-700" },
          { label: "Nodes", value: timelineNodes.length.toString(), icon: Zap, color: "text-zinc-700" },
          { label: "Succeeded", value: successCount.toString(), icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Failed", value: errorCount.toString(), icon: XCircle, color: "text-red-600" },
          { label: "Skipped", value: skippedCount.toString(), icon: SkipForward, color: "text-zinc-400" },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2">
            <stat.icon size={14} className={stat.color} />
            <div>
              <p className={cn("text-sm font-bold", stat.color)}>{stat.value}</p>
              <p className="text-[9px] text-zinc-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gantt chart */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {/* Time axis */}
        <div className="flex border-b border-zinc-100 bg-zinc-50 sticky top-0 z-10">
          <div className="w-52 flex-shrink-0 px-3 py-2 text-[9px] font-medium text-zinc-500 border-r border-zinc-200">
            Node
          </div>
          <div className="flex-1 relative overflow-x-auto">
            <div style={{ width: barWidth }} className="flex items-center h-8">
              {Array.from({ length: Math.ceil(totalDurationMs / 1000) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${(i * 1000 / totalDurationMs) * barWidth}px` }}
                >
                  <div className="h-3 w-px bg-zinc-200" />
                  <span className="text-[7px] text-zinc-400 mt-0.5">{i}s</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="overflow-x-auto">
          {timelineNodes.map(node => {
            const cfg = statusConfig[node.status];
            const isCritical = showCriticalPath && criticalPath.includes(node.id);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;

            return (
              <div
                key={node.id}
                className={cn(
                  "flex items-center border-b border-zinc-50 transition-colors cursor-pointer",
                  isSelected && "bg-blue-50",
                  isHovered && !isSelected && "bg-zinc-50"
                )}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                style={{ height: rowHeight }}
              >
                {/* Node name */}
                <div className="w-52 flex-shrink-0 px-3 flex items-center gap-2 border-r border-zinc-100">
                  <div style={{ width: node.depth * 16 }} />
                  {node.branch && (
                    <span className={cn(
                      "rounded px-1 py-0 text-[7px] font-bold border",
                      node.branch === "true" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-zinc-100 text-zinc-400 border-zinc-200"
                    )}>
                      {node.branch}
                    </span>
                  )}
                  <cfg.icon size={10} className={cfg.color} />
                  <span className={cn(
                    "text-[10px] truncate",
                    node.status === "error" ? "text-red-600 font-medium" : "text-zinc-700"
                  )}>
                    {node.name}
                  </span>
                  {node.retries && (
                    <span className="text-[7px] text-amber-500 font-bold">×{node.retries}</span>
                  )}
                </div>

                {/* Gantt bar */}
                <div className="flex-1 relative px-2" style={{ minWidth: barWidth }}>
                  {/* Critical path guide line */}
                  {isCritical && (
                    <div
                      className="absolute top-0 bottom-0 border-l border-dashed border-red-200"
                      style={{ left: `${(node.startMs / totalDurationMs) * barWidth + 8}px` }}
                    />
                  )}

                  {/* Bar */}
                  <div
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 rounded-sm transition-all",
                      cfg.bg,
                      isHovered && "ring-2 ring-offset-1 ring-zinc-300",
                      isCritical && "ring-1 ring-red-300",
                      node.status === "skipped" && "opacity-40"
                    )}
                    style={{
                      left: `${(node.startMs / totalDurationMs) * barWidth + 8}px`,
                      width: `${Math.max(4, (node.durationMs / totalDurationMs) * barWidth)}px`,
                      height: `${rowHeight * 0.5}px`,
                    }}
                  />

                  {/* Duration label */}
                  {node.durationMs > 0 && (
                    <span
                      className="absolute top-1/2 -translate-y-1/2 text-[8px] text-zinc-400 whitespace-nowrap"
                      style={{
                        left: `${((node.startMs + node.durationMs) / totalDurationMs) * barWidth + 14}px`,
                      }}
                    >
                      {formatMs(node.durationMs)}
                      {node.items > 0 && ` · ${node.items} item${node.items > 1 ? "s" : ""}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom time ruler */}
        <div className="border-t border-zinc-200 bg-zinc-50 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1 text-[9px] text-zinc-500">
                <span className={cn("h-2 w-4 rounded-sm", cfg.bg)} />
                {cfg.label}
              </span>
            ))}
          </div>
          <span className="text-[9px] text-zinc-400">
            Parallel branches shown as concurrent rows
          </span>
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (() => {
        const node = timelineNodes.find(n => n.id === selectedNode);
        if (!node) return null;
        const cfg = statusConfig[node.status];
        return (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <cfg.icon size={16} className={cfg.color} />
              <div>
                <p className="text-sm font-semibold text-zinc-800">{node.name}</p>
                <p className="text-xs text-zinc-400">Node {node.id} · {cfg.label}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Start Time</p>
                <p className="text-sm font-bold text-zinc-700">{formatMs(node.startMs)}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Duration</p>
                <p className="text-sm font-bold text-zinc-700">{formatMs(node.durationMs)}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Items Processed</p>
                <p className="text-sm font-bold text-zinc-700">{node.items}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider">% of Total</p>
                <p className="text-sm font-bold text-zinc-700">{((node.durationMs / totalDurationMs) * 100).toFixed(1)}%</p>
              </div>
            </div>
            {node.retries && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                <AlertTriangle size={12} className="text-amber-500" />
                <span className="text-[10px] text-amber-700">
                  This node was retried {node.retries} time{node.retries > 1 ? "s" : ""} before succeeding
                </span>
              </div>
            )}
            {criticalPath.includes(node.id) && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5">
                <Zap size={12} className="text-red-500" />
                <span className="text-[10px] text-red-700">
                  This node is on the critical path — optimizing it will reduce total execution time
                </span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
