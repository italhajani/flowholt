import Link from "next/link";

import { buildToolMarketplace } from "@/lib/flowholt/tool-marketplace";

type StudioResourcesPanelProps = {
  integrations: Array<{
    id: string;
    provider: string;
    label: string;
  }>;
};

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

export function StudioResourcesPanel({ integrations }: StudioResourcesPanelProps) {
  const categories = buildToolMarketplace(integrations);
  const readyCount = categories.flatMap((category) => category.kits).filter((kit) => kit.readiness === "ready").length;
  const totalCount = categories.flatMap((category) => category.kits).length;

  return (
    <div className="space-y-4 text-sm leading-6 text-stone-700">
      <div className="rounded-2xl bg-white/80 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Resources</p>
        <p className="mt-2 text-sm text-stone-700">
          {readyCount} of {totalCount} kits are ready in this workspace. This is the first step toward the final premium resources sidebar.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/app/integrations"
            className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Open integrations
          </Link>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category.key} className="rounded-2xl bg-white/80 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{category.title}</p>
          <p className="mt-2 text-sm text-stone-600">{category.description}</p>
          <div className="mt-4 space-y-3">
            {category.kits.map((kit) => (
              <div key={kit.key} className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{kit.title}</p>
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
                  {kit.recommendedToolKeys.map((toolKey) => (
                    <span key={toolKey} className="rounded-full border border-stone-900/10 bg-white px-3 py-1">
                      preset: {toolKey}
                    </span>
                  ))}
                </div>
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
