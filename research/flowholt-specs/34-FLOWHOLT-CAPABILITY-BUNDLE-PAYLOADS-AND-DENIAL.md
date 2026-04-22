# FlowHolt Capability Bundle Payloads And Denial Response Contracts

This file turns the capability API-shapes draft (`31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md`) and the capability object design (`28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md`) into exact bundle payload definitions and denial-response examples.

It is grounded in:
- `backend/app/models.py` — current Pydantic response models
- `src/lib/api.ts` — current frontend TypeScript interfaces
- `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` — capability state shape and reason codes
- `31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md` — rollout phases and attach points
- `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` — per-node-family tab exceptions
- Current response models: `WorkflowPolicyResponse`, `StudioWorkflowBundleResponse`, `NodeEditorResponse`, `ExecutionInspectorResponse`, `VaultAssetAccessResponse`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Make role capability model | `research/make-help-center-export/pages_markdown/organizations.md` | What each org role can do; denial UX patterns |
| Make team permissions | `research/make-help-center-export/pages_markdown/manage-teams.md` | Team-scoped capability grants |
| n8n RBAC roles | `research/n8n-docs-export/pages_markdown/user-management__rbac__role-types.md` | Project Admin / Editor / Viewer; what Viewer cannot do |
| n8n 403 response patterns | `research/n8n-docs-export/pages_markdown/api__authentication.md` | API auth and error response conventions |
| Capability object design | `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` | CapabilityState shape, reason-code vocabulary, builder pattern |
| Capability API shapes | `31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md` | Which API responses carry capability bundles, rollout phases |
| Node family tab exceptions | `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` | Per-family fields that need tab-state capabilities |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Scope/capability checking | `n8n-master/packages/cli/src/permissions/hasScope.ts` |
| Auth middleware | `n8n-master/packages/cli/src/middlewares/auth.ts` |
| License feature guards | `n8n-master/packages/cli/src/license.ts` |
| 403 error response format | `n8n-master/packages/cli/src/response-helper.ts` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Deny response payload | `{ message: "Forbidden" }` 403 with minimal detail | `CapabilityDenialPayload` with `reason`, `message`, `resource_type`, `resource_id`, `action` |
| Frontend disabled-state source | Component checks `currentUser.role` inline | Component binds to `capabilities.<action>.allowed` from bundle |
| Capability bundle location | Not returned; frontend queries roles separately | Embedded in resource response (`workflow`, `execution`, `vault_asset`) |
| Reason codes | Not standardized | 15+ named reason codes; same codes used in tooltips, banners, audit logs |
| Plan-gated features | `license.isFeatureEnabled(feature)` guard | `feature_not_available` reason code in denial + plan upgrade prompt |

### This file feeds into

| File | What it informs |
|------|----------------|
| Backend implementation of capability builders in `backend/app/main.py` | Final payload shapes |
| Frontend TypeScript interfaces in `src/lib/api.ts` | Typed capability bundle contracts |
| `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | Runtime API denial contracts |

---

## 1. Core capability state type

This is the single shared type used in all capability payloads. It maps directly to the design in file 28.

### Backend (Pydantic)

```python
class CapabilityState(BaseModel):
    allowed: bool
    reason: str | None = None
    message: str | None = None
    redaction: Literal["none", "mask", "omit"] = "none"
```

### Frontend (TypeScript)

```typescript
interface ApiCapabilityState {
  allowed: boolean;
  reason: string | null;
  message: string | null;
  redaction: "none" | "mask" | "omit";
}
```

### Reason-code vocabulary

These are the exhaustive reason codes. Every denial response uses exactly one of these.

| Code | Meaning |
|---|---|
| `role_insufficient` | User's workspace role is below the minimum for this action |
| `environment_locked` | Target environment is locked or requires a higher promotion path |
| `staging_required` | Action requires staging before production; workflow has not been staged |
| `approval_pending` | A deployment review is pending and blocks this action |
| `approval_required` | Action requires an approval that has not been requested |
| `asset_private` | Vault asset is private or restricted and user is not in the allowed list |
| `asset_scope_mismatch` | Vault asset scope does not match target environment |
| `confidentiality_policy` | Workflow or workspace has `data_is_confidential` or `redact_execution_payloads` enabled |
| `execution_data_disabled` | Execution data saving is turned off for this category |
| `quota_exceeded` | Workspace plan limit exceeded (executions, storage, etc.) |
| `workflow_paused` | Workflow is paused and the action requires active state |
| `workflow_draft` | Workflow is still in draft and the action requires published state |
| `self_approval_blocked` | User cannot approve their own promotion request |
| `feature_not_available` | Feature is not available on the current plan |
| `public_trigger_blocked` | Workspace policy does not allow public webhooks/chat triggers |

---

## 2. Workflow capability object

Attached to: workflow policy response, Studio bundle response.

### Backend

```python
class WorkflowCapabilities(BaseModel):
    edit: CapabilityState
    run: CapabilityState
    test: CapabilityState
    promote_staging: CapabilityState
    publish: CapabilityState
    rollback: CapabilityState
    delete: CapabilityState
    export: CapabilityState
    view_executions: CapabilityState
    view_versions: CapabilityState
    request_approval: CapabilityState
    manage_trigger: CapabilityState
```

### Frontend

```typescript
interface ApiWorkflowCapabilities {
  edit: ApiCapabilityState;
  run: ApiCapabilityState;
  test: ApiCapabilityState;
  promote_staging: ApiCapabilityState;
  publish: ApiCapabilityState;
  rollback: ApiCapabilityState;
  delete: ApiCapabilityState;
  export: ApiCapabilityState;
  view_executions: ApiCapabilityState;
  view_versions: ApiCapabilityState;
  request_approval: ApiCapabilityState;
  manage_trigger: ApiCapabilityState;
}
```

### Attach point 1: Workflow policy response

Current model: `WorkflowPolicyResponse`

The capability object replaces the flat boolean fields (`can_run`, `can_promote_to_staging`, `can_publish`) with structured reason-bearing capabilities.

```python
class WorkflowPolicyResponse(BaseModel):
    workflow_id: str
    workspace_id: str
    capabilities: WorkflowCapabilities          # NEW — replaces flat booleans
    uses_production_assets: bool
    public_webhook_requested: bool
    public_chat_trigger_requested: bool
    public_trigger_requested: bool
    public_trigger_type: str | None = None
    staging_min_role: WorkspaceRole
    run_min_role: WorkspaceRole
    publish_min_role: WorkspaceRole
    production_asset_min_role: WorkspaceRole
    require_staging_before_production: bool
    require_staging_approval: bool
    require_production_approval: bool
    deployment_approval_min_role: WorkspaceRole
    allow_self_approval: bool
    warnings: list[str]
    # DEPRECATED — kept for migration, removed in Phase 2
    can_run: bool
    can_promote_to_staging: bool
    can_publish: bool
```

### Attach point 2: Studio bundle response

Current model: `StudioWorkflowBundleResponse`

```python
class StudioWorkflowBundleResponse(BaseModel):
    workflow: WorkflowDetail
    integrity: WorkflowValidationResponse
    catalog: NodeCatalogResponse
    selected_step_editor: NodeEditorResponse | None = None
    step_editors: list[StudioStepEditorEntry]
    capabilities: WorkflowCapabilities          # NEW
    policy: WorkflowPolicyResponse              # NEW — full policy for Studio controls
```

### Example JSON: allowed

```json
{
  "capabilities": {
    "edit": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "run": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "test": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "promote_staging": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "publish": { "allowed": false, "reason": "staging_required", "message": "Promote to staging before publishing to production.", "redaction": "none" },
    "rollback": { "allowed": false, "reason": "environment_locked", "message": "No production version exists to roll back.", "redaction": "none" },
    "delete": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "export": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "view_executions": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "view_versions": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "request_approval": { "allowed": false, "reason": "approval_pending", "message": "A staging approval is already pending.", "redaction": "none" },
    "manage_trigger": { "allowed": true, "reason": null, "message": null, "redaction": "none" }
  }
}
```

### Example JSON: viewer denied

```json
{
  "capabilities": {
    "edit": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot edit workflows. Contact a builder or admin.", "redaction": "none" },
    "run": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot run workflows.", "redaction": "none" },
    "test": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot test workflows.", "redaction": "none" },
    "promote_staging": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot promote workflows.", "redaction": "none" },
    "publish": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot publish workflows.", "redaction": "none" },
    "rollback": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot roll back workflows.", "redaction": "none" },
    "delete": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot delete workflows.", "redaction": "none" },
    "export": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "view_executions": { "allowed": true, "reason": null, "message": null, "redaction": "mask" },
    "view_versions": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "request_approval": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot request approvals.", "redaction": "none" },
    "manage_trigger": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot manage triggers.", "redaction": "none" }
  }
}
```

---

## 3. Node-level capability object

Attached to: node editor response, per-step access response.

### Backend

```python
class NodeCapabilities(BaseModel):
    edit: CapabilityState
    test: CapabilityState
    view_config: CapabilityState
    bind_credentials: CapabilityState
    view_test_output: CapabilityState
```

### Frontend

```typescript
interface ApiNodeCapabilities {
  edit: ApiCapabilityState;
  test: ApiCapabilityState;
  view_config: ApiCapabilityState;
  bind_credentials: ApiCapabilityState;
  view_test_output: ApiCapabilityState;
}
```

### Attach point: Node editor response

Current model: `NodeEditorResponse`

```python
class NodeEditorResponse(BaseModel):
    node_type: str
    label: str
    description: str
    icon: str
    step_name_default: str
    sections: list[NodeEditorSection]
    node_settings: list[NodeEditorSection]
    warnings: list[str]
    sample_output: dict[str, Any]
    available_bindings: list[NodeBindingReference]
    data_references: list[NodeDataReference]
    capabilities: NodeCapabilities                  # NEW
    field_sensitivity: dict[str, str]               # NEW — field_key → sensitivity class
```

### Field sensitivity map

The `field_sensitivity` dictionary maps each field key to its sensitivity class from file 27. This enables the frontend to apply per-field masking, write-only rendering, and redaction without hardcoding field knowledge in the UI.

```json
{
  "field_sensitivity": {
    "url": "M1",
    "body": "M2",
    "token": "S2",
    "basic_password": "S2",
    "basic_user": "M2",
    "credential": "S1",
    "timeout": "M1",
    "follow_redirects": "M1"
  }
}
```

Frontend rendering rules per sensitivity class:

| Class | Viewer | Builder | Publisher |
|---|---|---|---|
| M0 | visible_readonly | visible_actionable | visible_actionable |
| M1 | visible_readonly | visible_actionable | visible_actionable |
| M2 | visible_readonly | visible_actionable | visible_actionable |
| S1 | visible_readonly (chip only) | visible_actionable (chip, can rebind) | visible_actionable |
| S2 | hidden | visible_actionable (write-only, masked on re-render) | visible_actionable (write-only) |
| R1 | governed by policy | governed by policy | governed by policy |

### Attach point: Per-step access response

Current model: `StudioStepAccessResponse`

```python
class StudioStepAccessResponse(BaseModel):
    workflow_id: str
    step_id: str
    capabilities: NodeCapabilities                  # NEW — replaces flat booleans
    bindings: list[StudioStepAssetBinding]
    warnings: list[str]
    # DEPRECATED
    can_edit: bool
    can_test: bool
```

### Example JSON: builder on http_request node

```json
{
  "capabilities": {
    "edit": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "test": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "view_config": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "bind_credentials": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "view_test_output": { "allowed": true, "reason": null, "message": null, "redaction": "none" }
  },
  "field_sensitivity": {
    "url": "M1",
    "method": "M0",
    "headers": "M2",
    "body": "M2",
    "credential": "S1",
    "token": "S2",
    "basic_user": "M2",
    "basic_password": "S2",
    "api_key_header": "M1",
    "api_key_value": "S2",
    "timeout": "M1",
    "follow_redirects": "M1",
    "ignore_ssl": "M1",
    "proxy_url": "M1",
    "retry_on_fail": "M1",
    "max_retries": "M1",
    "retry_wait_ms": "M1"
  }
}
```

### Example JSON: viewer on ai_agent node with confidentiality

```json
{
  "capabilities": {
    "edit": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot edit node configuration.", "redaction": "none" },
    "test": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot run tests.", "redaction": "none" },
    "view_config": { "allowed": true, "reason": null, "message": null, "redaction": "mask" },
    "bind_credentials": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot bind credentials.", "redaction": "none" },
    "view_test_output": { "allowed": true, "reason": null, "message": null, "redaction": "mask" }
  },
  "field_sensitivity": {
    "prompt": "M2",
    "system_message": "M2",
    "credential_id": "S1",
    "provider": "M1",
    "model": "M1",
    "temperature": "M1",
    "max_tokens": "M1",
    "tools": "M1",
    "memory_enabled": "M1",
    "memory_type": "M1",
    "memory_session_key": "M2",
    "sub_agents_json": "M2",
    "return_intermediate_steps": "R1",
    "max_iterations": "M1",
    "output_format": "M1"
  }
}
```

---

## 4. Execution capability object

Attached to: execution bundle, execution inspector response.

### Backend

```python
class ExecutionCapabilities(BaseModel):
    view: CapabilityState
    view_payloads: CapabilityState
    view_raw_reasoning: CapabilityState
    replay: CapabilityState
    cancel: CapabilityState
    resume: CapabilityState
    retry: CapabilityState
    delete: CapabilityState
```

### Frontend

```typescript
interface ApiExecutionCapabilities {
  view: ApiCapabilityState;
  view_payloads: ApiCapabilityState;
  view_raw_reasoning: ApiCapabilityState;
  replay: ApiCapabilityState;
  cancel: ApiCapabilityState;
  resume: ApiCapabilityState;
  retry: ApiCapabilityState;
  delete: ApiCapabilityState;
}
```

### Attach point: Execution bundle

Current model: `ExecutionInspectorResponse` (backend) / `ApiExecutionBundle` (frontend)

```python
class ExecutionInspectorResponse(BaseModel):
    execution: ExecutionSummary
    events: list[ExecutionEventSummary]
    artifacts: list[ExecutionArtifactSummary]
    pause: ExecutionPauseSummary | None
    human_task: HumanTaskSummary | None
    capabilities: ExecutionCapabilities             # NEW
```

### Example JSON: builder with confidentiality

```json
{
  "capabilities": {
    "view": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "view_payloads": { "allowed": true, "reason": null, "message": null, "redaction": "mask" },
    "view_raw_reasoning": { "allowed": false, "reason": "confidentiality_policy", "message": "Raw reasoning traces are redacted by workspace policy.", "redaction": "omit" },
    "replay": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "cancel": { "allowed": false, "reason": "environment_locked", "message": "Cannot cancel a completed execution.", "redaction": "none" },
    "resume": { "allowed": false, "reason": "environment_locked", "message": "Execution is not paused.", "redaction": "none" },
    "retry": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "delete": { "allowed": false, "reason": "role_insufficient", "message": "Only admins can delete executions.", "redaction": "none" }
  }
}
```

### Example JSON: viewer on failed execution

```json
{
  "capabilities": {
    "view": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "view_payloads": { "allowed": true, "reason": null, "message": null, "redaction": "mask" },
    "view_raw_reasoning": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot access reasoning traces.", "redaction": "omit" },
    "replay": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot replay executions.", "redaction": "none" },
    "cancel": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot cancel executions.", "redaction": "none" },
    "resume": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot resume executions.", "redaction": "none" },
    "retry": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot retry executions.", "redaction": "none" },
    "delete": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot delete executions.", "redaction": "none" }
  }
}
```

---

## 5. Vault asset capability object

Attached to: vault asset access response, vault asset detail response.

### Backend

```python
class VaultAssetCapabilities(BaseModel):
    view: CapabilityState
    view_secret: CapabilityState
    edit: CapabilityState
    test: CapabilityState
    delete: CapabilityState
    manage_access: CapabilityState
    bind_to_workflow: CapabilityState
```

### Frontend

```typescript
interface ApiVaultAssetCapabilities {
  view: ApiCapabilityState;
  view_secret: ApiCapabilityState;
  edit: ApiCapabilityState;
  test: ApiCapabilityState;
  delete: ApiCapabilityState;
  manage_access: ApiCapabilityState;
  bind_to_workflow: ApiCapabilityState;
}
```

### Attach point: Vault asset access response

Current model: `VaultAssetAccessResponse`

```python
class VaultAssetAccessResponse(BaseModel):
    asset_id: str
    workspace_id: str
    name: str
    kind: VaultAssetKind
    visibility: VaultVisibility
    owner_user_id: str | None
    allowed_roles: list[WorkspaceRole]
    allowed_user_ids: list[str]
    capabilities: VaultAssetCapabilities            # NEW — replaces flat booleans
    # DEPRECATED
    can_edit: bool
    can_test: bool
```

### Example JSON: builder on private credential

```json
{
  "capabilities": {
    "view": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "view_secret": { "allowed": false, "reason": "asset_private", "message": "This credential's secrets are private. Contact the owner.", "redaction": "omit" },
    "edit": { "allowed": false, "reason": "asset_private", "message": "Only the owner can edit this credential.", "redaction": "none" },
    "test": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
    "delete": { "allowed": false, "reason": "asset_private", "message": "Only the owner can delete this credential.", "redaction": "none" },
    "manage_access": { "allowed": false, "reason": "role_insufficient", "message": "Only admins and the owner can manage access.", "redaction": "none" },
    "bind_to_workflow": { "allowed": true, "reason": null, "message": null, "redaction": "none" }
  }
}
```

---

## 6. Denial HTTP response contract

When an API action is denied due to capabilities, the backend returns a structured error response.

### HTTP status codes

| Scenario | Status | Body |
|---|---|---|
| Role insufficient for the action | 403 | Structured denial |
| Environment policy blocks the action | 403 | Structured denial |
| Object not found | 404 | Standard 404 |
| Valid request but action cannot complete (e.g., already completed) | 409 | Structured denial |

### Denial response body

```python
class CapabilityDenialResponse(BaseModel):
    error: Literal["capability_denied"] = "capability_denied"
    capability: str                     # e.g., "edit", "publish", "view_secret"
    state: CapabilityState              # full denial state with reason and message
    target_type: str                    # "workflow", "execution", "vault_asset", "node"
    target_id: str
```

### Example: 403 — viewer tries to edit a workflow

```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "capability_denied",
  "capability": "edit",
  "state": {
    "allowed": false,
    "reason": "role_insufficient",
    "message": "Viewers cannot edit workflows. Contact a builder or admin.",
    "redaction": "none"
  },
  "target_type": "workflow",
  "target_id": "wf_abc123"
}
```

### Example: 403 — builder tries to publish without staging

```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "capability_denied",
  "capability": "publish",
  "state": {
    "allowed": false,
    "reason": "staging_required",
    "message": "This workflow must be promoted to staging before publishing to production.",
    "redaction": "none"
  },
  "target_type": "workflow",
  "target_id": "wf_abc123"
}
```

### Example: 403 — builder tries to view raw reasoning on confidential workflow

```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "capability_denied",
  "capability": "view_raw_reasoning",
  "state": {
    "allowed": false,
    "reason": "confidentiality_policy",
    "message": "Raw reasoning traces are redacted by workspace policy.",
    "redaction": "omit"
  },
  "target_type": "execution",
  "target_id": "exec_xyz789"
}
```

### Example: 409 — trying to cancel a completed execution

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": "capability_denied",
  "capability": "cancel",
  "state": {
    "allowed": false,
    "reason": "environment_locked",
    "message": "Cannot cancel a completed execution.",
    "redaction": "none"
  },
  "target_type": "execution",
  "target_id": "exec_xyz789"
}
```

---

## 7. Frontend consumption patterns

### Pattern 1: Disable button with tooltip

```typescript
// Studio toolbar
const publishBtn = bundle.capabilities.publish;
<Button
  disabled={!publishBtn.allowed}
  title={publishBtn.message ?? undefined}
>
  Publish
</Button>
```

### Pattern 2: Conditional tab rendering

```typescript
// Node inspector tab visibility
const nodeTabState = (tab: string) => {
  if (tab === "test" && !nodeCaps.test.allowed) return "hidden";
  if (tab === "parameters" && nodeCaps.view_config.redaction === "mask") return "visible_masked";
  return "visible_actionable";
};
```

### Pattern 3: Error toast from denial response

```typescript
catch (err) {
  const body = await err.response?.json();
  if (body?.error === "capability_denied") {
    toast.error(body.state.message);
  }
}
```

### Pattern 4: Conditional field rendering based on sensitivity

```typescript
const renderField = (field: ApiNodeEditorField, sensitivity: string, role: string) => {
  if (sensitivity === "S2" && role === "viewer") return null; // hidden
  if (sensitivity === "S2") return <PasswordField writeOnly />;
  if (sensitivity === "S1") return <CredentialChip bindable={role !== "viewer"} />;
  if (sensitivity === "R1") return <PolicyGatedField />;
  return <StandardField readOnly={role === "viewer"} />;
};
```

---

## 8. Backend capability computation sequence

The backend computes capabilities in a standard sequence for every response that includes a capability object. This sequence is based on the preload pattern from file 28.

### Workflow capabilities computation

```
1. Load workspace settings → workspace_id
2. Load user session → user_id, role
3. Load workflow → status, trigger_type, definition
4. Load workflow policy → environment flags, approval state
5. Compute per-capability states:
   - edit: role >= builder AND workflow not in production-locked state
   - run: role >= run_min_role AND workflow has valid definition
   - test: role >= builder AND workflow has valid trigger
   - promote_staging: role >= staging_min_role AND workflow has changes
   - publish: role >= publish_min_role AND (staging exists OR staging not required)
   - rollback: role >= publish_min_role AND production version exists
   - delete: role >= builder AND workflow is draft OR role >= admin
   - export: role >= viewer
   - view_executions: role >= viewer (redaction: mask if redact_execution_payloads)
   - view_versions: role >= viewer
   - request_approval: role >= builder AND approval_required AND no pending approval
   - manage_trigger: role >= builder AND (public trigger allowed by workspace policy)
```

### Node capabilities computation

```
1. Inherit workflow capabilities (edit, test)
2. Load step asset bindings → check vault asset access for each bound asset
3. Compute:
   - edit: workflow.edit.allowed AND all bound assets permit binding
   - test: workflow.test.allowed AND all bound assets are accessible
   - view_config: workflow.view_executions.allowed (with inherited redaction)
   - bind_credentials: role >= builder AND vault asset scope matches environment
   - view_test_output: test.allowed (with redaction from confidentiality_policy)
```

### Execution capabilities computation

```
1. Inherit workflow capabilities (view_executions)
2. Load execution → status, environment
3. Compute:
   - view: always allowed if workflow access exists
   - view_payloads: role >= viewer (redaction: mask if confidentiality_policy)
   - view_raw_reasoning: role >= builder AND NOT confidentiality_policy
   - replay: role >= run_min_role AND execution has trigger data stored
   - cancel: role >= run_min_role AND execution status == "running"
   - resume: role >= run_min_role AND execution status == "paused"
   - retry: role >= run_min_role AND execution status == "failed"
   - delete: role >= admin
```

### Vault asset capabilities computation

```
1. Load asset → kind, visibility, owner_user_id, allowed_roles, allowed_user_ids
2. Load workspace settings → production_asset_min_role
3. Compute:
   - view: user in allowed list OR visibility == "workspace"
   - view_secret: owner_user_id == user_id OR role >= admin
   - edit: owner_user_id == user_id OR (visibility == "workspace" AND role >= builder)
   - test: view.allowed AND role >= builder
   - delete: owner_user_id == user_id OR role >= admin
   - manage_access: owner_user_id == user_id OR role >= admin
   - bind_to_workflow: view.allowed AND role >= builder AND scope matches target environment
```

---

## 9. Migration and rollout plan

### Phase 1: Additive (no breaking changes)

- Add `capabilities` field to `WorkflowPolicyResponse`, `StudioWorkflowBundleResponse`, `NodeEditorResponse`, `ExecutionInspectorResponse`, `VaultAssetAccessResponse`
- Keep existing flat boolean fields (`can_run`, `can_edit`, etc.)
- Frontend reads `capabilities` when present, falls back to flat booleans
- `field_sensitivity` added to `NodeEditorResponse`

### Phase 2: Frontend migration

- Replace all `can_*` boolean checks in frontend with `capabilities.*.allowed` checks
- Implement denial toast pattern for all mutation endpoints
- Implement field-level sensitivity rendering in `NodeConfigPanel.tsx`
- Add capability-driven tab state resolver for Studio inspector

### Phase 3: Backend enforcement

- Add `CapabilityDenialResponse` to all mutation endpoints
- Backend returns 403 with structured denial body when capability check fails
- Remove redundant inline permission checks, route through capability helpers
- Add `view_raw_reasoning` enforcement on execution artifact endpoints

### Phase 4: Deprecation

- Mark flat boolean fields as deprecated in API docs
- Remove deprecated fields in next major version
- Frontend drops fallback reads

---

## 10. Planning decisions still open

1. **Granular per-field capabilities vs sensitivity map**: Current design uses a sensitivity map (string → class) rather than per-field capability states. This is simpler and keeps the payload small. Revisit if a field ever needs a capability that doesn't map cleanly to its sensitivity class.

2. **Capability caching on the frontend**: Studio bundles include capabilities at load time. If the user's role changes mid-session (rare but possible), the capabilities may be stale. Options: re-fetch on mutation failure, or poll capabilities periodically. Recommend: re-fetch on 403 and merge.

3. **Workspace-level capability summary**: A workspace-level capability endpoint (what can this user do globally?) is not yet designed. Defer until navigation-level permission gating is needed.

4. **Rate-limit denial vs capability denial**: Rate-limit errors (429) should not use `capability_denied`. Keep them as standard HTTP 429 responses. Only policy and role denials use the structured format.
