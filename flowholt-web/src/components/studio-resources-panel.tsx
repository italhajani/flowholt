"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

const toneStyles = {
  default: "bg-white",
  mint: "bg-[#edf5f0]",
  sand: "bg-[#f7ede1]",
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
  const workflowPacks = useMemo(
    () => allKits.filter((kit) => kit.family === "workflow_pack"),
    [allKits],
  );
  const providerPacks = useMemo(
    () => allKits.filter((kit) => kit.family === "provider_pack"),
    [allKits],
  );
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
    <div className="flex h-full min-h-0 flex-col gap-2 text-sm leading-6 text-stone-700">
      <div className="shrink-0 border border-black/8 bg-white px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Resources</p>
            <p className="mt-2 text-sm leading-6 text-stone-700">Workspace packs, setup status, and quick ways to start building.</p>
          </div>
          <span className="border border-black/8 bg-[#f6f5f2] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600">
            {summary.totalKits} total
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          <div className="border border-black/8 bg-[#faf9f7] px-2 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Ready</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">{summary.readyKits}</p>
          </div>
          <div className="border border-black/8 bg-[#faf9f7] px-2 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Workflow</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">{summary.workflowPacks}</p>
          </div>
          <div className="border border-black/8 bg-[#faf9f7] px-2 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Provider</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">{summary.providerPacks}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(["overview", "workflow", "provider"] as ResourceTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "border border-black/8 bg-stone-900 px-3 py-1.5 text-[11px] font-semibold text-white"
                  : "border border-black/8 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-600 transition-smooth hover:bg-[#f7f6f3]"
              }
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/app/integrations"
            className="border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]"
          >
            Integrations
          </Link>
          <Link
            href="/app/workflows"
            className="border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]"
          >
            Library
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {resourceSuggestions.length > 0 && activeTab === "overview" ? (
          <details className="overflow-hidden border border-black/8 bg-white">
            <summary className="cursor-pointer list-none px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">Launch from resources</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">Use a ready pack idea instead of writing the full request.</p>
                </div>
                <span className="border border-black/8 bg-[#f6f5f2] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  {resourceSuggestions.length} ideas
                </span>
              </div>
            </summary>
            <div className="border-t border-black/8 px-3 py-3 space-y-2">
              {resourceSuggestions.slice(0, 3).map((suggestion) => (
                <div key={suggestion.id} className={`border border-black/8 px-3 py-3 ${toneStyles[suggestion.tone]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{suggestion.title}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-500">{suggestion.why}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${readinessStyles[suggestion.readiness]}`}>
                      {readinessLabels[suggestion.readiness]}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={buildAssistantHref(workflowId, suggestion, false)}
                      className="border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]"
                    >
                      Use idea
                    </Link>
                    <Link
                      href={buildAssistantHref(workflowId, suggestion, true)}
                      className="border border-black/8 bg-stone-900 px-3 py-1.5 text-[11px] font-medium text-white transition-smooth hover:bg-stone-800"
                    >
                      Preview pack
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </details>
        ) : null}

        {packsToRender.map((kit) => {
          const suggestion = suggestionByKit.get(kit.key);
          const isActive = activeKitKey === kit.key;
          return (
            <details
              key={kit.key}
              className={
                `overflow-hidden border bg-white ${
                  isActive ? "border-stone-900/30 ring-1 ring-stone-900/10" : "border-black/6"
                }`
              }
            >
              <summary className="cursor-pointer list-none px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900">{kit.title}</p>
                      <span className="border border-black/8 bg-[#f6f5f2] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                        {familyLabels[kit.family]}
                      </span>
                      {isActive ? (
                        <span className="border border-black/8 bg-stone-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{kit.description}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${readinessStyles[kit.readiness]}`}>
                    {readinessLabels[kit.readiness]}
                  </span>
                </div>
              </summary>

              <div className="border-t border-black/8 px-3 py-3 space-y-2">
                <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  {kit.requiredProviders.map((provider) => (
                    <span key={`${kit.key}-${provider}`} className="rounded-full bg-[#f5f5f5] px-2.5 py-1">
                      {provider}
                    </span>
                  ))}
                  {kit.expectedProfiles.slice(0, 3).map((profile) => (
                    <span key={`${kit.key}-${profile}`} className="rounded-full bg-[#f5f5f5] px-2.5 py-1">
                      {profile.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>

                <div className="grid gap-2">
                  <div className="border border-black/8 bg-[#faf9f7] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Best strategy</p>
                    <p className="mt-1 text-sm text-stone-700">{kit.recommendedStrategy}</p>
                  </div>
                  <div className="border border-black/8 bg-[#faf9f7] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Setup hint</p>
                    <p className="mt-1 text-sm text-stone-700">{kit.setupHint}</p>
                  </div>
                  <div className="border border-black/8 bg-[#faf9f7] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Connections</p>
                    <p className="mt-1 text-sm text-stone-700">
                      {kit.matchingConnections.length
                        ? kit.matchingConnections.map((connection) => connection.label).join(", ")
                        : "No matching connection saved yet."}
                    </p>
                  </div>
                </div>

                {suggestion ? (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={buildAssistantHref(workflowId, suggestion, false)}
                      className="border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]"
                    >
                      Use in assistant
                    </Link>
                    <Link
                      href={buildAssistantHref(workflowId, suggestion, true)}
                      className="border border-black/8 bg-stone-900 px-3 py-1.5 text-[11px] font-medium text-white transition-smooth hover:bg-stone-800"
                    >
                      Preview pack
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/app/integrations"
                    className="inline-flex border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-700 transition-smooth hover:bg-[#f7f6f3]"
                  >
                    Finish setup in integrations
                  </Link>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
