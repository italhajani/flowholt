import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { Copy, Trash2, MoreHorizontal, Plus, MessageSquare, Mail, CreditCard, Github } from "lucide-react";

/* ── Connected Services ── */
interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  authType: string;
  status: "active" | "error";
  lastUsed: string;
  workflows: number;
}

const mockServices: Service[] = [
  { id: "s1", name: "Slack", icon: <MessageSquare size={14} />, authType: "OAuth 2.0", status: "active", lastUsed: "2 hours ago", workflows: 3 },
  { id: "s2", name: "Gmail", icon: <Mail size={14} />, authType: "OAuth 2.0", status: "error", lastUsed: "5 days ago", workflows: 1 },
  { id: "s3", name: "Stripe", icon: <CreditCard size={14} />, authType: "API Key", status: "active", lastUsed: "12 min ago", workflows: 2 },
  { id: "s4", name: "GitHub", icon: <Github size={14} />, authType: "OAuth 2.0", status: "active", lastUsed: "1 day ago", workflows: 4 },
];

const serviceColumns: Column<Service>[] = [
  {
    id: "name",
    header: "Service",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <span className="text-zinc-500">{row.icon}</span>
        <span className="text-[13px] font-medium text-zinc-800">{row.name}</span>
      </div>
    ),
  },
  {
    id: "authType",
    header: "Auth Type",
    accessor: (row) => <Badge variant="outline">{row.authType}</Badge>,
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => (
      <StatusDot status={row.status === "active" ? "active" : "error"} label={row.status === "active" ? "Ready" : "Expired"} />
    ),
  },
  {
    id: "lastUsed",
    header: "Last Used",
    hideBelow: "md",
    accessor: (row) => <span className="text-zinc-500">{row.lastUsed}</span>,
  },
  {
    id: "workflows",
    header: "Workflows",
    accessor: (row) => <span className="text-zinc-500">{row.workflows}</span>,
  },
  {
    id: "actions",
    header: "",
    className: "w-24",
    accessor: (row) =>
      row.status === "error" ? (
        <Button variant="secondary" size="sm">Reauthorize</Button>
      ) : (
        <button className="text-zinc-300 hover:text-zinc-600 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      ),
  },
];

/* ── API Credentials ── */
interface ApiCred {
  id: string;
  provider: string;
  label: string;
  maskedKey: string;
  created: string;
}

const mockCreds: ApiCred[] = [
  { id: "c1", provider: "OpenAI", label: "Production Key", maskedKey: "fh_sk_****…a4b2", created: "Mar 1" },
  { id: "c2", provider: "Anthropic", label: "Development Key", maskedKey: "fh_sk_****…c7d3", created: "Feb 15" },
];

export function IntegrationsSettings() {
  const [services] = useState(mockServices);
  const [creds] = useState(mockCreds);

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Integrations</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Connect workspace-level services and platforms.</p>

      <div className="mt-6 space-y-6">
        {/* Section 1: Connected Services */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Connected Services</p>
          <DataTable
            columns={serviceColumns}
            data={services}
            getRowId={(s) => s.id}
            emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">No services connected.</p>}
          />
        </div>

        {/* Section 2: OAuth Applications */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-3">OAuth Applications</p>
          <p className="text-[13px] text-zinc-400 mb-4">No custom OAuth applications configured.</p>
          <Button variant="secondary" size="sm">
            <Plus size={12} />
            Register OAuth App
          </Button>
        </div>

        {/* Section 3: API Credentials */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">API Credentials</p>
          <div className="divide-y divide-zinc-100">
            {creds.map((cred) => (
              <div key={cred.id} className="flex items-center py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-zinc-800">{cred.provider}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {cred.label} · Created {cred.created}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded">
                    {cred.maskedKey}
                  </code>
                  <button className="text-zinc-300 hover:text-zinc-500 transition-colors" title="Copy">
                    <Copy size={13} />
                  </button>
                  <button className="text-zinc-300 hover:text-red-500 transition-colors" title="Revoke">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
