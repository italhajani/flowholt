import Link from "next/link";

import { createWorkflowFromChat } from "@/app/app/create/actions";
import { AppShell } from "@/components/app-shell";
import { getWorkflowLibrarySnapshot } from "@/lib/flowholt/data";

type CreatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const starterIdeas = [
  "Build a lead qualification workflow with CRM writeback",
  "Create a support automation that summarizes tickets and drafts replies",
  "Make a content workflow that researches, writes, reviews, and publishes",
  "Set up a daily operations report from multiple data sources",
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

  return (
    <AppShell
      eyebrow="Create"
      title="Describe your workflow"
      description="Start with one clear task. FlowHolt will open Studio with the assistant conversation on the right."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-[28px] border border-black/6 bg-[#fafafa] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
          {message ? (
            <div className="mb-4 rounded-[16px] bg-[#eef7f1] px-4 py-3 text-sm text-emerald-900">{message}</div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-[16px] bg-[#fff1eb] px-4 py-3 text-sm text-[#b45309]">{error}</div>
          ) : null}

          <form action={createWorkflowFromChat} className="space-y-5">
            <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace?.id ?? ""} />

            <div className="rounded-[24px] border border-black/6 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Task</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Write the result you want. After you press send, Studio opens and the right chat sidebar continues the conversation.
                  </p>
                </div>
                <span className="rounded-full bg-[#f2efff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f5bf3]">
                  Chat first
                </span>
              </div>

              <textarea
                name="prompt"
                defaultValue={prompt}
                placeholder="Example: Build a workflow that receives a new lead, researches the company, summarizes the fit, drafts outreach, and writes the result back to the CRM."
                rows={12}
                className="mt-5 w-full resize-none rounded-[22px] border border-black/8 bg-[#fcfcfb] px-5 py-5 text-[15px] leading-8 text-stone-700 outline-none placeholder:text-stone-400"
              />

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!snapshot.activeWorkspace}
                  className="rounded-full bg-[#ff7a59] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#f26d4a] disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  Send and open Studio
                </button>
                <Link href="/app/workflows" className="flowholt-secondary-button px-5 py-3 text-sm font-medium">
                  Open workflows
                </Link>
                {!snapshot.activeWorkspace ? (
                  <Link href="/app/dashboard" className="flowholt-secondary-button px-5 py-3 text-sm font-medium">
                    Create workspace first
                  </Link>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-black/6 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Starter ideas</p>
            <div className="mt-4 space-y-3">
              {starterIdeas.map((idea) => (
                <Link
                  key={idea}
                  href={`/app/create?prompt=${encodeURIComponent(idea)}`}
                  className="block rounded-[16px] border border-black/6 bg-[#fafafa] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f5f5f5]"
                >
                  {idea}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-black/6 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">What happens next</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
              <p>1. FlowHolt creates a draft workflow from your prompt.</p>
              <p>2. Studio opens with the right chat panel ready.</p>
              <p>3. Your message appears in the sidebar conversation.</p>
              <p>4. The center stays focused on the canvas, not raw configuration.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}