import { useState, useMemo } from "react";
import {
  Plus, Play, Trash2, Check, X, ChevronDown, ChevronRight,
  Copy, Clock, DollarSign, CheckCircle2, XCircle, AlertTriangle,
  Pencil, FileJson, Zap, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface TestScenario {
  id: string;
  name: string;
  description: string;
  inputPayload: string;
  expectedOutput: string;
  lastResult: "pass" | "fail" | "error" | "pending";
  lastRunTime: string | null;
  lastDuration: string | null;
  lastCost: string | null;
  actualOutput: string | null;
}

/* ── Mock data ── */
const mockScenarios: TestScenario[] = [
  {
    id: "tc-1",
    name: "High-quality lead scoring",
    description: "VP-level contact at a funded Series B startup should score ≥ 80",
    inputPayload: JSON.stringify({ email: "alex@acme.com", name: "Alex Chen", title: "VP Engineering", company_size: 1200 }, null, 2),
    expectedOutput: JSON.stringify({ score: 87, category: "High Quality", reasons: ["Senior title", "Large company"] }, null, 2),
    lastResult: "pass",
    lastRunTime: "2 min ago",
    lastDuration: "1.2s",
    lastCost: "$0.004",
    actualOutput: JSON.stringify({ score: 87, category: "High Quality", reasons: ["Senior title", "Large company", "Tech role"] }, null, 2),
  },
  {
    id: "tc-2",
    name: "Low-quality lead rejection",
    description: "Personal gmail with no title should score < 30",
    inputPayload: JSON.stringify({ email: "john@gmail.com", name: "John Doe", title: "", company_size: 0 }, null, 2),
    expectedOutput: JSON.stringify({ score: 15, category: "Low Quality", reasons: ["No title", "Personal email"] }, null, 2),
    lastResult: "fail",
    lastRunTime: "5 min ago",
    lastDuration: "0.9s",
    lastCost: "$0.003",
    actualOutput: JSON.stringify({ score: 42, category: "Medium Quality", reasons: ["Personal email"] }, null, 2),
  },
  {
    id: "tc-3",
    name: "Missing email handling",
    description: "Input without email should return error gracefully",
    inputPayload: JSON.stringify({ name: "No Email Person", title: "CTO" }, null, 2),
    expectedOutput: JSON.stringify({ error: "email_required", message: "Email field is required for enrichment" }, null, 2),
    lastResult: "error",
    lastRunTime: "1 hour ago",
    lastDuration: "0.1s",
    lastCost: "$0.000",
    actualOutput: null,
  },
  {
    id: "tc-4",
    name: "Bulk input (3 items)",
    description: "Multiple leads should each get individual scores",
    inputPayload: JSON.stringify([
      { email: "a@corp.com", name: "A", title: "CEO" },
      { email: "b@corp.com", name: "B", title: "Intern" },
    ], null, 2),
    expectedOutput: JSON.stringify([{ score: 95 }, { score: 25 }], null, 2),
    lastResult: "pending",
    lastRunTime: null,
    lastDuration: null,
    lastCost: null,
    actualOutput: null,
  },
];

const resultColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pass:    { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: <CheckCircle2 size={11} className="text-emerald-500" /> },
  fail:    { bg: "bg-red-50 border-red-200",         text: "text-red-700",     icon: <XCircle size={11} className="text-red-500" /> },
  error:   { bg: "bg-amber-50 border-amber-200",     text: "text-amber-700",   icon: <AlertTriangle size={11} className="text-amber-500" /> },
  pending: { bg: "bg-zinc-50 border-zinc-200",       text: "text-zinc-500",    icon: <Clock size={11} className="text-zinc-400" /> },
};

export function EvaluationPanel() {
  const [scenarios, setScenarios] = useState<TestScenario[]>(mockScenarios);
  const [expandedId, setExpandedId] = useState<string | null>("tc-1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newInput, setNewInput] = useState("{\n  \n}");
  const [newExpected, setNewExpected] = useState("{\n  \n}");

  // Summary stats
  const stats = useMemo(() => {
    const pass = scenarios.filter(s => s.lastResult === "pass").length;
    const fail = scenarios.filter(s => s.lastResult === "fail").length;
    const err = scenarios.filter(s => s.lastResult === "error").length;
    const pend = scenarios.filter(s => s.lastResult === "pending").length;
    const totalCost = scenarios.reduce((sum, s) => sum + (s.lastCost ? parseFloat(s.lastCost.replace("$", "")) : 0), 0);
    return { pass, fail, err, pend, total: scenarios.length, totalCost: `$${totalCost.toFixed(3)}` };
  }, [scenarios]);

  const handleAddScenario = () => {
    if (!newName.trim()) return;
    const id = `tc-${Date.now()}`;
    setScenarios(prev => [...prev, {
      id, name: newName, description: newDesc,
      inputPayload: newInput, expectedOutput: newExpected,
      lastResult: "pending", lastRunTime: null, lastDuration: null, lastCost: null, actualOutput: null,
    }]);
    setShowNewForm(false);
    setNewName(""); setNewDesc(""); setNewInput("{\n  \n}"); setNewExpected("{\n  \n}");
    setExpandedId(id);
  };

  const handleDelete = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleRunAll = () => {
    // Mock: simulate running all scenarios
    setScenarios(prev => prev.map(s => ({
      ...s,
      lastRunTime: "just now",
      lastDuration: `${(Math.random() * 2 + 0.3).toFixed(1)}s`,
      lastCost: `$${(Math.random() * 0.005 + 0.001).toFixed(3)}`,
      lastResult: Math.random() > 0.3 ? "pass" : "fail",
    })));
  };

  return (
    <div className="mx-auto max-w-[780px] py-6 px-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-900">Evaluation</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">Test scenarios to validate workflow behavior and track costs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAll}
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            <Play size={11} /> Run All
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <Plus size={11} /> New Scenario
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-zinc-700 bg-zinc-50 border-zinc-200" },
          { label: "Passed", value: stats.pass, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "Failed", value: stats.fail, color: "text-red-700 bg-red-50 border-red-200" },
          { label: "Errors", value: stats.err, color: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Pending", value: stats.pend, color: "text-zinc-500 bg-zinc-50 border-zinc-200" },
          { label: "Cost", value: stats.totalCost, color: "text-violet-700 bg-violet-50 border-violet-200" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-lg border px-3 py-2 text-center", s.color)}>
            <p className="text-[14px] font-bold">{s.value}</p>
            <p className="text-[9px] font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* New scenario form */}
      {showNewForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-zinc-800">New Test Scenario</p>
            <button onClick={() => setShowNewForm(false)} className="text-zinc-400 hover:text-zinc-600"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium text-zinc-600">Name</label>
              <input
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none"
                placeholder="e.g. High-score lead"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-zinc-600">Description</label>
              <input
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none"
                placeholder="Expected behavior…"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium text-zinc-600 flex items-center gap-1"><FileJson size={9} /> Input Payload</label>
              <textarea
                className="mt-1 w-full h-24 rounded-md border border-zinc-200 bg-zinc-950 px-2.5 py-1.5 text-[10px] font-mono text-emerald-400 resize-none focus:outline-none"
                value={newInput}
                onChange={e => setNewInput(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-zinc-600 flex items-center gap-1"><FileJson size={9} /> Expected Output</label>
              <textarea
                className="mt-1 w-full h-24 rounded-md border border-zinc-200 bg-zinc-950 px-2.5 py-1.5 text-[10px] font-mono text-blue-400 resize-none focus:outline-none"
                value={newExpected}
                onChange={e => setNewExpected(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewForm(false)} className="rounded-md border border-zinc-200 px-3 py-1.5 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50">Cancel</button>
            <button onClick={handleAddScenario} className="rounded-md bg-zinc-900 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-zinc-700">Add Scenario</button>
          </div>
        </div>
      )}

      {/* Scenario list */}
      <div className="space-y-2">
        {scenarios.map((sc) => {
          const rc = resultColors[sc.lastResult];
          const isExpanded = expandedId === sc.id;
          return (
            <div key={sc.id} className="rounded-lg border border-zinc-200 overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : sc.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors"
              >
                <ChevronRight size={12} className={cn("text-zinc-300 transition-transform flex-shrink-0", isExpanded && "rotate-90")} />
                {rc.icon}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[11px] font-medium text-zinc-800 truncate">{sc.name}</p>
                  {sc.description && <p className="text-[9px] text-zinc-400 truncate">{sc.description}</p>}
                </div>
                {sc.lastRunTime && (
                  <div className="flex items-center gap-3 flex-shrink-0 text-[9px] text-zinc-400">
                    <span className="flex items-center gap-0.5"><Clock size={8} /> {sc.lastDuration}</span>
                    <span className="flex items-center gap-0.5"><DollarSign size={8} /> {sc.lastCost}</span>
                    <span>{sc.lastRunTime}</span>
                  </div>
                )}
                <span className={cn("rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase flex-shrink-0", rc.bg, rc.text)}>
                  {sc.lastResult}
                </span>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 space-y-3">
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[9px] font-medium text-white hover:bg-zinc-700 transition-colors">
                      <Play size={9} /> Run This
                    </button>
                    <button
                      onClick={() => setEditingId(editingId === sc.id ? null : sc.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1 text-[9px] font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                    >
                      <Pencil size={9} /> {editingId === sc.id ? "Done" : "Edit"}
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1 text-[9px] font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">
                      <Copy size={9} /> Clone
                    </button>
                    <button
                      onClick={() => handleDelete(sc.id)}
                      className="ml-auto inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-[9px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={9} /> Delete
                    </button>
                  </div>

                  {/* Input / Expected / Actual comparison */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[9px] font-semibold text-zinc-500 mb-1 flex items-center gap-1">
                        <Zap size={8} /> Input Payload
                      </p>
                      {editingId === sc.id ? (
                        <textarea
                          className="w-full h-32 rounded-md border border-zinc-200 bg-zinc-950 px-2 py-1.5 text-[9px] font-mono text-emerald-400 resize-none focus:outline-none"
                          defaultValue={sc.inputPayload}
                          spellCheck={false}
                        />
                      ) : (
                        <pre className="rounded-md border border-zinc-200 bg-zinc-950 p-2 text-[9px] font-mono text-emerald-400 max-h-32 overflow-auto leading-relaxed">
                          {sc.inputPayload}
                        </pre>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-blue-500 mb-1 flex items-center gap-1">
                        <Check size={8} /> Expected Output
                      </p>
                      {editingId === sc.id ? (
                        <textarea
                          className="w-full h-32 rounded-md border border-blue-200 bg-zinc-950 px-2 py-1.5 text-[9px] font-mono text-blue-400 resize-none focus:outline-none"
                          defaultValue={sc.expectedOutput}
                          spellCheck={false}
                        />
                      ) : (
                        <pre className="rounded-md border border-blue-200 bg-zinc-950 p-2 text-[9px] font-mono text-blue-400 max-h-32 overflow-auto leading-relaxed">
                          {sc.expectedOutput}
                        </pre>
                      )}
                    </div>
                    <div>
                      <p className={cn("text-[9px] font-semibold mb-1 flex items-center gap-1", sc.lastResult === "pass" ? "text-emerald-500" : sc.lastResult === "fail" ? "text-red-500" : "text-zinc-400")}>
                        <BarChart3 size={8} /> Actual Output
                      </p>
                      {sc.actualOutput ? (
                        <pre className={cn(
                          "rounded-md border p-2 text-[9px] font-mono max-h-32 overflow-auto leading-relaxed",
                          sc.lastResult === "pass"
                            ? "border-emerald-200 bg-zinc-950 text-emerald-400"
                            : "border-red-200 bg-zinc-950 text-red-400"
                        )}>
                          {sc.actualOutput}
                        </pre>
                      ) : (
                        <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 py-8 text-center">
                          <p className="text-[10px] text-zinc-400">Not yet run</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Field-level diff (for pass/fail) */}
                  {sc.lastResult !== "pending" && sc.actualOutput && (
                    <div className="rounded-md border border-zinc-200 overflow-hidden">
                      <div className="bg-zinc-100 px-3 py-1.5 flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-zinc-600">Field Comparison</span>
                        <span className={cn("rounded-full px-1.5 py-0 text-[8px] font-bold border", rc.bg, rc.text)}>{sc.lastResult}</span>
                      </div>
                      <FieldDiffTable expected={sc.expectedOutput} actual={sc.actualOutput} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {scenarios.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
          <p className="text-[13px] text-zinc-400">No test scenarios yet.</p>
          <button
            onClick={() => setShowNewForm(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-700"
          >
            <Plus size={11} /> Create First Scenario
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Field-level diff table ── */
function FieldDiffTable({ expected, actual }: { expected: string; actual: string }) {
  const expObj = useMemo(() => { try { return JSON.parse(expected); } catch { return {}; } }, [expected]);
  const actObj = useMemo(() => { try { return JSON.parse(actual); } catch { return {}; } }, [actual]);

  const flattenObj = (obj: unknown, prefix = ""): Record<string, string> => {
    const out: Record<string, string> = {};
    if (typeof obj !== "object" || obj === null) { out[prefix || "value"] = String(obj); return out; }
    if (Array.isArray(obj)) { obj.forEach((v, i) => Object.assign(out, flattenObj(v, `${prefix}[${i}]`))); return out; }
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "object" && v !== null) Object.assign(out, flattenObj(v, key));
      else out[key] = String(v);
    }
    return out;
  };

  const expFlat = flattenObj(expObj);
  const actFlat = flattenObj(actObj);
  const allKeys = Array.from(new Set([...Object.keys(expFlat), ...Object.keys(actFlat)]));

  return (
    <table className="w-full text-[9px]">
      <thead>
        <tr className="bg-zinc-50 border-b border-zinc-200">
          <th className="text-left px-3 py-1.5 font-medium text-zinc-500 w-8"></th>
          <th className="text-left px-3 py-1.5 font-medium text-zinc-500">Field</th>
          <th className="text-left px-3 py-1.5 font-medium text-blue-500">Expected</th>
          <th className="text-left px-3 py-1.5 font-medium text-zinc-500">Actual</th>
        </tr>
      </thead>
      <tbody>
        {allKeys.map(key => {
          const exp = expFlat[key];
          const act = actFlat[key];
          const match = exp === act;
          const missing = act === undefined;
          const extra = exp === undefined;
          return (
            <tr key={key} className={cn("border-b border-zinc-50", match ? "" : missing ? "bg-red-50/30" : extra ? "bg-emerald-50/30" : "bg-amber-50/30")}>
              <td className="px-3 py-1.5">
                {match ? <Check size={9} className="text-emerald-400" /> : <X size={9} className="text-red-400" />}
              </td>
              <td className="px-3 py-1.5 font-mono font-medium text-zinc-700">{key}</td>
              <td className="px-3 py-1.5 font-mono text-blue-600">{exp ?? "—"}</td>
              <td className={cn("px-3 py-1.5 font-mono", match ? "text-zinc-500" : "text-red-600 font-semibold")}>{act ?? "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
