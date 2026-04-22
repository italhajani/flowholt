# FlowHolt AI Agent Managed Entity, Knowledge System, And Testing Surface

This file turns the AI agents skeleton (`05-FLOWHOLT-AI-AGENTS-SKELETON.md`) into a concrete entity model with CRUD operations, knowledge/RAG system, testing surface, and MCP client planning.

It is grounded in:
- `src/lib/agent-inventory.ts` — current `AgentEntry`, `AgentOperationalStatus`, `buildAgentEntries`, `buildStarterAgentWorkflow`
- `backend/app/node_registry.py` — `ai_agent`, `ai_chat_model`, `ai_memory`, `ai_tool`, `ai_output_parser` definitions
- `src/components/studio/NodeConfigPanel.tsx` — `CLUSTER_ATTACHMENT_SLOTS`, cluster rendering
- Make corpus: `research/make-help-center-export/pages_markdown/manage-ai-agents.md`, `research/make-help-center-export/pages_markdown/ai-agents-configuration.md`, `research/make-help-center-export/pages_markdown/tools-for-ai-agents.md`
- Make corpus (PDF full): Make AI Agents (New) app reference, Knowledge system, MCP toolboxes, Scenario inputs/outputs, Subscenarios, Best practices, Billing/Credits, Error handling (5 handlers), Incomplete executions (auto-retry/backoff), Scenario execution model (phases/cycles/ACID), Scenario settings, Variables (system/scenario/custom/incremental), Webhooks (queues/rate-limits), Data stores & structures, Module types (triggers/searches/actions/tools), Data security (AES/PGP/hashing)
- `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` — agent inspector section groupings
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — team/workspace ownership model
- **Make editor UI crawl** (2026-04-14): `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — AI module packages, agent API endpoints, AI copilot button, toolbar AI features

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §1 Dual nature | `research/make-help-center-export/pages_markdown/manage-ai-agents.md` | Make's agent as standalone entity with ID |
| §2 Managed entity | `research/make-help-center-export/pages_markdown/ai-agents-configuration.md` | Agent config: model, instructions, temperature |
| §3 Tools | `research/make-help-center-export/pages_markdown/tools-for-ai-agents.md` | Tool types: Scenario, Custom function, Native |
| §3 Tools | `research/make-help-center-export/pages_markdown/mcp-toolboxes.md` | MCP toolbox integration |
| §4 Knowledge/RAG | `research/make-help-center-export/pages_markdown/knowledge-bases.md` | Knowledge base upload, chunking |
| §5 HITL | `research/n8n-docs-export/pages_markdown/advanced-ai/examples-and-tutorials/human-in-the-loop.md` | Per-tool HITL gate in n8n |
| §6 Memory | `research/n8n-docs-export/pages_markdown/advanced-ai/memory/` | Buffer Window, Postgres, Redis, Zep |
| §7 RAG pipeline | `research/n8n-docs-export/pages_markdown/advanced-ai/rag-in-n8n.md` | Full RAG pipeline: Loader→Splitter→Embed→VectorStore |
| §8 Evaluation | `research/n8n-docs-export/pages_markdown/advanced-ai/evaluation/` | Test datasets, metric-based eval |
| §9 MCP | `research/n8n-docs-export/pages_markdown/advanced-ai/mcp/` | MCP client + MCP server trigger |
| §All | `research/make-advanced/*/network-log*.json` | Make AI agent API endpoints discovered in crawl |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Agent root node | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/agent/Agent.node.ts` |
| Tools Agent executor | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/agent/agents/ToolsAgent/` |
| $fromAI() | `n8n-master/packages/core/src/execution-engine/node-execution-context/execute-single-context.ts` |
| Buffer Window Memory | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/memory/MemoryBufferWindow/` |
| PGVector Store | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/vector_store/VectorStorePGVector.node.ts` |
| MCP Client Tool | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpClientTool.node.ts` |
| MCP Server Trigger | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpTrigger.node.ts` |
| Workflow Tool | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/tool/ToolWorkflow.node.ts` |
| Information Extractor | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/information_extractor/` |

### Make comparison (AI agents)

| Feature | Make | FlowHolt | Note |
|---------|------|----------|------|
| Agent as managed entity | Yes — with ID, can be reused | Yes — `ManagedAgent` entity | Parity |
| Agent tools | Scenario tools + native tools | Workflow tools + code tools + HTTP tools | FlowHolt adds code + HTTP tool types |
| Knowledge base | Upload files, basic retrieval | Full RAG pipeline (Phase 2) | FlowHolt exceeds 🏆 |
| MCP tools | Yes — MCP Toolboxes | Yes — MCP Client Tool sub-node | Parity |
| HITL | Workflow-level pause only | Per-tool HITL gate | FlowHolt exceeds 🏆 |
| Memory | No memory system | Buffer Window → Postgres → Redis (phased) | FlowHolt exceeds 🏆 |
| Agent evaluation | None | Test dataset + metric-based (Phase 3) | FlowHolt-unique 🏆 |
| Agent version history | None | Same as workflow versioning (Phase 2) | FlowHolt-unique 🏆 |

### This file feeds into

| File | What it informs |
|------|----------------|
| `05-FLOWHOLT-AI-AGENTS-SKELETON.md` | Agent cluster node architecture detail |
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | §7 AI/Cluster node status |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | §6 AI and agent objects |
| `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` | Agent ownership (workspace-scoped) |
| `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` | MCP server connections |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Domain 2 AI agents gap matrix |
| `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | Domain 1 agent decisions |

---

FlowHolt AI agents exist in two forms simultaneously:

### Form 1: Managed entity (inventory)

A standalone product object with its own identity, lifecycle, configuration, knowledge attachments, and testing history. Lives in the AI Agents inventory page. Can be referenced by multiple workflows.

### Form 2: Studio node (execution graph)

An `ai_agent` node within a workflow graph, with cluster children (`ai_chat_model`, `ai_memory`, `ai_tool`, `ai_output_parser`). Defined inline in the workflow definition. Executed as part of the workflow runtime.

### Relationship

```
ManagedAgent (inventory)
  ├── configuration source of truth
  ├── knowledge attachments (RAG)
  ├── testing surface
  └── referenced by → ai_agent node(s) in workflow(s)
        ├── inherits instructions, model, tools from managed agent
        ├── can override temperature, output format per workflow
        └── cluster children represent runtime components
```

A workflow's `ai_agent` node can be:
1. **Linked** to a managed agent — inherits configuration, knowledge, tools
2. **Inline** — self-contained configuration within the workflow (current behavior)

---

## 2. Managed agent entity

### Backend model

```python
AgentStatus = Literal["draft", "active", "archived"]

class ManagedAgentSummary(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: str
    status: AgentStatus
    provider: str                        # "openai", "anthropic", "google", "ollama"
    model: str
    tools_count: int
    knowledge_files_count: int
    linked_workflows_count: int
    last_tested_at: str | None = None
    created_by_user_id: str
    created_at: str
    updated_at: str

class ManagedAgentDetail(ManagedAgentSummary):
    # Identity and instructions
    system_prompt: str
    behavior_guidelines: str | None = None
    response_constraints: str | None = None

    # Model configuration
    credential_id: str | None = None     # vault credential for provider
    temperature: float = 0.7
    max_tokens: int | None = None
    max_steps: int = 25                  # max tool-use iterations
    max_history: int = 50                # max conversation turns retained

    # Tools
    tools: list[AgentToolReference]

    # Knowledge
    knowledge_files: list[AgentKnowledgeFile]

    # MCP connections
    mcp_connections: list[AgentMcpConnection]

    # Conversation memory
    conversation_id_mode: Literal["auto", "mapped", "none"] = "auto"
    # auto: generate unique ID per run (no memory); mapped: use mapped value (user/thread ID); none: no conversation tracking
    max_conversation_history: int = 50   # max previous replies agent remembers in a conversation

    # Runtime controls
    output_format: Literal["text", "json", "structured"] = "text"
    output_schema: dict[str, Any] | None = None   # JSON schema if structured
    step_timeout_seconds: int = 300      # max seconds per agent step (Make max: 600)
    timeout_seconds: int = 300           # overall execution timeout
    retry_on_tool_failure: bool = True
    max_tool_retries: int = 2

    # Sharing
    shared_with_team: bool = False       # if true, visible to all team members

    # Capabilities
    capabilities: AgentCapabilities
```

### Frontend interface

```typescript
interface ApiManagedAgentSummary {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  provider: string;
  model: string;
  tools_count: number;
  knowledge_files_count: number;
  linked_workflows_count: number;
  last_tested_at: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}
```

---

## 3. Agent capabilities

```python
class AgentCapabilities(BaseModel):
    view: CapabilityState
    edit: CapabilityState
    edit_instructions: CapabilityState
    attach_tools: CapabilityState
    attach_knowledge: CapabilityState
    test: CapabilityState
    duplicate: CapabilityState
    archive: CapabilityState
    delete: CapabilityState
    share_with_team: CapabilityState
    view_traces: CapabilityState          # see production reasoning traces
    view_raw_reasoning: CapabilityState   # see raw model output (confidentiality-gated)
```

### Computation rules

| Capability | Minimum role | Additional conditions |
|---|---|---|
| view | viewer | — |
| edit | builder | — |
| edit_instructions | builder | — |
| attach_tools | builder | — |
| attach_knowledge | builder | quota check: `max_ai_agent_context_files` |
| test | builder | requires valid provider credential |
| duplicate | builder | — |
| archive | builder | creator or admin |
| delete | admin | — |
| share_with_team | admin | — |
| view_traces | viewer | — |
| view_raw_reasoning | builder | denied if `data_is_confidential` on linked workflow |

---

## 4. Tool reference system

### Tool types

Following Make's three tool types, adapted for FlowHolt:

| Type | Code | Description |
|---|---|---|
| **Module tool** | `module` | A single node type exposed as a callable tool (e.g., HTTP request, code execution) |
| **Workflow tool** | `workflow` | A complete workflow with defined inputs/outputs, invoked as a tool |
| **MCP tool** | `mcp` | A tool accessed through an MCP server connection |

### Tool reference model

```python
class AgentToolReference(BaseModel):
    id: str
    tool_type: Literal["module", "workflow", "mcp"]
    name: str
    description: str
    enabled: bool = True

    # Module tool fields
    node_type: str | None = None          # e.g., "http_request", "code"
    node_config_template: dict[str, Any] | None = None

    # Workflow tool fields
    workflow_id: str | None = None
    workflow_inputs_schema: dict[str, Any] | None = None
    workflow_outputs_schema: dict[str, Any] | None = None

    # MCP tool fields
    mcp_connection_id: str | None = None
    mcp_tool_name: str | None = None
```

### Module tools

Module tools auto-scaffold a single-step execution from a node type definition. The agent describes the tool using the node's `description` field and provides the result.

Example: An HTTP request module tool allows the agent to make API calls by specifying URL, method, headers, and body.

### Workflow tools

Workflow tools require the target workflow to have:
1. A defined inputs schema (via the trigger step's expected data)
2. A defined outputs schema (via the final step's output structure)
3. `caller_policy: "allow_tools"` in workflow settings

When the agent invokes a workflow tool, a new execution is created for the target workflow with the agent-provided inputs.

### MCP tools

MCP tools require:
1. An MCP server connection (URL, auth)
2. Tool discovery from the MCP server's tool list
3. Per-tool enable/disable toggle

---

## 5. Knowledge / RAG system

### Architecture

```
File upload → Chunking → Embedding → Vector store
                                        ↓
Agent query → Embedding → Vector search → Context injection → LLM
```

### Knowledge file model

```python
class AgentKnowledgeFile(BaseModel):
    id: str
    agent_id: str
    workspace_id: str
    filename: str
    file_type: Literal["txt", "pdf", "docx", "csv", "md", "json"]
    file_size_bytes: int
    chunks_count: int
    status: Literal["processing", "ready", "failed"]
    error_message: str | None = None
    uploaded_by_user_id: str
    uploaded_at: str

class AgentKnowledgeChunk(BaseModel):
    id: str
    file_id: str
    agent_id: str
    content: str
    chunk_index: int
    token_count: int
    embedding: list[float] | None = None  # stored in vector DB, not returned in API
```

### Quota limits (from Make corpus — aligned exactly)

| Plan | Files per agent | Files per team | Files per org | Max file size |
|---|---|---|---|---|
| Free | 20 | 100 | 150 | 20 MB |
| Core | 20 | 100 | 150 | 20 MB |
| Pro | 20 | 100 | 150 | 20 MB |
| Teams | 20 | 150 | 200 | 20 MB |
| Enterprise | 20 | 250 | 500 | 20 MB |

Supported file types: TXT, PDF, DOCX, CSV, MD, JSON.

**Inactivity deletion**: Make deletes knowledge files after 180 days of inactivity (if the agent hasn't queried them). FlowHolt should implement a similar TTL or at minimum warn users about stale files.

### Chunking strategy

```python
class ChunkingConfig(BaseModel):
    strategy: Literal["fixed_size", "sentence", "paragraph", "semantic"] = "paragraph"
    chunk_size_tokens: int = 512
    chunk_overlap_tokens: int = 50
    separator: str | None = None
```

Default strategy: `paragraph` for document-like files, `fixed_size` for unstructured text.

### Embedding and vector store

Phase 1: Use the configured LLM provider's embedding API (e.g., OpenAI `text-embedding-3-small`). Store embeddings in SQLite with a simple vector similarity search (cosine distance via extension or Python computation).

Phase 2: Optional integration with dedicated vector stores (pgvector, Qdrant, ChromaDB) via a pluggable storage backend.

### Knowledge app modules (Make-grounded)

Make provides a separate "Knowledge" app with dedicated modules for managing knowledge files programmatically. FlowHolt should offer equivalent API endpoints:

| Make module | FlowHolt equivalent | Description |
|---|---|---|
| Upload knowledge file | `POST /api/agents/{id}/knowledge/file` | Upload a file from a previous download module |
| Upload knowledge text | `POST /api/agents/{id}/knowledge/text` | Turn raw text into a knowledge file |
| Update knowledge file | `PUT /api/agents/{id}/knowledge/{file_id}/file` | Replace file content (same type) |
| Update knowledge text | `PUT /api/agents/{id}/knowledge/{file_id}/text` | Replace text content (.txt, .md only) |
| Append knowledge text | `PATCH /api/agents/{id}/knowledge/{file_id}/append` | Append text to existing file (.txt, .md only) |
| Delete knowledge | `DELETE /api/agents/{id}/knowledge/{file_id}` | Delete a file |
| Get knowledge | `GET /api/agents/{id}/knowledge/{file_id}` | Get file metadata (name, description, date, ID) |
| List knowledge files | `GET /api/agents/{id}/knowledge` | List all files with ordering |
| Query knowledge | `POST /api/agents/{id}/knowledge/query` | RAG search against knowledge base |

**Two upload paths** (Make pattern):
1. **Via agent config** — for static files that rarely change (company guidelines, style guides)
2. **Via dedicated workflow** — for files that update periodically, managed in a separate automation

FlowHolt should support both: direct upload in the agent detail page, and a `Knowledge` node type in workflows for automated knowledge management.

### Retrieval at runtime

When an agent node executes:
1. Extract the user query or prompt
2. Embed the query using the agent's configured embedding model
3. Search the vector store for top-K relevant chunks (K=5 default)
4. Inject retrieved chunks as system context before the main prompt
5. Include source file references in the response metadata

---

## 6. Testing and training surface

### Location

The testing surface is accessible from:
1. **AI Agents inventory** — detail page → "Testing & Training" tab
2. **Studio** — when an `ai_agent` node is selected → Test tab (governed by file 33 rules)

### Testing chat model

```python
class AgentTestMessage(BaseModel):
    id: str
    role: Literal["user", "assistant", "system", "tool"]
    content: str
    tool_calls: list[AgentTestToolCall] | None = None
    tool_results: list[AgentTestToolResult] | None = None
    timestamp: str

class AgentTestToolCall(BaseModel):
    tool_name: str
    tool_type: str
    arguments: dict[str, Any]

class AgentTestToolResult(BaseModel):
    tool_name: str
    status: Literal["success", "failed"]
    result: Any
    duration_ms: int

class AgentTestSession(BaseModel):
    id: str
    agent_id: str
    messages: list[AgentTestMessage]
    model_used: str
    total_tokens: int
    total_tool_calls: int
    started_at: str
    ended_at: str | None = None
```

### Testing UI layout

```
┌─────────────────────────────────────────────┐
│ Agent: Customer Support Bot   [New Chat]    │
├─────────────────────────────────────────────┤
│                                             │
│  [User]: How do I reset my password?        │
│                                             │
│  [Assistant]:                               │
│  ├─ 🔧 Tool: search_knowledge_base         │
│  │   Input: {"query": "password reset"}     │
│  │   Result: Found 3 relevant chunks        │
│  ├─ 🔧 Tool: check_user_status             │
│  │   Input: {"action": "get_reset_link"}    │
│  │   Result: {"reset_url": "..."}           │
│  └─ Response:                               │
│     To reset your password, click the       │
│     "Forgot Password" link on the login...  │
│                                             │
│  [User]: Thanks, that worked!               │
│                                             │
│  [Assistant]: Great! Is there anything else  │
│  I can help with?                           │
│                                             │
├─────────────────────────────────────────────┤
│ [Type a message...]              [Send]     │
├─────────────────────────────────────────────┤
│ Tokens: 1,247 | Tools: 2 | Duration: 3.2s  │
└─────────────────────────────────────────────┘
```

### Testing features

1. **New Chat** — starts fresh conversation with empty history
2. **Tool trace visibility** — shows each tool call with input/output inline
3. **Knowledge retrieval visibility** — shows which chunks were retrieved and their source files
4. **Token counter** — running total of tokens used
5. **Duration** — per-message and total session duration
6. **Save conversation** — save test conversations for regression testing (future)
7. **Improve prompt** — AI-powered prompt improvement suggestion (matches Make's "Improve" button)

### Confidentiality gating

When `data_is_confidential` is true on a linked workflow:
- Tool trace inputs/outputs are masked to non-admin roles
- Raw model reasoning is hidden
- Only the final response text is visible

This aligns with the three-tier rendering from `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` section 9.

---

## 6b. Conversation memory and response format (Make-grounded)

### Conversation ID patterns

Make agents use a `Conversation ID` field to maintain conversation history across runs:

- **Mapped user ID** — remembers conversations per user (multi-user agents)
- **Mapped thread ID** — remembers email/chat threads (e.g., Gmail Thread ID, Telegram Chat ID)
- **Timestamp-based** — starts fresh conversations periodically to reduce token costs
- **Blank** — generates unique ID per run, no memory of previous communication

FlowHolt should support the same patterns through `conversation_id_mode`:
- `auto` — new ID per execution (stateless)
- `mapped` — user provides an expression that resolves to a conversation ID
- `none` — no conversation tracking at all

### Response format options

| Format | Description |
|---|---|
| **Text** | Returns a plain text response |
| **Data structure** | Returns structured output with defined items (Add item) or content type (Generate: JSON, XML, etc.) |

FlowHolt's `output_format` field already covers this: `text`, `json`, `structured` with an optional `output_schema`.

### Token optimization (Make best practices)

- Limit data scope: filter inputs before passing to agent, use knowledge for large reference data
- Limit conversation history: leave Conversation ID blank when memory isn't needed
- Upload large reference files as knowledge (RAG retrieval is cheaper than full context)
- Define scenario inputs/outputs to constrain data flow

---

## 7. MCP client planning

### Phase 1: MCP connection model

```python
class AgentMcpConnection(BaseModel):
    id: str
    agent_id: str
    name: str
    server_url: str
    auth_type: Literal["none", "api_key", "bearer", "oauth2"]
    credential_id: str | None = None      # vault credential for auth
    status: Literal["connected", "disconnected", "error"]
    available_tools: list[McpToolSummary]
    enabled_tools: list[str]              # tool names that are enabled
    last_sync_at: str | None = None

class McpToolSummary(BaseModel):
    name: str
    description: str
    input_schema: dict[str, Any]
    enabled: bool = False
```

### MCP discovery flow

1. User adds MCP server URL and credentials
2. Backend connects to MCP server and discovers available tools via `tools/list`
3. Tools are displayed with name, description, and enable/disable toggle
4. User selects which tools to enable for this agent
5. Enabled tools are stored in `AgentMcpConnection.enabled_tools`
6. At runtime, agent can invoke enabled MCP tools via `tools/call`

### Phase 2: Enhanced MCP

- Resource discovery (`resources/list`)
- Prompt templates from MCP servers
- Streaming tool results
- MCP server health monitoring
- Connection sharing across agents in the same workspace

### MCP toolboxes (Make-grounded)

Make introduces **MCP toolboxes** as dedicated MCP servers with curated tool sets. Key features:

- **Tool selection**: Choose specific active on-demand workflows to expose as MCP tools
- **Key-based auth**: Generate multiple keys per toolbox for sharing with different clients
- **Unique URL per toolbox**: Each toolbox gets its own MCP server URL
- **Tool annotations**: `Read only` or `Read & write` to help clients understand tool behavior
- **Custom names/descriptions**: Override default tool names and descriptions for clarity
- **Transport methods**: Streamable HTTP (recommended), SSE, Stateless
- **40-second timeout**: Toolbox scenarios must complete within 40 seconds

FlowHolt equivalent: A `WorkspaceMcpToolbox` entity allowing users to bundle selected workflows into an MCP server endpoint with key management and tool-level configuration.

```python
class WorkspaceMcpToolbox(BaseModel):
    id: str
    workspace_id: str
    name: str
    server_url: str                        # auto-generated
    tools: list[McpToolboxTool]
    keys: list[McpToolboxKey]
    created_at: str
    updated_at: str

class McpToolboxTool(BaseModel):
    workflow_id: str
    custom_name: str | None = None         # override workflow name
    custom_description: str | None = None  # override workflow description
    behavior: Literal["read_only", "read_write"] = "read_write"
    enabled: bool = True

class McpToolboxKey(BaseModel):
    id: str
    name: str
    key_hash: str                          # stored hashed, shown once on creation
    created_at: str
```

---

## 8. Agent ↔ Studio node linking

### Current state

The current `ai_agent` node is fully inline: all configuration lives in the workflow step's `config` dict. There is no reference to a managed agent entity.

### Proposed linking mechanism

Add a `managed_agent_id` field to the `ai_agent` node config:

```python
# In ai_agent node config
{
    "managed_agent_id": "agent-abc123",     # NEW — links to managed agent
    "agent_type": "tools_agent",
    "provider": "openai",                    # overridable or inherited
    "model": "gpt-4o",                       # overridable or inherited
    "system_message": "",                    # inherited from managed agent if blank
    "prompt": "{{input.message}}",           # workflow-specific
    "temperature": 0.7,                      # overridable
    "tools": [],                             # inherited from managed agent
    ...
}
```

### Resolution rules

When a linked `ai_agent` node executes:

1. Load `ManagedAgentDetail` by `managed_agent_id`
2. Merge configuration: node config overrides managed agent defaults for fields that are explicitly set
3. Tools: union of managed agent tools + inline node tools
4. Knowledge: always from managed agent (not overridable per node)
5. MCP connections: always from managed agent
6. If `managed_agent_id` is null or missing → pure inline mode (current behavior)

### Inheritance table

| Field | Managed agent | Node config | Resolution |
|---|---|---|---|
| system_prompt | ✓ | ✓ (system_message) | Node wins if non-empty, else agent |
| provider | ✓ | ✓ | Node wins if set |
| model | ✓ | ✓ | Node wins if set |
| temperature | ✓ | ✓ | Node wins if set |
| max_tokens | ✓ | ✓ | Node wins if set |
| tools | ✓ (agent tools) | ✓ (inline tools) | Union |
| knowledge | ✓ | ✗ | Agent only |
| mcp_connections | ✓ | ✗ | Agent only |
| output_format | ✓ | ✓ | Node wins if set |
| timeout | ✓ | ✓ | Node wins if set |

---

## 9. CRUD endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| List agents | GET | `/api/agents` | viewer |
| Create agent | POST | `/api/agents` | builder |
| Get agent detail | GET | `/api/agents/{agent_id}` | viewer |
| Update agent | PUT | `/api/agents/{agent_id}` | builder |
| Duplicate agent | POST | `/api/agents/{agent_id}/duplicate` | builder |
| Archive agent | POST | `/api/agents/{agent_id}/archive` | builder |
| Delete agent | DELETE | `/api/agents/{agent_id}` | admin |
| Share with team | POST | `/api/agents/{agent_id}/share` | admin |

### Knowledge endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| Upload knowledge file | POST | `/api/agents/{agent_id}/knowledge` | builder |
| List knowledge files | GET | `/api/agents/{agent_id}/knowledge` | viewer |
| Delete knowledge file | DELETE | `/api/agents/{agent_id}/knowledge/{file_id}` | builder |
| Get chunking status | GET | `/api/agents/{agent_id}/knowledge/{file_id}/status` | viewer |

### Tool endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| List agent tools | GET | `/api/agents/{agent_id}/tools` | viewer |
| Add tool | POST | `/api/agents/{agent_id}/tools` | builder |
| Update tool | PUT | `/api/agents/{agent_id}/tools/{tool_id}` | builder |
| Remove tool | DELETE | `/api/agents/{agent_id}/tools/{tool_id}` | builder |
| Toggle tool | PATCH | `/api/agents/{agent_id}/tools/{tool_id}` | builder |

### MCP endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| Add MCP connection | POST | `/api/agents/{agent_id}/mcp` | builder |
| List MCP connections | GET | `/api/agents/{agent_id}/mcp` | viewer |
| Sync MCP tools | POST | `/api/agents/{agent_id}/mcp/{conn_id}/sync` | builder |
| Toggle MCP tool | PATCH | `/api/agents/{agent_id}/mcp/{conn_id}/tools/{tool_name}` | builder |
| Remove MCP connection | DELETE | `/api/agents/{agent_id}/mcp/{conn_id}` | builder |

### Testing endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| Start test session | POST | `/api/agents/{agent_id}/test` | builder |
| Send test message | POST | `/api/agents/{agent_id}/test/{session_id}/send` | builder |
| Get test session | GET | `/api/agents/{agent_id}/test/{session_id}` | builder |
| List test sessions | GET | `/api/agents/{agent_id}/test` | builder |

---

## 10. AI Agents inventory page specification

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ AI Agents                                [+ New Agent]   │
├──────────────────────────────────────────────────────────┤
│ [Search]  [Filter: Status ▼] [Filter: Provider ▼]       │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Customer Support Bot              ● Ready            │ │
│ │ openai / gpt-4o                                      │ │
│ │ 3 tools · 5 knowledge files · Used in 2 workflows    │ │
│ │ Last tested: 2h ago                                  │ │
│ │                                     [⋮ More]         │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Data Analyst                      ◐ Draft            │ │
│ │ anthropic / claude-sonnet-4       │ │
│ │ 1 tool · 0 knowledge files · Not used in workflows   │ │
│ │ Never tested                                         │ │
│ │                                     [⋮ More]         │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Card fields

- **Name** and **description** preview
- **Status badge**: Ready (green), Needs Attention (yellow), Draft (gray), Archived (dimmed)
- **Provider / model** compact display
- **Topology summary**: tools count, knowledge files count, linked workflows count
- **Last tested** timestamp
- **More menu**: Edit, Duplicate, Archive, Delete (capability-gated)

### Operational status computation

Reuses the existing `getAgentOperationalStatus` logic from `agent-inventory.ts`, extended for managed agents:

| Condition | State | Label |
|---|---|---|
| No model configured | attention | Needs Attention |
| No instructions (system_prompt empty) | attention | Needs Attention |
| Credential missing or invalid | attention | Needs Attention |
| Knowledge files processing/failed | attention | Needs Attention |
| All checks pass, no linked active workflow | draft | Draft |
| All checks pass, linked to active workflow | ready | Ready |
| Archived by user | archived | Archived |

---

## 11. Rollout phases

### Phase 1: Managed agent entity

- `ManagedAgent` model, storage, CRUD endpoints
- AI Agents inventory page with list/create/edit/delete
- `managed_agent_id` linking from `ai_agent` node
- Agent capabilities object

### Phase 2: Knowledge/RAG

- File upload endpoint with chunking pipeline
- Embedding via configured LLM provider
- Vector storage (SQLite-based initially)
- Retrieval integration in agent execution
- Knowledge file management UI

### Phase 3: Tools expansion

- Workflow-as-tool with inputs/outputs schema
- Module-as-tool auto-scaffolding
- Tool testing from agent detail page

### Phase 4: MCP and testing

- MCP client with tool discovery
- MCP connection management UI
- Testing & Training chat interface
- Test session history
- Improve prompt feature

### Phase 5: Team sharing and advanced

- Team-scoped agent sharing
- Cross-workspace agent references
- Agent versioning
- Agent templates
- Streaming tool results in testing

---

## 11b. Best practices reference (Make-grounded)

Make's AI Agent best practices, adapted for FlowHolt guidance:

### Tool naming and descriptions
- Tool names and descriptions are how agents choose which tool to use
- Include: what the tool does, when to call it, when NOT to call it
- Example: Name: "Add customer email to spreadsheet" / Description: "Adds a new customer email address to the Customer Contacts spreadsheet. Do not add if email address is invalid or already exists."

### Tool inputs and outputs
- Define clear input/output schemas with descriptive names
- Add input/output examples in agent instructions
- When tool is a workflow, inputs/outputs are defined automatically via scenario inputs/outputs

### Instructions structure
- Include: all steps, tool names at each step, knowledge files to reference, guardrails, I/O examples, exception handling
- Format with headers, bullet points, numbered lists, or Markdown
- Keep system prompts general; add specifics per-workflow in the message/input field
- Use AI to improve instructions (Make's "Improve" button pattern)

### Testing iteratively
- Start with a large model, test multiple times, then scale down
- Check Reasoning tab for step-by-step logic
- Check Output tab for execution steps, tools used, token usage
- If tools return errors or aren't called correctly, adjust tool names/descriptions first

### Data security
- Assume anyone could access information shared with the agent
- Only give the agent data it needs (principle of least privilege)
- Map data into tools rather than exposing to agent directly when possible
- Set clear guardrails but assume they may be circumvented

### Model selection guidance
- Start with fast, affordable model (e.g., GPT-4.1 mini)
- Faster models for chat/real-time; slower reasoning models for complex tasks
- Monitor token usage in output metadata
- Cost factors: input tokens, output tokens, tool calls, conversation history

---

## 11c. Credit and operation cost model (Make-grounded)

Make's credit model for AI agents — FlowHolt should define an equivalent operation cost structure:

| Source | Make's AI Provider | Custom AI provider |
|---|---|---|
| Run an agent | 1 credit + AI tokens | 1 credit |
| Chat (testing) | 1 credit + tool credits + AI tokens | 1 credit + tool credits |
| Knowledge upload (PDF/DOCX) | 1 credit + 10 tokens/page + embedding + description tokens | 1 credit + embedding tokens |
| Knowledge upload (TXT/CSV/JSON) | 1 credit + embedding + description tokens | 1 credit + embedding tokens |
| Knowledge query | 1 credit + embedding tokens | 1 credit + embedding tokens |
| Tool call | 1 credit + AI tokens | 1 credit |
| Knowledge delete/get/list | 1 credit | 1 credit |

**Token types**:
- **Embedding tokens**: Convert knowledge chunks to vectors (billed on upload)
- **File description AI tokens**: Auto-generated file summary (billed on upload/description change)
- **AI tokens**: Input (prompt) and output (completion) tokens for agent reasoning

FlowHolt implication: Each agent operation (run, tool call, knowledge operation) counts as one workflow operation. Token costs are passed through to the user's configured LLM provider.

---

## 11d. Error handling strategy model (Make-grounded)

Make provides 5 error handlers that attach to individual modules. FlowHolt should implement equivalent per-step error strategies:

| Make handler | Behavior | FlowHolt equivalent | Scenario end status |
|---|---|---|---|
| **Rollback** | Stop run, revert ACID steps (default when no handler set) | `on_error: "rollback"` | error |
| **Break** | Store as incomplete execution, optionally auto-retry | `on_error: "break"` + `retry_config` | warning |
| **Ignore** | Drop errored bundle, continue with next bundles | `on_error: "skip"` | success |
| **Resume** | Replace output with substitute mapping, continue | `on_error: "resume"` + `fallback_output` | success |
| **Commit** | Stop run, save committed changes in ACID steps | `on_error: "commit"` | success |

### Key design points

- **Error handlers consume 0 credits/operations** — FlowHolt should mirror this
- **Consecutive error threshold**: default 3 before workflow deactivation (configurable via `max_consecutive_errors`)
- **Instant-trigger workflows**: deactivate immediately on first error (threshold ignored)
- **Critical errors** that always deactivate: `InvalidAccessTokenError`, `MaxFileSizeExceededError`, `IncompleteExecutionRemainingQuotaError`
- **Error handler route**: transparent connector between the erroring step and the handler; handler receives error type, message, and bundle data

### Error types taxonomy

| Error type | Common cause | Recommended handler |
|---|---|---|
| `RateLimitError` (429) | API request limits exceeded | Break (auto-retry) or scenario rate limit |
| `ConnectionError` (503/504) | App unavailable / maintenance | Break (auto-retry with backoff) |
| `ModuleTimeoutError` | Step exceeded time limit | Break (auto-retry) |
| `BundleValidationError` | Missing required input data | Resume (with defaults) or Ignore |
| `DataError` | Invalid data format/type | Resume or manual resolve |
| `RuntimeError` | Unexpected execution failure | Rollback + manual investigation |
| `InvalidAccessTokenError` | Expired/revoked credentials | Immediate deactivation (no handler helps) |

### Rate limit mitigation strategies

- **Instant workflows**: Set a rate limit (requests per second) on the workflow itself
- **Scheduled workflows**: Use longer scheduling intervals or process fewer records per run
- **Bulk action steps**: Use batch/bulk API calls instead of per-record calls
- **Aggregators**: Combine multiple items before sending to reduce API calls
- **Sleep steps**: Insert delays between API-heavy steps

---

## 11e. Incomplete executions and auto-retry (Make-grounded)

Incomplete executions store unfinished workflow runs when errors occur with `store_incomplete_executions` enabled.

### Auto-retry scheduling

Make auto-retries for `RateLimitError`, `ConnectionError`, `ModuleTimeoutError` with exponential backoff:

| Attempt | Delay | Cumulative time |
|---|---|---|
| 1 | 1 min | 1 min |
| 2 | 10 min | 11 min |
| 3 | 10 min | 21 min |
| 4 | 30 min | 51 min |
| 5 | 30 min | 1h 21min |
| 6 | 30 min | 1h 51min |
| 7 | 3 hours | 4h 51min |
| 8 | 3 hours | 7h 51min |

**Break handler retries**: default 3 attempts, 15-minute delay (customizable per handler).

### Processing rules

- **Max 3 parallel retries** per workflow (batched)
- Retries wait until the original workflow finishes if currently running
- Successful retry → mark Resolved (auto-deleted after 30 days)
- All retries fail → mark Unresolved (manual action required)
- Other error types (DataError, RuntimeError) require manual resolve — no auto-retry

### Errors that DON'T create incomplete executions

- Error on the **first step** (unless Break handler attached)
- **Storage full** — behavior depends on `enable_data_loss` setting
- **Execution duration exceeded** (40-min limit on Make)
- Errors during **initialization or rollback phases** (outside operation phase)

### FlowHolt incomplete execution model

```python
class IncompleteExecution(BaseModel):
    id: str
    workflow_id: str
    workspace_id: str
    error_type: str
    error_message: str
    failed_step_id: str
    execution_snapshot: dict[str, Any]  # frozen state at error point
    status: Literal["unresolved", "pending", "in_progress", "resolved"]
    retry_attempts: int = 0
    next_retry_at: str | None = None
    created_at: str
    resolved_at: str | None = None
    size_bytes: int
```

---

## 11f. Scenario execution and transaction model (Make-grounded)

Make operates as a **transactional system** similar to relational databases. FlowHolt should follow the same phased execution model.

### Execution phases

```
Initialization
  └─ Verify all connections, validate credentials
       ↓
Cycle 1..N  (default max_cycles = 1)
  ├─ Operation phase: read from / write to services
  ├─ Commit phase: confirm changes to all services (success)
  └─ Rollback phase: revert changes in ACID steps (on error)
       ↓
Finalization
  └─ Return connections to pool, cleanup resources
```

### Key settings

| Setting | Default | Effect |
|---|---|---|
| `max_cycles` | 1 | Number of trigger-bundle processing cycles per execution |
| `auto_commit` | true | Commit each step immediately vs. batch at end |
| `commit_trigger_last` | true | Process trigger step's commit after all others |
| `sequential_processing` | false | Block next execution until previous completes |
| `store_incomplete_executions` | false | Store failed runs for retry/manual resolve |
| `enable_data_loss` | false | If IE storage full: true=discard, false=deactivate workflow |
| `data_is_confidential` | false | Hide processed data after execution |
| `max_consecutive_errors` | 3 | Errors before workflow deactivation |

### ACID steps

- Only steps tagged with **"ACID"** support rollback
- Non-ACID steps commit immediately regardless of `auto_commit` setting
- On rollback: ACID steps revert as if nothing happened; non-ACID changes persist
- Example: Data store modules are ACID; HTTP request modules are not

### Execution limits (Make reference)

| Limit | Value |
|---|---|
| Max execution duration | 40 minutes |
| Module data limit | 5 MB per step |
| Search result limit | 3,200 objects per search step |
| Max cycles | Configurable (default 1) |

---

## 11g. Webhooks and trigger model (Make-grounded)

FlowHolt should support both trigger types and webhook infrastructure.

### Trigger types

| Type | Mechanism | Schedule | FlowHolt equivalent |
|---|---|---|---|
| **Polling trigger** | Periodic check for new data | Configurable interval | Scheduled trigger node |
| **Instant trigger** | Webhook URL receives data | Immediately | Webhook trigger node |

### Webhook infrastructure

- **Custom webhooks**: Generate a URL, any service can POST data to it
- **App-specific webhooks**: Pre-built instant triggers for supported apps
- **Webhook response module**: Return custom HTTP status/body to the caller
- Default responses: 200 Accepted, 400 Queue full, 429 Too many requests

### Webhook processing

| Feature | Make value | FlowHolt target |
|---|---|---|
| Processing mode | Parallel (default) or Sequential | Same |
| Queue limit | 667 items per 10K credits/month, max 10,000 | Plan-based quota |
| Rate limit | 300 requests per 10 seconds | Configurable per workspace |
| Inactive expiry | 5 days (120h) without scenario → 410 Gone | Same |
| Log retention | 3 days (30 days Enterprise) | Plan-based |
| Data storage | Always stored in queue (even if confidential) | Same, encrypted at rest |

### Scheduled webhook processing

- When a webhook-triggered workflow is rescheduled, incoming data accumulates in the queue
- Queue is processed based on `max_results` setting when schedule criteria are met
- Instant trigger modules use `max_cycles` instead of `max_results`

### FlowHolt webhook model

```python
class WorkflowWebhook(BaseModel):
    id: str
    workflow_id: str
    workspace_id: str
    url: str                              # auto-generated unique URL
    status: Literal["active", "inactive", "expired"]
    queue_size: int = 0
    max_queue_size: int = 1000            # plan-based
    rate_limit_per_10s: int = 300
    last_received_at: str | None = None
    created_at: str
```

---

## 11h. Variables system (Make-grounded)

Make offers 4 variable types. FlowHolt should implement equivalents.

### Variable types mapping

| Make type | Scope | Persistence | FlowHolt equivalent |
|---|---|---|---|
| **System** | Platform-wide | Read-only | `SystemVariable` — execution ID, workflow ID/name/URL, operations consumed, data consumed, workspace/org info |
| **Scenario** | Single execution | Ephemeral (one run) | `WorkflowVariable` — Set/Get variable steps, lifetime: one cycle or one execution |
| **Custom** | Org or Team level | Persists across runs | `WorkspaceVariable` — created at workspace/org level, accessible in all workflows |
| **Incremental** | Single workflow | Persists across runs | `IncrementalVariable` — counter with configurable reset policy |

### System variables (FlowHolt-adapted)

| Variable | Description |
|---|---|
| `execution.id` | Unique execution identifier |
| `execution.start_time` | ISO 8601 start timestamp |
| `execution.operations_consumed` | Operations used so far in this execution |
| `execution.data_consumed_bytes` | Data processed so far |
| `workflow.id` | Workflow identifier |
| `workflow.name` | Workflow display name |
| `workflow.url` | Direct URL to workflow |
| `workspace.id` | Workspace identifier |
| `workspace.name` | Workspace display name |
| `workspace.operations_remaining` | Operations left in billing period |
| `organization.id` | Organization identifier |
| `organization.name` | Organization display name |

### Custom variables

```python
class WorkspaceVariable(BaseModel):
    id: str
    scope: Literal["organization", "workspace"]
    scope_id: str
    name: str                     # immutable after creation
    data_type: Literal["text", "number", "boolean", "date"]
    value: str                    # stored as text, parsed by type
    created_by_user_id: str
    created_at: str
    updated_at: str
```

**Security note**: Custom variables are NOT encrypted in Make (stored as plain text). FlowHolt should add a `is_secret` flag — when true, value is encrypted at rest and masked in UI. This addresses a known Make limitation.

### Variable lifecycle rules

- Custom variable values are loaded at execution start; mid-execution changes by other workflows won't be seen until next run
- Scenario variables exist only during the current execution; destroyed on completion
- Incremental variables persist their counter value across executions (configurable reset: never, daily, or per-execution)

---

## 11i. Data stores and structures (Make-grounded)

Data stores provide simple key-value databases within the platform for storing and transferring data between workflows.

### Storage allowance

| Plan tier | Formula | Minimum |
|---|---|---|
| All plans | 1 MB per 1,000 operations in plan | 1 MB |
| Free | 1 MB (1 data store) | 1 MB |

### Data store modules

| Module | Description | Credits |
|---|---|---|
| Add/Replace a Record | Insert or overwrite by key | 1 |
| Update a Record | Update fields by key, optional upsert | 1 |
| Get a Record | Retrieve by key | 1 |
| Search Records | Filter/sort with limit | 1 |
| Check Existence | Returns true/false for key | 1 |
| Count Records | Return total count | 1 |
| Delete a Record | Delete by key | 1 |
| Delete All Records | Purge entire store | 1 |

### Data store constraints

- **Max record size**: 15 MB
- **Key**: unique identifier per record (auto-generated if blank)
- **ACID-tagged**: Data store modules support rollback
- **Strict mode**: Rejects payloads with fields not in the data structure
- **Field names are immutable identifiers** — renaming creates a new column; label changes are safe
- **No automated data migration** — structure changes only apply to new records

### Data structures

```python
class DataStoreStructure(BaseModel):
    id: str
    name: str                           # immutable identifier
    fields: list[DataStoreField]
    strict: bool = False                # reject unknown fields
    created_at: str

class DataStoreField(BaseModel):
    name: str                           # immutable field identifier
    label: str                          # display label (mutable)
    field_type: Literal["text", "number", "boolean", "date", "collection"]
    required: bool = False

class DataStore(BaseModel):
    id: str
    workspace_id: str
    name: str
    structure_id: str | None = None     # optional schema
    size_mb: int = 1                    # allocated from workspace quota
    records_count: int = 0
    created_at: str
    updated_at: str
```

### FlowHolt data store endpoints

| Action | Method | Path |
|---|---|---|
| List data stores | GET | `/api/datastores` |
| Create data store | POST | `/api/datastores` |
| Get data store | GET | `/api/datastores/{id}` |
| Update data store | PUT | `/api/datastores/{id}` |
| Delete data store | DELETE | `/api/datastores/{id}` |
| Browse records | GET | `/api/datastores/{id}/records` |
| Add/Replace record | POST | `/api/datastores/{id}/records` |
| Get record | GET | `/api/datastores/{id}/records/{key}` |
| Update record | PUT | `/api/datastores/{id}/records/{key}` |
| Delete record | DELETE | `/api/datastores/{id}/records/{key}` |

---

## 11j. Data security mechanisms (Make-grounded)

Make provides encryption and hashing via the Encryptor app. FlowHolt should offer an equivalent node type.

### Supported algorithms

| Algorithm | Type | Key sizes | Modes | FlowHolt node |
|---|---|---|---|---|
| **AES** | Symmetric | 128-bit, 256-bit | CBC, GCM | `encryptor_aes` |
| **PGP** | Asymmetric | Min 2048-bit | RSA, ECC | `encryptor_pgp` |
| **SHA** | Hashing (one-way) | — | SHA-1, SHA-256 | `encryptor_hash` |

### AES components

- **Key**: 128 or 256 bits (shared between sender/recipient)
- **Initialization vector**: Random value per encryption (prevents pattern detection)
- **Authentication tag**: Integrity check value (GCM mode)
- **Simple vs. Advanced**: Simple uses plaintext key in config; Advanced uses keychain (key hidden from blueprint exports)

### PGP components

- **Public key**: Used to encrypt (shared freely)
- **Private key**: Used to decrypt (kept secret)
- **Passphrase**: Protects the private key
- **Digital signature**: Optional — sender signs with private key, recipient verifies with sender's public key

### Keychain management

Make uses **keychains** to store encryption keys securely, separate from the scenario blueprint. FlowHolt should store encryption keys in the **vault** (same as credentials), referenced by `credential_id` in the encryptor node config.

### FlowHolt Encryptor node type

```python
# In node_registry.py
"encryptor": NodeTypeDefinition(
    family="tools",
    display_name="Encryptor",
    description="Encrypt, decrypt, hash, or sign data",
    config_schema={
        "operation": Literal["aes_encrypt", "aes_decrypt", "pgp_encrypt", "pgp_decrypt", "hash", "sign", "verify"],
        "credential_id": str,          # vault reference for keys
        "input_encoding": Literal["utf8", "base64", "hex"],
        "output_encoding": Literal["utf8", "base64", "hex"],
        # AES-specific
        "aes_bits": Literal[128, 256],
        "aes_mode": Literal["cbc", "gcm"],
        # PGP-specific — keys via credential_id
        # Hash-specific
        "hash_algorithm": Literal["sha1", "sha256"],
    }
)
```

---

## 12. Planning decisions still open

1. **Embedding model**: Should the embedding model be the same as the agent's chat model provider, or a separate configurable embedding provider? Recommend: default to same provider, with override option.

2. **Vector store backend**: SQLite with extension vs. dedicated vector DB (pgvector, Qdrant). Recommend: SQLite for Phase 1, pluggable backend interface for Phase 2.

3. **Knowledge scope**: Per-agent only, or allow workspace-level knowledge bases that multiple agents share? Recommend: per-agent in Phase 1, shared knowledge bases in Phase 3.

4. **Tool permission scoping**: When an agent invokes a workflow tool, should the execution run with the agent owner's permissions or the triggering user's permissions? Recommend: triggering user's permissions (least privilege).

5. **Agent execution cost tracking**: Should agent tool calls count toward operation quotas separately from workflow step operations? Recommend: yes, each tool call is one operation.

6. **Inline vs. linked agent preference**: Should the Studio default to creating a linked managed agent or an inline agent node? Recommend: inline by default for quick start, with "Promote to Managed Agent" action for users who want the full entity.

7. **MCP toolbox hosting**: Should FlowHolt host MCP toolbox endpoints directly (like Make), or delegate to an external MCP server? Recommend: host directly in Phase 2, using the workflow execution engine to serve tool calls.

8. **Conversation memory storage**: Where to store conversation history — in the agent's DB, in a separate conversation store, or in the vector DB? Recommend: dedicated conversation table with TTL, separate from knowledge vector store.

9. **Knowledge inactivity TTL**: Should FlowHolt auto-delete knowledge files after inactivity (Make uses 180 days)? Recommend: configurable per workspace, default 180 days with warning notifications at 150 days.

10. **Subscenario calling mode**: Should FlowHolt support both sync and async workflow-as-tool invocation (matching Make's Call a scenario)? Recommend: yes, with a `wait_for_completion` toggle on the workflow tool reference.

11. **Error handler model**: Which error handlers to implement in Phase 1? Recommend: Rollback (default) + Break (for auto-retry) + Ignore in MVP. Resume and Commit in Phase 2.

12. **Incomplete execution storage limits**: How much IE storage per plan tier? Recommend: tie to operations allowance (same formula as data stores: 1 MB per 1,000 ops).

13. **Data store implementation priority**: Build in-app data stores or rely on external databases only? Recommend: simple key-value data store in Phase 1, full data store with structures/strict mode in Phase 2.

14. **Variable secret support**: Make stores custom variables in plaintext. Should FlowHolt add encryption for secret variables? Recommend: yes, add `is_secret` flag from launch — encrypted at rest, masked in UI, not exported in blueprints.

15. **Webhook queue sizing**: How to size webhook queues per plan tier? Recommend: follow Make's formula (667 items per 10K credits/month, max 10K) as starting point.

16. **Execution time limit**: Make uses 40-minute max execution duration. Should FlowHolt use the same? Recommend: yes for scheduled workflows; consider longer limits for AI agent workflows with many tool calls.

17. **ACID step identification**: How to mark which FlowHolt node types support transactional rollback? Recommend: tag in `NodeTypeDefinition` with `supports_acid: bool`, defaulting to false. Data store and database connector nodes get `true`.

18. **System variable extensibility**: Should users be able to define custom system-like variables? Recommend: no — keep system variables platform-controlled. Custom variables at workspace level cover the extensibility need.

19. **Encryptor node priority**: When to implement the Encryptor node type? Recommend: Phase 3 alongside data security hardening. Use vault-stored credentials for keys from day one.

---

## 13. Make AI module packages (from editor crawl)

The automated Make editor crawl discovered icon requests that reveal Make's internal AI app package structure. These map to FlowHolt's planned AI node family.

### Make package: `ai-tools` → FlowHolt: AI text operations
| Make module | Purpose | FlowHolt equivalent |
|---|---|---|
| `Ask` | General AI prompt | `ai_chat_model` node |
| `AnalyzeSentiment` | Sentiment analysis | AI utility node (Phase 2) |
| `Categorize` | Text categorization | AI utility node (Phase 2) |
| `CountAndChunkText` | Token counting + chunking | Knowledge pipeline utility |
| `DetectLanguage` | Language detection | AI utility node (Phase 2) |
| `Extract` | Structured data extraction | `ai_output_parser` (structured mode) |
| `Standardize` | Text standardization | AI utility node (Phase 2) |
| `Summarize` | Text summarization | AI utility node (Phase 2) |
| `Translate` | Text translation | AI utility node (Phase 2) |

### Make package: `ai-local-agent` → FlowHolt: `ai_agent` node
| Make module | Purpose | FlowHolt equivalent |
|---|---|---|
| `RunLocalAIAgent` | Execute a managed AI agent as a scenario module | `ai_agent` node (linked to managed agent) |

This confirms the "agent as node" pattern already planned: managed agents are invoked in workflows via a special module that references the agent entity.

### Make package: `make-ai-extractors` → FlowHolt: Multimodal AI nodes (Phase 2+)
| Make module | Purpose |
|---|---|
| `captionAnImage` | Basic image captioning |
| `captionAnImageAdvanced` | Advanced image captioning |
| `describeAnImage` | Image description |
| `extractADocument` | Document extraction |
| `extractAnInvoice` | Invoice extraction |
| `extractAReceipt` | Receipt extraction |
| `extractTextFromAnImage` | OCR text extraction |

Planning implication: FlowHolt should plan for multimodal AI nodes in Phase 2, starting with document extraction and OCR. Image captioning can follow.

### Make package: `make-ai-web-search` → FlowHolt: Web-augmented AI (Phase 2+)
| Make module | Purpose |
|---|---|
| `generateAResponse` | Web-search-augmented response generation |

Planning implication: Web-augmented generation is a separate package from core AI tools. FlowHolt should plan this as a future AI capability.

### AI UI entry points in Make (from crawl)
Make has **3 distinct AI entry points** in the editor:
1. **AI Copilot button** — floating button at bottom-right (`<ai-copilot-button>`, `button#resources-button`), opens an AI resource/assistant panel
2. **Explain flow (AI)** — bottom toolbar button (`btn-inspector-explain-flow`, sparkles icon), AI-powered scenario explanation
3. **AI Agent node** — standard node insertion, uses `RunLocalAIAgent` module from `ai-local-agent` package

FlowHolt should plan equivalent coverage:
1. Floating AI assistant button → connects to existing chat panel
2. Workflow explain/summarize action → new toolbar action
3. AI Agent node → already planned as `ai_agent` node

### Make AI Agent API (from crawl)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/ai-agents/v1/agents` | List AI agents |
| GET | `/api/v2/scenarios/ai-agents` | AI agents linked to scenarios |

Note: The AI agents API uses a `v1` sub-version (`/ai-agents/v1/`), suggesting this is a newer API surface that may evolve independently. FlowHolt should version its agent API similarly.

### AI Agents in navigation (from crawl)
- First-level nav item with test ID `first-level-navigation-main-agents`
- Has a "Beta" pill displayed via `first-level-navigation-agents-pill`
- This is a **top-level entity**, at the same level as Scenarios, Credentials, and Webhooks

---

## n8n AI system cross-reference (from `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`)

### n8n Agent SDK (`@n8n/agents`) — builder pattern

n8n's agent SDK uses a fluent builder API that FlowHolt should adopt:

```typescript
const agent = new Agent('assistant')
  .model('anthropic/claude-sonnet-4-5')
  .credential('anthropic')
  .instructions('You are helpful.')
  .tool(myTool)
  // No .build() — lazy-build on .run() or .stream()
```

Key patterns:
- **Builder pattern with lazy build** — `.build()` is `protected`, called internally on `.run()`/`.stream()`
- **Credential injection** — agents declare credential names, engine resolves to API keys at runtime
- **Zod schemas** for all input/output definitions
- **Memory system** — conversation + working memory with SQLite/PostgreSQL persistence
- **MCP integration** — MCP client for discovering and using external tools
- **Guardrails** — builder-based input/output validation
- **Evaluation** — built-in eval primitives for testing agent quality
- **Telemetry** — OpenTelemetry + LangSmith + redaction support
- **Workspace** — sandbox/filesystem integration for agent workspaces

### FlowHolt agent SDK adoption plan

| n8n concept | FlowHolt equivalent | Priority |
|---|---|---|
| `Agent` builder | `AgentDefinition` builder | P0 — core |
| `.model()` selector | Model config in managed agent | P0 |
| `.credential()` injection | Credential binding via workspace secrets | P0 |
| `.instructions()` | System prompt in managed agent | P0 |
| `.tool()` builder | Tool attachment via `ai_tool` cluster nodes | P0 |
| Memory persistence | Knowledge/memory service | P1 |
| MCP client | MCP tool discovery | P1 |
| Guardrails | Input/output validation nodes | P1 |
| Evaluation runner | Test run system (adopt from n8n) | P2 |
| Workspace/sandbox | Agent workspace isolation | P2 |
| Telemetry/redaction | Observability service integration | P2 |

### n8n Chat Hub — multi-agent chat

n8n has a full chat hub system (`chat.store.ts` at 47KB) that FlowHolt should plan:

| Component | Purpose | FlowHolt relevance |
|---|---|---|
| `ChatView.vue` (27KB) | Main chat interface | FlowHolt's AI assistant panel should evolve to this |
| `ChatPersonalAgentsView` | User-scoped agent chat | Personal agent conversations |
| `ChatWorkflowAgentsView` | Workflow-scoped agent chat | Chat with agents tied to workflows |
| `ChatSemanticSearchSettings` | RAG/vector search config | Knowledge system configuration |
| `model-selector.utils` | LLM model picker | Model selection UI for agents |
| `chatHubPanel.store` | Panel state management | Chat panel open/close/resize state |

The chat hub supports:
- Multiple LLM providers with per-provider settings
- Semantic search (RAG) integration
- Agent file upload (configurable max size)
- Personal agents vs. workflow agents distinction

### n8n Evaluation system

n8n has a full evaluation system for testing AI workflows:

| Route | Component | Purpose |
|---|---|---|
| `/workflow/:name/evaluation` | `EvaluationsRootView` | Root evaluation page |
| `/workflow/:name/evaluation` (child) | `EvaluationsView` | Edit evaluation config |
| `/workflow/:name/evaluation/test-runs/:runId` | `TestRunDetailView` | View test run results |

Database entities:
- `TestRun` — test run record with status, metrics, workflow reference
- `TestCaseExecution` — individual test case within a run

FlowHolt should plan evaluation as a per-workflow tab (matching the n8n `MAIN_HEADER_TABS.EVALUATION` pattern). This connects to the managed agent's "testing surface" already planned in this file.

### n8n LangChain node categories

n8n organizes AI nodes into 18 categories within `@n8n/nodes-langchain`:

| Category | FlowHolt mapping |
|---|---|
| `agents/` (Agent, OpenAI Assistant) | `ai_agent` node family |
| `llms/` (OpenAI, Anthropic, Google, Azure) | `ai_chat_model` cluster children |
| `memory/` (Buffer, Redis, Postgres, Zep) | `ai_memory` cluster children |
| `tools/` (Calculator, HTTP, Code, Wikipedia) | `ai_tool` cluster children |
| `embeddings/` (OpenAI, Cohere, HuggingFace) | Embedding service for RAG |
| `vector_store/` (Pinecone, Qdrant, Supabase) | Vector store for knowledge system |
| `document_loaders/` (PDF, CSV, Google Drive) | Knowledge ingestion pipeline |
| `text_splitters/` (Character, Token, Markdown) | Knowledge chunking pipeline |
| `retrievers/` (Vector store, contextual) | RAG retrieval for agent context |
| `output_parser/` (Structured, JSON, list) | `ai_output_parser` cluster children |
| `chains/` (Summarization, QA, Conversational) | Chain-type workflow patterns |
| `Guardrails/` (Input/output validation) | New — guardrail nodes |
| `ModelSelector/` (Model selection) | Model selection UI component |
| `ToolExecutor/` (Tool execution) | Tool runtime execution |
| `mcp/` (MCP client/server) | MCP integration nodes |
| `rerankers/` (Result reranking) | RAG result quality improvement |
| `code/` (Code execution for AI) | Code tool for agents |
| `trigger/` (AI triggers) | AI-specific trigger nodes |

### n8n AI in the editor — UI components

| n8n component | Purpose | FlowHolt plan |
|---|---|---|
| `AskAssistantButton` | Floating AI assistant trigger | ✅ Already planned |
| `AskAssistantChat` | Chat interface for assistant | ✅ Already planned |
| `InlineAskAssistantButton` | AI help within parameter fields | 🔴 New — inline AI for parameter editing |
| `AiGatewaySelector` | Model/gateway selection | 🔴 New — model picker for AI settings |
| `FromAiParametersModal` | AI fills in node parameters | 🔴 New — AI auto-configuration |
| `FreeAiCreditsCallout` | AI credits promotion | 🟡 Plan for monetization phase |
| `AiUpdatedCodeMessage` | AI-modified code notification | 🔴 New — notification after AI changes |

### Key adoption decision: AI workflow builder

n8n has `@n8n/ai-workflow-builder.ee` (enterprise) and `ai-workflow-builder.service.ts` (7KB) that generates workflows from natural language prompts. The frontend has an `aiBuilderDiff` modal to show proposed changes.

FlowHolt should plan:
1. **Phase 1**: AI assistant that explains workflows and suggests improvements
2. **Phase 2**: AI builder that generates workflow nodes from natural language
3. **Phase 3**: AI builder with diff preview (adopt `aiBuilderDiff` pattern)

### Key adoption decision: Computer Use

n8n has `@n8n/computer-use` package for browser automation within AI agents. This is a cutting-edge feature. FlowHolt should plan this as Phase 3+ — agent capability to interact with web pages via Playwright.
