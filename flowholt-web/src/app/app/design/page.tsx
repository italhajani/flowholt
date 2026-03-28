import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

const designDirections = [
  {
    key: "editorial-stone",
    title: "Editorial Stone",
    description:
      "Warm neutral shell, soft paper cards, restrained accent moments, and a premium calm workflow canvas.",
    fit:
      "Best if you want FlowHolt to feel serious, classical, clean, and trustworthy for business teams.",
  },
  {
    key: "graphite-cloud",
    title: "Graphite Cloud",
    description:
      "Cool light panels, sharper borders, quieter shadows, and more of a modern operations-console tone.",
    fit:
      "Best if you want the product to feel more technical, precise, and platform-like without looking flashy.",
  },
  {
    key: "mint-sand",
    title: "Mint & Sand",
    description:
      "Gentle contrast with one signature accent, softer surface layers, and a friendlier builder experience.",
    fit:
      "Best if you want the platform to stay premium but feel a little more approachable for non-technical users.",
  },
];

const surveySections = [
  "Choose the overall color mood and accent direction.",
  "Choose sidebar density: tighter product feel or more breathing room.",
  "Choose card style: softer rounded layers or sharper panel framing.",
  "Choose canvas chrome: minimal controls or stronger editor framing.",
  "Choose typography direction: more editorial, more technical, or balanced.",
  "Choose how much reasoning/chat should stay visible while editing.",
];

export default function DesignPage() {
  return (
    <AppShell
      eyebrow="Design"
      title="Premium redesign survey board"
      description="This is the handoff stage before the full FlowHolt visual redesign. We now have enough backend and product foundation to pause and choose the final premium direction carefully."
    >
      <div className="space-y-5">
        <SurfaceCard
          title="Where we are"
          description="The product foundation is now strong enough that the next major move should be your design survey, then the full premium redesign across Studio, dashboard, runs, integrations, and workflows."
          tone="mint"
        >
          <div className="grid gap-3 md:grid-cols-3 text-sm leading-6 text-stone-700">
            <div className="rounded-2xl bg-white/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Backend</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">99%</p>
              <p className="mt-1 text-stone-600">Runs, schedules, revisions, resources, billing foundation, security, and monitoring are in place.</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">UI foundation</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">96%</p>
              <p className="mt-1 text-stone-600">The product shell, Studio sidebar, resources layer, and billing/settings surfaces are ready for redesign.</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Next phase</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Survey</p>
              <p className="mt-1 text-stone-600">We should use your taste to lock the final premium visual system before repainting the whole app.</p>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <SurfaceCard
              title="Design directions"
              description="These are not final themes yet. They are strong directions we can choose from when we do the full redesign."
            >
              <div className="space-y-3 text-sm leading-6 text-stone-700">
                {designDirections.map((direction) => (
                  <div key={direction.key} className="rounded-2xl bg-white/80 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-semibold text-stone-950">{direction.title}</p>
                      <span className="flowholt-chip">candidate</span>
                    </div>
                    <p className="mt-2 text-stone-600">{direction.description}</p>
                    <p className="mt-2 text-sm text-stone-500">{direction.fit}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Redesign targets"
              description="These are the surfaces that should be redesigned together once your survey answers are locked."
              tone="sand"
            >
              <div className="grid gap-3 md:grid-cols-2 text-sm leading-6 text-stone-700">
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  <p className="font-semibold text-stone-950">Studio</p>
                  <p className="mt-1 text-stone-600">Multi-panel editor shell, premium canvas chrome, cleaner resources and assistant layout.</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  <p className="font-semibold text-stone-950">Dashboard and runs</p>
                  <p className="mt-1 text-stone-600">Consistent summary cards, timelines, health views, and calmer hierarchy.</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  <p className="font-semibold text-stone-950">Integrations and settings</p>
                  <p className="mt-1 text-stone-600">More polished setup flows, billing views, and account/workspace administration surfaces.</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  <p className="font-semibold text-stone-950">Workflow library</p>
                  <p className="mt-1 text-stone-600">A cleaner portfolio-style library for drafts, live automations, and reusable workflow packs.</p>
                </div>
              </div>
            </SurfaceCard>
          </div>

          <div className="space-y-5">
            <SurfaceCard
              title="Survey checklist"
              description="These are the exact decisions I’ll need from you before the full premium redesign starts."
              tone="default"
            >
              <div className="space-y-3 text-sm leading-6 text-stone-700">
                {surveySections.map((item, index) => (
                  <div key={item} className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="font-medium text-stone-900">{index + 1}. {item}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Preview links"
              description="Use these current screens while we prepare the redesign conversation."
              tone="mint"
            >
              <div className="flex flex-wrap gap-2">
                <Link href="/app/studio/demo-workflow" className="flowholt-primary-button px-4 py-2 text-sm font-medium">
                  Open Studio
                </Link>
                <Link href="/app/settings" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                  Open Settings
                </Link>
                <Link href="/app/dashboard" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                  Open Dashboard
                </Link>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                The current UI is still transitional. This page is here so we can enter the premium redesign stage in a clean, intentional way.
              </p>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
