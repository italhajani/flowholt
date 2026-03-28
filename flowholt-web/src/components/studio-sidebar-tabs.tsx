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
    <aside className="studio-sidepanel">
      <div className="studio-sidepanel-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              data-active={active}
              className="studio-sidepanel-tab"
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <div className="ml-auto pb-[11px] text-stone-400">
          <IconChevronDown className="h-4 w-4" />
        </div>
      </div>

      <div className="studio-sidepanel-scroll">
        <div className="studio-sidepanel-content">{content}</div>
      </div>
    </aside>
  );
}
