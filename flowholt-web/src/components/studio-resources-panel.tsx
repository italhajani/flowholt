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
    <div className="space-y-4 text-sm leading-6 text-stone-700">
      <div className="rounded-[26px] border border-stone-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,237,230,0.96))] px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Resources</p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Workspace-ready packs, vendor clues, and direct starting points for building a cleaner flow.
            </p>
          </div>
          <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
            {summary.totalKits} total
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/85 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Workspace readiness</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{summary.readyKits} ready</p>
            <p className="text-xs text-stone-500">{summary.partialKits} partial, {summary.missingKits} missing</p>
          </div>
          <div className="rounded-2xl bg-white/85 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Workflow packs</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{summary.workflowPacks}</p>
            <p className="text-xs text-stone-500">Patterns the assistant can compose from</p>
          </div>
          <div className="rounded-2xl bg-white/85 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Provider packs</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{summary.providerPacks}</p>
            <p className="text-xs text-stone-500">Connection kits that make tools runnable</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["overview", "workflow", "provider"] as ResourceTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                  : "rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 transition hover:bg-stone-50"
              }
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/app/integrations"
            className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Open integrations
          </Link>
          <Link
            href="/app/workflows"
            className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Open workflow library
          </Link>
        </div>
      </div>

      {resourceSuggestions.length > 0 && activeTab === "overview" ? (
        <div className="rounded-[26px] border border-stone-900/10 bg-white/85 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Launch from resources</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                Start from a strong pack idea instead of writing the whole assistant request yourself.
              </p>
            </div>
            <span className="rounded-full border border-stone-900/10 bg-stone-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
              {resourceSuggestions.length} ideas
            </span>
          </div>

          <div className="mt-3 grid gap-3">
            {resourceSuggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion.id} className={`rounded-2xl border border-stone-900/10 px-4 py-4 ${toneStyles[suggestion.tone]}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{suggestion.title}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{suggestion.why}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${readinessStyles[suggestion.readiness]}`}>
                    {readinessLabels[suggestion.readiness]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  <span className="rounded-full bg-white px-3 py-1">{suggestion.strategy}</span>
                  {suggestion.profiles.slice(0, 2).map((profile) => (
                    <span key={`${suggestion.id}-${profile}`} className="rounded-full bg-white px-3 py-1">
                      {profile}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={buildAssistantHref(workflowId, suggestion, false)}
                    className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Use idea
                  </Link>
                  <Link
                    href={buildAssistantHref(workflowId, suggestion, true)}
                    className="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
                  >
                    Preview pack
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {packsToRender.map((kit) => {
          const suggestion = suggestionByKit.get(kit.key);
          const isActive = activeKitKey === kit.key;
          return (
            <div
              key={kit.key}
              className={
                `rounded-[26px] border px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${toneStyles[kit.tone]} ` +
                (isActive ? "border-stone-900/30 ring-1 ring-stone-900/10" : "border-stone-900/10")
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-stone-900">{kit.title}</p>
                    <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                      {familyLabels[kit.family]}
                    </span>
                    {isActive ? (
                      <span className="rounded-full border border-stone-900/10 bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                        Active pack
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-stone-600">{kit.description}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${readinessStyles[kit.readiness]}`}>
                  {readinessLabels[kit.readiness]}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                {kit.requiredProviders.map((provider) => (
                  <span key={`${kit.key}-${provider}`} className="rounded-full bg-white px-3 py-1">
                    provider: {provider}
                  </span>
                ))}
                {kit.expectedProfiles.map((profile) => (
                  <span key={`${kit.key}-${profile}`} className="rounded-full bg-white px-3 py-1">
                    profile: {profile.replaceAll("_", " ")}
                  </span>
                ))}
                {kit.recommendedToolKeys.map((toolKey) => (
                  <span key={`${kit.key}-${toolKey}`} className="rounded-full bg-white px-3 py-1">
                    preset: {toolKey}
                  </span>
                ))}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white/85 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Ideal for</p>
                  <p className="mt-2 text-xs leading-5 text-stone-700">{kit.idealFor}</p>
                </div>
                <div className="rounded-2xl bg-white/85 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Best strategy</p>
                  <p className="mt-2 text-xs leading-5 text-stone-700">{kit.recommendedStrategy}</p>
                </div>
              </div>

              {kit.detectedProfiles.length ? (
                <div className="mt-3 rounded-2xl bg-white/85 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Detected vendor profiles</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                    {kit.detectedProfiles.map((profile) => (
                      <span key={`${kit.key}-${profile.key}`} className="rounded-full border border-stone-900/10 bg-white px-3 py-1">
                        {profile.title}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-3 rounded-2xl bg-white/85 px-3 py-3 text-xs leading-5 text-stone-600">
                <p>{kit.readinessDetail}</p>
                <p className="mt-2">Setup hint: {kit.setupHint}</p>
                <p className="mt-2">
                  {kit.matchingConnections.length
                    ? `Connected: ${kit.matchingConnections.map((connection) => connection.label).join(", ")}`
                    : "No matching connection saved yet."}
                </p>
              </div>

              {suggestion ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={buildAssistantHref(workflowId, suggestion, false)}
                    className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Use in assistant
                  </Link>
                  <Link
                    href={buildAssistantHref(workflowId, suggestion, true)}
                    className="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
                  >
                    Preview from pack
                  </Link>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/app/integrations"
                    className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Finish setup in integrations
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
