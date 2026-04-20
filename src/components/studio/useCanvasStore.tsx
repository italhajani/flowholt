import { createContext, useContext, useState, useCallback, useRef, useMemo, type ReactNode } from "react";
import { canvasNodes, type CanvasNodeData, type NodeExecState } from "./canvasTypes";
import type { WorkflowDetail, WorkflowStep, WorkflowEdge as ApiEdge, WorkflowDefinition } from "@/lib/api";

/* ── Helpers: map backend definition → canvas state ── */

const familyFromType: Record<string, CanvasNodeData["family"]> = {
  trigger: "trigger", webhook: "trigger", schedule: "trigger", chat_trigger: "trigger",
  openai: "ai", anthropic: "ai", ai_transform: "ai", text_classifier: "ai", summarization_chain: "ai",
  if_node: "logic", switch: "logic", merge: "logic", wait: "logic",
  set: "data", code: "data", filter: "data", aggregate: "data", split_out: "data",
};

function stepToCanvasNode(step: WorkflowStep, idx: number): CanvasNodeData {
  const family = familyFromType[step.type] ?? "integration";
  return {
    id: step.id,
    name: step.name,
    subtitle: step.type,
    family,
    top: 120 + Math.floor(idx / 4) * 140,
    left: 80 + (idx % 4) * 260,
  };
}

function apiEdgeToTuple(edge: ApiEdge): [string, string] {
  return [edge.source, edge.target];
}

/* ── Types ── */
export type CanvasActionType = "add-node" | "remove-node" | "modify-node" | "add-edge" | "remove-edge" | "move-node";

export interface CanvasAction {
  type: CanvasActionType;
  nodeId?: string;
  node?: Partial<CanvasNodeData>;
  prevNode?: Partial<CanvasNodeData>; // snapshot for undo
  edge?: [string, string];
}

interface CanvasStore {
  nodes: CanvasNodeData[];
  edges: [string, string][];
  execStates: Record<string, NodeExecState>;
  pinnedNodes: Set<string>;
  loadedWorkflowId: string | null;
  loadWorkflow: (workflow: WorkflowDetail) => void;
  togglePin: (nodeId: string) => void;
  addNode: (node: CanvasNodeData) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, patch: Partial<CanvasNodeData>) => void;
  setNodes: React.Dispatch<React.SetStateAction<CanvasNodeData[]>>;
  setEdges: React.Dispatch<React.SetStateAction<[string, string][]>>;
  setExecStates: React.Dispatch<React.SetStateAction<Record<string, NodeExecState>>>;
  addEdge: (from: string, to: string) => void;
  removeEdge: (from: string, to: string) => void;
  applyActions: (actions: CanvasAction[]) => void;
  undoStack: CanvasAction[][];
  redoStack: CanvasAction[][];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;
  isDirty: boolean;
  markClean: () => void;
  toDefinition: () => WorkflowDefinition;
}

const CanvasStoreCtx = createContext<CanvasStore | null>(null);

const defaultEdges: [string, string][] = [
  ["n1", "n2"], ["n2", "n3"], ["n3", "n4"], ["n4", "n5"],
];

const defaultExecStates: Record<string, NodeExecState> = {
  n1: "success", n2: "success", n3: "running", n4: "idle", n5: "idle",
};

export function CanvasStoreProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<CanvasNodeData[]>(canvasNodes);
  const [edges, setEdges] = useState<[string, string][]>(defaultEdges);
  const [execStates, setExecStates] = useState<Record<string, NodeExecState>>(defaultExecStates);
  const [pinnedNodes, setPinnedNodes] = useState<Set<string>>(new Set(["n2"])); // n2 pre-pinned for demo
  const [loadedWorkflowId, setLoadedWorkflowId] = useState<string | null>(null);
  const undoStackRef = useRef<CanvasAction[][]>([]);
  const redoStackRef = useRef<CanvasAction[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const loadWorkflow = useCallback((workflow: WorkflowDetail) => {
    if (loadedWorkflowId === workflow.id) return; // avoid re-loading same workflow
    const def = workflow.definition;
    const newNodes = def.steps.length > 0
      ? def.steps.map((s, i) => stepToCanvasNode(s, i))
      : canvasNodes; // fallback to demo nodes if empty
    const newEdges: [string, string][] = def.edges.length > 0
      ? def.edges.map(apiEdgeToTuple)
      : defaultEdges;
    const newExecStates: Record<string, NodeExecState> = {};
    newNodes.forEach(n => { newExecStates[n.id] = "idle"; });

    setNodes(newNodes);
    setEdges(newEdges);
    setExecStates(newExecStates);
    setPinnedNodes(new Set());
    setLoadedWorkflowId(workflow.id);
    undoStackRef.current = [];
    redoStackRef.current = [];
    setHistoryIndex(0);
  }, [loadedWorkflowId]);

  const togglePin = useCallback((nodeId: string) => {
    setPinnedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
  }, []);

  const addNode = useCallback((node: CanvasNodeData) => {
    setNodes(prev => [...prev, node]);
    setExecStates(prev => ({ ...prev, [node.id]: "idle" }));
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(([f, t]) => f !== id && t !== id));
  }, []);

  const updateNode = useCallback((id: string, patch: Partial<CanvasNodeData>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));
  }, []);

  const addEdge = useCallback((from: string, to: string) => {
    setEdges(prev => {
      if (prev.some(([f, t]) => f === from && t === to)) return prev;
      return [...prev, [from, to]];
    });
  }, []);

  const removeEdge = useCallback((from: string, to: string) => {
    setEdges(prev => prev.filter(([f, t]) => !(f === from && t === to)));
  }, []);

  /* Snapshot a node's current state for undo */
  const getNodeSnapshot = useCallback((id: string): Partial<CanvasNodeData> | undefined => {
    const found = nodes.find(n => n.id === id);
    return found ? { ...found } : undefined;
  }, [nodes]);

  const applyActions = useCallback((actions: CanvasAction[]) => {
    // Enrich actions with undo snapshots
    const enriched = actions.map(a => {
      if ((a.type === "remove-node" || a.type === "modify-node" || a.type === "move-node") && a.nodeId && !a.prevNode) {
        return { ...a, prevNode: getNodeSnapshot(a.nodeId) };
      }
      return a;
    });
    undoStackRef.current.push(enriched);
    redoStackRef.current = []; // clear redo on new action
    setHistoryIndex(i => i + 1);

    for (const a of enriched) {
      switch (a.type) {
        case "add-node":
          if (a.node) {
            const newNode: CanvasNodeData = {
              id: a.nodeId || `n${Date.now()}`,
              name: a.node.name || "New Node",
              subtitle: a.node.subtitle || "",
              family: a.node.family || "integration",
              top: a.node.top ?? 200,
              left: a.node.left ?? 400,
            };
            addNode(newNode);
          }
          break;
        case "remove-node":
          if (a.nodeId) removeNode(a.nodeId);
          break;
        case "modify-node":
        case "move-node":
          if (a.nodeId && a.node) updateNode(a.nodeId, a.node);
          break;
        case "add-edge":
          if (a.edge) addEdge(a.edge[0], a.edge[1]);
          break;
        case "remove-edge":
          if (a.edge) removeEdge(a.edge[0], a.edge[1]);
          break;
      }
    }
  }, [addNode, removeNode, updateNode, addEdge, removeEdge, getNodeSnapshot]);

  const undo = useCallback(() => {
    const lastBatch = undoStackRef.current.pop();
    if (!lastBatch) return;
    redoStackRef.current.push(lastBatch);
    setHistoryIndex(i => Math.max(0, i - 1));

    for (const a of [...lastBatch].reverse()) {
      switch (a.type) {
        case "add-node":
          if (a.nodeId || a.node?.id) removeNode((a.nodeId || a.node?.id)!);
          break;
        case "remove-node":
          if (a.prevNode && a.prevNode.id) addNode(a.prevNode as CanvasNodeData);
          break;
        case "modify-node":
        case "move-node":
          if (a.nodeId && a.prevNode) updateNode(a.nodeId, a.prevNode);
          break;
        case "add-edge":
          if (a.edge) removeEdge(a.edge[0], a.edge[1]);
          break;
        case "remove-edge":
          if (a.edge) addEdge(a.edge[0], a.edge[1]);
          break;
      }
    }
  }, [addNode, removeNode, updateNode, addEdge, removeEdge]);

  const redo = useCallback(() => {
    const batch = redoStackRef.current.pop();
    if (!batch) return;
    undoStackRef.current.push(batch);
    setHistoryIndex(i => i + 1);

    for (const a of batch) {
      switch (a.type) {
        case "add-node":
          if (a.node) {
            const newNode: CanvasNodeData = {
              id: a.nodeId || `n${Date.now()}`,
              name: a.node.name || "New Node",
              subtitle: a.node.subtitle || "",
              family: a.node.family || "integration",
              top: a.node.top ?? 200,
              left: a.node.left ?? 400,
            };
            addNode(newNode);
          }
          break;
        case "remove-node":
          if (a.nodeId) removeNode(a.nodeId);
          break;
        case "modify-node":
        case "move-node":
          if (a.nodeId && a.node) updateNode(a.nodeId, a.node);
          break;
        case "add-edge":
          if (a.edge) addEdge(a.edge[0], a.edge[1]);
          break;
        case "remove-edge":
          if (a.edge) removeEdge(a.edge[0], a.edge[1]);
          break;
      }
    }
  }, [addNode, removeNode, updateNode, addEdge, removeEdge]);

  /* Track dirty state: incremented on every applyActions, reset on markClean */
  const cleanHistoryRef = useRef(0);
  const isDirty = historyIndex !== cleanHistoryRef.current;
  const markClean = useCallback(() => {
    cleanHistoryRef.current = historyIndex;
  }, [historyIndex]);

  /* Serialize canvas → WorkflowDefinition for API persistence */
  const toDefinition = useCallback((): WorkflowDefinition => {
    const steps: WorkflowStep[] = nodes.map(n => ({
      id: n.id,
      type: n.subtitle || "unknown",
      name: n.name,
      config: {},
    }));
    const defEdges: ApiEdge[] = edges.map(([src, tgt], i) => ({
      id: `e${i}`,
      source: src,
      target: tgt,
      label: null,
    }));
    return { steps, edges: defEdges, settings: {} };
  }, [nodes, edges]);

  return (
    <CanvasStoreCtx.Provider value={{
      nodes, edges, execStates,
      pinnedNodes, togglePin,
      loadedWorkflowId, loadWorkflow,
      addNode, removeNode, updateNode,
      setNodes, setEdges, setExecStates,
      addEdge, removeEdge,
      applyActions,
      undoStack: undoStackRef.current,
      redoStack: redoStackRef.current,
      undo, redo,
      canUndo: undoStackRef.current.length > 0,
      canRedo: redoStackRef.current.length > 0,
      historyIndex,
      isDirty,
      markClean,
      toDefinition,
    }}>
      {children}
    </CanvasStoreCtx.Provider>
  );
}

export function useCanvasStore(): CanvasStore {
  const ctx = useContext(CanvasStoreCtx);
  if (!ctx) throw new Error("useCanvasStore must be used within CanvasStoreProvider");
  return ctx;
}
