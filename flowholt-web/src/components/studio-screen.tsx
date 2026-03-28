"use client";

import { ReactNode, useState } from "react";

import { StudioSidebarTabs } from "@/components/studio-sidebar-tabs";
import { StudioWorkspaceShell } from "@/components/studio-workspace-shell";

type StudioCenterMode = "create" | "canvas" | "runs" | "integrations" | "settings";
type StudioRightTab = "assistant" | "workflow" | "models" | "resources";

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
  initialRightOpen?: boolean;
  workflowName: string;
};

const centerTabs: Array<{ key: StudioCenterMode; section: string; label: string }> = [
  { key: "create", section: "Create", label: "Create new" },
  { key: "canvas", section: "Create", label: "Canvas editor" },
  { key: "runs", section: "Monitor", label: "Runs" },
  { key: "integrations", section: "Config", label: "Integrations" },
  { key: "settings", section: "Config", label: "Settings" },
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
  initialRightTab = "assistant",
  initialRightOpen = true,
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
    <div className="px-4 py-4">
      <div className="border-b border-black/6 pb-4">
        <p className="text-sm font-medium text-stone-900">Studio</p>
        <p className="mt-1 text-xs text-stone-500">{workflowName}</p>
      </div>

      {["Create", "Monitor", "Config"].map((section) => (
        <div key={section} className="pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">{section}</p>
          <div className="mt-2 space-y-1">
            {centerTabs
              .filter((item) => item.section === section)
              .map((item) => {
                const active = activeMode === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveMode(item.key)}
                    className={`block w-full rounded-[12px] px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "border-r-2 border-[#ea6f49] bg-[#fff3ef] font-medium text-[#ea6f49]"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    {item.label}
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
      initialRightOpen={initialRightOpen}
      canvas={centerContent}
      rightPanel={
        <StudioSidebarTabs
          initialTab={initialRightTab}
          assistant={assistantSidebar}
          workflow={workflowSidebar}
          models={modelsSidebar}
          resources={resourcesSidebar}
        />
      }
    />
  );
}