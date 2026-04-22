# FlowHolt Route And API Authorization Map

This file turns the surface enforcement plan into an implementation-facing route and API map.

It is grounded in:
- `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md`
- current frontend routes in `src/App.tsx`
- current backend endpoints in `backend/app/main.py`
- current workspace policy model in `backend/app/models.py` and `backend/app/repository.py`

## Cross-Reference Map

### This file is grounded in (raw sources)

- `research/make-help-center-export/pages_markdown/api.md` — Make API documentation: authentication methods, API key scoping, endpoint families
- `research/make-help-center-export/pages_markdown/user-roles-in-organizations.md` — Make role-to-action mapping for API and UI surfaces
- `backend/app/main.py` — current FlowHolt backend endpoints and policy primitives (`run_min_role`, `publish_min_role`, `redact_execution_payloads`, etc.)
- `backend/app/models.py` — current workspace policy model with policy fields
- `backend/app/repository.py` — current repository-layer policy hooks

### Key n8n source code files

- `n8n-master/packages/cli/src/decorators/` — n8n route-level auth decorators: `@Authenticated`, `@GlobalScope`, `@ProjectScope`
- `n8n-master/packages/cli/src/auth/` — n8n authentication middleware, session validation, and JWT handling
- `n8n-master/packages/cli/src/middlewares/` — n8n per-route middleware chain for role and scope enforcement

### n8n/Make comparison

- Make API uses per-team API keys with no published route-level role gating; access is implicitly controlled by team membership and key scope
- n8n uses decorator-based scoped auth applied per handler (`@GlobalScope('workflow:read')`, etc.); global instance roles determine baseline access with per-resource overrides
- FlowHolt adopts n8n-style per-route capability gating, extends it with workspace-scoped policy preloads, and adds environment-level approval gates and payload-redaction response modes absent from n8n

### This file feeds into

- `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md` — compressed implementation-grade auth matrix
- `28-FLOWHOLT-BACKEND-AUTH-MIDDLEWARE-IMPLEMENTATION.md` — backend middleware implementation
- `31-FLOWHOLT-FRONTEND-PERMISSION-GUARD-IMPLEMENTATION.md` — frontend route guard implementation
- `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` — capability state types and denial response shapes

## Goal

The final platform should have a clear answer for each important route and API:
- who can access it
- which policy checks must run
- which data classes may be returned
- which actions must be hidden, disabled, or approval-gated in the UI

## Policy primitives already present in current FlowHolt

Current backend already exposes enough policy hooks to build a mature access layer:
- `run_min_role`
- `publish_min_role`
- `production_asset_min_role`
- `require_staging_before_production`
- `require_staging_approval`
- `require_production_approval`
- `deployment_approval_min_role`
- `allow_self_approval`
- `redact_execution_payloads`

## Frontend route groups

## 1. Dashboard overview surfaces

Routes:
- `/dashboard/overview`
- `/dashboard/workflows`
- `/dashboard/templates`
- `/dashboard/executions`
- `/dashboard/executions/:executionId`
- `/dashboard/environment`
- `/dashboard/help`
- `/dashboard/api`
- `/dashboard/system`
- `/dashboard/audit`

Planned access:
- Builder, Operator, Monitor, Team Admin, Org Admin, Org Owner: allowed
- Restricted Publisher: allowed where release review or runtime review matters

Backend requirements:
- route auth via session
- response shaping for execution payload sensitivity
- audit and system routes may need scope filtering later

## 2. Studio route

Route:
- `/studio/:id`

Planned access:
- Builder: full authoring
- Operator: read-only or operations-first mode later
- Monitor: read-only with runtime emphasis later
- Restricted Publisher: read-only with release actions

Must call these backend surfaces:
- workflow detail
- workflow policy
- studio bundle
- step editor
- step access

UI gating:
- hide destructive authoring actions if edit rights fail
- mask secret-backed bindings
- disable test or pin actions if runtime inspection rights fail

## 3. Credentials and Vault surfaces

Routes:
- `/dashboard/credentials`
- alias routes for `/dashboard/vault`, `/dashboard/connections`, `/dashboard/variables`

Backend surfaces:
- `/vault`
- `/vault/connections`
- `/vault/credentials`
- `/vault/variables`
- `/vault/assets/:asset_id`
- `/vault/assets/:asset_id/access`
- `/vault/assets/:asset_id/health`
- `/vault/assets/:asset_id/verify`

Planned access:
- Builder: metadata plus create or update within policy
- Operator: metadata and usage, minimal edit
- Monitor: metadata-only

Special enforcement:
- reveal is separate from read
- verify is separate from edit
- access-policy update is admin-level

## 4. AI and chat surfaces

Routes:
- `/dashboard/ai-agents`
- `/dashboard/ai-agents/:workflowId/:nodeId`
- `/dashboard/chat`
- `/chat/:workspaceId/:workflowId`

Backend surfaces:
- assistant routes
- chat thread routes
- public chat trigger routes

Planned access:
- Builder: full for owned scope
- Operator: use and inspect where permitted
- Monitor: metadata and limited runtime outputs

Special enforcement:
- reasoning access separate from normal output
- public chat exposure tied to workspace policy

## 5. Environment and release surfaces

Route:
- `/dashboard/environment`

Backend surfaces:
- `/workflows/:workflow_id/policy`
- `/workflows/:workflow_id/environments`
- `/workflows/:workflow_id/deployments`
- `/workflows/:workflow_id/deployment-history`
- `/deployment-reviews`
- `/workflows/:workflow_id/request-promotion`
- `/deployment-reviews/:review_id/approve`
- `/deployment-reviews/:review_id/reject`
- `/workflows/:workflow_id/publish`
- `/workflows/:workflow_id/promote`
- `/workflows/:workflow_id/rollback`

Planned access:
- Builder: request promotion, limited publish depending on policy
- Restricted Publisher: primary release user
- Org or Team Admin: approve or reject if threshold met
- Operator and Monitor: view-only

Special enforcement:
- publish and promote must call policy evaluation before action
- approval gates must be reflected in UI before server rejection

## 6. Runtime and jobs surfaces

Routes:
- `/dashboard/executions`
- `/dashboard/executions/:executionId`

Backend surfaces:
- `/executions`
- `/executions/:execution_id`
- `/executions/:execution_id/bundle`
- `/executions/:execution_id/events`
- `/executions/:execution_id/artifacts`
- `/executions/:execution_id/steps/:step_id`
- `/executions/:execution_id/retry`
- `/executions/:execution_id/replay`
- `/executions/:execution_id/resume`
- `/executions/:execution_id/cancel`
- `/jobs`
- `/jobs/:job_id/cancel`

Planned access:
- Builder: broad draft and staging access
- Operator: broad runtime access
- Monitor: read-mostly with payload restrictions
- Restricted Publisher: runtime visibility useful for release validation

Special enforcement:
- payload bundles obey redaction policy
- replay obeys run and environment policy
- retry obeys run policy

## Implementation matrix by API family

## A. Workflow read APIs

Endpoints:
- `GET /workflows`
- `GET /workflows/:workflow_id`
- `GET /workflows/:workflow_id/activity`
- `GET /workflows/:workflow_id/integrity`
- `GET /workflows/:workflow_id/compare`
- `GET /workflows/:workflow_id/versions`

Checks:
- authenticated workspace membership
- scope membership later

Response rules:
- metadata broadly visible
- release and policy sections always filtered by current role

## B. Workflow mutate APIs

Endpoints:
- `POST /workflows`
- `PUT /workflows/:workflow_id`
- `DELETE /workflows/:workflow_id`
- `POST /workflows/:workflow_id/versions`

Checks:
- edit right on workflow scope
- production-asset policy if saving binds protected assets

UI implications:
- Builders see actions
- Operators and Monitors do not

## C. Studio authoring APIs

Endpoints:
- bundle, step editor, step resources, step dynamic props
- insert step
- update step
- duplicate step
- delete step
- validate step
- test config
- test step

Checks:
- edit right for structure mutation
- test permission for config test or step test
- runtime-content permission for pinned data related operations later

UI implications:
- `Parameters`, `Settings`, and `Test` tabs should not all share the same enabled state

## D. Workflow run APIs

Endpoints:
- `POST /workflows/:workflow_id/run`
- `POST /workflows/:workflow_id/queue-run`
- `POST /executions/:execution_id/retry`
- `POST /executions/:execution_id/replay`

Checks:
- `run_min_role`
- production-asset policy if bound assets require elevated role
- environment-resolution checks for replay mode

Response rules:
- replay response may include redacted payload behavior downstream

## E. Release APIs

Endpoints:
- `POST /workflows/:workflow_id/publish`
- `POST /workflows/:workflow_id/promote`
- `POST /workflows/:workflow_id/request-promotion`
- `POST /deployment-reviews/:review_id/approve`
- `POST /deployment-reviews/:review_id/reject`
- `POST /workflows/:workflow_id/rollback`

Checks:
- `publish_min_role`
- approval requirement per environment
- self-approval constraint
- staging-before-production constraint
- public trigger policy

UI implications:
- show `Request approval` instead of `Publish` when direct publish is blocked
- show review queue only to review-capable roles

## F. Vault APIs

Endpoints:
- create, update, delete asset
- get access
- update access
- verify asset
- health

Checks:
- asset ownership or admin rights
- reveal and access-policy change must be stricter than metadata read

Response rules:
- secret material omitted or masked unless reveal-specific authorization exists

## G. Execution bundle APIs

Endpoints:
- bundle
- events
- artifacts
- step detail
- pause detail

Checks:
- execution observe rights
- runtime payload visibility rights
- reasoning visibility rights later

Response rules:
- return full, redacted, or metadata-only content depending on policy

## Route-to-policy resolution pattern

For every important screen:
1. load session and scope
2. load object detail
3. load policy payload if the screen supports actions
4. render action states from policy before user clicks
5. enforce again server-side

This avoids a UI that offers actions only to reject them at submit time.

## Minimum implementation targets

The first implementation-grade authorization layer should cover:
- Studio authoring actions
- workflow run and replay
- publish and promotion
- vault asset reveal versus use
- execution bundle redaction

## Remaining work

The final plan still needs:
- endpoint-by-endpoint mapping to exact role verbs
- route prefetch order for policy payloads
- standardized frontend `can*` capability model
