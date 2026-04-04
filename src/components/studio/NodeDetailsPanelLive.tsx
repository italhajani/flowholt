import React, { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  CheckCircle2,
  ChevronDown,
  Circle,
  Copy,
  GitBranch,
  Play,
  Sparkles,
  Trash2,
  Webhook,
  X,
  Users,
  Clock3,
  Link2,
} from "lucide-react";
import type { ApiWorkflowEdge, ApiWorkflowStep } from "@/lib/api";

interface NodeDetailsPanelLiveProps {
  workflowName: string;
  step: ApiWorkflowStep | null;
  steps: ApiWorkflowStep[];
  edges: ApiWorkflowEdge[];
  saving: boolean;
  onSave: (step: ApiWorkflowStep) => void;
  onConnectionsChange: (
    stepId: string,
    targets: { defaultTarget?: string; trueTarget?: string; falseTarget?: string },
  ) => void;
  onDuplicate: (step: ApiWorkflowStep) => void;
  onDelete: (stepId: string) => void;
  onMove: (stepId: string, direction: "up" | "down") => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onClose: () => void;
}

type TabId = "setup" | "configure" | "test";

const typeMeta: Record<ApiWorkflowStep["type"], { icon: React.ElementType; subtitle: string; iconClass: string }> = {
  trigger: { icon: Webhook, subtitle: "Trigger", iconClass: "text-sky-600" },
  transform: { icon: Sparkles, subtitle: "Transform", iconClass: "text-amber-600" },
  condition: { icon: GitBranch, subtitle: "Condition", iconClass: "text-emerald-600" },
  llm: { icon: Bot, subtitle: "AI Step", iconClass: "text-violet-600" },
  output: { icon: CheckCircle2, subtitle: "Output", iconClass: "text-rose-600" },
  delay: { icon: Clock3, subtitle: "Delay", iconClass: "text-slate-600" },
  human: { icon: Users, subtitle: "Human Task", iconClass: "text-fuchsia-600" },
  callback: { icon: Link2, subtitle: "Callback Wait", iconClass: "text-cyan-600" },
};

const prettyLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());

const NodeDetailsPanelLive: React.FC<NodeDetailsPanelLiveProps> = ({
  workflowName,
  step,
  steps,
  edges,
  saving,
  onSave,
  onConnectionsChange,
  onDuplicate,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
  onClose,
}) => {
  const [tab, setTab] = useState<TabId>("configure");
  const [draft, setDraft] = useState<ApiWorkflowStep | null>(step);

  React.useEffect(() => {
    setDraft(step);
    setTab("configure");
  }, [step]);

  const configEntries = useMemo(() => Object.entries(draft?.config ?? {}), [draft]);
  const connectionTargets = useMemo(() => {
    if (!draft) return { defaultTarget: "", trueTarget: "", falseTarget: "" };
    const outgoing = edges.filter((edge) => edge.source === draft.id);
    return {
      defaultTarget: outgoing.find((edge) => !edge.label)?.target ?? "",
      trueTarget: outgoing.find((edge) => (edge.label ?? "").toLowerCase() === "true")?.target ?? "",
      falseTarget: outgoing.find((edge) => (edge.label ?? "").toLowerCase() === "false")?.target ?? "",
    };
  }, [draft, edges]);

  if (!draft) {
    return (
      <aside className="w-[320px] shrink-0 border-l border-slate-200 bg-[#fcfcfd]">
        <div className="flex h-full items-center justify-center px-8 text-center">
          <div>
            <div className="text-[14px] font-semibold text-slate-900">Select a step</div>
            <div className="mt-2 text-[12px] leading-5 text-slate-500">
              Choose a node from the canvas to edit its setup, configuration, and test data.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const meta = typeMeta[draft.type];
  const Icon = meta.icon;

  const handleConfigChange = (key: string, value: string) => {
    setDraft((current) => (current ? { ...current, config: { ...current.config, [key]: value } } : current));
  };

  const handleSave = () => {
    if (draft) {
      onSave(draft);
      onConnectionsChange(draft.id, connectionTargets);
    }
  };

  return (
    <aside className="w-[320px] shrink-0 border-l border-slate-200 bg-[#fcfcfd]">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-slate-200 bg-white">
                <Icon size={18} className={meta.iconClass} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold text-slate-900">{draft.name}</div>
                <div className="truncate text-[12px] text-slate-500">{workflowName}</div>
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="bg-white px-4 py-3">
          <div className="grid grid-cols-3 rounded-[12px] border border-slate-200 bg-[#fafafa] p-1">
            {(["setup", "configure", "test"] as TabId[]).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`h-7 rounded-[9px] text-[11px] font-medium transition-colors ${
                  tab === item ? "bg-[#6558f5] text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {tab === "setup" && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 py-3.5">
                <div className="text-[11px] text-slate-500">Step type</div>
                <div className="mt-1.5 text-[12px] font-medium text-slate-900">{meta.subtitle}</div>
              </div>
              <div className="border-b border-slate-200 py-3.5">
                <div className="text-[11px] text-slate-500">Node name</div>
                <input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  className="mt-2 h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none"
                />
              </div>
              <div className="py-3.5">
                <div className="text-[11px] text-slate-500">Workflow</div>
                <div className="mt-1.5 text-[12px] font-medium text-slate-900">{workflowName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-4">
                <button
                  onClick={() => onMove(draft.id, "up")}
                  disabled={!canMoveUp || saving}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white text-[12px] font-medium text-slate-700 disabled:opacity-50"
                >
                  <ArrowUp size={13} />
                  Move up
                </button>
                <button
                  onClick={() => onMove(draft.id, "down")}
                  disabled={!canMoveDown || saving}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white text-[12px] font-medium text-slate-700 disabled:opacity-50"
                >
                  <ArrowDown size={13} />
                  Move down
                </button>
                <button
                  onClick={() => onDuplicate(draft)}
                  disabled={saving}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white text-[12px] font-medium text-slate-700 disabled:opacity-50"
                >
                  <Copy size={13} />
                  Duplicate
                </button>
                <button
                  onClick={() => onDelete(draft.id)}
                  disabled={saving}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-red-200 bg-red-50 text-[12px] font-medium text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          )}

          {tab === "configure" && (
            <div className="space-y-4">
              <section className="border-b border-slate-200 pb-4">
                <button className="flex w-full items-center justify-between gap-3 text-left">
                  <span className="text-[12px] font-semibold text-slate-900">General Settings</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                <div className="mt-3.5 space-y-3.5">
                  <div>
                    <div className="mb-1.5 text-[11px] font-medium text-slate-800">Step name</div>
                    <input
                      value={draft.name}
                      onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                      className="h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none"
                    />
                  </div>
                  {configEntries.length === 0 && (
                    <div className="rounded-[12px] border border-slate-200 bg-white px-3.5 py-3 text-[12px] text-slate-500">
                      This step does not have extra configuration fields yet.
                    </div>
                  )}
                  {configEntries.map(([key, value]) => {
                    const textValue = value == null ? "" : String(value);
                    const multiline = textValue.length > 80 || key === "prompt";
                    return (
                      <div key={key}>
                        <div className="mb-1.5 text-[11px] font-medium text-slate-800">{prettyLabel(key)}</div>
                        {multiline ? (
                          <textarea
                            value={textValue}
                            onChange={(event) => handleConfigChange(key, event.target.value)}
                            className="min-h-[88px] w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[12px] leading-5 text-slate-800 outline-none resize-none"
                          />
                        ) : (
                          <input
                            value={textValue}
                            onChange={(event) => handleConfigChange(key, event.target.value)}
                            className="h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                  <div className="border-t border-slate-200 pt-3">
                    <div className="mb-2 text-[11px] font-medium text-slate-800">Connections</div>
                    <div className="space-y-2.5">
                      {draft.type === "condition" ? (
                        <>
                          <div>
                            <div className="mb-1 text-[11px] text-slate-500">True branch</div>
                            <select
                              value={connectionTargets.trueTarget}
                              onChange={(event) => onConnectionsChange(draft.id, { ...connectionTargets, trueTarget: event.target.value })}
                              className="h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none"
                            >
                              <option value="">No target</option>
                              {steps.filter((item) => item.id !== draft.id).map((item) => (
                                <option key={`true-${item.id}`} value={item.id}>{item.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div className="mb-1 text-[11px] text-slate-500">False branch</div>
                            <select
                              value={connectionTargets.falseTarget}
                              onChange={(event) => onConnectionsChange(draft.id, { ...connectionTargets, falseTarget: event.target.value })}
                              className="h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none"
                            >
                              <option value="">No target</option>
                              {steps.filter((item) => item.id !== draft.id).map((item) => (
                                <option key={`false-${item.id}`} value={item.id}>{item.name}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      ) : (
                        <div>
                          <div className="mb-1 text-[11px] text-slate-500">Next step</div>
                          <select
                            value={connectionTargets.defaultTarget}
                            onChange={(event) => onConnectionsChange(draft.id, { ...connectionTargets, defaultTarget: event.target.value })}
                            className="h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none"
                          >
                            <option value="">No target</option>
                            {steps.filter((item) => item.id !== draft.id).map((item) => (
                              <option key={`default-${item.id}`} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === "test" && (
            <div className="space-y-3.5">
              <div className="rounded-[12px] border border-slate-200 bg-white px-3.5 py-3">
                <div className="flex items-center gap-2 text-[12px] font-medium text-slate-900">
                  <Play size={13} className="text-slate-500" />
                  Ready for test run
                </div>
                <div className="mt-1.5 text-[10px] leading-4 text-slate-500">
                  Use sample data to verify this step before publishing.
                </div>
              </div>
              <div className="border-b border-slate-200 py-3.5">
                <div className="text-[11px] text-slate-500">Current mode</div>
                <div className="mt-1.5 text-[12px] font-medium text-slate-900">{meta.subtitle}</div>
              </div>
              <div className="border-b border-slate-200 py-3.5">
                <div className="text-[11px] text-slate-500">Config fields</div>
                <div className="mt-1.5 text-[12px] font-medium text-slate-900">{configEntries.length}</div>
              </div>
              <div className="py-3.5">
                <div className="text-[11px] text-slate-500">Execution status</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700">
                  <Circle size={8} className="fill-emerald-400 text-emerald-400" />
                  Ready
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#6558f5] text-[12px] font-semibold text-white disabled:opacity-70"
          >
            {tab === "test" ? <Play size={14} /> : tab === "setup" ? <Copy size={14} /> : <CheckCircle2 size={14} />}
            {saving ? "Saving..." : tab === "test" ? "Run Test" : "Save & Continue"}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default NodeDetailsPanelLive;
