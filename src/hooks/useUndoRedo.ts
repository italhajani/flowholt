import { useState, useCallback, useRef } from "react";

/**
 * Generic undo/redo hook for state management.
 * Used by canvas for node positions, edge list, etc.
 *
 * @param initialState - The starting state
 * @param maxHistory - Max number of undo steps (default 50)
 */
export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const [state, setState] = useState<T>(initialState);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      past.current = [...past.current.slice(-(maxHistory - 1)), prev];
      future.current = [];
      return resolved;
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setState((current) => {
      if (past.current.length === 0) return current;
      const previous = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [current, ...future.current];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (future.current.length === 0) return current;
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, current];
      return next;
    });
  }, []);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return { state, set, undo, redo, canUndo, canRedo };
}
