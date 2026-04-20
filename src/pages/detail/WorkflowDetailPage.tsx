import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GitBranch, Play, Clock, Zap, Settings, BarChart3,
  Beaker, CheckCircle2, XCircle, Layers, Plug, Tag, Calendar, User,
  History, GitCompare, RotateCcw, Eye, ChevronRight, ArrowRight,
  Plus, Minus, FileCode, ArrowDown, Users, Download,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { ShareWorkflowModal } from "@/components/modals/ShareWorkflowModal";
import { ExportWorkflowModal } from "@/components/modals/ImportExportWorkflowModals";
import { cn } from "@/lib/utils";
import { useWorkflow, useWorkflowExecutions } from "@/hooks/useApi";

/* ── Mock data — would come from API via :id ── */
const workflow = {
  id: "wf-001",
  name: "Lead Qualification Pipeline",
  status: "active" as const,
  trigger: "Webhook",
  version: "v12",
  nodes: 8,
  connections: 5,
  lastRun: "2 min ago",
  lastRunStatus: "success" as const,
  avgDuration: "4.2s",
  totalRuns: 1247,
  failRate: "1.8%",
  createdBy: "Gouhar Ali",
  createdAt: "Jan 12, 2026",
  updatedAt: "10 min ago",
  tags: ["lead-gen", "sales", "ai-scoring"],
  description: "Qualifies inbound leads from Typeform via AI scoring, enriches with Clearbit, routes to Salesforce based on score thresholds.",
};

const recentRuns = [
  { id: "r1", status: "success" as const, trigger: "webhook", duration: "4.2s", startedAt: "2 min ago", nodes: "8/8 passed" },
  { id: "r2", status: "success" as const, trigger: "webhook", duration: "3.8s", startedAt: "15 min ago", nodes: "8/8 passed" },
  { id: "r3", status: "failed" as const, trigger: "webhook", duration: "12.1s", startedAt: "1 hr ago", nodes: "5/8 — failed at 'Score Lead'" },
  { id: "r4", status: "success" as const, trigger: "manual", duration: "5.1s", startedAt: "3 hrs ago", nodes: "8/8 passed" },
  { id: "r5", status: "success" as const, trigger: "webhook", duration: "4.0s", startedAt: "5 hrs ago", nodes: "8/8 passed" },
];

const nodeList = [
  { name: "Typeform Trigger", type: "trigger", status: "ok" },
  { name: "Clearbit Enrich", type: "integration", status: "ok" },
  { name: "Score Lead (GPT-4o)", type: "ai", status: "ok" },
  { name: "IF Score > 70", type: "logic", status: "ok" },
  { name: "Salesforce Create Lead", type: "integration", status: "ok" },
  { name: "Slack Notify Sales", type: "integration", status: "ok" },
  { name: "Google Sheets Log", type: "integration", status: "ok" },
  { name: "Error Handler", type: "error", status: "ok" },
];

const nodeTypeColors: Record<string, string> = {
  trigger: "bg-green-50 text-green-600",
  integration: "bg-zinc-50 text-zinc-600",
  ai: "bg-zinc-900 text-white",
  logic: "bg-blue-50 text-blue-600",
  error: "bg-red-50 text-red-600",
};

/* ── Version History mock ── */
interface WorkflowVersion {
  id: string;
  version: string;
  label?: string;
  author: string;
  timestamp: string;
  changes: { type: "added" | "modified" | "removed"; node: string; detail: string }[];
  nodeCount: number;
  connectionCount: number;
}

const mockVersions: WorkflowVersion[] = [
  {
    id: "v12", version: "v12", label: "Current", author: "Gouhar Ali", timestamp: "10 min ago",
    changes: [
      { type: "modified", node: "Score Lead (GPT-4o)", detail: "Updated prompt template and temperature (0.7→0.5)" },
      { type: "modified", node: "IF Score > 70", detail: "Changed threshold from 65 to 70" },
    ],
    nodeCount: 8, connectionCount: 7,
  },
  {
    id: "v11", version: "v11", author: "Gouhar Ali", timestamp: "2 hrs ago",
    changes: [
      { type: "added", node: "Error Handler", detail: "Added error handler with Slack notification" },
      { type: "modified", node: "Slack Notify Sales", detail: "Added channel override for urgent leads" },
    ],
    nodeCount: 8, connectionCount: 7,
  },
  {
    id: "v10", version: "v10", author: "Sarah K.", timestamp: "Yesterday",
    changes: [
      { type: "added", node: "Google Sheets Log", detail: "Added logging node for audit trail" },
    ],
    nodeCount: 7, connectionCount: 6,
  },
  {
    id: "v9", version: "v9", label: "Stable Release", author: "Gouhar Ali", timestamp: "3 days ago",
    changes: [
      { type: "modified", node: "Clearbit Enrich", detail: "Switched from v1 to v2 API endpoint" },
      { type: "removed", node: "Debug Logger", detail: "Removed debug logging node" },
      { type: "modified", node: "Salesforce Create Lead", detail: "Added custom field mappings" },
    ],
    nodeCount: 6, connectionCount: 5,
  },
  {
    id: "v8", version: "v8", author: "Gouhar Ali", timestamp: "5 days ago",
    changes: [
      { type: "added", node: "Score Lead (GPT-4o)", detail: "Added AI scoring with GPT-4o" },
      { type: "added", node: "IF Score > 70", detail: "Added routing based on lead score" },
    ],
    nodeCount: 7, connectionCount: 6,
  },
  {
    id: "v7", version: "v7", author: "Sarah K.", timestamp: "1 week ago",
    changes: [
      { type: "modified", node: "Typeform Trigger", detail: "Updated to new form ID" },
    ],
    nodeCount: 5, connectionCount: 4,
  },
];

const tabs = [
  { id: "overview", label: "Overview", icon: <GitBranch size={13} /> },
  { id: "executions", label: "Executions", icon: <Play size={13} /> },
  { id: "history", label: "History", icon: <History size={13} /> },
  { id: "evaluation", label: "Evaluation", icon: <Beaker size={13} /> },
  { id: "settings", label: "Settings", icon: <Settings size={13} /> },
];

export function WorkflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const { data: apiWf } = useWorkflow(id);
  const { data: apiExecs } = useWorkflowExecutions(id ?? "");

  // Merge real data with mock fallback
  const wf = useMemo(() => {
    if (!apiWf) return workflow;
    return {
      ...workflow,
      id: apiWf.id,
      name: apiWf.name,
      status: apiWf.status as "active" | "inactive",
      description: apiWf.description ?? workflow.description,
      tags: apiWf.tags ?? workflow.tags,
      nodes: apiWf.node_count ?? workflow.nodes,
      version: `v${apiWf.version ?? 1}`,
      totalRuns: apiWf.total_executions ?? workflow.totalRuns,
      createdAt: new Date(apiWf.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      updatedAt: apiWf.updated_at ? new Date(apiWf.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : workflow.updatedAt,
    };
  }, [apiWf]);

  return (
    <EntityDetailLayout
      backLabel="Workflows"
      backTo="/workflows"
      name={wf.name}
      status={{ label: wf.status, variant: "success" }}
      subtitle={`${wf.trigger} trigger • ${wf.nodes} nodes • ${wf.version}`}
      icon={<GitBranch size={18} className="text-zinc-500" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={() => setShowShare(true)}><Users size={12} /> Share</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowExport(true)}><Download size={12} /> Export</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/studio/${id}`)}>Edit in Studio</Button>
          <Button variant="primary" size="sm"><Play size={12} /> Run</Button>
        </>
      }
    >
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "executions" && <ExecutionsTab />}
      {activeTab === "history" && <VersionHistoryTab />}
      {activeTab === "evaluation" && <EvaluationTab />}
      {activeTab === "settings" && <SettingsTab />}
      <ShareWorkflowModal open={showShare} onClose={() => setShowShare(false)} workflowName={wf.name} />
      <ExportWorkflowModal open={showExport} onClose={() => setShowExport(false)} workflowName={wf.name} />
    </EntityDetailLayout>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-5">
      {/* Description */}
      <DetailSection title="Description">
        <p className="text-[13px] text-zinc-600 leading-relaxed">{workflow.description}</p>
        <div className="flex items-center gap-1.5 mt-3">
          {workflow.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
              <Tag size={9} /> {t}
            </span>
          ))}
        </div>
      </DetailSection>

      <div className="grid grid-cols-2 gap-5">
        {/* Stats */}
        <DetailSection title="Performance">
          <DetailRow label="Total Runs" value={<span className="font-mono">{workflow.totalRuns.toLocaleString()}</span>} />
          <DetailRow label="Avg Duration" value={<span className="font-mono">{workflow.avgDuration}</span>} />
          <DetailRow label="Fail Rate" value={<span className={cn("font-mono", parseFloat(workflow.failRate) > 5 ? "text-red-600" : "text-zinc-700")}>{workflow.failRate}</span>} />
          <DetailRow label="Last Run" value={workflow.lastRun} />
          <DetailRow label="Last Status" value={<StatusDot status={workflow.lastRunStatus} label={workflow.lastRunStatus} />} />
        </DetailSection>

        {/* Info */}
        <DetailSection title="Details">
          <DetailRow label="Trigger" value={<Badge variant="info">{workflow.trigger}</Badge>} />
          <DetailRow label="Version" value={<span className="font-mono">{workflow.version}</span>} />
          <DetailRow label="Created By" value={workflow.createdBy} />
          <DetailRow label="Created" value={workflow.createdAt} />
          <DetailRow label="Last Modified" value={workflow.updatedAt} />
        </DetailSection>
      </div>

      {/* Node list */}
      <DetailSection title="Nodes" description={`${nodeList.length} nodes in this workflow`}>
        <div className="space-y-1.5">
          {nodeList.map((node, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border border-zinc-50 px-3 py-2 hover:bg-zinc-50/50 transition-colors">
              <span className="text-[10px] font-mono text-zinc-300 w-4">{i + 1}</span>
              <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-medium capitalize", nodeTypeColors[node.type])}>
                {node.type}
              </span>
              <span className="text-[13px] text-zinc-700 flex-1">{node.name}</span>
              <CheckCircle2 size={13} className="text-green-400" />
            </div>
          ))}
        </div>
      </DetailSection>
    </div>
  );
}

function ExecutionsTab() {
  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="flex gap-4 text-[12px]">
        <span className="text-zinc-400">Total <span className="font-semibold text-zinc-700">{workflow.totalRuns.toLocaleString()}</span></span>
        <span className="text-zinc-400">Success <span className="font-semibold text-green-600">98.2%</span></span>
        <span className="text-zinc-400">Avg Duration <span className="font-semibold text-zinc-700">{workflow.avgDuration}</span></span>
      </div>

      {/* Runs list */}
      <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs divide-y divide-zinc-50">
        <div className="flex items-center px-4 py-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
          <span className="w-8"></span>
          <span className="flex-1">Run</span>
          <span className="w-20">Trigger</span>
          <span className="w-20">Duration</span>
          <span className="w-32">Nodes</span>
          <span className="w-20 text-right">Started</span>
        </div>
        {recentRuns.map((run) => (
          <div key={run.id} className="flex items-center px-4 py-2.5 hover:bg-zinc-50/50 transition-colors cursor-pointer">
            <span className="w-8">
              <StatusDot status={run.status === "success" ? "success" : "failed"} />
            </span>
            <span className="flex-1 text-[13px] font-medium text-zinc-700">{run.id}</span>
            <span className="w-20">
              <Badge variant="neutral">{run.trigger}</Badge>
            </span>
            <span className="w-20 font-mono text-[12px] text-zinc-500">{run.duration}</span>
            <span className="w-32 text-[12px] text-zinc-500">{run.nodes}</span>
            <span className="w-20 text-right text-[11px] text-zinc-400">{run.startedAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvaluationTab() {
  return (
    <div className="space-y-5">
      <DetailSection title="Test Payloads" description="Saved test inputs for evaluating this workflow">
        <div className="space-y-2">
          {[
            { name: "High-score lead", status: "passing", runs: 12 },
            { name: "Low-score discard", status: "passing", runs: 8 },
            { name: "Missing email field", status: "failing", runs: 3 },
          ].map((test, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Beaker size={12} className="text-zinc-400" />
                <span className="text-[13px] text-zinc-700">{test.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-400">{test.runs} runs</span>
                <StatusDot status={test.status === "passing" ? "success" : "error"} label={test.status} />
              </div>
            </div>
          ))}
        </div>
      </DetailSection>

      <DetailSection title="Cost & Latency" description="AI node metrics for recent runs">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-[22px] font-semibold text-zinc-800">$0.04</p>
            <p className="text-[11px] text-zinc-400 mt-1">Avg cost/run</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-semibold text-zinc-800">1.2s</p>
            <p className="text-[11px] text-zinc-400 mt-1">Avg AI latency</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-semibold text-zinc-800">340</p>
            <p className="text-[11px] text-zinc-400 mt-1">Avg tokens/run</p>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}

function VersionHistoryTab() {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<string>("v12");
  const [compareB, setCompareB] = useState<string>("v9");

  const selected = mockVersions.find((v) => v.id === selectedVersion);
  const versionA = mockVersions.find((v) => v.id === compareA);
  const versionB = mockVersions.find((v) => v.id === compareB);

  const changeIcon = { added: Plus, modified: FileCode, removed: Minus };
  const changeColor = {
    added: "text-emerald-500 bg-emerald-50",
    modified: "text-amber-500 bg-amber-50",
    removed: "text-red-400 bg-red-50",
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-[12px]">
          <span className="text-zinc-400">Versions <span className="font-semibold text-zinc-700">{mockVersions.length}</span></span>
          <span className="text-zinc-400">Authors <span className="font-semibold text-zinc-700">2</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
              compareMode ? "bg-zinc-800 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <GitCompare size={12} />
            {compareMode ? "Exit Compare" : "Compare Versions"}
          </button>
        </div>
      </div>

      {/* Compare Mode */}
      {compareMode && versionA && versionB && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 bg-zinc-50/50">
            <select
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-[12px] font-medium text-zinc-700 bg-white outline-none"
            >
              {mockVersions.map((v) => (
                <option key={v.id} value={v.id}>{v.version}{v.label ? ` (${v.label})` : ""}</option>
              ))}
            </select>
            <ArrowRight size={14} className="text-zinc-400" />
            <select
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-[12px] font-medium text-zinc-700 bg-white outline-none"
            >
              {mockVersions.map((v) => (
                <option key={v.id} value={v.id}>{v.version}{v.label ? ` (${v.label})` : ""}</option>
              ))}
            </select>
          </div>
          {/* Diff summary */}
          <div className="grid grid-cols-2 divide-x divide-zinc-100">
            <div className="px-4 py-3">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">{versionA.version} — {versionA.timestamp}</p>
              <div className="space-y-1">
                <p className="text-[12px] text-zinc-600">Nodes: <span className="font-mono font-semibold">{versionA.nodeCount}</span></p>
                <p className="text-[12px] text-zinc-600">Connections: <span className="font-mono font-semibold">{versionA.connectionCount}</span></p>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">{versionB.version} — {versionB.timestamp}</p>
              <div className="space-y-1">
                <p className="text-[12px] text-zinc-600">Nodes: <span className="font-mono font-semibold">{versionB.nodeCount}</span></p>
                <p className="text-[12px] text-zinc-600">Connections: <span className="font-mono font-semibold">{versionB.connectionCount}</span></p>
              </div>
            </div>
          </div>
          {/* Changes between versions */}
          <div className="border-t border-zinc-100 px-4 py-3">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Changes between {compareB.replace("v", "v")} → {compareA.replace("v", "v")}</p>
            <div className="space-y-1.5">
              {mockVersions
                .filter((v) => {
                  const aIdx = mockVersions.findIndex((x) => x.id === compareA);
                  const bIdx = mockVersions.findIndex((x) => x.id === compareB);
                  const vIdx = mockVersions.indexOf(v);
                  return vIdx >= aIdx && vIdx < bIdx;
                })
                .flatMap((v) => v.changes.map((c, i) => ({ ...c, version: v.version, key: `${v.id}-${i}` })))
                .map((change) => {
                  const Icon = changeIcon[change.type];
                  return (
                    <div key={change.key} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50">
                      <span className={cn("flex h-5 w-5 items-center justify-center rounded", changeColor[change.type])}>
                        <Icon size={10} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-zinc-700">{change.node}</span>
                          <span className="text-[9px] font-mono text-zinc-400">{change.version}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{change.detail}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Version timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-px bg-zinc-200" />

        <div className="space-y-0.5">
          {mockVersions.map((version, idx) => {
            const isSelected = selectedVersion === version.id;
            return (
              <div key={version.id}>
                <button
                  onClick={() => setSelectedVersion(isSelected ? null : version.id)}
                  className={cn(
                    "relative flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-all",
                    isSelected ? "bg-zinc-50" : "hover:bg-zinc-50/50"
                  )}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "relative z-10 mt-0.5 flex h-[10px] w-[10px] flex-shrink-0 rounded-full ring-2 ring-white",
                    idx === 0 ? "bg-zinc-800" : "bg-zinc-300"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-zinc-800 font-mono">{version.version}</span>
                      {version.label && (
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                          version.label === "Current" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {version.label}
                        </span>
                      )}
                      <span className="text-[11px] text-zinc-400">{version.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <User size={10} className="text-zinc-300" />
                      <span className="text-[11px] text-zinc-500">{version.author}</span>
                      <span className="text-[10px] text-zinc-300">·</span>
                      <span className="text-[10px] text-zinc-400">
                        {version.changes.length} change{version.changes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={12} className={cn("mt-1 text-zinc-300 transition-transform", isSelected && "rotate-90")} />
                </button>

                {/* Expanded change details */}
                {isSelected && (
                  <div className="ml-9 mb-2 space-y-2">
                    {/* Changes list */}
                    <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
                      {version.changes.map((change, ci) => {
                        const Icon = changeIcon[change.type];
                        return (
                          <div key={ci} className="flex items-start gap-2 border-b border-zinc-50 last:border-0 px-3 py-2">
                            <span className={cn("flex h-5 w-5 items-center justify-center rounded flex-shrink-0 mt-0.5", changeColor[change.type])}>
                              <Icon size={10} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[12px] font-medium text-zinc-700">{change.node}</span>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{change.detail}</p>
                            </div>
                            <span className={cn(
                              "text-[9px] font-medium rounded-full px-1.5 py-0.5 capitalize",
                              change.type === "added" ? "bg-emerald-50 text-emerald-600" :
                              change.type === "removed" ? "bg-red-50 text-red-500" :
                              "bg-amber-50 text-amber-600"
                            )}>
                              {change.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                        <Eye size={11} />
                        Preview
                      </button>
                      {idx !== 0 && (
                        <button className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                          <RotateCcw size={11} />
                          Restore this version
                        </button>
                      )}
                      <button className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                        <ArrowDown size={11} />
                        Export
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-5">
      <DetailSection title="Execution Settings">
        <DetailRow label="Execution Order" value="Sequential" />
        <DetailRow label="Timeout" value={<span className="font-mono">30s</span>} />
        <DetailRow label="Save Successful Executions" value="All" />
        <DetailRow label="Save Failed Executions" value="All" />
        <DetailRow label="Error Workflow" value={<span className="text-zinc-400">None</span>} />
      </DetailSection>

      <DetailSection title="Deployment">
        <DetailRow label="Confidentiality" value={<Badge variant="neutral">Standard</Badge>} />
        <DetailRow label="Sequential Processing" value="Off" />
        <DetailRow label="Environment" value={<Badge variant="info">Draft</Badge>} />
      </DetailSection>

      <DetailSection title="Danger Zone">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-zinc-700">Delete this workflow</p>
            <p className="text-[11px] text-zinc-400">This action cannot be undone.</p>
          </div>
          <Button variant="secondary" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
        </div>
      </DetailSection>
    </div>
  );
}
