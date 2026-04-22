# FlowHolt — n8n Integration Synthesis

> **Purpose:** This file is the formal merge of the n8n research phase (all 10 domains, 1499 pages) into the FlowHolt master plan.  
> **Date:** 2026-04-16  
> **Vault link:** [[wiki/entities/n8n]] | [[overview]]  
> **Raw source:** `research/n8n-docs-export/pages_markdown/` (1499 pages)

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Domain | Raw source path | Pages |
|--------|----------------|-------|
| AI Agents + Cluster Nodes | `research/n8n-docs-export/pages_markdown/advanced-ai/` | ~50 |
| Flow Logic | `research/n8n-docs-export/pages_markdown/flow-logic/` | ~25 |
| Workflow Lifecycle | `research/n8n-docs-export/pages_markdown/workflows/` | — |
| Data Model + Expressions | `research/n8n-docs-export/pages_markdown/data/` | 25 |
| Environments + Source Control | `research/n8n-docs-export/pages_markdown/source-control-environments/` | ~15 |
| User Management + RBAC | `research/n8n-docs-export/pages_markdown/user-management/` | ~10 |
| Core Nodes | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/` | 28 |
| Scaling + Architecture | `research/n8n-docs-export/pages_markdown/hosting/scaling/` | 10 |
| Analytics + Insights | `research/n8n-docs-export/pages_markdown/insights/` | 4 |
| Community Nodes | `research/n8n-docs-export/pages_markdown/integrations/community-nodes/` | 6 |

### Key n8n source code files per decision

| Decision | n8n source file |
|----------|----------------|
| 1.1 Cluster nodes | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/agent/Agent.node.ts` |
| 1.3 Per-tool HITL | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/agent/agents/ToolsAgent/ToolsAgentOutputParser.ts` |
| 1.4 $fromAI() | `n8n-master/packages/core/src/execution-engine/` |
| 1.5 Memory sub-nodes | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/memory/` |
| 1.6 RAG pipeline | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/vector_store/` |
| 1.7 MCP bidirectionality | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/` |
| 2.4 Edit locking | `n8n-master/packages/editor-ui/src/composables/useCollaborationState.ts` |
| 3.1 Item-array model | `n8n-master/packages/workflow/src/Interfaces.ts` → `INodeExecutionData` |
| 3.3 Drag-to-expression | `n8n-master/packages/editor-ui/src/components/NDVInputPanel.vue` |
| 3.4 Data pinning | `n8n-master/packages/editor-ui/src/stores/pinData.store.ts` |
| 5.2 Visual diff | `n8n-master/packages/editor-ui/src/components/VersionCompare.vue` |
| 6.1 Publish permission | `n8n-master/packages/cli/src/permissions/global.roles.ts` |
| 8.1 Postgres-as-queue | `n8n-master/packages/cli/src/scaling/queue-based-execution-lifecycle.ts` |
| 9.2 Time saved metric | `n8n-master/packages/cli/src/modules/insights/insights.service.ts` |

### Make comparison corpus files

| Make topic | Raw source path |
|-----------|----------------|
| AI Agents | `research/make-help-center-export/pages_markdown/ai-agents.md` |
| Memory/Knowledge | `research/make-help-center-export/pages_markdown/knowledge-bases.md` |
| Environments | `research/make-help-center-export/pages_markdown/environment-variables.md` |
| Version history | `research/make-help-center-export/pages_markdown/versions.md` |
| Org model | `research/make-help-center-export/pages_markdown/organizations.md` |

### This file feeds into

| File | Sections informed |
|------|------------------|
| `05-FLOWHOLT-AI-AGENTS-SKELETON.md` | Domain 1 (all agent decisions) |
| `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | Domain 2.4 (edit lock), Domain 3.3 (drag-to-expression), Domain 3.4 (data pinning) |
| `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` | Domain 1.3 (HITL), 1.6 (RAG), 1.8 (evaluation) |
| `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` | Domain 5 (environments + visual diff) |
| `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` | Domain 2.2 (error modes) |
| `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` | Domain 1.7 (MCP), Domain 10 (community nodes) |
| `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | Domain 3 (entire data model) |
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | Domain 7 (core nodes) |
| `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` | Domain 8 (scaling decisions) |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Domain 9 (analytics) |
| `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md` | Domain 6 (RBAC decisions) |

---

## How to Use This File

This is a decision register — it maps each major finding from n8n research to a concrete FlowHolt design decision. Each entry answers:
1. What n8n does
2. What Make does (if relevant)
3. What FlowHolt will do (and how it exceeds both)
4. Which plan file owns the decision
5. Which vault page has the full spec

---

## Domain 1: AI Agents and Cluster Nodes

**Raw source:** `research/n8n-docs-export/pages_markdown/advanced-ai/` (~50 pages)  
**Vault:** [[wiki/concepts/ai-agents]]  
**Plan file:** `05-FLOWHOLT-AI-AGENTS-SKELETON.md`

### Decision 1.1 — Cluster Node Architecture

| | Decision |
|---|---|
| **n8n does** | Root nodes (Agent, LLM Chain, VectorStore) + Sub-nodes (Memory, Tools, Retriever, Embeddings) connected via typed connector slots — not sequential piping |
| **Make does** | AI Agents app (single monolithic agent block, limited composability) |
| **FlowHolt will** | Adopt cluster node architecture with typed connector slots. Sub-nodes attach to root nodes via visual port connectors. Each port has a defined type (tools, memory, retriever, llm, embeddings). |
| **Exceeds both by** | Sub-node types visible in inspector sidebar with inline attachment management; add/remove sub-nodes without leaving the node config panel |
| **Plan file** | `05-FLOWHOLT-AI-AGENTS-SKELETON.md` |

### Decision 1.2 — Single Unified Agent Node

| | Decision |
|---|---|
| **n8n does** | Single Agent node with Tools Agent mode as default (post-Feb 2025). Old types — Conversational, ReAct, Plan+Execute — removed. Tool-calling interface is more reliable than JSON parsing. |
| **Make does** | Multiple separate "AI Agents" modules (not composable) |
| **FlowHolt will** | Single Agent node. One mode: tool-calling. No separate ReAct/Conversational variants at launch. Tools are attached as sub-nodes. |
| **Plan file** | `05-FLOWHOLT-AI-AGENTS-SKELETON.md` |

### Decision 1.3 — Per-Tool HITL Gates

| | Decision |
|---|---|
| **n8n does** | Pause before a specific tool executes. Reviewer sees AI-proposed parameters. Approval via Slack/Chat/Teams/email. `$tool.name` and `$tool.parameters` available. |
| **Make does** | Workflow-level pause only (module interrupt) |
| **FlowHolt will** | Per-tool HITL gate. Each tool in the agent's tool list has an optional `require_approval: true` flag. When the agent proposes to call that tool, execution pauses at the tool level. Human Inbox shows tool name + AI-proposed parameters for review. |
| **Exceeds both by** | Per-tool approval is a significant capability gap vs Make. n8n has it; FlowHolt must match and surface it more clearly in UI. |
| **Plan file** | `05-FLOWHOLT-AI-AGENTS-SKELETON.md` + `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` |

### Decision 1.4 — $fromAI() Expression in Tool Fields

| | Decision |
|---|---|
| **n8n does** | `{{$fromAI("field_name", "description", "type")}}` — lets the AI propose values for specific tool parameter fields at runtime |
| **Make does** | No equivalent |
| **FlowHolt will** | Implement `{{$fromAI("name", "description", "type")}}` in tool parameter fields. In the inspector, fields with `$fromAI()` show an "AI-proposed" badge. |
| **Plan file** | `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` |

### Decision 1.5 — Memory System

| | Decision |
|---|---|
| **n8n does** | Memory sub-nodes: Simple (dev, dies on restart), Buffer Window (last N messages), Postgres (persistent), Redis (scalable), Zep (managed). Chat Memory Manager node for inject/trim/manipulate. |
| **Make does** | No memory node system |
| **FlowHolt will** | **v1:** Buffer Window Memory only (simple, reliable, no external deps). **v2:** Postgres Memory (reuse existing Postgres). **v3:** Redis Memory + Zep. Memory sub-node attaches to Agent root node via `memory` port. |
| **Plan file** | `05-FLOWHOLT-AI-AGENTS-SKELETON.md` |
| **Open decision #13 resolved** | Buffer Window for v1 |

### Decision 1.6 — RAG Pipeline

| | Decision |
|---|---|
| **n8n does** | Data → Document Loader → Text Splitter (Recursive Char recommended) → Embeddings → Vector Store (PGVector recommended). Retriever sub-node connects to Agent via `retriever` port. Token-saving: use Q&A Chain tool to avoid passing raw chunks to LLM. |
| **Make does** | Knowledge base upload only (no pipeline control) |
| **FlowHolt will** | Implement full RAG pipeline as cluster nodes. PGVector as primary vector store (reuses Postgres). Document Loader + Text Splitter + Embeddings as sub-nodes. Retriever attaches to Agent via typed port. |
| **Plan file** | `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` |

### Decision 1.7 — MCP Bidirectionality

| | Decision |
|---|---|
| **n8n does** | n8n acts as both MCP server (exposes workflows as tools to Claude Desktop, Claude Code, etc.) AND MCP client (agents can call external MCP servers as tools) |
| **Make does** | No MCP support |
| **FlowHolt will** | Full MCP bidirectionality. Outbound: Workspace-level MCP server endpoint; each published workflow with `mcp: true` flag appears as a callable tool. Inbound: MCP Client tool sub-node for agents to call external MCP servers. |
| **Exceeds both by** | This is a major competitive differentiator vs Make. n8n has it; FlowHolt must implement and surface it in the Integrations/Connections page. |
| **Open decision #18 resolved** | MCP server management lives under Connections → External MCP Servers |
| **Plan file** | `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` |

### Decision 1.8 — Agent Evaluation Framework

| | Decision |
|---|---|
| **n8n does** | Light evaluation (dev, small dataset) + Metric-based evaluation (prod, regression testing). Test datasets, custom metrics, non-deterministic output measurement. |
| **Make does** | No evaluation |
| **FlowHolt will** | Evaluation tab in Agent detail page. Two modes: interactive test (run agent, inspect output) and dataset evaluation (upload test cases, measure pass/fail). Results stored as evaluation history. |
| **Open decision #17 resolved** | Evaluation is in the Agent detail inspector (not a separate page) |
| **Plan file** | `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` |

---

## Domain 2 + 4: Flow Logic and Workflow Lifecycle

**Raw source:** `research/n8n-docs-export/pages_markdown/flow-logic/`, `research/n8n-docs-export/pages_markdown/workflows/`  
**Vault:** [[wiki/concepts/execution-model]] | [[wiki/concepts/environment-deployment]]

### Decision 2.1 — Execution Order

| | Decision |
|---|---|
| **n8n does** | Depth-first (v1 default, node fully completes before branching). Breadth-first is v0 legacy. |
| **FlowHolt will** | Depth-first only. No breadth-first option. Simpler mental model for users. |
| **Plan file** | `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` |

### Decision 2.2 — Node-Level Error Modes

| | Decision |
|---|---|
| **n8n does** | Per-node: Stop Workflow / Continue (skip) / Continue (error output) — third mode passes the error object as a data item to the next node |
| **Make does** | Per-module handlers: Stop / Rollback / Retry / Ignore / Custom (but not error-as-data routing) |
| **FlowHolt will** | Three On Error modes: `stop` / `continue` / `continue_with_error`. The third mode adds an error output port to the node. Downstream nodes can branch on `$json.error`. |
| **Gap addressed** | `continue_with_error` is the identified gap from n8n research. Add it. |
| **Plan file** | `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` |

### Decision 2.3 — Auto-Save and Publish Separation

| | Decision |
|---|---|
| **n8n does** | Every keystroke auto-saves as draft. Explicit "Save" and "Publish" buttons. 6 publish button states (Publish / Save / Publishing / Saving / Published / Saved). |
| **Make does** | Similar: active vs inactive toggle; version history |
| **FlowHolt will** | Auto-save every 2s as draft. Explicit "Publish" button for making live. Version history on every publish. Publish button state machine: Draft / Saving / Publishing / Published / Has Unpublished Changes |
| **Plan file** | `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md` |

### Decision 2.4 — Edit Locking

| | Decision |
|---|---|
| **n8n does** | Single editor at a time. Lock auto-releases on inactivity. Read-only for others while locked. |
| **Make does** | Last-write-wins (no explicit lock) |
| **FlowHolt will** | Edit lock on workflow open. Lock shown in top bar (who is editing). Auto-release after 5 min inactivity. Read-only mode for non-owners. Request-to-edit button for waiting users. |
| **Plan file** | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` |

### Decision 2.5 — Sub-Workflow Execution Quotas

| | Decision |
|---|---|
| **n8n does** | Sub-workflow executions don't count against quota. Incentivizes decomposition. |
| **FlowHolt will** | Sub-workflow executions are quota-free. Only top-level manual and scheduled production runs count. |
| **Open decision #19 resolved** | Sub-workflow tool pattern adopted; quota-free |
| **Plan file** | `45-FLOWHOLT-DATA-STORE-AND-CUSTOM-FUNCTION-SPEC.md` (sub-workflow node) |

---

## Domain 3: Data Model and Expression Language

**Raw source:** `research/n8n-docs-export/pages_markdown/data/` (25 pages)  
**Vault:** [[wiki/concepts/expression-language]]  
**Plan file:** `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md`

### Decision 3.1 — Item-Array Data Model

| | Decision |
|---|---|
| **n8n does** | Universal item format: `[{json: {...}, binary: {...}}]`. Every node receives and returns arrays of items. JSON holds structured data; binary holds file content with metadata. |
| **Make does** | Bundles (similar concept but different structure) |
| **FlowHolt will** | Adopt n8n's item-array model exactly. Every node I/O is `FlowItem[]` where `FlowItem = {json: Record<string,any>, binary?: Record<string,{data,mimeType,fileName}>}`. This is the foundation of the entire data pipeline. |
| **Plan file** | `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` |

### Decision 3.2 — Expression Syntax

| | Decision |
|---|---|
| **n8n does** | `{{ }}` Handlebars delimiters. Full JavaScript inside. Context variables: `$json`, `$input`, `$now`, `$vars`, `$workflow`, `$execution`, `$node`, `$env`. |
| **Make does** | Template syntax `{{variable}}` without full JS; limited functions |
| **FlowHolt will** | Adopt `{{ }}` syntax with full JS support. Core MVP variables: `$json` (current item), `$input` (all input items), `$now` (Luxon DateTime), `$vars` (workspace variables). Full context variable set (30+) in v2. |
| **Plan file** | `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` |

### Decision 3.3 — Drag-to-Expression Mapping UI

| | Decision |
|---|---|
| **n8n does** | INPUT panel (Schema/Table/JSON views). Drag a field from INPUT → auto-generates `{{$json.fieldName}}` in target field. This is the primary mapping UX for non-technical users. |
| **Make does** | Mapping panel with clickable variable pills |
| **FlowHolt will** | INPUT panel with three views: Schema (field tree with types), Table (row preview), JSON (raw). Drag any field from Schema or Table view → auto-generates expression in focused input. Click inserts at cursor. Expression editor with autocomplete for method chaining. |
| **Exceeds both by** | Combined drag-from-schema + click-to-insert + autocomplete in a single unified INPUT panel is better than either Make or n8n alone |
| **Plan file** | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` + `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` |

### Decision 3.4 — Data Pinning

| | Decision |
|---|---|
| **n8n does** | Pin node output — saves a snapshot of real execution output for reuse during development. Avoids re-triggering external APIs on each test run. Pin icon on each node in dev mode. |
| **Make does** | No equivalent |
| **FlowHolt will** | Data pinning on all nodes in Studio test mode. Right-click node → "Pin output". Pinned data badge on node. Run with pinned data uses saved snapshot. Clear pins before production deploy. |
| **Plan file** | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` |

### Decision 3.5 — DateTime and JMESPath

| | Decision |
|---|---|
| **n8n does** | Luxon library for all DateTime handling. Full timezone-aware operations. JMESPath via `$jmespath(obj, expr)` for complex JSON traversal. |
| **FlowHolt will** | Luxon as DateTime standard. `$jmespath()` as power-user function (not primary API). Expose Luxon via `$now`, `$today`, `DateTime` in expression context. |
| **Plan file** | `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` |

---

## Domain 5: Environments and Source Control

**Raw source:** `research/n8n-docs-export/pages_markdown/source-control-environments/`  
**Vault:** [[wiki/concepts/environment-deployment]]  
**Plan file:** `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md`

### Decision 5.1 — FlowHolt Pipeline vs n8n Git Model

| | Decision |
|---|---|
| **n8n does** | Git branches + separate instances. Users must understand Git. No built-in promotion workflow. |
| **Make does** | No environment pipeline |
| **FlowHolt will** | Built-in Draft→Staging→Production pipeline per workspace. Fully managed — no Git required. This is a major competitive advantage. Keep it. |

### Decision 5.2 — Visual Workflow Diff

| | Decision |
|---|---|
| **n8n does** | When comparing versions: Added = green + "N" icon, Modified = orange + "M" icon, Deleted = red + "D" icon. Click modified node → JSON diff of exact parameter changes. |
| **FlowHolt will** | Implement this exact visual diff UX on the version comparison screen. Green/orange/red node highlighting. Click any modified node → parameter-level diff panel. |
| **Plan file** | `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` |

---

## Domain 6: User Management and RBAC

**Raw source:** `research/n8n-docs-export/pages_markdown/user-management/`  
**Vault:** [[wiki/concepts/permissions-governance]]  
**Plan file:** `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md`

### Decision 6.1 — Separate Publish Permission

| | Decision |
|---|---|
| **n8n does** | `workflow:publish` as a separate permission scope from `workflow:update`. Editors can edit; only those with publish scope can push to production. |
| **FlowHolt will** | Confirm `can_publish` is a separate capability from `can_edit`. A user can have edit access to a workflow but not publish it to production. |
| **Plan file** | `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md` |

### Decision 6.2 — Global vs Project-Scoped Resources

| | Decision |
|---|---|
| **n8n does** | Tags and Variables are instance-global. Credentials and workflows are project-scoped. |
| **FlowHolt will** | Variables: workspace-scoped by default, promotable to team-scoped (admin). Tags: workspace-scoped. Credentials: workspace-scoped with explicit cross-workspace sharing by admin. |
| **Plan file** | `04-FLOWHOLT-CONTROL-PLANE-SKELETON.md` |

---

## Domain 7: Core Nodes

**Raw source:** `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/` (28 pages)  
**Vault:** [[wiki/data/node-type-inventory]]  
**Plan file:** `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`

### Decision 7.1 — Merge Node Strategies

| | Decision |
|---|---|
| **n8n does** | Merge node with 5 strategies: Append (all items), Combine by field (inner join), Combine by position (zip), Cross-product (all combinations), SQL Query (arbitrary SQL merge) |
| **Make does** | Array aggregator (append only) |
| **FlowHolt will** | Merge node with all 5 n8n strategies. SQL Query strategy deferred to v2. |
| **Open decision #20 resolved** | `route_barrier` / join node = Merge node with strategies |
| **Plan file** | `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` |

### Decision 7.2 — Switch Node Expression Mode

| | Decision |
|---|---|
| **n8n does** | Switch node has two modes: Rules (UI-built conditions) and Expression (single `{{ }}` expression returns a route name) |
| **Make does** | Router with condition blocks only |
| **FlowHolt will** | Switch node with both Rules and Expression modes. Expression mode allows advanced routing via single expression. |
| **Plan file** | `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` |

### Decision 7.3 — Critical Missing Node Types

The following node types are confirmed ❌ gaps that must be built:

| Node | Priority | n8n Source |
|------|----------|-----------|
| Error Trigger | Must-Have | n8n-docs: `nodes-base.errorTrigger` |
| Form Trigger | Must-Have | n8n-docs: `nodes-base.formTrigger` |
| Chat Trigger | Must-Have | n8n-docs: `nodes-base.chatTrigger` |
| Summarize | High-Value | n8n-docs: `nodes-base.summarize` |
| Compare Datasets | High-Value | n8n-docs: `nodes-base.compareDatasets` |
| MCP Client | Must-Have | n8n-docs: `nodes-langchain.mcpClientTool` |
| MCP Server | Must-Have | n8n-docs: `@n8n/n8n-nodes-langchain.mcpTrigger` |

**Plan file:** `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`

---

## Domain 8: Scaling and Architecture

**Raw source:** `research/n8n-docs-export/pages_markdown/hosting/scaling/` (10 pages)  
**Vault:** [[wiki/concepts/backend-architecture]]  
**Plan file:** `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md`

### Decision 8.1 — Postgres-as-Queue Validated

FlowHolt's `SELECT FOR UPDATE SKIP LOCKED` job queue is architecturally sound. n8n uses Redis + BullMQ; FlowHolt uses Postgres. The Windmill pattern is valid and avoids a Redis dependency at early stage.

### Decision 8.2 — Missing Health Endpoints

| Gap | Action |
|-----|--------|
| `/healthz/readiness` (checks DB + migrations) | Add to `system` router |
| `/metrics` (Prometheus format) | Add with `N8N_METRICS` equivalent env var |

**Plan file:** `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md`

### Decision 8.3 — Binary Data at Scale

For queue mode with multiple workers: shared filesystem is NOT viable. Plan S3 for production binary data.

| Mode | When |
|------|------|
| Database mode | Development / single-instance |
| S3 mode | Production / multi-worker |

**Plan file:** `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md`

---

## Domain 9: Analytics and Insights

**Raw source:** `research/n8n-docs-export/pages_markdown/insights/` (4 pages)  
**Vault:** [[wiki/concepts/observability-analytics]]  
**Plan file:** `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md`

### Decision 9.1 — Production-Only Analytics

Only production executions count in analytics dashboards. Manual test runs and sub-workflow executions are excluded. This matches n8n insights model and prevents test noise from polluting metrics.

### Decision 9.2 — Time Saved Metric

"Time saved" is the primary ROI metric for enterprise selling. Two modes:
- Fixed: one static value per execution (e.g., "this workflow saves 5 minutes each run")
- Dynamic: sum of "Time Saved" node values × item count

Implement both. Show on Overview dashboard.

---

## Domain 10: Community Nodes Security

**Raw source:** `research/n8n-docs-export/pages_markdown/integrations/community-nodes/` (6 pages)  
**Vault:** [[wiki/concepts/observability-analytics]] (appended)  
**Plan file:** `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md`

If FlowHolt adds a plugin/community node system:
- Default: disabled unless explicitly enabled per environment
- Verified nodes only in production
- Task runner sidecar isolation applies to plugin nodes
- Maintain internal blocklist + reporting mechanism

---

## n8n Findings Not Yet Absorbed Into Plan Files

These findings from n8n research are documented in the vault but not yet reflected in specific plan files:

| Finding | Vault page | Plan file to update |
|---------|-----------|---------------------|
| Chat Hub (Chat Trigger → Agent → response) | [[wiki/concepts/ai-agents]] | `05-FLOWHOLT-AI-AGENTS-SKELETON.md` |
| Wait node (pause on duration or webhook resume) | [[wiki/concepts/execution-model]] | `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` |
| Execution data pruning TTL config | [[wiki/concepts/backend-architecture]] | `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` |
| Log streaming (45+ event types to syslog/webhook/Sentry) | [[wiki/concepts/observability-analytics]] | `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` |
| Protected instance / read-only production | [[wiki/concepts/environment-deployment]] | `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` |

---

## n8n Research Status

All 10 domains complete. See [[wiki/entities/n8n]] for full domain index and findings.

| Domain | Pages | Status |
|--------|-------|--------|
| AI Agents + Cluster Nodes | ~50 | ✅ Complete |
| Flow Logic + Lifecycle | ~25 | ✅ Complete |
| Data Model + Expressions | 25 | ✅ Complete |
| Environments + Source Control | ~15 | ✅ Complete |
| User Management + RBAC | ~10 | ✅ Complete |
| Core Nodes | 28 | ✅ Complete |
| Scaling + Architecture | 10 | ✅ Complete |
| Analytics + Insights | 4 | ✅ Complete |
| Community Nodes | 6 | ✅ Complete |
| **Total** | **~173 priority pages** | **✅ All complete** |
