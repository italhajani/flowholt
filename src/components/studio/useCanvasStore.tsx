import { createContext, useContext, useState, useCallback, useRef, useMemo, type ReactNode } from "react";
import { canvasNodes, type CanvasNodeData, type NodeExecState, type StickyNoteData } from "./canvasTypes";
import type { WorkflowDetail, WorkflowStep, WorkflowEdge as ApiEdge, WorkflowDefinition } from "@/lib/api";

/* ── Helpers: map backend definition → canvas state ── */

const familyFromType: Record<string, CanvasNodeData["family"]> = {
  trigger: "trigger", webhook: "trigger", schedule: "trigger", chat_trigger: "trigger",
  error_trigger: "error", rss_trigger: "trigger", form_trigger: "trigger", polling_trigger: "trigger",
  event_trigger: "trigger", api_trigger: "trigger", execute_workflow_trigger: "trigger",
  mcp_server_trigger: "trigger",
  openai: "ai", anthropic: "ai", ai_transform: "ai", text_classifier: "ai", summarization_chain: "ai",
  llm: "ai", ai_agent: "ai", agent_evaluation: "ai",
  if_node: "logic", switch: "logic", merge: "logic", wait: "logic", condition: "logic",
  loop: "logic", execute_workflow: "logic", human: "human", human_approval: "human",
  callback: "human", form_node: "human",
  set: "data", transform: "data", code: "code", filter: "data", aggregate: "data", split_out: "data",
  sort: "data", summarize: "data", compare_datasets: "data",
  rename_keys: "data", remove_duplicates: "data", limit: "data", datetime: "data",
  edit_fields: "data", extract_fields: "data", remove_fields: "data",
  vector_store: "data", document_loader: "data", text_splitter: "data",
  http_request: "integration", mcp_client: "integration", mcp_client_tool: "integration",
  stop_and_error: "error",
};

function stepToCanvasNode(step: WorkflowStep, idx: number): CanvasNodeData {
  const family = familyFromType[step.type] ?? "integration";
  // Check if this node was saved as disabled
  const isDisabled = step.config?._enabled === false;
  return {
    id: step.id,
    name: step.name,
    subtitle: step.type,
    nodeType: step.type,
    config: step.config ?? {},
    family,
    top: step.position?.y ?? (120 + Math.floor(idx / 4) * 140),
    left: step.position?.x ?? (80 + (idx % 4) * 260),
    ...(isDisabled ? { disabled: true } : {}),
  } as CanvasNodeData;
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
  edgeLabels: Record<string, string | null>;
  execStates: Record<string, NodeExecState>;
  pinnedNodes: Set<string>;
  stickyNotes: StickyNoteData[];
  loadedWorkflowId: string | null;
  /** Last execution output per node id, populated after a run */
  execOutputs: Record<string, unknown>;
  setExecOutputs: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  /** Increment to request StudioCanvas to call fitView() */
  fitViewRequested: number;
  requestFitView: () => void;
  loadWorkflow: (workflow: WorkflowDetail) => void;
  togglePin: (nodeId: string) => void;
  addNode: (node: CanvasNodeData) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, patch: Partial<CanvasNodeData>) => void;
  setStickyNotes: React.Dispatch<React.SetStateAction<StickyNoteData[]>>;
  setNodes: React.Dispatch<React.SetStateAction<CanvasNodeData[]>>;
  setEdges: React.Dispatch<React.SetStateAction<[string, string][]>>;
  setEdgeLabels: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  setExecStates: React.Dispatch<React.SetStateAction<Record<string, NodeExecState>>>;
  addEdge: (from: string, to: string, label?: string | null) => void;
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
  const [edgeLabels, setEdgeLabels] = useState<Record<string, string | null>>({});
  const [execStates, setExecStates] = useState<Record<string, NodeExecState>>(defaultExecStates);
  const [pinnedNodes, setPinnedNodes] = useState<Set<string>>(new Set(["n2"])); // n2 pre-pinned for demo
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
  const [execOutputs, setExecOutputs] = useState<Record<string, unknown>>({});
  const [loadedWorkflowId, setLoadedWorkflowId] = useState<string | null>(null);
  const [fitViewRequested, setFitViewRequested] = useState(0);
  const requestFitView = useCallback(() => setFitViewRequested(c => c + 1), []);
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
    // Populate edge labels from definition
    const newEdgeLabels: Record<string, string | null> = {};
    (def.edges.length > 0 ? def.edges : []).forEach(e => {
      if (e.label) newEdgeLabels[`${e.source}-${e.target}`] = e.label;
    });

    // Restore exec states — mark disabled nodes from saved config
    const newExecStates: Record<string, NodeExecState> = {};
    newNodes.forEach(n => {
      const step = def.steps.find(s => s.id === n.id);
      newExecStates[n.id] = step?.config?._enabled === false ? "disabled" : "idle";
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setEdgeLabels(newEdgeLabels);
    setExecStates(newExecStates);
    setPinnedNodes(new Set());
    // Restore sticky notes from the definition settings (if any)
    if (Array.isArray((def.settings as Record<string, unknown>)?.sticky_notes)) {
      setStickyNotes((def.settings as Record<string, unknown>).sticky_notes as StickyNoteData[]);
    } else {
      setStickyNotes([]);
    }
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
    setEdges(prev => {
      const removed = prev.filter(([f, t]) => f === id || t === id);
      removed.forEach(([f, t]) => setEdgeLabels(labels => { const next = { ...labels }; delete next[`${f}-${t}`]; return next; }));
      return prev.filter(([f, t]) => f !== id && t !== id);
    });
  }, []);

  const updateNode = useCallback((id: string, patch: Partial<CanvasNodeData>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));
  }, []);

  const addEdge = useCallback((from: string, to: string, label?: string | null) => {
    setEdges(prev => {
      if (prev.some(([f, t]) => f === from && t === to)) return prev;
      return [...prev, [from, to]];
    });
    if (label) setEdgeLabels(prev => ({ ...prev, [`${from}-${to}`]: label }));
  }, []);

  const removeEdge = useCallback((from: string, to: string) => {
    setEdges(prev => prev.filter(([f, t]) => !(f === from && t === to)));
    setEdgeLabels(prev => { const next = { ...prev }; delete next[`${from}-${to}`]; return next; });
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
    const steps: WorkflowStep[] = nodes.map(n => {
      const isDisabled = execStates[n.id] === "disabled";
      const baseConfig = n.config ?? {};
      const config = isDisabled
        ? { ...baseConfig, _enabled: false }
        : (({ _enabled: _, ...rest }) => rest)(baseConfig as Record<string, unknown>) as Record<string, unknown>;
      return {
        id: n.id,
        type: n.nodeType || n.subtitle || "unknown",
        name: n.name,
        config,
        position: { x: n.left, y: n.top },
      };
    });
    const defEdges: ApiEdge[] = edges.map(([src, tgt], i) => ({
      id: `e${i}`,
      source: src,
      target: tgt,
      label: edgeLabels[`${src}-${tgt}`] ?? null,
    }));
    return {
      steps,
      edges: defEdges,
      settings: { sticky_notes: stickyNotes },
    };
  }, [nodes, edges, execStates, stickyNotes]);

  return (
    <CanvasStoreCtx.Provider value={{
      nodes, edges, edgeLabels,
      execStates,
      pinnedNodes, togglePin,
      stickyNotes, setStickyNotes,
      execOutputs, setExecOutputs,
      fitViewRequested, requestFitView,
      loadedWorkflowId, loadWorkflow,
      addNode, removeNode, updateNode,
      setNodes, setEdges, setEdgeLabels, setExecStates,
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
