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

export default async function MonitoringPage() {
  const snapshot = await getMonitoringSnapshot();

  const stats = [
    { label: "Queue depth", value: String(snapshot.queueDepth) },
    { label: "Processing jobs", value: String(snapshot.processingJobs) },
    { label: "Stuck runs", value: String(snapshot.stuckRuns) },
    { label: "Stuck jobs", value: String(snapshot.stuckJobs) },
    { label: "Run success 24h", value: `${snapshot.runSuccessRate24h}%` },
    { label: "Failed runs 24h", value: String(snapshot.failedRuns24h) },
    { label: "Avg run duration 24h", value: formatDuration(snapshot.avgRunDurationMs24h) },
    { label: "Avg node duration 24h", value: formatDuration(snapshot.avgNodeDurationMs24h) },
  ];

  return (
    <AppShell
      eyebrow="Monitoring"
      title="Operations monitor"
      description="A first production view for queue health, failure trends, request pressure, and workspace reliability."
    >
      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <SurfaceCard key={stat.label} title={stat.value} description={stat.label} tone="default" />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <SurfaceCard
            title="Rate limit pressure"
            description="The busiest protected endpoints in the last 24 hours."
            tone="sand"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              {snapshot.rateLimitEvents24h.length ? (
                snapshot.rateLimitEvents24h.map((item: (typeof snapshot.rateLimitEvents24h)[number]) => (
                  <div key={item.scope} className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="font-medium text-stone-900">{item.scope}</p>
                    <p className="mt-1">Requests counted: {item.requestCount}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white/80 px-4 py-3">No recent rate-limit activity yet.</p>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Top failing nodes"
            description="The most failure-prone workflow steps in the last 7 days."
            tone="mint"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              {snapshot.topFailingNodes7d.length ? (
                snapshot.topFailingNodes7d.map((item: (typeof snapshot.topFailingNodes7d)[number]) => (
                  <div key={item.nodeLabel} className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="font-medium text-stone-900">{item.nodeLabel}</p>
                    <p className="mt-1">Failures: {item.failures}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white/80 px-4 py-3">No failed nodes recorded in the last 7 days.</p>
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
                  <div key={item.action} className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="font-medium text-stone-900">{item.action}</p>
                    <p className="mt-1">Count: {item.count}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-stone-50 px-4 py-3">No audit events recorded yet.</p>
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}

