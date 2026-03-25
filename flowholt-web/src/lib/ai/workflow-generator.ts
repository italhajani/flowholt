import type { WorkflowGraph } from "@/lib/flowholt/types";

type GeneratedWorkflowDraft = {
  name: string;
  description: string;
  graph: WorkflowGraph;
  generation: {
    provider: "groq" | "huggingface" | "fallback";
    model: string;
    notes: string;
    originalPrompt: string;
  };
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
  }>;
  notes?: string;
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const HF_MODEL = process.env.HUGGINGFACE_MODEL ?? "meta-llama/Llama-3.1-8B-Instruct";

function buildSystemPrompt() {
  return [
    "You are an AI workflow planner for a product named FlowHolt.",
    "Convert the user request into a practical workflow draft.",
    "Return JSON only.",
    "The JSON must include name, description, nodes, edges, and optional notes.",
    "Use short user-friendly names.",
    "Supported node types are: trigger, agent, tool, condition, loop, memory, retriever, output.",
    "Create 4 to 8 nodes.",
    "Make node ids short and lowercase with hyphens.",
    "Edges must reference valid node ids.",
    "Do not include markdown fences.",
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

function sanitizeGraph(shape: DraftShape): WorkflowGraph {
  const nodes = Array.isArray(shape.nodes)
    ? shape.nodes
        .filter((node) => node?.id && node?.type && node?.label)
        .map((node, index) => ({
          id: String(node.id),
          type: node.type,
          label: String(node.label),
          position: {
            x: 80 + (index % 3) * 220,
            y: 80 + Math.floor(index / 3) * 160,
          },
          config: {},
        }))
    : [];

  const validIds = new Set(nodes.map((node) => node.id));
  const edges = Array.isArray(shape.edges)
    ? shape.edges
        .filter((edge) => validIds.has(String(edge.source)) && validIds.has(String(edge.target)))
        .map((edge) => ({
          source: String(edge.source),
          target: String(edge.target),
        }))
    : [];

  if (!nodes.length) {
    throw new Error("Generated workflow did not include valid nodes.");
  }

  return { nodes, edges };
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

  nodes.push({ id: "start", type: hasTrigger ? "trigger" : "memory", label: hasTrigger ? "Start trigger" : "Input" });
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

  for (let index = 0; index < nodes.length - 1; index += 1) {
    edges.push({ source: nodes[index].id, target: nodes[index + 1].id });
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

async function callGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with ${response.status}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("Groq returned no message content.");
  }

  const parsed = JSON.parse(extractJsonObject(content)) as DraftShape;

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

async function callHuggingFace(prompt: string) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(HF_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face request failed with ${response.status}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("Hugging Face returned no message content.");
  }

  const parsed = JSON.parse(extractJsonObject(content)) as DraftShape;

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
