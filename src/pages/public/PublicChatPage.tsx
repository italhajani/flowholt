import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Send, Bot, User, Sparkles, Paperclip, ThumbsUp, ThumbsDown, Copy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

/* ── Mock agent config ── */
const agentConfig = {
  name: "FlowHolt Support Agent",
  description: "I can help you with workflow automation, troubleshooting, and product questions.",
  avatar: "🤖",
  model: "GPT-4o",
  welcomeMessage: "Hi! I'm the FlowHolt Support Agent. I can help you with workflow automation, troubleshooting, and product questions. How can I assist you today?",
  suggestedPrompts: [
    "How do I create my first workflow?",
    "What integrations are available?",
    "Help me debug a failing execution",
    "How do webhooks work?",
  ],
};

const mockResponses: Record<string, string> = {
  "How do I create my first workflow?":
    "Great question! Here's how to get started:\n\n**1. Navigate to Workflows**\nClick \"Workflows\" in the sidebar, then hit the \"+ New Workflow\" button.\n\n**2. Add a Trigger**\nEvery workflow starts with a trigger — this determines when it runs. Common triggers include:\n- **Webhook** — runs when a URL is called\n- **Schedule** — runs on a cron schedule\n- **App event** — runs when something happens in a connected app\n\n**3. Add Action Nodes**\nDrag nodes from the node palette to add steps. Connect them by dragging from one node's output to another's input.\n\n**4. Test & Activate**\nUse the \"Test\" button to run with sample data, then toggle the workflow active.\n\nWould you like me to walk you through a specific type of workflow?",
  default:
    "Thanks for your question! Let me help you with that.\n\nI can assist with:\n- **Workflow creation** and design patterns\n- **Troubleshooting** failed executions\n- **Integration setup** for 500+ supported apps\n- **Best practices** for automation\n\nCould you provide more details about what you're trying to accomplish?",
};

/* ── Component ── */
export function PublicChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: agentConfig.welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = mockResponses[content] || mockResponses.default;
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-reply`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex h-screen w-full flex-col" style={{ background: "#fafafa" }}>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-[16px]">
            {agentConfig.avatar}
          </div>
          <div>
            <h1 className="text-[14px] font-semibold text-zinc-900">{agentConfig.name}</h1>
            <p className="text-[11px] text-zinc-400">
              Powered by {agentConfig.model} · Agent {id || "default"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Online
          </span>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-[720px] space-y-1">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isTyping && (
            <div className="flex gap-3 py-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900">
                <Bot size={14} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-zinc-100 bg-white px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              {agentConfig.suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-[13px] text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-[720px]">
          <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 shadow-sm focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
            <button className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
              <Paperclip size={16} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              rows={1}
              className="flex-1 resize-none bg-transparent py-1.5 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
              style={{ minHeight: "24px", maxHeight: "120px" }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={cn(
                "mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all",
                input.trim() && !isTyping
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-300"
              )}
            >
              <Send size={15} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-zinc-400">
            Powered by <span className="font-medium text-zinc-500">FlowHolt</span> · AI responses may not be fully accurate
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Message Bubble ── */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 py-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 mt-0.5">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div className={cn("max-w-[580px] min-w-0", isUser && "order-first")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed",
            isUser
              ? "bg-zinc-900 text-white rounded-br-md"
              : "bg-white text-zinc-700 border border-zinc-100 rounded-bl-md shadow-xs"
          )}
        >
          <div className="whitespace-pre-wrap [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_code]:font-mono [&_strong]:font-semibold [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5">
            {message.content}
          </div>
        </div>
        {!isUser && (
          <div className="mt-1.5 flex items-center gap-1 pl-1">
            <ActionBtn icon={Copy} tooltip="Copy" />
            <ActionBtn icon={ThumbsUp} tooltip="Helpful" />
            <ActionBtn icon={ThumbsDown} tooltip="Not helpful" />
            <ActionBtn icon={RotateCcw} tooltip="Regenerate" />
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

function ActionBtn({ icon: Icon, tooltip }: { icon: typeof Copy; tooltip: string }) {
  return (
    <button
      title={tooltip}
      className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
    >
      <Icon size={12} />
    </button>
  );
}
