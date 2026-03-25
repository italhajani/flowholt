import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

export default function AgentsPage() {
  return (
    <AppShell
      eyebrow="Agents"
      title="Agent library"
      description="Agent definitions should live separately from workflows so they can be reused, tuned, and versioned across the platform."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SurfaceCard title="Roles" description="Researcher, planner, writer, operator, reviewer." />
        <SurfaceCard title="Prompt profiles" description="System instructions, goals, guardrails, and handoff rules." tone="mint" />
        <SurfaceCard title="Memory settings" description="Short-term context, retrieval hooks, and file access." tone="sand" />
      </div>
    </AppShell>
  );
}
