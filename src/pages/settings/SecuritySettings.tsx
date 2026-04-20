import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useAuditEvents } from "@/hooks/useApi";

/* ── IP Allowlist ── */
interface IpEntry {
  id: string;
  cidr: string;
  label: string;
  addedBy: string;
  date: string;
}

const mockIps: IpEntry[] = [
  { id: "ip1", cidr: "10.0.0.0/8", label: "Office network", addedBy: "Admin", date: "Jan 15" },
  { id: "ip2", cidr: "192.168.1.0/24", label: "VPN range", addedBy: "Admin", date: "Feb 3" },
  { id: "ip3", cidr: "203.0.113.42/32", label: "CI server", addedBy: "System", date: "Mar 1" },
];

const ipColumns: Column<IpEntry>[] = [
  { id: "cidr", header: "CIDR", sortable: true, accessor: (row) => <code className="text-[12px] font-mono text-zinc-700">{row.cidr}</code> },
  { id: "label", header: "Label", accessor: (row) => <span className="text-zinc-600">{row.label}</span> },
  { id: "addedBy", header: "Added By", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.addedBy}</span> },
  { id: "date", header: "Date", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.date}</span> },
  {
    id: "actions",
    header: "",
    className: "w-10",
    accessor: () => (
      <button className="text-zinc-300 hover:text-red-500 transition-colors">
        <Trash2 size={13} />
      </button>
    ),
  },
];

/* ── Audit Log ── */
interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

const mockAudit: AuditEvent[] = [
  { id: "a1", actor: "Sarah Chen", action: "Published workflow", target: "Lead Qualification", time: "2 hours ago" },
  { id: "a2", actor: "Alex Kim", action: "Rotated credential", target: "OpenAI Key", time: "5 hours ago" },
  { id: "a3", actor: "System", action: "Session expired", target: "admin@flowholt.com", time: "1 day ago" },
  { id: "a4", actor: "Sarah Chen", action: "Updated permissions", target: "Vault access", time: "2 days ago" },
  { id: "a5", actor: "Alex Kim", action: "Enabled 2FA", target: "Personal account", time: "3 days ago" },
];

const auditColumns: Column<AuditEvent>[] = [
  { id: "actor", header: "Actor", sortable: true, accessor: (row) => <span className="text-[13px] font-medium text-zinc-800">{row.actor}</span> },
  { id: "action", header: "Action", accessor: (row) => <span className="text-zinc-600">{row.action}</span> },
  { id: "target", header: "Target", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.target}</span> },
  { id: "time", header: "Time", accessor: (row) => <span className="text-zinc-400">{row.time}</span> },
];

/* ── Active Sessions ── */
interface Session {
  id: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

const mockSessions: Session[] = [
  { id: "sess1", browser: "Chrome on Windows", ip: "203.0.113.42", lastActive: "Active now", isCurrent: true },
  { id: "sess2", browser: "Safari on macOS", ip: "10.0.1.15", lastActive: "3 hours ago", isCurrent: false },
  { id: "sess3", browser: "Firefox on Linux", ip: "192.168.1.100", lastActive: "2 days ago", isCurrent: false },
];

export function SecuritySettings() {
  const [sessionTimeout, setSessionTimeout] = useState(24);
  const [newCidr, setNewCidr] = useState("");
  const { data: apiAudit } = useAuditEvents();

  const auditRows: AuditEvent[] = useMemo(() => {
    if (apiAudit && apiAudit.length > 0) {
      return apiAudit.slice(0, 10).map(e => {
        const ago = Math.round((Date.now() - new Date(e.created_at).getTime()) / 60000);
        const timeStr = ago < 1 ? "Just now" : ago < 60 ? `${ago} min ago` : ago < 1440 ? `${Math.round(ago / 60)} hrs ago` : `${Math.round(ago / 1440)} days ago`;
        return {
          id: e.id,
          actor: e.actor_email ?? "System",
          action: e.action.replace(/_/g, " "),
          target: e.target_type + (e.target_id ? ` ${e.target_id.slice(0, 8)}` : ""),
          time: timeStr,
        };
      });
    }
    return mockAudit;
  }, [apiAudit]);

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Security</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Two-factor, SSO, and access policies.</p>

      <div className="mt-6 space-y-6">
        {/* Section 1: Two-Factor Authentication */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Two-Factor Authentication</p>
          <div className="flex items-center gap-3 mb-4">
            <StatusDot status="active" label="2FA is enabled" />
            <Badge variant="default">TOTP</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">Regenerate backup codes</Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Disable 2FA</Button>
          </div>
        </div>

        {/* Section 2: Session Policy */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-[13px] font-semibold text-zinc-800">Session Policy</p>
            <Badge variant="outline">Inherited from organization</Badge>
          </div>
          <div className="space-y-5 max-w-md">
            <Field label="Session timeout" hint="hours of inactivity">
              <Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(Number(e.target.value))} className="w-24" />
            </Field>
          </div>
        </div>

        {/* Section 3: IP Allowlist */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">IP Allowlist</p>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="e.g. 10.0.0.0/8"
              value={newCidr}
              onChange={(e) => setNewCidr(e.target.value)}
              className="w-56"
            />
            <Button variant="secondary" size="sm">
              <Plus size={12} />
              Add
            </Button>
          </div>
          <DataTable
            columns={ipColumns}
            data={mockIps}
            getRowId={(ip) => ip.id}
            emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">No IP restrictions configured.</p>}
          />
        </div>

        {/* Section 4: Audit Log */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-1">Audit Log</p>
          <p className="text-[12px] text-zinc-400 mb-4">Recent security events for this workspace.</p>
          <DataTable
            columns={auditColumns}
            data={auditRows}
            getRowId={(e) => e.id}
            emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">No events recorded.</p>}
          />
          <div className="mt-3">
            <button className="text-[12px] font-medium text-zinc-600 hover:text-zinc-800 inline-flex items-center gap-1 transition-colors">
              View full audit log <ExternalLink size={11} />
            </button>
          </div>
        </div>

        {/* Section 5: Active Sessions */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Active Sessions</p>
          <div className="divide-y divide-zinc-100">
            {mockSessions.map((s) => (
              <div key={s.id} className="flex items-center py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className={cn("h-[6px] w-[6px] rounded-full flex-shrink-0", s.isCurrent ? "bg-green-500" : "bg-zinc-300")} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-zinc-800">{s.browser}</p>
                      {s.isCurrent && <Badge variant="default">This session</Badge>}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{s.ip} · {s.lastActive}</p>
                  </div>
                </div>
                {!s.isCurrent && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Sign out</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md">Save Changes</Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}
