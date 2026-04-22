# FlowHolt Runtime API Contracts, Permission States, And Route-Level Data Loading

This file extends the runtime-ops route spec (`32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md`) into exact API response contracts, capability-based permission states, and route-level data-loading sequences for the runtime operations family.

It is grounded in:
- `backend/app/models.py` — current Pydantic models (`ExecutionSummary`, `ExecutionPauseSummary`, `WorkflowJobSummary`, `HumanTaskSummary`, `ExecutionArtifactSummary`, `WorkflowObservabilityResponse`)
- `backend/app/main.py` — current endpoints (executions, jobs, pauses, human tasks, observability, system status)
- `src/lib/api.ts` — current frontend interfaces
- `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` — route family structure and rollout phases
- `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` — capability state types, execution capabilities
- Make help-center evidence:
  - `manage-incomplete-executions.md` — tab layout, status states, retry/resolve/delete actions
  - `scenario-run-replay.md` — replay from builder, history, and run details
  - `scenario-settings.md` — sequential processing, data confidential, incomplete execution storage

## Cross-Reference Map

### This file is grounded in (raw sources)

- `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` — Make incomplete execution management: tab layout, status states (waiting, incomplete, failed), retry/resolve/delete actions
- `research/make-help-center-export/pages_markdown/scenario-run-replay.md` — Make replay flow: replay from builder canvas, run history tab, run detail view with step output
- `research/make-help-center-export/pages_markdown/scenario-settings.md` — Make sequential processing mode and data confidentiality flag affecting execution storage and payload visibility
- `backend/app/models.py` — current FlowHolt Pydantic models: `ExecutionSummary`, `ExecutionPauseSummary`, `WorkflowJobSummary`, `HumanTaskSummary`, `ExecutionArtifactSummary`, `WorkflowObservabilityResponse`
- `backend/app/main.py` — current execution, job, pause, human task, observability, and system status endpoints

### Key n8n source code files

- `n8n-master/packages/cli/src/controllers/executions.controller.ts` — n8n execution REST controller: list, get, retry, delete endpoints and response shaping
- `n8n-master/packages/cli/src/executions/` — n8n execution service layer: filtering, pagination, status transitions
- `n8n-master/packages/cli/src/executions/execution.service.ts` — n8n execution service: data loading, pruning, and response assembly

### n8n/Make comparison

- Make: execution history UI shows status, replay, and delete per execution; no structured API contracts published; data confidentiality is a binary flag with no payload tier system
- n8n: REST executions API with pagination, filtering by status/workflow/date, and a retry endpoint; no payload sensitivity tiers, no pause/human-task separation, no capability-state fields in responses
- FlowHolt: extends n8n-style execution REST API with structured `RuntimeCapabilities` capability-state objects per response, payload redaction tiers (full/redacted/metadata-only), and dedicated pause and human-task endpoints absent from both references

### This file feeds into

- `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` — runtime ops route family consuming these API contracts
- `41-FLOWHOLT-EXECUTION-DETAIL-FRONTEND-IMPLEMENTATION.md` — execution detail frontend data loading and capability-state rendering

---

## 1. Runtime overview summary endpoint

### Purpose

Provides the aggregated runtime health data for `/dashboard/runtime`. This is the single summary endpoint that powers the overview dashboard cards and status indicators.

### Current state

No dedicated runtime summary endpoint exists. The closest approximation is `GET /api/system/status` (returns global system metrics) and `GET /api/workflows/{id}/observability` (returns per-workflow metrics). Neither provides the cross-workflow runtime summary needed.

### Proposed endpoint

```
GET /api/runtime/summary
```

### Backend response model

```python
class RuntimeQueueSummary(BaseModel):
    pending_count: int
    processing_count: int
    failed_count: int
    oldest_pending_age_seconds: int | None = None

class RuntimePauseSummary(BaseModel):
    active_pauses_count: int
    human_tasks_open_count: int
    delay_pauses_count: int
    callback_pauses_count: int
    oldest_pause_age_seconds: int | None = None

class RuntimeFailureSummary(BaseModel):
    recent_failures_count: int           # last 24h
    unresolved_failures_count: int       # failures with no retry/replay
    top_failing_workflow_id: str | None = None
    top_failing_workflow_name: str | None = None

class RuntimeWorkerSummary(BaseModel):
    active: bool
    mode: str                            # "sync", "async", "external"
    last_heartbeat_at: str | None = None
    claimed_jobs_count: int

class RuntimeAlertSummary(BaseModel):
    active_alerts_count: int
    critical_count: int
    warning_count: int

class RuntimeOverviewResponse(BaseModel):
    workspace_id: str
    queue: RuntimeQueueSummary
    pauses: RuntimePauseSummary
    failures: RuntimeFailureSummary
    worker: RuntimeWorkerSummary
    alerts: RuntimeAlertSummary
    capabilities: RuntimeCapabilities    # permission states for runtime actions
    generated_at: str
```

### Frontend TypeScript interface

```typescript
interface ApiRuntimeOverviewResponse {
  workspace_id: string;
  queue: {
    pending_count: number;
    processing_count: number;
    failed_count: number;
    oldest_pending_age_seconds: number | null;
  };
  pauses: {
    active_pauses_count: number;
    human_tasks_open_count: number;
    delay_pauses_count: number;
    callback_pauses_count: number;
    oldest_pause_age_seconds: number | null;
  };
  failures: {
    recent_failures_count: number;
    unresolved_failures_count: number;
    top_failing_workflow_id: string | null;
    top_failing_workflow_name: string | null;
  };
  worker: {
    active: boolean;
    mode: string;
    last_heartbeat_at: string | null;
    claimed_jobs_count: number;
  };
  alerts: {
    active_alerts_count: number;
    critical_count: number;
    warning_count: number;
  };
  capabilities: ApiRuntimeCapabilities;
  generated_at: string;
}
```

---

## 2. Runtime capabilities object

### Backend

```python
class RuntimeCapabilities(BaseModel):
    view_queue: CapabilityState
    manage_queue: CapabilityState          # cancel, reprioritize jobs
    view_pauses: CapabilityState
    manage_pauses: CapabilityState         # resume, cancel pauses
    view_failures: CapabilityState
    retry_failures: CapabilityState
    replay_executions: CapabilityState
    view_worker: CapabilityState
    manage_worker: CapabilityState         # pause/resume worker (future)
    view_alerts: CapabilityState
    manage_alerts: CapabilityState         # acknowledge, dismiss
    view_dead_letters: CapabilityState
    manage_dead_letters: CapabilityState   # retry, delete dead-letter items
    bulk_operations: CapabilityState       # bulk retry, bulk delete
```

### Frontend

```typescript
interface ApiRuntimeCapabilities {
  view_queue: ApiCapabilityState;
  manage_queue: ApiCapabilityState;
  view_pauses: ApiCapabilityState;
  manage_pauses: ApiCapabilityState;
  view_failures: ApiCapabilityState;
  retry_failures: ApiCapabilityState;
  replay_executions: ApiCapabilityState;
  view_worker: ApiCapabilityState;
  manage_worker: ApiCapabilityState;
  view_alerts: ApiCapabilityState;
  manage_alerts: ApiCapabilityState;
  view_dead_letters: ApiCapabilityState;
  manage_dead_letters: ApiCapabilityState;
  bulk_operations: ApiCapabilityState;
}
```

### Computation rules

| Capability | Minimum role | Additional conditions |
|---|---|---|
| `view_queue` | viewer | — |
| `manage_queue` | builder | `run_min_role` from workspace settings |
| `view_pauses` | viewer | — |
| `manage_pauses` | builder | `run_min_role` from workspace settings |
| `view_failures` | viewer | redaction: mask if `redact_execution_payloads` |
| `retry_failures` | builder | `run_min_role` from workspace settings |
| `replay_executions` | builder | `run_min_role` from workspace settings |
| `view_worker` | admin | — |
| `manage_worker` | admin | — |
| `view_alerts` | viewer | — |
| `manage_alerts` | builder | — |
| `view_dead_letters` | builder | redaction: mask if `redact_execution_payloads` |
| `manage_dead_letters` | admin | — |
| `bulk_operations` | builder | `run_min_role` from workspace settings |

---

## 3. Queue child route contract

### Route: `/dashboard/runtime/jobs`

### Endpoint

Existing: `GET /api/jobs` — returns `list[WorkflowJobSummary]`

### Proposed enhanced endpoint

```
GET /api/runtime/jobs?status=pending&status=processing&limit=100&offset=0&workflow_id=...
```

### Enhanced response model

```python
class RuntimeJobListResponse(BaseModel):
    items: list[WorkflowJobSummary]
    total_count: int
    capabilities: RuntimeCapabilities
    filters_applied: dict[str, Any]
```

### Actions per job (capability-gated)

| Action | Endpoint | Required capability | HTTP method |
|---|---|---|---|
| Cancel | `/api/jobs/{job_id}/cancel` | `manage_queue` | POST |
| Retry | `/api/jobs/{job_id}/retry` | `manage_queue` | POST |
| View execution | `/api/executions/{execution_id}` | `view_queue` | GET |

### Make evidence alignment

Make's incomplete executions tab has:
- Selection checkboxes for bulk actions
- Status column: Unresolved, Pending, In Progress, Resolved
- Actions: Retry selected, Delete selected, Detail

FlowHolt's queue view should mirror this with:
- Selection checkboxes
- Status column: pending, processing, completed, failed, cancelled
- Actions: Cancel selected, Retry selected, View details

---

## 4. Pauses child route contract

### Route: `/dashboard/runtime/pauses`

### Endpoint

Existing: No dedicated list endpoint for pauses. Currently individual pause retrieval via `GET /api/executions/{id}/pause`.

### Proposed endpoint

```
GET /api/runtime/pauses?status=paused&wait_type=human&limit=50&offset=0
```

### Response model

```python
class RuntimePauseListResponse(BaseModel):
    items: list[ExecutionPauseSummary]
    total_count: int
    human_tasks: list[HumanTaskSummary]    # associated tasks for human pauses
    capabilities: RuntimeCapabilities
```

### Sub-views

The pauses route needs two rendering modes:

**All pauses view** — shows delay, callback, and human pauses in a unified table.

**Human tasks focus** — shows only human-type pauses with task assignment, priority, and action columns.

### Actions per pause (capability-gated)

| Action | Endpoint | Required capability | Condition |
|---|---|---|---|
| Resume (delay/callback) | `/api/executions/{id}/resume` | `manage_pauses` | status == "paused" |
| Cancel (any) | `/api/executions/{id}/cancel` | `manage_pauses` | status == "paused" |
| Complete human task | `/api/human-tasks/{id}/complete` | `manage_pauses` | task status == "open" |
| Cancel human task | `/api/human-tasks/{id}/cancel` | `manage_pauses` | task status == "open" |

### Make evidence alignment

Make does not have a dedicated pauses view. Pause management is done inline in the scenario builder and execution history. FlowHolt elevates pauses to a first-class operational view because FlowHolt supports human tasks, delay waits, and callback waits as core node types.

---

## 5. Failures child route contract

### Route: `/dashboard/runtime/failures`

### Endpoint

Existing: `GET /api/executions?status=failed` — filters executions by status.

### Proposed endpoint

```
GET /api/runtime/failures?resolved=false&workflow_id=...&limit=50&offset=0&since=2024-01-01T00:00:00Z
```

### Response model

```python
class RuntimeFailureItem(BaseModel):
    execution: ExecutionSummary
    workflow_name: str
    error_category: str | None = None      # "connection", "rate_limit", "runtime", "data", "timeout"
    retryable: bool
    retry_count: int
    last_retry_at: str | None = None
    resolved: bool

class RuntimeFailureListResponse(BaseModel):
    items: list[RuntimeFailureItem]
    total_count: int
    unresolved_count: int
    capabilities: RuntimeCapabilities
    top_error_categories: list[dict[str, Any]]    # [{category: "connection", count: 12}, ...]
```

### Actions per failure (capability-gated)

| Action | Endpoint | Required capability |
|---|---|---|
| Retry | `/api/executions/{id}/retry` | `retry_failures` |
| Replay | `/api/executions/{id}/replay` | `replay_executions` |
| Delete | `/api/executions/{id}` (DELETE) | `bulk_operations` (admin) |
| View details | `/api/executions/{id}/bundle` | `view_failures` |

### Error categorization

The `error_category` field is derived from the execution's `error_text` using pattern matching:

| Pattern | Category |
|---|---|
| Connection refused, timeout, DNS | `connection` |
| 429, rate limit, throttle | `rate_limit` |
| RuntimeError, script error | `runtime` |
| Missing field, invalid type, validation | `data` |
| Execution timeout exceeded | `timeout` |
| All others | `unknown` |

### Make evidence alignment

Make categorizes errors into:
- ConnectionError → retry-eligible
- RateLimitError → retry-eligible
- RuntimeError → manual resolve required
- DataError → manual resolve required

FlowHolt should mirror this with the `retryable` boolean per failure item. The UI should highlight retryable failures with a "Retry" button and non-retryable ones with a "Resolve" action that opens the Studio.

---

## 6. Workers child route contract

### Route: `/dashboard/runtime/workers`

### Endpoint

Existing: `GET /api/system/status` includes worker status. `POST /api/system/process-jobs` triggers job processing.

### Proposed endpoint

```
GET /api/runtime/workers
```

### Response model

```python
class RuntimeWorkerDetail(BaseModel):
    worker_id: str
    mode: str
    active: bool
    last_heartbeat_at: str | None = None
    claimed_jobs_count: int
    completed_jobs_count: int
    failed_jobs_count: int
    uptime_seconds: int | None = None

class RuntimeWorkersResponse(BaseModel):
    workers: list[RuntimeWorkerDetail]
    scheduler_active: bool
    last_scheduled_run_at: str | None = None
    next_scheduled_run_at: str | None = None
    capabilities: RuntimeCapabilities
```

### Actions (capability-gated)

| Action | Endpoint | Required capability |
|---|---|---|
| Trigger job processing | `/api/system/process-jobs` | `manage_worker` |
| Trigger scheduled runs | `/api/system/run-scheduled` | `manage_worker` |
| Resume paused executions | `/api/system/resume-paused` | `manage_worker` |

---

## 7. Alerts child route contract

### Route: `/dashboard/runtime/alerts`

### Current state

No dedicated alert model or endpoint exists. Notifications (`/api/notifications`) serve as a general-purpose notification system but are not specifically runtime alerts.

### Proposed endpoint

```
GET /api/runtime/alerts?severity=critical&acknowledged=false&limit=50
```

### Response model

```python
class RuntimeAlertItem(BaseModel):
    id: str
    workspace_id: str
    severity: Literal["critical", "warning", "info"]
    category: str                          # "failure_spike", "queue_backlog", "worker_down", "pause_timeout", "dead_letter"
    title: str
    message: str
    workflow_id: str | None = None
    execution_id: str | None = None
    acknowledged: bool
    acknowledged_by_user_id: str | None = None
    triggered_at: str
    acknowledged_at: str | None = None
    auto_resolved: bool = False
    resolved_at: str | None = None

class RuntimeAlertListResponse(BaseModel):
    items: list[RuntimeAlertItem]
    total_count: int
    unacknowledged_count: int
    capabilities: RuntimeCapabilities
```

### Alert trigger rules

| Category | Trigger condition | Severity |
|---|---|---|
| `failure_spike` | >5 failures in 10 minutes for same workflow | critical |
| `queue_backlog` | >50 pending jobs OR oldest pending >30 minutes | warning |
| `worker_down` | Worker heartbeat missing >5 minutes | critical |
| `pause_timeout` | Pause active >24 hours (configurable) | warning |
| `dead_letter` | New dead-letter item created | warning |
| `sequential_blocked` | Sequential processing workflow has unresolved failures | warning |

### Alert delivery layers (from file 32)

1. **In-app badge** — Runtime nav item shows unacknowledged count
2. **Notification** — Creates a standard notification entry
3. **Email** — Sent if `notify_on_failure` is enabled in workspace settings
4. **Webhook** (future) — External alert delivery

### Actions (capability-gated)

| Action | Endpoint | Required capability |
|---|---|---|
| Acknowledge | `POST /api/runtime/alerts/{id}/acknowledge` | `manage_alerts` |
| Dismiss | `DELETE /api/runtime/alerts/{id}` | `manage_alerts` |

---

## 8. Dead-letter child route contract

### Route: `/dashboard/runtime/dead-letters`

### Current state

No dead-letter concept exists in the current backend. The closest analog is failed jobs that have exhausted retry attempts.

### Proposed endpoint

```
GET /api/runtime/dead-letters?limit=50&offset=0
```

### Dead-letter object shape (from file 32, now concrete)

```python
class DeadLetterItem(BaseModel):
    id: str
    workspace_id: str
    workflow_id: str
    workflow_name: str
    execution_id: str | None = None
    job_id: str | None = None
    source: Literal["job_exhausted", "execution_unrecoverable", "webhook_rejected", "manual"]
    error_text: str | None = None
    error_category: str | None = None
    payload_snapshot: dict[str, Any]       # redacted if confidentiality_policy
    retry_count: int
    max_retries: int
    status: Literal["pending", "retried", "deleted", "resolved"]
    created_at: str
    resolved_at: str | None = None

class DeadLetterListResponse(BaseModel):
    items: list[DeadLetterItem]
    total_count: int
    pending_count: int
    capabilities: RuntimeCapabilities
```

### Dead-letter creation rules

A dead-letter item is created when:
1. A job exhausts `max_attempts` and the last attempt fails
2. An execution fails with an unrecoverable error and `store_incomplete_executions` is enabled but the error is not retryable
3. A webhook is rejected after validation (signature mismatch, payload validation failure)

### Actions (capability-gated)

| Action | Endpoint | Required capability |
|---|---|---|
| Retry | `POST /api/runtime/dead-letters/{id}/retry` | `manage_dead_letters` |
| Delete | `DELETE /api/runtime/dead-letters/{id}` | `manage_dead_letters` |
| Bulk retry | `POST /api/runtime/dead-letters/bulk-retry` | `bulk_operations` |
| Bulk delete | `POST /api/runtime/dead-letters/bulk-delete` | `bulk_operations` |

### Make evidence alignment

Make's incomplete executions system serves a similar purpose:
- Stores failed execution data for later retry or manual resolution
- Shows ID, created timestamp, size, status (Unresolved, Pending, In Progress, Resolved)
- Supports retry, resolve, and delete actions
- Sequential processing blocks new executions until incompletes are resolved

FlowHolt's dead-letter system is more explicit and separates "incomplete execution retry" from "dead letter" to provide clearer operational semantics.

---

## 9. Route-level data loading sequences

Each runtime route follows a standard loading sequence that fetches capabilities first, then data.

### `/dashboard/runtime` (overview)

```
1. GET /api/runtime/summary
   → RuntimeOverviewResponse (includes capabilities)
2. Render overview cards from summary
3. If capabilities.view_alerts.allowed → show alert badge
4. Poll every 30 seconds
```

### `/dashboard/runtime/jobs`

```
1. GET /api/runtime/summary (cached from overview, or fresh)
   → Extract capabilities
2. GET /api/runtime/jobs?status=pending&status=processing&limit=50
   → RuntimeJobListResponse
3. Render table with action buttons gated by capabilities.manage_queue
4. If capabilities.bulk_operations.allowed → show bulk action checkboxes
5. Poll every 15 seconds for active status updates
```

### `/dashboard/runtime/pauses`

```
1. GET /api/runtime/summary (cached)
   → Extract capabilities
2. GET /api/runtime/pauses?status=paused&limit=50
   → RuntimePauseListResponse (includes human tasks)
3. Render pauses table
4. For human-type pauses: render task assignment and action columns
5. If capabilities.manage_pauses.allowed → show Resume/Cancel/Complete buttons
6. Poll every 30 seconds
```

### `/dashboard/runtime/failures`

```
1. GET /api/runtime/summary (cached)
   → Extract capabilities
2. GET /api/runtime/failures?resolved=false&limit=50
   → RuntimeFailureListResponse
3. Render failures table with error category badges
4. If item.retryable AND capabilities.retry_failures.allowed → show Retry button
5. If capabilities.replay_executions.allowed → show Replay button
6. If capabilities.view_failures.redaction == "mask" → redact error_text and payload previews
7. No automatic polling; user refreshes manually
```

### `/dashboard/runtime/workers`

```
1. GET /api/runtime/summary (cached)
   → Extract capabilities
2. If NOT capabilities.view_worker.allowed → show "Insufficient permissions" message
3. GET /api/runtime/workers
   → RuntimeWorkersResponse
4. Render worker status cards
5. If capabilities.manage_worker.allowed → show "Trigger Job Processing" button
6. Poll every 60 seconds
```

### `/dashboard/runtime/alerts`

```
1. GET /api/runtime/summary (cached)
   → Extract capabilities
2. GET /api/runtime/alerts?acknowledged=false&limit=50
   → RuntimeAlertListResponse
3. Render alerts list with severity badges
4. If capabilities.manage_alerts.allowed → show Acknowledge/Dismiss buttons
5. Poll every 30 seconds for new alerts
```

### `/dashboard/runtime/dead-letters`

```
1. GET /api/runtime/summary (cached)
   → Extract capabilities
2. If NOT capabilities.view_dead_letters.allowed → show "Insufficient permissions" message
3. GET /api/runtime/dead-letters?limit=50
   → DeadLetterListResponse
4. Render table with payload preview (masked if redaction applies)
5. If capabilities.manage_dead_letters.allowed → show Retry/Delete buttons
6. If capabilities.bulk_operations.allowed → show bulk action checkboxes
7. No automatic polling
```

---

## 10. Execution replay API contract (refined)

### Current state

Existing endpoint: `POST /api/executions/{id}/replay`
Request model: `ExecutionReplayRequest` (mode, queued, payload_override)
Response model: `ExecutionReplayResponse` (mode, queued, execution, job)

### Enhancements needed

The current endpoint is functional but needs capability gating and enhanced response.

### Enhanced response

```python
class ExecutionReplayResponse(BaseModel):
    mode: ExecutionReplayMode
    queued: bool
    execution: ExecutionSummary | None = None
    job: WorkflowJobSummary | None = None
    original_execution_id: str
    original_trigger_data_available: bool
    warnings: list[str]
```

### Make evidence alignment

Make's replay system stores:
- Trigger output data
- Scenario inputs
- Most up-to-date variable values

FlowHolt should store:
- Trigger step output (the `output` from the first step result)
- Workflow input payload
- Current variable values from vault

Replay constraints matching Make:
- Replay is available as long as execution is in history (retention policy)
- Check runs (polling triggers with no data) cannot be replayed
- Single-module runs cannot be replayed
- Bulk replay is not supported in Phase 1

---

## 11. Navigation placement

### Sidebar entry

```
Dashboard
├── Overview
├── Workflows
├── Executions        (existing — remains, links to full execution history)
├── Runtime           (NEW — overview and child routes)
│   ├── Queue
│   ├── Pauses
│   ├── Failures
│   ├── Workers
│   ├── Alerts
│   └── Dead Letters
├── Vault
├── Settings
└── System Status
```

### Badge indicators on sidebar

| Item | Badge content | Condition |
|---|---|---|
| Runtime | Unacknowledged alert count | `alerts.active_alerts_count > 0` |
| Queue (child) | Pending job count | `queue.pending_count > 0` |
| Pauses (child) | Active pause count | `pauses.active_pauses_count > 0` |
| Failures (child) | Unresolved failure count | `failures.unresolved_failures_count > 0` |

---

## 12. Permission state examples per role

### Viewer

```json
{
  "view_queue": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_queue": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot manage the job queue.", "redaction": "none" },
  "view_pauses": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_pauses": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot manage pauses.", "redaction": "none" },
  "view_failures": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "retry_failures": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot retry failed executions.", "redaction": "none" },
  "replay_executions": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot replay executions.", "redaction": "none" },
  "view_worker": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot view worker status.", "redaction": "none" },
  "manage_worker": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot manage workers.", "redaction": "none" },
  "view_alerts": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_alerts": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot manage alerts.", "redaction": "none" },
  "view_dead_letters": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot view dead letters.", "redaction": "none" },
  "manage_dead_letters": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot manage dead letters.", "redaction": "none" },
  "bulk_operations": { "allowed": false, "reason": "role_insufficient", "message": "Viewers cannot perform bulk operations.", "redaction": "none" }
}
```

### Builder

```json
{
  "view_queue": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_queue": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "view_pauses": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_pauses": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "view_failures": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "retry_failures": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "replay_executions": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "view_worker": { "allowed": false, "reason": "role_insufficient", "message": "Only admins can view worker status.", "redaction": "none" },
  "manage_worker": { "allowed": false, "reason": "role_insufficient", "message": "Only admins can manage workers.", "redaction": "none" },
  "view_alerts": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_alerts": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "view_dead_letters": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_dead_letters": { "allowed": false, "reason": "role_insufficient", "message": "Only admins can manage dead letters.", "redaction": "none" },
  "bulk_operations": { "allowed": true, "reason": null, "message": null, "redaction": "none" }
}
```

### Builder with confidentiality policy

```json
{
  "view_queue": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_queue": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "view_pauses": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_pauses": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "view_failures": { "allowed": true, "reason": null, "message": null, "redaction": "mask" },
  "retry_failures": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "replay_executions": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "view_worker": { "allowed": false, "reason": "role_insufficient", "message": "Only admins can view worker status.", "redaction": "none" },
  "manage_worker": { "allowed": false, "reason": "role_insufficient", "message": "Only admins can manage workers.", "redaction": "none" },
  "view_alerts": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "manage_alerts": { "allowed": true, "reason": null, "message": null, "redaction": "none" },
  "view_dead_letters": { "allowed": true, "reason": null, "message": null, "redaction": "mask" },
  "manage_dead_letters": { "allowed": false, "reason": "role_insufficient", "message": "Only admins can manage dead letters.", "redaction": "none" },
  "bulk_operations": { "allowed": true, "reason": null, "message": null, "redaction": "none" }
}
```

---

## 13. Rollout phases

### Phase 1: Foundation

- Implement `GET /api/runtime/summary` endpoint
- Implement `GET /api/runtime/jobs` with filtering (extend existing `/api/jobs`)
- Implement `GET /api/runtime/pauses` (new list endpoint)
- Implement `GET /api/runtime/failures` (new filtered failures endpoint)
- Add `RuntimeCapabilities` to summary response
- Create `/dashboard/runtime` overview page
- Create `/dashboard/runtime/jobs`, `/dashboard/runtime/pauses`, `/dashboard/runtime/failures` pages
- Add sidebar entry with badge indicators

### Phase 2: Operations

- Implement dead-letter model and storage
- Implement `GET /api/runtime/dead-letters` endpoint
- Implement dead-letter creation triggers (job exhaustion, unrecoverable errors)
- Create `/dashboard/runtime/dead-letters` page
- Implement alert model and storage
- Implement `GET /api/runtime/alerts` endpoint
- Implement alert trigger rules
- Create `/dashboard/runtime/alerts` page
- Add bulk operations (bulk retry, bulk delete) to failures and dead-letters

### Phase 3: Advanced

- Implement `/dashboard/runtime/workers` page
- Add worker heartbeat monitoring
- Implement alert delivery layers (email, webhook)
- Add execution replay enhancements (original trigger data preview, bulk replay)
- Add runtime dashboard polling with configurable intervals
- Integrate runtime badges into Studio status bar

---

## 14. Relationship to existing routes

The runtime route family does **not** replace existing routes. It provides focused operational views that aggregate data from existing models.

| Existing route | Relationship |
|---|---|
| `/dashboard/executions` | Remains as full execution history. Runtime/failures is a filtered, action-oriented subset. |
| `/dashboard/overview` | Remains as general dashboard. Runtime summary data may be shown as a card on overview. |
| Execution detail page | Unchanged. Runtime views link into execution detail for drill-down. |
| Studio status bar | May show runtime alerts badge. Links to `/dashboard/runtime/alerts`. |

---

## 15. Planning decisions still open

1. **Alert persistence**: Alerts could be stored in a dedicated table or derived from execution events on-the-fly. Dedicated table is recommended for performance and acknowledgment tracking.

2. **Dead-letter payload storage**: Storing the full payload snapshot requires storage management. Consider a retention policy (e.g., 30 days, configurable) and a size cap per item.

3. **Real-time updates**: The current polling approach is simple. WebSocket or SSE could provide real-time updates for the runtime dashboard. Defer to Phase 3.

4. **Cross-workflow runtime summary vs per-workflow**: The `/api/runtime/summary` endpoint is workspace-wide. A per-workflow runtime summary could reuse `WorkflowObservabilityResponse`. Consider adding a `workflow_id` filter to runtime endpoints for drill-down.

5. **Sequential processing integration**: When a workflow has sequential processing enabled and unresolved failures exist, the runtime view should show a prominent "Sequential Processing Blocked" banner. This requires checking workflow settings alongside failure state.
