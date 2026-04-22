# FlowHolt Runtime Ops Route Spec

This file turns the runtime dashboard draft into a concrete route-level plan.

It is grounded in:
- `29-FLOWHOLT-QUEUE-DASHBOARD-WIREFRAME-AND-ALERTS.md`
- `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md`
- current route structure in `src/App.tsx`
- current runtime-facing screens in:
  - `src/pages/dashboard/SystemStatusPage.tsx`
  - `src/pages/dashboard/ExecutionsPage.tsx`
  - `src/pages/dashboard/ExecutionDetailPage.tsx`
  - `src/pages/dashboard/EnvironmentPage.tsx`
- Make UI evidence about keeping operational actions persistent and discoverable

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Incomplete executions board | `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` | Dead-letter / incomplete execution board pattern, retry and discard actions |
| Make execution history UI | `research/make-help-center-export/pages_markdown/scenario-run-history.md` | Execution list, filter, detail drill-down |
| Make persistent toolbar evidence | `research/make-advanced/02-bottom-toolbar/` | Bottom toolbar stays visible; operational controls persistent and undisplaceable |
| Queue mode worker coordination | `research/n8n-docs-export/pages_markdown/hosting__scaling__queue-mode.md` | Worker roles, queue coordination, health check pattern |
| Worker scaling overview | `research/n8n-docs-export/pages_markdown/hosting__scaling__overview.md` | Worker types and horizontal scaling |
| Queue dashboard plan | `29-FLOWHOLT-QUEUE-DASHBOARD-WIREFRAME-AND-ALERTS.md` | Three-zone layout, lane health board, alert thresholds |
| Queue runbooks | `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md` | Queue view details and operator workflows |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Worker health check controller | `n8n-master/packages/cli/src/health-check.controller.ts` |
| Prometheus metrics endpoint | `n8n-master/packages/cli/src/controllers/metrics.controller.ts` |
| Queue-based execution lifecycle | `n8n-master/packages/cli/src/scaling/queue-based-execution-lifecycle.ts` |
| Worker process management | `n8n-master/packages/cli/src/worker-server.ts` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Runtime ops interface | No built-in runtime ops dashboard; requires external Grafana / monitoring | First-class `/dashboard/runtime` route family |
| Worker health UI | Health endpoints only (`/healthz/readiness`, `/healthz/liveness`) | Worker health board with heartbeat, last cycle, error summary |
| Dead-letter management | No built-in DLQ UI; failed executions in execution history | Dedicated dead-letter and retry board with classification |
| Queue visibility | Redis/BullMQ queue stats via external tooling | Postgres `jobs` table with lane-level summaries |
| Paused execution ops | Waiting executions visible in list view | Dedicated paused execution board with overdue indicators |

### This file feeds into

| File | What it informs |
|------|----------------|
| `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | API contracts for runtime ops route endpoints |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | System health and log streaming integration |
| `29-FLOWHOLT-QUEUE-DASHBOARD-WIREFRAME-AND-ALERTS.md` | Route layout for wireframe features |

---

## Goal

Define the final runtime-operations route and how it relates to current pages.

## 1. Current state

Current runtime information is split across:
- `/dashboard/overview`
- `/dashboard/executions`
- `/dashboard/executions/:executionId`
- `/dashboard/system`
- `/dashboard/environment`

This is workable, but operational runtime work is fragmented:
- system health is one page
- execution history is another
- environment policy is another
- queue operations do not yet have a dedicated home

## 2. Planned route model

Add a first-class runtime route family:

- `/dashboard/runtime`
- `/dashboard/runtime/jobs`
- `/dashboard/runtime/pauses`
- `/dashboard/runtime/failures`
- `/dashboard/runtime/workers`
- `/dashboard/runtime/alerts`

Keep the current pages, but reposition them:
- `Executions` remains the historical run browser
- `System` remains infrastructure and catalog health
- `Environment` remains release and live-boundary policy
- `Runtime` becomes the operator workspace

## 3. `/dashboard/runtime` overview layout

### Header

- title: `Runtime Operations`
- scope picker: workspace and environment
- refresh action
- alert-state quick filter

### Primary content blocks

Row 1:
- alert summary ribbon
- queue lane summary ribbon

Row 2:
- lane health board
- worker health board
- paused execution board

Row 3:
- dead-letter board
- top failing workflows
- replay activity

Row 4:
- recent incidents and operator notes later

## 4. Child routes

### `/dashboard/runtime/jobs`

Purpose:
- low-level job and queue inspection

Table fields:
- job id
- lane
- status
- workflow
- execution id if present
- queued at
- leased at
- retry count
- failure class

Actions:
- open workflow
- open execution
- requeue
- discard

### `/dashboard/runtime/pauses`

Purpose:
- operational management of `delay`, `human`, and `callback` pauses

Table fields:
- workflow
- execution
- pause type
- step
- waiting since
- resume time
- overdue state
- assignee if human

Actions:
- open task
- resume
- cancel

### `/dashboard/runtime/failures`

Purpose:
- inspect retryable and non-retryable failures in one place

Sections:
- retry backlog
- dead-letter backlog
- grouped failure classes
- release-correlated failures

### `/dashboard/runtime/workers`

Purpose:
- operator-level worker and scheduler health

Cards:
- scheduler
- execution processor
- resume processor
- maintenance worker

### `/dashboard/runtime/alerts`

Purpose:
- alert inbox and escalation history

Sections:
- active alerts
- acknowledged alerts later
- resolved alerts later
- alert rules summary

## 5. Navigation placement

Place `Runtime` in the dashboard nav near:
- `Executions`
- `Environment`
- `Audit`

Reason:
- it is an operations surface, not an editor surface
- it should sit near runtime history and live-environment governance

## 6. Relationship to existing routes

### Keep

- `/dashboard/executions`
- `/dashboard/executions/:executionId`
- `/dashboard/system`
- `/dashboard/environment`

### Re-scope

- `System` should emphasize infrastructure, platform health, provider routing, and catalog inventory
- `Runtime` should own queue lanes, pauses, dead-letter, retries, worker drill-down, and alerts
- `Environment` should own publish gates, runtime policy defaults, and live endpoint posture

## 7. Alert delivery rules

Alert delivery should have three layers.

### Layer 1: in-product visibility

- alert ribbon on `/dashboard/runtime`
- active alert count in runtime nav item later
- filtered alert board on `/dashboard/runtime/alerts`

### Layer 2: user notifications

Backed by existing workspace settings where possible:
- email for failure spikes
- email for approval queue issues
- later notifications for worker outage and dead-letter surge

### Layer 3: operator workflow

- alerts should link directly to filtered jobs, pauses, failures, or workers
- every critical alert should have one recommended next action

## 8. Dead-letter object direction

The runtime route needs a first-class dead-letter object rather than inferring everything from generic jobs.

## Proposed dead-letter summary shape

```ts
type ApiDeadLetterJob = {
  id: string;
  workspace_id: string;
  workflow_id: string;
  execution_id?: string | null;
  lane: string;
  failure_class: string;
  reason_code?: string | null;
  attempts: number;
  first_failed_at: string;
  last_failed_at: string;
  environment?: "draft" | "staging" | "production" | null;
  requeue_allowed: boolean;
  discard_allowed: boolean;
  policy_blocker?: string | null;
  summary?: string | null;
};
```

## 9. Rollout order

### Phase 1

- add `/dashboard/runtime`
- populate with queue and pause summary cards
- link to existing executions and environment pages

### Phase 2

- add `/dashboard/runtime/failures`
- add dead-letter listing and actions
- add worker-health board

### Phase 3

- add `/dashboard/runtime/alerts`
- add alert acknowledgment and operator routing
- add richer worker controls if needed later

## 10. Planning decisions

- runtime operations deserve a dedicated route family
- `System` should not become the accidental home of queue ops
- `Executions` should remain history-first, not operator-first
- alert delivery should reuse existing notification settings where possible before introducing a separate alerting subsystem

## Remaining work

The final plan still needs:
- exact dashboard nav wording and iconography
- API response contracts for runtime summaries, alerts, and dead-letter listings
- route-level permission and capability states for monitor versus operator versus admin
