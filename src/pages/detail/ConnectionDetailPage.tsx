import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Plug, Shield, Lock, GitBranch, HeartPulse, FileText, Settings,
  CheckCircle2, AlertTriangle, RefreshCw, Clock, Zap, RotateCw, Download, Upload,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";
import { useTestConnection, useRotateSecret } from "@/hooks/useApi";

const connection = {
  id: "conn-001",
  name: "Salesforce Production",
  provider: "Salesforce",
  status: "healthy" as const,
  authType: "OAuth 2.0",
  scopes: ["api", "refresh_token", "full"],
  linkedWorkflows: 3,
  createdBy: "Gouhar Ali",
  createdAt: "Jan 5, 2026",
  lastVerified: "5 min ago",
  nextReauth: "45 days",
};

const healthTimeline = [
  { time: "5 min ago", status: "healthy" as const, event: "Health check passed" },
  { time: "1 hr ago", status: "healthy" as const, event: "Health check passed" },
  { time: "3 hrs ago", status: "healthy" as const, event: "Health check passed" },
  { time: "1 day ago", status: "warning" as const, event: "Rate limit warning (80% capacity)" },
  { time: "2 days ago", status: "healthy" as const, event: "Token refreshed successfully" },
  { time: "5 days ago", status: "error" as const, event: "Auth token expired — auto-refreshed" },
];

const usageMap = [
  { workflow: "Lead Qualification Pipeline", step: "Salesforce Create Lead", calls30d: 1247, lastUsed: "2 min ago" },
  { workflow: "Customer Onboarding Flow", step: "Salesforce Update Contact", calls30d: 892, lastUsed: "1 hr ago" },
  { workflow: "Daily Report Generator", step: "Salesforce Query Reports", calls30d: 30, lastUsed: "6 hrs ago" },
];

const auditEvents = [
  { action: "Health check passed", actor: "System", time: "5 min ago" },
  { action: "Token refreshed", actor: "System", time: "2 days ago" },
  { action: "Scopes updated", actor: "Gouhar Ali", time: "1 week ago" },
  { action: "Connection created", actor: "Gouhar Ali", time: "Jan 5, 2026" },
];

const tabs = [
  { id: "overview", label: "Overview", icon: <Plug size={13} /> },
  { id: "auth", label: "Authentication", icon: <Shield size={13} /> },
  { id: "permissions", label: "Permissions", icon: <Lock size={13} /> },
  { id: "usage", label: "Usage Map", icon: <GitBranch size={13} /> },
  { id: "health", label: "Health", icon: <HeartPulse size={13} /> },
  { id: "audit", label: "Audit", icon: <FileText size={13} /> },
  { id: "advanced", label: "Advanced", icon: <Settings size={13} /> },
];

export function ConnectionDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const testConn = useTestConnection();
  const rotateSec = useRotateSecret();
  const [testResult, setTestResult] = useState<{ success: boolean; checks: { check: string; status: string; detail: string }[]; latency_ms: number } | null>(null);

  const handleTest = async () => {
    if (!id) return;
    setTestResult(null);
    try {
      const result = await testConn.mutateAsync(id);
      setTestResult(result);
    } catch {
      setTestResult({ success: false, checks: [{ check: "connection", status: "fail", detail: "Test failed — check credentials" }], latency_ms: 0 });
    }
  };

  const handleRotate = () => {
    if (!id) return;
    rotateSec.mutate(id);
  };

  return (
    <EntityDetailLayout
      backLabel="Vault"
      backTo="/vault"
      name={connection.name}
      status={{ label: connection.status, variant: "success" }}
      subtitle={`${connection.provider} • ${connection.authType} • ${connection.linkedWorkflows} workflows`}
      icon={<Plug size={18} className="text-blue-500" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={handleTest} disabled={testConn.isPending}>
            {testConn.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
            {testConn.isPending ? "Testing…" : "Test Connection"}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRotate} disabled={rotateSec.isPending}>
            <RotateCw size={12} /> Rotate Secret
          </Button>
          <Button variant="secondary" size="sm">Reauthorize</Button>
        </>
      }
    >
      {activeTab === "overview" && (
        <div className="space-y-5">
          <DetailSection title="Connection Info">
            <DetailRow label="Provider" value={connection.provider} />
            <DetailRow label="Auth Type" value={<Badge variant="neutral">{connection.authType}</Badge>} />
            <DetailRow label="Status" value={<StatusDot status={connection.status} label={connection.status} />} />
            <DetailRow label="Linked Workflows" value={connection.linkedWorkflows.toString()} />
            <DetailRow label="Created By" value={connection.createdBy} />
            <DetailRow label="Created" value={connection.createdAt} />
            <DetailRow label="Last Verified" value={connection.lastVerified} />
          </DetailSection>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Workflows" value={connection.linkedWorkflows.toString()} />
            <MiniStat label="API Calls (30d)" value="2,169" />
            <MiniStat label="Uptime (30d)" value="99.8%" color="green" />
          </div>

          {/* Connection Test Results */}
          {testResult && (
            <div className={cn(
              "rounded-lg border p-4",
              testResult.success ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? <CheckCircle2 size={14} className="text-green-600" /> : <AlertTriangle size={14} className="text-red-600" />}
                <span className={cn("text-[13px] font-medium", testResult.success ? "text-green-800" : "text-red-800")}>
                  {testResult.success ? "Connection test passed" : "Connection test failed"}
                </span>
                {testResult.latency_ms > 0 && (
                  <span className="text-[11px] text-zinc-500 ml-auto">{testResult.latency_ms}ms</span>
                )}
              </div>
              <div className="space-y-1 ml-5">
                {testResult.checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      c.status === "pass" ? "bg-green-500" : c.status === "warn" ? "bg-amber-500" : c.status === "skip" ? "bg-zinc-300" : "bg-red-500"
                    )} />
                    <span className="text-zinc-600">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rotateSec.isSuccess && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
              <p className="text-[12px] text-blue-800">Secret rotation scheduled successfully.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "auth" && (
        <div className="space-y-5">
          <DetailSection title="OAuth 2.0 Configuration">
            <DetailRow label="Auth Type" value={<Badge variant="info">OAuth 2.0</Badge>} />
            <DetailRow label="Token Status" value={<StatusDot status="active" label="Valid" />} />
            <DetailRow label="Token Expires" value="45 days" />
            <DetailRow label="Auto-Refresh" value={<Badge variant="success">Enabled</Badge>} />
            <DetailRow label="Last Refresh" value="2 days ago" />
            <DetailRow label="Redirect URI" value={<code className="font-mono text-[11px] bg-zinc-50 px-2 py-0.5 rounded">https://flowholt.com/oauth/callback</code>} />
          </DetailSection>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Refresh Token Now</Button>
            <Button variant="secondary" size="sm" className="text-amber-600 border-amber-200">Reauthorize</Button>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="space-y-5">
          <DetailSection title="Authorized Scopes">
            <div className="space-y-1.5">
              {connection.scopes.map((scope) => (
                <div key={scope} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Lock size={12} className="text-zinc-400" />
                    <code className="font-mono text-[12px] text-zinc-700">{scope}</code>
                  </div>
                  <CheckCircle2 size={13} className="text-green-400" />
                </div>
              ))}
            </div>
          </DetailSection>

          <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
            <p className="text-[12px] text-blue-700">To modify scopes, you'll need to reauthorize the connection. This won't affect existing workflows.</p>
          </div>
        </div>
      )}

      {activeTab === "usage" && (
        <DetailSection title="Usage Across Workflows" description={`${connection.linkedWorkflows} workflows use this connection`}>
          <div className="space-y-1.5">
            {usageMap.map((wf, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2.5 hover:bg-zinc-50/50 transition-colors cursor-pointer">
                <div>
                  <p className="text-[13px] font-medium text-zinc-700">{wf.workflow}</p>
                  <p className="text-[11px] text-zinc-400">Step: {wf.step}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-mono text-zinc-600">{wf.calls30d.toLocaleString()} calls</p>
                  <p className="text-[10px] text-zinc-400">{wf.lastUsed}</p>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {activeTab === "health" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <StatusDot status="healthy" label="Currently healthy" />
            <span className="text-[12px] text-zinc-400">• Last checked {connection.lastVerified}</span>
          </div>
          <DetailSection title="Health Timeline">
            <div className="space-y-1.5">
              {healthTimeline.map((event, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md border border-zinc-50 px-3 py-2.5">
                  <StatusDot status={event.status === "healthy" ? "healthy" : event.status === "warning" ? "warning" : "error"} />
                  <span className="text-[13px] text-zinc-700 flex-1">{event.event}</span>
                  <span className="text-[11px] text-zinc-400">{event.time}</span>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "audit" && (
        <DetailSection title="Audit Trail">
          <div className="space-y-1.5">
            {auditEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-3 rounded-md border border-zinc-50 px-3 py-2.5">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-zinc-200 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] text-zinc-700"><span className="font-medium">{event.actor}</span> — {event.action}</p>
                </div>
                <span className="text-[11px] text-zinc-400">{event.time}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {activeTab === "advanced" && (
        <div className="space-y-5">
          <DetailSection title="Advanced Settings">
            <DetailRow label="Request Timeout" value={<span className="font-mono">30s</span>} />
            <DetailRow label="Retry on Failure" value={<Badge variant="success">Enabled (3 retries)</Badge>} />
            <DetailRow label="Rate Limit Strategy" value="Exponential backoff" />
            <DetailRow label="Custom Headers" value={<span className="text-zinc-400">None</span>} />
          </DetailSection>

          <DetailSection title="Danger Zone">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-zinc-700">Disable connection</p>
                  <p className="text-[11px] text-zinc-400">Workflows using this connection will fail.</p>
                </div>
                <Button variant="secondary" size="sm" className="text-amber-600 border-amber-200">Disable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-zinc-700">Delete connection</p>
                  <p className="text-[11px] text-zinc-400">This action cannot be undone.</p>
                </div>
                <Button variant="secondary" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
              </div>
            </div>
          </DetailSection>
        </div>
      )}
    </EntityDetailLayout>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: "green" | "red" }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs text-center">
      <p className={cn("text-[22px] font-semibold", color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : "text-zinc-800")}>{value}</p>
      <p className="text-[11px] text-zinc-400 mt-1">{label}</p>
    </div>
  );
}
