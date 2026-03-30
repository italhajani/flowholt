import React from "react";
import { MousePointer2, Blocks, StickyNote, MessageSquareText } from "lucide-react";
import Tooltip from "./Tooltip";

interface ToolsSidebarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  nodesOpen: boolean;
  onToggleNodes: () => void;
}

const tools = [
  { id: "select", icon: MousePointer2, label: "Select (V)" },
  { id: "note", icon: StickyNote, label: "Sticky Note (N)" },
  { id: "comment", icon: MessageSquareText, label: "Comment (M)" },
];

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ activeTool, onToolChange, nodesOpen, onToggleNodes }) => {
  return (
    <div className="w-9 bg-studio-sidebar flex flex-col items-center justify-center gap-0.5 shrink-0">
      {/* Nodes toggle */}
      <Tooltip content="Nodes Library" position="right">
        <button
          onClick={onToggleNodes}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
            nodesOpen
              ? "bg-primary/10 text-primary"
              : "text-studio-text-secondary hover:text-studio-text-primary hover:bg-studio-surface-hover"
          }`}
        >
          <Blocks size={13} />
        </button>
      </Tooltip>

      <div className="w-4 h-px bg-studio-divider/30 my-1" />

      {tools.map((tool) => (
        <Tooltip key={tool.id} content={tool.label} position="right">
          <button
            onClick={() => onToolChange(tool.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
              activeTool === tool.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-studio-text-secondary hover:text-studio-text-primary hover:bg-studio-surface-hover"
            }`}
          >
            <tool.icon size={13} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default ToolsSidebar;
