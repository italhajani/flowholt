import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

export default function SettingsPage() {
  return (
    <AppShell
      eyebrow="Settings"
      title="Workspace settings"
      description="Profile details, workspace controls, usage limits, billing state, and provider keys belong here."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SurfaceCard title="Profile" description="Identity, avatar, and personal preferences." />
        <SurfaceCard title="Workspace" description="Team, project, and environment settings." tone="mint" />
        <SurfaceCard title="API + billing" description="Provider keys, spend limits, and deployment metadata." tone="sand" />
      </div>
    </AppShell>
  );
}
