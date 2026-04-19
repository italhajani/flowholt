import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, Search, CheckCircle2, XCircle, Clock, RotateCcw, Loader2,
  GitBranch, Zap, Globe, RefreshCw, Calendar, Filter, ChevronDown,
  Pause, StopCircle, BarChart3, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

interface Execution {
  id: string;
  workflowName: string;
  status: "success" | "failed" | "active" | "paused";
  trigger: "Manual" | "Webhook" | "Schedule";
  duration: string;
  durationMs: number;
  startedAt: string;
  steps: number;
  stepsCompleted: number;
  env: "production" | "staging" | "draft";
  credits: number;
}

const mockExecutions: Execution[] = [
  { id: "ex-1", workflowName: "Lead Qualification Pipeline", status: "success", trigger: "Webhook", duration: "4.2s", durationMs: 4200, startedAt: "2 min ago", steps: 7, stepsCompleted: 7, env: "production", credits: 42 },
  { id: "ex-2", workflowName: "Error Alert Handler", status: "failed", trigger: "Schedule", duration: "1.8s", durationMs: 1800, startedAt: "12 min ago", steps: 4, stepsCompleted: 2, env: "production", credits: 8 },
  { id: "ex-3", workflowName: "Slack → Sheets Logger", status: "success", trigger: "Webhook", duration: "0.9s", durationMs: 900, startedAt: "15 min ago", steps: 3, stepsCompleted: 3, env: "production", credits: 3 },
  { id: "ex-4", workflowName: "Invoice Processing Pipeline", status: "active", trigger: "Manual", duration: "—", durationMs: 0, startedAt: "Just now", steps: 5, stepsCompleted: 2, env: "staging", credits: 0 },
  { id: "ex-5", workflowName: "Daily Report Generator", status: "success", trigger: "Schedule", duration: "12.1s", durationMs: 12100, startedAt: "1 hr ago", steps: 9, stepsCompleted: 9, env: "production", credits: 87 },
  { id: "ex-6", workflowName: "PR Review Notifier", status: "success", trigger: "Webhook", duration: "2.3s", durationMs: 2300, startedAt: "2 hrs ago", steps: 4, stepsCompleted: 4, env: "production", credits: 12 },
  { id: "ex-7", workflowName: "Customer Onboarding Flow", status: "failed", trigger: "Manual", duration: "6.7s", durationMs: 6700, startedAt: "3 hrs ago", steps: 8, stepsCompleted: 5, env: "production", credits: 31 },
  { id: "ex-8", workflowName: "Lead Qualification Pipeline", status: "success", trigger: "Webhook", duration: "3.9s", durationMs: 3900, startedAt: "4 hrs ago", steps: 7, stepsCompleted: 7, env: "production", credits: 38 },
  { id: "ex-9", workflowName: "Email Campaign Automation", status: "success", trigger: "Schedule", duration: "8.4s", durationMs: 8400, startedAt: "5 hrs ago", steps: 6, stepsCompleted: 6, env: "production", credits: 54 },
  { id: "ex-10", workflowName: "Data Sync Pipeline", status: "paused", trigger: "Schedule", duration: "—", durationMs: 0, startedAt: "6 hrs ago", steps: 12, stepsCompleted: 7, env: "staging", credits: 0 },
];

const triggerIcons: Record<string, React.ElementType> = { Manual: Zap, Webhook: Globe, Schedule: Clock };

/* Duration waterfall bar */
function DurationBar({ durationMs, maxMs, status }: { durationMs: number; maxMs: number; status: string }) {
  if (durationMs === 0) return <span className="text-[11px] text-zinc-300">—</span>;
  const pct = Math.max(4, (durationMs / maxMs) * 100);
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            status === "failed" ? "bg-red-400" : status === "active" ? "bg-blue-400" : "bg-emerald-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("text-[11px] font-mono tabular-nums w-12 text-right", status === "active" ? "text-blue-500" : "text-zinc-500")}>
        {status === "active" ? <Loader2 size={10} className="animate-spin inline mr-0.5" /> : null}
        {durationMs > 0 ? `${(durationMs / 1000).toFixed(1)}s` : "—"}
      </span>
    </div>
  );
}

/* Step progress pill */
function StepProgress({ completed, total, status }: { completed: number; total: number; status: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-px">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              i < completed
                ? status === "failed" && i === completed - 1 ? "bg-red-400" : "bg-emerald-400"
                : status === "active" && i === completed ? "bg-blue-400 animate-pulse" : "bg-zinc-200"
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-zinc-400">{completed}/{total}</span>
    </div>
  );
}

const maxDurationMs = Math.max(...mockExecutions.map((e) => e.durationMs));

const columns: Column<Execution>[] = [
  {
    id: "workflow",
    header: "Workflow",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <GitBranch size={13} className="text-zinc-400 flex-shrink-0" />
        <span className="font-medium text-zinc-800 truncate">{row.workflowName}</span>
      </div>
    ),
  },
  { id: "status", header: "Status", sortable: true, accessor: (row) => <StatusDot status={row.status} /> },
  {
    id: "trigger",
    header: "Trigger",
    hideBelow: "md",
    accessor: (row) => {
      const Icon = triggerIcons[row.trigger];
      return (
        <span className="flex items-center gap-1 text-zinc-500">
          <Icon size={11} className="text-zinc-300" />
          {row.trigger}
        </span>
      );
    },
  },
  {
    id: "duration",
    header: "Duration",
    sortable: true,
    hideBelow: "md",
    accessor: (row) => <DurationBar durationMs={row.durationMs} maxMs={maxDurationMs} status={row.status} />,
  },
  {
    id: "steps",
    header: "Steps",
    hideBelow: "lg",
    accessor: (row) => <StepProgress completed={row.stepsCompleted} total={row.steps} status={row.status} />,
  },
  {
    id: "env",
    header: "Env",
    hideBelow: "lg",
    accessor: (row) => (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
        row.env === "production" ? "bg-green-50 text-green-700" : row.env === "staging" ? "bg-blue-50 text-blue-700" : "bg-zinc-100 text-zinc-500"
      )}>
        <span className={cn("h-1 w-1 rounded-full", row.env === "production" ? "bg-green-500" : row.env === "staging" ? "bg-blue-500" : "bg-zinc-400")} />
        {row.env}
      </span>
    ),
  },
  {
    id: "started",
    header: "Started",
    sortable: true,
    hideBelow: "lg",
    accessor: (row) => <span className="text-zinc-500">{row.startedAt}</span>,
  },
  {
    id: "actions",
    header: "",
    className: "w-24",
    accessor: (row) => (
      <div className="flex items-center gap-1">
        {row.status === "failed" && (
          <Button variant="ghost" size="sm" className="text-[11px]">
            <RefreshCw size={10} /> Retry
          </Button>
        )}
        {row.status === "active" && (
          <Button variant="ghost" size="sm" className="text-[11px] text-red-500">
            <StopCircle size={10} /> Stop
          </Button>
        )}
      </div>
    ),
  },
];

const filters = ["All", "Running", "Success", "Failed", "Waiting"] as const;
type Filter = (typeof filters)[number];
const statusMap: Record<string, string> = { Running: "active", Success: "success", Failed: "failed", Waiting: "paused" };

const dateRanges = ["Last hour", "Last 24h", "Last 7d", "Last 30d", "Custom"] as const;

/* Sparkline chart data */
const sparklineData = [
  { h: "00", s: 12, f: 1 }, { h: "02", s: 8, f: 0 }, { h: "04", s: 3, f: 0 },
  { h: "06", s: 5, f: 1 }, { h: "08", s: 24, f: 2 }, { h: "10", s: 31, f: 1 },
  { h: "12", s: 28, f: 3 }, { h: "14", s: 35, f: 2 }, { h: "16", s: 22, f: 1 },
  { h: "18", s: 18, f: 0 }, { h: "20", s: 14, f: 1 }, { h: "22", s: 9, f: 0 },
];

function ExecutionSparkline() {
  const maxVal = Math.max(...sparklineData.map((d) => d.s + d.f));
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-zinc-400" />
          <span className="text-[12px] font-semibold text-zinc-700">Execution Volume (24h)</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Success</span>
          <span className="flex items-center gap-1 text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Failed</span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-[60px]">
        {sparklineData.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0">
            <div className="w-full flex flex-col items-stretch" style={{ height: 48 }}>
              <div className="flex-1" />
              {d.f > 0 && (
                <div className="w-full rounded-t-sm bg-red-400" style={{ height: `${(d.f / maxVal) * 48}px`, minHeight: 2 }} />
              )}
              <div className="w-full rounded-t-sm bg-emerald-400" style={{ height: `${(d.s / maxVal) * 48}px`, minHeight: 2 }} />
            </div>
            <span className="text-[8px] text-zinc-300 mt-1">{d.h}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExecutionsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<(typeof dateRanges)[number]>("Last 24h");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => setLastRefresh(new Date()), 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const running = mockExecutions.filter((e) => e.status === "active").length;
  const success24h = mockExecutions.filter((e) => e.status === "success").length;
  const failed24h = mockExecutions.filter((e) => e.status === "failed").length;
  const avgDuration = Math.round(mockExecutions.filter((e) => e.durationMs > 0).reduce((s, e) => s + e.durationMs, 0) / mockExecutions.filter((e) => e.durationMs > 0).length);
  const totalCredits = mockExecutions.reduce((s, e) => s + e.credits, 0);
  const successRate = Math.round((success24h / mockExecutions.length) * 100);

  const filtered = mockExecutions.filter((e) => {
    if (activeFilter !== "All" && e.status !== statusMap[activeFilter]) return false;
    if (search && !e.workflowName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-[1020px] px-8 py-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Executions"
          description="Monitor, debug, and replay workflow runs."
        />
        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all",
              autoRefresh ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-500"
            )}
          >
            <RefreshCw size={11} className={autoRefresh ? "animate-spin" : ""} style={autoRefresh ? { animationDuration: "3s" } : {}} />
            {autoRefresh ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      {/* Metric strip */}
      <div className="mt-6 grid grid-cols-6 gap-3">
        <MetricPill icon={<Loader2 size={13} className="text-blue-500" />} label="Running" value={running.toString()} />
        <MetricPill icon={<CheckCircle2 size={13} className="text-green-500" />} label="Success" value={success24h.toString()} />
        <MetricPill icon={<XCircle size={13} className="text-red-500" />} label="Failed" value={failed24h.toString()} />
        <MetricPill icon={<TrendingUp size={13} className="text-zinc-400" />} label="Success Rate" value={`${successRate}%`} highlight={successRate >= 80 ? "green" : "red"} />
        <MetricPill icon={<Clock size={13} className="text-zinc-400" />} label="Avg Duration" value={`${(avgDuration / 1000).toFixed(1)}s`} />
        <MetricPill icon={<Zap size={13} className="text-amber-500" />} label="Credits Used" value={totalCredits.toString()} />
      </div>

      {/* Sparkline chart */}
      <div className="mt-4">
        <ExecutionSparkline />
      </div>

      {/* Filter + search + date range */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <Input
          prefix={<Search size={13} />}
          placeholder="Search executions…"
          className="w-56"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-1 ml-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] font-medium transition-all duration-150",
                activeFilter === f
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Date range picker */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown((o) => !o)}
              className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-all"
            >
              <Calendar size={11} />
              {dateRange}
              <ChevronDown size={10} />
            </button>
            {showDateDropdown && (
              <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-zinc-200 bg-white shadow-lg py-1">
                {dateRanges.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setDateRange(r); setShowDateDropdown(false); }}
                    className={cn(
                      "flex w-full items-center px-3 py-1.5 text-[11px] transition-colors",
                      dateRange === r ? "text-zinc-900 font-medium bg-zinc-50" : "text-zinc-500 hover:bg-zinc-50"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2">
          <span className="text-[12px] font-medium text-zinc-700">{selectedIds.size} selected</span>
          <Button variant="secondary" size="sm"><RefreshCw size={10} /> Retry Selected</Button>
          <Button variant="ghost" size="sm" className="text-red-500"><StopCircle size={10} /> Cancel Selected</Button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[11px] text-zinc-400 hover:text-zinc-600">Clear</button>
        </div>
      )}

      {/* Data table */}
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(e) => e.id}
          onRowClick={(e) => navigate(`/executions/${e.id}`)}
          emptyState={
            <EmptyState
              icon={<Play size={32} strokeWidth={1.25} />}
              title="No executions match"
              description={search ? "Try a different search term." : "Executions will appear here once your workflows start running."}
              action={
                <button className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-700 transition-colors">
                  <RotateCcw size={12} /> Refresh
                </button>
              }
            />
          }
        />
      </div>
    </div>
  );
}

function MetricPill({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: "green" | "red" }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-zinc-100 bg-white px-3 py-2.5 shadow-xs">
      {icon}
      <div>
        <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className={cn(
          "text-[15px] font-semibold leading-tight",
          highlight === "green" ? "text-green-600" : highlight === "red" ? "text-red-600" : "text-zinc-800"
        )}>{value}</p>
      </div>
    </div>
  );
}
