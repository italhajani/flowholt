import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, GitBranch, Play, Pause, Trash2, Tag, Clock, User, Pencil,
  Folder, FolderOpen, ChevronRight, MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateWorkflowModal } from "@/components/modals/CreateWorkflowModal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

/* ── Mock data ── */
interface Workflow {
  id: string;
  name: string;
  status: "active" | "draft" | "paused" | "failed";
  tags: string[];
  lastRun: string;
  created: string;
  owner: string;
  folder: string;
}

const mockWorkflows: Workflow[] = [
  { id: "wf-1", name: "Lead Qualification Pipeline", status: "active", tags: ["Sales", "AI"], lastRun: "2 min ago", created: "Jan 12", owner: "You", folder: "Sales Automation" },
  { id: "wf-2", name: "Slack → Sheets Logger", status: "active", tags: ["Internal"], lastRun: "15 min ago", created: "Jan 8", owner: "You", folder: "Internal Tools" },
  { id: "wf-3", name: "Daily Report Generator", status: "paused", tags: ["Reporting"], lastRun: "2 days ago", created: "Dec 20", owner: "Team", folder: "Reporting" },
  { id: "wf-4", name: "Customer Onboarding Flow", status: "draft", tags: ["CRM"], lastRun: "—", created: "Feb 3", owner: "You", folder: "Sales Automation" },
  { id: "wf-5", name: "Error Alert Handler", status: "failed", tags: ["Ops"], lastRun: "1 hr ago", created: "Nov 15", owner: "Team", folder: "Operations" },
  { id: "wf-6", name: "Invoice Processing Pipeline", status: "active", tags: ["Finance", "AI"], lastRun: "5 min ago", created: "Feb 1", owner: "You", folder: "Finance" },
  { id: "wf-7", name: "PR Review Notifier", status: "active", tags: ["DevOps"], lastRun: "30 min ago", created: "Jan 22", owner: "Team", folder: "DevOps" },
];

/* ── Folders ── */
const folders = [
  { id: "all",              label: "All Workflows", count: mockWorkflows.length },
  { id: "Sales Automation", label: "Sales Automation", count: mockWorkflows.filter((w) => w.folder === "Sales Automation").length },
  { id: "Internal Tools",   label: "Internal Tools", count: mockWorkflows.filter((w) => w.folder === "Internal Tools").length },
  { id: "Reporting",        label: "Reporting", count: mockWorkflows.filter((w) => w.folder === "Reporting").length },
  { id: "Operations",       label: "Operations", count: mockWorkflows.filter((w) => w.folder === "Operations").length },
  { id: "Finance",          label: "Finance", count: mockWorkflows.filter((w) => w.folder === "Finance").length },
  { id: "DevOps",           label: "DevOps", count: mockWorkflows.filter((w) => w.folder === "DevOps").length },
];

const columns: Column<Workflow>[] = [
  {
    id: "name",
    header: "Name",
    sortable: true,
    accessor: (row) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <GitBranch size={14} strokeWidth={1.75} className="text-zinc-400 flex-shrink-0" />
        <span className="font-medium text-zinc-800 truncate">{row.name}</span>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    sortable: true,
    accessor: (row) => <StatusDot status={row.status} />,
  },
  {
    id: "tags",
    header: "Tags",
    hideBelow: "md",
    accessor: (row) => (
      <div className="flex items-center gap-1">
        {row.tags.map((t) => (
          <Badge key={t} variant="neutral">{t}</Badge>
        ))}
      </div>
    ),
  },
  {
    id: "lastRun",
    header: "Last Run",
    sortable: true,
    hideBelow: "md",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <Clock size={11} className="text-zinc-300" />
        {row.lastRun}
      </span>
    ),
  },
  {
    id: "created",
    header: "Created",
    hideBelow: "lg",
    accessor: (row) => <span className="text-zinc-500">{row.created}</span>,
  },
  {
    id: "owner",
    header: "Owner",
    hideBelow: "lg",
    accessor: (row) => (
      <span className="flex items-center gap-1 text-zinc-500">
        <User size={11} className="text-zinc-300" />
        {row.owner}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    accessor: (row) => (
      <span className="flex justify-end">
        <button
          title="Open in Studio"
          onClick={(e) => {
            e.stopPropagation();
            window.location.hash = `/studio/${row.id}`;
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        >
          <Pencil size={13} />
        </button>
      </span>
    ),
  },
];

const filters = ["All", "Active", "Draft", "Paused", "Failed"] as const;
type Filter = (typeof filters)[number];

export function WorkflowsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = mockWorkflows.filter((w) => {
    if (activeFolder !== "all" && w.folder !== activeFolder) return false;
    if (activeFilter !== "All" && w.status !== activeFilter.toLowerCase()) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full">
      {/* ── Folder sidebar ── */}
      <aside className="w-52 flex-shrink-0 border-r border-zinc-100 bg-zinc-50/50 px-3 py-6">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Folders
        </p>
        <div className="space-y-0.5">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-all duration-100",
                activeFolder === f.id
                  ? "bg-white text-zinc-900 shadow-xs border border-zinc-200"
                  : "text-zinc-500 hover:bg-white/70 hover:text-zinc-800"
              )}
            >
              <span className="flex items-center gap-1.5">
                {activeFolder === f.id
                  ? <FolderOpen size={13} className="text-zinc-400" />
                  : <Folder size={13} className="text-zinc-300" />
                }
                {f.label}
              </span>
              <span className={cn(
                "text-[11px] tabular-nums",
                activeFolder === f.id ? "text-zinc-600" : "text-zinc-300"
              )}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* New folder button */}
        <button className="mt-4 flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
          <Plus size={12} />
          New Folder
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 px-8 py-8">
        <PageHeader
          title="Workflows"
          description="Automate processes across your systems."
          actions={
            <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
              <Plus size={14} strokeWidth={2.5} />
              New Workflow
            </Button>
          }
        />

        {/* Summary strip */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          <MiniStat label="Total" value={mockWorkflows.length.toString()} />
          <MiniStat label="Active" value={mockWorkflows.filter((w) => w.status === "active").length.toString()} color="green" />
          <MiniStat label="Paused" value={mockWorkflows.filter((w) => w.status === "paused").length.toString()} color="amber" />
          <MiniStat label="Failed" value={mockWorkflows.filter((w) => w.status === "failed").length.toString()} color="red" />
        </div>

        {/* Filter bar */}
        <div className="mt-5 flex items-center gap-3">
          <Input
            prefix={<Search size={13} />}
            placeholder="Search workflows…"
            className="w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-1 ml-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[12px] font-medium transition-all duration-150",
                  activeFilter === f
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="ml-auto text-[12px] text-zinc-400">
            {filtered.length} workflow{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Data table */}
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(w) => w.id}
            selectable
            onRowClick={(w) => navigate(`/workflows/${w.id}`)}
            bulkActions={(ids) => (
              <>
                <Button variant="ghost" size="sm">
                  <Play size={12} /> Activate
                </Button>
                <Button variant="ghost" size="sm">
                  <Pause size={12} /> Pause
                </Button>
                <Button variant="ghost" size="sm">
                  <Tag size={12} /> Tag
                </Button>
                <Button variant="danger" size="sm">
                  <Trash2 size={12} /> Delete
                </Button>
              </>
            )}
            emptyState={
              <EmptyState
                icon={<GitBranch size={32} strokeWidth={1.25} />}
                title="No workflows match"
                description={search ? "Try a different search term." : "Create your first workflow to get started."}
                action={
                  !search ? (
                    <Button variant="secondary" size="sm">
                      <Plus size={13} />
                      Create Workflow
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        </div>

        <CreateWorkflowModal open={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: "green" | "amber" | "red" }) {
  const textColor = color === "green" ? "text-green-600" : color === "amber" ? "text-amber-600" : color === "red" ? "text-red-600" : "text-zinc-800";
  return (
    <div className="rounded-lg border border-zinc-100 bg-white px-4 py-2.5 shadow-xs">
      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className={cn("text-[18px] font-semibold leading-tight", textColor)}>{value}</p>
    </div>
  );
}
