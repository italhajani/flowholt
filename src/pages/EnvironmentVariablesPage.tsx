import { useState, useMemo } from "react";
import {
  Plus, Search, Eye, EyeOff, Trash2, Copy, Check, ChevronRight, ChevronDown,
  Shield, Globe, Server, Code2, Clock, AlertTriangle, Settings, RefreshCw,
  Lock, Unlock, Filter, Download, Upload, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVariables, useCreateVariable, useDeleteVariable } from "@/hooks/useApi";
import type { VariableOut } from "@/lib/api";

/* ── mock data (fallback) ── */
const mockEnvVars = [
  { id: "ev1", name: "API_KEY", value: "sk-prod-abc123...xyz", secret: true, scope: "production", type: "string", lastModified: "2 hours ago", owner: "Gouhar Ali", usedIn: ["Lead Scoring", "Email Sender"] },
  { id: "ev2", name: "DATABASE_URL", value: "postgresql://user:pass@db.example.com/prod", secret: true, scope: "production", type: "connection", lastModified: "3 days ago", owner: "Gouhar Ali", usedIn: ["Data Sync", "Report Generator"] },
  { id: "ev3", name: "WEBHOOK_SECRET", value: "whsec_abc123def456", secret: true, scope: "shared", type: "string", lastModified: "1 week ago", owner: "Admin", usedIn: ["Webhook Handler"] },
  { id: "ev4", name: "BASE_URL", value: "https://api.example.com/v2", secret: false, scope: "shared", type: "url", lastModified: "2 weeks ago", owner: "Gouhar Ali", usedIn: ["Lead Scoring", "Clearbit Enrich", "Slack Notifier"] },
  { id: "ev5", name: "DEBUG_MODE", value: "true", secret: false, scope: "development", type: "boolean", lastModified: "1 day ago", owner: "Gouhar Ali", usedIn: [] },
  { id: "ev6", name: "OPENAI_API_KEY", value: "sk-proj-abc123...", secret: true, scope: "shared", type: "string", lastModified: "5 days ago", owner: "Admin", usedIn: ["AI Agent", "Score Lead", "Summarizer"] },
  { id: "ev7", name: "STAGING_DB_URL", value: "postgresql://user:pass@staging-db.example.com/staging", secret: true, scope: "staging", type: "connection", lastModified: "4 days ago", owner: "Gouhar Ali", usedIn: ["Data Sync"] },
  { id: "ev8", name: "MAX_RETRIES", value: "3", secret: false, scope: "shared", type: "number", lastModified: "1 month ago", owner: "Admin", usedIn: ["Email Sender", "HTTP Request"] },
  { id: "ev9", name: "SLACK_TOKEN", value: "xoxb-123456789-abc", secret: true, scope: "production", type: "string", lastModified: "6 hours ago", owner: "Gouhar Ali", usedIn: ["Slack Notifier", "Alert Handler"] },
  { id: "ev10", name: "RATE_LIMIT", value: "100", secret: false, scope: "production", type: "number", lastModified: "2 weeks ago", owner: "Admin", usedIn: ["API Gateway"] },
];

const scopes = [
  { id: "all", label: "All Scopes", icon: Globe, color: "text-zinc-500" },
  { id: "shared", label: "Shared", icon: Globe, color: "text-blue-500" },
  { id: "development", label: "Development", icon: Code2, color: "text-emerald-500" },
  { id: "staging", label: "Staging", icon: Server, color: "text-amber-500" },
  { id: "production", label: "Production", icon: Shield, color: "text-red-500" },
];

const scopeBadge: Record<string, string> = {
  shared: "bg-blue-50 text-blue-700 border-blue-200",
  development: "bg-emerald-50 text-emerald-700 border-emerald-200",
  staging: "bg-amber-50 text-amber-700 border-amber-200",
  production: "bg-red-50 text-red-700 border-red-200",
};

const typeBadge: Record<string, string> = {
  string: "bg-zinc-100 text-zinc-600",
  connection: "bg-purple-100 text-purple-600",
  url: "bg-blue-100 text-blue-600",
  boolean: "bg-amber-100 text-amber-600",
  number: "bg-emerald-100 text-emerald-600",
};

const rotationHistory = [
  { date: "Jan 6, 2025 09:00", action: "Rotated", by: "System (auto)" },
  { date: "Dec 6, 2024 09:00", action: "Rotated", by: "Gouhar Ali" },
  { date: "Nov 6, 2024 09:00", action: "Created", by: "Admin" },
];

export function EnvironmentVariablesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVar, setSelectedVar] = useState<typeof mockEnvVars[0] | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: apiVars } = useVariables();
  const createVarMutation = useCreateVariable();
  const deleteVarMutation = useDeleteVariable();

  const envVars = useMemo(() => {
    if (apiVars && apiVars.length > 0) {
      return apiVars.map((v: VariableOut) => ({
        id: v.id,
        name: v.name,
        value: v.value,
        secret: v.secret,
        scope: v.scope,
        type: v.type,
        lastModified: v.updated_at ? new Date(v.updated_at).toLocaleDateString() : "—",
        owner: "You",
        usedIn: [] as string[],
      }));
    }
    return mockEnvVars;
  }, [apiVars]);

  const filtered = envVars.filter(v => {
    if (scopeFilter !== "all" && v.scope !== scopeFilter) return false;
    if (searchQuery && !v.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleReveal = (id: string) => setRevealedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const copyValue = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h1 className="text-[16px] font-semibold text-zinc-900">Environment Variables</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">Manage environment-scoped secrets and configuration values</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-50 transition-colors">
              <Upload size={12} /> Import
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-50 transition-colors">
              <Download size={12} /> Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              <Plus size={12} /> New Variable
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 border-b border-zinc-100 px-6 py-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search variables…"
              className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
            />
          </div>
          <div className="flex rounded-lg border border-zinc-200 p-0.5">
            {scopes.map(s => (
              <button
                key={s.id}
                onClick={() => setScopeFilter(s.id)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium transition-all",
                  scopeFilter === s.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <s.icon size={10} className={scopeFilter === s.id ? "text-white" : s.color} />
                {s.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-zinc-400 ml-auto">{filtered.length} variables</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-50/90 backdrop-blur-sm z-10">
              <tr className="border-b border-zinc-200">
                <th className="text-left px-6 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Value</th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Scope</th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Used In</th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Modified</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedVar(v)}
                  className={cn(
                    "border-b border-zinc-100 cursor-pointer transition-colors",
                    selectedVar?.id === v.id ? "bg-blue-50/50" : "hover:bg-zinc-50"
                  )}
                >
                  <td className="px-6 py-2.5">
                    <div className="flex items-center gap-2">
                      {v.secret ? <Lock size={10} className="text-amber-500" /> : <Unlock size={10} className="text-zinc-300" />}
                      <span className="font-mono text-[11px] font-semibold text-zinc-800">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[10px] font-mono text-zinc-500 truncate max-w-[180px]">
                        {v.secret && !revealedIds.has(v.id) ? "••••••••••••" : v.value}
                      </code>
                      {v.secret && (
                        <button onClick={e => { e.stopPropagation(); toggleReveal(v.id); }} className="text-zinc-400 hover:text-zinc-600">
                          {revealedIds.has(v.id) ? <EyeOff size={10} /> : <Eye size={10} />}
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); copyValue(v.id, v.value); }}
                        className="text-zinc-300 hover:text-zinc-500"
                      >
                        {copiedId === v.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-medium capitalize", scopeBadge[v.scope])}>
                      {v.scope}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", typeBadge[v.type] || typeBadge.string)}>
                      {v.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {v.usedIn.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] text-zinc-600">{v.usedIn[0]}</span>
                        {v.usedIn.length > 1 && <span className="text-[9px] text-zinc-400">+{v.usedIn.length - 1}</span>}
                      </div>
                    ) : (
                      <span className="text-[9px] text-zinc-300">Unused</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-zinc-400">{v.lastModified}</td>
                  <td className="px-3 py-2.5">
                    <button className="rounded p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 transition-colors" onClick={e => e.stopPropagation()}>
                      <MoreHorizontal size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selectedVar && (
        <div className="w-[340px] border-l border-zinc-200 bg-zinc-50/50 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedVar.secret ? <Lock size={14} className="text-amber-500" /> : <Settings size={14} className="text-zinc-400" />}
                <h3 className="font-mono text-[13px] font-semibold text-zinc-800">{selectedVar.name}</h3>
              </div>
              <button onClick={() => setSelectedVar(null)} className="rounded p-1 text-zinc-400 hover:bg-zinc-200">
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Value */}
            <div className="rounded-lg border border-zinc-200 bg-white p-3">
              <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Value</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] font-mono text-zinc-700 break-all">
                  {selectedVar.secret && !revealedIds.has(selectedVar.id) ? "••••••••••••••••••••" : selectedVar.value}
                </code>
                {selectedVar.secret && (
                  <button onClick={() => toggleReveal(selectedVar.id)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
                    {revealedIds.has(selectedVar.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              {[
                { label: "Scope", value: selectedVar.scope, badge: true },
                { label: "Type", value: selectedVar.type },
                { label: "Owner", value: selectedVar.owner },
                { label: "Last Modified", value: selectedVar.lastModified },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <span className="text-[10px] text-zinc-500">{item.label}</span>
                  {item.badge ? (
                    <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-medium capitalize", scopeBadge[item.value])}>
                      {item.value}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-700 capitalize">{item.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Usage tracking */}
            <div className="rounded-lg border border-zinc-200 bg-white p-3">
              <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Used in Workflows</p>
              {selectedVar.usedIn.length > 0 ? (
                <div className="space-y-1">
                  {selectedVar.usedIn.map(wf => (
                    <div key={wf} className="flex items-center gap-2 rounded-md border border-zinc-100 px-2.5 py-1.5 hover:bg-zinc-50 cursor-pointer transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-zinc-700">{wf}</span>
                      <ChevronRight size={10} className="text-zinc-300 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <AlertTriangle size={10} className="text-amber-400" />
                  This variable is not used in any workflow
                </div>
              )}
            </div>

            {/* Rotation history */}
            {selectedVar.secret && (
              <div className="rounded-lg border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">Rotation History</p>
                  <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[9px] text-blue-600 hover:bg-blue-50 transition-colors">
                    <RefreshCw size={9} /> Rotate Now
                  </button>
                </div>
                <div className="space-y-1.5">
                  {rotationHistory.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Clock size={9} className="text-zinc-300 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-[10px] text-zinc-700">{r.action}</p>
                        <p className="text-[9px] text-zinc-400">{r.date} · {r.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit trail */}
            <div className="rounded-lg border border-zinc-200 bg-white p-3">
              <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Audit Trail</p>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex gap-2"><Clock size={9} className="text-zinc-300 mt-0.5" /><span className="text-zinc-500">Modified by <strong className="text-zinc-700">Gouhar Ali</strong> · 2 hours ago</span></div>
                <div className="flex gap-2"><Clock size={9} className="text-zinc-300 mt-0.5" /><span className="text-zinc-500">Read by workflow <strong className="text-zinc-700">Lead Scoring</strong> · 5 min ago</span></div>
                <div className="flex gap-2"><Clock size={9} className="text-zinc-300 mt-0.5" /><span className="text-zinc-500">Created by <strong className="text-zinc-700">Admin</strong> · Nov 6, 2024</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg border border-zinc-200 py-2 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">
                Edit
              </button>
              <button className="flex-1 rounded-lg border border-red-200 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[480px] rounded-xl border border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
              <h3 className="text-[14px] font-semibold text-zinc-900">New Environment Variable</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Name</label>
                <input placeholder="e.g. API_KEY" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] font-mono text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Value</label>
                <textarea rows={3} placeholder="Variable value" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] font-mono text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 resize-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Scope</label>
                  <select className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-700 focus:outline-none focus:border-zinc-400">
                    <option>Shared</option>
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Type</label>
                  <select className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-700 focus:outline-none focus:border-zinc-400">
                    <option>String</option>
                    <option>Number</option>
                    <option>Boolean</option>
                    <option>URL</option>
                    <option>Connection</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                <Shield size={14} className="text-amber-500" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-zinc-700">Mark as Secret</p>
                  <p className="text-[9px] text-zinc-500">Value will be encrypted and masked in the UI</p>
                </div>
                <button className="h-5 w-9 rounded-full bg-zinc-300 relative transition-colors">
                  <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-3">
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg border border-zinc-200 px-4 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-50 transition-colors">
                Cancel
              </button>
              <button className="rounded-lg bg-zinc-900 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800 transition-colors">
                Create Variable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
