import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bell,
  Bot,
  Check,
  ChevronDown,
  CreditCard,
  Cpu,
  Database,
  Ellipsis,
  Eye,
  EyeOff,
  FileCode2,
  Globe,
  Shield,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

type SettingsTab = "general" | "notifications" | "models" | "limits" | "security" | "members" | "roles" | "billing" | "retention" | "webhooks";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing plans", icon: CreditCard },
  { id: "security", label: "Login & security", icon: Shield },
  { id: "members", label: "Members", icon: Users },
  { id: "roles", label: "User roles", icon: Users },
  { id: "models", label: "Providers & models", icon: Bot },
  { id: "limits", label: "Limits", icon: Cpu },
  { id: "retention", label: "Data retention", icon: Database },
  { id: "webhooks", label: "Developer webhooks", icon: FileCode2 },
];

const members = [
  { name: "Ital Hajani", email: "italhajani@gmail.com", role: "Owner", status: "Active" },
  { name: "Sarah Chen", email: "sarah@flowholt.com", role: "Admin", status: "Active" },
  { name: "David Kim", email: "david@flowholt.com", role: "Deployer", status: "Pending" },
];

const roleRows = [
  ["Owner", "Full workspace control including billing and production access."],
  ["Admin", "Can manage members, providers, and deployment policies."],
  ["Deployer", "Can publish flows and inspect production executions."],
  ["Builder", "Can create and edit workflows without org-level controls."],
];

const webhookRows = [
  ["run.success", "https://api.yourdomain.com/v1/flow-trigger", "Healthy"],
  ["run.failed", "https://ops.yourdomain.com/slack-alert", "Failing"],
];

const SettingsRow: React.FC<{
  label: string;
  value?: React.ReactNode;
  action?: React.ReactNode;
  description?: string;
}> = ({ label, value, action, description }) => (
  <div className="py-5 border-b border-slate-200 last:border-b-0">
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-slate-900">{label}</div>
        {description && <div className="text-[13px] text-slate-500 mt-1">{description}</div>}
        {value && <div className="text-[13px] text-slate-700 mt-2 leading-6">{value}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </div>
);

const SmallButton: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <button className={cn("h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors", className)}>
    {children}
  </button>
);

const Toggle: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className={cn("w-11 h-6 rounded-full relative border transition-colors", enabled ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-300")}>
    <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", enabled ? "left-[22px]" : "left-[2px]")} />
  </div>
);

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [showModelKey, setShowModelKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  return (
    <div className="p-8 max-w-[1440px] mx-auto animate-fade-in pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Settings</h1>
        <button className="h-10 px-5 rounded-lg bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors">
          Save changes
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden">
        <div className="grid grid-cols-[240px_minmax(0,1fr)] min-h-[760px]">
          <aside className="border-r border-slate-200 bg-slate-50/40 px-5 py-6">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-xl text-[14px] transition-colors",
                    activeTab === tab.id ? "bg-blue-50 text-[#103b71] font-semibold" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="px-8 py-7">
            {activeTab === "general" && (
              <div>
                <div className="flex items-start justify-between gap-6 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[linear-gradient(135deg,#f8c6cd,#f6e2b7)] flex items-center justify-center text-[18px] font-semibold text-slate-700">
                      FH
                    </div>
                    <div>
                      <div className="text-[16px] font-semibold text-slate-900">FlowHolt Ops</div>
                      <div className="text-[13px] text-slate-500 mt-1">Workspace profile and operating preferences.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SmallButton className="w-8 px-0 text-rose-500"><Trash2 size={14} className="mx-auto" /></SmallButton>
                    <SmallButton><span className="inline-flex items-center gap-2"><Upload size={13} /> Upload</span></SmallButton>
                  </div>
                </div>

                <SettingsRow label="Workspace name" value="FlowHolt Ops" action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow label="Contact" value={<><div>Phone: +1 231 232 17923</div><div>Email: ops@flowholt.com</div></>} action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow label="Brand domain" value="app.flowholt.ai" action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow label="Language & currency" value="English, USD" action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow
                  label="Timezone"
                  value="GMT+5 Pakistan Standard Time"
                  action={
                    <button className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 inline-flex items-center gap-2">
                      <span>Timezone</span>
                      <ChevronDown size={14} />
                    </button>
                  }
                />
                <SettingsRow
                  label="Workspace integration"
                  value="Google • examplemail@gmail.com"
                  action={
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-medium">
                        <Check size={12} /> Connected
                      </span>
                      <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                        <Ellipsis size={14} />
                      </button>
                    </div>
                  }
                />
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-[22px] font-bold text-slate-900">Notifications</div>
                  <div className="text-[14px] text-slate-500 mt-1">Choose what your team should hear about and how those alerts are delivered.</div>
                </div>
                <SettingsRow label="Workflow failures" description="Email and in-app alerts for failed runs or retries." action={<Toggle enabled={true} />} />
                <SettingsRow label="Deployment updates" description="Notify owners when live workflow versions change." action={<Toggle enabled={true} />} />
                <SettingsRow label="Budget warnings" description="Alert when task or provider spend crosses threshold limits." action={<Toggle enabled={false} />} />
                <SettingsRow label="Digest frequency" value="Daily summary at 9:00 AM" action={<SmallButton>Edit</SmallButton>} />
              </div>
            )}

            {activeTab === "billing" && (
              <div>
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-[22px] font-bold text-slate-900">Billing plans</div>
                  <div className="text-[14px] text-slate-500 mt-1">Keep plan details, renewal info, and payment methods in one place.</div>
                </div>
                <SettingsRow label="Current plan" value="Scale plan • Renews on April 12, 2026" action={<SmallButton>Change</SmallButton>} />
                <SettingsRow label="Task volume" value="18.4k of 30k used this cycle" />
                <SettingsRow label="AI budget" value="$412 of $750 used" />
                <SettingsRow label="Payment method" value="Visa ending in 4242 • Expires 11 / 28" action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow label="Invoice history" value="3 invoices available for download" action={<SmallButton>View</SmallButton>} />
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-[22px] font-bold text-slate-900">Login & security</div>
                  <div className="text-[14px] text-slate-500 mt-1">Protect workspace access with stronger authentication and access controls.</div>
                </div>
                <SettingsRow label="Two-factor authentication" description="Require additional verification for owners and admins." action={<Toggle enabled={true} />} />
                <SettingsRow label="Single sign-on" description="Use SAML SSO for company-wide access management." action={<Toggle enabled={false} />} />
                <SettingsRow label="IP allowlist" description="Restrict login to trusted office or VPN ranges." action={<Toggle enabled={true} />} />
                <SettingsRow label="Active session" value="Chrome on Windows • Karachi, PK" action={<SmallButton>Review</SmallButton>} />
              </div>
            )}

            {activeTab === "members" && (
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                  <div>
                    <div className="text-[22px] font-bold text-slate-900">Members</div>
                    <div className="text-[14px] text-slate-500 mt-1">Invite teammates and manage who can access your workspace.</div>
                  </div>
                  <SmallButton>Invite member</SmallButton>
                </div>
                <div className="divide-y divide-slate-200">
                  {members.map((member) => (
                    <div key={member.email} className="py-5 flex items-start justify-between gap-6">
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900">{member.name}</div>
                        <div className="text-[13px] text-slate-500 mt-1">{member.email}</div>
                        <div className="text-[13px] text-slate-700 mt-2">{member.role}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", member.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                          {member.status}
                        </span>
                        <SmallButton>Edit</SmallButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "roles" && (
              <div>
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-[22px] font-bold text-slate-900">User roles</div>
                  <div className="text-[14px] text-slate-500 mt-1">Define the actions each role can perform across the workspace.</div>
                </div>
                <div className="divide-y divide-slate-200">
                  {roleRows.map(([role, description]) => (
                    <SettingsRow key={role} label={role} value={description} action={<SmallButton>Edit</SmallButton>} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div>
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-[22px] font-bold text-slate-900">Providers & models</div>
                  <div className="text-[14px] text-slate-500 mt-1">Control connected providers, default models, and production credentials.</div>
                </div>
                <SettingsRow
                  label="OpenAI production key"
                  value={
                    <div className="flex items-center gap-3">
                      <div className="font-mono">sk-proj-7a8f9d0c1b2...</div>
                      <button type="button" onClick={() => setShowModelKey((value) => !value)} className="text-slate-400 hover:text-slate-700">
                        {showModelKey ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  }
                  action={<SmallButton>Rotate</SmallButton>}
                />
                <SettingsRow label="Default model" value={showModelKey ? "gpt-4.1" : "gpt-4.1"} action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow label="Anthropic Claude" value="Not connected" action={<SmallButton>Connect</SmallButton>} />
                <SettingsRow label="Local inference endpoint" value="vLLM / Ollama / Bedrock custom endpoint" action={<SmallButton>Add</SmallButton>} />
              </div>
            )}

            {activeTab === "limits" && (
              <div>
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-[22px] font-bold text-slate-900">Limits</div>
                  <div className="text-[14px] text-slate-500 mt-1">Set spending, timeout, and recursion safeguards for your workflows.</div>
                </div>
                <SettingsRow label="Monthly execution budget" value="$500" action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow label="Workflow timeout cap" value="60 seconds" action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow label="Auto-pause recursive triggers" description="Quarantine workflows that appear to trigger themselves repeatedly." action={<Toggle enabled={true} />} />
              </div>
            )}

            {activeTab === "retention" && (
              <div>
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-[22px] font-bold text-slate-900">Data retention</div>
                  <div className="text-[14px] text-slate-500 mt-1">Choose how long logs, payloads, and sensitive data stay available.</div>
                </div>
                <SettingsRow label="Execution log expiration" value="30 days" action={<SmallButton>Edit</SmallButton>} />
                <SettingsRow label="PII zero-retention mode" description="Scrub request and response bodies immediately after successful execution." action={<Toggle enabled={false} />} />
                <SettingsRow label="Audit exports" value="Weekly export to secure storage" action={<SmallButton>Edit</SmallButton>} />
              </div>
            )}

            {activeTab === "webhooks" && (
              <div>
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-[22px] font-bold text-slate-900">Developer webhooks</div>
                  <div className="text-[14px] text-slate-500 mt-1">Deliver workspace events to external systems and verify their signatures.</div>
                </div>
                <div className="divide-y divide-slate-200">
                  {webhookRows.map(([event, url, status]) => (
                    <div key={event} className="py-5 flex items-start justify-between gap-6">
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900">{event}</div>
                        <div className="text-[13px] text-slate-500 mt-1">{url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", status === "Healthy" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                          {status}
                        </span>
                        <SmallButton>Test</SmallButton>
                      </div>
                    </div>
                  ))}
                </div>
                <SettingsRow
                  label="Signing secret"
                  value={
                    <div className="flex items-center gap-3 font-mono">
                      <span>{showWebhookSecret ? "whsec_live_fhj29s_2js8x0..." : "••••••••••••••••••••••••"}</span>
                      <button type="button" onClick={() => setShowWebhookSecret((value) => !value)} className="text-slate-400 hover:text-slate-700">
                        {showWebhookSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  }
                  action={<SmallButton>Rotate</SmallButton>}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
