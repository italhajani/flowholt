import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, Bot, User, Trash2, Copy, ChevronDown, Wand2, Code2, GitBranch, Play, ArrowRight, Wrench, AlertTriangle, CheckCircle2, Lightbulb, Zap, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: CopilotAction[];
  nodePreview?: NodePreview[];
  codeBlock?: string;
  thinking?: boolean;
}

interface CopilotAction {
  label: string;
  icon: React.ElementType;
  variant: "primary" | "secondary" | "ghost";
  onClick?: () => void;
}

interface NodePreview {
  name: string;
  type: "trigger" | "integration" | "ai" | "logic" | "output";
  status: "ready" | "new";
}

const typeColors: Record<string, string> = {
  trigger: "bg-green-100 text-green-700 border-green-200",
  integration: "bg-violet-100 text-violet-700 border-violet-200",
  ai: "bg-zinc-100 text-zinc-700 border-zinc-200",
  logic: "bg-blue-100 text-blue-700 border-blue-200",
  output: "bg-amber-100 text-amber-700 border-amber-200",
};

const quickActions = [
  { label: "Explain this workflow", icon: Lightbulb },
  { label: "Debug last error", icon: AlertTriangle },
  { label: "Suggest improvements", icon: Sparkles },
  { label: "Add error handling", icon: Wrench },
  { label: "Generate test data", icon: FileJson },
  { label: "Build a workflow…", icon: Wand2 },
];

const contextInfo = {
  workflowName: "Lead Qualification Pipeline",
  nodeCount: 7,
  lastExecution: "2 min ago (success)",
  model: "GPT-4o",
};

const assistantGreeting: CopilotMessage = {
  id: "greet",
  role: "assistant",
  content: "Hi! I'm your FlowHolt AI assistant. I can help you:\n\n• **Build** workflows from natural language\n• **Debug** execution errors\n• **Explain** what nodes and workflows do\n• **Suggest** improvements and best practices\n\nWhat would you like to do?",
};

interface StudioCopilotPanelProps {
  onClose: () => void;
}

export function StudioCopilotPanel({ onClose }: StudioCopilotPanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([assistantGreeting]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scroll = useCallback(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), []);
  useEffect(() => { scroll(); }, [messages, scroll]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: CopilotMessage = { id: `u-${Date.now()}`, role: "user", content: text.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";

    // Simulate response
    setTimeout(() => {
      let response: Partial<CopilotMessage> = { content: "I'll analyze your workflow and get back to you with specific suggestions." };

      if (text.toLowerCase().includes("explain")) {
        response = {
          content: "This workflow is a **lead qualification pipeline** with 5 nodes:\n\n1. **Webhook Trigger** — Receives incoming lead data via HTTP POST\n2. **Score with AI** — Uses GPT-4o to score lead quality (0-100)\n3. **Route by Score** — Branches into Hot (>80), Warm, Cold paths\n4. **Enrich via Clearbit** — Fetches company data for hot/warm leads\n5. **Notify on Slack** — Sends qualified leads to #sales-leads\n\nProcesses ~150 leads/day with 94% success rate.",
          actions: [
            { label: "Show execution logs", icon: Play, variant: "secondary" },
            { label: "Open workflow settings", icon: Wrench, variant: "ghost" },
          ],
        };
      } else if (text.toLowerCase().includes("debug") || text.toLowerCase().includes("error")) {
        response = {
          content: "⚠️ **Error found in Node 4 (Enrich via Clearbit)**\n\n```\nHTTP 429: Rate limit exceeded\nX-RateLimit-Remaining: 0\nRetry-After: 30\n```\n\n**Root cause:** Too many concurrent requests to the Clearbit API.\n\n**Recommended fixes:**\n1. Add a **Wait** node before Clearbit with 200ms delay\n2. Enable **batching** (batch size: 5)\n3. Add retry logic: 3 retries with exponential backoff",
          actions: [
            { label: "Apply fix automatically", icon: Wand2, variant: "primary" },
            { label: "Show error details", icon: Code2, variant: "secondary" },
          ],
          nodePreview: [
            { name: "Wait (200ms)", type: "logic", status: "new" },
            { name: "Enrich via Clearbit", type: "integration", status: "ready" },
          ],
        };
      } else if (text.toLowerCase().includes("improve") || text.toLowerCase().includes("suggest")) {
        response = {
          content: "Here are my suggestions for this workflow:\n\n✅ **Add error handling** — Wrap Clearbit and Slack with retry logic.\n✅ **Add data validation** — Filter node to validate required fields.\n✅ **Optimize AI scoring** — Cache results for repeat domains (~30% savings).\n✅ **Add monitoring** — Connect to Operations dashboard.",
          actions: [
            { label: "Apply all suggestions", icon: Wand2, variant: "primary" },
            { label: "Apply one by one", icon: ArrowRight, variant: "secondary" },
          ],
        };
      } else if (text.toLowerCase().includes("test data")) {
        response = {
          content: "Here's sample test data for your webhook trigger:",
          codeBlock: JSON.stringify({
            lead: { email: "jane@acme.com", name: "Jane Smith", company: "Acme Corp", role: "VP Engineering", source: "demo_request" },
            metadata: { ip: "203.0.113.42", utm_source: "google", timestamp: "2026-04-18T14:30:00Z" },
          }, null, 2),
          actions: [
            { label: "Send to webhook", icon: Play, variant: "primary" },
            { label: "Generate more variants", icon: Sparkles, variant: "secondary" },
            { label: "Copy JSON", icon: Copy, variant: "ghost" },
          ],
        };
      } else if (text.toLowerCase().includes("build") || text.toLowerCase().includes("create")) {
        response = {
          content: "I'll create that workflow for you. Here's the plan:",
          nodePreview: [
            { name: "Webhook Trigger", type: "trigger", status: "new" },
            { name: "Parse Input", type: "logic", status: "new" },
            { name: "AI Processing", type: "ai", status: "new" },
            { name: "Route by Result", type: "logic", status: "new" },
            { name: "Send Notification", type: "output", status: "new" },
          ],
          actions: [
            { label: "Generate workflow", icon: Wand2, variant: "primary" },
            { label: "Customize first", icon: Wrench, variant: "secondary" },
          ],
        };
      }

      setMessages((p) => [...p, {
        id: `a-${Date.now()}`,
        role: "assistant" as const,
        ...response,
        content: response.content!,
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div
      className="flex w-[380px] flex-shrink-0 flex-col border-l"
      style={{
        borderColor: "var(--color-border-default)",
        background: "var(--color-bg-page)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-zinc-800">AI Assistant</span>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">Beta</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([assistantGreeting])}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            title="Clear conversation"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Context banner */}
        {messages.length <= 1 && (
          <div className="mb-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[11px]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <GitBranch size={10} className="text-zinc-400" />
              <span className="font-medium text-zinc-600">Current Context</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-zinc-500">
              <span>Workflow: <span className="text-zinc-700">{contextInfo.workflowName}</span></span>
              <span>Nodes: <span className="text-zinc-700">{contextInfo.nodeCount}</span></span>
              <span>Last run: <span className="text-zinc-700">{contextInfo.lastExecution}</span></span>
              <span>Model: <span className="text-zinc-700">{contextInfo.model}</span></span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("mb-3", msg.role === "user" ? "flex justify-end" : "flex justify-start")}>
            {msg.role === "assistant" && (
              <div className="mr-2 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div className={cn("max-w-[290px]", msg.role === "user" ? "items-end" : "")}>
              <div
                className={cn(
                  "rounded-xl px-3 py-2.5 text-[12.5px] leading-relaxed",
                  msg.role === "user"
                    ? "bg-zinc-100 text-zinc-800 rounded-br-sm"
                    : "bg-white border border-zinc-100 text-zinc-700 rounded-bl-sm"
                )}
              >
                <div className="whitespace-pre-wrap [&_strong]:font-semibold [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:p-2.5 [&_pre]:text-[11px] [&_pre]:overflow-x-auto [&_pre]:my-1.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                  {msg.content}
                </div>

                {/* Code block */}
                {msg.codeBlock && (
                  <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-2.5 text-[11px] overflow-x-auto my-1.5 font-mono leading-relaxed">
                    {msg.codeBlock}
                  </pre>
                )}

                {/* Node preview pipeline */}
                {msg.nodePreview && msg.nodePreview.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.nodePreview.map((node, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {i > 0 && <div className="w-[1px] h-2 bg-zinc-200 ml-2 -mt-1 -mb-1" />}
                        <div className={cn(
                          "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium",
                          typeColors[node.type]
                        )}>
                          {node.status === "new" && <Zap size={9} />}
                          {node.name}
                        </div>
                        {i < msg.nodePreview!.length - 1 && <ArrowRight size={10} className="text-zinc-300" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {msg.actions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={i}
                        className={cn(
                          "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all",
                          action.variant === "primary"
                            ? "bg-zinc-900 text-white hover:bg-zinc-700"
                            : action.variant === "secondary"
                            ? "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                            : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                        )}
                      >
                        <Icon size={10} /> {action.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {msg.role === "assistant" && msg.id !== "greet" && !msg.actions && (
                <div className="mt-1.5 flex items-center gap-0.5 -ml-0.5">
                  <button className="rounded p-1 text-zinc-300 hover:text-zinc-500 transition-colors" title="Copy">
                    <Copy size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="mb-3 flex justify-start">
            <div className="mr-2 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Bot size={12} className="text-white" />
            </div>
            <div className="rounded-xl rounded-bl-sm border border-zinc-100 bg-white px-3 py-2.5">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Quick Actions</p>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => send(action.label)}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700"
                >
                  <Icon size={10} className="text-zinc-400" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="border-t px-4 py-3"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl border bg-white px-3 py-2 transition-all focus-within:border-zinc-400"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the assistant…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13px] text-zinc-800 placeholder:text-zinc-400 outline-none leading-relaxed"
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
              "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all",
              input.trim() && !isTyping
                ? "bg-zinc-900 text-white hover:bg-zinc-700"
                : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
            )}
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Floating Canvas Button ─────────────────────────── */

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
      Ask Assistant
    </button>
  );
}
