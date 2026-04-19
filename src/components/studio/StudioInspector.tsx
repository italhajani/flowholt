import { useState } from "react";
import {
  X, ChevronRight, ChevronDown, ChevronLeft, Copy, Pin, PinOff, RefreshCw,
  AlertTriangle, Play, Braces, Code2, Eye, EyeOff, Hash, MoreHorizontal,
  Search, Download, Upload, Trash2, Check, Clock, Zap, Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type CanvasNodeData, familyColors } from "./StudioCanvas";
import { ExpressionEditorModal } from "@/components/modals/ExpressionEditorModal";
import { CodeEditor } from "@/components/ui/code-editor";

type DataView = "schema" | "table" | "json" | "html";
type ParamFieldType = "select" | "text" | "number" | "textarea" | "code" | "expression";

const inspectorTabs = [
  { key: "Parameters", badge: null },
  { key: "Input",      badge: "3" },
  { key: "Output",     badge: "3" },
  { key: "Diff",       badge: null },
  { key: "Settings",   badge: null },
];

/* ── Per-node mock parameter configs ── */
interface NodeField {
  label: string;
  value: string;
  type?: ParamFieldType;
  expressionEnabled?: boolean;
  description?: string;
  options?: string[];
}

const nodeConfigs: Record<string, { model?: string; prompt?: string; credential?: string; fields?: NodeField[] }> = {
  n1: { credential: "Webhook Endpoint", fields: [
    { label: "Method", value: "POST", type: "select", options: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
    { label: "Path", value: "/leads/inbound", type: "text", description: "The URL path for this webhook" },
    { label: "Authentication", value: "Header Auth", type: "select", options: ["None", "Header Auth", "Basic Auth", "JWT"] },
    { label: "Response Code", value: "200", type: "number" },
    { label: "Response Body", value: '{"status": "ok"}', type: "code", description: "JSON response to send back" },
  ]},
  n2: { credential: "Clearbit API Key", fields: [
    { label: "Operation", value: "Enrich Person", type: "select", options: ["Enrich Person", "Enrich Company", "Find Email", "Reveal"] },
    { label: "Email Field", value: "={{$json.email}}", type: "expression", expressionEnabled: true, description: "Reference to email from previous node" },
    { label: "Timeout", value: "5000", type: "number", description: "Request timeout in milliseconds" },
    { label: "Include Company", value: "true", type: "select", options: ["true", "false"] },
  ]},
  n3: { model: "gpt-4o", prompt: "Score this lead from 0-100 based on company size, role seniority, and engagement signals. Return JSON with score and reasoning.", credential: "OpenAI Production Key", fields: [
    { label: "Temperature", value: "0.3", type: "number", description: "Lower = more deterministic" },
    { label: "Max Tokens", value: "500", type: "number" },
    { label: "JSON Mode", value: "true", type: "select", options: ["true", "false"] },
    { label: "System Context", value: "={{$json.company}} - {{$json.title}}", type: "expression", expressionEnabled: true },
  ]},
  n4: { fields: [
    { label: "Condition", value: "={{$json.score}} >= 70", type: "expression", expressionEnabled: true, description: "Expression that evaluates to true/false" },
    { label: "True Output", value: "High Quality", type: "text" },
    { label: "False Output", value: "Low Quality", type: "text" },
  ]},
  n5: { credential: "Salesforce Production", fields: [
    { label: "Operation", value: "Update Record", type: "select", options: ["Create Record", "Update Record", "Upsert Record", "Get Record", "Delete Record"] },
    { label: "Object", value: "Lead", type: "select", options: ["Lead", "Contact", "Account", "Opportunity", "Task"] },
    { label: "Match Field", value: "Email", type: "select", options: ["Email", "Id", "ExternalId"] },
    { label: "Score Field", value: "={{$json.score}}", type: "expression", expressionEnabled: true },
  ]},
};

/* ── Mock I/O data with pagination support ── */
interface DataRow { key: string; type: string; value: string }
interface MockDataSet {
  schema: DataRow[];
  json: string;
  totalItems: number;
  html?: string;
}

const mockInputData: Record<string, MockDataSet> = {
  n2: {
    schema: [
      { key: "email", type: "string", value: "alex@acme.com" },
      { key: "company", type: "string", value: "Acme Inc" },
      { key: "source", type: "string", value: "contact-form" },
      { key: "ts", type: "number", value: "1714032000" },
      { key: "metadata", type: "object", value: "{ip: '203.0.113.42'}" },
    ],
    json: `[\n  {\n    "email": "alex@acme.com",\n    "company": "Acme Inc",\n    "source": "contact-form",\n    "ts": 1714032000,\n    "metadata": { "ip": "203.0.113.42" }\n  },\n  {\n    "email": "jane@startup.io",\n    "company": "Startup IO",\n    "source": "demo-request",\n    "ts": 1714032060\n  },\n  {\n    "email": "bob@bigcorp.com",\n    "company": "BigCorp",\n    "source": "webinar",\n    "ts": 1714032120\n  }\n]`,
    totalItems: 45,
  },
  n3: {
    schema: [
      { key: "email", type: "string", value: "alex@acme.com" },
      { key: "name", type: "string", value: "Alex Chen" },
      { key: "title", type: "string", value: "VP Engineering" },
      { key: "employees", type: "number", value: "1200" },
      { key: "techStack", type: "array", value: "['React', 'Python', 'AWS']" },
      { key: "funding", type: "string", value: "$25M Series B" },
      { key: "industry", type: "string", value: "SaaS" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "name": "Alex Chen",\n  "title": "VP Engineering",\n  "employees": 1200,\n  "techStack": ["React", "Python", "AWS"],\n  "funding": "$25M Series B",\n  "industry": "SaaS"\n}`,
    totalItems: 45,
  },
};

const mockOutputData: Record<string, MockDataSet> = {
  n1: {
    schema: [
      { key: "email", type: "string", value: "alex@acme.com" },
      { key: "company", type: "string", value: "Acme Inc" },
      { key: "source", type: "string", value: "contact-form" },
      { key: "headers", type: "object", value: "{content-type: 'application/json'}" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "company": "Acme Inc",\n  "source": "contact-form",\n  "headers": { "content-type": "application/json" }\n}`,
    totalItems: 45,
  },
  n2: {
    schema: [
      { key: "email", type: "string", value: "alex@acme.com" },
      { key: "name", type: "string", value: "Alex Chen" },
      { key: "title", type: "string", value: "VP Engineering" },
      { key: "employees", type: "number", value: "1200" },
      { key: "techStack", type: "array", value: "['React', 'Python', 'AWS']" },
      { key: "domain", type: "string", value: "acme.com" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "name": "Alex Chen",\n  "title": "VP Engineering",\n  "employees": 1200,\n  "techStack": ["React", "Python", "AWS"],\n  "domain": "acme.com"\n}`,
    totalItems: 45,
    html: `<div class="enrichment-result"><h3>Alex Chen</h3><p>VP Engineering at Acme Inc (1,200 employees)</p><ul><li>React</li><li>Python</li><li>AWS</li></ul></div>`,
  },
  n3: {
    schema: [
      { key: "score", type: "number", value: "87" },
      { key: "reasons", type: "array", value: "['Senior title', 'Large company', 'Tech role']" },
      { key: "category", type: "string", value: "High Quality" },
      { key: "confidence", type: "number", value: "0.92" },
      { key: "model", type: "string", value: "gpt-4o" },
      { key: "latency_ms", type: "number", value: "340" },
    ],
    json: `{\n  "score": 87,\n  "reasons": ["Senior title", "Large company", "Tech role"],\n  "category": "High Quality",\n  "confidence": 0.92,\n  "model": "gpt-4o",\n  "latency_ms": 340\n}`,
    totalItems: 45,
  },
};

const typeColors: Record<string, string> = {
  string: "text-emerald-600 bg-emerald-50",
  number: "text-blue-600 bg-blue-50",
  array: "text-violet-600 bg-violet-50",
  object: "text-amber-600 bg-amber-50",
  boolean: "text-rose-600 bg-rose-50",
};

/* ── Execution status for run-this-node ── */
type RunStatus = "idle" | "running" | "success" | "error";

interface StudioInspectorProps {
  node: CanvasNodeData;
  onClose: () => void;
}

export function StudioInspector({ node, onClose }: StudioInspectorProps) {
  const [activeTab, setActiveTab] = useState("Parameters");
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [pinned, setPinned] = useState(false);
  const colors = familyColors[node.family];
  const config = nodeConfigs[node.id] || { fields: [] };

  const handleRunNode = () => {
    setRunStatus("running");
    setTimeout(() => {
      setRunStatus("success");
      setActiveTab("Output");
      setTimeout(() => setRunStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <div className="flex w-[400px] flex-col border-l border-zinc-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", colors.dot)} />
            <span className="text-[13px] font-semibold text-zinc-900 truncate">{node.name}</span>
            {pinned && <span className="flex-shrink-0 rounded bg-amber-50 border border-amber-200 px-1 py-0.5 text-[8px] font-semibold text-amber-600">PINNED</span>}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* Run this node button */}
            <button
              onClick={handleRunNode}
              disabled={runStatus === "running"}
              className={cn(
                "flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-medium transition-all",
                runStatus === "running" ? "bg-zinc-100 text-zinc-400 cursor-wait"
                  : runStatus === "success" ? "bg-green-50 text-green-600"
                  : runStatus === "error" ? "bg-red-50 text-red-600"
                  : "bg-zinc-900 text-white hover:bg-zinc-700"
              )}
            >
              {runStatus === "running" ? <><RefreshCw size={10} className="animate-spin" /> Running…</>
                : runStatus === "success" ? <><Check size={10} /> Done</>
                : runStatus === "error" ? <><AlertTriangle size={10} /> Error</>
                : <><Play size={10} /> Run</>}
            </button>
            <button onClick={() => setPinned(!pinned)} className={cn("rounded-md p-1.5 transition-colors", pinned ? "text-amber-500 bg-amber-50" : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600")} title={pinned ? "Unpin data" : "Pin data"}>
              {pinned ? <PinOff size={11} /> : <Pin size={11} />}
            </button>
            <button className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors">
              <MoreHorizontal size={12} />
            </button>
            <button onClick={onClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
        <p className="mt-0.5 text-[10px] text-zinc-400">
          {node.subtitle} · {node.family.charAt(0).toUpperCase() + node.family.slice(1)} · <span className="text-zinc-500">340ms avg</span>
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-end gap-3 border-b border-zinc-100 px-4 flex-shrink-0">
        {inspectorTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative flex items-center gap-1 pb-2 pt-2 text-[11px] font-medium transition-colors",
              activeTab === tab.key ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {tab.key}
            {tab.badge && (
              <span className={cn("rounded-full px-1 py-0 text-[8px] font-semibold", activeTab === tab.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400")}>{tab.badge}</span>
            )}
            {activeTab === tab.key && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-zinc-900" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "Parameters" && <ParametersContent config={config} />}
        {activeTab === "Input" && <DataPanel nodeId={node.id} direction="input" pinned={pinned} />}
        {activeTab === "Output" && <DataPanel nodeId={node.id} direction="output" pinned={pinned} />}
        {activeTab === "Diff" && <DiffPanel nodeId={node.id} />}
        {activeTab === "Settings" && <SettingsContent />}
      </div>
    </div>
  );
}

/* ── DATA panel with pagination, pin, views ── */
function DataPanel({ nodeId, direction, pinned }: { nodeId: string; direction: "input" | "output"; pinned: boolean }) {
  const [view, setView] = useState<DataView>("schema");
  const [page, setPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const pageSize = 10;

  const data = direction === "input" ? mockInputData[nodeId] : mockOutputData[nodeId];
  const hasData = !!data;
  const totalItems = data?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const filteredSchema = data?.schema.filter(r =>
    !searchFilter || r.key.toLowerCase().includes(searchFilter.toLowerCase()) || r.value.toLowerCase().includes(searchFilter.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-3">
      {/* Pinned data banner */}
      {pinned && hasData && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-100 px-2.5 py-1.5">
          <Pin size={10} className="text-amber-500" />
          <span className="text-[10px] text-amber-700 font-medium">Data is pinned — executions will use this snapshot</span>
        </div>
      )}

      {/* View switcher + search */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5 flex-1">
          {(["schema", "table", "json", ...(data?.html ? ["html"] : [])] as DataView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "flex-1 rounded-md py-1 text-[10px] font-medium capitalize transition-colors",
                view === v ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setShowSearch(!showSearch)} className={cn("rounded-md p-1.5 transition-colors", showSearch ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:bg-zinc-50")}>
          <Search size={11} />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1">
          <Search size={11} className="text-zinc-400" />
          <input
            autoFocus
            className="flex-1 text-[11px] outline-none bg-transparent text-zinc-700 placeholder:text-zinc-300"
            placeholder="Filter fields…"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          {searchFilter && <button onClick={() => setSearchFilter("")} className="text-zinc-300 hover:text-zinc-500"><X size={10} /></button>}
        </div>
      )}

      {/* Actions row */}
      {hasData && (
        <div className="flex items-center gap-1.5">
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Copy size={9} /> Copy
          </button>
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Download size={9} /> Export
          </button>
          {pinned && (
            <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
              <Upload size={9} /> Import
            </button>
          )}
          <span className="ml-auto text-[9px] text-zinc-400">
            {filteredSchema.length} fields · Item {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
          </span>
        </div>
      )}

      {/* Content */}
      {!hasData ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2">
          <RefreshCw size={20} className="text-zinc-300" />
          <p className="max-w-[180px] text-center text-[12px] text-zinc-400">
            Run the workflow to see {direction} data here.
          </p>
          <button className="mt-1 flex items-center gap-1 rounded-md bg-zinc-900 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-zinc-700 transition-colors">
            <Play size={10} /> Run this node
          </button>
        </div>
      ) : view === "schema" ? (
        <SchemaView rows={filteredSchema} />
      ) : view === "table" ? (
        <TableView rows={filteredSchema} />
      ) : view === "html" && data.html ? (
        <HtmlView html={data.html} />
      ) : (
        <JsonView json={data.json} />
      )}

      {/* Pagination */}
      {hasData && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={cn("flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors", page === 1 ? "text-zinc-300 cursor-not-allowed" : "text-zinc-500 hover:bg-zinc-50")}
          >
            <ChevronLeft size={10} /> Prev
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn("h-6 w-6 rounded text-[10px] font-medium transition-colors", page === p ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-50")}
              >
                {p}
              </button>
            ))}
            {totalPages > 4 && <span className="text-[10px] text-zinc-300">…</span>}
            {totalPages > 3 && (
              <button onClick={() => setPage(totalPages)} className={cn("h-6 w-6 rounded text-[10px] font-medium transition-colors", page === totalPages ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-50")}>
                {totalPages}
              </button>
            )}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={cn("flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors", page === totalPages ? "text-zinc-300 cursor-not-allowed" : "text-zinc-500 hover:bg-zinc-50")}
          >
            Next <ChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

function SchemaView({ rows }: { rows: DataRow[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <div className="rounded-lg border border-zinc-100 divide-y divide-zinc-100 overflow-hidden">
      {rows.map((row) => (
        <div key={row.key}>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 transition-colors cursor-pointer group"
            onClick={() => setExpanded((p) => ({ ...p, [row.key]: !p[row.key] }))}
          >
            <ChevronRight size={10} className={cn("text-zinc-300 flex-shrink-0 transition-transform", expanded[row.key] && "rotate-90")} />
            <span className="text-[11px] font-medium text-zinc-700 flex-1 truncate">{row.key}</span>
            <span className={cn("rounded px-1.5 py-0 text-[8px] font-semibold flex-shrink-0", typeColors[row.type] || "text-zinc-500 bg-zinc-100")}>{row.type}</span>
            <span className="text-[10px] text-zinc-400 max-w-[90px] truncate flex-shrink-0 font-mono">{row.value}</span>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); }}>
              <Copy size={9} className="text-zinc-400 hover:text-zinc-600" />
            </button>
          </div>
          {expanded[row.key] && (
            <div className="bg-zinc-50/50 px-4 py-2 border-t border-zinc-50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-zinc-400 uppercase font-medium">Path:</span>
                <code className="text-[9px] text-violet-600 font-mono bg-violet-50 px-1 rounded">$json.{row.key}</code>
                <button className="text-zinc-300 hover:text-zinc-500 transition-colors"><Copy size={8} /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-400 uppercase font-medium">Expression:</span>
                <code className="text-[9px] text-zinc-600 font-mono bg-zinc-100 px-1 rounded">{"={{$json." + row.key + "}}"}</code>
                <button className="text-zinc-300 hover:text-zinc-500 transition-colors"><Copy size={8} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TableView({ rows }: { rows: DataRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-100">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-100">
            <th className="px-3 py-1.5 text-left font-semibold text-zinc-500 w-8">#</th>
            <th className="px-3 py-1.5 text-left font-semibold text-zinc-500">Field</th>
            <th className="px-3 py-1.5 text-left font-semibold text-zinc-500 w-12">Type</th>
            <th className="px-3 py-1.5 text-left font-semibold text-zinc-500">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {rows.map((row, i) => (
            <tr key={row.key} className="hover:bg-zinc-50 transition-colors group">
              <td className="px-3 py-1.5 text-zinc-300 font-mono">{i}</td>
              <td className="px-3 py-1.5 font-medium text-zinc-700">{row.key}</td>
              <td className="px-3 py-1.5"><span className={cn("rounded px-1 py-0 text-[8px] font-semibold", typeColors[row.type])}>{row.type}</span></td>
              <td className="px-3 py-1.5 text-zinc-500 max-w-[120px] truncate font-mono text-[9px]">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JsonView({ json }: { json: string }) {
  const [wrap, setWrap] = useState(false);
  return (
    <div className="relative group">
      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => setWrap(!wrap)} className="flex h-5 items-center rounded border border-zinc-200 bg-white px-1.5 text-[8px] text-zinc-500 hover:text-zinc-700" title="Toggle wrap">
          {wrap ? "Nowrap" : "Wrap"}
        </button>
        <button className="flex h-5 w-5 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600">
          <Copy size={9} />
        </button>
      </div>
      <pre className={cn("overflow-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[10px] text-zinc-700 font-mono leading-relaxed max-h-72", wrap && "whitespace-pre-wrap")}>{json}</pre>
    </div>
  );
}

function HtmlView({ html }: { html: string }) {
  const [raw, setRaw] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setRaw(false)} className={cn("text-[10px] font-medium px-2 py-0.5 rounded transition-colors", !raw ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600")}>Preview</button>
        <button onClick={() => setRaw(true)} className={cn("text-[10px] font-medium px-2 py-0.5 rounded transition-colors", raw ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600")}>Source</button>
      </div>
      {raw ? (
        <pre className="overflow-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[10px] text-zinc-700 font-mono leading-relaxed max-h-64 whitespace-pre-wrap">{html}</pre>
      ) : (
        <div className="rounded-lg border border-zinc-100 bg-white p-3 text-[11px] text-zinc-700 max-h-64 overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
}

/* ── Diff panel — compare input vs output ── */
function DiffPanel({ nodeId }: { nodeId: string }) {
  const input = mockInputData[nodeId];
  const output = mockOutputData[nodeId];
  const hasData = !!input && !!output;

  if (!hasData) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <RefreshCw size={20} className="text-zinc-300" />
        <p className="text-[12px] text-zinc-400 text-center max-w-[200px]">Run the workflow to compare input vs output data.</p>
      </div>
    );
  }

  const inputKeys = new Set(input.schema.map(r => r.key));
  const outputKeys = new Set(output.schema.map(r => r.key));
  const allKeys = Array.from(new Set([...inputKeys, ...outputKeys]));
  const inputMap = Object.fromEntries(input.schema.map(r => [r.key, r]));
  const outputMap = Object.fromEntries(output.schema.map(r => [r.key, r]));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" /> Added</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Removed</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Changed</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-zinc-300" /> Unchanged</span>
      </div>

      <div className="rounded-lg border border-zinc-100 divide-y divide-zinc-100 overflow-hidden">
        {allKeys.map((key) => {
          const inRow = inputMap[key];
          const outRow = outputMap[key];
          const isAdded = !inRow && outRow;
          const isRemoved = inRow && !outRow;
          const isChanged = inRow && outRow && inRow.value !== outRow.value;

          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[11px]",
                isAdded && "bg-green-50/50",
                isRemoved && "bg-red-50/50",
                isChanged && "bg-amber-50/30",
              )}
            >
              <span className={cn(
                "h-1.5 w-1.5 rounded-full flex-shrink-0",
                isAdded ? "bg-green-400" : isRemoved ? "bg-red-400" : isChanged ? "bg-amber-400" : "bg-zinc-200"
              )} />
              <span className={cn("font-medium flex-shrink-0 w-24 truncate", isRemoved ? "text-red-500 line-through" : "text-zinc-700")}>{key}</span>
              {inRow && (
                <span className={cn("font-mono text-[9px] flex-1 truncate", isChanged || isRemoved ? "text-red-400 line-through" : "text-zinc-400")}>
                  {inRow.value}
                </span>
              )}
              {isChanged && <span className="text-[9px] text-zinc-300">→</span>}
              {outRow && (isChanged || isAdded) && (
                <span className="font-mono text-[9px] flex-1 truncate text-green-600">{outRow.value}</span>
              )}
              {!isChanged && !isAdded && !isRemoved && outRow && (
                <span className="font-mono text-[9px] flex-1 truncate text-zinc-400">{outRow.value}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-[9px] text-zinc-400">
        <span>Input: {input.schema.length} fields</span>
        <span>Output: {output.schema.length} fields</span>
        <span className="text-green-500">+{allKeys.filter(k => !inputKeys.has(k)).length} added</span>
        <span className="text-red-500">-{allKeys.filter(k => !outputKeys.has(k)).length} removed</span>
      </div>
    </div>
  );
}

/* ── SETTINGS content ── */
function SettingsContent() {
  const [retryEnabled, setRetryEnabled] = useState(false);
  const [continueOnError, setContinueOnError] = useState(false);
  const [retryCount, setRetryCount] = useState(3);
  const [notes, setNotes] = useState("");
  const [executeOnce, setExecuteOnce] = useState(false);

  return (
    <div className="space-y-5">
      <FieldGroup label="Node timeout (ms)" description="Maximum execution time before timeout">
        <input
          type="number"
          defaultValue={10000}
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
        />
      </FieldGroup>

      <div className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Error handling</p>

        <ToggleRow label="Continue on error" description="Pass error to output instead of failing" enabled={continueOnError} onToggle={() => setContinueOnError(o => !o)} />
        <ToggleRow label="Auto-retry on failure" description={`Retry up to ${retryCount}× with exponential backoff`} enabled={retryEnabled} onToggle={() => setRetryEnabled(o => !o)} />
      </div>

      {retryEnabled && (
        <>
          <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
            <FieldGroup label="Max retries">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5].map(n => (
                  <button key={n} onClick={() => setRetryCount(n)} className={cn("h-7 w-7 rounded-md text-[11px] font-medium transition-colors", retryCount === n ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-500 hover:bg-zinc-50")}>
                    {n}
                  </button>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Backoff strategy">
              <select className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
                <option>Exponential (1s, 2s, 4s…)</option>
                <option>Linear (1s, 2s, 3s…)</option>
                <option>Fixed (1s, 1s, 1s…)</option>
              </select>
            </FieldGroup>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 flex gap-2">
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700">Retries may cause duplicate effects in downstream systems. Consider adding idempotency keys.</p>
          </div>
        </>
      )}

      <div className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Execution</p>
        <ToggleRow label="Execute once" description="Only process the first incoming item" enabled={executeOnce} onToggle={() => setExecuteOnce(o => !o)} />
      </div>

      <FieldGroup label="Node notes" description="Documentation for other collaborators">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what this node does…"
          className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
        />
      </FieldGroup>

      <div className="pt-2 border-t border-zinc-100">
        <button className="flex items-center gap-1.5 text-[11px] text-red-500 hover:text-red-600 transition-colors">
          <Trash2 size={11} /> Delete this node
        </button>
      </div>
    </div>
  );
}

/* ── PARAMETERS content with expression editor ── */
function ParametersContent({ config }: { config: typeof nodeConfigs[string] }) {
  const [advanced, setAdvanced] = useState(false);
  const [exprFields, setExprFields] = useState<Record<string, boolean>>({});
  const [exprModalField, setExprModalField] = useState<string | null>(null);
  const [exprModalValue, setExprModalValue] = useState("");

  const toggleExpr = (label: string) => {
    setExprFields(p => ({ ...p, [label]: !p[label] }));
  };

  const openExpressionEditor = (field: { label: string; value: string }) => {
    setExprModalField(field.label);
    setExprModalValue(field.value);
  };

  return (
    <div className="space-y-4">
      {config.model && (
        <FieldGroup label="Model" description="AI model to use for inference">
          <select
            defaultValue={config.model}
            className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            <option>gpt-4o</option>
            <option>gpt-4o-mini</option>
            <option>gpt-3.5-turbo</option>
            <option>claude-3.5-sonnet</option>
            <option>claude-3-haiku</option>
            <option>gemini-1.5-pro</option>
          </select>
        </FieldGroup>
      )}

      {config.prompt && (
        <FieldGroup label="System Prompt" description="Instructions for the AI model">
          <textarea
            rows={3}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none font-mono"
            defaultValue={config.prompt}
          />
        </FieldGroup>
      )}

      {config.fields?.map((field) => {
        const isExprMode = field.expressionEnabled || exprFields[field.label] || field.type === "expression";
        return (
          <div key={field.label}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-zinc-500">{field.label}</label>
              <div className="flex items-center gap-1">
                {field.description && (
                  <span className="text-[8px] text-zinc-300 max-w-[120px] truncate" title={field.description}>ⓘ</span>
                )}
                {/* Expression toggle (fx button) — like n8n */}
                {field.type !== "select" && (
                  <button
                    onClick={() => toggleExpr(field.label)}
                    className={cn(
                      "flex h-5 items-center gap-0.5 rounded px-1.5 text-[9px] font-bold transition-all",
                      isExprMode ? "bg-violet-100 text-violet-700 border border-violet-200" : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50"
                    )}
                    title="Toggle expression mode"
                  >
                    <Braces size={9} /> fx
                  </button>
                )}
              </div>
            </div>

            {isExprMode ? (
              /* Expression editor with inline validation + autocomplete */
              <ExpressionFieldWithValidation field={field} onOpenEditor={openExpressionEditor} />
            ) : field.type === "select" ? (
              <select defaultValue={field.value} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all">
                {(field.options ?? [field.value]).map(o => <option key={o}>{o}</option>)}
              </select>
            ) : field.type === "code" ? (
              <CodeEditor
                value={field.value}
                language="json"
                height="100px"
                showToolbar={true}
                showAIAssist={false}
                showLineNumbers={false}
                compact
              />
            ) : field.type === "textarea" ? (
              <textarea
                rows={2}
                defaultValue={field.value}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none"
              />
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                defaultValue={field.value}
                className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
            )}
          </div>
        );
      })}

      {config.credential && (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">Credentials</p>
          <div className="flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50/50 px-3 py-2 hover:bg-zinc-50 transition-colors cursor-pointer">
            <span className="h-[6px] w-[6px] rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
            <span className="text-[12px] text-zinc-700 flex-1">{config.credential}</span>
            <span className="text-[9px] text-green-600 font-medium">Connected</span>
            <ChevronRight size={10} className="text-zinc-300" />
          </div>
        </div>
      )}

      <button
        onClick={() => setAdvanced((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <ChevronDown size={11} className={cn("transition-transform", advanced ? "rotate-0" : "-rotate-90")} />
        Advanced Settings
      </button>
      {advanced && (
        <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
          <FieldGroup label="Display name">
            <input type="text" placeholder="Custom label…" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
          </FieldGroup>
          <FieldGroup label="Node color">
            <div className="flex items-center gap-1.5">
              {["bg-zinc-400", "bg-blue-500", "bg-green-500", "bg-red-500", "bg-violet-500", "bg-amber-500"].map((c, i) => (
                <button key={c} className={cn("h-6 w-6 rounded-md transition-all hover:scale-110", c, i === 0 && "ring-2 ring-zinc-900 ring-offset-1")} />
              ))}
            </div>
          </FieldGroup>
          <FieldGroup label="Execution priority">
            <select className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
              <option>Normal</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </FieldGroup>
        </div>
      )}

      {/* Expression Editor Modal */}
      <ExpressionEditorModal
        open={exprModalField !== null}
        onClose={() => setExprModalField(null)}
        value={exprModalValue}
        fieldLabel={exprModalField ?? "Expression"}
      />
    </div>
  );
}
/* ── Expression field with inline validation + autocomplete ── */
const expressionVars = [
  { name: "$json", desc: "Current item data" },
  { name: "$json.email", desc: "Email field" },
  { name: "$json.company", desc: "Company name" },
  { name: "$json.score", desc: "Lead score" },
  { name: "$json.title", desc: "Job title" },
  { name: "$json.employees", desc: "Company size" },
  { name: "$input.item", desc: "Input item" },
  { name: "$now", desc: "Current timestamp" },
  { name: "$env", desc: "Environment vars" },
  { name: "$execution.id", desc: "Execution ID" },
  { name: "$workflow.id", desc: "Workflow ID" },
  { name: "$node", desc: "Current node reference" },
  { name: "$prevNode", desc: "Previous node reference" },
];

function ExpressionFieldWithValidation({ field, onOpenEditor }: { field: NodeField; onOpenEditor: (f: NodeField) => void }) {
  const [value, setValue] = useState(field.value);
  const [showAC, setShowAC] = useState(false);
  const [acQuery, setAcQuery] = useState("");

  const isValid = value.startsWith("={{") && value.endsWith("}}") && value.length > 5;
  const hasError = value.includes("={{") && !value.endsWith("}}");
  const resolvedValue = isValid ? value.slice(3, -2).replace("$json.", "") : value;

  const filteredVars = expressionVars.filter(v =>
    !acQuery || v.name.toLowerCase().includes(acQuery.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    // Show autocomplete when typing $
    if (v.includes("$")) {
      const dollarIdx = v.lastIndexOf("$");
      setAcQuery(v.slice(dollarIdx));
      setShowAC(true);
    } else {
      setShowAC(false);
    }
  };

  const insertVar = (varName: string) => {
    setValue(`={{${varName}}}`);
    setShowAC(false);
  };

  return (
    <div className="relative">
      <div className={cn(
        "rounded-md border-2 overflow-hidden",
        hasError ? "border-red-300 bg-red-50/20" : isValid ? "border-green-300 bg-green-50/10" : "border-violet-200 bg-violet-50/30"
      )}>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-50 border-b border-violet-100">
          <Braces size={9} className={hasError ? "text-red-500" : "text-violet-500"} />
          <span className="text-[9px] font-medium text-violet-600">Expression</span>
          {isValid && <Check size={8} className="text-green-500" />}
          {hasError && <AlertTriangle size={8} className="text-red-500" />}
          <button
            onClick={() => onOpenEditor(field)}
            className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-medium text-violet-500 hover:bg-violet-100 transition-colors"
          >
            <Maximize2 size={8} /> Full Editor
          </button>
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { if (value.includes("$")) setShowAC(true); }}
          onBlur={() => setTimeout(() => setShowAC(false), 200)}
          className="h-8 w-full bg-transparent px-2 text-[11px] text-violet-800 font-mono outline-none placeholder:text-violet-300"
          placeholder="={{$json.field}}"
        />
        <div className={cn("flex items-center gap-1.5 px-2 py-1 border-t", hasError ? "bg-red-50 border-red-100" : "bg-violet-50/50 border-violet-100")}>
          {hasError ? (
            <>
              <AlertTriangle size={8} className="text-red-500" />
              <span className="text-[8px] text-red-500 font-medium">Missing closing {"}}"} — expression is incomplete</span>
            </>
          ) : (
            <>
              <span className="text-[8px] text-violet-400">Result:</span>
              <span className="text-[9px] text-zinc-600 font-mono truncate">{resolvedValue}</span>
            </>
          )}
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {showAC && filteredVars.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-zinc-200 bg-white shadow-xl max-h-48 overflow-y-auto">
          <div className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">Variables</div>
          {filteredVars.map((v) => (
            <button
              key={v.name}
              onMouseDown={(e) => { e.preventDefault(); insertVar(v.name); }}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-violet-50 transition-colors"
            >
              <code className="text-[10px] text-violet-600 font-mono">{v.name}</code>
              <span className="text-[9px] text-zinc-400 truncate">{v.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldGroup({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
      {description && <p className="mb-1.5 text-[9px] text-zinc-300">{description}</p>}
      {children}
    </div>
  );
}

function ToggleRow({ label, description, enabled, onToggle }: { label: string; description: string; enabled: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div>
        <p className="text-[12px] font-medium text-zinc-700">{label}</p>
        <p className="text-[10px] text-zinc-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn("relative h-5 w-9 rounded-full transition-colors flex-shrink-0", enabled ? "bg-zinc-900" : "bg-zinc-200")}
      >
        <span className={cn("absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform", enabled && "translate-x-4")} />
      </button>
    </label>
  );
}

