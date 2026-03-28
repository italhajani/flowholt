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

function isActivePath(pathname: string, href: string) {
  if (href === "/app/dashboard") {
    return pathname === "/app" || pathname === href;
  }

  if (href === "/app/studio/demo-workflow") {
    return pathname.startsWith("/app/studio/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ title, eyebrow, description, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flowholt-shell">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flowholt-sidebar hidden border-r border-stone-900/8 px-5 py-6 lg:block">
          <Link href="/" className="block rounded-[1rem] px-2 py-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">FlowHolt</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">Workspace</p>
          </Link>

          <nav className="mt-6 space-y-1.5">
            {appNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-[1rem] px-4 py-3 transition ${
                    active
                      ? "bg-[var(--fh-accent-soft)] text-stone-950"
                      : "text-stone-700 hover:bg-white hover:text-stone-950"
                  }`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`mt-1 text-xs leading-5 ${active ? "text-stone-600" : "text-stone-500"}`}>
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
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">{eyebrow}</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">{title}</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/app/create" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                    New workflow
                  </Link>
                  <Link href="/app/studio/demo-workflow" className="flowholt-primary-button px-4 py-2 text-sm font-medium">
                    Open Studio
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <div className="border-b border-stone-900/8 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {appNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`min-w-[136px] rounded-[0.95rem] px-4 py-3 transition ${
                      active ? "bg-[var(--fh-accent-soft)] text-stone-950" : "bg-white text-stone-700"
                    }`}
                  >
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className={`mt-1 text-xs leading-5 ${active ? "text-stone-600" : "text-stone-500"}`}>{item.description}</p>
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
