import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  CheckCircle2,
  Circle,
  Copy,
  Loader2,
  GitBranch,
  Maximize2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Webhook,
  ZoomIn,
  ZoomOut,
  Users,
  Clock3,
  Link2,
} from "lucide-react";
import type { ApiExecutionStep, ApiWorkflowEdge, ApiWorkflowStep } from "@/lib/api";

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
  onPositionChange: (stepId: string, position: { x: number; y: number }) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  executionSteps: ApiExecutionStep[] | null;
  actionLoading: "run" | "publish" | null;
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

const typeMeta: Record<ApiWorkflowStep["type"], { icon: React.ElementType; accent: string; subtitle: string }> = {
  trigger: { icon: Webhook, accent: "from-sky-500 to-blue-500", subtitle: "Trigger" },
  transform: { icon: Sparkles, accent: "from-amber-400 to-orange-500", subtitle: "Transform" },
  condition: { icon: GitBranch, accent: "from-emerald-500 to-green-500", subtitle: "Condition" },
  llm: { icon: Bot, accent: "from-violet-500 to-purple-600", subtitle: "AI Step" },
  output: { icon: CheckCircle2, accent: "from-rose-500 to-pink-500", subtitle: "Output" },
  delay: { icon: Clock3, accent: "from-slate-500 to-slate-700", subtitle: "Delay" },
  human: { icon: Users, accent: "from-fuchsia-500 to-pink-600", subtitle: "Human Task" },
  callback: { icon: Link2, accent: "from-cyan-500 to-teal-500", subtitle: "Callback Wait" },
};

const extractSummary = (step: ApiWorkflowStep) => {
  const config = step.config ?? {};
  if (typeof config.prompt === "string" && config.prompt.trim()) return config.prompt.trim();
  if (typeof config.template === "string" && config.template.trim()) return config.template.trim();
  if (typeof config.field === "string" && typeof config.equals === "string") return `${config.field} matches ${config.equals}`;
  if (typeof config.channel === "string" && config.channel.trim()) return `Routes to ${config.channel}`;
  if (typeof config.destination === "string" && config.destination.trim()) return `Sends to ${config.destination}`;
  return "Configure this step in the right panel.";
};

const buildCanvasNodes = (steps: ApiWorkflowStep[], edges: ApiWorkflowEdge[]): CanvasNode[] => {
  const nodes: CanvasNode[] = [];
  const columnGap = 300;
  const rowGap = 212;
  let x = 84;
  let y = 96;
  const incomingByTarget = new Map(edges.map((edge) => [edge.target, edge]));

  steps.forEach((step) => {
    const width = step.type === "llm" ? 290 : 228;
    const storedPosition =
      typeof step.config?.ui_position === "object" && step.config?.ui_position !== null
        ? (step.config.ui_position as { x?: number; y?: number })
        : null;

    const node: CanvasNode = {
      ...step,
      x: storedPosition?.x ?? x,
      y: storedPosition?.y ?? y,
      width,
      height: step.type === "llm" ? 210 : 178,
      accent: typeMeta[step.type].accent,
      subtitle: typeMeta[step.type].subtitle,
      incomingLabel: incomingByTarget.get(step.id)?.label ?? undefined,
    };

    if (!storedPosition) {
      const incomingEdge = incomingByTarget.get(step.id);
      const parent = incomingEdge ? nodes.find((item) => item.id === incomingEdge.source) : null;

      if (parent) {
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
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  executionSteps,
}) => {
  const [zoom, setZoom] = useState(92);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragNodes, setDragNodes] = useState<CanvasNode[]>([]);
  const [connectMode, setConnectMode] = useState<{ sourceId: string; label: "default" | "true" | "false" } | null>(null);
  const [dragStart, setDragStart] = useState<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const scale = zoom / 100;

  const canvasNodes = useMemo<CanvasNode[]>(() => buildCanvasNodes(steps, edges), [edges, steps]);
  useEffect(() => {
    setDragNodes(canvasNodes);
  }, [canvasNodes]);

  const canvasWidth = 1200;
  const canvasHeight = Math.max(760, (Math.ceil(Math.max(canvasNodes.length, 1) / 3) + 2) * 228);

  useEffect(() => {
    if (!draggingId) return;

    const handleMouseMove = (event: MouseEvent) => {
      setDragStart((current) =>
        current && current.id === draggingId
          ? { ...current, moved: current.moved || Math.abs(event.movementX) > 0 || Math.abs(event.movementY) > 0 }
          : current,
      );
      setDragNodes((current) =>
        current.map((node) =>
          node.id === draggingId
            ? {
                ...node,
                x: Math.max(40, Math.min(canvasWidth - node.width - 20, node.x + event.movementX / scale)),
                y: Math.max(40, Math.min(canvasHeight - node.height - 20, node.y + event.movementY / scale)),
              }
            : node,
        ),
      );
    };

    const handleMouseUp = () => {
      const movedNode = dragNodes.find((node) => node.id === draggingId);
      if (movedNode && dragStart?.id === draggingId && dragStart.moved) {
        onPositionChange(movedNode.id, { x: Math.round(movedNode.x), y: Math.round(movedNode.y) });
      }
      setDraggingId(null);
      setDragStart(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasHeight, canvasWidth, dragNodes, dragStart, draggingId, onPositionChange, scale]);

  return (
    <div className="h-full w-full relative overflow-hidden bg-[#fcfdff]">
      <div
        className="absolute inset-0"
        onClick={() => {
          onNodeSelect(null);
          setConnectMode(null);
        }}
        style={{
          backgroundImage: "radial-gradient(circle, rgba(99, 102, 241, 0.14) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="absolute inset-0 overflow-auto">
        <div
          className="relative mx-auto"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <svg className="absolute inset-0 pointer-events-none" width={canvasWidth} height={canvasHeight}>
            {edges.map((edge) => {
              const node = dragNodes.find((item) => item.id === edge.source);
              const next = dragNodes.find((item) => item.id === edge.target);
              if (!node || !next) return null;
              const startX = node.x + node.width;
              const startY = node.y + node.height / 2;
              const endX = next.x;
              const endY = next.y + next.height / 2;
              const midX = startX + (endX - startX) / 2;
              const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

              return (
                <g key={edge.id}>
                  <path d={d} fill="none" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" />
                  {edge.label && (
                    <text x={midX} y={Math.min(startY, endY) - 10} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {dragNodes.map((node) => {
            const Icon = typeMeta[node.type].icon;
            const selected = node.id === selectedNodeId;
            const summary = extractSummary(node);
            const executionState = executionSteps?.find((step) => step.name === node.name) ?? null;
            const awaitingConnection = connectMode !== null && connectMode.sourceId !== node.id;

            return (
              <div
                key={node.id}
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
                  setDraggingId(node.id);
                  setDragStart({ id: node.id, x: node.x, y: node.y, moved: false });
                }}
                className={`absolute rounded-[22px] border bg-white text-left transition-all duration-200 ${
                  selected ? "border-indigo-400 ring-4 ring-indigo-100" : "border-slate-200 hover:border-slate-300"
                }`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  minHeight: node.height,
                  cursor: connectMode ? (awaitingConnection ? "copy" : "default") : draggingId === node.id ? "grabbing" : "grab",
                  zIndex: draggingId === node.id ? 5 : selected ? 4 : 1,
                }}
              >
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-11 w-11 rounded-[14px] bg-gradient-to-br ${node.accent} flex items-center justify-center text-white shrink-0`}>
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-slate-900 truncate">{node.name}</div>
                        <div className="text-[12px] text-slate-500">{node.subtitle}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onMove(node.id, "up");
                        }}
                        data-node-action="true"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onMove(node.id, "down");
                        }}
                        data-node-action="true"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <div className="mt-1 h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                    </div>
                  </div>

                  <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50/90 px-4 py-3">
                    <div className="inline-flex rounded-md bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {node.type}
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-slate-700">{summary}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1">{node.type}</span>
                    {executionState && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                          executionState.status === "success"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : executionState.status === "failed"
                              ? "border border-red-200 bg-red-50 text-red-600"
                              : executionState.status === "running"
                                ? "border border-amber-200 bg-amber-50 text-amber-700"
                                : "border border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {executionState.status === "success" ? (
                          <CheckCircle2 size={12} />
                        ) : executionState.status === "failed" ? (
                          <Circle size={12} className="fill-current" />
                        ) : executionState.status === "running" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Circle size={12} />
                        )}
                        {executionState.status}
                      </span>
                    )}
                    {node.incomingLabel && (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                        {node.incomingLabel} branch
                      </span>
                    )}
                    {node.type === "llm" && (
                      <>
                        <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1">open-source ready</span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1">local model</span>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <MoreHorizontal size={13} />
                      {executionState ? `${executionState.duration_ms} ms` : "Quick actions"}
                    </div>
                    <div className="flex items-center gap-1">
                      {node.type === "condition" ? (
                        <>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setConnectMode({ sourceId: node.id, label: "true" });
                            }}
                            data-node-action="true"
                            className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium ${
                              connectMode?.sourceId === node.id && connectMode.label === "true"
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            True
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setConnectMode({ sourceId: node.id, label: "false" });
                            }}
                            data-node-action="true"
                            className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium ${
                              connectMode?.sourceId === node.id && connectMode.label === "false"
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            False
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setConnectMode({ sourceId: node.id, label: "default" });
                          }}
                          data-node-action="true"
                          className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium ${
                            connectMode?.sourceId === node.id && connectMode.label === "default"
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Connect
                        </button>
                      )}
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDuplicate(node);
                        }}
                        data-node-action="true"
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Copy size={12} />
                        Duplicate
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(node.id);
                        }}
                        data-node-action="true"
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11px] font-medium text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo || actionLoading !== null}
          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-600 inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <RotateCcw size={13} />
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo || actionLoading !== null}
          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-600 disabled:opacity-50"
        >
          Redo
        </button>
        <button
          onClick={onRun}
          disabled={actionLoading !== null}
          className="h-9 rounded-xl border border-indigo-200 bg-indigo-50 px-3 text-[12px] font-medium text-indigo-600 disabled:opacity-70"
        >
          {actionLoading === "run" ? "Running..." : "Test Run"}
        </button>
        <button
          onClick={onPublish}
          disabled={actionLoading !== null}
          className="h-9 rounded-xl bg-[#6558f5] px-4 text-[12px] font-semibold text-white disabled:opacity-70"
        >
          {actionLoading === "publish" ? "Publishing..." : "Publish"}
        </button>
      </div>

      {connectMode && (
        <div className="absolute left-4 top-4 z-20 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-[12px] text-slate-700">
          Connecting{" "}
          <span className="font-semibold text-slate-900">
            {connectMode.label === "default" ? "next step" : `${connectMode.label} branch`}
          </span>
          . Click a target node to finish.
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-[18px] border border-slate-200 bg-white px-3 py-2 flex items-center gap-2">
        <button onClick={() => setZoom((value) => Math.max(60, value - 10))} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <ZoomOut size={15} />
        </button>
        <span className="min-w-10 text-center text-[12px] font-medium text-slate-700">{zoom}%</span>
        <button onClick={() => setZoom((value) => Math.min(130, value + 10))} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <ZoomIn size={15} />
        </button>
        <div className="mx-1 h-5 w-px bg-slate-200" />
        <button onClick={() => setZoom(92)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <Maximize2 size={14} />
        </button>
        <button className="h-8 w-8 rounded-lg border border-slate-200 text-indigo-600 flex items-center justify-center">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

export default WorkflowCanvasLive;
