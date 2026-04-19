import { useState } from "react";
import { Database, Plus, Search, Table2, Brain, Server, FileCode, HardDrive, Hash } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

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

  return (
    <div className="mx-auto max-w-[960px] px-8 py-8">
      <PageHeader
        title="Data"
        description="Data stores, schemas, knowledge assets, and MCP servers."
        actions={
          <Button variant="primary" size="md">
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
                onClick={() => { setActiveTab(t); setSearch(""); }}
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
          <DataTable
            columns={storeColumns}
            data={mockStores.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(s) => s.id}
            selectable
            emptyState={<EmptyState icon={<Table2 size={32} strokeWidth={1.25} />} title="No data stores" description="Create structured data stores for your workflows." />}
          />
        )}

        {activeTab === "Schemas" && (
          <DataTable
            columns={schemaColumns}
            data={mockSchemas.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(s) => s.id}
            selectable
            emptyState={<EmptyState icon={<Database size={32} strokeWidth={1.25} />} title="No schemas defined" description="Define reusable data schemas for validation." />}
          />
        )}

        {activeTab === "Knowledge" && (
          <DataTable
            columns={knowledgeColumns}
            data={mockKnowledge.filter((k) => !search || k.name.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(k) => k.id}
            selectable
            emptyState={<EmptyState icon={<Brain size={32} strokeWidth={1.25} />} title="No knowledge assets" description="Upload documents and knowledge for AI agents." />}
          />
        )}

        {activeTab === "MCP Servers" && (
          <DataTable
            columns={mcpColumns}
            data={mockMCP.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(m) => m.id}
            emptyState={<EmptyState icon={<Server size={32} strokeWidth={1.25} />} title="No MCP servers" description="Connect Model Context Protocol servers for tool use." />}
          />
        )}
      </div>
    </div>
  );
}
