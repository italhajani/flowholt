# FlowHolt Backend — Competitor Research & Zero-Budget Roadmap

> **Date:** July 2025  
> **Status:** Research Phase (backend development to follow)

---

## Table of Contents

1. [Current Backend Assessment](#1-current-backend-assessment)
2. [Competitor Analysis](#2-competitor-analysis)
3. [Architectural Patterns to Adopt](#3-architectural-patterns-to-adopt)
4. [Free & Zero-Budget Stack](#4-free--zero-budget-stack)
5. [What's Good, What's Not](#5-whats-good-whats-not)
6. [Implementation Roadmap](#6-implementation-roadmap)

---

## 1. Current Backend Assessment

### Tech Stack
| Component | Technology |
|-----------|------------|
| Framework | FastAPI 0.115.0 |
| Runtime | Python 3.10+, Uvicorn 0.30.6 |
| Database | SQLite (dev) / PostgreSQL (prod) via psycopg 3.2.13 |
| Auth | Custom JWT (PyJWT 2.9.0) + Supabase Auth |
| HTTP Client | httpx 0.27.2 |
| Config | pydantic-settings 2.5.2 |

### What's Already Built (118 Endpoints)
- **Auth system** — Dev login, Supabase JWT, RBAC (owner/admin/builder/viewer), session tokens
- **Workflows** — Full CRUD, versioning, deployments, reviews, tags
- **Execution engine** — Sync/async execution, step-by-step processing, pause/resume, retry
- **Node system** — Registry with trigger, transform, condition, llm, output, delay, human, callback types
- **Studio** — Node catalog, preview, validate, test endpoints
- **Vault** — Secrets/credentials management with runtime token resolution (`{{vault.variable.NAME}}`)
- **AI Assistant** — Name generation, trigger inference, category inference, template matching (currently MOCKED)
- **Templates** — Built-in workflow templates
- **Integration registry** — Hardcoded: slack, webhook, openai, anthropic, email
- **Database** — 19+ tables, raw SQL (no ORM)

### Current Gaps
- LLM calls are **100% mocked** (`LLM_MODE="mock"`)
- Only 5 hardcoded integrations (competitors have 280–400+)
- No job queue system (execution is inline)
- No sandboxing for code execution
- No webhook infrastructure for external triggers
- No community node/plugin system

---

## 2. Competitor Analysis

### 2.1 n8n

| Aspect | Details |
|--------|---------|
| **Language** | TypeScript / Node.js |
| **License** | Sustainable Use License (NOT open-source) |
| **Database** | SQLite (default), PostgreSQL, MySQL via TypeORM |
| **Integrations** | 400+ built-in nodes |
| **AI** | LangChain-based cluster nodes (agents, chains, memory, tools, vector stores) |
| **Scaling** | Queue mode with Redis (BullMQ) for worker scaling |
| **Key Tables** | workflow_entity, execution_entity, execution_data, credentials_entity, user, webhook_entity, workflow_history, workflow_statistics |

**Architecture highlights:**
- Main process handles API + webhooks; workers handle execution in queue mode
- TypeORM manages schema and migrations
- Credentials are encrypted at rest with a custom encryption key
- Community nodes installable as npm packages
- Sub-workflow support for composability
- Built-in code execution node with sandboxed task runners

**What to learn from n8n:**
- Execution data is stored separately from execution metadata (good for performance)
- Webhook entity table tracks active webhooks across all workflows
- Workflow history provides built-in version control
- Queue mode with Redis + BullMQ is the standard scaling pattern

### 2.2 Windmill

| Aspect | Details |
|--------|---------|
| **Language** | Rust (backend), Svelte 5 (frontend) |
| **License** | AGPLv3 (Enterprise features proprietary) |
| **Database** | PostgreSQL (also used as job queue) |
| **Integrations** | Hub-based, community-contributed |
| **AI** | Native AI integration support |
| **Scaling** | Stateless API servers + workers pulling jobs from Postgres queue |
| **Performance** | ~50ms job overhead |

**Architecture highlights:**
- **Postgres as job queue** — No Redis needed; workers poll Postgres for pending jobs
- Stateless API servers can be horizontally scaled
- nsjail for sandboxing script execution
- Supports Python, TypeScript, Go, Bash, PowerShell, Rust scripts
- Docker Compose deployment with just 3 files
- Workers are separate processes, enabling true parallelism

**What to learn from Windmill:**
- **Postgres-as-queue is the most budget-friendly pattern** — eliminates Redis dependency
- Stateless API design allows cheap horizontal scaling
- Separation of API server and worker processes
- Multi-language support via sandboxed execution

### 2.3 Activepieces

| Aspect | Details |
|--------|---------|
| **Language** | TypeScript (98.9% of codebase) |
| **License** | MIT (community edition) |
| **Database** | PostgreSQL |
| **Integrations** | 280+ pieces (npm packages) |
| **AI** | AI-first, MCP support |
| **Architecture** | NestJS backend, Angular frontend |
| **GitHub** | 21.6k stars, 400+ contributors |

**Architecture highlights:**
- Pieces are npm packages — easy to create, publish, and install
- Worker v2 architecture for improved execution efficiency
- Webhook-based triggers with polling fallback
- Built-in OAuth2 app connections
- Self-hostable via Docker

**What to learn from Activepieces:**
- **MIT license** — the most permissive, best for community adoption
- Pieces as npm packages is elegant for extensibility
- AI-first approach with MCP (Model Context Protocol) support
- Clean separation of pieces from core engine

---

## 3. Architectural Patterns to Adopt

### 3.1 Postgres-as-Queue (from Windmill)
**Why:** Eliminates Redis dependency, zero added cost, works with existing SQLite/Postgres setup.

```
Current:  API → inline execution (blocking)
Proposed: API → insert job to DB → return immediately
          Worker → poll DB for pending jobs → execute → update status
```

**Implementation:**
- Add a `job_queue` table: `id, workflow_id, execution_id, status (pending/running/completed/failed), payload, created_at, started_at, completed_at, worker_id`
- Background worker process polls for `status = 'pending'` with `SELECT ... FOR UPDATE SKIP LOCKED`
- Worker updates status to `running`, executes, then updates to `completed/failed`
- For SQLite dev mode: use a simple in-process async worker

### 3.2 Execution Data Separation (from n8n)
**Why:** Keeps execution metadata queries fast while storing potentially large execution payloads separately.

- Split current execution storage: `executions` (metadata) + `execution_data` (full node outputs)

### 3.3 Plugin/Piece System (from Activepieces)
**Why:** Enables community contributions without modifying core code.

- Define a standard integration interface (Python equivalent of Activepieces' TypeScript pieces)
- Each integration is a Python module with: `manifest.json`, `actions/`, `triggers/`
- Load integrations dynamically at startup
- Start with converting existing 5 hardcoded integrations to this format

### 3.4 Multi-Provider LLM Router (inspired by all competitors)
**Why:** All competitors support multiple LLM providers; FlowHolt currently has none working.

```python
# Route based on config, fallback through free providers
providers = [
    OllamaProvider(base_url),    # Self-hosted, always free
    GeminiProvider(api_key),      # Google free tier
    GroqProvider(api_key),        # Fast free tier
    HuggingFaceProvider(token),   # Open models
]
```

---

## 4. Free & Zero-Budget Stack

### 4.1 LLM Providers (all have free tiers)

| Provider | Free Tier | Best For | API Compatibility |
|----------|-----------|----------|-------------------|
| **Ollama** (self-hosted) | Unlimited (local) | Development, privacy-sensitive | OpenAI-compatible |
| **Google Gemini** | Gemini 2.5 Flash, Flash-Lite, Pro — all free in "Standard" tier | Production, best free models | Google GenAI SDK |
| **Groq** | Free tier with rate limits across many models | Ultra-fast inference | OpenAI-compatible (`api.groq.com/openai/v1`) |
| **HuggingFace Inference** | Free tier for popular models | Embeddings, open models | REST API |

**Recommended primary:** Google Gemini (free tier is extremely generous — multiple frontier models for $0)  
**Recommended secondary:** Groq (OpenAI-compatible, ultra-fast)  
**Recommended for dev:** Ollama (local, no API key needed)

### 4.2 Free Deployment Options

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Render** | 750 hrs/month web service | Already configured (render.yaml in project) |
| **Fly.io** | 3 shared-cpu VMs, 256MB each | Good for workers |
| **Railway** | $5 credit/month (starter) | Easy Postgres hosting |
| **Supabase** | Free Postgres (500MB), Auth, Storage | Already integrated for auth |
| **Neon** | Free Postgres (0.5GB, autoscales to 0) | Serverless Postgres |
| **Docker self-host** | Free on any VPS | Full control |

**Recommended stack:**
- **API + Worker:** Render free tier (already configured)
- **Database:** Supabase Postgres (already integrated) OR Neon free tier
- **Auth:** Supabase Auth (already integrated)
- **LLM:** Gemini free tier + Ollama for local dev

### 4.3 Free Supporting Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Resend** | Transactional email | 3,000 emails/month |
| **Upstash** | Redis (if needed later) | 10,000 commands/day |
| **Cloudflare Workers** | Edge functions, webhooks | 100,000 requests/day |
| **GitHub Actions** | CI/CD | 2,000 minutes/month |

---

## 5. What's Good, What's Not

### What's Good About Current Backend ✓

1. **FastAPI is an excellent choice** — async, fast, auto-docs, type-safe. Matches Windmill's approach of a performant backend.
2. **Raw SQL over ORM** — More control, better performance for complex queries. n8n's TypeORM adds overhead.
3. **Execution engine is well-designed** — Step-by-step processing, context accumulation, pause/resume state management. This is comparable to competitors.
4. **RBAC system is solid** — owner/admin/builder/viewer roles with workspace isolation. Matches n8n's project-based access control.
5. **Vault system is good** — Runtime token resolution (`{{vault.variable.NAME}}`) is similar to n8n's variables and credential injection.
6. **Database schema is comprehensive** — 19+ tables covering workflows, executions, versioning, audit trails, human tasks.
7. **Supabase integration** — Smart use of existing free infrastructure for auth.
8. **Versioning system** — workflow_versions table already tracks version history (like n8n's workflow_history).

### What Needs Improvement ✗

1. **LLM integration is fully mocked** — #1 priority. Implement real LLM calls via Gemini/Groq/Ollama.
2. **No job queue** — Execution is inline/blocking. Need Postgres-as-queue pattern for production readiness.
3. **Only 5 hardcoded integrations** — Need a plugin system and at least 20–30 core integrations.
4. **No webhook infrastructure** — Can't receive external events (Slack events, GitHub webhooks, etc.).
5. **No sandboxing** — Code execution nodes run in the same process. Need isolation.
6. **No migration system** — Raw SQL schema with no versioned migrations. Need Alembic or similar.
7. **Missing execution data separation** — Full execution data stored with metadata, will slow queries at scale.
8. **No cron/scheduler** — scheduled jobs exist in schema but no actual scheduler runs them.

---

## 6. Implementation Roadmap

### Phase 1: Core LLM Integration (Priority: Critical)
> Unblock all AI features by replacing mocked LLM calls with real ones.

- [ ] Create `llm_router.py` — Multi-provider LLM router
- [ ] Implement `OllamaProvider` — Local development (already has `OLLAMA_BASE_URL` config)
- [ ] Implement `GeminiProvider` — Google AI free tier (primary production provider)
- [ ] Implement `GroqProvider` — OpenAI-compatible fast inference
- [ ] Update `assistant_tools.py` — Replace mock responses with real LLM calls
- [ ] Update `executor.py` — Wire LLM node type to router
- [ ] Add `LLM_PROVIDER` and provider-specific env vars to config

### Phase 2: Job Queue System (Priority: High)
> Move from blocking execution to async job processing.

- [ ] Create `job_queue` table in database schema
- [ ] Implement `worker.py` — Background job processor
- [ ] Use `SELECT ... FOR UPDATE SKIP LOCKED` for Postgres queue
- [ ] For SQLite dev: implement in-process async queue
- [ ] Update execution endpoints to enqueue rather than execute inline
- [ ] Add job status polling endpoint

### Phase 3: Database Improvements (Priority: High)
> Production-ready database practices.

- [ ] Add Alembic for schema migrations
- [ ] Separate execution_data from execution metadata
- [ ] Add database indexes for common query patterns
- [ ] Connection pooling configuration

### Phase 4: Webhook & Trigger Infrastructure (Priority: Medium)
> Enable external event-driven workflows.

- [ ] Implement webhook receiver endpoint (`/webhooks/{workflow_id}`)
- [ ] Add webhook registration/deregistration on workflow activate/deactivate
- [ ] Implement cron scheduler for scheduled triggers
- [ ] Add polling triggers for services without webhooks

### Phase 5: Integration Plugin System (Priority: Medium)
> Scalable way to add integrations.

- [ ] Define integration interface (manifest + actions + triggers)
- [ ] Convert existing 5 integrations to plugin format
- [ ] Build dynamic integration loader
- [ ] Add 15–20 high-value integrations: Gmail, Google Sheets, GitHub, Slack (full), HTTP Request, Discord, Notion, Airtable, Telegram, Stripe, etc.

### Phase 6: Security & Production Hardening (Priority: Medium)
> Prepare for real deployment.

- [ ] Add sandboxing for code execution nodes (subprocess with resource limits)
- [ ] Implement rate limiting on API endpoints
- [ ] Add CORS configuration
- [ ] Secrets encryption at rest (like n8n's encryption key)
- [ ] Input validation and sanitization audit

---

## Summary

FlowHolt's backend is in a strong position architecturally. FastAPI + raw SQL gives performance comparable to competitors, and the execution engine's pause/resume model is well-implemented. The critical next steps are:

1. **Real LLM integration** (Gemini free tier is the best option — frontier models at $0)
2. **Async job queue** (Postgres-as-queue, following Windmill's proven pattern)
3. **Integration extensibility** (plugin system inspired by Activepieces' pieces)

All of this can be achieved at **$0/month** using Gemini free tier + Supabase free tier + Render free tier.
