"use client";

import { ReactNode, useState } from "react";

import {
  IconChevronLeft,
  IconChevronRight,
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
  initialLeftOpen = true,
  initialRightMode = null,
}: StudioWorkspaceShellProps) {
  const [leftOpen, setLeftOpen] = useState(initialLeftOpen);
  const [rightMode, setRightMode] = useState<RightMode>(initialRightMode);

  const rightPanel = rightMode === "chat" ? chatPanel : rightMode === "tools" ? toolsPanel : null;

  return (
    <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-[#e8e7e4] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      <header className="flex h-[52px] shrink-0 items-center border-b border-[#e8e7e4] bg-white pr-4">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border-r border-[#e8e7e4]">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#d4500a] text-[11px] font-semibold text-white">
            FH
          </div>
        </div>
        <div className="min-w-0 flex-1">{header}</div>
        <div className="ml-3 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setLeftOpen((value) => !value)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#e8e7e4] bg-white text-[#6b6760] transition-smooth hover:bg-[#f7f7f6]"
            aria-label={leftOpen ? "Collapse left sidebar" : "Expand left sidebar"}
          >
            {leftOpen ? <IconChevronLeft className="h-4 w-4" /> : <IconPanelLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setRightMode((value) => (value === "tools" ? null : "tools"))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#e8e7e4] bg-white text-[#6b6760] transition-smooth hover:bg-[#f7f7f6]"
            aria-label="Toggle tools sidebar"
          >
            {rightMode === "tools" ? <IconChevronRight className="h-4 w-4" /> : <IconPanelRight className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#f7f7f6]">
        <div className="hidden w-[52px] shrink-0 border-r border-[#e8e7e4] bg-white lg:block">{leftRail}</div>
        <div
          className={`hidden shrink-0 overflow-hidden border-r border-[#e8e7e4] bg-white transition-smooth lg:block ${
            leftOpen ? "w-[200px] opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="h-full min-h-0 overflow-y-auto">{leftPanel}</div>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">{canvas}</div>
        <div
          className={`shrink-0 overflow-hidden border-l border-[#e8e7e4] bg-white transition-smooth ${
            rightMode ? "w-full opacity-100 lg:w-[300px]" : "w-0 border-l-0 opacity-0"
          }`}
        >
          <div className="h-full min-h-0 overflow-hidden">{rightPanel}</div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setRightMode((value) => (value === "chat" ? null : "chat"))}
          className={`inline-flex h-[30px] w-[30px] items-center justify-center rounded-[5px] border border-[#e8e7e4] shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-smooth ${
            rightMode === "chat" ? "bg-[#1a1917] text-white" : "bg-white text-[#6b6760] hover:bg-[#f7f7f6]"
          }`}
          aria-label="Open chat sidebar"
        >
          <IconMessage className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
