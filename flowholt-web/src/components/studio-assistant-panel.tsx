"use client";

import { ReactNode, useEffect, useEffectEvent, useMemo, useState, useTransition } from "react";
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

type WorkflowRevisionCompareResponse = {
  revision: {
    id: string;
    workflow_id: string;
    source: string;
    message: string;
    created_at: string;
    before_name: string;
    after_name: string;
  };
  comparison: {
    before: {
      name: string;
      description: string;
      node_count: number;
      edge_count: number;
    };
    after: {
      name: string;
      description: string;
      node_count: number;
      edge_count: number;
    };
    flags: {
      name_changed: boolean;
      description_changed: boolean;
    };
    added_nodes: Array<{ id: string; label: string; type: string }>;
    removed_nodes: Array<{ id: string; label: string; type: string }>;
    changed_nodes: Array<{
      id: string;
      before_label: string;
      after_label: string;
      before_type: string;
      after_type: string;
      config_changed: boolean;
    }>;
    added_edges: Array<{ source: string; target: string; label: string; branch: string }>;
    removed_edges: Array<{ source: string; target: string; label: string; branch: string }>;
    summary_lines: string[];
  };
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

type ThreadItem = {
  id: string;
  title: string;
  status: string;
  last_message_at: string | null;
  updated_at: string;
};

type ThreadMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type ResourceSuggestion = {
  id: string;
  kitKey: string;
  title: string;
  readiness: "ready" | "partial" | "missing";
  tone: "default" | "mint" | "sand";
  prompt: string;
  strategy: string;
  why: string;
  profiles: string[];
};

type StudioAssistantPanelProps = {
  workflowId: string;
  workflowName: string;
  initialPrompt?: string;
  prefillMessage?: string;
  autoSubmitMessage?: boolean;
  autoPreviewResourceKitKey?: string;
  clearAutoPreviewUrl?: string;
  resourceSuggestions?: ResourceSuggestion[];
};

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const value = (payload as { error?: unknown }).error;
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return fallback;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Just now";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Just now";
  }

  return parsed.toLocaleString();
}

function messageTone(role: ThreadMessage["role"]) {
  if (role === "assistant") {
    return "ml-6 border-violet-200 bg-violet-50/80";
  }

  if (role === "system") {
    return "mx-3 border-amber-200 bg-amber-50/80";
  }

  return "mr-6 border-stone-900/10 bg-white";
}

function messageLabel(role: ThreadMessage["role"]) {
  if (role === "assistant") {
    return "FlowHolt assistant";
  }

  if (role === "system") {
    return "System";
  }

  return "You";
}

function metadataBadges(metadata: Record<string, unknown>) {
  const badges: string[] = [];
  const mode = asString(metadata.mode);
  const source = asString(metadata.source);
  const applied = metadata.applied === true;
  const valid = metadata.valid === true;

  if (mode) {
    badges.push(mode);
  }
  if (applied) {
    badges.push("applied");
  }
  if (valid) {
    badges.push("valid");
  }
  if (source && source !== "compose") {
    badges.push(source);
  }

  return badges.slice(0, 3);
}

type AssistantSectionProps = {
  title: string;
  subtitle: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function AssistantSection({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: AssistantSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-[20px] border border-black/6 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition hover:bg-[#f7f7f5]"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-900">{title}</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge ? (
            <span className="rounded-full bg-[#f4f4f2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {badge}
            </span>
          ) : null}
          <span className="rounded-full border border-black/8 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {open ? "Hide" : "Show"}
          </span>
        </div>
      </button>
      {open ? <div className="border-t border-black/6 px-3 py-3">{children}</div> : null}
    </section>
  );
}

export function StudioAssistantPanel({
  workflowId,
  workflowName,
  initialPrompt = "",
  prefillMessage = "",
  autoSubmitMessage = false,
  autoPreviewResourceKitKey = "",
  clearAutoPreviewUrl = "",
  resourceSuggestions = [],
}: StudioAssistantPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState(prefillMessage || initialPrompt);
  const [threadId, setThreadId] = useState("");
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [proposal, setProposal] = useState<ProposalSummary | null>(null);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [history, setHistory] = useState<ComposerHistoryItem[]>([]);
  const [compareRevisionId, setCompareRevisionId] = useState("");
  const [compareData, setCompareData] = useState<WorkflowRevisionCompareResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [composerLoading, setComposerLoading] = useState(true);
  const [revisionsLoading, setRevisionsLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [workingMode, setWorkingMode] = useState<"preview" | "apply" | "restore" | "undo" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [autoPreviewState, setAutoPreviewState] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadComposerState() {
    setComposerLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/compose`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as {
        composer?: {
          last_plan?: {
            reasoning?: string[];
            changes?: ProposalSummary["changes"];
            generation?: ProposalSummary["generation"];
            summary?: ProposalSummary["summary"];
          };
          history?: ComposerHistoryItem[];
          last_message?: string;
        };
      };

      if (response.ok && payload.composer) {
        const lastPlan = payload.composer.last_plan;
        if (lastPlan) {
          setProposal((current) =>
            current ?? {
              name: workflowName,
              description: "Latest assistant proposal",
              graph: { nodes: [], edges: [] },
              reasoning: Array.isArray(lastPlan.reasoning) ? lastPlan.reasoning : [],
              changes: Array.isArray(lastPlan.changes) ? lastPlan.changes : [],
              generation: lastPlan.generation ?? { provider: "unknown", model: "unknown", notes: "" },
              summary:
                lastPlan.summary ?? {
                  node_count: 0,
                  edge_count: 0,
                  condition_count: 0,
                  tool_count: 0,
                },
            },
          );
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
        const nextRevisions = Array.isArray(payload.revisions) ? payload.revisions : [];
        setRevisions(nextRevisions);
        if (compareRevisionId && !nextRevisions.some((revision) => revision.id === compareRevisionId)) {
          setCompareRevisionId("");
          setCompareData(null);
        }
      }
    } finally {
      setRevisionsLoading(false);
    }
  }

  async function loadThreads(preferredThreadId = "") {
    setThreadsLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/chat/threads?limit=10`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as { threads?: ThreadItem[] };
      if (!response.ok) {
        return;
      }

      const nextThreads = Array.isArray(payload.threads) ? payload.threads : [];
      setThreads(nextThreads);

      const chosenThreadId = preferredThreadId || threadId || nextThreads[0]?.id || "";
      if (chosenThreadId) {
        setThreadId(chosenThreadId);
        await loadMessages(chosenThreadId);
      } else {
        setMessages([]);
      }
    } finally {
      setThreadsLoading(false);
    }
  }

  async function loadMessages(targetThreadId: string) {
    if (!targetThreadId) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    try {
      const response = await fetch(
        `/api/workflows/${workflowId}/chat/threads/${targetThreadId}/messages?limit=50`,
        { cache: "no-store" },
      );
      const payload = (await response.json().catch(() => ({}))) as { messages?: Array<Record<string, unknown>> };
      if (!response.ok) {
        setMessages([]);
        return;
      }

      const nextMessages = (Array.isArray(payload.messages) ? payload.messages : []).map((item) => {
        const row = asRecord(item);
        const role = asString(row.role, "user");
        return {
          id: asString(row.id, crypto.randomUUID()),
          role: role === "assistant" || role === "system" ? role : "user",
          message: asString(row.message),
          metadata: asRecord(row.metadata),
          created_at: asString(row.created_at),
        } satisfies ThreadMessage;
      });

      setMessages(nextMessages);
    } finally {
      setMessagesLoading(false);
    }
  }

  const loadInitialSidebarState = useEffectEvent(async () => {
    await Promise.all([loadComposerState(), loadRevisions(), loadThreads()]);
  });

  useEffect(() => {
    void loadInitialSidebarState();
  }, [workflowId, workflowName]);

  useEffect(() => {
    if (prefillMessage.trim()) {
      setMessage(prefillMessage.trim());
    }
  }, [prefillMessage]);

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

    const payload = (await response.json().catch(() => ({}))) as { thread?: { id?: string; title?: string } };
    if (!response.ok || !payload.thread?.id) {
      throw new Error("Unable to create assistant thread.");
    }

    setThreadId(payload.thread.id);
    setThreads((current) => [
      {
        id: payload.thread!.id!,
        title: payload.thread?.title ?? `${workflowName} assistant`,
        status: "active",
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...current,
    ]);
    return payload.thread.id;
  }

  async function loadRevisionCompare(revisionId: string) {
    if (compareRevisionId === revisionId && compareData) {
      setCompareRevisionId("");
      setCompareData(null);
      return;
    }

    setCompareRevisionId(revisionId);
    setCompareLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/workflows/${workflowId}/revisions/${revisionId}/compare`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as WorkflowRevisionCompareResponse & {
        error?: string;
      };

      if (!response.ok) {
        setCompareData(null);
        setErrorMessage(readError(payload, "Unable to compare revision."));
        return;
      }

      setCompareData(payload);
    } catch (error) {
      setCompareData(null);
      setErrorMessage(error instanceof Error ? error.message : "Unable to compare revision.");
    } finally {
      setCompareLoading(false);
    }
  }

  async function submitCompose(mode: "preview" | "apply", overrideMessage?: string, resourceKitKey = "") {
    const trimmed = (overrideMessage ?? message).trim();
    if (!trimmed) {
      setErrorMessage("Write what you want the assistant to change first.");
      return false;
    }

    if (overrideMessage) {
      setMessage(trimmed);
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
          resourceKitKey,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        proposal?: ProposalSummary;
        validation?: ValidationReport;
        error?: string;
        applied?: boolean;
      };

      setProposal(payload.proposal ?? null);
      setValidation(payload.validation ?? null);

      if (!response.ok) {
        setErrorMessage(readError(payload, "Assistant request failed."));
      } else {
        setSuccessMessage(
          mode === "apply"
            ? "Workflow updated from assistant proposal."
            : "Preview ready. Review it before applying.",
        );
      }

      await Promise.all([
        loadComposerState(),
        loadRevisions(),
        loadThreads(ensuredThreadId),
      ]);

      if (response.ok && mode === "apply") {
        startTransition(() => {
          router.refresh();
        });
      }

      return response.ok;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Assistant request failed.");
      return false;
    } finally {
      setWorkingMode(null);
    }
  }

  async function previewResourceSuggestion(suggestion: ResourceSuggestion) {
    await submitCompose("preview", suggestion.prompt, suggestion.kitKey);
  }

  const runAutoMessagePreview = useEffectEvent(async (nextMessage: string) => {
    const ok = await submitCompose("preview", nextMessage);
    if (ok && clearAutoPreviewUrl) {
      router.replace(clearAutoPreviewUrl, { scroll: false });
    }
  });

  const runAutoPreview = useEffectEvent(async (nextMessage: string, nextKitKey: string) => {
    const ok = await submitCompose("preview", nextMessage, nextKitKey);
    if (ok && clearAutoPreviewUrl) {
      router.replace(clearAutoPreviewUrl, { scroll: false });
    }
  });

  useEffect(() => {
    const trimmedPrefill = prefillMessage.trim();
    if (!autoSubmitMessage || !trimmedPrefill) {
      return;
    }

    const autoMessageKey = `${workflowId}:message:${trimmedPrefill}`;
    if (autoPreviewState === autoMessageKey) {
      return;
    }

    setAutoPreviewState(autoMessageKey);
    void runAutoMessagePreview(trimmedPrefill);
  }, [autoPreviewState, autoSubmitMessage, prefillMessage, workflowId]);

  useEffect(() => {
    const trimmedPrefill = prefillMessage.trim();
    const trimmedKit = autoPreviewResourceKitKey.trim();
    const autoPreviewKey = trimmedPrefill && trimmedKit
      ? `${workflowId}:${trimmedKit}:${trimmedPrefill}`
      : "";

    if (!autoPreviewKey || autoPreviewState === autoPreviewKey) {
      return;
    }

    setAutoPreviewState(autoPreviewKey);

    void runAutoPreview(trimmedPrefill, trimmedKit);
  }, [
    autoPreviewResourceKitKey,
    autoPreviewState,
    clearAutoPreviewUrl,
    prefillMessage,
    workflowId,
  ]);

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
      await Promise.all([loadRevisions(), loadComposerState(), loadThreads(threadId)]);
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
    return validation.valid ? "border-emerald-200 bg-[#eef4ef]" : "border-amber-200 bg-[#f7ede2]";
  }, [validation]);

  const threadSummary = useMemo(() => {
    if (!threads.length) {
      return "No conversation yet";
    }

    return `${threads.length} thread${threads.length === 1 ? "" : "s"}`;
  }, [threads]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0 rounded-[22px] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,241,234,0.94))] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">Assistant</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">Describe the change, preview it, then apply when it looks right.</p>
          </div>
          {latestRevisionId ? (
            <button
              type="button"
              onClick={() => void restoreRevision(latestRevisionId, "undo")}
              disabled={workingMode !== null || isPending}
              className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
            >
              {workingMode === "undo" ? "Undoing..." : "Undo"}
            </button>
          ) : null}
        </div>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          placeholder="Example: add a reviewer step before publish and make the success path clearer."
          className="mt-3 w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm leading-6 text-stone-700 outline-none transition focus:border-[#ea6f49]"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          <span className="rounded-full bg-white px-3 py-1">{threadSummary}</span>
          {threadId ? <span className="rounded-full bg-white px-3 py-1">Active thread</span> : null}
          {proposal ? <span className="rounded-full bg-white px-3 py-1">{proposal.summary.node_count} nodes planned</span> : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void submitCompose("preview")}
            disabled={workingMode !== null || isPending || composerLoading}
            className="rounded-[12px] border border-black/8 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
          >
            {workingMode === "preview" ? "Preparing..." : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => void submitCompose("apply")}
            disabled={workingMode !== null || isPending || composerLoading}
            className="rounded-[12px] bg-[#ff7f5f] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#f26f4d] disabled:cursor-wait disabled:opacity-60"
          >
            {workingMode === "apply" ? "Applying..." : "Apply change"}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-3 rounded-[14px] bg-[#f7ede2] px-3 py-2 text-sm text-amber-950">{errorMessage}</div>
        ) : null}
        {successMessage ? (
          <div className="mt-3 rounded-[14px] bg-[#eef4ef] px-3 py-2 text-sm text-emerald-900">{successMessage}</div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {resourceSuggestions.length ? (
          <AssistantSection
            title="Suggested from your resources"
            subtitle="Ready packs that can start a cleaner workflow draft."
            badge={`${resourceSuggestions.length} ideas`}
          >
            <div className="space-y-2">
              {resourceSuggestions.slice(0, 4).map((suggestion) => (
                <div key={suggestion.id} className="rounded-[16px] border border-black/6 bg-[#f8f7f4] px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{suggestion.title}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-500">{suggestion.why}</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      {suggestion.readiness}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMessage(suggestion.prompt);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
                    >
                      Use idea
                    </button>
                    <button
                      type="button"
                      onClick={() => void previewResourceSuggestion(suggestion)}
                      disabled={workingMode !== null || isPending || composerLoading}
                      className="rounded-[10px] bg-stone-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"
                    >
                      Preview pack
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AssistantSection>
        ) : null}

        <AssistantSection
          title="Conversation"
          subtitle="Keep the latest request and assistant replies in one place."
          badge={threadsLoading ? "Loading" : threadSummary}
          defaultOpen
        >
          {threads.length ? (
            <div className="flex flex-wrap gap-2">
              {threads.slice(0, 4).map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => {
                    setThreadId(thread.id);
                    void loadMessages(thread.id);
                  }}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                    thread.id === threadId
                      ? "bg-stone-900 text-white"
                      : "border border-stone-900/10 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {thread.title}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {messagesLoading ? (
              <p className="text-sm text-stone-500">Loading conversation...</p>
            ) : messages.length ? (
              messages.slice(-8).map((item) => {
                const badges = metadataBadges(item.metadata);
                return (
                  <div key={item.id} className={`rounded-[16px] border px-3 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)] ${messageTone(item.role)}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                        {messageLabel(item.role)}
                      </p>
                      <p className="text-[11px] text-stone-400">{formatDateTime(item.created_at)}</p>
                    </div>
                    {badges.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {badges.map((badge) => (
                          <span
                            key={`${item.id}-${badge}`}
                            className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{item.message}</p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[14px] bg-stone-50 px-3 py-3 text-sm leading-6 text-stone-500">
                No assistant conversation yet. Write a request above and click Preview.
              </div>
            )}
          </div>
        </AssistantSection>

        <AssistantSection
          title="Reasoning"
          subtitle="Preview summary, validation, and the planned node changes."
          badge={proposal ? `${proposal.summary.node_count} nodes` : "Empty"}
          defaultOpen={Boolean(proposal)}
        >
          {proposal ? (
            <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1 text-sm text-stone-700">
              <div className={`rounded-[16px] border px-3 py-3 ${proposalTone}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{proposal.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{proposal.description}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    {proposal.generation.provider} | {proposal.generation.model}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  <span className="rounded-full bg-white px-2.5 py-1">{proposal.summary.edge_count} edges</span>
                  <span className="rounded-full bg-white px-2.5 py-1">{proposal.summary.tool_count} tools</span>
                  {validation ? <span className="rounded-full bg-white px-2.5 py-1">Score {validation.score}</span> : null}
                </div>
              </div>

              {validation?.issues.length ? (
                <div className="rounded-[16px] bg-white px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Validation</p>
                  <div className="mt-2 space-y-2">
                    {validation.issues.slice(0, 3).map((issue, index) => (
                      <p key={`${issue.code}-${index}`} className="text-sm text-stone-600">
                        <span className="font-medium uppercase text-stone-900">{issue.severity}</span>: {issue.message}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[16px] bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Reasoning steps</p>
                <div className="mt-2 space-y-2">
                  {proposal.reasoning.length ? (
                    proposal.reasoning.slice(0, 5).map((item, index) => (
                      <div key={`${item}-${index}`} className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold text-white">
                          {index + 1}
                        </div>
                        <p className="pt-0.5 leading-6 text-stone-700">{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-500">No reasoning yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[16px] bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Planned changes</p>
                <div className="mt-2 space-y-2">
                  {proposal.changes.length ? (
                    proposal.changes.slice(0, 5).map((change, index) => (
                      <div key={`${change.node_id}-${index}`} className="rounded-[14px] bg-stone-50 px-3 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-stone-900">{change.label}</p>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                            {change.kind} | {change.node_type}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-stone-600">{change.reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-500">No planned changes yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-stone-500">No proposal yet. Use Preview to see the plan.</p>
          )}
        </AssistantSection>

        <AssistantSection
          title="Revision history"
          subtitle="Compare or restore recent workflow versions without leaving Studio."
          badge={revisions.length ? `${revisions.length} recent` : "Empty"}
        >
          <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
            {revisionsLoading ? (
              <p className="text-sm text-stone-500">Loading revisions...</p>
            ) : revisions.length ? (
              revisions.map((revision) => {
                const isCompareOpen = compareRevisionId === revision.id && compareData?.revision.id === revision.id;
                const comparison = isCompareOpen ? compareData?.comparison : null;
                const compareSummary = isCompareOpen ? compareData?.change_summary : undefined;

                return (
                  <div key={revision.id} className="rounded-[16px] bg-stone-50 px-3 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{revision.message || revision.after_name}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          {revision.source} | {new Date(revision.created_at).toLocaleString()}
                        </p>
                        <p className="mt-2 text-sm text-stone-600">
                          {revision.before_name} to {revision.after_name}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void loadRevisionCompare(revision.id)}
                          disabled={(compareLoading && compareRevisionId === revision.id) || workingMode !== null || isPending}
                          className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-wait disabled:opacity-60"
                        >
                          {compareLoading && compareRevisionId === revision.id
                            ? "Comparing..."
                            : isCompareOpen
                              ? "Hide"
                              : "Compare"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void restoreRevision(revision.id, "restore")}
                          disabled={workingMode !== null || isPending}
                          className="rounded-[10px] border border-black/8 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-wait disabled:opacity-60"
                        >
                          {workingMode === "restore" ? "Restoring..." : "Restore"}
                        </button>
                      </div>
                    </div>

                    {isCompareOpen && comparison ? (
                      <div className="mt-3 rounded-[14px] border border-black/6 bg-white px-3 py-3">
                        <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                          <span className="rounded-full bg-stone-100 px-2.5 py-1">{comparison.before.node_count} before</span>
                          <span className="rounded-full bg-stone-100 px-2.5 py-1">{comparison.after.node_count} after</span>
                          <span className="rounded-full bg-stone-100 px-2.5 py-1">{comparison.added_edges.length} links added</span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                          {comparison.summary_lines.map((line, index) => (
                            <p key={`${revision.id}-summary-${index}`}>{line}</p>
                          ))}
                        </div>
                        {compareSummary?.reasoning?.length ? (
                          <div className="mt-3 rounded-[12px] bg-[#f6f1ea] px-3 py-3 text-sm text-stone-600">
                            {compareSummary.reasoning.slice(0, 3).map((item, index) => (
                              <p key={`${revision.id}-reasoning-${index}`}>{item}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-stone-500">No revisions yet.</p>
            )}
          </div>
        </AssistantSection>

        <AssistantSection
          title="Assistant activity"
          subtitle="Recent preview and apply requests for this workflow."
          badge={history.length ? `${history.length} events` : "Empty"}
        >
          <div className="space-y-2">
            {composerLoading ? (
              <p className="text-sm text-stone-500">Loading assistant history...</p>
            ) : history.length ? (
              history.slice().reverse().slice(0, 6).map((item, index) => (
                <div key={`${item.at}-${index}`} className="rounded-[14px] bg-stone-50 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stone-900">{item.message}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      {item.mode}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-stone-400">
                    {new Date(item.at).toLocaleString()}
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
        </AssistantSection>
      </div>
    </div>
  );
}