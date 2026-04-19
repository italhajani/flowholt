import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, Check, Plus, Settings, Users, Shield,
  Crown, Globe, Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface Workspace {
  id: string;
  name: string;
  role: "owner" | "admin" | "builder" | "viewer";
  memberCount: number;
  icon?: string;
  plan?: "free" | "pro" | "enterprise";
}

interface WorkspaceSwitcherProps {
  className?: string;
  onSwitch?: (workspaceId: string) => void;
}

const roleConfig = {
  owner:   { icon: Crown,  label: "Owner",   color: "text-amber-600 bg-amber-50" },
  admin:   { icon: Shield, label: "Admin",   color: "text-blue-600 bg-blue-50" },
  builder: { icon: Settings, label: "Builder", color: "text-violet-600 bg-violet-50" },
  viewer:  { icon: Users,  label: "Viewer",  color: "text-zinc-500 bg-zinc-100" },
};

const planBadge = {
  free:       { label: "Free",       color: "bg-zinc-100 text-zinc-500" },
  pro:        { label: "Pro",        color: "bg-blue-100 text-blue-600" },
  enterprise: { label: "Enterprise", color: "bg-violet-100 text-violet-600" },
};

/* ── Demo workspaces ── */
const demoWorkspaces: Workspace[] = [
  { id: "ws-1", name: "Acme Corp",        role: "owner",   memberCount: 12, plan: "enterprise" },
  { id: "ws-2", name: "Marketing Ops",    role: "admin",   memberCount: 5,  plan: "pro" },
  { id: "ws-3", name: "Dev Playground",   role: "builder", memberCount: 3,  plan: "free" },
  { id: "ws-4", name: "Client - Widget Co", role: "viewer", memberCount: 8, plan: "pro" },
];

const LS_KEY = "flowholt_last_workspace";

export function WorkspaceSwitcher({ className, onSwitch }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(() => {
    return localStorage.getItem(LS_KEY) || demoWorkspaces[0].id;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = demoWorkspaces.find(w => w.id === currentId) || demoWorkspaces[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchTo = (ws: Workspace) => {
    setCurrentId(ws.id);
    localStorage.setItem(LS_KEY, ws.id);
    setOpen(false);
    onSwitch?.(ws.id);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Current workspace button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all",
          open
            ? "bg-zinc-100 text-zinc-800"
            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
        )}
      >
        <div
          className="flex items-center justify-center h-6 w-6 rounded-md text-white text-[10px] font-bold"
          style={{ backgroundColor: stringToColor(current.name) }}
        >
          {current.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-[12px] font-medium max-w-[140px] truncate">{current.name}</span>
        <ChevronDown size={12} className={cn("text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-[280px] rounded-xl border bg-white shadow-lg overflow-hidden"
          style={{
            borderColor: "var(--color-border-default)",
            animation: "wsSwitcherIn 120ms ease-out",
          }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b" style={{ borderColor: "var(--color-border-default)" }}>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Switch workspace</p>
          </div>

          {/* Workspace list */}
          <div className="py-1 max-h-[260px] overflow-y-auto">
            {demoWorkspaces.map(ws => {
              const isActive = ws.id === currentId;
              const role = roleConfig[ws.role];
              const RoleIcon = role.icon;
              const badge = ws.plan ? planBadge[ws.plan] : null;

              return (
                <button
                  key={ws.id}
                  onClick={() => switchTo(ws)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors",
                    isActive ? "bg-blue-50/50" : "hover:bg-zinc-50"
                  )}
                >
                  <div
                    className="flex items-center justify-center h-8 w-8 rounded-lg text-white text-[11px] font-bold flex-shrink-0"
                    style={{ backgroundColor: stringToColor(ws.name) }}
                  >
                    {ws.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-[12px] font-medium truncate", isActive ? "text-blue-700" : "text-zinc-700")}>
                        {ws.name}
                      </span>
                      {isActive && <Check size={12} className="text-blue-600 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[9px] font-medium", role.color)}>
                        <RoleIcon size={8} />
                        {role.label}
                      </span>
                      {badge && (
                        <span className={cn("rounded-full px-1.5 py-0 text-[9px] font-medium", badge.color)}>
                          {badge.label}
                        </span>
                      )}
                      <span className="text-[9px] text-zinc-400">
                        {ws.memberCount} members
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="border-t py-1" style={{ borderColor: "var(--color-border-default)" }}>
            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors">
              <Plus size={14} className="text-zinc-400" />
              Create workspace
            </button>
            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors">
              <Building size={14} className="text-zinc-400" />
              Manage workspaces
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wsSwitcherIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* Color from string (consistent hashing) */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 50%)`;
}
