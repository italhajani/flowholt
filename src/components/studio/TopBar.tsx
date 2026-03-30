import React, { useState } from "react";
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
  Bell,
  History,
  Bug,
  Keyboard,
  ChevronDown,
  Copy,
  Trash2,
  Download,
  ToggleLeft,
  Square,
  Pause,
} from "lucide-react";
import Tooltip from "./Tooltip";

interface TopBarProps {
  activeTab: "editor" | "executions";
  onTabChange: (tab: "editor" | "executions") => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange }) => {
  const [workflowStatus, setWorkflowStatus] = useState<"draft" | "active" | "inactive">("active");
  const [showVersions, setShowVersions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const statusColors = {
    draft: "bg-studio-warning/12 text-studio-warning",
    active: "bg-studio-success/12 text-studio-success",
    inactive: "bg-studio-text-tertiary/12 text-studio-text-tertiary",
  };

  return (
    <header className="h-11 flex items-center justify-between bg-studio-surface px-3 shrink-0 z-50 border-b border-studio-divider/40">
      {/* Left section */}
      <div className="flex items-center gap-1">
        <Tooltip content="Back to projects">
          <button className="studio-icon-btn w-7 h-7">
            <ChevronLeft size={15} />
          </button>
        </Tooltip>

        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={11} className="text-primary-foreground" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-studio-text-primary">
              Support Ticket Classifier
            </span>
            <button
              onClick={() => setWorkflowStatus(workflowStatus === "active" ? "draft" : "active")}
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium transition-all duration-200 ${statusColors[workflowStatus]}`}
            >
              {workflowStatus.charAt(0).toUpperCase() + workflowStatus.slice(1)}
            </button>
            <span className="text-[9px] text-studio-text-tertiary inline-flex items-center gap-0.5">
              <CircleCheck size={8} className="text-studio-success" />
              Saved
            </span>
          </div>
        </div>

        <div className="w-px h-4 bg-studio-divider/40 mx-1" />

        <Tooltip content="Undo (⌘Z)">
          <button className="studio-icon-btn w-6 h-6">
            <Undo2 size={13} />
          </button>
        </Tooltip>
        <Tooltip content="Redo (⌘⇧Z)">
          <button className="studio-icon-btn w-6 h-6">
            <Redo2 size={13} />
          </button>
        </Tooltip>

        <div className="w-px h-4 bg-studio-divider/40 mx-1" />

        {/* Version history */}
        <div className="relative">
          <Tooltip content="Version history">
            <button
              className="studio-icon-btn w-6 h-6"
              onClick={() => setShowVersions(!showVersions)}
            >
              <History size={13} />
            </button>
          </Tooltip>
          {showVersions && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-studio-surface rounded-xl shadow-lg border border-studio-divider/30 py-1 z-50 animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] font-medium text-studio-text-tertiary uppercase tracking-wider">Recent Versions</div>
              {[
                { time: "2 min ago", label: "Added Slack node", user: "You" },
                { time: "15 min ago", label: "Updated classifier", user: "You" },
                { time: "1 hr ago", label: "Initial version", user: "You" },
              ].map((v, i) => (
                <button key={i} className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-studio-surface-hover transition-all duration-200 text-left">
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-studio-text-primary truncate">{v.label}</div>
                    <div className="text-[9px] text-studio-text-tertiary">{v.time} · {v.user}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center - tabs */}
      <div className="flex items-center bg-studio-bg rounded-lg p-0.5">
        {(["editor", "executions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
              activeTab === tab
                ? "bg-studio-surface text-studio-text-primary shadow-sm"
                : "text-studio-text-secondary hover:text-studio-text-primary"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-0.5">
        <Tooltip content="Debug mode">
          <button className="studio-icon-btn w-6 h-6">
            <Bug size={13} />
          </button>
        </Tooltip>
        <Tooltip content="Keyboard shortcuts">
          <button className="studio-icon-btn w-6 h-6">
            <Keyboard size={13} />
          </button>
        </Tooltip>
        <Tooltip content="Toggle theme">
          <button className="studio-icon-btn w-6 h-6"><Moon size={13} /></button>
        </Tooltip>
        <Tooltip content="Help center">
          <button className="studio-icon-btn w-6 h-6"><CircleHelp size={13} /></button>
        </Tooltip>

        {/* Notifications */}
        <div className="relative">
          <Tooltip content="Notifications">
            <button className="studio-icon-btn w-6 h-6 relative" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={13} />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-destructive" />
            </button>
          </Tooltip>
          {showNotifications && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-studio-surface rounded-xl shadow-lg border border-studio-divider/30 py-1 z-50 animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] font-medium text-studio-text-tertiary uppercase tracking-wider">Notifications</div>
              <div className="px-3 py-2 text-[11px] text-studio-text-secondary">Workflow executed successfully · 3 min ago</div>
              <div className="px-3 py-2 text-[11px] text-studio-text-secondary">2 errors in last execution · 1 hr ago</div>
            </div>
          )}
        </div>

        <Tooltip content="Workflow settings">
          <button className="studio-icon-btn w-6 h-6"><Settings size={13} /></button>
        </Tooltip>
        <Tooltip content="Share workflow">
          <button className="studio-icon-btn w-6 h-6"><Share2 size={13} /></button>
        </Tooltip>

        <div className="w-px h-4 bg-studio-divider/40 mx-1" />

        <Tooltip content="Duplicate workflow">
          <button className="studio-icon-btn w-6 h-6"><Copy size={13} /></button>
        </Tooltip>
        <Tooltip content="Export workflow">
          <button className="studio-icon-btn w-6 h-6"><Download size={13} /></button>
        </Tooltip>

        <div className="w-px h-4 bg-studio-divider/40 mx-1" />

        <Tooltip content="Save (⌘S)">
          <button className="studio-icon-btn w-6 h-6"><Save size={13} /></button>
        </Tooltip>

        {/* Run button with states */}
        {isRunning ? (
          <button
            onClick={() => setIsRunning(false)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ml-1 bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <Square size={9} fill="currentColor" />
            Stop
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ml-1 bg-primary text-primary-foreground hover:brightness-110 shadow-sm"
          >
            <Play size={9} fill="currentColor" />
            Run
          </button>
        )}

        {/* User avatar */}
        <Tooltip content="Account">
          <button className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center ml-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-all duration-200">
            U
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default TopBar;
