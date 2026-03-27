"use client";

import { useEffect, useState } from "react";

type LiveLog = {
  id: number;
  level: string;
  message: string;
  node_id?: string | null;
  created_at?: string;
  payload?: Record<string, unknown>;
};

type NodeExecution = {
  id: number;
  node_id: string;
  node_label: string;
  node_type: string;
  sequence: number;
  status: string;
  attempt_count: number;
  duration_ms: number;
  started_at?: string | null;
  finished_at?: string | null;
  error_class?: string;
  error_message?: string;
  token_estimate: number;
};

type RunState = {
  id: string;
  status: string;
  error_message?: string;
  request_correlation_id?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string;
};

type RunLiveMonitorProps = {
  runId: string;
  initialStatus: string;
  initialCorrelationId?: string;
};

export function RunLiveMonitor({
  runId,
  initialStatus,
  initialCorrelationId = "",
}: RunLiveMonitorProps) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [errorMessage, setErrorMessage] = useState("");
  const [logs, setLogs] = useState<LiveLog[]>([]);
  const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([]);
  const [lastEvent, setLastEvent] = useState("");
  const [runState, setRunState] = useState<RunState | null>(null);
  const [correlationId, setCorrelationId] = useState(initialCorrelationId);

  useEffect(() => {
    const source = new EventSource(`/api/runs/${runId}/stream`);

    function onConnected(event: MessageEvent<string>) {
      setConnected(true);
      try {
        const payload = JSON.parse(event.data) as { request_correlation_id?: string | null };
        if (payload.request_correlation_id) {
          setCorrelationId(payload.request_correlation_id);
        }
      } catch {
        // ignore parse noise
      }
      setLastEvent("connected");
    }

    function onRun(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as RunState;
        setRunState(payload);
        setStatus(payload.status || "unknown");
        setErrorMessage(payload.error_message || "");
        if (payload.request_correlation_id) {
          setCorrelationId(payload.request_correlation_id);
        }
      } catch {
        // ignore parse noise
      }
      setLastEvent("run");
    }

    function onLogs(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as { logs?: LiveLog[] };
        const incomingLogs = Array.isArray(payload.logs) ? payload.logs : [];
        if (incomingLogs.length) {
          setLogs((current) => {
            const next = [...current, ...incomingLogs];
            return next.slice(-150);
          });
        }
      } catch {
        // ignore parse noise
      }
      setLastEvent("logs");
    }

    function onNodeExecutions(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as { node_executions?: NodeExecution[] };
        const incomingExecutions = Array.isArray(payload.node_executions)
          ? payload.node_executions
          : [];
        if (incomingExecutions.length) {
          setNodeExecutions((current) => {
            const merged = new Map<number, NodeExecution>();
            for (const item of current) {
              merged.set(item.id, item);
            }
            for (const item of incomingExecutions) {
              merged.set(item.id, item);
            }
            return Array.from(merged.values()).sort((left, right) => {
              if (left.sequence !== right.sequence) {
                return left.sequence - right.sequence;
              }
              return left.id - right.id;
            });
          });
        }
      } catch {
        // ignore parse noise
      }
      setLastEvent("node_executions");
    }

    function onDone(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as { status?: string; request_correlation_id?: string | null };
        if (payload.status) {
          setStatus(payload.status);
        }
        if (payload.request_correlation_id) {
          setCorrelationId(payload.request_correlation_id);
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

    source.addEventListener("connected", onConnected as EventListener);
    source.addEventListener("run", onRun as EventListener);
    source.addEventListener("logs", onLogs as EventListener);
    source.addEventListener("node_executions", onNodeExecutions as EventListener);
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
        {correlationId ? <p>Trace ID: {correlationId}</p> : null}
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
        <p className="text-sm font-medium text-stone-900">Node timeline</p>
        <div className="mt-3 space-y-2">
          {nodeExecutions.length ? (
            nodeExecutions.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-stone-50 px-3 py-3 text-sm text-stone-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-stone-900">
                    {item.sequence}. {item.node_label}
                  </p>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-400">
                    {item.status}
                  </p>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {item.node_type} | {item.duration_ms} ms | attempts: {item.attempt_count} | tokens: {item.token_estimate}
                </p>
                {item.error_message ? (
                  <p className="mt-2 text-sm text-amber-900">{item.error_message}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">
              No node metrics yet. They will appear as the workflow executes.
            </p>
          )}
        </div>
      </div>

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
