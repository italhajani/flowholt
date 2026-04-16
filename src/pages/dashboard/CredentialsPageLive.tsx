import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, type ApiIntegrationApp, type ApiOAuth2Provider, type ApiProviderModel, type ApiVaultOverview } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Braces, KeyRound, Layers, Loader2, Plus, Search, Sparkles, Trash2, Zap } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { SplitSettingsLoader } from "@/components/dashboard/DashboardRouteLoader";

type VaultTab = "integrations" | "ai" | "credentials" | "custom";
type AiCenterSection = "providers" | "models";
type CredentialStatus = "active" | "expired";
type EnvironmentScope = "workspace" | "staging" | "production";
type VaultAppAuthKind = ApiIntegrationApp["auth_kind"] | "webhook";

interface VaultCatalogApp {
  key: string;
  label: string;
  description: string;
  group: "integrations" | "ai";
  authKind: VaultAppAuthKind;
  category: string;
  nodeTypes: string[];
  operations: string[];
  iconUrl?: string;
  setupTitle: string;
  setupHint: string;
  defaultCredentialType?: string;
  defaultBaseUrl?: string;
  defaultModel?: string;
}

interface Credential {
  id: string;
  name: string;
  type: string;
  scope: EnvironmentScope;
  lastUsed: string;
  status: CredentialStatus;
  app?: string | null;
  secret?: Record<string, unknown>;
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

interface VariableDraft {
  key: string;
  value: string;
  scope: EnvironmentScope;
  masked: boolean;
}

const tabs: { id: VaultTab; label: string }[] = [
  { id: "integrations", label: "Integrations" },
  { id: "ai", label: "AI Center" },
  { id: "credentials", label: "Credentials" },
  { id: "custom", label: "Custom App" },
];

const aiCenterSections: Array<{ id: AiCenterSection; label: string; description: string; icon: React.ElementType }> = [
  {
    id: "providers",
    label: "Providers",
    description: "Connect OpenAI, Anthropic, Groq, Gemini, and other AI services.",
    icon: Zap,
  },
  {
    id: "models",
    label: "Models",
    description: "Active models available from your connected providers.",
    icon: Layers,
  },
];

const AI_PROVIDER_PRESETS = {
  xai: {
    label: "FlowHolt AI / Grok",
    description: "Default assistant model powered by xAI.",
    model: "grok-3",
    baseUrl: "https://api.x.ai/v1",
  },
  groq: {
    label: "Groq",
    description: "Fast OpenAI-compatible inference.",
    model: "llama-3.3-70b-versatile",
    baseUrl: "https://api.groq.com/openai/v1",
  },
  gemini: {
    label: "Google Gemini",
    description: "Gemini flash endpoint for multi-purpose chat.",
    model: "gemini-2.5-flash",
    baseUrl: "",
  },
  openai: {
    label: "OpenAI",
    description: "ChatGPT-compatible OpenAI API credentials.",
    model: "gpt-4o",
    baseUrl: "https://api.openai.com/v1",
  },
  anthropic: {
    label: "Anthropic",
    description: "Claude Messages API credential.",
    model: "claude-sonnet-4-20250514",
    baseUrl: "https://api.anthropic.com/v1",
  },
  deepseek: {
    label: "DeepSeek",
    description: "DeepSeek chat API credential.",
    model: "deepseek-chat",
    baseUrl: "https://api.deepseek.com/v1",
  },
} as const;

const OAUTH_PROVIDER_META: Record<string, { name: string; description: string }> = {
  google: { name: "Google", description: "Gmail, Sheets, Drive" },
  github: { name: "GitHub", description: "Repos, issues, pull requests" },
  slack: { name: "Slack", description: "Messages, channels, reactions" },
  notion: { name: "Notion", description: "Pages, databases, search" },
  microsoft: { name: "Microsoft", description: "Outlook, Teams, Office" },
};

const OAUTH_PROVIDER_ICONS: Record<string, string> = {
  google: "https://cdn.simpleicons.org/google/4285F4",
  github: "https://cdn.simpleicons.org/github/181717",
  slack: "https://cdn.simpleicons.org/slack/4A154B",
  notion: "https://cdn.simpleicons.org/notion/000000",
  microsoft: "https://cdn.simpleicons.org/microsoft/5E5E5E",
};

const APP_ICON_MAP: Record<string, string> = {
  anthropic: "https://cdn.simpleicons.org/anthropic/191919",
  claude: "https://cdn.simpleicons.org/anthropic/191919",
  crisp: "https://cdn.simpleicons.org/crisp/005EFF",
  deepseek: "https://cdn.simpleicons.org/deepseek/4D6BFE",
  discord: "https://cdn.simpleicons.org/discord/5865F2",
  elevenlabs: "https://cdn.simpleicons.org/elevenlabs/000000",
  gemini: "https://cdn.simpleicons.org/google/4285F4",
  gmail: "https://cdn.simpleicons.org/gmail/EA4335",
  googledrive: "https://cdn.simpleicons.org/googledrive/34A853",
  googlecalendar: "https://cdn.simpleicons.org/googlecalendar/4285F4",
  googlesheets: "https://cdn.simpleicons.org/googlesheets/0F9D58",
  groq: "https://cdn.simpleicons.org/groq/F55036",
  openai: "https://cdn.simpleicons.org/openai/412991",
  outlook: "https://cdn.simpleicons.org/microsoftoutlook/0078D4",
  salesforce: "https://cdn.simpleicons.org/salesforce/00A1E0",
  stripe: "https://cdn.simpleicons.org/stripe/635BFF",
};

const CORE_INTEGRATION_APPS: VaultCatalogApp[] = [
  {
    key: "gmail",
    label: "Gmail",
    description: "Send, label, and react to inbox activity without leaving FlowHolt.",
    group: "integrations",
    authKind: "oauth",
    category: "Communication",
    nodeTypes: ["trigger", "action"],
    operations: ["Send email", "Watch inbox", "Manage labels"],
    iconUrl: APP_ICON_MAP.gmail,
    setupTitle: "Connect Gmail",
    setupHint: "Authorize a Google account so flows can send and triage mail.",
    defaultCredentialType: "oauth2",
  },
  {
    key: "googlesheets",
    label: "Google Sheets",
    description: "Read rows, append updates, and sync spreadsheet data into workflows.",
    group: "integrations",
    authKind: "oauth",
    category: "Data",
    nodeTypes: ["action", "query"],
    operations: ["Read rows", "Append rows", "Update cells"],
    iconUrl: APP_ICON_MAP.googlesheets,
    setupTitle: "Connect Google Sheets",
    setupHint: "Use OAuth for workspace spreadsheets and reporting automations.",
    defaultCredentialType: "oauth2",
  },
  {
    key: "googledrive",
    label: "Google Drive",
    description: "Move files, watch folders, and attach documents to workflow runs.",
    group: "integrations",
    authKind: "oauth",
    category: "Storage",
    nodeTypes: ["trigger", "action"],
    operations: ["List files", "Upload", "Watch folders"],
    iconUrl: APP_ICON_MAP.googledrive,
    setupTitle: "Connect Google Drive",
    setupHint: "Authorize Drive access to move files across workflows.",
    defaultCredentialType: "oauth2",
  },
  {
    key: "discord",
    label: "Discord",
    description: "Send channel updates, moderate alerts, and coordinate automation with communities.",
    group: "integrations",
    authKind: "token",
    category: "Communication",
    nodeTypes: ["action", "trigger"],
    operations: ["Send message", "Watch events", "Manage channels"],
    iconUrl: APP_ICON_MAP.discord,
    setupTitle: "Configure Discord",
    setupHint: "Paste a bot token or webhook secret for the Discord workspace you want to automate.",
    defaultCredentialType: "token",
  },
  {
    key: "outlook",
    label: "Microsoft Outlook",
    description: "Work with inbox, calendar, and mail flows using Microsoft accounts.",
    group: "integrations",
    authKind: "oauth",
    category: "Communication",
    nodeTypes: ["trigger", "action"],
    operations: ["Send email", "Watch mailbox", "Manage calendar"],
    iconUrl: APP_ICON_MAP.outlook,
    setupTitle: "Connect Outlook",
    setupHint: "Use Microsoft OAuth to unlock mail and calendar automations.",
    defaultCredentialType: "oauth2",
  },
];

const AI_CENTER_APPS: VaultCatalogApp[] = [
  {
    key: "openai",
    label: "ChatGPT / OpenAI",
    description: "Chat, embeddings, files, and structured output from OpenAI-compatible APIs.",
    group: "ai",
    authKind: "api_key",
    category: "AI",
    nodeTypes: ["llm", "agent"],
    operations: ["Chat", "Embeddings", "Files"],
    iconUrl: APP_ICON_MAP.openai,
    setupTitle: "Add OpenAI credential",
    setupHint: "Store the workspace API key and default model used by your AI flows.",
    defaultCredentialType: "api_key",
    defaultBaseUrl: AI_PROVIDER_PRESETS.openai.baseUrl,
    defaultModel: AI_PROVIDER_PRESETS.openai.model,
  },
  {
    key: "anthropic",
    label: "Claude",
    description: "Claude models for assistants, agents, and long-context reasoning.",
    group: "ai",
    authKind: "api_key",
    category: "AI",
    nodeTypes: ["llm", "agent"],
    operations: ["Chat", "Reasoning", "Structured output"],
    iconUrl: APP_ICON_MAP.anthropic,
    setupTitle: "Add Claude credential",
    setupHint: "Store an Anthropic key and choose the default Claude model for this workspace.",
    defaultCredentialType: "api_key",
    defaultBaseUrl: AI_PROVIDER_PRESETS.anthropic.baseUrl,
    defaultModel: AI_PROVIDER_PRESETS.anthropic.model,
  },
  {
    key: "gemini",
    label: "Google AI Studio",
    description: "Gemini models for multimodal chat and lightweight reasoning workflows.",
    group: "ai",
    authKind: "api_key",
    category: "AI",
    nodeTypes: ["llm", "agent"],
    operations: ["Chat", "Vision", "Generation"],
    iconUrl: APP_ICON_MAP.gemini,
    setupTitle: "Add Google AI Studio credential",
    setupHint: "Use a Gemini key and model defaults from AI Studio.",
    defaultCredentialType: "api_key",
    defaultBaseUrl: AI_PROVIDER_PRESETS.gemini.baseUrl,
    defaultModel: AI_PROVIDER_PRESETS.gemini.model,
  },
  {
    key: "deepseek",
    label: "DeepSeek",
    description: "Low-latency reasoning and coding models via DeepSeek API credentials.",
    group: "ai",
    authKind: "api_key",
    category: "AI",
    nodeTypes: ["llm", "agent"],
    operations: ["Chat", "Code", "Reasoning"],
    iconUrl: APP_ICON_MAP.deepseek,
    setupTitle: "Add DeepSeek credential",
    setupHint: "Store a DeepSeek key for chat and tool-driven automations.",
    defaultCredentialType: "api_key",
    defaultBaseUrl: AI_PROVIDER_PRESETS.deepseek.baseUrl,
    defaultModel: AI_PROVIDER_PRESETS.deepseek.model,
  },
  {
    key: "elevenlabs",
    label: "ElevenLabs",
    description: "Voice generation and speech workflows for conversational automations.",
    group: "ai",
    authKind: "api_key",
    category: "AI",
    nodeTypes: ["voice", "action"],
    operations: ["Text to speech", "Voice cloning", "Audio generation"],
    iconUrl: APP_ICON_MAP.elevenlabs,
    setupTitle: "Add ElevenLabs credential",
    setupHint: "Store the workspace voice API key and optional endpoint override.",
    defaultCredentialType: "api_key",
  },
  {
    key: "groq",
    label: "Groq",
    description: "OpenAI-compatible inference with fast latency for agent workloads.",
    group: "ai",
    authKind: "api_key",
    category: "AI",
    nodeTypes: ["llm", "agent"],
    operations: ["Chat", "Reasoning", "Fast inference"],
    iconUrl: APP_ICON_MAP.groq,
    setupTitle: "Add Groq credential",
    setupHint: "Store a Groq key and your default model for the workspace.",
    defaultCredentialType: "api_key",
    defaultBaseUrl: AI_PROVIDER_PRESETS.groq.baseUrl,
    defaultModel: AI_PROVIDER_PRESETS.groq.model,
  },
];

const CUSTOM_APP_STARTERS = [
  {
    key: "private-http",
    title: "Private HTTP app",
    description: "Create a team-only app definition backed by REST endpoints, auth, and reusable actions.",
  },
  {
    key: "webhook-tool",
    title: "Webhook tool",
    description: "Define inbound or outbound webhook integrations with signing secrets and payload templates.",
  },
  {
    key: "database-connector",
    title: "Database connector",
    description: "Capture connection settings and reusable queries for internal systems and warehouses.",
  },
];

type AiProviderId = keyof typeof AI_PROVIDER_PRESETS;

const isAiProviderId = (value: string | null): value is AiProviderId => !!value && value in AI_PROVIDER_PRESETS;

const getOAuthProviderLabel = (provider: ApiOAuth2Provider) => OAUTH_PROVIDER_META[provider.key]?.name ?? `${provider.key.charAt(0).toUpperCase()}${provider.key.slice(1)}`;

const getOAuthProviderDescription = (provider: ApiOAuth2Provider) => OAUTH_PROVIDER_META[provider.key]?.description ?? "OAuth app connection";

const getOAuthProviderIcon = (provider: ApiOAuth2Provider) => OAUTH_PROVIDER_ICONS[provider.key] ?? "";

const normalizeVaultTab = (value: string | null): VaultTab => {
  if (value === "ai") return "ai";
  if (value === "credentials" || value === "variables") return "credentials";
  if (value === "custom") return "custom";
  return "integrations";
};

const normalizeAiCenterSection = (value: string | null): AiCenterSection => {
  if (value === "models") return "models";
  return "providers";
};

const getAppIcon = (appKey: string, fallback?: string) => APP_ICON_MAP[appKey] ?? fallback ?? "";

const getAuthLabel = (authKind: VaultAppAuthKind) => {
  if (authKind === "oauth") return "OAuth sign-in";
  if (authKind === "api_key") return "API key";
  if (authKind === "token") return "Access token";
  if (authKind === "database") return "Database auth";
  if (authKind === "webhook") return "Webhook setup";
  return "No auth";
};

const buildCredentialDefaults = (provider: AiProviderId) => ({
  provider,
  name: `${AI_PROVIDER_PRESETS[provider].label} credential`,
  apiKey: "",
  model: AI_PROVIDER_PRESETS[provider].model,
  baseUrl: AI_PROVIDER_PRESETS[provider].baseUrl,
});

type CredentialDraft = ReturnType<typeof buildCredentialDefaults>;
type VaultAssetHealth = Awaited<ReturnType<typeof api.getVaultAssetHealth>>;

const VARIABLE_KEY_PATTERN = /^[A-Za-z0-9_]+$/;

const buildVariableDraft = (): VariableDraft => ({
  key: "",
  value: "",
  scope: "workspace",
  masked: true,
});

const getVariableUsageSnippet = (key: string) => `$vars.${key || "YOUR_VARIABLE"}`;

const resolveCredentialProvider = (credential: Pick<Credential, "app" | "name">): AiProviderId => {
  if (isAiProviderId(credential.app ?? null)) {
    return credential.app;
  }
  const normalizedName = credential.name.toLowerCase();
  const matchedPreset = (Object.keys(AI_PROVIDER_PRESETS) as AiProviderId[]).find((providerId) => {
    const preset = AI_PROVIDER_PRESETS[providerId];
    return normalizedName.includes(providerId) || normalizedName.includes(preset.label.toLowerCase());
  });
  return matchedPreset ?? "xai";
};

const buildCredentialDraftFromExisting = (credential: Credential): CredentialDraft => {
  const provider = resolveCredentialProvider(credential);
  const defaults = buildCredentialDefaults(provider);
  return {
    provider,
    name: credential.name,
    apiKey: "",
    model: typeof credential.secret?.model === "string" ? credential.secret.model : defaults.model,
    baseUrl: typeof credential.secret?.base_url === "string" ? credential.secret.base_url : defaults.baseUrl,
  };
};

const summarizeHealthState = (
  query: {
  data?: VaultAssetHealth;
  isLoading: boolean;
  error: unknown;
  },
  assetLabel: string,
) => {
  if (query.isLoading) {
    return {
      tone: "checking" as const,
      label: "Checking",
      message: `Fetching ${assetLabel} health.`,
    };
  }

  if (query.error) {
    return {
      tone: "attention" as const,
      label: "Unavailable",
      message: query.error instanceof Error ? query.error.message : `Could not load ${assetLabel} health.`,
    };
  }

  if (!query.data) {
    return {
      tone: "checking" as const,
      label: "Checking",
      message: `Waiting for ${assetLabel} health.`,
    };
  }

  const failingChecks = query.data.checks.filter((check) => !check.passed);
  if (query.data.healthy) {
    return {
      tone: "healthy" as const,
      label: "Healthy",
      message: query.data.checks[0]?.message ?? `${assetLabel[0].toUpperCase()}${assetLabel.slice(1)} is configured and ready.`,
    };
  }

  return {
    tone: "attention" as const,
    label: failingChecks.length > 1 ? `${failingChecks.length} issues` : "Needs attention",
    message: failingChecks[0]?.message ?? `${assetLabel[0].toUpperCase()}${assetLabel.slice(1)} configuration needs attention.`,
  };
};

const CredentialsPageLive: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = normalizeVaultTab(searchParams.get("tab"));
  const initialAiSection = normalizeAiCenterSection(searchParams.get("section"));
  const initialProvider = isAiProviderId(searchParams.get("provider")) ? searchParams.get("provider") : "xai";
  const [activeTab, setActiveTab] = useState<VaultTab>(initialTab);
  const [activeAiSection, setActiveAiSection] = useState<AiCenterSection>(initialAiSection);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [pendingDeleteAsset, setPendingDeleteAsset] = useState<{ id: string; name: string } | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(searchParams.get("create") === "1");
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [credentialDraft, setCredentialDraft] = useState(() => buildCredentialDefaults(initialProvider));
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(searchParams.get("connect") === "1" || searchParams.get("create") === "1");
  const [selectedAppKey, setSelectedAppKey] = useState<string | null>(searchParams.get("provider"));
  const [setupCredentialName, setSetupCredentialName] = useState("");
  const [setupSecretValue, setSetupSecretValue] = useState("");
  const [setupEndpoint, setSetupEndpoint] = useState("");
  const [setupModel, setSetupModel] = useState("");
  const [setupWebhookUrl, setSetupWebhookUrl] = useState("");
  const [setupWebhookSecret, setSetupWebhookSecret] = useState("");
  const [setupPending, setSetupPending] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [oauthDialogOpen, setOAuthDialogOpen] = useState(searchParams.get("connect") === "1");
  const [oauthProvider, setOAuthProvider] = useState<ApiOAuth2Provider | null>(null);
  const [oauthClientId, setOAuthClientId] = useState("");
  const [oauthClientSecret, setOAuthClientSecret] = useState("");
  const [oauthScopes, setOAuthScopes] = useState("");
  const [oauthBusy, setOAuthBusy] = useState<string | null>(null);
  const [oauthError, setOAuthError] = useState<string | null>(null);
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const [variableDraft, setVariableDraft] = useState<VariableDraft>(() => buildVariableDraft());
  const [variablePending, setVariablePending] = useState(false);
  const [variableLoading, setVariableLoading] = useState(false);
  const [variableError, setVariableError] = useState<string | null>(null);
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const queryClient = useQueryClient();
  const { data: vault, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["vault-overview"],
    queryFn: () => api.getVaultOverview(),
    initialData: { connections: [], credentials: [], variables: [] } as ApiVaultOverview,
  });
  const { data: integrationCatalog } = useQuery({
    queryKey: ["integrations-catalog"],
    queryFn: () => api.listIntegrations(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const { data: oauthProviders = [] } = useQuery({
    queryKey: ["oauth2-providers"],
    queryFn: () => api.listOAuth2Providers(),
    enabled: activeTab === "integrations" || activeTab === "ai" || searchParams.get("connect") === "1" || searchParams.has("code") || searchParams.has("state"),
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const { data: chatModels = [] } = useQuery({
    queryKey: ["chat-models"],
    queryFn: () => api.listChatModels(),
    enabled: activeTab === "ai",
    staleTime: 60_000,
    retry: 1,
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load Vault.") : null;

  const oauthProviderByKey = useMemo(
    () => new Map(oauthProviders.map((provider) => [provider.key.toLowerCase(), provider])),
    [oauthProviders],
  );

  useEffect(() => {
    setActiveTab(normalizeVaultTab(searchParams.get("tab")));
    setActiveAiSection(normalizeAiCenterSection(searchParams.get("section")));

    const requestedProvider = searchParams.get("provider");
    const nextProvider = isAiProviderId(requestedProvider) ? requestedProvider : null;
    if (searchParams.get("create") === "1" && nextProvider) {
      setCredentialDraft(buildCredentialDefaults(nextProvider));
      setCreateDialogOpen(true);
      setCreateError(null);
    }
    if (searchParams.get("connect") === "1" || searchParams.get("create") === "1") {
      setSetupDialogOpen(true);
      setSelectedAppKey(requestedProvider);
    }
  }, [searchParams]);

  const syncRouteState = (nextTab: VaultTab, provider?: string, create = false, connect = false, section?: AiCenterSection) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", nextTab);
    nextParams.delete("code");
    nextParams.delete("state");
    if (nextTab === "ai") {
      nextParams.set("section", section ?? activeAiSection);
    } else {
      nextParams.delete("section");
    }
    if (provider) {
      nextParams.set("provider", provider);
    } else {
      nextParams.delete("provider");
    }
    if (create) {
      nextParams.set("create", "1");
    } else {
      nextParams.delete("create");
    }
    if (connect) {
      nextParams.set("connect", "1");
    } else {
      nextParams.delete("connect");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const catalogApps = useMemo(() => integrationCatalog?.apps ?? [], [integrationCatalog]);

  const integrationApps = useMemo(() => {
    const merged = new Map<string, VaultCatalogApp>();

    CORE_INTEGRATION_APPS.forEach((app) => {
      merged.set(app.key, app);
    });

    catalogApps
      .filter((app) => app.category !== "AI")
      .forEach((app) => {
        const key = app.key.toLowerCase();
        const existing = merged.get(key);
        merged.set(key, {
          key,
          label: app.label,
          description: app.description,
          group: "integrations",
          authKind: app.auth_kind,
          category: app.category,
          nodeTypes: app.node_types,
          operations: app.operations.map((operation) => operation.label),
          iconUrl: getAppIcon(key, existing?.iconUrl),
          setupTitle: existing?.setupTitle ?? `Connect ${app.label}`,
          setupHint: existing?.setupHint ?? `Configure ${app.label} for shared workspace access inside FlowHolt.`,
          defaultCredentialType: existing?.defaultCredentialType ?? (app.auth_kind === "token" ? "token" : app.auth_kind),
        });
      });

    return Array.from(merged.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [catalogApps]);

  const aiCenterApps = useMemo(() => {
    const merged = new Map<string, VaultCatalogApp>();

    AI_CENTER_APPS.forEach((app) => {
      merged.set(app.key, app);
    });

    catalogApps
      .filter((app) => app.category === "AI")
      .forEach((app) => {
        const key = app.key.toLowerCase();
        const existing = merged.get(key);
        merged.set(key, {
          key,
          label: existing?.label ?? app.label,
          description: existing?.description ?? app.description,
          group: "ai",
          authKind: existing?.authKind ?? app.auth_kind,
          category: app.category,
          nodeTypes: app.node_types,
          operations: app.operations.map((operation) => operation.label),
          iconUrl: getAppIcon(key, existing?.iconUrl),
          setupTitle: existing?.setupTitle ?? `Add ${app.label} credential`,
          setupHint: existing?.setupHint ?? `Store ${app.label} access so AI workflows can reuse it across the workspace.`,
          defaultCredentialType: existing?.defaultCredentialType ?? (app.auth_kind === "token" ? "token" : app.auth_kind),
          defaultBaseUrl: existing?.defaultBaseUrl,
          defaultModel: existing?.defaultModel,
        });
      });

    return Array.from(merged.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [catalogApps]);

  const allVaultApps = useMemo(() => [...integrationApps, ...aiCenterApps], [aiCenterApps, integrationApps]);

  const visibleCatalogApps = useMemo(() => {
    const source = activeTab === "ai" ? aiCenterApps : activeTab === "integrations" ? integrationApps : allVaultApps;
    const query = catalogSearch.trim().toLowerCase();
    if (!query) return source;
    return source.filter((app) => {
      const haystack = `${app.label} ${app.description} ${app.category} ${app.operations.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [activeTab, aiCenterApps, allVaultApps, catalogSearch, integrationApps]);

  const selectedSetupApp = useMemo(
    () => allVaultApps.find((app) => app.key === selectedAppKey) ?? null,
    [allVaultApps, selectedAppKey],
  );

  const primeSetupFields = (app: VaultCatalogApp | null) => {
    if (!app) {
      setSetupCredentialName("");
      setSetupSecretValue("");
      setSetupEndpoint("");
      setSetupModel("");
      setSetupWebhookUrl("");
      setSetupWebhookSecret("");
      setSetupError(null);
      setOAuthProvider(null);
      setOAuthScopes("");
      return;
    }

    setSelectedAppKey(app.key);
    setSetupCredentialName(`${app.label} credential`);
    setSetupSecretValue("");
    setSetupEndpoint(app.defaultBaseUrl ?? "");
    setSetupModel(app.defaultModel ?? "");
    setSetupWebhookUrl("");
    setSetupWebhookSecret("");
    setOAuthClientId("");
    setOAuthClientSecret("");
    setOAuthBusy(null);
    setOAuthError(null);
    setSetupError(null);
    const provider = oauthProviderByKey.get(app.key) ?? null;
    setOAuthProvider(provider);
    setOAuthScopes(provider?.scopes || "");
  };

  const openSetupDialog = (app?: VaultCatalogApp | null, tabOverride?: VaultTab) => {
    const nextTab = tabOverride ?? activeTab;
    const nextApp = app ?? visibleCatalogApps[0] ?? allVaultApps[0] ?? null;
    setActiveTab(nextTab);
    if (nextTab === "ai") {
      setActiveAiSection("providers");
    }
    primeSetupFields(nextApp);
    setSetupDialogOpen(true);
    syncRouteState(nextTab, nextApp?.key, false, nextApp?.authKind === "oauth", nextTab === "ai" ? "providers" : undefined);
  };

  const closeSetupDialog = () => {
    setSetupDialogOpen(false);
    setSetupPending(false);
    setSetupError(null);
    setSelectedAppKey(null);
    setSetupCredentialName("");
    setSetupSecretValue("");
    setSetupEndpoint("");
    setSetupModel("");
    setSetupWebhookUrl("");
    setSetupWebhookSecret("");
    setOAuthClientId("");
    setOAuthClientSecret("");
    setOAuthBusy(null);
    setOAuthError(null);
    syncRouteState(activeTab, undefined, false, false, activeTab === "ai" ? activeAiSection : undefined);
  };

  const openOAuthDialog = (provider?: ApiOAuth2Provider | null) => {
    const nextProvider = provider ?? oauthProviders[0] ?? null;
    setActiveTab("integrations");
    setOAuthProvider(nextProvider);
    setOAuthScopes(nextProvider?.scopes || "");
    setOAuthClientId("");
    setOAuthClientSecret("");
    setOAuthError(null);
    setOAuthDialogOpen(true);
    syncRouteState("integrations", nextProvider?.key, false, true);
  };

  const closeOAuthDialog = () => {
    setOAuthDialogOpen(false);
    setOAuthProvider(null);
    setOAuthClientId("");
    setOAuthClientSecret("");
    setOAuthScopes("");
    setOAuthError(null);
    syncRouteState("integrations", undefined, false, false);
  };

  const openCreateDialog = (provider: AiProviderId = "xai") => {
    setActiveTab("credentials");
    setOAuthDialogOpen(false);
    setEditingCredential(null);
    setCredentialDraft(buildCredentialDefaults(provider));
    setCreateError(null);
    setCreateDialogOpen(true);
    syncRouteState("credentials", provider, true);
  };

  const openEditDialog = (credential: Credential) => {
    const provider = resolveCredentialProvider(credential);
    setActiveTab("credentials");
    setEditingCredential(credential);
    setCredentialDraft(buildCredentialDraftFromExisting(credential));
    setCreateError(null);
    setCreateDialogOpen(true);
    syncRouteState("credentials", provider, true);
  };

  const openVariableDialog = async (variable?: WorkspaceVariable) => {
    setActiveTab("credentials");
    setVariableError(null);
    setVariableDialogOpen(true);
    syncRouteState("credentials", undefined, false, false);

    if (!variable) {
      setEditingVariableId(null);
      setVariableDraft(buildVariableDraft());
      return;
    }

    try {
      setVariableLoading(true);
      const asset = await api.getVaultAsset(variable.id);
      setEditingVariableId(variable.id);
      setVariableDraft({
        key: variable.key,
        value: typeof asset.secret?.value === "string" ? asset.secret.value : "",
        scope: variable.scope,
        masked: variable.masked,
      });
    } catch (err) {
      setVariableDialogOpen(false);
      toast({
        title: "Could not load variable",
        description: err instanceof Error ? err.message : "Failed to load the variable value.",
        variant: "destructive",
      });
    } finally {
      setVariableLoading(false);
    }
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreatePending(false);
    setCreateError(null);
    setEditingCredential(null);
    syncRouteState(activeTab, undefined, false, false);
  };

  const closeVariableDialog = () => {
    setVariableDialogOpen(false);
    setVariablePending(false);
    setVariableLoading(false);
    setVariableError(null);
    setEditingVariableId(null);
    setVariableDraft(buildVariableDraft());
  };

  useEffect(() => {
    const requestedProvider = searchParams.get("provider");
    const shouldOpen = searchParams.get("connect") === "1";
    if (activeTab !== "integrations" || !shouldOpen || !oauthProviders.length) {
      return;
    }

    const matchedProvider = requestedProvider
      ? oauthProviders.find((provider) => provider.key === requestedProvider)
      : oauthProviders[0];

    if (!matchedProvider) {
      return;
    }

    setOAuthProvider((current) => (current?.key === matchedProvider.key ? current : matchedProvider));
    setOAuthScopes((current) => (current ? current : matchedProvider.scopes || ""));
    setSetupDialogOpen(true);
  }, [activeTab, oauthProviders, searchParams]);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const providerKey = searchParams.get("provider") ?? undefined;
    if (!code || !state) {
      return;
    }

    setActiveTab("integrations");
    const clientSecret = sessionStorage.getItem(`flowholt_oauth_secret_${state}`) || "";
    if (!clientSecret) {
      setOAuthError("Missing OAuth client secret for callback completion. Start the connection again.");
      setSetupDialogOpen(true);
      syncRouteState("integrations", providerKey, false, true);
      return;
    }

    setOAuthBusy("callback");
    api.completeOAuth2(code, state, clientSecret)
      .then(async (result) => {
        sessionStorage.removeItem(`flowholt_oauth_secret_${state}`);
        await queryClient.invalidateQueries({ queryKey: ["vault-overview"] });
        await queryClient.invalidateQueries({ queryKey: ["oauth2-providers"] });
        toast({
          title: "OAuth connection saved",
          description: result.message,
        });
        setOAuthError(null);
        closeSetupDialog();
      })
      .catch((err) => {
        setOAuthError(err instanceof Error ? err.message : "OAuth callback failed.");
        setSetupDialogOpen(true);
        syncRouteState("integrations", providerKey, false, true);
      })
      .finally(() => {
        setOAuthBusy(null);
      });
  }, [queryClient, searchParams]);

  const beginOAuthConnection = async () => {
    if (!oauthProvider) {
      setOAuthError("Choose an app before starting the OAuth flow.");
      return;
    }
    if (!oauthClientId.trim() || !oauthClientSecret.trim()) {
      setOAuthError("Client ID and client secret are required.");
      return;
    }

    try {
      setOAuthBusy(oauthProvider.key);
      setOAuthError(null);
      const scopes = oauthScopes
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const redirectUri = `${window.location.origin}/dashboard/providers`;
      const result = await api.startOAuth2(oauthProvider.key, oauthClientId.trim(), redirectUri, scopes.length ? scopes : undefined);
      sessionStorage.setItem(`flowholt_oauth_secret_${result.state}`, oauthClientSecret.trim());
      window.location.href = result.authorize_url;
    } catch (err) {
      setOAuthError(err instanceof Error ? err.message : "Could not start OAuth flow.");
      setOAuthBusy(null);
    }
  };

  const handleVerifyAsset = async (assetId: string, assetName: string) => {
    try {
      const result = await api.verifyVaultAsset(assetId);
      await queryClient.invalidateQueries({ queryKey: ["vault-asset-health", assetId] });
      toast({
        title: result.verified ? `Verified ${assetName}` : `Verification failed for ${assetName}`,
        description: result.next_steps.length ? result.next_steps.join(" ") : "No additional steps were returned.",
        variant: result.verified ? "default" : "destructive",
      });
    } catch (err) {
      toast({
        title: "Verification failed",
        description: err instanceof Error ? err.message : "Could not verify asset.",
        variant: "destructive",
      });
    }
  };

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

  const connectionHealthQueries = useQueries({
    queries: connections.map((connection) => ({
      queryKey: ["vault-asset-health", connection.id],
      queryFn: () => api.getVaultAssetHealth(connection.id),
      enabled: activeTab === "integrations" || activeTab === "credentials" || activeTab === "ai",
      staleTime: 60_000,
      retry: 1,
    })),
  });

  const connectionHealthById = new Map(
    connections.map((connection, index) => [
      connection.id,
      summarizeHealthState(connectionHealthQueries[index] ?? { isLoading: true, error: null }, "connection"),
    ]),
  );

  const connectionByAppKey = new Map(connections.map((connection) => [connection.app.toLowerCase(), connection]));

  const credentials: Credential[] = vault.credentials.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.credential_type,
    scope: item.scope,
    lastUsed: item.last_used,
    status: item.status === "expired" ? "expired" : "active",
    app: item.app,
    secret: item.secret,
  }));

  const credentialHealthQueries = useQueries({
    queries: credentials.map((credential) => ({
      queryKey: ["vault-asset-health", credential.id],
      queryFn: () => api.getVaultAssetHealth(credential.id),
      enabled: activeTab === "credentials" || activeTab === "ai",
      staleTime: 60_000,
      retry: 1,
    })),
  });

  const credentialHealthById = new Map(
    credentials.map((credential, index) => [
      credential.id,
      summarizeHealthState(credentialHealthQueries[index] ?? { isLoading: true, error: null }, "credential"),
    ]),
  );

  const credentialByAppKey = new Map(credentials.filter((credential) => credential.app).map((credential) => [String(credential.app).toLowerCase(), credential]));

  const variables: WorkspaceVariable[] = vault.variables.map((item) => ({
    id: item.id,
    key: item.key,
    scope: item.scope,
    access: item.access,
    updatedAt: item.updated_at,
    masked: item.masked,
  }));

  const aiAppKeys = useMemo(() => new Set(aiCenterApps.map((app) => app.key)), [aiCenterApps]);
  const aiAppByKey = useMemo(() => new Map(aiCenterApps.map((app) => [app.key, app])), [aiCenterApps]);
  const aiCredentials = useMemo(
    () => credentials.filter((credential) => credential.app && aiAppKeys.has(String(credential.app).toLowerCase())),
    [aiAppKeys, credentials],
  );
  const aiConnections = useMemo(
    () => connections.filter((connection) => aiAppKeys.has(connection.app.toLowerCase())),
    [aiAppKeys, connections],
  );
  const configuredAiApps = useMemo(
    () => aiCenterApps.filter((app) => connectionByAppKey.has(app.key) || credentialByAppKey.has(app.key)),
    [aiCenterApps, connectionByAppKey, credentialByAppKey],
  );

  const selectAiCenterSection = (section: AiCenterSection) => {
    setActiveAiSection(section);
    setTabTransitioning(true);
    syncRouteState("ai", undefined, false, false, section);
  };

  // Tab transition loader — 1s fade-in when switching tabs or AI sections
  useEffect(() => {
    if (!tabTransitioning) return;
    const timer = setTimeout(() => setTabTransitioning(false), 1000);
    return () => clearTimeout(timer);
  }, [tabTransitioning]);

  const handleDeleteAsset = async () => {
    if (!pendingDeleteAsset) return;
    try {
      setDeletePending(true);
      await api.deleteVaultAsset(pendingDeleteAsset.id);
      queryClient.invalidateQueries({ queryKey: ["vault-overview"] });
      queryClient.invalidateQueries({ queryKey: ["vault-asset-health"] });
      toast({
        title: "Asset deleted",
        description: `${pendingDeleteAsset.name} was removed from the vault.`,
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete asset.",
        variant: "destructive",
      });
    } finally {
      setDeletePending(false);
      setPendingDeleteAsset(null);
    }
  };

  const handleSaveVariable = async () => {
    const trimmedKey = variableDraft.key.trim();
    const trimmedValue = variableDraft.value.trim();

    if (!trimmedKey || !trimmedValue) {
      setVariableError("Variable key and value are required.");
      return;
    }
    if (trimmedKey.length > 50) {
      setVariableError("Variable keys must be 50 characters or fewer.");
      return;
    }
    if (trimmedValue.length > 1000) {
      setVariableError("Variable values must be 1000 characters or fewer.");
      return;
    }
    if (!VARIABLE_KEY_PATTERN.test(trimmedKey)) {
      setVariableError("Use only letters, numbers, and underscores in variable keys.");
      return;
    }

    try {
      setVariablePending(true);
      setVariableError(null);
      const payload = {
        name: trimmedKey,
        scope: variableDraft.scope,
        access: "read-only",
        status: "active",
        masked: variableDraft.masked,
        secret: {
          value: trimmedValue,
        },
      };
      if (editingVariableId) {
        await api.updateVaultAsset(editingVariableId, payload);
      } else {
        await api.createVaultAsset({ kind: "variable", ...payload });
      }
      await queryClient.invalidateQueries({ queryKey: ["vault-overview"] });
      toast({
        title: editingVariableId ? "Variable updated" : "Variable added",
        description: `${trimmedKey} is now available as ${getVariableUsageSnippet(trimmedKey)} in workflows.`,
      });
      closeVariableDialog();
    } catch (err) {
      setVariableError(err instanceof Error ? err.message : "Could not save the variable.");
    } finally {
      setVariablePending(false);
    }
  };

  const handleCreateCredential = async () => {
    const credentialName = credentialDraft.name.trim();
    const existingApiKey = typeof editingCredential?.secret?.api_key === "string" ? editingCredential.secret.api_key : "";
    const apiKey = credentialDraft.apiKey.trim() || existingApiKey;
    if (!credentialName || !apiKey) {
      setCreateError("Provider name and API key are required.");
      return;
    }

    try {
      setCreatePending(true);
      setCreateError(null);
      const preset = AI_PROVIDER_PRESETS[credentialDraft.provider];
      const payload = {
        name: credentialName,
        app: credentialDraft.provider,
        subtitle: preset.description,
        credential_type: "api_key",
        scope: "workspace" as const,
        status: "active",
        secret: {
          api_key: apiKey,
          model: credentialDraft.model.trim() || preset.model,
          ...(credentialDraft.baseUrl.trim() ? { base_url: credentialDraft.baseUrl.trim() } : {}),
        },
      };
      if (editingCredential) {
        await api.updateVaultAsset(editingCredential.id, payload);
      } else {
        await api.createVaultAsset({ kind: "credential", ...payload });
      }
      await queryClient.invalidateQueries({ queryKey: ["vault-overview"] });
      toast({
        title: editingCredential ? "Credential updated" : "Credential added",
        description: editingCredential
          ? `${preset.label} is ready in the chat model picker.`
          : `${preset.label} is now available in the chat model picker.`,
      });
      closeCreateDialog();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not save the credential.");
    } finally {
      setCreatePending(false);
    }
  };

  const handleSetupAction = async () => {
    if (!selectedSetupApp) {
      setSetupError("Choose an app before continuing.");
      return;
    }

    if (selectedSetupApp.authKind === "oauth") {
      await beginOAuthConnection();
      return;
    }

    if (selectedSetupApp.authKind === "none") {
      setSetupError("This app does not require a stored credential yet. Studio handoff will be added in the next phase.");
      return;
    }

    const trimmedName = setupCredentialName.trim() || `${selectedSetupApp.label} credential`;

    try {
      setSetupPending(true);
      setSetupError(null);

      const secret: Record<string, unknown> = {};
      let credentialType = selectedSetupApp.defaultCredentialType ?? "api_key";

      if (selectedSetupApp.authKind === "webhook") {
        if (!setupWebhookUrl.trim()) {
          setSetupError("Webhook URL is required.");
          return;
        }
        credentialType = "webhook";
        secret.webhook_url = setupWebhookUrl.trim();
        if (setupWebhookSecret.trim()) {
          secret.signing_secret = setupWebhookSecret.trim();
        }
      } else if (selectedSetupApp.authKind === "database") {
        if (!setupSecretValue.trim()) {
          setSetupError("Connection string is required.");
          return;
        }
        credentialType = "database";
        secret.connection_string = setupSecretValue.trim();
      } else if (selectedSetupApp.authKind === "token") {
        if (!setupSecretValue.trim()) {
          setSetupError("Access token is required.");
          return;
        }
        credentialType = "token";
        secret.token = setupSecretValue.trim();
      } else {
        if (!setupSecretValue.trim()) {
          setSetupError("API key is required.");
          return;
        }
        credentialType = "api_key";
        secret.api_key = setupSecretValue.trim();
      }

      if (setupEndpoint.trim()) {
        secret.base_url = setupEndpoint.trim();
      }
      if (setupModel.trim()) {
        secret.model = setupModel.trim();
      }

      await api.createVaultAsset({
        kind: "credential",
        name: trimmedName,
        app: selectedSetupApp.key,
        subtitle: selectedSetupApp.description,
        credential_type: credentialType,
        scope: "workspace",
        status: "active",
        secret,
      });

      await queryClient.invalidateQueries({ queryKey: ["vault-overview"] });
      toast({
        title: `${selectedSetupApp.label} saved`,
        description: `${selectedSetupApp.label} is now available in Vault credentials for this workspace.`,
      });
      closeSetupDialog();
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Could not save the app setup.");
    } finally {
      setSetupPending(false);
    }
  };

  // ── Dynamic provider models for the Models tab ───────────────────────
  const configuredProviderIds = useMemo(
    () => configuredAiApps.map((app) => app.key),
    [configuredAiApps],
  );

  const providerModelQueries = useQueries({
    queries: configuredProviderIds.map((providerId) => ({
      queryKey: ["provider-models", providerId],
      queryFn: () => api.listProviderModels(providerId),
      enabled: activeTab === "ai" && activeAiSection === "models",
      staleTime: 2 * 60_000,
      retry: 1,
    })),
  });

  const allProviderModels = useMemo(() => {
    const result: Array<ApiProviderModel & { provider: string; providerName: string }> = [];
    configuredProviderIds.forEach((providerId, index) => {
      const query = providerModelQueries[index];
      if (query?.data?.models) {
        const providerApp = aiAppByKey.get(providerId);
        query.data.models.forEach((m) => {
          result.push({ ...m, provider: providerId, providerName: providerApp?.label ?? providerId });
        });
      }
    });
    return result;
  }, [configuredProviderIds, providerModelQueries, aiAppByKey]);

  const modelsLoading = providerModelQueries.some((q) => q.isLoading);

  return (
    loading ? (
      <SplitSettingsLoader />
    ) : (
    <div className="mx-auto max-w-[1440px] animate-fade-in px-6 pb-24 pt-6">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-[-0.01em]">Vault</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">Manage integrations, providers, and credentials.</p>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setTabTransitioning(true);
              syncRouteState(tab.id, undefined, false, false, tab.id === "ai" ? activeAiSection : undefined);
            }}
            className={cn(
              "relative pb-2.5 text-[13px] font-medium transition-colors",
              activeTab === tab.id
                ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-slate-900 after:rounded-full"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab transition loader ─────────────────────────────── */}
      {tabTransitioning && (
        <div className="animate-pulse space-y-4 py-4">
          <div className="flex gap-3">
            <div className="h-9 w-48 rounded-lg bg-slate-100" />
            <div className="h-9 w-32 rounded-lg bg-slate-100" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-24 rounded bg-slate-100" />
                    <div className="h-3 w-40 rounded bg-slate-100" />
                  </div>
                  <div className="h-8 w-20 rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && !tabTransitioning && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      {/* ════════════════════════════════════════════════════════════
          INTEGRATIONS TAB
         ════════════════════════════════════════════════════════════ */}
      {!error && !tabTransitioning && activeTab === "integrations" && (
        <div className="space-y-4">
          {/* Search + action */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={catalogSearch}
                onChange={(event) => setCatalogSearch(event.target.value)}
                placeholder="Search Gmail, Discord, Google Drive..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
              />
            </div>
            <button onClick={() => openSetupDialog(undefined, "integrations")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50">
              <Plus size={14} />
              Connect app
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCatalogApps.map((app) => {
              const isConnected = Boolean(connectionByAppKey.get(app.key) || credentialByAppKey.get(app.key));
              return (
                <div
                  key={app.key}
                  className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt="" className="h-5 w-5 object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-slate-400">{app.label.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-slate-900">{app.label}</span>
                      {isConnected && <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">Connected</span>}
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-slate-400">{app.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openSetupDialog(app, app.group === "ai" ? "ai" : "integrations")}
                    className={cn(
                      "shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
                      isConnected
                        ? "border-slate-200 text-slate-500 hover:bg-slate-50"
                        : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                    )}
                  >
                    {isConnected ? "Manage" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
          {visibleCatalogApps.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center text-[13px] text-slate-400">No apps matched that search.</div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          AI CENTER TAB — Left sidebar rail + content area
         ════════════════════════════════════════════════════════════ */}
      {!error && !tabTransitioning && activeTab === "ai" && (
        <div className="flex gap-6">
          {/* Left sidebar rail */}
          <nav className="hidden w-[200px] shrink-0 md:block">
            <div className="space-y-0.5">
              {aiCenterSections.map((section) => {
                const SectionIcon = section.icon;
                const isActive = activeAiSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => selectAiCenterSection(section.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    )}
                  >
                    <SectionIcon size={15} className={isActive ? "text-slate-700" : "text-slate-400"} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Mobile section selector */}
          <div className="mb-4 flex flex-wrap gap-1.5 md:hidden">
            {aiCenterSections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectAiCenterSection(section.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                    activeAiSection === section.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  <SectionIcon size={13} />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Content area */}
          <div className="min-w-0 flex-1">
            {/* Section header + search + action */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">{aiCenterSections.find((s) => s.id === activeAiSection)?.label}</h2>
                <p className="mt-0.5 text-[13px] text-slate-500">{aiCenterSections.find((s) => s.id === activeAiSection)?.description}</p>
              </div>
            </div>

            {activeAiSection === "providers" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={catalogSearch}
                      onChange={(event) => setCatalogSearch(event.target.value)}
                      placeholder="Search OpenAI, Anthropic, Groq..."
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
                    />
                  </div>
                  <button onClick={() => openSetupDialog(undefined, "ai")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50">
                    <Sparkles size={14} />
                    Connect provider
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleCatalogApps.map((app) => {
                    const isConnected = Boolean(connectionByAppKey.get(app.key) || credentialByAppKey.get(app.key));
                    return (
                      <div
                        key={app.key}
                        className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-all hover:border-slate-300 hover:shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                          {app.iconUrl ? (
                            <img src={app.iconUrl} alt="" className="h-5 w-5 object-contain" />
                          ) : (
                            <span className="text-[10px] font-bold uppercase text-slate-400">{app.label.slice(0, 2)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-slate-900">{app.label}</span>
                            {isConnected && <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">Connected</span>}
                          </div>
                          <p className="mt-0.5 truncate text-[12px] text-slate-400">{app.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openSetupDialog(app, "ai")}
                          className={cn(
                            "shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
                            isConnected
                              ? "border-slate-200 text-slate-500 hover:bg-slate-50"
                              : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                          )}
                        >
                          {isConnected ? "Manage" : "Connect"}
                        </button>
                      </div>
                    );
                  })}
                  {visibleCatalogApps.length === 0 && (
                    <div className="col-span-full rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center text-[13px] text-slate-400">No providers matched.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── Models (dynamic) ──────────────────── */}
            {activeAiSection === "models" && (
              <div className="space-y-4">
                {configuredProviderIds.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center">
                    <Layers size={20} className="mx-auto mb-2 text-slate-300" />
                    <div className="text-[13px] text-slate-500">Connect a provider first to see available models.</div>
                    <button onClick={() => selectAiCenterSection("providers")} className="mt-3 text-[12px] font-medium text-slate-900 hover:underline">Go to Providers</button>
                  </div>
                ) : modelsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={18} className="animate-spin text-slate-400" />
                    <span className="ml-2 text-[13px] text-slate-500">Loading models from providers...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-[12px] text-slate-500">
                      <span>{allProviderModels.length} models from {configuredProviderIds.length} provider{configuredProviderIds.length === 1 ? "" : "s"}</span>
                    </div>

                    {/* Model list table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/60">
                            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Model</th>
                            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Provider</th>
                            <th className="hidden px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Context</th>
                            <th className="hidden px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 lg:table-cell">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allProviderModels.map((model) => {
                            const isDefault = chatModels.some((p) => p.is_default && p.id === model.provider && p.model === model.id);
                            return (
                              <tr key={`${model.provider}-${model.id}`} className="transition-colors hover:bg-slate-50/60">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-medium text-slate-900">{model.name || model.id}</span>
                                    {isDefault && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">Default</span>}
                                  </div>
                                  {model.id !== model.name && <div className="mt-0.5 text-[11px] text-slate-400 font-mono">{model.id}</div>}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const icon = getAppIcon(model.provider);
                                      return icon ? <img src={icon} alt="" className="h-4 w-4 object-contain" /> : null;
                                    })()}
                                    <span className="text-[12px] text-slate-600">{model.providerName}</span>
                                  </div>
                                </td>
                                <td className="hidden px-4 py-3 md:table-cell">
                                  <span className="text-[12px] text-slate-500">
                                    {model.context_window ? `${(model.context_window / 1000).toFixed(0)}k` : "—"}
                                  </span>
                                </td>
                                <td className="hidden px-4 py-3 lg:table-cell">
                                  <span className="text-[12px] text-slate-400">{model.type}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {allProviderModels.length === 0 && !modelsLoading && (
                        <div className="px-4 py-8 text-center text-[13px] text-slate-400">No models returned from configured providers.</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          CREDENTIALS TAB — Clean straightforward list
         ════════════════════════════════════════════════════════════ */}
      {!error && !tabTransitioning && activeTab === "credentials" && (
        <div className="space-y-6">
          {/* Search + action */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={catalogSearch}
                onChange={(event) => setCatalogSearch(event.target.value)}
                placeholder="Search credentials, accounts, variables..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
              />
            </div>
            <button onClick={() => openSetupDialog(undefined, "credentials")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50">
              <KeyRound size={14} />
              Add credential
            </button>
          </div>
          {/* Saved credentials */}
          <div>
            <div className="mb-3">
              <h2 className="text-[14px] font-semibold text-slate-900">Credentials</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {credentials.length === 0 ? (
                <div className="px-4 py-10 text-center text-[13px] text-slate-400">No credentials saved yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {credentials.map((item) => {
                    const health = credentialHealthById.get(item.id) ?? { tone: "checking" as const, label: "Checking", message: "" };
                    const icon = getAppIcon(String(item.app ?? ""));
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-slate-50/60">
                        <div className="flex items-center gap-3 min-w-0">
                          {icon ? (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                              <img src={icon} alt="" className="h-4 w-4 object-contain" />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                              <KeyRound size={14} className="text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-slate-900">{item.name}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              <span>{item.app ?? "custom"}</span>
                              <span>·</span>
                              <span>{item.type}</span>
                              <span>·</span>
                              <span>{item.scope}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            health.tone === "healthy" && "bg-emerald-50 text-emerald-600",
                            health.tone === "attention" && "bg-amber-50 text-amber-600",
                            health.tone === "checking" && "bg-slate-100 text-slate-500",
                          )}>
                            {health.label}
                          </span>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            item.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500",
                          )}>
                            {item.status === "active" ? "Active" : "Expired"}
                          </span>
                          <button onClick={() => handleVerifyAsset(item.id, item.name)} className="h-7 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">Verify</button>
                          {isAiProviderId(item.app ?? null) && <button onClick={() => openEditDialog(item)} className="h-7 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>}
                          <button onClick={() => setPendingDeleteAsset({ id: item.id, name: item.name })} className="h-7 w-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Connected accounts */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-slate-900">Connected accounts</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {connections.length === 0 ? (
                <div className="px-4 py-10 text-center text-[13px] text-slate-400">No connected accounts yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {connections.map((item) => {
                    const health = connectionHealthById.get(item.id) ?? { tone: "checking" as const, label: "Checking", message: "" };
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-slate-50/60">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                            <img src={item.logoUrl} alt="" className="h-4 w-4 object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-slate-900">{item.name}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              <span>{item.subtitle}</span>
                              <span>·</span>
                              <span>{item.workflows} flows</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            health.tone === "healthy" && "bg-emerald-50 text-emerald-600",
                            health.tone === "attention" && "bg-amber-50 text-amber-600",
                            health.tone === "checking" && "bg-slate-100 text-slate-500",
                          )}>
                            {health.label}
                          </span>
                          <button onClick={() => openSetupDialog(allVaultApps.find((app) => app.key === item.app.toLowerCase()) ?? null, "integrations")} className="h-7 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">Reconnect</button>
                          <button onClick={() => handleVerifyAsset(item.id, item.name)} className="h-7 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">Verify</button>
                          <button onClick={() => setPendingDeleteAsset({ id: item.id, name: item.name })} className="h-7 w-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Runtime variables */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-slate-900">Variables</h2>
              <button onClick={() => void openVariableDialog()} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {variables.length === 0 ? (
                <div className="px-4 py-10 text-center text-[13px] text-slate-400">No variables yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {variables.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-slate-50/60">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium font-mono text-slate-900">{item.key}</span>
                          {item.masked && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">Masked</span>}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">{getVariableUsageSnippet(item.key)} · {item.scope}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => void openVariableDialog(item)} className="h-7 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
                        <button onClick={() => setPendingDeleteAsset({ id: item.id, name: item.key })} className="h-7 w-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          CUSTOM APP TAB
         ════════════════════════════════════════════════════════════ */}
      {!error && !tabTransitioning && activeTab === "custom" && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={catalogSearch}
                onChange={(event) => setCatalogSearch(event.target.value)}
                placeholder="Search custom apps..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
              />
            </div>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50">
              <Braces size={14} />
              Create custom app
            </button>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 px-6 py-8">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Coming soon</div>
            <h3 className="text-[16px] font-semibold text-slate-900">Custom App</h3>
            <p className="mt-1 max-w-lg text-[13px] leading-6 text-slate-500">Create private team-only apps from HTTP/API definitions, authentication, webhook support, and reusable actions.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {CUSTOM_APP_STARTERS.map((starter) => (
              <div key={starter.key} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500 mb-3">
                  <Braces size={15} />
                </div>
                <div className="text-[13px] font-medium text-slate-900">{starter.title}</div>
                <div className="mt-1 text-[12px] leading-5 text-slate-400">{starter.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          DIALOGS
         ═══════════════════════════════════════════════════════════ */}

      {/* Delete confirmation */}
      <AlertDialog open={pendingDeleteAsset != null} onOpenChange={(open) => {
        if (!open && !deletePending) setPendingDeleteAsset(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete vault asset?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteAsset ? `Delete "${pendingDeleteAsset.name}"? This cannot be undone.` : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePending}
              onClick={(event) => { event.preventDefault(); void handleDeleteAsset(); }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit AI credential dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        if (!open && !createPending) closeCreateDialog();
      }}>
        <DialogContent className="max-w-[560px] border-slate-200 bg-white p-0">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
            <DialogTitle className="text-[15px] text-slate-900">{editingCredential ? "Edit credential" : "Add AI credential"}</DialogTitle>
            <DialogDescription className="text-[12px] text-slate-500">
              {editingCredential ? "Update model defaults or rotate the API key." : "Save a provider key to unlock it for this workspace."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4">
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Provider</label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(AI_PROVIDER_PRESETS).map(([providerId, preset]) => (
                  <button
                    key={providerId}
                    type="button"
                    onClick={() => {
                      const nextProvider = providerId as AiProviderId;
                      setCredentialDraft(buildCredentialDefaults(nextProvider));
                      syncRouteState("credentials", nextProvider, true);
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left transition-colors",
                      credentialDraft.provider === providerId
                        ? "border-slate-300 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <div className="text-[12px] font-medium text-slate-900">{preset.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Name</label>
                <input
                  value={credentialDraft.name}
                  onChange={(event) => setCredentialDraft((c) => ({ ...c, name: event.target.value }))}
                  placeholder="e.g. Team OpenAI key"
                  className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Model</label>
                <input
                  value={credentialDraft.model}
                  onChange={(event) => setCredentialDraft((c) => ({ ...c, model: event.target.value }))}
                  placeholder={AI_PROVIDER_PRESETS[credentialDraft.provider].model}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">API key</label>
              <input
                type="password"
                value={credentialDraft.apiKey}
                onChange={(event) => setCredentialDraft((c) => ({ ...c, apiKey: event.target.value }))}
                placeholder={editingCredential ? "Leave blank to keep current key" : "Paste the provider key"}
                className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Base URL</label>
              <input
                value={credentialDraft.baseUrl}
                onChange={(event) => setCredentialDraft((c) => ({ ...c, baseUrl: event.target.value }))}
                placeholder={AI_PROVIDER_PRESETS[credentialDraft.provider].baseUrl || "Optional override"}
                className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
              />
            </div>

            {createError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{createError}</div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 px-5 py-3">
            <button type="button" onClick={closeCreateDialog} disabled={createPending} className="h-8 rounded-lg border border-slate-200 px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button
              type="button"
              onClick={() => void handleCreateCredential()}
              disabled={createPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-[12px] font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {createPending ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {editingCredential ? "Save" : "Save credential"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Setup dialog (connect app) */}
      <Dialog open={setupDialogOpen} onOpenChange={(open) => {
        if (!open && !setupPending && !oauthBusy) closeSetupDialog();
      }}>
        <DialogContent className="max-w-[860px] border-slate-200 bg-white p-0">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
            <DialogTitle className="text-[15px] text-slate-900">{selectedSetupApp?.setupTitle ?? "Configure app"}</DialogTitle>
            <DialogDescription className="text-[12px] text-slate-500">
              {selectedSetupApp?.setupHint ?? "Pick an app to start."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* App list sidebar */}
            <div className="border-b border-slate-100 bg-slate-50/50 p-3 lg:border-b-0 lg:border-r">
              <div className="grid gap-1 max-h-[420px] overflow-y-auto">
                {(activeTab === "credentials" || activeTab === "custom" ? allVaultApps : visibleCatalogApps).map((app) => {
                  const isSelected = selectedSetupApp?.key === app.key;
                  const isConnected = connectionByAppKey.has(app.key) || credentialByAppKey.has(app.key);
                  return (
                    <button
                      key={app.key}
                      type="button"
                      onClick={() => {
                        primeSetupFields(app);
                        syncRouteState(activeTab === "credentials" ? app.group : activeTab, app.key, false, app.authKind === "oauth");
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                        isSelected ? "bg-white shadow-sm border border-slate-200" : "hover:bg-white/70",
                      )}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-100 bg-white">
                        {app.iconUrl ? <img src={app.iconUrl} alt="" className="h-4 w-4 object-contain" /> : <span className="text-[9px] font-bold uppercase text-slate-400">{app.label.slice(0, 2)}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-medium text-slate-800 truncate">{app.label}</span>
                          {isConnected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Setup form */}
            <div className="p-5">
              {!selectedSetupApp ? (
                <div className="rounded-lg border border-dashed border-slate-200 px-5 py-8 text-center text-[13px] text-slate-400">Choose an app from the left.</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                      {selectedSetupApp.iconUrl ? <img src={selectedSetupApp.iconUrl} alt="" className="h-5 w-5 object-contain" /> : <span className="text-[11px] font-bold uppercase text-slate-400">{selectedSetupApp.label.slice(0, 2)}</span>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-slate-900">{selectedSetupApp.label}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{getAuthLabel(selectedSetupApp.authKind)}</span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-slate-500">{selectedSetupApp.description}</p>
                    </div>
                  </div>

                  {/* OAuth setup */}
                  {selectedSetupApp.authKind === "oauth" && (
                    oauthProvider ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="grid gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Client ID</label>
                            <input value={oauthClientId} onChange={(e) => setOAuthClientId(e.target.value)} placeholder="OAuth client ID" className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                          </div>
                          <div className="grid gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Client secret</label>
                            <input type="password" value={oauthClientSecret} onChange={(e) => setOAuthClientSecret(e.target.value)} placeholder="OAuth client secret" className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Scopes</label>
                          <input value={oauthScopes} onChange={(e) => setOAuthScopes(e.target.value)} placeholder="Comma-separated scopes" className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                          Redirect URI: {typeof window !== "undefined" ? `${window.location.origin}/dashboard/providers` : "/dashboard/providers"}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-[12px] text-amber-700">OAuth provider not available for this app yet.</div>
                    )
                  )}

                  {/* API key / Token / Database setup */}
                  {(selectedSetupApp.authKind === "api_key" || selectedSetupApp.authKind === "token" || selectedSetupApp.authKind === "database") && (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Name</label>
                          <input value={setupCredentialName} onChange={(e) => setSetupCredentialName(e.target.value)} placeholder={`${selectedSetupApp.label} credential`} className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{selectedSetupApp.authKind === "database" ? "Connection string" : selectedSetupApp.authKind === "token" ? "Access token" : "API key"}</label>
                          <input type="password" value={setupSecretValue} onChange={(e) => setSetupSecretValue(e.target.value)} placeholder="Paste secret" className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Endpoint</label>
                          <input value={setupEndpoint} onChange={(e) => setSetupEndpoint(e.target.value)} placeholder={selectedSetupApp.defaultBaseUrl || "Optional"} className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                        </div>
                        {selectedSetupApp.group === "ai" && (
                          <div className="grid gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Model</label>
                            <input value={setupModel} onChange={(e) => setSetupModel(e.target.value)} placeholder={selectedSetupApp.defaultModel || "Optional"} className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Webhook setup */}
                  {selectedSetupApp.authKind === "webhook" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Webhook URL</label>
                        <input value={setupWebhookUrl} onChange={(e) => setSetupWebhookUrl(e.target.value)} placeholder="https://..." className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Signing secret</label>
                        <input type="password" value={setupWebhookSecret} onChange={(e) => setSetupWebhookSecret(e.target.value)} placeholder="Optional" className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                      </div>
                    </div>
                  )}

                  {/* No auth */}
                  {selectedSetupApp.authKind === "none" && (
                    <div className="rounded-lg bg-slate-50 px-3 py-3 text-[12px] text-slate-500">This app does not require stored credentials.</div>
                  )}

                  {(setupError || oauthError) && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{setupError || oauthError}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 px-5 py-3">
            <button type="button" onClick={closeSetupDialog} disabled={setupPending || !!oauthBusy} className="h-8 rounded-lg border border-slate-200 px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button
              type="button"
              onClick={() => void handleSetupAction()}
              disabled={setupPending || !!oauthBusy || !selectedSetupApp}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-[12px] font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {(setupPending || oauthBusy) && <Loader2 size={12} className="animate-spin" />}
              {selectedSetupApp?.authKind === "oauth" ? "Start OAuth" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variable dialog */}
      <Dialog open={variableDialogOpen} onOpenChange={(open) => {
        if (!open && !variablePending && !variableLoading) closeVariableDialog();
      }}>
        <DialogContent className="max-w-[440px] border-slate-200 bg-white p-0">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
            <DialogTitle className="text-[15px] text-slate-900">{editingVariableId ? "Edit variable" : "Add variable"}</DialogTitle>
            <DialogDescription className="text-[12px] text-slate-500">Variables are available as {getVariableUsageSnippet("KEY")} in workflows.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 px-5 py-4">
            {variableLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={16} className="animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                <div className="grid gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Key</label>
                  <input value={variableDraft.key} onChange={(e) => setVariableDraft((c) => ({ ...c, key: e.target.value }))} placeholder="MY_VARIABLE" className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] font-mono outline-none focus:border-slate-300" />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Value</label>
                  <input type={variableDraft.masked ? "password" : "text"} value={variableDraft.value} onChange={(e) => setVariableDraft((c) => ({ ...c, value: e.target.value }))} placeholder="Variable value" className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-300" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                  <div>
                    <div className="text-[12px] font-medium text-slate-700">Masked</div>
                    <div className="text-[11px] text-slate-400">Hide value in logs and UI</div>
                  </div>
                  <Switch checked={variableDraft.masked} onCheckedChange={(checked) => setVariableDraft((c) => ({ ...c, masked: checked }))} />
                </div>
              </>
            )}

            {variableError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{variableError}</div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 px-5 py-3">
            <button type="button" onClick={closeVariableDialog} disabled={variablePending || variableLoading} className="h-8 rounded-lg border border-slate-200 px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button
              type="button"
              onClick={() => void handleSaveVariable()}
              disabled={variablePending || variableLoading}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-[12px] font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {variablePending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              {editingVariableId ? "Save" : "Create"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    )
  );
};

export default CredentialsPageLive;