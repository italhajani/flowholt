import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Bot,
  Check,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Sparkles,
  Trash2,
  Workflow,
  X,
} from "lucide-react";

import AssistantComposer, { pickPreferredModelId } from "@/components/chat/AssistantComposer";
import { toast } from "@/hooks/use-toast";
import {
  api,
  chatThreadsQueryKey,
  type ApiChatAttachment,
  type ApiChatMessage,
  type ApiChatThreadDetail,
  type ApiChatThreadSummary,
  type ApiLLMProviderInfo,
  type ApiWorkflowAssistantAction,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error
      ? error.name === "AbortError"
      : false;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return blocks.map((block, index) => {
    if (block.startsWith("```") && block.endsWith("```")) {
      const inner = block.slice(3, -3).replace(/^\w+\n/, "");
      return (
        <pre key={index} className="my-3 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 font-mono text-[13px] text-slate-100 whitespace-pre-wrap">
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
              <code key={innerIndex} className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-indigo-700">
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

interface LocalMessage extends ApiChatMessage {
  pending?: boolean;
}

function createMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const FALLBACK_THREAD_TITLE = "New chat";

function deriveThreadTitle(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return FALLBACK_THREAD_TITLE;
  }

  if (trimmed.length <= 60) {
    return trimmed;
  }

  const truncated = trimmed.slice(0, 60).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  const safeTitle = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  return `${safeTitle}...`;
}

function getLastMessagePreview(messages: ApiChatMessage[]): string {
  const lastMessage = messages[messages.length - 1];
  return lastMessage ? lastMessage.content.slice(0, 100) : "";
}

function sortThreadSummaries(threads: ApiChatThreadSummary[]): ApiChatThreadSummary[] {
  return [...threads].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }
    return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
  });
}

function upsertThreadSummary(threads: ApiChatThreadSummary[], thread: ApiChatThreadSummary): ApiChatThreadSummary[] {
  const next = threads.filter((item) => item.id !== thread.id);
  next.push(thread);
  return sortThreadSummaries(next);
}

function updateThreadSummary(
  threads: ApiChatThreadSummary[],
  threadId: string,
  updater: (thread: ApiChatThreadSummary) => ApiChatThreadSummary,
): ApiChatThreadSummary[] {
  let updated = false;
  const next = threads.map((thread) => {
    if (thread.id !== threadId) {
      return thread;
    }
    updated = true;
    return updater(thread);
  });
  return updated ? sortThreadSummaries(next) : threads;
}

function summarizeThreadDetail(detail: ApiChatThreadDetail): ApiChatThreadSummary {
  return {
    id: detail.id,
    title: detail.title,
    model: detail.model,
    pinned: detail.pinned,
    message_count: detail.messages.length,
    last_message_preview: getLastMessagePreview(detail.messages),
    created_at: detail.created_at,
    updated_at: detail.updated_at,
  };
}

function formatAttachmentSize(sizeBytes: number): string {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

const EMPTY_SUGGESTIONS = [
  "Design a workflow that syncs Stripe payments into Airtable",
  "Help me plan a webhook flow for Shopify orders",
  "Explain which nodes I should use for AI email triage",
  "Turn my workflow idea into a step-by-step automation plan",
];

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ApiChatAttachment[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);
  const [models, setModels] = useState<ApiLLMProviderInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [threadMenuId, setThreadMenuId] = useState<string | null>(null);
  const [deletingThreadIds, setDeletingThreadIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const bootstrappedMessageRef = useRef<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const activeThreadIdRef = useRef<string | null>(null);
  const deletingThreadIdsRef = useRef<string[]>([]);
  const streamAbortRef = useRef<AbortController | null>(null);

  const { data: threads = [], error: threadLoadError } = useQuery({
    queryKey: chatThreadsQueryKey,
    queryFn: () => api.listChatThreads().then((response) => response.threads),
    placeholderData: (previous) => previous ?? [],
  });

  const defaultModelId = useMemo(() => pickPreferredModelId(models), [models]);

  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  useEffect(() => {
    deletingThreadIdsRef.current = deletingThreadIds;
  }, [deletingThreadIds]);

  useEffect(() => () => {
    streamAbortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!threadLoadError) {
      return;
    }

    toast({
      title: "Could not load chat threads",
      description: "Refresh the page or verify the backend is running.",
    });
  }, [threadLoadError]);

  const syncThreadQuery = useCallback((threadId: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (threadId) {
      nextParams.set("thread", threadId);
    } else {
      nextParams.delete("thread");
    }
    nextParams.delete("message");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const setThreadList = useCallback((updater: (threads: ApiChatThreadSummary[]) => ApiChatThreadSummary[]) => {
    queryClient.setQueryData<ApiChatThreadSummary[]>(chatThreadsQueryKey, (current) => updater(current ?? []));
  }, [queryClient]);

  const handleLockedModelSelect = useCallback((model: ApiLLMProviderInfo) => {
    toast({
      title: `${model.name} requires credentials`,
      description: "Add the model API key in Credentials before selecting it.",
    });
    navigate(`/dashboard/credentials?tab=credentials&provider=${encodeURIComponent(model.id)}&create=1`);
  }, [navigate]);

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
      toast({
        title: "Attachment upload failed",
        description: error instanceof Error ? error.message : "Could not upload those files.",
      });
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
      toast({
        title: "Attachment download failed",
        description: error instanceof Error ? error.message : "Could not download that file.",
      });
    }
  }, []);

  const handleMessageAction = useCallback(async (action: ApiWorkflowAssistantAction, message: LocalMessage) => {
    const actionKey = `${message.id}:${action.label}`;
    try {
      setActiveActionKey(actionKey);
      if (action.type !== "create_workflow") {
        toast({
          title: "Action not available here",
          description: "This assistant action only runs inside the workflow studio.",
        });
        return;
      }

      const prompt = action.prompt?.trim() || message.content.trim();
      if (!prompt) {
        throw new Error("The assistant action did not include enough context to generate a workflow.");
      }

      const workflow = await api.generateWorkflow(prompt, action.workflow_name?.trim() || undefined);
      navigate(`/studio/${workflow.id}`);
    } catch (error) {
      toast({
        title: "Could not run assistant action",
        description: error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setActiveActionKey(null);
    }
  }, [navigate]);

  const handleSelectThread = useCallback(async (threadId: string, updateQuery = true) => {
    if (deletingThreadIdsRef.current.includes(threadId)) {
      return;
    }

    setActiveThreadId(threadId);
    setPendingAttachments([]);
    try {
      const detail = await api.getChatThread(threadId);
      if (deletingThreadIdsRef.current.includes(threadId)) {
        return;
      }
      setMessages(detail.messages.map((message) => ({ ...message, pending: false })));
      setThreadList((current) => upsertThreadSummary(current, summarizeThreadDetail(detail)));
      if (detail.model) {
        setSelectedModel(detail.model);
      } else if (defaultModelId) {
        setSelectedModel(defaultModelId);
      }
      if (updateQuery) {
        syncThreadQuery(threadId);
      }
    } catch {
      toast({
        title: "Could not open that thread",
        description: "Try another conversation or refresh the page.",
      });
    }
  }, [defaultModelId, setThreadList, syncThreadQuery]);

  const handleNewThread = useCallback(() => {
    streamAbortRef.current?.abort();
    setActiveThreadId(null);
    setMessages([]);
    setInput("");
    setPendingAttachments([]);
    setThreadMenuId(null);
    syncThreadQuery(null);
  }, [syncThreadQuery]);

  const handleNewThreadWithMessage = useCallback(async (
    message: string,
    options?: {
      explicitModel?: string;
      attachmentIds?: string[];
      attachments?: ApiChatAttachment[];
    },
  ) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    const threadModel = (options?.explicitModel || selectedModel || defaultModelId || "").trim();
    const attachmentSnapshot = options?.attachments ?? pendingAttachments;
    const attachmentIds = options?.attachmentIds ?? attachmentSnapshot.map((attachment) => attachment.id);
    const optimisticThreadId = `temp-thread-${Date.now()}`;
    const optimisticUserId = `temp-user-${Date.now()}`;
    const optimisticAssistantId = `temp-assistant-${Date.now()}`;
    const optimisticNow = new Date().toISOString();
    const optimisticTitle = deriveThreadTitle(trimmedMessage);
    let createdThread: ApiChatThreadDetail | null = null;

    setActiveThreadId(optimisticThreadId);
    setMessages([
      {
        id: optimisticUserId,
        thread_id: optimisticThreadId,
        role: "user",
        content: trimmedMessage,
        model_used: null,
        actions: [],
        attachments: attachmentSnapshot,
        created_at: optimisticNow,
      },
      {
        id: optimisticAssistantId,
        thread_id: optimisticThreadId,
        role: "assistant",
        content: "",
        model_used: threadModel || null,
        actions: [],
        attachments: [],
        created_at: optimisticNow,
        pending: true,
      },
    ]);
    setThreadList((current) => upsertThreadSummary(current, {
      id: optimisticThreadId,
      title: optimisticTitle,
      model: threadModel,
      pinned: false,
      message_count: 2,
      last_message_preview: trimmedMessage.slice(0, 100),
      created_at: optimisticNow,
      updated_at: optimisticNow,
    }));
    setInput("");
    setPendingAttachments([]);
    setSending(true);
    try {
      const streamController = new AbortController();
      streamAbortRef.current = streamController;
      createdThread = await api.createChatThread({
        title: optimisticTitle,
        model: threadModel,
      });
      const detail = createdThread;
      setThreadList((current) => upsertThreadSummary(
        current.filter((thread) => thread.id !== optimisticThreadId),
        {
          id: detail.id,
          title: detail.title || optimisticTitle,
          model: detail.model || threadModel,
          pinned: detail.pinned,
          message_count: 2,
          last_message_preview: trimmedMessage.slice(0, 100),
          created_at: detail.created_at,
          updated_at: optimisticNow,
        },
      ));
      if (activeThreadIdRef.current === optimisticThreadId) {
        setActiveThreadId(detail.id);
        setMessages((previous) => previous.map((entry) => (
          entry.thread_id === optimisticThreadId
            ? { ...entry, thread_id: detail.id }
            : entry
        )));
        syncThreadQuery(detail.id);
      }
      if (detail.model) {
        setSelectedModel(detail.model);
      }

      const response = await api.sendChatMessageStream(detail.id, trimmedMessage, threadModel || undefined, attachmentIds, {
        onDelta: (delta) => {
          setMessages((previous) => previous.map((entry) => (
            entry.id === optimisticAssistantId
              ? { ...entry, thread_id: detail.id, content: `${entry.content}${delta}`, pending: true }
              : entry
          )));
        },
        signal: streamController.signal,
      });
      if (streamAbortRef.current === streamController) {
        streamAbortRef.current = null;
      }

      setMessages((previous) => previous.map((entry) => {
        if (entry.id === optimisticUserId) {
          return { ...response.user_message, pending: false };
        }
        if (entry.id === optimisticAssistantId) {
          return { ...response.assistant_message, pending: false };
        }
        return entry;
      }));
      setThreadList((current) => upsertThreadSummary(current, {
        id: detail.id,
        title: response.thread_title || optimisticTitle,
        model: response.assistant_message.model_used || detail.model || threadModel,
        pinned: detail.pinned,
        message_count: 2,
        last_message_preview: response.assistant_message.content.slice(0, 100) || trimmedMessage.slice(0, 100),
        created_at: detail.created_at,
        updated_at: response.assistant_message.created_at,
      }));
    } catch (error) {
      if (isAbortError(error)) {
        if (streamAbortRef.current?.signal.aborted) {
          streamAbortRef.current = null;
        }
        setMessages((previous) => previous.flatMap((entry) => {
          if (entry.id !== optimisticAssistantId) {
            return [entry];
          }
          if (!entry.content.trim()) {
            return [];
          }
          return [{ ...entry, pending: false }];
        }));
        setSending(false);
        if (createdThread) {
          void api.getChatThread(createdThread.id).then((detail) => {
            if (deletingThreadIdsRef.current.includes(createdThread!.id)) {
              return;
            }
            setMessages(detail.messages.map((entry) => ({ ...entry, pending: false })));
            setThreadList((current) => upsertThreadSummary(current.filter((thread) => thread.id !== optimisticThreadId), summarizeThreadDetail(detail)));
            if (activeThreadIdRef.current === optimisticThreadId || activeThreadIdRef.current === createdThread?.id) {
              setActiveThreadId(createdThread.id);
              syncThreadQuery(createdThread.id);
            }
          }).catch(() => {
            if (deletingThreadIdsRef.current.includes(createdThread!.id)) {
              return;
            }
            setThreadList((current) => updateThreadSummary(current, createdThread!.id, (thread) => ({
              ...thread,
              title: thread.title || optimisticTitle,
              model: threadModel,
              updated_at: new Date().toISOString(),
            })));
          });
        }
        return;
      }
      if (createdThread) {
        try {
          const detail = await api.getChatThread(createdThread.id);
          if (deletingThreadIdsRef.current.includes(createdThread.id)) {
            return;
          }
          setMessages(detail.messages.map((entry) => ({ ...entry, pending: false })));
          setThreadList((current) => upsertThreadSummary(current.filter((thread) => thread.id !== optimisticThreadId), summarizeThreadDetail(detail)));
          if (activeThreadIdRef.current === optimisticThreadId || activeThreadIdRef.current === createdThread.id) {
            setActiveThreadId(createdThread.id);
            syncThreadQuery(createdThread.id);
          }
        } catch {
          setThreadList((current) => current.filter((thread) => thread.id !== optimisticThreadId && thread.id !== createdThread?.id));
          if (activeThreadIdRef.current === optimisticThreadId || activeThreadIdRef.current === createdThread.id) {
            setActiveThreadId(null);
            setMessages([]);
            setInput(trimmedMessage);
            setPendingAttachments(attachmentSnapshot);
            syncThreadQuery(null);
          }
        }
      } else {
        setThreadList((current) => current.filter((thread) => thread.id !== optimisticThreadId));
        if (activeThreadIdRef.current === optimisticThreadId) {
          setActiveThreadId(null);
          setMessages([]);
          setInput(trimmedMessage);
          setPendingAttachments(attachmentSnapshot);
          syncThreadQuery(null);
        }
      }
      toast({
        title: "Could not start chat",
        description: error instanceof Error ? error.message : "Could not start a new conversation.",
      });
    } finally {
      if (streamAbortRef.current?.signal.aborted) {
        streamAbortRef.current = null;
      }
      setSending(false);
    }
  }, [defaultModelId, pendingAttachments, selectedModel, setThreadList, syncThreadQuery]);

  const handleStopStreaming = useCallback(() => {
    streamAbortRef.current?.abort();
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || uploadingAttachments) {
      return;
    }

    const optimisticAttachments = pendingAttachments;
    const attachmentIds = optimisticAttachments.map((attachment) => attachment.id);

    if (!activeThreadId) {
      await handleNewThreadWithMessage(text);
      return;
    }

    const optimisticUserId = `temp-${Date.now()}`;
    const optimisticAssistantId = `pending-${Date.now()}`;
    const optimisticNow = new Date().toISOString();
    const previousThread = threads.find((thread) => thread.id === activeThreadId) ?? null;

    setMessages((previous) => [
      ...previous,
      {
        id: optimisticUserId,
        thread_id: activeThreadId,
        role: "user",
        content: text,
        actions: [],
        attachments: optimisticAttachments,
        created_at: optimisticNow,
      },
      {
        id: optimisticAssistantId,
        thread_id: activeThreadId,
        role: "assistant",
        content: "",
        actions: [],
        attachments: [],
        created_at: optimisticNow,
        pending: true,
      },
    ]);
    setThreadList((current) => updateThreadSummary(current, activeThreadId, (thread) => ({
      ...thread,
      title: thread.title === FALLBACK_THREAD_TITLE ? deriveThreadTitle(text) : thread.title,
      model: selectedModel || thread.model,
      message_count: Math.max(thread.message_count + 2, 2),
      last_message_preview: text.slice(0, 100),
      updated_at: optimisticNow,
    })));
    setInput("");
    setPendingAttachments([]);
    setSending(true);

    try {
      const streamController = new AbortController();
      streamAbortRef.current = streamController;
      const response = await api.sendChatMessageStream(activeThreadId, text, selectedModel || undefined, attachmentIds, {
        onDelta: (delta) => {
          setMessages((previous) => previous.map((message) => (
            message.id === optimisticAssistantId
              ? { ...message, content: `${message.content}${delta}`, pending: true }
              : message
          )));
        },
        signal: streamController.signal,
      });
      if (streamAbortRef.current === streamController) {
        streamAbortRef.current = null;
      }
      setMessages((previous) => previous.map((message) => {
        if (message.id === optimisticUserId) {
          return { ...response.user_message, pending: false };
        }
        if (message.id === optimisticAssistantId) {
          return { ...response.assistant_message, pending: false };
        }
        return message;
      }));
      setThreadList((current) => upsertThreadSummary(current, {
        id: activeThreadId,
        title: response.thread_title || previousThread?.title || deriveThreadTitle(text),
        model: selectedModel || previousThread?.model || "",
        pinned: previousThread?.pinned ?? false,
        message_count: Math.max(previousThread?.message_count ?? 0, 0) + 2,
        last_message_preview: response.assistant_message.content.slice(0, 100) || text.slice(0, 100),
        created_at: previousThread?.created_at || response.user_message.created_at,
        updated_at: response.assistant_message.created_at,
      }));
    } catch (error) {
      if (isAbortError(error)) {
        if (streamAbortRef.current?.signal.aborted) {
          streamAbortRef.current = null;
        }
        setMessages((previous) => previous.flatMap((message) => {
          if (message.id !== optimisticAssistantId) {
            return [message];
          }
          if (!message.content.trim()) {
            return [];
          }
          return [{ ...message, pending: false }];
        }));
        setSending(false);
        const targetThreadId = activeThreadId;
        void api.getChatThread(targetThreadId).then((detail) => {
          if (activeThreadIdRef.current !== targetThreadId || deletingThreadIdsRef.current.includes(targetThreadId)) {
            return;
          }
          setMessages(detail.messages.map((message) => ({ ...message, pending: false })));
          setThreadList((current) => upsertThreadSummary(current, summarizeThreadDetail(detail)));
        }).catch(() => {
          if (deletingThreadIdsRef.current.includes(targetThreadId)) {
            return;
          }
          setThreadList((current) => updateThreadSummary(current, targetThreadId, (thread) => ({
            ...thread,
            updated_at: new Date().toISOString(),
          })));
        });
        return;
      }
      try {
        const detail = await api.getChatThread(activeThreadId);
        setMessages(detail.messages.map((message) => ({ ...message, pending: false })));
        setThreadList((current) => upsertThreadSummary(current, summarizeThreadDetail(detail)));
      } catch {
        setMessages((previous) => previous.filter((message) => message.id !== optimisticUserId && message.id !== optimisticAssistantId));
        if (previousThread) {
          setThreadList((current) => upsertThreadSummary(current, previousThread));
        }
        setInput(text);
        setPendingAttachments(optimisticAttachments);
      }
      toast({
        title: "Message failed",
        description: error instanceof Error ? error.message : "Could not send this message.",
      });
    } finally {
      if (streamAbortRef.current?.signal.aborted) {
        streamAbortRef.current = null;
      }
      setSending(false);
    }
  }, [activeThreadId, handleNewThreadWithMessage, input, pendingAttachments, selectedModel, sending, setThreadList, threads, uploadingAttachments]);

  const handleDeleteThread = useCallback(async (threadId: string) => {
    if (deletingThreadIdsRef.current.includes(threadId)) {
      return;
    }

    const deletingActiveThread = activeThreadIdRef.current === threadId;
    const previousThreads = threads;
    const previousMessages = messages;
    const previousInput = input;
    const previousPendingAttachments = pendingAttachments;
    const previousSelectedModel = selectedModel;

    if (deletingActiveThread) {
      streamAbortRef.current?.abort();
    }

    await queryClient.cancelQueries({ queryKey: chatThreadsQueryKey });
    setDeletingThreadIds((current) => current.includes(threadId) ? current : [...current, threadId]);
    setThreadMenuId((current) => current === threadId ? null : current);
    setEditingThreadId((current) => current === threadId ? null : current);
    setThreadList((current) => current.filter((thread) => thread.id !== threadId));
    if (deletingActiveThread && activeThreadIdRef.current === threadId) {
      handleNewThread();
    }

    try {
      await api.deleteChatThread(threadId);
      queryClient.setQueryData<ApiChatThreadSummary[]>(chatThreadsQueryKey, (current) =>
        (current ?? []).filter((thread) => thread.id !== threadId),
      );
      await queryClient.invalidateQueries({ queryKey: chatThreadsQueryKey });
    } catch {
      setThreadList(() => previousThreads);
      if (deletingActiveThread) {
        setActiveThreadId(threadId);
        setMessages(previousMessages);
        setInput(previousInput);
        setPendingAttachments(previousPendingAttachments);
        setSelectedModel(previousSelectedModel);
        syncThreadQuery(threadId);
      }
      toast({
        title: "Could not delete thread",
        description: "Try again in a moment.",
      });
    } finally {
      setDeletingThreadIds((current) => current.filter((entry) => entry !== threadId));
    }
  }, [handleNewThread, input, messages, pendingAttachments, queryClient, selectedModel, setThreadList, syncThreadQuery, threads]);

  const handlePinThread = useCallback(async (threadId: string, pinned: boolean) => {
    const previousThread = threads.find((thread) => thread.id === threadId);
    const optimisticNow = new Date().toISOString();

    setThreadList((current) => updateThreadSummary(current, threadId, (thread) => ({
      ...thread,
      pinned,
      updated_at: optimisticNow,
    })));

    try {
      const detail = await api.updateChatThread(threadId, { pinned });
      setThreadList((current) => upsertThreadSummary(current, summarizeThreadDetail(detail)));
    } catch {
      if (previousThread) {
        setThreadList((current) => upsertThreadSummary(current, previousThread));
      }
      toast({
        title: "Could not update thread",
        description: "Pinning failed. Try again.",
      });
    }
  }, [setThreadList, threads]);

  const handleRenameThread = useCallback(async (threadId: string) => {
    const nextTitle = editTitle.trim();
    if (!nextTitle) {
      return;
    }

    const previousThread = threads.find((thread) => thread.id === threadId);
    const optimisticNow = new Date().toISOString();

    setEditingThreadId(null);
    setThreadList((current) => updateThreadSummary(current, threadId, (thread) => ({
      ...thread,
      title: nextTitle,
      updated_at: optimisticNow,
    })));

    try {
      const detail = await api.updateChatThread(threadId, { title: nextTitle });
      setThreadList((current) => upsertThreadSummary(current, summarizeThreadDetail(detail)));
    } catch {
      if (previousThread) {
        setThreadList((current) => upsertThreadSummary(current, previousThread));
      }
      setEditingThreadId(threadId);
      toast({
        title: "Could not rename thread",
        description: "Try another title or refresh the thread list.",
      });
    }
  }, [editTitle, setThreadList, threads]);

  useEffect(() => {
    api.listChatModels().then(setModels).catch(() => {
      toast({
        title: "Could not load models",
        description: "Chat will use the platform default until models are available.",
      });
    });
  }, []);

  useEffect(() => {
    if (!selectedModel && defaultModelId) {
      setSelectedModel(defaultModelId);
    }
  }, [defaultModelId, selectedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const threadFromQuery = searchParams.get("thread");
    if (threadFromQuery && deletingThreadIds.includes(threadFromQuery)) {
      syncThreadQuery(null);
      return;
    }
    if (threadFromQuery && threadFromQuery !== activeThreadId) {
      void handleSelectThread(threadFromQuery, false);
    }
  }, [activeThreadId, deletingThreadIds, handleSelectThread, searchParams, syncThreadQuery]);

  useEffect(() => {
    const messageFromQuery = searchParams.get("message");
    if (!messageFromQuery || bootstrappedMessageRef.current === messageFromQuery) {
      return;
    }

    const attachmentIdsFromQuery = (searchParams.get("attachment_ids") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const bootstrapKey = `${messageFromQuery}::${searchParams.get("model") || ""}::${attachmentIdsFromQuery.join(",")}`;
    if (bootstrappedMessageRef.current === bootstrapKey) {
      return;
    }

    bootstrappedMessageRef.current = bootstrapKey;
    const modelFromQuery = searchParams.get("model") || defaultModelId || selectedModel;
    if (modelFromQuery) {
      setSelectedModel(modelFromQuery);
    }
    void handleNewThreadWithMessage(messageFromQuery, {
      explicitModel: modelFromQuery,
      attachmentIds: attachmentIdsFromQuery,
    });
  }, [defaultModelId, handleNewThreadWithMessage, searchParams, selectedModel]);

  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
  const weekStart = todayStart - 7 * 86_400_000;

  const pinnedThreads = threads.filter((thread) => thread.pinned);
  const unpinnedThreads = threads.filter((thread) => !thread.pinned);
  const todayThreads = unpinnedThreads.filter((thread) => new Date(thread.updated_at).getTime() >= todayStart);
  const recentThreads = unpinnedThreads.filter((thread) => {
    const updatedAt = new Date(thread.updated_at).getTime();
    return updatedAt >= weekStart && updatedAt < todayStart;
  });
  const olderThreads = unpinnedThreads.filter((thread) => new Date(thread.updated_at).getTime() < weekStart);

  const renderThreadGroup = (label: string, items: ApiChatThreadSummary[]) => {
    if (!items.length) {
      return null;
    }

    return (
      <div className="mb-4">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
        {items.map((thread) => {
          const isDeleting = deletingThreadIds.includes(thread.id);

          return (
            <div
              key={thread.id}
              className={cn(
                "group relative flex items-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] transition-colors",
                isDeleting
                  ? "cursor-progress bg-slate-100 text-slate-500"
                  : activeThreadId === thread.id
                    ? "cursor-pointer bg-slate-200/80 text-slate-900"
                    : "cursor-pointer text-slate-600 hover:bg-slate-100",
              )}
              onClick={() => {
                if (!isDeleting && editingThreadId !== thread.id) {
                  void handleSelectThread(thread.id);
                }
              }}
            >
              {thread.pinned ? <Pin size={12} className="shrink-0 text-indigo-500" /> : <MessageSquare size={12} className="shrink-0 text-slate-300" />}
              {editingThreadId === thread.id ? (
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void handleRenameThread(thread.id);
                      }
                      if (event.key === "Escape") {
                        setEditingThreadId(null);
                      }
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[13px] outline-none"
                  />
                  <button type="button" onClick={(event) => { event.stopPropagation(); void handleRenameThread(thread.id); }} className="p-1 text-emerald-600">
                    <Check size={14} />
                  </button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); setEditingThreadId(null); }} className="p-1 text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{thread.title}</span>
                    {isDeleting ? <span className="mt-0.5 block text-[11px] text-slate-400">Deleting conversation...</span> : null}
                  </div>
                  {isDeleting ? (
                    <Loader2 size={14} className="shrink-0 animate-spin text-slate-400" />
                  ) : (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setThreadMenuId((current) => current === thread.id ? null : thread.id);
                      }}
                      className="rounded-lg p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white hover:text-slate-700"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  )}

                  {threadMenuId === thread.id && !isDeleting ? (
                    <div className="absolute right-2 top-10 z-50 min-w-[150px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] text-slate-600 hover:bg-slate-50"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingThreadId(thread.id);
                          setEditTitle(thread.title);
                          setThreadMenuId(null);
                        }}
                      >
                        <Pencil size={12} /> Rename
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] text-slate-600 hover:bg-slate-50"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handlePinThread(thread.id, !thread.pinned);
                          setThreadMenuId(null);
                        }}
                      >
                        {thread.pinned ? <PinOff size={12} /> : <Pin size={12} />} {thread.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] text-red-500 hover:bg-red-50"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteThread(thread.id);
                          setThreadMenuId(null);
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  ) : null}

                  {isDeleting ? (
                    <div className="pointer-events-none absolute inset-x-3 bottom-1 overflow-hidden rounded-full bg-slate-200/90">
                      <div className="h-1 w-2/3 rounded-full bg-slate-400/80 animate-pulse" />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderAttachmentPills = (attachments: ApiChatAttachment[], tone: "light" | "dark") => {
    if (!attachments.length) {
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
  };

  const renderAssistantActions = (message: LocalMessage) => {
    if (message.pending || !message.actions.length) {
      return null;
    }

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {message.actions.map((action) => {
          const actionKey = `${message.id}:${action.label}`;
          const running = activeActionKey === actionKey;
          return (
            <button
              key={actionKey}
              type="button"
              onClick={() => void handleMessageAction(action, message)}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? <Loader2 size={13} className="animate-spin" /> : <Workflow size={13} className="text-indigo-500" />}
              {action.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-56px)] bg-[radial-gradient(circle_at_top,#eef4ff_0%,#ffffff_45%,#ffffff_100%)]">
      <aside
        className={cn(
          "flex flex-col border-r border-slate-200 bg-white/85 backdrop-blur-sm transition-all duration-200",
          sidebarOpen ? "w-[290px]" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
          <button
            type="button"
            onClick={handleNewThread}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Plus size={15} /> New chat
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition-colors hover:bg-slate-100"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {threads.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-slate-400">
              <MessageSquare size={24} className="mx-auto mb-3 opacity-50" />
              Your conversations will appear here.
            </div>
          ) : (
            <>
              {renderThreadGroup("Pinned", pinnedThreads)}
              {renderThreadGroup("Today", todayThreads)}
              {renderThreadGroup("Previous 7 Days", recentThreads)}
              {renderThreadGroup("Older", olderThreads)}
            </>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white/70 px-4 backdrop-blur-sm">
          {!sidebarOpen ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-slate-500 transition-colors hover:bg-white"
            >
              <PanelLeftOpen size={16} />
            </button>
          ) : null}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-sm">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-slate-900">FlowHolt AI</div>
              <div className="text-[11px] text-slate-400">{activeThreadId ? "Conversation mode" : "New thread"}</div>
            </div>
          </div>
          <div className="ml-auto text-[11px] font-medium text-slate-400">
            {activeThreadId ? (threads.find((thread) => thread.id === activeThreadId)?.title || "Conversation") : "Start with a prompt"}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {!activeThreadId && messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center px-6 py-10">
              <div className="w-full max-w-4xl text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-orange-400 shadow-[0_18px_40px_rgba(99,102,241,0.28)]">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h1 className="mb-2 text-[34px] font-[800] tracking-tight text-slate-900">Hi, what would you like me to automate?</h1>
                <p className="mx-auto mb-8 max-w-2xl text-[15px] text-slate-500">
                  Start with a workflow goal, an integration idea, or a question about building inside FlowHolt.
                </p>

                <AssistantComposer
                  value={input}
                  onValueChange={setInput}
                  onSubmit={handleSend}
                  onStop={handleStopStreaming}
                  submitting={sending}
                  attaching={uploadingAttachments}
                  placeholder="Ask me anything..."
                  models={models}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  onLockedModelSelect={handleLockedModelSelect}
                  onAttachClick={handleAttachClick}
                  attachments={pendingAttachments}
                  onRemoveAttachment={handleRemovePendingAttachment}
                  autoFocus
                  className="mx-auto max-w-3xl"
                />

                <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 text-left">
                  {EMPTY_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="rounded-2xl border border-slate-200 bg-white/75 p-4 text-[13px] text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl px-6 py-8">
              {messages.map((message) => (
                <div key={message.id} className={cn("mb-8", message.role === "user" ? "flex justify-end" : "")}>
                  {message.role === "assistant" ? (
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {message.pending && !message.content ? (
                          <div className="flex items-center gap-1.5 py-3">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: "0ms" }} />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: "120ms" }} />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: "240ms" }} />
                          </div>
                        ) : (
                          <div className="text-[15px] leading-8 text-slate-700 whitespace-pre-wrap">
                            {renderMarkdown(message.content)}
                            {message.pending ? <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-indigo-300 align-middle" /> : null}
                          </div>
                        )}
                        {renderAttachmentPills(message.attachments, "light")}
                        {renderAssistantActions(message)}
                        {message.model_used && !message.pending ? (
                          <div className="mt-2 text-[11px] font-medium text-slate-400">{message.model_used}</div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[78%] rounded-[24px] rounded-br-md bg-slate-900 px-4 py-3 text-[14px] leading-7 text-white whitespace-pre-wrap shadow-sm">
                      {message.content}
                      {renderAttachmentPills(message.attachments, "dark")}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {activeThreadId ? (
          <div className="border-t border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
            <AssistantComposer
              value={input}
              onValueChange={setInput}
              onSubmit={handleSend}
              onStop={handleStopStreaming}
              submitting={sending}
              attaching={uploadingAttachments}
              placeholder="Message FlowHolt AI..."
              models={models}
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
              onLockedModelSelect={handleLockedModelSelect}
              onAttachClick={handleAttachClick}
              attachments={pendingAttachments}
              onRemoveAttachment={handleRemovePendingAttachment}
              className="mx-auto max-w-4xl"
            />
            <div className="mt-2 text-center text-[11px] text-slate-400">FlowHolt AI can make mistakes. Verify important details before acting on them.</div>
          </div>
        ) : null}

        <input
          ref={attachmentInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => void handleAttachmentSelection(event)}
        />
      </div>

      {threadMenuId ? (
        <button
          type="button"
          aria-label="Close thread menu"
          className="fixed inset-0 z-40 cursor-default bg-transparent"
          onClick={() => setThreadMenuId(null)}
        />
      ) : null}
    </div>
  );
};

export default ChatPage;