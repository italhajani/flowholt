# Session Handoff Checkpoint

Date: April 13, 2026 (updated)

## Project purpose

Build a final ultimate plan for FlowHolt that covers:
- every major section
- every important page
- panels, menus, tabs, dropdowns, and settings groups
- backend behavior and domain logic
- mature structure inspired first by Make and later also by n8n

## Current completed work

### Make reference collection
- `help.make.com` was fully scraped into `D:\My work\flowholt3 - Copy\research\make-help-center-export`
- final export state:
  - 324 markdown pages
  - 324 raw HTML pages
  - 324 page metadata files
  - 875 downloaded images
  - 2 downloaded file assets

### Existing master observation plan
- the running Make Academy observation plan is in:
  - `D:\My work\flowholt3 - Copy\plan-introductionToMakeUi.prompt.md`

### Planning workspace created
- `D:\My work\flowholt3 - Copy\research\flowholt-ultimate-plan`

### Planning files already drafted
- `00-MAKE-SYNTHESIS-WORKFLOW.md`
- `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md`
- `02-MAKE-INITIAL-SYNTHESIS.md`
- `03-FLOWHOLT-IA-SKELETON.md`
- `04-FLOWHOLT-CONTROL-PLANE-SKELETON.md`
- `05-FLOWHOLT-AI-AGENTS-SKELETON.md`
- `06-FLOWHOLT-SETTINGS-CATALOG-SKELETON.md`
- `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md`
- `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md`
- `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md`
- `10-MAKE-TO-FLOWHOLT-GAP-MATRIX.md`
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md`
- `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md`
- `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md`
- `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md`
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md`
- `16-FLOWHOLT-CONFIDENTIAL-DATA-GOVERNANCE-DRAFT.md`
- `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md`
- `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md`
- `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md`
- `20-MAKE-FLATTENED-PDF-REFERENCE-NOTES.md`
- `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md`
- `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md`
- `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md`
- `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md`
- `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md`
- `26-FLOWHOLT-STUDIO-OBJECT-FIELD-CATALOG-DRAFT.md`
- `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md`
- `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md`
- `29-FLOWHOLT-QUEUE-DASHBOARD-WIREFRAME-AND-ALERTS.md`
- `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md`
- `31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md`
- `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md`
- `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md`
- `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md`
- `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md`
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md`
- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md`
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md`
- `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md`
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md`
- `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md`
- `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md`
- `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md`
- `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md`
- `45-FLOWHOLT-DATA-STORE-AND-CUSTOM-FUNCTION-SPEC.md`
- `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md`
- `47-FLOWHOLT-AUTOMATION-MAP-SPEC.md`
- `48-FLOWHOLT-REMAINING-MAKE-CORPUS-GAPS.md`

### Additional completed synthesis work
- the Make corpus was indexed into planning domains in:
  - `D:\My work\flowholt3 - Copy\research\flowholt-ultimate-plan\make-domain-index.md`
  - `D:\My work\flowholt3 - Copy\research\flowholt-ultimate-plan\make-domain-index.json`
- initial planning skeletons now cover:
  - product information architecture
  - control plane
  - AI agents
  - settings
  - Studio surfaces
  - permissions and governance
  - backend architecture
- a first Make-to-FlowHolt comparison matrix now exists, grounded in:
  - Make help-center references
  - current FlowHolt dashboard navigation
  - current Studio shell
  - current backend workflow and role models
- the planning workspace now also includes:
  - a deeper Studio anatomy draft
  - a first permissions matrix draft
  - a backend service map draft
  - image-based UI evidence notes from local Make screenshots
  - a more exact Studio inspector and modal inventory grounded in current FlowHolt Studio code
  - a confidential-data governance draft covering secrets, payloads, AI reasoning, pinned data, and environment overrides
  - a backend entity and event model draft covering scope hierarchy, lifecycle states, event families, and storage boundaries
  - a role-by-surface enforcement matrix for Studio, Vault, runtime, approvals, and AI surfaces
  - a runtime queue and retention draft covering queue lanes, pause-resume, replay, concurrency, and retention policy
  - a flattened Make PDF reference note documenting how to use the PDF and the current extraction limitation
  - a route and API authorization map tying current frontend routes and backend API families to policy expectations
  - a worker topology and queue-ops draft covering scheduler, processor, resume, maintenance, retry, and dead-letter concepts
  - a Studio release-actions draft defining where run, replay, version, compare, publish, and approval actions should live
  - a compact auth implementation matrix with capability, preload, redaction, and denied-state columns
  - a queue dashboard and runbooks draft covering queue overview, worker health, retry board, dead-letter handling, and paused execution operations
  - a Studio object field catalog draft covering workflow, standard nodes, AI nodes, pause-producing nodes, and execution-step objects
  - an exact node-type field inventory draft grounded in the real backend node registry, with sensitivity classes and baseline role-state rules
  - a capability-object and auth-helper draft defining frontend `can*` objects, backend capability builders, reason-code vocabulary, and route preload order
  - a queue dashboard wireframe and alert draft covering runtime operations layout, lane cards, worker boards, alert thresholds, and operator workflows
  - a Studio tab role-state and mapping draft that formalizes viewer versus builder versus publisher behavior across `Parameters`, `Settings`, and `Test`, including pinned-data rules
  - a capability API-shapes and rollout draft that defines proposed frontend interfaces, attach points, and phased delivery order for capability-aware payloads
  - a runtime-operations route spec that gives queue ops a dedicated route family instead of leaving runtime work fragmented across existing pages
  - exact per-node-family tab exceptions and workflow-level overrides grounded in node registry, field inventory, and Make corpus
  - exact capability bundle payloads with denial-response contracts, field sensitivity maps, per-object capability types, and a 4-phase migration plan
  - runtime API contracts with summary endpoint, runtime capabilities object, per-route data-loading sequences, dead-letter model, alert system, and execution replay enhancements
  - expanded gap matrix with 12 sections, sub-gap tables per domain, Make corpus citations, code evidence, FlowHolt advantages section, and cross-references to all new planning files
  - a concrete organization and team entity design with 5 org roles, 5 team roles, session token evolution, capability integration, database schema, 4-phase migration from workspace-only model, and URL/navigation structure
  - a managed AI agent entity specification with dual nature (inventory + studio node), knowledge/RAG system with chunking and embedding pipelines, 3 tool types (module, workflow, MCP), testing surface with tool trace visibility, and agent↔node linking mechanism
  - a complete settings catalog covering 6 scope levels (user, org, team, workspace, workflow, agent) with exact field definitions, inheritance chain, weakening prevention, and UI placement
  - a backend domain module plan decomposing the 411KB monolithic main.py into 13 product-aligned domains with dependency rules, incremental migration strategy, and target test structure
  - a frontend route and page inventory documenting all 22 current routes and 19 planned pages, sidebar evolution through 2 phases, 6 layout types, page-level data loading sequences, and navigation permission rules
  - an observability and analytics specification defining the credit/operation model, 7 consumption tracking surfaces mirroring Make, an enterprise analytics dashboard, team credit management with threshold notifications, complete audit log event taxonomy, and system health metrics
  - a webhook and trigger system specification covering 6 trigger types (manual, webhook, schedule, chat, event, polling), webhook queue management with plan-based limits, Make-aligned exponential backoff auto-retry, consecutive error tracking with auto-deactivation, and 5-phase rollout
  - an environment and deployment lifecycle specification defining draft→staging→production pipeline, role-based approval flows with self-approval controls, instant rollback, version comparison with step-level diffs, execution replay across environments, workflow export/import/clone, and auto-save recovery
  - an error handling and resilience specification defining all 5 Make error handler types (Ignore/Resume/Commit/Rollback/Break), a 17-type error taxonomy (11 Make + 6 FlowHolt extensions), step-level retry with 3 backoff strategies, scenario-level exponential backoff matching Make’s 8-attempt schedule, incomplete execution storage with plan-based limits, dead-letter system with 3 sources, consecutive error tracking with auto-deactivation, integration-level circuit breakers (FlowHolt addition), ACID transaction support for data store modules, and a Throw step for conditional error generation
  - a data store and custom function specification defining key-value data stores with ACID transaction support and environment-scoped isolation, data structures with a JSON-to-schema generator and strict mode, 4 variable types (system, workflow, custom at org/team/workspace level, incremental), custom JavaScript ES6 functions with version history and debug console (Teams/Enterprise), 11 flow control node types, and a complete expression language with 7 built-in function categories
  - an integration and connection management specification defining the vault-based connection model with OAuth2 token refresh, environment-scoped connections (workspace/staging/production), credential requests for secure cross-team credential collection, dynamic connections as per-run switchable variables, connection health monitoring with periodic checks and state tracking, the integration plugin registry with 13+ integrations, bulk connection replacement, connection access control with visibility levels, on-premise agent plan, and keys/certificates management

### New grounding used in this round
- current FlowHolt Studio code was re-read, especially:
  - `src/components/studio/TopBar.tsx`
  - `src/components/studio/NodeConfigPanel.tsx`
  - `src/components/studio/StatusBar.tsx`
  - `src/components/studio/StudioCommandBar.tsx`
- current FlowHolt backend model evidence was re-read from:
  - `backend/app/models.py`
- current backend module structure was re-read from:
  - `backend/app`
- current runtime and policy behavior was re-read from:
  - `backend/app/repository.py`
  - `backend/app/executor.py`
  - `backend/app/scheduler.py`
  - `backend/app/main.py`
- current route structure was re-read from:
  - `src/App.tsx`
- current backend endpoint families were re-read from:
  - `backend/app/main.py`
- current workflow settings UI was re-read from:
  - `src/components/studio/WorkflowSettingsModal.tsx`
- current Studio composition and action placement were re-read from:
  - `src/components/studio/WorkflowStudio.tsx`
- current node schema and defaults were re-read from:
  - `backend/app/node_registry.py`
- current policy response models were re-read from:
  - `backend/app/models.py`
- current API contract definitions were re-read from:
  - `src/lib/api.ts`
- current runtime-facing pages were re-read from:
  - `src/pages/dashboard/SystemStatusPage.tsx`
  - `src/pages/dashboard/ExecutionDetailPage.tsx`
- current Studio tab and pinned-data behavior were re-read from:
  - `src/components/studio/NodeConfigPanel.tsx`
- current route structure was re-read again from:
  - `src/App.tsx`
- current sidebar navigation was re-read from:
  - `src/components/dashboard/DashboardSidebar.tsx`
- current webhook infrastructure was re-read from:
  - `backend/app/webhooks.py`
- current scheduler infrastructure was re-read from:
  - `backend/app/scheduler.py`
- current deployment and version models were re-read from:
  - `backend/app/models.py` (WorkflowVersion*, WorkflowDeployment*, WorkflowPromotion*, WorkflowRollback*, WorkflowEnvironment*)
  - `backend/app/main.py` (promote, publish, approval, rollback policy checks)
- Make corpus pages consulted for frontend/observability/webhooks/lifecycle:
  - `analytics-dashboard.md`, `operations.md`, `credits.md`, `how-to-track-credits.md`, `credits-per-team-management.md`, `webhooks.md`, `audit-logs.md`, `schedule-a-scenario.md`, `types-of-modules.md`, `scenario-settings.md`, `scenario-execution-cycles-and-phases.md`, `incomplete-executions.md`, `automatic-retry-of-incomplete-executions.md`, `explore-make-grid-gui.md`, `restore-and-recover-scenario.md`, `blueprints.md`, `clone-a-scenario.md`, `scenario-run-replay.md`, `scenario-history.md`
- Make corpus pages consulted for error handling, data stores, functions, and connections:
  - `overview-of-error-handling.md`, `error-handlers.md`, `quick-error-handling-reference.md`, `break-error-handler.md`, `commit-error-handler.md`, `ignore-error-handler.md`, `resume-error-handler.md`, `rollback-error-handler.md`, `types-of-errors.md`, `exponential-backoff.md`, `throw.md`, `data-stores.md`, `data-structures.md`, `custom-functions.md`, `variables.md`, `flow-control.md`, `connect-an-application.md`, `connections.md`, `credential-requests.md`, `dynamic-connections.md`, `scenarios-and-connections.md`
- Existing FlowHolt code re-read for error handling and connections:
  - `backend/app/studio_nodes.py` (error handling fields: _retry_on_fail, _retry_count, _retry_wait_ms, _retry_backoff)
  - `backend/app/node_registry.py` (HTTP request retry fields)
  - `backend/app/models.py` (VaultAssetKind, VaultConnectionSummary, VaultAssetHealthCheck, VaultAssetVerifyResponse, VaultAssetAccessUpdate, StudioStepAssetBinding)
  - `backend/app/integration_registry.py` (integration metadata)
  - `backend/app/plugin_loader.py` (dynamic plugin loading)
  - `backend/app/oauth2.py` (OAuth2 flow support)
- the flattened Make PDF was re-registered as a reference source at:
  - `research/make-help-center-export/assets/files/PUBLISHED-TDD_JYughqVhdcQ3sZF9_-20260408-1440__fd47c12e6a18.pdf`
- helper scripts were added for future PDF work:
  - `scripts/inspect_local_pdf.mjs`
  - `scripts/extract_pdf_text_heuristic.py`
- the full Make documentation PDF (~31K lines, `research/make-pdf-full.txt`) was read comprehensively across multiple sessions, covering:
  - AI Agents (New) app: configuration, conversation memory, response format, step timeout, credit model
  - MCP toolboxes: tool selection, key-based auth, transport methods, 40-second timeout
  - Subscenarios: sync/async modes, Call/Start/Return modules, same-team restriction
  - Scenario Inputs/Outputs: typed inputs for APIs and AI agents, output definitions
  - Credits & Operations: fixed vs. dynamic credits, token-to-credit rates per model tier, Make Code 2 credits/sec
  - Scenario Execution Model: Initialization → Cycles (Operation → Commit/Rollback) → Finalization, ACID tags
  - Scenario Settings: sequential processing, auto-commit, commit trigger last, max cycles, consecutive errors, confidential data
  - Variables: system (read-only), scenario (ephemeral), custom (org/team, persisted, NOT encrypted), incremental (counters)
  - Incomplete Executions: auto-retry backoff (1m→10m→10m→30m→30m→30m→3h→3h), Break handler 3 attempts/15min, 3 parallel retries
  - Error Handling: 5 handlers (Rollback/Break/Ignore/Resume/Commit), error types taxonomy, rate limit mitigation, consecutive error auto-deactivation
  - Data Stores: 1 MB per 1,000 ops, 15 MB max record, 8 modules, ACID-tagged, strict mode, data structures
  - Webhooks: parallel/sequential processing, 667 queue items per 10K credits (max 10K), 300 req/10s rate limit, 5-day inactive expiry
  - Module Types: triggers (polling/instant), searches (3200 object limit), actions, universal, tools (built-in), 40-min run limit
  - Data Security: AES (CBC/GCM, 128/256-bit), PGP (min 2048-bit), SHA-1/SHA-256 hashing, keychain management
  - SSO/SAML, 2FA, feature controls, access management
  - Billing, subscriptions, extra credits, payment methods
  - Administration: analytics dashboard, credits per team, audit logs, session timeout
  - Managed Services (MMS): distributor/child organizations, credit allocation
- direct local image inspection was used again, especially:
  - `research/make-help-center-export/assets/images/E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png`
  - `research/make-help-center-export/assets/images/FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png`
  - `research/make-help-center-export/assets/images/Zusz0Qbp3EP67xJ3qK7cl-20251003-145143__30f711290366.png`
  - `research/make-help-center-export/assets/images/4mSSL57quEGYfR0D7Re6S-20251003-084705__3d89fb62bdb2.png`

### Key new conclusions from this round
- FlowHolt already has a credible Studio foundation, so the plan should now specify exact object inspectors, overlays, and runtime drawers instead of vague surface ideas.
- The existing `NodeConfigPanel` is rich enough to justify a stable final inspector contract built around `Parameters`, `Settings`, and `Test`, with AI-specific extensions rather than a separate AI editor.
- Pinned data is not harmless editor state. It should be governed as confidential runtime-derived content.
- FlowHolt already has backend evidence for a mature release model through workflow versions, deployment reviews, replay modes, trigger exposure, and workspace policy settings.
- The backend plan must clearly separate draft state, version state, jobs, executions, execution artifacts, and execution events.
- Surface-level permission design is now concrete enough to plan disabled, masked, approval-required, and hidden states per UI surface instead of speaking only in role abstractions.
- The runtime plan should explicitly separate interactive runs, scheduled or event-driven jobs, and resume or recovery flows.
- The flattened PDF remains a useful manual reference, but current automated extraction is weak, so planning should continue using the local image corpus first and the PDF as a manual fallback source.
- The next maturity step is implementation-grade mapping: specific routes, API families, policy preloads, and visible UI action states.
- Studio now has a clearer release-aware control model: state and compare stay high in the layout, while run and replay stay low near the persistent operating strip.
- Runtime operations now need explicit queue dashboards, retry classification, and dead-letter playbooks rather than only entity definitions.
- The auth model is now compact enough to evolve into concrete `can*` capability objects for the frontend and helper checks for the backend.
- The current workflow settings modal already provides a credible grouping pattern for workflow-level runtime and execution-data fields, so the final plan should extend that instead of replacing it.
- The next Studio maturity step is exact node-type field inventories and sensitivity tags, not more generic panel descriptions.
- The real node registry is now strong enough to plan field-level sensitivity classes instead of talking only about node categories.
- Capability design should layer on top of existing workflow policy and enforcement helpers, not replace them with a second unrelated auth system.
- Queue operations now have enough structure to plan the actual runtime operations route, alert thresholds, and operator drill-down workflows.
- Make UI evidence continues to support a design principle of keeping core operating actions persistently accessible and visually separated from the canvas itself.
- The existing Studio inspector contract is mature enough that the next step is policy-governed tab behavior, not inventing a new inspector model.
- The frontend currently lacks a typed workflow-policy contract, so capability rollout should start by making policy explicit in `src/lib/api.ts`.
- Runtime operations need a dedicated route family because the current split across `System`, `Executions`, and `Environment` is operationally incomplete even though each page is individually useful.

### Key new conclusions from latest round
- Per-node-family tab exceptions are now concrete enough to implement: each of the 6 families (trigger, data/logic, output/integration, pause/human, core AI, AI specialist) has exact section groupings, tab visibility rules, and sensitivity class assignments.
- AI agent node inspector should use 5 section groups (Prompt & Instructions, Model & Provider, Tools & Capabilities, Memory, Cluster) rather than a single flat parameters tab.
- AI trace rendering requires three tiers (Result, Trace summary, Raw reasoning) and the Test tab must respect confidentiality policy by hiding raw reasoning when `data_is_confidential` is true.
- Capability bundles are now defined at 4 object levels: WorkflowCapabilities (12 capabilities), NodeCapabilities (5 capabilities), ExecutionCapabilities (8 capabilities), and VaultAssetCapabilities (7 capabilities).
- Field sensitivity maps (`field_key → sensitivity_class`) on the node editor response allow the frontend to apply per-field masking without hardcoding field knowledge.
- The structured denial response contract (`CapabilityDenialResponse`) provides a uniform error format for all capability-gated mutation endpoints.
- Runtime operations now have 7 concrete route contracts (overview, jobs, pauses, failures, workers, alerts, dead-letters) with exact response models and data-loading sequences.
- Dead-letter items are created from 3 sources: job exhaustion, unrecoverable execution errors, and rejected webhooks.
- Runtime capabilities are computed at workspace level (not per-workflow) with 14 distinct capability states.
- FlowHolt's advantages over Make (environment separation, deployment approval, workflow versioning, human tasks, typed artifacts, capability system) should be preserved and deepened.

### Key conclusions from Make PDF deep-read and file 37 expansion round
- The Make full PDF provided exact values for execution limits (40-min duration, 5 MB per step, 3200 objects per search), webhook infrastructure (300 req/10s, 667 queue items per 10K credits, 5-day inactive expiry), and auto-retry scheduling (8-attempt exponential backoff) that were previously only approximated from help center pages.
- File 37 expanded from 826 to 1233 lines with 7 new Make-grounded sections (11d–11j) covering error handling strategy model, incomplete executions and auto-retry, scenario execution and transaction model, webhooks and trigger model, variables system, data stores and structures, and data security mechanisms.
- 9 new open planning decisions were added (#11–#19): error handler phasing, IE storage limits, data store priority, variable secret support, webhook queue sizing, execution time limits, ACID step identification, system variable extensibility, and encryptor node priority.
- FlowHolt should improve on Make's custom variable design by adding an `is_secret` flag for encryption at rest — Make stores all custom variables in plaintext.
- The `WorkflowWebhook`, `IncompleteExecution`, `WorkspaceVariable`, `DataStore`, `DataStoreStructure`, and Encryptor node type models are now concretely defined in file 37.
- Make's AES/PGP/hashing capabilities map to a single FlowHolt `encryptor` node type in the `tools` family, with vault-stored keys replacing Make's keychain system.
- ACID tagging should be a `supports_acid: bool` property on `NodeTypeDefinition` — only data store and database connector nodes get rollback support.
- The Make PDF research phase is now comprehensive. The remaining unread sections are primarily step-by-step tutorials, app-specific module references, and release notes — not design-impacting content.

### Key conclusions from control-plane, agent, settings, and backend round
- Organization → Team → Workspace hierarchy is now concrete with 5 org roles (owner, admin, member, billing, guest) and 5 team roles (admin, builder, operator, monitor, guest), aligned with Make's model but adding the workspace layer Make lacks.
- The session token evolves to include `org_id`, `team_id`, `org_role`, `team_role` while preserving backward compatibility through `require_workspace_role` (effective role computed from team role + org role override).
- Migration from workspace-only model is non-breaking: each existing workspace gets an implicit default org and default team; existing roles map cleanly to the new hierarchy.
- AI agents have a formal dual nature: managed entity (inventory) and studio node (execution graph). A `managed_agent_id` on the ai_agent node config links the two forms, with inheritance rules for configuration merging.
- Knowledge/RAG system follows Make's architecture: file upload → chunking → embedding → vector store, with plan-based quotas (5-20 files per agent depending on plan).
- Three tool types for agents: module tools (single node type as callable), workflow tools (complete workflow with inputs/outputs), and MCP tools (accessed through MCP server connections).
- Settings inherit from org → team → workspace → workflow with weakening prevention: security-sensitive settings set at org level cannot be weakened downstream.
- The 411KB monolithic `main.py` can be decomposed into 13 domains (identity, organization, workspace, workflow, studio, execution, runtime, vault, agent, integration, assistant, notification, system) with a target `main.py` of < 200 lines.
- Incremental extraction strategy: extract one domain at a time starting with smallest/most-isolated (system, notification, identity), ending with new domains (organization, agent, runtime).
- The planning workspace now covers all major product domains at implementation-grade detail. The remaining gaps are error handling/resilience, data stores/custom functions, and integration/connection management.

## Current design direction

The current direction is:
- Make gives us maturity patterns for control plane, settings depth, collaboration, runtime, and structured AI-agent management
- later n8n should influence FlowHolt more strongly in logic style and AI-agent orchestration behavior
- final FlowHolt should not copy Make or n8n directly
- final FlowHolt should merge mature control-plane design with strong automation and agent logic

## Non-negotiable planning principles

- The editor is not the whole product.
- Workflows, agents, assets, environments, teams, and runtime operations must all have explicit places.
- User settings, org settings, team settings, workspace settings, and environment settings must stay separate.
- AI agents must exist both as managed product objects and as runtime authoring components.
- Shared assets must have explicit ownership and scope.
- Permissions must separate editing, operating, scheduling, observing, and publishing.

### Key conclusions from frontend, observability, webhooks, and lifecycle round
- FlowHolt has 22 current routes and needs 19 planned pages, for a total of 41 pages across 6 layout types (Auth, Dashboard, Org, Team, Studio, Public).
- The sidebar evolves in 2 phases: Phase 1 adds a Runtime section; Phase 2 adds org/team/workspace switchers and an Org section.
- The credit/operation model follows Make's structure (1 operation = 1 credit for standard ops, dynamic for AI based on tokens) with 7 consumption tracking surfaces.
- Make's analytics dashboard structure (operations by team, total operations, errors, error rate, executions, time-frame filters, per-workflow table) is directly translatable to FlowHolt.
- Team credit management with threshold notifications (75%/90%/100%) and scenario pausing at 100% is an enterprise feature.
- FlowHolt now has 6 trigger types planned: manual, webhook, schedule, chat, event (internal), polling. Make has 2 (polling + instant/webhook). FlowHolt adds event and API triggers.
- Webhook queue limits follow Make's formula (667 items per 10,000 credits, max 10,000). Rate limit is 300 requests per 10 seconds.
- Auto-retry of incomplete executions uses Make's exact exponential backoff schedule (1m→10m→10m→30m→30m→30m→3h→3h) with 3 parallel retries per workflow.
- Consecutive error tracking auto-deactivates workflows after threshold, with instant deactivation for webhook-triggered workflows on first error.
- FlowHolt's draft→staging→production pipeline with formal approval flows, instant rollback, and deployment audit trail has no Make equivalent — Make has only version history (60-day manual saves).
- Execution replay enables using trigger data from any previous run against any version in any environment, covering test, error recovery, and data backfill use cases.
- Workflow export/import follows Make's blueprint model (JSON bundle with modules + settings, excluding connections) with vault reference mapping on import.
- Clone supports same-workspace (preserving connections) and cross-workspace (requiring connection mapping), with polling trigger state preservation option.

### Key conclusions from error handling, data store, and connection round
- FlowHolt adopts all 5 Make error handlers (Ignore, Resume, Commit, Rollback, Break) with identical semantics: Rollback is the default when no handler is configured.
- FlowHolt extends Make’s 11 error types with 6 platform-specific types (VaultConnectionError, WorkflowValidationError, PolicyDeniedError, CreditLimitError, StepTimeoutError, CircuitOpenError).
- Step-level retry is already partially implemented (studio_nodes.py has _retry_on_fail, _retry_count, _retry_wait_ms, _retry_backoff) and needs only error type filtering and non-retryable exclusion lists.
- Scenario-level exponential backoff matches Make’s exact 8-attempt schedule with two modes (incomplete executions enabled vs. disabled).
- Incomplete executions have plan-based storage limits (10 for Free up to 10,000 for Enterprise) and can be auto-retried by the Break handler.
- Dead-letter items come from 3 sources (job exhaustion, fatal execution errors, rejected webhooks) and can be reprocessed into new jobs.
- Circuit breakers are a FlowHolt addition not present in Make — per-integration, per-workspace, with closed→open→half-open state machine.
- Data stores follow Make’s model (key-value with schema, ACID support, 8 module types) extended with environment-scoped isolation (shared/staging/production).
- Custom variables exist at 3 scope levels (organization, team, workspace) matching Make’s org/team model plus FlowHolt’s workspace layer.
- Custom functions match Make constraints exactly (ES6, 300ms, 5000 chars, sync only, no HTTP) and are gated to Teams/Enterprise.
- The expression language uses `{{ }}` templates with 7 built-in function categories and support for custom functions.
- FlowHolt’s connection model already has vault-based storage, OAuth2, health checks, access control, and environment scoping — it needs credential requests and dynamic connections added.
- Credential requests (Enterprise/Partner) enable secure cross-team credential collection without exposing secrets.
- Dynamic connections (Enterprise) allow per-run connection switching via scenario inputs, useful for multi-tenant scenarios.
- The planning workspace now comprehensively covers all major Make-equivalent product domains. Remaining gaps are n8n-influenced patterns, testing/QA, notifications, and billing.

## Best next steps

1. Begin parallel n8n research workspace — n8n agent patterns, sub-workflow design, expression language, node ecosystem.
2. Keep absorbing Make Academy materials into `plan-introductionToMakeUi.prompt.md`.
3. Create a testing and quality assurance specification (unit tests, integration tests, end-to-end tests, test data management).
4. Create a notification and alerting specification (email, in-app, webhook notifications for workflow events).
5. Create a billing and plan management specification (plan tiers, credit management, usage tracking, billing integration).
6. Resolve the open planning decisions — now 25 total (19 from file 37 + 6 new from files 47–48).
   - New decisions: #20 (route_barrier join node), #21 (Enterprise timeout limit), #22 (custom workflow properties plan gate), #23 (notes in blueprint exports), #24 (author avatar system), #25 (affiliate model equivalent)
7. Consider delivering the Automation Map spec (file 47) as a next implementation priority — it fills a significant product surface gap.
8. Extend existing files per file 48 cross-references: file 33 (if-else node), file 44 (warning taxonomy), file 45 (data types + coercion), file 38 (custom properties), file 40 (sharing route, org properties page), file 43 (recovery UX).
9. Later merge Make-inspired and n8n-inspired plans into the final FlowHolt ultimate plan.

### Make corpus coverage status
**The Make corpus research phase is now comprehensively complete** as of April 13, 2026. All design-impacting sections of the `help.make.com` corpus and the full Make PDF have been absorbed into planning files 01–48. Remaining unabsorbed content is intentionally deferred (step-by-step tutorials, per-app module references, release notes, basic mapping UX reference).


## How to continue safely

- Read the files listed in `98-NEXT-SESSION-PROMPT.md` first.
- Do not overwrite the planning direction with a fresh shallow summary.
- Extend the existing files or add new numbered planning files in the same folder.
- Keep using the Make corpus as a searchable research base rather than trying to stuff it all into one prompt.
