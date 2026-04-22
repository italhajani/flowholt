# 70 · FlowHolt: Free-Tier Execution Architecture

> **Purpose**: Complete grounded architecture decision document for FlowHolt's execution backend under zero-budget constraints, with explicit upgrade paths. Every decision is justified, alternatives compared, and free-tier option identified.
> **Audience**: Junior AI model implementing FlowHolt's backend. All concepts explained from scratch. No assumptions about prior knowledge.
> **Sources**: specs 09, 22, 19, 39 (FlowHolt backend), n8n scaling docs, Make execution flow docs, current `backend/` codebase.
> **Principle**: "Design for $0/month now, upgrade path to $50/month, $200/month, $1000/month clearly mapped."

---

## Cross-Reference Map

| Section | Primary Source |
|---------|---------------|
| §1 Baseline | `backend/app/` codebase, spec 09 |
| §2 Queue system | spec 22, spec 19, n8n queue-mode.md |
| §3 Execution backends | spec 39, Render/Railway free tier docs |
| §4 AI nodes | Groq free tier, Gemini free tier docs |
| §5 Scheduling | spec 22 §scheduler worker |
| §6 Concurrency | spec 22, n8n workers.md |
| §7 Long-running workflows | spec 19 §pause-resume, Make execution-flow.md |
| §8 Storage | spec 19 §artifact, n8n binary-data.md |
| §9 Scaling path | spec 09 §target, n8n scaling docs |
| §10 Cost model | Make credits model, n8n operations model |

---

## 1. Baseline — What FlowHolt Has Now

Before designing the architecture, understand the current state of `backend/app/`:

```
backend/app/
├── main.py              ← ALL routes (~10K lines, monolith)
├── models.py            ← SQLAlchemy ORM models
├── executor.py          ← Workflow execution engine (core logic)
├── studio_runtime.py    ← Studio interactive run (test executions)
├── studio_nodes.py      ← Node definitions (built-in nodes)
├── node_registry.py     ← Node type registry
├── integration_registry.py ← Third-party integration definitions
├── repository.py        ← Data access layer (Postgres via SQLAlchemy)
├── auth.py              ← JWT authentication + roles
├── scheduler.py         ← Trigger scheduling (polls DB every 5s)
├── seeds.py             ← Seed data
├── worker.py            ← Background job worker (Postgres-as-queue)
├── sandbox.py           ← Code node subprocess isolation
└── encryption.py        ← Credential encryption (AES-256-GCM)
```

**Current architecture pattern**: Postgres-as-queue using `SELECT FOR UPDATE SKIP LOCKED`. This is the same pattern used by Windmill (another open-source automation platform). It works well without Redis.

**Current tech stack**:
- Python 3.11 / FastAPI
- PostgreSQL (via Supabase free tier — 500MB, unlimited requests)
- SQLAlchemy ORM + Alembic migrations
- APScheduler for cron triggers
- AES-256-GCM for credential encryption
- JWT (RS256) for auth
- Supabase Storage for file uploads

**Current execution flow** (as observed in `executor.py`):
1. Trigger → creates `WorkflowJob` row in Postgres
2. `worker.py` polls `SELECT FOR UPDATE SKIP LOCKED` every 500ms
3. Worker claims job, creates `ExecutionRun` row, runs node graph
4. Each node's input/output stored in `ExecutionNodeRun` rows
5. On error: creates `IncompleteExecution` row (if enabled)
6. On success: updates `ExecutionRun.status = 'success'`

**Current gaps**:
- `main.py` is ~10K lines (everything in one file)
- No task runner isolation for code nodes (subprocess only)
- No real-time streaming of execution state to frontend
- No Prometheus metrics
- Scheduler is in-process (APScheduler) — doesn't scale to multiple workers
- AI nodes call Groq/Gemini synchronously (no timeout/retry management)

---

## 2. Queue System Architecture

### 2.1 Options Evaluated

| Option | Pros | Cons | Free tier? |
|--------|------|------|-----------|
| **Postgres as queue (current)** | No extra service, ACID, already working | Polling overhead at scale, not real-time | ✅ Free (uses existing Supabase PG) |
| Redis + BullMQ | Battle-tested, real-time, rich features | Extra service, $17+/month on Redis Cloud | ❌ Costs money |
| Redis + Celery | Python-native, mature | Redis cost, more complex | ❌ Costs money |
| SQLite queue | Zero cost, simple | Single-file, not multi-worker safe | ⚠️ Only for local dev |
| Supabase Queues | Native to stack, free tier available | Beta, limited visibility | ✅ Free (Supabase PGMQ) |
| Railway job queue | Managed | Costs money per run | ❌ Costs money |

**Decision**: **Keep Postgres-as-queue using `SELECT FOR UPDATE SKIP LOCKED`**.

Rationale:
- Already works in production
- Postgres on Supabase free tier = free
- Handles concurrency correctly (no double-claim)
- Used by Windmill (proven at scale)
- No additional infrastructure
- When scaling is needed, migrate to Redis + BullMQ (upgrade path clear)

### 2.2 Queue Table Schema

```sql
CREATE TABLE workflow_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    workspace_id UUID NOT NULL,
    
    -- Trigger context
    trigger_type TEXT NOT NULL,  -- 'manual', 'schedule', 'webhook', 'mcp_tool', 'api'
    trigger_payload JSONB,       -- Input data from trigger
    
    -- Queue state
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled', 'dead_letter')),
    priority INTEGER DEFAULT 5,  -- 1=highest, 10=lowest
    
    -- Worker assignment
    worker_id TEXT,              -- Which worker claimed this job
    claimed_at TIMESTAMPTZ,      -- When claimed
    heartbeat_at TIMESTAMPTZ,    -- Last heartbeat from worker (detect stalled jobs)
    
    -- Retry
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    retry_at TIMESTAMPTZ,        -- When to retry (for backoff)
    
    -- Result
    execution_run_id UUID REFERENCES execution_runs(id),
    error_message TEXT,
    
    -- Timing
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),  -- Not before this time
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- The critical index for SKIP LOCKED claiming:
CREATE INDEX idx_jobs_queue_claim 
ON workflow_jobs (status, priority, scheduled_for) 
WHERE status = 'pending';
```

### 2.3 Job Claiming Pattern

```python
# worker.py — job claiming loop
async def claim_job(worker_id: str, db: AsyncSession):
    """Atomically claim one job. SKIP LOCKED prevents race conditions."""
    result = await db.execute(
        text("""
            SELECT id, workflow_id, trigger_payload, trigger_type
            FROM workflow_jobs
            WHERE status = 'pending'
              AND scheduled_for <= NOW()
            ORDER BY priority ASC, scheduled_for ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        """)
    )
    job = result.fetchone()
    if job:
        await db.execute(
            text("""
                UPDATE workflow_jobs 
                SET status = 'running', 
                    worker_id = :worker_id,
                    claimed_at = NOW(),
                    heartbeat_at = NOW()
                WHERE id = :job_id
            """),
            {"worker_id": worker_id, "job_id": job.id}
        )
        await db.commit()
        return job
    return None
```

### 2.4 Heartbeat + Stalled Job Recovery

Workers send heartbeats every 15 seconds. If no heartbeat for 60 seconds, the job is considered stalled and gets reclaimed.

```sql
-- Run every minute by maintenance worker:
UPDATE workflow_jobs
SET status = 'pending',
    worker_id = NULL,
    claimed_at = NULL,
    retry_count = retry_count + 1
WHERE status = 'running'
  AND heartbeat_at < NOW() - INTERVAL '60 seconds'
  AND retry_count < max_retries;

-- Move to dead_letter if exceeded retries:
UPDATE workflow_jobs
SET status = 'dead_letter'
WHERE status = 'running'
  AND heartbeat_at < NOW() - INTERVAL '60 seconds'
  AND retry_count >= max_retries;
```

### 2.5 Upgrade Path: Redis + BullMQ

When Postgres queue becomes a bottleneck (>1000 jobs/minute throughput or >50 concurrent workers):

1. Add Redis service (Upstash free: 10K commands/day → or paid: $17/month)
2. Migrate `worker.py` from `SELECT FOR UPDATE SKIP LOCKED` to `bullmq` library
3. Keep Postgres for persistence (BullMQ stores job state in Redis, copy to Postgres on completion)
4. No schema changes to execution tables — only queue claiming changes

---

## 3. Execution Backends

### 3.1 Where Does Workflow Execution Happen?

| Option | Description | Free? | Latency | Limitations |
|--------|-------------|-------|---------|------------|
| **Local Python process (current)** | `worker.py` runs on same machine as API | ✅ Yes | Low | Only 1 machine, no scale |
| Supabase Edge Functions | Deno-based, runs on Supabase infra | ✅ 500K invocations/month free | ~50ms cold | 2MB payload limit, no long-running (wall limit) |
| Cloudflare Workers | Global edge, V8 isolates | ✅ 100K req/day free | ~5ms | 10ms CPU per request, no loops/delays |
| Railway.app | Deploy Python workers | ✅ $5/month (500 hours free) | Normal | $5/month exceeds budget |
| Render.com | Deploy Python workers | ✅ Free tier (0.1 vCPU, 512MB) | Normal | Sleeps after 15min inactivity |
| Fly.io | Docker-based, global | ✅ 3 shared VMs free | Normal | Limited RAM on free tier |
| GitHub Actions | Trigger on push/event | ✅ 2000 min/month free | ~10s startup | Not real-time, startup cost |

**Decision: Local Python Process + Render.com free tier.**

For the backend API + worker, deploy to **Render.com free tier**:
- Free tier: 0.1 vCPU shared, 512MB RAM
- Limitation: Sleeps after 15min inactivity → Use UptimeRobot (free) to ping every 14 min
- Cost: $0/month
- When upgrading: Render.com $7/month = 0.5 vCPU, 512MB RAM (no sleep)

**Architecture**: Single Render service runs both FastAPI (API) and `worker.py` (job processor) in the same container via Supervisor or forking.

```
# Render start command:
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT & python -m app.worker
```

### 3.2 Worker Process Model

Two worker modes:

#### Mode A: Embedded Worker (Free tier / Development)
Worker runs in same process as API server using `asyncio.create_task()`.

```python
# main.py (simplified)
app = FastAPI()

@app.on_event("startup")
async def start_worker():
    asyncio.create_task(worker_loop())

async def worker_loop():
    while True:
        job = await claim_job(worker_id=settings.WORKER_ID)
        if job:
            asyncio.create_task(execute_job(job))
        await asyncio.sleep(0.5)  # poll every 500ms
```

Pros: Zero config, no separate process
Cons: Execution competes with API request handling for CPU

#### Mode B: Separate Worker Process (Recommended even on free tier)
Worker runs as separate Python process. Same DB, same code, different entry point.

```bash
# Start API:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1

# Start worker (separate terminal or Procfile):
python -m app.worker --concurrency 2
```

```python
# app/worker.py
import asyncio
import argparse
from .jobs import claim_job, execute_job

async def worker_main(concurrency: int = 2):
    semaphore = asyncio.Semaphore(concurrency)
    while True:
        async with semaphore:
            job = await claim_job()
            if job:
                asyncio.create_task(execute_job_with_semaphore(job, semaphore))
        await asyncio.sleep(0.5)
```

**Decision**: Use Mode B (separate process). On Render.com free tier, run both in one service using a Procfile:

```
# Render Procfile:
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
worker: python -m app.worker --concurrency 2
```

Render.com free tier supports multiple processes in one service via `startCommand`.

---

## 4. AI Node Execution

### 4.1 Free AI APIs Available

| Provider | Model | Free Tier | Rate Limit | Max Tokens | Latency |
|----------|-------|-----------|-----------|------------|---------|
| **Groq** | Llama 3.1 8B Instant | ✅ Free | 30 req/min, 14,400 req/day | 8,192 output | ~200ms |
| **Groq** | Llama 3.3 70B | ✅ Free | 30 req/min | 32,768 output | ~1s |
| **Groq** | Mixtral 8x7B | ✅ Free | 30 req/min | 32,768 output | ~500ms |
| **Google Gemini** | Gemini 2.0 Flash | ✅ Free | 15 req/min, 1M tokens/day | 8,192 output | ~500ms |
| **Google Gemini** | Gemini 1.5 Pro | ✅ Free | 2 req/min | 8,192 output | ~2s |
| **Anthropic** | Claude 3 Haiku | ❌ Paid | — | — | — |
| **OpenAI** | GPT-4o-mini | ❌ Paid | — | — | — |
| **Together AI** | Various | ✅ $1 free credit | — | — | — |
| **Hugging Face** | Various | ✅ Free inference | Slow | — | ~5s |

**FlowHolt Free Tier AI Strategy**:

Primary: **Groq** (fastest, high quality Llama 3.1 8B/70B)
Secondary: **Google Gemini Flash** (for long-context tasks, 1M context window)
Fallback: **Hugging Face Inference API** (for when Groq/Gemini hit rate limits)

### 4.2 AI Node Router

```python
# app/nodes/ai_router.py

class AiNodeRouter:
    """Routes AI requests to appropriate provider based on availability, task, and rate limits."""
    
    PROVIDER_PRIORITY = [
        "groq_fast",      # Groq llama-3.1-8b-instant
        "groq_smart",     # Groq llama-3.3-70b  
        "gemini_flash",   # Gemini 2.0 Flash
        "gemini_pro",     # Gemini 1.5 Pro
        "huggingface",    # HuggingFace Inference (fallback)
    ]
    
    async def route(self, task: AiTask) -> AiProvider:
        """Select best available provider for task."""
        
        # For complex reasoning tasks → prefer 70B
        if task.requires_complex_reasoning:
            if self.is_available("groq_smart"):
                return GroqProvider("llama-3.3-70b")
            if self.is_available("gemini_pro"):
                return GeminiProvider("gemini-1.5-pro")
        
        # For long context (>50K tokens) → use Gemini
        if task.context_tokens > 50000:
            if self.is_available("gemini_flash"):
                return GeminiProvider("gemini-2.0-flash-exp")
        
        # Default: Groq fast
        if self.is_available("groq_fast"):
            return GroqProvider("llama-3.1-8b-instant")
        
        # Fallback
        return HuggingFaceProvider("meta-llama/Meta-Llama-3-8B-Instruct")
    
    def is_available(self, provider: str) -> bool:
        """Check if provider is within rate limits using sliding window counter in Redis/Postgres."""
        # Simple: count requests in last 60 seconds
        return self.rate_counter.count(provider, window_seconds=60) < RATE_LIMITS[provider]

RATE_LIMITS = {
    "groq_fast": 28,      # 30/min with 2 buffer
    "groq_smart": 28,
    "gemini_flash": 13,   # 15/min with 2 buffer
    "gemini_pro": 1,      # 2/min with 1 buffer (very limited!)
    "huggingface": 10,    # Conservative estimate
}
```

### 4.3 AI Rate Limit Tracking

Track rate limit usage in Postgres (no Redis needed):

```sql
CREATE TABLE ai_rate_limit_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    workspace_id UUID,   -- null = global limit
    window_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER DEFAULT 0,
    UNIQUE(provider, workspace_id, window_start)
);
-- Cleanup old windows:
-- DELETE FROM ai_rate_limit_counters WHERE window_start < NOW() - INTERVAL '2 minutes';
```

### 4.4 AI Node Execution Timeout

| Provider | Our timeout | Their limit |
|----------|------------|-------------|
| Groq | 30s | 40s total |
| Gemini Flash | 45s | 60s total |
| Gemini Pro | 90s | 120s total |
| HuggingFace | 60s | Model dependent |

```python
async def call_ai_provider(provider: AiProvider, request: AiRequest) -> AiResponse:
    try:
        async with asyncio.timeout(provider.timeout_seconds):
            return await provider.generate(request)
    except asyncio.TimeoutError:
        raise AiNodeTimeoutError(
            f"AI request to {provider.name} timed out after {provider.timeout_seconds}s"
        )
    except RateLimitError:
        # Try next provider in fallback chain
        fallback = router.next_fallback(provider)
        if fallback:
            return await call_ai_provider(fallback, request)
        raise
```

### 4.5 User-Provided API Keys

When users provide their own API keys (via Vault), use those instead of the platform's free tier keys:

```python
async def get_ai_provider_for_node(node_config: dict, workspace_id: str) -> AiProvider:
    """Use user's key if available, otherwise fall back to platform free tier."""
    
    # Check if user has their own key for this provider
    if node_config.get("provider") == "openai":
        user_key = await vault.get_credential(workspace_id, "openai_api_key")
        if user_key:
            return OpenAIProvider(api_key=user_key, model=node_config["model"])
    
    # Fall back to platform routing
    return await ai_router.route(AiTask.from_config(node_config))
```

---

## 5. Cron / Schedule Execution

### 5.1 Options Compared

| Option | Description | Free? | Precision | Limitations |
|--------|-------------|-------|-----------|------------|
| **APScheduler (current)** | Python library, in-process | ✅ Free | ±1s | State lost on restart, no persistence |
| **Postgres-based scheduler** | Poll `schedules` table every 30s | ✅ Free | ±30s | Simple, reliable, survives restart |
| Celery Beat | Separate service with Redis | ❌ Redis cost | ±1s | Extra infrastructure |
| EasyCron | Cloud cron service | ✅ 1 job free | 1-minute minimum | Only 1 job on free |
| Supabase cron (pg_cron) | Runs SQL on schedule | ✅ Free | 1-minute minimum | SQL only, can't run Python |
| GitHub Actions scheduled | Runs on schedule | ✅ 2000 min/month free | 5-minute minimum | Too coarse, startup cost |

**Decision**: **Postgres-based scheduler with persistent schedule state** (upgrade from current APScheduler).

Why upgrade from APScheduler:
- APScheduler state is in-memory → lost on restart → missed schedules
- With Postgres-based scheduler, state survives restarts
- Multiple workers can all check the schedule table (leader election via SKIP LOCKED)

### 5.2 Schedule Table Schema

```sql
CREATE TABLE workflow_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    workspace_id UUID NOT NULL,
    
    -- Schedule definition (one of the following):
    cron_expression TEXT,           -- "0 9 * * 1-5" (Mon-Fri 9am)
    interval_seconds INTEGER,       -- Every N seconds
    
    -- State
    is_active BOOLEAN DEFAULT TRUE,
    next_run_at TIMESTAMPTZ NOT NULL,  -- Pre-calculated next run time
    last_run_at TIMESTAMPTZ,
    last_status TEXT,
    
    -- Config
    timezone TEXT DEFAULT 'UTC',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_due ON workflow_schedules(next_run_at) WHERE is_active = TRUE;
```

### 5.3 Scheduler Loop

```python
# app/scheduler.py
import asyncio
from croniter import croniter
from datetime import datetime, timedelta, timezone

async def scheduler_loop():
    """Run every 15 seconds, check for due schedules, enqueue jobs."""
    while True:
        try:
            await process_due_schedules()
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
        await asyncio.sleep(15)

async def process_due_schedules():
    async with get_db() as db:
        # Claim due schedules atomically
        result = await db.execute(text("""
            SELECT id, workflow_id, workspace_id, cron_expression, interval_seconds, timezone
            FROM workflow_schedules
            WHERE is_active = TRUE
              AND next_run_at <= NOW()
            FOR UPDATE SKIP LOCKED
            LIMIT 50
        """))
        due_schedules = result.fetchall()
        
        for schedule in due_schedules:
            # Create job
            await db.execute(text("""
                INSERT INTO workflow_jobs (workflow_id, workspace_id, trigger_type, trigger_payload)
                VALUES (:wf_id, :ws_id, 'schedule', :payload)
            """), {
                "wf_id": schedule.workflow_id,
                "ws_id": schedule.workspace_id,
                "payload": json.dumps({"schedule_id": str(schedule.id)})
            })
            
            # Update next_run_at
            next_run = calculate_next_run(schedule)
            await db.execute(text("""
                UPDATE workflow_schedules
                SET next_run_at = :next_run, last_run_at = NOW()
                WHERE id = :id
            """), {"next_run": next_run, "id": schedule.id})
        
        await db.commit()

def calculate_next_run(schedule) -> datetime:
    """Calculate next run time from cron expression or interval."""
    tz = pytz.timezone(schedule.timezone or 'UTC')
    now = datetime.now(tz)
    
    if schedule.cron_expression:
        cron = croniter(schedule.cron_expression, now)
        return cron.get_next(datetime)
    elif schedule.interval_seconds:
        return now + timedelta(seconds=schedule.interval_seconds)
    
    raise ValueError("Schedule has neither cron nor interval")
```

### 5.4 Supported Schedule Types

| Type | Expression | Example | Notes |
|------|-----------|---------|-------|
| Interval | Seconds integer | 300 = every 5 minutes | Minimum 60 seconds on free tier |
| Cron | Standard 5-field | `0 9 * * 1-5` | Mon-Fri 9am UTC |
| Cron with timezone | Cron + timezone | `0 9 * * *` + `America/New_York` | Timezone-aware |
| Daily | Cron shorthand | `@daily` = `0 0 * * *` | Every day at midnight |
| Weekly | Cron shorthand | `@weekly` = `0 0 * * 0` | Every Sunday midnight |

**Free tier restriction**: Minimum interval is 60 seconds. This prevents abuse of the free tier. Paid tiers: 15-second minimum.

---

## 6. Concurrency Model

### 6.1 Concurrency Limits

| Tier | Max concurrent workflows | Max workers | Max jobs in queue |
|------|-------------------------|-------------|------------------|
| Free | 2 | 1 (embedded) | 100 |
| Starter ($9/mo) | 5 | 2 | 500 |
| Pro ($29/mo) | 20 | 5 | 2,000 |
| Business ($99/mo) | 100 | 20 | 10,000 |

### 6.2 Concurrency Enforcement

**Per-workspace limit**: Each workspace has a `max_concurrent_executions` setting. Enforced at job claiming time.

```python
async def claim_job(worker_id: str, db: AsyncSession) -> Optional[Job]:
    """Claim a job only if workspace is under concurrency limit."""
    result = await db.execute(text("""
        WITH running_counts AS (
            SELECT workspace_id, COUNT(*) as running
            FROM workflow_jobs
            WHERE status = 'running'
            GROUP BY workspace_id
        ),
        eligible_jobs AS (
            SELECT j.*, COALESCE(rc.running, 0) as workspace_running
            FROM workflow_jobs j
            LEFT JOIN running_counts rc ON j.workspace_id = rc.workspace_id
            JOIN workspaces w ON j.workspace_id = w.id
            WHERE j.status = 'pending'
              AND j.scheduled_for <= NOW()
              AND COALESCE(rc.running, 0) < COALESCE(w.max_concurrent_executions, 2)
            ORDER BY j.priority ASC, j.scheduled_for ASC
            LIMIT 1
            FOR UPDATE OF j SKIP LOCKED
        )
        UPDATE workflow_jobs SET status = 'running', worker_id = :worker_id, claimed_at = NOW()
        WHERE id IN (SELECT id FROM eligible_jobs)
        RETURNING *
    """), {"worker_id": worker_id})
    
    return result.fetchone()
```

### 6.3 Worker Process Concurrency

The worker runs async coroutines. Each coroutine handles one job. The concurrency is controlled by a semaphore.

```python
# worker.py
MAX_CONCURRENT = int(os.getenv("WORKER_CONCURRENCY", "2"))

async def worker_main():
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)
    active_tasks = set()
    
    while True:
        # Clean up completed tasks
        done = {t for t in active_tasks if t.done()}
        active_tasks -= done
        
        # Claim more jobs if under limit
        if len(active_tasks) < MAX_CONCURRENT:
            job = await claim_job(worker_id=WORKER_ID)
            if job:
                task = asyncio.create_task(run_job(job))
                active_tasks.add(task)
            else:
                await asyncio.sleep(0.5)  # No jobs available, wait
        else:
            await asyncio.sleep(0.1)  # At capacity, wait briefly
```

---

## 7. Long-Running Workflows

### 7.1 Problem

Some workflows take a long time to complete:
- Waiting for a webhook response from a human
- Waiting N minutes/hours before continuing
- Processing large batches of data (1000+ items)
- AI workflows with multiple steps

### 7.2 Pause/Resume Pattern

For workflows that need to wait (delay, human input, webhook callback):

```sql
CREATE TABLE execution_pauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_run_id UUID NOT NULL REFERENCES execution_runs(id),
    workflow_job_id UUID NOT NULL REFERENCES workflow_jobs(id),
    
    pause_type TEXT NOT NULL,  -- 'delay', 'webhook_wait', 'human_input', 'approval'
    
    -- For delay type:
    resume_at TIMESTAMPTZ,     -- When to automatically resume
    
    -- For webhook_wait type:
    resume_webhook_url TEXT,   -- URL to call to resume
    resume_token TEXT UNIQUE,  -- Secret token in URL
    
    -- For human_input type:
    prompt TEXT,               -- Question to show user
    
    -- State
    status TEXT DEFAULT 'waiting',  -- waiting, resumed, expired, cancelled
    input_data JSONB,               -- Data provided when resuming
    execution_state JSONB NOT NULL, -- Serialized execution state at pause point
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resumed_at TIMESTAMPTZ
);

CREATE INDEX idx_pauses_resume ON execution_pauses(resume_at) 
WHERE status = 'waiting' AND pause_type = 'delay';
```

### 7.3 Resume Flow

```
1. Execution reaches "Wait" node
   ↓
2. Worker saves execution state to execution_pauses
   ↓
3. Job marked as 'paused' (not completed)
   ↓
4. For delay: maintenance worker polls for expired pauses, re-queues job
   For webhook: when resume URL is called, updates pause record, re-queues job
   For human: when user submits form, updates pause record, re-queues job
   ↓
5. Re-queued job resumes execution from saved state
```

### 7.4 Execution Timeout Strategy

| Scenario | Default timeout | Configurable? |
|----------|----------------|---------------|
| Single node | 30 seconds | Yes (node settings) |
| Entire workflow | 15 minutes | Yes (workflow settings) |
| AI node | 60 seconds | Yes |
| Code node (JS/Python) | 30 seconds | Yes |
| HTTP request node | 30 seconds | Yes |
| Long-running batch | 30 minutes max | No override |

**Timeout enforcement**:
```python
async def execute_node(node: Node, context: ExecutionContext) -> NodeResult:
    timeout = context.get_node_timeout(node)  # from settings or default
    try:
        async with asyncio.timeout(timeout):
            return await node.run(context)
    except asyncio.TimeoutError:
        raise NodeTimeoutError(
            f"Node '{node.name}' exceeded {timeout}s timeout"
        )
```

### 7.5 Retry Strategy (Exponential Backoff)

Make uses 8 retries with exponential backoff. FlowHolt implements the same:

| Attempt | Wait before retry |
|---------|------------------|
| 1st | 0s (immediate) |
| 2nd | 2s |
| 3rd | 4s |
| 4th | 8s |
| 5th | 16s |
| 6th | 32s |
| 7th | 64s |
| 8th | 128s |

```python
def calculate_retry_delay(retry_count: int, base_delay_s: int = 2) -> int:
    """Exponential backoff: base * 2^(retry-1), max 300s."""
    if retry_count == 0:
        return 0
    delay = base_delay_s * (2 ** (retry_count - 1))
    return min(delay, 300)  # cap at 5 minutes
```

---

## 8. Storage Architecture

### 8.1 Storage Types and Tiers

| Data type | Volume | Free option | Upgrade path |
|-----------|--------|-------------|-------------|
| Workflow definitions | Small JSON | Supabase PG (500MB free) | Supabase paid ($25/mo) |
| Execution logs | Medium JSON | Supabase PG (truncated after 30 days) | Supabase paid / S3 |
| Binary data (files) | Variable | Supabase Storage (1GB free) | Supabase Storage paid (25GB = $5) |
| Credential vault | Tiny encrypted | Supabase PG + local AES | Supabase Vault |
| AI conversation memory | Small JSON | Supabase PG | Supabase paid |

**Decision**: All storage uses Supabase free tier. Binary files use Supabase Storage.

### 8.2 Execution Log Retention

Logs accumulate fast. FlowHolt must enforce retention limits:

| Tier | Retention | Max logs |
|------|-----------|---------|
| Free | 7 days | 100 runs |
| Starter | 30 days | 1,000 runs |
| Pro | 90 days | 10,000 runs |
| Business | 1 year | 100,000 runs |

**Pruning job** (runs daily via Postgres scheduler):

```sql
-- Delete old execution runs beyond retention
DELETE FROM execution_runs
WHERE workspace_id = :workspace_id
  AND created_at < NOW() - (INTERVAL '1 day' * :retention_days);

-- Delete runs beyond count limit (keep latest N)
DELETE FROM execution_runs
WHERE id IN (
    SELECT id FROM execution_runs
    WHERE workspace_id = :workspace_id
    ORDER BY created_at DESC
    OFFSET :max_runs
);
```

### 8.3 Binary Data / File Attachments

**Node types that produce binary data**: HTTP Request (response body), Google Drive Download, Email attachment, Code node (file output).

**Storage strategy**:

```python
# app/storage.py
class BinaryDataManager:
    """Manages binary data (files) produced during workflow execution."""
    
    async def store(self, data: bytes, filename: str, mime_type: str, 
                    execution_id: str) -> str:
        """Store binary data, return reference ID."""
        if len(data) > 50 * 1024 * 1024:  # 50MB limit on free tier
            raise FileTooLargeError("Binary data exceeds 50MB limit")
        
        # Upload to Supabase Storage
        path = f"executions/{execution_id}/{filename}"
        await supabase.storage.from_("execution-artifacts").upload(
            path, data, {"content-type": mime_type}
        )
        
        # Store reference in DB
        return await self.create_artifact_record(
            execution_id=execution_id,
            storage_path=path,
            filename=filename,
            size_bytes=len(data),
            mime_type=mime_type
        )
    
    async def get_signed_url(self, artifact_id: str, expires_in_s: int = 3600) -> str:
        """Get signed URL to download binary data."""
        artifact = await self.get_artifact(artifact_id)
        return await supabase.storage.from_("execution-artifacts").create_signed_url(
            artifact.storage_path, expires_in_s
        )
```

### 8.4 Credential Vault

**Current implementation**: AES-256-GCM with `encryption.py`.

**Recommended upgrade**: Supabase Vault (uses pgcrypto + Supabase key management).

```python
# Phase 1 (current — free, local encryption):
class CredentialVault:
    def encrypt(self, plaintext: str) -> str:
        key = get_encryption_key()  # From environment variable
        return aes_256_gcm_encrypt(plaintext, key)
    
    def decrypt(self, ciphertext: str) -> str:
        key = get_encryption_key()
        return aes_256_gcm_decrypt(ciphertext, key)

# Phase 2 (Supabase Vault — when needed):
# Uses pgsodium extension, keys managed by Supabase
# EXECUTE IMMUTABLE FUNCTION vault.encrypt('value', key_id)
```

---

## 9. Scaling Path

### 9.1 Current State ($0/month)

```
[Single Render.com Free Instance]
├── FastAPI (API) ← 0.1 vCPU, 512MB RAM
├── Worker (embedded) ← shares resources with API
└── Supabase Free PG ← 500MB, unlimited connections
```

**Limitations**:
- 2 concurrent workflow executions max
- API + worker compete for same 0.1 vCPU
- Instance sleeps after 15 min inactivity (Render free)
- 500MB PG storage limit

**Workaround for sleep**: UptimeRobot (free) pings `/health` every 14 minutes.

### 9.2 Starter Upgrade ($12-20/month)

```
[Render.com Starter - $7/month]
├── FastAPI (API) ← 0.5 vCPU, 512MB RAM (no sleep)
├── Worker (separate process) ← 5 concurrent executions
└── Supabase Starter $0 or Pro $25 ← 8GB storage
```

Additional changes:
- Remove sleep workaround (Render paid = always-on)
- Increase `WORKER_CONCURRENCY=5`
- Increase execution retention to 30 days

### 9.3 Growth Tier ($50-100/month)

```
[Render.com Standard - $25/month]
├── FastAPI (2 replicas) ← 1 vCPU, 2GB RAM each
├── Worker (separate service, 2 replicas) ← 20 concurrent executions
├── Redis (Upstash free → Upstash Pro $17/month)
└── Supabase Pro - $25/month ← 8GB storage
```

Changes:
- Migrate queue from Postgres SKIP LOCKED → Redis + BullMQ
- Add Redis for rate limiting and pub/sub (real-time execution streaming)
- Add WebSocket server for live execution updates
- Add Prometheus metrics endpoint

### 9.4 Scale Tier ($200+/month)

```
[Railway or Fly.io]
├── FastAPI (3+ replicas, load balanced)
├── Worker pool (10+ workers, horizontal scaling)
├── Redis Cluster (BullMQ + pub/sub)
├── Supabase Pro or AWS RDS
└── AWS S3 for binary data storage
```

---

## 10. Operations Model (Usage Limits)

### 10.1 What Is an "Operation"?

Make.com calls API calls "operations". Each module that runs = 1 operation. FlowHolt adopts the same model.

**FlowHolt operation definition**: 1 operation = 1 node execution (1 item through 1 node).

For batch processing (1 item array through 5 nodes = 5 operations, not 5×1=5, rather it IS 5).

For iterator nodes processing 100 items through 3 nodes = 300 operations.

### 10.2 Free Tier Limits

| Resource | Free Limit | Reset | Enforcement |
|----------|-----------|-------|------------|
| Operations/month | 1,000 | Calendar month | Soft limit (warn at 800, hard stop at 1000) |
| Workflows | 5 active | — | Hard limit |
| Execution history | 7 days / 100 runs | Rolling | Auto-delete old |
| Data stores | 1 store, 100 records | — | Error on exceed |
| Webhooks | 3 endpoints | — | Hard limit |
| AI nodes | 100 calls/month | Calendar month | Routed to free tier models |
| File storage | 100MB | — | Error on exceed |
| Concurrent executions | 2 | — | Queue-enforced |
| Schedule interval | 15 minutes min | — | Enforced at save time |

### 10.3 Operation Tracking

```sql
CREATE TABLE monthly_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    month TEXT NOT NULL,                 -- "2024-01"
    operations_used INTEGER DEFAULT 0,
    ai_calls_used INTEGER DEFAULT 0,
    data_transfer_bytes BIGINT DEFAULT 0,
    executions_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, month)
);

-- Atomic increment (called after each node execution):
INSERT INTO monthly_usage (workspace_id, month, operations_used)
VALUES (:workspace_id, TO_CHAR(NOW(), 'YYYY-MM'), 1)
ON CONFLICT (workspace_id, month)
DO UPDATE SET operations_used = monthly_usage.operations_used + 1;
```

### 10.4 Limit Enforcement

```python
async def check_operation_limit(workspace_id: str, db: AsyncSession) -> None:
    """Check if workspace can run more operations. Raise if limit exceeded."""
    usage = await get_monthly_usage(workspace_id, db)
    limit = await get_workspace_plan_limit(workspace_id, db)
    
    if usage.operations_used >= limit.max_operations:
        raise OperationLimitExceededError(
            f"Monthly operation limit of {limit.max_operations} reached. "
            f"Upgrade your plan or wait until next month."
        )
    
    if usage.operations_used >= limit.max_operations * 0.8:
        # Send warning notification (80% of limit)
        await send_usage_warning_notification(workspace_id, usage, limit)
```

---

## 11. Real-Time Execution Streaming

### 11.1 Problem

The frontend Studio needs to show live execution progress: which node is running, data flowing through connections, completion status.

Make.com uses Socket.IO (Engine.IO v4) for this. n8n uses its own WebSocket protocol.

### 11.2 Free Tier Approach: Server-Sent Events (SSE)

SSE is simpler than WebSockets, works over HTTP/1.1, and is free (no extra infrastructure).

**Implementation**:

```python
# app/routers/studio.py
from fastapi import Request
from fastapi.responses import StreamingResponse
import asyncio

@router.get("/studio/executions/{execution_id}/stream")
async def stream_execution(execution_id: str, request: Request):
    """Stream execution progress as Server-Sent Events."""
    
    async def event_generator():
        last_node_run_id = None
        
        while True:
            if await request.is_disconnected():
                break
            
            # Poll for new node run results
            new_results = await get_new_node_results(execution_id, after=last_node_run_id)
            
            for result in new_results:
                data = {
                    "nodeId": result.node_id,
                    "status": result.status,
                    "itemCount": result.output_item_count,
                    "durationMs": result.duration_ms,
                }
                yield f"data: {json.dumps(data)}\n\n"
                last_node_run_id = result.id
            
            # Check if execution completed
            execution = await get_execution(execution_id)
            if execution.status in ("success", "error", "cancelled"):
                yield f"data: {json.dumps({'type': 'complete', 'status': execution.status})}\n\n"
                break
            
            await asyncio.sleep(0.5)  # Poll every 500ms
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )
```

**Frontend consumption**:
```typescript
const eventSource = new EventSource(`/api/studio/executions/${runId}/stream`);
eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateNodeStatus(data.nodeId, data.status);
};
```

### 11.3 Upgrade Path: WebSockets

When SSE becomes insufficient (e.g., bidirectional communication needed, collaboration features):

1. Add `websockets` library to FastAPI
2. Use Redis pub/sub as message broker between worker and WebSocket server
3. Worker publishes execution events to Redis channel
4. WebSocket server subscribes and pushes to connected clients

---

## 12. Architecture Decisions Summary Table

| Decision | Free Tier Choice | Upgrade Path | When to Upgrade |
|----------|-----------------|--------------|-----------------|
| Execution host | Render.com free | Render.com $7/month | When > 100 executions/day |
| Queue backend | Postgres SKIP LOCKED | Redis + BullMQ | When > 100 workers or > 1000 jobs/min |
| Scheduling | Postgres poll (15s) | Postgres poll (5s) or pg_cron | When < 1min schedules needed |
| AI routing | Groq free + Gemini free | User-provided keys | When rate limits hit regularly |
| Real-time streaming | SSE polling (500ms) | WebSockets + Redis pub/sub | When collaboration or < 100ms needed |
| Binary storage | Supabase Storage (1GB) | Supabase Storage paid | When > 1GB files |
| Secret vault | AES-256-GCM local | Supabase Vault | When SOC2 compliance needed |
| Concurrency | 2 parallel | 5 → 20 → unlimited | Per tier |
| Monitoring | None (Phase 1) | Prometheus + Grafana | When scaling issues occur |
| Worker topology | Embedded worker | Separate service | When API and worker compete |

---

## 13. Environment Variables Reference

All configuration via environment variables (12-factor app pattern):

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# Auth
JWT_SECRET=xxx
JWT_ALGORITHM=RS256

# AI Providers
GROQ_API_KEY=xxx
GOOGLE_AI_API_KEY=xxx
HUGGINGFACE_API_KEY=xxx  # Optional

# Worker
WORKER_CONCURRENCY=2          # How many jobs worker runs in parallel
WORKER_POLL_INTERVAL_MS=500   # How often worker polls for new jobs
SCHEDULER_POLL_INTERVAL_S=15  # How often scheduler checks for due schedules

# Execution limits
MAX_WORKFLOW_EXECUTION_TIMEOUT_MINUTES=15
MAX_NODE_EXECUTION_TIMEOUT_SECONDS=30
DEFAULT_EXECUTION_RETENTION_DAYS=7

# Feature flags
ENABLE_AI_NODES=true
ENABLE_MCP_SERVER=true
ENABLE_CUSTOM_CODE_NODES=true
MIN_SCHEDULE_INTERVAL_SECONDS=60  # Free tier minimum
```

---

## 14. Health Check Endpoints

Required for Render.com deployment and monitoring:

```python
# app/routers/system.py

@router.get("/health")
async def health():
    """Basic liveness check — returns 200 if process is running."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@router.get("/health/ready")
async def health_ready(db: AsyncSession = Depends(get_db)):
    """Readiness check — returns 200 only if DB is accessible."""
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    ready = db_status == "ok"
    return JSONResponse(
        status_code=200 if ready else 503,
        content={
            "status": "ready" if ready else "not_ready",
            "checks": {"database": db_status}
        }
    )

@router.get("/version")
async def version():
    return {"version": settings.APP_VERSION, "environment": settings.ENVIRONMENT}
```

Render.com health check config in `render.yaml`:
```yaml
services:
  - type: web
    name: flowholt-api
    buildCommand: pip install -r requirements.txt && alembic upgrade head
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: flowholt-db
          property: connectionString
```
