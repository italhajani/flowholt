/**
 * Workflow-level settings tab — displayed when Studio "Settings" tab is active.
 * Covers: execution order, timeout, save policy, error workflow, sequential
 * processing, deployment policy, environment bindings.
 */
import { useState } from "react";
import {
  Clock, Shield, Zap, AlertTriangle, Save, Layers, Lock,
  ToggleLeft, ToggleRight, CheckCircle2, Server, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-[12px] font-semibold text-zinc-900">{title}</h3>
      </div>
      <div className="space-y-3 pl-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-zinc-600">{label}</label>
      {description && <p className="text-[10px] text-zinc-400">{description}</p>}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onToggle, label, description }: { enabled: boolean; onToggle: () => void; label: string; description?: string }) {
  return (
    <button onClick={onToggle} className="flex items-start gap-3 w-full text-left rounded-lg border border-zinc-100 p-3 hover:bg-zinc-50/50 transition-colors">
      <div className="mt-0.5">
        {enabled
          ? <ToggleRight size={18} className="text-green-600" />
          : <ToggleLeft size={18} className="text-zinc-300" />}
      </div>
      <div>
        <span className="text-[11px] font-medium text-zinc-700">{label}</span>
        {description && <p className="text-[10px] text-zinc-400 mt-0.5">{description}</p>}
      </div>
    </button>
  );
}

export function WorkflowSettingsPanel({ workflowId }: { workflowId?: string }) {
  const [timeout, setTimeout_] = useState(30000);
  const [savePolicy, setSavePolicy] = useState<"manual" | "auto">("auto");
  const [errorWorkflow, setErrorWorkflow] = useState("none");
  const [sequential, setSequential] = useState(false);
  const [confidential, setConfidential] = useState(false);
  const [executionOrder, setExecutionOrder] = useState<"v1" | "v0">("v1");
  const [activeEnv, setActiveEnv] = useState("production");

  return (
    <div className="mx-auto max-w-[640px] py-8 px-6 space-y-8">
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-900">Workflow Settings</h2>
        <p className="text-[12px] text-zinc-500 mt-1">Configure execution behavior, error handling, and deployment for this workflow.</p>
        {workflowId && <p className="text-[10px] font-mono text-zinc-400 mt-1">{workflowId}</p>}
      </div>

      <Section title="Execution" icon={<Zap size={14} className="text-blue-500" />}>
        <FieldRow label="Timeout (ms)" description="Maximum time a single execution can run before forced stop.">
          <input
            type="number"
            value={timeout}
            onChange={(e) => setTimeout_(Number(e.target.value))}
            className="h-8 w-48 rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </FieldRow>

        <FieldRow label="Execution order" description="V1 uses breadth-first (recommended). V0 is depth-first (legacy).">
          <div className="flex gap-2">
            {(["v1", "v0"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setExecutionOrder(v)}
                className={cn(
                  "rounded-md border px-4 py-1.5 text-[11px] font-medium transition-all",
                  executionOrder === v ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                )}
              >
                {v.toUpperCase()} {v === "v1" && "(Recommended)"}
              </button>
            ))}
          </div>
        </FieldRow>

        <Toggle label="Sequential processing" description="Process items one at a time instead of in parallel. Useful for rate-limited APIs." enabled={sequential} onToggle={() => setSequential(p => !p)} />
      </Section>

      <div className="border-t border-zinc-100" />

      <Section title="Save Policy" icon={<Save size={14} className="text-zinc-500" />}>
        <div className="flex gap-2">
          {([
            { id: "auto" as const, label: "Auto-save", desc: "Save on every change" },
            { id: "manual" as const, label: "Manual", desc: "Save only on Ctrl+S" },
          ]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSavePolicy(opt.id)}
              className={cn(
                "flex flex-col items-center rounded-lg border px-4 py-3 text-center flex-1 transition-all",
                savePolicy === opt.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              )}
            >
              <span className="text-[11px] font-semibold">{opt.label}</span>
              <span className={cn("text-[9px] mt-0.5", savePolicy === opt.id ? "text-zinc-300" : "text-zinc-400")}>{opt.desc}</span>
            </button>
          ))}
        </div>
      </Section>

      <div className="border-t border-zinc-100" />

      <Section title="Error Handling" icon={<AlertTriangle size={14} className="text-red-500" />}>
        <FieldRow label="Error workflow" description="Execute another workflow when this one fails at any node.">
          <select
            value={errorWorkflow}
            onChange={(e) => setErrorWorkflow(e.target.value)}
            className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none"
          >
            <option value="none">— None —</option>
            <option value="error-handler">Error Alert Handler</option>
            <option value="slack-notify">Slack Error Notifier</option>
            <option value="pagerduty">PagerDuty Escalation</option>
          </select>
          {errorWorkflow !== "none" && (
            <p className="text-[9px] text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle2 size={8} /> Will receive error context + original trigger data
            </p>
          )}
        </FieldRow>
      </Section>

      <div className="border-t border-zinc-100" />

      <Section title="Security" icon={<Shield size={14} className="text-amber-500" />}>
        <Toggle label="Confidential data" description="Mask execution data in logs and history. Cannot be revealed after execution." enabled={confidential} onToggle={() => setConfidential(p => !p)} />
      </Section>

      <div className="border-t border-zinc-100" />

      <Section title="Environment" icon={<Globe size={14} className="text-teal-500" />}>
        <FieldRow label="Active environment" description="Which environment this workflow targets when published.">
          <div className="flex gap-2">
            {["production", "staging", "development"].map((env) => (
              <button
                key={env}
                onClick={() => setActiveEnv(env)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-[11px] font-medium transition-all capitalize",
                  activeEnv === env ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                )}
              >
                {env === "production" && <Server size={10} className="inline mr-1" />}
                {env}
              </button>
            ))}
          </div>
        </FieldRow>
      </Section>

      <div className="border-t border-zinc-100" />

      <div className="flex justify-end">
        <button className="h-8 rounded-md bg-zinc-900 px-4 text-[12px] font-medium text-white hover:bg-zinc-700 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
