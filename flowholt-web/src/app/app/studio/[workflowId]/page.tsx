import Link from "next/link";

import { AppShell } from "@/components/app-shell";
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
      description="The Studio is the advanced workspace where users edit graph structure, tune agents, connect tools, inspect execution details, and publish the final workflow."
    >
      <div className="grid gap-5 xl:grid-cols-[280px_1fr_320px]">
        <SurfaceCard
          title="Node rail"
          description="Drag sources for triggers, agents, tools, memory, conditions, loops, and outputs."
          tone="mint"
        >
          <div className="grid gap-3 text-sm text-stone-800">
            {[
              "Trigger nodes",
              "AI agents",
              "Retriever / RAG",
              "API actions",
              "Conditions",
              "Loops",
              "Output nodes",
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
            title="Canvas"
            description="This is a temporary structured editor. The next upgrade will replace the JSON textarea with a proper graph canvas."
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

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="graph">
                  Graph JSON
                </label>
                <textarea
                  id="graph"
                  name="graph"
                  defaultValue={JSON.stringify(graph, null, 2)}
                  rows={18}
                  className="w-full rounded-[1.5rem] border border-stone-900/10 bg-stone-950 px-4 py-4 font-mono text-sm leading-6 text-stone-100 outline-none"
                />
              </div>

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

          <SurfaceCard
            title="Node preview"
            description="A quick read on the current graph contents from the saved workflow record."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {graph.nodes.length ? (
                graph.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="rounded-2xl border border-stone-900/10 bg-white px-4 py-5 text-sm font-medium text-stone-700 shadow-sm"
                  >
                    {node.label}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  This workflow has no nodes yet. Add them through the JSON for now.
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          title="Properties"
          description="Context, prompts, model config, credentials, retries, and output schema for the selected node."
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
