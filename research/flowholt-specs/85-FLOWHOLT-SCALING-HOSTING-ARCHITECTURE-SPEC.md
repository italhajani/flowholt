# SPEC-85: FlowHolt Scaling, Hosting & Backend Architecture Spec
## Source: n8n Documentation Deep Research — Hosting, Scaling, Queue Mode

**Created:** Sprint 88 Research Session
**Status:** Research Complete — Ready for Implementation Reference
**Scope:** Queue mode execution, task runners, Redis, external storage, multi-instance setup, Python task runners

---

## 1. Execution Architecture Overview

### 1.1 Single Instance Mode (Default)
```
One FlowHolt process handles:
  - Web UI serving
  - API requests
  - Webhook registration
  - Execution processing
  - Schedule management
```
**Suitable for:** Development, small teams, < 50 concurrent executions

### 1.2 Queue Mode (Production Scaling)
```
Main Instance:
  - Web UI serving
  - API requests
  - Webhook registration/reception
  - Schedule management (triggers execution creation)
  - Does NOT execute workflow logic

Redis (BullMQ):
  - Execution job queue
  - Status updates

Worker Instances (N workers):
  - Pull jobs from Redis queue
  - Execute workflow logic
  - Write results to database
  - No UI, no webhook handling
```
**Suitable for:** Production, high-throughput, > 50 concurrent executions

---

## 2. Queue Mode Architecture (Deep)

### 2.1 Execution Flow in Queue Mode
```
1. Trigger fires on Main Instance
   → Main creates execution record in DB (status: "queued")
   → Main pushes job to Redis queue (includes execution ID)

2. Worker picks up job from Redis
   → Worker loads execution + workflow from DB
   → Worker executes workflow step by step
   → Worker saves each step result to DB
   → Worker updates execution status (running → success/failure)

3. Main Instance serves status updates
   → Frontend polls /executions/{id} for status
   → OR: WebSocket/SSE for real-time updates
```

### 2.2 Redis Queue Implementation (BullMQ)
n8n uses **BullMQ** (on top of Redis) for the execution queue.

FlowHolt alternative: BullMQ is the recommended choice, or can use Redis directly.

**Queue data per job:**
```typescript
{
  executionId: string;
  workflowId: string;
  startedAt: string;
  mode: "production" | "manual" | "retry";
  retryOf?: string;    // If this is a retry
  timeout?: number;    // Max execution time in ms
}
```

### 2.3 Environment Variables for Queue Mode

```bash
# Enable queue mode
EXECUTIONS_MODE=queue

# Redis connection
QUEUE_BULL_REDIS_HOST=localhost
QUEUE_BULL_REDIS_PORT=6379
QUEUE_BULL_REDIS_DB=0
QUEUE_BULL_REDIS_PASSWORD=your-redis-password
QUEUE_BULL_REDIS_TLS_ENABLED=false
QUEUE_BULL_REDIS_CLUSTER_NODES=  # For Redis Cluster

# Queue configuration
QUEUE_BULL_SETTINGS_LOCK_DURATION=30000    # ms worker holds job lock
QUEUE_BULL_SETTINGS_LOCK_RENEW_TIME=15000  # ms between lock renewals
QUEUE_BULL_SETTINGS_MAX_STALLED_COUNT=1    # Retry stalled jobs N times
QUEUE_BULL_SETTINGS_DRAIN_TIMEOUT=300      # ms wait for graceful shutdown

# Worker configuration (set on worker instances)
EXECUTIONS_CONCURRENCY_MAX=10   # Max concurrent workflows per worker
```

### 2.4 Worker Health Monitoring
Main instance tracks worker health:
- Workers send heartbeats to Redis every 30 seconds
- If worker goes silent for > 60 seconds → marked unhealthy
- Jobs from dead workers are re-queued automatically (BullMQ handles this)

**Worker status endpoint** (Main exposes):
```
GET /api/v1/queue/worker-status
→ { workers: [{ id, lastHeartbeat, runningJobs, status }] }
```

### 2.5 Scaling Workers
```bash
# Worker start command (n8n)
n8n worker

# FlowHolt equivalent
python -m uvicorn backend.worker:app
# OR
python backend/worker.py

# Environment: set same DB and Redis config as main
# Workers are stateless — can run N copies
```

---

## 3. Task Runners (Python Execution)

### 3.1 Why Task Runners
The Code node can execute Python code. Instead of running Python inside the main process (security risk), n8n uses **task runners** — separate isolated processes.

**Task Runner Architecture:**
```
FlowHolt Main Process
  → sends code + input data to Task Runner via TCP
  → Task Runner executes code in isolated Python environment
  → Task Runner returns results
  → Main continues workflow execution

Task Runner (separate process/container)
  → receives task request
  → creates isolated execution context
  → runs user code
  → returns output items or error
```

### 3.2 Task Runner Benefits
- **Security isolation**: User code cannot access main process memory
- **Resource limiting**: Timeout, memory limits applied per task
- **Language support**: Different runners for JS and Python
- **No dependency conflicts**: Runner has its own Python environment

### 3.3 Python Task Runner Configuration
```bash
# Enable task runners
N8N_RUNNERS_ENABLED=true
N8N_RUNNERS_MODE=internal   # internal (subprocess) or external (separate process)

# Task runner limits
N8N_RUNNERS_MAX_CONCURRENCY=5     # Max concurrent task executions
N8N_RUNNERS_TASK_TIMEOUT=60       # Seconds before task killed
N8N_RUNNERS_HEARTBEAT_INTERVAL=30 # Seconds between heartbeats

# For external mode
N8N_RUNNERS_SERVER_URI=localhost:5679   # Task runner server address
```

### 3.4 Python Context in Task Runner
Available variables (native Python):
```python
_items  # List of input items: [{"json": {...}, "binary": {...}}]
_item   # Current item (in "Run Once Per Item" mode)
```

**What is NOT available** (security sandbox):
- File system access (`open()`, `os.path`, etc.) — blocked
- Network access (`requests`, `urllib`) — blocked
- Shell execution (`subprocess`, `os.system`) — blocked
- Package imports beyond Python stdlib — blocked
- `print()` output — not shown to users (security)

**What IS available:**
- Full Python stdlib: `json`, `math`, `datetime`, `re`, `collections`, `itertools`, etc.
- `_items` and `_item` — the only external variables

---

## 4. External Storage (Binary Data)

### 4.1 Problem with Default Binary Storage
By default, binary data (files, images) is stored in-memory and passed between nodes in the execution. This causes:
- High memory usage for large files
- Binary data lost when execution ends
- Cannot share binary data between workers in queue mode

### 4.2 External Storage Options

| Storage | Use Case |
|---------|---------|
| **S3 / Compatible** | AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces |
| **Local filesystem** | Single-instance only (not suitable for queue mode) |

### 4.3 S3 Configuration
```bash
N8N_DEFAULT_BINARY_DATA_MODE=s3   # or "filesystem" or "memory"
N8N_AVAILABLE_BINARY_DATA_MODES=s3

AWS_S3_BUCKET_NAME=flowholt-binary-data
AWS_S3_BUCKET_REGION=us-east-1
AWS_S3_ACCESS_KEY=your-access-key
AWS_S3_SECRET_KEY=your-secret-key
AWS_S3_ENDPOINT=https://s3.amazonaws.com  # For S3-compatible services
```

**Cloudflare R2** (recommended for FlowHolt — no egress fees):
```bash
AWS_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_S3_BUCKET_REGION=auto
```

### 4.4 Binary Data Lifecycle
- Uploaded to S3 when node produces binary output
- Referenced by `s3://bucket/path/to/file` URL in FlowItem.binary
- Retrieved from S3 when downstream node needs it
- Auto-deleted after execution completes (configurable retention)

---

## 5. Database Architecture

### 5.1 Supported Databases
| Database | Use Case |
|---------|---------|
| SQLite | Development / single-user (default n8n) |
| PostgreSQL | Production (recommended for FlowHolt) |
| MySQL | Legacy/enterprise option |

**FlowHolt uses PostgreSQL** (via Supabase) — the right choice.

### 5.2 Database Connection Pool
```bash
# PostgreSQL via connection string
DATABASE_URL=postgresql://user:password@host:5432/flowholt

# Connection pool settings
DB_POSTGRESDB_POOL_SIZE=10           # Default pool size
DB_POSTGRESDB_CONNECTION_TIMEOUT=10000  # ms
```

### 5.3 Key Database Tables (n8n Reference)
```sql
-- Core workflow tables
workflows               -- Workflow definitions
workflow_entity         -- Workflow nodes/connections JSON
workflow_statistics     -- Execution counts, timings
execution_entity        -- Execution records + status
execution_data          -- Node input/output data (can be large!)
execution_metadata      -- Custom key-value per execution

-- User management
user                    -- User accounts
credentials_entity      -- Encrypted credentials
shared_credentials      -- Credential sharing between users

-- Infrastructure
installed_packages      -- Community node packages
installed_nodes         -- Installed node registry
tag_entity              -- Tag definitions
workflows_tags          -- Workflow-tag associations
settings                -- Instance settings (key-value)
```

### 5.4 Database-Level Performance Optimizations
- Index on `execution_entity.workflowId, createdAt` for fast execution history queries
- Index on `execution_entity.status` for filtering by running/failed/success
- Partial index on `execution_entity.status = 'running'` for monitoring queries
- Regular cleanup job for old execution data (configurable retention)

---

## 6. High Availability Setup

### 6.1 Multi-Region Architecture
```
Region 1 (Primary):
  - Main FlowHolt Instance (UI + API + Webhooks)
  - Workers (N instances)
  - PostgreSQL Primary
  - Redis Primary

Region 2 (DR/Replica):
  - Standby Main Instance
  - PostgreSQL Replica (read replica for reports)
  - Redis Replica
```

### 6.2 Health Check Endpoints
Main instance exposes:
```
GET /healthz                  → Simple health check (returns 200 OK)
GET /healthz/readiness        → Checks DB + Redis connectivity
GET /metrics                  → Prometheus metrics (optional)
```

### 6.3 Zero-Downtime Deployments
1. Deploy new workers first (backward-compatible schema)
2. Apply DB migrations
3. Switch load balancer to new main instances
4. Keep old workers running until in-flight executions complete
5. Drain old workers, then stop them

---

## 7. Webhook Infrastructure

### 7.1 Webhook Types
| Type | URL Pattern | Mode |
|------|-------------|------|
| Production webhook | `/webhook/<path>` | Always uses published version |
| Test webhook | `/webhook-test/<path>` | Uses draft version, requires manual activation |
| Form trigger | `/form/<path>` | HTML form submission |
| Chat trigger | `/form/<path>/chat` | Chat interface endpoint |
| MCP server | `/mcp-server/http` | MCP protocol endpoint |

### 7.2 Webhook Registration
When a workflow with a webhook trigger is published:
1. Main instance registers the webhook path in the DB
2. Webhook listener maps `path → workflowId + triggerId`
3. Incoming requests look up this mapping and queue execution

### 7.3 Webhook Data Passed to Execution
```typescript
{
  json: {
    headers: Record<string, string>;
    params: Record<string, string>;   // Path parameters
    query: Record<string, string>;    // Query string params
    body: any;                        // Request body (parsed)
    webhookUrl: string;               // The full webhook URL
    executionMode: "production" | "test";
  },
  binary?: {
    // If file upload was included
    data: { fileContent: BinaryData }
  }
}
```

### 7.4 Rate Limiting and Security
Webhook endpoints should implement:
- **Rate limiting**: Per IP, per webhook path
- **HMAC signature validation**: Reject requests without valid signature
- **Size limits**: Max request body size (default: 16MB)
- **CORS**: Allow/deny based on origin settings

---

## 8. Execution Data Pruning

### 8.1 Why Prune
Execution data (node input/output JSON) can be very large. Without pruning:
- Database grows unbounded
- Slow execution list queries
- High storage costs

### 8.2 Pruning Configuration
```bash
# Enable auto-pruning
EXECUTIONS_DATA_PRUNE=true

# How long to keep execution data
EXECUTIONS_DATA_MAX_AGE=336     # Hours (336h = 14 days default)
EXECUTIONS_DATA_PRUNE_MAX_COUNT=10000  # Max executions to keep

# Hard limit
EXECUTIONS_DATA_HARD_DELETE_BUFFER=1  # Hours before hard delete after soft
```

### 8.3 Pruning Strategy
1. Soft delete: mark execution as pruned, keep metadata
2. Hard delete: remove actual data after buffer period
3. Named versions / pinned executions: exempt from auto-pruning

---

## 9. Environment Variables Reference (Complete)

### 9.1 Core Application
```bash
# Server
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_EDITOR_BASE_URL=https://yourdomain.com

# Auth
N8N_ENCRYPTION_KEY=your-32-char-random-key  # Encrypts credentials at rest
N8N_JWT_SECRET=your-jwt-secret
N8N_USER_MANAGEMENT_DISABLED=false

# Database
DATABASE_TYPE=postgresdb
DATABASE_URL=postgresql://...
```

### 9.2 Email (for invitations, notifications)
```bash
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=noreply@yourdomain.com
N8N_SMTP_PASS=your-app-password
N8N_SMTP_SENDER="FlowHolt <noreply@yourdomain.com>"
N8N_SMTP_SSL=false
N8N_SMTP_STARTTLS=true
```

### 9.3 External Integrations
```bash
# Execution telemetry (optional)
N8N_DIAGNOSTICS_ENABLED=true

# Community nodes (for private registry)
N8N_COMMUNITY_PACKAGES_REGISTRY=https://registry.npmjs.org

# Source control
N8N_SOURCE_CONTROL_DEFAULT_PROVIDER=git
```

---

## 10. FlowHolt Deployment Guide (Render.com)

Based on existing `render.yaml`:

### 10.1 Services Layout
```yaml
services:
  - type: web
    name: flowholt-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
    
  - type: web
    name: flowholt-frontend
    env: node
    buildCommand: npm run build
    startCommand: npm run preview -- --port $PORT
    
  - type: worker
    name: flowholt-worker
    env: python
    startCommand: python backend/worker.py  # Queue mode worker
    
redis:
  - name: flowholt-redis
    plan: starter
```

### 10.2 Required Environment Variables (Render.com)
```bash
# Core
DATABASE_URL=          # From Render PostgreSQL or Supabase
REDIS_URL=             # From Render Redis
SECRET_KEY=            # 32+ char random string for JWT/session
ENCRYPTION_KEY=        # 32-char random string for credential encryption

# Frontend
VITE_API_BASE=https://flowholt-api.onrender.com

# Email (for invitations)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

---

## 11. FlowHolt Implementation Checklist

### Queue Mode:
- [ ] Redis/BullMQ integration for job queue
- [ ] Worker process implementation
- [ ] Execution status updates via polling or WebSocket
- [ ] Worker health monitoring
- [ ] Worker horizontal scaling

### Task Runners:
- [ ] Python task runner subprocess management
- [ ] Code node uses task runner (not direct exec)
- [ ] Timeout enforcement in task runner
- [ ] Security sandbox for Python code

### External Storage:
- [ ] S3/R2 binary data storage
- [ ] Binary data streaming (not in-memory)
- [ ] Binary data cleanup after execution

### Database:
- [x] PostgreSQL via Supabase
- [ ] Execution data pruning job
- [ ] Database indices for performance
- [ ] Connection pool tuning

### Webhooks:
- [x] Webhook registration
- [x] Webhook execution routing
- [x] HMAC signature validation
- [x] Rate limiting
- [ ] Production vs test webhook paths

### Health & Monitoring:
- [ ] `/healthz` health check endpoint
- [ ] `/healthz/readiness` deep health check
- [ ] Prometheus metrics endpoint (optional)
- [ ] Execution failure alerting

### Deployment:
- [x] render.yaml configuration
- [x] Environment variables documented
- [ ] Zero-downtime deployment process
- [ ] Backup and restore procedures
