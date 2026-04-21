import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioTabBar } from "@/components/studio/StudioTabBar";
import { StudioLeftRail, type LeftRailContext } from "@/components/studio/StudioLeftRail";
import { StudioInsertPane } from "@/components/studio/StudioInsertPane";
import { StudioCanvas } from "@/components/studio/StudioCanvas";
import type { CanvasNodeData } from "@/components/studio/canvasTypes";
import { StudioInspector } from "@/components/studio/StudioInspector";
import { StudioRuntimeBar } from "@/components/studio/StudioRuntimeBar";
import { StudioRuntimeDrawer } from "@/components/studio/StudioRuntimeDrawer";
import { StudioCopilotPanel, StudioCopilotButton } from "@/components/studio/StudioCopilotPanel";
import { WorkflowSettingsPanel } from "@/components/studio/WorkflowSettingsPanel";
import { EvaluationPanel } from "@/components/studio/EvaluationPanel";
import { CanvasStoreProvider, useCanvasStore } from "@/components/studio/useCanvasStore";
import { useUpdateWorkflow, useStudioBundle, useWorkflowExecutions, useRetryExecution, useDeleteExecution } from "@/hooks/useApi";
import type { ExecutionSummary } from "@/lib/api";
import {
  CheckCircle2, XCircle, Clock, Loader2, RotateCcw, Trash2, ChevronRight,
  AlertTriangle, Ban, PlayCircle, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StudioLayoutInner() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const canvasStore = useCanvasStore();

  // Declare these first so the effects below can reference them
  const updateMutation = useUpdateWorkflow(workflowId ?? "");
  const { data: bundle } = useStudioBundle(workflowId);
  const [saveState, setSaveState] = useState<"clean" | "dirty" | "saving" | "saved" | "error">("clean");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHistoryRef = useRef(0);

  // Load workflow definition into canvas when bundle arrives
  useEffect(() => {
    if (bundle?.workflow) {
      canvasStore.loadWorkflow(bundle.workflow);
      // Auto fit-view after load (small delay to let React render first)
      setTimeout(() => canvasStore.requestFitView(), 150);
    }
  }, [bundle?.workflow?.id]);

  // Track dirty state from canvas store
  useEffect(() => {
    if (canvasStore.isDirty && canvasStore.historyIndex !== lastHistoryRef.current) {
      setSaveState("dirty");
      // Debounce auto-save: 2 seconds after last change
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        if (!workflowId || !bundle?.workflow) return;
        const def = canvasStore.toDefinition();
        setSaveState("saving");
        updateMutation.mutate({
          name: bundle.workflow.name,
          trigger_type: bundle.workflow.trigger_type,
          status: bundle.workflow.status,
          definition: def,
        }, {
          onSuccess: () => {
            setSaveState("saved");
            canvasStore.markClean();
            lastHistoryRef.current = canvasStore.historyIndex;
            setTimeout(() => setSaveState(prev => prev === "saved" ? "clean" : prev), 2000);
          },
          onError: () => setSaveState("error"),
        });
      }, 2000);
    }
  }, [canvasStore.historyIndex, canvasStore.isDirty]);

  const handleManualSave = useCallback(() => {
    if (!workflowId || !bundle?.workflow) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const def = canvasStore.toDefinition();
    setSaveState("saving");
    updateMutation.mutate({
      name: bundle.workflow.name,
      trigger_type: bundle.workflow.trigger_type,
      status: bundle.workflow.status,
      definition: def,
    }, {
      onSuccess: () => {
        setSaveState("saved");
        canvasStore.markClean();
        lastHistoryRef.current = canvasStore.historyIndex;
        setTimeout(() => setSaveState(prev => prev === "saved" ? "clean" : prev), 2000);
      },
      onError: () => setSaveState("error"),
    });
  }, [workflowId, bundle, canvasStore, updateMutation]);

  const [activeTab, setActiveTab] = useState("Workflow");
  const [leftPaneOpen, setLeftPaneOpen] = useState(true);
  const [leftPaneContext, setLeftPaneContext] = useState<LeftRailContext>("nodes");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [runtimeDrawerOpen, setRuntimeDrawerOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [lastExecution, setLastExecution] = useState<ExecutionSummary | null>(null);
  const [inspectorRenameMode, setInspectorRenameMode] = useState(false);

  // When execution finishes, map step statuses to canvas exec states
  const handleExecutionComplete = useCallback((exec: ExecutionSummary) => {
    setLastExecution(exec);
    setRuntimeDrawerOpen(true);
    const newStates: Record<string, "idle" | "running" | "success" | "error" | "disabled"> = {};
    const newOutputs: Record<string, unknown> = {};
    for (const step of exec.steps) {
      if (step.step_id) {
        const s = step.status;
        newStates[step.step_id] = s === "success" ? "success" : s === "failed" ? "error" : s === "running" ? "running" : s === "skipped" ? "disabled" : "idle";
        if (step.output !== undefined) newOutputs[step.step_id] = step.output;
      }
    }
    canvasStore.setExecStates(prev => ({ ...prev, ...newStates }));
    canvasStore.setExecOutputs(prev => ({ ...prev, ...newOutputs }));
  }, [canvasStore]);

  const handleExecutionStart = useCallback(() => {
    // Set all nodes to running state when execution begins
    const runningStates: Record<string, "idle" | "running" | "success" | "error" | "disabled"> = {};
    canvasStore.nodes.forEach(n => { runningStates[n.id] = "running"; });
    canvasStore.setExecStates(runningStates);
    setRuntimeDrawerOpen(true);
  }, [canvasStore]);

  // Ctrl+S to save
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleManualSave]);

  const handleAskAI = useCallback((context: string) => {
    setCopilotPrompt(context);
    setCopilotOpen(true);
    setInspectorOpen(false);
    setSelectedNodeId(null);
  }, []);

  const selectedNode: CanvasNodeData | null =
    canvasStore.nodes.find((n) => n.id === selectedNodeId) ?? null;

  function handleTogglePane(ctx: LeftRailContext) {
    if (leftPaneOpen && leftPaneContext === ctx) {
      setLeftPaneOpen(false);
    } else {
      setLeftPaneContext(ctx);
      setLeftPaneOpen(true);
    }
  }

  const handleNodeSelect = useCallback((id: string) => {
    setSelectedNodeId(id);
    setInspectorOpen(true);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
    setInspectorOpen(false);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      {/* Header — 48px */}
      <StudioHeader onBack={() => navigate("/workflows")} workflowId={workflowId} workflowName={bundle?.workflow?.name} saveState={saveState} onSave={handleManualSave} />

      {/* Tab bar — 36px */}
      <StudioTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Middle section — fills remaining space */}
      <div className="flex flex-1 min-h-0">
        {activeTab === "Workflow" && (
          <>
            {/* Left rail — 56px */}
            <StudioLeftRail
              activeContext={leftPaneContext}
              onContextChange={setLeftPaneContext}
              paneOpen={leftPaneOpen}
              onTogglePane={handleTogglePane}
            />

            {/* Insert pane — 280px, collapsible */}
            {leftPaneOpen && (
              <StudioInsertPane
                context={leftPaneContext}
                onClose={() => setLeftPaneOpen(false)}
              />
            )}

            {/* Canvas — flex-1 */}
            <StudioCanvas
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
              onCanvasClick={handleCanvasClick}
              onRenameNode={(id) => { setSelectedNodeId(id); setInspectorOpen(true); setInspectorRenameMode(true); }}
              workflowId={workflowId}
            />

            {/* Inspector — 540px, collapsible */}
            {inspectorOpen && selectedNode && (
              <StudioInspector
                node={selectedNode}
                onClose={() => { setInspectorOpen(false); setSelectedNodeId(null); setInspectorRenameMode(false); }}
                workflowId={workflowId}
                startRenameMode={inspectorRenameMode}
                onRenameModeConsumed={() => setInspectorRenameMode(false)}
              />
            )}

            {/* AI Copilot panel — 380px, collapsible */}
            {copilotOpen && !inspectorOpen && (
              <StudioCopilotPanel onClose={() => { setCopilotOpen(false); setCopilotPrompt(""); }} initialPrompt={copilotPrompt} />
            )}
          </>
        )}

        {activeTab === "Executions" && (
          <StudioExecutionsTab
            workflowId={workflowId}
            onViewExecution={(exec) => { setLastExecution(exec); setRuntimeDrawerOpen(true); setActiveTab("Editor"); }}
          />
        )}

        {activeTab === "Evaluation" && (
          <div className="flex-1 overflow-auto">
            <EvaluationPanel />
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="flex-1 overflow-auto">
            <WorkflowSettingsPanel workflowId={workflowId} />
          </div>
        )}
      </div>

      {/* Floating AI assistant button — visible when copilot & inspector are closed */}
      <StudioCopilotButton
        onClick={() => { setCopilotOpen(true); setInspectorOpen(false); setSelectedNodeId(null); }}
        visible={!copilotOpen && !inspectorOpen}
      />

      {/* Runtime drawer — 240px, shown above bar when open */}
      {runtimeDrawerOpen && <StudioRuntimeDrawer onAskAI={handleAskAI} executionData={lastExecution} />}

      {/* Runtime bar — 44px */}
      <StudioRuntimeBar
        drawerOpen={runtimeDrawerOpen}
        onToggleDrawer={() => setRuntimeDrawerOpen((o) => !o)}
        workflowId={workflowId}
        onExecutionStart={handleExecutionStart}
        onExecutionComplete={handleExecutionComplete}
      />
    </div>
  );
}

/* ── Executions Tab ── */

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  success:   { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Success" },
  failed:    { icon: XCircle,      color: "text-red-500",   bg: "bg-red-50",   label: "Failed" },
  running:   { icon: Loader2,      color: "text-blue-500",  bg: "bg-blue-50",  label: "Running" },
  paused:    { icon: Clock,        color: "text-amber-500", bg: "bg-amber-50", label: "Paused" },
  cancelled: { icon: Ban,          color: "text-zinc-400",  bg: "bg-zinc-50",  label: "Cancelled" },
};

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function StudioExecutionsTab({ workflowId, onViewExecution }: {
  workflowId: string | undefined;
  onViewExecution: (exec: ExecutionSummary) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const { data: executions, isLoading, error, refetch } = useWorkflowExecutions(workflowId, { limit: 50 });
  const retryMutation = useRetryExecution();
  const deleteMutation = useDeleteExecution();

  const filtered = (executions ?? []).filter(e => filter === "all" || e.status === filter);

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-[860px] py-6 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-900">Executions</h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              {executions ? `${executions.length} execution${executions.length !== 1 ? "s" : ""}` : "Loading…"}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Status filters */}
        <div className="flex gap-1.5 mb-4">
          {["all", "success", "failed", "running"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors capitalize",
                filter === s ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {s === "all" ? `All (${executions?.length ?? 0})` : `${s} (${(executions ?? []).filter(e => e.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-zinc-400" />
            <span className="ml-2 text-[12px] text-zinc-400">Loading executions…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <AlertTriangle size={20} className="mx-auto text-red-400 mb-2" />
            <p className="text-[12px] text-red-600">Failed to load executions</p>
            <button onClick={() => refetch()} className="mt-2 text-[11px] text-red-500 underline">Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
            <PlayCircle size={28} className="mx-auto text-zinc-300 mb-3" />
            <p className="text-[13px] text-zinc-400">
              {filter === "all" ? "No executions yet — run the workflow to see results here." : `No ${filter} executions.`}
            </p>
          </div>
        )}

        {/* Execution rows */}
        {filtered.length > 0 && (
          <div className="space-y-1.5">
            {filtered.map(exec => {
              const cfg = statusConfig[exec.status] ?? statusConfig.cancelled;
              const Icon = cfg.icon;
              return (
                <div
                  key={exec.id}
                  onClick={() => onViewExecution(exec)}
                  className="group flex items-center gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3 cursor-pointer hover:border-zinc-300 hover:shadow-sm transition-all"
                >
                  {/* Status icon */}
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-full shrink-0", cfg.bg)}>
                    <Icon size={14} className={cn(cfg.color, exec.status === "running" && "animate-spin")} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono text-zinc-500 truncate">{exec.id.slice(0, 12)}</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", cfg.bg, cfg.color)}>{cfg.label}</span>
                      {exec.environment !== "draft" && (
                        <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600">{exec.environment}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-400">
                      <span>{exec.trigger_type}</span>
                      <span>•</span>
                      <span>{exec.steps.length} step{exec.steps.length !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span>{formatDuration(exec.duration_ms)}</span>
                      {exec.error_text && (
                        <>
                          <span>•</span>
                          <span className="text-red-400 truncate max-w-[200px]">{exec.error_text}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-[11px] text-zinc-400 shrink-0">{formatTimeAgo(exec.started_at)}</span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {exec.status === "failed" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); retryMutation.mutate(exec.id); }}
                        className="rounded p-1 hover:bg-zinc-100" title="Retry"
                      >
                        <RotateCcw size={13} className="text-zinc-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(exec.id); }}
                      className="rounded p-1 hover:bg-red-50" title="Delete"
                    >
                      <Trash2 size={13} className="text-zinc-400 hover:text-red-500" />
                    </button>
                    <ChevronRight size={14} className="text-zinc-300" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function StudioLayout() {
  return (
    <CanvasStoreProvider>
      <StudioLayoutInner />
    </CanvasStoreProvider>
  );
}
