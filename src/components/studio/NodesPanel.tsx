import React, { useMemo, useState } from "react";
import {
  Search,
  PanelLeftClose,
  Zap,
  Brain,
  GitFork,
  CodeXml,
  FileText,
  Webhook,
  Timer,
  Mail,
  MessageSquare,
  Database,
  Globe,
  FileJson,
  ArrowRightLeft,
  Repeat,
} from "lucide-react";

interface NodesPanelProps {
  open: boolean;
  onClose: () => void;
}

const categories = [
  {
    name: "Triggers",
    icon: Zap,
    items: [
      { name: "Webhook", meta: "HTTP endpoint", icon: Webhook },
      { name: "Schedule", meta: "Timed runs", icon: Timer },
      { name: "Manual", meta: "Run on demand", icon: Zap },
    ],
  },
  {
    name: "AI Models",
    icon: Brain,
    items: [
      { name: "GPT-4", meta: "OpenAI", icon: Brain },
      { name: "Claude", meta: "Anthropic", icon: Brain },
      { name: "Gemini", meta: "Google", icon: Brain },
      { name: "Custom LLM", meta: "External endpoint", icon: Brain },
    ],
  },
  {
    name: "Logic",
    icon: GitFork,
    items: [
      { name: "If / Else", meta: "Conditional branch", icon: GitFork },
      { name: "Switch", meta: "Route by value", icon: ArrowRightLeft },
      { name: "Loop", meta: "Iterate items", icon: Repeat },
    ],
  },
  {
    name: "Actions",
    icon: CodeXml,
    items: [
      { name: "HTTP Request", meta: "Call any API", icon: Globe },
      { name: "Send Email", meta: "Deliver notifications", icon: Mail },
      { name: "Slack", meta: "Post updates", icon: MessageSquare },
      { name: "Database", meta: "Query records", icon: Database },
      { name: "Transform", meta: "Map payloads", icon: FileJson },
    ],
  },
  {
    name: "Output",
    icon: FileText,
    items: [
      { name: "Response", meta: "Return data", icon: FileText },
      { name: "Log", meta: "Track runtime output", icon: FileText },
    ],
  },
];

const NodesPanel: React.FC<NodesPanelProps> = ({ open, onClose }) => {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const haystack = `${item.name} ${item.meta}`.toLowerCase();
          return haystack.includes(query);
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [search]);

  return (
    <div
      className={`bg-studio-sidebar flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${
        open ? "w-64 opacity-100" : "w-0 opacity-0"
      }`}
    >
      <div className="h-11 flex items-center justify-between px-4 shrink-0 border-b border-studio-divider/30">
        <span className="text-[12px] font-semibold text-studio-text-primary">Nodes</span>
        <button className="studio-icon-btn w-7 h-7" onClick={onClose}>
          <PanelLeftClose size={14} />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-studio-divider/30">
        <div className="flex items-center gap-2 rounded-lg border border-studio-divider/40 px-3 h-9">
          <Search size={14} className="text-studio-text-tertiary shrink-0" />
          <input
            type="text"
            placeholder="Search nodes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[12px] text-studio-text-primary placeholder:text-studio-text-tertiary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filteredCategories.map((category) => (
          <section key={category.name} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 px-2 py-2">
              <category.icon size={14} className="text-studio-text-secondary" />
              <span className="text-[11px] font-medium text-studio-text-secondary">{category.name}</span>
            </div>

            <div>
              {category.items.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-studio-surface-hover transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-studio-bg flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-studio-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-studio-text-primary truncate">{item.name}</div>
                    <div className="text-[11px] text-studio-text-tertiary truncate">{item.meta}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default NodesPanel;
