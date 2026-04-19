import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  GitBranch,
  Bot,
  LayoutTemplate,
  MessageSquare,
  Play,
  ClipboardList,
  KeyRound,
  Webhook,
  Database,
  Plug,
  Sparkles,
  Activity,
  Globe,
  HelpCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}

const primaryNav: NavItem[] = [
  { id: "home",       label: "Home",       icon: Home,           path: "/home" },
  { id: "workflows",  label: "Workflows",  icon: GitBranch,      path: "/workflows" },
  { id: "ai-agents",  label: "AI Agents",  icon: Bot,            path: "/ai-agents" },
  { id: "templates",  label: "Templates",  icon: LayoutTemplate, path: "/templates" },
  { id: "chat",       label: "Chat",       icon: MessageSquare,  path: "/chat" },
  { id: "executions", label: "Executions", icon: Play,           path: "/executions", badge: 2 },
  { id: "human-tasks",label: "Tasks",      icon: ClipboardList,  path: "/human-tasks", badge: 3 },
];

const resourceNav: NavItem[] = [
  { id: "vault",    label: "Vault",    icon: KeyRound, path: "/vault" },
  { id: "webhooks", label: "Webhooks", icon: Webhook,  path: "/webhooks" },
  { id: "data",     label: "Data",     icon: Database, path: "/data" },
  { id: "providers",label: "Providers",icon: Plug,     path: "/providers" },
  { id: "models",   label: "Models",   icon: Sparkles,  path: "/models" },
];

const systemNav: NavItem[] = [
  { id: "operations",  label: "Ops",         icon: Activity,    path: "/operations" },
  { id: "environment", label: "Environment", icon: Globe,       path: "/environment" },
  { id: "help",        label: "Help",        icon: HelpCircle,  path: "/help" },
];

/** Make.com-style icon + label item (vertical stack, centered) */
function SidebarItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-[3px] rounded-lg py-[7px] px-1",
        "transition-all duration-150 select-none",
        active
          ? "bg-zinc-100 text-zinc-800"
          : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
      )}
    >
      <div className="relative">
        <Icon size={17} strokeWidth={active ? 2 : 1.75} />
        {badge != null && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[8px] font-bold text-white leading-none">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-center leading-tight",
          "text-[9px] font-medium",
          active ? "text-zinc-700" : "text-zinc-400"
        )}
        style={{ maxWidth: "56px", wordBreak: "break-word" }}
      >
        {label}
      </span>
    </button>
  );
}

function Divider() {
  return (
    <div
      className="mx-3 my-1"
      style={{ borderTop: "1px solid var(--color-border-default)" }}
    />
  );
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav
      className="flex h-full flex-col items-center py-3 overflow-hidden"
      style={{
        width: "var(--sidebar-width)",
        borderRight: "1px solid var(--color-border-default)",
        background: "var(--color-bg-surface)",
      }}
    >
      {/* Brand mark */}
      <button
        onClick={() => navigate("/home")}
        title="FlowHolt"
        className="mb-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white transition-opacity duration-150 hover:opacity-80"
        style={{ background: "var(--color-fg-default)" }}
      >
        F
      </button>

      {/* Scrollable nav groups */}
      <div className="flex flex-1 flex-col w-full overflow-y-auto overflow-x-hidden px-1 gap-0.5">
        {primaryNav.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={isActive(item.path)}
            badge={item.badge}
            onClick={() => navigate(item.path)}
          />
        ))}

        <Divider />

        {resourceNav.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={isActive(item.path)}
            badge={item.badge}
            onClick={() => navigate(item.path)}
          />
        ))}

        <Divider />

        {systemNav.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={isActive(item.path)}
            badge={item.badge}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      {/* Bottom: settings + user — n8n pattern (only here, NOT in topbar) */}
      <div
        className="flex w-full flex-col items-center gap-0.5 pt-2 px-1"
        style={{ borderTop: "1px solid var(--color-border-default)" }}
      >
        <button
          onClick={() => navigate("/settings")}
          title="Settings"
          className="flex w-full flex-col items-center justify-center gap-[3px] rounded-lg py-[7px] px-1 text-zinc-400 transition-all duration-150 hover:bg-zinc-50 hover:text-zinc-600 select-none"
        >
          <Settings size={17} strokeWidth={1.75} />
          <span className="text-[9px] font-medium text-zinc-400 leading-tight">Settings</span>
        </button>

        <button
          title="Account"
          className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-150 hover:opacity-80"
          style={{
            background: "var(--color-bg-surface-strong)",
            color: "var(--color-fg-secondary)",
          }}
        >
          U
        </button>
      </div>
    </nav>
  );
}
