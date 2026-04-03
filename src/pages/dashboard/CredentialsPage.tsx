import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  EllipsisVertical,
  KeyRound,
  Users,
  Variable,
  Webhook,
} from "lucide-react";

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

const connections: Connection[] = [
  {
    id: "conn_1",
    name: "Support escalation connection",
    app: "Slack",
    subtitle: "Shared workspace channel routing",
    logoUrl: "https://cdn.simpleicons.org/slack/4A154B",
    workflows: 24,
    lastModified: "Apr 1, 2026",
    peopleWithAccess: 9,
  },
  {
    id: "conn_2",
    name: "Model inference connection",
    app: "OpenAI",
    subtitle: "Production text and agent requests",
    logoUrl: "https://cdn.simpleicons.org/openai/10A37F",
    workflows: 15,
    lastModified: "Mar 30, 2026",
    peopleWithAccess: 6,
  },
  {
    id: "conn_3",
    name: "Warehouse sync connection",
    app: "Snowflake",
    subtitle: "Analytics sync for reporting pipelines",
    logoUrl: "https://cdn.simpleicons.org/snowflake/29B5E8",
    workflows: 7,
    lastModified: "Mar 29, 2026",
    peopleWithAccess: 4,
  },
  {
    id: "conn_4",
    name: "Archive storage connection",
    app: "S3",
    subtitle: "Evidence packs and payload storage",
    logoUrl: "https://cdn.simpleicons.org/amazons3/569A31",
    workflows: 11,
    lastModified: "Mar 28, 2026",
    peopleWithAccess: 3,
  },
];

const credentials: Credential[] = [
  { id: "cred_1", name: "OpenAI Production", type: "API key", scope: "production", lastUsed: "3 min ago", status: "active" },
  { id: "cred_2", name: "Slack Bot Token", type: "OAuth 2.0", scope: "workspace", lastUsed: "12 min ago", status: "active" },
  { id: "cred_3", name: "Snowflake Key Pair", type: "Key pair", scope: "staging", lastUsed: "1 hr ago", status: "active" },
  { id: "cred_4", name: "Twilio Legacy Key", type: "API key", scope: "production", lastUsed: "2 months ago", status: "expired" },
];

const variables: WorkspaceVariable[] = [
  { id: "var_1", key: "OPENAI_MODEL_PRIMARY", scope: "workspace", access: "Builders can read", updatedAt: "Today", masked: false },
  { id: "var_2", key: "SUPPORT_ESCALATION_WEBHOOK", scope: "production", access: "Owners and deployers", updatedAt: "Today", masked: true },
  { id: "var_3", key: "CRM_SYNC_BATCH_SIZE", scope: "staging", access: "Workspace editors", updatedAt: "Mar 29, 2026", masked: false },
  { id: "var_4", key: "S3_EVIDENCE_BUCKET", scope: "production", access: "Runtime only", updatedAt: "Mar 26, 2026", masked: false },
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

const CredentialsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VaultTab>("connections");

  return (
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

          {activeTab === "connections" && (
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

          {activeTab === "credentials" && (
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

          {activeTab === "variables" && (
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
  );
};

export default CredentialsPage;
