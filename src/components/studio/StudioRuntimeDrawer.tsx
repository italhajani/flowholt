import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const drawerTabs = ["Output", "Trace", "Logs", "Human Tasks"];

/* ── Mock execution data ── */
const traceSteps = [
  { id: "n1", name: "Webhook Trigger",  status: "success", duration: "2ms",   items: 1, ts: "09:42:01.120" },
  { id: "n2", name: "Enrich Lead Data", status: "success", duration: "342ms", items: 1, ts: "09:42:01.122" },
  { id: "n3", name: "Score with AI",    status: "running", duration: "—",     items: 0, ts: "09:42:01.464" },
  { id: "n4", name: "Route by Score",   status: "pending", duration: "—",     items: 0, ts: "—" },
  { id: "n5", name: "Update CRM",       status: "pending", duration: "—",     items: 0, ts: "—" },
];

const mockLogs = [
  { ts: "09:42:01.120", level: "info",  msg: "[Webhook Trigger] Received POST /leads/inbound" },
  { ts: "09:42:01.122", level: "info",  msg: "[Enrich Lead Data] Enriched alex@acme.com via Clearbit" },
  { ts: "09:42:01.464", level: "info",  msg: "[Score with AI] Sending prompt to GPT-4o…" },
  { ts: "09:42:01.012", level: "debug", msg: "[Score with AI] token_count=312, model=gpt-4o" },
];

const outputJson = `{
  "email": "alex@acme.com",
  "name": "Alex Chen",
  "title": "VP Engineering",
  "employees": 1200,
  "score": 87,
  "category": "High Quality"
}`;

const statusIcon = {
  success: <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />,
  running: <Loader2 size={13} className="animate-spin text-blue-500 flex-shrink-0" />,
  error:   <XCircle size={13} className="text-red-500 flex-shrink-0" />,
  pending: <Clock size={13} className="text-zinc-300 flex-shrink-0" />,
};

const logLevelColor: Record<string, string> = {
  info:    "text-zinc-500",
  debug:   "text-zinc-400",
  warn:    "text-amber-600",
  error:   "text-red-600",
};

export function StudioRuntimeDrawer() {
  const [activeTab, setActiveTab] = useState("Output");
  const [expandedNode, setExpandedNode] = useState<string | null>("n2");

  return (
    <div className="flex h-64 flex-col border-t border-zinc-100 bg-white overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-end gap-3 border-b border-zinc-100 px-4 flex-shrink-0">
        {drawerTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative pb-2 pt-2 text-[11px] font-medium transition-colors",
              activeTab === tab ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-zinc-900" />
            )}
          </button>
        ))}
        <span className="ml-auto mb-2 text-[10px] text-zinc-400">
          {activeTab === "Trace" ? "2 / 5 steps completed" : ""}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Output" && (
          <pre className="p-3 text-[11px] font-mono text-zinc-700 leading-relaxed">{outputJson}</pre>
        )}

        {activeTab === "Trace" && (
          <div className="divide-y divide-zinc-50">
            {traceSteps.map((step) => (
              <div key={step.id}>
                <button
                  onClick={() => setExpandedNode(expandedNode === step.id ? null : step.id)}
                  className="flex w-full items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 transition-colors"
                >
                  {statusIcon[step.status as keyof typeof statusIcon] || statusIcon.pending}
                  <span className="flex-1 text-left text-[12px] text-zinc-700 font-medium">{step.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{step.duration}</span>
                  <span className="text-[10px] text-zinc-400 font-mono ml-2">{step.ts}</span>
                  <ChevronDown size={11} className={cn("text-zinc-300 ml-1 transition-transform", expandedNode === step.id && "rotate-180")} />
                </button>
                {expandedNode === step.id && step.status === "success" && (
                  <div className="bg-zinc-50 border-t border-zinc-100 px-4 py-2">
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 mb-1.5">
                      <span>{step.items} item(s) processed</span>
                      <span className="text-zinc-300">·</span>
                      <span>Output size: ~340 B</span>
                    </div>
                    <pre className="text-[10px] font-mono text-zinc-600 leading-relaxed max-h-20 overflow-y-auto">{"{\n  \"email\": \"alex@acme.com\",\n  \"name\": \"Alex Chen\"\n}"}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Logs" && (
          <div className="p-3 space-y-1 font-mono">
            {mockLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <span className="text-zinc-400 flex-shrink-0">{log.ts}</span>
                <span className={cn("uppercase font-semibold flex-shrink-0 w-10", logLevelColor[log.level])}>{log.level}</span>
                <span className="text-zinc-600 break-all">{log.msg}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Human Tasks" && (
          <div className="flex flex-col items-center justify-center h-full gap-1.5 p-4">
            <CheckCircle2 size={24} className="text-zinc-200" />
            <p className="text-[12px] text-zinc-400">No human tasks pending.</p>
          </div>
        )}
      </div>
    </div>
  );
}

