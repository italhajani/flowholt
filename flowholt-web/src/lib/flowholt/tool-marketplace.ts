import { toolRegistry, type ToolMarketplaceCategoryKey } from "./tool-registry.ts";

export type MarketplaceConnection = {
  id: string;
  provider: string;
  label: string;
  description?: string;
  config?: Record<string, unknown>;
};

export type ToolMarketplaceReadiness = "ready" | "partial" | "missing";
export type ToolMarketplaceTone = "default" | "mint" | "sand";
export type ToolMarketplaceFamily = "provider_pack" | "workflow_pack";
export type ToolMarketplaceProfileKey =
  | "groq"
  | "hubspot"
  | "notion"
  | "google_sheets"
  | "slack"
  | "generic_http"
  | "generic_webhook";

export type ToolMarketplaceProfile = {
  key: ToolMarketplaceProfileKey;
  title: string;
  provider: string;
  summary: string;
};

export type ToolMarketplaceKit = {
  key: string;
  title: string;
  description: string;
  category: ToolMarketplaceCategoryKey;
  family: ToolMarketplaceFamily;
  requiredProviders: string[];
  expectedProfiles: ToolMarketplaceProfileKey[];
  readiness: ToolMarketplaceReadiness;
  readinessDetail: string;
  matchingConnectionCount: number;
  matchingConnections: MarketplaceConnection[];
  detectedProfiles: ToolMarketplaceProfile[];
  recommendedToolKeys: string[];
  idealFor: string;
  recommendedStrategy: string;
  setupHint: string;
  featured: boolean;
  tone: ToolMarketplaceTone;
};

export type ToolMarketplaceCategory = {
  key: ToolMarketplaceCategoryKey;
  title: string;
  description: string;
  kits: ToolMarketplaceKit[];
};

export type ToolMarketplaceSummary = {
  totalKits: number;
  readyKits: number;
  partialKits: number;
  missingKits: number;
  providerPacks: number;
  workflowPacks: number;
  featuredKits: ToolMarketplaceKit[];
  featuredWorkflowPacks: ToolMarketplaceKit[];
};

export type ToolMarketplaceComposerSuggestion = {
  id: string;
  kitKey: string;
  title: string;
  readiness: ToolMarketplaceReadiness;
  tone: ToolMarketplaceTone;
  prompt: string;
  strategy: string;
  why: string;
  profiles: string[];
};

const MARKETPLACE_CATEGORY_META: Record<ToolMarketplaceCategoryKey, { title: string; description: string }> = {
  ai_agents: {
    title: "AI & Agents",
    description: "Agent models, reasoning steps, and future memory/tool orchestration kits.",
  },
  search_research: {
    title: "Search & Research",
    description: "Look up knowledge before an agent decides, writes, or routes work onward.",
  },
  crm_operations: {
    title: "CRM & Operations",
    description: "Write business records, append operational rows, and keep teams in sync.",
  },
  delivery_webhooks: {
    title: "Delivery & Webhooks",
    description: "Send callbacks or final payloads back to the system that started the run.",
  },
  custom_http: {
    title: "Custom HTTP",
    description: "Flexible custom APIs and one-off endpoints when no named preset exists yet.",
  },
};

const PROFILE_META: Record<ToolMarketplaceProfileKey, ToolMarketplaceProfile> = {
  groq: {
    key: "groq",
    title: "Groq",
    provider: "groq",
    summary: "Fast shared model connection for creator, planner, and reviewer agents.",
  },
  hubspot: {
    key: "hubspot",
    title: "HubSpot",
    provider: "http",
    summary: "CRM-ready HTTP profile for lead and customer sync operations.",
  },
  notion: {
    key: "notion",
    title: "Notion",
    provider: "http",
    summary: "Knowledge API profile for search, docs, and structured workspace context.",
  },
  google_sheets: {
    key: "google_sheets",
    title: "Google Sheets",
    provider: "http",
    summary: "Spreadsheet-oriented API profile for logging, handoff queues, and reporting rows.",
  },
  slack: {
    key: "slack",
    title: "Slack",
    provider: "webhook",
    summary: "Webhook delivery profile for callbacks, notifications, and outbound team updates.",
  },
  generic_http: {
    key: "generic_http",
    title: "Generic HTTP",
    provider: "http",
    summary: "Fallback HTTP profile for custom APIs when no named vendor profile is detected.",
  },
  generic_webhook: {
    key: "generic_webhook",
    title: "Generic webhook",
    provider: "webhook",
    summary: "Fallback webhook profile for generic inbound or outbound delivery flows.",
  },
};

const MARKETPLACE_KITS = [
  {
    key: "groq-agent-kit",
    title: "Groq agent kit",
    description: "Primary agent model connection for creator, planner, reviewer, and chat-first workflow steps.",
    category: "ai_agents",
    family: "provider_pack",
    requiredProviders: ["groq"],
    expectedProfiles: ["groq"],
    recommendedToolKeys: [],
    idealFor: "Creator, planner, reviewer, or summarizer style agent steps.",
    recommendedStrategy: "Start with workspace default, then add read_then_write once tool chains grow.",
    setupHint: "Add one strong Groq connection so agent nodes can use the workspace default model cleanly.",
    featured: true,
    tone: "default",
  },
  {
    key: "knowledge-search-kit",
    title: "Knowledge search kit",
    description: "Search connected docs or knowledge APIs before later reasoning or writeback.",
    category: "search_research",
    family: "provider_pack",
    requiredProviders: ["http"],
    expectedProfiles: ["notion", "generic_http"],
    recommendedToolKeys: ["knowledge-lookup"],
    idealFor: "Research-first flows, support copilots, and answer-generation steps.",
    recommendedStrategy: "Use read_then_write so lookup happens before any CRM or outbound tool step.",
    setupHint: "Connect one HTTP knowledge API and use it with the Knowledge lookup preset.",
    featured: true,
    tone: "mint",
  },
  {
    key: "crm-sync-kit",
    title: "CRM sync kit",
    description: "Push qualified results into a CRM after the workflow is ready to commit business data.",
    category: "crm_operations",
    family: "provider_pack",
    requiredProviders: ["http"],
    expectedProfiles: ["hubspot", "generic_http"],
    recommendedToolKeys: ["crm-upsert"],
    idealFor: "Lead intake, qualification, sales ops, and customer sync flows.",
    recommendedStrategy: "Place this after agent review or after a research step finishes.",
    setupHint: "Use an active HTTP connection with your CRM base URL and API auth details.",
    featured: true,
    tone: "mint",
  },
  {
    key: "spreadsheet-ops-kit",
    title: "Spreadsheet ops kit",
    description: "Append operational rows for tracking, fulfillment, or reporting handoffs.",
    category: "crm_operations",
    family: "provider_pack",
    requiredProviders: ["http"],
    expectedProfiles: ["google_sheets", "generic_http"],
    recommendedToolKeys: ["spreadsheet-row"],
    idealFor: "Ops handoffs, fulfillment queues, and lightweight reporting lanes.",
    recommendedStrategy: "Use fan_out when you want reporting and writeback to happen in parallel.",
    setupHint: "Connect a sheet or spreadsheet-style API through the reusable HTTP connection profile.",
    featured: false,
    tone: "sand",
  },
  {
    key: "delivery-webhook-kit",
    title: "Delivery webhook kit",
    description: "Return callbacks or outbound delivery payloads to the origin system.",
    category: "delivery_webhooks",
    family: "provider_pack",
    requiredProviders: ["webhook", "http"],
    expectedProfiles: ["slack", "generic_webhook", "generic_http"],
    recommendedToolKeys: ["webhook-reply"],
    idealFor: "Callbacks, status updates, and final delivery to external systems.",
    recommendedStrategy: "Keep this near the end so upstream agent and tool work finishes first.",
    setupHint: "Best when the trigger side and outbound delivery side are both wired in the same workspace.",
    featured: true,
    tone: "sand",
  },
  {
    key: "custom-http-kit",
    title: "Custom API kit",
    description: "General-purpose API calls when your workflow needs a custom integration pattern.",
    category: "custom_http",
    family: "provider_pack",
    requiredProviders: ["http"],
    expectedProfiles: ["generic_http"],
    recommendedToolKeys: ["http-request"],
    idealFor: "Custom vendor APIs, quick experiments, and bridges to systems we do not preset yet.",
    recommendedStrategy: "Use single for one-off calls or fan_out when one agent triggers several APIs.",
    setupHint: "Start with the HTTP connection template, then adapt headers, tokens, or base URL.",
    featured: false,
    tone: "default",
  },
  {
    key: "lead-intake-pack",
    title: "Lead intake pack",
    description: "A ready-made pattern for capturing inbound leads, enriching them, and syncing the result into CRM.",
    category: "crm_operations",
    family: "workflow_pack",
    requiredProviders: ["groq", "http"],
    expectedProfiles: ["groq", "hubspot", "notion", "generic_http"],
    recommendedToolKeys: ["knowledge-lookup", "crm-upsert"],
    idealFor: "Lead capture, qualification, and sales handoff workflows.",
    recommendedStrategy: "Use read_then_write so research and summarization happen before CRM writeback.",
    setupHint: "Best with one Groq agent connection and one HTTP CRM or knowledge connection in the same workspace.",
    featured: true,
    tone: "mint",
  },
  {
    key: "support-resolution-pack",
    title: "Support resolution pack",
    description: "Search context, draft a helpful answer, then send a callback or status update to the source system.",
    category: "delivery_webhooks",
    family: "workflow_pack",
    requiredProviders: ["groq", "http", "webhook"],
    expectedProfiles: ["groq", "notion", "slack", "generic_http", "generic_webhook"],
    recommendedToolKeys: ["knowledge-lookup", "webhook-reply"],
    idealFor: "Support inboxes, ticket summaries, and issue-resolution assistants.",
    recommendedStrategy: "Use read_then_write so context is gathered before the final response is delivered.",
    setupHint: "This works best when inbound or outbound webhook delivery and one knowledge API are both connected.",
    featured: true,
    tone: "sand",
  },
  {
    key: "content-ops-pack",
    title: "Content ops pack",
    description: "Generate or refine content, then fan out to delivery and reporting-style tool steps.",
    category: "ai_agents",
    family: "workflow_pack",
    requiredProviders: ["groq", "http"],
    expectedProfiles: ["groq", "google_sheets", "generic_http"],
    recommendedToolKeys: ["http-request", "spreadsheet-row"],
    idealFor: "Content generation, social drafts, outbound campaign prep, and reporting handoffs.",
    recommendedStrategy: "Use fan_out when one approved agent output should feed multiple downstream systems.",
    setupHint: "Pair a Groq model with one HTTP connection that can reach your publish or reporting APIs.",
    featured: false,
    tone: "default",
  },
] as const;

const READINESS_PRIORITY: Record<ToolMarketplaceReadiness, number> = {
  ready: 0,
  partial: 1,
  missing: 2,
};

function uniqueConnections(connections: MarketplaceConnection[]) {
  const seen = new Set<string>();
  return connections.filter((connection) => {
    if (seen.has(connection.id)) {
      return false;
    }
    seen.add(connection.id);
    return true;
  });
}

function uniqueProfiles(profiles: ToolMarketplaceProfile[]) {
  const seen = new Set<ToolMarketplaceProfileKey>();
  return profiles.filter((profile) => {
    if (seen.has(profile.key)) {
      return false;
    }
    seen.add(profile.key);
    return true;
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function connectionSearchText(connection: MarketplaceConnection) {
  const config = asRecord(connection.config);
  const parts = [
    connection.label,
    connection.description ?? "",
    typeof config.base_url === "string" ? config.base_url : "",
    typeof config.url === "string" ? config.url : "",
    typeof config.path === "string" ? config.path : "",
  ];
  return parts.join(" ").toLowerCase();
}

function detectConnectionProfiles(connection: MarketplaceConnection): ToolMarketplaceProfile[] {
  const provider = connection.provider.toLowerCase();
  const text = connectionSearchText(connection);
  const keys: ToolMarketplaceProfileKey[] = [];

  if (provider === "groq") {
    keys.push("groq");
  }

  if (provider === "http") {
    if (text.includes("hubspot") || text.includes("hubapi.com")) {
      keys.push("hubspot");
    }
    if (text.includes("notion")) {
      keys.push("notion");
    }
    if (text.includes("google sheets") || text.includes("sheets.googleapis.com")) {
      keys.push("google_sheets");
    }
    keys.push("generic_http");
  }

  if (provider === "webhook") {
    if (text.includes("slack") || text.includes("hooks.slack.com")) {
      keys.push("slack");
    }
    keys.push("generic_webhook");
  }

  return uniqueProfiles(keys.map((key) => PROFILE_META[key]));
}

function matchingConnectionsForProviders(
  providers: readonly string[],
  connections: MarketplaceConnection[],
) {
  return uniqueConnections(
    connections.filter((connection) => providers.includes(connection.provider)),
  );
}

function matchingProfilesForKit(
  expectedProfiles: readonly ToolMarketplaceProfileKey[],
  matches: MarketplaceConnection[],
) {
  const detected = uniqueProfiles(matches.flatMap((connection) => detectConnectionProfiles(connection)));

  if (!expectedProfiles.length) {
    return detected;
  }

  return detected.filter((profile) => expectedProfiles.includes(profile.key));
}

function kitReadiness(requiredProviders: readonly string[], matches: MarketplaceConnection[]) {
  if (!requiredProviders.length) {
    return "ready" as const;
  }

  const providerSet = new Set(matches.map((connection) => connection.provider));
  const matchedProviders = requiredProviders.filter((provider) => providerSet.has(provider));

  if (matchedProviders.length === 0) {
    return "missing" as const;
  }

  if (matchedProviders.length === requiredProviders.length) {
    return "ready" as const;
  }

  return "partial" as const;
}

function readinessDetail(
  readiness: ToolMarketplaceReadiness,
  requiredProviders: readonly string[],
  matches: MarketplaceConnection[],
  profiles: ToolMarketplaceProfile[],
) {
  if (!requiredProviders.length) {
    return "No saved provider is required for this kit.";
  }

  const matchedProviders = [...new Set(matches.map((connection) => connection.provider))];
  const missingProviders = requiredProviders.filter((provider) => !matchedProviders.includes(provider));
  const profileText = profiles.length
    ? ` Detected profiles: ${profiles.map((profile) => profile.title).join(", ")}.`
    : "";

  if (readiness === "ready") {
    return `Ready with ${matches.length} matching connection${matches.length === 1 ? "" : "s"}.${profileText}`;
  }

  if (readiness === "partial") {
    return `Partially ready. Still missing provider: ${missingProviders.join(", ")}.${profileText}`;
  }

  return `Missing setup. Needs provider${requiredProviders.length === 1 ? "" : "s"}: ${requiredProviders.join(", ")}.${profileText}`;
}

function workflowPackPrompt(kit: ToolMarketplaceKit) {
  switch (kit.key) {
    case "lead-intake-pack":
      return "Build a lead intake workflow that captures an inbound lead, researches company context, summarizes qualification, updates the CRM, and ends with a clear final output for the sales team.";
    case "support-resolution-pack":
      return "Build a support resolution workflow that looks up knowledge, drafts a helpful answer, sends a callback or response to the source system, and ends with a clear support summary.";
    case "content-ops-pack":
      return "Build a content operations workflow that generates or improves content, fans the result out to delivery and reporting steps, and finishes with a clean human-readable summary.";
    default:
      return `Build a workflow using the ${kit.title.toLowerCase()} pattern with a clear trigger, helpful agent reasoning, and a polished final output.`;
  }
}

export function buildToolMarketplace(connections: MarketplaceConnection[] = []) {
  const kits: ToolMarketplaceKit[] = MARKETPLACE_KITS.map((kit) => {
    const recommendedFromRegistry = toolRegistry
      .filter((item) => item.marketplaceKit === kit.key)
      .map((item) => item.key);
    const recommendedToolKeys = [...new Set([...kit.recommendedToolKeys, ...recommendedFromRegistry])];
    const matches = matchingConnectionsForProviders(kit.requiredProviders, connections);
    const detectedProfiles = matchingProfilesForKit(kit.expectedProfiles, matches);
    const readiness = kitReadiness(kit.requiredProviders, matches);

    return {
      key: kit.key,
      title: kit.title,
      description: kit.description,
      category: kit.category,
      family: kit.family,
      requiredProviders: [...kit.requiredProviders],
      expectedProfiles: [...kit.expectedProfiles],
      readiness,
      readinessDetail: readinessDetail(readiness, kit.requiredProviders, matches, detectedProfiles),
      matchingConnectionCount: matches.length,
      matchingConnections: matches,
      detectedProfiles,
      recommendedToolKeys,
      idealFor: kit.idealFor,
      recommendedStrategy: kit.recommendedStrategy,
      setupHint: kit.setupHint,
      featured: kit.featured,
      tone: kit.tone,
    };
  });

  return Object.entries(MARKETPLACE_CATEGORY_META).map(([key, meta]) => ({
    key: key as ToolMarketplaceCategoryKey,
    title: meta.title,
    description: meta.description,
    kits: kits.filter((kit) => kit.category === key),
  }));
}

export function getToolMarketplaceKitByKey(key: string) {
  return buildToolMarketplace([])
    .flatMap((category) => category.kits)
    .find((kit) => kit.key === key) ?? null;
}

export function buildToolMarketplaceSummary(categories: ToolMarketplaceCategory[]): ToolMarketplaceSummary {
  const allKits = categories.flatMap((category) => category.kits);
  return {
    totalKits: allKits.length,
    readyKits: allKits.filter((kit) => kit.readiness === "ready").length,
    partialKits: allKits.filter((kit) => kit.readiness === "partial").length,
    missingKits: allKits.filter((kit) => kit.readiness === "missing").length,
    providerPacks: allKits.filter((kit) => kit.family === "provider_pack").length,
    workflowPacks: allKits.filter((kit) => kit.family === "workflow_pack").length,
    featuredKits: allKits.filter((kit) => kit.featured),
    featuredWorkflowPacks: allKits.filter(
      (kit) => kit.featured && kit.family === "workflow_pack",
    ),
  };
}

export function buildToolMarketplaceComposerSuggestions(
  connections: MarketplaceConnection[] = [],
  limit = 3,
): ToolMarketplaceComposerSuggestion[] {
  const categories = buildToolMarketplace(connections);
  const workflowPacks = categories
    .flatMap((category) => category.kits)
    .filter((kit) => kit.family === "workflow_pack")
    .sort((left, right) => {
      const readinessDiff = READINESS_PRIORITY[left.readiness] - READINESS_PRIORITY[right.readiness];
      if (readinessDiff !== 0) {
        return readinessDiff;
      }
      if (left.featured !== right.featured) {
        return left.featured ? -1 : 1;
      }
      return left.title.localeCompare(right.title);
    })
    .slice(0, limit);

  return workflowPacks.map((kit) => ({
    id: `${kit.key}-${kit.readiness}`,
    kitKey: kit.key,
    title: kit.title,
    readiness: kit.readiness,
    tone: kit.tone,
    prompt: workflowPackPrompt(kit),
    strategy: kit.recommendedStrategy,
    why: kit.idealFor,
    profiles: kit.detectedProfiles.map((profile) => profile.title),
  }));
}

export function getToolMarketplacePromptLines() {
  return buildToolMarketplace([]).flatMap((category) => [
    `${category.title}: ${category.description}`,
    ...category.kits.map(
      (kit) =>
        `${kit.title} [resources | family:${kit.family} | providers:${kit.requiredProviders.join("+") || "none"} | profiles:${kit.expectedProfiles.join("+") || "none"} | strategy:${kit.recommendedStrategy}] - ${kit.description}`,
    ),
  ]);
}
