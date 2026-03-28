"use client";

import { ReactNode, useState } from "react";

import {
  IconMessage,
  IconStudio,
  IconTool,
  IconWorkflows,
} from "@/components/icons";

type SidebarTab = "assistant" | "workflow" | "models" | "resources";

type StudioSidebarTabsProps = {
  assistant: ReactNode;
  workflow: ReactNode;
  models: ReactNode;
  resources: ReactNode;
  initialTab?: SidebarTab;
};

const tabs: Array<{ key: SidebarTab; label: string; icon: typeof IconMessage }> = [
  { key: "assistant", label: "Assist", icon: IconMessage },
  { key: "workflow", label: "Workflow", icon: IconWorkflows },
  { key: "models", label: "Models", icon: IconStudio },
  { key: "resources", label: "Resources", icon: IconTool },
];

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
    <aside className="flex h-full min-h-0 flex-col bg-[#fbfaf7]">
      <div className="shrink-0 border-b border-black/8 px-2 py-2">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium transition-smooth ${
                  active ? "bg-white text-[#ef6a3a] shadow-[0_2px_8px_rgba(15,23,42,0.04)]" : "text-stone-500 hover:bg-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-2 py-2">{content}</div>
    </aside>
  );
}


