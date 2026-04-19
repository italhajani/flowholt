import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Trash2, Clock, Shield, Activity, BarChart3, RefreshCw, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiToken {
  id: string;
  name: string;
  created: string;
  lastUsed: string;
  maskedKey: string;
  scopes: string[];
  expiresAt: string | null;
  requestsToday: number;
  status: "active" | "expired" | "revoked";
}

const mockTokens: ApiToken[] = [
  { id: "t1", name: "Production Deployment", created: "Jan 12, 2024", lastUsed: "2 min ago", maskedKey: "fh_****…3kq9", scopes: ["workflows:read", "workflows:write", "executions:read"], expiresAt: "Jul 12, 2026", requestsToday: 847, status: "active" },
  { id: "t2", name: "CI/CD Pipeline", created: "Dec 5, 2023", lastUsed: "1 hr ago", maskedKey: "fh_****…x7r2", scopes: ["workflows:read", "executions:write"], expiresAt: "Dec 5, 2025", requestsToday: 124, status: "active" },
  { id: "t3", name: "Local Development", created: "Feb 1, 2024", lastUsed: "5 min ago", maskedKey: "fh_****…m4nz", scopes: ["*"], expiresAt: null, requestsToday: 56, status: "active" },
];

const availableScopes = [
  { id: "workflows:read", label: "Read workflows" },
  { id: "workflows:write", label: "Write workflows" },
  { id: "executions:read", label: "Read executions" },
  { id: "executions:write", label: "Write executions" },
  { id: "credentials:read", label: "Read credentials" },
  { id: "credentials:write", label: "Write credentials" },
  { id: "webhooks:manage", label: "Manage webhooks" },
  { id: "*", label: "Full access (all scopes)" },
];

const expirationOptions = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "never", label: "No expiration" },
];

export function ApiAccessSettings() {
  const [tokens] = useState(mockTokens);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExpiry, setNewExpiry] = useState("90");
  const [newScopes, setNewScopes] = useState<Set<string>>(new Set());
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyKey = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleScope = (scope: string) => {
    setNewScopes((prev) => {
      const next = new Set(prev);
      if (scope === "*") return next.has("*") ? new Set() : new Set(["*"]);
      next.delete("*");
      next.has(scope) ? next.delete(scope) : next.add(scope);
      return next;
    });
  };

  const totalRequests = tokens.reduce((s, t) => s + t.requestsToday, 0);

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">API Access</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Manage your personal API tokens for programmatic access.</p>

      {/* Rate Limit & Usage Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 max-w-2xl">
        <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-zinc-400" />
            <span className="text-[11px] font-medium text-zinc-400">Requests Today</span>
          </div>
          <p className="text-[18px] font-semibold text-zinc-900">{totalRequests.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">of 50,000 daily limit</p>
        </div>
        <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-zinc-400" />
            <span className="text-[11px] font-medium text-zinc-400">Rate Limit</span>
          </div>
          <p className="text-[18px] font-semibold text-zinc-900">100/min</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">per token, burst: 200</p>
        </div>
        <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-zinc-400" />
            <span className="text-[11px] font-medium text-zinc-400">Active Tokens</span>
          </div>
          <p className="text-[18px] font-semibold text-zinc-900">{tokens.filter((t) => t.status === "active").length}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">of 10 allowed</p>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-medium text-zinc-600">Active Tokens</p>
          <Button variant="secondary" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={12} />
            New Token
          </Button>
        </div>

        {/* Create new token form */}
        {showCreate && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 mb-4">
            <p className="text-[13px] font-semibold text-zinc-700 mb-4">Create new API token</p>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Token name</label>
                <Input
                  placeholder="e.g., CI/CD Pipeline"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Expiration</label>
                <select
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all"
                >
                  {expirationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Scopes</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableScopes.map((scope) => (
                    <label
                      key={scope.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-all",
                        newScopes.has(scope.id) ? "border-zinc-400 bg-zinc-100" : "border-zinc-200 bg-white hover:border-zinc-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={newScopes.has(scope.id) || newScopes.has("*")}
                        onChange={() => toggleScope(scope.id)}
                        className="rounded"
                      />
                      <span className="text-[12px] text-zinc-700">{scope.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button variant="primary" size="sm" disabled={!newName.trim() || newScopes.size === 0}>Create Token</Button>
                <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setNewName(""); setNewScopes(new Set()); }}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Token list */}
        <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs divide-y divide-zinc-100">
          {tokens.map((token) => (
            <div key={token.id}>
              <div
                className="flex items-center px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                onClick={() => setExpandedToken(expandedToken === token.id ? null : token.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-zinc-800">{token.name}</p>
                    {token.expiresAt && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <Clock size={9} />
                        Expires {token.expiresAt}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Created {token.created} · Last used {token.lastUsed} · {token.requestsToday.toLocaleString()} requests today
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded">
                    {token.maskedKey}
                  </code>
                  <button
                    className="text-zinc-300 hover:text-zinc-500 transition-colors"
                    title="Copy"
                    onClick={(e) => { e.stopPropagation(); copyKey(token.id); }}
                  >
                    {copiedId === token.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                  <button className="text-zinc-300 hover:text-red-500 transition-colors" title="Revoke" onClick={(e) => e.stopPropagation()}>
                    <Trash2 size={13} />
                  </button>
                  <ChevronDown size={13} className={cn("text-zinc-300 transition-transform", expandedToken === token.id && "rotate-180")} />
                </div>
              </div>

              {/* Expanded details */}
              {expandedToken === token.id && (
                <div className="px-4 pb-3 pt-1 bg-zinc-50/50 border-t border-zinc-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-medium text-zinc-500">Scopes:</span>
                    <div className="flex flex-wrap gap-1">
                      {token.scopes.map((scope) => (
                        <span key={scope} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm">
                      <RefreshCw size={11} />
                      Regenerate
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Revoke token</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API endpoint & Webhook Secret */}
      <div className="mt-6 max-w-2xl space-y-4">
        <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
          <p className="text-[12px] font-medium text-zinc-600 mb-2">API Endpoint</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[12px] font-mono text-zinc-600 bg-zinc-50 px-3 py-2 rounded-md">
              https://api.flowholt.com/v1
            </code>
            <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <Copy size={13} />
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Include your token in the <code className="text-[10px] bg-zinc-100 px-1 rounded">Authorization: Bearer fh_...</code> header.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-medium text-zinc-600">Webhook Signing Secret</p>
            <Button variant="ghost" size="sm">
              <RefreshCw size={11} />
              Rotate
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[12px] font-mono text-zinc-600 bg-zinc-50 px-3 py-2 rounded-md">
              whsec_****…f8k3
            </code>
            <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <Copy size={13} />
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Used to verify webhook payloads. Rotate periodically for security.
          </p>
        </div>
      </div>
    </div>
  );
}
