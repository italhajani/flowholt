import React, { useState } from "react";
import { Sparkles, Send, X, User, Lightbulb, Wand2, Code2, Workflow } from "lucide-react";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

const messages = [
  {
    role: "user" as const,
    content: "Workflow to automatically reply to customer messages",
  },
  {
    role: "assistant" as const,
    content: `Great idea! Here's a workflow plan for omnichannel automation:

1. **Trigger** — Webhook (message received)
2. **Transform** — Clean + unify fields
3. **Classify** — GPT-4 (needs human or not)
4. **Path A** — Auto-reply via webhook
5. **Path B** — Notify team via Gmail

Your flow is ready! Want me to adjust anything?`,
  },
];

const suggestions = [
  { icon: Lightbulb, label: "Optimize this workflow" },
  { icon: Wand2, label: "Add error handling" },
  { icon: Code2, label: "Generate test data" },
  { icon: Workflow, label: "Add a new branch" },
];

const ChatPanel: React.FC<ChatPanelProps> = ({ open, onClose }) => {
  const [input, setInput] = useState("");

  if (!open) return null;

  return (
    <div className="absolute top-0 bottom-0 left-0 w-80 z-40 bg-studio-surface flex flex-col animate-slide-in-left border-r border-studio-divider/30">
      <div className="h-9 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles size={11} className="text-primary" />
          </div>
          <span className="text-[11px] font-semibold text-studio-text-primary">AI Assistant</span>
          <span className="px-1 py-0.5 rounded text-[8px] font-medium bg-studio-teal/10 text-studio-teal">Beta</span>
        </div>
        <button onClick={onClose} className="studio-icon-btn w-5 h-5">
          <X size={12} />
        </button>
      </div>

      {/* Context bar */}
      <div className="px-3 py-1.5 bg-studio-bg/50">
        <div className="flex items-center gap-1.5 text-[9px] text-studio-text-tertiary">
          <Workflow size={9} />
          <span>Context: Support Ticket Classifier · 5 nodes</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === "user" ? "bg-primary/10" : "bg-studio-teal/10"
            }`}>
              {msg.role === "user" ? (
                <User size={10} className="text-primary" />
              ) : (
                <Sparkles size={10} className="text-studio-teal" />
              )}
            </div>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-studio-bg text-studio-text-primary rounded-bl-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion chips */}
      <div className="px-3 py-1.5 shrink-0">
        <div className="flex flex-wrap gap-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-studio-bg text-[9px] text-studio-text-secondary hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              <s.icon size={9} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 shrink-0">
        <div className="flex items-center gap-2 bg-studio-bg rounded-xl px-3 py-1.5">
          <input
            type="text"
            placeholder="Ask anything about your workflow..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-[11px] outline-none text-studio-text-primary placeholder:text-studio-text-tertiary"
          />
          <button className="studio-icon-btn w-6 h-6 text-primary hover:text-primary">
            <Send size={12} />
          </button>
        </div>
        <div className="text-center mt-1">
          <span className="text-[8px] text-studio-text-tertiary">AI may produce inaccurate results</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
