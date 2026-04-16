import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before importing api module
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Need to set import.meta.env before import
const apiModule = await import("@/lib/api");
const { api } = apiModule;

function mockJsonResponse(data: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
}

function mockErrorResponse(status: number, detail = "Error") {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({ detail }),
    text: () => Promise.resolve(JSON.stringify({ detail })),
  } as Response);
}

describe("api client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("listWorkflows", () => {
    it("sends GET to /api/workflows", async () => {
      const workflows = [{ id: "w1", name: "Test" }];
      mockJsonResponse(workflows);

      const result = await api.listWorkflows();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/workflows");
      expect(init?.method).toBeUndefined(); // GET is default
      expect(result).toEqual(workflows);
    });
  });

  describe("createWorkflow", () => {
    it("sends POST with payload", async () => {
      const payload = {
        name: "My Flow",
        trigger_type: "webhook" as const,
        definition: { steps: [], edges: [] },
      };
      mockJsonResponse({ id: "w1", ...payload });

      await api.createWorkflow(payload);

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/workflows");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(init?.body as string)).toEqual(payload);
    });
  });

  describe("runWorkflow", () => {
    it("posts to /api/workflows/:id/run with payload", async () => {
      mockJsonResponse({ id: "exec1", status: "running" });

      await api.runWorkflow("w123", { input: "test" });

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/workflows/w123/run");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(init?.body as string)).toEqual({ payload: { input: "test" } });
    });
  });

  describe("updateWorkflow", () => {
    it("sends PUT to /api/workflows/:id", async () => {
      const update = {
        name: "Updated",
        trigger_type: "manual" as const,
        category: "general",
        status: "draft" as const,
        definition: {
          steps: [],
          edges: [],
          settings: {
            execution_order: "v1" as const,
            caller_policy: "inherit" as const,
            timezone: "UTC",
            timeout_seconds: 300,
            error_workflow_id: null,
            save_failed_executions: "all" as const,
            save_successful_executions: "all" as const,
            save_manual_executions: true,
            save_execution_progress: true,
            time_saved_minutes: 0,
          },
        },
      };
      mockJsonResponse({ id: "w1", ...update });

      await api.updateWorkflow("w1", update);

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/workflows/w1");
      expect(init?.method).toBe("PUT");
    });
  });

  describe("exportWorkflow", () => {
    it("fetches workflow export bundle", async () => {
      const bundle = { format_version: "1.0", workflow: {} };
      mockJsonResponse(bundle);

      const result = await api.exportWorkflow("w5");
      expect(mockFetch.mock.calls[0][0]).toBe("/api/workflows/w5/export");
      expect(result).toEqual(bundle);
    });
  });

  describe("importWorkflow", () => {
    it("posts bundle to import endpoint", async () => {
      const response = { workflow_id: "new1", workflow_name: "Imported", steps_count: 3, edges_count: 2, warnings: [] };
      mockJsonResponse(response);

      const result = await api.importWorkflow({ format_version: "1.0" }, "Override Name");

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/workflows/import");
      expect(JSON.parse(init?.body as string).name_override).toBe("Override Name");
      expect(result.workflow_id).toBe("new1");
    });
  });

  describe("listWorkflowVersions", () => {
    it("fetches versions for workflow", async () => {
      const versions = [{ id: "v1", version_number: 1, status: "draft_snapshot" }];
      mockJsonResponse(versions);

      const result = await api.listWorkflowVersions("w1");
      expect(mockFetch.mock.calls[0][0]).toBe("/api/workflows/w1/versions");
      expect(result).toEqual(versions);
    });
  });

  describe("createWorkflowVersion", () => {
    it("posts snapshot with notes", async () => {
      mockJsonResponse({ id: "v2", version_number: 2, status: "draft_snapshot" });

      await api.createWorkflowVersion("w1", "My snapshot");

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/workflows/w1/versions");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(init?.body as string).notes).toBe("My snapshot");
    });
  });

  describe("publishWorkflow", () => {
    it("posts to publish endpoint", async () => {
      mockJsonResponse({ id: "v3", version_number: 3, status: "published" });

      const result = await api.publishWorkflow("w5", "Go live");
      expect(mockFetch.mock.calls[0][0]).toBe("/api/workflows/w5/publish");
      expect(result.status).toBe("published");
    });
  });

  describe("testStep", () => {
    it("posts step and payload for testing", async () => {
      const step = { id: "s1", name: "Step 1", type: "transform" as const, config: {} };
      mockJsonResponse({ status: "success", output: { result: true }, error: null, duration_ms: 42 });

      const result = await api.testStep("w1", step, { input: 1 });

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/workflows/w1/test-step");
      expect(init?.method).toBe("POST");
      expect(result.status).toBe("success");
      expect(result.duration_ms).toBe(42);
    });
  });

  describe("validateStudioWorkflowStep", () => {
    it("posts draft step config to the workflow-aware validation endpoint", async () => {
      mockJsonResponse({
        node_type: "ai_agent",
        valid: false,
        issues: [{ level: "error", code: "required_cluster_slot_missing", message: "AI Agent requires an attached Model sub-node.", field: "model" }],
        normalized_config: {},
        sample_output: {},
        bindings_used: [],
      });

      await api.validateStudioWorkflowStep("w1", "s1", {
        config: { provider: "openai" },
        triggerType: "manual",
        name: "Agent",
      });

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/studio/workflows/w1/steps/s1/validate");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(init?.body as string)).toEqual({
        config: { provider: "openai" },
        trigger_type: "manual",
        name: "Agent",
      });
    });
  });

  describe("error handling", () => {
    it("throws on non-ok response", async () => {
      mockErrorResponse(404, "Not found");

      await expect(api.listWorkflows()).rejects.toThrow();
    });
  });
});
