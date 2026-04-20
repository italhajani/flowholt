import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, GitBranch, Play, Pause, Trash2, Tag, Clock, User, Pencil,
  Folder, FolderOpen, ChevronRight, MoreHorizontal, FolderPlus, X, Check,
  GripVertical, ChevronDown, Upload, Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateWorkflowModal } from "@/components/modals/CreateWorkflowModal";
import { ImportWorkflowModal } from "@/components/modals/ImportExportWorkflowModals";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";
import { useWorkflows } from "@/hooks/useApi";

/* ── Types ── */
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

/* ── Fallback mock data (shown when backend is offline) ── */
const fallbackWorkflows: Workflow[] = [
  { id: "wf-1", name: "Lead Qualification Pipeline", status: "active", tags: ["Sales", "AI"], lastRun: "2 min ago", created: "Jan 12", owner: "You", folder: "Sales Automation" },
  { id: "wf-2", name: "Slack → Sheets Logger", status: "active", tags: ["Internal"], lastRun: "15 min ago", created: "Jan 8", owner: "You", folder: "Internal Tools" },
  { id: "wf-3", name: "Daily Report Generator", status: "paused", tags: ["Reporting"], lastRun: "2 days ago", created: "Dec 20", owner: "Team", folder: "Reporting" },
  { id: "wf-4", name: "Customer Onboarding Flow", status: "draft", tags: ["CRM"], lastRun: "—", created: "Feb 3", owner: "You", folder: "Sales Automation" },
  { id: "wf-5", name: "Error Alert Handler", status: "active", tags: ["Ops"], lastRun: "1 hr ago", created: "Nov 15", owner: "Team", folder: "Operations" },
  { id: "wf-6", name: "Invoice Processing Pipeline", status: "active", tags: ["Finance", "AI"], lastRun: "5 min ago", created: "Feb 1", owner: "You", folder: "Finance" },
  { id: "wf-7", name: "PR Review Notifier", status: "active", tags: ["DevOps"], lastRun: "30 min ago", created: "Jan 22", owner: "Team", folder: "DevOps" },
];

function mapApiWorkflow(w: { id: string; name: string; status: string; trigger_type: string; category: string; created_at: string; last_run_at: string | null }): Workflow {
  const statusMap: Record<string, Workflow["status"]> = { active: "active", draft: "draft", paused: "paused" };
  const createdDate = new Date(w.created_at);
  const lastRunDate = w.last_run_at ? new Date(w.last_run_at) : null;
  const now = Date.now();
  const ago = lastRunDate ? Math.round((now - lastRunDate.getTime()) / 60000) : null;
  const lastRunStr = ago === null ? "—" : ago < 1 ? "Just now" : ago < 60 ? `${ago} min ago` : ago < 1440 ? `${Math.round(ago / 60)} hr ago` : `${Math.round(ago / 1440)} days ago`;

  return {
    id: w.id,
    name: w.name,
    status: statusMap[w.status] ?? "draft",
    tags: w.category ? [w.category] : [],
    lastRun: lastRunStr,
    created: createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    owner: "You",
    folder: w.category || "Uncategorized",
  };
}

/* ── Tag management ── */
interface TagDef {
  name: string;
  color: string;
}

const tagColors = [
  "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700", "bg-red-100 text-red-700",
  "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700", "bg-orange-100 text-orange-700",
];

const defaultTags: TagDef[] = [
  { name: "Sales", color: tagColors[0] },
  { name: "AI", color: tagColors[4] },
  { name: "Internal", color: tagColors[6] },
  { name: "Reporting", color: tagColors[2] },
  { name: "CRM", color: tagColors[1] },
  { name: "Ops", color: tagColors[3] },
  { name: "Finance", color: tagColors[7] },
  { name: "DevOps", color: tagColors[5] },
];

function TagBadge({ tag, tags }: { tag: string; tags: TagDef[] }) {
  const def = tags.find((t) => t.name === tag);
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", def?.color ?? "bg-zinc-100 text-zinc-600")}>
      {tag}
    </span>
  );
}

function TagFilterDropdown({
  allTags, activeTags, toggle, onCreateTag, workflows,
}: {
  allTags: TagDef[]; activeTags: Set<string>;
  toggle: (name: string) => void; onCreateTag: (name: string) => void;
  workflows: Workflow[];
}) {
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all",
          activeTags.size > 0 ? "bg-blue-50 text-blue-700" : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
        )}
      >
        <Tag size={11} />
        Tags{activeTags.size > 0 && ` (${activeTags.size})`}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg p-2">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1 mb-1">Filter by tag</p>
          <div className="max-h-40 overflow-y-auto space-y-0.5">
            {allTags.map((t) => (
              <button
                key={t.name}
                onClick={() => toggle(t.name)}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-[11px] hover:bg-zinc-50 transition-colors"
              >
                <span className={cn("h-3 w-3 rounded border-2 flex items-center justify-center", activeTags.has(t.name) ? "border-blue-500 bg-blue-500" : "border-zinc-300")}>
                  {activeTags.has(t.name) && <Check size={8} className="text-white" />}
                </span>
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", t.color)}>{t.name}</span>
                <span className="ml-auto text-[10px] text-zinc-300">
                  {workflows.filter((w) => w.tags.includes(t.name)).length}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 border-t border-zinc-100 pt-2">
            <div className="flex items-center gap-1 px-1">
              <input
                className="flex-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] outline-none focus:border-blue-400"
                placeholder="New tag…"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTag.trim()) { onCreateTag(newTag.trim()); setNewTag(""); }
                }}
              />
              <button
                onClick={() => { if (newTag.trim()) { onCreateTag(newTag.trim()); setNewTag(""); } }}
                className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-200"
              >
                Add
              </button>
            </div>
          </div>
          {activeTags.size > 0 && (
            <button
              onClick={() => { activeTags.forEach((t) => toggle(t)); }}
              className="mt-1 w-full text-center text-[10px] text-zinc-400 hover:text-zinc-600"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Folders (nested tree) ── */
interface FolderNode {
  id: string;
  label: string;
  children?: FolderNode[];
}

const folderTree: FolderNode[] = [
  {
    id: "Sales Automation",
    label: "Sales Automation",
    children: [
      { id: "Sales Automation/Leads", label: "Leads" },
      { id: "Sales Automation/Onboarding", label: "Onboarding" },
    ],
  },
  { id: "Internal Tools", label: "Internal Tools" },
  {
    id: "Reporting",
    label: "Reporting",
    children: [
      { id: "Reporting/Daily", label: "Daily" },
      { id: "Reporting/Weekly", label: "Weekly" },
    ],
  },
  { id: "Operations", label: "Operations" },
  { id: "Finance", label: "Finance" },
  { id: "DevOps", label: "DevOps" },
];

function countInFolder(folderId: string, workflows: Workflow[]): number {
  return workflows.filter((w) => w.folder === folderId || w.folder.startsWith(folderId + "/")).length;
}

/* Folder tree item component */
function FolderTreeItem({
  node, depth, activeFolder, setActiveFolder, expandedFolders, toggleExpanded, workflows,
}: {
  node: FolderNode; depth: number; activeFolder: string;
  setActiveFolder: (id: string) => void;
  expandedFolders: Set<string>; toggleExpanded: (id: string) => void;
  workflows: Workflow[];
}) {
  const isActive = activeFolder === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedFolders.has(node.id);
  const count = countInFolder(node.id, workflows);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div
        className={cn(
          "group flex w-full items-center justify-between rounded-md py-1.5 text-[12px] font-medium transition-all duration-100 cursor-pointer",
          isActive
            ? "bg-white text-zinc-900 shadow-xs border border-zinc-200"
            : "text-zinc-500 hover:bg-white/70 hover:text-zinc-800"
        )}
        style={{ paddingLeft: `${10 + depth * 16}px`, paddingRight: 8 }}
        onClick={() => setActiveFolder(node.id)}
      >
        <span className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpanded(node.id); }}
              className="p-0.5 rounded hover:bg-zinc-200/50 transition-colors"
            >
              <ChevronRight size={11} className={cn("text-zinc-400 transition-transform", isExpanded && "rotate-90")} />
            </button>
          ) : (
            <span className="w-[15px]" />
          )}
          {isActive
            ? <FolderOpen size={13} className="text-zinc-400 flex-shrink-0" />
            : <Folder size={13} className="text-zinc-300 flex-shrink-0" />
          }
          <span className="truncate">{node.label}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className={cn("text-[11px] tabular-nums", isActive ? "text-zinc-600" : "text-zinc-300")}>{count}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-200/50 transition-all"
          >
            <MoreHorizontal size={11} className="text-zinc-400" />
          </button>
        </span>
      </div>
      {showMenu && (
        <div className="ml-10 mb-1 rounded-md border border-zinc-200 bg-white shadow-lg p-1 text-[11px]">
          <button className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-zinc-600 hover:bg-zinc-50" onClick={() => setShowMenu(false)}>
            <Pencil size={10} /> Rename
          </button>
          <button className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-zinc-600 hover:bg-zinc-50" onClick={() => setShowMenu(false)}>
            <FolderPlus size={10} /> Add subfolder
          </button>
          <button className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-red-500 hover:bg-red-50" onClick={() => setShowMenu(false)}>
            <Trash2 size={10} /> Delete
          </button>
        </div>
      )}
      {hasChildren && isExpanded && node.children!.map((child) => (
        <FolderTreeItem
          key={child.id} node={child} depth={depth + 1}
          activeFolder={activeFolder} setActiveFolder={setActiveFolder}
          expandedFolders={expandedFolders} toggleExpanded={toggleExpanded}
          workflows={workflows}
        />
      ))}
    </>
  );
}

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
          <TagBadge key={t} tag={t} tags={defaultTags} />
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
  const { data: apiWorkflows, isLoading, isError } = useWorkflows({ limit: 200 });
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["Sales Automation", "Reporting"]));
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [allTags, setAllTags] = useState<TagDef[]>(defaultTags);

  // Map API data to local Workflow type, fallback to mock if backend is offline
  const workflows: Workflow[] = useMemo(() => {
    if (apiWorkflows && apiWorkflows.length > 0) {
      return apiWorkflows.map(mapApiWorkflow);
    }
    return fallbackWorkflows;
  }, [apiWorkflows]);

  const toggleTag = (name: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const createTag = (name: string) => {
    if (!allTags.find((t) => t.name === name)) {
      setAllTags((prev) => [...prev, { name, color: tagColors[prev.length % tagColors.length] }]);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = workflows.filter((w) => {
    if (activeFolder !== "all" && w.folder !== activeFolder && !w.folder.startsWith(activeFolder + "/")) return false;
    if (activeFilter !== "All" && w.status !== activeFilter.toLowerCase()) return false;
    if (activeTags.size > 0 && !w.tags.some((t) => activeTags.has(t))) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full">
      {/* ── Folder sidebar ── */}
      <aside className="w-52 flex-shrink-0 border-r border-zinc-100 bg-zinc-50/50 px-3 py-6 overflow-y-auto">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Folders
        </p>
        <div className="space-y-0.5">
          {/* All Workflows */}
          <button
            onClick={() => setActiveFolder("all")}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-all duration-100",
              activeFolder === "all"
                ? "bg-white text-zinc-900 shadow-xs border border-zinc-200"
                : "text-zinc-500 hover:bg-white/70 hover:text-zinc-800"
            )}
          >
            <span className="flex items-center gap-1.5">
              {activeFolder === "all"
                ? <FolderOpen size={13} className="text-zinc-400" />
                : <Folder size={13} className="text-zinc-300" />
              }
              All Workflows
            </span>
            <span className={cn("text-[11px] tabular-nums", activeFolder === "all" ? "text-zinc-600" : "text-zinc-300")}>
              {workflows.length}
            </span>
          </button>

          {/* Tree folders */}
          {folderTree.map((node) => (
            <FolderTreeItem
              key={node.id} node={node} depth={0}
              activeFolder={activeFolder} setActiveFolder={setActiveFolder}
              expandedFolders={expandedFolders} toggleExpanded={toggleExpanded}
              workflows={workflows}
            />
          ))}
        </div>

        {/* Create folder inline */}
        {creatingFolder ? (
          <div className="mt-3 flex items-center gap-1 px-1">
            <FolderPlus size={12} className="text-zinc-400 flex-shrink-0" />
            <input
              autoFocus
              className="flex-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] text-zinc-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newFolderName.trim()) setCreatingFolder(false);
                if (e.key === "Escape") { setCreatingFolder(false); setNewFolderName(""); }
              }}
              placeholder="Folder name…"
            />
            <button onClick={() => setCreatingFolder(false)} className="p-0.5 rounded hover:bg-zinc-100">
              <Check size={11} className="text-emerald-500" />
            </button>
            <button onClick={() => { setCreatingFolder(false); setNewFolderName(""); }} className="p-0.5 rounded hover:bg-zinc-100">
              <X size={11} className="text-zinc-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreatingFolder(true)}
            className="mt-4 flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <Plus size={12} />
            New Folder
          </button>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 px-8 py-8">
        <PageHeader
          title="Workflows"
          description="Automate processes across your systems."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowImport(true)}>
                <Upload size={13} /> Import
              </Button>
              <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
                <Plus size={14} strokeWidth={2.5} />
                New Workflow
              </Button>
            </div>
          }
        />

        {/* Summary strip */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          <MiniStat label="Total" value={isLoading ? "…" : workflows.length.toString()} />
          <MiniStat label="Active" value={isLoading ? "…" : workflows.filter((w) => w.status === "active").length.toString()} color="green" />
          <MiniStat label="Paused" value={isLoading ? "…" : workflows.filter((w) => w.status === "paused").length.toString()} color="amber" />
          <MiniStat label="Draft" value={isLoading ? "…" : workflows.filter((w) => w.status === "draft").length.toString()} />
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
          <TagFilterDropdown allTags={allTags} activeTags={activeTags} toggle={toggleTag} onCreateTag={createTag} workflows={workflows} />
          <span className="ml-auto text-[12px] text-zinc-400">
            {filtered.length} workflow{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Data table */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Loading workflows…</span>
            </div>
          ) : (
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
          )}
        </div>

        <CreateWorkflowModal open={showCreate} onClose={() => setShowCreate(false)} />
        <ImportWorkflowModal open={showImport} onClose={() => setShowImport(false)} />
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
