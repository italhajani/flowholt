import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Pin,
  Play,
  Trash2,
  X,
} from "lucide-react";

interface NodeDetailsPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

type TabId = "settings" | "input" | "output" | "logs";

type NodeInfo = {
  name: string;
  type: string;
  description: string;
  values: {
    model?: string;
    temperature?: string;
    tokens?: string;
    credentials?: string;
    timeout?: string;
    retries?: string;
    fallback?: string;
    webhook?: string;
    expression?: string;
  };
};

const nodeData: Record<string, NodeInfo> = {
  "ai-1": {
    name: "GPT-4 Classifier",
    type: "AI Model",
    description: "Classifies incoming support tickets by priority and route intent.",
    values: {
      model: "GPT-4",
      temperature: "0.3",
      tokens: "2048",
      credentials: "OpenAI production key",
      timeout: "30 seconds",
      retries: "3 retries with 1 second delay",
      fallback: "Pause workflow on provider failure",
    },
  },
  "trigger-1": {
    name: "Webhook Trigger",
    type: "Trigger",
    description: "Accepts incoming support events from external systems.",
    values: {
      webhook: "https://hooks.flowholt.ai/inbound/tickets",
      timeout: "Always on",
      retries: "Not required for trigger nodes",
      fallback: "Reject invalid payloads",
    },
  },
  "condition-1": {
    name: "Priority Router",
    type: "Condition",
    description: "Routes records based on the classified urgency band.",
    values: {
      expression: "{{ priority === 'high' }}",
      timeout: "10 seconds",
      retries: "1 retry",
      fallback: "Continue to default branch",
    },
  },
  "email-1": {
    name: "Send Email Alert",
    type: "Action",
    description: "Delivers urgent escalation emails to the on-call group.",
    values: {
      credentials: "SMTP workspace mailer",
      timeout: "15 seconds",
      retries: "2 retries with 2 second delay",
      fallback: "Queue for manual resend",
    },
  },
  "slack-1": {
    name: "Slack Message",
    type: "Action",
    description: "Posts structured ticket updates to the support channel.",
    values: {
      credentials: "Slack bot connection",
      timeout: "10 seconds",
      retries: "2 retries with 1 second delay",
      fallback: "Send email fallback",
    },
  },
};

const inputRows = [
  ["ticket_id", "TKT-4829"],
  ["subject", "Cannot access dashboard"],
  ["priority_hint", "unknown"],
  ["customer_email", "jane@acme.co"],
];

const outputRows = [
  ["priority", "high"],
  ["category", "access_issue"],
  ["confidence", "0.94"],
  ["suggested_action", "escalate"],
];

const logRows = [
  ["10:15:01", "Execution started"],
  ["10:15:01", "Input payload validated"],
  ["10:15:02", "Provider response received"],
  ["10:15:02", "Node completed in 340ms"],
];

const tabs: { id: TabId; label: string }[] = [
  { id: "settings", label: "Settings" },
  { id: "input", label: "Input" },
  { id: "output", label: "Output" },
  { id: "logs", label: "Logs" },
];

const SmallButton: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <button
    className={cn(
      "h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors",
      className,
    )}
  >
    {children}
  </button>
);

const Toggle: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className={cn("w-11 h-6 rounded-full relative border transition-colors", enabled ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-300")}>
    <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", enabled ? "left-[22px]" : "left-[2px]")} />
  </div>
);

const DetailRow: React.FC<{
  label: string;
  value?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}> = ({ label, value, description, action }) => (
  <div className="py-4 border-b border-slate-200 last:border-b-0">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-slate-900">{label}</div>
        {description && <div className="text-[13px] text-slate-500 mt-1">{description}</div>}
        {value && <div className="text-[13px] text-slate-700 mt-2 leading-6 break-words">{value}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </div>
);

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ nodeId, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>("settings");
  const [pinned, setPinned] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const node = useMemo<NodeInfo>(() => {
    if (!nodeId) {
      return {
        name: "Node",
        type: "Unknown",
        description: "",
        values: {},
      };
    }

    return nodeData[nodeId] ?? {
      name: "Node",
      type: "Unknown",
      description: "",
      values: {},
    };
  }, [nodeId]);

  if (!nodeId) return null;

  return (
    <div className="w-[460px] bg-white border-l border-studio-divider/30 shrink-0 animate-slide-in-right">
      <div className="h-full grid grid-rows-[56px_minmax(0,1fr)_64px]">
        <div className="flex items-center justify-between px-5 border-b border-slate-200">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold text-slate-900 truncate">{node.name}</div>
            <div className="text-[13px] text-slate-500 mt-0.5">{node.description}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={() => setPinned((value) => !value)}
              className={cn("w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50", pinned ? "text-slate-900" : "text-slate-500")}
            >
              <Pin size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[138px_minmax(0,1fr)] min-h-0">
          <aside className="border-r border-slate-200 bg-slate-50/50 px-3 py-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors",
                    activeTab === tab.id ? "bg-blue-50 text-[#103b71] font-semibold" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto px-6 py-5">
            {activeTab === "settings" && (
              <div>
                <div className="pb-5 border-b border-slate-200">
                  <div className="text-[21px] font-bold text-slate-900">Node settings</div>
                  <div className="text-[14px] text-slate-500 mt-1">Configure runtime options, credentials, and fallback behavior.</div>
                </div>

                <DetailRow label="Node type" value={node.type} />
                {"model" in node.values && node.values.model && (
                  <DetailRow
                    label="Model"
                    value={node.values.model}
                    action={
                      <button className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 inline-flex items-center gap-2">
                        <span>Change</span>
                        <ChevronDown size={14} />
                      </button>
                    }
                  />
                )}
                {"temperature" in node.values && node.values.temperature && <DetailRow label="Temperature" value={node.values.temperature} action={<SmallButton>Edit</SmallButton>} />}
                {"tokens" in node.values && node.values.tokens && <DetailRow label="Max tokens" value={node.values.tokens} action={<SmallButton>Edit</SmallButton>} />}
                {"credentials" in node.values && node.values.credentials && (
                  <DetailRow
                    label="Credentials"
                    value={
                      <div className="flex items-center gap-2">
                        <span>{showSecret ? node.values.credentials : "Connected secure asset"}</span>
                        <button type="button" onClick={() => setShowSecret((value) => !value)} className="text-slate-400 hover:text-slate-700">
                          {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    }
                    action={<SmallButton>Rotate</SmallButton>}
                  />
                )}
                {"webhook" in node.values && node.values.webhook && (
                  <DetailRow
                    label="Webhook URL"
                    value={node.values.webhook}
                    action={<SmallButton>Copy</SmallButton>}
                  />
                )}
                {"expression" in node.values && node.values.expression && <DetailRow label="Condition expression" value={<span className="font-mono">{node.values.expression}</span>} action={<SmallButton>Edit</SmallButton>} />}
                {"timeout" in node.values && node.values.timeout && <DetailRow label="Timeout" value={node.values.timeout} action={<SmallButton>Edit</SmallButton>} />}
                {"retries" in node.values && node.values.retries && <DetailRow label="Retry policy" value={node.values.retries} action={<Toggle enabled={true} />} />}
                {"fallback" in node.values && node.values.fallback && <DetailRow label="Fallback behavior" value={node.values.fallback} action={<SmallButton>Edit</SmallButton>} />}
                <DetailRow label="Continue on failure" description="Keep downstream steps running even when this node fails." action={<Toggle enabled={false} />} />
              </div>
            )}

            {activeTab === "input" && (
              <div>
                <div className="pb-5 border-b border-slate-200">
                  <div className="text-[21px] font-bold text-slate-900">Input</div>
                  <div className="text-[14px] text-slate-500 mt-1">Inspect the payload handed off from the previous step.</div>
                </div>
                {inputRows.map(([label, value]) => (
                  <DetailRow key={label} label={label} value={value} action={<SmallButton>Copy</SmallButton>} />
                ))}
              </div>
            )}

            {activeTab === "output" && (
              <div>
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <div className="text-[21px] font-bold text-slate-900">Output</div>
                    <div className="text-[14px] text-slate-500 mt-1">Review the transformed values emitted by this node.</div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-medium shrink-0">
                    <CheckCircle2 size={12} /> Success
                  </span>
                </div>
                {outputRows.map(([label, value]) => (
                  <DetailRow key={label} label={label} value={value} action={<SmallButton>Copy</SmallButton>} />
                ))}
              </div>
            )}

            {activeTab === "logs" && (
              <div>
                <div className="pb-5 border-b border-slate-200">
                  <div className="text-[21px] font-bold text-slate-900">Logs</div>
                  <div className="text-[14px] text-slate-500 mt-1">Track the latest execution messages for this node.</div>
                </div>
                {logRows.map(([time, value]) => (
                  <DetailRow key={`${time}-${value}`} label={time} value={value} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 border-t border-slate-200 flex items-center justify-between gap-3">
          <button className="h-9 px-4 rounded-lg bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
            <Play size={13} />
            Test step
          </button>
          <div className="flex items-center gap-2">
            <SmallButton><span className="inline-flex items-center gap-2"><Copy size={13} /> Duplicate</span></SmallButton>
            <SmallButton className="text-rose-600"><span className="inline-flex items-center gap-2"><Trash2 size={13} /> Delete</span></SmallButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPanel;
