# FlowHolt Runtime Queue And Retention Draft

This file converts the backend entity and event model into a more operational runtime plan.

It is grounded in:
- `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md`
- current FlowHolt scheduler, repository, executor, and main backend behavior in:
  - `backend/app/scheduler.py`
  - `backend/app/repository.py`
  - `backend/app/executor.py`
  - `backend/app/main.py`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| n8n scaling / queue mode | `research/n8n-docs-export/pages_markdown/hosting/scaling/queue-mode.md` | Comparison: Redis+BullMQ vs Postgres queue |
| n8n execution data pruning | `research/n8n-docs-export/pages_markdown/hosting/scaling/execution-data-pruning.md` | Retention TTL + count config |
| n8n binary data modes | `research/n8n-docs-export/pages_markdown/hosting/scaling/binary-data-modes.md` | Database vs S3 binary data storage |
| Make execution flow | `research/make-help-center-export/pages_markdown/scenario-execution-flow.md` | ACID phases, execution lifecycle |
| Make incomplete executions | `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` | Incomplete execution retention + retry |
| Make execution history | `research/make-help-center-export/pages_markdown/scenario-history.md` | History retention periods |
| n8n queue source | `n8n-master/packages/cli/src/scaling/queue-based-execution-lifecycle.ts` | Queue claiming pattern |
| n8n execution repository | `n8n-master/packages/cli/src/repositories/execution.repository.ts` | How n8n stores execution data |
| n8n pruning | `n8n-master/packages/cli/src/services/pruning/pruning.service.ts` | TTL-based pruning logic |

### n8n comparison (queue + retention)

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Queue backend | Redis + BullMQ | Postgres SELECT FOR UPDATE SKIP LOCKED |
| Binary data | Database or S3 mode | Database mode (S3 planned Phase 2) |
| Execution pruning | TTL (days) + count limit, configurable via env | Workspace-level `execution_retention_days` setting |
| Artifact storage | JSON blobs in DB | Same — `execution_artifacts` table |
| Incomplete executions | Failed jobs stored; manual retry | Same + auto-retry schedule (Make pattern) |

### This file feeds into

| File | What it informs |
|------|----------------|
| `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` | Worker topology design |
| `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md` | Queue dashboard metrics |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | Job/Execution entity retention |
| `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` | Binary data mode planning |

---

The runtime must be planned as an operating system for automations, not just a function call that happens after `Run once`.

That means explicit plans for:
- job creation
- queue claiming
- execution environment resolution
- pause and resume
- replay
- artifact persistence
- retention
- concurrency

## Current FlowHolt evidence

The current backend already supports important runtime patterns:
- queued workflow jobs
- scheduler-generated jobs for schedule triggers
- replay as queued or immediate execution
- draft, staging, and production environment resolution
- paused executions for delay, human, and callback steps
- execution artifacts with retention pruning
- workspace-level concurrency limit
- execution payload redaction

That is enough to plan a mature runtime model now.

## Runtime object chain

The operational chain should be:

1. Trigger event or manual action
2. Workflow job
3. Execution record
4. Step results
5. Execution artifacts
6. Notifications, audit events, and analytics projections

Each layer should have its own lifecycle and storage needs.

## Job production model

Jobs may be produced by:
- manual run from Studio
- replay request
- schedule trigger
- webhook trigger
- public chat trigger
- internal callback resume
- human-task completion

### Job payload rules

Every job payload should include system metadata when relevant:
- trigger type
- originating event id
- source execution id for replay
- target environment
- source version reference

Replay already follows this pattern in current `main.py` through replay payload metadata.

## Queue topology

The final plan should formalize three conceptual runtime lanes:

### 1. Interactive lane

For:
- Studio `Run once`
- node test runs
- fast manual debugging

Characteristics:
- low latency
- tighter timeout expectations
- draft or staging by default
- may use pinned data in non-production contexts

### 2. Scheduled and event lane

For:
- schedules
- webhooks
- public chat triggers
- inbound callbacks

Characteristics:
- production-first
- durable queueing
- event deduplication where relevant
- policy-aware environment resolution

### 3. Resume and recovery lane

For:
- paused human tasks
- delay resumes
- callback resumes
- failed-job retry later

Characteristics:
- stateful continuation
- resume payload support
- stricter idempotency rules

## Worker model

The worker plan should separate at least these responsibilities:
- claim next eligible job
- resolve runtime definition for environment
- enforce workspace concurrency
- build vault context
- execute workflow
- persist execution and artifacts
- dispatch alerts and audit events

This does not require physically separate worker binaries at first, but the responsibilities should be explicit in the architecture.

## Environment resolution order

The runtime should resolve execution definition using this order:

1. explicit runtime override for replay or special execution
2. production published version when target environment is production
3. staging version when target environment is staging
4. current draft definition for draft/manual execution

This is already strongly reflected in current `main.py`.

## Queue claim and lease model

Planned job fields:
- `status`
- `available_at`
- `leased_until`
- `attempts`
- `max_attempts`
- `execution_id`
- `error_text`

Lease rules:
- workers claim jobs by setting a lease
- expired leases return jobs to claimable state
- attempts increase on each lease or failure path according to final design

## Concurrency model

Current workspace settings already include `max_concurrent_executions`.

The final plan should enforce concurrency at:
- workspace level first
- workflow level later
- asset-sensitive operations later if needed

Additional future controls:
- queue priority
- per-trigger throttles
- per-workflow maximum active runs

## Pause and resume model

Paused execution is a first-class runtime state, not a failure state.

Supported pause kinds already visible in current FlowHolt:
- delay
- human
- callback

### Pause handling rules

On pause:
- persist execution state
- persist pause record
- persist artifacts needed for inspection
- expose resume or cancel endpoints

On resume:
- load previous state
- merge resume payload where allowed
- continue from paused step successor logic

## Replay model

Current replay evidence already supports:
- `same_version`
- `latest_published`
- `current_draft`
- queued replay
- immediate replay

Planning rules:
- replay should preserve provenance
- replay should record source execution id
- payload overrides must be audited
- production replay should respect current environment policy and redaction rules

## Artifact persistence model

Execution artifacts should be stored by direction and sensitivity class.

Planned artifact categories:
- input
- output
- state
- error
- summary
- pause

### Persistence rules

Persist when:
- workflow or workspace policy allows
- execution type matches configured save mode
- progress persistence is enabled where needed

Redaction rules:
- payloads may be replaced with redacted placeholders
- step outputs may be filtered before storage
- production traces may store summary-only later

## Retention model

Current repository code already includes artifact pruning by retention days.

The final plan should distinguish retention by object family:

### Short retention

Best for:
- full payload artifacts
- detailed step outputs
- verbose logs

### Medium retention

Best for:
- execution summaries
- pause records
- human task responses

### Long retention

Best for:
- audit events
- deployment records
- workflow versions
- approval decisions

### Never auto-delete or archive-only

Best for:
- organization membership history if needed
- critical compliance events later

## Retention resolution order

The platform should resolve retention using:

1. legal or compliance hold later
2. workspace policy
3. environment stricter rule
4. workflow-specific stricter rule
5. artifact-type default

The strictest applicable rule should win.

## n8n execution data pruning — confirmed configuration model

n8n's pruning model is the reference implementation for FlowHolt's retention strategy.

### Pruning triggers (age OR count, whichever comes first)

| Mechanism | Default | n8n env var | FlowHolt equivalent |
|-----------|---------|-------------|---------------------|
| Age-based | 336h (14 days) | `EXECUTIONS_DATA_MAX_AGE` | `execution_retention_hours` per workspace |
| Count-based | 10,000 executions | `EXECUTIONS_DATA_PRUNE_MAX_COUNT` | `execution_retention_max_count` per workspace |
| Safety buffer | 1h | `EXECUTIONS_DATA_HARD_DELETE_BUFFER` | Do not delete executions < 1h old regardless |

### Pruning exclusions (n8n confirmed)

Never pruned:
- Executions with status `new`, `running`, or `waiting`
- **Annotated executions** (tagged, rated, or named)

FlowHolt equivalent: executions with investigation notes, compliance holds, or operator annotations must be excluded from auto-pruning.

### Binary data pruning note

n8n binary data pruning operates on the **active binary data mode** only:
- If you switch from S3 to filesystem mode, only filesystem binaries are pruned
- Old S3 binaries remain until manually cleared

FlowHolt: artifact pruning must be mode-aware (DB blob vs S3 object store).

### Per-object save configuration (n8n confirmed env vars)

| Setting | n8n env var | Default |
|---------|------------|---------|
| Save failed executions | `EXECUTIONS_DATA_SAVE_ON_ERROR` | `all` |
| Save successful executions | `EXECUTIONS_DATA_SAVE_ON_SUCCESS` | `all` |
| Save execution progress | `EXECUTIONS_DATA_SAVE_ON_PROGRESS` | `false` |
| Save manual executions | `EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS` | `true` |

These are also configurable per-workflow (overriding global defaults) — same as FlowHolt's current `save_failed_executions`, `save_successful_executions` etc. settings.

### FlowHolt improvements over n8n

- Per-workspace retention config (n8n is global env vars only)
- Retention per object family (execution summary vs artifacts vs step logs)
- Named annotations protected from pruning (same as n8n annotated executions)

## Idempotency model

The runtime plan should expect duplicate trigger attempts.

Idempotency should be tracked for:
- webhook events with event keys
- schedule events keyed by scheduled instant
- callback resumes keyed by pause or token
- human-task completion actions

Current scheduler evidence already uses trigger event creation and event keys before queueing jobs.

## Observability model

Operational telemetry should distinguish:
- jobs waiting
- jobs leased
- active executions
- paused executions
- failed executions
- replay volume
- artifact storage growth
- prune counts

## Failure handling model

Failure classes:
- validation failure before execution
- worker claim or lease failure
- step execution failure
- timeout
- pause resume failure
- artifact persistence failure

Planned handling:
- record machine-readable failure reason
- preserve execution summary even when payloads are redacted
- support retry policy later

## Release-aware runtime rules

Production:
- must use published version
- pinned data must not influence runtime
- stricter payload redaction likely

Staging:
- should use staged version
- useful for release validation

Draft:
- may use current draft
- may use pinned data for manual runs only

Current FlowHolt already reflects the important pinned-data restriction: pinned data is only used outside production for manual-style testing paths.

## Planning decisions for FlowHolt

- Queue jobs and executions must remain separate objects.
- Replay is a core runtime feature, not a support tool.
- Pause and resume are normal runtime states, not exceptional hacks.
- Artifact retention must be policy-driven and environment-aware.
- Concurrency and queue behavior belong in the product plan, not just infrastructure notes.

## Remaining work

The final runtime plan still needs:
- worker deployment topology
- retry backoff design
- dead-letter policy
- exact artifact schema
- queue observability dashboard spec
- resume-token and callback security details
