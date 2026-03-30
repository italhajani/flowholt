import React from "react";
import { Zap, Brain, GitFork, CodeXml, FileText, PanelLeftOpen } from "lucide-react";
import Tooltip from "./Tooltip";

interface IconSidebarProps {
  onToggleNodes: () => void;
  nodesOpen: boolean;
}

const items = [
  { icon: Zap, label: "Triggers", color: "text-studio-success" },
  { icon: Brain, label: "AI Models", color: "text-studio-orange" },
  { icon: GitFork, label: "Logic", color: "text-studio-warning" },
  { icon: CodeXml, label: "Actions", color: "text-primary" },
  { icon: FileText, label: "Output", color: "text-studio-success" },
];

const IconSidebar: React.FC<IconSidebarProps> = ({ onToggleNodes, nodesOpen }) => {
  return (
    <div className="w-10 bg-studio-sidebar flex flex-col items-center py-2 gap-0.5 shrink-0">
      <Tooltip content={nodesOpen ? "Collapse panel" : "Expand panel"} position="right">
        <button className="studio-icon-btn w-7 h-7 mb-1" onClick={onToggleNodes}>
          <PanelLeftOpen size={14} className={`transition-transform duration-200 ${nodesOpen ? "rotate-180" : ""}`} />
        </button>
      </Tooltip>

      {items.map((item) => (
        <Tooltip key={item.label} content={item.label} position="right">
          <button className={`studio-icon-btn w-7 h-7 ${item.color}`}>
            <item.icon size={14} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default IconSidebar;
