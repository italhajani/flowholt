import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Webhook, Plus, Search, Copy, ExternalLink, Clock, Zap, ArrowUpRight, CheckCircle, XCircle, RefreshCw, BarChart3, AlertTriangle, Activity, ChevronRight, ShieldCheck, Globe } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

const tabs = ["Endpoints", "Delivery Log", "Queue"] as const;
type Tab = (typeof tabs)[number];

/* ── Endpoint mock data ── */
interface WebhookEndpoint {
  id: string;
  name: string;
  path: string;
  method: "POST" | "GET" | "PUT";
  workflow: string;
  status: "active" | "paused" | "disabled";
  deliveries24h: number;
  successRate: number;
  lastTriggered: string;
  signingSecret: boolean;
  sparkline: number[];
}

const mockEndpoints: WebhookEndpoint[] = [
  { id: "wh1", name: "Stripe Events", path: "/hooks/stripe-events", method: "POST", workflow: "Invoice Processing Pipeline", status: "active", deliveries24h: 47, successRate: 100, lastTriggered: "2 min ago", signingSecret: true, sparkline: [3, 5, 2, 8, 4, 6, 3, 5, 7, 4, 2, 3] },
  { id: "wh2", name: "GitHub PR Sync", path: "/hooks/github-pr", method: "POST", workflow: "GitHub PR → Jira Sync", status: "active", deliveries24h: 12, successRate: 91.7, lastTriggered: "15 min ago", signingSecret: true, sparkline: [1, 0, 2, 1, 3, 0, 1, 2, 0, 1, 0, 1] },
  { id: "wh3", name: "Form Submissions", path: "/hooks/form-submit", method: "POST", workflow: "Lead Qualification Pipeline", status: "active", deliveries24h: 89, successRate: 98.9, lastTriggered: "Just now", signingSecret: false, sparkline: [5, 8, 12, 10, 7, 9, 6, 8, 11, 7, 5, 1] },
  { id: "wh4", name: "Slack Commands", path: "/hooks/slack-cmd", method: "POST", workflow: "Slack Command Router", status: "paused", deliveries24h: 0, successRate: 100, lastTriggered: "3 days ago", signingSecret: true, sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "wh5", name: "Health Check", path: "/hooks/health", method: "GET", workflow: "—", status: "active", deliveries24h: 1440, successRate: 100, lastTriggered: "1 min ago", signingSecret: false, sparkline: [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120] },
];

/* ── Delivery log mock ── */
interface DeliveryLog {
  id: string;
  endpoint: string;
  status: "success" | "failed" | "pending";
  statusCode: number;
  duration: string;
  payload: string;
  timestamp: string;
  requestHeaders?: Record<string, string>;
  responseBody?: string;
  retryCount?: number;
}

const mockDeliveries: DeliveryLog[] = [
  { id: "d1", endpoint: "Stripe Events", status: "success", statusCode: 200, duration: "124ms", payload: "invoice.paid", timestamp: "2 min ago", requestHeaders: { "content-type": "application/json", "stripe-signature": "t=1713450497,v1=..." }, responseBody: '{"received": true}' },
  { id: "d2", endpoint: "Form Submissions", status: "success", statusCode: 200, duration: "89ms", payload: "form_submit", timestamp: "Just now", requestHeaders: { "content-type": "application/json" }, responseBody: '{"status": "ok", "lead_id": "lead-442"}' },
  { id: "d3", endpoint: "GitHub PR Sync", status: "failed", statusCode: 502, duration: "30.1s", payload: "pull_request.opened", timestamp: "15 min ago", retryCount: 2, requestHeaders: { "x-github-event": "pull_request", "x-github-delivery": "abc-123" }, responseBody: 'Bad Gateway' },
  { id: "d4", endpoint: "Health Check", status: "success", statusCode: 200, duration: "12ms", payload: "GET /health", timestamp: "1 min ago" },
  { id: "d5", endpoint: "Stripe Events", status: "success", statusCode: 200, duration: "98ms", payload: "customer.created", timestamp: "10 min ago" },
  { id: "d6", endpoint: "Form Submissions", status: "success", statusCode: 200, duration: "145ms", payload: "form_submit", timestamp: "20 min ago" },
  { id: "d7", endpoint: "GitHub PR Sync", status: "success", statusCode: 200, duration: "1.2s", payload: "pull_request.synchronize", timestamp: "1 hr ago" },
  { id: "d8", endpoint: "Stripe Events", status: "success", statusCode: 200, duration: "110ms", payload: "charge.succeeded", timestamp: "2 hrs ago" },
];

/* Queue items */
interface QueueItem {
  id: string;
  endpoint: string;
  payload: string;
  attempts: number;
  maxAttempts: number;
  nextRetry: string;
  lastError: string;
}

const mockQueue: QueueItem[] = [
  { id: "q1", endpoint: "GitHub PR Sync", payload: "pull_request.opened", attempts: 2, maxAttempts: 5, nextRetry: "In 4 min", lastError: "502 Bad Gateway — upstream timeout" },
];

/* Sparkline mini chart */
function MiniSparkline({ data, color = "emerald" }: { data: number[]; color?: "emerald" | "red" | "blue" }) {
  const max = Math.max(...data, 1);
  const c = color === "emerald" ? "bg-emerald-400" : color === "red" ? "bg-red-400" : "bg-blue-400";
  return (
    <div className="flex items-end gap-px h-3 w-16">
      {data.map((v, i) => (
        <div key={i} className={cn("flex-1 rounded-t-sm", c)} style={{ height: `${Math.max(1, (v / max) * 12)}px`, opacity: 0.4 + (v / max) * 0.6 }} />
      ))}
    </div>
  );
}

/* ── Column defs ── */
const endpointColumns: Column<WebhookEndpoint>[] = [
  {
    id: "name", header: "Endpoint", sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <Zap size={13} className={row.status === "active" ? "text-amber-400" : "text-zinc-300"} />
        <div>
          <p className="font-medium text-zinc-800 text-[13px]">{row.name}</p>
          <p className="text-[10px] text-zinc-400 font-mono">{row.path}</p>
        </div>
      </div>
    ),
  },
  {
    id: "method", header: "Method",
    accessor: (row) => {
      const colors = { POST: "bg-blue-50 text-blue-600", GET: "bg-green-50 text-green-600", PUT: "bg-amber-50 text-amber-600" };
      return <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-medium", colors[row.method])}>{row.method}</span>;
    },
  },
  { id: "workflow", header: "Workflow", hideBelow: "md", accessor: (row) => <span className="text-zinc-500 text-[12px]">{row.workflow}</span> },
  { id: "status", header: "Status", accessor: (row) => <StatusDot status={row.status} label={row.status} /> },
  {
    id: "volume", header: "24h Volume", sortable: true, hideBelow: "md",
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <MiniSparkline data={row.sparkline} />
        <span className="font-mono text-[12px] text-zinc-600">{row.deliveries24h}</span>
      </div>
    ),
  },
  {
    id: "rate", header: "Success", sortable: true, hideBelow: "lg",
    accessor: (row) => (
      <span className={cn("text-[12px] font-medium", row.successRate >= 99 ? "text-green-600" : row.successRate >= 90 ? "text-amber-600" : "text-red-600")}>
        {row.successRate}%
      </span>
    ),
  },
  {
    id: "security", header: "", hideBelow: "lg", className: "w-8",
    accessor: (row) => row.signingSecret ? <ShieldCheck size={12} className="text-green-400" title="Signing secret configured" /> : <ShieldCheck size={12} className="text-zinc-200" title="No signing secret" />,
  },
  { id: "last", header: "Last", hideBelow: "lg", accessor: (row) => <span className="text-zinc-400 text-[12px]">{row.lastTriggered}</span> },
];

const deliveryColumns: Column<DeliveryLog>[] = [
  {
    id: "status", header: "", className: "w-8",
    accessor: (row) => row.status === "success" ? <CheckCircle size={14} className="text-green-500" /> : row.status === "failed" ? <XCircle size={14} className="text-red-500" /> : <Clock size={14} className="text-amber-400" />,
  },
  { id: "endpoint", header: "Endpoint", sortable: true, accessor: (row) => <span className="font-medium text-zinc-800">{row.endpoint}</span> },
  {
    id: "code", header: "Status",
    accessor: (row) => (
      <Badge variant={row.statusCode < 300 ? "success" : row.statusCode < 500 ? "warning" : "danger"}>
        {row.statusCode}
      </Badge>
    ),
  },
  { id: "payload", header: "Event", hideBelow: "md", accessor: (row) => <code className="text-[11px] font-mono text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded">{row.payload}</code> },
  { id: "duration", header: "Duration", sortable: true, hideBelow: "md", accessor: (row) => <span className={cn("font-mono text-[12px]", parseFloat(row.duration) > 5000 ? "text-red-500" : "text-zinc-500")}>{row.duration}</span> },
  {
    id: "retry", header: "Retries", hideBelow: "lg",
    accessor: (row) => row.retryCount ? <span className="text-[11px] text-amber-600 font-medium">{row.retryCount}x</span> : <span className="text-zinc-300">—</span>,
  },
  { id: "time", header: "Time", sortable: true, accessor: (row) => <span className="text-zinc-400 text-[12px]">{row.timestamp}</span> },
  {
    id: "actions", header: "", className: "w-12",
    accessor: (row) => row.status === "failed" ? <Button variant="ghost" size="sm" className="text-[11px]"><RefreshCw size={10} /></Button> : null,
  },
];

export function WebhooksPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Endpoints");
  const [search, setSearch] = useState("");
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalDeliveries = mockEndpoints.reduce((s, e) => s + e.deliveries24h, 0);
  const avgSuccess = Math.round(mockEndpoints.filter(e => e.status === "active").reduce((s, e) => s + e.successRate, 0) / mockEndpoints.filter(e => e.status === "active").length * 10) / 10;
  const failedCount = mockDeliveries.filter(d => d.status === "failed").length;

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
        <MetricPill icon={<Globe size={13} className="text-zinc-400" />} label="Endpoints" value={mockEndpoints.length.toString()} />
        <MetricPill icon={<Activity size={13} className="text-blue-500" />} label="Active" value={mockEndpoints.filter(e => e.status === "active").length.toString()} highlight="green" />
        <MetricPill icon={<BarChart3 size={13} className="text-zinc-400" />} label="24h Deliveries" value={totalDeliveries.toLocaleString()} />
        <MetricPill icon={<CheckCircle size={13} className="text-green-500" />} label="Success Rate" value={`${avgSuccess}%`} highlight={avgSuccess >= 98 ? "green" : "red"} />
        <MetricPill icon={<AlertTriangle size={13} className="text-red-500" />} label="Failed (24h)" value={failedCount.toString()} highlight={failedCount > 0 ? "red" : undefined} />
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
              {t === "Queue" && mockQueue.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[9px] font-semibold">{mockQueue.length}</span>
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
              data={mockEndpoints.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()))}
              getRowId={(e) => e.id}
              selectable
              onRowClick={(row) => navigate(`/webhooks/${row.id}`)}
              emptyState={<EmptyState icon={<Webhook size={32} strokeWidth={1.25} />} title="No webhooks" description="Create a webhook to start receiving events." />}
            />
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
                      https://api.flowholt.com/webhooks&#123;path&#125;
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
                      https://test.flowholt.com/webhooks&#123;path&#125;
                    </code>
                    <button className="rounded px-1.5 py-0.5 text-[9px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors flex items-center gap-1">
                      <Copy size={10} /> Copy
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-zinc-400">Test URLs route to the workflow editor for debugging. Production URLs trigger live executions.</p>
            </div>
          </>
        )}

        {activeTab === "Delivery Log" && (
          <div className="space-y-3">
            <DataTable
              columns={deliveryColumns}
              data={mockDeliveries.filter((d) => !search || d.endpoint.toLowerCase().includes(search.toLowerCase()))}
              getRowId={(d) => d.id}
              onRowClick={(d) => setExpandedDelivery(expandedDelivery === d.id ? null : d.id)}
              emptyState={<EmptyState icon={<ArrowUpRight size={32} strokeWidth={1.25} />} title="No deliveries yet" description="Deliveries will appear here when webhooks receive events." />}
            />
            {/* Expanded delivery detail */}
            {expandedDelivery && (() => {
              const delivery = mockDeliveries.find(d => d.id === expandedDelivery);
              if (!delivery?.requestHeaders) return null;
              return (
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100">
                    <ChevronRight size={12} className="text-zinc-400 rotate-90" />
                    <span className="text-[11px] font-semibold text-zinc-600">{delivery.endpoint} — {delivery.payload}</span>
                    <span className="ml-auto text-[10px] text-zinc-400">{delivery.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-zinc-100">
                    <div className="p-3">
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Request Headers</p>
                      <pre className="text-[10px] font-mono text-zinc-600 leading-relaxed">
                        {Object.entries(delivery.requestHeaders).map(([k, v]) => `${k}: ${v}`).join("\n")}
                      </pre>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Response Body</p>
                      <pre className="text-[10px] font-mono text-zinc-600 leading-relaxed">{delivery.responseBody}</pre>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === "Queue" && (
          mockQueue.length > 0 ? (
            <div className="space-y-2">
              {mockQueue.map((item) => (
                <div key={item.id} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium text-zinc-800">{item.endpoint}</span>
                        <code className="text-[10px] font-mono text-zinc-500 bg-white px-1.5 py-0.5 rounded border border-zinc-200">{item.payload}</code>
                      </div>
                      <p className="text-[11px] text-amber-700 mb-2">{item.lastError}</p>
                      <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                        <span>Attempts: <span className="font-medium text-amber-700">{item.attempts}/{item.maxAttempts}</span></span>
                        <span>Next retry: <span className="font-medium text-zinc-700">{item.nextRetry}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="secondary" size="sm" className="text-[11px]"><RefreshCw size={10} /> Retry Now</Button>
                      <Button variant="ghost" size="sm" className="text-[11px] text-red-500">Drop</Button>
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
