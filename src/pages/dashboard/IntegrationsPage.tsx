import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness, CheckCircle2, Database, ExternalLink, Globe, Mail, Plus, ShieldCheck, Webhook } from "lucide-react";

type IntegrationTab = "apps" | "ai" | "universal" | "governance";

interface AppIntegration {
  id: string;
  name: string;
  subtitle: string;
  logoUrl: string;
  category: string;
  studioSupport: string;
  auth: string;
  status: "Connected" | "Available" | "Needs attention";
}

interface AiProvider {
  id: string;
  name: string;
  subtitle: string;
  logoUrl: string;
  studioNode: string;
  auth: string;
  models: string;
  status: "Connected" | "Available";
}

interface UniversalTool {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  details: string;
}

const tabs: { id: IntegrationTab; label: string }[] = [
  { id: "apps", label: "Apps" },
  { id: "ai", label: "AI providers" },
  { id: "universal", label: "Universal tools" },
  { id: "governance", label: "Governance" },
];

const apps: AppIntegration[] = [
  { id: "app_1", name: "Slack", subtitle: "Messages, approvals, and internal alerts", logoUrl: "https://cdn.simpleicons.org/slack/4A154B", category: "Communication", studioSupport: "Trigger + action", auth: "OAuth 2.0", status: "Connected" },
  { id: "app_2", name: "HubSpot", subtitle: "Lead routing, CRM sync, and lifecycle updates", logoUrl: "https://cdn.simpleicons.org/hubspot/FF7A59", category: "Sales & CRM", studioSupport: "Trigger + action", auth: "Private app token", status: "Available" },
  { id: "app_3", name: "Gmail", subtitle: "Inbound email workflows and outbound replies", logoUrl: "https://cdn.simpleicons.org/gmail/EA4335", category: "Communication", studioSupport: "Trigger + action", auth: "OAuth 2.0", status: "Available" },
  { id: "app_4", name: "Google Sheets", subtitle: "Read and write structured workflow output", logoUrl: "https://cdn.simpleicons.org/googlesheets/34A853", category: "Data & Ops", studioSupport: "Action node", auth: "Service account", status: "Connected" },
  { id: "app_5", name: "Snowflake", subtitle: "Warehouse sync for analytics and reporting", logoUrl: "https://cdn.simpleicons.org/snowflake/29B5E8", category: "Data & Ops", studioSupport: "Action node", auth: "Key pair", status: "Available" },
  { id: "app_6", name: "Stripe", subtitle: "Payment events, subscription updates, and billing automation", logoUrl: "https://cdn.simpleicons.org/stripe/635BFF", category: "Commerce", studioSupport: "Trigger + action", auth: "OAuth 2.0", status: "Needs attention" },
];

const aiProviders: AiProvider[] = [
  { id: "ai_1", name: "OpenAI", subtitle: "Matches the GPT-4 node in studio", logoUrl: "https://cdn.simpleicons.org/openai/10A37F", studioNode: "GPT-4", auth: "API key", models: "GPT-4.1, GPT-4o, embeddings", status: "Connected" },
  { id: "ai_2", name: "Anthropic", subtitle: "Powers Claude reasoning chains", logoUrl: "https://cdn.simpleicons.org/anthropic/191919", studioNode: "Claude", auth: "API key", models: "Claude 3.7 Sonnet, Opus", status: "Available" },
  { id: "ai_3", name: "Google Gemini", subtitle: "Multimodal prompts and document tasks", logoUrl: "https://cdn.simpleicons.org/googlegemini/8E75FF", studioNode: "Gemini", auth: "API key", models: "Gemini 2.5 Pro, Flash", status: "Available" },
  { id: "ai_4", name: "Meta Llama", subtitle: "Open-weight option for private deployment", logoUrl: "https://cdn.simpleicons.org/meta/0866FF", studioNode: "Llama", auth: "Custom endpoint", models: "Llama 3.x family", status: "Available" },
  { id: "ai_5", name: "Custom LLM", subtitle: "Bring any inference endpoint into studio", logoUrl: "https://cdn.simpleicons.org/opencontainersinitiative/1D63ED", studioNode: "Custom LLM", auth: "Bearer / custom auth", models: "vLLM, Ollama, Bedrock proxy", status: "Available" },
];

const universalTools: UniversalTool[] = [
  { id: "tool_1", name: "HTTP Request", subtitle: "Universal connector for any REST API", icon: Globe, details: "Fallback when no native app exists. API key, OAuth, bearer. Available in Actions." },
  { id: "tool_2", name: "Webhook", subtitle: "Inbound and outbound event handling", icon: Webhook, details: "Custom triggers and event delivery. Signing secret. Available in Triggers and Output." },
  { id: "tool_3", name: "Database", subtitle: "Run queries and write workflow results", icon: Database, details: "SQL tasks and warehouse sync. Connection string or key pair. Available in Actions." },
  { id: "tool_4", name: "Send Email", subtitle: "SMTP or API-based mail delivery", icon: Mail, details: "Alerts, confirmations, and summaries. SMTP credentials or API token. Available in Actions." },
  { id: "tool_5", name: "Custom Node", subtitle: "Extend the editor beyond prebuilt integrations", icon: BriefcaseBusiness, details: "Internal tools or niche APIs. Developer-defined auth. Available from Nodes panel." },
];

const RowAction: React.FC<{ status: string }> = ({ status }) => (
  <div className="flex items-center justify-end gap-2">
    <button
      className={cn(
        "h-8 px-3 rounded-lg text-[12px] font-medium transition-colors",
        status === "Connected"
          ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
          : status === "Needs attention"
            ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
      )}
    >
      {status === "Connected" ? "Manage" : status === "Needs attention" ? "Reconnect" : "Connect"}
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

const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<IntegrationTab>("apps");

  return (
    <div className="p-8 max-w-[1440px] mx-auto animate-fade-in pb-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Integrations</h1>
          <p className="text-[14px] text-slate-500 mt-1">A studio-aligned directory for app nodes, AI providers, and universal connectors.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <span className="inline-flex items-center gap-2"><BriefcaseBusiness size={14} /> Create private app</span>
          </button>
          <button className="h-10 px-5 rounded-lg bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors">
            <span className="inline-flex items-center gap-2"><Plus size={14} /> Request integration</span>
          </button>
        </div>
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
          {activeTab === "apps" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">Apps</h2>
                <p className="text-[14px] text-slate-500 mt-1">Native apps for the trigger and action patterns already present in studio.</p>
              </div>

              <div className="mt-4 overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="w-[34%] py-3 text-left text-[12px] font-medium text-slate-500">Integration</th>
                      <th className="w-[14%] py-3 text-left text-[12px] font-medium text-slate-500">Category</th>
                      <th className="w-[16%] py-3 text-left text-[12px] font-medium text-slate-500">Studio support</th>
                      <th className="w-[14%] py-3 text-left text-[12px] font-medium text-slate-500">Auth</th>
                      <th className="w-[10%] py-3 text-left text-[12px] font-medium text-slate-500">Status</th>
                      <th className="w-[12%] py-3 text-right text-[12px] font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 last:border-b-0">
                        <td className="py-4 pr-4 align-middle">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              <img src={item.logoUrl} alt={item.name} className="w-5 h-5 object-contain" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-slate-900 truncate">{item.name}</div>
                              <div className="text-[12px] text-slate-500 mt-1 truncate">{item.subtitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.category}</td>
                        <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.studioSupport}</td>
                        <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.auth}</td>
                        <td className="py-4 pr-4 align-middle">
                          <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", item.status === "Connected" ? "bg-emerald-50 text-emerald-700" : item.status === "Needs attention" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 align-middle">
                          <RowAction status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "ai" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">AI providers</h2>
                <p className="text-[14px] text-slate-500 mt-1">These map directly to the AI model nodes available inside studio.</p>
              </div>

              <div className="mt-4 overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="w-[30%] py-3 text-left text-[12px] font-medium text-slate-500">Provider</th>
                      <th className="w-[16%] py-3 text-left text-[12px] font-medium text-slate-500">Studio node</th>
                      <th className="w-[18%] py-3 text-left text-[12px] font-medium text-slate-500">Auth</th>
                      <th className="w-[24%] py-3 text-left text-[12px] font-medium text-slate-500">Models</th>
                      <th className="w-[12%] py-3 text-right text-[12px] font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiProviders.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 last:border-b-0">
                        <td className="py-4 pr-4 align-middle">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              <img src={item.logoUrl} alt={item.name} className="w-5 h-5 object-contain" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-slate-900 truncate">{item.name}</div>
                              <div className="text-[12px] text-slate-500 mt-1 truncate">{item.subtitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.studioNode}</td>
                        <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.auth}</td>
                        <td className="py-4 pr-4 align-middle text-[13px] text-slate-700">{item.models}</td>
                        <td className="py-4 align-middle">
                          <RowAction status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                <p className="text-[14px] text-slate-500 mt-1">Policies that keep the integrations catalog aligned with security and shared ownership.</p>
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
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
