import { useState } from "react";
import {
  CheckSquare, Trash2, EyeOff, Eye, Copy, FolderInput, Pin, Download,
  Lock, Tag, ArrowRight, RotateCcw, ChevronDown, X, Layers, Scissors,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface SelectedNode {
  id: string;
  name: string;
  family: string;
  disabled?: boolean;
  pinned?: boolean;
}

interface BulkOperationsToolbarProps {
  selectedNodes: SelectedNode[];
  onClearSelection: () => void;
  onAction?: (action: string, nodeIds: string[]) => void;
}

/* ── Action definitions ── */
const primaryActions = [
  { id: "disable", label: "Disable", icon: EyeOff, desc: "Disable selected nodes", color: "text-amber-600 hover:bg-amber-50" },
  { id: "enable", label: "Enable", icon: Eye, desc: "Enable disabled nodes", color: "text-emerald-600 hover:bg-emerald-50" },
  { id: "duplicate", label: "Duplicate", icon: Copy, desc: "Copy selected nodes", color: "text-blue-600 hover:bg-blue-50" },
  { id: "delete", label: "Delete", icon: Trash2, desc: "Remove selected nodes", color: "text-red-600 hover:bg-red-50" },
] as const;

const secondaryActions = [
  { id: "pin-data", label: "Pin Data", icon: Pin, desc: "Pin output data on selected nodes" },
  { id: "unpin-data", label: "Unpin Data", icon: Pin, desc: "Remove pinned data" },
  { id: "assign-credential", label: "Assign Credential", icon: Lock, desc: "Bulk assign credentials" },
  { id: "add-tag", label: "Add Tag", icon: Tag, desc: "Tag selected nodes" },
  { id: "move-to-group", label: "Move to Group", icon: FolderInput, desc: "Move nodes into a group" },
  { id: "extract-subflow", label: "Extract Sub-workflow", icon: Scissors, desc: "Extract as reusable sub-workflow" },
  { id: "export-selection", label: "Export Selection", icon: Download, desc: "Export selected nodes as JSON" },
  { id: "retry-selected", label: "Retry Selected", icon: RotateCcw, desc: "Re-execute selected nodes" },
  { id: "execute-only", label: "Execute Only", icon: Zap, desc: "Run workflow with only these nodes" },
] as const;

/* ── ConfirmDialog ── */
function ConfirmDialog({ action, count, onConfirm, onCancel }: {
  action: string; count: number; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 mx-4">
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 shadow-lg">
        <p className="text-[11px] font-semibold text-red-700">Confirm {action}?</p>
        <p className="text-[10px] text-red-600 mt-0.5">
          This will affect {count} node{count > 1 ? "s" : ""}. This action cannot be undone.
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={onCancel} className="flex-1 rounded-md border border-zinc-200 bg-white py-1 text-[10px] text-zinc-600 hover:bg-zinc-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-md bg-red-600 py-1 text-[10px] text-white hover:bg-red-700 transition-colors">
            {action} {count} node{count > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BulkOperationsToolbar({ selectedNodes, onClearSelection, onAction }: BulkOperationsToolbarProps) {
  const [showMore, setShowMore] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const count = selectedNodes.length;

  if (count === 0) return null;

  const handleAction = (actionId: string) => {
    if (actionId === "delete") {
      setConfirm("Delete");
      return;
    }
    onAction?.(actionId, selectedNodes.map(n => n.id));
  };

  const handleConfirm = () => {
    onAction?.("delete", selectedNodes.map(n => n.id));
    setConfirm(null);
  };

  const disabledCount = selectedNodes.filter(n => n.disabled).length;
  const pinnedCount = selectedNodes.filter(n => n.pinned).length;
  const familyCounts = selectedNodes.reduce((acc, n) => {
    acc[n.family] = (acc[n.family] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative">
      {confirm && (
        <ConfirmDialog
          action={confirm}
          count={count}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/95 backdrop-blur-sm shadow-lg px-3 py-2">
        {/* Selection badge */}
        <div className="flex items-center gap-1.5 border-r border-zinc-200 pr-3">
          <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5">
            <CheckSquare size={10} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-700">{count}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-medium text-zinc-700">
              node{count > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-1">
              {Object.entries(familyCounts).map(([fam, c]) => (
                <span key={fam} className="text-[7px] text-zinc-400">
                  {c} {fam}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1 border-r border-zinc-200 pr-3">
          {disabledCount > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] text-amber-700">
              <EyeOff size={7} /> {disabledCount}
            </span>
          )}
          {pinnedCount > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] text-blue-700">
              <Pin size={7} /> {pinnedCount}
            </span>
          )}
        </div>

        {/* Primary actions */}
        <div className="flex items-center gap-0.5">
          {primaryActions.map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                action.color
              )}
              title={action.desc}
            >
              <action.icon size={11} />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>

        {/* More actions dropdown */}
        <div className="relative border-l border-zinc-200 pl-2">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <Layers size={10} />
            More
            <ChevronDown size={8} className={cn("transition-transform", showMore && "rotate-180")} />
          </button>

          {showMore && (
            <div className="absolute bottom-full right-0 mb-2 w-52 rounded-lg border border-zinc-200 bg-white shadow-lg py-1 z-50">
              {secondaryActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => { handleAction(action.id); setShowMore(false); }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-zinc-50 transition-colors"
                >
                  <action.icon size={11} className="text-zinc-400" />
                  <div>
                    <p className="text-[10px] text-zinc-700">{action.label}</p>
                    <p className="text-[8px] text-zinc-400">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          title="Clear selection"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
