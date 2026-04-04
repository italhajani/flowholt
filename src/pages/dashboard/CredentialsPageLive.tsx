import React, { useEffect, useState } from "react";
import { api, type ApiVaultOverview } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CheckCircle2, EllipsisVertical, Users, Webhook } from "lucide-react";
import { SplitSettingsLoader } from "@/components/dashboard/DashboardRouteLoader";

type VaultTab = "connections" | "credentials" | "variables";
type CredentialStatus = "active" | "expired";
type EnvironmentScope = "workspace" | "staging" | "production";

interface Credential {
  id: string;
  name: string;
  type: string;
  scope: EnvironmentScope;
  lastUsed: string;
  status: CredentialStatus;
}

interface Connection {
  id: string;
  name: string;
  app: string;
  subtitle: string;
  logoUrl: string;
  workflows: number;
  lastModified: string;
  peopleWithAccess: number;
}

interface WorkspaceVariable {
  id: string;
  key: string;
  scope: EnvironmentScope;
  access: string;
  updatedAt: string;
  masked: boolean;
}

const tabs: { id: VaultTab; label: string }[] = [
  { id: "connections", label: "Connections" },
  { id: "credentials", label: "Credentials" },
  { id: "variables", label: "Variables" },
];

const SettingsRow: React.FC<{
  label: string;
  value?: React.ReactNode;
  action?: React.ReactNode;
  description?: string;
}> = ({ label, value, action, description }) => (
  <div className="py-4 border-b border-slate-200 last:border-b-0">
    <div className="flex items-start justify-between gap-8">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-slate-900">{label}</div>
        {description && <div className="text-[13px] text-slate-500 mt-1">{description}</div>}
        {value && <div className="text-[13px] text-slate-700 mt-2 leading-5">{value}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </div>
);

const SmallButton: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <button className={cn("h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors", className)}>
    {children}
  </button>
);

const CredentialsPageLive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VaultTab>("connections");
  const [vault, setVault] = useState<ApiVaultOverview>({
    connections: [],
    credentials: [],
    variables: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadVault = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getVaultOverview();
        if (!ignore) {
          setVault(response);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load Vault.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadVault();

    return () => {
      ignore = true;
    };
  }, []);

  const connections: Connection[] = vault.connections.map((item) => ({
    id: item.id,
    name: item.name,
    app: item.app,
    subtitle: item.subtitle,
    logoUrl: item.logo_url,
    workflows: item.workflows_count,
    lastModified: item.last_modified,
    peopleWithAccess: item.people_with_access,
  }));

  const credentials: Credential[] = vault.credentials.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.credential_type,
    scope: item.scope,
    lastUsed: item.last_used,
    status: item.status === "expired" ? "expired" : "active",
  }));

  const variables: WorkspaceVariable[] = vault.variables.map((item) => ({
    id: item.id,
    key: item.key,
    scope: item.scope,
    access: item.access,
    updatedAt: item.updated_at,
    masked: item.masked,
  }));

  return (
    loading ? (
      <SplitSettingsLoader />
    ) : (
    <div className="p-8 max-w-[1440px] mx-auto animate-fade-in pb-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Vault</h1>
          <p className="text-[14px] text-slate-500 mt-1">Manage connections, credentials, and variables in one shared workspace layer.</p>
        </div>
        <button className="h-10 px-5 rounded-lg bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors">
          Add secure asset
        </button>
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
          <div className="pb-5 border-b border-slate-200">
            <div>
              <h2 className="text-[22px] font-bold text-slate-900">
                {activeTab === "connections" ? "Connections" : activeTab === "credentials" ? "Credentials" : "Variables"}
              </h2>
              <p className="text-[14px] text-slate-500 mt-1">
                {activeTab === "connections" && "Review shared app connections used across your FlowHolt workflows."}
                {activeTab === "credentials" && "Store raw secrets, tokens, and service identities."}
                {activeTab === "variables" && "Control runtime values across workspace, staging, and production."}
              </p>
            </div>
          </div>

          {error && <div className="pt-6 text-[14px] text-rose-600">{error}</div>}

          {!error && activeTab === "connections" && (
            <div className="mt-4">
              <div className="overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="w-[34%] py-3 text-left text-[12px] font-medium text-slate-500">Name</th>
                      <th className="w-[18%] py-3 text-left text-[12px] font-medium text-slate-500">App</th>
                      <th className="w-[8%] py-3 text-left text-[12px] font-medium text-slate-500">Flows</th>
                      <th className="w-[14%] py-3 text-left text-[12px] font-medium text-slate-500">Last modified</th>
                      <th className="w-[14%] py-3 text-left text-[12px] font-medium text-slate-500">People with access</th>
                      <th className="w-[12%] py-3 text-right text-[12px] font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 last:border-b-0">
                        <td className="py-4 pr-4 align-middle">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              <img src={item.logoUrl} alt={item.app} className="w-5 h-5 object-contain" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-slate-900 truncate">{item.name}</div>
                              <div className="text-[12px] text-slate-500 mt-1 truncate">{item.subtitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 align-middle">
                          <div className="text-[13px] font-medium text-slate-900">{item.app}</div>
                          <div className="text-[12px] text-slate-500 mt-1">{item.id}</div>
                        </td>
                        <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.workflows}</td>
                        <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.lastModified}</td>
                        <td className="py-4 pr-4 align-middle">
                          <div className="flex items-center gap-2 text-[13px] text-slate-700">
                            <Users size={14} className="text-slate-400" />
                            {item.peopleWithAccess}
                          </div>
                        </td>
                        <td className="py-4 align-middle">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="h-8 px-3 rounded-lg border border-fuchsia-200 text-fuchsia-600 text-[12px] font-medium hover:bg-fuchsia-50 transition-colors">
                              Reauthorize
                            </button>
                            <button className="h-8 px-3 rounded-lg border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors">
                              Verify
                            </button>
                            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                              <EllipsisVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!error && activeTab === "credentials" && (
            <div className="mt-3 max-w-[880px]">
              {credentials.map((item) => (
                <SettingsRow
                  key={item.id}
                  label={item.name}
                  description={`${item.type} • ${item.scope}`}
                  value={`Last used ${item.lastUsed}`}
                  action={
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                        {item.status === "active" ? "Active" : "Expired"}
                      </span>
                      <SmallButton>Edit</SmallButton>
                    </div>
                  }
                />
              ))}
            </div>
          )}

          {!error && activeTab === "variables" && (
            <div className="mt-3 max-w-[880px]">
              {variables.map((item) => (
                <SettingsRow
                  key={item.id}
                  label={item.key}
                  description={`${item.scope} • ${item.access}`}
                  value={item.masked ? "Masked value stored securely" : `Updated ${item.updatedAt}`}
                  action={
                    <div className="flex items-center gap-2">
                      {item.masked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-[11px] font-medium">
                          <Webhook size={11} /> Hidden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-medium">
                          <CheckCircle2 size={11} /> Visible
                        </span>
                      )}
                      <SmallButton>Edit</SmallButton>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    )
  );
};

export default CredentialsPageLive;
