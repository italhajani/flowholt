import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Shield,
  Clock,
  User,
  GitBranch,
  Play,
  Settings,
  KeyRound,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
} from "lucide-react";
import { api, type ApiAuditEvent } from "@/lib/api";
import { TableLoader } from "@/components/dashboard/DashboardRouteLoader";

const actionIcons: Record<string, React.ElementType> = {
  workflow: GitBranch,
  execution: Play,
  vault: KeyRound,
  workspace: Settings,
  system: Shield,
};

const statusBadge: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  failed: "bg-red-50 text-red-600 border-red-100",
  warning: "bg-amber-50 text-amber-600 border-amber-100",
  info: "bg-blue-50 text-blue-600 border-blue-100",
};

const statusIcons: Record<string, React.ElementType> = {
  success: CheckCircle2,
  failed: XCircle,
  warning: AlertTriangle,
};

type EventFilter = "all" | "workspace" | "workflow" | "execution" | "vault" | "system";

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

function actionLabel(action: string): string {
  return action
    .replace(/\./g, " → ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActionCategory(action: string): string {
  const parts = action.split(".");
  return parts[0] || "system";
}

const AuditLogPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EventFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: events = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["audit-events"],
    queryFn: () => api.listAuditEvents(),
  });
  const error = queryError ? "Could not load audit events" : null;

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.action.toLowerCase().includes(search.toLowerCase()) ||
        (ev.actor_email || "").toLowerCase().includes(search.toLowerCase()) ||
        (ev.target_id || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || getActionCategory(ev.action) === filter;
      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  const metrics = useMemo(() => ({
    total: events.length,
    success: events.filter((e) => e.status === "success").length,
    failed: events.filter((e) => e.status === "failed").length,
    actors: new Set(events.map((e) => e.actor_email || e.actor_user_id).filter(Boolean)).size,
  }), [events]);

  if (loading) return <TableLoader titleWidth="220px" />;

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Audit Log</h1>
          <p className="text-[14px] text-slate-500 mt-2">
            Complete activity trail — every action, who did it, and when.
          </p>
        </div>
        <button className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total events", value: metrics.total, icon: Shield, color: "text-slate-500" },
          { label: "Successful", value: metrics.success, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Failed", value: metrics.failed, icon: XCircle, color: "text-red-500" },
          { label: "Unique actors", value: metrics.actors, icon: User, color: "text-blue-500" },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-slate-500">{m.label}</span>
              <m.icon size={14} className={m.color} />
            </div>
            <div className="text-[24px] font-bold text-slate-900">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white w-72">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by action, actor, or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-[12px] bg-transparent outline-none placeholder-slate-400 text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg p-1 overflow-hidden">
          {(["all", "workspace", "workflow", "execution", "vault", "system"] as EventFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors duration-150 capitalize",
                filter === f
                  ? "bg-white text-slate-900 border border-slate-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">{error}</div>
      ) : (
        /* Events table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[2.5fr_1.5fr_100px_120px_140px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50 sticky top-0">
            {["Action", "Actor", "Status", "Target", "Timestamp"].map((h) => (
              <span key={h} className="text-[11px] font-semibold text-slate-500">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-100/60">
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-slate-400">
                No audit events match your filters.
              </div>
            ) : (
              filtered.map((ev) => {
                const category = getActionCategory(ev.action);
                const Icon = actionIcons[category] || Shield;
                const StatusIcon = statusIcons[ev.status] || CheckCircle2;
                const badge = statusBadge[ev.status] || statusBadge.info;
                const isExpanded = expandedId === ev.id;

                return (
                  <div key={ev.id} className="flex flex-col">
                    <div
                      className={cn(
                        "grid grid-cols-[2.5fr_1.5fr_100px_120px_140px] gap-4 px-5 py-3.5 items-center transition-colors duration-150 cursor-pointer hover:bg-slate-50 group",
                        isExpanded && "bg-slate-50/80"
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    >
                      {/* Action */}
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <button className={cn("p-0.5 rounded transition-transform duration-200 text-slate-400", isExpanded && "rotate-90")}>
                          <ChevronRight size={14} />
                        </button>
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <Icon size={13} className="text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-slate-900 truncate">{actionLabel(ev.action)}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ev.id}</div>
                        </div>
                      </div>

                      {/* Actor */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <User size={11} className="text-slate-500" />
                        </div>
                        <span className="text-[12px] text-slate-600 truncate">
                          {ev.actor_email || ev.actor_user_id || "System"}
                        </span>
                      </div>

                      {/* Status */}
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border w-fit", badge)}>
                        <StatusIcon size={10} strokeWidth={3} />
                        {ev.status}
                      </span>

                      {/* Target */}
                      <span className="text-[12px] text-slate-500 truncate capitalize">{ev.target_type}</span>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                        <Clock size={11} className="text-slate-400" />
                        {formatRelativeTime(ev.created_at)}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
                        <div className="ml-8 bg-white rounded-lg border border-slate-200 p-4">
                          <div className="grid grid-cols-2 gap-4 text-[12px]">
                            <div>
                              <span className="text-slate-400 font-medium">Target ID</span>
                              <p className="text-slate-700 font-mono mt-1">{ev.target_id || "—"}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium">Event Time</span>
                              <p className="text-slate-700 mt-1">{new Date(ev.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          {ev.details && Object.keys(ev.details).length > 0 && (
                            <div className="mt-4">
                              <span className="text-[11px] text-slate-400 font-medium">Details</span>
                              <pre className="mt-2 text-[11px] text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200 overflow-x-auto">
                                {JSON.stringify(ev.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
