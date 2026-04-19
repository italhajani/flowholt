import { useState, useRef, useEffect, useCallback, useContext } from "react";
import {
  Plus, Minus, Maximize2, Map, CheckCircle2, XCircle,
  Loader2, Copy, Trash2, StickyNote, Edit2, Layers, CornerDownRight,
  Search, X, Play, Pause, Eye, Zap, ArrowRight, Pin,
  ChevronRight, GitBranch, Clock, Hash, Home, Undo2, Redo2,
  Clipboard, Scissors, Replace, Fingerprint, MousePointerSquareDashed,
  Download, Share2, MessageSquare, Sparkles, Bot, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "./useCanvasStore";

/* ── Mock node data ── */
export interface CanvasNodeData {
  id: string;
  name: string;
  subtitle: string;
  family: "trigger" | "integration" | "logic" | "ai" | "data";
  top: number;
  left: number;
}

export const familyColors: Record<string, { border: string; dot: string; accent: string; bg: string }> = {
  trigger:     { border: "border-l-green-500", dot: "bg-green-500", accent: "#22c55e", bg: "bg-green-50" },
  integration: { border: "border-l-zinc-400",  dot: "bg-zinc-400",  accent: "#a1a1aa", bg: "bg-zinc-50" },
  logic:       { border: "border-l-blue-500",  dot: "bg-blue-500",  accent: "#3b82f6", bg: "bg-blue-50" },
  ai:          { border: "border-l-violet-600",dot: "bg-violet-600",accent: "#7c3aed", bg: "bg-violet-50" },
  data:        { border: "border-l-teal-500",  dot: "bg-teal-500",  accent: "#14b8a6", bg: "bg-teal-50" },
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

const execTimings: Record<string, string> = {
  n1: "24ms", n2: "340ms", n3: "1.2s", n4: "—", n5: "—",
};

const execItemCounts: Record<string, number> = {
  n1: 45, n2: 45, n3: 42, n4: 0, n5: 0,
};

const NODE_W = 192;
const NODE_H = 60;
const GRID_SIZE = 20;
const SNAP_THRESHOLD = 8;

const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

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
  width?: number;
  height?: number;
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

/* ── Node hover toolbar ── */
function NodeToolbar({ node, execState, onRun, onPin, onEdit }: {
  node: CanvasNodeData; execState: NodeExecState;
  onRun: () => void; onPin: () => void; onEdit: () => void;
}) {
  return (
    <div
      className="absolute z-20 flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white shadow-lg px-1 py-0.5"
      style={{ top: node.top - 32, left: node.left + NODE_W / 2 - 68 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onRun} className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors" title="Run from here">
        <Play size={9} /> Run
      </button>
      <div className="w-px h-4 bg-zinc-100" />
      <button onClick={onEdit} className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors" title="Edit">
        <Edit2 size={10} />
      </button>
      <button onClick={onPin} className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors" title="Pin output">
        <Pin size={10} />
      </button>
      <button className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors" title="Copy">
        <Copy size={10} />
      </button>
      <button className="flex h-6 w-6 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
        <Trash2 size={10} />
      </button>
    </div>
  );
}

function CanvasNode({
  node,
  selected,
  execState,
  hovered,
  searchMatch,
  showOverlay,
  isPinned,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onPortDragStart,
}: {
  node: CanvasNodeData;
  selected: boolean;
  execState: NodeExecState;
  hovered: boolean;
  searchMatch: boolean;
  showOverlay: boolean;
  isPinned: boolean;
  onClick: (e?: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onPortDragStart?: (e: React.MouseEvent) => void;
}) {
  const colors = familyColors[node.family];
  const isDisabled = execState === "disabled";
  const items = execItemCounts[node.id] ?? 0;
  const timing = execTimings[node.id] ?? "—";

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e); }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={(e) => { if (e.button === 0 && !e.altKey && onDragStart) onDragStart(e); }}
      className={cn(
        "absolute w-48 rounded-lg border bg-white shadow-sm border-l-4 cursor-grab transition-all duration-150 select-none group",
        colors.border,
        isDisabled && "opacity-40 grayscale",
        searchMatch && "ring-2 ring-amber-400/50",
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
      {/* Left port (input) */}
      <span className={cn("absolute -left-[5px] top-1/2 -translate-y-1/2 h-[6px] w-[6px] rounded-full border-2 bg-white transition-colors", hovered ? "border-zinc-500" : "border-zinc-300")} />
      {/* Right port (output) — draggable for edge creation */}
      <span
        className={cn(
          "absolute -right-[7px] top-1/2 -translate-y-1/2 h-[10px] w-[10px] rounded-full border-2 bg-white transition-all cursor-crosshair hover:scale-150 hover:border-violet-500 hover:bg-violet-50 z-10",
          hovered ? "border-zinc-500" : "border-zinc-300"
        )}
        onMouseDown={(e) => { e.stopPropagation(); onPortDragStart?.(e); }}
      />
      {/* Error output port — red dot below main output when node has error */}
      {execState === "error" && (
        <span className="absolute -right-[5px] top-[72%] h-[7px] w-[7px] rounded-full border-2 border-red-400 bg-red-50 z-10" title="Error output" />
      )}

      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full flex-shrink-0", colors.dot)} />
          <span className="text-[13px] font-medium text-zinc-800 truncate">{node.name}</span>
          {isPinned && <Pin size={9} className="text-amber-500 flex-shrink-0" />}
        </div>
        <p className="mt-0.5 pl-4 text-[11px] text-zinc-400">{node.subtitle}</p>
      </div>

      {showOverlay && execState !== "idle" && execState !== "disabled" && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-2 py-0.5 shadow-sm whitespace-nowrap">
          <span className="flex items-center gap-0.5 text-[8px] text-zinc-500"><Clock size={7} />{timing}</span>
          {items > 0 && (
            <>
              <span className="text-[8px] text-zinc-200">|</span>
              <span className="flex items-center gap-0.5 text-[8px] text-zinc-500"><Hash size={7} />{items}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Context menu ─── */
type CtxMenuItem = { label: string; icon: typeof Edit2; shortcut?: string; danger?: boolean } | null;

const nodeContextItems: CtxMenuItem[] = [
  { label: "Open / Edit",          icon: Edit2,              shortcut: "Enter" },
  { label: "Run from here",        icon: Play,               shortcut: "R" },
  null,
  { label: "Copy",                 icon: Copy,               shortcut: "Ctrl+C" },
  { label: "Cut",                  icon: Scissors,           shortcut: "Ctrl+X" },
  { label: "Duplicate",            icon: Clipboard,          shortcut: "Ctrl+D" },
  null,
  { label: "Pin output",           icon: Pin,                shortcut: "P" },
  { label: "Rename",               icon: Edit2,              shortcut: "F2" },
  { label: "Copy node ID",         icon: Fingerprint },
  null,
  { label: "Replace node",         icon: Replace },
  { label: "Extract sub-workflow",  icon: CornerDownRight },
  { label: "Ask AI about this",    icon: Sparkles },
  null,
  { label: "Delete",               icon: Trash2,             shortcut: "Del",   danger: true },
];

const canvasContextItems: CtxMenuItem[] = [
  { label: "Paste",                icon: Clipboard,          shortcut: "Ctrl+V" },
  null,
  { label: "Add node",             icon: Plus,               shortcut: "Tab" },
  { label: "Add sticky note",      icon: StickyNote,         shortcut: "Shift+S" },
  null,
  { label: "Select all",           icon: MousePointerSquareDashed, shortcut: "Ctrl+A" },
  { label: "Fit to view",          icon: Maximize2,          shortcut: "1" },
  { label: "Undo",                 icon: Undo2,              shortcut: "Ctrl+Z" },
  { label: "Redo",                 icon: Redo2,              shortcut: "Ctrl+Shift+Z" },
];

function ContextMenuOverlay({
  x, y, items, onAction, onClose, extraRows,
}: {
  x: number; y: number; items: CtxMenuItem[]; onAction: (label: string) => void; onClose: () => void;
  extraRows?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  // Keep menu within viewport
  const [pos, setPos] = useState({ top: y, left: x });
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let top = y, left = x;
    if (rect.bottom > window.innerHeight - 8) top = window.innerHeight - rect.height - 8;
    if (rect.right > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    setPos({ top: Math.max(4, top), left: Math.max(4, left) });
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="fixed z-[100] w-56 rounded-lg border border-zinc-200 bg-white shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: pos.top, left: pos.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={`d${i}`} className="my-0.5 border-t border-zinc-100" />
        ) : (
          <button
            key={item.label}
            onClick={() => { onAction(item.label); onClose(); }}
            className={cn(
              "flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] transition-colors",
              item.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <item.icon size={13} className="flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <kbd className="ml-auto text-[9px] font-mono text-zinc-300">{item.shortcut}</kbd>
            )}
          </button>
        )
      )}
      {extraRows}
    </div>
  );
}

function NodeContextMenu({
  x, y, nodeId, disabled, onAction, onDisable, onClose,
}: {
  x: number; y: number; nodeId: string; disabled: boolean;
  onAction: (label: string) => void; onDisable: () => void; onClose: () => void;
}) {
  const disableRow = (
    <>
      <div className="my-0.5 border-t border-zinc-100" />
      <button
        onClick={() => { onDisable(); onClose(); }}
        className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        <Eye size={13} className={cn("flex-shrink-0", disabled && "text-amber-500")} />
        <span className="flex-1 text-left">{disabled ? "Enable node" : "Disable node"}</span>
        <kbd className="ml-auto text-[9px] font-mono text-zinc-300">D</kbd>
      </button>
    </>
  );
  return (
    <ContextMenuOverlay
      x={x} y={y} items={nodeContextItems}
      onAction={onAction} onClose={onClose}
      extraRows={disableRow}
    />
  );
}

function CanvasContextMenu({
  x, y, onAction, onClose,
}: {
  x: number; y: number; onAction: (label: string) => void; onClose: () => void;
}) {
  return <ContextMenuOverlay x={x} y={y} items={canvasContextItems} onAction={onAction} onClose={onClose} />;
}

/* ─── Sticky note on canvas ─── */
const stickyColors = [
  { name: "Yellow", bg: "#fef9c3", border: "#fde047", text: "#854d0e" },
  { name: "Blue",   bg: "#dbeafe", border: "#93c5fd", text: "#1e40af" },
  { name: "Green",  bg: "#dcfce7", border: "#86efac", text: "#166534" },
  { name: "Pink",   bg: "#fce7f3", border: "#f9a8d4", text: "#9d174d" },
  { name: "Purple", bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6" },
  { name: "Orange", bg: "#ffedd5", border: "#fdba74", text: "#9a3412" },
];

function CanvasStickyNote({ note, onUpdate, onDelete }: {
  note: StickyNoteData; onUpdate: (patch: Partial<StickyNoteData>) => void; onDelete: () => void;
}) {
  const [text, setText] = useState(note.text);
  const [width, setWidth] = useState(note.width ?? 200);
  const [height, setHeight] = useState(note.height ?? 100);
  const [showColors, setShowColors] = useState(false);
  const colorInfo = stickyColors.find(c => c.bg === note.color) ?? stickyColors[0];
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: width, startH: height };
    function onMove(ev: MouseEvent) {
      if (!resizeRef.current) return;
      const newW = Math.max(140, resizeRef.current.startW + (ev.clientX - resizeRef.current.startX));
      const newH = Math.max(60, resizeRef.current.startH + (ev.clientY - resizeRef.current.startY));
      setWidth(newW); setHeight(newH);
    }
    function onUp() {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [width, height]);

  return (
    <div
      className="absolute rounded-lg shadow-sm group/sticky select-none"
      style={{ top: note.top, left: note.left, background: colorInfo.bg, width, minHeight: height, borderLeft: `3px solid ${colorInfo.border}` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 cursor-grab">
        <div className="flex items-center gap-1.5">
          <StickyNote size={11} style={{ color: colorInfo.border }} />
          <span className="text-[9px] font-medium opacity-50" style={{ color: colorInfo.text }}>Note</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover/sticky:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setShowColors(p => !p); }}
            className="h-4 w-4 rounded flex items-center justify-center hover:bg-black/5 transition-colors"
            title="Change color"
          >
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: colorInfo.border }} />
          </button>
          <button onClick={onDelete} className="h-4 w-4 rounded flex items-center justify-center hover:bg-black/5 transition-colors" title="Delete note">
            <X size={9} style={{ color: colorInfo.text }} />
          </button>
        </div>
      </div>
      {/* Color picker */}
      {showColors && (
        <div className="absolute top-8 right-1 z-30 flex gap-1 rounded-lg bg-white border border-zinc-200 shadow-lg p-1.5" onClick={(e) => e.stopPropagation()}>
          {stickyColors.map(c => (
            <button
              key={c.name}
              onClick={() => { onUpdate({ color: c.bg }); setShowColors(false); }}
              className={cn("h-5 w-5 rounded-full border-2 transition-transform hover:scale-110", note.color === c.bg ? "border-zinc-600 scale-110" : "border-transparent")}
              style={{ background: c.bg }}
              title={c.name}
            />
          ))}
        </div>
      )}
      {/* Editable text */}
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); onUpdate({ text: e.target.value }); }}
        className="w-full resize-none bg-transparent px-2.5 pb-2 text-[11px] leading-relaxed placeholder:opacity-40 focus:outline-none"
        style={{ color: colorInfo.text, minHeight: height - 32 }}
        placeholder="Type a note..."
      />
      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover/sticky:opacity-40 transition-opacity"
        onMouseDown={handleResizeMouseDown}
      >
        <svg viewBox="0 0 16 16" fill={colorInfo.border}>
          <path d="M14 16L16 14V16H14ZM8 16L16 8V10L10 16H8ZM2 16L16 2V4L4 16H2Z" />
        </svg>
      </div>
    </div>
  );
}

/* ── Canvas Search Overlay ── */
function CanvasSearch({ query, onChange, results, onSelect, onClose }: {
  query: string;
  onChange: (v: string) => void;
  results: CanvasNodeData[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-72 rounded-xl border border-zinc-200 bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100">
        <Search size={13} className="text-zinc-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search nodes…"
          className="flex-1 text-[12px] outline-none bg-transparent text-zinc-700 placeholder:text-zinc-300"
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        />
        <button onClick={onClose} className="text-zinc-300 hover:text-zinc-500"><X size={12} /></button>
      </div>
      {query && results.length > 0 && (
        <div className="max-h-[200px] overflow-y-auto">
          {results.map((node) => {
            const colors = familyColors[node.family];
            return (
              <button
                key={node.id}
                onClick={() => { onSelect(node.id); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-zinc-50 transition-colors"
              >
                <span className={cn("h-2 w-2 rounded-full flex-shrink-0", colors.dot)} />
                <span className="text-[12px] text-zinc-700 flex-1 truncate">{node.name}</span>
                <span className="text-[9px] text-zinc-300 font-medium uppercase">{node.family}</span>
              </button>
            );
          })}
        </div>
      )}
      {query && results.length === 0 && (
        <div className="px-3 py-3 text-[11px] text-zinc-400 text-center">No nodes found</div>
      )}
    </div>
  );
}

/* ── Minimap ── */
function Minimap({ nodes, edges, execStates, selectedNodeId, canvasW, canvasH, zoom, pan, onPan }: {
  nodes: CanvasNodeData[];
  edges: [string, string][];
  execStates: Record<string, NodeExecState>;
  selectedNodeId: string | null;
  canvasW: number;
  canvasH: number;
  zoom: number;
  pan: { x: number; y: number };
  onPan: (x: number, y: number) => void;
}) {
  const scale = 0.12;
  const w = canvasW * scale;
  const h = canvasH * scale;

  /* Viewport rectangle in minimap coords */
  const containerRef = useRef<HTMLDivElement>(null);
  const vpW = (window.innerWidth / zoom) * scale;
  const vpH = (window.innerHeight / zoom) * scale;
  const vpX = (-pan.x / zoom) * scale + 8;
  const vpY = (-pan.y / zoom) * scale + 8;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left - 8;
    const clickY = e.clientY - rect.top - 8;
    const canvasX = clickX / scale;
    const canvasY = clickY / scale;
    onPan(-canvasX * zoom + window.innerWidth / 2, -canvasY * zoom + window.innerHeight / 2);
  };

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-zinc-200 bg-white/90 shadow-sm overflow-hidden backdrop-blur-sm cursor-crosshair"
      style={{ width: w + 16, height: h + 16 }}
      onClick={handleClick}
    >
      <svg width={w + 16} height={h + 16} className="block">
        {edges.map(([fromId, toId]) => {
          const from = nodes.find(n => n.id === fromId);
          const to = nodes.find(n => n.id === toId);
          if (!from || !to) return null;
          const x1 = (from.left + NODE_W) * scale + 8;
          const y1 = (from.top + NODE_H / 2) * scale + 8;
          const x2 = to.left * scale + 8;
          const y2 = (to.top + NODE_H / 2) * scale + 8;
          return <line key={`${fromId}-${toId}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4d4d8" strokeWidth={0.5} />;
        })}
        {nodes.map((node) => {
          const colors = familyColors[node.family];
          const isSelected = selectedNodeId === node.id;
          const state = execStates[node.id] ?? "idle";
          return (
            <rect
              key={node.id}
              x={node.left * scale + 8}
              y={node.top * scale + 8}
              width={NODE_W * scale}
              height={NODE_H * scale}
              rx={2}
              fill={state === "success" ? "#bbf7d0" : state === "error" ? "#fecaca" : state === "running" ? "#bfdbfe" : "#f4f4f5"}
              stroke={isSelected ? "#18181b" : colors.accent}
              strokeWidth={isSelected ? 1.5 : 0.5}
            />
          );
        })}
        {/* Viewport rectangle */}
        <rect
          x={Math.max(0, vpX)}
          y={Math.max(0, vpY)}
          width={Math.min(vpW, w + 16)}
          height={Math.min(vpH, h + 16)}
          fill="rgba(99,102,241,0.06)"
          stroke="#6366f1"
          strokeWidth={1}
          strokeDasharray="3 2"
          rx={2}
          className="pointer-events-none"
        />
      </svg>
    </div>
  );
}

/* ── Execution overlay bar ── */
function ExecutionOverlayBar({ execStates, nodes }: { execStates: Record<string, NodeExecState>; nodes: CanvasNodeData[] }) {
  const successCount = nodes.filter(n => execStates[n.id] === "success").length;
  const runningCount = nodes.filter(n => execStates[n.id] === "running").length;
  const errorCount = nodes.filter(n => execStates[n.id] === "error").length;
  const total = nodes.length;

  if (successCount === 0 && runningCount === 0 && errorCount === 0) return null;

  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/95 backdrop-blur-sm px-3 py-1.5 shadow-sm" onClick={(e) => e.stopPropagation()}>
      <GitBranch size={11} className="text-zinc-400" />
      <span className="text-[10px] font-medium text-zinc-600">Execution</span>
      <div className="flex items-center gap-1.5 ml-1">
        {successCount > 0 && (
          <span className="flex items-center gap-0.5 rounded-full bg-green-50 border border-green-200 px-1.5 py-0.5 text-[8px] font-semibold text-green-600">
            <CheckCircle2 size={8} /> {successCount}/{total}
          </span>
        )}
        {runningCount > 0 && (
          <span className="flex items-center gap-0.5 rounded-full bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[8px] font-semibold text-blue-600">
            <Loader2 size={8} className="animate-spin" /> {runningCount}
          </span>
        )}
        {errorCount > 0 && (
          <span className="flex items-center gap-0.5 rounded-full bg-red-50 border border-red-200 px-1.5 py-0.5 text-[8px] font-semibold text-red-600">
            <XCircle size={8} /> {errorCount}
          </span>
        )}
      </div>
      {/* Progress bar */}
      <div className="w-16 h-1.5 rounded-full bg-zinc-100 overflow-hidden ml-1">
        <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all" style={{ width: `${(successCount / total) * 100}%` }} />
      </div>
    </div>
  );
}

/* ── Canvas floating AI chat ── */
function CanvasAiChat({ open, onToggle, messages, input, onInputChange, onSend }: {
  open: boolean;
  onToggle: () => void;
  messages: { role: "user" | "assistant"; text: string }[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const quickActions = [
    "Add error handling",
    "Optimize this workflow",
    "Add a conditional branch",
    "Explain this workflow",
  ];

  return (
    <>
      {/* FAB button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={cn(
          "absolute bottom-16 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          open
            ? "bg-zinc-800 text-white scale-95"
            : "bg-gradient-to-br from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 hover:shadow-xl hover:scale-105",
        )}
        title="AI Assistant"
      >
        {open ? <X size={16} /> : <Bot size={18} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="absolute bottom-28 right-4 z-30 flex w-80 flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: 420 }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 bg-gradient-to-r from-violet-50/50 to-white">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100">
              <Sparkles size={12} className="text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-zinc-800">AI Assistant</p>
              <p className="text-[9px] text-zinc-400">Ask about your workflow</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5" style={{ maxHeight: 260 }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center py-4">
                <Bot size={24} className="text-zinc-300 mb-2" />
                <p className="text-[11px] text-zinc-400 text-center mb-3">How can I help with your workflow?</p>
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        onInputChange(action);
                        setTimeout(onSend, 50);
                      }}
                      className="rounded-md border border-zinc-100 px-2 py-1.5 text-[10px] text-zinc-500 hover:bg-zinc-50 hover:border-zinc-200 transition-colors text-left"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2", msg.role === "user" && "justify-end")}>
                  {msg.role === "assistant" && (
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-violet-100 mt-0.5">
                      <Sparkles size={9} className="text-violet-600" />
                    </div>
                  )}
                  <div className={cn(
                    "rounded-lg px-3 py-2 text-[11px] leading-relaxed max-w-[85%]",
                    msg.role === "user"
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-50 text-zinc-700 border border-zinc-100",
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-zinc-100 px-3 py-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-1">
              <input
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                placeholder="Ask about your workflow..."
                className="flex-1 bg-transparent text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                onClick={onSend}
                disabled={!input.trim()}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                  input.trim()
                    ? "bg-violet-600 text-white hover:bg-violet-500"
                    : "text-zinc-300",
                )}
              >
                <Send size={11} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const controlButtons = [
  { icon: Plus,      label: "Zoom In" },
  { icon: Minus,     label: "Zoom Out" },
  { icon: Maximize2, label: "Fit View" },
  { icon: Map,       label: "Mini-map" },
  { icon: Search,    label: "Search" },
  { icon: Undo2,     label: "Undo" },
  { icon: Redo2,     label: "Redo" },
];

interface StudioCanvasProps {
  selectedNodeId: string | null;
  onNodeSelect: (id: string) => void;
  onCanvasClick: () => void;
}

export function StudioCanvas({ selectedNodeId, onNodeSelect, onCanvasClick }: StudioCanvasProps) {
  const store = useCanvasStore();
  const nodes = store.nodes;
  const setNodes = store.setNodes;
  const execStates = store.execStates;
  const setExecStates = store.setExecStates;
  const edgeList = store.edges;
  const setEdgeList = store.setEdges;
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const [contextMenu, setContextMenu] = useState<{ nodeId: string | null; x: number; y: number } | null>(null);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>(initialNotes);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOverlay, setShowOverlay] = useState(true);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [alignGuides, setAlignGuides] = useState<{ x?: number; y?: number }>({});

  // Zoom + pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Node drag state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, nodeTop: 0, nodeLeft: 0 });

  // Connection drawing state
  const [drawingEdge, setDrawingEdge] = useState<{ fromId: string; toX: number; toY: number } | null>(null);

  // Hovered edge for quick-add
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const searchResults = searchQuery
    ? nodes.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleQuickAddNode = useCallback((fromId: string, toId: string) => {
    const from = nodeMap[fromId];
    const to = nodeMap[toId];
    if (!from || !to) return;
    const midX = (from.left + NODE_W + to.left) / 2 - NODE_W / 2;
    const midY = (from.top + to.top) / 2;
    const newNode: CanvasNodeData = {
      id: `n${Date.now()}`,
      name: "New Node",
      subtitle: "Select type…",
      family: "logic",
      top: midY,
      left: midX,
    };
    setNodes(prev => [...prev, newNode]);
    setExecStates(prev => ({ ...prev, [newNode.id]: "idle" }));
    setEdgeList(prev => [
      ...prev.filter(([f, t]) => !(f === fromId && t === toId)),
      [fromId, newNode.id],
      [newNode.id, toId],
    ]);
    onNodeSelect(newNode.id);
    setHoveredEdge(null);
  }, [nodeMap, setNodes, setExecStates, setEdgeList, onNodeSelect]);

  const handleContextMenu = useCallback((nodeId: string, e: React.MouseEvent) => {
    setContextMenu({ nodeId, x: e.clientX, y: e.clientY });
  }, []);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ nodeId: null, x: e.clientX, y: e.clientY });
  }, []);

  const handleContextAction = useCallback((label: string) => {
    const nodeId = contextMenu?.nodeId;
    if (nodeId) {
      // Node actions
      if (label === "Open / Edit") onNodeSelect(nodeId);
      if (label === "Copy node ID") navigator.clipboard?.writeText(nodeId);
      if (label === "Duplicate") {
        const src = nodeMap[nodeId];
        if (src) {
          const dup: CanvasNodeData = { ...src, id: `n${Date.now()}`, top: src.top + 40, left: src.left + 40 };
          setNodes(prev => [...prev, dup]);
          setExecStates(prev => ({ ...prev, [dup.id]: "idle" }));
        }
      }
      if (label === "Delete") {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        setEdgeList(prev => prev.filter(([f, t]) => f !== nodeId && t !== nodeId));
        onCanvasClick();
      }
      if (label === "Pin output") {
        setExecStates(prev => ({ ...prev, [nodeId]: prev[nodeId] === "success" ? "idle" : "success" }));
      }
    } else {
      // Canvas background actions
      if (label === "Select all") setSelectedNodeIds(new Set(nodes.map(n => n.id)));
      if (label === "Fit to view") fitView();
      if (label === "Undo") store.undo();
      if (label === "Redo") store.redo();
      if (label === "Add sticky note") {
        const rect = canvasRef.current?.getBoundingClientRect();
        const cx = rect ? ((contextMenu?.x ?? 0) - rect.left - pan.x) / zoom : 350;
        const cy = rect ? ((contextMenu?.y ?? 0) - rect.top - pan.y) / zoom : 350;
        setStickyNotes(prev => [...prev, { id: `s${Date.now()}`, text: "", top: cy, left: cx, color: "#fef9c3" }]);
      }
      if (label === "Add node") {
        const rect = canvasRef.current?.getBoundingClientRect();
        const cx = rect ? ((contextMenu?.x ?? 0) - rect.left - pan.x) / zoom : 400;
        const cy = rect ? ((contextMenu?.y ?? 0) - rect.top - pan.y) / zoom : 200;
        const newNode: CanvasNodeData = { id: `n${Date.now()}`, name: "New Node", subtitle: "Select type...", family: "logic", top: cy, left: cx };
        setNodes(prev => [...prev, newNode]);
        setExecStates(prev => ({ ...prev, [newNode.id]: "idle" }));
        onNodeSelect(newNode.id);
      }
    }
    setContextMenu(null);
  }, [contextMenu, nodeMap, nodes, setNodes, setExecStates, setEdgeList, onNodeSelect, onCanvasClick, fitView, store, pan, zoom]);

  function toggleDisabled(nodeId: string) {
    setExecStates((prev) => ({
      ...prev,
      [nodeId]: prev[nodeId] === "disabled" ? "idle" : "disabled",
    }));
  }

  // ── Zoom with scroll wheel ──
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(z => Math.max(0.25, Math.min(2, z + delta)));
  }, []);

  const zoomIn = () => setZoom(z => Math.min(2, z + 0.15));
  const zoomOut = () => setZoom(z => Math.max(0.25, z - 0.15));
  const fitView = () => {
    if (nodes.length === 0) { setZoom(1); setPan({ x: 0, y: 0 }); return; }
    const minX = Math.min(...nodes.map(n => n.left));
    const maxX = Math.max(...nodes.map(n => n.left + NODE_W));
    const minY = Math.min(...nodes.map(n => n.top));
    const maxY = Math.max(...nodes.map(n => n.top + NODE_H));
    const bw = maxX - minX + 80;
    const bh = maxY - minY + 80;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) { setZoom(1); setPan({ x: 0, y: 0 }); return; }
    const scaleX = rect.width / bw;
    const scaleY = rect.height / bh;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.85, 0.25), 1.5);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setPan({ x: rect.width / 2 - cx * newZoom, y: rect.height / 2 - cy * newZoom });
    setZoom(newZoom);
  };

  // ── Drop handler for inserting nodes from the InsertPane ──
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/flowholt-node");
    if (!data) return;
    try {
      const nodeInfo = JSON.parse(data) as { name: string; subtitle: string; family: string };
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      const newNode: CanvasNodeData = {
        id: `n${Date.now()}`,
        name: nodeInfo.name,
        subtitle: nodeInfo.subtitle,
        family: (nodeInfo.family || "integration") as CanvasNodeData["family"],
        top: y - 30,
        left: x - 96,
      };
      setNodes(prev => [...prev, newNode]);
      setExecStates(prev => ({ ...prev, [newNode.id]: "idle" }));
    } catch { /* ignore bad data */ }
  }, [pan, zoom]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // ── Pan with middle-click or space+drag ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
      return;
    }
    // Node dragging with alignment guides
    if (draggingNodeId) {
      const dx = (e.clientX - dragStart.current.x) / zoom;
      const dy = (e.clientY - dragStart.current.y) / zoom;
      const newTop = dragStart.current.nodeTop + dy;
      const newLeft = dragStart.current.nodeLeft + dx;
      // Check alignment with other nodes
      const guides: { x?: number; y?: number } = {};
      for (const n of nodes) {
        if (n.id === draggingNodeId) continue;
        if (Math.abs(n.top - newTop) < SNAP_THRESHOLD) guides.y = n.top;
        if (Math.abs(n.left - newLeft) < SNAP_THRESHOLD) guides.x = n.left;
        if (Math.abs((n.left + NODE_W / 2) - (newLeft + NODE_W / 2)) < SNAP_THRESHOLD) guides.x = n.left;
      }
      setAlignGuides(guides);
      setNodes(prev => prev.map(n =>
        n.id === draggingNodeId ? { ...n, top: newTop, left: newLeft } : n
      ));
      return;
    }
    // Edge drawing
    if (drawingEdge && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDrawingEdge(prev => prev ? {
        ...prev,
        toX: (e.clientX - rect.left - pan.x) / zoom,
        toY: (e.clientY - rect.top - pan.y) / zoom,
      } : null);
    }
  }, [isPanning, draggingNodeId, drawingEdge, zoom, pan]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setIsPanning(false); return; }
    if (draggingNodeId) {
      // Snap to grid on release if enabled
      if (snapEnabled) {
        setNodes(prev => prev.map(n =>
          n.id === draggingNodeId ? { ...n, top: snapToGrid(n.top), left: snapToGrid(n.left) } : n
        ));
      }
      setDraggingNodeId(null);
      setAlignGuides({});
      return;
    }
    if (drawingEdge) {
      // Check if we dropped on a node port
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mx = (e.clientX - rect.left - pan.x) / zoom;
        const my = (e.clientY - rect.top - pan.y) / zoom;
        const targetNode = nodes.find(n =>
          n.id !== drawingEdge.fromId &&
          mx >= n.left - 10 && mx <= n.left + 15 &&
          my >= n.top && my <= n.top + NODE_H
        );
        if (targetNode && !edgeList.some(([f, t]) => f === drawingEdge.fromId && t === targetNode.id)) {
          setEdgeList(prev => [...prev, [drawingEdge.fromId, targetNode.id]]);
        }
      }
      setDrawingEdge(null);
    }
  }, [isPanning, draggingNodeId, drawingEdge, nodes, edgeList, zoom, pan]);

  // Node drag start
  const startNodeDrag = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDraggingNodeId(nodeId);
    dragStart.current = { x: e.clientX, y: e.clientY, nodeTop: node.top, nodeLeft: node.left };
  }, [nodes]);

  // Edge draw start from right port
  const startEdgeDraw = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDrawingEdge({ fromId: nodeId, toX: node.left + NODE_W + 10, toY: node.top + NODE_H / 2 });
  }, [nodes]);

  const handleControlClick = useCallback((label: string) => {
    if (label === "Zoom In") zoomIn();
    if (label === "Zoom Out") zoomOut();
    if (label === "Fit View") fitView();
    if (label === "Mini-map") setShowMinimap(p => !p);
    if (label === "Search") setShowSearch(p => !p);
    if (label === "Undo") store.undo();
    if (label === "Redo") store.redo();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isInputFocused = document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || (document.activeElement as HTMLElement)?.contentEditable === "true";
      if (isInputFocused) return;

      if (e.ctrlKey && e.key === "f") { e.preventDefault(); setShowSearch(true); }
      if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); setSelectedNodeIds(new Set()); setContextMenu(null); }
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) { e.preventDefault(); store.undo(); }
      if (e.ctrlKey && e.shiftKey && e.key === "Z") { e.preventDefault(); store.redo(); }
      // Ctrl+A: select all nodes
      if (e.ctrlKey && e.key === "a") { e.preventDefault(); setSelectedNodeIds(new Set(nodes.map(n => n.id))); }
      // Ctrl+D: duplicate selected node
      if (e.ctrlKey && e.key === "d" && selectedNodeId) {
        e.preventDefault();
        const src = nodeMap[selectedNodeId];
        if (src) {
          const dup: CanvasNodeData = { ...src, id: `n${Date.now()}`, top: src.top + 40, left: src.left + 40 };
          setNodes(prev => [...prev, dup]);
          setExecStates(prev => ({ ...prev, [dup.id]: "idle" }));
          onNodeSelect(dup.id);
        }
      }
      // D: toggle disable on selected node
      if (e.key === "d" && !e.ctrlKey && !e.metaKey && selectedNodeId) {
        e.preventDefault(); toggleDisabled(selectedNodeId);
      }
      // P: pin/unpin output on selected node
      if (e.key === "p" && !e.ctrlKey && selectedNodeId) {
        e.preventDefault();
        setExecStates(prev => ({ ...prev, [selectedNodeId]: prev[selectedNodeId] === "success" ? "idle" : "success" }));
      }
      // Shift+S: add sticky note
      if (e.shiftKey && e.key === "S" && !e.ctrlKey) {
        e.preventDefault();
        setStickyNotes(prev => [...prev, { id: `s${Date.now()}`, text: "", top: 300 + Math.random() * 80, left: 400 + Math.random() * 100, color: "#fef9c3" }]);
      }
      // 1: fit to view
      if (e.key === "1" && !e.ctrlKey && !e.metaKey) { fitView(); }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedNodeIds.size > 0) {
          const idsToDelete = selectedNodeIds;
          setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)));
          setEdgeList(prev => prev.filter(([f, t]) => !idsToDelete.has(f) && !idsToDelete.has(t)));
          setSelectedNodeIds(new Set());
        } else if (selectedNodeId) {
          setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
          setEdgeList(prev => prev.filter(([f, t]) => f !== selectedNodeId && t !== selectedNodeId));
          onCanvasClick();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNodeId, selectedNodeIds, nodes, nodeMap, onCanvasClick, store, fitView]);

  const CANVAS_W = 1200;
  const CANVAS_H = 600;

  return (
    <div
      ref={canvasRef}
      className={cn("relative flex-1 overflow-hidden bg-zinc-50", isPanning && "cursor-grabbing")}
      onClick={() => { onCanvasClick(); setContextMenu(null); }}
      onContextMenu={handleCanvasContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        backgroundImage: "radial-gradient(circle, #e4e4e7 1px, transparent 1px)",
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Breadcrumb trail */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/95 backdrop-blur-sm px-3 py-1.5 shadow-sm" onClick={(e) => e.stopPropagation()}>
        <Home size={11} className="text-zinc-400" />
        <ChevronRight size={10} className="text-zinc-300" />
        <span className="text-[10px] text-zinc-400 hover:text-zinc-600 cursor-pointer">Workflows</span>
        <ChevronRight size={10} className="text-zinc-300" />
        <span className="text-[10px] font-medium text-zinc-700">Lead Qualification Pipeline</span>
        <ChevronRight size={10} className="text-zinc-300" />
        <span className="text-[10px] text-zinc-500">Editor</span>
      </div>

      {/* Transformed canvas layer */}
      <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>

      {/* SVG connections with animated execution flow */}
      <svg className="absolute inset-0 pointer-events-none" style={{ width: CANVAS_W, height: CANVAS_H }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#d4d4d8" />
          </marker>
          <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#86efac" />
          </marker>
          <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#93c5fd" />
          </marker>
          <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#fca5a5" />
          </marker>
        </defs>
        {edgeList.map(([fromId, toId]) => {
          const from = nodeMap[fromId];
          const to = nodeMap[toId];
          if (!from || !to) return null;
          const fromState = execStates[fromId];
          const isSuccess = fromState === "success";
          const isRunning = fromState === "running";
          const pathD = getPath(from, to);
          const edgeKey = `${fromId}-${toId}`;
          const items = execItemCounts[fromId] ?? 0;
          const midX = (from.left + NODE_W + to.left) / 2;
          const midY = (from.top + NODE_H / 2 + to.top + NODE_H / 2) / 2;
          return (
            <g key={edgeKey}>
              {/* Invisible wider path for hover detection */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEdge(edgeKey)}
                onMouseLeave={() => setHoveredEdge(null)}
                style={{ pointerEvents: "stroke" }}
              />
              <path
                d={pathD}
                fill="none"
                stroke={isSuccess ? "#86efac" : isRunning ? "#93c5fd" : hoveredEdge === edgeKey ? "#a1a1aa" : "#d4d4d8"}
                strokeWidth={isSuccess || isRunning ? 2 : hoveredEdge === edgeKey ? 2 : 1.5}
                markerEnd={isSuccess ? "url(#arrow-green)" : isRunning ? "url(#arrow-blue)" : "url(#arrow)"}
                className="pointer-events-none"
              />
              {/* Error overlay on edges from error nodes */}
              {fromState === "error" && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#fca5a5"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  markerEnd="url(#arrow-red)"
                  className="pointer-events-none"
                  opacity={0.8}
                />
              )}
              {/* Connection label — item count on successful edges */}
              {isSuccess && items > 0 && showOverlay && (
                <g className="pointer-events-none">
                  <rect x={midX - 14} y={midY - 9} width={28} height={16} rx={4} fill="white" stroke="#e4e4e7" strokeWidth={0.5} />
                  <text x={midX} y={midY + 2} textAnchor="middle" fill="#71717a" fontSize={8} fontWeight={500} fontFamily="system-ui">{items}</text>
                </g>
              )}
              {isRunning && showOverlay && (
                <circle r="3" fill="#3b82f6" opacity="0.8">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path={pathD} />
                </circle>
              )}
              {isSuccess && showOverlay && (
                <circle r="2" fill="#22c55e" opacity="0.5">
                  <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
                </circle>
              )}
            </g>
          );
        })}
        {/* Drawing edge preview */}
        {drawingEdge && (() => {
          const from = nodeMap[drawingEdge.fromId];
          if (!from) return null;
          const x1 = from.left + NODE_W;
          const y1 = from.top + NODE_H / 2;
          const dx = (drawingEdge.toX - x1) * 0.5;
          return (
            <path
              d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${drawingEdge.toX - dx} ${drawingEdge.toY}, ${drawingEdge.toX} ${drawingEdge.toY}`}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.7}
            />
          );
        })()}
      </svg>

      {/* Alignment guides */}
      {(alignGuides.x !== undefined || alignGuides.y !== undefined) && (
        <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
          {alignGuides.y !== undefined && (
            <line x1="0" x2="100%" y1={alignGuides.y + NODE_H / 2} y2={alignGuides.y + NODE_H / 2}
              stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          )}
          {alignGuides.x !== undefined && (
            <line y1="0" y2="100%" x1={alignGuides.x + NODE_W / 2} x2={alignGuides.x + NODE_W / 2}
              stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          )}
        </svg>
      )}

      {/* Sticky notes */}
      {stickyNotes.map((note) => (
        <CanvasStickyNote
          key={note.id}
          note={note}
          onUpdate={(patch) => setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, ...patch } : n))}
          onDelete={() => setStickyNotes((prev) => prev.filter((n) => n.id !== note.id))}
        />
      ))}

      {/* Quick-add "+" button on hovered edge midpoint */}
      {hoveredEdge && (() => {
        const [fromId, toId] = hoveredEdge.split("-");
        const from = nodeMap[fromId];
        const to = nodeMap[toId];
        if (!from || !to) return null;
        const midX = (from.left + NODE_W + to.left) / 2;
        const midY = (from.top + NODE_H / 2 + to.top + NODE_H / 2) / 2;
        return (
          <button
            className="absolute z-30 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg hover:bg-violet-600 hover:scale-110 transition-all"
            style={{ top: midY - 12, left: midX - 12 }}
            onClick={(e) => { e.stopPropagation(); handleQuickAddNode(fromId, toId); }}
            onMouseEnter={() => setHoveredEdge(hoveredEdge)}
            title="Insert node here"
          >
            <Plus size={12} />
          </button>
        );
      })()}

      {/* Node hover toolbar */}
      {hoveredNodeId && !contextMenu && !draggingNodeId && nodeMap[hoveredNodeId] && (
        <NodeToolbar
          node={nodeMap[hoveredNodeId]}
          execState={execStates[hoveredNodeId] ?? "idle"}
          onRun={() => {}}
          onPin={() => {}}
          onEdit={() => onNodeSelect(hoveredNodeId)}
        />
      )}

      {/* Nodes */}
      {nodes.map((node) => (
        <CanvasNode
          key={node.id}
          node={node}
          selected={selectedNodeId === node.id || selectedNodeIds.has(node.id)}
          execState={execStates[node.id] ?? "idle"}
          hovered={hoveredNodeId === node.id}
          searchMatch={searchQuery ? searchResults.some(r => r.id === node.id) : false}
          showOverlay={showOverlay}
          isPinned={store.pinnedNodes.has(node.id)}
          onClick={(e?: React.MouseEvent) => {
            if (e?.shiftKey) {
              setSelectedNodeIds(prev => {
                const next = new Set(prev);
                if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
                return next;
              });
            } else {
              setSelectedNodeIds(new Set());
              onNodeSelect(node.id);
            }
          }}
          onContextMenu={(e) => handleContextMenu(node.id, e)}
          onMouseEnter={() => setHoveredNodeId(node.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          onDragStart={(e) => startNodeDrag(node.id, e)}
          onPortDragStart={(e) => startEdgeDraw(node.id, e)}
        />
      ))}

      </div>{/* end transform layer */}

      {/* Execution overlay bar (fixed position, not affected by zoom) */}
      {showOverlay && <ExecutionOverlayBar execStates={execStates} nodes={nodes} />}

      {/* Canvas search (fixed position) */}
      {showSearch && (
        <CanvasSearch
          query={searchQuery}
          onChange={setSearchQuery}
          results={searchResults}
          onSelect={(id) => { onNodeSelect(id); setSearchQuery(""); }}
          onClose={() => { setShowSearch(false); setSearchQuery(""); }}
        />
      )}

      {/* Context menu */}
      {contextMenu && contextMenu.nodeId && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          disabled={execStates[contextMenu.nodeId] === "disabled"}
          onAction={handleContextAction}
          onDisable={() => toggleDisabled(contextMenu.nodeId!)}
          onClose={() => setContextMenu(null)}
        />
      )}
      {contextMenu && !contextMenu.nodeId && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Canvas controls */}
      <div className="absolute bottom-4 right-4 flex flex-col rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        {controlButtons.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            title={label}
            onClick={(e) => { e.stopPropagation(); handleControlClick(label); }}
            className={cn(
              "flex h-8 w-8 items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors",
              i > 0 && "border-t border-zinc-100",
              label === "Mini-map" && showMinimap && "bg-zinc-100 text-zinc-700",
              label === "Search" && showSearch && "bg-zinc-100 text-zinc-700",
            )}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-16 mr-2 rounded-md bg-white border border-zinc-200 px-2 py-0.5 text-[9px] font-mono text-zinc-400 shadow-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* Minimap */}
      {showMinimap && (
        <div className="absolute bottom-4 right-28">
          <Minimap
            nodes={nodes}
            edges={edgeList}
            execStates={execStates}
            selectedNodeId={selectedNodeId}
            canvasW={CANVAS_W}
            canvasH={CANVAS_H}
            zoom={zoom}
            pan={pan}
            onPan={(x, y) => setPan({ x, y })}
          />
        </div>
      )}

      {/* Bottom left controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setStickyNotes((prev) => [
              ...prev,
              { id: `s${Date.now()}`, text: "", top: 350 + Math.random() * 60, left: 400 + Math.random() * 100, color: "#fef9c3" },
            ]);
          }}
          title="Add sticky note"
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-500 shadow-sm hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
        >
          <StickyNote size={12} />
          Add note
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowOverlay(p => !p); }}
          title="Toggle execution overlay"
          className={cn(
            "flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium shadow-sm transition-colors",
            showOverlay ? "text-green-600 hover:bg-green-50" : "text-zinc-400 hover:bg-zinc-50"
          )}
        >
          <Eye size={12} />
          {showOverlay ? "Overlay on" : "Overlay off"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setSnapEnabled(p => !p); }}
          title="Toggle snap to grid"
          className={cn(
            "flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium shadow-sm transition-colors",
            snapEnabled ? "text-blue-600 hover:bg-blue-50" : "text-zinc-400 hover:bg-zinc-50"
          )}
        >
          <Hash size={12} />
          {snapEnabled ? "Snap on" : "Snap off"}
        </button>
        {selectedNodeIds.size > 0 && (
          <span className="rounded-md bg-zinc-100 border border-zinc-200 px-2 py-1 text-[10px] font-medium text-zinc-500">
            {selectedNodeIds.size} selected
          </span>
        )}
      </div>

      {/* Floating AI Chat */}
      <CanvasAiChat
        open={showAiChat}
        onToggle={() => setShowAiChat((p) => !p)}
        messages={aiChatMessages}
        input={aiChatInput}
        onInputChange={setAiChatInput}
        onSend={() => {
          if (!aiChatInput.trim()) return;
          const q = aiChatInput.trim();
          setAiChatMessages((p) => [...p, { role: "user", text: q }]);
          setAiChatInput("");
          setTimeout(() => {
            const responses = [
              `I can help with that! For "${q}", I'd suggest adding a conditional node after your trigger to filter the data first.`,
              `Good question! Looking at your workflow, you could optimize the "${q}" part by using a batch processing node.`,
              `To handle "${q}", try connecting an error handler node after any integration nodes that might fail.`,
            ];
            setAiChatMessages((p) => [...p, { role: "assistant", text: responses[Math.floor(Math.random() * responses.length)] }]);
          }, 1200);
        }}
      />
    </div>
  );
}
