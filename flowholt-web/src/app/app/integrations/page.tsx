import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

export default function IntegrationsPage() {
  return (
    <AppShell
      eyebrow="Integrations"
      title="Connected tools"
      description="Integrations cover OAuth apps, API keys, webhooks, and external service credentials used during workflow execution."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SurfaceCard title="OAuth apps" description="Google, Slack, Notion, GitHub, and similar services." />
        <SurfaceCard title="API keys" description="Managed provider credentials and per-workspace secrets." tone="mint" />
        <SurfaceCard title="Webhooks" description="Inbound triggers and outbound notifications." tone="sand" />
      </div>
    </AppShell>
  );
}
