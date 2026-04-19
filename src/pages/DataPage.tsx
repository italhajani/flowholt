import { useState } from "react";
import {
  Database, Plus, Search, Table2, Brain, Server, FileCode, HardDrive, Hash,
  ChevronRight, X, Eye, Pencil, Trash2, RefreshCw, CheckCircle2, AlertCircle,
  Loader2, Upload, Plug, Settings2, ArrowUpDown, GripVertical, ToggleLeft,
} from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";
import { KnowledgeUploadModal } from "@/components/modals/KnowledgeUploadModal";
import { MCPServerWizard } from "@/components/modals/MCPServerWizard";

const tabs = ["Data Stores", "Schemas", "Knowledge", "MCP Servers"] as const;
type Tab = (typeof tabs)[number];
const tabIcons = { "Data Stores": Table2, Schemas: Database, Knowledge: Brain, "MCP Servers": Server };

/* ── Data Store mock ── */
interface DataStore {
  id: string;
  name: string;
  type: "Key-Value" | "Table" | "Queue";
  records: number;
  size: string;
  linkedWorkflows: number;
  lastUpdated: string;
}
const mockStores: DataStore[] = [
  { id: "ds1", name: "user-preferences", type: "Key-Value", records: 2840, size: "1.2 MB", linkedWorkflows: 3, lastUpdated: "5 min ago" },
  { id: "ds2", name: "invoice-records", type: "Table", records: 18420, size: "24.6 MB", linkedWorkflows: 5, lastUpdated: "1 hr ago" },
  { id: "ds3", name: "task-queue", type: "Queue", records: 47, size: "128 KB", linkedWorkflows: 2, lastUpdated: "Just now" },
  { id: "ds4", name: "customer-profiles", type: "Table", records: 9100, size: "8.3 MB", linkedWorkflows: 4, lastUpdated: "2 hrs ago" },
  { id: "ds5", name: "cache-layer", type: "Key-Value", records: 560, size: "384 KB", linkedWorkflows: 1, lastUpdated: "3 hrs ago" },
];

/* ── Schema mock ── */
interface Schema {
  id: string;
  name: string;
  version: string;
  fields: number;
  usedBy: number;
  lastEdited: string;
}
const mockSchemas: Schema[] = [
  { id: "s1", name: "InvoicePayload", version: "v2.1", fields: 14, usedBy: 3, lastEdited: "2 days ago" },
  { id: "s2", name: "ContactRecord", version: "v1.0", fields: 8, usedBy: 5, lastEdited: "1 week ago" },
  { id: "s3", name: "WebhookEvent", version: "v3.0", fields: 6, usedBy: 7, lastEdited: "3 days ago" },
  { id: "s4", name: "LeadScore", version: "v1.2", fields: 4, usedBy: 2, lastEdited: "5 days ago" },
];

/* ── Knowledge mock ── */
interface KnowledgeAsset {
  id: string;
  name: string;
  format: "PDF" | "Markdown" | "CSV" | "JSON";
  chunks: number;
  indexState: "indexed" | "indexing" | "failed";
  agents: number;
  size: string;
  uploaded: string;
}
const mockKnowledge: KnowledgeAsset[] = [
  { id: "k1", name: "Product Documentation", format: "PDF", chunks: 347, indexState: "indexed", agents: 2, size: "4.8 MB", uploaded: "1 week ago" },
  { id: "k2", name: "API Reference v3", format: "Markdown", chunks: 128, indexState: "indexed", agents: 3, size: "1.2 MB", uploaded: "3 days ago" },
  { id: "k3", name: "Customer FAQ Dataset", format: "CSV", chunks: 89, indexState: "indexing", agents: 1, size: "640 KB", uploaded: "2 hrs ago" },
  { id: "k4", name: "Internal Policies", format: "PDF", chunks: 0, indexState: "failed", agents: 0, size: "12.1 MB", uploaded: "5 hrs ago" },
];

/* ── MCP Server mock ── */
interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: "healthy" | "degraded" | "error";
  tools: number;
  agents: number;
  lastPing: string;
}
const mockMCP: MCPServer[] = [
  { id: "m1", name: "Code Intelligence", url: "mcp://code-intel.local:8080", status: "healthy", tools: 12, agents: 2, lastPing: "10s ago" },
  { id: "m2", name: "Document Search", url: "mcp://docs-search.local:8081", status: "healthy", tools: 4, agents: 3, lastPing: "15s ago" },
  { id: "m3", name: "Database Ops", url: "mcp://db-ops.local:8082", status: "degraded", tools: 8, agents: 1, lastPing: "45s ago" },
];

/* ── Column defs ── */
const typeColors = { "Key-Value": "bg-purple-50 text-purple-600", Table: "bg-blue-50 text-blue-600", Queue: "bg-amber-50 text-amber-600" };

const storeColumns: Column<DataStore>[] = [
  {
    id: "name", header: "Name", sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <HardDrive size={13} className="text-zinc-400" />
        <span className="font-medium text-zinc-800">{row.name}</span>
      </div>
    ),
  },
  {
    id: "type", header: "Type",
    accessor: (row) => <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-medium", typeColors[row.type])}>{row.type}</span>,
  },
  { id: "records", header: "Records", sortable: true, accessor: (row) => <span className="font-mono text-[12px] text-zinc-600">{row.records.toLocaleString()}</span> },
  { id: "size", header: "Size", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.size}</span> },
  { id: "linked", header: "Workflows", hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.linkedWorkflows}</span> },
  { id: "updated", header: "Updated", sortable: true, hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.lastUpdated}</span> },
];

const schemaColumns: Column<Schema>[] = [
  {
    id: "name", header: "Name", sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <FileCode size={13} className="text-zinc-400" />
        <span className="font-medium text-zinc-800">{row.name}</span>
        <Badge variant="neutral">{row.version}</Badge>
      </div>
    ),
  },
  { id: "fields", header: "Fields", sortable: true, accessor: (row) => <span className="font-mono text-[12px] text-zinc-600">{row.fields}</span> },
  { id: "usedBy", header: "Used By", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.usedBy} workflows</span> },
  { id: "edited", header: "Last Edited", sortable: true, hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.lastEdited}</span> },
];

const indexColors = { indexed: "active" as const, indexing: "warning" as const, failed: "error" as const };
const knowledgeColumns: Column<KnowledgeAsset>[] = [
  {
    id: "name", header: "Name", sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <Brain size={13} className="text-zinc-400" />
        <span className="font-medium text-zinc-800">{row.name}</span>
        <Badge variant="neutral">{row.format}</Badge>
      </div>
    ),
  },
  {
    id: "state", header: "Index State",
    accessor: (row) => <StatusDot status={indexColors[row.indexState]} label={row.indexState} />,
  },
  { id: "chunks", header: "Chunks", sortable: true, hideBelow: "md", accessor: (row) => <span className="font-mono text-[12px] text-zinc-600">{row.chunks}</span> },
  { id: "agents", header: "Agents", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.agents}</span> },
  { id: "size", header: "Size", hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.size}</span> },
  { id: "uploaded", header: "Uploaded", sortable: true, hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.uploaded}</span> },
];

const mcpColumns: Column<MCPServer>[] = [
  {
    id: "name", header: "Server", sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <Server size={13} className="text-zinc-400" />
        <div>
          <p className="font-medium text-zinc-800 text-[13px]">{row.name}</p>
          <p className="text-[10px] text-zinc-400 font-mono">{row.url}</p>
        </div>
      </div>
    ),
  },
  {
    id: "status", header: "Status",
    accessor: (row) => <StatusDot status={row.status === "healthy" ? "healthy" : row.status === "degraded" ? "warning" : "error"} label={row.status} />,
  },
  { id: "tools", header: "Tools", sortable: true, accessor: (row) => <span className="font-mono text-[12px] text-zinc-600">{row.tools}</span> },
  { id: "agents", header: "Agents", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.agents}</span> },
  { id: "ping", header: "Last Ping", hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.lastPing}</span> },
];

/* ── Detail Data for Previews ── */

const storePreviewRows = [
  { key: "usr_001", value: '{ "theme": "dark", "lang": "en", "timezone": "UTC-5" }', updated: "5 min ago" },
  { key: "usr_002", value: '{ "theme": "light", "lang": "fr", "timezone": "UTC+1" }', updated: "12 min ago" },
  { key: "usr_003", value: '{ "theme": "dark", "lang": "de", "timezone": "UTC+2" }', updated: "1 hr ago" },
  { key: "usr_004", value: '{ "theme": "light", "lang": "en", "timezone": "UTC-8" }', updated: "2 hrs ago" },
  { key: "usr_005", value: '{ "theme": "dark", "lang": "es", "timezone": "UTC-3" }', updated: "3 hrs ago" },
];

const schemaFieldTypes = ["string", "number", "boolean", "date", "email", "url", "json", "array", "enum"] as const;

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

const mockSchemaFields: SchemaField[] = [
  { name: "id", type: "string", required: true, description: "Unique invoice identifier" },
  { name: "amount", type: "number", required: true, description: "Total amount in cents" },
  { name: "currency", type: "string", required: true, description: "ISO 4217 currency code" },
  { name: "issued_at", type: "date", required: true, description: "Invoice issue date" },
  { name: "due_at", type: "date", required: false, description: "Payment due date" },
  { name: "customer_email", type: "email", required: true, description: "Customer email address" },
  { name: "line_items", type: "json", required: true, description: "Array of line items" },
  { name: "paid", type: "boolean", required: false, description: "Whether invoice is paid" },
];

const mcpToolList = [
  { name: "search_code", description: "Search codebase by pattern", params: 2 },
  { name: "read_file", description: "Read file contents", params: 1 },
  { name: "run_tests", description: "Execute test suite", params: 3 },
  { name: "lint_code", description: "Run linter on file", params: 2 },
  { name: "format_code", description: "Format source code", params: 2 },
];

/* ── Detail Panel Components ── */

function DataStorePreview({ store, onClose }: { store: DataStore; onClose: () => void }) {
  return (
    <div className="mt-3 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Eye size={13} className="text-zinc-400" />
          <span className="text-[13px] font-medium text-zinc-800">{store.name}</span>
          <span className={cn("inline-flex px-2 py-0.5 rounded text-[9px] font-medium", typeColors[store.type])}>{store.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors" title="Refresh">
            <RefreshCw size={12} />
          </button>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>
      {/* Stats bar */}
      <div className="flex gap-6 border-b border-zinc-100 px-4 py-2 text-[11px]">
        <span className="text-zinc-400">Records <span className="font-semibold text-zinc-600">{store.records.toLocaleString()}</span></span>
        <span className="text-zinc-400">Size <span className="font-semibold text-zinc-600">{store.size}</span></span>
        <span className="text-zinc-400">Linked <span className="font-semibold text-zinc-600">{store.linkedWorkflows} workflows</span></span>
      </div>
      {/* Table preview */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="text-left px-4 py-2 font-semibold text-zinc-500">Key</th>
              <th className="text-left px-4 py-2 font-semibold text-zinc-500">Value</th>
              <th className="text-left px-4 py-2 font-semibold text-zinc-500">Updated</th>
            </tr>
          </thead>
          <tbody>
            {storePreviewRows.map((row) => (
              <tr key={row.key} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="px-4 py-2 font-mono text-zinc-700">{row.key}</td>
                <td className="px-4 py-2 font-mono text-zinc-500 max-w-[400px] truncate">{row.value}</td>
                <td className="px-4 py-2 text-zinc-400">{row.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2">
        <span className="text-[10px] text-zinc-400">Showing 5 of {store.records.toLocaleString()} records</span>
        <div className="flex gap-1">
          <button className="rounded px-2 py-0.5 text-[10px] font-medium text-zinc-500 hover:bg-zinc-100 transition-colors">← Prev</button>
          <button className="rounded px-2 py-0.5 text-[10px] font-medium text-zinc-500 hover:bg-zinc-100 transition-colors">Next →</button>
        </div>
      </div>
    </div>
  );
}

function SchemaFieldEditor({ schema, onClose }: { schema: Schema; onClose: () => void }) {
  const [fields, setFields] = useState<SchemaField[]>(mockSchemaFields.slice(0, schema.fields));

  const addField = () => {
    setFields([...fields, { name: "", type: "string", required: false, description: "" }]);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  return (
    <div className="mt-3 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Pencil size={13} className="text-zinc-400" />
          <span className="text-[13px] font-medium text-zinc-800">{schema.name}</span>
          <Badge variant="neutral">{schema.version}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-lg px-3 py-1 text-[11px] font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors">Save</button>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>
      <div className="divide-y divide-zinc-50">
        {/* Header row */}
        <div className="grid grid-cols-[20px_1fr_100px_60px_1.5fr_32px] gap-2 items-center px-4 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          <span />
          <span>Field Name</span>
          <span>Type</span>
          <span>Req</span>
          <span>Description</span>
          <span />
        </div>
        {fields.map((field, i) => (
          <div key={i} className="grid grid-cols-[20px_1fr_100px_60px_1.5fr_32px] gap-2 items-center px-4 py-1.5 hover:bg-zinc-50/50">
            <GripVertical size={11} className="text-zinc-300 cursor-grab" />
            <input
              value={field.name}
              onChange={(e) => {
                const next = [...fields];
                next[i] = { ...next[i], name: e.target.value };
                setFields(next);
              }}
              className="rounded border border-zinc-200 px-2 py-1 text-[12px] font-mono text-zinc-700 outline-none focus:border-zinc-400"
              placeholder="field_name"
            />
            <select
              value={field.type}
              onChange={(e) => {
                const next = [...fields];
                next[i] = { ...next[i], type: e.target.value };
                setFields(next);
              }}
              className="rounded border border-zinc-200 px-1.5 py-1 text-[11px] text-zinc-600 outline-none focus:border-zinc-400 bg-white"
            >
              {schemaFieldTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <label className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={field.required}
                onChange={() => {
                  const next = [...fields];
                  next[i] = { ...next[i], required: !next[i].required };
                  setFields(next);
                }}
                className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-800"
              />
            </label>
            <input
              value={field.description}
              onChange={(e) => {
                const next = [...fields];
                next[i] = { ...next[i], description: e.target.value };
                setFields(next);
              }}
              className="rounded border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 outline-none focus:border-zinc-400"
              placeholder="Description…"
            />
            <button onClick={() => removeField(i)} className="rounded p-1 text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-100 px-4 py-2">
        <button onClick={addField} className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-700 transition-colors">
          <Plus size={12} />
          Add field
        </button>
      </div>
    </div>
  );
}

function KnowledgeDetailPanel({ asset, onClose }: { asset: KnowledgeAsset; onClose: () => void }) {
  const progress = asset.indexState === "indexed" ? 100 : asset.indexState === "indexing" ? 67 : 0;
  return (
    <div className="mt-3 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Brain size={13} className="text-zinc-400" />
          <span className="text-[13px] font-medium text-zinc-800">{asset.name}</span>
          <Badge variant="neutral">{asset.format}</Badge>
        </div>
        <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors">
          <X size={13} />
        </button>
      </div>
      {/* Index progress */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-zinc-600">Indexing Progress</span>
            <span className="flex items-center gap-1 text-[11px]">
              {asset.indexState === "indexed" && <><CheckCircle2 size={11} className="text-emerald-500" /><span className="text-emerald-600">Complete</span></>}
              {asset.indexState === "indexing" && <><Loader2 size={11} className="text-amber-500 animate-spin" /><span className="text-amber-600">Processing…</span></>}
              {asset.indexState === "failed" && <><AlertCircle size={11} className="text-red-400" /><span className="text-red-500">Failed</span></>}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                asset.indexState === "indexed" ? "bg-emerald-500" : asset.indexState === "indexing" ? "bg-amber-400" : "bg-red-400"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Chunks", value: asset.chunks.toString() },
            { label: "Size", value: asset.size },
            { label: "Agents", value: asset.agents.toString() },
            { label: "Uploaded", value: asset.uploaded },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-zinc-50 px-3 py-2">
              <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-[13px] font-semibold text-zinc-700 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          {asset.indexState === "failed" && (
            <button className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-700 transition-colors">
              <RefreshCw size={11} />
              Retry Indexing
            </button>
          )}
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Upload size={11} />
            Re-upload
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">
            <Trash2 size={11} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function MCPServerDetail({ server, onClose }: { server: MCPServer; onClose: () => void }) {
  const [testing, setTesting] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Plug size={13} className="text-zinc-400" />
          <span className="text-[13px] font-medium text-zinc-800">{server.name}</span>
          <StatusDot status={server.status === "healthy" ? "healthy" : server.status === "degraded" ? "warning" : "error"} label={server.status} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setTesting(true); setTimeout(() => setTesting(false), 1500); }}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            {testing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            {testing ? "Testing…" : "Test Connection"}
          </button>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>
      {/* Server info */}
      <div className="grid grid-cols-3 gap-3 px-4 py-3 border-b border-zinc-100">
        <div>
          <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">Endpoint</p>
          <p className="text-[11px] font-mono text-zinc-600 mt-0.5">{server.url}</p>
        </div>
        <div>
          <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">Tools</p>
          <p className="text-[13px] font-semibold text-zinc-700 mt-0.5">{server.tools}</p>
        </div>
        <div>
          <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">Last Ping</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">{server.lastPing}</p>
        </div>
      </div>
      {/* Tool list */}
      <div className="px-4 py-2">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Available Tools</p>
        <div className="space-y-1">
          {mcpToolList.slice(0, server.tools > 5 ? 5 : server.tools).map((tool) => (
            <div key={tool.name} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 transition-colors">
              <Settings2 size={11} className="text-zinc-400 flex-shrink-0" />
              <span className="text-[11px] font-mono font-medium text-zinc-700">{tool.name}</span>
              <span className="text-[10px] text-zinc-400 flex-1 truncate">{tool.description}</span>
              <span className="text-[9px] text-zinc-300 font-mono">{tool.params} params</span>
            </div>
          ))}
          {server.tools > 5 && (
            <p className="text-[10px] text-zinc-400 pl-2">+ {server.tools - 5} more tools</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Action labels per tab ── */
const actionLabels: Record<Tab, string> = {
  "Data Stores": "New Store",
  Schemas: "New Schema",
  Knowledge: "Upload Asset",
  "MCP Servers": "Add Server",
};

export function DataPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Data Stores");
  const [search, setSearch] = useState("");
  const [selectedStore, setSelectedStore] = useState<DataStore | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeAsset | null>(null);
  const [selectedMCP, setSelectedMCP] = useState<MCPServer | null>(null);
  const [showKnowledgeUpload, setShowKnowledgeUpload] = useState(false);
  const [showMCPWizard, setShowMCPWizard] = useState(false);

  return (
    <div className="mx-auto max-w-[960px] px-8 py-8">
      <PageHeader
        title="Data"
        description="Data stores, schemas, knowledge assets, and MCP servers."
        actions={
           <Button
             variant="primary"
             size="md"
             onClick={() => {
               if (activeTab === "Knowledge") setShowKnowledgeUpload(true);
               if (activeTab === "MCP Servers") setShowMCPWizard(true);
             }}
           >
             <Plus size={14} strokeWidth={2.5} />
             {actionLabels[activeTab]}
           </Button>
        }
      />

      {/* Summary strip */}
      <div className="mt-6 flex gap-4 text-[12px]">
        <span className="text-zinc-400">
          Stores <span className="font-semibold text-zinc-700">{mockStores.length}</span>
        </span>
        <span className="text-zinc-400">
          Schemas <span className="font-semibold text-zinc-700">{mockSchemas.length}</span>
        </span>
        <span className="text-zinc-400">
          Knowledge <span className="font-semibold text-zinc-700">{mockKnowledge.length}</span>
        </span>
        <span className="text-zinc-400">
          MCP Servers <span className="font-semibold text-zinc-700">{mockMCP.length}</span>
        </span>
      </div>

      {/* Tab strip */}
      <div className="mt-4 flex items-center justify-between">
        <div
          className="flex items-center gap-0"
          style={{ borderBottom: "1px solid var(--color-border-default)" }}
        >
          {tabs.map((t) => {
            const Icon = tabIcons[t];
            return (
              <button
                key={t}
                onClick={() => { setActiveTab(t); setSearch(""); setSelectedStore(null); setSelectedSchema(null); setSelectedKnowledge(null); setSelectedMCP(null); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-px",
                  activeTab === t
                    ? "border-zinc-800 text-zinc-800"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                )}
              >
                <Icon size={13} />
                {t}
              </button>
            );
          })}
        </div>
        <Input
          prefix={<Search size={13} />}
          placeholder="Search…"
          className="w-48"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "Data Stores" && (
          <>
            <DataTable
              columns={storeColumns}
              data={mockStores.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))}
              getRowId={(s) => s.id}
              selectable
              onRowClick={(row) => setSelectedStore(selectedStore?.id === row.id ? null : row)}
              emptyState={<EmptyState icon={<Table2 size={32} strokeWidth={1.25} />} title="No data stores" description="Create structured data stores for your workflows." />}
            />
            {selectedStore && <DataStorePreview store={selectedStore} onClose={() => setSelectedStore(null)} />}
          </>
        )}

        {activeTab === "Schemas" && (
          <>
            <DataTable
              columns={schemaColumns}
              data={mockSchemas.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))}
              getRowId={(s) => s.id}
              selectable
              onRowClick={(row) => setSelectedSchema(selectedSchema?.id === row.id ? null : row)}
              emptyState={<EmptyState icon={<Database size={32} strokeWidth={1.25} />} title="No schemas defined" description="Define reusable data schemas for validation." />}
            />
            {selectedSchema && <SchemaFieldEditor schema={selectedSchema} onClose={() => setSelectedSchema(null)} />}
          </>
        )}

        {activeTab === "Knowledge" && (
          <>
            <DataTable
              columns={knowledgeColumns}
              data={mockKnowledge.filter((k) => !search || k.name.toLowerCase().includes(search.toLowerCase()))}
              getRowId={(k) => k.id}
              selectable
              onRowClick={(row) => setSelectedKnowledge(selectedKnowledge?.id === row.id ? null : row)}
              emptyState={<EmptyState icon={<Brain size={32} strokeWidth={1.25} />} title="No knowledge assets" description="Upload documents and knowledge for AI agents." />}
            />
            {selectedKnowledge && <KnowledgeDetailPanel asset={selectedKnowledge} onClose={() => setSelectedKnowledge(null)} />}
          </>
        )}

        {activeTab === "MCP Servers" && (
          <>
            <DataTable
              columns={mcpColumns}
              data={mockMCP.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()))}
              getRowId={(m) => m.id}
              onRowClick={(row) => setSelectedMCP(selectedMCP?.id === row.id ? null : row)}
              emptyState={<EmptyState icon={<Server size={32} strokeWidth={1.25} />} title="No MCP servers" description="Connect Model Context Protocol servers for tool use." />}
            />
            {selectedMCP && <MCPServerDetail server={selectedMCP} onClose={() => setSelectedMCP(null)} />}
          </>
        )}
      </div>

      {/* Knowledge upload modal */}
      <KnowledgeUploadModal open={showKnowledgeUpload} onClose={() => setShowKnowledgeUpload(false)} />

      {/* MCP Server wizard */}
      <MCPServerWizard open={showMCPWizard} onClose={() => setShowMCPWizard(false)} />
    </div>
  );
}
