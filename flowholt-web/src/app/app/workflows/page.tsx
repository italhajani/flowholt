import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { createBlankWorkflow } from "@/app/app/workflows/actions";
import { getWorkflowLibrarySnapshot } from "@/lib/flowholt/data";

type WorkflowsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function WorkflowsPage({ searchParams }: WorkflowsPageProps) {
  const snapshot = await getWorkflowLibrarySnapshot();
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);

  return (
    <AppShell
      eyebrow="Workflows"
      title="Workflow library"
      description="This area holds all saved flows, drafts, templates, schedules, and version history entry points."
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-5">
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

          <SurfaceCard
            title="All workflows"
            description="Real workflow records from the active workspace."
          >
            <div className="grid gap-3">
              {snapshot.workflows.length ? (
                snapshot.workflows.map((workflow) => (
                  <Link
                    key={workflow.id}
                    href={`/app/studio/${workflow.id}`}
                    className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-4 transition hover:bg-stone-100"
                  >
                    <p className="text-sm font-medium text-stone-900">{workflow.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{workflow.description || "No description yet"}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">
                      {workflow.status}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  {snapshot.schemaReady
                    ? "No workflows yet. Create a blank one from the panel on the right."
                    : "Run the Supabase migration first so the workflow library can read real tables."}
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-5">
          <SurfaceCard
            title="Create workflow"
            description="Start from a clean record and edit it in Studio."
            tone="mint"
          >
            {snapshot.activeWorkspace ? (
              <form action={createBlankWorkflow}>
                <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                <button
                  type="submit"
                  className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                >
                  Create blank workflow
                </button>
              </form>
            ) : (
              <p className="text-sm leading-6 text-stone-600">
                Create a workspace first from the dashboard before adding workflows.
              </p>
            )}
          </SurfaceCard>

          <SurfaceCard
            title="Templates"
            description="Starter patterns for common automations."
            tone="sand"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              <p>Lead intake autopilot</p>
              <p>Support ticket triage</p>
              <p>Client reporting assembly line</p>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
