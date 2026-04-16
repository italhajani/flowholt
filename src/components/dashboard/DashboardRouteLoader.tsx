import React from "react";
import { cn } from "@/lib/utils";

const shimmerDelays = ["0ms", "120ms", "240ms", "360ms", "480ms"];

const LoaderBlock: React.FC<{
  className?: string;
  delay?: string;
  style?: React.CSSProperties;
}> = ({ className, delay = "0ms", style }) => (
  <div
    className={cn("rounded-xl bg-slate-100/80 animate-pulse", className)}
    style={{ animationDelay: delay, ...style }}
  />
);

const LoaderRow: React.FC<{ delay: string }> = ({ delay }) => (
  <div className="grid grid-cols-[1.7fr,1fr,0.7fr,0.9fr,0.9fr] gap-4 items-center py-4 border-b border-slate-200/70">
    <div className="flex items-center gap-3">
      <LoaderBlock className="w-10 h-10 rounded-lg" delay={delay} />
      <div className="flex-1 space-y-2">
        <LoaderBlock className="h-3.5 w-44" delay={delay} />
        <LoaderBlock className="h-3 w-32" delay={delay} />
      </div>
    </div>
    <LoaderBlock className="h-3.5 w-20" delay={delay} />
    <LoaderBlock className="h-3.5 w-10" delay={delay} />
    <LoaderBlock className="h-3.5 w-24" delay={delay} />
    <div className="flex justify-end">
      <LoaderBlock className="h-8 w-28 rounded-lg" delay={delay} />
    </div>
  </div>
);

const PageTitleSkeleton = () => (
  <div className="space-y-3">
    <LoaderBlock className="h-4 w-24 rounded-md" />
    <LoaderBlock className="h-10 w-[520px] max-w-full rounded-xl" />
    <LoaderBlock className="h-4 w-[420px] max-w-full rounded-md" delay="120ms" />
  </div>
);

export const WorkflowsLoader = () => (
  <div className="p-8 max-w-[1440px] mx-auto">
    <div className="space-y-8">
      <div className="space-y-5">
        <LoaderBlock className="h-12 w-[440px] max-w-full rounded-xl" />
        <LoaderBlock className="h-28 w-full rounded-[28px]" delay="120ms" />
        <div className="flex items-center justify-center gap-4">
          <LoaderBlock className="h-px flex-1 rounded-full" />
          <LoaderBlock className="h-3 w-8 rounded-md" delay="240ms" />
          <LoaderBlock className="h-px flex-1 rounded-full" />
        </div>
        <LoaderBlock className="h-10 w-44 rounded-lg" delay="360ms" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <LoaderBlock className="h-8 w-52 rounded-lg" />
          <div className="flex items-center gap-3">
            <LoaderBlock className="h-10 w-64 rounded-xl" delay="120ms" />
            <LoaderBlock className="h-10 w-28 rounded-xl" delay="240ms" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 px-5">
          {shimmerDelays.map((delay, index) => (
            <LoaderRow key={delay + index} delay={delay} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const TemplatesLoader = () => (
  <div className="p-8 max-w-[1440px] mx-auto">
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <PageTitleSkeleton />
        <div className="flex items-center gap-3">
          <LoaderBlock className="h-10 w-32 rounded-xl" />
          <LoaderBlock className="h-10 w-40 rounded-xl" delay="120ms" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {["96px", "110px", "96px", "88px", "104px"].map((width, index) => (
          <LoaderBlock key={width + index} className="h-9 rounded-full" delay={shimmerDelays[index]} style={{ width }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        {shimmerDelays.slice(0, 3).map((delay, index) => (
          <div key={delay + index} className="rounded-2xl border border-slate-200/80 p-5 space-y-4">
            <LoaderBlock className="h-32 w-full rounded-2xl" delay={delay} />
            <LoaderBlock className="h-5 w-40 rounded-lg" delay={delay} />
            <LoaderBlock className="h-3.5 w-full rounded-md" delay={delay} />
            <LoaderBlock className="h-3.5 w-4/5 rounded-md" delay={delay} />
            <div className="flex items-center justify-between pt-2">
              <LoaderBlock className="h-8 w-24 rounded-lg" delay={delay} />
              <LoaderBlock className="h-8 w-28 rounded-lg" delay={delay} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TableLoader = ({ titleWidth = "220px" }: { titleWidth?: string }) => (
  <div className="p-8 max-w-[1440px] mx-auto">
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-3">
          <LoaderBlock className="h-10 rounded-xl" style={{ width: titleWidth }} />
          <LoaderBlock className="h-4 w-[360px] max-w-full rounded-md" delay="120ms" />
        </div>
        <div className="flex items-center gap-3">
          <LoaderBlock className="h-10 w-56 rounded-xl" />
          <LoaderBlock className="h-10 w-28 rounded-xl" delay="120ms" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {shimmerDelays.slice(0, 4).map((delay, index) => (
          <div key={delay + index} className="rounded-2xl border border-slate-200/80 p-5 space-y-3">
            <LoaderBlock className="h-3.5 w-28 rounded-md" delay={delay} />
            <LoaderBlock className="h-8 w-16 rounded-lg" delay={delay} />
            <LoaderBlock className="h-3.5 w-32 rounded-md" delay={delay} />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/80 px-5">
        {shimmerDelays.map((delay, index) => (
          <LoaderRow key={delay + index} delay={delay} />
        ))}
      </div>
    </div>
  </div>
);

export const SplitSettingsLoader = () => (
  <div className="p-8 max-w-[1440px] mx-auto">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <LoaderBlock className="h-9 w-36 rounded-xl" />
        <LoaderBlock className="h-10 w-32 rounded-xl" />
      </div>
      <div className="rounded-3xl border border-slate-200/80 overflow-hidden bg-white">
        <div className="grid grid-cols-[240px,1fr] min-h-[620px]">
          <div className="border-r border-slate-200/80 p-5 space-y-2">
            {shimmerDelays.map((delay, index) => (
              <LoaderBlock key={delay + index} className="h-11 w-full rounded-xl" delay={delay} />
            ))}
          </div>
          <div className="p-8 space-y-4">
            <LoaderBlock className="h-10 w-72 rounded-xl" />
            {shimmerDelays.map((delay, index) => (
              <div key={delay + index} className="py-4 border-b border-slate-200/80 last:border-b-0 flex items-start justify-between gap-8">
                <div className="space-y-2">
                  <LoaderBlock className="h-4 w-48 rounded-md" delay={delay} />
                  <LoaderBlock className="h-3.5 w-80 max-w-full rounded-md" delay={delay} />
                </div>
                <LoaderBlock className="h-8 w-20 rounded-lg" delay={delay} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const OverviewLoader = () => (
  <div className="p-8 max-w-[1440px] mx-auto">
    <div className="space-y-8">
      <PageTitleSkeleton />
      <div className="grid grid-cols-4 gap-4">
        {shimmerDelays.slice(0, 4).map((delay, index) => (
          <LoaderBlock key={delay + index} className="h-32 rounded-2xl" delay={delay} />
        ))}
      </div>
      <div className="grid grid-cols-[1.6fr,1fr] gap-5">
        <LoaderBlock className="h-[360px] rounded-3xl" />
        <div className="space-y-4">
          <LoaderBlock className="h-[172px] rounded-3xl" delay="120ms" />
          <LoaderBlock className="h-[172px] rounded-3xl" delay="240ms" />
        </div>
      </div>
    </div>
  </div>
);

export const AgentsLoader = () => (
  <div className="px-6 pt-6 pb-24 max-w-[1440px] mx-auto">
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div className="space-y-2">
          <LoaderBlock className="h-6 w-36 rounded-lg" />
          <LoaderBlock className="h-4 w-[520px] max-w-full rounded-md" delay="80ms" />
        </div>
        <div className="flex items-center gap-3">
          <LoaderBlock className="h-10 w-32 rounded-lg" delay="120ms" />
          <LoaderBlock className="h-10 w-36 rounded-lg" delay="200ms" />
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200/80 p-5">
        <LoaderBlock className="h-4 w-32 rounded-md" />
        <LoaderBlock className="mt-3 h-4 w-[620px] max-w-full rounded-md" delay="120ms" />
        <div className="mt-4 flex gap-2">
          {["132px", "124px", "112px"].map((w, i) => (
            <LoaderBlock key={w + i} className="h-8 rounded-full" delay={shimmerDelays[i]} style={{ width: w }} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {shimmerDelays.slice(0, 4).map((delay, i) => (
          <div key={delay + i} className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
            <div className="flex items-start justify-between">
              <LoaderBlock className="h-4 w-24 rounded-md" delay={delay} />
              <LoaderBlock className="h-7 w-7 rounded-full" delay={delay} />
            </div>
            <LoaderBlock className="h-8 w-16 rounded-lg" delay={delay} />
            <LoaderBlock className="h-3.5 w-28 rounded-md" delay={delay} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
        <LoaderBlock className="h-4 w-48 rounded-md" />
        <LoaderBlock className="mt-2 h-3.5 w-[420px] max-w-full rounded-md" delay="120ms" />
      </div>

      <div className="flex items-center justify-between gap-6 border-b border-slate-200 pb-0">
        <div className="flex gap-6">
          {["72px", "56px", "128px", "56px"].map((w, i) => (
            <LoaderBlock key={w + i} className="h-4 rounded-md" delay={shimmerDelays[i]} style={{ width: w }} />
          ))}
        </div>
        <div className="flex items-center gap-3 pb-3">
          <LoaderBlock className="h-10 w-80 rounded-lg" delay="120ms" />
          <LoaderBlock className="h-4 w-28 rounded-md" delay="240ms" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="grid grid-cols-[2.2fr_180px_220px_200px_210px_170px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3">
          {["Agent", "State", "Topology", "Workflow", "Model", "Actions"].map((label, i) => (
            <LoaderBlock
              key={label + i}
              className="h-3.5 rounded-md"
              delay={shimmerDelays[i % shimmerDelays.length]}
              style={{ width: label === "Agent" ? "64px" : "72px" }}
            />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {shimmerDelays.map((delay, i) => (
            <div key={delay + i} className="grid grid-cols-[2.2fr_180px_220px_200px_210px_170px] gap-4 px-5 py-4 items-start">
              <div className="flex gap-3">
                <LoaderBlock className="h-10 w-10 rounded-xl" delay={delay} />
                <div className="flex-1 space-y-2">
                  <LoaderBlock className="h-4 w-48 rounded-md" delay={delay} />
                  <LoaderBlock className="h-3 w-full rounded-md" delay={delay} />
                  <LoaderBlock className="h-3 w-3/4 rounded-md" delay={delay} />
                </div>
              </div>
              <div className="space-y-2">
                <LoaderBlock className="h-6 w-24 rounded-full" delay={delay} />
                <LoaderBlock className="h-3 w-28 rounded-md" delay={delay} />
              </div>
              <div className="space-y-2">
                <LoaderBlock className="h-3.5 w-28 rounded-md" delay={delay} />
                <div className="flex gap-2">
                  <LoaderBlock className="h-5 w-16 rounded-full" delay={delay} />
                  <LoaderBlock className="h-5 w-14 rounded-full" delay={delay} />
                </div>
              </div>
              <div className="space-y-2">
                <LoaderBlock className="h-3.5 w-32 rounded-md" delay={delay} />
                <LoaderBlock className="h-3 w-24 rounded-md" delay={delay} />
              </div>
              <div className="space-y-2">
                <LoaderBlock className="h-3.5 w-36 rounded-md" delay={delay} />
                <LoaderBlock className="h-3 w-28 rounded-md" delay={delay} />
              </div>
              <div className="flex justify-end gap-2">
                <LoaderBlock className="h-9 w-20 rounded-lg" delay={delay} />
                <LoaderBlock className="h-9 w-16 rounded-lg" delay={delay} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const DashboardRouteLoader: React.FC<{ pathname: string }> = ({ pathname }) => {
  if (pathname.includes("/dashboard/workflows")) {
    return <WorkflowsLoader />;
  }

  if (pathname.includes("/dashboard/templates")) {
    return <TemplatesLoader />;
  }

  if (pathname.includes("/dashboard/ai-agents")) {
    return <AgentsLoader />;
  }

  if (pathname.includes("/dashboard/settings") || pathname.includes("/dashboard/credentials")) {
    return <SplitSettingsLoader />;
  }

  if (pathname.includes("/dashboard/executions") || pathname.includes("/dashboard/integrations") || pathname.includes("/dashboard/api")) {
    return <TableLoader titleWidth="280px" />;
  }

  if (pathname.includes("/dashboard/help")) {
    return <SplitSettingsLoader />;
  }

  return <OverviewLoader />;
};

export default DashboardRouteLoader;
