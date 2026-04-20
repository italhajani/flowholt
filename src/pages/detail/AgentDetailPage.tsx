import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Bot, Brain, Wrench, Beaker, BarChart3, Settings, GitBranch,
  FileText, Clock, Cpu, BookOpen, CheckCircle2, XCircle, AlertTriangle,
  MessageSquare, Send, Sparkles, Copy, ArrowRight, Hash, Plus, Trash2, Loader2, Link2,
} from "lucide-react";
import { EntityDetailLayout, DetailSection, DetailRow } from "@/layouts/EntityDetailLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";
import {
  useAgent, useUpdateAgent, useAgentChat,
  useAgentKnowledge, useLinkKnowledge, useUnlinkKnowledge,
  useKnowledgeBases,
} from "@/hooks/useApi";

/* ── Mock agent data ── */
const agent = {
  id: "agent-001",
  name: "Customer Support Bot",
  status: "active" as const,
  provider: "OpenAI",
  model: "GPT-4o",
  evalState: "passing",
  knowledgeCount: 3,
  toolCount: 5,
  linkedWorkflows: 2,
  owner: "Gouhar Ali",
  createdAt: "Feb 14, 2026",
  lastActive: "5 min ago",
  totalInvocations: 8420,
  avgLatency: "1.8s",
  avgCost: "$0.03",
  description: "Handles tier-1 customer support queries by searching product documentation, checking order status, and generating contextual responses. Escalates complex issues to human agents.",
};

const tools = [
  { name: "Search Knowledge Base", type: "built-in", status: "active" },
  { name: "Check Order Status", type: "api", status: "active" },
  { name: "Create Support Ticket", type: "api", status: "active" },
  { name: "Escalate to Human", type: "workflow", status: "active" },
  { name: "Send Email Reply", type: "api", status: "disabled" },
];

const evalResults = [
  { name: "Greeting quality", passed: true, score: 94, runs: 50 },
  { name: "Knowledge accuracy", passed: true, score: 91, runs: 50 },
  { name: "Escalation judgment", passed: true, score: 87, runs: 30 },
  { name: "Hallucination check", passed: false, score: 72, runs: 50 },
  { name: "Response latency", passed: true, score: 96, runs: 50 },
];

const versions = [
  { version: "v5 (current)", date: "2 days ago", author: "Gouhar Ali", changes: "Updated system instructions for tone" },
  { version: "v4", date: "1 week ago", author: "Sarah Chen", changes: "Added pricing knowledge source" },
  { version: "v3", date: "2 weeks ago", author: "Gouhar Ali", changes: "Connected escalation workflow" },
  { version: "v2", date: "1 month ago", author: "Gouhar Ali", changes: "Switched from GPT-3.5 to GPT-4o" },
  { version: "v1 (initial)", date: "Feb 14, 2026", author: "Gouhar Ali", changes: "Initial agent creation" },
];

const toolTypeColors: Record<string, string> = {
  "built-in": "bg-zinc-100 text-zinc-600",
  api: "bg-blue-50 text-blue-600",
  workflow: "bg-green-50 text-green-600",
};

/* Conversation history for test chat */
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  tokens?: number;
  latency?: string;
  toolCalls?: string[];
}

/* Usage chart data */
const usageChartData = [
  { day: "Mon", invocations: 1240, tokens: 380000, cost: 36 },
  { day: "Tue", invocations: 1580, tokens: 420000, cost: 41 },
  { day: "Wed", invocations: 890, tokens: 280000, cost: 28 },
  { day: "Thu", invocations: 1720, tokens: 510000, cost: 48 },
  { day: "Fri", invocations: 2100, tokens: 620000, cost: 58 },
  { day: "Sat", invocations: 450, tokens: 140000, cost: 14 },
  { day: "Sun", invocations: 340, tokens: 110000, cost: 11 },
];

const tabs = [
  { id: "overview", label: "Overview", icon: <Bot size={13} /> },
  { id: "chat", label: "Test Chat", icon: <MessageSquare size={13} /> },
  { id: "instructions", label: "Instructions", icon: <FileText size={13} /> },
  { id: "knowledge", label: "Knowledge", icon: <Brain size={13} /> },
  { id: "tools", label: "Tools", icon: <Wrench size={13} /> },
  { id: "evaluation", label: "Evaluation", icon: <Beaker size={13} /> },
  { id: "usage", label: "Usage", icon: <BarChart3 size={13} /> },
  { id: "versions", label: "Versions", icon: <Clock size={13} /> },
  { id: "settings", label: "Settings", icon: <Settings size={13} /> },
];

export function AgentDetailPage() {
  const { id } = useParams();
  const { data: apiAgent } = useAgent(id);
  const updateMutation = useUpdateAgent();
  const chatMutation = useAgentChat();
  const [activeTab, setActiveTab] = useState("overview");

  // Knowledge hooks
  const { data: linkedKBs, isLoading: kbLoading } = useAgentKnowledge(id || "");
  const { data: allKBs } = useKnowledgeBases();
  const linkMutation = useLinkKnowledge(id || "");
  const unlinkMutation = useUnlinkKnowledge(id || "");
  const [showKBPicker, setShowKBPicker] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = useCallback(async () => {
    if (!chatInput.trim() || !id || chatSending) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatSending(true);
    const start = Date.now();
    try {
      const resp = await chatMutation.mutateAsync({
        agentId: id,
        payload: { message: userMsg.content, thread_id: threadId },
      });
      const latency = ((Date.now() - start) / 1000).toFixed(1) + "s";
      if (resp.thread_id) setThreadId(resp.thread_id);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: resp.answer,
          timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          latency,
          toolCalls: resp.tools_used,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "system", content: "⚠ Failed to get a response. Check backend.", timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }) },
      ]);
    } finally {
      setChatSending(false);
    }
  }, [chatInput, id, chatSending, threadId, chatMutation]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
    setThreadId(undefined);
  }, []);

  // Unlinked KBs for the picker
  const linkedIds = new Set((linkedKBs || []).map((kb) => kb.id));
  const availableKBs = (allKBs || []).filter((kb) => !linkedIds.has(kb.id));

  // Merge API data over mock defaults
  const agentData = apiAgent
    ? {
        ...agent,
        id: apiAgent.id,
        name: apiAgent.name,
        status: apiAgent.status === "disabled" ? "inactive" as const : apiAgent.status,
        description: apiAgent.description || agent.description,
        toolCount: apiAgent.tools_count,
        provider: apiAgent.model_config_data?.provider || agent.provider,
        model: apiAgent.model_config_data?.model || agent.model,
      }
    : agent;

  return (
    <EntityDetailLayout
      backLabel="AI Agents"
      backTo="/ai-agents"
      name={agentData.name}
      status={{ label: agentData.status, variant: "success" }}
      subtitle={`${agentData.provider} / ${agentData.model} • ${agentData.knowledgeCount} knowledge • ${agentData.toolCount} tools`}
      icon={
        <div className="!bg-zinc-900 !rounded-lg flex items-center justify-center h-10 w-10">
          <Bot size={18} className="text-white" />
        </div>
      }
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button variant="secondary" size="sm">Test Agent</Button>
          <Button variant="primary" size="sm"><Bot size={12} /> Deploy</Button>
        </>
      }
    >
      {activeTab === "overview" && (
        <div className="space-y-5">
          <DetailSection title="About">
            <p className="text-[13px] text-zinc-600 leading-relaxed">{agent.description}</p>
          </DetailSection>

          <div className="grid grid-cols-4 gap-3">
            <MiniStat label="Invocations" value={agent.totalInvocations.toLocaleString()} />
            <MiniStat label="Avg Latency" value={agent.avgLatency} />
            <MiniStat label="Avg Cost" value={agent.avgCost} />
            <MiniStat label="Eval Score" value="88%" color={agent.evalState === "passing" ? "green" : "red"} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <DetailSection title="Configuration">
              <DetailRow label="Provider" value={<Badge variant="neutral">{agent.provider}</Badge>} />
              <DetailRow label="Model" value={<span className="font-mono text-[12px]">{agent.model}</span>} />
              <DetailRow label="Knowledge Sources" value={agent.knowledgeCount.toString()} />
              <DetailRow label="Tools" value={agent.toolCount.toString()} />
              <DetailRow label="Linked Workflows" value={agent.linkedWorkflows.toString()} />
            </DetailSection>

            <DetailSection title="Info">
              <DetailRow label="Owner" value={agent.owner} />
              <DetailRow label="Created" value={agent.createdAt} />
              <DetailRow label="Last Active" value={agent.lastActive} />
              <DetailRow label="Evaluation" value={<StatusDot status={agent.evalState === "passing" ? "success" : "error"} label={agent.evalState} />} />
            </DetailSection>
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="space-y-4">
          {/* Chat header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-zinc-400">
              <Sparkles size={12} className="text-zinc-400" />
              {threadId ? `Thread ${threadId.slice(0, 8)}…` : "New conversation"}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[11px]" onClick={clearChat}>Clear Chat</Button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="rounded-lg border border-zinc-100 bg-white shadow-xs overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <p className="text-center text-[12px] text-zinc-400 py-8">Send a message to start testing your agent.</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0",
                    msg.role === "user" ? "bg-blue-100 text-blue-600" : msg.role === "system" ? "bg-amber-100 text-amber-600" : "bg-zinc-900 text-white"
                  )}>
                    {msg.role === "user" ? <span className="text-[11px] font-semibold">G</span> : msg.role === "system" ? <AlertTriangle size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={cn("max-w-[75%] space-y-1", msg.role === "user" ? "items-end" : "")}>
                    <div className={cn(
                      "rounded-xl px-4 py-2.5 text-[13px] leading-relaxed",
                      msg.role === "user" ? "bg-blue-500 text-white" : msg.role === "system" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-zinc-50 text-zinc-700 border border-zinc-100"
                    )}>
                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/`(.*?)`/g, '<code class="bg-zinc-200/50 px-1 py-0.5 rounded text-[11px]">$1</code>')
                          .replace(/\n/g, '<br/>')
                      }} />
                    </div>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 px-1">
                        {msg.latency && <span>⏱ {msg.latency}</span>}
                        {msg.tokens && <span>🎫 {msg.tokens} tokens</span>}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Wrench size={9} /> {msg.toolCalls.join(", ")}
                          </span>
                        )}
                        <button className="hover:text-zinc-600 transition-colors"><Copy size={9} /></button>
                      </div>
                    )}
                    <span className="text-[9px] text-zinc-300 px-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {chatSending && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white flex-shrink-0">
                    <Bot size={13} />
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-zinc-400">
                    <Loader2 size={12} className="animate-spin" /> Thinking…
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-zinc-100 px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a message to test your agent…"
                className="flex-1 text-[13px] text-zinc-700 placeholder:text-zinc-400 bg-transparent outline-none"
                disabled={chatSending}
              />
              <Button variant="primary" size="sm" className="rounded-full px-3" onClick={sendMessage} disabled={chatSending || !chatInput.trim()}>
                {chatSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </Button>
            </div>
          </div>

          {/* Suggested prompts */}
          {chatMessages.length === 0 && (
            <div>
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-2">Suggested test prompts</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "What's the pricing for the Pro plan?",
                  "I need help with a billing issue",
                  "How do I export my data?",
                  "My workflow keeps failing",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => { setChatInput(prompt); }}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                  >
                    <ArrowRight size={10} className="text-zinc-400" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agent context panel */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
            <h3 className="text-[12px] font-semibold text-zinc-700 mb-3">Active Context</h3>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <p className="text-zinc-400 mb-1">Model</p>
                <p className="font-mono text-zinc-700">{agentData.model}</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Temperature</p>
                <p className="font-mono text-zinc-700">0.7</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Max Tokens</p>
                <p className="font-mono text-zinc-700">2,048</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Knowledge Sources</p>
                <p className="text-zinc-700">{(linkedKBs || []).length} linked</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Tools Available</p>
                <p className="text-zinc-700">{agentData.toolCount} connected</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Thread</p>
                <p className="text-zinc-700 font-mono">{threadId ? threadId.slice(0, 8) : "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "instructions" && (
        <div className="space-y-5">
          <DetailSection title="System Instructions" description="The core prompt that defines this agent's behavior">
            <div className="rounded-md border border-zinc-100 bg-zinc-50 p-4 font-mono text-[12px] text-zinc-600 leading-relaxed whitespace-pre-wrap">
{`You are a tier-1 customer support agent for FlowHolt. Your role is to help customers with their questions about the platform.

## Guidelines
- Be friendly, professional, and concise
- Always search the knowledge base before answering
- If you're not confident in an answer, escalate to a human agent
- Never make up information about pricing or features
- Include relevant documentation links when helpful

## Tone
- Warm but efficient
- Use clear, simple language
- Avoid technical jargon unless the customer uses it first

## Escalation Rules
- Complex billing issues → Finance team
- Account security concerns → Security team
- Feature requests → Product team
- Bug reports → Engineering team`}
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-zinc-400">
              {kbLoading ? "Loading…" : `${(linkedKBs || []).length} knowledge sources linked`}
            </span>
            <Button variant="secondary" size="sm" onClick={() => setShowKBPicker(!showKBPicker)}>
              <Plus size={12} /> Link Source
            </Button>
          </div>

          {/* KB picker dropdown */}
          {showKBPicker && availableKBs.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm space-y-1.5">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Available Knowledge Bases</p>
              {availableKBs.map((kb) => (
                <div key={kb.id} className="flex items-center justify-between rounded-md border border-zinc-100 px-3 py-2">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-700">{kb.name}</p>
                    <p className="text-[11px] text-zinc-400">{kb.document_count} docs • {kb.status}</p>
                  </div>
                  <Button
                    variant="secondary" size="sm"
                    onClick={() => { linkMutation.mutate(kb.id); setShowKBPicker(false); }}
                    disabled={linkMutation.isPending}
                  >
                    <Link2 size={11} /> Link
                  </Button>
                </div>
              ))}
            </div>
          )}
          {showKBPicker && availableKBs.length === 0 && (
            <p className="text-[12px] text-zinc-400 italic">No unlinked knowledge bases available. Create one in the Knowledge section first.</p>
          )}

          <DetailSection title="Linked Knowledge Sources">
            {(linkedKBs || []).length === 0 && !kbLoading && (
              <p className="text-[12px] text-zinc-400 italic py-4">No knowledge sources linked yet.</p>
            )}
            <div className="space-y-1.5">
              {(linkedKBs || []).map((kb) => (
                <div key={kb.id} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Brain size={13} className="text-zinc-400" />
                    <div>
                      <p className="text-[13px] font-medium text-zinc-700">{kb.name}</p>
                      <p className="text-[11px] text-zinc-400">{kb.document_count} docs • {kb.embedding_model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot status="active" label={kb.status} />
                    <button
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                      onClick={() => unlinkMutation.mutate(kb.id)}
                      title="Unlink"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "tools" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-zinc-400">{tools.filter(t => t.status === "active").length} active / {tools.length} total</span>
            <Button variant="secondary" size="sm">Add Tool</Button>
          </div>
          <DetailSection title="Connected Tools">
            <div className="space-y-1.5">
              {tools.map((tool, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Wrench size={13} className="text-zinc-400" />
                    <span className="text-[13px] text-zinc-700">{tool.name}</span>
                    <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-medium", toolTypeColors[tool.type])}>
                      {tool.type}
                    </span>
                  </div>
                  <StatusDot status={tool.status === "active" ? "active" : "disabled"} label={tool.status} />
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "evaluation" && (
        <div className="space-y-5">
          <div className="flex gap-4 text-[12px]">
            <span className="text-zinc-400">Overall <span className={cn("font-semibold", evalResults.every(e => e.passed) ? "text-green-600" : "text-amber-600")}>{evalResults.filter(e => e.passed).length}/{evalResults.length} passing</span></span>
            <span className="text-zinc-400">Avg Score <span className="font-semibold text-zinc-700">{Math.round(evalResults.reduce((s, e) => s + e.score, 0) / evalResults.length)}%</span></span>
          </div>
          <DetailSection title="Evaluation Results">
            <div className="space-y-1.5">
              {evalResults.map((ev, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-zinc-50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    {ev.passed ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                    <span className="text-[13px] text-zinc-700">{ev.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-zinc-400">{ev.runs} runs</span>
                    <div className="w-24 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", ev.score >= 85 ? "bg-green-500" : ev.score >= 70 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${ev.score}%` }}
                      />
                    </div>
                    <span className={cn("text-[12px] font-mono w-8 text-right", ev.score >= 85 ? "text-green-600" : ev.score >= 70 ? "text-amber-600" : "text-red-600")}>
                      {ev.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "usage" && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-3">
            <MiniStat label="Total Invocations" value="8,420" />
            <MiniStat label="This Week" value="1,247" />
            <MiniStat label="Total Cost" value="$252.60" />
            <MiniStat label="Total Tokens" value="2.8M" />
          </div>

          {/* Usage chart */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-semibold text-zinc-700">Weekly Invocations</h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Invocations</span>
                <span className="flex items-center gap-1 text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Cost ($)</span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-[100px]">
              {usageChartData.map((d, i) => {
                const maxInv = Math.max(...usageChartData.map((x) => x.invocations));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0">
                    <div className="w-full flex flex-col items-stretch relative" style={{ height: 80 }}>
                      <div className="flex-1" />
                      <div className="w-full rounded-t bg-violet-400/80" style={{ height: `${(d.invocations / maxInv) * 80}px`, minHeight: 2 }} />
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-1">{d.day}</span>
                    <span className="text-[8px] text-zinc-300">{(d.invocations / 1000).toFixed(1)}k</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
            <h3 className="text-[12px] font-semibold text-zinc-700 mb-3">Cost Breakdown (This Week)</h3>
            <div className="space-y-2">
              {[
                { label: "GPT-4o tokens", cost: "$186.40", pct: 74 },
                { label: "Knowledge base queries", cost: "$42.80", pct: 17 },
                { label: "Tool executions", cost: "$23.40", pct: 9 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-600 flex-1">{item.label}</span>
                  <div className="w-32 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-zinc-400" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-700 w-16 text-right">{item.cost}</span>
                  <span className="text-[10px] text-zinc-400 w-8 text-right">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <DetailSection title="Usage by Workflow">
            <div className="space-y-1.5">
              {[
                { name: "Customer Support Chat", calls: 6200, pct: 74 },
                { name: "Email Auto-Reply", calls: 2220, pct: 26 },
              ].map((wf, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md border border-zinc-50 px-3 py-2.5">
                  <GitBranch size={12} className="text-zinc-400" />
                  <span className="text-[13px] text-zinc-700 flex-1">{wf.name}</span>
                  <span className="text-[12px] text-zinc-400 font-mono">{wf.calls.toLocaleString()} calls</span>
                  <div className="w-20 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-zinc-400" style={{ width: `${wf.pct}%` }} />
                  </div>
                  <span className="text-[11px] text-zinc-400 w-8 text-right">{wf.pct}%</span>
                </div>
              ))}
            </div>
          </DetailSection>

          {/* Top queries */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs">
            <h3 className="text-[12px] font-semibold text-zinc-700 mb-3">Top Queries This Week</h3>
            <div className="space-y-2">
              {[
                { query: "How do I set up webhooks?", count: 142 },
                { query: "What's the pricing?", count: 98 },
                { query: "My workflow isn't running", count: 87 },
                { query: "How to connect Stripe", count: 73 },
                { query: "Reset my password", count: 61 },
              ].map((q, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-300 w-4">{i + 1}.</span>
                  <span className="text-[11px] text-zinc-600 flex-1">{q.query}</span>
                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    <Hash size={9} />{q.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "versions" && (
        <DetailSection title="Version History">
          <div className="space-y-1.5">
            {versions.map((v, i) => (
              <div key={i} className="flex items-start gap-3 rounded-md border border-zinc-50 px-3 py-2.5">
                <div className="mt-1">
                  {i === 0 ? (
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-zinc-200" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-zinc-700">{v.version}</p>
                  <p className="text-[11px] text-zinc-400">{v.changes}</p>
                  <p className="text-[10px] text-zinc-300 mt-0.5">by {v.author} • {v.date}</p>
                </div>
                {i !== 0 && (
                  <Button variant="ghost" size="sm" className="text-[11px]">Restore</Button>
                )}
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {activeTab === "settings" && (
        <div className="space-y-5">
          <DetailSection title="Agent Settings">
            <DetailRow label="Temperature" value={<span className="font-mono">0.7</span>} />
            <DetailRow label="Max Tokens" value={<span className="font-mono">2048</span>} />
            <DetailRow label="Context Window" value={<span className="font-mono">128K</span>} />
            <DetailRow label="Streaming" value={<Badge variant="success">Enabled</Badge>} />
            <DetailRow label="Fallback Model" value={<span className="font-mono">GPT-3.5 Turbo</span>} />
          </DetailSection>

          <DetailSection title="Rate Limits">
            <DetailRow label="Max Requests/min" value={<span className="font-mono">60</span>} />
            <DetailRow label="Max Tokens/day" value={<span className="font-mono">500,000</span>} />
            <DetailRow label="Cost Limit/day" value={<span className="font-mono">$50.00</span>} />
          </DetailSection>

          <DetailSection title="Danger Zone">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-zinc-700">Delete this agent</p>
                <p className="text-[11px] text-zinc-400">All knowledge sources and tools will be unlinked.</p>
              </div>
              <Button variant="secondary" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
            </div>
          </DetailSection>
        </div>
      )}
    </EntityDetailLayout>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: "green" | "red" }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-xs text-center">
      <p className={cn("text-[22px] font-semibold", color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : "text-zinc-800")}>{value}</p>
      <p className="text-[11px] text-zinc-400 mt-1">{label}</p>
    </div>
  );
}
