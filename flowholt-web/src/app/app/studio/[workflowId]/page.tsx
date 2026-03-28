import Link from "next/link";

import { runWorkflow, saveWorkflow } from "@/app/app/studio/actions";
import { StudioAssistantPanel } from "@/components/studio-assistant-panel";
import { StudioCanvas } from "@/components/studio-canvas";
import { StudioResourcesPanel } from "@/components/studio-resources-panel";
import { StudioSidebarTabs } from "@/components/studio-sidebar-tabs";
import { WorkflowSchedulePanel } from "@/components/workflow-schedule-panel";
import {
  getDemoWorkflow,
  getRunsSnapshot,
  getWorkflowForStudio,
  getWorkflowSchedules,
} from "@/lib/flowholt/data";
import { validateWorkflowGraph } from "@/lib/flowholt/graph-validator";
import { simulateWorkflowGraph } from "@/lib/flowholt/simulator";
import { buildToolMarketplaceComposerSuggestions } from "@/lib/flowholt/tool-marketplace";
import { appNavigation } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

type StudioPageProps = {
  params: Promise<{ workflowId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const studioNavigation = appNavigation.filter((item) =>
  ["Workflows", "Studio", "Create Flow", "Runs", "Integrations", "Settings"].includes(item.label),
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
  const generation = settings?.generation as { provider?: string; model?: string } | undefined;
  const originalPrompt = typeof settings?.originalPrompt === "string" ? settings.originalPrompt : "";
  const runsSnapshot = await getRunsSnapshot();
  const recentRuns = runsSnapshot.runs.filter((run) => run.workflow_id === workflow.id).slice(0, 4);
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
  const clearAutoPreviewUrl =
    assistantPrefill && activePackKey
      ? `/app/studio/${workflow.id}?assistant=${encodeURIComponent(assistantPrefill)}&kit=${encodeURIComponent(activePackKey)}`
      : `/app/studio/${workflow.id}`;

  const workflowPanel = (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-black/6 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Workflow</p>
        <form action={saveWorkflow} className="mt-4 space-y-4">
          <input type="hidden" name="workflowId" value={workflow.id} />
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="workflow-name">
              Name
            </label>
            <input
              id="workflow-name"
              name="name"
              defaultValue={workflow.name}
              className="w-full rounded-[16px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="workflow-status">
              Status
            </label>
            <select
              id="workflow-status"
              name="status"
              defaultValue={workflow.status}
              className="w-full rounded-[16px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="workflow-description">
              Description
            </label>
            <textarea
              id="workflow-description"
              name="description"
              defaultValue={workflow.description}
              rows={3}
              className="w-full rounded-[16px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none"
            />
          </div>
          <button type="submit" className="flowholt-secondary-button w-full px-4 py-3 text-sm font-medium">
            Save workflow details
          </button>
        </form>
      </div>

      <div className="rounded-[22px] border border-black/6 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Schedule</p>
        <div className="mt-4">
          <WorkflowSchedulePanel
            workflowId={workflow.id}
            workflowName={workflow.name}
            initialSchedules={workflowSchedules}
          />
        </div>
      </div>

      <div className="rounded-[22px] border border-black/6 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Overview</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[16px] bg-[#fafafa] px-4 py-3">
            <p className="text-xs text-stone-500">Validation</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">{validation.score}/100</p>
          </div>
          <div className="rounded-[16px] bg-[#fafafa] px-4 py-3">
            <p className="text-xs text-stone-500">Paths</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">{simulation.possible_path_count}</p>
          </div>
          <div className="rounded-[16px] bg-[#fafafa] px-4 py-3">
            <p className="text-xs text-stone-500">Provider</p>
            <p className="mt-2 text-sm font-medium text-stone-900">{generation?.provider ?? "local"}</p>
          </div>
          <div className="rounded-[16px] bg-[#fafafa] px-4 py-3">
            <p className="text-xs text-stone-500">Model</p>
            <p className="mt-2 text-sm font-medium text-stone-900">{generation?.model ?? "not set"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-black/6 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Recent runs</p>
          <Link href="/app/runs" className="text-xs font-medium text-stone-500 underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentRuns.length ? (
            recentRuns.map((run) => (
              <Link
                key={run.id}
                href={`/app/runs/${run.id}`}
                className="block rounded-[16px] border border-black/6 bg-[#fafafa] px-4 py-3 transition hover:bg-[#f5f5f5]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-stone-900">{run.status}</p>
                  <span className="text-xs text-stone-400">{formatDateLabel(run.created_at)}</span>
                </div>
                <p className="mt-1 text-xs text-stone-500">Triggered via {run.trigger_source}</p>
              </Link>
            ))
          ) : (
            <div className="rounded-[16px] bg-[#fafafa] px-4 py-3 text-sm text-stone-500">No runs yet.</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f4f4f2] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-5 px-4 py-4">
        <aside className="hidden w-[220px] shrink-0 flex-col rounded-[28px] border border-black/6 bg-white px-4 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] lg:flex">
          <Link href="/app/workflows" className="flex items-center gap-3 px-2 pb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#7c68f5] text-sm font-semibold text-white">
              FH
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">FlowHolt</p>
              <p className="text-xs text-stone-500">Studio</p>
            </div>
          </Link>

          <nav className="space-y-1">
            {studioNavigation.map((item) => {
              const active = item.label === "Studio";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm transition ${
                    active ? "bg-[#f2efff] text-stone-950" : "text-stone-600 hover:bg-[#f7f7f5] hover:text-stone-950"
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] text-[11px] font-semibold ${active ? "bg-white text-[#7c68f5]" : "bg-[#f7f7f5] text-stone-500"}`}>
                    {item.label.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link href="/app/create" className="mt-auto rounded-full bg-[#111111] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-black">
            Create New
          </Link>
        </aside>

        <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-black/6 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
          <header className="border-b border-black/6 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span>Personal</span>
                  <span>/</span>
                  <span className="truncate">{workflow.name}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-[1.35rem] font-semibold tracking-tight text-stone-950">{workflow.name}</h1>
                  <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-stone-500">Saved</span>
                  <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-stone-500">{graph.nodes.length} steps</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700">
                  Share
                </button>
                <button type="submit" form="workflow-save-form" className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700">
                  Save
                </button>
                {workflow.id !== "demo-workflow" ? (
                  <form action={runWorkflow}>
                    <input type="hidden" name="workflowId" value={workflow.id} />
                    <button type="submit" className="rounded-full bg-[#ff7a59] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#f26d4a]">
                      Test Flow
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <span className="rounded-[12px] bg-stone-900 px-4 py-2 text-sm font-medium text-white">Editor</span>
              <Link href="/app/runs" className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-600">
                Executions
              </Link>
              <span className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-400">
                Evaluations
              </span>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_370px]">
            <div className="min-h-0 border-b border-black/6 p-4 xl:border-b-0 xl:border-r xl:p-5">
              {message ? (
                <div className="mb-4 rounded-[16px] bg-[#eef7f1] px-4 py-3 text-sm text-emerald-900">{message}</div>
              ) : null}
              {error ? (
                <div className="mb-4 rounded-[16px] bg-[#fff1eb] px-4 py-3 text-sm text-[#b45309]">{error}</div>
              ) : null}

              <form id="workflow-save-form" action={saveWorkflow} className="h-full">
                <input type="hidden" name="workflowId" value={workflow.id} />
                <StudioCanvas
                  initialGraph={graph}
                  originalPrompt={originalPrompt}
                  latestRunOutput={latestRunOutput}
                  integrationOptions={integrationOptions}
                />
              </form>
            </div>

            <StudioSidebarTabs
              assistant={
                <StudioAssistantPanel
                  workflowId={workflow.id}
                  workflowName={workflow.name}
                  initialPrompt={originalPrompt}
                  prefillMessage={assistantPrefill}
                  autoPreviewResourceKitKey={previewPack ? activePackKey : ""}
                  clearAutoPreviewUrl={clearAutoPreviewUrl}
                  resourceSuggestions={resourceSuggestions}
                />
              }
              workflow={workflowPanel}
              resources={
                <StudioResourcesPanel
                  workflowId={workflow.id}
                  activeKitKey={activePackKey}
                  integrations={integrationOptions}
                  resourceSuggestions={resourceSuggestions}
                />
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}