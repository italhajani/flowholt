# FlowHolt Compact Auth Implementation Matrix

This file compresses the authorization planning into an implementation-grade matrix.

It is grounded in:
- `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md`
- `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md`
- current frontend routes in `src/App.tsx`
- current backend endpoints in `backend/app/main.py`

## Cross-Reference Map

### This file is grounded in (raw sources)

- `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` — role-by-surface enforcement rules that this matrix compresses into implementation columns
- `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md` — frontend route groups and planned backend requirements feeding the Surface/API and Route columns
- `backend/app/main.py` — current FlowHolt backend endpoint inventory used to populate the Backend API family column

### Key n8n source code files

- `n8n-master/packages/cli/src/permissions/hasScope.ts` — n8n scope-based capability check: pattern for per-handler explicit capability assertions
- `n8n-master/packages/cli/src/decorators/Authenticated.ts` — n8n session authentication decorator
- `n8n-master/packages/cli/src/decorators/ProjectScope.ts` — n8n per-project (workspace) scope decorator pattern

### n8n/Make comparison

- Make: per-resource access is implicit; team membership and API key scope determine access without a published capability vocabulary
- n8n: explicit `hasScope` checks per handler, scopes defined as `resource:action` strings (e.g., `workflow:read`, `credential:update`); no payload sensitivity tiers or UI denial behavior spec
- FlowHolt: adopts n8n-style explicit capability vocabulary (`workflow.view`, `vault.reveal`, `execution.payload.view`, etc.) extended with environment-aware scopes, AI-specific capabilities, and a structured sensitive response mode column absent from n8n

### This file feeds into

- `28-FLOWHOLT-BACKEND-AUTH-MIDDLEWARE-IMPLEMENTATION.md` — backend middleware implementation using the Required capability and Policy preload columns
- `31-FLOWHOLT-FRONTEND-PERMISSION-GUARD-IMPLEMENTATION.md` — frontend guard and UI gating implementation using the UI behavior when denied column

## Matrix fields

- Surface or API
- Frontend route
- Backend API family
- Required capability
- Policy preload
- Sensitive response mode
- UI behavior when denied

## Core capability vocabulary

- `workflow.view`
- `workflow.edit`
- `workflow.run`
- `workflow.publish`
- `workflow.review`
- `execution.view`
- `execution.payload.view`
- `execution.reasoning.view`
- `vault.view`
- `vault.edit`
- `vault.reveal`
- `vault.access.admin`
- `studio.test`
- `studio.pin_runtime_data`

## Matrix

| Surface or API | Frontend route | Backend API family | Required capability | Policy preload | Sensitive response mode | UI behavior when denied |
| --- | --- | --- | --- | --- | --- | --- |
| Workflow list | `/dashboard/workflows` | `/workflows` | `workflow.view` | session only | metadata | hide create if no edit |
| Workflow detail summary | `/dashboard/workflows` and Studio preload | `/workflows/:workflow_id` | `workflow.view` | session only | metadata | block route if no view |
| Studio bundle load | `/studio/:id` | `/studio/workflows/:workflow_id/bundle` | `workflow.view` | `/workflows/:workflow_id/policy` | metadata plus masked bindings | render read-only shell |
| Studio step editor | `/studio/:id` | `/studio/workflows/:workflow_id/steps/:step_id/editor` | `workflow.view` | step access | masked secret-bound fields | show read-only controls |
| Studio step mutate | `/studio/:id` | insert, update, duplicate, delete step APIs | `workflow.edit` | workflow policy and step access | n/a | hide or disable actions |
| Studio config test | `/studio/:id` | step test config and test APIs | `studio.test` | workflow policy and step access | redacted output if needed | disable test tab actions |
| Studio pin runtime data | `/studio/:id` | future pin-aware APIs and execution bundle usage | `studio.pin_runtime_data` and `execution.payload.view` | execution policy later | full or redacted | hide pin buttons |
| Manual run | `/studio/:id` | `/workflows/:workflow_id/run` and `/queue-run` | `workflow.run` | workflow policy | execution payload rules apply downstream | disable run controls |
| Replay | executions and Studio | `/executions/:execution_id/replay` | `workflow.run` | workflow policy and execution rights | redacted payload downstream | hide replay or show blocked |
| Publish | Studio and environment surfaces | `/workflows/:workflow_id/publish` | `workflow.publish` | workflow policy | metadata | replace with request approval or disabled state |
| Request promotion | Studio and environment surfaces | `/workflows/:workflow_id/request-promotion` | `workflow.publish` or request equivalent | workflow policy | metadata | hide if not eligible |
| Approval review | `/dashboard/environment` | `/deployment-reviews`, approve and reject APIs | `workflow.review` | workspace review policy | metadata | hide review queue |
| Execution list | `/dashboard/executions` | `/executions` | `execution.view` | session and scope | metadata | block route if no view |
| Execution bundle | execution detail surfaces | `/executions/:execution_id/bundle` | `execution.view` | execution policy later | full, redacted, or metadata-only | render redaction banners |
| Execution artifacts | execution detail surfaces | artifact APIs | `execution.view` and maybe `execution.payload.view` | execution policy later | full, redacted, or metadata-only | hide download or content |
| Reasoning panel | execution detail and AI surfaces | future reasoning-aware bundle sections | `execution.reasoning.view` | workspace and workflow AI policy | summary or hidden | hide panel entirely |
| Vault list | `/dashboard/credentials` | `/vault`, `/connections`, `/credentials`, `/variables` | `vault.view` | session and scope | metadata | block route if no view |
| Vault asset edit | credentials surfaces | asset create and update APIs | `vault.edit` | asset access policy | masked secret values | disable edit affordances |
| Vault asset reveal | credentials surfaces | reveal-specific detail later | `vault.reveal` | asset access policy | raw secret only when allowed | hide reveal action |
| Vault access policy | credentials surfaces | `/vault/assets/:asset_id/access` | `vault.access.admin` | asset access policy | metadata | hide access tab |
| Trigger details | environment and workflow surfaces | `/workflows/:workflow_id/trigger-details` | `workflow.view` | workflow policy | masked secret config | hide public exposure controls if no publish |

## Policy preload model

Before rendering action-heavy screens, the frontend should preload:

### Studio
- session
- workflow detail
- workflow policy
- selected step access when a step is selected

### Execution detail
- execution summary
- execution bundle
- execution policy object later if split from bundle

### Environment and release
- workflow policy
- workflow environments
- deployment reviews when review-capable

### Vault detail
- asset metadata
- asset access policy
- health and verify state if edit-capable

## UI state conventions

Use the same UI states everywhere:
- hidden
- disabled with reason
- visible read-only
- visible masked
- visible redacted
- visible actionable

## First implementation targets

Build these first because they remove the biggest maturity gaps:
- Studio edit versus run separation
- publish versus request-approval branching
- execution redaction states
- vault use versus reveal separation

## Remaining work

The final plan still needs:
- exact backend helper names for each capability check
- frontend `can*` object shape
- route prefetch sequence diagrams
