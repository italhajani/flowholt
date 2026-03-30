import React, { useState } from "react";
import { Sparkles, Send, X, User } from "lucide-react";

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
    content: `Your idea is brilliant. I'll create a workflow for your omnichannel automation:

1. Trigger: Webhook (message received)
2. Data format (clean + unify fields)
3. Classify with GPT (needs human or not)
4. Path 1: Auto-reply via webhook
5. Path 2: Notify team via Gmail

Your flow is ready! Let me know if anything needs adjustments.`,
  },
];

const ChatPanel: React.FC<ChatPanelProps> = ({ open, onClose }) => {
  const [input, setInput] = useState("");

  if (!open) return null;

  return (
    <div className="absolute top-0 bottom-0 left-0 w-80 z-40 bg-studio-surface flex flex-col animate-slide-in-left shadow-lg border-r border-studio-divider/30">
      <div className="h-9 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-primary" />
          <span className="text-[11px] font-semibold text-studio-text-primary">AI Assistant</span>
        </div>
        <button onClick={onClose} className="studio-icon-btn w-5 h-5">
          <X size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-primary/10" : "bg-studio-teal/10"
            }`}>
              {msg.role === "user" ? (
                <User size={11} className="text-primary" />
              ) : (
                <Sparkles size={11} className="text-studio-teal" />
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

      <div className="p-2 shrink-0">
        <div className="flex items-center gap-2 bg-studio-bg rounded-xl px-3 py-1.5">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-[11px] outline-none text-studio-text-primary placeholder:text-studio-text-tertiary"
          />
          <button className="studio-icon-btn w-6 h-6 text-primary hover:text-primary">
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
