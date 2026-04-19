import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Plus,
  ChevronDown,
  Sparkles,
  Bot,
  User,
  MoreHorizontal,
  Trash2,
  Copy,
  RefreshCw,
  Clock,
  MessageSquare,
  Settings2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  model: string;
  messageCount: number;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
}

interface PersonalAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  model: string;
}

/* ── Mock Data ─────────────────────────────────────── */

const models: AIModel[] = [
  { id: "gpt-4o",       name: "GPT-4o",           provider: "OpenAI",    description: "Most capable model",     badge: "Popular" },
  { id: "gpt-4o-mini",  name: "GPT-4o Mini",      provider: "OpenAI",    description: "Fast and affordable" },
  { id: "claude-4",     name: "Claude 4 Sonnet",   provider: "Anthropic", description: "Balanced performance",   badge: "New" },
  { id: "claude-haiku", name: "Claude Haiku",      provider: "Anthropic", description: "Fastest responses" },
  { id: "gemini-2",     name: "Gemini 2.0 Flash",  provider: "Google",    description: "Multimodal capable" },
  { id: "deepseek-v3",  name: "DeepSeek V3",       provider: "DeepSeek",  description: "Open-source leader" },
];

const personalAgents: PersonalAgent[] = [
  { id: "pa-1", name: "Code Reviewer",     description: "Reviews PRs and suggests improvements", icon: "🔍", model: "gpt-4o" },
  { id: "pa-2", name: "Data Transformer",  description: "Converts data between formats",         icon: "🔄", model: "claude-4" },
  { id: "pa-3", name: "Workflow Helper",    description: "Helps design and debug workflows",      icon: "⚡", model: "gpt-4o" },
];

const mockConversations: Conversation[] = [
  { id: "c-1", title: "Build Slack notification workflow",  lastMessage: "Here's how to set up the Slack...",      updatedAt: new Date(2026, 3, 18, 14, 30), model: "gpt-4o",  messageCount: 12 },
  { id: "c-2", title: "Debug webhook retry logic",          lastMessage: "The issue is in your retry config...",   updatedAt: new Date(2026, 3, 18, 10, 15), model: "claude-4", messageCount: 8 },
  { id: "c-3", title: "Parse CSV with expressions",         lastMessage: "You can use the splitItems node...",     updatedAt: new Date(2026, 3, 17, 16, 45), model: "gpt-4o",  messageCount: 5 },
  { id: "c-4", title: "Set up Google Sheets credential",    lastMessage: "Navigate to Settings → Credentials...", updatedAt: new Date(2026, 3, 16, 9, 20),  model: "claude-haiku", messageCount: 3 },
];

const mockMessages: ChatMessage[] = [
  { id: "m-1", role: "user",      content: "How do I build a workflow that sends a Slack notification when a new row is added to Google Sheets?", timestamp: new Date(2026, 3, 18, 14, 0) },
  { id: "m-2", role: "assistant", content: "Great question! Here's a step-by-step approach:\n\n**1. Trigger: Google Sheets**\nAdd a Google Sheets trigger node and configure it to watch for new rows in your target spreadsheet.\n\n**2. Transform (optional)**\nIf you need to format the data, add a Set node to structure the message.\n\n**3. Action: Slack**\nAdd a Slack node, select \"Send Message\", and configure:\n- **Channel**: Pick your target channel\n- **Message**: Use expressions like `{{ $json.name }}` to include sheet data\n\n**4. Activate**\nTest the workflow, then toggle it active. New rows will automatically trigger Slack messages.\n\nWould you like me to help you set up any of these nodes in detail?", timestamp: new Date(2026, 3, 18, 14, 1), model: "gpt-4o" },
  { id: "m-3", role: "user",      content: "Yes, can you explain how expressions work for pulling data from the previous node?", timestamp: new Date(2026, 3, 18, 14, 5) },
  { id: "m-4", role: "assistant", content: "Sure! In FlowHolt, **expressions** let you reference data from previous nodes dynamically.\n\n### Basic syntax\n```\n{{ $json.fieldName }}\n```\nThis accesses the `fieldName` property from the previous node's output.\n\n### Common patterns\n| Expression | Description |\n|---|---|\n| `{{ $json.email }}` | Get email field |\n| `{{ $json.items[0].name }}` | First item's name |\n| `{{ $now.toISO() }}` | Current timestamp |\n| `{{ $input.first().json.id }}` | First input item's ID |\n\n### Tips\n- Click the **expression editor** (fx icon) in any field to browse available data\n- Use **dot notation** for nested objects: `{{ $json.user.address.city }}`\n- Expressions are evaluated at runtime with real data\n\nWant me to write a specific expression for your use case?", timestamp: new Date(2026, 3, 18, 14, 6), model: "gpt-4o" },
];

const suggestedPrompts = [
  "Build a workflow that syncs data between two apps",
  "Help me debug a failing execution",
  "Explain how to use the AI Agent node",
  "Set up webhook authentication",
];

/* ── Subcomponents ─────────────────────────────────── */

function ModelSelector({ selected, onSelect, open, onToggle }: {
  selected: AIModel;
  onSelect: (m: AIModel) => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50"
      >
        <Sparkles size={13} className="text-zinc-400" />
        {selected.name}
        <ChevronDown size={13} className={cn("text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-[280px] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Models</div>
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => { onSelect(m); onToggle(); }}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-50",
                m.id === selected.id && "bg-zinc-50"
              )}
            >
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100">
                <Sparkles size={12} className="text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-zinc-800">{m.name}</span>
                  {m.badge && (
                    <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">{m.badge}</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">{m.provider} · {m.description}</p>
              </div>
            </button>
          ))}

          <div className="mt-1 border-t border-zinc-100 pt-1">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Personal Agents</div>
            {personalAgents.map((a) => (
              <button
                key={a.id}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-50"
              >
                <span className="text-[14px]">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-zinc-800">{a.name}</span>
                  <p className="text-[11px] text-zinc-400 truncate">{a.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 py-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 mt-0.5">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div className={cn("max-w-[680px] min-w-0", isUser && "order-first")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed",
            isUser
              ? "bg-zinc-100 text-zinc-800 rounded-br-md"
              : "bg-white text-zinc-700 border border-zinc-100 rounded-bl-md"
          )}
        >
          <div className="whitespace-pre-wrap prose-sm [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_code]:font-mono [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-[12px] [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:text-[12px] [&_table]:w-full [&_th]:text-left [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:border-b [&_th]:border-zinc-200 [&_td]:border-b [&_td]:border-zinc-100 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_strong]:font-semibold [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5">
            {message.content}
          </div>
        </div>
        {!isUser && (
          <div className="mt-1.5 flex items-center gap-1 px-1">
            <button className="rounded p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-colors" title="Copy">
              <Copy size={12} />
            </button>
            <button className="rounded p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-colors" title="Regenerate">
              <RefreshCw size={12} />
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-200 mt-0.5">
          <User size={14} className="text-zinc-600" />
        </div>
      )}
    </div>
  );
}

function ConversationItem({ conv, active, onClick }: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  const timeAgo = getTimeAgo(conv.updatedAt);
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
        active ? "bg-zinc-100" : "hover:bg-zinc-50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-[13px] font-medium truncate pr-2", active ? "text-zinc-900" : "text-zinc-700")}>
          {conv.title}
        </span>
        <span className="flex-shrink-0 text-[10px] text-zinc-400">{timeAgo}</span>
      </div>
      <p className="text-[11px] text-zinc-400 truncate">{conv.lastMessage}</p>
    </button>
  );
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/* ── Main Page ─────────────────────────────────────── */

export function ChatHubPage() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [activeConv, setActiveConv] = useState<string>("c-1");
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"history" | "agents">("history");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: "I'd be happy to help with that! Let me think about the best approach...\n\nBased on your workflow configuration, I'd recommend using the **HTTP Request** node with retry logic enabled. You can set the retry count in the node settings under \"Options → Batching & Retries\".\n\nWould you like me to walk you through the specific configuration?",
        timestamp: new Date(),
        model: selectedModel.id,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConv("");
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar — conversation history + agents */}
      <div
        className="flex w-[280px] flex-shrink-0 flex-col border-r"
        style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
      >
        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] font-medium text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300"
          >
            <Plus size={14} />
            New chat
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-3" style={{ borderColor: "var(--color-border-default)" }}>
          {(["history", "agents"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSidebarTab(tab)}
              className={cn(
                "flex-1 py-2 text-[12px] font-medium capitalize transition-colors border-b-2",
                sidebarTab === tab
                  ? "border-zinc-800 text-zinc-800"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab === "history" ? "History" : "Agents"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {sidebarTab === "history" ? (
            <div className="flex flex-col gap-0.5">
              {mockConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={activeConv === conv.id}
                  onClick={() => {
                    setActiveConv(conv.id);
                    setMessages(mockMessages);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="px-2 py-1 text-[11px] text-zinc-400">
                Personal agents with custom instructions.
              </p>
              {personalAgents.map((agent) => (
                <button
                  key={agent.id}
                  className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-50"
                >
                  <span className="mt-0.5 text-[16px]">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-700">{agent.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{agent.description}</p>
                    <p className="text-[10px] text-zinc-300 mt-1">{models.find((m) => m.id === agent.model)?.name}</p>
                  </div>
                </button>
              ))}

              <button className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-2.5 text-[12px] text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600">
                <Plus size={13} />
                Create agent
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <ModelSelector
            selected={selectedModel}
            onSelect={setSelectedModel}
            open={modelSelectorOpen}
            onToggle={() => setModelSelectorOpen(!modelSelectorOpen)}
          />
          <div className="flex items-center gap-1.5">
            <button className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600" title="Chat settings">
              <Settings2 size={15} />
            </button>
            <button className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600" title="More options">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty state — new conversation */
            <div className="flex h-full flex-col items-center justify-center px-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 mb-4">
                <Sparkles size={22} className="text-zinc-400" />
              </div>
              <h2 className="text-[18px] font-semibold text-zinc-800">How can I help?</h2>
              <p className="mt-1 text-[13px] text-zinc-400 max-w-[400px] text-center">
                Ask me anything about building workflows, debugging executions, or configuring integrations.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 max-w-[520px] w-full">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInputValue(prompt)}
                    className="flex items-start gap-2.5 rounded-xl border border-zinc-150 bg-white px-3.5 py-3 text-left text-[12.5px] text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700"
                    style={{ borderColor: "var(--color-border-default)" }}
                  >
                    <Zap size={13} className="mt-0.5 flex-shrink-0 text-zinc-300" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-[780px] px-5 py-2">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 py-4">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md border border-zinc-100 bg-white px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t px-5 py-4" style={{ borderColor: "var(--color-border-default)" }}>
          <div className="mx-auto max-w-[780px]">
            <div
              className="flex items-end gap-2 rounded-2xl border bg-white px-4 py-3 transition-all focus-within:border-zinc-400 focus-within:shadow-sm"
              style={{ borderColor: "var(--color-border-default)" }}
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-[14px] text-zinc-800 placeholder:text-zinc-400 outline-none leading-relaxed"
                style={{ maxHeight: "120px" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all",
                  inputValue.trim() && !isTyping
                    ? "bg-zinc-900 text-white hover:bg-zinc-700"
                    : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                )}
              >
                <Send size={14} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-300">
              FlowHolt AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
