import { useState } from "react";
import { Activity, Search, HeartPulse, Clock, AlertTriangle, Users, GitBranch, XCircle, FileText, Bell, BarChart3, RefreshCw, Download, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

/* ── Per research 65: 6 sub-tabs ── */
const tabs = [
  { id: "runtime",   label: "Runtime",   icon: HeartPulse },
  { id: "queues",    label: "Queues",    icon: Clock },
  { id: "failures",  label: "Failures",  icon: XCircle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "audit",     label: "Audit",     icon: FileText },
  { id: "alerts",    label: "Alerts",    icon: Bell },
] as const;
type Tab = (typeof tabs)[number]["id"];

/* ── Queue mock data ── */
interface QueueItem {
  id: string;
  workflow: string;
  position: number;
  priority: "high" | "normal" | "low";
  queuedAt: string;
  estimatedStart: string;
}

const mockQueue: QueueItem[] = [
  { id: "q1", workflow: "Lead Qualification Pipeline", position: 1, priority: "high", queuedAt: "Just now", estimatedStart: "< 1 min" },
  { id: "q2", workflow: "Invoice Processing Pipeline", position: 2, priority: "normal", queuedAt: "30s ago", estimatedStart: "~2 min" },
  { id: "q3", workflow: "Daily Report Generator", position: 3, priority: "normal", queuedAt: "1 min ago", estimatedStart: "~4 min" },
  { id: "q4", workflow: "Error Alert Handler", position: 4, priority: "low", queuedAt: "2 min ago", estimatedStart: "~6 min" },
];

/* ── Failure mock data ── */
interface Failure {
  id: string;
  workflow: string;
  error: string;
  step: string;
  occurredAt: string;
  count: number;
}

const mockFailures: Failure[] = [
  { id: "f1", workflow: "Error Alert Handler", error: "ConnectionRefusedError: ECONNREFUSED", step: "Send Slack Alert", occurredAt: "12 min ago", count: 3 },
  { id: "f2", workflow: "Customer Onboarding Flow", error: "TypeError: Cannot read property 'email'", step: "Enrich Contact", occurredAt: "3 hrs ago", count: 1 },
  { id: "f3", workflow: "Invoice Processing Pipeline", error: "TimeoutError: Request exceeded 30s limit", step: "Fetch Invoice PDF", occurredAt: "5 hrs ago", count: 7 },
  { id: "f4", workflow: "Lead Qualification Pipeline", error: "RateLimitError: OpenAI 429", step: "Score Lead (GPT-4o)", occurredAt: "1 day ago", count: 12 },
];

/* ── Audit mock data ── */
interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  category: "workflow" | "vault" | "settings" | "auth";
}

const mockAudit: AuditEvent[] = [
  { id: "au1", actor: "Gouhar Ali", action: "Updated workflow", target: "Lead Qualification Pipeline", timestamp: "5 min ago", category: "workflow" },
  { id: "au2", actor: "Sarah Chen", action: "Rotated credential", target: "OpenAI Production Key", timestamp: "1 hr ago", category: "vault" },
  { id: "au3", actor: "System", action: "Auto-paused workflow", target: "Error Alert Handler", timestamp: "2 hrs ago", category: "workflow" },
  { id: "au4", actor: "Gouhar Ali", action: "Invited member", target: "alex@flowholt.com", timestamp: "3 hrs ago", category: "settings" },
  { id: "au5", actor: "Alex Kim", action: "Login from new device", target: "Chrome / Windows", timestamp: "5 hrs ago", category: "auth" },
  { id: "au6", actor: "System", action: "Connection health check failed", target: "Stripe API", timestamp: "1 day ago", category: "vault" },
  { id: "au7", actor: "Gouhar Ali", action: "Deployed workflow", target: "Customer Onboarding v3", timestamp: "1 day ago", category: "workflow" },
  { id: "au8", actor: "Sarah Chen", action: "Changed workspace name", target: "FlowHolt Production", timestamp: "2 days ago", category: "settings" },
  { id: "au9", actor: "System", action: "API key revoked (expired)", target: "fh_key_****3f9a", timestamp: "2 days ago", category: "auth" },
  { id: "au10", actor: "Alex Kim", action: "Created credential", target: "Slack Bot Token", timestamp: "3 days ago", category: "vault" },
  { id: "au11", actor: "Gouhar Ali", action: "Enabled 2FA", target: "gouhar@flowholt.com", timestamp: "3 days ago", category: "auth" },
  { id: "au12", actor: "System", action: "Workflow execution limit reached", target: "Bulk Import Pipeline", timestamp: "4 days ago", category: "workflow" },
];

/* ── Column defs ── */
const queueColumns: Column<QueueItem>[] = [
  { id: "pos", header: "#", className: "w-10", accessor: (row) => <span className="text-zinc-400 font-mono text-[12px]">{row.position}</span> },
  {
    id: "workflow", header: "Workflow", sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <GitBranch size={13} className="text-zinc-400" />
        <span className="font-medium text-zinc-800">{row.workflow}</span>
      </div>
    ),
  },
  {
    id: "priority", header: "Priority",
    accessor: (row) => (
      <Badge variant={row.priority === "high" ? "danger" : row.priority === "low" ? "neutral" : "info"}>
        {row.priority}
      </Badge>
    ),
  },
  { id: "queuedAt", header: "Queued", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.queuedAt}</span> },
  { id: "estimate", header: "Est. Start", hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.estimatedStart}</span> },
];

const failureColumns: Column<Failure>[] = [
  {
    id: "workflow", header: "Workflow", sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <XCircle size={13} className="text-red-400" />
        <span className="font-medium text-zinc-800">{row.workflow}</span>
      </div>
    ),
  },
  {
    id: "error", header: "Error",
    accessor: (row) => <code className="text-[11px] font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded truncate block max-w-[240px]">{row.error}</code>,
  },
  { id: "step", header: "Step", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.step}</span> },
  {
    id: "count", header: "Count", sortable: true, hideBelow: "md",
    accessor: (row) => <Badge variant={row.count > 5 ? "danger" : "neutral"}>{row.count}×</Badge>,
  },
  { id: "occurred", header: "Last Seen", sortable: true, hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.occurredAt}</span> },
  {
    id: "actions", header: "", className: "w-16",
    accessor: () => <Button variant="ghost" size="sm" className="text-[11px]"><RefreshCw size={10} /> Retry</Button>,
  },
];

const auditCategoryColors: Record<string, string> = {
  workflow: "bg-blue-50 text-blue-500",
  vault: "bg-amber-50 text-amber-500",
  settings: "bg-purple-50 text-purple-500",
  auth: "bg-zinc-100 text-zinc-500",
};

const auditColumns: Column<AuditEvent>[] = [
  {
    id: "actor", header: "Actor", sortable: true,
    accessor: (row) => <span className="font-medium text-zinc-800">{row.actor}</span>,
  },
  {
    id: "action", header: "Action",
    accessor: (row) => <span className="text-zinc-600">{row.action}</span>,
  },
  {
    id: "target", header: "Target",
    accessor: (row) => <span className="text-zinc-500 truncate block max-w-[180px]">{row.target}</span>,
  },
  {
    id: "category", header: "Type", hideBelow: "md",
    accessor: (row) => (
      <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-medium capitalize", auditCategoryColors[row.category])}>
        {row.category}
      </span>
    ),
  },
  { id: "time", header: "When", sortable: true, hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.timestamp}</span> },
];

export function OperationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("runtime");
  const [search, setSearch] = useState("");

  return (
    <div className="mx-auto max-w-[960px] px-8 py-8">
      <PageHeader
        title="Operations"
        description="Runtime health, queues, failures, analytics, and audit."
      />

      {/* Metric cards */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        <MetricCard icon={<HeartPulse size={14} className="text-green-500" />} label="Uptime" value="99.97%" color="green" />
        <MetricCard icon={<Clock size={14} className="text-blue-500" />} label="Queue Depth" value={mockQueue.length.toString()} />
        <MetricCard icon={<AlertTriangle size={14} className="text-red-500" />} label="Error Rate" value="2.1%" color="red" />
        <MetricCard icon={<Users size={14} className="text-zinc-400" />} label="Active Workers" value="4" />
      </div>

      {/* Underline tab strip */}
      <div className="mt-6 flex items-center justify-between">
        <div
          className="flex items-center gap-0"
          style={{ borderBottom: "1px solid var(--color-border-default)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSearch(""); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-px",
                activeTab === t.id
                  ? "border-zinc-800 text-zinc-800"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
        <Input
          prefix={<Search size={13} />}
          placeholder="Search…"
          className="w-48"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "runtime" && (
          <div className="space-y-4">
            {/* Mini throughput chart placeholder */}
            <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
              <p className="text-[12px] font-medium text-zinc-600 mb-3">Throughput (last 24h)</p>
              <div className="flex items-end gap-[3px] h-16">
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = Math.max(4, Math.floor(Math.random() * 64));
                  return <div key={i} className="flex-1 rounded-t bg-zinc-200 transition-all hover:bg-zinc-400" style={{ height: `${h}px` }} />;
                })}
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-zinc-400">
                <span>24h ago</span><span>Now</span>
              </div>
            </div>
            {/* Worker status */}
            <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
              <p className="text-[12px] font-medium text-zinc-600 mb-3">Workers</p>
              <div className="grid grid-cols-4 gap-3">
                {["Worker-1", "Worker-2", "Worker-3", "Worker-4"].map((w, i) => (
                  <div key={w} className="flex items-center gap-2 rounded-md border border-zinc-100 px-3 py-2">
                    <span className={cn("h-2 w-2 rounded-full", i < 3 ? "bg-green-500" : "bg-amber-400")} />
                    <div>
                      <p className="text-[12px] font-medium text-zinc-700">{w}</p>
                      <p className="text-[10px] text-zinc-400">{i < 3 ? "Active" : "Idle"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "queues" && (
          <DataTable
            columns={queueColumns}
            data={mockQueue}
            getRowId={(q) => q.id}
            emptyState={<EmptyState icon={<Clock size={32} strokeWidth={1.25} />} title="Queue empty" description="No workflows are waiting." />}
          />
        )}

        {activeTab === "failures" && (
          <DataTable
            columns={failureColumns}
            data={mockFailures.filter((f) => !search || f.workflow.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(f) => f.id}
            emptyState={<EmptyState icon={<XCircle size={32} strokeWidth={1.25} />} title="No recent failures" description="All systems running smoothly." />}
          />
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            {/* Execution volume chart */}
            <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-medium text-zinc-600">Executions (30 days)</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" />Success</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Failed</span>
                </div>
              </div>
              <div className="flex items-end gap-[4px] h-24">
                {Array.from({ length: 30 }).map((_, i) => {
                  const total = 20 + Math.floor(Math.random() * 80);
                  const failPct = Math.random() < 0.2 ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 5);
                  const successH = Math.floor((total * (100 - failPct)) / 100 * 0.96);
                  const failH = Math.floor((total * failPct) / 100 * 0.96);
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-[1px]" title={`Day ${i + 1}: ${total} executions`}>
                      <div className="rounded-t-sm bg-green-300 hover:bg-green-400 transition-colors" style={{ height: `${successH}px` }} />
                      {failH > 0 && <div className="bg-red-300 hover:bg-red-400 transition-colors" style={{ height: `${failH}px` }} />}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-zinc-400">
                <span>30d ago</span><span>Today</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              <AnalyticsStat label="Total Executions" value="12,847" change="+18%" positive />
              <AnalyticsStat label="Success Rate" value="97.3%" change="+0.4%" positive />
              <AnalyticsStat label="Avg Duration" value="3.8s" change="-12%" positive />
              <AnalyticsStat label="Total Cost" value="$284.50" change="+22%" />
            </div>

            {/* Top workflows by execution */}
            <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
              <p className="text-[12px] font-medium text-zinc-600 mb-3">Top Workflows by Volume</p>
              <div className="space-y-2.5">
                {[
                  { name: "Lead Qualification Pipeline", count: 4280, pct: 100 },
                  { name: "Invoice Processing", count: 3150, pct: 73 },
                  { name: "Customer Onboarding Flow", count: 2410, pct: 56 },
                  { name: "Error Alert Handler", count: 1820, pct: 42 },
                  { name: "Daily Report Generator", count: 1187, pct: 28 },
                ].map((wf) => (
                  <div key={wf.name} className="flex items-center gap-3">
                    <span className="text-[12px] text-zinc-700 w-52 truncate">{wf.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div className="h-full rounded-full bg-zinc-300 transition-all" style={{ width: `${wf.pct}%` }} />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 w-14 text-right">{wf.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
                <p className="text-[12px] font-medium text-zinc-600 mb-3">Cost by Category</p>
                <div className="space-y-2">
                  {[
                    { label: "AI / LLM", amount: "$184.20", pct: 65, color: "bg-zinc-800" },
                    { label: "Integrations", amount: "$52.30", pct: 18, color: "bg-blue-400" },
                    { label: "Compute", amount: "$32.00", pct: 11, color: "bg-teal-400" },
                    { label: "Storage", amount: "$16.00", pct: 6, color: "bg-amber-400" },
                  ].map((cat) => (
                    <div key={cat.label} className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full flex-shrink-0", cat.color)} />
                      <span className="text-[12px] text-zinc-600 flex-1">{cat.label}</span>
                      <span className="text-[11px] font-mono text-zinc-500">{cat.amount}</span>
                      <span className="text-[10px] text-zinc-400 w-8 text-right">{cat.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
                <p className="text-[12px] font-medium text-zinc-600 mb-3">Performance Percentiles</p>
                <div className="space-y-2">
                  {[
                    { label: "p50 (median)", value: "1.2s" },
                    { label: "p90", value: "4.8s" },
                    { label: "p95", value: "8.1s" },
                    { label: "p99", value: "18.4s" },
                  ].map((p) => (
                    <div key={p.label} className="flex items-center justify-between">
                      <span className="text-[12px] text-zinc-500">{p.label}</span>
                      <span className="text-[12px] font-mono font-medium text-zinc-700">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && <AuditTab search={search} />}

        {activeTab === "alerts" && (
          <div className="space-y-2">
            {[
              { severity: "warning", msg: "Queue depth exceeded threshold (>10)", time: "2 hrs ago" },
              { severity: "error", msg: "Error rate spike: 12% in last 5 min", time: "3 hrs ago" },
              { severity: "info", msg: "Worker-4 entered idle state", time: "5 hrs ago" },
            ].map((alert, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3",
                alert.severity === "error" ? "border-red-100 bg-red-50/50" :
                alert.severity === "warning" ? "border-amber-100 bg-amber-50/50" :
                "border-zinc-100 bg-white"
              )}>
                <AlertTriangle size={14} className={
                  alert.severity === "error" ? "text-red-500" :
                  alert.severity === "warning" ? "text-amber-500" :
                  "text-zinc-400"
                } />
                <div className="flex-1">
                  <p className="text-[13px] text-zinc-800">{alert.msg}</p>
                  <p className="text-[11px] text-zinc-400">{alert.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[11px]">Dismiss</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Enhanced Audit Tab ── */
const auditCategories = ["all", "workflow", "vault", "settings", "auth"] as const;

function AuditTab({ search }: { search: string }) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = mockAudit.filter(e => {
    if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
    if (search && !e.actor.toLowerCase().includes(search.toLowerCase()) && !e.target.toLowerCase().includes(search.toLowerCase()) && !e.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const csv = ["Actor,Action,Target,Category,Timestamp"]
      .concat(filtered.map(e => `"${e.actor}","${e.action}","${e.target}","${e.category}","${e.timestamp}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Filters bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Filter size={11} className="text-zinc-400 mr-1" />
          {auditCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-medium capitalize transition-colors",
                categoryFilter === cat ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} className="text-[11px]">
          <Download size={11} /> Export CSV
        </Button>
      </div>

      {/* Event list */}
      <div className="space-y-1">
        {filtered.length === 0 ? (
          <EmptyState icon={<FileText size={32} strokeWidth={1.25} />} title="No audit events" description="No events match your current filter." />
        ) : filtered.map(event => {
          const isExpanded = expandedId === event.id;
          return (
            <div key={event.id} className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50/50 transition-colors"
              >
                {isExpanded ? <ChevronDown size={10} className="text-zinc-400" /> : <ChevronRight size={10} className="text-zinc-400" />}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-medium text-zinc-600 flex-shrink-0">
                  {event.actor.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] text-zinc-700">
                    <strong className="font-medium">{event.actor}</strong>
                    {" "}<span className="text-zinc-500">{event.action}</span>
                    {" "}<strong className="font-medium">{event.target}</strong>
                  </span>
                </div>
                <span className={cn("inline-flex px-2 py-0.5 rounded text-[9px] font-medium capitalize", auditCategoryColors[event.category])}>
                  {event.category}
                </span>
                <span className="text-[11px] text-zinc-400 flex-shrink-0">{event.timestamp}</span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 pt-0 ml-[52px] border-t border-zinc-50">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] mt-2">
                    <div className="text-zinc-400">Event ID</div>
                    <div className="text-zinc-600 font-mono">{event.id}</div>
                    <div className="text-zinc-400">Actor</div>
                    <div className="text-zinc-600">{event.actor}</div>
                    <div className="text-zinc-400">Action</div>
                    <div className="text-zinc-600">{event.action}</div>
                    <div className="text-zinc-400">Target</div>
                    <div className="text-zinc-600">{event.target}</div>
                    <div className="text-zinc-400">Category</div>
                    <div className="text-zinc-600 capitalize">{event.category}</div>
                    <div className="text-zinc-400">IP Address</div>
                    <div className="text-zinc-600 font-mono">192.168.1.{Math.floor(Math.random() * 255)}</div>
                    <div className="text-zinc-400">User Agent</div>
                    <div className="text-zinc-600 text-[10px] truncate">Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-zinc-400 pt-2">
        Showing {filtered.length} of {mockAudit.length} events
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: "green" | "red" }) {
  const valueColor = color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : "text-zinc-800";
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className={cn("text-[22px] font-semibold leading-none", valueColor)}>{value}</p>
    </div>
  );
}

function AnalyticsStat({ label, value, change, positive }: { label: string; value: string; change: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className="text-[22px] font-semibold text-zinc-800 mt-1 leading-none">{value}</p>
      <p className={cn("text-[11px] font-medium mt-1.5", positive ? "text-green-600" : "text-zinc-500")}>{change} vs last 30d</p>
    </div>
  );
}
