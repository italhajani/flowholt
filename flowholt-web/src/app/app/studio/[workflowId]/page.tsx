import Link from "next/link";

import { runWorkflow, saveWorkflow } from "@/app/app/studio/actions";
import { StudioAssistantPanel } from "@/components/studio-assistant-panel";
import { StudioCanvas } from "@/components/studio-canvas";
import { StudioResourcesPanel } from "@/components/studio-resources-panel";
import { StudioScreen } from "@/components/studio-screen";
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
  const centerMode = readMessage(paramsState.center) || (autoSend ? "canvas" : "canvas");
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
  const clearAutoPreviewUrl = `/app/studio/${workflow.id}`;

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
          <button type="submit" form="workflow-save-form" className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700">Save</button>
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

  const canvasContent = (
    <div className="flex h-full flex-col overflow-hidden bg-[#f4f4f2]">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-4 sm:p-5 lg:p-6">
          {message ? <div className="mb-4 rounded-[14px] bg-[#eef7f1] px-4 py-3 text-sm text-emerald-900">{message}</div> : null}
          {error ? <div className="mb-4 rounded-[14px] bg-[#fff1eb] px-4 py-3 text-sm text-[#b45309]">{error}</div> : null}
          <form id="workflow-save-form" action={saveWorkflow} className="h-full">
            <input type="hidden" name="workflowId" value={workflow.id} />
            <StudioCanvas initialGraph={graph} originalPrompt={originalPrompt} latestRunOutput={latestRunOutput} integrationOptions={integrationOptions} />
          </form>
        </div>
      </div>
    </div>
  );

  const createContent = (
    <div className="h-full bg-[#fcfcfb] p-6 xl:p-8">
      <div className="mx-auto flex h-full max-w-[760px] flex-col items-center justify-center text-center">
        <h1 className="text-[2.1rem] font-semibold tracking-tight text-stone-950">What will you automate?</h1>
        <p className="mt-3 max-w-[560px] text-base leading-7 text-stone-400">Describe your workflow in plain English. FlowHolt builds the canvas.</p>
        <div className="mt-8 w-full rounded-[22px] border border-black/8 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="min-h-[180px] rounded-[16px] border border-black/6 bg-[#fcfcfb] px-5 py-5 text-left text-[15px] leading-8 text-stone-400">
            {assistantPrefill || originalPrompt || "Example: When a new lead fills the form, research their company, draft a personalised email, and log everything in the CRM..."}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/6 pt-4">
            <div className="flex gap-2 text-xs">
              <span className="rounded-[10px] bg-[#f5f5f5] px-3 py-2 text-stone-500">Trigger first</span>
              <span className="rounded-[10px] bg-[#f5f5f5] px-3 py-2 text-stone-500">From template</span>
            </div>
            <Link href={`/app/create?prompt=${encodeURIComponent(originalPrompt || assistantPrefill)}`} className="rounded-[14px] border border-black/8 bg-white px-6 py-3 text-sm font-medium text-stone-900 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
              Edit prompt
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const runsContent = (
    <div className="h-full bg-[#fcfcfb] p-6">
      <div className="mx-auto max-w-[920px] space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Runs</p>
          <h2 className="mt-2 text-[1.7rem] font-semibold text-stone-950">Workflow runs</h2>
        </div>
        {recentRuns.length ? recentRuns.map((run) => (
          <div key={run.id} className="rounded-[18px] border border-black/6 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-900">{run.status}</p>
                <p className="mt-1 text-xs text-stone-500">{run.trigger_source} | {formatDateLabel(run.created_at)}</p>
              </div>
              <Link href={`/app/runs/${run.id}`} className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700">Open</Link>
            </div>
          </div>
        )) : <div className="rounded-[18px] border border-black/6 bg-white px-5 py-5 text-sm text-stone-500">No runs yet.</div>}
      </div>
    </div>
  );

  const integrationsContent = (
    <div className="h-full bg-[#fcfcfb] p-6">
      <div className="mx-auto max-w-[920px] space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Integrations</p>
          <h2 className="mt-2 text-[1.7rem] font-semibold text-stone-950">Connected resources</h2>
        </div>
        {integrationOptions.length ? integrationOptions.map((item) => (
          <div key={item.id} className="rounded-[18px] border border-black/6 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-sm font-medium text-stone-900">{item.label}</p>
            <p className="mt-1 text-xs text-stone-500">{item.provider}</p>
            <p className="mt-2 text-sm text-stone-600">{item.description || "Reusable workspace connection."}</p>
          </div>
        )) : <div className="rounded-[18px] border border-black/6 bg-white px-5 py-5 text-sm text-stone-500">No active connections yet.</div>}
      </div>
    </div>
  );

  const settingsContent = (
    <div className="h-full bg-[#fcfcfb] p-6">
      <div className="mx-auto max-w-[920px] space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Settings</p>
          <h2 className="mt-2 text-[1.7rem] font-semibold text-stone-950">Workflow settings</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[18px] border border-black/6 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Validation</p>
            <p className="mt-3 text-2xl font-semibold text-stone-950">{validation.score}/100</p>
          </div>
          <div className="rounded-[18px] border border-black/6 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Paths</p>
            <p className="mt-3 text-2xl font-semibold text-stone-950">{simulation.possible_path_count}</p>
          </div>
          <div className="rounded-[18px] border border-black/6 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Provider</p>
            <p className="mt-3 text-sm font-medium text-stone-900">{generation?.provider ?? "local"}</p>
          </div>
          <div className="rounded-[18px] border border-black/6 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Model</p>
            <p className="mt-3 text-sm font-medium text-stone-900">{generation?.model ?? "not set"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const workflowSidebar = (
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
    </div>
  );

  const modelsSidebar = (
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
    <main className="h-screen overflow-hidden bg-[#f4f4f2] text-stone-950">
      <div className="mx-auto flex h-full max-w-[1680px] gap-5 px-4 py-4">
        <StudioScreen
          workflowName={workflow.name}
          header={header}
          leftRail={leftRail}
          initialMode={(centerMode as "create" | "canvas" | "runs" | "integrations" | "settings") || "canvas"}
          initialRightTab={(openPanel as "assistant" | "workflow" | "models" | "resources") || "assistant"}
          initialRightOpen={openPanel === "assistant" || autoSend || Boolean(assistantPrefill)}
          createContent={createContent}
          canvasContent={canvasContent}
          runsContent={runsContent}
          integrationsContent={integrationsContent}
          settingsContent={settingsContent}
          assistantSidebar={
            <StudioAssistantPanel
              workflowId={workflow.id}
              workflowName={workflow.name}
              initialPrompt={originalPrompt}
              prefillMessage={assistantPrefill}
              autoSubmitMessage={autoSend}
              autoPreviewResourceKitKey={previewPack ? activePackKey : ""}
              clearAutoPreviewUrl={clearAutoPreviewUrl}
              resourceSuggestions={resourceSuggestions}
            />
          }
          workflowSidebar={workflowSidebar}
          modelsSidebar={modelsSidebar}
          resourcesSidebar={<StudioResourcesPanel workflowId={workflow.id} activeKitKey={activePackKey} integrations={integrationOptions} resourceSuggestions={resourceSuggestions} />}
        />
      </div>
    </main>
  );
}