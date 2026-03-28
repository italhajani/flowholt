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
  IconMemory,
  IconOutput,
  IconPlus,
  IconRetriever,
  IconTool,
  IconTrigger,
  IconX,
} from "@/components/icons";
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
  loop: IconCondition,
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

function WorkflowNodeCard({ data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const nodeType = data.nodeType ?? "agent";
  const style = nodeTypeStyles[nodeType];
  const Icon = nodeTypeIcons[nodeType];

  return (
    <div
      className={`w-[170px] rounded-[8px] border bg-white px-[14px] py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${selected ? "shadow-[0_0_0_2px_rgba(212,80,10,0.12)]" : ""}`}
      style={{ borderColor: selected ? style.accent : "#e8e7e4" }}
    >
      <Handle type="target" position={Position.Left} className="!h-[7px] !w-[7px] !border-[1.5px] !border-[#c9c6be] !bg-white" />
      <Handle type="source" position={Position.Right} className="!h-[7px] !w-[7px] !border-[1.5px] !border-[#c9c6be] !bg-white" />
      <div className="mb-[7px] flex items-center gap-[5px]">
        <span className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: style.accent }} />
        <span className={`inline-flex rounded-full px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.08em] ${style.chip}`}>
          {nodeTypeLabels[nodeType]}
        </span>
      </div>
      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-[6px]" style={{ backgroundColor: style.chip.includes("bg-[#e8f4ef]") ? "#e8f4ef" : style.chip.includes("bg-[#eef1fb]") ? "#eef1fb" : style.chip.includes("bg-[#f5f0fb]") ? "#f5f0fb" : style.chip.includes("bg-[#fff8ed]") ? "#fff8ed" : style.chip.includes("bg-[#f5f5f5]") ? "#f5f5f5" : "#fafaf9", color: style.accent }}>
        <Icon className="h-[14px] w-[14px]" />
      </div>
      <p className="text-[12.5px] font-semibold text-[#1a1917]">{data.label}</p>
      <p className="mt-0.5 truncate text-[11px] text-[#a09d97]">
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
    labelBgBorderRadius: 3,
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

function CanvasInner({ initialGraph }: StudioCanvasProps) {
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>(() => toFlowNodes(initialGraph));
  const [edges, setEdges] = useState<Edge<WorkflowEdgeData>[]>(() => toFlowEdges(initialGraph));


  const [showAddMenu, setShowAddMenu] = useState(false);
  const nodeCounter = useRef(initialGraph.nodes.length + 1);

  const graphJson = useMemo(() => JSON.stringify(toWorkflowGraph(nodes, edges), null, 2), [nodes, edges]);

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
          labelBgBorderRadius: 3,
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

    setShowAddMenu(false);
  }

  return (
    <div className="flex h-full flex-col bg-[#f7f7f6]">
      <input type="hidden" name="graph" value={graphJson} readOnly />

      <div className="min-h-0 flex-1 overflow-hidden bg-[#f7f7f6]">
        <div className="relative h-full min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            minZoom={0.35}
            className="studio-flow"
            proOptions={{ hideAttribution: true }}
          >
            <Controls showInteractive={false} />
            <Background gap={24} size={1} color="#ccc9c0" />
          </ReactFlow>

          <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2">
            {showAddMenu ? (
              <div className="flex flex-col gap-1 rounded-[5px] border border-[#e8e7e4] bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                {(["trigger", "agent", "tool", "condition", "memory", "output"] as WorkflowNodeType[]).map((nodeType) => {
                  const Icon = nodeTypeIcons[nodeType];
                  return (
                    <button
                      key={nodeType}
                      type="button"
                      onClick={() => addNode(nodeType)}
                      className="flex h-[30px] w-[30px] items-center justify-center rounded-[5px] text-[#6b6760] transition-smooth hover:bg-[#f7f7f6] hover:text-[#1a1917]"
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
              onClick={() => setShowAddMenu((value) => !value)}
              aria-label="Open add node menu"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[5px] border border-[#e8e7e4] bg-white text-[#6b6760] shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-smooth hover:bg-[#f7f7f6]"
            >
              {showAddMenu ? <IconX className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
            </button>
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



