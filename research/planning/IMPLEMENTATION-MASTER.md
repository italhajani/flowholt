# FLOWHOLT IMPLEMENTATION MASTER

> **Last updated:** 2026-04-18  
> **Branch:** `codex/zero-budget-backend`  
> **Phase 0:** COMPLETE | **Phase 0.5 (Refactor):** COMPLETE | **Phase 1A:** COMPLETE | **Phase 1B:** PARTIAL (1B.3 deferred) | **Phase 1C:** IN PROGRESS  

---

## SESSION INSTRUCTIONS

```
┌──────────────────────────────────────────────────────────────────────┐
│  NEW SESSION? READ THIS FILE FIRST.                                  │
│                                                                      │
│  1. Read this file → understand what's built and what's next         │
│  2. Go to § CURRENT SPRINT → see the active tasks                    │
│  3. Read the linked spec file(s) for the sprint's domain            │
│  4. Read the target source files before making changes               │
│  5. Build. After each task, check its box and update "Last updated" │
│                                                                      │
│  DO NOT read all 59 spec files. Only read those linked by your task.│
│  DO NOT restart or reorganize the plan. Extend what exists.          │
│  DO NOT modify research/raw source folders.                          │
└──────────────────────────────────────────────────────────────────────┘
```

**What FlowHolt is:** An automation workflow platform competing with Make.com and n8n. Tech stack: FastAPI + SQLite backend, React + TypeScript + Vite + Tailwind + XYFlow frontend. The research phase produced 59 implementation-grade spec files and a 48-page Obsidian knowledge vault. Phase 0 (foundation) is built and deployed. The platform now needs runtime maturity, control plane depth, and studio polish.

**Design direction:** Make gives control plane maturity. n8n gives execution logic and AI patterns. FlowHolt merges both and exceeds them with environment pipelines, capability-based permissions, managed AI agents, and HITL approval flows.

---

## NAVIGATION INDEX

| Layer | Path | Purpose |
|-------|------|---------|
| **This file** | `research/flowholt-ultimate-plan/IMPLEMENTATION-MASTER.md` | Implementation tracker — read first |
| **Spec files (00–59)** | `research/flowholt-ultimate-plan/XX-*.md` | Design details per domain |
| **Vault wiki** | `research/Vault/Project Memory/wiki/` | Persistent concept memory |
| **Vault overview** | `research/Vault/Project Memory/overview.md` | Master project synthesis |
| **Open decisions** | `research/Vault/Project Memory/wiki/data/open-decisions.md` | 3 unresolved business decisions |
| **Backend source** | `backend/app/` | Python/FastAPI |
| **Frontend source** | `src/` | React/TS |
| **Main backend** | `backend/app/main.py` | App creation, middleware, startup/shutdown (194 lines) |
| **Shared helpers** | `backend/app/helpers.py` | All shared business-logic helpers (2714 lines) |
| **Router imports** | `backend/app/_router_imports.py` | Wildcard import bundle for routers (378 lines) |
| **Routers** | `backend/app/routers/` | 13 domain-specific router modules (see below) |
| **Models** | `backend/app/models.py` | All Pydantic request/response models |
| **Executor** | `backend/app/executor.py` | Workflow execution engine |
| **Node registry** | `backend/app/node_registry.py` | All node type definitions |
| **Integrations** | `backend/app/integration_registry.py` | 13 SaaS integration implementations |
| **Expression engine** | `backend/app/expression_engine.py` | `{{ }}` template evaluator |
| **Dependencies** | `backend/app/deps.py` | Session, RBAC, audit dependency injection |
| **Errors** | `backend/app/errors.py` | Error type classes (Phase 1A target) |
| **Runtime state** | `backend/app/runtime_state.py` | Runtime state management |
| **Frontend Studio** | `src/components/studio/` | Canvas editor components |
| **Frontend pages** | `src/pages/` | Dashboard and Studio pages |

### Router Module Map (175 routes total)

| Router | File | Routes | Domain |
|--------|------|--------|--------|
| `system` | `routers/system.py` | 14 | Health, setup, system diagnostics |
| `identity` | `routers/identity.py` | 12 | Auth, login, signup, workspace members |
| `oauth` | `routers/oauth.py` | 4 | OAuth2 provider flows |
| `inbox` | `routers/inbox.py` | 4 | Human task inbox |
| `studio` | `routers/studio.py` | 28 | Node catalog, editor, step CRUD, test |
| `vault` | `routers/vault.py` | 13 | Connections, credentials, variables |
| `assistant` | `routers/assistant.py` | 11 | AI assistant, plan, draft, chat |
| `chat` | `routers/chat.py` | 13 | Chat threads, attachments, providers |
| `workflows` | `routers/workflows.py` | 37 | Workflow CRUD, versions, deploy, run |
| `executions` | `routers/executions.py` | 18 | Execution history, inspector, replay |
| `triggers` | `routers/triggers.py` | 11 | Webhooks, chat triggers, scheduled |
| `misc` | `routers/misc.py` | 9 | Templates, notifications, bulk ops |

### Quick-Access Spec Files (Most Referenced)

| Spec | Title | When You Need It |
|------|-------|-----------------|
| `44` | Error Handling & Resilience | Error handlers, retry, circuit breakers, dead-letter |
| `50` | Expression & Data Model | FlowItem, `{{ }}` syntax, context variables, Luxon |
| `53` | Expression Engine Implementation | Sandbox architecture, 191+ methods, security model |
| `51` | Node Type Inventory & Gaps | All node types, what's built vs missing |
| `36` | Control Plane Org/Team Design | Organization hierarchy, roles |
| `43` | Environment & Deployment Lifecycle | Draft→staging→production pipeline |
| `54` | Notification & Alerting | 100+ events, log streaming, audit log |
| `55` | Form System | Form Trigger, mid-flow forms, multi-step wizard |
| `56` | Testing & QA | Data pinning, evaluations, debug mode |
| `57` | Billing & Plan Management | Credits, plan tiers, team allocation |
| `58` | Template System & Marketplace | Templates, wizard, community nodes |

---

## CURRENT SPRINT: Phase 1C — Missing Core Nodes

**Status:** IN PROGRESS  
**Spec files:** `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`, `55-FLOWHOLT-FORM-SYSTEM-SPEC.md`, `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md`  
**Vault page:** `wiki/data/node-type-inventory.md`, `wiki/concepts/webhook-trigger-system.md`  
**Primary target files:** `backend/app/node_registry.py`, `backend/app/executor.py`, `backend/app/studio_nodes.py`, `backend/app/routers/system.py`

| # | Task | Spec Ref | Target Files | Deps | Size | Done |
|---|------|----------|-------------|------|------|------|
| 1C.1 | Error Trigger node (starts error notification workflow) | 51 §1, 44 §5 | `node_registry.py`, `executor.py` | 1A.1 | M | [ ] |
| 1C.2 | Wait node (4 modes: timer, datetime, webhook resume, form resume) | 51 §2 | `node_registry.py`, `executor.py` | — | L | [ ] |
| 1C.3 | Execute Workflow node (sub-workflow calls with typed I/O) | 51 §2 | `node_registry.py`, `executor.py` | — | L | [ ] |
| 1C.4 | Execute Workflow Trigger node (entry point for sub-workflows) | 51 §2 | `node_registry.py` | 1C.3 | M | [ ] |
| 1C.5 | Aggregate node (collect items into single item) | 51 §3 | `node_registry.py`, `executor.py`, `studio_nodes.py` | — | M | [x] |
| 1C.6 | Split Out node (expand array field into separate items) | 51 §3 | `node_registry.py`, `executor.py`, `studio_nodes.py` | — | M | [x] |
| 1C.7 | Form Trigger node (hosted form → triggers workflow) | 55 §2-3, 51 §1 | `node_registry.py`, `routers/triggers.py` | — | L | [ ] |
| 1C.8 | `/health/ready` readiness probe endpoint | 51 | `routers/system.py` | — | S | [x] |

**Completed in this sprint so far:** added first-class Aggregate and Split Out nodes and reconciled the plan to reflect the already-existing readiness probe.  
**Deferred carry-over:** 1B.3 (true JS sandbox with memory/CPU limits) still needs an architecture decision; the rest of Phase 1B is complete.  
**Next recommended step:** implement 1C.1 (Error Trigger) or 1C.2 (full Wait modes).

---

## PHASE 0 — FOUNDATION (COMPLETE)

Everything below is built and working. These items are the baseline.

### Backend Core

- [x] FastAPI application with 175 API endpoints — `backend/app/main.py` + `backend/app/routers/` (13 modules)
- [x] SQLite database with 20+ tables — `backend/app/db.py`, `backend/app/repository.py`
- [x] Configuration management — `backend/app/config.py`
- [x] CORS middleware, rate limiting — `backend/app/main.py`
- [x] Health check endpoint — `backend/app/routers/system.py`
- [x] Dependency injection module — `backend/app/deps.py`
- [x] Shared business-logic helpers — `backend/app/helpers.py` (2,714 lines)

### Authentication & Security

- [x] Session-based auth with JWT tokens — `backend/app/auth.py`, `backend/app/routers/identity.py`
- [x] Login / signup / dev-login endpoints — `backend/app/routers/identity.py`
- [x] Supabase integration support — `backend/app/auth.py`
- [x] OAuth2 flow for integrations (authorize, callback, token refresh) — `backend/app/routers/oauth.py`
- [x] HMAC webhook signature verification — `backend/app/security.py`
- [x] Role-based access control (owner, admin, builder, viewer) — `backend/app/deps.py`

### Workflow Engine

- [x] Full execution runtime with step-by-step processing — `backend/app/executor.py`
- [x] Expression engine with `{{ }}` syntax (dot notation, arithmetic, ternary) — `backend/app/expression_engine.py`
- [x] Execution pause/resume with callback support — `backend/app/executor.py`
- [x] Workflow versioning and version history — `backend/app/main.py`
- [x] Runtime state management — `backend/app/runtime_state.py`
- [x] Step-level retry (retry_on_fail, retry_count, retry_wait_ms, retry_backoff) — `backend/app/executor.py`

### Node Types (20+ implemented)

- [x] `trigger` — Manual and webhook triggers — `backend/app/node_registry.py`
- [x] `transform` — Data transformation — `backend/app/node_registry.py`
- [x] `condition` — If/else branching — `backend/app/node_registry.py`
- [x] `llm` — LLM API calls (Anthropic, OpenAI, Gemini, Groq, Ollama, DeepSeek, xAI) — `backend/app/node_registry.py`
- [x] `output` — Final output / response — `backend/app/node_registry.py`
- [x] `delay` — Wait/timer — `backend/app/node_registry.py`
- [x] `human` — Human task / approval — `backend/app/node_registry.py`
- [x] `callback` — External callback pause — `backend/app/node_registry.py`
- [x] `loop` — Iteration — `backend/app/node_registry.py`
- [x] `code` — JavaScript/Python code execution — `backend/app/node_registry.py`
- [x] `http_request` — HTTP API calls — `backend/app/node_registry.py`
- [x] `filter` — Data filtering — `backend/app/node_registry.py`
- [x] `merge` — Basic merge (append only) — `backend/app/node_registry.py`
- [x] `ai_agent` — AI agent orchestration — `backend/app/node_registry.py`
- [x] `ai_summarize` — AI text summarization — `backend/app/node_registry.py`
- [x] `ai_extract` — AI entity extraction — `backend/app/node_registry.py`
- [x] `ai_classify` — AI classification — `backend/app/node_registry.py`
- [x] `ai_sentiment` — Sentiment analysis — `backend/app/node_registry.py`
- [x] `ai_chat_model` — Chat model wrapper — `backend/app/node_registry.py`
- [x] `ai_memory` — Agent memory — `backend/app/node_registry.py`
- [x] `ai_tool` — Agent tool — `backend/app/node_registry.py`
- [x] `ai_output_parser` — Output parsing — `backend/app/node_registry.py`

### Integrations (13 implemented)

- [x] Slack (send message, approval buttons) — `backend/app/integration_registry.py`
- [x] Webhook (receive, post, respond, resume) — `backend/app/integration_registry.py`
- [x] Discord — `backend/app/integration_registry.py`
- [x] GitHub — `backend/app/integration_registry.py`
- [x] Gmail — `backend/app/integration_registry.py`
- [x] Google Sheets — `backend/app/integration_registry.py`
- [x] Jira (full CRUD) — `backend/app/integration_registry.py`
- [x] Linear (full CRUD) — `backend/app/integration_registry.py`
- [x] Notion — `backend/app/integration_registry.py`
- [x] Airtable — `backend/app/integration_registry.py`
- [x] SendGrid — `backend/app/integration_registry.py`
- [x] Stripe — `backend/app/integration_registry.py`
- [x] Telegram — `backend/app/integration_registry.py`
- [x] Twilio — `backend/app/integration_registry.py`

### Studio Frontend

- [x] Workflow canvas editor (XYFlow) — `src/components/studio/WorkflowStudio.tsx`
- [x] Node configuration panel — `src/components/studio/NodeConfigPanel.tsx`
- [x] Live execution inspector — `src/components/studio/NodeDetailsPanelLive.tsx`
- [x] Node palette (add nodes) — `src/components/studio/NodesPanel.tsx`
- [x] Expression builder dialog — `src/components/studio/ExpressionBuilderDialog.tsx`
- [x] Command bar — `src/components/studio/StudioCommandBar.tsx`
- [x] Status bar — `src/components/studio/StatusBar.tsx`
- [x] Chat panel sidebar — `src/components/studio/ChatPanel.tsx`

### Dashboard Pages (19 routes)

- [x] `/` — Auth / Login
- [x] `/chat/:workspaceId/:workflowId` — Public chat interface
- [x] `/dashboard/overview` — Dashboard overview
- [x] `/dashboard/workflows` — Workflow list/management
- [x] `/dashboard/templates` — Workflow templates
- [x] `/dashboard/executions` — Execution history
- [x] `/dashboard/executions/:executionId` — Execution detail
- [x] `/dashboard/integrations` — Integration catalog
- [x] `/dashboard/credentials` — Vault (credentials, connections, variables)
- [x] `/dashboard/settings` — Workspace settings
- [x] `/dashboard/system` — System status
- [x] `/dashboard/providers` — LLM provider configuration
- [x] `/dashboard/webhooks` — Webhook management
- [x] `/dashboard/audit` — Audit log viewer
- [x] `/dashboard/environment` — Deployment management
- [x] `/dashboard/chat` — Chat thread management
- [x] `/dashboard/ai-agents` — AI agent management
- [x] `/dashboard/help` — Help center
- [x] `/studio/workflows/:workflowId` — Studio editor

### Advanced Features

- [x] Deployment pipeline (draft → staging → production) — `backend/app/routers/workflows.py`, `backend/app/helpers.py`
- [x] Deployment approval workflows with review gates — `backend/app/routers/workflows.py`
- [x] Human task management (approvals, handoffs) — `backend/app/routers/inbox.py`
- [x] Chat trigger (public/embedded, streaming) — `backend/app/routers/triggers.py`
- [x] Vault asset system (encrypted credentials, connections, variables) — `backend/app/routers/vault.py`
- [x] Audit event logging — `backend/app/deps.py`
- [x] Notification system (basic in-app) — `backend/app/routers/misc.py`
- [x] Template system (basic) — `backend/app/routers/misc.py`
- [x] Execution artifact pruning — `backend/app/routers/triggers.py`
- [x] Workflow import/export API — `backend/app/routers/workflows.py`
- [x] LLM provider routing (Anthropic, OpenAI, Gemini, Groq, Ollama, DeepSeek, xAI) — `backend/app/llm_router.py`

---

## PHASE 0.5 — BACKEND REFACTOR: ROUTE EXTRACTION (COMPLETE)

**Completed:** 2026-04-17  
**Branch:** `codex/zero-budget-backend`  
**Purpose:** Extract monolithic `main.py` (9,219 lines) into organized router modules. Prerequisite for Phase 1 — working on error handling and expression engine requires clean, navigable source files.

### What was done

- [x] Created `backend/app/helpers.py` — extracted ~70 shared helper functions (2,714 lines)
- [x] Created `backend/app/_router_imports.py` — wildcard import bundle for all routers (378 lines)
- [x] Created `backend/app/routers/oauth.py` — 4 OAuth2 routes
- [x] Created `backend/app/routers/inbox.py` — 4 human task inbox routes
- [x] Created `backend/app/routers/studio.py` — 28 studio/node routes
- [x] Created `backend/app/routers/vault.py` — 13 vault/credential routes
- [x] Created `backend/app/routers/assistant.py` — 11 AI assistant routes
- [x] Created `backend/app/routers/chat.py` — 13 chat thread routes
- [x] Created `backend/app/routers/workflows.py` — 37 workflow CRUD/deploy routes
- [x] Created `backend/app/routers/executions.py` — 18 execution inspector routes
- [x] Created `backend/app/routers/triggers.py` — 11 webhook/trigger routes
- [x] Created `backend/app/routers/misc.py` — 9 template/notification/bulk routes
- [x] Cleaned `backend/app/main.py` — now 194 lines (middleware, startup, router registration)
- [x] Added `TestStepRequest`/`TestStepResponse` to `models.py` (were inline in old main.py)
- [x] Verified: 175 routes load, server starts on port 8099

### Architecture decisions

- **Circular import prevention:** Routers import from `_router_imports.py` (which re-exports helpers, models, deps, registries). Helpers import from lower-level modules only. `main.py` imports routers.
- **Inline helpers:** Some router-specific helpers (e.g., chat provider functions) stayed in their router files rather than going to `helpers.py`, keeping related code together.
- **No behavior changes:** Pure structural refactor — all route paths, parameter names, and response shapes preserved.

---

**Goal:** Replace purple theme with clean white/black/green design system. Can run in parallel with Phase 1.  
**Spec:** `59-FLOWHOLT-UI-DESIGN-SYSTEM-AND-LAYOUT-SPEC.md`  
**Vault:** `wiki/concepts/design-system.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 0B.1 | Replace Tailwind color tokens — remove purple, add zinc/emerald palette | 59 §1 | `tailwind.config.ts` | — | M | [ ] |
| 0B.2 | Update CSS variables and global styles to new palette | 59 §1 | `src/index.css` or global CSS | 0B.1 | M | [ ] |
| 0B.3 | Typography system — Inter font, 8-size scale, weight tokens | 59 §2 | `tailwind.config.ts`, global CSS | 0B.1 | S | [ ] |
| 0B.4 | Redesign sidebar — 5 sections (OVERVIEW/BUILD/DATA/TOOLS/SYSTEM), green active dot | 59 §8 | `src/components/layout/Sidebar.tsx` (or equivalent) | 0B.2 | L | [ ] |
| 0B.5 | Redesign dashboard page headers and content area styling | 59 §7 | Dashboard page components | 0B.2 | M | [ ] |
| 0B.6 | Button component — black primary, white secondary, ghost, destructive variants | 59 §5 | UI component library | 0B.2 | M | [ ] |
| 0B.7 | Input, Select, Textarea components — zinc borders, focus ring | 59 §5 | UI component library | 0B.2 | M | [ ] |
| 0B.8 | Card, Badge, Table component restyling | 59 §5 | UI component library | 0B.2 | M | [ ] |
| 0B.9 | Modal and Toast component restyling | 59 §5 | UI component library | 0B.2 | S | [ ] |
| 0B.10 | Studio TopBar redesign — white bg, black Run button, clean breadcrumb | 59 §9 | `src/components/studio/` | 0B.2 | M | [x] |
| 0B.11 | Studio canvas background — silver-white #FAFAFA + dot grid pattern | 59 §9 | Studio canvas component | 0B.2 | S | [x] |
| 0B.12 | Studio Inspector Panel — underline tabs, clean field styling | 59 §9 | `src/components/studio/NodeConfigPanel.tsx` | 0B.7 | M | [x] |
| 0B.13 | Studio Node Panel (left) — search field, node family sections | 59 §9 | `src/components/studio/NodesPanel.tsx` | 0B.2 | M | [x] |
| 0B.14 | Node visuals — 8 family color system (trigger=green, AI=black, etc.) | 59 §10 | Studio node components | 0B.2 | L | [x] |
| 0B.15 | Workflows page — status dots, health bars, clean table | 59 §11 | `src/pages/dashboard/Workflows.tsx` (or equivalent) | 0B.8 | M | [x] |
| 0B.16 | Overview/Dashboard page — stat cards, area chart, activity feed | 59 §11 | `src/pages/dashboard/Overview.tsx` (or equivalent) | 0B.8 | M | [x] |
| 0B.17 | Execution detail page — timeline, step cards, data viewer | 59 §11 | Execution detail page | 0B.8 | M | [x] |
| 0B.18 | Auth pages (Login/Register) — clean centered layout, black CTA button | 59 §7 | Auth page components | 0B.6 | M | [x] |
| 0B.19 | Studio StatusBar restyling — 36px, zinc palette | 59 §9 | `src/components/studio/StatusBar.tsx` | 0B.2 | S | [x] |
| 0B.20 | Remove all remaining purple/old-theme references | 59 | All files | 0B.1–19 | S | [ ] |
| 0B.21 | Integrations catalog redesign — discovery surface with Vault routing and governance framing | 67 §4 | `src/pages/dashboard/IntegrationsPage.tsx` | 0B.6 | M | [x] |
| 0B.22 | Public trigger surfaces — light shell, trust notes, focused content column | 62 §9 | `src/pages/PublicChatPage.tsx`, public fallback routes | 0B.6 | M | [x] |
| 0B.23 | Studio Vault inline flows — create, verify, refresh, and repair access without leaving the editor | 64 §4-7 | `src/components/studio/CredentialCreateOverlay.tsx`, `NodeConfigPanel.tsx`, `NodesPanel.tsx` | 0B.12, 0B.13 | M | [x] |
| 0B.24 | Studio utility surface cleanup — expression builder, settings modal, chat panel, and shared data viewer reset | 61 §3-5, 63 §8 | `src/components/studio/ExpressionBuilderDialog.tsx`, `WorkflowSettingsModal.tsx`, `ChatPanel.tsx`, `StudioDataViewer.tsx` | 0B.9, 0B.12 | M | [x] |
| 0B.25 | Templates gallery/detail redesign — transparent install path, live template detail, and Studio handoff | 66 §6, 67 Phase F | `src/pages/dashboard/TemplatesPage.tsx`, `src/components/dashboard/TemplateCard.tsx` | 0B.8, 0B.17 | M | [x] |
| 0B.26 | Webhooks control-plane redesign — trigger inventory, route detail, and delivery actions | 65 §8, 67 Phase E | `src/pages/dashboard/WebhooksPage.tsx` | 0B.17, 0B.25 | M | [x] |
| 0B.27 | Settings control-plane redesign — scoped shell, inheritance panel, and grouped operator policy surfaces | 65 §3, §6 | `src/pages/dashboard/SettingsPage.tsx` | 0B.21, 0B.26 | M | [x] |
| 0B.28 | Runtime control-plane redesign — health, queue pressure, deep checks, and operator routing | 65 §8 | `src/pages/dashboard/SystemStatusPage.tsx` | 0B.26, 0B.27 | M | [x] |
| 0B.29 | Environment control-plane redesign — draft/staging/production lanes, approval inbox, and route contracts | 65 §7 | `src/pages/dashboard/EnvironmentPage.tsx` | 0B.27, 0B.28 | M | [x] |
| 0B.30 | AI agent inventory redesign — managed entity framing, readiness surface, and persistent inspector | 66 §2 | `src/pages/dashboard/AIAgentsPage.tsx` | 0B.25, 0B.29 | M | [x] |

**Studio redesign progress:** the Studio shell is now live in `WorkflowStudio.tsx`, `TopBar.tsx`, and `StatusBar.tsx`; the panel/inspector layer is now live in `NodesPanel.tsx`, `NodeConfigPanel.tsx`, and `src/components/studio/fields/index.tsx`; the canvas layer is now also reset in `WorkflowCanvasLive.tsx` with the new silver-white grid, calmer node-card treatment, family color system, canvas controls, minimap, and diagnostics surfaces; Studio now has inline Vault create/verify behavior via `CredentialCreateOverlay.tsx`, `NodeConfigPanel.tsx`, and `NodesPanel.tsx`; and the remaining utility surfaces in `ExpressionBuilderDialog.tsx`, `WorkflowSettingsModal.tsx`, `ChatPanel.tsx`, and `StudioDataViewer.tsx` have also been pulled onto the same zinc/black/emerald language. The next Studio work should focus on richer attach/repair prompts and any remaining hidden legacy fragments rather than obvious utility-panel chrome.

**Dashboard shell progress:** the earlier route-by-route dashboard rewrite described here was superseded when the old frontend was intentionally wiped for a true restart, and the later scratch-built replacement foundation was also deleted again. The current repo truth is that there is no active frontend app layer in the repository. Any resumed frontend redesign work should therefore start from zero again instead of assuming the deleted shell-first rebuild still exists.

**Parallel note:** Phase 0B can run alongside Phase 1A–1D. The UI redesign is independent of backend runtime maturity work.

---

## PHASE 1 — RUNTIME MATURITY + CORE NODE GAPS

**Goal:** Production-ready execution, observability, and critical missing nodes.  
**Key vault pages:** `wiki/concepts/execution-model`, `wiki/concepts/error-handling`, `wiki/concepts/runtime-operations`, `wiki/concepts/expression-language`, `wiki/concepts/webhook-trigger-system`

### 1A: Error Handling Foundation (COMPLETE)

**Spec:** `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md`  
**Vault:** `wiki/concepts/error-handling.md`  
**Completed:** 2026-04-17 (verified all tasks were built during Phase 0)

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 1A.1 | Define 17 error type classes (11 Make + 6 FlowHolt extensions) | 44 §2 | `backend/app/errors.py` | — | M | [x] |
| 1A.2 | Implement Ignore handler (skip error, continue with null output) | 44 §1 | `executor.py` | 1A.1 | M | [x] |
| 1A.3 | Implement Break handler (store as incomplete, enable auto-retry) | 44 §1 | `executor.py`, `models.py` | 1A.1 | L | [x] |
| 1A.4 | Implement Rollback handler (undo ACID-tagged operations) | 44 §1 | `executor.py` | 1A.1 | L | [x] |
| 1A.5 | Implement Resume handler (continue with user-defined fallback value) | 44 §1 | `executor.py`, `node_registry.py` | 1A.1 | M | [x] |
| 1A.6 | Implement Commit handler (commit successful ops, stop gracefully) | 44 §1 | `executor.py` | 1A.1 | M | [x] |
| 1A.7 | Add `on_error` node-level setting (stop / continue / continue_with_error) | 44 §6 | `node_registry.py`, `executor.py` | 1A.2 | M | [x] |
| 1A.8 | Warning taxonomy (ExecutionInterruptedWarning, OutOfSpaceWarning) | 44 §7 | `errors.py`, `executor.py` | 1A.1 | S | [x] |

### 1B: Expression Engine — Full Implementation

**Spec:** `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md`, `53-FLOWHOLT-EXPRESSION-ENGINE-IMPLEMENTATION-SPEC.md`  
**Vault:** `wiki/concepts/expression-language.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 1B.1 | Template tokenizer — split `{{ }}` from literal text | 53 §3 | `expression_engine.py` | — | M | [x] |
| 1B.2 | Security lint pass (block forbidden AST patterns) | 53 §2 | `expression_engine.py` | 1B.1 | M | [x] |
| 1B.3 | Sandbox evaluation with memory/CPU limits | 53 §2 | `expression_engine.py` | 1B.1 | L | [ ] |
| 1B.4 | Context injection: `$json`, `$input`, `$now`, `$today`, `$vars` | 53 §4.7, 50 §3 | `expression_engine.py`, `executor.py` | 1B.3 | M | [x] |
| 1B.5 | String extension methods (19 FlowHolt helpers) | 53 §4.1 | `expression_engine.py` | 1B.3 | M | [x] |
| 1B.6 | Array + Number + Object + Boolean extensions | 53 §4.2-4.5 | `expression_engine.py` | 1B.3 | M | [x] |
| 1B.7 | Luxon DateTime integration (`$now`, formatting, arithmetic, timezone) | 53 §4.6, 50 §5 | `expression_engine.py` | 1B.4 | M | [x] |
| 1B.8 | Expression error types and inline error messages | 53 §5 | `expression_engine.py`, `errors.py` | 1B.3 | S | [x] |

### 1C: Missing Core Nodes

**Spec:** `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`, `55-FLOWHOLT-FORM-SYSTEM-SPEC.md`, `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md`  
**Vault:** `wiki/data/node-type-inventory.md`, `wiki/concepts/webhook-trigger-system.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 1C.1 | Error Trigger node (starts error notification workflow) | 51 §1, 44 §5 | `node_registry.py`, `executor.py` | 1A.1 | M | [ ] |
| 1C.2 | Wait node (4 modes: timer, datetime, webhook resume, form resume) | 51 §2 | `node_registry.py`, `executor.py` | — | L | [ ] |
| 1C.3 | Execute Workflow node (sub-workflow calls with typed I/O) | 51 §2 | `node_registry.py`, `executor.py` | — | L | [ ] |
| 1C.4 | Execute Workflow Trigger node (entry point for sub-workflows) | 51 §2 | `node_registry.py` | 1C.3 | M | [ ] |
| 1C.5 | Aggregate node (collect items into single item) | 51 §3 | `node_registry.py`, `executor.py`, `studio_nodes.py` | — | M | [x] |
| 1C.6 | Split Out node (expand array field into separate items) | 51 §3 | `node_registry.py`, `executor.py`, `studio_nodes.py` | — | M | [x] |
| 1C.7 | Form Trigger node (hosted form → triggers workflow) | 55 §2-3, 51 §1 | `node_registry.py`, `routers/triggers.py` (form endpoints) | — | L | [ ] |
| 1C.8 | `/health/ready` readiness probe endpoint | 51 | `routers/system.py` | — | S | [x] |

### 1D: Runtime Operations

**Spec:** `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md`, `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md`, `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md`, `54-FLOWHOLT-NOTIFICATION-AND-ALERTING-SPEC.md`  
**Vault:** `wiki/concepts/runtime-operations.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 1D.1 | Incomplete executions table + auto-retry (8 attempts, exponential backoff) | 44 §1, 19 | `models.py`, `executor.py`, new `retry_scheduler.py` | 1A.3 | L | [ ] |
| 1D.2 | Dead-letter queue (from exhausted retries, fatal errors, rejected webhooks) | 44 §4 | `models.py`, new `dead_letter.py` | 1D.1 | M | [ ] |
| 1D.3 | Dead-letter reprocess endpoint (manual retry → new job) | 44 §4, 25 | `routers/executions.py` | 1D.2 | M | [ ] |
| 1D.4 | Consecutive error tracking → auto-deactivation (threshold: 8) | 54 §8 | `executor.py`, `helpers.py` | 1A.1 | M | [ ] |
| 1D.5 | Webhook queue management with plan limits | 42 | `routers/triggers.py` | — | M | [ ] |
| 1D.6 | Runtime operations dashboard page (queue, workers, failures) | 25, 29 | new `src/pages/dashboard/RuntimeOps.tsx` | 1D.1, 1D.2 | L | [ ] |

---

## PHASE 2 — CONTROL PLANE + STUDIO POLISH

**Goal:** Multi-team organization management and Studio maturity.  
**Key vault pages:** `wiki/concepts/control-plane`, `wiki/concepts/settings-catalog`, `wiki/concepts/environment-deployment`, `wiki/concepts/studio-anatomy`

### 2A: Org → Team → Workspace Hierarchy

**Spec:** `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md`, `04-FLOWHOLT-CONTROL-PLANE-SKELETON.md`  
**Vault:** `wiki/concepts/control-plane.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 2A.1 | Organization model + API (create, update, delete, list members) | 36 | `models.py`, `repository.py`, `routers/identity.py` | — | L | [ ] |
| 2A.2 | Team model + API (create, assign to org, manage members) | 36 | `models.py`, `repository.py`, `routers/identity.py` | 2A.1 | L | [ ] |
| 2A.3 | 5 org roles (owner, admin, member, billing, guest) | 36 | `deps.py` | 2A.1 | M | [ ] |
| 2A.4 | 5 team roles (admin, builder, operator, monitor, guest) | 36 | `deps.py` | 2A.2 | M | [ ] |
| 2A.5 | Workspace-to-team assignment + migration from flat workspace model | 36 | `repository.py`, `routers/identity.py` | 2A.2 | L | [ ] |
| 2A.6 | Frontend: Org/Team management pages | 36 | new `src/pages/dashboard/Org.tsx`, `Team.tsx` | 2A.1-2A.5 | L | [ ] |

### 2B: Settings Inheritance Chain

**Spec:** `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md`  
**Vault:** `wiki/concepts/settings-catalog.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 2B.1 | 6-level settings model (user → org → team → workspace → environment → workflow) | 38 | `config.py`, `main.py` | 2A.1 | L | [ ] |
| 2B.2 | Settings inheritance resolver (child inherits, can override, org can lock) | 38 | new `backend/app/settings_service.py` | 2B.1 | M | [ ] |
| 2B.3 | Weakening prevention (security settings at org level cannot be lowered downstream) | 38 | `settings_service.py` | 2B.2 | M | [ ] |
| 2B.4 | Custom workflow properties (Enterprise — WorkflowPropertyDefinition + Value) | 38 | `models.py`, `repository.py` | 2B.1 | M | [ ] |
| 2B.5 | Frontend: Settings pages with inheritance indicators | 38 | `src/pages/dashboard/Settings.tsx` | 2B.1-2B.3 | L | [ ] |

### 2C: Deployment Pipeline Maturity

**Spec:** `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md`  
**Vault:** `wiki/concepts/environment-deployment.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 2C.1 | Environment model (draft/staging/production) with scoped connections | 43 | `models.py`, `routers/workflows.py` | 2A.1 | L | [ ] |
| 2C.2 | Deployment approval flows (role-based review gates) | 43 | `routers/workflows.py`, `helpers.py` | 2C.1, 2A.4 | L | [ ] |
| 2C.3 | Instant rollback (revert to previous version in any environment) | 43 | `routers/workflows.py` | 2C.1 | M | [ ] |
| 2C.4 | Visual diff (green/orange/red node highlighting between versions) | 43 | Studio components | 2C.1 | L | [ ] |
| 2C.5 | Scenario recovery (auto-save + recovery dialog on re-open) | 43 §11 | `routers/workflows.py`, Studio components | — | M | [ ] |
| 2C.6 | Frontend: Environment management page polish | 43 | `src/pages/dashboard/Environment.tsx` | 2C.1-2C.3 | M | [ ] |

### 2D: Studio UX Maturity

**Spec:** `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md`, `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md`, `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md`, `56-FLOWHOLT-TESTING-AND-QA-SPEC.md`  
**Vault:** `wiki/concepts/studio-anatomy.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 2D.1 | Data pinning (pin/unpin node output, pin badge, stale warning) | 50 §8, 56 §2 | Studio components, `main.py` | 1B.4 | L | [ ] |
| 2D.2 | INPUT panel (Schema/Table/JSON views of previous node output) | 50, 07 | new Studio component | 1B.4 | L | [ ] |
| 2D.3 | Drag-to-expression (INPUT panel → expression field auto-generates `{{ }}`) | 50, 07 | Studio expression editor | 2D.2 | M | [ ] |
| 2D.4 | Full-screen expression editor modal with live preview | 53 §7, 07 | Studio components | 1B.4 | M | [ ] |
| 2D.5 | Expression autocomplete (data-aware, type-aware, method catalog) | 53 §7 | Studio expression editor | 2D.2, 1B.5-6 | L | [ ] |
| 2D.6 | Edit locking (single editor at a time per workflow) | 07 | `routers/workflows.py`, Studio components | — | M | [ ] |
| 2D.7 | Partial execution ("Execute up to here" / "Execute from here") | 56 §3 | `executor.py`, Studio components | 2D.1 | M | [ ] |
| 2D.8 | Workflow validation (disconnected nodes, missing fields, invalid expressions) | 56 §11 | `executor.py`, Studio components | 1B.2 | M | [ ] |

### 2E: Additional Nodes + HTTP Maturity

**Spec:** `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 2E.1 | Chat Trigger node (chat interface trigger with streaming) | 51 §1 | `node_registry.py` | — | M | [ ] |
| 2E.2 | Merge node — 5 strategies (Append, Combine by Field, Combine by Position, Cross-product, SQL) | 51 §2 | `node_registry.py` | — | L | [ ] |
| 2E.3 | Summarize node (aggregate data with grouping) | 51 §3 | `node_registry.py` | — | M | [ ] |
| 2E.4 | Compare Datasets node (diff two data sets) | 51 §3 | `node_registry.py` | — | M | [ ] |
| 2E.5 | HTTP Request — 3 pagination modes (offset, cursor, link header) | 51 §4 | `node_registry.py`, `integration_registry.py` | — | L | [ ] |

### 2F: Observability + Log Streaming

**Spec:** `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md`, `54-FLOWHOLT-NOTIFICATION-AND-ALERTING-SPEC.md`  
**Vault:** `wiki/concepts/observability-analytics.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 2F.1 | Event bus (internal pub/sub for all platform events) | 54 §1 | new `backend/app/event_bus.py` | — | L | [ ] |
| 2F.2 | Full event taxonomy (100+ events: workflow, execution, node, connection, auth, credit) | 54 §5 | `event_bus.py` | 2F.1 | L | [ ] |
| 2F.3 | Log streaming destinations (Syslog, webhook, Sentry) | 54 §5 | new `backend/app/log_streaming.py` | 2F.1 | L | [ ] |
| 2F.4 | Prometheus metrics endpoint | 41 | `routers/system.py` | — | M | [ ] |
| 2F.5 | Audit log with filters, export, retention policies | 54 §6 | `routers/misc.py`, `src/pages/dashboard/Audit.tsx` | 2F.1 | M | [ ] |

---

## PHASE 3 — CAPABILITY SYSTEM + AI + ADVANCED

**Goal:** Explicit permission model, managed AI agents, and advanced features.  
**Key vault pages:** `wiki/concepts/permissions-governance`, `wiki/concepts/ai-agents`

### 3A: Capability System

**Spec:** `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md`, `31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md`, `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md`  
**Vault:** `wiki/concepts/permissions-governance.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 3A.1 | Capability objects (Workflow, Node, Execution, VaultAsset) | 28, 31 | new `backend/app/capabilities.py` | 2A.3-4 | L | [ ] |
| 3A.2 | Backend capability builders (resolve role + context → granted actions) | 28 | `capabilities.py` | 3A.1 | L | [ ] |
| 3A.3 | Frontend `can*` objects in API responses | 31 | `routers/`, all API responses | 3A.2 | L | [ ] |
| 3A.4 | Denial response contracts (structured error + upgrade hint) | 34 | `capabilities.py`, `errors.py` | 3A.2 | M | [ ] |
| 3A.5 | Field sensitivity classes on node inspector (public/template/reference/secret/binary) | 34 | `node_registry.py`, Studio components | 3A.1 | M | [ ] |
| 3A.6 | Frontend: Permission-aware UI (hide/disable based on `can*` flags) | 31 | All frontend components | 3A.3 | L | [ ] |

### 3B: AI Agent Management

**Spec:** `05-FLOWHOLT-AI-AGENTS-SKELETON.md`, `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md`  
**Vault:** `wiki/concepts/ai-agents.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 3B.1 | Agent entity model (managed agent with name, config, version, status) | 37 | `models.py`, `repository.py` | — | L | [ ] |
| 3B.2 | Agent inventory page (list, search, create, delete agents) | 37 | `src/pages/dashboard/AIAgents.tsx` | 3B.1 | L | [ ] |
| 3B.3 | Agent cluster node architecture (root + typed sub-node connector slots) | 05, 37 | `node_registry.py`, Studio components | 3B.1 | L | [ ] |
| 3B.4 | Module tools: Workflow Tool, Code Tool, HTTP Tool | 37 | `node_registry.py` | 3B.3 | L | [ ] |
| 3B.5 | HITL per-tool (require-approval toggle, review UI) | 37 | `executor.py`, Studio components | 3B.3 | M | [ ] |
| 3B.6 | Agent testing tab (test agent with sample inputs, view reasoning) | 37, 56 | Agent detail page | 3B.2 | M | [ ] |
| 3B.7 | Memory types: Buffer Window (v1), conversation memory per session | 37 | `node_registry.py`, `executor.py` | 3B.3 | M | [ ] |

### 3C: Knowledge/RAG + MCP

**Spec:** `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md`  
**Vault:** `wiki/concepts/ai-agents.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 3C.1 | Knowledge system (file upload → chunk → embed → retrieve) | 37 | new `backend/app/knowledge.py` | — | L | [ ] |
| 3C.2 | Knowledge collections UI (manage files, preview chunks) | 37 | new dashboard page | 3C.1 | L | [ ] |
| 3C.3 | RAG retrieval node (query knowledge in workflow) | 37 | `node_registry.py` | 3C.1 | M | [ ] |
| 3C.4 | MCP Client node (connect to external MCP servers) | 37, 51 | `node_registry.py` | — | L | [ ] |
| 3C.5 | MCP Server Trigger (expose workflow as MCP tool) | 37, 51 | `node_registry.py`, `main.py` | — | L | [ ] |

### 3D: Enterprise Auth + Custom Roles

**Spec:** `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md`, `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 3D.1 | Custom roles (Enterprise — define custom permission sets) | 12 | `deps.py`, `capabilities.py` | 3A.1 | L | [ ] |
| 3D.2 | SSO integration (SAML) | 08 | new `backend/app/sso.py`, `routers/identity.py` | 2A.1 | L | [ ] |
| 3D.3 | SSO integration (OIDC/LDAP) | 08 | `sso.py` | 3D.2 | M | [ ] |
| 3D.4 | S3 binary data storage (replace local file storage) | 09 | `routers/chat.py`, `executor.py` | — | M | [ ] |

### 3E: Community Nodes + Marketplace

**Spec:** `58-FLOWHOLT-TEMPLATE-SYSTEM-AND-MARKETPLACE-SPEC.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 3E.1 | Community node package spec and loader | 58 §10 | new `backend/app/community_nodes.py` | — | L | [ ] |
| 3E.2 | Community node sandbox (isolated execution context) | 58 §10 | `community_nodes.py` | 3E.1 | L | [ ] |
| 3E.3 | Community node installation UI (admin) | 58 §10 | Settings page | 3E.1 | M | [ ] |
| 3E.4 | Creator Portal (submit, manage, analytics) | 58 §10 | new pages | 3E.1 | L | [ ] |

---

## PHASE 4 — ANALYTICS, AUTOMATION MAP, AND POLISH

**Goal:** Enterprise-grade usage tracking and org-level visibility.  
**Key vault pages:** `wiki/concepts/observability-analytics`, `wiki/concepts/automation-map`

### 4A: Analytics + Credit System

**Spec:** `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md`, `57-FLOWHOLT-BILLING-AND-PLAN-MANAGEMENT-SPEC.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 4A.1 | Credit tracking per execution (1 op = 1 credit) | 57 §1, §3 | `executor.py`, `main.py` | — | L | [ ] |
| 4A.2 | Plan tiers + feature gates (Free/Core/Pro/Teams/Enterprise) | 57 §2, §7 | `models.py`, new `billing.py` | — | L | [ ] |
| 4A.3 | Stripe integration (subscriptions, payments, invoices) | 57 §6 | `billing.py` | 4A.2 | L | [ ] |
| 4A.4 | Credit usage analytics dashboard (charts, breakdown by workflow) | 57 §9, 41 | new `src/pages/dashboard/Billing.tsx` | 4A.1 | L | [ ] |
| 4A.5 | Team credit allocation (Teams/Enterprise) | 57 §5 | `billing.py`, `main.py` | 4A.2, 2A.2 | M | [ ] |

### 4B: Automation Map

**Spec:** `47-FLOWHOLT-AUTOMATION-MAP-SPEC.md`  
**Vault:** `wiki/concepts/automation-map.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 4B.1 | Static dependency graph (workflows → connections → assets) | 47 | new `backend/app/automation_map.py` | — | L | [ ] |
| 4B.2 | Automation map visualization (org-level graph view) | 47 | new `src/pages/dashboard/AutomationMap.tsx` | 4B.1 | L | [ ] |
| 4B.3 | Operational layers (error rate, execution frequency, credit consumption per node) | 47 | `automation_map.py` | 4B.1, 4A.1 | M | [ ] |
| 4B.4 | Impact analysis (what breaks if this connection/workflow changes?) | 47 | `automation_map.py` | 4B.1 | M | [ ] |

### 4C: Templates + Sharing

**Spec:** `58-FLOWHOLT-TEMPLATE-SYSTEM-AND-MARKETPLACE-SPEC.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 4C.1 | Template creation wizard (save workflow as template with setup steps) | 58 §4-5 | `routers/misc.py`, new template editor page | — | L | [ ] |
| 4C.2 | Public template library page with search, categories, collections | 58 §3 | new `src/pages/Templates.tsx` | 4C.1 | L | [ ] |
| 4C.3 | Template rating and review system | 58 §9 | `routers/misc.py`, template detail page | 4C.2 | M | [ ] |
| 4C.4 | Workflow sharing (public pages, public link, clone) | 58 §6 | `routers/workflows.py`, new share page | — | M | [ ] |

### 4D: Recovery UX + Testing + Final Polish

**Spec:** `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md`, `56-FLOWHOLT-TESTING-AND-QA-SPEC.md`

| # | Task | Spec § | Target Files | Deps | Size | Done |
|---|------|--------|-------------|------|------|------|
| 4D.1 | Evaluation framework (light evaluations — test suites for workflows) | 56 §5 | new `backend/app/evaluations.py`, new eval UI | 2D.1 | L | [ ] |
| 4D.2 | Metric-based evaluations (production scoring, quality monitoring) | 56 §6 | `evaluations.py` | 4D.1, 2F.1 | L | [ ] |
| 4D.3 | Execution comparison (side-by-side diff view) | 56 §8 | Studio components | 2D.1 | M | [ ] |
| 4D.4 | Circuit breakers (per-integration, per-workspace state machine) | 44 §3 | `executor.py`, `integration_registry.py` | 1A.1 | L | [ ] |

---

## DEPENDENCY GRAPH

```
Phase 0 (Foundation) ────── COMPLETE ──────────────────────────────────
Phase 0B (UI Redesign) ──── PARALLEL ── runs alongside Phase 1 ───────
                                        └──→ 2D (Studio UX builds on new design tokens)

Phase 1:
  1A (Error Handling) ──────┬──→ 1D (Runtime Ops: needs incomplete executions)
  1B (Expression Engine) ───┼──→ 2D (Studio UX: drag-to-expression needs full engine)
  1C (Core Nodes) ──────────┘    
                                 
Phase 2:
  2A (Org/Team) ────────────┬──→ 2B (Settings: needs org/team hierarchy)
                            ├──→ 2C (Deployment: needs team roles for approval)
                            ├──→ 3A (Capabilities: needs role system)
                            └──→ 4A (Analytics: team credit allocation needs teams)
  2B (Settings) ────────────────→ 3A (Capabilities: settings feed into permission model)
  2D (Studio UX) ──────────────→ 4D (Testing: data pinning needed for evaluations)
  2F (Observability) ──────────→ 4D (Metric evaluations need event bus)

Phase 3:
  3A (Capabilities) ────────────→ 3D (Custom Roles: extends capability system)
  3B (AI Agents) ───────────────→ 3C (RAG/MCP: builds on agent infrastructure)

Phase 4:
  4A (Analytics) ───────────────→ 4B (Automation Map: operational layers need credit data)
  4C (Templates) ───────────────→ 3E (Marketplace: templates feed into marketplace)
```

**Critical path:** 1A → 1D → (Phase 2 unlocked) → 2A → 2B → 3A → 3D  
**Parallel tracks:** 0B (UI Redesign) runs alongside everything. 1B and 1C can run alongside 1A. 2E and 2F can run alongside 2A-2D.

---

## SPEC FILE QUICK REFERENCE

| # | Title | Domain | Phase |
|---|-------|--------|-------|
| 00 | Make Synthesis Workflow | Meta | — |
| 01 | Ultimate Plan Structure | Meta | — |
| 02 | Make Initial Synthesis | Meta (SUPERSEDED) | — |
| 03 | IA Skeleton | Information Architecture | 2A |
| 04 | Control Plane Skeleton | Control Plane | 2A |
| 05 | AI Agents Skeleton | AI Agents | 3B |
| 06 | Settings Catalog Skeleton | Settings (SUPERSEDED → 38) | — |
| 07 | Studio Surface Spec | Studio UX | 2D |
| 08 | Permissions Governance Skeleton | Permissions (SUPERSEDED → 12, 18) | 3D |
| 09 | Backend Architecture Skeleton | Backend | All |
| 10 | Make-to-FlowHolt Gap Matrix | Analysis | — |
| 11 | Studio Anatomy Draft | Studio UX | 2D |
| 12 | Permissions Matrix Draft | Permissions | 3A, 3D |
| 13 | Backend Service Map | Backend | All |
| 14 | Make Visual UI Evidence | Reference | — |
| 15 | Studio Inspector Modal Inventory | Studio UX | 2D |
| 16 | Confidential Data Governance | Security | 3A |
| 17 | Backend Entity Event Model | Backend | 2F |
| 18 | Role-by-Surface Enforcement Matrix | Permissions | 3A |
| 19 | Runtime Queue Retention | Runtime | 1D |
| 20 | Make Flattened PDF Reference | Reference | — |
| 21 | Route and API Authorization Map | Auth | 3A |
| 22 | Worker Topology and Queue Ops | Runtime | 1D |
| 23 | Studio Release Actions | Studio | 2C |
| 24 | Compact Auth Implementation Matrix | Auth | 3A |
| 25 | Queue Dashboard and Runbooks | Runtime | 1D |
| 26 | Studio Object Field Catalog | Studio | 2D |
| 27 | Node Type Field Inventory | Nodes | All |
| 28 | Capability Object and Auth Helpers | Permissions | 3A |
| 29 | Queue Dashboard Wireframe | Runtime | 1D |
| 30 | Studio Tab Role States | Studio | 2D |
| 31 | Capability API Shapes and Rollout | Permissions | 3A |
| 32 | Runtime Ops Route Spec | Runtime | 1D |
| 33 | Studio Node Family Tab Exceptions | Studio | 2D |
| 34 | Capability Bundle Payloads and Denial | Permissions | 3A |
| 35 | Runtime API Contracts and Permissions | Runtime | 1D |
| 36 | Control Plane Org/Team Design | Control Plane | 2A |
| 37 | AI Agent Entity and Knowledge | AI Agents | 3B, 3C |
| 38 | Settings Catalog Specification | Settings | 2B |
| 39 | Backend Domain Module Plan | Backend | All |
| 40 | Frontend Route and Page Inventory | Frontend | All |
| 41 | Observability and Analytics Spec | Observability | 2F, 4A |
| 42 | Webhook and Trigger System Spec | Triggers | 1C, 1D |
| 43 | Environment and Deployment Lifecycle | Deployment | 2C |
| 44 | Error Handling and Resilience Spec | Errors | 1A, 4D |
| 45 | Data Store and Custom Function Spec | Data Stores | 2E |
| 46 | Integration and Connection Management | Integrations | All |
| 47 | Automation Map Spec | Automation Map | 4B |
| 48 | Remaining Make Corpus Gaps | Analysis | — |
| 49 | n8n Integration Synthesis | Analysis | — |
| 50 | Expression and Data Model Spec | Expressions | 1B |
| 51 | Node Type Inventory and Gaps | Nodes | 1C, 2E |
| 52 | Competitive Gap Matrix | Analysis | — |
| 53 | Expression Engine Implementation | Expressions | 1B |
| 54 | Notification and Alerting Spec | Notifications | 1D, 2F |
| 55 | Form System Spec | Forms | 1C |
| 56 | Testing and QA Spec | Testing | 2D, 4D |
| 57 | Billing and Plan Management Spec | Billing | 4A |
| 58 | Template System and Marketplace Spec | Templates | 3E, 4C |
| 59 | UI Design System and Layout Spec | Design | 0B, 2D |

---

## CONVENTIONS

### How to use this file

1. **Start of session:** Read §CURRENT SPRINT. Read the linked spec files. Begin work.
2. **Completing a task:** Check its box (`[x]`). Update "Last updated" date at top.
3. **Completing a sprint:** Move sprint to next milestone. Copy the next milestone's tasks into §CURRENT SPRINT.
4. **Discovering new tasks:** Add them to the appropriate phase/milestone table. Assign the next available task number.
5. **Blocked?** Check the dependency graph. If blocked by an incomplete upstream task, switch to a parallel track.

### Rules

- This file is the **single source of truth** for implementation state. Keep it current.
- The vault wiki `implementation-roadmap.md` is now a read-only snapshot. Do not update it independently.
- Spec files (00-58) are **read-only design references**. Do not modify them during implementation unless a design flaw is discovered.
- Each task's "Target Files" column shows WHERE to implement. Read those files before writing code.
- After major milestones, update the vault `overview.md` and `CLAUDE.md` to reflect new state.

### Task Sizing

| Size | Meaning | Typical Effort |
|------|---------|---------------|
| **S** | Small — single function or config change | < 50 lines changed |
| **M** | Medium — new module or significant additions | 50–300 lines |
| **L** | Large — new subsystem, multiple files, DB schema changes | 300+ lines |
