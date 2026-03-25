import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#efe1c6_0%,#f8f2e7_38%,#f3ede2_100%)] text-stone-950">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,rgba(27,79,70,0.18),rgba(191,120,52,0.08))]" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-12 pt-8 md:px-10">
        <header className="flex items-center justify-between rounded-full border border-stone-900/10 bg-white/70 px-5 py-3 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              FlowHolt
            </p>
            <p className="text-sm text-stone-700">
              Build workflows from simple task descriptions
            </p>
          </div>
          <Link
            href="/app/dashboard"
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
          >
            Open app
          </Link>
        </header>

        <section className="grid flex-1 gap-10 py-16 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-emerald-900/15 bg-emerald-900/8 px-4 py-2 text-sm text-emerald-950">
              Chat-first workflow creation with editable studio controls
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-stone-950 md:text-7xl">
                Turn annoying work into an AI flow that can actually run.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700 md:text-xl">
                Users describe messy tasks in plain language. FlowHolt creates a workflow draft, opens it in Studio, and lets the user refine the steps before running it.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/app/create"
                className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
              >
                Create with chat
              </Link>
              <Link
                href="/app/studio/demo-workflow"
                className="rounded-full border border-stone-900/15 bg-white/80 px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-white"
              >
                Open studio
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-stone-900/10 bg-white/70 p-4 shadow-[0_20px_80px_rgba(52,47,40,0.10)] backdrop-blur">
            <div className="rounded-[1.5rem] border border-stone-900/10 bg-stone-950 p-5 text-stone-50">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                Create
              </p>
              <p className="mt-3 text-lg font-medium">
                &ldquo;Handle lead intake, enrich data, draft outreach, and log every step.&rdquo;
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-stone-900/10 bg-[#eef4ef] p-5">
                <p className="text-sm font-semibold text-stone-900">Draft workflow</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Trigger to research, CRM update, check conditions, draft messages, then send the result to Studio.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-900/10 bg-[#f7ede2] p-5">
                <p className="text-sm font-semibold text-stone-900">Studio control</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Edit prompts, change models, inspect logs, and re-run with a single click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
