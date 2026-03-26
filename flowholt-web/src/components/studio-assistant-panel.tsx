"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ProposalSummary = {
  name: string;
  description: string;
  graph: {
    nodes: Array<{ id: string; type: string; label: string }>;
    edges: Array<{ source: string; target: string; label?: string; branch?: string }>;
  };
  reasoning: string[];
  changes: Array<{
    kind: string;
    node_id: string;
    label: string;
    node_type: string;
    reason: string;
  }>;
  generation: {
    provider: string;
    model: string;
    notes: string;
  };
  summary: {
    node_count: number;
    edge_count: number;
    condition_count: number;
    tool_count: number;
  };
};

type ValidationReport = {
  valid: boolean;
  score: number;
  issues: Array<{
    code: string;
    severity: string;
    message: string;
  }>;
};

type RevisionItem = {
  id: string;
  source: string;
  message: string;
  before_name: string;
  after_name: string;
  created_at: string;
  change_summary?: {
    reasoning?: string[];
    changes?: Array<{
      kind: string;
      label: string;
      node_type: string;
      reason: string;
    }>;
  };
};

type ComposerHistoryItem = {
  at: string;
  mode: "preview" | "apply";
  message: string;
  proposal: {
    name: string;
    description: string;
    node_count: number;
    edge_count: number;
    provider: string;
    model: string;
  };
};

type StudioAssistantPanelProps = {
  workflowId: string;
  workflowName: string;
  initialPrompt?: string;
};

function readError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const value = (payload as { error?: unknown }).error;
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return fallback;
}

export function StudioAssistantPanel({
  workflowId,
  workflowName,
  initialPrompt = "",
}: StudioAssistantPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState(initialPrompt);
  const [threadId, setThreadId] = useState("");
  const [proposal, setProposal] = useState<ProposalSummary | null>(null);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [history, setHistory] = useState<ComposerHistoryItem[]>([]);
  const [composerLoading, setComposerLoading] = useState(true);
  const [revisionsLoading, setRevisionsLoading] = useState(true);
  const [workingMode, setWorkingMode] = useState<"preview" | "apply" | "restore" | "undo" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadComposerState() {
    setComposerLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/compose`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as {
        composer?: {
          last_plan?: { reasoning?: string[]; changes?: ProposalSummary["changes"]; generation?: ProposalSummary["generation"]; summary?: ProposalSummary["summary"] };
          history?: ComposerHistoryItem[];
          last_message?: string;
        };
      };

      if (response.ok && payload.composer) {
        const lastPlan = payload.composer.last_plan;
        if (lastPlan) {
          setProposal((current) => current ?? {
            name: workflowName,
            description: "Latest assistant proposal",
            graph: { nodes: [], edges: [] },
            reasoning: Array.isArray(lastPlan.reasoning) ? lastPlan.reasoning : [],
            changes: Array.isArray(lastPlan.changes) ? lastPlan.changes : [],
            generation: lastPlan.generation ?? { provider: "unknown", model: "unknown", notes: "" },
            summary: lastPlan.summary ?? { node_count: 0, edge_count: 0, condition_count: 0, tool_count: 0 },
          });
        }
        setHistory(Array.isArray(payload.composer.history) ? payload.composer.history : []);
        if (!message && typeof payload.composer.last_message === "string") {
          setMessage(payload.composer.last_message);
        }
      }
    } finally {
      setComposerLoading(false);
    }
  }

  async function loadRevisions() {
    setRevisionsLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/revisions?limit=8`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { revisions?: RevisionItem[] };
      if (response.ok) {
        setRevisions(Array.isArray(payload.revisions) ? payload.revisions : []);
      }
    } finally {
      setRevisionsLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      setComposerLoading(true);
      setRevisionsLoading(true);

      try {
        const [composerResponse, revisionsResponse] = await Promise.all([
          fetch(`/api/workflows/${workflowId}/compose`, { cache: "no-store" }),
          fetch(`/api/workflows/${workflowId}/revisions?limit=8`, { cache: "no-store" }),
        ]);

        const composerPayload = (await composerResponse.json().catch(() => ({}))) as {
          composer?: {
            last_plan?: { reasoning?: string[]; changes?: ProposalSummary["changes"]; generation?: ProposalSummary["generation"]; summary?: ProposalSummary["summary"] };
            history?: ComposerHistoryItem[];
            last_message?: string;
          };
        };
        const revisionsPayload = (await revisionsResponse.json().catch(() => ({}))) as { revisions?: RevisionItem[] };

        if (composerResponse.ok && composerPayload.composer) {
          const lastPlan = composerPayload.composer.last_plan;
          if (lastPlan) {
            setProposal((current) => current ?? {
              name: workflowName,
              description: "Latest assistant proposal",
              graph: { nodes: [], edges: [] },
              reasoning: Array.isArray(lastPlan.reasoning) ? lastPlan.reasoning : [],
              changes: Array.isArray(lastPlan.changes) ? lastPlan.changes : [],
              generation: lastPlan.generation ?? { provider: "unknown", model: "unknown", notes: "" },
              summary: lastPlan.summary ?? { node_count: 0, edge_count: 0, condition_count: 0, tool_count: 0 },
            });
          }
          setHistory(Array.isArray(composerPayload.composer.history) ? composerPayload.composer.history : []);
          setMessage((current) => current || (typeof composerPayload.composer?.last_message === "string" ? composerPayload.composer.last_message : ""));
        }

        if (revisionsResponse.ok) {
          setRevisions(Array.isArray(revisionsPayload.revisions) ? revisionsPayload.revisions : []);
        }
      } finally {
        setComposerLoading(false);
        setRevisionsLoading(false);
      }
    })();
  }, [workflowId, workflowName]);

  async function ensureThreadId() {
    if (threadId) {
      return threadId;
    }

    const response = await fetch(`/api/workflows/${workflowId}/chat/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `${workflowName} assistant`,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { thread?: { id?: string } };
    if (!response.ok || !payload.thread?.id) {
      throw new Error("Unable to create assistant thread.");
    }

    setThreadId(payload.thread.id);
    return payload.thread.id;
  }

  async function submitCompose(mode: "preview" | "apply") {
    const trimmed = message.trim();
    if (!trimmed) {
      setErrorMessage("Write what you want the assistant to change first.");
      return;
    }

    setWorkingMode(mode);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const ensuredThreadId = await ensureThreadId();
      const response = await fetch(`/api/workflows/${workflowId}/compose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          mode,
          threadId: ensuredThreadId,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        proposal?: ProposalSummary;
        validation?: ValidationReport;
        error?: string;
        applied?: boolean;
      };

      if (!response.ok) {
        setProposal(payload.proposal ?? null);
        setValidation(payload.validation ?? null);
        setErrorMessage(readError(payload, "Assistant request failed."));
        await loadComposerState();
        return;
      }

      setProposal(payload.proposal ?? null);
      setValidation(payload.validation ?? null);
      setSuccessMessage(mode === "apply" ? "Workflow updated from assistant proposal." : "Preview ready. Review it before applying.");
      await loadComposerState();
      await loadRevisions();

      if (mode === "apply") {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Assistant request failed.");
    } finally {
      setWorkingMode(null);
    }
  }

  async function restoreRevision(revisionId: string, mode: "restore" | "undo") {
    setWorkingMode(mode);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/workflows/${workflowId}/revisions/${revisionId}/restore`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(readError(payload, "Unable to restore revision."));
        return;
      }

      setSuccessMessage(mode === "undo" ? "Last change undone." : "Revision restored successfully.");
      await loadRevisions();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to restore revision.");
    } finally {
      setWorkingMode(null);
    }
  }

  const latestRevisionId = revisions[0]?.id ?? "";
  const proposalTone = useMemo(() => {
    if (!validation) {
      return "border-stone-900/10 bg-stone-50";
    }
    return validation.valid
      ? "border-emerald-200 bg-[#eef4ef]"
      : "border-amber-200 bg-[#f7ede2]";
  }, [validation]);

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] border border-stone-900/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">Assistant composer</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Describe the change in plain language. Preview it first, then apply it when it looks right.
            </p>
          </div>
          {latestRevisionId ? (
            <button
              type="button"
              onClick={() => void restoreRevision(latestRevisionId, "undo")}
              disabled={workingMode !== null || isPending}
              className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
            >
              {workingMode === "undo" ? "Undoing..." : "Undo last change"}
            </button>
          ) : null}
        </div>

        <div className="mt-4 space-y-4">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder="Example: make this workflow better for lead qualification, add a reviewer step, and make the false branch clearer."
            className="w-full rounded-[24px] border border-stone-900/10 bg-stone-50 px-4 py-4 text-sm leading-6 text-stone-700 outline-none"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void submitCompose("preview")}
              disabled={workingMode !== null || isPending || composerLoading}
              className="rounded-full border border-stone-900/10 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
            >
              {workingMode === "preview" ? "Preparing preview..." : "Preview proposal"}
            </button>
            <button
              type="button"
              onClick={() => void submitCompose("apply")}
              disabled={workingMode !== null || isPending || composerLoading}
              className="rounded-full bg-[#ff7f5f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#f26f4d] disabled:cursor-wait disabled:opacity-60"
            >
              {workingMode === "apply" ? "Applying..." : "Apply to workflow"}
            </button>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl bg-[#f7ede2] px-4 py-3 text-sm text-amber-950">{errorMessage}</div>
          ) : null}
          {successMessage ? (
            <div className="rounded-2xl bg-[#eef4ef] px-4 py-3 text-sm text-emerald-900">{successMessage}</div>
          ) : null}
        </div>
      </div>

      <div className={`rounded-[30px] border p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] ${proposalTone}`}>
        <div>
          <p className="text-sm font-semibold text-stone-900">Proposal review</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            This is the assistant reasoning and change summary before the graph is saved.
          </p>
        </div>

        {proposal ? (
          <div className="mt-4 space-y-4 text-sm text-stone-700">
            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <p className="font-medium text-stone-900">{proposal.name}</p>
              <p className="mt-2">{proposal.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-400">
                {proposal.summary.node_count} nodes | {proposal.summary.edge_count} edges | {proposal.generation.provider} | {proposal.generation.model}
              </p>
            </div>

            {validation ? (
              <div className="rounded-2xl bg-white/80 px-4 py-3">
                <p className="font-medium text-stone-900">
                  {validation.valid ? "Looks valid" : "Needs fixes"}
                </p>
                <p className="mt-2">Validation score: {validation.score}/100</p>
                {validation.issues.length ? (
                  <div className="mt-2 space-y-1 text-sm text-stone-600">
                    {validation.issues.slice(0, 3).map((issue, index) => (
                      <p key={`${issue.code}-${index}`}>
                        <span className="font-medium uppercase text-stone-900">{issue.severity}</span>: {issue.message}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Reasoning</p>
              <div className="mt-2 space-y-2">
                {proposal.reasoning.length ? (
                  proposal.reasoning.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)
                ) : (
                  <p>No reasoning yet. Generate a preview to see the assistant plan.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Planned changes</p>
              <div className="mt-2 space-y-2">
                {proposal.changes.length ? (
                  proposal.changes.slice(0, 6).map((change, index) => (
                    <p key={`${change.node_id}-${index}`}>
                      <span className="font-medium uppercase text-stone-900">{change.kind}</span>: {change.label} ({change.node_type})
                    </p>
                  ))
                ) : (
                  <p>No change summary yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-stone-500">
            No proposal yet. Use `Preview proposal` to ask the assistant for a cleaner workflow version.
          </p>
        )}
      </div>

      <div className="rounded-[30px] border border-stone-900/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
        <div>
          <p className="text-sm font-semibold text-stone-900">Revision history</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Restore any recent workflow version with one click.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {revisionsLoading ? (
            <p className="text-sm text-stone-500">Loading revisions...</p>
          ) : revisions.length ? (
            revisions.map((revision) => (
              <div key={revision.id} className="rounded-2xl bg-stone-50 px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{revision.message || revision.after_name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                      {revision.source} | {new Date(revision.created_at).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      {revision.before_name} to {revision.after_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void restoreRevision(revision.id, "restore")}
                    disabled={workingMode !== null || isPending}
                    className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-wait disabled:opacity-60"
                  >
                    {workingMode === "restore" ? "Restoring..." : "Restore"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">No revisions yet. Applying assistant changes will start filling this history.</p>
          )}
        </div>
      </div>

      <div className="rounded-[30px] border border-stone-900/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
        <div>
          <p className="text-sm font-semibold text-stone-900">Assistant activity</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Recent preview and apply requests made for this workflow.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {composerLoading ? (
            <p className="text-sm text-stone-500">Loading assistant history...</p>
          ) : history.length ? (
            history.slice().reverse().slice(0, 6).map((item, index) => (
              <div key={`${item.at}-${index}`} className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-sm font-medium text-stone-900">{item.message}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                  {item.mode} | {new Date(item.at).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  {item.proposal.name} | {item.proposal.node_count} nodes | {item.proposal.provider}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">No assistant activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}


