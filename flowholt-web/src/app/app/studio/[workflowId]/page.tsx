import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { StudioCanvas } from "@/components/studio-canvas";
import { SurfaceCard } from "@/components/surface-card";
import { saveWorkflow } from "@/app/app/studio/actions";
import { getDemoWorkflow, getWorkflowForStudio } from "@/lib/flowholt/data";

type StudioPageProps = {
  params: Promise<{
    workflowId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function StudioPage({ params, searchParams }: StudioPageProps) {
  const { workflowId } = await params;
  const workflow = (await getWorkflowForStudio(workflowId)) ?? getDemoWorkflow();
  const graph = workflow.graph;
  const paramsState = searchParams ? await searchParams : {};
  const message = readMessage(paramsState.message);
  const error = readMessage(paramsState.error);
  const generation = workflow.settings?.generation as
    | { provider?: string; model?: string; notes?: string }
    | undefined;

  return (
    <AppShell
      eyebrow="Studio"
      title={workflow.name}
      description="A calmer, canvas-first workspace for shaping your workflow before you run it."
    >
      <div className="space-y-5">
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

        <div className="grid gap-5 xl:grid-cols-[1.24fr_0.76fr]">
          <div className="rounded-[34px] border border-stone-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.90),rgba(248,244,236,0.92))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                  Studio
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                  Visual workflow editor
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  This space should feel clean and premium: edit the main structure visually, keep the controls light, and save without friction.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {workflow.status}
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {graph.nodes.length} steps
                </div>
              </div>
            </div>

            <form action={saveWorkflow} className="mt-6 space-y-5">
              <input type="hidden" name="workflowId" value={workflow.id} />
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="name">
                    Workflow name
                  </label>
                  <input
                    id="name"
                    name="name"
                    defaultValue={workflow.name}
                    className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={workflow.status}
                    className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={workflow.description}
                  rows={3}
                  className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                />
              </div>

              <StudioCanvas initialGraph={graph} />

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-[#ff7f5f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#f26f4d]"
                >
                  Save changes
                </button>
                <Link
                  href="/app/workflows"
                  className="rounded-full border border-stone-900/10 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  Back to library
                </Link>
              </div>
            </form>
          </div>

          <div className="grid gap-5">
            <SurfaceCard
              title="Workflow details"
              description="A small, calm panel for the metadata that matters while editing."
              tone="default"
            >
              <div className="grid gap-3 text-sm leading-6 text-stone-700">
                <div className="rounded-2xl bg-stone-50 px-4 py-3">Workflow id: {workflow.id}</div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">Workspace id: {workflow.workspace_id}</div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">Nodes: {graph.nodes.length}</div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">Edges: {graph.edges.length}</div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  Updated: {new Date(workflow.updated_at).toLocaleString()}
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Draft source"
              description="Keep the AI provenance visible, but secondary to the visual editing experience."
              tone="sand"
            >
              <div className="space-y-3 text-sm leading-6 text-stone-700">
                <p>Provider: {generation?.provider ?? "local"}</p>
                <p>Model: {generation?.model ?? "not recorded"}</p>
                <p>{generation?.notes ?? "No generation notes available."}</p>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
