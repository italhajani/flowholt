import { useState, useRef, useEffect } from "react";
import { Bell, X, GitBranch, KeyRound, AlertTriangle, Users, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  category: "workflow" | "vault" | "runtime" | "team" | "security" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
}

const mockNotifications: Notification[] = [
  { id: "n1", category: "workflow", title: "Lead Qualification Pipeline failed", description: "Step 3 'Enrich Data' returned a 429 error.", time: "2 min ago", read: false, actionLabel: "View execution" },
  { id: "n2", category: "vault", title: "Slack Bot Token expiring", description: "Your credential expires in 5 days.", time: "15 min ago", read: false, actionLabel: "Rotate now" },
  { id: "n3", category: "team", title: "Sarah Chen joined the workspace", description: "Invited by you as Editor.", time: "1 hr ago", read: false },
  { id: "n4", category: "runtime", title: "Queue backlog detected", description: "12 workflows are queued and waiting.", time: "2 hrs ago", read: true, actionLabel: "View queue" },
  { id: "n5", category: "security", title: "New device login", description: "Login from Chrome on Windows.", time: "5 hrs ago", read: true },
  { id: "n6", category: "workflow", title: "Daily Report Generator completed", description: "All steps succeeded in 12s.", time: "1 day ago", read: true },
];

const categoryIcons: Record<string, React.ElementType> = {
  workflow: GitBranch,
  vault: KeyRound,
  runtime: Activity,
  team: Users,
  security: Shield,
  system: AlertTriangle,
};

const categoryColors: Record<string, string> = {
  workflow: "text-blue-500 bg-blue-50",
  vault: "text-amber-500 bg-amber-50",
  runtime: "text-purple-500 bg-purple-50",
  team: "text-green-500 bg-green-50",
  security: "text-red-500 bg-red-50",
  system: "text-zinc-500 bg-zinc-100",
};

const tabs = ["All", "Action", "Workflow", "Vault", "Runtime"] as const;
type Tab = (typeof tabs)[number];

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = mockNotifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Action") return !n.read && n.actionLabel;
    return n.category === activeTab.toLowerCase();
  });

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all duration-150"
        title="Notifications"
      >
        <Bell size={15} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel slide-over */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[380px] rounded-xl border border-zinc-100 bg-white shadow-lg overflow-hidden z-50"
          style={{ animation: "notifIn 150ms ease-out" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #f4f4f5" }}>
            <h3 className="text-[14px] font-semibold text-zinc-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <button className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors">
                Mark all read
              </button>
              <button onClick={() => setOpen(false)} className="text-zinc-300 hover:text-zinc-600 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tab strip */}
          <div className="flex items-center gap-0 px-2 pt-1" style={{ borderBottom: "1px solid #f4f4f5" }}>
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "px-2.5 py-1.5 text-[11px] font-medium transition-colors border-b-2 -mb-px",
                  activeTab === t
                    ? "border-zinc-800 text-zinc-800"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={24} strokeWidth={1.25} className="mx-auto text-zinc-200 mb-2" />
                <p className="text-[12px] text-zinc-400">No notifications</p>
              </div>
            ) : (
              filtered.map((n) => {
                const Icon = categoryIcons[n.category];
                const colorClass = categoryColors[n.category];
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer",
                      !n.read && "bg-zinc-50/50"
                    )}
                    style={{ borderBottom: "1px solid #fafafa" }}
                  >
                    <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md", colorClass)}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-[12px] leading-tight", n.read ? "text-zinc-600" : "font-medium text-zinc-800")}>
                          {n.title}
                        </p>
                        {!n.read && <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">{n.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-zinc-300">{n.time}</span>
                        {n.actionLabel && (
                          <button className="text-[10px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
                            {n.actionLabel} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid #f4f4f5" }}>
            <button className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors">
              View all notifications
            </button>
          </div>

          <style>{`
            @keyframes notifIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
