"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { appIconMap, IconHelp, IconPlus, IconSearch, IconSettings } from "@/components/icons";
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
    <div className="min-h-screen bg-[#f3f3f1] text-[#171717]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 px-3 py-3">
        <aside className="hidden w-[214px] shrink-0 border border-black/8 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.04)] lg:flex lg:flex-col">
          <div className="border-b border-black/8 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-[#ef6a3a] text-xs font-semibold text-white">FH</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">FlowHolt</p>
                <p className="truncate text-xs text-stone-500">Talha workspace</p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-3 py-4">
            {groupedNavigation.map((group) => (
              <div key={group.sectionKey} className="mb-5 last:mb-0">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  {group.sectionLabel}
                </p>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = appIconMap[item.icon];
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-smooth ${
                          active
                            ? "bg-[#fff5f1] text-[#ef6a3a]"
                            : "text-stone-600 hover:bg-[#f7f6f3] hover:text-stone-950"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                        {item.label === "Runs" ? (
                          <span className="ml-auto bg-[#f6f5f2] px-2 py-0.5 text-[10px] font-semibold text-stone-500">14</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-black/8 px-3 py-3">
            <Link href="/app/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-stone-600 transition-smooth hover:bg-[#f7f6f3]">
              <IconHelp className="h-4 w-4" />
              <span>Help & docs</span>
            </Link>
            <Link href="/app/settings" className="mt-1 flex items-center gap-3 px-3 py-2 text-sm text-stone-600 transition-smooth hover:bg-[#f7f6f3]">
              <IconSettings className="h-4 w-4" />
              <span>Settings</span>
            </Link>

            <div className="mt-4 border border-[#f4c5b4] bg-[#fff8f4] px-4 py-4">
              <div className="flex items-center justify-between gap-3 text-xs text-[#d86840]">
                <span>Free</span>
                <span>15 / 30 min</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-500">Faster models and workspace controls.</p>
              <button type="button" className="mt-3 w-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-900 transition-smooth hover:bg-[#f7f6f3]">
                Upgrade now
              </button>
            </div>

            <div className="mt-4 border border-black/8 bg-[#fbfaf7] px-4 py-3">
              <p className="text-sm font-medium text-stone-900">flowholt.local</p>
              <p className="mt-1 text-xs text-stone-500">Owner - Free</p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col border border-black/8 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
          <header className="border-b border-black/8 px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">{eyebrow}</p>
                <h1 className="mt-1 text-[1.85rem] font-semibold tracking-[-0.03em] text-stone-950">{title}</h1>
                <p className="mt-1 text-sm text-stone-500">{description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex min-w-[240px] items-center gap-2 border border-black/8 bg-[#faf9f7] px-3 py-2.5 text-sm text-stone-500">
                  <IconSearch className="h-4 w-4 text-stone-400" />
                  <span>Search workflows...</span>
                </div>
                <Link href="/app/create" className="inline-flex items-center gap-2 border border-black/8 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition-smooth hover:bg-[#f7f6f3]">
                  <IconPlus className="h-4 w-4" />
                  <span>New Workflow</span>
                </Link>
              </div>
            </div>
          </header>

          <div className="border-b border-black/8 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {appNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = appIconMap[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 border px-3 py-2 text-sm ${
                      active
                        ? "border-[#ffd2c2] bg-[#fff5f1] text-[#ef6a3a]"
                        : "border-black/8 bg-white text-stone-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="min-w-0 flex-1 p-4 sm:p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
