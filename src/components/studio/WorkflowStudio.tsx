import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TopBar from "./TopBar";
import NodesPanel from "./NodesPanel";
import WorkflowCanvas from "./WorkflowCanvasLive";
import NodeDetailsPanel from "./NodeDetailsPanelLive";
import ChatPanel from "./ChatPanel";
import StudioRouteLoader from "./StudioRouteLoader";
import { api, type ApiExecution, type ApiWorkflowDetail, type ApiWorkflowEdge, type ApiWorkflowStep } from "@/lib/api";

const buildFallbackEdges = (steps: ApiWorkflowStep[]): ApiWorkflowEdge[] =>
  steps.slice(0, -1).map((step, index) => ({
    id: `edge-${step.id}-${steps[index + 1].id}`,
    source: step.id,
    target: steps[index + 1].id,
    label: null,
  }));

const normalizeWorkflow = (workflow: ApiWorkflowDetail): ApiWorkflowDetail => ({
  ...workflow,
  definition: {
    ...workflow.definition,
    edges: workflow.definition.edges?.length ? workflow.definition.edges : buildFallbackEdges(workflow.definition.steps),
  },
});

interface StudioSnapshot {
  workflow: ApiWorkflowDetail;
  selectedNode: string | null;
}

const updateConnectionTargets = (
  edges: ApiWorkflowEdge[],
  stepId: string,
  targets: { defaultTarget?: string; trueTarget?: string; falseTarget?: string },
): ApiWorkflowEdge[] => {
  const nextEdges: ApiWorkflowEdge[] = [];
  if (targets.defaultTarget) {
    nextEdges.push({ id: `edge-${stepId}-default-${targets.defaultTarget}`, source: stepId, target: targets.defaultTarget, label: null });
  }
  if (targets.trueTarget) {
    nextEdges.push({ id: `edge-${stepId}-true-${targets.trueTarget}`, source: stepId, target: targets.trueTarget, label: "true" });
  }
  if (targets.falseTarget) {
    nextEdges.push({ id: `edge-${stepId}-false-${targets.falseTarget}`, source: stepId, target: targets.falseTarget, label: "false" });
  }

  return [...edges.filter((edge) => edge.source !== stepId), ...nextEdges];
};

const WorkflowStudio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"editor" | "executions">("editor");
  const [nodesOpen, setNodesOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("nodes");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [workflow, setWorkflow] = useState<ApiWorkflowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<"run" | "publish" | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastExecution, setLastExecution] = useState<ApiExecution | null>(null);
  const [undoStack, setUndoStack] = useState<StudioSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<StudioSnapshot[]>([]);

  useEffect(() => {
    let ignore = false;

    const loadWorkflow = async () => {
      if (!id) {
        setLoadError("Workflow id is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);
        setNoticeError(null);
        const detail = normalizeWorkflow(await api.getWorkflow(id));
        if (ignore) return;
        setWorkflow(detail);
        setSelectedNode(detail.definition.steps[0]?.id ?? null);
        setNotice(null);
        setLastExecution(null);
        setUndoStack([]);
        setRedoStack([]);
      } catch (loadError) {
        if (ignore) return;
        setLoadError(loadError instanceof Error ? loadError.message : "Failed to load workflow.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void loadWorkflow();

    return () => {
      ignore = true;
    };
  }, [id]);

  const selectedStep = useMemo(
    () => workflow?.definition.steps.find((step) => step.id === selectedNode) ?? null,
    [selectedNode, workflow],
  );
  const selectedStepIndex = useMemo(
    () => workflow?.definition.steps.findIndex((step) => step.id === selectedNode) ?? -1,
    [selectedNode, workflow],
  );

  const handleSaveStep = async (updatedStep: ApiWorkflowStep) => {
    if (!id || !workflow) return;

    const nextDefinition = {
      steps: workflow.definition.steps.map((step) => (step.id === updatedStep.id ? updatedStep : step)),
      edges: workflow.definition.edges,
    };

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      const updatedWorkflow = await api.updateWorkflow(id, {
        name: workflow.name,
        trigger_type: workflow.trigger_type,
        category: workflow.category,
        status: workflow.status,
        definition: nextDefinition,
      });
      setWorkflow(normalizeWorkflow(updatedWorkflow));
      setNotice(`Saved changes to ${updatedStep.name}.`);
    } catch (saveError) {
      setNoticeError(saveError instanceof Error ? saveError.message : "Failed to save workflow.");
    } finally {
      setSaving(false);
    }
  };

  const persistWorkflow = async (nextWorkflow: ApiWorkflowDetail, successMessage?: string) => {
    if (!id) return null;

    const updatedWorkflow = await api.updateWorkflow(id, {
      name: nextWorkflow.name,
      trigger_type: nextWorkflow.trigger_type,
      category: nextWorkflow.category,
      status: nextWorkflow.status,
      definition: nextWorkflow.definition,
    });
    setWorkflow(normalizeWorkflow(updatedWorkflow));
    setNoticeError(null);
    if (successMessage) setNotice(successMessage);
    return updatedWorkflow;
  };

  const createSnapshot = (): StudioSnapshot | null =>
    workflow
      ? {
          workflow,
          selectedNode,
        }
      : null;

  const pushUndoSnapshot = () => {
    const snapshot = createSnapshot();
    if (!snapshot) return;
    setUndoStack((current) => [...current.slice(-29), snapshot]);
    setRedoStack([]);
  };

  const applySnapshot = async (snapshot: StudioSnapshot, message: string) => {
    setSaving(true);
    setNoticeError(null);
    try {
      await persistWorkflow(snapshot.workflow, message);
      setSelectedNode(snapshot.selectedNode);
      setLastExecution(null);
    } catch (snapshotError) {
      setNoticeError(snapshotError instanceof Error ? snapshotError.message : "Failed to restore workflow state.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = async (stepTemplate: {
    type: "trigger" | "transform" | "condition" | "llm" | "output" | "delay" | "human" | "callback";
    name: string;
    config: Record<string, unknown>;
  }) => {
    if (!workflow) return;

    const anchorStep =
      workflow.definition.steps.find((step) => step.id === selectedNode) ??
      workflow.definition.steps[workflow.definition.steps.length - 1] ??
      null;
    const anchorPosition =
      anchorStep && typeof anchorStep.config?.ui_position === "object" && anchorStep.config?.ui_position !== null
        ? (anchorStep.config.ui_position as { x?: number; y?: number })
        : null;
    const nextPosition = {
      x: Math.min((anchorPosition?.x ?? 96) + 320, 860),
      y: anchorStep?.type === "condition" ? Math.min((anchorPosition?.y ?? 120) + 190, 620) : anchorPosition?.y ?? 120,
    };

    const newStep: ApiWorkflowStep = {
      id: `step-${Date.now()}`,
      type: stepTemplate.type,
      name: stepTemplate.name,
      config: {
        ...stepTemplate.config,
        ui_position: nextPosition,
      },
    };

    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      definition: {
        steps: [...workflow.definition.steps, newStep],
        edges:
          workflow.definition.steps.length === 0
            ? workflow.definition.edges
            : [
                ...workflow.definition.edges,
                {
                  id: `edge-${selectedNode ?? workflow.definition.steps.at(-1)?.id}-${newStep.id}`,
                  source: selectedNode ?? workflow.definition.steps.at(-1)?.id ?? newStep.id,
                  target: newStep.id,
                  label:
                    workflow.definition.steps.find((step) => step.id === (selectedNode ?? workflow.definition.steps.at(-1)?.id))?.type === "condition"
                      ? workflow.definition.edges.some((edge) => edge.source === (selectedNode ?? workflow.definition.steps.at(-1)?.id) && (edge.label ?? "").toLowerCase() === "true")
                        ? "false"
                        : "true"
                      : null,
                },
              ],
      },
    };

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      await persistWorkflow(nextWorkflow, `${stepTemplate.name} added to the workflow.`);
      setSelectedNode(newStep.id);
    } catch (saveError) {
      setNoticeError(saveError instanceof Error ? saveError.message : "Failed to add step.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!workflow) return;

    try {
      pushUndoSnapshot();
      setActionLoading("publish");
      setNoticeError(null);
      await persistWorkflow({ ...workflow, status: "active" }, "Workflow published.");
    } catch (publishError) {
      setNoticeError(publishError instanceof Error ? publishError.message : "Failed to publish workflow.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRun = async () => {
    if (!id || !workflow) return;

    try {
      setActionLoading("run");
      setNoticeError(null);
      const execution = await api.runWorkflow(id, {});
      setLastExecution(execution);
      setNotice(`Test run finished with ${execution.status}.`);
    } catch (runError) {
      setNoticeError(runError instanceof Error ? runError.message : "Failed to run workflow.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicateStep = async (step: ApiWorkflowStep) => {
    if (!workflow) return;

    const duplicateStep: ApiWorkflowStep = {
      ...step,
      id: `step-${Date.now()}`,
      name: `${step.name} Copy`,
      config: { ...step.config },
    };

    const currentIndex = workflow.definition.steps.findIndex((item) => item.id === step.id);
    const nextSteps = [...workflow.definition.steps];
    nextSteps.splice(currentIndex + 1, 0, duplicateStep);

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      const originalOutgoing = workflow.definition.edges.filter((edge) => edge.source === step.id);
      const preservedEdges = workflow.definition.edges.filter((edge) => edge.source !== step.id);
      const nextEdges = [
        ...preservedEdges,
        { id: `edge-${step.id}-${duplicateStep.id}`, source: step.id, target: duplicateStep.id, label: null },
        ...originalOutgoing.map((edge) => ({
          ...edge,
          id: `${edge.id}-copy`,
          source: duplicateStep.id,
        })),
      ];

      await persistWorkflow(
        { ...workflow, definition: { steps: nextSteps, edges: nextEdges } },
        `${step.name} duplicated.`,
      );
      setSelectedNode(duplicateStep.id);
    } catch (duplicateError) {
      setNoticeError(duplicateError instanceof Error ? duplicateError.message : "Failed to duplicate step.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!workflow) return;

    const nextSteps = workflow.definition.steps.filter((step) => step.id !== stepId);

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      const incoming = workflow.definition.edges.filter((edge) => edge.target === stepId);
      const outgoing = workflow.definition.edges.filter((edge) => edge.source === stepId);
      const fallbackTarget = outgoing[0]?.target;
      const rewiredEdges = workflow.definition.edges
        .filter((edge) => edge.source !== stepId && edge.target !== stepId)
        .concat(
          fallbackTarget
            ? incoming
                .filter((edge) => edge.source !== stepId)
                .map((edge) => ({
                  id: `edge-${edge.source}-${fallbackTarget}-${edge.label ?? "default"}`,
                  source: edge.source,
                  target: fallbackTarget,
                  label: edge.label ?? null,
                }))
            : [],
        );

      await persistWorkflow(
        { ...workflow, definition: { steps: nextSteps, edges: rewiredEdges } },
        "Step removed from the workflow.",
      );
      setSelectedNode(nextSteps[0]?.id ?? null);
    } catch (deleteError) {
      setNoticeError(deleteError instanceof Error ? deleteError.message : "Failed to delete step.");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStep = async (stepId: string, direction: "up" | "down") => {
    if (!workflow) return;

    const index = workflow.definition.steps.findIndex((step) => step.id === stepId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= workflow.definition.steps.length) return;

    const nextSteps = [...workflow.definition.steps];
    const [moved] = nextSteps.splice(index, 1);
    nextSteps.splice(targetIndex, 0, moved);

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      await persistWorkflow(
        { ...workflow, definition: { steps: nextSteps, edges: workflow.definition.edges } },
        `${moved.name} moved ${direction}.`,
      );
      setSelectedNode(moved.id);
    } catch (moveError) {
      setNoticeError(moveError instanceof Error ? moveError.message : "Failed to reorder step.");
    } finally {
      setSaving(false);
    }
  };

  const handlePositionChange = async (stepId: string, position: { x: number; y: number }) => {
    if (!workflow) return;

    const nextSteps = workflow.definition.steps.map((step) =>
      step.id === stepId
        ? {
            ...step,
            config: {
              ...step.config,
              ui_position: position,
            },
          }
        : step,
    );

    try {
      pushUndoSnapshot();
      setNoticeError(null);
      await persistWorkflow({ ...workflow, definition: { steps: nextSteps, edges: workflow.definition.edges } });
    } catch (positionError) {
      setNoticeError(positionError instanceof Error ? positionError.message : "Failed to save node position.");
    }
  };

  const handleConnectionsChange = async (
    stepId: string,
    targets: { defaultTarget?: string; trueTarget?: string; falseTarget?: string },
  ) => {
    if (!workflow) return;

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      await persistWorkflow(
        {
          ...workflow,
          definition: {
            steps: workflow.definition.steps,
            edges: updateConnectionTargets(workflow.definition.edges, stepId, targets),
          },
        },
        "Connections updated.",
      );
    } catch (connectionError) {
      setNoticeError(connectionError instanceof Error ? connectionError.message : "Failed to update connections.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateConnection = async (
    sourceId: string,
    targetId: string,
    label: "default" | "true" | "false",
  ) => {
    const sourceStep = workflow?.definition.steps.find((step) => step.id === sourceId);
    if (!sourceStep) return;

    await handleConnectionsChange(sourceId, {
      defaultTarget: label === "default"
        ? targetId
        : workflow?.definition.edges.find((edge) => edge.source === sourceId && !edge.label)?.target,
      trueTarget: label === "true"
        ? targetId
        : workflow?.definition.edges.find((edge) => edge.source === sourceId && (edge.label ?? "").toLowerCase() === "true")?.target,
      falseTarget: label === "false"
        ? targetId
        : workflow?.definition.edges.find((edge) => edge.source === sourceId && (edge.label ?? "").toLowerCase() === "false")?.target,
    });
  };

  const handleUndo = async () => {
    const previous = undoStack[undoStack.length - 1];
    const current = createSnapshot();
    if (!previous || !current) return;

    setUndoStack((items) => items.slice(0, -1));
    setRedoStack((items) => [...items, current]);
    await applySnapshot(previous, "Undid last change.");
  };

  const handleRedo = async () => {
    const next = redoStack[redoStack.length - 1];
    const current = createSnapshot();
    if (!next || !current) return;

    setRedoStack((items) => items.slice(0, -1));
    setUndoStack((items) => [...items, current]);
    await applySnapshot(next, "Restored change.");
  };

  if (loading) {
    return <StudioRouteLoader />;
  }

  return (
    <div className="h-screen w-screen bg-[#dbe5ff]">
      <div className="h-full w-full bg-white overflow-hidden">
        <div className="h-full flex flex-col">
          <TopBar activeTab={activeTab} onTabChange={setActiveTab} onOpenChat={() => setChatOpen(true)} />

          <div className="flex-1 flex min-h-0 bg-[#f8faff]">
            <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

            <NodesPanel
              open={nodesOpen && !chatOpen}
              onToggle={() => setNodesOpen((open) => !open)}
              activeTool={activeTool}
              onToolChange={setActiveTool}
              onAddStep={handleAddStep}
            />

            <div className="flex-1 min-h-0 relative border-r border-slate-200">
              {loadError ? (
                <div className="h-full flex items-center justify-center bg-[#fcfdff] px-8 text-center">
                  <div>
                    <div className="text-[15px] font-semibold text-slate-900">Unable to open studio</div>
                    <div className="mt-2 text-[12px] leading-5 text-slate-500">{loadError}</div>
                  </div>
                </div>
              ) : (
                <>
                  {(notice || noticeError) && (
                    <div className="absolute left-4 top-4 z-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600">
                      {noticeError ?? notice}
                    </div>
                  )}
                  <WorkflowCanvas
                    steps={workflow?.definition.steps ?? []}
                    edges={workflow?.definition.edges ?? []}
                    selectedNodeId={selectedNode}
                    onNodeSelect={setSelectedNode}
                    onRun={handleRun}
                    onPublish={handlePublish}
                    onDuplicate={handleDuplicateStep}
                    onDelete={handleDeleteStep}
                    onMove={handleMoveStep}
                    onCreateConnection={handleCreateConnection}
                    onPositionChange={handlePositionChange}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={undoStack.length > 0}
                    canRedo={redoStack.length > 0}
                    executionSteps={lastExecution?.steps ?? null}
                    actionLoading={actionLoading}
                  />
                </>
              )}
            </div>

            <NodeDetailsPanel
              workflowName={workflow?.name ?? "Workflow"}
              step={selectedStep}
              steps={workflow?.definition.steps ?? []}
              edges={workflow?.definition.edges ?? []}
              saving={saving}
              onSave={handleSaveStep}
              onConnectionsChange={handleConnectionsChange}
              onDuplicate={handleDuplicateStep}
              onDelete={handleDeleteStep}
              onMove={handleMoveStep}
              canMoveUp={selectedStepIndex > 0}
              canMoveDown={selectedStepIndex >= 0 && selectedStepIndex < (workflow?.definition.steps.length ?? 0) - 1}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStudio;
