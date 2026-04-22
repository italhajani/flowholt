# FlowHolt AI Agents — Full Specification

> **Status:** Rebuilt 2026-04-16 from n8n Domain 1 research (50 pages) + Make corpus  
> **Direction:** n8n cluster node architecture is the primary model. FlowHolt exceeds both.  
> **Vault:** [[wiki/concepts/ai-agents]]  
> **Raw sources:**  
> - n8n: `research/n8n-docs-export/pages_markdown/advanced-ai/` (~50 pages)  
> - Make: `research/make-help-center-export/pages_markdown/` (AI Agents section)  
> **See also:** `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` | `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md`

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Agent entity model | `research/make-help-center-export/pages_markdown/manage-ai-agents.md` | Agent as managed entity with ID |
| Cluster node architecture | `research/n8n-docs-export/pages_markdown/advanced-ai/ai-glossary.md` | Root vs sub-node definitions |
| Tools | `research/n8n-docs-export/pages_markdown/advanced-ai/examples-and-tutorials/using-tools-with-agents.md` | Tool types and how sub-nodes attach |
| Tools | `research/make-help-center-export/pages_markdown/tools-for-ai-agents.md` | Make tool types |
| Memory | `research/n8n-docs-export/pages_markdown/advanced-ai/memory/` | All memory sub-node types |
| Chat Memory Manager | `research/n8n-docs-export/pages_markdown/integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_memorymanager.md` | 3 ops: Get/Insert/Delete, Hide from chat UI |
| Structured Output Parser | `research/n8n-docs-export/pages_markdown/integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_outputparserstructured.md` | 2 schema modes, $ref not supported |
| RAG | `research/n8n-docs-export/pages_markdown/advanced-ai/rag-in-n8n.md` | Full RAG pipeline |
| HITL | `research/n8n-docs-export/pages_markdown/advanced-ai/examples-and-tutorials/human-in-the-loop.md` | Per-tool approval flow |
| MCP client | `research/n8n-docs-export/pages_markdown/advanced-ai/mcp/use-mcp-with-n8n.md` | MCP client setup |
| MCP server | `research/n8n-docs-export/pages_markdown/advanced-ai/mcp/turn-n8n-into-mcp-server.md` | n8n as MCP server |
| MCP toolboxes | `research/make-help-center-export/pages_markdown/mcp-toolboxes.md` | Make's MCP toolbox feature |
| Evaluation | `research/n8n-docs-export/pages_markdown/advanced-ai/evaluation/` | Test datasets, metrics |
| $fromAI() | `research/n8n-docs-export/pages_markdown/advanced-ai/examples-and-tutorials/using-fromai.md` | $fromAI() function usage |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Agent root node | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/agent/Agent.node.ts` |
| Tools Agent executor | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/agent/agents/ToolsAgent/` |
| Workflow tool | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/tool/ToolWorkflow.node.ts` |
| Code tool | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/tool/ToolCode.node.ts` |
| HTTP tool | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/tool/ToolHttpRequest.node.ts` |
| MCP Client Tool | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpClientTool.node.ts` |
| MCP Server Trigger | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpTrigger.node.ts` |
| Buffer Window Memory | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/memory/MemoryBufferWindow/` |
| Postgres Memory | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/memory/MemoryPostgres/` |
| PGVector Store | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/vector_store/VectorStorePGVector.node.ts` |
| Embeddings OpenAI | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/embeddings/EmbeddingsOpenAi/` |
| Document Loader | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/document_loaders/` |
| Chat Memory Manager | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/memory/MemoryManager/MemoryManager.node.ts` |
| Structured Output Parser | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/output_parser/OutputParserStructured/` |
| Auto-fixing Output Parser | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/output_parser/OutputParserAutofixing/` |

### This file feeds into

| File | What it informs |
|------|----------------|
| `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` | Entity + knowledge system detail |
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | §7 AI/Cluster node status |
| `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | `$fromAI()` function |
| `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` | MCP server connections |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Domain 2 AI gap matrix |
| `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | Domain 1 decisions |

---

AI agents exist at two levels simultaneously:

1. **Managed product objects** — entities with an identity, version, knowledge base, and tool inventory. Managed from the Agents inventory page. Reusable across workflows.
2. **Runtime cluster nodes** — placeable in Studio canvas as root nodes. Sub-nodes (memory, tools, retrievers, LLM) attach via typed connector slots.

This dual nature is what makes FlowHolt's agent model superior to both Make (which treats agents as monolithic app blocks) and n8n (where agents are only runtime nodes, not product objects).

---

## Agent Entity Model

Each AI agent has these fields:

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Stable identifier |
| `name` | string | Display name |
| `description` | string | Purpose and behavior summary |
| `owner_scope` | `workspace \| team` | Where it lives |
| `status` | `draft \| active \| archived` | — |
| `provider_connection_id` | FK | OAuth/API key for LLM provider |
| `model_policy` | object | Model ID, fallback, temperature, max tokens |
| `system_prompt` | text | Core instructions |
| `response_mode` | `text \| json \| structured` | Output format |
| `max_history` | int | Buffer window size |
| `timeout_seconds` | int | Max execution time |
| `tools` | AgentTool[] | Tool inventory (see below) |
| `knowledge_collections` | KnowledgeCollection[] | RAG knowledge sources |
| `memory_config` | MemoryConfig | Memory backend choice + config |
| `version` | int | Auto-increments on publish |
| `test_sessions` | TestSession[] | Evaluation history |

---

## Cluster Node Architecture

n8n's cluster node model is adopted directly. This is the most significant architectural change from the original Make-biased skeleton.

```
┌─────────────────────────────────────────────────┐
│                  Agent (root)                   │
│                                                 │
│  [llm port]        [memory port]                │
│      │                  │                       │
│  ┌───▼───┐         ┌────▼────┐                  │
│  │OpenAI │         │ Buffer  │                  │
│  │  LLM  │         │ Window  │                  │
│  └───────┘         └─────────┘                  │
│                                                 │
│  [tools port]      [retriever port]             │
│      │                  │                       │
│  ┌───▼──────────┐  ┌────▼────────────┐          │
│  │ Workflow Tool│  │ Vector Store    │          │
│  ├──────────────┤  │   Retriever     │          │
│  │   Code Tool  │  └─────────────────┘          │
│  ├──────────────┤                               │
│  │   MCP Tool   │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

**Connector slot types:**
- `llm` — LLM provider sub-node (required)
- `memory` — Memory backend sub-node (optional)
- `tools` — Tool sub-nodes (0–N, multi-attach)
- `retriever` — Vector store retriever sub-node (optional, for RAG)
- `embeddings` — Embeddings sub-node (used by retriever and vector store nodes)

**Sub-nodes are not sequential.** They attach to a root node via their typed slot. The root node orchestrates them at runtime.

---

## Agent Node (Root)

**Mode:** Tools Agent (single mode, tool-calling interface)

The old Conversational, ReAct, and Plan+Execute modes are **not implemented**. n8n removed them post-Feb 2025 for good reason: tool-calling is more reliable than JSON parsing for action selection.

**Node settings (inspector):**
- System Prompt (text area, supports `{{ }}` expressions)
- Response Format (text / JSON / structured schema)
- Max Iterations (default: 10, prevents infinite loops)
- Require Specific Output Format (toggle)
- Human Message (optional override for this invocation)

**Runtime behavior:**
1. Agent receives input items
2. LLM reasons about what tool to call next
3. If tool has `require_approval: true` → pause → Human Inbox
4. Else → call tool → get result → feed back to LLM
5. Repeat until done or max iterations reached
6. Return final output as items

---

## Tool Inventory

Tools are the agent's actions. They are typed and prioritized by implementation phase.

### Tool Types

| Type | How it works | n8n equivalent | Phase |
|------|-------------|----------------|-------|
| **Workflow Tool** | Calls another FlowHolt workflow as a tool. Typed I/O schema. | Call Workflow node as tool | v1 |
| **Code Tool** | Runs a JavaScript function. AI sees the function signature and docstring. | Code node tool | v1 |
| **HTTP Tool** | Makes an HTTP request. AI provides URL params, body, headers. | HTTP Request node tool | v1 |
| **MCP Client Tool** | Calls an external MCP server. AI sees the MCP tool catalog. | `@n8n/n8n-nodes-langchain.mcpClientTool` | v2 |
| **AI Agent Tool** | Calls another agent as a sub-agent. Supports recursive agent nesting. | `@n8n/n8n-nodes-langchain.agentTool` | v2 |
| **App Module Tool** | Calls a specific integration action (e.g., "Create Notion page"). | n8n app nodes as tools | v2 |

### $fromAI() Expression

In any tool parameter field, the expression `{{$fromAI("param_name", "description", "type")}}` signals the LLM to propose a value at runtime.

Example:
```
URL: {{$fromAI("url", "The URL to fetch", "string")}}
Body: {{$fromAI("body", "The JSON request body", "json")}}
```

The inspector shows an "AI-proposed" badge on fields using `$fromAI()`. The human reviewer sees AI's proposed values during HITL approval.

### Per-Tool HITL Configuration

Each tool has an optional human-in-the-loop setting:

```
require_approval: true | false
approval_channel: "inbox" | "slack" | "teams" | "email"
timeout_minutes: 60  ← if no approval, continue | fail | escalate
```

When `require_approval: true`:
- Agent proposes tool call → execution pauses
- Human Inbox shows: tool name, AI-proposed parameters, agent reasoning (if raw reasoning visible)
- Reviewer approves (optionally edits parameters) or rejects
- On rejection: agent receives rejection + optional reason, tries another approach

---

## Memory System

### Phase 1: Buffer Window Memory (v1)

Simple rolling window of last N messages. No external dependency.

```
Memory config:
  type: "buffer_window"
  window_size: 10          ← last 10 messages
  session_key: "{{$execution.id}}"  ← per-execution by default
```

### Phase 2: Postgres Memory (v2)

Persistent across executions. Reuses existing Postgres. Good for long-running agent relationships.

```
Memory config:
  type: "postgres"
  session_key: "{{$json.user_id}}"  ← per-user sessions
  max_entries: 100
  ttl_days: 30
```

### Phase 3: Redis Memory + Zep (v3)

For high-throughput scenarios and managed memory-as-a-service.

### Chat Memory Manager Node

A standalone utility node for **direct programmatic memory management**, distinct from memory sub-nodes.

Raw source: `research/n8n-docs-export/pages_markdown/integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_memorymanager.md`

**Why this node exists:** Memory sub-nodes (Buffer Window, Postgres) attach to Agent and manage memory automatically. The Chat Memory Manager lets you manage memory explicitly in the workflow body — before, after, or between agent calls.

**3 operation modes:**

| Operation | Sub-options | Use case |
|-----------|------------|---------|
| **Get Many Messages** | Simplify Output toggle | Read current memory state (audit, display, debug) |
| **Insert Messages** | Insert alongside / Override all | Inject system context, add synthetic history, reset with controlled state |
| **Delete Messages** | Last N / All Messages | Trim memory to reduce tokens, clear between sessions |

**Message types for Insert:**
- `AI` — message attributed to the AI assistant
- `System` — instructions/context for the AI (not visible to user in chat)
- `User` — message attributed to the human user

**Key parameter:** `Hide Message in Chat` — when inserting messages, toggle whether the inserted message appears in the chat UI. Essential for injecting system context without polluting the visible conversation.

**Critical sub-node behavior (applies to ALL sub-nodes including this one):**
> When using expressions in sub-nodes, the expression ALWAYS resolves to the FIRST item of the input. This is different from regular nodes where expressions resolve per-item. This affects how you use `{{$json.something}}` in sub-node parameters.

**FlowHolt use cases:**
1. Before calling Agent: inject user profile data as a System message ("User is premium tier, language: Spanish")
2. After calling Agent: trim memory to last 5 exchanges to control token costs
3. Between agent steps: clear memory to start a fresh conversation context
4. During RAG pipeline: inject retrieved documents as System messages before the agent call

---

## Output Parsers

Output parsers are sub-nodes that connect to LLM Chain (or similar root nodes) to enforce a structured output format from the LLM.

### Structured Output Parser

Raw source: `research/n8n-docs-export/pages_markdown/integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_outputparserstructured.md`

n8n source: `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/output_parser/OutputParserStructured/`

The Structured Output Parser enforces a JSON Schema on the LLM's output. The LLM is instructed to return a structured JSON object matching the schema.

**2 ways to define the schema:**

1. **Generate from JSON example:** Provide a sample JSON object. The parser infers types from property names and values. All fields become mandatory.
   ```json
   {
     "sentiment": "positive",
     "confidence": 0.95,
     "keywords": ["fast", "reliable"],
     "summary": "..."
   }
   ```
   → Auto-generates: `{sentiment: string, confidence: number, keywords: string[], summary: string}`

2. **Define using JSON Schema:** Manual JSON Schema definition for full control.
   ```json
   {
     "$schema": "https://json-schema.org/draft/2020-12/schema",
     "type": "object",
     "properties": {
       "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
       "confidence": {"type": "number", "minimum": 0, "maximum": 1},
       "keywords": {"type": "array", "items": {"type": "string"}}
     },
     "required": ["sentiment", "confidence"]
   }
   ```
   **Important:** `$ref` references in JSON Schema are NOT supported.

**Sub-node expression behavior (critical):** When using expressions in parameters, expressions ALWAYS resolve to the first input item. Design workflows accordingly.

**FlowHolt use cases:**
- Extract structured data from free-text LLM output (e.g., sentiment + topics from customer email)
- Enforce return format for LLM Chain nodes that feed downstream data processing
- Classification tasks requiring specific enum outputs
- Data extraction tasks requiring typed, nullable fields

### Auto-fixing Output Parser

Raw source: `research/n8n-docs-export/pages_markdown/integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_outputparserautofixing.md`

Wraps another output parser (like Structured Output Parser). If the LLM returns invalid output, this parser asks the LLM to fix it automatically (one retry).

### Item List Output Parser

Raw source: `research/n8n-docs-export/pages_markdown/integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_outputparseritemlist.md`

Parses comma-separated text output from LLM into a list of separate items.

---

## RAG Pipeline

Full retrieval-augmented generation support via cluster nodes:

```
Trigger → Document Loader → Text Splitter → Embeddings → PGVector Store
                                                              │
                                             ┌───────────────▼──────────────┐
                                             │ Vector Store Retriever        │
                                             │  (sub-node of Agent)          │
                                             └───────────────────────────────┘
```

**Document Loader:** Loads from file upload, URL, or database. Outputs Document items `{pageContent, metadata}`.

**Text Splitter:** Recursive Character Splitter (recommended by n8n research — best general-purpose). Chunk size 1000, overlap 200 as defaults.

**Embeddings:** OpenAI text-embedding-3-small (default), or configured provider.

**PGVector Store:** Default vector store. Reuses Postgres. No additional infrastructure needed.

**Retriever sub-node:** Attaches to Agent's `retriever` port. At runtime, converts user query to embedding, queries PGVector, returns top-K chunks. Token-saving: use Q&A Chain mode to avoid passing raw chunks to LLM.

---

## MCP Integration

### Outbound (FlowHolt as MCP Server)

Every published workflow with `mcp_enabled: true` appears as a callable MCP tool. External systems (Claude Desktop, Claude Code, other AI assistants) can call FlowHolt workflows via MCP protocol.

Setup: Connections → MCP Server → copy endpoint URL + API key.

### Inbound (FlowHolt Agents as MCP Clients)

MCP Client Tool sub-node lets agents call external MCP servers.

```
MCP Client Tool config:
  server_url: "https://mcp.example.com"
  api_key: "{{$credentials.mcp_server_key}}"
```

Agent sees the MCP server's tool catalog and can call any registered tool.

**Vault:** see [[wiki/concepts/ai-agents]] § MCP Bidirectionality  
**Open decision #18 resolved:** MCP management lives at Connections → External MCP Servers

---

## Agent Inventory Page

Location: left nav → **Agents** (between Workflows and Assets)

| Column | Value |
|--------|-------|
| Name | Agent name + description |
| Status | Draft / Active / Archived |
| Scope | Workspace / Team |
| Provider | LLM provider icon + model name |
| Tools | Count + tool type icons |
| Knowledge | Collection count |
| Last tested | Relative timestamp |
| Actions | Test / Edit / Duplicate / Archive |

Filters: Status / Scope / Provider / Created by  
Search: name or description  
View toggle: Table / Cards

---

## Agent Detail Page

### Tab: Overview

- Description, scope, environments where active
- Linked workflows (workflows that use this agent as a node)
- Version history (publish history with diff)

### Tab: Configure

- System prompt (rich text editor, `{{ }}` expression support)
- Response format
- Model policy (provider, model, temperature, max tokens, fallback)
- Runtime controls (max iterations, timeout, raw reasoning visibility)

### Tab: Tools

- Tool list with enable/disable toggles
- Per-tool HITL settings
- Add tool (Workflow / Code / HTTP / MCP / App Module)
- Reorder tools (LLM sees them in order)

### Tab: Knowledge

- Knowledge collections attached
- Add collection button
- Per-collection: name, source type (file/URL/DB), chunk count, last indexed, re-index action

### Tab: Test

- Chat interface (interactive test)
- Test datasets (upload CSV with input/expected output pairs)
- Evaluation runs (run against dataset, see pass/fail metrics)
- Tool trace visibility (see each tool call + result)
- Test session history

### Tab: Permissions

- Who can edit this agent
- Who can publish to production
- Who can view test sessions
- Who can invoke in production workflows

---

## Studio Integration

Inside Studio canvas, the Agent cluster is a specialized node type.

**Canvas visual:**
- Agent root node: larger card with connector slots visually indicated
- Sub-nodes attach visually below/beside the root with colored connector lines
- Sub-node colors by type: tools (purple), memory (blue), retriever (green), LLM (orange)

**Inspector when Agent root is selected:**
- Top: name, linked agent (if using saved agent entity) or inline config
- System Prompt field (with `{{ }}` expression support)
- Response Format
- Sub-node attachment panel (add/remove Memory, Tools, Retriever sub-nodes inline)

**Inspector when sub-node is selected:**
- Sub-node configuration
- Connected root agent shown as breadcrumb

**Runtime view:**
- Agent reasoning trace visible inline (if raw reasoning enabled)
- Each tool call shown as a step with tool name + result
- HITL pause state shown on canvas with orange "Waiting for approval" badge

---

## Permissions

| Action | Required capability |
|--------|-------------------|
| View agents inventory | `agent:read` |
| Create agent | `agent:create` |
| Edit agent (instructions, tools) | `agent:update` |
| Attach/detach knowledge | `agent:update` + `knowledge:read` |
| Test agent interactively | `agent:test` |
| Publish agent to production | `agent:publish` |
| View production test traces | `execution:read` + `agent:read` |
| Delete agent | `agent:delete` |
| Manage MCP connections | `connection:update` |

---

## Phased Implementation

### Phase 1 — Core Agent Loop

- Agent node with LLM sub-node (OpenAI only)
- Buffer Window Memory sub-node
- Workflow Tool + Code Tool + HTTP Tool sub-nodes
- Basic HITL (pause → Human Inbox → approve/reject)
- Agent inventory page (list only)
- Agent detail: Configure + Test tabs

### Phase 2 — Knowledge and Memory

- RAG pipeline: Document Loader, Text Splitter, Embeddings, PGVector Store, Retriever
- Postgres Memory sub-node
- Agent detail: Knowledge tab
- Evaluation framework (dataset upload + pass/fail metrics)

### Phase 3 — MCP and Advanced

- MCP Client Tool sub-node
- MCP Server endpoint (expose FlowHolt workflows)
- Sub-agent (AI Agent Tool)
- App Module Tools (any integration as an agent tool)
- Redis Memory + Zep integration
- Multi-provider support (Anthropic, Gemini, local Ollama)

---

## Open Decisions Resolved by This Spec

| # | Decision | Resolution |
|---|---------|-----------|
| 10 | Agent tool type phasing | Phase 1: Workflow/Code/HTTP. Phase 2: RAG. Phase 3: MCP/Sub-agent/App. |
| 13 | Memory node persistence in v1 | Buffer Window only |
| 14 | Tool call policy UI | Per-tool HITL toggle in Tools tab + inspector sub-node config |
| 15 | Raw reasoning visibility | Default off, toggle per-agent in Configure tab |
| 16 | Agent inventory location | Left nav, between Workflows and Assets |
| 17 | Agent testing surface | Test tab within Agent detail page |
| 18 | MCP management location | Connections → External MCP Servers |
| 19 | Subscenario equivalent | Workflow Tool sub-node, quota-free |

---

## Related Files

- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` — knowledge system detail
- `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` — n8n domain 1 decisions
- `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` — $fromAI() expression
- `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` — MCP connections
- [[wiki/concepts/ai-agents]] — vault synthesis
- [[wiki/data/node-type-inventory]] — MCP node types
