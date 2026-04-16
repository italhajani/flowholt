import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { LoaderCircle, Lock, MessageSquareText, SendHorizonal, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api, getToken, type ApiPublicChatSendResponse, type ApiPublicChatTriggerInfo } from "@/lib/api";
import { cn } from "@/lib/utils";

type ChatRole = "assistant" | "user" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
};

const buildId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toChatMessages = (items: string[]): ChatMessage[] =>
  items
    .map((content) => content.trim())
    .filter(Boolean)
    .map((content) => ({ id: buildId(), role: "assistant" as const, content }));

const transcriptKey = (workspaceId: string, workflowId: string) => `flowholt.public-chat.transcript:${workspaceId}:${workflowId}`;
const sessionKey = (workspaceId: string, workflowId: string) => `flowholt.public-chat.session:${workspaceId}:${workflowId}`;

const PublicChatPage = () => {
  const { workspaceId, workflowId } = useParams<{ workspaceId: string; workflowId: string }>();
  const [searchParams] = useSearchParams();
  const [info, setInfo] = useState<ApiPublicChatTriggerInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(buildId());
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [basicUsername, setBasicUsername] = useState("");
  const [basicPassword, setBasicPassword] = useState("");

  const embedded = useMemo(() => {
    if (typeof window === "undefined") return false;
    return searchParams.get("embed") === "1" || window.self !== window.top;
  }, [searchParams]);

  useEffect(() => {
    if (!workspaceId || !workflowId) {
      setError("The chat URL is incomplete.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const result = await api.getPublicChatTriggerInfo(workspaceId, workflowId);
        if (cancelled) return;

        setInfo(result);
        const shouldPersist = result.load_previous_session === "from_memory";
        const nextSessionId = shouldPersist
          ? localStorage.getItem(sessionKey(workspaceId, workflowId)) || buildId()
          : buildId();

        setSessionId(nextSessionId);
        if (shouldPersist) {
          localStorage.setItem(sessionKey(workspaceId, workflowId), nextSessionId);
          const savedTranscript = localStorage.getItem(transcriptKey(workspaceId, workflowId));
          if (savedTranscript) {
            try {
              const parsed = JSON.parse(savedTranscript) as ChatMessage[];
              if (Array.isArray(parsed) && parsed.length > 0) {
                setMessages(parsed.map((message) => ({ ...message, pending: false })));
              } else {
                setMessages(toChatMessages(result.initial_messages));
              }
            } catch {
              setMessages(toChatMessages(result.initial_messages));
            }
          } else {
            setMessages(toChatMessages(result.initial_messages));
          }
        } else {
          setMessages(toChatMessages(result.initial_messages));
        }

        setStarted(!result.require_button_click);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "The public chat could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, workflowId]);

  useEffect(() => {
    if (!workspaceId || !workflowId || !info || info.load_previous_session !== "from_memory") {
      return;
    }
    localStorage.setItem(
      transcriptKey(workspaceId, workflowId),
      JSON.stringify(messages.filter((message) => !message.pending)),
    );
  }, [info, messages, workspaceId, workflowId]);

  const title = info?.title || "FlowHolt Chat";
  const subtitle = info?.subtitle || "Published workflow chat";
  const placeholder = info?.input_placeholder || "Type your message...";
  const authMode = info?.authentication || "none";
  const requiresSignin = authMode === "user_auth";
  const requiresBasicAuth = authMode === "basic_auth";
  const bearerToken = getToken();

  const authHeaders = useMemo(() => {
    if (requiresBasicAuth) {
      if (!basicUsername || !basicPassword) return undefined;
      return {
        Authorization: `Basic ${btoa(`${basicUsername}:${basicPassword}`)}`,
      };
    }
    if (requiresSignin && bearerToken) {
      return {
        Authorization: `Bearer ${bearerToken}`,
      };
    }
    return undefined;
  }, [basicPassword, basicUsername, bearerToken, requiresBasicAuth, requiresSignin]);

  const canSend = draft.trim().length > 0 && !sending && started && (!requiresBasicAuth || Boolean(authHeaders)) && (!requiresSignin || Boolean(bearerToken));

  const submitMessage = async () => {
    if (!workspaceId || !workflowId || !info) return;
    const content = draft.trim();
    if (!content || !canSend) return;

    const previousMessages = messages;
    const userMessage: ChatMessage = { id: buildId(), role: "user", content };
    const assistantMessageId = buildId();
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      pending: true,
    };
    const nextMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);
    setError(null);

    try {
      const payload = {
        message: content,
        session_id: sessionId,
        history: nextMessages
          .filter((message) => !message.pending)
          .map(({ role, content: itemContent }) => ({ role, content: itemContent })),
        metadata: {
          surface: embedded ? "embedded_public_chat" : "hosted_public_chat",
          embedded,
        },
      };
      const init = authHeaders ? { headers: authHeaders } : undefined;

      let response: ApiPublicChatSendResponse;
      if (info.response_mode === "streaming") {
        response = await api.sendPublicChatTriggerMessageStream(
          workspaceId,
          workflowId,
          payload,
          init,
          {
            onDelta: (delta) => {
              setMessages((current) => current.map((message) => (
                message.id === assistantMessageId
                  ? { ...message, content: `${message.content}${delta}`, pending: true }
                  : message
              )));
            },
          },
        );
      } else {
        response = await api.sendPublicChatTriggerMessage(workspaceId, workflowId, payload, init);
      }

      setSessionId(response.session_id || sessionId);
      setMessages((current) => current.map((message) => (
        message.id === assistantMessageId
          ? {
              ...message,
              content: response.message,
              pending: false,
            }
          : message
      )));
      if (info.load_previous_session === "from_memory") {
        localStorage.setItem(sessionKey(workspaceId, workflowId), response.session_id || sessionId);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The message could not be sent.");
      setMessages(previousMessages);
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.2),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#111827_100%)] text-white">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 backdrop-blur">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading published chat…
          </div>
        </div>
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#111827_0%,_#020617_100%)] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/45">Public Chat</p>
          <h1 className="mt-4 text-3xl font-semibold">This chat isn’t currently available.</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">{error}</p>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10">
              Return to FlowHolt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.14),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-white",
      embedded && "bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_100%)]"
    )}>
      <div className={cn(
        "mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6 lg:flex-row lg:gap-6 lg:px-8 lg:py-8",
        embedded && "max-w-none px-0 py-0 sm:px-0 lg:flex-col lg:gap-0 lg:px-0 lg:py-0"
      )}>
        {!embedded ? (
        <aside className="mb-4 overflow-hidden rounded-[30px] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-sky-950/20 backdrop-blur-xl lg:mb-0 lg:w-[360px] lg:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100/80">
            <Sparkles className="h-3.5 w-3.5" />
            Hosted Workflow Chat
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{subtitle}</p>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
              <MessageSquareText className="h-4 w-4 text-sky-300" />
              <span>{info?.response_mode === "streaming" ? "Streaming-style replies" : "Reply after workflow completion"}</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>
                {authMode === "none" && "Open public access"}
                {authMode === "basic_auth" && "Protected with basic auth"}
                {authMode === "user_auth" && "Requires FlowHolt sign-in"}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
              <Lock className="h-4 w-4 text-amber-300" />
              <span>{info?.mode === "embedded" ? "Configured for embedded rollout" : "Configured for hosted rollout"}</span>
            </div>
          </div>

          {requiresBasicAuth ? (
            <div className="mt-6 rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-50/80">Authentication</p>
              <p className="mt-2 text-sm text-amber-50/80">Enter the chat credentials configured in Studio before sending messages.</p>
              <div className="mt-4 space-y-3">
                <input
                  value={basicUsername}
                  onChange={(event) => setBasicUsername(event.target.value)}
                  placeholder="Username"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-200/40"
                />
                <input
                  type="password"
                  value={basicPassword}
                  onChange={(event) => setBasicPassword(event.target.value)}
                  placeholder="Password"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-200/40"
                />
              </div>
            </div>
          ) : null}

          {requiresSignin && !bearerToken ? (
            <div className="mt-6 rounded-[24px] border border-sky-300/20 bg-sky-300/10 p-4 text-sm text-sky-50/85">
              This chat requires a signed-in FlowHolt user from the target workspace.
              <div className="mt-4">
                <Link to="/" className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                  Sign in
                </Link>
              </div>
            </div>
          ) : null}
        </aside>
        ) : null}

        <main className={cn(
          "flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl",
          embedded && "min-h-screen rounded-none border-0 bg-transparent shadow-none"
        )}>
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">{embedded ? "Embedded Chat Surface" : "Public Chat Surface"}</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
              </div>
              {info?.hosted_chat_url ? (
                <a
                  href={info.hosted_chat_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  Open in tab
                </a>
              ) : null}
            </div>
          </div>

          {!started ? (
            <div className="flex flex-1 items-center justify-center px-6 py-10">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10">
                  <MessageSquareText className="h-7 w-7 text-sky-200" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold">Start a new conversation</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  This hosted chat is configured to wait for an explicit start. When you continue, the workflow will receive messages on the published chat trigger.
                </p>
                <Button className="mt-6 rounded-full bg-white text-slate-950 hover:bg-slate-100" onClick={() => setStarted(true)}>
                  Open chat
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-white/55">
                    No messages yet. Start the conversation below.
                  </div>
                ) : null}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[84%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-lg",
                      message.role === "user"
                        ? "ml-auto bg-sky-400 text-slate-950 shadow-sky-950/15"
                        : "border border-white/10 bg-black/20 text-slate-100 shadow-black/15",
                    )}
                  >
                    {message.pending && !message.content ? (
                      <span className="inline-flex items-center gap-2 text-slate-300">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        {info?.response_mode === "streaming" ? "Streaming response…" : "Running workflow…"}
                      </span>
                    ) : (
                      <>
                        {message.content}
                        {message.pending ? <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-sky-200/80 align-middle" /> : null}
                      </>
                    )}
                  </div>
                ))}
                {sending && !messages.some((message) => message.pending) ? (
                  <div className="max-w-[84%] rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      {info?.response_mode === "streaming" ? "Waiting for live response…" : "Running workflow…"}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                {error ? (
                  <div className="mb-3 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-50/90">
                    {error}
                  </div>
                ) : null}
                <div className="flex items-end gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void submitMessage();
                      }
                    }}
                    rows={1}
                    placeholder={placeholder}
                    className="min-h-[56px] flex-1 resize-none rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-300/40"
                  />
                  <Button
                    onClick={() => void submitMessage()}
                    disabled={!canSend}
                    className="h-14 rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100 disabled:bg-white/30 disabled:text-slate-600"
                  >
                    {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default PublicChatPage;