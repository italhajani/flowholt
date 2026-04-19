import { useState, useEffect, useCallback } from "react";
import {
  Keyboard, Search, X, Command, ChevronRight,
  Mouse, Layout, Columns, Terminal, Zap, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Shortcut definitions ── */
interface Shortcut {
  keys: string[];
  label: string;
  context: string;
}

const shortcuts: Shortcut[] = [
  // Global
  { keys: ["Ctrl", "K"], label: "Open command palette", context: "Global" },
  { keys: ["?"], label: "Show keyboard shortcuts", context: "Global" },
  { keys: ["Ctrl", "S"], label: "Save workflow", context: "Global" },
  { keys: ["Ctrl", "Shift", "E"], label: "Toggle sidebar", context: "Global" },
  { keys: ["Ctrl", ","], label: "Open settings", context: "Global" },
  { keys: ["Esc"], label: "Close modal / panel", context: "Global" },
  // Canvas
  { keys: ["Tab"], label: "Open node picker", context: "Canvas" },
  { keys: ["Shift", "S"], label: "Add sticky note", context: "Canvas" },
  { keys: ["Ctrl", "F"], label: "Search nodes on canvas", context: "Canvas" },
  { keys: ["Ctrl", "Z"], label: "Undo", context: "Canvas" },
  { keys: ["Ctrl", "Shift", "Z"], label: "Redo", context: "Canvas" },
  { keys: ["Ctrl", "A"], label: "Select all nodes", context: "Canvas" },
  { keys: ["Ctrl", "C"], label: "Copy selected nodes", context: "Canvas" },
  { keys: ["Ctrl", "V"], label: "Paste nodes", context: "Canvas" },
  { keys: ["Del"], label: "Delete selected nodes", context: "Canvas" },
  { keys: ["Ctrl", "D"], label: "Duplicate selection", context: "Canvas" },
  { keys: ["+"], label: "Zoom in", context: "Canvas" },
  { keys: ["-"], label: "Zoom out", context: "Canvas" },
  { keys: ["0"], label: "Fit to view", context: "Canvas" },
  { keys: ["Space", "Drag"], label: "Pan canvas", context: "Canvas" },
  // Inspector
  { keys: ["Enter"], label: "Open selected node inspector", context: "Inspector" },
  { keys: ["P"], label: "Pin/unpin node data", context: "Inspector" },
  { keys: ["Ctrl", "Enter"], label: "Execute current node", context: "Inspector" },
  { keys: ["Ctrl", "Shift", "P"], label: "Open expression editor", context: "Inspector" },
  { keys: ["Tab"], label: "Next parameter field", context: "Inspector" },
  { keys: ["Shift", "Tab"], label: "Previous parameter field", context: "Inspector" },
  // Lists & Navigation
  { keys: ["J"], label: "Move down in list", context: "Lists" },
  { keys: ["K"], label: "Move up in list", context: "Lists" },
  { keys: ["Enter"], label: "Open selected item", context: "Lists" },
  { keys: ["/"], label: "Focus search bar", context: "Lists" },
  { keys: ["N"], label: "Create new item", context: "Lists" },
  { keys: ["G", "H"], label: "Go to Home", context: "Lists" },
  { keys: ["G", "W"], label: "Go to Workflows", context: "Lists" },
  { keys: ["G", "E"], label: "Go to Executions", context: "Lists" },
  { keys: ["G", "V"], label: "Go to Vault", context: "Lists" },
  { keys: ["G", "S"], label: "Go to Settings", context: "Lists" },
];

const contextConfig: Record<string, { icon: typeof Keyboard; color: string }> = {
  Global: { icon: Globe, color: "text-blue-500 bg-blue-50 border-blue-200" },
  Canvas: { icon: Layout, color: "text-violet-500 bg-violet-50 border-violet-200" },
  Inspector: { icon: Columns, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
  Lists: { icon: Terminal, color: "text-amber-500 bg-amber-50 border-amber-200" },
};

/* ── Key badge ── */
function KeyBadge({ k }: { k: string }) {
  const isSpecial = ["Ctrl", "Shift", "Alt", "Cmd", "Tab", "Enter", "Esc", "Del", "Space"].includes(k);
  return (
    <kbd className={cn(
      "inline-flex items-center justify-center rounded-md border font-mono text-[10px] font-medium shadow-sm min-w-[22px] h-[22px] px-1.5",
      isSpecial
        ? "bg-zinc-100 border-zinc-300 text-zinc-600"
        : "bg-white border-zinc-200 text-zinc-700"
    )}>
      {k === "Ctrl" && navigator.platform.includes("Mac") ? "⌘" : k}
    </kbd>
  );
}

/* ── Main component ── */
interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ open, onClose }: KeyboardShortcutsHelpProps) {
  const [search, setSearch] = useState("");
  const [activeContext, setActiveContext] = useState<string | null>(null);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const contexts = [...new Set(shortcuts.map(s => s.context))];

  const filtered = shortcuts.filter(s => {
    if (activeContext && s.context !== activeContext) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.label.toLowerCase().includes(q) || s.keys.join(" ").toLowerCase().includes(q) || s.context.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = contexts.reduce((acc, ctx) => {
    const items = filtered.filter(s => s.context === ctx);
    if (items.length > 0) acc[ctx] = items;
    return acc;
  }, {} as Record<string, Shortcut[]>);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[520px] max-h-[75vh] rounded-xl border border-zinc-200 bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-zinc-100 p-2">
              <Keyboard size={16} className="text-zinc-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">Keyboard Shortcuts</h2>
              <p className="text-[10px] text-zinc-400">{shortcuts.length} shortcuts across {contexts.length} contexts</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-zinc-100">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shortcuts…"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-3 text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
              autoFocus
            />
          </div>
          {/* Context filters */}
          <div className="flex gap-1.5 mt-2.5">
            <button
              onClick={() => setActiveContext(null)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors border",
                !activeContext ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
              )}
            >
              All
            </button>
            {contexts.map(ctx => {
              const cfg = contextConfig[ctx];
              const Icon = cfg.icon;
              const active = activeContext === ctx;
              return (
                <button
                  key={ctx}
                  onClick={() => setActiveContext(active ? null : ctx)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors border",
                    active ? cfg.color : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <Icon size={9} />
                  {ctx}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shortcuts list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {Object.entries(grouped).map(([ctx, items]) => {
            const cfg = contextConfig[ctx];
            const Icon = cfg.icon;
            return (
              <div key={ctx} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={11} className={cfg.color.split(" ")[0]} />
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{ctx}</span>
                  <span className="text-[9px] text-zinc-300">{items.length}</span>
                </div>
                <div className="space-y-0.5">
                  {items.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-50 transition-colors group"
                    >
                      <span className="text-[11px] text-zinc-700">{shortcut.label}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, ki) => (
                          <span key={ki} className="flex items-center gap-0.5">
                            <KeyBadge k={key} />
                            {ki < shortcut.keys.length - 1 && (
                              <span className="text-[9px] text-zinc-300 mx-0.5">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(grouped).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Search size={20} className="mb-2" />
              <p className="text-xs">No shortcuts match "{search}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-5 py-3 flex items-center justify-between bg-zinc-50">
          <span className="text-[9px] text-zinc-400">Press <KeyBadge k="?" /> anywhere to toggle this panel</span>
          <div className="flex items-center gap-2">
            <button className="text-[10px] text-zinc-500 hover:text-zinc-700 font-medium transition-colors">
              Print All
            </button>
            <span className="text-zinc-200">|</span>
            <button className="text-[10px] text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Copy as Markdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Global hook to trigger shortcuts help with ? key ── */
export function useKeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen, onClose: () => setOpen(false) };
}
