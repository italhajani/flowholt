import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Brain,
  CheckCircle2,
  Circle,
  Code,
  Copy,
  Filter,
  Globe,
  Loader2,
  GitBranch,
  Map as MapIcon,
  Maximize2,
  Merge,
  MoreHorizontal,
  Pin,
  Plus,
  Repeat,
  RotateCcw,
  Sparkles,
  Trash2,
  Webhook,
  Play,
  ZoomIn,
  ZoomOut,
  Users,
  Clock3,
  Link2,
  Send,
  Cpu,
  Database,
  Wrench,
  FileOutput,
  Power,
} from "lucide-react";
import type {
  ApiExecutionEvent,
  ApiExecutionPauseSummary,
  ApiExecutionStep,
  ApiExecutionStepInspectorResponse,
  ApiHumanTaskSummary,
  ApiStudioStepTestResponse,
  ApiWorkflowEdge,
  ApiWorkflowStep,
  ApiWorkflowStepHistoryResponse,
} from "@/lib/api";
import StudioDataViewer from "./StudioDataViewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkflowCanvasLiveProps {
  steps: ApiWorkflowStep[];
  edges: ApiWorkflowEdge[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onRun: () => void;
  onPublish: () => void;
  onDuplicate: (step: ApiWorkflowStep) => void;
  onDelete: (stepId: string) => void;
  onMove: (stepId: string, direction: "up" | "down") => void;
  onCreateConnection: (sourceId: string, targetId: string, label: "default" | "true" | "false") => void;
  onPositionChange: (
    stepId: string,
    position: { x: number; y: number },
    relatedPositions?: Array<{ id: string; position: { x: number; y: number } }>,
  ) => void;
  onAddStepBetween?: (sourceId: string, targetId: string) => void;
  onAddClusterNode?: (rootId: string, slotKey: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  executionSteps: ApiExecutionStep[] | null;
  actionLoading: "run" | "publish" | null;
  onZoomChange?: (zoom: number) => void;
  onRunStep?: (stepId: string) => void;
  onToggleStepPinned?: (stepId: string) => void;
  onToggleStepEnabled?: (stepId: string) => void;
  onRenameStep?: (stepId: string, name: string) => void;
  onTidyWorkflow?: () => void;
  stepTestPayload: string;
  onStepTestPayloadChange: (value: string) => void;
  stepTestPayloadError?: string | null;
  lastStepTestResult?: { stepId: string; result: ApiStudioStepTestResponse } | null;
  stepHistory?: ApiWorkflowStepHistoryResponse | null;
  stepHistoryLoading?: boolean;
  stepHistoryError?: string | null;
  selectedHistoryExecutionId?: string | null;
  onSelectHistoryExecution?: (executionId: string) => void;
  selectedExecutionStepDetail?: ApiExecutionStepInspectorResponse | null;
  selectedExecutionStepLoading?: boolean;
  selectedExecutionPause?: ApiExecutionPauseSummary | null;
  selectedExecutionHumanTask?: ApiHumanTaskSummary | null;
  historyActionLoading?: "replay" | "resume" | "cancel" | "pin" | null;
  onReplayHistoryExecution?: (executionId: string, mode: "same_version" | "latest_published" | "current_draft") => void | Promise<void>;
  onLoadHistoryOutputToEditor?: (executionId: string) => void | Promise<void>;
  onResumeHistoryExecution?: (
    executionId: string,
    options: {
      taskId?: string;
      decision?: string | null;
      comment?: string | null;
      payload?: Record<string, unknown>;
    },
  ) => void | Promise<void>;
  onCancelHistoryExecution?: (
    executionId: string,
    options: { taskId?: string; comment?: string | null },
  ) => void | Promise<void>;
}

interface CanvasNode extends ApiWorkflowStep {
  x: number;
  y: number;
  width: number;
  height: number;
  accent: string;
  subtitle: string;
  incomingLabel?: string;
}

const typeMeta: Record<string, { icon: React.ElementType; accent: string; subtitle: string; bg: string; border: string; iconBg: string; accentColor: string }> = {
  trigger: { icon: Webhook, accent: "from-sky-500 to-blue-500", subtitle: "Trigger", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-500", accentColor: "#3b82f6" },
  transform: { icon: Sparkles, accent: "from-amber-400 to-orange-500", subtitle: "Transform", bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-500", accentColor: "#f59e0b" },
  condition: { icon: GitBranch, accent: "from-emerald-500 to-green-500", subtitle: "Condition", bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-500", accentColor: "#10b981" },
  llm: { icon: Bot, accent: "from-violet-500 to-purple-600", subtitle: "AI", bg: "bg-violet-50", border: "border-violet-200", iconBg: "bg-violet-500", accentColor: "#8b5cf6" },
  output: { icon: Send, accent: "from-rose-500 to-pink-500", subtitle: "Output", bg: "bg-rose-50", border: "border-rose-200", iconBg: "bg-rose-500", accentColor: "#f43f5e" },
  delay: { icon: Clock3, accent: "from-slate-400 to-slate-600", subtitle: "Delay", bg: "bg-slate-50", border: "border-slate-200", iconBg: "bg-slate-500", accentColor: "#64748b" },
  human: { icon: Users, accent: "from-fuchsia-500 to-pink-600", subtitle: "Human Task", bg: "bg-fuchsia-50", border: "border-fuchsia-200", iconBg: "bg-fuchsia-500", accentColor: "#d946ef" },
  callback: { icon: Link2, accent: "from-cyan-500 to-teal-500", subtitle: "Callback", bg: "bg-cyan-50", border: "border-cyan-200", iconBg: "bg-cyan-500", accentColor: "#06b6d4" },
  loop: { icon: Repeat, accent: "from-indigo-500 to-blue-500", subtitle: "Loop", bg: "bg-indigo-50", border: "border-indigo-200", iconBg: "bg-indigo-500", accentColor: "#6366f1" },
  code: { icon: Code, accent: "from-emerald-500 to-teal-600", subtitle: "Code", bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-600", accentColor: "#059669" },
  http_request: { icon: Globe, accent: "from-orange-500 to-red-500", subtitle: "HTTP Request", bg: "bg-orange-50", border: "border-orange-200", iconBg: "bg-orange-500", accentColor: "#f97316" },
  filter: { icon: Filter, accent: "from-purple-500 to-indigo-600", subtitle: "Filter", bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-500", accentColor: "#a855f7" },
  merge: { icon: Merge, accent: "from-teal-500 to-cyan-600", subtitle: "Merge", bg: "bg-teal-50", border: "border-teal-200", iconBg: "bg-teal-500", accentColor: "#14b8a6" },
  ai_agent: { icon: Brain, accent: "from-purple-600 to-violet-700", subtitle: "AI Agent", bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-600", accentColor: "#9333ea" },
  ai_summarize: { icon: Sparkles, accent: "from-purple-500 to-violet-600", subtitle: "Summarization Chain", bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-500", accentColor: "#a855f7" },
  ai_extract: { icon: FileOutput, accent: "from-blue-500 to-indigo-600", subtitle: "Information Extractor", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-500", accentColor: "#3b82f6" },
  ai_classify: { icon: Filter, accent: "from-fuchsia-500 to-purple-600", subtitle: "Text Classifier", bg: "bg-fuchsia-50", border: "border-fuchsia-200", iconBg: "bg-fuchsia-500", accentColor: "#d946ef" },
  ai_sentiment: { icon: Bot, accent: "from-pink-500 to-rose-600", subtitle: "Sentiment Analysis", bg: "bg-pink-50", border: "border-pink-200", iconBg: "bg-pink-500", accentColor: "#ec4899" },
  ai_chat_model: { icon: Cpu, accent: "from-violet-500 to-purple-600", subtitle: "Cluster Model", bg: "bg-violet-50", border: "border-violet-200", iconBg: "bg-violet-500", accentColor: "#8b5cf6" },
  ai_memory: { icon: Database, accent: "from-emerald-500 to-teal-600", subtitle: "Cluster Memory", bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-500", accentColor: "#10b981" },
  ai_tool: { icon: Wrench, accent: "from-amber-500 to-orange-600", subtitle: "Cluster Tool", bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-500", accentColor: "#f59e0b" },
  ai_output_parser: { icon: FileOutput, accent: "from-rose-500 to-pink-600", subtitle: "Output Parser", bg: "bg-rose-50", border: "border-rose-200", iconBg: "bg-rose-500", accentColor: "#f43f5e" },
};

const getTypeMeta = (type: string) => typeMeta[type] ?? typeMeta.transform;

/* ── n8n-style sub-node cluster slots ────────────────────────────────────
   Each root cluster node declares named connector slots that appear as small
   labeled "+" pills below the card.  Based on the n8n cluster-node
   architecture: AI Agent accepts Model / Memory / Tool / Output Parser;
   other AI chain nodes accept a subset.  */
interface SubNodeSlot {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;       // tailwind text colour class
  borderColor: string; // tailwind border colour class
  bgHover: string;     // tailwind bg on hover
}
const SUB_NODE_SLOTS: Record<string, SubNodeSlot[]> = {
  ai_agent: [
    { key: "model", label: "Model",         icon: Cpu,        color: "text-violet-600", borderColor: "border-violet-300", bgHover: "hover:bg-violet-50"  },
    { key: "memory", label: "Memory",        icon: Database,   color: "text-emerald-600", borderColor: "border-emerald-300", bgHover: "hover:bg-emerald-50" },
    { key: "tool", label: "Tool",          icon: Wrench,     color: "text-amber-600",  borderColor: "border-amber-300",  bgHover: "hover:bg-amber-50"   },
    { key: "output_parser", label: "Output Parser", icon: FileOutput, color: "text-rose-600",   borderColor: "border-rose-300",   bgHover: "hover:bg-rose-50"    },
  ],
  ai_summarize: [
    { key: "model", label: "Model", icon: Cpu, color: "text-violet-600", borderColor: "border-violet-300", bgHover: "hover:bg-violet-50" },
  ],
  ai_extract: [
    { key: "model", label: "Model",         icon: Cpu,        color: "text-violet-600", borderColor: "border-violet-300", bgHover: "hover:bg-violet-50" },
    { key: "output_parser", label: "Output Parser", icon: FileOutput, color: "text-rose-600",   borderColor: "border-rose-300",   bgHover: "hover:bg-rose-50"   },
  ],
  ai_classify: [
    { key: "model", label: "Model",         icon: Cpu,        color: "text-violet-600", borderColor: "border-violet-300", bgHover: "hover:bg-violet-50" },
    { key: "output_parser", label: "Output Parser", icon: FileOutput, color: "text-rose-600",   borderColor: "border-rose-300",   bgHover: "hover:bg-rose-50"   },
  ],
  ai_sentiment: [
    { key: "model", label: "Model", icon: Cpu, color: "text-violet-600", borderColor: "border-violet-300", bgHover: "hover:bg-violet-50" },
  ],
};

const isClusterEdge = (label?: string | null) => (label ?? "").toLowerCase().startsWith("cluster:");

const formatClusterSlot = (slot: string) =>
  slot
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getSlotIndex = (parentType: string, slotKey: string) =>
  Math.max(
    0,
    SUB_NODE_SLOTS[parentType]?.findIndex((slot) => slot.key === slotKey) ?? 0,
  );

const extractSummary = (step: ApiWorkflowStep) => {
  const config = step.config ?? {};
  if (typeof config.cluster_slot === "string" && config.cluster_slot.trim()) return `Attached ${formatClusterSlot(config.cluster_slot)} node`;
  if (typeof config.prompt === "string" && config.prompt.trim()) return config.prompt.trim();
  if (typeof config.template === "string" && config.template.trim()) return config.template.trim();
  if (typeof config.field === "string" && typeof config.equals === "string") return `${config.field} matches ${config.equals}`;
  if (typeof config.channel === "string" && config.channel.trim()) return `Routes to ${config.channel}`;
  if (typeof config.destination === "string" && config.destination.trim()) return `Sends to ${config.destination}`;
  return "Configure this step in the right panel.";
};

const formatPanelTimestamp = (value: string | null | undefined) => {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

type HistoryPhase = "lifecycle" | "wait" | "human" | "output" | "error" | "system";

const HISTORY_PHASE_ORDER: HistoryPhase[] = ["lifecycle", "wait", "human", "output", "error", "system"];

const getHistoryPhaseMeta = (event: ApiExecutionEvent): {
  phase: HistoryPhase;
  label: string;
  tone: string;
} => {
  if ((event.status ?? "") === "failed" || event.event_type.includes("error")) {
    return { phase: "error", label: "Errors", tone: "bg-red-50 text-red-700 border-red-200" };
  }
  if (event.event_type.startsWith("human_task.")) {
    return { phase: "human", label: "Human Task", tone: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" };
  }
  if (event.event_type.includes("paused") || event.event_type.includes("resume") || event.event_type.includes("cancelled")) {
    return { phase: "wait", label: "Wait State", tone: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (event.event_type.startsWith("step.") || event.event_type.includes("finished")) {
    return { phase: "output", label: "Step Output", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  if (event.event_type.startsWith("execution.")) {
    return { phase: "lifecycle", label: "Lifecycle", tone: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  return { phase: "system", label: "System", tone: "bg-slate-100 text-slate-700 border-slate-200" };
};

const buildCanvasNodes = (steps: ApiWorkflowStep[], edges: ApiWorkflowEdge[]): CanvasNode[] => {
  const nodes: CanvasNode[] = [];
  const columnGap = 260;
  const rowGap = 180;
  let x = 84;
  let y = 96;
  const incomingByTarget = new Map(edges.map((edge) => [edge.target, edge]));

  steps.forEach((step) => {
    const meta = getTypeMeta(step.type);
    const width = 220;
    const storedPosition =
      typeof step.config?.ui_position === "object" && step.config?.ui_position !== null
        ? (step.config.ui_position as { x?: number; y?: number })
        : null;

    const node: CanvasNode = {
      ...step,
      x: storedPosition?.x ?? x,
      y: storedPosition?.y ?? y,
      width: typeof step.config?.cluster_parent_id === "string" ? 208 : width,
      height: typeof step.config?.cluster_parent_id === "string" ? 72 : 80,
      accent: meta.accent,
      subtitle: meta.subtitle,
      incomingLabel: isClusterEdge(incomingByTarget.get(step.id)?.label) ? undefined : incomingByTarget.get(step.id)?.label ?? undefined,
    };

    if (!storedPosition) {
      const incomingEdge = incomingByTarget.get(step.id);
      const parent = incomingEdge ? nodes.find((item) => item.id === incomingEdge.source) : null;
      const clusterParentId = typeof step.config?.cluster_parent_id === "string" ? step.config.cluster_parent_id : null;
      const clusterSlot = typeof step.config?.cluster_slot === "string" ? step.config.cluster_slot : "model";

      if (clusterParentId) {
        const clusterParent = nodes.find((item) => item.id === clusterParentId);
        if (clusterParent) {
          const siblingCount = nodes.filter(
            (item) => item.config?.cluster_parent_id === clusterParentId && item.config?.cluster_slot === clusterSlot,
          ).length;
          node.x = clusterParent.x + 24 + getSlotIndex(clusterParent.type, clusterSlot) * 28;
          node.y = clusterParent.y + 126 + siblingCount * 92;
        }
      } else if (parent) {
        const label = (incomingEdge?.label ?? "").toLowerCase();
        if (label === "true") {
          node.x = parent.x + 36;
          node.y = parent.y + rowGap;
        } else if (label === "false") {
          node.x = parent.x + columnGap + 52;
          node.y = parent.y + rowGap;
        } else {
          node.x = parent.x + columnGap;
          node.y = parent.y;
        }
      }

      x += columnGap;
      if (x > 760) {
        x = 84;
        y += rowGap;
      }
    }

    nodes.push(node);
  });

  return nodes;
};

const WorkflowCanvasLive: React.FC<WorkflowCanvasLiveProps> = ({
  steps,
  edges,
  selectedNodeId,
  onNodeSelect,
  onRun,
  onPublish,
  actionLoading,
  onDuplicate,
  onDelete,
  onMove,
  onCreateConnection,
  onPositionChange,
  onAddStepBetween,
  onAddClusterNode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  executionSteps,
  onZoomChange,
  onRunStep,
  onToggleStepPinned,
  onToggleStepEnabled,
  onRenameStep,
  onTidyWorkflow,
  stepTestPayload,
  onStepTestPayloadChange,
  stepTestPayloadError,
  lastStepTestResult,
  stepHistory,
  stepHistoryLoading,
  stepHistoryError,
  selectedHistoryExecutionId,
  onSelectHistoryExecution,
  selectedExecutionStepDetail,
  selectedExecutionStepLoading,
  selectedExecutionPause,
  selectedExecutionHumanTask,
  historyActionLoading,
  onReplayHistoryExecution,
  onLoadHistoryOutputToEditor,
  onResumeHistoryExecution,
  onCancelHistoryExecution,
}) => {
  const [zoom, setZoom] = useState(92);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragNodes, setDragNodes] = useState<CanvasNode[]>([]);
  const [connectMode, setConnectMode] = useState<{ sourceId: string; label: "default" | "true" | "false" } | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [panelMode, setPanelMode] = useState<"test" | "history">("test");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [artifactDirectionFilter, setArtifactDirectionFilter] = useState<"all" | "input" | "output" | "state" | "error" | "summary" | "pause">("all");
  const [artifactTypeFilter, setArtifactTypeFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("all");
  const [selectedHistoryEventId, setSelectedHistoryEventId] = useState<string | null>(null);
  const [historyActionComment, setHistoryActionComment] = useState("");
  const [historyActionPayload, setHistoryActionPayload] = useState("{\n}");
  const [humanDecision, setHumanDecision] = useState("");
  const [replayMode, setReplayMode] = useState<"same_version" | "latest_published" | "current_draft">("same_version");
  const scale = zoom / 100;
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null);
  const dragRef = useRef<{
    mouseX: number;
    mouseY: number;
    nodeX: number;
    nodeY: number;
    moved: boolean;
    linkedNodes: Array<{ id: string; nodeX: number; nodeY: number }>;
  } | null>(null);
  const seenNodesRef = useRef(new Set<string>());

  const canvasNodes = useMemo<CanvasNode[]>(() => buildCanvasNodes(steps, edges), [edges, steps]);
  const stepNameById = useMemo(() => new Map(steps.map((step) => [step.id, step.name])), [steps]);
  const traceStepNames = useMemo(
    () => lastStepTestResult?.result.executed_step_ids.map((stepId) => stepNameById.get(stepId) ?? stepId) ?? [],
    [lastStepTestResult, stepNameById],
  );
  const panelNode = useMemo(() => {
    const targetId = selectedNodeId ?? lastStepTestResult?.stepId ?? null;
    return targetId ? dragNodes.find((node) => node.id === targetId) ?? null : null;
  }, [dragNodes, lastStepTestResult?.stepId, selectedNodeId]);
  const selectedHistoryEntry = useMemo(
    () => stepHistory?.entries.find((entry) => entry.execution_id === selectedHistoryExecutionId) ?? null,
    [selectedHistoryExecutionId, stepHistory],
  );
  const historyEditorPayload = useMemo(() => {
    const latestOutput = selectedExecutionStepDetail?.latest_output ?? {};
    if (Object.keys(latestOutput).length > 0) return latestOutput;

    const resultOutput = selectedExecutionStepDetail?.result?.output ?? null;
    if (resultOutput && typeof resultOutput === "object") return resultOutput;

    const entryOutput = selectedHistoryEntry?.output ?? null;
    if (entryOutput && typeof entryOutput === "object" && Object.keys(entryOutput).length > 0) return entryOutput;

    return null;
  }, [selectedExecutionStepDetail, selectedHistoryEntry]);
  const historyLiveRefreshActive = useMemo(
    () => selectedHistoryEntry?.execution_status === "running"
      || selectedHistoryEntry?.execution_status === "paused"
      || selectedExecutionPause?.status === "paused",
    [selectedExecutionPause?.status, selectedHistoryEntry?.execution_status],
  );
  const stepTestOutput = lastStepTestResult?.result.target_step_result?.output ?? lastStepTestResult?.result.preview?.sample_output ?? null;
  const historyActionPayloadState = useMemo(() => {
    const trimmed = historyActionPayload.trim();
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
  }, [historyActionPayload]);
  const filteredArtifacts = useMemo(() => {
    const artifacts = selectedExecutionStepDetail?.artifacts ?? [];
    return artifacts.filter((artifact) => {
      if (artifactDirectionFilter !== "all" && artifact.direction !== artifactDirectionFilter) return false;
      if (artifactTypeFilter !== "all" && artifact.artifact_type !== artifactTypeFilter) return false;
      return true;
    });
  }, [artifactDirectionFilter, artifactTypeFilter, selectedExecutionStepDetail]);
  const artifactDirections = useMemo(
    () => Array.from(new Set((selectedExecutionStepDetail?.artifacts ?? []).map((artifact) => artifact.direction))),
    [selectedExecutionStepDetail],
  );
  const artifactTypes = useMemo(
    () => Array.from(new Set((selectedExecutionStepDetail?.artifacts ?? []).map((artifact) => artifact.artifact_type))).sort(),
    [selectedExecutionStepDetail],
  );
  const selectedArtifact = useMemo(() => {
    if (!filteredArtifacts.length) return null;
    return filteredArtifacts.find((artifact) => artifact.id === selectedArtifactId)
      ?? filteredArtifacts[0]
      ?? null;
  }, [filteredArtifacts, selectedArtifactId]);
  const eventTypes = useMemo(
    () => Array.from(new Set((selectedExecutionStepDetail?.events ?? []).map((event) => event.event_type))).sort(),
    [selectedExecutionStepDetail],
  );
  const eventStatuses = useMemo(
    () => Array.from(new Set((selectedExecutionStepDetail?.events ?? []).map((event) => event.status).filter(Boolean) as string[])).sort(),
    [selectedExecutionStepDetail],
  );
  const filteredEvents = useMemo(() => {
    const events = selectedExecutionStepDetail?.events ?? [];
    return events.filter((event) => {
      if (eventTypeFilter !== "all" && event.event_type !== eventTypeFilter) return false;
      if (eventStatusFilter !== "all" && (event.status ?? "") !== eventStatusFilter) return false;
      return true;
    });
  }, [eventStatusFilter, eventTypeFilter, selectedExecutionStepDetail]);
  const selectedHistoryEvent = useMemo(() => {
    if (!filteredEvents.length) return null;
    return filteredEvents.find((event) => event.id === selectedHistoryEventId) ?? filteredEvents[0] ?? null;
  }, [filteredEvents, selectedHistoryEventId]);
  const groupedHistoryEvents = useMemo(() => {
    const groups = new Map<HistoryPhase, ApiExecutionEvent[]>();
    filteredEvents.forEach((event) => {
      const { phase } = getHistoryPhaseMeta(event);
      const existing = groups.get(phase) ?? [];
      existing.push(event);
      groups.set(phase, existing);
    });
    return HISTORY_PHASE_ORDER
      .map((phase) => {
        const events = groups.get(phase) ?? [];
        if (!events.length) return null;
        const meta = getHistoryPhaseMeta(events[0]);
        return { ...meta, events };
      })
      .filter((group): group is { phase: HistoryPhase; label: string; tone: string; events: ApiExecutionEvent[] } => Boolean(group));
  }, [filteredEvents]);

  useEffect(() => {
    setDragNodes(canvasNodes);
  }, [canvasNodes]);

  useEffect(() => {
    if (!filteredArtifacts.length) {
      setSelectedArtifactId(null);
      return;
    }
    setSelectedArtifactId((current) => {
      if (current && filteredArtifacts.some((artifact) => artifact.id === current)) return current;
      return filteredArtifacts[0]?.id ?? null;
    });
  }, [filteredArtifacts]);

  useEffect(() => {
    if (!filteredEvents.length) {
      setSelectedHistoryEventId(null);
      return;
    }
    setSelectedHistoryEventId((current) => {
      if (current && filteredEvents.some((event) => event.id === current)) return current;
      return filteredEvents[0]?.id ?? null;
    });
  }, [filteredEvents]);

  useEffect(() => {
    setArtifactDirectionFilter("all");
    setArtifactTypeFilter("all");
    setEventTypeFilter("all");
    setEventStatusFilter("all");
    setSelectedHistoryEventId(null);
    setHistoryActionComment("");
    setHistoryActionPayload("{\n}");
    setReplayMode("same_version");
  }, [selectedHistoryExecutionId]);

  useEffect(() => {
    if (selectedExecutionHumanTask?.choices.length) {
      setHumanDecision(selectedExecutionHumanTask.choices[0] ?? "");
      return;
    }
    setHumanDecision(selectedExecutionHumanTask?.decision ?? "");
  }, [selectedExecutionHumanTask]);

  useEffect(() => {
    if (lastStepTestResult) {
      setPanelMode("test");
      return;
    }
    if (stepHistory?.entries.length) {
      setPanelMode("history");
    }
  }, [lastStepTestResult, stepHistory]);

  useEffect(() => {
    if (!renamingNodeId) return;
    if (!dragNodes.some((node) => node.id === renamingNodeId)) {
      setRenamingNodeId(null);
      setRenameDraft("");
    }
  }, [dragNodes, renamingNodeId]);

  useEffect(() => {
    onZoomChange?.(zoom);
  }, [onZoomChange, zoom]);

  const startRename = useCallback((node: CanvasNode) => {
    setRenamingNodeId(node.id);
    setRenameDraft(node.name);
    onNodeSelect(node.id);
  }, [onNodeSelect]);

  const commitRename = useCallback((stepId: string) => {
    const trimmed = renameDraft.trim();
    const currentNode = dragNodes.find((node) => node.id === stepId);
    if (!currentNode) {
      setRenamingNodeId(null);
      setRenameDraft("");
      return;
    }
    if (!trimmed || trimmed === currentNode.name) {
      setRenamingNodeId(null);
      setRenameDraft("");
      return;
    }
    onRenameStep?.(stepId, trimmed);
    setRenamingNodeId(null);
    setRenameDraft("");
  }, [dragNodes, onRenameStep, renameDraft]);

  const canvasWidth = 4000;
  const canvasHeight = 3000;

  useEffect(() => {
    if (!isPanning && !draggingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.mouseX;
        const dy = e.clientY - panStartRef.current.mouseY;
        setPanOffset({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
      }
      if (draggingId && dragRef.current) {
        const dx = (e.clientX - dragRef.current.mouseX) / scale;
        const dy = (e.clientY - dragRef.current.mouseY) / scale;
        if (!dragRef.current.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          dragRef.current.moved = true;
        }
        const snapNodeX = dragRef.current.nodeX;
        const snapNodeY = dragRef.current.nodeY;
        const linkedNodes = new Map(
          dragRef.current.linkedNodes.map((node) => [node.id, node]),
        );
        setDragNodes((current) =>
          current.map((node) =>
            node.id === draggingId
              ? { ...node, x: snapNodeX + dx, y: snapNodeY + dy }
              : linkedNodes.has(node.id)
                ? {
                    ...node,
                    x: (linkedNodes.get(node.id)?.nodeX ?? node.x) + dx,
                    y: (linkedNodes.get(node.id)?.nodeY ?? node.y) + dy,
                  }
              : node,
          ),
        );
      }
    };

    const handleMouseUp = () => {
      if (draggingId && dragRef.current?.moved) {
        setDragNodes((current) => {
          const movedNode = current.find((n) => n.id === draggingId);
          if (movedNode) {
            const relatedPositions = dragRef.current?.linkedNodes
              .map((linked) => {
                const linkedNode = current.find((node) => node.id === linked.id);
                if (!linkedNode) return null;
                return {
                  id: linkedNode.id,
                  position: { x: Math.round(linkedNode.x), y: Math.round(linkedNode.y) },
                };
              })
              .filter((node): node is { id: string; position: { x: number; y: number } } => node !== null);
            onPositionChange(
              movedNode.id,
              { x: Math.round(movedNode.x), y: Math.round(movedNode.y) },
              relatedPositions,
            );
          }
          return current;
        });
      }
      setDraggingId(null);
      dragRef.current = null;
      setIsPanning(false);
      panStartRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning, draggingId, scale, onPositionChange]);

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{
        cursor: isPanning ? 'grabbing' : draggingId ? 'default' : connectMode ? 'crosshair' : 'grab',
        backgroundColor: '#f5f5f0',
      }}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (target.closest('[data-node-card]') || target.closest('[data-node-action]') || target.closest('[data-minimap]')) return;
        e.preventDefault();
        onNodeSelect(null);
        setConnectMode(null);
        setIsPanning(true);
        panStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, panX: panOffset.x, panY: panOffset.y };
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: `${panOffset.x % 20}px ${panOffset.y % 20}px`,
        }}
      />

      <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
        <div
          className="relative group"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            willChange: isPanning ? 'transform' : 'auto',
          }}
        >
          <svg className="absolute inset-0 pointer-events-none" width={canvasWidth} height={canvasHeight}>
            <defs>
              <linearGradient id="edge-flow-success" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="edge-flow-failed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
              <linearGradient id="edge-flow-paused" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fcd34d" />
              </linearGradient>
              <linearGradient id="edge-flow-skipped" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            {edges.map((edge) => {
              const node = dragNodes.find((item) => item.id === edge.source);
              const next = dragNodes.find((item) => item.id === edge.target);
              if (!node || !next) return null;
              const clusterConnection = isClusterEdge(edge.label);
              const startX = node.x + node.width;
              const startY = node.y + node.height / 2;
              const endX = next.x;
              const endY = next.y + next.height / 2;
              const midX = startX + (endX - startX) / 2;
              const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

              const sourceExec = executionSteps?.find((s) => s.name === node.name);
              const targetExec = executionSteps?.find((s) => s.name === next.name);
              const branchLabel = (edge.label ?? "").toLowerCase();
              const edgeStatus = sourceExec && targetExec
                ? (targetExec.status === "failed"
                    ? "failed"
                    : targetExec.status === "paused"
                      ? "paused"
                      : targetExec.status === "skipped"
                        ? "skipped"
                        : "success")
                : null;
              const branchNotTaken = !clusterConnection && Boolean(sourceExec) && !targetExec && (branchLabel === "true" || branchLabel === "false");
              const baseStroke = clusterConnection
                ? "#d8b4fe"
                : branchNotTaken
                  ? branchLabel === "true"
                    ? "#bbf7d0"
                    : "#fde68a"
                  : edgeStatus === "failed"
                    ? "#fca5a5"
                    : edgeStatus === "paused"
                      ? "#fcd34d"
                      : edgeStatus === "skipped"
                        ? "#cbd5e1"
                        : branchLabel === "true" && edgeStatus
                          ? "#4ade80"
                          : branchLabel === "false" && edgeStatus
                            ? "#fbbf24"
                            : edgeStatus
                              ? "#86efac"
                              : "#cbd5e1";

              return (
                <g key={edge.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={baseStroke}
                    strokeWidth={clusterConnection ? "2" : "1.5"}
                    strokeLinecap="round"
                    strokeDasharray={clusterConnection ? "5 5" : branchNotTaken || edgeStatus === "skipped" ? "4 6" : undefined}
                    opacity={branchNotTaken ? 0.75 : 1}
                  />
                  {edgeStatus && !clusterConnection && (
                    <path
                      d={d}
                      fill="none"
                      stroke={`url(#edge-flow-${edgeStatus})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="6 10"
                      className="animate-[dash_1.5s_linear_infinite]"
                    />
                  )}
                  {edge.label && !clusterConnection && (
                    (() => {
                      const lbl = (edge.label ?? "").toLowerCase();
                      const pillBg = lbl === "true" ? "#dcfce7" : lbl === "false" ? "#fef3c7" : "#f1f5f9";
                      const pillColor = lbl === "true" ? "#15803d" : lbl === "false" ? "#b45309" : "#64748b";
                      const pillW = Math.max(edge.label.length * 7 + 16, 40);
                      return (
                        <foreignObject x={midX - pillW / 2} y={Math.min(startY, endY) - 22} width={pillW} height={22}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                            <span style={{ background: pillBg, color: pillColor, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
                              {edge.label}
                            </span>
                          </div>
                        </foreignObject>
                      );
                    })()
                  )}
                </g>
              );
            })}
          </svg>

          {/* Inline add-node buttons on edges */}
          {onAddStepBetween && edges.filter((edge) => !isClusterEdge(edge.label)).map((edge) => {
            const sourceNode = dragNodes.find((item) => item.id === edge.source);
            const targetNode = dragNodes.find((item) => item.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            const btnX = sourceNode.x + sourceNode.width + (targetNode.x - sourceNode.x - sourceNode.width) / 2;
            const btnY = (sourceNode.y + sourceNode.height / 2 + targetNode.y + targetNode.height / 2) / 2;
            return (
              <button
                key={`add-${edge.id}`}
                onClick={(e) => { e.stopPropagation(); onAddStepBetween(edge.source, edge.target); }}
                data-node-action="true"
                className="absolute z-10 w-7 h-7 rounded-full border-2 border-violet-200 bg-white flex items-center justify-center text-violet-500 hover:bg-violet-50 hover:border-violet-400 hover:scale-110 transition-all opacity-0 hover:opacity-100 group-hover:opacity-60"
                style={{ left: btnX - 14, top: btnY - 14 }}
                title="Insert step here"
              >
                <Plus size={14} />
              </button>
            );
          })}

          {dragNodes.map((node) => {
            const meta = getTypeMeta(node.type);
            const Icon = meta.icon;
            const selected = node.id === selectedNodeId;
            const summary = extractSummary(node);
            const executionState = executionSteps?.find((step) => step.name === node.name) ?? null;
            const executionIndex = executionSteps?.findIndex((step) => step.name === node.name) ?? -1;
            const awaitingConnection = connectMode !== null && connectMode.sourceId !== node.id;
            const isClusterSubNode = typeof node.config?.cluster_parent_id === "string";
            const clusterSlot = typeof node.config?.cluster_slot === "string" ? node.config.cluster_slot : null;
            const clusterChildrenCount = edges.filter((edge) => edge.source === node.id && isClusterEdge(edge.label)).length;
            const slotAttachments = (SUB_NODE_SLOTS[node.type] ?? []).reduce<Record<string, ApiWorkflowStep[]>>((acc, slot) => {
              acc[slot.key] = dragNodes
                .filter((item) => item.config?.cluster_parent_id === node.id && item.config?.cluster_slot === slot.key)
                .sort((left, right) => left.name.localeCompare(right.name));
              return acc;
            }, {});
            const hasPinnedData = Object.prototype.hasOwnProperty.call(node.config ?? {}, "_pinned_data");
            const isEnabled = node.config?._enabled !== false;
            const displayNote = node.config?._display_note === true && typeof node.config?._notes === "string" && node.config._notes.trim().length > 0;
            const nodeNote = displayNote ? String(node.config?._notes).trim() : null;
            const pauseState = selectedExecutionPause?.step_id === node.id ? selectedExecutionPause : null;
            const isNew = !seenNodesRef.current.has(node.id);
            if (isNew) requestAnimationFrame(() => seenNodesRef.current.add(node.id));

            return (
              <div
                key={node.id}
                data-node-card="true"
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  if (connectMode && connectMode.sourceId !== node.id) {
                    onCreateConnection(connectMode.sourceId, node.id, connectMode.label);
                    setConnectMode(null);
                  }
                  onNodeSelect(node.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onNodeSelect(node.id);
                  }
                }}
                onMouseDown={(event) => {
                  if ((event.target as HTMLElement).closest("[data-node-action='true']")) return;
                  if (connectMode) return;
                  event.preventDefault();
                  event.stopPropagation();
                  const linkedNodes = dragNodes
                    .filter((item) => item.config?.cluster_parent_id === node.id)
                    .map((item) => ({ id: item.id, nodeX: item.x, nodeY: item.y }));
                  setDraggingId(node.id);
                  dragRef.current = {
                    mouseX: event.clientX,
                    mouseY: event.clientY,
                    nodeX: node.x,
                    nodeY: node.y,
                    moved: false,
                    linkedNodes,
                  };
                }}
                className={`absolute group/node transition-shadow duration-200 ease-out ${
                  isNew ? "animate-node-appear" : ""
                }`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  cursor: connectMode ? (awaitingConnection ? "copy" : "default") : draggingId === node.id ? "grabbing" : "pointer",
                  zIndex: draggingId === node.id ? 5 : selected ? 4 : 1,
                  opacity: isEnabled ? 1 : 0.72,
                }}
              >
                {!isClusterSubNode && (
                  <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full border-2 border-slate-300 bg-white z-10 transition-colors duration-200 group-hover/node:border-slate-400 group-hover/node:scale-110" />
                )}

                {executionIndex >= 0 && (
                  <div className="absolute -left-2.5 -top-2.5 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-1 text-[10px] font-semibold text-violet-700 shadow-sm">
                    {executionIndex + 1}
                  </div>
                )}

                {/* Main card — n8n style with colored left accent */}
                <div
                  className={`rounded-[10px] bg-white overflow-hidden transition-all duration-200 ease-out ${
                    selected
                      ? "ring-[2.5px] ring-blue-400/40"
                      : executionState?.status === "success"
                        ? "ring-[2px] ring-emerald-300/50"
                          : executionState?.status === "failed"
                          ? "ring-[2px] ring-red-300/50"
                            : executionState?.status === "paused"
                              ? "ring-[2px] ring-amber-300/60"
                          : ""
                  }`}
                  style={{
                    boxShadow: selected
                      ? '0 4px 12px rgba(59,130,246,0.15), 0 1px 3px rgba(0,0,0,0.06)'
                      : '0 1px 4px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.12)',
                    border: `1.5px solid ${!isEnabled ? '#cbd5e1' : selected ? '#93c5fd' : executionState?.status === 'success' ? '#86efac' : executionState?.status === 'failed' ? '#fca5a5' : executionState?.status === 'paused' ? '#fcd34d' : '#e2e8f0'}`,
                    filter: isEnabled ? 'none' : 'grayscale(0.18)',
                  }}
                >
                  <div className="flex">
                    {/* Colored left accent bar */}
                    <div className="w-[4px] shrink-0" style={{ background: meta.accentColor }} />

                    {/* Card content */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: icon + name + status */}
                      <div className="px-3 py-2.5 flex items-center gap-2.5">
                        {/* Icon — square rounded like n8n */}
                        <div
                          className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ background: meta.accentColor }}
                        >
                          <Icon size={16} strokeWidth={2} />
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          {renamingNodeId === node.id ? (
                            <div className="space-y-1" data-node-action="true">
                              <input
                                autoFocus
                                value={renameDraft}
                                onChange={(event) => setRenameDraft(event.target.value)}
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => event.stopPropagation()}
                                onBlur={() => commitRename(node.id)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    commitRename(node.id);
                                  }
                                  if (event.key === "Escape") {
                                    event.preventDefault();
                                    setRenamingNodeId(null);
                                    setRenameDraft("");
                                  }
                                }}
                                className="h-7 w-full rounded-md border border-blue-200 bg-blue-50 px-2 text-[12px] font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                            </div>
                          ) : (
                            <div className="text-[12.5px] font-semibold text-slate-800 truncate leading-tight">{node.name}</div>
                          )}
                          <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{meta.subtitle}</div>
                        </div>

                        {clusterSlot && (
                          <span className="shrink-0 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[9px] font-semibold text-violet-700">
                            {formatClusterSlot(clusterSlot)}
                          </span>
                        )}

                        {hasPinnedData && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                            <Pin size={9} /> Pinned
                          </span>
                        )}

                        {!isEnabled && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                            <Power size={9} /> Disabled
                          </span>
                        )}

                        {pauseState && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                            <Clock3 size={9} /> {pauseState.wait_type}
                          </span>
                        )}

                        {/* Execution status indicator */}
                        {executionState && (
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            executionState.status === "success" ? "bg-emerald-400" :
                            executionState.status === "failed" ? "bg-red-400" :
                            executionState.status === "paused" ? "bg-amber-400" :
                            executionState.status === "running" ? "bg-amber-400 animate-pulse" : "bg-slate-300"
                          }`} />
                        )}
                      </div>

                      {/* Summary line */}
                      <div className="px-3 pb-2.5 -mt-0.5">
                        <div className="text-[10px] text-slate-400 leading-[1.4] truncate">{summary}</div>
                      </div>
                    </div>
                  </div>

                  {/* Incoming label */}
                  {node.incomingLabel && (
                    <div className="absolute -top-5 left-3">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        node.incomingLabel === "true" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {node.incomingLabel}
                      </span>
                    </div>
                  )}

                  {SUB_NODE_SLOTS[node.type] && clusterChildrenCount > 0 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-[9px] font-semibold text-purple-700 shadow-sm">
                        <Users size={9} />
                        {clusterChildrenCount} attachment{clusterChildrenCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {nodeNote && (
                  <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] leading-[1.45] text-amber-800 shadow-sm">
                    {nodeNote}
                  </div>
                )}

                {/* ── Sub-node cluster "+" connectors (n8n style) ──
                    Rendered below the card for cluster-capable AI nodes.
                    Each pill shows a labeled "+" icon for the sub-node type. */}
                {SUB_NODE_SLOTS[node.type] && (
                  <div
                    className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5"
                    data-node-action="true"
                  >
                    {SUB_NODE_SLOTS[node.type].map((slot) => {
                      const SlotIcon = slot.icon;
                      const attachments = slotAttachments[slot.key] ?? [];
                      const hasAttachments = attachments.length > 0;
                      const isSingleSlot = slot.key !== "tool";
                      return (
                        <button
                          key={slot.key}
                          data-node-action="true"
                          className={`inline-flex items-center gap-1 h-[22px] px-2 rounded-full border text-[9px] font-semibold shadow-sm transition-all hover:scale-105 ${slot.color} ${slot.borderColor} ${hasAttachments ? "bg-white" : `bg-white ${slot.bgHover}`}`}
                          title={hasAttachments && isSingleSlot ? `Open ${slot.label}` : `${hasAttachments ? "Add" : "Attach"} ${slot.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasAttachments && isSingleSlot) {
                              onNodeSelect(attachments[0].id);
                              return;
                            }
                            onAddClusterNode?.(node.id, slot.key);
                          }}
                        >
                          {hasAttachments ? <CheckCircle2 size={8} strokeWidth={3} /> : <Plus size={8} strokeWidth={3} />}
                          <SlotIcon size={9} />
                          <span>{slot.label}</span>
                          {hasAttachments && (
                            <span className="rounded-full bg-slate-100 px-1 py-0 text-[8px] font-semibold text-slate-600">
                              {attachments.length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Output connector dot(s) */}
                {!isClusterSubNode && node.type === "condition" ? (
                  <>
                    <div
                      className="absolute -right-[6px] top-[30%] -translate-y-1/2 w-[12px] h-[12px] rounded-full border-2 border-emerald-400 bg-white z-10 cursor-pointer hover:bg-emerald-50 hover:scale-110 transition-all"
                      data-node-action="true"
                      onClick={(e) => { e.stopPropagation(); setConnectMode({ sourceId: node.id, label: "true" }); }}
                    />
                    <div
                      className="absolute -right-[6px] top-[70%] -translate-y-1/2 w-[12px] h-[12px] rounded-full border-2 border-amber-400 bg-white z-10 cursor-pointer hover:bg-amber-50 hover:scale-110 transition-all"
                      data-node-action="true"
                      onClick={(e) => { e.stopPropagation(); setConnectMode({ sourceId: node.id, label: "false" }); }}
                    />
                  </>
                ) : !isClusterSubNode ? (
                  <div
                    className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full border-2 border-slate-300 bg-white z-10 cursor-pointer hover:border-violet-400 hover:bg-violet-50 hover:scale-110 transition-all"
                    data-node-action="true"
                    onClick={(e) => { e.stopPropagation(); setConnectMode({ sourceId: node.id, label: "default" }); }}
                  />
                ) : null}

                {/* Hover actions */}
                <div className="absolute -top-8 right-0 opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onRunStep?.(node.id); }}
                    data-node-action="true"
                    className="w-6 h-6 rounded-md bg-white border border-emerald-200 flex items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Execute node path"
                  >
                    <Play size={11} />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        data-node-action="true"
                        onClick={(event) => {
                          event.stopPropagation();
                          onNodeSelect(node.id);
                        }}
                        className="h-6 w-6 rounded-md border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                        title="Node actions"
                      >
                        <MoreHorizontal size={11} className="mx-auto" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" onCloseAutoFocus={(event) => event.preventDefault()}>
                      <DropdownMenuLabel className="text-xs text-slate-500">{node.name}</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => startRename(node)}>
                        Rename node
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(node)}>
                        Duplicate node
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRunStep?.(node.id)}>
                        Execute node path
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleStepPinned?.(node.id)}>
                        {hasPinnedData ? "Remove pinned data" : "Pin latest output"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStepEnabled?.(node.id)}>
                        {isEnabled ? "Deactivate node" : "Activate node"}
                      </DropdownMenuItem>
                      {onTidyWorkflow && (
                        <DropdownMenuItem onClick={onTidyWorkflow}>
                          Tidy canvas layout
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => onDelete(node.id)}>
                        Delete node
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
        <button
          onClick={onUndo}
          disabled={!canUndo || actionLoading !== null}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 inline-flex items-center gap-1.5 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={12} />
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo || actionLoading !== null}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          Redo
        </button>
        {onTidyWorkflow && (
          <>
            <div className="w-px h-5 bg-slate-200" />
            <button
              onClick={onTidyWorkflow}
              disabled={actionLoading !== null}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Tidy
            </button>
          </>
        )}
        <div className="w-px h-5 bg-slate-200" />
        <button
          onClick={onRun}
          disabled={actionLoading !== null}
          className="h-8 rounded-lg bg-emerald-50 border border-emerald-200 px-3 text-[11px] font-medium text-emerald-700 disabled:opacity-50 hover:bg-emerald-100 transition-colors"
        >
          {actionLoading === "run" ? "Running..." : "Test Run"}
        </button>
        <button
          onClick={onPublish}
          disabled={actionLoading !== null}
          className="h-8 rounded-lg bg-violet-600 px-4 text-[11px] font-semibold text-white disabled:opacity-50 hover:bg-violet-700 transition-colors"
        >
          {actionLoading === "publish" ? "Publishing..." : "Publish"}
        </button>
      </div>

      {connectMode && (
        <div className="absolute left-4 top-4 z-20 rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm px-3 py-2 text-[11px] text-slate-600">
          Connecting{" "}
          <span className="font-semibold text-slate-800">
            {connectMode.label === "default" ? "next step" : `${connectMode.label} branch`}
          </span>
          . Click a target node to finish.
        </div>
      )}

      {/* Execution replay summary bar */}
      {executionSteps && executionSteps.length > 0 && !connectMode && (
        <div className="absolute left-4 top-4 z-20 rounded-lg border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm px-3 py-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              executionSteps.every((s) => s.status === "success") ? "bg-emerald-500" :
              executionSteps.some((s) => s.status === "failed") ? "bg-red-500" :
              executionSteps.some((s) => s.status === "running") ? "bg-amber-500 animate-pulse" : "bg-slate-300"
            }`} />
            <span className="text-[11px] font-semibold text-slate-700">Execution Replay</span>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-2.5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-500" />
              {executionSteps.filter((s) => s.status === "success").length}
            </span>
            <span className="flex items-center gap-1">
              <Circle size={10} className="text-red-400 fill-current" />
              {executionSteps.filter((s) => s.status === "failed").length}
            </span>
            <span className="text-slate-400">
              {executionSteps.reduce((sum, s) => sum + s.duration_ms, 0)}ms
            </span>
          </div>
        </div>
      )}

      {panelNode && !connectMode && (
        <div data-node-action="true" className="absolute bottom-4 left-4 z-20 w-[420px] rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Node diagnostics</div>
              <div className="mt-1 text-[14px] font-semibold text-slate-900">{panelNode.name}</div>
              <div className="mt-1 text-[11px] leading-5 text-slate-500">Switch between live path tests and real run history for this node without leaving the canvas.</div>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPanelMode("test")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${panelMode === "test" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Test
              </button>
              <button
                type="button"
                onClick={() => setPanelMode("history")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${panelMode === "history" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                History
              </button>
            </div>
          </div>

          {panelMode === "test" ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-600">Input payload</div>
                <button
                  type="button"
                  onClick={() => onRunStep?.(panelNode.id)}
                  disabled={actionLoading === "run" || Boolean(stepTestPayloadError)}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "run" ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  Run path
                </button>
              </div>
              <textarea
                data-node-action="true"
                value={stepTestPayload}
                onChange={(event) => onStepTestPayloadChange(event.target.value)}
                spellCheck={false}
                rows={6}
                className={`w-full resize-none rounded-xl border px-3 py-2.5 font-mono text-[11px] leading-5 outline-none transition-colors ${
                  stepTestPayloadError
                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-400"
                    : "border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-400"
                }`}
              />
              <div className={`text-[11px] ${stepTestPayloadError ? "text-red-500" : "text-slate-400"}`}>
                {stepTestPayloadError ?? "Use this payload to simulate trigger data or upstream variables for the selected path."}
              </div>

              {lastStepTestResult && (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                      lastStepTestResult.result.status === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : lastStepTestResult.result.status === "failed"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}>
                      {lastStepTestResult.result.status}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {traceStepNames.length} step{traceStepNames.length === 1 ? "" : "s"} in path
                    </span>
                    {lastStepTestResult.result.target_step_result && (
                      <span className="text-[11px] text-slate-400">{lastStepTestResult.result.target_step_result.duration_ms}ms</span>
                    )}
                  </div>

                  {traceStepNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {traceStepNames.map((stepName, index) => (
                        <span key={`${stepName}-${index}`} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                          {index + 1}. {stepName}
                        </span>
                      ))}
                    </div>
                  )}

                  {lastStepTestResult.result.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                      {lastStepTestResult.result.warnings.map((warning, index) => (
                        <div key={`${warning}-${index}`}>{warning}</div>
                      ))}
                    </div>
                  )}

                  {stepTestOutput != null && <StudioDataViewer data={stepTestOutput} className="bg-white" />}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-600">Past runs</div>
                <div className="text-[10px] text-slate-400">{stepHistory?.total_matches ?? 0} matches</div>
              </div>

              {stepHistoryLoading ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] text-slate-500">
                  <Loader2 size={12} className="animate-spin" /> Loading step history…
                </div>
              ) : stepHistoryError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-[11px] text-red-700">{stepHistoryError}</div>
              ) : !stepHistory?.entries.length ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] text-slate-500">No past workflow executions reached this node yet.</div>
              ) : (
                <div className="max-h-[150px] space-y-2 overflow-auto pr-1">
                  {stepHistory.entries.map((entry) => (
                    <button
                      key={entry.execution_id}
                      type="button"
                      onClick={() => onSelectHistoryExecution?.(entry.execution_id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${selectedHistoryExecutionId === entry.execution_id ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] font-semibold text-slate-800">{formatPanelTimestamp(entry.started_at)}</div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          entry.step_status === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : entry.step_status === "failed"
                              ? "bg-red-50 text-red-700"
                              : entry.step_status === "paused"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                        }`}>
                          {entry.step_status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{entry.duration_ms}ms</span>
                        <span>{entry.trigger_type}</span>
                        <span>{entry.execution_id.slice(0, 8)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedExecutionPause && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                  <div className="text-[11px] font-semibold text-amber-800">Execution paused at {selectedExecutionPause.step_name}</div>
                  <div className="mt-1 text-[11px] text-amber-700">Waiting on {selectedExecutionPause.wait_type}{selectedExecutionPause.resume_after ? ` until ${formatPanelTimestamp(selectedExecutionPause.resume_after)}` : ""}.</div>
                </div>
              )}

              {selectedHistoryExecutionId && (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-800">Run actions</div>
                      <div className="text-[10px] text-slate-500">Replay the selected run, or load this node's historical output back into the editor for another draft pass.</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onLoadHistoryOutputToEditor?.(selectedHistoryExecutionId)}
                        disabled={historyActionLoading != null || !historyEditorPayload}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {historyActionLoading === "pin" ? <Loader2 size={11} className="animate-spin" /> : <Pin size={11} />}
                        {historyActionLoading === "pin" ? "Loading..." : "Load in editor"}
                      </button>
                      <select
                        value={replayMode}
                        onChange={(event) => setReplayMode(event.target.value as "same_version" | "latest_published" | "current_draft")}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-medium text-slate-700 outline-none transition-colors focus:border-blue-300"
                      >
                        <option value="same_version">Replay same version</option>
                        <option value="current_draft">Replay current draft</option>
                        <option value="latest_published">Replay latest published</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => onReplayHistoryExecution?.(selectedHistoryExecutionId, replayMode)}
                        disabled={historyActionLoading != null}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RotateCcw size={11} className={historyActionLoading === "replay" ? "animate-spin" : ""} />
                        {historyActionLoading === "replay" ? "Replaying..." : "Replay run"}
                      </button>
                    </div>
                  </div>

                  {historyLiveRefreshActive && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-[10px] text-blue-700">
                      Live refresh is active for this historical run. The panel refreshes every 5 seconds while the execution is paused or still running.
                    </div>
                  )}

                  {!historyEditorPayload && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] text-slate-500">
                      This run does not have stored node output available to load into the editor.
                    </div>
                  )}

                  {selectedExecutionPause?.status === "paused" && (
                    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-amber-800">
                        <span className="rounded-full bg-white/70 px-2 py-1 font-semibold uppercase tracking-wide">{selectedExecutionPause.wait_type}</span>
                        {selectedExecutionHumanTask?.priority && <span>Priority: {selectedExecutionHumanTask.priority}</span>}
                        {selectedExecutionHumanTask?.assigned_to_email && <span>Assignee: {selectedExecutionHumanTask.assigned_to_email}</span>}
                        {selectedExecutionHumanTask?.due_at && <span>Due: {formatPanelTimestamp(selectedExecutionHumanTask.due_at)}</span>}
                      </div>

                      {selectedExecutionHumanTask && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-semibold text-slate-800">{selectedExecutionHumanTask.title}</div>
                          <div className="whitespace-pre-wrap text-[11px] text-slate-600">{selectedExecutionHumanTask.instructions}</div>
                          {selectedExecutionHumanTask.choices.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedExecutionHumanTask.choices.map((choice) => (
                                <button
                                  key={choice}
                                  type="button"
                                  onClick={() => setHumanDecision(choice)}
                                  className={`rounded-full border px-2 py-1 text-[10px] font-semibold transition-colors ${humanDecision === choice ? "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                                >
                                  {choice}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <input
                              value={humanDecision}
                              onChange={(event) => setHumanDecision(event.target.value)}
                              placeholder="Enter decision"
                              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] text-slate-700 outline-none transition-colors focus:border-fuchsia-300"
                            />
                          )}
                        </div>
                      )}

                      {selectedExecutionPause.wait_type === "callback" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(selectedExecutionPause.resume_url)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <Copy size={11} /> Copy resume URL
                          </button>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(selectedExecutionPause.cancel_url)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <Copy size={11} /> Copy cancel URL
                          </button>
                        </div>
                      )}

                      <textarea
                        value={historyActionComment}
                        onChange={(event) => setHistoryActionComment(event.target.value)}
                        placeholder="Comment for this resume or cancel action"
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700 outline-none transition-colors focus:border-amber-300"
                      />

                      <textarea
                        value={historyActionPayload}
                        onChange={(event) => setHistoryActionPayload(event.target.value)}
                        placeholder={'{\n  "decision_source": "studio"\n}'}
                        rows={4}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[11px] text-slate-700 outline-none transition-colors focus:border-amber-300"
                      />

                      {historyActionPayloadState.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[10px] text-red-700">{historyActionPayloadState.error}</div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onResumeHistoryExecution?.(selectedHistoryExecutionId, {
                            taskId: selectedExecutionHumanTask?.id,
                            decision: humanDecision.trim() || null,
                            comment: historyActionComment.trim() || null,
                            payload: historyActionPayloadState.parsed ?? {},
                          })}
                          disabled={historyActionLoading != null || Boolean(historyActionPayloadState.error) || Boolean(selectedExecutionHumanTask && !humanDecision.trim())}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Play size={11} />
                          {historyActionLoading === "resume" ? (selectedExecutionHumanTask ? "Completing..." : "Resuming...") : (selectedExecutionHumanTask ? "Complete task" : "Resume now")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onCancelHistoryExecution?.(selectedHistoryExecutionId, {
                            taskId: selectedExecutionHumanTask?.id,
                            comment: historyActionComment.trim() || null,
                          })}
                          disabled={historyActionLoading != null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Power size={11} />
                          {historyActionLoading === "cancel" ? "Cancelling..." : (selectedExecutionHumanTask ? "Cancel task" : "Cancel wait")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedExecutionStepLoading ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] text-slate-500">
                  <Loader2 size={12} className="animate-spin" /> Loading artifacts and output…
                </div>
              ) : selectedExecutionStepDetail ? (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedExecutionStepDetail.result && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                        selectedExecutionStepDetail.result.status === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : selectedExecutionStepDetail.result.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : selectedExecutionStepDetail.result.status === "paused"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                      }`}>
                        {selectedExecutionStepDetail.result.status}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">{selectedExecutionStepDetail.artifacts.length} artifact{selectedExecutionStepDetail.artifacts.length === 1 ? "" : "s"}</span>
                    {selectedExecutionStepDetail.result && <span className="text-[11px] text-slate-400">{selectedExecutionStepDetail.result.duration_ms}ms</span>}
                  </div>

                  {selectedExecutionStepDetail.artifacts.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] font-medium text-slate-600">Artifacts</div>
                        <div className="text-[10px] text-slate-400">{filteredArtifacts.length} / {selectedExecutionStepDetail.artifacts.length}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="space-y-1 text-[10px] font-medium text-slate-500">
                          <span>Direction</span>
                          <select
                            value={artifactDirectionFilter}
                            onChange={(event) => setArtifactDirectionFilter(event.target.value as "all" | "input" | "output" | "state" | "error" | "summary" | "pause")}
                            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none transition-colors focus:border-blue-300"
                          >
                            <option value="all">All directions</option>
                            {artifactDirections.map((direction) => (
                              <option key={direction} value={direction}>{direction}</option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1 text-[10px] font-medium text-slate-500">
                          <span>Type</span>
                          <select
                            value={artifactTypeFilter}
                            onChange={(event) => setArtifactTypeFilter(event.target.value)}
                            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none transition-colors focus:border-blue-300"
                          >
                            <option value="all">All artifact types</option>
                            {artifactTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {filteredArtifacts.map((artifact) => (
                          <button
                            key={artifact.id}
                            type="button"
                            onClick={() => setSelectedArtifactId(artifact.id)}
                            className={`rounded-full border px-2 py-1 text-[10px] font-medium transition-colors ${selectedArtifact?.id === artifact.id ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                          >
                            {artifact.artifact_type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedArtifact ? (
                    <StudioDataViewer data={selectedArtifact.data} className="bg-white" />
                  ) : Object.keys(selectedExecutionStepDetail.latest_output).length > 0 ? (
                    <StudioDataViewer data={selectedExecutionStepDetail.latest_output} className="bg-white" />
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] text-slate-500">This run has no stored artifact payload for the selected node.</div>
                  )}

                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-medium text-slate-600">Timeline</div>
                      <div className="text-[10px] text-slate-400">{filteredEvents.length} / {selectedExecutionStepDetail.events.length} events</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="space-y-1 text-[10px] font-medium text-slate-500">
                        <span>Status</span>
                        <select
                          value={eventStatusFilter}
                          onChange={(event) => setEventStatusFilter(event.target.value)}
                          className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none transition-colors focus:border-blue-300"
                        >
                          <option value="all">All statuses</option>
                          {eventStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-[10px] font-medium text-slate-500">
                        <span>Type</span>
                        <select
                          value={eventTypeFilter}
                          onChange={(event) => setEventTypeFilter(event.target.value)}
                          className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none transition-colors focus:border-blue-300"
                        >
                          <option value="all">All event types</option>
                          {eventTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {filteredEvents.length > 0 ? (
                      <div className="space-y-2">
                        <div className="max-h-[220px] space-y-3 overflow-auto pr-1">
                          {groupedHistoryEvents.map((group) => (
                            <div key={group.phase} className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold ${group.tone}`}>
                                  {group.label}
                                </div>
                                <div className="text-[10px] text-slate-400">{group.events.length} event{group.events.length === 1 ? "" : "s"}</div>
                              </div>
                              <div className="space-y-2">
                                {group.events.map((event) => (
                                  <button
                                    key={event.id}
                                    type="button"
                                    onClick={() => setSelectedHistoryEventId(event.id)}
                                    className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${selectedHistoryEvent?.id === event.id ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="text-[11px] font-semibold text-slate-800">{event.event_type}</div>
                                      <div className="text-[10px] text-slate-400">{formatPanelTimestamp(event.created_at)}</div>
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                                      {event.status && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{event.status}</span>}
                                      {event.message && <span className="truncate">{event.message}</span>}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedHistoryEvent && Object.keys(selectedHistoryEvent.data ?? {}).length > 0 && (
                          <StudioDataViewer data={selectedHistoryEvent.data} className="bg-white" />
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-[11px] text-slate-500">No node events match the current timeline filters.</div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm px-1.5 py-1 flex items-center gap-0.5">
        <button onClick={() => setZoom((value) => Math.max(60, value - 10))} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ZoomOut size={13} />
        </button>
        <span className="min-w-9 text-center text-[11px] font-medium text-slate-500 select-none">{zoom}%</span>
        <button onClick={() => setZoom((value) => Math.min(130, value + 10))} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ZoomIn size={13} />
        </button>
        <div className="mx-0.5 h-4 w-px bg-slate-200" />
        <button onClick={() => setZoom(92)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Fit to screen">
          <Maximize2 size={12} />
        </button>
        <button
          onClick={() => setShowMinimap((v) => !v)}
          className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${showMinimap ? "text-violet-700 bg-violet-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
          title="Toggle minimap"
        >
          <MapIcon size={12} />
        </button>
        <div className="mx-0.5 h-4 w-px bg-slate-200" />
        <button className="h-7 w-7 rounded-lg bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors" title="Add node">
          <Plus size={13} />
        </button>
      </div>

      {/* Minimap */}
      {showMinimap && dragNodes.length > 0 && (
        <div data-minimap className="absolute bottom-14 right-4 z-20 w-[160px] h-[100px] rounded-lg border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm overflow-hidden">
          <svg width={160} height={100} className="block">
            {(() => {
              const minX = Math.min(...dragNodes.map((n) => n.x));
              const minY = Math.min(...dragNodes.map((n) => n.y));
              const maxX = Math.max(...dragNodes.map((n) => n.x + n.width));
              const maxY = Math.max(...dragNodes.map((n) => n.y + n.height));
              const rangeX = Math.max(maxX - minX, 200);
              const rangeY = Math.max(maxY - minY, 200);
              const pad = 10;
              const sx = (160 - pad * 2) / rangeX;
              const sy = (100 - pad * 2) / rangeY;
              const s = Math.min(sx, sy);
              return (
                <>
                  {edges.map((edge) => {
                    const src = dragNodes.find((n) => n.id === edge.source);
                    const tgt = dragNodes.find((n) => n.id === edge.target);
                    if (!src || !tgt) return null;
                    return (
                      <line
                        key={`mm-${edge.id}`}
                        x1={pad + (src.x + src.width - minX) * s}
                        y1={pad + (src.y + src.height / 2 - minY) * s}
                        x2={pad + (tgt.x - minX) * s}
                        y2={pad + (tgt.y + tgt.height / 2 - minY) * s}
                        stroke="#e2e8f0"
                        strokeWidth={1}
                      />
                    );
                  })}
                  {dragNodes.map((node) => {
                    const selected = node.id === selectedNodeId;
                    return (
                      <rect
                        key={`mm-${node.id}`}
                        x={pad + (node.x - minX) * s}
                        y={pad + (node.y - minY) * s}
                        width={Math.max(node.width * s, 6)}
                        height={Math.max(node.height * s, 4)}
                        rx={2}
                        fill={selected ? "#3b82f6" : "#94a3b8"}
                        opacity={selected ? 1 : 0.4}
                      />
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      )}
    </div>
  );
};

export default WorkflowCanvasLive;
