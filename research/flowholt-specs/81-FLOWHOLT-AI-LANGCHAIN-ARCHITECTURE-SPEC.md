# SPEC-81: FlowHolt AI & LangChain Architecture Deep Spec
## Source: n8n Documentation Deep Research — Advanced AI Complete Reference

**Created:** Sprint 88 Research Session
**Status:** Research Complete — Ready for Implementation Reference
**Scope:** AI Agent nodes, LangChain cluster nodes, RAG, MCP, Human-in-Loop, AI code generation

---

## 1. Overview — AI Architecture Philosophy

FlowHolt's AI architecture follows the **cluster node pattern** pioneered by n8n's LangChain integration. Unlike flat single nodes, AI nodes form composable clusters where:
- **Root nodes** = the AI capability (Agent, Chain, Vector Store)
- **Sub-nodes** = the components that power it (LLMs, Memory, Tools, Embeddings)
- Sub-nodes connect via special **sub-connection types** (not the main data flow)

This pattern allows users to **mix and match** AI components visually on the canvas — swap out the LLM provider, add different memory backends, or chain multiple tools — without needing code.

---

## 2. LangChain Node Catalog (Complete)

### 2.1 Root Nodes (Core AI Capabilities)

#### AI Agent Node
The primary AI execution node. Connects to LLM + Tools + Memory.
```
Input: Main data (chat message, task description)
Config:
  - promptType: "define" | "takePreviousNode" | "auto"
  - systemMessage: string (system prompt)
  - maxIterations: number (default 10, prevent infinite loops)
  - returnIntermediateSteps: boolean
  - postReceive: transformations
Output: Main (agent response + optional tool calls)
Sub-connectors:
  - AI Model (required): connects LLM sub-node
  - Memory (optional): connects memory backend sub-node
  - Tool (optional): 0-N tool sub-nodes
```

**Agent types:**
- `conversationalReactDescription` — general conversation + tools (default)
- `reActAgent` — reasoning + acting (multi-step tool use)
- `planAndExecute` — plan then execute approach
- `openAiFunctionsAgent` — uses OpenAI function calling
- `toolsAgent` — uses tool calling API (broader LLM support)
- `sqlAgent` — specialized for SQL queries

#### Basic LLM Chain Node
Simplest AI node — just LLM with a prompt, no tools or memory.
```
Input: Main data
Config:
  - prompt: string (template with {{var}} substitution)
  - outputKey: string (field name for response in output json)
Output: Appends response to input item json
Sub-connectors:
  - AI Model (required)
  - Memory (optional)
  - Output Parser (optional)
```

#### Retrieval QA Chain Node
Retrieves documents from vector store then answers a question.
```
Input: Main data (question text)
Config:
  - prompt: string
  - chainType: "stuff" | "mapReduce" | "mapRerank" | "refine"
Output: answer + source documents
Sub-connectors:
  - AI Model (required)
  - Vector Store (required) — the knowledge base
  - Memory (optional)
```

#### Summarization Chain Node
Summarizes long text, with support for chunking.
```
Input: Main data (text or document chunks)
Config:
  - chainType: "stuff" | "mapReduce" | "refine"
  - prompt: string (custom summary prompt)
Output: Summary text
Sub-connectors:
  - AI Model (required)
```

#### Sentiment Analysis Chain
Classifies text sentiment.
```
Output: sentiment label + confidence score
Sub-connectors: AI Model (required)
```

#### Text Classifier Chain
Route items to different outputs based on AI classification.
```
Config:
  - categories: string[] (list of possible classes)
  - systemPromptTemplate: string
  - enableAutoFixOutput: boolean
Outputs: One output connector per category
Sub-connectors: AI Model (required)
```

### 2.2 Vector Store Root Nodes

All vector stores have 3 operation modes:
- **Get Many** — query/search the store
- **Insert Documents** — add documents to the store
- **Retrieve Documents (For Chain/Retrieval QA)** — used as sub-node for chains

| Vector Store | Notes |
|---|---|
| Simple Vector Store | In-memory, non-persistent — for testing/prototyping |
| Pinecone | Cloud vector store — production ready |
| Supabase Vector Store | Postgres + pgvector — ideal for FlowHolt's Supabase stack |
| Qdrant | Open-source, self-hostable |
| Weaviate | Open-source, self-hostable |
| Chroma | Local/Docker vector DB |
| Zep | Memory-focused vector store with built-in memory graph |

**FlowHolt recommendation:** Use **Supabase Vector Store** as primary (pgvector is already in Supabase stack).

### 2.3 LangChain Code Node
Run arbitrary LangChain code directly:
```
Sub-connectors: AI Model, Memory, Tools (all optional)
Config: JavaScript code using LangChain.js patterns
```

---

## 3. Sub-Node Catalog (Complete)

### 3.1 LLM / Chat Model Sub-Nodes
Connect to AI Agent, Basic LLM Chain, and Summarization Chain nodes.

| Sub-Node | Provider | Notes |
|---|---|---|
| OpenAI Chat Model | OpenAI | GPT-4o, GPT-4, GPT-3.5 |
| Azure OpenAI Chat Model | Azure | Same models via Azure |
| Anthropic Chat Model | Anthropic | Claude 3.5 Sonnet, Haiku, Opus |
| Google Gemini Chat Model | Google | Gemini 2.0 Flash, Pro |
| Groq Chat Model | Groq | Llama 3, Mixtral — very fast |
| Mistral Cloud Chat Model | Mistral | Mixtral, Mistral Large |
| Ollama Chat Model | Self-hosted | Run models locally |
| Cohere Model | Cohere | Command-R, Command-R+ |

**Config (common):**
```typescript
{
  model: string;           // Model name
  temperature: number;     // 0-2, default 0.7
  maxTokens: number;       // Max response length
  timeout: number;         // Request timeout
  maxRetries: number;      // Auto-retry on failure
  streaming: boolean;      // Enable token streaming
}
```

### 3.2 Memory Sub-Nodes
Persist conversation history across executions.

| Memory Type | Backend | Persistence |
|---|---|---|
| Simple Memory (Buffer) | In-memory | Per-execution only (resets each run) |
| Window Buffer Memory | In-memory | Last N messages only |
| Postgres Chat Memory | PostgreSQL | Persistent across sessions |
| Redis Chat Memory | Redis | Persistent, fast |
| Zep | Zep Cloud/Self-hosted | Persistent + knowledge graph |
| Motorhead | Motorhead server | Persistent + automatic compression |

**Memory sub-node config:**
```typescript
{
  sessionId: string;      // Usually {{ $json.sessionId }} or user ID
  sessionKey: string;     // Key prefix in storage (default: "chat_history")
  contextWindowLength: number;  // Max messages to keep (window memory)
}
```

**Session ID pattern:** Always use a dynamic session ID from the incoming data (user ID, conversation ID, etc.) so different users/conversations have separate memory.

### 3.3 Tool Sub-Nodes
Connect to AI Agent as capabilities it can call.

| Tool | Description |
|---|---|
| Calculator | Perform math operations |
| Code Execution | Run code snippets |
| HTTP Request Tool | Make API calls |
| SerpAPI | Google search via SerpAPI |
| Wikipedia | Query Wikipedia |
| Wolfram Alpha | Computation and knowledge |
| Vector Store Question/Answer | RAG tool — query vector store, return answer |
| Custom n8n Workflow Tool | Call another workflow as a tool |

**Custom Workflow Tool** is the most powerful — any FlowHolt workflow can be exposed as a tool to AI agents. Config:
```typescript
{
  workflowId: string;          // Target workflow UUID
  name: string;                // Tool name (shown to AI)
  description: string;         // When to use this tool (AI uses this to decide)
  inputSchema: JSONSchema;     // What parameters AI can pass
}
```

### 3.4 Document Loader Sub-Nodes
Load and chunk documents for vector store ingestion.

| Loader | Source |
|---|---|
| Default Data Loader | Works with any binary data from previous node |
| Binary Input Loader | Explicit binary file input |
| GitHub Document Loader | Load files from GitHub repos |
| Notion Document Loader | Load Notion pages/databases |
| S3 Document Loader | Load files from S3 bucket |
| Unstructured.io | Parse PDFs, Word, etc. with Unstructured API |

**Text Splitter sub-nodes** (used with Document Loaders):
- **Character Text Splitter** — split by character count + overlap
- **Recursive Character Text Splitter** — recursively split by Markdown/HTML/code blocks (recommended)
- **Token Text Splitter** — split by token count (model-aware)

### 3.5 Output Parser Sub-Nodes
Structure LLM output into typed data.

| Parser | Output |
|---|---|
| Auto-Fixing Output Parser | Wraps another parser, auto-retries on parse failure |
| Structured Output Parser | Parse JSON schema from LLM output |
| Item List Output Parser | Parse comma-separated list into array |

**Structured Output Parser** is most common:
```typescript
{
  jsonSchema: JSONSchema;  // Schema for desired output shape
  // LLM will be instructed to output valid JSON matching this schema
}
```

### 3.6 Retriever Sub-Nodes
Advanced document retrieval strategies.

| Retriever | Strategy |
|---|---|
| Vector Store Retriever | Standard similarity search |
| Multi Query Retriever | Generate multiple query variants, merge results |
| Contextual Compression Retriever | Compress retrieved docs to relevant parts |
| Cohere Reranker | Re-rank retrieved docs with Cohere |

### 3.7 Embedding Sub-Nodes
Convert text to vector embeddings for vector stores.

| Embedding | Provider |
|---|---|
| OpenAI Embeddings | text-embedding-3-small, text-embedding-3-large |
| Azure OpenAI Embeddings | Same models via Azure |
| Google Vertex AI Embeddings | textembedding-gecko, text-multilingual-embedding |
| Cohere Embeddings | embed-english-v3.0, embed-multilingual-v3.0 |
| Hugging Face Inference Embeddings | Any HuggingFace embedding model |
| Ollama Embeddings | Local embedding models |

**Embedding model selection guide:**
- **Fast/cheap (testing)**: `text-embedding-ada-002` or `text-embedding-3-small`
- **High accuracy**: `text-embedding-3-large`
- **Multi-language**: `embed-multilingual-v3.0`
- **Self-hosted**: Ollama with `nomic-embed-text`

---

## 4. RAG Architecture (Retrieval-Augmented Generation)

### 4.1 Two-Workflow RAG Pattern
RAG requires two separate workflows:

**Workflow 1 — Data Ingestion:**
```
Data Source Node (HTTP/DB/File)
→ Document Loader (+ Text Splitter)
→ Vector Store (Insert Documents mode)
    └── Embedding Sub-node
```

**Workflow 2 — Query/Response:**
```
Chat Trigger / Webhook Trigger
→ AI Agent or Retrieval QA Chain
    ├── AI Model Sub-node
    └── Vector Store Tool Sub-node
        └── Embedding Sub-node (same model as ingestion!)
```

**Critical rule:** Ingestion and query must use the **same embedding model** — otherwise vectors are incompatible.

### 4.2 Chunking Strategy Guide

| Use Case | Chunk Size | Overlap |
|----------|------------|---------|
| FAQ / short answers | 200-500 tokens | 50 tokens |
| Long documents, books | 500-1000 tokens | 100 tokens |
| Code documentation | 500 tokens | 50 tokens (block-aware splitting) |
| Multilingual content | 300 tokens | 75 tokens |

**Recommended splitter:** Recursive Character Text Splitter (handles Markdown + code blocks best)

### 4.3 RAG Quality Improvements
1. **Add metadata to chunks**: Include document title, section, URL, date in each chunk
2. **Use contextual retrieval**: Prepend context summary to each chunk (Anthropic technique)
3. **Multi-query retrieval**: Generate 3 query variants, merge + deduplicate results
4. **Re-ranking**: Use Cohere Reranker to re-score retrieved chunks
5. **Cost optimization**: Use VectorStoreQA Tool node first, then pass condensed answer to expensive LLM

---

## 5. Human-in-the-Loop (HITL) for AI Tools

### 5.1 Concept
An AI Agent can be configured to **pause and require human approval** before executing specific tools. The workflow:
1. AI decides to call a tool
2. Approval request is sent via configured channel (Slack, email, chat, etc.)
3. Human reviews: tool name + parameters the AI wants to use
4. Human approves → tool executes with AI's parameters
5. Human denies → tool call is canceled, AI is informed

### 5.2 Use Cases
- Tools that send external communications (email, Slack message)
- Irreversible actions (delete record, make purchase)
- High-risk operations (financial transactions, data export)
- Compliance-required approvals (regulated industries)
- Building trust in AI (start with full oversight, reduce over time)

### 5.3 Approval Channels
| Channel | Best For |
|---------|---------|
| n8n Chat | Simple internal workflows |
| Slack | Team-based approvals |
| Discord | Community/gaming use cases |
| Telegram | Mobile-first teams |
| Microsoft Teams | Enterprise teams |
| Gmail | Email-only workflows |
| WhatsApp Business | Customer-facing |
| Google Chat | Google Workspace teams |
| Microsoft Outlook | Microsoft-heavy orgs |

### 5.4 HITL Message Configuration
Use `$tool` variable to build approval message:
```javascript
// $tool.name = tool node name on canvas
// $tool.parameters = what AI wants to pass to the tool

`AI wants to call: ${$tool.name}
Parameters:
${JSON.stringify($tool.parameters, null, 2)}

Approve or Deny?`
```

### 5.5 Setup Pattern
```
AI Agent Node
├── AI Model Sub-node
├── Human Review Step     ← new sub-node type
│   ├── Slack approval channel config
│   └── Tool 1 (Gmail — Send) ← risky tool, requires approval
│   └── Tool 2 (DB — Delete)  ← risky tool, requires approval
└── Tool 3 (Calculator)   ← no approval needed, direct
```

### 5.6 System Prompt Best Practices for HITL
Include in system prompt:
```
You have access to several tools. Some tools require human approval:
- SendEmail: requires approval before sending
- DeleteRecord: requires approval before deleting
When a tool call is denied by the human reviewer, acknowledge the denial and 
ask the user if they'd like to try a different approach.
```

---

## 6. MCP (Model Context Protocol) Integration

### 6.1 Two Distinct MCP Systems

**System 1: Instance-Level MCP Server**
- Configured in Settings → MCP
- Exposes ALL "MCP-available" workflows as tools
- Single endpoint for all AI clients to connect to
- Authentication: OAuth2 or Bearer token
- Endpoint: `https://<domain>/mcp-server/http`

**System 2: MCP Server Trigger Node**
- Per-workflow MCP server (each workflow gets its own MCP endpoint)
- More isolated, workflow-specific
- Useful for exposing a specific capability to a specific AI client

### 6.2 Complete MCP Tool API (Instance-Level)

**Workflow Management Tools:**
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `search_workflows` | Search/list workflows | query, projectId, limit, tags, active |
| `get_workflow_details` | Get workflow config | workflowId |
| `execute_workflow` | Run a workflow | workflowId, mode, inputType, inputData |
| `get_execution` | Get execution result | executionId |
| `test_workflow` | Test without triggers | workflowId, inputData (pins trigger) |
| `prepare_test_pin_data` | Get JSON schemas for pinning | workflowId |
| `publish_workflow` | Make workflow live | workflowId |
| `unpublish_workflow` | Remove from production | workflowId |

**Workflow Builder Tools (AI workflow creation):**
| Tool | Description |
|------|-------------|
| `get_sdk_reference` | Get SDK docs for writing workflow code |
| `search_nodes` | Find node IDs by service/function name |
| `get_node_types` | Get TypeScript types for specific nodes |
| `get_suggested_nodes` | Get curated node recommendations by category |
| `validate_workflow` | Validate SDK code before creating |
| `create_workflow_from_code` | Create workflow from validated SDK code |
| `update_workflow` | Update existing workflow from code |
| `archive_workflow` | Archive/hide a workflow |

**Organization Tools:**
| Tool | Description |
|------|-------------|
| `search_projects` | Find projects | 
| `search_folders` | Find folders in project |

**Data Table Tools:**
| Tool | Description |
|------|-------------|
| `search_data_tables` | Find data tables |
| `get_data_table_schema` | Get table column schema |
| `get_data_table_rows` | Query table rows |
| `create_data_table_row` | Insert new row |
| `update_data_table_row` | Update existing row |
| `delete_data_table_row` | Delete row |

### 6.3 Execute Workflow Tool — Input Types
```typescript
{
  workflowId: string;
  mode: "manual" | "production";  // manual=draft, production=published
  inputType: 
    "chat" |     // { message: string } → Chat Trigger node
    "form" |     // { formData: {} } → Form Trigger node
    "webhook";   // { body: {}, headers: {} } → Webhook Trigger node
  inputData: object;  // Data matching the inputType
}
```

### 6.4 Test Workflow Tool (Critical Feature)
`test_workflow` bypasses credential checks for:
- Trigger nodes (pinned with provided test data)
- Credential-requiring nodes (skipped/mocked)
- HTTP Request nodes (configurable)

Logic nodes (IF, Switch, Code, Merge, Transform) run normally with real logic.

**Use case:** CI/CD testing of workflow logic without real credentials in test environment.

### 6.5 MCP Authentication Setup for FlowHolt

**Bearer Token Auth:**
```bash
curl -X POST https://yourdomain.com/mcp-server/http \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'
```

**Claude Desktop integration:**
```json
{
  "mcpServers": {
    "flowholt": {
      "url": "https://yourdomain.com/mcp-server/http",
      "auth": {
        "type": "bearer",
        "token": "your-token-here"
      }
    }
  }
}
```

---

## 7. AI Code Generation (Code Node AI Tab)

### 7.1 AI Code Tab
The Code node has an **AI** tab where users can:
- Describe what they want in natural language
- AI generates the JavaScript/Python code
- User can edit the generated code before running
- AI understands the current node's input schema (from pinned data)

**FlowHolt Copilot integration:**
- When a Code node is selected, Copilot panel has "Generate Code" option
- User describes transformation in plain English
- Copilot calls LLM with node's input schema + user description
- Generates complete Code node function

### 7.2 AI Transform Node
A simplified alternative to Code node:
- User describes the transformation in plain English
- No code visible — AI handles it invisibly
- Uses OpenAI/Claude under the hood
- Best for: simple data reshaping, field mapping, text processing
- Not for: complex multi-step logic, error handling, external calls

---

## 8. Chat Interface Integration

### 8.1 Chat Trigger Node
```typescript
{
  mode: "hostedChat" | "webhook";  // hostedChat = n8n-provided UI
  allowedOrigins: string;          // CORS origins for embed
  initialMessages: string[];       // Greeting messages
  responseMode: "responseNode" | "lastNode";
  // responseNode: only responds when explicit Response node is hit
  // lastNode: responds with last node's output
}
```

### 8.2 Public Chat Interface
When `mode = "hostedChat"`:
- n8n generates a public URL: `https://<domain>/form/<workflowId>/chat`
- User-facing chat widget available at this URL
- Can be embedded as iframe in other websites
- Mobile-responsive chat interface

### 8.3 Streaming Responses
AI Agent + Chat Trigger can stream responses:
- Token-by-token streaming visible in chat UI
- User sees text appearing as AI generates it
- Requires SSE (Server-Sent Events) support in backend

---

## 9. FlowHolt AI Implementation Checklist

### Agent Nodes:
- [x] AI Agent node (basic)
- [x] Basic LLM Chain
- [ ] Retrieval QA Chain
- [ ] Summarization Chain
- [ ] Text Classifier Chain (route output based on classification)
- [ ] Sentiment Analysis Chain

### LLM Sub-nodes:
- [x] OpenAI Chat Model
- [x] Anthropic Chat Model
- [x] Google Gemini Chat Model
- [x] Groq Chat Model
- [ ] Azure OpenAI
- [ ] Mistral Cloud
- [ ] Ollama (local)
- [ ] Cohere

### Memory Sub-nodes:
- [x] Simple Buffer Memory
- [ ] Window Buffer Memory
- [ ] Postgres Chat Memory
- [ ] Redis Chat Memory
- [ ] Zep Memory

### Tools Sub-nodes:
- [x] HTTP Request Tool
- [x] Code Execution Tool
- [ ] Calculator Tool
- [ ] SerpAPI Tool
- [ ] Wikipedia Tool
- [ ] Vector Store QA Tool
- [x] Custom Workflow Tool

### Vector Stores:
- [ ] Simple Vector Store (in-memory)
- [ ] Supabase Vector Store ← PRIORITY (pgvector)
- [ ] Pinecone
- [ ] Qdrant
- [ ] Weaviate

### Document Loaders:
- [x] Default Data Loader
- [ ] GitHub Document Loader
- [ ] S3 Document Loader
- [ ] Notion Document Loader

### Text Splitters:
- [ ] Character Text Splitter
- [ ] Recursive Character Text Splitter ← PRIORITY
- [ ] Token Text Splitter

### Embeddings:
- [x] OpenAI Embeddings
- [ ] Google Vertex AI Embeddings
- [ ] Cohere Embeddings
- [ ] Ollama Embeddings

### Human-in-Loop:
- [ ] HITL tool review step
- [ ] Approval via Slack integration
- [ ] $tool.name / $tool.parameters variables

### MCP:
- [x] Instance-level MCP server (basic)
- [ ] Full MCP tool API (18+ tools)
- [ ] MCP Server Trigger node (per-workflow)
- [ ] OAuth2 auth flow for MCP

### RAG:
- [ ] End-to-end RAG workflow template
- [ ] Supabase vector store integration
- [ ] Multi-query retriever
- [ ] Contextual compression retriever
