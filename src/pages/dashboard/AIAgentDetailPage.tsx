import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Code2,
  Copy,
  GitBranch,
  Loader2,
  Network,
  Settings2,
  Sparkles,
  Wrench,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import { api } from "@/lib/api";
import {
  buildAgentEntries,
  getAgentOperationalStatus,
  getAgentSummary,
  getAgentTopologySummary,
  type AgentEntry,
} from "@/lib/agent-inventory";
import { cn } from "@/lib/utils";

const detailTabs = ["Summary", "Topology", "Instructions", "Code"] as const;
type DetailTab = (typeof detailTabs)[number];

type CodeFramework = "crewai" | "langchain" | "flowholt";

const frameworkLabels: Record<CodeFramework, string> = {
  crewai: "CrewAI",
  langchain: "LangChain",
  flowholt: "FlowHolt SDK",
};

const stateTone = {
  ready: {
    banner: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  attention: {
    banner: "border-amber-200 bg-amber-50/80 text-amber-900",
    badge: "border-amber-100 bg-amber-50 text-amber-700",
    icon: AlertTriangle,
  },
  draft: {
    banner: "border-slate-200 bg-slate-100 text-slate-800",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    icon: CircleDashed,
  },
} as const;

const generateCrewAICode = (agent: AgentEntry) => `from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="${agent.model || "gpt-4o"}",
    temperature=${agent.temperature},
)

${agent.nodeName.replace(/\s+/g, "_").toLowerCase()} = Agent(
    role="${agent.nodeName}",
    goal="${(agent.systemMessage || agent.prompt || "Complete the assigned task").replace(/"/g, '\\"').slice(0, 200)}",
    backstory="Imported from FlowHolt workflow: ${agent.workflowName.replace(/"/g, '\\"')}",
    llm=llm,
    verbose=True,${agent.memoryLabels.length > 0 ? "\n    memory=True," : ""}${agent.tools.length > 0 ? `\n    tools=[${agent.tools.map((tool) => `"${tool}"`).join(", ")}],  # Replace with CrewAI tool instances` : ""}
)

task = Task(
    description="${(agent.prompt || "Perform the agent task").replace(/"/g, '\\"').slice(0, 200)}",
    expected_output="Structured response",
    agent=${agent.nodeName.replace(/\s+/g, "_").toLowerCase()},
)

crew = Crew(
    agents=[${agent.nodeName.replace(/\s+/g, "_").toLowerCase()}],
    tasks=[task],
    verbose=True,
)

result = crew.kickoff()
print(result)
`;

const generateLangChainCode = (agent: AgentEntry) => `from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

llm = ChatOpenAI(
    model="${agent.model || "gpt-4o"}",
    temperature=${agent.temperature},
)

prompt = ChatPromptTemplate.from_messages([
    ("system", """${(agent.systemMessage || "You are a helpful AI agent.").replace(/"/g, '\\"')}"""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools = []  # Map these FlowHolt tools: ${agent.tools.length > 0 ? agent.tools.join(", ") : "none configured"}

agent = create_openai_tools_agent(llm, tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
)

result = executor.invoke({"input": "${(agent.prompt || "Hello").replace(/"/g, '\\"').slice(0, 100)}"})
print(result["output"])
`;

const generateFlowHoltCode = (agent: AgentEntry) => `# FlowHolt SDK representation
# Workflow: ${agent.workflowName} (${agent.workflowId})
# Node: ${agent.nodeName} (${agent.nodeId})

from flowholt import FlowHoltClient

client = FlowHoltClient()

workflow = client.get_workflow("${agent.workflowId}")
agent_node = workflow.get_node("${agent.nodeId}")

print(agent_node.provider)      # ${agent.provider || "openai"}
print(agent_node.model)         # ${agent.model || "gpt-4o"}
print(agent_node.temperature)   # ${agent.temperature}
print(agent_node.tools)         # ${agent.tools.join(", ") || "none"}
print(agent_node.memory)        # ${agent.memoryLabels.join(", ") || "none"}

execution = client.execute_workflow(
    workflow_id="${agent.workflowId}",
    input_data={"message": "Hello agent"},
)
print(execution.result)
`;

const AIAgentDetailPage: React.FC = () => {
  const { workflowId, nodeId } = useParams<{ workflowId: string; nodeId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DetailTab>("Summary");
  const [codeFramework, setCodeFramework] = useState<CodeFramework>("crewai");
  const [copied, setCopied] = useState(false);

  const { data: workflow, isLoading } = useQuery({
    queryKey: ["workflow", workflowId, "agent-detail"],
    queryFn: () => api.getWorkflow(workflowId!),
    enabled: !!workflowId,
  });

  const { data: vault } = useQuery({
    queryKey: ["vault-overview"],
    queryFn: () => api.getVaultOverview(),
    initialData: { connections: [], credentials: [], variables: [] },
  });

  const agent = useMemo(() => {
    if (!workflow) {
      return null;
    }
    const entries = buildAgentEntries(workflow);
    return entries.find((entry) => entry.nodeId === nodeId) ?? null;
  }, [nodeId, workflow]);

  const credentialResolved = useMemo(() => {
    if (!agent?.credentialId) {
      return null;
    }
    return vault.credentials.some((credential) => credential.id === agent.credentialId);
  }, [agent?.credentialId, vault.credentials]);

  const credentialName = useMemo(() => {
    if (!agent?.credentialId) {
      return null;
    }
    return vault.credentials.find((credential) => credential.id === agent.credentialId)?.name ?? null;
  }, [agent?.credentialId, vault.credentials]);

  const operational = useMemo(
    () => (agent ? getAgentOperationalStatus(agent, { credentialResolved }) : null),
    [agent, credentialResolved],
  );
  const topology = useMemo(() => (agent ? getAgentTopologySummary(agent) : null), [agent]);
  const summary = useMemo(() => (agent ? getAgentSummary(agent) : ""), [agent]);

  const codeOutput = useMemo(() => {
    if (!agent) {
      return "";
    }
    switch (codeFramework) {
      case "crewai":
        return generateCrewAICode(agent);
      case "langchain":
        return generateLangChainCode(agent);
      case "flowholt":
        return generateFlowHoltCode(agent);
    }
  }, [agent, codeFramework]);

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(codeOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        <Loader2 size={20} className="mr-3 animate-spin" />
        Loading agent details...
      </div>
    );
  }

  if (!agent || !operational || !topology) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/ai-agents")}
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={14} />
          Back to AI Agents
        </button>

        <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
            <CircleDashed size={18} />
          </div>
          <div className="mt-4 text-[16px] font-semibold text-slate-900">Agent not found</div>
          <p className="mt-1.5 text-[13px] text-slate-500">The node may have been removed or the workflow route is no longer valid.</p>
        </div>
      </div>
    );
  }

  const tone = stateTone[operational.state];
  const ToneIcon = tone.icon;

  return (
    <div className="mx-auto max-w-[1440px] animate-fade-in px-6 pb-24 pt-6">
      <button
        type="button"
        onClick={() => navigate("/dashboard/ai-agents")}
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-slate-400 transition-colors hover:text-slate-600"
      >
        <ArrowLeft size={14} />
        AI Agents
        <ChevronRight size={12} className="text-slate-300" />
        <span className="font-medium text-slate-600">{agent.nodeName}</span>
      </button>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-slate-900">{agent.nodeName}</h1>
              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", tone.badge)}>
                {operational.label}
              </span>
            </div>
            <p className="mt-1 text-[13px] text-slate-500">
              {agent.provider && agent.model ? `${agent.provider} / ${agent.model}` : agent.provider || agent.model || "No model configured"}
              <span className="mx-2 text-slate-300">·</span>
              {agent.workflowName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.open(`/dashboard/ai-agents/${agent.workflowId}/${agent.nodeId}`, "_blank", "noopener,noreferrer")}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Open in new tab
            <ArrowUpRight size={13} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/studio/${agent.workflowId}?node=${encodeURIComponent(agent.nodeId)}`)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-[13px] font-medium text-white transition-colors hover:bg-slate-800"
          >
            Open in Studio
          </button>
        </div>
      </div>

      <div className={cn("mb-6 rounded-xl border px-4 py-3", tone.banner)}>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/70">
              <ToneIcon size={16} />
            </div>
            <div>
              <div className="text-[13px] font-semibold">{operational.summary}</div>
              <p className="mt-0.5 text-[12px] opacity-80">
                {operational.reasons.length > 0
                  ? operational.reasons.join(" · ")
                  : "This agent has a model, instructions, and an active workflow boundary."}
              </p>
            </div>
          </div>
          <div className="text-[12px] opacity-80">Topology: {topology.compact}</div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-6 border-b border-slate-200">
        {detailTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative pb-2.5 text-[13px] font-medium transition-colors",
              activeTab === tab
                ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-slate-900"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Summary" && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="State"
              value={operational.label}
              icon={tone.icon}
              iconColor={operational.state === "ready"
                ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                : operational.state === "attention"
                  ? "text-amber-600 bg-amber-50 border-amber-100"
                  : "text-slate-600 bg-slate-100 border-slate-200"}
            />
            <StatCard
              label="Workflow"
              value={agent.workflowStatus}
              icon={GitBranch}
              iconColor="text-slate-600 bg-slate-100 border-slate-200"
            />
            <StatCard
              label="Model"
              value={agent.model || "Not set"}
              icon={Sparkles}
              iconColor="text-violet-600 bg-violet-50 border-violet-100"
            />
            <StatCard
              label="Connections"
              value={`${topology.sourceCount + topology.toolCount + topology.memoryCount + topology.outputCount}`}
              icon={Network}
              iconColor="text-sky-600 bg-sky-50 border-sky-100"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Operational summary</div>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-slate-700">{summary}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Execution contract</div>
              <div className="mt-3 space-y-3 text-[13px] text-slate-600">
                <div className="flex items-center justify-between gap-6">
                  <span>Provider</span>
                  <span className="font-medium text-slate-900">{agent.provider || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span>Model</span>
                  <span className="font-medium text-slate-900">{agent.model || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span>Temperature</span>
                  <span className="font-medium text-slate-900">{agent.temperature.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span>Credential</span>
                  <span className="text-right font-medium text-slate-900">
                    {credentialName ?? (agent.credentialId ? "Missing credential" : "No linked credential")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span>Output</span>
                  <span className="text-right font-medium text-slate-900">
                    {agent.outputLabels.length > 0 ? agent.outputLabels.join(", ") : "No parser attached"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Topology" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Agent architecture</div>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Incoming sources</div>
                {agent.connectedNodeLabels.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.connectedNodeLabels.map((label, index) => (
                      <span key={`${label}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700">
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] text-slate-500">No upstream nodes feed context into this agent yet.</p>
                )}
              </div>

              <div className="flex justify-center text-slate-300">
                <ChevronRight size={18} className="rotate-90" />
              </div>

              <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-violet-900">
                  <Bot size={14} />
                  Agent core
                </div>
                <div className="mt-2 text-[13px] text-violet-900/80">{agent.nodeName}</div>
                <p className="mt-2 text-[12px] leading-5 text-violet-900/75">{summary}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Model binding</div>
                  <p className="mt-2 text-[13px] font-medium text-slate-900">{agent.model || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Memory</div>
                  <p className="mt-2 text-[13px] font-medium text-slate-900">
                    {agent.memoryLabels.length > 0 ? agent.memoryLabels.join(", ") : "No memory node"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tools</div>
                  <p className="mt-2 text-[13px] font-medium text-slate-900">
                    {agent.tools.length > 0 ? `${agent.tools.length} attached` : "No tools"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Output</div>
                  <p className="mt-2 text-[13px] font-medium text-slate-900">
                    {agent.outputLabels.length > 0 ? agent.outputLabels.join(", ") : "No parser"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Topology notes</div>
              <div className="mt-3 space-y-2 text-[13px] text-slate-600">
                <p>{topology.sourceCount > 0 ? `${topology.sourceCount} upstream sources are available to this agent.` : "This agent currently reasons without upstream source nodes."}</p>
                <p>{topology.toolCount > 0 ? `${topology.toolCount} tools are attached to the cluster.` : "No tool execution surface has been attached yet."}</p>
                <p>{topology.memoryCount > 0 ? "Memory is attached as part of the cluster." : "Memory is not part of this topology."}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                <Wrench size={12} />
                Tool surface
              </div>
              {agent.tools.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.tools.map((tool) => (
                    <span key={tool} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-700">
                      {tool}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-slate-500">No tool nodes are attached.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Instructions" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">System message</div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] leading-6 text-slate-700">
              {agent.systemMessage || "No system message configured."}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Prompt</div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] leading-6 text-slate-700">
              {agent.prompt || "No prompt configured."}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <Settings2 size={12} />
              Control surface
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[11px] text-slate-400">Temperature</div>
                <div className="mt-1 text-[14px] font-semibold text-slate-900">{agent.temperature.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[11px] text-slate-400">Provider</div>
                <div className="mt-1 text-[14px] font-semibold text-slate-900">{agent.provider || "Not set"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[11px] text-slate-400">Model</div>
                <div className="mt-1 text-[14px] font-semibold text-slate-900">{agent.model || "Not set"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[11px] text-slate-400">Credential</div>
                <div className="mt-1 text-[14px] font-semibold text-slate-900">
                  {credentialName ?? (agent.credentialId ? "Missing credential" : "No linked credential")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Code" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[13px] font-semibold text-slate-900">Portability view</div>
              <p className="mt-1 text-[12px] text-slate-500">
                This is a conceptual export of the current configuration, useful for comparing FlowHolt’s graph model to common Python agent frameworks.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              {(Object.keys(frameworkLabels) as CodeFramework[]).map((framework) => (
                <button
                  key={framework}
                  type="button"
                  onClick={() => setCodeFramework(framework)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                    codeFramework === framework ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {frameworkLabels[framework]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                <Code2 size={12} />
                {frameworkLabels[codeFramework]} · Python
              </div>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto p-5 text-[12px] leading-6 text-slate-300">
              <code>{codeOutput}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentDetailPage;