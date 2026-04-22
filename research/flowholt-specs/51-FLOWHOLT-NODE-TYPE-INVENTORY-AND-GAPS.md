# FlowHolt Node Type Inventory and Gap Analysis

> **Status:** New file created 2026-04-16 from n8n Domain 7 research (28 pages) + current FlowHolt codebase audit  
> **Direction:** Match n8n's core node set as baseline; FlowHolt adds better UX and full control-plane integration.  
> **Vault:** [[wiki/data/node-type-inventory]]  
> **Raw sources:**  
> - n8n core nodes: `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/` (28 pages)  
> - FlowHolt node registry: `backend/app/node_registry.py`, `backend/app/studio_nodes.py`  
> **See also:** `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | `05-FLOWHOLT-AI-AGENTS-SKELETON.md`

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | n8n raw source path | Make raw source |
|---------|--------------------|-----------------| 
| §1 Trigger nodes | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.manualTrigger.md` | `research/make-help-center-export/pages_markdown/webhooks.md` |
| §1 Form Trigger | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.formTrigger.md` | `research/make-help-center-export/pages_markdown/forms.md` |
| §1 Chat Trigger | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.chatTrigger.md` | No Make equivalent |
| §1 Error Trigger | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.errorTrigger.md` | `research/make-help-center-export/pages_markdown/scenarios.md` §Error workflow |
| §2 Wait node (all 4 modes) | `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_wait.md` | `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` |
| §2 Form node (mid-flow) | `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_form.md` | `research/make-help-center-export/pages_markdown/forms.md` |
| §8 Send Email + Wait | `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_sendemail.md` | `research/make-help-center-export/pages_markdown/email.md` |
| §2 Merge node | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.merge.md` | `research/make-help-center-export/pages_markdown/array-aggregator.md` |
| §2 Execute Workflow | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.executeWorkflow.md` | `research/make-pdf-full.txt` §Subscenarios |
| §3 Summarize | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.summarize.md` | No Make equivalent |
| §3 Compare Datasets | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.compareDatasets.md` | No Make equivalent |
| §4 HTTP Request | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.httpRequest.md` | `research/make-help-center-export/pages_markdown/http.md` |
| §7 AI/Cluster nodes | `research/n8n-docs-export/pages_markdown/advanced-ai/` | `research/make-help-center-export/pages_markdown/ai-agents.md` |
| §7 MCP Client Tool | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-langchain.mcpClientTool.md` | `research/make-help-center-export/pages_markdown/mcp-toolboxes.md` |

### Key n8n source code files per node

| Node | n8n source file |
|------|----------------|
| Manual Trigger | `n8n-master/packages/nodes-base/nodes/ManualTrigger/ManualTrigger.node.ts` |
| Webhook Trigger | `n8n-master/packages/nodes-base/nodes/Webhook/Webhook.node.ts` |
| Schedule Trigger | `n8n-master/packages/nodes-base/nodes/ScheduleTrigger/ScheduleTrigger.node.ts` |
| Form Trigger | `n8n-master/packages/nodes-base/nodes/Form/FormTrigger.node.ts` |
| Chat Trigger | `n8n-master/packages/nodes-base/nodes/ChatTrigger/ChatTrigger.node.ts` |
| Error Trigger | `n8n-master/packages/nodes-base/nodes/ErrorTrigger/ErrorTrigger.node.ts` |
| If | `n8n-master/packages/nodes-base/nodes/If/If.node.ts` |
| Switch | `n8n-master/packages/nodes-base/nodes/Switch/Switch.node.ts` |
| Merge | `n8n-master/packages/nodes-base/nodes/Merge/Merge.node.ts` |
| Wait | `n8n-master/packages/nodes-base/nodes/Wait/Wait.node.ts` |
| Execute Workflow | `n8n-master/packages/nodes-base/nodes/ExecuteWorkflow/ExecuteWorkflow.node.ts` |
| Execute Workflow Trigger | `n8n-master/packages/nodes-base/nodes/ExecuteWorkflowTrigger/ExecuteWorkflowTrigger.node.ts` |
| Set / Edit Fields | `n8n-master/packages/nodes-base/nodes/Set/Set.node.ts` |
| Filter | `n8n-master/packages/nodes-base/nodes/Filter/Filter.node.ts` |
| Summarize | `n8n-master/packages/nodes-base/nodes/Summarize/Summarize.node.ts` |
| Split Out | `n8n-master/packages/nodes-base/nodes/SplitOut/SplitOut.node.ts` |
| Aggregate | `n8n-master/packages/nodes-base/nodes/Aggregate/Aggregate.node.ts` |
| Compare Datasets | `n8n-master/packages/nodes-base/nodes/CompareDatasets/CompareDatasets.node.ts` |
| HTTP Request | `n8n-master/packages/nodes-base/nodes/HttpRequest/HttpRequest.node.ts` |
| Code | `n8n-master/packages/nodes-base/nodes/Code/Code.node.ts` |
| Agent (cluster root) | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/agent/Agent.node.ts` |
| MCP Client Tool | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpClientTool.node.ts` |
| MCP Server Trigger | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpTrigger.node.ts` |
| Buffer Window Memory | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/memory/MemoryBufferWindow/MemoryBufferWindow.node.ts` |
| Sticky Note | `n8n-master/packages/nodes-base/nodes/StickyNote/StickyNote.node.ts` |
| Stop and Error | `n8n-master/packages/nodes-base/nodes/StopAndError/StopAndError.node.ts` |

### This file feeds into

| File | What it informs |
|------|----------------|
| `05-FLOWHOLT-AI-AGENTS-SKELETON.md` | §7 AI/Cluster nodes full spec |
| `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Per-node field catalog (field-level detail) |
| `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | Node I/O format: `FlowItem[]` |
| `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` | Error Trigger, Stop and Error node spec |
| `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md` | Webhook Trigger, Schedule Trigger spec |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Domain 3 node ecosystem gap status |
| `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | Domain 7 decisions (Merge strategies, Switch modes) |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Node executor implementation planning |

### n8n vs Make node coverage comparison

| Node category | Make coverage | n8n coverage | Gap |
|--------------|--------------|-------------|-----|
| Triggers | Webhook, Schedule, Form | + Chat, Error, RSS, Email | Chat Trigger, Error Trigger most urgent |
| Flow control | Router, Filter, Aggregator | + Wait, Merge (5 strategies), Switch Expression mode | Wait + Merge strategies most urgent |
| Data transform | Limited | Full set: Sort, Summarize, Compare, Split, Aggregate | Summarize + Aggregate most urgent |
| AI cluster | AI Agents (monolithic) | Full cluster node system | Entire AI cluster needed |
| MCP | MCP Toolboxes (inbound) | MCP Client + MCP Server | Both MCP nodes needed |

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented in FlowHolt |
| ⚠️ | Partially implemented or needs update |
| ❌ | Not yet implemented (gap) |
| 🔜 | Planned for next implementation phase |

---

## 1. Trigger Nodes

Triggers start a workflow execution. Every workflow must have exactly one trigger.

| Node | What it does | n8n equivalent | FlowHolt status | Priority |
|------|-------------|----------------|-----------------|----------|
| **Manual Trigger** | Starts workflow manually from Studio or API. Used for testing. | `n8n-nodes-base.manualTrigger` | ✅ | Must-Have |
| **Webhook Trigger** | Listens for HTTP POST/GET/PUT/DELETE at a unique URL. Responds with workflow output. | `n8n-nodes-base.webhook` | ✅ | Must-Have |
| **Schedule Trigger** | Runs on cron schedule or fixed interval. Multiple schedule rules per workflow. | `n8n-nodes-base.scheduleTrigger` | ✅ | Must-Have |
| **Form Trigger** | Creates a public-facing HTML form. Workflow runs on submit. Built-in form builder. | `n8n-nodes-base.formTrigger` | ❌ | **Must-Have** |
| **Chat Trigger** | Creates a public chat interface. Pairs with AI Agent to create chatbot. | `n8n-nodes-base.chatTrigger` | ❌ | **Must-Have** |
| **Error Trigger** | Runs when another workflow fails. Receives error details + workflow context. | `n8n-nodes-base.errorTrigger` | ❌ | **Must-Have** |
| **Email Trigger (IMAP)** | Watches an email inbox. Triggers on new message. | `n8n-nodes-base.emailReadImap` | ❌ | High-Value |
| **RSS Feed Trigger** | Polls an RSS feed. Triggers on new entries. | `n8n-nodes-base.rssFeedReadTrigger` | ❌ | Nice-to-Have |

### Form Trigger — Key Design Notes

From `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.formTrigger.md`:

- Generates a public URL at `{base_url}/form/{workflow_id}/{form_path}`
- Built-in form builder: text, email, number, dropdown, checkbox, file upload fields
- Multi-page forms with conditional next-page logic
- Completion page: custom message or redirect URL
- Form responses become the trigger's output items
- Form Completion node required to send final response back to submitter (for multi-step forms)
- Can use a "Wait for Approval" pattern: form submits → agent reviews → Form Completion node sends back to respondent

### Chat Trigger — Key Design Notes

From `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.chatTrigger.md`:

- Generates a chat interface at `{base_url}/chat/{workflow_id}`
- Supports session memory (via Memory sub-node on Agent)
- `$json.chatInput` contains the user's message
- `$json.sessionId` identifies the conversation
- AI Chat Message output node sends the agent's response back
- Can be embedded in external websites via iframe or `@n8n/chat` npm package equivalent

### Error Trigger — Key Design Notes

From `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.errorTrigger.md`:

- Configured as the "error workflow" for other workflows (in workflow settings)
- Receives: `$json.workflow.id`, `$json.workflow.name`, `$json.execution.id`, `$json.error.message`, `$json.error.stack`
- Typically connected to: Send Email, Slack message, create incident ticket
- Multiple workflows can share the same error workflow
- Error workflow runs in production environment (where the error occurred)

---

## 2. Flow Control Nodes

Control execution branching, looping, merging, and timing.

| Node | What it does | n8n equivalent | FlowHolt status | Priority |
|------|-------------|----------------|-----------------|----------|
| **If** | Routes items based on condition(s). Two output branches: true, false. | `n8n-nodes-base.if` | ✅ | Must-Have |
| **Switch** | Routes items to one of N branches. Rules mode or Expression mode. | `n8n-nodes-base.switch` | ⚠️ Rules only, missing Expression mode | Must-Have |
| **Merge** | Combines items from multiple input branches. 5 merge strategies. | `n8n-nodes-base.merge` | ⚠️ Append only | Must-Have |
| **Loop (Split in Batches)** | Processes items in batches of size N. Loops until all items processed. | `n8n-nodes-base.splitInBatches` | ⚠️ Partial | Must-Have |
| **Wait** | Pauses execution for a duration, until a specific time, or until a webhook resumes it. | `n8n-nodes-base.wait` | ❌ | **Must-Have** |
| **No-Op / Passthrough** | Passes items through unchanged. Useful for workflow organization. | `n8n-nodes-base.noOp` | ✅ | Must-Have |
| **Stop and Error** | Immediately stops execution and throws a custom error message. | `n8n-nodes-base.stopAndError` | ❌ | High-Value |
| **Execute Workflow** | Calls another FlowHolt workflow as a sub-workflow. | `n8n-nodes-base.executeWorkflow` | ❌ | **Must-Have** |
| **Execute Workflow Trigger** | Marks a workflow as callable as a sub-workflow. Defines the I/O schema. | `n8n-nodes-base.executeWorkflowTrigger` | ❌ | **Must-Have** |

### Switch Node — Expression Mode Gap

Current FlowHolt Switch is Rules-only (UI-built conditions). n8n's Switch has two modes:

**Rules mode:** Each rule is a condition (field, operator, value). Can have up to N rules with named outputs.  
**Expression mode:** A single `{{ }}` expression that returns a string matching one of the named outputs.

Expression mode example:
```javascript
// Expression: {{ $json.country }}
// Named outputs: "US", "EU", "APAC", "Other"
// → item routed to output matching returned country
```

This is more powerful for complex routing logic. Add Expression mode to Switch in Phase 2.

### Merge Node — 5 Strategies

Current FlowHolt Merge is Append-only. n8n has 5 strategies:

| Strategy | What it does | Use case |
|----------|-------------|---------|
| **Append** | Concatenate all items from all inputs | Combine lists |
| **Combine by Field** | Inner join on matching field value | Database JOIN behavior |
| **Combine by Position** | Zip items from both inputs by index (1st+1st, 2nd+2nd, etc.) | Enrich with same-index data |
| **Cross Product** | Every item from input A × every item from input B | Generate all combinations |
| **SQL Query** | Arbitrary SQL-like query across inputs (DuckDB internally) | Advanced merging |

Implement all 5 strategies. SQL Query is Phase 2.

### Wait Node — Key Design Notes

Raw source: `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_wait.md`

**Four resume modes** (confirmed from n8n docs):

1. **After Time Interval:** Pause for N seconds/minutes/hours/days
   - For waits < 65 seconds: execution stays in memory, does NOT offload to DB
   - For waits ≥ 65 seconds: offloads execution data to database, reloads on resume

2. **At Specified Time:** Pause until a specific date/time
   - Uses server time, NOT workflow timezone setting

3. **On Webhook Call:** Pause until `$execution.resumeUrl` is called
   - Authentication options: Basic Auth / Header Auth / JWT Auth / None
   - Resume URL is unique per execution + per Wait node
   - `Limit Wait Time` toggle for timeout fallback (duration or exact date)
   - IP whitelist option to restrict who can resume
   - Webhook suffix for multiple Wait nodes in same workflow

4. **On Form Submitted:** (**NEW** 4th mode — not in previous plan files)
   - Generates a form at the resume URL (not using Form Trigger)
   - Form builder: text, number, password, textarea, date, dropdown (single or multi), required fields
   - `Respond When` options: Form Is Submitted / Workflow Finishes / Using Respond to Webhook Node
   - `Form Response` options: Show text / Redirect URL
   - `Limit Wait Time` toggle for timeout fallback
   - Webhook Suffix option for multiple Wait nodes

**Critical use cases for FlowHolt:**
- Human approval flows: agent sends approval link → Wait (Webhook) → resume with approval/rejection
- Human approval forms: Wait (On Form Submitted) → collect structured human input mid-workflow
- Rate limiting: Wait (After Time Interval) between API calls in a batch loop
- Scheduled continuation: Wait (At Specified Time) for deferred execution
- External system polling: Wait (Webhook) until external system calls back

**FlowHolt execution model note:**
Wait node serializes execution state to DB. This is the same mechanism as Make's "incomplete executions" / paused execution storage. FlowHolt already has paused execution support in `backend/app/models.py` (`ExecutionStatus.paused`). The Wait node is the UI surface for this backend capability.

### Execute Workflow — Sub-workflow Pattern

See `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` § Decision 2.5 for quota policy.

**Execute Workflow node:** Calls another workflow. Waits for result. Returns the sub-workflow's output items.  
**Execute Workflow Trigger:** The called workflow must start with this node. Defines typed input schema (field list, JSON schema, or accept-all mode).

```
Main workflow:
  ... → Execute Workflow (calls "Process Order") → ...

"Process Order" sub-workflow:
  Execute Workflow Trigger → ... → Return items
```

Caller whitelist: Sub-workflows can optionally restrict which workflows can call them.  
Quota: Sub-workflow executions are quota-free (see decision 2.5).

---

## 3. Data Transform Nodes

Process, reshape, filter, and aggregate data.

| Node | What it does | n8n equivalent | FlowHolt status | Priority |
|------|-------------|----------------|-----------------|----------|
| **Set / Edit Fields** | Create or update item fields. Add/remove fields. | `n8n-nodes-base.set` | ✅ | Must-Have |
| **Filter** | Remove items that don't match a condition. | `n8n-nodes-base.filter` | ✅ | Must-Have |
| **Sort** | Sort items by one or more fields. Ascending/descending. | `n8n-nodes-base.sort` | ❌ | High-Value |
| **Summarize** | Aggregate items: sum, count, min, max, average, first, last. Group by field. | `n8n-nodes-base.summarize` | ❌ | **High-Value** |
| **Limit** | Keep only the first N items. | `n8n-nodes-base.limit` | ❌ | High-Value |
| **Remove Duplicates** | Deduplicate items by a field. | `n8n-nodes-base.removeDuplicates` | ❌ | High-Value |
| **Compare Datasets** | Compare two inputs: find added, removed, changed items. | `n8n-nodes-base.compareDatasets` | ❌ | High-Value |
| **Aggregate** | Combine all input items into a single item (inverse of Split Out). | `n8n-nodes-base.aggregate` | ❌ | Must-Have |
| **Split Out** | Split a field that is an array into separate items (one per array element). | `n8n-nodes-base.splitOut` | ❌ | Must-Have |
| **Item Lists** | Various array operations: split out, aggregate, deduplicate, sort, search | `n8n-nodes-base.itemLists` | ❌ | High-Value |
| **Rename Keys** | Rename object keys. | `n8n-nodes-base.renameKeys` | ❌ | Nice-to-Have |

### Summarize Node — Key Design Notes

Critical for analytics workflows. From n8n docs:

- Group by: one or more fields (like SQL GROUP BY)
- Aggregation functions per field: Sum, Count, Count unique, Min, Max, Average, First, Last, Concatenate strings
- Example: group sales items by `country`, calculate `sum(amount)` and `count(orders)`
- Output: one item per group

### Split Out + Aggregate — The Array Pair

**Split Out:** Takes a field that contains an array → creates one item per element  
```
Input: [{json: {tags: ["a","b","c"]}}]
Split on: tags
Output: [{json:{tag:"a"}}, {json:{tag:"b"}}, {json:{tag:"c"}}]
```

**Aggregate:** Inverse operation. Takes multiple items → creates one item with a field that is an array.

These two nodes enable processing array data item-by-item and then re-aggregating.

---

## 4. HTTP and Integration Nodes

| Node | What it does | n8n equivalent | FlowHolt status | Priority |
|------|-------------|----------------|-----------------|----------|
| **HTTP Request** | Make any HTTP request. Full control over method, headers, body, auth, pagination. | `n8n-nodes-base.httpRequest` | ✅ | Must-Have |
| **GraphQL** | Make GraphQL queries. | `n8n-nodes-base.graphql` | ❌ | High-Value |
| **RSS Read** | Fetch and parse an RSS/Atom feed. | `n8n-nodes-base.rssFeedRead` | ❌ | Nice-to-Have |
| **FTP** | Upload/download files via FTP/SFTP. | `n8n-nodes-base.ftp` | ❌ | Nice-to-Have |
| **SSH** | Execute commands on remote server via SSH. | `n8n-nodes-base.ssh` | ❌ | Nice-to-Have |

### HTTP Request — Key Design Notes

Raw source: `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_httprequest.md`
Pagination cookbook: `research/n8n-docs-export/pages_markdown/code__cookbook__http-node__pagination.md`

Current FlowHolt HTTP Request node needs audit against n8n feature set:

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Methods | GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS | ✅ |
| Auth types | None/Basic/Digest/Header/OAuth1/OAuth2/JWT/Custom | ⚠️ Basic + Header only |
| Pagination | Offset/Page/Cursor/URL (auto-paginate) | ❌ |
| Batching | Send multiple items as one request or N requests | ❌ |
| Follow redirects | Toggle | ✅ |
| Ignore SSL errors | Toggle | ✅ |
| Response format | JSON/Text/Binary/Buffer | ⚠️ JSON only |
| Response code handling | Define which codes are errors | ❌ |
| Proxy support | HTTP proxy | ❌ |

### HTTP Request Pagination — 3 Modes (from n8n docs)

Auto-pagination is critical for API integrations. The HTTP Request node fetches all pages automatically, outputting all items as a single result set.

**Mode 1: Response Contains Next URL** (`$response`)
```javascript
// API returns: {"data": [...], "next": "https://api.example.com/items?page=2&cursor=abc"}
// Pagination Mode: "Response Contains Next URL"
// Next URL: {{ $response.body["next"] }}
// n8n fetches page after page until "next" is null
```

**Mode 2: Update a Parameter in Each Request** (page number)
```javascript
// Pagination Mode: "Update a Parameter in Each Request"
// Type: Query | Name: "page" | Value: {{ $pageCount + 1 }}
// $pageCount starts at 0; +1 makes page 1, page 2, ...
// Tip: $pageCount is a built-in HTTP node variable — add to expression engine
```

**Mode 3: Body Parameter Pagination** (POST-based pagination)
```javascript
// HTTP Method: POST
// Pagination Mode: "Update a Parameter in Each Request"  
// Type: Body | Name: "page" | Value: {{ $pageCount + 1 }}
```

**Page size control:** Set a query parameter `limit=100` alongside pagination to maximize items per page.

**FlowHolt implementation note:** HTTP pagination requires `$pageCount` as a built-in node variable (HTTP Request node context only). Add to `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` as a special HTTP Request variable alongside `$response`.

---

## 5. Code Nodes

| Node | What it does | n8n equivalent | FlowHolt status | Priority |
|------|-------------|----------------|-----------------|----------|
| **Code (JS)** | Run arbitrary JavaScript. Full access to input items. Can use npm modules (allowlisted). | `n8n-nodes-base.code` (JS) | ✅ | Must-Have |
| **Code (Python)** | Run arbitrary Python. Full access to input items. | `n8n-nodes-base.code` (Python) | ✅ | Must-Have |
| **Crypto** | Hash (MD5/SHA1/SHA256/SHA512), HMAC, encrypt/decrypt (AES). | `n8n-nodes-base.crypto` | ❌ | High-Value |
| **Date & Time** | Extract, calculate, format dates. Wrapper around Luxon for non-expression use. | `n8n-nodes-base.dateTime` | ❌ | High-Value |
| **HTML** | Parse HTML, extract elements via CSS selectors, generate HTML. | `n8n-nodes-base.html` | ❌ | High-Value |
| **Markdown** | Convert HTML to Markdown or Markdown to HTML. | `n8n-nodes-base.markdown` | ❌ | Nice-to-Have |
| **XML** | Parse XML, convert to JSON, build XML. | `n8n-nodes-base.xml` | ❌ | High-Value |
| **PDF** | Extract text from PDF. | `n8n-nodes-base.extractFromFile` (pdf) | ❌ | High-Value |
| **Text Manipulation** | Case conversion, trim, pad, extract, replace. | Various | ⚠️ Via expressions | High-Value |

### Code Node — Current State + Gaps

FlowHolt has `sandbox.py` for Code node isolation. Node supports JS and Python.

Missing features vs n8n:
- No `npm` module support (allowlisted modules only via `FLOWHOLT_CODE_ALLOW_MODULES`)
- No `$input`, `$output`, `$node` context injection (check if current implementation has these)
- No "Run once for all items" vs "Run once for each item" mode toggle
- No code import from external file

---

## 6. File and Binary Nodes

| Node | What it does | n8n equivalent | FlowHolt status | Priority |
|------|-------------|----------------|-----------------|----------|
| **Read/Write File** | Read and write files to disk (local execution only). | `n8n-nodes-base.readWriteFile` | ❌ | Nice-to-Have |
| **Extract from File** | Extract content from PDF, CSV, Excel, HTML, JSON, XML, iCal. | `n8n-nodes-base.extractFromFile` | ❌ | High-Value |
| **Convert to File** | Convert JSON array to CSV, spreadsheet, or binary. | `n8n-nodes-base.convertToFile` | ❌ | High-Value |
| **Compress / Extract** | Zip/unzip files. | `n8n-nodes-base.compression` | ❌ | Nice-to-Have |
| **Move Binary Data** | Move data between json and binary fields. | `n8n-nodes-base.moveBinaryData` | ❌ | High-Value |

---

## 7. AI / Cluster Nodes

See `05-FLOWHOLT-AI-AGENTS-SKELETON.md` for full spec. Summary:

| Node | Type | n8n equivalent | FlowHolt status | Priority |
|------|------|----------------|-----------------|----------|
| **Agent** | Root | `@n8n/n8n-nodes-langchain.agent` | ❌ | **Must-Have** |
| **LLM Chain** | Root | `@n8n/n8n-nodes-langchain.chainLlm` | ❌ | Must-Have |
| **Basic LLM Chain** | Root | `@n8n/n8n-nodes-langchain.chainLlm` | ❌ | Must-Have |
| **OpenAI LLM** | Sub-node | `@n8n/n8n-nodes-langchain.lmOpenAi` | ❌ | Must-Have |
| **Anthropic LLM** | Sub-node | `@n8n/n8n-nodes-langchain.lmAnthropic` | ❌ | High-Value |
| **Buffer Window Memory** | Sub-node | `@n8n/n8n-nodes-langchain.memoryBufferWindow` | ❌ | Must-Have |
| **Postgres Memory** | Sub-node | `@n8n/n8n-nodes-langchain.memoryPostgresChat` | ❌ | High-Value |
| **Workflow Tool** | Sub-node | `@n8n/n8n-nodes-langchain.toolWorkflow` | ❌ | Must-Have |
| **Code Tool** | Sub-node | `@n8n/n8n-nodes-langchain.toolCode` | ❌ | Must-Have |
| **HTTP Tool** | Sub-node | `@n8n/n8n-nodes-langchain.toolHttpRequest` | ❌ | Must-Have |
| **MCP Client Tool** | Sub-node | `@n8n/n8n-nodes-langchain.mcpClientTool` | ❌ | **Must-Have** |
| **MCP Server Trigger** | Root trigger | `@n8n/n8n-nodes-langchain.mcpTrigger` | ❌ | **Must-Have** |
| **Vector Store Retriever** | Sub-node | `@n8n/n8n-nodes-langchain.retrieverVectorStore` | ❌ | High-Value |
| **PGVector Store** | Sub-node | `@n8n/n8n-nodes-langchain.vectorStorePGVector` | ❌ | High-Value |
| **Embeddings OpenAI** | Sub-node | `@n8n/n8n-nodes-langchain.embeddingsOpenAi` | ❌ | High-Value |
| **Document Loader** | Sub-node | Various | ❌ | High-Value |
| **Recursive Char Splitter** | Sub-node | `@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacter` | ❌ | High-Value |
| **Information Extractor** | Root | `@n8n/n8n-nodes-langchain.informationExtractor` | ❌ | High-Value |
| **Sentiment Analysis** | Root | `@n8n/n8n-nodes-langchain.sentimentAnalysis` | ❌ | Nice-to-Have |
| **Text Classifier** | Root | `@n8n/n8n-nodes-langchain.textClassifier` | ❌ | Nice-to-Have |

---

## 8. Utility Nodes

| Node | What it does | n8n equivalent | FlowHolt status | Priority |
|------|-------------|----------------|-----------------|----------|
| **Schedule Trigger** | Scheduled time-based trigger. | `n8n-nodes-base.scheduleTrigger` | ✅ | Must-Have |
| **Respond to Webhook** | Send HTTP response to a waiting Webhook Trigger. | `n8n-nodes-base.respondToWebhook` | ⚠️ | Must-Have |
| **Send Email** | Send email via SMTP. Has "Send and Wait for Response" mode: Approval (customizable buttons), Free Text (form), Custom Form (full form builder). Pauses workflow until recipient responds. | `n8n-nodes-base.emailSend` | ❌ | High-Value |
| **Local File Trigger** | Watch local directory for file changes. | `n8n-nodes-base.localFileTrigger` | ❌ | Nice-to-Have |
| **Sticky Note** | Annotation on canvas. Not a processing node. | `n8n-nodes-base.stickyNote` | ❌ | High-Value |

---

## 9. Form System Nodes (Multi-step Forms)

The n8n form system consists of three nodes working together:

| Node | What it does | n8n equivalent | FlowHolt status | Priority |
|------|-------------|----------------|-----------------|----------|
| **Form Trigger** | Entry point. Generates public form URL. Starts workflow on submit. | `n8n-nodes-base.formTrigger` | ❌ | Must-Have |
| **Form (mid-flow)** | Adds additional form pages mid-workflow. Requires Form Trigger. | `n8n-nodes-base.form` | ❌ | High-Value |
| **Wait (On Form Submitted)** | Pauses execution, presents a form, resumes when submitted. Does NOT need Form Trigger. | `n8n-nodes-base.wait` (4th mode) | ❌ | High-Value |

### Form Node (Mid-Flow) — Key Design Notes

Raw source: `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_form.md`

The Form node is separate from the Form Trigger. It creates additional pages in a multi-page form workflow.

**Field types supported:**
`text`, `textarea`, `number`, `password`, `email`, `date`, `dropdown` (single/multi), `checkbox` (multi), `radio` (single), `file` (single/multi, filter by extension), `hiddenField`, `html` (custom HTML, read-only)

**JSON form definition:** Fields can be defined via UI builder OR via JSON array:
```json
[
  {"fieldLabel": "Name", "fieldType": "text", "requiredField": true},
  {"fieldLabel": "Type", "fieldType": "dropdown", "fieldOptions": {"values": [{"option": "A"}, {"option": "B"}]}},
  {"fieldLabel": "Files", "fieldType": "file", "multipleFiles": true, "acceptFileTypes": ".pdf,.jpg"}
]
```

**Query parameter pre-fill:** Initial field values can be set via URL query parameters (production mode only). Example:
```
https://instance.com/form/my-form?name=Jane%20Doe&email=jane%40example.com
```

**Custom CSS:** Override default form styling with `Custom Form Styling` option.

**Hidden fields:** Pass data to the form without showing it to the user. Useful for passing workflow context (workflow ID, execution ID, user email) into the form response.

**Form Ending Page Types:**
- **Show Completion Screen**: Custom title + message + page title
- **Redirect to URL**: Redirect user after submit
- **Show Text**: Arbitrary HTML/text final page (allows `<script>`, `<style>`, `<input>` elements)
- **Return Binary File**: Return a file download on completion (e.g., generated PDF)

**Branching behavior:** In multi-branch workflows, only ONE Form Ending node executes (the last branch to run).

**FlowHolt implication:** Multi-step forms are a key differentiator. FlowHolt should support:
1. Single-page form (Form Trigger only)
2. Multi-step form (Form Trigger → ... → Form nodes → Form Ending)
3. Mid-workflow approval form (Wait node "On Form Submitted")
4. Email-triggered form (Send Email "Send and Wait" → link in email → respondent fills form)

### Send Email — "Send and Wait for Response" Mode

Raw source: `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_sendemail.md`

This is a **built-in HITL email pattern**. The node sends an email and pauses execution until the recipient responds.

**3 Response Types:**

| Response Type | What recipient sees | What workflow receives |
|--------------|--------------------|-----------------------|
| **Approval** | Email with Approve / Decline buttons (customizable labels, button style: primary/secondary) | Boolean: approved/declined |
| **Free Text** | Link to a simple text response form (customizable title, description, button labels) | Text string entered by recipient |
| **Custom Form** | Link to a full custom form (same field types as Form node) | Structured form data |

All 3 types support:
- `Limit Wait Time`: Auto-resume after N time if no response (prevents workflow getting stuck forever)
- `Append n8n Attribution`: Toggle attribution footer in email

**FlowHolt operational pattern:**
```
Trigger → ... → Send Email (Approval) → Wait for response → If (approved) → ...
                                                              → If (rejected) → ...
```

This pattern replaces manual human approval steps in production workflows. Make has no equivalent built-in node — this is a FlowHolt advantage.

**Note:** Send Email SMTP node limitation — does NOT support `In-Reply-To` / `References` headers (no email threading). Each response creates a new conversation thread.

---

### Must-Have (v1 gaps to close)

| Node | Reason |
|------|--------|
| Form Trigger | Core user-facing feature, enables no-code form automation |
| Chat Trigger | Required for AI chatbot pattern (Chat Trigger → Agent → response) |
| Error Trigger | Required for error workflow pattern (essential for production reliability) |
| Wait | Required for human-in-the-loop non-agent workflows + rate limiting |
| Execute Workflow | Required for sub-workflow pattern (fundamental decomposition tool) |
| Execute Workflow Trigger | Paired with Execute Workflow |
| Aggregate | Inverse of Split Out, needed for array operations |
| Split Out | Needed for processing nested arrays item-by-item |
| MCP Client Tool | AI agent MCP integration |
| MCP Server Trigger | FlowHolt-as-MCP-server |
| Agent (entire cluster) | Core AI feature |

### High-Value (v2)

- Summarize, Compare Datasets, Sort, Limit, Remove Duplicates
- HTTP Request pagination + auth types
- Extract from File, Convert to File
- Crypto, Date & Time, HTML, XML
- Sticky Note, Send Email

### Nice-to-Have (v3+)

- RSS triggers/readers, SSH, FTP
- Markdown, Compression
- Sentiment Analysis, Text Classifier
- Local File Trigger

---

## Cross-Reference with Existing node_registry.py

**Action required:** Audit `backend/app/node_registry.py` against this inventory. For each registered node type:
1. Check which fields are implemented
2. Check if the node returns `FlowItem[]` (or needs migration)
3. Check if expression fields work correctly
4. Note which nodes are missing from this inventory

---

## Related Files

- `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` — per-node field catalog
- `05-FLOWHOLT-AI-AGENTS-SKELETON.md` — AI cluster nodes detail
- `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` — FlowItem type
- `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` — n8n UI catalog (raw reference)
- `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` § Domain 7 — gap analysis decisions
- [[wiki/data/node-type-inventory]] — vault synthesis
- [[wiki/concepts/execution-model]] — how nodes execute
