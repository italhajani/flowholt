import React from "react";
import { useNavigate } from "react-router-dom";
import { GitBranch, Bot, Play, AlertTriangle, ArrowRight, CheckCircle2, Circle, Clock, Zap, Key, Webhook, TrendingUp, Activity, DollarSign, Cpu, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

/* ── Mock data for a populated dashboard ── */
const recentExecutions = [
  { id: "e1", workflow: "Lead Qualification Pipeline", status: "success" as const, duration: "4.2s", time: "2 min ago", trigger: "webhook" },
  { id: "e2", workflow: "Customer Onboarding Flow", status: "active" as const, duration: "Running…", time: "Just now", trigger: "manual" },
  { id: "e3", workflow: "Invoice Processing Pipeline", status: "failed" as const, duration: "12.1s", time: "15 min ago", trigger: "schedule" },
  { id: "e4", workflow: "Daily Report Generator", status: "success" as const, duration: "8.7s", time: "1 hr ago", trigger: "schedule" },
  { id: "e5", workflow: "Error Alert Handler", status: "success" as const, duration: "1.1s", time: "2 hrs ago", trigger: "webhook" },
];

const recentActivity = [
  { id: "a1", action: "Workflow updated", target: "Lead Qualification Pipeline", actor: "You", time: "10 min ago", icon: GitBranch },
  { id: "a2", action: "Credential rotated", target: "OpenAI Production Key", actor: "Sarah Chen", time: "1 hr ago", icon: Key },
  { id: "a3", action: "Agent deployed", target: "Customer Support Bot", actor: "You", time: "3 hrs ago", icon: Bot },
  { id: "a4", action: "Webhook created", target: "/api/hooks/stripe-events", actor: "You", time: "5 hrs ago", icon: Webhook },
];

const triggerIcons: Record<string, React.ReactNode> = {
  manual: <Play size={10} className="text-zinc-400" />,
  webhook: <Zap size={10} className="text-amber-400" />,
  schedule: <Clock size={10} className="text-blue-400" />,
};

/* ── 7-day execution trend ── */
const executionTrend = [
  { day: "Mon", success: 128, failed: 4 },
  { day: "Tue", success: 145, failed: 2 },
  { day: "Wed", success: 137, failed: 8 },
  { day: "Thu", success: 162, failed: 3 },
  { day: "Fri", success: 151, failed: 5 },
  { day: "Sat", success: 68, failed: 1 },
  { day: "Sun", success: 42, failed: 0 },
];
const trendMax = Math.max(...executionTrend.map(d => d.success + d.failed));

/* ── Top workflows by execution count ── */
const topWorkflows = [
  { name: "Lead Qualification Pipeline", executions: 482, successRate: 96.5, avgDuration: "3.8s" },
  { name: "Invoice Processing Pipeline", executions: 341, successRate: 91.2, avgDuration: "12.1s" },
  { name: "Error Alert Handler", executions: 287, successRate: 99.3, avgDuration: "1.1s" },
  { name: "Customer Onboarding Flow", executions: 156, successRate: 88.4, avgDuration: "8.2s" },
  { name: "Daily Report Generator", executions: 93, successRate: 97.8, avgDuration: "14.6s" },
];

/* ── Cost breakdown ── */
const costBreakdown = {
  total: "$47.20",
  period: "This month",
  items: [
    { label: "AI / LLM", amount: "$28.40", pct: 60, color: "bg-violet-500" },
    { label: "Compute", amount: "$12.80", pct: 27, color: "bg-blue-500" },
    { label: "Storage", amount: "$4.10", pct: 9, color: "bg-emerald-500" },
    { label: "API calls", amount: "$1.90", pct: 4, color: "bg-amber-500" },
  ],
};

/* ── Slow workflow alerts ── */
const slowWorkflows = [
  { name: "Invoice Processing Pipeline", avg: "12.1s", p95: "28.4s", trend: "up" as const },
  { name: "Daily Report Generator", avg: "14.6s", p95: "22.1s", trend: "stable" as const },
];

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-[960px] px-8 py-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-zinc-900">{getGreeting()}</h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Your workspace at a glance — last updated just now.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <MetricCard
          label="Active Workflows"
          value="7"
          delta="+2 this week"
          icon={<GitBranch size={14} className="text-green-500" />}
        />
        <MetricCard
          label="Executions Today"
          value="142"
          delta="+18% vs yesterday"
          icon={<Play size={14} className="text-blue-500" />}
        />
        <MetricCard
          label="Failed (24 h)"
          value="3"
          delta="2.1% error rate"
          icon={<AlertTriangle size={14} className="text-red-500" />}
          danger
        />
        <MetricCard
          label="AI Agents"
          value="4"
          delta="2 active"
          icon={<Bot size={14} className="text-zinc-400" />}
        />
      </div>

      {/* 7-day execution trend */}
      <div className="mb-6 rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-zinc-400" />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">Execution Trend (7 days)</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500" /> Success</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-400" /> Failed</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-[80px]">
          {executionTrend.map((d) => {
            const total = d.success + d.failed;
            const h = Math.max((total / trendMax) * 100, 4);
            const failH = d.failed > 0 ? Math.max((d.failed / total) * h, 2) : 0;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center" style={{ height: `${h}%` }}>
                  {failH > 0 && <div className="w-full rounded-t bg-red-400 transition-all" style={{ height: `${failH}%`, minHeight: 2 }} />}
                  <div className="w-full flex-1 rounded-t bg-green-500 transition-all" style={{ borderRadius: failH > 0 ? "0" : "4px 4px 0 0" }} />
                </div>
                <span className="text-[9px] text-zinc-400">{d.day}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
          <span>Total: {executionTrend.reduce((s, d) => s + d.success + d.failed, 0)} executions</span>
          <span>Avg success rate: {(executionTrend.reduce((s, d) => s + d.success, 0) / executionTrend.reduce((s, d) => s + d.success + d.failed, 0) * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Recent executions mini-table */}
          <section>
            <SectionHeader title="Recent Executions" action="View all" />
            <div className="mt-3 rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs divide-y divide-zinc-50">
              {recentExecutions.map((ex) => (
                <div key={ex.id} onClick={() => navigate(`/executions/${ex.id}`)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50/50 transition-colors cursor-pointer">
                  <StatusDot
                    status={ex.status === "success" ? "success" : ex.status === "failed" ? "failed" : "active"}
                  />
                  <span className="flex-1 text-[13px] font-medium text-zinc-800 truncate">{ex.workflow}</span>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                    {triggerIcons[ex.trigger]}
                  </span>
                  <span className={cn(
                    "text-[12px] font-mono w-16 text-right",
                    ex.status === "active" ? "text-blue-500" : "text-zinc-400"
                  )}>{ex.duration}</span>
                  <span className="text-[11px] text-zinc-300 w-16 text-right">{ex.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Activity feed */}
          <section>
            <SectionHeader title="Recent Activity" action="View audit log" />
            <div className="mt-3 space-y-2">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3 shadow-xs">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50">
                    <act.icon size={13} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-zinc-700">
                      <span className="font-medium text-zinc-800">{act.actor}</span> {act.action}
                    </p>
                    <p className="text-[12px] text-zinc-400 truncate">{act.target}</p>
                  </div>
                  <span className="text-[11px] text-zinc-300 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top workflows */}
          <section>
            <SectionHeader title="Top Workflows (30 days)" action="View all" />
            <div className="mt-3 rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs divide-y divide-zinc-50">
              {topWorkflows.map((wf, i) => (
                <div key={wf.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50/50 transition-colors cursor-pointer">
                  <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-zinc-400 bg-zinc-50">{i + 1}</span>
                  <span className="flex-1 text-[13px] font-medium text-zinc-800 truncate">{wf.name}</span>
                  <span className="text-[11px] font-mono text-zinc-500">{wf.executions}</span>
                  <span className={cn("text-[10px] font-medium rounded px-1.5 py-0.5", wf.successRate >= 95 ? "bg-green-50 text-green-600" : wf.successRate >= 90 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600")}>
                    {wf.successRate}%
                  </span>
                  <span className="text-[10px] text-zinc-400 w-12 text-right">{wf.avgDuration}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Slow workflow alerts */}
          {slowWorkflows.length > 0 && (
            <section>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <span className="text-[12px] font-semibold text-amber-800">Slow Workflows Detected</span>
                </div>
                <div className="space-y-2">
                  {slowWorkflows.map((sw) => (
                    <div key={sw.name} className="flex items-center gap-2 text-[11px]">
                      <span className="flex-1 text-amber-700 font-medium truncate">{sw.name}</span>
                      <span className="text-amber-600">avg {sw.avg}</span>
                      <span className="text-amber-500">p95 {sw.p95}</span>
                      {sw.trend === "up" && <TrendingUp size={10} className="text-red-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <section>
            <SectionHeader title="Quick Actions" />
            <div className="mt-3 space-y-1.5">
              {[
                { icon: GitBranch, label: "New Workflow", color: "text-green-500 bg-green-50", path: "/workflows" },
                { icon: Key, label: "Add Credential", color: "text-amber-500 bg-amber-50", path: "/vault" },
                { icon: Bot, label: "Create Agent", color: "text-zinc-600 bg-zinc-100", path: "/ai-agents" },
                { icon: Webhook, label: "Set Up Webhook", color: "text-blue-500 bg-blue-50", path: "/webhooks" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex w-full items-center gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3 shadow-xs hover:border-zinc-200 hover:shadow-sm transition-all duration-150"
                >
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", action.color)}>
                    <action.icon size={13} />
                  </div>
                  <span className="text-[13px] font-medium text-zinc-700">{action.label}</span>
                  <ArrowRight size={12} className="ml-auto text-zinc-300" />
                </button>
              ))}
            </div>
          </section>

          {/* Setup checklist */}
          <section>
            <SectionHeader title="Setup Checklist" />
            <div className="mt-3 rounded-lg border border-zinc-100 bg-white overflow-hidden divide-y divide-zinc-50">
              <CheckItem label="Create your first workflow" done />
              <CheckItem label="Connect an AI provider" done />
              <CheckItem label="Add your first credential" done />
              <CheckItem label="Configure a webhook" done={false} />
              <div className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: "75%" }} />
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">3/4</span>
                </div>
              </div>
            </div>
          </section>

          {/* System health mini */}
          <section>
            <SectionHeader title="System Health" />
            <div className="mt-3 rounded-lg border border-zinc-100 bg-white p-4 shadow-xs space-y-2.5">
              {[
                { label: "Runtime", status: "healthy" as const },
                { label: "Queue", status: "active" as const },
                { label: "API", status: "healthy" as const },
                { label: "Workers", status: "warning" as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-600">{item.label}</span>
                  <StatusDot status={item.status} label={item.status === "active" ? "4 queued" : item.status === "warning" ? "1 idle" : "operational"} />
                </div>
              ))}
            </div>
          </section>

          {/* Cost breakdown */}
          <section>
            <SectionHeader title="Cost Breakdown" />
            <div className="mt-3 rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[22px] font-semibold text-zinc-800">{costBreakdown.total}</span>
                <span className="text-[10px] text-zinc-400">{costBreakdown.period}</span>
              </div>
              {/* Stacked bar */}
              <div className="flex h-2 rounded-full overflow-hidden mb-3">
                {costBreakdown.items.map((item) => (
                  <div key={item.label} className={cn("transition-all", item.color)} style={{ width: `${item.pct}%` }} />
                ))}
              </div>
              <div className="space-y-1.5">
                {costBreakdown.items.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-[11px]">
                    <span className={cn("h-2 w-2 rounded-sm flex-shrink-0", item.color)} />
                    <span className="flex-1 text-zinc-600">{item.label}</span>
                    <span className="font-medium text-zinc-700">{item.amount}</span>
                    <span className="text-zinc-400 w-8 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label, value, icon, danger, delta,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  danger?: boolean;
  delta?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className={`text-[26px] font-semibold leading-none ${danger && value !== "—" ? "text-red-600" : "text-zinc-900"}`}>
        {value}
      </p>
      {delta && <p className="mt-1.5 text-[11px] text-zinc-400">{delta}</p>}
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">{title}</h3>
      {action && (
        <button className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors">
          {action} <ArrowRight size={10} />
        </button>
      )}
    </div>
  );
}

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {done
        ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
        : <Circle size={15} className="text-zinc-200 flex-shrink-0" />
      }
      <span className={`text-[13px] ${done ? "line-through text-zinc-400" : "text-zinc-700"}`}>
        {label}
      </span>
      {done && <Badge variant="success" className="ml-auto">Done</Badge>}
    </div>
  );
}
