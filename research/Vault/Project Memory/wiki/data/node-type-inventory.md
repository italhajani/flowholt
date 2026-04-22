---
title: Node Type Inventory
type: data
tags: [nodes, triggers, flow-control, data-transform, integration, ai, utility, n8n, flowholt]
sources: [plan-file-05, n8n-docs, n8n-domain-7-deep-read]
updated: 2026-04-16
---

# Node Type Inventory

Complete catalog of node types for FlowHolt, cross-referenced with n8n's core node system (Domain 7 deep read). Each entry includes current FlowHolt status and design signals.

---

## Trigger Nodes

Nodes that start a workflow. Every workflow must begin with exactly one trigger.

| Node | What it does | n8n equivalent | FlowHolt status |
|------|-------------|----------------|-----------------|
| **Manual Trigger** | Start workflow manually from Studio | Manual Trigger | ✅ Implemented |
| **Webhook Trigger** | Receive HTTP requests from external services | Webhook | ✅ Likely implemented |
| **Schedule Trigger** | Run on time intervals or cron expressions | Schedule Trigger | ✅ Implemented (scheduler.py) |
| **Form Trigger** | Generate a web form; trigger on submission | Form Trigger | ❌ Missing |
| **Chat Trigger** | Start a conversational workflow | Chat Trigger | ❌ Missing (need chat-style trigger) |
| **Email Trigger** | Start on incoming email | Email Trigger | ❌ Missing |
| **SSE Trigger** | Receive Server-Sent Events from external server | SSE Trigger | ❌ Missing |
| **MCP Server Trigger** | Expose workflows as MCP tools to AI agents | MCP Trigger | ❌ Missing |
| **Sub-workflow Trigger** | Entry point when called by parent workflow | Execute Workflow Trigger | ⚠️ Partial |
| **Error Trigger** | Start when a linked workflow fails | Error Trigger | ❌ Missing — important for error handling |

### Schedule Trigger — Key Design Details (from n8n)
- Interval types: seconds, minutes, hours, days, weeks, months, or custom cron
- Multiple trigger rules per node (e.g., "run weekdays at 9am AND Sundays at 6am")
- Timezone-aware (workspace timezone or per-workflow override)
- Variables evaluated at publish time, not execution time
- Must publish workflow for trigger to be active

### Webhook Trigger — Key Design Details
- Methods: GET, POST, PUT, PATCH, DELETE, HEAD
- Auth: Basic / Header / JWT / None
- Response timing: Immediate (fire and forget) OR After workflow finish (sync)
- Test URL vs. Production URL separation
- CORS handling, IP whitelist, 16MB payload limit
- Streaming support for AI agent integration

---

## Flow Control Nodes

Nodes that direct which path the execution takes.

| Node | What it does | n8n equivalent | FlowHolt status |
|------|-------------|----------------|-----------------|
| **If / Branch** | Route to true/false based on condition | IF node | ✅ Implemented |
| **Switch / Router** | Multi-way routing by rules or expressions | Switch | ⚠️ Partial — expression mode may be missing |
| **Filter** | Remove non-matching items (no false branch) | Filter | ✅ Implemented |
| **Loop / Batch** | Iterate over items in configurable batch sizes | Split in Batches | ⚠️ Partial — conditional reset/loop termination may be missing |
| **Merge / Join** | Combine data from multiple branches | Merge | ⚠️ Partial — advanced modes (SQL-style join, fuzzy) may be missing |
| **Wait / Pause** | Pause execution until time, webhook, or form | Wait | ✅ Partial (delay + human pause) |
| **Stop & Error** | Halt and throw custom error | Stop and Error | ⚠️ Partial |

### If Node — Key Design Details
- Comparison data types: String, Number, Date & Time, Boolean, Array, Object
- ~14 comparison operators per type (equals, contains, starts with, is empty, regex, etc.)
- AND / OR logic combining (not mixed within one group)
- Two output branches: **true** and **false**
- Legacy v0 quirk: Merge node after If could execute both branches — avoid in FlowHolt

### Switch Node — Key Design Details
- **Rules mode**: define conditions + named outputs; items go to first matching output
- **Expression mode**: numeric index returned; output count set manually
- Optional fallback output for unmatched items
- "Send to all matching outputs" option (multiple branches can receive same item)
- Case-insensitive option

### Merge Node — Key Design Details (5 strategies)
1. **Append** — combine all items sequentially
2. **Combine by matching fields** — inner/left/right/outer join by key field(s)
3. **Combine by position** — merge item N from input1 with item N from input2
4. **Combine all combinations** — cross-product
5. **SQL Query** — actual SQL LEFT/RIGHT/INNER JOIN logic
6. **Choose Branch** — output items from only one input (chosen by condition)

Clash handling: prefer input 1, prefer input 2, mix (per field), or output both.

### Loop (Split in Batches) — Key Design Details
- Two outputs: **loop** (current batch) and **done** (after all batches)
- Configurable batch size
- **Reset option**: reinitialize loop when expression evaluates to true — enables pagination patterns:
  ```
  Run loop → Check "has next page" → if yes, fetch more items → reset loop → continue
  ```
- Provides `$runIndex` and `noItemsLeft` context variables

---

## Data Transformation Nodes

Nodes that reshape, filter, or enrich data.

| Node | What it does | n8n equivalent | FlowHolt status |
|------|-------------|----------------|-----------------|
| **Set / Assign Fields** | Create or modify fields in data | Set (Edit Fields) | ✅ Implemented |
| **Split Out / Explode** | Convert array field into separate items | Split Out | ⚠️ Partial |
| **Aggregate / Group** | Combine items into aggregated item | Aggregate | ⚠️ Partial |
| **Summarize / Pivot** | Group-by + aggregation functions | Summarize | ❌ Missing |
| **Compare Datasets** | Diff two data streams, 4-way output | Compare Datasets | ❌ Missing |
| **Transform / Map** | General data transformation | (multiple) | ✅ Partial |
| **Code / Script** | Custom JS or Python execution | Code | ✅ Implemented (sandbox.py) |

### Set Node — Key Design Details
- **Manual Mapping mode**: drag-drop from INPUT panel → auto-generate expressions. This is the primary UX.
- **JSON Output mode**: programmatic for arrays and nested structures
- Field sources: fixed value, expression, or drag-drop from previous node
- "Keep only set fields" → strips all other fields from output
- Dot notation for nested: `address.city` creates `{address: {city: ...}}`

### Summarize Node — Aggregation Methods
1. Sum
2. Average
3. Count
4. Min / Max
5. Append (list of values)
6. Concatenate (string join)
7. Count Unique

Supports group-by (split by field values). Output: one item per unique group combination.

### Code Node — Key Design Details
- Languages: JavaScript, Python (native runner in v1.111.0+)
- Modes: "Run Once for All Items" (receives `$input.all()`) OR "Run Once for Each Item" (receives `$json`)
- Built-ins: `$json`, `$input`, `$items`, `$nodeVersion`, `$workflow`, `$execution`, etc.
- External modules: Limited (cloud); unrestricted (self-hosted)
- Restrictions: No file system or HTTP access in code (use dedicated nodes)
- Console.log for debugging (visible in execution output)

---

## Integration Nodes

Nodes that communicate with external services.

| Node | What it does | n8n equivalent | FlowHolt status |
|------|-------------|----------------|-----------------|
| **HTTP Request** | Call any REST API | HTTP Request | ✅ Implemented |
| **Respond to Webhook** | Control webhook response payload | Respond to Webhook | ⚠️ Partial |
| **Execute Sub-workflow** | Call another workflow as subroutine | Execute Workflow | ⚠️ Partial |
| **Send Email** | Send email via SMTP/service | Email Send | ✅ Implemented (SMTP) |
| **Slack** | Send messages to Slack | Slack | ✅ Implemented (integration plugin) |
| **Airtable** | Read/write Airtable records | Airtable | ✅ Plugin |
| **Notion** | Read/write Notion pages | Notion | ✅ Plugin |
| **HTTP + OAuth2** | Call OAuth2-authenticated APIs | HTTP Request + OAuth2 | ⚠️ OAuth2 flow exists, wiring needed |

### HTTP Request Node — Key Design Details
- Auth types: Predefined (from vault/credentials) or Generic (Basic/Custom/Digest/Header/OAuth1/OAuth2/Query)
- Body types: Form-URLencoded, Multipart Form-Data, JSON, Binary File, Raw
- Pagination built-in: Parameter Update, Next URL patterns with `$pageCount`/`$response` variables
- Response format: Auto-detect, JSON, Text, File/Binary, Ignore
- Batching, timeout, proxy, SSL ignore options
- Curl command import for quick setup
- AI agent tool optimization mode (returns truncated response for context efficiency)

### Respond to Webhook — Key Design Details
- Response options: All Items / First Item / Binary File / JSON / JWT Token / No Data / Redirect / Text
- Custom response code + headers
- Streaming response support
- Only FIRST execution of this node in a workflow runs

---

## AI Nodes

Nodes specific to AI agent and LLM workflows. See [[wiki/concepts/ai-agents]] for full cluster node system.

| Node | What it does | n8n equivalent | FlowHolt status |
|------|-------------|----------------|-----------------|
| **AI Agent** | LLM-powered decision maker with tools | Agent (Tools Agent) | ⚠️ Partial — cluster node architecture needed |
| **LLM Chain** | Stateless prompt → LLM → output | Basic LLM Chain | ⚠️ Partial |
| **Information Extractor** | Extract structured JSON from text | Information Extractor | ❌ Missing |
| **Sentiment Analysis** | Classify sentiment (customizable) | Sentiment Analysis | ❌ Missing |
| **Text Classifier** | Multi-class text categorization | Text Classifier | ❌ Missing |
| **AI Transform** | AI-generated code for transformation | AI Transform | ❌ Missing (cloud feature) |
| **MCP Client** | Call tools on external MCP server | MCP Client | ❌ Missing |

### AI Transform — Key Design Details
- User writes natural language instruction (<500 chars)
- AI generates JavaScript transformation code
- Code is read-only in the node (copy to Code node to edit)
- Context-aware (understands workflow data types)
- Cloud-only feature at n8n

---

## Utility Nodes

Miscellaneous helper nodes.

| Node | What it does | n8n equivalent | FlowHolt status |
|------|-------------|----------------|-----------------|
| **Delay** | Wait for fixed duration | Wait (time) | ✅ Implemented |
| **Form** | Add pages to multi-step forms | Form | ❌ Missing |
| **Execution Data** | Save searchable metadata to execution | Execution Data | ❌ Missing |
| **Sticky Note** | Canvas annotation (not executed) | Sticky Notes | ❌ Missing |

---

## Node Priority Matrix

For FlowHolt's implementation roadmap:

### MUST-HAVE (Core Loop — without these FlowHolt is not viable)
1. Manual Trigger ✅
2. Webhook Trigger ✅
3. Schedule Trigger ✅
4. If / Branch ✅
5. Set / Assign Fields ✅
6. HTTP Request ✅
7. Code / Script ✅
8. Filter ✅
9. Merge / Join (at minimum Append mode) ⚠️

### HIGH VALUE (Most workflows need these)
10. Switch / Router ⚠️
11. Loop / Batch ⚠️
12. Split Out / Explode ⚠️
13. Aggregate / Group ⚠️
14. Wait / Pause ✅ (partial)
15. Stop & Error ⚠️
16. Respond to Webhook ⚠️
17. Execute Sub-workflow ⚠️
18. Error Trigger ❌ (critical for production error handling)

### NICE-TO-HAVE (Differentiating features)
19. Form Trigger + Form ❌
20. Chat Trigger ❌
21. AI Transform ❌
22. Summarize / Pivot ❌
23. Compare Datasets ❌
24. MCP Client / MCP Server Trigger ❌
25. Execution Data ❌

---

## Field Sensitivity Classes

For security-conscious field handling in node configuration:

| Class | Description | Examples | UI treatment |
|-------|-------------|----------|-------------|
| **Secret** | Credentials and keys | API key, password, token | Masked, stored in vault, never logged |
| **Template** | Expression-containing field | URL, body, params | Expression editor with `{{ }}` support |
| **Static** | Fixed values | Node name, operation type | Plain text input |
| **Reference** | Points to another resource | Workflow ID, credential ID | Dropdown selector |
| **Binary** | File data | File upload, attachment | File picker |

---

## Related Pages

- [[wiki/concepts/ai-agents]] — cluster node system for AI workflows
- [[wiki/concepts/expression-language]] — `{{ }}` expressions in node parameters
- [[wiki/concepts/execution-model]] — how nodes execute, item processing
- [[wiki/concepts/sub-workflows]] — Execute Sub-workflow pattern
- [[wiki/concepts/error-handling]] — Error Trigger and Stop & Error patterns
- [[wiki/data/implementation-roadmap]] — delivery order
