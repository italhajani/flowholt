import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { Search, Plus, Mail, MoreHorizontal, UserCircle } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer";
  status: "active" | "inactive";
  lastActive: string;
}

const mockMembers: Member[] = [
  { id: "m1", name: "Gouhar Ali", email: "gouhar@flowholt.com", role: "Owner", status: "active", lastActive: "Just now" },
  { id: "m2", name: "Sarah Chen", email: "sarah@flowholt.com", role: "Admin", status: "active", lastActive: "5 min ago" },
  { id: "m3", name: "Alex Kim", email: "alex@flowholt.com", role: "Editor", status: "active", lastActive: "2 hrs ago" },
  { id: "m4", name: "Jordan Patel", email: "jordan@flowholt.com", role: "Viewer", status: "inactive", lastActive: "3 days ago" },
];

const roleColors: Record<string, string> = {
  Owner: "bg-zinc-800 text-white",
  Admin: "bg-zinc-100 text-zinc-800",
  Editor: "bg-zinc-50 text-zinc-600",
  Viewer: "bg-zinc-50 text-zinc-500",
};

const columns: Column<Member>[] = [
  {
    id: "name",
    header: "Member",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-[10px] font-semibold text-zinc-600">
          {row.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="font-medium text-zinc-800 text-[13px] leading-tight">{row.name}</p>
          <p className="text-[11px] text-zinc-400">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    id: "role",
    header: "Role",
    accessor: (row) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${roleColors[row.role]}`}>
        {row.role}
      </span>
    ),
  },
  { id: "status", header: "Status", accessor: (row) => <StatusDot status={row.status} /> },
  { id: "lastActive", header: "Last Active", hideBelow: "md", accessor: (row) => <span className="text-zinc-500">{row.lastActive}</span> },
  {
    id: "actions",
    header: "",
    className: "w-10",
    accessor: () => (
      <button className="text-zinc-300 hover:text-zinc-600 transition-colors">
        <MoreHorizontal size={14} />
      </button>
    ),
  },
];

export function MembersSettings() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const filtered = mockMembers.filter(
    (m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Members</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Manage who has access to this workspace.</p>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <Input
            prefix={<Search size={13} />}
            placeholder="Search members…"
            className="w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="primary" size="sm" onClick={() => setShowInvite(!showInvite)}>
            <Mail size={12} />
            Invite
          </Button>
        </div>

        {showInvite && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 mb-4">
            <p className="text-[12px] font-medium text-zinc-700 mb-2">Invite a new member</p>
            <div className="flex items-center gap-2">
              <Input placeholder="Email address" className="flex-1" />
              <select className="rounded-md border border-zinc-200 bg-white px-2 py-2 text-[12px] text-zinc-700">
                <option>Viewer</option>
                <option>Editor</option>
                <option>Admin</option>
              </select>
              <Button variant="primary" size="sm">Send Invite</Button>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(m) => m.id}
          emptyState={
            <div className="py-12 text-center text-[13px] text-zinc-400">
              <UserCircle size={28} strokeWidth={1.25} className="mx-auto text-zinc-200 mb-2" />
              No members found.
            </div>
          }
        />
      </div>
    </div>
  );
}
