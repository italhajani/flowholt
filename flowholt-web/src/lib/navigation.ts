export type AppNavItem = {
  label: string;
  href: string;
  description: string;
};

export const appNavigation: AppNavItem[] = [
  {
    label: "Workflows",
    href: "/app/workflows",
    description: "All flows",
  },
  {
    label: "Studio",
    href: "/app/studio/demo-workflow",
    description: "Editor",
  },
  {
    label: "Create Flow",
    href: "/app/create",
    description: "New",
  },
  {
    label: "Runs",
    href: "/app/runs",
    description: "History",
  },
  {
    label: "Integrations",
    href: "/app/integrations",
    description: "Connections",
  },
  {
    label: "Agents",
    href: "/app/agents",
    description: "Library",
  },
  {
    label: "Data",
    href: "/app/data",
    description: "Resources",
  },
  {
    label: "Settings",
    href: "/app/settings",
    description: "Workspace",
  },
];