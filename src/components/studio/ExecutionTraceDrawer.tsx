import { useState } from "react";
import {
  X, ChevronRight, ChevronDown, Clock, CheckCircle2, XCircle,
  AlertTriangle, Loader2, ArrowRight, Copy, Check, Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface NodeTrace {
  node_id: string;
  node_name: string;
  node_type: string;
  status: "success" | "error" | "skipped" | "running";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
  started_at: string;
  duration_ms: number;
}

interface ExecutionTraceDrawerProps {
  open?: boolean;
  onClose?: () => void;
  executionId?: string;
}

/* ── Demo trace data ── */
const demoTrace: NodeTrace[] = [
  {
    node_id: "trigger-1",
    node_name: "Webhook Trigger",
    node_type: "webhook",
    status: "success",
    input: {},
    output: { body: { email: "user@example.com", name: "John Doe", plan: "pro" } },
    started_at: "2024-01-15T10:00:00Z",
    duration_ms: 12,
  },
  {
    node_id: "http-1",
    node_name: "Fetch CRM Contact",
    node_type: "http_request",
    status: "success",
    input: { url: "https://api.crm.io/contacts", params: { email: "user@example.com" } },
    output: { id: "c-123", score: 85, company: "Acme Corp", tier: "enterprise" },
    started_at: "2024-01-15T10:00:00.012Z",
    duration_ms: 234,
  },
  {
    node_id: "if-1",
    node_name: "Score Check",
    node_type: "if",
    status: "success",
    input: { condition: "score > 70" },
    output: { branch: "true", matched: true },
    started_at: "2024-01-15T10:00:00.246Z",
    duration_ms: 2,
  },
  {
    node_id: "set-1",
    node_name: "Enrich Data",
    node_type: "set",
    status: "success",
    input: { contact: { id: "c-123", score: 85 }, plan: "pro" },
    output: { enriched: { id: "c-123", score: 85, plan: "pro", priority: "high", segment: "enterprise-pro" } },
    started_at: "2024-01-15T10:00:00.248Z",
    duration_ms: 5,
  },
  {
    node_id: "slack-1",
    node_name: "Notify Sales",
    node_type: "slack",
    status: "error",
    input: { channel: "#sales-leads", message: "New high-priority lead: John Doe (Acme Corp)" },
    output: {},
    error: "SlackAPIError: channel_not_found — The specified channel '#sales-leads' does not exist or the bot is not a member.",
    started_at: "2024-01-15T10:00:00.253Z",
    duration_ms: 1823,
  },
  {
    node_id: "email-1",
    node_name: "Send Confirmation",
    node_type: "email",
    status: "skipped",
    input: {},
    output: {},
    started_at: "2024-01-15T10:00:02.076Z",
    duration_ms: 0,
  },
];

const statusConfig = {
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500", barColor: "bg-green-400" },
  error:   { icon: XCircle,      color: "text-red-500",   bg: "bg-red-500",   barColor: "bg-red-400" },
  skipped: { icon: AlertTriangle, color: "text-zinc-400", bg: "bg-zinc-300",  barColor: "bg-zinc-300" },
  running: { icon: Loader2,      color: "text-blue-500",  bg: "bg-blue-500",  barColor: "bg-blue-400" },
};

export function ExecutionTraceDrawer({
  open = true,
  onClose,
  executionId = "exec-1247",
}: ExecutionTraceDrawerProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  if (!open) return null;

  const trace = demoTrace;
  const totalDuration = trace.reduce((s, n) => s + n.duration_ms, 0);
  const maxDuration = Math.max(...trace.map(n => n.duration_ms), 1);
  const selected = trace.find(n => n.node_id === selectedNode);

  const togglePanel = (id: string) =>
    setExpandedPanels(p => ({ ...p, [id]: !p[id] }));

  const copyJson = (data: unknown, key: string) => {
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex" style={{ width: 520 }}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10" onClick={onClose} />

      {/* Drawer */}
      <div
        className="relative ml-auto flex flex-col h-full border-l bg-white"
        style={{
          width: 520,
          borderColor: "var(--color-border-default)",
          animation: "traceSlideIn 200ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--color-border-default)" }}>
          <div>
            <h3 className="text-[13px] font-semibold text-zinc-800">Execution Trace</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {executionId} &middot; {trace.length} nodes &middot; {totalDuration}ms total
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Timeline bars */}
        <div className="px-4 py-3 border-b space-y-1.5" style={{ borderColor: "var(--color-border-default)" }}>
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-2">Timeline</p>
          {trace.map(node => {
            const cfg = statusConfig[node.status];
            const widthPct = Math.max(2, (node.duration_ms / maxDuration) * 100);
            const isActive = selectedNode === node.node_id;
            return (
              <button
                key={node.node_id}
                onClick={() => setSelectedNode(isActive ? null : node.node_id)}
                className={cn(
                  "flex items-center gap-2 w-full rounded-md px-2 py-1 transition-all text-left",
                  isActive ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-zinc-50"
                )}
              >
                <span className="text-[10px] text-zinc-500 w-[90px] truncate">{node.node_name}</span>
                <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", cfg.barColor)}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 w-[50px] text-right">
                  {node.duration_ms}ms
                </span>
              </button>
            );
          })}
        </div>

        {/* Node list */}
        <div className="flex-1 overflow-y-auto">
          {trace.map((node, idx) => {
            const cfg = statusConfig[node.status];
            const Icon = cfg.icon;
            const isSelected = selectedNode === node.node_id;

            return (
              <div key={node.node_id}>
                {/* Node row */}
                <button
                  onClick={() => setSelectedNode(isSelected ? null : node.node_id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 text-left transition-all border-b",
                    isSelected ? "bg-blue-50/50" : "hover:bg-zinc-50"
                  )}
                  style={{ borderColor: "var(--color-border-default)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-300 w-4 text-right">{idx + 1}</span>
                    <Icon size={14} className={cn(cfg.color, node.status === "running" && "animate-spin")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-zinc-700 truncate">{node.node_name}</p>
                    <p className="text-[10px] text-zinc-400">{node.node_type} &middot; {node.duration_ms}ms</p>
                  </div>
                  {node.error && (
                    <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[9px] text-red-600 font-medium">
                      Error
                    </span>
                  )}
                  <ChevronRight size={12} className={cn("text-zinc-300 transition-transform", isSelected && "rotate-90")} />
                </button>

                {/* Expanded detail */}
                {isSelected && (
                  <div className="bg-zinc-50/50 border-b px-4 py-3 space-y-3" style={{ borderColor: "var(--color-border-default)" }}>
                    {/* Error message */}
                    {node.error && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-2.5">
                        <p className="text-[11px] font-medium text-red-700 mb-1">Error</p>
                        <p className="text-[11px] text-red-600 font-mono leading-relaxed">{node.error}</p>
                      </div>
                    )}

                    {/* Input */}
                    <div>
                      <button
                        onClick={() => togglePanel(`${node.node_id}-input`)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
                      >
                        {expandedPanels[`${node.node_id}-input`] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        Input
                        <span className="text-[9px] text-zinc-300">({Object.keys(node.input).length} keys)</span>
                      </button>
                      {expandedPanels[`${node.node_id}-input`] && (
                        <div className="mt-1.5 relative">
                          <pre className="rounded-md bg-zinc-900 text-green-300 p-2.5 text-[10px] font-mono overflow-auto max-h-[200px] leading-relaxed">
                            {JSON.stringify(node.input, null, 2)}
                          </pre>
                          <button
                            onClick={() => copyJson(node.input, `${node.node_id}-input`)}
                            className="absolute top-1.5 right-1.5 rounded p-1 bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          >
                            {copied === `${node.node_id}-input` ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Output */}
                    <div>
                      <button
                        onClick={() => togglePanel(`${node.node_id}-output`)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
                      >
                        {expandedPanels[`${node.node_id}-output`] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        Output
                        <span className="text-[9px] text-zinc-300">({Object.keys(node.output).length} keys)</span>
                      </button>
                      {expandedPanels[`${node.node_id}-output`] && (
                        <div className="mt-1.5 relative">
                          <pre className="rounded-md bg-zinc-900 text-blue-300 p-2.5 text-[10px] font-mono overflow-auto max-h-[200px] leading-relaxed">
                            {JSON.stringify(node.output, null, 2)}
                          </pre>
                          <button
                            onClick={() => copyJson(node.output, `${node.node_id}-output`)}
                            className="absolute top-1.5 right-1.5 rounded p-1 bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          >
                            {copied === `${node.node_id}-output` ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Timing detail */}
                    <div className="flex items-center gap-4 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock size={9} /> Started: {new Date(node.started_at).toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ArrowRight size={9} /> Duration: {node.duration_ms}ms
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer summary */}
        <div
          className="flex items-center justify-between px-4 py-2.5 text-[11px] border-t"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-green-600">{trace.filter(n => n.status === "success").length} passed</span>
            <span className="text-red-500">{trace.filter(n => n.status === "error").length} failed</span>
            <span className="text-zinc-400">{trace.filter(n => n.status === "skipped").length} skipped</span>
          </div>
          <span className="text-zinc-400">{totalDuration}ms total</span>
        </div>
      </div>

      <style>{`
        @keyframes traceSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
