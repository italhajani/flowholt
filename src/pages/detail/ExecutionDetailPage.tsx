import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play, Clock, GitBranch, CheckCircle2, XCircle, RefreshCw,
  ChevronRight, Terminal, AlertTriangle, Copy, ExternalLink,
  Activity, Code2, FileJson, Bug, Cpu, Braces, ChevronDown,
  Layers, ArrowRight, Zap, GitCompareArrows,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

const execution = {
  id: "exec-1247",
  workflow: "Lead Qualification Pipeline",
  workflowId: "wf-lead-qual",
  status: "success" as const,
  trigger: "webhook",
  startedAt: "Apr 18, 2026 14:08:12",
  finishedAt: "Apr 18, 2026 14:08:16",
  duration: "4.2s",
  durationMs: 4200,
  nodes: 8,
  nodesPassed: 8,
  tokens: 340,
  cost: "$0.04",
  retries: 0,
  env: "production",
  version: "v3",
  triggeredBy: "Webhook (POST /webhooks/typeform-lead)",
  executionMode: "regular",
  dataSize: "14.2 KB",
};

interface Step {
  order: number;
  name: string;
  type: "trigger" | "integration" | "ai" | "logic" | "error";
  status: "success" | "failed" | "skipped";
  durationMs: number;
  duration: string;
  startOffset: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: { message: string; stack: string };
  meta?: Record<string, string>;
}

const stepTrace: Step[] = [
  {
    order: 1, name: "Typeform Trigger", type: "trigger", status: "success", durationMs: 12, duration: "12ms", startOffset: 0,
    input: { method: "POST", path: "/webhooks/typeform-lead", headers: { "content-type": "application/json", "x-typeform-signature": "sha256=..." }, body: { form_id: "abc123", event_type: "form_response", form_response: { email: "john@acme.com", name: "John Smith", company: "Acme Corp" } } },
    output: { email: "john@acme.com", name: "John Smith", company: "Acme Corp", submitted_at: "2026-04-18T14:08:12Z" },
    meta: { "Webhook URL": "/webhooks/typeform-lead", "Content-Type": "application/json", "Payload Size": "1.2 KB" },
  },
  {
    order: 2, name: "Clearbit Enrich", type: "integration", status: "success", durationMs: 890, duration: "890ms", startOffset: 12,
    input: { email: "john@acme.com", api_key: "••••••••" },
    output: { person: { name: "John Smith", title: "VP Engineering", linkedin: "linkedin.com/in/johnsmith" }, company: { name: "Acme Corp", employees: "50-200", industry: "SaaS", funding: "$12M Series A" } },
    meta: { "API": "Clearbit Enrichment v2", "Cache": "miss", "Rate Limit": "148/150" },
  },
  {
    order: 3, name: "Score Lead (GPT-4o)", type: "ai", status: "success", durationMs: 1800, duration: "1.8s", startOffset: 902,
    input: { model: "gpt-4o", temperature: 0.3, system_prompt: "Score this lead 0-100...", messages: [{ role: "user", content: "Name: John Smith, Title: VP Engineering, Company: Acme Corp (50-200, SaaS, $12M funding)" }] },
    output: { score: 84, reasoning: "High-quality lead: VP-level at funded SaaS company in target ICP", category: "hot", confidence: 0.92, tokens_used: 340 },
    meta: { "Model": "GPT-4o", "Tokens": "340 (prompt: 280, completion: 60)", "Cost": "$0.04", "Latency (model)": "1.6s" },
  },
  {
    order: 4, name: "IF Score > 70", type: "logic", status: "success", durationMs: 1, duration: "1ms", startOffset: 2702,
    input: { condition: "score > 70", value: 84 },
    output: { branch: "true", matched: "Hot lead path" },
  },
  {
    order: 5, name: "Salesforce Create Lead", type: "integration", status: "success", durationMs: 1200, duration: "1.2s", startOffset: 2703,
    input: { object: "Lead", fields: { FirstName: "John", LastName: "Smith", Email: "john@acme.com", Company: "Acme Corp", LeadScore__c: 84 } },
    output: { id: "00Q5g00000ABC123", success: true, created: true },
    meta: { "API": "Salesforce REST v58.0", "Object": "Lead", "Operation": "create" },
  },
  {
    order: 6, name: "Slack Notify Sales", type: "integration", status: "success", durationMs: 245, duration: "245ms", startOffset: 3903,
    input: { channel: "#sales", blocks: [{ type: "section", text: { type: "mrkdwn", text: "🔥 *Hot Lead*: John Smith (Acme Corp) — Score: 84/100" } }] },
    output: { ok: true, channel: "C03ABCDEF", ts: "1713450497.000100" },
  },
  {
    order: 7, name: "Google Sheets Log", type: "integration", status: "success", durationMs: 180, duration: "180ms", startOffset: 4148,
    input: { spreadsheet_id: "1abc...xyz", sheet: "Lead Log", values: ["John Smith", "john@acme.com", "Acme Corp", 84, "hot", "2026-04-18"] },
    output: { updated_range: "'Lead Log'!A142:F142", updated_rows: 1 },
  },
  {
    order: 8, name: "Error Handler", type: "error", status: "skipped", durationMs: 0, duration: "0ms", startOffset: 4200,
    input: {},
    output: { skipped: true, reason: "No errors in execution" },
  },
];

const stepTypeColors: Record<string, string> = {
  trigger: "border-l-green-400",
  integration: "border-l-violet-300",
  ai: "border-l-zinc-800",
  logic: "border-l-blue-400",
  error: "border-l-red-300",
};

const stepTypeIcons: Record<string, React.ElementType> = {
  trigger: Zap,
  integration: Layers,
  ai: Cpu,
  logic: GitBranch,
  error: Bug,
};

const tabs = [
  { id: "trace", label: "Trace", icon: <Terminal size={13} /> },
  { id: "waterfall", label: "Waterfall", icon: <Activity size={13} /> },
  { id: "compare", label: "Compare", icon: <GitCompareArrows size={13} /> },
  { id: "overview", label: "Overview", icon: <Play size={13} /> },
  { id: "logs", label: "Logs", icon: <Code2 size={13} /> },
];

/* JSON viewer with syntax coloring */
function JsonViewer({ data, collapsed }: { data: unknown; collapsed?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed ?? false);
  const json = JSON.stringify(data, null, 2);
  const lines = json.split("\n");

  if (isCollapsed) {
    return (
      <button onClick={() => setIsCollapsed(false)} className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 font-mono">
        <Braces size={11} /> {typeof data === "object" && data ? `{${Object.keys(data as object).length} keys}` : "..."} <ChevronRight size={10} />
      </button>
    );
  }

  return (
    <div className="relative group">
      <button onClick={() => setIsCollapsed(true)} className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 transition-opacity">
        <ChevronDown size={12} />
      </button>
      <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[240px] overflow-y-auto pr-6">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-zinc-300 select-none w-6 text-right mr-3 flex-shrink-0">{i + 1}</span>
            <span>{colorizeJson(line)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function colorizeJson(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    const keyMatch = remaining.match(/^(\s*)"([^"]+)":/);
    if (keyMatch) {
      parts.push(<span key={key++} className="text-zinc-400">{keyMatch[1]}</span>);
      parts.push(<span key={key++} className="text-violet-500">"{keyMatch[2]}"</span>);
      parts.push(<span key={key++} className="text-zinc-400">:</span>);
      remaining = remaining.slice(keyMatch[0].length);
      continue;
    }
    const strMatch = remaining.match(/^(\s*)"([^"]*)"/);
    if (strMatch) {
      parts.push(<span key={key++} className="text-zinc-400">{strMatch[1]}</span>);
      parts.push(<span key={key++} className="text-emerald-600">"{strMatch[2]}"</span>);
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }
    const numMatch = remaining.match(/^(\s*)(\d+\.?\d*)/);
    if (numMatch) {
      parts.push(<span key={key++} className="text-zinc-400">{numMatch[1]}</span>);
      parts.push(<span key={key++} className="text-blue-500">{numMatch[2]}</span>);
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }
    const boolMatch = remaining.match(/^(\s*)(true|false|null)/);
    if (boolMatch) {
      parts.push(<span key={key++} className="text-zinc-400">{boolMatch[1]}</span>);
      parts.push(<span key={key++} className="text-amber-500">{boolMatch[2]}</span>);
      remaining = remaining.slice(boolMatch[0].length);
      continue;
    }
    parts.push(<span key={key++} className="text-zinc-400">{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }
  return <>{parts}</>;
}

/* Waterfall timing chart */
function WaterfallChart({ steps, totalMs, onStepClick }: { steps: Step[]; totalMs: number; onStepClick?: (i: number) => void }) {
  const maxOffset = Math.max(...steps.map((s) => s.startOffset + s.durationMs));
  const scale = totalMs > 0 ? 100 / maxOffset : 0;
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Detect parallel branches — steps overlapping in time
  const getParallelGroup = (step: Step): string => {
    const overlapping = steps.filter(
      (s) => s !== step && s.startOffset < step.startOffset + step.durationMs && s.startOffset + s.durationMs > step.startOffset
    );
    return overlapping.length > 0 ? "parallel" : "sequential";
  };

  return (
    <div className="rounded-lg border border-zinc-100 bg-white shadow-xs overflow-hidden">
      {/* Time axis */}
      <div className="flex items-center border-b border-zinc-100 px-4 py-2">
        <span className="w-[180px] text-[10px] font-medium text-zinc-400">Node</span>
        <div className="flex-1 flex items-center justify-between relative">
          {[0, 25, 50, 75, 100].map((pct) => (
            <span key={pct} className="text-[9px] font-mono text-zinc-300">
              {((maxOffset * pct) / 100 / 1000).toFixed(1)}s
            </span>
          ))}
        </div>
        <span className="w-14" />
      </div>

      {steps.map((step, i) => {
        const left = step.startOffset * scale;
        const width = Math.max(0.5, step.durationMs * scale);
        const isParallel = getParallelGroup(step) === "parallel";
        const isHovered = hoveredStep === i;

        const barColors: Record<string, string> = {
          trigger: "bg-green-400",
          integration: "bg-emerald-400",
          ai: "bg-zinc-700",
          logic: "bg-blue-400",
          error: "bg-red-300",
        };

        return (
          <div
            key={i}
            className={cn(
              "flex items-center border-b border-zinc-50 px-4 py-1.5 transition-colors cursor-pointer",
              isHovered ? "bg-blue-50/50" : "hover:bg-zinc-50/50",
            )}
            onClick={() => onStepClick?.(i)}
            onMouseEnter={() => setHoveredStep(i)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div className="w-[180px] flex items-center gap-2 flex-shrink-0">
              <span className="text-[9px] font-mono text-zinc-300 w-3">{step.order}</span>
              {(() => { const Icon = stepTypeIcons[step.type]; return <Icon size={11} className="text-zinc-400" />; })()}
              <span className="text-[11px] text-zinc-700 truncate">{step.name}</span>
              {isParallel && <span className="text-[7px] bg-blue-100 text-blue-600 rounded px-1 font-semibold">∥</span>}
            </div>
            <div className="flex-1 relative h-5">
              {/* Background gridlines */}
              {[25, 50, 75].map(pct => (
                <div key={pct} className="absolute top-0 bottom-0 border-l border-zinc-100" style={{ left: `${pct}%` }} />
              ))}
              {/* Bar */}
              <div
                className={cn(
                  "absolute top-1 h-3 rounded-full transition-all",
                  step.status === "failed" ? "bg-red-400" : step.status === "skipped" ? "bg-zinc-200" : barColors[step.type] || "bg-emerald-400",
                  isHovered && "ring-2 ring-blue-300/50 shadow-sm",
                )}
                style={{ left: `${left}%`, width: `${width}%`, minWidth: 4 }}
              >
                {/* Inline duration label for wide bars */}
                {width > 8 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono text-white/80 font-semibold">{step.duration}</span>
                )}
              </div>
              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute -top-8 bg-zinc-800 text-white text-[9px] rounded px-2 py-1 whitespace-nowrap z-20 shadow-lg pointer-events-none"
                  style={{ left: `${left + width / 2}%`, transform: "translateX(-50%)" }}
                >
                  {step.name} — {step.duration} ({Math.round((step.durationMs / totalMs) * 100)}%)
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 w-14 text-right flex-shrink-0">{step.duration}</span>
          </div>
        );
      })}

      {/* Summary footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50/50 border-t border-zinc-100">
        <span className="text-[9px] text-zinc-400">{steps.length} nodes • {steps.filter(s => s.status === "success").length} passed</span>
        <span className="text-[9px] font-mono text-zinc-400">Total: {(maxOffset / 1000).toFixed(2)}s</span>
      </div>
    </div>
  );
}

/* Log entries */
const logEntries = [
  { ts: "14:08:12.000", level: "info", msg: "Execution started", node: "—", detail: "Trigger: webhook POST /webhooks/typeform-lead" },
  { ts: "14:08:12.012", level: "info", msg: "Typeform Trigger completed", node: "Typeform Trigger", detail: "Output: 1 item (1.2 KB)" },
  { ts: "14:08:12.902", level: "info", msg: "Clearbit Enrich completed", node: "Clearbit Enrich", detail: "API call: 890ms, Cache: miss" },
  { ts: "14:08:14.702", level: "info", msg: "Score Lead completed", node: "Score Lead (GPT-4o)", detail: "Tokens: 340, Score: 84/100" },
  { ts: "14:08:14.703", level: "debug", msg: "IF condition evaluated", node: "IF Score > 70", detail: "84 > 70 → true → Hot lead path" },
  { ts: "14:08:15.903", level: "info", msg: "Salesforce Create Lead", node: "Salesforce Create Lead", detail: "Created Lead ID: 00Q5g00000ABC123" },
  { ts: "14:08:16.148", level: "info", msg: "Slack notification sent", node: "Slack Notify Sales", detail: "Channel: #sales, Thread: 1713450497" },
  { ts: "14:08:16.200", level: "info", msg: "Google Sheets row appended", node: "Google Sheets Log", detail: "Row A142:F142 in 'Lead Log'" },
  { ts: "14:08:16.200", level: "info", msg: "Execution completed", node: "—", detail: "Duration: 4.2s, Status: success, Nodes: 8/8" },
];

const levelColors: Record<string, string> = {
  info: "text-blue-500",
  debug: "text-zinc-400",
  warn: "text-amber-500",
  error: "text-red-500",
};

export function ExecutionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("trace");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [ioTab, setIoTab] = useState<"input" | "output" | "meta">("output");
  const [copied, setCopied] = useState(false);

  const copyJson = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <EntityDetailLayout
      backLabel="Executions"
      backTo="/executions"
      name={`Execution #${execution.id.split("-")[1]}`}
      status={{ label: execution.status, variant: "success" }}
      subtitle={`${execution.workflow} • ${execution.trigger} • ${execution.duration}`}
      icon={<Play size={18} className="text-green-500" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="secondary" size="sm"><RefreshCw size={12} /> Retry</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/studio/${execution.workflowId}`)}>
            <ExternalLink size={12} /> Open Workflow
          </Button>
        </>
      }
    >
      {activeTab === "trace" && (
        <div className="space-y-5">
          {/* Summary strip */}
          <div className="flex gap-4 text-[12px] flex-wrap">
            <span className="text-zinc-400">Nodes <span className="font-semibold text-green-600">{execution.nodesPassed}/{execution.nodes} passed</span></span>
            <span className="text-zinc-400">Duration <span className="font-semibold text-zinc-700">{execution.duration}</span></span>
            <span className="text-zinc-400">Tokens <span className="font-semibold text-zinc-700">{execution.tokens}</span></span>
            <span className="text-zinc-400">Cost <span className="font-semibold text-zinc-700">{execution.cost}</span></span>
            <span className="text-zinc-400">Data <span className="font-semibold text-zinc-700">{execution.dataSize}</span></span>
            <span className="text-zinc-400">Env <Badge variant="success" className="ml-0.5 text-[9px]">{execution.env}</Badge></span>
          </div>

          {/* Step trace with rich I/O */}
          <div className="space-y-1">
            {stepTrace.map((step, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3 shadow-xs hover:shadow-sm transition-all duration-150 text-left border-l-4",
                    stepTypeColors[step.type]
                  )}
                >
                  {step.status === "success" ? (
                    <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                  ) : step.status === "failed" ? (
                    <XCircle size={15} className="text-red-500 flex-shrink-0" />
                  ) : step.status === "skipped" ? (
                    <ArrowRight size={15} className="text-zinc-300 flex-shrink-0" />
                  ) : (
                    <Clock size={15} className="text-blue-500 flex-shrink-0 animate-pulse" />
                  )}
                  <span className="text-[10px] font-mono text-zinc-300 w-4">{step.order}</span>
                  {(() => { const Icon = stepTypeIcons[step.type]; return <Icon size={12} className="text-zinc-400 flex-shrink-0" />; })()}
                  <span className="text-[13px] font-medium text-zinc-800 flex-1">{step.name}</span>
                  {step.type === "ai" && (
                    <Badge variant="neutral" className="text-[9px]"><Cpu size={9} /> AI</Badge>
                  )}
                  {/* Mini waterfall bar */}
                  <div className="w-20 h-1 rounded-full bg-zinc-100 overflow-hidden mx-2 hidden lg:block">
                    <div
                      className={cn("h-full rounded-full", step.status === "failed" ? "bg-red-400" : step.type === "ai" ? "bg-zinc-600" : "bg-emerald-400")}
                      style={{ width: `${Math.max(2, (step.durationMs / execution.durationMs) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 w-14 text-right">{step.duration}</span>
                  <ChevronRight size={13} className={cn("text-zinc-300 transition-transform", expandedStep === i && "rotate-90")} />
                </button>
                {expandedStep === i && (
                  <div className="ml-8 mt-1 mb-2 rounded-lg border border-zinc-100 bg-zinc-50 overflow-hidden">
                    {/* I/O tab bar */}
                    <div className="flex items-center border-b border-zinc-100 px-4 py-1.5 gap-1">
                      {(["input", "output", ...(step.meta ? ["meta" as const] : [])] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setIoTab(tab)}
                          className={cn(
                            "rounded px-2 py-0.5 text-[10px] font-medium transition-all",
                            ioTab === tab ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                          )}
                        >
                          {tab === "input" ? "Input" : tab === "output" ? "Output" : "Meta"}
                        </button>
                      ))}
                      <button
                        onClick={() => copyJson(ioTab === "input" ? step.input : ioTab === "meta" ? step.meta : step.output)}
                        className="ml-auto text-[10px] text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors"
                      >
                        <Copy size={10} /> {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <div className="px-4 py-3">
                      {ioTab === "input" && <JsonViewer data={step.input} />}
                      {ioTab === "output" && <JsonViewer data={step.output} />}
                      {ioTab === "meta" && step.meta && (
                        <div className="space-y-1.5">
                          {Object.entries(step.meta).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2 text-[11px]">
                              <span className="text-zinc-400 w-28 flex-shrink-0">{k}</span>
                              <span className="text-zinc-700 font-mono">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {step.error && (
                      <div className="border-t border-red-100 bg-red-50 px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle size={11} className="text-red-500" />
                          <span className="text-[11px] font-semibold text-red-700">Error</span>
                        </div>
                        <p className="text-[11px] text-red-600 font-mono">{step.error.message}</p>
                        <pre className="text-[10px] text-red-400 font-mono mt-1.5 whitespace-pre-wrap max-h-[120px] overflow-y-auto">{step.error.stack}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "waterfall" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-[12px]">
            <span className="text-zinc-400">Total: <span className="font-semibold text-zinc-700">{execution.duration}</span></span>
            <span className="text-zinc-300">|</span>
            <span className="flex items-center gap-1 text-zinc-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Integration</span>
            <span className="flex items-center gap-1 text-zinc-400"><span className="h-2 w-2 rounded-full bg-zinc-700" /> AI</span>
            <span className="flex items-center gap-1 text-zinc-400"><span className="h-2 w-2 rounded-full bg-blue-400" /> Logic</span>
            <span className="flex items-center gap-1 text-zinc-400"><span className="h-2 w-2 rounded-full bg-green-400" /> Trigger</span>
          </div>
          <WaterfallChart steps={stepTrace} totalMs={execution.durationMs} onStepClick={(i) => { setActiveTab("trace"); setExpandedStep(i); }} />

          {/* Bottleneck analysis */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
            <h3 className="text-[12px] font-semibold text-zinc-700 mb-3">Bottleneck Analysis</h3>
            <div className="space-y-2">
              {[...stepTrace]
                .sort((a, b) => b.durationMs - a.durationMs)
                .slice(0, 3)
                .map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-300 w-4">{i + 1}.</span>
                    <span className="text-[11px] text-zinc-700 flex-1">{step.name}</span>
                    <div className="w-32 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", i === 0 ? "bg-amber-400" : "bg-zinc-300")}
                        style={{ width: `${(step.durationMs / execution.durationMs) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 w-14 text-right">{step.duration}</span>
                    <span className="text-[10px] text-zinc-400 w-10 text-right">{Math.round((step.durationMs / execution.durationMs) * 100)}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "compare" && <ExecutionComparePanel />}

      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-5 gap-3">
            <MiniStat label="Duration" value={execution.duration} />
            <MiniStat label="Nodes" value={`${execution.nodesPassed}/${execution.nodes}`} color="green" />
            <MiniStat label="Tokens" value={execution.tokens.toString()} />
            <MiniStat label="Cost" value={execution.cost} />
            <MiniStat label="Data" value={execution.dataSize} />
          </div>

          <DetailSection title="Execution Info">
            <DetailRow label="Workflow" value={
              <button onClick={() => navigate(`/studio/${execution.workflowId}`)} className="text-blue-600 hover:underline flex items-center gap-1">
                {execution.workflow} <ExternalLink size={10} />
              </button>
            } />
            <DetailRow label="Status" value={<StatusDot status={execution.status} label={execution.status} />} />
            <DetailRow label="Trigger" value={<Badge variant="neutral">{execution.triggeredBy}</Badge>} />
            <DetailRow label="Environment" value={<Badge variant="success">{execution.env}</Badge>} />
            <DetailRow label="Version" value={<span className="font-mono">{execution.version}</span>} />
            <DetailRow label="Started At" value={execution.startedAt} />
            <DetailRow label="Finished At" value={execution.finishedAt} />
            <DetailRow label="Duration" value={<span className="font-mono">{execution.duration}</span>} />
            <DetailRow label="Mode" value={execution.executionMode} />
            <DetailRow label="Retries" value={execution.retries.toString()} />
          </DetailSection>

          <DetailSection title="AI Metrics" description="Token usage and cost for AI-powered nodes">
            <DetailRow label="Total Tokens" value={<span className="font-mono">{execution.tokens}</span>} />
            <DetailRow label="Total Cost" value={<span className="font-mono">{execution.cost}</span>} />
            <DetailRow label="AI Nodes" value="1 (Score Lead)" />
            <DetailRow label="Model" value="GPT-4o" />
            <DetailRow label="Avg Latency" value={<span className="font-mono">1.8s</span>} />
          </DetailSection>

          <DetailSection title="Data Transfer">
            <DetailRow label="Total Payload" value={execution.dataSize} />
            <DetailRow label="Largest Node" value="Clearbit Enrich (4.8 KB)" />
            <DetailRow label="Items Processed" value="1" />
          </DetailSection>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-zinc-400">{logEntries.length} entries</span>
            <span className="text-zinc-300">|</span>
            <button className="text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors">
              <Copy size={10} /> Copy all
            </button>
          </div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-900 shadow-xs overflow-hidden font-mono text-[11px]">
            {logEntries.map((log, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-1.5 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <span className="text-zinc-500 flex-shrink-0">{log.ts}</span>
                <span className={cn("w-10 flex-shrink-0 uppercase", levelColors[log.level])}>{log.level}</span>
                <span className="text-zinc-300 flex-1">{log.msg}</span>
                {log.node !== "—" && (
                  <span className="text-zinc-500 flex-shrink-0 text-[10px]">[{log.node}]</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-400 italic">
            Showing structured logs for this execution. In production, logs stream in real-time.
          </p>
        </div>
      )}
    </EntityDetailLayout>
  );
}

/* ── Execution comparison panel ─────────────────────── */

const compareExecutions = [
  { id: "exec-1246", date: "3 min ago", status: "success" as const, duration: "4.2s" },
  { id: "exec-1245", date: "18 min ago", status: "failed" as const, duration: "2.8s" },
  { id: "exec-1244", date: "1 hr ago", status: "success" as const, duration: "3.9s" },
  { id: "exec-1243", date: "3 hrs ago", status: "success" as const, duration: "5.1s" },
];

const compareNodes = [
  {
    name: "Webhook Trigger",
    current: { status: "success" as const, duration: "12ms", output: '{ "event": "lead.created", "email": "jane@acme.com" }' },
    compare: { status: "success" as const, duration: "11ms", output: '{ "event": "lead.created", "email": "bob@corp.io" }' },
    diff: "input",
  },
  {
    name: "Enrich Contact",
    current: { status: "success" as const, duration: "340ms", output: '{ "name": "Jane Doe", "company": "Acme", "score": 85 }' },
    compare: { status: "success" as const, duration: "410ms", output: '{ "name": "Bob Smith", "company": "Corp", "score": 42 }' },
    diff: "values",
  },
  {
    name: "AI Qualify",
    current: { status: "success" as const, duration: "1.2s", output: '{ "qualified": true, "confidence": 0.92, "reason": "High intent signals" }' },
    compare: { status: "failed" as const, duration: "0.8s", output: '{ "error": "Rate limit exceeded", "retryAfter": 30 }' },
    diff: "status",
  },
  {
    name: "Send to CRM",
    current: { status: "success" as const, duration: "280ms", output: '{ "crmId": "sf-4821", "synced": true }' },
    compare: { status: "skipped" as const, duration: "—", output: "—" },
    diff: "skipped",
  },
];

const diffColors: Record<string, string> = {
  input: "border-l-blue-400",
  values: "border-l-amber-400",
  status: "border-l-red-400",
  skipped: "border-l-zinc-300",
  none: "border-l-transparent",
};

const diffLabels: Record<string, { label: string; color: string }> = {
  input: { label: "Input differs", color: "text-blue-600 bg-blue-50" },
  values: { label: "Output differs", color: "text-amber-600 bg-amber-50" },
  status: { label: "Status differs", color: "text-red-600 bg-red-50" },
  skipped: { label: "Skipped in compare", color: "text-zinc-500 bg-zinc-100" },
};

function ExecutionComparePanel() {
  const [compareTarget, setCompareTarget] = useState(compareExecutions[0].id);
  const [expandedNode, setExpandedNode] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Current</p>
          <div className="flex items-center gap-2">
            <StatusDot status="success" />
            <span className="text-[13px] font-semibold text-zinc-800">{execution.id}</span>
            <span className="text-[11px] text-zinc-400">{execution.duration}</span>
          </div>
        </div>
        <GitCompareArrows size={16} className="text-zinc-300 flex-shrink-0" />
        <div className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Compare with</p>
          <select
            value={compareTarget}
            onChange={(e) => setCompareTarget(e.target.value)}
            className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-[12px] text-zinc-700 outline-none focus:border-zinc-400"
          >
            {compareExecutions.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.id} — {ex.status} — {ex.date}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-zinc-500">{compareNodes.length} nodes compared</span>
        <span className="text-zinc-300">|</span>
        <span className="flex items-center gap-1 text-red-500">
          <XCircle size={10} /> {compareNodes.filter((n) => n.diff === "status").length} status diff
        </span>
        <span className="flex items-center gap-1 text-amber-500">
          <AlertTriangle size={10} /> {compareNodes.filter((n) => n.diff === "values").length} output diff
        </span>
        <span className="flex items-center gap-1 text-blue-500">
          <Braces size={10} /> {compareNodes.filter((n) => n.diff === "input").length} input diff
        </span>
      </div>

      {/* Node-by-node comparison */}
      <div className="space-y-1">
        {compareNodes.map((node, i) => {
          const isExpanded = expandedNode === i;
          const dl = diffLabels[node.diff];
          return (
            <div key={i} className={cn("rounded-lg border border-zinc-100 bg-white overflow-hidden border-l-[3px]", diffColors[node.diff])}>
              <button
                onClick={() => setExpandedNode(isExpanded ? null : i)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 transition-colors"
              >
                <ChevronRight size={11} className={cn("text-zinc-400 transition-transform", isExpanded && "rotate-90")} />
                <span className="text-[12px] font-medium text-zinc-800 flex-1">{node.name}</span>
                {dl && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", dl.color)}>{dl.label}</span>
                )}
                <span className="text-[10px] text-zinc-400 w-16 text-right">{node.current.duration}</span>
                <span className="text-[10px] text-zinc-300">vs</span>
                <span className="text-[10px] text-zinc-400 w-16">{node.compare.duration}</span>
              </button>
              {isExpanded && (
                <div className="grid grid-cols-2 gap-0 border-t border-zinc-100">
                  {/* Current */}
                  <div className="border-r border-zinc-100 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusDot status={node.current.status} />
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase">Current</span>
                      <span className="text-[10px] text-zinc-400">{node.current.duration}</span>
                    </div>
                    <pre className="rounded-md bg-zinc-900 p-2.5 text-[10px] text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap">{node.current.output}</pre>
                  </div>
                  {/* Compare */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusDot status={node.compare.status} />
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase">Compare</span>
                      <span className="text-[10px] text-zinc-400">{node.compare.duration}</span>
                    </div>
                    <pre className={cn(
                      "rounded-md p-2.5 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap",
                      node.diff === "status" ? "bg-red-950 text-red-300" : node.diff === "values" ? "bg-amber-950 text-amber-200" : "bg-zinc-900 text-zinc-300"
                    )}>{node.compare.output}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-zinc-400 italic">
        Compare executions side-by-side to identify regressions, data drift, and performance changes.
      </p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: "green" | "red" }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs text-center">
      <p className={cn("text-[22px] font-semibold", color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : "text-zinc-800")}>{value}</p>
      <p className="text-[11px] text-zinc-400 mt-1">{label}</p>
    </div>
  );
}
