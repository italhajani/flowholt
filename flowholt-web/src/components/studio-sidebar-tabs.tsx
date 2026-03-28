"use client";

import { ReactNode, useState } from "react";

import { IconChevronDown, IconStudio, IconTool, IconWorkflows } from "@/components/icons";

type SidebarTab = "workflow" | "models" | "resources";

type StudioSidebarTabsProps = {
  workflow: ReactNode;
  models: ReactNode;
  resources: ReactNode;
  initialTab?: SidebarTab;
  onClose?: () => void;
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
  onClose,
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
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center text-stone-400 transition-smooth hover:bg-[#f6f5f2] hover:text-stone-700"
          aria-label="Close tools sidebar"
        >
          <IconChevronDown className="h-4 w-4 -rotate-90" />
        </button>
      </div>

      <div className="studio-sidepanel-scroll">
        <div className="studio-sidepanel-content">{content}</div>
      </div>
    </aside>
  );
}
