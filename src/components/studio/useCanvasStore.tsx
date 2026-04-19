import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { canvasNodes, type CanvasNodeData, type NodeExecState } from "./StudioCanvas";

/* ── Types ── */
export interface CanvasAction {
  type: "add-node" | "remove-node" | "modify-node" | "add-edge" | "remove-edge";
  nodeId?: string;
  node?: Partial<CanvasNodeData>;
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
  undo: () => void;
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

  const applyActions = useCallback((actions: CanvasAction[]) => {
    undoStackRef.current.push(actions);
    for (const a of actions) {
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

  const undo = useCallback(() => {
    const lastBatch = undoStackRef.current.pop();
    if (!lastBatch) return;
    for (const a of [...lastBatch].reverse()) {
      switch (a.type) {
        case "add-node":
          if (a.nodeId) removeNode(a.nodeId);
          break;
        case "remove-node":
          // Can't fully undo remove without snapshot — skip for now
          break;
        case "add-edge":
          if (a.edge) removeEdge(a.edge[0], a.edge[1]);
          break;
        case "remove-edge":
          if (a.edge) addEdge(a.edge[0], a.edge[1]);
          break;
      }
    }
  }, [removeNode, addEdge, removeEdge]);

  return (
    <CanvasStoreCtx.Provider value={{
      nodes, edges, execStates,
      addNode, removeNode, updateNode,
      setNodes, setEdges, setExecStates,
      addEdge, removeEdge,
      applyActions,
      undoStack: undoStackRef.current,
      undo,
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
