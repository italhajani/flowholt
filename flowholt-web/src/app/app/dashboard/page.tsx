import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { createStarterWorkflow, createWorkspace } from "@/app/app/dashboard/actions";
import { getDashboardSnapshot } from "@/lib/flowholt/data";
import type { UsageCounter, WorkspaceUsageStatus } from "@/lib/flowholt/types";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function counterSummary(label: string, counter: UsageCounter) {
  return `${label}: ${counter.used} / ${counter.limit}`;
}

function counterTone(level: UsageCounter["level"]) {
  if (level === "blocked") {
    return "bg-[#f8eee4] text-amber-950";
  }
  if (level === "warn") {
    return "bg-[#eef5ef] text-emerald-900";
  }
  return "bg-white/90 text-stone-700";
}

function buildLimitHeadline(limits: WorkspaceUsageStatus | null) {
  if (!limits) {
    return null;
  }

  const counters = [
    { label: "runs", value: limits.runsMonthly },
    { label: "tokens", value: limits.tokensMonthly },
    { label: "active workflows", value: limits.activeWorkflows },
    { label: "team members", value: limits.members },
    { label: "schedules", value: limits.schedules },
  ];

  const blocked = counters.find((entry) => entry.value.level === "blocked");
  if (blocked) {
    return {
      tone: "bg-[#f8eee4] text-amber-950",
      message: `This workspace has reached the ${blocked.label} limit for the ${limits.planName} plan.`,
    };
  }

  const warning = counters.find((entry) => entry.value.level === "warn");
  if (warning) {
    return {
      tone: "bg-[#eef5ef] text-emerald-900",
      message: `This workspace is getting close to the ${warning.label} limit for the ${limits.planName} plan.`,
    };
  }

  return null;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const snapshot = await getDashboardSnapshot();
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);
  const limitHeadline = buildLimitHeadline(snapshot.limits);

  const stats = [
    { label: "Workflow runs", value: String(snapshot.runCount), note: "All stored executions" },
    { label: "Success rate", value: `${snapshot.successRate}%`, note: "Recent run health" },
    { label: "Saved workflows", value: String(snapshot.workflowCount), note: "Drafts and live flows" },
    { label: "Active schedules", value: String(snapshot.usage.activeSchedules), note: "Automatic runs enabled" },
  ];

  return (
    <AppShell
      eyebrow="Dashboard"
      title="Workspace overview"
      description="A cleaner control room for active workflows, recent activity, usage, and the next best action inside FlowHolt."
    >
      <div className="space-y-5">
        {message ? (
          <div className="rounded-[1.5rem] bg-[#eef5ef] px-5 py-4 text-sm text-emerald-900">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-[1.5rem] bg-[#f8eee4] px-5 py-4 text-sm text-amber-950">
            {error}
          </div>
        ) : null}
        {limitHeadline ? (
          <div className={`rounded-[1.5rem] px-5 py-4 text-sm ${limitHeadline.tone}`}>
            {limitHeadline.message}
          </div>
        ) : null}

        <div className="flowholt-window overflow-hidden">
          <div className="flowholt-window-bar">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Workspace</p>
              <p className="mt-1 text-sm font-medium text-stone-900">Live product surface</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/app/create" className="flowholt-primary-button px-4 py-2 text-sm font-medium">
                Create from chat
              </Link>
              <Link href="/app/workflows" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                Open library
              </Link>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.25fr)_380px]">
            <div className="border-b border-stone-900/8 p-5 xl:border-b-0 xl:border-r xl:p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.6rem] border border-stone-900/10 bg-white px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">{stat.label}</p>
                    <p className="flowholt-display mt-3 text-[2rem] leading-none text-stone-950">{stat.value}</p>
                    <p className="mt-2 text-xs leading-5 text-stone-500">{stat.note}</p>
                  </div>
                ))}
              </div>

              {!snapshot.schemaReady ? (
                <div className="mt-5 rounded-[1.8rem] border border-[#ead7c8] bg-[#fff8f2] p-5 text-sm leading-7 text-stone-700">
                  <p className="font-medium text-stone-900">Database migration needed</p>
                  <p className="mt-2">
                    Open the Supabase SQL editor and run <span className="font-medium">supabase/migrations/20260325_0001_flowholt_core.sql</span>, then refresh this page.
                  </p>
                </div>
              ) : null}

              {snapshot.schemaReady && !snapshot.workspaces.length ? (
                <div className="mt-5 rounded-[1.8rem] border border-stone-900/10 bg-[#f7f3ed] p-5">
                  <p className="text-base font-semibold text-stone-900">Create your first workspace</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Workspaces keep workflows, integrations, runs, and billing in one clean container.
                  </p>
                  <form action={createWorkspace} className="mt-4 flex flex-col gap-3 md:flex-row">
                    <input
                      name="name"
                      defaultValue="FlowHolt Workspace"
                      className="flex-1 rounded-[1.3rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                    />
                    <button
                      type="submit"
                      className="flowholt-primary-button px-5 py-3 text-sm font-medium"
                    >
                      Create workspace
                    </button>
                  </form>
                </div>
              ) : null}

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <SurfaceCard
                  title="Recent workflows"
                  description="Saved drafts and active automations stay visible right where users land after login."
                >
                  <div className="grid gap-3">
                    {snapshot.recentWorkflows.length ? (
                      snapshot.recentWorkflows.map((workflow) => (
                        <Link
                          key={workflow.id}
                          href={`/app/studio/${workflow.id}`}
                          className="rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-4 text-sm text-stone-700 transition hover:bg-stone-50"
                        >
                          <p className="font-medium text-stone-900">{workflow.name}</p>
                          <p className="mt-1 text-sm text-stone-500">Open in Studio</p>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[1.35rem] border border-dashed border-stone-900/14 bg-white/75 px-4 py-6 text-sm text-stone-500">
                        {snapshot.schemaReady
                          ? "No workflows yet. Start from Create and let the assistant draft the first one."
                          : "Run the database setup first so FlowHolt can store workflow records here."}
                      </div>
                    )}
                  </div>
                </SurfaceCard>

                <SurfaceCard
                  title="Usage pulse"
                  description="The health strip that makes the backend feel alive without exposing low-level complexity."
                  tone="sand"
                >
                  <div className="space-y-3 text-sm leading-6">
                    <div className="rounded-[1.25rem] bg-white/90 px-4 py-3 text-stone-700">Queued jobs right now: {snapshot.usage.queuedJobs}</div>
                    <div className="rounded-[1.25rem] bg-white/90 px-4 py-3 text-stone-700">Failed runs in 7 days: {snapshot.usage.failedRunsLast7Days}</div>
                    <div className="rounded-[1.25rem] bg-white/90 px-4 py-3 text-stone-700">Tool calls this month: {snapshot.usage.toolCallsThisMonth}</div>
                    <div className="rounded-[1.25rem] bg-white/90 px-4 py-3 text-stone-700">Tokens last 7 days: {snapshot.usage.tokenEstimateLast7Days}</div>
                  </div>
                </SurfaceCard>
              </div>
            </div>

            <div className="bg-[#f8f4ee] p-5 xl:p-6">
              <div className="space-y-5">
                <SurfaceCard
                  title="Quick actions"
                  description="The fastest ways to move through the platform from the workspace home."
                  tone="mint"
                >
                  <div className="grid gap-3 text-sm text-stone-800">
                    <Link href="/app/create" className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 transition hover:bg-stone-50">
                      Create with chat
                    </Link>
                    {snapshot.activeWorkspace ? (
                      <form action={createStarterWorkflow}>
                        <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                        <button
                          type="submit"
                          className="w-full rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-left transition hover:bg-stone-50"
                        >
                          Create starter workflow
                        </button>
                      </form>
                    ) : (
                      <div className="rounded-[1.25rem] border border-stone-900/10 bg-white/70 px-4 py-3 text-stone-500">
                        Create a workspace to unlock starter workflows
                      </div>
                    )}
                    <Link href="/app/studio/demo-workflow" className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 transition hover:bg-stone-50">
                      Open demo Studio
                    </Link>
                  </div>
                </SurfaceCard>

                {snapshot.limits ? (
                  <SurfaceCard
                    title="Plan and limits"
                    description="Billing-aware usage limits are present now, but presented in a cleaner product language."
                    tone={
                      snapshot.limits.runsMonthly.level === "blocked" || snapshot.limits.tokensMonthly.level === "blocked"
                        ? "sand"
                        : "default"
                    }
                  >
                    <div className="space-y-3 text-sm leading-6 text-stone-700">
                      <div className="rounded-[1.25rem] bg-white/90 px-4 py-3">
                        {snapshot.limits.planName} plan | {snapshot.limits.periodLabel}
                      </div>
                      <div className={`rounded-[1.25rem] px-4 py-3 ${counterTone(snapshot.limits.runsMonthly.level)}`}>
                        {counterSummary("Runs", snapshot.limits.runsMonthly)}
                      </div>
                      <div className={`rounded-[1.25rem] px-4 py-3 ${counterTone(snapshot.limits.tokensMonthly.level)}`}>
                        {counterSummary("Tokens", snapshot.limits.tokensMonthly)}
                      </div>
                      <div className={`rounded-[1.25rem] px-4 py-3 ${counterTone(snapshot.limits.activeWorkflows.level)}`}>
                        {counterSummary("Active workflows", snapshot.limits.activeWorkflows)}
                      </div>
                      <div className={`rounded-[1.25rem] px-4 py-3 ${counterTone(snapshot.limits.members.level)}`}>
                        {counterSummary("Members", snapshot.limits.members)}
                      </div>
                    </div>
                  </SurfaceCard>
                ) : null}

                <SurfaceCard
                  title="Activity feed"
                  description="Recent runs and workflow events translated into a clean, readable sidebar summary."
                  tone="default"
                >
                  <div className="space-y-3 text-sm leading-6 text-stone-700">
                    {snapshot.recentRuns.length ? (
                      snapshot.recentRuns.map((run) => (
                        <div key={run.id} className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                          <p className="font-medium text-stone-900">{run.status.toUpperCase()} via {run.trigger_source}</p>
                          <p className="mt-1 text-stone-500">Created {new Date(run.created_at).toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <p>
                        {snapshot.schemaReady
                          ? "No run history yet. Execute a workflow and FlowHolt will start filling this space."
                          : "Run the SQL migration first, then execution history will appear here."}
                      </p>
                    )}
                  </div>
                </SurfaceCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

