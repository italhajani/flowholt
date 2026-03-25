"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeChange,
  NodeProps,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMemo, useRef, useState } from "react";

import type { WorkflowGraph, WorkflowNodeType } from "@/lib/flowholt/types";

type StudioCanvasProps = {
  initialGraph: WorkflowGraph;
};

type WorkflowNodeData = {
  label: string;
  nodeType: WorkflowNodeType;
};

const nodeTypeLabels: Record<WorkflowNodeType, string> = {
  trigger: "Trigger",
  agent: "Agent",
  tool: "Tool",
  condition: "Condition",
  loop: "Loop",
  memory: "Memory",
  retriever: "Retriever",
  output: "Output",
};

const nodeTypeIcons: Record<WorkflowNodeType, string> = {
  trigger: "TZ",
  agent: "AI",
  tool: "TX",
  condition: "IF",
  loop: "LP",
  memory: "KB",
  retriever: "RG",
  output: "OUT",
};

const nodeTypeStyles: Record<
  WorkflowNodeType,
  { badge: string; icon: string; border: string; glow: string }
> = {
  trigger: {
    badge: "bg-amber-100 text-amber-800",
    icon: "bg-amber-200 text-amber-900",
    border: "border-amber-300/70",
    glow: "shadow-[0_0_0_1px_rgba(251,191,36,0.20)]",
  },
  agent: {
    badge: "bg-violet-100 text-violet-800",
    icon: "bg-violet-200 text-violet-900",
    border: "border-violet-300/70",
    glow: "shadow-[0_0_0_1px_rgba(167,139,250,0.20)]",
  },
  tool: {
    badge: "bg-sky-100 text-sky-800",
    icon: "bg-sky-200 text-sky-900",
    border: "border-sky-300/70",
    glow: "shadow-[0_0_0_1px_rgba(125,211,252,0.20)]",
  },
  condition: {
    badge: "bg-rose-100 text-rose-800",
    icon: "bg-rose-200 text-rose-900",
    border: "border-rose-300/70",
    glow: "shadow-[0_0_0_1px_rgba(253,164,175,0.22)]",
  },
  loop: {
    badge: "bg-cyan-100 text-cyan-800",
    icon: "bg-cyan-200 text-cyan-900",
    border: "border-cyan-300/70",
    glow: "shadow-[0_0_0_1px_rgba(103,232,249,0.20)]",
  },
  memory: {
    badge: "bg-emerald-100 text-emerald-800",
    icon: "bg-emerald-200 text-emerald-900",
    border: "border-emerald-300/70",
    glow: "shadow-[0_0_0_1px_rgba(110,231,183,0.20)]",
  },
  retriever: {
    badge: "bg-lime-100 text-lime-800",
    icon: "bg-lime-200 text-lime-900",
    border: "border-lime-300/70",
    glow: "shadow-[0_0_0_1px_rgba(190,242,100,0.20)]",
  },
  output: {
    badge: "bg-orange-100 text-orange-800",
    icon: "bg-orange-200 text-orange-900",
    border: "border-orange-300/70",
    glow: "shadow-[0_0_0_1px_rgba(253,186,116,0.20)]",
  },
};

function WorkflowNodeCard({ data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const nodeType = data.nodeType ?? "agent";
  const style = nodeTypeStyles[nodeType];

  return (
    <div
      className={`min-w-[228px] rounded-[28px] border bg-white/97 p-4 text-stone-900 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur ${style.border} ${style.glow} ${selected ? "ring-2 ring-violet-400/60" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-white !bg-stone-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-white !bg-stone-500"
      />
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-[11px] font-bold tracking-[0.12em] ${style.icon}`}
        >
          {nodeTypeIcons[nodeType]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${style.badge}`}
            >
              {nodeTypeLabels[nodeType]}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
              FlowHolt
            </span>
          </div>
          <p className="mt-3 text-[15px] font-semibold leading-5 text-stone-900">
            {data.label}
          </p>
          <p className="mt-2 text-xs leading-5 text-stone-500">
            {nodeType === "agent"
              ? "Thinks through a task and produces structured output."
              : nodeType === "condition"
                ? "Routes the workflow based on a decision."
                : nodeType === "tool"
                  ? "Connects an app, API, or action step."
                  : nodeType === "trigger"
                    ? "Starts the workflow from an event or schedule."
                    : nodeType === "memory"
                      ? "Keeps context and saved knowledge in the flow."
                      : nodeType === "output"
                        ? "Final result, handoff, or completion step."
                        : "A reusable workflow step."}
          </p>
        </div>
      </div>
    </div>
  );
}

function toFlowNodes(graph: WorkflowGraph): Node<WorkflowNodeData>[] {
  return graph.nodes.map((node, index) => ({
    id: node.id,
    type: "workflow",
    position: node.position ?? {
      x: 120 + (index % 3) * 280,
      y: 120 + Math.floor(index / 3) * 180,
    },
    data: {
      label: node.label,
      nodeType: node.type,
    },
  }));
}

function toFlowEdges(graph: WorkflowGraph): Edge[] {
  return graph.edges.map((edge, index) => ({
    id: `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#95a3b8" },
    style: { stroke: "#95a3b8", strokeWidth: 2.2 },
  }));
}

function toWorkflowGraph(nodes: Node<WorkflowNodeData>[], edges: Edge[]): WorkflowGraph {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.data?.nodeType ?? "agent",
      label: String(node.data?.label ?? node.id),
      position: node.position,
      config: {},
    })),
    edges: edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  };
}

function CanvasInner({ initialGraph }: StudioCanvasProps) {
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>(() =>
    toFlowNodes(initialGraph),
  );
  const [edges, setEdges] = useState<Edge[]>(() => toFlowEdges(initialGraph));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialGraph.nodes[0]?.id ?? null,
  );
  const nodeCounter = useRef(initialGraph.nodes.length + 1);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const graphJson = useMemo(
    () => JSON.stringify(toWorkflowGraph(nodes, edges), null, 2),
    [nodes, edges],
  );

  const nodeTypes = useMemo(
    () => ({
      workflow: WorkflowNodeCard,
    }),
    [],
  );

  function onNodesChange(changes: NodeChange[]) {
    setNodes((current) => applyNodeChanges(changes, current));
  }

  function onEdgesChange(changes: EdgeChange[]) {
    setEdges((current) => applyEdgeChanges(changes, current));
  }

  function onConnect(connection: Connection) {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#95a3b8" },
          style: { stroke: "#95a3b8", strokeWidth: 2.2 },
        },
        current,
      ),
    );
  }

  function addNode(nodeType: WorkflowNodeType) {
    const nextIndex = nodeCounter.current;
    nodeCounter.current += 1;

    const newNode: Node<WorkflowNodeData> = {
      id: `${nodeType}-${nextIndex}`,
      type: "workflow",
      position: {
        x: 180 + (nodes.length % 3) * 280,
        y: 140 + Math.floor(nodes.length / 3) * 180,
      },
      data: {
        label: `${nodeTypeLabels[nodeType]} ${nextIndex}`,
        nodeType,
      },
    };

    setNodes((current) => [...current, newNode]);
    setSelectedNodeId(newNode.id);
  }

  function updateSelectedNodeLabel(label: string) {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, label } }
          : node,
      ),
    );
  }

  function updateSelectedNodeType(nodeType: WorkflowNodeType) {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, nodeType } }
          : node,
      ),
    );
  }

  function removeSelectedNode() {
    if (!selectedNodeId) {
      return;
    }

    setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
    setEdges((current) =>
      current.filter(
        (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId,
      ),
    );
    setSelectedNodeId(null);
  }

  return (
    <div className="space-y-5">
      <input type="hidden" name="graph" value={graphJson} readOnly />

      <div className="rounded-[30px] border border-stone-900/10 bg-white/80 p-3 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-stone-900/8 bg-stone-50/90 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Editor
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Runs
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Tests
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Draft ready
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              {nodes.length} steps
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[34px] border border-stone-900/10 bg-[#202226] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
          <div className="grid h-[720px] grid-cols-[84px_minmax(0,1fr)] gap-4">
            <div className="rounded-[28px] border border-white/8 bg-[#1a1c20] p-3">
              <div className="flex h-full flex-col items-center justify-between">
                <div className="grid gap-2">
                  {(
                    [
                      "trigger",
                      "agent",
                      "tool",
                      "condition",
                      "memory",
                      "output",
                    ] as WorkflowNodeType[]
                  ).map((nodeType) => (
                    <button
                      key={nodeType}
                      type="button"
                      onClick={() => addNode(nodeType)}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200 transition hover:bg-white/10"
                      title={`Add ${nodeTypeLabels[nodeType]}`}
                    >
                      {nodeTypeIcons[nodeType]}
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 px-2 py-3 text-center text-[10px] uppercase tracking-[0.2em] text-stone-400">
                  Studio
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#24272c]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                fitView
                minZoom={0.35}
                className="studio-flow bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),rgba(36,39,44,0.96))]"
                proOptions={{ hideAttribution: true }}
              >
                <Panel position="top-left" className="!m-4">
                  <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-300 backdrop-blur">
                    Canvas
                  </div>
                </Panel>
                <Panel position="top-right" className="!m-4">
                  <div className="flex gap-2 rounded-full border border-white/10 bg-black/25 px-2 py-2 backdrop-blur">
                    <button
                      type="button"
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-700"
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-stone-200"
                    >
                      Share
                    </button>
                  </div>
                </Panel>
                <MiniMap
                  pannable
                  zoomable
                  className="!m-4 !rounded-2xl !border !border-white/10 !bg-black/25"
                  maskColor="rgba(14,15,18,0.45)"
                  nodeColor="#e7ebf2"
                />
                <Controls className="studio-controls" showInteractive={false} />
                <Background gap={22} size={1.2} color="rgba(255,255,255,0.12)" />
              </ReactFlow>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[30px] border border-stone-900/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">Selected step</p>
                <p className="mt-1 text-sm text-stone-500">
                  A cleaner properties panel for the current card.
                </p>
              </div>
              {selectedNode ? (
                <button
                  type="button"
                  onClick={removeSelectedNode}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Remove
                </button>
              ) : null}
            </div>

            {selectedNode ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Label
                  </label>
                  <input
                    value={String(selectedNode.data?.label ?? "")}
                    onChange={(event) => updateSelectedNodeLabel(event.target.value)}
                    className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Type
                  </label>
                  <select
                    value={String(selectedNode.data?.nodeType ?? "agent")}
                    onChange={(event) =>
                      updateSelectedNodeType(event.target.value as WorkflowNodeType)
                    }
                    className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                  >
                    {Object.entries(nodeTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-stone-500">
                Click a step in the canvas to edit its label or type.
              </p>
            )}
          </div>

          <div className="rounded-[30px] border border-stone-900/10 bg-[#111317] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-100">Graph JSON</p>
                <p className="mt-1 text-sm text-stone-400">
                  Still available for transparency, but no longer the main editing surface.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-300">
                Live sync
              </div>
            </div>
            <textarea
              value={graphJson}
              readOnly
              rows={12}
              className="mt-4 w-full rounded-[22px] border border-white/8 bg-black/20 p-4 font-mono text-xs leading-6 text-stone-300 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudioCanvas(props: StudioCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
