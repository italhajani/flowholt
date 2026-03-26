import type { IntegrationProvider } from "@/lib/flowholt/types";

export type IntegrationTestResult = {
  ok: boolean;
  provider: IntegrationProvider;
  status: "passed" | "warn" | "failed";
  message: string;
  details: Record<string, unknown>;
  checked_at: string;
};

type IntegrationConnectionForTest = {
  id: string;
  provider: IntegrationProvider;
  label: string;
  config: Record<string, unknown>;
  secrets: Record<string, unknown>;
  status: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    done: () => clearTimeout(timer),
  };
}

function result(
  input: {
    provider: IntegrationProvider;
    ok: boolean;
    status: "passed" | "warn" | "failed";
    message: string;
    details?: Record<string, unknown>;
  },
): IntegrationTestResult {
  return {
    ok: input.ok,
    provider: input.provider,
    status: input.status,
    message: input.message,
    details: input.details ?? {},
    checked_at: new Date().toISOString(),
  };
}

async function testGroq(connection: IntegrationConnectionForTest): Promise<IntegrationTestResult> {
  const config = asRecord(connection.config);
  const secrets = asRecord(connection.secrets);
  const apiKey = asString(secrets.api_key);
  const baseUrl = asString(config.base_url, "https://api.groq.com/openai/v1").replace(/\/$/, "");

  if (!apiKey) {
    return result({
      provider: "groq",
      ok: false,
      status: "failed",
      message: "Missing Groq api_key in secrets.",
    });
  }

  try {
    const timeout = timeoutSignal(6_000);
    const response = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
      signal: timeout.signal,
    });
    timeout.done();

    if (!response.ok) {
      return result({
        provider: "groq",
        ok: false,
        status: "failed",
        message: `Groq responded with ${response.status}.`,
        details: {
          base_url: baseUrl,
          http_status: response.status,
        },
      });
    }

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const models = Array.isArray(payload.data) ? payload.data : [];

    return result({
      provider: "groq",
      ok: true,
      status: "passed",
      message: "Groq connection is valid.",
      details: {
        base_url: baseUrl,
        model_count: models.length,
      },
    });
  } catch (error) {
    return result({
      provider: "groq",
      ok: false,
      status: "failed",
      message: error instanceof Error ? error.message : "Groq request failed.",
      details: {
        base_url: baseUrl,
      },
    });
  }
}

async function testHttp(connection: IntegrationConnectionForTest): Promise<IntegrationTestResult> {
  const config = asRecord(connection.config);
  const secrets = asRecord(connection.secrets);
  const baseUrl = asString(config.base_url);

  if (!baseUrl) {
    return result({
      provider: "http",
      ok: false,
      status: "failed",
      message: "Missing base_url in connection config.",
    });
  }

  const headers = asRecord(config.default_headers);
  const headerBag: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      headerBag[key] = value;
    }
  }

  const token = asString(secrets.bearer_token);
  if (token && !Object.keys(headerBag).some((key) => key.toLowerCase() === "authorization")) {
    headerBag.Authorization = `Bearer ${token}`;
  }

  try {
    const timeout = timeoutSignal(6_000);
    const response = await fetch(baseUrl, {
      method: "GET",
      headers: headerBag,
      cache: "no-store",
      signal: timeout.signal,
    });
    timeout.done();

    if (response.status >= 200 && response.status < 300) {
      return result({
        provider: "http",
        ok: true,
        status: "passed",
        message: "HTTP connection is reachable.",
        details: {
          url: baseUrl,
          http_status: response.status,
        },
      });
    }

    if (response.status === 401 || response.status === 403) {
      return result({
        provider: "http",
        ok: true,
        status: "warn",
        message: "HTTP endpoint is reachable but authorization failed.",
        details: {
          url: baseUrl,
          http_status: response.status,
        },
      });
    }

    return result({
      provider: "http",
      ok: false,
      status: "failed",
      message: `HTTP endpoint responded with ${response.status}.`,
      details: {
        url: baseUrl,
        http_status: response.status,
      },
    });
  } catch (error) {
    return result({
      provider: "http",
      ok: false,
      status: "failed",
      message: error instanceof Error ? error.message : "HTTP connection test failed.",
      details: {
        url: baseUrl,
      },
    });
  }
}

async function testWebhook(connection: IntegrationConnectionForTest): Promise<IntegrationTestResult> {
  const config = asRecord(connection.config);
  const secrets = asRecord(connection.secrets);

  const direction = asString(config.direction, "inbound").toLowerCase();
  const method = asString(config.method, "POST").toUpperCase();
  const path = asString(config.path, "/");

  if (direction === "inbound") {
    return result({
      provider: "webhook",
      ok: true,
      status: "passed",
      message: "Inbound webhook configuration is ready.",
      details: {
        direction,
        method,
        path,
        has_api_key: Boolean(asString(secrets.api_key)),
      },
    });
  }

  const url = asString(config.url);
  if (!url) {
    return result({
      provider: "webhook",
      ok: false,
      status: "failed",
      message: "Outbound webhook needs config.url.",
      details: {
        direction,
      },
    });
  }

  try {
    const timeout = timeoutSignal(6_000);
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: timeout.signal,
    });
    timeout.done();

    if (response.ok) {
      return result({
        provider: "webhook",
        ok: true,
        status: "passed",
        message: "Outbound webhook endpoint is reachable.",
        details: {
          direction,
          url,
          http_status: response.status,
        },
      });
    }

    return result({
      provider: "webhook",
      ok: false,
      status: "failed",
      message: `Outbound webhook responded with ${response.status}.`,
      details: {
        direction,
        url,
        http_status: response.status,
      },
    });
  } catch (error) {
    return result({
      provider: "webhook",
      ok: false,
      status: "failed",
      message: error instanceof Error ? error.message : "Outbound webhook test failed.",
      details: {
        direction,
        url,
      },
    });
  }
}

export async function testIntegrationConnection(
  connection: IntegrationConnectionForTest,
): Promise<IntegrationTestResult> {
  if (connection.provider === "groq") {
    return testGroq(connection);
  }
  if (connection.provider === "http") {
    return testHttp(connection);
  }
  return testWebhook(connection);
}
