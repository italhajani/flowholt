import React, { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, Filter, GitBranch, CheckCircle2, FileEdit, AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import StatCard from "@/components/dashboard/StatCard";
import WorkflowTable, { type WorkflowItem } from "@/components/dashboard/WorkflowTable";
import { WorkflowsLoader } from "@/components/dashboard/DashboardRouteLoader";
import { api, type ApiWorkflow } from "@/lib/api";
import { useNavigate } from "react-router-dom";

type StatusFilter = "all" | "active" | "draft" | "paused" | "error";

const WorkflowsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeTab, setActiveTab] = useState<"workflows" | "templates">("workflows");
  const [prompt, setPrompt] = useState("");
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api
      .listWorkflows()
      .then((data) => {
        if (!active) return;
        setWorkflows(data.map(mapWorkflow));
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load workflows");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = workflows.filter((wf) => {
    const matchesSearch = wf.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || wf.status === statusFilter || (statusFilter === "error" && wf.status === "paused");
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => ({
    total: workflows.length,
    active: workflows.filter((w) => w.status === "active").length,
    draft: workflows.filter((w) => w.status === "draft").length,
    issues: workflows.filter((w) => w.status === "paused").length,
  }), [workflows]);

  const refreshWorkflows = () => {
    setLoading(true);
    api
      .listWorkflows()
      .then((data) => {
        setWorkflows(data.map(mapWorkflow));
        setError(null);
      })
      .catch(() => setError("Could not load workflows"))
      .finally(() => setLoading(false));
  };

  const handleCreateBlank = async () => {
    try {
      setActionLoading(true);
      const workflow = await api.createWorkflow({
        name: "Blank Workflow",
        trigger_type: "manual",
        category: "Custom",
        status: "draft",
        definition: {
          steps: [
            { id: "trigger-1", type: "trigger", name: "Manual trigger", config: { ui_position: { x: 96, y: 120 } } },
            {
              id: "llm-1",
              type: "llm",
              name: "Draft response",
              config: {
                prompt: "Review the input and propose the next best workflow action.",
                ui_position: { x: 430, y: 120 },
              },
            },
            {
              id: "output-1",
              type: "output",
              name: "Finish",
              config: { channel: "default", ui_position: { x: 790, y: 120 } },
            },
          ],
          edges: [
            { id: "edge-trigger-llm", source: "trigger-1", target: "llm-1" },
            { id: "edge-llm-output", source: "llm-1", target: "output-1" },
          ],
        },
      });
      refreshWorkflows();
      navigate(`/studio/${workflow.id}`);
    } catch {
      setError("Could not create blank workflow");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Enter a short workflow idea first");
      return;
    }
    try {
      setActionLoading(true);
      const workflow = await api.generateWorkflow(prompt.trim());
      refreshWorkflows();
      navigate(`/studio/${workflow.id}`);
    } catch {
      setError("Could not generate workflow");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunWorkflow = async (workflowId: string) => {
    try {
      setActionLoading(true);
      await api.runWorkflow(workflowId, { source: "dashboard-run" });
      navigate("/dashboard/executions");
    } catch {
      setError("Could not run workflow");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    loading ? (
      <WorkflowsLoader />
    ) : (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in pb-24">
      <div className="mb-10 text-center max-w-4xl mx-auto mt-2">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight mb-2">Hi Muhammad, what would you automate?</h1>
        <p className="text-[14px] text-slate-500 mb-6">Describe the flow you want to build and FlowHolt can help structure the first draft.</p>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-5 text-left">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything"
            className="w-full bg-transparent outline-none text-[15px] text-slate-700 placeholder:text-slate-400 mb-6"
          />
          <div className="flex items-center justify-between">
            <button onClick={handleCreateBlank} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 transition-colors">
              <Plus size={18} />
            </button>
            <button onClick={handleGenerate} disabled={actionLoading} className="h-10 px-4 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 disabled:opacity-60">
              <Sparkles size={14} />
              {actionLoading ? "Working..." : "Generate flow"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <span className="text-[12px] font-medium text-slate-400">or</span>
        </div>

        <div className="flex items-center justify-center mt-4">
          <button onClick={handleCreateBlank} disabled={actionLoading} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2 disabled:opacity-60">
            <Plus size={14} />
            Create a blank workflow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Workflows" value={stats.total} icon={GitBranch} trend={{ value: 12, label: "this month" }} iconColor="text-slate-500 bg-slate-50 border-slate-100" />
        <StatCard label="Active & Running" value={stats.active} icon={CheckCircle2} iconColor="text-emerald-500 bg-emerald-50 border-emerald-100" trend={{ value: 8, label: "this month" }} />
        <StatCard label="Drafting" value={stats.draft} icon={FileEdit} iconColor="text-amber-500 bg-amber-50 border-amber-100" />
        <StatCard label="Current Issues" value={stats.issues} icon={AlertTriangle} iconColor="text-red-500 bg-red-50 border-red-100" trend={{ value: -25, label: "this month" }} />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-5 bg-white p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center bg-slate-100 p-1 rounded-[10px]">
            {(["workflows", "templates"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-1.5 text-[13px] font-semibold rounded-md transition-all duration-150 capitalize",
                  activeTab === tab
                    ? "bg-white text-slate-900 border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white transition-all w-80 mx-4">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search workflows by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-[13px] bg-transparent outline-none placeholder-slate-400 text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center">
            {(
              [
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "draft", label: "Draft" },
                { key: "paused", label: "Paused" },
                { key: "error", label: "Issues" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-150 tracking-wide mx-0.5",
                  statusFilter === f.key
                    ? "bg-[#0b101c] text-white"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">{error}</div>
        ) : (
          <WorkflowTable workflows={filtered} onRun={handleRunWorkflow} />
        )}
      </div>
    </div>
    )
  );
};

export default WorkflowsPage;

function mapWorkflow(item: ApiWorkflow): WorkflowItem {
  return {
    id: item.id,
    name: item.name,
    status: item.status,
    triggerType: item.trigger_type,
    lastRun: formatRelativeTime(item.last_run_at),
    successRate: item.success_rate,
    createdAt: formatDate(item.created_at),
    category: item.category,
  };
}

function formatRelativeTime(value: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
