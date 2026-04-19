import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Sparkles, Bot, User, Trash2, Copy, ChevronDown, Wand2, Code2,
  GitBranch, Play, ArrowRight, Wrench, AlertTriangle, CheckCircle2, Lightbulb,
  Zap, FileJson, Settings, Eye, MessageSquare, Hammer, RotateCcw, Diff,
  ChevronRight, Hash, AtSign, Braces, Cpu, Target, Layers, Check, XCircle,
  ThumbsUp, ThumbsDown, RefreshCw, Maximize2, Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
type CopilotMode = "ask" | "build";
type ReviewStatus = "pending" | "accepted" | "rejected";

interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  actions?: CopilotAction[];
  nodePreview?: NodePreview[];
  codeBlock?: string;
  thinking?: boolean;
  diff?: DiffChange[];
  toolCalls?: ToolCall[];
  tokenUsage?: { input: number; output: number; cost: string };
  mentionedNodes?: string[];
}

interface CopilotAction {
  label: string;
  icon: React.ElementType;
  variant: "primary" | "secondary" | "ghost";
  onClick?: () => void;
}

interface NodePreview {
  name: string;
  type: "trigger" | "integration" | "ai" | "logic" | "output" | "data";
  status: "ready" | "new" | "modified" | "removed";
}

interface DiffChange {
  nodeId: string;
  nodeName: string;
  action: "add" | "modify" | "remove" | "reorder";
  details: string;
  reviewStatus: ReviewStatus;
}

interface ToolCall {
  tool: string;
  args: string;
  result: string;
  duration: string;
}

const typeColors: Record<string, string> = {
  trigger: "bg-green-100 text-green-700 border-green-200",
  integration: "bg-violet-100 text-violet-700 border-violet-200",
  ai: "bg-zinc-100 text-zinc-700 border-zinc-200",
  logic: "bg-blue-100 text-blue-700 border-blue-200",
  output: "bg-amber-100 text-amber-700 border-amber-200",
  data: "bg-teal-100 text-teal-700 border-teal-200",
};

const diffActionColors: Record<string, string> = {
  add: "text-green-600 bg-green-50",
  modify: "text-blue-600 bg-blue-50",
  remove: "text-red-600 bg-red-50",
  reorder: "text-amber-600 bg-amber-50",
};

const diffActionIcons: Record<string, React.ElementType> = {
  add: Zap,
  modify: Wrench,
  remove: XCircle,
  reorder: Layers,
};

/* ── Quick actions per mode ── */
const askActions = [
  { label: "Explain this workflow", icon: Lightbulb },
  { label: "Debug last error", icon: AlertTriangle },
  { label: "Suggest improvements", icon: Sparkles },
  { label: "What does @Score with AI do?", icon: AtSign },
  { label: "Generate test data", icon: FileJson },
  { label: "Show execution stats", icon: Target },
];

const buildActions = [
  { label: "Build a lead scoring pipeline", icon: Wand2 },
  { label: "Add error handling to all nodes", icon: Wrench },
  { label: "Add Slack notification step", icon: Zap },
  { label: "Convert to batch processing", icon: Layers },
  { label: "Add retry logic for HTTP nodes", icon: RefreshCw },
  { label: "Add data validation step", icon: Check },
];

/* ── Context ── */
const contextInfo = {
  workflowName: "Lead Qualification Pipeline",
  nodeCount: 7,
  lastExecution: "2 min ago",
  executionStatus: "success" as const,
  model: "GPT-4o",
  tokensUsed: "2.4K",
  selectedNode: null as string | null,
};

const workflowNodes = [
  { id: "n1", name: "Webhook Trigger", type: "trigger" },
  { id: "n2", name: "Score with AI", type: "ai" },
  { id: "n3", name: "Route by Score", type: "logic" },
  { id: "n4", name: "Enrich via Clearbit", type: "integration" },
  { id: "n5", name: "Notify on Slack", type: "output" },
  { id: "n6", name: "Log to Database", type: "data" },
  { id: "n7", name: "Error Handler", type: "logic" },
];

const assistantGreetings: Record<CopilotMode, CopilotMessage> = {
  ask: {
    id: "greet-ask",
    role: "assistant",
    content: "I have full context of your **Lead Qualification Pipeline** (7 nodes, last run 2 min ago — success). Ask me anything about this workflow, or mention a specific node with **@**.",
  },
  build: {
    id: "greet-build",
    role: "assistant",
    content: "I'm in **Build mode**. Describe what you want to build or modify and I'll generate a plan with workflow changes. You can review and apply each change individually.\n\nTry: *\"Add retry logic for HTTP nodes\"* or *\"Build a data validation step after the trigger\"*",
  },
};

interface StudioCopilotPanelProps {
  onClose: () => void;
}

export function StudioCopilotPanel({ onClose }: StudioCopilotPanelProps) {
  const [mode, setMode] = useState<CopilotMode>("ask");
  const [messages, setMessages] = useState<CopilotMessage[]>([assistantGreetings.ask]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [nodeFilter, setNodeFilter] = useState("");
  const [expanded, setExpanded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scroll = useCallback(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), []);
  useEffect(() => { scroll(); }, [messages, scroll]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const switchMode = (newMode: CopilotMode) => {
    setMode(newMode);
    setMessages([assistantGreetings[newMode]]);
    setInput("");
  };

  const insertNodeMention = (nodeName: string) => {
    setInput((p) => p + `@${nodeName} `);
    setShowNodePicker(false);
    setNodeFilter("");
    inputRef.current?.focus();
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    const mentionedNodes = workflowNodes.filter(n => text.includes(`@${n.name}`)).map(n => n.name);
    const userMsg: CopilotMessage = { id: `u-${Date.now()}`, role: "user", content: text.trim(), mentionedNodes };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    setTimeout(() => {
      let response: Partial<CopilotMessage> = { content: "I'll analyze your workflow and get back to you with specific suggestions." };

      if (mode === "build") {
        if (text.toLowerCase().includes("error handling") || text.toLowerCase().includes("retry")) {
          response = {
            content: "I've prepared the following changes to add error handling:",
            diff: [
              { nodeId: "n4", nodeName: "Enrich via Clearbit", action: "modify", details: "Add retry: 3 attempts, exponential backoff (1s, 2s, 4s)", reviewStatus: "pending" },
              { nodeId: "n5", nodeName: "Notify on Slack", action: "modify", details: "Add retry: 2 attempts, 500ms delay", reviewStatus: "pending" },
              { nodeId: "new1", nodeName: "Error Catch Block", action: "add", details: "Catch errors from Clearbit & Slack, route to error handler", reviewStatus: "pending" },
              { nodeId: "new2", nodeName: "Error Notification", action: "add", details: "Send error summary to #ops-alerts Slack channel", reviewStatus: "pending" },
            ],
            actions: [
              { label: "Apply all changes", icon: Check, variant: "primary" },
              { label: "Review individually", icon: Eye, variant: "secondary" },
            ],
            tokenUsage: { input: 1240, output: 890, cost: "$0.008" },
          };
        } else if (text.toLowerCase().includes("validation") || text.toLowerCase().includes("filter")) {
          response = {
            content: "Here's a data validation step I'll add after the trigger:",
            nodePreview: [
              { name: "Webhook Trigger", type: "trigger", status: "ready" },
              { name: "Validate Input", type: "logic", status: "new" },
              { name: "Score with AI", type: "ai", status: "ready" },
            ],
            diff: [
              { nodeId: "new1", nodeName: "Validate Input", action: "add", details: "Check required fields: email (valid format), name (non-empty), company (non-empty). Invalid → reject with 422", reviewStatus: "pending" },
              { nodeId: "n1", nodeName: "Webhook Trigger", action: "modify", details: "Add output connection to Validate Input", reviewStatus: "pending" },
            ],
            codeBlock: `// Validation rules\nconst rules = {\n  email: v => /^[^@]+@[^@]+$/.test(v),\n  name: v => v?.trim().length > 0,\n  company: v => v?.trim().length > 0,\n};\nreturn Object.entries(rules)\n  .filter(([k, fn]) => !fn(input[k]))\n  .map(([k]) => k);`,
            actions: [
              { label: "Apply changes", icon: Check, variant: "primary" },
              { label: "Edit rules first", icon: Wrench, variant: "secondary" },
            ],
            tokenUsage: { input: 980, output: 650, cost: "$0.006" },
          };
        } else {
          response = {
            content: "I'll build that for you. Here's my plan:",
            nodePreview: [
              { name: "Webhook Trigger", type: "trigger", status: "new" },
              { name: "Parse & Validate", type: "logic", status: "new" },
              { name: "AI Processing", type: "ai", status: "new" },
              { name: "Route by Result", type: "logic", status: "new" },
              { name: "Send Notification", type: "output", status: "new" },
            ],
            diff: [
              { nodeId: "new1", nodeName: "Webhook Trigger", action: "add", details: "POST endpoint with JSON body parsing", reviewStatus: "pending" },
              { nodeId: "new2", nodeName: "Parse & Validate", action: "add", details: "Schema validation + field extraction", reviewStatus: "pending" },
              { nodeId: "new3", nodeName: "AI Processing", action: "add", details: "GPT-4o analysis with structured output", reviewStatus: "pending" },
              { nodeId: "new4", nodeName: "Route by Result", action: "add", details: "Switch node: score > 80 → hot, > 50 → warm, else → cold", reviewStatus: "pending" },
              { nodeId: "new5", nodeName: "Send Notification", action: "add", details: "Slack message to #results channel", reviewStatus: "pending" },
            ],
            actions: [
              { label: "Generate workflow", icon: Wand2, variant: "primary" },
              { label: "Customize plan", icon: Wrench, variant: "secondary" },
            ],
            tokenUsage: { input: 1520, output: 1100, cost: "$0.012" },
          };
        }
      } else {
        // Ask mode responses
        if (text.includes("@") && mentionedNodes.length > 0) {
          const node = mentionedNodes[0];
          response = {
            content: `**${node}** analysis:\n\n• **Type:** ${workflowNodes.find(n => n.name === node)?.type ?? "unknown"}\n• **Input:** Receives data from the previous node\n• **Processing:** ${node === "Score with AI" ? "Sends lead data to GPT-4o with a scoring prompt (0-100). Adds `ai_score` and `ai_reasoning` fields to the output." : node === "Route by Score" ? "Switch node with 3 branches: Hot (score > 80), Warm (50-80), Cold (<50). Each branch routes to different follow-up actions." : "Processes incoming data and forwards to the next step."}\n• **Output:** ${node === "Score with AI" ? "Original data + ai_score (number) + ai_reasoning (string)" : "Filtered data to matched branch"}\n• **Performance:** Avg 340ms, 99.2% success rate`,
            actions: [
              { label: "View execution data", icon: Eye, variant: "secondary" },
              { label: "Edit this node", icon: Wrench, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "read_node_config", args: `node="${node}"`, result: "Configuration loaded", duration: "12ms" },
              { tool: "analyze_execution_history", args: `node="${node}", last=50`, result: "50 executions analyzed", duration: "84ms" },
            ],
          };
        } else if (text.toLowerCase().includes("explain")) {
          response = {
            content: "This is a **Lead Qualification Pipeline** with 7 nodes:\n\n1. **Webhook Trigger** → Receives leads via POST\n2. **Score with AI** → GPT-4o scores lead quality (0-100)\n3. **Route by Score** → Hot (>80) / Warm / Cold branching\n4. **Enrich via Clearbit** → Company data enrichment\n5. **Notify on Slack** → Posts qualified leads to #sales\n6. **Log to Database** → Stores all processed leads\n7. **Error Handler** → Catches and logs failures\n\nProcesses ~150 leads/day with 94% success rate. Average execution: 1.2s.",
            actions: [
              { label: "Show execution timeline", icon: Play, variant: "secondary" },
              { label: "Suggest optimizations", icon: Sparkles, variant: "ghost" },
            ],
          };
        } else if (text.toLowerCase().includes("debug") || text.toLowerCase().includes("error")) {
          response = {
            content: "⚠️ **Error in Node 4: Enrich via Clearbit**\n\n```\nHTTP 429: Rate limit exceeded\nX-RateLimit-Remaining: 0\nRetry-After: 30\n```\n\n**Root cause:** Concurrent requests exceeding Clearbit API limits.\n\n**Fixes (ranked by impact):**\n1. Add **Wait node** (200ms delay) — *easiest*\n2. Enable **batching** (size: 5) — *recommended*\n3. Add **retry** with exponential backoff — *most robust*",
            actions: [
              { label: "Fix automatically", icon: Wand2, variant: "primary" },
              { label: "Switch to Build mode", icon: Hammer, variant: "secondary" },
            ],
            toolCalls: [
              { tool: "fetch_last_error", args: 'workflow="Lead Qualification"', result: "HTTP 429 on node n4", duration: "45ms" },
              { tool: "check_rate_limits", args: 'provider="clearbit"', result: "100 req/min, 92 used", duration: "120ms" },
            ],
          };
        } else if (text.toLowerCase().includes("test data")) {
          response = {
            content: "Here's realistic test data for your webhook:",
            codeBlock: JSON.stringify({
              lead: { email: "jane@acme.com", name: "Jane Smith", company: "Acme Corp", role: "VP Engineering", source: "demo_request" },
              metadata: { ip: "203.0.113.42", utm_source: "google", timestamp: "2026-04-18T14:30:00Z" },
            }, null, 2),
            actions: [
              { label: "Pin to trigger", icon: Target, variant: "primary" },
              { label: "Run with this data", icon: Play, variant: "secondary" },
              { label: "Generate 10 variants", icon: Sparkles, variant: "ghost" },
            ],
            tokenUsage: { input: 450, output: 280, cost: "$0.003" },
          };
        } else {
          response = {
            content: "I'll analyze that for you. Here are my findings based on the current workflow state and recent executions.",
            actions: [
              { label: "Show more details", icon: Eye, variant: "secondary" },
            ],
          };
        }
      }

      setMessages((p) => [...p, {
        id: `a-${Date.now()}`,
        role: "assistant" as const,
        ...response,
        content: response.content!,
      }]);
      setIsTyping(false);
    }, mode === "build" ? 1800 : 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
    if (e.key === "@") setShowNodePicker(true);
    if (e.key === "Escape") setShowNodePicker(false);
  };

  const filteredNodes = workflowNodes.filter(n =>
    !nodeFilter || n.name.toLowerCase().includes(nodeFilter.toLowerCase())
  );

  const panelWidth = expanded ? "w-[520px]" : "w-[400px]";

  return (
    <div
      className={cn("flex flex-shrink-0 flex-col border-l transition-all duration-200", panelWidth)}
      style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-page)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "var(--color-border-default)" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-zinc-800">AI Copilot</span>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">Beta</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setExpanded(!expanded)} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors" title={expanded ? "Collapse" : "Expand"}>
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button onClick={() => setMessages([assistantGreetings[mode]])} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors" title="Clear">
            <Trash2 size={12} />
          </button>
          <button onClick={onClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center border-b px-4" style={{ borderColor: "var(--color-border-default)" }}>
        {(["ask", "build"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 -mb-px transition-colors",
              mode === m ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            {m === "ask" ? <MessageSquare size={11} /> : <Hammer size={11} />}
            {m === "ask" ? "Ask" : "Build"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 py-2">
          <span className="text-[9px] text-zinc-300">model:</span>
          <button className="flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 hover:bg-zinc-50">
            <Cpu size={9} /> GPT-4o <ChevronDown size={8} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Context banner */}
        {messages.length <= 1 && (
          <div className="mb-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[10px]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <GitBranch size={10} className="text-zinc-400" />
              <span className="font-semibold text-zinc-600">Workflow Context</span>
              <span className={cn("ml-auto rounded-full px-1.5 py-0.5 text-[8px] font-semibold", contextInfo.executionStatus === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                {contextInfo.executionStatus}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-zinc-500">
              <span>Workflow: <span className="text-zinc-700 font-medium">{contextInfo.workflowName}</span></span>
              <span>Nodes: <span className="text-zinc-700">{contextInfo.nodeCount}</span></span>
              <span>Last run: <span className="text-zinc-700">{contextInfo.lastExecution}</span></span>
              <span>Tokens: <span className="text-zinc-700">{contextInfo.tokensUsed}</span></span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("mb-3", msg.role === "user" ? "flex justify-end" : msg.role === "system" ? "flex justify-center" : "flex justify-start")}>
            {msg.role === "system" && (
              <div className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] text-zinc-500">{msg.content}</div>
            )}
            {msg.role === "assistant" && (
              <div className="mr-2 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                <Bot size={12} className="text-white" />
              </div>
            )}
            {msg.role !== "system" && (
              <div className={cn("max-w-[340px]", expanded && "max-w-[440px]")}>
                <div className={cn(
                  "rounded-xl px-3 py-2.5 text-[12px] leading-relaxed",
                  msg.role === "user"
                    ? "bg-zinc-100 text-zinc-800 rounded-br-sm"
                    : "bg-white border border-zinc-100 text-zinc-700 rounded-bl-sm"
                )}>
                  {/* Mentioned nodes highlight */}
                  {msg.mentionedNodes && msg.mentionedNodes.length > 0 && (
                    <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                      {msg.mentionedNodes.map((n) => (
                        <span key={n} className="inline-flex items-center gap-0.5 rounded bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[9px] font-medium text-violet-600">
                          <AtSign size={8} />{n}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap [&_strong]:font-semibold [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_code]:font-mono [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:p-2.5 [&_pre]:text-[10px] [&_pre]:overflow-x-auto [&_pre]:my-1.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                    {msg.content}
                  </div>

                  {msg.codeBlock && (
                    <div className="relative my-1.5">
                      <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-2.5 text-[10px] overflow-x-auto font-mono leading-relaxed">
                        {msg.codeBlock}
                      </pre>
                      <button className="absolute top-1.5 right-1.5 rounded bg-zinc-700 p-1 text-zinc-300 hover:text-white transition-colors">
                        <Copy size={9} />
                      </button>
                    </div>
                  )}

                  {/* Tool calls */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 rounded-md border border-zinc-100 bg-zinc-50 overflow-hidden">
                      <div className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium text-zinc-400 border-b border-zinc-100">
                        <Braces size={8} /> Tool Calls
                      </div>
                      {msg.toolCalls.map((tc, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1 text-[9px]">
                          <CheckCircle2 size={8} className="text-green-500 flex-shrink-0" />
                          <code className="font-mono text-violet-600">{tc.tool}</code>
                          <span className="text-zinc-400 truncate flex-1">{tc.args}</span>
                          <span className="text-zinc-300 flex-shrink-0">{tc.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Node preview pipeline */}
                  {msg.nodePreview && msg.nodePreview.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {msg.nodePreview.map((node, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className={cn(
                            "flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-medium",
                            typeColors[node.type],
                            node.status === "new" && "ring-1 ring-offset-1 ring-green-300"
                          )}>
                            {node.status === "new" && <Zap size={8} />}
                            {node.status === "modified" && <Wrench size={8} />}
                            {node.name}
                          </div>
                          {i < msg.nodePreview!.length - 1 && <ArrowRight size={9} className="text-zinc-300" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Diff review panel (Build mode) */}
                  {msg.diff && msg.diff.length > 0 && (
                    <div className="mt-2 rounded-md border border-zinc-200 overflow-hidden">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 border-b border-zinc-200 text-[9px] font-semibold text-zinc-500">
                        <Diff size={10} /> Review Changes ({msg.diff.length})
                      </div>
                      {msg.diff.map((change, i) => {
                        const Icon = diffActionIcons[change.action];
                        return (
                          <div key={i} className="flex items-start gap-2 px-2.5 py-2 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                            <span className={cn("flex items-center gap-0.5 rounded px-1 py-0.5 text-[8px] font-semibold uppercase flex-shrink-0 mt-0.5", diffActionColors[change.action])}>
                              <Icon size={8} />{change.action}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-zinc-700">{change.nodeName}</p>
                              <p className="text-[9px] text-zinc-400 leading-relaxed">{change.details}</p>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button className="rounded p-0.5 text-green-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Accept">
                                <Check size={10} />
                              </button>
                              <button className="rounded p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Reject">
                                <XCircle size={10} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Token usage */}
                {msg.tokenUsage && (
                  <div className="mt-1 flex items-center gap-2 text-[8px] text-zinc-300 px-1">
                    <span>↑{msg.tokenUsage.input} ↓{msg.tokenUsage.output} tokens</span>
                    <span>•</span>
                    <span>{msg.tokenUsage.cost}</span>
                  </div>
                )}

                {/* Actions */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {msg.actions.map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <button key={i} className={cn(
                          "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all",
                          action.variant === "primary" ? "bg-zinc-900 text-white hover:bg-zinc-700"
                            : action.variant === "secondary" ? "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                            : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                        )}>
                          <Icon size={10} /> {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Feedback buttons */}
                {msg.role === "assistant" && msg.id !== "greet-ask" && msg.id !== "greet-build" && (
                  <div className="mt-1.5 flex items-center gap-0.5 px-0.5">
                    <button className="rounded p-1 text-zinc-300 hover:text-zinc-500 transition-colors" title="Good response"><ThumbsUp size={10} /></button>
                    <button className="rounded p-1 text-zinc-300 hover:text-zinc-500 transition-colors" title="Bad response"><ThumbsDown size={10} /></button>
                    <button className="rounded p-1 text-zinc-300 hover:text-zinc-500 transition-colors" title="Copy"><Copy size={10} /></button>
                    <button className="rounded p-1 text-zinc-300 hover:text-zinc-500 transition-colors" title="Regenerate"><RotateCcw size={10} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="mb-3 flex justify-start">
            <div className="mr-2 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Bot size={12} className="text-white" />
            </div>
            <div className="rounded-xl rounded-bl-sm border border-zinc-100 bg-white px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <div className="flex gap-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>{mode === "build" ? "Building…" : "Thinking…"}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
            {mode === "ask" ? "Quick Questions" : "Quick Builds"}
          </p>
          <div className="flex flex-wrap gap-1">
            {(mode === "ask" ? askActions : buildActions).map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => send(action.label)}
                  className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700 transition-all"
                >
                  <Icon size={9} className="text-zinc-400" /> {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Node mention picker */}
      {showNodePicker && (
        <div className="absolute bottom-24 left-4 right-4 z-50 rounded-lg border border-zinc-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100">
            <AtSign size={12} className="text-zinc-400" />
            <input
              autoFocus
              className="flex-1 text-[12px] outline-none bg-transparent text-zinc-700 placeholder:text-zinc-300"
              placeholder="Search nodes…"
              value={nodeFilter}
              onChange={(e) => setNodeFilter(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setShowNodePicker(false); }}
            />
          </div>
          <div className="max-h-[180px] overflow-y-auto">
            {filteredNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => insertNodeMention(node.name)}
                className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-zinc-50 transition-colors"
              >
                <span className={cn("rounded px-1.5 py-0.5 text-[8px] font-medium border", typeColors[node.type])}>{node.type}</span>
                <span className="text-[12px] text-zinc-700">{node.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t px-4 py-2.5" style={{ borderColor: "var(--color-border-default)" }}>
        <div className="flex items-end gap-2 rounded-xl border bg-white px-3 py-2 transition-all focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-200" style={{ borderColor: "var(--color-border-default)" }}>
          <button
            onClick={() => setShowNodePicker(!showNodePicker)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors flex-shrink-0 mb-0.5"
            title="Mention a node (@)"
          >
            <AtSign size={13} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "ask" ? "Ask about your workflow… (@ to mention nodes)" : "Describe what to build or change…"}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[12px] text-zinc-800 placeholder:text-zinc-400 outline-none leading-relaxed"
            style={{ maxHeight: "80px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 80) + "px";
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isTyping}
            className={cn(
              "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all mb-0.5",
              input.trim() && !isTyping ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:opacity-90" : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
            )}
          >
            <Send size={11} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5 px-1 text-[8px] text-zinc-300">
          <span>⌘⇧C to toggle</span>
          <span>•</span>
          <span>@ to mention nodes</span>
          <span>•</span>
          <span>Enter to send</span>
        </div>
      </div>
    </div>
  );
}

/* ── Floating Canvas Button ── */

interface StudioCopilotButtonProps {
  onClick: () => void;
  visible: boolean;
}

export function StudioCopilotButton({ onClick, visible }: StudioCopilotButtonProps) {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-16 right-5 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-[13px] font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
      style={{ boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)" }}
    >
      <Sparkles size={14} />
      AI Copilot
    </button>
  );
}
