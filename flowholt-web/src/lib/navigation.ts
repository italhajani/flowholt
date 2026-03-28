export type AppNavItem = {
  label: string;
  href: string;
  description: string;
};

export const appNavigation: AppNavItem[] = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
    description: "Overview, activity, and quick starts",
  },
  {
    label: "Monitoring",
    href: "/app/monitoring",
    description: "Queue health, failures, and operations",
  },
  {
    label: "Create",
    href: "/app/create",
    description: "Describe your task in chat",
  },
  {
    label: "Studio",
    href: "/app/studio/demo-workflow",
    description: "Edit and run your workflow",
  },
  {
    label: "Workflows",
    href: "/app/workflows",
    description: "Saved drafts and active flows",
  },
  {
    label: "Agents",
    href: "/app/agents",
    description: "Roles, prompts, and memory",
  },
  {
    label: "Integrations",
    href: "/app/integrations",
    description: "Apps, keys, and webhooks",
  },
  {
    label: "Runs",
    href: "/app/runs",
    description: "Execution history and logs",
  },
  {
    label: "Data",
    href: "/app/data",
    description: "Files and knowledge sources",
  },
  {
    label: "Design",
    href: "/app/design",
    description: "Survey and visual direction",
  },
  {
    label: "Settings",
    href: "/app/settings",
    description: "Workspace and account settings",
  },
];

