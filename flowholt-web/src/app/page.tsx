import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const workflowHighlights = [
  "Chat-first workflow drafts",
  "Premium visual editor",
  "Schedules, runs, and revisions",
  "Resources-aware assistant",
];

const featureColumns = [
  {
    title: "Capture the task",
    text: "Users arrive with one annoying task, describe it in plain language, and FlowHolt starts shaping a usable automation draft.",
  },
  {
    title: "Refine the flow",
    text: "The Studio stays visual and calm: graph on canvas, assistant reasoning nearby, and resources on the side instead of raw JSON overload.",
  },
  {
    title: "Run the work",
    text: "Schedules, background jobs, runs, revisions, billing foundations, and workspace controls are already wired under the cleaner surface.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/app/dashboard" : "/signup";
  const primaryLabel = user ? "Open workspace" : "Get started";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#faf7f1_0%,#f4efe7_100%)] text-stone-950">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(239,116,72,0.18),transparent_42%)]" />
      <div className="absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-[rgba(239,116,72,0.10)] blur-3xl" />
      <div className="absolute left-[-10rem] top-64 h-80 w-80 rounded-full bg-[rgba(67,94,82,0.08)] blur-3xl" />

      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-6 pb-12 pt-6 md:px-10">
        <header className="flowholt-window flex items-center justify-between px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">FlowHolt</p>
            <p className="mt-1 text-sm text-stone-600">Premium AI workflow platform for work people hate doing manually.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/login" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
              Log in
            </Link>
            <Link href={primaryHref} className="flowholt-primary-button px-4 py-2 text-sm font-medium">
              {primaryLabel}
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-10 xl:grid-cols-[1.02fr_1.08fr] xl:items-center">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              <span className="flowholt-chip">Calm UI</span>
              <span className="flowholt-chip">Agent-first workflows</span>
              <span className="flowholt-chip">Studio, runs, schedules</span>
            </div>

            <div className="space-y-5">
              <h1 className="flowholt-display max-w-4xl text-[3.6rem] leading-[0.94] text-stone-950 sm:text-[4.7rem] lg:text-[5.5rem]">
                Build a workflow platform that feels refined, clean, and obvious to use.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
                Users describe a messy task. FlowHolt drafts the graph, opens a premium editor, keeps assistant reasoning in view, and turns raw automation complexity into something people can actually understand.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={primaryHref} className="flowholt-primary-button px-6 py-3 text-sm font-medium">
                {primaryLabel}
              </Link>
              <Link href="/login" className="flowholt-secondary-button px-6 py-3 text-sm font-medium">
                Log in
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {workflowHighlights.map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-stone-900/10 bg-white/74 px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                  <p className="text-sm font-medium text-stone-900">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flowholt-window overflow-hidden">
            <div className="flowholt-window-bar">
              <div className="flowholt-window-dots">
                <span className="bg-[#fb7185]" />
                <span className="bg-[#f59e0b]" />
                <span className="bg-[#34d399]" />
              </div>
              <div className="rounded-full border border-stone-900/8 bg-white/78 px-4 py-2 text-xs font-medium text-stone-500">
                app.flowholt.com/studio
              </div>
              <div className="hidden sm:flex sm:gap-2">
                <span className="flowholt-chip">Editor</span>
                <span className="flowholt-chip">Resources</span>
              </div>
            </div>

            <div className="grid gap-0 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
              <div className="border-b border-stone-900/8 bg-[#f7f3ed] p-5 xl:border-b-0 xl:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Task brief</p>
                <div className="mt-4 rounded-[1.4rem] border border-stone-900/8 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                  <p className="text-sm font-medium text-stone-900">Social media campaign automation</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Research ideas, generate assets, create captions, and publish on schedule with one assistant-led workflow.
                  </p>
                </div>
                <div className="mt-4 rounded-[1.4rem] border border-stone-900/8 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Assistant</p>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    &quot;I&#39;ll draft a strategist, content agent, analytics step, and publishing branch.&quot;
                  </p>
                </div>
              </div>

              <div className="flowholt-grid-dots bg-[#fcfaf7] p-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr]">
                  {[
                    { title: "New lead", tone: "bg-[#fff1ea]" },
                    { title: "Research", tone: "bg-white" },
                    { title: "Summarize", tone: "bg-white" },
                    { title: "Create output", tone: "bg-[#eef5ef]" },
                  ].map((card) => (
                    <div key={card.title} className={`rounded-[1.6rem] border border-stone-900/10 ${card.tone} px-4 py-4 shadow-[var(--fh-shadow-soft)]`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                          Step
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-stone-400">FlowHolt</span>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-stone-900">{card.title}</p>
                      <p className="mt-2 text-xs leading-5 text-stone-600">
                        Human-friendly step editing with prompts, tools, connections, and readable outputs.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-900/8 bg-[#f7f3ed] p-5 xl:border-l xl:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Resources</p>
                <div className="mt-4 space-y-3">
                  {featureColumns.map((column) => (
                    <div key={column.title} className="rounded-[1.4rem] border border-stone-900/8 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                      <p className="text-sm font-semibold text-stone-900">{column.title}</p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{column.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

