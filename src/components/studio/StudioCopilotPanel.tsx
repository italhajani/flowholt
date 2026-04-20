import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Sparkles, Bot, User, Trash2, Copy, ChevronDown, Wand2, Code2,
  GitBranch, Play, ArrowRight, Wrench, AlertTriangle, CheckCircle2, Lightbulb,
  Zap, FileJson, Settings, Eye, MessageSquare, Hammer, RotateCcw, Diff,
  ChevronRight, Hash, AtSign, Braces, Cpu, Target, Layers, Check, XCircle,
  ThumbsUp, ThumbsDown, RefreshCw, Maximize2, Minimize2, KeyRound, Shield,
  ExternalLink, CircleDot, Link2, Clock, Globe, Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore, type CanvasAction } from "./useCanvasStore";
import type { CanvasNodeData } from "./canvasTypes";
import { useDraftWorkflowWithAI } from "@/hooks/useApi";

/* ── Types ── */
type CopilotMode = "ask" | "build" | "builder" | "credentials" | "code";
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

const builderActions = [
  { label: "Customer onboarding workflow", icon: Wand2 },
  { label: "Slack → GPT → Email responder", icon: Zap },
  { label: "RSS feed → AI summary → Notion", icon: Layers },
  { label: "Form submission → CRM pipeline", icon: Target },
  { label: "GitHub issue → classify → assign", icon: GitBranch },
  { label: "Daily report aggregator", icon: Code2 },
];

const credentialActions = [
  { label: "Set up Slack OAuth", icon: KeyRound },
  { label: "Configure OpenAI API key", icon: Shield },
  { label: "Connect Google Sheets", icon: Link2 },
  { label: "Set up Salesforce integration", icon: ExternalLink },
  { label: "Configure SMTP email", icon: Settings },
  { label: "Test all my credentials", icon: CircleDot },
];

const codeActions = [
  { label: "Transform JSON payload", icon: Braces },
  { label: "Filter items by condition", icon: Target },
  { label: "Date formatting expression", icon: Clock },
  { label: "HTTP request with auth", icon: Globe },
  { label: "Parse CSV to JSON", icon: FileJson },
  { label: "Merge data from two sources", icon: Layers },
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
  builder: {
    id: "greet-builder",
    role: "assistant",
    content: "🏗️ **AI Workflow Builder**\n\nDescribe the workflow you want and I'll build it end-to-end — selecting nodes, configuring them, and wiring everything together.\n\nI'll show you each phase in real-time:\n**Planning** → **Generating nodes** → **Connecting** → **Configuring**\n\nTry: *\"Build a Slack bot that uses GPT to answer questions and saves conversations to Notion\"*",
  },
  credentials: {
    id: "greet-creds",
    role: "assistant",
    content: "🔑 **Credential Helper**\n\nI'll guide you through setting up integrations step by step. Tell me which service you want to connect and I'll walk you through:\n\n• **OAuth flows** — Redirect URLs, scopes, client setup\n• **API keys** — Where to find them, how to configure\n• **Testing** — Verify your credentials are working\n• **Troubleshooting** — Fix auth errors and expired tokens\n\nWhich integration do you need help with?",
  },
  code: {
    id: "greet-code",
    role: "assistant",
    content: "💻 **Code Generation**\n\nI'll write code for your Function nodes, expressions, and data transformations. Tell me what you need:\n\n• **Function nodes** — JavaScript/TypeScript snippets for custom logic\n• **Expressions** — Transform, filter, map data between nodes\n• **HTTP requests** — Custom API calls with auth and error handling\n• **Data parsing** — CSV, XML, JSON transformation\n• **Regex patterns** — Extract and validate data\n\nDescribe your use case and I'll generate production-ready code with type safety and error handling.",
  },
};

interface StudioCopilotPanelProps {
  onClose: () => void;
  initialPrompt?: string;
}

/* ── Model selector options ── */
const modelOptions = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", badge: "Best" },
  { id: "claude-sonnet", label: "Claude Sonnet", provider: "Anthropic", badge: "Fast" },
  { id: "claude-opus", label: "Claude Opus", provider: "Anthropic", badge: "Smart" },
  { id: "gemini-pro", label: "Gemini Pro", provider: "Google", badge: null },
  { id: "llama-3", label: "Llama 3.1", provider: "Meta", badge: "Local" },
];

export function StudioCopilotPanel({ onClose, initialPrompt }: StudioCopilotPanelProps) {
  const canvasStore = useCanvasStore();
  const draftMutation = useDraftWorkflowWithAI();
  const [mode, setMode] = useState<CopilotMode>("ask");
  const [messages, setMessages] = useState<CopilotMessage[]>([assistantGreetings.ask]);
  const [input, setInput] = useState(initialPrompt ?? "");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [nodeFilter, setNodeFilter] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamRef = useRef<number | null>(null);

  const scroll = useCallback(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), []);
  useEffect(() => { scroll(); }, [messages, scroll]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Auto-send initialPrompt if provided (e.g. from "Ask AI" button on error)
  useEffect(() => {
    if (initialPrompt) {
      inputRef.current?.focus();
    }
  }, [initialPrompt]);

  // Cleanup streaming interval on unmount
  useEffect(() => {
    return () => { if (streamRef.current) clearInterval(streamRef.current); };
  }, []);

  const switchMode = (newMode: CopilotMode) => {
    setMode(newMode);
    setMessages([assistantGreetings[newMode]]);
    setInput("");
    cancelStream();
  };

  const cancelStream = () => {
    if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
    setIsStreaming(false);
    setStreamingMsgId(null);
  };

  /* ── Convert a diff change to a canvas action and apply ── */
  const familyFromAction = (name: string): CanvasNodeData["family"] => {
    const lower = name.toLowerCase();
    if (lower.includes("trigger") || lower.includes("webhook")) return "trigger";
    if (lower.includes("ai") || lower.includes("gpt") || lower.includes("score")) return "ai";
    if (lower.includes("route") || lower.includes("switch") || lower.includes("validate") || lower.includes("filter") || lower.includes("parse") || lower.includes("batch") || lower.includes("merge") || lower.includes("split")) return "logic";
    if (lower.includes("data") || lower.includes("enrich") || lower.includes("crm")) return "data";
    return "integration";
  };

  const applyDiffChange = useCallback((change: DiffChange) => {
    const existing = canvasStore.nodes;
    const rightmostLeft = Math.max(...existing.map(n => n.left), 200);
    const bottomTop = Math.max(...existing.map(n => n.top), 100);
    const actions: CanvasAction[] = [];
    if (change.action === "add") {
      actions.push({
        type: "add-node",
        nodeId: change.nodeId.startsWith("new") ? `n${Date.now()}-${change.nodeId}` : change.nodeId,
        node: {
          name: change.nodeName,
          subtitle: change.details.slice(0, 40),
          family: familyFromAction(change.nodeName),
          left: rightmostLeft + 200 + Math.random() * 60,
          top: bottomTop + Math.random() * 80,
        },
      });
    } else if (change.action === "modify") {
      const target = existing.find(n => n.name === change.nodeName || n.id === change.nodeId);
      if (target) {
        actions.push({
          type: "modify-node",
          nodeId: target.id,
          node: { subtitle: change.details.slice(0, 50) },
        });
      }
    } else if (change.action === "remove") {
      const target = existing.find(n => n.name === change.nodeName || n.id === change.nodeId);
      if (target) actions.push({ type: "remove-node", nodeId: target.id });
    }
    if (actions.length > 0) canvasStore.applyActions(actions);
  }, [canvasStore]);

  const applyAllDiffs = useCallback((diffs: DiffChange[]) => {
    for (const d of diffs) {
      if (d.reviewStatus === "pending") applyDiffChange(d);
    }
  }, [applyDiffChange]);

  const updateDiffStatus = useCallback((msgId: string, diffIdx: number, status: ReviewStatus) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || !m.diff) return m;
      const newDiff = m.diff.map((d, i) => i === diffIdx ? { ...d, reviewStatus: status } : d);
      return { ...m, diff: newDiff };
    }));
  }, []);

  const insertNodeMention = (nodeName: string) => {
    setInput((p) => p + `@${nodeName} `);
    setShowNodePicker(false);
    setNodeFilter("");
    inputRef.current?.focus();
  };

  /* ── Streaming simulation: reveal content char-by-char ── */
  const streamResponse = (response: Partial<CopilotMessage>) => {
    const fullContent = response.content ?? "";
    const msgId = `a-${Date.now()}`;
    const chunkSize = 2 + Math.floor(Math.random() * 3); // 2-4 chars per tick
    let idx = 0;

    // Add placeholder message with empty content
    setMessages((p) => [...p, {
      id: msgId,
      role: "assistant" as const,
      content: "",
    }]);
    setIsStreaming(true);
    setStreamingMsgId(msgId);
    setIsTyping(false);

    streamRef.current = window.setInterval(() => {
      idx = Math.min(idx + chunkSize, fullContent.length);
      const partial = fullContent.slice(0, idx);

      setMessages((prev) => prev.map((m) =>
        m.id === msgId ? { ...m, content: partial } : m
      ));

      if (idx >= fullContent.length) {
        // Streaming complete — reveal rich attachments
        clearInterval(streamRef.current!);
        streamRef.current = null;
        setMessages((prev) => prev.map((m) =>
          m.id === msgId ? {
            ...m,
            content: fullContent,
            ...(response.diff ? { diff: response.diff } : {}),
            ...(response.nodePreview ? { nodePreview: response.nodePreview } : {}),
            ...(response.codeBlock ? { codeBlock: response.codeBlock } : {}),
            ...(response.actions ? { actions: response.actions } : {}),
            ...(response.toolCalls ? { toolCalls: response.toolCalls } : {}),
            ...(response.tokenUsage ? { tokenUsage: response.tokenUsage } : {}),
          } : m
        ));
        setIsStreaming(false);
        setStreamingMsgId(null);
      }
    }, 18); // ~55 chars/sec
  };

  const send = (text: string) => {
    if (!text.trim() || isStreaming) return;
    const mentionedNodes = workflowNodes.filter(n => text.includes(`@${n.name}`)).map(n => n.name);
    const userMsg: CopilotMessage = { id: `u-${Date.now()}`, role: "user", content: text.trim(), mentionedNodes };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    // For builder mode, try real AI draft API first
    if (mode === "builder") {
      draftMutation.mutate({ prompt: text.trim() }, {
        onSuccess: (resp) => {
          setIsTyping(false);
          const stepNames = resp.workflow_definition?.steps?.map((s: Record<string, unknown>) => (s as { name?: string }).name || "Step") ?? [];
          const aiMsg: CopilotMessage = {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: `🏗️ **AI Workflow Generated!**\n\n✅ ${stepNames.length} nodes created from your prompt.\n\n${resp.validation_issues?.length ? `⚠️ ${resp.validation_issues.length} validation issue(s) found.` : "No validation issues."}${resp.repair_actions?.length ? `\n🔧 ${resp.repair_actions.length} auto-repair(s) applied.` : ""}`,
            nodePreview: stepNames.map((n: string) => ({ name: n, type: "integration", status: "new" as const })),
            actions: [
              { label: "Apply to canvas", icon: Check, variant: "primary" as const },
              { label: "Refine workflow", icon: Wrench, variant: "secondary" as const },
            ],
          };
          setMessages((p) => [...p, aiMsg]);
        },
        onError: () => {
          // Fallback to mock response on API error — continues below
          fireMockResponse(text);
        },
      });
      return;
    }

    // Mock response path for all modes
    fireMockResponse(text);
  };

  const fireMockResponse = (text: string) => {
    setIsTyping(true);
    const thinkDelay = mode === "builder" ? 1200 + Math.random() * 800 : mode === "build" ? 800 + Math.random() * 600 : mode === "credentials" ? 600 + Math.random() * 500 : mode === "code" ? 700 + Math.random() * 500 : 400 + Math.random() * 400;

    setTimeout(() => {
      let response: Partial<CopilotMessage> = { content: "I'll analyze your workflow and get back to you with specific suggestions." };

      if (mode === "build") {
        if (text.toLowerCase().includes("error handling") || text.toLowerCase().includes("retry")) {
          response = {
            content: "I've analyzed your workflow for failure points. Here are the changes I recommend to add comprehensive error handling:",
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
            content: "I'll add a data validation step right after the trigger. This ensures only clean, well-structured data flows through the rest of your pipeline:",
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
        } else if (text.toLowerCase().includes("slack") || text.toLowerCase().includes("notification") || text.toLowerCase().includes("alert")) {
          response = {
            content: "I'll enhance the notification system with richer Slack messages. Here's what I'll add:\n\n• **Rich formatting** with Block Kit\n• **Conditional channels** based on lead score\n• **Threaded updates** for follow-up actions",
            nodePreview: [
              { name: "Route by Score", type: "logic", status: "ready" },
              { name: "Slack Rich Notify", type: "output", status: "new" },
              { name: "Slack Thread Update", type: "output", status: "new" },
            ],
            diff: [
              { nodeId: "n5", nodeName: "Notify on Slack", action: "modify", details: "Replace with Block Kit formatting: header, lead card, score badge, CTA button", reviewStatus: "pending" },
              { nodeId: "new1", nodeName: "Slack Thread Update", action: "add", details: "Auto-reply in thread after Salesforce record is created with CRM link", reviewStatus: "pending" },
            ],
            actions: [
              { label: "Apply changes", icon: Check, variant: "primary" },
              { label: "Preview Slack message", icon: Eye, variant: "secondary" },
            ],
            tokenUsage: { input: 860, output: 540, cost: "$0.005" },
          };
        } else if (text.toLowerCase().includes("batch") || text.toLowerCase().includes("parallel")) {
          response = {
            content: "I'll convert your pipeline to batch processing mode. This will process multiple leads simultaneously while respecting API rate limits:\n\n• **Batch size:** 10 items per batch\n• **Concurrency:** 3 parallel API calls\n• **Rate limiting:** Auto-throttle on 429 responses",
            diff: [
              { nodeId: "n1", nodeName: "Webhook Trigger", action: "modify", details: "Add batch collection: wait 5s or until 10 items", reviewStatus: "pending" },
              { nodeId: "new1", nodeName: "Batch Splitter", action: "add", details: "Split incoming array into batches of 10", reviewStatus: "pending" },
              { nodeId: "n4", nodeName: "Enrich via Clearbit", action: "modify", details: "Enable parallel execution (3 concurrent), add rate limit guard", reviewStatus: "pending" },
              { nodeId: "new2", nodeName: "Batch Merger", action: "add", details: "Collect all enriched results, merge into single array", reviewStatus: "pending" },
            ],
            actions: [
              { label: "Generate workflow", icon: Wand2, variant: "primary" },
              { label: "Adjust batch settings", icon: Settings, variant: "secondary" },
            ],
            tokenUsage: { input: 1380, output: 920, cost: "$0.010" },
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
      } else if (mode === "builder") {
        // AI Workflow Builder — multi-phase generation
        const phases = [
          { phase: "Planning", detail: "Analyzing requirements and selecting optimal node types…" },
          { phase: "Generating", detail: "Creating node configurations and parameters…" },
          { phase: "Connecting", detail: "Wiring nodes with data mappings…" },
          { phase: "Configuring", detail: "Setting credentials, expressions, and error handling…" },
        ];
        const phaseStr = phases.map((p, i) => `${i + 1}. **${p.phase}** — ${p.detail}`).join("\n");

        if (text.toLowerCase().includes("slack") || text.toLowerCase().includes("gpt") || text.toLowerCase().includes("bot")) {
          response = {
            content: `🏗️ **Building workflow...**\n\n${phaseStr}\n\n✅ **Workflow generated!** 6 nodes created and connected.\n\nThis workflow listens for Slack messages, sends them to GPT-4o for response generation, and posts the reply back in-thread. Conversations are saved to Notion for reference.`,
            nodePreview: [
              { name: "Slack Trigger", type: "trigger", status: "new" },
              { name: "Filter Bot Messages", type: "logic", status: "new" },
              { name: "Build AI Prompt", type: "logic", status: "new" },
              { name: "GPT-4o Chat", type: "ai", status: "new" },
              { name: "Reply in Slack Thread", type: "output", status: "new" },
              { name: "Save to Notion", type: "data", status: "new" },
            ],
            diff: [
              { nodeId: "bld1", nodeName: "Slack Trigger", action: "add", details: "Event: message.channels — listen for new messages in #ask-ai channel", reviewStatus: "pending" },
              { nodeId: "bld2", nodeName: "Filter Bot Messages", action: "add", details: "IF node: skip messages from bots (subtype !== 'bot_message')", reviewStatus: "pending" },
              { nodeId: "bld3", nodeName: "Build AI Prompt", action: "add", details: "Set node: system prompt + user message + last 5 thread messages as context", reviewStatus: "pending" },
              { nodeId: "bld4", nodeName: "GPT-4o Chat", action: "add", details: "OpenAI Chat Completion: model=gpt-4o, temperature=0.7, max_tokens=1024", reviewStatus: "pending" },
              { nodeId: "bld5", nodeName: "Reply in Slack Thread", action: "add", details: "Slack: postMessage in thread (thread_ts from trigger), unfurl_links=false", reviewStatus: "pending" },
              { nodeId: "bld6", nodeName: "Save to Notion", action: "add", details: "Create page in Conversations DB: user, question, answer, timestamp", reviewStatus: "pending" },
            ],
            actions: [
              { label: "Apply to canvas", icon: Check, variant: "primary" },
              { label: "Refine workflow", icon: Wrench, variant: "secondary" },
            ],
            toolCalls: [
              { tool: "search_integrations", args: 'query="Slack trigger"', result: "Found: Slack Event Trigger", duration: "34ms" },
              { tool: "search_integrations", args: 'query="OpenAI chat"', result: "Found: OpenAI Chat Model", duration: "28ms" },
              { tool: "search_integrations", args: 'query="Notion create page"', result: "Found: Notion Create Page", duration: "31ms" },
              { tool: "generate_workflow_graph", args: 'nodes=6, edges=5', result: "Graph generated with auto-layout", duration: "145ms" },
            ],
            tokenUsage: { input: 2840, output: 1960, cost: "$0.024" },
          };
        } else if (text.toLowerCase().includes("rss") || text.toLowerCase().includes("notion") || text.toLowerCase().includes("summary")) {
          response = {
            content: `🏗️ **Building workflow...**\n\n${phaseStr}\n\n✅ **Workflow generated!** 5 nodes created and connected.\n\nThis workflow polls RSS feeds on a schedule, uses AI to summarize articles, and saves structured summaries to a Notion database.`,
            nodePreview: [
              { name: "Schedule Trigger", type: "trigger", status: "new" },
              { name: "RSS Feed Reader", type: "integration", status: "new" },
              { name: "AI Summarizer", type: "ai", status: "new" },
              { name: "Format Output", type: "logic", status: "new" },
              { name: "Save to Notion", type: "data", status: "new" },
            ],
            diff: [
              { nodeId: "bld1", nodeName: "Schedule Trigger", action: "add", details: "Cron: every 6 hours (0 */6 * * *)", reviewStatus: "pending" },
              { nodeId: "bld2", nodeName: "RSS Feed Reader", action: "add", details: "HTTP Request: fetch RSS XML from configured URL, parse items", reviewStatus: "pending" },
              { nodeId: "bld3", nodeName: "AI Summarizer", action: "add", details: "GPT-4o-mini: summarize article in 3 bullet points, extract key topics", reviewStatus: "pending" },
              { nodeId: "bld4", nodeName: "Format Output", action: "add", details: "Set node: title, summary, topics[], source_url, published_date", reviewStatus: "pending" },
              { nodeId: "bld5", nodeName: "Save to Notion", action: "add", details: "Create page in RSS Summaries DB with rich text formatting", reviewStatus: "pending" },
            ],
            actions: [
              { label: "Apply to canvas", icon: Check, variant: "primary" },
              { label: "Add more feeds", icon: Zap, variant: "secondary" },
            ],
            tokenUsage: { input: 2200, output: 1580, cost: "$0.019" },
          };
        } else if (text.toLowerCase().includes("github") || text.toLowerCase().includes("issue") || text.toLowerCase().includes("classify")) {
          response = {
            content: `🏗️ **Building workflow...**\n\n${phaseStr}\n\n✅ **Workflow generated!** 6 nodes created and connected.\n\nThis workflow triggers on new GitHub issues, uses AI to classify priority and type, then auto-assigns to the right team member.`,
            nodePreview: [
              { name: "GitHub Issue Trigger", type: "trigger", status: "new" },
              { name: "Fetch Issue Details", type: "integration", status: "new" },
              { name: "AI Classifier", type: "ai", status: "new" },
              { name: "Route by Priority", type: "logic", status: "new" },
              { name: "Assign to Team", type: "integration", status: "new" },
              { name: "Post Comment", type: "output", status: "new" },
            ],
            diff: [
              { nodeId: "bld1", nodeName: "GitHub Issue Trigger", action: "add", details: "Webhook: issues.opened event on configured repo", reviewStatus: "pending" },
              { nodeId: "bld2", nodeName: "Fetch Issue Details", action: "add", details: "GitHub API: get full issue body, labels, author info", reviewStatus: "pending" },
              { nodeId: "bld3", nodeName: "AI Classifier", action: "add", details: "GPT-4o-mini: classify → {priority: P0-P3, type: bug|feature|docs, team: frontend|backend|infra}", reviewStatus: "pending" },
              { nodeId: "bld4", nodeName: "Route by Priority", action: "add", details: "Switch: P0→immediate, P1→sprint, P2→backlog, P3→icebox", reviewStatus: "pending" },
              { nodeId: "bld5", nodeName: "Assign to Team", action: "add", details: "GitHub API: add labels, assign reviewer from team roster", reviewStatus: "pending" },
              { nodeId: "bld6", nodeName: "Post Comment", action: "add", details: "GitHub API: post classification summary as bot comment", reviewStatus: "pending" },
            ],
            actions: [
              { label: "Apply to canvas", icon: Check, variant: "primary" },
              { label: "Edit classification rules", icon: Wrench, variant: "secondary" },
            ],
            tokenUsage: { input: 2640, output: 1840, cost: "$0.022" },
          };
        } else {
          const userGoal = text.length > 50 ? text.slice(0, 50) + "…" : text;
          response = {
            content: `🏗️ **Building workflow...**\n\n${phaseStr}\n\n✅ **Workflow generated!** 5 nodes created and connected.\n\nBased on: *"${userGoal}"*\n\nI've created a complete workflow with trigger, processing, AI analysis, routing, and output steps.`,
            nodePreview: [
              { name: "Webhook Trigger", type: "trigger", status: "new" },
              { name: "Data Processor", type: "logic", status: "new" },
              { name: "AI Analysis", type: "ai", status: "new" },
              { name: "Smart Router", type: "logic", status: "new" },
              { name: "Send Results", type: "output", status: "new" },
            ],
            diff: [
              { nodeId: "bld1", nodeName: "Webhook Trigger", action: "add", details: "POST endpoint with JSON body parsing and validation", reviewStatus: "pending" },
              { nodeId: "bld2", nodeName: "Data Processor", action: "add", details: "Transform and normalize incoming data fields", reviewStatus: "pending" },
              { nodeId: "bld3", nodeName: "AI Analysis", action: "add", details: "GPT-4o analysis with structured JSON output", reviewStatus: "pending" },
              { nodeId: "bld4", nodeName: "Smart Router", action: "add", details: "Switch node routing based on AI analysis results", reviewStatus: "pending" },
              { nodeId: "bld5", nodeName: "Send Results", action: "add", details: "HTTP request to configured callback URL with results", reviewStatus: "pending" },
            ],
            actions: [
              { label: "Apply to canvas", icon: Check, variant: "primary" },
              { label: "Refine workflow", icon: Wrench, variant: "secondary" },
            ],
            tokenUsage: { input: 2100, output: 1420, cost: "$0.018" },
          };
        }
      } else if (mode === "credentials") {
        // Credential helper mode — guided setup with checklists
        if (text.toLowerCase().includes("slack")) {
          response = {
            content: "🔑 **Slack OAuth Setup**\n\nLet me walk you through connecting Slack:\n\n**Step 1 of 4 — Create Slack App**\n- Go to [api.slack.com/apps](https://api.slack.com/apps)\n- Click **Create New App** → **From scratch**\n- Name: `FlowHolt Integration`\n- Select your workspace\n\n**Step 2 — Configure OAuth Scopes**\n- Navigate to **OAuth & Permissions**\n- Add Bot Token Scopes:\n  - `chat:write` — Send messages\n  - `channels:read` — List channels\n  - `channels:history` — Read messages\n  - `users:read` — Get user info\n\n**Step 3 — Set Redirect URL**\n- Add redirect URL: `https://app.flowholt.com/oauth/callback/slack`\n- Copy your **Client ID** and **Client Secret**\n\n**Step 4 — Enter Credentials in FlowHolt**\n- Open **Vault** → **New Credential** → **Slack**\n- Paste Client ID, Client Secret\n- Click **Connect** to complete OAuth flow",
            actions: [
              { label: "Open Vault → New Credential", icon: KeyRound, variant: "primary" },
              { label: "Test Slack connection", icon: CircleDot, variant: "secondary" },
              { label: "View Slack API docs", icon: ExternalLink, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "check_credential", args: 'provider="slack"', result: "No Slack credential found", duration: "18ms" },
              { tool: "fetch_oauth_config", args: 'provider="slack"', result: "OAuth2 with Bot Token, 4 scopes required", duration: "24ms" },
            ],
            tokenUsage: { input: 640, output: 520, cost: "$0.005" },
          };
        } else if (text.toLowerCase().includes("openai") || text.toLowerCase().includes("api key") || text.toLowerCase().includes("gpt")) {
          response = {
            content: "🔑 **OpenAI API Key Setup**\n\nThis is a simple API key credential:\n\n**Step 1 — Get your API Key**\n- Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)\n- Click **Create new secret key**\n- Name it `FlowHolt Production`\n- ⚠️ Copy immediately — you can't see it again!\n\n**Step 2 — Enter in FlowHolt**\n- Open **Vault** → **New Credential** → **OpenAI**\n- Paste your API key\n- Optionally set an **Organization ID**\n\n**Step 3 — Verify**\n- I'll test the key with a simple completion call\n\n✅ **Recommended model settings:**\n| Use Case | Model | Cost |\n|----------|-------|------|\n| Classification | gpt-4o-mini | $0.15/1M tokens |\n| Analysis | gpt-4o | $2.50/1M tokens |\n| Code generation | gpt-4o | $2.50/1M tokens |",
            actions: [
              { label: "Open Vault → New Credential", icon: KeyRound, variant: "primary" },
              { label: "Test API key", icon: CircleDot, variant: "secondary" },
            ],
            toolCalls: [
              { tool: "check_credential", args: 'provider="openai"', result: "Existing key found (sk-...7xQ), last tested 3h ago", duration: "15ms" },
              { tool: "test_api_key", args: 'provider="openai", model="gpt-4o-mini"', result: "✅ Valid — 148K tokens remaining in quota", duration: "342ms" },
            ],
            tokenUsage: { input: 380, output: 440, cost: "$0.003" },
          };
        } else if (text.toLowerCase().includes("google") || text.toLowerCase().includes("sheets") || text.toLowerCase().includes("gmail")) {
          response = {
            content: "🔑 **Google OAuth Setup**\n\nGoogle uses OAuth 2.0 with a service account or user consent flow:\n\n**Step 1 — Google Cloud Console**\n- Go to [console.cloud.google.com](https://console.cloud.google.com)\n- Create a project (or select existing)\n- Enable APIs: **Sheets API**, **Gmail API**, **Drive API**\n\n**Step 2 — Create OAuth Credentials**\n- Go to **APIs & Services** → **Credentials**\n- Click **Create Credentials** → **OAuth client ID**\n- Application type: **Web application**\n- Redirect URI: `https://app.flowholt.com/oauth/callback/google`\n\n**Step 3 — Configure Consent Screen**\n- Add scopes:\n  - `spreadsheets` — Read/write Sheets\n  - `gmail.send` — Send emails\n  - `drive.readonly` — Access files\n\n**Step 4 — Connect in FlowHolt**\n- **Vault** → **New Credential** → **Google**\n- Paste Client ID & Secret → Click **Authorize**\n- Grant access in Google popup",
            actions: [
              { label: "Open Vault → New Credential", icon: KeyRound, variant: "primary" },
              { label: "Test Google connection", icon: CircleDot, variant: "secondary" },
              { label: "Use Service Account instead", icon: Shield, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "check_credential", args: 'provider="google"', result: "No Google credential found", duration: "14ms" },
              { tool: "fetch_oauth_config", args: 'provider="google"', result: "OAuth2 with consent screen, 3 API scopes", duration: "28ms" },
            ],
            tokenUsage: { input: 720, output: 580, cost: "$0.006" },
          };
        } else if (text.toLowerCase().includes("salesforce")) {
          response = {
            content: "🔑 **Salesforce Connected App Setup**\n\nSalesforce uses OAuth 2.0 with a Connected App:\n\n**Step 1 — Create Connected App**\n- Go to **Setup** → **App Manager** → **New Connected App**\n- Enable OAuth, add callback: `https://app.flowholt.com/oauth/callback/salesforce`\n- Scopes: `api`, `refresh_token`, `offline_access`\n\n**Step 2 — Enter in FlowHolt**\n- **Vault** → **New Credential** → **Salesforce**\n- Paste Consumer Key & Secret\n- Select environment: **Production** or **Sandbox**\n- Click **Authorize** → Log in to Salesforce\n\n**Step 3 — Verify**\n- Test with a simple SOQL query\n\n⚡ **Tip:** Use a dedicated integration user, not your admin account.",
            actions: [
              { label: "Open Vault → New Credential", icon: KeyRound, variant: "primary" },
              { label: "Test connection", icon: CircleDot, variant: "secondary" },
            ],
            toolCalls: [
              { tool: "check_credential", args: 'provider="salesforce"', result: "No Salesforce credential found", duration: "16ms" },
            ],
            tokenUsage: { input: 520, output: 460, cost: "$0.004" },
          };
        } else if (text.toLowerCase().includes("smtp") || text.toLowerCase().includes("email")) {
          response = {
            content: "🔑 **SMTP Email Setup**\n\nSMTP is a simple username/password credential:\n\n**Common providers:**\n| Provider | Host | Port | Auth |\n|----------|------|------|------|\n| Gmail | smtp.gmail.com | 587 | App Password |\n| Outlook | smtp.office365.com | 587 | OAuth or App Password |\n| SendGrid | smtp.sendgrid.net | 587 | API Key as password |\n| Amazon SES | email-smtp.{region}.amazonaws.com | 587 | IAM credentials |\n\n**For Gmail:**\n1. Enable 2FA on your Google account\n2. Generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)\n3. Use that as the SMTP password (not your real password)\n\n**Enter in FlowHolt:**\n- **Vault** → **New Credential** → **SMTP**\n- Host, Port, Username, Password\n- Enable **STARTTLS**",
            actions: [
              { label: "Open Vault → New Credential", icon: KeyRound, variant: "primary" },
              { label: "Send test email", icon: CircleDot, variant: "secondary" },
            ],
            tokenUsage: { input: 340, output: 380, cost: "$0.003" },
          };
        } else if (text.toLowerCase().includes("test") || text.toLowerCase().includes("verify") || text.toLowerCase().includes("check")) {
          response = {
            content: "🔍 **Credential Health Check**\n\nTesting all configured credentials:\n\n| Credential | Provider | Status | Last Used |\n|-----------|----------|--------|-----------|\n| OpenAI Production | OpenAI | ✅ Valid | 3 min ago |\n| Slack Bot | Slack | ✅ Valid | 1 hour ago |\n| Clearbit Enrichment | Clearbit | ⚠️ Rate limited | 12 min ago |\n| Salesforce Prod | Salesforce | ❌ Token expired | 2 days ago |\n| Google Sheets | Google | ✅ Valid | 5 min ago |\n\n**Issues found:**\n- **Salesforce**: Refresh token expired. Re-authorize to fix.\n- **Clearbit**: Approaching daily limit (92/100 used). Consider upgrading plan.\n\nWould you like me to fix the Salesforce credential?",
            actions: [
              { label: "Re-authorize Salesforce", icon: RefreshCw, variant: "primary" },
              { label: "View Clearbit usage", icon: Target, variant: "secondary" },
              { label: "Export credential report", icon: ArrowRight, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "test_all_credentials", args: "scope=all", result: "5 tested: 3 valid, 1 warning, 1 expired", duration: "1.2s" },
              { tool: "check_rate_limits", args: 'provider="clearbit"', result: "92/100 daily, resets in 4h", duration: "89ms" },
            ],
            tokenUsage: { input: 280, output: 360, cost: "$0.003" },
          };
        } else {
          const service = text.trim().split(/\s+/).pop() ?? "this service";
          response = {
            content: `🔑 **Setting up ${service}**\n\nI'll help you configure credentials for **${service}**. Here's what I need to know:\n\n1. **Auth type** — OAuth 2.0, API Key, or Basic Auth?\n2. **Environment** — Production or Sandbox?\n3. **Existing credentials** — Do you already have API keys/secrets?\n\nOnce I know these details, I'll generate a step-by-step guide specific to your setup.\n\n💡 **Tip:** You can also browse all supported integrations in **Vault** → **New Credential** to see available auth methods.`,
            actions: [
              { label: "It uses OAuth", icon: Link2, variant: "secondary" },
              { label: "It uses API Key", icon: KeyRound, variant: "secondary" },
              { label: "Browse integrations", icon: ExternalLink, variant: "ghost" },
            ],
            tokenUsage: { input: 220, output: 280, cost: "$0.002" },
          };
        }
      } else if (mode === "code") {
        // Code generation mode — Function node snippets, expressions, transformations
        if (text.toLowerCase().includes("transform") || text.toLowerCase().includes("json") || text.toLowerCase().includes("payload")) {
          response = {
            content: "💻 **JSON Payload Transformer**\n\nHere's a Function node that transforms incoming webhook data into your CRM format:",
            codeBlock: `// Function Node: Transform Webhook → CRM Format
const items = $input.all();

return items.map(item => {
  const data = item.json;
  return {
    json: {
      // Contact fields
      fullName: \`\${data.first_name} \${data.last_name}\`.trim(),
      email: data.email?.toLowerCase(),
      phone: data.phone?.replace(/[^\\d+]/g, ''),
      
      // Company enrichment
      company: {
        name: data.company_name ?? 'Unknown',
        domain: data.email?.split('@')[1] ?? null,
        size: categorizeSize(data.employee_count),
      },
      
      // Lead scoring
      score: calculateScore(data),
      source: data.utm_source ?? 'direct',
      
      // Metadata
      createdAt: new Date().toISOString(),
      raw: data, // preserve original
    }
  };
});

function categorizeSize(count) {
  if (!count) return 'unknown';
  if (count < 50) return 'startup';
  if (count < 500) return 'mid-market';
  return 'enterprise';
}

function calculateScore(d) {
  let score = 50;
  if (d.company_name) score += 15;
  if (d.phone) score += 10;
  if (d.utm_source === 'demo_request') score += 25;
  return Math.min(score, 100);
}`,
            actions: [
              { label: "Insert into Function node", icon: Code2, variant: "primary" },
              { label: "Add error handling", icon: Shield, variant: "secondary" },
              { label: "Generate test data", icon: Play, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "analyze_schema", args: 'node="Webhook Trigger"', result: "Input schema: {first_name, last_name, email, phone, company_name, employee_count, utm_source}", duration: "32ms" },
              { tool: "validate_code", args: 'syntax="javascript"', result: "✅ No syntax errors, all functions defined", duration: "18ms" },
            ],
            tokenUsage: { input: 680, output: 920, cost: "$0.007" },
          };
        } else if (text.toLowerCase().includes("filter") || text.toLowerCase().includes("condition") || text.toLowerCase().includes("where")) {
          response = {
            content: "💻 **Conditional Filter**\n\nFunction node to filter items by multiple conditions with detailed logging:",
            codeBlock: `// Function Node: Advanced Filter with Logging
const items = $input.all();
const results = { passed: [], filtered: [], errors: [] };

for (const item of items) {
  const d = item.json;
  try {
    const checks = [
      { name: 'hasEmail', pass: !!d.email && d.email.includes('@') },
      { name: 'validScore', pass: d.score >= 50 },
      { name: 'notBounced', pass: d.status !== 'bounced' },
      { name: 'recentActivity', pass: daysSince(d.last_active) < 90 },
    ];
    
    const failed = checks.filter(c => !c.pass);
    
    if (failed.length === 0) {
      results.passed.push({ json: { ...d, _filterPassed: true } });
    } else {
      results.filtered.push({
        json: { ...d, _filterReason: failed.map(f => f.name) }
      });
    }
  } catch (err) {
    results.errors.push({ json: { ...d, _error: err.message } });
  }
}

// Output 0: passed, Output 1: filtered, Output 2: errors
return [results.passed, results.filtered, results.errors];

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000;
}`,
            actions: [
              { label: "Insert into Function node", icon: Code2, variant: "primary" },
              { label: "Customize conditions", icon: Wrench, variant: "secondary" },
              { label: "Add to workflow", icon: Zap, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "inspect_data_schema", args: 'upstream_node="Score with AI"', result: "Fields: email, score, status, last_active, company", duration: "24ms" },
            ],
            tokenUsage: { input: 520, output: 780, cost: "$0.006" },
          };
        } else if (text.toLowerCase().includes("date") || text.toLowerCase().includes("time") || text.toLowerCase().includes("format")) {
          response = {
            content: "💻 **Date & Time Expressions**\n\nHere are common date expressions for your workflow nodes:\n\n**In expressions (inline):**",
            codeBlock: `// ─── Expression Examples (use in any node field) ───

// Current timestamp (ISO)
{{ $now.toISO() }}

// Format as readable date
{{ $now.toFormat('MMM dd, yyyy HH:mm') }}
// → "Apr 18, 2026 14:30"

// Relative time (e.g., "2 hours ago")
{{ DateTime.fromISO($json.created_at).toRelative() }}

// Add/subtract time
{{ $now.plus({ days: 7 }).toISO() }}        // 1 week from now
{{ $now.minus({ hours: 24 }).toISO() }}     // 24 hours ago

// Compare dates
{{ DateTime.fromISO($json.due_date) < $now ? 'overdue' : 'on_track' }}

// Business hours check  
{{ $now.hour >= 9 && $now.hour < 17 ? 'business_hours' : 'after_hours' }}

// ─── Function Node: Date Processing ───
const items = $input.all();
return items.map(item => ({
  json: {
    ...item.json,
    // Parse various formats
    parsedDate: DateTime.fromFormat(item.json.date, 'MM/dd/yyyy'),
    // Timezone conversion
    localTime: DateTime.fromISO(item.json.timestamp)
      .setZone('America/New_York')
      .toFormat('yyyy-MM-dd HH:mm:ss z'),
    // Age in days
    daysSinceCreated: Math.floor(
      $now.diff(DateTime.fromISO(item.json.created_at), 'days').days
    ),
  }
}));`,
            actions: [
              { label: "Copy expressions", icon: Copy, variant: "primary" },
              { label: "Insert Function node", icon: Code2, variant: "secondary" },
            ],
            tokenUsage: { input: 340, output: 620, cost: "$0.004" },
          };
        } else if (text.toLowerCase().includes("http") || text.toLowerCase().includes("api") || text.toLowerCase().includes("request") || text.toLowerCase().includes("fetch")) {
          response = {
            content: "💻 **HTTP Request with Auth & Error Handling**\n\nFunction node for making authenticated API calls with retry logic:",
            codeBlock: `// Function Node: Robust HTTP Request
const items = $input.all();
const results = [];

for (const item of items) {
  const response = await makeRequest(item.json);
  results.push({ json: response });
}
return results;

async function makeRequest(data, attempt = 1) {
  const MAX_RETRIES = 3;
  const BASE_URL = $env.API_BASE_URL ?? 'https://api.example.com';
  
  try {
    const res = await $http.request({
      method: 'POST',
      url: \`\${BASE_URL}/v2/process\`,
      headers: {
        'Authorization': \`Bearer \${$credentials.apiKey}\`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: {
        input: data.payload,
        options: { format: 'json', validate: true },
      },
      timeout: 10000,
    });
    
    return {
      success: true,
      statusCode: res.statusCode,
      data: res.body,
      duration: res.timings?.total,
    };
  } catch (err) {
    if (attempt < MAX_RETRIES && isRetryable(err)) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
      return makeRequest(data, attempt + 1);
    }
    return {
      success: false,
      error: err.message,
      statusCode: err.statusCode ?? 500,
      attempt,
    };
  }
}

function isRetryable(err) {
  const code = err.statusCode;
  return code === 429 || code === 502 || code === 503;
}`,
            actions: [
              { label: "Insert into Function node", icon: Code2, variant: "primary" },
              { label: "Add OAuth support", icon: Shield, variant: "secondary" },
              { label: "Configure environment vars", icon: Settings, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "check_credentials", args: 'type="api_key"', result: "3 API key credentials available", duration: "15ms" },
              { tool: "validate_code", args: 'syntax="javascript", async=true', result: "✅ Valid async function, retry logic sound", duration: "22ms" },
            ],
            tokenUsage: { input: 780, output: 1100, cost: "$0.009" },
          };
        } else if (text.toLowerCase().includes("csv") || text.toLowerCase().includes("parse") || text.toLowerCase().includes("split")) {
          response = {
            content: "💻 **CSV Parser**\n\nFunction node to parse CSV text into structured JSON with type inference:",
            codeBlock: `// Function Node: CSV → JSON with Type Inference
const items = $input.all();
const csvText = items[0].json.data; // raw CSV string

const rows = csvText.trim().split('\\n');
const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));

const parsed = rows.slice(1).map((row, idx) => {
  const values = parseCSVRow(row);
  const obj = {};
  
  headers.forEach((header, i) => {
    const val = values[i]?.trim() ?? '';
    obj[header] = inferType(val);
  });
  
  obj._rowIndex = idx + 1;
  return { json: obj };
});

return parsed;

function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const char of row) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === ',' && !inQuotes) { result.push(current); current = ''; continue; }
    current += char;
  }
  result.push(current);
  return result;
}

function inferType(val) {
  if (val === '') return null;
  if (val === 'true' || val === 'false') return val === 'true';
  if (/^-?\\d+\\.?\\d*$/.test(val)) return Number(val);
  if (/^\\d{4}-\\d{2}-\\d{2}/.test(val)) return val; // keep dates as strings
  return val;
}`,
            actions: [
              { label: "Insert into Function node", icon: Code2, variant: "primary" },
              { label: "Handle encoding issues", icon: Wrench, variant: "secondary" },
              { label: "Preview parsed output", icon: Eye, variant: "ghost" },
            ],
            tokenUsage: { input: 440, output: 860, cost: "$0.006" },
          };
        } else if (text.toLowerCase().includes("merge") || text.toLowerCase().includes("join") || text.toLowerCase().includes("combine")) {
          response = {
            content: "💻 **Data Merge / Join**\n\nFunction node to merge data from two input branches by a common key:",
            codeBlock: `// Function Node: Merge Two Inputs by Key
// Connect two nodes to this Function node's inputs
const input1 = $input.first(0); // e.g., CRM contacts
const input2 = $input.first(1); // e.g., email analytics

const contacts = input1?.json ? [input1.json] : $input.all().map(i => i.json);
const analytics = input2?.json ? [input2.json] : [];

// Build lookup map from second input
const analyticsMap = new Map();
for (const record of analytics) {
  const key = record.email?.toLowerCase();
  if (key) analyticsMap.set(key, record);
}

// Merge: left join contacts with analytics
const merged = contacts.map(contact => {
  const key = contact.email?.toLowerCase();
  const match = key ? analyticsMap.get(key) : null;
  
  return {
    json: {
      // Contact fields
      ...contact,
      // Analytics overlay
      opens: match?.opens ?? 0,
      clicks: match?.clicks ?? 0,
      lastEngaged: match?.last_engaged ?? null,
      engagementScore: match
        ? Math.round((match.opens * 1 + match.clicks * 3) / 4 * 100)
        : 0,
      // Merge metadata
      _matched: !!match,
      _mergedAt: new Date().toISOString(),
    }
  };
});

return merged;`,
            actions: [
              { label: "Insert into Function node", icon: Code2, variant: "primary" },
              { label: "Use outer join instead", icon: Wrench, variant: "secondary" },
              { label: "Add deduplication", icon: Layers, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "inspect_inputs", args: 'node="Function", inputs=2', result: "Input 0: 142 contacts, Input 1: 89 analytics records", duration: "28ms" },
            ],
            tokenUsage: { input: 560, output: 740, cost: "$0.006" },
          };
        } else if (text.toLowerCase().includes("regex") || text.toLowerCase().includes("extract") || text.toLowerCase().includes("validate") || text.toLowerCase().includes("pattern")) {
          response = {
            content: "💻 **Regex Patterns & Validation**\n\nCommon patterns for data extraction and validation in expressions and Function nodes:",
            codeBlock: `// ─── Expression Patterns (use in Set/IF nodes) ───

// Extract email from text
{{ $json.text.match(/[\\w.-]+@[\\w.-]+\\.[a-z]{2,}/i)?.[0] ?? '' }}

// Validate phone number
{{ /^\\+?[\\d\\s()-]{10,}$/.test($json.phone) ? 'valid' : 'invalid' }}

// Extract URLs
{{ $json.body.match(/https?:\\/\\/[^\\s<>"]+/g) ?? [] }}

// ─── Function Node: Comprehensive Data Validation ───
const items = $input.all();

const patterns = {
  email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
  phone: /^\\+?[1-9]\\d{6,14}$/,
  url: /^https?:\\/\\/[^\\s/$.?#].[^\\s]*$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  isoDate: /^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2})?/,
};

return items.map(item => {
  const d = item.json;
  const errors = [];
  
  if (d.email && !patterns.email.test(d.email))
    errors.push('Invalid email format');
  if (d.phone && !patterns.phone.test(d.phone.replace(/[\\s()-]/g, '')))
    errors.push('Invalid phone number');
  if (d.website && !patterns.url.test(d.website))
    errors.push('Invalid URL');
  
  return {
    json: {
      ...d,
      _valid: errors.length === 0,
      _errors: errors,
      _sanitized: {
        email: d.email?.toLowerCase().trim(),
        phone: d.phone?.replace(/[^\\d+]/g, ''),
        name: d.name?.replace(/[<>{}]/g, '').trim(),
      }
    }
  };
});`,
            actions: [
              { label: "Insert validation node", icon: Code2, variant: "primary" },
              { label: "Add custom patterns", icon: Wrench, variant: "secondary" },
              { label: "Test with sample data", icon: Play, variant: "ghost" },
            ],
            tokenUsage: { input: 480, output: 950, cost: "$0.007" },
          };
        } else {
          // Generic code generation response
          const task = text.trim();
          response = {
            content: `💻 **Code Generator**\n\nI'll write code for: *"${task}"*\n\nTo generate the best code, tell me:\n\n1. **Context** — Which node will this run in? (Function, Expression, HTTP Request)\n2. **Input format** — What does the incoming data look like?\n3. **Expected output** — What should the result look like?\n\n💡 **Tip:** Paste a sample of your input data and I'll auto-detect the schema.\n\nOr try a quick action below for common patterns.`,
            actions: [
              { label: "Function node code", icon: Terminal, variant: "secondary" },
              { label: "Expression formula", icon: Braces, variant: "secondary" },
              { label: "Show code templates", icon: FileJson, variant: "ghost" },
            ],
            tokenUsage: { input: 280, output: 320, cost: "$0.003" },
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
        } else if (text.toLowerCase().includes("optim") || text.toLowerCase().includes("improve") || text.toLowerCase().includes("performance")) {
          response = {
            content: "**Performance Analysis** for Lead Qualification Pipeline:\n\n🔍 **Bottleneck identified:** Node 3 (*Score with AI*) takes 62% of total execution time.\n\n**Optimization recommendations:**\n\n1. **Cache repeated leads** — Same email within 24h returns cached score → saves ~$18/month\n2. **Use GPT-4o-mini** for initial screen, GPT-4o only for borderline (50-80) scores → 40% cost reduction\n3. **Parallel enrichment** — Run Clearbit + AI scoring simultaneously instead of sequentially → 890ms saved\n4. **Batch Slack notifications** — Group 5 leads into single digest message → fewer API calls",
            actions: [
              { label: "Apply top recommendation", icon: Wand2, variant: "primary" },
              { label: "Show cost projections", icon: Target, variant: "secondary" },
              { label: "Switch to Build mode", icon: Hammer, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "analyze_performance", args: 'last_executions=100', result: "Avg 1.2s, p95 2.8s, bottleneck: node n2", duration: "156ms" },
              { tool: "estimate_costs", args: 'period="30d"', result: "$42.80 projected monthly", duration: "23ms" },
            ],
            tokenUsage: { input: 920, output: 680, cost: "$0.007" },
          };
        } else if (text.toLowerCase().includes("stats") || text.toLowerCase().includes("execution") || text.toLowerCase().includes("metrics")) {
          response = {
            content: "**Execution Stats** (last 7 days):\n\n| Metric | Value |\n|--------|-------|\n| Total runs | 1,047 |\n| Success rate | 94.2% |\n| Avg duration | 1.24s |\n| P95 latency | 2.81s |\n| AI tokens used | 356K |\n| Total cost | $9.42 |\n\n**Top errors:**\n1. HTTP 429 (Clearbit) — 38 occurrences\n2. Timeout (Salesforce) — 12 occurrences\n3. Invalid email format — 8 occurrences",
            actions: [
              { label: "View full dashboard", icon: Target, variant: "secondary" },
              { label: "Export CSV", icon: ArrowRight, variant: "ghost" },
            ],
            toolCalls: [
              { tool: "query_execution_stats", args: 'period="7d", workflow="wf-lead-qual"', result: "1,047 executions loaded", duration: "312ms" },
            ],
            tokenUsage: { input: 580, output: 420, cost: "$0.004" },
          };
        } else {
          response = {
            content: "I'll analyze that for you. Here are my findings based on the current workflow state and recent executions.\n\nYour **Lead Qualification Pipeline** is running well with a 94% success rate. The main area for improvement is the Clearbit enrichment step, which occasionally hits rate limits during high-traffic periods.\n\nWould you like me to dive deeper into any specific aspect?",
            actions: [
              { label: "Show more details", icon: Eye, variant: "secondary" },
              { label: "Suggest improvements", icon: Sparkles, variant: "ghost" },
            ],
          };
        }
      }

      // Stream the response character by character
      streamResponse(response);
    }, thinkDelay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
    if (e.key === "@") setShowNodePicker(true);
    if (e.key === "Escape") { setShowNodePicker(false); if (isStreaming) cancelStream(); }
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
        {(["ask", "build", "builder", "credentials", "code"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 -mb-px transition-colors",
              mode === m ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            {m === "ask" ? <MessageSquare size={11} /> : m === "build" ? <Hammer size={11} /> : m === "builder" ? <Wand2 size={11} /> : m === "credentials" ? <KeyRound size={11} /> : <Code2 size={11} />}
            {m === "ask" ? "Ask" : m === "build" ? "Build" : m === "builder" ? "Builder" : m === "credentials" ? "Creds" : "Code"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 py-2 relative">
          <span className="text-[9px] text-zinc-300">model:</span>
          <button onClick={() => setShowModelPicker(!showModelPicker)} className="flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 hover:bg-zinc-50">
            <Cpu size={9} /> {modelOptions.find(m => m.id === selectedModel)?.label ?? "GPT-4o"} <ChevronDown size={8} />
          </button>
          {showModelPicker && (
            <div className="absolute top-full right-0 mt-1 z-50 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg p-1">
              {modelOptions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[10px] hover:bg-zinc-50 transition-colors",
                    selectedModel === m.id && "bg-zinc-50 font-semibold"
                  )}
                >
                  <Cpu size={9} className="text-zinc-400 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <span className="text-zinc-700">{m.label}</span>
                    <span className="text-zinc-400 ml-1">({m.provider})</span>
                  </div>
                  {m.badge && (
                    <span className="rounded bg-zinc-100 px-1 py-0.5 text-[8px] font-medium text-zinc-500">{m.badge}</span>
                  )}
                </button>
              ))}
            </div>
          )}
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
                        {msg.diff.some(d => d.reviewStatus === "pending") && (
                          <button
                            onClick={() => {
                              applyAllDiffs(msg.diff!);
                              msg.diff!.forEach((_, idx) => updateDiffStatus(msg.id, idx, "accepted"));
                            }}
                            className="ml-auto rounded-md bg-green-500 px-2 py-0.5 text-[8px] font-semibold text-white hover:bg-green-600 transition-colors"
                          >
                            Accept All
                          </button>
                        )}
                      </div>
                      {msg.diff.map((change, i) => {
                        const Icon = diffActionIcons[change.action];
                        const isAccepted = change.reviewStatus === "accepted";
                        const isRejected = change.reviewStatus === "rejected";
                        return (
                          <div key={i} className={cn(
                            "flex items-start gap-2 px-2.5 py-2 border-b border-zinc-50 last:border-0 transition-colors",
                            isAccepted ? "bg-green-50/50" : isRejected ? "bg-red-50/30 opacity-50" : "hover:bg-zinc-50/50"
                          )}>
                            <span className={cn("flex items-center gap-0.5 rounded px-1 py-0.5 text-[8px] font-semibold uppercase flex-shrink-0 mt-0.5", diffActionColors[change.action])}>
                              <Icon size={8} />{change.action}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-zinc-700">{change.nodeName}</p>
                              <p className="text-[9px] text-zinc-400 leading-relaxed">{change.details}</p>
                              {isAccepted && <span className="text-[8px] text-green-600 font-medium">✓ Applied to canvas</span>}
                              {isRejected && <span className="text-[8px] text-red-500 font-medium">✗ Rejected</span>}
                            </div>
                            {change.reviewStatus === "pending" && (
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <button
                                  onClick={() => { applyDiffChange(change); updateDiffStatus(msg.id, i, "accepted"); }}
                                  className="rounded p-0.5 text-green-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                  title="Accept & Apply"
                                >
                                  <Check size={10} />
                                </button>
                                <button
                                  onClick={() => updateDiffStatus(msg.id, i, "rejected")}
                                  className="rounded p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={10} />
                                </button>
                              </div>
                            )}
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
                        <button key={i} onClick={() => {
                          if (action.onClick) { action.onClick(); return; }
                          if (msg.diff && (action.label.toLowerCase().includes("apply") || action.label.toLowerCase().includes("generate"))) {
                            applyAllDiffs(msg.diff);
                            msg.diff.forEach((_, idx) => updateDiffStatus(msg.id, idx, "accepted"));
                          }
                        }} className={cn(
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

        {/* Streaming cursor indicator */}
        {isStreaming && (
          <div className="mb-1 flex items-center gap-2 px-2">
            <span className="inline-block h-3.5 w-0.5 animate-pulse bg-violet-500 rounded-full" />
            <span className="text-[9px] text-zinc-400">Streaming…</span>
            <button
              onClick={cancelStream}
              className="ml-auto rounded-md border border-zinc-200 px-2 py-0.5 text-[9px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              Stop ■
            </button>
          </div>
        )}

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
                <span>{mode === "build" ? "Building…" : mode === "credentials" ? "Checking…" : mode === "code" ? "Generating…" : "Thinking…"}</span>
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
            {mode === "ask" ? "Quick Questions" : mode === "build" ? "Quick Builds" : mode === "builder" ? "Example Workflows" : mode === "code" ? "Code Templates" : "Common Setups"}
          </p>
          <div className="flex flex-wrap gap-1">
            {(mode === "ask" ? askActions : mode === "build" ? buildActions : mode === "builder" ? builderActions : mode === "code" ? codeActions : credentialActions).map((action) => {
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
            placeholder={mode === "ask" ? "Ask about your workflow… (@ to mention nodes)" : mode === "credentials" ? "Which service do you need to connect?" : mode === "code" ? "Describe the code you need…" : "Describe what to build or change…"}
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
            onClick={() => isStreaming ? cancelStream() : send(input)}
            disabled={!input.trim() && !isStreaming}
            className={cn(
              "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all mb-0.5",
              isStreaming ? "bg-red-500 text-white hover:bg-red-600"
                : input.trim() && !isTyping ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:opacity-90"
                : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
            )}
          >
            {isStreaming ? <X size={11} /> : <Send size={11} />}
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
