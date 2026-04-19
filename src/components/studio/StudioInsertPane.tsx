import { useState } from "react";
import {
  X, Search, Clock, Star, ChevronRight,
  GitBranch, KeyRound, RotateCcw, StickyNote,
  HelpCircle, Keyboard, ExternalLink, FileText,
  CheckCircle, AlertTriangle, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

const contextTitles: Record<string, string> = {
  nodes: "Insert Node",
  outline: "Outline",
  connections: "Connections",
  assets: "Assets",
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

const sections: { title: string; items: NodeChip[] }[] = [
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
  { ver: "v3.2", label: "Current draft",      who: "You",       time: "Just now",    current: true },
  { ver: "v3.1", label: "Fixed scorer prompt", who: "You",       time: "2 hours ago", current: false },
  { ver: "v3.0", label: "Added CRM update",    who: "C. Kim",    time: "Yesterday",   current: false },
  { ver: "v2.9", label: "Initial AI scoring",  who: "You",       time: "3 days ago",  current: false },
  { ver: "v2.8", label: "Webhook rework",       who: "A. Brandt", time: "Last week",   current: false },
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
      {context === "nodes" && <NodesPane search={search} setSearch={setSearch} recentTab={recentTab} setRecentTab={setRecentTab} />}
      {context === "outline" && <OutlinePane />}
      {context === "connections" && <ConnectionsPane />}
      {context === "assets" && <AssetsPane />}
      {context === "versions" && <VersionsPane />}
      {context === "notes" && <NotesPane noteText={noteText} setNoteText={setNoteText} />}
      {context === "help" && <HelpPane />}
    </div>
  );
}

/* ─── NODES pane ─── */
function NodesPane({
  search, setSearch, recentTab, setRecentTab,
}: {
  search: string; setSearch: (v: string) => void;
  recentTab: "recent" | "starred"; setRecentTab: (v: "recent" | "starred") => void;
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
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-zinc-50 transition-colors group"
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
  return (
    <div className="flex-1 overflow-y-auto p-3">
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

/* ─── VERSIONS pane ─── */
function VersionsPane() {
  const [selected, setSelected] = useState("v3.2");
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 pb-0">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-200 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          <FileText size={12} />
          Save named version
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
            <p className="text-[10px] text-zinc-400">{v.who} · {v.time}</p>
          </button>
        ))}
      </div>
      {selected && selected !== "v3.2" && (
        <div className="border-t border-zinc-100 p-3">
          <button className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-700 transition-colors">
            <RotateCcw size={12} />
            Restore {selected}
          </button>
        </div>
      )}
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
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-5">
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

