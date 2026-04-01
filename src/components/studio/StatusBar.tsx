import React from "react";
import { CircleCheck } from "lucide-react";

interface StatusBarProps {
  nodeCount: number;
  zoom: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ nodeCount, zoom }) => {
  return (
    <div className="h-7 flex items-center justify-between px-3 bg-studio-surface border-t border-studio-divider/30 shrink-0 text-[10px]">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-studio-success">
          <CircleCheck size={10} />
          Ready
        </span>
        <span className="text-studio-text-tertiary">{nodeCount} nodes</span>
      </div>
      <span className="text-studio-text-tertiary font-mono">{Math.round(zoom * 100)}%</span>
    </div>
  );
};

export default StatusBar;
