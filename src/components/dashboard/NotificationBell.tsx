import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api} from "@/lib/api";

const kindIcon = {
  info: <Info size={13} className="text-blue-500" />,
  success: <CheckCircle2 size={13} className="text-emerald-500" />,
  warning: <AlertTriangle size={13} className="text-amber-500" />,
  error: <XCircle size={13} className="text-red-500" />,
} as const;

const kindBg = {
  info: "bg-blue-50",
  success: "bg-emerald-50",
  warning: "bg-amber-50",
  error: "bg-red-50",
} as const;

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.listNotifications(),
    refetchInterval: 30_000,
  });

  const items = data?.items ?? [];
  const unreadCount = data?.unread_count ?? 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[340px] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-[13px] font-semibold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[12px] text-slate-400">No notifications yet</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-50 flex gap-3 ${!n.read ? "bg-indigo-50/30" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${kindBg[n.kind]}`}>
                    {kindIcon[n.kind]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[12px] font-medium text-slate-900 leading-4">{n.title}</span>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap shrink-0">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.body && <p className="text-[11px] text-slate-500 mt-0.5 leading-4 line-clamp-2">{n.body}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      {n.link && (
                        <a
                          href={n.link}
                          className="text-[10px] text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                        >
                          View <ExternalLink size={9} />
                        </a>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                        >
                          <Check size={9} /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
