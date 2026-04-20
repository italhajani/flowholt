import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Github,
  Chrome,
  Smartphone,
  Shield,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Link2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile, useUpdateProfile } from "@/hooks/useApi";

const timezones = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai",
  "Asia/Kolkata", "Australia/Sydney",
];

interface ConnectedAccount {
  id: string;
  provider: string;
  icon: React.ElementType;
  email?: string;
  connected: boolean;
  connectedAt?: string;
}

const connectedAccounts: ConnectedAccount[] = [
  { id: "github", provider: "GitHub", icon: Github, email: "gouhar@github.com", connected: true, connectedAt: "Jan 2024" },
  { id: "google", provider: "Google", icon: Chrome, email: "gouhar@gmail.com", connected: true, connectedAt: "Feb 2024" },
];

export function ProfileSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateMut = useUpdateProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [bio, setBio] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setTimezone(profile.timezone);
      setBio(profile.bio);
    }
  }, [profile]);

  const profileUrl = `https://flowholt.com/@${profile?.name?.toLowerCase().replace(/\s+/g, "") ?? "user"}`;

  const handleSave = () => {
    updateMut.mutate({ name, bio, timezone }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Profile</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Your personal information and public profile.</p>

      <div className="mt-6 space-y-5 max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-500 text-[20px] font-semibold ring-2 ring-white shadow-sm">
            GA
          </div>
          <div>
            <Button variant="secondary" size="sm">Change avatar</Button>
            <p className="text-[11px] text-zinc-400 mt-1">JPG, PNG or GIF. 1MB max.</p>
          </div>
        </div>

        <SettingsField label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </SettingsField>

        <SettingsField label="Email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <p className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
            <Check size={10} /> Verified
          </p>
        </SettingsField>

        <SettingsField label="Username">
          <Input value="gouhar" disabled />
          <p className="text-[11px] text-zinc-400 mt-1">Username cannot be changed.</p>
        </SettingsField>

        <SettingsField label="Timezone">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
            ))}
          </select>
        </SettingsField>

        <SettingsField label="Bio">
          <textarea
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all resize-none"
            rows={3}
            placeholder="A short bio about yourself…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </SettingsField>

        <div className="flex items-center gap-3 pt-2">
          <Button size="sm" onClick={handleSave} disabled={updateMut.isPending}>
            {updateMut.isPending ? <><Loader2 size={12} className="animate-spin mr-1" />Saving…</> : saved ? <><Check size={12} className="mr-1" />Saved</> : "Save changes"}
          </Button>
          {isLoading && <span className="text-[11px] text-zinc-400">Loading profile…</span>}
        </div>

        {/* Public profile URL */}
        <SettingsField label="Public profile URL">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
              <Globe size={13} className="text-zinc-400 flex-shrink-0" />
              <span className="text-[12px] text-zinc-600 font-mono truncate">{profileUrl}</span>
            </div>
            <button
              onClick={copyUrl}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all"
              title="Copy URL"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all"
              title="Open profile"
            >
              <ExternalLink size={13} />
            </button>
          </div>
        </SettingsField>
      </div>

      {/* Connected Accounts */}
      <div className="mt-8 max-w-lg">
        <h3 className="text-[14px] font-semibold text-zinc-800 mb-1">Connected Accounts</h3>
        <p className="text-[12px] text-zinc-400 mb-4">Link external accounts for SSO and integrations.</p>

        <div className="space-y-2">
          {connectedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3 shadow-xs"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50">
                <acc.icon size={16} className="text-zinc-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-zinc-800">{acc.provider}</p>
                <p className="text-[11px] text-zinc-400">
                  {acc.connected ? `${acc.email} · Connected ${acc.connectedAt}` : "Not connected"}
                </p>
              </div>
              {acc.connected ? (
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Disconnect</Button>
              ) : (
                <Button variant="secondary" size="sm">Connect</Button>
              )}
            </div>
          ))}

          {/* Connect new */}
          <button className="flex w-full items-center gap-3 rounded-lg border border-dashed border-zinc-200 px-4 py-3 text-[12px] text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 transition-all">
            <Link2 size={14} />
            Connect another account…
          </button>
        </div>
      </div>

      {/* Authentication Methods */}
      <div className="mt-8 max-w-lg">
        <h3 className="text-[14px] font-semibold text-zinc-800 mb-1">Authentication</h3>
        <p className="text-[12px] text-zinc-400 mb-4">How you sign in to FlowHolt.</p>

        <div className="space-y-2">
          <AuthMethodRow
            icon={Shield}
            title="Password"
            description="Set a password for email/password login"
            status="configured"
            actionLabel="Change password"
          />
          <AuthMethodRow
            icon={Smartphone}
            title="Two-factor authentication"
            description="Add an extra layer of security"
            status="enabled"
            actionLabel="Manage"
          />
        </div>
      </div>

      {/* Save */}
      <div className="mt-8 pt-4 flex items-center gap-3 max-w-lg" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md">Save Changes</Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
  );
}

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function AuthMethodRow({
  icon: Icon,
  title,
  description,
  status,
  actionLabel,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  status: "configured" | "enabled" | "not_set";
  actionLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3 shadow-xs">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 flex-shrink-0">
        <Icon size={16} className="text-zinc-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-zinc-800">{title}</p>
          {status === "enabled" && (
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
              Enabled
            </span>
          )}
        </div>
        <p className="text-[11px] text-zinc-400">{description}</p>
      </div>
      <Button variant="secondary" size="sm">{actionLabel}</Button>
    </div>
  );
}
