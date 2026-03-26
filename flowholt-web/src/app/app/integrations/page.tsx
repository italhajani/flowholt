import { createIntegrationConnection, deleteIntegrationConnection } from "@/app/app/integrations/actions";
import { AppShell } from "@/components/app-shell";
import { IntegrationTestButton } from "@/components/integration-test-button";
import { SurfaceCard } from "@/components/surface-card";
import { getIntegrationsSnapshot } from "@/lib/flowholt/data";

const providerTemplates = [
  {
    provider: "groq",
    title: "Groq agent connection",
    description: "Store a reusable Groq profile for agent nodes and future agent presets.",
    config: {
      model: "llama-3.3-70b-versatile",
      base_url: "https://api.groq.com/openai/v1",
    },
    secrets: {
      api_key: "",
    },
  },
  {
    provider: "http",
    title: "HTTP request connection",
    description: "Create a reusable API profile for generic HTTP tool nodes.",
    config: {
      base_url: "https://httpbin.org",
      default_method: "POST",
      default_headers: {},
    },
    secrets: {
      bearer_token: "",
    },
  },
  {
    provider: "webhook",
    title: "Webhook connection",
    description: "Track inbound or outbound webhook setups for trigger and delivery nodes.",
    config: {
      path: "/flowholt-demo",
      method: "POST",
      direction: "inbound",
    },
    secrets: {
      api_key: "",
    },
  },
] as const;

type IntegrationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function secretKeys(secrets: Record<string, unknown>) {
  return Object.keys(secrets).filter((key) => {
    const value = secrets[key];
    return value !== undefined && value !== null && String(value).length > 0;
  });
}

export default async function IntegrationsPage({ searchParams }: IntegrationsPageProps) {
  const snapshot = await getIntegrationsSnapshot();
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);

  const providerCounts = {
    groq: snapshot.integrations.filter((item) => item.provider === "groq").length,
    http: snapshot.integrations.filter((item) => item.provider === "http").length,
    webhook: snapshot.integrations.filter((item) => item.provider === "webhook").length,
  };

  return (
    <AppShell
      eyebrow="Integrations"
      title="Connected tools"
      description="Manage reusable connection profiles for agents, HTTP tools, and webhook-based workflows."
    >
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          {message ? (
            <div className="rounded-[1.5rem] bg-[#eef4ef] px-5 py-4 text-sm text-emerald-900">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[1.5rem] bg-[#f7ede2] px-5 py-4 text-sm text-amber-950">
              {error}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-3">
            <SurfaceCard title={String(providerCounts.groq)} description="Groq connections" />
            <SurfaceCard title={String(providerCounts.http)} description="HTTP connections" tone="mint" />
            <SurfaceCard title={String(providerCounts.webhook)} description="Webhook connections" tone="sand" />
          </div>

          {!snapshot.schemaReady ? (
            <SurfaceCard
              title="Integration schema needed"
              description="Run the next Supabase SQL migration to unlock saved integrations."
              tone="sand"
            >
              <div className="space-y-3 text-sm leading-6 text-stone-700">
                <p>
                  Run: <span className="font-medium">supabase/migrations/20260326_0002_integration_connections.sql</span>
                </p>
                <p>Then refresh this page.</p>
              </div>
            </SurfaceCard>
          ) : null}

          {snapshot.schemaReady && !snapshot.activeWorkspace ? (
            <SurfaceCard
              title="Create a workspace first"
              description="Connections belong to a workspace so they can be reused safely in its workflows."
              tone="sand"
            />
          ) : null}

          <SurfaceCard
            title="Saved connections"
            description="These are now testable directly from the UI, so you can confirm credentials before using them in workflows."
          >
            <div className="grid gap-3">
              {snapshot.integrations.length ? (
                snapshot.integrations.map((integration) => {
                  const savedSecretKeys = secretKeys(integration.secrets);
                  return (
                    <div
                      key={integration.id}
                      className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-950">{integration.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                            {integration.provider} - {integration.status}
                          </p>
                          <p className="mt-2 text-sm text-stone-600">{integration.description || "No description"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <IntegrationTestButton connectionId={integration.id} />
                          <form action={deleteIntegrationConnection}>
                            <input type="hidden" name="connectionId" value={integration.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Config</p>
                          <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-stone-700">
                            {JSON.stringify(integration.config, null, 2)}
                          </pre>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Secrets stored</p>
                          <p className="mt-2 text-sm text-stone-700">
                            {savedSecretKeys.length ? savedSecretKeys.join(", ") : "No secret fields filled yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  No integration connections yet. Create one from the forms on the right.
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-5 self-start">
          {providerTemplates.map((template) => (
            <SurfaceCard
              key={template.provider}
              title={template.title}
              description={template.description}
              tone={template.provider === "groq" ? "default" : template.provider === "http" ? "mint" : "sand"}
            >
              {snapshot.activeWorkspace ? (
                <form action={createIntegrationConnection} className="space-y-4">
                  <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                  <input type="hidden" name="provider" value={template.provider} />
                  <input type="hidden" name="status" value="active" />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Label</label>
                    <input
                      name="label"
                      defaultValue={`My ${template.provider} connection`}
                      className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Description</label>
                    <textarea
                      name="description"
                      defaultValue={template.description}
                      rows={3}
                      className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Config JSON</label>
                    <textarea
                      name="config"
                      defaultValue={JSON.stringify(template.config, null, 2)}
                      rows={7}
                      className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 font-mono text-xs leading-6 outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Secrets JSON</label>
                    <textarea
                      name="secrets"
                      defaultValue={JSON.stringify(template.secrets, null, 2)}
                      rows={5}
                      className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 font-mono text-xs leading-6 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                  >
                    Save connection
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl bg-white/70 px-4 py-4 text-sm text-stone-500">
                  Create a workspace first to save connections.
                </div>
              )}
            </SurfaceCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
