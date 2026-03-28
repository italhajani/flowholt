"use client";

import { ReactNode, useState } from "react";

import {
  IconIntegrations,
  IconPlus,
  IconRuns,
  IconSettings,
  IconStudio,
} from "@/components/icons";
import { StudioSidebarTabs } from "@/components/studio-sidebar-tabs";
import { StudioWorkspaceShell } from "@/components/studio-workspace-shell";

type StudioCenterMode = "create" | "canvas" | "runs" | "integrations" | "settings";
type StudioRightTab = "workflow" | "models" | "resources";
type RightMode = "tools" | "chat" | null;

type StudioScreenProps = {
  header: ReactNode;
  leftRail: ReactNode;
  createContent: ReactNode;
  canvasContent: ReactNode;
  runsContent: ReactNode;
  integrationsContent: ReactNode;
  settingsContent: ReactNode;
  assistantSidebar: ReactNode;
  workflowSidebar: ReactNode;
  modelsSidebar: ReactNode;
  resourcesSidebar: ReactNode;
  initialMode?: StudioCenterMode;
  initialRightTab?: StudioRightTab;
  initialRightMode?: RightMode;
  workflowName: string;
};

const centerTabs: Array<{
  key: StudioCenterMode;
  section: string;
  label: string;
  icon: typeof IconPlus;
}> = [
  { key: "create", section: "Create", label: "Create new", icon: IconPlus },
  { key: "canvas", section: "Create", label: "Canvas editor", icon: IconStudio },
  { key: "runs", section: "Monitor", label: "Runs", icon: IconRuns },
  { key: "integrations", section: "Config", label: "Integrations", icon: IconIntegrations },
  { key: "settings", section: "Config", label: "Settings", icon: IconSettings },
];

export function StudioScreen({
  header,
  leftRail,
  createContent,
  canvasContent,
  runsContent,
  integrationsContent,
  settingsContent,
  assistantSidebar,
  workflowSidebar,
  modelsSidebar,
  resourcesSidebar,
  initialMode = "canvas",
  initialRightTab = "workflow",
  initialRightMode = null,
  workflowName,
}: StudioScreenProps) {
  const [activeMode, setActiveMode] = useState<StudioCenterMode>(initialMode);

  const centerContent =
    activeMode === "create"
      ? createContent
      : activeMode === "canvas"
        ? canvasContent
        : activeMode === "runs"
          ? runsContent
          : activeMode === "integrations"
            ? integrationsContent
            : settingsContent;

  const leftPanel = (
    <div className="px-3 py-3">
      <div className="border-b border-black/8 pb-3">
        <p className="text-sm font-medium text-stone-900">Studio</p>
        <p className="mt-1 truncate text-xs text-stone-500">{workflowName}</p>
      </div>

      {["Create", "Monitor", "Config"].map((section) => (
        <div key={section} className="pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">{section}</p>
          <div className="mt-2 space-y-1">
            {centerTabs
              .filter((item) => item.section === section)
              .map((item) => {
                const active = activeMode === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveMode(item.key)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-smooth ${
                      active
                        ? "border-r-2 border-[#ef6a3a] bg-[#fff5f1] font-medium text-[#ef6a3a]"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <StudioWorkspaceShell
      header={header}
      leftRail={leftRail}
      leftPanel={leftPanel}
      initialLeftOpen={false}
      initialRightMode={initialRightMode}
      canvas={centerContent}
      chatPanel={assistantSidebar}
      toolsPanel={
        <StudioSidebarTabs
          initialTab={initialRightTab}
          workflow={workflowSidebar}
          models={modelsSidebar}
          resources={resourcesSidebar}
        />
      }
    />
  );
}
