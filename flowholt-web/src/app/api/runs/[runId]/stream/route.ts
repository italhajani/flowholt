import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePositiveInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function isTerminalStatus(status: string) {
  return ["succeeded", "failed", "cancelled"].includes(status);
}

function sseEvent(event: string, payload: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

type RouteContext = {
  params: Promise<{ runId: string }> | { runId: string };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { runId } = await Promise.resolve(context.params);

  if (!runId) {
    return NextResponse.json({ error: "Missing run id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: runRow, error: runError } = await supabase
    .from("workflow_runs")
    .select("id, workflow_id, workspace_id, status, error_message, started_at, finished_at, created_at")
    .eq("id", runId)
    .maybeSingle();

  if (runError || !runRow) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }

  const pollMs = parsePositiveInt(request.nextUrl.searchParams.get("pollMs"), 1500, 500, 5000);
  const timeoutSeconds = parsePositiveInt(request.nextUrl.searchParams.get("timeoutSeconds"), 45, 10, 300);
  const maxDurationMs = timeoutSeconds * 1000;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      let lastLogId = 0;
      let lastStatus = "";
      let lastFinishedAt = "";
      let lastError = "";

      const close = () => {
        if (closed) {
          return;
        }
        closed = true;
        controller.close();
      };

      const write = (chunk: string) => {
        if (closed) {
          return;
        }
        controller.enqueue(encoder.encode(chunk));
      };

      const startedAt = Date.now();

      write(
        sseEvent("connected", {
          run_id: runId,
          poll_ms: pollMs,
          timeout_seconds: timeoutSeconds,
          connected_at: new Date().toISOString(),
        }),
      );

      void (async () => {
        try {
          while (!closed) {
            if (request.signal.aborted) {
              write(sseEvent("aborted", { run_id: runId }));
              close();
              break;
            }

            const elapsed = Date.now() - startedAt;
            if (elapsed > maxDurationMs) {
              write(
                sseEvent("timeout", {
                  run_id: runId,
                  timeout_seconds: timeoutSeconds,
                }),
              );
              close();
              break;
            }

            const [{ data: currentRun, error: currentRunError }, { data: logRows, error: logError }] =
              await Promise.all([
                supabase
                  .from("workflow_runs")
                  .select("id, status, error_message, started_at, finished_at, created_at")
                  .eq("id", runId)
                  .maybeSingle(),
                supabase
                  .from("run_logs")
                  .select("id, node_id, level, message, payload, created_at")
                  .eq("run_id", runId)
                  .gt("id", lastLogId)
                  .order("id", { ascending: true })
                  .limit(200),
              ]);

            if (currentRunError || !currentRun) {
              write(
                sseEvent("error", {
                  run_id: runId,
                  message: currentRunError?.message ?? "Run no longer accessible.",
                }),
              );
              close();
              break;
            }

            const currentStatus = String(currentRun.status);
            const currentFinishedAt = currentRun.finished_at ? String(currentRun.finished_at) : "";
            const currentError = currentRun.error_message ? String(currentRun.error_message) : "";

            if (
              currentStatus !== lastStatus ||
              currentFinishedAt !== lastFinishedAt ||
              currentError !== lastError
            ) {
              lastStatus = currentStatus;
              lastFinishedAt = currentFinishedAt;
              lastError = currentError;

              write(
                sseEvent("run", {
                  id: currentRun.id,
                  status: currentStatus,
                  error_message: currentError,
                  started_at: currentRun.started_at,
                  finished_at: currentRun.finished_at,
                  created_at: currentRun.created_at,
                }),
              );
            }

            if (!logError && Array.isArray(logRows) && logRows.length) {
              lastLogId = Math.max(lastLogId, ...logRows.map((log) => Number(log.id) || 0));
              write(sseEvent("logs", { run_id: runId, logs: logRows }));
            }

            write(": heartbeat\n\n");

            if (isTerminalStatus(currentStatus)) {
              write(
                sseEvent("done", {
                  run_id: runId,
                  status: currentStatus,
                  finished_at: currentRun.finished_at,
                }),
              );
              close();
              break;
            }

            await sleep(pollMs);
          }
        } catch (error) {
          write(
            sseEvent("error", {
              run_id: runId,
              message: error instanceof Error ? error.message : "Streaming failed.",
            }),
          );
          close();
        }
      })();
    },
    cancel() {
      // client disconnected
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
