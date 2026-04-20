import { useState, useMemo } from "react";
import {
  X, Search, Clock, Star, ChevronRight,
  GitBranch, KeyRound, RotateCcw, StickyNote,
  HelpCircle, Keyboard, ExternalLink, FileText,
  CheckCircle, AlertTriangle, Hash, GitCompare, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowDiffViewer } from "./WorkflowDiffViewer";
import { useNodeCatalog } from "@/hooks/useApi";

const contextTitles: Record<string, string> = {
  nodes: "Insert Node",
  outline: "Outline",
  connections: "Connections",
  assets: "Assets",
  variables: "Variables",
  versions: "Versions",
  notes: "Notes",
  help: "Help",
};

/* ─── Node data ─── */
interface NodeChip {
  name: string;
  subtitle: string;
  color: string;
  icon?: string;
  popular?: boolean;
}

const fallbackSections: { title: string; items: NodeChip[] }[] = [
  {
    title: "Recommended",
    items: [
      { name: "HTTP Request", subtitle: "Make any HTTP call", color: "bg-zinc-400", popular: true },
      { name: "Set", subtitle: "Assign & transform data", color: "bg-teal-500", popular: true },
      { name: "IF / Switch", subtitle: "Branch on conditions", color: "bg-blue-500", popular: true },
    ],
  },
  {
    title: "Triggers",
    items: [
      { name: "Webhook",     subtitle: "Receive HTTP requests",  color: "bg-green-500" },
      { name: "Schedule",    subtitle: "Cron / interval timer",  color: "bg-green-500" },
      { name: "Manual",      subtitle: "One-click run trigger",  color: "bg-green-500" },
      { name: "Chat Trigger",subtitle: "Public chat interface",  color: "bg-green-500" },
      { name: "Form Trigger",subtitle: "Public HTML form",       color: "bg-green-500" },
      { name: "Error Trigger",subtitle: "Runs on failure",       color: "bg-red-500" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { name: "Slack",        subtitle: "Send messages",         color: "bg-zinc-400" },
      { name: "Gmail",        subtitle: "Read & send email",     color: "bg-zinc-400" },
      { name: "Google Sheets",subtitle: "Read & write sheets",   color: "bg-zinc-400" },
      { name: "Stripe",       subtitle: "Payment events",        color: "bg-zinc-400" },
      { name: "GitHub",       subtitle: "Repos, issues, PRs",    color: "bg-zinc-400" },
      { name: "Salesforce",   subtitle: "CRM records",           color: "bg-zinc-400" },
      { name: "HubSpot",      subtitle: "Contacts & deals",      color: "bg-zinc-400" },
      { name: "Notion",       subtitle: "Pages & databases",     color: "bg-zinc-400" },
    ],
  },
  {
    title: "Logic & Control",
    items: [
      { name: "IF",           subtitle: "Binary branch",         color: "bg-blue-500" },
      { name: "Switch",       subtitle: "Multi-case branch",     color: "bg-blue-500" },
      { name: "Merge",        subtitle: "Combine streams",       color: "bg-blue-500" },
      { name: "Loop",         subtitle: "Iterate over items",    color: "bg-blue-500" },
      { name: "Wait",         subtitle: "Pause execution",       color: "bg-blue-500" },
      { name: "Sub-workflow", subtitle: "Call another workflow", color: "bg-blue-500" },
    ],
  },
  {
    title: "AI & Agents",
    items: [
      { name: "AI Agent",     subtitle: "Autonomous LLM agent",  color: "bg-violet-600" },
      { name: "OpenAI",       subtitle: "GPT-4o completions",    color: "bg-zinc-900" },
      { name: "Anthropic",    subtitle: "Claude models",         color: "bg-zinc-900" },
      { name: "Classifier",   subtitle: "Classify text",         color: "bg-violet-600" },
      { name: "Summarizer",   subtitle: "Summarize content",     color: "bg-violet-600" },
      { name: "Embeddings",   subtitle: "Vector embeddings",     color: "bg-violet-600" },
    ],
  },
  {
    title: "Data & Transform",
    items: [
      { name: "Set",          subtitle: "Assign fields",         color: "bg-teal-500" },
      { name: "Code",         subtitle: "JavaScript sandbox",    color: "bg-teal-500" },
      { name: "Function",     subtitle: "JS function block",     color: "bg-teal-500" },
      { name: "Spreadsheet",  subtitle: "Read Excel / CSV",      color: "bg-teal-500" },
      { name: "Aggregate",    subtitle: "Group & summarize",     color: "bg-teal-500" },
      { name: "HTML Extract", subtitle: "Scrape HTML content",   color: "bg-teal-500" },
    ],
  },
];

const categoryColorMap: Record<string, string> = {
  triggers: "bg-green-500",
  integrations: "bg-zinc-400",
  "logic & control": "bg-blue-500",
  "ai & agents": "bg-violet-600",
  "data & transform": "bg-teal-500",
};

function mapCatalogToSections(groups: { id: string; label: string; node_types: string[] }[], nodes: { type: string; label: string; category: string; description: string }[]): { title: string; items: NodeChip[] }[] {
  return groups.map(g => ({
    title: g.label,
    items: g.node_types.map(t => {
      const node = nodes.find(n => n.type === t);
      return {
        name: node?.label ?? t,
        subtitle: node?.description ?? "",
        color: categoryColorMap[g.label.toLowerCase()] ?? "bg-zinc-400",
      };
    }),
  }));
}

/* ─── Outline data ─── */
const outlineSteps = [
  { id: "n1", label: "Webhook Trigger", family: "trigger",     status: "ok",      depth: 0 },
  { id: "n2", label: "Enrich Lead Data",family: "integration", status: "ok",      depth: 1 },
  { id: "n3", label: "Score with AI",   family: "ai",          status: "warning", depth: 1 },
  { id: "n4", label: "Route by Score",  family: "logic",       status: "ok",      depth: 2 },
  { id: "n5", label: "Update CRM",      family: "integration", status: "ok",      depth: 3 },
];

const familyDot: Record<string, string> = {
  trigger: "bg-green-500", integration: "bg-zinc-400",
  logic: "bg-blue-500", ai: "bg-violet-600", data: "bg-teal-500",
};

/* ─── Version history ─── */
const versions = [
  { ver: "v3.2", label: "Current draft",      who: "You",       time: "Just now",    current: true,  changes: [] },
  { ver: "v3.1", label: "Fixed scorer prompt", who: "You",       time: "2 hours ago", current: false, changes: [{ node: "Score with AI", action: "modified" as const }, { node: "Route by Score", action: "modified" as const }] },
  { ver: "v3.0", label: "Added CRM update",    who: "C. Kim",    time: "Yesterday",   current: false, changes: [{ node: "Update CRM", action: "added" as const }, { node: "Route by Score", action: "modified" as const }] },
  { ver: "v2.9", label: "Initial AI scoring",  who: "You",       time: "3 days ago",  current: false, changes: [{ node: "Score with AI", action: "added" as const }, { node: "Enrich Lead Data", action: "modified" as const }] },
  { ver: "v2.8", label: "Webhook rework",       who: "A. Brandt", time: "Last week",   current: false, changes: [{ node: "Webhook Trigger", action: "modified" as const }, { node: "Old Webhook", action: "removed" as const }] },
];

/* ─── Assets ─── */
const assetGroups = [
  {
    title: "Credentials",
    items: ["Webhook Endpoint", "Clearbit API Key", "OpenAI Production Key", "Salesforce Production"],
    icon: KeyRound, dotColor: "bg-green-500",
  },
  {
    title: "Variables",
    items: ["LEAD_SCORE_THRESHOLD", "CRM_ENV", "TEAM_WEBHOOK_URL"],
    icon: Hash, dotColor: "bg-teal-500",
  },
];

/* ─── Connections / edges ─── */
const edges = [
  { from: "Webhook Trigger", to: "Enrich Lead Data", type: "default" },
  { from: "Enrich Lead Data", to: "Score with AI",   type: "default" },
  { from: "Score with AI",   to: "Route by Score",   type: "default" },
  { from: "Route by Score",  to: "Update CRM",       type: "branch", label: "True" },
];

/* ─── Integration credentials used in this workflow ─── */
interface WorkflowCredential {
  name: string;
  service: string;
  type: "oauth2" | "api_key" | "basic" | "custom";
  status: "connected" | "expired" | "error" | "pending";
  usedByNodes: string[];
  lastTested?: string;
  expiresAt?: string;
}

const mockCredentials: WorkflowCredential[] = [
  { name: "Clearbit API Key", service: "Clearbit", type: "api_key", status: "connected", usedByNodes: ["Enrich Lead Data"], lastTested: "2 min ago" },
  { name: "OpenAI Production", service: "OpenAI", type: "api_key", status: "connected", usedByNodes: ["Score with AI"], lastTested: "5 min ago" },
  { name: "Salesforce OAuth", service: "Salesforce", type: "oauth2", status: "expired", usedByNodes: ["Update CRM"], lastTested: "3 days ago", expiresAt: "Expired 2h ago" },
  { name: "Slack Webhook", service: "Slack", type: "custom", status: "connected", usedByNodes: ["Notify on Slack"], lastTested: "1h ago" },
  { name: "PostgreSQL Prod", service: "PostgreSQL", type: "basic", status: "error", usedByNodes: ["Log to Database"], lastTested: "15 min ago" },
];

const credStatusConfig: Record<WorkflowCredential["status"], { color: string; dot: string; label: string }> = {
  connected: { color: "text-green-600", dot: "bg-green-500", label: "Connected" },
  expired: { color: "text-amber-600", dot: "bg-amber-500", label: "Expired" },
  error: { color: "text-red-600", dot: "bg-red-500", label: "Error" },
  pending: { color: "text-zinc-400", dot: "bg-zinc-300", label: "Pending" },
};

const credTypeLabels: Record<WorkflowCredential["type"], string> = {
  oauth2: "OAuth 2.0",
  api_key: "API Key",
  basic: "Basic Auth",
  custom: "Custom",
};

/* ─── Notes ─── */
const defaultNoteText =
  "This workflow scores inbound leads via OpenAI and routes high-quality leads directly to Salesforce.\n\n" +
  "Threshold: 70+ = High quality. Update LEAD_SCORE_THRESHOLD env variable to adjust.";

/* ─── Help ─── */
const shortcuts = [
  { keys: ["Ctrl", "Z"],          label: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], label: "Redo" },
  { keys: ["Backspace"],          label: "Delete node" },
  { keys: ["Ctrl", "C"],          label: "Copy node" },
  { keys: ["Ctrl", "V"],          label: "Paste node" },
  { keys: ["Ctrl", "A"],          label: "Select all" },
  { keys: ["Ctrl", "S"],          label: "Save workflow" },
  { keys: ["Space"],              label: "Pan canvas" },
  { keys: ["+"],                  label: "Zoom in" },
  { keys: ["-"],                  label: "Zoom out" },
  { keys: ["F"],                  label: "Fit to screen" },
];

const helpLinks = [
  { label: "Documentation",        href: "#" },
  { label: "Node reference",       href: "#" },
  { label: "Community forum",      href: "#" },
  { label: "Report an issue",      href: "#" },
];

/* ── Color-to-family mapping for drag data ── */
const colorToFamily: Record<string, string> = {
  "bg-green-500": "trigger",
  "bg-zinc-400": "integration",
  "bg-blue-500": "logic",
  "bg-violet-600": "ai",
  "bg-zinc-900": "ai",
  "bg-teal-500": "data",
  "bg-red-500": "trigger",
};

export function StudioInsertPane({
  context,
  onClose,
}: {
  context: string;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [noteText, setNoteText] = useState(defaultNoteText);
  const [recentTab, setRecentTab] = useState<"recent" | "starred">("recent");
  const { data: catalogData } = useNodeCatalog();

  // Use API catalog if available, otherwise fallback
  const sections = useMemo(() => {
    if (catalogData && catalogData.groups.length > 0 && catalogData.nodes.length > 0) {
      return mapCatalogToSections(catalogData.groups, catalogData.nodes);
    }
    return fallbackSections;
  }, [catalogData]);

  return (
    <div className="flex w-[280px] flex-col border-r border-zinc-100 bg-white">
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-zinc-100 px-3">
        <span className="text-[12px] font-semibold text-zinc-700">
          {contextTitles[context] || context}
        </span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      {context === "nodes" && <NodesPane search={search} setSearch={setSearch} recentTab={recentTab} setRecentTab={setRecentTab} sections={sections} />}
      {context === "outline" && <OutlinePane />}
      {context === "connections" && <ConnectionsPane />}
      {context === "assets" && <AssetsPane />}
      {context === "variables" && <VariablesPane />}
      {context === "versions" && <VersionsPane />}
      {context === "notes" && <NotesPane noteText={noteText} setNoteText={setNoteText} />}
      {context === "help" && <HelpPane />}
    </div>
  );
}

/* ─── NODES pane ─── */
function NodesPane({
  search, setSearch, recentTab, setRecentTab, sections,
}: {
  search: string; setSearch: (v: string) => void;
  recentTab: "recent" | "starred"; setRecentTab: (v: "recent" | "starred") => void;
  sections: { title: string; items: NodeChip[] }[];
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Search */}
      <div className="p-3 pb-0">
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search nodes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-[12px] text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          />
        </div>
      </div>

      {!search && (
        /* Recent / Starred tabs */
        <div className="flex items-center gap-3 px-3 pt-3 pb-1.5">
          {(["recent", "starred"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRecentTab(tab)}
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium transition-colors",
                recentTab === tab ? "text-zinc-800" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab === "recent" ? <Clock size={11} /> : <Star size={11} />}
              {tab === "recent" ? "Recent" : "Starred"}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 pt-1 space-y-4">
        {sections.map((section) => {
          const filtered = search
            ? section.items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.subtitle.toLowerCase().includes(search.toLowerCase()))
            : section.items;
          if (filtered.length === 0) return null;
          return (
            <div key={section.title}>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {filtered.map((item) => (
                  <button
                    key={`${section.title}-${item.name}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/flowholt-node", JSON.stringify({
                        name: item.name,
                        subtitle: item.subtitle,
                        family: colorToFamily[item.color] ?? "integration",
                      }));
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-zinc-50 transition-colors group cursor-grab active:cursor-grabbing"
                  >
                    <span className={cn("h-2 w-2 rounded-full flex-shrink-0", item.color)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-zinc-700 truncate">{item.name}</span>
                        {item.popular && (
                          <span className="rounded px-1 py-0 text-[9px] font-medium bg-amber-50 text-amber-600 flex-shrink-0">Popular</span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">{item.subtitle}</p>
                    </div>
                    <ChevronRight size={11} className="text-zinc-300 group-hover:text-zinc-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── OUTLINE pane ─── */
function OutlinePane() {
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
        {outlineSteps.length} steps
      </p>
      <div className="space-y-0.5">
        {outlineSteps.map((step, i) => (
          <button
            key={step.id}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-zinc-50 transition-colors"
            style={{ paddingLeft: `${10 + step.depth * 14}px` }}
          >
            <span className="w-5 flex-shrink-0 text-[10px] text-zinc-400 text-right">{i + 1}</span>
            <span className={cn("h-2 w-2 rounded-full flex-shrink-0", familyDot[step.family])} />
            <span className="flex-1 min-w-0 text-[12px] text-zinc-700 truncate">{step.label}</span>
            {step.status === "warning" && <AlertTriangle size={11} className="text-amber-500 flex-shrink-0" />}
            {step.status === "ok"      && <CheckCircle   size={11} className="text-zinc-300 flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── CONNECTIONS pane ─── */
function ConnectionsPane() {
  const [tab, setTab] = useState<"credentials" | "edges">("credentials");
  const [testingCred, setTestingCred] = useState<string | null>(null);

  function testCredential(name: string) {
    setTestingCred(name);
    setTimeout(() => setTestingCred(null), 1500);
  }

  const healthySummary = mockCredentials.filter(c => c.status === "connected").length;
  const issues = mockCredentials.filter(c => c.status !== "connected");

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Tab switcher */}
      <div className="flex border-b border-zinc-100 px-3 pt-2">
        {(["credentials", "edges"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "pb-2 px-3 text-[10px] font-medium transition-colors border-b-2",
              tab === t ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            {t === "credentials" ? `Credentials (${mockCredentials.length})` : `Edges (${edges.length})`}
          </button>
        ))}
      </div>

      {tab === "credentials" ? (
        <div className="p-3 space-y-2">
          {/* Health summary */}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2">
            <div className={cn("h-2 w-2 rounded-full", issues.length === 0 ? "bg-green-500" : "bg-amber-500")} />
            <span className="text-[11px] text-zinc-600 flex-1">
              {healthySummary}/{mockCredentials.length} connected
            </span>
            {issues.length > 0 && (
              <span className="text-[9px] text-amber-600 font-medium">{issues.length} issue{issues.length > 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Credential cards */}
          <div className="space-y-1.5">
            {mockCredentials.map((cred) => {
              const cfg = credStatusConfig[cred.status];
              return (
                <div key={cred.name} className="rounded-lg border border-zinc-100 bg-white px-3 py-2 group hover:border-zinc-200 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
                    <span className="text-[11px] font-medium text-zinc-700 flex-1 truncate">{cred.name}</span>
                    <span className={cn("text-[8px] font-semibold rounded-full px-1.5 py-0", cfg.color, cred.status === "connected" ? "bg-green-50" : cred.status === "expired" ? "bg-amber-50" : cred.status === "error" ? "bg-red-50" : "bg-zinc-100")}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[9px] text-zinc-400">{cred.service}</span>
                    <span className="text-[8px] text-zinc-300">•</span>
                    <span className="text-[9px] text-zinc-400">{credTypeLabels[cred.type]}</span>
                    <span className="text-[8px] text-zinc-300">•</span>
                    <span className="text-[9px] text-zinc-400">{cred.usedByNodes.length} node{cred.usedByNodes.length > 1 ? "s" : ""}</span>
                  </div>
                  {cred.expiresAt && (
                    <p className="mt-0.5 text-[9px] text-amber-500">{cred.expiresAt}</p>
                  )}
                  {/* Hover actions */}
                  <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => testCredential(cred.name)}
                      disabled={testingCred === cred.name}
                      className="rounded px-2 py-0.5 text-[9px] font-medium text-zinc-500 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      {testingCred === cred.name ? "Testing…" : "Test"}
                    </button>
                    {cred.status === "expired" && (
                      <button className="rounded px-2 py-0.5 text-[9px] font-medium text-amber-600 border border-amber-200 hover:bg-amber-50">
                        Reconnect
                      </button>
                    )}
                    {cred.lastTested && (
                      <span className="ml-auto text-[8px] text-zinc-300">Tested {cred.lastTested}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {edges.length} edges
          </p>
          <div className="space-y-1">
            {edges.map((edge, i) => (
              <div key={i} className="rounded-lg border border-zinc-100 px-3 py-2 hover:border-zinc-200 hover:bg-zinc-50 transition-colors cursor-default">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-zinc-600 font-medium truncate max-w-[90px]">{edge.from}</span>
                  <GitBranch size={10} className="text-zinc-300 flex-shrink-0" />
                  <span className="text-zinc-600 font-medium truncate max-w-[90px]">{edge.to}</span>
                </div>
                {edge.label && (
                  <span className="mt-0.5 inline-flex rounded bg-blue-50 px-1.5 py-0 text-[9px] font-medium text-blue-600">
                    {edge.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ASSETS pane ─── */
function AssetsPane() {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {assetGroups.map((group) => (
        <div key={group.title}>
          <div className="mb-1.5 flex items-center gap-1.5">
            <group.icon size={11} className="text-zinc-400" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">{group.title}</p>
          </div>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <div key={item} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-zinc-50 transition-colors cursor-default">
                <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", group.dotColor)} />
                <span className="text-[12px] text-zinc-700 flex-1 truncate">{item}</span>
                <RotateCcw size={11} className="text-zinc-300 hover:text-zinc-500 flex-shrink-0 cursor-pointer transition-colors" title="Verify" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── VARIABLES pane ─── */

interface WorkflowVar {
  key: string;
  value: string;
  env: boolean;
  usedBy: number;
  type: "string" | "number" | "boolean" | "secret" | "json";
  scope: "workflow" | "environment" | "global";
  description?: string;
}

const typeIcons: Record<WorkflowVar["type"], string> = {
  string: "Aa",
  number: "#",
  boolean: "⊘",
  secret: "🔒",
  json: "{ }",
};

const typeBadgeColors: Record<WorkflowVar["type"], string> = {
  string: "bg-blue-50 text-blue-600 border-blue-100",
  number: "bg-amber-50 text-amber-600 border-amber-100",
  boolean: "bg-green-50 text-green-600 border-green-100",
  secret: "bg-red-50 text-red-600 border-red-100",
  json: "bg-violet-50 text-violet-600 border-violet-100",
};

const scopeBadgeColors: Record<WorkflowVar["scope"], string> = {
  workflow: "bg-zinc-100 text-zinc-600",
  environment: "bg-blue-50 text-blue-600",
  global: "bg-violet-50 text-violet-600",
};

const mockVars: WorkflowVar[] = [
  { key: "API_BASE_URL", value: "https://api.acme.com/v2", env: true, usedBy: 4, type: "string", scope: "environment", description: "Primary API endpoint" },
  { key: "MAX_RETRIES", value: "3", env: false, usedBy: 2, type: "number", scope: "workflow" },
  { key: "BATCH_SIZE", value: "50", env: false, usedBy: 1, type: "number", scope: "workflow" },
  { key: "NOTIFY_EMAIL", value: "ops@acme.com", env: false, usedBy: 3, type: "string", scope: "workflow", description: "Alert destination" },
  { key: "TIMEOUT_MS", value: "30000", env: true, usedBy: 2, type: "number", scope: "environment" },
  { key: "API_SECRET", value: "sk-••••••••", env: true, usedBy: 1, type: "secret", scope: "environment" },
  { key: "DEBUG_MODE", value: "false", env: false, usedBy: 0, type: "boolean", scope: "workflow" },
  { key: "WEBHOOK_CONFIG", value: '{"retries":3,"timeout":5000}', env: false, usedBy: 1, type: "json", scope: "workflow" },
];

function VariablesPane() {
  const [vars, setVars] = useState<WorkflowVar[]>(mockVars);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<WorkflowVar["type"]>("string");
  const [newScope, setNewScope] = useState<WorkflowVar["scope"]>("workflow");
  const [newDesc, setNewDesc] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [varSearch, setVarSearch] = useState("");
  const [filterScope, setFilterScope] = useState<WorkflowVar["scope"] | "all">("all");

  function addVar() {
    if (!newKey.trim()) return;
    setVars([...vars, { key: newKey.trim(), value: newValue, env: newScope === "environment", usedBy: 0, type: newType, scope: newScope, description: newDesc || undefined }]);
    setNewKey(""); setNewValue(""); setNewType("string"); setNewScope("workflow"); setNewDesc(""); setShowAdd(false);
  }

  function removeVar(i: number) { setVars(vars.filter((_, idx) => idx !== i)); }
  function updateVar(i: number, value: string) { setVars(vars.map((v, idx) => idx === i ? { ...v, value } : v)); }
  function copyRef(key: string) { navigator.clipboard.writeText(`{{$vars.${key}}}`); }

  const filtered = vars.filter(v => {
    const matchSearch = !varSearch || v.key.toLowerCase().includes(varSearch.toLowerCase()) || (v.description?.toLowerCase().includes(varSearch.toLowerCase()));
    const matchScope = filterScope === "all" || v.scope === filterScope;
    return matchSearch && matchScope;
  });

  const scopeCounts = { all: vars.length, workflow: vars.filter(v => v.scope === "workflow").length, environment: vars.filter(v => v.scope === "environment").length, global: vars.filter(v => v.scope === "global").length };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 space-y-2">
        <p className="text-[10px] text-zinc-400">
          Define key-value pairs accessible via <code className="bg-zinc-100 px-1 rounded text-[10px]">{"{{$vars.KEY}}"}</code>
        </p>

        {/* Search + scope filter */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-300" />
            <input
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 pl-6 pr-2 py-1 text-[11px] outline-none focus:border-zinc-400 transition-colors"
              placeholder="Search variables…"
              value={varSearch}
              onChange={(e) => setVarSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Scope filter tabs */}
        <div className="flex items-center gap-0.5">
          {(["all", "workflow", "environment", "global"] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setFilterScope(scope)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-medium transition-all",
                filterScope === scope ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              )}
            >
              {scope === "all" ? "All" : scope.charAt(0).toUpperCase() + scope.slice(1)} ({scopeCounts[scope]})
            </button>
          ))}
        </div>

        {/* Variable list */}
        <div className="space-y-1">
          {filtered.map((v, i) => {
            const realIdx = vars.indexOf(v);
            return (
              <div
                key={v.key}
                className={cn(
                  "rounded-lg border bg-white px-3 py-2 group transition-all",
                  editingIdx === realIdx ? "border-zinc-300 shadow-xs" : "border-zinc-100 hover:border-zinc-200"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn("rounded border px-1 py-0 text-[8px] font-bold leading-tight flex-shrink-0", typeBadgeColors[v.type])}>
                    {typeIcons[v.type]}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-zinc-700 flex-1 truncate">{v.key}</span>
                  <span className={cn("rounded-full px-1.5 py-0 text-[7px] font-semibold flex-shrink-0", scopeBadgeColors[v.scope])}>
                    {v.scope === "workflow" ? "WF" : v.scope === "environment" ? "ENV" : "GLB"}
                  </span>
                  {v.usedBy > 0 && (
                    <span className="text-[9px] text-zinc-400 flex-shrink-0">{v.usedBy} refs</span>
                  )}
                  {v.usedBy === 0 && (
                    <span className="text-[8px] text-amber-500 flex-shrink-0">unused</span>
                  )}
                </div>
                {v.description && (
                  <p className="mt-0.5 text-[9px] text-zinc-400 italic truncate">{v.description}</p>
                )}
                {editingIdx === realIdx ? (
                  <input
                    className="mt-1.5 w-full rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-mono outline-none focus:border-zinc-400"
                    value={v.value}
                    onChange={(e) => updateVar(realIdx, e.target.value)}
                    onBlur={() => setEditingIdx(null)}
                    onKeyDown={(e) => { if (e.key === "Enter") setEditingIdx(null); }}
                    autoFocus
                  />
                ) : (
                  <p className="mt-0.5 text-[10px] text-zinc-400 font-mono truncate">
                    {v.type === "secret" ? "••••••••••••" : v.value}
                  </p>
                )}
                {/* Hover actions */}
                <div className="mt-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingIdx(editingIdx === realIdx ? null : realIdx)} className="rounded p-0.5 hover:bg-zinc-100" title="Edit">
                    <Eye size={9} className="text-zinc-400" />
                  </button>
                  <button onClick={() => copyRef(v.key)} className="rounded p-0.5 hover:bg-zinc-100" title="Copy expression reference">
                    <Hash size={9} className="text-zinc-400" />
                  </button>
                  <button onClick={() => removeVar(realIdx)} className="rounded p-0.5 hover:bg-red-50" title="Delete">
                    <X size={9} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && varSearch && (
            <p className="text-[10px] text-zinc-400 text-center py-4">No variables match "{varSearch}"</p>
          )}
        </div>

        {/* Add variable form */}
        {showAdd ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5 space-y-1.5">
            <input
              className="w-full rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-mono outline-none focus:border-zinc-400"
              placeholder="VARIABLE_NAME"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
              autoFocus
            />
            <input
              className="w-full rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-mono outline-none focus:border-zinc-400"
              placeholder="value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <input
              className="w-full rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] outline-none focus:border-zinc-400"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex items-center gap-1.5">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as WorkflowVar["type"])}
                className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] outline-none focus:border-zinc-400"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="secret">Secret</option>
                <option value="json">JSON</option>
              </select>
              <select
                value={newScope}
                onChange={(e) => setNewScope(e.target.value as WorkflowVar["scope"])}
                className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] outline-none focus:border-zinc-400"
              >
                <option value="workflow">Workflow</option>
                <option value="environment">Environment</option>
                <option value="global">Global</option>
              </select>
              <div className="flex-1" />
              <button onClick={() => setShowAdd(false)} className="rounded px-2 py-0.5 text-[10px] text-zinc-500 hover:bg-zinc-50">Cancel</button>
              <button onClick={addVar} disabled={!newKey.trim()} className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-white hover:bg-zinc-700 disabled:opacity-40">Add</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full rounded-lg border border-dashed border-zinc-200 py-2 text-[11px] text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 transition-colors"
          >
            + Add variable
          </button>
        )}

        <p className="text-[9px] text-zinc-400 italic pt-1">
          ENV variables inherit from workspace settings. Secret values are encrypted at rest.
        </p>
      </div>
    </div>
  );
}

/* ─── VERSIONS pane ─── */
function VersionsPane() {
  const [selected, setSelected] = useState("v3.2");
  const [showDiff, setShowDiff] = useState(false);

  const changeActionColors: Record<string, string> = {
    added: "text-green-600 bg-green-50",
    modified: "text-blue-600 bg-blue-50",
    removed: "text-red-600 bg-red-50",
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 pb-0 space-y-1.5">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-200 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          <FileText size={12} />
          Save named version
        </button>
        <button
          onClick={() => setShowDiff(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-200 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <GitCompare size={12} />
          Compare versions
        </button>
      </div>
      <div className="p-3 space-y-0.5">
        {versions.map((v) => (
          <button
            key={v.ver}
            onClick={() => setSelected(v.ver)}
            className={cn(
              "flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors",
              selected === v.ver ? "bg-zinc-100" : "hover:bg-zinc-50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-800">{v.ver}</span>
              {v.current && (
                <span className="rounded-full bg-blue-50 px-1.5 py-0 text-[9px] font-medium text-blue-600">Current</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 truncate">{v.label}</p>
            {/* Node change summary */}
            {v.changes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {v.changes.map((c, ci) => (
                  <span key={ci} className={cn("rounded px-1 py-0 text-[8px] font-medium", changeActionColors[c.action])}>
                    {c.action === "added" ? "+" : c.action === "removed" ? "−" : "~"} {c.node}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-zinc-400">{v.who} · {v.time}</p>
              {!v.current && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(v.ver); setShowDiff(true); }}
                  className="text-[10px] text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
                >
                  <Eye size={9} /> Diff
                </button>
              )}
            </div>
          </button>
        ))}
      </div>
      {selected && selected !== "v3.2" && (
        <div className="border-t border-zinc-100 p-3 space-y-1.5">
          <button
            onClick={() => setShowDiff(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-200 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <GitCompare size={12} />
            Compare {selected} with current
          </button>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-700 transition-colors">
            <RotateCcw size={12} />
            Restore {selected}
          </button>
        </div>
      )}
      {showDiff && <WorkflowDiffViewer onClose={() => setShowDiff(false)} />}
    </div>
  );
}

/* ─── NOTES pane ─── */
function NotesPane({ noteText, setNoteText }: { noteText: string; setNoteText: (v: string) => void }) {
  return (
    <div className="flex flex-1 flex-col p-3 gap-2">
      <div className="flex items-center gap-1.5">
        <StickyNote size={12} className="text-amber-500" />
        <span className="text-[11px] font-medium text-zinc-600">Workflow Notes</span>
        <span className="ml-auto text-[10px] text-zinc-400">{noteText.length}/2000</span>
      </div>
      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value.slice(0, 2000))}
        placeholder="Add notes about this workflow…"
        className="flex-1 min-h-[200px] w-full resize-none rounded-lg border border-zinc-200 bg-amber-50/40 p-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/50 transition-all"
      />
      <button className="flex items-center justify-center gap-1.5 rounded-md bg-zinc-900 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-700 transition-colors">
        Save notes
      </button>
    </div>
  );
}

/* ─── HELP pane ─── */
function HelpPane() {
  const [checklistDone, setChecklistDone] = useState<Set<string>>(new Set(["add-trigger", "add-action"]));

  const checklist = [
    { id: "add-trigger", label: "Add a trigger node", tip: "Every workflow needs a trigger — Webhook, Schedule, or Form" },
    { id: "add-action", label: "Add at least one action", tip: "Connect an integration, logic, or AI node" },
    { id: "test-workflow", label: "Test your workflow", tip: "Click 'Run Once' in the bottom bar to test with sample data" },
    { id: "add-error", label: "Add error handling", tip: "Connect an Error Trigger to catch failures" },
    { id: "save-version", label: "Save a named version", tip: "Use the Versions panel to create a snapshot" },
    { id: "activate", label: "Activate the workflow", tip: "Toggle the schedule switch to enable production triggers" },
  ];

  const completedCount = checklistDone.size;

  const contextualTips = [
    { icon: "💡", title: "Expression Syntax", body: "Use {{ $json.field }} to reference data from previous nodes" },
    { icon: "⚡", title: "Execution Order", body: "Nodes execute left-to-right. Use the v1 engine for parallel branches" },
    { icon: "🔒", title: "Secrets & Variables", body: "Store API keys in Variables panel. Use {{$vars.KEY}} in expressions" },
    { icon: "🔄", title: "Error Recovery", body: "Add retry logic to HTTP nodes for resilient workflows" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-5">
      {/* Getting started checklist */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <CheckCircle size={12} className="text-green-500" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Getting Started</p>
          <span className="ml-auto text-[9px] text-zinc-400">{completedCount}/{checklist.length}</span>
        </div>
        {/* Progress bar */}
        <div className="mb-2 h-1 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(completedCount / checklist.length) * 100}%` }} />
        </div>
        <div className="space-y-0.5">
          {checklist.map((item) => {
            const done = checklistDone.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  const next = new Set(checklistDone);
                  if (done) next.delete(item.id); else next.add(item.id);
                  setChecklistDone(next);
                }}
                className={cn(
                  "flex items-start gap-2 w-full rounded-lg px-2.5 py-1.5 text-left transition-colors",
                  done ? "opacity-60" : "hover:bg-zinc-50"
                )}
              >
                <div className={cn(
                  "mt-0.5 h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors",
                  done ? "bg-green-500 border-green-500" : "border-zinc-300"
                )}>
                  {done && <CheckCircle size={8} className="text-white" />}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-[11px] font-medium", done ? "text-zinc-400 line-through" : "text-zinc-700")}>{item.label}</p>
                  <p className="text-[9px] text-zinc-400 truncate">{item.tip}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual tips */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <AlertTriangle size={12} className="text-amber-500" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Quick Tips</p>
        </div>
        <div className="space-y-1.5">
          {contextualTips.map((tip) => (
            <div key={tip.title} className="rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">{tip.icon}</span>
                <span className="text-[10px] font-semibold text-zinc-700">{tip.title}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-zinc-500 leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Keyboard size={12} className="text-zinc-400" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Keyboard shortcuts</p>
        </div>
        <div className="space-y-1">
          {shortcuts.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-1">
              <span className="text-[11px] text-zinc-600">{s.label}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, i) => (
                  <span key={i} className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <HelpCircle size={12} className="text-zinc-400" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Resources</p>
        </div>
        <div className="space-y-0.5">
          {helpLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              {link.label}
              <ExternalLink size={11} className="text-zinc-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

