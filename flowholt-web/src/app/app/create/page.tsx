import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { createWorkflowFromChat } from "@/app/app/create/actions";
import { getWorkflowLibrarySnapshot } from "@/lib/flowholt/data";

type CreatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const starterIdeas = [
  "Summarize customer support tickets every morning",
  "Score new inbound leads and update the CRM",
  "Turn form submissions into personalized outreach drafts",
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
      title="Describe the task you want to automate"
      description="Start with plain words. FlowHolt will turn the task into a saved workflow draft that you can shape in Studio."
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-5">
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

          <SurfaceCard
            title="Start with a task"
            description="This is now the main first step for users. Describe the work in simple language, then open the saved draft in Studio."
          >
            <form action={createWorkflowFromChat} className="rounded-[2rem] border border-[#d9cfc1] bg-[#fbf7f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <input
                type="hidden"
                name="workspaceId"
                value={snapshot.activeWorkspace?.id ?? ""}
              />
              <textarea
                name="prompt"
                defaultValue={prompt}
                placeholder="Describe the task you want FlowHolt to build for you..."
                rows={7}
                className="w-full resize-none bg-transparent text-base leading-8 text-stone-700 outline-none placeholder:text-stone-400"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!snapshot.activeWorkspace}
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  Create draft
                </button>
                <Link
                  href="/app/workflows"
                  className="rounded-full border border-stone-900/10 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  Open workflows
                </Link>
                {!snapshot.activeWorkspace ? (
                  <Link
                    href="/app/dashboard"
                    className="rounded-full border border-stone-900/10 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Create workspace first
                  </Link>
                ) : null}
              </div>
            </form>
          </SurfaceCard>

          <SurfaceCard
            title="Popular ideas"
            description="These quick prompts help new users start faster and mirror the clean pattern used by strong workflow tools."
            tone="mint"
          >
            <div className="flex flex-wrap gap-3">
              {starterIdeas.map((idea) => (
                <Link
                  key={idea}
                  href={`/app/create?prompt=${encodeURIComponent(idea)}`}
                  className="rounded-full border border-stone-900/10 bg-white px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-50"
                >
                  {idea}
                </Link>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-5">
          <SurfaceCard
            title="How it works"
            description="Simple language in the product, stronger logic behind the scenes."
            tone="sand"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              <p>1. Describe the task in chat.</p>
              <p>2. FlowHolt creates a workflow draft.</p>
              <p>3. Open it in Studio and refine it.</p>
              <p>4. Later, we will let AI build the graph automatically.</p>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Recent workflows"
            description="Existing work stays close to the create surface so users can jump back in fast."
          >
            <div className="grid gap-3">
              {snapshot.workflows.length ? (
                snapshot.workflows.slice(0, 4).map((workflow) => (
                  <Link
                    key={workflow.id}
                    href={`/app/studio/${workflow.id}`}
                    className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-4 transition hover:bg-stone-100"
                  >
                    <p className="text-sm font-medium text-stone-900">{workflow.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{workflow.description || "No description yet"}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  No workflows yet. Create one from the chat box.
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
