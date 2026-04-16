import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Copy, Download, Edit3, ExternalLink, Loader2, LogOut, Moon, Search, Settings, Share2, Sparkles, Sun, Upload, User, X } from "lucide-react";
import { api, type ApiNotification, type ApiWorkspaceMember } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface TopBarProps {
  activeTab: "editor" | "executions";
  onTabChange: (tab: "editor" | "executions") => void;
  onOpenChat: () => void;
  onOpenCommandBar?: () => void;
  onOpenWorkflowSettings?: () => void;
  workflowName?: string;
  workflowStatus?: "active" | "draft" | "paused";
  saving?: boolean;
  stepCount?: number;
  onRename?: (name: string) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  workflowId?: string;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-500",
  paused: "bg-amber-100 text-amber-700",
};

const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenChat,
  onOpenCommandBar,
  onOpenWorkflowSettings,
  workflowName = "Untitled Workflow",
  workflowStatus = "draft",
  saving = false,
  stepCount = 0,
  onRename,
  onExport,
  onImport,
  workflowId,
}) => {
  const navigate = useNavigate();
  const { user, workspace, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(workflowName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<ApiWorkspaceMember[]>([]);

  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Share modal state
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const data = await api.listNotifications();
      setNotifications(data.items);
      setUnreadCount(data.unread_count);
    } catch {
      // silent
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    let cancelled = false;

    api.getWorkspaceMembers().then((items) => {
      if (!cancelled) {
        setMembers(items);
      }
    }).catch(() => {
      if (!cancelled && user) {
        setMembers([
          {
            user_id: user.id,
            name: user.name,
            email: user.email,
            avatar_initials: user.avatar_initials,
            role: workspace?.role ?? "member",
            status: "active",
          },
        ]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, workspace?.role]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((p) => Math.max(0, p - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const handleShare = () => {
    setShareOpen(true);
  };

  const handleCopyLink = () => {
    const url = workflowId
      ? `${window.location.origin}/studio/${workflowId}`
      : window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRenameSubmit = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== workflowName && onRename) {
      onRename(trimmed);
    } else {
      setNameValue(workflowName);
    }
    setEditing(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const visibleMembers = members.slice(0, 4);
  const extraMembers = Math.max(0, (members.length || workspace?.members_count || 0) - visibleMembers.length);

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-slate-100 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate("/dashboard/workflows")}
          className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 hover:bg-violet-700 transition-colors"
        >
          FH
        </button>

        <div className="hidden md:flex items-center gap-2 text-[12px] text-slate-500 min-w-0">
          <span>Workflows</span>
          <span>/</span>
          {editing ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") { setNameValue(workflowName); setEditing(false); }
              }}
              className="max-w-[200px] h-6 rounded-md border border-slate-300 bg-white px-2 text-[12px] font-medium text-slate-900 outline-none focus:border-slate-400 transition-colors"
            />
          ) : (
            <button
              onClick={() => { setNameValue(workflowName); setEditing(true); }}
              className="flex items-center gap-1.5 text-slate-800 font-medium hover:text-slate-600 transition-colors group max-w-[200px]"
            >
              <span className="truncate">{workflowName}</span>
              <Edit3 size={11} className="text-slate-400 group-hover:text-slate-500 shrink-0" />
            </button>
          )}
          <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${statusColors[workflowStatus] ?? statusColors.draft}`}>
            {workflowStatus}
          </span>
          {workspace && (
            <span className="hidden xl:inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {workspace.name} · {workspace.role}
            </span>
          )}
          {saving ? (
            <span className="ml-1 flex items-center gap-1 text-[10px] text-slate-400">
              <Loader2 size={10} className="animate-spin" /> Saving...
            </span>
          ) : (
            <span className="ml-1 flex items-center gap-1 text-[10px] text-emerald-500">
              <Check size={10} /> Saved
            </span>
          )}
        </div>

        <div className="flex items-center rounded-md bg-slate-50 p-0.5 ml-2">
          <button
            onClick={() => onTabChange("editor")}
            className={`h-7 px-3 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === "editor" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => onTabChange("executions")}
            className={`h-7 px-3 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === "executions" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Runs
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden md:inline text-[11px] text-slate-400 mr-1">{stepCount} steps</span>

        {onExport && (
          <button
            onClick={onExport}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 inline-flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
          >
            <Download size={12} />
            Export
          </button>
        )}
        {onImport && (
          <>
            <button
              onClick={handleImportClick}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 inline-flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
            >
              <Upload size={12} />
              Import
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          </>
        )}

        {onOpenWorkflowSettings && (
          <button
            onClick={onOpenWorkflowSettings}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 inline-flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
          >
            <Settings size={12} />
            Workflow Settings
          </button>
        )}

        {onOpenCommandBar && (
          <button
            onClick={onOpenCommandBar}
            className="hidden md:inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Search size={12} />
            Commands
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">Ctrl+K</span>
          </button>
        )}

        <button
          onClick={onOpenChat}
          className="h-8 px-3 rounded-lg border border-violet-200 bg-violet-50 text-[11px] font-medium text-violet-700 inline-flex items-center gap-1.5 hover:bg-violet-100 transition-colors"
        >
          <Sparkles size={12} />
          Assist
        </button>

        <button
          onClick={handleShare}
          className="h-8 px-3 rounded-lg bg-violet-600 text-[11px] font-medium text-white inline-flex items-center gap-1.5 hover:bg-violet-700 transition-colors"
        >
          <Share2 size={12} />
          Share
        </button>

        {/* Share modal */}
        {shareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShareOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl w-[360px] p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold text-slate-900">Share Workflow</h3>
                <button onClick={() => setShareOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 mb-1.5">Workflow link</div>
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                    <input
                      readOnly
                      value={workflowId ? `${window.location.origin}/studio/${workflowId}` : window.location.href}
                      className="flex-1 h-9 px-2.5 text-[12px] text-slate-700 bg-slate-50 outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="h-9 px-3 bg-white border-l border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1"
                    >
                      {copied ? <><Check size={12} className="text-emerald-500" /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => { window.open(`mailto:?subject=Workflow: ${workflowName}&body=Check out this workflow: ${window.location.href}`, "_blank"); }}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={12} />
                  Share via email
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 px-1">
          <div className="flex items-center -space-x-2">
          {visibleMembers.map((member, index) => (
            <div
              key={member.user_id}
              title={`${member.name} (${member.role})`}
              className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold ${
                index % 2 === 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {member.avatar_initials}
            </div>
          ))}
          </div>
          {(visibleMembers.length > 0 || extraMembers > 0) && (
            <span className="text-[10px] text-slate-400">
              {members.length || workspace?.members_count || visibleMembers.length} collaborator{(members.length || workspace?.members_count || visibleMembers.length) === 1 ? "" : "s"}
              {extraMembers > 0 ? ` · +${extraMembers}` : ""}
            </span>
          )}
        </div>

        {/* Notifications bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((p) => !p); if (!notifOpen) fetchNotifications(); }}
            className="w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors relative"
          >
            <Bell size={12} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-9 w-[320px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
                <span className="text-[12px] font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[10px] font-medium text-violet-600 hover:text-violet-700">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[280px] overflow-y-auto">
                {notifLoading && notifications.length === 0 ? (
                  <div className="py-8 text-center"><Loader2 size={16} className="mx-auto text-slate-300 animate-spin" /></div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell size={18} className="mx-auto text-slate-200 mb-1.5" />
                    <div className="text-[11px] text-slate-400">No notifications</div>
                  </div>
                ) : (
                  notifications.slice(0, 15).map((n) => {
                    const kindColor: Record<string, string> = { info: "bg-blue-400", success: "bg-emerald-400", warning: "bg-amber-400", error: "bg-red-400" };
                    return (
                      <div
                        key={n.id}
                        className={`px-3 py-2.5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? "bg-violet-50/30" : ""}`}
                        onClick={() => { if (!n.read) handleMarkRead(n.id); if (n.link) navigate(n.link); }}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${kindColor[n.kind] ?? "bg-slate-300"}`} />
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold text-slate-800 truncate">{n.title}</div>
                            {n.body && <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.body}</div>}
                            <div className="text-[9px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-semibold text-violet-700 hover:bg-violet-200 transition-colors"
          >
            {user?.avatar_initials ?? "??"}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-9 w-[220px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="px-3 py-3 border-b border-slate-100">
                <div className="text-[12px] font-semibold text-slate-800">{user?.name ?? "User"}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{user?.email ?? ""}</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setProfileOpen(false); navigate("/dashboard/settings"); }}
                  className="w-full px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <User size={12} className="text-slate-400" />
                  Account settings
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/dashboard/settings"); }}
                  className="w-full px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Settings size={12} className="text-slate-400" />
                  Preferences
                </button>
                <button
                  onClick={() => setDarkMode((d) => !d)}
                  className="w-full px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {darkMode ? <Moon size={12} className="text-slate-400" /> : <Sun size={12} className="text-slate-400" />}
                    {darkMode ? "Dark mode" : "Light mode"}
                  </span>
                  <div className={`relative inline-flex h-4 w-7 rounded-full transition-colors ${darkMode ? "bg-violet-500" : "bg-slate-200"}`}>
                    <span className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${darkMode ? "translate-x-3.5 ml-0" : "translate-x-0.5"}`} />
                  </div>
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={() => { setProfileOpen(false); logout(); navigate("/", { replace: true }); }}
                  className="w-full px-3 py-2 text-left text-[11px] text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut size={12} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
