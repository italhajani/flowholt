"use client";

import { ReactNode, useState } from "react";

import {
  IconChevronLeft,
  IconMessage,
  IconPanelLeft,
  IconPanelRight,
} from "@/components/icons";

type RightMode = "tools" | null;

type StudioWorkspaceShellProps = {
  header: ReactNode;
  leftRail: ReactNode;
  leftPanel: ReactNode;
  canvas: ReactNode;
  toolsPanel: ReactNode;
  renderChatPanel: (controls: { close: () => void }) => ReactNode;
  initialLeftOpen?: boolean;
  initialRightMode?: "tools" | "chat" | null;
};

export function StudioWorkspaceShell({
  header,
  leftRail,
  leftPanel,
  canvas,
  toolsPanel,
  renderChatPanel,
  initialLeftOpen = true,
  initialRightMode = null,
}: StudioWorkspaceShellProps) {
  const [leftOpen, setLeftOpen] = useState(initialLeftOpen);
  const [rightMode, setRightMode] = useState<RightMode>(initialRightMode === "tools" ? "tools" : null);
  const [chatOpen, setChatOpen] = useState(initialRightMode === "chat");

  return (
    <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-[#e8e7e4] bg-white">
      <header className="flex h-[52px] shrink-0 items-center border-b border-[#e8e7e4] bg-white pr-4">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border-r border-[#e8e7e4]">
          <div className="flex h-7 w-7 items-center justify-center bg-[#d4500a] text-[11px] font-semibold text-white">
            FH
          </div>
        </div>
        <div className="min-w-0 flex-1">{header}</div>
        <div className="ml-3 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setLeftOpen((value) => !value)}
            className="inline-flex h-8 w-8 items-center justify-center border border-[#e8e7e4] bg-white text-[#6b6760] transition-smooth hover:bg-[#f7f7f6]"
            aria-label={leftOpen ? "Collapse left sidebar" : "Expand left sidebar"}
          >
            {leftOpen ? <IconChevronLeft className="h-4 w-4" /> : <IconPanelLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setRightMode((value) => (value === "tools" ? null : "tools"))}
            className={`inline-flex h-8 w-8 items-center justify-center border transition-smooth ${
              rightMode === "tools"
                ? "border-[#1a1917] bg-[#1a1917] text-white"
                : "border-[#e8e7e4] bg-white text-[#6b6760] hover:bg-[#f7f7f6]"
            }`}
            aria-label="Toggle tools sidebar"
          >
            <IconPanelRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[#f7f7f6]">
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
            rightMode === "tools" ? "w-full opacity-100 lg:w-[430px]" : "w-0 border-l-0 opacity-0"
          }`}
        >
          <div className="h-full min-h-0 overflow-hidden">{toolsPanel}</div>
        </div>

        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-40 flex justify-end transition-smooth ${
            chatOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
          }`}
        >
          <div className="pointer-events-auto h-full w-full max-w-[430px] border-l border-[#e8e7e4] bg-white shadow-[-20px_0_48px_rgba(15,23,42,0.08)]">
            {renderChatPanel({ close: () => setChatOpen(false) })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-[52px] right-4 z-30 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setChatOpen((value) => !value)}
          className={`inline-flex h-9 w-9 items-center justify-center border shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-smooth ${
            chatOpen ? "border-[#1a1917] bg-[#1a1917] text-white" : "border-[#e8e7e4] bg-white text-[#6b6760] hover:bg-[#f7f7f6]"
          }`}
          aria-label="Open workflow agent chat"
        >
          <IconMessage className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
