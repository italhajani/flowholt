# FlowHolt Environment And Deployment Lifecycle Specification

This file defines the full workflow lifecycle from draft to production, including version management, environment promotion, approval flows, rollback, version comparison, and execution replay.

It is grounded in:
- `backend/app/models.py` — existing models: `WorkflowVersionSummary`, `WorkflowVersionDetail`, `WorkflowVersionCreateRequest`, `WorkflowPublishRequest`, `WorkflowPromotionRequest`, `WorkflowRollbackRequest`, `WorkflowEnvironmentVersion`, `WorkflowEnvironmentsResponse`, `WorkflowDeploymentSummary`, `WorkflowDeploymentDetail`, `WorkflowDeploymentReviewSummary`, `WorkflowDeploymentReviewDetail`, `WorkflowDeploymentReviewDecisionRequest`
- `backend/app/main.py` — existing policy checks: `can_promote_to_staging`, `can_publish`, `require_staging_before_production`, `require_staging_approval`, `require_production_approval`, `deployment_approval_min_role`, `allow_self_approval`, notification delivery for approval requests
- `backend/app/webhooks.py` — environment resolution: "webhook-triggered workflows run against published version"
- `backend/app/scheduler.py` — environment resolution: "production if published_version_id else draft"
- Make corpus: `research/make-help-center-export/pages_markdown/restore-and-recover-scenario.md` (version history with 60-day retention, manual save creates a version, auto-saved blueprint for recovery, recovered blueprint available in version history)
- Make corpus: `research/make-help-center-export/pages_markdown/blueprints.md` (export/import as JSON, copy to clipboard, blueprint includes modules + settings + mapped values but not connections, 2MB size limit)
- Make corpus: `research/make-help-center-export/pages_markdown/clone-a-scenario.md` (clone within team preserves connections, clone to another team requires new connections, preserve or reset polling trigger state)
- Make corpus: `research/make-help-center-export/pages_markdown/scenario-run-replay.md` (replay using trigger data from previous run, available in Builder/History/Run Details, replayed runs appear in history and consume credits, check runs and single-module runs not replayable)
- Make corpus: `research/make-help-center-export/pages_markdown/scenario-history.md` (run entries: date, name, trigger type, status, duration, operations, credits, data transfer; change log entries: scheduling changes, edits, activation; full-text execution log search on Pro+; CSV export)
- Make corpus: `research/make-help-center-export/pages_markdown/scenario-settings.md` (sequential processing, data is confidential, store incomplete executions, auto commit, max cycles, consecutive errors)

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §1 Environment model | `research/make-help-center-export/pages_markdown/restore-and-recover-scenario.md` | Make's version history (no staging concept) |
| §1 Environment model | `research/make-help-center-export/pages_markdown/blueprints.md` | Export/import as JSON |
| §2 Version management | `research/make-help-center-export/pages_markdown/restore-and-recover-scenario.md` | 60-day retention, manual save |
| §3 Approval flow | `research/make-pdf-full.txt` §Approval | Make has no approval flow — FlowHolt advantage |
| §4 Rollback | `research/make-help-center-export/pages_markdown/restore-and-recover-scenario.md` | Make: restore from version history |
| §5 Execution replay | `research/make-help-center-export/pages_markdown/scenario-run-replay.md` | Replay from History/Run Details |
| §6 History + export | `research/make-help-center-export/pages_markdown/scenario-history.md` | Run entries + change log columns |
| §7 Settings | `research/make-help-center-export/pages_markdown/scenario-settings.md` | Sequential processing, confidential, consecutive errors |
| §All | `research/n8n-docs-export/pages_markdown/source-control-environments/` | n8n's Git branch model (FlowHolt contrast) |
| §5 Visual diff | n8n source code reference | `n8n-master/packages/editor-ui/src/components/` (visual diff, green/orange/red) |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Version history entity | `n8n-master/packages/cli/src/databases/entities/WorkflowHistory.ts` |
| Workflow history controller | `n8n-master/packages/cli/src/controllers/workflow-history.controller.ts` |
| Source control module | `n8n-master/packages/cli/src/environments/source-control/` |
| Publish button states | `n8n-master/packages/editor-ui/src/components/MainHeader/WorkflowDetails.vue` |
| Header draft/publish actions | `n8n-master/packages/editor-ui/src/components/MainHeader/WorkflowHeaderDraftPublishActions.vue` |

### n8n comparison

| Feature | n8n approach | FlowHolt approach | FlowHolt advantage |
|---------|-------------|------------------|-------------------|
| Environment pipeline | Git branches + separate n8n instances | Built-in Draft→Staging→Production | No Git required; fully managed 🏆 |
| Approval gates | None | Configurable per workspace: staging approval + production approval | 🏆 |
| Visual diff | Green/orange/red node highlighting + JSON diff per node (Enterprise) | Same + built-in (not Enterprise-gated) | Parity + democratized |
| Protected production | Read-only flag per instance | Protected environment setting | Parity |
| Version retention | TTL config env var | 60-day minimum (matching Make), admin-configurable | Parity |

### Make comparison

| Feature | Make approach | FlowHolt approach |
|---------|-------------|------------------|
| Versions | Manual save creates history entry; 60 days | Auto-save + explicit version on publish |
| Environments | None (active/inactive only) | Draft/Staging/Production 🏆 |
| Approvals | None | Role-gated approval workflow 🏆 |
| Replay | Yes — in Builder, History, Run Details | Yes — same surfaces |
| Export | Blueprint JSON (no connections) | Full JSON export |
| Clone | Within-team or cross-team | Duplicate within workspace or cross-workspace |

### This file feeds into

| File | What it informs |
|------|----------------|
| `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md` | Studio publish button states + release actions |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | §7 Release and environment entities |
| `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | Environment resolution in trigger handling |
| `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Role-gated publish button visibility |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Domain 7 environment + deployment gaps |
| `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | Domain 5 decisions |

---

### Three environments

FlowHolt uses three environments for every workflow:

| Environment | Purpose | Trigger behavior | Data visibility |
|---|---|---|---|
| **Draft** | Active editing in Studio | Manual runs only | Full (unless confidential) |
| **Staging** | Pre-production validation | Manual runs + test webhooks | Full (unless confidential) |
| **Production** | Live operation | All triggers (webhook, schedule, chat, polling) | Governed by confidentiality setting |

### Current implementation

The current system tracks environments via `WorkflowEnvironmentsResponse`:
- `staging: WorkflowEnvironmentVersion | None` — version currently in staging
- `production: WorkflowEnvironmentVersion | None` — version currently in production

Each version pin records: `version_id`, `version_number`, `status` (staging/published), `promoted_at`, `created_at`.

Environment resolution in webhooks and scheduler: "production if published_version_id else draft."

### Make comparison

**Make has no formal environment system.** Scenarios have only one live version with manual save creating version history entries. There is no staging or approval flow. FlowHolt's environment system is a significant differentiation.

Make's version history:
- Manual save creates a version entry
- Version history accessible for 60 days
- Blueprint auto-saved in background (recovery, not deployment)
- Restoring a version requires manual save afterward
- No approval workflow for any version transition

FlowHolt's advantages:
- Formal draft → staging → production pipeline
- Approval workflows with role-based review
- Rollback to any previous version
- Environment-specific execution isolation
- Deployment audit trail

---

## 2. Version management

### Version lifecycle

```
Edit in Studio
    │
    ▼
Save (creates new version)
    │
    ▼
Version N (draft)
    │
    ├── Promote to Staging → Version N (staging)
    │       │
    │       ├── Approval required? → Review → Approve/Reject
    │       │
    │       └── Promote to Production → Version N (production)
    │               │
    │               ├── Approval required? → Review → Approve/Reject
    │               │
    │               └── Live (triggers active)
    │
    └── Continue editing → Save → Version N+1 (draft)
```

### Version model (existing)

```python
class WorkflowVersionSummary(BaseModel):
    id: str
    workflow_id: str
    version_number: int
    notes: str | None = None
    created_by: str | None = None
    created_at: str

class WorkflowVersionDetail(WorkflowVersionSummary):
    definition: WorkflowDefinition
```

### Planned version model extensions

```python
class WorkflowVersionSummaryExtended(WorkflowVersionSummary):
    status: Literal["draft", "staging", "production", "superseded", "archived"]
    step_count: int
    node_types_used: list[str]          # summary of node types for quick comparison
    definition_hash: str                # content hash for change detection
    promoted_to_staging_at: str | None = None
    promoted_to_production_at: str | None = None
    promoted_by_user_id: str | None = None
    promoted_by_name: str | None = None
```

### Version retention

Following Make's 60-day version history:

| Plan | Version retention |
|---|---|
| Free | 30 days |
| Starter | 60 days |
| Pro | 90 days |
| Teams | 180 days |
| Enterprise | 365 days |

Versions that are currently pinned to staging or production are never auto-pruned.

### Auto-save and recovery

Following Make's scenario recovery model:

1. Studio auto-saves a draft blueprint every 30 seconds during editing
2. If session is interrupted (browser crash, disconnect), the auto-saved blueprint is preserved
3. When user reopens the workflow, compare auto-saved vs last manual save
4. If they differ, prompt: "Unsaved changes detected. Recover?"
5. Recovered blueprint appears in version history marked as "recovered"
6. User must manually save to persist the recovered state

---

## 3. Promotion flow

### Promote to staging

```
POST /api/workflows/{id}/promote
Body: { "target_environment": "staging", "notes": "..." }
```

**Preconditions:**
1. User has role ≥ `staging_min_role` (workspace setting, default: builder)
2. If workflow uses production-scoped vault assets, user role ≥ `production_asset_min_role` (default: admin)
3. Workflow passes validation (no broken references, no missing connections)

**If `require_staging_approval` is false:**
- Version is immediately promoted to staging
- Creates a deployment record
- Previous staging version (if any) is marked as superseded

**If `require_staging_approval` is true:**
- Creates a pending deployment review
- Notifies eligible reviewers (role ≥ `deployment_approval_min_role`)
- Version is NOT promoted until approved

### Promote to production (publish)

```
POST /api/workflows/{id}/promote
Body: { "target_environment": "production", "notes": "..." }
```

**Preconditions:**
1. User has role ≥ `publish_min_role` (workspace setting, default: builder)
2. If `require_staging_before_production` is true, the version must currently be in staging
3. If workflow uses production-scoped vault assets, user role ≥ `production_asset_min_role`
4. Public webhook/chat trigger workflows must be allowed by workspace policy

**If `require_production_approval` is false:**
- Version is immediately published to production
- Creates a deployment record
- All active triggers (webhook, schedule, chat) now execute this version

**If `require_production_approval` is true:**
- Creates a pending deployment review
- Notifies eligible reviewers
- Version is NOT published until approved

### Approval flow

```python
class WorkflowDeploymentReviewSummary(BaseModel):
    id: str
    workflow_id: str
    workspace_id: str
    target_environment: Literal["staging", "production"]
    target_version_id: str
    target_version_number: int
    status: Literal["pending", "approved", "rejected"]
    requested_by_user_id: str
    reviewed_by_user_id: str | None
    notes: str | None
    decision_comment: str | None
    requested_at: str
    reviewed_at: str | None
```

**Reviewer eligibility:**
- Role ≥ `deployment_approval_min_role` (default: admin)
- If `allow_self_approval` is false, requester cannot approve their own request

**Actions:**
```
POST /api/workflows/{id}/deployment-reviews/{review_id}/approve
POST /api/workflows/{id}/deployment-reviews/{review_id}/reject
Body: { "comment": "..." }
```

On **approve**: version is promoted to the target environment, deployment record created.
On **reject**: review marked as rejected, requester notified.

---

## 4. Rollback

### Rollback model (existing)

```python
class WorkflowRollbackRequest(BaseModel):
    target_environment: Literal["staging", "production"]
    target_version_id: str | None = None    # null = rollback to previous version
    notes: str | None = None
```

### Rollback logic

```
POST /api/workflows/{id}/rollback
Body: { "target_environment": "production", "target_version_id": "...", "notes": "..." }
```

1. If `target_version_id` is null → find the most recent version that was in this environment before the current one
2. Pin the target version to the environment
3. Create a deployment record with `action: "rollback"`
4. Mark the rolled-back version as superseded

### Rollback restrictions

- Only users with role ≥ `publish_min_role` can rollback production
- Only users with role ≥ `staging_min_role` can rollback staging
- Cannot rollback to a version that has been archived
- Rollback does NOT require approval (emergency action)

### Make comparison

Make has no rollback mechanism. Users must manually restore from version history and re-save. FlowHolt's instant rollback with deployment trail is a significant advantage.

---

## 5. Deployment record

### Deployment model (existing)

```python
class WorkflowDeploymentSummary(BaseModel):
    id: str
    workflow_id: str
    workspace_id: str
    target_environment: Literal["staging", "production"]
    action: Literal["promote", "rollback", "initial"]
    from_version_id: str | None
    to_version_id: str
    from_version_number: int | None
    to_version_number: int
    deployed_by_user_id: str | None
    notes: str | None
    created_at: str

class WorkflowDeploymentDetail(WorkflowDeploymentSummary):
    from_version: WorkflowVersionSummary | None
    to_version: WorkflowVersionSummary
    can_rollback: bool = False
```

### Deployment log page

The Environment page (`/dashboard/environment`) shows:
- Current staging version per workflow
- Current production version per workflow
- Deployment history (timeline of promotions and rollbacks)
- Pending approval reviews

---

## 6. Version comparison

### Diff model

When promoting or reviewing, users need to compare versions:

```python
class VersionDiffResponse(BaseModel):
    workflow_id: str
    from_version: WorkflowVersionSummary | None    # null if first deployment
    to_version: WorkflowVersionSummary
    changes: VersionChangeSet

class VersionChangeSet(BaseModel):
    steps_added: list[StepDiffEntry]
    steps_removed: list[StepDiffEntry]
    steps_modified: list[StepModification]
    settings_changed: list[SettingChange]
    connections_changed: list[ConnectionChange]
    summary: str                                    # human-readable summary

class StepDiffEntry(BaseModel):
    step_id: str
    step_type: str
    step_label: str | None

class StepModification(BaseModel):
    step_id: str
    step_type: str
    step_label: str | None
    fields_changed: list[str]                       # field names that differ

class SettingChange(BaseModel):
    key: str
    old_value: str | None
    new_value: str | None

class ConnectionChange(BaseModel):
    step_id: str
    connection_type: str
    old_connection_id: str | None
    new_connection_id: str | None
```

### API endpoint

```
GET /api/workflows/{id}/versions/diff?from={version_id}&to={version_id}
```

### UI rendering

The version diff appears:
1. In the **promotion dialog** — shows what will change when promoting
2. In the **approval review** — shows what the reviewer is being asked to approve
3. In the **deployment detail** — shows what changed in a past deployment
4. In the **version history** — allows comparing any two versions

---

## 7. Execution replay

### Make's replay model

From Make corpus:
- Replay runs a **current version** of a scenario using **trigger data** from a previous run
- Available from: Scenario Builder ("Run with existing data"), Scenario history ("Replay run"), Run details ("Replay run")
- Replayed runs appear in history and consume credits
- Not available for check runs (polling with no data) or single-module runs
- Stored data: trigger output data, scenario inputs, variable values

### FlowHolt replay model

```python
class ExecutionReplayRequest(BaseModel):
    source_execution_id: str             # execution to replay from
    target_version: Literal["current", "specific"] = "current"
    target_version_id: str | None = None # if "specific"
    target_environment: Literal["draft", "staging", "production"] = "draft"
    notes: str | None = None

class ExecutionReplayResponse(BaseModel):
    replay_execution_id: str
    source_execution_id: str
    source_version_number: int
    target_version_number: int
    status: str
    message: str
```

### Replay rules

1. Replay uses trigger data (first step output) from the source execution
2. All subsequent steps execute against the target version
3. Replayed executions are marked with `is_replay: true` and `source_execution_id`
4. Replayed executions consume credits (matches Make)
5. Replayed executions appear in execution history
6. Cannot replay check runs or failed-at-trigger executions

### Replay in different environments

| Target environment | Use case |
|---|---|
| Draft | Test current edits with real trigger data (matches Make's "Run with existing data") |
| Staging | Validate staging version with production trigger data |
| Production | Backfill data after fixing a production bug |

---

## 8. Workflow export/import

### Following Make's blueprint model

Make exports scenarios as JSON "blueprints" containing:
- Modules and their settings
- Mapped values
- But NOT connections (must be re-created)
- 2MB size limit

FlowHolt equivalent:

```python
class WorkflowExportBundle(BaseModel):
    format_version: str                  # "1.0"
    workflow_name: str
    workflow_description: str | None
    definition: WorkflowDefinition
    settings: WorkflowSettings
    vault_references: list[VaultReference]   # vault asset IDs used (not values)
    exported_at: str
    exported_by: str | None
    source_workspace_id: str | None

class VaultReference(BaseModel):
    step_id: str
    vault_asset_id: str
    vault_asset_kind: str
    vault_asset_name: str
```

### Export endpoint

```
GET /api/workflows/{id}/export?version_id={optional}
```

Returns a JSON file download. If `version_id` is not specified, exports the current draft.

### Import endpoint

```
POST /api/workflows/import
Body: WorkflowImportRequest (contains the exported JSON)
```

On import:
1. Create a new workflow in the current workspace
2. Map vault references to existing vault assets or mark as unresolved
3. User must configure connections for any unresolved references
4. Workflow starts in draft status (not active)

---

## 9. Workflow cloning

### Following Make's clone model

Make allows cloning within the same team (preserves connections) or to another team (requires new connections).

FlowHolt equivalent:

```python
class WorkflowCloneRequest(BaseModel):
    name: str | None = None              # new name (null = "Copy of {original}")
    target_workspace_id: str | None = None  # null = same workspace
    preserve_trigger_state: bool = False    # for polling triggers
    connection_mapping: dict[str, str] | None = None  # old_connection_id -> new_connection_id
```

### Clone rules

1. **Same workspace**: Preserves vault connections, creates new webhook URLs
2. **Different workspace (same team)**: Preserves shared vault connections, creates new webhook URLs
3. **Different team**: Requires explicit connection mapping, creates new webhook URLs
4. Polling trigger state: If `preserve_trigger_state` is true, clone continues from the same cursor position

---

## 10. Execution history model

### Following Make's scenario history

Make's history entries include: date, run name, trigger type, status (Success/Warning/Error), duration, operations, credits, data transfer, source run, replay option, details link.

FlowHolt execution history already tracks most of these. Planned extensions:

```python
class ExecutionHistorySummary(BaseModel):
    id: str
    workflow_id: str
    workflow_name: str
    version_number: int
    environment: Literal["draft", "staging", "production"]
    trigger_type: str
    status: Literal["success", "warning", "error", "running", "cancelled"]
    duration_ms: int
    operations: int
    credits: int
    data_transfer_bytes: int
    is_check_run: bool = False
    is_replay: bool = False
    source_execution_id: str | None = None   # for replays
    run_name: str | None = None              # user-assigned name
    started_at: str
    completed_at: str | None
```

### Change log entries

Following Make's change log in scenario history:

```python
class WorkflowChangeLogEntry(BaseModel):
    id: str
    workflow_id: str
    event_type: Literal[
        "workflow_created", "workflow_edited", "workflow_activated",
        "workflow_deactivated", "schedule_changed", "promoted_to_staging",
        "published_to_production", "rolled_back", "approval_requested",
        "approval_approved", "approval_rejected"
    ]
    user_id: str
    user_name: str | None
    details: dict[str, Any] | None
    created_at: str
```

### History filters

Following Make:
- **Hide check runs**: Filter out polling triggers that returned no data
- **Hide change log**: Show only execution entries
- **Status filter**: Success, Warning, Error
- **Full-text search**: Search within module output data (Pro+ plan)
- **CSV export**: Download history as CSV

### History retention

| Plan | Execution log storage |
|---|---|
| Free | 5 days |
| Starter | 15 days |
| Pro | 30 days |
| Teams | 60 days |
| Enterprise | 365 days |

---

## 11. Settings governing the lifecycle

### Workspace-level settings (from file 38)

| Setting | Type | Default | Description |
|---|---|---|---|
| `staging_min_role` | WorkspaceRole | builder | Minimum role to promote to staging |
| `publish_min_role` | WorkspaceRole | builder | Minimum role to publish to production |
| `run_min_role` | WorkspaceRole | builder | Minimum role to run workflows |
| `production_asset_min_role` | WorkspaceRole | admin | Minimum role for production vault assets |
| `require_staging_before_production` | bool | false | Must pass through staging before production |
| `require_staging_approval` | bool | false | Staging promotion needs approval review |
| `require_production_approval` | bool | false | Production publish needs approval review |
| `deployment_approval_min_role` | WorkspaceRole | admin | Minimum role to approve deployments |
| `allow_self_approval` | bool | false | Requester can approve their own request |

### Workflow-level settings (overrides)

| Setting | Type | Default | Description |
|---|---|---|---|
| `sequential_processing` | bool | false | Process executions sequentially |
| `data_is_confidential` | bool | false | Suppress execution data storage |
| `store_incomplete_executions` | bool | false | Store failed runs for retry |
| `enable_data_loss` | bool | false | Allow data loss for continuous execution |
| `auto_commit` | bool | true | Commit after each step vs end of cycle |
| `max_cycles` | int | 1 | Maximum cycles per execution |
| `consecutive_error_threshold` | int | null | Auto-deactivate after N consecutive errors |

---

## 12. Notification system for deployments

### Notification events

| Event | Recipients | Channel |
|---|---|---|
| Approval requested | Users with role ≥ `deployment_approval_min_role` | In-app + email |
| Approval approved | Requester | In-app + email |
| Approval rejected | Requester | In-app + email |
| Deployed to staging | Workspace builders+ | In-app |
| Published to production | Workspace admins | In-app + email |
| Rollback executed | Workspace admins | In-app + email |
| Workflow deactivated (consecutive errors) | Workflow owner + workspace admins | In-app + email |

---

## 13. Rollout phases

### Phase 1: Core lifecycle (current — mostly complete)
- ✅ Version creation on save
- ✅ Promote to staging
- ✅ Publish to production
- ✅ Approval flow with review
- ✅ Rollback
- ✅ Deployment record and history
- ✅ Policy checks (role-based, asset-based)
- ✅ Environment resolution for webhooks and scheduler

### Phase 2: Version comparison and replay
- Version diff endpoint with step-level change detection
- Diff display in promotion dialog, approval review, deployment detail
- Execution replay from Builder, History, and Run Details
- Replay across environments (draft/staging/production)

### Phase 3: Export, import, clone
- Workflow export as JSON bundle
- Workflow import with vault reference mapping
- Workflow clone within workspace and across workspaces
- Polling trigger state preservation on clone

### Phase 4: History enhancements
- Change log entries interleaved with execution history
- Full-text execution log search (Pro+)
- CSV export of execution history
- Check run filtering

### Phase 5: Auto-save and recovery
- Draft auto-save every 30 seconds during Studio editing
- Recovery prompt on session interruption
- Recovered version in version history
- Auto-save conflict detection for multi-user editing

### Phase 6: Advanced features
- Scheduled promotions (promote at a specific time)
- Canary deployments (gradual traffic shift between versions)
- Environment-specific vault asset bindings
- Deployment webhooks (notify external systems on deployment events)

---

## 11. Scenario recovery — auto-save and recovery UX (from file 48 §7)

### Version history vs Scenario recovery — distinction

| Feature | Version history | Scenario recovery |
|---|---|---|
| When saved | Manually by user (on publish) | Automatically, continuously in background |
| Retention | Per plan (30d–365d) | Until next manual save overwrites |
| Purpose | Revert to stable known-good version | Recover work lost to session interruption |
| How to access | Version history menu | Auto-prompted on Studio reopen |
| Permanent? | Yes (until retention expires) | Only if user clicks "Recover" then saves |

### Auto-save blueprint (backend)

```python
class WorkflowAutosave(BaseModel):
    workflow_id: str
    user_id: str
    blueprint: dict[str, Any]    # serialized graph state
    blueprint_hash: str          # for comparison with saved version
    saved_at: str
```

- Auto-save triggers: after each node change (debounced 3–5 seconds), on session heartbeat, on explicit blur events
- Scoped per `(workflow_id, user_id)` to avoid one user's draft overwriting another's
- Auto-save is workspace-local — does NOT appear in version history unless "Recovered"

### Recovery detection logic (on Studio open)

```python
autosave = get_autosave(workflow_id, current_user)
latest_version = get_latest_saved_version(workflow_id)
if autosave and autosave.blueprint_hash != latest_version.blueprint_hash:
    show_recovery_dialog(autosave)
```

### Recovery dialog UI

- `WorkflowRecoveryDialog.tsx` — overlay on Studio open when unsaved draft exists
- Shows: list of detected changes (node additions/deletions, edge changes), timestamp, mini-preview
- Actions: **"Recover"** (load auto-save into canvas) / **"Not now"** (dismiss; auto-save retained temporarily in version history)
- Recovery does NOT auto-save — user must still manually save after recovering

### Auto-save and version history coexistence

- Auto-saved blueprints are NOT shown in the main version history list by default
- After recovery, they appear as a "Recovered" entry
- After manual save post-recovery, the "Recovered" entry is superseded
- The recovered blueprint is permanently deleted when the user next manually saves a new version
