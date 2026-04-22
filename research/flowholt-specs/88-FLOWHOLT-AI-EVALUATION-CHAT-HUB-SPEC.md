# FLOWHOLT SPEC 88 — AI Evaluations, Chat Hub, Templates & Patterns
> Source: n8n docs `advanced-ai/evaluations/`, `advanced-ai/chat-hub.md`, `advanced-ai/examples/`, `workflows/templates.md`, `workflows/streaming.md`
> Sprint: 89 | Status: Research Complete

---

## 1. Overview

This spec covers FlowHolt's AI-specific subsystems: the evaluation framework for testing AI workflows, the Chat Hub for centralized AI interaction, the $fromAI() dynamic AI parameter system, streaming output support, the workflow template library API, and key AI patterns (chains, agents, memory, tools, human-in-the-loop).

---

## 2. AI Workflow Evaluation System

### 2.1 Why Evaluations?

AI responses are non-deterministic. A small prompt change can degrade accuracy across thousands of executions. The evaluation system lets teams:
1. **Pre-deployment**: visually verify AI outputs look correct (light evaluation)
2. **Post-deployment**: score AI performance with metrics over large datasets (metric-based evaluation)

### 2.2 Light Evaluations — Complete Spec

**Purpose**: Development-time evaluation with a small curated dataset. No metrics — just visual comparison of expected vs actual output.

**Required workflow structure:**
```
[EvaluationTrigger node]
         ↓
[Your AI workflow logic]
         ↓
[Evaluation node — "Set outputs" action]
         ↓
[Write back to dataset]
```

**EvaluationTrigger node:**
- Sets "evaluation mode" for the workflow
- Takes dataset (Data Table or Google Sheets) as input
- Provides `$json.expected_output` (and other columns as) to downstream nodes
- Has "Evaluate all" button → runs the workflow once per row

**Evaluation node — "Set outputs" action:**
```javascript
// In Evaluation node output configuration:
{
  outputs: [
    {
      name: "Actual Response",        // shown in comparison
      value: $("AI Agent").last().json.output
    }
  ]
}
```

**Dataset schema (Data Table or Google Sheets):**
| Column | Description |
|--------|-------------|
| Any input columns | Context for the AI (prompt, question, input data) |
| Expected output columns | What the correct answer should be |
| Output columns (written back) | Actual outputs from the workflow |
| Metric columns (written back) | Scores (metric-based only) |

**Workflow after light evaluation runs:**
- n8n shows side-by-side: expected output vs actual output per row
- No numerical scores — just visual comparison
- User manually judges quality

### 2.3 Metric-Based Evaluations — Complete Spec

**Purpose**: Post-deployment scoring with metrics. Requires large datasets, outputs numerical quality scores.

**Availability:** Pro/Enterprise Cloud; Enterprise self-hosted; Community gets 1 workflow only.

**Required additional node:** "Evaluation node" with "Check if evaluating" action as a gate:

```
[EvaluationTrigger node]
        ↓
[Check if evaluating gate]
        ↓ (evaluating branch)          ↓ (production branch)
[Run metrics logic]           [Normal workflow continues]
```

The "Check if evaluating" operation prevents metric computation logic from running in production — only runs during evaluation.

### 2.4 Built-in Evaluation Metrics

| Metric | Type | Range | Description |
|--------|------|-------|-------------|
| **Correctness** | AI-judged | 1–5 | LLM rates factual correctness of response |
| **Helpfulness** | AI-judged | 1–5 | LLM rates how helpful the response is |
| **String Similarity** | Algorithmic | 0–1 | Edit distance (Levenshtein) vs expected output |
| **Categorization** | Exact match | 0 or 1 | Response exactly matches expected category |
| **Tools Used** | Binary | 0 or 1 | Whether the agent used expected tools |

**Metric configuration:**
- Each metric needs: name, type, expected output column, actual output column
- AI-judged metrics: specify LLM model + prompt template for judging
- String Similarity: specify similarity threshold
- Categorization: specify allowed values list

### 2.5 Custom Metrics

```
Evaluation node → "Set Metrics" operation → Custom Metrics
```

```javascript
// Custom metric in Evaluation node:
{
  metrics: [
    {
      name: "Response Length Score",
      value: (() => {
        const length = $("AI Agent").last().json.output.length;
        return length > 100 && length < 500 ? 1.0 : 0.0;  // 0-1 scale
      })()
    }
  ]
}
```

### 2.6 Evaluation Dataset Sources

| Source | Notes |
|--------|-------|
| n8n Data Tables | Native, no setup required |
| Google Sheets | Requires Google credentials |

**Dataset size guidelines:**
- Light evaluation: 5-20 rows (visual comparison only)
- Metric-based evaluation: 50-500 rows (statistical significance)

### 2.7 FlowHolt Evaluation System — Implementation Plan

```
Feature: Evaluation Suite

Phase 1 — Light Evaluation:
  - EvaluationTrigger node (reads from FlowHolt Data Table)
  - Evaluation node with "Set outputs" action
  - "Evaluate All" button in workflow header
  - Results view: side-by-side expected vs actual
  - Run one-at-a-time with progress indicator
  - Pass row as $json to workflow, collect outputs, write back

Phase 2 — Metric-Based:
  - 5 built-in metrics (Correctness, Helpfulness, Similarity, Categorization, Tools Used)
  - AI-judged metrics: call secondary LLM with judge prompt
  - Score aggregation view (avg, min, max per metric)
  - Trend charts (score over time / across prompt versions)
  - "Check if evaluating" node gate
  - Enterprise tier gate

UI:
  - Evaluations tab in workflow editor
  - Dataset picker (Data Table or Google Sheets)
  - Metrics configuration panel
  - Results grid: rows × metrics, color-coded scores
  - Export results to CSV

Database:
  - evaluation_runs table: id, workflow_id, dataset_id, created_at
  - evaluation_results table: run_id, row_index, metric_name, score, expected, actual
```

---

## 3. Chat Hub

### 3.1 What Is Chat Hub?

Chat Hub is a centralized AI chat interface separate from the workflow Studio. It gives non-technical users a single place to chat with AI agents without needing workflow access.

**Navigation:** Main sidebar → Chat icon (separate from Workflows/Studio)

### 3.2 Chat User Role

A new role for users who should only use AI agents, not build/edit workflows:

| Permission | Chat User |
|-----------|-----------|
| View Chat Hub | ✅ |
| Start chat conversations | ✅ |
| View workflows | ❌ |
| Edit workflows | ❌ |
| View credentials | ❌ |
| View executions | ❌ |

**Availability**: Starter plan and above

### 3.3 Types of Agents in Chat Hub

**Personal Agents** (created by individual users):
```
Configuration:
  - Name & description
  - System prompt (persona + instructions)
  - Model selection (from admin-allowed providers)
  - Tools (from available tool catalog)
  - Knowledge files — ❌ NOT supported in personal agents

Access: Only visible to creator
```

**Workflow Agents** (powered by actual workflows):
```
Requirements for workflow to appear in Chat Hub:
  1. Has Chat Trigger node with "Make available in n8n Chat" = true
  2. Has AI Agent node with streaming enabled
  3. Workflow is active (not test mode)

Access: Visible to all users with Chat access in the project
```

### 3.4 Admin Controls

```
Settings → AI → Chat Hub section:
  - Enable/disable Chat Hub globally
  - Available providers: toggle individual LLM providers on/off
  - Default credentials: specify which API key to use
  - "Prevent users adding their own models": toggle
    - OFF: users can paste their own API keys for personal agents
    - ON: only admin-configured models available
```

### 3.5 FlowHolt Chat Hub — Implementation Plan

```
Feature: AI Chat Hub

UI Components:
  - Chat Hub page (full-screen, separate from Studio)
  - Left sidebar: agent list (personal + workflow agents)
  - Main area: chat conversation with message history
  - Input: text + optional file attachments
  - Streaming: token-by-token response display (streaming SSE)

Chat User Role:
  - New role: "chat_user" in roles table
  - Can only access Chat Hub page
  - Cannot access: Workflows, Studio, Vault, Executions, Settings

Personal Agents:
  - Create modal: name, description, system prompt, model, tools
  - Tool catalog: only pre-built FlowHolt tools (web search, calculator, etc.)
  - Stored in: personal_agents table
  - Only visible to creator

Workflow Agents:
  - workflow_agent flag on Chat Trigger node config
  - Appears automatically in Chat Hub when workflow is active
  - Runs actual workflow in background when user sends message
  - Response streams back via SSE

Admin Settings:
  - Settings page → AI tab → Chat Hub section
  - Toggle providers, set default credentials
  - Feature flag: allow/deny user-provided API keys
```

---

## 4. $fromAI() Dynamic Parameters

### 4.1 What Is $fromAI()?

`$fromAI()` is a special function that lets an AI agent **dynamically provide parameter values** to tool nodes at runtime. Instead of hard-coding a tool's parameters, you mark them with `$fromAI()` and the agent decides the values based on the conversation context.

**Only works in:** Tool nodes connected to an AI Tools Agent. NOT available in Code node, regular nodes, or sub-nodes of non-agent workflows.

### 4.2 Function Signature

```javascript
$fromAI(key, description?, type?, defaultValue?)
```

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `key` | ✅ | String | Identifier (1-64 chars, `a-zA-Z0-9_-`) |
| `description` | ❌ | String | Explains what this param is — helps AI make better decisions |
| `type` | ❌ | String | `"string"` (default), `"number"`, `"boolean"`, `"json"` |
| `defaultValue` | ❌ | any | Fallback if AI doesn't provide a value |

### 4.3 Usage Examples

```javascript
// Simple: AI decides the search query
$fromAI("searchQuery", "What the user wants to search for")

// With type hint: AI provides a boolean
$fromAI("includeImages", "Should image results be included?", "boolean", false)

// JSON type: AI provides structured object
$fromAI("filterOptions", "Filter options for the database query", "json")

// In partial expression: AI fills in part of a string
`Subject: {{ $fromAI("emailSubject", "Subject line for the email") }}`

// In URL: AI decides which endpoint to call
`https://api.example.com/{{ $fromAI("resourceType", "Type: users, orders, or products") }}`
```

### 4.4 Stars Button in UI

n8n provides a "stars" (✨) button next to tool node parameter fields:
- Clicking it auto-generates the `$fromAI(...)` expression
- Pre-fills `key` from the field name
- Inserts description based on field label
- User can then customize description and type

### 4.5 FlowHolt $fromAI Implementation Plan

```
Runtime:
  - $fromAI() is a special marker function, not executed at parse time
  - When AI Tools Agent runs:
    1. Inspect tool node parameters for $fromAI() markers
    2. Build a "tool schema" describing what parameters the tool needs
    3. Include schema in LLM tool_call definition
    4. LLM returns tool_call with argument values
    5. Map argument values back to $fromAI() positions
    6. Execute tool with resolved parameter values

UI:
  - Stars button (✨) on tool node parameter fields
  - Clicking generates: $fromAI("fieldName", "description of field")
  - Expression editor shows "$fromAI" in teal/accent color to distinguish
  - Tooltip: "This value will be provided by the AI at runtime"

Validation:
  - Key format: 1-64 chars, [a-zA-Z0-9_-] only
  - Cannot use $fromAI() outside of tool node context
  - Show warning if used in non-tool node: "⚠️ $fromAI() only works in tool nodes"
```

---

## 5. Streaming AI Responses

### 5.1 Requirements for Streaming

Streaming requires **both** the trigger AND the AI node to support it:

| Component | Requirement |
|-----------|-------------|
| Trigger | Chat Trigger OR Webhook with Response Mode = "Streaming" |
| AI Node | AI Agent with streaming enabled |
| Both must be configured | If only one is set, streaming doesn't work |

### 5.2 Chat Trigger Streaming

```
Chat Trigger node → Mode = "Streaming"
  ↓
AI Agent node → Streaming = enabled
  ↓  
Response streams token-by-token to chat UI
```

### 5.3 Webhook Streaming

```
Webhook node → Response Mode = "Streaming"
  ↓
AI Agent node → Streaming = enabled
  ↓
"Respond to Webhook" node (not needed when streaming)
  ↓
HTTP response streams as SSE (text/event-stream)
```

### 5.4 FlowHolt Streaming Implementation Plan

```
Backend:
  - Executor supports streaming mode detection
  - When execution is streaming:
    - Generator pattern for node output
    - Each token → Server-Sent Event
    - Event format: data: {"token": "hello", "done": false}\n\n
    - Final: data: {"token": "", "done": true}\n\n
  
FastAPI streaming endpoint:
  from fastapi.responses import StreamingResponse
  
  async def stream_execution(workflow_id, payload):
    async def generate():
      async for token in executor.run_streaming(workflow_id, payload):
        yield f"data: {json.dumps({'token': token})}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")

Frontend:
  - Chat UI reads SSE with EventSource
  - Renders tokens as they arrive (streaming effect)
  - Handles backpressure / slow responses
  - Shows typing indicator until first token

Node requirements:
  - LLM nodes must support streaming callback (pass onToken handler)
  - AI Agent node must propagate streaming from LLM to response
```

---

## 6. Workflow Templates Library

### 6.1 Custom Template Library API

n8n can connect to a custom template library server by setting:
```bash
N8N_TEMPLATES_HOST=https://api.yourtemplates.com
```

The host must implement these 7 endpoints exactly:

### 6.2 Template API Endpoints (must implement)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/templates/workflows/{id}` | GET | Single template (wrapped response) |
| `/workflows/templates/{id}` | GET | Single template (flat response) |
| `/templates/search` | GET | Search with `page`, `rows`, `category`, `search` |
| `/templates/collections/{id}` | GET | A curated collection |
| `/templates/collections` | GET | All collections |
| `/templates/categories` | GET | All categories |
| `/health` | GET | Health check — must return `{status: "ok"}` |

**CRITICAL: Two different `/templates/` response formats:**

```json
// /templates/workflows/{id} — WRAPPED (has 'workflow' key)
{
  "workflow": {
    "id": 1,
    "name": "My Template",
    "nodes": [...],
    "connections": {...}
  }
}

// /workflows/templates/{id} — FLAT (no 'workflow' wrapper key)
{
  "id": 1,
  "name": "My Template", 
  "nodes": [...],
  "connections": {...}
}
```

### 6.3 Template Object Schema

```typescript
interface Template {
  id: number;
  name: string;
  description: string;
  totalViews: number;
  createdAt: string; // ISO date
  user: {
    username: string;
  };
  nodes: Array<{
    type: string;        // e.g. "n8n-nodes-base.httpRequest"
    categories?: Array<{ id: number; name: string }>;
  }>;
  image: Array<{
    id: number;
    url: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
  }>;
  workflowInfo: {
    nodeCount: number;
    notesCount: number;
  };
  workflow: {
    nodes: Node[];
    connections: Connections;
    // full workflow definition
  };
}
```

### 6.4 Search Endpoint Parameters

```
GET /templates/search?page=1&rows=20&category=5,12&search=slack+notification
```

| Param | Type | Description |
|-------|------|-------------|
| `page` | Number | Page number (1-based) |
| `rows` | Number | Results per page |
| `category` | String | Comma-separated category IDs to filter |
| `search` | String | Free-text search query |

**Response format:**
```json
{
  "totalWorkflows": 142,
  "workflows": [Template, Template, ...]
}
```

### 6.5 FlowHolt Template Library Plan

```
Backend (template server — separate service or embedded):
  - Templates stored in templates table
  - Implement all 7 endpoints matching n8n's expected schema
  - n8n-compatible wrapper (can import n8n templates directly)
  - Categories: HTTP, AI/LLM, Data Transform, Database, Communication, etc.

FlowHolt-specific additions:
  - "Official" vs "Community" template badges
  - Featured templates carousel on homepage
  - "Try template" → clones into user's workspace
  - Template preview (static image + node list)
  - Template rating/upvote system

FLOWHOLT_TEMPLATES_HOST env var:
  - Points to FlowHolt's own template API
  - Community can also self-host their own template library
```

---

## 7. Agents vs Chains vs Basic LLM

### 7.1 Decision Matrix

| Feature | Basic LLM | Chain | Agent |
|---------|-----------|-------|-------|
| Uses LLM | ✅ | ✅ | ✅ |
| Uses memory | ❌ | ❌ | ✅ |
| Uses tools | ❌ | ❌ | ✅ |
| Runs multiple times | ❌ | ❌ | ✅ |
| Predictable # of LLM calls | ✅ | ✅ | ❌ |
| Best for | Single-turn Q&A | Docs Q&A / Summarize | Conversational / Multi-step |

**Rule: If the user needs conversation or multi-step decisions → always use Agent, not Chain.**

### 7.2 Chain Types

**Basic LLM Chain**: `[LLM node]` — single prompt → single response. No memory, no tools.

**Q&A Chain (RetrievalQA)**: 
```
[Input] → [Retriever] → [Context] → [LLM] → [Response]
```
Fetches relevant documents from vector store, then answers using context.

**Summarization Chain**:
- Map-reduce approach for long documents
- First summarizes chunks, then summarizes summaries
- Works on binary files (PDF, DOCX) via document loaders

### 7.3 Memory Types — Complete Catalog

| Memory Node | Backend | Scope | Notes |
|-------------|---------|-------|-------|
| **Simple Memory** | In-memory | Single execution session | Cleared on workflow reload |
| **Redis Chat Memory** | Redis | Persistent, cross-session | Good for production |
| **Postgres Chat Memory** | PostgreSQL | Persistent, cross-session | Good for production |
| **Motorhead Memory** | Motorhead server | Managed | Needs separate Motorhead instance |
| **Xata Memory** | Xata DB | Persistent | Xata account required |
| **Zep Memory** | Zep server | Advanced (auto-summary, facts) | Best for long-term memory |
| **Chat Memory Manager** | Any of above | Custom management | Inject messages, check size |

**Chat Memory Manager special operations:**
- Insert messages at specific position in memory
- Check total message count/size
- Replace entire memory
- Get messages without running AI

### 7.4 Tools — Complete Catalog

| Tool Node | Description |
|-----------|-------------|
| **Wikipedia** | Query Wikipedia articles |
| **SerpAPI** | Google search results |
| **WolframAlpha** | Math and computation |
| **Calculator** | Basic arithmetic |
| **HTTP Request Tool** | Call any external API |
| **Custom Code Tool** | Run arbitrary JS/Python |
| **Call n8n Workflow Tool** | Trigger another workflow as a tool |
| **Vector Store Tool** | Search vector database |
| **Think Tool** | Agent "thinks" before responding |
| **Wikipedia Tool** | Wikipedia search |

### 7.5 Human Fallback Pattern

When AI cannot confidently answer, escalate to a human:

```
[Chat Trigger]
     ↓
[AI Agent]
     ↓
  Decides to use "Escalate to Human" tool
     ↓
[Call n8n Workflow Tool → "human-review" workflow]
     ↓
  Sends to Slack/email for human review
     ↓
[Wait node] ← human responds via webhook
     ↓
[Respond back to original chat]
```

**Implementation in FlowHolt:**
- "Escalate to Human" tool node
- Triggers a separate "human review" workflow
- Human review workflow sends notification + unique reply URL
- Wait node with `$execution.resumeUrl` pauses the AI workflow
- Human responds → workflow resumes with human answer

### 7.6 Agent Chain Routing Pattern

Use a Switch node to route between agent (complex) and chain (simple) based on query type:

```
[Input]
   ↓
[Switch node — classify query type]
   → "simple" → [Basic LLM Chain]
   → "complex" → [Tools Agent]
   → "search" → [RetrievalQA Chain]
```

**Classification example:**
```javascript
// Switch node: match rule 1
$json.query.includes("?") || $json.query.split(" ").length > 10
// → "complex" branch → Agent
```

### 7.7 API Workflow Tool Pattern

Expose a sub-workflow as a tool that the main agent can call:

```
Main workflow:
  [Chat Trigger] → [AI Tools Agent] ← connects to ↓
                                      [Call n8n Workflow Tool]
                                              ↓ (triggers)
Sub-workflow:
  [Execute Workflow Trigger] → [API Call] → [Transform] → [Return]
```

This modular pattern allows reusing workflow logic as AI tool capabilities.

---

## 8. AI Code Generation in Code Node

### 8.1 How It Works

- **"Ask AI" tab** in Code node → type description in plain text
- AI generates JavaScript code (NOT Python)
- Sends only the schema of input data (not actual values) to GPT
- Generated code overwrites existing code
- Cloud only feature (n8n Cloud)

### 8.2 Best Practices for AI Code Generation

```
Write descriptions like step-by-step instructions:
  ✅ "Map the items array. For each item, create an object with:
      - name (from item.json.name)
      - email (from item.json.contact.email)
      - score (item.json.score * 100)"

  ❌ "Transform the data"

Reference specific field names:
  ✅ "Use item.json.user.address.city"
  ❌ "Use the city field"
  
Use dot notation (not bracket):
  ✅ item.json.firstName
  ❌ item.json["firstName"]
```

### 8.3 FlowHolt AI Code Generation Plan

```
Feature: AI-assisted Code node

Implementation:
  - "Ask AI" tab in Code node editor panel
  - Text input: "Describe what you want the code to do"
  - System prompt: include input schema (field names + types)
  - Call LLM (GPT-4o or Claude) with user description + schema
  - Stream generated code into Monaco editor
  - Show diff view: old code ↔ new code
  - User can: Accept, Reject, or Edit before accepting

Available on: Pro plan and above (not Free tier)
Models used: GPT-4o-mini for code gen (low cost)
Limitation: Only generates JavaScript (not Python)
```

---

## 9. Workflow Export/Import — Data Safety

### 9.1 What Gets Exported

```json
{
  "name": "My Workflow",
  "nodes": [...],
  "connections": {...},
  "settings": { "executionOrder": "v1" },
  "meta": {
    "instanceId": "abc123"
  }
}
```

**Included in export:**
- All nodes and their configurations
- All connections between nodes
- Node credentials (names and IDs — NOT values)
- Workflow settings

**NOT included:**
- Credential values (encrypted in vault)
- Execution history
- Pinned data (stored separately in workflow JSON)
- Variables

### 9.2 Security Warning: HTTP Request Nodes

**CRITICAL**: When importing workflows from cURL commands, n8n stores headers (including auth headers like `Authorization: Bearer token`) in the HTTP Request node config. These are exported in plain text.

```
⚠️ Before sharing a workflow:
   HTTP Request node → Headers → Remove any Authorization headers
   Replace with: credential reference instead of header values
```

### 9.3 Import Methods

| Method | Description |
|--------|-------------|
| Copy-paste | Ctrl+C on selected nodes → Ctrl+V in another workflow |
| Import from file | Upload `.json` file |
| Import from URL | Paste URL to a JSON workflow file |
| CLI: Import | `n8n import:workflow --input=file.json` |
| CLI: Export | `n8n export:workflow --id=<id> --output=file.json` |

### 9.4 FlowHolt Export/Import Plan

```
Export:
  - Sanitize before export: scan for inline credential values in HTTP nodes
  - Warn user: "This workflow may contain sensitive headers. Review before sharing."
  - Option: "Sanitize export" → replace credential values with placeholders
  - Format: JSON (compatible with n8n format where possible)

Import:
  - Accept: JSON file, URL, clipboard paste
  - Scan imported workflow for security issues
  - Report: "Found Authorization header in HTTP Request node #3"
  - Option: replace found credentials with credential references

Template Import:
  - From FlowHolt template library → "Import" button
  - From n8n template library → "Import n8n template" (compatibility layer)
  - Credential mapping: if template uses credentials, prompt user to map to their own
```

---

## 10. FlowHolt AI Architecture Summary

```
FlowHolt AI Execution Stack:
─────────────────────────────────────────────────────────

[AI Agent node]
  ├─ Model: GPT-4o / Claude / Gemini / Local Ollama
  ├─ Memory: Simple | Redis | Postgres | Zep
  ├─ Tools: [Tool nodes connected to agent]
  │    ├─ HTTP Request Tool    (call external APIs)
  │    ├─ Code Tool            (run arbitrary code)
  │    ├─ FlowHolt Workflow Tool (trigger sub-workflows)
  │    ├─ Web Search Tool       (SerpAPI / Brave)
  │    └─ Custom Tool           (user-defined)
  └─ Output: streaming tokens → Chat UI / Webhook response

[Evaluation System]
  ├─ Light eval: EvaluationTrigger → Set Outputs → visual diff
  └─ Metric eval: same + Metrics node + scoring LLM

[Chat Hub]
  ├─ Personal Agents: simple system prompt + model + tools
  └─ Workflow Agents: full workflow power via Chat Trigger

[Streaming]
  ├─ Chat Trigger → streaming chat response
  └─ Webhook (streaming mode) → SSE HTTP response

Gap Analysis — FlowHolt vs n8n AI:
  ✅ Basic AI Agent node (implemented)
  ✅ Tool node wiring (implemented)
  ⚠️ Memory nodes (partial — need Redis/Postgres/Zep backends)
  ⚠️ Streaming (partial — needs proper SSE)
  ❌ Evaluation system (not implemented)
  ❌ Chat Hub (not implemented)
  ❌ $fromAI() (not implemented)
  ❌ AI code generation in Code node (not implemented)
  ❌ Human fallback pattern (not implemented)
  ❌ Custom template library API (not implemented)
```
