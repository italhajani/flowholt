---
title: AI Agents
type: concept
tags: [ai-agents, rag, knowledge, tools, mcp, dual-nature, n8n, chain, memory, cluster-nodes, evaluation, streaming]
sources: [plan-file-05, plan-file-37, n8n-docs, n8n-domain-1-deep-read]
updated: 2026-04-16
---

# AI Agents

FlowHolt AI agents have a **dual nature**: they exist both as managed product objects (inventory, versioned, tested) AND as runtime authoring components inside the Studio canvas.

---

## Dual Nature

```
Agent Inventory (managed entity)          Studio Canvas (runtime node)
├── Name, description                      ├── ai_agent node type
├── System prompt                          ├── managed_agent_id → links to inventory
├── Model / provider config                ├── Can override: model, prompt, tools
├── Tool bindings (3 types)                ├── Inspector: 5 section groups
├── Knowledge / RAG config                 ├── Memory config
├── Version history                        └── Test tab with tool trace
├── Plan-based quotas
└── Testing surface
```

A `managed_agent_id` on the `ai_agent` node config links the two. Node config inherits from the managed entity with override rules.

---

## 3 Tool Types

| Type | Description |
|------|-------------|
| **Module tools** | A single node type called as a function |
| **Workflow tools** | A complete workflow with typed inputs/outputs |
| **MCP tools** | Connected via MCP server (external toolboxes) |

---

## Knowledge / RAG System

```
File upload
    → Chunking (configurable: size, overlap, strategy)
    → Embedding (model configurable per agent)
    → Vector store (per-agent, plan-gated quotas)
    → Retrieval at run time
```

**Plan-based quotas:**
- Free: 5 files per agent
- Pro: 10 files per agent
- Teams: 20 files per agent
- Enterprise: unlimited (custom)

---

## Studio Inspector for AI Agent Nodes (5 Section Groups)

1. **Prompt & Instructions** — system prompt, persona, output format
2. **Model & Provider** — model selector, temperature, max tokens, timeout
3. **Tools & Capabilities** — tool bindings, tool call policy
4. **Memory** — memory type (buffer/entity/summary/vector), TTL
5. **Cluster** — sub-agent linking, orchestration mode

---

## AI Trace (Test Tab)

Three visibility tiers:
- **Result** — final agent output (always visible)
- **Trace summary** — tool calls, reasoning steps (visible to builder+)
- **Raw reasoning** — full chain-of-thought (hidden when `data_is_confidential: true`)

---

## n8n Deep Research — AI Agents & Cluster Nodes

> Full deep read of n8n Domain 1 (~30 pages) completed 2026-04-16.

### Cluster Node Architecture

n8n implements a **Cluster Node** model: groups of **root nodes** and **sub-nodes** that work together as composable units. This replaces linear piping with typed connector slots.

**Root Nodes** — entry points / processing cores:
- Agent node (single unified agent with operation modes)
- Chain nodes (LLM Chain, Q&A Chain, Summarization Chain)
- Vector Store nodes (Pinecone, PGVector, Simple, Supabase, Qdrant, Chroma)
- Specialized: Information Extractor, Sentiment Analysis, Text Classifier

**Sub-Nodes** — extend root node capabilities via typed connectors:
- Memory sub-nodes (Simple, Redis, Postgres, Zep, Memory Manager)
- Tool sub-nodes (Workflow, Code, HTTP, MCP Client, AI Agent, Vector Store)
- Retriever sub-nodes (Vector Store Retriever, Contextual Compression, MultiQuery)
- Embedding sub-nodes (OpenAI, Cohere, HuggingFace, Mistral, Ollama, Google, etc.)
- Text Splitter sub-nodes (Character, Recursive Character, Token)
- Output Parser sub-nodes (Structured, Auto-Fix)
- Document Loader sub-nodes (Default, GitHub)

**Connector types** (typed, not sequential piping):
- `tools` — tool sub-nodes attach here; agent calls them at runtime
- `memory` — memory sub-node provides conversation history
- `retriever` — retriever sub-node for Q&A chain
- `llm` — language model sub-node (all root nodes need one)
- `vectorStore` — vector store for retrieval operations
- `embeddings` — embedding model

**Critical design constraint:** Expressions in sub-nodes always resolve to the **first item only**, not each item in a batch. This differs from standard n8n node behavior and affects how data flows into sub-node parameters.

**FlowHolt implication:** The "cluster" concept maps to FlowHolt's AI agent node having typed attachment slots rather than standard data ports. FlowHolt should adopt this connector-type model for composable AI components.

---

### Agent Types (Post-Feb 2025)

n8n **unified all agent types into one Agent node** with operation modes. Legacy types (Conversational, ReAct, Plan+Execute) removed February 2025.

**Current standard: Tools Agent**
- LLM describes available tools to the model via schemas
- Model selects and calls tools directly (tool-calling interface, not JSON parsing)
- More accurate, more reliable than older JSON-based agents
- Supports streaming (via Chat Trigger or Webhook)
- Max iterations: configurable (default 10 — prevents runaway loops)
- Returns intermediate steps: configurable
- Image support: binary image passthrough
- **Required**: Tool-calling capable LLMs only (OpenAI, Anthropic, Groq, Mistral, Azure OpenAI)

**FlowHolt implication:** FlowHolt's Agent/Chain distinction maps to two node modes:
- `autonomous` (agent-style: memory + tool loop, multi-pass execution)
- `pipeline` (chain-style: stateless single pass, no memory)

Single node type with mode switch is the right design. Do not offer multiple separate agent node types.

---

### Chains vs Agents

| | Agent | Chain |
|--|-------|-------|
| Decision making | LLM decides which tools to call | Predetermined sequence |
| Memory | ✅ Supports memory sub-nodes | ❌ Stateless — no memory |
| Tools | ✅ Can call tools dynamically | ❌ No tools |
| Multi-pass | ✅ Loops until task complete | ❌ Single pass |
| Use when | Conversational AI, multi-step tasks | Structured pipelines, one-shot LLM calls |

**n8n chain types:**
1. **LLM Chain** — simple prompt → LLM → output. Supports image inputs, output parsers.
2. **Q&A Chain (Retrieval QA)** — query → retriever → LLM → answer. Needs vector store.
3. **Summarization Chain** — strategies: Map-Reduce (recommended), Refine, Stuff.

**Specialized root nodes (task-specific chains):**
- **Information Extractor** — structured JSON extraction. Schema modes: attribute descriptions, JSON example, or JSON Schema input.
- **Sentiment Analysis** — customizable categories (not locked to Pos/Neutral/Neg). Temperature=0 recommended.
- **Text Classifier** — single or multi-class. Outputs unmatched items to "Other" branch or discards.

---

### Memory System

**Constraint: only agents have memory. Chains are stateless.**

| Memory Type | Storage | Persistence | Queue-mode safe |
|-------------|---------|-------------|-----------------|
| Simple Memory (Buffer Window) | In-process | Session only — dies on restart | ❌ No |
| Redis Chat Memory | Redis | Cross-session | ✅ Yes |
| Postgres Chat Memory | PostgreSQL | Cross-session | ✅ Yes |
| Zep | External service | Semantic + long-term | ✅ Yes |
| Chat Memory Manager | Wrapper | N/A (manipulates backends) | Depends on backend |

**Session key** — namespaces memory within workflow data. Supports per-user isolation.

**Chat Memory Manager** enables advanced memory operations:
- Load, insert, delete individual messages
- Inject synthetic context (seed memory with system instructions disguised as user messages)
- Batch operations: trim, summarize, filter
- Essential for multi-agent scenarios where memory needs manipulation

**FlowHolt implication:**
- Simple memory = dev-only (never recommend for production)
- Default production memory = Postgres (already available in FlowHolt's data layer)
- Chat Memory Manager equivalent should exist as a utility operation node
- Memory type selectable per agent in inspector section 4

---

### Tool Architecture

**5 built-in tool sub-node types:**

| Tool type | What it does | FlowHolt equivalent |
|-----------|-------------|---------------------|
| **Call n8n Workflow Tool** | Embed entire workflow as a tool. Typed inputs via `$fromAI()` | Workflow tools |
| **AI Agent Tool** | Nest another agent as a tool (multi-tier orchestration) | Sub-agent / orchestrator |
| **Custom Code Tool** | JavaScript or Python executed in sandbox. Query via `query` variable | Custom function tools |
| **MCP Client Tool** | Connect to external MCP server. Selective tool exposure | MCP tools |
| **HTTP Request Tool** | Direct API call as tool (legacy; use HTTP Request node in modern flows) | API/HTTP tools |

**Plus:** 100+ n8n app nodes can be used directly as tools (Gmail, Slack, Airtable, Salesforce, etc.)

**Pre-built LangChain tools:** Calculator, SerpAPI, Wikipedia, Wolfram Alpha, Think Tool

**$fromAI() function** — LLM dynamically specifies tool parameter values at runtime:
```
$fromAI("parameter_name", "description for the model", "expected_type")
```
- Works alongside static values in the same tool call
- Reviewer sees AI-proposed values during HITL approval
- **FlowHolt equivalent:** `{{$fromAI("field_name", "description", "type")}}` in tool parameter fields

**Tool call flow:**
1. Agent receives tool descriptions (schemas)
2. Agent decides tool + parameters
3. (Optional) HITL review gate → pause + approval request sent to channel
4. Tool executes; result returned to agent
5. Agent continues reasoning or returns final answer

**Batch processing:** Rate limiting in AI Agent Tool (tool-as-sub-agent) via batch size + delay — prevents hitting API rate limits.

---

### Human-in-the-Loop Tool Approval

n8n supports **per-tool approval gates** — pause before specific tool executes:

1. Workflow pauses after agent selects tool but before execution
2. Approval request sent to configured channel with: tool name, AI-proposed parameters
3. Reviewer approves → tool executes; denies → agent informed, must handle gracefully
4. Audit trail: all decisions logged

**Approval channels:** n8n Chat, Slack, Discord, Telegram, Teams, Gmail, WhatsApp, Google Chat, Outlook

**`$tool` variable in approval messages:**
- `$tool.name` — tool node name
- `$tool.parameters` — dynamically proposed values

**FlowHolt implication:** The human inbox (already designed in plan files) must support **per-tool approval**, not just workflow-level pausing. An agent should be able to tag specific tools as requiring human approval. This is a significant capability gap to design into the HITL system.

---

### RAG Pipeline (Full Detail)

**Data insertion pipeline:**
```
Source data (files, URLs, DBs)
    → Document Loader
    → Text Splitter:
        - Character (fixed-size, simple)
        - Recursive Character (Markdown/HTML/code-aware) ← recommended
        - Token (token-count based, precise cost control)
    → Embedding Model (OpenAI, Cohere, HuggingFace, Mistral, Ollama, Google, AWS)
    → Vector Store (Pinecone, PGVector, Qdrant, Supabase, Chroma, Simple)
```

**Query pipeline:**
```
Query
    → Embedding
    → Vector Search (similarity ranking)
    → (Optional) Reranking (secondary model — improves precision)
    → Retrieved chunks → LLM context
```

**Retriever types:**
- **Vector Store Retriever** — direct similarity search
- **Contextual Compression Retriever** — filter results via secondary model
- **MultiQuery Retriever** — expand query semantically before search

**Vector store choice:**
- Simple Vector Store: Dev-only. 100MB limit, 7-day TTL on Cloud. Global key scope (all users share). Never use in production.
- PGVector: Best for FlowHolt (reuse existing Postgres infra)
- Pinecone / Qdrant / Supabase: Cloud-native alternatives

**RAG best practices (from n8n docs):**
- Chunk size: 200-500 tokens for fine-grained retrieval
- Overlap: Important for semantic continuity at chunk boundaries
- Token-saving pattern: Use "Vector Store Q&A Tool" → agent only gets the answer, not raw chunks (avoids sending all retrieved content to expensive LLM)
- Add document source/title metadata to chunks for better retrieval attribution

**FlowHolt implication:**
- PGVector is the right default (zero additional infrastructure)
- Expose splitter strategy selection in the agent's knowledge config
- Add a token budget guard in the agent inspector — show how many tokens retrieved context consumes

---

### MCP Integration (Bidirectional)

**n8n as MCP Server** (workflows exposed to external clients):
- External MCP clients (Claude Desktop, Claude Code, Lovable, Google ADK) can discover and call n8n workflows
- Authentication: OAuth2 or Bearer token
- Workflows must be explicitly enabled for MCP visibility (not blanket instance access)

**MCP tools exposed:**
- `search_workflows`, `get_workflow_details`, `execute_workflow` — workflow management
- `get_node_types`, `get_suggested_nodes`, `validate_workflow`, `create_workflow_from_code` — workflow building
- `search_data_tables`, data table CRUD — data operations

**n8n as MCP Client** (agent calls external MCP servers):
- **MCP Client Tool** sub-node attaches to agent
- Connects to external MCP server via SSE endpoint
- Supports bearer, header, OAuth2 auth
- Selective tool exposure: all / selected / all-except

**FlowHolt implication:**
- FlowHolt should expose its own workflows as MCP tools (allowing Claude Code, external agents to call them)
- FlowHolt agents should be able to connect to external MCP servers as tool sources
- This bi-directional MCP design is a major competitive feature vs Make.com (which has no MCP support)

---

### Chat Hub / Chat Trigger

**Chat Hub** — centralized AI chat interface:
- Role: Chat User (non-admin, read-only access, interact with agents only)
- Personal Agents: simple, system-prompt based
- Workflow Agents: complex trigger-based flows
- Multi-model + multi-agent selection in single interface
- Admin controls which models/providers are available to users

**Chat Trigger node** — entry point for chat in workflows:
- Custom branded chat widget available (npm: `@n8n/chat`)
- Requirements for Chat Hub: Chat Trigger + streaming Agent + activated workflow
- Streaming enabled by default on Agent nodes
- Workflow sharing via projects → collaborators get Chat Hub access

**FlowHolt implication:**
- Public-facing chat interface (`/chat/[workflow_id]`) already exists in FlowHolt's route design
- Should add "Chat User" role separate from Builder — read-only + interact-only access
- Streaming (SSE) is already implemented in FlowHolt's Chat Panel

---

### AI Workflow Builder

n8n's LLM-assisted workflow generation:
- Natural language → workflow JSON (nodes + connections + config)
- Credits-based pricing (1 credit per message)
- Data sent to LLM: prompts, node definitions, current workflow, mock execution data
- **NOT sent:** credential details, execution history
- Credentials auto-assigned from stored credentials

**Privacy boundary (applies to FlowHolt too):** Never send credential values to an external LLM when building workflows via AI.

---

### Evaluation Framework

**Two modes:**

| Mode | When | Dataset size | Expected outputs | Goal |
|------|------|-------------|-----------------|------|
| **Light Evaluation** | Development | Small (AI-generated samples OK) | Optional | Fast iteration |
| **Metric-Based Evaluation** | Production / post-deploy | Large (prod runs + edge cases) | Required | Regression testing |

**Evaluation workflow:**
1. Build test dataset (input + expected output pairs)
2. Run agent workflow over dataset
3. Measure outputs vs expected (custom metrics or BLEU/similarity)
4. Compare runs (A/B: different prompts, models, tool sets)
5. Iterate

**Key principle:** LLM outputs are non-deterministic → measurement is how you verify quality, not reasoning about the code.

**FlowHolt implication:** The "Test tab" in agent inspector should surface this evaluation model. A/B comparison between agent versions maps to FlowHolt's version history feature.

---

### LangChain Concept Mapping

n8n implements LangChain JavaScript (not Python). Mapping:

| LangChain Concept | n8n Node | Notes |
|---|---|---|
| Chat Model | LM Chat sub-nodes | Required for all agents/chains |
| Agent | Agent root node | Tools Agent is current standard |
| Tool | Tool sub-nodes | 100+ integrations available |
| Memory | Memory sub-nodes | Agents only, not chains |
| Chain | Chain root nodes | Stateless |
| Vector Store | Vector Store root nodes | Multiple backends |
| Retriever | Retriever sub-nodes | Plugs into Q&A chain |
| Embedding | Embedding sub-nodes | Needed for vector operations |
| Text Splitter | Text Splitter sub-nodes | Prepares data for insertion |
| Document Loader | Document Loader sub-nodes | External data ingestion |
| Output Parser | Output Parser sub-nodes | Formats LLM output; has auto-fix variant |

---

## Key Design Signals Summary

### MUST ADOPT in FlowHolt
1. **Cluster Node Architecture** — root + sub-nodes with typed connector slots (tools, memory, retriever, llm)
2. **Tools-First Agent Pattern** — tool-calling interface (not JSON parsing); single unified Agent node
3. **Composable Memory** — pluggable backends; agent-exclusive; Simple=dev only; Postgres=production default
4. **Streaming-First UX** — real-time agent responses via SSE (already in FlowHolt's ChatPanel)
5. **Per-Tool HITL Gates** — human inbox must support per-tool approval, not just workflow-level pausing
6. **$fromAI() equivalent** — `{{$fromAI(...)}}` syntax for AI-proposed tool parameters
7. **Vector Store Agnostic** — PGVector as default + pluggable backends (Pinecone, Qdrant)
8. **Multi-Agent Orchestration** — primary agent + specialist agents via AI Agent Tool sub-node
9. **Evaluation Framework** — test dataset → metrics → A/B comparison integrated into agent inspector

### SHOULD ADAPT
1. MCP Bidirectionality — expose FlowHolt workflows as MCP tools + allow agents to call external MCP servers
2. Chat User role — interact-only role for non-builders
3. Provider abstraction — LLM selection decoupled from agent logic; configurable per workspace

### SKIP
1. ~~Conversational/ReAct/Plan+Execute agent types~~ — single Tools Agent is the standard
2. ~~In-memory Simple Memory for production~~ — Postgres backend is production-safe
3. ~~Chains with memory~~ — agents handle stateful logic; chains are stateless pipelines

---

## Related Pages

- [[wiki/concepts/studio-anatomy]] — AI agent node inspector design
- [[wiki/concepts/execution-model]] — how agent runs execute
- [[wiki/concepts/connections-integrations]] — MCP tool connections
- [[wiki/concepts/sub-workflows]] — workflow-as-tool pattern
- [[wiki/concepts/runtime-operations]] — human inbox for approval gates
- [[wiki/concepts/data-store-functions]] — data stores as agent memory backends
- [[wiki/concepts/expression-language]] — `$fromAI()` syntax for AI-proposed parameters
- [[wiki/concepts/permissions-governance]] — per-tool approval gates and agent access control
- [[wiki/entities/n8n]] — n8n's agent/chain/memory/tool node model
- [[wiki/sources/flowholt-plans]] — plan files 05, 37
- [[wiki/data/node-type-inventory]] — full node type catalog
