import React, { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";
import type { ApiWorkflowSettings } from "@/lib/api";

interface WorkflowSettingsModalProps {
  open: boolean;
  settings: ApiWorkflowSettings;
  saving: boolean;
  onClose: () => void;
  onSave: (settings: ApiWorkflowSettings) => void;
}

const WorkflowSettingsModal: React.FC<WorkflowSettingsModalProps> = ({
  open,
  settings,
  saving,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<ApiWorkflowSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">Workflow settings</h2>
              <p className="text-[12px] text-slate-500">Persist execution behavior and workflow-wide defaults.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Execution</div>
              <div className="mt-1 text-[12px] text-slate-500">Global runtime behavior similar to n8n workflow options.</div>
            </div>

            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-slate-700">Execution order</span>
              <select
                value={draft.execution_order}
                onChange={(event) => setDraft((current) => ({ ...current, execution_order: event.target.value as ApiWorkflowSettings["execution_order"] }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-violet-300"
              >
                <option value="v1">v1</option>
                <option value="legacy">legacy</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-slate-700">Caller policy</span>
              <select
                value={draft.caller_policy}
                onChange={(event) => setDraft((current) => ({ ...current, caller_policy: event.target.value as ApiWorkflowSettings["caller_policy"] }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-violet-300"
              >
                <option value="inherit">Inherit caller data</option>
                <option value="isolated">Run in isolated scope</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-slate-700">Timezone</span>
              <input
                value={draft.timezone}
                onChange={(event) => setDraft((current) => ({ ...current, timezone: event.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-violet-300"
                placeholder="UTC"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-slate-700">Timeout</span>
              <input
                type="number"
                min={1}
                value={draft.timeout_seconds}
                onChange={(event) => setDraft((current) => ({ ...current, timeout_seconds: Number(event.target.value || 0) }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-violet-300"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-slate-700">Error workflow ID</span>
              <input
                value={draft.error_workflow_id ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, error_workflow_id: event.target.value || null }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-violet-300"
                placeholder="Optional workflow ID"
              />
            </label>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Execution Data</div>
              <div className="mt-1 text-[12px] text-slate-500">Control what execution history is preserved at the workflow level.</div>
            </div>

            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-slate-700">Save failed executions</span>
              <select
                value={draft.save_failed_executions}
                onChange={(event) => setDraft((current) => ({ ...current, save_failed_executions: event.target.value as ApiWorkflowSettings["save_failed_executions"] }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-violet-300"
              >
                <option value="all">All</option>
                <option value="none">None</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-slate-700">Save successful executions</span>
              <select
                value={draft.save_successful_executions}
                onChange={(event) => setDraft((current) => ({ ...current, save_successful_executions: event.target.value as ApiWorkflowSettings["save_successful_executions"] }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-violet-300"
              >
                <option value="all">All</option>
                <option value="none">None</option>
              </select>
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-[13px] text-slate-700">
              <span>Save manual executions</span>
              <input
                type="checkbox"
                checked={draft.save_manual_executions}
                onChange={(event) => setDraft((current) => ({ ...current, save_manual_executions: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-[13px] text-slate-700">
              <span>Save execution progress</span>
              <input
                type="checkbox"
                checked={draft.save_execution_progress}
                onChange={(event) => setDraft((current) => ({ ...current, save_execution_progress: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-slate-700">Estimated time saved</span>
              <input
                type="number"
                min={0}
                value={draft.time_saved_minutes}
                onChange={(event) => setDraft((current) => ({ ...current, time_saved_minutes: Number(event.target.value || 0) }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-violet-300"
              />
            </label>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={saving}
            className="h-10 rounded-xl bg-violet-600 px-4 text-[12px] font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save workflow settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSettingsModal;