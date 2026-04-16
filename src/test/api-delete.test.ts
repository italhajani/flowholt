import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("api delete operations", () => {
  it("deleteWorkflow sends DELETE to /api/workflows/:id", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve(undefined) });
    await api.deleteWorkflow("w-abc123");
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/workflows/w-abc123");
    expect(opts.method).toBe("DELETE");
  });

  it("deleteVaultAsset sends DELETE to /api/vault/assets/:id", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve(undefined) });
    await api.deleteVaultAsset("va-xyz789");
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/vault/assets/va-xyz789");
    expect(opts.method).toBe("DELETE");
  });

  it("deleteExecution sends DELETE to /api/executions/:id", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve(undefined) });
    await api.deleteExecution("e-del001");
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/executions/e-del001");
    expect(opts.method).toBe("DELETE");
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve(undefined) });
    const result = await api.deleteWorkflow("w-abc");
    expect(result).toBeUndefined();
  });

  it("throws on 404 Not Found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: "Workflow not found" }),
    });
    await expect(api.deleteWorkflow("w-nonexistent")).rejects.toThrow("Workflow not found");
  });

  it("throws on 403 Forbidden", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ detail: "Insufficient permissions" }),
    });
    await expect(api.deleteVaultAsset("va-secret")).rejects.toThrow("Insufficient permissions");
  });
});

describe("api vault operations", () => {
  it("createVaultAsset sends POST to /api/vault/assets", async () => {
    const mockAsset = { id: "va-new", name: "Test API Key", kind: "credential" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockAsset),
    });
    const result = await api.createVaultAsset({ name: "Test API Key", kind: "credential", secret: { key: "sk-test" } });
    expect(result).toEqual(mockAsset);
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.name).toBe("Test API Key");
    expect(body.kind).toBe("credential");
  });

  it("updateVaultAsset sends PUT to /api/vault/assets/:id", async () => {
    const mockAsset = { id: "va-upd", name: "Updated Key" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAsset),
    });
    const result = await api.updateVaultAsset("va-upd", { name: "Updated Key", secret: { key: "sk-new" } });
    expect(result).toEqual(mockAsset);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/vault/assets/va-upd");
    expect(opts.method).toBe("PUT");
  });
});

describe("api execution operations", () => {
  it("retryExecution sends POST to /api/executions/:id/retry", async () => {
    const mockExec = { id: "e-retry", status: "running" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockExec),
    });
    const result = await api.retryExecution("e-retry");
    expect(result).toEqual(mockExec);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/executions/e-retry/retry");
    expect(opts.method).toBe("POST");
  });

  it("cancelExecution sends POST to /api/executions/:id/cancel", async () => {
    const mockExec = { id: "e-cancel", status: "cancelled" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockExec),
    });
    const result = await api.cancelExecution("e-cancel");
    expect(result).toEqual(mockExec);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/executions/e-cancel/cancel");
    expect(opts.method).toBe("POST");
  });
});
