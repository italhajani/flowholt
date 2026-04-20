import { useState, useMemo } from "react";
import {
  TestTube, Play, CheckCircle2, XCircle, Clock, ChevronRight, Search,
  Filter, Plus, BarChart3, AlertTriangle, ArrowUpDown, Eye, Trash2, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shell/PageHeader";
import { useEvalRuns } from "@/hooks/useApi";

/* ── Types ── */
interface TestRun {
  id: string;
  name: string;
  workflowName: string;
  status: "passed" | "failed" | "running" | "pending";
  totalCases: number;
  passed: number;
  failed: number;
  duration: string;
  lastRun: string;
  avgLatency: string;
  avgCost: string;
}

interface TestCase {
  id: string;
  name: string;
  status: "passed" | "failed" | "pending";
  input: string;
  expectedOutput: string;
  actualOutput: string;
  latency: string;
  cost: string;
}

/* ── Mock data ── */
const mockRuns: TestRun[] = [
  { id: "r1", name: "Lead Scorer v2.3 Eval", workflowName: "Lead Scoring Pipeline", status: "passed", totalCases: 24, passed: 22, failed: 2, duration: "1m 42s", lastRun: "2 hrs ago", avgLatency: "340ms", avgCost: "$0.12" },
  { id: "r2", name: "Support Triage Accuracy", workflowName: "Support Triage Bot", status: "failed", totalCases: 18, passed: 12, failed: 6, duration: "2m 15s", lastRun: "5 hrs ago", avgLatency: "520ms", avgCost: "$0.08" },
  { id: "r3", name: "Invoice Extract Regression", workflowName: "Invoice Extractor", status: "passed", totalCases: 30, passed: 30, failed: 0, duration: "3m 01s", lastRun: "1 day ago", avgLatency: "890ms", avgCost: "$0.24" },
  { id: "r4", name: "Summarizer Quality Check", workflowName: "Document Summarizer", status: "running", totalCases: 15, passed: 8, failed: 1, duration: "—", lastRun: "Running…", avgLatency: "—", avgCost: "—" },
  { id: "r5", name: "Classifier Baseline", workflowName: "Email Classifier", status: "pending", totalCases: 20, passed: 0, failed: 0, duration: "—", lastRun: "Never", avgLatency: "—", avgCost: "—" },
];

const mockCases: TestCase[] = [
  { id: "c1", name: "High-value enterprise lead", status: "passed", input: '{"email":"cto@fortune500.com","company":"Acme Corp","employees":5000}', expectedOutput: '{"score":92,"tier":"enterprise"}', actualOutput: '{"score":91,"tier":"enterprise"}', latency: "320ms", cost: "$0.004" },
  { id: "c2", name: "Small business lead", status: "passed", input: '{"email":"owner@shop.com","company":"My Shop","employees":5}', expectedOutput: '{"score":35,"tier":"smb"}', actualOutput: '{"score":38,"tier":"smb"}', latency: "280ms", cost: "$0.003" },
  { id: "c3", name: "Invalid email format", status: "failed", input: '{"email":"not-an-email","company":"Test"}', expectedOutput: '{"error":"invalid_email"}', actualOutput: '{"score":15,"tier":"unknown"}', latency: "310ms", cost: "$0.004" },
  { id: "c4", name: "Missing company field", status: "passed", input: '{"email":"user@domain.com","employees":50}', expectedOutput: '{"score":45,"tier":"mid_market"}', actualOutput: '{"score":44,"tier":"mid_market"}', latency: "350ms", cost: "$0.005" },
  { id: "c5", name: "Competitor email domain", status: "failed", input: '{"email":"spy@competitor.com","company":"Rival Inc","employees":2000}', expectedOutput: '{"score":0,"tier":"blocked"}', actualOutput: '{"score":78,"tier":"enterprise"}', latency: "290ms", cost: "$0.004" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  passed:  { icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50" },
  failed:  { icon: XCircle,       color: "text-red-600",    bg: "bg-red-50" },
  running: { icon: RotateCcw,     color: "text-blue-600",   bg: "bg-blue-50" },
  pending: { icon: Clock,         color: "text-zinc-500",   bg: "bg-zinc-50" },
};

/* ── Component ── */
export function EvaluationsPage() {
  const [search, setSearch] = useState("");
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");

  const { data: apiRuns } = useEvalRuns();

  const runs = useMemo(() => {
    if (apiRuns && apiRuns.length > 0) {
      return apiRuns.map((r: any) => ({
        id: r.id,
        name: r.name || `Run ${r.id}`,
        workflowName: r.workflow_name || r.dataset_id || "—",
        status: r.status || "pending",
        totalCases: r.total_cases ?? 0,
        passed: r.passed ?? 0,
        failed: r.failed ?? 0,
        duration: r.duration || "—",
        lastRun: r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
        avgLatency: r.avg_latency || "—",
        avgCost: r.avg_cost || "—",
      })) as TestRun[];
    }
    return mockRuns;
  }, [apiRuns]);

  const run = runs.find(r => r.id === selectedRun);
  const filtered = runs.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.workflowName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Evaluations"
        description="Test AI workflows with expected inputs/outputs, track accuracy, latency, and cost."
        actions={
          <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-zinc-800 transition-colors">
            <Plus size={14} /> New Test Run
          </button>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Runs", value: runs.length, icon: TestTube, color: "text-violet-600" },
          { label: "Passed", value: runs.filter(r => r.status === "passed").length, icon: CheckCircle2, color: "text-green-600" },
          { label: "Failed", value: runs.filter(r => r.status === "failed").length, icon: XCircle, color: "text-red-600" },
          { label: "Total Cases", value: runs.reduce((s, r) => s + r.totalCases, 0), icon: BarChart3, color: "text-blue-600" },
          { label: "Avg Pass Rate", value: runs.length > 0 ? `${Math.round(runs.reduce((s, r) => s + r.passed, 0) / Math.max(runs.reduce((s, r) => s + r.totalCases, 0), 1) * 100)}%` : "—", icon: ArrowUpDown, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={13} className={s.color} />
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{s.label}</span>
            </div>
            <span className="text-[20px] font-semibold text-zinc-900">{s.value}</span>
          </div>
        ))}
      </div>

      {view === "list" ? (
        <>
          {/* Search & Filter */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search evaluations…"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-[13px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-500 hover:bg-zinc-50 transition-colors">
              <Filter size={12} /> Filter
            </button>
          </div>

          {/* Runs list */}
          <div className="space-y-2">
            {filtered.map(run => {
              const s = statusConfig[run.status];
              const passRate = run.totalCases > 0 ? Math.round((run.passed / run.totalCases) * 100) : 0;
              return (
                <button
                  key={run.id}
                  onClick={() => { setSelectedRun(run.id); setView("detail"); }}
                  className="flex w-full items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left hover:bg-zinc-50 hover:border-zinc-300 transition-all group"
                >
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.bg)}>
                    <s.icon size={14} className={cn(s.color, run.status === "running" && "animate-spin")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-800 truncate">{run.name}</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase", s.bg, s.color)}>{run.status}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{run.workflowName} · {run.lastRun}</p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" />{run.passed}</span>
                    <span className="flex items-center gap-1"><XCircle size={10} className="text-red-500" />{run.failed}</span>
                    <span>{run.totalCases} cases</span>
                    <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", passRate >= 80 ? "bg-green-500" : passRate >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${passRate}%` }} />
                    </div>
                    <span className="font-medium text-zinc-600 w-8 text-right">{passRate}%</span>
                    <span>{run.duration}</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                </button>
              );
            })}
          </div>
        </>
      ) : run ? (
        /* ── Detail view ── */
        <div>
          <button onClick={() => setView("list")} className="mb-4 flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors">
            ← Back to evaluations
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", statusConfig[run.status].bg)}>
              {(() => { const S = statusConfig[run.status]; return <S.icon size={18} className={S.color} />; })()}
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-900">{run.name}</h2>
              <p className="text-[12px] text-zinc-400">{run.workflowName} · {run.totalCases} test cases · {run.duration}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                <Play size={11} /> Re-run All
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                <Plus size={11} /> Add Case
              </button>
            </div>
          </div>

          {/* Metrics cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Pass Rate", value: `${Math.round((run.passed / run.totalCases) * 100)}%`, color: "text-green-600" },
              { label: "Avg Latency", value: run.avgLatency, color: "text-blue-600" },
              { label: "Avg Cost", value: run.avgCost, color: "text-amber-600" },
              { label: "Duration", value: run.duration, color: "text-violet-600" },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{m.label}</span>
                <p className={cn("text-[18px] font-semibold mt-0.5", m.color)}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Test cases */}
          <div className="space-y-2">
            {mockCases.map(tc => {
              const s = statusConfig[tc.status];
              const outputMatch = tc.expectedOutput === tc.actualOutput;
              return (
                <TestCaseRow key={tc.id} testCase={tc} status={s} outputMatch={outputMatch} />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Test Case Row (expandable) ── */
function TestCaseRow({ testCase: tc, status: s, outputMatch }: { testCase: TestCase; status: typeof statusConfig[string]; outputMatch: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
      >
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", s.bg)}>
          <s.icon size={12} className={s.color} />
        </div>
        <span className="text-[12px] font-medium text-zinc-700 flex-1">{tc.name}</span>
        <span className="text-[10px] text-zinc-400">{tc.latency}</span>
        <span className="text-[10px] text-zinc-400">{tc.cost}</span>
        <ChevronRight size={12} className={cn("text-zinc-300 transition-transform", expanded && "rotate-90")} />
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-4 py-3 space-y-3">
          <div>
            <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Input</p>
            <pre className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 text-[11px] font-mono text-zinc-600 overflow-x-auto">{tc.input}</pre>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Expected Output</p>
              <pre className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-[11px] font-mono text-green-700 overflow-x-auto">{tc.expectedOutput}</pre>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Actual Output</p>
              <pre className={cn("rounded-lg border px-3 py-2 text-[11px] font-mono overflow-x-auto", outputMatch ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700")}>{tc.actualOutput}</pre>
            </div>
          </div>
          {!outputMatch && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
              <AlertTriangle size={12} className="text-amber-500" />
              <span className="text-[10px] text-amber-700">Output does not match expected result</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-zinc-500 hover:bg-zinc-50 transition-colors"><Eye size={10} /> View Execution</button>
            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-zinc-500 hover:bg-zinc-50 transition-colors"><RotateCcw size={10} /> Re-run</button>
            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={10} /> Remove</button>
          </div>
        </div>
      )}
    </div>
  );
}
