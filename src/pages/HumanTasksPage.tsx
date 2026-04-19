import { useState } from "react";
import {
  ClipboardList, Search, AlertCircle, CheckCircle2, XCircle, Clock,
  User, ArrowRight, MessageSquare, ChevronDown, ChevronRight, FileText,
  AlertTriangle,
} from "lucide-react";
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

      {/* Full task review panel */}
      {reviewingId && (() => {
        const task = mockTasks.find(t => t.id === reviewingId);
        if (!task) return null;
        return <TaskReviewPanel task={task} onClose={() => setReviewingId(null)} />;
      })()}
    </div>
  );
}

/* ── Task Review Panel ── */
function TaskReviewPanel({ task, onClose }: { task: HumanTask; onClose: () => void }) {
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [showContext, setShowContext] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>({
    amount: "$4,250.00",
    vendor: "Acme Corp",
    category: "Software",
    notes: "",
  });

  const isCompleted = task.statusLabel === "completed";

  // Simulated execution context
  const executionContext = {
    executionId: "exec-" + task.id.slice(2),
    triggeredBy: "Scheduled (every 30 min)",
    startedAt: "2024-01-15 14:32:00 UTC",
    previousNodeOutput: {
      total_amount: 4250.0,
      vendor_name: "Acme Corp",
      invoice_number: "INV-2024-0847",
      risk_score: 0.72,
    },
  };

  const handleSubmit = (action: "approve" | "reject") => {
    setDecision(action);
  };

  return (
    <div className="mt-4 rounded-lg border border-zinc-100 bg-white shadow-xs overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            task.taskType === "approval" ? "bg-blue-50" : task.taskType === "form" ? "bg-purple-50" : "bg-green-50"
          )}>
            {task.taskType === "approval" ? <CheckCircle2 size={14} className="text-blue-600" /> :
             task.taskType === "form" ? <FileText size={14} className="text-purple-600" /> :
             <AlertCircle size={14} className="text-green-600" />}
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-zinc-800">{task.nodeName}</h4>
            <p className="text-[11px] text-zinc-400">{task.workflowName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.isOverdue && (
            <Badge variant="default" className="bg-red-50 text-red-600">
              <AlertTriangle size={10} /> Overdue
            </Badge>
          )}
          {task.expires && !task.isOverdue && (
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock size={10} /> Expires in {task.expires}
            </span>
          )}
          <button onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 transition-colors">
            <XCircle size={14} />
          </button>
        </div>
      </div>

      {decision ? (
        /* ── Decision confirmation ── */
        <div className="p-8 text-center">
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-3",
            decision === "approve" ? "bg-green-50" : "bg-red-50"
          )}>
            {decision === "approve" ? <CheckCircle2 size={28} className="text-green-600" /> : <XCircle size={28} className="text-red-500" />}
          </div>
          <h4 className="text-[14px] font-semibold text-zinc-900">
            Task {decision === "approve" ? "Approved" : "Rejected"}
          </h4>
          <p className="text-[12px] text-zinc-500 mt-1">
            {task.workflowName} will {decision === "approve" ? "continue execution" : "follow the rejection path"}
          </p>
          {comment && <p className="text-[11px] text-zinc-400 mt-2 italic">"{comment}"</p>}
        </div>
      ) : (
        <div className="grid grid-cols-5 divide-x divide-zinc-100">
          {/* Left column: Execution context */}
          <div className="col-span-2 p-4 space-y-3">
            <button
              onClick={() => setShowContext(o => !o)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500"
            >
              {showContext ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              Execution Context
            </button>
            {showContext && (
              <div className="space-y-2">
                <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">Execution</span>
                    <span className="text-zinc-600 font-mono">{executionContext.executionId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">Trigger</span>
                    <span className="text-zinc-600">{executionContext.triggeredBy}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">Started</span>
                    <span className="text-zinc-600">{executionContext.startedAt}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-medium text-zinc-400 mb-1">Previous Node Output</p>
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 font-mono text-[10px] text-zinc-600 space-y-1">
                    {Object.entries(executionContext.previousNodeOutput).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-zinc-400">{key}</span>
                        <span className={typeof val === "number" && val > 0.5 ? "text-amber-600 font-medium" : ""}>
                          {typeof val === "number" ? val.toLocaleString() : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <User size={10} />
                  <span>Assigned to: <strong className="text-zinc-600">{task.assignedTo ?? "Unassigned"}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Review form */}
          <div className="col-span-3 p-4 space-y-3">
            {task.taskType === "form" && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-zinc-500">Required Fields</p>
                {Object.entries(formValues).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-[10px] font-medium text-zinc-400 mb-0.5 block capitalize">{key}</label>
                    <input
                      type="text"
                      value={val}
                      onChange={e => setFormValues(prev => ({ ...prev, [key]: e.target.value }))}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-2 text-[11px] text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                    />
                  </div>
                ))}
              </div>
            )}

            {task.taskType === "approval" && (
              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                <p className="text-[11px] font-medium text-amber-700">Approval Required</p>
                <p className="text-[10px] text-amber-600 mt-0.5">
                  Review the execution context and decide whether to approve or reject this workflow step.
                </p>
              </div>
            )}

            {task.taskType === "confirmation" && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                <p className="text-[11px] font-medium text-blue-700">Confirmation Needed</p>
                <p className="text-[10px] text-blue-600 mt-0.5">
                  Confirm that the data mapping is correct before proceeding.
                </p>
              </div>
            )}

            {/* Comment */}
            <div>
              <label className="text-[10px] font-medium text-zinc-400 mb-0.5 block flex items-center gap-1">
                <MessageSquare size={9} /> Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a note for the audit log…"
                className="h-16 w-full resize-none rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
              />
            </div>

            {/* Action buttons */}
            {!isCompleted && (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSubmit("approve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 size={12} /> Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSubmit("reject")}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle size={12} /> Reject
                </Button>
                <div className="flex-1" />
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Skip
                </Button>
              </div>
            )}
          </div>
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
