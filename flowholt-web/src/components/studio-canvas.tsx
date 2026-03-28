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
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMemo, useRef, useState } from "react";

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

const nodeTypeIcons: Record<WorkflowNodeType, string> = {
  trigger: "TR",
  agent: "AI",
  tool: "AP",
  condition: "IF",
  loop: "LP",
  memory: "KB",
  retriever: "RG",
  output: "OT",
};

const nodeTypeStyles: Record<WorkflowNodeType, { badge: string; icon: string; border: string }> = {
  trigger: {
    badge: "bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
  },
  agent: {
    badge: "bg-violet-50 text-violet-700",
    icon: "bg-violet-100 text-violet-700",
    border: "border-violet-200",
  },
  tool: {
    badge: "bg-sky-50 text-sky-700",
    icon: "bg-sky-100 text-sky-700",
    border: "border-sky-200",
  },
  condition: {
    badge: "bg-rose-50 text-rose-700",
    icon: "bg-rose-100 text-rose-700",
    border: "border-rose-200",
  },
  loop: {
    badge: "bg-cyan-50 text-cyan-700",
    icon: "bg-cyan-100 text-cyan-700",
    border: "border-cyan-200",
  },
  memory: {
    badge: "bg-amber-50 text-amber-700",
    icon: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
  },
  retriever: {
    badge: "bg-lime-50 text-lime-700",
    icon: "bg-lime-100 text-lime-700",
    border: "border-lime-200",
  },
  output: {
    badge: "bg-orange-50 text-orange-700",
    icon: "bg-orange-100 text-orange-700",
    border: "border-orange-200",
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

  return (
    <div
      className={`min-w-[210px] rounded-[18px] border bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${style.border} ${selected ? "ring-2 ring-[#7c68f5]/30" : ""}`}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-stone-400" />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-stone-400" />
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] text-[11px] font-semibold ${style.icon}`}>
          {nodeTypeIcons[nodeType]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${style.badge}`}>
              {nodeTypeLabels[nodeType]}
            </span>
          </div>
          <p className="mt-3 truncate text-sm font-semibold text-stone-900">{data.label}</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {nodeType === "agent"
              ? "Reason and produce the next step."
              : nodeType === "tool"
                ? "Call an app or API action."
                : nodeType === "trigger"
                  ? "Start the workflow."
                  : nodeType === "condition"
                    ? "Route to different branches."
                    : nodeType === "output"
                      ? "Finish and return the result."
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
      x: 140 + (index % 3) * 270,
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
    labelBgBorderRadius: 999,
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialGraph.nodes[0]?.id ?? null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [inspectorPane, setInspectorPane] = useState<InspectorPane>("step");
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
          labelBgBorderRadius: 999,
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
    setInspectorPane("step");
  }

  function removeSelectedEdge() {
    if (!selectedEdgeId) {
      return;
    }

    setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    setInspectorPane("connection");
  }

  const inspectorButtons: Array<{ key: InspectorPane; label: string }> = [
    { key: "step", label: "Step" },
    { key: "connection", label: "Link" },
    { key: "data", label: "Data" },
    { key: "json", label: "JSON" },
  ];
  const inspectorVisible = Boolean(selectedNode || selectedEdge);

  return (
    <div className="space-y-4">
      <input type="hidden" name="graph" value={graphJson} readOnly />

      <div className="overflow-hidden rounded-[26px] border border-black/6 bg-[#fafafa] shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/6 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-[10px] bg-stone-900 px-3 py-1.5 text-xs font-medium text-white">Editor</span>
            <span className="rounded-[10px] border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-stone-500">
              Canvas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#effaf2] px-3 py-1 text-[11px] font-medium text-emerald-700">Ready to test</span>
            <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[11px] font-medium text-stone-500">{nodes.length} nodes</span>
          </div>
        </div>

        <div className="grid h-[720px] lg:grid-cols-[84px_minmax(0,1fr)]">
          <div className="border-b border-black/6 bg-white p-3 lg:border-b-0 lg:border-r">
            <div className="grid auto-cols-max grid-flow-col gap-2 overflow-x-auto lg:grid-flow-row lg:auto-cols-auto">
              {(["trigger", "agent", "tool", "condition", "memory", "output"] as WorkflowNodeType[]).map((nodeType) => (
                <button
                  key={nodeType}
                  type="button"
                  onClick={() => addNode(nodeType)}
                  className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-black/8 bg-[#fafafa] text-[11px] font-semibold text-stone-600 transition hover:bg-white"
                  title={`Add ${nodeTypeLabels[nodeType]}`}
                >
                  {nodeTypeIcons[nodeType]}
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#fcfcfb]">
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
                setInspectorPane("step");
              }}
              onEdgeClick={(_, edge) => {
                setConfigError("");
                setSelectedNodeId(null);
                setSelectedEdgeId(edge.id);
                setInspectorPane("connection");
              }}
              onPaneClick={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              fitView
              minZoom={0.35}
              className="studio-flow flowholt-grid-dots bg-[#fcfcfb]"
              proOptions={{ hideAttribution: true }}
            >
              <Panel position="top-left" className="!m-4">
                <div className="rounded-full border border-black/8 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Drag, connect, refine
                </div>
              </Panel>
              <Panel position="top-right" className="!m-4 hidden sm:!block">
                <div className="flex gap-2 rounded-full border border-black/8 bg-white px-2 py-2">
                  <button type="button" className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white">
                    Present
                  </button>
                  <button type="button" className="rounded-full border border-black/8 px-3 py-1.5 text-xs font-medium text-stone-700">
                    Share
                  </button>
                </div>
              </Panel>
              <Controls showInteractive={false} />
              <Background gap={24} size={1.2} color="rgba(107,114,128,0.16)" />
            </ReactFlow>
          </div>
        </div>
      </div>

      {inspectorVisible ? (
        <div className="overflow-hidden rounded-[22px] border border-black/6 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-2 border-b border-black/6 px-4 py-3">
          {inspectorButtons.map((pane) => (
            <button
              key={pane.key}
              type="button"
              onClick={() => setInspectorPane(pane.key)}
              className={`rounded-[12px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                inspectorPane === pane.key
                  ? "bg-stone-900 text-white"
                  : "border border-black/8 bg-white text-stone-500 hover:bg-[#f7f7f5]"
              }`}
            >
              {pane.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {inspectorPane === "step" ? (
            selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Selected step</p>
                    <p className="mt-1 text-sm text-stone-500">Edit the selected node and its runtime settings.</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedNode}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Label</label>
                    <input
                      value={String(selectedNode.data?.label ?? "")}
                      onChange={(event) => updateSelectedNodeLabel(event.target.value)}
                      className="w-full rounded-[16px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Type</label>
                    <select
                      value={String(selectedNode.data?.nodeType ?? "agent")}
                      onChange={(event) => updateSelectedNodeType(event.target.value as WorkflowNodeType)}
                      className="w-full rounded-[16px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none"
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
                    <label className="mb-2 block text-sm font-medium text-stone-700">Connection</label>
                    <select
                      value={selectedNodeConnectionId}
                      onChange={(event) => updateSelectedNodeConnection(event.target.value)}
                      className="w-full rounded-[16px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none"
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
              <div className="rounded-[16px] bg-[#fafafa] px-4 py-4 text-sm text-stone-500">
                Select a node on the canvas to edit its settings.
              </div>
            )
          ) : null}

          {inspectorPane === "connection" ? (
            selectedEdge ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Selected link</p>
                    <p className="mt-1 text-sm text-stone-500">Label the connection and branch behavior.</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedEdge}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>

                <div className="rounded-[16px] bg-[#fafafa] px-4 py-3 text-sm text-stone-600">
                  {selectedEdge.source} to {selectedEdge.target}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Branch key</label>
                  <input
                    value={selectedEdge.data?.branch ?? ""}
                    onChange={(event) => updateSelectedEdgeBranch(event.target.value)}
                    placeholder="true, false, retry"
                    className="w-full rounded-[16px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Visual label</label>
                  <input
                    value={typeof selectedEdge.label === "string" ? selectedEdge.label : ""}
                    onChange={(event) => updateSelectedEdgeLabel(event.target.value)}
                    placeholder="Shown on the canvas"
                    className="w-full rounded-[16px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-[16px] bg-[#fafafa] px-4 py-4 text-sm text-stone-500">
                Select a connection on the canvas to edit its branch and label.
              </div>
            )
          ) : null}

          {inspectorPane === "data" ? (
            <div>
              <p className="text-sm font-semibold text-stone-900">Runtime data preview</p>
              <p className="mt-1 text-sm text-stone-500">Template keys the engine can resolve while running this workflow.</p>
              <div className="mt-4 grid gap-3">
                {previewEntries.map((entry) => (
                  <div key={entry.key} className="rounded-[16px] bg-[#fafafa] px-4 py-3">
                    <p className="font-mono text-xs text-stone-900">{entry.key}</p>
                    <p className="mt-2 text-xs leading-6 text-stone-600">{formatPreviewValue(entry.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {inspectorPane === "json" ? (
            <div>
              <p className="text-sm font-semibold text-stone-900">Graph JSON</p>
              <p className="mt-1 text-sm text-stone-500">Still available for transparency, but not the main editing surface.</p>
              <textarea
                value={graphJson}
                readOnly
                rows={14}
                className="mt-4 w-full rounded-[18px] border border-black/8 bg-[#fafafa] p-4 font-mono text-xs leading-6 text-stone-700 outline-none"
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