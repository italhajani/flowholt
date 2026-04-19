import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Plus, Search, Sparkles, Cpu, TestTube, Brain, Wrench, Link2, User, BarChart3, LayoutGrid, List, MessageSquare, ArrowRight, Zap } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

/* ── Mock data per research file 66 ── */
interface Agent {
  id: string;
  name: string;
  status: "active" | "draft" | "inactive";
  model: string;
  provider: string;
  knowledgeCount: number;
  toolCount: number;
  owner: string;
  lastEvaluated: string;
  linkedWorkflows: number;
  evalState: "passed" | "failed" | "untested";
}

const mockAgents: Agent[] = [
  { id: "a1", name: "Lead Scorer", status: "active", model: "GPT-4o", provider: "OpenAI", knowledgeCount: 3, toolCount: 5, owner: "You", lastEvaluated: "2 hrs ago", linkedWorkflows: 4, evalState: "passed" },
  { id: "a2", name: "Support Triage Bot", status: "active", model: "Claude 3.5 Sonnet", provider: "Anthropic", knowledgeCount: 7, toolCount: 3, owner: "Team", lastEvaluated: "1 day ago", linkedWorkflows: 2, evalState: "passed" },
  { id: "a3", name: "Code Review Assistant", status: "draft", model: "GPT-4o", provider: "OpenAI", knowledgeCount: 1, toolCount: 8, owner: "You", lastEvaluated: "—", linkedWorkflows: 0, evalState: "untested" },
  { id: "a4", name: "Document Summarizer", status: "active", model: "Claude 3.5 Haiku", provider: "Anthropic", knowledgeCount: 12, toolCount: 1, owner: "Team", lastEvaluated: "5 hrs ago", linkedWorkflows: 6, evalState: "passed" },
  { id: "a5", name: "Invoice Extractor", status: "inactive", model: "GPT-4o-mini", provider: "OpenAI", knowledgeCount: 2, toolCount: 4, owner: "You", lastEvaluated: "3 days ago", linkedWorkflows: 1, evalState: "failed" },
  { id: "a6", name: "Meeting Note Agent", status: "draft", model: "Gemini 1.5 Pro", provider: "Google", knowledgeCount: 0, toolCount: 2, owner: "You", lastEvaluated: "—", linkedWorkflows: 0, evalState: "untested" },
];

const evalColors: Record<string, { dot: string; text: string }> = {
  passed:   { dot: "bg-green-500", text: "text-green-700" },
  failed:   { dot: "bg-red-500",   text: "text-red-600" },
  untested: { dot: "bg-zinc-300",  text: "text-zinc-500" },
};

const columns: Column<Agent>[] = [
  {
    id: "name",
    header: "Agent",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white flex-shrink-0">
          <Bot size={13} />
        </div>
        <div className="min-w-0">
          <span className="font-medium text-zinc-800 truncate block">{row.name}</span>
          <span className="text-[11px] text-zinc-400">{row.model}</span>
        </div>
      </div>
    ),
  },
  { id: "status", header: "Status", sortable: true, accessor: (row) => <StatusDot status={row.status} /> },
  {
    id: "provider",
    header: "Provider",
    sortable: true,
    hideBelow: "md",
    accessor: (row) => <Badge variant="neutral">{row.provider}</Badge>,
  },
  {
    id: "eval",
    header: "Eval",
    accessor: (row) => {
      const c = evalColors[row.evalState];
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("h-[6px] w-[6px] rounded-full flex-shrink-0", c.dot)} />
          <span className={cn("text-[12px] font-medium capitalize", c.text)}>{row.evalState}</span>
        </span>
      );
    },
  },
  {
    id: "knowledge",
    header: "Knowledge",
    hideBelow: "md",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <Brain size={11} className="text-zinc-300" />
        {row.knowledgeCount}
      </span>
    ),
  },
  {
    id: "tools",
    header: "Tools",
    hideBelow: "md",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <Wrench size={11} className="text-zinc-300" />
        {row.toolCount}
      </span>
    ),
  },
  {
    id: "workflows",
    header: "Workflows",
    hideBelow: "lg",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <Link2 size={11} className="text-zinc-300" />
        {row.linkedWorkflows}
      </span>
    ),
  },
  {
    id: "owner",
    header: "Owner",
    hideBelow: "lg",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <User size={11} className="text-zinc-300" />
        {row.owner}
      </span>
    ),
  },
];

const statusFilters = ["All", "Active", "Draft", "Inactive"] as const;
type StatusFilter = (typeof statusFilters)[number];

const providerFilters = ["All Providers", "OpenAI", "Anthropic", "Google"] as const;

export function AIAgentsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [providerFilter, setProviderFilter] = useState<string>("All Providers");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  const active = mockAgents.filter((a) => a.status === "active").length;
  const drafts = mockAgents.filter((a) => a.status === "draft").length;
  const evalPassed = mockAgents.filter((a) => a.evalState === "passed").length;
  const totalInvocations = "18.4K";

  const filtered = mockAgents.filter((a) => {
    if (statusFilter !== "All" && a.status !== statusFilter.toLowerCase()) return false;
    if (providerFilter !== "All Providers" && a.provider !== providerFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[1020px] px-8 py-8">
      <PageHeader
        title="AI Agents"
        description="Build, evaluate, and deploy intelligent agents."
        actions={
          <Button variant="primary" size="md">
            <Plus size={14} strokeWidth={2.5} />
            New Agent
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="mt-6 grid grid-cols-5 gap-3">
        <MiniStat label="Total Agents" value={mockAgents.length} />
        <MiniStat label="Active" value={active} color="green" />
        <MiniStat label="Drafts" value={drafts} />
        <MiniStat label="Eval Passed" value={evalPassed} color="green" icon={<TestTube size={12} />} />
        <MiniStat label="Invocations" value={0} override={totalInvocations} icon={<Zap size={12} />} />
      </div>

      {/* Filter bar */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <Input
          prefix={<Search size={13} />}
          placeholder="Search agents…"
          className="w-52"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-1 ml-1">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] font-medium transition-all duration-150",
                statusFilter === f
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[12px] text-zinc-600 focus:border-zinc-400 focus:outline-none transition-all"
        >
          {providerFilters.map((p) => <option key={p}>{p}</option>)}
        </select>

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 rounded-md border border-zinc-200 p-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={cn("rounded p-1 transition-all", viewMode === "list" ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-600")}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={cn("rounded p-1 transition-all", viewMode === "cards" ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-600")}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Card view */}
      {viewMode === "cards" ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {filtered.map((agent) => {
            const evalC = evalColors[agent.evalState];
            return (
              <button
                key={agent.id}
                onClick={() => navigate(`/ai-agents/${agent.id}`)}
                className="text-left rounded-xl border border-zinc-100 bg-white p-4 shadow-xs hover:shadow-md hover:border-zinc-200 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white flex-shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-800 truncate group-hover:text-zinc-900">{agent.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{agent.model} • {agent.provider}</p>
                  </div>
                  <StatusDot status={agent.status} />
                </div>

                <div className="mt-3 flex items-center gap-3 text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1"><Brain size={9} /> {agent.knowledgeCount} knowledge</span>
                  <span className="flex items-center gap-1"><Wrench size={9} /> {agent.toolCount} tools</span>
                  <span className="flex items-center gap-1"><Link2 size={9} /> {agent.linkedWorkflows} workflows</span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn("h-[6px] w-[6px] rounded-full", evalC.dot)} />
                    <span className={cn("text-[10px] font-medium capitalize", evalC.text)}>Eval: {agent.evalState}</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">{agent.lastEvaluated}</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3">
              <EmptyState
                icon={<Bot size={32} strokeWidth={1.25} />}
                title="No agents match"
                description="Try a different search term or filter."
              />
            </div>
          )}
        </div>
      ) : (
        /* Data table */
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(a) => a.id}
            selectable
            onRowClick={(a) => navigate(`/ai-agents/${a.id}`)}
            emptyState={
              <EmptyState
                icon={<Bot size={32} strokeWidth={1.25} />}
                title={search ? "No agents match" : "No agents yet"}
                description={search ? "Try a different search term." : "Create your first AI agent to automate complex reasoning tasks."}
                action={
                  !search ? (
                    <Button variant="secondary" size="sm">
                      <Plus size={13} /> Create Agent
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        </div>
      )}

      {/* Capability cards — shown when no filter active */}
      {statusFilter === "All" && !search && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <CapCard
            icon={<Sparkles size={15} className="text-zinc-400" />}
            title="Tool-use Agents"
            description="Connect tools and let agents decide which to call."
          />
          <CapCard
            icon={<Cpu size={15} className="text-zinc-400" />}
            title="Multi-step Chains"
            description="Orchestrate agents in sequential or parallel pipelines."
          />
          <CapCard
            icon={<TestTube size={15} className="text-zinc-400" />}
            title="Eval Suites"
            description="Run automated evaluations to measure agent accuracy."
          />
        </div>
      )}

      {/* Quick actions */}
      {statusFilter === "All" && !search && (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 p-4">
          <p className="text-[11px] font-medium text-zinc-500 mb-2">Quick Start</p>
          <div className="flex gap-2">
            {[
              { label: "Customer Support Bot", icon: <MessageSquare size={11} /> },
              { label: "Data Extraction Agent", icon: <Brain size={11} /> },
              { label: "Code Review Assistant", icon: <Cpu size={11} /> },
            ].map((tpl, i) => (
              <button key={i} className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all">
                {tpl.icon} {tpl.label} <ArrowRight size={9} className="text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color, icon, override }: { label: string; value: number; color?: "green"; icon?: React.ReactNode; override?: string }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white px-4 py-2.5 shadow-xs">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && <span className={color === "green" ? "text-green-400" : "text-zinc-400"}>{icon}</span>}
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className={cn("text-[18px] font-semibold leading-tight", color === "green" ? "text-green-600" : "text-zinc-800")}>{override ?? value}</p>
    </div>
  );
}

function CapCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 transition-colors duration-150 hover:bg-zinc-50/50 cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[13px] font-medium text-zinc-800">{title}</span>
      </div>
      <p className="text-[12px] text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
