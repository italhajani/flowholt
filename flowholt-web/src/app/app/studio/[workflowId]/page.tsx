import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { getDemoWorkflow, getWorkflowForStudio } from "@/lib/flowholt/data";

type StudioPageProps = {
  params: Promise<{
    workflowId: string;
  }>;
};

export default async function StudioPage({ params }: StudioPageProps) {
  const { workflowId } = await params;
  const workflow = (await getWorkflowForStudio(workflowId)) ?? getDemoWorkflow();
  const graph = workflow.graph;

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

        <SurfaceCard
          title="Canvas"
          description="Main visual graph area for building, arranging, and inspecting workflow execution paths."
        >
          <div className="rounded-[1.5rem] border border-dashed border-stone-900/15 bg-[linear-gradient(rgba(29,26,23,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(29,26,23,0.06)_1px,transparent_1px)] bg-[size:24px_24px] p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {graph.nodes.map((node) => (
                <div
                  key={node.id}
                  className="rounded-2xl border border-stone-900/10 bg-white px-4 py-5 text-sm font-medium text-stone-700 shadow-sm"
                >
                  {node.label}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-stone-950 px-4 py-3 text-sm text-stone-200">
              Run controls: save, dry-run, execute, debug, stream logs
            </div>
          </div>
        </SurfaceCard>

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
            <p>Updated: {new Date(workflow.updated_at).toLocaleString()}</p>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
