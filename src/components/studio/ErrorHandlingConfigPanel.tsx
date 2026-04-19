import { useState } from "react";
import {
  AlertTriangle, ShieldAlert, RotateCcw, ArrowRight, Pause, SkipForward,
  GitBranch, Bell, ChevronDown, ChevronRight, Mail, Zap, Clock,
  Settings, Info, XCircle, CheckCircle2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
type ErrorBehavior = "stop" | "continue" | "retry" | "branch";
type RetryStrategy = "fixed" | "exponential" | "linear";
type NotifyChannel = "email" | "slack" | "webhook";

interface ErrorHandlingConfigPanelProps {
  nodeName?: string;
  nodeFamily?: string;
}

/* ── Reusable toggle ── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative h-4 w-7 rounded-full transition-colors flex-shrink-0",
        enabled ? "bg-blue-600" : "bg-zinc-300"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform shadow-sm",
          enabled && "translate-x-3"
        )}
      />
    </button>
  );
}

/* ── Section wrapper ── */
function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: typeof AlertTriangle;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-zinc-50 transition-colors"
      >
        {open ? <ChevronDown size={10} className="text-zinc-400" /> : <ChevronRight size={10} className="text-zinc-400" />}
        <Icon size={12} className="text-zinc-500" />
        <span className="text-[11px] font-semibold text-zinc-700">{title}</span>
      </button>
      {open && <div className="px-4 pb-3 space-y-2.5">{children}</div>}
    </div>
  );
}

export function ErrorHandlingConfigPanel({ nodeName = "HTTP Request", nodeFamily = "integration" }: ErrorHandlingConfigPanelProps) {
  const [behavior, setBehavior] = useState<ErrorBehavior>("stop");
  const [retryEnabled, setRetryEnabled] = useState(false);
  const [retryCount, setRetryCount] = useState(3);
  const [retryDelay, setRetryDelay] = useState(1000);
  const [retryStrategy, setRetryStrategy] = useState<RetryStrategy>("exponential");
  const [continueOutput, setContinueOutput] = useState<"error" | "last_success" | "default_value">("error");
  const [defaultValue, setDefaultValue] = useState('{ "fallback": true }');
  const [branchOnError, setBranchOnError] = useState(true);
  const [timeoutEnabled, setTimeoutEnabled] = useState(false);
  const [timeoutMs, setTimeoutMs] = useState(30000);
  const [notifyOnError, setNotifyOnError] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<NotifyChannel>("email");
  const [circuitBreaker, setCircuitBreaker] = useState(false);
  const [cbThreshold, setCbThreshold] = useState(5);
  const [cbWindow, setCbWindow] = useState(60);

  const behaviorOptions: { id: ErrorBehavior; label: string; icon: typeof AlertTriangle; desc: string; color: string }[] = [
    { id: "stop", label: "Stop Workflow", icon: XCircle, desc: "Halt entire execution on error", color: "border-red-200 bg-red-50 text-red-700" },
    { id: "continue", label: "Continue", icon: SkipForward, desc: "Pass error to output, continue flow", color: "border-amber-200 bg-amber-50 text-amber-700" },
    { id: "retry", label: "Retry", icon: RotateCcw, desc: "Retry operation with backoff", color: "border-blue-200 bg-blue-50 text-blue-700" },
    { id: "branch", label: "Error Branch", icon: GitBranch, desc: "Route errors to dedicated branch", color: "border-violet-200 bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <ShieldAlert size={14} className="text-red-500" />
        <div>
          <p className="text-[12px] font-semibold text-zinc-800">Error Handling</p>
          <p className="text-[9px] text-zinc-400">Configure how {nodeName} handles failures</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Behavior Selection */}
        <Section title="Error Behavior" icon={AlertTriangle}>
          <div className="grid grid-cols-2 gap-1.5">
            {behaviorOptions.map(opt => {
              const active = behavior === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setBehavior(opt.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all text-center",
                    active ? opt.color : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300"
                  )}
                >
                  <opt.icon size={14} />
                  <span className="text-[10px] font-semibold">{opt.label}</span>
                  <span className="text-[8px] opacity-70 leading-tight">{opt.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Inline info */}
          <div className="flex items-start gap-2 rounded-lg bg-zinc-50 border border-zinc-100 p-2.5 mt-1">
            <Info size={10} className="text-zinc-400 flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-zinc-500 leading-relaxed">
              {behavior === "stop" && "The workflow will immediately halt. Error details are logged and shown in execution history."}
              {behavior === "continue" && "The error is captured into the output data. Downstream nodes receive the error object and can handle it."}
              {behavior === "retry" && "The node will retry the operation using the configured strategy before falling back to the error behavior."}
              {behavior === "branch" && "A dedicated error output is created. Connect error-handling nodes to the red output port."}
            </p>
          </div>
        </Section>

        {/* Retry Configuration */}
        <Section title="Retry Strategy" icon={RotateCcw} defaultOpen={behavior === "retry"}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-zinc-700">Enable Retries</p>
              <p className="text-[9px] text-zinc-400">Automatically retry failed operations</p>
            </div>
            <Toggle enabled={retryEnabled} onToggle={() => setRetryEnabled(!retryEnabled)} />
          </div>

          {retryEnabled && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[9px] text-zinc-500 mb-0.5 block">Max Attempts</label>
                  <input
                    type="number" min={1} max={10} value={retryCount}
                    onChange={e => setRetryCount(Number(e.target.value))}
                    className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] focus:border-zinc-400 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-zinc-500 mb-0.5 block">Initial Delay (ms)</label>
                  <input
                    type="number" min={100} step={100} value={retryDelay}
                    onChange={e => setRetryDelay(Number(e.target.value))}
                    className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] focus:border-zinc-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 mb-0.5 block">Backoff Strategy</label>
                <div className="flex gap-1">
                  {(["fixed", "exponential", "linear"] as RetryStrategy[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setRetryStrategy(s)}
                      className={cn(
                        "flex-1 rounded-md border px-2 py-1 text-[9px] font-medium transition-colors capitalize",
                        retryStrategy === s ? "border-blue-300 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual retry timeline */}
              <div className="bg-zinc-50 rounded-lg border border-zinc-100 p-2.5">
                <p className="text-[8px] text-zinc-400 uppercase tracking-wider mb-1.5">Retry Timeline Preview</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: retryCount + 1 }).map((_, i) => {
                    const delay = retryStrategy === "fixed" ? retryDelay
                      : retryStrategy === "exponential" ? retryDelay * Math.pow(2, i)
                      : retryDelay * (i + 1);
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <div className={cn(
                          "rounded-full h-5 w-5 flex items-center justify-center text-[7px] font-bold",
                          i === 0 ? "bg-red-100 text-red-600" : i === retryCount ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {i === 0 ? "!" : i}
                        </div>
                        {i < retryCount && (
                          <span className="text-[7px] text-zinc-400 whitespace-nowrap">{delay >= 1000 ? `${delay / 1000}s` : `${delay}ms`}</span>
                        )}
                        {i < retryCount && <ArrowRight size={7} className="text-zinc-300" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* Continue Output Config */}
        {behavior === "continue" && (
          <Section title="Continue Output" icon={SkipForward}>
            <div>
              <label className="text-[9px] text-zinc-500 mb-1 block">Output on Error</label>
              <div className="space-y-1">
                {[
                  { id: "error" as const, label: "Error Object", desc: "Pass full error details to output" },
                  { id: "last_success" as const, label: "Last Success", desc: "Use output from last successful run" },
                  { id: "default_value" as const, label: "Default Value", desc: "Use a custom fallback value" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setContinueOutput(opt.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg border p-2 text-left transition-colors",
                      continueOutput === opt.id ? "border-blue-300 bg-blue-50" : "border-zinc-200 hover:bg-zinc-50"
                    )}
                  >
                    <span className={cn(
                      "h-3 w-3 rounded-full border-2 flex-shrink-0",
                      continueOutput === opt.id ? "border-blue-600 bg-blue-600" : "border-zinc-300"
                    )} />
                    <div>
                      <p className={cn("text-[10px] font-medium", continueOutput === opt.id ? "text-blue-700" : "text-zinc-700")}>{opt.label}</p>
                      <p className="text-[8px] text-zinc-400">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {continueOutput === "default_value" && (
              <div>
                <label className="text-[9px] text-zinc-500 mb-0.5 block">Default Value (JSON)</label>
                <textarea
                  value={defaultValue}
                  onChange={e => setDefaultValue(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-900 p-2 text-[10px] text-emerald-400 font-mono h-16 focus:border-zinc-400 focus:outline-none resize-none"
                />
              </div>
            )}
          </Section>
        )}

        {/* Error Branch Config */}
        {behavior === "branch" && (
          <Section title="Error Branch" icon={GitBranch}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-zinc-700">Create Error Output Port</p>
                <p className="text-[9px] text-zinc-400">Adds red output port for error handling nodes</p>
              </div>
              <Toggle enabled={branchOnError} onToggle={() => setBranchOnError(!branchOnError)} />
            </div>

            {branchOnError && (
              <div className="bg-zinc-50 rounded-lg border border-zinc-100 p-3">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-lg bg-white border border-zinc-200 px-3 py-2 text-center">
                      <p className="text-[9px] font-semibold text-zinc-700">{nodeName}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-px bg-emerald-400" />
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-[7px] text-emerald-600 mt-0.5">Success</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-px bg-red-400" />
                        <div className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="text-[7px] text-red-600 mt-0.5">Error</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Timeout */}
        <Section title="Timeout" icon={Clock} defaultOpen={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-zinc-700">Execution Timeout</p>
              <p className="text-[9px] text-zinc-400">Fail if node exceeds time limit</p>
            </div>
            <Toggle enabled={timeoutEnabled} onToggle={() => setTimeoutEnabled(!timeoutEnabled)} />
          </div>
          {timeoutEnabled && (
            <div>
              <label className="text-[9px] text-zinc-500 mb-0.5 block">Timeout (ms)</label>
              <input
                type="number" min={1000} step={1000} value={timeoutMs}
                onChange={e => setTimeoutMs(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] focus:border-zinc-400 focus:outline-none"
              />
              <p className="text-[8px] text-zinc-400 mt-0.5">{(timeoutMs / 1000).toFixed(1)}s timeout</p>
            </div>
          )}
        </Section>

        {/* Circuit Breaker */}
        <Section title="Circuit Breaker" icon={ShieldAlert} defaultOpen={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-zinc-700">Enable Circuit Breaker</p>
              <p className="text-[9px] text-zinc-400">Temporarily disable node after repeated failures</p>
            </div>
            <Toggle enabled={circuitBreaker} onToggle={() => setCircuitBreaker(!circuitBreaker)} />
          </div>
          {circuitBreaker && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[9px] text-zinc-500 mb-0.5 block">Failure Threshold</label>
                <input
                  type="number" min={1} max={50} value={cbThreshold}
                  onChange={e => setCbThreshold(Number(e.target.value))}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] focus:border-zinc-400 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-zinc-500 mb-0.5 block">Window (seconds)</label>
                <input
                  type="number" min={10} step={10} value={cbWindow}
                  onChange={e => setCbWindow(Number(e.target.value))}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] focus:border-zinc-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Error Notifications" icon={Bell} defaultOpen={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-zinc-700">Notify on Error</p>
              <p className="text-[9px] text-zinc-400">Send alert when this node fails</p>
            </div>
            <Toggle enabled={notifyOnError} onToggle={() => setNotifyOnError(!notifyOnError)} />
          </div>
          {notifyOnError && (
            <div>
              <label className="text-[9px] text-zinc-500 mb-1 block">Channel</label>
              <div className="flex gap-1">
                {([
                  { id: "email" as NotifyChannel, icon: Mail, label: "Email" },
                  { id: "slack" as NotifyChannel, icon: Zap, label: "Slack" },
                  { id: "webhook" as NotifyChannel, icon: Settings, label: "Webhook" },
                ]).map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setNotifyChannel(ch.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 rounded-md border py-1.5 text-[9px] font-medium transition-colors",
                      notifyChannel === ch.id ? "border-blue-300 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                    )}
                  >
                    <ch.icon size={10} />
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Summary */}
        <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100">
          <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Configuration Summary</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full", {
                "bg-red-400": behavior === "stop",
                "bg-amber-400": behavior === "continue",
                "bg-blue-400": behavior === "retry",
                "bg-violet-400": behavior === "branch",
              })} />
              <span className="text-[10px] text-zinc-600 capitalize">{behavior} on error</span>
            </div>
            {retryEnabled && (
              <div className="flex items-center gap-2">
                <RotateCcw size={8} className="text-blue-500" />
                <span className="text-[10px] text-zinc-600">{retryCount}x retries ({retryStrategy})</span>
              </div>
            )}
            {timeoutEnabled && (
              <div className="flex items-center gap-2">
                <Clock size={8} className="text-amber-500" />
                <span className="text-[10px] text-zinc-600">{timeoutMs / 1000}s timeout</span>
              </div>
            )}
            {circuitBreaker && (
              <div className="flex items-center gap-2">
                <ShieldAlert size={8} className="text-red-500" />
                <span className="text-[10px] text-zinc-600">Circuit breaker: {cbThreshold} failures / {cbWindow}s</span>
              </div>
            )}
            {notifyOnError && (
              <div className="flex items-center gap-2">
                <Bell size={8} className="text-blue-500" />
                <span className="text-[10px] text-zinc-600">Notify via {notifyChannel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
