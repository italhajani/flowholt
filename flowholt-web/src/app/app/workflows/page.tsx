import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { createBlankWorkflow, importWorkflowPackage } from "@/app/app/workflows/actions";
import { getWorkflowLibrarySnapshot } from "@/lib/flowholt/data";

type WorkflowsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

const templateIdeas = [
  "Lead intake autopilot",
  "Support ticket triage",
  "Client reporting assembly line",
  "Content scheduling and approval",
];

export default async function WorkflowsPage({ searchParams }: WorkflowsPageProps) {
  const snapshot = await getWorkflowLibrarySnapshot();
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);

  return (
    <AppShell
      eyebrow="Workflows"
      title="Workflow library"
      description="A cleaner portfolio view of saved flows, imported packages, and starting points for what the workspace should automate next."
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Library</p>
              <p className="mt-1 text-sm font-medium text-stone-900">Saved automations and reusable packages</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/app/create" className="flowholt-primary-button px-4 py-2 text-sm font-medium">
                Create from chat
              </Link>
              <Link href="/app/studio/demo-workflow" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                Open Studio
              </Link>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.12fr)_390px]">
            <div className="border-b border-stone-900/8 p-5 xl:border-b-0 xl:border-r xl:p-6">
              <div className="space-y-4">
                {snapshot.workflows.length ? (
                  snapshot.workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="rounded-[1.7rem] border border-stone-900/10 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-stone-900">{workflow.name}</p>
                            <span className="rounded-full border border-stone-900/10 bg-stone-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                              {workflow.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {workflow.description || "No description yet"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/app/studio/${workflow.id}`}
                            className="flowholt-primary-button px-4 py-2 text-xs font-medium"
                          >
                            Open Studio
                          </Link>
                          <a
                            href={`/api/workflows/${workflow.id}/package`}
                            className="flowholt-secondary-button px-4 py-2 text-xs font-medium"
                          >
                            Export package
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.6rem] border border-dashed border-stone-900/15 bg-white/75 px-4 py-6 text-sm text-stone-500">
                    {snapshot.schemaReady
                      ? "No workflows yet. Start from chat or create a blank one from the right panel."
                      : "Run the Supabase migration first so the workflow library can read real tables."}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f8f4ee] p-5 xl:p-6">
              <div className="space-y-5">
                <SurfaceCard
                  title="Create workflow"
                  description="Start from a clean workflow record, then shape it in Studio."
                  tone="mint"
                >
                  {snapshot.activeWorkspace ? (
                    <form action={createBlankWorkflow}>
                      <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                      <button type="submit" className="flowholt-primary-button w-full px-5 py-3 text-sm font-medium">
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
                  title="Import package"
                  description="Paste a FlowHolt package JSON here and create a new imported workflow."
                  tone="sand"
                >
                  {snapshot.activeWorkspace ? (
                    <form action={importWorkflowPackage} className="space-y-3">
                      <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                      <textarea
                        name="packageJson"
                        rows={12}
                        placeholder="Paste exported package JSON here"
                        className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 font-mono text-xs leading-6 outline-none"
                      />
                      <button type="submit" className="flowholt-secondary-button w-full px-5 py-3 text-sm font-medium">
                        Import workflow package
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm leading-6 text-stone-600">
                      Create a workspace first before importing packages.
                    </p>
                  )}
                </SurfaceCard>

                <SurfaceCard
                  title="Template ideas"
                  description="Starter automation directions the user can turn into a real workflow from chat."
                  tone="default"
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    {templateIdeas.map((idea) => (
                      <Link
                        key={idea}
                        href={`/app/create?prompt=${encodeURIComponent(idea)}`}
                        className="block rounded-[1.2rem] border border-stone-900/10 bg-white px-4 py-3 transition hover:bg-stone-50"
                      >
                        {idea}
                      </Link>
                    ))}
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
