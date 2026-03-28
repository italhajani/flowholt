export type AppNavItem = {
  label: string;
  href: string;
  description: string;
};

export const appNavigation: AppNavItem[] = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
    description: "Overview",
  },
  {
    label: "Create",
    href: "/app/create",
    description: "New workflow",
  },
  {
    label: "Studio",
    href: "/app/studio/demo-workflow",
    description: "Editor",
  },
  {
    label: "Workflows",
    href: "/app/workflows",
    description: "Library",
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
    label: "Settings",
    href: "/app/settings",
    description: "Workspace",
  },
  {
    label: "Monitoring",
    href: "/app/monitoring",
    description: "Operations",
  },
];
