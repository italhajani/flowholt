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
    <aside className="flex min-h-0 flex-col bg-[#fbfbfa]">
      <div className="border-b border-black/6 px-4 py-4">
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em] text-stone-400">
          <span className="font-semibold text-[#ea6f49]">{tabLabels[activeTab]}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["assistant", "workflow", "models", "resources"] as SidebarTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-[10px] px-3 py-2 text-xs font-medium transition ${
                activeTab === tab
                  ? "bg-white text-[#ea6f49] shadow-[0_4px_14px_rgba(15,23,42,0.04)]"
                  : "text-stone-500 hover:bg-white"
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