import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

export default function RunsPage() {
  return (
    <AppShell
      eyebrow="Runs"
      title="Execution history"
      description="Runs should provide step-by-step visibility into workflow status, node outputs, errors, retries, and final results."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SurfaceCard title="Run timeline" description="Chronological view of workflow attempts." />
        <SurfaceCard title="Live logs" description="Streaming status and node-by-node outputs." tone="mint" />
        <SurfaceCard title="Failures" description="Errors, retries, and debug context." tone="sand" />
      </div>
    </AppShell>
  );
}
