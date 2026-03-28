import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { createBlankWorkflow, importWorkflowPackage } from "@/app/app/workflows/actions";
import { getWorkflowLibrarySnapshot } from "@/lib/flowholt/data";
import type { WorkflowRecord } from "@/lib/flowholt/types";

type WorkflowsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function getWorkflowKind(workflow: WorkflowRecord) {
  const triggerNode = workflow.graph.nodes.find((node) => node.type === "trigger");
  const config = triggerNode?.config as Record<string, unknown> | undefined;
  const mode = typeof config?.mode === "string" ? config.mode : "manual";

  if (mode === "schedule" || mode === "event" || mode === "email") {
    return "Automation";
  }

  if (mode === "webhook") {
    return "Inbound";
  }

  return "Outbound";
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusView(status: string) {
  if (status === "active") {
    return {
      label: "Enabled",
      className: "bg-[#e8f7ec] text-emerald-700",
    };
  }

  return {
    label: "Disabled",
    className: "bg-[#fff0ec] text-[#df6b48]",
  };
}

export default async function WorkflowsPage({ searchParams }: WorkflowsPageProps) {
  const snapshot = await getWorkflowLibrarySnapshot();
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);

  return (
    <AppShell
      eyebrow="Workspace"
      title="Workflow"
      description="Open, create, and manage the flows in your workspace from one calm table view."
    >
      <div className="space-y-4">
        {message ? (
          <div className="rounded-[18px] bg-[#eef7f1] px-4 py-3 text-sm text-emerald-900">{message}</div>
        ) : null}
        {error ? (
          <div className="rounded-[18px] bg-[#fff1eb] px-4 py-3 text-sm text-[#b45309]">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-[24px] border border-black/6 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-[minmax(0,1.7fr)_1fr_1fr_1fr] gap-4 border-b border-black/6 px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            <span>Name</span>
            <span>Type</span>
            <span>Created</span>
            <span>Status</span>
          </div>

          {snapshot.workflows.length ? (
            snapshot.workflows.map((workflow) => {
              const status = statusView(workflow.status);
              return (
                <Link
                  key={workflow.id}
                  href={`/app/studio/${workflow.id}`}
                  className="grid grid-cols-[minmax(0,1.7fr)_1fr_1fr_1fr] gap-4 border-b border-black/6 px-5 py-4 text-sm text-stone-700 transition hover:bg-[#fafafa] last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2efff] text-[11px] font-semibold text-[#7c68f5]">
                        AI
                      </span>
                      <span className="truncate font-medium text-stone-950">{workflow.name}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-stone-500">{workflow.description || "No description yet"}</p>
                  </div>
                  <span>{getWorkflowKind(workflow)}</span>
                  <span>{formatDateLabel(workflow.created_at)}</span>
                  <span>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="px-5 py-8 text-sm text-stone-500">
              {snapshot.schemaReady
                ? "No workflows yet. Use Create Flow to start your first one."
                : "Run the Supabase migration first so the workspace can read workflow tables."}
            </div>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[24px] border border-black/6 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Import package</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Paste a FlowHolt package JSON and turn it into a new workflow.
            </p>
            {snapshot.activeWorkspace ? (
              <form action={importWorkflowPackage} className="mt-4 space-y-3">
                <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                <textarea
                  name="packageJson"
                  rows={8}
                  placeholder="Paste exported package JSON here"
                  className="w-full rounded-[18px] border border-black/8 bg-[#fafafa] px-4 py-3 font-mono text-xs leading-6 outline-none"
                />
                <button type="submit" className="flowholt-secondary-button w-full px-4 py-3 text-sm font-medium">
                  Import workflow package
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-stone-500">Create a workspace first before importing packages.</p>
            )}
          </div>

          <div className="rounded-[24px] border border-black/6 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Quick start</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Start from a blank workflow or jump into the demo editor to shape the canvas.
                </p>
              </div>
              <Link href="/app/studio/demo-workflow" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
                Open demo studio
              </Link>
            </div>

            {snapshot.activeWorkspace ? (
              <form action={createBlankWorkflow} className="mt-4 flex flex-wrap gap-3">
                <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                <button type="submit" className="flowholt-primary-button px-5 py-3 text-sm font-medium">
                  Create blank workflow
                </button>
                <Link href="/app/create" className="flowholt-secondary-button px-5 py-3 text-sm font-medium">
                  Create from chat
                </Link>
              </form>
            ) : (
              <p className="mt-4 text-sm text-stone-500">Create a workspace first before creating workflows.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}