import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global keyboard shortcuts (active inside the app shell).
 * ⌘K / Ctrl+K is handled by the command palette itself.
 */
export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl+Shift+N → New workflow
      if (mod && e.shiftKey && e.key === "N") {
        e.preventDefault();
        navigate("/workflows");
      }

      // Ctrl+/ → Focus search (triggers command palette)
      if (mod && e.key === "/") {
        e.preventDefault();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navigate]);
}
