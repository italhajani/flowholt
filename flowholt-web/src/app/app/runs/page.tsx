import Link from "next/link";

import { cancelRun, retryRun } from "@/app/app/runs/actions";
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

  const statCards = [
    { label: "Recorded runs", value: String(snapshot.runs.length), tone: "default" as const },
    {
      label: "Successful",
      value: String(snapshot.runs.filter((run) => run.status === "succeeded").length),
      tone: "mint" as const,
    },
    {
      label: "Failed",
      value: String(snapshot.runs.filter((run) => run.status === "failed").length),
      tone: "sand" as const,
    },
    {
      label: "Running now",
      value: String(snapshot.runs.filter((run) => run.status === "queued" || run.status === "running").length),
      tone: "default" as const,
    },
  ];

  return (
    <AppShell
      eyebrow="Runs"
      title="Execution timeline"
      description="A cleaner operations surface for watching workflow attempts, recent logs, and live monitoring entry points."
    >
      <div className="space-y-5">
        {message ? (
          <div className="rounded-[1.5rem] bg-[#eef5ef] px-5 py-4 text-sm text-emerald-900">{message}</div>
        ) : null}
        {error ? (
          <div className="rounded-[1.5rem] bg-[#f8eee4] px-5 py-4 text-sm text-amber-950">{error}</div>
        ) : null}

        <div className="flowholt-window overflow-hidden">
          <div className="flowholt-window-bar">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Operations</p>
              <p className="mt-1 text-sm font-medium text-stone-900">Run history and live monitoring</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/app/monitoring" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                Open monitoring
              </Link>
              <Link href="/app/workflows" className="flowholt-primary-button px-4 py-2 text-sm font-medium">
                Open workflows
              </Link>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.18fr)_360px]">
            <div className="border-b border-stone-900/8 p-5 xl:border-b-0 xl:border-r xl:p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                  <SurfaceCard key={card.label} title={card.value} description={card.label} tone={card.tone} />
                ))}
              </div>

              <div className="mt-5 space-y-4">
                {!snapshot.schemaReady ? (
                  <div className="rounded-[1.6rem] border border-dashed border-stone-900/15 bg-white/75 px-4 py-6 text-sm text-stone-500">
                    Run the Supabase migration first to unlock run storage.
                  </div>
                ) : null}

                {snapshot.schemaReady && !snapshot.activeWorkspace ? (
                  <div className="rounded-[1.6rem] border border-dashed border-stone-900/15 bg-white/75 px-4 py-6 text-sm text-stone-500">
                    Create a workspace before trying workflow runs.
                  </div>
                ) : null}

                {snapshot.schemaReady && snapshot.activeWorkspace && !snapshot.runs.length ? (
                  <div className="rounded-[1.6rem] border border-dashed border-stone-900/15 bg-white/75 px-4 py-6 text-sm text-stone-500">
                    No runs yet. Open a workflow in Studio and click Run workflow.
                  </div>
                ) : null}

                {snapshot.runs.map((run) => (
                  <div
                    key={run.id}
                    className="rounded-[1.7rem] border border-stone-900/10 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-stone-950">{run.workflowName}</p>
                          <span className="rounded-full border border-stone-900/10 bg-stone-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                            {run.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                          {run.trigger_source} | {new Date(run.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/app/studio/${run.workflow_id}`}
                          className="flowholt-secondary-button px-4 py-2 text-xs font-medium"
                        >
                          Open workflow
                        </Link>
                        <Link
                          href={`/app/runs/${run.id}`}
                          className="flowholt-primary-button px-4 py-2 text-xs font-medium"
                        >
                          Live monitor
                        </Link>
                        {run.status === "queued" || run.status === "running" ? (
                          <form action={cancelRun}>
                            <input type="hidden" name="runId" value={run.id} />
                            <input type="hidden" name="returnTo" value="/app/runs" />
                            <button
                              type="submit"
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <form action={retryRun}>
                            <input type="hidden" name="runId" value={run.id} />
                            <input type="hidden" name="returnTo" value="/app/runs" />
                            <button
                              type="submit"
                              className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-900 transition hover:bg-stone-50"
                            >
                              {run.status === "succeeded" ? "Run again" : "Retry"}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-[1.25rem] bg-[#fbf8f3] px-4 py-3 text-sm text-stone-700">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Recent logs</p>
                        <div className="mt-2 space-y-2">
                          {run.logs.length ? (
                            run.logs.slice(0, 3).map((log) => (
                              <p key={log.id}>
                                <span className="font-medium text-stone-900">{log.level.toUpperCase()}</span>: {log.message}
                              </p>
                            ))
                          ) : (
                            <p className="text-stone-500">No logs stored for this run yet.</p>
                          )}
                        </div>
                      </div>
                      <div className="rounded-[1.25rem] bg-[#fbf8f3] px-4 py-3 text-sm text-stone-700">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Run details</p>
                        <p className="mt-2">Run id: {run.id}</p>
                        <p>Started: {run.started_at ? new Date(run.started_at).toLocaleString() : "Not started"}</p>
                        <p>Finished: {run.finished_at ? new Date(run.finished_at).toLocaleString() : "Still active"}</p>
                        {run.error_message ? <p className="mt-2 text-amber-900">{run.error_message}</p> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f8f4ee] p-5 xl:p-6">
              <div className="space-y-5">
                <SurfaceCard
                  title="How to use this"
                  description="This page is now meant to feel like an operations desk, not a raw data dump."
                  tone="sand"
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    <p>Open a run to watch its live monitor, logs, and node timeline.</p>
                    <p>Use status badges to scan failures and active work quickly.</p>
                    <p>Cancel running jobs directly from this page when needed.</p>
                  </div>
                </SurfaceCard>

                <SurfaceCard
                  title="Next best actions"
                  description="Shortcuts into the main places people use after checking a run."
                  tone="default"
                >
                  <div className="grid gap-3 text-sm text-stone-800">
                    <Link href="/app/monitoring" className="rounded-[1.2rem] border border-stone-900/10 bg-white px-4 py-3 transition hover:bg-stone-50">
                      Open monitoring
                    </Link>
                    <Link href="/app/integrations" className="rounded-[1.2rem] border border-stone-900/10 bg-white px-4 py-3 transition hover:bg-stone-50">
                      Open integrations
                    </Link>
                    <Link href="/app/studio/demo-workflow" className="rounded-[1.2rem] border border-stone-900/10 bg-white px-4 py-3 transition hover:bg-stone-50">
                      Open Studio
                    </Link>
                  </div>
                </SurfaceCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
