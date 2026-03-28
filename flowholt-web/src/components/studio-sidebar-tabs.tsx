"use client";

import { ReactNode, useState } from "react";

type StudioSidebarTabsProps = {
  assistant: ReactNode;
  workflow: ReactNode;
  resources: ReactNode;
};

type SidebarTab = "assistant" | "workflow" | "resources";

const tabLabels: Record<SidebarTab, string> = {
  assistant: "Assist",
  workflow: "Workflow",
  resources: "Resources",
};

export function StudioSidebarTabs({ assistant, workflow, resources }: StudioSidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("assistant");

  const content =
    activeTab === "assistant" ? assistant : activeTab === "workflow" ? workflow : resources;

  return (
    <aside className="flex min-h-0 flex-col border-l border-black/6 bg-[#fbfbfa]">
      <div className="border-b border-black/6 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">Workspace panel</p>
            <p className="mt-1 text-xs text-stone-500">Chat, config, and resources stay close to the canvas.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {(["assistant", "workflow", "resources"] as SidebarTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-[12px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                activeTab === tab
                  ? "bg-stone-900 text-white"
                  : "border border-black/8 bg-white text-stone-500 hover:bg-[#f7f7f5]"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{content}</div>
    </aside>
  );
}