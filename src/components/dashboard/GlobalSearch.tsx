import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, GitBranch, Zap, Key } from "lucide-react";
import { api, type ApiSearchResults } from "@/lib/api";

const typeIcon: Record<string, React.ElementType> = {
  workflow: GitBranch,
  execution: Zap,
  vault_asset: Key,
};

const typeLabel: Record<string, string> = {
  workflow: "Workflow",
  execution: "Execution",
  vault_asset: "Vault",
};

const typeRoute: Record<string, (id: string) => string> = {
  workflow: (id) => `/studio/${id}`,
  execution: (id) => `/dashboard/executions/${id}`,
  vault_asset: () => `/dashboard/credentials`,
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiSearchResults | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api.search(q.trim());
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    setQuery("");
    setResults(null);
    const route = typeRoute[type];
    if (route) navigate(route(id));
  };

  // Keyboard shortcut: Ctrl/Cmd + K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
        setResults(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allResults = results
    ? [
        ...results.workflows.map((r) => ({ ...r, label: r.name || "", type: "workflow" as const })),
        ...results.executions.map((r) => ({ ...r, label: r.workflow_name || r.name || "", type: "execution" as const })),
        ...results.vault_assets.map((r) => ({ ...r, label: r.name || "", type: "vault_asset" as const })),
      ]
    : [];

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white border border-slate-200 text-[12px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors min-w-[180px]"
      >
        <Search size={14} />
        <span>Search...</span>
        <kbd className="ml-auto text-[10px] font-bold text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white border border-slate-300 ring-2 ring-[#8A78F3]/20 min-w-[320px]">
        {loading ? (
          <Loader2 size={14} className="text-slate-400 animate-spin shrink-0" />
        ) : (
          <Search size={14} className="text-slate-400 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search workflows, executions, vault..."
          className="flex-1 bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 outline-none"
        />
        <button onClick={() => { setOpen(false); setQuery(""); setResults(null); }}>
          <X size={14} className="text-slate-400 hover:text-slate-600" />
        </button>
      </div>

      {query.trim().length >= 2 && (
        <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-[360px] overflow-y-auto">
          {allResults.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-[13px] text-slate-400">No results found</div>
          )}
          {allResults.map((item) => {
            const Icon = typeIcon[item.type] || Search;
            return (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item.type, item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
              >
                <Icon size={14} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-slate-900 truncate">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{typeLabel[item.type]}{item.status ? ` · ${item.status}` : ""}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
