---
title: Backend Architecture
type: concept
tags: [backend, fastapi, domains, modules, architecture]
sources: [plan-file-09, plan-file-13, plan-file-17, plan-file-39]
updated: 2026-04-16
---

# Backend Architecture

The target server-side structure for [[wiki/entities/flowholt]]. Currently a monolithic `main.py` (411KB). Target: 13 domain modules.

---

## Current State

```
backend/app/
├── main.py              ← ALL routes (411KB, ~10K lines)
├── models.py            ← All SQLAlchemy models
├── executor.py          ← Workflow execution engine
├── studio_runtime.py    ← Studio interactive run
├── studio_nodes.py      ← Node definitions + retry fields
├── node_registry.py     ← Node type registry
├── integration_registry.py
├── repository.py        ← Data access layer
├── auth.py              ← JWT + roles
├── scheduler.py         ← Trigger scheduling
└── seeds.py             ← Seed data
```

---

## Target: 13 Domain Modules

Extraction order (smallest/most-isolated first):

| # | Domain | Contains |
|---|--------|---------|
| 1 | `system` | Health, config, version endpoints |
| 2 | `notification` | Alert and notification delivery |
| 3 | `identity` | Auth, JWT, session tokens |
| 4 | `organization` | Org/team CRUD, role management |
| 5 | `workspace` | Workspace CRUD, settings |
| 6 | `workflow` | Workflow CRUD, versions, deployment |
| 7 | `studio` | Studio session, node config, canvas ops |
| 8 | `execution` | Run records, step records, artifacts |
| 9 | `runtime` | Queue, workers, dead-letter, alerts |
| 10 | `vault` | Credentials, connections, variables, assets |
| 11 | `agent` | AI agent entities, knowledge, embeddings |
| 12 | `integration` | Integration registry, OAuth2, webhooks |
| 13 | `assistant` | Built-in AI assistant (chat panel) |

**Target `main.py`:** < 200 lines — just imports + FastAPI app setup.

---

## Domain Entity and Event Model

Each domain owns its entities and emits events to a shared event bus:

```
workflow.published → notify runtime to activate triggers
execution.failed  → notify runtime to create dead-letter
vault.credential_rotated → notify workflows that use it
```

---

## Database Patterns

- SQLAlchemy ORM
- Repository pattern (`repository.py`) — no direct model access from routes
- Migrations: Alembic (target)
- Scope hierarchy enforced at query level: always filter by `org_id → team_id → workspace_id`

---

## Related Pages

- [[wiki/entities/flowholt]] — current codebase structure
- [[wiki/concepts/execution-model]] — executor domain
- [[wiki/concepts/runtime-operations]] — runtime domain
- [[wiki/concepts/permissions-governance]] — capability builders in identity + org domains
- [[wiki/concepts/error-handling]] — error types and handler logic in executor domain
- [[wiki/concepts/webhook-trigger-system]] — integration domain handles webhooks
- [[wiki/concepts/connections-integrations]] — vault domain owns credentials/connections
- [[wiki/concepts/observability-analytics]] — audit logs and metrics endpoints
- [[wiki/concepts/environment-deployment]] — workflow domain manages versions/environments
- [[wiki/sources/flowholt-plans]] — plan files 09, 13, 17, 39

---

## n8n Scaling Architecture (Domain 8 Deep Read)

> Research complete 2026-04-16. Key findings for FlowHolt's production architecture.

### n8n Production Topology

```
Main Instance (UI/API + timer triggers + leader tasks)
    │
    ├── Redis (job queue + completion notifications)
    │
    ├── Workers × N (execute workflows, poll Redis, concurrency=10)
    │   └── Task Runner sidecar (isolated Code node execution)
    │
    ├── Webhook Processors (optional, dedicated webhook ingestion)
    │
    └── Postgres 13+ (all persistence: definitions, executions, credentials)
```

- **Main** never executes workflows in queue mode — only ingests triggers and enqueues jobs
- **Workers** fetch execution IDs from Redis, load workflow from Postgres, run executor
- **Webhook processors** are stateless — handle `POST /webhook/*` requests only
- **Multi-main** (Enterprise): leader election via Redis TTL key; leader handles at-most-once tasks

### Key Configuration Patterns

**Queue mode (mandatory for scaling):**
- `EXECUTIONS_MODE=queue` on all instances
- All instances share `N8N_ENCRYPTION_KEY` (credential access)
- Redis cluster supported (`QUEUE_BULL_REDIS_CLUSTER_NODES`)

**Worker tuning:**
- Default concurrency: 10. Recommended minimum: 5.
- Tune to: `(DB connection pool size) / num_workers`
- Stalled job timeout: 30s; max stalled count: 1

**Execution data pruning (critical):**
- Default TTL: 14 days (`EXECUTIONS_DATA_MAX_AGE=336` hours)
- Default max count: 10,000 (`EXECUTIONS_DATA_PRUNE_MAX_COUNT`)
- Prune only applies to completed/failed — not in-progress
- Safety buffer: 1 hour (`EXECUTIONS_DATA_HARD_DELETE_BUFFER`) prevents accidental data loss

**Binary data for queue mode:**
- `filesystem` mode: NOT supported with queue mode (workers can't share a filesystem)
- Use `database` (small files) or `s3` (large files, production)
- S3 env vars: `N8N_EXTERNAL_STORAGE_S3_HOST`, `BUCKET_NAME`, `BUCKET_REGION`, `ACCESS_KEY`, `SECRET`

**Task runners (Code node isolation):**
- `N8N_RUNNERS_MODE=external` (sidecar container) — recommended for production
- Sidecar image: `n8nio/runners`; communicate via broker port 5679
- Allowlist modules: `NODE_FUNCTION_ALLOW_BUILTIN`, `NODE_FUNCTION_ALLOW_EXTERNAL`
- Auto-shuts down after 15s of inactivity

### Health Check Endpoints
- `/healthz` — HTTP 200 if instance reachable (doesn't check DB)
- `/healthz/readiness` — HTTP 200 if DB connected, migrated, and ready
- `/metrics` — Prometheus-compatible (enable with `N8N_METRICS=true`)

### FlowHolt Production Architecture Implications

| Pattern | n8n approach | FlowHolt current | Action needed |
|---------|-------------|-----------------|---------------|
| Job queue | Redis + BullMQ | Postgres-as-queue (worker.py) | ✅ Different but valid. Postgres queue is zero-added-cost. |
| Workers | Separate Node.js processes | In-process async worker (SQLite) / standalone worker (Postgres) | ✅ Architecture already sound |
| Code node isolation | External task runner sidecar | sandbox.py subprocess | ✅ Equivalent approach |
| Health checks | `/healthz`, `/healthz/readiness`, `/metrics` | `/health` exists | ⚠️ Add `/healthz/readiness` + Prometheus `/metrics` |
| Execution pruning | TTL + count-based | Via execution retention settings | ✅ Already implemented |
| Binary data at scale | S3 | Not yet specified | ⚠️ Plan S3 integration for production binary data |
| Multi-main HA | Leader election via Redis | Single instance | ⚠️ Future: multi-instance coordination |

**Key validation:** FlowHolt's Postgres-as-queue (Windmill pattern) is architecturally sound vs Redis. Uses `SELECT ... FOR UPDATE SKIP LOCKED` — correct implementation. Worker lease system mirrors n8n's lock/renew pattern.
