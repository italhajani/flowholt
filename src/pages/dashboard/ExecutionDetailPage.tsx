import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  Copy,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronRight,
  Webhook,
  CalendarClock,
  MousePointerClick,
  Layers,
  Zap,
} from "lucide-react";
import { api, type ApiExecutionBundle } from "@/lib/api";
import { TableLoader } from "@/components/dashboard/DashboardRouteLoader";

const statusConfig: Record<string, { icon: React.ElementType; color: string; badge: string }> = {
  success: { icon: CheckCircle2, color: "text-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  failed: { icon: XCircle, color: "text-red-500", badge: "bg-red-50 text-red-600 border-red-100" },
  running: { icon: Play, color: "text-amber-500", badge: "bg-amber-50 text-amber-600 border-amber-100" },
  paused: { icon: Pause, color: "text-blue-500", badge: "bg-blue-50 text-blue-600 border-blue-100" },
  cancelled: { icon: AlertTriangle, color: "text-slate-400", badge: "bg-slate-50 text-slate-500 border-slate-200" },
};

const triggerIcons: Record<string, React.ElementType> = {
  webhook: Webhook,
  schedule: CalendarClock,
  manual: MousePointerClick,
  event: Zap,
};

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

const ExecutionDetailPage: React.FC = () => {
  const { executionId } = useParams<{ executionId: string }>();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState<ApiExecutionBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"steps" | "events" | "artifacts">("steps");
  const [replaying, setReplaying] = useState(false);
  const [replayError, setReplayError] = useState<string | null>(null);

  useEffect(() => {
    if (!executionId) return;
    let active = true;
    setLoading(true);
    api
      .getExecutionBundle(executionId)
      .then((data) => {
        if (!active) return;
        setBundle(data);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load execution details");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [executionId]);

  const copyId = () => {
    if (!executionId) return;
    navigator.clipboard.writeText(executionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) return <TableLoader titleWidth="220px" />;
  if (error || !bundle) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto">
        <button onClick={() => navigate("/dashboard/executions")} className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Executions
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
          {error || "Execution not found"}
        </div>
      </div>
    );
  }

  const exec = bundle.execution;
  const cfg = statusConfig[exec.status] || statusConfig.cancelled;
  const StatusIcon = cfg.icon;
  const TriggerIcon = triggerIcons[exec.trigger_type] || Webhook;

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in pb-24">
      {/* Back nav */}
      <button
        onClick={() => navigate("/dashboard/executions")}
        className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Executions
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">{exec.workflow_name}</h1>
            <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", cfg.badge)}>
              <StatusIcon size={10} strokeWidth={3} />
              {exec.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-slate-500">
            <button onClick={copyId} className="flex items-center gap-1.5 font-mono hover:text-slate-700 transition-colors">
              <Copy size={11} />
              {copied ? "Copied!" : exec.id}
            </button>
            <span className="w-px h-3 bg-slate-300" />
            <span className="flex items-center gap-1.5 capitalize">
              <TriggerIcon size={12} />
              {exec.trigger_type}
            </span>
          </div>
        </div>
        <button
          onClick={async () => {
            if (replaying) return;
            setReplaying(true);
            setReplayError(null);
            try {
              const replay = await api.replayExecution(exec.id, { mode: "same_version", queued: false });
              if (replay.execution?.id) {
                navigate(`/dashboard/executions/${replay.execution.id}`);
                return;
              }
              setReplayError("Replay was accepted but no execution details were returned.");
            } catch (err) {
              setReplayError(err instanceof Error ? err.message : "Replay failed.");
            } finally {
              setReplaying(false);
            }
          }}
          disabled={replaying}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={replaying ? "animate-spin" : ""} />
          {replaying ? "Replaying…" : "Replay"}
        </button>
      </div>

      {replayError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
          {replayError}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-slate-500">Duration</span>
            <Clock size={14} className="text-slate-400" />
          </div>
          <div className="text-[20px] font-bold text-slate-900">{formatDuration(exec.duration_ms)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-slate-500">Steps</span>
            <Layers size={14} className="text-slate-400" />
          </div>
          <div className="text-[20px] font-bold text-slate-900">{exec.steps.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-slate-500">Started</span>
            <Play size={14} className="text-slate-400" />
          </div>
          <div className="text-[14px] font-semibold text-slate-900">{formatTime(exec.started_at)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-slate-500">Finished</span>
            <CheckCircle2 size={14} className="text-slate-400" />
          </div>
          <div className="text-[14px] font-semibold text-slate-900">{formatTime(exec.finished_at)}</div>
        </div>
      </div>

      {/* Error banner */}
      {exec.error_text && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-[13px] font-semibold text-red-700">Error</span>
          </div>
          <p className="text-[12px] text-red-600 font-mono">{exec.error_text}</p>
        </div>
      )}

      {/* Pause banner */}
      {bundle.pause && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Pause size={14} className="text-blue-500" />
            <span className="text-[13px] font-semibold text-blue-700">
              Paused at: {bundle.pause.step_name}
            </span>
          </div>
          <p className="text-[12px] text-blue-600">
            Wait type: {bundle.pause.wait_type} • Status: {bundle.pause.status}
            {bundle.pause.resume_after && ` • Resumes: ${formatTime(bundle.pause.resume_after)}`}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {(["steps", "events", "artifacts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-md text-[12px] font-semibold transition-colors capitalize",
              activeTab === tab
                ? "bg-white text-slate-900 border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab} {tab === "events" && bundle.events.length > 0 && `(${bundle.events.length})`}
            {tab === "artifacts" && bundle.artifacts.length > 0 && `(${bundle.artifacts.length})`}
          </button>
        ))}
      </div>

      {/* Steps tab */}
      {activeTab === "steps" && (
        <div className="space-y-3">
          {exec.steps.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-[13px] text-slate-400">
              No steps recorded for this execution.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-200" />
              {exec.steps.map((step, idx) => {
                const stepCfg = statusConfig[step.status] || statusConfig.cancelled;
                const StepIcon = stepCfg.icon;
                const isOpen = expandedSteps.has(idx);
                return (
                  <div key={idx} className="relative pl-14 mb-3">
                    <div className={cn(
                      "absolute left-[22px] top-4 w-3 h-3 rounded-full border-2 border-white z-10",
                      step.status === "success" ? "bg-emerald-500 ring-2 ring-emerald-500/20" :
                      step.status === "failed" ? "bg-red-500 ring-2 ring-red-500/20" :
                      "bg-slate-300 ring-2 ring-slate-200"
                    )} />
                    <div
                      className={cn("rounded-xl border bg-white transition-colors cursor-pointer hover:border-slate-300", isOpen ? "border-slate-300" : "border-slate-200")}
                      onClick={() => toggleStep(idx)}
                    >
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button className={cn("p-0.5 rounded transition-transform duration-200 text-slate-400", isOpen && "rotate-90")}>
                            <ChevronRight size={14} />
                          </button>
                          <span className="text-[13px] font-semibold text-slate-900">{step.name}</span>
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", stepCfg.badge)}>
                            <StepIcon size={9} strokeWidth={3} />
                            {step.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{formatDuration(step.duration_ms)}</span>
                      </div>
                      {isOpen && step.output && (
                        <div className="px-4 pb-4 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400 font-medium block mt-3 mb-2">Output</span>
                          <pre className="text-[11px] text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200 overflow-x-auto max-h-60">
                            {JSON.stringify(step.output, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Events tab */}
      {activeTab === "events" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {bundle.events.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-slate-400">No events recorded.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bundle.events.map((ev) => {
                const isOpen = expandedEvents.has(ev.id);
                return (
                  <div key={ev.id}>
                    <div
                      className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleEvent(ev.id)}
                    >
                      <div className="flex items-center gap-3">
                        <button className={cn("text-slate-400 transition-transform", isOpen && "rotate-90")}>
                          <ChevronRight size={14} />
                        </button>
                        <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <FileText size={12} className="text-slate-500" />
                        </div>
                        <div>
                          <span className="text-[13px] font-semibold text-slate-900">{ev.event_type}</span>
                          {ev.step_name && <span className="text-[11px] text-slate-400 ml-2">• {ev.step_name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {ev.status && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border",
                            (statusConfig[ev.status] || statusConfig.cancelled).badge
                          )}>
                            {ev.status}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">{new Date(ev.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-5 pb-4 bg-slate-50/50 border-t border-slate-100">
                        {ev.message && <p className="text-[12px] text-slate-600 mt-2 mb-2">{ev.message}</p>}
                        {Object.keys(ev.data).length > 0 && (
                          <pre className="text-[11px] text-slate-700 bg-white rounded-lg p-3 border border-slate-200 overflow-x-auto max-h-40">
                            {JSON.stringify(ev.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Artifacts tab */}
      {activeTab === "artifacts" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {bundle.artifacts.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-slate-400">No artifacts recorded.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bundle.artifacts.map((art) => (
                <div key={art.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <FileText size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">{art.artifact_type}</div>
                      <div className="text-[11px] text-slate-400">
                        {art.direction} • {(art.size_bytes / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{new Date(art.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutionDetailPage;
