import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Moon, Webhook, MessageSquare, AlertTriangle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotifChannel {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
  slack: boolean;
  webhook: boolean;
}

const channels: NotifChannel[] = [
  { id: "execFail", label: "Execution failures", description: "When a workflow run fails.", email: true, inApp: true, slack: true, webhook: true },
  { id: "execSuccess", label: "Execution success", description: "When a workflow completes successfully.", email: false, inApp: true, slack: false, webhook: false },
  { id: "execSlow", label: "Slow executions", description: "When execution exceeds duration threshold.", email: true, inApp: true, slack: true, webhook: false },
  { id: "vaultExpiry", label: "Credential expiry", description: "When a credential is about to expire.", email: true, inApp: true, slack: true, webhook: false },
  { id: "connHealth", label: "Connection health", description: "When a connection becomes unhealthy.", email: true, inApp: true, slack: false, webhook: true },
  { id: "teamInvite", label: "Team invitations", description: "When you're invited to a team or workspace.", email: true, inApp: true, slack: false, webhook: false },
  { id: "mentions", label: "Mentions", description: "When someone mentions you in a comment.", email: false, inApp: true, slack: false, webhook: false },
  { id: "security", label: "Security alerts", description: "Login from new device, password changes.", email: true, inApp: true, slack: false, webhook: true },
  { id: "billing", label: "Billing alerts", description: "Credit thresholds, invoice reminders.", email: true, inApp: true, slack: false, webhook: false },
  { id: "deployment", label: "Deployment events", description: "When workflows are promoted to staging/production.", email: true, inApp: true, slack: true, webhook: true },
];

export function NotificationSettings() {
  const [settings, setSettings] = useState<Record<string, NotifChannel>>(
    Object.fromEntries(channels.map((c) => [c.id, { ...c }]))
  );
  const [digestFrequency, setDigestFrequency] = useState("realtime");
  const [failureThreshold, setFailureThreshold] = useState("3");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [quietEnabled, setQuietEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const toggle = (id: string, field: "email" | "inApp" | "slack" | "webhook") => {
    setSettings((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: !prev[id][field] },
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[16px] font-semibold text-zinc-900">Notifications</h2>
        <p className="text-[13px] text-zinc-500 mt-1">Choose how and when you want to be notified.</p>
      </div>

      {/* Delivery preferences */}
      <div className="grid grid-cols-2 gap-4">
        {/* Digest frequency */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-zinc-400" />
            <span className="text-[12px] font-semibold text-zinc-700">Digest Frequency</span>
          </div>
          <div className="space-y-1.5">
            {[
              { value: "realtime", label: "Real-time", desc: "Instant delivery" },
              { value: "hourly", label: "Hourly digest", desc: "Batched every hour" },
              { value: "daily", label: "Daily digest", desc: "Summary at 9 AM" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDigestFrequency(opt.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-all",
                  digestFrequency === opt.value ? "bg-zinc-100 border border-zinc-300" : "border border-transparent hover:bg-zinc-50"
                )}
              >
                <div className={cn("h-3 w-3 rounded-full border-2", digestFrequency === opt.value ? "border-zinc-800 bg-zinc-800" : "border-zinc-300")} />
                <div>
                  <p className="text-[12px] font-medium text-zinc-700">{opt.label}</p>
                  <p className="text-[10px] text-zinc-400">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Failure threshold & quiet hours */}
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-[12px] font-semibold text-zinc-700">Failure Threshold</span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2">Escalate after N consecutive failures</p>
            <div className="flex items-center gap-2">
              <select value={failureThreshold} onChange={(e) => setFailureThreshold(e.target.value)} className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[12px] text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400/30">
                <option value="1">1 failure</option>
                <option value="3">3 failures</option>
                <option value="5">5 failures</option>
                <option value="10">10 failures</option>
              </select>
              <span className="text-[10px] text-zinc-400">in a row → escalate</span>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon size={14} className="text-indigo-400" />
                <span className="text-[12px] font-semibold text-zinc-700">Quiet Hours</span>
              </div>
              <button
                onClick={() => setQuietEnabled(!quietEnabled)}
                className={cn("relative w-8 h-4 rounded-full transition-colors", quietEnabled ? "bg-zinc-800" : "bg-zinc-200")}
              >
                <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all", quietEnabled ? "left-[16px]" : "left-0.5")} />
              </button>
            </div>
            {quietEnabled && (
              <div className="flex items-center gap-2 text-[12px]">
                <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className="rounded border border-zinc-200 px-2 py-1 text-[11px]" />
                <span className="text-zinc-400">to</span>
                <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className="rounded border border-zinc-200 px-2 py-1 text-[11px]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Webhook destination */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <Webhook size={14} className="text-zinc-400" />
          <span className="text-[12px] font-semibold text-zinc-700">Webhook Destination</span>
          <Badge variant="outline">Optional</Badge>
        </div>
        <p className="text-[11px] text-zinc-400 mb-3">Send notification events to an external endpoint (PagerDuty, Teams, custom).</p>
        <div className="flex items-center gap-2">
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.example.com/notify"
            className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400/30"
          />
          <Button variant="secondary" size="sm">Test</Button>
        </div>
      </div>

      {/* Channel matrix */}
      <div>
        <div className="flex items-center pb-2 mb-2" style={{ borderBottom: "1px solid #f4f4f5" }}>
          <div className="flex-1" />
          <div className="w-14 text-center text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
            <Mail size={10} className="mx-auto mb-0.5" />Email
          </div>
          <div className="w-14 text-center text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
            <Bell size={10} className="mx-auto mb-0.5" />In-App
          </div>
          <div className="w-14 text-center text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
            <MessageSquare size={10} className="mx-auto mb-0.5" />Slack
          </div>
          <div className="w-14 text-center text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
            <Webhook size={10} className="mx-auto mb-0.5" />Hook
          </div>
        </div>

        <div className="space-y-3">
          {channels.map((ch) => {
            const s = settings[ch.id];
            return (
              <div key={ch.id} className="flex items-center">
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-zinc-800">{ch.label}</p>
                  <p className="text-[11px] text-zinc-400">{ch.description}</p>
                </div>
                <div className="w-14 flex justify-center"><ToggleCheck checked={s.email} onChange={() => toggle(ch.id, "email")} /></div>
                <div className="w-14 flex justify-center"><ToggleCheck checked={s.inApp} onChange={() => toggle(ch.id, "inApp")} /></div>
                <div className="w-14 flex justify-center"><ToggleCheck checked={s.slack} onChange={() => toggle(ch.id, "slack")} /></div>
                <div className="w-14 flex justify-center"><ToggleCheck checked={s.webhook} onChange={() => toggle(ch.id, "webhook")} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md">Save Changes</Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
  );
}

function ToggleCheck({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "h-4 w-4 rounded border transition-all duration-150",
        checked
          ? "bg-zinc-800 border-zinc-800"
          : "bg-white border-zinc-200 hover:border-zinc-400"
      )}
    >
      {checked && (
        <svg viewBox="0 0 16 16" fill="white" className="h-4 w-4">
          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
        </svg>
      )}
    </button>
  );
}
