# SESSION CHECKPOINT

> **Purpose:** Cross-session continuity tracker. Each session updates this file so the next session knows exactly where to pick up.
> **Rule:** Update this file at the END of every implementation session before closing.

---

## LATEST CHECKPOINT

**Date:** 2026-05-xx (session 91 — Research Sprint)
**Branch:** `codex/zero-budget-backend`
**Last commit:** `d9b953ce` - Sprint 86 polish + research reorganization
**Build status:** OK - `npm run build` RC=0 (all chunks clean)

### Current State Summary

The platform is **fully functional** with a working frontend + backend. Sessions 91-94 are pure research sprints — 5 new spec files written (90–94), covering error handlers, analytics/insights, data stores/variables, workflow history/blueprints, and AI agents (comprehensive synthesis of Make New Agents + n8n AI nodes).

- **Frontend:** React/Vite on `localhost:5173`. Full dashboard shell, Studio editor with canvas, 30+ pages.
- **Backend:** FastAPI on `localhost:8001`. SQLite DB, 60+ node executors, workflow CRUD, execution engine.
- **Research specs:** 95 files (00–94) now complete. Files 90–94 are the newest comprehensive specs.

### What Was Done in Sprint 91 (Research Sprint — Error Handlers, Analytics, Variables, History, AI Agents)

**Make.com files read and absorbed (new this sprint):**
- `quick-error-handling-reference.md` — Break/Commit/Ignore/Resume/Rollback table (reference)
- `types-of-errors.md` — 13 named error types with HTTP codes, auto-retry behavior, fatal errors
- `scenario-settings.md` — Sequential processing, Data confidential, Store incomplete executions, Enable data loss, Auto commit (default ON), Commit trigger last, Max cycles, Consecutive errors count
- `scenario-history.md` — Execution history tab: run entries + change log, Details panel, column filter, export CSV, fulltext search (Pro+)
- `aggregator.md` — Array Aggregator: Source Module, Group by, Stop if empty aggregation
- `router.md` — Sequential route processing, fallback route, route ordering panel, Select whole branch
- `automatic-retry-of-incomplete-executions.md` — Exponential backoff schedule for ConnectionError/RateLimitError/ModuleTimeoutError (8 retry intervals up to 7h51m), Break handler retry (default 3 attempts × 15min), 3 parallel retry limit per scenario
- `subscenarios.md` — Synchronous + asynchronous sub-workflow modes, sub-workflow as AI agent tool, zero-credit calls, 10-level nesting limit
- `introduction-to-make-ai-agents-new.md` — AI agents overview: LLM, AI Provider, Reasoning, Instructions, Knowledge, Tools, Files
- `make-ai-agents-new-app.md` — Run an Agent module: Connection, Model, Instructions, Input, Input files, Conversation ID, Max history, Step timeout, Response format, Output (response/metadata/reasoning), Credit usage table

**From prior session (already read, now synthesized into specs 91-94):**
- `ai-agents-configuration.md` — System prompt, Context (RAG), MCP tools, Testing & Training chat
- `data-stores.md` — Key-value DB system with 7 modules
- `custom-variables.md` — Org/team persistent variables with history log
- `analytics-dashboard.md` — Enterprise analytics
- `scenario-variables.md` — Temporary run-scoped variables
- `blueprints.md` — JSON export/import
- `incomplete-executions.md` — Break handler, incomplete execution queue
- `ai-agent-best-practices.md` — Tool naming, layered prompt architecture, RAG, max tokens/steps

**New spec files written this sprint:**
1. `90-FLOWHOLT-ERROR-HANDLERS-DEEP-SPEC.md` (12,233 chars) — All 5 Make error handlers + n8n Error Workflow + Incomplete Executions + Stop and Error node + canvas visualization + backend schema
2. `91-FLOWHOLT-ANALYTICS-INSIGHTS-DEEP-SPEC.md` (10,866 chars) — Insights summary banner, dashboard, Time Saved (Fixed + Dynamic), per-plan tiers, credits usage, Time Saved node spec
3. `92-FLOWHOLT-DATA-STORES-VARIABLES-DEEP-SPEC.md` (14,989 chars) — 3-tier variables (workflow/workspace/org), Data Store CRUD (7 modules), Data Structures schema, converger patterns, incremental vars, backend schema
4. `93-FLOWHOLT-HISTORY-BLUEPRINTS-VERSION-CONTROL-SPEC.md` (15,248 chars) — Execution history, version snapshots, named versions, blueprint JSON export/import, all scenario settings, error types taxonomy, sub-workflow spec
5. `94-FLOWHOLT-AI-AGENTS-DEEP-SPEC.md` (16,838 chars) — AI Agent node, AI providers, Knowledge RAG system, 3 tool types, conversation memory, response format, reasoning, cost controls, agent vs standard workflow guide

**Updated files:**
- `research/_INDEX.md` — Updated to 95 files (00–94), added entries for specs 90–94
- `research/planning/SESSION-CHECKPOINT.md` — This update

### Key Technical Decisions from This Sprint

1. **Error types taxonomy**: Adopt Make's 13 named error types (AccountValidationError, BundleValidationError, ConnectionError, etc.) with exact HTTP code mapping and auto-retry behavior
2. **Automatic retry backoff**: Exact 8-step schedule (1m, 10m, 10m, 30m, 30m, 30m, 3h, 3h) for ConnectionError/RateLimitError/ModuleTimeoutError
3. **Fatal errors** (auto-deactivate immediately): DataSizeLimitExceeded, InconsistencyError, OperationsLimitExceeded
4. **Sequential processing** as a workflow setting (not just router mode)
5. **Data confidential mode** for HIPAA/compliance workflows
6. **Auto-commit setting** (default ON) — controls ACID transaction behavior across entire workflow
7. **Consecutive errors → deactivation**: Default 3 for scheduled, 1 for instant triggers
8. **Insights**: Production-only tracking (exclude manual + sub-workflow runs); 7 metrics; Time Saved node (Fixed or Dynamic mode)
9. **3-tier variables**: Workflow (run-scoped) / Workspace (persistent) / Organization (enterprise)
10. **Variable history log** (who changed, when, previous→new value, 12-month retention)
11. **Data Stores**: 7 CRUD modules, optional Data Structure schema, 15MB max record size, strict mode
12. **Execution history**: Run entries + change log in same view (togglable); Details panel shows per-node bundle outputs
13. **Version retention**: Free=last 3 saves, Pro=7 days, Business=30 days, Enterprise=unlimited
14. **Named versions** (Pro+): Protected from pruning, bookmark icon
15. **Sub-workflows**: Sync + async modes; can be exposed as AI agent tool; zero-credit calls; max 10 nesting levels
16. **AI Agent built-in provider**: Available on FREE plan (uses FlowHolt credit pool)
17. **Custom AI provider**: Paid plans only; user's own API keys; 1 credit/operation (AI tokens billed by provider)
18. **AI conversation memory**: conversation_id field; max_conversation_history; stored in DB with compound unique key
19. **Max steps** (loop prevention): `tools_count × 10` recommended
20. **Reasoning tab** in AI Agent node output (for reasoning models)

### Next Session Priorities (Remaining Research)

**High-value Make docs not yet read:**
- `access-management.md` — RBAC roles, permissions, team management details
- `connections.md` — Credential management (sharing, reconnect, scopes)
- `dynamic-connections.md` — Dynamic credentials (expression-based connection selection)
- `aes-advanced-encryption-standard.md` — AES encryption module
- `digital-signature.md` — Digital signature module
- `pgp-pretty-good-privacy.md` — PGP encryption
- `custom-functions.md` — Custom JS functions (Enterprise)
- `incremental-variables.md` — Auto-increment variable type
- `scenario-run-replay.md` — Replay executions feature
- `knowledge.md` — Knowledge management (more detail on RAG in Make AI)
- `mcp-toolboxes.md` — MCP toolboxes feature
- `organizations.md` + `teams.md` — Multi-org structure
- `webhooks.md` — Webhook node full details

**High-value n8n files not yet read:**
- `courses__level-two__chapter-5__chapter-5_2.md`, `chapter-5_3.md` — Advanced workflow patterns
- `integrations__builtin__core-nodes__` (remaining nodes)
- n8n workflow JSON examples (`agents_vs_chains.json`, etc.)
- n8n hosting/scaling files (for spec 85 validation)

**Spec updates still pending:**
- Update Spec 80 (Flow Logic) — Add Make Router sequential mode + fallback route details
- Update Spec 86 (Expression Methods) — Add Make-only math functions (formatNumber, parseNumber, power, sqrt)
- Update Spec 83 (Workflow Management) — Add scenario settings from this sprint
- Update Spec 81 (AI Architecture) — Cross-reference with Spec 94 new AI agent details

**Next new specs to write:**
- Spec 95: RBAC + Access Management (Make access-management + teams + organizations + n8n RBAC)
- Spec 96: Credentials + Connections (Make connections + dynamic connections + n8n credentials)
- Spec 97: Encryption, Digital Signatures, Security (AES, PGP, digital signature modules)

### Previous Sprint Archive



**Make.com files read and absorbed:**
- `error-handlers.md` — overview of 5 handler types
- `quick-error-handling-reference.md` — Break/Commit/Ignore/Resume/Rollback behavior table
- `aggregator.md` — Array Aggregator: accumulate N bundles → 1 bundle, Group by, Stop if empty
- `custom-functions.md` — Enterprise-only JS functions: 300ms, 5000 chars, no HTTP, no recursion, version history
- `math-functions.md` (complete) — abs, average, ceil, floor, max, min, round(precision), sum, parseNumber, formatNumber, sqrt, power
- `date-and-time-functions.md` (continued) — addHours, addMinutes (+ all addX variants), full moment.js token list

**n8n files (from prior session, synthesized this session):**
- `data__expression-reference__root.md` — All global vars: `$()`, `$binary`, `$execution`, `$fromAI()`, `$if()`, `$ifEmpty()`, `$input`, `$itemIndex`, `$jmespath()`, `$json`, `$max()`, `$min()`, `$nodeVersion`, `$now`, `$pageCount`, `$parameter`, `$prevNode`, `$request`, `$response`, `$runIndex`, `$secrets`, `$today`, `$vars`, `$workflow`
- `data__specific-data-types__luxon.md` — Luxon DateTime complete reference
- `data__specific-data-types__jmespath.md` — JMESPath (n8n reverses param order!)
- `integrations__builtin__core-nodes__n8n-nodes-base_formtrigger.md` — Form Trigger 12 field types
- `integrations__builtin__core-nodes__n8n-nodes-base_wait.md` — Wait node 4 resume modes

**New spec file written:**
1. `89-FLOWHOLT-N8N-MAKE-CROSS-PLATFORM-SYNTHESIS-SPEC.md` (37.8KB) — Complete comparison:
   - Expression syntax comparison table (both styles accepted in FlowHolt)
   - Global variables reference (all 24 n8n vars + Make equivalents)
   - Global functions comparison ($if/$ifEmpty/$max/$min/$jmespath vs Make equivalents)
   - String methods (n8n + Make gaps identified, 15+ methods total)
   - Array functions (20 comparison table, 8 Make-only features to add: shuffle, distinct(key), CI-sort, etc.)
   - Date/time (Luxon vs moment.js tokens, FlowHolt supports both with auto-normalization)
   - Math functions (12 Make-only: formatNumber, parseNumber, power, sqrt, average/sum as globals)
   - Hash functions (all 4 algos on both, top-level aliases for Make-compat)
   - Router (n8n parallel vs Make sequential → FlowHolt supports both with mode toggle)
   - Iterator + Aggregator (Make explicit pattern → FlowHolt adds both explicit Iterator AND Aggregator nodes)
   - Webhooks (queue 10K, sequential toggle, rate limiting 300/10s, auto-deactivate, 3/30/90 day logs)
   - Form Trigger (12 n8n types → FlowHolt adds 3 more: Rating, Signature, Address; + multi-step forms)
   - Wait node (4 n8n modes → FlowHolt adds 2: On Approval, On AI Decision)
   - Error handling (Make 5-handler system → FlowHolt adds all 5 to node inspector + visual error routes)
   - Custom functions (Make Enterprise → FlowHolt 3-tier: Snippets/Functions/Lambda)
   - Data structures (Make schemas → FlowHolt optional strict-mode JSON Schema validation)
   - Execution model (n8n batch vs Make bundle → FlowHolt batch-primary with explicit Iterator option)
   - Gap analysis matrix (14 features in neither platform)
   - Implementation priority matrix (13 items ranked)
   - Full feature comparison table (30 dimensions)

**Updated:**
- `research/_INDEX.md` — Updated to 90 files (00–89), added spec 89 entry
- `research/planning/SESSION-CHECKPOINT.md` — This update

### Next Session Priorities

**Continue Make documentation reads (high-value remaining files):**
- `data-structures.md` — Make schema system (feeds into spec 89 section 15)
- `ai-agents-configuration.md` — Make AI agents (compare with spec 81)
- `break-error-handler.md`, `resume-error-handler.md` — Detailed error handler docs
- `incomplete-executions.md` — Queue system detailed spec
- `variables.md` — Make variables system (compare with $vars in n8n)
- `scenario-settings.md` — Compare with workflow settings in spec 83

**Continue n8n documentation reads (remaining high-value files):**
- `courses__level-two__` files — advanced n8n patterns
- `hosting-n8n__` files — deployment/queue configs (feeds spec 85)
- OEM deployment files — white-label config

**Spec updates needed (from this session's gap analysis):**
- Update spec 86 with Make-only function aliases (shake, distinct, formatNumber, etc.)
- Update spec 80 with Make error handler patterns (Break/Commit/Ignore/Resume/Rollback)
- Update spec 80 with Router sequential mode

### Key Findings This Session

1. **Router architecture difference is critical** — Make sequential vs n8n parallel. FlowHolt needs both with a toggle per Router node.
2. **JMESPath param order** — n8n reverses it from spec (object-first). Document prominently.
3. **$now behavior gotcha** — returns different types depending on context. FlowHolt should always return Luxon DateTime.
4. **Make has 5 error handlers vs n8n's 2** — FlowHolt should implement all 5 (Break/Commit/Ignore/Resume/Rollback) as node-level options AND as visual error route branches.
5. **Array indexing** — Make 1-based vs n8n 0-based. FlowHolt: 0-based in code, provide `first()`/`last()`/`nth()` helpers.
6. **Custom functions** — Make limits: 300ms, 5KB, sync, no HTTP, no recursion. These are real constraints. FlowHolt's Lambda tier removes them.
7. **Date token normalization** — YYYY (Make/moment) vs yyyy (n8n/Luxon). Expression engine must normalize.
8. **Form Trigger** — Make has no equivalent. This is a FlowHolt differentiator vs Make users.
9. **Aggregator + Iterator** — Critical Make pattern. n8n auto-iterates but lacks explicit Aggregator. FlowHolt adds both explicit nodes.

### What Was Done in Sprint 89 (Research Sprint — n8n Deep Dive Continued)

**40+ n8n documentation files read and absorbed** from `research/competitor-data/n8n/pages_markdown/` across batches:

**Reads:**
- Expression references: String (45+ methods), Array (30+), DateTime (30+), Number (12), Object (10)
- Advanced AI: $fromAI(), evaluations (light + metric), Chat Hub, tools/memory/agents/chains, human-fallback, streaming
- Data management: pinning, data tables, item linking, binary data, referencing nodes, custom variables
- Code builtins: all n8n metadata variables, Code node AI generation
- Workflow features: streaming, templates API schema, custom execution data, export/import
- Hosting: complete database table structure (24 tables)

**New spec files written (all in `research/flowholt-specs/`):**

1. `86-FLOWHOLT-EXPRESSION-METHODS-COMPLETE-SPEC.md` — Complete method catalogs: String (17 custom + JS native), Array (18 custom + JS native), Number (11 custom), Object (11 custom), DateTime (Luxon-based with all properties + methods), all global vars ($now, $today, $json, $input, $execution, $workflow, $env, $vars, $secrets), IIFE pattern, FlowHolt implementation gap analysis
2. `87-FLOWHOLT-DATA-MANAGEMENT-DEEP-SPEC.md` — Data pinning (rules, UI flow, combining with mocking), Data Tables (50MB limit, scoping, CRUD, vs Variables comparison), Binary data (8 nodes catalog, self-hosted constraints, env config), Item Linking (auto-link rules, error cases, pairedItem, itemMatching), Custom Execution Data (API, limits: 10 items, 255-char values), n8n database structure (24 tables + FlowHolt SQL schema)
3. `88-FLOWHOLT-AI-EVALUATION-CHAT-HUB-SPEC.md` — Evaluation system (light 4-step + metric-based with 5 built-in metrics + custom), Chat Hub (Chat user role, personal agents, workflow agents, admin controls), $fromAI() (signature, stars button, examples, implementation plan), Streaming (trigger + node requirements, SSE), Templates API (7 endpoints, two response schemas), Agents vs Chains vs Basic LLM, Memory catalog (7 types), Tools catalog, Human fallback pattern, Export/Import security warning

**Updated:**
- `research/_INDEX.md` — Updated to show 89 files (00–88), added new entries 86–88

**25+ n8n documentation files read and absorbed** from `research/competitor-data/n8n/pages_markdown/` (1499 files, 5MB total)

**New spec files written (all in `research/flowholt-specs/`):**

1. `79-FLOWHOLT-EXPRESSION-LANGUAGE-DEEP-SPEC.md` — Complete expression language: all 30+ context variables (`$if`, `$ifEmpty`, `$max`, `$min`, `$prevNode`, `$runIndex`, `$nodeVersion`, `$parameter`, `$secrets`, `$pageCount`), full string prototype extensions (20+ methods), array extensions (15+ methods), JMESPath patterns, Python code node patterns, implementation gap analysis
2. `80-FLOWHOLT-FLOW-LOGIC-PATTERNS-DEEP-SPEC.md` — Flow logic: execution model (v0/v1), error handling (all modes + error workflow), looping (auto-iteration, execute once, Loop Over Items batching), all Merge node modes (Append/Combine 5-way/SQL/Choose Branch), sub-workflows (3 input modes, execution linking), workflow publishing system (6 button states), complete settings list (12 settings), collaboration/edit lock
3. `81-FLOWHOLT-AI-LANGCHAIN-ARCHITECTURE-SPEC.md` — AI architecture: complete LangChain cluster node catalog (root + sub-nodes), all LLM providers (8), all memory backends (6), all tool types (7), all vector stores (7 with Supabase recommendation), RAG two-workflow pattern with chunking guide, Human-in-Loop HITL system (9 approval channels, `$tool` variable), MCP tools complete API (18+ tools), AI code generation patterns
4. `82-FLOWHOLT-NODE-BUILDER-ARCHITECTURE-SPEC.md` — Node builder: all 14 UI element types (String, Number, Boolean, Options, MultiOptions, Collection, FixedCollection, DateTime, Color, Filter, AssignmentCollection, ResourceLocator, ResourceMapper, plus routing), complete UX standards (5 text case rules, terminology, 5 help element types, field ordering, CRUD operations), credential files (API key + OAuth2), node versioning, usableAsTool pattern
5. `83-FLOWHOLT-WORKFLOW-MANAGEMENT-SPEC.md` — Workflow management: 5-state lifecycle model, 6 publish button states, version history (3 retention tiers), sharing/credentials behavior, complete settings reference (12 fields), execution management (manual/partial/production/retry), data pinning, edit lock/collaboration system, archive system, templates system, import/export, organization (tags, folders)
6. `84-FLOWHOLT-USER-MANAGEMENT-RBAC-SSO-SPEC.md` — User management: two-level role system (instance + project), complete permission matrix, invitation state machine, SAML setup (JIT provisioning, role claims `n8n_instance_role`+`n8n_projects`, enforce SSO), OIDC setup (5 provider discovery URLs), custom roles (45+ permission scopes across 7 resource types), 2FA flow, projects system
7. `85-FLOWHOLT-SCALING-HOSTING-ARCHITECTURE-SPEC.md` — Scaling: queue mode architecture (main/Redis/workers), BullMQ job format, env vars reference, task runners for Python isolation, external S3/R2 binary storage, database design (key tables + indices), HA setup, webhook infrastructure, execution data pruning, Render.com deployment guide

**Updated:**
- `research/_INDEX.md` — Updated to show 86 files (00–85), added new entries 79–85

---

## What To Do Next (Sprint 90 — Continue n8n Research OR Resume Implementation)

### Research Still Available (n8n — ~1450 files unread)

**High-priority files remaining:**
- `data__expression-reference__root.md` (10KB) — Global expression functions ($if, $ifEmpty, $max, etc.)
- `data__specific-data-types__luxon.md` (14KB) — Luxon full reference (many tokens remaining)
- `data__specific-data-types__jmespath.md` (9KB) — JMESPath query patterns
- `integrations__builtin__core-nodes__n8n-nodes-base_wait.md` (11KB) — Wait node full spec
- `integrations__builtin__core-nodes__n8n-nodes-base_formtrigger.md` (13KB) — Form Trigger
- `integrations__builtin__core-nodes__n8n-nodes-base_form.md` (15KB) — Form node
- `workflows__executions__execution-data-redaction.md` (8KB) — Data redaction patterns
- `hosting__configuration__external-hooks.md` (8KB) — External hooks
- `hosting__oem-deployment__managing-workflows.md` (14KB) — OEM deployment
- `courses__level-two__chapter-5__chapter-5_2.md` (19KB) — Advanced workflow patterns
- `courses__level-two__chapter-3.md` (12KB) — More workflow patterns
- `integrations__creating-nodes__build__programmatic-style-node.md` (18KB) — Full programmatic node example
- `integrations__creating-nodes__build__declarative-style-node.md` (17KB) — Full declarative node example

**Potential new specs from remaining reads:**
- Spec 89: Core Node Deep Reference (HTTP Request, Form Trigger, Wait, DateTime, Edit Image, HTML Extract)
- Spec 90: OEM Deployment + External Hooks + Execution Data Redaction
- Spec 91: Node Builder — Declarative vs Programmatic Style (full examples)

### Implementation Priorities (if switching back to code)

1. **Expression engine gaps** (from spec 79): `$if()`, `$ifEmpty()`, `$max()`, `$min()`, `$prevNode`, `$runIndex`, `$parameter`, `$secrets`, string/array prototype extensions
2. **Merge node modes** (from spec 80): Combine by matching fields (5 join types), SQL Query mode (AlaSQL), Cross-join, Choose Branch
3. **Loop Over Items node** (from spec 80): batching with loop-back connector
4. **Publish button states** (from spec 83): all 6 states, publish modal, named versions
5. **Edit lock system** (from spec 83): per-workflow lock, read-only mode, takeover
6. **Supabase Vector Store** (from spec 81): pgvector RAG integration

---

## Key Technical Notes

- **`get_db()` pattern:** Always `with get_db() as db:` -- it is a context manager. Never `db = get_db(); db.commit()`.
- **`executions` table columns:** `id`, `status`, `finished_at`, `duration_ms`, `steps_json`, `result_json`, `error_text` -- NOT `output_data` or `error`
- **Shell constraint:** `pwsh.exe` NOT available. Use Python subprocess for git/build commands.
- **LLM auto-routing order:** Gemini -> Groq -> OpenAI -> Anthropic -> DeepSeek -> xAI -> Ollama -> Mock
- **Supabase:** User has `SUPABASE_JWT_SECRET`, `GROQ_API_KEY`, `GEMINI_API_KEY` in `.env`

---

## Important File Locations (post-reorganization)

| What | Where |
|------|-------|
| Central research index | `research/_INDEX.md` |
| Implementation tracker | `research/planning/IMPLEMENTATION-MASTER.md` |
| Roadmap | `research/planning/ROADMAP.md` |
| Session log | `research/planning/SESSION-LOG.md` |
| Platform guide | `research/planning/PLATFORM_GUIDE.md` |
| Design specs (89 files — 00–88) | `research/flowholt-specs/` |
| Competitor data | `research/competitor-data/` |
| Vault knowledge base | `research/Vault/Project Memory/` |
