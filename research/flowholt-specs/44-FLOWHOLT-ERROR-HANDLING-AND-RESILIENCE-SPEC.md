# FlowHolt Error Handling And Resilience Specification

This file defines the error handling model, error handler types, retry strategies, incomplete executions, dead-letter processing, and circuit-breaker behavior for FlowHolt workflows.

It is grounded in:
- Make corpus: `research/make-help-center-export/pages_markdown/overview-of-error-handling.md` — 5 error handlers (Ignore, Resume, Commit, Rollback, Break), error handling route, scenario settings that impact error handling
- Make corpus: `research/make-help-center-export/pages_markdown/quick-error-handling-reference.md` — quick comparison table of all 5 handlers
- Make corpus: `research/make-help-center-export/pages_markdown/break-error-handler.md` — stores incomplete executions, automatic retry, manual resolution, removes erroring bundle but processes remaining bundles
- Make corpus: `research/make-help-center-export/pages_markdown/commit-error-handler.md` — stops scenario, commits ACID changes, does not process remaining bundles, scenario ends with "success" status
- Make corpus: `research/make-help-center-export/pages_markdown/ignore-error-handler.md` — ignores error, removes bundle from flow, processes remaining bundles, scenario ends with "success" status
- Make corpus: `research/make-help-center-export/pages_markdown/resume-error-handler.md` — replaces module output with substitute mapping, processes remaining bundles, scenario ends with "success" status
- Make corpus: `research/make-help-center-export/pages_markdown/rollback-error-handler.md` — stops scenario, reverts ACID changes, does not process remaining bundles, scenario ends with "error" status, default when no error handler and incomplete executions disabled
- Make corpus: `research/make-help-center-export/pages_markdown/types-of-errors.md` — 11 error types with descriptions, default handling, and solutions
- Make corpus: `research/make-help-center-export/pages_markdown/exponential-backoff.md` — 8-attempt rerun schedule with two modes (incomplete executions enabled/disabled)
- Make corpus: `research/make-help-center-export/pages_markdown/throw.md` — workaround for conditional error throwing (not a built-in feature)
- Make corpus: `research/make-help-center-export/pages_markdown/flow-control.md` — Repeater, Iterator, Array Aggregator for flow control
- `backend/app/studio_nodes.py` — existing error handling fields: `_retry_on_fail`, `_retry_count`, `_retry_wait_ms`, `_retry_backoff` (fixed/exponential/exponential_jitter), `_timeout_seconds`
- `backend/app/node_registry.py` — HTTP request node: `retry_on_fail`, `retry_count`, `retry_wait_ms`
- `backend/app/models.py` — existing `ExecutionStatus` (success, failed, running, paused, cancelled)

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §1 Error types | `research/make-help-center-export/pages_markdown/types-of-errors.md` | 11 Make error types + solutions |
| §2 Error handlers | `research/make-help-center-export/pages_markdown/overview-of-error-handling.md` | 5 handler types (Ignore/Resume/Commit/Rollback/Break) |
| §2 Ignore | `research/make-help-center-export/pages_markdown/ignore-error-handler.md` | Skip bundle, continue |
| §2 Resume | `research/make-help-center-export/pages_markdown/resume-error-handler.md` | Substitute mapping |
| §2 Commit | `research/make-help-center-export/pages_markdown/commit-error-handler.md` | ACID commit, stop |
| §2 Rollback | `research/make-help-center-export/pages_markdown/rollback-error-handler.md` | ACID rollback, stop |
| §2 Break | `research/make-help-center-export/pages_markdown/break-error-handler.md` | Store incomplete, retry |
| §3 Retry + backoff | `research/make-help-center-export/pages_markdown/exponential-backoff.md` | 8-attempt schedule |
| §4 Incomplete executions | `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` | Manual retry, bulk resolution |
| §4 Retry schedule | `research/make-help-center-export/pages_markdown/incomplete-executions-retry.md` | Auto-retry timing |
| §5 Error workflow | `research/make-help-center-export/pages_markdown/scenarios.md` §Error workflow | Error scenario pattern |
| §6 n8n error modes | `research/n8n-docs-export/pages_markdown/flow-logic/error-handling.md` | `continue_with_error` mode |
| §6 n8n On Error | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.errorTrigger.md` | Error Trigger node |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| `continue_with_error` mode | `n8n-master/packages/workflow/src/Interfaces.ts` → `INodeParameters.onError` |
| Error trigger node | `n8n-master/packages/nodes-base/nodes/ErrorTrigger/ErrorTrigger.node.ts` |
| Stop and Error node | `n8n-master/packages/nodes-base/nodes/StopAndError/StopAndError.node.ts` |
| Execution retry logic | `n8n-master/packages/cli/src/execution-lifecycle-hooks.ts` |
| Error workflow assignment | `n8n-master/packages/workflow/src/WorkflowDataProxy.ts` |

### n8n comparison

| Feature | Make | n8n | FlowHolt |
|---------|------|-----|----------|
| Error handler types | 5 handlers per module | 3 modes per node | 5 Make handlers + n8n `continue_with_error` |
| Error output path | Separate "error handling route" | `continue_with_error` adds error output port | Both: per-node output + workflow-level error route |
| Error Trigger node | Error workflow concept | `n8n-nodes-base.errorTrigger` | Implement Error Trigger (see `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`) |
| Stop and Error node | No equivalent | `n8n-nodes-base.stopAndError` | Implement `stop_and_error` node type |
| Retry on fail | Exponential backoff | Per-node retry count + interval | Combine: per-node retry (`_retry_on_fail`) + workflow-level incomplete execution retry |

### This file feeds into

| File | What it informs |
|------|----------------|
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | Error Trigger, Stop and Error node status |
| `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` | Dead-letter queue, incomplete execution retry |
| `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md` | Consecutive error auto-deactivation |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | `RetryRecord`, `ExecutionPause` entities |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Error handling as a backend domain |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Domain 5 execution gaps (`continue_with_error`) |

---

## 1. Error type taxonomy

### Make's error types

Make defines 11 error types. FlowHolt adopts all relevant types and adds platform-specific ones.

| Error type | HTTP equivalent | Retryable | Auto-deactivate | Make behavior |
|---|---|---|---|---|
| AccountValidationError | 401, 403 | No | Immediately | Cannot be handled by error handler; happens during initialization |
| BundleValidationError | — | No | After N consecutive | Input data fails validation before processing |
| ConnectionError | 502, 503, 504 | Yes | After 8 retries | Exponential backoff; 20-min pause for scheduled scenarios |
| DataError | — | No | After N consecutive | Third-party rejects data (e.g. too long, wrong format) |
| DataSizeLimitExceededError | — | No | Immediately (fatal) | Quota exceeded |
| DuplicateDataError | 409 | No | After N consecutive | Duplicate record rejected by third party |
| IncompleteDataError | — | Yes (delayed) | After N consecutive + 20-min pause | Partial data from third party |
| InconsistencyError | — | No | Immediately (fatal) | Rollback conflict in data store |
| MaxFileSizeExceededError | — | No | After N consecutive | File exceeds plan limit |
| ModuleTimeoutError | — | Yes | After 8 retries | No response within timeout (40-60s) |
| OperationsLimitExceededError | — | No | Immediately (fatal) | Credits exhausted |
| RateLimitError | 429 | Yes | After 8 retries | Exponential backoff; 20-min pause for scheduled |
| RuntimeError | — | Depends | After N consecutive | Catch-all for uncategorized errors |

### FlowHolt error type extensions

| Error type | Description | Retryable |
|---|---|---|
| VaultConnectionError | Vault asset connection test failed | Yes (after reauthorization) |
| WorkflowValidationError | Workflow definition has broken references or missing required config | No |
| PolicyDeniedError | Action denied by workspace/org policy | No |
| CreditLimitError | Equivalent of OperationsLimitExceededError | No (fatal) |
| StepTimeoutError | Step exceeded `_timeout_seconds` | Yes (with retry config) |
| CircuitOpenError | Circuit breaker tripped for integration | Yes (after cooldown) |

### Error classification in FlowHolt

```python
class ExecutionError(BaseModel):
    error_type: str                          # e.g. "ConnectionError"
    error_code: str | None = None            # HTTP status or custom code
    message: str
    step_id: str | None = None               # which step failed
    step_label: str | None = None
    module_type: str | None = None            # node type that failed
    retryable: bool = False
    fatal: bool = False                       # immediately deactivates workflow
    timestamp: str
    context: dict[str, Any] = {}              # additional metadata
```

---

## 2. Error handler types

### 5 error handlers aligned with Make

FlowHolt implements all 5 Make error handler types as per-step configuration in the Studio:

| Handler | Execution continues? | Remaining bundles? | ACID behavior | Final status | Use case |
|---|---|---|---|---|---|
| **Ignore** | No (bundle dropped) | Yes | No change | success | Non-critical data; keep workflow running |
| **Resume** | Yes (substitute data) | Yes | No change | success | Provide fallback value; continue processing |
| **Commit** | No (stops) | No | Commit | success | Save partial work; stop cleanly |
| **Rollback** | No (stops) | No | Revert | error | Undo all changes; stop |
| **Break** | No (stored as incomplete) | Yes | No change | warning | Store for later retry; process remaining |

### Default behavior (no error handler configured)

When no error handler is configured and incomplete executions are disabled:
- **Rollback** is the implicit default (matches Make)
- Scenario stops with "error" status
- Consecutive error counter increments

### Error handler model

```python
class StepErrorHandler(BaseModel):
    handler_type: Literal["ignore", "resume", "commit", "rollback", "break"]
    filter: ErrorFilter | None = None         # optional: only handle specific error types
    resume_mapping: dict[str, Any] | None = None  # for Resume handler
    break_auto_retry: bool = False            # for Break handler
    break_max_attempts: int = 3               # for Break handler auto-retry
    break_retry_delays: list[int] = [300, 600, 900]  # seconds between attempts

class ErrorFilter(BaseModel):
    error_types: list[str] = []               # e.g. ["DataError", "DuplicateDataError"]
    match_mode: Literal["include", "exclude"] = "include"
```

### Error handling route

Following Make's model:
1. Error handler attaches to any step
2. The error handling route is a **separate branch** from the step
3. Modules can be placed between the step and the error handler (e.g. a Slack notification step before the Ignore handler)
4. If no module in the error handling route outputs an error, Make ignores the error (FlowHolt matches this)
5. If a module in the error handling route itself errors, the execution ends with an error

### Throw (conditional error)

Make does not have a built-in Throw handler. FlowHolt adds one:

```python
class ThrowErrorConfig(BaseModel):
    error_type: str = "RuntimeError"
    message: str
    condition: str | None = None              # expression that evaluates to boolean
```

This allows workflow authors to intentionally raise errors to trigger error handling routes.

---

## 3. Step-level retry configuration

### Existing implementation

FlowHolt already has per-step retry configuration:

```python
# From studio_nodes.py — common Error Handling fields
_retry_on_fail: bool = False
_retry_count: int = 3          # 1-10
_retry_wait_ms: int = 1000     # 100-60000
_retry_backoff: Literal["fixed", "exponential", "exponential_jitter"] = "fixed"
_timeout_seconds: int           # step-level timeout
```

### Planned enhancements

```python
class StepRetryConfig(BaseModel):
    enabled: bool = False
    max_attempts: int = 3
    wait_ms: int = 1000
    backoff: Literal["fixed", "exponential", "exponential_jitter"] = "fixed"
    retryable_errors: list[str] | None = None     # null = all retryable types
    non_retryable_errors: list[str] | None = None  # explicit exclusions
```

### Retry behavior

1. Step executes
2. If error occurs and `retry_on_fail` is true:
   a. Check if error type is retryable
   b. Wait `_retry_wait_ms` (adjusted by backoff strategy)
   c. Retry up to `_retry_count` times
3. If all retries exhausted:
   a. Check for error handler on the step
   b. If no handler: use workflow-level behavior (incomplete executions or default rollback)

---

## 4. Scenario-level exponential backoff

### Make's backoff schedule

Make applies scenario-level exponential backoff for ConnectionError and ModuleTimeoutError:

| Rerun | Incomplete executions enabled | Incomplete executions disabled |
|---|---|---|
| 1 | 1 min | 1 min |
| 2 | 10 min | 2 min |
| 3 | 10 min | 5 min |
| 4 | 30 min | 10 min |
| 5 | 30 min | 1 hour |
| 6 | 30 min | 3 hours |
| 7 | 3 hours | 12 hours |
| 8 | 3 hours | 24 hours |

After 8 failed reruns → workflow deactivated.

### FlowHolt scenario-level backoff

FlowHolt adopts Make's schedule with minor extensions:

```python
class WorkflowBackoffConfig(BaseModel):
    schedule_with_incomplete: list[int] = [60, 600, 600, 1800, 1800, 1800, 10800, 10800]
    schedule_without_incomplete: list[int] = [60, 120, 300, 600, 3600, 10800, 43200, 86400]
    max_attempts: int = 8
    applicable_errors: list[str] = ["ConnectionError", "ModuleTimeoutError"]
```

**Behavior:**
- Scheduled workflow: pause scheduling for 20 minutes on retryable error, then follow backoff schedule
- Webhook-triggered workflow: immediate backoff rerun from incomplete execution data
- If `sequential_processing` is enabled, next run waits for backoff reruns to complete

---

## 5. Incomplete executions

### Make's model

- Stores the scenario state when an error occurs
- Allows manual resolution or automatic retry (with Break handler)
- Must be enabled in scenario settings
- Not stored when: error on first module (unless Break handler), storage full
- Storage full + data loss disabled → scenario disabled
- Storage full + data loss enabled → data discarded, scenario continues

### FlowHolt incomplete execution model

```python
class IncompleteExecution(BaseModel):
    id: str
    workflow_id: str
    workspace_id: str
    execution_id: str
    version_number: int
    environment: Literal["draft", "staging", "production"]
    error: ExecutionError
    step_state: dict[str, Any]          # serialized execution state at failure point
    trigger_data: dict[str, Any]        # original trigger payload
    remaining_steps: list[str]          # step IDs not yet executed
    retry_count: int = 0
    max_retries: int | None = None      # from Break handler config
    next_retry_at: str | None = None    # scheduled retry time
    status: Literal["pending", "retrying", "resolved", "expired", "discarded"]
    created_at: str
    resolved_at: str | None = None
    resolved_by: str | None = None      # user who resolved manually
```

### Incomplete execution settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `store_incomplete_executions` | bool | false | Enable incomplete execution storage |
| `enable_data_loss` | bool | false | Discard data if storage full instead of deactivating |
| `sequential_processing` | bool | false | Wait for incomplete resolution before next run |

### Storage limits

| Plan | Max incomplete executions |
|---|---|
| Free | 10 |
| Starter | 100 |
| Pro | 500 |
| Teams | 2,000 |
| Enterprise | 10,000 |

### Manual resolution

```
GET  /api/workflows/{id}/incomplete-executions
GET  /api/workflows/{id}/incomplete-executions/{ie_id}
POST /api/workflows/{id}/incomplete-executions/{ie_id}/retry
POST /api/workflows/{id}/incomplete-executions/{ie_id}/resolve    # mark as resolved without retry
DELETE /api/workflows/{id}/incomplete-executions/{ie_id}          # discard
POST /api/workflows/{id}/incomplete-executions/bulk-retry         # retry multiple
```

---

## 6. Dead-letter system

### Sources of dead-letter items

Dead-letter items are created from three sources (defined in file 35):

1. **Job exhaustion** — job exceeded max retry attempts in the queue
2. **Unrecoverable execution errors** — fatal errors that cannot be retried (InconsistencyError, OperationsLimitExceededError, DataSizeLimitExceededError)
3. **Rejected webhooks** — webhook payloads that failed signature verification or were received for inactive workflows

### Dead-letter model

```python
class DeadLetterItem(BaseModel):
    id: str
    workflow_id: str | None
    workspace_id: str
    source: Literal["job_exhaustion", "execution_error", "rejected_webhook"]
    error: ExecutionError
    payload: dict[str, Any]             # original trigger/execution data
    metadata: dict[str, Any]            # context: job_id, webhook_id, etc.
    status: Literal["pending", "reprocessed", "discarded"]
    created_at: str
    processed_at: str | None = None
```

### Dead-letter management

```
GET    /api/workspaces/{id}/dead-letters
GET    /api/workspaces/{id}/dead-letters/{dl_id}
POST   /api/workspaces/{id}/dead-letters/{dl_id}/reprocess
POST   /api/workspaces/{id}/dead-letters/{dl_id}/discard
POST   /api/workspaces/{id}/dead-letters/bulk-reprocess
POST   /api/workspaces/{id}/dead-letters/bulk-discard
```

### Dead-letter → incomplete execution promotion

When a dead-letter item is reprocessed, it creates a new job and follows normal execution. If the workflow has `store_incomplete_executions` enabled, failures during reprocessing create new incomplete executions rather than returning to the dead letter.

---

## 7. Consecutive error handling

### Make's model

- Default consecutive error threshold: 3
- After N consecutive errors → workflow deactivated
- Does not apply to:
  - Webhook-triggered scenarios (immediate deactivation on error)
  - AccountValidationError, OperationsLimitExceededError, DataSizeLimitExceededError (immediate deactivation)
  - Warnings (do not count)

### FlowHolt consecutive error model

```python
class ConsecutiveErrorTracker(BaseModel):
    workflow_id: str
    consecutive_count: int = 0
    threshold: int | None = None        # from workflow settings; null = workspace default (3)
    last_error_at: str | None = None
    last_error_type: str | None = None
```

**Rules:**
1. Successful execution resets counter to 0
2. Warning does not increment counter
3. Error increments counter
4. When counter ≥ threshold → deactivate workflow, notify owner
5. Fatal errors bypass counter (immediate deactivation)
6. Webhook-triggered workflows: immediate deactivation on first unhandled error

### Reactivation

When a deactivated workflow is reactivated by a user:
1. Counter resets to 0
2. Workflow returns to scheduled state
3. Audit log records the reactivation

### n8n Auto-Deactivation Feature (new discovery)

Raw source: n8n environment variable `N8N_WORKFLOW_AUTODEACTIVATION_ENABLED`

n8n has a distinct env-var-based auto-deactivation mechanism that is separate from the consecutive error model:

| n8n env var | Default | Effect |
|-------------|---------|--------|
| `N8N_WORKFLOW_AUTODEACTIVATION_ENABLED` | `false` | Enable/disable auto-deactivation on repeated crashes |
| `N8N_WORKFLOW_AUTODEACTIVATION_INTERVAL` | `7200` (2 hours) | Window in seconds to count errors |
| `N8N_WORKFLOW_AUTODEACTIVATION_COUNT` | `5` | Number of failures in window before deactivation |

**FlowHolt equivalent:** Add a `workflow_autodeactivation_enabled` org/workspace setting that controls whether the consecutive error tracker triggers deactivation. This makes the behavior configurable per workspace rather than global (unlike n8n's global env var approach).

**Implementation note:** n8n's approach uses a global env var, which means it's all-or-nothing across the entire instance. FlowHolt should make this per-workspace configurable — this is a product improvement over n8n. Add to `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` § Workspace Runtime Settings.

**Audit log event:** When auto-deactivation fires, emit: `workflow.auto_deactivated` with reason: `consecutive_errors_exceeded`, count, threshold, and last error.

---

## 8. Circuit breaker for integrations

### Not in Make — FlowHolt addition

Make does not have circuit breakers. FlowHolt adds integration-level circuit breakers to protect against cascading failures:

```python
class CircuitBreakerConfig(BaseModel):
    enabled: bool = True
    failure_threshold: int = 5          # failures to open circuit
    success_threshold: int = 3          # successes in half-open to close
    timeout_seconds: int = 300          # how long circuit stays open
    monitored_errors: list[str] = ["ConnectionError", "ModuleTimeoutError", "RateLimitError"]

class CircuitBreakerState(BaseModel):
    integration_id: str
    workspace_id: str
    state: Literal["closed", "open", "half_open"]
    failure_count: int = 0
    success_count: int = 0              # only in half_open
    last_failure_at: str | None = None
    opened_at: str | None = None
    next_attempt_at: str | None = None  # when half_open check is scheduled
```

**Behavior:**
1. **Closed** (normal): All requests pass through; failures increment counter
2. **Open** (tripped): All requests fail immediately with `CircuitOpenError`; no calls to the integration
3. **Half-open** (testing): Limited requests pass through; if they succeed, circuit closes; if they fail, circuit reopens

**Scope:** Per integration, per workspace. A tripped circuit breaker for "Gmail" in workspace A does not affect workspace B.

---

## 9. ACID transaction support

### Make's model

- Modules supporting transactions are labeled "ACID"
- Typically database apps (Data Store, MySQL)
- `auto_commit` setting: if enabled, each step commits immediately; if disabled, commit happens at end of cycle
- `commit_trigger_last` setting: trigger module commits last instead of first
- Commit handler: commits all pending ACID changes on error
- Rollback handler: reverts all pending ACID changes on error

### FlowHolt transaction model

FlowHolt does not currently have ACID modules but plans for them when data stores are implemented (file 45).

```python
class StepTransactionCapability(BaseModel):
    supports_transactions: bool = False
    commit_on_success: bool = True      # auto-commit per step
    rollback_on_error: bool = True      # auto-rollback on unhandled error
```

Steps that support transactions:
- Data Store steps (planned)
- Database integration steps (MySQL, PostgreSQL — planned)
- Vault mutation steps (credential update — existing)

---

## 10. Workflow-level error handling settings

### Settings (from file 38 and file 42)

| Setting | Type | Default | Description |
|---|---|---|---|
| `store_incomplete_executions` | bool | false | Store failed runs for retry |
| `enable_data_loss` | bool | false | Discard data if storage full |
| `sequential_processing` | bool | false | One execution at a time, wait for incompletes |
| `auto_commit` | bool | true | Commit ACID changes immediately |
| `commit_trigger_last` | bool | false | Trigger step commits last |
| `max_cycles` | int | 1 | Max cycles per execution |
| `consecutive_error_threshold` | int | 3 | Errors before deactivation |
| `data_is_confidential` | bool | false | Suppress execution data in logs |

---

## 11. Error handling in the Studio UI

### Error indicators

1. **Step error badge** — red warning icon on a step that errored in the last run
2. **Error handling route** — translucent branch from any step to its error handler
3. **Quick Ignore** — one-click button to add Ignore handler (with optional error type filter)
4. **Error detail panel** — shows error type, message, bundle data, and quick-fix suggestions

### Adding error handlers

1. Right-click a step → "Add error handler"
2. Select handler type (Ignore, Resume, Commit, Rollback, Break)
3. Configure handler settings
4. Optionally add intermediate steps (e.g. Slack notification) before the handler
5. Error handling route rendered as translucent branch

### Incomplete executions view

Located at `/dashboard/executions/incomplete`:
- List of all incomplete executions across workflows
- Filter by workflow, error type, status
- Bulk retry / bulk discard
- Individual execution detail with error context and step state

---

## 12. Rollout phases

### Phase 1: Core error handling (partially complete)
- ✅ Per-step retry configuration (retry_on_fail, retry_count, retry_wait_ms, retry_backoff)
- ✅ Step-level timeout
- Implement 5 error handler types as Studio route branches
- Implement error handling route rendering
- Implement consecutive error tracking and auto-deactivation

### Phase 2: Incomplete executions
- Implement incomplete execution storage
- Implement manual resolution UI and API
- Implement Break handler with auto-retry
- Implement storage limits per plan
- Implement data loss setting

### Phase 3: Scenario-level backoff
- Implement exponential backoff for ConnectionError and ModuleTimeoutError
- Implement 20-minute pause for scheduled workflows
- Implement sequential processing interaction with backoff

### Phase 4: Dead-letter system
- Implement dead-letter item creation from 3 sources
- Implement dead-letter management API and UI
- Implement dead-letter to incomplete execution promotion

### Phase 5: Circuit breakers
- Implement per-integration circuit breaker state tracking
- Implement circuit breaker configuration at workspace level
- Implement half-open testing with gradual recovery
- Integrate circuit breaker status into system health dashboard

### Phase 6: ACID transactions
- Implement transaction support for Data Store steps
- Implement auto_commit and commit_trigger_last settings
- Implement Commit and Rollback handler interaction with ACID steps

### Phase 7: Advanced error handling
- Implement Throw step for conditional error generation
- Implement error handler filters (handle only specific error types)
- Implement error notification rules (notify on specific error types/thresholds)
- Implement error analytics (most common error types, error rate by integration)

---

## 13. Warning type taxonomy (from file 48 §3)

Warnings are distinct from errors: a warning keeps the workflow running/scheduled. Errors threaten scheduling continuity; warnings do not.

### Warning vs Error distinction

| Attribute | Error | Warning |
|---|---|---|
| Increments consecutive error counter | Yes | **No** |
| Disables workflow scheduling | Yes (at threshold) | **No** |
| Creates incomplete execution | Depends on handler | Depends (Break creates IE as warning) |
| Visual indicator on node | Red error badge | Yellow/amber warning badge |
| Origin | Unhandled exception | Handled exception, or platform limit hit |

### Warning types

#### ExecutionInterruptedWarning
- **ID**: ExecutionInterruptedError (treated as warning, not error)
- **Trigger**: execution duration exceeds plan limit
  - Free plan: 5-min limit
  - Growth/Teams: 40-min limit (matches Make)
  - Enterprise: configurable up to 120 min (decision #21)
- **Effect**: workflow ends, remaining bundles dropped, scheduling continues
- **FlowHolt mapping**: duration tracked by executor; same limits apply

#### OutOfSpaceWarning
- **ID**: OutOfSpaceError (treated as warning in some contexts)
- **Trigger**: data store capacity exceeded OR incomplete execution storage full
- **Effect**: workflow ends, remaining bundles dropped, scheduling continues
- **FlowHolt mapping**:
  - Data store capacity limits defined in file 45 (per-plan limits apply)
  - Incomplete execution storage limits defined above in §5 (10–10,000 per plan)
  - Resume handler with backup data store is the recommended mitigation

### Studio visual distinction

- **Error state**: red node border + red badge + "Run ended with error" in status bar
- **Warning state**: yellow/amber node border + amber badge + "Run ended with warning" in status bar
- Warning runs **do NOT increment the consecutive error counter** (confirmed consistent with §7 above)
