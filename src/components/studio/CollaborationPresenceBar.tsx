import { useState, useEffect } from "react";
import {
  Users, Eye, Edit3, MousePointer2, Circle, Wifi, WifiOff,
  MessageSquare, Lock, Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mock collaborators ── */
interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: "viewing" | "editing" | "idle" | "away";
  activeNode?: string;
  cursor?: { x: number; y: number };
  lastSeen: string;
}

const mockCollaborators: Collaborator[] = [
  { id: "u1", name: "Sarah Chen", avatar: "SC", color: "#3b82f6", status: "editing", activeNode: "HTTP Request", lastSeen: "now" },
  { id: "u2", name: "Alex Rivera", avatar: "AR", color: "#8b5cf6", status: "viewing", activeNode: "IF Branch", lastSeen: "2m ago" },
  { id: "u3", name: "Jamie Lee", avatar: "JL", color: "#f59e0b", status: "idle", lastSeen: "5m ago" },
  { id: "u4", name: "Morgan Kim", avatar: "MK", color: "#10b981", status: "away", lastSeen: "15m ago" },
];

/* ── Status config ── */
const statusConfig: Record<string, { icon: typeof Eye; label: string; color: string; dot: string }> = {
  editing: { icon: Edit3, label: "Editing", color: "text-blue-600", dot: "bg-blue-500" },
  viewing: { icon: Eye, label: "Viewing", color: "text-emerald-600", dot: "bg-emerald-500" },
  idle: { icon: Circle, label: "Idle", color: "text-amber-600", dot: "bg-amber-400" },
  away: { icon: Circle, label: "Away", color: "text-zinc-400", dot: "bg-zinc-300" },
};

/* ── Avatar component ── */
function CollaboratorAvatar({ user, size = "md" }: { user: Collaborator; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-6 w-6 text-[8px]" : "h-7 w-7 text-[9px]";
  const dotDim = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const cfg = statusConfig[user.status];

  return (
    <div className="relative" title={`${user.name} — ${cfg.label}`}>
      <div
        className={cn("rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white", dim)}
        style={{ backgroundColor: user.color }}
      >
        {user.avatar}
      </div>
      <span className={cn("absolute -bottom-0.5 -right-0.5 rounded-full ring-1 ring-white", dotDim, cfg.dot)} />
    </div>
  );
}

/* ── Cursor overlay (for canvas) ── */
export function CollaboratorCursors({ collaborators }: { collaborators?: Collaborator[] }) {
  const users = (collaborators || mockCollaborators).filter(u => u.cursor);

  return (
    <>
      {users.map(user => (
        <div
          key={user.id}
          className="absolute pointer-events-none z-50 transition-all duration-200"
          style={{ left: user.cursor!.x, top: user.cursor!.y }}
        >
          <MousePointer2 size={14} style={{ color: user.color }} className="drop-shadow-sm" />
          <span
            className="ml-3 -mt-1 rounded-md px-1.5 py-0.5 text-[8px] font-semibold text-white whitespace-nowrap shadow-sm"
            style={{ backgroundColor: user.color }}
          >
            {user.name.split(" ")[0]}
          </span>
        </div>
      ))}
    </>
  );
}

/* ── Node editing indicator (for canvas nodes) ── */
export function NodeEditIndicator({ userName, color }: { userName: string; color: string }) {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
      <div
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-bold text-white shadow-sm whitespace-nowrap animate-pulse"
        style={{ backgroundColor: color }}
      >
        <Edit3 size={7} />
        {userName.split(" ")[0]} editing
      </div>
    </div>
  );
}

/* ── Main Presence Bar ── */
interface CollaborationPresenceBarProps {
  className?: string;
}

export function CollaborationPresenceBar({ className }: CollaborationPresenceBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(true);
  const [lockNode, setLockNode] = useState<string | null>(null);

  const activeUsers = mockCollaborators.filter(u => u.status !== "away");
  const editingUsers = mockCollaborators.filter(u => u.status === "editing");

  // Simulate connection status
  useEffect(() => {
    const timer = setInterval(() => {
      setConnected(prev => Math.random() > 0.05 ? true : !prev);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Compact bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 shadow-sm hover:shadow transition-all"
      >
        {/* Connection indicator */}
        <span className={cn(
          "h-1.5 w-1.5 rounded-full flex-shrink-0",
          connected ? "bg-emerald-500" : "bg-red-500 animate-pulse"
        )} />

        {/* Avatar stack */}
        <div className="flex -space-x-1.5">
          {activeUsers.slice(0, 4).map(user => (
            <CollaboratorAvatar key={user.id} user={user} size="sm" />
          ))}
          {activeUsers.length > 4 && (
            <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[8px] font-bold text-zinc-600 ring-2 ring-white">
              +{activeUsers.length - 4}
            </div>
          )}
        </div>

        {/* Editing indicator */}
        {editingUsers.length > 0 && (
          <span className="flex items-center gap-1 text-[9px] text-blue-600">
            <Edit3 size={8} className="animate-pulse" />
            {editingUsers.length}
          </span>
        )}

        <Users size={10} className="text-zinc-400" />
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="absolute top-full right-0 mt-1.5 w-72 rounded-xl border border-zinc-200 bg-white shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Users size={12} className="text-zinc-500" />
              <span className="text-[11px] font-semibold text-zinc-700">Collaborators</span>
              <span className="rounded-full bg-zinc-100 px-1.5 py-0 text-[9px] font-medium text-zinc-500">
                {mockCollaborators.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {connected ? (
                <span className="flex items-center gap-1 text-[9px] text-emerald-600">
                  <Wifi size={9} /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] text-red-500 animate-pulse">
                  <WifiOff size={9} /> Reconnecting…
                </span>
              )}
            </div>
          </div>

          {/* User list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {mockCollaborators.map(user => {
              const cfg = statusConfig[user.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 transition-colors group"
                >
                  <CollaboratorAvatar user={user} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-zinc-700 truncate">{user.name}</span>
                      {user.id === "u1" && (
                        <span className="rounded bg-blue-100 px-1 py-0 text-[7px] font-bold text-blue-600">YOU</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon size={8} className={cfg.color} />
                      <span className={cn("text-[9px]", cfg.color)}>{cfg.label}</span>
                      {user.activeNode && (
                        <>
                          <span className="text-[8px] text-zinc-300">·</span>
                          <span className="text-[9px] text-zinc-400 truncate">{user.activeNode}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors" title="Message">
                      <MessageSquare size={10} />
                    </button>
                  </div>
                  <span className="text-[8px] text-zinc-300">{user.lastSeen}</span>
                </div>
              );
            })}
          </div>

          {/* Node locking section */}
          <div className="border-t border-zinc-100 px-3 py-2.5">
            <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Node Locking</p>
            <div className="space-y-1">
              {[
                { node: "HTTP Request", lockedBy: "Sarah Chen", color: "#3b82f6" },
              ].map(lock => (
                <div key={lock.node} className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-100 px-2 py-1.5">
                  <Lock size={9} className="text-blue-500" />
                  <span className="text-[10px] text-blue-700 font-medium flex-1">{lock.node}</span>
                  <span
                    className="rounded-full px-1.5 py-0 text-[8px] font-bold text-white"
                    style={{ backgroundColor: lock.color }}
                  >
                    {lock.lockedBy.split(" ")[0]}
                  </span>
                </div>
              ))}
              <button className="flex items-center gap-1.5 w-full rounded-md border border-dashed border-zinc-200 px-2 py-1.5 text-[9px] text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-colors">
                <Unlock size={9} />
                Click a node to lock for editing
              </button>
            </div>
          </div>

          {/* Activity feed */}
          <div className="border-t border-zinc-100 px-3 py-2.5">
            <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Recent Activity</p>
            <div className="space-y-1.5">
              {[
                { user: "Sarah", action: "started editing HTTP Request", time: "just now", color: "#3b82f6" },
                { user: "Alex", action: "opened IF Branch inspector", time: "2m ago", color: "#8b5cf6" },
                { user: "Jamie", action: "ran test execution", time: "5m ago", color: "#f59e0b" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: activity.color }}
                  >
                    {activity.user[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-zinc-600">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                  </div>
                  <span className="text-[8px] text-zinc-300 flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
