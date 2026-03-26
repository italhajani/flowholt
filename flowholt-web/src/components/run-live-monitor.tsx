"use client";

import { useEffect, useState } from "react";

type LiveLog = {
  id: number;
  level: string;
  message: string;
  node_id?: string | null;
  created_at?: string;
};

type RunState = {
  id: string;
  status: string;
  error_message?: string;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string;
};

type RunLiveMonitorProps = {
  runId: string;
  initialStatus: string;
};

export function RunLiveMonitor({ runId, initialStatus }: RunLiveMonitorProps) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [errorMessage, setErrorMessage] = useState("");
  const [logs, setLogs] = useState<LiveLog[]>([]);
  const [lastEvent, setLastEvent] = useState("");
  const [runState, setRunState] = useState<RunState | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/runs/${runId}/stream`);

    function onConnected() {
      setConnected(true);
      setLastEvent("connected");
    }

    function onRun(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as RunState;
        setRunState(payload);
        setStatus(payload.status || "unknown");
        setErrorMessage(payload.error_message || "");
      } catch {
        // ignore parse noise
      }
      setLastEvent("run");
    }

    function onLogs(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as { logs?: LiveLog[] };
        if (Array.isArray(payload.logs) && payload.logs.length) {
          setLogs((current) => {
            const next = [...current, ...payload.logs];
            return next.slice(-150);
          });
        }
      } catch {
        // ignore parse noise
      }
      setLastEvent("logs");
    }

    function onDone(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as { status?: string };
        if (payload.status) {
          setStatus(payload.status);
        }
      } catch {
        // ignore parse noise
      }
      setLastEvent("done");
      source.close();
      setConnected(false);
    }

    function onStreamError(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as { message?: string };
        if (payload.message) {
          setErrorMessage(payload.message);
        }
      } catch {
        // ignore parse noise
      }
      setLastEvent("error");
    }

    source.addEventListener("connected", onConnected);
    source.addEventListener("run", onRun as EventListener);
    source.addEventListener("logs", onLogs as EventListener);
    source.addEventListener("done", onDone as EventListener);
    source.addEventListener("error", onStreamError as EventListener);
    source.addEventListener("timeout", onStreamError as EventListener);

    source.onerror = () => {
      setConnected(false);
      setLastEvent("connection-lost");
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, [runId]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm text-stone-700">
        <p>
          Stream: {connected ? "connected" : "disconnected"} | Status: {status}
        </p>
        {runState?.started_at ? (
          <p>Started: {new Date(runState.started_at).toLocaleString()}</p>
        ) : null}
        {runState?.finished_at ? (
          <p>Finished: {new Date(runState.finished_at).toLocaleString()}</p>
        ) : null}
        {lastEvent ? <p>Last event: {lastEvent}</p> : null}
      </div>

      {errorMessage ? (
        <div className="rounded-2xl bg-[#f7ede2] px-4 py-3 text-sm text-amber-950">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-stone-900/10 bg-white p-4">
        <p className="text-sm font-medium text-stone-900">Live logs</p>
        <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
          {logs.length ? (
            logs.map((log, index) => (
              <div
                key={`${log.id}-${index}`}
                className="rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-700"
              >
                <span className="font-semibold text-stone-900">
                  {String(log.level || "info").toUpperCase()}
                </span>
                : {log.message}
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">
              No streamed logs yet. Keep this page open while run executes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
