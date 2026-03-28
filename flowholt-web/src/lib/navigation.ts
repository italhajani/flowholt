export type AppNavItem = {
  label: string;
  href: string;
  description: string;
  section: "build" | "resources" | "utility";
};

export const appNavigation: AppNavItem[] = [
  {
    label: "Workflows",
    href: "/app/workflows",
    description: "All flows",
    section: "build",
  },
  {
    label: "Studio",
    href: "/app/studio/demo-workflow",
    description: "Editor",
    section: "build",
  },
  {
    label: "Agents",
    href: "/app/agents",
    description: "Library",
    section: "build",
  },
  {
    label: "Runs",
    href: "/app/runs",
    description: "History",
    section: "build",
  },
  {
    label: "Integrations",
    href: "/app/integrations",
    description: "Connections",
    section: "resources",
  },
  {
    label: "Data",
    href: "/app/data",
    description: "Resources",
    section: "resources",
  },
  {
    label: "Settings",
    href: "/app/settings",
    description: "Workspace",
    section: "utility",
  },
];