import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export interface ExecutionStreamData {
  id: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  error_text: string | null;
  event_count: number;
  steps: Array<{ name: string; status: string; duration_ms: number }>;
}

/**
 * Hook to subscribe to an execution's SSE stream for live updates.
 * Returns the latest snapshot and connection status.
 */
export function useExecutionStream(executionId: string | undefined) {
  const [data, setData] = useState<ExecutionStreamData | null>(null);
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!executionId) return;

    const es = new EventSource(`${API_BASE}/api/executions/${executionId}/stream`);
    sourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const parsed: ExecutionStreamData = JSON.parse(event.data);
        setData(parsed);
      } catch {
        // ignore parse errors
      }
    };

    es.addEventListener("done", () => {
      setDone(true);
      es.close();
      setConnected(false);
    });

    es.addEventListener("timeout", () => {
      setDone(true);
      es.close();
      setConnected(false);
    });

    es.addEventListener("error", () => {
      setDone(true);
      es.close();
      setConnected(false);
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [executionId]);

  return { data, connected, done };
}
