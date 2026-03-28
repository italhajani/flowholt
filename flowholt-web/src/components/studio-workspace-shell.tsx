"use client";

import { ReactNode, useState } from "react";

import {
  IconChevronLeft,
  IconMessage,
  IconPanelLeft,
  IconPanelRight,
} from "@/components/icons";

type RightMode = "tools" | "chat" | null;

type StudioWorkspaceShellProps = {
  header: ReactNode;
  leftRail: ReactNode;
  leftPanel: ReactNode;
  canvas: ReactNode;
  toolsPanel: ReactNode;
  chatPanel: ReactNode;
  initialLeftOpen?: boolean;
  initialRightMode?: RightMode;
};

export function StudioWorkspaceShell({
  header,
  leftRail,
  leftPanel,
  canvas,
  toolsPanel,
  chatPanel,
  initialLeftOpen = false,
  initialRightMode = null,
}: StudioWorkspaceShellProps) {
  const [leftOpen, setLeftOpen] = useState(initialLeftOpen);
  const [rightMode, setRightMode] = useState<RightMode>(initialRightMode);

  const rightPanel = rightMode === "chat" ? chatPanel : rightMode === "tools" ? toolsPanel : null;

  return (
    <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-black/8 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
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
              onClick={() => setRightMode((value) => (value === "tools" ? null : "tools"))}
              className="inline-flex h-9 w-9 items-center justify-center border border-black/8 bg-white text-stone-600 transition-smooth hover:bg-[#f7f6f3]"
              aria-label="Toggle tools sidebar"
            >
              <IconPanelRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#f3f3f1]">
        <div className="hidden w-[54px] shrink-0 border-r border-black/8 bg-white lg:block">{leftRail}</div>
        <div
          className={`hidden shrink-0 overflow-hidden border-r border-black/8 bg-[#fbfaf7] transition-smooth lg:block ${
            leftOpen ? "w-[176px] opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="h-full min-h-0 overflow-y-auto">{leftPanel}</div>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">{canvas}</div>
        <div
          className={`shrink-0 overflow-hidden border-l border-black/8 bg-[#fbfaf7] transition-smooth ${
            rightMode ? "w-full opacity-100 lg:w-[278px] xl:w-[286px]" : "w-0 border-l-0 opacity-0"
          }`}
        >
          <div className="h-full min-h-0 overflow-hidden">{rightPanel}</div>
        </div>
      </div>

      <div className="absolute bottom-16 right-4 z-30 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setRightMode((value) => (value === "chat" ? null : "chat"))}
          className={`inline-flex h-10 w-10 items-center justify-center border border-black/8 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition-smooth ${
            rightMode === "chat" ? "bg-stone-900 text-white" : "bg-white text-stone-700 hover:bg-[#f7f6f3]"
          }`}
          aria-label="Open chat sidebar"
        >
          <IconMessage className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
