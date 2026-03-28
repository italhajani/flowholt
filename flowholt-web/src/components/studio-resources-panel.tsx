"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { IconChevronDown, IconIntegrations, IconSparkles, IconWorkflows } from "@/components/icons";
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

function DrawerSection({
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
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="border-b border-black/8 py-3 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[#f5f4ed] text-stone-500">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-stone-950">{title}</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-stone-400">
          {badge ? (
            <span className="rounded-[999px] border border-black/8 px-2 py-0.5 text-[10px] font-medium text-stone-500">
              {badge}
            </span>
          ) : null}
          <IconChevronDown className="h-4 w-4" />
        </div>
      </summary>
      <div className="pt-3">{children}</div>
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
    <div className="flex h-full min-h-0 flex-col bg-white text-sm leading-6 text-stone-700">
      <div className="shrink-0 border-b border-black/8 pb-3">
        <div className="flex items-start justify-between gap-3 pb-3">
          <div>
            <p className="text-[13px] font-medium text-stone-950">Resources</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">Workspace packs, setup status, and quick launch ideas.</p>
          </div>
          <span className="rounded-[999px] border border-black/8 px-2 py-0.5 text-[10px] font-medium text-stone-500">
            {summary.totalKits} total
          </span>
        </div>

        <div className="flex items-end gap-4">
          {(["overview", "workflow", "provider"] as ResourceTab[]).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative pb-2 text-[13px] transition-smooth ${
                  active ? "font-medium text-stone-950" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {tabLabels[tab]}
                {active ? <span className="absolute inset-x-0 -bottom-px h-0.5 bg-stone-950" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-1">
        <DrawerSection
          icon={<IconSparkles className="h-3.5 w-3.5" />}
          title="Workspace readiness"
          subtitle="How much of this workspace is ready to use right now."
          badge={`${summary.readyKits}/${summary.totalKits}`}
          defaultOpen
        >
          <div className="flex flex-wrap gap-2">
            <span className="rounded-[999px] border border-black/8 px-2.5 py-1 text-[11px] text-stone-600">Ready {summary.readyKits}</span>
            <span className="rounded-[999px] border border-black/8 px-2.5 py-1 text-[11px] text-stone-600">Workflow {summary.workflowPacks}</span>
            <span className="rounded-[999px] border border-black/8 px-2.5 py-1 text-[11px] text-stone-600">Provider {summary.providerPacks}</span>
          </div>
        </DrawerSection>

        {resourceSuggestions.length > 0 && activeTab === "overview" ? (
          <DrawerSection
            icon={<IconWorkflows className="h-3.5 w-3.5" />}
            title="Suggested from your packs"
            subtitle="Use one of these ideas directly in the assistant."
            badge={`${resourceSuggestions.length}`}
            defaultOpen
          >
            <div className="space-y-3">
              {resourceSuggestions.slice(0, 3).map((suggestion) => (
                <div key={suggestion.id} className="space-y-2 border-b border-black/8 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium text-stone-950">{suggestion.title}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-500">{suggestion.why}</p>
                    </div>
                    <span className={`rounded-[999px] border px-2 py-0.5 text-[10px] font-medium ${readinessStyles[suggestion.readiness]}`}>
                      {readinessLabels[suggestion.readiness]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={buildAssistantHref(workflowId, suggestion, false)} className="rounded-[6px] border border-black/10 px-3 py-1.5 text-[12px] font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]">
                      Use idea
                    </Link>
                    <Link href={buildAssistantHref(workflowId, suggestion, true)} className="rounded-[6px] border border-black/10 px-3 py-1.5 text-[12px] font-medium text-stone-900 transition-smooth hover:bg-[#f7f6f3]">
                      Preview pack
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </DrawerSection>
        ) : null}

        {packsToRender.map((kit) => {
          const suggestion = suggestionByKit.get(kit.key);
          const isActive = activeKitKey === kit.key;
          return (
            <DrawerSection
              key={kit.key}
              icon={kit.family === "workflow_pack" ? <IconWorkflows className="h-3.5 w-3.5" /> : <IconIntegrations className="h-3.5 w-3.5" />}
              title={kit.title}
              subtitle={kit.description}
              badge={readinessLabels[kit.readiness]}
              defaultOpen={isActive}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-stone-500">
                  <span className="rounded-[999px] border border-black/8 px-2 py-0.5">{familyLabels[kit.family]}</span>
                  {kit.requiredProviders.map((provider) => (
                    <span key={`${kit.key}-${provider}`} className="rounded-[999px] border border-black/8 px-2 py-0.5">
                      {provider}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-[11px] text-stone-400">Best strategy</p>
                    <p className="mt-1 text-[13px] text-stone-700">{kit.recommendedStrategy}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-400">Setup hint</p>
                    <p className="mt-1 text-[13px] text-stone-700">{kit.setupHint}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-400">Connections</p>
                    <p className="mt-1 text-[13px] text-stone-700">
                      {kit.matchingConnections.length
                        ? kit.matchingConnections.map((connection) => connection.label).join(", ")
                        : "No matching connection saved yet."}
                    </p>
                  </div>
                </div>

                {suggestion ? (
                  <div className="flex flex-wrap gap-2">
                    <Link href={buildAssistantHref(workflowId, suggestion, false)} className="rounded-[6px] border border-black/10 px-3 py-1.5 text-[12px] font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]">
                      Use in assistant
                    </Link>
                    <Link href={buildAssistantHref(workflowId, suggestion, true)} className="rounded-[6px] border border-black/10 px-3 py-1.5 text-[12px] font-medium text-stone-900 transition-smooth hover:bg-[#f7f6f3]">
                      Preview pack
                    </Link>
                  </div>
                ) : (
                  <Link href="/app/integrations" className="inline-flex rounded-[6px] border border-black/10 px-3 py-1.5 text-[12px] font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]">
                    Finish setup in integrations
                  </Link>
                )}
              </div>
            </DrawerSection>
          );
        })}
      </div>
    </div>
  );
}



