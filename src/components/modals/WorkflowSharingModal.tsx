import { useState } from "react";
import {
  Share2, Link, Copy, CheckCircle2, Globe, Lock, Users, Mail,
  Eye, Edit3, Play, Shield, Code2, ExternalLink, Download,
  AlertTriangle, Clock, X, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
type AccessLevel = "view" | "edit" | "execute";
type ShareScope = "private" | "team" | "workspace" | "public";

interface SharedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  access: AccessLevel;
  addedAt: string;
}

const mockSharedUsers: SharedUser[] = [
  { id: "u1", name: "Sarah Chen", email: "sarah@company.com", avatar: "SC", color: "#3b82f6", access: "edit", addedAt: "2 days ago" },
  { id: "u2", name: "Alex Rivera", email: "alex@company.com", avatar: "AR", color: "#8b5cf6", access: "view", addedAt: "1 week ago" },
  { id: "u3", name: "Jamie Lee", email: "jamie@company.com", avatar: "JL", color: "#f59e0b", access: "execute", addedAt: "3 days ago" },
];

const accessConfig: Record<AccessLevel, { icon: typeof Eye; label: string; desc: string; color: string }> = {
  view: { icon: Eye, label: "View", desc: "Can view workflow and executions", color: "text-blue-600" },
  edit: { icon: Edit3, label: "Edit", desc: "Can modify workflow and settings", color: "text-violet-600" },
  execute: { icon: Play, label: "Execute", desc: "Can run the workflow manually", color: "text-emerald-600" },
};

const scopeConfig: Record<ShareScope, { icon: typeof Lock; label: string; desc: string }> = {
  private: { icon: Lock, label: "Private", desc: "Only you and explicitly shared users" },
  team: { icon: Users, label: "Team", desc: "All members of your team" },
  workspace: { icon: Globe, label: "Workspace", desc: "Everyone in this workspace" },
  public: { icon: Globe, label: "Public", desc: "Anyone with the link (read-only)" },
};

interface WorkflowSharingModalProps {
  open: boolean;
  onClose: () => void;
  workflowName?: string;
}

export function WorkflowSharingModal({ open, onClose, workflowName = "Lead Scoring Pipeline" }: WorkflowSharingModalProps) {
  const [tab, setTab] = useState<"share" | "publish" | "embed">("share");
  const [scope, setScope] = useState<ShareScope>("private");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccess, setInviteAccess] = useState<AccessLevel>("view");
  const [copied, setCopied] = useState(false);
  const [publishEnabled, setPublishEnabled] = useState(false);
  const [publishCategory, setPublishCategory] = useState("lead-gen");

  const shareLink = `https://app.flowholt.com/share/wf_abc123def456`;
  const embedCode = `<iframe src="${shareLink}/embed" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[540px] max-h-[85vh] rounded-xl border border-zinc-200 bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <Share2 size={16} className="text-zinc-500" />
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">Share Workflow</h2>
              <p className="text-[10px] text-zinc-400">{workflowName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 px-5">
          {([
            { id: "share" as const, label: "Share", icon: Users },
            { id: "publish" as const, label: "Publish", icon: Globe },
            { id: "embed" as const, label: "Embed", icon: Code2 },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
                tab === t.id ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "share" && (
            <div className="p-5 space-y-5">
              {/* Share link */}
              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Share Link</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <Link size={12} className="text-zinc-400 flex-shrink-0" />
                    <span className="text-[10px] text-zinc-600 font-mono truncate">{shareLink}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(shareLink)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                      copied ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Access scope */}
              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Access Scope</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(scopeConfig) as [ShareScope, typeof scopeConfig[ShareScope]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setScope(key)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all",
                        scope === key ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200" : "border-zinc-200 hover:bg-zinc-50"
                      )}
                    >
                      <cfg.icon size={14} className={scope === key ? "text-blue-600" : "text-zinc-400"} />
                      <div>
                        <p className={cn("text-[11px] font-medium", scope === key ? "text-blue-700" : "text-zinc-700")}>{cfg.label}</p>
                        <p className="text-[9px] text-zinc-400">{cfg.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Invite people */}
              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Invite People</p>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="Enter email address…"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-3 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                  <select
                    value={inviteAccess}
                    onChange={e => setInviteAccess(e.target.value as AccessLevel)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[10px] text-zinc-600 focus:outline-none"
                  >
                    {Object.entries(accessConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors">
                    Invite
                  </button>
                </div>
              </div>

              {/* Shared with */}
              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Shared With ({mockSharedUsers.length})
                </p>
                <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100">
                  {mockSharedUsers.map(user => {
                    const cfg = accessConfig[user.access];
                    return (
                      <div key={user.id} className="flex items-center gap-3 px-3 py-2.5">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-zinc-700">{user.name}</p>
                          <p className="text-[9px] text-zinc-400">{user.email}</p>
                        </div>
                        <select
                          value={user.access}
                          className={cn("rounded-md border border-zinc-200 bg-white px-2 py-1 text-[9px] font-medium focus:outline-none", cfg.color)}
                        >
                          {Object.entries(accessConfig).map(([key, c]) => (
                            <option key={key} value={key}>{c.label}</option>
                          ))}
                        </select>
                        <button className="rounded p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <X size={10} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "publish" && (
            <div className="p-5 space-y-5">
              {/* Publish toggle */}
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <Globe size={16} className={publishEnabled ? "text-emerald-600" : "text-zinc-400"} />
                  <div>
                    <p className="text-[12px] font-semibold text-zinc-800">Publish to Marketplace</p>
                    <p className="text-[10px] text-zinc-400">Make this workflow available to all FlowHolt users</p>
                  </div>
                </div>
                <button
                  onClick={() => setPublishEnabled(!publishEnabled)}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    publishEnabled ? "bg-emerald-500" : "bg-zinc-300"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                    publishEnabled && "translate-x-4"
                  )} />
                </button>
              </div>

              {publishEnabled && (
                <>
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500 mb-1 block">Category</label>
                    <select
                      value={publishCategory}
                      onChange={e => setPublishCategory(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-700 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="lead-gen">Lead Generation</option>
                      <option value="sales">Sales Automation</option>
                      <option value="marketing">Marketing</option>
                      <option value="support">Customer Support</option>
                      <option value="devops">DevOps & Engineering</option>
                      <option value="hr">HR & People Ops</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500 mb-1 block">Description</label>
                    <textarea
                      placeholder="Describe what this workflow does…"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 resize-none h-24"
                    />
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-[10px] text-amber-700 leading-relaxed">
                      <p className="font-medium">Before publishing:</p>
                      <ul className="list-disc ml-4 mt-1 space-y-0.5">
                        <li>Credentials will be stripped from the published version</li>
                        <li>Environment variables will be replaced with placeholders</li>
                        <li>The workflow will be reviewed before appearing publicly</li>
                      </ul>
                    </div>
                  </div>

                  <button className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                    Submit for Review
                  </button>
                </>
              )}
            </div>
          )}

          {tab === "embed" && (
            <div className="p-5 space-y-5">
              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Embed Code</p>
                <div className="rounded-lg bg-zinc-900 p-3">
                  <code className="text-[10px] text-emerald-400 font-mono break-all leading-relaxed">
                    {embedCode}
                  </code>
                </div>
                <button
                  onClick={() => handleCopy(embedCode)}
                  className="mt-2 flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  <Copy size={10} />
                  Copy embed code
                </button>
              </div>

              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Preview</p>
                <div className="rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
                  <Globe size={24} className="text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">Embedded workflow viewer</p>
                  <p className="text-[10px] text-zinc-400">600×400px iframe preview</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Direct Link</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <ExternalLink size={12} className="text-zinc-400 flex-shrink-0" />
                    <span className="text-[10px] text-zinc-600 font-mono truncate">{shareLink}/view</span>
                  </div>
                  <button
                    onClick={() => handleCopy(`${shareLink}/view`)}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50"
                  >
                    <Copy size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
