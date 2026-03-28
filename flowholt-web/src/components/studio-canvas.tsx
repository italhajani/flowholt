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
  Node,
  NodeChange,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMemo, useRef, useState } from "react";

import {
  IconAgent,
  IconCondition,
  IconLoop,
  IconMemory,
  IconOutput,
  IconPanelRight,
  IconPlus,
  IconRetriever,
  IconTool,
  IconTrigger,
  IconX,
} from "@/components/icons";
import { StudioNodeConfigForm } from "@/components/studio-node-config-form";
import { expectedConnectionProviderForNode, requiresConnectionForNode } from "@/lib/flowholt/integration-runtime";
import { getDefaultToolConfig } from "@/lib/flowholt/tool-registry";
import type { WorkflowEdge, WorkflowGraph, WorkflowNodeType } from "@/lib/flowholt/types";

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

type InspectorPane = "step" | "connection" | "data" | "json";

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

const nodeTypeIcons: Record<WorkflowNodeType, typeof IconTrigger> = {
  trigger: IconTrigger,
  agent: IconAgent,
  tool: IconTool,
  condition: IconCondition,
  loop: IconLoop,
  memory: IconMemory,
  retriever: IconRetriever,
  output: IconOutput,
};

const nodeTypeStyles: Record<WorkflowNodeType, { accent: string; chip: string }> = {
  trigger: { accent: "#19a05b", chip: "bg-[#eef8f1] text-[#1b7d4d]" },
  agent: { accent: "#6f5bf3", chip: "bg-[#f1efff] text-[#6553e6]" },
  tool: { accent: "#3b82f6", chip: "bg-[#eef5ff] text-[#2f6fdd]" },
  condition: { accent: "#ef6a3a", chip: "bg-[#fff4ef] text-[#dc5d30]" },
  loop: { accent: "#0ea5a4", chip: "bg-[#edf8f8] text-[#0b8988]" },
  memory: { accent: "#d97706", chip: "bg-[#fff6eb] text-[#b66300]" },
  retriever: { accent: "#7c3aed", chip: "bg-[#f5efff] text-[#6b31d7]" },
  output: { accent: "#ef4444", chip: "bg-[#fff1f1] text-[#d93a3a]" },
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

function providerForNodeType(nodeType: WorkflowNodeType, config?: Record<string, unknown>) {
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

function WorkflowNodeCard({ data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const nodeType = data.nodeType ?? "agent";
  const style = nodeTypeStyles[nodeType];
  const Icon = nodeTypeIcons[nodeType];

  return (
    <div
      className={`min-w-[210px] border bg-white px-4 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)] ${selected ? "ring-1 ring-[#ef6a3a]/40" : ""}`}
      style={{ borderColor: selected ? style.accent : "rgba(15,23,42,0.1)" }}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border !border-white !bg-stone-400" />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border !border-white !bg-stone-400" />
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border" style={{ borderColor: style.accent, color: style.accent }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${style.chip}`}>
              {nodeTypeLabels[nodeType]}
            </span>
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-stone-900">{data.label}</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {nodeType === "agent"
              ? "Reason and decide the next step."
              : nodeType === "tool"
                ? "Run an external action or app call."
                : nodeType === "trigger"
                  ? "Start the workflow."
                  : nodeType === "condition"
                    ? "Route the flow to another branch."
                    : nodeType === "output"
                      ? "Return the final result."
                      : "Reusable workflow block."}
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
      x: 160 + (index % 3) * 270,
      y: 120 + Math.floor(index / 3) * 170,
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
      fill: "#6b7280",
      fontSize: 11,
      fontWeight: 600,
    },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: {
      fill: "rgba(255, 255, 255, 0.96)",
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#c7ccd4" },
    style: { stroke: "#c7ccd4", strokeWidth: 2 },
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [inspectorPane, setInspectorPane] = useState<InspectorPane>("step");
  const [configError, setConfigError] = useState("");
  const [manualInspectorOpen, setManualInspectorOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
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

  const graphJson = useMemo(() => JSON.stringify(toWorkflowGraph(nodes, edges), null, 2), [nodes, edges]);

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
            fill: "#6b7280",
            fontSize: 11,
            fontWeight: 600,
          },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: {
            fill: "rgba(255,255,255,0.96)",
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#c7ccd4" },
          style: { stroke: "#c7ccd4", strokeWidth: 2 },
          data: {
            branch,
          },
        },
        current,
      ) as Edge<WorkflowEdgeData>[],
    );
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setInspectorPane("connection");
  }

  function addNode(nodeType: WorkflowNodeType) {
    const nextIndex = nodeCounter.current;
    nodeCounter.current += 1;

    const newNode: Node<WorkflowNodeData> = {
      id: `${nodeType}-${nextIndex}`,
      type: "workflow",
      position: {
        x: 180 + (nodes.length % 3) * 270,
        y: 130 + Math.floor(nodes.length / 3) * 170,
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
    setManualInspectorOpen(true);
    setInspectorPane("step");
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

        return {
          ...node,
          data: {
            ...node.data,
            nodeType,
            config: defaultNodeConfig(nodeType),
          },
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
    setEdges((current) => current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setManualInspectorOpen(false);
    setInspectorPane("step");
  }

  function removeSelectedEdge() {
    if (!selectedEdgeId) {
      return;
    }

    setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    setManualInspectorOpen(false);
    setInspectorPane("connection");
  }

  const inspectorButtons: Array<{ key: InspectorPane; label: string }> = [
    { key: "step", label: "Step" },
    { key: "connection", label: "Link" },
    { key: "data", label: "Data" },
    { key: "json", label: "JSON" },
  ];
  const inspectorVisible = Boolean(manualInspectorOpen || selectedNode || selectedEdge);

  return (
    <div className="flex h-full flex-col">
      <input type="hidden" name="graph" value={graphJson} readOnly />

      <div className="flex-1 overflow-hidden border border-black/8 bg-[#f8f8f6]">
        <div className="relative h-full min-h-0">
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
              setManualInspectorOpen(true);
              setInspectorPane("step");
            }}
            onEdgeClick={(_, edge) => {
              setConfigError("");
              setSelectedNodeId(null);
              setSelectedEdgeId(edge.id);
              setManualInspectorOpen(true);
              setInspectorPane("connection");
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            fitView
            minZoom={0.35}
            className="studio-flow flowholt-grid-dots"
            proOptions={{ hideAttribution: true }}
          >
            <Controls showInteractive={false} />
            <Background gap={22} size={1.1} color="rgba(107,114,128,0.16)" />
          </ReactFlow>

          <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2">
            {showAddMenu ? (
              <div className="flex flex-col gap-2 border border-black/8 bg-white p-2 shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
                {(["trigger", "agent", "tool", "condition", "memory", "output"] as WorkflowNodeType[]).map((nodeType) => {
                  const Icon = nodeTypeIcons[nodeType];
                  return (
                    <button
                      key={nodeType}
                      type="button"
                      onClick={() => addNode(nodeType)}
                      className="flex h-9 w-9 items-center justify-center border border-black/8 bg-[#faf9f7] text-stone-600 transition-smooth hover:bg-white hover:text-stone-950"
                      title={`Add ${nodeTypeLabels[nodeType]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setManualInspectorOpen((value) => !value)}
              aria-label="Toggle inspector"
              className="flex h-9 w-9 items-center justify-center border border-black/8 bg-white text-stone-700 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-smooth hover:bg-[#f7f6f3]"
            >
              {inspectorVisible ? <IconX className="h-4 w-4" /> : <IconPanelRight className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowAddMenu((value) => !value)}
              aria-label="Open add node menu"
              className="flex h-9 w-9 items-center justify-center border border-black/8 bg-white text-stone-700 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-smooth hover:bg-[#f7f6f3]"
            >
              {showAddMenu ? <IconX className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {inspectorVisible ? (
        <div className="mt-3 overflow-hidden border border-black/8 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap gap-1 border-b border-black/8 bg-[#faf9f7] px-3 py-2.5">
            {inspectorButtons.map((pane) => (
              <button
                key={pane.key}
                type="button"
                onClick={() => setInspectorPane(pane.key)}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-smooth ${
                  inspectorPane === pane.key
                    ? "bg-stone-900 text-white"
                    : "border border-black/8 bg-white text-stone-500 hover:bg-[#f7f6f3]"
                }`}
              >
                {pane.label}
              </button>
            ))}
          </div>

          <div className="max-h-[280px] overflow-y-auto p-4">
            {inspectorPane === "step" ? (
              selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Selected step</p>
                      <p className="mt-0.5 text-xs text-stone-500">Edit the selected node and its runtime settings.</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedNode}
                      className="border border-[#f5c6b7] bg-[#fff4ef] px-3 py-1.5 text-xs font-medium text-[#d95c31] transition-smooth hover:bg-[#ffece5]"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-stone-700">Label</label>
                      <input
                        value={String(selectedNode.data?.label ?? "")}
                        onChange={(event) => updateSelectedNodeLabel(event.target.value)}
                        className="w-full border border-black/8 bg-[#faf9f7] px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-stone-700">Type</label>
                      <select
                        value={String(selectedNode.data?.nodeType ?? "agent")}
                        onChange={(event) => updateSelectedNodeType(event.target.value as WorkflowNodeType)}
                        className="w-full border border-black/8 bg-[#faf9f7] px-3 py-2 text-sm outline-none"
                      >
                        {Object.entries(nodeTypeLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedNodeProvider ? (
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-stone-700">Connection</label>
                      <select
                        value={selectedNodeConnectionId}
                        onChange={(event) => updateSelectedNodeConnection(event.target.value)}
                        className="w-full border border-black/8 bg-[#faf9f7] px-3 py-2 text-sm outline-none"
                      >
                        <option value="">No connection</option>
                        {providerConnectionOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs leading-5 text-stone-500">
                        {providerConnectionOptions.length
                          ? `Using active ${selectedNodeProvider} connections.`
                          : selectedNodeRequiresConnection
                            ? `This step needs an active ${selectedNodeProvider} connection before it can run.`
                            : `No active ${selectedNodeProvider} connections found.`}
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
                <div className="border border-black/8 bg-[#faf9f7] px-3 py-3 text-xs text-stone-500">
                  Select a node on the canvas to edit its settings.
                </div>
              )
            ) : null}

            {inspectorPane === "connection" ? (
              selectedEdge ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Selected link</p>
                      <p className="mt-0.5 text-xs text-stone-500">Label the connection and branch behavior.</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedEdge}
                      className="border border-[#f5c6b7] bg-[#fff4ef] px-3 py-1.5 text-xs font-medium text-[#d95c31] transition-smooth hover:bg-[#ffece5]"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="border border-black/8 bg-[#faf9f7] px-3 py-2 text-xs font-mono text-stone-600">
                    {selectedEdge.source} -&gt; {selectedEdge.target}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-stone-700">Branch key</label>
                    <input
                      value={selectedEdge.data?.branch ?? ""}
                      onChange={(event) => updateSelectedEdgeBranch(event.target.value)}
                      placeholder="true, false, retry"
                      className="w-full border border-black/8 bg-[#faf9f7] px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-stone-700">Visual label</label>
                    <input
                      value={typeof selectedEdge.label === "string" ? selectedEdge.label : ""}
                      onChange={(event) => updateSelectedEdgeLabel(event.target.value)}
                      placeholder="Shown on the canvas"
                      className="w-full border border-black/8 bg-[#faf9f7] px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="border border-black/8 bg-[#faf9f7] px-3 py-3 text-xs text-stone-500">
                  Select a connection on the canvas to edit its branch and label.
                </div>
              )
            ) : null}

            {inspectorPane === "data" ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Runtime data</p>
                  <p className="mt-0.5 text-xs text-stone-500">Template keys the engine can resolve while running.</p>
                </div>
                <div className="grid gap-2">
                  {previewEntries.slice(0, 5).map((entry) => (
                    <div key={entry.key} className="border border-black/8 bg-[#faf9f7] px-3 py-2.5 text-xs">
                      <p className="font-mono text-stone-600">{entry.key}</p>
                      <p className="mt-1 break-words leading-5 text-stone-500">{formatPreviewValue(entry.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {inspectorPane === "json" ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Graph JSON</p>
                  <p className="mt-0.5 text-xs text-stone-500">Export format for versioning and sharing.</p>
                </div>
                <textarea
                  value={graphJson}
                  readOnly
                  rows={10}
                  className="w-full border border-black/8 bg-[#faf9f7] p-3 font-mono text-xs leading-5 text-stone-600 outline-none"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
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









