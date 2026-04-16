import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Activity, BookTemplate, PanelLeft, Play, Rows3, Settings, Sparkles, Workflow as WorkflowIcon } from "lucide-react";
import TopBar from "./TopBar";
import NodesPanel from "./NodesPanel";
import WorkflowCanvas from "./WorkflowCanvasLive";
import NodeDetailsPanel from "./NodeConfigPanel";
import ChatPanel from "./ChatPanel";
import StudioRouteLoader from "./StudioRouteLoader";
import StatusBar from "./StatusBar";
import WorkflowSettingsModal from "./WorkflowSettingsModal";
import StudioCommandBar, { type StudioCommandAction } from "./StudioCommandBar";
import { api, type ApiExecution, type ApiExecutionPauseSummary, type ApiExecutionStep, type ApiExecutionStepInspectorResponse, type ApiHumanTaskSummary, type ApiStudioStepTestResponse, type ApiWorkflowDetail, type ApiWorkflowEdge, type ApiWorkflowSettings, type ApiWorkflowStep, type ApiWorkflowStepHistoryResponse, type ApiWorkflowStepType } from "@/lib/api";

const buildFallbackEdges = (steps: ApiWorkflowStep[]): ApiWorkflowEdge[] =>
  steps.slice(0, -1).map((step, index) => ({
    id: `edge-${step.id}-${steps[index + 1].id}`,
    source: step.id,
    target: steps[index + 1].id,
    label: null,
  }));

const DEFAULT_WORKFLOW_SETTINGS: ApiWorkflowSettings = {
  execution_order: "v1",
  error_workflow_id: null,
  caller_policy: "inherit",
  timezone: "UTC",
  save_failed_executions: "all",
  save_successful_executions: "all",
  save_manual_executions: true,
  save_execution_progress: true,
  timeout_seconds: 3600,
  time_saved_minutes: 0,
};

const CLUSTER_MULTI_SLOT_KEYS = new Set(["tool"]);

const CLUSTER_NODE_TEMPLATES: Record<string, Record<string, { type: ApiWorkflowStepType; name: (rootName: string, index: number) => string; config: (parent: ApiWorkflowStep) => Record<string, unknown> }>> = {
  ai_agent: {
    model: {
      type: "ai_chat_model",
      name: (rootName) => `${rootName} Model`,
      config: (parent) => ({ provider: parent.config.provider ?? "openai", model: parent.config.model ?? "gpt-4o" }),
    },
    memory: {
      type: "ai_memory",
      name: (rootName) => `${rootName} Memory`,
      config: () => ({ memory_type: "buffer_window", context_window: 5, session_key: "{{execution_id}}" }),
    },
    tool: {
      type: "ai_tool",
      name: (rootName, index) => `${rootName} Tool ${index}`,
      config: () => ({ tool_name: "tool", tool_type: "http_request", method: "GET" }),
    },
    output_parser: {
      type: "ai_output_parser",
      name: (rootName) => `${rootName} Output Parser`,
      config: () => ({ parser_type: "json", strict_mode: true }),
    },
  },
  ai_summarize: {
    model: {
      type: "ai_chat_model",
      name: (rootName) => `${rootName} Model`,
      config: (parent) => ({ provider: parent.config.provider ?? "openai", model: parent.config.model ?? "gpt-4o-mini" }),
    },
  },
  ai_extract: {
    model: {
      type: "ai_chat_model",
      name: (rootName) => `${rootName} Model`,
      config: (parent) => ({ provider: parent.config.provider ?? "openai", model: parent.config.model ?? "gpt-4o-mini" }),
    },
    output_parser: {
      type: "ai_output_parser",
      name: (rootName) => `${rootName} Output Parser`,
      config: () => ({ parser_type: "json", strict_mode: true }),
    },
  },
  ai_classify: {
    model: {
      type: "ai_chat_model",
      name: (rootName) => `${rootName} Model`,
      config: (parent) => ({ provider: parent.config.provider ?? "openai", model: parent.config.model ?? "gpt-4o-mini" }),
    },
    output_parser: {
      type: "ai_output_parser",
      name: (rootName) => `${rootName} Output Parser`,
      config: () => ({ parser_type: "json", strict_mode: true }),
    },
  },
  ai_sentiment: {
    model: {
      type: "ai_chat_model",
      name: (rootName) => `${rootName} Model`,
      config: (parent) => ({ provider: parent.config.provider ?? "openai", model: parent.config.model ?? "gpt-4o-mini" }),
    },
  },
};

const isClusterEdge = (label?: string | null) => (label ?? "").toLowerCase().startsWith("cluster:");

const normalizeWorkflowSettings = (settings?: Partial<ApiWorkflowSettings> | null): ApiWorkflowSettings => ({
  ...DEFAULT_WORKFLOW_SETTINGS,
  ...(settings ?? {}),
});

const normalizeWorkflow = (workflow: ApiWorkflowDetail): ApiWorkflowDetail => ({
  ...workflow,
  definition: {
    ...workflow.definition,
    edges: workflow.definition.edges?.length ? workflow.definition.edges : buildFallbackEdges(workflow.definition.steps),
    settings: normalizeWorkflowSettings(workflow.definition.settings),
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
  const preservedClusterEdges = edges.filter((edge) => edge.source === stepId && isClusterEdge(edge.label));
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

  return [...edges.filter((edge) => edge.source !== stepId), ...preservedClusterEdges, ...nextEdges];
};

const getStoredPosition = (step: ApiWorkflowStep) => {
  if (typeof step.config?.ui_position === "object" && step.config?.ui_position !== null) {
    const position = step.config.ui_position as { x?: number; y?: number };
    return { x: position.x ?? 96, y: position.y ?? 120 };
  }
  return { x: 96, y: 120 };
};

const getClusterSlotOrder = (parentType: string, slotKey: string) => {
  const slotOrder = Object.keys(CLUSTER_NODE_TEMPLATES[parentType] ?? {});
  return Math.max(0, slotOrder.indexOf(slotKey));
};

const tidyWorkflowLayout = (workflow: ApiWorkflowDetail): ApiWorkflowDetail => {
  const allSteps = workflow.definition.steps;
  const rootSteps = allSteps.filter((step) => typeof step.config?.cluster_parent_id !== "string");
  const rootIds = new Set(rootSteps.map((step) => step.id));
  const nonClusterEdges = workflow.definition.edges.filter((edge) => !isClusterEdge(edge.label));
  const incomingByTarget = new Map<string, ApiWorkflowEdge[]>();
  const originalIndex = new Map(rootSteps.map((step, index) => [step.id, index]));
  const originalPosition = new Map(rootSteps.map((step) => [step.id, getStoredPosition(step)]));

  nonClusterEdges.forEach((edge) => {
    if (!rootIds.has(edge.target) || !rootIds.has(edge.source)) return;
    const current = incomingByTarget.get(edge.target) ?? [];
    current.push(edge);
    incomingByTarget.set(edge.target, current);
  });

  const depthCache = new Map<string, number>();
  const visiting = new Set<string>();
  const resolveDepth = (stepId: string): number => {
    if (depthCache.has(stepId)) return depthCache.get(stepId) ?? 0;
    if (visiting.has(stepId)) return 0;
    visiting.add(stepId);
    const parents = incomingByTarget.get(stepId) ?? [];
    const depth = parents.reduce((maxDepth, edge) => Math.max(maxDepth, resolveDepth(edge.source) + 1), 0);
    visiting.delete(stepId);
    depthCache.set(stepId, depth);
    return depth;
  };

  rootSteps.forEach((step) => resolveDepth(step.id));

  const levels = new Map<number, ApiWorkflowStep[]>();
  rootSteps.forEach((step) => {
    const depth = depthCache.get(step.id) ?? 0;
    const group = levels.get(depth) ?? [];
    group.push(step);
    levels.set(depth, group);
  });

  const baseX = 96;
  const baseY = 120;
  const columnGap = 320;
  const rowGap = 176;
  const positions = new Map<string, { x: number; y: number }>();

  Array.from(levels.keys())
    .sort((a, b) => a - b)
    .forEach((depth) => {
      const group = levels.get(depth) ?? [];
      group
        .sort((left, right) => {
          const leftPosition = originalPosition.get(left.id)?.y ?? 0;
          const rightPosition = originalPosition.get(right.id)?.y ?? 0;
          if (leftPosition !== rightPosition) return leftPosition - rightPosition;
          return (originalIndex.get(left.id) ?? 0) - (originalIndex.get(right.id) ?? 0);
        })
        .forEach((step, index) => {
          positions.set(step.id, {
            x: baseX + depth * columnGap,
            y: baseY + index * rowGap,
          });
        });
    });

  const parentById = new Map(rootSteps.map((step) => [step.id, step]));
  const clusterChildren = allSteps.filter((step) => typeof step.config?.cluster_parent_id === "string");
  const clusterCounts = new Map<string, number>();

  clusterChildren
    .slice()
    .sort((left, right) => {
      const leftParent = String(left.config?.cluster_parent_id ?? "");
      const rightParent = String(right.config?.cluster_parent_id ?? "");
      if (leftParent !== rightParent) return leftParent.localeCompare(rightParent);
      const leftSlot = String(left.config?.cluster_slot ?? "model");
      const rightSlot = String(right.config?.cluster_slot ?? "model");
      if (leftSlot !== rightSlot) return leftSlot.localeCompare(rightSlot);
      return (originalIndex.get(leftParent) ?? 0) - (originalIndex.get(rightParent) ?? 0);
    })
    .forEach((step) => {
      const parentId = String(step.config?.cluster_parent_id ?? "");
      const parent = parentById.get(parentId);
      const parentPosition = positions.get(parentId) ?? originalPosition.get(parentId) ?? { x: baseX, y: baseY };
      const slotKey = typeof step.config?.cluster_slot === "string" ? step.config.cluster_slot : "model";
      const slotCounterKey = `${parentId}:${slotKey}`;
      const siblingIndex = clusterCounts.get(slotCounterKey) ?? 0;
      clusterCounts.set(slotCounterKey, siblingIndex + 1);
      positions.set(step.id, {
        x: parentPosition.x + 24 + getClusterSlotOrder(parent?.type ?? "ai_agent", slotKey) * 28,
        y: parentPosition.y + 126 + siblingIndex * 92,
      });
    });

  return {
    ...workflow,
    definition: {
      ...workflow.definition,
      steps: workflow.definition.steps.map((step) => {
        const position = positions.get(step.id);
        if (!position) return step;
        return {
          ...step,
          config: {
            ...step.config,
            ui_position: {
              x: Math.round(position.x),
              y: Math.round(position.y),
            },
          },
        };
      }),
    },
  };
};

const WorkflowStudio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || undefined;
  const requestedNodeId = searchParams.get("node");
  const [activeTab, setActiveTab] = useState<"editor" | "executions">("editor");
  const [nodesOpen, setNodesOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("nodes");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(!!initialPrompt);
  const [chatMaximized, setChatMaximized] = useState(false);
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
  const [addingNode, setAddingNode] = useState<string | null>(null);
  const positionSaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [executions, setExecutions] = useState<ApiExecution[]>([]);
  const [workflowSettingsOpen, setWorkflowSettingsOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [canvasZoom, setCanvasZoom] = useState(92);
  const [canvasExecutionSteps, setCanvasExecutionSteps] = useState<ApiExecutionStep[] | null>(null);
  const [nodePinCandidates, setNodePinCandidates] = useState<Record<string, Record<string, unknown> | null>>({});
  const [canvasStepPayload, setCanvasStepPayload] = useState('{\n  "message": "Hello from FlowHolt"\n}');
  const [canvasStepTestResult, setCanvasStepTestResult] = useState<{ stepId: string; result: ApiStudioStepTestResponse } | null>(null);
  const [canvasStepHistory, setCanvasStepHistory] = useState<ApiWorkflowStepHistoryResponse | null>(null);
  const [canvasStepHistoryLoading, setCanvasStepHistoryLoading] = useState(false);
  const [canvasStepHistoryError, setCanvasStepHistoryError] = useState<string | null>(null);
  const [canvasHistoryExecutionId, setCanvasHistoryExecutionId] = useState<string | null>(null);
  const [canvasExecutionStepDetail, setCanvasExecutionStepDetail] = useState<ApiExecutionStepInspectorResponse | null>(null);
  const [canvasExecutionStepDetailLoading, setCanvasExecutionStepDetailLoading] = useState(false);
  const [canvasExecutionPause, setCanvasExecutionPause] = useState<ApiExecutionPauseSummary | null>(null);
  const [canvasExecutionHumanTask, setCanvasExecutionHumanTask] = useState<ApiHumanTaskSummary | null>(null);
  const [canvasHistoryActionLoading, setCanvasHistoryActionLoading] = useState<"replay" | "resume" | "cancel" | "pin" | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  const canvasStepPayloadState = useMemo(() => {
    const trimmed = canvasStepPayload.trim();
    if (!trimmed) return { parsed: {}, error: null as string | null };
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        return { parsed: null, error: "Payload must be a JSON object." };
      }
      return { parsed: parsed as Record<string, unknown>, error: null as string | null };
    } catch {
      return { parsed: null, error: "Payload must be valid JSON." };
    }
  }, [canvasStepPayload]);

  const markSaved = useCallback(() => {
    setLastSavedAt(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (!chatOpen) {
      setChatMaximized(false);
    }
  }, [chatOpen]);

  const retryLoad = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadWorkflow = async () => {
      if (!id) {
        setLoadError("Workflow id is missing.");
        setLoading(false);
        return;
      }

      // Handle special "new" and "ai-generate" routes by creating a workflow first
      if (id === "new" || id === "ai-generate") {
        try {
          setLoading(true);
          setLoadError(null);
          const newWf = await api.createWorkflow({
            name: "Untitled Workflow",
            trigger_type: "manual",
            status: "draft",
            definition: {
              steps: [{
                id: "step-trigger-1",
                type: "trigger",
                name: "Manual Trigger",
                config: { source: "manual" },
              }],
              edges: [],
              settings: DEFAULT_WORKFLOW_SETTINGS,
            },
          });
          if (ignore) return;
          navigate(`/studio/${newWf.id}`, { replace: true });
          return;
        } catch (createErr) {
          if (ignore) return;
          setLoadError(createErr instanceof Error ? createErr.message : "Failed to create workflow.");
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        setLoadError(null);
        setNoticeError(null);
        const detail = normalizeWorkflow(await api.getWorkflow(id));
        if (ignore) return;
        setWorkflow(detail);
        setSelectedNode(
          requestedNodeId && detail.definition.steps.some((step) => step.id === requestedNodeId)
            ? requestedNodeId
            : detail.definition.steps[0]?.id ?? null,
        );
        setNotice(null);
        setLastExecution(null);
        setLastSavedAt(null);
        setCanvasExecutionSteps(null);
        setCanvasStepTestResult(null);
        setCanvasStepHistory(null);
        setCanvasStepHistoryError(null);
        setCanvasHistoryExecutionId(null);
        setCanvasExecutionStepDetail(null);
        setCanvasExecutionPause(null);
        setCanvasExecutionHumanTask(null);
        setNodePinCandidates({});
        setUndoStack([]);
        setRedoStack([]);
        // Clear the prompt param after loading so it doesn't persist on reload
        if (searchParams.has("prompt")) {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete("prompt");
          setSearchParams(nextParams, { replace: true });
        }
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
  }, [id, retryCount]);

  // Load executions for this workflow
  useEffect(() => {
    if (!id || id === "new" || id === "ai-generate") return;
    api.listExecutions().then((all) => setExecutions(all.filter((e) => e.workflow_id === id))).catch(() => {});
  }, [id, lastExecution]);

  const selectedStep = useMemo(
    () => workflow?.definition.steps.find((step) => step.id === selectedNode) ?? null,
    [selectedNode, workflow],
  );
  const selectedHistoryEntry = useMemo(
    () => canvasStepHistory?.entries.find((entry) => entry.execution_id === canvasHistoryExecutionId) ?? null,
    [canvasHistoryExecutionId, canvasStepHistory],
  );
  const historyAutoRefreshActive = useMemo(
    () => selectedHistoryEntry?.execution_status === "running"
      || selectedHistoryEntry?.execution_status === "paused"
      || canvasExecutionPause?.status === "paused",
    [canvasExecutionPause?.status, selectedHistoryEntry?.execution_status],
  );
  const selectedStepIndex = useMemo(
    () => workflow?.definition.steps.findIndex((step) => step.id === selectedNode) ?? -1,
    [selectedNode, workflow],
  );

  const handleTopBarTabChange = useCallback((tab: "editor" | "executions") => {
    setActiveTab(tab);
    if (tab === "executions") {
      setActiveTool("executions");
      setNodesOpen(true);
      setChatOpen(false);
      return;
    }

    if (activeTool === "executions") {
      setActiveTool("nodes");
    }
  }, [activeTool]);

  const handlePanelToolChange = useCallback((tool: string) => {
    setActiveTool(tool);
    setActiveTab(tool === "executions" ? "executions" : "editor");
  }, []);

  const handleSaveStep = async (updatedStep: ApiWorkflowStep) => {
    if (!id || !workflow) return;

    const nextTriggerType = updatedStep.type === "trigger" && typeof updatedStep.config.source === "string" && updatedStep.config.source.trim()
      ? updatedStep.config.source.trim()
      : workflow.trigger_type;

    const nextDefinition = {
      steps: workflow.definition.steps.map((step) => (step.id === updatedStep.id ? updatedStep : step)),
      edges: workflow.definition.edges,
      settings: workflow.definition.settings,
    };

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      const updatedWorkflow = await api.updateWorkflow(id, {
        name: workflow.name,
        trigger_type: nextTriggerType,
        category: workflow.category,
        status: workflow.status,
        definition: nextDefinition,
      });
      setWorkflow(normalizeWorkflow(updatedWorkflow));
      markSaved();
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
    markSaved();
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
    type: ApiWorkflowStepType;
    name: string;
    config: Record<string, unknown>;
  }) => {
    if (!workflow) return;
    setAddingNode(stepTemplate.name);

    const anchorStep =
      workflow.definition.steps.find((step) => step.id === selectedNode) ??
      workflow.definition.steps[workflow.definition.steps.length - 1] ??
      null;
    const anchorPosition =
      anchorStep && typeof anchorStep.config?.ui_position === "object" && anchorStep.config?.ui_position !== null
        ? (anchorStep.config.ui_position as { x?: number; y?: number })
        : null;
    const providedPosition =
      typeof stepTemplate.config.ui_position === "object" && stepTemplate.config.ui_position !== null
        ? (stepTemplate.config.ui_position as { x?: number; y?: number })
        : null;
    const nextPosition = providedPosition ?? {
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
        settings: workflow.definition.settings,
      },
    };

    // Optimistic: update local state immediately
    pushUndoSnapshot();
    setWorkflow(normalizeWorkflow(nextWorkflow));
    setSelectedNode(newStep.id);
    setNotice(`${stepTemplate.name} added to the workflow.`);
    setAddingNode(null);

    // Background API save
    persistWorkflow(nextWorkflow).catch((err) => {
      setNoticeError(err instanceof Error ? err.message : "Failed to save new step.");
    });
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

  const handleTidyWorkflow = useCallback(() => {
    if (!workflow) return;
    const nextWorkflow = tidyWorkflowLayout(workflow);
    pushUndoSnapshot();
    setWorkflow(normalizeWorkflow(nextWorkflow));
    setNotice("Workflow tidied up.");
    persistWorkflow(nextWorkflow).catch((error) => {
      setNoticeError(error instanceof Error ? error.message : "Failed to tidy workflow.");
    });
  }, [workflow]);

  const handleRun = async () => {
    if (!id || !workflow) return;

    try {
      setActionLoading("run");
      setNoticeError(null);
      setCanvasExecutionSteps(null);
      setCanvasStepTestResult(null);
      const execution = await api.runWorkflow(id, {});
      setLastExecution(execution);
      setCanvasHistoryExecutionId(execution.id);
      setNotice(`Test run finished with ${execution.status}.`);
    } catch (runError) {
      setNoticeError(runError instanceof Error ? runError.message : "Failed to run workflow.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddStepsFromChat = async (newSteps: ApiWorkflowStep[], newEdges: ApiWorkflowEdge[]) => {
    if (!workflow) return;

    // Position the new steps on the canvas, stacked to the right of existing nodes
    const existingSteps = workflow.definition.steps;
    let maxX = 96;
    let baseY = 120;
    for (const s of existingSteps) {
      const pos = s.config?.ui_position as { x?: number; y?: number } | undefined;
      if (pos?.x && pos.x > maxX) maxX = pos.x;
      if (pos?.y) baseY = pos.y;
    }

    const positionedSteps = newSteps.map((step, i) => ({
      ...step,
      config: {
        ...step.config,
        ui_position: { x: maxX + 320 * (i + 1), y: baseY + (i % 2 === 1 ? 100 : 0) },
      },
    }));

    // Build edges: connect last existing step → first new step, then chain new steps
    const finalEdges: ApiWorkflowEdge[] = [...newEdges];
    if (existingSteps.length > 0 && positionedSteps.length > 0 && finalEdges.length === 0) {
      const lastStep = existingSteps[existingSteps.length - 1];
      finalEdges.push({
        id: `edge-${lastStep.id}-${positionedSteps[0].id}`,
        source: lastStep.id,
        target: positionedSteps[0].id,
        label: null,
      });
      for (let i = 0; i < positionedSteps.length - 1; i++) {
        finalEdges.push({
          id: `edge-${positionedSteps[i].id}-${positionedSteps[i + 1].id}`,
          source: positionedSteps[i].id,
          target: positionedSteps[i + 1].id,
          label: null,
        });
      }
    }

    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      definition: {
        steps: [...existingSteps, ...positionedSteps],
        edges: [...workflow.definition.edges, ...finalEdges],
        settings: workflow.definition.settings,
      },
    };

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      await persistWorkflow(nextWorkflow, `Added ${positionedSteps.length} nodes from AI assistant.`);
      if (positionedSteps.length > 0) {
        setSelectedNode(positionedSteps[0].id);
      }
    } catch (err) {
      setNoticeError(err instanceof Error ? err.message : "Failed to add steps from assistant.");
    } finally {
      setSaving(false);
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

    const originalOutgoing = workflow.definition.edges.filter((edge) => edge.source === step.id && !isClusterEdge(edge.label));
    const preservedEdges = workflow.definition.edges.filter((edge) => edge.source !== step.id || isClusterEdge(edge.label));
    const nextEdges = [
      ...preservedEdges,
      { id: `edge-${step.id}-${duplicateStep.id}`, source: step.id, target: duplicateStep.id, label: null },
      ...originalOutgoing.map((edge) => ({
        ...edge,
        id: `${edge.id}-copy`,
        source: duplicateStep.id,
      })),
    ];

    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      definition: { ...workflow.definition, steps: nextSteps, edges: nextEdges },
    };

    // Optimistic: update local state immediately
    pushUndoSnapshot();
    setWorkflow(normalizeWorkflow(nextWorkflow));
    setSelectedNode(duplicateStep.id);
    setNotice(`${step.name} duplicated.`);

    // Background API save
    persistWorkflow(nextWorkflow).catch((err) => {
      setNoticeError(err instanceof Error ? err.message : "Failed to save duplicated step.");
    });
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!workflow) return;

    // Cancel any pending position save to prevent it from restoring the deleted node
    if (positionSaveTimer.current) {
      clearTimeout(positionSaveTimer.current);
      positionSaveTimer.current = undefined;
    }

    const clusterChildIds = workflow.definition.steps
      .filter((step) => step.config?.cluster_parent_id === stepId)
      .map((step) => step.id);
    const removedIds = new Set([stepId, ...clusterChildIds]);
    const nextSteps = workflow.definition.steps.filter((step) => !removedIds.has(step.id));
    const incoming = workflow.definition.edges.filter((edge) => edge.target === stepId && !isClusterEdge(edge.label));
    const outgoing = workflow.definition.edges.filter((edge) => edge.source === stepId && !isClusterEdge(edge.label));
    const fallbackTarget = outgoing[0]?.target;
    const rewiredEdges = workflow.definition.edges
      .filter((edge) => !removedIds.has(edge.source) && !removedIds.has(edge.target))
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

    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      definition: { ...workflow.definition, steps: nextSteps, edges: rewiredEdges },
    };

    // Optimistic: update local state immediately
    pushUndoSnapshot();
    setWorkflow(normalizeWorkflow(nextWorkflow));
    setSelectedNode(nextSteps[0]?.id ?? null);
    setNotice(clusterChildIds.length ? `Step and ${clusterChildIds.length} cluster attachment${clusterChildIds.length > 1 ? "s" : ""} removed.` : "Step removed from the workflow.");

    // Background API save — don't overwrite local state from server response
    if (id) {
      try {
        await api.updateWorkflow(id, {
          name: nextWorkflow.name,
          trigger_type: nextWorkflow.trigger_type,
          category: nextWorkflow.category,
          status: nextWorkflow.status,
          definition: nextWorkflow.definition,
        });
      } catch (err) {
        setNoticeError(err instanceof Error ? err.message : "Failed to save after deleting step.");
      }
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

    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      definition: { ...workflow.definition, steps: nextSteps, edges: workflow.definition.edges },
    };

    // Optimistic: update local state immediately
    pushUndoSnapshot();
    setWorkflow(normalizeWorkflow(nextWorkflow));
    setSelectedNode(moved.id);
    setNotice(`${moved.name} moved ${direction}.`);

    // Background API save
    persistWorkflow(nextWorkflow).catch((err) => {
      setNoticeError(err instanceof Error ? err.message : "Failed to reorder step.");
    });
  };

  const handlePositionChange = useCallback((
    stepId: string,
    position: { x: number; y: number },
    relatedPositions: Array<{ id: string; position: { x: number; y: number } }> = [],
  ) => {
    if (!workflow) return;

    const relatedPositionMap = new Map(relatedPositions.map((item) => [item.id, item.position]));

    // Optimistic local state update — no API call until debounce fires
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        definition: {
          ...prev.definition,
          steps: prev.definition.steps.map((step) =>
            step.id === stepId
              ? { ...step, config: { ...step.config, ui_position: position } }
              : relatedPositionMap.has(step.id)
                ? { ...step, config: { ...step.config, ui_position: relatedPositionMap.get(step.id) } }
                : step,
          ),
        },
      };
    });

    // Debounce the actual API save to avoid hammering the backend
    if (positionSaveTimer.current) clearTimeout(positionSaveTimer.current);
    positionSaveTimer.current = setTimeout(() => {
      setWorkflow((current) => {
        if (!current || !id) return current;
        api.updateWorkflow(id, {
          name: current.name,
          trigger_type: current.trigger_type,
          category: current.category,
          status: current.status,
          definition: current.definition,
        }).catch(() => { /* position save is best-effort */ });
        return current;
      });
    }, 800);
  }, [workflow, id]);

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
            settings: workflow.definition.settings,
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

  const handleAddStepBetween = (sourceId: string, targetId: string) => {
    if (!workflow) return;
    const sourceStep = workflow.definition.steps.find((s) => s.id === sourceId);
    const targetStep = workflow.definition.steps.find((s) => s.id === targetId);
    if (!sourceStep || !targetStep) return;

    const sourcePos = (sourceStep.config?.ui_position as { x?: number; y?: number }) ?? { x: 200, y: 120 };
    const targetPos = (targetStep.config?.ui_position as { x?: number; y?: number }) ?? { x: 500, y: 120 };
    const midX = ((sourcePos.x ?? 200) + (targetPos.x ?? 500)) / 2;
    const midY = ((sourcePos.y ?? 120) + (targetPos.y ?? 120)) / 2;

    setSelectedNode(sourceId);
    handleAddStep({
      type: "transform",
      name: "New Step",
      config: { ui_position: { x: midX, y: midY } },
    });
  };

  const handleDeleteEdge = (edgeId: string) => {
    if (!workflow) return;
    pushUndoSnapshot();
    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      definition: {
        steps: workflow.definition.steps,
        edges: workflow.definition.edges.filter((e) => e.id !== edgeId),
        settings: workflow.definition.settings,
      },
    };
    setWorkflow(normalizeWorkflow(nextWorkflow));
    setNotice("Connection removed.");
    persistWorkflow(nextWorkflow).catch((err) => {
      setNoticeError(err instanceof Error ? err.message : "Failed to save after removing connection.");
    });
  };

  const handleUpdateEdge = (edgeId: string, label: string) => {
    if (!workflow) return;
    pushUndoSnapshot();
    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      definition: {
        steps: workflow.definition.steps,
        edges: workflow.definition.edges.map((e) =>
          e.id === edgeId ? { ...e, label: label || null } : e,
        ),
        settings: workflow.definition.settings,
      },
    };
    setWorkflow(normalizeWorkflow(nextWorkflow));
    persistWorkflow(nextWorkflow).catch((err) => {
      setNoticeError(err instanceof Error ? err.message : "Failed to save edge label.");
    });
  };

  const handleSelectExecution = (execution: ApiExecution) => {
    setCanvasExecutionSteps(null);
    setCanvasStepTestResult(null);
    setCanvasHistoryExecutionId(execution.id);
    setLastExecution(execution);
    setNotice(`Viewing execution ${execution.id.slice(0, 8)}…`);
  };

  const handleRetryExecution = async (executionId: string) => {
    try {
      setActionLoading("run");
      setCanvasExecutionSteps(null);
      setCanvasStepTestResult(null);
      const execution = await api.retryExecution(executionId);
      setLastExecution(execution);
      setCanvasHistoryExecutionId(execution.id);
      setNotice(`Retry finished with ${execution.status}.`);
    } catch (err) {
      setNoticeError(err instanceof Error ? err.message : "Retry failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUndo = async () => {
    const previous = undoStack[undoStack.length - 1];
    const current = createSnapshot();
    if (!previous || !current) return;

    setUndoStack((items) => items.slice(0, -1));
    setRedoStack((items) => [...items, current]);
    await applySnapshot(previous, "Undid last change.");
  };

  const updateStepConfig = useCallback((stepId: string, updater: (step: ApiWorkflowStep) => ApiWorkflowStep, successMessage: string) => {
    if (!workflow) return;

    const nextSteps = workflow.definition.steps.map((step) => (step.id === stepId ? updater(step) : step));
    const updatedStep = nextSteps.find((step) => step.id === stepId) ?? null;
    const nextTriggerType = updatedStep?.type === "trigger" && typeof updatedStep.config.source === "string" && updatedStep.config.source.trim()
      ? updatedStep.config.source.trim()
      : workflow.trigger_type;

    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      trigger_type: nextTriggerType,
      definition: {
        ...workflow.definition,
        steps: nextSteps,
      },
    };

    pushUndoSnapshot();
    setWorkflow(normalizeWorkflow(nextWorkflow));
    setNoticeError(null);
    setCanvasExecutionSteps(null);
    setCanvasStepTestResult(null);
    setCanvasExecutionStepDetail(null);
    setCanvasExecutionPause(null);
    setNotice(successMessage);
    persistWorkflow(nextWorkflow).catch((error) => {
      setNoticeError(error instanceof Error ? error.message : "Failed to save node changes.");
    });
  }, [workflow]);

  const handleRenameStep = useCallback((stepId: string, nextName: string) => {
    const currentStep = workflow?.definition.steps.find((step) => step.id === stepId);
    const trimmed = nextName.trim();
    if (!currentStep) return;
    if (!trimmed) {
      setNoticeError("Step name cannot be empty.");
      return;
    }
    if (trimmed === currentStep.name) return;

    updateStepConfig(
      stepId,
      (step) => ({
        ...step,
        name: trimmed,
      }),
      `Renamed ${currentStep.name} to ${trimmed}.`,
    );
  }, [updateStepConfig, workflow]);

  const handleToggleStepEnabled = useCallback((stepId: string) => {
    const currentStep = workflow?.definition.steps.find((step) => step.id === stepId);
    if (!currentStep) return;

    const currentlyEnabled = currentStep.config?._enabled !== false;
    updateStepConfig(
      stepId,
      (step) => ({
        ...step,
        config: {
          ...step.config,
          _enabled: !currentlyEnabled,
        },
      }),
      currentlyEnabled ? `${currentStep.name} deactivated.` : `${currentStep.name} reactivated.`,
    );
  }, [updateStepConfig, workflow]);

  const handleToggleStepPinned = useCallback((stepId: string) => {
    const currentStep = workflow?.definition.steps.find((step) => step.id === stepId);
    if (!currentStep) return;

    if (Object.prototype.hasOwnProperty.call(currentStep.config ?? {}, "_pinned_data")) {
      updateStepConfig(
        stepId,
        (step) => {
          const nextConfig = { ...step.config };
          delete nextConfig._pinned_data;
          return { ...step, config: nextConfig };
        },
        `Removed pinned data from ${currentStep.name}.`,
      );
      return;
    }

    const candidate = nodePinCandidates[stepId] ?? null;
    if (!candidate) {
      setNoticeError("Run this node first to capture output before pinning it.");
      return;
    }

    updateStepConfig(
      stepId,
      (step) => ({
        ...step,
        config: {
          ...step.config,
          _pinned_data: candidate,
        },
      }),
      `Pinned latest output for ${currentStep.name}.`,
    );
  }, [nodePinCandidates, updateStepConfig, workflow]);

  const handleRunStep = useCallback(async (stepId: string) => {
    if (!id || !workflow) return;

    const step = workflow.definition.steps.find((item) => item.id === stepId);
    if (!step) return;
    if (canvasStepPayloadState.error || !canvasStepPayloadState.parsed) {
      setNoticeError(canvasStepPayloadState.error ?? "Payload must be valid JSON.");
      return;
    }

    try {
      setActionLoading("run");
      setNoticeError(null);
      setCanvasStepTestResult(null);
      const result = await api.studioTestStep(id, stepId, canvasStepPayloadState.parsed);
      const executedSteps: ApiExecutionStep[] = result.executed_step_ids
        .map((executedStepId) => {
          const executedStep = workflow.definition.steps.find((item) => item.id === executedStepId);
          if (!executedStep) return null;
          const isTarget = executedStepId === stepId;
          return {
            name: executedStep.name,
            status: isTarget ? (result.target_step_result?.status ?? result.status) : "success",
            duration_ms: isTarget ? (result.target_step_result?.duration_ms ?? 0) : 0,
            output: isTarget ? (result.target_step_result?.output ?? undefined) : undefined,
          } satisfies ApiExecutionStep;
        })
        .filter((item): item is ApiExecutionStep => item !== null);

      setCanvasExecutionSteps(executedSteps.length > 0 ? executedSteps : null);
      setCanvasStepTestResult({ stepId, result });
      setCanvasExecutionStepDetail(null);
      setCanvasExecutionPause(null);
      setLastExecution(null);
      setSelectedNode(stepId);

      const pinCandidate = result.target_step_result?.output ?? result.preview?.sample_output ?? null;
      if (pinCandidate && typeof pinCandidate === "object") {
        setNodePinCandidates((current) => ({ ...current, [stepId]: pinCandidate }));
      }

      if (result.warnings.length) {
        setNotice(`${step.name} executed with warnings.`);
      } else {
        setNotice(`Executed ${step.name} path with ${result.status}.`);
      }
    } catch (error) {
      setNoticeError(error instanceof Error ? error.message : "Failed to execute this step.");
    } finally {
      setActionLoading(null);
    }
  }, [canvasStepPayloadState.error, canvasStepPayloadState.parsed, id, workflow]);

  useEffect(() => {
    let ignore = false;

    if (!id || !workflow || !selectedNode) {
      setCanvasStepHistory(null);
      setCanvasStepHistoryError(null);
      setCanvasHistoryExecutionId(null);
      setCanvasExecutionStepDetail(null);
      setCanvasExecutionPause(null);
      setCanvasExecutionHumanTask(null);
      return () => {
        ignore = true;
      };
    }

    setCanvasStepHistoryLoading(true);
    setCanvasStepHistoryError(null);

    void api.getWorkflowStepHistory(id, selectedNode, 20)
      .then((history) => {
        if (ignore) return;
        setCanvasStepHistory(history);
        setCanvasStepHistoryError(null);
        setCanvasHistoryExecutionId((current) => {
          if (current && history.entries.some((entry) => entry.execution_id === current)) return current;
          if (lastExecution && history.entries.some((entry) => entry.execution_id === lastExecution.id)) return lastExecution.id;
          return history.entries[0]?.execution_id ?? null;
        });
      })
      .catch((error) => {
        if (ignore) return;
        setCanvasStepHistory(null);
        setCanvasHistoryExecutionId(null);
        setCanvasExecutionStepDetail(null);
        setCanvasExecutionPause(null);
        setCanvasExecutionHumanTask(null);
        setCanvasStepHistoryError(error instanceof Error ? error.message : "Failed to load step history.");
      })
      .finally(() => {
        if (!ignore) setCanvasStepHistoryLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, lastExecution, selectedNode, workflow]);

  useEffect(() => {
    let ignore = false;

    if (!selectedNode || !canvasHistoryExecutionId) {
      setCanvasExecutionStepDetail(null);
      setCanvasExecutionPause(null);
      setCanvasExecutionHumanTask(null);
      setCanvasExecutionStepDetailLoading(false);
      return () => {
        ignore = true;
      };
    }

    setCanvasExecutionStepDetailLoading(true);
    void Promise.all([
      api.getExecutionStepDetail(canvasHistoryExecutionId, selectedNode),
      api.getExecutionBundle(canvasHistoryExecutionId),
    ])
      .then(([detail, bundle]) => {
        if (ignore) return;
        setCanvasExecutionStepDetail(detail);
        setCanvasExecutionPause(bundle.pause);
        setCanvasExecutionHumanTask(bundle.human_task);
      })
      .catch((error) => {
        if (ignore) return;
        setCanvasExecutionStepDetail(null);
        setCanvasExecutionPause(null);
        setCanvasExecutionHumanTask(null);
        setCanvasStepHistoryError(error instanceof Error ? error.message : "Failed to load execution step details.");
      })
      .finally(() => {
        if (!ignore) setCanvasExecutionStepDetailLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [canvasHistoryExecutionId, selectedNode]);

  const handleSelectStepHistoryExecution = useCallback((executionId: string) => {
    setCanvasHistoryExecutionId(executionId);
    setCanvasStepTestResult(null);
    const execution = executions.find((item) => item.id === executionId) ?? null;
    setLastExecution(execution);
    setCanvasExecutionSteps(null);
  }, [executions]);

  const applyHistoricalExecutionResult = useCallback((execution: ApiExecution, successMessage: string) => {
    setNoticeError(null);
    setNotice(successMessage);
    setLastExecution(execution);
    setCanvasHistoryExecutionId(execution.id);
    setCanvasExecutionSteps(null);
    setCanvasStepTestResult(null);
    setCanvasExecutionStepDetail(null);
    setCanvasExecutionPause(null);
    setCanvasExecutionHumanTask(null);
    setExecutions((current) => [execution, ...current.filter((item) => item.id !== execution.id)]);
  }, []);

  const handleReplayHistoryExecution = useCallback(async (
    executionId: string,
    mode: "same_version" | "latest_published" | "current_draft",
  ) => {
    try {
      setCanvasHistoryActionLoading("replay");
      setNoticeError(null);
      const result = await api.replayExecution(executionId, { mode, queued: false });
      if (result.execution) {
        applyHistoricalExecutionResult(result.execution, `Replay (${mode.replaceAll("_", " ")}) finished with ${result.execution.status}.`);
        return;
      }
      setNotice(result.queued ? "Replay queued." : "Replay started.");
    } catch (error) {
      setNoticeError(error instanceof Error ? error.message : "Failed to replay execution.");
    } finally {
      setCanvasHistoryActionLoading(null);
    }
  }, [applyHistoricalExecutionResult]);

  const handleLoadHistoryOutputToEditor = useCallback(async (executionId: string) => {
    if (!selectedNode || canvasHistoryExecutionId !== executionId) return;

    const currentStep = workflow?.definition.steps.find((step) => step.id === selectedNode);
    if (!currentStep) return;

    const latestOutput = canvasExecutionStepDetail?.latest_output ?? {};
    const resultOutput = canvasExecutionStepDetail?.result?.output ?? null;
    const historyOutput = selectedHistoryEntry?.output ?? null;
    const candidate = Object.keys(latestOutput).length > 0
      ? latestOutput
      : resultOutput && typeof resultOutput === "object"
        ? resultOutput
        : historyOutput && typeof historyOutput === "object" && Object.keys(historyOutput).length > 0
          ? historyOutput
          : null;

    if (!candidate) {
      setNoticeError("This historical run does not have stored output to load into the editor.");
      return;
    }

    try {
      setCanvasHistoryActionLoading("pin");
      setNoticeError(null);
      setNodePinCandidates((current) => ({ ...current, [selectedNode]: candidate }));
      updateStepConfig(
        selectedNode,
        (step) => ({
          ...step,
          config: {
            ...step.config,
            _pinned_data: candidate,
          },
        }),
        `Loaded historical output into the editor for ${currentStep.name}.`,
      );
    } finally {
      setCanvasHistoryActionLoading(null);
    }
  }, [canvasExecutionStepDetail, canvasHistoryExecutionId, selectedHistoryEntry, selectedNode, updateStepConfig, workflow]);

  useEffect(() => {
    let ignore = false;

    if (!id || !selectedNode || !canvasHistoryExecutionId || !historyAutoRefreshActive || canvasHistoryActionLoading != null) {
      return () => {
        ignore = true;
      };
    }

    const refresh = () => {
      void Promise.all([
        api.getWorkflowStepHistory(id, selectedNode, 20),
        api.getExecutionStepDetail(canvasHistoryExecutionId, selectedNode),
        api.getExecutionBundle(canvasHistoryExecutionId),
      ])
        .then(([history, detail, bundle]) => {
          if (ignore) return;
          setCanvasStepHistory(history);
          setCanvasExecutionStepDetail(detail);
          setCanvasExecutionPause(bundle.pause);
          setCanvasExecutionHumanTask(bundle.human_task);
          setLastExecution((current) => (current?.id === bundle.execution.id ? bundle.execution : current));
          setExecutions((current) => {
            if (current.some((item) => item.id === bundle.execution.id)) {
              return current.map((item) => (item.id === bundle.execution.id ? bundle.execution : item));
            }
            return [bundle.execution, ...current];
          });
          setCanvasStepHistoryError(null);
        })
        .catch((error) => {
          if (ignore) return;
          setCanvasStepHistoryError(error instanceof Error ? error.message : "Failed to refresh execution history.");
        });
    };

    const intervalId = window.setInterval(refresh, 5000);
    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [canvasHistoryActionLoading, canvasHistoryExecutionId, historyAutoRefreshActive, id, selectedNode]);

  const handleResumeHistoryExecution = useCallback(async (
    executionId: string,
    options: {
      taskId?: string;
      decision?: string | null;
      comment?: string | null;
      payload?: Record<string, unknown>;
    },
  ) => {
    try {
      setCanvasHistoryActionLoading("resume");
      setNoticeError(null);
      const execution = options.taskId
        ? await api.completeHumanTask(options.taskId, {
            decision: options.decision ?? "",
            comment: options.comment ?? null,
            payload: options.payload ?? {},
          })
        : await api.resumeExecution(executionId, {
            decision: options.decision ?? null,
            payload: options.payload ?? {},
          });
      applyHistoricalExecutionResult(
        execution,
        options.taskId ? `Human task completed with ${execution.status}.` : `Execution resumed with ${execution.status}.`,
      );
    } catch (error) {
      setNoticeError(error instanceof Error ? error.message : "Failed to resume execution.");
    } finally {
      setCanvasHistoryActionLoading(null);
    }
  }, [applyHistoricalExecutionResult]);

  const handleCancelHistoryExecution = useCallback(async (
    executionId: string,
    options: { taskId?: string; comment?: string | null },
  ) => {
    try {
      setCanvasHistoryActionLoading("cancel");
      setNoticeError(null);
      const execution = options.taskId
        ? await api.cancelHumanTask(options.taskId, options.comment ?? null)
        : await api.cancelExecution(executionId);
      applyHistoricalExecutionResult(
        execution,
        options.taskId ? `Human task cancelled with ${execution.status}.` : `Execution cancelled with ${execution.status}.`,
      );
    } catch (error) {
      setNoticeError(error instanceof Error ? error.message : "Failed to cancel paused execution.");
    } finally {
      setCanvasHistoryActionLoading(null);
    }
  }, [applyHistoricalExecutionResult]);

  const handleRedo = async () => {
    const next = redoStack[redoStack.length - 1];
    const current = createSnapshot();
    if (!next || !current) return;

    setRedoStack((items) => items.slice(0, -1));
    setUndoStack((items) => [...items, current]);
    await applySnapshot(next, "Restored change.");
  };

  const handleSaveWorkflowSettings = async (settings: ApiWorkflowSettings) => {
    if (!workflow) return;

    try {
      pushUndoSnapshot();
      setSaving(true);
      setNoticeError(null);
      await persistWorkflow(
        {
          ...workflow,
          definition: {
            ...workflow.definition,
            settings: normalizeWorkflowSettings(settings),
          },
        },
        "Workflow settings updated.",
      );
      setWorkflowSettingsOpen(false);
    } catch (settingsError) {
      setNoticeError(settingsError instanceof Error ? settingsError.message : "Failed to save workflow settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddClusterNode = async (rootId: string, slotKey: string) => {
    if (!workflow) return;

    const parentStep = workflow.definition.steps.find((step) => step.id === rootId);
    if (!parentStep) return;

    const template = CLUSTER_NODE_TEMPLATES[parentStep.type]?.[slotKey];
    if (!template) return;

    const existingAttachments = workflow.definition.steps.filter(
      (step) => step.config?.cluster_parent_id === rootId && step.config?.cluster_slot === slotKey,
    );
    if (!CLUSTER_MULTI_SLOT_KEYS.has(slotKey) && existingAttachments[0]) {
      setSelectedNode(existingAttachments[0].id);
      setNotice(`${existingAttachments[0].name} is already attached.`);
      return;
    }

    const rootPosition =
      typeof parentStep.config?.ui_position === "object" && parentStep.config?.ui_position !== null
        ? (parentStep.config.ui_position as { x?: number; y?: number })
        : { x: 96, y: 120 };
    const slotOrder = Object.keys(CLUSTER_NODE_TEMPLATES[parentStep.type] ?? {}).indexOf(slotKey);
    const nextStep: ApiWorkflowStep = {
      id: `step-${Date.now()}`,
      type: template.type,
      name: template.name(parentStep.name, existingAttachments.length + 1),
      config: {
        ...template.config(parentStep),
        cluster_parent_id: rootId,
        cluster_slot: slotKey,
        ui_position: {
          x: (rootPosition.x ?? 96) + 24 + Math.max(0, slotOrder) * 28,
          y: (rootPosition.y ?? 120) + 126 + existingAttachments.length * 92,
        },
      },
    };
    const nextEdge: ApiWorkflowEdge = {
      id: `edge-${rootId}-${nextStep.id}-cluster-${slotKey}`,
      source: rootId,
      target: nextStep.id,
      label: `cluster:${slotKey}`,
    };
    const nextWorkflow: ApiWorkflowDetail = {
      ...workflow,
      definition: {
        ...workflow.definition,
        steps: [...workflow.definition.steps, nextStep],
        edges: [...workflow.definition.edges, nextEdge],
      },
    };

    pushUndoSnapshot();
    setWorkflow(normalizeWorkflow(nextWorkflow));
    setSelectedNode(nextStep.id);
    setNotice(`${nextStep.name} attached to ${parentStep.name}.`);

    persistWorkflow(nextWorkflow).catch((error) => {
      setNoticeError(error instanceof Error ? error.message : "Failed to save cluster node.");
    });
  };

  const handleExportWorkflow = useCallback(async () => {
    if (!id) return;
    try {
      const bundle = await api.exportWorkflow(id);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${workflow?.name ?? "workflow"}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice("Workflow exported.");
    } catch (exportError) {
      setNoticeError(exportError instanceof Error ? exportError.message : "Failed to export workflow.");
    }
  }, [id, workflow?.name]);

  const handleImportWorkflow = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const bundle = JSON.parse(text);
      const result = await api.importWorkflow(bundle);
      setNotice(`Imported "${result.workflow_name}" with ${result.steps_count} steps.`);
    } catch (importError) {
      setNoticeError(importError instanceof Error ? importError.message : "Failed to import workflow.");
    }
  }, []);

  const openImportPicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void handleImportWorkflow(file);
    };
    input.click();
  }, [handleImportWorkflow]);

  const commandActions = useMemo<StudioCommandAction[]>(() => {
    const actions: StudioCommandAction[] = [
      {
        id: "workflow-run",
        group: "Workflow",
        label: "Run workflow",
        description: "Execute the current workflow manually.",
        shortcut: "Ctrl+Enter",
        icon: Play,
        keywords: ["execute", "test", "manual run"],
        onSelect: handleRun,
      },
      {
        id: "workflow-publish",
        group: "Workflow",
        label: "Publish workflow",
        description: "Make the current workflow active.",
        shortcut: "Shift+P",
        icon: WorkflowIcon,
        keywords: ["deploy", "activate", "live"],
        onSelect: handlePublish,
      },
      {
        id: "workflow-settings",
        group: "Workflow",
        label: "Open workflow settings",
        description: "Edit execution and persistence behavior.",
        icon: Settings,
        keywords: ["timezone", "error workflow", "executions"],
        onSelect: () => setWorkflowSettingsOpen(true),
      },
      {
        id: "workflow-tidy",
        group: "Workflow",
        label: "Tidy up workflow",
        description: "Re-layout nodes to clean up the canvas.",
        shortcut: "Shift+Alt+T",
        icon: Rows3,
        keywords: ["layout", "organize", "canvas"],
        onSelect: handleTidyWorkflow,
      },
      {
        id: "workflow-export",
        group: "Workflow",
        label: "Export workflow",
        description: "Download the workflow as JSON.",
        icon: Activity,
        keywords: ["download", "json", "backup"],
        onSelect: handleExportWorkflow,
      },
      {
        id: "workflow-import",
        group: "Workflow",
        label: "Import workflow",
        description: "Open a JSON file and import a workflow.",
        icon: Activity,
        keywords: ["upload", "json", "restore"],
        onSelect: openImportPicker,
      },
      {
        id: "panel-assistant",
        group: "Panels",
        label: "Open AI assistant",
        description: "Open the assistant panel for workflow generation.",
        icon: Sparkles,
        keywords: ["chat", "copilot", "assistant"],
        onSelect: () => setChatOpen(true),
      },
      {
        id: "panel-nodes",
        group: "Panels",
        label: "Open node panel",
        description: "Browse and add workflow nodes.",
        shortcut: "N",
        icon: PanelLeft,
        keywords: ["nodes", "add step", "catalog"],
        onSelect: () => {
          setActiveTool("nodes");
          setNodesOpen(true);
          setChatOpen(false);
        },
      },
      {
        id: "panel-editor",
        group: "Panels",
        label: "Show editor",
        description: "Return to the workflow editor view.",
        icon: WorkflowIcon,
        keywords: ["canvas", "editor tab"],
        onSelect: () => setActiveTab("editor"),
      },
      {
        id: "panel-executions",
        group: "Panels",
        label: "Show executions",
        description: "Switch to the workflow executions tab.",
        icon: Activity,
        keywords: ["runs", "history", "debug"],
        onSelect: () => setActiveTab("executions"),
      },
      {
        id: "navigate-workflows",
        group: "Navigate",
        label: "Go to workflows",
        description: "Open the workflows dashboard.",
        icon: WorkflowIcon,
        keywords: ["dashboard", "home"],
        onSelect: () => navigate("/dashboard/workflows"),
      },
      {
        id: "navigate-templates",
        group: "Navigate",
        label: "Go to templates",
        description: "Browse workflow templates.",
        icon: BookTemplate,
        keywords: ["library", "starter templates"],
        onSelect: () => navigate("/dashboard/templates"),
      },
      {
        id: "navigate-executions",
        group: "Navigate",
        label: "Go to executions",
        description: "Open the executions dashboard.",
        icon: Activity,
        keywords: ["runs", "history"],
        onSelect: () => navigate("/dashboard/executions"),
      },
      {
        id: "navigate-settings",
        group: "Navigate",
        label: "Go to settings",
        description: "Open workspace settings.",
        icon: Settings,
        keywords: ["preferences", "workspace"],
        onSelect: () => navigate("/dashboard/settings"),
      },
    ];

    if (executions[0]) {
      actions.push({
        id: "execution-latest",
        group: "Executions",
        label: `Open latest execution (${executions[0].id.slice(0, 8)})`,
        description: "Inspect the most recent execution in the editor.",
        icon: Activity,
        keywords: ["latest", "debug", "run"],
        onSelect: () => {
          setActiveTab("executions");
          handleSelectExecution(executions[0]);
        },
      });
    }

    if (workflow) {
      workflow.definition.steps.forEach((step) => {
        actions.push({
          id: `node-${step.id}`,
          group: "Nodes",
          label: `Open node: ${step.name}`,
          description: `Focus ${step.type.replaceAll("_", " ")} on the canvas and inspector.`,
          keywords: [step.type, "select node", step.name],
          onSelect: () => {
            setActiveTab("editor");
            setChatOpen(false);
            setSelectedNode(step.id);
          },
        });
      });
    }

    return actions;
  }, [executions, handleExportWorkflow, handlePublish, handleRun, handleTidyWorkflow, navigate, openImportPicker, workflow]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (ctrl && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandBarOpen(true);
      } else if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if (ctrl && e.key === "d") {
        e.preventDefault();
        if (selectedStep) handleDuplicateStep(selectedStep);
      } else if (ctrl && e.key === "s") {
        e.preventDefault();
        if (selectedStep) handleSaveStep(selectedStep);
      } else if (ctrl && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      } else if (!ctrl && e.shiftKey && e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        handleTidyWorkflow();
      } else if (!ctrl && e.shiftKey && !e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePublish();
      } else if (!ctrl && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setActiveTool("nodes");
        setNodesOpen(true);
        setChatOpen(false);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNode) {
          e.preventDefault();
          handleDeleteStep(selectedNode);
        }
      } else if (e.key === "Escape") {
        setSelectedNode(null);
        setChatOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePublish, handleRun, handleTidyWorkflow, selectedNode, selectedStep, undoStack, redoStack, workflow]);

  if (loading) {
    return <StudioRouteLoader />;
  }

  return (
    <div className="h-screen w-screen bg-background">
      <div className="h-full w-full overflow-hidden bg-[hsl(var(--studio-bg))]">
        <div className="h-full flex flex-col">
          <TopBar
            activeTab={activeTab}
            onTabChange={handleTopBarTabChange}
            onOpenChat={() => setChatOpen(true)}
            onOpenCommandBar={() => setCommandBarOpen(true)}
            onOpenWorkflowSettings={() => setWorkflowSettingsOpen(true)}
            workflowName={workflow?.name}
            workflowStatus={workflow?.status}
            saving={saving}
            stepCount={workflow?.definition.steps.length ?? 0}
            workflowId={id}
            onRename={async (name) => {
              if (!workflow) return;
              try {
                pushUndoSnapshot();
                setSaving(true);
                setNoticeError(null);
                await persistWorkflow({ ...workflow, name }, `Renamed to ${name}.`);
              } catch (renameError) {
                setNoticeError(renameError instanceof Error ? renameError.message : "Failed to rename workflow.");
              } finally {
                setSaving(false);
              }
            }}
            onExport={handleExportWorkflow}
            onImport={handleImportWorkflow}
          />

          <div className="flex-1 flex min-h-0 bg-[#faf9f7]">
            <NodesPanel
              open={chatMaximized ? false : nodesOpen}
              onToggle={() => setNodesOpen((open) => !open)}
              activeTool={activeTool}
              onToolChange={handlePanelToolChange}
              onAddStep={handleAddStep}
              addingNode={addingNode}
              steps={workflow?.definition.steps.map((s) => ({ id: s.id, name: s.name, type: s.type })) ?? []}
              edges={workflow?.definition.edges ?? []}
              workflowId={id}
              workflowTriggerType={workflow?.trigger_type ?? null}
              onOpenChat={() => setChatOpen(true)}
              onDeleteEdge={handleDeleteEdge}
              onUpdateEdge={handleUpdateEdge}
              executions={executions}
              onSelectExecution={handleSelectExecution}
              onRetryExecution={handleRetryExecution}
            />

            <div className="relative flex flex-1 min-h-0">
              <ChatPanel
                open={chatOpen}
                maximized={chatMaximized}
                onClose={() => setChatOpen(false)}
                onToggleMaximize={() => setChatMaximized((value) => !value)}
                workflowId={id}
                workflowName={workflow?.name}
                stepCount={workflow?.definition.steps.length ?? 0}
                initialPrompt={initialPrompt}
                onAddSteps={handleAddStepsFromChat}
                onRunWorkflow={handleRun}
                onSelectNode={(stepId) => { setSelectedNode(stepId); setChatOpen(false); }}
              />

              <div className="flex-1 min-h-0 relative border-r border-slate-200">
                {loadError ? (
                  <div className="h-full flex items-center justify-center bg-[#fcfdff] px-8 text-center">
                    <div>
                      <div className="text-[15px] font-semibold text-slate-900">Unable to open studio</div>
                      <div className="mt-2 text-[12px] leading-5 text-slate-500">{loadError}</div>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={retryLoad}
                          className="h-8 px-4 rounded-lg bg-violet-600 text-[11px] font-semibold text-white hover:bg-violet-700 transition-colors"
                        >
                          Retry
                        </button>
                        <button
                          onClick={() => navigate("/studio/new")}
                          className="h-8 px-4 rounded-lg border border-violet-200 bg-violet-50 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
                        >
                          New Workflow
                        </button>
                        <button
                          onClick={() => navigate("/dashboard/workflows")}
                          className="h-8 px-4 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Back to Workflows
                        </button>
                      </div>
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
                      onAddStepBetween={handleAddStepBetween}
                      onAddClusterNode={handleAddClusterNode}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      canUndo={undoStack.length > 0}
                      canRedo={redoStack.length > 0}
                      executionSteps={canvasExecutionSteps ?? lastExecution?.steps ?? null}
                      actionLoading={actionLoading}
                      onZoomChange={setCanvasZoom}
                      onRunStep={handleRunStep}
                      onToggleStepPinned={handleToggleStepPinned}
                      onToggleStepEnabled={handleToggleStepEnabled}
                      onRenameStep={handleRenameStep}
                      onTidyWorkflow={handleTidyWorkflow}
                      stepTestPayload={canvasStepPayload}
                      onStepTestPayloadChange={setCanvasStepPayload}
                      stepTestPayloadError={canvasStepPayloadState.error}
                      lastStepTestResult={canvasStepTestResult}
                      stepHistory={canvasStepHistory}
                      stepHistoryLoading={canvasStepHistoryLoading}
                      stepHistoryError={canvasStepHistoryError}
                      selectedHistoryExecutionId={canvasHistoryExecutionId}
                      onSelectHistoryExecution={handleSelectStepHistoryExecution}
                      selectedExecutionStepDetail={canvasExecutionStepDetail}
                      selectedExecutionStepLoading={canvasExecutionStepDetailLoading}
                      selectedExecutionPause={canvasExecutionPause}
                      selectedExecutionHumanTask={canvasExecutionHumanTask}
                      historyActionLoading={canvasHistoryActionLoading}
                      onReplayHistoryExecution={handleReplayHistoryExecution}
                      onLoadHistoryOutputToEditor={handleLoadHistoryOutputToEditor}
                      onResumeHistoryExecution={handleResumeHistoryExecution}
                      onCancelHistoryExecution={handleCancelHistoryExecution}
                    />
                  </>
                )}
              </div>

              <div className={`shrink-0 overflow-hidden transition-all duration-300 ease-out ${selectedStep ? 'w-[380px] opacity-100' : 'w-0 opacity-0'}`}>
              <NodeDetailsPanel
                workflowId={id ?? null}
                workflowName={workflow?.name ?? "Workflow"}
                triggerType={workflow?.trigger_type ?? null}
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
                onSelectStep={setSelectedNode}
                onAddClusterNode={handleAddClusterNode}
                onClose={() => setSelectedNode(null)}
                onTestStep={async (step, payload) => {
                  if (!id) throw new Error("No workflow ID");
                  const result = await api.testStep(id, step, payload);
                  return {
                    status: result.status as "success" | "failed" | "error",
                    output: result.output,
                    error: result.error,
                    duration_ms: result.duration_ms,
                  };
                }}
              />
              </div>
            </div>
          </div>

          <StatusBar
            nodeCount={workflow?.definition.steps.length ?? 0}
            edgeCount={workflow?.definition.edges.length ?? 0}
            zoom={canvasZoom}
            saving={saving}
            workflowStatus={workflow?.status}
            lastSaved={lastSavedAt}
            hasErrors={Boolean(noticeError) || lastExecution?.status === "failed"}
            selectedNodeName={selectedStep?.name ?? null}
            executionOrder={workflow?.definition.settings.execution_order}
            lastExecutionStatus={lastExecution?.status ?? null}
            lastExecutionDurationMs={lastExecution?.duration_ms ?? null}
            executionCount={executions.length}
            activeTab={activeTab}
          />
        </div>

        <WorkflowSettingsModal
          open={workflowSettingsOpen}
          settings={workflow?.definition.settings ?? DEFAULT_WORKFLOW_SETTINGS}
          saving={saving}
          onClose={() => setWorkflowSettingsOpen(false)}
          onSave={handleSaveWorkflowSettings}
        />

        <StudioCommandBar
          open={commandBarOpen}
          onOpenChange={setCommandBarOpen}
          actions={commandActions}
        />
      </div>
    </div>
  );
};

export default WorkflowStudio;
