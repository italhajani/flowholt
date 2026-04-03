import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Blocks,
  BookOpen,
  Bot,
  Braces,
  ChevronRight,
  Database,
  FlaskConical,
  FolderGit2,
  GitBranch,
  Globe,
  HelpCircle,
  Library,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Timer,
  Wand2,
  Webhook,
  Wrench,
  Zap,
} from "lucide-react";
import Tooltip from "./Tooltip";

interface NodesPanelProps {
  open: boolean;
  onToggle: () => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
}

const categories = [
  {
    name: "Triggers",
    icon: Zap,
    items: [
      { name: "Webhook", meta: "HTTP endpoint", icon: Webhook },
      { name: "Schedule", meta: "Timed runs", icon: Timer },
      { name: "Manual trigger", meta: "Run on demand", icon: Zap },
    ],
  },
  {
    name: "Action",
    icon: Blocks,
    items: [
      { name: "HTTP Request", meta: "Call any API", icon: Globe },
      { name: "Email", meta: "Send workflow emails", icon: Mail },
      { name: "Slack", meta: "Post channel alerts", icon: MessageSquare },
    ],
  },
  {
    name: "Notification",
    icon: MessageSquare,
    items: [
      { name: "Slack alert", meta: "Send alerts or notifications", icon: MessageSquare },
      { name: "Email notice", meta: "Route workflow updates", icon: Mail },
    ],
  },
  {
    name: "Conditional",
    icon: GitBranch,
    items: [
      { name: "Router", meta: "Branch the workflow", icon: GitBranch },
      { name: "Decision", meta: "Evaluate conditions", icon: GitBranch },
    ],
  },
  {
    name: "Delay",
    icon: Timer,
    items: [
      { name: "Wait", meta: "Pause the workflow", icon: Timer },
      { name: "Schedule hold", meta: "Delay until a target time", icon: Timer },
    ],
  },
  {
    name: "User Task",
    icon: BookOpen,
    items: [
      { name: "Approval", meta: "Assign task to a teammate", icon: BookOpen },
      { name: "Review", meta: "Collect structured feedback", icon: BookOpen },
    ],
  },
  {
    name: "AI Insight",
    icon: Bot,
    items: [
      { name: "Anthropic", meta: "Custom LLM step", icon: Bot },
      { name: "GPT-4.1", meta: "Reasoning and generation", icon: Bot },
      { name: "Custom node", meta: "Build a studio-specific step", icon: Wand2 },
    ],
  },
];

const studioTools = [
  { id: "nodes", label: "Nodes", icon: Blocks },
  { id: "connections", label: "Connections", icon: Database },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "tests", label: "Tests", icon: FlaskConical },
  { id: "versions", label: "Versions", icon: FolderGit2 },
  { id: "code", label: "Code", icon: Braces },
  { id: "settings", label: "Studio settings", icon: Settings2 },
  { id: "help", label: "Help", icon: HelpCircle },
];

const quickActions = [
  { id: "add", label: "Add node", icon: Plus },
  { id: "branch", label: "Branch", icon: GitBranch },
  { id: "assist", label: "AI assist", icon: Sparkles },
  { id: "custom", label: "Custom node", icon: Bot },
];

const NodesPanel: React.FC<NodesPanelProps> = ({ open, onToggle, activeTool, onToolChange }) => {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => `${item.name} ${item.meta}`.toLowerCase().includes(query)),
      }))
      .filter((category) => category.items.length > 0);
  }, [search]);
  const selectedCategory = filteredCategories.find((category) => category.name === activeCategory) ?? null;

  return (
    <div className="h-full flex shrink-0 relative">
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`h-full bg-white border-r border-slate-200 transition-[width] duration-200 ease-out ${
          hovered ? "w-[168px]" : "w-[68px]"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 py-4 space-y-1">
            {studioTools.map((tool) => (
              <Tooltip key={tool.id} content={!hovered ? tool.label : ""} position="right">
                <button
                  onClick={() => {
                    onToolChange(tool.id);
                    if (tool.id === "nodes" && !open) onToggle();
                    if (tool.id !== "nodes" && open) onToggle();
                  }}
                  className={cn(
                    "mx-3 w-[calc(100%-24px)] h-10 rounded-xl flex items-center px-3 transition-colors",
                    activeTool === tool.id
                      ? "bg-[#eef2ff] text-[#4f46e5]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <tool.icon size={16} className="shrink-0" />
                  {hovered && <span className="ml-3 text-[12px] font-medium truncate">{tool.label}</span>}
                </button>
              </Tooltip>
            ))}
          </div>

          <div className="px-3 py-4">
            <div className="w-[calc(100%-0px)] h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 text-[12px]">
              {hovered ? "Studio settings" : <Wrench size={15} />}
            </div>
          </div>
        </div>
      </aside>

      {open && activeTool === "nodes" && (
        <div className="w-[272px] h-full bg-white border-r border-slate-200 overflow-hidden">
          <div className="h-full flex flex-col overflow-hidden">
            <div className="h-16 px-4 border-b border-slate-200 flex items-center">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 h-10 w-full">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[12px] text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div
                className="h-full flex transition-transform duration-300"
                style={{ width: "544px", transform: `translateX(${selectedCategory ? "-272px" : "0px"})`, transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <div className="w-[272px] h-full overflow-y-auto px-3 py-4">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setActiveCategory(category.name)}
                      className="w-full mb-3 rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-left hover:border-slate-300 hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] border border-slate-200 bg-slate-50 flex items-center justify-center text-[#5670ff] shrink-0">
                          <category.icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold text-slate-900">{category.name}</div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {category.items[0]?.meta || "Browse nodes"}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="w-[272px] h-full overflow-y-auto px-3 py-4">
                  <div className="flex items-center gap-2 px-1 mb-3">
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <div className="text-[13px] font-semibold text-slate-900">
                      {selectedCategory?.name || "Nodes library"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedCategory?.items.map((item) => (
                      <button
                        key={item.name}
                        className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-left hover:border-slate-300 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[11px] border border-slate-200 bg-slate-50 flex items-center justify-center text-[#5670ff] shrink-0">
                            <item.icon size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold text-slate-900 truncate">{item.name}</div>
                            <div className="text-[10px] text-slate-500 mt-1 truncate">{item.meta}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-20 flex flex-col gap-2">
        {quickActions.map((action, index) => (
          <Tooltip key={action.id} content={action.label} position="right">
            <button
              onClick={() => {
                onToolChange("nodes");
                if (!open) onToggle();
              }}
              className={cn(
                "w-10 h-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors",
                index === 0 && "text-[#4f46e5]",
              )}
            >
              <action.icon size={16} />
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default NodesPanel;
