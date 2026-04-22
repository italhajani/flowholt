# n8n Source Code Research Findings

This file records structured findings from a deep-dive analysis of the n8n v2.16.0 open-source repository (`n8n-master`), performed on 2026-04-14.

Grounding source: `D:\My work\flowholt3 - Copy\n8n-master\` — full GitHub repository clone.

Purpose: Understand n8n's architecture, UI patterns, backend design, AI system, and collaboration features — then identify what FlowHolt should adopt, adapt, or improve upon (FlowHolt leans toward n8n-style UX).

---

## Cross-Reference Map

### Raw source data (n8n-master paths)
- **Frontend entry**: `n8n-master/packages/frontend/editor-ui/src/`
  - Canvas editor: `app/views/NodeView.vue` (58KB)
  - NDV: `features/ndv/` directory
  - Parameter input: `features/ndv/parameters/components/ParameterInput.vue` (66KB)
  - Workflow header: `app/components/MainHeader/`
  - Stores: `app/stores/` (30+ Pinia stores)
  - Key bindings: `app/composables/useKeybindings.ts`
- **Design system**: `n8n-master/packages/frontend/@n8n/design-system/src/components/`
- **Backend entry**: `n8n-master/packages/cli/src/`
  - Controllers: `controllers/` (36 controllers)
  - Services: `services/` (40+ services)
  - Modules: `modules/` (24 modules with `.ee.` enterprise variants)
- **DB entities**: `n8n-master/packages/@n8n/db/src/entities/`
- **Permissions**: `n8n-master/packages/@n8n/permissions/`
- **Workflow engine**: `n8n-master/packages/workflow/src/`
  - Core interfaces: `interfaces.ts` (104KB)
  - Data proxy: `workflow-data-proxy.ts` (51KB)
  - Expression engine: `expression.ts` (20KB)
- **Execution engine**: `n8n-master/packages/core/src/execution-engine/workflow-execute.ts` (87KB)
- **AI packages**: `n8n-master/packages/@n8n/agents/`, `@n8n/nodes-langchain/`, `@n8n/ai-workflow-builder.ee/`
- **CRDT**: `n8n-master/packages/@n8n/crdt/`
- **Permissions system**: `n8n-master/packages/@n8n/permissions/src/`

### Peer research files (compare these findings against)
- `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` — Make visual patterns (compare every UI feature here to Make's version)
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — Make crawl data (DOM, network, test IDs) — compare Make API patterns to n8n's
- `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` — exhaustive n8n UI element catalog; this file covers architecture, file 42 covers elements

### FlowHolt planning files this feeds into
- `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` — backend architecture (§3)
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — Studio layout, NDV, header tabs (§2)
- `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md` — permissions system (§4)
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` — 47 modals from n8n (§2)
- `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` — queue system (§3)
- `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` — worker/queue (§3 Bull/Redis)
- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` — AI agent system (§6)
- `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` — backend modules (§3)
- `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` — n8n synthesis document
- `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` — expression engine (§7)
- `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` — node inventory (§8)
- `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` — competitive comparison (§12)

---


## 1. Monorepo structure and build system

### Build tooling
- **Package manager**: pnpm 10.32+ with strict workspace protocol
- **Build orchestration**: Turborepo (`turbo.json`) — parallel builds with dependency graph
- **TypeScript**: v6.0.2 (bleeding-edge)
- **Bundler**: Vite 8+ (frontend), tsc (backend)
- **Linting**: ESLint 9 + Biome (formatting) + Stylelint
- **Testing**: Jest (backend unit), Vitest (frontend unit), Playwright (E2E)

### Package map (42 packages)

| Layer | Package | Purpose |
|---|---|---|
| **Frontend** | `packages/frontend/editor-ui` | Vue 3 SPA — the main workflow editor |
| **Frontend** | `packages/frontend/@n8n/design-system` | Reusable Vue component library (100+ components) |
| **Frontend** | `packages/frontend/@n8n/i18n` | Internationalization |
| **Frontend** | `packages/frontend/@n8n/chat` | Embeddable chat widget |
| **Frontend** | `packages/frontend/@n8n/stores` | Shared Pinia stores |
| **Frontend** | `packages/frontend/@n8n/rest-api-client` | Typed REST API client |
| **Frontend** | `packages/frontend/@n8n/composables` | Shared Vue composables |
| **Frontend** | `packages/frontend/@n8n/storybook` | Storybook 10 for design system |
| **Backend** | `packages/cli` | Express server, REST API, CLI commands |
| **Backend** | `packages/@n8n/db` | TypeORM entities, migrations, repositories |
| **Backend** | `packages/@n8n/config` | Centralized config management |
| **Backend** | `packages/@n8n/di` | IoC / dependency injection container |
| **Backend** | `packages/@n8n/permissions` | RBAC system — scopes, roles, resources |
| **Backend** | `packages/@n8n/api-types` | Shared FE/BE TypeScript interfaces |
| **Backend** | `packages/@n8n/backend-common` | Shared backend utilities |
| **Engine** | `packages/workflow` | Core workflow interfaces, types, expression engine |
| **Engine** | `packages/core` | Workflow execution engine, node execution context |
| **Engine** | `packages/@n8n/expression-runtime` | Sandboxed expression evaluation |
| **AI** | `packages/@n8n/agents` | Agent SDK — builder pattern, Mastra-based runtime |
| **AI** | `packages/@n8n/ai-node-sdk` | AI node development SDK |
| **AI** | `packages/@n8n/ai-utilities` | AI utility functions |
| **AI** | `packages/@n8n/ai-workflow-builder.ee` | AI-powered workflow builder (EE) |
| **AI** | `packages/@n8n/nodes-langchain` | LangChain integration nodes |
| **AI** | `packages/@n8n/instance-ai` | Instance-level AI assistant |
| **AI** | `packages/@n8n/chat-hub` | Chat hub backend (multi-agent chat) |
| **Infra** | `packages/@n8n/crdt` | CRDT abstraction (Yjs) for collaborative editing |
| **Infra** | `packages/@n8n/task-runner` | External task runner (sandboxed execution) |
| **Infra** | `packages/@n8n/task-runner-python` | Python task runner |
| **Infra** | `packages/@n8n/computer-use` | Computer use (browser automation) |
| **Infra** | `packages/@n8n/mcp-browser` | MCP browser client |
| **Infra** | `packages/@n8n/mcp-browser-extension` | MCP browser extension |
| **Infra** | `packages/@n8n/local-gateway` | Local gateway for development |
| **Nodes** | `packages/nodes-base` | 400+ built-in integration nodes |
| **Nodes** | `packages/node-dev` | Node development CLI tool |
| **Dev** | `packages/extensions` | Extension SDK |
| **Dev** | `packages/testing` | Test utilities, Playwright config |

### Planning implication for FlowHolt
n8n has 42 packages. FlowHolt should mirror this modular approach:
- Separate `@flowholt/design-system`, `@flowholt/permissions`, `@flowholt/db`, `@flowholt/api-types`
- Keep engine (`workflow`, `core`) isolated from the server (`cli`)
- AI should be its own package family, not embedded in core
- Raw source reference: `n8n-master/turbo.json` — build graph; `n8n-master/pnpm-workspace.yaml` — workspace config
- FlowHolt planning: `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` — backend module plan
- Make comparison: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §1` — Make is a monolith (no public package structure). n8n's modular approach is the right model for FlowHolt.

---

## 2. Frontend architecture (Vue 3 + Pinia + Vite)

### Tech stack
- **Framework**: Vue 3 with `<script setup>` (Composition API)
- **State management**: Pinia stores
- **Router**: Vue Router 4
- **Styling**: SCSS modules + CSS variables + Tailwind CSS (new)
- **Component library**: `@n8n/design-system` (100+ N8n-prefixed components)
- **Code editor**: CodeMirror 6 (custom n8n language extensions)
- **Icons**: Custom icon system via `unplugin-icons`
- **i18n**: `vue-i18n` v11
- **Canvas**: Custom Vue-based canvas (not a third-party library)

### Layout system

| Layout | Used by | Description |
|---|---|---|
| `DefaultLayout` | List pages, projects | Sidebar + content |
| `WorkflowLayout` | Workflow editor, executions | Sidebar + canvas + logs panel |
| `SettingsLayout` | Settings pages | Sidebar + settings sidebar + content |
| `AuthLayout` | Login, signup | Centered auth form |
| `DemoLayout` | Demo/preview mode | Minimal chrome |
| `ChatLayout` | Chat views | Chat-optimized |
| `InstanceAiLayout` | Instance AI | AI-specific layout |

### View / route map (75 named views)

Key views:
- `Homepage` → `/home/workflows` (default redirect)
- `WorkflowsView` → List of workflows (69KB — the largest view component)
- `NodeView` → Workflow canvas editor (58KB — the main editor view)
- `WorkflowExecutions` → Execution list + preview
- `EvaluationsView` → AI evaluation test runs
- `WorkflowHistory` → Version history
- `TemplatesSearchView` → Template gallery
- `ResourceCenterView` → Inspiration/resource hub
- Settings: Usage, Personal, Security, Users, AI, AI Gateway, Resolvers, Roles, API, Source Control, External Secrets, SSO, LDAP, Log Streaming, Workers, Community Nodes

### Main header tabs (per-workflow)
```
WORKFLOW | EXECUTIONS | SETTINGS | EVALUATION
```
This is a 4-tab layout for each workflow — significantly different from Make which has no per-workflow tabs.

### Sidebar structure
1. **MainSidebarHeader** — logo, collapse toggle, command bar trigger (Cmd+K)
2. **ProjectNavigation** — project-based navigation (workflows, credentials, executions, variables)
3. **BottomMenu** — help, templates/resource center, insights, settings
4. **MainSidebarSourceControl** — git integration status
5. **Resizable** — sidebar width is user-adjustable (200–500px)

### Bottom menu items
| ID | Icon | Label | Type |
|---|---|---|---|
| `cloud-admin` | cloud | Admin Panel | Cloud only |
| `resource-center` | lightbulb | Inspiration / Resource Center | Experiment |
| `templates` | package-open | Templates | External or in-app |
| `insights` | chart-column-decreasing | Insights | Module-gated |
| `help` | circle-help | Help | Dropdown with children |
| `settings` | settings | Settings | Route to settings area |

Help dropdown children: quickstart video, documentation, forum, courses, bug report, about

### Key Pinia stores (30+)

| Store | Purpose |
|---|---|
| `workflows.store` | Active workflow data, nodes, connections (55KB — largest store) |
| `workflowsList.store` | Workflow listing and filtering |
| `workflowDocument.store` | Workflow document state (CRDT integration) |
| `workflowSave.store` | Save state management |
| `workflowState.store` | Workflow UI state |
| `ui.store` | Global UI state — modals, panels, sidebar (24KB) |
| `settings.store` | Instance settings, features, enterprise flags |
| `nodeTypes.store` | Node type definitions and categories |
| `pushConnection.store` | Real-time push connection (SSE/WebSocket) |
| `posthog.store` | Feature flags via PostHog |
| `focusPanel.store` | Focus panel state (NDV, logs) |
| `logs.store` | Execution logs |
| `history.store` | Undo/redo history |
| `canvas.store` | Canvas viewport state |
| `rbac.store` | Frontend permission checks |
| `roles.store` | Role definitions |
| `versions.store` | Version notifications, what's new |
| `cloudPlan.store` | Cloud plan data |
| `aiGateway.store` | AI gateway credits |

### Modal system (47 modals)
Key modals:
- `about` — About n8n
- `chatEmbed` — Chat embed configuration
- `duplicate` — Duplicate workflow
- `importWorkflowUrl` — Import from URL
- `settings` — Workflow settings
- `workflowShare` — Share workflow
- `npsSurvey` — NPS survey
- `activation` — Workflow activation confirmation
- `importCurl` — Import from cURL
- `mfaSetup` — MFA setup
- `newAssistantSession` — New AI assistant session
- `fromAiParameters` — AI parameter configuration
- `workflowDiff` — Workflow diff viewer
- `workflowDescription` — Edit description
- `workflowPublish` — Publish workflow
- `aiBuilderDiff` — AI builder diff
- `binaryDataView` — Binary data viewer
- `credentialResolverEdit` — Dynamic credential resolver
- `stopManyExecutions` — Bulk stop executions
- `workflowExtractionName` — Extract sub-workflow

### NDV (Node Detail View) — n8n's Inspector

The NDV is n8n's equivalent of FlowHolt's node inspector. Structure:

```
NDVDraggablePanels
├── NDVHeader (node name, icon, tabs)
├── InputPanel (left) — shows input data from previous nodes
│   ├── InputNodeSelect — select which input to show
│   ├── TriggerPanel — for trigger nodes
│   └── Run data display
├── OutputPanel (right) — shows output data after execution
│   └── Run data display
├── NDVFloatingNodes — floating sub-connections
├── NDVSubConnections — AI sub-connections (tools, memory, etc.)
├── WireMeUp — connection helper
└── Parameters section
    ├── ParameterInputList — main parameter form
    ├── ParameterInput (66KB!) — individual parameter input
    ├── ExpressionParameterInput — expression editor
    ├── ExpressionEditModal — full expression editor
    ├── ResourceLocator — resource lookup
    ├── ResourceMapper — schema mapping
    ├── FilterConditions — conditional filters
    ├── AssignmentCollection — field assignments
    └── FixedCollection / Collection — grouped parameters
```

**Key insight**: n8n's NDV has **input/output panels side by side** — you can see incoming data on the left and outgoing data on the right while editing parameters. This is a defining UX pattern.

### Design system components (100+)

Key components from `@n8n/design-system`:
- **Layout**: `N8nResizeWrapper`, `N8nScrollArea`, `N8nCollapsiblePanel`, `N8nFloatingWindow`
- **Data display**: `N8nDatatable`, `N8nDataTableServer`, `N8nTree`, `N8nRecycleScroller`
- **Forms**: `N8nInput`, `N8nInputNumber`, `N8nSelect`, `N8nColorPicker`, `N8nFormBox`, `N8nFormInput`, `N8nFormInputs`, `N8nRadioButtons`, `N8nPromptInput`
- **Feedback**: `N8nAlert`, `N8nAlertDialog`, `N8nCallout`, `N8nNotice`, `N8nInfoTip`, `N8nInfoAccordion`, `N8nTooltip`, `N8nLoading`, `N8nSpinner`
- **Navigation**: `N8nTabs`, `N8nBreadcrumbs`, `N8nMenuItem`, `N8nNavigationDropdown`, `N8nRoute`
- **Actions**: `N8nButton`, `N8nIconButton`, `N8nActionBox`, `N8nActionDropdown`, `N8nActionToggle`, `N8nActionPill`, `N8nHeaderAction`, `N8nSendStopButton`
- **Content**: `N8nAvatar`, `N8nBadge`, `N8nCard`, `N8nTag`, `N8nTags`, `N8nLink`, `N8nExternalLink`, `N8nMarkdown`, `N8nText`, `N8nHeading`, `N8nIcon`, `N8nNodeIcon`, `N8nLogo`
- **Overlays**: `N8nDialog`, `N8nDropdown`, `N8nPopover`, `N8nBlockUi`
- **Canvas**: `CanvasCollaborationPill`, `CanvasPill`, `CanvasThinkingPill`
- **AI**: `AskAssistantAvatar`, `AskAssistantButton`, `AskAssistantChat`, `AskAssistantIcon`, `AskAssistantText`, `InlineAskAssistantButton`
- **Special**: `N8nCommandBar`, `N8nNodeCreatorNode`, `N8nSticky`, `N8nResizeableSticky`, `N8nPulse`, `N8nCircleLoader`, `N8nInlineTextEdit`, `CodeDiff`, `DateRangePicker`

---

## 3. Backend architecture (Express + TypeORM + DI)

### Tech stack
- **Server**: Express.js
- **ORM**: TypeORM (custom fork `@n8n/typeorm`)
- **Database**: SQLite (default) or PostgreSQL
- **DI**: `@n8n/di` — custom IoC container
- **Validation**: Zod (DTOs) + class-validator (entities)
- **Auth**: Cookie-based sessions, JWT, OAuth2, SAML, LDAP, OIDC
- **Queue**: Bull (Redis) for execution queue mode
- **Cache**: In-memory or Redis
- **Real-time**: Push system (SSE or WebSocket, configurable)
- **Feature flags**: PostHog

### Controller inventory (36 controllers)

| Controller | Purpose |
|---|---|
| `ai.controller` | AI assistant, AI workflow builder |
| `auth.controller` | Login, logout, session management |
| `me.controller` | Current user profile |
| `users.controller` | User management |
| `invitation.controller` | User invitations |
| `owner.controller` | Instance owner setup |
| `password-reset.controller` | Password reset flow |
| `mfa.controller` | Multi-factor auth |
| `project.controller` | Project CRUD |
| `folder.controller` | Folder CRUD |
| `tags.controller` | Tag CRUD |
| `annotation-tags.controller.ee` | Execution annotation tags (EE) |
| `active-workflows.controller` | Active workflow management |
| `workflow-statistics.controller` | Workflow stats |
| `node-types.controller` | Node type info |
| `dynamic-node-parameters.controller` | Dynamic parameter loading |
| `dynamic-templates.controller` | Template endpoints |
| `binary-data.controller` | Binary data access |
| `api-keys.controller` | API key management |
| `role.controller` | Role management |
| `posthog.controller` | Feature flags proxy |
| `security-settings.controller` | Security settings |
| `user-settings.controller` | User settings |
| `module-settings.controller` | Module settings |
| `telemetry.controller` | Telemetry events |
| `translation.controller` | i18n translations |
| `e2e.controller` | E2E test helpers |
| `debug.controller` | Debug endpoints |
| `orchestration.controller` | Multi-instance orchestration |
| `cta.controller` | Call-to-action tracking |

### Backend modules (24 modules)

| Module | Purpose |
|---|---|
| `chat-hub` | Multi-agent chat system |
| `mcp` | MCP server, OAuth, API keys |
| `instance-ai` | Instance-level AI assistant |
| `workflow-builder` | AI workflow builder |
| `insights` | Analytics and insights |
| `source-control.ee` | Git-based version control |
| `external-secrets.ee` | External secrets providers |
| `log-streaming.ee` | Log streaming destinations |
| `ldap.ee` | LDAP authentication |
| `sso-saml` | SAML SSO |
| `sso-oidc` | OIDC SSO |
| `provisioning.ee` | SCIM provisioning |
| `community-packages` | Community node packages |
| `data-table` | Data tables (like spreadsheets) |
| `breaking-changes` | Migration report system |
| `dynamic-credentials.ee` | Dynamic credential resolvers |
| `otel` | OpenTelemetry integration |
| `redaction` | Data redaction |
| `quick-connect` | Quick service connections |
| `token-exchange` | Token exchange |
| `workflow-index` | Workflow search indexing |
| `instance-registry` | Multi-instance registry |
| `instance-version-history` | Version tracking |

### Service inventory (40+ services)

Key services:
- `frontend.service` — Serves frontend settings, features, module configs (24KB)
- `project.service.ee` — Project management, sharing, permissions (20KB)
- `user.service` — User CRUD, role assignment (14KB)
- `role.service` — Role management, scope resolution (13KB)
- `import.service` — Workflow/credential import (26KB)
- `ownership.service` — Ownership resolution (8KB)
- `ai-gateway.service` — AI gateway, model routing, credits (10KB)
- `ai-workflow-builder.service` — AI-powered workflow generation (7KB)
- `folder.service` — Folder hierarchy management (10KB)
- `export.service` — Workflow/credential export (9KB)
- `redis-client.service` — Redis connection management (8KB)

### Database entities (44 entities)

| Entity | Key fields |
|---|---|
| `User` | id, email, firstName, lastName, role, mfaEnabled, disabled, settings |
| `Project` | id, name, type (personal/team), icon, description, creatorId |
| `ProjectRelation` | projectId, userId, role |
| `WorkflowEntity` | id, name, description, active, isArchived, nodes, connections, settings, meta, pinData, versionId, activeVersionId, versionCounter, triggerCount, parentFolder |
| `CredentialsEntity` | id, name, type, data (encrypted) |
| `ExecutionEntity` | id, workflowId, status, startedAt, stoppedAt, mode, retryOf |
| `ExecutionData` | executionId, data, workflowData |
| `ExecutionAnnotation` | id, executionId, vote, note (EE) |
| `Folder` | id, name, parentFolder (recursive) |
| `TagEntity` | id, name |
| `SharedWorkflow` | workflowId, projectId, role |
| `SharedCredentials` | credentialId, projectId, role |
| `WorkflowHistory` | versionId, workflowId, nodes, connections, authors |
| `WorkflowPublishedVersion` | workflowId, versionId |
| `WorkflowPublishHistory` | id, workflowId, publishedVersionId |
| `Variables` | id, key, value, type, projectId |
| `WebhookEntity` | webhookPath, method, node, workflowId |
| `ApiKey` | id, label, apiKey, userId |
| `Settings` | key, value, loadOnStartup |
| `Role` | slug, scopes |
| `Scope` | slug |
| `RoleMappingRule` | id, idpValue |
| `TestRun` (EE) | id, workflowId, status, metrics |
| `TestCaseExecution` (EE) | id, testRunId, executionId |
| `BinaryDataFile` | id, sourceType, fileName, mimeType |
| `SecretsProviderConnection` | id, providerType, name, data |

---

## 4. Permission system (RBAC)

### Scope-based permissions

n8n uses a **resource:operation** scope system. 64 resources with operations:

Key resources and scopes:
- `workflow`: create, read, update, delete, list, share, unshare, execute, execute-chat, move, activate, deactivate, publish, unpublish, updateRedactionSetting
- `credential`: create, read, update, delete, list, share, unshare, shareGlobally, move
- `project`: create, read, update, delete, list
- `folder`: create, read, update, delete, list, move
- `execution`: delete, read, retry, list, get, reveal
- `user`: create, read, update, delete, list, resetPassword, changeRole, enforceMfa, generateInviteLink
- `tag`: CRUD + list
- `variable` / `projectVariable`: CRUD + list
- `dataTable`: CRUD + list + readRow, writeRow, listProject
- `chatHub`: manage, message
- `chatHubAgent`: CRUD + list
- `mcp`: manage, oauth
- `instanceAi`: message, manage, gateway
- `sourceControl`: pull, push, manage
- `externalSecretsProvider`: sync, CRUD + list
- `role`: manage
- `insights`: list, read

### Role hierarchy

| Level | Roles |
|---|---|
| **Global** | owner, admin, member |
| **Project** | personalOwner, admin, editor, viewer, chatUser |
| **Workflow sharing** | editor, viewer |
| **Credential sharing** | user |

### Scope levels
- **Global** — instance-wide scopes from global role
- **Project** — project-level scopes from project role
- **Resource** — resource-level scopes from sharing role

### Planning implication for FlowHolt
n8n's scope system is very mature. FlowHolt should adopt the `resource:operation` pattern directly. Key difference: FlowHolt has a **workspace** layer between project and global that n8n lacks.
- Raw source: `n8n-master/packages/@n8n/permissions/src/` — scope definitions, role-to-scope resolution
- FlowHolt planning: `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md`, `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md`, `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md`
- Make comparison: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §3` — Make uses team/org role model. n8n's scope model is more granular.
- The `chatUser` project role (n8n) is important — FlowHolt should plan a similar "external chat user" role that can only interact with chat-enabled workflows.

---

## 5. Real-time / push system

### Architecture
- **SSE** (Server-Sent Events) — default push backend
- **WebSocket** — alternative push backend (configurable via `pushBackend` setting)
- **Push ref** — each browser tab gets a unique push reference for targeted messages
- **Origin validation** — custom origin validator for WebSocket security

### Collaboration system
Messages for collaborative editing:
- `workflowOpened` — user opened a workflow
- `workflowClosed` — user closed a workflow
- `writeAccessRequested` — user requests write access
- `writeAccessReleaseRequested` — user releases write access
- `writeAccessHeartbeat` — keep-alive for write lock

**Key insight**: n8n uses a **single-writer model** with write access requests — only one user can edit at a time. The CRDT package exists but the collaboration is currently write-lock based, not true multi-cursor CRDT collaboration.

### CRDT system (@n8n/crdt)
- Built on **Yjs** with abstraction layer
- Supports `CRDTMap`, `CRDTArray`, `CRDTDoc`
- Transports: `MockTransport`, `MessagePortTransport` (SharedWorker), `WebSocketTransport`
- Currently used for document sync with **last-write-wins** semantics for nested objects
- Text CRDT and Counter CRDT are documented as "not yet implemented"

### Planning implication for FlowHolt
FlowHolt should plan CRDT collaboration from the start. n8n's write-lock model is simpler but FlowHolt can leapfrog with true multi-cursor editing using Yjs directly.
- Raw source: `n8n-master/packages/@n8n/crdt/` — Yjs abstraction layer, `CRDTDoc`, `CRDTMap`, `CRDTArray`
- Push messages: `n8n-master/packages/cli/src/push/` — SSE and WebSocket push handlers
- FlowHolt planning: `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md`, `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md`
- Make comparison: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §7` — Make uses Socket.IO (Engine.IO v4) for real-time. n8n uses SSE/WebSocket. Both are proven patterns.
- **Decision for FlowHolt**: SSE for execution status (simple, server-push), WebSocket for collaboration (bidirectional, CRDT sync). Mirror n8n's configurable backend model.

---

## 6. AI system

### Package structure

| Package | Purpose | Key tech |
|---|---|---|
| `@n8n/agents` | Agent SDK — builder pattern | Mastra, Zod, AI SDK |
| `@n8n/ai-node-sdk` | AI node development | Custom SDK |
| `@n8n/ai-utilities` | Shared AI utilities | — |
| `@n8n/ai-workflow-builder.ee` | AI workflow generation | LLM-powered |
| `@n8n/nodes-langchain` | LangChain integration nodes | LangChain |
| `@n8n/instance-ai` | Instance-level AI assistant | — |
| `@n8n/chat-hub` | Multi-agent chat backend | — |
| `@n8n/computer-use` | Browser automation for AI | Playwright |

### Agent SDK (`@n8n/agents`)
- **Builder pattern**: `new Agent('name').model('provider/model').credential('cred').instructions('...')`
- **No `.build()` call** — lazy-build on `.run()` or `.stream()`
- **Credential injection**: Agents declare credential requirements, engine resolves them
- **Tools**: Builder-based tool definitions with Zod schemas
- **Memory**: Conversation + working memory with persistence hooks (SQLite, PostgreSQL)
- **MCP integration**: MCP client for tool discovery
- **Evaluation**: Built-in eval primitives for testing agents
- **Guardrails**: Builder-based input/output guardrails
- **Telemetry**: OpenTelemetry, LangSmith, redaction support
- **Workspace**: Sandbox/filesystem integration for agent workspaces

### LangChain nodes (`@n8n/nodes-langchain`)
Node categories:
- `agents/` — Agent node, OpenAI Assistant node
- `chains/` — Chain nodes
- `llms/` — LLM provider nodes
- `embeddings/` — Embedding provider nodes
- `memory/` — Memory nodes
- `tools/` — Tool nodes
- `vector_store/` — Vector store nodes
- `document_loaders/` — Document loader nodes
- `text_splitters/` — Text splitter nodes
- `retrievers/` — Retriever nodes
- `output_parser/` — Output parser nodes
- `rerankers/` — Reranker nodes
- `Guardrails/` — Guardrail nodes
- `ModelSelector/` — Model selection node
- `ToolExecutor/` — Tool execution node
- `mcp/` — MCP nodes
- `code/` — Code execution for AI
- `trigger/` — AI trigger nodes
- `vendors/` — Vendor-specific nodes

### Chat Hub
- Multi-agent chat system
- Frontend: `ChatView.vue` (27KB), `chat.store.ts` (47KB)
- Features: personal agents, workflow agents, semantic search, model selection
- Provider settings per LLM provider
- Agent upload support

### AI in the editor
- `AskAssistant*` components — AI assistant button, chat, avatar, text
- `InlineAskAssistantButton` — inline AI helper
- `AiGatewaySelector` — AI gateway/model selector
- `FromAiParametersModal` — AI-generated parameter values
- `FreeAiCreditsCallout` — AI credits promotion
- `SettingsAIView` — AI settings page
- `SettingsAiGatewayView` — AI gateway settings (n8n Connect)

### Planning implication for FlowHolt
n8n's AI system is extremely comprehensive. FlowHolt should:
1. Adopt the agent builder pattern from `@n8n/agents` — raw source: `n8n-master/packages/@n8n/agents/src/`
2. Plan a chat hub with personal and workflow-scoped agents — raw source: `n8n-master/packages/@n8n/chat-hub/`
3. Implement AI-assisted parameter filling (FromAI) — raw source: `n8n-master/packages/frontend/editor-ui/src/features/ai/`
4. Plan guardrails and evaluation from the start — raw source: `n8n-master/packages/@n8n/nodes-langchain/nodes/Guardrails/`
5. The MCP integration is extensive — FlowHolt should support MCP as both client and server — raw source: `n8n-master/packages/@n8n/mcp-browser/`, `n8n-master/packages/cli/src/modules/mcp/`
- FlowHolt planning: `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md`, `05-FLOWHOLT-AI-AGENTS-SKELETON.md`, `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md`
- Make comparison: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §6` — Make has 4 AI packages (text, agents, vision, web search). n8n has 8 AI packages. n8n is more comprehensive.
- **Key difference**: n8n's `@n8n/agents` uses Mastra framework + Zod for tool schemas. FlowHolt can use the same Mastra/AI SDK approach if building in TypeScript, or a Python equivalent (LangGraph, CrewAI) for the Python backend.

---

## 7. Workflow execution engine

### Core files
- `packages/core/src/execution-engine/workflow-execute.ts` (87KB) — the main execution engine
- `packages/workflow/src/workflow.ts` (26KB) — workflow definition and traversal
- `packages/workflow/src/workflow-data-proxy.ts` (51KB) — data proxy for node access
- `packages/workflow/src/expression.ts` (20KB) — expression evaluation
- `packages/workflow/src/expression-sandboxing.ts` (17KB) — sandboxed expression execution
- `packages/workflow/src/interfaces.ts` (104KB) — core type definitions

### Execution modes
- **Manual** — triggered by user in editor
- **Webhook** — triggered by incoming webhook
- **Trigger** — triggered by polling or event trigger
- **Queue** — distributed execution via Bull/Redis
- **CLI** — triggered from command line
- **Error** — error workflow execution
- **Sub-workflow** — called by another workflow

### Key concepts
- **Partial execution** — execute only changed/selected nodes
- **Pin data** — freeze node output for testing
- **Execution context** — different contexts per node type
- **Execution lifecycle hooks** — extensible hooks before/after execution
- **Task runner** — external sandboxed execution (separate process)
- **Wait tracker** — manages waiting executions (sleep, webhook wait)
- **Binary data** — file storage (filesystem, S3, database)

### Graph traversal
- `getParentNodes()` / `getChildNodes()` — node graph navigation
- `mapConnectionsByDestination()` — inverts connection map
- Connections indexed by **source node** (not destination)

### Expression engine
- Custom expression language (similar to JavaScript)
- Sandboxed execution via `vm2` or `isolated-vm`
- Extensions for date, string, number, array manipulation
- `$node`, `$input`, `$json`, `$binary`, `$env`, `$execution` — special variables
- CodeMirror language extensions for syntax highlighting and autocomplete

---

## 8. Node system

### Node type categories (from nodes-langchain)
| Category | Examples |
|---|---|
| Agents | AI Agent, OpenAI Assistant |
| Chains | Summarization, QA, Conversational |
| LLMs | OpenAI, Anthropic, Google, Azure |
| Embeddings | OpenAI, Cohere, HuggingFace |
| Memory | Buffer, Redis, Postgres, Zep |
| Tools | Calculator, Wikipedia, Code, HTTP |
| Vector stores | Pinecone, Qdrant, Supabase |
| Document loaders | PDF, CSV, JSON, Google Drive |
| Text splitters | Character, Token, Markdown |
| Retrievers | Vector store, contextual compression |
| Output parsers | Structured, JSON, list |
| Guardrails | Input/output validation |
| MCP | MCP client/server |
| Triggers | AI trigger nodes |

### Built-in nodes (packages/nodes-base)
400+ integration nodes covering all major SaaS services.

### Node development
- `packages/node-dev` — CLI tool for creating custom nodes
- Versioned node types supported
- Dynamic parameters loaded on demand
- Resource locator pattern for selecting resources

---

## 9. Project and folder system

### Project model
- **Personal projects**: One per user, automatic
- **Team projects**: Shared spaces, require EE license
- **Project types**: `personal` | `team`
- **Project relations**: User-to-project with role assignment
- **Project scoping**: Workflows, credentials, variables, secrets — all scoped to projects

### Folder system
- Recursive folder hierarchy (`parentFolder` self-reference)
- Workflows belong to folders via `parentFolderId`
- Folder-level tags via `FolderTagMapping`
- Move operations between folders and projects

### Key difference from Make
Make uses Organization → Team hierarchy. n8n uses Project-based flat hierarchy. FlowHolt's workspace layer sits between these approaches.

---

## 10. Enterprise features (EE)

Features marked with `.ee.` suffix require enterprise license:

| Feature | Status in n8n |
|---|---|
| SAML SSO | ✅ Full |
| OIDC SSO | ✅ Full |
| LDAP | ✅ Full |
| Source control (Git) | ✅ Full |
| External secrets | ✅ Full, multi-provider, project-scoped |
| Log streaming | ✅ Full |
| Audit logs | ✅ Full |
| Advanced execution filters | ✅ |
| Debug in editor | ✅ |
| Workflow diffs | ✅ |
| Named versions | ✅ |
| Advanced permissions | ✅ Custom roles |
| Data redaction | ✅ |
| Team projects | ✅ With limits |
| Provisioning (SCIM) | ✅ |
| AI workflow builder | ✅ |
| Evaluation test runs | ✅ |
| MFA enforcement | ✅ |
| Binary data S3 | ✅ |
| Worker view | ✅ |
| Personal space policy | ✅ |

---

## 11. Key patterns for FlowHolt adoption

### Patterns to adopt directly

1. **NDV dual-panel layout** — input/output data side-by-side while editing. FlowHolt should implement this.
2. **Per-workflow tabs** (Workflow / Executions / Settings / Evaluation) — group related views per workflow.
3. **Command bar** (Cmd+K) — global search and command palette. Already planned for FlowHolt.
4. **Pin data** — freeze node output for testing. Critical for builder UX.
5. **Partial execution** — run only changed nodes. Huge productivity feature.
6. **Resource locator** — standardized resource picker pattern for node parameters.
7. **Expression editor** with CodeMirror — custom language extensions for autocomplete.
8. **Resizable sidebar** — user-adjustable sidebar width.
9. **Design system** with N8n-prefixed components — FlowHolt should have `Fh`-prefixed components.
10. **Shared API types package** — `@n8n/api-types` pattern for FE/BE type safety.
11. **Push system** with SSE/WebSocket choice — FlowHolt should support both.
12. **PostHog for feature flags** — n8n uses PostHog, FlowHolt can use the same or similar.
13. **Source control integration** — Git-based workflow versioning.
14. **External secrets** — Vault integration for credentials.
15. **MCP support** — Both client (tools in workflows) and server (expose workflows as tools).
16. **Data tables** — Spreadsheet-like data storage within the platform.

### Patterns to improve upon

1. **Collaboration** — n8n uses write-lock, FlowHolt should use true CRDT multi-cursor.
2. **Project hierarchy** — n8n has flat projects, FlowHolt has org → team → workspace (richer).
3. **Workflow publishing** — n8n recently added `activeVersionId`, FlowHolt has more mature deployment pipeline.
4. **Environment separation** — FlowHolt's environment concept (dev/staging/prod) is more explicit.
5. **Approval workflows** — FlowHolt plans deployment approval, n8n doesn't have this.

### Patterns unique to n8n that FlowHolt should consider

1. **Chat Hub** — Multi-agent chat with personal and workflow agents. New paradigm.
2. **AI Workflow Builder** — Generate workflows from natural language.
3. **Evaluation system** — Test AI workflows with metrics and test runs.
4. **Computer Use** — Browser automation for AI agents.
5. **Insights module** — Analytics dashboard for workflow performance.
6. **Resource Center** — Curated templates and inspiration.
7. **What's New** modal — Version update announcements.
8. **NPS Survey** — Built-in user feedback collection.
9. **Dynamic credential resolvers** — Runtime credential resolution.
10. **Data redaction** — Enterprise data privacy controls.
11. **Task runner** — Sandboxed external execution for security.
12. **Sticky notes on canvas** — `N8nResizeableSticky` for annotations.

---

## 12. n8n vs Make comparison (from FlowHolt's perspective)

> Full competitive matrix → `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md`
> n8n adoption synthesis → `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md`

| Dimension | n8n | Make | FlowHolt direction | Planning file |
|---|---|---|---|---|
| **Codebase** | Open source, TypeScript monorepo | Proprietary, Angular | Open-ish, TypeScript, React/Next.js | `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` |
| **Frontend** | Vue 3, Pinia, custom canvas | Angular, CDK overlays | React, Zustand, @xyflow/react | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` |
| **Backend** | Express, TypeORM, DI | Unknown (cloud) | Next.js API routes → possible Express later | `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` |
| **Database** | SQLite/PostgreSQL | Unknown (cloud) | PostgreSQL (Drizzle ORM) | `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` |
| **Auth** | Email, SAML, OIDC, LDAP | Unknown | Email, OAuth, SAML planned | `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md` |
| **Real-time** | SSE/WebSocket (push) | Socket.IO | WebSocket (planned) | `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` |
| **Collaboration** | Write-lock | No collaboration | CRDT (planned) | `41-N8N` §5, Yjs |
| **AI** | Agents SDK, LangChain, Chat Hub, Eval | AI modules (4 packages) | Agent entity, AI node family | `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` |
| **MCP** | Full client + server | MCP Toolboxes | Planned | `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` |
| **Node inspector** | NDV (dual-panel, input/output) | CDK overlay panel | Should adopt n8n's dual-panel | `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` |
| **Hierarchy** | User → Project | User → Org → Team | User → Org → Team → Workspace | `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` |
| **Versioning** | activeVersionId, WorkflowHistory | No versioning | Deployment pipeline | `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md` |
| **Source control** | Git integration (EE) | No | Planned | `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` |
| **Canvas** | Custom Vue canvas | Custom Angular canvas | @xyflow/react | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` |
| **Expression** | Custom expression language | Custom expression | Should adopt n8n-style | `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` |
| **Testing** | Pin data, partial execution, eval | Manual only | Should adopt n8n patterns | `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` |
| **Hosting** | Self-hosted + cloud | Cloud only | Self-hosted + cloud planned | `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` |

---

## 13. File size analysis — complexity hotspots

| File | Size | Significance |
|---|---|---|
| `workflow/src/interfaces.ts` | 104KB | Core type definitions — massive |
| `core/src/execution-engine/workflow-execute.ts` | 87KB | Main execution engine |
| `editor-ui/src/app/views/WorkflowsView.vue` | 69KB | Workflow list view |
| `editor-ui/src/features/ndv/parameters/components/ParameterInput.vue` | 66KB | Parameter input — the most complex UI component |
| `editor-ui/src/app/views/NodeView.vue` | 58KB | Main canvas editor |
| `editor-ui/src/app/stores/workflows.store.ts` | 56KB | Workflow state management |
| `editor-ui/src/app/components/WorkflowSettings.vue` | 55KB | Workflow settings dialog |
| `workflow/src/workflow-data-proxy.ts` | 51KB | Data proxy for node data access |
| `editor-ui/src/features/ai/chatHub/chat.store.ts` | 47KB | Chat hub state |
| `workflow/src/node-helpers.ts` | 60KB | Node utility functions |

### Planning implication
The largest files reveal where complexity lives. FlowHolt should plan for:
- A very large workflow interface/types file
- A complex execution engine
- Complex parameter input components
- Rich workflow store logic
