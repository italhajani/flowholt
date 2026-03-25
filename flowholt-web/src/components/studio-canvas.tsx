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
  MiniMap,
  Node,
  NodeChange,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMemo, useRef, useState } from "react";

import type { WorkflowGraph, WorkflowNodeType } from "@/lib/flowholt/types";

type StudioCanvasProps = {
  initialGraph: WorkflowGraph;
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

function toFlowNodes(graph: WorkflowGraph): Node[] {
  return graph.nodes.map((node, index) => ({
    id: node.id,
    type: "default",
    position: node.position ?? {
      x: 80 + (index % 3) * 220,
      y: 80 + Math.floor(index / 3) * 160,
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
    animated: false,
  }));
}

function toWorkflowGraph(nodes: Node[], edges: Edge[]): WorkflowGraph {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: (node.data?.nodeType as WorkflowNodeType) ?? "agent",
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
  const [nodes, setNodes] = useState<Node[]>(() => toFlowNodes(initialGraph));
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

  function onNodesChange(changes: NodeChange[]) {
    setNodes((current) => applyNodeChanges(changes, current));
  }

  function onEdgesChange(changes: EdgeChange[]) {
    setEdges((current) => applyEdgeChanges(changes, current));
  }

  function onConnect(connection: Connection) {
    setEdges((current) => addEdge({ ...connection, animated: false }, current));
  }

  function addNode(nodeType: WorkflowNodeType) {
    const nextIndex = nodeCounter.current;
    nodeCounter.current += 1;

    const newNode: Node = {
      id: `${nodeType}-${nextIndex}`,
      type: "default",
      position: {
        x: 120 + (nodes.length % 3) * 220,
        y: 120 + Math.floor(nodes.length / 3) * 160,
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

      <div className="flex flex-wrap gap-2">
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
            className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
          >
            Add {nodeTypeLabels[nodeType]}
          </button>
        ))}
      </div>

      <div className="h-[520px] overflow-hidden rounded-[1.75rem] border border-stone-900/10 bg-[#f9f4ea]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          fitView
          className="bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),rgba(244,241,232,0.9))]"
        >
          <MiniMap pannable zoomable />
          <Controls />
          <Background gap={24} size={1} color="rgba(50,45,40,0.14)" />
        </ReactFlow>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-stone-900/10 bg-white p-5">
          <p className="text-sm font-semibold text-stone-900">Selected node</p>
          {selectedNode ? (
            <div className="mt-4 space-y-4">
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
              <button
                type="button"
                onClick={removeSelectedNode}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Remove selected node
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-stone-500">
              Click a node in the canvas to edit its label or type.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-stone-900/10 bg-stone-950 p-5">
          <p className="text-sm font-semibold text-stone-100">Graph JSON preview</p>
          <textarea
            value={graphJson}
            readOnly
            rows={12}
            className="mt-4 w-full rounded-[1.25rem] bg-transparent font-mono text-xs leading-6 text-stone-300 outline-none"
          />
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
