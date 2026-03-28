import Link from "next/link";

import { runWorkflow, saveWorkflow } from "@/app/app/studio/actions";
import { StudioAssistantPanel } from "@/components/studio-assistant-panel";
import { StudioCanvas } from "@/components/studio-canvas";
import { StudioResourcesPanel } from "@/components/studio-resources-panel";
import { SurfaceCard } from "@/components/surface-card";
import { WorkflowSchedulePanel } from "@/components/workflow-schedule-panel";
import { getDemoWorkflow, getRunsSnapshot, getWorkflowForStudio, getWorkflowSchedules } from "@/lib/flowholt/data";
import { validateWorkflowGraph } from "@/lib/flowholt/graph-validator";
import { appNavigation } from "@/lib/navigation";
import { simulateWorkflowGraph } from "@/lib/flowholt/simulator";
import { buildToolMarketplaceComposerSuggestions } from "@/lib/flowholt/tool-marketplace";
import { createClient } from "@/lib/supabase/server";

type StudioPageProps = {
  params: Promise<{ workflowId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

const studioNavigation = appNavigation.filter((item) =>
  ["Dashboard", "Create", "Studio", "Workflows", "Runs", "Integrations", "Settings"].includes(item.label),
);

export default async function StudioPage({ params, searchParams }: StudioPageProps) {
  const { workflowId } = await params;
  const workflow = (await getWorkflowForStudio(workflowId)) ?? getDemoWorkflow();
  const graph = workflow.graph;
  const validation = validateWorkflowGraph(graph);
  const simulation = simulateWorkflowGraph(graph);
  const paramsState = searchParams ? await searchParams : {};
  const message = readMessage(paramsState.message);
  const error = readMessage(paramsState.error);
  const assistantPrefill = readMessage(paramsState.assistant);
  const activePackKey = readMessage(paramsState.kit);
  const previewPack = readMessage(paramsState.previewPack) === "1";
  const settings = workflow.settings as Record<string, unknown>;
  const generation = settings?.generation as { provider?: string; model?: string; notes?: string } | undefined;
  const originalPrompt = typeof settings?.originalPrompt === "string" ? settings.originalPrompt : "";
  const runsSnapshot = await getRunsSnapshot();
  const recentRuns = runsSnapshot.runs.filter((run) => run.workflow_id === workflow.id).slice(0, 3);
  const latestRunOutput = recentRuns[0]?.output ?? null;
  const workflowSchedules = await getWorkflowSchedules(workflow.id);
  const supabase = await createClient();
  const { data: integrationRows } = await supabase
    .from("integration_connections")
    .select("id, provider, label, description, config, status")
    .eq("workspace_id", workflow.workspace_id)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  const integrationOptions = (integrationRows ?? []).map((row) => ({
    id: String(row.id),
    provider: String(row.provider),
    label: String(row.label),
    description: typeof row.description === "string" ? row.description : "",
    config: row.config && typeof row.config === "object" ? (row.config as Record<string, unknown>) : {},
  }));
  const resourceSuggestions = buildToolMarketplaceComposerSuggestions(integrationOptions);
  const clearAutoPreviewUrl = assistantPrefill && activePackKey
    ? `/app/studio/${workflow.id}?assistant=${encodeURIComponent(assistantPrefill)}&kit=${encodeURIComponent(activePackKey)}`
    : `/app/studio/${workflow.id}`;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf8f4_0%,#f6f4ef_100%)] text-stone-950">
      <div className="mx-auto grid min-h-screen max-w-[1720px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-r border-stone-900/8 bg-[#fbfaf7] px-5 py-6">
          <Link href="/" className="block px-2 py-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">FlowHolt</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">Studio</p>
          </Link>

          <nav className="mt-6 space-y-1.5">
            {studioNavigation.map((item) => {
              const active = item.label === "Studio";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-[1rem] px-4 py-3 transition ${active ? "bg-[var(--fh-accent-soft)] text-stone-950" : "text-stone-700 hover:bg-white"}`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`mt-1 text-xs leading-5 ${active ? "text-stone-600" : "text-stone-500"}`}>{item.description}</p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-stone-900/8 bg-white/88 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Workflow editor</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{workflow.name}</h1>
                <p className="mt-2 text-sm leading-6 text-stone-600">Visual workflow editor with assistant guidance, resources, and runtime controls.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="flowholt-chip">{workflow.status}</span>
                <span className="flowholt-chip">{graph.nodes.length} steps</span>
                <span className="flowholt-chip">{simulation.possible_path_count} paths</span>
                {workflow.id !== "demo-workflow" ? (
                  <form action={runWorkflow}>
                    <input type="hidden" name="workflowId" value={workflow.id} />
                    <button type="submit" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">Run</button>
                  </form>
                ) : null}
                <button type="submit" form="workflow-save-form" className="flowholt-primary-button px-4 py-2 text-sm font-medium">Save</button>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="rounded-[0.9rem] bg-stone-900 px-4 py-2 text-sm font-medium text-white">Editor</span>
              <Link href="/app/runs" className="rounded-[0.9rem] border border-stone-900/10 bg-white px-4 py-2 text-sm font-medium text-stone-700">Executions</Link>
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-6">
            {message ? <div className="mb-4 rounded-[1rem] bg-[#eef5ef] px-4 py-3 text-sm text-emerald-900">{message}</div> : null}
            {error ? <div className="mb-4 rounded-[1rem] bg-[#f8eee4] px-4 py-3 text-sm text-amber-950">{error}</div> : null}

            <div className="grid gap-4 2xl:grid-cols-[290px_minmax(0,1fr)_330px]">
              <aside className="space-y-4">
                <div className="rounded-[1.25rem] border border-stone-900/8 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Task</p>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{originalPrompt || "Describe a task to start a workflow draft."}</p>
                </div>
                <StudioAssistantPanel
                  workflowId={workflow.id}
                  workflowName={workflow.name}
                  initialPrompt={originalPrompt}
                  prefillMessage={assistantPrefill}
                  autoPreviewResourceKitKey={previewPack ? activePackKey : ""}
                  clearAutoPreviewUrl={clearAutoPreviewUrl}
                  resourceSuggestions={resourceSuggestions}
                />
              </aside>

              <section className="space-y-4">
                <form id="workflow-save-form" action={saveWorkflow} className="space-y-4">
                  <input type="hidden" name="workflowId" value={workflow.id} />
                  <StudioCanvas
                    initialGraph={graph}
                    originalPrompt={originalPrompt}
                    latestRunOutput={latestRunOutput}
                    integrationOptions={integrationOptions}
                  />
                </form>
              </section>

              <aside className="space-y-4">
                <div className="rounded-[1.25rem] border border-stone-900/8 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Workflow</p>
                  <form action={saveWorkflow} className="mt-4 space-y-4">
                    <input type="hidden" name="workflowId" value={workflow.id} />
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="name">Name</label>
                      <input id="name" name="name" defaultValue={workflow.name} className="w-full rounded-[1rem] border border-stone-900/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="status">Status</label>
                      <select id="status" name="status" defaultValue={workflow.status} className="w-full rounded-[1rem] border border-stone-900/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none">
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="description">Description</label>
                      <textarea id="description" name="description" defaultValue={workflow.description} rows={3} className="w-full rounded-[1rem] border border-stone-900/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
                    </div>
                    <button type="submit" className="flowholt-primary-button px-4 py-2 text-sm font-medium">Save details</button>
                  </form>
                </div>

                <div className="rounded-[1.25rem] border border-stone-900/8 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Resources</p>
                  <div className="mt-4">
                    <StudioResourcesPanel workflowId={workflow.id} activeKitKey={activePackKey} integrations={integrationOptions} resourceSuggestions={resourceSuggestions} />
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-stone-900/8 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Schedule</p>
                  <div className="mt-4">
                    <WorkflowSchedulePanel workflowId={workflow.id} workflowName={workflow.name} initialSchedules={workflowSchedules} />
                  </div>
                </div>

                <SurfaceCard title="Preview" description="Validation and latest runs." tone="default">
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    <div className="rounded-[1rem] bg-[#fbfaf7] px-4 py-3">
                      <p>Validation: {validation.score}/100</p>
                      <p>Estimated steps: {simulation.estimated_step_count}</p>
                    </div>
                    {recentRuns.length ? (
                      recentRuns.map((run) => (
                        <div key={run.id} className="rounded-[1rem] bg-[#fbfaf7] px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-stone-900">{run.status}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">{new Date(run.created_at).toLocaleString()}</p>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Link href={`/app/runs/${run.id}`} className="flowholt-secondary-button px-4 py-2 text-xs font-medium">Live monitor</Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1rem] bg-[#fbfaf7] px-4 py-3">No runs yet.</div>
                    )}
                    <div className="rounded-[1rem] bg-[#fbfaf7] px-4 py-3">
                      <p>Provider: {generation?.provider ?? "local"}</p>
                      <p>Model: {generation?.model ?? "not recorded"}</p>
                    </div>
                  </div>
                </SurfaceCard>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
