import { useLocation, useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { NotificationsPanel } from "@/components/ui/notifications-panel";

const domainTitles: Record<string, string> = {
  "/home":        "Home",
  "/workflows":   "Workflows",
  "/ai-agents":   "AI Agents",
  "/templates":   "Templates",
  "/executions":  "Executions",
  "/vault":       "Vault",
  "/webhooks":    "Webhooks",
  "/data":        "Data",
  "/providers":   "Providers",
  "/models":      "Models",
  "/operations":  "Operations",
  "/environment": "Environment",
  "/help":        "Help",
  "/human-tasks": "Human Tasks",
  "/chat":        "Chat",
  "/settings":    "Settings",
};

/* Detail route patterns → { parent title, parent path, entity label resolver } */
const detailRoutes: { pattern: RegExp; parent: string; parentPath: string; label: (id: string) => string }[] = [
  { pattern: /^\/workflows\/(.+)$/, parent: "Workflows", parentPath: "/workflows", label: () => "Detail" },
  { pattern: /^\/executions\/(.+)$/, parent: "Executions", parentPath: "/executions", label: (id) => `#${id}` },
  { pattern: /^\/ai-agents\/(.+)$/, parent: "AI Agents", parentPath: "/ai-agents", label: () => "Detail" },
  { pattern: /^\/providers\/(.+)$/, parent: "Providers", parentPath: "/providers", label: () => "Detail" },
  { pattern: /^\/templates\/(.+)$/, parent: "Templates", parentPath: "/templates", label: () => "Detail" },
  { pattern: /^\/vault\/credentials\/(.+)$/, parent: "Vault", parentPath: "/vault", label: () => "Credential" },
  { pattern: /^\/vault\/connections\/(.+)$/, parent: "Vault", parentPath: "/vault", label: () => "Connection" },
  { pattern: /^\/webhooks\/(.+)$/, parent: "Webhooks", parentPath: "/webhooks", label: () => "Detail" },
  { pattern: /^\/help\/api$/, parent: "Help", parentPath: "/help", label: () => "API Playground" },
];

interface Breadcrumb { label: string; path?: string }

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  for (const route of detailRoutes) {
    const match = pathname.match(route.pattern);
    if (match) {
      return [
        { label: route.parent, path: route.parentPath },
        { label: route.label(match[1]) },
      ];
    }
  }
  const keys = Object.keys(domainTitles).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (pathname.startsWith(key)) return [{ label: domainTitles[key] }];
  }
  return [{ label: "FlowHolt" }];
}

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const crumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[13px] font-medium text-zinc-400 select-none">FlowHolt</span>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight size={12} className="text-zinc-300 flex-shrink-0" />
            {crumb.path ? (
              <button
                onClick={() => navigate(crumb.path!)}
                className="text-[13px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors truncate"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-[13px] font-semibold text-zinc-800 truncate">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Right utilities */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Search pill — Claude-style */}
        <button
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] transition-all duration-150 hover:bg-zinc-100"
          style={{
            border: "1px solid var(--color-border-default)",
            color: "var(--color-fg-muted)",
            background: "var(--color-bg-surface)",
          }}
          title="Search (⌘K)"
          onClick={() => document.dispatchEvent(new CustomEvent("open-command-palette"))}
        >
          <Search size={13} strokeWidth={2} />
          <span className="hidden sm:inline">Search</span>
          <kbd
            className="hidden sm:inline-flex h-4 items-center rounded px-1 font-mono text-[10px]"
            style={{
              background: "var(--color-bg-surface-strong)",
              color: "var(--color-fg-muted)",
              border: "1px solid var(--color-border-default)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <NotificationsPanel />
      </div>
    </div>
  );
}
