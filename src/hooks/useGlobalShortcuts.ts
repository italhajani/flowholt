import { useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type ShortcutHandler = {
  key: string;
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  /** Only active on these path prefixes (empty = everywhere) */
  scope?: string[];
};

/**
 * Global keyboard shortcuts (active inside the app shell).
 * ⌘K / Ctrl+K is handled by the command palette itself.
 */
export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastUndo = useRef<string | null>(null);

  // Track the last navigated path for undo-navigation
  const handleUndo = useCallback(() => {
    window.history.back();
  }, []);

  const handleRedo = useCallback(() => {
    window.history.forward();
  }, []);

  const shortcuts: ShortcutHandler[] = [
    // ── Navigation ──
    { key: "N", mod: true, shift: true, action: () => navigate("/workflows") },
    { key: "/", mod: true, action: () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })) },
    { key: "1", mod: true, action: () => navigate("/"), scope: [] },
    { key: "2", mod: true, action: () => navigate("/workflows"), scope: [] },
    { key: "3", mod: true, action: () => navigate("/executions"), scope: [] },
    { key: "4", mod: true, action: () => navigate("/vault"), scope: [] },
    { key: "5", mod: true, action: () => navigate("/agents"), scope: [] },

    // ── Global actions ──
    { key: "b", mod: true, action: () => {
      document.dispatchEvent(new CustomEvent("toggle-sidebar"));
    }},
    { key: "z", mod: true, action: handleUndo },
    { key: "y", mod: true, action: handleRedo },
    { key: "z", mod: true, shift: true, action: handleRedo },

    // ── Studio-specific (only when in /studio) ──
    { key: "Enter", mod: true, action: () => {
      document.dispatchEvent(new CustomEvent("studio:execute-workflow"));
    }, scope: ["/studio"] },
    { key: "s", mod: true, action: () => {
      document.dispatchEvent(new CustomEvent("studio:save-workflow"));
    }, scope: ["/studio"] },
    { key: "d", mod: true, action: () => {
      document.dispatchEvent(new CustomEvent("studio:duplicate-node"));
    }, scope: ["/studio"] },
    { key: "a", mod: true, action: () => {
      document.dispatchEvent(new CustomEvent("studio:select-all"));
    }, scope: ["/studio"] },
    { key: "+", mod: true, action: () => {
      document.dispatchEvent(new CustomEvent("studio:zoom-in"));
    }, scope: ["/studio"] },
    { key: "-", mod: true, action: () => {
      document.dispatchEvent(new CustomEvent("studio:zoom-out"));
    }, scope: ["/studio"] },
    { key: "0", mod: true, action: () => {
      document.dispatchEvent(new CustomEvent("studio:fit-view"));
    }, scope: ["/studio"] },

    // ── Help ──
    { key: "?", mod: false, shift: true, action: () => {
      document.dispatchEvent(new CustomEvent("show-keyboard-shortcuts"));
    }},
  ];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't capture when user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      const mod = e.metaKey || e.ctrlKey;

      for (const s of shortcuts) {
        const modMatch = s.mod ? mod : !mod;
        const shiftMatch = s.shift ? e.shiftKey : !s.shift;
        const altMatch = s.alt ? e.altKey : !s.alt;

        if (e.key === s.key && modMatch && shiftMatch && altMatch) {
          // Check scope
          if (s.scope && s.scope.length > 0 && !s.scope.some(p => location.pathname.startsWith(p))) continue;
          e.preventDefault();
          s.action();
          return;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navigate, location.pathname, shortcuts]);
}

/** List of all shortcuts for display in help/settings */
export const SHORTCUT_LIST = [
  { category: "Navigation", shortcuts: [
    { keys: ["Ctrl", "1"], label: "Go to Home" },
    { keys: ["Ctrl", "2"], label: "Go to Workflows" },
    { keys: ["Ctrl", "3"], label: "Go to Executions" },
    { keys: ["Ctrl", "4"], label: "Go to Vault" },
    { keys: ["Ctrl", "5"], label: "Go to AI Agents" },
    { keys: ["Ctrl", "Shift", "N"], label: "New Workflow" },
    { keys: ["Ctrl", "/"], label: "Open Command Palette" },
    { keys: ["Ctrl", "B"], label: "Toggle Sidebar" },
  ]},
  { category: "Studio", shortcuts: [
    { keys: ["Ctrl", "Enter"], label: "Execute Workflow" },
    { keys: ["Ctrl", "S"], label: "Save Workflow" },
    { keys: ["Ctrl", "D"], label: "Duplicate Node" },
    { keys: ["Ctrl", "A"], label: "Select All Nodes" },
    { keys: ["Ctrl", "+"], label: "Zoom In" },
    { keys: ["Ctrl", "-"], label: "Zoom Out" },
    { keys: ["Ctrl", "0"], label: "Fit View" },
    { keys: ["Delete"], label: "Delete Selected Node" },
    { keys: ["Ctrl", "F"], label: "Search Nodes" },
  ]},
  { category: "General", shortcuts: [
    { keys: ["Ctrl", "Z"], label: "Undo" },
    { keys: ["Ctrl", "Y"], label: "Redo" },
    { keys: ["Shift", "?"], label: "Show Keyboard Shortcuts" },
  ]},
];
