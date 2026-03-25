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

  return (
    <AppShell
      eyebrow="Studio"
      title={`Workflow studio: ${workflow.name}`}
      description="The Studio is the visual workspace where users shape graph structure, connect steps, inspect details, and save the workflow draft."
    >
      <div className="grid gap-5 xl:grid-cols-[280px_1fr_320px]">
        <SurfaceCard
          title="Step rail"
          description="Add workflow steps from the buttons in the canvas, then drag and connect them visually."
          tone="mint"
        >
          <div className="grid gap-3 text-sm text-stone-800">
            {[
              "Trigger",
              "Agent",
              "Tool",
              "Condition",
              "Memory",
              "Output",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-3"
              >
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>

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

          <SurfaceCard
            title="Visual editor"
            description="Drag steps, connect them, edit labels, and save the result back to Supabase."
          >
            <form action={saveWorkflow} className="space-y-5">
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
                    className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
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
                    className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
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
                  className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>

              <StudioCanvas initialGraph={graph} />

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                >
                  Save workflow
                </button>
                <Link
                  href="/app/workflows"
                  className="rounded-full border border-stone-900/10 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  Back to library
                </Link>
              </div>
            </form>
          </SurfaceCard>
        </div>

        <SurfaceCard
          title="Properties"
          description="High-level details for the current workflow record."
          tone="sand"
        >
          <div className="space-y-3 text-sm leading-6 text-stone-700">
            <p>Workflow id: {workflow.id}</p>
            <p>Status: {workflow.status}</p>
            <p>Nodes: {graph.nodes.length}</p>
            <p>Edges: {graph.edges.length}</p>
            <p>Workspace id: {workflow.workspace_id}</p>
            <p>Updated: {new Date(workflow.updated_at).toLocaleString()}</p>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
