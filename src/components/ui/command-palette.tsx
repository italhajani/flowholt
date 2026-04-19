import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import {
  Home,
  GitBranch,
  Bot,
  LayoutTemplate,
  Play,
  ClipboardList,
  KeyRound,
  Webhook,
  Database,
  Plug,
  Activity,
  Globe,
  HelpCircle,
  Settings,
  Plus,
  Search,
  Terminal,
  User,
  Shield,
  CreditCard,
  Clock,
  Pencil,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const navigation = [
  { label: "Home",          icon: Home,           path: "/home" },
  { label: "Workflows",     icon: GitBranch,      path: "/workflows" },
  { label: "AI Agents",     icon: Bot,            path: "/ai-agents" },
  { label: "Templates",     icon: LayoutTemplate, path: "/templates" },
  { label: "Executions",    icon: Play,           path: "/executions" },
  { label: "Human Tasks",   icon: ClipboardList,  path: "/human-tasks" },
  { label: "Chat",          icon: MessageSquare,  path: "/chat" },
  { label: "Vault",         icon: KeyRound,       path: "/vault" },
  { label: "Webhooks",      icon: Webhook,        path: "/webhooks" },
  { label: "Data",          icon: Database,        path: "/data" },
  { label: "Providers",     icon: Plug,           path: "/providers" },
  { label: "Operations",    icon: Activity,       path: "/operations" },
  { label: "Environment",   icon: Globe,          path: "/environment" },
  { label: "API Playground", icon: Terminal,       path: "/help/api" },
  { label: "Help",          icon: HelpCircle,     path: "/help" },
  { label: "Models",        icon: Plug,           path: "/models" },
];

const settingsNav = [
  { label: "Profile Settings",   icon: User,       path: "/settings/profile" },
  { label: "Workspace General",  icon: Settings,   path: "/settings/workspace/general" },
  { label: "Members & Roles",    icon: Shield,     path: "/settings/workspace/members" },
  { label: "Security Settings",  icon: Shield,     path: "/settings/workspace/security" },
  { label: "Billing & Usage",    icon: CreditCard, path: "/settings/workspace/billing" },
];

const quickActions = [
  { label: "New Workflow",   icon: Plus, path: "/workflows" },
  { label: "New AI Agent",   icon: Plus, path: "/ai-agents" },
  { label: "New Credential", icon: Plus, path: "/vault" },
  { label: "New Webhook",    icon: Plus, path: "/webhooks" },
];

const recentPages = [
  { label: "Lead Qualification Pipeline", icon: Pencil, path: "/workflows/wf-001" },
  { label: "Execution #1247",             icon: Clock,  path: "/executions/exec-1247" },
  { label: "Stripe Events Webhook",       icon: Webhook, path: "/webhooks/wh1" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    const openFromEvent = () => setOpen(true);
    document.addEventListener("keydown", down);
    document.addEventListener("open-command-palette", openFromEvent);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-command-palette", openFromEvent);
    };
  }, [toggle]);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
        style={{ animation: "fadeIn 100ms ease-out" }}
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-[20%] z-50 w-full max-w-[520px] -translate-x-1/2"
        style={{ animation: "slideIn 150ms ease-out" }}
      >
        <Command
          className="rounded-xl border shadow-overlay overflow-hidden"
          style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-overlay)" }}
        >
          <div className="flex items-center gap-2 px-4 border-b" style={{ borderColor: "var(--color-border-default)" }}>
            <Search size={15} className="text-zinc-400 flex-shrink-0" />
            <Command.Input
              placeholder="Type a command or search…"
              className="h-11 w-full bg-transparent text-[14px] text-zinc-800 placeholder:text-zinc-400 outline-none"
              autoFocus
            />
            <kbd
              className="flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
              style={{
                background: "var(--color-bg-surface-strong)",
                border: "1px solid var(--color-border-default)",
              }}
            >
              Esc
            </kbd>
          </div>

          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-[13px] text-zinc-400">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
              {navigation.map((item) => (
                <Command.Item
                  key={item.path}
                  value={item.label}
                  onSelect={() => go(item.path)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                >
                  <item.icon size={15} strokeWidth={1.75} className="text-zinc-400" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="mx-2 my-1 h-px bg-zinc-100" />

            <Command.Group heading="Quick Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
              {quickActions.map((item) => (
                <Command.Item
                  key={item.label}
                  value={item.label}
                  onSelect={() => go(item.path)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                >
                  <item.icon size={15} strokeWidth={1.75} className="text-zinc-400" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="mx-2 my-1 h-px bg-zinc-100" />

            <Command.Group heading="Recent" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
              {recentPages.map((item) => (
                <Command.Item
                  key={item.path}
                  value={item.label}
                  onSelect={() => go(item.path)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                >
                  <item.icon size={15} strokeWidth={1.75} className="text-zinc-400" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="mx-2 my-1 h-px bg-zinc-100" />

            <Command.Group heading="Settings" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
              {settingsNav.map((item) => (
                <Command.Item
                  key={item.path}
                  value={item.label}
                  onSelect={() => go(item.path)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
                >
                  <item.icon size={15} strokeWidth={1.75} className="text-zinc-400" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="mx-2 my-1 h-px bg-zinc-100" />

            <Command.Group heading="Appearance" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400">
              <Command.Item
                value="Toggle dark mode"
                onSelect={() => { toggleTheme(); setOpen(false); }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-700 cursor-pointer data-[selected=true]:bg-zinc-100 data-[selected=true]:text-zinc-900 transition-colors"
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={15} strokeWidth={1.75} className="text-zinc-400" />
                ) : (
                  <Moon size={15} strokeWidth={1.75} className="text-zinc-400" />
                )}
                {resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div
            className="flex items-center justify-between px-4 py-2 text-[11px] text-zinc-400"
            style={{ borderTop: "1px solid var(--color-border-default)" }}
          >
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
          </div>
        </Command>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </>
  );
}
