import Link from "next/link";

import { cancelRun, retryRun } from "@/app/app/runs/actions";
import { AppShell } from "@/components/app-shell";
import { RunLiveMonitor } from "@/components/run-live-monitor";
import { SurfaceCard } from "@/components/surface-card";
import { createClient } from "@/lib/supabase/server";

type RunLivePageProps = {
  params: Promise<{ runId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function RunLivePage({ params, searchParams }: RunLivePageProps) {
  const { runId } = await params;
  const supabase = await createClient();
  const query = searchParams ? await searchParams : {};
  const message = readMessage(query.message);
  const errorMessage = readMessage(query.error);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppShell eyebrow="Runs" title="Live run monitor" description="Sign in required.">
        <SurfaceCard title="Unauthorized" description="Please sign in to view run stream." tone="sand" />
      </AppShell>
    );
  }

  const { data: runRow, error } = await supabase
    .from("workflow_runs")
    .select("id, status, trigger_source, created_at, workflow_id, request_correlation_id")
    .eq("id", runId)
    .maybeSingle();

  if (error || !runRow) {
    return (
      <AppShell eyebrow="Runs" title="Live run monitor" description="Run not found.">
        <SurfaceCard title="Run not found" description="The run id is not accessible in this workspace." tone="sand" />
      </AppShell>
    );
  }

  const canCancel = runRow.status === "queued" || runRow.status === "running";
  const canRetry = ["failed", "cancelled", "succeeded"].includes(runRow.status);

  return (
    <AppShell
      eyebrow="Runs"
      title="Live run monitor"
      description="Watch status and logs stream in real time while the run executes."
    >
      <div className="space-y-5">
        {message ? (
          <div className="rounded-[1.5rem] bg-[#eef5ef] px-5 py-4 text-sm text-emerald-900">{message}</div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-[1.5rem] bg-[#f8eee4] px-5 py-4 text-sm text-amber-950">{errorMessage}</div>
        ) : null}

        <div className="flowholt-window overflow-hidden">
          <div className="flowholt-window-bar">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Run detail</p>
              <p className="mt-1 text-sm font-medium text-stone-900">{runRow.id}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/app/runs" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                Back to runs
              </Link>
              <Link href={`/app/studio/${runRow.workflow_id}`} className="flowholt-primary-button px-4 py-2 text-sm font-medium">
                Open workflow
              </Link>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="border-b border-stone-900/8 bg-[#f8f4ee] p-5 xl:border-b-0 xl:border-r xl:p-6">
              <div className="space-y-4">
                <div className="rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Status</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{runRow.status}</p>
                </div>
                <div className="rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Trigger</p>
                  <p className="mt-2 text-sm font-medium text-stone-900">{runRow.trigger_source}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">Started {new Date(runRow.created_at).toLocaleString()}</p>
                </div>
                <div className="rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Trace ID</p>
                  <p className="mt-2 break-all text-xs leading-6 text-stone-700">
                    {runRow.request_correlation_id || "No correlation id recorded."}
                  </p>
                </div>
                <SurfaceCard
                  title="Run operations"
                  description="Use clean retry and cancel controls without going back to Studio."
                  tone="default"
                >
                  <div className="grid gap-3 text-sm text-stone-800">
                    {canCancel ? (
                      <form action={cancelRun}>
                        <input type="hidden" name="runId" value={runRow.id} />
                        <input type="hidden" name="returnTo" value={`/app/runs/${runRow.id}`} />
                        <button
                          type="submit"
                          className="w-full rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Cancel run
                        </button>
                      </form>
                    ) : null}
                    {canRetry ? (
                      <form action={retryRun}>
                        <input type="hidden" name="runId" value={runRow.id} />
                        <input type="hidden" name="returnTo" value={`/app/runs/${runRow.id}`} />
                        <button
                          type="submit"
                          className="w-full rounded-[1.2rem] border border-stone-900/10 bg-white px-4 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
                        >
                          {runRow.status === "succeeded" ? "Run again" : "Retry run"}
                        </button>
                      </form>
                    ) : null}
                    <Link href={`/app/studio/${runRow.workflow_id}`} className="rounded-[1.2rem] border border-stone-900/10 bg-white px-4 py-3 transition hover:bg-stone-50">
                      Open workflow in Studio
                    </Link>
                  </div>
                </SurfaceCard>
              </div>
            </div>

            <div className="p-5 xl:p-6">
              <SurfaceCard
                title={`Run ${runRow.id}`}
                description={`Current status: ${runRow.status} via ${runRow.trigger_source}`}
                tone="mint"
              >
                <RunLiveMonitor
                  runId={runRow.id}
                  initialStatus={runRow.status}
                  initialCorrelationId={runRow.request_correlation_id ?? ""}
                />
              </SurfaceCard>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
