import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Zap,
  Clock,
  GitBranch,
  Plus,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Loader2,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Cpu,
} from "lucide-react";
import AssistantComposer, { pickPreferredModelId } from "@/components/chat/AssistantComposer";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type ApiChatAttachment, type ApiExecution, type ApiLLMProviderInfo, type ApiWorkflow, type ApiSystemStatus } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const statusIcon: Record<string, React.ElementType> = {
  success: CheckCircle2,
  failed: XCircle,
  running: Play,
  paused: Pause,
  cancelled: AlertTriangle,
};

const statusColor: Record<string, string> = {
  success: "text-emerald-500",
  failed: "text-red-500",
  running: "text-amber-500",
  paused: "text-blue-500",
  cancelled: "text-slate-400",
};

const statusBadge: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-600",
  failed: "bg-red-50 text-red-600",
  running: "bg-amber-50 text-amber-600",
  paused: "bg-blue-50 text-blue-600",
  cancelled: "bg-slate-50 text-slate-500",
};

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatRelative(value: string | null): string {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function buildExecutionTrend(executions: ApiExecution[]): Array<{ label: string; success: number; failed: number; other: number }> {
  const buckets: Record<string, { success: number; failed: number; other: number }> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short" });
    buckets[key] = { success: 0, failed: 0, other: 0 };
  }
  for (const ex of executions) {
    const key = new Date(ex.started_at).toLocaleDateString("en-US", { weekday: "short" });
    if (buckets[key]) {
      if (ex.status === "success") buckets[key].success++;
      else if (ex.status === "failed") buckets[key].failed++;
      else buckets[key].other++;
    }
  }
  return Object.entries(buckets).map(([label, counts]) => ({ label, ...counts }));
}

function buildStatusBreakdown(status: ApiSystemStatus["executions"]): Array<{ name: string; value: number; color: string }> {
  return [
    { name: "Success", value: status.success, color: "#10b981" },
    { name: "Failed", value: status.failed, color: "#ef4444" },
    { name: "Running", value: status.running, color: "#f59e0b" },
  ].filter((d) => d.value > 0);
}

const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [chatRouting, setChatRouting] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ApiChatAttachment[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [models, setModels] = useState<ApiLLMProviderInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const defaultModelId = useMemo(() => pickPreferredModelId(models), [models]);

  const { data: sysStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["system-status"],
    queryFn: () => api.getSystemStatus(),
  });

  const { data: executions = [], isLoading: execLoading } = useQuery({
    queryKey: ["executions"],
    queryFn: () => api.listExecutions(),
  });

  const { data: workflows = [], isLoading: wfLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => api.listWorkflows(),
  });

  const loading = statusLoading || execLoading || wfLoading;

  useEffect(() => {
    api.listChatModels().then(setModels).catch(() => {
      toast({
        title: "Could not load chat models",
        description: "The overview prompt will use the platform default model.",
      });
    });
  }, []);

  useEffect(() => {
    if (!selectedModel && defaultModelId) {
      setSelectedModel(defaultModelId);
    }
  }, [defaultModelId, selectedModel]);

  const recentExecutions = useMemo(() =>
    [...executions].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()).slice(0, 6),
    [executions],
  );

  const activeWorkflows = useMemo(() => workflows.filter((w) => w.status === "active").slice(0, 5), [workflows]);

  const trendData = useMemo(() => buildExecutionTrend(executions), [executions]);
  const breakdownData = useMemo(() => sysStatus ? buildStatusBreakdown(sysStatus.executions) : [], [sysStatus]);

  const successRate = sysStatus && sysStatus.executions.total > 0
    ? Math.round((sysStatus.executions.success / sysStatus.executions.total) * 100)
    : 0;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      const wf = await api.generateWorkflow(prompt.trim());
      navigate(`/studio/${wf.id}?prompt=${encodeURIComponent(prompt.trim())}`);
    } catch { /* handled by studio */ }
  };

  const handleAskAI = () => {
    if (!prompt.trim()) {
      return;
    }
    const modelId = selectedModel || defaultModelId;
    setChatRouting(true);
    const params = new URLSearchParams({ message: prompt.trim() });
    if (modelId) {
      params.set("model", modelId);
    }
    if (pendingAttachments.length) {
      params.set("attachment_ids", pendingAttachments.map((attachment) => attachment.id).join(","));
      setPendingAttachments([]);
    }
    navigate(`/dashboard/chat?${params.toString()}`);
  };

  const handleLockedModelSelect = (model: ApiLLMProviderInfo) => {
    toast({
      title: `${model.name} requires credentials`,
      description: "Add the API key in Credentials before selecting this model.",
    });
    navigate(`/dashboard/credentials?tab=credentials&provider=${encodeURIComponent(model.id)}&create=1`);
  };

  const handleAttachClick = () => {
    attachmentInputRef.current?.click();
  };

  const handleAttachmentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedFiles.length) {
      return;
    }

    try {
      setUploadingAttachments(true);
      const response = await api.uploadChatAttachments(selectedFiles);
      setPendingAttachments((current) => current.concat(response.attachments));
    } catch (error) {
      toast({
        title: "Attachment upload failed",
        description: error instanceof Error ? error.message : "Could not upload those files.",
      });
    } finally {
      setUploadingAttachments(false);
    }
  };

  const handleRemovePendingAttachment = (attachmentId: string) => {
    setPendingAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  };

  return (
    <div className="p-8 w-full max-w-full animate-fade-in pb-32">
      {/* Header */}
      <div className="mb-10 w-full">
        <div className="flex justify-between items-end w-full mb-6">
          <div>
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            </h3>
            <h1 className="text-[42px] font-[800] text-slate-900 tracking-tight leading-none mb-2">Dashboard</h1>
            <h2 className="text-[32px] font-[800] tracking-tight bg-clip-text text-transparent bg-gradient-text leading-[1.1] inline-block mb-2">
              How can I help you automate today?
            </h2>
          </div>

          {/* LLM Engine Ribbon — real data */}
          <div className="flex gap-4 items-center">
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Engine</span>
                <span className="text-[14px] font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${sysStatus?.worker.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {sysStatus?.llm.default_provider || "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Workers</span>
                <span className="text-[14px] font-extrabold text-slate-800 mt-0.5">
                  {sysStatus?.worker.active ? sysStatus.worker.mode : "Off"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI prompt + create blank */}
        <div className="w-full max-w-4xl">
          <AssistantComposer
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleAskAI}
            submitting={chatRouting}
            attaching={uploadingAttachments}
            placeholder="What do you want to automate? e.g. Sync new Stripe payments to Airtable"
            models={models}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            onLockedModelSelect={handleLockedModelSelect}
            onAttachClick={handleAttachClick}
            attachments={pendingAttachments}
            onRemoveAttachment={handleRemovePendingAttachment}
          />
          <input
            ref={attachmentInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => void handleAttachmentSelection(event)}
          />
          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#103b71] px-5 h-10 text-[13px] font-bold text-white transition-colors hover:bg-[#0c2a52] disabled:opacity-50"
            >
              <Sparkles size={16} className="fill-white/20 text-white" /> Generate
            </button>
            <span className="px-2 text-[12px] font-bold uppercase tracking-wider text-slate-400">OR</span>
            <button
              className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-[14px] font-bold text-slate-700 transition-colors hover:bg-slate-50 shrink-0"
              onClick={() => navigate("/studio/new")}
            >
              <Plus size={18} /> Create a blank workflow
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-3" />
          <span className="text-[14px] font-medium">Loading dashboard...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <Layers size={16} className="text-[#103b71]" />
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Workflows</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[28px] font-extrabold text-slate-900">{sysStatus?.workflows.total ?? 0}</span>
                <span className="text-[12px] font-bold text-emerald-600">{sysStatus?.workflows.active ?? 0} active</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <Zap size={16} className="text-amber-500" />
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Executions</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[28px] font-extrabold text-slate-900">{sysStatus?.executions.total ?? 0}</span>
                <span className="text-[12px] font-bold text-amber-600">{sysStatus?.executions.running ?? 0} running</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <TrendingUp size={16} className="text-emerald-500" />
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[28px] font-extrabold text-slate-900">{successRate}%</span>
                <span className="text-[12px] font-bold text-red-500">{sysStatus?.executions.failed ?? 0} failed</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <Cpu size={16} className="text-[#8A78F3]" />
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Job Queue</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[28px] font-extrabold text-slate-900">{(sysStatus?.jobs.pending ?? 0) + (sysStatus?.jobs.processing ?? 0)}</span>
                <span className="text-[12px] font-bold text-slate-500">{sysStatus?.jobs.failed ?? 0} failed</span>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-[1fr_minmax(300px,380px)_minmax(300px,380px)] gap-4 w-full">
            {/* Column 1: Recent Executions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Activity size={18} className="text-[#8A78F3]" strokeWidth={2.5} />
                  <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Recent Executions</h3>
                </div>
                <button
                  onClick={() => navigate("/dashboard/executions")}
                  className="text-[12px] font-bold text-[#8A78F3] hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-[3fr_1fr_1fr] gap-4 px-2 pb-3 border-b border-slate-200/60 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Workflow</span>
                <span>Status</span>
                <span className="text-right">Duration</span>
              </div>

              <div className="flex-1">
                {recentExecutions.length === 0 && (
                  <div className="py-8 text-center text-[13px] text-slate-400">No executions yet</div>
                )}
                {recentExecutions.map((ex, i) => {
                  const Icon = statusIcon[ex.status] || Zap;
                  return (
                    <div
                      key={ex.id}
                      onClick={() => navigate(`/dashboard/executions/${ex.id}`)}
                      className={`grid grid-cols-[3fr_1fr_1fr] items-center gap-4 py-3.5 px-2 hover:bg-slate-50/50 transition-colors cursor-pointer ${i < recentExecutions.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon size={14} className={statusColor[ex.status]} />
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-bold text-slate-900 truncate">{ex.workflow_name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{formatRelative(ex.started_at)}</p>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${statusBadge[ex.status] || "bg-slate-100 text-slate-600"}`}>
                          {ex.status}
                        </span>
                      </div>
                      <div className="text-right text-[13px] font-bold text-slate-700">{formatDuration(ex.duration_ms)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Active Workflows + Execution Trend */}
            <div className="flex flex-col gap-4 w-full">
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    <GitBranch size={18} className="text-[#8A78F3]" /> Active Workflows
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div
                    onClick={() => navigate("/studio/new")}
                    className="flex items-center justify-center h-14 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group"
                  >
                    <Plus size={18} className="text-slate-400 group-hover:text-slate-600 mr-2" strokeWidth={2.5} />
                    <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-800">Create workflow</span>
                  </div>
                  {activeWorkflows.map((wf) => (
                    <div
                      key={wf.id}
                      onClick={() => navigate(`/studio/${wf.id}`)}
                      className="flex flex-col justify-center rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                          <h4 className="text-[14px] font-bold text-slate-900 tracking-tight leading-tight truncate">{wf.name}</h4>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">{wf.success_rate}%</span>
                      </div>
                    </div>
                  ))}
                  {activeWorkflows.length === 0 && (
                    <div className="py-4 text-center text-[13px] text-slate-400">No active workflows</div>
                  )}
                </div>
              </div>

              {/* Execution Trend Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 flex flex-col">
                <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 tracking-tight mb-4">
                  <Clock size={18} className="text-[#8A78F3]" /> 7-Day Trend
                </h3>
                <div className="flex-1 min-h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                        labelStyle={{ fontWeight: 700 }}
                      />
                      <Area type="monotone" dataKey="success" stackId="1" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                      <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
                      <Area type="monotone" dataKey="other" stackId="1" stroke="#94a3b8" fill="#f1f5f9" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Column 3: System Health + Status Breakdown */}
            <div className="flex flex-col gap-4 w-full">
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
                <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 tracking-tight mb-5">
                  <Cpu size={18} className="text-emerald-500" /> System Health
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] font-bold text-slate-800">Success Rate</span>
                      <span className="text-[13px] font-extrabold text-emerald-600">{successRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${successRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] font-bold text-slate-800">Job Queue</span>
                      <span className="text-[13px] font-extrabold text-[#8A78F3]">{sysStatus?.jobs.pending ?? 0} pending</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8A78F3] rounded-full transition-all"
                        style={{ width: `${sysStatus && sysStatus.jobs.total > 0 ? Math.round(((sysStatus.jobs.completed) / sysStatus.jobs.total) * 100) : 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Scheduler</div>
                      <div className={`text-[13px] font-extrabold ${sysStatus?.scheduler.active ? "text-emerald-600" : "text-slate-400"}`}>
                        {sysStatus?.scheduler.active ? "Active" : "Off"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Worker</div>
                      <div className={`text-[13px] font-extrabold ${sysStatus?.worker.active ? "text-emerald-600" : "text-slate-400"}`}>
                        {sysStatus?.worker.active ? "Active" : "Off"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Breakdown Bar Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 flex flex-col">
                <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 tracking-tight mb-4">
                  <AlertTriangle size={18} className="text-amber-500" /> Execution Breakdown
                </h3>
                {breakdownData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-[13px] text-slate-400">No execution data</div>
                ) : (
                  <div className="flex-1 min-h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breakdownData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {breakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
