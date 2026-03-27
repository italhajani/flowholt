export type ToolAuthKind = "none" | "api_key" | "bearer_token" | "workspace_connection";
export type ToolCapabilityKind =
  | "http_request"
  | "webhook_reply"
  | "crm_writeback"
  | "spreadsheet_row"
  | "knowledge_lookup";

export type ToolRegistryItem = {
  key: string;
  title: string;
  description: string;
  provider: string;
  capability: ToolCapabilityKind;
  authKind: ToolAuthKind;
  connectionProvider: "http" | "webhook" | null;
  requiresConnection: boolean;
  recommendedLabel: string;
  defaultConfig: Record<string, unknown>;
  outputShape: string;
  plannerPromptLine: string;
};

const PRESERVED_CONFIG_KEYS = [
  "connection_id",
  "headers",
  "bearer_token",
  "api_key",
  "api_key_header",
  "timeout_ms",
] as const;

function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const toolRegistry: ToolRegistryItem[] = [
  {
    key: "http-request",
    title: "HTTP request",
    description: "Call any API or webhook when you need a flexible raw request step.",
    provider: "Generic HTTP",
    capability: "http_request",
    authKind: "bearer_token",
    connectionProvider: "http",
    requiresConnection: false,
    recommendedLabel: "HTTP request",
    defaultConfig: {
      tool_key: "http-request",
      capability: "http_request",
      method: "POST",
      url: "",
      body: {
        input: "{{previous.text}}",
      },
    },
    outputShape: "status, headers, and response body",
    plannerPromptLine:
      "HTTP request [tool | capability:http_request | auth:bearer_token] - Calls any external API or webhook. Best for custom integrations or flexible request/response handling.",
  },
  {
    key: "webhook-reply",
    title: "Webhook reply",
    description: "Send a callback or reply to the system that originally triggered the flow.",
    provider: "Generic HTTP",
    capability: "webhook_reply",
    authKind: "none",
    connectionProvider: null,
    requiresConnection: false,
    recommendedLabel: "Send callback",
    defaultConfig: {
      tool_key: "webhook-reply",
      capability: "webhook_reply",
      method: "POST",
      url: "{{trigger.reply_url}}",
      body: {
        status: "ok",
        result: "{{previous.text}}",
      },
    },
    outputShape: "status and callback response",
    plannerPromptLine:
      "Webhook reply [tool | capability:webhook_reply | auth:none] - Sends a final callback to the origin system using a reply URL from the trigger payload.",
  },
  {
    key: "crm-upsert",
    title: "CRM writeback",
    description: "Create or update a contact, lead, or company record in a connected CRM.",
    provider: "CRM",
    capability: "crm_writeback",
    authKind: "workspace_connection",
    connectionProvider: "http",
    requiresConnection: true,
    recommendedLabel: "Update CRM",
    defaultConfig: {
      tool_key: "crm-upsert",
      capability: "crm_writeback",
      method: "POST",
      url: "/v1/records/upsert",
      body: {
        external_id: "{{trigger.payload.id}}",
        summary: "{{previous.text}}",
        status: "qualified",
      },
    },
    outputShape: "record id, sync status, and CRM response",
    plannerPromptLine:
      "CRM writeback [tool | capability:crm_writeback | auth:workspace_connection] - Writes qualified lead or customer data into a connected CRM and returns the synced record details.",
  },
  {
    key: "spreadsheet-row",
    title: "Spreadsheet row",
    description: "Append a row to an operations sheet for tracking, fulfillment, or reporting.",
    provider: "Spreadsheet",
    capability: "spreadsheet_row",
    authKind: "workspace_connection",
    connectionProvider: "http",
    requiresConnection: true,
    recommendedLabel: "Append row",
    defaultConfig: {
      tool_key: "spreadsheet-row",
      capability: "spreadsheet_row",
      method: "POST",
      url: "/v1/rows",
      body: {
        sheet: "operations",
        values: {
          workflow: "{{workflow.name}}",
          summary: "{{previous.text}}",
        },
      },
    },
    outputShape: "row id and sheet write status",
    plannerPromptLine:
      "Spreadsheet row [tool | capability:spreadsheet_row | auth:workspace_connection] - Adds workflow outputs to an operations sheet for tracking or handoff.",
  },
  {
    key: "knowledge-lookup",
    title: "Knowledge lookup",
    description: "Search a connected knowledge base or document API before the next decision step.",
    provider: "Knowledge base",
    capability: "knowledge_lookup",
    authKind: "api_key",
    connectionProvider: "http",
    requiresConnection: true,
    recommendedLabel: "Knowledge lookup",
    defaultConfig: {
      tool_key: "knowledge-lookup",
      capability: "knowledge_lookup",
      method: "POST",
      url: "/v1/search",
      body: {
        query: "{{workflow.original_prompt}}",
        limit: 5,
      },
    },
    outputShape: "matched documents and summaries",
    plannerPromptLine:
      "Knowledge lookup [tool | capability:knowledge_lookup | auth:api_key] - Searches a document or knowledge API so later agent steps have context before acting.",
  },
];

export function getToolRegistryItem(key: string | null | undefined) {
  if (!key) {
    return toolRegistry[0];
  }

  return toolRegistry.find((item) => item.key === key) ?? toolRegistry[0];
}

export function getDefaultToolConfig(toolKey = "http-request") {
  return cloneConfig(getToolRegistryItem(toolKey).defaultConfig);
}

export function applyToolPreset(
  toolKey: string,
  currentConfig: Record<string, unknown> = {},
) {
  const presetConfig = getDefaultToolConfig(toolKey);
  const preservedConfig = PRESERVED_CONFIG_KEYS.reduce<Record<string, unknown>>((accumulator, key) => {
    if (key in currentConfig) {
      accumulator[key] = cloneConfig(currentConfig[key]);
    }
    return accumulator;
  }, {});

  return {
    ...presetConfig,
    ...preservedConfig,
  };
}

export function getToolRegistryPromptLines() {
  return toolRegistry.map((item) => item.plannerPromptLine);
}
