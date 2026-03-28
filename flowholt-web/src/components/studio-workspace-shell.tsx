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
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-black/6 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
      <header className="border-b border-black/6 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">{header}</div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setLeftOpen((value) => !value)}
              className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-[#f7f7f5]"
            >
              {leftOpen ? "Hide menu" : "Show menu"}
            </button>
            <button
              type="button"
              onClick={() => setRightOpen((value) => !value)}
              className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-[#f7f7f5]"
            >
              {rightOpen ? "Hide panel" : "Open panel"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        <div className="hidden w-[56px] shrink-0 border-r border-black/6 bg-white lg:block">{leftRail}</div>
        {leftOpen ? (
          <div className="hidden min-h-0 w-[180px] shrink-0 overflow-y-auto border-r border-black/6 bg-[#fbfbfa] lg:block">
            {leftPanel}
          </div>
        ) : null}
        <div className="min-w-0 flex-1 overflow-hidden bg-[#f4f4f2]">{canvas}</div>
        {rightOpen ? (
          <div className="min-h-0 w-full shrink-0 overflow-hidden border-t border-black/6 bg-[#fbfbfa] lg:w-[320px] lg:border-l lg:border-t-0 xl:w-[332px]">
            {rightPanel}
          </div>
        ) : null}
      </div>
    </section>
  );
}
