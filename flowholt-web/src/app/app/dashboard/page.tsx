import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { createStarterWorkflow, createWorkspace } from "@/app/app/dashboard/actions";
import { getDashboardSnapshot } from "@/lib/flowholt/data";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const snapshot = await getDashboardSnapshot();
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);

  const stats = [
    { label: "Workflow runs", value: String(snapshot.runCount) },
    { label: "Success rate", value: `${snapshot.successRate}%` },
    { label: "Saved workflows", value: String(snapshot.workflowCount) },
    { label: "Workspaces", value: String(snapshot.workspaces.length) },
  ];

  return (
    <AppShell
      eyebrow="Dashboard"
      title="Control center"
      description="The dashboard gives users a fast read on workflow health, recent runs, saved work, and the quickest path into chat-based creation."
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5">
          {message ? (
            <div className="rounded-[1.5rem] bg-[#eef4ef] px-5 py-4 text-sm text-emerald-900">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[1.5rem] bg-[#f7ede2] px-5 py-4 text-sm text-amber-950">
              {error}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <SurfaceCard
                key={stat.label}
                title={stat.value}
                description={stat.label}
                tone="default"
              />
            ))}
          </div>

          {!snapshot.schemaReady ? (
            <SurfaceCard
              title="Database migration needed"
              description="The app is connected to Supabase, but the FlowHolt tables are not available yet."
              tone="sand"
            >
              <div className="space-y-3 text-sm leading-6 text-stone-700">
                <p>
                  Open the Supabase SQL editor and run the migration file at <span className="font-medium">supabase/migrations/20260325_0001_flowholt_core.sql</span>.
                </p>
                <p>
                  After that, refresh this page and create your first workspace.
                </p>
              </div>
            </SurfaceCard>
          ) : null}

          {snapshot.schemaReady && !snapshot.workspaces.length ? (
            <SurfaceCard
              title="Create your first workspace"
              description="A workspace is the container for your workflows, runs, and future integrations."
              tone="mint"
            >
              <form action={createWorkspace} className="flex flex-col gap-3 md:flex-row">
                <input
                  name="name"
                  defaultValue="FlowHolt Workspace"
                  className="flex-1 rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                >
                  Create workspace
                </button>
              </form>
            </SurfaceCard>
          ) : null}

          <SurfaceCard
            title="Recent workflows"
            description="A combined list of drafts, active flows, and recently edited workflow records."
          >
            <div className="grid gap-3">
              {snapshot.recentWorkflows.length ? (
                snapshot.recentWorkflows.map((workflow) => (
                  <Link
                    key={workflow.id}
                    href={`/app/studio/${workflow.id}`}
                    className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-100"
                  >
                    {workflow.name}
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  {snapshot.schemaReady
                    ? "No workflows yet. Create your first one from the button on the right."
                    : "Run the Supabase SQL migration to unlock real workspace and workflow data here."}
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-5">
          <SurfaceCard
            title="Quick actions"
            description="The highest-leverage entry points for the product."
            tone="mint"
          >
            <div className="grid gap-3 text-sm text-stone-800">
              <Link
                href="/app/create"
                className="rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-3 transition hover:bg-white"
              >
                Create with chat
              </Link>
              {snapshot.activeWorkspace ? (
                <form action={createStarterWorkflow}>
                  <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-3 text-left transition hover:bg-white"
                  >
                    Create starter workflow
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl border border-stone-900/10 bg-white/60 px-4 py-3 text-stone-500">
                  Create a workspace to unlock starter workflows
                </div>
              )}
              <Link
                href="/app/studio/demo-workflow"
                className="rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-3 transition hover:bg-white"
              >
                Open demo studio
              </Link>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Activity feed"
            description="Human-friendly summaries of runs, edits, approvals, and model decisions."
            tone="sand"
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              {snapshot.recentRuns.length ? (
                snapshot.recentRuns.map((run) => (
                  <p key={run.id}>
                    {run.status.toUpperCase()} - Workflow run via {run.trigger_source}
                  </p>
                ))
              ) : (
                <p>
                  {snapshot.schemaReady
                    ? "No run history yet. Once you execute flows, recent runs will appear here."
                    : "Run the SQL migration first, then FlowHolt can store and display execution history."}
                </p>
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
