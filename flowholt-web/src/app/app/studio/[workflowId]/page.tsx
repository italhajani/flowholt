import type { ReactNode } from "react";
import Link from "next/link";

import { runWorkflow, saveWorkflow } from "@/app/app/studio/actions";
import {
  IconAgents,
  IconChevronDown,
  IconClock,
  IconIntegrations,
  IconPlay,
  IconRuns,
  IconSave,
  IconSettings,
  IconSparkles,
  IconStudio,
  IconTool,
  IconWorkflows,
} from "@/components/icons";
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

function CompactSection({
  title,
  meta,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  meta?: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="overflow-hidden border border-black/8 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-black/8 bg-[#faf9f7] text-stone-500">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-900">{title}</p>
            {meta ? <p className="mt-0.5 truncate text-xs text-stone-500">{meta}</p> : null}
          </div>
        </div>
        <IconChevronDown className="h-4 w-4 shrink-0 text-stone-400" />
      </summary>
      <div className="border-t border-black/8 px-3 py-3">{children}</div>
    </details>
  );
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
  const openPanel = readMessage(paramsState.openPanel);
  const autoSend = readMessage(paramsState.autoSend) === "1";
  const previewPack = readMessage(paramsState.previewPack) === "1";
  const centerMode = readMessage(paramsState.center) || "canvas";
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

  const initialRightMode = autoSend || Boolean(assistantPrefill)
    ? "chat"
    : openPanel === "workflow" || openPanel === "models" || openPanel === "resources"
      ? "tools"
      : openPanel === "assistant"
        ? "chat"
        : null;

  const initialRightTab = openPanel === "models" || openPanel === "resources" ? openPanel : "workflow";

  const header = (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Link href="/app/workflows">Workflows</Link>
          <span>/</span>
          <span className="truncate text-stone-900">{workflow.name}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <h1 className="text-lg font-semibold text-stone-950">{workflow.name}</h1>
          <span className="border border-black/8 bg-[#f6f5f2] px-2.5 py-1 text-xs text-stone-600">{graph.nodes.length} nodes</span>
          <span className="border border-[#bfe7c7] bg-[#eef8f1] px-2.5 py-1 text-xs text-[#1b7d4d]">Ready to test</span>
          <span className="border border-black/8 bg-[#f6f5f2] px-2.5 py-1 text-xs text-stone-500">Autosaved 2m ago</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="submit" form="workflow-save-form" className="inline-flex items-center gap-2 border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]">
          <IconSave className="h-4 w-4" />
          <span>Save</span>
        </button>
        <Link href="/app/runs" className="inline-flex items-center gap-2 border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]">
          <IconRuns className="h-4 w-4" />
          <span>Executions</span>
        </Link>
        {workflow.id !== "demo-workflow" ? (
          <form action={runWorkflow}>
            <input type="hidden" name="workflowId" value={workflow.id} />
            <button type="submit" className="inline-flex items-center gap-2 border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-stone-900 transition-smooth hover:bg-[#f7f6f3]">
              <IconPlay className="h-4 w-4" />
              <span>Run flow</span>
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );

  const railItems = [
    { href: "/app/workflows", icon: IconWorkflows, active: false },
    { href: "/app/studio/demo-workflow", icon: IconStudio, active: true },
    { href: "/app/agents", icon: IconAgents, active: false },
    { href: "/app/runs", icon: IconRuns, active: false },
    { href: "/app/integrations", icon: IconIntegrations, active: false },
    { href: "/app/settings", icon: IconSettings, active: false },
  ];

  const leftRail = (
    <div className="flex h-full flex-col items-center gap-2 py-3">
      <Link href="/app/workflows" className="flex h-9 w-9 items-center justify-center bg-[#ef6a3a] text-xs font-semibold text-white shadow-[0_8px_20px_rgba(239,106,58,0.24)]">
        FH
      </Link>
      <div className="mt-2 flex flex-col gap-1.5">
        {railItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-9 w-9 items-center justify-center border transition-smooth ${
                item.active
                  ? "border-[#ffd2c2] bg-[#fff5f1] text-[#ef6a3a]"
                  : "border-transparent bg-transparent text-stone-400 hover:border-black/8 hover:bg-white hover:text-stone-700"
              }`}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </div>
      <div className="mt-auto mb-1 flex h-8 w-8 items-center justify-center border border-[#ffd2c2] bg-[#fff5f1] text-[11px] font-medium text-[#ef6a3a]">
        N
      </div>
    </div>
  );

  const canvasContent = (
    <div className="flex h-full flex-col overflow-hidden bg-[#f3f3f1] p-3">
      {message ? <div className="mb-3 border border-[#cce8d4] bg-[#eef8f1] px-4 py-3 text-sm text-emerald-900">{message}</div> : null}
      {error ? <div className="mb-3 border border-[#f6d2c3] bg-[#fff4ef] px-4 py-3 text-sm text-[#b45309]">{error}</div> : null}
      <div className="min-h-0 flex-1 overflow-hidden">
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
    </div>
  );

  const createContent = (
    <div className="flex h-full items-center justify-center bg-[#f7f6f3] p-6">
      <div className="w-full max-w-[720px] text-center">
        <h1 className="text-[2.4rem] font-semibold tracking-[-0.04em] text-stone-950">What will you automate?</h1>
        <p className="mt-3 text-base leading-7 text-stone-500">Describe your workflow in plain English. FlowHolt builds the canvas.</p>
        <div className="mt-8 border border-black/8 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="min-h-[160px] border border-black/8 bg-[#faf9f7] px-5 py-5 text-left text-[15px] leading-8 text-stone-400">
            {assistantPrefill || originalPrompt || "Example: When a new lead fills the form, research their company, draft a personalised email, and log everything in the CRM..."}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4">
            <div className="flex gap-2 text-xs">
              <span className="border border-black/8 bg-[#f6f5f2] px-3 py-2 text-stone-500">Trigger first</span>
              <span className="border border-black/8 bg-[#f6f5f2] px-3 py-2 text-stone-500">From template</span>
            </div>
            <Link href={`/app/create?prompt=${encodeURIComponent(originalPrompt || assistantPrefill)}`} className="border border-black/8 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition-smooth hover:bg-[#f7f6f3]">
              Edit prompt
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const runsContent = (
    <div className="h-full overflow-auto bg-[#f7f6f3] p-5">
      <div className="mx-auto max-w-[920px] space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Runs</p>
          <h2 className="mt-2 text-[1.7rem] font-semibold text-stone-950">Workflow runs</h2>
        </div>
        {recentRuns.length ? recentRuns.map((run) => (
          <div key={run.id} className="border border-black/8 bg-white px-5 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-900">{run.status}</p>
                <p className="mt-1 text-xs text-stone-500">{run.trigger_source} | {formatDateLabel(run.created_at)}</p>
              </div>
              <Link href={`/app/runs/${run.id}`} className="border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]">Open</Link>
            </div>
          </div>
        )) : <div className="border border-black/8 bg-white px-5 py-5 text-sm text-stone-500">No runs yet.</div>}
      </div>
    </div>
  );

  const integrationsContent = (
    <div className="h-full overflow-auto bg-[#f7f6f3] p-5">
      <div className="mx-auto max-w-[920px] space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Integrations</p>
          <h2 className="mt-2 text-[1.7rem] font-semibold text-stone-950">Connected resources</h2>
        </div>
        {integrationOptions.length ? integrationOptions.map((item) => (
          <div key={item.id} className="border border-black/8 bg-white px-5 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <p className="text-sm font-medium text-stone-900">{item.label}</p>
            <p className="mt-1 text-xs text-stone-500">{item.provider}</p>
            <p className="mt-2 text-sm text-stone-600">{item.description || "Reusable workspace connection."}</p>
          </div>
        )) : <div className="border border-black/8 bg-white px-5 py-5 text-sm text-stone-500">No active connections yet.</div>}
      </div>
    </div>
  );

  const settingsContent = (
    <div className="h-full overflow-auto bg-[#f7f6f3] p-5">
      <div className="mx-auto max-w-[920px] space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Settings</p>
          <h2 className="mt-2 text-[1.7rem] font-semibold text-stone-950">Workflow settings</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-black/8 bg-white px-5 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Validation</p>
            <p className="mt-3 text-2xl font-semibold text-stone-950">{validation.score}/100</p>
          </div>
          <div className="border border-black/8 bg-white px-5 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Paths</p>
            <p className="mt-3 text-2xl font-semibold text-stone-950">{simulation.possible_path_count}</p>
          </div>
          <div className="border border-black/8 bg-white px-5 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Provider</p>
            <p className="mt-3 text-sm font-medium text-stone-900">{generation?.provider ?? "local"}</p>
          </div>
          <div className="border border-black/8 bg-white px-5 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Model</p>
            <p className="mt-3 text-sm font-medium text-stone-900">{generation?.model ?? "not set"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const workflowSidebar = (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <CompactSection title="Workflow" meta="Name and description" icon={<IconStudio className="h-4 w-4" />} defaultOpen>
        <form action={saveWorkflow} className="space-y-3">
          <input type="hidden" name="workflowId" value={workflow.id} />
          <div>
            <label className="mb-2 block text-xs font-semibold text-stone-700" htmlFor="workflow-name">Name</label>
            <input id="workflow-name" name="name" defaultValue={workflow.name} className="w-full border border-black/8 bg-[#faf9f7] px-3 py-2 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-stone-700" htmlFor="workflow-description">Description</label>
            <textarea id="workflow-description" name="description" defaultValue={workflow.description} rows={3} className="w-full border border-black/8 bg-[#faf9f7] px-3 py-2 text-sm outline-none" />
          </div>
          <button type="submit" className="w-full border border-black/8 bg-white px-3 py-2 text-sm font-medium text-stone-900 transition-smooth hover:bg-[#f7f6f3]">Save workflow</button>
        </form>
      </CompactSection>

      <CompactSection title="Schedule" meta="Automatic runs" icon={<IconClock className="h-4 w-4" />}>
        <div className="max-h-[300px] overflow-y-auto pr-1">
          <WorkflowSchedulePanel workflowId={workflow.id} workflowName={workflow.name} initialSchedules={workflowSchedules} />
        </div>
      </CompactSection>
    </div>
  );

  const modelsSidebar = (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <CompactSection title="Active model" meta="Provider and runtime" icon={<IconSparkles className="h-4 w-4" />} defaultOpen>
        <div className="border border-black/8 bg-[#faf9f7] px-3 py-3">
          <p className="text-sm font-medium text-stone-900">{generation?.model ?? "GPT-4o-mini"}</p>
          <p className="mt-1 text-xs text-stone-500">Provider: {generation?.provider ?? "OpenAI"}</p>
        </div>
      </CompactSection>

      <CompactSection title="Runtime health" meta="Validation and paths" icon={<IconTool className="h-4 w-4" />}>
        <div className="space-y-2 text-sm leading-6 text-stone-600">
          <div className="border border-black/8 bg-[#faf9f7] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Validation</p>
            <p className="mt-2 text-xl font-semibold text-stone-950">{validation.score}/100</p>
          </div>
          <div className="border border-black/8 bg-[#faf9f7] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Paths</p>
            <p className="mt-2 text-xl font-semibold text-stone-950">{simulation.possible_path_count}</p>
          </div>
        </div>
      </CompactSection>
    </div>
  );

  return (
    <main className="h-screen overflow-hidden bg-[#f3f3f1] text-stone-950">
      <div className="mx-auto flex h-full max-w-[1720px] gap-3 px-3 py-3">
        <StudioScreen
          workflowName={workflow.name}
          header={header}
          leftRail={leftRail}
          initialMode={(centerMode as "create" | "canvas" | "runs" | "integrations" | "settings") || "canvas"}
          initialRightTab={initialRightTab}
          initialRightMode={initialRightMode}
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
