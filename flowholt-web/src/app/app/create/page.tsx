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
  "Create a social content workflow with scheduling and review",
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
      title="Start from the task, not the technical setup"
      description="Describe the annoying work in plain language. FlowHolt will draft the workflow, then open it in Studio for clean refinement."
    >
      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
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
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Compose</p>
                <p className="mt-1 text-sm font-medium text-stone-900">Chat-first workflow creation</p>
              </div>
              <span className="flowholt-chip">Assistant draft</span>
            </div>

            <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="border-b border-stone-900/8 p-5 xl:border-b-0 xl:border-r xl:p-6">
                <form action={createWorkflowFromChat} className="rounded-[1.9rem] border border-stone-900/10 bg-white p-5 shadow-[var(--fh-shadow-soft)]">
                  <input
                    type="hidden"
                    name="workspaceId"
                    value={snapshot.activeWorkspace?.id ?? ""}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Task prompt</p>
                      <p className="mt-1 text-sm text-stone-500">Describe what the user wants done. FlowHolt will translate it into a draft flow.</p>
                    </div>
                    <span className="rounded-full bg-[var(--fh-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fh-accent-strong)]">
                      Plain English
                    </span>
                  </div>
                  <textarea
                    name="prompt"
                    defaultValue={prompt}
                    placeholder="Example: when a new lead arrives, research the company, summarize it, draft outreach, and log it back to the CRM."
                    rows={9}
                    className="mt-5 w-full resize-none rounded-[1.6rem] border border-stone-900/10 bg-[#fbf8f3] px-4 py-4 text-base leading-8 text-stone-700 outline-none placeholder:text-stone-400"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={!snapshot.activeWorkspace}
                      className="flowholt-primary-button px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
                    >
                      Create draft workflow
                    </button>
                    <Link
                      href="/app/workflows"
                      className="flowholt-secondary-button px-5 py-3 text-sm font-medium"
                    >
                      Open workflow library
                    </Link>
                    {!snapshot.activeWorkspace ? (
                      <Link
                        href="/app/dashboard"
                        className="flowholt-secondary-button px-5 py-3 text-sm font-medium"
                      >
                        Create workspace first
                      </Link>
                    ) : null}
                  </div>
                </form>
              </div>

              <div className="bg-[#f8f4ee] p-5 xl:p-6">
                <SurfaceCard
                  title="What happens next"
                  description="FlowHolt now keeps the creation path cleaner and more premium instead of dropping the user straight into raw config."
                  tone="sand"
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    <p>1. The assistant drafts a structured workflow from the task.</p>
                    <p>2. The draft is saved inside the active workspace.</p>
                    <p>3. Studio opens so the user can refine the flow visually.</p>
                    <p>4. Schedules, resources, runs, and revisions remain available on the side.</p>
                  </div>
                </SurfaceCard>
              </div>
            </div>
          </div>

          <SurfaceCard
            title="Starter prompts"
            description="Popular clean prompts to help users move faster without having to invent the wording themselves."
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

        <div className="space-y-5">
          <SurfaceCard
            title="Recent drafts"
            description="Existing work stays nearby so users can jump back into the editor without feeling lost."
          >
            <div className="grid gap-3">
              {snapshot.workflows.length ? (
                snapshot.workflows.slice(0, 5).map((workflow) => (
                  <Link
                    key={workflow.id}
                    href={`/app/studio/${workflow.id}`}
                    className="rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-4 transition hover:bg-stone-50"
                  >
                    <p className="text-sm font-medium text-stone-900">{workflow.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{workflow.description || "No description yet"}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-stone-900/14 bg-white/75 px-4 py-6 text-sm text-stone-500">
                  No workflows yet. Create the first one from the prompt area.
                </div>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Product direction"
            description="This page now reflects the final platform intent more closely: task first, assistant second, visual editing third."
            tone="default"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              <div className="rounded-[1.25rem] bg-white/85 px-4 py-3">No raw JSON as the primary user experience.</div>
              <div className="rounded-[1.25rem] bg-white/85 px-4 py-3">Assistant reasoning remains visible but secondary to the task goal.</div>
              <div className="rounded-[1.25rem] bg-white/85 px-4 py-3">The flow is still editable with schedules, resources, and runs nearby.</div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
