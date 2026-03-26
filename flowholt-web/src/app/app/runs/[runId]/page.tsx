import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { RunLiveMonitor } from "@/components/run-live-monitor";
import { SurfaceCard } from "@/components/surface-card";
import { createClient } from "@/lib/supabase/server";

type RunLivePageProps = {
  params: Promise<{ runId: string }>;
};

export default async function RunLivePage({ params }: RunLivePageProps) {
  const { runId } = await params;
  const supabase = await createClient();

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
    .select("id, status, trigger_source, created_at, workflow_id")
    .eq("id", runId)
    .maybeSingle();

  if (error || !runRow) {
    return (
      <AppShell eyebrow="Runs" title="Live run monitor" description="Run not found.">
        <SurfaceCard title="Run not found" description="The run id is not accessible in this workspace." tone="sand" />
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Runs"
      title="Live run monitor"
      description="Watch status and logs stream in real-time while the run executes."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/app/runs"
            className="rounded-full border border-stone-900/10 bg-white px-5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Back to runs
          </Link>
          <Link
            href={`/app/studio/${runRow.workflow_id}`}
            className="rounded-full border border-stone-900/10 bg-white px-5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Open workflow
          </Link>
        </div>

        <SurfaceCard
          title={`Run ${runRow.id}`}
          description={`Current status: ${runRow.status} via ${runRow.trigger_source}`}
          tone="mint"
        >
          <RunLiveMonitor runId={runRow.id} initialStatus={runRow.status} />
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
