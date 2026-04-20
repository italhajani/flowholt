import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  KeyRound, Plus, Search, Link2, Variable, ShieldCheck, Shield,
  Clock, AlertTriangle, User, Cpu, ChevronRight, ChevronDown,
  CheckCircle2, Globe, MoreHorizontal, RefreshCw, Zap, Eye, EyeOff,
  ArrowRight, Lock, Unlock, Activity, Download, Upload,
} from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { CreateCredentialModal } from "@/components/modals/CreateCredentialModal";
import { CreateVariableModal } from "@/components/modals/CreateVariableModal";
import { cn } from "@/lib/utils";
import { useExportVault, useImportVault, useVaultCredentials, useVaultConnections, useVaultVariables, useDeleteVaultAsset } from "@/hooks/useApi";

const vaultTabs = [
  { id: "credentials",      label: "Credentials",      icon: KeyRound },
  { id: "connections",       label: "Connections",       icon: Link2 },
  { id: "variables",         label: "Variables",         icon: Variable },
  { id: "external-secrets",  label: "External Secrets",  icon: ShieldCheck },
  { id: "mcp-servers",       label: "MCP Servers",       icon: Cpu },
] as const;
type VaultTab = (typeof vaultTabs)[number]["id"];

/* ── Credential mock data ── */
interface Credential {
  id: string;
  name: string;
  provider: string;
  type: string;
  scope: "Workspace" | "Team" | "User";
  status: "healthy" | "expiring" | "error";
  lastUsed: string;
  linkedConnections: number;
  expiresIn: string | null;
}

const mockCredentials: Credential[] = [
  { id: "c1", name: "OpenAI Production Key", provider: "OpenAI", type: "API Key", scope: "Workspace", status: "healthy", lastUsed: "5 min ago", linkedConnections: 3, expiresIn: null },
  { id: "c2", name: "GitHub OAuth Token", provider: "GitHub", type: "OAuth 2.0", scope: "User", status: "healthy", lastUsed: "1 hr ago", linkedConnections: 2, expiresIn: "45 days" },
  { id: "c3", name: "Slack Bot Token", provider: "Slack", type: "Bot Token", scope: "Team", status: "expiring", lastUsed: "3 days ago", linkedConnections: 1, expiresIn: "3 days" },
  { id: "c4", name: "AWS Access Keys", provider: "AWS", type: "Access Key", scope: "Workspace", status: "healthy", lastUsed: "20 min ago", linkedConnections: 4, expiresIn: null },
  { id: "c5", name: "Salesforce OAuth (Staging)", provider: "Salesforce", type: "OAuth 2.0", scope: "Team", status: "error", lastUsed: "2 weeks ago", linkedConnections: 0, expiresIn: "Expired" },
  { id: "c6", name: "Anthropic API Key", provider: "Anthropic", type: "API Key", scope: "Workspace", status: "healthy", lastUsed: "10 min ago", linkedConnections: 2, expiresIn: null },
  { id: "c7", name: "Google Cloud Service Account", provider: "Google", type: "Service Account", scope: "Workspace", status: "healthy", lastUsed: "2 hrs ago", linkedConnections: 1, expiresIn: "90 days" },
];

/* ── Connection mock data ── */
interface Connection {
  id: string;
  name: string;
  provider: string;
  health: "healthy" | "warning" | "error";
  lastVerified: string;
  usedBy: number;
}

const mockConnections: Connection[] = [
  { id: "cn1", name: "Slack — FlowHolt Workspace", provider: "Slack", health: "healthy", lastVerified: "2 min ago", usedBy: 5 },
  { id: "cn2", name: "GitHub — flowholt org", provider: "GitHub", health: "healthy", lastVerified: "1 hr ago", usedBy: 3 },
  { id: "cn3", name: "Notion — Product Wiki", provider: "Notion", health: "warning", lastVerified: "3 days ago", usedBy: 1 },
  { id: "cn4", name: "PostgreSQL — Production", provider: "PostgreSQL", health: "healthy", lastVerified: "5 min ago", usedBy: 8 },
  { id: "cn5", name: "Stripe — Live Mode", provider: "Stripe", health: "healthy", lastVerified: "30 min ago", usedBy: 4 },
];

/* ── Variable mock data ── */
interface VaultVariable {
  id: string;
  key: string;
  scope: "Workspace" | "Team" | "User";
  type: "Plain" | "Secret";
  usedBy: number;
  updated: string;
}

const mockVariables: VaultVariable[] = [
  { id: "v1", key: "BASE_URL", scope: "Workspace", type: "Plain", usedBy: 12, updated: "Jan 15" },
  { id: "v2", key: "DEFAULT_MODEL", scope: "Workspace", type: "Plain", usedBy: 6, updated: "Feb 1" },
  { id: "v3", key: "WEBHOOK_SECRET", scope: "Team", type: "Secret", usedBy: 3, updated: "Jan 20" },
  { id: "v4", key: "RETRY_MAX_ATTEMPTS", scope: "Workspace", type: "Plain", usedBy: 8, updated: "Mar 2" },
  { id: "v5", key: "ENCRYPTION_KEY", scope: "Workspace", type: "Secret", usedBy: 2, updated: "Dec 10" },
  { id: "v6", key: "SUPPORT_EMAIL", scope: "Team", type: "Plain", usedBy: 4, updated: "Feb 28" },
];

/* ── MCP server mock data ── */
interface McpServer {
  id: string;
  name: string;
  url: string;
  transport: "stdio" | "sse" | "streamable-http";
  status: "healthy" | "error" | "disabled";
  tools: number;
  resources: number;
  usedBy: number;
  lastPing: string;
}

const mockMcpServers: McpServer[] = [
  { id: "mcp1", name: "Filesystem Tools", url: "stdio://npx @modelcontextprotocol/server-filesystem", transport: "stdio", status: "healthy", tools: 8, resources: 0, usedBy: 3, lastPing: "2 min ago" },
  { id: "mcp2", name: "GitHub MCP", url: "sse://mcp.github.internal:3000/sse", transport: "sse", status: "healthy", tools: 24, resources: 6, usedBy: 5, lastPing: "Just now" },
  { id: "mcp3", name: "Postgres Query Server", url: "stdio://npx @flowholt/mcp-postgres", transport: "stdio", status: "healthy", tools: 4, resources: 2, usedBy: 2, lastPing: "5 min ago" },
  { id: "mcp4", name: "Web Scraper MCP", url: "sse://scraper.internal:4000/sse", transport: "sse", status: "error", tools: 3, resources: 0, usedBy: 0, lastPing: "Unreachable" },
];

/* ── Column definitions ── */
const credentialColumns: Column<Credential>[] = [
  {
    id: "name",
    header: "Name",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <KeyRound size={13} className="text-zinc-400" />
        <span className="font-medium text-zinc-800">{row.name}</span>
      </div>
    ),
  },
  { id: "provider", header: "Provider", sortable: true, accessor: (row) => <span className="text-zinc-600">{row.provider}</span> },
  { id: "type", header: "Type", hideBelow: "md", accessor: (row) => <Badge variant="neutral">{row.type}</Badge> },
  { id: "scope", header: "Scope", hideBelow: "md", accessor: (row) => <Badge variant="neutral">{row.scope}</Badge> },
  { id: "status", header: "Status", accessor: (row) => <StatusDot status={row.status} /> },
  { id: "lastUsed", header: "Last Used", sortable: true, hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.lastUsed}</span> },
  {
    id: "expires", header: "Expires", hideBelow: "lg",
    accessor: (row) => {
      if (!row.expiresIn) return <span className="text-zinc-300">—</span>;
      if (row.expiresIn === "Expired") return <span className="text-red-500 text-[11px] font-medium">Expired</span>;
      const days = parseInt(row.expiresIn);
      return (
        <span className={cn("text-[11px] font-medium", days <= 7 ? "text-red-500" : days <= 30 ? "text-amber-500" : "text-zinc-400")}>
          {row.expiresIn}
        </span>
      );
    },
  },
  { id: "connections", header: "Links", hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.linkedConnections}</span> },
];

const connectionColumns: Column<Connection>[] = [
  {
    id: "name",
    header: "Name",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <Link2 size={13} className="text-zinc-400" />
        <span className="font-medium text-zinc-800">{row.name}</span>
      </div>
    ),
  },
  { id: "provider", header: "Provider", sortable: true, accessor: (row) => <span className="text-zinc-600">{row.provider}</span> },
  { id: "health", header: "Health", accessor: (row) => <StatusDot status={row.health} /> },
  { id: "lastVerified", header: "Last Verified", sortable: true, hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.lastVerified}</span> },
  { id: "usedBy", header: "Used By", hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.usedBy} workflow{row.usedBy !== 1 ? "s" : ""}</span> },
  {
    id: "verify", header: "", className: "w-16",
    accessor: () => (
      <Button variant="ghost" size="sm" className="text-[11px] text-zinc-400 hover:text-zinc-600">
        <RefreshCw size={10} /> Test
      </Button>
    ),
  },
];

const variableColumns: Column<VaultVariable>[] = [
  {
    id: "key",
    header: "Key",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <Variable size={13} className="text-zinc-400" />
        <code className="font-mono text-[12px] font-medium text-zinc-800 bg-zinc-50 px-1.5 py-0.5 rounded">{row.key}</code>
      </div>
    ),
  },
  { id: "scope", header: "Scope", accessor: (row) => <Badge variant="neutral">{row.scope}</Badge> },
  {
    id: "type",
    header: "Type",
    accessor: (row) =>
      row.type === "Secret" ? (
        <Badge variant="warning"><Shield size={10} /> Secret</Badge>
      ) : (
        <Badge variant="neutral">Plain</Badge>
      ),
  },
  { id: "usedBy", header: "Used By", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.usedBy} ref{row.usedBy !== 1 ? "s" : ""}</span> },
  { id: "updated", header: "Updated", hideBelow: "lg", accessor: (row) => <span className="text-zinc-500">{row.updated}</span> },
];

const mcpColumns: Column<McpServer>[] = [
  {
    id: "name",
    header: "Server",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white flex-shrink-0">
          <Cpu size={12} />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-zinc-800 text-[13px]">{row.name}</p>
          <code className="text-[10px] text-zinc-400 font-mono truncate block max-w-[260px]">{row.url}</code>
        </div>
      </div>
    ),
  },
  {
    id: "transport",
    header: "Transport",
    accessor: (row) => (
      <Badge variant="neutral" className="font-mono text-[10px]">{row.transport}</Badge>
    ),
  },
  { id: "status", header: "Status", accessor: (row) => <StatusDot status={row.status} /> },
  {
    id: "tools",
    header: "Tools",
    hideBelow: "md",
    accessor: (row) => <span className="text-zinc-500 text-[12px]">{row.tools} tools</span>,
  },
  {
    id: "usedBy",
    header: "Used By",
    hideBelow: "lg",
    accessor: (row) => <span className="text-zinc-500 text-[12px]">{row.usedBy} agent{row.usedBy !== 1 ? "s" : ""}</span>,
  },
  {
    id: "lastPing",
    header: "Last Ping",
    hideBelow: "lg",
    accessor: (row) => (
      <span className={cn("text-[12px]", row.status === "error" ? "text-red-500" : "text-zinc-400")}>
        {row.lastPing}
      </span>
    ),
  },
];

const emptyMessages: Record<VaultTab, { title: string; desc: string }> = {
  credentials:      { title: "No credentials stored", desc: "Add API keys, OAuth tokens, and service accounts." },
  connections:      { title: "No connections yet", desc: "Connect external services like databases, APIs, and SaaS tools." },
  variables:        { title: "No variables defined", desc: "Store reusable config values for your workflows." },
  "external-secrets": { title: "No external secrets", desc: "Link secrets from AWS, GCP, or HashiCorp Vault." },
  "mcp-servers":    { title: "No MCP servers configured", desc: "Connect Model Context Protocol servers to give AI agents access to tools and data." },
};

export function VaultPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<VaultTab>("credentials");
  const [search, setSearch] = useState("");
  const [showCredModal, setShowCredModal] = useState(false);
  const [showVarModal, setShowVarModal] = useState(false);
  const empty = emptyMessages[activeTab];
  const exportVaultMut = useExportVault();
  const importVaultMut = useImportVault();
  const deleteMut = useDeleteVaultAsset();

  // Real backend data (falls back to mock if backend unavailable)
  const { data: realCreds } = useVaultCredentials();
  const { data: realConns } = useVaultConnections();
  const { data: realVars } = useVaultVariables();

  const credentials: Credential[] = useMemo(() => {
    if (!realCreds?.length) return mockCredentials;
    return realCreds.map(c => ({
      id: c.id, name: c.name, provider: c.app, type: c.credential_type ?? "API Key",
      scope: (c.scope === "workspace" ? "Workspace" : c.scope === "team" ? "Team" : "User") as Credential["scope"],
      status: (c.status === "active" ? "healthy" : c.status) as Credential["status"],
      lastUsed: c.last_used_at ? new Date(c.last_used_at).toLocaleDateString() : "Never",
      linkedConnections: c.workflows_count, expiresIn: null,
    }));
  }, [realCreds]);

  const connections: Connection[] = useMemo(() => {
    if (!realConns?.length) return mockConnections;
    return realConns.map(c => ({
      id: c.id, name: c.name, app: c.app, type: c.credential_type ?? "API", host: "",
      health: (c.status === "active" ? "healthy" : c.status === "expiring" ? "warning" : "error") as Connection["health"],
      lastChecked: c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "—",
      workflowsUsing: c.workflows_count,
    }));
  }, [realConns]);

  const variables: VaultVariable[] = useMemo(() => {
    if (!realVars?.length) return mockVariables;
    return realVars.map(v => ({
      id: v.id, key: v.name, value: "••••••••", scope: v.scope === "workspace" ? "Workspace" : v.scope === "staging" ? "Staging" : "Production",
      lastModified: v.updated_at ? new Date(v.updated_at).toLocaleDateString() : "—", usedBy: v.workflows_count,
    }));
  }, [realVars]);

  const handleNewClick = () => {
    if (activeTab === "credentials") setShowCredModal(true);
    else if (activeTab === "variables") setShowVarModal(true);
  };

  const handleExport = () => {
    exportVaultMut.mutate(undefined, {
      onSuccess: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "vault-export.json"; a.click();
        URL.revokeObjectURL(url);
      },
    });
  };

  const handleImport = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      file.text().then((text) => {
        const parsed = JSON.parse(text);
        importVaultMut.mutate(parsed.assets || parsed);
      });
    };
    input.click();
  };

  const summaryStats = {
    total: credentials.length + connections.length + variables.length,
    healthy: credentials.filter((c) => c.status === "healthy").length + connections.filter((c) => c.health === "healthy").length,
    expiring: credentials.filter((c) => c.status === "expiring").length + connections.filter((c) => c.health === "warning").length,
    errors: credentials.filter((c) => c.status === "error").length + connections.filter((c) => c.health === "error").length,
    mcpServers: mockMcpServers.length,
  };

  const expiringCreds = credentials.filter((c) => c.expiresIn && (c.expiresIn === "Expired" || parseInt(c.expiresIn) <= 7));

  return (
    <div className="mx-auto max-w-[1020px] px-8 py-8">
      <PageHeader
        title="Vault"
        description="Credentials, connections, variables, and secrets."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[11px]" onClick={handleExport} disabled={exportVaultMut.isPending}>
              <Download size={12} /> Export
            </Button>
            <Button variant="ghost" size="sm" className="text-[11px]" onClick={handleImport} disabled={importVaultMut.isPending}>
              <Upload size={12} /> Import
            </Button>
            <Button variant="secondary" size="md">
              <RefreshCw size={13} /> Verify All
            </Button>
            <Button variant="primary" size="md" onClick={handleNewClick}>
              <Plus size={14} strokeWidth={2.5} />
              New {vaultTabs.find((t) => t.id === activeTab)?.label.slice(0, -1)}
            </Button>
          </div>
        }
      />

      {/* Expiry warning banner */}
      {expiringCreds.length > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-[12px] text-amber-700 flex-1">
            <span className="font-semibold">{expiringCreds.length} credential{expiringCreds.length > 1 ? "s" : ""}</span> need{expiringCreds.length === 1 ? "s" : ""} attention:{" "}
            {expiringCreds.map(c => c.name).join(", ")}
          </p>
          <Button variant="ghost" size="sm" className="text-[11px] text-amber-700">Review</Button>
        </div>
      )}

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-5 gap-3">
        <SumCard icon={<Shield size={14} />} label="Total Assets" value={summaryStats.total} />
        <SumCard icon={<Shield size={14} />} label="Healthy" value={summaryStats.healthy} color="green" />
        <SumCard icon={<AlertTriangle size={14} />} label="Expiring" value={summaryStats.expiring} color="amber" />
        <SumCard icon={<AlertTriangle size={14} />} label="Errors" value={summaryStats.errors} color="red" />
        <SumCard icon={<Cpu size={14} />} label="MCP Servers" value={summaryStats.mcpServers} />
      </div>

      {/* Tab strip */}
      <div className="mt-6 flex items-center justify-between">
        <div
          className="flex items-center gap-0"
          style={{ borderBottom: "1px solid var(--color-border-default)" }}
        >
          {vaultTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSearch(""); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-px",
                activeTab === t.id
                  ? "border-zinc-800 text-zinc-800"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
        <Input
          prefix={<Search size={13} />}
          placeholder="Search vault…"
          className="w-52"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "credentials" && (
          <DataTable
            columns={credentialColumns}
            data={credentials.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(c) => c.id}
            selectable
            onRowClick={(c) => navigate(`/vault/credentials/${c.id}`)}
            emptyState={
              <EmptyState icon={<KeyRound size={32} strokeWidth={1.25} />} title={empty.title} description={empty.desc}
                action={<Button variant="secondary" size="sm"><Plus size={13} />Add Credential</Button>}
              />
            }
          />
        )}
        {activeTab === "connections" && (
          <DataTable
            columns={connectionColumns}
            data={connections.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(c) => c.id}
            selectable
            onRowClick={(c) => navigate(`/vault/connections/${c.id}`)}
            emptyState={
              <EmptyState icon={<Link2 size={32} strokeWidth={1.25} />} title={empty.title} description={empty.desc}
                action={<Button variant="secondary" size="sm"><Plus size={13} />Add Connection</Button>}
              />
            }
          />
        )}
        {activeTab === "variables" && (
          <DataTable
            columns={variableColumns}
            data={variables.filter((v) => !search || v.key.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(v) => v.id}
            selectable
            onRowClick={(v) => console.log("Open variable:", v.id) /* TODO: variable detail page */}
            emptyState={
              <EmptyState icon={<Variable size={32} strokeWidth={1.25} />} title={empty.title} description={empty.desc}
                action={<Button variant="secondary" size="sm"><Plus size={13} />Add Variable</Button>}
              />
            }
          />
        )}
        {activeTab === "external-secrets" && (
          <EmptyState
            icon={<ShieldCheck size={32} strokeWidth={1.25} />}
            title={empty.title}
            description={empty.desc}
            action={<Button variant="secondary" size="sm"><Plus size={13} />Link External Secrets</Button>}
          />
        )}
        {activeTab === "mcp-servers" && (
          <DataTable
            columns={mcpColumns}
            data={mockMcpServers.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))}
            getRowId={(s) => s.id}
            selectable
            onRowClick={(s) => console.log("MCP server:", s.id)}
            emptyState={
              <EmptyState
                icon={<Cpu size={32} strokeWidth={1.25} />}
                title={empty.title}
                description={empty.desc}
                action={<Button variant="secondary" size="sm"><Plus size={13} />Add MCP Server</Button>}
              />
            }
          />
        )}
      </div>

      <CreateCredentialModal open={showCredModal} onClose={() => setShowCredModal(false)} />
      <CreateVariableModal open={showVarModal} onClose={() => setShowVarModal(false)} />
    </div>
  );
}

function SumCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color?: "green" | "amber" | "red" }) {
  const textColor = color === "green" ? "text-green-600" : color === "amber" ? "text-amber-600" : color === "red" ? "text-red-600" : "text-zinc-800";
  const iconColor = color === "green" ? "text-green-400" : color === "amber" ? "text-amber-400" : color === "red" ? "text-red-400" : "text-zinc-400";
  return (
    <div className="rounded-lg border border-zinc-100 bg-white px-4 py-2.5 shadow-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={iconColor}>{icon}</span>
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className={cn("text-[18px] font-semibold leading-tight", textColor)}>{value}</p>
    </div>
  );
}
