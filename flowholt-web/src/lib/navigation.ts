export type AppNavItem = {
  label: string;
  href: string;
  description: string;
  section: "build" | "resources" | "utility";
  icon: "workflows" | "studio" | "agents" | "runs" | "integrations" | "data" | "settings";
};

export const appNavigation: AppNavItem[] = [
  {
    label: "Workflows",
    href: "/app/workflows",
    description: "All flows",
    section: "build",
    icon: "workflows",
  },
  {
    label: "Studio",
    href: "/app/studio/demo-workflow",
    description: "Editor",
    section: "build",
    icon: "studio",
  },
  {
    label: "Agents",
    href: "/app/agents",
    description: "Library",
    section: "build",
    icon: "agents",
  },
  {
    label: "Runs",
    href: "/app/runs",
    description: "History",
    section: "build",
    icon: "runs",
  },
  {
    label: "Integrations",
    href: "/app/integrations",
    description: "Connections",
    section: "resources",
    icon: "integrations",
  },
  {
    label: "Data",
    href: "/app/data",
    description: "Resources",
    section: "resources",
    icon: "data",
  },
  {
    label: "Settings",
    href: "/app/settings",
    description: "Workspace",
    section: "utility",
    icon: "settings",
  },
];
