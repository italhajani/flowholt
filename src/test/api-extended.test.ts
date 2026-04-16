import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("api workflow versions", () => {
  it("listWorkflowVersions fetches versions for workflow", async () => {
    const versions = [{ id: "wv-1", version_number: 1, status: "draft" }];
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(versions) });
    const result = await api.listWorkflowVersions("w-abc");
    expect(result).toEqual(versions);
    expect(mockFetch.mock.calls[0][0]).toContain("/api/workflows/w-abc/versions");
  });

  it("createWorkflowVersion posts snapshot with notes", async () => {
    const version = { id: "wv-2", version_number: 2, status: "draft" };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(version) });
    await api.createWorkflowVersion("w-abc", "Initial release");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.notes).toBe("Initial release");
  });

  it("publishWorkflow posts to publish endpoint", async () => {
    const version = { id: "wv-pub", version_number: 3, status: "published" };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(version) });
    await api.publishWorkflow("w-abc", "Production ready");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/workflows/w-abc/publish");
    expect(opts.method).toBe("POST");
  });

  it("promoteWorkflow sends target environment", async () => {
    const version = { id: "wv-prom", version_number: 4, status: "staging" };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(version) });
    await api.promoteWorkflow("w-abc", "staging", "Staging deploy");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.target_environment).toBe("staging");
    expect(body.notes).toBe("Staging deploy");
  });
});

describe("api sandbox execution", () => {
  it("executeSandbox sends code and language", async () => {
    const result = { status: "success", output: { result: 42 }, error: null, duration_ms: 250 };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(result) });
    await api.executeSandbox("print(42)", "python", { x: 1 }, 10);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.code).toBe("print(42)");
    expect(body.language).toBe("python");
    expect(body.input_data).toEqual({ x: 1 });
    expect(body.timeout).toBe(10);
  });
});

describe("api oauth2", () => {
  it("listOAuth2Providers fetches provider list", async () => {
    const providers = [{ provider: "github", enabled: true }];
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(providers) });
    const result = await api.listOAuth2Providers();
    expect(result).toEqual(providers);
    expect(mockFetch.mock.calls[0][0]).toContain("/api/oauth2/providers");
  });

  it("startOAuth2 sends authorization request", async () => {
    const response = { authorize_url: "https://github.com/login/oauth", state: "abc123" };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(response) });
    await api.startOAuth2("github", "client-id-123", "http://localhost/callback", ["read:user"]);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.provider).toBe("github");
    expect(body.client_id).toBe("client-id-123");
    expect(body.scopes).toEqual(["read:user"]);
  });

  it("getWorkflowTriggerDetails includes environment query when provided", async () => {
    const details = {
      workflow_id: "w-webhook",
      trigger_type: "webhook",
      webhook_path: "/api/webhooks/ws-1/w-webhook",
      webhook_url: "https://example.test/api/webhooks/ws-1/w-webhook",
      test_webhook_path: "/api/triggers/webhook/w-webhook",
      test_webhook_url: "https://example.test/api/triggers/webhook/w-webhook",
      production_webhook_path: "/api/webhooks/ws-1/w-webhook",
      production_webhook_url: "https://example.test/api/webhooks/ws-1/w-webhook",
      schedule_hint: null,
      exposure: "public",
    };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(details) });

    const result = await api.getWorkflowTriggerDetails("w-webhook", "draft");

    expect(result).toEqual(details);
    expect(mockFetch.mock.calls[0][0]).toContain("/api/workflows/w-webhook/trigger-details?environment=draft");
  });

  it("replayExecution sends mode, queue preference, and payload override", async () => {
    const replay = {
      mode: "same_version",
      queued: false,
      execution: { id: "exec-replay-1", status: "running" },
      job: null,
    };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(replay) });

    const result = await api.replayExecution("exec-1", {
      mode: "current_draft",
      queued: false,
      payloadOverride: { foo: "bar" },
    });

    const [url, opts] = mockFetch.mock.calls[0];
    const body = JSON.parse(opts.body);
    expect(url).toContain("/api/executions/exec-1/replay");
    expect(opts.method).toBe("POST");
    expect(body.mode).toBe("current_draft");
    expect(body.queued).toBe(false);
    expect(body.payload_override).toEqual({ foo: "bar" });
    expect(result).toEqual(replay);
  });
});

describe("api system", () => {
  it("getSystemStatus fetches system health", async () => {
    const status = { status: "healthy", active_workflows: 5 };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(status) });
    const result = await api.getSystemStatus();
    expect(result).toEqual(status);
    expect(mockFetch.mock.calls[0][0]).toContain("/api/system/status");
  });

  it("getLlmStatus fetches LLM status", async () => {
    const status = { active_provider: "ollama", available_providers: ["ollama", "gemini"] };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(status) });
    const result = await api.getLlmStatus();
    expect(result).toEqual(status);
  });

  it("getDeepHealth fetches deep health check", async () => {
    const health = { database: "ok", llm: "ok", scheduler: "ok" };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(health) });
    const result = await api.getDeepHealth();
    expect(result).toEqual(health);
    expect(mockFetch.mock.calls[0][0]).toContain("/api/health/deep");
  });
});

describe("api request timeout", () => {
  it("includes AbortSignal.timeout in fetch calls", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([]) });
    await api.listWorkflows();
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.signal).toBeDefined();
  });
});

describe("api error handling edge cases", () => {
  it("handles non-JSON error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    });
    await expect(api.listWorkflows()).rejects.toThrow("Request failed: 500");
  });

  it("handles error with nested detail.message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ detail: { message: "Validation error", issues: [{ message: "name too long" }] } }),
    });
    await expect(api.listWorkflows()).rejects.toThrow("Validation error: name too long");
  });

  it("handles error with simple message field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "Bad request body" }),
    });
    await expect(api.listWorkflows()).rejects.toThrow("Bad request body");
  });
});
