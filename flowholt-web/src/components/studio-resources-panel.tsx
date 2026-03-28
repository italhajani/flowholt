"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { IconChevronDown, IconIntegrations, IconWorkflows } from "@/components/icons";
import { buildToolMarketplace, buildToolMarketplaceSummary } from "@/lib/flowholt/tool-marketplace";

type ResourceSuggestion = {
  id: string;
  kitKey: string;
  title: string;
  readiness: "ready" | "partial" | "missing";
  tone: "default" | "mint" | "sand";
  prompt: string;
  strategy: string;
  why: string;
  profiles: string[];
};

type StudioResourcesPanelProps = {
  workflowId: string;
  activeKitKey?: string;
  integrations: Array<{
    id: string;
    provider: string;
    label: string;
    description?: string;
    config?: Record<string, unknown>;
  }>;
  resourceSuggestions?: ResourceSuggestion[];
};

type ResourceTab = "overview" | "workflow" | "provider";

const readinessStyles = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  missing: "border-stone-200 bg-stone-100 text-stone-700",
};

const readinessLabels = {
  ready: "Ready",
  partial: "Partial",
  missing: "Missing",
};

const familyLabels = {
  provider_pack: "Provider pack",
  workflow_pack: "Workflow pack",
};

const tabLabels: Record<ResourceTab, string> = {
  overview: "Overview",
  workflow: "Workflow packs",
  provider: "Provider packs",
};

function buildAssistantHref(workflowId: string, suggestion: ResourceSuggestion, autoPreview = false) {
  const params = new URLSearchParams();
  params.set("assistant", suggestion.prompt);
  params.set("kit", suggestion.kitKey);
  if (autoPreview) {
    params.set("previewPack", "1");
  }
  return `/app/studio/${workflowId}?${params.toString()}`;
}

function ResourceSection({
  icon,
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="studio-sidepanel-section">
      <summary className="studio-sidepanel-summary">
        <div className="studio-sidepanel-summary-left">
          <div className="studio-sidepanel-icon">{icon}</div>
          <div className="min-w-0">
            <p className="studio-sidepanel-title truncate">{title}</p>
            <p className="studio-sidepanel-subtitle truncate">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <IconChevronDown className="studio-sidepanel-chevron h-4 w-4" />
        </div>
      </summary>
      <div className="studio-sidepanel-body pl-[38px]">{children}</div>
    </details>
  );
}

export function StudioResourcesPanel({
  workflowId,
  activeKitKey = "",
  integrations,
  resourceSuggestions = [],
}: StudioResourcesPanelProps) {
  const [activeTab, setActiveTab] = useState<ResourceTab>("overview");
  const categories = useMemo(() => buildToolMarketplace(integrations), [integrations]);
  const summary = useMemo(() => buildToolMarketplaceSummary(categories), [categories]);
  const allKits = useMemo(() => categories.flatMap((category) => category.kits), [categories]);
  const workflowPacks = useMemo(() => allKits.filter((kit) => kit.family === "workflow_pack"), [allKits]);
  const providerPacks = useMemo(() => allKits.filter((kit) => kit.family === "provider_pack"), [allKits]);
  const suggestionByKit = useMemo(
    () => new Map(resourceSuggestions.map((suggestion) => [suggestion.kitKey, suggestion])),
    [resourceSuggestions],
  );

  const packsToRender =
    activeTab === "workflow"
      ? workflowPacks
      : activeTab === "provider"
        ? providerPacks
        : summary.featuredKits;

  return (
    <div className="space-y-0 text-sm text-stone-700">
      <div className="border-b border-black/8 pb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[12.5px] font-medium text-stone-950">Resources</p>
            <p className="mt-1 text-[11px] leading-5 text-stone-500">Workspace packs, setup status, and quick launch ideas.</p>
          </div>
          <span className="studio-sidepanel-pill">{summary.totalKits} total</span>
        </div>
        <div className="studio-sidepanel-subtabs">
          {(["overview", "workflow", "provider"] as ResourceTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              data-active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className="studio-sidepanel-subtab"
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div className="mt-3 border border-black/8 bg-[#fafaf9] px-3 py-3">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.05em] text-stone-400">Workspace readiness</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-stone-950" style={{ width: `${summary.totalKits ? (summary.readyKits / summary.totalKits) * 100 : 0}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Ready {summary.readyKits}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Partial {summary.partialKits}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-stone-400" />Missing {summary.missingKits}</span>
          </div>
        </div>
      </div>

      {resourceSuggestions.length > 0 && activeTab === "overview" ? (
        <div className="border-b border-black/8 py-3">
          <div className="mb-3 flex items-start gap-3">
            <div className="studio-sidepanel-icon h-6 w-6"><IconWorkflows className="h-3.5 w-3.5" /></div>
            <div>
              <p className="studio-sidepanel-title">Suggested from your packs</p>
              <p className="studio-sidepanel-subtitle">Launch one of these ideas directly in the assistant.</p>
            </div>
          </div>
          <div className="space-y-3 pl-[38px]">
            {resourceSuggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion.id} className="border border-black/8 bg-[#fafaf9] px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium text-stone-950">{suggestion.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-stone-500">{suggestion.why}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${readinessStyles[suggestion.readiness]}`}>
                    {readinessLabels[suggestion.readiness]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={buildAssistantHref(workflowId, suggestion, false)} className="studio-sidepanel-button">
                    Use idea
                  </Link>
                  <Link href={buildAssistantHref(workflowId, suggestion, true)} className="studio-sidepanel-button studio-sidepanel-button--primary">
                    Preview pack
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        {packsToRender.map((kit) => {
          const suggestion = suggestionByKit.get(kit.key);
          const isActive = activeKitKey === kit.key;
          return (
            <ResourceSection
              key={kit.key}
              icon={kit.family === "workflow_pack" ? <IconWorkflows className="h-3.5 w-3.5" /> : <IconIntegrations className="h-3.5 w-3.5" />}
              title={kit.title}
              subtitle={kit.description}
              badge={<span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${readinessStyles[kit.readiness]}`}>{readinessLabels[kit.readiness]}</span>}
              defaultOpen={isActive}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="studio-sidepanel-pill">{familyLabels[kit.family]}</span>
                  {kit.requiredProviders.map((provider) => (
                    <span key={`${kit.key}-${provider}`} className="studio-sidepanel-pill">{provider}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-stone-400">Best strategy</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-stone-600">{kit.recommendedStrategy}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-stone-400">Setup hint</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-stone-600">{kit.setupHint}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-stone-400">Connections</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-stone-600">
                      {kit.matchingConnections.length
                        ? kit.matchingConnections.map((connection) => connection.label).join(", ")
                        : "No matching connection saved yet."}
                    </p>
                  </div>
                </div>
                {suggestion ? (
                  <div className="flex flex-wrap gap-2">
                    <Link href={buildAssistantHref(workflowId, suggestion, false)} className="studio-sidepanel-button">
                      Use in assistant
                    </Link>
                    <Link href={buildAssistantHref(workflowId, suggestion, true)} className="studio-sidepanel-button studio-sidepanel-button--primary">
                      Preview pack
                    </Link>
                  </div>
                ) : (
                  <Link href="/app/integrations" className="studio-sidepanel-button">
                    Finish setup in integrations
                  </Link>
                )}
              </div>
            </ResourceSection>
          );
        })}
      </div>
    </div>
  );
}

