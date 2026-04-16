import {
  type ApiWorkflowCreatePayload,
  type ApiWorkflowDetail,
  type ApiWorkflowEdge,
  type ApiWorkflowStep,
} from "@/lib/api";

export type AgentEntry = {
  workflowId: string;
  workflowName: string;
  workflowStatus: string;
  nodeId: string;
  nodeName: string;
  provider: string;
  model: string;
  temperature: number;
  prompt: string;
  systemMessage: string;
  credentialId: string | null;
  tools: string[];
  memoryLabels: string[];
  sourceLabels: string[];
  connectedNodeLabels: string[];
  outputLabels: string[];
};

export type AgentOperationalState = "ready" | "attention" | "draft";

export type AgentOperationalStatus = {
  state: AgentOperationalState;
  label: string;
  summary: string;
  reasons: string[];
};

export type AgentTopologySummary = {
  sourceCount: number;
  toolCount: number;
  memoryCount: number;
  outputCount: number;
  compact: string;
};

const isClusterEdge = (label?: string | null) => (label ?? "").toLowerCase().startsWith("cluster:");

const getStepLabel = (step: ApiWorkflowStep) => {
  const typeLabel = step.type.replaceAll("_", " ");
  return step.name || typeLabel;
};

const getToolLabel = (step: ApiWorkflowStep) => {
  const toolName = typeof step.config?.tool_name === "string" ? step.config.tool_name : "";
  return toolName || step.name || "Tool";
};

const getMemoryLabel = (step: ApiWorkflowStep) => {
  const memoryType = typeof step.config?.memory_type === "string" ? step.config.memory_type : "memory";
  return step.name || memoryType.replaceAll("_", " ");
};

const getOutputLabel = (step: ApiWorkflowStep) => {
  const parserType = typeof step.config?.parser_type === "string" ? step.config.parser_type : "output parser";
  return step.name || parserType.replaceAll("_", " ");
};

export const buildAgentEntries = (workflow: ApiWorkflowDetail): AgentEntry[] => {
  const stepsById = new Map(workflow.definition.steps.map((step) => [step.id, step]));
  const edges = workflow.definition.edges ?? [];

  return workflow.definition.steps
    .filter((step) => step.type === "ai_agent" && typeof step.config?.cluster_parent_id !== "string")
    .map((agentStep) => {
      const clusterChildren = workflow.definition.steps.filter((step) => step.config?.cluster_parent_id === agentStep.id);
      const toolChildren = clusterChildren.filter((step) => step.type === "ai_tool");
      const memoryChildren = clusterChildren.filter((step) => step.type === "ai_memory");
      const outputChildren = clusterChildren.filter((step) => step.type === "ai_output_parser");
      const modelChild = clusterChildren.find((step) => step.type === "ai_chat_model") ?? null;

      const incomingSources = edges
        .filter((edge) => edge.target === agentStep.id && !isClusterEdge(edge.label))
        .map((edge) => stepsById.get(edge.source))
        .filter((step): step is ApiWorkflowStep => Boolean(step));

      const prompt = typeof agentStep.config?.prompt === "string" ? agentStep.config.prompt : "";
      const systemMessage = typeof agentStep.config?.system_message === "string" ? agentStep.config.system_message : "";
      const directTools = Array.isArray(agentStep.config?.tools)
        ? agentStep.config.tools.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
      const childTools = toolChildren.map(getToolLabel);

      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        workflowStatus: workflow.status,
        nodeId: agentStep.id,
        nodeName: agentStep.name,
        provider:
          (typeof agentStep.config?.provider === "string" && agentStep.config.provider) ||
          (typeof modelChild?.config?.provider === "string" ? modelChild.config.provider : "") ||
          "openai",
        model:
          (typeof agentStep.config?.model === "string" && agentStep.config.model) ||
          (typeof modelChild?.config?.model === "string" ? modelChild.config.model : "") ||
          "",
        temperature: Number(agentStep.config?.temperature ?? 0.7),
        prompt,
        systemMessage,
        credentialId: typeof agentStep.config?.credential_id === "string" ? agentStep.config.credential_id : null,
        tools: Array.from(new Set([...directTools, ...childTools])),
        memoryLabels: memoryChildren.map(getMemoryLabel),
        sourceLabels: incomingSources.map((step) => step.type.replaceAll("_", " ")),
        connectedNodeLabels: incomingSources.map(getStepLabel),
        outputLabels: outputChildren.map(getOutputLabel),
      };
    });
};

export const buildStarterAgentWorkflow = (): ApiWorkflowCreatePayload & { focusNodeId: string } => {
  const triggerId = `step-trigger-${Date.now()}`;
  const agentId = `step-ai-agent-${Date.now() + 1}`;
  const modelId = `step-ai-model-${Date.now() + 2}`;
  const memoryId = `step-ai-memory-${Date.now() + 3}`;
  const toolId = `step-ai-tool-${Date.now() + 4}`;
  const outputId = `step-ai-output-${Date.now() + 5}`;

  return {
    name: "Custom AI Agent",
    trigger_type: "manual",
    category: "ai",
    status: "draft",
    focusNodeId: agentId,
    definition: {
      steps: [
        {
          id: triggerId,
          type: "trigger",
          name: "Manual Trigger",
          config: { source: "manual", ui_position: { x: 96, y: 240 } },
        },
        {
          id: agentId,
          type: "ai_agent",
          name: "Custom AI Agent",
          config: {
            agent_type: "tools_agent",
            provider: "openai",
            model: "gpt-4o",
            system_message: "You are a helpful AI agent that uses workflow context and connected tools to complete the task.",
            prompt: "Analyze the incoming workflow data and produce the best next action.",
            tools: ["workflow_context"],
            temperature: 0.7,
            memory_enabled: true,
            memory_type: "buffer",
            memory_window: 10,
            output_format: "text",
            output_key: "agent_response",
            ui_position: { x: 416, y: 240 },
          },
        },
        {
          id: modelId,
          type: "ai_chat_model",
          name: "Custom AI Agent Model",
          config: {
            provider: "openai",
            model: "gpt-4o",
            cluster_parent_id: agentId,
            cluster_slot: "model",
            ui_position: { x: 440, y: 366 },
          },
        },
        {
          id: memoryId,
          type: "ai_memory",
          name: "Custom AI Agent Memory",
          config: {
            memory_type: "buffer_window",
            context_window: 5,
            session_key: "{{execution_id}}",
            cluster_parent_id: agentId,
            cluster_slot: "memory",
            ui_position: { x: 468, y: 366 },
          },
        },
        {
          id: toolId,
          type: "ai_tool",
          name: "Custom AI Agent Tool 1",
          config: {
            tool_name: "tool",
            tool_type: "http_request",
            method: "GET",
            cluster_parent_id: agentId,
            cluster_slot: "tool",
            ui_position: { x: 496, y: 366 },
          },
        },
        {
          id: outputId,
          type: "ai_output_parser",
          name: "Custom AI Agent Output Parser",
          config: {
            parser_type: "json",
            strict_mode: true,
            cluster_parent_id: agentId,
            cluster_slot: "output_parser",
            ui_position: { x: 524, y: 366 },
          },
        },
      ],
      edges: [
        { id: `edge-${triggerId}-${agentId}`, source: triggerId, target: agentId, label: null },
        { id: `edge-${agentId}-${modelId}-cluster-model`, source: agentId, target: modelId, label: "cluster:model" },
        { id: `edge-${agentId}-${memoryId}-cluster-memory`, source: agentId, target: memoryId, label: "cluster:memory" },
        { id: `edge-${agentId}-${toolId}-cluster-tool`, source: agentId, target: toolId, label: "cluster:tool" },
        { id: `edge-${agentId}-${outputId}-cluster-output`, source: agentId, target: outputId, label: "cluster:output_parser" },
      ] satisfies ApiWorkflowEdge[],
      settings: {
        execution_order: "v1",
        caller_policy: "inherit",
        timezone: "UTC",
        save_failed_executions: "all",
        save_successful_executions: "all",
        save_manual_executions: true,
        save_execution_progress: true,
        timeout_seconds: 3600,
        time_saved_minutes: 0,
        error_workflow_id: null,
      },
    },
  };
};

export const getAgentSummary = (agent: AgentEntry) => {
  return agent.systemMessage || agent.prompt || "No instructions configured yet.";
};

export const getAgentTopologySummary = (agent: AgentEntry): AgentTopologySummary => {
  const parts: string[] = [];
  if (agent.connectedNodeLabels.length > 0) {
    parts.push(`${agent.connectedNodeLabels.length} source${agent.connectedNodeLabels.length === 1 ? "" : "s"}`);
  }
  if (agent.tools.length > 0) {
    parts.push(`${agent.tools.length} tool${agent.tools.length === 1 ? "" : "s"}`);
  }
  if (agent.memoryLabels.length > 0) {
    parts.push("memory");
  }
  if (agent.outputLabels.length > 0) {
    parts.push(`${agent.outputLabels.length} output`);
  }

  return {
    sourceCount: agent.connectedNodeLabels.length,
    toolCount: agent.tools.length,
    memoryCount: agent.memoryLabels.length,
    outputCount: agent.outputLabels.length,
    compact: parts.join(" · ") || "Core agent only",
  };
};

export const getAgentOperationalStatus = (
  agent: AgentEntry,
  options?: { credentialResolved?: boolean | null },
): AgentOperationalStatus => {
  const reasons: string[] = [];

  if (!agent.model.trim()) {
    reasons.push("Missing chat model");
  }
  if (!agent.systemMessage.trim() && !agent.prompt.trim()) {
    reasons.push("Missing instructions");
  }
  if (options?.credentialResolved === false) {
    reasons.push("Credential reference missing");
  }

  if (reasons.length > 0) {
    return {
      state: "attention",
      label: "Needs Attention",
      summary: reasons.join(" · "),
      reasons,
    };
  }

  if (agent.workflowStatus !== "active") {
    return {
      state: "draft",
      label: "Draft",
      summary: "Configured but not running in an active workflow",
      reasons: ["Workflow is not active"],
    };
  }

  return {
    state: "ready",
    label: "Ready",
    summary: "Configured for workflow execution",
    reasons: [],
  };
};