import { useState } from "react";
import {
  Bell, Mail, MessageSquare, Clock, Moon, Sun,
  ChevronDown, ChevronRight, Check, Globe, AlertTriangle,
  CheckCircle2, XCircle, Zap, Play, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface NotificationChannel {
  id: "email" | "in_app" | "slack" | "webhook";
  label: string;
  icon: typeof Mail;
  enabled: boolean;
  description: string;
}

interface NotificationEvent {
  id: string;
  label: string;
  icon: typeof Zap;
  category: string;
  channels: Record<string, boolean>;
}

/* ── Demo data ── */
const initialChannels: NotificationChannel[] = [
  { id: "in_app", label: "In-App", icon: Bell, enabled: true, description: "Notifications in FlowHolt UI" },
  { id: "email", label: "Email", icon: Mail, enabled: true, description: "Send to your registered email" },
  { id: "slack", label: "Slack", icon: MessageSquare, enabled: false, description: "Post to connected Slack channel" },
  { id: "webhook", label: "Webhook", icon: Globe, enabled: false, description: "POST to a custom URL" },
];

const initialEvents: NotificationEvent[] = [
  { id: "exec-success", label: "Execution succeeded", icon: CheckCircle2, category: "Executions",
    channels: { in_app: true, email: false, slack: false, webhook: false } },
  { id: "exec-failed", label: "Execution failed", icon: XCircle, category: "Executions",
    channels: { in_app: true, email: true, slack: true, webhook: false } },
  { id: "exec-timeout", label: "Execution timed out", icon: Clock, category: "Executions",
    channels: { in_app: true, email: true, slack: false, webhook: false } },
  { id: "workflow-activated", label: "Workflow activated", icon: Play, category: "Workflows",
    channels: { in_app: true, email: false, slack: false, webhook: false } },
  { id: "workflow-error", label: "Workflow has recurring errors", icon: AlertTriangle, category: "Workflows",
    channels: { in_app: true, email: true, slack: true, webhook: false } },
  { id: "credential-expiring", label: "Credential expiring soon", icon: Clock, category: "Credentials",
    channels: { in_app: true, email: true, slack: false, webhook: false } },
  { id: "team-invite", label: "New team invitation", icon: User, category: "Team",
    channels: { in_app: true, email: true, slack: false, webhook: false } },
  { id: "mention", label: "Mentioned in comment", icon: MessageSquare, category: "Team",
    channels: { in_app: true, email: true, slack: false, webhook: false } },
];

export function NotificationPreferencesPanel() {
  const [channels, setChannels] = useState(initialChannels);
  const [events, setEvents] = useState(initialEvents);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [digestFreq, setDigestFreq] = useState<"instant" | "hourly" | "daily">("instant");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Executions");

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const toggleEventChannel = (eventId: string, channelId: string) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId
        ? { ...e, channels: { ...e.channels, [channelId]: !e.channels[channelId] } }
        : e
    ));
  };

  const categories = [...new Set(events.map(e => e.category))];

  return (
    <div className="max-w-[640px] space-y-6">
      {/* Channels section */}
      <div>
        <h3 className="text-[13px] font-semibold text-zinc-800 mb-3">Notification Channels</h3>
        <div className="grid grid-cols-2 gap-2">
          {channels.map(ch => {
            const Icon = ch.icon;
            return (
              <button
                key={ch.id}
                onClick={() => toggleChannel(ch.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-all text-left",
                  ch.enabled
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-lg",
                  ch.enabled ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-400"
                )}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[12px] font-medium", ch.enabled ? "text-blue-700" : "text-zinc-600")}>
                    {ch.label}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">{ch.description}</p>
                </div>
                <div className={cn(
                  "h-4 w-7 rounded-full transition-colors flex items-center px-0.5",
                  ch.enabled ? "bg-blue-600 justify-end" : "bg-zinc-200 justify-start"
                )}>
                  <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event matrix */}
      <div>
        <h3 className="text-[13px] font-semibold text-zinc-800 mb-3">Event Preferences</h3>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--color-border-default)" }}>
          <div className="flex items-center bg-zinc-50 px-4 py-2 border-b" style={{ borderColor: "var(--color-border-default)" }}>
            <span className="flex-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Event</span>
            {channels.filter(c => c.enabled).map(ch => (
              <span key={ch.id} className="w-16 text-center text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                {ch.label}
              </span>
            ))}
          </div>

          {categories.map(cat => {
            const catEvents = events.filter(e => e.category === cat);
            const isExpanded = expandedCategory === cat;

            return (
              <div key={cat}>
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                  className="flex items-center gap-2 w-full px-4 py-2 bg-zinc-50/50 hover:bg-zinc-50 transition-colors border-b"
                  style={{ borderColor: "var(--color-border-default)" }}
                >
                  {isExpanded ? <ChevronDown size={11} className="text-zinc-400" /> : <ChevronRight size={11} className="text-zinc-400" />}
                  <span className="text-[11px] font-semibold text-zinc-600">{cat}</span>
                  <span className="text-[10px] text-zinc-400">({catEvents.length})</span>
                </button>

                {isExpanded && catEvents.map(ev => {
                  const EvIcon = ev.icon;
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center px-4 py-2 border-b hover:bg-zinc-50/50 transition-colors"
                      style={{ borderColor: "var(--color-border-default)" }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <EvIcon size={13} className="text-zinc-400" />
                        <span className="text-[12px] text-zinc-700">{ev.label}</span>
                      </div>
                      {channels.filter(c => c.enabled).map(ch => (
                        <div key={ch.id} className="w-16 flex justify-center">
                          <button
                            onClick={() => toggleEventChannel(ev.id, ch.id)}
                            className={cn(
                              "h-5 w-5 rounded flex items-center justify-center transition-colors",
                              ev.channels[ch.id]
                                ? "bg-blue-600 text-white"
                                : "bg-zinc-100 text-zinc-300 hover:bg-zinc-200"
                            )}
                          >
                            {ev.channels[ch.id] && <Check size={11} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiet hours */}
      <div>
        <h3 className="text-[13px] font-semibold text-zinc-800 mb-3">Quiet Hours</h3>
        <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--color-border-default)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon size={14} className="text-zinc-400" />
              <span className="text-[12px] text-zinc-600">Enable quiet hours</span>
            </div>
            <button
              onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
              className={cn(
                "h-5 w-9 rounded-full transition-colors flex items-center px-0.5",
                quietHoursEnabled ? "bg-blue-600 justify-end" : "bg-zinc-200 justify-start"
              )}
            >
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {quietHoursEnabled && (
            <div className="flex items-center gap-3 pl-6">
              <div className="flex items-center gap-1.5">
                <Moon size={11} className="text-zinc-400" />
                <input
                  type="time"
                  value={quietStart}
                  onChange={e => setQuietStart(e.target.value)}
                  className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 outline-none focus:border-blue-300"
                />
              </div>
              <span className="text-[11px] text-zinc-400">to</span>
              <div className="flex items-center gap-1.5">
                <Sun size={11} className="text-zinc-400" />
                <input
                  type="time"
                  value={quietEnd}
                  onChange={e => setQuietEnd(e.target.value)}
                  className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 outline-none focus:border-blue-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Digest frequency */}
      <div>
        <h3 className="text-[13px] font-semibold text-zinc-800 mb-3">Email Digest</h3>
        <div className="flex gap-2">
          {(["instant", "hourly", "daily"] as const).map(freq => (
            <button
              key={freq}
              onClick={() => setDigestFreq(freq)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2.5 text-center transition-all",
                digestFreq === freq
                  ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-200"
                  : "border-zinc-200 hover:bg-zinc-50"
              )}
            >
              <p className={cn("text-[12px] font-medium", digestFreq === freq ? "text-blue-700" : "text-zinc-600")}>
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {freq === "instant" ? "Send immediately" : freq === "hourly" ? "Batch every hour" : "Once per day"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
