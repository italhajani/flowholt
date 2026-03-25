import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

export default function WorkflowsPage() {
  return (
    <AppShell
      eyebrow="Workflows"
      title="Workflow library"
      description="This area holds all saved flows, drafts, templates, schedules, and version history entry points."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SurfaceCard title="All workflows" description="Browse every workflow in the workspace." />
        <SurfaceCard title="Templates" description="Starter patterns for common automations." tone="mint" />
        <SurfaceCard title="Scheduled flows" description="Time-based and recurring executions." tone="sand" />
      </div>
    </AppShell>
  );
}
