# FlowHolt Webhook And Trigger System Specification

This file defines every trigger type, webhook processing model, queue management, scheduling system, and event source configuration in FlowHolt.

It is grounded in:
- `backend/app/webhooks.py` — current webhook receiver (signature verification, deduplication via `trigger_events`, workspace+workflow endpoint, workspace-level fanout)
- `backend/app/scheduler.py` — current scheduler (interval, cron, daily, weekly, monthly frequencies; timezone-aware; dedup via time-bucketed event keys)
- `backend/app/security.py` — `verify_webhook_signature` (HMAC verification)
- Make corpus: `research/make-help-center-export/pages_markdown/webhooks.md` (app-specific vs custom webhooks, parallel vs sequential processing, webhook queues, queue limits, webhook logs, webhook rate limit 300/10s, expiration of inactive webhooks)
- Make corpus: `research/make-help-center-export/pages_markdown/scenario-rate-limits-for-instant-triggers.md` (rate limit model for instant/webhook triggers)
- Make corpus: `research/make-help-center-export/pages_markdown/apps-and-modules.md` (polling triggers vs instant triggers, trigger module as first module, ACID modules)
- Make corpus: `research/make-help-center-export/pages_markdown/scenario-execution-flow.md` (sequential vs parallel execution)
- Make corpus: `research/make-help-center-export/pages_markdown/options-related-to-incomplete-executions.md` (safety feature: store incomplete executions, confidential data flag)
- Make corpus: `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` (incomplete executions folder, manual resolution)
- Make corpus: `research/make-help-center-export/pages_markdown/incomplete-executions-retry.md` (exponential backoff retry model)
- Make corpus: `research/make-help-center-export/pages_markdown/affiliate-payouts-incomplete-execution-retries-new-apps.md` (3 parallel retries announcement)
- n8n: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §7` — n8n execution modes (manual, webhook, trigger, queue, CLI, error, sub-workflow)
- n8n source: `n8n-master/packages/workflow/src/interfaces.ts` — `IWebhookData`, `ISchedule`, `ITriggerResponse` interfaces
- n8n source: `n8n-master/packages/cli/src/webhooks/` — webhook registration, activation, response
- n8n source: `n8n-master/packages/@n8n/db/src/entities/WebhookEntity.ts` — `webhookPath`, `method`, `node`, `workflowId`
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §5` — Make webhook endpoints: `GET/POST /api/v2/hooks`
- `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` — queue retention model
- `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` — worker topology
- `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` — runtime API contracts

---

## Cross-Reference Map

### This file feeds into
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` — `/dashboard/webhooks` page
- `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` — queue model and retention
- `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` — worker execution model
- `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` — trigger node type fields
- `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` — incomplete executions, auto-retry

### Key raw corpus evidence (per section)
- **§2 Webhook system**: `research/make-help-center-export/pages_markdown/webhooks.md` — full Make webhook documentation including queue, logs, rate limits, expiration
- **§2 Rate limits**: `research/make-help-center-export/pages_markdown/scenario-rate-limits-for-instant-triggers.md` — "300 requests per 10 seconds"
- **§3 Queue**: Make webhook queue formula: "For every 10,000 credits per month, 667 queue items per webhook, max 10,000"
- **§4 Scheduling**: Make scheduling options are documented per article — 8 schedule types confirmed
- **§6 Incomplete executions**: `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` — folder UI, manual resolution; `research/make-help-center-export/pages_markdown/options-related-to-incomplete-executions.md` — settings for store/confidential
- **§6 Retry**: `research/make-help-center-export/pages_markdown/incomplete-executions-retry.md` — exponential backoff schedule exactly: 1m→10m→10m→30m→30m→30m→3h→3h for `ConnectionError`/`RateLimitError`/`ModuleTimeoutError`
- **§7 Consecutive errors**: Make `scenario-settings.md` — `Number of consecutive errors` setting field in scenario settings modal

### n8n comparison (per section)
- **§2 Webhook**: n8n's `WebhookEntity` stores `webhookPath`, `method`, `node`, `workflowId` — simpler than FlowHolt's `WebhookDetail` model (no per-webhook rate limits, no expiration in n8n). n8n webhooks are persistent (not expiring). Source: `n8n-master/packages/@n8n/db/src/entities/WebhookEntity.ts`
- **§3 Queue**: n8n does NOT have a webhook queue — it processes webhooks immediately or drops them. Make's queue model is a key FlowHolt differentiator over n8n.
- **§4 Schedule**: n8n uses cron internally via Bull. Source: `n8n-master/packages/cli/src/scheduling/`. n8n has fewer schedule types than Make (no "once", no "specified dates" in UI). FlowHolt should implement all 8 Make schedule types.
- **§5 Polling**: n8n has extensive polling trigger support — every "Watch" node polls. Source: `n8n-master/packages/nodes-base/` (Watch nodes with `poll` type). FlowHolt's polling model should mirror n8n's cursor-based approach.
- **§6 Retry**: n8n has retry-on-fail option per node (up to X retries, wait Y seconds between). Source: `n8n-master/packages/workflow/src/interfaces.ts` — `INodeParameters.retryOnFail`. Different from Make's incomplete-execution-level retry model. FlowHolt should implement BOTH: per-node retry (n8n-style) AND incomplete-execution-level retry (Make-style).
- **§7 Execution modes**: n8n has 7 execution modes (manual, webhook, trigger, queue, CLI, error, sub-workflow). FlowHolt currently has 4 (manual, webhook, schedule, chat). Planned additions: event, polling, API. n8n's "error" and "sub-workflow" modes are also needed (→ `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md`, Execute Workflow node).

---


## 1. Trigger types

### Current trigger types in FlowHolt

| Trigger type | Code | Current implementation |
|---|---|---|
| **Manual** | `manual` | User clicks "Run" in Studio or dashboard |
| **Webhook** | `webhook` | External HTTP POST to `/webhooks/{workspace_id}/{workflow_id}` |
| **Schedule** | `schedule` | Cron loop checks for due workflows every 30s |
| **Chat** | `chat` | Public chat interface sends messages to workflow |

### Planned trigger types

| Trigger type | Code | Description | Make equivalent |
|---|---|---|---|
| **Event** | `event` | Internal event bus (workflow completion, vault change, agent action) | Webhook between scenarios |
| **Polling** | `polling` | Periodically check an external source for new data | Polling triggers (Watch modules) |
| **API** | `api` | Triggered via FlowHolt API call (`POST /api/workflows/{id}/run`) | On demand scheduling |

---

## 2. Webhook system

### Current architecture

```
External service
    │
    ▼ HTTP POST
/webhooks/{workspace_id}/{workflow_id}
    │
    ├── Workflow lookup
    ├── Status check (must be active)
    ├── Trigger type check (must be webhook)
    ├── Signature verification (if required)
    ├── Deduplication (via trigger_events table)
    ├── Trigger event recording
    ├── Environment resolution (production if published, else draft)
    └── Job queuing
```

### Webhook types

Following Make's two webhook types:

| Type | FlowHolt equivalent | Description |
|---|---|---|
| **App-specific webhook (instant trigger)** | Integration webhook | Generated URL that a specific integration (Slack, GitHub, etc.) calls when events occur |
| **Custom webhook** | Generic webhook | User-created URL that accepts arbitrary JSON payloads |

### Webhook entity model

```python
WebhookStatus = Literal["active", "inactive", "expired"]

class WebhookSummary(BaseModel):
    id: str
    workspace_id: str
    workflow_id: str
    name: str
    url: str                             # the webhook receive URL
    status: WebhookStatus
    integration_app: str | None          # null for custom webhooks
    queue_count: int                     # pending items in queue
    last_received_at: str | None
    created_at: str

class WebhookDetail(WebhookSummary):
    signing_secret: str | None           # per-webhook secret (optional)
    require_signature: bool
    rate_limit_per_minute: int | None    # per-webhook rate limit
    max_queue_size: int                  # plan-determined
    expiry_days_inactive: int            # default 5 (matches Make: 120 hours)
    logs_retention_days: int             # 3 standard, 30 enterprise
```

### Webhook URL structure

```
POST /webhooks/{workspace_id}/{workflow_id}
```

Additionally, a workspace-level catch-all:
```
POST /webhooks/{workspace_id}
```
This fans out to all active webhook-triggered workflows in the workspace (existing `receive_workspace_webhook`).

### Signature verification

Current implementation uses HMAC-SHA256:

```
X-FlowHolt-Signature: sha256=<hmac_hex>
X-FlowHolt-Timestamp: <unix_timestamp>
```

Verification:
1. Reconstruct signed payload: `{timestamp}.{body}`
2. Compute HMAC-SHA256 with workspace signing secret
3. Compare with provided signature
4. Reject if timestamp outside tolerance window (default 300 seconds)

This can be overridden per-webhook if the webhook has its own `signing_secret`.

### Deduplication

Current implementation uses idempotency keys:
1. If `X-Idempotency-Key` header is present → use as event key
2. Otherwise → compute payload hash and construct key: `wh-{workflow_id}-{payload_hash}`
3. Check `trigger_events` table for existing key
4. Return `duplicate` response if already processed

---

## 3. Webhook queue system

### Architecture

Following Make: "When data arrives to a webhook and the call is not processed instantly, Make stores it in the webhook processing queue."

```
Webhook request → Queue (if workflow busy or scheduled) → Processing
```

### Queue model

```python
class WebhookQueueItem(BaseModel):
    id: str
    webhook_id: str
    workflow_id: str
    workspace_id: str
    payload: dict[str, Any]
    headers: dict[str, str]
    status: Literal["pending", "processing", "completed", "failed"]
    received_at: str
    processed_at: str | None
    error_message: str | None
```

### Queue limits

Following Make's formula: "For every 10,000 credits licensed per month, you can have up to 667 items in each webhook's queue. The maximum number is 10,000 items."

| Plan | Credits/month | Queue limit per webhook |
|---|---|---|
| Free | 1,000 | 67 |
| Starter | 10,000 | 667 |
| Pro | 50,000 | 3,335 |
| Teams | 100,000 | 6,670 |
| Enterprise | 500,000+ | 10,000 (max) |

When queue is full: return HTTP 400 with body "Queue is full" (matches Make).

### Queue processing

**Parallel processing** (default for instant webhooks):
- Each incoming request starts processing immediately
- Multiple executions can run concurrently
- Bounded by `max_concurrent_executions` workspace setting

**Sequential processing** (when `sequential_processing` enabled in workflow settings):
- Wait until previous execution is complete before starting next
- Guarantees order of processing
- Matches Make: "With sequential processing enabled, Make waits until the previous execution is complete before starting the next one."

### Webhook response module

Default responses (matching Make):

| Condition | HTTP status | Body |
|---|---|---|
| Webhook accepted in queue | 200 | `{"status": "accepted"}` |
| Queue full | 400 | `{"status": "error", "code": "queue_full"}` |
| Rate limit exceeded | 429 | `{"status": "error", "code": "rate_limit"}` |
| Invalid signature | 401 | `{"status": "error", "code": "invalid_signature"}` |
| Workflow not found | 404 | `{"status": "error", "code": "workflow_not_found"}` |
| Workflow inactive | 422 | `{"status": "error", "code": "workflow_inactive"}` |

Workflows can override the default response by including a `webhook_response` step that sets custom HTTP status, headers, and body.

### Webhook rate limiting

Following Make: "Make can process up to 300 incoming webhook requests per 10 second interval."

Default global rate limit: 300 requests per 10 seconds per webhook.

Per-workflow rate limit (scenario-level rate limit from Make): `max_runs_per_minute` in scheduling options.

### Webhook expiration

Following Make: "Make automatically deactivates webhooks that are not connected to any scenario for more than 5 days (120 hours)."

Webhooks without an active workflow for `expiry_days_inactive` days are set to `expired` status and return HTTP 410 Gone.

### Webhook logs

Following Make's webhook log model:

```python
class WebhookLogEntry(BaseModel):
    id: str
    webhook_id: str
    status: Literal["success", "warning", "error"]
    request_timestamp: str
    request_method: str
    request_url: str
    request_headers: dict[str, str]
    request_query: dict[str, str]
    request_body: str | None
    response_status: int
    response_headers: dict[str, str]
    response_body: str | None
    execution_log_size_bytes: int
```

Retention: 3 days standard, 30 days enterprise (matches Make).

---

## 4. Schedule system

### Current schedule types

The current `scheduler.py` supports:

| Frequency | Code | Config fields |
|---|---|---|
| Every minute | `every_minute` | — |
| Every 5 min | `every_5_min` | — |
| Every 15 min | `every_15_min` | — |
| Every 30 min | `every_30_min` | — |
| Hourly | `hourly` | — |
| Daily | `daily` | `time`, `timezone` |
| Weekly | `weekly` | `day_of_week`, `time`, `timezone` |
| Monthly | `monthly` | `day_of_month`, `time`, `timezone` |
| Cron | `cron` | `cron_expression`, `timezone` |
| Legacy interval | (detected by `interval_minutes`) | `interval_minutes`, `interval_hours` |

### Make schedule comparison

Make offers 8 options:

| Make option | FlowHolt equivalent | Status |
|---|---|---|
| Immediately | Webhook/instant trigger | Implemented |
| At regular intervals | `every_minute` through `hourly` + custom | Implemented |
| Once | Not yet implemented | Planned |
| Every day | `daily` | Implemented |
| Days of the week | `weekly` | Implemented |
| Days of the month | `monthly` | Implemented |
| Specified dates | Not yet implemented | Planned |
| On demand | `manual` + API trigger | Implemented |

### Planned schedule additions

| Schedule type | Code | Config fields |
|---|---|---|
| **Once** | `once` | `run_at` (ISO datetime), `timezone` |
| **Specified dates** | `specified_dates` | `dates` (list of ISO dates), `time`, `timezone` |
| **Advanced cron** | `cron` | Already implemented |

### Schedule trigger config model

```python
class ScheduleTriggerConfig(BaseModel):
    source: Literal["schedule"] = "schedule"
    frequency: Literal[
        "every_minute", "every_5_min", "every_15_min", "every_30_min",
        "hourly", "daily", "weekly", "monthly", "cron", "once", "specified_dates"
    ]
    time: str | None = None              # "HH:MM" for daily/weekly/monthly
    timezone: str = "UTC"
    day_of_week: str | None = None       # for weekly
    day_of_month: int | None = None      # for monthly
    cron_expression: str | None = None   # for cron
    run_at: str | None = None            # for once
    dates: list[str] | None = None       # for specified_dates
    start_date: str | None = None        # advanced: schedule start
    end_date: str | None = None          # advanced: schedule end

    # Rate limiting
    max_runs_per_minute: int | None = None
```

### Schedule minimum intervals by plan

Following Make: "The minimum length of the interval depends on your plan."

| Plan | Minimum interval |
|---|---|
| Free | 15 minutes |
| Starter | 5 minutes |
| Pro | 1 minute |
| Teams | 1 minute |
| Enterprise | 1 minute |

### Scheduler deduplication

Current implementation uses time-bucketed event keys: `sched-{workflow_id}-{YYYY-MM-DDTHH:MM}`. This prevents double-scheduling when the scheduler loop runs more frequently than the schedule interval.

---

## 5. Polling triggers

### Architecture

Polling triggers periodically check an external source for new data, similar to Make's "Watch" modules.

```
Scheduler tick
    │
    ▼
Poll external API for new data since last check
    │
    ├── No new data → Log check run, skip
    └── New data → Create execution with data bundles
```

### Polling trigger config

```python
class PollingTriggerConfig(BaseModel):
    source: Literal["polling"] = "polling"
    integration_app: str                 # e.g., "google_sheets", "slack"
    operation: str                       # e.g., "watch_new_rows"
    connection_id: str                   # vault connection
    poll_interval_minutes: int = 15
    max_results: int = 100               # max bundles per poll
    since_field: str | None = None       # field to track "since" (timestamp or ID)
    last_cursor: str | None = None       # stored cursor for next poll
```

### Check runs

Following Make: "A scheduled scenario run that checks for new data in a service, but returns no data, is called a check run."

Check runs are recorded in execution history but marked with `is_check_run: true` and consume 1 operation (matching Make's trigger operation model).

---

## 6. Incomplete executions and auto-retry

### Incomplete execution model

Following Make's incomplete executions system:

```python
class IncompleteExecution(BaseModel):
    id: str
    execution_id: str
    workflow_id: str
    workspace_id: str
    failed_step_id: str
    error_type: str                      # "ConnectionError", "RateLimitError", etc.
    error_message: str
    status: Literal["pending", "retrying", "resolved", "unresolved"]
    retry_count: int = 0
    max_retries: int = 8
    next_retry_at: str | None = None
    created_at: str
    resolved_at: str | None = None
```

### Auto-retry schedule

Following Make's exact exponential backoff:

| Attempt | Delay | Cumulative |
|---|---|---|
| 1 | 1 minute | 1 minute |
| 2 | 10 minutes | 11 minutes |
| 3 | 10 minutes | 21 minutes |
| 4 | 30 minutes | 51 minutes |
| 5 | 30 minutes | 1h 21m |
| 6 | 30 minutes | 1h 51m |
| 7 | 3 hours | 4h 51m |
| 8 | 3 hours | 7h 51m |

### Auto-retryable error types

Following Make:
- `RateLimitError`
- `ConnectionError`
- `ModuleTimeoutError`
- Errors with Break error handler (with `auto_complete` enabled)

### Retry processing rules

Following Make's exact rules:
1. Maximum 3 parallel retries per workflow
2. Retry does not start if the original workflow is currently running
3. If all retry attempts fail → mark as `unresolved`
4. If retry succeeds → mark as `resolved`

### Store incomplete executions setting

Following Make: disabled by default. When enabled, errors create incomplete execution records instead of immediately failing.

When `data_is_confidential` is true: "there are very limited options to solve errors" — incomplete execution data is not stored (cannot replay).

---

## 7. Consecutive error handling

Following Make's `Number of consecutive errors` setting:

```python
class ConsecutiveErrorTracker:
    """
    Track consecutive execution errors per workflow.
    When threshold is reached, deactivate the workflow.
    """
    workflow_id: str
    consecutive_errors: int = 0
    threshold: int | None = None         # from workflow settings
    last_error_at: str | None = None
```

Rules:
- After each failed execution, increment counter
- After each successful execution, reset counter to 0
- When counter reaches threshold, deactivate workflow and notify owner
- **Exception**: Instant trigger (webhook) workflows deactivate immediately on first error (matches Make)

---

## 8. Trigger event model

### Current implementation

```python
# From repository.py
class TriggerEvent:
    id: str
    workspace_id: str
    workflow_id: str
    trigger_type: str                    # "webhook", "schedule", "manual", "chat"
    event_key: str                       # for deduplication
    payload_hash: str | None
    execution_id: str | None             # linked after execution starts
    created_at: str
```

### Extended trigger event model

```python
class TriggerEventSummary(BaseModel):
    id: str
    workspace_id: str
    workflow_id: str
    trigger_type: TriggerType
    event_key: str
    source_metadata: TriggerSourceMetadata | None
    execution_id: str | None
    status: Literal["received", "queued", "processing", "completed", "failed", "rejected"]
    received_at: str
    processed_at: str | None

class TriggerSourceMetadata(BaseModel):
    # Webhook-specific
    webhook_id: str | None = None
    remote_ip: str | None = None
    user_agent: str | None = None

    # Schedule-specific
    scheduled_at: str | None = None
    frequency: str | None = None

    # Manual-specific
    initiated_by_user_id: str | None = None

    # Chat-specific
    chat_session_id: str | None = None

    # Polling-specific
    integration_app: str | None = None
    bundles_count: int | None = None
```

---

## 9. CRUD endpoints

### Webhook endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| List webhooks | GET | `/api/webhooks` | viewer |
| Create webhook | POST | `/api/webhooks` | builder |
| Get webhook detail | GET | `/api/webhooks/{webhook_id}` | viewer |
| Update webhook | PUT | `/api/webhooks/{webhook_id}` | builder |
| Delete webhook | DELETE | `/api/webhooks/{webhook_id}` | builder |
| Get webhook queue | GET | `/api/webhooks/{webhook_id}/queue` | viewer |
| Delete queue items | DELETE | `/api/webhooks/{webhook_id}/queue` | builder |
| Get webhook logs | GET | `/api/webhooks/{webhook_id}/logs` | viewer |
| Regenerate webhook URL | POST | `/api/webhooks/{webhook_id}/regenerate` | admin |

### Incomplete execution endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| List incomplete executions | GET | `/api/incomplete-executions` | viewer |
| Get incomplete execution | GET | `/api/incomplete-executions/{id}` | viewer |
| Retry incomplete execution | POST | `/api/incomplete-executions/{id}/retry` | builder |
| Resolve incomplete execution | POST | `/api/incomplete-executions/{id}/resolve` | builder |
| Delete incomplete execution | DELETE | `/api/incomplete-executions/{id}` | builder |
| Delete all incomplete | DELETE | `/api/incomplete-executions` | admin |

---

## 10. Rollout phases

### Phase 1: Webhook expansion
- Per-webhook signing secrets (in addition to workspace-level)
- Webhook queue model with limits
- Webhook logs with 3-day retention
- Webhook rate limiting (300/10s default)
- Webhook expiration for inactive webhooks

### Phase 2: Schedule expansion
- Add `once` and `specified_dates` schedule types
- Plan-based minimum interval enforcement
- `max_runs_per_minute` per-workflow rate limiting
- Start/end date for schedule windows

### Phase 3: Incomplete executions
- `IncompleteExecution` model and storage
- Auto-retry with Make's exponential backoff schedule
- 3 parallel retries per workflow limit
- Manual resolve/retry/delete UI
- Consecutive error tracking and auto-deactivation

### Phase 4: Advanced triggers
- Polling triggers with cursor-based state tracking
- Event triggers (internal event bus between workflows)
- API triggers (programmatic workflow execution)
- Trigger event history page

### Phase 5: Sequential processing and resilience
- Sequential processing mode per workflow
- Queue ordering guarantees
- Dead-letter integration (from file 35) for rejected webhooks
- Webhook response step (custom response from workflow)
