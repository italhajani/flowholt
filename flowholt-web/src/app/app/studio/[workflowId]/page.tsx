import Link from "next/link";

import { runWorkflow, saveWorkflow } from "@/app/app/studio/actions";
import { AppShell } from "@/components/app-shell";
import { StudioAssistantPanel } from "@/components/studio-assistant-panel";
import { StudioCanvas } from "@/components/studio-canvas";
import { SurfaceCard } from "@/components/surface-card";
import { WorkflowSchedulePanel } from "@/components/workflow-schedule-panel";
import { getDemoWorkflow, getRunsSnapshot, getWorkflowForStudio, getWorkflowSchedules } from "@/lib/flowholt/data";
import { simulateWorkflowGraph } from "@/lib/flowholt/simulator";
import { validateWorkflowGraph } from "@/lib/flowholt/graph-validator";
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
    .select("id, provider, label, status")
    .eq("workspace_id", workflow.workspace_id)
    .eq("status", "active")
    .order("updated_at", { ascending: false });
  const integrationOptions = (integrationRows ?? []).map((row) => ({
    id: String(row.id),
    provider: String(row.provider),
    label: String(row.label),
  }));

  return (
    <AppShell
      eyebrow="Studio"
      title={workflow.name}
      description="A calmer, more premium workspace for shaping your workflow before you run it."
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

        <div className="rounded-[30px] border border-stone-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.90),rgba(248,244,236,0.92))] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[34px] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                Studio
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
                Visual workflow editor
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Build the flow here, simulate the path, then run it through the FlowHolt engine and inspect the logs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                {workflow.status}
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {graph.nodes.length} steps
              </div>
              <div className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                {simulation.possible_path_count} path{simulation.possible_path_count === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {workflow.id !== "demo-workflow" ? (
              <form action={runWorkflow} className="w-full sm:w-auto">
                <input type="hidden" name="workflowId" value={workflow.id} />
                <button
                  type="submit"
                  className="w-full rounded-full border border-stone-900/10 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50 sm:w-auto"
                >
                  Run workflow
                </button>
              </form>
            ) : null}
            <button
              type="submit"
              form="workflow-save-form"
              className="w-full rounded-full bg-[#ff7f5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#f26f4d] sm:w-auto"
            >
              Save changes
            </button>
            <Link
              href="/app/runs"
              className="w-full rounded-full border border-stone-900/10 bg-white px-5 py-2.5 text-center text-sm font-medium text-stone-700 transition hover:bg-stone-50 sm:w-auto"
            >
              Open runs
            </Link>
          </div>
        </div>

        <form id="workflow-save-form" action={saveWorkflow} className="space-y-5">
          <input type="hidden" name="workflowId" value={workflow.id} />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              <StudioCanvas
                initialGraph={graph}
                originalPrompt={originalPrompt}
                latestRunOutput={latestRunOutput}
                integrationOptions={integrationOptions}
              />
            </div>

            <div className="grid gap-5 self-start xl:sticky xl:top-6">
              <StudioAssistantPanel
                workflowId={workflow.id}
                workflowName={workflow.name}
                initialPrompt={originalPrompt}
              />

              <SurfaceCard
                title="Workflow setup"
                description="Core details stay in a neat right-side panel, not floating around the canvas."
                tone="default"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="name">
                      Workflow name
                    </label>
                    <input
                      id="name"
                      name="name"
                      defaultValue={workflow.name}
                      className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
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
                      className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
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
                      className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard
                title="Schedule builder"
                description="Set this workflow to run automatically on a simple recurring cadence."
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
                description="A human-readable simulation summary so you can understand the graph before running it."
                tone={validation.valid ? "mint" : "sand"}
              >
                <div className="space-y-3 text-sm leading-6 text-stone-700">
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="font-medium text-stone-900">
                      {validation.valid ? "This workflow looks runnable." : "This workflow needs fixes before it is reliable."}
                    </p>
                    <p className="mt-2">Validation score: {validation.score}/100</p>
                    <p>Estimated executed steps: {simulation.estimated_step_count}</p>
                    <p>Possible paths: {simulation.possible_path_count}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Flow shape</p>
                    <p className="mt-2">Start nodes: {simulation.root_nodes.join(", ") || "none"}</p>
                    <p>End nodes: {simulation.terminal_nodes.join(", ") || "none"}</p>
                    <p>Execution order: {simulation.execution_order.join(" -> ") || "No executable order yet"}</p>
                  </div>
                  {validation.issues.length ? (
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Issues</p>
                      <div className="mt-2 space-y-2">
                        {validation.issues.slice(0, 4).map((issue, index) => (
                          <p key={`${issue.code}-${index}`}>
                            <span className="font-medium uppercase text-stone-900">{issue.severity}</span>: {issue.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {simulation.notes.length ? (
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Simulation notes</p>
                      <div className="mt-2 space-y-2">
                        {simulation.notes.slice(0, 4).map((note, index) => (
                          <p key={`${note}-${index}`}>{note}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </SurfaceCard>

              <SurfaceCard
                title="Recent runs"
                description="The last few engine runs for this workflow."
                tone="mint"
              >
                <div className="space-y-3 text-sm leading-6 text-stone-700">
                  {recentRuns.length ? (
                    recentRuns.map((run) => (
                      <div key={run.id} className="rounded-2xl bg-white/80 px-4 py-3">
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
                            className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
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
                title="Chat draft"
                description="The original user request stays visible so the workflow remains grounded in the task."
                tone="sand"
              >
                <div className="space-y-3 text-sm leading-6 text-stone-700">
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Prompt
                    </p>
                    <p className="mt-2 text-sm text-stone-700">
                      {originalPrompt || "No original prompt recorded."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Draft source
                    </p>
                    <p className="mt-2">Provider: {generation?.provider ?? "local"}</p>
                    <p>Model: {generation?.model ?? "not recorded"}</p>
                    <p>{generation?.notes ?? "No generation notes available."}</p>
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard
                title="Workflow details"
                description="Keep metadata clear but secondary."
                tone="default"
              >
                <div className="grid gap-3 text-sm leading-6 text-stone-700">
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">Workflow id: {workflow.id}</div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">Workspace id: {workflow.workspace_id}</div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">Nodes: {graph.nodes.length}</div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">Edges: {graph.edges.length}</div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">
                    Updated: {new Date(workflow.updated_at).toLocaleString()}
                  </div>
                </div>
              </SurfaceCard>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#ff7f5f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#f26f4d] sm:w-auto"
                >
                  Save changes
                </button>
                <Link
                  href="/app/workflows"
                  className="w-full rounded-full border border-stone-900/10 bg-white px-6 py-3 text-center text-sm font-medium text-stone-700 transition hover:bg-stone-50 sm:w-auto"
                >
                  Back to library
                </Link>
                <Link
                  href="/app/runs"
                  className="w-full rounded-full border border-stone-900/10 bg-white px-6 py-3 text-center text-sm font-medium text-stone-700 transition hover:bg-stone-50 sm:w-auto"
                >
                  View runs
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
