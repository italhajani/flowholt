import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import {
  GitBranch, Github, GitPullRequest, GitCommit, RefreshCw, Settings,
  CheckCircle2, AlertCircle, Clock, Folder, ArrowUpDown, ExternalLink,
  Eye, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSourceControlConfig } from "@/hooks/useApi";

/* Mock connected repo */
const connectedRepo = {
  name: "flowholt-workflows",
  owner: "flowholt-team",
  branch: "main",
  lastSync: "12 minutes ago",
  status: "synced" as const,
  provider: "GitHub",
  url: "https://github.com/flowholt-team/flowholt-workflows",
};

/* Recent commits */
const recentCommits = [
  { hash: "a3f21b4", message: "Update Lead Qualification Pipeline — add scoring node", author: "Sarah C.", time: "2 hours ago", workflows: 1 },
  { hash: "e7d0c91", message: "Add Invoice Processing Pipeline", author: "You", time: "1 day ago", workflows: 1 },
  { hash: "bc4f2a0", message: "Bulk sync: 3 workflows pushed", author: "System", time: "3 days ago", workflows: 3 },
  { hash: "1f8e3d7", message: "Fix Error Alert Handler retry logic", author: "Alex R.", time: "5 days ago", workflows: 1 },
];

/* Sync mapping */
const syncMappings = [
  { workflow: "Lead Qualification Pipeline", path: "workflows/lead-qualification.json", direction: "bidirectional", lastSync: "2 hours ago" },
  { workflow: "Slack → Sheets Logger", path: "workflows/slack-sheets-logger.json", direction: "push", lastSync: "1 day ago" },
  { workflow: "Error Alert Handler", path: "workflows/error-alert-handler.json", direction: "pull", lastSync: "5 days ago" },
  { workflow: "Invoice Processing Pipeline", path: "workflows/invoice-processing.json", direction: "bidirectional", lastSync: "1 day ago" },
];

export function SourceControlSettings() {
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const { data: scConfig } = useSourceControlConfig();

  const repo = useMemo(() => {
    if (scConfig && scConfig.connected) return {
      ...connectedRepo,
      branch: scConfig.branch,
      url: scConfig.repoUrl,
      lastSync: scConfig.lastSync ?? connectedRepo.lastSync,
    };
    return connectedRepo;
  }, [scConfig]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[16px] font-semibold text-zinc-900">Source Control</h2>
        <p className="text-[13px] text-zinc-500 mt-1">Connect to Git to version-control your workflows automatically.</p>
      </div>

      {/* Connected repo card */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900">
              <Github size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-zinc-800">{repo.owner}/{repo.name}</span>
                <Badge variant="neutral">{repo.branch}</Badge>
                <StatusDot status="active" label="Synced" />
              </div>
              <p className="text-[12px] text-zinc-400 mt-0.5">Last synced {repo.lastSync}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSync}>
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync Now"}
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink size={12} /> View Repo
            </Button>
            <Button variant="ghost" size="sm">
              <Settings size={12} />
            </Button>
          </div>
        </div>

        {/* Sync settings */}
        <div className="grid grid-cols-3 gap-4 rounded-md bg-zinc-50 p-3">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Provider</p>
            <p className="text-[13px] font-medium text-zinc-700 mt-0.5">{repo.provider}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Default Branch</p>
            <p className="text-[13px] font-medium text-zinc-700 mt-0.5">{repo.branch}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Auto-Sync</p>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={cn(
                "mt-0.5 relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                autoSync ? "bg-emerald-500" : "bg-zinc-300"
              )}
            >
              <span className={cn(
                "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm",
                autoSync ? "translate-x-4" : "translate-x-0.5"
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent commits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-zinc-700">Recent Commits</h3>
          <Button variant="ghost" size="sm"><GitPullRequest size={12} /> Create PR</Button>
        </div>
        <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100">
          {recentCommits.map((c) => (
            <div key={c.hash} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors">
              <GitCommit size={14} className="text-zinc-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-zinc-700 truncate">{c.message}</p>
                <p className="text-[10px] text-zinc-400">
                  <span className="font-mono">{c.hash}</span> · {c.author} · {c.time}
                </p>
              </div>
              <Badge variant="neutral">{c.workflows} workflow{c.workflows > 1 ? "s" : ""}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow-to-file mapping */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-zinc-700">Sync Mappings</h3>
          <span className="text-[11px] text-zinc-400">{syncMappings.length} workflows tracked</span>
        </div>
        <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100">
          {syncMappings.map((m) => (
            <div key={m.workflow} className="flex items-center gap-3 px-4 py-2.5">
              <GitBranch size={13} className="text-zinc-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-zinc-700">{m.workflow}</p>
                <p className="text-[10px] font-mono text-zinc-400">{m.path}</p>
              </div>
              <Badge variant={m.direction === "bidirectional" ? "neutral" : "outline"}>
                <ArrowUpDown size={9} /> {m.direction}
              </Badge>
              <span className="text-[10px] text-zinc-400">{m.lastSync}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
