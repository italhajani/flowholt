"use client";

import { ReactNode, useState } from "react";

import { IconChevronDown, IconStudio, IconTool, IconWorkflows } from "@/components/icons";

type SidebarTab = "workflow" | "models" | "resources";

type StudioSidebarTabsProps = {
  workflow: ReactNode;
  models: ReactNode;
  resources: ReactNode;
  initialTab?: SidebarTab;
};

const tabs: Array<{ key: SidebarTab; label: string; icon: typeof IconWorkflows }> = [
  { key: "workflow", label: "Workflow", icon: IconWorkflows },
  { key: "models", label: "Models", icon: IconStudio },
  { key: "resources", label: "Resources", icon: IconTool },
];

export function StudioSidebarTabs({
  workflow,
  models,
  resources,
  initialTab = "workflow",
}: StudioSidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>(initialTab);

  const content =
    activeTab === "workflow"
      ? workflow
      : activeTab === "models"
        ? models
        : resources;

  return (
    <aside className="flex h-full min-h-0 flex-col bg-white">
      <div className="shrink-0 border-b border-black/8 px-4 pt-3">
        <div className="flex items-end gap-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative inline-flex items-center gap-2 pb-3 text-[13px] transition-smooth ${
                  active ? "font-medium text-stone-950" : "font-normal text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {active ? <span className="absolute inset-x-0 -bottom-px h-0.5 bg-stone-950" /> : null}
              </button>
            );
          })}
          <div className="ml-auto pb-3 text-stone-400">
            <IconChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full min-h-0 overflow-y-auto px-4 py-4">{content}</div>
      </div>
    </aside>
  );
}
