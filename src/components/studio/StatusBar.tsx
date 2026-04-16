import React from "react";
import { AlertCircle, CircleCheck, Clock3, GitBranch, Loader2, PlayCircle } from "lucide-react";

interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  zoom: number;
  saving?: boolean;
  workflowStatus?: "active" | "draft" | "paused";
  lastSaved?: string | null;
  hasErrors?: boolean;
  selectedNodeName?: string | null;
  executionOrder?: "v1" | "legacy";
  lastExecutionStatus?: "success" | "failed" | "running" | "paused" | "cancelled" | null;
  lastExecutionDurationMs?: number | null;
  executionCount?: number;
  activeTab?: "editor" | "executions";
}

const formatRelativeTime = (iso: string | null | undefined) => {
  if (!iso) return null;

  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;

  const deltaSeconds = Math.max(0, Math.round((Date.now() - time) / 1000));
  if (deltaSeconds < 10) return "just now";
  if (deltaSeconds < 60) return `${deltaSeconds}s ago`;
  if (deltaSeconds < 3600) return `${Math.round(deltaSeconds / 60)}m ago`;
  return `${Math.round(deltaSeconds / 3600)}h ago`;
};

const StatusBar: React.FC<StatusBarProps> = ({
  nodeCount,
  edgeCount,
  zoom,
  saving,
  workflowStatus = "draft",
  lastSaved,
  hasErrors,
  selectedNodeName,
  executionOrder = "v1",
  lastExecutionStatus,
  lastExecutionDurationMs,
  executionCount = 0,
  activeTab = "editor",
}) => {
  const savedLabel = formatRelativeTime(lastSaved);

  return (
    <div className="h-6 flex items-center justify-between px-4 bg-white border-t border-slate-100 shrink-0 text-[10px]">
      <div className="flex items-center gap-3">
        {saving ? (
          <span className="flex items-center gap-1 text-amber-500">
            <Loader2 size={9} className="animate-spin" />
            Saving
          </span>
        ) : hasErrors ? (
          <span className="flex items-center gap-1 text-red-400">
            <AlertCircle size={9} />
            Attention needed
          </span>
        ) : lastExecutionStatus === "failed" ? (
          <span className="flex items-center gap-1 text-red-400">
            <PlayCircle size={9} />
            Last run failed
          </span>
        ) : lastExecutionStatus === "success" ? (
          <span className="flex items-center gap-1 text-emerald-500">
            <PlayCircle size={9} />
            Last run succeeded
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-500">
            <CircleCheck size={9} />
            Ready
          </span>
        )}
        <div className="h-2.5 w-px bg-slate-150" />
        <span className="text-slate-400">{nodeCount} nodes</span>
        <span className="text-slate-400">{edgeCount} edges</span>
        <span className={`px-1.5 py-px rounded text-[9px] font-medium ${
          workflowStatus === "active" ? "bg-emerald-50 text-emerald-600" :
          workflowStatus === "paused" ? "bg-amber-50 text-amber-600" :
          "bg-slate-50 text-slate-400"
        }`}>
          {workflowStatus}
        </span>
        <span className="inline-flex items-center gap-1 text-slate-400">
          <GitBranch size={9} />
          Order {executionOrder}
        </span>
        {selectedNodeName && (
          <span className="text-slate-400 truncate max-w-[180px]">Selected {selectedNodeName}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-slate-400">{activeTab === "executions" ? "Run history" : "Editor"}</span>
        <span className="text-slate-400">{executionCount} runs</span>
        {savedLabel && (
          <span className="text-slate-400">Saved {savedLabel}</span>
        )}
        {typeof lastExecutionDurationMs === "number" && lastExecutionStatus && (
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Clock3 size={9} />
            {lastExecutionDurationMs}ms
          </span>
        )}
        <span className="text-slate-300">Ctrl+S &middot; Ctrl+Enter &middot; Del</span>
        <span className="text-slate-400 font-mono text-[9px]">{zoom}%</span>
      </div>
    </div>
  );
};

export default StatusBar;
