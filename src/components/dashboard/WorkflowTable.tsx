import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge, { type WorkflowStatus } from "./StatusBadge";
import Tooltip from "./Tooltip";
import {
  MoreHorizontal, Pencil, Copy, Trash2, Play, Pause, Webhook, Clock, MousePointerClick, CalendarClock, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkflowItem {
  id: string;
  name: string;
  status: WorkflowStatus;
  triggerType: "webhook" | "schedule" | "manual" | "event";
  lastRun: string;
  successRate: number;
  createdAt: string;
  category: string;
}

interface WorkflowTableProps {
  workflows: WorkflowItem[];
  onRun?: (workflowId: string) => void;
  onDelete?: (workflowId: string) => void;
  onBulkDelete?: (workflowIds: string[]) => void;
}

const triggerIcons = { webhook: Webhook, schedule: CalendarClock, manual: MousePointerClick, event: Zap };
const triggerLabels = { webhook: "Webhook", schedule: "Scheduled", manual: "Manual", event: "Event" };

const WorkflowTable: React.FC<WorkflowTableProps> = ({ workflows, onRun, onDelete, onBulkDelete }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === workflows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(workflows.map((w) => w.id)));
    }
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} workflow(s)? This cannot be undone.`)) return;
    onBulkDelete?.(ids);
    setSelected(new Set());
  };

  // Close menus on background click
  React.useEffect(() => {
    const handleMouseUp = () => setOpenMenu(null);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between px-5 py-2.5 bg-indigo-50 border-b border-indigo-100">
          <span className="text-[12px] font-medium text-indigo-700">
            {selected.size} workflow{selected.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-semibold hover:bg-red-600 transition-colors"
            >
              <Trash2 size={12} />
              Delete selected
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-[32px_3fr_120px_140px_120px_140px_50px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50 sticky top-0">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selected.size === workflows.length && workflows.length > 0}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer"
          />
        </div>
        {["Name", "Status", "Trigger", "Last Run", "Success Rate", ""].map((h) => (
          <span key={h} className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100/60">
        {workflows.map((wf) => {
          const TriggerIcon = triggerIcons[wf.triggerType];
          const isMenuOpen = openMenu === wf.id;

          return (
            <div
              key={wf.id}
              className="grid grid-cols-[32px_3fr_120px_140px_120px_140px_50px] gap-4 px-5 py-3.5 items-center transition-colors duration-150 cursor-pointer group hover:bg-slate-50 relative"
              onClick={() => navigate(`/studio/${wf.id}`)}
              onMouseUp={(e) => {
                if (isMenuOpen) e.stopPropagation();
              }}
            >
              {/* Checkbox */}
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.has(wf.id)}
                  onChange={() => toggleSelect(wf.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                />
              </div>
              {/* Name */}
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-opacity group-hover:bg-primary group-hover:text-white">
                  <Play size={12} fill="currentColor" className="ml-0.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900 truncate transition-colors group-hover:text-primary">{wf.name}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{wf.category}</div>
                </div>
              </div>

              {/* Status */}
              <div><StatusBadge status={wf.status} /></div>

              {/* Trigger */}
              <div className="flex items-center gap-2 text-[12px] font-medium text-slate-600">
                <div className="w-6 h-6 rounded-md bg-slate-100/80 border border-slate-200/60 flex items-center justify-center shrink-0">
                  <TriggerIcon size={12} className="text-slate-500" />
                </div>
                {triggerLabels[wf.triggerType]}
              </div>

              {/* Last Run */}
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                <Clock size={11} className="text-slate-400" />
                {wf.lastRun}
              </div>

              {/* Success Rate */}
              <div className="flex items-center gap-3 pr-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200/50">
                  <div
                    className={cn(
                      "absolute top-0 left-0 bottom-0 rounded-full",
                      wf.successRate >= 90 ? "bg-emerald-500" : wf.successRate >= 70 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${wf.successRate}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 tabular-nums w-8">{wf.successRate}%</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end relative" onClick={(e) => { e.stopPropagation(); }}>
                <Tooltip content="Actions" side="left">
                  <button
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-150",
                      isMenuOpen ? "opacity-100 bg-slate-200/50 text-slate-900" : "opacity-0 group-hover:opacity-100"
                    )}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      setOpenMenu(isMenuOpen ? null : wf.id);
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </Tooltip>

                {isMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-200 py-1.5 z-[100]" 
                    style={{ animation: "fade-in 0.1s ease-out" }}
                  >
                    {[
                      { icon: Pencil, label: "Edit Workflow", action: () => navigate(`/studio/${wf.id}`) },
                      { icon: Copy, label: "Duplicate" },
                      { icon: Play, label: "Run now", action: () => onRun?.(wf.id) },
                      { icon: wf.status === "active" ? Pause : Play, label: wf.status === "active" ? "Pause Workflow" : "Activate Workflow" },
                      { divider: true },
                      { icon: Trash2, label: "Delete", danger: true, action: () => {
                        if (window.confirm(`Delete workflow "${wf.name}"? This cannot be undone.`)) {
                          onDelete?.(wf.id);
                        }
                      } },
                    ].map((btn, i) => (
                      btn.divider ? (
                        <div key={i} className="h-px bg-slate-100 my-1 mx-2" />
                      ) : (
                        <button
                          key={i}
                          onMouseUp={(e) => { 
                            e.stopPropagation(); 
                            setOpenMenu(null); 
                            btn.action?.(); 
                          }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors duration-150",
                            btn.danger 
                              ? "text-red-600 hover:bg-red-50 hover:text-red-700" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          {btn.icon && <btn.icon size={14} className={btn.danger ? "text-red-500" : "text-slate-400"} />}
                          {btn.label}
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowTable;
