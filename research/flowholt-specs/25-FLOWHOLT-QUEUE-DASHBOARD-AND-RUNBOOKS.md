# FlowHolt Queue Dashboard And Runbooks

This file turns the worker topology draft into operational dashboard and runbook plans.

It is grounded in:
- `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md`
- current runtime and system endpoints in `backend/app/main.py`
- current queueing and schedule behavior in `backend/app/scheduler.py`

## Cross-Reference Map

### This file is grounded in (raw sources)

- `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` — Make incomplete execution management: tab layout, execution status states, retry/resolve/delete actions available to operators
- `research/make-help-center-export/pages_markdown/scenario-run-replay.md` — Make replay from builder, history tab, and run detail view
- `research/make-help-center-export/pages_markdown/scenario-settings.md` — Make sequential processing and incomplete execution storage settings that affect queue behavior
- `research/n8n-docs-export/pages_markdown/hosting__scaling__queue-mode.md` — n8n queue mode architecture: Redis-backed BullMQ worker topology, job lanes, and scaling configuration

### Key n8n source code files

- `n8n-master/packages/cli/src/scaling/` — n8n worker scaling layer: job dispatch, worker registration, queue management
- `n8n-master/packages/cli/src/scaling/job-processor/` — n8n job processor: lease, execution dispatch, completion handling
- `n8n-master/packages/cli/src/services/orchestration/` — n8n orchestration service: multi-worker coordination and heartbeat tracking

### n8n/Make comparison

- Make exposes an operator-facing incomplete execution management UI (retry, resolve, delete per execution) but provides no worker-level visibility or queue metrics
- n8n queue mode uses Redis-backed BullMQ with multiple worker processes; there is no built-in dashboard UI for queue health, worker status, or dead-letter review — operators must use Redis tooling directly
- FlowHolt combines Make's execution triage UI (retry, requeue, discard, dead-letter review) with n8n-style worker health metrics (throughput, lease expiry, heartbeat) into a unified operator queue dashboard

### This file feeds into

- `29-FLOWHOLT-OPERATIONS-ROUTE-SPEC.md` — operations route family structure
- `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` — full runtime ops route spec
- `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` — runtime API response contracts for queue and worker surfaces

## Goal

Define what operators and maintainers need to see and do when the runtime is unhealthy, slow, or blocked.

## Queue dashboard surfaces

The runtime operations area should eventually include four dashboard views.

## 1. Queue overview

Purpose:
- show current job pressure and lane health

Widgets:
- pending jobs by lane
- leased jobs by lane
- average queue wait time
- oldest pending job age
- dead-letter count
- active executions
- paused executions
- replay jobs in last 24h

Filters:
- workspace
- lane
- environment
- workflow
- trigger type

## 2. Worker health

Purpose:
- show whether schedulers and processors are functioning

Widgets:
- scheduler last successful cycle
- jobs processed per minute
- resume processor throughput
- maintenance last prune time
- lease expiry count

## 3. Retry and dead-letter board

Purpose:
- surface systematic failures

Widgets:
- retryable failures by class
- top failing workflows
- dead-letter backlog
- last dead-letter transitions

Actions:
- inspect failure
- requeue
- discard
- open workflow

## 4. Paused execution board

Purpose:
- make paused work operationally visible

Widgets:
- paused by type: delay, human, callback
- oldest paused execution
- overdue human tasks
- callback waits with repeated failures later

## Dashboard event and metric model

Minimum metrics to emit:
- `jobs.pending.count`
- `jobs.leased.count`
- `jobs.dead_letter.count`
- `jobs.wait_ms.avg`
- `executions.running.count`
- `executions.paused.count`
- `executions.failed.count`
- `scheduler.cycles.success`
- `scheduler.cycles.failed`
- `artifacts.pruned.count`
- `artifacts.pruned.bytes`

## Retry classification table

| Failure class | Typical cause | Retryable | Initial handling | Escalation |
| --- | --- | --- | --- | --- |
| Provider transient | upstream model or API outage | yes | backoff and retry | alert if repeated |
| Network transient | timeouts, DNS, connection reset | yes | backoff and retry | alert if lane-wide |
| Lease interruption | worker crash or restart | yes | requeue after lease expiry | investigate worker health |
| Validation deterministic | invalid config or schema mismatch | no | fail terminal | open workflow issue |
| Missing asset | deleted or unavailable credential | usually no | fail terminal | notify owner/admin |
| Authorization policy | role or environment blocked | no | fail terminal | show policy blocker |
| Callback race | late or duplicate callback | yes | dedupe then retry when safe | inspect callback source |
| Resume corruption | missing pause state | no | dead-letter candidate | manual investigation |

## Dead-letter runbooks

## Runbook A: Single dead-lettered workflow

Steps:
1. inspect workflow id, environment, and failure class
2. open most recent execution and artifact metadata
3. determine whether the issue is definition, asset, policy, or provider related
4. if fixed, requeue from dead-letter board
5. if not fixable immediately, attach issue reference and leave quarantined

## Runbook B: Dead-letter spike across many workflows

Likely causes:
- provider outage
- worker release regression
- queue lease issue
- storage failure

Steps:
1. check worker health dashboard
2. group dead-letter jobs by failure class
3. pause automatic requeue if provider-wide issue is detected
4. escalate to system incident path

## Runbook C: Schedule backlog

Symptoms:
- oldest pending job age rising
- scheduled_event lane saturation

Steps:
1. compare scheduler enqueue rate vs processor throughput
2. inspect concurrency saturation
3. identify top workflows by backlog
4. apply throttle or temporary pause later if tooling exists

## Runbook D: Paused execution buildup

Symptoms:
- large paused queue
- overdue human tasks
- callback resumes not happening

Steps:
1. split by pause type
2. inspect callback endpoint health
3. inspect overdue human tasks
4. identify resumes blocked by policy or missing state

## Queue dashboard permissions

Builder:
- should not see full platform-wide ops dashboard by default
- may see workspace-limited runtime summaries

Operator:
- primary operational user
- sees queue health, retry board, paused board

Monitor:
- sees read-only queue summaries and failure trends

Restricted Publisher:
- limited operational visibility useful for release validation

Admin roles:
- see full remediation actions

## Operational drill-down links

Every dashboard card should drill into:
- executions list filtered to the relevant set
- job list filtered to lane and status
- workflow detail or Studio
- deployment review or policy page when policy caused the issue

## Initial build sequence

Phase 1:
- queue overview
- paused execution board
- basic retry table in docs

Phase 2:
- dead-letter board
- worker health
- requeue and discard actions

Phase 3:
- anomaly detection and alerting
- workspace and org comparative ops views

## Remaining work

The final plan still needs:
- dashboard wireframe blocks
- exact alert thresholds
- operator notification routing
- dead-letter storage schema
