import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockStreamResponse(chunks: string[], status = 200) {
  const encoder = new TextEncoder();
  return {
    ok: status >= 200 && status < 300,
    status,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    }),
    json: () => Promise.resolve({}),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("api.assistantChat", () => {
  it("sends POST to /api/assistant/chat with messages and context", async () => {
    const reply = { reply: "Try adding error handling.", suggestions: ["Add retry logic"] };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(reply) });

    const result = await api.assistantChat({
      messages: [{ role: "user", content: "How can I improve this?" }],
      workflow_id: "w-123",
      workflow_name: "My Flow",
      step_count: 5,
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/assistant/chat");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.messages).toHaveLength(1);
    expect(body.workflow_id).toBe("w-123");
    expect(result.reply).toBe("Try adding error handling.");
    expect(result.suggestions).toContain("Add retry logic");
  });

  it("sends chat without workflow context", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ reply: "Hello!", suggestions: [] }),
    });

    const result = await api.assistantChat({
      messages: [{ role: "user", content: "Hello" }],
    });

    expect(result.reply).toBe("Hello!");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.workflow_id).toBeUndefined();
  });

  it("handles error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: "LLM unavailable" }),
    });

    await expect(
      api.assistantChat({ messages: [{ role: "user", content: "test" }] })
    ).rejects.toThrow("LLM unavailable");
  });

  it("streams assistant chat deltas and resolves the final payload", async () => {
    const deltas: string[] = [];
    mockFetch.mockResolvedValueOnce(mockStreamResponse([
      'event: delta\ndata: {"delta":"Hello"}\n\n',
      'event: delta\ndata: {"delta":" world"}\n\n',
      'event: done\ndata: {"reply":"Hello world","suggestions":["Next step"],"actions":[]}\n\n',
    ]));

    const result = await api.assistantChatStream({
      messages: [{ role: "user", content: "Stream this" }],
      workflow_id: "w-123",
    }, {
      onDelta: (delta) => deltas.push(delta),
    });

    expect(deltas).toEqual(["Hello", " world"]);
    expect(result.reply).toBe("Hello world");
    expect(result.suggestions).toEqual(["Next step"]);
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0][0]).toContain("/api/assistant/chat/stream");
  });

  it("streams chat messages across chunk boundaries and forwards the abort signal", async () => {
    const deltas: string[] = [];
    const controller = new AbortController();
    mockFetch.mockResolvedValueOnce(mockStreamResponse([
      'event: delta\ndata: {"delta":"Part',
      'ial"}\n\nevent: done\ndata: {"user_message":{"id":"u1","thread_id":"t1","role":"user","content":"Hi","actions":[],"attachments":[],"created_at":"2026-04-08T00:00:00Z"},"assistant_message":{"id":"a1","thread_id":"t1","role":"assistant","content":"Partial","actions":[],"attachments":[],"created_at":"2026-04-08T00:00:01Z"},"thread_title":"New chat"}\n\n',
    ]));

    const result = await api.sendChatMessageStream("t1", "Hi", "xai", [], {
      onDelta: (delta) => deltas.push(delta),
      signal: controller.signal,
    });

    expect(deltas).toEqual(["Partial"]);
    expect(result.assistant_message.content).toBe("Partial");
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0][0]).toContain("/api/chat/threads/t1/messages/stream");
    expect(mockFetch.mock.calls[0][1].signal).toBe(controller.signal);
  });
});

describe("api public chat", () => {
  it("fetches public chat trigger info with stream and widget metadata", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        workflow_id: "wf-1",
        workspace_id: "ws-1",
        trigger_type: "chat",
        mode: "embedded",
        authentication: "none",
        response_mode: "streaming",
        load_previous_session: "off",
        initial_messages: ["Hello"],
        require_button_click: false,
        public_chat_url: "https://example.test/api/chat/ws-1/wf-1",
        public_chat_stream_url: "https://example.test/api/chat/ws-1/wf-1/stream",
        hosted_chat_url: "https://example.test/chat/ws-1/wf-1",
        widget_script_url: "https://example.test/flowholt-chat-widget.js",
        widget_embed_html: '<script src="https://example.test/flowholt-chat-widget.js" data-workspace-id="ws-1" data-workflow-id="wf-1" async></script>',
      }),
    });

    const result = await api.getPublicChatTriggerInfo("ws-1", "wf-1");

    expect(result.public_chat_stream_url).toContain("/api/chat/ws-1/wf-1/stream");
    expect(result.widget_script_url).toContain("flowholt-chat-widget.js");
    expect(result.widget_embed_html).toContain("data-workflow-id=\"wf-1\"");
  });

  it("streams public chat responses and returns the final payload", async () => {
    const deltas: string[] = [];
    mockFetch.mockResolvedValueOnce(mockStreamResponse([
      'event: delta\ndata: {"delta":"Flow"}\n\n',
      'event: delta\ndata: {"delta":"Holt"}\n\n',
      'event: done\ndata: {"workflow_id":"wf-1","execution_id":"exec-1","session_id":"session-1","trigger_type":"chat","mode":"embedded","response_mode":"streaming","message":"FlowHolt","messages":[{"role":"assistant","content":"FlowHolt"}],"title":"Public Chat"}\n\n',
    ]));

    const result = await api.sendPublicChatTriggerMessageStream(
      "ws-1",
      "wf-1",
      { message: "Hello" },
      { headers: { Authorization: "Basic abc" } },
      { onDelta: (delta) => deltas.push(delta) },
    );

    expect(deltas).toEqual(["Flow", "Holt"]);
    expect(result.message).toBe("FlowHolt");
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0][0]).toContain("/api/chat/ws-1/wf-1/stream");
    expect(mockFetch.mock.calls[0][1].headers.get("Authorization")).toBe("Basic abc");
  });
});

describe("api bulk operations", () => {
  it("bulkDeleteWorkflows sends POST with ids array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ deleted: 3, errors: [] }),
    });

    const result = await api.bulkDeleteWorkflows(["w-1", "w-2", "w-3"]);

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/workflows/bulk-delete");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.ids).toEqual(["w-1", "w-2", "w-3"]);
    expect(result.deleted).toBe(3);
    expect(result.errors).toHaveLength(0);
  });

  it("bulkDeleteVaultAssets sends POST to correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ deleted: 2, errors: [] }),
    });

    await api.bulkDeleteVaultAssets(["va-1", "va-2"]);

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/vault/assets/bulk-delete");
    expect(opts.method).toBe("POST");
  });

  it("bulkDeleteExecutions sends POST to correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ deleted: 1, errors: ["e-bad: not found"] }),
    });

    const result = await api.bulkDeleteExecutions(["e-1", "e-bad"]);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/executions/bulk-delete");
    expect(result.deleted).toBe(1);
    expect(result.errors).toHaveLength(1);
  });

  it("reports partial failures from bulk delete", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ deleted: 2, errors: ["w-3: permission denied"] }),
    });

    const result = await api.bulkDeleteWorkflows(["w-1", "w-2", "w-3"]);
    expect(result.deleted).toBe(2);
    expect(result.errors[0]).toContain("w-3");
  });
});

describe("api notification operations", () => {
  it("listNotifications fetches from /api/notifications", async () => {
    const data = {
      items: [
        { id: "notif-1", title: "Deploy done", body: "", kind: "success", link: null, read: false, created_at: "2024-01-01T00:00:00Z" },
      ],
      unread_count: 1,
    };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(data) });

    const result = await api.listNotifications();

    expect(result.items).toHaveLength(1);
    expect(result.unread_count).toBe(1);
    expect(result.items[0].title).toBe("Deploy done");
  });

  it("createNotification sends POST with payload", async () => {
    const notif = { id: "notif-2", title: "Test", body: "Body", kind: "info", link: null, read: false, created_at: "2024-01-01T00:00:00Z" };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 201, json: () => Promise.resolve(notif) });

    const result = await api.createNotification({ title: "Test", body: "Body" });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(result.title).toBe("Test");
  });

  it("markNotificationRead sends PATCH", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve(undefined) });

    await api.markNotificationRead("notif-1");

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/notifications/notif-1/read");
    expect(opts.method).toBe("PATCH");
  });

  it("markAllNotificationsRead sends POST", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve(undefined) });

    await api.markAllNotificationsRead();

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/notifications/read-all");
    expect(opts.method).toBe("POST");
  });
});

describe("api plugin operations", () => {
  it("listPlugins fetches from /api/studio/plugins", async () => {
    const plugins = [{ key: "github", label: "GitHub", category: "DevOps" }];
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(plugins) });

    const result = await api.listPlugins();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/studio/plugins");
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("github");
  });
});
