import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const featureList = [
  "Describe the task in plain language",
  "See the workflow on a visual canvas",
  "Keep assistant reasoning and resources nearby",
  "Run, schedule, and monitor from one workspace",
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/app/dashboard" : "/signup";
  const primaryLabel = user ? "Open workspace" : "Get started";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf8f4_0%,#f6f4ef_100%)] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-6 py-6 md:px-10">
        <header className="flex items-center justify-between py-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">FlowHolt</p>
            <p className="mt-1 text-sm text-stone-600">AI workflow platform</p>
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

        <section className="grid flex-1 gap-8 py-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div className="space-y-6">
            <span className="flowholt-chip">Simple workflow building</span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
                Turn annoying work into a clean, visual AI workflow.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600">
                Users tell FlowHolt what they want done. The platform drafts the flow, opens it in Studio, and keeps the workflow easy to understand.
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
              {featureList.map((item) => (
                <div key={item} className="rounded-[1rem] border border-stone-900/8 bg-white px-4 py-4 text-sm text-stone-700 shadow-[var(--fh-shadow-card)]">
                  {item}
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
              <div className="rounded-full border border-stone-900/8 bg-white px-4 py-2 text-xs font-medium text-stone-500">
                FlowHolt Studio
              </div>
            </div>

            <div className="grid gap-0 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
              <div className="border-b border-stone-900/8 bg-[#fbfaf7] p-5 xl:border-b-0 xl:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Assistant</p>
                <div className="mt-4 rounded-[1rem] border border-stone-900/8 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-stone-900">Social campaign automation</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">Research ideas, draft posts, and publish on schedule.</p>
                </div>
              </div>

              <div className="flowholt-grid-dots bg-white p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {['Trigger', 'Research', 'Summarize', 'Publish'].map((step) => (
                    <div key={step} className="rounded-[1rem] border border-stone-900/8 bg-[#fffdfa] px-4 py-4 shadow-[var(--fh-shadow-card)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Step</p>
                      <p className="mt-3 text-sm font-medium text-stone-900">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-900/8 bg-[#fbfaf7] p-5 xl:border-l xl:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Resources</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[1rem] border border-stone-900/8 bg-white px-4 py-4 text-sm text-stone-700">Task</div>
                  <div className="rounded-[1rem] border border-stone-900/8 bg-white px-4 py-4 text-sm text-stone-700">Agent</div>
                  <div className="rounded-[1rem] border border-stone-900/8 bg-white px-4 py-4 text-sm text-stone-700">Tools</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
