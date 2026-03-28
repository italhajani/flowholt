"use client";

import { ReactNode, useState } from "react";

import { IconChevronLeft, IconChevronRight, IconPanelLeft, IconPanelRight } from "@/components/icons";

type StudioWorkspaceShellProps = {
  header: ReactNode;
  leftRail: ReactNode;
  leftPanel: ReactNode;
  canvas: ReactNode;
  rightPanel: ReactNode;
  initialLeftOpen?: boolean;
  initialRightOpen?: boolean;
};

export function StudioWorkspaceShell({
  header,
  leftRail,
  leftPanel,
  canvas,
  rightPanel,
  initialLeftOpen = false,
  initialRightOpen = false,
}: StudioWorkspaceShellProps) {
  const [leftOpen, setLeftOpen] = useState(initialLeftOpen);
  const [rightOpen, setRightOpen] = useState(initialRightOpen);

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-black/8 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      <header className="border-b border-black/8 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">{header}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLeftOpen((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center border border-black/8 bg-white text-stone-600 transition-smooth hover:bg-[#f7f6f3]"
              aria-label={leftOpen ? "Collapse left sidebar" : "Expand left sidebar"}
            >
              {leftOpen ? <IconChevronLeft className="h-4 w-4" /> : <IconPanelLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setRightOpen((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center border border-black/8 bg-white text-stone-600 transition-smooth hover:bg-[#f7f6f3]"
              aria-label={rightOpen ? "Collapse right sidebar" : "Expand right sidebar"}
            >
              {rightOpen ? <IconChevronRight className="h-4 w-4" /> : <IconPanelRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#f3f3f1]">
        <div className="hidden w-[54px] shrink-0 border-r border-black/8 bg-white lg:block">{leftRail}</div>
        <div
          className={`hidden shrink-0 overflow-hidden border-r border-black/8 bg-[#fbfaf7] transition-smooth lg:block ${
            leftOpen ? "w-[188px] opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="h-full min-h-0 overflow-y-auto">{leftPanel}</div>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">{canvas}</div>
        <div
          className={`shrink-0 overflow-hidden border-l border-black/8 bg-[#fbfaf7] transition-smooth ${
            rightOpen ? "w-full opacity-100 lg:w-[312px] xl:w-[320px]" : "w-0 border-l-0 opacity-0"
          }`}
        >
          <div className="h-full min-h-0 overflow-hidden">{rightPanel}</div>
        </div>
      </div>
    </section>
  );
}
