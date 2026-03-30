import React, { useState } from "react";
import {
  Search, ChevronRight, ChevronDown, Zap, Brain, GitFork, CodeXml, FileText,
  Plus, PanelLeftClose, Star, Clock, Webhook, Mail, MessageSquare,
  Database, Filter, Repeat, Timer, Globe, FileJson, ArrowRightLeft,
} from "lucide-react";

interface NodesPanelProps {
  open: boolean;
  onClose: () => void;
}

const categories = [
  {
    name: "Triggers", icon: Zap, color: "text-studio-success", count: 4,
    nodes: [
      { name: "Webhook", icon: Webhook, desc: "HTTP endpoint" },
      { name: "Schedule", icon: Timer, desc: "Cron / interval" },
      { name: "App Event", icon: Zap, desc: "3rd party trigger" },
      { name: "Manual", icon: Zap, desc: "Run on demand" },
    ],
  },
  {
    name: "AI Models", icon: Brain, color: "text-studio-orange", count: 5,
    nodes: [
      { name: "GPT-4", icon: Brain, desc: "OpenAI" },
      { name: "Claude", icon: Brain, desc: "Anthropic" },
      { name: "Gemini", icon: Brain, desc: "Google" },
      { name: "Llama", icon: Brain, desc: "Meta" },
      { name: "Custom LLM", icon: Brain, desc: "Any endpoint" },
    ],
  },
  {
    name: "Logic", icon: GitFork, color: "text-studio-warning", count: 5,
    nodes: [
      { name: "If/Else", icon: GitFork, desc: "Conditional" },
      { name: "Switch", icon: ArrowRightLeft, desc: "Multi-branch" },
      { name: "Loop", icon: Repeat, desc: "Iterate items" },
      { name: "Filter", icon: Filter, desc: "Filter data" },
      { name: "Merge", icon: GitFork, desc: "Combine branches" },
    ],
  },
  {
    name: "Actions", icon: CodeXml, color: "text-primary", count: 5,
    nodes: [
      { name: "HTTP Request", icon: Globe, desc: "API call" },
      { name: "Send Email", icon: Mail, desc: "SMTP / API" },
      { name: "Slack", icon: MessageSquare, desc: "Post message" },
      { name: "Database", icon: Database, desc: "SQL query" },
      { name: "Transform", icon: FileJson, desc: "Map data" },
    ],
  },
  {
    name: "Output", icon: FileText, color: "text-studio-success", count: 3,
    nodes: [
      { name: "Response", icon: FileText, desc: "Return data" },
      { name: "Webhook Out", icon: Webhook, desc: "Send webhook" },
      { name: "Log", icon: FileText, desc: "Console output" },
    ],
  },
];

const recentNodes = [
  { name: "GPT-4", icon: Brain },
  { name: "Webhook", icon: Webhook },
  { name: "If/Else", icon: GitFork },
];

const NodesPanel: React.FC<NodesPanelProps> = ({ open, onClose }) => {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["GPT-4", "Webhook"]));

  const toggleFavorite = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <div
      className={`bg-studio-sidebar flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-out ${
        open ? "w-56 opacity-100" : "w-0 opacity-0"
      }`}
    >
      <div className="h-9 flex items-center justify-between px-3 shrink-0">
        <span className="text-[11px] font-semibold text-studio-text-primary tracking-wide uppercase">Nodes</span>
        <button className="studio-icon-btn w-5 h-5" onClick={onClose}>
          <PanelLeftClose size={13} />
        </button>
      </div>

      <div className="px-2 pb-1.5">
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-studio-text-tertiary" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-7 pl-7 pr-3 text-[11px] rounded-lg bg-studio-bg border-none outline-none text-studio-text-primary placeholder:text-studio-text-tertiary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Recently used */}
        <div className="px-3 py-1">
          <span className="text-[9px] font-medium text-studio-text-tertiary uppercase tracking-wider flex items-center gap-1">
            <Clock size={8} /> Recent
          </span>
          <div className="mt-1 space-y-0.5">
            {recentNodes.map((n) => (
              <button key={n.name} className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-studio-surface-hover transition-all duration-200 text-left">
                <n.icon size={11} className="text-studio-text-secondary" />
                <span className="text-[10px] text-studio-text-primary">{n.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Favorites */}
        {favorites.size > 0 && (
          <div className="px-3 py-1">
            <span className="text-[9px] font-medium text-studio-text-tertiary uppercase tracking-wider flex items-center gap-1">
              <Star size={8} /> Favorites
            </span>
            <div className="mt-1 space-y-0.5">
              {Array.from(favorites).map((name) => (
                <button key={name} className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-studio-surface-hover transition-all duration-200 text-left">
                  <Star size={9} className="text-studio-warning fill-studio-warning" />
                  <span className="text-[10px] text-studio-text-primary">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="w-full h-px bg-studio-divider/30 my-1" />

        {/* Categories */}
        {categories.map((cat) => (
          <div key={cat.name}>
            <button
              onClick={() => setExpandedCat(expandedCat === cat.name ? null : cat.name)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-studio-surface-hover transition-all duration-200"
            >
              {expandedCat === cat.name ? (
                <ChevronDown size={10} className="text-studio-text-tertiary" />
              ) : (
                <ChevronRight size={10} className="text-studio-text-tertiary" />
              )}
              <cat.icon size={12} className={cat.color} />
              <span className="text-[11px] font-medium text-studio-text-primary">{cat.name}</span>
              <span className="ml-auto text-[9px] text-studio-text-tertiary">{cat.count}</span>
            </button>
            {expandedCat === cat.name && (
              <div className="pl-7 pr-2 pb-1 space-y-0.5 animate-fade-in">
                {cat.nodes.map((n) => (
                  <button
                    key={n.name}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-studio-surface-hover transition-all duration-200 text-left group"
                  >
                    <n.icon size={11} className="text-studio-text-secondary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-studio-text-primary">{n.name}</div>
                      <div className="text-[8px] text-studio-text-tertiary">{n.desc}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(n.name); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Star size={9} className={favorites.has(n.name) ? "text-studio-warning fill-studio-warning" : "text-studio-text-tertiary"} />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2">
        <button className="w-full flex items-center justify-center gap-1 h-7 rounded-lg border border-dashed border-studio-divider text-[10px] text-studio-text-secondary hover:border-primary/40 hover:text-primary transition-all duration-200">
          <Plus size={11} />
          Custom Node
        </button>
      </div>
    </div>
  );
};

export default NodesPanel;
