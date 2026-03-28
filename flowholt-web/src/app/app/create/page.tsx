import Link from "next/link";

import { createWorkflowFromChat } from "@/app/app/create/actions";
import {
  IconAgents,
  IconIntegrations,
  IconPlus,
  IconRuns,
  IconSettings,
  IconStudio,
  IconWorkflows,
} from "@/components/icons";
import { StudioWorkspaceShell } from "@/components/studio-workspace-shell";
import { getWorkflowLibrarySnapshot } from "@/lib/flowholt/data";

type CreatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const starterIdeas = [
  "Lead qualification + CRM writeback",
  "Support ticket summariser",
  "Content research and publish",
  "Daily ops report",
];

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const snapshot = await getWorkflowLibrarySnapshot();
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);
  const prompt = readMessage(params.prompt);

  const header = (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Link href="/app/workflows">Workflows</Link>
          <span>/</span>
          <span className="text-stone-900">New workflow</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <h1 className="text-lg font-semibold text-stone-950">New workflow</h1>
          <span className="border border-black/8 bg-[#f6f5f2] px-2.5 py-1 text-xs text-stone-500">Draft - unsaved</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]">Save</button>
        <button type="button" className="border border-black/8 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]">Run</button>
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

  const leftPanel = (
    <div className="px-3 py-3">
      <div className="border-b border-black/8 pb-3">
        <p className="text-sm font-medium text-stone-900">Studio</p>
        <p className="mt-1 text-xs text-stone-500">Lead intake autopilot</p>
      </div>

      <div className="pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Create</p>
        <div className="mt-2 space-y-1">
          <Link href="/app/create" className="flex items-center gap-3 border-r-2 border-[#ef6a3a] bg-[#fff5f1] px-3 py-2.5 text-sm font-medium text-[#ef6a3a]">
            <IconPlus className="h-4 w-4" />
            <span>Create new</span>
          </Link>
          <Link href="/app/workflows" className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-600 transition-smooth hover:bg-white">
            <IconWorkflows className="h-4 w-4" />
            <span>Workflow library</span>
          </Link>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Monitor</p>
        <div className="mt-2 space-y-1">
          <Link href="/app/runs" className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-600 transition-smooth hover:bg-white">
            <IconRuns className="h-4 w-4" />
            <span>Runs</span>
          </Link>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Config</p>
        <div className="mt-2 space-y-1">
          <Link href="/app/integrations" className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-600 transition-smooth hover:bg-white">
            <IconIntegrations className="h-4 w-4" />
            <span>Integrations</span>
          </Link>
          <Link href="/app/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-600 transition-smooth hover:bg-white">
            <IconSettings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );

  const center = (
    <div className="flex h-full flex-col overflow-hidden bg-[#f3f3f1] p-5">
      <div className="flex flex-1 items-center justify-center overflow-auto">
        <div className="w-full max-w-[700px]">
          {message ? <div className="mb-4 border border-[#cce8d4] bg-[#eef8f1] px-4 py-3 text-sm text-emerald-900">{message}</div> : null}
          {error ? <div className="mb-4 border border-[#f6d2c3] bg-[#fff4ef] px-4 py-3 text-sm text-[#b45309]">{error}</div> : null}

          <div className="text-center">
            <h1 className="text-[2.5rem] font-semibold leading-tight tracking-[-0.04em] text-stone-950">What will you automate?</h1>
            <p className="mt-3 text-base leading-7 text-stone-500">
              Describe your workflow in plain English. FlowHolt builds the canvas.
            </p>
          </div>

          <form action={createWorkflowFromChat} className="mt-8">
            <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace?.id ?? ""} />
            <div className="border border-black/8 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
              <textarea
                name="prompt"
                defaultValue={prompt}
                rows={6}
                placeholder="Example: When a new lead fills the form, research their company, draft a personalised email, and log everything in the CRM..."
                className="w-full resize-none border border-black/8 bg-[#faf9f7] p-4 text-base leading-8 text-stone-700 outline-none placeholder:text-stone-400"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4">
                <div className="flex gap-2 text-xs">
                  <span className="border border-black/8 bg-[#f6f5f2] px-3 py-2 text-stone-500">Trigger first</span>
                  <span className="border border-black/8 bg-[#f6f5f2] px-3 py-2 text-stone-500">From template</span>
                </div>
                <button
                  type="submit"
                  disabled={!snapshot.activeWorkspace}
                  className="border border-black/8 bg-white px-6 py-3 text-sm font-medium text-stone-900 transition-smooth hover:bg-[#f7f6f3] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                >
                  Send & open canvas
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {starterIdeas.map((idea) => (
              <Link
                key={idea}
                href={`/app/create?prompt=${encodeURIComponent(idea)}`}
                className="border border-black/8 bg-white px-4 py-4 text-left shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition-smooth hover:bg-[#fbfaf7]"
              >
                <p className="text-sm font-medium text-stone-900">{idea}</p>
                <p className="mt-1.5 text-xs leading-5 text-stone-500">Click to use this idea.</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f3f3f1] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-[1720px] gap-3 px-3 py-3">
        <StudioWorkspaceShell
          header={header}
          leftRail={leftRail}
          leftPanel={leftPanel}
          canvas={center}
          rightPanel={<div className="flex h-full items-center justify-center p-4 text-sm text-stone-400">Send a message from the center and the assistant opens here.</div>}
          initialLeftOpen={false}
          initialRightOpen={false}
        />
      </div>
    </main>
  );
}
