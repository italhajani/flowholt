import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { getWorkflowLibrarySnapshot } from "@/lib/flowholt/data";

const starterIdeas = [
  "Summarize customer support tickets every morning",
  "Score new inbound leads and update the CRM",
  "Turn form submissions into personalized outreach drafts",
];

export default async function CreatePage() {
  const snapshot = await getWorkflowLibrarySnapshot();

  return (
    <AppShell
      eyebrow="Create"
      title="Describe the task you want to automate"
      description="This page will become the main AI chat entry point for FlowHolt. For now it gives users the right starting feel, simple language, and a clean path into saved workflows and the Studio."
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-5">
          <SurfaceCard
            title="Start with a task"
            description="Keep the language simple and user-level. The system should feel like a helpful chat, not a technical console."
          >
            <div className="rounded-[2rem] border border-[#d9cfc1] bg-[#fbf7f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <textarea
                disabled
                placeholder="Describe the task you want FlowHolt to build for you..."
                rows={7}
                className="w-full resize-none bg-transparent text-base leading-8 text-stone-700 outline-none placeholder:text-stone-400"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm text-stone-500">
                  AI chat builder is the next build step
                </div>
                <Link
                  href="/app/workflows"
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                >
                  Open workflows
                </Link>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Popular ideas"
            description="These prompt chips will later feed the chat builder and help new users start faster."
            tone="mint"
          >
            <div className="flex flex-wrap gap-3">
              {starterIdeas.map((idea) => (
                <div
                  key={idea}
                  className="rounded-full border border-stone-900/10 bg-white px-4 py-3 text-sm text-stone-700"
                >
                  {idea}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-5">
          <SurfaceCard
            title="How it should feel"
            description="The product language should stay plain, short, and user-friendly."
            tone="sand"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              <p>Use words like Chat, Create, Run, and Save.</p>
              <p>Avoid technical labels like orchestrator in user-facing UI.</p>
              <p>Keep the visual style clean, modern, and calm.</p>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Recent workflows"
            description="Existing work should stay close to the create surface, just like the best workflow tools do."
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
                  No workflows yet. Create one from the library or dashboard.
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
