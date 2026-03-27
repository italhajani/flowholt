import Link from "next/link";

import { buildToolMarketplace, buildToolMarketplaceSummary } from "@/lib/flowholt/tool-marketplace";

type StudioResourcesPanelProps = {
  integrations: Array<{
    id: string;
    provider: string;
    label: string;
    description?: string;
    config?: Record<string, unknown>;
  }>;
};

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

export function StudioResourcesPanel({ integrations }: StudioResourcesPanelProps) {
  const categories = buildToolMarketplace(integrations);
  const summary = buildToolMarketplaceSummary(categories);

  return (
    <div className="space-y-4 text-sm leading-6 text-stone-700">
      <div className="rounded-2xl bg-white/80 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Resources</p>
        <p className="mt-2 text-sm text-stone-700">
          {summary.readyKits} ready, {summary.partialKits} partial, {summary.missingKits} missing. This shared model will power the future premium resources sidebar.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-xs text-stone-600">
            {summary.totalKits} packs
          </span>
          <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-xs text-stone-600">
            {summary.providerPacks} provider
          </span>
          <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-xs text-stone-600">
            {summary.workflowPacks} workflow
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/app/integrations"
            className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Open integrations
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Featured workflow packs</p>
          <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
            {summary.featuredWorkflowPacks.length} suggested
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {summary.featuredWorkflowPacks.map((kit) => (
            <div key={kit.key} className={`rounded-2xl border border-stone-900/10 px-4 py-4 ${toneStyles[kit.tone]}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-stone-900">{kit.title}</p>
                    <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                      {familyLabels[kit.family]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-stone-600">{kit.description}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${readinessStyles[kit.readiness]}`}>
                  {readinessLabels[kit.readiness]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
                {kit.expectedProfiles.map((profile) => (
                  <span key={profile} className="rounded-full border border-stone-900/10 bg-white px-3 py-1">
                    wants: {profile.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white/80 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Ideal for</p>
                  <p className="mt-2 text-xs leading-5 text-stone-700">{kit.idealFor}</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Best strategy</p>
                  <p className="mt-2 text-xs leading-5 text-stone-700">{kit.recommendedStrategy}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-500">{kit.readinessDetail}</p>
            </div>
          ))}
        </div>
      </div>

      {categories.map((category) => (
        <div key={category.key} className="rounded-2xl bg-white/80 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{category.title}</p>
          <p className="mt-2 text-sm text-stone-600">{category.description}</p>
          <div className="mt-4 space-y-3">
            {category.kits.map((kit) => (
              <div key={kit.key} className={`rounded-2xl border border-stone-900/10 px-4 py-3 ${toneStyles[kit.tone]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-stone-900">{kit.title}</p>
                      <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                        {familyLabels[kit.family]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{kit.description}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${readinessStyles[kit.readiness]}`}>
                    {readinessLabels[kit.readiness]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
                  {kit.requiredProviders.map((provider) => (
                    <span key={provider} className="rounded-full border border-stone-900/10 bg-white px-3 py-1">
                      provider: {provider}
                    </span>
                  ))}
                  {kit.expectedProfiles.map((profile) => (
                    <span key={profile} className="rounded-full border border-stone-900/10 bg-white px-3 py-1">
                      profile: {profile.replaceAll("_", " ")}
                    </span>
                  ))}
                  {kit.recommendedToolKeys.map((toolKey) => (
                    <span key={toolKey} className="rounded-full border border-stone-900/10 bg-white px-3 py-1">
                      preset: {toolKey}
                    </span>
                  ))}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/80 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Setup hint</p>
                    <p className="mt-2 text-xs leading-5 text-stone-700">{kit.setupHint}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Strategy</p>
                    <p className="mt-2 text-xs leading-5 text-stone-700">{kit.recommendedStrategy}</p>
                  </div>
                </div>
                {kit.detectedProfiles.length ? (
                  <div className="mt-3 rounded-2xl bg-white/80 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Detected vendor profiles</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                      {kit.detectedProfiles.map((profile) => (
                        <span key={profile.key} className="rounded-full border border-stone-900/10 bg-white px-3 py-1">
                          {profile.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-3 text-xs leading-5 text-stone-500">
                  {kit.matchingConnections.length ? (
                    <p>
                      Connected: {kit.matchingConnections.map((connection) => connection.label).join(", ")}
                    </p>
                  ) : (
                    <p>No matching connection saved yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
