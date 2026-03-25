import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

export default function OrchestratorPage() {
  return (
    <AppShell
      eyebrow="Orchestrator"
      title="Chat-first workflow generation"
      description="Users explain the annoying work in plain language, the orchestrator reasons through the task, proposes a graph, and prepares it for Studio review or execution."
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <SurfaceCard
          title="Main chat panel"
          description="This is the primary conversation space where the user describes the task and the orchestrator clarifies only when needed."
        >
          <div className="rounded-[1.5rem] bg-stone-950 p-5 text-sm leading-7 text-stone-100">
            <p className="text-stone-400">User prompt</p>
            <p className="mt-2">
              Build a flow that collects lead form data, enriches the company,
              drafts a personalized outbound email, and updates the CRM.
            </p>
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-stone-400">AI reasoning view</p>
              <p className="mt-2 text-stone-200">
                Detect trigger, choose research agent, add CRM tool call, route
                through qualification check, then hand off to email agent.
              </p>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-5">
          <SurfaceCard
            title="Suggested workflow preview"
            description="A structured preview of nodes, edges, assumptions, and missing credentials before the user commits to Studio."
            tone="mint"
          >
            <ul className="space-y-3 text-sm leading-6 text-stone-800">
              <li>Trigger: Web form intake</li>
              <li>Agent: Company researcher</li>
              <li>Tool: CRM enrichment API</li>
              <li>Condition: Qualified lead score</li>
              <li>Agent: Email drafter</li>
              <li>Output: CRM update + run report</li>
            </ul>
          </SurfaceCard>

          <SurfaceCard
            title="Decision controls"
            description="The orchestrator page should always surface clear next actions."
            tone="sand"
          >
            <div className="grid gap-3 text-sm text-stone-700">
              <div className="rounded-2xl border border-stone-900/10 bg-white/75 px-4 py-3">
                Approve and open in Studio
              </div>
              <div className="rounded-2xl border border-stone-900/10 bg-white/75 px-4 py-3">
                Ask the AI to improve the flow
              </div>
              <div className="rounded-2xl border border-stone-900/10 bg-white/75 px-4 py-3">
                Run immediately with current assumptions
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
