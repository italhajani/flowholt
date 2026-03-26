import Link from "next/link";

import { cancelRun } from "@/app/app/runs/actions";
import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { getRunsSnapshot } from "@/lib/flowholt/data";

type RunsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function RunsPage({ searchParams }: RunsPageProps) {
  const snapshot = await getRunsSnapshot();
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);

  return (
    <AppShell
      eyebrow="Runs"
      title="Execution history"
      description="Runs now show real workflow attempts, stored logs, and final outputs from the FlowHolt engine path."
    >
      <div className="space-y-5">
        {message ? (
          <div className="rounded-[1.5rem] bg-[#eef4ef] px-5 py-4 text-sm text-emerald-900">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-[1.5rem] bg-[#f7ede2] px-5 py-4 text-sm text-amber-950">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-5">
            <SurfaceCard
              title={String(snapshot.runs.length)}
              description="Recorded runs in the current workspace"
            />
            <SurfaceCard
              title={String(snapshot.runs.filter((run) => run.status === "succeeded").length)}
              description="Successful runs"
              tone="mint"
            />
            <SurfaceCard
              title={String(snapshot.runs.filter((run) => run.status === "failed").length)}
              description="Failed runs"
              tone="sand"
            />
            <SurfaceCard
              title={String(snapshot.runs.filter((run) => run.status === "cancelled").length)}
              description="Cancelled runs"
            />
          </div>

          <SurfaceCard
            title="Run timeline"
            description="A simple history view while we build richer live execution tools."
          >
            <div className="space-y-4">
              {!snapshot.schemaReady ? (
                <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  Run the Supabase migration first to unlock run storage.
                </div>
              ) : null}

              {snapshot.schemaReady && !snapshot.activeWorkspace ? (
                <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  Create a workspace before trying workflow runs.
                </div>
              ) : null}

              {snapshot.schemaReady && snapshot.activeWorkspace && !snapshot.runs.length ? (
                <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  No runs yet. Open a workflow in Studio and click Run workflow.
                </div>
              ) : null}

              {snapshot.runs.map((run) => (
                <div
                  key={run.id}
                  className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">{run.workflowName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">
                        {run.status} via {run.trigger_source}
                      </p>
                    </div>
                    <div className="text-right text-xs text-stone-500">
                      <p>{new Date(run.created_at).toLocaleString()}</p>
                      {run.finished_at ? <p>Finished: {new Date(run.finished_at).toLocaleTimeString()}</p> : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                    <div className="space-y-2">
                      {run.logs.length ? (
                        run.logs.slice(0, 4).map((log) => (
                          <div key={log.id} className="rounded-2xl bg-white px-3 py-2 text-sm text-stone-700">
                            <span className="font-medium text-stone-900">{log.level.toUpperCase()}</span>: {log.message}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-white px-3 py-2 text-sm text-stone-500">
                          No logs stored for this run yet.
                        </div>
                      )}
                      {run.error_message ? (
                        <div className="rounded-2xl bg-[#f7ede1] px-3 py-2 text-sm text-amber-950">
                          {run.error_message}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 md:flex-col">
                      <Link
                        href={`/app/studio/${run.workflow_id}`}
                        className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                      >
                        Open workflow
                      </Link>
                      <Link
                        href={`/app/runs/${run.id}`}
                        className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                      >
                        Live monitor
                      </Link>
                      {run.status === "queued" || run.status === "running" ? (
                        <form action={cancelRun}>
                          <input type="hidden" name="runId" value={run.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                          >
                            Cancel run
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
