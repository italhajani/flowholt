import { useState } from "react";
import {
  GitBranch, GitCommit, GitPullRequest, GitMerge, Upload, Download,
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, Diff,
  ChevronRight, ChevronDown, FileText, FilePlus, FileX, FileMinus,
  Eye, ArrowUpRight, Shield, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mock data ── */
type FileStatus = "added" | "modified" | "deleted" | "conflict";

interface ChangedFile {
  path: string;
  status: FileStatus;
  additions: number;
  deletions: number;
}

interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: number;
}

const branches = ["main", "staging", "feature/lead-scoring", "fix/timeout-errors"];

const changedFiles: ChangedFile[] = [
  { path: "workflows/lead-scoring.json", status: "modified", additions: 24, deletions: 8 },
  { path: "workflows/onboarding-flow.json", status: "added", additions: 156, deletions: 0 },
  { path: "credentials/hubspot.json", status: "modified", additions: 2, deletions: 2 },
  { path: "variables/production.env", status: "modified", additions: 3, deletions: 1 },
  { path: "workflows/deprecated-flow.json", status: "deleted", additions: 0, deletions: 89 },
];

const commitHistory: Commit[] = [
  { hash: "a3f7c2d", message: "Update lead scoring threshold to 70", author: "Sarah Chen", date: "2 hours ago", filesChanged: 1 },
  { hash: "b8e1f4a", message: "Add onboarding workflow", author: "Alex Rivera", date: "4 hours ago", filesChanged: 3 },
  { hash: "c2d9e7b", message: "Fix HubSpot credential rotation", author: "Sarah Chen", date: "Yesterday", filesChanged: 2 },
  { hash: "d5a3f1c", message: "Remove deprecated flow", author: "Jamie Lee", date: "2 days ago", filesChanged: 1 },
  { hash: "e7b2c8d", message: "Add production environment variables", author: "Morgan Kim", date: "3 days ago", filesChanged: 4 },
];

const conflictFiles = [
  { path: "workflows/lead-scoring.json", local: "threshold: 70", remote: "threshold: 65", reason: "Both branches modified scoring threshold" },
];

const statusIcon: Record<FileStatus, typeof FileText> = {
  added: FilePlus,
  modified: FileText,
  deleted: FileX,
  conflict: AlertTriangle,
};

const statusColor: Record<FileStatus, string> = {
  added: "text-emerald-600 bg-emerald-50",
  modified: "text-blue-600 bg-blue-50",
  deleted: "text-red-600 bg-red-50",
  conflict: "text-amber-600 bg-amber-50",
};

type Tab = "changes" | "history" | "conflicts";

export function SourceControlPanel() {
  const [tab, setTab] = useState<Tab>("changes");
  const [currentBranch, setCurrentBranch] = useState("main");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [expandedCommit, setExpandedCommit] = useState<string | null>(null);

  const additions = changedFiles.reduce((sum, f) => sum + f.additions, 0);
  const deletions = changedFiles.reduce((sum, f) => sum + f.deletions, 0);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <GitBranch size={20} className="text-zinc-500" />
            Source Control
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage workflow versions with Git integration</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5">
            <GitBranch size={12} className="text-zinc-400" />
            <select
              value={currentBranch}
              onChange={e => setCurrentBranch(e.target.value)}
              className="text-xs font-medium text-zinc-700 bg-transparent border-none focus:outline-none"
            >
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <button
            onClick={handleSync}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              syncing ? "border-blue-200 bg-blue-50 text-blue-600" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <RefreshCw size={12} className={cn(syncing && "animate-spin")} />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3 mb-6">
        <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors">
          <Upload size={12} />
          Push Changes
          <span className="rounded-full bg-white/20 px-1.5 py-0 text-[9px]">{changedFiles.length}</span>
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
          <Download size={12} />
          Pull Latest
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
          <GitPullRequest size={12} />
          Create PR
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
          <GitMerge size={12} />
          Merge Branch
        </button>

        <div className="flex-1" />

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="font-mono font-bold">+{additions}</span> additions
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <span className="font-mono font-bold">-{deletions}</span> deletions
          </span>
          <span className="text-zinc-400">{changedFiles.length} files changed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-zinc-200">
        {([
          { id: "changes" as Tab, label: "Changes", count: changedFiles.length, icon: Diff },
          { id: "history" as Tab, label: "Commit History", count: commitHistory.length, icon: GitCommit },
          { id: "conflicts" as Tab, label: "Conflicts", count: conflictFiles.length, icon: AlertTriangle },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <t.icon size={12} />
            {t.label}
            {t.count > 0 && (
              <span className={cn(
                "rounded-full px-1.5 py-0 text-[9px] font-bold",
                tab === t.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          {tab === "changes" && (
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-700">Staged & Unstaged Changes</span>
                <button className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Stage All</button>
              </div>
              <div className="divide-y divide-zinc-50">
                {changedFiles.map(file => {
                  const Icon = statusIcon[file.status];
                  const color = statusColor[file.status];
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(selectedFile === file.path ? null : file.path)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        selectedFile === file.path ? "bg-blue-50" : "hover:bg-zinc-50"
                      )}
                    >
                      <span className={cn("rounded-md p-1", color.split(" ")[1])}>
                        <Icon size={12} className={color.split(" ")[0]} />
                      </span>
                      <span className="text-[11px] font-medium text-zinc-700 flex-1 truncate font-mono">{file.path}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">+{file.additions}</span>
                      <span className="text-[10px] text-red-500 font-mono">-{file.deletions}</span>
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[8px] font-bold uppercase",
                        color
                      )}>
                        {file.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-4 py-3">
                <span className="text-sm font-semibold text-zinc-700">Recent Commits</span>
              </div>
              <div className="divide-y divide-zinc-50">
                {commitHistory.map(commit => (
                  <div key={commit.hash}>
                    <button
                      onClick={() => setExpandedCommit(expandedCommit === commit.hash ? null : commit.hash)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <GitCommit size={14} className="text-zinc-400" />
                        <div className="w-px h-4 bg-zinc-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-zinc-800">{commit.message}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-blue-600">{commit.hash}</span>
                          <span className="text-[9px] text-zinc-400">{commit.author}</span>
                          <span className="text-[9px] text-zinc-300">·</span>
                          <span className="text-[9px] text-zinc-400">{commit.date}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400">{commit.filesChanged} file{commit.filesChanged > 1 ? "s" : ""}</span>
                      {expandedCommit === commit.hash
                        ? <ChevronDown size={12} className="text-zinc-400" />
                        : <ChevronRight size={12} className="text-zinc-400" />
                      }
                    </button>
                    {expandedCommit === commit.hash && (
                      <div className="bg-zinc-50 px-8 py-2.5 border-t border-zinc-100">
                        <div className="flex gap-2 mb-2">
                          <button className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[9px] text-zinc-600 hover:bg-zinc-50">
                            <Eye size={9} /> View diff
                          </button>
                          <button className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[9px] text-zinc-600 hover:bg-zinc-50">
                            <ArrowUpRight size={9} /> Revert
                          </button>
                          <button className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[9px] text-zinc-600 hover:bg-zinc-50">
                            <GitBranch size={9} /> Cherry-pick
                          </button>
                        </div>
                        <p className="text-[9px] text-zinc-400">Full hash: {commit.hash}abc123def456</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "conflicts" && (
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-4 py-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-sm font-semibold text-zinc-700">Merge Conflicts</span>
              </div>
              {conflictFiles.length > 0 ? (
                <div className="divide-y divide-zinc-50">
                  {conflictFiles.map((cf, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={12} className="text-amber-500" />
                        <span className="text-[11px] font-mono font-medium text-zinc-700">{cf.path}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mb-3">{cf.reason}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <p className="text-[9px] font-medium text-blue-600 mb-1">LOCAL (yours)</p>
                          <pre className="text-[10px] text-blue-700 font-mono">{cf.local}</pre>
                          <button className="mt-2 rounded-md bg-blue-600 px-3 py-1 text-[9px] text-white hover:bg-blue-700 transition-colors">
                            Accept Local
                          </button>
                        </div>
                        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                          <p className="text-[9px] font-medium text-violet-600 mb-1">REMOTE (theirs)</p>
                          <pre className="text-[10px] text-violet-700 font-mono">{cf.remote}</pre>
                          <button className="mt-2 rounded-md bg-violet-600 px-3 py-1 text-[9px] text-white hover:bg-violet-700 transition-colors">
                            Accept Remote
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                  <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                  <p className="text-sm font-medium text-zinc-600">No conflicts</p>
                  <p className="text-xs text-zinc-400">All changes merge cleanly</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar — diff preview */}
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-4 py-3">
            <span className="text-sm font-semibold text-zinc-700">Diff Preview</span>
          </div>
          {selectedFile ? (
            <div className="p-3">
              <p className="text-[10px] font-mono text-zinc-500 mb-2">{selectedFile}</p>
              <div className="rounded-lg bg-zinc-900 p-3 font-mono text-[9px] leading-relaxed overflow-x-auto">
                <div className="text-zinc-500">@@ -12,6 +12,8 @@</div>
                <div className="text-zinc-400">  "nodes": [</div>
                <div className="text-zinc-400">    {"{"}"type": "n8n-nodes-base.typeformTrigger",</div>
                <div className="text-red-400">-   "threshold": 65,</div>
                <div className="text-emerald-400">+   "threshold": 70,</div>
                <div className="text-emerald-400">+   "enableScoring": true,</div>
                <div className="text-zinc-400">    "credentials": {"{"}</div>
                <div className="text-zinc-400">      "typeformApi": {"{"}</div>
                <div className="text-zinc-500">@@ -28,3 +30,5 @@</div>
                <div className="text-zinc-400">    "connections": {"{"}</div>
                <div className="text-emerald-400">+   "errorHandling": "continue",</div>
                <div className="text-emerald-400">+   "retryOnFail": true,</div>
                <div className="text-zinc-400">  {"}"}</div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[9px] text-zinc-600 hover:bg-zinc-50">
                  <FilePlus size={9} /> Stage
                </button>
                <button className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[9px] text-zinc-600 hover:bg-zinc-50">
                  <ArrowUpRight size={9} /> Revert
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <Diff size={24} className="mb-2" />
              <p className="text-xs">Select a file to preview diff</p>
            </div>
          )}

          {/* Commit message */}
          <div className="border-t border-zinc-100 p-3">
            <label className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">Commit Message</label>
            <textarea
              placeholder="Describe your changes…"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none resize-none h-20"
            />
            <button className="mt-2 w-full rounded-lg bg-zinc-900 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors">
              Commit & Push
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
