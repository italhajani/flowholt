# Log

Chronological record of all vault operations.
Format: `## [YYYY-MM-DD] type | description`
Types: `ingest`, `query`, `lint`, `build`

Parse with: `grep "^## \[" log.md | tail -10`

---

## [2026-04-17] build | UI Design System spec (file 59), IMPLEMENTATION-MASTER Phase 0B, vault cross-link strengthening

**New files:**
- `59-FLOWHOLT-UI-DESIGN-SYSTEM-AND-LAYOUT-SPEC.md` — complete design system: color tokens (white/black/green), typography, spacing, shadows, component patterns, dashboard layout, studio layout, node family visuals, responsive breakpoints, dark mode tokens
- `wiki/concepts/design-system.md` — vault concept page linking design system to all 9 UI-related spec files
- `IMPLEMENTATION-MASTER.md` → added Phase 0B (UI Redesign) with 20 tasks as a parallel track

**Vault strengthening:**
- Added 19 missing cross-links across 11 concept pages (error-handling, runtime-operations, execution-model, ai-agents, backend-architecture, observability-analytics, connections-integrations, expression-language, sub-workflows, data-store-functions, webhook-trigger-system)
- Added bidirectional design-system links to studio-anatomy and information-architecture
- Updated index.md, overview.md, CLAUDE.md, flowholt-plans.md with file 59 references
- Updated 98-NEXT-SESSION-PROMPT.md with file 59 and corrected next work items

**Memory:** Saved user design preferences (white/black/green, no purple, modern agentic inspirations)

---

## [2026-04-16] build | flowholt-ultimate-plan folder rebuilt (n8n-first direction)

Complete overhaul of `research/flowholt-ultimate-plan/` to reflect full n8n research completion.

**Files rebuilt (existing → n8n-grounded spec):**
- `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` — master direction reset: n8n > Make in influence weight, vault links throughout, design direction by domain, open decisions answerable by n8n research
- `05-FLOWHOLT-AI-AGENTS-SKELETON.md` → full AI agents spec: cluster node architecture, single unified Agent node, per-tool HITL, $fromAI(), memory phases (Buffer→Postgres→Redis), RAG pipeline, MCP bidirectionality, agent evaluation framework, Agents inventory page, 8 open decisions resolved
- `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` → full Studio surface spec: canvas visual language, node states, top bar publish states, Nodes panel with AI sub-nodes, inspector all field types, INPUT panel (Schema/Table/JSON + drag-to-expression), expression editor with autocomplete, data pinning, execution trace drawer, HITL pause state, edit locking, version history + visual diff
- `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` → full backend spec: 13 domain modules + extraction order, Postgres-as-queue validated, health endpoints (/health/ready + /metrics), execution data retention TTL, S3 binary data mode, Code node isolation, entity/event model, phased implementation
- `README.md` — complete rewrite: n8n-first direction statement, full file registry, research completion table, vault connections, reading order

**New files created:**
- `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` — decision register mapping every n8n finding to FlowHolt design decision (all 10 domains, Domains 1/2/3/5/6/7/8/9/10)
- `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` — FlowItem type, `{{ }}` syntax, all context variables ($json/$input/$now/$vars), full method library (string/array/object/number/DateTime), Luxon, JMESPath, $fromAI(), data pinning, workspace variables, phased implementation
- `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` — full node catalog with ✅/⚠️/❌ status: Triggers (Form/Chat/Error ❌), Flow Control (Wait/Execute Workflow ❌), Data Transform (Summarize/Aggregate/Split Out ❌), HTTP (pagination gap), Code, File/Binary, AI Cluster, Utility; priority matrix (Must-Have/High-Value/Nice-to-Have)
- `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` — dual Make+n8n gap matrix across all 10 domains; FlowHolt competitive advantages table; gap-closing priority by phase

**Open decisions resolved (4 of 25):**
- #10: Agent tool type phasing — Phase 1: Workflow/Code/HTTP. Phase 2: RAG. Phase 3: MCP/Sub-agent/App.
- #13: Memory node in v1 — Buffer Window Memory only
- #18: MCP management location — Connections → External MCP Servers
- #19: Subscenario equivalent — Workflow Tool node, quota-free
- #20: route_barrier / join node — Merge node with 5 strategies (partially resolved)

**n8n raw source tracing:** Every design decision in new files cites specific n8n docs pages or domain. Make source citations point to `make-pdf-full.txt` and `make-help-center-export/`. Vault wikilinks on every file.

## [2026-04-16] ingest | n8n Phase 2 — Domains 7, 8, 9, 10 (Core Nodes, Scaling, Analytics, Community)

Deep read of 48 n8n documentation pages across the final four pending domains.

**Domain 7 — Core Nodes (28 pages):**
- New page created: `wiki/data/node-type-inventory.md` — complete FlowHolt node catalog with n8n equivalents, current FlowHolt status (✅/⚠️/❌), and priority matrix (Must-Have / High-Value / Nice-to-Have)
- Key gaps identified: Error Trigger ❌, Form Trigger ❌, Chat Trigger ❌, Summarize ❌, Compare Datasets ❌
- Key signals: Merge node needs 5 strategies not just Append; Switch needs Expression mode; Loop needs conditional reset for pagination

**Domain 8 — Scaling/Architecture (10 pages):**
- Updated: `wiki/concepts/backend-architecture.md` — n8n topology (Main + Workers + Redis + Postgres), key env vars, execution data pruning config, binary data at scale (S3), task runner isolation, health check endpoints
- Key validation: FlowHolt's Postgres-as-queue is architecturally sound (Windmill pattern, `SELECT FOR UPDATE SKIP LOCKED`)
- Key gaps: `/healthz/readiness` endpoint (DB connectivity check), Prometheus `/metrics` endpoint, S3 binary data plan

**Domain 9 — Analytics (4 pages):**
- Updated: `wiki/concepts/observability-analytics.md` — n8n insights system (production-only metrics, time saved, per-plan data ranges), log streaming (45+ event types, 3 destination types), health endpoints
- Key signal: Only count production executions in analytics. Time saved = key ROI metric for enterprise selling.

**Domain 10 — Community Nodes (6 pages):**
- Appended to `wiki/concepts/observability-analytics.md` — community node security model (full system access), verified vs unverified nodes, allowlisting approach, supply chain risk
- Key signal: Default to disabled for community nodes; only verified nodes in production; task runner isolation applies to plugin nodes too

**n8n research status: COMPLETE.** All 10 domains deep-read. Entity page updated to "COMPLETE."

**Remaining work before n8n integration is fully absorbed:**
- Merge n8n insights into master plan (plan files 49+)
- 25 open planning decisions in `wiki/data/open-decisions.md` — many now answerable with n8n research

---

## [2026-04-16] ingest | n8n Phase 2 — Domain 3: Data Model + Expression Language

Deep read of 25 n8n documentation pages covering data model, expressions, data mapping UI, variables, JMESPath, Luxon, and binary data.

**New page created:**
- `wiki/concepts/expression-language.md` — FlowHolt expression language spec: `{{ }}` syntax, context variables, method library (string/array/object/number/DateTime), data mapping UI (drag-to-expression, Schema/Table/JSON views), data pinning, variables, JMESPath, Luxon, phased implementation plan

**Key FlowHolt design signals found:**
1. **Array-of-objects data model** — `[{json: {...}, binary: {...}}]` is the universal item format. Adopt this.
2. **{{ }} Handlebars delimiters** — proven, intuitive. Adopt directly.
3. **Drag-to-expression is the killer UX feature** — users drag fields from INPUT panel → auto-generates expression. Non-negotiable for non-technical users.
4. **$json, $input, $now, $vars** are the core 4 context variables needed in MVP. Full set is ~40.
5. **Data pinning** — save node outputs for test reuse. Dramatically speeds up development iteration.
6. **Luxon for all DateTime** — timezone-aware, full Luxon library. Required.
7. **JMESPath as power feature** — expose `$jmespath()` but don't make it the primary querying API.
8. **Chains are stateless** — confirmed again from data model perspective: no execution state between chain node runs.

**Index updated:** added `expression-language.md` to Concepts section.

---

## [2026-04-16] ingest | n8n Phase 2 — Domain 1: AI Agents + Cluster Nodes

Deep read of ~30 n8n documentation pages covering the full AI agent system and cluster node architecture.

**Pages read:**
- High-level: advanced-ai.md, ai-workflow-builder, chat-hub, rag-in-n8n, human-in-the-loop-tools, evaluation (2 pages), mcp (2 pages), langchain (2 pages)
- Examples: understand-agents, chains, memory, tools, vector-databases, agent-chain-comparison, api-workflow-tool, human-fallback
- Cluster root nodes: Agent (all 4 modes), LLM Chain, Retrieval QA, Summarization, Info Extractor, Sentiment Analysis, Text Classifier
- Cluster sub-nodes: Memory (Buffer Window, Manager), Tools (Workflow, AI Agent, MCP, HTTP, Code), Vector Store Retriever, Output Parser Structured
- Vector stores: Simple (in-memory), PGVector, Pinecone

**Pages updated:**
- `wiki/concepts/ai-agents.md` — major expansion: cluster node architecture, agent types, memory system, tool types, RAG pipeline (full detail), MCP bidirectionality, chat hub, evaluation framework, LangChain mapping, design signals summary
- `wiki/entities/n8n.md` — Domain 1 key findings added, pending tasks updated (Domain 1 now complete)

**Key FlowHolt design signals found:**
1. **Cluster node architecture** — adopt root+sub-node model with typed connector slots (tools, memory, retriever, llm) rather than sequential piping
2. **Single unified Agent node** — Tools Agent is the standard post-Feb 2025. No multiple agent types. Single node with mode (autonomous vs pipeline)
3. **Per-tool HITL gates** — human inbox needs upgrade from workflow-level pausing to per-tool approval. This is a significant capability gap.
4. **$fromAI() pattern** — implement `{{$fromAI("field", "desc", "type")}}` in tool parameter fields for AI-proposed values
5. **PGVector as production default** — reuse existing Postgres infra; Simple memory = dev only
6. **MCP bidirectionality** — expose FlowHolt workflows as MCP tools AND allow agents to consume external MCP servers. Major competitive differentiator vs Make.com.
7. **Evaluation framework** — test dataset + metric-based evaluation should be designed into agent inspector Test tab
8. **Chains are stateless** — memory is agent-exclusive by design. Chains (LLM Chain, Q&A Chain, Summarization) have no memory sub-nodes.

**Remaining n8n domains:**
- Domain 3 (Data + Expressions) — 25 pages → `wiki/concepts/expression-language.md` (new page)
- Domain 7 (Core Nodes) — 28 pages → `wiki/data/node-type-inventory.md` update
- Domain 8 (Scaling/Architecture) — 10 pages → `wiki/concepts/backend-architecture.md` update
- Domain 9 (Analytics) — 4 pages
- Domain 10 (Community Nodes) — 6 pages

---

## [2026-04-16] ingest | n8n Phase 2 — Domains 2, 4, 5, 6

Deep read of 34 n8n documentation pages across 4 domains.

**Domains completed:**
- **Domain 2 (Flow Logic):** execution order (depth-first v depth-breadth), looping, merging, splitting, sub-workflows, waiting, error handling pattern
- **Domain 4 (Workflow Lifecycle):** auto-save/publish separation, 6 publish button states, version history and naming, edit locking, execution quotas, node settings (Execute Once, On Error modes), workflow-level settings
- **Domain 5 (Environments/Source Control):** git-branch model (vs FlowHolt's built-in pipeline), what gets committed (workflow JSON, credential stubs, variable stubs, data table schemas), workflow diff UX (green/orange/red nodes + JSON diff), protected instance mode
- **Domain 6 (User Management/RBAC):** two-tier model (account types + project roles), 3 project roles (Admin/Editor/Viewer), custom role scope system (Enterprise), SSO options (SAML/OIDC/LDAP), global tags/variables

**Pages updated:**
- `wiki/concepts/execution-model.md` — branch execution order, node-level On Error modes, auto-save vs publish, workflow-level settings gaps
- `wiki/concepts/error-handling.md` — n8n error workflow pattern, Continue (error output) mode as FlowHolt gap
- `wiki/concepts/environment-deployment.md` — n8n version model comparison, publish button states, edit locking
- `wiki/concepts/permissions-governance.md` — n8n scope reference, two-tier RBAC comparison, global variables/tags question
- `wiki/entities/n8n.md` — research status updated (4 domains complete), key findings added per domain, pending tasks updated

**New pages created:**
- `wiki/concepts/sub-workflows.md` — sub-workflow design spec, typed I/O, caller whitelist, conversion UX

**Key FlowHolt design signals found:**
1. Sub-workflow executions should be quota-free (incentivizes decomposition)
2. "Continue (error output)" mode is a gap — add `on_error: continue_with_error` to node settings
3. Workflow diff UX: green/orange/red node highlighting + per-node JSON diff is the design to implement
4. `workflow:publish` as a separate permission scope from `workflow:update` — FlowHolt already has `can_publish` but confirm it's separate
5. FlowHolt's Draft→Staging→Production pipeline is a major competitive advantage over n8n's git-based approach
6. Edit locking needed — single editor at a time with auto-release on inactivity

**Remaining domains:**
- Domain 1 (AI Agents + Cluster Nodes) — ~50 pages, highest priority
- Domain 3 (Data + Expressions) — 25 pages
- Domain 7 (Core Nodes) — 28 pages
- Domain 8 (Scaling/Architecture) — 10 pages
- Domain 9 (Analytics) — 4 pages
- Domain 10 (Community Nodes) — 6 pages

## [2026-04-16] build | Vault initialized

Initial vault build from existing research.

**What was created:**
- `CLAUDE.md` — vault schema and constitution
- `index.md` — full page catalog
- `log.md` — this file
- `overview.md` — master FlowHolt synthesis
- `wiki/` folder structure (analyses, concepts, entities, sources, data)
- Entity pages: flowholt, make, n8n
- Source summary pages: make-help-center, make-pdf, n8n-docs, flowholt-plans
- Concept pages: all 16 major product domains
- Analysis pages: gap matrix, advantages, open decisions, n8n findings, make UI evidence
- Data pages: open-decisions, node-type-inventory, implementation-roadmap
- Obsidian canvas: flowholt-system-map.canvas

**Raw sources available at vault init:**
- Make.com help center: 324 pages (research/make-help-center-export/)
- Make.com PDF: ~31K lines (research/make-pdf-full.txt)
- Make.com UI crawl (research/make-advanced/)
- n8n docs: 1499 pages (research/n8n-docs-export/) — scraping completed 2026-04-16 16:09
- FlowHolt planning: 48 files (research/flowholt-ultimate-plan/)
- FlowHolt codebase: src/ + backend/

**Research phase status:**
- Make corpus: COMPLETE (all design-impacting sections absorbed into files 01–48)
- n8n corpus: SCRAPED, deep wiki integration PENDING
- FlowHolt codebase: read and cross-referenced in planning files

**MCP connection:**
- Obsidian MCP server connected via mcp-obsidian (filesystem access)
- Configured in: C:/Users/Gouhar Ali/AppData/Roaming/Code/User/mcp.json
- Vault path: D:/My work/flowholt3 - Copy/research/Vault

**Open items carried forward:**
- 25 unresolved planning decisions (see wiki/data/open-decisions.md)
- n8n deep integration not yet done (patterns, sub-workflows, expression language)
- Testing/QA spec not yet drafted
- Notification spec not yet drafted
- Billing/plan management spec not yet drafted
