"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { appNavigation } from "@/lib/navigation";

type AppShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
};

const navGlyphs: Record<string, string> = {
  Dashboard: "DB",
  Monitoring: "MN",
  Create: "CR",
  Studio: "ST",
  Workflows: "WF",
  Agents: "AG",
  Integrations: "IN",
  Runs: "RN",
  Data: "DT",
  Design: "DS",
  Settings: "SE",
};

function isActivePath(pathname: string, href: string) {
  if (href === "/app/dashboard") {
    return pathname === "/app" || pathname === href;
  }

  if (href === "/app/studio/demo-workflow") {
    return pathname.startsWith("/app/studio/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  title,
  eyebrow,
  description,
  children,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flowholt-shell">
      <div className="mx-auto grid min-h-screen max-w-[1720px] lg:grid-cols-[92px_286px_minmax(0,1fr)]">
        <aside className="flowholt-sidebar hidden border-r border-white/6 px-4 py-6 lg:flex lg:flex-col lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/"
              className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/6 text-sm font-semibold tracking-[0.22em] text-white"
            >
              FH
            </Link>
            <div className="space-y-2">
              {appNavigation.slice(0, 8).map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
                      active
                        ? "border-white/14 bg-white text-stone-900 shadow-[0_8px_22px_rgba(255,255,255,0.18)]"
                        : "border-white/8 bg-white/4 text-stone-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {navGlyphs[item.label] ?? item.label.slice(0, 2).toUpperCase()}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-white/6 px-3 py-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Live</p>
            <p className="mt-2 text-sm font-medium text-white">Workspace</p>
          </div>
        </aside>

        <aside className="flowholt-sidebar hidden border-r border-white/6 px-5 py-6 lg:block">
          <div className="flowholt-sidebar-panel rounded-[1.9rem] p-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">FlowHolt studio</p>
            <h1 className="flowholt-display mt-4 text-[2rem] leading-none text-white">
              Calm automation for messy work.
            </h1>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              Describe the task, let the assistant shape the flow, then refine it in a cleaner workspace.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {appNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-[1.35rem] border px-4 py-3 transition ${
                    active
                      ? "border-white/14 bg-white text-stone-900 shadow-[0_14px_28px_rgba(255,255,255,0.12)]"
                      : "border-white/6 bg-white/4 text-white hover:border-white/12 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{item.label}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        active ? "bg-stone-900/8 text-stone-700" : "bg-white/8 text-stone-300"
                      }`}
                    >
                      {navGlyphs[item.label] ?? item.label.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <p className={`mt-1 text-xs leading-5 ${active ? "text-stone-600" : "text-stone-400"}`}>
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flowholt-topbar sticky top-0 z-20 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flowholt-chip">{eyebrow}</span>
                  <span className="flowholt-chip bg-[var(--fh-accent-soft)] text-[var(--fh-accent-strong)]">
                    Premium workspace
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/app/create"
                    className="flowholt-secondary-button px-4 py-2 text-center text-sm font-medium"
                  >
                    New workflow
                  </Link>
                  <Link
                    href="/app/studio/demo-workflow"
                    className="flowholt-primary-button px-4 py-2 text-center text-sm font-medium"
                  >
                    Open Studio
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                    Workspace
                  </p>
                  <h2 className="flowholt-display mt-3 text-[2.15rem] leading-none text-stone-950 sm:text-[2.7rem]">
                    {title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
                    {description}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[360px]">
                  <div className="rounded-[1.35rem] border border-stone-900/10 bg-white/72 px-4 py-3 shadow-[var(--fh-shadow-soft)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Space
                    </p>
                    <p className="mt-1 text-sm font-medium text-stone-900">Builder</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-stone-900/10 bg-white/72 px-4 py-3 shadow-[var(--fh-shadow-soft)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-medium text-stone-900">Live foundation</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="border-b border-stone-900/8 px-4 py-4 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {appNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`min-w-[144px] rounded-[1.2rem] border px-4 py-3 transition ${
                      active
                        ? "border-stone-900/14 bg-stone-900 text-white"
                        : "border-stone-900/10 bg-white/78 text-stone-700 hover:bg-white"
                    }`}
                  >
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className={`mt-1 text-xs leading-5 ${active ? "text-stone-200" : "text-stone-500"}`}>
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
