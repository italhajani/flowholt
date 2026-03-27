import Link from "next/link";
import { ReactNode } from "react";

import { appNavigation } from "@/lib/navigation";

type AppShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
};

export function AppShell({
  title,
  eyebrow,
  description,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f1e8] text-stone-900">
      <div className="border-b border-stone-900/10 bg-stone-950 px-4 py-5 text-stone-100 lg:hidden">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">FlowHolt</p>
          <h1 className="mt-2 text-xl font-semibold">Build work that runs itself</h1>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Describe the task, shape the workflow, then run it from one clean workspace.
          </p>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {appNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-w-[148px] rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-white/10 hover:bg-white/10"
            >
              <p className="text-sm font-medium text-stone-100">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-stone-400">{item.description}</p>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-stone-900/10 bg-stone-950 px-5 py-6 text-stone-100 lg:block">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
              FlowHolt
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Build work that runs itself</h1>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Describe the task, shape the workflow, then run it from one clean workspace.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {appNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl border border-white/5 px-4 py-3 transition hover:border-white/10 hover:bg-white/5"
              >
                <p className="text-sm font-medium text-stone-100">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-stone-400">
                  {item.description}
                </p>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-stone-900/10 bg-white/70 px-4 py-5 backdrop-blur sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              {eyebrow}
            </p>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                  {description}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start md:justify-end">
                <Link
                  href="/app/create"
                  className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-center text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  Create with chat
                </Link>
                <Link
                  href="/app/studio/demo-workflow"
                  className="rounded-full bg-stone-950 px-4 py-2 text-center text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                >
                  Open studio
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
