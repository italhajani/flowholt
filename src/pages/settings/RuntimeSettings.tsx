import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function RuntimeSettings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    saveExecData: true,
    saveManual: true,
    saveProgress: false,
    redact: false,
    sequential: false,
    autoRetry: false,
  });
  const [failedExec, setFailedExec] = useState("all");
  const [successExec, setSuccessExec] = useState("all");
  const [timeout, setTimeout] = useState(3600);
  const [maxConcurrent, setMaxConcurrent] = useState(10);
  const [retention, setRetention] = useState(14);
  const [maxRetry, setMaxRetry] = useState(3);
  const [retryBackoff, setRetryBackoff] = useState(60);
  const [deadLetter, setDeadLetter] = useState(30);
  const [queueAlert, setQueueAlert] = useState(1000);

  const toggle = (key: string) => setToggles((v) => ({ ...v, [key]: !v[key] }));

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Runtime Defaults</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Configure default execution settings for workflows.</p>

      <div className="mt-6 space-y-6">
        {/* Section 1: Execution Data */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Execution Data</p>
          <div className="space-y-4">
            <ToggleRow label="Save execution data" checked={toggles.saveExecData} onChange={() => toggle("saveExecData")} />

            <Field label="Save failed executions">
              <select
                value={failedExec}
                onChange={(e) => setFailedExec(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all"
              >
                <option value="all">All</option>
                <option value="none">None</option>
                <option value="last">Last only</option>
              </select>
            </Field>

            <Field label="Save successful executions">
              <select
                value={successExec}
                onChange={(e) => setSuccessExec(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all"
              >
                <option value="all">All</option>
                <option value="none">None</option>
                <option value="sample">Sample 10%</option>
              </select>
            </Field>

            <ToggleRow label="Save manual execution results" checked={toggles.saveManual} onChange={() => toggle("saveManual")} />
            <ToggleRow label="Save execution progress" hint="Enables resume-from-error" checked={toggles.saveProgress} onChange={() => toggle("saveProgress")} />
          </div>
        </div>

        {/* Section 2: Timeout & Concurrency */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Timeout & Concurrency</p>
          <div className="space-y-5 max-w-md">
            <Field label="Execution timeout" hint="seconds (max 86400)">
              <Input type="number" value={timeout} onChange={(e) => setTimeout(Number(e.target.value))} className="w-24" />
            </Field>
            <Field label="Max concurrent executions" hint="Limit parallel runs">
              <Input type="number" value={maxConcurrent} onChange={(e) => setMaxConcurrent(Number(e.target.value))} className="w-24" />
            </Field>
          </div>
        </div>

        {/* Section 3: Retention */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Retention</p>
          <div className="space-y-5 max-w-md">
            <Field label="Data retention" hint="days (1–365)">
              <Input type="number" value={retention} onChange={(e) => setRetention(Number(e.target.value))} className="w-24" />
            </Field>
            <ToggleRow label="Redact execution payloads" hint="Inherited from organization policy" checked={toggles.redact} onChange={() => toggle("redact")} />
          </div>
        </div>

        {/* Section 4: Retry & Queue (Advanced) */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800">Advanced</p>
          <p className="text-[12px] text-zinc-400 mt-0.5 mb-4">Retry policies and queue management.</p>
          <div className="space-y-5 max-w-md">
            <ToggleRow label="Sequential processing" hint="Block new until current completes" checked={toggles.sequential} onChange={() => toggle("sequential")} />
            <ToggleRow label="Auto-retry on failure" checked={toggles.autoRetry} onChange={() => toggle("autoRetry")} />
            <Field label="Max retry attempts" hint="1–10">
              <Input type="number" value={maxRetry} onChange={(e) => setMaxRetry(Number(e.target.value))} className="w-24" />
            </Field>
            <Field label="Retry backoff" hint="seconds (30–3600)">
              <Input type="number" value={retryBackoff} onChange={(e) => setRetryBackoff(Number(e.target.value))} className="w-24" />
            </Field>
            <Field label="Dead letter retention" hint="days">
              <Input type="number" value={deadLetter} onChange={(e) => setDeadLetter(Number(e.target.value))} className="w-24" />
            </Field>
            <Field label="Queue backlog alert threshold">
              <Input type="number" value={queueAlert} onChange={(e) => setQueueAlert(Number(e.target.value))} className="w-24" />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md">Save Changes</Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[13px] font-medium text-zinc-800">{label}</p>
        {hint && <p className="text-[12px] text-zinc-400">{hint}</p>}
      </div>
      <button
        onClick={onChange}
        className={cn(
          "relative w-9 h-5 rounded-full transition-colors duration-200",
          checked ? "bg-zinc-800" : "bg-zinc-200"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
