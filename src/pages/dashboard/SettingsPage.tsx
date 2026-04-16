import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Bell,
  Bot,
  Check,
  Copy,
  Globe,
  Info,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Plus,
  Shield,
  Sliders,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import {
  api,
  getCachedSession,
  type ApiLlmStatus,
  type ApiWorkspaceMember,
  type ApiWorkspaceRole,
  type ApiWorkspaceSettings,
} from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableLoader } from "@/components/dashboard/DashboardRouteLoader";

/* --- types --- */
type SettingsTab = "general" | "members" | "security" | "execution" | "notifications";

const navSections: Array<{
  group: string;
  items: Array<{ id: SettingsTab; label: string; icon: React.ElementType }>;
}> = [
  {
    group: "Workspace",
    items: [
      { id: "general", label: "General", icon: Globe },
      { id: "members", label: "Members", icon: Users },
      { id: "security", label: "Security & Access", icon: Shield },
      { id: "execution", label: "Execution", icon: Zap },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Tokyo", "Asia/Shanghai",
  "Asia/Kolkata", "Asia/Dubai", "Australia/Sydney", "Pacific/Auckland",
];

const MEMBER_ROLE_ORDER: Record<string, number> = {
  owner: 0,
  admin: 1,
  builder: 2,
  viewer: 3,
};

const MEMBER_STATUS_ORDER: Record<string, number> = {
  active: 0,
  invited: 1,
};

const sortWorkspaceMembers = (items: ApiWorkspaceMember[]) => (
  [...items].sort((left, right) => {
    const roleDelta = (MEMBER_ROLE_ORDER[left.role] ?? 99) - (MEMBER_ROLE_ORDER[right.role] ?? 99);
    if (roleDelta !== 0) return roleDelta;
    const statusDelta = (MEMBER_STATUS_ORDER[left.status] ?? 99) - (MEMBER_STATUS_ORDER[right.status] ?? 99);
    if (statusDelta !== 0) return statusDelta;
    return left.name.localeCompare(right.name);
  })
);

const EDITABLE_MEMBER_ROLES: Array<{ value: Exclude<ApiWorkspaceRole, "owner">; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "builder", label: "Builder" },
  { value: "viewer", label: "Viewer" },
];

/* --- shared UI primitives --- */

const Toggle: React.FC<{ enabled: boolean; onChange?: (v: boolean) => void; size?: "sm" | "md" }> = ({ enabled, onChange, size = "md" }) => {
  const w = size === "sm" ? "w-9" : "w-11";
  const h = size === "sm" ? "h-5" : "h-6";
  const dot = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const onPos = size === "sm" ? "left-[18px]" : "left-[22px]";
  return (
    <button type="button" role="switch" aria-checked={enabled} onClick={() => onChange?.(!enabled)}
      className={cn("relative cursor-pointer rounded-full transition-colors", w, h, enabled ? "bg-[#0f766e]" : "bg-slate-300")}>
      <span className={cn("absolute top-0.5 rounded-full bg-white shadow-sm transition-all", dot, enabled ? onPos : "left-[2px]")} />
    </button>
  );
};

const FieldLabel: React.FC<React.PropsWithChildren<{ hint?: string }>> = ({ children, hint }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[13px] font-semibold text-[#1a1a2e]">{children}</span>
    {hint && (
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-slate-400 hover:text-slate-600">
            <Info size={10} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] rounded-xl border-slate-900 bg-slate-900 px-3 py-2 text-[11px] leading-[18px] text-white shadow-xl">{hint}</TooltipContent>
      </Tooltip>
    )}
  </div>
);

const FieldDescription: React.FC<React.PropsWithChildren> = ({ children }) => (
  <p className="mt-1 text-[12px] leading-[18px] text-slate-500">{children}</p>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={cn("mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-200", props.className)} />
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: Array<{ value: string; label: string }> }> = ({ options, ...props }) => (
  <select {...props} className={cn("mt-2 h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] text-slate-800 outline-none transition-colors focus:border-slate-400", props.className)}>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Btn: React.FC<React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "danger" | "ghost" }>> = ({ variant = "default", children, className, ...props }) => (
  <button type="button" {...props}
    className={cn(
      "inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium transition-colors disabled:opacity-50",
      variant === "default" && "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      variant === "primary" && "bg-[#0f766e] text-white hover:bg-[#0e6b63]",
      variant === "danger" && "border border-red-200 bg-white text-red-600 hover:bg-red-50",
      variant === "ghost" && "text-slate-600 hover:bg-slate-100",
      className,
    )}>
    {children}
  </button>
);

const InfoBanner: React.FC<React.PropsWithChildren<{ variant?: "blue" | "amber" | "green" }>> = ({ children, variant = "blue" }) => (
  <div className={cn(
    "flex items-start gap-3 rounded-xl border px-4 py-3.5",
    variant === "blue" && "border-blue-100 bg-blue-50/60 text-blue-800",
    variant === "amber" && "border-amber-100 bg-amber-50/60 text-amber-800",
    variant === "green" && "border-emerald-100 bg-emerald-50/60 text-emerald-800",
  )}>
    <Info size={16} className="mt-0.5 shrink-0 opacity-60" />
    <div className="text-[12px] leading-[20px]">{children}</div>
  </div>
);

const Divider: React.FC<{ className?: string }> = ({ className }) => <hr className={cn("border-slate-100", className)} />;

const Section: React.FC<React.PropsWithChildren<{ title?: string; description?: string; className?: string }>> = ({ children, className }) => (
  <section className={cn("space-y-5", className)}>{children}</section>
);

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>{children}</div>
);

const ToggleCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}> = ({ icon: Icon, title, description, enabled, onChange }) => (
  <div className={cn("flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors", enabled ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white")}>
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[13px] font-semibold text-[#1a1a2e]">{title}</div>
      <div className="mt-0.5 text-[12px] leading-[18px] text-slate-500">{description}</div>
    </div>
    <Toggle enabled={enabled} onChange={onChange} />
  </div>
);

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; color?: string }> = ({ label, value, icon: Icon, color = "bg-slate-100 text-slate-600" }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", color)}>
      <Icon size={16} />
    </div>
    <div>
      <div className="text-[20px] font-bold text-[#1a1a2e]">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  </div>
);

const RangeSlider: React.FC<{
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}> = ({ label, description, value, min, max, step, unit, onChange }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    {description && <FieldDescription>{description}</FieldDescription>}
    <div className="mt-3 flex items-center gap-4">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#0f766e] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0f766e] [&::-webkit-slider-thumb]:shadow" />
      <div className="flex h-9 w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[13px] font-medium text-slate-700">
        {value} {unit}
      </div>
    </div>
  </div>
);

const SegmentedControl: React.FC<{
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => (
  <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
    {options.map((o) => (
      <button key={o.value} type="button" onClick={() => onChange(o.value)}
        className={cn("rounded-md px-4 py-2 text-[12px] font-medium transition-colors", value === o.value ? "bg-white text-[#1a1a2e] shadow-sm" : "text-slate-500 hover:text-slate-700")}>
        {o.label}
      </button>
    ))}
  </div>
);

/* --- page component --- */

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getCachedSession();
  const canManageMembers = session?.workspace.role === "owner" || session?.workspace.role === "admin";
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [settings, setSettings] = useState<ApiWorkspaceSettings | null>(null);
  const [members, setMembers] = useState<ApiWorkspaceMember[]>([]);
  const [llmStatus, setLlmStatus] = useState<ApiLlmStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingMemberRemoval, setPendingMemberRemoval] = useState<ApiWorkspaceMember | null>(null);
  const [memberRemovalPending, setMemberRemovalPending] = useState(false);
  const [pendingMemberRoleUserId, setPendingMemberRoleUserId] = useState<string | null>(null);
  const [webhookSecretDialogOpen, setWebhookSecretDialogOpen] = useState(false);
  const [webhookSecretDraft, setWebhookSecretDraft] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Exclude<ApiWorkspaceRole, "owner">>("builder");
  const [invitePending, setInvitePending] = useState(false);

  /* field edit state */
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getWorkspaceSettings().catch(() => null),
      api.getWorkspaceMembers().catch(() => []),
      api.getLlmStatus().catch(() => null),
    ]).then(([ws, wm, st]) => {
      if (!active) return;
      if (ws) setSettings(ws);
      setMembers(sortWorkspaceMembers(wm as ApiWorkspaceMember[]));
      if (st) setLlmStatus(st);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  }, []);

  const saveSettings = useCallback(async (patch: Record<string, unknown>) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await api.updateWorkspaceSettings(patch);
      setSettings(updated);
      flash("Settings saved.");
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save settings.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [flash]);

  const handleSaveWebhookSecret = useCallback(async () => {
    const secret = webhookSecretDraft.trim();
    if (!secret) { setError("Signing secret is required."); return; }
    const ok = await saveSettings({ webhook_signing_secret: secret });
    if (ok) { setWebhookSecretDialogOpen(false); setWebhookSecretDraft(""); }
  }, [saveSettings, webhookSecretDraft]);

  const handleRemoveMember = useCallback(async () => {
    if (!pendingMemberRemoval) return;
    try {
      setMemberRemovalPending(true);
      await api.removeWorkspaceMember(pendingMemberRemoval.user_id);
      setMembers((cur) => cur.filter((m) => m.user_id !== pendingMemberRemoval.user_id));
      flash(pendingMemberRemoval.status === "invited" ? "Invite cancelled." : "Member removed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to remove member.");
    } finally {
      setMemberRemovalPending(false);
      setPendingMemberRemoval(null);
    }
  }, [pendingMemberRemoval, flash]);

  const handleInviteMember = useCallback(async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    try {
      setInvitePending(true);
      setError(null);
      const invited = await api.inviteWorkspaceMember(email, inviteRole);
      setMembers((current) => sortWorkspaceMembers([...current, invited]));
      setInviteEmail("");
      setInviteRole("builder");
      flash(invited.status === "invited" ? "Invite created." : "Member added to workspace.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to invite member.");
    } finally {
      setInvitePending(false);
    }
  }, [flash, inviteEmail, inviteRole]);

  const handleUpdateMemberRole = useCallback(async (member: ApiWorkspaceMember, role: Exclude<ApiWorkspaceRole, "owner">) => {
    if (member.role === role) return;
    try {
      setPendingMemberRoleUserId(member.user_id);
      setError(null);
      const updated = await api.updateWorkspaceMemberRole(member.user_id, role);
      setMembers((current) => sortWorkspaceMembers(current.map((item) => item.user_id === member.user_id ? updated : item)));
      flash(member.status === "invited" ? "Invite role updated." : "Member role updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to update member role.");
    } finally {
      setPendingMemberRoleUserId(null);
    }
  }, [flash]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => flash("Copied!")).catch(() => {});
  }, [flash]);

  if (loading) return <TableLoader titleWidth="220px" />;

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-full bg-background">
        <div className="grid min-h-full grid-cols-[260px_minmax(0,1fr)]">
          {/* --- left nav --- */}
          <aside className="border-r border-slate-200 bg-white px-4 py-6">
            <div className="px-3 pb-6">
              <h1 className="text-[20px] font-bold tracking-tight text-[#1a1a2e]">Settings</h1>
              <p className="mt-1 text-[12px] text-slate-500">Manage your workspace</p>
            </div>
            <nav className="space-y-6">
              {navSections.map((section) => (
                <div key={section.group}>
                  <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{section.group}</div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                          activeTab === item.id ? "bg-slate-100 font-semibold text-[#1a1a2e]" : "text-slate-600 hover:bg-slate-50 hover:text-[#1a1a2e]",
                        )}>
                        <item.icon size={16} className={activeTab === item.id ? "text-[#0f766e]" : "text-slate-400"} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* --- main content --- */}
          <main className="overflow-y-auto px-10 py-8">
            <div className="mx-auto max-w-[720px]">
              {(notice || error) && (
                <div className="pb-6">
                  <div className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium",
                    notice ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                    {notice && <Check size={13} />}
                    {notice || error}
                  </div>
                </div>
              )}

              {/* GENERAL TAB */}
              {activeTab === "general" && (
                <div className="space-y-8">
                  {/* Workspace identity */}
                  <Section title="Workspace Identity" description="Configure how your workspace appears to team members.">
                    <div className="flex items-center gap-5">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[22px] font-bold text-slate-400">
                        {session?.workspace.name?.charAt(0)?.toUpperCase() ?? "W"}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#1a1a2e]">{session?.workspace.name ?? "My Workspace"}</div>
                        <div className="mt-0.5 text-[12px] text-slate-500">Workspace identity is sourced from the current workspace record.</div>
                      </div>
                    </div>

                    {/* Workspace name field (stacked) */}
                    <div>
                      <FieldLabel>Workspace name</FieldLabel>
                      <FieldDescription>This appears in the sidebar and team invitations.</FieldDescription>
                      <TextInput value={session?.workspace.name ?? ""} readOnly placeholder="My Workspace" />
                    </div>

                    {/* URL slug */}
                    <div>
                      <FieldLabel hint="Used in URLs when accessing your workspace.">URL slug</FieldLabel>
                      <FieldDescription>Your workspace URL: flowholt.app/<strong>{session?.workspace.slug ?? "my-workspace"}</strong></FieldDescription>
                      <TextInput value={session?.workspace.slug ?? ""} readOnly placeholder="my-workspace" />
                    </div>
                  </Section>

                  <Divider />

                  {/* Timezone */}
                  <Section title="Localization">
                    <div>
                      <FieldLabel hint="Affects schedule triggers and time-based workflow logic.">Timezone</FieldLabel>
                      <FieldDescription>All scheduled workflows and datetime operations will use this timezone.</FieldDescription>
                      <SelectField
                        value={settings?.timezone ?? "UTC"}
                        onChange={(e) => void saveSettings({ timezone: e.target.value })}
                        options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }))}
                      />
                    </div>
                  </Section>

                  <Divider />

                  {/* Public endpoints */}
                  <Section title="Public Endpoints" description="Control how external services reach your workspace.">
                    <div>
                      <FieldLabel>Public base URL</FieldLabel>
                      <FieldDescription>Used for callbacks, chat triggers, and webhook-facing links.</FieldDescription>
                      {editField === "public_base_url" ? (
                        <div className="mt-2 flex gap-2">
                          <TextInput value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="https://flows.example.com" className="mt-0" />
                          <Btn variant="primary" disabled={saving} onClick={() => { void saveSettings({ public_base_url: editValue.trim() || null }); setEditField(null); }}>
                            {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                          </Btn>
                          <Btn onClick={() => setEditField(null)}>Cancel</Btn>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex h-10 flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[13px] text-slate-600">
                            {settings?.public_base_url || "Not configured"}
                          </div>
                          <Btn onClick={() => { setEditField("public_base_url"); setEditValue(settings?.public_base_url || ""); }}>Edit</Btn>
                          {settings?.public_base_url && (
                            <Btn variant="ghost" onClick={() => copyToClipboard(settings.public_base_url!)}><Copy size={14} /></Btn>
                          )}
                        </div>
                      )}
                    </div>
                  </Section>
                </div>
              )}

              {/* MEMBERS TAB */}
              {activeTab === "members" && (
                <div className="space-y-8">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total members" value={members.length} icon={Users} color="bg-blue-50 text-blue-600" />
                    <StatCard label="Admins & owners" value={members.filter((m) => m.role === "admin" || m.role === "owner").length} icon={Shield} color="bg-purple-50 text-purple-600" />
                    <StatCard label="Pending invites" value={members.filter((m) => m.status === "invited").length} icon={Zap} color="bg-emerald-50 text-emerald-600" />
                  </div>

                  {/* Invite section */}
                  <Section title="Invite a Member" description="Send an invitation email to a new collaborator.">
                    <Card className="p-5">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <FieldLabel>Email address</FieldLabel>
                          <TextInput value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" type="email" />
                        </div>
                        <div className="w-40">
                          <FieldLabel>Role</FieldLabel>
                          <SelectField value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                            options={[
                              { value: "viewer", label: "Viewer" },
                              { value: "builder", label: "Builder" },
                              { value: "admin", label: "Admin" },
                            ]}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500">Existing users are added immediately. New emails stay pending until signup is completed.</p>
                        <Btn variant="primary" disabled={!inviteEmail.trim() || invitePending} onClick={() => void handleInviteMember()}>
                          <Plus size={14} /> {invitePending ? "Sending..." : "Send Invite"}
                        </Btn>
                      </div>
                    </Card>
                  </Section>

                  {/* Members list */}
                  <Section title="Workspace Members" description={`${members.length} member${members.length === 1 ? "" : "s"} or invites in this workspace.`}>
                    <Card>
                      {/* table header */}
                      <div className="grid grid-cols-[1fr_140px_90px_110px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <span>User</span>
                        <span>Role</span>
                        <span>Status</span>
                        <span />
                      </div>
                      {members.length === 0 ? (
                        <div className="py-12 text-center text-[13px] text-slate-400">No members found.</div>
                      ) : (
                        members.map((member) => (
                          <div key={member.user_id} className="grid grid-cols-[1fr_140px_90px_110px] items-center gap-4 border-b border-slate-50 px-5 py-3.5 last:border-b-0 hover:bg-slate-50/50">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[11px] font-bold text-slate-600">
                                {member.avatar_initials}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-[13px] font-medium text-[#1a1a2e]">{member.name}</div>
                                <div className="truncate text-[11px] text-slate-500">{member.email}</div>
                              </div>
                            </div>
                            {canManageMembers && member.role !== "owner" && member.user_id !== session?.user.id ? (
                              <SelectField
                                className="mt-0 h-9"
                                value={member.role}
                                disabled={pendingMemberRoleUserId === member.user_id || memberRemovalPending}
                                onChange={(e) => void handleUpdateMemberRole(member, e.target.value as Exclude<ApiWorkspaceRole, "owner">)}
                                options={EDITABLE_MEMBER_ROLES}
                              />
                            ) : (
                              <div>
                                <span className="inline-flex w-fit items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600">
                                  {member.role}
                                </span>
                                {member.user_id === session?.user.id && (
                                  <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">You</div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span className={cn("h-2 w-2 rounded-full", member.status === "active" ? "bg-emerald-400" : "bg-amber-400")} />
                              <span className="text-[12px] capitalize text-slate-600">{member.status}</span>
                            </div>
                            <div className="flex justify-end">
                              {canManageMembers && member.role !== "owner" && member.user_id !== session?.user.id && (
                                <button
                                  type="button"
                                  onClick={() => setPendingMemberRemoval(member)}
                                  disabled={memberRemovalPending || pendingMemberRoleUserId === member.user_id}
                                  className="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                >
                                  {member.status === "invited" ? "Cancel invite" : "Remove"}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </Card>
                  </Section>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  {/* Deployment approvals - toggle cards */}
                  <Section title="Deployment Approvals" description="Control how workflow promotions are reviewed before going live.">
                    <div className="space-y-3">
                      <ToggleCard
                        icon={Shield}
                        title="Require staging before production"
                        description="Workflows must be deployed to staging and tested before going to production."
                        enabled={settings?.require_staging_before_production ?? false}
                        onChange={(v) => void saveSettings({ require_staging_before_production: v })}
                      />
                      <ToggleCard
                        icon={Check}
                        title="Require staging approval"
                        description="Staging promotions go through a review queue before deployment."
                        enabled={settings?.require_staging_approval ?? false}
                        onChange={(v) => void saveSettings({ require_staging_approval: v })}
                      />
                      <ToggleCard
                        icon={Lock}
                        title="Require production approval"
                        description="Production deployments must be explicitly reviewed and approved."
                        enabled={settings?.require_production_approval ?? false}
                        onChange={(v) => void saveSettings({ require_production_approval: v })}
                      />
                      <ToggleCard
                        icon={Users}
                        title="Allow self-approval"
                        description="Permit the same person to request and approve their own deployment."
                        enabled={settings?.allow_self_approval ?? false}
                        onChange={(v) => void saveSettings({ allow_self_approval: v })}
                      />
                    </div>

                    {/* Approval role - stacked dropdown */}
                    <div className="mt-4">
                      <FieldLabel hint="Only users with this role or above can approve deployments.">Deployment approval role</FieldLabel>
                      <FieldDescription>Minimum workspace role required to approve deployment requests.</FieldDescription>
                      <SelectField
                        value={settings?.deployment_approval_min_role ?? "admin"}
                        onChange={(e) => void saveSettings({ deployment_approval_min_role: e.target.value })}
                        options={[
                          { value: "owner", label: "Owner only" },
                          { value: "admin", label: "Admin and above" },
                          { value: "builder", label: "Builder and above" },
                        ]}
                      />
                    </div>
                  </Section>

                  <Divider />

                  {/* Public access toggles */}
                  <Section title="Public Access" description="Manage which workflow surfaces are exposed publicly.">
                    <div className="space-y-3">
                      <ToggleCard icon={Globe} title="Allow public webhooks"
                        description="Accept webhook triggers without authentication from external callers."
                        enabled={settings?.allow_public_webhooks ?? true}
                        onChange={(v) => void saveSettings({ allow_public_webhooks: v })} />
                      <ToggleCard icon={Bot} title="Allow public chat triggers"
                        description="Expose published chat-trigger workflows on public URLs."
                        enabled={settings?.allow_public_chat_triggers ?? true}
                        onChange={(v) => void saveSettings({ allow_public_chat_triggers: v })} />
                    </div>
                  </Section>

                  <Divider />

                  {/* Webhook security */}
                  <Section title="Webhook Security" description="Verify incoming webhook requests with HMAC signatures.">
                    <ToggleCard icon={KeyRound} title="Require webhook signatures"
                      description="All incoming webhooks must include a valid HMAC signature header."
                      enabled={settings?.require_webhook_signature ?? false}
                      onChange={(v) => void saveSettings({ require_webhook_signature: v })} />

                    <Card className="mt-4 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[13px] font-semibold text-[#1a1a2e]">Signing Secret</div>
                          <div className="mt-0.5 text-[12px] text-slate-500">
                            {settings?.webhook_secret_configured
                              ? <span className="inline-flex items-center gap-1 text-emerald-600"><Check size={13} /> Configured</span>
                              : "Not configured yet"}
                          </div>
                        </div>
                        <Btn onClick={() => { setWebhookSecretDraft(""); setWebhookSecretDialogOpen(true); }}>
                          {settings?.webhook_secret_configured ? "Rotate" : "Set secret"}
                        </Btn>
                      </div>
                    </Card>
                  </Section>

                  <Divider />

                  {/* Role permissions - grid table */}
                  <Section title="Role Permissions" description="Minimum workspace role required for each action.">
                    <Card>
                      <div className="grid grid-cols-[1fr_160px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <span>Permission</span>
                        <span>Minimum Role</span>
                      </div>
                      {[
                        { key: "run_min_role", label: "Run workflows", desc: "Execute draft or published workflows" },
                        { key: "publish_min_role", label: "Publish workflows", desc: "Deploy to production environment" },
                        { key: "staging_min_role", label: "Stage workflows", desc: "Deploy to staging for testing" },
                        { key: "production_asset_min_role", label: "Production vault access", desc: "Access production-scoped vault assets" },
                      ].map((perm) => (
                        <div key={perm.key} className="grid grid-cols-[1fr_160px] items-center gap-4 border-b border-slate-50 px-5 py-4 last:border-b-0">
                          <div>
                            <div className="text-[13px] font-medium text-[#1a1a2e]">{perm.label}</div>
                            <div className="mt-0.5 text-[11px] text-slate-500">{perm.desc}</div>
                          </div>
                          <select
                            value={(settings as Record<string, unknown>)?.[perm.key] as string ?? "builder"}
                            onChange={(e) => void saveSettings({ [perm.key]: e.target.value })}
                            className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-[12px] text-slate-700 outline-none focus:border-slate-400">
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="builder">Builder</option>
                            {perm.key === "run_min_role" && <option value="viewer">Viewer</option>}
                          </select>
                        </div>
                      ))}
                    </Card>
                  </Section>
                </div>
              )}

              {/* EXECUTION TAB */}
              {activeTab === "execution" && (
                <div className="space-y-8">
                  <InfoBanner variant="blue">
                    Execution settings control how workflows run, how long they can take, and how execution data is stored.
                    Changes apply to all new workflow runs in this workspace.
                  </InfoBanner>

                  {/* Runtime status */}
                  <Section title="Runtime Status" description="Current provider and execution engine status.">
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard label="Configured provider" value={llmStatus?.configured_provider ?? "None"} icon={Bot} color="bg-blue-50 text-blue-600" />
                      <StatCard label="Execution mode" value={llmStatus?.execution_mode ?? "sync"} icon={Zap} color="bg-purple-50 text-purple-600" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(llmStatus?.available_providers ?? []).length > 0 ? (
                        (llmStatus?.available_providers ?? []).map((p) => (
                          <div key={p} className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-[12px] font-medium text-emerald-700">{p}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
                          No providers configured yet. <button type="button" onClick={() => navigate("/dashboard/credentials?tab=credentials&create=1")} className="font-medium text-[#0f766e] underline">Set up providers</button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                        <span className={cn("h-2 w-2 rounded-full", llmStatus?.worker_active ? "bg-emerald-400" : "bg-slate-300")} />
                        <span className="text-[12px] text-slate-600">Worker {llmStatus?.worker_active ? "active" : "inactive"}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                        <span className={cn("h-2 w-2 rounded-full", llmStatus?.scheduler_active ? "bg-emerald-400" : "bg-slate-300")} />
                        <span className="text-[12px] text-slate-600">Scheduler {llmStatus?.scheduler_active ? "active" : "inactive"}</span>
                      </div>
                    </div>
                  </Section>

                  <Divider />

                  {/* Timeout slider */}
                  <Section title="Timeout & Concurrency">
                    <RangeSlider
                      label="Execution timeout"
                      description="Maximum time a single workflow execution can run before being cancelled."
                      value={settings?.execution_timeout_seconds ?? 3600}
                      min={60} max={7200} step={60} unit="sec"
                      onChange={(v) => void saveSettings({ execution_timeout_seconds: v })}
                    />
                    <RangeSlider
                      label="Max concurrent executions"
                      description="Maximum number of workflow executions that can run simultaneously."
                      value={settings?.max_concurrent_executions ?? 10}
                      min={1} max={50} step={1} unit=""
                      onChange={(v) => void saveSettings({ max_concurrent_executions: v })}
                    />
                  </Section>

                  <Divider />

                  {/* Data retention toggles */}
                  <Section title="Data Retention" description="Control what execution data is saved.">
                    <Card className="p-5">
                      <FieldLabel hint="These defaults apply unless a workflow overrides them in Studio.">Execution history defaults</FieldLabel>
                      <FieldDescription>Split retention from save policy so builders can keep only the runs that matter.</FieldDescription>
                      <div className="mt-4 grid gap-5 md:grid-cols-2">
                        <div>
                          <FieldLabel>Successful runs</FieldLabel>
                          <FieldDescription>Choose whether successful runs remain in execution history.</FieldDescription>
                          <SegmentedControl
                            value={settings?.save_successful_executions ?? "all"}
                            options={[
                              { value: "all", label: "Keep all" },
                              { value: "none", label: "Do not keep" },
                            ]}
                            onChange={(v) => void saveSettings({
                              save_successful_executions: v,
                              save_execution_data: v === "all" || (settings?.save_failed_executions ?? "all") === "all",
                            })}
                          />
                        </div>
                        <div>
                          <FieldLabel>Failed runs</FieldLabel>
                          <FieldDescription>Keep failures for debugging, or suppress them entirely.</FieldDescription>
                          <SegmentedControl
                            value={settings?.save_failed_executions ?? "all"}
                            options={[
                              { value: "all", label: "Keep all" },
                              { value: "none", label: "Do not keep" },
                            ]}
                            onChange={(v) => void saveSettings({
                              save_failed_executions: v,
                              save_execution_data: v === "all" || (settings?.save_successful_executions ?? "all") === "all",
                            })}
                          />
                        </div>
                      </div>
                    </Card>
                    <ToggleCard icon={Zap} title="Keep manual runs"
                      description="Store manual test runs launched from Studio so builders can inspect them later."
                      enabled={settings?.save_manual_executions ?? true}
                      onChange={(v) => void saveSettings({ save_manual_executions: v })} />
                    <ToggleCard icon={Copy} title="Save execution progress"
                      description="Keep intermediate progress snapshots so long-running runs can be inspected step by step."
                      enabled={settings?.save_execution_progress ?? false}
                      onChange={(v) => void saveSettings({ save_execution_progress: v })} />
                    <ToggleCard icon={Shield} title="Redact execution payloads"
                      description="Mask workflow inputs and outputs in saved execution history to reduce sensitive data exposure."
                      enabled={settings?.redact_execution_payloads ?? false}
                      onChange={(v) => void saveSettings({ redact_execution_payloads: v })} />
                    <RangeSlider
                      label="Execution retention"
                      description="Choose how long saved execution history should remain available before cleanup."
                      value={settings?.execution_data_retention_days ?? 14}
                      min={1} max={90} step={1} unit="days"
                      onChange={(v) => void saveSettings({ execution_data_retention_days: v })}
                    />
                  </Section>

                  <Divider />

                  {/* Log level segmented control */}
                  <Section title="Logging">
                    <div>
                      <FieldLabel hint="Affects the verbosity of backend logs for this workspace.">Log level</FieldLabel>
                      <FieldDescription>Higher verbosity helps with debugging but increases log volume.</FieldDescription>
                      <SegmentedControl
                        value={settings?.log_level ?? "info"}
                        options={[
                          { value: "error", label: "Error" },
                          { value: "warn", label: "Warn" },
                          { value: "info", label: "Info" },
                          { value: "debug", label: "Debug" },
                        ]}
                        onChange={(v) => void saveSettings({ log_level: v })}
                      />
                    </div>
                  </Section>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-8">
                  {/* Master toggle */}
                  <Card className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Mail size={22} />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-[#1a1a2e]">Email Delivery</div>
                        <div className="mt-0.5 text-[12px] text-slate-500">Send email copies of workspace alerts when backend SMTP is configured.</div>
                      </div>
                    </div>
                    <Toggle enabled={settings?.email_notifications_enabled ?? false} onChange={(v) => void saveSettings({ email_notifications_enabled: v })} />
                  </Card>

                  {/* Notification categories */}
                  <Section title="Notification Categories" description="Choose which events create workspace alerts in the notification bell.">
                    <div className="space-y-3">
                      <ToggleCard icon={Zap} title="Workflow failures"
                        description="Notify the initiator and workspace admins when a workflow execution fails."
                        enabled={settings?.notify_on_failure ?? true}
                        onChange={(v) => void saveSettings({ notify_on_failure: v })} />
                      <ToggleCard icon={Check} title="Workflow successes"
                        description="Notify the initiator when a workflow execution completes successfully."
                        enabled={settings?.notify_on_success ?? false}
                        onChange={(v) => void saveSettings({ notify_on_success: v })} />
                      <ToggleCard icon={Users} title="Approval requests"
                        description="Notify eligible reviewers when a workflow requests staging or production approval."
                        enabled={settings?.notify_on_approval_requests ?? true}
                        onChange={(v) => void saveSettings({ notify_on_approval_requests: v })} />
                    </div>
                  </Section>

                  <Divider />

                  <Section title="Delivery Policy">
                    <InfoBanner variant="blue">
                      Enabled categories now create real in-app alerts in the workspace notification bell. Turning on email delivery sends matching SMTP-based copies to recipient members when the backend has SMTP configured.
                    </InfoBanner>
                    <div className="flex flex-wrap gap-2">
                      <Btn onClick={() => navigate("/dashboard/executions")}>Open Executions</Btn>
                      <Btn onClick={() => navigate("/dashboard/audit")}>Open Audit Log</Btn>
                    </div>
                  </Section>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* --- dialogs --- */}
      <AlertDialog open={pendingMemberRemoval != null} onOpenChange={(o) => { if (!o && !memberRemovalPending) setPendingMemberRemoval(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingMemberRemoval?.status === "invited" ? "Cancel workspace invite?" : "Remove workspace member?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMemberRemoval
                ? pendingMemberRemoval.status === "invited"
                  ? `Cancel the pending invite for ${pendingMemberRemoval.email}? They will no longer be able to join with this invite.`
                  : `Remove ${pendingMemberRemoval.name} from this workspace? They will lose access immediately.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={memberRemovalPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={memberRemovalPending} onClick={(e) => { e.preventDefault(); void handleRemoveMember(); }} className="bg-red-600 hover:bg-red-700">
              {memberRemovalPending ? (pendingMemberRemoval?.status === "invited" ? "Cancelling..." : "Removing...") : (pendingMemberRemoval?.status === "invited" ? "Cancel invite" : "Remove member")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={webhookSecretDialogOpen} onOpenChange={setWebhookSecretDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{settings?.webhook_secret_configured ? "Rotate signing secret" : "Set signing secret"}</DialogTitle>
            <DialogDescription>Store the HMAC secret used to verify incoming webhook signatures.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <FieldLabel>Signing secret</FieldLabel>
            <input type="password" value={webhookSecretDraft} onChange={(e) => setWebhookSecretDraft(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-slate-400" placeholder="whsec_..." />
          </div>
          <DialogFooter>
            <Btn onClick={() => setWebhookSecretDialogOpen(false)} disabled={saving}>Cancel</Btn>
            <Btn variant="primary" onClick={() => void handleSaveWebhookSecret()} disabled={saving}>
              {saving ? "Saving..." : settings?.webhook_secret_configured ? "Rotate secret" : "Save secret"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default SettingsPage;
