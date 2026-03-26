import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { assessPlatformReadiness } from "@/lib/platform/readiness";

const statusTone = {
  ok: "bg-emerald-100 text-emerald-800",
  warn: "bg-amber-100 text-amber-800",
  error: "bg-rose-100 text-rose-800",
} as const;

export default async function SettingsPage() {
  const readiness = await assessPlatformReadiness();

  return (
    <AppShell
      eyebrow="Settings"
      title="Workspace settings"
      description="Profile details, workspace controls, usage limits, billing state, and provider keys belong here."
    >
      <div className="space-y-5">
        <SurfaceCard
          title="Platform readiness"
          description="One place to confirm environment variables and backend service health before building more UI."
          tone={readiness.overall === "ready" ? "mint" : "sand"}
        >
          <div className="space-y-3">
            {readiness.checks.map((check) => (
              <div key={check.id} className="rounded-2xl border border-stone-900/10 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-stone-900">{check.label}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusTone[check.status]}`}
                  >
                    {check.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-600">{check.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-stone-400">
            Last checked: {new Date(readiness.generated_at).toLocaleString()}
          </p>
        </SurfaceCard>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SurfaceCard title="Profile" description="Identity, avatar, and personal preferences." />
          <SurfaceCard title="Workspace" description="Team, project, and environment settings." tone="mint" />
          <SurfaceCard title="API + billing" description="Provider keys, spend limits, and deployment metadata." tone="sand" />
        </div>
      </div>
    </AppShell>
  );
}
