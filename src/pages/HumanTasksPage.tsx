import { useState } from "react";
import { ClipboardList, Search, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const tabsList = ["All", "My Tasks", "Overdue"] as const;
type Tab = (typeof tabsList)[number];

/* ── Mock data ── */
interface HumanTask {
  id: string;
  workflowName: string;
  nodeName: string;
  taskType: "approval" | "form" | "confirmation";
  assignedTo: string | null;
  isMe: boolean;
  created: string;
  expires: string | null;
  isOverdue: boolean;
  status: "active" | "success" | "disabled";
  statusLabel: string;
  priority: "high" | "medium" | "low";
}

const mockTasks: HumanTask[] = [
  { id: "ht1", workflowName: "Lead Qualification Pipeline", nodeName: "Manual Review", taskType: "approval", assignedTo: "Gouhar Ali", isMe: false, created: "2h ago", expires: "4h", isOverdue: false, status: "active", statusLabel: "open", priority: "high" },
  { id: "ht2", workflowName: "Customer Onboarding", nodeName: "Verify Documents", taskType: "form", assignedTo: "Me", isMe: true, created: "45m ago", expires: "2h", isOverdue: false, status: "active", statusLabel: "open", priority: "medium" },
  { id: "ht3", workflowName: "Expense Approval Flow", nodeName: "Manager Approve", taskType: "approval", assignedTo: null, isMe: false, created: "6h ago", expires: "1h ago", isOverdue: true, status: "active", statusLabel: "open", priority: "high" },
  { id: "ht4", workflowName: "Data Migration", nodeName: "Confirm Mapping", taskType: "confirmation", assignedTo: "Sarah K.", isMe: false, created: "1d ago", expires: null, isOverdue: false, status: "success", statusLabel: "completed", priority: "medium" },
  { id: "ht5", workflowName: "Contract Renewal", nodeName: "Legal Review", taskType: "form", assignedTo: "Me", isMe: true, created: "3h ago", expires: "8h", isOverdue: false, status: "active", statusLabel: "open", priority: "low" },
];

const priorityColors: Record<HumanTask["priority"], string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-zinc-300",
};

const taskTypeBadge: Record<HumanTask["taskType"], { label: string; variant: "info" | "default" | "success" }> = {
  approval: { label: "Approval", variant: "info" },
  form: { label: "Form", variant: "default" },
  confirmation: { label: "Confirmation", variant: "success" },
};

const taskColumns: Column<HumanTask>[] = [
  {
    id: "priority", header: "", className: "w-6",
    accessor: (row) => (
      <span className={cn("inline-block h-[7px] w-[7px] rounded-full", priorityColors[row.priority])} title={row.priority} />
    ),
  },
  {
    id: "workflow", header: "Workflow", sortable: true,
    accessor: (row) => (
      <div>
        <p className="font-medium text-zinc-800 text-[13px]">{row.workflowName}</p>
        <p className="text-[11px] text-zinc-400">{row.nodeName}</p>
      </div>
    ),
  },
  {
    id: "taskType", header: "Type",
    accessor: (row) => {
      const cfg = taskTypeBadge[row.taskType];
      return <Badge variant={cfg.variant} className={row.taskType === "form" ? "bg-purple-50 text-purple-700" : undefined}>{cfg.label}</Badge>;
    },
  },
  {
    id: "assignedTo", header: "Assigned To",
    accessor: (row) => row.assignedTo ? (
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-medium text-zinc-600">
          {row.assignedTo.charAt(0)}
        </span>
        <span className={cn("text-[12px]", row.isMe ? "font-medium text-blue-600" : "text-zinc-600")}>{row.assignedTo}</span>
      </div>
    ) : (
      <span className="text-[12px] italic text-zinc-400">Unassigned</span>
    ),
  },
  { id: "created", header: "Created", sortable: true, hideBelow: "md", accessor: (row) => <span className="text-zinc-400 text-[12px]">{row.created}</span> },
  {
    id: "expires", header: "Expires", hideBelow: "md",
    accessor: (row) => {
      if (!row.expires) return <span className="text-zinc-300 text-[12px]">—</span>;
      return <span className={cn("text-[12px]", row.isOverdue ? "text-red-600 font-medium" : "text-zinc-400")}>{row.expires}{row.isOverdue ? " (overdue)" : ""}</span>;
    },
  },
  {
    id: "status", header: "Status",
    accessor: (row) => <StatusDot status={row.status} label={row.statusLabel} />,
  },
  {
    id: "actions", header: "", className: "w-20",
    accessor: (row) => row.statusLabel === "open" ? <Button variant="primary" size="sm" className="text-[11px]">Review</Button> : null,
  },
];

export function HumanTasksPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const filtered = mockTasks.filter((t) => {
    if (search && !t.workflowName.toLowerCase().includes(search.toLowerCase()) && !t.nodeName.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab === "My Tasks") return t.isMe && t.statusLabel === "open";
    if (activeTab === "Overdue") return t.isOverdue;
    return true;
  });

  const openCount = mockTasks.filter((t) => t.statusLabel === "open").length;
  const myCount = mockTasks.filter((t) => t.isMe && t.statusLabel === "open").length;
  const overdueCount = mockTasks.filter((t) => t.isOverdue).length;

  return (
    <div className="mx-auto max-w-[960px] px-8 py-8">
      <PageHeader
        title="Human Tasks"
        description="Paused executions awaiting human input."
        actions={
          <Button variant="secondary" size="md">
            <ClipboardList size={14} strokeWidth={2.5} />
            Export
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        <SummaryCard label="Open Tasks" value={openCount.toString()} color="text-zinc-800" />
        <SummaryCard label="Awaiting Me" value={myCount.toString()} color="text-blue-600" />
        <SummaryCard label="Overdue" value={overdueCount.toString()} color="text-red-600" />
        <SummaryCard label="Avg Resolution" value="14 min" color="text-zinc-500" />
      </div>

      {/* Tabs + search */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-0" style={{ borderBottom: "1px solid var(--color-border-default)" }}>
          {tabsList.map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setSearch(""); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-px",
                activeTab === t ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <Input prefix={<Search size={13} />} placeholder="Search…" className="w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="mt-4">
        <DataTable
          columns={taskColumns}
          data={filtered}
          getRowId={(t) => t.id}
          onRowClick={(row) => setReviewingId(reviewingId === row.id ? null : row.id)}
          emptyState={<EmptyState icon={<ClipboardList size={32} strokeWidth={1.25} />} title="No tasks" description="No human tasks match your current filter." />}
        />
      </div>

      {/* Review placeholder panel */}
      {reviewingId && (
        <div className="mt-4 rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-zinc-400" />
            <p className="text-[13px] font-medium text-zinc-700">Task Review</p>
          </div>
          <p className="text-[12px] text-zinc-400">Task review form will appear here with execution context and input fields.</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-md border border-zinc-100 bg-white px-4 py-3 shadow-xs">
      <p className="text-[11px] font-medium text-zinc-400 mb-1">{label}</p>
      <p className={cn("text-[18px] font-semibold", color)}>{value}</p>
    </div>
  );
}
