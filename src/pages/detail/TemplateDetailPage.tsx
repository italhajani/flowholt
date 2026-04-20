import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  LayoutTemplate, Download, Eye, FileText, Clock, Key,
  GitBranch, CheckCircle2, AlertTriangle, Layers,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UseTemplateWizardModal } from "@/components/modals/UseTemplateWizardModal";
import { cn } from "@/lib/utils";
import { useTemplate } from "@/hooks/useApi";

const mockTemplate = {
  id: "tpl-001",
  name: "Lead Scoring with OpenAI",
  category: "Sales",
  uses: 540,
  author: "FlowHolt Team",
  version: "v2.0",
  updatedAt: "1 week ago",
  description: "Automatically score inbound leads using OpenAI GPT-4o. Captures form submissions via webhook, enriches contact data with Clearbit, runs AI scoring, and routes high-value leads to Salesforce.",
};

const requiredAssets = [
  { type: "Credential", name: "OpenAI API Key", required: true },
  { type: "Credential", name: "Clearbit API Key", required: true },
  { type: "Credential", name: "Salesforce OAuth", required: true },
  { type: "Connection", name: "Slack Workspace", required: false },
];

const steps = [
  { order: 1, name: "Webhook Trigger", type: "trigger", description: "Receives form submission payload" },
  { order: 2, name: "Clearbit Enrich", type: "integration", description: "Enriches contact with company data" },
  { order: 3, name: "Score Lead (GPT-4o)", type: "ai", description: "AI-powered lead quality scoring" },
  { order: 4, name: "Score Router", type: "logic", description: "Routes based on score threshold (>70 = hot)" },
  { order: 5, name: "Salesforce Create Lead", type: "integration", description: "Creates lead record in Salesforce" },
  { order: 6, name: "Slack Notify", type: "integration", description: "Optional: notify sales channel" },
  { order: 7, name: "Google Sheets Log", type: "integration", description: "Logs all scored leads for reporting" },
];

const changelog = [
  { version: "v2.0", date: "1 week ago", changes: "Upgraded from GPT-3.5 to GPT-4o scoring model, added Clearbit enrichment step" },
  { version: "v1.2", date: "2 months ago", changes: "Added Google Sheets logging step" },
  { version: "v1.1", date: "3 months ago", changes: "Added optional Slack notification" },
  { version: "v1.0", date: "6 months ago", changes: "Initial template release" },
];

const stepTypeColors: Record<string, string> = {
  trigger: "bg-green-50 text-green-600",
  integration: "bg-zinc-50 text-zinc-600",
  ai: "bg-zinc-900 text-white",
  logic: "bg-blue-50 text-blue-600",
};

const tabs = [
  { id: "overview", label: "Overview", icon: <LayoutTemplate size={13} /> },
  { id: "assets", label: "Required Assets", icon: <Key size={13} /> },
  { id: "steps", label: "Steps", icon: <Layers size={13} /> },
  { id: "preview", label: "Preview", icon: <Eye size={13} /> },
  { id: "install", label: "Install", icon: <Download size={13} /> },
  { id: "changelog", label: "Changelog", icon: <Clock size={13} /> },
];

export function TemplateDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [showWizard, setShowWizard] = useState(false);
  const { data: apiTemplate } = useTemplate(id);

  const template = useMemo(() => {
    if (apiTemplate) return {
      id: apiTemplate.id ?? mockTemplate.id,
      name: apiTemplate.name ?? mockTemplate.name,
      category: apiTemplate.category ?? mockTemplate.category,
      uses: apiTemplate.use_count ?? mockTemplate.uses,
      author: apiTemplate.author ?? mockTemplate.author,
      version: mockTemplate.version,
      updatedAt: mockTemplate.updatedAt,
      description: apiTemplate.description ?? mockTemplate.description,
    };
    return mockTemplate;
  }, [apiTemplate]);

  return (
    <EntityDetailLayout
      backLabel="Templates"
      backTo="/templates"
      name={template.name}
      status={{ label: template.category, variant: "info" }}
      subtitle={`by ${template.author} • ${template.uses.toLocaleString()} uses • ${template.version}`}
      icon={<LayoutTemplate size={18} className="text-zinc-500" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <Button variant="primary" size="sm" onClick={() => setShowWizard(true)}><Download size={12} /> Use Template</Button>
      }
    >
      {activeTab === "overview" && (
        <div className="space-y-5">
          <DetailSection title="About">
            <p className="text-[13px] text-zinc-600 leading-relaxed">{template.description}</p>
          </DetailSection>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Uses" value={template.uses.toLocaleString()} />
            <MiniStat label="Steps" value={steps.length.toString()} />
            <MiniStat label="Required Assets" value={requiredAssets.filter(a => a.required).length.toString()} />
          </div>

          <DetailSection title="Quick Info">
            <DetailRow label="Version" value={<span className="font-mono">{template.version}</span>} />
            <DetailRow label="Author" value={template.author} />
            <DetailRow label="Category" value={<Badge variant="info">{template.category}</Badge>} />
            <DetailRow label="Last Updated" value={template.updatedAt} />
            <DetailRow label="Trigger Type" value="Webhook" />
          </DetailSection>
        </div>
      )}

      {activeTab === "assets" && (
        <div className="space-y-5">
          <p className="text-[13px] text-zinc-500">These assets are needed to run this template. Make sure they're configured before installing.</p>
          <DetailSection title="Required Assets">
            <div className="space-y-1.5">
              {requiredAssets.map((asset, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Key size={12} className="text-zinc-400" />
                    <div>
                      <p className="text-[13px] text-zinc-700">{asset.name}</p>
                      <p className="text-[11px] text-zinc-400">{asset.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.required ? (
                      <Badge variant="danger">Required</Badge>
                    ) : (
                      <Badge variant="neutral">Optional</Badge>
                    )}
                    <AlertTriangle size={12} className="text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "steps" && (
        <DetailSection title={`${steps.length} Steps`} description="The workflow nodes included in this template">
          <div className="space-y-1.5">
            {steps.map((step) => (
              <div key={step.order} className="flex items-center gap-3 rounded-md border border-zinc-50 px-3 py-2.5">
                <span className="text-[10px] font-mono text-zinc-300 w-4">{step.order}</span>
                <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-medium capitalize", stepTypeColors[step.type])}>
                  {step.type}
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-zinc-700">{step.name}</p>
                  <p className="text-[11px] text-zinc-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {activeTab === "preview" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 overflow-hidden" style={{ minHeight: 260 }}>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Workflow Preview</p>
            <div className="relative" style={{ height: 200 }}>
              <svg className="absolute inset-0" width="100%" height="200">
                {steps.slice(0, -1).map((_, i) => {
                  const x1 = 60 + i * 130 + 50;
                  const x2 = 60 + (i + 1) * 130;
                  return (
                    <line key={i} x1={x1} y1={50} x2={x2} y2={50} stroke="#d4d4d8" strokeWidth={2} strokeDasharray="4 3" />
                  );
                })}
              </svg>
              {steps.map((step, i) => {
                const x = 60 + i * 130;
                const color = step.type === "trigger" ? "#22c55e" : step.type === "ai" ? "#7c3aed" : step.type === "logic" ? "#3b82f6" : "#a1a1aa";
                return (
                  <div key={step.order} className="absolute flex flex-col items-center" style={{ left: x - 28, top: 20 }}>
                    <div className="w-14 h-14 rounded-xl border-2 bg-white flex items-center justify-center shadow-sm" style={{ borderColor: color }}>
                      <span className="text-[11px] font-bold" style={{ color }}>{step.order}</span>
                    </div>
                    <p className="text-[9px] font-medium text-zinc-600 mt-1.5 text-center max-w-[80px] leading-tight">{step.name}</p>
                    <span className={cn("mt-0.5 rounded px-1 py-0 text-[7px] font-semibold uppercase", stepTypeColors[step.type])}>
                      {step.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <DetailSection title="Related Templates">
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Customer Onboarding with AI", uses: 320, cat: "Sales" },
                { name: "Support Ticket Classification", uses: 280, cat: "AI & ML" },
                { name: "Lead Enrichment Pipeline", uses: 410, cat: "Marketing" },
                { name: "Deal Alert Notifications", uses: 195, cat: "Sales" },
              ].map((t, i) => (
                <div key={i} className="rounded-lg border border-zinc-100 px-3 py-2.5 hover:border-zinc-200 transition-colors cursor-pointer">
                  <p className="text-[12px] font-medium text-zinc-700 truncate">{t.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info">{t.cat}</Badge>
                    <span className="text-[10px] text-zinc-400">{t.uses} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "install" && (
        <div className="space-y-5">
          <DetailSection title="Install Options">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border border-zinc-100 px-4 py-3 hover:border-zinc-200 transition-colors cursor-pointer">
                <div>
                  <p className="text-[13px] font-medium text-zinc-700">Install as new workflow</p>
                  <p className="text-[11px] text-zinc-400">Creates a new workflow from this template</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowWizard(true)}><Download size={12} /> Install</Button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-zinc-100 px-4 py-3 hover:border-zinc-200 transition-colors cursor-pointer">
                <div>
                  <p className="text-[13px] font-medium text-zinc-700">Import into existing workflow</p>
                  <p className="text-[11px] text-zinc-400">Merge template nodes into a workflow you choose</p>
                </div>
                <Button variant="secondary" size="sm">Select Workflow</Button>
              </div>
            </div>
          </DetailSection>

          <div className="rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5" />
              <div>
                <p className="text-[12px] font-medium text-amber-700">Before installing</p>
                <p className="text-[11px] text-amber-600 mt-0.5">Make sure you have the required credentials configured: OpenAI API Key, Clearbit API Key, and Salesforce OAuth.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "changelog" && (
        <DetailSection title="Changelog">
          <div className="space-y-1.5">
            {changelog.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 rounded-md border border-zinc-50 px-3 py-2.5">
                <div className="mt-1">
                  {i === 0 ? (
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-zinc-200" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-zinc-700">{entry.version}</span>
                    <span className="text-[11px] text-zinc-400">{entry.date}</span>
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-0.5">{entry.changes}</p>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      <UseTemplateWizardModal
        open={showWizard}
        onClose={() => setShowWizard(false)}
        templateName={template.name}
        templateDescription={template.description}
        credentials={requiredAssets.map((a) => ({
          name: a.name,
          type: a.type,
          required: a.required,
        }))}
        steps={steps}
      />
    </EntityDetailLayout>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs text-center">
      <p className="text-[22px] font-semibold text-zinc-800">{value}</p>
      <p className="text-[11px] text-zinc-400 mt-1">{label}</p>
    </div>
  );
}
