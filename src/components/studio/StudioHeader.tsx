import { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  ChevronDown,
  Share2,
  GitBranch,
  Copy,
  Download,
  Upload,
  Trash2,
  Archive,
  Settings,
  UserCog,
  Globe,
  AlertCircle,
  Check,
  Loader2,
  Link2,
  Mail,
  Lock,
  Users,
  Eye,
  Edit3,
  X,
  FileJson,
  BookOpen,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Shield,
  Save,
  Database,
  Zap,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublishWorkflow } from "@/hooks/useApi";
import { useCanvasStore } from "./useCanvasStore";

type PublishState = "draft" | "published" | "unsaved" | "publishing" | "invalid";
type Environment = "draft" | "staging" | "production";

const publishStateConfig: Record<PublishState, { label: string; color: string; dotColor: string }> = {
  draft:      { label: "Draft",           color: "bg-zinc-100 text-zinc-500",        dotColor: "bg-zinc-400" },
  published:  { label: "Published",       color: "bg-green-50 text-green-700",       dotColor: "bg-green-500" },
  unsaved:    { label: "Unsaved changes", color: "bg-amber-50 text-amber-700",       dotColor: "bg-amber-500" },
  publishing: { label: "Publishing…",     color: "bg-blue-50 text-blue-700",         dotColor: "bg-blue-500" },
  invalid:    { label: "Has errors",      color: "bg-red-50 text-red-600",           dotColor: "bg-red-500" },
};

const envConfig: Record<Environment, { label: string; color: string; dotColor: string }> = {
  draft:      { label: "Draft",      color: "bg-zinc-100 text-zinc-500",  dotColor: "bg-zinc-400" },
  staging:    { label: "Staging",    color: "bg-blue-50 text-blue-700",   dotColor: "bg-blue-500" },
  production: { label: "Production", color: "bg-green-50 text-green-700", dotColor: "bg-green-500" },
};

const workflowActions = [
  { label: "Duplicate",         icon: Copy,      danger: false },
  { label: "Export as JSON",    icon: Download,  danger: false },
  { label: "Import from file",  icon: Upload,    danger: false },
  { label: "Share",             icon: Share2,    danger: false },
  { label: "Change owner",      icon: UserCog,   danger: false },
  { label: "Push to Git",       icon: GitBranch, danger: false },
  { label: "Workflow settings", icon: Settings,  danger: false },
  { label: "Make public",       icon: Globe,     danger: false },
  null, // divider
  { label: "Archive",           icon: Archive,   danger: false },
  { label: "Delete",            icon: Trash2,    danger: true },
];

type ShareTab = "link" | "invite" | "export" | "template";
type LinkAccess = "restricted" | "anyone-view" | "anyone-edit";

const shareCollaborators = [
  { name: "Alex Brown", email: "alex@team.com", initials: "AB", role: "Editor" as const },
  { name: "Chris Kim", email: "chris@team.com", initials: "CK", role: "Viewer" as const },
  { name: "Jamie Lee", email: "jamie@team.com", initials: "JL", role: "Editor" as const },
];

function ShareModal({ open, onClose, workflowName }: { open: boolean; onClose: () => void; workflowName: string }) {
  const [tab, setTab] = useState<ShareTab>("link");
  const [linkAccess, setLinkAccess] = useState<LinkAccess>("restricted");
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Viewer" | "Editor">("Viewer");
  const [inviteSent, setInviteSent] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "yaml" | "n8n">("json");
  const [exported, setExported] = useState(false);
  const [templatePublished, setTemplatePublished] = useState(false);

  if (!open) return null;

  const shareUrl = `https://app.flowholt.com/shared/wf-lead-qual-${Date.now().toString(36).slice(-4)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const sendInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => { setInviteSent(false); setInviteEmail(""); }, 2000);
  };

  const doExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const publishTemplate = () => {
    setTemplatePublished(true);
    setTimeout(() => setTemplatePublished(false), 3000);
  };

  const tabs: { id: ShareTab; label: string; icon: React.ElementType }[] = [
    { id: "link", label: "Link", icon: Link2 },
    { id: "invite", label: "Invite", icon: Mail },
    { id: "export", label: "Export", icon: Download },
    { id: "template", label: "Publish", icon: BookOpen },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-[480px] rounded-xl bg-white shadow-2xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <Share2 size={16} className="text-zinc-500" />
            <span className="text-[14px] font-semibold text-zinc-900">Share "{workflowName}"</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 px-5">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-colors",
                  tab === t.id ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
                )}
              >
                <Icon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {tab === "link" && (
            <>
              {/* Link access */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Link Access</label>
                <div className="space-y-1">
                  {([
                    { id: "restricted" as const, label: "Restricted", desc: "Only invited people can access", icon: Lock },
                    { id: "anyone-view" as const, label: "Anyone with link can view", desc: "Read-only access via link", icon: Eye },
                    { id: "anyone-edit" as const, label: "Anyone with link can edit", desc: "Full editing access via link", icon: Edit3 },
                  ]).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setLinkAccess(opt.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                        linkAccess === opt.id ? "border-zinc-800 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <opt.icon size={14} className={linkAccess === opt.id ? "text-zinc-800" : "text-zinc-400"} />
                      <div>
                        <div className={cn("text-[12px] font-medium", linkAccess === opt.id ? "text-zinc-800" : "text-zinc-600")}>{opt.label}</div>
                        <div className="text-[10px] text-zinc-400">{opt.desc}</div>
                      </div>
                      {linkAccess === opt.id && <Check size={14} className="ml-auto text-zinc-800" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copy link */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <Link2 size={12} className="text-zinc-400 flex-shrink-0" />
                  <span className="text-[11px] text-zinc-500 truncate font-mono">{shareUrl}</span>
                </div>
                <button
                  onClick={copyLink}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-all",
                    linkCopied ? "bg-green-50 text-green-700" : "bg-zinc-900 text-white hover:bg-zinc-800"
                  )}
                >
                  {linkCopied ? <><CheckCircle2 size={12} /> Copied!</> : <><Copy size={12} /> Copy link</>}
                </button>
              </div>
            </>
          )}

          {tab === "invite" && (
            <>
              {/* Invite form */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address…"
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-[12px] outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200"
                  onKeyDown={(e) => { if (e.key === "Enter") sendInvite(); }}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "Viewer" | "Editor")}
                  className="rounded-lg border border-zinc-200 px-2 py-2 text-[12px] outline-none bg-white"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                </select>
                <button
                  onClick={sendInvite}
                  disabled={!inviteEmail.trim()}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-all",
                    inviteSent ? "bg-green-50 text-green-700" : "bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40"
                  )}
                >
                  {inviteSent ? <><CheckCircle2 size={12} /> Sent!</> : <><Mail size={12} /> Invite</>}
                </button>
              </div>

              {/* Current collaborators */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">People with access</label>
                <div className="space-y-0.5">
                  {/* Owner */}
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">GA</div>
                    <div className="flex-1">
                      <div className="text-[12px] font-medium text-zinc-800">Gouhar Ali (You)</div>
                      <div className="text-[10px] text-zinc-400">gouhar@flowholt.com</div>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-400">Owner</span>
                  </div>
                  {shareCollaborators.map((c) => (
                    <div key={c.email} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-50 transition-colors">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600">{c.initials}</div>
                      <div className="flex-1">
                        <div className="text-[12px] font-medium text-zinc-800">{c.name}</div>
                        <div className="text-[10px] text-zinc-400">{c.email}</div>
                      </div>
                      <select className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] outline-none bg-white" defaultValue={c.role}>
                        <option>Viewer</option>
                        <option>Editor</option>
                        <option>Remove</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "export" && (
            <>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "json" as const, label: "JSON", desc: "FlowHolt native" },
                    { id: "yaml" as const, label: "YAML", desc: "Human-readable" },
                    { id: "n8n" as const, label: "n8n", desc: "Compatible export" },
                  ]).map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormat(fmt.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-center transition-all",
                        exportFormat === fmt.id ? "border-zinc-800 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <FileJson size={16} className={cn("mx-auto mb-1", exportFormat === fmt.id ? "text-zinc-800" : "text-zinc-400")} />
                      <div className={cn("text-[12px] font-medium", exportFormat === fmt.id ? "text-zinc-800" : "text-zinc-600")}>{fmt.label}</div>
                      <div className="text-[9px] text-zinc-400">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export options */}
              <div className="space-y-1.5">
                {[
                  { label: "Include credentials (encrypted)", checked: false },
                  { label: "Include execution history", checked: false },
                  { label: "Include node notes & comments", checked: true },
                ].map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.checked} className="rounded border-zinc-300 text-zinc-800 focus:ring-zinc-800" />
                    <span className="text-[12px] text-zinc-600">{opt.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={doExport}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-medium transition-all",
                  exported ? "bg-green-50 text-green-700" : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}
              >
                {exported ? <><CheckCircle2 size={13} /> Downloaded!</> : <><Download size={13} /> Export Workflow</>}
              </button>
            </>
          )}

          {tab === "template" && (
            <>
              <p className="text-[12px] text-zinc-500 leading-relaxed">
                Publish this workflow to the <strong>FlowHolt Template Gallery</strong>. Other users can discover and clone it.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">Category</label>
                  <select className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] outline-none bg-white">
                    <option>Lead Generation</option>
                    <option>Customer Support</option>
                    <option>Data Processing</option>
                    <option>AI & ML</option>
                    <option>DevOps</option>
                    <option>Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    defaultValue="Scores incoming leads using GPT-4o, enriches with Clearbit data, and routes to Salesforce + Slack based on score thresholds."
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] outline-none focus:border-zinc-400 resize-none h-[60px]"
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <Globe size={11} />
                  <span>Credentials will be removed. Personal data will be redacted.</span>
                </div>
              </div>
              <button
                onClick={publishTemplate}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-medium transition-all",
                  templatePublished ? "bg-green-50 text-green-700" : "bg-emerald-500 text-white hover:bg-emerald-600"
                )}
              >
                {templatePublished ? <><CheckCircle2 size={13} /> Published to Template Gallery!</> : <><BookOpen size={13} /> Publish as Template</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Workflow Settings Modal ── */

type ExecOrder = "v1" | "v0";
type SaveOption = "all" | "none";
type RedactOption = "none" | "redact";

function WfSettingsToggle({ label, desc, enabled, onToggle }: {
  label: string; desc: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-[12px] font-medium text-zinc-700">{label}</p>
        <p className="text-[10px] text-zinc-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={onToggle} className="flex-shrink-0">
        {enabled ? <ToggleRight size={22} className="text-zinc-900" /> : <ToggleLeft size={22} className="text-zinc-300" />}
      </button>
    </div>
  );
}

function WorkflowSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [execOrder, setExecOrder] = useState<ExecOrder>("v1");
  const [errorWorkflow, setErrorWorkflow] = useState("none");
  const [calledBy, setCalledBy] = useState<"all" | "none" | "selected">("all");
  const [timezone, setTimezone] = useState("UTC");
  const [saveFailedProd, setSaveFailedProd] = useState<SaveOption>("all");
  const [saveSuccessProd, setSaveSuccessProd] = useState<SaveOption>("all");
  const [saveManual, setSaveManual] = useState<SaveOption>("all");
  const [saveProgress, setSaveProgress] = useState(false);
  const [timeoutEnabled, setTimeoutEnabled] = useState(false);
  const [timeoutHrs, setTimeoutHrs] = useState(0);
  const [timeoutMins, setTimeoutMins] = useState(5);
  const [timeoutSecs, setTimeoutSecs] = useState(0);
  const [redactProd, setRedactProd] = useState<RedactOption>("none");
  const [redactManual, setRedactManual] = useState<RedactOption>("none");
  const [estTimeSaved, setEstTimeSaved] = useState(0);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[540px] max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-zinc-500" />
            <h2 className="text-[14px] font-semibold text-zinc-800">Workflow Settings</h2>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] px-6 py-5 space-y-6">

          {/* Execution Order */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Execution Order</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "v1" as const, label: "v1 (Recommended)", desc: "Complete each branch before starting next" },
                { id: "v0" as const, label: "v0 (Legacy)", desc: "Execute first node of all branches, then second, etc." },
              ]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setExecOrder(opt.id)}
                  className={cn(
                    "flex flex-col rounded-lg border px-3 py-2.5 text-left transition-all",
                    execOrder === opt.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  )}
                >
                  <span className="text-[11px] font-semibold">{opt.label}</span>
                  <span className={cn("text-[9px] mt-0.5", execOrder === opt.id ? "text-zinc-300" : "text-zinc-400")}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Workflow */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={12} className="text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Error Workflow</p>
            </div>
            <p className="text-[10px] text-zinc-400 mb-2">Select a workflow to trigger if this workflow fails</p>
            <select
              value={errorWorkflow}
              onChange={(e) => setErrorWorkflow(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none focus:border-zinc-400 transition-all"
            >
              <option value="none">— None —</option>
              <option value="error-handler">Error Alert Handler</option>
              <option value="slack-notify">Slack Error Notifier</option>
              <option value="pagerduty">PagerDuty Escalation</option>
              <option value="email-alert">Email Alert Workflow</option>
            </select>
          </div>

          {/* Callable By */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={12} className="text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">This workflow can be called by</p>
            </div>
            <div className="flex gap-2">
              {([
                { id: "all" as const, label: "Any workflow" },
                { id: "selected" as const, label: "Selected only" },
                { id: "none" as const, label: "None" },
              ]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setCalledBy(opt.id)}
                  className={cn(
                    "text-[11px] px-3 py-1.5 rounded-lg border transition-all font-medium",
                    calledBy === opt.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={12} className="text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Timezone</p>
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none focus:border-zinc-400 transition-all"
            >
              {["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
                "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Tokyo", "Asia/Shanghai",
                "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland"].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Save Execution Data */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database size={12} className="text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Save Execution Data</p>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/30 p-3">
              {([
                { label: "Save failed production executions", value: saveFailedProd, setter: setSaveFailedProd },
                { label: "Save successful production executions", value: saveSuccessProd, setter: setSaveSuccessProd },
                { label: "Save manual executions", value: saveManual, setter: setSaveManual },
              ] as const).map(row => (
                <div key={row.label} className="flex items-center justify-between py-1.5">
                  <span className="text-[11px] text-zinc-600">{row.label}</span>
                  <div className="flex gap-1">
                    {(["all", "none"] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => row.setter(opt)}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-md capitalize transition-all font-medium",
                          row.value === opt ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600"
                        )}
                      >
                        {opt === "all" ? "Save" : "Don't save"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <WfSettingsToggle
                label="Save execution progress"
                desc="Save data for each node — enables resume on error (may increase latency)"
                enabled={saveProgress}
                onToggle={() => setSaveProgress(p => !p)}
              />
            </div>
          </div>

          {/* Timeout */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={12} className="text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Timeout Workflow</p>
            </div>
            <WfSettingsToggle
              label="Enable timeout"
              desc="Cancel execution after the specified duration"
              enabled={timeoutEnabled}
              onToggle={() => setTimeoutEnabled(p => !p)}
            />
            {timeoutEnabled && (
              <div className="flex items-center gap-2 mt-2 rounded-lg border border-zinc-100 bg-zinc-50/30 p-3">
                <div className="flex-1">
                  <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Hours</label>
                  <input type="number" min={0} max={24} value={timeoutHrs} onChange={(e) => setTimeoutHrs(+e.target.value)}
                    className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2 text-[12px] text-zinc-700 focus:outline-none mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Minutes</label>
                  <input type="number" min={0} max={59} value={timeoutMins} onChange={(e) => setTimeoutMins(+e.target.value)}
                    className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2 text-[12px] text-zinc-700 focus:outline-none mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Seconds</label>
                  <input type="number" min={0} max={59} value={timeoutSecs} onChange={(e) => setTimeoutSecs(+e.target.value)}
                    className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2 text-[12px] text-zinc-700 focus:outline-none mt-1" />
                </div>
              </div>
            )}
          </div>

          {/* Data Redaction */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={12} className="text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Data Redaction</p>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/30 p-3">
              {([
                { label: "Redact production execution data", value: redactProd, setter: setRedactProd },
                { label: "Redact manual execution data", value: redactManual, setter: setRedactManual },
              ] as const).map(row => (
                <div key={row.label} className="flex items-center justify-between py-1.5">
                  <span className="text-[11px] text-zinc-600">{row.label}</span>
                  <div className="flex gap-1">
                    {(["none", "redact"] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => row.setter(opt)}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-md capitalize transition-all font-medium",
                          row.value === opt ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600"
                        )}
                      >
                        {opt === "none" ? "Show" : "Redact"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {(redactProd === "redact" || redactManual === "redact") && (
              <div className="flex items-start gap-2 mt-2 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5">
                <Info size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-600">Redacted data can be revealed by users with appropriate permissions.</p>
              </div>
            )}
          </div>

          {/* Estimated time saved */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Save size={12} className="text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Estimated Time Saved</p>
            </div>
            <p className="text-[10px] text-zinc-400 mb-2">Minutes saved per execution — used for insights dashboard</p>
            <input
              type="number"
              min={0}
              value={estTimeSaved}
              onChange={(e) => setEstTimeSaved(+e.target.value)}
              className="h-9 w-24 rounded-lg border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none focus:border-zinc-400"
              placeholder="0"
            />
            <span className="text-[10px] text-zinc-400 ml-2">minutes per run</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100 bg-zinc-50/50">
          <button onClick={onClose} className="text-[12px] text-zinc-500 hover:text-zinc-700 transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium transition-all",
              saved
                ? "bg-green-500 text-white"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
          >
            {saved ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StudioHeader({ onBack, workflowId }: { onBack: () => void; workflowId?: string }) {
  const [workflowName, setWorkflowName] = useState("Lead Qualification Pipeline");
  const [editingName, setEditingName] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>("unsaved");
  const [environment, setEnvironment] = useState<Environment>("production");
  const [envMenuOpen, setEnvMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [activationConfirm, setActivationConfirm] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const store = useCanvasStore();
  const publishMutation = usePublishWorkflow(workflowId ?? "");

  // Sync workflow name from loaded canvas store data
  useEffect(() => {
    if (store.loadedWorkflowId && store.nodes.length > 0) {
      // Name is on the workflow detail, not nodes — keep mock name as fallback
    }
  }, [store.loadedWorkflowId, store.nodes]);

  useEffect(() => {
    if (editingName) nameRef.current?.select();
  }, [editingName]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (envRef.current && !envRef.current.contains(e.target as Node)) setEnvMenuOpen(false);
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function commitName() {
    setEditingName(false);
    if (workflowName.trim() === "") setWorkflowName("Untitled Workflow");
    setPublishState("unsaved");
  }

  function handlePublish() {
    if (workflowId && publishMutation) {
      setPublishState("publishing");
      publishMutation.mutate(undefined, {
        onSuccess: () => setPublishState("published"),
        onError: () => setPublishState("unsaved"),
      });
    } else {
      // Fallback mock for demo
      setPublishState("publishing");
      setTimeout(() => setPublishState("published"), 1500);
    }
  }

  const ps = publishStateConfig[publishState];
  const env = envConfig[environment];

  return (
    <div className="flex h-12 items-center justify-between border-b border-zinc-100 bg-white px-4 gap-3">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Inline-editable name */}
        {editingName ? (
          <input
            ref={nameRef}
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value.slice(0, 128))}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") setEditingName(false); }}
            className="min-w-[160px] max-w-[280px] rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-[14px] font-semibold text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Click to rename"
            className="max-w-[280px] truncate text-[14px] font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
          >
            {workflowName}
          </button>
        )}

        {/* Publish state badge */}
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium flex-shrink-0", ps.color)}>
          {publishState === "publishing" ? (
            <Loader2 size={10} className="animate-spin" />
          ) : publishState === "invalid" ? (
            <AlertCircle size={10} />
          ) : publishState === "published" ? (
            <Check size={10} />
          ) : (
            <span className={cn("h-1.5 w-1.5 rounded-full", ps.dotColor)} />
          )}
          {ps.label}
        </span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Collaborator avatars */}
        <div className="flex -space-x-1.5">
          {["AB", "CK", "JL"].map((initials) => (
            <div
              key={initials}
              title={initials}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-[9px] font-semibold text-zinc-600 select-none"
            >
              {initials}
            </div>
          ))}
        </div>

        {/* Environment chip with dropdown */}
        <div ref={envRef} className="relative">
          <button
            onClick={() => setEnvMenuOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors hover:opacity-80",
              env.color
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", env.dotColor)} />
            {env.label}
            <ChevronDown size={10} />
          </button>
          {envMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-zinc-200 bg-white shadow-lg py-1">
              {(["draft", "staging", "production"] as Environment[]).map((e) => (
                <button
                  key={e}
                  onClick={() => { setEnvironment(e); setEnvMenuOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-[12px] transition-colors",
                    environment === e ? "text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", envConfig[e].dotColor)} />
                  {envConfig[e].label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
          v3.2
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Activation toggle */}
        <div className="relative">
          <button
            onClick={() => {
              if (workflowActive) { setWorkflowActive(false); }
              else { setActivationConfirm(true); }
            }}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition-colors",
              workflowActive
                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
            )}
          >
            {workflowActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {workflowActive ? "Active" : "Inactive"}
          </button>
          {activationConfirm && (
            <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-zinc-200 bg-white shadow-lg p-3">
              <p className="text-[12px] font-medium text-zinc-800 mb-1">Activate workflow?</p>
              <p className="text-[11px] text-zinc-500 mb-3">This workflow will start listening for trigger events and run automatically.</p>
              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setActivationConfirm(false)} className="rounded-md px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-50 border border-zinc-200 transition-colors">Cancel</button>
                <button onClick={() => { setWorkflowActive(true); setActivationConfirm(false); }} className="rounded-md px-2.5 py-1 text-[11px] font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">Activate</button>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setShareOpen(true)} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          <Share2 size={12} />
          Share
        </button>
        <button
          onClick={handlePublish}
          disabled={publishState === "publishing" || publishState === "published"}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium transition-colors",
            publishState === "published"
              ? "bg-green-50 text-green-700 cursor-default"
              : publishState === "publishing"
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          )}
        >
          {publishState === "publishing" && <Loader2 size={12} className="animate-spin" />}
          {publishState === "published" ? "Published" : publishState === "publishing" ? "Publishing…" : "Publish"}
        </button>

        {/* Actions dropdown */}
        <div ref={actionsRef} className="relative">
          <button
            onClick={() => setActionsOpen((o) => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          {actionsOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-zinc-200 bg-white shadow-lg py-1">
              {workflowActions.map((action, i) =>
                action === null ? (
                  <div key={`divider-${i}`} className="my-1 border-t border-zinc-100" />
                ) : (
                  <button
                    key={action.label}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] transition-colors",
                      action.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-zinc-600 hover:bg-zinc-50"
                    )}
                    onClick={() => {
                      setActionsOpen(false);
                      if (action.label === "Share") setShareOpen(true);
                      if (action.label === "Workflow settings") setSettingsOpen(true);
                    }}
                  >
                    <action.icon size={13} />
                    {action.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} workflowName={workflowName} />
      <WorkflowSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
