import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, type ApiIntegrationApp, type ApiVaultConnection } from "@/lib/api";
import { BriefcaseBusiness, CheckCircle2, Database, ExternalLink, Globe, Loader2, Mail, Plus, ShieldCheck, Webhook } from "lucide-react";

type IntegrationTab = "apps" | "ai" | "universal" | "governance";

const tabs: { id: IntegrationTab; label: string }[] = [
  { id: "apps", label: "Apps" },
  { id: "ai", label: "AI providers" },
  { id: "universal", label: "Universal tools" },
  { id: "governance", label: "Governance" },
];

const categoryIcons: Record<string, React.ElementType> = {
  HTTP: Webhook,
  Communication: Mail,
  AI: Globe,
};

interface UniversalTool {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  details: string;
}

const universalTools: UniversalTool[] = [
  { id: "tool_1", name: "HTTP Request", subtitle: "Universal connector for any REST API", icon: Globe, details: "Fallback when no native app exists. API key, OAuth, bearer. Available in Actions." },
  { id: "tool_2", name: "Webhook", subtitle: "Inbound and outbound event handling", icon: Webhook, details: "Custom triggers and event delivery. Signing secret. Available in Triggers and Output." },
  { id: "tool_3", name: "Database", subtitle: "Run queries and write workflow results", icon: Database, details: "SQL tasks and warehouse sync. Connection string or key pair. Available in Actions." },
  { id: "tool_4", name: "Send Email", subtitle: "SMTP or API-based mail delivery", icon: Mail, details: "Alerts, confirmations, and summaries. SMTP credentials or API token. Available in Actions." },
  { id: "tool_5", name: "Custom Node", subtitle: "Extend the editor beyond prebuilt integrations", icon: BriefcaseBusiness, details: "Internal tools or niche APIs. Developer-defined auth. Available from Nodes panel." },
];

const RowAction: React.FC<{ status: string; onAction: () => void }> = ({ status, onAction }) => (
  <div className="flex items-center justify-end gap-2">
    <button
      onClick={onAction}
      className={cn(
        "h-8 px-3 rounded-lg text-[12px] font-medium transition-colors",
        status === "connected"
          ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
          : "border border-slate-200 text-slate-700 hover:bg-slate-50"
      )}
    >
      {status === "connected" ? "Manage" : "Connect"}
    </button>
  </div>
);

const SettingsRow: React.FC<{ label: string; value: React.ReactNode; description?: string; action?: React.ReactNode }> = ({ label, value, description, action }) => (
  <div className="py-4 border-b border-slate-200 last:border-b-0">
    <div className="flex items-start justify-between gap-8">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-slate-900">{label}</div>
        {description && <div className="text-[13px] text-slate-500 mt-1">{description}</div>}
        <div className="text-[13px] text-slate-700 mt-2 leading-5">{value}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </div>
);

function getConnectionStatus(app: ApiIntegrationApp, connections: ApiVaultConnection[]): "connected" | "available" {
  return connections.some((c) => c.app.toLowerCase() === app.key.toLowerCase()) ? "connected" : "available";
}

function getAppIntegrationRoute(item: ApiIntegrationApp): string {
  if (item.auth_kind === "oauth") {
    const params = new URLSearchParams({
      tab: "connections",
      provider: item.key,
      connect: "1",
    });
    return `/dashboard/credentials?${params.toString()}`;
  }
  return "/dashboard/credentials?tab=connections";
}

function getAiProviderRoute(item: ApiIntegrationApp, status: "connected" | "available"): string {
  const params = new URLSearchParams({
    tab: "credentials",
    provider: item.key,
  });
  if (status === "available") {
    params.set("create", "1");
  }
  return `/dashboard/credentials?${params.toString()}`;
}

const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<IntegrationTab>("apps");
  const navigate = useNavigate();

  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: ["integrations-catalog"],
    queryFn: () => api.listIntegrations(),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["vault-connections"],
    queryFn: () => api.listVaultConnections(),
  });

  const apps = useMemo(() => catalog?.apps ?? [], [catalog]);
  const appIntegrations = useMemo(() => apps.filter((a) => a.category !== "AI"), [apps]);
  const aiProviders = useMemo(() => apps.filter((a) => a.category === "AI"), [apps]);

  const loading = catalogLoading;

  return (
    <div className="p-8 max-w-[1440px] mx-auto animate-fade-in pb-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">App Catalog</h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Discovery surface for app nodes, AI providers, and universal connector patterns. Live accounts and secrets still belong in Vault.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard/credentials?tab=connections")} className="h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <span className="inline-flex items-center gap-2"><BriefcaseBusiness size={14} /> Open Vault</span>
          </button>
          <button className="h-10 px-5 rounded-lg bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors">
            <span className="inline-flex items-center gap-2"><Plus size={14} /> Request integration</span>
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] leading-6 text-slate-600">
        Use this page to browse what the editor supports. Use Vault to connect apps, store API keys, and manage the live accounts workflows actually run with.
      </div>

      <div className="pt-3">
        <div className="flex items-center gap-1 border-b border-slate-200 px-1 pt-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-3 text-[14px] transition-colors border-b-2 -mb-px rounded-t-lg",
                activeTab === tab.id ? "text-slate-900 border-slate-300 font-semibold bg-slate-100" : "text-slate-400 border-transparent hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-8">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 size={24} className="animate-spin mr-3" />
              <span className="text-[14px] font-medium">Loading integrations...</span>
            </div>
          ) : (
            <>
              {activeTab === "apps" && (
                <>
                  <div className="pb-5 border-b border-slate-200">
                    <h2 className="text-[22px] font-bold text-slate-900">Apps</h2>
                    <p className="text-[14px] text-slate-500 mt-1">Browse native apps available in studio. Connection state routes back into Vault.</p>
                  </div>

                  {appIntegrations.length === 0 ? (
                    <div className="py-12 text-center text-[14px] text-slate-400">No app integrations registered.</div>
                  ) : (
                    <div className="mt-4 overflow-hidden">
                      <table className="w-full table-fixed border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="w-[34%] py-3 text-left text-[12px] font-medium text-slate-500">Integration</th>
                            <th className="w-[14%] py-3 text-left text-[12px] font-medium text-slate-500">Category</th>
                            <th className="w-[16%] py-3 text-left text-[12px] font-medium text-slate-500">Node types</th>
                            <th className="w-[14%] py-3 text-left text-[12px] font-medium text-slate-500">Auth</th>
                            <th className="w-[10%] py-3 text-left text-[12px] font-medium text-slate-500">Status</th>
                            <th className="w-[12%] py-3 text-right text-[12px] font-medium text-slate-500"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {appIntegrations.map((item) => {
                            const status = getConnectionStatus(item, connections);
                            return (
                              <tr key={item.key} className="border-b border-slate-200 last:border-b-0">
                                <td className="py-4 pr-4 align-middle">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[13px] font-bold text-slate-500 uppercase">
                                      {item.label.slice(0, 2)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[14px] font-semibold text-slate-900 truncate">{item.label}</div>
                                      <div className="text-[12px] text-slate-500 mt-1 truncate">{item.description}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.category}</td>
                                <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.node_types.join(", ")}</td>
                                <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.auth_kind}</td>
                                <td className="py-4 pr-4 align-middle">
                                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", status === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                                    {status === "connected" ? "Connected" : "Available"}
                                  </span>
                                </td>
                                <td className="py-4 align-middle">
                                  <RowAction status={status} onAction={() => navigate(getAppIntegrationRoute(item))} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {activeTab === "ai" && (
                <>
                  <div className="pb-5 border-b border-slate-200">
                    <h2 className="text-[22px] font-bold text-slate-900">AI providers</h2>
                    <p className="text-[14px] text-slate-500 mt-1">Catalog for AI model providers available in studio. Runtime keys and model defaults are managed in Vault Credentials.</p>
                  </div>

                  {aiProviders.length === 0 ? (
                    <div className="py-12 text-center text-[14px] text-slate-400">No AI providers registered.</div>
                  ) : (
                    <div className="mt-4 overflow-hidden">
                      <table className="w-full table-fixed border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="w-[30%] py-3 text-left text-[12px] font-medium text-slate-500">Provider</th>
                            <th className="w-[16%] py-3 text-left text-[12px] font-medium text-slate-500">Node types</th>
                            <th className="w-[18%] py-3 text-left text-[12px] font-medium text-slate-500">Auth</th>
                            <th className="w-[24%] py-3 text-left text-[12px] font-medium text-slate-500">Operations</th>
                            <th className="w-[12%] py-3 text-right text-[12px] font-medium text-slate-500"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiProviders.map((item) => {
                            const status = getConnectionStatus(item, connections);
                            return (
                              <tr key={item.key} className="border-b border-slate-200 last:border-b-0">
                                <td className="py-4 pr-4 align-middle">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[13px] font-bold text-slate-500 uppercase">
                                      {item.label.slice(0, 2)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[14px] font-semibold text-slate-900 truncate">{item.label}</div>
                                      <div className="text-[12px] text-slate-500 mt-1 truncate">{item.description}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.node_types.join(", ")}</td>
                                <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.auth_kind}</td>
                                <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">
                                  {item.operations.map((o) => o.label).join(", ")}
                                </td>
                                <td className="py-4 align-middle">
                                  <RowAction status={status} onAction={() => navigate(getAiProviderRoute(item, status))} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {activeTab === "universal" && (
                <>
                  <div className="pb-5 border-b border-slate-200">
                    <h2 className="text-[22px] font-bold text-slate-900">Universal tools</h2>
                    <p className="text-[14px] text-slate-500 mt-1">These cover HTTP, webhook, database, email, and custom connector patterns.</p>
                  </div>
                  <div className="mt-3 max-w-[980px]">
                    {universalTools.map((item) => (
                      <SettingsRow
                        key={item.id}
                        label={item.name}
                        description={item.subtitle}
                        value={item.details}
                        action={
                          <div className="flex items-center gap-2 text-slate-500">
                            <item.icon size={16} />
                            <button className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                              Open in studio
                            </button>
                          </div>
                        }
                      />
                    ))}
                  </div>
                </>
              )}

              {activeTab === "governance" && (
                <>
                  <div className="pb-5 border-b border-slate-200">
                    <h2 className="text-[22px] font-bold text-slate-900">Governance</h2>
                    <p className="text-[14px] text-slate-500 mt-1">Catalog policies and approval guidance. Operational auth hygiene still lives in Vault and Environment.</p>
                  </div>
                  <div className="mt-3 max-w-[980px]">
                    <SettingsRow label="Allowed apps policy" description="Choose whether builders can access all apps or only approved ones." value="Use an allowlist for regulated workspaces or a restricted list for controlled exploration." action={<button className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">Manage</button>} />
                    <SettingsRow label="Shared connections" description="Promote personal auth into team-owned connections before deployment." value="Keep production workflows tied to workspace-managed connections." action={<button className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">Review</button>} />
                    <SettingsRow label="Custom OAuth clients" description="Support custom client credentials when a workspace needs its own auth app." value="Useful for enterprise environments that cannot rely on shared OAuth clients." action={<button className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">Configure</button>} />
                    <SettingsRow label="Connector testing" description="Validate auth, triggers, and actions before enabling a new integration." value="Test records, auth flows, and action responses in a sandbox path first." action={<button className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">Open checks <ExternalLink size={13} /></button>} />
                    <SettingsRow label="Connection health" description="Surface reconnect needs and expired tokens before runs start failing." value="Review broken OAuth grants, stale keys, and app usage before workflows are affected." action={<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-medium"><CheckCircle2 size={11} /> Healthy</span>} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
