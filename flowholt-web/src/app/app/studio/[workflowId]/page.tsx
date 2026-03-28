import Link from "next/link";

import { runWorkflow, saveWorkflow } from "@/app/app/studio/actions";
import { StudioAssistantPanel } from "@/components/studio-assistant-panel";
import { StudioCanvas } from "@/components/studio-canvas";
import { StudioResourcesPanel } from "@/components/studio-resources-panel";
import { StudioSidebarTabs } from "@/components/studio-sidebar-tabs";
import { StudioWorkspaceShell } from "@/components/studio-workspace-shell";
import { WorkflowSchedulePanel } from "@/components/workflow-schedule-panel";
import { getDemoWorkflow, getRunsSnapshot, getWorkflowForStudio, getWorkflowSchedules } from "@/lib/flowholt/data";
import { validateWorkflowGraph } from "@/lib/flowholt/graph-validator";
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
  const openPanel = readMessage(paramsState.openPanel) || "assistant";
  const autoSend = readMessage(paramsState.autoSend) === "1";
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

  const header = (
    <>
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <Link href="/app/workflows">Workflows</Link>
        <span>/</span>
        <span className="text-stone-900">{workflow.name}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[1.1rem] font-semibold text-stone-950">{workflow.name}</h1>
          <span className="rounded-[10px] bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-stone-500">{graph.nodes.length} nodes</span>
          <span className="rounded-[10px] bg-[#edf9ee] px-3 py-1 text-xs font-medium text-emerald-700">Ready to test</span>
          <span className="rounded-[10px] bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-stone-500">Autosaved 2m ago</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700">Share</button>
          <Link href="/app/runs" className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700">Executions</Link>
          {workflow.id !== "demo-workflow" ? (
            <form action={runWorkflow}>
              <input type="hidden" name="workflowId" value={workflow.id} />
              <button type="submit" className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-900">Run flow</button>
            </form>
          ) : null}
        </div>
      </div>
    </>
  );

  const leftRail = (
    <div className="flex h-full flex-col items-center gap-4 py-4">
      <Link href="/app/workflows" className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#ea6f49] text-white shadow-[0_8px_18px_rgba(234,111,73,0.24)]">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </Link>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={`flex h-9 w-9 items-center justify-center rounded-[12px] border border-black/8 ${index === 0 ? "bg-[#fff3ef] text-[#ea6f49]" : "bg-white text-stone-300"}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
        </div>
      ))}
      <div className="mt-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd5c8] bg-[#fff4ef] text-[11px] font-medium text-[#ea6f49]">N</div>
    </div>
  );

  const leftPanel = (
    <div className="px-4 py-4">
      <div className="border-b border-black/6 pb-4">
        <p className="text-sm font-medium text-stone-900">Studio - {workflow.name}</p>
      </div>

      <div className="pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Create</p>
        <div className="mt-2 space-y-1">
          <Link href="/app/create" className="block rounded-[12px] px-3 py-2.5 text-sm text-stone-600 hover:bg-white">Create new</Link>
          <Link href={`/app/studio/${workflow.id}`} className="block rounded-[12px] border-r-2 border-[#ea6f49] bg-[#fff3ef] px-3 py-2.5 text-sm font-medium text-[#ea6f49]">Canvas editor</Link>
        </div>
      </div>

      <div className="pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Monitor</p>
        <div className="mt-2 space-y-1">
          <Link href="/app/runs" className="block rounded-[12px] px-3 py-2.5 text-sm text-stone-600 hover:bg-white">Runs</Link>
        </div>
      </div>

      <div className="pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Config</p>
        <div className="mt-2 space-y-1">
          <Link href="/app/integrations" className="block rounded-[12px] px-3 py-2.5 text-sm text-stone-600 hover:bg-white">Integrations</Link>
          <Link href="/app/settings" className="block rounded-[12px] px-3 py-2.5 text-sm text-stone-600 hover:bg-white">Settings</Link>
        </div>
      </div>
    </div>
  );

  const workflowPanel = (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-black/6 bg-white px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Workflow</p>
        <form action={saveWorkflow} className="mt-4 space-y-4">
          <input type="hidden" name="workflowId" value={workflow.id} />
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="workflow-name">Name</label>
            <input id="workflow-name" name="name" defaultValue={workflow.name} className="w-full rounded-[14px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="workflow-description">Description</label>
            <textarea id="workflow-description" name="description" defaultValue={workflow.description} rows={3} className="w-full rounded-[14px] border border-black/8 bg-[#fafafa] px-4 py-3 text-sm outline-none" />
          </div>
          <button type="submit" className="w-full rounded-[12px] border border-black/8 bg-white px-4 py-3 text-sm font-medium text-stone-900">Save workflow</button>
        </form>
      </div>

      <div className="rounded-[18px] border border-black/6 bg-white px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Schedule</p>
        <div className="mt-4">
          <WorkflowSchedulePanel workflowId={workflow.id} workflowName={workflow.name} initialSchedules={workflowSchedules} />
        </div>
      </div>

      <div className="rounded-[18px] border border-black/6 bg-white px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Recent runs</p>
        <div className="mt-4 space-y-3">
          {recentRuns.length ? recentRuns.map((run) => (
            <Link key={run.id} href={`/app/runs/${run.id}`} className="block rounded-[14px] bg-[#fafafa] px-4 py-3 transition hover:bg-[#f5f5f5]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-stone-900">{run.status}</p>
                <span className="text-xs text-stone-400">{formatDateLabel(run.created_at)}</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">{run.trigger_source}</p>
            </Link>
          )) : <div className="rounded-[14px] bg-[#fafafa] px-4 py-3 text-sm text-stone-500">No runs yet.</div>}
        </div>
      </div>
    </div>
  );

  const modelsPanel = (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-black/6 bg-white px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Active model</p>
        <div className="mt-3 flex items-center justify-between rounded-[14px] bg-[#fafafa] px-4 py-3">
          <span className="text-sm font-medium text-stone-900">{generation?.model ?? "GPT-4o-mini"}</span>
          <span className="rounded-full bg-[#f2efff] px-3 py-1 text-xs font-medium text-[#6f5bf3]">{generation?.provider ?? "OpenAI"}</span>
        </div>
      </div>
      <div className="rounded-[18px] border border-black/6 bg-white px-4 py-4 text-sm leading-6 text-stone-600">
        <p>Validation score: {validation.score}/100</p>
        <p>Estimated paths: {simulation.possible_path_count}</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f4f4f2] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-5 px-4 py-4">
        <StudioWorkspaceShell
          header={header}
          leftRail={leftRail}
          leftPanel={leftPanel}
          initialRightOpen={openPanel === "assistant" || autoSend || Boolean(assistantPrefill)}
          canvas={
            <div className="h-full bg-[#fcfcfb] p-4 xl:p-5">
              {message ? <div className="mb-4 rounded-[16px] bg-[#eef7f1] px-4 py-3 text-sm text-emerald-900">{message}</div> : null}
              {error ? <div className="mb-4 rounded-[16px] bg-[#fff1eb] px-4 py-3 text-sm text-[#b45309]">{error}</div> : null}
              <form id="workflow-save-form" action={saveWorkflow} className="h-full">
                <input type="hidden" name="workflowId" value={workflow.id} />
                <StudioCanvas initialGraph={graph} originalPrompt={originalPrompt} latestRunOutput={latestRunOutput} integrationOptions={integrationOptions} />
              </form>
            </div>
          }
          rightPanel={
            <StudioSidebarTabs
              initialTab={openPanel === "workflow" || openPanel === "resources" || openPanel === "models" ? openPanel : "assistant"}
              assistant={
                <StudioAssistantPanel
                  workflowId={workflow.id}
                  workflowName={workflow.name}
                  initialPrompt={originalPrompt}
                  prefillMessage={assistantPrefill}
                  autoSubmitMessage={autoSend}
                  autoPreviewResourceKitKey={previewPack ? activePackKey : ""}
                  clearAutoPreviewUrl={`/app/studio/${workflow.id}`}
                  resourceSuggestions={resourceSuggestions}
                />
              }
              workflow={workflowPanel}
              models={modelsPanel}
              resources={<StudioResourcesPanel workflowId={workflow.id} activeKitKey={activePackKey} integrations={integrationOptions} resourceSuggestions={resourceSuggestions} />}
            />
          }
        />
      </div>
    </main>
  );
}