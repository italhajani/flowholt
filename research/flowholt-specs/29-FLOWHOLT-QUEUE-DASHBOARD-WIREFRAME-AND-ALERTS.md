# FlowHolt Queue Dashboard Wireframe And Alerts

This file turns the runtime runbook draft into a more exact dashboard and alert plan.

It is grounded in:
- `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md`
- `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md`
- current runtime status contracts in `src/lib/api.ts`
- current backend scheduler and execution behavior
- Make UI evidence showing persistent low-friction operating controls near the bottom of the working surface

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Queue runbooks | `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md` | Queue views: overview, worker health, retry/DLQ board |
| Worker topology | `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` | Worker roles, queue lanes, alert thresholds |
| n8n queue mode | `research/n8n-docs-export/pages_markdown/hosting__scaling__queue-mode.md` | Queue mode worker coordination |
| n8n worker docs | `research/n8n-docs-export/pages_markdown/hosting__scaling__overview.md` | Worker health check pattern |
| Make execution management | `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` | Dead-letter (incomplete executions) board pattern |
| Runtime status | `backend/app/main.py` → `GET /api/system/status` | Current system status API |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Worker health check | `n8n-master/packages/cli/src/health-check.controller.ts` |
| Metrics endpoint | `n8n-master/packages/cli/src/controllers/metrics.controller.ts` |
| Queue lifecycle | `n8n-master/packages/cli/src/scaling/queue-based-execution-lifecycle.ts` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Health check endpoint | `/healthz/readiness`, `/healthz/liveness` | Planned: `/health/ready` |
| Prometheus metrics | `/metrics` endpoint | Planned: Phase 2 |
| Queue monitoring | Redis/BullMQ queue stats | Postgres `jobs` table query |

### This file feeds into

| File | What it informs |
|------|----------------|
| `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` | Route structure for runtime operations |
| `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | API contracts for queue dashboard endpoints |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | §7 system health metrics + §9 log streaming |

---

## Goal

Define:
- what the runtime operations screens should contain
- which thresholds should alert
- which operator workflows should be first-class

## 1. Main queue operations layout

The runtime operations area should use a stable three-zone layout.

### Top zone: filter and status ribbon

Controls:
- workspace selector
- environment selector
- lane selector
- workflow search
- time range
- alert-state filter

Ribbon cards:
- pending jobs
- oldest pending age
- leased jobs
- dead-letter count
- paused executions
- scheduler health
- worker health

### Middle zone: primary operational boards

Left column:
- queue lane health board
- worker health board

Center column:
- dead-letter and retry board
- incident trend chart

Right column:
- paused execution board
- overdue human tasks
- callback waits nearing timeout

### Bottom zone: drill-down tables

Tabs:
- jobs
- executions
- pauses
- failures
- replay activity

This should mirror the same principle visible in Make's canvas UI: important operating actions stay within reach and do not disappear behind route changes.

## 2. Queue lane health board

Each lane card should show:
- lane name
- pending count
- leased count
- oldest pending age
- average wait time
- current throughput
- alert state

Minimum lanes to model:
- `interactive_run`
- `scheduled_event`
- `webhook_event`
- `resume_wait`
- `replay`
- `maintenance`

Card actions:
- open filtered jobs
- open affected workflows
- open dead-letter jobs

## 3. Worker health board

Cards:
- scheduler
- execution processor
- resume processor
- maintenance worker

Each card shows:
- current state
- last heartbeat
- last successful cycle
- jobs handled in last 5 minutes
- lease expiry count
- last error summary

Actions:
- inspect logs later
- drain worker later
- restart worker later

## 4. Dead-letter and retry board

Sections:
- retryable failures
- non-retryable failures
- newest dead-letter items
- top failing workflows

Row fields:
- workflow
- lane
- failure class
- first failed at
- retry count
- environment
- policy blocker yes or no

Actions:
- inspect execution
- inspect workflow
- requeue
- discard
- attach note later

## 5. Paused execution board

Summary cards:
- delayed resumes
- human tasks open
- callback waits open
- overdue items

Table fields:
- workflow
- execution
- pause type
- step
- waiting since
- due or resume time
- assignee when relevant
- current status

Actions:
- resume
- cancel
- open task
- inspect execution

## 6. Initial alert thresholds

Use clear warning and critical levels from the start.

| Signal | Warning | Critical | Notes |
| --- | --- | --- | --- |
| oldest pending age | over 60s on `interactive_run` | over 300s on `interactive_run` | interactive runs should stay fast |
| queue wait average | over 30s for 10m | over 120s for 10m | evaluate per lane |
| dead-letter count | 1+ new in 15m | 5+ new in 15m | production lanes escalate faster |
| worker heartbeat gap | over 60s | over 180s | per worker role |
| scheduler cycle failure rate | 3 consecutive failures | 10 consecutive failures | likely infra or code issue |
| paused execution overdue | 10 overdue items | 50 overdue items | split by human and callback |
| callback timeout risk | 5 items within 15m of timeout | 20 items within 15m of timeout | useful for resume lane |
| replay failure ratio | over 10% in 30m | over 25% in 30m | indicates version mismatch or asset issue |
| concurrent execution saturation | over 80% of limit | at configured limit | use workspace settings limit |

## 7. Operator workflows

### Workflow A: interactive backlog spike

Steps:
1. open lane health board filtered to `interactive_run`
2. check oldest pending age and worker heartbeat
3. inspect top affected workflows
4. decide whether this is worker saturation, asset outage, or policy blockage
5. requeue only after the root cause is cleared

### Workflow B: dead-letter burst after release

Steps:
1. filter dead-letter items to the recent time range
2. group by workflow version and environment
3. compare against recent publish or promote events
4. if the pattern aligns with one release, stop requeue and route to release rollback analysis

### Workflow C: callback resume degradation

Steps:
1. filter paused board to `callback`
2. inspect callbacks near timeout
3. compare endpoint error class and recent callback events
4. if resume lane is healthy, treat as integration outage
5. if resume lane is unhealthy, escalate to worker incident

### Workflow D: human-task backlog

Steps:
1. filter paused board to `human`
2. group by assignee and workflow
3. identify overdue approvals
4. notify owners or reassign when policy allows later

## 8. Permission model

- viewers should not see queue operations by default
- monitors can see summaries and filtered tables but no requeue or cancel actions
- operators can inspect, requeue, resume, and cancel
- admins can perform wider remediation and future worker controls

## 9. API backlog implied by this plan

Future backend support should expose:
- queue lane summaries
- worker heartbeats and last error summaries
- dead-letter job listing with classification
- paused execution listing with due-state filters
- aggregate alert status per workspace and environment

## Remaining work

The final plan still needs:
- exact route layout for the runtime operations area
- notification routing rules for alerts
- dead-letter object schema and retention rules
