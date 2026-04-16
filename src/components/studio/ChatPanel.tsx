import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Loader2, Maximize2, MessageSquareText, Minimize2, Paperclip, Play, Plus, Settings, Sparkles, Workflow, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AssistantComposer from "@/components/chat/AssistantComposer";
import { api, chatThreadsQueryKey, type ApiAssistantWorkflowSummaryResponse, type ApiChatAttachment, type ApiWorkflowEdge, type ApiWorkflowStep } from "@/lib/api";
import { cn } from "@/lib/utils";

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error
      ? error.name === "AbortError"
      : false;
}

interface ChatAction {
  type: "add_steps" | "run_workflow" | "open_node";
  label: string;
  steps?: ApiWorkflowStep[];
  edges?: ApiWorkflowEdge[];
  step_id?: string;
}

interface ChatPanelProps {
  open: boolean;
  maximized: boolean;
  onClose: () => void;
  onToggleMaximize: () => void;
  workflowId?: string;
  workflowName?: string;
  stepCount?: number;
  initialPrompt?: string;
  onAddSteps?: (steps: ApiWorkflowStep[], edges: ApiWorkflowEdge[]) => void;
  onRunWorkflow?: () => void;
  onSelectNode?: (stepId: string) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
  attachments?: ApiChatAttachment[];
  pending?: boolean;
}

function createMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatAttachmentSize(sizeBytes: number): string {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return blocks.map((block, index) => {
    if (block.startsWith("```") && block.endsWith("```")) {
      const inner = block.slice(3, -3).replace(/^\w+\n/, "");
      return (
        <pre key={index} className="my-3 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 font-mono text-[12px] text-slate-100 whitespace-pre-wrap">
          {inner}
        </pre>
      );
    }

    const parts = block.split(/(\*\*.*?\*\*|`[^`]+`)/g);
    return (
      <span key={index}>
        {parts.map((part, innerIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={innerIndex} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={innerIndex} className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-indigo-700">
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={innerIndex}>{part}</span>;
        })}
      </span>
    );
  });
}

function buildWorkflowIntro(
  workflowName: string,
  stepCount: number,
  summary: ApiAssistantWorkflowSummaryResponse | null,
): string {
  const parts = [`Working on **${workflowName}** with **${stepCount}** node${stepCount !== 1 ? "s" : ""}.`];

  if (summary?.summary) {
    parts.push(summary.summary);
  } else if (stepCount === 0) {
    parts.push("This canvas is empty. I can draft the first path, suggest a trigger, or scaffold a working starter flow.");
  } else {
    parts.push("I can extend this workflow, explain the current path, tighten error handling, or help repair weak spots.");
  }

  if (summary?.notable_steps.length) {
    parts.push(`Notable steps: **${summary.notable_steps.slice(0, 3).join("**, **")}**.`);
  }

  if (summary?.warnings.length) {
    parts.push(`Attention areas: ${summary.warnings.slice(0, 2).join(" ")}`);
  }

  parts.push("Ask for a change, an explanation, or a concrete improvement and I will work from the current workflow state.");
  return parts.join("\n\n");
}

function buildWorkflowSuggestions(
  stepCount: number,
  summary: ApiAssistantWorkflowSummaryResponse | null,
): string[] {
  const suggestions: string[] = [];

  if (summary?.warnings.length) {
    suggestions.push("Repair validation issues", "Add error handling");
  }

  if (stepCount === 0) {
    suggestions.push("Build a starter workflow", "Add a trigger", "Suggest the first three nodes");
  } else {
    suggestions.push("Explain this workflow", "Extend this workflow", "Optimize this workflow");
  }

  if (summary?.notable_steps.length) {
    suggestions.push(`Review ${summary.notable_steps[0]}`);
  }

  return Array.from(new Set(suggestions)).slice(0, 4);
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  open,
  maximized,
  onClose,
  onToggleMaximize,
  workflowId,
  workflowName = "Workflow",
  stepCount = 0,
  initialPrompt,
  onAddSteps,
  onRunWorkflow,
  onSelectNode,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: createMessageId(),
      role: "assistant",
      content: buildWorkflowIntro(workflowName, stepCount, null),
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(() => buildWorkflowSuggestions(stepCount, null));
  const [loading, setLoading] = useState(false);
  const [workflowSummary, setWorkflowSummary] = useState<ApiAssistantWorkflowSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ApiChatAttachment[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialPromptSent = useRef(false);
  const previousWorkflowId = useRef<string | undefined>(workflowId);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const { data: sharedThreads = [] } = useQuery({
    queryKey: chatThreadsQueryKey,
    queryFn: () => api.listChatThreads().then((response) => response.threads),
    enabled: open,
    placeholderData: (previous) => previous ?? [],
    select: (threads) => threads.slice(0, 6),
  });

  const hasUserConversation = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );
  const introMessage = messages[0]?.role === "assistant" ? messages[0] : null;
  const visibleMessages = introMessage ? messages.slice(1) : messages;

  useEffect(() => {
    if (previousWorkflowId.current === workflowId) {
      return;
    }

    streamAbortRef.current?.abort();
    previousWorkflowId.current = workflowId;
    initialPromptSent.current = false;
    setWorkflowSummary(null);
    setMessages([
      {
        id: createMessageId(),
        role: "assistant",
        content: buildWorkflowIntro(workflowName, stepCount, null),
      },
    ]);
    setSuggestions(buildWorkflowSuggestions(stepCount, null));
    setPendingAttachments([]);
  }, [stepCount, workflowId, workflowName]);

  useEffect(() => {
    if (!open) {
      streamAbortRef.current?.abort();
    }
  }, [open]);

  useEffect(() => () => {
    streamAbortRef.current?.abort();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleAction = useCallback(
    (action: ChatAction) => {
      if (action.type === "add_steps" && action.steps && onAddSteps) {
        onAddSteps(action.steps, action.edges ?? []);
        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            role: "assistant",
            content: `Added ${action.steps.length} node${action.steps.length !== 1 ? "s" : ""} to the canvas. Configure the new nodes, then run the workflow to validate the path.`,
          },
        ]);
        setSuggestions(["Configure all nodes", "Run this workflow", "Add more steps"]);
      } else if (action.type === "run_workflow" && onRunWorkflow) {
        onRunWorkflow();
      } else if (action.type === "open_node" && action.step_id && onSelectNode) {
        onSelectNode(action.step_id);
      }
    },
    [onAddSteps, onRunWorkflow, onSelectNode],
  );

  const handleAttachClick = useCallback(() => {
    attachmentInputRef.current?.click();
  }, []);

  const handleAttachmentSelection = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedFiles.length) {
      return;
    }

    try {
      setUploadingAttachments(true);
      const response = await api.uploadChatAttachments(selectedFiles);
      setPendingAttachments((current) => current.concat(response.attachments));
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          content: `I couldn't upload those files: ${error instanceof Error ? error.message : "Upload failed."}`,
        },
      ]);
    } finally {
      setUploadingAttachments(false);
    }
  }, []);

  const handleRemovePendingAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  }, []);

  const handleDownloadAttachment = useCallback(async (attachment: ApiChatAttachment) => {
    try {
      const blob = await api.downloadChatAttachment(attachment.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          content: `I couldn't download ${attachment.file_name}: ${error instanceof Error ? error.message : "Download failed."}`,
        },
      ]);
    }
  }, []);

  const renderAttachmentPills = useCallback((attachments: ApiChatAttachment[] | undefined, tone: "light" | "dark") => {
    if (!attachments?.length) {
      return null;
    }

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <button
            key={attachment.id}
            type="button"
            onClick={() => void handleDownloadAttachment(attachment)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-[12px] transition-colors",
              tone === "dark"
                ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
            )}
          >
            <Paperclip size={12} className={tone === "dark" ? "text-white/70" : "text-slate-400"} />
            <span className="max-w-[220px] truncate">{attachment.file_name}</span>
            <span className={tone === "dark" ? "text-white/55" : "text-slate-400"}>{formatAttachmentSize(attachment.size_bytes)}</span>
          </button>
        ))}
      </div>
    );
  }, [handleDownloadAttachment]);

  const handleSend = useCallback(async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || loading || uploadingAttachments) {
      return;
    }

    const optimisticAttachments = pendingAttachments;
    const attachmentIds = optimisticAttachments.map((attachment) => attachment.id);
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: value,
      attachments: optimisticAttachments,
    };
    const assistantMessageId = createMessageId();
    const transcriptMessages = [...messages, userMessage];
    setMessages([
      ...transcriptMessages,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        actions: [],
        attachments: [],
        pending: true,
      },
    ]);
    setInput("");
    setPendingAttachments([]);
    setLoading(true);

    try {
      const streamController = new AbortController();
      streamAbortRef.current = streamController;
      const result = await api.assistantChatStream({
        messages: transcriptMessages.map((message) => ({ role: message.role, content: message.content })),
        workflow_id: workflowId,
        workflow_name: workflowName,
        step_count: stepCount,
        attachment_ids: attachmentIds,
      }, {
        onDelta: (delta) => {
          setMessages((prev) => prev.map((message) => (
            message.id === assistantMessageId
              ? { ...message, content: `${message.content}${delta}`, pending: true }
              : message
          )));
        },
        signal: streamController.signal,
      });
      if (streamAbortRef.current === streamController) {
        streamAbortRef.current = null;
      }

      setMessages((prev) => prev.map((message) => (
        message.id === assistantMessageId
          ? {
              ...message,
              content: result.reply,
              actions: result.actions?.length ? result.actions : undefined,
              pending: false,
            }
          : message
      )));
      if (result.suggestions?.length) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      if (isAbortError(error)) {
        if (streamAbortRef.current?.signal.aborted) {
          streamAbortRef.current = null;
        }
        setMessages((prev) => prev.flatMap((message) => {
          if (message.id !== assistantMessageId) {
            return [message];
          }
          if (!message.content.trim()) {
            return [];
          }
          return [{ ...message, pending: false }];
        }));
        setLoading(false);
        return;
      }
      setPendingAttachments(optimisticAttachments);
      setMessages((prev) => [
        ...prev.map((message) => (
          message.id === assistantMessageId
            ? {
                ...message,
                content: `I ran into an issue: ${error instanceof Error ? error.message : "Something went wrong."}. Let me know if you'd like to try again.`,
                pending: false,
              }
            : message
        )),
      ]);
    } finally {
      if (streamAbortRef.current?.signal.aborted) {
        streamAbortRef.current = null;
      }
      setLoading(false);
    }
  }, [input, loading, messages, pendingAttachments, stepCount, uploadingAttachments, workflowId, workflowName]);

  const handleStopStreaming = useCallback(() => {
    streamAbortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (initialPrompt && open && !initialPromptSent.current) {
      initialPromptSent.current = true;
      const timer = setTimeout(() => {
        void handleSend(initialPrompt);
      }, 300);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const applySummary = (summary: ApiAssistantWorkflowSummaryResponse | null) => {
      setWorkflowSummary(summary);
      setSuggestions(buildWorkflowSuggestions(stepCount, summary));
      if (!hasUserConversation) {
        setMessages([
          {
            id: createMessageId(),
            role: "assistant",
            content: buildWorkflowIntro(workflowName, stepCount, summary),
          },
        ]);
      }
    };

    if (!workflowId) {
      applySummary(null);
      return;
    }

    setSummaryLoading(true);
    api.getAssistantWorkflowSummary(workflowId).then((summary) => {
      if (!cancelled) {
        applySummary(summary);
      }
    }).catch(() => {
      if (!cancelled) {
        applySummary(null);
      }
    }).finally(() => {
      if (!cancelled) {
        setSummaryLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasUserConversation, open, stepCount, workflowId, workflowName]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-y-0 left-0 z-40 flex flex-col overflow-hidden border border-slate-200 bg-white/95 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur",
        maximized ? "right-0 m-3 rounded-[30px]" : "m-3 w-[420px] rounded-[28px]",
      )}
    >
      <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_42%),linear-gradient(180deg,_#ffffff,_#f8fafc)] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <Bot size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold text-slate-900">FlowHolt AI</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Workspace agent</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                    <Workflow size={12} />
                    {workflowName}
                  </span>
                  <span>{stepCount} node{stepCount !== 1 ? "s" : ""}</span>
                  {summaryLoading ? <span>Analyzing canvas...</span> : null}
                  {!summaryLoading && workflowSummary?.warnings.length ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {workflowSummary.warnings.length} warning{workflowSummary.warnings.length !== 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMaximize}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              title={maximized ? "Restore panel" : "Maximize panel"}
            >
              {maximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              title="Close assistant"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-slate-200 bg-white/80 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Shared chat threads</span>
            <button
              type="button"
              onClick={() => navigate("/dashboard/chat")}
              className="text-[11px] font-medium text-slate-600 hover:text-slate-900"
            >
              Open full chat
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sharedThreads.length ? sharedThreads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => navigate(`/dashboard/chat?thread=${encodeURIComponent(thread.id)}`)}
                className="max-w-full truncate rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 transition-colors hover:bg-slate-50"
                title={thread.title}
              >
                {thread.title}
              </button>
            )) : (
              <span className="text-[12px] text-slate-500">No shared threads yet. Start in dashboard chat to build a longer history.</span>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_28%)] px-5 py-5">
        {!hasUserConversation && introMessage ? (
          <div className="mb-5 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              <MessageSquareText size={14} />
              Current workflow context
            </div>
            <div className="text-[14px] leading-7 text-slate-700">{renderMarkdown(introMessage.content)}</div>
          </div>
        ) : null}

        <div className="space-y-4">
          {visibleMessages.map((message, index) => (
            <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[88%]", message.role === "user" ? "items-end" : "items-start")}>
                <div className="mb-1.5 text-[11px] font-medium text-slate-400">
                  {message.role === "user" ? "You" : "FlowHolt AI"}
                </div>
                <div
                  className={cn(
                    "rounded-[24px] px-4 py-3 text-[14px] leading-7 shadow-sm",
                    message.role === "user"
                      ? "rounded-tr-md bg-slate-900 text-white"
                      : "rounded-tl-md border border-slate-200 bg-white text-slate-700",
                  )}
                >
                  {message.role === "assistant" ? (
                    message.content ? renderMarkdown(message.content) : (
                      <span className="inline-flex items-center gap-2 text-slate-500">
                        <Loader2 size={14} className="animate-spin" />
                        Thinking through the workflow...
                      </span>
                    )
                  ) : message.content}
                </div>
                {renderAttachmentPills(message.attachments, message.role === "user" ? "dark" : "light")}

                {message.actions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action, actionIndex) => (
                      <button
                        key={`${action.label}-${actionIndex}`}
                        type="button"
                        onClick={() => handleAction(action)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-medium transition-colors",
                          action.type === "add_steps"
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : action.type === "run_workflow"
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        {action.type === "add_steps" ? <Plus size={13} /> : null}
                        {action.type === "run_workflow" ? <Play size={13} /> : null}
                        {action.type === "open_node" ? <Settings size={13} /> : null}
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {loading && !visibleMessages.some((message) => message.pending) ? (
            <div className="flex justify-start">
              <div className="rounded-[24px] rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-600 shadow-sm">
                <div className="inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking through the workflow...
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/90 px-5 py-4">
        {suggestions.length > 0 && !loading ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void handleSend(suggestion)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600 transition-colors hover:bg-slate-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <AssistantComposer
          value={input}
          onValueChange={setInput}
          onSubmit={handleSend}
          onStop={handleStopStreaming}
          submitting={loading}
          attaching={uploadingAttachments}
          attachments={pendingAttachments}
          onRemoveAttachment={handleRemovePendingAttachment}
          placeholder="Ask FlowHolt AI to inspect, plan, or edit this workflow"
          variant="compact"
          showModelSelector={false}
          modelLabel="Workflow assistant"
          onAttachClick={handleAttachClick}
        />
        <div className="mt-2 text-[11px] text-slate-500">
          Works from the current canvas state and can suggest node additions, repairs, and run actions.
        </div>
        <input
          ref={attachmentInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => void handleAttachmentSelection(event)}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
