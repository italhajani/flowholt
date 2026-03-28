"use client";

import { ReactNode, useState } from "react";

type SidebarTab = "assistant" | "workflow" | "models" | "resources";

type StudioSidebarTabsProps = {
  assistant: ReactNode;
  workflow: ReactNode;
  models: ReactNode;
  resources: ReactNode;
  initialTab?: SidebarTab;
};

const tabLabels: Record<SidebarTab, string> = {
  assistant: "Assist",
  workflow: "Workflow",
  models: "Models",
  resources: "Resources",
};

export function StudioSidebarTabs({
  assistant,
  workflow,
  models,
  resources,
  initialTab = "assistant",
}: StudioSidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>(initialTab);

  const content =
    activeTab === "assistant"
      ? assistant
      : activeTab === "workflow"
        ? workflow
        : activeTab === "models"
          ? models
          : resources;

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[#fbfbfa]">
      <div className="shrink-0 border-b border-black/6 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.14em] text-stone-400">
            <span className="font-semibold text-[#ea6f49]">{tabLabels[activeTab]}</span>
          </div>
          <div className="flex gap-1">
            {(["assistant", "workflow", "models", "resources"] as SidebarTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-[8px] px-2 py-1 text-xs font-medium transition ${
                  activeTab === tab ? "bg-white text-[#ea6f49] shadow-sm" : "text-stone-500 hover:bg-white"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-2 py-2">{content}</div>
    </aside>
  );
}
