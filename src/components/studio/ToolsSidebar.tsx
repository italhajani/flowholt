import React from "react";
import { MousePointer2, Hand, StickyNote, Plus, MessageSquareText, Group, Link, Lock, Eraser, Type } from "lucide-react";
import Tooltip from "./Tooltip";

interface ToolsSidebarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
}

const tools = [
  { id: "select", icon: MousePointer2, label: "Select (V)" },
  { id: "pan", icon: Hand, label: "Pan (Space+Drag)" },
  { id: "add", icon: Plus, label: "Add Node (A)" },
  { id: "connect", icon: Link, label: "Connect (C)" },
  { id: "note", icon: StickyNote, label: "Sticky Note (N)" },
  { id: "comment", icon: MessageSquareText, label: "Comment (M)" },
  { id: "text", icon: Type, label: "Text Label (T)" },
  { id: "group", icon: Group, label: "Group / Frame (G)" },
  { id: "eraser", icon: Eraser, label: "Delete (Del)" },
  { id: "lock", icon: Lock, label: "Lock Canvas (L)" },
];

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="w-9 bg-studio-sidebar flex flex-col items-center py-2 gap-0.5 shrink-0">
      {tools.map((tool, i) => (
        <React.Fragment key={tool.id}>
          {(i === 4 || i === 8) && <div className="w-4 h-px bg-studio-divider/40 my-0.5" />}
          <Tooltip content={tool.label} position="right">
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
        </React.Fragment>
      ))}
    </div>
  );
};

export default ToolsSidebar;
