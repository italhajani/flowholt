"use client";

import { ReactNode, useState } from "react";

import {
  IconIntegrations,
  IconPlus,
  IconRuns,
  IconSettings,
  IconStudio,
} from "@/components/icons";
import {
  StudioAssistantPanel,
  type StudioAssistantPanelProps,
} from "@/components/studio-assistant-panel";
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
  assistantSidebarProps: Omit<StudioAssistantPanelProps, "onClose">;
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
  assistantSidebarProps,
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
    <div className="h-full bg-white">
      <div className="border-b border-[#f0efec] px-[14px] pb-[10px] pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a09d97]">Studio</p>
        <p className="mt-2 truncate text-[12px] text-[#6b6760]">{workflowName}</p>
      </div>

      {(["Create", "Monitor", "Config"] as const).map((section) => (
        <div key={section}>
          <p className="px-[14px] pb-[6px] pt-[14px] text-[9.5px] font-semibold uppercase tracking-[0.07em] text-[#a09d97]">{section}</p>
          <div>
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
                    className={`relative flex w-full items-center gap-[9px] px-[14px] py-[7px] text-left text-[12.5px] transition-smooth ${
                      active
                        ? "bg-[#fef3ed] text-[#d4500a]"
                        : "text-[#6b6760] hover:bg-[#f7f7f6]"
                    }`}
                  >
                    {active ? <span className="absolute left-0 top-0 h-full w-[2px] bg-[#d4500a]" /> : null}
                    <Icon className="h-[14px] w-[14px] shrink-0" />
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
      initialLeftOpen={true}
      initialRightMode={initialRightMode}
      canvas={centerContent}
      renderChatPanel={({ close }) => <StudioAssistantPanel {...assistantSidebarProps} onClose={close} />}
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
