# FlowHolt Observability And Analytics Specification

This file defines the observability, analytics, consumption tracking, and credit system for FlowHolt, with exact metric definitions, dashboard surfaces, and API contracts.

It is grounded in:
- Make corpus: `research/make-help-center-export/pages_markdown/analytics-dashboard.md` (enterprise analytics with operations by team, total operations, errors, error rate, executions, time-frame filters, team/folder filters, customizable columns)
- Make corpus: `research/make-help-center-export/pages_markdown/credits-and-operations.md` (credits as billing unit, fixed vs dynamic credit usage, AI token-based credit usage, model-tier pricing tables)
- Make corpus: `research/make-help-center-export/pages_markdown/credits-per-team-management.md` (team credit limits, usage notifications at 75%/90%/100%, scenario pausing when limit reached)
- Make corpus: `research/make-help-center-export/pages_markdown/introducing-credits-new-billing-unit-live-in-make.md` (credit transition announcement, credit model details)
- Make corpus: `research/make-help-center-export/pages_markdown/coming-soon-credits-as-new-billing-unit-in-make.md` (pre-launch credit model documentation)
- Make API: `GET /api/v2/scenarios/consumptions`, `GET /api/v2/organizations/:id/usage`, `GET /api/v2/consumptions/reports/:id` — discovered in `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §5`
- n8n: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §3` — n8n `workflow-statistics.controller`, `insights` module, `telemetry.controller`
- n8n source: `n8n-master/packages/cli/src/modules/insights/` — analytics module
- n8n source: `n8n-master/packages/cli/src/controllers/workflow-statistics.controller.ts` — per-workflow statistics
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — org plan quotas, team credit limits
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` — org billing settings
- `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` — runtime overview metrics

---

## Cross-Reference Map

### This file feeds into
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` §3 — `/org/:orgSlug/consumption`, `/org/:orgSlug/credit-usage`
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — team credit limit settings
- `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` — execution metrics storage model
- `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` — runtime stats

### Key raw corpus evidence (per section)
- **§1 Credit model**: `research/make-help-center-export/pages_markdown/credits-and-operations.md` — "1 operation = 1 bundle processed by 1 module"; AI credit multipliers by model tier
- **§2 Tracking surfaces**: `research/make-help-center-export/pages_markdown/credits-and-operations.md` §"Track your credits" — 7 surfaces
- **§3 Analytics**: `research/make-help-center-export/pages_markdown/analytics-dashboard.md` — exact column names, filter options, metric definitions
- **§4 Team limits**: `research/make-help-center-export/pages_markdown/credits-per-team-management.md` — 75%/90%/100% thresholds, "pausing scenarios"
- **§6 Audit log**: `research/make-help-center-export/pages_markdown/audit-logs.md` — org vs team scope, 12-month retention on enterprise
- **§6 Audit log intro**: `research/make-help-center-export/pages_markdown/introducing-audit-logs.md`
- **§8 Log streaming**: `research/n8n-docs-export/pages_markdown/log-streaming.md` — 6 event categories, 3 destination types

### n8n comparison
- n8n `insights` module: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §3` — n8n's analytics are scoped at the instance level, not org level. n8n has `WorkflowStatistics` (per-workflow) and `Insights` (dashboard with `chart-column-decreasing` icon in sidebar).
- n8n `telemetry.controller`: sends telemetry events to an external endpoint (PostHog). FlowHolt should use internal analytics, not telemetry.
- **Key difference**: n8n does not have a credit/operations billing model — it's self-hosted. FlowHolt's credit model follows Make, not n8n.
- n8n `ExecutionAnnotation` entity (EE): Allows annotating executions with votes and notes. FlowHolt should consider this for `execution` review workflows. → `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md`
- **n8n log streaming** (`research/n8n-docs-export/pages_markdown/log-streaming.md`): Enterprise feature. 6 event categories with 50+ specific events. 3 destination types: syslog / webhook / Sentry. FlowHolt should implement equivalent in §8 below.

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Insights module | `n8n-master/packages/cli/src/modules/insights/` |
| Workflow statistics | `n8n-master/packages/cli/src/controllers/workflow-statistics.controller.ts` |
| Log streaming | `n8n-master/packages/cli/src/controllers/event-bus-controller.ts` |
| Audit log | `n8n-master/packages/cli/src/modules/audit/` |
| Telemetry | `n8n-master/packages/cli/src/telemetry/telemetry.service.ts` |

---


## 1. Credit and operation model

### Operations

An operation is a single workflow step execution processing one data bundle. This aligns with Make's definition: "An operation is a single module run to process data or check for new data."

| Activity | Operations consumed |
|---|---|
| Trigger step (polling check) | 1 (regardless of bundles returned) |
| Action step processing N bundles | N (one per bundle) |
| AI agent tool call | 1 per tool invocation |
| Sub-workflow call | 1 + operations of sub-workflow |
| Webhook receipt (queueing) | 0 (operation counted when processed) |

### Credits

Credits are the billing unit. For standard (non-AI) operations: **1 operation = 1 credit**.

For AI operations, credit usage is dynamic based on token consumption:

| Connection type | Credit basis |
|---|---|
| **FlowHolt AI Provider** (built-in) | Operations + tokens |
| **Custom AI provider** (user's own API key) | Operations only (user pays provider for tokens) |
| **Auto AI provider** (platform-selected model) | Tokens + operations + usage factors |

### Token-to-credit conversion (FlowHolt AI Provider)

Modeled after Make's tiered pricing:

| Model tier | Tokens per credit |
|---|---|
| Small (fast, minimal reasoning) | 5,000 |
| Medium (balanced) | 3,500 |
| Large (capable) | 1,500 |

Exact model assignments and rates will be set during implementation. The table structure follows Make's corpus evidence from `credits.md`.

---

## 2. Consumption tracking surfaces

Following Make's 7 tracking surfaces, adapted for FlowHolt:

### Surface 1: Org Dashboard

**Location**: `/org/:orgSlug`
**Shows**: Average daily credit usage, credits remaining, reset date, usage trend chart.

```python
class OrgDashboardMetrics(BaseModel):
    credits_total: int                   # plan allowance
    credits_used: int                    # current billing period
    credits_remaining: int
    average_daily_credits: float
    reset_date: str                      # next billing cycle start
    usage_trend: list[DailyUsagePoint]   # last 30 days

class DailyUsagePoint(BaseModel):
    date: str
    credits_used: int
    operations: int
```

**Endpoint**: `GET /api/organizations/{org_id}/dashboard`

### Surface 2: Subscription / Billing

**Location**: `/org/:orgSlug/billing`
**Shows**: Plan details, credits purchased vs used, storage usage, extra credit purchase option.

```python
class OrgBillingResponse(BaseModel):
    plan: OrganizationPlan
    billing_period_start: str
    billing_period_end: str
    credits_in_plan: int
    credits_used: int
    extra_credits_purchased: int
    extra_credits_remaining: int
    storage_used_bytes: int
    storage_limit_bytes: int
    auto_purchase_enabled: bool
    auto_purchase_threshold_percent: int
```

**Endpoint**: `GET /api/organizations/{org_id}/billing`

### Surface 3: Credit Usage History

**Location**: `/org/:orgSlug/credit-usage`
**Shows**: Per-run credit usage across all workflows and AI agents.

Following Make's Credit Usage table:

```python
class CreditUsageEntry(BaseModel):
    id: str
    name: str                            # workflow or agent name
    type: Literal["workflow", "agent"]
    credits: int
    operations: int
    data_transfer_bytes: int
    execution_id: str | None = None      # for workflow runs
    recorded_at: str

class CreditUsageListResponse(BaseModel):
    entries: list[CreditUsageEntry]
    total_credits: int
    total_operations: int
    page: int
    page_size: int
    total_count: int
```

**Endpoint**: `GET /api/organizations/{org_id}/credit-usage?page=1&page_size=50&from=...&to=...`

Clicking a workflow entry navigates to the execution detail. This matches Make: "click an item to go to the scenario history of a specific run."

### Surface 4: Workflow List (credits per workflow)

**Location**: `/dashboard/workflows`
**Shows**: Credit icon next to each workflow showing credits used in current billing period.

```python
class WorkflowCreditSummary(BaseModel):
    workflow_id: str
    credits_used_this_period: int
```

**Endpoint**: Included as field on `WorkflowSummary` response or via `GET /api/workflows/credits-summary`

### Surface 5: Workflow Studio (credits per step)

**Location**: `/studio/:id` (after running a workflow)
**Shows**: Credits used in the output bubble above each step.

This is rendered client-side from execution step data. Each step's output includes:

```python
class StepExecutionMetrics(BaseModel):
    operations: int
    credits: int
    tokens_input: int | None = None      # for AI steps
    tokens_output: int | None = None     # for AI steps
    duration_ms: int
    data_transfer_bytes: int
```

Canvas options toggle: "Show credits" (matches Make's "toggle the credit usage view on and off").

### Surface 6: Execution Detail (credits per step)

**Location**: `/dashboard/executions/:executionId`
**Shows**: Per-step credit breakdown in the execution inspector.

Already partially supported via `ExecutionInspectorResponse`. Add credit/operation fields to step detail.

### Surface 7: Execution History (credits per run)

**Location**: `/dashboard/executions`
**Shows**: Credits column in the execution list table.

Add `credits` field to `ExecutionSummary`.

---

## 3. Analytics dashboard (enterprise)

**Location**: `/org/:orgSlug/consumption`
**Access**: `org_owner`, `org_admin` (enterprise plan only)

Following Make's Analytics Dashboard structure:

### Key metrics (top cards)

| Metric | Description | Trend indicator |
|---|---|---|
| **Operations by team** | Breakdown of operations per team | Bar chart or proportional badges |
| **Total operations** | Sum of all operations in period | ↑/↓ vs previous period |
| **Total errors** | Count of execution errors | ↑/↓ vs previous period |
| **Error rate** | Errors / total executions | ↑/↓ vs previous period |
| **Workflow executions** | Count of workflow runs | ↑/↓ vs previous period |
| **Total credits** | Credits consumed in period | ↑/↓ vs previous period |

### Time frame filter

Options: Last 24 hours, Last 7 days, Last 30 days (matches Make exactly).

### Additional filters

- **Status**: Active, Inactive, Error (matches Make)
- **Team**: Filter by team (matches Make)
- **Folder/Category**: Filter by workflow folder/category

### Per-workflow table columns

| Column | Description | Make equivalent |
|---|---|---|
| Workflow | Name + status dot (green=active, red=error, gray=inactive) | Scenario |
| Operations used | Total operations in period | Operations used |
| Usage change | % change vs previous period | Usage change |
| Executions | Total executions in period | Executions |
| Executions change | % change vs previous period | Executions change |
| Errors | Total errors in period | Errors |
| Error rate | Errors / executions | Error rate |
| Team | Team the workflow belongs to | Team |
| Category | Workflow category | Folder |
| Credits | Total credits in period | — (FlowHolt addition) |

### API contract

```python
class AnalyticsDashboardResponse(BaseModel):
    period_start: str
    period_end: str
    period_label: str                    # "Last 24 hours", "Last 7 days", "Last 30 days"

    # Key metrics
    total_operations: int
    total_operations_previous: int       # for trend calculation
    total_errors: int
    total_errors_previous: int
    error_rate: float
    error_rate_previous: float
    total_executions: int
    total_executions_previous: int
    total_credits: int
    total_credits_previous: int

    # Per-team breakdown
    operations_by_team: list[TeamOperationsSummary]

    # Per-workflow breakdown
    workflows: list[WorkflowAnalyticsRow]

class TeamOperationsSummary(BaseModel):
    team_id: str
    team_name: str
    operations: int
    credits: int

class WorkflowAnalyticsRow(BaseModel):
    workflow_id: str
    workflow_name: str
    workflow_status: str
    team_name: str
    category: str | None
    operations_used: int
    operations_change_percent: float
    executions: int
    executions_change_percent: float
    errors: int
    error_rate: float
    credits: int
```

**Endpoint**: `GET /api/organizations/{org_id}/analytics?period=7d&team_id=...&status=...`

**Raw corpus**: `research/make-help-center-export/pages_markdown/analytics-dashboard.md` — exact column names confirmed: "Operations used", "Usage change", "Executions", "Executions change", "Errors", "Error rate", "Team", "Folder"

**n8n comparison**: n8n's insights module (`n8n-master/packages/cli/src/modules/insights/`) provides per-workflow statistics (execution count, success rate, avg duration). n8n does NOT have credit/operations billing — it's a self-hosted tool. FlowHolt should combine Make's credit model (§1) with n8n's per-workflow stats granularity.

**Make API evidence** (`40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §5`):
- `GET /api/v2/scenarios/consumptions` — per-scenario credit consumption
- `GET /api/v2/consumptions/reports/:id` — detailed consumption report
- `GET /api/v2/organizations/:id/usage` — org-level usage summary

---

## 4. Credit per team management

Following Make's team credit management:

### Setting team credit limits

Org owners/admins can set a credit limit per team. When a team reaches its limit, all workflows in that team's workspaces are paused.

```python
class TeamCreditAllocation(BaseModel):
    team_id: str
    team_name: str
    credit_limit: int | None             # null = unlimited (org pool)
    credits_used: int
    usage_percent: float | None          # null if no limit
    status: Literal["ok", "warning", "paused"]
```

### Usage notification thresholds

Following Make exactly:
- **75%**: Email to org owners/admins if usage is high relative to elapsed billing period
- **90%**: Always email org owners/admins
- **100%**: Always email org owners/admins; team workflows paused

Team admins also receive notifications at each threshold.

### Notification model

```python
class CreditNotification(BaseModel):
    type: Literal["credit_threshold"]
    scope: Literal["organization", "team"]
    scope_id: str
    scope_name: str
    threshold_percent: int               # 75, 90, or 100
    credits_used: int
    credits_limit: int
    action_taken: str | None             # "scenarios_paused" at 100%
    recipients: list[str]                # user IDs
    sent_at: str
```

---

## 5. Execution metrics

### Per-execution metrics

```python
class ExecutionMetrics(BaseModel):
    execution_id: str
    total_operations: int
    total_credits: int
    total_tokens_input: int
    total_tokens_output: int
    total_data_transfer_bytes: int
    duration_ms: int
    steps_executed: int
    steps_succeeded: int
    steps_failed: int
    steps_skipped: int
```

### Per-step metrics

```python
class StepMetrics(BaseModel):
    step_id: str
    step_type: str
    operations: int
    credits: int
    tokens_input: int | None
    tokens_output: int | None
    data_transfer_bytes: int
    duration_ms: int
    bundles_processed: int
```

### Aggregated workflow metrics

```python
class WorkflowMetrics(BaseModel):
    workflow_id: str
    period_start: str
    period_end: str
    total_executions: int
    successful_executions: int
    failed_executions: int
    total_operations: int
    total_credits: int
    average_duration_ms: float
    p95_duration_ms: float
    total_data_transfer_bytes: int
```

---

## 6. Audit log system

### Scope

Following Make's audit log model with org-level and team-level views:

- **Org audit logs**: All events across the organization
- **Team audit logs**: Events scoped to a specific team

### Retention

- Standard plans: 30 days
- Enterprise plan: 12 months (matches Make: "Audit logs are stored for 12 months")

### Event categories

Following Make's event table, adapted for FlowHolt:

| Category | Events | Org-visible | Team-visible |
|---|---|---|---|
| **Workflows** | Created, Updated, Deleted, Activated, Deactivated, Promoted, Published, Rolled back | ✓ | ✓ |
| **Connections** | Created, Updated, Deleted, Authorized, Reauthorized | ✓ | ✓ |
| **Webhooks** | Created, Updated, Deleted, Enabled, Disabled | ✓ | ✓ |
| **Vault Assets** | Created, Updated, Deleted | ✓ | ✓ |
| **Team** | Created, Updated, Deleted, Role updated, Member added, Member removed | ✓ | ✓ |
| **Organization** | Created, Updated, Settings changed | ✓ | ✗ |
| **2FA** | Enforcement enabled, Enforcement disabled | ✓ | ✗ |
| **Agents** | Created, Updated, Deleted, Archived, Shared | ✓ | ✓ |
| **Deployments** | Promoted to staging, Published to production, Approval requested, Approved, Rejected, Rolled back | ✓ | ✓ |
| **Settings** | Workspace settings updated, Team settings updated, Org settings updated | ✓ | ✓ (team/workspace only) |
| **Members** | Invited, Role changed, Removed, Suspended | ✓ | ✓ |

### Audit log model

```python
class AuditLogEntry(BaseModel):
    id: str
    event_type: str                      # "workflow.created", "team.member_added", etc.
    category: str                        # "workflows", "connections", etc.
    actor_user_id: str
    actor_name: str
    actor_email: str
    organization_id: str
    team_id: str | None
    workspace_id: str | None
    target_type: str | None              # "workflow", "connection", "team", etc.
    target_id: str | None
    target_name: str | None
    changes: dict[str, Any] | None       # before/after values for update events
    timestamp: str
```

### API endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| List org audit logs | GET | `/api/organizations/{org_id}/audit-log` | `org_admin` |
| List team audit logs | GET | `/api/teams/{team_id}/audit-log` | `team_admin` |
| Get audit log detail | GET | `/api/audit-log/{entry_id}` | `org_admin` or `team_admin` |

### Filters

- **Event type**: Filter by specific event categories
- **Time period**: Date range filter
- **User**: Filter by acting user
- **Team**: Filter by team (org audit log only)

---

## 7. System health metrics

### `/api/system/status` (existing, extended)

```python
class SystemHealthResponse(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    database: ServiceHealth
    scheduler: ServiceHealth
    worker: ServiceHealth
    llm_providers: list[ProviderHealth]
    uptime_seconds: int
    version: str
    last_execution_at: str | None
    active_executions: int
    queued_jobs: int
    failed_jobs_last_hour: int

class ServiceHealth(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    latency_ms: int | None
    last_check_at: str

class ProviderHealth(BaseModel):
    provider: str
    status: Literal["healthy", "degraded", "unhealthy"]
    latency_ms: int | None
    error_rate_last_hour: float
```

---

## 8. Rollout phases

### Phase 1: Execution metrics

- Add `credits`, `operations`, `duration_ms`, `data_transfer_bytes` to execution and step responses
- Add credits column to execution list table
- Add credits display in Studio output bubbles
- Add "Show credits" toggle to Studio canvas options

### Phase 2: Org dashboard and credit tracking

- Org dashboard with credit usage chart and key metrics
- Credit usage history page (per-run table)
- Credits per workflow in workflow list
- Credit notification system (75%/90%/100%)

### Phase 3: Analytics dashboard (enterprise)

- Full analytics dashboard with time-frame filters, team/status filters, per-workflow table
- Team credit management (set limits, view usage, notifications)

### Phase 4: Audit log expansion

- Expand audit log event types to cover all categories
- Add org-level and team-level audit log views
- Add before/after change details for update events

### Phase 5: Advanced observability

- Custom metric dashboards
- Alert rules for metric thresholds
- Export metrics to external observability tools
- API for programmatic metric access

---

## 9. Log Streaming (Event Export)

Raw source: `research/n8n-docs-export/pages_markdown/log-streaming.md`

Log streaming allows FlowHolt to push events to external logging and alerting tools in real time. This is distinct from the audit log (internal storage) — log streaming pushes to external destinations.

### Destination types

Following n8n's 3 destination types:

| Destination | Use case |
|-------------|---------|
| **Syslog server** | Centralized log aggregation (ELK, Splunk, Loki) |
| **Webhook** | Generic POST to any endpoint (Datadog, custom SIEM) |
| **Sentry** | Error tracking and alerting |

### Event catalog (complete)

The following events are streamed. Each event category can be toggled independently.

#### Workflow events
- Workflow Started
- Workflow Success
- Workflow Failed
- Workflow Cancelled

#### Node execution events
- Node Started
- Node Finished

#### Audit events (security and governance)
- User login success / failed
- User signed up / updated / deleted / invited / invitation accepted / re-invited
- User email failed / reset requested / reset
- User credentials created / shared / updated / deleted
- User API key created / deleted
- User MFA enabled / disabled
- User execution deleted
- Execution data revealed / reveal failed
- Workflow executed / created / deleted / updated / archived / unarchived / activated / deactivated / version updated
- Package installed / updated / deleted
- Variable created / updated / deleted
- External secrets provider settings saved / reloaded
- Personal publishing restricted enabled / disabled
- Personal sharing restricted enabled / disabled
- 2FA enforcement enabled / disabled

#### AI node logs (LangChain observability)
- Memory get messages
- Memory added message
- Output parser parsed
- Retriever get relevant documents
- Embeddings embedded document
- Embeddings embedded query
- Document processed
- Text splitter split
- Tool called
- Vector store searched
- LLM generated / LLM error
- Vector store populated / updated

#### Worker events
- Worker started / stopped

#### Queue events (for Postgres-as-queue)
- Job enqueued / dequeued / completed / failed / stalled

### Configuration model

```python
class LogStreamingDestination(BaseModel):
    id: str
    workspace_id: str  # or org_id for enterprise
    type: Literal["syslog", "webhook", "sentry"]
    name: str
    config: dict  # type-specific config (URL, auth, etc.)
    enabled: bool
    events: list[str]  # event types to stream (empty = all)
    created_at: str
    updated_at: str
```

### Implementation notes

- Log streaming is separate from the audit log in `§6`
- AI node logs (the LangChain observability events) are especially valuable for debugging AI agent workflows — FlowHolt should make these available in the AI execution trace view
- Queue events (Job enqueued/dequeued/stalled) directly map to `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` observability metrics
- Log streaming should be gated at the enterprise plan level (matches n8n behavior)

### Rollout: Phase 5 addition

This section adds to Phase 5 rollout:
- Log streaming destinations CRUD (Settings → Log Streaming)
- Event category toggles per destination
- AI node log viewer in execution detail (inline, not just streamed)
- Queue event stream for ops dashboard (see `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md`)
