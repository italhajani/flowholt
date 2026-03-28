"use client";

import { useEffect, useEffectEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  IconCheck,
  IconClock,
  IconMessage,
  IconPlus,
  IconSparkles,
  IconX,
} from "@/components/icons";

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

export type StudioAssistantPanelProps = {
  workflowId: string;
  workflowName: string;
  initialPrompt?: string;
  prefillMessage?: string;
  autoSubmitMessage?: boolean;
  autoPreviewResourceKitKey?: string;
  clearAutoPreviewUrl?: string;
  resourceSuggestions?: ResourceSuggestion[];
  onClose?: () => void;
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

function formatStamp(value: string | null | undefined) {
  if (!value) {
    return "Now";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Now";
  }

  return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatWho(role: ThreadMessage["role"]) {
  if (role === "assistant") {
    return "Workflow Agent";
  }

  if (role === "system") {
    return "System";
  }

  return "You";
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
  onClose,
}: StudioAssistantPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState(prefillMessage || initialPrompt);
  const [threadId, setThreadId] = useState("");
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [proposal, setProposal] = useState<ProposalSummary | null>(null);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
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
      };

      setProposal(payload.proposal ?? null);
      setValidation(payload.validation ?? null);

      if (!response.ok) {
        setErrorMessage(readError(payload, "Assistant request failed."));
      } else {
        setSuccessMessage(mode === "apply" ? "Applied to canvas." : "Ready to review.");
      }

      await Promise.all([loadComposerState(), loadRevisions(), loadThreads(ensuredThreadId)]);

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
  }, [autoPreviewResourceKitKey, autoPreviewState, clearAutoPreviewUrl, prefillMessage, workflowId]);

  const thoughtSteps = useMemo(() => proposal?.reasoning?.slice(0, 4) ?? [], [proposal]);
  const recentMessages = useMemo(() => messages.slice(-8), [messages]);
  const latestChange = proposal?.changes?.[0] ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-[58px] items-center justify-between border-b border-[#ece8e1] px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#1f1f1d] text-white">
            <span className="text-[11px] font-semibold">AI</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#141413]">Workflow Agent</p>
            <p className="text-[12px] text-[#9a9387]">AI-powered workflow builder</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="inline-flex h-7 w-7 items-center justify-center text-[#7b756b] transition-smooth hover:bg-[#f6f4ef]"
            aria-label="New chat"
          >
            <IconPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center text-[#7b756b] transition-smooth hover:bg-[#f6f4ef]"
            aria-label="Close chat"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#faf8f4] px-3 py-3">
        <div className="space-y-3">
          {thoughtSteps.length ? (
            <div className="border border-[#e7e2d8] bg-[#f1efea] px-3 py-3">
              <div className="mb-2 flex items-center gap-2 text-[#59544c]">
                <IconSparkles className="h-4 w-4" />
                <p className="text-[12px] font-medium">Thought process</p>
              </div>
              <div className="space-y-2">
                {thoughtSteps.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-start gap-2 text-[13px] leading-6 text-[#3f3b36]">
                    <IconCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-[#27a35b]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {messagesLoading || threadsLoading ? (
            <div className="px-1 py-2 text-[13px] text-[#8d877c]">Loading conversation...</div>
          ) : recentMessages.length ? (
            recentMessages.map((item) => {
              const assistant = item.role === "assistant";
              return (
                <div key={item.id} className={`flex ${assistant ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[88%] ${assistant ? "" : "text-right"}`}>
                    <div className={`mb-1 flex items-center gap-2 text-[11px] text-[#a39b8f] ${assistant ? "justify-start" : "justify-end"}`}>
                      <span>{formatWho(item.role)}</span>
                      <span>-</span>
                      <span>{formatStamp(item.created_at)}</span>
                    </div>
                    <div className={`border px-3 py-3 text-[14px] leading-6 ${assistant ? "border-[#e8e2d8] bg-white text-[#181715]" : "border-[#eadfce] bg-[#fffaf3] text-[#181715]"}`}>
                      {item.message}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-dashed border-[#dfd9ce] bg-white/60 px-4 py-5 text-[13px] leading-6 text-[#8b857a]">
              Ask anything about this workflow and the agent will suggest nodes, edits, and changes here.
            </div>
          )}

          {latestChange ? (
            <div className="border border-[#ded7cb] bg-white">
              <div className="border-b border-[#efe9de] px-3 py-2 text-[13px] font-medium text-[#181715]">
                New node - {latestChange.label}
              </div>
              <div className="space-y-2 px-3 py-3 text-[12px] text-[#6d675d]">
                <div className="flex items-center justify-between gap-3 border-b border-[#f3eee5] pb-2">
                  <span>Type</span>
                  <span className="font-medium text-[#181715]">{latestChange.node_type}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-[#f3eee5] pb-2">
                  <span>Change</span>
                  <span className="font-medium capitalize text-[#181715]">{latestChange.kind}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Validation</span>
                  <span className="font-medium text-[#181715]">{validation ? `${validation.score}/100` : "Ready"}</span>
                </div>
                <p className="pt-1 text-[12px] leading-5 text-[#7b756b]">{latestChange.reason}</p>
              </div>
              <div className="flex gap-2 border-t border-[#efe9de] px-3 py-3">
                <button
                  type="button"
                  onClick={() => void submitCompose("apply")}
                  disabled={workingMode !== null || isPending || composerLoading}
                  className="inline-flex h-8 items-center justify-center bg-[#1f1f1d] px-3 text-[12px] font-medium text-white transition-smooth hover:bg-[#2c2b28] disabled:cursor-wait disabled:opacity-60"
                >
                  {workingMode === "apply" ? "Applying..." : "Apply to canvas"}
                </button>
                <button
                  type="button"
                  onClick={() => setMessage(latestChange.reason)}
                  className="inline-flex h-8 items-center justify-center border border-[#ddd6ca] bg-white px-3 text-[12px] font-medium text-[#38342f] transition-smooth hover:bg-[#f7f4ee]"
                >
                  Edit first
                </button>
              </div>
            </div>
          ) : null}

          {resourceSuggestions.length ? (
            <div className="space-y-2">
              {resourceSuggestions.slice(0, 2).map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => void previewResourceSuggestion(suggestion)}
                  className="w-full border border-[#e4ddd1] bg-white px-3 py-3 text-left transition-smooth hover:bg-[#fcfaf6]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium text-[#181715]">{suggestion.title}</p>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#a39b8f]">{suggestion.readiness}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-[#7d766b]">{suggestion.why}</p>
                </button>
              ))}
            </div>
          ) : null}

          {workingMode ? (
            <div className="flex items-center gap-2 px-1 py-1 text-[13px] text-[#6e685f]">
              <IconClock className="h-4 w-4" />
              <span>{workingMode === "preview" ? "Thinking..." : workingMode === "apply" ? "Applying change..." : "Working..."}</span>
            </div>
          ) : null}

          {revisionsLoading ? null : revisions.length ? (
            <div className="px-1 text-[11px] text-[#a39b8f]">{revisions.length} recent revisions available</div>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#ece8e1] bg-white px-3 py-3">
        {errorMessage ? (
          <div className="mb-2 border border-[#f2d7ca] bg-[#fff6f1] px-3 py-2 text-[12px] text-[#b45309]">{errorMessage}</div>
        ) : null}
        {successMessage ? (
          <div className="mb-2 border border-[#cfe7d7] bg-[#eff7f1] px-3 py-2 text-[12px] text-[#1f6e47]">{successMessage}</div>
        ) : null}

        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-[#8f887c]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#27a35b]" />
            <span>Aware of canvas context</span>
          </div>
          <span>{threads.length ? `${threads.length} thread${threads.length === 1 ? "" : "s"}` : "Ready to send"}</span>
        </div>

        <div className="flex items-end gap-2 border border-[#e0d9ce] bg-[#fbfaf7] p-2">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            placeholder="Ask anything about this workflow..."
            className="min-h-[40px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[13px] leading-6 text-[#1a1917] outline-none"
          />
          <button
            type="button"
            onClick={() => void submitCompose("preview")}
            disabled={workingMode !== null || isPending || composerLoading}
            className="inline-flex h-9 w-9 items-center justify-center bg-[#1f1f1d] text-white transition-smooth hover:bg-[#2c2b28] disabled:cursor-wait disabled:opacity-60"
            aria-label="Send to workflow agent"
          >
            <IconMessage className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
