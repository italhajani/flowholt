"use client";

import { ReactNode, useState } from "react";

type SidebarTab = "assistant" | "workflow" | "resources";

type StudioSidebarTabsProps = {
  assistant: ReactNode;
  workflow: ReactNode;
  resources: ReactNode;
  initialTab?: SidebarTab;
};

const tabLabels: Record<SidebarTab, string> = {
  assistant: "Assist",
  workflow: "Workflow",
  resources: "Resources",
};

export function StudioSidebarTabs({
  assistant,
  workflow,
  resources,
  initialTab = "assistant",
}: StudioSidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>(initialTab);

  const content = activeTab === "assistant" ? assistant : activeTab === "workflow" ? workflow : resources;

  return (
    <aside className="flex min-h-0 flex-col bg-[#fbfbfa]">
      <div className="border-b border-black/6 px-4 py-4">
        <p className="text-sm font-semibold text-stone-900">Right sidebar</p>
        <p className="mt-1 text-xs text-stone-500">Chat, workflow details, and resources stay in one place.</p>
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