# FlowHolt Backend Entity And Event Model Draft

This file deepens the backend service map into clearer entities, lifecycle states, event flows, and storage boundaries.

It is grounded in:
- Make maturity patterns around scenarios, teams, executions, replay, approvals, and assets
- current FlowHolt backend models, which already include workflow versions, deployment reviews, replay modes, vault access, trigger exposure, chat triggers, human tasks, and execution inspection
- current backend module structure in `backend/app`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | Entity families informed |
|--------|----------|------------------------|
| Make org model | `research/make-help-center-export/pages_markdown/organizations.md` | §1 Identity and membership |
| Make scenarios | `research/make-help-center-export/pages_markdown/scenarios.md` | §2 Workflow authoring, §4 Runtime execution |
| Make execution flow | `research/make-help-center-export/pages_markdown/scenario-execution-flow.md` | §4 Runtime execution lifecycle |
| Make incomplete executions | `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` | §4 ExecutionPause, RetryRecord |
| Make credentials | `research/make-help-center-export/pages_markdown/connections.md` | §5 Assets and secrets |
| Make data stores | `research/make-help-center-export/pages_markdown/data-stores.md` | §5 DataStore entity |
| Make data structures | `research/make-help-center-export/pages_markdown/data-structures.md` | §5 DataStructure entity |
| Make audit logs | `research/make-help-center-export/pages_markdown/audit-logs.md` | §Governance events |
| Make approvals | `research/make-pdf-full.txt` §Approval | §7 Release and environment |
| Make AI agents | `research/make-help-center-export/pages_markdown/ai-agents.md` | §6 AI and agent objects |
| Make knowledge | `research/make-help-center-export/pages_markdown/knowledge-bases.md` | §6 AgentKnowledgeBinding |
| n8n database entities | `n8n-master/packages/cli/src/databases/entities/` | §1-§8 all entity families |
| n8n workflow entity | `n8n-master/packages/cli/src/databases/entities/Workflow.ts` | §2 Workflow authoring |
| n8n execution entity | `n8n-master/packages/cli/src/databases/entities/WorkflowExecution.ts` | §4 Runtime execution |
| n8n credential entity | `n8n-master/packages/cli/src/databases/entities/Credentials.ts` | §5 Assets and secrets |
| n8n user/member entities | `n8n-master/packages/cli/src/databases/entities/User.ts`, `Project.ts`, `ProjectRelation.ts` | §1 Identity and membership |
| n8n event bus | `n8n-master/packages/core/src/eventbus/` | §Key event families |
| n8n audit log | `n8n-master/packages/cli/src/audit/` | §Governance events |
| n8n execution annotation | `n8n-master/packages/cli/src/databases/entities/AnnotationTag.ts` | §4 ExecutionArtifact (EE feature) |
| n8n insights module | `n8n-master/packages/cli/src/modules/insights/` | §Analytics projections |
| FlowHolt current backend | `backend/app/` | §Current FlowHolt alignment |

### This file feeds into

| File | Entity families used |
|------|---------------------|
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | All entity families → module ownership |
| `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` | Service boundaries and API groupings |
| `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md` | RoleBinding, WorkspaceMembership, TeamMembership |
| `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` | Role enforcement per entity |
| `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` | WorkflowJob, Execution lifecycle |
| `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` | WorkflowJob, ExecutionStep |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Analytics projections storage model |
| `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` | §6 AI and agent objects |
| `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` | §7 Release and environment entities |
| `16-FLOWHOLT-CONFIDENTIAL-DATA-GOVERNANCE-DRAFT.md` | §5 Assets and secrets, SecretEnvelope |

### n8n entity comparison

| FlowHolt entity | n8n equivalent | Key difference |
|----------------|---------------|---------------|
| `Workflow` | `WorkflowEntity` | FlowHolt separates Draft/Version more explicitly |
| `WorkflowJob` | `ExecutionEntity` (queued state) | n8n uses Redis queue; FlowHolt uses Postgres queue |
| `Execution` | `WorkflowExecution` | n8n combines job+execution; FlowHolt separates them |
| `ExecutionStep` | `WorkflowExecutionData.data.resultData.runData[nodeName]` | n8n stores step data inside execution JSON blob; FlowHolt should normalize |
| `ExecutionPause` | n8n Wait node state | n8n resumes via webhook URL; FlowHolt adds timeout lifecycle |
| `HumanTask` | n8n `AnnotationTag` (EE) | n8n's annotation is for review only; FlowHolt's HumanTask blocks execution |
| `Agent` | n8n AI Agent node | n8n = runtime node only; FlowHolt = managed product entity |
| `PublishRecord` | n8n `WorkflowHistory` | n8n stores history but no promotion concept |
| `PromotionRequest` | No equivalent | FlowHolt-unique: managed promotion pipeline |
| `SecretEnvelope` | n8n `Credentials` (encrypted) | Same concept; n8n uses AES-256 with master key |

### Make entity comparison

| FlowHolt entity | Make equivalent | Key difference |
|----------------|----------------|---------------|
| `Organization` | Organization | Direct match |
| `Team` | Team | Direct match |
| `Workspace` | Workspace | FlowHolt adds environment separation within workspace |
| `WorkflowVersion` | Scenario version | Make has versions; FlowHolt adds promotion pipeline |
| `PromotionRequest` | No equivalent | FlowHolt-unique |
| `DataStore` | Data store | Direct match |
| `DataStructure` | Data structure | Direct match |
| `KnowledgeAsset` | Knowledge base | FlowHolt adds chunking/indexing lifecycle states |
| `Toolbox` | MCP toolbox | Direct match — `research/make-help-center-export/pages_markdown/mcp-toolboxes.md` |
| `AgentTestSession` | No equivalent | FlowHolt-unique: evaluation framework |

---

The backend should model product reality directly.

That means:
- tenancy and scope are explicit
- authoring objects differ from runtime objects
- assets differ from secrets
- deployment differs from execution
- event logs differ from business entities

## Scope hierarchy

The platform should formalize a clear scope chain:
- user
- organization
- team
- workspace
- environment

Current code still leans heavily on workspace scope, but the final plan should push scope awareness deeper into every major service.

## Entity families

### 1. Identity and membership

Core entities:
- User
- Session
- ApiKey
- Organization
- Team
- Workspace
- OrganizationMembership
- TeamMembership
- WorkspaceMembership
- RoleBinding

Lifecycle notes:
- users can belong to multiple orgs
- teams live under orgs
- workspaces are operational containers under teams or orgs

### 2. Workflow authoring

Core entities:
- Workflow
- WorkflowDefinition
- WorkflowVersion
- WorkflowDraft
- WorkflowTemplateLink
- WorkflowPolicy
- WorkflowTriggerConfig

Important separation:
- `Workflow` is the durable product object
- `WorkflowDraft` is mutable authoring state
- `WorkflowVersion` is an immutable release snapshot

### 3. Studio contract

Core entities:
- NodeDefinition
- NodeEditorSchema
- NodeFieldDefinition
- MappingContract
- ValidationIssue
- NodePreview

Purpose:
- provide the contract between canvas editing, backend validation, and runtime execution

### 4. Runtime execution

Core entities:
- WorkflowJob
- Execution
- ExecutionStep
- ExecutionArtifact
- ExecutionEvent
- ExecutionPause
- ReplayRequest
- RetryRecord

Important separation:
- jobs represent queueable work
- executions represent actual runs
- steps represent per-node outcomes
- artifacts represent stored payload bodies or files
- events represent timeline records

### 5. Assets and secrets

Core entities:
- Asset
- Credential
- Connection
- Variable
- DataStructure
- DataStore
- KnowledgeAsset
- Template
- Toolbox
- SecretEnvelope
- SecretAccessPolicy
- ConnectionHealth

Important separation:
- asset metadata is not the same as secret material
- a connection may reference secret envelopes without embedding them in normal API responses

### 6. AI and agent objects

Core entities:
- Agent
- AgentVersion later
- AgentToolBinding
- AgentKnowledgeBinding
- AgentMemoryBinding
- AgentTestSession
- ConversationThread
- StructuredOutputSchema

### 7. Release and environment

Core entities:
- Environment
- PublishRecord
- PromotionRequest
- DeploymentReview
- ApprovalRecord
- RollbackRecord later

### 8. Human interaction objects

Core entities:
- HumanTask
- HumanTaskAssignment
- HumanTaskDecision
- ChatSession
- ChatTriggerConfig

## Workflow lifecycle model

### Draft lifecycle

States:
- drafting
- valid
- invalid
- ready_for_review

Transitions:
- created
- edited
- validated
- marked ready
- superseded

### Version lifecycle

States:
- created
- staged
- published
- deprecated
- archived

Transitions:
- snapshot created from draft
- promoted to staging
- promoted to production
- replaced by newer version

## Execution lifecycle model

Execution should be treated as a multi-object flow.

### Job lifecycle

States:
- pending
- leased
- processing
- completed
- failed
- cancelled

### Execution lifecycle

States:
- queued
- running
- paused
- succeeded
- failed
- cancelled

### Step lifecycle

States:
- pending
- running
- succeeded
- failed
- skipped
- paused
- cancelled

### Pause lifecycle

States:
- open
- resumed
- expired later
- cancelled

Current FlowHolt models already support pause objects, human tasks, and resume flows, which is a strong sign that runtime state should stay explicit in the final architecture.

## Asset lifecycle model

### Credential or connection lifecycle

States:
- draft
- active
- warning
- expired
- archived

Transitions:
- created
- verified
- rotated
- restricted
- archived

### Knowledge asset lifecycle

States:
- uploaded
- processing
- indexed
- failed
- archived

## Release lifecycle model

### Promotion request lifecycle

States:
- draft
- pending_approval
- approved
- rejected
- deployed
- cancelled

### Deployment review lifecycle

States:
- pending
- approved
- rejected
- cancelled

Current backend models already show strong evidence for:
- staging versus production
- approval requirements
- self-approval policy
- deployment review records

## AI lifecycle model

### Agent lifecycle

States:
- draft
- tested
- approved later
- active
- archived

### Agent test session lifecycle

States:
- started
- running
- completed
- failed
- cancelled

### Conversation lifecycle

States:
- open
- paused
- closed
- archived

## Key event families

The backend should emit explicit events rather than relying only on row updates.

### Authoring events

- workflow.created
- workflow.updated
- workflow.validated
- workflow.version_created
- workflow.compared
- workflow.deleted later if supported

### Release events

- promotion.requested
- promotion.approved
- promotion.rejected
- workflow.published
- workflow.promoted_to_staging
- workflow.promoted_to_production

### Runtime events

- job.queued
- execution.started
- execution.paused
- execution.resumed
- execution.failed
- execution.succeeded
- execution.replayed
- execution.cancelled
- step.started
- step.failed
- step.succeeded

### Asset events

- asset.created
- asset.updated
- asset.archived
- credential.verified
- credential.rotated
- secret.revealed
- secret.policy_changed

### AI events

- agent.created
- agent.updated
- agent.test_started
- agent.test_completed
- agent.tool_called
- reasoning.trace_viewed

### Governance events

- member.invited
- member.role_changed
- approval.rule_changed
- runtime.payload_viewed
- audit.policy_changed

## Storage boundary model

The backend should not store everything the same way.

### Transactional database

Best for:
- users
- memberships
- workflows
- versions
- policies
- jobs
- execution summaries
- reviews
- asset metadata

### Secret store

Best for:
- encrypted secrets
- signing keys
- provider tokens

### Artifact store

Best for:
- execution payloads
- files
- step outputs
- exported bundles

### Search or retrieval index

Best for:
- help corpus later
- knowledge assets
- chunk metadata
- semantic retrieval records

### Analytics projections

Best for:
- aggregate counters
- success rates
- consumption views
- org and team dashboards

## API contract direction

The final API grouping should respect domain boundaries.

Suggested groups:
- `/auth`
- `/users`
- `/orgs`
- `/teams`
- `/workspaces`
- `/workflows`
- `/workflow-drafts`
- `/workflow-versions`
- `/workflow-reviews`
- `/studio`
- `/executions`
- `/execution-events`
- `/human-tasks`
- `/assets`
- `/vault`
- `/agents`
- `/environments`
- `/deployments`
- `/audit`
- `/analytics`

## Current FlowHolt alignment

Current module structure already points in the right direction:
- `auth.py`
- `executor.py`
- `scheduler.py`
- `webhooks.py`
- `integration_registry.py`
- `node_registry.py`
- `studio_contracts.py`
- `studio_resources.py`
- `studio_runtime.py`
- `repository.py`
- `encryption.py`
- `assistant_tools.py`

Current model evidence already supports this plan through:
- workflow versions
- deployment reviews
- replay modes
- execution inspector responses
- vault access responses
- trigger detail responses
- workspace settings with run and publish policy
- human task and pause objects

## Planning decisions for FlowHolt

- Separate mutable draft state from immutable version state.
- Treat jobs, executions, steps, artifacts, and events as different runtime objects.
- Separate asset metadata from stored secret material.
- Make approvals and promotions explicit entities, not just flags.
- Make AI objects first-class backend entities, not special workflow fields only.
- Keep scope awareness central so org, team, workspace, and environment can all matter.

## Remaining work

The final backend plan still needs:
- concrete relational map
- retention rules per entity family
- queue and worker topology
- idempotency strategy
- public trigger ingress and signature validation details
- environment-override resolution order
