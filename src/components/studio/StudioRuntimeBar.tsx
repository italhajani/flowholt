import { useState } from "react";
import {
  Play, Pin, Square, Save, History, ChevronUp, ChevronDown,
  RotateCcw, RotateCw, Calendar, ChevronRight, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRunWorkflow, useUpdateWorkflow } from "@/hooks/useApi";
import { useCanvasStore } from "./useCanvasStore";

interface Props {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  workflowId?: string;
}

export function StudioRuntimeBar({ drawerOpen, onToggleDrawer, workflowId }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [scheduleOn, setScheduleOn] = useState(false);
  const [savedState, setSavedState] = useState<"saved" | "saving" | "unsaved">("saved");
  const [replayOpen, setReplayOpen] = useState(false);
  const store = useCanvasStore();
  const runMutation = useRunWorkflow(workflowId ?? "");
  const updateMutation = useUpdateWorkflow(workflowId ?? "");

  function handleRun() {
    if (workflowId) {
      setIsRunning(true);
      runMutation.mutate({ payload: {}, environment: "draft" }, {
        onSettled: () => setIsRunning(false),
      });
    } else {
      setIsRunning(true);
      setSavedState("unsaved");
      setTimeout(() => setIsRunning(false), 3000);
    }
  }

  function handleSave() {
    if (workflowId) {
      setSavedState("saving");
      const definition = {
        steps: store.nodes.map((n) => ({ id: n.id, type: n.family, name: n.name, config: {} })),
        edges: store.edges.map(([s, t]) => ({ id: `${s}-${t}`, source: s, target: t })),
        settings: {},
      };
      updateMutation.mutate(
        { name: "Workflow", trigger_type: "manual", category: "Custom", status: "draft", definition },
        { onSuccess: () => setSavedState("saved"), onError: () => setSavedState("unsaved") }
      );
    } else {
      setSavedState("saving");
      setTimeout(() => setSavedState("saved"), 800);
    }
  }

  return (
    <div className="flex h-11 items-center justify-between border-t border-zinc-100 bg-white px-4 relative z-10">
      {/* Left group — Run controls */}
      <div className="flex items-center gap-1.5">
        {isRunning ? (
          <button
            onClick={() => setIsRunning(false)}
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-red-500 px-2.5 text-[12px] font-medium text-white hover:bg-red-600 transition-colors"
          >
            <Square size={11} />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-zinc-900 px-2.5 text-[12px] font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            <Play size={11} />
            Run Once
          </button>
        )}

        {/* Replay dropdown */}
        <div className="relative">
          <button
            onClick={() => setReplayOpen((o) => !o)}
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Replay</span>
            <ChevronDown size={10} />
          </button>
          {replayOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-52 rounded-lg border border-zinc-200 bg-white shadow-lg py-1 z-50">
              <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">Replay from</p>
              {["Latest execution", "Specific execution…", "With test data"].map((item) => (
                <button
                  key={item}
                  onClick={() => setReplayOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  <ChevronRight size={11} className="text-zinc-300" />
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
          <Pin size={12} />
          <span className="hidden sm:inline">Pinned</span>
        </button>

        <span className="mx-1 h-5 w-px bg-zinc-200" />

        {/* Undo / Redo */}
        <button title="Undo" className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
          <RotateCcw size={13} />
        </button>
        <button title="Redo" className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
          <RotateCw size={13} />
        </button>
      </div>

      {/* Center — Save + Schedule */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-colors",
            savedState === "unsaved"
              ? "bg-zinc-900 text-white hover:bg-zinc-700"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
          )}
        >
          {savedState === "saving" ? (
            <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : savedState === "saved" ? (
            <Check size={12} />
          ) : (
            <Save size={12} />
          )}
          {savedState === "saving" ? "Saving…" : savedState === "saved" ? "Saved" : "Save"}
        </button>

        <button
          onClick={() => setScheduleOn((o) => !o)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium border transition-colors",
            scheduleOn
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
          )}
        >
          <Calendar size={12} />
          {scheduleOn ? "Scheduled: Daily 9am" : "Schedule"}
        </button>
      </div>

      {/* Right — History + drawer toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDrawer}
          className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        >
          <History size={13} />
          <span className="hidden sm:inline text-[11px]">Logs</span>
          {drawerOpen ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
        </button>
      </div>
    </div>
  );
}


