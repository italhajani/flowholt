import React from "react";
import {
  ChevronLeft,
  Undo2,
  Redo2,
  Moon,
  CircleHelp,
  Settings,
  Share2,
  Save,
  Play,
  Zap,
  CircleCheck,
} from "lucide-react";
import Tooltip from "./Tooltip";

interface TopBarProps {
  activeTab: "editor" | "executions";
  onTabChange: (tab: "editor" | "executions") => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="h-11 flex items-center justify-between bg-studio-surface px-3 shrink-0 z-50 border-b border-studio-divider/60">
      <div className="flex items-center gap-1.5">
        <Tooltip content="Back to projects">
          <button className="studio-icon-btn w-7 h-7">
            <ChevronLeft size={16} />
          </button>
        </Tooltip>

        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={12} className="text-primary-foreground" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-studio-text-primary">
              Support Ticket Classifier
            </span>
            <span className="text-[10px] text-studio-text-tertiary ml-2 inline-flex items-center gap-1">
              <CircleCheck size={9} className="text-studio-success" />
              Saved
            </span>
          </div>
        </div>

        <div className="w-px h-4 bg-studio-divider/60 mx-1" />

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
        <button
          onClick={() => onTabChange("editor")}
          className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
            activeTab === "editor"
              ? "bg-studio-surface text-studio-text-primary shadow-sm"
              : "text-studio-text-secondary hover:text-studio-text-primary"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => onTabChange("executions")}
          className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
            activeTab === "executions"
              ? "bg-studio-surface text-studio-text-primary shadow-sm"
              : "text-studio-text-secondary hover:text-studio-text-primary"
          }`}
        >
          Executions
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        <Tooltip content="Toggle theme">
          <button className="studio-icon-btn w-6 h-6"><Moon size={13} /></button>
        </Tooltip>
        <Tooltip content="Help">
          <button className="studio-icon-btn w-6 h-6"><CircleHelp size={13} /></button>
        </Tooltip>
        <Tooltip content="Settings">
          <button className="studio-icon-btn w-6 h-6"><Settings size={13} /></button>
        </Tooltip>
        <Tooltip content="Share">
          <button className="studio-icon-btn w-6 h-6"><Share2 size={13} /></button>
        </Tooltip>
        <div className="w-px h-4 bg-studio-divider/60 mx-1" />
        <Tooltip content="Save workflow">
          <button className="studio-icon-btn w-6 h-6"><Save size={13} /></button>
        </Tooltip>
        <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ml-1 bg-primary text-primary-foreground hover:brightness-110 shadow-sm">
          <Play size={10} fill="currentColor" />
          Run
        </button>
      </div>
    </header>
  );
};

export default TopBar;
