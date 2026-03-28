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
  if (href === "/app/studio/demo-workflow") {
    return pathname.startsWith("/app/studio/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ title, eyebrow, description, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#151515]">
      <div className="mx-auto flex min-h-screen max-w-[1560px] gap-5 px-4 py-4">
        <aside className="hidden w-[228px] shrink-0 flex-col rounded-[28px] border border-black/6 bg-white px-4 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] lg:flex">
          <Link href="/app/workflows" className="px-2 pb-5">
            <p className="text-sm font-semibold text-stone-900">FlowHolt</p>
            <p className="mt-1 text-xs text-stone-500">Workspace</p>
          </Link>

          <nav className="space-y-1">
            {appNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-[16px] px-4 py-3 text-sm transition ${
                    active
                      ? "bg-[#f2efff] text-stone-950"
                      : "text-stone-600 hover:bg-[#f7f7f5] hover:text-stone-950"
                  }`}
                >
                  <p className="font-medium">{item.label}</p>
                  <p className={`mt-1 text-xs ${active ? "text-stone-500" : "text-stone-400"}`}>{item.description}</p>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 pt-5">
            <div className="rounded-[20px] border border-black/6 bg-[#faf8ff] px-4 py-4">
              <div className="flex items-center justify-between gap-3 text-xs text-stone-500">
                <span>Free plan</span>
                <span>15 / 30 MIN</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                Unlock premium workspace controls and faster assistants when you are ready.
              </p>
              <button type="button" className="mt-4 w-full rounded-full bg-[#7c68f5] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6d58ef]">
                Upgrade now
              </button>
            </div>

            <div className="rounded-[20px] border border-black/6 bg-[#fbfbfa] px-4 py-3">
              <p className="text-sm font-medium text-stone-900">Workspace owner</p>
              <p className="mt-1 text-xs text-stone-500">flowholt.local</p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col rounded-[32px] border border-black/6 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
          <header className="border-b border-black/6 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">{eyebrow}</p>
                <h1 className="mt-1 text-[1.6rem] font-semibold tracking-tight text-stone-950">{title}</h1>
                <p className="mt-1 text-sm text-stone-500">{description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex min-w-[220px] items-center gap-2 rounded-full border border-black/8 bg-[#fafafa] px-4 py-2.5 text-sm text-stone-500">
                  <span>Search</span>
                </div>
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-black/8 bg-white text-sm text-stone-600 transition hover:bg-[#f7f7f5]">
                  +
                </button>
                <Link href="/app/create" className="rounded-full bg-[#ff7a59] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#f26d4a]">
                  Create Flow
                </Link>
              </div>
            </div>
          </header>

          <div className="border-b border-black/6 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {appNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      active ? "bg-[#f2efff] text-[#6f5bf3]" : "bg-[#f7f7f5] text-stone-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}