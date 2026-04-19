import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotifChannel {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
  slack: boolean;
}

const channels: NotifChannel[] = [
  { id: "execFail", label: "Execution failures", description: "When a workflow run fails.", email: true, inApp: true, slack: true },
  { id: "execSuccess", label: "Execution success", description: "When a workflow completes successfully.", email: false, inApp: true, slack: false },
  { id: "vaultExpiry", label: "Credential expiry", description: "When a credential is about to expire.", email: true, inApp: true, slack: true },
  { id: "connHealth", label: "Connection health", description: "When a connection becomes unhealthy.", email: true, inApp: true, slack: false },
  { id: "teamInvite", label: "Team invitations", description: "When you're invited to a team or workspace.", email: true, inApp: true, slack: false },
  { id: "mentions", label: "Mentions", description: "When someone mentions you in a comment.", email: false, inApp: true, slack: false },
  { id: "security", label: "Security alerts", description: "Login from new device, password changes.", email: true, inApp: true, slack: false },
];

export function NotificationSettings() {
  const [settings, setSettings] = useState<Record<string, NotifChannel>>(
    Object.fromEntries(channels.map((c) => [c.id, { ...c }]))
  );

  const toggle = (id: string, field: "email" | "inApp" | "slack") => {
    setSettings((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: !prev[id][field] },
    }));
  };

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Notifications</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Choose how you want to be notified.</p>

      <div className="mt-6">
        {/* Header row */}
        <div className="flex items-center pb-2 mb-2" style={{ borderBottom: "1px solid #f4f4f5" }}>
          <div className="flex-1" />
          <div className="w-16 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Email</div>
          <div className="w-16 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">In-App</div>
          <div className="w-16 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Slack</div>
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {channels.map((ch) => {
            const s = settings[ch.id];
            return (
              <div key={ch.id} className="flex items-center">
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-zinc-800">{ch.label}</p>
                  <p className="text-[11px] text-zinc-400">{ch.description}</p>
                </div>
                <div className="w-16 flex justify-center">
                  <ToggleCheck checked={s.email} onChange={() => toggle(ch.id, "email")} />
                </div>
                <div className="w-16 flex justify-center">
                  <ToggleCheck checked={s.inApp} onChange={() => toggle(ch.id, "inApp")} />
                </div>
                <div className="w-16 flex justify-center">
                  <ToggleCheck checked={s.slack} onChange={() => toggle(ch.id, "slack")} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
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
