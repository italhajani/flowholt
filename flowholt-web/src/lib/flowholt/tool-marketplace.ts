import { toolRegistry, type ToolMarketplaceCategoryKey } from "./tool-registry.ts";

type MarketplaceConnection = {
  id: string;
  provider: string;
  label: string;
};

export type ToolMarketplaceKit = {
  key: string;
  title: string;
  description: string;
  category: ToolMarketplaceCategoryKey;
  requiredProviders: string[];
  readiness: "ready" | "partial" | "missing";
  matchingConnectionCount: number;
  matchingConnections: MarketplaceConnection[];
  recommendedToolKeys: string[];
};

export type ToolMarketplaceCategory = {
  key: ToolMarketplaceCategoryKey;
  title: string;
  description: string;
  kits: ToolMarketplaceKit[];
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

const MARKETPLACE_KITS = [
  {
    key: "groq-agent-kit",
    title: "Groq agent kit",
    description: "Primary agent model connection for creator, planner, and reviewer style steps.",
    category: "ai_agents",
    requiredProviders: ["groq"],
    recommendedToolKeys: [],
  },
  {
    key: "knowledge-search-kit",
    title: "Knowledge search kit",
    description: "Search connected docs or knowledge APIs before later reasoning or writeback.",
    category: "search_research",
    requiredProviders: ["http"],
    recommendedToolKeys: ["knowledge-lookup"],
  },
  {
    key: "crm-sync-kit",
    title: "CRM sync kit",
    description: "Push qualified results into a CRM after the workflow is ready to commit business data.",
    category: "crm_operations",
    requiredProviders: ["http"],
    recommendedToolKeys: ["crm-upsert"],
  },
  {
    key: "spreadsheet-ops-kit",
    title: "Spreadsheet ops kit",
    description: "Append operational rows for tracking, fulfillment, or reporting handoffs.",
    category: "crm_operations",
    requiredProviders: ["http"],
    recommendedToolKeys: ["spreadsheet-row"],
  },
  {
    key: "delivery-webhook-kit",
    title: "Delivery webhook kit",
    description: "Return callbacks or outbound delivery payloads to the origin system.",
    category: "delivery_webhooks",
    requiredProviders: ["webhook", "http"],
    recommendedToolKeys: ["webhook-reply"],
  },
  {
    key: "custom-http-kit",
    title: "Custom API kit",
    description: "General-purpose API calls when your workflow needs a custom integration pattern.",
    category: "custom_http",
    requiredProviders: ["http"],
    recommendedToolKeys: ["http-request"],
  },
] as const;

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

function matchingConnectionsForProviders(
  providers: readonly string[],
  connections: MarketplaceConnection[],
) {
  return uniqueConnections(
    connections.filter((connection) => providers.includes(connection.provider)),
  );
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

export function buildToolMarketplace(connections: MarketplaceConnection[] = []) {
  const kits: ToolMarketplaceKit[] = MARKETPLACE_KITS.map((kit) => {
    const recommendedFromRegistry = toolRegistry
      .filter((item) => item.marketplaceKit === kit.key)
      .map((item) => item.key);
    const recommendedToolKeys = [...new Set([...kit.recommendedToolKeys, ...recommendedFromRegistry])];
    const matches = matchingConnectionsForProviders(kit.requiredProviders, connections);

    return {
      key: kit.key,
      title: kit.title,
      description: kit.description,
      category: kit.category,
      requiredProviders: [...kit.requiredProviders],
      readiness: kitReadiness(kit.requiredProviders, matches),
      matchingConnectionCount: matches.length,
      matchingConnections: matches,
      recommendedToolKeys,
    };
  });

  return Object.entries(MARKETPLACE_CATEGORY_META).map(([key, meta]) => ({
    key: key as ToolMarketplaceCategoryKey,
    title: meta.title,
    description: meta.description,
    kits: kits.filter((kit) => kit.category === key),
  }));
}

export function getToolMarketplacePromptLines() {
  return buildToolMarketplace([]).flatMap((category) => [
    `${category.title}: ${category.description}`,
    ...category.kits.map(
      (kit) =>
        `${kit.title} [resources | providers:${kit.requiredProviders.join("+") || "none"}] - ${kit.description}`,
    ),
  ]);
}
