import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import { createClient } from "@/lib/supabase/server";

type ChatThreadRow = {
  id: string;
  title: string;
  workflow_id: string;
  updated_at: string;
};

export default async function AgentsPage() {
  const supabase = await createClient();

  const { data: threadRows, error: threadError } = await supabase
    .from("workflow_chat_threads")
    .select("id, title, workflow_id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(6);

  const threads = (threadRows ?? []) as ChatThreadRow[];
  const workflowIds = [...new Set(threads.map((thread) => thread.workflow_id))];

  let workflowNameById = new Map<string, string>();

  if (workflowIds.length) {
    const { data: workflows } = await supabase
      .from("workflows")
      .select("id, name")
      .in("id", workflowIds);

    workflowNameById = new Map(
      ((workflows ?? []) as Array<{ id: string; name: string }>).map((workflow) => [
        workflow.id,
        workflow.name,
      ]),
    );
  }

  return (
    <AppShell
      eyebrow="Agents"
      title="Agent library"
      description="Agent definitions should live separately from workflows so they can be reused, tuned, and versioned across the platform."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SurfaceCard title="Roles" description="Researcher, planner, writer, operator, reviewer." />
        <SurfaceCard title="Prompt profiles" description="System instructions, goals, guardrails, and handoff rules." tone="mint" />
        <SurfaceCard title="Memory settings" description="Short-term context, retrieval hooks, and file access." tone="sand" />
      </div>

      <div className="mt-5 grid gap-5">
        <SurfaceCard
          title="Workflow chat threads"
          description="Live chat-memory backend state for your workflow assistant sidebar."
          tone="mint"
        >
          {threadError ? (
            <p className="text-sm text-amber-700">
              Chat tables are not ready yet. Run migration `20260326_0005_workflow_chat.sql`.
            </p>
          ) : threads.length ? (
            <div className="space-y-3">
              {threads.map((thread) => (
                <div key={thread.id} className="rounded-2xl border border-stone-900/10 bg-white px-4 py-3">
                  <p className="text-sm font-medium text-stone-900">{thread.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                    {workflowNameById.get(thread.workflow_id) ?? "Workflow"}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    Updated: {new Date(thread.updated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-600">
              No threads yet. Create one through the new chat API endpoints and they will appear here.
            </p>
          )}
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
