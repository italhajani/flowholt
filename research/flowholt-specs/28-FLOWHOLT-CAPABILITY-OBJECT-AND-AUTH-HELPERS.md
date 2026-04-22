# FlowHolt Capability Object And Auth Helpers

This file translates the compact authorization matrix into concrete frontend and backend design.

It is grounded in:
- `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md`
- `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md`
- current auth helpers in `backend/app/main.py`
- current policy response models in `backend/app/models.py`
- current API contracts in `src/lib/api.ts`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Role-by-surface enforcement | `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` | Surface → capability mapping |
| Authorization map | `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md` | Route → required capability |
| Make role model | `research/make-help-center-export/pages_markdown/organizations.md` | Org/team role capabilities |
| Make team permissions | `research/make-help-center-export/pages_markdown/manage-teams.md` | Team-level capability grants |
| n8n RBAC roles | `research/n8n-docs-export/pages_markdown/user-management__rbac__role-types.md` | Project Admin/Editor/Viewer permission table |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Scope/capability checking | `n8n-master/packages/cli/src/permissions/hasScope.ts` |
| License feature guards | `n8n-master/packages/cli/src/license.ts` |
| Auth middleware | `n8n-master/packages/cli/src/middlewares/auth.ts` |
| Capability decorator | `n8n-master/packages/cli/src/decorators/` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Auth model | JWT + instance-level roles + project-level roles | JWT + org/team/workspace roles + capability objects |
| Capability checking | `hasScope(user, 'workflow:execute')` at route level | `require_capability(capability_object, 'workflow.run')` |
| Deny response | 403 with reason | 403 + capability denial payload with reason code |
| Frontend auth state | `usePermissions()` composable | Capability bundle in API response |

### This file feeds into

| File | What it informs |
|------|----------------|
| `31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md` | API shapes that carry capability data |
| `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` | Bundle payload format |
| `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md` | Auth implementation matrix |

---

## Current state

Current backend evidence is mixed:
- broad route checks still use `require_workspace_role(session, ...)`
- more mature workflow logic already exists in `session_meets_min_role(...)`
- workflow-specific gating already exists in `build_workflow_policy_response(...)`
- policy enforcement already exists in `enforce_workflow_asset_access_or_raise(...)` and `enforce_workflow_governance_or_raise(...)`

This means the direction is not to replace everything. The direction is to standardize around capability objects and helper composition.

## Goal

Create one consistent pattern:
- backend computes capability state close to the object
- frontend receives compact `can*` objects with reasons
- routes preload capability data before rendering heavy surfaces
- denied states are explicit, not inferred ad hoc in components

## 1. Frontend capability object model

Every action-heavy surface should consume a typed capability object with:
- boolean result
- denial reason code
- optional human-readable explanation
- optional redaction mode

## Proposed shared shape

```ts
type CapabilityState = {
  allowed: boolean;
  reason?: string | null;
  message?: string | null;
  redaction?: "none" | "masked" | "redacted" | "metadata_only";
};
```

## Proposed object families

### Workflow capabilities

```ts
type WorkflowCapabilities = {
  view: CapabilityState;
  edit: CapabilityState;
  run: CapabilityState;
  test: CapabilityState;
  createVersion: CapabilityState;
  stage: CapabilityState;
  publish: CapabilityState;
  requestReview: CapabilityState;
  editTriggerExposure: CapabilityState;
  useProductionAssets: CapabilityState;
  pinRuntimeData: CapabilityState;
};
```

### Execution capabilities

```ts
type ExecutionCapabilities = {
  view: CapabilityState;
  viewPayload: CapabilityState;
  viewArtifacts: CapabilityState;
  viewReasoningSummary: CapabilityState;
  viewRawReasoning: CapabilityState;
  replay: CapabilityState;
  resume: CapabilityState;
  cancel: CapabilityState;
};
```

### Vault asset capabilities

```ts
type VaultAssetCapabilities = {
  view: CapabilityState;
  edit: CapabilityState;
  reveal: CapabilityState;
  manageAccess: CapabilityState;
  verify: CapabilityState;
  delete: CapabilityState;
};
```

## 2. Reason-code vocabulary

Keep reason codes short and reusable:
- `missing_role`
- `policy_run_min_role`
- `policy_publish_min_role`
- `policy_staging_min_role`
- `policy_production_asset_min_role`
- `policy_public_webhook_blocked`
- `policy_public_chat_blocked`
- `workflow_uses_production_assets`
- `execution_payload_redacted`
- `secret_reveal_not_allowed`
- `review_required`
- `object_read_only`

This matters because disabled controls, tooltips, banners, and audit logs should all reuse the same reason language.

## 3. Backend helper design

### Keep current helpers

Retain:
- `require_workspace_role`
- `session_meets_min_role`
- `enforce_workflow_asset_access_or_raise`
- `enforce_workflow_governance_or_raise`

### Add standardized builders

Add object-level builders:
- `build_workflow_capabilities(...)`
- `build_execution_capabilities(...)`
- `build_vault_asset_capabilities(...)`
- later `build_agent_capabilities(...)`

These builders should return explicit booleans plus reason codes rather than forcing components to infer state from raw role and settings fields.

### Add thin enforcement wrappers

Add endpoint helpers:
- `require_workflow_capability(..., action="edit")`
- `require_execution_capability(..., action="view_payload")`
- `require_vault_asset_capability(..., action="reveal")`

These wrappers should:
- call the builder
- raise `403` with capability payload when denied
- keep audit metadata consistent

## 4. Route preload sequence

### Studio route

Load in this order:
1. session
2. workflow detail
3. workflow policy
4. workflow capabilities
5. selected step editor payload when a node is selected

Studio components should not each rediscover permissions. They should consume a single capability object plus field-level sensitivity metadata from the editor payload.

### Execution detail route

Load in this order:
1. session
2. execution bundle summary
3. execution capabilities
4. heavy payload and artifact content only if capability allows

### Vault detail route

Load in this order:
1. asset metadata
2. asset capability object
3. health or verify state
4. reveal payload only on explicit reveal action

## 5. Surface rules

### Studio

- top-level route deny should be rare; prefer read-only Studio for users who can view but not edit
- edit actions should bind to `workflowCapabilities.edit`
- run and replay actions should bind to `workflowCapabilities.run`
- version, stage, publish, and request-review actions should bind to separate release capabilities
- secret-backed fields should use `VaultAssetCapabilities.reveal`, not `workflowCapabilities.edit`

### Execution detail

- execution metadata may be visible while payloads remain masked
- reasoning summary and raw reasoning must be separate capabilities
- replay should require both execution visibility and workflow run capability

### Vault

- viewing asset metadata is distinct from editing and revealing
- verify and health checks can be allowed without reveal
- access management needs its own capability rather than piggybacking on edit

## 6. Migration plan

### Phase 1

- keep existing route-level role checks
- introduce capability builders for workflow, execution, and vault detail views
- wire frontend disabled states to capability objects

### Phase 2

- replace scattered component role checks with capability consumption
- return capability payloads in Studio bundle, execution bundle, and vault detail endpoints

### Phase 3

- convert mutating endpoints from direct role checks to `require_*_capability(...)`
- add audit reason codes to denial events

## 7. Planning decisions

- `WorkflowPolicyResponse` stays useful, but it is not enough by itself. It should feed a richer workflow capability builder.
- `require_workspace_role` remains valid for broad route fences and simple admin pages.
- fine-grained action control should move toward object-specific capability builders, not more route-level role branches.
- the frontend should prefer a small number of authoritative capability objects over dozens of inline boolean expressions.

## Remaining work

The final plan still needs:
- exact API response shapes for capability payloads
- field-level capability integration in node editor responses
- environment-aware capability variants for staging and production actions
