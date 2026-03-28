import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { getMonitoringSnapshot } from "@/lib/flowholt/data";

function formatDuration(ms: number) {
  if (!ms) {
    return "0s";
  }

  if (ms >= 60_000) {
    return `${Math.round(ms / 1000 / 60)}m`;
  }

  return `${Math.round(ms / 1000)}s`;
}

function securityTone(status: "ok" | "warn" | "error") {
  if (status === "error") {
    return "text-red-700 bg-red-50 border-red-200";
  }
  if (status === "warn") {
    return "text-amber-800 bg-amber-50 border-amber-200";
  }
  return "text-emerald-700 bg-emerald-50 border-emerald-200";
}

export default async function MonitoringPage() {
  const snapshot = await getMonitoringSnapshot();

  const stats = [
    { label: "Queue depth", value: String(snapshot.queueDepth) },
    { label: "Processing jobs", value: String(snapshot.processingJobs) },
    { label: "Stuck runs", value: String(snapshot.stuckRuns) },
    { label: "Stuck jobs", value: String(snapshot.stuckJobs) },
    { label: "Run success 24h", value: `${snapshot.runSuccessRate24h}%` },
    { label: "Failed runs 24h", value: String(snapshot.failedRuns24h) },
    { label: "Avg run duration", value: formatDuration(snapshot.avgRunDurationMs24h) },
    { label: "Avg node duration", value: formatDuration(snapshot.avgNodeDurationMs24h) },
  ];

  return (
    <AppShell
      eyebrow="Monitoring"
      title="Operations monitor"
      description="A cleaner production view for queue health, failures, request pressure, and security posture across the workspace."
    >
      <div className="space-y-5">
        <div className="flowholt-window overflow-hidden">
          <div className="flowholt-window-bar">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Operations</p>
              <p className="mt-1 text-sm font-medium text-stone-900">Health and reliability overview</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flowholt-chip">{snapshot.runSuccessRate24h}% success</span>
              <span className="flowholt-chip">{snapshot.queueDepth} queued</span>
            </div>
          </div>

          <div className="p-5 xl:p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <SurfaceCard key={stat.label} title={stat.value} description={stat.label} tone="default" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.22fr_0.78fr]">
          <SurfaceCard
            title="Security posture"
            description="Protected endpoints and deploy-time safety checks in one cleaner status wall."
            tone="mint"
          >
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                {snapshot.securitySummary.ok} ok
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
                {snapshot.securitySummary.warn} warnings
              </span>
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                {snapshot.securitySummary.error} errors
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {snapshot.securityChecks.map((item) => (
                <div key={item.key} className={`rounded-[1.3rem] border px-4 py-3 text-sm leading-6 ${securityTone(item.status)}`}>
                  <p className="font-medium">{item.label}</p>
                  <p className="mt-1 text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Rate limit pressure"
            description="The busiest protected endpoints in the last 24 hours."
            tone="sand"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              {snapshot.rateLimitEvents24h.length ? (
                snapshot.rateLimitEvents24h.map((item: (typeof snapshot.rateLimitEvents24h)[number]) => (
                  <div key={item.scope} className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                    <p className="font-medium text-stone-900">{item.scope}</p>
                    <p className="mt-1">Requests counted: {item.requestCount}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.25rem] bg-white/88 px-4 py-3">No recent rate-limit activity yet.</p>
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <SurfaceCard
            title="Top failing nodes"
            description="The most failure-prone workflow steps in the last 7 days."
            tone="mint"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              {snapshot.topFailingNodes7d.length ? (
                snapshot.topFailingNodes7d.map((item: (typeof snapshot.topFailingNodes7d)[number]) => (
                  <div key={item.nodeLabel} className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                    <p className="font-medium text-stone-900">{item.nodeLabel}</p>
                    <p className="mt-1">Failures: {item.failures}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.25rem] bg-white/88 px-4 py-3">No failed nodes recorded in the last 7 days.</p>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Audit activity"
            description="Sensitive workspace actions recorded in the last 7 days."
            tone="default"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              {snapshot.recentAuditActions7d.length ? (
                snapshot.recentAuditActions7d.map((item: (typeof snapshot.recentAuditActions7d)[number]) => (
                  <div key={item.action} className="rounded-[1.25rem] bg-[#fbf8f3] px-4 py-3">
                    <p className="font-medium text-stone-900">{item.action}</p>
                    <p className="mt-1">Count: {item.count}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.25rem] bg-[#fbf8f3] px-4 py-3">No audit events recorded yet.</p>
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
