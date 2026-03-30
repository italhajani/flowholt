import React, { useState } from "react";
import { Search, ChevronRight, Zap, Brain, GitFork, CodeXml, FileText, Plus, PanelLeftClose } from "lucide-react";

interface NodesPanelProps {
  open: boolean;
  onClose: () => void;
}

const categories = [
  { name: "Triggers", icon: Zap, color: "text-studio-success", count: 3 },
  { name: "AI Models", icon: Brain, color: "text-studio-orange", count: 5 },
  { name: "Logic", icon: GitFork, color: "text-studio-warning", count: 3 },
  { name: "Actions", icon: CodeXml, color: "text-primary", count: 4 },
  { name: "Output", icon: FileText, color: "text-studio-success", count: 2 },
];

const NodesPanel: React.FC<NodesPanelProps> = ({ open, onClose }) => {
  const [search, setSearch] = useState("");

  return (
    <div
      className={`bg-studio-sidebar flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-out ${
        open ? "w-52 opacity-100" : "w-0 opacity-0"
      }`}
    >
      <div className="h-9 flex items-center justify-between px-3 shrink-0">
        <span className="text-[11px] font-semibold text-studio-text-primary tracking-wide uppercase">Nodes</span>
        <button className="studio-icon-btn w-5 h-5" onClick={onClose}>
          <PanelLeftClose size={13} />
        </button>
      </div>

      <div className="px-2 pb-2">
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

      <div className="flex-1 overflow-y-auto py-0.5">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-studio-surface-hover transition-all duration-200"
          >
            <ChevronRight size={10} className="text-studio-text-tertiary" />
            <cat.icon size={12} className={cat.color} />
            <span className="text-[11px] font-medium text-studio-text-primary">{cat.name}</span>
            <span className="ml-auto text-[10px] text-studio-text-tertiary">{cat.count}</span>
          </button>
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
