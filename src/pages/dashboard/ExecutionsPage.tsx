import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle2, XCircle, Play, Clock, ChevronRight, Webhook, CalendarClock, MousePointerClick, Activity, AlertTriangle, Workflow, ExternalLink, Trash2 } from "lucide-react";
import { api, type ApiExecution } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { TableLoader } from "@/components/dashboard/DashboardRouteLoader";

interface Execution {
  id: string;
  workflowName: string;
  status: "success" | "failed" | "running";
  duration: string;
  triggeredAt: string;
  triggerType: "webhook" | "schedule" | "manual" | "event";
  steps?: { name: string; status: "success" | "failed" | "skipped"; duration: string }[];
}

const statusIcons = { success: CheckCircle2, failed: XCircle, running: Play };
const badgeStyling = {
  success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  failed: "bg-red-50 text-red-600 border-red-100",
  running: "bg-amber-50 text-amber-600 border-amber-100 animate-pulse",
};
const triggerIcons = { webhook: Webhook, schedule: CalendarClock, manual: MousePointerClick, event: Play };

type StatusFilter = "all" | "success" | "failed" | "running";

const ExecutionsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingDeleteExecution, setPendingDeleteExecution] = useState<Execution | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const queryClient = useQueryClient();
  const { data: executions = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["executions"],
    queryFn: () => api.listExecutions().then((data) => data.map(mapExecution)),
  });
  const error = queryError ? "Could not load executions" : null;
  const navigate = useNavigate();

  const handleDeleteExecution = async () => {
    if (!pendingDeleteExecution) return;
    try {
      setDeletePending(true);
      await api.deleteExecution(pendingDeleteExecution.id);
      queryClient.invalidateQueries({ queryKey: ["executions"] });
      setExpandedId((current) => (current === pendingDeleteExecution.id ? null : current));
      toast({
        title: "Execution deleted",
        description: `${pendingDeleteExecution.workflowName} was removed from the run history.`,
      });
      setPendingDeleteExecution(null);
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete execution.",
        variant: "destructive",
      });
    } finally {
      setDeletePending(false);
    }
  };

  const filtered = executions.filter((ex) => {
    const matchesSearch = ex.workflowName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ex.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const metrics = useMemo(() => ({
    total: executions.length,
    success: executions.filter((item) => item.status === "success").length,
    failed: executions.filter((item) => item.status === "failed").length,
    running: executions.filter((item) => item.status === "running").length,
  }), [executions]);

  return (
    loading ? (
      <TableLoader titleWidth="220px" />
    ) : (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in pb-24">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Executions</h1>
          <p className="text-[14px] text-slate-500 mt-2">Trace workflow runs, inspect failures, and confirm live automation health.</p>
        </div>
        <button className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Export logs
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-slate-500">Total runs</span>
            <Workflow size={14} className="text-slate-500" />
          </div>
          <div className="text-[24px] font-bold text-slate-900">{metrics.total}</div>
          <div className="text-[13px] text-slate-500">Across active and draft workflows</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-slate-500">Successful</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div className="text-[24px] font-bold text-slate-900">{metrics.success}</div>
          <div className="text-[13px] text-slate-500">Completed without issues</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-slate-500">Failed</span>
            <AlertTriangle size={14} className="text-red-500" />
          </div>
          <div className="text-[24px] font-bold text-slate-900">{metrics.failed}</div>
          <div className="text-[13px] text-slate-500">Need review or retry</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-slate-500">Running now</span>
            <Activity size={14} className="text-amber-500" />
          </div>
          <div className="text-[24px] font-bold text-slate-900">{metrics.running}</div>
          <div className="text-[13px] text-slate-500">Currently in progress</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 transition-all w-72 bg-white">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by workflow name or execution ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-[12px] bg-transparent outline-none placeholder-slate-400 text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg p-1 overflow-hidden">
          {(["all", "success", "failed", "running"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors duration-150 capitalize",
                statusFilter === f
                  ? "bg-white text-slate-900 border border-slate-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">{error}</div>
      ) : (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[3fr_120px_100px_160px_160px_50px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50 sticky top-0">
          {["Execution context", "Status", "Duration", "Trigger", "Timestamp", ""].map(h => (
            <span key={h} className="text-[11px] font-semibold text-slate-500">{h}</span>
          ))}
        </div>
        
        <div className="divide-y divide-slate-100/60">
          {filtered.map((ex) => {
            const StatusIcon = statusIcons[ex.status];
            const TriggerIcon = triggerIcons[ex.triggerType as keyof typeof triggerIcons] || Webhook;
            const isExpanded = expandedId === ex.id;

            return (
              <div key={ex.id} className="flex flex-col">
                <div
                  className={cn(
                    "grid grid-cols-[3fr_120px_100px_160px_160px_50px] gap-4 px-5 py-3.5 items-center transition-colors duration-150 cursor-pointer hover:bg-slate-50 group",
                    isExpanded && "bg-slate-50/80 hover:bg-slate-50"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                >
                  {/* Context */}
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <button className={cn("p-0.5 rounded transition-transform duration-200 text-slate-400 hover:bg-slate-200/50", isExpanded && "rotate-90")}>
                      <ChevronRight size={14} />
                    </button>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{ex.workflowName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {ex.id.padEnd(8, '0')}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", badgeStyling[ex.status])}>
                      <StatusIcon size={10} strokeWidth={3} />
                      {ex.status}
                    </span>
                  </div>

                  {/* Duration */}
                  <span className="text-[12px] text-slate-600 font-mono">{ex.duration}</span>

                  {/* Trigger */}
                  <div className="flex items-center gap-2 text-[12px] font-medium text-slate-600">
                    <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <TriggerIcon size={12} className="text-slate-500" />
                    </div>
                    <span className="capitalize">{ex.triggerType}</span>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                    <Clock size={11} className="text-slate-400" />
                    {ex.triggeredAt}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete execution"
                      disabled={deletePending}
                      onClick={() => setPendingDeleteExecution(ex)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded Steps */}
                {isExpanded && ex.steps && (
                  <div className="px-5 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between ml-8 mb-3">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Step timeline</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/executions/${ex.id}`); }}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-[#103b71] hover:text-[#0d2f5c] transition-colors"
                      >
                        <ExternalLink size={11} />
                        Full Inspector
                      </button>
                    </div>
                    <div className="ml-8 border-l border-slate-200 pl-6 py-2 pb-0 space-y-4">
                      {ex.steps.map((step, si) => (
                        <div key={si} className="flex items-center gap-4 relative">
                          <div className="absolute top-1/2 -left-6 w-6 h-px bg-slate-200" />
                          <div className={cn(
                            "absolute top-1/2 -left-[27px] w-2 h-2 rounded-full -translate-y-1/2 z-10 border-2 border-white",
                             step.status === "success" ? "bg-emerald-500 ring-2 ring-emerald-500/20" :
                             step.status === "failed" ? "bg-red-500 ring-2 ring-red-500/20" :
                             "bg-slate-300 ring-2 ring-slate-200"
                          )} />
                          
                          <div className="flex-1 flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200">
                            <span className="text-[12px] font-medium text-slate-900">{step.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{step.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
      <AlertDialog open={pendingDeleteExecution != null} onOpenChange={(open) => {
        if (!open && !deletePending) setPendingDeleteExecution(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete execution record?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteExecution
                ? `This will permanently remove the ${pendingDeleteExecution.workflowName} execution from history.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePending}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteExecution();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    )
  );
};

export default ExecutionsPage;

function mapExecution(item: ApiExecution): Execution {
  return {
    id: item.id,
    workflowName: item.workflow_name,
    status: item.status,
    duration: item.duration_ms == null ? "â€”" : `${(item.duration_ms / 1000).toFixed(1)}s`,
    triggeredAt: formatRelativeTime(item.started_at),
    triggerType: item.trigger_type,
    steps: item.steps.map((step) => ({
      name: step.name,
      status: step.status === "running" ? "skipped" : step.status,
      duration: `${step.duration_ms}ms`,
    })),
  };
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
