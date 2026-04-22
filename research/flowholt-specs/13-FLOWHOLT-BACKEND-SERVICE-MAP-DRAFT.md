# FlowHolt Backend Service Map Draft

This file expands the backend skeleton into a clearer service map and domain relationship draft.

Additional grounding: **Make editor UI crawl** (2026-04-14) — `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — live API endpoint inventory from 1302 intercepted requests.

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| Make API endpoints | `research/make-advanced/*/network-log*.json` | API domain groupings (1302 real API calls) |
| n8n CLI package structure | `n8n-master/packages/cli/src/` | Module separation patterns |
| n8n controller inventory | `n8n-master/packages/cli/src/controllers/` | Service boundaries |
| n8n services | `n8n-master/packages/cli/src/services/` | Service naming and responsibilities |
| n8n module system | `n8n-master/packages/cli/src/modules/` | Pluggable module architecture |
| n8n scaling | `n8n-master/packages/cli/src/scaling/` | Worker service separation |

### n8n service comparison

| n8n service/controller | FlowHolt domain | Notes |
|----------------------|----------------|-------|
| `controllers/auth/` | Identity service | Same scope |
| `controllers/users.controller.ts` | Identity service | Same scope |
| `controllers/project.controller.ts` | Org + team + workspace service | FlowHolt splits these 3 |
| `services/workflow.service.ts` | Authoring service | Same scope |
| `scaling/queue-based-execution-lifecycle.ts` | Runtime/queue service | n8n=Redis; FlowHolt=Postgres |
| `modules/insights/` | Analytics service | Same scope |
| `audit/` | Audit service | Same scope |
| `webhooks/` | Trigger/webhook service | Same scope |
| `environments/` | Environments + deployment service | FlowHolt adds approval workflow |
| `external-secrets/` | Vault/secrets service | Same scope |

### This file feeds into

| File | What it informs |
|------|----------------|
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Module ownership per service |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | Entity→service mapping |
| `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` | Architecture overview |
| `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | API contract structure |

---

The backend should be organized around product domains that the user can understand, not just implementation convenience.

## Domain and service map

### 1. Identity service

Responsibilities:
- user accounts
- sessions
- profile preferences
- API keys
- security posture

Main entities:
- User
- Session
- ApiKey
- UserPreference

### 2. Access control service

Responsibilities:
- org roles
- team roles
- permission evaluation
- environment-aware authorization

Main entities:
- OrganizationMembership
- TeamMembership
- RoleBinding
- PermissionGrant

### 3. Organization service

Responsibilities:
- organizations
- teams
- org settings
- team settings
- consumption by scope

Main entities:
- Organization
- Team
- OrganizationSettings
- TeamSettings

### 4. Workflow service

Responsibilities:
- workflow definitions
- draft and version state
- workflow metadata
- template provenance

Main entities:
- Workflow
- WorkflowVersion
- WorkflowDefinition
- WorkflowTemplateLink

### 5. Studio contract service

Responsibilities:
- node definitions
- field schemas
- mapping contracts
- validation rules
- editor metadata

Main entities:
- NodeDefinition
- FieldDefinition
- MappingContract
- ValidationIssue

### 6. Execution orchestration service

Responsibilities:
- run creation
- step execution
- state transitions
- retry handling
- replay
- incomplete execution recovery

Main entities:
- Execution
- ExecutionStep
- RetryPolicy
- IncompleteExecution
- ReplayRequest

### 7. Scheduler service

Responsibilities:
- schedules
- trigger polling
- delayed runs
- activation and deactivation

Main entities:
- WorkflowSchedule
- ScheduledTriggerState

### 8. Asset service

Responsibilities:
- credentials
- connections
- variables
- data stores
- data structures
- knowledge assets
- templates
- MCP toolboxes

Main entities:
- Asset
- Credential
- Connection
- Variable
- DataStore
- DataStructure
- KnowledgeAsset
- Template
- Toolbox

### 9. Secret and security service

Responsibilities:
- encryption
- secret storage
- secret reveal policy
- connection verification

Main entities:
- SecretEnvelope
- ConnectionHealth
- SecretAccessEvent

### 10. AI agent service

Responsibilities:
- agent definitions
- tool attachments
- knowledge attachments
- test sessions
- conversation state
- structured outputs

Main entities:
- Agent
- AgentTool
- AgentKnowledgeLink
- AgentTestSession
- ConversationThread
- StructuredOutputSchema

### 11. Integration registry service

Responsibilities:
- app and provider registry
- module availability
- provider capabilities
- plugin metadata

Main entities:
- Integration
- IntegrationAction
- Provider
- ProviderModel

### 12. Webhook ingress service

Responsibilities:
- webhook endpoint management
- queueing incoming payloads
- signature validation
- replayable ingress storage later if needed

Main entities:
- WebhookEndpoint
- WebhookEvent

### 13. Environment and release service

Responsibilities:
- environments
- promotion
- publish records
- approvals
- rollback metadata

Main entities:
- Environment
- PublishRecord
- PromotionRequest
- ApprovalRecord

### 14. Observability service

Responsibilities:
- audit logs
- activity feeds
- notifications
- analytics projections
- operational summaries

Main entities:
- AuditEvent
- ActivityEvent
- Notification
- AnalyticsSnapshot

## Core relationships

- Users belong to organizations and teams through memberships.
- Workflows and agents belong to a scope, usually team or workspace.
- Assets belong to a scope and may be bound to environments.
- Executions belong to workflow versions and reference the assets and agents used.
- Publish records link drafts or versions to environments.
- Audit events attach to important writes across every service.

## API group plan

The backend should eventually expose API groups like:
- `/auth`
- `/users`
- `/orgs`
- `/teams`
- `/workflows`
- `/workflow-versions`
- `/studio`
- `/executions`
- `/schedules`
- `/assets`
- `/agents`
- `/providers`
- `/environments`
- `/audit`
- `/analytics`
- `/settings`
- `/enums` — centralized lookup data (new, from Make crawl)
- `/server` — server config, feature flags, health (new, from Make crawl)

## Event flow plan

Important domain events should include:
- workflow.created
- workflow.updated
- workflow.published
- execution.started
- execution.failed
- execution.replayed
- asset.created
- asset.updated
- agent.created
- agent.tested
- permission.changed
- environment.promoted

## Current repo alignment

The current backend already hints at this direction through modules for:
- auth
- executor
- scheduler
- webhooks
- plugin loading
- sandbox
- assistant tools
- integration registry
- studio runtime

The plan now is to reorganize those promising capabilities into a more deliberate product-driven backend architecture.

## Make API surface mapping (from editor crawl)

The automated crawl intercepted Make's live API surface. This table maps Make endpoints to FlowHolt's planned service domains.

| Make API group | Key endpoints | FlowHolt service |
|---|---|---|
| Organizations | `/api/v2/organizations`, `/:id`, `/:id/usage`, `/:id/subscription`, `/:id/variables` | Organization service (#3) |
| Teams | `/api/v2/teams`, `/:id`, `/:id/variables` | Organization service (#3) |
| Users/Roles | `/api/v2/users/me`, `/roles`, `/:id/user-organization-roles`, `/:id/user-team-roles` | Identity (#1) + Access control (#2) |
| Scenarios | `/api/v2/scenarios`, `/consumptions`, `/ai-agents`, `/:id/recovery` | Workflow service (#4) |
| Scenario folders | `/api/v2/scenarios-folders` | Workflow service (#4) |
| AI Agents | `/api/v2/ai-agents/v1/agents` | AI agent service (#10) |
| Connections | `/api/v2/connections` | Asset service (#8) |
| Data structures | `/api/v2/data-structures` | Asset service (#8) |
| Data stores | `/api/v2/data-stores` | Asset service (#8) |
| Webhooks | `/api/v2/hooks` | Webhook ingress (#12) |
| MCP Toolboxes | `/api/v2/mcp/v1/vhosts` | Asset service (#8) |
| Devices | `/api/v2/devices` | Asset service (#8) |
| Notifications | `/api/v2/notifications`, `/users/unread-notifications` | Observability (#14) |
| Billing | `/api/v2/cashier/products`, `/consumptions/reports/:id` | Organization service (#3) |
| Enums | `/api/v2/enums/countries,locales,timezones,variable-types` | New: Enum service (lightweight) |
| Server config | `/api/server/features`, `/server-config`, `/api/v2/zone-config` | New: Config service |
| Apps/Integrations | `/api/v2/imt/apps`, `/apps-meta`, `/sdk/apps` | Integration registry (#11) |
| Auth/SSO | `/api/v2/sso/authorize`, `/sso/login` | Identity service (#1) |
| Observability | `POST /api/v2/trace` | Observability (#14) |

### Key patterns discovered

1. **Feature flags are first-class** — `/api/server/features` is called 32 times during a single session. FlowHolt must implement feature flags from Phase 1.
2. **Active context endpoint** — `/api/v2/imt/active-organization-team` maintains server-side session context. FlowHolt should store `active_workspace_id` in the session.
3. **Scenario recovery** is a separate API surface (`GET/PUT/DELETE /api/v2/scenarios/:id/recovery`), distinct from version history. FlowHolt should plan a similar crash-recovery endpoint.
4. **Per-scenario consumption** is tracked via a dedicated endpoint, not embedded in the scenario object.
5. **Enum centralization** — countries, locales, timezones, variable types all served from `/api/v2/enums/*`.
6. **Real-time streaming** via Socket.IO (`wss://eu1.make.com/streamer/live/`), separate from REST API.
7. **Dynamic themes** — `/api/v2/imt/themes.css` serves CSS per org/team context. Consider for white-label support later.

---

## n8n backend cross-reference (from `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`)

### n8n backend architecture summary

- **Server**: Express.js with custom DI container (`@n8n/di`)
- **ORM**: TypeORM (custom fork) with SQLite (default) or PostgreSQL
- **API**: 36 controllers, 40+ services, 24 backend modules
- **Auth**: Cookie sessions, JWT, OAuth2, SAML, LDAP, OIDC
- **Queue**: Bull (Redis) for distributed execution
- **Real-time**: Push system (SSE or WebSocket, configurable)
- **Feature flags**: PostHog integration

### Service map comparison (n8n → FlowHolt)

| n8n service/controller | Purpose | FlowHolt service mapping |
|---|---|---|
| `auth.controller` | Login, logout, sessions | Identity service (#1) |
| `me.controller` | Current user profile | Identity service (#1) |
| `users.controller` | User CRUD, role assignment | Identity service (#1) |
| `invitation.controller` | User invitations | Identity service (#1) |
| `password-reset.controller` | Password reset flow | Identity service (#1) |
| `mfa.controller` | Multi-factor auth | Identity service (#1) |
| `role.controller` + `role.service` (13KB) | Role CRUD, scope resolution | Access control service (#2) |
| `project.controller` + `project.service.ee` (20KB) | Project CRUD, sharing | Workflow service (#4) + Organization (#3) |
| `folder.controller` + `folder.service` (10KB) | Folder hierarchy | Workflow service (#4) |
| `ai.controller` (11KB) | AI assistant, workflow builder | AI agent service (#10) |
| `ai-gateway.service` (10KB) | Model routing, credits | AI agent service (#10) |
| `ai-workflow-builder.service` (7KB) | NL → workflow generation | AI agent service (#10) |
| `workflow-statistics.controller` | Execution stats | Observability (#14) |
| `node-types.controller` | Node type info | Integration registry (#11) |
| `dynamic-node-parameters.controller` | Dynamic params | Integration registry (#11) |
| `binary-data.controller` | File access | Asset service (#8) |
| `api-keys.controller` | API key management | Identity service (#1) |
| `security-settings.controller` | Security config | Access control service (#2) |
| `posthog.controller` | Feature flags proxy | New: Feature flag service |
| `telemetry.controller` | Event tracking | Observability (#14) |
| `translation.controller` | i18n translations | New: Localization service |

### n8n module system — pattern to adopt

n8n organizes backend features into **modules** under `packages/cli/src/modules/`. Each module has:
- Controller(s) — HTTP endpoints
- Service(s) — business logic
- DTO(s) — request/response validation (Zod)
- Database entities/repositories (if needed)
- Module registration file

Key modules and FlowHolt mapping:

| n8n module | Purpose | FlowHolt adoption |
|---|---|---|
| `chat-hub/` | Multi-agent chat | ✅ Plan as `chat` module |
| `mcp/` | MCP server + OAuth + API keys | ✅ Plan as `mcp` module |
| `instance-ai/` | Instance-level AI assistant | ✅ Plan as `assistant` module |
| `workflow-builder/` | AI workflow generation | ✅ Plan as `ai-builder` module |
| `insights/` | Analytics dashboard | 🟡 Plan for Phase 2 |
| `source-control.ee/` | Git integration | 🟡 Plan for Phase 2 |
| `external-secrets.ee/` | Vault integration | 🟡 Plan for Phase 2 |
| `log-streaming.ee/` | Log destinations | 🟡 Plan for Phase 3 |
| `data-table/` | Spreadsheet data | 🟡 Plan as data stores |
| `community-packages/` | Custom node packages | 🟡 Plan for Phase 2 |
| `breaking-changes/` | Migration reporting | 🔴 New — plan for upgrades |
| `dynamic-credentials.ee/` | Runtime cred resolution | 🔴 New — enterprise |
| `otel/` | OpenTelemetry | ✅ Plan from Phase 1 |
| `redaction/` | Data privacy | 🟡 Plan for enterprise |

### n8n entity model — key patterns

n8n has 44 entities. Key architectural patterns:

1. **Project-scoped sharing** — `SharedWorkflow` and `SharedCredentials` link resources to projects with roles. FlowHolt should use the same join-table pattern for workspace scoping.

2. **Workflow versioning** — `WorkflowEntity.activeVersionId` references `WorkflowHistory.versionId`. The `versionCounter` auto-increments. FlowHolt should adopt this over a separate "deployment" entity.

3. **Folder hierarchy** — `Folder` has self-referencing `parentFolder`. `WorkflowEntity` has `parentFolderId`. Simple and effective.

4. **Execution separation** — `ExecutionEntity` (metadata) and `ExecutionData` (payload) are separate entities. This keeps the execution list fast while allowing large payloads.

5. **Role-scope mapping** — `Role` entity has many `Scope` entities. Roles are resolved by combining global + project + resource scopes. This is cleaner than FlowHolt's current permission matrix approach.

6. **Pin data** — `WorkflowEntity.pinData` stores frozen node outputs directly on the workflow. This enables test fixtures without a separate table.

7. **Test runs** — `TestRun` and `TestCaseExecution` entities for AI evaluation. FlowHolt should add these to the entity model.

### n8n push system — adoption plan

n8n's push system supports both SSE and WebSocket:

| Backend | n8n file | Protocol |
|---|---|---|
| SSE | `sse.push.ts` (1.5KB) | Server-Sent Events |
| WebSocket | `websocket.push.ts` (2.5KB) | WebSocket (ws library) |
| Abstract | `abstract.push.ts` (4KB) | Base class with send/broadcast |
| Index | `push/index.ts` (8KB) | Push service with routing |

Key pattern: Each browser tab registers with a unique `pushRef`. The server can target messages to specific tabs, users, or broadcast to all. FlowHolt should adopt this `pushRef` pattern for targeted real-time updates.

### n8n frontend settings delivery

n8n's `frontend.service.ts` (24KB) assembles `FrontendSettings` — a comprehensive settings object delivered to the frontend on init. It includes:
- Feature flags and enterprise flags
- Module settings (per-module configuration)
- Auth configuration (SAML, OIDC, LDAP, MFA)
- Endpoint URLs (webhook, form, MCP)
- Telemetry and PostHog configuration
- License and plan information
- AI and gateway settings
- Pruning and security settings

FlowHolt should implement a similar `GET /api/settings` endpoint that returns all client-needed configuration in one call, avoiding waterfall requests on app init.

### n8n API types package

`@n8n/api-types` provides shared TypeScript types between frontend and backend:
- DTOs (Zod schemas) in `src/dto/`
- Push message types in `src/push/`
- Frontend settings types in `src/frontend-settings.ts`
- Schema definitions in `src/schemas/`

FlowHolt should create a `@flowholt/api-types` package for shared FE/BE type safety. This eliminates type drift between client and server.
