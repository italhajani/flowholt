# Make To FlowHolt Gap Matrix

This file translates Make-backed maturity patterns into explicit FlowHolt planning direction using current repo evidence and Make help-center corpus.

Last updated: current session — expanded with concrete sub-gaps, Make reference citations, FlowHolt code evidence, planning-file cross-references, and **Make editor UI crawl** (2026-04-14) evidence from `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md`.

> **Note:** This file is now superseded by `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` for new gap analysis (which covers both Make and n8n). This file remains as the authoritative Make-specific gap detail.

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | Sections informed |
|--------|----------|-----------------|
| Make help center (all articles) | `research/make-help-center-export/pages_markdown/` | All sections |
| Make full PDF | `research/make-pdf-full.txt` | Org model, settings, billing, execution |
| Make UI crawl | `research/make-advanced/` | §2 Nav maturity, §4 Studio UX |
| Make crawl network logs | `research/make-advanced/*/network-log*.json` | §8 API maturity |

### Key Make corpus articles per section

| Section | Raw source |
|---------|-----------|
| §1 Control plane | `research/make-help-center-export/pages_markdown/organizations.md`, `teams.md` |
| §2 Navigation | `research/make-advanced/00-baseline/dom-snapshot.html` (11-item nav rail) |
| §3 Settings maturity | `research/make-help-center-export/pages_markdown/scenario-settings.md`, `organization-settings.md` |
| §4 Studio UX | `research/make-advanced/` (all interaction screenshots) |
| §5 Execution and replay | `research/make-help-center-export/pages_markdown/scenario-run-replay.md`, `scenario-history.md` |
| §6 Error handling | `research/make-help-center-export/pages_markdown/overview-of-error-handling.md` |
| §7 Credits/billing | `research/make-help-center-export/pages_markdown/credits-and-operations.md` |
| §8 API patterns | `research/make-advanced/*/network-log*.json` |

### This file feeds into (superseded by 52, but still feeds)

| File | What it informs |
|------|----------------|
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Original Make-only gap analysis basis |
| `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` | §1 Control plane gaps |
| `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` | §6 Error handling gaps |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | §7 Credits/billing gaps |

---

### Make maturity signal
- Organizations and teams are explicit top-level control-plane objects
- Billing, region, roles, and consumption are tied to tenancy
- Teams share connections, scenarios, AI agents, and context files (Make corpus: `manage-ai-agents.md` — "AI agents are shared across all team members, like connections")
- Workspaces have explicit plan-level limits for files, operations, and storage

### Current FlowHolt evidence
- `backend/app/models.py` — `WorkspaceRole = Literal["owner", "admin", "builder", "viewer"]`
- `WorkspaceSummary` includes `id`, `name`, `slug`, `plan`, `role`, `members_count`
- No organization or team model exists in the data layer
- `WorkspaceSettingsResponse` centralizes all governance controls at workspace scope

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Organization entity | Yes (billing, SSO, domain claim) | No | High |
| Team entity | Yes (owns assets, shares agents) | No | High |
| Multi-workspace per org | Yes | Single workspace assumed | Medium |
| Plan-level quotas | Yes (operations, storage, files) | Basic `max_concurrent_executions` only | Medium |
| Region selection | Yes | No | Low (defer) |

### Planning direction
- Define Organization → Team → Workspace hierarchy in a dedicated control-plane file
- Workspace role model is a solid foundation; extend with org-level roles (org_admin, org_viewer) and team-level roles
- Quota enforcement should be computed at workspace level but configured at org/plan level
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 3

---

## 2. Primary navigation maturity

### Make maturity signal
- Left sidebar: Scenarios, AI Agents, Connections, Webhooks, Keys & Certificates, Data Stores, Data Structures, Devices, Templates, custom properties
- Org and team management in a separate settings/admin area
- Scenario tabs: Diagram, History, Incomplete executions (Make corpus: `manage-incomplete-executions.md`)

**Make crawl confirmation** (live editor, 2026-04-14):
- Left nav rail (80px, full height) has exactly 11 first-level items: Organization, Scenarios, AI Agents (Beta), Credentials, Webhooks, MCP Toolboxes, Templates, Data stores, Devices, Data structures, Custom Apps
- AI Agents has a "Beta" pill (`first-level-navigation-agents-pill`)
- MCP Toolboxes is a first-level nav item, not buried in settings
- Data structures internal ID is "udts" (Universal Data Types)

### Current FlowHolt evidence
- `src/components/dashboard/DashboardSidebar.tsx` — includes Overview, Chat, AI Agents, Workflows, Templates, Executions, Vault, Environments, Webhooks, API, System, Audit, Settings, Help
- `src/App.tsx` — routes defined for all sidebar entries

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Runtime operations section | Implicit (History, Incomplete executions tabs) | No dedicated runtime route | High — now addressed by file 35 |
| Team-scoped navigation | Team switcher in sidebar | No team concept | High |
| Scenario-level tabs (Diagram/History/Incomplete) | Yes, per-scenario | Workflow detail page only | Medium |
| Custom properties for filtering | Yes | No | Low |
| Data stores and data structures as nav items | Yes (first-level nav, confirmed by crawl) | Not planned yet | Medium |
| MCP Toolboxes as nav item | Yes (first-level nav, confirmed by crawl) | No MCP concept | Medium |

### Planning direction
- Add `/dashboard/runtime` as a new top-level section (defined in `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` and `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md`)
- Add per-workflow tabs in Studio or workflow detail: Diagram, History, Incomplete/Failures
- Defer data stores and data structures to shared assets planning phase
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 2

---

## 3. Studio maturity

### Make maturity signal
- Module settings: standard fields, advanced fields toggle, required fields in bold, data types on hover (Make corpus: `module-settings.md`)
- Mapping: Map toggle per field, expression references from upstream modules
- Replay: "Run with existing data" dropdown next to Run once button (Make corpus: `scenario-run-replay.md`, Make UI image showing bottom bar with replay dropdown)
- Scenario settings: accessible via gear icon in builder toolbar (Make corpus: `scenario-settings.md`)
- Module notes: text annotations on modules and routes

**Make crawl confirmation** (live editor, 2026-04-14):
- Bottom toolbar has exactly 11 buttons: Run once, Run with existing data, Scheduling, Explain flow (AI), Save, Auto-align, History, Notes, Scenario I/O, Scenario settings, Add to favorites
- **Explain flow (AI)** (`btn-inspector-explain-flow`, sparkles icon) is a first-class toolbar action — new discovery
- Scenario header has inline-editable title (`input#editable-scenario-title`), go-back button, rich dropdown menu (26 items)
- Floating AI copilot button (`<ai-copilot-button>`) at bottom-right, separate from toolbar
- Right sidebar slides in for module config (`<imt-sidebar-animate>`, `_slideIn_pfsi9_1`)

### Current FlowHolt evidence
- `src/components/studio/NodeConfigPanel.tsx` — sections, expression builder, validation, preview, pinned data
- `src/components/studio/WorkflowSettingsModal.tsx` — workflow settings in modal
- `backend/app/node_registry.py` — field definitions with `show_when` conditional visibility
- `NodeEditorField` has `required`, `help`, `group`, `show_when`, `bindable`, `binding_kinds`

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Advanced settings toggle | Yes (per module) | Fields organized by sections, no explicit advanced toggle | Medium |
| Field data type indicators on hover | Yes | Field type used for rendering, not surfaced to user | Low |
| Replay from builder toolbar | Yes ("Run with existing data") | Replay exists at execution level, not from builder toolbar | Medium |
| Module notes/annotations | Yes (confirmed: `btn-inspector-notes`) | No per-node notes | Low |
| Scenario inputs/outputs definition | Yes (confirmed: `btn-inspector-scenario-io`) | No formal workflow inputs/outputs model | Medium |
| Subscenarios | Yes (scenario chains) | No subscenario concept | Medium |
| AI explain flow in toolbar | Yes (`btn-inspector-explain-flow`, sparkles) | No equivalent | Medium (new) |
| Floating AI copilot assistant | Yes (`<ai-copilot-button>`) | Chat panel exists, not floating | Low |
| Auto-align nodes | Yes (`btn-inspector-autoalign`) | No | Low |
| Add to favorites | Yes (`inspector-add-favorites`) | No | Low |

### Planning direction
- Tab model is now fully specified in `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` and `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md`
- Add "Run with existing data" replay entry point to Studio toolbar in Studio specification
- Define workflow inputs/outputs model (needed for agent tools and subscenario-like patterns)
- Advanced settings could map to the `node_settings` sections already in `NodeEditorResponse`
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 4

---

## 4. Runtime and replay maturity

### Make maturity signal
- Incomplete executions: dedicated tab per scenario, statuses (Unresolved, Pending, In Progress, Resolved), bulk retry, bulk delete (Make corpus: `manage-incomplete-executions.md`)
- Sequential processing: blocks new executions until incompletes resolve (Make corpus: `scenario-settings.md`)
- Data is confidential: prevents execution data storage for inspection (Make corpus: `scenario-settings.md`)
- Auto commit: per-module transactional behavior (Make corpus: `scenario-settings.md`)
- Commit trigger last: controls commit ordering (Make corpus: `scenario-settings.md`)
- Max cycles: limits polling trigger iterations per execution (Make corpus: `scenario-settings.md`)
- Consecutive error threshold: auto-deactivates scenario after N failures (Make corpus: `scenario-settings.md`)
- Replay: from builder, history, and run details; stores trigger data and scenario inputs (Make corpus: `scenario-run-replay.md`)
- Automatic retry of incomplete executions with configurable backoff (Make corpus: `automatic-retry-of-incomplete-executions.md`)

### Current FlowHolt evidence
- `WorkflowSettings` includes: `execution_order`, `error_workflow_id`, `caller_policy`, `timezone`, `save_failed_executions`, `save_successful_executions`, `save_manual_executions`, `save_execution_progress`, `timeout_seconds`
- `WorkspaceSettingsResponse` includes: `redact_execution_payloads`, `max_concurrent_executions`, `execution_data_retention_days`
- `ExecutionReplayRequest/Response` exist with `mode`, `queued`, `payload_override`
- `ExecutionPauseSummary` and `HumanTaskSummary` exist
- `WorkflowJobSummary` exists with `attempts`, `max_attempts`, `available_at`

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Incomplete executions tab | Yes (dedicated per-scenario) | No dedicated view; failures shown in execution list | High — addressed by file 35 |
| Sequential processing | Yes (blocks execution on incompletes) | Not implemented | High |
| Data confidentiality mode | Yes | `redact_execution_payloads` exists but not enforced end-to-end | Medium |
| Auto commit / transactional phases | Yes | No transactional execution model | Low (complex) |
| Max cycles for polling triggers | Yes | Not applicable (different trigger model) | Low |
| Consecutive error threshold | Yes (auto-deactivates scenario) | No automatic deactivation | Medium |
| Automatic retry with backoff | Yes | Job retry exists but no configurable backoff | Medium |
| Dead-letter management | Implicit (incomplete executions) | No explicit dead-letter model — addressed by file 35 | High |
| Alert system | Implicit (email notifications on failure) | `notify_on_failure` setting exists; no structured alerts | Medium — addressed by file 35 |

### Planning direction
- Runtime route family now fully specified in `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` and `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md`
- Add sequential processing mode to `WorkflowSettings`
- Add consecutive error threshold and auto-deactivation to workflow settings
- Implement dead-letter model as specified in file 35
- Confidentiality policy enforcement needs end-to-end tracing from file 33 through file 34
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 8

---

## 5. Shared asset governance

### Make maturity signal
- Connections: shared across team, replaceable across modules, OAuth and API key types, credential requests for third parties, dynamic connections, on-premise agent, device connections (Make corpus: `connections.md`)
- Webhooks: dedicated management surface
- Keys and certificates: explicit asset type
- Data stores: persistent data tables within Make
- Data structures: reusable schema definitions
- Custom functions: reusable formulas
- Variables: incremental and global scenario variables

### Current FlowHolt evidence
- `VaultAssetKind = Literal["connection", "credential", "variable"]`
- `VaultScope = Literal["workspace", "staging", "production"]`
- `VaultVisibility = Literal["workspace", "private", "restricted"]`
- `VaultAssetAccessResponse` with `allowed_roles`, `allowed_user_ids`, `can_edit`, `can_test`
- Integration catalog exists with `IntegrationAppSummary`, `IntegrationOperationDetail`

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Connection replacement across modules | Yes | No batch connection replacement | Low |
| Credential requests (third-party collection) | Yes | No | Low |
| Dynamic connections (variable-driven) | Yes | No | Medium |
| On-premise agent | Yes | No | Low (defer) |
| Data stores (persistent tables) | Yes | No | Medium |
| Data structures (reusable schemas) | Yes | No | Medium |
| Custom functions | Yes | No | Low |
| Keys and certificates | Yes | Merged into credentials | OK |
| Asset usage tracking (which workflows use this) | Yes (`workflows_count`) | `workflows_count` exists on connection model | OK |
| Environment-scoped asset promotion | Partial | `VaultScope` with staging/production exists | OK |

### Planning direction
- Vault is solid for connections, credentials, and variables
- Add data stores and data structures as new vault asset kinds in a future phase
- Dynamic connections should be implemented as expression-resolved credential references
- Asset capability objects now defined in `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md`
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 6

---

## 6. AI agent system maturity

### Make maturity signal
- Agent inventory: list, create, duplicate, delete, configure in dedicated sidebar tab (Make corpus: `manage-ai-agents.md`)
- Agent configuration: System prompt, Context (RAG vector DB with file limits), MCP server connections, Tools (module tools, scenarios, MCP tools) (Make corpus: `ai-agents-configuration.md`)
- Agent settings: model selection, max tokens, max steps, max history per provider (Make corpus: `manage-ai-agents.md`)
- Three tool types: module tools (auto-scaffolded scenarios), manual scenarios, MCP servers (Make corpus: `tools-for-ai-agents.md`)
- Testing & Training: in-app chat interface showing tool usage and I/O (Make corpus: `ai-agents-configuration.md`)
- Agent sharing: shared across team members
- Provider lock: cannot change AI provider after creation (Make corpus: `manage-ai-agents.md`)
- New AI Agents app: evolved version with context modules and enhanced capabilities

**Make crawl confirmation** (live editor, 2026-04-14):
- AI Agents is a first-level nav item (test ID: `first-level-navigation-main-agents`) with "Beta" pill
- Agent API: `GET /api/v2/ai-agents/v1/agents` (separate v1 sub-versioned API surface)
- Scenario-agent link: `GET /api/v2/scenarios/ai-agents`
- AI module packages discovered:
  - `ai-tools`: Ask, AnalyzeSentiment, Categorize, CountAndChunkText, DetectLanguage, Extract, Standardize, Summarize, Translate
  - `ai-local-agent`: RunLocalAIAgent (agent-as-node pattern confirmed)
  - `make-ai-extractors`: captionAnImage, describeAnImage, extractADocument, extractAnInvoice, extractAReceipt, extractTextFromAnImage
  - `make-ai-web-search`: generateAResponse
- 3 AI entry points in editor: copilot button, explain flow toolbar action, AI agent nodes

### Current FlowHolt evidence
- `ai_agent` node type with cluster children: `ai_chat_model`, `ai_memory`, `ai_tool`, `ai_output_parser`
- `CLUSTER_ATTACHMENT_SLOTS` in `NodeConfigPanel.tsx` defines slot types
- AI Agents route exists as top-level dashboard page
- `agent-inventory.ts` exists in `src/lib/`
- `AssistantCapabilitiesResponse` shows AI assistant capabilities (separate from agent system)
- LLM provider system with configurable providers

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Agent as first-class managed entity | Yes (CRUD, duplicate, configure) | Agent node in Studio; no standalone agent entity | High |
| Context / RAG knowledge base | Yes (file upload → vector DB, per-agent and per-team limits) | No knowledge/RAG system | High |
| MCP server integration | Yes (connect, toggle tools) | No MCP client | Medium |
| Module tools (auto-scaffolded) | Yes | No equivalent | Medium |
| Scenario as tool | Yes (with inputs/outputs) | Workflow reference possible but not formalized as tool | Medium |
| Testing & Training chat | Yes (in-agent configuration) | Studio Test tab exists but no dedicated agent testing surface | Medium |
| Agent duplication | Yes | No | Low |
| Per-agent file limits by plan | Yes | No plan-level limits | Low |
| Prompt improvement feature | Yes ("Improve" button) | No | Low |

### Planning direction
- Design agent as both a managed entity (inventory, CRUD) AND a Studio node type (execution graph)
- Knowledge/RAG system needed as a distinct asset kind (files → chunks → vectors)
- MCP client should be planned for Phase 2+
- Agent inspector grouping specified in `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` section 5 (Prompt & Instructions, Model & Provider, Tools & Capabilities, Memory, Cluster)
- AI trace three-tier rendering specified in file 33 section 9
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 5

---

## 7. Settings architecture

### Make maturity signal
- Profile settings: personal info, timezone, language, notifications
- Organization settings: billing, plan, SSO, domain claim
- Team settings: members, roles, consumption tracking
- Scenario settings: sequential processing, data confidential, incomplete executions, auto commit, commit trigger last, max cycles, consecutive errors (Make corpus: `scenario-settings.md`)
- Connection settings: per-module connection binding, advanced auth parameters (Make corpus: `module-settings.md`)
- Agent settings: model, max tokens, max steps, max history (Make corpus: `manage-ai-agents.md`)

### Current FlowHolt evidence
- `WorkspaceSettingsResponse` — 30+ settings fields covering security, execution, notifications, deployment
- `WorkflowSettings` — execution order, timeout, save policies, caller policy
- `ApiWorkspaceSettings` — frontend mirrors backend settings
- Settings page exists at `/dashboard/settings`

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| User profile settings | Yes | No dedicated user settings | Medium |
| Organization settings | Yes | No org entity | High (tied to control plane) |
| Team settings | Yes | No team entity | High (tied to control plane) |
| Scenario-level settings depth | 8+ explicit settings | 8 settings in WorkflowSettings; missing sequential processing, max cycles, consecutive errors | Medium |
| Agent-level model configuration | Yes (max tokens, max steps, max history) | AI node has model params but no standalone agent settings | Medium |
| Notification preferences (granular) | Yes | Basic `notify_on_*` flags exist | Low |

### Planning direction
- Create a settings catalog spec covering every settings group
- Add user profile settings (timezone, notification preferences, display name)
- Workflow settings should expand to match Make's scenario settings depth
- Agent settings should be accessible both from agent inventory and Studio inspector
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 7

---

## 8. Permissions and governance

### Make maturity signal
- Organization roles: owner, admin, member
- Team roles: admin, member (implicit)
- Scenario-level: no per-scenario roles, but team ownership governs access
- Connection sharing: team-scoped by default
- Agent sharing: team-scoped by default
- SSO, SAML, domain claim for enterprise governance

### Current FlowHolt evidence
- `WorkspaceRole = Literal["owner", "admin", "builder", "viewer"]` — four-role model
- `WorkspaceSettingsResponse` has `staging_min_role`, `publish_min_role`, `run_min_role`, `production_asset_min_role`, `deployment_approval_min_role`
- `VaultAssetAccessResponse` with `visibility`, `allowed_roles`, `allowed_user_ids`
- `WorkflowPolicyResponse` with `can_run`, `can_promote_to_staging`, `can_publish`
- Deployment review system exists with approval/rejection flow

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Organization-level roles | Yes | No org entity | High |
| Team-level roles | Yes | No team entity | High |
| Capability-based permissions (vs flat booleans) | Implicit | Flat booleans — now addressed by file 34 | High |
| Per-workflow access control | No (team-scoped) | Workspace-scoped; all members see all workflows | Medium |
| Deployment approval workflow | No (Make doesn't have staging/production) | Yes — FlowHolt ahead here | FlowHolt advantage |
| SSO/SAML | Enterprise plan | No | Low (defer) |
| Environment separation | No | Yes (draft/staging/production) | FlowHolt advantage |

### Planning direction
- Capability object system now fully defined in `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md`
- Four-role model is stronger than Make's implicit team model for workflow governance
- Environment separation is a significant FlowHolt advantage over Make
- Deployment approval system is also a FlowHolt advantage
- Extend to per-workflow RBAC in future (team-scoped ownership)
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 9

---

## 9. Observability and analytics

### Make maturity signal
- Scenario execution history with status filters
- Run details with per-module input/output inspection
- Team-level operations management (Make corpus: `enhanced-notes-and-team-level-operations-management.md`)
- Analytics dashboard with consumption tracking
- Audit logs for administrative actions
- DevTool for debugging (Make corpus: `make-devtool.md`)

### Current FlowHolt evidence
- `WorkflowObservabilityResponse` — total runs, success/fail counts, success rate, average duration, active jobs, recent executions
- Execution detail with step-by-step results, events, artifacts
- Execution stream (SSE) for live monitoring
- Audit events with `action`, `target_type`, `status`, `details`
- System status page with comprehensive health checks
- `WorkflowStepHistoryResponse` — per-step execution history

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Team-level consumption analytics | Yes | No team entity; workspace-level only | High (tied to control plane) |
| Operation counting by plan | Yes | No operation-based billing model | Low |
| DevTool for module debugging | Yes | Execution step inspector exists | OK |
| Execution timeline visualization | Yes (visual bubble flow) | Step list only, no timeline | Medium |
| Custom dashboards / widgets | No | No | N/A |
| Export execution history | Partial | Export workflow (definition), not execution history | Low |

### Planning direction
- Observability foundation is solid with step-level inspection, artifacts, and events
- Add execution timeline visualization to execution detail page
- Team-level analytics depends on control-plane expansion
- Per-step history (`WorkflowStepHistoryResponse`) is a strength not present in Make
- Runtime operations dashboard (file 35) adds the missing operational views
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 8

---

## 10. Backend alignment

### Make maturity signal
- Implied strong service boundaries: identity, scenarios, connections, executions, analytics, AI agents, webhooks, data stores
- API reference exists at developers.make.com with explicit endpoint families
- Scheduler, queueing, and worker infrastructure implied by runtime behavior

### Current FlowHolt evidence
- Single `main.py` with 169+ route handlers (monolith)
- Distinct functional modules: auth, executor, scheduler, webhooks, sandbox, assistant tools, studio runtime
- `backend/app/storage.py` and database helpers
- Plugin loading system for integrations
- Job queue with `WorkflowJobSummary`, `JobProcessResponse`

### Sub-gaps
| Sub-gap | Make has | FlowHolt has | Severity |
|---|---|---|---|
| Service decomposition | Implied | Monolith (`main.py`) | Medium (acceptable for current scale) |
| API versioning | Yes (v2 referenced) | No versioning | Medium |
| Rate limiting per plan | Yes | `max_concurrent_executions` only | Medium |
| Plugin/app ecosystem | 1000+ apps | Integration catalog with plugin loading | OK (extensible) |
| Webhook signature verification | Yes | Yes — FlowHolt has this | OK |
| Execution worker scaling | Yes (cloud-scale) | Single worker mode | Low (acceptable for self-hosted) |

### Planning direction
- Monolith is acceptable for current stage; plan for domain-organized modules (not microservices) as first step
- Add API versioning header (`X-FlowHolt-API-Version`) for future compatibility
- Rate limiting should be plan-aware when org/billing model exists
- Cross-reference: `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` section 10

---

## 11. FlowHolt advantages over Make

Not all gaps are deficits. FlowHolt already exceeds Make in several areas:

| Area | FlowHolt advantage | Make equivalent |
|---|---|---|
| **Environment separation** | Draft → staging → production with versioning and rollback | No environment concept; scenarios are either active or inactive |
| **Deployment approval** | Formal review workflow with request/approve/reject | No deployment review |
| **Workflow versioning** | Explicit version snapshots, comparison, and rollback | Auto-save with restore; no formal versioning |
| **AI agent orchestration** | Cluster model with typed child nodes (model, memory, tool, parser) | Agent as opaque configuration with tools list |
| **Vault asset governance** | Scoped visibility (workspace/private/restricted), role-based access, environment-scoped credentials | Connection sharing at team level only |
| **Execution artifacts** | Typed artifacts (input, output, state, error, summary, pause) with retention | Execution data stored but not typed |
| **Human tasks** | First-class pause type with assignment, priority, choices, due date | No human-in-the-loop concept |
| **Capability system** | Structured reason-bearing capability states (file 34) | Implicit permission checks |

These advantages should be preserved and deepened, not flattened to match Make's model.

---

## 12. Gap severity summary

| Domain | Critical gaps | Medium gaps | FlowHolt advantages |
|---|---|---|---|
| 1. Control plane | Org, team entities | Multi-workspace, quotas | — |
| 2. Navigation | Runtime section | Per-workflow tabs, data stores | Breadth of sidebar |
| 3. Studio | — | Replay from toolbar, inputs/outputs | Tab role-state model, expression builder |
| 4. Runtime | Dead-letter, sequential processing | Auto-deactivation, backoff | Pause/human-task system |
| 5. Shared assets | — | Data stores, dynamic connections | Environment-scoped vault |
| 6. AI agents | Managed entity, RAG/knowledge | MCP, module tools | Cluster model, typed children |
| 7. Settings | Org/team settings | Workflow settings depth | Workspace governance depth |
| 8. Permissions | Org/team roles | Per-workflow RBAC | Capability objects, deployment approval |
| 9. Observability | Team analytics | Timeline visualization | Per-step history, artifacts |
| 10. Backend | — | API versioning, rate limits | Plugin system, execution streaming |

---

## Strategic conclusion

FlowHolt is not immature because it lacks ambition. It is immature because many promising surfaces are not yet unified by a mature control plane, scoped settings model, governance system, and fully specified Studio contract.

The planning workspace has now made significant progress:
- **Studio inspector** is specified at node-family granularity (files 30, 33)
- **Capability system** is defined with exact payloads and denial contracts (files 28, 31, 34)
- **Runtime operations** are planned as a first-class route family with API contracts (files 32, 35)
- **Gap analysis** is now grounded in 50+ Make corpus pages and current codebase evidence

The Make editor UI crawl (2026-04-14) has now added a third evidence layer — live API interception and DOM analysis — on top of the help-center corpus and codebase evidence. Key crawl-informed additions:
- **Feature flags** are first-class (`/api/server/features`, 32 calls/session) — FlowHolt must implement from Phase 1
- **11 bottom toolbar buttons** confirm the persistent run-bar pattern exactly
- **3 AI entry points** (copilot, explain flow, agent nodes) confirm AI needs multiple surfaces
- **4 AI module packages** reveal Make's full AI taxonomy including vision/document extraction
- **Enum centralization** pattern (`/api/v2/enums/*`) is clean and should be adopted
- **Active org/team context** maintained server-side — validates session-scoped workspace context

The previously identified critical gaps have been addressed in planning:
1. Control-plane expansion → `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` (now with Make API evidence)
2. AI agent managed entity → `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` (now with module package mapping)
3. Settings catalog → `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` (now with feature flags and enum evidence)
4. Backend domain organization → `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` + `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` (now with Make API surface mapping)

Remaining gaps for next planning pass:
1. Implement feature flag service (no current FlowHolt equivalent)
2. Plan MCP Toolbox hosting (Make has first-level nav for this)
3. Plan vision/document AI nodes (Phase 2, from `make-ai-extractors` evidence)
4. Plan web-augmented AI generation (Phase 2, from `make-ai-web-search` evidence)
5. Plan "Explain flow" AI toolbar action (new, from crawl)

---

## n8n cross-reference — additional gaps and patterns (from `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`)

### New gaps discovered from n8n source analysis

| Gap | n8n has | Make has | FlowHolt status | Priority |
|---|---|---|---|---|
| Per-workflow tab bar (Workflow/Executions/Settings/Evaluation) | ✅ 4 tabs | ❌ | 🔴 New — adopt | High |
| NDV dual-panel inspector (input/output side-by-side) | ✅ | ❌ | 🔴 New — adopt | High |
| Pin data (freeze node output for testing) | ✅ `pinData` on workflow | ❌ | 🟡 Partial (`testData`) | High |
| Partial execution (run only changed nodes) | ✅ | ❌ | 🔴 New — plan | High |
| Agent builder SDK (fluent builder API) | ✅ `@n8n/agents` | ❌ | 🔴 New — adopt pattern | High |
| Chat Hub (multi-agent chat) | ✅ 47KB store | ❌ | 🔴 New — plan | Medium |
| AI evaluation system (test runs, metrics) | ✅ TestRun/TestCaseExecution | ❌ | 🔴 New — plan | Medium |
| AI workflow builder (NL → workflow) | ✅ EE feature | ❌ | 🔴 New — plan | Medium |
| CRDT collaboration layer (Yjs) | ✅ `@n8n/crdt` (write-lock currently) | ❌ | 🟡 Planned | Medium |
| Resource:operation scope system | ✅ 64 resources | ❌ | 🔴 New — adopt pattern | High |
| Custom roles (admin-configurable) | ✅ EE | ❌ | 🔴 New — enterprise | Low |
| Data tables (spreadsheet storage) | ✅ `data-table` module | ✅ Data stores | 🟡 Planned as data stores | Medium |
| Source control (Git integration) | ✅ EE | ❌ | 🟡 Planned Phase 2 | Medium |
| External secrets (Vault integration) | ✅ EE | ❌ | 🟡 Planned Phase 2 | Medium |
| MCP server (expose workflows as tools) | ✅ Full module | ✅ MCP Toolboxes | 🟡 Planned | Medium |
| Insights analytics dashboard | ✅ Module | ❌ | 🔴 New — plan | Low |
| Sticky notes on canvas | ✅ `N8nResizeableSticky` | ❌ | 🔴 New — plan | Low |
| Binary data viewer modal | ✅ | ❌ | 🔴 New — plan | Low |
| Extract sub-workflow refactoring | ✅ `workflowExtractionName` modal | ❌ | 🔴 New — plan | Low |
| Import cURL to HTTP node | ✅ `importCurl` modal | ❌ | 🔴 New — plan | Low |
| Computer use (browser automation for AI) | ✅ `@n8n/computer-use` | ❌ | 🔴 New — Phase 3+ | Low |
| Command bar (Cmd+K) | ✅ `N8nCommandBar` | ❌ | ✅ Already exists | — |
| Resizable sidebar (200–500px) | ✅ | ❌ | 🔴 New — adopt | Low |
| Task runner (sandboxed execution) | ✅ `@n8n/task-runner` | ❌ | 🔴 New — plan | Medium |
| Push ref (per-tab targeted real-time) | ✅ | ❌ | 🔴 New — adopt | Medium |
| Frontend settings single endpoint | ✅ `GET /settings` returns all config | ❌ | 🔴 New — adopt | High |
| Shared API types package | ✅ `@n8n/api-types` | ❌ | 🔴 New — plan `@flowholt/api-types` | High |

### n8n patterns that validate existing FlowHolt plans

| FlowHolt plan | n8n validation |
|---|---|
| Monorepo with separated packages | ✅ n8n has 42 packages — validates the approach |
| Separate design system package | ✅ n8n has 100+ components in `@n8n/design-system` |
| Permission system with scopes | ✅ n8n uses `resource:operation` — validates scope-based model |
| Pinia-style stores for state | ✅ n8n has 30+ Pinia stores — validates store-per-domain |
| Feature flag system | ✅ n8n uses PostHog — validates Phase 1 priority |
| Real-time push (WebSocket) | ✅ n8n supports SSE + WebSocket — validates dual approach |
| AI assistant floating panel | ✅ n8n has `AskAssistant*` components — validates pattern |
| Workflow versioning | ✅ n8n has `activeVersionId` + `WorkflowHistory` — validates approach |

### Updated gap priority ranking (combining Make + n8n evidence)

**Critical (Phase 1)**:
1. Per-workflow tabs (from n8n) — changes header architecture
2. Resource:operation scope system (from n8n) — changes permission model
3. Frontend settings endpoint (from n8n) — improves app init performance
4. Shared API types package (from n8n) — eliminates type drift
5. Pin data for testing (from n8n) — critical builder UX

**High (Phase 1–2)**:
6. NDV dual-panel inspector (from n8n) — enhances node inspector
7. Partial execution (from n8n) — productivity feature
8. Agent builder SDK (from n8n) — AI foundation
9. Push ref system (from n8n) — targeted real-time
10. Task runner sandbox (from n8n) — security

**Medium (Phase 2–3)**:
11. Chat Hub (from n8n) — AI chat
12. AI evaluation system (from n8n) — AI quality
13. AI workflow builder (from n8n) — AI productivity
14. CRDT collaboration (from n8n, improve upon) — multi-user
15. Data tables (from n8n + Make) — data storage
16. Source control + External secrets (from n8n) — enterprise
17. MCP server (from n8n + Make) — tool ecosystem

### Cross-reference file map

| Finding area | Updated plan file | Section added |
|---|---|---|
| Studio layout, tabs, sidebar | `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | "n8n cross-reference" |
| NDV inspector, modals | `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` | "n8n NDV cross-reference" |
| RBAC scope system | `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md` | "n8n RBAC cross-reference" |
| Backend services, modules, entities | `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` | "n8n backend cross-reference" |
| AI agents, chat hub, evaluation | `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` | "n8n AI system cross-reference" |
| Full reference | `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` | Complete 13-section analysis |
