import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const previewRows = [
  { name: "Lead intake", type: "Automation", created: "18 Mar, 2026", status: "Enabled" },
  { name: "Customer support", type: "Outbound", created: "21 Mar, 2026", status: "Enabled" },
  { name: "Appointment follow-up", type: "Automation", created: "24 Mar, 2026", status: "Disabled" },
  { name: "Content approval", type: "Automation", created: "26 Mar, 2026", status: "Enabled" },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/app/workflows" : "/signup";
  const primaryLabel = user ? "Open workspace" : "Get started";

  return (
    <main className="min-h-screen bg-[#f4f4f2] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col px-5 py-5">
        <header className="flex items-center justify-between rounded-[28px] border border-black/6 bg-white px-6 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#7c68f5] text-sm font-semibold text-white">
              FH
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-950">FlowHolt</p>
              <p className="text-xs text-stone-500">AI workflow workspace</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
              Log in
            </Link>
            <Link href={primaryHref} className="flowholt-primary-button px-4 py-2 text-sm font-medium">
              {primaryLabel}
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-8 xl:grid-cols-[0.78fr_1.22fr] xl:items-center">
          <div className="space-y-6 px-2">
            <span className="flowholt-chip">Clean workflow building</span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold tracking-[-0.05em] text-stone-950 sm:text-6xl">
                Build AI workflows without exposing the messy parts.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-stone-600">
                Users describe the annoying task, FlowHolt drafts the flow, and the workspace keeps everything readable, calm, and visual.
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
              {[
                "Describe the task in plain language",
                "Open a clean workflow canvas",
                "Keep chat, resources, and config close by",
                "Run, schedule, and refine from one place",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-black/6 bg-white px-4 py-4 text-sm text-stone-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flowholt-window overflow-hidden">
            <div className="flowholt-window-bar">
              <div className="flex items-center gap-3">
                <div className="flowholt-window-dots">
                  <span className="bg-[#fb7185]" />
                  <span className="bg-[#f59e0b]" />
                  <span className="bg-[#34d399]" />
                </div>
                <span className="text-sm font-medium text-stone-500">Workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-black/8 bg-[#fafafa] px-4 py-2 text-xs text-stone-500">
                  Search
                </div>
                <div className="rounded-full bg-[#7c68f5] px-4 py-2 text-xs font-medium text-white">
                  Create Flow
                </div>
              </div>
            </div>

            <div className="grid min-h-[560px] lg:grid-cols-[220px_minmax(0,1fr)]">
              <aside className="border-r border-black/6 bg-[#fbfbfa] px-4 py-5">
                <div className="space-y-1">
                  {[
                    "Assistants",
                    "Knowledge Base",
                    "Workflow",
                    "Contacts",
                    "Integrations",
                    "Settings",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className={`flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm ${
                        index === 2 ? "bg-[#f2efff] text-[#6f5bf3]" : "text-stone-600"
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-white text-[11px] font-semibold text-stone-500">
                        {item.slice(0, 2).toUpperCase()}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="bg-[#f7f7f5] p-5">
                <div className="rounded-[22px] border border-black/6 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <div className="grid grid-cols-[minmax(0,1.8fr)_1fr_1fr_1fr] gap-4 border-b border-black/6 px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                    <span>Name</span>
                    <span>Type</span>
                    <span>Created</span>
                    <span>Status</span>
                  </div>
                  <div>
                    {previewRows.map((row) => (
                      <div key={`${row.name}-${row.created}`} className="grid grid-cols-[minmax(0,1.8fr)_1fr_1fr_1fr] gap-4 border-b border-black/6 px-5 py-4 text-sm text-stone-700 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f0ff] text-[11px] font-semibold text-[#7c68f5]">
                            AI
                          </span>
                          <span className="font-medium text-stone-900">{row.name}</span>
                        </div>
                        <span>{row.type}</span>
                        <span>{row.created}</span>
                        <span>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.status === "Enabled" ? "bg-[#e8f7ec] text-emerald-700" : "bg-[#fff0ec] text-[#e16b49]"}`}>
                            {row.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}