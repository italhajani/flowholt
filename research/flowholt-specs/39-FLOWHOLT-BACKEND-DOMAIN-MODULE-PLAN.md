# FlowHolt Backend Domain Module Plan

This file defines a product-aligned domain organization for the FlowHolt backend, decomposing the current monolithic structure into well-bounded modules.

It is grounded in:
- `backend/app/` — current file inventory (28 Python modules, 411KB `main.py`, 90KB `repository.py`, 123KB `node_registry.py`)
- `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` — initial backend skeleton
- `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` — service map draft
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — org/team entities
- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` — agent entity and knowledge system
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` — settings hierarchy

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| n8n monorepo structure | `n8n-master/turbo.json`, `n8n-master/pnpm-workspace.yaml` | 42-package module separation pattern |
| n8n CLI package | `n8n-master/packages/cli/src/` | Controller, service, module patterns |
| n8n workflow engine | `n8n-master/packages/core/src/execution-engine/` | Execution engine separation |
| n8n database schema | `n8n-master/packages/cli/src/databases/entities/` | Entity → module mapping |
| n8n insights module | `n8n-master/packages/cli/src/modules/insights/` | Analytics as standalone module |
| n8n scaling docs | `research/n8n-docs-export/pages_markdown/hosting/scaling/` | Worker topology patterns |
| Make API endpoints | `research/make-advanced/*/network-log*.json` | REST API endpoint groupings |
| Make org model | `research/make-help-center-export/pages_markdown/organizations.md` | Org/team separation pattern |
| Current backend | `backend/app/main.py` | 411KB monolith to be split |

### n8n module structure comparison

| n8n package | FlowHolt domain module | Notes |
|------------|----------------------|-------|
| `n8n-master/packages/cli/src/controllers/auth/` | `auth/` module | Same scope |
| `n8n-master/packages/cli/src/controllers/users.controller.ts` | `users/` module | Same scope |
| `n8n-master/packages/cli/src/controllers/project.controller.ts` | `orgs/`, `teams/`, `workspaces/` modules | n8n has no teams layer |
| `n8n-master/packages/core/src/execution-engine/` | `execution/` module | Same scope |
| `n8n-master/packages/cli/src/scaling/` | `queue/` + `worker/` modules | n8n uses Redis+BullMQ; FlowHolt uses Postgres-as-queue |
| `n8n-master/packages/cli/src/modules/insights/` | `analytics/` module | n8n insights → FlowHolt analytics domain |
| `n8n-master/packages/cli/src/audit/` | `audit/` module | Same scope |
| `n8n-master/packages/cli/src/webhooks/` | `webhooks/` module | Same scope |
| `n8n-master/packages/cli/src/environments/` | `environments/` + `deployments/` modules | FlowHolt adds approval workflow |
| `n8n-master/packages/@n8n/n8n-nodes-langchain/` | `agents/` + `expression/` modules | FlowHolt adds managed agent entity layer |

### This file feeds into

| File | What it informs |
|------|----------------|
| `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` | Service boundaries |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | Entity family → module ownership mapping |
| `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` | Architecture decisions |
| `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` | Queue + worker module design |
| `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` | Runtime ops route specification |
| `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | API contract structure |

---

### File inventory

| File | Size | Responsibility |
|---|---|---|
| `main.py` | 411 KB | **169+ route handlers**, request validation, response building, business logic mixed with routing |
| `node_registry.py` | 123 KB | Node type definitions (field schemas, defaults, help text) |
| `repository.py` | 90 KB | Database CRUD operations, queries, migration helpers |
| `studio_nodes.py` | 63 KB | Node editor logic, config rendering, dynamic props |
| `models.py` | 45 KB | Pydantic request/response models (100+ classes) |
| `executor.py` | 32 KB | Workflow execution engine |
| `integration_registry.py` | 29 KB | Integration app definitions |
| `seeds.py` | 26 KB | Database seed data |
| `assistant_tools.py` | 46 KB | AI assistant capabilities |
| `llm_router.py` | 25 KB | LLM provider routing and configuration |
| `scheduler.py` | 13 KB | Cron scheduling and trigger management |
| `studio_runtime.py` | 13 KB | Studio-specific runtime logic |
| `studio_resources.py` | 10 KB | Studio node resource loading |
| `sandbox.py` | 9 KB | Code execution sandbox |
| `auth.py` | 9 KB | Authentication and token management |
| `oauth2.py` | 9 KB | OAuth2 flow handlers |
| `worker.py` | 9 KB | Background job worker |
| `studio_workflows.py` | 8 KB | Studio workflow bundle logic |
| `studio_contracts.py` | 8 KB | Studio contract helpers |
| `webhooks.py` | 7 KB | Webhook receiver and validation |
| `rate_limiter.py` | 6 KB | Rate limiting |
| `plugin_loader.py` | 6 KB | Integration plugin loading |
| `encryption.py` | 5 KB | Field encryption |
| `help_content.py` | 5 KB | Help article content |
| `db.py` | 28 KB | Database connection and schema |
| `config.py` | 2 KB | Settings and environment |
| `security.py` | 1 KB | Security utilities |

### Key problem

`main.py` at 411 KB contains all route handlers interleaved with business logic, response building, and inline helper functions. This makes it:
- Hard to navigate (9000+ lines)
- Hard to test individual domains in isolation
- Hard to add new domain features without merge conflicts
- Hard to understand dependencies between domains

---

## 2. Target domain structure

```
backend/app/
├── domains/
│   ├── identity/              # Users, auth, sessions
│   ├── organization/          # Orgs, teams, members, plans
│   ├── workspace/             # Workspaces, settings, policies
│   ├── workflow/              # Workflows, definitions, versions, deployments
│   ├── studio/                # Studio editor, node config, canvas operations
│   ├── execution/             # Executor, jobs, executions, artifacts, events
│   ├── runtime/               # Runtime ops, queues, pauses, dead-letters, alerts
│   ├── vault/                 # Connections, credentials, variables, access control
│   ├── agent/                 # Managed agents, knowledge, tools, MCP, testing
│   ├── integration/           # Integration registry, plugins, dynamic props
│   ├── assistant/             # AI assistant, chat, workflow generation
│   ├── notification/          # Notifications, email delivery, alerts
│   └── system/                # Health checks, setup, maintenance, scheduler
├── core/
│   ├── auth.py                # Token creation/verification
│   ├── config.py              # Settings and environment
│   ├── db.py                  # Database connection and schema
│   ├── encryption.py          # Field encryption
│   ├── models.py              # Shared base models and types
│   ├── rate_limiter.py        # Rate limiting
│   ├── sandbox.py             # Code execution sandbox
│   └── security.py            # Security utilities
├── main.py                    # FastAPI app, middleware, router mounting
└── __init__.py
```

### Domain module structure (each domain)

```
domains/workflow/
├── __init__.py
├── models.py          # Domain-specific Pydantic models
├── repository.py      # Database queries for this domain
├── service.py         # Business logic (the "what happens")
├── routes.py          # FastAPI route handlers (the "HTTP layer")
└── helpers.py         # Domain-specific utilities
```

---

## 3. Domain definitions

### 3.1 Identity domain (`domains/identity/`)

**Owns**: Users, authentication, sessions, profile settings.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `AuthSignupRequest`, `AuthLoginRequest`, `AuthDevLoginRequest`, `AuthSessionTokenResponse`, `AuthPreflightResponse`, `SessionResponse`, `UserSummary` |
| `repository.py` | Extract from `repository.py` | `create_user`, `get_user_by_email`, `get_user_by_id`, `update_user`, `resolve_session` |
| `service.py` | Extract from `main.py` | Signup flow, login flow, dev-login, session management, Supabase auth |
| `routes.py` | Extract from `main.py` | `POST /auth/signup`, `POST /auth/login`, `POST /auth/dev-login`, `GET /auth/preflight`, `GET /session` |

Current file sources: `auth.py` (move entirely), parts of `main.py`, parts of `repository.py`.

### 3.2 Organization domain (`domains/organization/`)

**Owns**: Organizations, teams, org members, team members, plans, billing.

| Component | Description |
|---|---|
| `models.py` | `OrganizationSummary`, `OrganizationDetail`, `TeamSummary`, `TeamDetail`, `OrganizationMemberSummary`, `TeamMemberSummary`, `PlanQuotas` (from file 36) |
| `repository.py` | Org CRUD, team CRUD, member management, plan queries |
| `service.py` | Org creation, team management, invitation flow, role resolution, quota enforcement |
| `routes.py` | All `/api/organizations/...` and `/api/teams/...` endpoints (from file 36) |

Current file sources: **new domain** (no existing code to extract — all from file 36 design).

### 3.3 Workspace domain (`domains/workspace/`)

**Owns**: Workspaces, workspace settings, workspace members, policies.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `WorkspaceSummary`, `WorkspaceMemberSummary`, `WorkspaceSettingsResponse`, `WorkspaceSettingsUpdate`, `WorkflowPolicyResponse` |
| `repository.py` | Extract from `repository.py` | `list_user_workspaces`, `get_workspace_settings`, `update_workspace_settings`, `list_workspace_members`, `invite_workspace_member` |
| `service.py` | Extract from `main.py` | Settings management, policy computation, member management |
| `routes.py` | Extract from `main.py` | `GET /workspaces`, `GET/PUT /workspaces/current/settings`, member endpoints |

### 3.4 Workflow domain (`domains/workflow/`)

**Owns**: Workflows, definitions, versions, deployments, templates, import/export.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `WorkflowSummary`, `WorkflowDetail`, `WorkflowSettings`, `WorkflowStep`, `WorkflowEdge`, `WorkflowDefinition`, `WorkflowValidation*`, `WorkflowVersion*`, `WorkflowDeployment*`, `WorkflowExportBundle`, `WorkflowImportResponse`, `WorkflowCreate`, `WorkflowUpdate` |
| `repository.py` | Extract from `repository.py` | All workflow CRUD, version management, deployment queries |
| `service.py` | Extract from `main.py` | Workflow creation, validation, repair, versioning, deployment review, compare, promotion, rollback |
| `routes.py` | Extract from `main.py` | All `/api/workflows/...` endpoints |

Current file sources: Parts of `main.py` (~40+ route handlers), parts of `repository.py`, `studio_workflows.py`.

### 3.5 Studio domain (`domains/studio/`)

**Owns**: Node catalog, node editor, config rendering, dynamic props, studio bundles, step operations.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `NodeDefinitionSummary`, `NodeCatalogResponse`, `NodeEditorResponse`, `NodeDraftResponse`, `NodePreviewResponse`, `NodeConfigValidation*`, `NodeConfigTest*`, `StudioWorkflowBundleResponse`, `StudioStepTest*` |
| `repository.py` | Minimal — node definitions are in-memory registry |
| `service.py` | `studio_nodes.py`, `studio_contracts.py`, `studio_runtime.py`, `studio_resources.py` | Node editing, config rendering, testing, preview, dynamic props |
| `routes.py` | Extract from `main.py` | All `/api/studio/...` endpoints |
| `registry.py` | `node_registry.py` (rename) | Node type definitions |

Current file sources: `node_registry.py`, `studio_nodes.py`, `studio_contracts.py`, `studio_runtime.py`, `studio_resources.py`, parts of `main.py`.

### 3.6 Execution domain (`domains/execution/`)

**Owns**: Executor, jobs, executions, steps, artifacts, events, replay.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `ExecutionSummary`, `ExecutionPauseSummary`, `HumanTaskSummary`, `WorkflowJobSummary`, `ExecutionArtifact*`, `ExecutionEvent*`, `ExecutionInspectorResponse`, `ExecutionReplay*`, `ExecutionStepInspectorResponse`, `JobProcessResponse` |
| `repository.py` | Extract from `repository.py` | All execution, job, pause, human-task, artifact, event CRUD |
| `service.py` | `executor.py` (move), `worker.py` (move) | Execution engine, step processing, job processing, pause/resume, replay |
| `routes.py` | Extract from `main.py` | All `/api/executions/...` and `/api/jobs/...` endpoints |

Current file sources: `executor.py`, `worker.py`, parts of `main.py` (~30+ route handlers), parts of `repository.py`.

### 3.7 Runtime domain (`domains/runtime/`)

**Owns**: Runtime operations dashboard, queue management, failure tracking, dead-letters, alerts.

| Component | Description |
|---|---|
| `models.py` | All runtime models from file 35: `RuntimeOverviewResponse`, `RuntimeCapabilities`, `RuntimeJobListResponse`, `RuntimePauseListResponse`, `RuntimeFailureListResponse`, `RuntimeAlertItem`, `DeadLetterItem` |
| `repository.py` | Runtime summary queries, alert storage, dead-letter storage |
| `service.py` | Runtime summary computation, capability calculation, alert triggering, dead-letter creation |
| `routes.py` | All `/api/runtime/...` endpoints from file 35 |

Current file sources: **new domain** (mostly from file 35 design, with some extraction from existing execution queries).

### 3.8 Vault domain (`domains/vault/`)

**Owns**: Connections, credentials, variables, vault overview, access control, health checks.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `VaultConnectionSummary`, `VaultCredentialSummary`, `VaultVariableSummary`, `VaultOverviewResponse`, `VaultAssetCreate`, `VaultAssetUpdate`, `VaultAssetHealth*`, `VaultAssetVerify*`, `VaultAssetAccess*` |
| `repository.py` | Extract from `repository.py` | All vault CRUD, access control queries |
| `service.py` | Extract from `main.py` | Asset creation, health checks, access management |
| `routes.py` | Extract from `main.py` | All `/api/vault/...` endpoints |

### 3.9 Agent domain (`domains/agent/`)

**Owns**: Managed agents, knowledge/RAG, tools, MCP, testing.

| Component | Description |
|---|---|
| `models.py` | All agent models from file 37: `ManagedAgentSummary`, `ManagedAgentDetail`, `AgentToolReference`, `AgentKnowledgeFile`, `AgentMcpConnection`, `AgentTestSession`, `AgentCapabilities` |
| `repository.py` | Agent CRUD, knowledge file storage, vector store operations |
| `service.py` | Agent management, knowledge processing (chunking, embedding), tool resolution, MCP client, test session management |
| `routes.py` | All `/api/agents/...` endpoints from file 37 |
| `knowledge.py` | Chunking pipeline, embedding pipeline, vector search |

Current file sources: **new domain** (from file 37 design). Some extraction from `llm_router.py` for embedding.

### 3.10 Integration domain (`domains/integration/`)

**Owns**: Integration apps, operations, plugins, OAuth2 flows.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `IntegrationAppSummary`, `IntegrationOperationDetail`, `IntegrationCatalogResponse` |
| `registry.py` | `integration_registry.py` (move) | App and operation definitions |
| `service.py` | `plugin_loader.py` (move), `oauth2.py` (move) | Plugin loading, OAuth2 flows |
| `routes.py` | Extract from `main.py` | `/api/studio/integrations/...`, `/api/oauth2/...` endpoints |

### 3.11 Assistant domain (`domains/assistant/`)

**Owns**: AI assistant, workflow generation, chat, naming, planning, repair.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `AssistantNameRequest/Response`, `AssistantPlanRequest/Response`, `AssistantDraftWorkflow*`, `AssistantCapabilities*`, `AssistantWorkflowSummary*`, `AssistantChat*` |
| `service.py` | `assistant_tools.py` (move), parts of `llm_router.py` | Workflow generation, naming, planning, repair, chat |
| `routes.py` | Extract from `main.py` | All `/api/assistant/...` endpoints |

### 3.12 Notification domain (`domains/notification/`)

**Owns**: In-app notifications, email delivery, alert dispatch.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `NotificationCreate`, `NotificationItem`, `NotificationListResponse` |
| `repository.py` | Extract from `repository.py` | Notification CRUD |
| `service.py` | Extract from `main.py` | Notification creation, email sending |
| `routes.py` | Extract from `main.py` | `/api/notifications/...` endpoints |

### 3.13 System domain (`domains/system/`)

**Owns**: Health checks, setup report, system status, scheduled operations, maintenance.

| Component | Source | Description |
|---|---|---|
| `models.py` | Extract from `models.py` | `SetupReportResponse`, `HealthResponse`, `ScheduledRunResponse`, `ResumePausedExecutionsResponse` |
| `service.py` | `scheduler.py` (move) | Scheduled runs, paused execution resume, artifact pruning, system status |
| `routes.py` | Extract from `main.py` | `/api/system/...` endpoints |

---

## 4. Core module responsibilities

| Module | Responsibility |
|---|---|
| `core/auth.py` | Token creation, verification, session context dependency |
| `core/config.py` | Environment variables, settings singleton |
| `core/db.py` | Database connection, schema, migrations |
| `core/encryption.py` | Field-level encryption for vault secrets |
| `core/models.py` | Shared base types: `CapabilityState`, `WorkspaceRole`, literal types |
| `core/rate_limiter.py` | Rate limiting middleware |
| `core/sandbox.py` | Code execution sandbox |
| `core/security.py` | Security utilities |

---

## 5. Main.py after decomposition

The target `main.py` becomes a thin routing shell:

```python
from fastapi import FastAPI
from .core.config import get_settings
from .domains.identity.routes import router as identity_router
from .domains.organization.routes import router as organization_router
from .domains.workspace.routes import router as workspace_router
from .domains.workflow.routes import router as workflow_router
from .domains.studio.routes import router as studio_router
from .domains.execution.routes import router as execution_router
from .domains.runtime.routes import router as runtime_router
from .domains.vault.routes import router as vault_router
from .domains.agent.routes import router as agent_router
from .domains.integration.routes import router as integration_router
from .domains.assistant.routes import router as assistant_router
from .domains.notification.routes import router as notification_router
from .domains.system.routes import router as system_router

settings = get_settings()
app = FastAPI(title="FlowHolt", ...)

# Middleware
app.add_middleware(CORSMiddleware, ...)
app.add_exception_handler(...)

# Mount domain routers
app.include_router(identity_router, prefix=settings.api_prefix)
app.include_router(organization_router, prefix=settings.api_prefix)
app.include_router(workspace_router, prefix=settings.api_prefix)
app.include_router(workflow_router, prefix=settings.api_prefix)
app.include_router(studio_router, prefix=settings.api_prefix)
app.include_router(execution_router, prefix=settings.api_prefix)
app.include_router(runtime_router, prefix=settings.api_prefix)
app.include_router(vault_router, prefix=settings.api_prefix)
app.include_router(agent_router, prefix=settings.api_prefix)
app.include_router(integration_router, prefix=settings.api_prefix)
app.include_router(assistant_router, prefix=settings.api_prefix)
app.include_router(notification_router, prefix=settings.api_prefix)
app.include_router(system_router, prefix=settings.api_prefix)

# Static files and webhook catch-all
...
```

Target `main.py` size: **< 200 lines** (down from 9000+).

---

## 6. Dependency rules

### Allowed dependencies between domains

```
identity ← (all domains depend on auth context)
organization ← workspace, agent
workspace ← workflow, vault, execution, studio, runtime, notification
workflow ← execution, studio, assistant
execution ← runtime, notification
vault ← workflow, studio, agent, integration
integration ← studio, vault
agent ← workflow (for workflow-as-tool), vault (for credentials)
notification ← (independent, called by other domains)
system ← execution, workspace (for status queries)
```

### Forbidden dependencies

- No domain should depend on `main.py`
- No domain should import from another domain's `routes.py`
- Cross-domain communication goes through service layer, not repository layer
- Models from one domain can be imported by others (read-only types)

---

## 7. Migration strategy

### Approach: incremental extraction

Do NOT attempt a big-bang refactor. Extract one domain at a time while keeping `main.py` working.

### Step-by-step for each domain

1. Create `domains/{name}/` directory with `__init__.py`
2. Create `domains/{name}/models.py` — copy relevant models from `models.py`
3. Create `domains/{name}/repository.py` — extract relevant functions from `repository.py`
4. Create `domains/{name}/service.py` — extract business logic from `main.py`
5. Create `domains/{name}/routes.py` — create FastAPI `APIRouter`, move route handlers
6. Mount the new router in `main.py`
7. Delete the old route handlers from `main.py`
8. Run tests to verify nothing broke
9. Repeat for next domain

### Recommended extraction order

1. **System** — smallest, most isolated, low risk
2. **Notification** — small, well-bounded
3. **Identity** — auth is already mostly in `auth.py`
4. **Vault** — well-defined CRUD operations
5. **Integration** — already has its own files
6. **Studio** — already has `studio_*.py` files
7. **Workflow** — large but well-defined boundaries
8. **Execution** — large, depends on workflow
9. **Assistant** — already has `assistant_tools.py`
10. **Workspace** — settings and members
11. **Organization** — new domain (file 36)
12. **Agent** — new domain (file 37)
13. **Runtime** — new domain (file 35)

### Parallel `models.py` decomposition

After domain extraction, the central `models.py` should be split:
- Each domain gets its own `models.py`
- `core/models.py` retains only shared types (`CapabilityState`, `WorkspaceRole`, literal types)
- Use re-exports in `models.py` for backward compatibility during transition

---

## 8. Testing alignment

### Current test structure

```
backend/tests/
├── test_chat_models.py
├── test_execution_retention.py
├── test_job_trigger_linking.py
└── ... (8 test files)
```

### Target test structure

```
backend/tests/
├── domains/
│   ├── test_identity.py
│   ├── test_organization.py
│   ├── test_workspace.py
│   ├── test_workflow.py
│   ├── test_studio.py
│   ├── test_execution.py
│   ├── test_runtime.py
│   ├── test_vault.py
│   ├── test_agent.py
│   ├── test_integration.py
│   ├── test_assistant.py
│   ├── test_notification.py
│   └── test_system.py
├── integration/
│   ├── test_workflow_execution_flow.py
│   └── test_deployment_flow.py
└── conftest.py
```

Each domain test file tests the service and route layers of that domain in isolation.

---

## 9. Size estimates

| Domain | Estimated routes | Estimated service lines | Priority |
|---|---|---|---|
| Identity | 6 | 300 | P1 |
| Organization | 12 | 400 | P2 (new) |
| Workspace | 8 | 400 | P1 |
| Workflow | 40+ | 1500 | P1 |
| Studio | 25+ | 2000 | P1 |
| Execution | 30+ | 1500 | P1 |
| Runtime | 10 | 600 | P2 (new) |
| Vault | 15 | 500 | P1 |
| Agent | 20 | 800 | P2 (new) |
| Integration | 8 | 300 | P1 |
| Assistant | 15 | 1000 | P1 |
| Notification | 4 | 200 | P1 |
| System | 8 | 400 | P1 |

Total estimated route handlers: ~200 (matches current 169+ with new domains)

---

## 10. Planning decisions still open

1. **FastAPI router tags**: Should each domain router use a tag for OpenAPI grouping? Recommend: yes, `tags=["workflow"]` etc.

2. **Repository pattern**: Should repositories return raw dicts (current) or domain model instances? Recommend: keep raw dicts for now, convert to models at service layer.

3. **Event bus**: Should cross-domain communication use an event bus pattern? Recommend: defer, use direct service imports for now. Event bus is Phase 3.

4. **API versioning**: When adding new domains (org, agent, runtime), should they use a v2 prefix? Recommend: no, keep single prefix. Use capability-based feature flags instead.

5. **Shared repository module**: Some repository functions (like `record_audit_event`) are used across all domains. These should stay in a shared `core/repository.py` or `core/audit.py` module.
