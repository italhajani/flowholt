---
title: Runtime Operations
type: concept
tags: [runtime, queue, workers, dead-letter, alerts, dashboard]
sources: [plan-file-19, plan-file-22, plan-file-25, plan-file-29, plan-file-32]
updated: 2026-04-16
---

# Runtime Operations

The operational layer for managing live workflow execution. Queue management, worker health, dead-letter handling, and alert monitoring. A dedicated route family (not buried in Executions or System pages).

---

## 7 Route Contracts

| Route | Purpose |
|-------|---------|
| `/runtime/overview` | Queue stats, worker counts, active jobs, error rate |
| `/runtime/jobs` | Active and recent job list with filter/sort |
| `/runtime/pauses` | All paused executions waiting for human resume |
| `/runtime/failures` | Failed executions, error type breakdown |
| `/runtime/workers` | Worker health, current load, last heartbeat |
| `/runtime/alerts` | Active alert conditions, threshold states |
| `/runtime/dead-letters` | Dead-letter items, reprocess actions |

---

## Queue Lanes

| Lane | Priority | Content |
|------|---------|---------|
| Interactive | Highest | Manual runs from Studio |
| Webhook | High | Webhook-triggered runs |
| Scheduled | Normal | Cron/schedule-triggered runs |
| Retry | Low | Auto-retry of incomplete executions |
| Maintenance | Lowest | Cleanup, health checks |

---

## Worker Topology

| Worker type | Role |
|------------|------|
| Scheduler | Polls for due triggers, enqueues jobs |
| Processor | Executes workflow runs |
| Resume | Processes human inbox completions |
| Retry | Processes incomplete execution retries |
| Dead-letter | Handles exhausted retries |
| Maintenance | Cleanup, log rotation |

---

## Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|---------|
| Queue depth | > 50 | > 200 |
| Worker error rate | > 5% | > 20% |
| Dead-letter growth | > 10/hr | > 50/hr |
| P95 execution latency | > 30s | > 120s |

---

## Runtime Capabilities (Workspace-Level)

14 distinct capability states, computed at workspace level:
- `can_view_queue`, `can_view_workers`, `can_reprocess_dead_letters`
- `can_stop_execution`, `can_resume_pause`, `can_replay_execution`
- `can_view_worker_logs`, `can_configure_alerts`, ...

---

## Related Pages

- [[wiki/concepts/execution-model]] — what creates jobs and incomplete executions
- [[wiki/concepts/error-handling]] — dead-letter sources, retry schedule
- [[wiki/concepts/webhook-trigger-system]] — webhook queue management
- [[wiki/concepts/observability-analytics]] — runtime metrics feed analytics dashboard
- [[wiki/concepts/backend-architecture]] — runtime domain module
- [[wiki/sources/flowholt-plans]] — plan files 19, 22, 25, 29, 32
