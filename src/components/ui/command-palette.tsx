import { useEffect, useState, useCallback, useMemo } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import {
  Home,
  GitBranch,
  Bot,
  LayoutTemplate,
  Play,
  ClipboardList,
  KeyRound,
  Webhook,
  Database,
  Plug,
  Activity,
  Globe,
  HelpCircle,
  Settings,
  Plus,
  Search,
  Terminal,
  User,
  Shield,
  CreditCard,
  Clock,
  Pencil,
  MessageSquare,
  Moon,
  Sun,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Tag,
  Loader2,
  FileText,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/* ── Navigation items ── */
const navigation = [
  { label: "Home",          icon: Home,           path: "/home" },
  { label: "Workflows",     icon: GitBranch,      path: "/workflows" },
  { label: "AI Agents",     icon: Bot,            path: "/ai-agents" },
  { label: "Templates",     icon: LayoutTemplate, path: "/templates" },
  { label: "Executions",    icon: Play,           path: "/executions" },
  { label: "Human Tasks",   icon: ClipboardList,  path: "/human-tasks" },
  { label: "Chat",          icon: MessageSquare,  path: "/chat" },
  { label: "Vault",         icon: KeyRound,       path: "/vault" },
  { label: "Webhooks",      icon: Webhook,        path: "/webhooks" },
  { label: "Data",          icon: Database,        path: "/data" },
  { label: "Providers",     icon: Plug,           path: "/providers" },
  { label: "Operations",    icon: Activity,       path: "/operations" },
  { label: "Environment",   icon: Globe,          path: "/environment" },
  { label: "API Playground", icon: Terminal,       path: "/help/api" },
  { label: "Help",          icon: HelpCircle,     path: "/help" },
  { label: "Models",        icon: Plug,           path: "/models" },
];

const settingsNav = [
  { label: "Profile Settings",   icon: User,       path: "/settings/profile" },
  { label: "Workspace General",  icon: Settings,   path: "/settings/workspace/general" },
  { label: "Members & Roles",    icon: Shield,     path: "/settings/workspace/members" },
  { label: "Security Settings",  icon: Shield,     path: "/settings/workspace/security" },
  { label: "Billing & Usage",    icon: CreditCard, path: "/settings/workspace/billing" },
];

const quickActions = [
  { label: "New Workflow",   icon: Plus, path: "/workflows" },
  { label: "New AI Agent",   icon: Plus, path: "/ai-agents" },
  { label: "New Credential", icon: Plus, path: "/vault" },
  { label: "New Webhook",    icon: Plus, path: "/webhooks" },
];

/* ── Simulated search data (will come from backend API) ── */
interface SearchResult {
  id: string;
  type: "workflow" | "execution" | "agent" | "credential";
  label: string;
  description?: string;
  status?: "success" | "error" | "running" | "active" | "draft";
  tags?: string[];
  path: string;
}

const searchableWorkflows: SearchResult[] = [
  { id: "wf-001", type: "workflow", label: "Lead Qualification Pipeline", description: "CRM → Score → Notify", status: "active", tags: ["sales", "automation"], path: "/workflows/wf-001" },
  { id: "wf-002", type: "workflow", label: "Stripe Payment Handler", description: "Webhook → Process → Update DB", status: "active", tags: ["payments", "stripe"], path: "/workflows/wf-002" },
  { id: "wf-003", type: "workflow", label: "Customer Onboarding Flow", description: "Signup → Email → CRM", status: "draft", tags: ["onboarding"], path: "/workflows/wf-003" },
  { id: "wf-004", type: "workflow", label: "Daily Report Generator", description: "Schedule → Query → Email", status: "active", tags: ["reports"], path: "/workflows/wf-004" },
  { id: "wf-005", type: "workflow", label: "Slack Alert Pipeline", description: "Monitor → Filter → Slack", status: "active", tags: ["monitoring"], path: "/workflows/wf-005" },
  { id: "wf-006", type: "workflow", label: "Invoice Processing AI", description: "Upload → OCR → Approve", status: "draft", tags: ["finance", "ai"], path: "/workflows/wf-006" },
];

const searchableExecutions: SearchResult[] = [
  { id: "exec-1247", type: "execution", label: "Execution #1247", description: "Lead Qualification Pipeline", status: "success", path: "/executions/exec-1247" },
  { id: "exec-1246", type: "execution", label: "Execution #1246", description: "Stripe Payment Handler", status: "error", path: "/executions/exec-1246" },
  { id: "exec-1245", type: "execution", label: "Execution #1245", description: "Daily Report Generator", status: "success", path: "/executions/exec-1245" },
  { id: "exec-1244", type: "execution", label: "Execution #1244", description: "Customer Onboarding Flow", status: "running", path: "/executions/exec-1244" },
];

const searchableAgents: SearchResult[] = [
  { id: "agent-1", type: "agent", label: "Support Assistant", description: "Customer support automation", status: "active", path: "/ai-agents/agent-1" },
  { id: "agent-2", type: "agent", label: "Data Classifier", description: "ML-based document sorting", status: "active", path: "/ai-agents/agent-2" },
];

const RECENT_SEARCHES_KEY = "flowholt_recent_searches";

const statusDot: Record<string, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  running: "bg-blue-500 animate-pulse",
  active: "bg-green-500",
  draft: "bg-zinc-300",
};

const statusIcon: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  running: Loader2,
};

const typeIcon: Record<string, typeof GitBranch> = {
  workflow: GitBranch,
  execution: Play,
  agent: Bot,
  credential: KeyRound,
};

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch { return []; }
}

function addRecentSearch(term: string) {
  const prev = getRecentSearches().filter(s => s !== term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([term, ...prev].slice(0, 8)));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "workflows" | "executions" | "agents">("all");
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (open) setRecentSearches(getRecentSearches());
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    const openFromEvent = () => setOpen(true);
    document.addEventListener("keydown", down);
    document.addEventListener("open-command-palette", openFromEvent);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-command-palette", openFromEvent);
    };
  }, [toggle]);

  const go = (path: string) => {
    if (query.trim()) addRecentSearch(query.trim());
    navigate(path);
    setOpen(false);
    setQuery("");
    setSearchFilter("all");
  };

  /* Filtered search results */
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const all = [...searchableWorkflows, ...searchableExecutions, ...searchableAgents];
    return all.filter(r => {
      if (searchFilter !== "all") {
        const typeMap = { workflows: "workflow", executions: "execution", agents: "agent" } as const;
        if (r.type !== typeMap[searchFilter]) return false;
      }
      return (
        r.label.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      );
    }).slice(0, 8);
  }, [query, searchFilter]);

  const isSearching = query.trim().length > 0;

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
        onClick={() => { setOpen(false); setQuery(""); setSearchFilter("all"); }}
        style={{ animation: "fadeIn 100ms ease-out" }}
      />

      <div
        className="fixed left-1/2 top-[20%] z-50 w-full max-w-[560px] -translate-x-1/2"
        style={{ animation: "slideIn 150ms ease-out" }}
      >
        <Command
          className="rounded-xl border shadow-overlay overflow-hidden"
          style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-overlay)" }}
          shouldFilter={!isSearching}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 px-4 border-b" style={{ borderColor: "var(--color-border-default)" }}>
            <Search size={15} className="text-zinc-400 flex-shrink-0" />
            <Command.Input
              placeholder="Search workflows, executions, agents…"
              className="h-11 w-full bg-transparent text-[14px] text-zinc-800 placeholder:text-zinc-400 outline-none"
              autoFocus
              value={query}
              onValueChange={setQuery}
            />
            <kbd
              className="flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
              style={{
                background: "var(--color-bg-surface-strong)",
                border: "1px solid var(--color-border-default)",
              }}
            >
              Esc
            </kbd>
          </div>

          {/* Search filter tabs (visible when typing) */}
          {isSearching && (
            <div className="flex items-center gap-1 px-4 py-1.5 border-b" style={{ borderColor: "var(--color-border-default)" }}>
              {(["all", "workflows", "executions", "agents"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSearchFilter(f)}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    searchFilter === f
                      ? "bg-blue-100 text-blue-700"
                      : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <span className="ml-auto text-[10px] text-zinc-300">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <Command.List className="max-h-[360px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-[13px] text-zinc-400">
              {isSearching ? "No matching workflows, executions, or agents." : "No results found."}
            </Command.Empty>

            {/* Search results */}
            {isSearching && searchResults.length > 0 && (
              <Command.Group heading="Search Results" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
                {searchResults.map(r => {
                  const TypeIcon = typeIcon[r.type] || FileText;
                  const SIcon = r.status ? statusIcon[r.status] : undefined;
                  return (
                    <Command.Item
                      key={r.id}
                      value={`${r.label} ${r.description ?? ""} ${r.tags?.join(" ") ?? ""}`}
                      onSelect={() => go(r.path)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                    >
                      <TypeIcon size={15} strokeWidth={1.75} className="text-zinc-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{r.label}</span>
                          {r.status && (
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusDot[r.status]}`} />
                          )}
                        </div>
                        {r.description && (
                          <span className="text-[11px] text-zinc-400 truncate block">{r.description}</span>
                        )}
                      </div>
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {r.tags.slice(0, 2).map(t => (
                            <span key={t} className="flex items-center gap-0.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] text-zinc-500">
                              <Tag size={8} />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] text-zinc-300 capitalize flex-shrink-0">{r.type}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* Recent searches (when not searching) */}
            {!isSearching && recentSearches.length > 0 && (
              <>
                <Command.Group heading="Recent Searches" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
                  {recentSearches.map(s => (
                    <Command.Item
                      key={s}
                      value={`search: ${s}`}
                      onSelect={() => setQuery(s)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-500 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                    >
                      <Clock size={13} strokeWidth={1.75} className="text-zinc-300" />
                      {s}
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Separator className="mx-2 my-1 h-px bg-zinc-100" />
              </>
            )}

            {/* Standard navigation (when not searching) */}
            {!isSearching && (
              <>
                <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
                  {navigation.map((item) => (
                    <Command.Item
                      key={item.path}
                      value={item.label}
                      onSelect={() => go(item.path)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                    >
                      <item.icon size={15} strokeWidth={1.75} className="text-zinc-400" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Separator className="mx-2 my-1 h-px bg-zinc-100" />

                <Command.Group heading="Quick Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
                  {quickActions.map((item) => (
                    <Command.Item
                      key={item.label}
                      value={item.label}
                      onSelect={() => go(item.path)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                    >
                      <item.icon size={15} strokeWidth={1.75} className="text-zinc-400" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Separator className="mx-2 my-1 h-px bg-zinc-100" />

                <Command.Group heading="Settings" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
                  {settingsNav.map((item) => (
                    <Command.Item
                      key={item.path}
                      value={item.label}
                      onSelect={() => go(item.path)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                    >
                      <item.icon size={15} strokeWidth={1.75} className="text-zinc-400" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Separator className="mx-2 my-1 h-px bg-zinc-100" />

                <Command.Group heading="Appearance" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
                  <Command.Item
                    value="Toggle dark mode"
                    onSelect={() => { toggleTheme(); setOpen(false); }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                  >
                    {resolvedTheme === "dark" ? (
                      <Sun size={15} strokeWidth={1.75} className="text-zinc-400" />
                    ) : (
                      <Moon size={15} strokeWidth={1.75} className="text-zinc-400" />
                    )}
                    {resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  </Command.Item>
                </Command.Group>
              </>
            )}
          </Command.List>

          <div
            className="flex items-center justify-between px-4 py-2 text-[11px] text-zinc-400"
            style={{ borderTop: "1px solid var(--color-border-default)" }}
          >
            <div className="flex items-center gap-3">
              <span>Up/Down Navigate</span>
              <span>Enter Open</span>
            </div>
            <span>Ctrl+K Search</span>
          </div>
        </Command>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </>
  );
}
