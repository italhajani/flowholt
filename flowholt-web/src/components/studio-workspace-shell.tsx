"use client";

import { ReactNode, useState } from "react";

type StudioWorkspaceShellProps = {
  header: ReactNode;
  leftRail: ReactNode;
  leftPanel: ReactNode;
  canvas: ReactNode;
  rightPanel: ReactNode;
  initialRightOpen?: boolean;
};

export function StudioWorkspaceShell({
  header,
  leftRail,
  leftPanel,
  canvas,
  rightPanel,
  initialRightOpen = false,
}: StudioWorkspaceShellProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(initialRightOpen);

  return (
    <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-black/6 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
      <header className="border-b border-black/6 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">{header}</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLeftOpen((value) => !value)}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-[#f7f7f5]"
            >
              {leftOpen ? "Hide left panel" : "Show left panel"}
            </button>
            <button
              type="button"
              onClick={() => setRightOpen((value) => !value)}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-[#f7f7f5]"
            >
              {rightOpen ? "Hide chat" : "Show chat"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[76px] shrink-0 border-r border-black/6 bg-[#fbfbfa] lg:block">{leftRail}</div>
        {leftOpen ? <div className="hidden w-[230px] shrink-0 border-r border-black/6 bg-[#fbfbfa] lg:block">{leftPanel}</div> : null}
        <div className="min-w-0 flex-1">{canvas}</div>
        {rightOpen ? <div className="w-full shrink-0 border-t border-black/6 bg-[#fbfbfa] xl:w-[390px] xl:border-l xl:border-t-0">{rightPanel}</div> : null}
      </div>
    </section>
  );
}