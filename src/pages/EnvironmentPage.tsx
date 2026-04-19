import { useState } from "react";
import { Globe, GitCompare, ArrowRight, CheckCircle2, Circle, Clock, Upload, GitBranch, Tag, AlertTriangle, Settings, Server, Activity, Layers, Lock, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

const envTabs = ["Pipeline", "Variables", "Deployments"] as const;
type EnvTab = (typeof envTabs)[number];

interface Stage {
  name: string;
  status: "live" | "deploying" | "empty";
  version: string;
  workflows: number;
  lastDeploy: string;
  health: "healthy" | "warning" | "error";
}

const stages: Stage[] = [
  { name: "Draft", status: "live", version: "v2.4.1-dev", workflows: 7, lastDeploy: "10 min ago", health: "healthy" },
  { name: "Staging", status: "live", version: "v2.3.0", workflows: 5, lastDeploy: "2 days ago", health: "healthy" },
  { name: "Production", status: "live", version: "v2.2.8", workflows: 4, lastDeploy: "1 week ago", health: "warning" },
];

interface Deployment {
  id: string;
  version: string;
  from: string;
  to: string;
  status: "success" | "failed" | "in_progress";
  deployedBy: string;
  timestamp: string;
  workflows: number;
}

const mockDeployments: Deployment[] = [
  { id: "dep1", version: "v2.3.0", from: "Draft", to: "Staging", status: "success", deployedBy: "Gouhar Ali", timestamp: "2 days ago", workflows: 5 },
  { id: "dep2", version: "v2.2.8", from: "Staging", to: "Production", status: "success", deployedBy: "Sarah Chen", timestamp: "1 week ago", workflows: 4 },
  { id: "dep3", version: "v2.2.5", from: "Draft", to: "Staging", status: "failed", deployedBy: "Gouhar Ali", timestamp: "2 weeks ago", workflows: 5 },
  { id: "dep4", version: "v2.2.0", from: "Staging", to: "Production", status: "success", deployedBy: "System", timestamp: "3 weeks ago", workflows: 3 },
];

interface VersionDiff {
  workflow: string;
  draftVersion: string;
  stagingVersion: string;
  status: "modified" | "new" | "unchanged" | "removed";
}

const mockDiffs: VersionDiff[] = [
  { workflow: "Lead Qualification Pipeline", draftVersion: "v12", stagingVersion: "v10", status: "modified" },
  { workflow: "Error Alert Handler", draftVersion: "v3", stagingVersion: "—", status: "new" },
  { workflow: "Customer Onboarding Flow", draftVersion: "v8", stagingVersion: "v8", status: "unchanged" },
  { workflow: "Invoice Processing Pipeline", draftVersion: "v15", stagingVersion: "v14", status: "modified" },
  { workflow: "Legacy Email Importer", draftVersion: "—", stagingVersion: "v2", status: "removed" },
];

const diffStatusColors = {
  modified: "bg-blue-50 text-blue-600",
  new: "bg-green-50 text-green-600",
  unchanged: "bg-zinc-50 text-zinc-400",
  removed: "bg-red-50 text-red-600",
};

/* Environment variables comparison */
interface EnvVar {
  key: string;
  draft: string;
  staging: string;
  production: string;
  secret: boolean;
  diff: "same" | "differs" | "missing";
}

const envVars: EnvVar[] = [
  { key: "BASE_URL", draft: "http://localhost:3000", staging: "https://staging.flowholt.com", production: "https://app.flowholt.com", secret: false, diff: "differs" },
  { key: "API_KEY", draft: "sk-dev-xxx", staging: "sk-stg-xxx", production: "sk-prod-xxx", secret: true, diff: "differs" },
  { key: "DATABASE_URL", draft: "postgres://localhost/dev", staging: "postgres://staging-db/main", production: "postgres://prod-cluster/main", secret: true, diff: "differs" },
  { key: "LOG_LEVEL", draft: "debug", staging: "info", production: "warn", secret: false, diff: "differs" },
  { key: "MAX_RETRIES", draft: "5", staging: "5", production: "5", secret: false, diff: "same" },
  { key: "FEATURE_AI_AGENTS", draft: "true", staging: "true", production: "false", secret: false, diff: "differs" },
  { key: "WEBHOOK_SECRET", draft: "whsec-dev", staging: "whsec-stg", production: "whsec-prod", secret: true, diff: "differs" },
  { key: "CACHE_TTL", draft: "60", staging: "300", production: "600", secret: false, diff: "differs" },
];

/* Stage usage metrics */
const stageUsage: Record<string, { requests: string; errors: string; p95: string; uptime: string }> = {
  Draft: { requests: "2.1K", errors: "124", p95: "340ms", uptime: "99.1%" },
  Staging: { requests: "8.5K", errors: "12", p95: "180ms", uptime: "99.8%" },
  Production: { requests: "142K", errors: "47", p95: "95ms", uptime: "99.97%" },
};

export function EnvironmentPage() {
  const [comparePair, setComparePair] = useState<[string, string]>(["Draft", "Staging"]);
  const [activeTab, setActiveTab] = useState<EnvTab>("Pipeline");
  const [showSecrets, setShowSecrets] = useState(false);

  return (
    <div className="mx-auto max-w-[1020px] px-8 py-8">
      <PageHeader
        title="Environment"
        description="Deployment stages, version comparison, and promotion."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md">
              <GitCompare size={13} /> Compare
            </Button>
            <Button variant="primary" size="md">
              <Upload size={14} strokeWidth={2.5} />
              Promote to Staging
            </Button>
          </div>
        }
      />

      {/* Pipeline visualization */}
      <div className="mt-6 flex items-center gap-3">
        {stages.map((stage, i) => (
          <div key={stage.name} className="flex items-center gap-3 flex-1">
            <StageCard stage={stage} usage={stageUsage[stage.name]} />
            {i < stages.length - 1 && (
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <ArrowRight size={16} className="text-zinc-300" />
                <span className="text-[9px] text-zinc-300">promote</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-0" style={{ borderBottom: "1px solid var(--color-border-default)" }}>
        {envTabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-px",
              activeTab === t ? "border-zinc-800 text-zinc-800" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "Pipeline" && (
          <>
            {/* Version comparison */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GitCompare size={14} className="text-zinc-400" />
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">Version Comparison</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <span className="font-medium">{comparePair[0]}</span>
                  <ArrowRight size={10} className="text-zinc-300" />
                  <span className="font-medium">{comparePair[1]}</span>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs divide-y divide-zinc-50">
                <div className="flex items-center px-5 py-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                  <span className="flex-1">Workflow</span>
                  <span className="w-20 text-center">{comparePair[0]}</span>
                  <span className="w-20 text-center">{comparePair[1]}</span>
                  <span className="w-24 text-right">Status</span>
                </div>
                {mockDiffs.map((diff, i) => (
                  <div key={i} className="flex items-center px-5 py-2.5">
                    <div className="flex-1 flex items-center gap-2">
                      <GitBranch size={12} className="text-zinc-300" />
                      <span className={cn("text-[13px]", diff.status === "removed" ? "line-through text-zinc-400" : "text-zinc-700")}>{diff.workflow}</span>
                    </div>
                    <span className="w-20 text-center font-mono text-[11px] text-zinc-500">{diff.draftVersion}</span>
                    <span className="w-20 text-center font-mono text-[11px] text-zinc-500">{diff.stagingVersion}</span>
                    <div className="w-24 flex justify-end">
                      <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-medium capitalize", diffStatusColors[diff.status])}>
                        {diff.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "Variables" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-zinc-500">{envVars.length} variables across all stages</p>
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600"
              >
                {showSecrets ? <Lock size={11} /> : <Lock size={11} />}
                {showSecrets ? "Hide secrets" : "Show secrets"}
              </button>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs divide-y divide-zinc-50">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] px-5 py-2 text-[10px] font-medium text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                <span>Variable</span>
                <span>Draft</span>
                <span>Staging</span>
                <span>Production</span>
                <span className="text-right">Status</span>
              </div>
              {envVars.map((v) => (
                <div key={v.key} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] items-center px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    {v.secret && <Lock size={10} className="text-amber-400" />}
                    <code className="text-[11px] font-mono font-medium text-zinc-800">{v.key}</code>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 truncate pr-2">{v.secret && !showSecrets ? "••••••" : v.draft}</span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate pr-2">{v.secret && !showSecrets ? "••••••" : v.staging}</span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate pr-2">{v.secret && !showSecrets ? "••••••" : v.production}</span>
                  <div className="flex justify-end">
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded text-[9px] font-medium",
                      v.diff === "same" ? "bg-zinc-50 text-zinc-400" : v.diff === "differs" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {v.diff}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Deployments" && (
          <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs divide-y divide-zinc-50">
            {mockDeployments.map((dep) => (
              <div key={dep.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50/50 transition-colors">
                {dep.status === "success" ? (
                  <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                ) : dep.status === "failed" ? (
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                ) : (
                  <Clock size={15} className="text-blue-500 flex-shrink-0 animate-pulse" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Tag size={11} className="text-zinc-400" />
                    <span className="text-[13px] font-medium text-zinc-800">{dep.version}</span>
                    <span className="text-[11px] text-zinc-400">{dep.from} → {dep.to}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{dep.workflows} workflows • by {dep.deployedBy}</p>
                </div>
                <Badge variant={dep.status === "success" ? "success" : dep.status === "failed" ? "danger" : "info"}>
                  {dep.status === "in_progress" ? "deploying" : dep.status}
                </Badge>
                <span className="text-[11px] text-zinc-400 w-20 text-right">{dep.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StageCard({ stage, usage }: { stage: Stage; usage?: { requests: string; errors: string; p95: string; uptime: string } }) {
  return (
    <div className="flex-1 rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Server size={13} className="text-zinc-400" />
          <h3 className="text-[14px] font-medium text-zinc-800">{stage.name}</h3>
        </div>
        <StatusDot
          status={stage.health === "healthy" ? "healthy" : stage.health === "warning" ? "warning" : "error"}
          label={stage.health}
        />
      </div>
      <div className="space-y-1.5 text-[12px]">
        <div className="flex justify-between">
          <span className="text-zinc-400">Version</span>
          <span className="font-mono font-medium text-zinc-600">{stage.version}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Workflows</span>
          <span className="font-medium text-zinc-600">{stage.workflows}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Last Deploy</span>
          <span className="font-medium text-zinc-600">{stage.lastDeploy}</span>
        </div>
      </div>
      {usage && (
        <div className="mt-3 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-[10px]">
          <div><span className="text-zinc-400">Requests</span> <span className="font-semibold text-zinc-600 ml-1">{usage.requests}</span></div>
          <div><span className="text-zinc-400">Errors</span> <span className="font-semibold text-red-500 ml-1">{usage.errors}</span></div>
          <div><span className="text-zinc-400">P95</span> <span className="font-semibold text-zinc-600 ml-1">{usage.p95}</span></div>
          <div><span className="text-zinc-400">Uptime</span> <span className="font-semibold text-green-600 ml-1">{usage.uptime}</span></div>
        </div>
      )}
    </div>
  );
}
