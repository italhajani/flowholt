import type {
  WorkflowGraph,
  WorkflowNodeType,
  WorkflowRecord,
} from "@/lib/flowholt/types";
import { getCatalogPromptLines } from "@/lib/flowholt/node-catalog";

type WorkflowGenerationProvider = "groq" | "huggingface" | "fallback";
type WorkflowChangeKind = "add" | "remove" | "update";

type GenerationMeta = {
  provider: WorkflowGenerationProvider;
  model: string;
  notes: string;
  originalPrompt: string;
};

export type GeneratedWorkflowDraft = {
  name: string;
  description: string;
  graph: WorkflowGraph;
  generation: GenerationMeta;
};

export type WorkflowRevisionChange = {
  kind: WorkflowChangeKind;
  node_id: string;
  label: string;
  node_type: WorkflowNodeType;
  reason: string;
};

export type GeneratedWorkflowRevision = GeneratedWorkflowDraft & {
  reasoning: string[];
  changes: WorkflowRevisionChange[];
};

type DraftShape = {
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    type: WorkflowGraph["nodes"][number]["type"];
    label: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
    branch?: string;
  }>;
  notes?: string;
};

type RevisionShape = DraftShape & {
  reasoning?: unknown;
  changes?: unknown;
};

type GenerateRevisionInput = {
  prompt: string;
  workflow: Pick<WorkflowRecord, "name" | "description" | "graph">;
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const HF_MODEL = process.env.HUGGINGFACE_MODEL ?? "meta-llama/Llama-3.1-8B-Instruct";
const SUPPORTED_NODE_TYPES: WorkflowNodeType[] = [
  "trigger",
  "agent",
  "tool",
  "condition",
  "loop",
  "memory",
  "retriever",
  "output",
];

function buildCreateSystemPrompt() {
  const catalogLines = getCatalogPromptLines();

  return [
    "You are an AI workflow planner for a product named FlowHolt.",
    "Convert the user request into a practical workflow draft.",
    "Return JSON only.",
    "The JSON must include name, description, nodes, edges, and optional notes.",
    "Use short user-friendly names.",
    "Supported node types are: trigger, agent, tool, condition, loop, memory, retriever, output.",
    "If a condition node is used, add explicit edge branch values like true and false.",
    "Prefer these built-in FlowHolt blocks when planning:",
    ...catalogLines,
    "Create 4 to 8 nodes.",
    "Make node ids short and lowercase with hyphens.",
    "Edges must reference valid node ids.",
    "Do not include markdown fences.",
  ].join(" ");
}

function buildRevisionSystemPrompt() {
  const catalogLines = getCatalogPromptLines();

  return [
    "You are an AI workflow orchestrator for FlowHolt.",
    "You receive a current workflow graph and a user revision request.",
    "Produce an improved, production-ready workflow graph in JSON only.",
    "Return JSON with: name, description, nodes, edges, reasoning, changes, and optional notes.",
    "reasoning must be an array with 2 to 5 concise sentences.",
    "changes must be an array of objects with kind (add|remove|update), node_id, label, node_type, reason.",
    "Supported node types are: trigger, agent, tool, condition, loop, memory, retriever, output.",
    "If a condition node exists, edges from it must include branch true and false.",
    "Use short, clear node labels and stable ids.",
    "Keep node count between 4 and 10.",
    "Edges must only reference valid ids.",
    "Do not include markdown fences.",
    "Node catalog context:",
    ...catalogLines,
  ].join(" ");
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response.");
  }

  return text.slice(start, end + 1);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeNodeType(value: unknown): WorkflowNodeType | null {
  if (typeof value !== "string") {
    return null;
  }

  const type = value.trim().toLowerCase();
  return SUPPORTED_NODE_TYPES.includes(type as WorkflowNodeType)
    ? (type as WorkflowNodeType)
    : null;
}

function slugify(value: string, fallback: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || fallback;
}

function makeUniqueNodeId(value: string, used: Set<string>) {
  if (!used.has(value)) {
    used.add(value);
    return value;
  }

  let suffix = 2;
  let candidate = `${value}-${suffix}`;
  while (used.has(candidate)) {
    suffix += 1;
    candidate = `${value}-${suffix}`;
  }

  used.add(candidate);
  return candidate;
}

function defaultNodeConfig(nodeType: WorkflowNodeType): Record<string, unknown> {
  switch (nodeType) {
    case "trigger":
      return { mode: "manual" };
    case "agent":
      return {
        instruction: "Complete this step based on the workflow goal and prior outputs.",
        model: "default",
      };
    case "tool":
      return {
        method: "POST",
        url: "",
        body: { input: "{{previous.text}}" },
      };
    case "condition":
      return {
        value: "{{previous.status_code}}",
        equals: 200,
        branch_on_match: "true",
        branch_on_miss: "false",
      };
    case "loop":
      return { iterations: 1 };
    case "memory":
      return { source: "workflow" };
    case "retriever":
      return { query: "{{workflow.original_prompt}}" };
    case "output":
      return { result: "{{previous}}" };
    default:
      return {};
  }
}

function ensureRequiredNodes(graph: WorkflowGraph): WorkflowGraph {
  const nodes = [...graph.nodes];
  const edges = [...graph.edges];
  const usedIds = new Set(nodes.map((node) => node.id));

  const hasTrigger = nodes.some((node) => node.type === "trigger");
  if (!hasTrigger) {
    const triggerId = makeUniqueNodeId("trigger", usedIds);
    nodes.unshift({
      id: triggerId,
      type: "trigger",
      label: "Start trigger",
      config: defaultNodeConfig("trigger"),
      position: { x: 80, y: 80 },
    });
    if (nodes[1]) {
      edges.unshift({ source: triggerId, target: nodes[1].id });
    }
  }

  const hasOutput = nodes.some((node) => node.type === "output");
  if (!hasOutput) {
    const outputId = makeUniqueNodeId("final-output", usedIds);
    const lastNode = nodes[nodes.length - 1];
    nodes.push({
      id: outputId,
      type: "output",
      label: "Final output",
      config: defaultNodeConfig("output"),
      position: {
        x: 80 + ((nodes.length - 1) % 3) * 220,
        y: 80 + Math.floor((nodes.length - 1) / 3) * 160,
      },
    });
    if (lastNode && lastNode.id !== outputId) {
      edges.push({ source: lastNode.id, target: outputId });
    }
  }

  return { nodes, edges };
}

function sanitizeGraph(shape: DraftShape): WorkflowGraph {
  const usedIds = new Set<string>();
  const nodes: WorkflowGraph["nodes"] = [];

  if (Array.isArray(shape.nodes)) {
    shape.nodes.forEach((node, index) => {
      const nodeType = normalizeNodeType(node?.type);
      if (!nodeType) {
        return;
      }

      const nodeId = makeUniqueNodeId(
        slugify(asString(node?.id, `${nodeType}-${index + 1}`), `${nodeType}-${index + 1}`),
        usedIds,
      );

      nodes.push({
        id: nodeId,
        type: nodeType,
        label: asString(node?.label, `${nodeType} step`),
        position: {
          x: 80 + (index % 3) * 220,
          y: 80 + Math.floor(index / 3) * 160,
        },
        config: defaultNodeConfig(nodeType),
      });
    });
  }

  const validIds = new Set(nodes.map((node) => node.id));
  const edges = Array.isArray(shape.edges)
    ? shape.edges
        .filter((edge) => validIds.has(String(edge.source)) && validIds.has(String(edge.target)))
        .map((edge) => ({
          source: String(edge.source),
          target: String(edge.target),
          label: typeof edge.label === "string" ? edge.label : undefined,
          branch: typeof edge.branch === "string" ? edge.branch : undefined,
        }))
    : [];

  if (!nodes.length) {
    throw new Error("Generated workflow did not include valid nodes.");
  }

  const graph = ensureRequiredNodes({ nodes, edges });

  if (!graph.edges.length && graph.nodes.length > 1) {
    for (let index = 0; index < graph.nodes.length - 1; index += 1) {
      graph.edges.push({
        source: graph.nodes[index].id,
        target: graph.nodes[index + 1].id,
      });
    }
  }

  return graph;
}

function summarizeGraphForPrompt(graph: WorkflowGraph) {
  return JSON.stringify({
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      label: node.label,
      config: asRecord(node.config),
    })),
    edges: graph.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      label: edge.label ?? "",
      branch: edge.branch ?? "",
    })),
  });
}

function toReasoning(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asString(item))
    .filter(Boolean)
    .slice(0, 6);
}

function normalizeChangeKind(value: unknown): WorkflowChangeKind | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "add" || normalized === "remove" || normalized === "update") {
    return normalized;
  }

  return null;
}

function computeGraphChanges(before: WorkflowGraph, after: WorkflowGraph): WorkflowRevisionChange[] {
  const beforeById = new Map(before.nodes.map((node) => [node.id, node]));
  const afterById = new Map(after.nodes.map((node) => [node.id, node]));
  const changes: WorkflowRevisionChange[] = [];

  for (const node of after.nodes) {
    const previous = beforeById.get(node.id);
    if (!previous) {
      changes.push({
        kind: "add",
        node_id: node.id,
        label: node.label,
        node_type: node.type,
        reason: "Added to support the new request.",
      });
      continue;
    }

    if (previous.type !== node.type || previous.label !== node.label) {
      changes.push({
        kind: "update",
        node_id: node.id,
        label: node.label,
        node_type: node.type,
        reason: "Updated to better match the latest request.",
      });
    }
  }

  for (const node of before.nodes) {
    if (!afterById.has(node.id)) {
      changes.push({
        kind: "remove",
        node_id: node.id,
        label: node.label,
        node_type: node.type,
        reason: "Removed because it no longer matches the requested flow.",
      });
    }
  }

  return changes.slice(0, 20);
}

function sanitizeRevisionChanges(
  value: unknown,
  nextGraph: WorkflowGraph,
  previousGraph: WorkflowGraph,
): WorkflowRevisionChange[] {
  if (!Array.isArray(value)) {
    return computeGraphChanges(previousGraph, nextGraph);
  }

  const nodeTypeById = new Map(nextGraph.nodes.map((node) => [node.id, node.type]));
  const fallbackChanges = computeGraphChanges(previousGraph, nextGraph);

  const changes = value
    .map((item) => {
      const record = asRecord(item);
      const kind = normalizeChangeKind(record.kind);
      const nodeId = asString(record.node_id);
      const label = asString(record.label);
      const nodeType = normalizeNodeType(record.node_type);
      const reason = asString(record.reason);

      if (!kind || !nodeId) {
        return null;
      }

      return {
        kind,
        node_id: nodeId,
        label: label || nodeId,
        node_type: nodeType ?? nodeTypeById.get(nodeId) ?? "agent",
        reason: reason || "Updated by AI planner.",
      } satisfies WorkflowRevisionChange;
    })
    .filter((change): change is WorkflowRevisionChange => change !== null);

  return changes.length ? changes.slice(0, 20) : fallbackChanges;
}

function sanitizeRevision(
  shape: RevisionShape,
  previousGraph: WorkflowGraph,
  generation: GenerationMeta,
  originalPrompt: string,
): GeneratedWorkflowRevision {
  const graph = sanitizeGraph(shape);
  const reasoning = toReasoning(shape.reasoning);
  const changes = sanitizeRevisionChanges(shape.changes, graph, previousGraph);

  return {
    name: asString(shape.name, "Updated workflow"),
    description: asString(shape.description, "Workflow updated from chat request."),
    graph,
    reasoning: reasoning.length
      ? reasoning
      : [
          "Converted the latest message into a runnable graph update.",
          "Kept the flow grounded in trigger, action, and final output structure.",
          "Generated a clear change list so the UI can explain what was modified.",
        ],
    changes,
    generation: {
      ...generation,
      originalPrompt,
    },
  };
}

async function callProvider(
  url: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Provider request failed with ${response.status}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("Provider returned no message content.");
  }

  return JSON.parse(extractJsonObject(content)) as RevisionShape;
}

function makeFallbackDraft(prompt: string): GeneratedWorkflowDraft {
  const clean = prompt.replace(/\s+/g, " ").trim();
  const name = clean ? clean.split(" ").slice(0, 6).join(" ") : "New workflow";
  const lower = clean.toLowerCase();

  const hasEmail = /email|outreach|reply|message/.test(lower);
  const hasResearch = /research|enrich|analyze|summarize|investigate/.test(lower);
  const hasCondition = /if|score|qualify|check|approve|condition/.test(lower);
  const hasTrigger = /form|webhook|when|every|schedule|trigger/.test(lower);

  const nodes: DraftShape["nodes"] = [];
  const edges: DraftShape["edges"] = [];

  nodes.push({
    id: "start",
    type: hasTrigger ? "trigger" : "memory",
    label: hasTrigger ? "Start trigger" : "Input",
  });
  nodes.push({ id: "plan", type: "agent", label: "Task planner" });

  if (hasResearch) {
    nodes.push({ id: "research", type: "agent", label: "Research step" });
  }

  if (hasCondition) {
    nodes.push({ id: "check", type: "condition", label: "Decision check" });
  }

  if (hasEmail) {
    nodes.push({ id: "message", type: "agent", label: "Message draft" });
  } else {
    nodes.push({ id: "action", type: "tool", label: "Main action" });
  }

  nodes.push({ id: "finish", type: "output", label: "Final result" });

  if (hasCondition) {
    const beforeCondition =
      nodes.filter((node) => node.id !== "check" && node.id !== "message" && node.id !== "action" && node.id !== "finish").slice(-1)[0] ??
      nodes[1];
    const actionNode = nodes.find((node) => node.id === "message" || node.id === "action");

    if (beforeCondition) {
      edges.push({ source: beforeCondition.id, target: "check" });
    }
    if (actionNode) {
      edges.push({ source: "check", target: actionNode.id, branch: "true", label: "True" });
      edges.push({ source: "check", target: "finish", branch: "false", label: "False" });
      edges.push({ source: actionNode.id, target: "finish" });
    }
  } else {
    for (let index = 0; index < nodes.length - 1; index += 1) {
      edges.push({ source: nodes[index].id, target: nodes[index + 1].id });
    }
  }

  return {
    name: name || "New workflow",
    description: clean || "Workflow draft created from chat.",
    graph: sanitizeGraph({
      name: name || "New workflow",
      description: clean || "Workflow draft created from chat.",
      nodes,
      edges,
      notes: "Local fallback draft created without an external AI provider.",
    }),
    generation: {
      provider: "fallback",
      model: "local-heuristic",
      notes: "Local fallback draft created without an external AI provider.",
      originalPrompt: prompt,
    },
  };
}

function makeFallbackRevision(input: GenerateRevisionInput): GeneratedWorkflowRevision {
  const contextualPrompt = [
    `Current workflow: ${input.workflow.name}`,
    input.workflow.description ? `Description: ${input.workflow.description}` : "",
    `Update request: ${input.prompt}`,
  ]
    .filter(Boolean)
    .join(". ");

  const draft = makeFallbackDraft(contextualPrompt);
  const changes = computeGraphChanges(input.workflow.graph, draft.graph);

  return {
    ...draft,
    reasoning: [
      "Built a revised graph from the latest user request.",
      "Kept the result runnable with trigger, action steps, and a final output.",
      "Used local fallback planning because an external planner was unavailable.",
    ],
    changes,
    generation: {
      ...draft.generation,
      model: "local-revision-heuristic",
      notes: "Revision generated with local fallback planning.",
      originalPrompt: input.prompt,
    },
  };
}

async function callGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return null;
  }

  const parsed = await callProvider(
    GROQ_URL,
    apiKey,
    GROQ_MODEL,
    buildCreateSystemPrompt(),
    prompt,
  );

  return {
    name: parsed.name,
    description: parsed.description,
    graph: sanitizeGraph(parsed),
    generation: {
      provider: "groq" as const,
      model: GROQ_MODEL,
      notes: parsed.notes ?? "Draft created by Groq.",
      originalPrompt: prompt,
    },
  } satisfies GeneratedWorkflowDraft;
}

async function callGroqRevision(input: GenerateRevisionInput) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return null;
  }

  const userPrompt = [
    `Current workflow name: ${input.workflow.name}`,
    input.workflow.description ? `Current description: ${input.workflow.description}` : "",
    `Current graph JSON: ${summarizeGraphForPrompt(input.workflow.graph)}`,
    `Revision request: ${input.prompt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const parsed = await callProvider(
    GROQ_URL,
    apiKey,
    GROQ_MODEL,
    buildRevisionSystemPrompt(),
    userPrompt,
  );

  return sanitizeRevision(
    parsed,
    input.workflow.graph,
    {
      provider: "groq",
      model: GROQ_MODEL,
      notes: asString(parsed.notes, "Revision created by Groq."),
      originalPrompt: input.prompt,
    },
    input.prompt,
  );
}

async function callHuggingFace(prompt: string) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const parsed = await callProvider(
    HF_URL,
    apiKey,
    HF_MODEL,
    buildCreateSystemPrompt(),
    prompt,
  );

  return {
    name: parsed.name,
    description: parsed.description,
    graph: sanitizeGraph(parsed),
    generation: {
      provider: "huggingface" as const,
      model: HF_MODEL,
      notes: parsed.notes ?? "Draft created by Hugging Face.",
      originalPrompt: prompt,
    },
  } satisfies GeneratedWorkflowDraft;
}

async function callHuggingFaceRevision(input: GenerateRevisionInput) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const userPrompt = [
    `Current workflow name: ${input.workflow.name}`,
    input.workflow.description ? `Current description: ${input.workflow.description}` : "",
    `Current graph JSON: ${summarizeGraphForPrompt(input.workflow.graph)}`,
    `Revision request: ${input.prompt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const parsed = await callProvider(
    HF_URL,
    apiKey,
    HF_MODEL,
    buildRevisionSystemPrompt(),
    userPrompt,
  );

  return sanitizeRevision(
    parsed,
    input.workflow.graph,
    {
      provider: "huggingface",
      model: HF_MODEL,
      notes: asString(parsed.notes, "Revision created by Hugging Face."),
      originalPrompt: input.prompt,
    },
    input.prompt,
  );
}

export async function generateWorkflowDraft(prompt: string): Promise<GeneratedWorkflowDraft> {
  try {
    const groqDraft = await callGroq(prompt);
    if (groqDraft) {
      return groqDraft;
    }
  } catch {
    // Fall through to the next provider.
  }

  try {
    const hfDraft = await callHuggingFace(prompt);
    if (hfDraft) {
      return hfDraft;
    }
  } catch {
    // Fall through to local generation.
  }

  return makeFallbackDraft(prompt);
}

export async function generateWorkflowRevision(
  input: GenerateRevisionInput,
): Promise<GeneratedWorkflowRevision> {
  try {
    const groqRevision = await callGroqRevision(input);
    if (groqRevision) {
      return groqRevision;
    }
  } catch {
    // Fall through to the next provider.
  }

  try {
    const hfRevision = await callHuggingFaceRevision(input);
    if (hfRevision) {
      return hfRevision;
    }
  } catch {
    // Fall through to local revision planning.
  }

  return makeFallbackRevision(input);
}

