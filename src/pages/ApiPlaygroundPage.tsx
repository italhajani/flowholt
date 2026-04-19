import { useState } from "react";
import { Search, Send, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ── Endpoint catalogue ── */
interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  hasBody?: boolean;
  pathParams?: string[];
  mockResponse: { status: number; statusText: string; time: string; body: string };
}

interface EndpointGroup {
  name: string;
  endpoints: Endpoint[];
}

const mockGroups: EndpointGroup[] = [
  {
    name: "Workflows",
    endpoints: [
      { method: "GET", path: "/api/workflows", description: "List all workflows", mockResponse: { status: 200, statusText: "OK", time: "42ms", body: JSON.stringify({ data: [{ id: "wf-001", name: "Lead Qualification Pipeline", status: "active" }, { id: "wf-002", name: "Invoice Processing", status: "active" }], total: 2, limit: 20, offset: 0 }, null, 2) } },
      { method: "POST", path: "/api/workflows", description: "Create a new workflow", hasBody: true, mockResponse: { status: 201, statusText: "Created", time: "89ms", body: JSON.stringify({ id: "wf-003", name: "New Workflow", status: "draft", createdAt: "2026-04-18T14:00:00Z" }, null, 2) } },
      { method: "GET", path: "/api/workflows/:id", description: "Get workflow by ID", pathParams: ["id"], mockResponse: { status: 200, statusText: "OK", time: "38ms", body: JSON.stringify({ id: "wf-001", name: "Lead Qualification Pipeline", status: "active", nodes: 8, connections: 5 }, null, 2) } },
      { method: "PUT", path: "/api/workflows/:id", description: "Update a workflow", pathParams: ["id"], hasBody: true, mockResponse: { status: 200, statusText: "OK", time: "67ms", body: JSON.stringify({ id: "wf-001", name: "Lead Qualification Pipeline", status: "active", updatedAt: "2026-04-18T14:05:00Z" }, null, 2) } },
      { method: "DELETE", path: "/api/workflows/:id", description: "Delete a workflow", pathParams: ["id"], mockResponse: { status: 204, statusText: "No Content", time: "54ms", body: "" } },
    ],
  },
  {
    name: "Executions",
    endpoints: [
      { method: "GET", path: "/api/executions", description: "List all executions", mockResponse: { status: 200, statusText: "OK", time: "56ms", body: JSON.stringify({ data: [{ id: "exec-1247", workflowId: "wf-001", status: "success", duration: "4.2s" }], total: 1 }, null, 2) } },
      { method: "GET", path: "/api/executions/:id", description: "Get execution by ID", pathParams: ["id"], mockResponse: { status: 200, statusText: "OK", time: "44ms", body: JSON.stringify({ id: "exec-1247", workflowId: "wf-001", status: "success", duration: "4.2s", nodes: 8 }, null, 2) } },
      { method: "POST", path: "/api/executions/:id/retry", description: "Retry a failed execution", pathParams: ["id"], mockResponse: { status: 202, statusText: "Accepted", time: "31ms", body: JSON.stringify({ id: "exec-1248", status: "pending" }, null, 2) } },
      { method: "DELETE", path: "/api/executions/:id", description: "Delete an execution", pathParams: ["id"], mockResponse: { status: 204, statusText: "No Content", time: "28ms", body: "" } },
    ],
  },
  {
    name: "Webhooks",
    endpoints: [
      { method: "GET", path: "/api/webhooks", description: "List webhook endpoints", mockResponse: { status: 200, statusText: "OK", time: "35ms", body: JSON.stringify({ data: [{ id: "wh1", name: "Stripe Events", status: "active" }], total: 1 }, null, 2) } },
      { method: "POST", path: "/api/webhooks", description: "Create a webhook", hasBody: true, mockResponse: { status: 201, statusText: "Created", time: "72ms", body: JSON.stringify({ id: "wh6", name: "New Webhook", status: "active" }, null, 2) } },
      { method: "GET", path: "/api/webhooks/:id", description: "Get webhook by ID", pathParams: ["id"], mockResponse: { status: 200, statusText: "OK", time: "29ms", body: JSON.stringify({ id: "wh1", name: "Stripe Events", url: "/hooks/stripe-events", status: "active" }, null, 2) } },
      { method: "DELETE", path: "/api/webhooks/:id", description: "Delete a webhook", pathParams: ["id"], mockResponse: { status: 204, statusText: "No Content", time: "41ms", body: "" } },
    ],
  },
  {
    name: "Human Tasks",
    endpoints: [
      { method: "GET", path: "/api/tasks", description: "List human tasks", mockResponse: { status: 200, statusText: "OK", time: "48ms", body: JSON.stringify({ data: [{ id: "ht1", workflowName: "Lead Qualification Pipeline", status: "open" }], total: 1 }, null, 2) } },
      { method: "GET", path: "/api/tasks/:id", description: "Get task by ID", pathParams: ["id"], mockResponse: { status: 200, statusText: "OK", time: "33ms", body: JSON.stringify({ id: "ht1", workflowName: "Lead Qualification Pipeline", taskType: "approval", status: "open" }, null, 2) } },
      { method: "POST", path: "/api/tasks/:id/complete", description: "Complete a task", pathParams: ["id"], hasBody: true, mockResponse: { status: 200, statusText: "OK", time: "91ms", body: JSON.stringify({ id: "ht1", status: "completed", completedAt: "2026-04-18T14:10:00Z" }, null, 2) } },
      { method: "POST", path: "/api/tasks/:id/cancel", description: "Cancel a task", pathParams: ["id"], mockResponse: { status: 200, statusText: "OK", time: "45ms", body: JSON.stringify({ id: "ht1", status: "cancelled" }, null, 2) } },
    ],
  },
  {
    name: "Vault",
    endpoints: [
      { method: "GET", path: "/api/vault/credentials", description: "List credentials", mockResponse: { status: 200, statusText: "OK", time: "52ms", body: JSON.stringify({ data: [{ id: "cred-1", name: "Stripe API Key", provider: "stripe" }], total: 1 }, null, 2) } },
      { method: "POST", path: "/api/vault/credentials", description: "Create a credential", hasBody: true, mockResponse: { status: 201, statusText: "Created", time: "78ms", body: JSON.stringify({ id: "cred-2", name: "New Credential", provider: "custom" }, null, 2) } },
      { method: "GET", path: "/api/vault/credentials/:id", description: "Get credential by ID", pathParams: ["id"], mockResponse: { status: 200, statusText: "OK", time: "31ms", body: JSON.stringify({ id: "cred-1", name: "Stripe API Key", provider: "stripe", createdAt: "2026-01-15" }, null, 2) } },
      { method: "DELETE", path: "/api/vault/credentials/:id", description: "Delete a credential", pathParams: ["id"], mockResponse: { status: 204, statusText: "No Content", time: "36ms", body: "" } },
      { method: "GET", path: "/api/vault/connections", description: "List connections", mockResponse: { status: 200, statusText: "OK", time: "43ms", body: JSON.stringify({ data: [{ id: "conn-1", name: "Postgres DB", type: "database" }], total: 1 }, null, 2) } },
    ],
  },
  {
    name: "AI Agents",
    endpoints: [
      { method: "GET", path: "/api/agents", description: "List AI agents", mockResponse: { status: 200, statusText: "OK", time: "61ms", body: JSON.stringify({ data: [{ id: "agent-1", name: "Sales Copilot", model: "gpt-4o" }], total: 1 }, null, 2) } },
      { method: "GET", path: "/api/agents/:id", description: "Get agent by ID", pathParams: ["id"], mockResponse: { status: 200, statusText: "OK", time: "39ms", body: JSON.stringify({ id: "agent-1", name: "Sales Copilot", model: "gpt-4o", tools: 3, temperature: 0.7 }, null, 2) } },
      { method: "POST", path: "/api/agents/:id/invoke", description: "Invoke an agent", pathParams: ["id"], hasBody: true, mockResponse: { status: 200, statusText: "OK", time: "1.2s", body: JSON.stringify({ output: "Based on the lead data, I recommend...", tokensUsed: 340 }, null, 2) } },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-50 text-green-600",
  POST: "bg-blue-50 text-blue-600",
  PUT: "bg-amber-50 text-amber-600",
  DELETE: "bg-red-50 text-red-600",
};

const statusBadgeVariant = (code: number): "success" | "warning" | "danger" | "info" => {
  if (code < 300) return "success";
  if (code < 400) return "info";
  if (code < 500) return "warning";
  return "danger";
};

export function ApiPlaygroundPage() {
  const [search, setSearch] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(mockGroups[0].endpoints[0]);
  const [authType, setAuthType] = useState<"none" | "api-key" | "bearer">("none");
  const [token, setToken] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [showHeaders, setShowHeaders] = useState(false);
  const [hasSent, setHasSent] = useState(true);

  const paramValues: Record<string, string> = {};
  selectedEndpoint.pathParams?.forEach((p) => { paramValues[p] = ""; });

  const filteredGroups = mockGroups.map((g) => ({
    ...g,
    endpoints: g.endpoints.filter((e) => !search || e.path.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase())),
  })).filter((g) => g.endpoints.length > 0);

  return (
    <div className="flex h-full">
      {/* ── Left sidebar ── */}
      <div className="w-[320px] flex-shrink-0 border-r border-zinc-100 overflow-y-auto">
        <div className="p-3">
          <Input prefix={<Search size={13} />} placeholder="Search endpoints…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <nav className="pb-4">
          {filteredGroups.map((group) => (
            <div key={group.name}>
              <p className="sticky top-0 bg-white px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400">{group.name}</p>
              {group.endpoints.map((ep) => {
                const isSelected = ep.path === selectedEndpoint.path && ep.method === selectedEndpoint.method;
                return (
                  <button
                    key={`${ep.method}-${ep.path}`}
                    onClick={() => { setSelectedEndpoint(ep); setHasSent(true); setRequestBody(""); }}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-1.5 text-left transition-colors duration-100 hover:bg-zinc-50",
                      isSelected && "bg-zinc-50 border-l-2 border-zinc-900",
                      !isSelected && "border-l-2 border-transparent"
                    )}
                  >
                    <span className={cn("inline-flex w-12 justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium", methodColors[ep.method])}>
                      {ep.method}
                    </span>
                    <span className="text-[12px] text-zinc-600 truncate">{ep.path}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Endpoint header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className={cn("inline-flex px-2.5 py-1 rounded text-[12px] font-mono font-semibold", methodColors[selectedEndpoint.method])}>
              {selectedEndpoint.method}
            </span>
            <span className="text-[16px] font-mono font-medium text-zinc-800">{selectedEndpoint.path}</span>
          </div>
          <p className="text-[13px] text-zinc-500">{selectedEndpoint.description}</p>
        </div>

        {/* Authentication */}
        <Section title="Authentication">
          <div className="flex items-center gap-3">
            <select
              value={authType}
              onChange={(e) => setAuthType(e.target.value as typeof authType)}
              className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all duration-150"
            >
              <option value="none">None</option>
              <option value="api-key">API Key</option>
              <option value="bearer">Bearer Token</option>
            </select>
            {authType !== "none" && (
              <Input
                placeholder={authType === "api-key" ? "Enter API key…" : "Enter token…"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1 max-w-sm font-mono text-[12px]"
              />
            )}
          </div>
        </Section>

        {/* Path parameters */}
        {selectedEndpoint.pathParams && selectedEndpoint.pathParams.length > 0 && (
          <Section title="Parameters">
            <div className="space-y-2">
              {selectedEndpoint.pathParams.map((param) => (
                <div key={param} className="flex items-center gap-3">
                  <label className="text-[12px] font-medium text-zinc-500 w-16">{param}</label>
                  <Input placeholder={`Enter ${param}…`} className="max-w-xs font-mono text-[12px]" />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Request body */}
        {selectedEndpoint.hasBody && (
          <Section title="Request Body">
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder={'{\n  "name": "Example",\n  "status": "active"\n}'}
              className="w-full h-32 rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-[12px] text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all duration-150 resize-y"
            />
          </Section>
        )}

        {/* Send button */}
        <div className="mt-5 mb-6">
          <Button variant="primary" size="md" onClick={() => setHasSent(true)}>
            <Send size={13} /> Send Request
          </Button>
        </div>

        {/* Response */}
        {hasSent && (
          <div className="rounded-lg border border-zinc-100 bg-white shadow-xs overflow-hidden">
            {/* Response header */}
            <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid #f4f4f5" }}>
              <Badge variant={statusBadgeVariant(selectedEndpoint.mockResponse.status)}>
                {selectedEndpoint.mockResponse.status} {selectedEndpoint.mockResponse.statusText}
              </Badge>
              <span className="text-[11px] font-mono text-zinc-400">{selectedEndpoint.mockResponse.time}</span>
              <button
                onClick={() => setShowHeaders((v) => !v)}
                className="ml-auto flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showHeaders ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Headers
              </button>
            </div>

            {/* Collapsible headers */}
            {showHeaders && (
              <div className="px-5 py-3 bg-zinc-50 text-[11px] font-mono text-zinc-500 space-y-1" style={{ borderBottom: "1px solid #f4f4f5" }}>
                <p>content-type: application/json</p>
                <p>x-request-id: req_a1b2c3d4</p>
                <p>x-ratelimit-remaining: 999</p>
              </div>
            )}

            {/* Response body */}
            {selectedEndpoint.mockResponse.body ? (
              <div className="relative">
                <pre className="bg-zinc-900 text-green-400 font-mono text-[12px] p-5 overflow-x-auto leading-relaxed">
                  {selectedEndpoint.mockResponse.body}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(selectedEndpoint.mockResponse.body)}
                  className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Copy response"
                >
                  <Copy size={13} />
                </button>
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-[12px] text-zinc-400">No response body</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}
