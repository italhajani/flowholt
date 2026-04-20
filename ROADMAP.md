# FlowHolt — Implementation Roadmap

> **Purpose:** Detailed plan of what's been built and what's next, so any new session knows exactly where to pick up.
> **Last updated:** Session 24 (post-Sprint 23)

---

## Current State

**41 sprints complete | 308 todos done | Build: 502 KB JS (main) + 279 KB vendors | 0 errors | 44 lazy chunks**

### Completion Matrix

| Area | Status | Details |
|------|--------|---------|
| Frontend routing & pages | ✅ 95% | All 50+ routes defined, lazy-loaded with code splitting |
| UI component library | ✅ 95% | 21 Shadcn/Radix components, responsive sidebar, skeletons |
| Studio canvas (xyflow) | ⚠️ 55% | Functional, minimap, zoom, search, sticky notes — needs INPUT panel polish |
| Studio inspector | ⚠️ 65% | 6 tabs, node-specific params, API-wired — needs drag-to-expression |
| Backend API endpoints | ✅ 80% | Auth, CRUD, workflows, analytics, metrics, vault test/rotate/import/export |
| Node type ecosystem | ✅ 70% | Flow control + data transform + trigger nodes done (Sprints 27-32) |
| AI agent system | ⚠️ 30% | Basic agent model + CRUD + execution — missing memory, RAG, MCP |
| Expression engine | ✅ 80% | Full `{{ }}` syntax, Luxon DateTime, wrappers — missing JMESPath |
| Webhook/trigger queue | ⚠️ 40% | Receiver + scheduler + RBAC — no FIFO, no rate limiting |
| Control plane (org/team) | ✅ 70% | RBAC enforcement across 40+ routes, audit logging, workspace model |
| Observability | ✅ 75% | Prometheus /metrics, analytics endpoints, audit UI, log config |
| Deployment/environments | ⚠️ 40% | render.yaml, version history — no promotion workflow |
| Production readiness | ✅ 80% | Error boundaries, lazy routes, vendor splitting, responsive sidebar |

### Phases Complete
- ✅ Phase 1 (Sprint 24-26): Real Data Integration
- ✅ Phase 2 (Sprint 27-32): Node Ecosystem
- ✅ Phase 7 (Sprint 34): Control Plane & Observability
- ✅ Phase 8 (Sprint 35): Vault & Connections Polish
- ✅ Phase 9 (Sprint 36): Production Readiness

### Phases Remaining
- **Phase 3** (Sprint 37-38): AI Agent Memory, Knowledge, MCP
- **Phase 4** (Sprint 39-40): Expression Engine & Data Mapping polish
- **Phase 5** (Sprint 41-43): Webhook & Trigger Reliability
- **Phase 6** (Sprint 44-47): Studio Redesign polish

---

## What's Built (All 23 Sprints)

### Frontend Components (91 TSX files)

**UI (21):** badge, button, card, code-editor, command-palette, confirm-dialog, data-display-mode-selector, data-table, empty-state, error-boundary, global-banners, input, json-viewer, keyboard-shortcuts-help, modal, notifications-panel, skeleton, status-dot, tabs, tag-manager, toast

**Shell (5):** AppSidebar, ContextBreadcrumbs, PageHeader, TopBar, WorkspaceSwitcher

**Studio (18):** BulkOperationsToolbar, CodeEditorPanel, CollaborationPresenceBar, ErrorHandlingConfigPanel, ExecutionTraceDrawer, ExpressionEditorModal, StudioCanvas, StudioCopilotPanel, StudioHeader, StudioInsertPane, StudioInspector, StudioLeftRail, StudioRuntimeBar, StudioRuntimeDrawer, StudioTabBar, WorkflowDiffViewer, WorkflowOutlineSidebar, useCanvasStore

**Modals (11):** CreateCredentialModal, CreateVariableModal, CreateWorkflowModal, ExpressionEditorModal, ImportExportWorkflowModals, KnowledgeUploadModal, MCPServerWizard, ShareWorkflowModal, UseTemplateWizardModal, WorkflowImportExportModal, WorkflowSharingModal

**Settings (1):** NotificationPreferencesPanel

**Pages (27):** AIAgentsPage, ApiPlaygroundPage, ChatHubPage, CommunityNodesMarketplace, DataPage, EnvironmentPage, EnvironmentVariablesPage, EvaluationsPage, ExecutionTimelinePage, ExecutionsPage, HelpPage, HomePage, HumanTasksPage, InviteAcceptPage, LogStreamingPanel, LoginPage, ModelDirectoryPage, OperationsPage, ProvidersPage, SignupPage, SourceControlPanel, TemplatesPage, VaultPage, WebhooksPage, WorkflowAnalyticsPage, WorkflowVersionsPage, WorkflowsPage

**Detail Pages (8):** AgentDetailPage, ConnectionDetailPage, CredentialDetailPage, ExecutionDetailPage, ProviderDetailPage, TemplateDetailPage, WebhookDetailPage, WorkflowDetailPage

**Settings Pages (13):** Profile, Preferences, Notifications, API Access, Workspace General, Members, Runtime, Integrations, Domains, Security, Source Control, Community Nodes, Billing

### Backend (FastAPI)

**13 Routers:** system, identity, oauth, inbox, studio, vault, assistant, chat, workflows, executions, triggers, misc, `__init__`

**Core modules:** config.py (Pydantic settings), deps.py (auth/RBAC deps), errors.py (custom exceptions), helpers.py (shared logic), executor.py (workflow engine), expression_engine.py (`{{ }}` evaluator), runtime_state.py (worker/scheduler refs), models.py (all type defs), db.py (SQLite/Postgres), auth.py, llm_router.py (multi-provider LLM), node_registry.py, scheduler.py, worker.py, webhooks.py, encryption.py, repository.py

**Key endpoints:**
- Auth: dev-login, signup, workspaces CRUD, member invite/roles
- Studio: node catalog, integration catalog, node editor schemas
- Workflows: CRUD, export/import, search, diff
- Executions: list, detail, trace, bulk-delete
- Vault: connections, credentials, variables CRUD
- Assistant: capabilities, name, template-match, plan, draft-workflow
- System: health, deep-health, search, repair, audit-events, help

---

## What's Next — Detailed Roadmap

### Phase 1: Real Data Integration (Sprint 24-26)

> **Goal:** Replace all mock/demo data with real backend API calls

#### Sprint 24: Core API Wiring
| Task | Frontend | Backend | Research Ref |
|------|----------|---------|-------------|
| Workflow CRUD | WorkflowsPage → `GET/POST /api/workflows` | Verify endpoints return real DB data | File 40 |
| Execution list | ExecutionsPage → `GET /api/executions` | Add pagination, status filters | File 35 |
| Vault connections | VaultPage → `GET /api/vault/*` | Verify vault CRUD + encryption | File 46, 64 |
| Auth flow | LoginPage → `POST /api/auth/signup`, token storage | Session cookie or JWT | File 24 |
| Health check | Dashboard → `GET /health` | Already working | File 09 |
| API client setup | Create `src/lib/api.ts` (fetch wrapper, auth headers, error handling) | — | — |

#### Sprint 25: Studio API Integration
| Task | Frontend | Backend | Research Ref |
|------|----------|---------|-------------|
| Node catalog | StudioInsertPane → `GET /api/studio/catalog` | Return all registered nodes | File 51 |
| Node editor | StudioInspector → `GET /api/studio/nodes/{type}/editor` | Field schemas per node type | File 26, 27 |
| Save workflow | StudioHeader → `PUT /api/workflows/{id}` | Validate + persist definition | File 07 |
| Run workflow | StudioRuntimeBar → `POST /api/executions` | Execute via engine | File 35 |
| Integration search | StudioInsertPane → `GET /api/studio/integrations` | Integration catalog | File 46 |
| Workflow test | Studio test button → `POST /api/workflows/{id}/test` | New endpoint: test-run with response | File 56 |

#### Sprint 26: Assistant & Search
| Task | Frontend | Backend | Research Ref |
|------|----------|---------|-------------|
| AI draft workflow | StudioCopilotPanel → `POST /api/assistant/draft-workflow` | LLM generates definition | File 05 |
| Global search | CommandPalette → `POST /api/system/search` | Fuzzy search workflows/agents/templates | — |
| Template instantiate | UseTemplateWizardModal → template API | Create workflow from template | File 58 |
| Notifications real | NotificationsPanel → `GET /api/notifications` | Real notification storage | File 54 |
| Webhook management | WebhooksPage → webhook CRUD | Register/delete webhook triggers | File 42 |
| Human tasks | HumanTasksPage → `GET /api/inbox/tasks` | List paused execution tasks | — |

---

### Phase 2: Node Ecosystem (Sprint 27-32)

> **Goal:** Implement core node types so real workflows can run
> **Reference:** Research files 51, 52

#### Sprint 27-28: Flow Control Nodes
| Node | Type | Priority | Notes |
|------|------|----------|-------|
| Wait | Flow | CRITICAL | 4 modes: duration, date, webhook, reschedule |
| Merge | Flow | CRITICAL | 5 strategies: append, keep key, sql, combine, choose branch |
| Switch | Flow | CRITICAL | Expression-based multi-branch routing |
| IF | Flow | CRITICAL | Boolean condition with true/false branches |
| Execute Workflow | Flow | HIGH | Sub-workflow calling with parameter passing |
| Execute Workflow Trigger | Trigger | HIGH | Entry point for sub-workflow calls |

**Backend work:** Register node types in `node_registry.py`, implement execution logic in `executor.py`, add step handlers.

#### Sprint 29-30: Data Transform Nodes
| Node | Type | Priority | Notes |
|------|------|----------|-------|
| Set / Edit Fields | Transform | CRITICAL | Add/remove/rename fields in items |
| Code | Transform | HIGH | JavaScript/Python code execution (sandboxed) |
| HTTP Request | Transform | HIGH | Full HTTP client with auth, pagination |
| Filter | Transform | MEDIUM | Expression-based item filtering |
| Sort | Transform | MEDIUM | Multi-key sorting |
| Aggregate | Transform | MEDIUM | Group-by + aggregate functions |
| Split Out | Transform | MEDIUM | Flatten nested arrays into items |
| Summarize | Transform | MEDIUM | Reduce items to summary |
| Compare Datasets | Transform | MEDIUM | Diff two input arrays |

#### Sprint 31-32: Trigger & Utility Nodes
| Node | Type | Priority | Notes |
|------|------|----------|-------|
| Form Trigger | Trigger | HIGH | Public form → workflow entry |
| Chat Trigger | Trigger | HIGH | Chat message → workflow entry |
| Error Trigger | Trigger | HIGH | Catch execution errors |
| RSS Trigger | Trigger | MEDIUM | Poll RSS feeds |
| Form Node | Utility | HIGH | Mid-flow user input collection |
| Manual Trigger | Trigger | EXISTS | Already implemented |
| Webhook Trigger | Trigger | EXISTS | Already implemented |
| Schedule Trigger | Trigger | EXISTS | Already implemented |

---

### Phase 3: AI Agent System (Sprint 33-38)

> **Goal:** Full AI agent cluster architecture
> **Reference:** Research files 05, 37, 51, 52, 66

#### Sprint 33-34: Agent Foundation
| Task | Details |
|------|---------|
| Agent data model | Entity: name, description, tools[], memory_config, model_config |
| Agent root node | Cluster node that orchestrates sub-nodes |
| Tools Agent | Execute tools in sequence, collect results |
| Chat model sub-node | OpenAI/Anthropic/Gemini/Ollama selector |
| Agent CRUD API | `POST/GET/PUT/DELETE /api/agents` |
| Agent execution | Agent-specific execution flow in `executor.py` |

#### Sprint 35-36: Memory & Knowledge
| Task | Details |
|------|---------|
| Buffer Window Memory | In-memory sliding window of chat history |
| Postgres Chat Memory | Persistent chat memory in database |
| Knowledge Base ingestion | Upload docs → chunk → embed → store |
| Vector store integration | pgvector or SQLite FTS for retrieval |
| Retrieval node | Query vector store, return relevant chunks |
| RAG pipeline | Loader → Splitter → Embed → Store → Retrieve |

#### Sprint 37-38: MCP & Advanced
| Task | Details |
|------|---------|
| MCP Client Tool | Call external MCP servers from workflow |
| MCP Server Trigger | Expose workflow as MCP tool |
| Per-tool HITL gates | Human approval before tool execution |
| Agent evaluation | Test agent outputs against golden datasets |
| Agent studio UI | Visual agent builder (drag tools/memory) |
| Multi-agent orchestration | Agent-to-agent delegation |

---

### Phase 4: Expression Engine & Data Mapping (Sprint 39-40)

> **Reference:** Research files 50, 53

| Task | Details |
|------|---------|
| Full `{{ }}` syntax | Support JavaScript-like expressions (dot nav, array index, ternary, string concat) |
| Luxon DateTime | `$now.plus({days: 1})`, `$today.format('yyyy-MM-dd')` |
| JMESPath | `$json.items[?age > 30].name` |
| Drag-to-expression INPUT panel | Drag fields from input schema into expression editor |
| Expression autocomplete | Context-aware suggestions ($json, $input, $vars, etc.) |
| Expression testing | Live preview of expression result |

---

### Phase 5: Webhook & Trigger Reliability (Sprint 41-43)

> **Reference:** Research files 42, 44

| Task | Details |
|------|---------|
| Webhook FIFO queue | Ordered processing with concurrency control |
| Rate limiting per webhook | 300 req/10s default, configurable |
| Incomplete execution retry | Exponential backoff with configurable max |
| Webhook delivery logs | Track all incoming webhook payloads + responses |
| Webhook expiration | Auto-deactivate inactive webhooks after N days |
| Polling triggers | Watch-type nodes that poll external APIs |
| Event triggers | Internal event bus for cross-workflow triggers |
| API trigger | `POST /api/workflows/{id}/run` endpoint |

---

### Phase 6: Studio Redesign (Sprint 44-47)

> **Reference:** Research files 60-63

| Task | Details |
|------|---------|
| Canvas redesign | Smoother xyflow interactions, minimap polish, zoom UX |
| Inspector redesign | Collapsible sections, better field layout |
| INPUT panel | Schema view + drag-to-expression (n8n-style) |
| Data pinning | Pin step output for iterative debugging |
| Edit locking | Prevent concurrent edits on same workflow |
| Collaboration cursors | Real-time cursor tracking via WebSocket |
| Canvas search | Enhanced node search with filters |
| Sticky notes polish | Rich text, colors, resize |

---

### Phase 7: Control Plane & Observability (Sprint 48-52)

> **Reference:** Research files 04, 08, 12, 36, 41, 43, 65

| Task | Details |
|------|---------|
| RBAC enforcement | Per-route, per-API role checks (owner > admin > builder > viewer) |
| Org/team nesting | Organization → teams → workspaces hierarchy |
| Environment promotion | dev → staging → prod with approval gates |
| Audit log UI | Filterable audit events per workspace |
| Analytics dashboard | Execution metrics, time saved, error rates |
| Prometheus metrics | `/metrics` endpoint for monitoring |
| Log streaming | Forward logs to Datadog/Elastic/etc. |
| Usage metering | Track execution counts per plan tier |

---

### Phase 8: Vault & Connections Polish (Sprint 53-55)

> **Reference:** Research files 46, 64

| Task | Details |
|------|---------|
| Connection test UI | "Test connection" button with live feedback |
| Scoped credentials | Per-environment credential overrides |
| OAuth flow polish | Smooth OAuth popup/redirect UX |
| Secret rotation | Auto-rotate expiring credentials |
| Vault audit | Track who accessed what credential when |
| Import/export credentials | Bulk credential migration |

---

### Phase 9: Production Readiness (Sprint 56-60)

| Task | Details |
|------|---------|
| Error boundaries | Catch all React errors gracefully |
| Loading states | Skeleton screens on all data-fetching pages |
| Responsive layout | Mobile-friendly sidebar collapse |
| Keyboard navigation | Full keyboard nav for power users |
| Performance audit | Bundle splitting, lazy loading, code splitting |
| E2E testing | Playwright tests for critical paths |
| API documentation | OpenAPI/Swagger auto-generated from FastAPI |
| Deployment pipeline | Docker + CI/CD + health checks |

---

## Research Reference Quick-Index

| File | Topic | When Needed |
|------|-------|-------------|
| 03 | Information architecture | Routing/navigation changes |
| 04 | Control plane (org/team) | Phase 7 |
| 05 | AI agents skeleton | Phase 3 |
| 07 | Studio surface spec | Phase 6 |
| 09 | Backend architecture | Any backend work |
| 11 | Studio anatomy | Phase 6 |
| 12 | Permissions matrix | Phase 7 |
| 26-27 | Node field catalog | Phase 2 |
| 37 | AI agent entity model | Phase 3 |
| 42 | Webhook/trigger system | Phase 5 |
| 46 | Connection management | Phase 8 |
| 50 | Expression engine spec | Phase 4 |
| 51 | Node type inventory | Phase 2 |
| 52 | Competitive gap matrix | All phases |
| 55 | Form system spec | Phase 2 (Form nodes) |
| 59 | UI design system | UI polish |
| 60-66 | UI redesign specs | Phase 6-8 |
| 67 | Page-by-page inventory | Any new page work |

---

## How to Continue

1. **Read this file** to understand what's next
2. **Read `SESSION-LOG.md`** to see what the last session did
3. **Pick the next sprint** from the phase that's current
4. **Create 6 SQL todos** for the sprint
5. **Implement, build-verify (`vite build`), commit**
6. **Append to `SESSION-LOG.md`** with your changes
7. **Update this file** if priorities shift

### Build Commands
```bash
# Build (use Python subprocess — pwsh not available)
node node_modules/vite/bin/vite.js build

# Preview (after build)
node node_modules/vite/bin/vite.js preview --port 5173

# Backend
cd backend && python -m uvicorn app.main:app --port 8001
```

### Git
```bash
git add -A && git commit -m "Sprint N: description"
# Branch: codex/zero-budget-backend
```
