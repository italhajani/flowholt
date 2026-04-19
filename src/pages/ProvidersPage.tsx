import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plug, Plus, Search, Cpu, Zap, Database, Layers, Shield, Clock, BarChart3, ExternalLink, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, LayoutGrid, List, RefreshCw, Activity } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

/* ── Mock data per research file 66 — provider inventory spec ── */
interface Provider {
  id: string;
  name: string;
  type: "AI Model" | "Vector" | "Storage" | "Integration";
  health: "healthy" | "warning" | "error" | "inactive";
  authMode: string;
  modelCount: number;
  lastVerified: string;
  usageOps: string;
}

const mockProviders: Provider[] = [
  { id: "p1", name: "OpenAI", type: "AI Model", health: "healthy", authMode: "API Key", modelCount: 12, lastVerified: "5 min ago", usageOps: "24.3k" },
  { id: "p2", name: "Anthropic", type: "AI Model", health: "healthy", authMode: "API Key", modelCount: 6, lastVerified: "10 min ago", usageOps: "18.1k" },
  { id: "p3", name: "Google AI", type: "AI Model", health: "warning", authMode: "Service Account", modelCount: 8, lastVerified: "2 days ago", usageOps: "5.2k" },
  { id: "p4", name: "Pinecone", type: "Vector", health: "healthy", authMode: "API Key", modelCount: 0, lastVerified: "1 hr ago", usageOps: "8.7k" },
  { id: "p5", name: "Weaviate", type: "Vector", health: "inactive", authMode: "API Key", modelCount: 0, lastVerified: "—", usageOps: "0" },
  { id: "p6", name: "PostgreSQL", type: "Storage", health: "healthy", authMode: "Connection String", modelCount: 0, lastVerified: "3 min ago", usageOps: "42.1k" },
  { id: "p7", name: "Slack", type: "Integration", health: "healthy", authMode: "OAuth 2.0", modelCount: 0, lastVerified: "20 min ago", usageOps: "11.4k" },
  { id: "p8", name: "GitHub", type: "Integration", health: "healthy", authMode: "OAuth 2.0", modelCount: 0, lastVerified: "1 hr ago", usageOps: "6.9k" },
  { id: "p9", name: "Stripe", type: "Integration", health: "error", authMode: "API Key", modelCount: 0, lastVerified: "1 week ago", usageOps: "1.2k" },
  { id: "p10", name: "Supabase", type: "Storage", health: "healthy", authMode: "API Key", modelCount: 0, lastVerified: "15 min ago", usageOps: "14.8k" },
];

const typeIcons: Record<string, React.ElementType> = {
  "AI Model": Cpu,
  "Vector": Layers,
  "Storage": Database,
  "Integration": Zap,
};

const typeColors: Record<string, string> = {
  "AI Model": "bg-purple-50 text-purple-500",
  "Vector": "bg-blue-50 text-blue-500",
  "Storage": "bg-emerald-50 text-emerald-500",
  "Integration": "bg-amber-50 text-amber-500",
};

const columns: Column<Provider>[] = [
  {
    id: "name",
    header: "Provider",
    sortable: true,
    accessor: (row) => {
      const Icon = typeIcons[row.type];
      const colorClass = typeColors[row.type];
      return (
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0", colorClass)}>
            <Icon size={13} />
          </div>
          <span className="font-medium text-zinc-800">{row.name}</span>
        </div>
      );
    },
  },
  {
    id: "type",
    header: "Type",
    sortable: true,
    accessor: (row) => <Badge variant="neutral">{row.type}</Badge>,
  },
  { id: "health", header: "Health", sortable: true, accessor: (row) => <StatusDot status={row.health} /> },
  {
    id: "auth",
    header: "Auth",
    hideBelow: "md",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <Shield size={11} className="text-zinc-300" />
        {row.authMode}
      </span>
    ),
  },
  {
    id: "models",
    header: "Models",
    hideBelow: "md",
    accessor: (row) => (
      <span className="text-zinc-500">
        {row.modelCount > 0 ? row.modelCount : "—"}
      </span>
    ),
  },
  {
    id: "lastVerified",
    header: "Last Verified",
    sortable: true,
    hideBelow: "lg",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <Clock size={11} className="text-zinc-300" />
        {row.lastVerified}
      </span>
    ),
  },
  {
    id: "usage",
    header: "Usage",
    sortable: true,
    hideBelow: "lg",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <BarChart3 size={11} className="text-zinc-300" />
        {row.usageOps} ops
      </span>
    ),
  },
];

const categoryFilters = ["All", "AI Model", "Vector", "Storage", "Integration"] as const;
type CategoryFilter = (typeof categoryFilters)[number];

export function ProvidersPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  const healthy = mockProviders.filter((p) => p.health === "healthy").length;
  const warnings = mockProviders.filter((p) => p.health === "warning" || p.health === "error").length;
  const totalOps = "133.7k";

  const filtered = mockProviders.filter((p) => {
    if (categoryFilter !== "All" && p.type !== categoryFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[1020px] px-8 py-8">
      <PageHeader
        title="Providers"
        description="AI models, vector stores, databases, and integration connectors."
        actions={
          <Button variant="primary" size="md">
            <Plus size={14} strokeWidth={2.5} />
            Add Provider
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="mt-6 grid grid-cols-5 gap-3">
        <SumCard label="Total" value={mockProviders.length} />
        <SumCard label="Healthy" value={healthy} color="green" />
        <SumCard label="Issues" value={warnings} color="red" />
        <SumCard label="AI Models" value={mockProviders.filter((p) => p.type === "AI Model").length} icon={<Cpu size={12} />} />
        <SumCard label="Total Ops" value={0} override={totalOps} icon={<Activity size={12} />} />
      </div>

      {/* Health alert banner */}
      {warnings > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
          <span className="text-[12px] text-amber-700">
            <strong>{warnings} provider{warnings > 1 ? "s" : ""}</strong> need attention — check connection health below.
          </span>
          <button className="ml-auto text-[11px] font-medium text-amber-700 hover:text-amber-900 transition-colors">
            View details →
          </button>
        </div>
      )}

      {/* Category filters + search */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <Input
          prefix={<Search size={13} />}
          placeholder="Search providers…"
          className="w-52"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-1 ml-1">
          {categoryFilters.map((f) => (
            <button
              key={f}
              onClick={() => setCategoryFilter(f)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] font-medium transition-all duration-150",
                categoryFilter === f
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 rounded-md border border-zinc-200 p-0.5">
          <button onClick={() => setViewMode("list")} className={cn("rounded p-1 transition-all", viewMode === "list" ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-600")}>
            <List size={14} />
          </button>
          <button onClick={() => setViewMode("cards")} className={cn("rounded p-1 transition-all", viewMode === "cards" ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-600")}>
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Card view */}
      {viewMode === "cards" ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {filtered.map((p) => {
            const Icon = typeIcons[p.type];
            const colorClass = typeColors[p.type];
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/providers/${p.id}`)}
                className="text-left rounded-xl border border-zinc-100 bg-white p-4 shadow-xs hover:shadow-md hover:border-zinc-200 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0", colorClass)}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{p.type}</p>
                  </div>
                  <StatusDot status={p.health} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1"><Shield size={9} /> {p.authMode}</span>
                  {p.modelCount > 0 && <span className="flex items-center gap-1"><Cpu size={9} /> {p.modelCount} models</span>}
                  <span className="flex items-center gap-1"><BarChart3 size={9} /> {p.usageOps} ops</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-300">
                  <span className="flex items-center gap-1"><Clock size={9} /> Verified {p.lastVerified}</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3">
              <EmptyState icon={<Plug size={32} strokeWidth={1.25} />} title="No providers match" description="Try a different search." />
            </div>
          )}
        </div>
      ) : (
        /* Data table */
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(p) => p.id}
            selectable
            onRowClick={(p) => navigate(`/providers/${p.id}`)}
            emptyState={
              <EmptyState
                icon={<Plug size={32} strokeWidth={1.25} />}
                title={search ? "No providers match" : "No providers configured"}
                description={search ? "Try adjusting your search or filter." : "Add your first provider to connect AI models and services."}
                action={
                  !search ? (
                    <Button variant="secondary" size="sm">
                      <Plus size={13} /> Add Provider
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        </div>
      )}

      {/* Model catalog */}
      {(categoryFilter === "All" || categoryFilter === "AI Model") && !search && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-zinc-700">Model Catalog</h3>
            <span className="text-[11px] text-zinc-400">{modelCatalog.length} models available</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {modelCatalog.map((model, i) => (
              <div key={i} className="rounded-lg border border-zinc-100 bg-white p-3 shadow-xs hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn("h-2 w-2 rounded-full", model.provider === "OpenAI" ? "bg-emerald-400" : model.provider === "Anthropic" ? "bg-violet-400" : "bg-blue-400")} />
                  <span className="text-[11px] font-medium text-zinc-700 truncate">{model.name}</span>
                </div>
                <div className="space-y-1 text-[10px] text-zinc-400">
                  <div className="flex justify-between"><span>Provider</span><span className="text-zinc-600">{model.provider}</span></div>
                  <div className="flex justify-between"><span>Context</span><span className="font-mono text-zinc-600">{model.context}</span></div>
                  <div className="flex justify-between"><span>Cost/1M tokens</span><span className="font-mono text-zinc-600">{model.cost}</span></div>
                </div>
                {model.tags && (
                  <div className="mt-1.5 flex gap-1">
                    {model.tags.map((tag) => (
                      <span key={tag} className="rounded bg-zinc-50 px-1 py-0.5 text-[8px] text-zinc-400">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick connect suggestions */}
      {!search && categoryFilter === "All" && (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 p-4">
          <p className="text-[11px] font-medium text-zinc-500 mb-2">Popular Integrations</p>
          <div className="flex gap-2 flex-wrap">
            {["Notion", "Airtable", "Twilio", "SendGrid", "AWS S3", "Azure OpenAI"].map((name) => (
              <button key={name} className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all">
                <Plus size={10} className="text-zinc-400" /> {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SumCard({ label, value, color, icon, override }: { label: string; value: number; color?: "green" | "red"; icon?: React.ReactNode; override?: string }) {
  const textColor = color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : "text-zinc-800";
  const iconColor = color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : "text-zinc-400";
  return (
    <div className="rounded-lg border border-zinc-100 bg-white px-4 py-2.5 shadow-xs">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && <span className={iconColor}>{icon}</span>}
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className={cn("text-[18px] font-semibold leading-tight", textColor)}>{override ?? value}</p>
    </div>
  );
}

/* Model catalog data */
const modelCatalog = [
  { name: "GPT-4o", provider: "OpenAI", context: "128K", cost: "$5.00", tags: ["Best quality"] },
  { name: "GPT-4o-mini", provider: "OpenAI", context: "128K", cost: "$0.15", tags: ["Fast", "Cheap"] },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", context: "200K", cost: "$3.00", tags: ["Balanced"] },
  { name: "Claude 3.5 Haiku", provider: "Anthropic", context: "200K", cost: "$0.25", tags: ["Fast"] },
  { name: "Gemini 1.5 Pro", provider: "Google", context: "2M", cost: "$3.50", tags: ["Long context"] },
  { name: "Gemini 1.5 Flash", provider: "Google", context: "1M", cost: "$0.08", tags: ["Fastest"] },
  { name: "text-embedding-3-large", provider: "OpenAI", context: "8K", cost: "$0.13", tags: ["Embedding"] },
  { name: "voyage-3", provider: "Anthropic", context: "32K", cost: "$0.06", tags: ["Embedding"] },
];
