import { getToolRegistryItem } from "./tool-registry.ts";
import type { WorkflowNodeType } from "./types.ts";

export type IntegrationConnectionRuntime = {
  id: string;
  provider: string;
  label?: string;
  config: Record<string, unknown>;
  secrets: Record<string, unknown>;
};

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function readNodeConnectionId(config: Record<string, unknown> = {}) {
  const value = config.connection_id;
  return typeof value === "string" ? value.trim() : "";
}

export function expectedConnectionProviderForNode(
  nodeType: WorkflowNodeType,
  config: Record<string, unknown> = {},
): string | null {
  switch (nodeType) {
    case "agent":
      return "groq";
    case "tool":
      return getToolRegistryItem(typeof config.tool_key === "string" ? config.tool_key : "").connectionProvider;
    case "trigger": {
      const mode = typeof config.mode === "string" ? config.mode.trim().toLowerCase() : "manual";
      return mode === "webhook" ? "webhook" : null;
    }
    default:
      return null;
  }
}

export function requiresConnectionForNode(
  nodeType: WorkflowNodeType,
  config: Record<string, unknown> = {},
) {
  if (readNodeConnectionId(config)) {
    return true;
  }

  if (nodeType !== "tool") {
    return false;
  }

  return getToolRegistryItem(typeof config.tool_key === "string" ? config.tool_key : "").requiresConnection;
}

function mergeHeaders(
  connectionConfig: Record<string, unknown>,
  nodeConfig: Record<string, unknown>,
) {
  return {
    ...asRecord(connectionConfig.default_headers),
    ...asRecord(nodeConfig.headers),
  };
}

function parseUrlOrNull(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function adaptHttpbinDemoUrl(baseUrl: string, rawUrl: string, capability: string) {
  if (!rawUrl || capability === "http_request" || capability === "webhook_reply") {
    return { url: rawUrl, runtimeAdapter: "" };
  }

  const trimmedUrl = rawUrl.trim();
  const base = parseUrlOrNull(baseUrl);
  const absolute = parseUrlOrNull(trimmedUrl);

  const isHttpbinHost = (host: string | undefined) => typeof host === "string" && host.includes("httpbin.org");
  const normalizePath = (value: string) => (value.startsWith("/") ? value : `/${value}`);
  const toAnythingPath = (path: string) => {
    const normalized = normalizePath(path);
    return normalized.startsWith("/anything/") ? normalized : `/anything${normalized}`;
  };

  if (absolute && isHttpbinHost(absolute.host) && absolute.pathname.startsWith("/v1/")) {
    absolute.pathname = toAnythingPath(absolute.pathname);
    return {
      url: absolute.toString(),
      runtimeAdapter: "httpbin_anything",
    };
  }

  if (base && isHttpbinHost(base.host) && normalizePath(trimmedUrl).startsWith("/v1/")) {
    return {
      url: toAnythingPath(trimmedUrl),
      runtimeAdapter: "httpbin_anything",
    };
  }

  return { url: rawUrl, runtimeAdapter: "" };
}

function resolveToolConfigWithConnection(
  config: Record<string, unknown>,
  connection: IntegrationConnectionRuntime | null,
) {
  const preset = getToolRegistryItem(typeof config.tool_key === "string" ? config.tool_key : "");
  const connectionConfig = asRecord(connection?.config);
  const connectionSecrets = asRecord(connection?.secrets);
  const adapter = adaptHttpbinDemoUrl(
    typeof connectionConfig.base_url === "string" ? connectionConfig.base_url : "",
    typeof config.url === "string" ? config.url : "",
    preset.capability,
  );
  const resolved = {
    ...connectionConfig,
    ...config,
    tool_key: preset.key,
    capability: preset.capability,
    auth_kind: preset.authKind,
    connection_provider: connection?.provider ?? preset.connectionProvider ?? "",
    connection_label: connection?.label ?? "",
    headers: mergeHeaders(connectionConfig, config),
  } as Record<string, unknown>;

  if (!resolved.base_url && typeof connectionConfig.base_url === "string") {
    resolved.base_url = connectionConfig.base_url;
  }

  if (!resolved.default_method && typeof connectionConfig.default_method === "string") {
    resolved.default_method = connectionConfig.default_method;
  }

  if (
    !resolved.bearer_token &&
    typeof connectionSecrets.bearer_token === "string" &&
    ["bearer_token", "workspace_connection"].includes(preset.authKind)
  ) {
    resolved.bearer_token = connectionSecrets.bearer_token;
  }

  if (
    !resolved.api_key &&
    typeof connectionSecrets.api_key === "string" &&
    ["api_key", "workspace_connection"].includes(preset.authKind)
  ) {
    resolved.api_key = connectionSecrets.api_key;
  }

  if (!resolved.api_key_header && typeof connectionConfig.api_key_header === "string") {
    resolved.api_key_header = connectionConfig.api_key_header;
  }

  if (adapter.runtimeAdapter) {
    resolved.url = adapter.url;
    resolved.runtime_adapter = adapter.runtimeAdapter;
  }

  if (connection) {
    resolved.connection_id = connection.id;
  }

  return resolved;
}

export function resolveNodeConfigWithConnection(
  nodeType: WorkflowNodeType,
  config: Record<string, unknown> = {},
  connection: IntegrationConnectionRuntime | null = null,
) {
  if (nodeType === "tool") {
    return resolveToolConfigWithConnection(config, connection);
  }

  if (!connection) {
    return config;
  }

  return {
    ...asRecord(connection.config),
    ...config,
    ...asRecord(connection.secrets),
    connection_id: connection.id,
    connection_provider: connection.provider,
    connection_label: connection.label ?? "",
  };
}
