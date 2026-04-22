# FlowHolt Worker Topology And Queue Operations

This file extends the runtime queue draft into a more exact worker, retry, dead-letter, and observability plan.

It is grounded in:
- `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md`
- current runtime behavior in:
  - `backend/app/scheduler.py`
  - `backend/app/executor.py`
  - `backend/app/main.py`
  - `backend/app/repository.py`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| n8n scaling docs | `research/n8n-docs-export/pages_markdown/hosting/scaling/` | Worker scaling patterns, queue modes |
| n8n queue mode | `research/n8n-docs-export/pages_markdown/hosting/scaling/queue-mode.md` | Redis+BullMQ queue architecture (contrast: FlowHolt uses Postgres) |
| n8n worker docs | `research/n8n-docs-export/pages_markdown/hosting/scaling/workers.md` | Worker concurrency, health checks |
| Make execution flow | `research/make-help-center-export/pages_markdown/scenario-execution-flow.md` | Execution phases, ACID model |
| Make incomplete executions | `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` | Dead-letter pattern |
| Make retry | `research/make-help-center-export/pages_markdown/exponential-backoff.md` | 8-attempt backoff schedule |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Queue mode orchestrator | `n8n-master/packages/cli/src/scaling/queue-based-execution-lifecycle.ts` |
| Job scheduler | `n8n-master/packages/cli/src/services/orchestration/webhook/webhook-helpers.service.ts` |
| Worker process | `n8n-master/packages/cli/src/commands/worker.ts` |
| Health check | `n8n-master/packages/cli/src/health-check.controller.ts` |
| Metrics endpoint | `n8n-master/packages/cli/src/controllers/metrics.controller.ts` |
| Redis scaling | `n8n-master/packages/cli/src/scaling/redis/` |
| Job processing | `n8n-master/packages/cli/src/execution-lifecycle-hooks.ts` |

### n8n comparison (queue topology)

| Feature | n8n queue mode | FlowHolt |
|---------|---------------|---------|
| Queue backend | Redis + BullMQ | Postgres (SELECT FOR UPDATE SKIP LOCKED) — Windmill pattern |
| Workers | Separate process `n8n worker` | Same: separate `worker.py` process |
| Concurrency | `--concurrency N` flag | `MAX_CONCURRENT_EXECUTIONS` env var |
| Health check | `/healthz/readiness` | Planned: `/health/ready` |
| Metrics | Prometheus `/metrics` | Planned: Phase 2 |
| Dead-letter | Failed jobs stored in DB | Same: failed jobs in `workflow_jobs` table |

### This file feeds into

| File | What it informs |
|------|----------------|
| `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` | Queue retention rules |
| `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md` | Queue dashboard data sources |
| `29-FLOWHOLT-QUEUE-DASHBOARD-WIREFRAME-AND-ALERTS.md` | Dashboard wireframe |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Queue + worker domain modules |
| `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` | Architecture decisions (health checks, metrics) |

---

Define how FlowHolt should operate automation runtime as a stable backend system, not just a set of endpoints.

## Worker topology

The target runtime should have four operational worker roles, even if they initially share one deployment.

### 1. Scheduler worker

Responsibilities:
- evaluate due schedules
- create trigger events
- enqueue scheduled jobs

Current evidence:
- `scheduler.py` already checks due workflows and creates jobs with schedule payload metadata

### 2. Job processor

Responsibilities:
- claim eligible jobs
- resolve environment and version
- create execution records
- dispatch execution

Current evidence:
- `system/process-jobs` path and job records already exist

### 3. Resume processor

Responsibilities:
- handle delay resumes
- handle callback resumes
- handle human-task completion resumption

Reason for separate conceptual role:
- resume flows are stateful and should not be mixed mentally with first-run dispatch

### 4. Maintenance worker

Responsibilities:
- prune execution artifacts
- compact analytics projections later
- expire stale leases later
- process dead-letter recovery later

Current evidence:
- artifact pruning endpoint already exists

## Queue lane model

The queue should eventually expose explicit lanes:
- interactive
- scheduled_event
- resume_recovery
- maintenance later if needed

### Interactive lane

Carries:
- manual run once
- replay requested by user
- debug-oriented runs

Operational target:
- low latency
- high responsiveness

### Scheduled event lane

Carries:
- schedules
- webhooks
- chat triggers

Operational target:
- durable
- idempotent
- production-safe

### Resume recovery lane

Carries:
- delayed resume
- callback resume
- human-task completion continuation
- retry and dead-letter recovery later

Operational target:
- correctness over speed

## Job lifecycle refinement

Planned states:
- pending
- queued
- leased
- running
- completed
- failed_retryable
- failed_terminal
- cancelled
- dead_lettered

Current implementation may collapse some of these, but the final plan should keep them conceptually distinct.

## Retry model

Retries should not be implicit or ambiguous.

### Retry classes

Retryable:
- temporary provider outage
- lease interruption
- transient network failure
- callback delivery race

Usually not retryable:
- invalid workflow definition
- missing required asset
- authorization failure
- deterministic step validation error

### Retry policy dimensions

Per job:
- max attempts
- next available time
- last error category

Per workflow later:
- retry policy override
- retry backoff profile

### Backoff model

Initial target:
- exponential backoff with cap
- jitter later

## Dead-letter model

A dead-letter queue should exist as an explicit operational state.

A job reaches dead letter when:
- it exhausts retry budget
- it is poisoned by deterministic failure after classification
- it cannot be resumed safely

Dead-letter record should retain:
- job id
- workflow id
- execution id if any
- environment
- trigger type
- failure class
- last error text
- payload reference

Operator actions later:
- inspect
- requeue after fix
- discard
- link to workflow issue

## Lease and stuck-job handling

Planned rules:
- worker claim sets `leased_until`
- heartbeat extends lease later if long-running
- expired lease returns job to claimable state
- repeated lease expiry increments an operational anomaly counter

This is important because a mature runtime must tolerate process death without manual cleanup.

## Execution dispatch flow

Target sequence:
1. claim job
2. classify lane and environment
3. resolve runtime definition and policy
4. enforce concurrency
5. build vault and secret context
6. create execution record
7. execute workflow
8. persist results and artifacts
9. emit audit and notifications
10. finalize job state

## Concurrency controls

Current workspace-level max concurrency already exists.

### n8n concurrency model (confirmed from docs)

n8n's `N8N_CONCURRENCY_PRODUCTION_LIMIT` env var controls concurrency in both regular mode and queue mode:

| Mode | Mechanism | Notes |
|------|-----------|-------|
| Regular mode | `N8N_CONCURRENCY_PRODUCTION_LIMIT=20` | FIFO queue for over-limit executions |
| Queue mode | `--concurrency N` flag per worker (env var overrides) | Per-worker concurrency, not instance-wide |

Key constraints from n8n docs:
- Concurrency control applies **only to production executions** (webhook-started or trigger-started)
- Does **NOT** apply to: manual executions, sub-workflow executions, error executions, CLI-started executions
- On instance startup, n8n resumes queued executions up to the limit and re-enqueues the rest
- Cannot retry queued executions; cancelling/deleting removes them from queue
- Concurrency disabled by default (`-1`)

### FlowHolt concurrency model

FlowHolt improvement over n8n: concurrency limits should be **per-workspace**, not global, allowing multi-tenant isolation.

The final operations plan should layer:
- workspace concurrency hard limit (configurable per workspace, not global env var)
- workflow concurrency soft limit later
- trigger-specific throttles later
- lane-specific concurrency pools later (map directly to queue lanes in `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md`)

## Observability dashboard plan

The runtime needs an operations dashboard, not just execution history.

Primary metrics:
- jobs pending by lane
- jobs leased
- average queue wait time
- executions running
- executions paused
- replay count
- retry count
- dead-letter count
- artifact prune count
- per-workspace concurrency saturation

Primary views:
- queue overview
- worker health
- retry and dead-letter board
- paused execution board

## Alerting plan

Important alerts:
- queue backlog exceeds threshold
- lease expiry spike
- repeated dead-letter on one workflow
- prune failures
- callback resume failures
- schedule enqueue failures

## Artifact retention operations

Retention work should be observable.

Maintenance metrics:
- artifacts pruned today
- bytes reclaimed
- oldest retained artifact age
- redacted versus full artifact ratio

## Security and governance hooks

Operational tooling must respect policy too.

Examples:
- dead-letter inspectors may still need payload redaction
- queue dashboards should not leak secret values
- replay from dead-letter must re-run policy checks

## Deployment path

Phase 1:
- single process with conceptual worker roles
- manual or scheduled system endpoints

Phase 2:
- dedicated scheduler and job processor separation
- background maintenance

Phase 3:
- explicit dead-letter handling
- richer observability and lane-specific pools

## Planning decisions for FlowHolt

- Treat retry and dead-letter as product runtime concerns, not hidden infra trivia.
- Separate scheduler, processor, resume, and maintenance concerns even if code remains colocated at first.
- Build operational dashboards around jobs and queues, not only finished executions.
- Keep policy enforcement active during retries, resumes, and replay, not only first-run execution.

## Remaining work

The final plan still needs:
- exact retry classification table
- lease heartbeat model
- operator playbooks
- queue dashboard wireframe
- maintenance job schedule matrix
