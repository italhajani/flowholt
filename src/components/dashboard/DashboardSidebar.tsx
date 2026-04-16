import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, GitBranch, LayoutTemplate, Play, KeyRound,
  Code2, Settings, HelpCircle,
  PanelLeftClose, PanelLeftOpen, Zap, Crown, Activity, Webhook,
  Shield, Server, LogOut, MessageSquare, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Tooltip from "./Tooltip";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
}

const overviewItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard/overview" },
  { icon: MessageSquare, label: "Chat", path: "/dashboard/chat" },
  { icon: Bot, label: "AI Agents", path: "/dashboard/ai-agents" },
  { icon: GitBranch, label: "Workflows", path: "/dashboard/workflows" },
  { icon: LayoutTemplate, label: "Templates", path: "/dashboard/templates" },
  { icon: Play, label: "Executions", path: "/dashboard/executions", badge: "3" },
];

const dataItems: NavItem[] = [
  { icon: KeyRound, label: "Vault", path: "/dashboard/credentials" },
  { icon: Server, label: "Environments", path: "/dashboard/environment" },
];

const toolItems: NavItem[] = [
  { icon: Webhook, label: "Webhooks", path: "/dashboard/webhooks" },
  { icon: Code2, label: "API Playground", path: "/dashboard/api" },
];

const accountItems: NavItem[] = [
  { icon: Activity, label: "System Status", path: "/dashboard/system" },
  { icon: Shield, label: "Audit Log", path: "/dashboard/audit" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: HelpCircle, label: "Help Center", path: "/dashboard/help" },
];

const DashboardSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.path);
    const link = (
      <NavLink
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-2.5 rounded-md transition-colors duration-150 relative",
          collapsed ? "px-2 py-2 justify-center" : "px-3 py-[6px]",
          active
            ? "bg-slate-100/80 text-[#103b71] font-extrabold shadow-[inset_2px_0_0_#103b71]"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-bold"
        )}
      >
        <item.icon size={15} className={cn("shrink-0", active ? "text-[#103b71]" : "text-slate-400")} />
        {!collapsed && <span className="text-[12px] truncate flex-1">{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold bg-slate-200 text-slate-600 px-1">
            {item.badge}
          </span>
        )}
      </NavLink>
    );

    return collapsed ? <Tooltip key={item.path} content={item.label} side="right">{link}</Tooltip> : link;
  };

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mb-1">
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] font-bold text-slate-400">
            {title}
          </span>
        </div>
      )}
      {collapsed && <div className="pt-2" />}
      <div className="flex flex-col gap-0.5 px-2">
        {items.map(renderNavItem)}
      </div>
    </div>
  );

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-white border-r border-slate-200/60 transition-[width] duration-200 ease-out shrink-0",
        collapsed ? "w-[56px]" : "w-[220px]"
      )}
    >
      <div className={cn("h-12 flex items-center shrink-0", collapsed ? "justify-center px-2" : "px-4 justify-between border-b border-transparent")}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#103b71] flex items-center justify-center">
            <Zap size={12} className="text-white outline-none" fill="white" />
          </div>
          {!collapsed && <span className="text-[14px] font-extrabold text-slate-900 tracking-tight">FlowHolt</span>}
        </div>
        <Tooltip content={collapsed ? "Expand" : "Collapse"} side="right">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 transition-colors duration-150", collapsed && "mx-auto mt-0 hidden")}
          >
            {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
          </button>
        </Tooltip>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
        <div className="flex flex-col gap-0.5 px-2">
          {overviewItems.map(renderNavItem)}
        </div>
        {renderSection("Data", dataItems)}
        {renderSection("Tools", toolItems)}
        {renderSection("Account", accountItems)}
      </nav>

      <div className="shrink-0 pb-3 pt-2">
        {!collapsed && (
          <div className="px-3 mb-2">
            <div className="rounded-md bg-slate-50 p-2.5 border border-slate-200/60">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Crown size={11} className="text-[#103b71]" />
                  <span className="text-[11px] font-bold text-slate-800">Free Plan</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">150 / 500 tasks</span>
              </div>
              <div className="w-full h-1 rounded-full bg-slate-200 mb-2">
                <div className="h-full w-[30%] rounded-full bg-[#103b71]" />
              </div>
              <button className="text-[10px] font-bold text-[#103b71] block w-full text-left">Upgrade Plan →</button>
            </div>
          </div>
        )}
        <div className={cn("flex items-center gap-2.5 px-3 py-1 cursor-pointer hover:bg-slate-50 rounded-md mx-2 transition-colors", collapsed && "justify-center px-0 mx-0 p-1")}>
          <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-extrabold text-slate-600 border border-slate-200/60 shrink-0">
            {user?.avatar_initials ?? "??"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-slate-900 truncate">{user?.name ?? "User"}</div>
              <div className="text-[10px] font-bold text-slate-500 truncate mt-0.5">{user?.email ?? ""}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
