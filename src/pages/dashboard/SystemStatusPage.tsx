import React from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api, type ApiSystemStatus } from "@/lib/api";
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Globe,
  Layers,
  Play,
  Plug,
  RefreshCw,
  Server,
  Timer,
  XCircle,
  Zap,
} from "lucide-react";

const StatusDot: React.FC<{ active: boolean; label: string }> = ({ active, label }) => (
  <div className="flex items-center gap-2">
    <div className={cn("w-2 h-2 rounded-full", active ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
    <span className={cn("text-[12px] font-semibold", active ? "text-emerald-700" : "text-slate-500")}>{label}</span>
  </div>
);

const MetricCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}> = ({ icon: Icon, label, value, subtitle, color = "text-slate-700" }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
        <Icon size={16} className="text-slate-500" />
      </div>
      <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
    <div className={cn("text-[28px] font-extrabold tracking-tight", color)}>{value}</div>
    {subtitle && <div className="text-[12px] text-slate-500 mt-1">{subtitle}</div>}
  </div>
);

const SectionHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="mb-4">
    <h2 className="text-[18px] font-bold text-slate-900">{title}</h2>
    {description && <p className="text-[13px] text-slate-500 mt-0.5">{description}</p>}
  </div>
);

const ServiceRow: React.FC<{
  label: string;
  status: boolean;
  detail?: string;
}> = ({ label, status, detail }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", status ? "bg-emerald-50" : "bg-rose-50")}>
        {status ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-rose-500" />}
      </div>
      <span className="text-[13px] font-semibold text-slate-900">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {detail && <span className="text-[12px] text-slate-500">{detail}</span>}
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", status ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
        {status ? "Online" : "Offline"}
      </span>
    </div>
  </div>
);

const SystemStatusPage: React.FC = () => {
  const { data: status, isLoading, error: queryError, dataUpdatedAt, refetch } = useQuery({
    queryKey: ["system-status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 30_000,
  });
  const fetchStatus = () => { refetch(); };
  const loading = isLoading && !status;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load system status") : null;
  const lastRefresh = new Date(dataUpdatedAt || Date.now());

  if (loading && !status) {
    return (
      <div className="p-8 max-w-[1440px] mx-auto animate-fade-in">
        <div className="flex items-center gap-3">
          <RefreshCw size={16} className="text-slate-400 animate-spin" />
          <span className="text-[14px] text-slate-500">Loading system status...</span>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="p-8 max-w-[1440px] mx-auto animate-fade-in">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-center gap-3">
            <XCircle size={18} className="text-rose-500" />
            <span className="text-[14px] font-semibold text-rose-700">{error}</span>
          </div>
          <button onClick={fetchStatus} className="mt-4 h-9 px-4 rounded-lg bg-rose-100 text-rose-700 text-[12px] font-semibold hover:bg-rose-200 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const s = status!;

  return (
    <div className="p-8 max-w-[1440px] mx-auto animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">System Status</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Runtime health, workers, scheduler state, and infrastructure signals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchStatus}
            className={cn("h-9 px-4 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2", loading && "opacity-50")}
          >
            <RefreshCw size={13} className={cn(loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Platform Info Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#103b71]/5 to-transparent p-5 mb-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Server size={16} className="text-[#103b71]" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Version</div>
              <div className="text-[14px] font-bold text-slate-900">{s.platform.version}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe size={16} className="text-[#103b71]" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Environment</div>
              <div className="text-[14px] font-bold text-slate-900 capitalize">{s.platform.environment}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Database size={16} className="text-[#103b71]" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Database</div>
              <div className="text-[14px] font-bold text-slate-900 capitalize">{s.platform.database_backend}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Cpu size={16} className="text-[#103b71]" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Execution Mode</div>
              <div className="text-[14px] font-bold text-slate-900 capitalize">{s.platform.execution_mode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Health */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 col-span-1">
          <SectionHeader title="Services" description="Core platform services" />
          <div className="space-y-0">
            <ServiceRow label="API Server" status={true} detail="FastAPI" />
            <ServiceRow label="Background Worker" status={s.worker.active} detail={s.worker.mode} />
            <ServiceRow label="Cron Scheduler" status={s.scheduler.active} />
            <ServiceRow label="LLM Router" status={s.llm.available_providers.length > 0} detail={s.llm.default_provider || "none"} />
          </div>
        </div>

        {/* LLM Routing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 col-span-1">
          <SectionHeader title="LLM Routing" description="Observed runtime selection, not credential management" />
          <div className="space-y-2">
            {[
              { label: "Configured provider", value: s.llm.configured_provider || "none" },
              { label: "Default route", value: s.llm.default_provider || "none" },
              { label: "Available providers", value: `${s.llm.available_providers.length}` },
              { label: "Execution mode", value: s.platform.execution_mode },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-slate-400" />
                  <span className="text-[13px] font-semibold text-slate-900">{row.label}</span>
                </div>
                <span className="text-[12px] font-semibold text-slate-600 capitalize">{row.value}</span>
              </div>
            ))}
            <div className="pt-2">
              <div className="text-[11px] text-slate-500">
                Vault owns the live API keys and model credentials backing these runtime choices.
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Inventory */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 col-span-1">
          <SectionHeader title="Catalog Inventory" description="Observed app and node catalog counts" />
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-slate-400" />
                <span className="text-[13px] font-semibold text-slate-700">Built-in apps</span>
              </div>
              <span className="text-[14px] font-bold text-slate-900">{s.integrations.builtin_count}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plug size={14} className="text-slate-400" />
                <span className="text-[13px] font-semibold text-slate-700">Plugin connectors</span>
              </div>
              <span className="text-[14px] font-bold text-slate-900">{s.integrations.plugin_count}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-[#103b71]" />
                <span className="text-[13px] font-bold text-slate-900">Total in catalog</span>
              </div>
              <span className="text-[18px] font-extrabold text-[#103b71]">{s.integrations.total}</span>
            </div>
            <div className="pt-1 text-[11px] leading-5 text-slate-500">
              Use Vault to manage live connected accounts. This page only reports what the runtime and editor can currently see.
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <SectionHeader title="Metrics" description="Workflow execution and job queue statistics" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Play} label="Executions" value={s.executions.total} subtitle={`${s.executions.success} succeeded`} />
        <MetricCard
          icon={Activity}
          label="Running"
          value={s.executions.running}
          color={s.executions.running > 0 ? "text-amber-600" : "text-slate-700"}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Success Rate"
          value={s.executions.total > 0 ? `${Math.round((s.executions.success / s.executions.total) * 100)}%` : "—"}
          color="text-emerald-700"
        />
        <MetricCard
          icon={XCircle}
          label="Failed"
          value={s.executions.failed}
          color={s.executions.failed > 0 ? "text-rose-600" : "text-slate-700"}
        />
      </div>

      {/* Job Queue */}
      <SectionHeader title="Job Queue" description="Background job processing status" />
      <div className="grid grid-cols-5 gap-4 mb-6">
        <MetricCard icon={Clock} label="Pending" value={s.jobs.pending} color={s.jobs.pending > 0 ? "text-amber-600" : "text-slate-700"} />
        <MetricCard icon={Timer} label="Processing" value={s.jobs.processing} color={s.jobs.processing > 0 ? "text-blue-600" : "text-slate-700"} />
        <MetricCard icon={CheckCircle2} label="Completed" value={s.jobs.completed} color="text-emerald-700" />
        <MetricCard icon={XCircle} label="Failed" value={s.jobs.failed} color={s.jobs.failed > 0 ? "text-rose-600" : "text-slate-700"} />
        <MetricCard icon={Layers} label="Total Jobs" value={s.jobs.total} />
      </div>

      {/* Workflows */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <SectionHeader title="Workflows" />
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center py-4">
              <div className="text-[32px] font-extrabold text-[#103b71]">{s.workflows.total}</div>
              <div className="text-[12px] font-semibold text-slate-500 mt-1">Total workflows</div>
            </div>
            <div className="text-center py-4">
              <div className="text-[32px] font-extrabold text-emerald-600">{s.workflows.active}</div>
              <div className="text-[12px] font-semibold text-slate-500 mt-1">Active</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <SectionHeader title="Quick Actions" />
          <div className="space-y-2">
            <button
              onClick={fetchStatus}
              className="w-full h-10 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Refresh status
            </button>
            <button
              onClick={() => api.runScheduledWorkflows().catch(() => {})}
              className="w-full h-10 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Play size={14} /> Run scheduled workflows
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPage;
