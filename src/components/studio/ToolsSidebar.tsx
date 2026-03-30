import React from "react";
import { MousePointer2, Hand, StickyNote, Plus } from "lucide-react";
import Tooltip from "./Tooltip";

interface ToolsSidebarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
}

const tools = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "pan", icon: Hand, label: "Pan" },
  { id: "note", icon: StickyNote, label: "Note" },
  { id: "add", icon: Plus, label: "Add Node" },
];

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="w-9 bg-studio-sidebar flex flex-col items-center py-2.5 gap-1 shrink-0">
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
            <tool.icon size={14} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default ToolsSidebar;
