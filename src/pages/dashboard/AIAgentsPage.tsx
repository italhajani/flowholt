import React, { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleDashed,
  GitBranch,
  Loader2,
  Network,
  Plus,
  Search,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import { AgentsLoader } from "@/components/dashboard/DashboardRouteLoader";
import { api } from "@/lib/api";
import {
  buildAgentEntries,
  buildStarterAgentWorkflow,
  getAgentOperationalStatus,
  getAgentSummary,
  getAgentTopologySummary,
  type AgentEntry,
} from "@/lib/agent-inventory";
import { cn } from "@/lib/utils";

type InventoryFilter = "all" | "ready" | "attention" | "draft";

type InventoryAgent = AgentEntry & {
  credentialName: string | null;
  operational: ReturnType<typeof getAgentOperationalStatus>;
  topology: ReturnType<typeof getAgentTopologySummary>;
  summary: string;
};

const filters: Array<{ id: InventoryFilter; label: string }> = [
  { id: "all", label: "All agents" },
  { id: "ready", label: "Ready" },
  { id: "attention", label: "Needs attention" },
  { id: "draft", label: "Draft" },
];

const stateBadgeClasses = {
  ready: "bg-emerald-50 text-emerald-700 border-emerald-100",
  attention: "bg-amber-50 text-amber-700 border-amber-100",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
} as const;

const statePriority = {
  attention: 0,
  draft: 1,
  ready: 2,
} as const;

const AIAgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InventoryFilter>("all");
  const [creating, setCreating] = useState(false);

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => api.listWorkflows(),
  });

  const workflowDetails = useQueries({
    queries: workflows.map((workflow) => ({
      queryKey: ["workflow", workflow.id, "ai-agents-index"],
      queryFn: () => api.getWorkflow(workflow.id),
      staleTime: 30_000,
      retry: 1,
    })),
  });

  const { data: vault } = useQuery({
    queryKey: ["vault-overview"],
    queryFn: () => api.getVaultOverview(),
    initialData: { connections: [], credentials: [], variables: [] },
  });

  const loading = workflowsLoading || workflowDetails.some((query) => query.isLoading);

  const credentialNameById = useMemo(
    () => new Map(vault.credentials.map((credential) => [credential.id, credential.name])),
    [vault.credentials],
  );

  const inventory = useMemo<InventoryAgent[]>(() => {
    return workflowDetails
      .flatMap((query) => (query.data ? buildAgentEntries(query.data) : []))
      .map((agent) => {
        const credentialResolved = agent.credentialId ? credentialNameById.has(agent.credentialId) : null;
        return {
          ...agent,
          credentialName: agent.credentialId ? credentialNameById.get(agent.credentialId) ?? null : null,
          operational: getAgentOperationalStatus(agent, { credentialResolved }),
          topology: getAgentTopologySummary(agent),
          summary: getAgentSummary(agent),
        };
      })
      .sort((left, right) => {
        const priorityDelta = statePriority[left.operational.state] - statePriority[right.operational.state];
        if (priorityDelta !== 0) {
          return priorityDelta;
        }
        return left.nodeName.localeCompare(right.nodeName);
      });
  }, [credentialNameById, workflowDetails]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return inventory.filter((agent) => {
      const matchesFilter = filter === "all" || agent.operational.state === filter;
      const matchesSearch =
        !term ||
        agent.nodeName.toLowerCase().includes(term) ||
        agent.workflowName.toLowerCase().includes(term) ||
        agent.provider.toLowerCase().includes(term) ||
        agent.model.toLowerCase().includes(term) ||
        agent.tools.some((tool) => tool.toLowerCase().includes(term)) ||
        agent.connectedNodeLabels.some((label) => label.toLowerCase().includes(term));

      return matchesFilter && matchesSearch;
    });
  }, [filter, inventory, search]);

  const counts = useMemo(() => {
    const ready = inventory.filter((agent) => agent.operational.state === "ready").length;
    const attention = inventory.filter((agent) => agent.operational.state === "attention").length;
    const workflowCount = new Set(inventory.map((agent) => agent.workflowId)).size;
    const connected = inventory.filter((agent) => agent.topology.sourceCount > 0).length;

    return { ready, attention, workflowCount, connected };
  }, [inventory]);

  const handleCreateInStudio = async () => {
    try {
      setCreating(true);
      const starter = buildStarterAgentWorkflow();
      const workflow = await api.createWorkflow(starter);
      navigate(`/studio/${workflow.id}?node=${encodeURIComponent(starter.focusNodeId)}`);
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const openDetails = (agent: InventoryAgent) => {
    navigate(`/dashboard/ai-agents/${agent.workflowId}/${agent.nodeId}`);
  };

  const openDetailsInNewTab = (agent: InventoryAgent) => {
    window.open(`/dashboard/ai-agents/${agent.workflowId}/${agent.nodeId}`, "_blank", "noopener,noreferrer");
  };

  const openInStudio = (agent: InventoryAgent) => {
    navigate(`/studio/${agent.workflowId}?node=${encodeURIComponent(agent.nodeId)}`);
  };

  if (loading) {
    return <AgentsLoader />;
  }

  return (
    <div className="mx-auto max-w-[1440px] animate-fade-in px-6 pb-24 pt-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Workflow-backed inventory
          </div>
          <h1 className="mt-3 text-[22px] font-semibold tracking-[-0.01em] text-slate-900">AI Agents</h1>
          <p className="mt-1.5 text-[13px] leading-6 text-slate-500">
            Review operational readiness, workflow ownership, and graph topology for every agent built in Studio.
            Shared provider access stays in AI Center; prompting, tools, memory, and graph wiring stay in the workflow.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/credentials?tab=ai&section=providers")}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Open AI Center
          </button>
          <button
            type="button"
            onClick={() => void handleCreateInStudio()}
            disabled={creating}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-[13px] font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create in Studio
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-[20px] border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[12px] font-semibold text-slate-900">Platform boundary</div>
            <p className="mt-1 text-[13px] text-slate-500">
              This is an inventory surface, not a second agent builder. Use Studio to design the graph and AI Center to govern shared provider access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[12px] text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Workflow topology first</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">No separate registry</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Studio is the edit path</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Inventory"
          value={inventory.length}
          icon={Bot}
          iconColor="text-violet-600 bg-violet-50 border-violet-100"
        />
        <StatCard
          label="Ready"
          value={counts.ready}
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-100"
        />
        <StatCard
          label="Needs Attention"
          value={counts.attention}
          icon={AlertTriangle}
          iconColor="text-amber-600 bg-amber-50 border-amber-100"
        />
        <StatCard
          label="Workflows"
          value={counts.workflowCount}
          icon={GitBranch}
          iconColor="text-slate-600 bg-slate-100 border-slate-200"
        />
      </div>

      {counts.attention > 0 && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[13px] font-semibold text-amber-900">{counts.attention} agents need configuration review</div>
            <p className="mt-0.5 text-[12px] text-amber-800/80">
              Missing model bindings and missing instructions are surfaced here as operational issues instead of secondary feature tags.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilter("attention")}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-amber-200 bg-white px-3 text-[12px] font-medium text-amber-900 transition-colors hover:bg-amber-100/40"
          >
            Review attention items
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-6">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "relative pb-2.5 text-[13px] font-medium transition-colors",
                  filter === item.id
                    ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-slate-900"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[360px]">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search agents, workflows, models, or tools"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
            />
          </div>
          <div className="text-[12px] text-slate-500">
            {filtered.length} result{filtered.length === 1 ? "" : "s"} · {counts.connected} with upstream context
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
            <CircleDashed size={18} />
          </div>
          <div className="mt-4 text-[16px] font-semibold text-slate-900">
            {inventory.length === 0 ? "No AI agents have been built yet" : "No agents match the current view"}
          </div>
          <p className="mx-auto mt-1.5 max-w-xl text-[13px] leading-6 text-slate-500">
            {inventory.length === 0
              ? "Create a starter workflow in Studio to place the full agent cluster on the canvas and bring it into the inventory."
              : "Try a broader search or switch filters to inspect the rest of the inventory."}
          </p>
          {inventory.length === 0 && (
            <button
              type="button"
              onClick={() => void handleCreateInStudio()}
              disabled={creating}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-[13px] font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create starter agent
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-[minmax(0,2.2fr)_180px_220px_200px_210px_170px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3">
                {[
                  "Agent",
                  "State",
                  "Topology",
                  "Workflow",
                  "Model",
                  "Actions",
                ].map((label) => (
                  <div key={label} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {label}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-slate-100">
                {filtered.map((agent) => (
                  <div
                    key={`${agent.workflowId}:${agent.nodeId}`}
                    className="grid cursor-pointer grid-cols-[minmax(0,2.2fr)_180px_220px_200px_210px_170px] gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                    onClick={() => openDetails(agent)}
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
                          <Bot size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-[13px] font-semibold text-slate-900">{agent.nodeName}</div>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              {agent.workflowStatus}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-500">{agent.summary}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          stateBadgeClasses[agent.operational.state],
                        )}
                      >
                        {agent.operational.label}
                      </span>
                      <p className="mt-2 text-[12px] leading-5 text-slate-500">{agent.operational.summary}</p>
                    </div>

                    <div>
                      <div className="text-[12px] font-medium text-slate-700">{agent.topology.compact}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {agent.topology.sourceCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            <Network size={10} />
                            {agent.topology.sourceCount} source{agent.topology.sourceCount === 1 ? "" : "s"}
                          </span>
                        )}
                        {agent.topology.toolCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {agent.topology.toolCount} tool{agent.topology.toolCount === 1 ? "" : "s"}
                          </span>
                        )}
                        {agent.topology.memoryCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            Memory
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="truncate text-[12px] font-medium text-slate-700">{agent.workflowName}</div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {agent.connectedNodeLabels.length > 0
                          ? `${agent.connectedNodeLabels[0]}${agent.connectedNodeLabels.length > 1 ? ` +${agent.connectedNodeLabels.length - 1}` : ""}`
                          : "No upstream sources"}
                      </p>
                    </div>

                    <div>
                      <div className="text-[12px] font-medium text-slate-700">
                        {agent.provider && agent.model ? `${agent.provider} / ${agent.model}` : agent.provider || agent.model || "No model"}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {agent.credentialName ?? (agent.credentialId ? "Credential missing" : "No linked credential")}
                      </p>
                    </div>

                    <div className="flex items-start justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openDetailsInNewTab(agent)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Inspect
                        <ArrowUpRight size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openInStudio(agent)}
                        className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-[12px] font-medium text-white transition-colors hover:bg-slate-800"
                      >
                        Studio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentsPage;