import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Key, Shield, Clock, FileText, RotateCcw, Eye, EyeOff, AlertTriangle, CheckCircle2, Copy, RefreshCw,
  Users, Share2, Globe, Lock, UserPlus, Trash2,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";
import { useVaultCredentials } from "@/hooks/useApi";

/* ── Mock credential data ── */
const credential = {
  id: "cred-001",
  name: "OpenAI Production Key",
  provider: "OpenAI",
  type: "API Key",
  status: "active" as const,
  createdBy: "Gouhar Ali",
  createdAt: "Dec 8, 2025",
  lastUsed: "2 min ago",
  lastRotated: "14 days ago",
  expiresAt: "Never",
  scope: "workspace",
  usedByWorkflows: 4,
  usedByAgents: 2,
  secretPreview: "sk-proj-****…****7kQf",
};

const usageWorkflows = [
  { name: "Lead Qualification Pipeline", step: "Score Lead (GPT-4o)", lastUsed: "2 min ago" },
  { name: "AI Email Classifier", step: "Classify Intent", lastUsed: "15 min ago" },
  { name: "Customer Support Bot", step: "Generate Response", lastUsed: "1 hr ago" },
  { name: "Daily Report Generator", step: "Summarize Data", lastUsed: "3 hrs ago" },
];

const auditEvents = [
  { action: "Used in execution", actor: "System", target: "Lead Qualification Pipeline #1247", time: "2 min ago" },
  { action: "Secret value read", actor: "Gouhar Ali", target: "Via API Access", time: "3 hrs ago" },
  { action: "Credential rotated", actor: "Gouhar Ali", target: "Manual rotation", time: "14 days ago" },
  { action: "Created", actor: "Gouhar Ali", target: "From provider setup", time: "Dec 8, 2025" },
];

const rotationHistory = [
  { version: "v3 (current)", rotatedBy: "Gouhar Ali", method: "Manual", date: "14 days ago" },
  { version: "v2", rotatedBy: "System", method: "Auto-rotation", date: "44 days ago" },
  { version: "v1 (initial)", rotatedBy: "Gouhar Ali", method: "Created", date: "Dec 8, 2025" },
];

const sharedWith = [
  { id: "u1", name: "Gouhar Ali", email: "gouhar@flowholt.com", role: "Owner", avatar: "GA" },
  { id: "u2", name: "Sarah Chen", email: "sarah@flowholt.com", role: "Can use", avatar: "SC" },
  { id: "u3", name: "Dev Team", email: "dev-team (workspace)", role: "Can use", avatar: "DT" },
];

const sharingPermissions = ["Owner", "Can use", "Can edit", "No access"] as const;

const tabs = [
  { id: "overview", label: "Overview", icon: <Key size={13} /> },
  { id: "policy", label: "Secret Policy", icon: <Shield size={13} /> },
  { id: "usage", label: "Usage", icon: <FileText size={13} /> },
  { id: "audit", label: "Audit", icon: <Clock size={13} /> },
  { id: "rotation", label: "Rotation", icon: <RotateCcw size={13} /> },
  { id: "sharing", label: "Sharing", icon: <Share2 size={13} /> },
];

export function CredentialDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [secretVisible, setSecretVisible] = useState(false);

  const { data: vaultCreds } = useVaultCredentials();
  const cred = useMemo(() => {
    const found = vaultCreds?.find((c: any) => c.id === id);
    if (found) {
      return {
        ...credential,
        id: found.id,
        name: found.name || found.label || credential.name,
        provider: found.provider || credential.provider,
        type: found.type || credential.type,
        status: (found.status || "active") as "active",
        lastUsed: found.last_used || credential.lastUsed,
        createdAt: found.created_at ? new Date(found.created_at).toLocaleDateString() : credential.createdAt,
      };
    }
    return credential;
  }, [vaultCreds, id]);

  return (
    <EntityDetailLayout
      backLabel="Vault"
      backTo="/vault"
      name={cred.name}
      status={{ label: cred.status, variant: "success" }}
      subtitle={`${cred.provider} • ${cred.type} • ${cred.scope} scope`}
      icon={<Key size={18} className="text-amber-500" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="secondary" size="sm"><RotateCcw size={12} /> Rotate</Button>
          <Button variant="secondary" size="sm" className="text-red-600 border-red-200">Revoke</Button>
        </>
      }
    >
      {activeTab === "overview" && (
        <div className="space-y-5">
          <DetailSection title="Credential Info">
            <DetailRow label="Provider" value={credential.provider} />
            <DetailRow label="Type" value={<Badge variant="neutral">{credential.type}</Badge>} />
            <DetailRow label="Scope" value={<Badge variant="info">{credential.scope}</Badge>} />
            <DetailRow label="Created By" value={credential.createdBy} />
            <DetailRow label="Created" value={credential.createdAt} />
            <DetailRow label="Expires" value={credential.expiresAt} />
          </DetailSection>

          <DetailSection title="Secret Value">
            <div className="flex items-center gap-3 rounded-md border border-zinc-100 bg-zinc-50 px-4 py-3">
              <code className="flex-1 font-mono text-[12px] text-zinc-600">
                {secretVisible ? "sk-proj-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7kQf" : credential.secretPreview}
              </code>
              <button
                onClick={() => setSecretVisible(!secretVisible)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {secretVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Copy size={14} />
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Shield size={10} /> Encrypted at rest with AES-256
            </p>
          </DetailSection>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Workflows" value={credential.usedByWorkflows.toString()} />
            <MiniStat label="Agents" value={credential.usedByAgents.toString()} />
            <MiniStat label="Last Rotated" value={credential.lastRotated} />
          </div>
        </div>
      )}

      {activeTab === "policy" && (
        <div className="space-y-5">
          <DetailSection title="Rotation Policy">
            <DetailRow label="Auto-Rotation" value={<Badge variant="success">Enabled</Badge>} />
            <DetailRow label="Rotation Interval" value="30 days" />
            <DetailRow label="Next Rotation" value="16 days" />
            <DetailRow label="Notify Before" value="7 days" />
          </DetailSection>

          <DetailSection title="Access Policy">
            <DetailRow label="Who Can View" value="Workspace Admins" />
            <DetailRow label="Who Can Use" value="All Members" />
            <DetailRow label="Who Can Rotate" value="Workspace Admins" />
            <DetailRow label="Require Approval" value="No" />
          </DetailSection>

          <DetailSection title="Expiration">
            <DetailRow label="Expires" value={<span className="text-zinc-400">Never (provider-managed)</span>} />
            <DetailRow label="Warning Threshold" value="30 days before" />
          </DetailSection>
        </div>
      )}

      {activeTab === "usage" && (
        <div className="space-y-5">
          <DetailSection title={`Used by ${credential.usedByWorkflows} workflows`}>
            <div className="space-y-1.5">
              {usageWorkflows.map((wf, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2 hover:bg-zinc-50/50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-700">{wf.name}</p>
                    <p className="text-[11px] text-zinc-400">Step: {wf.step}</p>
                  </div>
                  <span className="text-[11px] text-zinc-400">{wf.lastUsed}</span>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Usage Stats">
            <DetailRow label="Total API Calls (30d)" value={<span className="font-mono">12,847</span>} />
            <DetailRow label="Avg Daily Calls" value={<span className="font-mono">428</span>} />
            <DetailRow label="Last Used" value={credential.lastUsed} />
          </DetailSection>
        </div>
      )}

      {activeTab === "audit" && (
        <DetailSection title="Audit Trail">
          <div className="space-y-1.5">
            {auditEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-3 rounded-md border border-zinc-50 px-3 py-2.5">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-zinc-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-zinc-700">
                    <span className="font-medium">{event.actor}</span> — {event.action}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">{event.target}</p>
                </div>
                <span className="text-[11px] text-zinc-400 whitespace-nowrap">{event.time}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {activeTab === "rotation" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm"><RefreshCw size={12} /> Rotate Now</Button>
            <span className="text-[12px] text-zinc-400">Next auto-rotation in 16 days</span>
          </div>

          <DetailSection title="Rotation History">
            <div className="space-y-1.5">
              {rotationHistory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    {i === 0 ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-200" />
                    )}
                    <div>
                      <p className="text-[13px] font-medium text-zinc-700">{entry.version}</p>
                      <p className="text-[11px] text-zinc-400">{entry.method} by {entry.rotatedBy}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400">{entry.date}</span>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      )}
      {activeTab === "sharing" && (
        <div className="space-y-5">
          <DetailSection title="Access Control">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: Lock, label: "Private", desc: "Only owner can use", active: credential.scope !== "workspace" },
                { icon: Users, label: "Workspace", desc: "All workspace members", active: credential.scope === "workspace" },
                { icon: Globe, label: "Global", desc: "All workspaces", active: false },
              ].map(opt => (
                <button key={opt.label} className={cn("rounded-xl border p-3 text-left transition-all",
                  opt.active ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-300"
                )}>
                  <opt.icon size={16} className={opt.active ? "text-zinc-900" : "text-zinc-400"} />
                  <p className={cn("text-[12px] font-medium mt-1.5", opt.active ? "text-zinc-900" : "text-zinc-500")}>{opt.label}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Shared With">
            <div className="space-y-1.5 mb-3">
              {sharedWith.map(user => (
                <div key={user.id} className="flex items-center gap-3 rounded-lg border border-zinc-100 px-3 py-2.5 hover:bg-zinc-50 transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-semibold text-white">{user.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-zinc-700">{user.name}</p>
                    <p className="text-[10px] text-zinc-400">{user.email}</p>
                  </div>
                  <select className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600 focus:outline-none" defaultValue={user.role}>
                    {sharingPermissions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {user.role !== "Owner" && (
                    <button className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                  )}
                </div>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-700 transition-colors">
              <UserPlus size={12} /> Add person or team
            </button>
          </DetailSection>

          <DetailSection title="Share Link">
            <div className="flex items-center gap-2">
              <input readOnly value="https://app.flowholt.com/invite/cred/abc123" className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500 font-mono" />
              <Button variant="outline" size="sm"><Copy size={12} /> Copy</Button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1.5">Anyone with this link and workspace access can use this credential.</p>
          </DetailSection>
        </div>
      )}
    </EntityDetailLayout>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs text-center">
      <p className="text-[22px] font-semibold text-zinc-800">{value}</p>
      <p className="text-[11px] text-zinc-400 mt-1">{label}</p>
    </div>
  );
}
