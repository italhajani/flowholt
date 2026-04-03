import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  EllipsisVertical,
  KeyRound,
  MessageSquare,
  Play,
  Radio,
  Shield,
  Slack,
  TestTube2,
  Webhook,
} from "lucide-react";

interface NodeDetailsPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

type TabId = "setup" | "configure" | "test";
type SectionId = "general" | "provider" | "schedule" | "retry" | "security";
type Field =
  | { k: "text" | "textarea"; label: string; value: string; helper?: string }
  | { k: "select"; label: string; value: string }
  | { k: "toggle"; label: string; value: boolean; helper?: string }
  | { k: "pair"; label: string; a: string; av: string; b: string; bv: string }
  | { k: "radio"; label: string; helper?: string };
type NodeSpec = {
  name: string;
  subtitle: string;
  icon: React.ElementType;
  iconClass: string;
  setup: [string, string][];
  configure: { id: SectionId; label: string; fields: Field[] }[];
  test: [string, string][];
  cta: string;
};

const specs: Record<string, NodeSpec> = {
  "trigger-1": {
    name: "Trigger",
    subtitle: "Time-based Trigger",
    icon: Webhook,
    iconClass: "text-blue-600",
    setup: [["Trigger type", "Webhook"], ["Source", "Support intake"], ["Method", "POST"], ["Response", "200 OK"]],
    configure: [
      { id: "general", label: "General Information", fields: [
        { k: "select", label: "Trigger Type", value: "Time-based Trigger" },
        { k: "text", label: "Title", value: "Support intake trigger" },
        { k: "select", label: "Status", value: "Active" },
        { k: "textarea", label: "Description", value: "Accept support requests from the intake endpoint." },
      ]},
      { id: "schedule", label: "Trigger Schedule", fields: [
        { k: "toggle", label: "all-day", value: false },
        { k: "pair", label: "starts", a: "Date", av: "11/11/2024", b: "Time", bv: "23:00" },
        { k: "pair", label: "ends", a: "Date", av: "12/11/2024", b: "Time", bv: "23:00" },
        { k: "select", label: "frequency", value: "none" },
        { k: "select", label: "Time zone", value: "UTC -5:00" },
      ]},
      { id: "retry", label: "Retry Settings", fields: [
        { k: "select", label: "Retry Interval", value: "Every 15 min." },
        { k: "select", label: "Max. Retries", value: "5" },
        { k: "select", label: "Timeout", value: "30 min." },
      ]},
    ],
    test: [["Webhook URL", "https://hooks.flowholt.ai/inbound/support"], ["Payload fields", "ticket_id, subject, customer_email"], ["Latest run", "No test received yet"]],
    cta: "Save & Continue",
  },
  "slack-1": {
    name: "Send Slack Alert",
    subtitle: "Action",
    icon: Slack,
    iconClass: "text-fuchsia-600",
    setup: [["App", "Slack"], ["Connection", "Support workspace bot"], ["Workspace", "FlowHolt Ops"], ["Destination", "#on-call-alerts"]],
    configure: [
      { id: "provider", label: "Provider parameters", fields: [
        { k: "text", label: "If", value: "If Condition" },
        { k: "text", label: "Vars", value: "+ Add Var" },
        { k: "textarea", label: "Message", value: "CPU Alert. Our systems are reporting elevated ticket severity." },
        { k: "text", label: "Blocks", value: "blocks" },
        { k: "text", label: "Channel", value: "#on-call-alerts" },
        { k: "text", label: "Slack_timestamp", value: "slack_timestamp" },
        { k: "text", label: "Thread_timestamp", value: "thread_timestamp" },
      ]},
      { id: "retry", label: "Error Handling", fields: [
        { k: "radio", label: "Enable Automatic Retry", helper: "Automatically retries the process if an error occurs." },
      ]},
      { id: "security", label: "Security", fields: [
        { k: "toggle", label: "Use signed delivery", value: true },
        { k: "toggle", label: "Mask channel variables", value: false },
      ]},
    ],
    test: [["Preview", "Posts message to #on-call-alerts"], ["Thread mode", "Uses incident thread when available"], ["Latest test", "Not run"]],
    cta: "Save & Continue",
  },
  "ai-1": {
    name: "LLM Settings",
    subtitle: "Anthropic",
    icon: Bot,
    iconClass: "text-violet-600",
    setup: [["Provider", "Anthropic"], ["Model family", "Claude Opus 4.1"], ["Connection", "Production LLM key"], ["Mode", "Custom prompt action"]],
    configure: [
      { id: "general", label: "General Settings", fields: [
        { k: "select", label: "Provider", value: "Anthropic" },
        { k: "select", label: "Model", value: "Claude Opus 4.1" },
        { k: "textarea", label: "Prompt", value: "Write a personalized email that recaps the last conversation, offers a relevant case study, and includes a calendar link for booking a call." },
        { k: "textarea", label: "Instructions", value: "Keep the response friendly, concise, and aligned with the prospect's last conversation." },
      ]},
      { id: "provider", label: "Provider Parameters", fields: [
        { k: "text", label: "Temperature", value: "0.3" },
        { k: "text", label: "Max tokens", value: "2048" },
        { k: "toggle", label: "Use streaming", value: true },
      ]},
      { id: "retry", label: "Error Handling", fields: [
        { k: "radio", label: "Enable Automatic Retry", helper: "Retry the model call when provider errors or timeouts occur." },
      ]},
    ],
    test: [["Sample input", "Customer cannot log in to dashboard"], ["Expected output", "priority: high, route: escalate"], ["Latest latency", "340ms"]],
    cta: "Save & Continue",
  },
  "condition-1": {
    name: "Priority Router",
    subtitle: "Logic",
    icon: AlertCircle,
    iconClass: "text-amber-600",
    setup: [["Mode", "If / else"], ["Field", "priority"], ["True branch", "Send Slack Alert"], ["False branch", "Slack Message"]],
    configure: [
      { id: "provider", label: "Provider parameters", fields: [
        { k: "text", label: "If", value: "priority == high" },
        { k: "text", label: "Vars", value: "+ Add Var" },
        { k: "text", label: "Blocks", value: "route_priority" },
      ]},
      { id: "retry", label: "Error Handling", fields: [
        { k: "radio", label: "Enable Automatic Retry", helper: "Retry expression resolution if upstream variables arrive late." },
      ]},
    ],
    test: [["Expression", "priority == high"], ["Success path", "Routes to urgent branch"], ["Latest result", "Matched true"]],
    cta: "Save & Test",
  },
  "email-1": {
    name: "Send Email Alert",
    subtitle: "Notification",
    icon: MessageSquare,
    iconClass: "text-emerald-600",
    setup: [["Channel", "Email"], ["Template", "Urgent escalation"], ["Identity", "ops@flowholt.com"], ["Audience", "On-call rotation"]],
    configure: [
      { id: "provider", label: "Notification", fields: [
        { k: "toggle", label: "System", value: false },
        { k: "toggle", label: "Procedural", value: true },
        { k: "toggle", label: "New tickets", value: false },
        { k: "toggle", label: "Storage", value: true },
      ]},
      { id: "general", label: "Servers", fields: [
        { k: "select", label: "Server", value: "US-East" },
        { k: "select", label: "Backup Server", value: "EU-Central" },
        { k: "toggle", label: "Automatic Switch", value: true, helper: "Switch automatically to backup servers if the main server is down." },
      ]},
      { id: "retry", label: "Error Handling", fields: [
        { k: "radio", label: "Enable Automatic Retry", helper: "Automatically retries the process if an error occurs." },
      ]},
    ],
    test: [["Recipient", "oncall@flowholt.com"], ["Subject", "Urgent ticket escalation"], ["Delivery status", "Ready to test"]],
    cta: "Save & Test",
  },
};

const tabs: { id: TabId; label: string }[] = [{ id: "setup", label: "Setup" }, { id: "configure", label: "Configure" }, { id: "test", label: "Test" }];
const icons: Record<SectionId, React.ElementType> = { general: AlertCircle, provider: KeyRound, schedule: Clock3, retry: Radio, security: Shield };

const Toggle = ({ enabled }: { enabled: boolean }) => (
  <div className={cn("w-8 h-[18px] rounded-full relative transition-colors", enabled ? "bg-[#6558f5]" : "bg-slate-300")}>
    <div className={cn("absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all", enabled ? "left-[16px]" : "left-[2px]")} />
  </div>
);

const FieldView = ({ field }: { field: Field }) => {
  const inputClass = "w-full rounded-[9px] border border-slate-200 bg-white px-3 text-[12px] text-slate-700";
  if (field.k === "toggle") return <div className="flex items-start justify-between gap-4"><div className="pr-3"><div className="text-[12px] font-medium text-slate-800 leading-5">{field.label}</div>{field.helper && <div className="text-[10px] text-slate-400 mt-0.5 leading-4">{field.helper}</div>}</div><div className="pt-0.5"><Toggle enabled={field.value} /></div></div>;
  if (field.k === "radio") return <div className="flex items-start gap-2.5"><div className="w-[13px] h-[13px] rounded-full border border-slate-300 mt-0.5 shrink-0" /><div><div className="text-[12px] font-medium text-slate-800 leading-5">{field.label}</div>{field.helper && <div className="text-[10px] text-slate-400 mt-0.5 leading-4">{field.helper}</div>}</div></div>;
  if (field.k === "pair") return <div><div className="text-[11px] font-medium text-slate-800 mb-1.5">{field.label}</div><div className="grid grid-cols-2 gap-2"><div><div className="text-[10px] text-slate-400 mb-1">{field.a}</div><div className={`${inputClass} h-9 flex items-center`}>{field.av}</div></div><div><div className="text-[10px] text-slate-400 mb-1">{field.b}</div><div className={`${inputClass} h-9 flex items-center`}>{field.bv}</div></div></div></div>;
  return <div><div className="text-[11px] font-medium text-slate-800 mb-1.5">{field.label}</div>{field.k === "textarea" ? <textarea readOnly value={field.value} className={`${inputClass} min-h-[72px] py-2 resize-none leading-5`} /> : field.k === "select" ? <div className={`${inputClass} h-9 flex items-center justify-between`}><span>{field.value}</span><ChevronDown size={13} className="text-slate-400" /></div> : <input readOnly value={field.value} className={`${inputClass} h-9`} />}{field.helper && <div className="text-[10px] text-slate-400 mt-1.5 leading-4">{field.helper}</div>}</div>;
};

const NodeDetailsPanelV2: React.FC<NodeDetailsPanelProps> = ({ nodeId, onClose }) => {
  const [tab, setTab] = useState<TabId>("configure");
  const [open, setOpen] = useState<SectionId[]>(["general", "provider", "schedule", "retry", "security"]);
  const spec = useMemo(() => nodeId ? specs[nodeId] ?? specs["trigger-1"] : null, [nodeId]);
  if (!spec) return null;
  const Icon = spec.icon;

  return (
    <div className="w-[320px] bg-[#fcfcfd] border-l border-slate-200 shrink-0 animate-slide-in-right">
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-[12px] border border-slate-200 bg-white flex items-center justify-center shrink-0"><Icon size={18} className={spec.iconClass} /></div>
              <div className="min-w-0"><div className="text-[14px] font-semibold text-slate-900 truncate leading-5">{spec.name}</div><div className="text-[12px] text-slate-500 truncate">{spec.subtitle}</div></div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50"><EllipsisVertical size={15} /></button>
          </div>
        </div>

        <div className="px-4 py-3 bg-white">
          <div className="grid grid-cols-3 rounded-[12px] border border-slate-200 bg-[#fafafa] p-1">
            {tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={cn("h-7 rounded-[9px] text-[11px] font-medium transition-colors", tab === item.id ? "bg-[#6558f5] text-white" : "text-slate-500 hover:text-slate-900")}>{item.label}</button>)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {tab === "setup" && <div>{spec.setup.map(([k, v]) => <div key={k} className="py-3.5 border-b border-slate-200 last:border-b-0"><div className="text-[11px] text-slate-500">{k}</div><div className="text-[12px] font-medium text-slate-900 mt-1.5 leading-5">{v}</div></div>)}</div>}
          {tab === "configure" && <div className="space-y-4">{spec.configure.map((section) => { const SectionIcon = icons[section.id]; const isOpen = open.includes(section.id); return <section key={section.id} className="pb-3 border-b border-slate-200 last:border-b-0"><button onClick={() => setOpen((cur) => cur.includes(section.id) ? cur.filter((x) => x !== section.id) : [...cur, section.id])} className="w-full flex items-center justify-between gap-3 text-left"><div className="flex items-center gap-2"><SectionIcon size={13} className="text-slate-500" /><span className="text-[12px] font-semibold text-slate-900">{section.label}</span></div><ChevronDown size={14} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} /></button>{isOpen && <div className="mt-3.5 space-y-3.5">{section.fields.map((field, i) => <FieldView key={`${section.id}-${i}-${field.label}`} field={field} />)}</div>}</section>; })}</div>}
          {tab === "test" && <div className="space-y-3.5"><div className="rounded-[12px] border border-slate-200 bg-white px-3.5 py-3"><div className="flex items-center gap-2 text-[12px] font-medium text-slate-900"><TestTube2 size={13} className="text-slate-500" />Ready for test run</div><div className="text-[10px] text-slate-500 mt-1.5 leading-4">Use sample data to verify this step before publishing.</div></div>{spec.test.map(([k, v]) => <div key={k} className="py-3.5 border-b border-slate-200 last:border-b-0"><div className="text-[11px] text-slate-500">{k}</div><div className="text-[12px] font-medium text-slate-900 mt-1.5 leading-5">{v}</div></div>)}</div>}
        </div>

        <div className="px-4 py-4 border-t border-slate-200 bg-white">
          <button className="w-full h-10 rounded-[10px] bg-[#6558f5] text-white text-[12px] font-semibold hover:brightness-105 transition-colors inline-flex items-center justify-center gap-2">
            {tab === "test" ? <Play size={14} /> : tab === "setup" ? <Copy size={14} /> : <CheckCircle2 size={14} />}
            {tab === "test" ? "Run Test" : spec.cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPanelV2;
