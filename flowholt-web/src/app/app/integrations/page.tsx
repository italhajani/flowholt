import {
  createIntegrationConnection,
  deleteIntegrationConnection,
  rotateIntegrationSecrets,
} from "@/app/app/integrations/actions";
import { AppShell } from "@/components/app-shell";
import { IntegrationTestButton } from "@/components/integration-test-button";
import { SurfaceCard } from "@/components/surface-card";
import { getIntegrationsSnapshot } from "@/lib/flowholt/data";
import { buildToolMarketplace, buildToolMarketplaceSummary } from "@/lib/flowholt/tool-marketplace";

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
    description: "Create a reusable API profile for HTTP request, CRM, spreadsheet, and knowledge lookup tool presets.",
    config: {
      base_url: "https://httpbin.org",
      default_method: "POST",
      default_headers: {
        Accept: "application/json",
      },
      api_key_header: "x-api-key",
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

const vendorQuickStarts = [
  {
    title: "HubSpot CRM",
    provider: "http",
    description: "Best fit for CRM sync and lead intake packs.",
    config: {
      base_url: "https://api.hubapi.com",
      default_method: "POST",
      default_headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  },
  {
    title: "Notion knowledge",
    provider: "http",
    description: "Good for knowledge search and support-resolution flows.",
    config: {
      base_url: "https://api.notion.com/v1",
      default_method: "POST",
      default_headers: {
        Accept: "application/json",
        "Notion-Version": "2022-06-28",
      },
    },
  },
  {
    title: "Google Sheets bridge",
    provider: "http",
    description: "Useful for spreadsheet ops and content/reporting handoffs.",
    config: {
      base_url: "https://sheets.googleapis.com/v4/spreadsheets",
      default_method: "POST",
      default_headers: {
        Accept: "application/json",
      },
    },
  },
  {
    title: "Slack delivery webhook",
    provider: "webhook",
    description: "Helpful for delivery and support callback flows.",
    config: {
      direction: "outbound",
      url: "https://hooks.slack.com/services/your/path",
      method: "POST",
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
  const marketplaceCategories = buildToolMarketplace(snapshot.integrations);
  const marketplaceSummary = buildToolMarketplaceSummary(marketplaceCategories);

  return (
    <AppShell
      eyebrow="Integrations"
      title="Connections and vendor kits"
      description="A cleaner setup area for reusable provider connections, quick-start vendor profiles, and resource readiness for the assistant."
    >
      <div className="space-y-5">
        {message ? (
          <div className="rounded-[1.5rem] bg-[#eef5ef] px-5 py-4 text-sm text-emerald-900">{message}</div>
        ) : null}
        {error ? (
          <div className="rounded-[1.5rem] bg-[#f8eee4] px-5 py-4 text-sm text-amber-950">{error}</div>
        ) : null}

        <div className="flowholt-window overflow-hidden">
          <div className="flowholt-window-bar">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Resource setup</p>
              <p className="mt-1 text-sm font-medium text-stone-900">Reusable connections for packs, tools, and agents</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flowholt-chip">{marketplaceSummary.readyKits} ready</span>
              <span className="flowholt-chip">{marketplaceSummary.workflowPacks} workflow packs</span>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.06fr)_420px]">
            <div className="border-b border-stone-900/8 p-5 xl:border-b-0 xl:border-r xl:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <SurfaceCard title={String(providerCounts.groq)} description="Groq" />
                <SurfaceCard title={String(providerCounts.http)} description="HTTP" tone="mint" />
                <SurfaceCard title={String(providerCounts.webhook)} description="Webhook" tone="sand" />
              </div>

              {!snapshot.schemaReady ? (
                <div className="mt-5 rounded-[1.6rem] border border-[#ead7c8] bg-[#fff8f2] p-5 text-sm leading-7 text-stone-700">
                  <p className="font-medium text-stone-900">Integration schema needed</p>
                  <p className="mt-2">
                    Run <span className="font-medium">supabase/migrations/20260326_0002_integration_connections.sql</span>, then refresh.
                  </p>
                </div>
              ) : null}

              {snapshot.schemaReady && !snapshot.activeWorkspace ? (
                <div className="mt-5 rounded-[1.6rem] border border-dashed border-stone-900/15 bg-white/75 px-4 py-6 text-sm text-stone-500">
                  Create a workspace first. Connections belong to a workspace so workflows can reuse them safely.
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                {snapshot.integrations.length ? (
                  snapshot.integrations.map((integration) => {
                    const savedSecretKeys = secretKeys(integration.secrets);
                    return (
                      <div
                        key={integration.id}
                        className="rounded-[1.7rem] border border-stone-900/10 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-stone-950">{integration.label}</p>
                              <span className="rounded-full border border-stone-900/10 bg-stone-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                                {integration.provider}
                              </span>
                              <span className="rounded-full border border-stone-900/10 bg-stone-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                                {integration.status}
                              </span>
                            </div>
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
                          <div className="rounded-[1.25rem] bg-[#fbf8f3] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Config</p>
                            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-stone-700">
                              {JSON.stringify(integration.config, null, 2)}
                            </pre>
                          </div>
                          <div className="rounded-[1.25rem] bg-[#fbf8f3] px-4 py-3 text-sm text-stone-700">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Secrets stored</p>
                            <p className="mt-2">{savedSecretKeys.length ? savedSecretKeys.join(", ") : "No secret fields filled yet"}</p>
                            <p className="mt-3 text-xs leading-5 text-stone-500">
                              Secret values stay hidden. Use rotate below when you need to replace them.
                            </p>
                          </div>
                        </div>

                        <form action={rotateIntegrationSecrets} className="mt-4 rounded-[1.35rem] bg-[#fbf8f3] px-4 py-4">
                          <input type="hidden" name="connectionId" value={integration.id} />
                          <div className="grid gap-3">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-stone-700">Rotate secrets JSON</label>
                              <textarea
                                name="secrets"
                                rows={4}
                                placeholder='{"api_key":"new-secret-here"}'
                                className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 font-mono text-xs leading-6 outline-none"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-stone-700">Rotation note</label>
                              <input
                                name="note"
                                placeholder="Example: rotated after provider key refresh"
                                className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              className="flowholt-secondary-button w-full px-5 py-3 text-sm font-medium"
                            >
                              Rotate secrets
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[1.6rem] border border-dashed border-stone-900/15 bg-white/75 px-4 py-6 text-sm text-stone-500">
                    No integration connections yet. Create one from the setup panels on the right.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f8f4ee] p-5 xl:p-6">
              <div className="space-y-5">
                <SurfaceCard
                  title="Recommended packs"
                  description="The packs powering Studio resources and assistant suggestions are summarized here."
                  tone="default"
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                      <p>{marketplaceSummary.readyKits} ready, {marketplaceSummary.partialKits} partial, {marketplaceSummary.missingKits} missing.</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {marketplaceSummary.providerPacks} provider packs and {marketplaceSummary.workflowPacks} workflow packs are tracked in this workspace.
                      </p>
                    </div>
                    {marketplaceSummary.featuredWorkflowPacks.map((kit) => (
                      <div key={kit.key} className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-stone-900">{kit.title}</p>
                            <p className="mt-1 text-xs leading-5 text-stone-500">{kit.description}</p>
                          </div>
                          <span className="rounded-full border border-stone-900/10 bg-stone-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-700">
                            {kit.readiness}
                          </span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-stone-500">{kit.setupHint}</p>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>

                <SurfaceCard
                  title="Vendor quick starts"
                  description="Starter connection shapes that make the workspace feel closer to real HubSpot, Notion, Sheets, and Slack setups."
                  tone="mint"
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    {vendorQuickStarts.map((item) => (
                      <div key={item.title} className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-stone-900">{item.title}</p>
                            <p className="mt-1 text-xs leading-5 text-stone-500">{item.description}</p>
                          </div>
                          <span className="rounded-full border border-stone-900/10 bg-stone-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-700">
                            {item.provider}
                          </span>
                        </div>
                        <pre className="mt-3 whitespace-pre-wrap break-words rounded-[1.25rem] bg-[#fbf8f3] px-3 py-3 font-mono text-[11px] leading-5 text-stone-600">
                          {JSON.stringify(item.config, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>

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
                            className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-stone-700">Description</label>
                          <textarea
                            name="description"
                            defaultValue={template.description}
                            rows={3}
                            className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-stone-700">Config JSON</label>
                          <textarea
                            name="config"
                            defaultValue={JSON.stringify(template.config, null, 2)}
                            rows={7}
                            className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 font-mono text-xs leading-6 outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-stone-700">Secrets JSON</label>
                          <textarea
                            name="secrets"
                            defaultValue={JSON.stringify(template.secrets, null, 2)}
                            rows={5}
                            className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 font-mono text-xs leading-6 outline-none"
                          />
                        </div>
                        <button type="submit" className="flowholt-primary-button px-5 py-3 text-sm font-medium">
                          Save connection
                        </button>
                      </form>
                    ) : (
                      <div className="rounded-[1.25rem] bg-white/70 px-4 py-4 text-sm text-stone-500">
                        Create a workspace first to save connections.
                      </div>
                    )}
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
