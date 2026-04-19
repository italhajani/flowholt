import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { canvasNodes, type CanvasNodeData, type NodeExecState } from "./StudioCanvas";

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
  const undoStackRef = useRef<CanvasAction[][]>([]);
  const redoStackRef = useRef<CanvasAction[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

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

  return (
    <CanvasStoreCtx.Provider value={{
      nodes, edges, execStates,
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
