import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Webhook, Copy, CheckCircle, XCircle, Clock, RefreshCw,
  Shield, Zap, Activity, Settings, Trash2, ToggleLeft, ToggleRight,
  Play, Send, Code, ArrowRight, Loader2, ChevronDown, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useWebhookEndpoint,
  useWebhookDeliveries,
  useWebhookQueue,
  useUpdateWebhookEndpoint,
  useRetryQueueItem,
  useDropQueueItem,
} from "@/hooks/useApi";
import type { WebhookDelivery as APIDelivery, WebhookQueueItem } from "@/lib/api";

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const deliveryColumns: Column<APIDelivery>[] = [
  {
    id: "status", header: "", className: "w-8",
    accessor: (row) => row.status_code < 300
      ? <CheckCircle size={14} className="text-green-500" />
      : <XCircle size={14} className="text-red-500" />,
  },
  {
    id: "method", header: "Method",
    accessor: (row) => <span className="font-mono text-[11px] text-zinc-600">{row.method}</span>,
  },
  {
    id: "path", header: "Path",
    accessor: (row) => <code className="text-[11px] font-mono text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded">{row.path}</code>,
  },
  {
    id: "httpStatus", header: "HTTP Status",
    accessor: (row) => (
      <Badge variant={row.status_code < 300 ? "success" : row.status_code < 500 ? "warning" : "danger"}>
        {row.status_code}
      </Badge>
    ),
  },
  { id: "duration", header: "Latency", sortable: true, hideBelow: "md", accessor: (row) => <span className="font-mono text-[12px] text-zinc-500">{row.latency_ms}ms</span> },
  { id: "ip", header: "Source IP", hideBelow: "lg", accessor: (row) => <span className="text-zinc-400 text-[11px] font-mono">{row.source_ip || "—"}</span> },
  { id: "timestamp", header: "Time", sortable: true, accessor: (row) => <span className="text-zinc-400 text-[12px]">{formatTimeAgo(row.created_at)}</span> },
];

const queueColumns: Column<WebhookQueueItem>[] = [
  {
    id: "status", header: "Status",
    accessor: (row) => <Badge variant={row.status === "dead_letter" ? "danger" : row.status === "processing" ? "info" : "warning"}>{row.status}</Badge>,
  },
  { id: "attempts", header: "Attempts", accessor: (row) => <span className="font-mono text-[12px] text-zinc-600">{row.attempts}/{row.max_retries}</span> },
  { id: "created", header: "Created", accessor: (row) => <span className="text-zinc-500 text-[12px]">{formatTimeAgo(row.created_at)}</span> },
  { id: "processed", header: "Processed", accessor: (row) => <span className="text-zinc-500 text-[12px]">{row.processed_at ? formatTimeAgo(row.processed_at) : "—"}</span> },
  { id: "error", header: "Error", accessor: (row) => <span className="text-zinc-500 text-[12px]">{row.error_message || "—"}</span> },
];

/* ── Tabs ── */
const tabs = [
  { id: "overview", label: "Overview" },
  { id: "test", label: "Test" },
  { id: "deliveries", label: "Deliveries" },
  { id: "queue", label: "Queue" },
  { id: "settings", label: "Settings" },
];

export function WebhookDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const { data: webhook } = useWebhookEndpoint(id);
  const { data: deliveries = [] } = useWebhookDeliveries(id, 50);
  const { data: queueItems = [] } = useWebhookQueue(undefined, id);
  const updateMut = useUpdateWebhookEndpoint();
  const retryMut = useRetryQueueItem();
  const dropMut = useDropQueueItem();

  const [sigToggle, setSigToggle] = useState(false);
  const [sigSecret, setSigSecret] = useState("");
  const [rateLimit, setRateLimit] = useState(300);
  const [rateLimitWindow, setRateLimitWindow] = useState(10);
  const [ipWhitelist, setIpWhitelist] = useState("");
  const [corsOrigins, setCorsOrigins] = useState("*");
  const [respondMode, setRespondMode] = useState<"immediately" | "last_node" | "respond_node">("immediately");
  const [responseStatus, setResponseStatus] = useState(200);
  const [responseBody, setResponseBody] = useState("");

  useEffect(() => {
    if (webhook) {
      setSigToggle(!!webhook.signing_secret || webhook.auth_type !== "none");
      setSigSecret(webhook.signing_secret || "");
      setRateLimit(webhook.rate_limit_max);
      setRateLimitWindow(webhook.rate_limit_window_sec);
      setIpWhitelist(webhook.ip_whitelist || "");
      setCorsOrigins(webhook.cors_origins || "*");
      setRespondMode(webhook.respond_mode || "immediately");
      setResponseStatus(webhook.response_status || 200);
      setResponseBody(webhook.response_body || "");
    }
  }, [webhook]);

  if (!webhook) {
    return <div className="flex items-center justify-center h-64 text-zinc-400">Loading webhook…</div>;
  }

  const webhookUrl = `${window.location.origin}/api/webhook/${webhook.path}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    updateMut.mutate({
      id: webhook.id,
      payload: {
        auth_type: sigToggle ? "hmac" : "none",
        signing_secret: sigToggle ? sigSecret : null,
        rate_limit_max: rateLimit,
        rate_limit_window_sec: rateLimitWindow,
        ip_whitelist: ipWhitelist || null,
        cors_origins: corsOrigins,
        respond_mode: respondMode,
        response_status: responseStatus,
        response_body: responseBody || null,
      },
    });
  };

  return (
    <EntityDetailLayout
      backLabel="Webhooks"
      backTo="/webhooks"
      name={webhook.path}
      status={{ label: webhook.active ? "active" : "disabled", variant: webhook.active ? "success" : "neutral" }}
      subtitle={`${webhook.method} /${webhook.path} · ${webhook.workflow_id}`}
      icon={<Webhook size={18} className="text-amber-400" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={copyUrl}><Copy size={12} /> Copy URL</Button>
          <Button variant="secondary" size="sm"><Settings size={12} /> Configure</Button>
        </>
      }
    >
      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <DetailSection title="Endpoint Info">
            <DetailRow
              label="URL"
              value={
                <div className="flex items-center gap-2">
                  <code className="rounded bg-zinc-50 px-2 py-0.5 font-mono text-[11px] text-zinc-600">{webhookUrl}</code>
                  <button onClick={copyUrl} className="text-zinc-300 hover:text-zinc-500 transition-colors">
                    {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              }
            />
            <DetailRow
              label="Method"
              value={<span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 text-blue-600">{webhook.method}</span>}
            />
            <DetailRow label="Workflow" value={<span className="text-blue-600 text-[13px] font-mono">{webhook.workflow_id}</span>} />
            <DetailRow label="Created" value={formatTimeAgo(webhook.created_at)} />
            <DetailRow label="Updated" value={formatTimeAgo(webhook.updated_at)} />
          </DetailSection>

          <DetailSection title="Rate Limiting">
            <DetailRow label="Max Requests" value={<span className="font-mono">{webhook.rate_limit_max}</span>} />
            <DetailRow label="Window" value={<span className="font-mono">{webhook.rate_limit_window_sec}s</span>} />
          </DetailSection>

          <DetailSection title="Security">
            <DetailRow label="Auth Type" value={<Badge variant={webhook.auth_type !== "none" ? "success" : "neutral"}>{webhook.auth_type}</Badge>} />
            {webhook.expires_at && <DetailRow label="Expires" value={formatTimeAgo(webhook.expires_at)} />}
          </DetailSection>

          <DetailSection title="Queue">
            <DetailRow label="Pending" value={<span className="font-mono">{queueItems.filter(q => q.status === "pending").length}</span>} />
            <DetailRow label="Dead Letters" value={<span className="font-mono text-red-600">{queueItems.filter(q => q.status === "dead_letter").length}</span>} />
          </DetailSection>
        </div>
      )}

      {/* ── Test ── */}
      {activeTab === "test" && <WebhookTestPanel url={webhookUrl} method={webhook.method} />}

      {/* ── Deliveries ── */}
      {activeTab === "deliveries" && (
        <DataTable
          columns={deliveryColumns}
          data={deliveries}
          getRowId={(d) => d.id}
          emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">No deliveries yet.</p>}
        />
      )}

      {/* ── Queue ── */}
      {activeTab === "queue" && (
        <div className="space-y-2">
          <DataTable
            columns={queueColumns}
            data={queueItems}
            getRowId={(q) => q.id}
            emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">Queue is empty.</p>}
          />
          {queueItems.filter(q => q.status === "dead_letter" || q.status === "pending").length > 0 && (
            <div className="flex gap-2 mt-2">
              {queueItems.filter(q => q.status === "dead_letter").map(q => (
                <div key={q.id} className="flex items-center gap-1">
                  <Button variant="secondary" size="sm" className="text-[11px]" onClick={() => retryMut.mutate(q.id)}><RefreshCw size={10} /> Retry {q.id.slice(-6)}</Button>
                  <Button variant="ghost" size="sm" className="text-[11px] text-red-500" onClick={() => dropMut.mutate(q.id)}><Trash2 size={10} /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Settings ── */}
      {activeTab === "settings" && (
        <div className="space-y-5">
          <DetailSection title="Security">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-zinc-800">Require Signature Verification</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Reject requests without a valid HMAC-SHA256 signature</p>
                </div>
                <button
                  onClick={() => setSigToggle((v) => !v)}
                  className={cn("relative w-9 h-5 rounded-full transition-colors duration-200", sigToggle ? "bg-zinc-800" : "bg-zinc-200")}
                >
                  <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200", sigToggle ? "left-[18px]" : "left-0.5")} />
                </button>
              </div>
              {sigToggle && (
                <FieldGroup label="Signing Secret">
                  <Input
                    type="password"
                    value={sigSecret}
                    onChange={e => setSigSecret(e.target.value)}
                    placeholder="whsec_..."
                    className="font-mono"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Used to compute HMAC-SHA256 signature in X-FlowHolt-Signature header</p>
                </FieldGroup>
              )}
              <FieldGroup label="IP Whitelist">
                <Input
                  value={ipWhitelist}
                  onChange={e => setIpWhitelist(e.target.value)}
                  placeholder="10.0.0.1, 192.168.1.0/24 (blank = allow all)"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Comma-separated IPs. Leave blank to allow all.</p>
              </FieldGroup>
              <FieldGroup label="CORS Allowed Origins">
                <Input
                  value={corsOrigins}
                  onChange={e => setCorsOrigins(e.target.value)}
                  placeholder="* or https://example.com"
                />
              </FieldGroup>
            </div>
          </DetailSection>

          <DetailSection title="Rate Limiting">
            <div className="space-y-4">
              <FieldGroup label="Max requests per window">
                <Input type="number" value={rateLimit} onChange={e => setRateLimit(Number(e.target.value))} className="max-w-[160px]" />
              </FieldGroup>
              <FieldGroup label="Window (seconds)">
                <Input type="number" value={rateLimitWindow} onChange={e => setRateLimitWindow(Number(e.target.value))} className="max-w-[160px]" />
              </FieldGroup>
            </div>
          </DetailSection>

          <DetailSection title="Response">
            <div className="space-y-4">
              <FieldGroup label="Respond Mode">
                <select
                  value={respondMode}
                  onChange={e => setRespondMode(e.target.value as typeof respondMode)}
                  className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2 text-[12px] text-zinc-700"
                >
                  <option value="immediately">Immediately (before workflow runs)</option>
                  <option value="last_node">When Last Node Finishes</option>
                  <option value="respond_node">Using Respond to Webhook Node</option>
                </select>
              </FieldGroup>
              <FieldGroup label="Response Status Code">
                <Input type="number" value={responseStatus} onChange={e => setResponseStatus(Number(e.target.value))} className="max-w-[120px]" />
              </FieldGroup>
              <FieldGroup label="Custom Response Body">
                <textarea
                  value={responseBody}
                  onChange={e => setResponseBody(e.target.value)}
                  placeholder='{"status": "received"}'
                  rows={3}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] font-mono text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </FieldGroup>
            </div>
          </DetailSection>

          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      )}
    </EntityDetailLayout>
  );
}

/* ── Webhook Test Panel ── */
function WebhookTestPanel({ url, method }: { url: string; method: string }) {
  const [payload, setPayload] = useState(JSON.stringify({
    event: "invoice.paid",
    data: {
      id: "inv_test_123",
      amount: 4999,
      currency: "usd",
      customer: "cus_test_abc",
    },
  }, null, 2));
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: "Content-Type", value: "application/json" },
    { key: "X-Webhook-Secret", value: "whsec_test_signature" },
  ]);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    duration: string;
    headers: Record<string, string>;
    body: string;
  } | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [activeSection, setActiveSection] = useState<"payload" | "headers">("payload");

  const addHeader = () => setHeaders(prev => [...prev, { key: "", value: "" }]);
  const removeHeader = (i: number) => setHeaders(prev => prev.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, field: "key" | "value", val: string) => {
    setHeaders(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h));
  };

  const handleSend = () => {
    setSending(true);
    setResponse(null);
    // Simulate request
    setTimeout(() => {
      setSending(false);
      setResponse({
        status: 200,
        statusText: "OK",
        duration: `${Math.floor(Math.random() * 200 + 50)}ms`,
        headers: {
          "content-type": "application/json",
          "x-request-id": "req_" + Math.random().toString(36).slice(2, 10),
          "x-flowholt-execution": "exec_" + Math.random().toString(36).slice(2, 8),
        },
        body: JSON.stringify({
          success: true,
          executionId: "exec_" + Math.random().toString(36).slice(2, 8),
          message: "Webhook received and execution started",
        }, null, 2),
      });
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Endpoint bar */}
      <div className="flex items-center gap-2">
        <span className="inline-flex px-2 py-1 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-600">{method}</span>
        <code className="flex-1 rounded bg-zinc-50 border border-zinc-100 px-3 py-1.5 font-mono text-[11px] text-zinc-500 truncate">{url}</code>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? <><Loader2 size={12} className="animate-spin" /> Sending…</> : <><Send size={12} /> Send Test</>}
        </Button>
      </div>

      {/* Request section */}
      <div className="rounded-lg border border-zinc-200 overflow-hidden">
        <div className="flex border-b border-zinc-100">
          <button
            onClick={() => setActiveSection("payload")}
            className={cn(
              "px-4 py-2 text-[11px] font-medium border-b-2 -mb-px transition-colors",
              activeSection === "payload" ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <Code size={10} className="inline mr-1" /> Body
          </button>
          <button
            onClick={() => setActiveSection("headers")}
            className={cn(
              "px-4 py-2 text-[11px] font-medium border-b-2 -mb-px transition-colors",
              activeSection === "headers" ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            Headers ({headers.length})
          </button>
        </div>

        {activeSection === "payload" && (
          <textarea
            value={payload}
            onChange={e => setPayload(e.target.value)}
            className="w-full h-[200px] p-3 font-mono text-[11px] text-zinc-700 bg-zinc-50/50 resize-none focus:outline-none"
            spellCheck={false}
          />
        )}

        {activeSection === "headers" && (
          <div className="p-3 space-y-2">
            {headers.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={h.key}
                  onChange={e => updateHeader(i, "key", e.target.value)}
                  placeholder="Header name"
                  className="h-7 flex-1 rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-mono text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                />
                <input
                  value={h.value}
                  onChange={e => updateHeader(i, "value", e.target.value)}
                  placeholder="Value"
                  className="h-7 flex-[2] rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-mono text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                />
                <button onClick={() => removeHeader(i)} className="text-zinc-300 hover:text-red-500 transition-colors">
                  <XCircle size={12} />
                </button>
              </div>
            ))}
            <button onClick={addHeader} className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors">+ Add header</button>
          </div>
        )}
      </div>

      {/* Response section */}
      {response && (
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/50 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-500">Response</span>
              <Badge variant={response.status < 300 ? "success" : response.status < 500 ? "warning" : "danger"}>
                {response.status} {response.statusText}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><Clock size={9} /> {response.duration}</span>
              <button
                onClick={() => setShowHeaders(o => !o)}
                className="hover:text-zinc-600 transition-colors flex items-center gap-0.5"
              >
                {showHeaders ? <ChevronDown size={9} /> : <ChevronRightIcon size={9} />} Headers
              </button>
            </div>
          </div>

          {showHeaders && (
            <div className="px-4 py-2 bg-zinc-50/30 border-b border-zinc-100 space-y-1">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-[10px]">
                  <span className="text-zinc-400 font-mono">{k}:</span>
                  <span className="text-zinc-600 font-mono">{v}</span>
                </div>
              ))}
            </div>
          )}

          <pre className="p-3 font-mono text-[11px] text-zinc-700 bg-white max-h-[200px] overflow-y-auto whitespace-pre-wrap">
            {response.body}
          </pre>
        </div>
      )}

      {/* Sample payloads */}
      <div>
        <p className="text-[11px] font-medium text-zinc-500 mb-2">Quick Payloads</p>
        <div className="flex gap-2">
          {[
            { label: "Invoice Paid", payload: { event: "invoice.paid", data: { id: "inv_123", amount: 4999, currency: "usd" } } },
            { label: "Customer Created", payload: { event: "customer.created", data: { id: "cus_abc", email: "test@example.com" } } },
            { label: "Empty", payload: {} },
          ].map(sample => (
            <button
              key={sample.label}
              onClick={() => setPayload(JSON.stringify(sample.payload, null, 2))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-medium text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
