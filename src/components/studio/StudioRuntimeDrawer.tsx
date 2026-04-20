import { useState, useMemo } from "react";
import {
  CheckCircle2, XCircle, Clock, Loader2, ChevronDown, Copy,
  Search, Filter, Cpu, DollarSign, Zap, Brain, AlertTriangle,
  ArrowDown, ArrowUp, RefreshCw, BarChart3, Eye, Sparkles, Download, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutionSummary, ExecutionStepResult } from "@/lib/api";

const drawerTabs = [
  { key: "Output", badge: null },
  { key: "Trace", badge: "2/5" },
  { key: "AI Reasoning", badge: null },
  { key: "Logs", badge: "4" },
  { key: "Human Tasks", badge: null },
];

/* ── Mock execution data ── */
const traceSteps = [
  { id: "n1", name: "Webhook Trigger",  status: "success", duration: "2ms",   items: 1, ts: "09:42:01.120", input: 324, output: 324, type: "trigger", error: "" },
  { id: "n2", name: "Enrich Lead Data", status: "success", duration: "342ms", items: 1, ts: "09:42:01.122", input: 324, output: 1280, type: "integration", error: "" },
  { id: "n3", name: "Score with AI",    status: "error",   duration: "3.4s",  items: 0, ts: "09:42:01.464", input: 1280, output: 0, type: "ai", error: "OpenAI API Error 429: Rate limit exceeded. You have sent too many requests. Please try again in 20s." },
  { id: "n4", name: "Route by Score",   status: "pending", duration: "—",     items: 0, ts: "—", input: 0, output: 0, type: "logic", error: "" },
  { id: "n5", name: "Update CRM",       status: "pending", duration: "—",     items: 0, ts: "—", input: 0, output: 0, type: "integration", error: "" },
];

/* ── AI reasoning trace ── */
const aiReasoningSteps = [
  { step: 1, type: "input" as const, label: "Prompt Construction", detail: "System prompt (120 tokens) + Lead data context (192 tokens)", tokens: 312, duration: "8ms" },
  { step: 2, type: "thinking" as const, label: "Model Inference", detail: "GPT-4o analyzing lead: company size=1200, title=VP Engineering, tech stack=[React, Python, AWS], funding=$25M Series B", tokens: 0, duration: "980ms" },
  { step: 3, type: "output" as const, label: "Structured Output", detail: '{"score": 87, "reasons": ["Senior title (VP)", "Large company (1,200 employees)", "Tech-aligned stack"], "confidence": 0.92}', tokens: 156, duration: "240ms" },
  { step: 4, type: "validate" as const, label: "Schema Validation", detail: "Output matches expected JSON schema: score(number 0-100), reasons(string[]), confidence(number 0-1)", tokens: 0, duration: "1ms" },
];

const tokenUsageSummary = {
  inputTokens: 312,
  outputTokens: 156,
  totalTokens: 468,
  model: "gpt-4o",
  cost: "$0.0042",
  cacheHit: false,
  latency: "1,229ms",
};

const mockLogs = [
  { ts: "09:42:01.120", level: "info",  msg: "[Webhook Trigger] Received POST /leads/inbound", node: "n1", data: '{"method":"POST","path":"/leads/inbound","headers":{"content-type":"application/json"},"body_size":"324 bytes"}' },
  { ts: "09:42:01.122", level: "info",  msg: "[Enrich Lead Data] Enriched alex@acme.com via Clearbit", node: "n2", data: null },
  { ts: "09:42:01.464", level: "info",  msg: "[Score with AI] Sending prompt to GPT-4o…", node: "n3", data: null },
  { ts: "09:42:01.012", level: "debug", msg: "[Score with AI] token_count=312, model=gpt-4o, temp=0.3", node: "n3", data: '{"model":"gpt-4o","temperature":0.3,"max_tokens":512,"input_tokens":312}' },
  { ts: "09:42:02.440", level: "info",  msg: "[Score with AI] Response received, latency=980ms", node: "n3", data: null },
  { ts: "09:42:02.441", level: "debug", msg: "[Score with AI] output_tokens=156, total_cost=$0.0042", node: "n3", data: '{"output_tokens":156,"total_cost":"$0.0042","cache_hit":false}' },
  { ts: "09:42:02.442", level: "warn",  msg: "[Score with AI] Confidence below threshold (0.92 < 0.95)", node: "n3", data: null },
  { ts: "09:42:02.443", level: "info",  msg: "[Score with AI] Schema validation passed", node: "n3", data: null },
  { ts: "09:42:04.900", level: "error", msg: "[Score with AI] OpenAI API Error 429: Rate limit exceeded", node: "n3", data: '{"status":429,"error":"rate_limit_exceeded","retry_after":20,"headers":{"x-ratelimit-remaining":"0"}}' },
];

const outputJson = `{
  "email": "alex@acme.com",
  "name": "Alex Chen",
  "title": "VP Engineering",
  "employees": 1200,
  "score": 87,
  "reasons": ["Senior title", "Large company", "Tech role"],
  "category": "High Quality",
  "confidence": 0.92,
  "model": "gpt-4o",
  "latency_ms": 1229
}`;

const statusIcon: Record<string, React.ReactNode> = {
  success: <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />,
  running: <Loader2 size={12} className="animate-spin text-blue-500 flex-shrink-0" />,
  error:   <XCircle size={12} className="text-red-500 flex-shrink-0" />,
  pending: <Clock size={12} className="text-zinc-300 flex-shrink-0" />,
};

const logLevelColor: Record<string, string> = {
  info:  "text-zinc-500",
  debug: "text-zinc-400",
  warn:  "text-amber-600",
  error: "text-red-600",
};

const logLevelBg: Record<string, string> = {
  info:  "bg-zinc-50",
  debug: "bg-zinc-50",
  warn:  "bg-amber-50",
  error: "bg-red-50",
};

type LogLevel = "all" | "info" | "debug" | "warn" | "error";

export function StudioRuntimeDrawer({ onAskAI, executionData }: { onAskAI?: (context: string) => void; executionData?: ExecutionSummary | null }) {
  const [activeTab, setActiveTab] = useState("Output");
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<LogLevel>("all");
  const [logSearch, setLogSearch] = useState("");
  const [showTokenPanel, setShowTokenPanel] = useState(true);
  const [liveTail, setLiveTail] = useState(true);
  const [expandedLogIdx, setExpandedLogIdx] = useState<number | null>(null);

  // Derive trace steps from real execution data or fall back to mock
  const hasRealData = !!executionData?.steps?.length;
  const activeTraceSteps = useMemo(() => {
    if (!hasRealData) return traceSteps;
    return executionData!.steps.map((s: ExecutionStepResult) => ({
      id: s.step_id ?? s.name,
      name: s.name,
      status: s.status === "failed" ? "error" : s.status === "skipped" ? "pending" : s.status,
      duration: s.duration_ms >= 1000 ? `${(s.duration_ms / 1000).toFixed(1)}s` : `${s.duration_ms}ms`,
      items: s.output ? Object.keys(s.output).length : 0,
      ts: executionData!.started_at ? new Date(executionData!.started_at).toLocaleTimeString() : "—",
      input: 0,
      output: s.output ? JSON.stringify(s.output).length : 0,
      type: s.step_type ?? "integration",
      error: s.status === "failed" && s.output?.error ? String(s.output.error) : "",
      rawOutput: s.output,
      pinnedDataUsed: s.pinned_data_used,
    }));
  }, [executionData, hasRealData]);

  // Build output JSON from real data
  const activeOutputJson = useMemo(() => {
    if (!hasRealData) return outputJson;
    const lastSuccess = [...executionData!.steps].reverse().find(s => s.status === "success" && s.output);
    if (lastSuccess?.output) return JSON.stringify(lastSuccess.output, null, 2);
    if (executionData!.error_text) return JSON.stringify({ error: executionData!.error_text }, null, 2);
    return JSON.stringify({ status: executionData!.status, steps: executionData!.steps.length }, null, 2);
  }, [executionData, hasRealData]);

  // Build logs from real execution
  const activeLogs = useMemo(() => {
    if (!hasRealData) return mockLogs;
    return executionData!.steps.flatMap((s: ExecutionStepResult) => {
      const logs: typeof mockLogs = [];
      const ts = executionData!.started_at ? new Date(executionData!.started_at).toLocaleTimeString() : "—";
      logs.push({
        ts,
        level: s.status === "failed" ? "error" : "info",
        msg: `[${s.name}] ${s.status === "failed" ? "Failed" : s.status === "success" ? "Completed" : s.status} in ${s.duration_ms}ms${s.pinned_data_used ? " (pinned data)" : ""}`,
        node: s.step_id ?? "",
        data: s.output ? JSON.stringify(s.output) : null,
      });
      return logs;
    });
  }, [executionData, hasRealData]);

  // Execution summary stats for header
  const execSummary = useMemo(() => {
    if (!hasRealData) return tokenUsageSummary;
    const totalMs = executionData!.duration_ms ?? executionData!.steps.reduce((sum, s) => sum + s.duration_ms, 0);
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      model: executionData!.status,
      cost: "—",
      cacheHit: false,
      latency: totalMs >= 1000 ? `${(totalMs / 1000).toFixed(1)}s` : `${totalMs}ms`,
    };
  }, [executionData, hasRealData]);

  // Tab badges from real data
  const drawerTabsActive = useMemo(() => {
    if (!hasRealData) return drawerTabs;
    const successCount = executionData!.steps.filter(s => s.status === "success").length;
    const totalCount = executionData!.steps.length;
    const logCount = activeLogs.length;
    return [
      { key: "Output", badge: null },
      { key: "Trace", badge: `${successCount}/${totalCount}` },
      { key: "AI Reasoning", badge: null },
      { key: "Logs", badge: String(logCount) },
      { key: "Human Tasks", badge: null },
    ];
  }, [executionData, hasRealData, activeLogs]);

  const filteredLogs = activeLogs.filter(l => {
    if (logFilter !== "all" && l.level !== logFilter) return false;
    if (logSearch && !l.msg.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  // Total duration for timing bar proportions
  const maxDurationMs = Math.max(...activeTraceSteps.map(s => {
    const d = s.duration;
    if (d === "—") return 0;
    return parseFloat(d) * (d.includes("s") && !d.includes("ms") ? 1000 : 1);
  }), 1);

  return (
    <div className="flex h-72 flex-col border-t border-zinc-100 bg-white overflow-hidden">
      {/* Tab bar with token summary */}
      <div className="flex items-center border-b border-zinc-100 px-4 flex-shrink-0">
        <div className="flex items-end gap-3 flex-1">
          {drawerTabsActive.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative flex items-center gap-1 pb-2 pt-2 text-[10px] font-medium transition-colors",
                activeTab === tab.key ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab.key}
              {tab.badge && (
                <span className={cn("rounded-full px-1 py-0 text-[7px] font-semibold", activeTab === tab.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400")}>{tab.badge}</span>
              )}
              {activeTab === tab.key && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-zinc-900" />}
            </button>
          ))}
          {hasRealData && (
            <span className="ml-2 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[7px] font-semibold text-green-600">
              LIVE · {executionData!.status}
            </span>
          )}
          {!hasRealData && (
            <span className="ml-2 rounded-full bg-zinc-50 border border-zinc-200 px-2 py-0.5 text-[7px] font-medium text-zinc-400">
              SAMPLE DATA
            </span>
          )}
        </div>

        {/* Token usage mini-bar */}
        <div className="flex items-center gap-2 py-2">
          <div className="flex items-center gap-1 rounded border border-zinc-100 bg-zinc-50 px-2 py-0.5">
            <Cpu size={9} className="text-zinc-400" />
            <span className="text-[8px] font-medium text-zinc-500">{execSummary.totalTokens || "—"} tok</span>
          </div>
          <div className="flex items-center gap-1 rounded border border-zinc-100 bg-zinc-50 px-2 py-0.5">
            <DollarSign size={9} className="text-zinc-400" />
            <span className="text-[8px] font-medium text-zinc-500">{execSummary.cost}</span>
          </div>
          <div className="flex items-center gap-1 rounded border border-zinc-100 bg-zinc-50 px-2 py-0.5">
            <Clock size={9} className="text-zinc-400" />
            <span className="text-[8px] font-medium text-zinc-500">{execSummary.latency}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Output tab */}
        {activeTab === "Output" && (
          <div className="flex h-full">
            <div className="flex-1 relative group">
              <pre className="p-3 text-[10px] font-mono text-zinc-700 leading-relaxed h-full overflow-auto">{activeOutputJson}</pre>
              <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex h-6 w-6 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600">
                <Copy size={9} />
              </button>
            </div>
            {/* Token sidebar */}
            {showTokenPanel && (
              <div className="w-48 border-l border-zinc-100 bg-zinc-50/50 p-3 flex-shrink-0">
                <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Execution Stats</p>
                <div className="space-y-2">
                  <StatRow icon={Cpu} label="Model" value={execSummary.model} />
                  <StatRow icon={ArrowUp} label="Input tokens" value={String(execSummary.inputTokens)} />
                  <StatRow icon={ArrowDown} label="Output tokens" value={String(execSummary.outputTokens)} />
                  <StatRow icon={Zap} label="Total tokens" value={String(execSummary.totalTokens)} highlight />
                  <StatRow icon={DollarSign} label="Cost" value={execSummary.cost} highlight />
                  <StatRow icon={Clock} label="Latency" value={execSummary.latency} />
                  <div className="pt-2 border-t border-zinc-100">
                    <div className="flex items-center gap-1 text-[8px] text-zinc-400">
                      <BarChart3 size={8} />
                      <span>Cache: {execSummary.cacheHit ? "Hit" : "Miss"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trace tab */}
        {activeTab === "Trace" && (
          <div>
            {/* Re-run bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 bg-zinc-50/50">
              <button className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[9px] font-medium text-white hover:bg-zinc-700 transition-colors">
                <RefreshCw size={9} /> Re-run All
              </button>
              <button className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1 text-[9px] font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">
                <Eye size={9} /> Compare with Last
              </button>
              <span className="ml-auto text-[8px] text-zinc-400">
                Total: {activeTraceSteps.filter(s => s.status === "success").length}/{activeTraceSteps.length} passed · {activeTraceSteps.reduce((sum, s) => { const d = s.duration; if (d === "—") return sum; return sum + parseFloat(d) * (d.includes("s") && !d.includes("ms") ? 1000 : 1); }, 0).toFixed(0)}ms
              </span>
            </div>
            {/* Timing bar visualization */}
            <div className="px-4 py-2 border-b border-zinc-50 flex items-center gap-0.5">
              {activeTraceSteps.map(step => {
                const d = step.duration;
                const ms = d === "—" ? 0 : parseFloat(d) * (d.includes("s") && !d.includes("ms") ? 1000 : 1);
                const pct = Math.max(4, (ms / maxDurationMs) * 100);
                const color = step.status === "success" ? "bg-emerald-400" : step.status === "error" ? "bg-red-400" : step.status === "running" ? "bg-blue-400" : "bg-zinc-200";
                return (
                  <div key={step.id} className="group relative" style={{ width: `${pct}%` }}>
                    <div className={cn("h-3 rounded-sm transition-all", color, "hover:opacity-80")} title={`${step.name}: ${step.duration}`} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                      <div className="rounded bg-zinc-900 px-2 py-1 text-[8px] text-white whitespace-nowrap shadow-lg">
                        {step.name} — {step.duration}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="divide-y divide-zinc-50">
            {activeTraceSteps.map((step) => (
              <div key={step.id}>
                <button
                  onClick={() => setExpandedNode(expandedNode === step.id ? null : step.id)}
                  className="flex w-full items-center gap-2 px-4 py-2 hover:bg-zinc-50 transition-colors"
                >
                  {statusIcon[step.status] || statusIcon.pending}
                  <span className="flex-1 text-left text-[11px] text-zinc-700 font-medium truncate">{step.name}</span>
                  {step.type === "ai" && <Brain size={9} className="text-violet-400 flex-shrink-0" />}
                  {/* Mini timing bar inline */}
                  <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className={cn("h-full rounded-full", step.status === "success" ? "bg-emerald-400" : step.status === "error" ? "bg-red-400" : step.status === "running" ? "bg-blue-400 animate-pulse" : "bg-zinc-200")}
                      style={{ width: `${step.duration === "—" ? 0 : Math.max(5, (parseFloat(step.duration) * (step.duration.includes("s") && !step.duration.includes("ms") ? 1000 : 1) / maxDurationMs) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono flex-shrink-0 w-10 text-right">{step.duration}</span>
                  <span className="text-[9px] text-zinc-300 font-mono ml-1 flex-shrink-0">{step.ts}</span>
                  {step.items > 0 && <span className="rounded bg-zinc-100 px-1 py-0 text-[7px] font-semibold text-zinc-500">{step.items}×</span>}
                  <ChevronDown size={10} className={cn("text-zinc-300 transition-transform", expandedNode === step.id && "rotate-180")} />
                </button>
                {expandedNode === step.id && step.status === "success" && (
                  <div className="bg-zinc-50 border-t border-zinc-100 px-4 py-2">
                    <div className="flex items-center gap-3 text-[9px] text-zinc-500 mb-1.5 flex-wrap">
                      <span>{step.items} item(s)</span>
                      <span className="text-zinc-200">·</span>
                      <span>In: {step.input}B</span>
                      <span className="text-zinc-200">·</span>
                      <span>Out: {step.output}B</span>
                      {step.pinnedDataUsed && (
                        <>
                          <span className="text-zinc-200">·</span>
                          <span className="text-amber-500 font-medium">Pinned data</span>
                        </>
                      )}
                      {step.type === "ai" && (
                        <>
                          <span className="text-zinc-200">·</span>
                          <span className="text-violet-500 font-medium">AI: {tokenUsageSummary.totalTokens} tok</span>
                        </>
                      )}
                    </div>
                    <pre className="text-[9px] font-mono text-zinc-600 leading-relaxed max-h-20 overflow-y-auto rounded bg-white border border-zinc-100 p-2">
                      {step.rawOutput ? JSON.stringify(step.rawOutput, null, 2) : "{\n  \"email\": \"alex@acme.com\",\n  \"name\": \"Alex Chen\"\n}"}
                    </pre>
                  </div>
                )}
                {expandedNode === step.id && step.status === "error" && step.error && (
                  <div className="bg-red-50/50 border-t border-red-100 px-4 py-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle size={10} className="text-red-500" />
                      <span className="text-[10px] font-semibold text-red-600">Error</span>
                    </div>
                    <pre className="text-[9px] font-mono text-red-600 leading-relaxed max-h-16 overflow-y-auto rounded bg-white border border-red-200 p-2 mb-2">
                      {step.error}
                    </pre>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-[9px] font-medium text-red-700 hover:bg-red-200 transition-colors">
                        <RefreshCw size={9} /> Retry
                      </button>
                      {onAskAI && (
                        <button
                          onClick={() => onAskAI(`Debug error in "${step.name}": ${step.error}`)}
                          className="flex items-center gap-1 rounded bg-violet-100 px-2 py-1 text-[9px] font-medium text-violet-700 hover:bg-violet-200 transition-colors"
                        >
                          <Sparkles size={9} /> Ask AI Assistant
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        )}

        {/* AI Reasoning tab */}
        {activeTab === "AI Reasoning" && (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Brain size={12} className="text-violet-500" />
                <span className="text-[11px] font-semibold text-zinc-700">Score with AI — Reasoning Trace</span>
              </div>
              <span className="text-[9px] text-zinc-400">{tokenUsageSummary.model} · {tokenUsageSummary.latency}</span>
            </div>

            {aiReasoningSteps.map((step) => (
              <div key={step.step} className="flex items-start gap-2">
                <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white",
                    step.type === "input" ? "bg-blue-500"
                      : step.type === "thinking" ? "bg-violet-500"
                      : step.type === "output" ? "bg-green-500"
                      : "bg-zinc-400"
                  )}>
                    {step.step}
                  </span>
                  {step.step < aiReasoningSteps.length && <div className="w-px h-full bg-zinc-200 mt-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-zinc-700">{step.label}</span>
                    <span className="text-[8px] text-zinc-300">{step.duration}</span>
                    {step.tokens > 0 && (
                      <span className="rounded bg-violet-50 border border-violet-100 px-1 py-0 text-[7px] font-semibold text-violet-500">{step.tokens} tok</span>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-0.5 break-all leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}

            {/* Cost breakdown */}
            <div className="mt-2 rounded-lg border border-zinc-100 bg-zinc-50 p-2">
              <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Cost Breakdown</p>
              <div className="grid grid-cols-3 gap-2 text-[9px]">
                <div><span className="text-zinc-400">Input:</span> <span className="text-zinc-600 font-mono">{tokenUsageSummary.inputTokens} tok</span></div>
                <div><span className="text-zinc-400">Output:</span> <span className="text-zinc-600 font-mono">{tokenUsageSummary.outputTokens} tok</span></div>
                <div><span className="text-zinc-400">Total:</span> <span className="text-zinc-700 font-semibold">{tokenUsageSummary.cost}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Debug Console (Logs tab) */}
        {activeTab === "Logs" && (
          <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-50 bg-zinc-50/50">
              <div className="flex items-center gap-1 flex-1 rounded border border-zinc-200 bg-white px-2 py-1">
                <Search size={10} className="text-zinc-400" />
                <input
                  className="flex-1 text-[10px] outline-none bg-transparent text-zinc-700 placeholder:text-zinc-300"
                  placeholder="Filter logs… (supports regex)"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-0.5 rounded border border-zinc-200 bg-white p-0.5">
                {(["all", "info", "warn", "error", "debug"] as LogLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setLogFilter(level)}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[8px] font-medium capitalize transition-colors",
                      logFilter === level ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setLiveTail(t => !t)}
                className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-medium transition-colors border",
                  liveTail ? "border-green-200 bg-green-50 text-green-700" : "border-zinc-200 bg-white text-zinc-400"
                )}
              >
                <ArrowDown size={8} className={liveTail ? "animate-bounce" : ""} /> Live
              </button>
              <button
                onClick={() => {
                  const txt = filteredLogs.map(l => `${l.ts} [${l.level.toUpperCase()}] ${l.msg}`).join("\n");
                  navigator.clipboard.writeText(txt);
                }}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-medium text-zinc-400 hover:text-zinc-600 border border-zinc-200 bg-white transition-colors"
              >
                <Download size={8} /> Export
              </button>
            </div>
            {/* Log entries */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono">
              {filteredLogs.length === 0 ? (
                <p className="text-[10px] text-zinc-300 text-center py-4">No logs match filter</p>
              ) : (
                filteredLogs.map((log, i) => (
                  <div key={i}>
                    <div
                      className={cn(
                        "flex items-start gap-2 text-[9px] rounded px-1.5 py-0.5 hover:bg-zinc-50 transition-colors group cursor-pointer",
                        log.level === "warn" && "bg-amber-50/50",
                        log.level === "error" && "bg-red-50/50",
                        expandedLogIdx === i && "bg-zinc-50 ring-1 ring-zinc-200"
                      )}
                      onClick={() => setExpandedLogIdx(expandedLogIdx === i ? null : i)}
                    >
                      {log.data && (
                        <ChevronRight size={8} className={cn("text-zinc-300 flex-shrink-0 mt-0.5 transition-transform", expandedLogIdx === i && "rotate-90")} />
                      )}
                      <span className="text-zinc-400 flex-shrink-0 w-[72px]">{log.ts}</span>
                      <span className={cn("uppercase font-semibold flex-shrink-0 w-9", logLevelColor[log.level])}>{log.level}</span>
                      <span className="text-zinc-600 break-all flex-1">{log.msg}</span>
                      {(log.level === "error" || log.level === "warn") && onAskAI && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onAskAI(`Debug ${log.level}: ${log.msg}`); }}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 rounded bg-violet-100 px-1.5 py-0.5 text-[7px] font-medium text-violet-700 hover:bg-violet-200 transition-all flex-shrink-0"
                        >
                          <Sparkles size={7} /> Ask AI
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(log.msg); }}
                        className="opacity-0 group-hover:opacity-100 flex items-center rounded px-1 py-0.5 text-zinc-300 hover:text-zinc-500 transition-all flex-shrink-0"
                      >
                        <Copy size={7} />
                      </button>
                    </div>
                    {/* Structured JSON viewer */}
                    {expandedLogIdx === i && log.data && (
                      <div className="ml-6 mt-0.5 mb-1 rounded-md border border-zinc-100 bg-zinc-50 overflow-hidden">
                        <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-100">
                          <span className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wider">Structured Data</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(log.data!)}
                            className="text-[7px] text-zinc-400 hover:text-zinc-600 flex items-center gap-0.5"
                          >
                            <Copy size={7} /> Copy JSON
                          </button>
                        </div>
                        <pre className="px-2 py-1.5 text-[9px] text-zinc-600 overflow-x-auto whitespace-pre-wrap">
                          {(() => { try { return JSON.stringify(JSON.parse(log.data!), null, 2); } catch { return log.data; } })()}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
              {liveTail && (
                <div className="flex items-center gap-1.5 py-1 text-[8px] text-green-500 animate-pulse">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Watching for new logs…
                </div>
              )}
            </div>
          </div>
        )}

        {/* Human Tasks tab */}
        {activeTab === "Human Tasks" && (
          <div className="flex flex-col items-center justify-center h-full gap-1.5 p-4">
            <CheckCircle2 size={24} className="text-zinc-200" />
            <p className="text-[12px] text-zinc-400">No human tasks pending.</p>
            <p className="text-[10px] text-zinc-300 max-w-[200px] text-center">Add a "Wait for approval" node to enable human-in-the-loop workflows.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Icon size={8} className="text-zinc-400" />
        <span className="text-[8px] text-zinc-400">{label}</span>
      </div>
      <span className={cn("text-[9px] font-mono", highlight ? "text-zinc-700 font-semibold" : "text-zinc-500")}>{value}</span>
    </div>
  );
}
