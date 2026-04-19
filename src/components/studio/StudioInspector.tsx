import { useState } from "react";
import { X, ChevronRight, ChevronDown, Copy, Pin, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type CanvasNodeData, familyColors } from "./StudioCanvas";

const inspectorTabs = ["Parameters", "Input", "Output", "Settings"];

/* ── Per-node mock parameter configs ── */
const nodeConfigs: Record<string, { model?: string; prompt?: string; credential?: string; fields?: { label: string; value: string; type?: "select" | "text" | "number" | "textarea" }[] }> = {
  n1: { credential: "Webhook Endpoint", fields: [
    { label: "Method",         value: "POST",          type: "select" },
    { label: "Path",           value: "/leads/inbound",type: "text" },
    { label: "Authentication", value: "Header Auth",   type: "select" },
  ]},
  n2: { credential: "Clearbit API Key", fields: [
    { label: "Operation",  value: "Enrich Person",      type: "select" },
    { label: "Email Field",value: "={{$json.email}}",   type: "text" },
    { label: "Timeout",    value: "5000",               type: "number" },
  ]},
  n3: { model: "gpt-4o", prompt: "Score this lead from 0-100 based on company size, role seniority, and engagement signals.", credential: "OpenAI Production Key", fields: [
    { label: "Temperature", value: "0.3", type: "number" },
    { label: "Max Tokens",  value: "500", type: "number" },
  ]},
  n4: { fields: [
    { label: "Condition",    value: "score >= 70",  type: "text" },
    { label: "True Output",  value: "High Quality", type: "text" },
    { label: "False Output", value: "Low Quality",  type: "text" },
  ]},
  n5: { credential: "Salesforce Production", fields: [
    { label: "Operation",   value: "Update Record", type: "select" },
    { label: "Object",      value: "Lead",          type: "select" },
    { label: "Match Field", value: "Email",         type: "select" },
    { label: "Score Field", value: "Lead_Score__c", type: "text" },
  ]},
};

/* ── Mock node I/O data ── */
type DataView = "schema" | "table" | "json";

const mockInputData = {
  n2: {
    schema: [
      { key: "email",    type: "string",  value: "alex@acme.com" },
      { key: "company",  type: "string",  value: "Acme Inc" },
      { key: "source",   type: "string",  value: "contact-form" },
      { key: "ts",       type: "number",  value: "1714032000" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "company": "Acme Inc",\n  "source": "contact-form",\n  "ts": 1714032000\n}`,
  },
  n3: {
    schema: [
      { key: "email",       type: "string", value: "alex@acme.com" },
      { key: "name",        type: "string", value: "Alex Chen" },
      { key: "title",       type: "string", value: "VP Engineering" },
      { key: "employees",   type: "number", value: "1200" },
      { key: "techStack",   type: "array",  value: "['React', 'Python']" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "name": "Alex Chen",\n  "title": "VP Engineering",\n  "employees": 1200,\n  "techStack": ["React", "Python"]\n}`,
  },
};

const mockOutputData = {
  n1: {
    schema: [
      { key: "email",   type: "string", value: "alex@acme.com" },
      { key: "company", type: "string", value: "Acme Inc" },
      { key: "source",  type: "string", value: "contact-form" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "company": "Acme Inc",\n  "source": "contact-form"\n}`,
  },
  n2: {
    schema: [
      { key: "email",     type: "string", value: "alex@acme.com" },
      { key: "name",      type: "string", value: "Alex Chen" },
      { key: "title",     type: "string", value: "VP Engineering" },
      { key: "employees", type: "number", value: "1200" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "name": "Alex Chen",\n  "title": "VP Engineering",\n  "employees": 1200\n}`,
  },
  n3: {
    schema: [
      { key: "score",    type: "number", value: "87" },
      { key: "reasons",  type: "array",  value: "['Senior title', 'Large company', 'Tech role']" },
      { key: "category", type: "string", value: "High Quality" },
    ],
    json: `{\n  "score": 87,\n  "reasons": ["Senior title", "Large company", "Tech role"],\n  "category": "High Quality"\n}`,
  },
};

const typeColors: Record<string, string> = {
  string: "text-emerald-600 bg-emerald-50",
  number: "text-blue-600 bg-blue-50",
  array:  "text-violet-600 bg-violet-50",
  object: "text-amber-600 bg-amber-50",
  boolean:"text-rose-600 bg-rose-50",
};

interface StudioInspectorProps {
  node: CanvasNodeData;
  onClose: () => void;
}

export function StudioInspector({ node, onClose }: StudioInspectorProps) {
  const [activeTab, setActiveTab] = useState("Parameters");
  const colors = familyColors[node.family];
  const config = nodeConfigs[node.id] || { fields: [] };

  return (
    <div className="flex w-[380px] flex-col border-l border-zinc-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", colors.dot)} />
            <span className="text-[14px] font-semibold text-zinc-900">{node.name}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <p className="mt-0.5 text-[11px] text-zinc-400">
          {node.subtitle} · {node.family.charAt(0).toUpperCase() + node.family.slice(1)} Family
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-end gap-3 border-b border-zinc-100 px-4 flex-shrink-0">
        {inspectorTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative pb-2 pt-2 text-[11px] font-medium transition-colors",
              activeTab === tab ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-zinc-900" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "Parameters" && <ParametersContent config={config} />}
        {activeTab === "Input"      && <DataPanel nodeId={node.id} direction="input" />}
        {activeTab === "Output"     && <DataPanel nodeId={node.id} direction="output" />}
        {activeTab === "Settings"   && <SettingsContent nodeId={node.id} />}
      </div>
    </div>
  );
}

/* ── DATA panel (Input / Output) with 3 views ── */
function DataPanel({ nodeId, direction }: { nodeId: string; direction: "input" | "output" }) {
  const [view, setView] = useState<DataView>("schema");
  const data = direction === "input"
    ? (mockInputData as Record<string, { schema: { key: string; type: string; value: string }[]; json: string }>)[nodeId]
    : (mockOutputData as Record<string, { schema: { key: string; type: string; value: string }[]; json: string }>)[nodeId];

  const hasData = !!data;

  return (
    <div className="space-y-3">
      {/* View switcher */}
      <div className="flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5">
        {(["schema", "table", "json"] as DataView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex-1 rounded-md py-1 text-[11px] font-medium capitalize transition-colors",
              view === v ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Pin + Copy row */}
      {hasData && (
        <div className="flex items-center gap-2">
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Pin size={10} />
            Pin data
          </button>
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Copy size={10} />
            Copy
          </button>
          <span className="ml-auto text-[10px] text-zinc-400">1 item · 4 fields</span>
        </div>
      )}

      {/* Content */}
      {!hasData ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2">
          <RefreshCw size={20} className="text-zinc-300" />
          <p className="max-w-[180px] text-center text-[12px] text-zinc-400">
            Run the workflow to see {direction} data here.
          </p>
        </div>
      ) : view === "schema" ? (
        <SchemaView rows={data.schema} />
      ) : view === "table" ? (
        <TableView rows={data.schema} />
      ) : (
        <JsonView json={data.json} />
      )}
    </div>
  );
}

function SchemaView({ rows }: { rows: { key: string; type: string; value: string }[] }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  return (
    <div className="rounded-lg border border-zinc-100 divide-y divide-zinc-100 overflow-hidden">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 transition-colors cursor-pointer group" onClick={() => setCollapsed((p) => ({ ...p, [row.key]: !p[row.key] }))}>
          <ChevronRight size={11} className={cn("text-zinc-300 flex-shrink-0 transition-transform", collapsed[row.key] && "rotate-90")} />
          <span className="text-[12px] font-medium text-zinc-700 flex-1 truncate">{row.key}</span>
          <span className={cn("rounded px-1.5 py-0 text-[9px] font-medium flex-shrink-0", typeColors[row.type] || "text-zinc-500 bg-zinc-100")}>{row.type}</span>
          <span className="text-[11px] text-zinc-400 max-w-[100px] truncate flex-shrink-0">{row.value}</span>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Copy size={10} className="text-zinc-400 hover:text-zinc-600" />
          </button>
        </div>
      ))}
    </div>
  );
}

function TableView({ rows }: { rows: { key: string; type: string; value: string }[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-100">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-100">
            <th className="px-3 py-1.5 text-left font-medium text-zinc-500">Field</th>
            <th className="px-3 py-1.5 text-left font-medium text-zinc-500">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-zinc-50 transition-colors">
              <td className="px-3 py-1.5 font-medium text-zinc-700">{row.key}</td>
              <td className="px-3 py-1.5 text-zinc-500 max-w-[130px] truncate">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JsonView({ json }: { json: string }) {
  return (
    <div className="relative group">
      <pre className="overflow-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[11px] text-zinc-700 font-mono leading-relaxed max-h-64">{json}</pre>
      <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex h-6 w-6 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600">
        <Copy size={11} />
      </button>
    </div>
  );
}

/* ── SETTINGS content ── */
function SettingsContent({ nodeId }: { nodeId: string }) {
  const [retryEnabled, setRetryEnabled] = useState(false);
  const [continueOnError, setContinueOnError] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-5">
      <FieldGroup label="Node timeout (ms)">
        <input
          type="number"
          defaultValue={10000}
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
        />
      </FieldGroup>

      <div className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Error handling</p>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-[12px] font-medium text-zinc-700">Continue on error</p>
            <p className="text-[10px] text-zinc-400">Pass error to output instead of failing</p>
          </div>
          <button
            onClick={() => setContinueOnError((o) => !o)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors flex-shrink-0",
              continueOnError ? "bg-zinc-900" : "bg-zinc-200"
            )}
          >
            <span className={cn("absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform", continueOnError && "translate-x-4")} />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-[12px] font-medium text-zinc-700">Auto-retry on failure</p>
            <p className="text-[10px] text-zinc-400">Retry up to 3× with backoff</p>
          </div>
          <button
            onClick={() => setRetryEnabled((o) => !o)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors flex-shrink-0",
              retryEnabled ? "bg-zinc-900" : "bg-zinc-200"
            )}
          >
            <span className={cn("absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform", retryEnabled && "translate-x-4")} />
          </button>
        </label>
      </div>

      {retryEnabled && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 flex gap-2">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700">Retries may cause duplicate effects in downstream systems.</p>
        </div>
      )}

      <FieldGroup label="Node notes">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what this node does…"
          className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
        />
      </FieldGroup>
    </div>
  );
}

/* ── PARAMETERS content ── */
function ParametersContent({ config }: { config: typeof nodeConfigs[string] }) {
  const [advanced, setAdvanced] = useState(false);
  return (
    <div className="space-y-4">
      {config.model && (
        <FieldGroup label="Model">
          <select
            defaultValue={config.model}
            className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            <option>gpt-4o</option>
            <option>gpt-4o-mini</option>
            <option>gpt-3.5-turbo</option>
            <option>claude-3.5-sonnet</option>
            <option>claude-3-haiku</option>
          </select>
        </FieldGroup>
      )}
      {config.prompt && (
        <FieldGroup label="System Prompt">
          <textarea
            rows={3}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none"
            defaultValue={config.prompt}
          />
        </FieldGroup>
      )}
      {config.fields?.map((field) => (
        <FieldGroup key={field.label} label={field.label}>
          {field.type === "select" ? (
            <select
              defaultValue={field.value}
              className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
            >
              <option>{field.value}</option>
            </select>
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
        </FieldGroup>
      ))}
      {config.credential && (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">Credentials</p>
          <div className="flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50/50 px-3 py-2">
            <span className="h-[6px] w-[6px] rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-[12px] text-zinc-700 flex-1">{config.credential}</span>
            <span className="text-[10px] text-zinc-400">Connected</span>
          </div>
        </div>
      )}
      <button
        onClick={() => setAdvanced((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <ChevronDown size={12} className={cn("transition-transform", advanced ? "rotate-0" : "-rotate-90")} />
        Advanced
      </button>
      {advanced && (
        <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
          <FieldGroup label="Node label (display name)">
            <input type="text" placeholder="Custom label…" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
          </FieldGroup>
          <FieldGroup label="Node color">
            <select className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all">
              <option>Default</option>
              <option>Blue</option>
              <option>Green</option>
              <option>Red</option>
              <option>Purple</option>
            </select>
          </FieldGroup>
        </div>
      )}
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

