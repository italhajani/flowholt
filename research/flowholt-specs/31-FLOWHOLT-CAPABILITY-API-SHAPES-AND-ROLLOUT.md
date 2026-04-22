# FlowHolt Capability API Shapes And Rollout

This file turns the capability-object draft into exact API contract directions and rollout order.

It is grounded in:
- `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md`
- `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md`
- current frontend contracts in `src/lib/api.ts`
- current backend policy model in `backend/app/models.py`
- current route and API structure in `src/App.tsx` and `backend/app/main.py`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Role capability grants | `research/make-help-center-export/pages_markdown/organizations.md` | Org-level role capabilities and what each role can do |
| Team permission grants | `research/make-help-center-export/pages_markdown/manage-teams.md` | Team-level capability grants and scoping |
| n8n RBAC role permissions | `research/n8n-docs-export/pages_markdown/user-management__rbac__role-types.md` | Project Admin / Editor / Viewer capability table |
| Capability object design | `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` | CapabilityState shape, reason codes, builder pattern |
| Auth matrix | `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md` | Compact matrix of role × surface × action |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Scope/capability checking | `n8n-master/packages/cli/src/permissions/hasScope.ts` |
| License feature guards | `n8n-master/packages/cli/src/license.ts` |
| Auth middleware | `n8n-master/packages/cli/src/middlewares/auth.ts` |
| Project role model | `n8n-master/packages/cli/src/databases/entities/project-relation.entity.ts` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| API capability model | `hasScope(user, scope)` checked at route; no capability bundle returned to frontend | Capability bundle embedded in resource response; frontend receives `can*` objects |
| Deny response | 403 plain JSON error | 403 + `CapabilityDenialPayload` with reason code |
| Role check placement | Route-level middleware decorator | Builder at resource fetch time; enforcement wrapper at mutate time |
| Frontend auth state | `usePermissions()` composable queries backend roles | Capability bundle in resource API response; no separate permissions query |

### This file feeds into

| File | What it informs |
|------|----------------|
| `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` | Exact bundle payload definitions and denial examples |
| `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | Runtime API contract permissions |
| `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` | Informs builder and enforcement helper design |

---

## Goal

Define:
- which API shapes should carry capability data
- where they should be attached
- what the rollout order should be

## 1. Current missing piece

The frontend has typed contracts for:
- node editor payloads
- execution bundles
- workspace settings
- workflow versions and deployment reviews

It does not currently have a typed workflow-policy or capability contract in `src/lib/api.ts`.

That absence should be treated as an explicit maturity gap.

## 2. Shared capability types

## Proposed base types

```ts
export interface ApiCapabilityState {
  allowed: boolean;
  reason?: string | null;
  message?: string | null;
  redaction?: "none" | "masked" | "redacted" | "metadata_only";
}
```

```ts
export interface ApiWorkflowCapabilities {
  view: ApiCapabilityState;
  edit: ApiCapabilityState;
  run: ApiCapabilityState;
  test: ApiCapabilityState;
  create_version: ApiCapabilityState;
  stage: ApiCapabilityState;
  publish: ApiCapabilityState;
  request_review: ApiCapabilityState;
  edit_trigger_exposure: ApiCapabilityState;
  pin_runtime_data: ApiCapabilityState;
}
```

```ts
export interface ApiExecutionCapabilities {
  view: ApiCapabilityState;
  view_payload: ApiCapabilityState;
  view_artifacts: ApiCapabilityState;
  view_reasoning_summary: ApiCapabilityState;
  view_raw_reasoning: ApiCapabilityState;
  replay: ApiCapabilityState;
  resume: ApiCapabilityState;
  cancel: ApiCapabilityState;
}
```

```ts
export interface ApiVaultAssetCapabilities {
  view: ApiCapabilityState;
  edit: ApiCapabilityState;
  reveal: ApiCapabilityState;
  manage_access: ApiCapabilityState;
  verify: ApiCapabilityState;
  delete: ApiCapabilityState;
}
```

## 3. Attach points by surface

### Workflow policy endpoint

Current backend already exposes workflow policy semantics. Extend that into a frontend-visible typed contract:

```ts
export interface ApiWorkflowPolicy {
  workflow_id: string;
  workspace_id: string;
  can_run: boolean;
  can_promote_to_staging: boolean;
  can_publish: boolean;
  uses_production_assets: boolean;
  public_trigger_requested: boolean;
  public_trigger_type?: string | null;
  staging_min_role: string;
  run_min_role: string;
  publish_min_role: string;
  production_asset_min_role: string;
  require_staging_before_production: boolean;
  require_staging_approval: boolean;
  require_production_approval: boolean;
  deployment_approval_min_role: string;
  allow_self_approval: boolean;
  warnings: string[];
}
```

This should remain policy-oriented and not replace capabilities.

### Studio bundle

The future Studio bundle should include:
- workflow detail
- workflow policy
- workflow capabilities
- selected-step access summary later if needed

### Node editor payload

Extend `ApiNodeEditorField` with:

```ts
sensitivity?: "M0" | "M1" | "M2" | "S1" | "S2" | "R1";
redaction?: "none" | "masked" | "redacted";
editable?: boolean;
edit_denial_reason?: string | null;
```

Extend `ApiNodeEditorResponse` with:

```ts
capabilities?: {
  parameters: ApiCapabilityState;
  settings: ApiCapabilityState;
  test: ApiCapabilityState;
};
```

### Execution bundle

Extend `ApiExecutionBundle` with:

```ts
capabilities?: ApiExecutionCapabilities;
redaction_summary?: {
  payload_redacted: boolean;
  artifacts_redacted: boolean;
  reasoning_redacted: boolean;
  reasons: string[];
};
```

### Vault asset detail

When a full asset detail contract exists, it should include:
- asset metadata
- capability object
- reveal status
- health and verify summaries

## 4. Endpoint additions

Add typed frontend methods for:
- `getWorkflowPolicy(workflowId)`
- `getWorkflowCapabilities(workflowId)`
- later `getExecutionCapabilities(executionId)` only if not bundled

Prefer bundling capabilities into main payloads where possible. Avoid a route explosion if one payload can safely preload the state needed for the screen.

## 5. Rollout order

### Phase 1: typed policy foundation

- add `ApiWorkflowPolicy` to `src/lib/api.ts`
- add `api.getWorkflowPolicy(workflowId)`
- use it in Studio and release-aware dashboard surfaces

### Phase 2: workflow capabilities

- expose workflow capability payload from Studio-preload path
- convert Studio buttons and action placement to capability-driven rendering
- remove inline role assumptions from Studio components

### Phase 3: node-field capability metadata

- extend node editor responses with field sensitivity and per-tab capability
- use this to govern masking, readonly state, and test access

### Phase 4: execution bundle capabilities

- add bundle-level capability and redaction summary
- make execution detail views show metadata even when payload bodies are restricted

### Phase 5: vault detail capabilities

- add dedicated asset capability payloads
- separate asset metadata, secret reveal, and access-management states cleanly

## 6. Error contract rules

When a mutating action is denied:
- return `403`
- include capability payload if available
- include stable `reason` code
- include short user-facing `message`

Example response direction:

```json
{
  "message": "Workspace policy blocks publishing this workflow",
  "reason": "policy_publish_min_role",
  "policy": {},
  "capability": {
    "allowed": false,
    "reason": "policy_publish_min_role"
  }
}
```

## 7. Planning decisions

- Keep policy and capability separate.
- Policy explains why the workflow is constrained.
- Capability explains whether the current user can act right now.
- Bundle capability data into main screen payloads where it materially reduces duplicated requests.
- Node editor payloads should become the primary source of field sensitivity and tab editability.

## Remaining work

The final plan still needs:
- exact Studio bundle response shape
- execution-detail redaction examples for payload, artifacts, and reasoning
- capability caching and invalidation rules on publish, promote, and role changes
