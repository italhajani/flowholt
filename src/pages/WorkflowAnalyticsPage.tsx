import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle,
  AlertTriangle, Zap, Activity, Filter, Calendar, ArrowUpRight,
  ArrowDownRight, Minus, Layers, Flame, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalyticsOverview, useExecutionTimeline } from "@/hooks/useApi";

/* ── Mock analytics data ── */
const overviewStats = [
  { label: "Total Executions", value: "12,847", change: "+18%", trend: "up" as const, icon: Zap, color: "text-blue-600 bg-blue-50" },
  { label: "Success Rate", value: "94.2%", change: "+2.1%", trend: "up" as const, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  { label: "Avg Duration", value: "3.2s", change: "-0.4s", trend: "up" as const, icon: Clock, color: "text-violet-600 bg-violet-50" },
  { label: "Error Rate", value: "5.8%", change: "-2.1%", trend: "up" as const, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
];

const dailyExecutions = [
  { day: "Mon", success: 420, failed: 28, total: 448 },
  { day: "Tue", success: 510, failed: 15, total: 525 },
  { day: "Wed", success: 380, failed: 42, total: 422 },
  { day: "Thu", success: 590, failed: 31, total: 621 },
  { day: "Fri", success: 470, failed: 22, total: 492 },
  { day: "Sat", success: 180, failed: 8, total: 188 },
  { day: "Sun", success: 150, failed: 5, total: 155 },
];

const nodeHeatmap = [
  { name: "Typeform Trigger", executions: 2100, avgMs: 120, errors: 5, score: 0.98 },
  { name: "Clearbit Enrich", executions: 2100, avgMs: 850, errors: 142, score: 0.93 },
  { name: "GPT-4o Score", executions: 1958, avgMs: 2100, errors: 89, score: 0.95 },
  { name: "IF Score > 70", executions: 1869, avgMs: 12, errors: 0, score: 1.0 },
  { name: "HubSpot Create", executions: 1205, avgMs: 450, errors: 67, score: 0.94 },
  { name: "Slack Notify", executions: 1205, avgMs: 230, errors: 12, score: 0.99 },
  { name: "Nurture List", executions: 664, avgMs: 320, errors: 8, score: 0.99 },
  { name: "Error Handler", executions: 310, avgMs: 45, errors: 0, score: 1.0 },
];

const errorHotspots = [
  { node: "Clearbit Enrich", errorType: "Rate Limit (429)", count: 89, lastOccurred: "2h ago" },
  { node: "GPT-4o Score", errorType: "Timeout", count: 52, lastOccurred: "4h ago" },
  { node: "HubSpot Create", errorType: "Duplicate Contact", count: 41, lastOccurred: "1h ago" },
  { node: "Clearbit Enrich", errorType: "Invalid Email", count: 28, lastOccurred: "6h ago" },
  { node: "GPT-4o Score", errorType: "Token Limit", count: 15, lastOccurred: "12h ago" },
];

const throughputByHour = [
  { hour: "00", value: 12 }, { hour: "02", value: 8 }, { hour: "04", value: 5 },
  { hour: "06", value: 15 }, { hour: "08", value: 45 }, { hour: "10", value: 82 },
  { hour: "12", value: 95 }, { hour: "14", value: 88 }, { hour: "16", value: 72 },
  { hour: "18", value: 48 }, { hour: "20", value: 30 }, { hour: "22", value: 18 },
];

const maxThroughput = Math.max(...throughputByHour.map(h => h.value));
const maxDaily = Math.max(...dailyExecutions.map(d => d.total));

type TimeRange = "24h" | "7d" | "30d" | "90d";

export function WorkflowAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { data: analyticsData } = useAnalyticsOverview();
  const { data: timelineData } = useExecutionTimeline(timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90);

  const stats = useMemo(() => {
    if (analyticsData) {
      return [
        { label: "Total Executions", value: String(analyticsData.total_executions ?? "12,847"), change: "+18%", trend: "up" as const, icon: Zap, color: "text-blue-600 bg-blue-50" },
        { label: "Success Rate", value: analyticsData.success_rate ? `${analyticsData.success_rate}%` : "94.2%", change: "+2.1%", trend: "up" as const, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
        { label: "Avg Duration", value: analyticsData.avg_duration || "3.2s", change: "-0.4s", trend: "up" as const, icon: Clock, color: "text-violet-600 bg-violet-50" },
        { label: "Error Rate", value: analyticsData.error_rate ? `${analyticsData.error_rate}%` : "5.8%", change: "-2.1%", trend: "up" as const, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
      ];
    }
    return overviewStats;
  }, [analyticsData]);

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Workflow Analytics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Lead Scoring Pipeline — Performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
            {(["24h", "7d", "30d", "90d"] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  timeRange === range ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50">
            <Calendar size={12} />
            Custom
          </button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(stat => {
          const TrendIcon = stat.trend === "up" ? (stat.label.includes("Error") ? ArrowDownRight : ArrowUpRight) : (stat.label.includes("Error") ? ArrowUpRight : ArrowDownRight);
          const trendColor = stat.label.includes("Error")
            ? (stat.change.startsWith("-") ? "text-emerald-600" : "text-red-500")
            : (stat.change.startsWith("+") ? "text-emerald-600" : "text-red-500");
          return (
            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={cn("rounded-lg p-2", stat.color.split(" ")[1])}>
                  <stat.icon size={16} className={stat.color.split(" ")[0]} />
                </span>
                <span className={cn("flex items-center gap-0.5 text-xs font-medium", trendColor)}>
                  <TrendIcon size={12} />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Execution chart */}
        <div className="col-span-2 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-700">Execution Volume</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Success
              </span>
              <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-red-400" /> Failed
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {dailyExecutions.map(day => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5">
                  <div
                    className="w-full rounded-t-sm bg-red-400 transition-all"
                    style={{ height: `${(day.failed / maxDaily) * 140}px` }}
                  />
                  <div
                    className="w-full rounded-t-sm bg-emerald-400 transition-all"
                    style={{ height: `${(day.success / maxDaily) * 140}px` }}
                  />
                </div>
                <span className="text-[9px] text-zinc-400">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Throughput by hour */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-700">Hourly Throughput</span>
          </div>
          <div className="flex items-end gap-1 h-40">
            {throughputByHour.map(h => (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-blue-400 transition-all hover:bg-blue-500"
                  style={{ height: `${(h.value / maxThroughput) * 130}px` }}
                  title={`${h.hour}:00 — ${h.value} executions`}
                />
                {Number(h.hour) % 4 === 0 && (
                  <span className="text-[7px] text-zinc-400">{h.hour}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Node performance heatmap */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-700">Node Performance</span>
            </div>
            <span className="text-[10px] text-zinc-400">Click to drill down</span>
          </div>
          <div className="space-y-1.5">
            <div className="grid grid-cols-12 gap-1 text-[8px] text-zinc-400 uppercase tracking-wider px-2 mb-1">
              <span className="col-span-4">Node</span>
              <span className="col-span-2 text-right">Runs</span>
              <span className="col-span-2 text-right">Avg ms</span>
              <span className="col-span-2 text-right">Errors</span>
              <span className="col-span-2 text-right">Health</span>
            </div>
            {nodeHeatmap.map(node => {
              const healthColor = node.score >= 0.98 ? "bg-emerald-500" : node.score >= 0.95 ? "bg-emerald-400" : node.score >= 0.90 ? "bg-amber-400" : "bg-red-400";
              const durationColor = node.avgMs > 1500 ? "text-red-500" : node.avgMs > 500 ? "text-amber-600" : "text-emerald-600";
              return (
                <button
                  key={node.name}
                  onClick={() => setSelectedNode(selectedNode === node.name ? null : node.name)}
                  className={cn(
                    "grid grid-cols-12 gap-1 w-full items-center rounded-lg px-2 py-2 text-left transition-colors",
                    selectedNode === node.name ? "bg-blue-50 border border-blue-200" : "hover:bg-zinc-50"
                  )}
                >
                  <span className="col-span-4 text-[11px] font-medium text-zinc-700 truncate">{node.name}</span>
                  <span className="col-span-2 text-[10px] text-zinc-500 text-right">{node.executions.toLocaleString()}</span>
                  <span className={cn("col-span-2 text-[10px] font-medium text-right", durationColor)}>{node.avgMs}ms</span>
                  <span className="col-span-2 text-[10px] text-zinc-500 text-right">{node.errors}</span>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <div className="w-12 h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div className={cn("h-full rounded-full", healthColor)} style={{ width: `${node.score * 100}%` }} />
                    </div>
                    <span className="text-[8px] text-zinc-400">{(node.score * 100).toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error hotspots */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-red-500" />
            <span className="text-sm font-semibold text-zinc-700">Error Hotspots</span>
          </div>
          <div className="space-y-2">
            {errorHotspots.map((err, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3 hover:bg-zinc-50 transition-colors">
                <div className={cn(
                  "rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold flex-shrink-0",
                  i === 0 ? "bg-red-100 text-red-600" : i < 3 ? "bg-amber-100 text-amber-600" : "bg-zinc-100 text-zinc-500"
                )}>
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-zinc-700">{err.node}</p>
                  <p className="text-[10px] text-red-500 mt-0.5">{err.errorType}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-zinc-400">{err.count} occurrences</span>
                    <span className="text-[9px] text-zinc-300">·</span>
                    <span className="text-[9px] text-zinc-400">Last: {err.lastOccurred}</span>
                  </div>
                </div>
                <div className="w-16 h-6 flex items-end gap-px">
                  {[0.3, 0.5, 0.8, 1.0, 0.7, 0.4, 0.2].map((v, j) => (
                    <div
                      key={j}
                      className="flex-1 rounded-t-sm bg-red-300"
                      style={{ height: `${v * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Error distribution pie mock */}
          <div className="mt-4 pt-3 border-t border-zinc-100">
            <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Error Distribution</p>
            <div className="flex gap-1">
              {[
                { label: "Rate Limit", pct: 38, color: "bg-red-400" },
                { label: "Timeout", pct: 25, color: "bg-amber-400" },
                { label: "Duplicate", pct: 20, color: "bg-blue-400" },
                { label: "Other", pct: 17, color: "bg-zinc-300" },
              ].map(slice => (
                <div
                  key={slice.label}
                  className={cn("rounded-sm h-4", slice.color)}
                  style={{ flex: slice.pct }}
                  title={`${slice.label}: ${slice.pct}%`}
                />
              ))}
            </div>
            <div className="flex gap-4 mt-1.5">
              {[
                { label: "Rate Limit", color: "bg-red-400", pct: 38 },
                { label: "Timeout", color: "bg-amber-400", pct: 25 },
                { label: "Duplicate", color: "bg-blue-400", pct: 20 },
                { label: "Other", color: "bg-zinc-300", pct: 17 },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1 text-[8px] text-zinc-500">
                  <span className={cn("h-1.5 w-1.5 rounded-full", l.color)} /> {l.label} ({l.pct}%)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
