import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Undo2, Redo2, Save, Play, Square, Sparkles } from "lucide-react";
import Tooltip from "./Tooltip";

interface TopBarProps {
  activeTab: "editor" | "executions";
  onTabChange: (tab: "editor" | "executions") => void;
  onOpenChat: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange, onOpenChat }) => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);

  return (
    <header className="h-11 flex items-center justify-between bg-studio-surface px-4 shrink-0 z-50 border-b border-studio-divider/40">
      <div className="flex items-center gap-2">
        <Tooltip content="Back to dashboard">
          <button className="studio-icon-btn w-7 h-7" onClick={() => navigate("/dashboard/workflows")}>
            <ChevronLeft size={15} />
          </button>
        </Tooltip>

        <div className="ml-1">
          <div className="text-[12px] font-semibold text-studio-text-primary">Support Ticket Classifier</div>
        </div>

        <div className="w-px h-4 bg-studio-divider/40 mx-1" />

        <Tooltip content="Undo">
          <button className="studio-icon-btn w-6 h-6">
            <Undo2 size={13} />
          </button>
        </Tooltip>
        <Tooltip content="Redo">
          <button className="studio-icon-btn w-6 h-6">
            <Redo2 size={13} />
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center bg-studio-bg rounded-lg p-0.5">
        {(["editor", "executions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
              activeTab === tab
                ? "bg-studio-surface text-studio-text-primary"
                : "text-studio-text-secondary hover:text-studio-text-primary"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenChat}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-studio-divider/40 text-[11px] font-medium text-studio-text-secondary hover:text-studio-text-primary hover:bg-studio-surface-hover transition-colors"
        >
          <Sparkles size={12} />
          AI
        </button>

        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-studio-divider/40 text-[11px] font-medium text-studio-text-secondary hover:text-studio-text-primary hover:bg-studio-surface-hover transition-colors">
          <Save size={12} />
          Save
        </button>

        {isRunning ? (
          <button
            onClick={() => setIsRunning(false)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Square size={9} fill="currentColor" />
            Stop
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:brightness-110 transition-colors"
          >
            <Play size={9} fill="currentColor" />
            Run
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
