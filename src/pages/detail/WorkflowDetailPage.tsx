import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GitBranch, Play, Clock, Zap, Settings, BarChart3,
  Beaker, CheckCircle2, XCircle, Layers, Plug, Tag, Calendar, User,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

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

const tabs = [
  { id: "overview", label: "Overview", icon: <GitBranch size={13} /> },
  { id: "executions", label: "Executions", icon: <Play size={13} /> },
  { id: "evaluation", label: "Evaluation", icon: <Beaker size={13} /> },
  { id: "settings", label: "Settings", icon: <Settings size={13} /> },
];

export function WorkflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <EntityDetailLayout
      backLabel="Workflows"
      backTo="/workflows"
      name={workflow.name}
      status={{ label: workflow.status, variant: "success" }}
      subtitle={`${workflow.trigger} trigger • ${workflow.nodes} nodes • ${workflow.version}`}
      icon={<GitBranch size={18} className="text-zinc-500" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/studio/${id}`)}>Edit in Studio</Button>
          <Button variant="primary" size="sm"><Play size={12} /> Run</Button>
        </>
      }
    >
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "executions" && <ExecutionsTab />}
      {activeTab === "evaluation" && <EvaluationTab />}
      {activeTab === "settings" && <SettingsTab />}
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
