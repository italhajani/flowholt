import Link from "next/link";

import { runWorkflow, saveWorkflow } from "@/app/app/studio/actions";
import { AppShell } from "@/components/app-shell";
import { StudioAssistantPanel } from "@/components/studio-assistant-panel";
import { StudioCanvas } from "@/components/studio-canvas";
import { StudioResourcesPanel } from "@/components/studio-resources-panel";
import { SurfaceCard } from "@/components/surface-card";
import { WorkflowSchedulePanel } from "@/components/workflow-schedule-panel";
import { getDemoWorkflow, getRunsSnapshot, getWorkflowForStudio, getWorkflowSchedules } from "@/lib/flowholt/data";
import { simulateWorkflowGraph } from "@/lib/flowholt/simulator";
import { validateWorkflowGraph } from "@/lib/flowholt/graph-validator";
import { buildToolMarketplaceComposerSuggestions } from "@/lib/flowholt/tool-marketplace";
import { createClient } from "@/lib/supabase/server";

type StudioPageProps = {
  params: Promise<{
    workflowId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

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
  const generation = settings?.generation as
    | { provider?: string; model?: string; notes?: string }
    | undefined;
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
    <AppShell
      eyebrow="Studio"
      title={workflow.name}
      description="Visual workflow editor with assistant guidance, resources, and runtime controls."
    >
      <div className="space-y-5">
        {message ? <div className="rounded-[1rem] bg-[#eef5ef] px-4 py-3 text-sm text-emerald-900">{message}</div> : null}
        {error ? <div className="rounded-[1rem] bg-[#f8eee4] px-4 py-3 text-sm text-amber-950">{error}</div> : null}

        <div className="flowholt-window overflow-hidden">
          <div className="flowholt-window-bar">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flowholt-chip">Editor</span>
              <span className="flowholt-chip">{workflow.status}</span>
              <span className="flowholt-chip">{graph.nodes.length} steps</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {workflow.id !== "demo-workflow" ? (
                <form action={runWorkflow}>
                  <input type="hidden" name="workflowId" value={workflow.id} />
                  <button type="submit" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                    Run
                  </button>
                </form>
              ) : null}
              <button type="submit" form="workflow-save-form" className="flowholt-primary-button px-4 py-2 text-sm font-medium">
                Save
              </button>
            </div>
          </div>

          <div className="grid gap-0 2xl:grid-cols-[300px_minmax(0,1fr)_340px]">
            <div className="border-b border-stone-900/8 bg-[#fbfaf7] p-4 2xl:border-b-0 2xl:border-r">
              <StudioAssistantPanel
                workflowId={workflow.id}
                workflowName={workflow.name}
                initialPrompt={originalPrompt}
                prefillMessage={assistantPrefill}
                autoPreviewResourceKitKey={previewPack ? activePackKey : ""}
                clearAutoPreviewUrl={clearAutoPreviewUrl}
                resourceSuggestions={resourceSuggestions}
              />
            </div>

            <div className="border-b border-stone-900/8 p-4 2xl:border-b-0 2xl:border-r">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-stone-900/8 bg-[#fbfaf7] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Canvas</p>
                  <p className="mt-1 text-sm text-stone-600">Edit the workflow visually.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                  <span className="flowholt-chip">{validation.score}/100</span>
                  <span className="flowholt-chip">{simulation.possible_path_count} paths</span>
                </div>
              </div>

              <form id="workflow-save-form" action={saveWorkflow} className="space-y-5">
                <input type="hidden" name="workflowId" value={workflow.id} />
                <StudioCanvas
                  initialGraph={graph}
                  originalPrompt={originalPrompt}
                  latestRunOutput={latestRunOutput}
                  integrationOptions={integrationOptions}
                />
              </form>
            </div>

            <div className="bg-[#fbfaf7] p-4">
              <div className="space-y-4">
                <SurfaceCard title="Workflow" description="Basic workflow details.">
                  <form action={saveWorkflow} className="space-y-4">
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
                      <textarea id="description" name="description" defaultValue={workflow.description} rows={4} className="w-full rounded-[1rem] border border-stone-900/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
                    </div>
                    <button type="submit" className="flowholt-primary-button px-5 py-3 text-sm font-medium">Save details</button>
                  </form>
                </SurfaceCard>

                <SurfaceCard title="Resources" description="Connections and packs available to this workflow.">
                  <StudioResourcesPanel
                    workflowId={workflow.id}
                    activeKitKey={activePackKey}
                    integrations={integrationOptions}
                    resourceSuggestions={resourceSuggestions}
                  />
                </SurfaceCard>

                <SurfaceCard title="Schedule" description="Run automatically on a recurring cadence." tone="mint">
                  <WorkflowSchedulePanel workflowId={workflow.id} workflowName={workflow.name} initialSchedules={workflowSchedules} />
                </SurfaceCard>

                <SurfaceCard title="Recent runs" description="Latest execution attempts." tone="default">
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    {recentRuns.length ? (
                      recentRuns.map((run) => (
                        <div key={run.id} className="rounded-[1rem] bg-[#fbfaf7] px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-medium text-stone-900">{run.status}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">{new Date(run.created_at).toLocaleString()}</p>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Link href={`/app/runs/${run.id}`} className="flowholt-secondary-button px-4 py-2 text-xs font-medium">Live monitor</Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No runs yet.</p>
                    )}
                  </div>
                </SurfaceCard>

                <SurfaceCard title="Prompt source" description="Original request behind this workflow." tone="sand">
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    <div className="rounded-[1rem] bg-white px-4 py-3">{originalPrompt || "No original prompt recorded."}</div>
                    <div className="rounded-[1rem] bg-white px-4 py-3">
                      <p>Provider: {generation?.provider ?? "local"}</p>
                      <p>Model: {generation?.model ?? "not recorded"}</p>
                      <p>{generation?.notes ?? "No generation notes available."}</p>
                    </div>
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
