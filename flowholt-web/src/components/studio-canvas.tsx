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

import type { WorkflowEdge, WorkflowGraph, WorkflowNodeType } from "@/lib/flowholt/types";
import { StudioNodeConfigForm } from "@/components/studio-node-config-form";
import { expectedConnectionProviderForNode, requiresConnectionForNode } from "@/lib/flowholt/integration-runtime";
import { getDefaultToolConfig } from "@/lib/flowholt/tool-registry";

type StudioCanvasProps = {
  initialGraph: WorkflowGraph;
  originalPrompt?: string;
  latestRunOutput?: Record<string, unknown> | null;
  integrationOptions?: Array<{
    id: string;
    provider: string;
    label: string;
  }>;
};

type WorkflowNodeData = {
  label: string;
  nodeType: WorkflowNodeType;
  config: Record<string, unknown>;
};

type WorkflowEdgeData = {
  branch: string;
};

type MobileStudioPane = "canvas" | "step" | "connection" | "data" | "json";

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

function defaultNodeConfig(nodeType: WorkflowNodeType): Record<string, unknown> {
  switch (nodeType) {
    case "trigger":
      return { mode: "manual" };
    case "agent":
      return {
        instruction: "",
        model: "llama-3.3-70b-versatile",
        tool_access_mode: "workspace_default",
        tool_call_strategy: "workspace_default",
        allowed_tool_keys: [],
      };
    case "tool":
      return getDefaultToolConfig("http-request");
    case "condition":
      return {
        value: "{{previous.status_code}}",
        equals: 200,
        branch_on_match: "true",
        branch_on_miss: "false",
      };
    case "loop":
      return { iterations: 1 };
    case "memory":
      return { source: "workflow" };
    case "retriever":
      return { query: "{{workflow.original_prompt}}" };
    case "output":
      return { result: "{{previous}}" };
    default:
      return {};
  }
}

function providerForNodeType(
  nodeType: WorkflowNodeType,
  config?: Record<string, unknown>,
): string | null {
  return expectedConnectionProviderForNode(nodeType, config ?? {});
}
function edgeDisplayLabel(edge: Pick<WorkflowEdge, "label" | "branch">) {
  return edge.label || edge.branch || "";
}

function buildEdgeId(edge: Pick<WorkflowEdge, "source" | "target">, index: number) {
  return `${edge.source}-${edge.target}-${index}`;
}

function nextConditionBranch(edges: Edge<WorkflowEdgeData>[], sourceId: string) {
  const outgoing = edges.filter((edge) => edge.source === sourceId);
  const branches = outgoing.map((edge) => (edge.data?.branch || "").toLowerCase());
  if (!branches.includes("true")) {
    return "true";
  }
  if (!branches.includes("false")) {
    return "false";
  }
  return `branch-${outgoing.length + 1}`;
}

function formatPreviewValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "(empty)";
  }
  if (typeof value === "string") {
    return value.length > 180 ? `${value.slice(0, 180)}...` : value;
  }
  try {
    const text = JSON.stringify(value);
    return text.length > 180 ? `${text.slice(0, 180)}...` : text;
  } catch {
    return String(value);
  }
}

function mobilePaneClasses(activePane: MobileStudioPane, targetPane: MobileStudioPane) {
  return activePane === targetPane ? "block lg:block" : "hidden lg:block";
}

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
                    ? "Starts the workflow from a click, webhook, event, email, or schedule."
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
      config: node.config ?? defaultNodeConfig(node.type),
    },
  }));
}

function toFlowEdges(graph: WorkflowGraph): Edge<WorkflowEdgeData>[] {
  return graph.edges.map((edge, index) => ({
    id: buildEdgeId(edge, index),
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: false,
    label: edgeDisplayLabel(edge),
    labelStyle: {
      fill: "#5f554d",
      fontSize: 12,
      fontWeight: 600,
    },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 999,
    labelBgStyle: {
      fill: "rgba(255, 252, 247, 0.94)",
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#b9ab9c" },
    style: { stroke: "#ccbfb2", strokeWidth: 2.2 },
    data: {
      branch: edge.branch ?? "",
    },
  }));
}

function toWorkflowGraph(nodes: Node<WorkflowNodeData>[], edges: Edge<WorkflowEdgeData>[]): WorkflowGraph {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.data?.nodeType ?? "agent",
      label: String(node.data?.label ?? node.id),
      position: node.position,
      config: node.data?.config ?? {},
    })),
    edges: edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      label: typeof edge.label === "string" && edge.label ? edge.label : undefined,
      branch: edge.data?.branch ? edge.data.branch : undefined,
    })),
  };
}

function CanvasInner({
  initialGraph,
  originalPrompt = "",
  latestRunOutput = null,
  integrationOptions = [],
}: StudioCanvasProps) {
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>(() => toFlowNodes(initialGraph));
  const [edges, setEdges] = useState<Edge<WorkflowEdgeData>[]>(() => toFlowEdges(initialGraph));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialGraph.nodes[0]?.id ?? null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<MobileStudioPane>("canvas");
  const [configError, setConfigError] = useState("");
  const nodeCounter = useRef(initialGraph.nodes.length + 1);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );
  const selectedNodeProvider = selectedNode
    ? providerForNodeType(selectedNode.data?.nodeType ?? "agent", selectedNode.data?.config ?? {})
    : null;
  const selectedNodeConnectionId =
    selectedNode && typeof selectedNode.data?.config?.connection_id === "string"
      ? selectedNode.data.config.connection_id
      : "";
  const selectedNodeRequiresConnection = selectedNode
    ? requiresConnectionForNode(selectedNode.data?.nodeType ?? "agent", selectedNode.data?.config ?? {})
    : false;
  const providerConnectionOptions = useMemo(() => {
    if (!selectedNodeProvider) {
      return [];
    }

    return integrationOptions.filter((option) => option.provider === selectedNodeProvider);
  }, [integrationOptions, selectedNodeProvider]);

  const graphJson = useMemo(
    () => JSON.stringify(toWorkflowGraph(nodes, edges), null, 2),
    [nodes, edges],
  );

  const latestNodeOutputs = useMemo(() => {
    if (
      latestRunOutput &&
      typeof latestRunOutput === "object" &&
      latestRunOutput.node_outputs &&
      typeof latestRunOutput.node_outputs === "object"
    ) {
      return latestRunOutput.node_outputs as Record<string, unknown>;
    }
    return {} as Record<string, unknown>;
  }, [latestRunOutput]);

  const previewEntries = useMemo(() => {
    const baseEntries = [
      {
        key: "{{workflow.original_prompt}}",
        value: originalPrompt || "(no chat prompt recorded)",
      },
      {
        key: "{{previous}}",
        value: latestRunOutput ?? { note: "Run the workflow to see live output here." },
      },
    ];

    const nodeEntries = nodes.slice(0, 8).map((node) => ({
      key: `{{nodes.${node.id}}}`,
      value:
        latestNodeOutputs[node.id] ?? {
          note: `No run data yet for ${node.id}`,
        },
    }));

    return [...baseEntries, ...nodeEntries];
  }, [latestNodeOutputs, latestRunOutput, nodes, originalPrompt]);

  const nodeTypes = useMemo(
    () => ({
      workflow: WorkflowNodeCard,
    }),
    [],
  );

  function onNodesChange(changes: NodeChange[]) {
    setNodes((current) => applyNodeChanges(changes, current) as Node<WorkflowNodeData>[]);
  }

  function onEdgesChange(changes: EdgeChange[]) {
    setEdges((current) => applyEdgeChanges(changes, current) as Edge<WorkflowEdgeData>[]);
  }

  function onConnect(connection: Connection) {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const branch =
      sourceNode?.data?.nodeType === "condition" && connection.source
        ? nextConditionBranch(edges, connection.source)
        : "";

    setEdges((current) =>
      addEdge(
        {
          ...connection,
          id: buildEdgeId(
            {
              source: connection.source ?? "unknown-source",
              target: connection.target ?? "unknown-target",
            },
            current.length,
          ),
          type: "smoothstep",
          label: branch ? branch.toUpperCase() : "",
          labelStyle: {
            fill: "#5f554d",
            fontSize: 12,
            fontWeight: 600,
          },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 999,
          labelBgStyle: {
            fill: "rgba(255, 252, 247, 0.94)",
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#b9ab9c" },
          style: { stroke: "#ccbfb2", strokeWidth: 2.2 },
          data: {
            branch,
          },
        },
        current,
      ) as Edge<WorkflowEdgeData>[],
    );
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setMobilePane("canvas");
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
        config: defaultNodeConfig(nodeType),
      },
    };

    setNodes((current) => [...current, newNode]);
    setConfigError("");
    setSelectedEdgeId(null);
    setSelectedNodeId(newNode.id);
    setMobilePane("step");
  }

  function updateSelectedNodeLabel(label: string) {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId ? { ...node, data: { ...node.data, label } } : node,
      ),
    );
  }

  function updateSelectedNodeType(nodeType: WorkflowNodeType) {
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== selectedNodeId) {
          return node;
        }

        const nextConfig = defaultNodeConfig(nodeType);

        return {
          ...node,
          data: { ...node.data, nodeType, config: nextConfig },
        };
      }),
    );
  }

  function updateSelectedNodeConfig(config: Record<string, unknown>) {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId ? { ...node, data: { ...node.data, config } } : node,
      ),
    );
  }

  function updateSelectedNodeConnection(connectionId: string) {
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== selectedNodeId) {
          return node;
        }

        const config = { ...(node.data?.config ?? {}) };
        if (connectionId) {
          config.connection_id = connectionId;
        } else {
          delete config.connection_id;
        }

        return {
          ...node,
          data: { ...node.data, config },
        };
      }),
    );
  }

  function handleConfigDraftChange(value: string) {
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        setConfigError("Settings must be a JSON object.");
        return;
      }
      setConfigError("");
      updateSelectedNodeConfig(parsed);
    } catch {
      setConfigError("Settings JSON is not valid yet.");
    }
  }

  function updateSelectedEdgeBranch(branch: string) {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              data: { branch },
              label: edge.label || branch.toUpperCase(),
            }
          : edge,
      ),
    );
  }

  function updateSelectedEdgeLabel(label: string) {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              label,
            }
          : edge,
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
    setSelectedEdgeId(null);
    setMobilePane("canvas");
  }

  function removeSelectedEdge() {
    if (!selectedEdgeId) {
      return;
    }

    setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    setMobilePane("canvas");
  }

  return (
    <div className="space-y-5">
      <input type="hidden" name="graph" value={graphJson} readOnly />

      <div className="rounded-[24px] border border-stone-900/10 bg-white/80 p-3 shadow-[0_16px_50px_rgba(15,23,42,0.08)] sm:rounded-[30px]">
        <div className="flex flex-col gap-3 rounded-[20px] border border-stone-900/8 bg-stone-50/90 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:rounded-[22px]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Draft ready
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              {nodes.length} steps
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-stone-900/10 bg-white/80 p-3 shadow-[0_16px_50px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {([
            { key: "canvas", label: "Canvas" },
            { key: "step", label: selectedNode ? "Step" : "Step" },
            { key: "connection", label: selectedEdge ? "Link" : "Link" },
            { key: "data", label: "Data" },
            { key: "json", label: "JSON" },
          ] as Array<{ key: MobileStudioPane; label: string }>).map((pane) => (
            <button
              key={pane.key}
              type="button"
              onClick={() => setMobilePane(pane.key)}
              className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                mobilePane === pane.key
                  ? "bg-stone-900 text-white"
                  : "border border-stone-900/10 bg-white text-stone-600 hover:bg-stone-50"
              }`}
            >
              {pane.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className={`${mobilePaneClasses(mobilePane, "canvas")} rounded-[28px] border border-stone-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,239,232,0.92))] p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[34px] sm:p-4`}>
          <div className="grid h-[560px] gap-4 sm:h-[640px] lg:grid-cols-[84px_minmax(0,1fr)] xl:h-[720px]">
            <div className="order-2 rounded-[24px] border border-stone-900/10 bg-white/82 p-3 shadow-[var(--fh-shadow-soft)] lg:order-1 lg:rounded-[28px]">
              <div className="flex h-full flex-col gap-3 lg:items-center lg:justify-between">
                <div className="grid auto-cols-max grid-flow-col gap-2 overflow-x-auto lg:grid-flow-row lg:auto-cols-auto">
                  {([
                    "trigger",
                    "agent",
                    "tool",
                    "condition",
                    "memory",
                    "output",
                  ] as WorkflowNodeType[]).map((nodeType) => (
                    <button
                      key={nodeType}
                      type="button"
                      onClick={() => addNode(nodeType)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-stone-900/10 bg-[#fbf8f3] text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:bg-white"
                      title={`Add ${nodeTypeLabels[nodeType]}`}
                    >
                      {nodeTypeIcons[nodeType]}
                    </button>
                  ))}
                </div>
                <div className="hidden rounded-2xl border border-stone-900/10 bg-[#fbf8f3] px-2 py-3 text-center text-[10px] uppercase tracking-[0.2em] text-stone-500 lg:block">
                  Studio
                </div>
              </div>
            </div>

            <div className="order-1 overflow-hidden rounded-[24px] border border-stone-900/10 bg-[#fdfaf6] lg:order-2 lg:rounded-[28px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => {
                  setConfigError("");
                  setSelectedEdgeId(null);
                  setSelectedNodeId(node.id);
                  setMobilePane("step");
                }}
                onEdgeClick={(_, edge) => {
                  setConfigError("");
                  setSelectedNodeId(null);
                  setSelectedEdgeId(edge.id);
                  setMobilePane("connection");
                }}
                onPaneClick={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                  setMobilePane("canvas");
                }}
                fitView
                minZoom={0.35}
                className="studio-flow flowholt-grid-dots bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(252,249,244,0.98))]"
                proOptions={{ hideAttribution: true }}
              >
                <Panel position="top-left" className="!m-3 sm:!m-4">
                  <div className="rounded-full border border-stone-900/10 bg-white/88 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 backdrop-blur sm:px-4">
                    Canvas
                  </div>
                </Panel>
                <Panel position="top-right" className="!m-3 hidden sm:!m-4 sm:!block">
                  <div className="flex gap-2 rounded-full border border-stone-900/10 bg-white/88 px-2 py-2 backdrop-blur">
                    <button
                      type="button"
                      className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-stone-900/10 px-3 py-1.5 text-xs font-medium text-stone-700"
                    >
                      Share
                    </button>
                  </div>
                </Panel>
                <MiniMap
                  pannable
                  zoomable
                  className="!m-4 !hidden !rounded-2xl !border !border-stone-900/10 !bg-white/90 sm:!block"
                  maskColor="rgba(73, 62, 52, 0.10)"
                  nodeColor="#eadfd4"
                />
                <Controls className="studio-controls" showInteractive={false} />
                <Background gap={22} size={1.2} color="rgba(84,72,62,0.14)" />
              </ReactFlow>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div id="studio-selected-step" className={`${mobilePaneClasses(mobilePane, "step")} rounded-[30px] border border-stone-900/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">Selected step</p>
                <p className="mt-1 text-sm text-stone-500">
                  Edit the current step and its runtime settings.
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
                    onChange={(event) => updateSelectedNodeType(event.target.value as WorkflowNodeType)}
                    className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                  >
                    {Object.entries(nodeTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedNodeProvider ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Connection
                    </label>
                    <select
                      value={selectedNodeConnectionId}
                      onChange={(event) => updateSelectedNodeConnection(event.target.value)}
                      className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                    >
                      <option value="">No connection</option>
                      {providerConnectionOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-5 text-stone-500">
                      {providerConnectionOptions.length
                        ? `Using active ${selectedNodeProvider} connections from Integrations.` 
                        : selectedNodeRequiresConnection
                          ? `This step needs an active ${selectedNodeProvider} connection before it can run.` 
                          : `No active ${selectedNodeProvider} connections found. Add one in Integrations if you want a reusable connection.`}
                    </p>
                  </div>
                ) : null}
                <StudioNodeConfigForm
                  nodeType={selectedNode.data?.nodeType ?? "agent"}
                  config={selectedNode.data?.config ?? {}}
                  configError={configError}
                  onConfigChange={updateSelectedNodeConfig}
                  onDraftJsonChange={handleConfigDraftChange}
                />
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-stone-500">
                Click a step in the canvas to edit its label, type, or settings.
              </p>
            )}
          </div>

          <div id="studio-selected-connection" className={`${mobilePaneClasses(mobilePane, "connection")} rounded-[30px] border border-stone-900/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">Selected connection</p>
                <p className="mt-1 text-sm text-stone-500">
                  Name branches like true and false so conditions route explicitly.
                </p>
              </div>
              {selectedEdge ? (
                <button
                  type="button"
                  onClick={removeSelectedEdge}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Remove
                </button>
              ) : null}
            </div>

            {selectedEdge ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
                  {selectedEdge.source} to {selectedEdge.target}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Branch key
                  </label>
                  <input
                    value={selectedEdge.data?.branch ?? ""}
                    onChange={(event) => updateSelectedEdgeBranch(event.target.value)}
                    placeholder="true, false, retry, approved"
                    className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Visual label
                  </label>
                  <input
                    value={typeof selectedEdge.label === "string" ? selectedEdge.label : ""}
                    onChange={(event) => updateSelectedEdgeLabel(event.target.value)}
                    placeholder="Shown on the canvas"
                    className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-stone-500">
                Click a connection in the canvas to edit its branch name and label.
              </p>
            )}
          </div>

          <div id="studio-runtime-data" className={`${mobilePaneClasses(mobilePane, "data")} rounded-[30px] border border-stone-900/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]`}>
            <div>
              <p className="text-sm font-semibold text-stone-900">Runtime data preview</p>
              <p className="mt-1 text-sm text-stone-500">
                These are the template keys the engine can resolve while running your workflow.
              </p>
            </div>
            <div className="mt-5 space-y-3">
              {previewEntries.map((entry) => (
                <div key={entry.key} className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="font-mono text-xs text-stone-900">{entry.key}</p>
                  <p className="mt-2 text-xs leading-6 text-stone-600">{formatPreviewValue(entry.value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="studio-graph-json" className={`${mobilePaneClasses(mobilePane, "json")} rounded-[30px] border border-stone-900/10 bg-[#111317] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.12)]`}>
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







