import React, { useState } from "react";
import { getToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Copy, Loader2, Play, XCircle } from "lucide-react";

type ApiTab = "request" | "response" | "auth" | "endpoints";

const tabs: { id: ApiTab; label: string }[] = [
  { id: "request", label: "Test request" },
  { id: "response", label: "Response" },
  { id: "auth", label: "Auth headers" },
  { id: "endpoints", label: "Endpoints" },
];

const endpointCatalog = [
  { method: "GET", path: "/api/workflows", description: "List all workflows" },
  { method: "POST", path: "/api/workflows", description: "Create a new workflow" },
  { method: "GET", path: "/api/workflows/:id", description: "Get workflow details" },
  { method: "PUT", path: "/api/workflows/:id", description: "Update a workflow" },
  { method: "POST", path: "/api/workflows/:id/run", description: "Execute a workflow" },
  { method: "POST", path: "/api/workflows/:id/test-step", description: "Test a single step" },
  { method: "GET", path: "/api/workflows/:id/export", description: "Export workflow as JSON" },
  { method: "POST", path: "/api/workflows/import", description: "Import a workflow bundle" },
  { method: "GET", path: "/api/executions", description: "List all executions" },
  { method: "GET", path: "/api/executions/:id", description: "Get execution details" },
  { method: "GET", path: "/api/executions/:id/bundle", description: "Get execution bundle" },
  { method: "POST", path: "/api/triggers/webhook/:id", description: "Fire a webhook trigger" },
  { method: "GET", path: "/api/vault", description: "List vault overview" },
  { method: "GET", path: "/api/vault/connections", description: "List vault connections" },
  { method: "GET", path: "/api/vault/credentials", description: "List vault credentials" },
  { method: "GET", path: "/api/vault/variables", description: "List vault variables" },
  { method: "GET", path: "/api/templates", description: "List workflow templates" },
  { method: "GET", path: "/api/system/status", description: "System status overview" },
  { method: "GET", path: "/api/health/deep", description: "Deep health check" },
  { method: "GET", path: "/api/llm/status", description: "LLM provider status" },
  { method: "GET", path: "/api/audit-events", description: "List audit events" },
  { method: "GET", path: "/api/studio/integrations", description: "List integrations catalog" },
  { method: "GET", path: "/api/oauth2/providers", description: "List OAuth2 providers" },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  PATCH: "bg-violet-100 text-violet-700",
};

const ApiPlaygroundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ApiTab>("request");
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/api/workflows");
  const [body, setBody] = useState('{\n  "payload": {}\n}');
  const [response, setResponse] = useState<{ status: number; body: string; duration: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    setSending(true);
    setResponse(null);
    const start = performance.now();
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const token = getToken();
      const init: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
      if (method !== "GET" && method !== "HEAD") {
        init.body = body;
      }
      const res = await fetch(`${apiBase}${path}`, init);
      const text = await res.text();
      const duration = Math.round(performance.now() - start);
      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // keep raw text
      }
      setResponse({ status: res.status, body: formatted, duration });
      setActiveTab("response");
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setResponse({ status: 0, body: err instanceof Error ? err.message : "Request failed", duration });
      setActiveTab("response");
    } finally {
      setSending(false);
    }
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectEndpoint = (ep: { method: string; path: string }) => {
    setMethod(ep.method);
    setPath(ep.path);
    setActiveTab("request");
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in pb-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">API Playground</h1>
          <p className="text-[14px] text-slate-500 mt-1">Test endpoints, inspect responses, and verify request headers.</p>
        </div>
      </div>

      <div className="pt-3">
        <div className="flex items-center gap-1 border-b border-slate-200 px-1 pt-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-3 text-[14px] transition-colors border-b-2 -mb-px rounded-t-lg",
                activeTab === tab.id ? "text-slate-900 border-slate-300 font-semibold bg-slate-100" : "text-slate-400 border-transparent hover:text-slate-700"
              )}
            >
              {tab.label}
              {tab.id === "response" && response && (
                <span className={`ml-2 text-[11px] font-mono ${response.status >= 200 && response.status < 300 ? "text-emerald-600" : "text-red-500"}`}>
                  {response.status}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="pt-8">
          {activeTab === "request" && (
            <>
              <div className="flex items-end justify-between pb-5 border-b border-slate-200">
                <div>
                  <h2 className="text-[22px] font-bold text-slate-900">Test request</h2>
                  <p className="text-[14px] text-slate-500 mt-1">Send a live request to any API endpoint.</p>
                </div>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                  {sending ? "Sending..." : "Send request"}
                </button>
              </div>

              <div className="mt-6 max-w-[920px] space-y-5">
                <div className="flex gap-3">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="h-11 w-[120px] rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-800 outline-none"
                  >
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/api/workflows"
                    className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-mono text-slate-800 outline-none"
                  />
                </div>

                {method !== "GET" && method !== "HEAD" && (
                  <div>
                    <div className="mb-2 text-[13px] font-medium text-slate-600">Request body</div>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-slate-950 p-4 text-[12px] leading-6 text-slate-200 font-mono outline-none resize-y"
                    />
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
                  Requests are sent to <span className="font-mono font-medium text-slate-700">{import.meta.env.VITE_API_BASE_URL || window.location.origin}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === "response" && (
            <>
              <div className="flex items-end justify-between pb-5 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <h2 className="text-[22px] font-bold text-slate-900">Response</h2>
                  {response && (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold ${
                        response.status >= 200 && response.status < 300 ? "bg-emerald-100 text-emerald-700" :
                        response.status >= 400 ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {response.status >= 200 && response.status < 300 ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {response.status || "Error"}
                      </span>
                      <span className="text-[12px] text-slate-400">{response.duration}ms</span>
                    </div>
                  )}
                </div>
                {response && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <Copy size={13} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              <div className="mt-6 max-w-[920px]">
                {response ? (
                  <pre className="rounded-2xl bg-slate-950 p-5 text-[12px] leading-6 text-slate-200 font-mono overflow-x-auto max-h-[600px] overflow-y-auto">
                    {response.body}
                  </pre>
                ) : (
                  <div className="rounded-2xl bg-slate-100 p-8 text-center text-[14px] text-slate-500">
                    No response yet. Send a request from the Test request tab.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "auth" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">Auth headers</h2>
                <p className="text-[14px] text-slate-500 mt-1">Required and optional request headers for API authentication.</p>
              </div>

              <div className="mt-6 max-w-[920px] divide-y divide-slate-200">
                {[
                  { header: "Authorization", value: "Bearer <session-token>", required: true, description: "Required for authenticated dashboard requests" },
                  { header: "Content-Type", value: "application/json", required: true, description: "Required for POST/PUT/PATCH requests" },
                  { header: "X-FlowHolt-Signature", value: "sha256=...", required: false, description: "HMAC signature for webhook verification" },
                  { header: "X-Idempotency-Key", value: "unique-request-id", required: false, description: "Prevents duplicate webhook processing" },
                  { header: "X-Forwarded-For", value: "client-ip", required: false, description: "Used for rate limiting when behind proxy" },
                ].map((item) => (
                  <div key={item.header} className="grid grid-cols-[200px_1fr] gap-6 py-4">
                    <div>
                      <div className="text-[14px] font-medium text-slate-800 font-mono">{item.header}</div>
                      <span className={`mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide ${item.required ? "text-red-500" : "text-slate-400"}`}>
                        {item.required ? "Required" : "Optional"}
                      </span>
                    </div>
                    <div>
                      <div className="text-[13px] font-mono text-slate-600">{item.value}</div>
                      <div className="mt-1 text-[12px] text-slate-500">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "endpoints" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">API Endpoints</h2>
                <p className="text-[14px] text-slate-500 mt-1">{endpointCatalog.length} available endpoints. Click any to load it in the playground.</p>
              </div>

              <div className="mt-6 max-w-[920px] divide-y divide-slate-200">
                {endpointCatalog.map((ep) => (
                  <button
                    key={`${ep.method}-${ep.path}`}
                    onClick={() => selectEndpoint(ep)}
                    className="w-full flex items-center justify-between py-3.5 hover:bg-slate-50 transition-colors text-left px-2 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-6 items-center rounded-md px-2 text-[10px] font-bold ${methodColors[ep.method] ?? "bg-slate-100 text-slate-700"}`}>
                        {ep.method}
                      </span>
                      <span className="text-[13px] font-mono text-slate-800">{ep.path}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-slate-400">{ep.description}</span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiPlaygroundPage;
