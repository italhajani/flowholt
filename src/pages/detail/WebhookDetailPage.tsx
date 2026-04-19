import { useState } from "react";
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

/* ── Mock data ── */
const webhook = {
  id: "wh1",
  name: "Stripe Events",
  status: "active" as const,
  path: "/hooks/stripe-events",
  method: "POST",
  workflow: "Lead Qualification Pipeline",
  url: "https://api.flowholt.com/webhooks/hooks/stripe-events",
  createdAt: "Jan 8, 2026",
  lastTriggered: "2 min ago",
  deliveries24h: 47,
  successRate: 100,
  avgLatency: "124ms",
  queuePending: 0,
  signingSecret: "whsec_••••••••••••••••",
  requireSignature: true,
  rateLimit: 1000,
  expiryDays: 5,
  sequentialProcessing: false,
};

/* ── Delivery rows ── */
interface Delivery {
  id: string;
  event: string;
  status: "success" | "failed";
  httpStatus: number;
  duration: string;
  timestamp: string;
}

const mockDeliveries: Delivery[] = [
  { id: "dl1", event: "invoice.paid", status: "success", httpStatus: 200, duration: "124ms", timestamp: "2 min ago" },
  { id: "dl2", event: "customer.created", status: "success", httpStatus: 200, duration: "98ms", timestamp: "10 min ago" },
  { id: "dl3", event: "charge.failed", status: "failed", httpStatus: 502, duration: "30.1s", timestamp: "25 min ago" },
  { id: "dl4", event: "invoice.upcoming", status: "success", httpStatus: 200, duration: "112ms", timestamp: "1h ago" },
  { id: "dl5", event: "payment_intent.succeeded", status: "success", httpStatus: 200, duration: "89ms", timestamp: "2h ago" },
  { id: "dl6", event: "subscription.updated", status: "success", httpStatus: 200, duration: "145ms", timestamp: "3h ago" },
];

const deliveryColumns: Column<Delivery>[] = [
  {
    id: "status", header: "", className: "w-8",
    accessor: (row) => row.status === "success"
      ? <CheckCircle size={14} className="text-green-500" />
      : <XCircle size={14} className="text-red-500" />,
  },
  {
    id: "event", header: "Event",
    accessor: (row) => <code className="text-[11px] font-mono text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded">{row.event}</code>,
  },
  {
    id: "httpStatus", header: "HTTP Status",
    accessor: (row) => (
      <Badge variant={row.httpStatus < 300 ? "success" : row.httpStatus < 500 ? "warning" : "danger"}>
        {row.httpStatus}
      </Badge>
    ),
  },
  { id: "duration", header: "Duration", sortable: true, hideBelow: "md", accessor: (row) => <span className="font-mono text-[12px] text-zinc-500">{row.duration}</span> },
  { id: "timestamp", header: "Time", sortable: true, accessor: (row) => <span className="text-zinc-400 text-[12px]">{row.timestamp}</span> },
  {
    id: "actions", header: "", className: "w-12",
    accessor: (row) => row.status === "failed"
      ? <Button variant="ghost" size="sm" className="text-[11px]"><RefreshCw size={10} /> Retry</Button>
      : null,
  },
];

/* ── Queue rows ── */
interface QueueItem {
  id: string;
  status: "pending" | "processing" | "failed";
  received: string;
  processed: string;
  error: string;
}

const mockQueue: QueueItem[] = [
  { id: "q1", status: "pending", received: "30s ago", processed: "—", error: "—" },
  { id: "q2", status: "processing", received: "2 min ago", processed: "In progress…", error: "—" },
  { id: "q3", status: "failed", received: "15 min ago", processed: "14 min ago", error: "Connection timeout" },
];

const queueStatusVariant: Record<QueueItem["status"], "warning" | "info" | "danger"> = {
  pending: "warning",
  processing: "info",
  failed: "danger",
};

const queueColumns: Column<QueueItem>[] = [
  {
    id: "status", header: "Status",
    accessor: (row) => <Badge variant={queueStatusVariant[row.status]}>{row.status}</Badge>,
  },
  { id: "received", header: "Received", accessor: (row) => <span className="text-zinc-500 text-[12px]">{row.received}</span> },
  { id: "processed", header: "Processed", accessor: (row) => <span className="text-zinc-500 text-[12px]">{row.processed}</span> },
  { id: "error", header: "Error", accessor: (row) => <span className="text-zinc-500 text-[12px]">{row.error}</span> },
  {
    id: "actions", header: "", className: "w-24",
    accessor: (row) => (
      <div className="flex items-center gap-1">
        {row.status === "failed" && <Button variant="ghost" size="sm" className="text-[11px]"><RefreshCw size={10} /></Button>}
        <Button variant="ghost" size="sm" className="text-[11px] text-red-500 hover:text-red-600"><Trash2 size={10} /></Button>
      </div>
    ),
  },
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
  const [sigToggle, setSigToggle] = useState(webhook.requireSignature);
  const [seqToggle, setSeqToggle] = useState(webhook.sequentialProcessing);

  const copyUrl = () => {
    navigator.clipboard.writeText(webhook.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <EntityDetailLayout
      backLabel="Webhooks"
      backTo="/webhooks"
      name={webhook.name}
      status={{ label: webhook.status, variant: "success" }}
      subtitle={`${webhook.method} ${webhook.path} · ${webhook.workflow}`}
      icon={<Webhook size={18} className="text-amber-400" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="secondary" size="sm"><Copy size={12} /> Copy URL</Button>
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
                  <code className="rounded bg-zinc-50 px-2 py-0.5 font-mono text-[11px] text-zinc-600">{webhook.url}</code>
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
            <DetailRow label="Workflow" value={<span className="text-blue-600 text-[13px]">{webhook.workflow}</span>} />
            <DetailRow label="Created" value={webhook.createdAt} />
            <DetailRow label="Last triggered" value={webhook.lastTriggered} />
          </DetailSection>

          <DetailSection title="Health">
            <DetailRow label="24h Deliveries" value={<span className="font-mono">{webhook.deliveries24h}</span>} />
            <DetailRow label="Success Rate" value={<span className="font-mono text-green-600">{webhook.successRate}%</span>} />
            <DetailRow label="Average Latency" value={<span className="font-mono">{webhook.avgLatency}</span>} />
            <DetailRow label="Queue Pending" value={<span className="font-mono">{webhook.queuePending}</span>} />
          </DetailSection>

          <DetailSection title="Security">
            <DetailRow
              label="Signing Secret"
              value={<code className="rounded bg-zinc-50 px-2 py-0.5 font-mono text-[11px] text-zinc-400">{webhook.signingSecret}</code>}
            />
            <DetailRow label="Require Signature" value={<Badge variant="success">Yes</Badge>} />
            <DetailRow label="Rate Limit" value={<span className="font-mono">{webhook.rateLimit.toLocaleString()}/min</span>} />
          </DetailSection>
        </div>
      )}

      {/* ── Test ── */}
      {activeTab === "test" && <WebhookTestPanel url={webhook.url} method={webhook.method} />}

      {/* ── Deliveries ── */}
      {activeTab === "deliveries" && (
        <DataTable
          columns={deliveryColumns}
          data={mockDeliveries}
          getRowId={(d) => d.id}
          emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">No deliveries yet.</p>}
        />
      )}

      {/* ── Queue ── */}
      {activeTab === "queue" && (
        <DataTable
          columns={queueColumns}
          data={mockQueue}
          getRowId={(q) => q.id}
          emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">Queue is empty.</p>}
        />
      )}

      {/* ── Settings ── */}
      {activeTab === "settings" && (
        <div className="space-y-5">
          <DetailSection title="General">
            <div className="space-y-4">
              <FieldGroup label="Name">
                <Input defaultValue={webhook.name} className="max-w-sm" />
              </FieldGroup>
              <FieldGroup label="Endpoint URL">
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-zinc-50 border border-zinc-100 px-3 py-1.5 font-mono text-[11px] text-zinc-500">{webhook.url}</code>
                  <button onClick={copyUrl} className="text-zinc-300 hover:text-zinc-500 transition-colors">
                    <Copy size={12} />
                  </button>
                </div>
              </FieldGroup>
            </div>
          </DetailSection>

          <DetailSection title="Security">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-zinc-800">Require Signature Verification</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Reject requests without a valid HMAC signature</p>
                </div>
                <button
                  onClick={() => setSigToggle((v) => !v)}
                  className={cn("relative w-9 h-5 rounded-full transition-colors duration-200", sigToggle ? "bg-zinc-800" : "bg-zinc-200")}
                >
                  <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200", sigToggle ? "left-[18px]" : "left-0.5")} />
                </button>
              </div>
              <Button variant="secondary" size="sm"><Shield size={12} /> Regenerate Secret</Button>
            </div>
          </DetailSection>

          <DetailSection title="Rate Limiting">
            <div className="space-y-4">
              <FieldGroup label="Requests per minute">
                <Input type="number" defaultValue={webhook.rateLimit} className="max-w-[160px]" />
              </FieldGroup>
              <FieldGroup label="Expiry (days inactive)">
                <Input type="number" defaultValue={webhook.expiryDays} className="max-w-[160px]" />
              </FieldGroup>
            </div>
          </DetailSection>

          <DetailSection title="Processing">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-zinc-800">Sequential Processing</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Process deliveries one at a time in order received</p>
              </div>
              <button
                onClick={() => setSeqToggle((v) => !v)}
                className={cn("relative w-9 h-5 rounded-full transition-colors duration-200", seqToggle ? "bg-zinc-800" : "bg-zinc-200")}
              >
                <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200", seqToggle ? "left-[18px]" : "left-0.5")} />
              </button>
            </div>
          </DetailSection>

          <div className="flex justify-end">
            <Button variant="primary" size="md">Save Changes</Button>
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
