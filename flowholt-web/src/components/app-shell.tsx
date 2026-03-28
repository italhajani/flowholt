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

const sectionLabels = {
  build: "Build",
  resources: "Resources",
  utility: "Utility",
};

function isActivePath(pathname: string, href: string) {
  if (href === "/app/studio/demo-workflow") {
    return pathname.startsWith("/app/studio/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ title, eyebrow, description, children }: AppShellProps) {
  const pathname = usePathname();

  const groupedNavigation = Object.entries(sectionLabels).map(([sectionKey, sectionLabel]) => ({
    sectionKey,
    sectionLabel,
    items: appNavigation.filter((item) => item.section === sectionKey),
  }));

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#151515]">
      <div className="mx-auto flex min-h-screen max-w-[1560px] gap-5 px-4 py-4">
        <aside className="hidden w-[210px] shrink-0 flex-col rounded-[26px] border border-black/6 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)] lg:flex">
          <div className="border-b border-black/6 px-4 py-5">
            <p className="text-sm font-semibold text-stone-900">FlowHolt</p>
            <p className="mt-1 text-xs text-stone-500">Talha workspace</p>
          </div>

          <div className="flex-1 px-3 py-4">
            {groupedNavigation.map((group) => (
              <div key={group.sectionKey} className="mb-5 last:mb-0">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  {group.sectionLabel}
                </p>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block rounded-[14px] px-3 py-2.5 text-sm transition ${
                          active
                            ? "bg-[#fff3ef] text-[#ea6f49]"
                            : "text-stone-600 hover:bg-[#f7f7f5] hover:text-stone-950"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-black/6 px-4 py-4">
            <div className="space-y-2 text-sm text-stone-600">
              <Link href="/app/settings" className="block">Help & docs</Link>
              <Link href="/app/settings" className="block">Settings</Link>
            </div>

            <div className="mt-4 rounded-[18px] border border-[#ffc7b6] bg-[#fff8f5] px-4 py-4">
              <div className="flex items-center justify-between gap-3 text-xs text-[#db6f4d]">
                <span>Free</span>
                <span>15 / 30 min</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-500">Faster models and workspace controls</p>
              <button type="button" className="mt-3 w-full rounded-[12px] border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-900">
                Upgrade now
              </button>
            </div>

            <div className="mt-4 rounded-[16px] border border-black/6 bg-[#fbfbfa] px-4 py-3">
              <p className="text-sm font-medium text-stone-900">flowholt.local</p>
              <p className="mt-1 text-xs text-stone-500">Owner - Free</p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col rounded-[30px] border border-black/6 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
          <header className="border-b border-black/6 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">{eyebrow}</p>
                <h1 className="mt-1 text-[1.6rem] font-semibold tracking-tight text-stone-950">{title}</h1>
                <p className="mt-1 text-sm text-stone-500">{description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex min-w-[220px] items-center gap-2 rounded-[12px] border border-black/8 bg-[#fafafa] px-4 py-2.5 text-sm text-stone-500">
                  <span>Search workflows...</span>
                </div>
                <Link href="/app/create" className="rounded-[12px] border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-stone-900 transition hover:bg-[#f7f7f5]">
                  + New Workflow
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
                      active ? "bg-[#fff3ef] text-[#ea6f49]" : "bg-[#f7f7f5] text-stone-600"
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