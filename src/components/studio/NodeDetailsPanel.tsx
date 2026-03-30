import React, { useState } from "react";
import {
  X, Settings2, Sliders, ToggleLeft, Play, Pin, FileText, AlertTriangle,
  RotateCcw, Clock, ChevronDown, ChevronRight, Code2, Link2, Key, Hash,
  ArrowRightLeft, Braces, Copy, Trash2, ExternalLink, CheckCircle2, XCircle,
  Timer, Zap, Variable, MessageSquare, Eye, EyeOff,
} from "lucide-react";

interface NodeDetailsPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

type TabId = "settings" | "input" | "output" | "logs";

const nodeData: Record<string, {
  name: string; type: string; model: string; temp: number; tokens: number;
  description: string; credentials: string; retryOnFail: boolean; retryCount: number;
  retryInterval: number; continueOnFail: boolean; timeout: number;
}> = {
  "ai-1": {
    name: "GPT-4 Classifier", type: "AI Model", model: "GPT-4", temp: 0.3, tokens: 2048,
    description: "Classifies incoming support tickets by priority level",
    credentials: "OpenAI API Key", retryOnFail: true, retryCount: 3, retryInterval: 1000,
    continueOnFail: false, timeout: 30000,
  },
  "trigger-1": {
    name: "Webhook Trigger", type: "Trigger", model: "—", temp: 0, tokens: 0,
    description: "Receives incoming POST requests from ticketing system",
    credentials: "—", retryOnFail: false, retryCount: 0, retryInterval: 0,
    continueOnFail: false, timeout: 0,
  },
  "condition-1": {
    name: "Priority Router", type: "Condition", model: "—", temp: 0, tokens: 0,
    description: "Routes tickets based on classified priority level",
    credentials: "—", retryOnFail: false, retryCount: 0, retryInterval: 0,
    continueOnFail: true, timeout: 0,
  },
  "email-1": {
    name: "Send Email Alert", type: "Action", model: "—", temp: 0, tokens: 0,
    description: "Sends urgent notification email to on-call team",
    credentials: "SMTP / Gmail", retryOnFail: true, retryCount: 2, retryInterval: 2000,
    continueOnFail: false, timeout: 15000,
  },
  "slack-1": {
    name: "Slack Message", type: "Action", model: "—", temp: 0, tokens: 0,
    description: "Posts to #support-queue channel with ticket details",
    credentials: "Slack Bot Token", retryOnFail: true, retryCount: 2, retryInterval: 1000,
    continueOnFail: false, timeout: 10000,
  },
};

const sampleInput = {
  ticket_id: "TKT-4829",
  subject: "Cannot access dashboard",
  body: "I've been unable to log into the dashboard since this morning...",
  customer_email: "jane@acme.co",
  created_at: "2026-03-30T10:15:00Z",
};

const sampleOutput = {
  priority: "high",
  category: "access_issue",
  confidence: 0.94,
  suggested_action: "escalate",
  tags: ["login", "dashboard", "urgent"],
};

const sampleLogs = [
  { time: "10:15:01", level: "info", message: "Node execution started" },
  { time: "10:15:01", level: "info", message: "Received input: 1 item" },
  { time: "10:15:02", level: "info", message: "API call to OpenAI (gpt-4)" },
  { time: "10:15:02", level: "success", message: "Classification complete: high priority" },
  { time: "10:15:02", level: "info", message: "Execution finished in 340ms" },
];

const tabs: { id: TabId; label: string }[] = [
  { id: "settings", label: "Settings" },
  { id: "input", label: "Input" },
  { id: "output", label: "Output" },
  { id: "logs", label: "Logs" },
];

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ nodeId, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>("settings");
  const [errorHandlingOpen, setErrorHandlingOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  if (!nodeId) return null;
  const node = nodeData[nodeId] || {
    name: "Node", type: "Unknown", model: "—", temp: 0, tokens: 0,
    description: "", credentials: "—", retryOnFail: false, retryCount: 0,
    retryInterval: 0, continueOnFail: false, timeout: 0,
  };

  const logLevelColors: Record<string, string> = {
    info: "text-studio-text-tertiary",
    success: "text-studio-success",
    error: "text-destructive",
    warn: "text-studio-warning",
  };

  return (
    <div className="w-80 bg-studio-surface flex flex-col shrink-0 animate-slide-in-right border-l border-studio-divider/30">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[12px] font-semibold text-studio-text-primary truncate">{node.name}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-primary/8 text-primary text-[9px] font-medium shrink-0">
            {node.type}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setIsPinned(!isPinned)} className={`studio-icon-btn w-5 h-5 ${isPinned ? "text-primary" : ""}`}>
            <Pin size={11} />
          </button>
          <button onClick={onClose} className="studio-icon-btn w-5 h-5">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center px-3 gap-0 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1.5 text-[10px] font-medium transition-all duration-200 border-b-2 ${
              activeTab === tab.id
                ? "text-primary border-primary"
                : "text-studio-text-tertiary border-transparent hover:text-studio-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {activeTab === "settings" && (
          <>
            {/* Description */}
            <div>
              <label className="config-label">Description</label>
              <p className="text-[10px] text-studio-text-secondary leading-relaxed mt-1">{node.description}</p>
            </div>

            {/* Model configuration */}
            {node.model !== "—" && (
              <>
                <div>
                  <label className="config-label flex items-center gap-1">
                    <Settings2 size={10} />
                    Model
                  </label>
                  <div className="config-field flex items-center justify-between">
                    <span>{node.model}</span>
                    <ChevronDown size={10} className="text-studio-text-tertiary" />
                  </div>
                </div>

                <div>
                  <label className="config-label flex items-center gap-1">
                    <Sliders size={10} />
                    Temperature
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-studio-bg overflow-hidden">
                      <div
                        className="h-full rounded-full bg-studio-teal transition-all duration-300"
                        style={{ width: `${node.temp * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-studio-text-secondary w-6 text-right">{node.temp}</span>
                  </div>
                </div>

                <div>
                  <label className="config-label flex items-center gap-1">
                    <Hash size={10} />
                    Max Tokens
                  </label>
                  <div className="config-field font-mono">{node.tokens}</div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="config-label flex items-center gap-1">
                    <ToggleLeft size={10} />
                    Streaming
                  </label>
                  <div className="w-7 h-4 rounded-full bg-studio-teal p-0.5 cursor-pointer transition-colors duration-200">
                    <div className="w-3 h-3 rounded-full bg-primary-foreground translate-x-3 transition-transform duration-200" />
                  </div>
                </div>

                {/* System prompt */}
                <div>
                  <label className="config-label flex items-center gap-1">
                    <MessageSquare size={10} />
                    System Prompt
                  </label>
                  <textarea
                    className="config-textarea"
                    rows={3}
                    defaultValue="You are a support ticket classifier. Classify the priority as: low, medium, high, urgent."
                    readOnly
                  />
                </div>
              </>
            )}

            {/* Credentials */}
            {node.credentials !== "—" && (
              <div>
                <label className="config-label flex items-center gap-1">
                  <Key size={10} />
                  Credentials
                </label>
                <div className="config-field flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-studio-success" />
                    {node.credentials}
                  </span>
                  <ExternalLink size={10} className="text-studio-text-tertiary" />
                </div>
              </div>
            )}

            {/* Webhook URL for trigger */}
            {node.type === "Trigger" && (
              <div>
                <label className="config-label flex items-center gap-1">
                  <Link2 size={10} />
                  Webhook URL
                </label>
                <div className="config-field flex items-center justify-between group">
                  <span className="truncate text-studio-text-tertiary">https://hooks.wf.io/abc123</span>
                  <Copy size={10} className="text-studio-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
            )}

            {/* Condition expressions */}
            {node.type === "Condition" && (
              <div>
                <label className="config-label flex items-center gap-1">
                  <Code2 size={10} />
                  Condition Expression
                </label>
                <div className="bg-studio-bg rounded-lg p-2 mt-1">
                  <code className="text-[10px] font-mono text-studio-text-primary">
                    {"{{ $json.priority === 'high' }}"}
                  </code>
                </div>
                <button className="mt-1 text-[9px] text-primary hover:text-primary/80 transition-colors duration-200">
                  + Add condition
                </button>
              </div>
            )}

            {/* Timeout */}
            {node.timeout > 0 && (
              <div>
                <label className="config-label flex items-center gap-1">
                  <Timer size={10} />
                  Timeout
                </label>
                <div className="config-field font-mono">{node.timeout / 1000}s</div>
              </div>
            )}

            {/* Error handling collapsible */}
            <div className="border-t border-studio-divider/30 pt-2">
              <button
                onClick={() => setErrorHandlingOpen(!errorHandlingOpen)}
                className="w-full flex items-center gap-1.5 text-[10px] font-medium text-studio-text-secondary hover:text-studio-text-primary transition-all duration-200"
              >
                {errorHandlingOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                <AlertTriangle size={10} />
                Error Handling
              </button>
              {errorHandlingOpen && (
                <div className="mt-2 space-y-2 pl-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-studio-text-secondary">Retry on fail</span>
                    <div className={`w-7 h-4 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${node.retryOnFail ? "bg-studio-teal" : "bg-studio-divider"}`}>
                      <div className={`w-3 h-3 rounded-full bg-primary-foreground transition-transform duration-200 ${node.retryOnFail ? "translate-x-3" : ""}`} />
                    </div>
                  </div>
                  {node.retryOnFail && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-studio-text-secondary">Max retries</span>
                        <span className="text-[10px] font-mono text-studio-text-primary">{node.retryCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-studio-text-secondary">Wait between</span>
                        <span className="text-[10px] font-mono text-studio-text-primary">{node.retryInterval}ms</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-studio-text-secondary">Continue on fail</span>
                    <div className={`w-7 h-4 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${node.continueOnFail ? "bg-studio-teal" : "bg-studio-divider"}`}>
                      <div className={`w-3 h-3 rounded-full bg-primary-foreground transition-transform duration-200 ${node.continueOnFail ? "translate-x-3" : ""}`} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="border-t border-studio-divider/30 pt-2">
              <button
                onClick={() => setNotesOpen(!notesOpen)}
                className="w-full flex items-center gap-1.5 text-[10px] font-medium text-studio-text-secondary hover:text-studio-text-primary transition-all duration-200"
              >
                {notesOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                <FileText size={10} />
                Notes
              </button>
              {notesOpen && (
                <textarea
                  className="config-textarea mt-2"
                  rows={3}
                  placeholder="Add notes about this node..."
                />
              )}
            </div>

            {/* Runtime info */}
            <div className="border-t border-studio-divider/30 pt-2">
              <span className="config-label">Last Execution</span>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                <div className="p-2 rounded-lg bg-studio-bg text-center">
                  <div className="text-[8px] text-studio-text-tertiary uppercase">Latency</div>
                  <div className="text-[11px] font-semibold text-studio-text-primary mt-0.5">340ms</div>
                </div>
                <div className="p-2 rounded-lg bg-studio-bg text-center">
                  <div className="text-[8px] text-studio-text-tertiary uppercase">Success</div>
                  <div className="text-[11px] font-semibold text-studio-success mt-0.5">98.4%</div>
                </div>
                <div className="p-2 rounded-lg bg-studio-bg text-center">
                  <div className="text-[8px] text-studio-text-tertiary uppercase">Runs</div>
                  <div className="text-[11px] font-semibold text-studio-text-primary mt-0.5">1,247</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "input" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="config-label">Input Data</span>
              <div className="flex items-center gap-1">
                <button className="studio-icon-btn w-5 h-5"><Copy size={10} /></button>
                <button className={`studio-icon-btn w-5 h-5 ${isPinned ? "text-primary" : ""}`}>
                  <Pin size={10} />
                </button>
              </div>
            </div>
            <div className="text-[9px] text-studio-text-tertiary">1 item received from previous node</div>
            <div className="bg-studio-bg rounded-lg p-2.5 overflow-x-auto">
              <pre className="text-[10px] font-mono text-studio-text-primary leading-relaxed whitespace-pre">
{JSON.stringify(sampleInput, null, 2)}
              </pre>
            </div>

            {/* Schema view */}
            <div className="mt-2">
              <span className="config-label">Schema</span>
              <div className="mt-1.5 space-y-1">
                {Object.entries(sampleInput).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-studio-surface-hover transition-all duration-200">
                    <Variable size={9} className="text-studio-text-tertiary shrink-0" />
                    <span className="text-[10px] font-mono text-primary">{key}</span>
                    <span className="text-[9px] text-studio-text-tertiary ml-auto">{typeof val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "output" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="config-label">Output Data</span>
              <div className="flex items-center gap-1">
                <button className="studio-icon-btn w-5 h-5"><Copy size={10} /></button>
                <button className="studio-icon-btn w-5 h-5"><Pin size={10} /></button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <CheckCircle2 size={10} className="text-studio-success" />
              <span className="text-studio-success font-medium">Success</span>
              <span className="text-studio-text-tertiary">· 340ms · 1 item</span>
            </div>
            <div className="bg-studio-bg rounded-lg p-2.5 overflow-x-auto">
              <pre className="text-[10px] font-mono text-studio-text-primary leading-relaxed whitespace-pre">
{JSON.stringify(sampleOutput, null, 2)}
              </pre>
            </div>

            {/* Output mapping */}
            <div className="mt-2">
              <span className="config-label flex items-center gap-1">
                <ArrowRightLeft size={10} />
                Output Mapping
              </span>
              <div className="mt-1.5 space-y-1">
                {Object.entries(sampleOutput).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-studio-surface-hover transition-all duration-200">
                    <Braces size={9} className="text-studio-text-tertiary shrink-0" />
                    <span className="text-[10px] font-mono text-primary">{key}</span>
                    <span className="text-[9px] text-studio-text-tertiary ml-auto truncate max-w-[100px]">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="config-label">Execution Logs</span>
              <button className="text-[9px] text-primary hover:text-primary/80 transition-colors duration-200">Clear</button>
            </div>
            <div className="space-y-0.5">
              {sampleLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 px-2 py-1 rounded-lg hover:bg-studio-surface-hover transition-all duration-200">
                  <span className="text-[9px] font-mono text-studio-text-tertiary shrink-0 mt-0.5">{log.time}</span>
                  <span className={`text-[10px] ${logLevelColors[log.level] || "text-studio-text-secondary"}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>

            {/* Execution timeline */}
            <div className="border-t border-studio-divider/30 pt-2 mt-3">
              <span className="config-label">Execution Timeline</span>
              <div className="mt-2 space-y-1.5">
                {sampleLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${log.level === "success" ? "bg-studio-success" : "bg-studio-divider"}`} />
                      {i < sampleLogs.length - 1 && <div className="w-px h-3 bg-studio-divider/60" />}
                    </div>
                    <span className="text-[9px] text-studio-text-secondary">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-2 shrink-0 flex items-center gap-1.5 border-t border-studio-divider/30">
        <button className="flex-1 flex items-center justify-center gap-1 h-7 rounded-lg bg-primary/8 text-primary text-[10px] font-medium hover:bg-primary/15 transition-all duration-200">
          <Play size={10} />
          Test Step
        </button>
        <button className="studio-icon-btn w-7 h-7">
          <Copy size={11} />
        </button>
        <button className="studio-icon-btn w-7 h-7 hover:text-destructive">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
};

export default NodeDetailsPanel;
