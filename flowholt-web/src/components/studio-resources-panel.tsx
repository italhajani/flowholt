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
    <div className="flex h-full min-h-0 flex-col gap-3 text-sm leading-6 text-stone-700">
      <div className="shrink-0 rounded-[22px] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,237,230,0.96))] px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Resources</p>
            <p className="mt-2 text-sm leading-6 text-stone-700">Workspace packs, setup status, and quick ways to start building.</p>
          </div>
          <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600">
            {summary.totalKits} total
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[14px] bg-white/90 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Ready</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">{summary.readyKits}</p>
          </div>
          <div className="rounded-[14px] bg-white/90 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Workflow</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">{summary.workflowPacks}</p>
          </div>
          <div className="rounded-[14px] bg-white/90 px-3 py-3">
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
                  ? "rounded-[10px] bg-stone-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                  : "rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 transition hover:bg-stone-50"
              }
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/app/integrations"
            className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Integrations
          </Link>
          <Link
            href="/app/workflows"
            className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Library
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {resourceSuggestions.length > 0 && activeTab === "overview" ? (
          <details className="overflow-hidden rounded-[18px] border border-black/6 bg-white">
            <summary className="cursor-pointer list-none px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">Launch from resources</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">Use a ready pack idea instead of writing the full request.</p>
                </div>
                <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  {resourceSuggestions.length} ideas
                </span>
              </div>
            </summary>
            <div className="border-t border-black/6 px-4 py-4 space-y-2">
              {resourceSuggestions.slice(0, 3).map((suggestion) => (
                <div key={suggestion.id} className={`rounded-[16px] border border-black/6 px-3 py-3 ${toneStyles[suggestion.tone]}`}>
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
                      className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      Use idea
                    </Link>
                    <Link
                      href={buildAssistantHref(workflowId, suggestion, true)}
                      className="rounded-[10px] bg-stone-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
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
                `overflow-hidden rounded-[18px] border bg-white ${
                  isActive ? "border-stone-900/30 ring-1 ring-stone-900/10" : "border-black/6"
                }`
              }
            >
              <summary className="cursor-pointer list-none px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900">{kit.title}</p>
                      <span className="rounded-full border border-black/8 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                        {familyLabels[kit.family]}
                      </span>
                      {isActive ? (
                        <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
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

              <div className="border-t border-black/6 px-4 py-4 space-y-3">
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
                  <div className="rounded-[14px] bg-[#fafafa] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Best strategy</p>
                    <p className="mt-1 text-sm text-stone-700">{kit.recommendedStrategy}</p>
                  </div>
                  <div className="rounded-[14px] bg-[#fafafa] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Setup hint</p>
                    <p className="mt-1 text-sm text-stone-700">{kit.setupHint}</p>
                  </div>
                  <div className="rounded-[14px] bg-[#fafafa] px-3 py-3">
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
                      className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      Use in assistant
                    </Link>
                    <Link
                      href={buildAssistantHref(workflowId, suggestion, true)}
                      className="rounded-[10px] bg-stone-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
                    >
                      Preview pack
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/app/integrations"
                    className="inline-flex rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
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