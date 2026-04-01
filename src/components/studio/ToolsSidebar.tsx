import React from "react";
import { MousePointer2, Blocks } from "lucide-react";
import Tooltip from "./Tooltip";

interface ToolsSidebarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  nodesOpen: boolean;
  onToggleNodes: () => void;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ activeTool, onToolChange, nodesOpen, onToggleNodes }) => {
  return (
    <div className="w-10 bg-studio-sidebar flex flex-col items-center pt-3 gap-1 shrink-0">
      <Tooltip content="Nodes" position="right">
        <button
          onClick={onToggleNodes}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            nodesOpen
              ? "bg-primary/10 text-primary"
              : "text-studio-text-secondary hover:text-studio-text-primary hover:bg-studio-surface-hover"
          }`}
        >
          <Blocks size={14} />
        </button>
      </Tooltip>

      <Tooltip content="Select" position="right">
        <button
          onClick={() => onToolChange("select")}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            activeTool === "select"
              ? "bg-primary text-primary-foreground"
              : "text-studio-text-secondary hover:text-studio-text-primary hover:bg-studio-surface-hover"
          }`}
        >
          <MousePointer2 size={14} />
        </button>
      </Tooltip>
    </div>
  );
};

export default ToolsSidebar;
