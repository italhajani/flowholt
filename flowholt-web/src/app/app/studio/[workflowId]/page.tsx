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
      description="A premium workspace for shaping the flow, keeping assistant reasoning close, and running the workflow without exposing messy internals."
    >
      <div className="space-y-5">
        {message ? (
          <div className="rounded-[1.5rem] bg-[#eef5ef] px-5 py-4 text-sm text-emerald-900">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-[1.5rem] bg-[#f8eee4] px-5 py-4 text-sm text-amber-950">
            {error}
          </div>
        ) : null}

        <div className="flowholt-window overflow-hidden">
          <div className="flowholt-window-bar">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flowholt-chip">Visual editor</span>
              <span className="flowholt-chip">{workflow.status}</span>
              <span className="flowholt-chip">{graph.nodes.length} steps</span>
              <span className="flowholt-chip">{simulation.possible_path_count} path{simulation.possible_path_count === 1 ? "" : "s"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {workflow.id !== "demo-workflow" ? (
                <form action={runWorkflow}>
                  <input type="hidden" name="workflowId" value={workflow.id} />
                  <button
                    type="submit"
                    className="flowholt-secondary-button px-4 py-2 text-sm font-medium"
                  >
                    Run workflow
                  </button>
                </form>
              ) : null}
              <button
                type="submit"
                form="workflow-save-form"
                className="flowholt-primary-button px-4 py-2 text-sm font-medium"
              >
                Save changes
              </button>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="border-b border-stone-900/8 p-4 sm:p-5 xl:border-b-0 xl:border-r xl:p-6">
              <div className="flex flex-col gap-4 rounded-[1.8rem] border border-stone-900/10 bg-[#fbf8f3] p-5 shadow-[var(--fh-shadow-soft)] lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Editor overview</p>
                  <h3 className="flowholt-display mt-3 text-[2rem] leading-none text-stone-950">Clean graph workspace</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                    Build on the canvas, keep resources and reasoning visible, and still understand the workflow before you run it.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[280px]">
                  <div className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Validation</p>
                    <p className="mt-2 text-sm font-medium text-stone-900">{validation.score}/100</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Execution</p>
                    <p className="mt-2 text-sm font-medium text-stone-900">{simulation.estimated_step_count} expected steps</p>
                  </div>
                </div>
              </div>

              <form id="workflow-save-form" action={saveWorkflow} className="mt-5 space-y-5">
                <input type="hidden" name="workflowId" value={workflow.id} />

                <StudioCanvas
                  initialGraph={graph}
                  originalPrompt={originalPrompt}
                  latestRunOutput={latestRunOutput}
                  integrationOptions={integrationOptions}
                />
              </form>
            </div>

            <div className="bg-[#f8f4ee] p-4 sm:p-5 xl:p-6">
              <div className="space-y-5">
                <StudioAssistantPanel
                  workflowId={workflow.id}
                  workflowName={workflow.name}
                  initialPrompt={originalPrompt}
                  prefillMessage={assistantPrefill}
                  autoPreviewResourceKitKey={previewPack ? activePackKey : ""}
                  clearAutoPreviewUrl={clearAutoPreviewUrl}
                  resourceSuggestions={resourceSuggestions}
                />

                <SurfaceCard
                  title="Workflow setup"
                  description="Core workflow details stay in one calm settings panel instead of being scattered around the canvas."
                  tone="default"
                >
                  <form action={saveWorkflow} className="space-y-4">
                    <input type="hidden" name="workflowId" value={workflow.id} />
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="name">
                        Workflow name
                      </label>
                      <input
                        id="name"
                        name="name"
                        defaultValue={workflow.name}
                        className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="status">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        defaultValue={workflow.status}
                        className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        defaultValue={workflow.description}
                        rows={4}
                        className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flowholt-primary-button px-5 py-3 text-sm font-medium"
                    >
                      Save metadata
                    </button>
                  </form>
                </SurfaceCard>

                <SurfaceCard
                  title="Resources"
                  description="Provider packs, workflow packs, and workspace readiness stay visible like a proper premium sidebar."
                  tone="default"
                >
                  <StudioResourcesPanel
                    workflowId={workflow.id}
                    activeKitKey={activePackKey}
                    integrations={integrationOptions}
                    resourceSuggestions={resourceSuggestions}
                  />
                </SurfaceCard>

                <SurfaceCard
                  title="Schedule builder"
                  description="Give the workflow a clean recurring cadence without leaving Studio."
                  tone="mint"
                >
                  <WorkflowSchedulePanel
                    workflowId={workflow.id}
                    workflowName={workflow.name}
                    initialSchedules={workflowSchedules}
                  />
                </SurfaceCard>

                <SurfaceCard
                  title="Flow preview"
                  description="Readable validation and simulation so people understand what the workflow will do before execution."
                  tone={validation.valid ? "mint" : "sand"}
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    <div className="rounded-[1.25rem] bg-white/90 px-4 py-3">
                      <p className="font-medium text-stone-900">
                        {validation.valid ? "This workflow looks runnable." : "This workflow still needs a few fixes."}
                      </p>
                      <p className="mt-2">Validation score: {validation.score}/100</p>
                      <p>Possible paths: {simulation.possible_path_count}</p>
                      <p>Estimated steps: {simulation.estimated_step_count}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/90 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Execution order</p>
                      <p className="mt-2 text-stone-700">{simulation.execution_order.join(" -> ") || "No executable order yet"}</p>
                    </div>
                    {validation.issues.length ? (
                      <div className="rounded-[1.25rem] bg-white/90 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Issues</p>
                        <div className="mt-2 space-y-2">
                          {validation.issues.slice(0, 4).map((issue, index) => (
                            <p key={`${issue.code}-${index}`}>
                              <span className="font-medium uppercase text-stone-900">{issue.severity}</span>: {issue.message}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </SurfaceCard>

                <SurfaceCard
                  title="Recent runs"
                  description="The last few engine runs for this workflow stay close to the editor."
                  tone="mint"
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    {recentRuns.length ? (
                      recentRuns.map((run) => (
                        <div key={run.id} className="rounded-[1.25rem] bg-white/90 px-4 py-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-medium text-stone-900">{run.status}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">
                              {new Date(run.created_at).toLocaleString()}
                            </p>
                          </div>
                          <p className="mt-2 text-stone-600">
                            {run.logs[run.logs.length - 1]?.message ?? "No logs recorded yet."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href={`/app/runs/${run.id}`}
                              className="flowholt-secondary-button px-4 py-2 text-xs font-medium"
                            >
                              Open live monitor
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No runs yet. Use the Run workflow button to test the engine path.</p>
                    )}
                  </div>
                </SurfaceCard>

                <SurfaceCard
                  title="Prompt origin"
                  description="The original task request stays visible so the workflow remains grounded in the user goal."
                  tone="sand"
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    <div className="rounded-[1.25rem] bg-white/90 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Prompt</p>
                      <p className="mt-2 text-stone-700">{originalPrompt || "No original prompt recorded."}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/90 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Draft source</p>
                      <p className="mt-2">Provider: {generation?.provider ?? "local"}</p>
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
