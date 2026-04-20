import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Webhook, Plus, Search, Copy, ExternalLink, Clock, Zap, ArrowUpRight, CheckCircle, XCircle, RefreshCw, BarChart3, AlertTriangle, Activity, ChevronRight, ShieldCheck, Globe, Trash2, Play, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";
import {
  useWebhookEndpoints,
  useWebhookDeliveries,
  useWebhookQueue,
  useRetryQueueItem,
  useDropQueueItem,
  useTestWebhook,
  useIncompleteExecutions,
  useResolveIncompleteExecution,
  useDeleteIncompleteExecution,
  useErrorTrackedWorkflows,
} from "@/hooks/useApi";
import type { WebhookEndpoint as APIWebhookEndpoint, WebhookDelivery as APIDelivery, WebhookQueueItem, IncompleteExecution } from "@/lib/api";

const tabs = ["Endpoints", "Delivery Log", "Queue", "Incomplete", "Errors"] as const;
type Tab = (typeof tabs)[number];

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Column defs ── */
const endpointColumns: Column<APIWebhookEndpoint>[] = [
  {
    id: "name", header: "Endpoint", sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <Zap size={13} className={row.active ? "text-amber-400" : "text-zinc-300"} />
        <div>
          <p className="font-medium text-zinc-800 text-[13px]">{row.path}</p>
          <p className="text-[10px] text-zinc-400 font-mono">/{row.path}</p>
        </div>
      </div>
    ),
  },
  {
    id: "method", header: "Method",
    accessor: (row) => {
      const colors: Record<string, string> = { POST: "bg-blue-50 text-blue-600", GET: "bg-green-50 text-green-600", PUT: "bg-amber-50 text-amber-600", PATCH: "bg-purple-50 text-purple-600", DELETE: "bg-red-50 text-red-600" };
      return <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-medium", colors[row.method] || "bg-zinc-50 text-zinc-600")}>{row.method}</span>;
    },
  },
  { id: "workflow", header: "Workflow", hideBelow: "md", accessor: (row) => <span className="text-zinc-500 text-[12px] font-mono">{row.workflow_id}</span> },
  { id: "status", header: "Status", accessor: (row) => <StatusDot status={row.active ? "active" : "disabled"} label={row.active ? "active" : "disabled"} /> },
  {
    id: "rateLimit", header: "Rate Limit", hideBelow: "md",
    accessor: (row) => <span className="font-mono text-[12px] text-zinc-500">{row.rate_limit_max}/{row.rate_limit_window_sec}s</span>,
  },
  {
    id: "security", header: "", hideBelow: "lg", className: "w-8",
    accessor: (row) => row.auth_type !== "none" ? <ShieldCheck size={12} className="text-green-400" title={`Auth: ${row.auth_type}`} /> : <ShieldCheck size={12} className="text-zinc-200" title="No auth" />,
  },
  { id: "created", header: "Created", hideBelow: "lg", accessor: (row) => <span className="text-zinc-400 text-[12px]">{formatTimeAgo(row.created_at)}</span> },
];

const deliveryColumns: Column<APIDelivery>[] = [
  {
    id: "status", header: "", className: "w-8",
    accessor: (row) => row.status_code < 300 ? <CheckCircle size={14} className="text-green-500" /> : row.status_code < 500 ? <Clock size={14} className="text-amber-400" /> : <XCircle size={14} className="text-red-500" />,
  },
  { id: "method", header: "Method", accessor: (row) => <span className="font-mono text-[11px] text-zinc-600">{row.method}</span> },
  { id: "path", header: "Path", accessor: (row) => <span className="font-medium text-zinc-800 text-[12px]">{row.path}</span> },
  {
    id: "code", header: "Status",
    accessor: (row) => (
      <Badge variant={row.status_code < 300 ? "success" : row.status_code < 500 ? "warning" : "danger"}>
        {row.status_code}
      </Badge>
    ),
  },
  { id: "ip", header: "Source IP", hideBelow: "md", accessor: (row) => <code className="text-[11px] font-mono text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded">{row.source_ip || "—"}</code> },
  { id: "duration", header: "Latency", sortable: true, hideBelow: "md", accessor: (row) => <span className={cn("font-mono text-[12px]", row.latency_ms > 5000 ? "text-red-500" : "text-zinc-500")}>{row.latency_ms}ms</span> },
  { id: "time", header: "Time", sortable: true, accessor: (row) => <span className="text-zinc-400 text-[12px]">{formatTimeAgo(row.created_at)}</span> },
];

export function WebhooksPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Endpoints");
  const [search, setSearch] = useState("");
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | undefined>();
  const navigate = useNavigate();
  const { data: endpoints = [] } = useWebhookEndpoints();
  const { data: deliveries = [] } = useWebhookDeliveries(selectedEndpoint || endpoints[0]?.id, 50);
  const { data: queueItems = [] } = useWebhookQueue();
  const retryMut = useRetryQueueItem();
  const dropMut = useDropQueueItem();
  const testMut = useTestWebhook();
  const { data: incompleteExecs = [] } = useIncompleteExecutions();
  const resolveMut = useResolveIncompleteExecution();
  const deleteIncompleteMut = useDeleteIncompleteExecution();
  const { data: errorTracked = [] } = useErrorTrackedWorkflows();

  const activeCount = endpoints.filter(e => e.active).length;

  return (
    <div className="mx-auto max-w-[1020px] px-8 py-8">
      <PageHeader
        title="Webhooks"
        description="Manage endpoints, monitor deliveries, and inspect queues."
        actions={
          <Button variant="primary" size="md">
            <Plus size={14} strokeWidth={2.5} />
            New Webhook
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="mt-6 grid grid-cols-5 gap-3">
        <MetricPill icon={<Globe size={13} className="text-zinc-400" />} label="Endpoints" value={endpoints.length.toString()} />
        <MetricPill icon={<Activity size={13} className="text-blue-500" />} label="Active" value={activeCount.toString()} highlight="green" />
        <MetricPill icon={<BarChart3 size={13} className="text-zinc-400" />} label="Deliveries" value={deliveries.length.toString()} />
        <MetricPill icon={<CheckCircle size={13} className="text-green-500" />} label="Queue Pending" value={queueItems.filter(q => q.status === "pending").length.toString()} />
        <MetricPill icon={<AlertTriangle size={13} className="text-red-500" />} label="Dead Letters" value={queueItems.filter(q => q.status === "dead_letter").length.toString()} highlight={queueItems.some(q => q.status === "dead_letter") ? "red" : undefined} />
      </div>

      {/* Tabs */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-0" style={{ borderBottom: "1px solid var(--color-border-default)" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setSearch(""); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-px",
                activeTab === t ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              {t}
              {t === "Queue" && queueItems.filter(q => q.status !== "completed").length > 0 && (
                <span className="ml-1 rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[9px] font-semibold">{queueItems.filter(q => q.status !== "completed").length}</span>
              )}
            </button>
          ))}
        </div>
        <Input prefix={<Search size={13} />} placeholder="Search…" className="w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "Endpoints" && (
          <>
            <DataTable
              columns={endpointColumns}
              data={endpoints.filter((e) => !search || e.path.toLowerCase().includes(search.toLowerCase()))}
              getRowId={(e) => e.id}
              selectable
              onRowClick={(row) => navigate(`/webhooks/${row.id}`)}
              emptyState={<EmptyState icon={<Webhook size={32} strokeWidth={1.25} />} title="No webhooks" description="Create a webhook to start receiving events." />}
            />
            {/* Quick Actions for each endpoint */}
            {endpoints.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {endpoints.map(ep => (
                  <Button
                    key={ep.id}
                    variant="secondary"
                    size="sm"
                    className="text-[11px] gap-1"
                    onClick={() => testMut.mutate(ep.id)}
                    disabled={testMut.isPending}
                  >
                    <Play size={10} /> Test {ep.path}
                  </Button>
                ))}
              </div>
            )}
            <div className="mt-4 rounded-lg border border-zinc-100 bg-white px-5 py-4 shadow-xs space-y-3">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Webhook URLs</p>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-semibold text-green-700">Production</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-600 flex-1 truncate">
                      https://api.flowholt.com/api/webhook/&#123;path&#125;
                    </code>
                    <button className="rounded px-1.5 py-0.5 text-[9px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors flex items-center gap-1">
                      <Copy size={10} /> Copy
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-semibold text-amber-700">Test</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-amber-50 px-2.5 py-1 font-mono text-[11px] text-amber-700 flex-1 truncate">
                      http://localhost:8001/api/webhook/&#123;path&#125;
                    </code>
                    <button className="rounded px-1.5 py-0.5 text-[9px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors flex items-center gap-1">
                      <Copy size={10} /> Copy
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-zinc-400">Test URLs route to the local dev server for debugging. Production URLs trigger live executions.</p>
            </div>
          </>
        )}

        {activeTab === "Delivery Log" && (
          <div className="space-y-3">
            {/* Endpoint selector for deliveries */}
            {endpoints.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-zinc-500">Endpoint:</span>
                <select
                  value={selectedEndpoint || endpoints[0]?.id || ""}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="h-7 rounded-md border border-zinc-200 bg-white px-2 text-[11px] text-zinc-700 focus:outline-none"
                >
                  {endpoints.map(ep => (
                    <option key={ep.id} value={ep.id}>{ep.path} ({ep.method})</option>
                  ))}
                </select>
              </div>
            )}
            <DataTable
              columns={deliveryColumns}
              data={deliveries.filter((d) => !search || d.path.toLowerCase().includes(search.toLowerCase()))}
              getRowId={(d) => d.id}
              onRowClick={(d) => setExpandedDelivery(expandedDelivery === d.id ? null : d.id)}
              emptyState={<EmptyState icon={<ArrowUpRight size={32} strokeWidth={1.25} />} title="No deliveries yet" description="Deliveries will appear here when webhooks receive events." />}
            />
            {/* Expanded delivery detail */}
            {expandedDelivery && (() => {
              const delivery = deliveries.find(d => d.id === expandedDelivery);
              if (!delivery) return null;
              return (
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100">
                    <ChevronRight size={12} className="text-zinc-400 rotate-90" />
                    <span className="text-[11px] font-semibold text-zinc-600">{delivery.method} {delivery.path}</span>
                    <Badge variant={delivery.status_code < 300 ? "success" : "danger"}>{delivery.status_code}</Badge>
                    <span className="ml-auto text-[10px] text-zinc-400">{formatTimeAgo(delivery.created_at)}</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-zinc-100">
                    <div className="p-3">
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Request Headers</p>
                      <pre className="text-[10px] font-mono text-zinc-600 leading-relaxed">
                        {delivery.headers ? Object.entries(delivery.headers).map(([k, v]) => `${k}: ${v}`).join("\n") : "—"}
                      </pre>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Body</p>
                      <pre className="text-[10px] font-mono text-zinc-600 leading-relaxed max-h-[200px] overflow-auto">{delivery.body || "—"}</pre>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === "Queue" && (
          queueItems.filter(q => q.status !== "completed").length > 0 ? (
            <div className="space-y-2">
              {queueItems.filter(q => q.status !== "completed").map((item) => (
                <div key={item.id} className={cn(
                  "rounded-lg border p-4",
                  item.status === "dead_letter" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                )}>
                  <div className="flex items-start gap-3">
                    {item.status === "dead_letter" ? <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={item.status === "dead_letter" ? "danger" : item.status === "processing" ? "info" : "warning"}>{item.status}</Badge>
                        <span className="text-[11px] font-mono text-zinc-500">{item.webhook_id}</span>
                      </div>
                      {item.error_message && <p className="text-[11px] text-amber-700 mb-2">{item.error_message}</p>}
                      <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                        <span>Attempts: <span className="font-medium text-amber-700">{item.attempts}/{item.max_retries}</span></span>
                        {item.next_retry_at && <span>Next retry: <span className="font-medium text-zinc-700">{formatTimeAgo(item.next_retry_at)}</span></span>}
                        <span>Created: {formatTimeAgo(item.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="secondary" size="sm" className="text-[11px]" onClick={() => retryMut.mutate(item.id)}><RefreshCw size={10} /> Retry Now</Button>
                      <Button variant="ghost" size="sm" className="text-[11px] text-red-500" onClick={() => dropMut.mutate(item.id)}><Trash2 size={10} /> Drop</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <CheckCircle size={28} strokeWidth={1.25} className="mx-auto text-green-300 mb-2" />
              <p className="text-[13px] text-zinc-400">Queue is empty — all deliveries succeeded</p>
              <p className="text-[11px] text-zinc-300 mt-1">Failed deliveries will queue here for automatic retry</p>
            </div>
          )
        )}

        {activeTab === "Incomplete" && (
          incompleteExecs.length > 0 ? (
            <div className="space-y-2">
              {incompleteExecs.map((ie) => (
                <div key={ie.id} className={cn(
                  "rounded-lg border p-4",
                  ie.status === "exhausted" ? "border-red-200 bg-red-50" : ie.status === "resolved" ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
                )}>
                  <div className="flex items-start gap-3">
                    {ie.status === "exhausted" ? <XCircle size={14} className="text-red-500 mt-0.5" /> : ie.status === "resolved" ? <CheckCircle size={14} className="text-green-500 mt-0.5" /> : <RotateCcw size={14} className="text-amber-500 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={ie.status === "exhausted" ? "danger" : ie.status === "resolved" ? "success" : "warning"}>{ie.status}</Badge>
                        <span className="text-[11px] font-mono text-zinc-500">{ie.execution_id}</span>
                      </div>
                      {ie.error_message && <p className="text-[11px] text-amber-700 mb-2">{ie.error_message}</p>}
                      <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                        <span>Retries: <span className="font-medium text-amber-700">{ie.retry_count}/{ie.max_retries}</span></span>
                        {ie.next_retry_at && <span>Next: {formatTimeAgo(ie.next_retry_at)}</span>}
                        <span>Workflow: <span className="font-mono">{ie.workflow_id}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {ie.status !== "resolved" && (
                        <Button variant="secondary" size="sm" className="text-[11px]" onClick={() => resolveMut.mutate(ie.id)}><CheckCircle size={10} /> Resolve</Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-[11px] text-red-500" onClick={() => deleteIncompleteMut.mutate(ie.id)}><Trash2 size={10} /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <CheckCircle size={28} strokeWidth={1.25} className="mx-auto text-green-300 mb-2" />
              <p className="text-[13px] text-zinc-400">No incomplete executions</p>
              <p className="text-[11px] text-zinc-300 mt-1">Failed executions needing retry appear here</p>
            </div>
          )
        )}

        {activeTab === "Errors" && (
          errorTracked.length > 0 ? (
            <div className="space-y-2">
              {errorTracked.map((et) => (
                <div key={et.workflow_id} className={cn(
                  "rounded-lg border p-4",
                  (et.count ?? et.consecutive_errors) >= 5 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                )}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={14} className={(et.count ?? et.consecutive_errors) >= 5 ? "text-red-500 mt-0.5" : "text-amber-500 mt-0.5"} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-medium text-zinc-800">Workflow</span>
                        <span className="text-[11px] font-mono text-zinc-500">{et.workflow_id}</span>
                        {et.auto_deactivated && <Badge variant="danger">Auto-deactivated</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                        <span>Consecutive errors: <span className="font-semibold text-red-600">{et.count ?? et.consecutive_errors}</span></span>
                        {et.last_error && <span className="truncate max-w-[200px]">Last: {et.last_error}</span>}
                        {et.last_error_at && <span>{formatTimeAgo(et.last_error_at)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <CheckCircle size={28} strokeWidth={1.25} className="mx-auto text-green-300 mb-2" />
              <p className="text-[13px] text-zinc-400">No error-tracked workflows</p>
              <p className="text-[11px] text-zinc-300 mt-1">Workflows with consecutive failures appear here</p>
            </div>
          )
        )}
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
