export type AppNavItem = {
  label: string;
  href: string;
  description: string;
};

export const appNavigation: AppNavItem[] = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
    description: "Overview, usage, and recent activity",
  },
  {
    label: "Orchestrator",
    href: "/app/orchestrator",
    description: "Chat-first workflow generation",
  },
  {
    label: "Studio",
    href: "/app/studio/demo-workflow",
    description: "Graph editor and execution workspace",
  },
  {
    label: "Workflows",
    href: "/app/workflows",
    description: "Drafts, templates, schedules",
  },
  {
    label: "Agents",
    href: "/app/agents",
    description: "Roles, prompts, and memory profiles",
  },
  {
    label: "Integrations",
    href: "/app/integrations",
    description: "Apps, keys, webhooks",
  },
  {
    label: "Runs",
    href: "/app/runs",
    description: "Execution history and logs",
  },
  {
    label: "Data",
    href: "/app/data",
    description: "Knowledge assets and files",
  },
  {
    label: "Settings",
    href: "/app/settings",
    description: "Workspace, billing, API config",
  },
];
