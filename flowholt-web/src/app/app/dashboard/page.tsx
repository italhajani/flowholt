import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

const stats = [
  { label: "Workflow runs", value: "128" },
  { label: "Success rate", value: "94%" },
  { label: "Saved drafts", value: "17" },
  { label: "Connected apps", value: "6" },
];

export default function DashboardPage() {
  return (
    <AppShell
      eyebrow="Dashboard"
      title="Control center"
      description="The dashboard gives users a fast read on workflow health, recent runs, draft activity, and the quickest path into chat-based workflow creation."
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <SurfaceCard
                key={stat.label}
                title={stat.value}
                description={stat.label}
                tone="default"
              />
            ))}
          </div>

          <SurfaceCard
            title="Recent workflows"
            description="A combined list of drafts, active flows, and recently executed automation chains."
          >
            <div className="grid gap-3">
              {[
                "Lead intake autopilot",
                "Client reporting assembly line",
                "Support ticket triage agent",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm text-stone-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-5">
          <SurfaceCard
            title="Quick actions"
            description="The highest-leverage entry points for the product."
            tone="mint"
          >
            <div className="grid gap-3 text-sm text-stone-800">
              <div className="rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-3">
                Create workflow from chat
              </div>
              <div className="rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-3">
                Open visual studio
              </div>
              <div className="rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-3">
                Review latest failures
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Activity feed"
            description="Human-friendly summaries of runs, edits, approvals, and model decisions."
            tone="sand"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              <p>09:40 - Research agent finished enrichment for 48 leads.</p>
              <p>10:10 - Client reporting workflow was updated in Studio.</p>
              <p>10:25 - Support triage workflow failed at Slack API node.</p>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
