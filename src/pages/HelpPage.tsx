import { useState } from "react";
import { BookOpen, Terminal, FileText, MessageCircle, ExternalLink, Search, Sparkles, Video, Lightbulb, ChevronRight, ArrowRight, Send, HelpCircle, Zap, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shell/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const helpCards = [
  { icon: BookOpen, title: "Documentation", description: "Browse guides, tutorials, and API references.", link: "#", color: "bg-blue-50 text-blue-500" },
  { icon: Terminal, title: "API Playground", description: "Test and explore the FlowHolt REST API interactively.", link: "/help/api", color: "bg-emerald-50 text-emerald-500" },
  { icon: FileText, title: "Changelog", description: "See what's new — releases, fixes, and improvements.", link: "#", color: "bg-violet-50 text-violet-500" },
  { icon: MessageCircle, title: "Contact Support", description: "Get help from the FlowHolt team via chat or email.", link: "#", color: "bg-amber-50 text-amber-500" },
];

const walkthroughs = [
  { title: "Build Your First Workflow", description: "Create a simple 3-node automation in under 5 minutes", duration: "5 min", difficulty: "Beginner", icon: Zap },
  { title: "Connect an AI Agent", description: "Set up an LLM-powered agent with tools and knowledge", duration: "8 min", difficulty: "Intermediate", icon: Sparkles },
  { title: "Set Up Webhooks", description: "Receive and process external events in real-time", duration: "4 min", difficulty: "Beginner", icon: GraduationCap },
  { title: "Deploy to Production", description: "Promote workflows through staging to production", duration: "6 min", difficulty: "Intermediate", icon: ArrowRight },
];

const popularArticles = [
  { title: "Understanding Node Types", category: "Concepts", views: "2.4K" },
  { title: "Expression Syntax Reference", category: "Reference", views: "1.8K" },
  { title: "Error Handling Best Practices", category: "Guide", views: "1.5K" },
  { title: "Webhook Security & Signing", category: "Security", views: "1.2K" },
  { title: "MCP Server Configuration", category: "Advanced", views: "980" },
  { title: "Rate Limiting & Throttling", category: "Operations", views: "870" },
];

export function HelpPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMsg, setChatMsg] = useState("");

  return (
    <div className="mx-auto max-w-[1020px] px-8 py-8">
      <PageHeader
        title="Help"
        description="Documentation, guided walkthroughs, and support."
      />

      {/* Search bar */}
      <div className="mt-6 relative">
        <Input
          prefix={<Search size={15} className="text-zinc-400" />}
          placeholder="Search documentation, guides, and FAQs…"
          className="h-11 text-[14px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick help cards */}
      <div className="mt-5 grid grid-cols-4 gap-3">
        {helpCards.map((card) => (
          <button
            key={card.title}
            onClick={() => card.link.startsWith("/") ? navigate(card.link) : undefined}
            className="group flex flex-col items-center gap-2.5 rounded-lg border border-zinc-100 bg-white px-4 py-5 shadow-xs transition-all duration-150 hover:shadow-sm hover:border-zinc-200 cursor-pointer text-center"
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.color)}>
              <card.icon size={18} />
            </div>
            <div>
              <h3 className="text-[13px] font-medium text-zinc-800">{card.title}</h3>
              <p className="mt-0.5 text-[11px] text-zinc-400 leading-relaxed">{card.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-[1fr_340px] gap-6">
        {/* Left column: walkthroughs + articles */}
        <div className="space-y-6">
          {/* Guided walkthroughs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Video size={14} className="text-zinc-400" />
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">Guided Walkthroughs</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {walkthroughs.map((w) => (
                <button key={w.title} className="group flex items-start gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3.5 shadow-xs hover:shadow-sm hover:border-zinc-200 transition-all text-left">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 flex-shrink-0 mt-0.5">
                    <w.icon size={14} className="text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[12px] font-medium text-zinc-800 group-hover:text-zinc-900">{w.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{w.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-zinc-300">
                      <span>{w.duration}</span>
                      <span>•</span>
                      <span className={w.difficulty === "Beginner" ? "text-green-400" : "text-blue-400"}>{w.difficulty}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Popular articles */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-zinc-400" />
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">Popular Articles</h3>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-white shadow-xs divide-y divide-zinc-50 overflow-hidden">
              {popularArticles.map((a) => (
                <button key={a.title} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-zinc-50/50 transition-colors">
                  <BookOpen size={12} className="text-zinc-300 flex-shrink-0" />
                  <span className="text-[12px] font-medium text-zinc-700 flex-1">{a.title}</span>
                  <span className="text-[10px] text-zinc-300 bg-zinc-50 px-1.5 py-0.5 rounded">{a.category}</span>
                  <span className="text-[10px] text-zinc-300">{a.views} views</span>
                  <ChevronRight size={11} className="text-zinc-200" />
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs divide-y divide-zinc-50">
              <ShortcutRow label="Command palette" keys={["⌘", "K"]} />
              <ShortcutRow label="New workflow" keys={["⌘", "⇧", "N"]} />
              <ShortcutRow label="Search" keys={["⌘", "/"]} />
              <ShortcutRow label="Toggle sidebar" keys={["⌘", "B"]} />
              <ShortcutRow label="Go to home" keys={["⌘", "⇧", "H"]} />
              <ShortcutRow label="Open AI Copilot" keys={["⌘", "⇧", "C"]} />
              <ShortcutRow label="Run workflow" keys={["⌘", "↵"]} />
            </div>
          </div>
        </div>

        {/* Right column: AI support chat */}
        <div className="rounded-lg border border-zinc-100 bg-white shadow-xs flex flex-col" style={{ height: "fit-content" }}>
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900">
              <Sparkles size={11} className="text-white" />
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-zinc-800">AI Support Assistant</h3>
              <p className="text-[10px] text-zinc-400">Ask anything about FlowHolt</p>
            </div>
          </div>
          <div className="px-4 py-3 space-y-3 min-h-[200px]">
            {/* Sample conversation */}
            <div className="flex gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 flex-shrink-0 mt-0.5">
                <Sparkles size={9} className="text-white" />
              </div>
              <div className="rounded-lg bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600 leading-relaxed">
                Hi! I'm the FlowHolt support assistant. I can help with:
                <ul className="mt-1.5 space-y-0.5 text-zinc-500">
                  <li>• Workflow configuration</li>
                  <li>• Node setup & troubleshooting</li>
                  <li>• API usage & auth</li>
                  <li>• Best practices & patterns</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["How do I connect Slack?", "Retry failed execution", "Webhook security"].map((q) => (
                <button key={q} className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] text-zinc-500 hover:bg-zinc-50 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="px-3 py-2.5 border-t border-zinc-100 flex items-center gap-2">
            <input
              className="flex-1 text-[12px] text-zinc-600 placeholder:text-zinc-300 outline-none bg-transparent"
              placeholder="Ask a question…"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
            />
            <button className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
              <Send size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <span className="text-[13px] text-zinc-600">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="inline-flex h-5 min-w-[20px] items-center justify-center rounded px-1.5 font-mono text-[10px] font-medium text-zinc-500"
            style={{
              background: "var(--color-bg-surface-strong)",
              border: "1px solid var(--color-border-default)",
            }}
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
