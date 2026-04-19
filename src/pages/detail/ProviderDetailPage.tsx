import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Cpu, Shield, Layers, BarChart3, Clock, FileText,
  CheckCircle2, AlertTriangle, Gauge,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

const provider = {
  id: "prov-001",
  name: "OpenAI",
  type: "AI Model",
  status: "healthy" as const,
  authMode: "API Key",
  models: 8,
  lastVerified: "2 min ago",
  usageOps: "142K",
  createdAt: "Nov 1, 2025",
  baseUrl: "https://api.openai.com/v1",
};

const models = [
  { name: "GPT-4o", type: "Chat", status: "available", latency: "1.2s", costPer1k: "$0.015" },
  { name: "GPT-4o-mini", type: "Chat", status: "available", latency: "0.4s", costPer1k: "$0.0003" },
  { name: "GPT-4 Turbo", type: "Chat", status: "available", latency: "2.1s", costPer1k: "$0.030" },
  { name: "o1", type: "Reasoning", status: "available", latency: "8.5s", costPer1k: "$0.060" },
  { name: "text-embedding-3-large", type: "Embedding", status: "available", latency: "0.1s", costPer1k: "$0.0001" },
  { name: "text-embedding-3-small", type: "Embedding", status: "available", latency: "0.08s", costPer1k: "$0.00002" },
  { name: "dall-e-3", type: "Image", status: "available", latency: "4.5s", costPer1k: "$0.040" },
  { name: "whisper-1", type: "Audio", status: "available", latency: "2.0s", costPer1k: "$0.006" },
];

const rateLimits = [
  { tier: "GPT-4o", rpm: "500", tpm: "300,000", rpd: "10,000", used: 42 },
  { tier: "GPT-4o-mini", rpm: "5,000", tpm: "4,000,000", rpd: "100,000", used: 18 },
  { tier: "Embeddings", rpm: "10,000", tpm: "10,000,000", rpd: "—", used: 6 },
];

const auditEvents = [
  { action: "Health check passed", time: "2 min ago" },
  { action: "API key rotated", time: "14 days ago" },
  { action: "Rate limit warning (GPT-4o)", time: "3 days ago" },
  { action: "Provider added", time: "Nov 1, 2025" },
];

const modelTypeColors: Record<string, string> = {
  Chat: "bg-blue-50 text-blue-600",
  Reasoning: "bg-purple-50 text-purple-600",
  Embedding: "bg-teal-50 text-teal-600",
  Image: "bg-amber-50 text-amber-600",
  Audio: "bg-pink-50 text-pink-600",
};

const tabs = [
  { id: "overview", label: "Overview", icon: <Cpu size={13} /> },
  { id: "auth", label: "Authentication", icon: <Shield size={13} /> },
  { id: "models", label: "Models", icon: <Layers size={13} /> },
  { id: "limits", label: "Rate Limits", icon: <Gauge size={13} /> },
  { id: "usage", label: "Usage", icon: <BarChart3 size={13} /> },
  { id: "audit", label: "Audit", icon: <FileText size={13} /> },
];

export function ProviderDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <EntityDetailLayout
      backLabel="Providers"
      backTo="/providers"
      name={provider.name}
      status={{ label: provider.status, variant: "success" }}
      subtitle={`${provider.type} • ${provider.models} models • ${provider.authMode}`}
      icon={<Cpu size={18} className="text-purple-500" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="secondary" size="sm"><CheckCircle2 size={12} /> Verify</Button>
          <Button variant="secondary" size="sm" className="text-red-600 border-red-200">Disconnect</Button>
        </>
      }
    >
      {activeTab === "overview" && (
        <div className="space-y-5">
          <DetailSection title="Provider Info">
            <DetailRow label="Type" value={<Badge variant="info">{provider.type}</Badge>} />
            <DetailRow label="Base URL" value={<code className="font-mono text-[11px] bg-zinc-50 px-2 py-0.5 rounded">{provider.baseUrl}</code>} />
            <DetailRow label="Auth Mode" value={provider.authMode} />
            <DetailRow label="Models Available" value={provider.models.toString()} />
            <DetailRow label="Last Verified" value={provider.lastVerified} />
            <DetailRow label="Added" value={provider.createdAt} />
          </DetailSection>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Operations (30d)" value={provider.usageOps} />
            <MiniStat label="Models" value={provider.models.toString()} />
            <MiniStat label="Health" value="99.9%" color="green" />
          </div>
        </div>
      )}

      {activeTab === "auth" && (
        <div className="space-y-5">
          <DetailSection title="Authentication Configuration">
            <DetailRow label="Auth Method" value={<Badge variant="neutral">{provider.authMode}</Badge>} />
            <DetailRow label="Credential" value="OpenAI Production Key" />
            <DetailRow label="Header" value={<code className="font-mono text-[11px] bg-zinc-50 px-2 py-0.5 rounded">Authorization: Bearer sk-****7kQf</code>} />
            <DetailRow label="Last Rotated" value="14 days ago" />
          </DetailSection>
          <DetailSection title="Connection Test">
            <div className="flex items-center gap-3">
              <StatusDot status="healthy" label="Connected — last verified 2 min ago" />
            </div>
            <div className="mt-3">
              <Button variant="secondary" size="sm"><CheckCircle2 size={12} /> Test Connection</Button>
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "models" && (
        <DetailSection title={`${models.length} Models Available`}>
          <div className="space-y-1.5">
            {models.map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Layers size={12} className="text-zinc-400" />
                  <span className="text-[13px] font-medium text-zinc-700">{m.name}</span>
                  <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-medium", modelTypeColors[m.type])}>{m.type}</span>
                </div>
                <div className="flex items-center gap-4 text-[12px]">
                  <span className="text-zinc-400 font-mono">{m.latency}</span>
                  <span className="text-zinc-400 font-mono">{m.costPer1k}/1K</span>
                  <StatusDot status="active" label={m.status} />
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {activeTab === "limits" && (
        <DetailSection title="Rate Limits by Tier">
          <div className="rounded-md overflow-hidden">
            <div className="flex items-center px-3 py-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
              <span className="flex-1">Tier</span>
              <span className="w-20 text-center">RPM</span>
              <span className="w-24 text-center">TPM</span>
              <span className="w-20 text-center">RPD</span>
              <span className="w-24 text-right">Used</span>
            </div>
            {rateLimits.map((rl, i) => (
              <div key={i} className="flex items-center px-3 py-2.5 border-b border-zinc-50 last:border-0">
                <span className="flex-1 text-[13px] text-zinc-700">{rl.tier}</span>
                <span className="w-20 text-center font-mono text-[12px] text-zinc-500">{rl.rpm}</span>
                <span className="w-24 text-center font-mono text-[12px] text-zinc-500">{rl.tpm}</span>
                <span className="w-20 text-center font-mono text-[12px] text-zinc-500">{rl.rpd}</span>
                <div className="w-24 flex items-center justify-end gap-2">
                  <div className="w-12 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div className={cn("h-full rounded-full", rl.used > 50 ? "bg-amber-500" : "bg-zinc-400")} style={{ width: `${rl.used}%` }} />
                  </div>
                  <span className="text-[11px] text-zinc-400 w-6 text-right">{rl.used}%</span>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {activeTab === "usage" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Requests (30d)" value="142K" />
            <MiniStat label="Tokens (30d)" value="48.2M" />
            <MiniStat label="Cost (30d)" value="$724.80" />
          </div>
          <DetailSection title="Top Models by Usage">
            {[
              { name: "GPT-4o", pct: 58, calls: "82.4K" },
              { name: "GPT-4o-mini", pct: 28, calls: "39.8K" },
              { name: "text-embedding-3-large", pct: 10, calls: "14.2K" },
              { name: "Others", pct: 4, calls: "5.6K" },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-50 last:border-0">
                <span className="text-[13px] text-zinc-700 flex-1">{m.name}</span>
                <span className="text-[12px] text-zinc-400 font-mono w-16 text-right">{m.calls}</span>
                <div className="w-24 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-400" style={{ width: `${m.pct}%` }} />
                </div>
                <span className="text-[11px] text-zinc-400 w-8 text-right">{m.pct}%</span>
              </div>
            ))}
          </DetailSection>
        </div>
      )}

      {activeTab === "audit" && (
        <DetailSection title="Audit Trail">
          <div className="space-y-1.5">
            {auditEvents.map((event, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border border-zinc-50 px-3 py-2.5">
                <div className="h-2 w-2 rounded-full bg-zinc-200" />
                <span className="text-[13px] text-zinc-700 flex-1">{event.action}</span>
                <span className="text-[11px] text-zinc-400">{event.time}</span>
              </div>
            ))}
          </div>
        </DetailSection>
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
