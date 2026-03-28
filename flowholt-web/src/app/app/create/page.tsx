import Link from "next/link";

import { createWorkflowFromChat } from "@/app/app/create/actions";
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
    <>
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <Link href="/app/workflows">Workflows</Link>
        <span>/</span>
        <span className="text-stone-900">New workflow</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[1.1rem] font-semibold text-stone-950">New workflow</p>
          <p className="mt-1 text-sm text-stone-500">Draft - unsaved</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700">Save</button>
          <button type="button" className="rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700">Run</button>
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
        <p className="text-sm font-medium text-stone-900">Studio</p>
        <p className="mt-1 text-xs text-stone-500">Lead intake autopilot</p>
      </div>

      <div className="pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Create</p>
        <div className="mt-2 space-y-1">
          <Link href="/app/create" className="block rounded-[12px] border-r-2 border-[#ea6f49] bg-[#fff3ef] px-3 py-2.5 text-sm font-medium text-[#ea6f49]">Create new</Link>
          <Link href="/app/workflows" className="block rounded-[12px] px-3 py-2.5 text-sm text-stone-600 hover:bg-white">Workflow library</Link>
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

  const center = (
    <div className="h-full bg-[#fcfcfb] p-6 xl:p-8">
      {message ? <div className="mb-4 rounded-[16px] bg-[#eef7f1] px-4 py-3 text-sm text-emerald-900">{message}</div> : null}
      {error ? <div className="mb-4 rounded-[16px] bg-[#fff1eb] px-4 py-3 text-sm text-[#b45309]">{error}</div> : null}

      <div className="mx-auto flex h-full max-w-[760px] flex-col items-center justify-center text-center">
        <h1 className="text-[2.2rem] font-semibold tracking-tight text-stone-950">What will you automate?</h1>
        <p className="mt-3 max-w-[560px] text-base leading-7 text-stone-400">
          Describe your workflow in plain English. FlowHolt builds the canvas.
        </p>

        <form action={createWorkflowFromChat} className="mt-8 w-full rounded-[22px] border border-black/8 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace?.id ?? ""} />
          <textarea
            name="prompt"
            defaultValue={prompt}
            rows={5}
            placeholder="Example: When a new lead fills the form, research their company, draft a personalised email, and log everything in the CRM..."
            className="w-full resize-none border-0 bg-transparent px-0 py-0 text-[15px] leading-8 text-stone-700 outline-none placeholder:text-stone-400"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/6 pt-4">
            <div className="flex gap-2 text-xs">
              <span className="rounded-[10px] bg-[#f5f5f5] px-3 py-2 text-stone-500">Trigger first</span>
              <span className="rounded-[10px] bg-[#f5f5f5] px-3 py-2 text-stone-500">From template</span>
            </div>
            <button type="submit" disabled={!snapshot.activeWorkspace} className="rounded-[14px] border border-black/8 bg-white px-6 py-3 text-sm font-medium text-stone-900 shadow-[0_6px_18px_rgba(15,23,42,0.05)] disabled:cursor-not-allowed disabled:bg-stone-100">
              Send and open canvas
            </button>
          </div>
        </form>

        <div className="mt-5 grid w-full gap-3 sm:grid-cols-2">
          {starterIdeas.map((idea) => (
            <Link key={idea} href={`/app/create?prompt=${encodeURIComponent(idea)}`} className="rounded-[18px] border border-black/6 bg-white px-4 py-4 text-left shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:bg-[#fafafa]">
              <p className="text-sm font-medium text-stone-900">{idea}</p>
              <p className="mt-1 text-xs leading-5 text-stone-400">Click to use this idea in the chat input.</p>
            </Link>
          ))}
        </div>
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
          canvas={center}
          rightPanel={<div className="h-full px-4 py-4 text-sm text-stone-400">Send a message from the center and the assistant opens here.</div>}
          initialRightOpen={false}
        />
      </div>
    </main>
  );
}