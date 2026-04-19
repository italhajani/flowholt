import { useState, useRef, useEffect } from "react";
import {
  Plus, Minus, Maximize2, Map, CheckCircle2, XCircle,
  Loader2, Copy, Trash2, StickyNote, Edit2, Layers, CornerDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mock node data ── */
export interface CanvasNodeData {
  id: string;
  name: string;
  subtitle: string;
  family: "trigger" | "integration" | "logic" | "ai" | "data";
  top: number;
  left: number;
}

export const familyColors: Record<string, { border: string; dot: string; accent: string }> = {
  trigger:     { border: "border-l-green-500", dot: "bg-green-500", accent: "#22c55e" },
  integration: { border: "border-l-zinc-400",  dot: "bg-zinc-400",  accent: "#a1a1aa" },
  logic:       { border: "border-l-blue-500",  dot: "bg-blue-500",  accent: "#3b82f6" },
  ai:          { border: "border-l-violet-600",dot: "bg-violet-600",accent: "#7c3aed" },
  data:        { border: "border-l-teal-500",  dot: "bg-teal-500",  accent: "#14b8a6" },
};

export const canvasNodes: CanvasNodeData[] = [
  { id: "n1", name: "Webhook Trigger",  subtitle: "Webhook",        family: "trigger",     top: 120, left: 80  },
  { id: "n2", name: "Enrich Lead Data", subtitle: "Clearbit",       family: "integration", top: 120, left: 340 },
  { id: "n3", name: "Score with AI",    subtitle: "OpenAI GPT-4o",  family: "ai",          top: 120, left: 600 },
  { id: "n4", name: "Route by Score",   subtitle: "IF / Switch",    family: "logic",       top: 250, left: 600 },
  { id: "n5", name: "Update CRM",       subtitle: "Salesforce",     family: "integration", top: 250, left: 860 },
];

export type NodeExecState = "idle" | "running" | "success" | "error" | "disabled";

const execStateDefaults: Record<string, NodeExecState> = {
  n1: "success", n2: "success", n3: "running", n4: "idle", n5: "idle",
};

const NODE_W = 192;
const NODE_H = 60;

const connections: [string, string][] = [
  ["n1", "n2"],
  ["n2", "n3"],
  ["n3", "n4"],
  ["n4", "n5"],
];

/* ─── Sticky notes ─── */
interface StickyNoteData {
  id: string;
  text: string;
  top: number;
  left: number;
  color: string;
}

const initialNotes: StickyNoteData[] = [
  { id: "s1", text: "Score ≥ 70 → High Quality\nRoute to Salesforce CRM", top: 320, left: 80, color: "#fef9c3" },
];

function getPath(from: CanvasNodeData, to: CanvasNodeData) {
  const x1 = from.left + NODE_W;
  const y1 = from.top + NODE_H / 2;
  const x2 = to.left;
  const y2 = to.top + NODE_H / 2;
  const dx = (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function NodeExecBadge({ state }: { state: NodeExecState }) {
  if (state === "idle" || state === "disabled") return null;
  return (
    <span className="absolute -top-2 -right-2 z-10">
      {state === "running" && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 shadow-sm">
          <Loader2 size={11} className="animate-spin text-white" />
        </span>
      )}
      {state === "success" && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 shadow-sm">
          <CheckCircle2 size={11} className="text-white" />
        </span>
      )}
      {state === "error" && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-sm">
          <XCircle size={11} className="text-white" />
        </span>
      )}
    </span>
  );
}

function CanvasNode({
  node,
  selected,
  execState,
  onClick,
  onContextMenu,
}: {
  node: CanvasNodeData;
  selected: boolean;
  execState: NodeExecState;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const colors = familyColors[node.family];
  const isDisabled = execState === "disabled";
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e); }}
      className={cn(
        "absolute w-48 rounded-lg border bg-white shadow-sm border-l-4 cursor-pointer transition-all duration-150 select-none",
        colors.border,
        isDisabled && "opacity-40 grayscale",
        selected
          ? "border-zinc-900 ring-2 ring-zinc-900/10 shadow-md"
          : "border-zinc-200 hover:shadow-md hover:border-zinc-300",
        execState === "running" && "ring-2 ring-blue-500/20",
        execState === "success" && !selected && "border-green-200",
        execState === "error" && "border-red-300 ring-2 ring-red-500/10",
      )}
      style={{ top: node.top, left: node.left }}
    >
      <NodeExecBadge state={execState} />
      {/* Left port */}
      <span className="absolute -left-[5px] top-1/2 -translate-y-1/2 h-[6px] w-[6px] rounded-full border-2 border-zinc-300 bg-white" />
      {/* Right port */}
      <span className="absolute -right-[5px] top-1/2 -translate-y-1/2 h-[6px] w-[6px] rounded-full border-2 border-zinc-300 bg-white" />

      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full flex-shrink-0", colors.dot)} />
          <span className="text-[13px] font-medium text-zinc-800 truncate">{node.name}</span>
        </div>
        <p className="mt-0.5 pl-4 text-[11px] text-zinc-400">{node.subtitle}</p>
      </div>

      {/* Execution timing badge */}
      {execState === "success" && (
        <span className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 rounded-full bg-white border border-zinc-200 px-1.5 py-0 text-[9px] font-medium text-zinc-500 shadow-sm whitespace-nowrap">
          142ms
        </span>
      )}
    </div>
  );
}

/* ─── Context menu ─── */
const contextMenuItems = [
  { label: "Open / Edit",   icon: Edit2,          danger: false },
  { label: "Duplicate",     icon: Copy,           danger: false },
  { label: "Add sticky note", icon: StickyNote,   danger: false },
  { label: "Pin output",    icon: Layers,         danger: false },
  { label: "View sub-flow", icon: CornerDownRight,danger: false },
  null,
  { label: "Delete",        icon: Trash2,         danger: true },
];

function NodeContextMenu({
  x, y, onClose, onDisable, disabled,
}: {
  x: number; y: number; onClose: () => void; onDisable: () => void; disabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-[100] w-52 rounded-lg border border-zinc-200 bg-white shadow-xl py-1"
      style={{ top: y, left: x }}
    >
      {contextMenuItems.map((item, i) =>
        item === null ? (
          <div key={`d${i}`} className="my-1 border-t border-zinc-100" />
        ) : (
          <button
            key={item.label}
            onClick={() => { onClose(); }}
            className={cn(
              "flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] transition-colors",
              item.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <item.icon size={13} />
            {item.label}
          </button>
        )
      )}
      <div className="my-1 border-t border-zinc-100" />
      <button
        onClick={() => { onDisable(); onClose(); }}
        className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        <span className="h-3.5 w-3.5 rounded border border-zinc-300 flex-shrink-0" />
        {disabled ? "Enable node" : "Disable node"}
      </button>
    </div>
  );
}

/* ─── Sticky note on canvas ─── */
function CanvasStickyNote({ note, onDelete }: { note: StickyNoteData; onDelete: () => void }) {
  const [text, setText] = useState(note.text);
  return (
    <div
      className="absolute rounded-md shadow-sm"
      style={{ top: note.top, left: note.left, background: note.color, width: 180, minHeight: 80 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-2 py-1">
        <StickyNote size={11} className="text-amber-600" />
        <button onClick={onDelete} className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <Plus size={11} className="rotate-45" />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-none bg-transparent px-2 pb-2 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
        rows={3}
      />
    </div>
  );
}

const controlButtons = [
  { icon: Plus,      label: "Zoom In" },
  { icon: Minus,     label: "Zoom Out" },
  { icon: Maximize2, label: "Fit View" },
  { icon: Map,       label: "Mini-map" },
];

interface StudioCanvasProps {
  selectedNodeId: string | null;
  onNodeSelect: (id: string) => void;
  onCanvasClick: () => void;
}

export function StudioCanvas({ selectedNodeId, onNodeSelect, onCanvasClick }: StudioCanvasProps) {
  const nodeMap = Object.fromEntries(canvasNodes.map((n) => [n.id, n]));
  const [execStates, setExecStates] = useState<Record<string, NodeExecState>>(execStateDefaults);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [notes, setNotes] = useState<StickyNoteData[]>(initialNotes);

  function handleContextMenu(nodeId: string, e: React.MouseEvent) {
    setContextMenu({ nodeId, x: e.clientX, y: e.clientY });
  }

  function toggleDisabled(nodeId: string) {
    setExecStates((prev) => ({
      ...prev,
      [nodeId]: prev[nodeId] === "disabled" ? "idle" : "disabled",
    }));
  }

  return (
    <div
      className="relative flex-1 overflow-auto bg-zinc-50"
      onClick={() => { onCanvasClick(); setContextMenu(null); }}
      style={{
        backgroundImage: "radial-gradient(circle, #e4e4e7 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* SVG connections */}
      <svg className="absolute inset-0 pointer-events-none" style={{ width: 1200, height: 600 }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#d4d4d8" />
          </marker>
        </defs>
        {connections.map(([fromId, toId]) => {
          const from = nodeMap[fromId];
          const to = nodeMap[toId];
          if (!from || !to) return null;
          const isFromSuccess = execStates[fromId] === "success";
          return (
            <path
              key={`${fromId}-${toId}`}
              d={getPath(from, to)}
              fill="none"
              stroke={isFromSuccess ? "#86efac" : "#d4d4d8"}
              strokeWidth={1.5}
              strokeDasharray={isFromSuccess ? "none" : "none"}
              markerEnd="url(#arrow)"
            />
          );
        })}
      </svg>

      {/* Sticky notes */}
      {notes.map((note) => (
        <CanvasStickyNote
          key={note.id}
          note={note}
          onDelete={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
        />
      ))}

      {/* Nodes */}
      {canvasNodes.map((node) => (
        <CanvasNode
          key={node.id}
          node={node}
          selected={selectedNodeId === node.id}
          execState={execStates[node.id] ?? "idle"}
          onClick={() => onNodeSelect(node.id)}
          onContextMenu={(e) => handleContextMenu(node.id, e)}
        />
      ))}

      {/* Context menu */}
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          disabled={execStates[contextMenu.nodeId] === "disabled"}
          onDisable={() => toggleDisabled(contextMenu.nodeId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Canvas controls */}
      <div className="absolute bottom-4 right-4 flex flex-col rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        {controlButtons.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            title={label}
            className={cn(
              "flex h-8 w-8 items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors",
              i > 0 && "border-t border-zinc-100"
            )}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* Add note button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setNotes((prev) => [
            ...prev,
            { id: `s${Date.now()}`, text: "", top: 350 + Math.random() * 60, left: 400 + Math.random() * 100, color: "#fef9c3" },
          ]);
        }}
        title="Add sticky note"
        className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-500 shadow-sm hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
      >
        <StickyNote size={12} />
        Add note
      </button>
    </div>
  );
}


