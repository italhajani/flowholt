# FlowHolt Backend Architecture — Full Specification

> **Status:** Rebuilt 2026-04-16 from n8n Domain 8 research (10 pages) + existing backend codebase audit  
> **Direction:** n8n's Main+Workers+Redis+Postgres topology as reference; FlowHolt's Postgres-as-queue pattern validated.  
> **Vault:** [[wiki/concepts/backend-architecture]]  
> **Raw sources:**  
> - n8n scaling: `research/n8n-docs-export/pages_markdown/hosting/scaling/` (10 pages)  
> - Current codebase: `backend/app/main.py` (~10K lines, monolith), `backend/app/executor.py`, `backend/app/worker.py`  
> **See also:** `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` | `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` § Domain 8

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Worker topology | `research/n8n-docs-export/pages_markdown/hosting/scaling/workers.md` | Worker process model |
| Queue mode | `research/n8n-docs-export/pages_markdown/hosting/scaling/queue-mode.md` | Redis+BullMQ vs Postgres queue |
| Health endpoints | `research/n8n-docs-export/pages_markdown/hosting/scaling/health-checks.md` | `/healthz/readiness`, `/healthz/liveness` |
| Metrics | `research/n8n-docs-export/pages_markdown/hosting/scaling/metrics.md` | Prometheus `/metrics` endpoint |
| Binary data | `research/n8n-docs-export/pages_markdown/hosting/scaling/binary-data-modes.md` | Database vs S3 |
| Code isolation | `research/n8n-docs-export/pages_markdown/hosting/scaling/task-runners.md` | Task runner sidecar pattern |
| Execution pruning | `research/n8n-docs-export/pages_markdown/hosting/scaling/execution-data-pruning.md` | TTL + count retention |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Worker process | `n8n-master/packages/cli/src/commands/worker.ts` |
| Queue lifecycle | `n8n-master/packages/cli/src/scaling/queue-based-execution-lifecycle.ts` |
| Health controller | `n8n-master/packages/cli/src/health-check.controller.ts` |
| Metrics controller | `n8n-master/packages/cli/src/controllers/metrics.controller.ts` |
| Pruning service | `n8n-master/packages/cli/src/services/pruning/pruning.service.ts` |
| Task runner | `n8n-master/packages/task-runners/` |
| Binary data | `n8n-master/packages/core/src/binary-data/` |

### This file feeds into

| File | What it informs |
|------|----------------|
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Module extraction plan |
| `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` | Worker topology detail |
| `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` | Queue + retention |
| `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` | Service map |

---

```
backend/app/
├── main.py              ← ALL routes (~10K lines, monolith — must be extracted)
├── models.py            ← All SQLAlchemy models
├── executor.py          ← Workflow execution engine
├── studio_runtime.py    ← Studio interactive run
├── studio_nodes.py      ← Node definitions + retry fields
├── node_registry.py     ← Node type registry
├── integration_registry.py
├── repository.py        ← Data access layer
├── auth.py              ← JWT + roles
├── scheduler.py         ← Trigger scheduling
├── seeds.py             ← Seed data
├── worker.py            ← Background job worker (Postgres-as-queue)
├── sandbox.py           ← Code node subprocess isolation
└── encryption.py        ← Credential encryption
```

**Problem:** `main.py` is ~10K lines with all routes in one file. Target: 13 domain modules, `main.py` < 200 lines.

---

## Target: 13 Domain Modules

Extraction order (smallest/most-isolated first):

| # | Module | Routes | Key entities | Priority |
|---|--------|--------|-------------|----------|
| 1 | `routers/system.py` | `/health`, `/health/ready`, `/metrics`, `/version` | None | **1st** |
| 2 | `routers/notification.py` | `/notifications/*` | Notification, AlertRule | 2nd |
| 3 | `routers/identity.py` | `/auth/*`, `/users/*`, `/api-keys/*` | User, Session, APIKey | 3rd |
| 4 | `routers/organization.py` | `/orgs/*`, `/teams/*` | Org, Team, TeamMember | 4th |
| 5 | `routers/workspace.py` | `/workspaces/*` | Workspace, WorkspaceSettings | 5th |
| 6 | `routers/workflow.py` | `/workflows/*`, `/versions/*` | Workflow, WorkflowVersion | 6th |
| 7 | `routers/studio.py` | `/studio/*` | StudioSession, NodeConfig | 7th |
| 8 | `routers/execution.py` | `/executions/*`, `/steps/*` | Execution, ExecutionStep | 8th |
| 9 | `routers/runtime.py` | `/jobs/*`, `/queue/*`, `/dead-letter/*` | Job, DeadLetterEntry | 9th |
| 10 | `routers/vault.py` | `/credentials/*`, `/variables/*`, `/assets/*` | Credential, Variable, Asset | 10th |
| 11 | `routers/agent.py` | `/agents/*`, `/knowledge/*` | Agent, KnowledgeCollection | 11th |
| 12 | `routers/integration.py` | `/integrations/*`, `/webhooks/*`, `/oauth/*` | Integration, WebhookEndpoint | 12th |
| 13 | `routers/assistant.py` | `/assistant/*` | AssistantSession, AssistantMessage | 13th |

**Target `main.py` after extraction:**
```python
from fastapi import FastAPI
from .routers import system, identity, organization, workspace, workflow, ...

app = FastAPI(title="FlowHolt API", version="1.0")

app.include_router(system.router)
app.include_router(identity.router, prefix="/auth")
app.include_router(organization.router, prefix="/orgs")
# ... etc
```

---

## Production Topology

FlowHolt's validated production architecture:

```
                    ┌─────────────────────────────────┐
                    │     FlowHolt API (FastAPI)       │
                    │  - All REST routes               │
                    │  - Scheduler (APScheduler)       │
                    │  - Webhook ingress               │
                    │  - Enqueues jobs to Postgres     │
                    └────────────┬────────────────────┘
                                 │ (jobs table)
                    ┌────────────▼────────────────────┐
                    │          PostgreSQL              │
                    │  - All persistence              │
                    │  - jobs table (queue)           │
                    │  - SELECT FOR UPDATE SKIP LOCKED │
                    └────────────┬────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
  ┌────────▼──────┐    ┌────────▼──────┐    ┌────────▼──────┐
  │   Worker 1    │    │   Worker 2    │    │   Worker N    │
  │  (Python)     │    │  (Python)     │    │  (Python)     │
  │               │    │               │    │               │
  │ ┌───────────┐ │    │ ┌───────────┐ │    │ ┌───────────┐ │
  │ │ sandbox.py│ │    │ │ sandbox.py│ │    │ │ sandbox.py│ │
  │ │ (Code node│ │    │ │ (Code node│ │    │ │ (Code node│ │
  │ │  subprocess│ │    │  subprocess│ │    │  subprocess│
  │ └───────────┘ │    └───────────┘ │    └───────────┘ │
  └───────────────┘    └───────────────┘    └───────────────┘
```

**n8n comparison:**
- n8n uses Redis + BullMQ. FlowHolt uses Postgres. Both are valid.
- `SELECT FOR UPDATE SKIP LOCKED` (Windmill pattern) — each worker atomically claims one job at a time. No double-processing.
- FlowHolt avoids Redis as a hard dependency at early stage. Switch to Redis later if needed (high concurrency).
- Workers are standalone Python processes, not in-process async tasks. Each runs `executor.py`.

---

## Postgres-as-Queue Implementation

**Jobs table:**
```sql
CREATE TABLE jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  execution_id UUID NOT NULL REFERENCES executions(id),
  status      TEXT NOT NULL DEFAULT 'pending',  -- pending | running | done | failed
  priority    INT NOT NULL DEFAULT 5,
  attempts    INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  lease_expires_at TIMESTAMPTZ,    -- NULL if not running; set to now()+30s when claimed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  run_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- for delayed/scheduled jobs
);
```

**Worker claim query:**
```sql
UPDATE jobs
SET status = 'running',
    lease_expires_at = NOW() + INTERVAL '30 seconds',
    attempts = attempts + 1
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'pending'
    AND run_at <= NOW()
  ORDER BY priority DESC, run_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

**Lease renewal:** Worker renews lease every 10s while job is running.  
**Stalled job recovery:** Any job with `status = 'running'` AND `lease_expires_at < NOW()` is reset to `pending` by a periodic cleanup task. Counts against `attempts`.

---

## Worker Configuration

| Setting | Env var | Default | Notes |
|---------|---------|---------|-------|
| Worker count | `FLOWHOLT_WORKER_COUNT` | 2 | Increase for higher throughput |
| Concurrency per worker | `FLOWHOLT_WORKER_CONCURRENCY` | 5 | Async tasks per worker process |
| Max execution timeout | `FLOWHOLT_EXEC_TIMEOUT_SEC` | 600 | Hard kill after this many seconds |
| Lease duration | `FLOWHOLT_JOB_LEASE_SEC` | 30 | Lease renewal interval × 3 |
| Stalled recovery interval | `FLOWHOLT_STALE_JOB_INTERVAL_SEC` | 60 | How often to scan for stalled jobs |

---

## Health Check Endpoints

**Current:** `/health` — returns 200 if process is alive (does not check DB)

**Missing (n8n pattern, must add):**

| Endpoint | Returns | Use |
|----------|---------|-----|
| `GET /health` | 200 always | Process liveness (existing) |
| `GET /health/ready` | 200 if DB connected + migrations current | Kubernetes readiness probe |
| `GET /metrics` | Prometheus text format | Infrastructure monitoring |

**`/health/ready` implementation:**
```python
@router.get("/health/ready")
async def health_ready(db: Session = Depends(get_db)):
    # Check DB connectivity
    db.execute(text("SELECT 1"))
    # Check Alembic migration version
    result = db.execute(text("SELECT version_num FROM alembic_version"))
    current = result.scalar()
    if current != EXPECTED_MIGRATION_VERSION:
        raise HTTPException(503, "Migrations not current")
    return {"status": "ready", "db": "connected", "migration": current}
```

**`/metrics` implementation (Phase 2):**  
Use `prometheus-fastapi-instrumentator` library. Exposes:
- HTTP request count/latency by route
- Active executions
- Queue depth (pending jobs count)
- Worker count

---

## Execution Data Retention

**n8n pattern:** TTL-based pruning + max count.  
**FlowHolt policy:**

| Config | Env var | Default | Notes |
|--------|---------|---------|-------|
| Execution TTL | `FLOWHOLT_EXEC_RETENTION_DAYS` | 14 | Days to keep execution records |
| Max execution count | `FLOWHOLT_EXEC_MAX_COUNT` | 10000 | Per-workspace cap |
| Hard delete buffer | `FLOWHOLT_EXEC_DELETE_BUFFER_HOURS` | 1 | Buffer before actual deletion |
| Analytics exemption | `FLOWHOLT_EXEC_ANALYTICS_RETAIN_DAYS` | 90 | Keep execution summaries longer for analytics |

**Prune query (runs nightly):**
```sql
-- Step 1: Mark for deletion (soft delete flag)
UPDATE executions
SET deleted_at = NOW()
WHERE status IN ('completed', 'failed')
  AND created_at < NOW() - INTERVAL '14 days'
  AND deleted_at IS NULL;

-- Step 2: Hard delete (after buffer)
DELETE FROM executions
WHERE deleted_at < NOW() - INTERVAL '1 hour';
```

---

## Binary Data Strategy

| Mode | When | Config |
|------|------|--------|
| `database` | Development, single-instance, small files | Default |
| `filesystem` | Single worker only (NOT queue-mode compatible) | Dev convenience |
| `s3` | Production, multi-worker | `FLOWHOLT_BINARY_STORAGE=s3` |

**S3 configuration:**
```
FLOWHOLT_S3_HOST=s3.amazonaws.com
FLOWHOLT_S3_BUCKET=flowholt-binary-data
FLOWHOLT_S3_REGION=us-east-1
FLOWHOLT_S3_ACCESS_KEY=...
FLOWHOLT_S3_SECRET_KEY=...
```

**Why filesystem mode is not viable in queue mode:** Workers are separate processes, possibly on different machines. They cannot share a local filesystem. Database or S3 is required.

---

## Code Node Isolation (sandbox.py)

**Current approach:** `sandbox.py` runs user code as a subprocess. This is the correct pattern.  
**n8n equivalent:** External task runner sidecar (`n8nio/runners` image).

Raw source: `research/n8n-docs-export/pages_markdown/hosting__configuration__task-runners.md`

### n8n Task Runner Architecture (Key Reference)

n8n's task runner system provides a production-grade Code node isolation model. FlowHolt's `sandbox.py` is equivalent conceptually but needs hardening.

**n8n components:**
1. **Task broker** — The n8n main process (or worker). Routes tasks via WebSocket.
2. **Task requester** — The Code node, requesting code execution.
3. **Task runner** — Process that actually executes the code.

**Two modes:**

| Mode | How it works | Security | Recommendation |
|------|-------------|----------|----------------|
| **Internal** | Child process of n8n, same `uid`/`gid` | Low — shares OS user | Development only |
| **External** | Sidecar container `n8nio/runners` | High — fully isolated | **Production required** |

**External mode deployment (Docker Compose pattern):**
```yaml
services:
  flowholt-api:
    image: flowholt/api:latest
    environment:
      - FLOWHOLT_RUNNER_MODE=external
      - FLOWHOLT_RUNNER_AUTH_TOKEN=your-secret-here
      - FLOWHOLT_RUNNER_BROKER_LISTEN_ADDRESS=0.0.0.0

  flowholt-runners:
    image: flowholt/runners:latest  # FlowHolt equivalent of n8nio/runners
    environment:
      - FLOWHOLT_RUNNER_TASK_BROKER_URI=http://flowholt-api:5679
      - FLOWHOLT_RUNNER_AUTH_TOKEN=your-secret-here
      - FLOWHOLT_RUNNER_AUTO_SHUTDOWN_TIMEOUT=15
    depends_on:
      - flowholt-api
```

**Key env vars (mapped from n8n pattern):**

| FlowHolt env var | n8n equivalent | Purpose |
|-----------------|---------------|---------|
| `FLOWHOLT_RUNNER_MODE` | `N8N_RUNNERS_MODE` | `internal` or `external` |
| `FLOWHOLT_RUNNER_ENABLED` | `N8N_RUNNERS_ENABLED` | Enable runner system |
| `FLOWHOLT_RUNNER_AUTH_TOKEN` | `N8N_RUNNERS_AUTH_TOKEN` | Shared secret for runner auth |
| `FLOWHOLT_RUNNER_BROKER_LISTEN_ADDRESS` | `N8N_RUNNERS_BROKER_LISTEN_ADDRESS` | `0.0.0.0` for multi-container |
| `FLOWHOLT_RUNNER_AUTO_SHUTDOWN_TIMEOUT` | `N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT` | Seconds of inactivity before shutdown |

**Module allowlisting (from n8n's `n8n-task-runners.json` pattern):**
```json
{
  "runners": [
    {
      "runner-type": "javascript",
      "allowed-builtins": ["crypto", "path"],
      "allowed-external": ["lodash", "moment"]
    },
    {
      "runner-type": "python",
      "stdlib-allow": ["json", "re", "datetime"],
      "external-allow": ["requests", "pandas", "numpy"]
    }
  ]
}
```

**n8n source files for task runner:**
- Broker: `n8n-master/packages/task-runners/src/task-broker/`
- Runner process: `n8n-master/packages/task-runners/src/task-runner/`
- Launcher: `n8n-master/packages/task-runners/src/launcher/`

### Current FlowHolt sandbox.py gaps vs n8n external runner

| Feature | FlowHolt `sandbox.py` | n8n External Runner | Gap |
|---------|----------------------|---------------------|-----|
| Process isolation | subprocess | Sidecar container | Phase 2: containerize |
| uid/gid separation | Same as parent | Separate container user | Phase 2 |
| Auth between API and runner | None (same process) | Shared secret token | Phase 2 |
| WebSocket broker | None | WebSocket broker | Phase 2 |
| Auto-shutdown idle runners | No | Yes (configurable) | Phase 2 |
| Multiple language runtimes | JS + Python (same process) | Separate JS + Python runners | Phase 2 |

**Phase 1:** Keep current `sandbox.py` subprocess approach with proper timeout + module allowlist.  
**Phase 2:** Move to Docker-based sidecar with FlowHolt runner launcher.

---

## Domain Entity and Event Model

Each domain module owns its entities and emits events to a shared internal event bus:

```python
# Event examples
workflow.published   → runtime activates triggers
execution.failed     → runtime creates dead-letter entry
vault.credential_rotated → workflows using credential notified
agent.published      → agent available to Studio
execution.awaiting_approval → Human Inbox entry created
```

Event bus: Simple in-process pubsub (Phase 1). Redis pub/sub (Phase 2 for multi-instance).

---

## Database Patterns

- **ORM:** SQLAlchemy 2.x (async sessions)
- **Pattern:** Repository pattern — no direct model access from route handlers
- **Migrations:** Alembic (target — currently manual DDL in some places)
- **Scope enforcement:** Every query filtered by `org_id → team_id → workspace_id` at repository layer
- **Soft deletes:** `deleted_at` timestamp on all user-facing entities
- **Audit fields:** `created_at`, `updated_at`, `created_by`, `updated_by` on all entities

---

## Security Architecture

| Layer | Implementation |
|-------|---------------|
| Auth | JWT (access token 15min, refresh 7d) + API keys |
| Credential encryption | AES-256-GCM via `encryption.py` |
| Secret rotation | `/credentials/:id/rotate` endpoint |
| Scope enforcement | Capability objects checked at route handler level |
| SQL injection | SQLAlchemy ORM parameterized queries |
| HTTPS | TLS termination at load balancer / Render |
| Rate limiting | Per-IP + per-API-key via `slowapi` |

---

## Deployment (Render.yaml — Current)

```yaml
services:
  - name: flowholt-api
    type: web
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT

  - name: flowholt-worker
    type: worker
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python -m app.worker

databases:
  - name: flowholt-db
    databaseName: flowholt
    plan: free
```

**Upgrade path:** Render free → Render paid (when Postgres hits size limit) → multi-worker deployment → S3 for binary data.

---

## Implementation Phases

### Phase 1 — Extract Domain Modules (refactor, no new features)

1. Extract `routers/system.py` — add `/health/ready`
2. Extract `routers/identity.py`
3. Extract `routers/organization.py`
4. Extract `routers/workspace.py`
5. Extract `routers/workflow.py`
6. Extract remaining routers in dependency order
7. Result: `main.py` < 200 lines

### Phase 2 — Production Hardening

1. Add Prometheus `/metrics` endpoint
2. Add S3 binary data mode
3. Alembic migrations for all models
4. Redis event bus for multi-instance support
5. Docker-based Code node sandbox

### Phase 3 — Scale

1. Multiple worker instances (horizontal scaling)
2. Read replicas for analytics queries
3. Multi-main coordination (if needed)
4. PGVector extension for AI embeddings

---

## Related Files

- `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` — domain module detail
- `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` — worker topology detail
- `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` — retention config
- `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` — service map
- `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` § Domain 8 — n8n scaling decisions
- [[wiki/concepts/backend-architecture]] — vault synthesis
- [[wiki/concepts/runtime-operations]] — runtime operations domain
