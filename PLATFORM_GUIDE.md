# FlowHolt — Platform Capability Guide

> **AI Workflow Automation Platform**
> Build, run, and manage intelligent workflows with a visual canvas, real integrations, and AI-powered assistance.

---

## What FlowHolt Can Do

### 1. Visual Workflow Builder (Studio)

Open any workflow in the **Studio** to build automation flows on a drag-and-drop canvas.

| Node Type | What It Does |
|-----------|-------------|
| **Trigger** | Starts a workflow — manual, webhook, scheduled (cron), or event-driven |
| **Transform** | Reshapes data using templates, expressions, or custom code |
| **Condition** | Branches the flow based on if/else logic |
| **LLM** | Calls an AI model (Groq, Gemini, Ollama) to generate text, classify, or summarize |
| **Output** | Delivers results — Slack message, email, webhook POST, or log |
| **Delay** | Pauses execution for a set duration |
| **Human** | Waits for a human to approve, reject, or choose an option |
| **Callback** | Pauses until an external system calls back with data |

### 2. Real Integrations

FlowHolt connects to external services with **real API calls** — not mocks:

- **Slack** — Send messages via incoming webhook
- **Email** — Send via SMTP (Gmail, SendGrid, any provider)
- **Webhooks** — Send/receive HTTP requests to any URL
- **Airtable** — List records, create records
- **Notion** — Create pages, query databases
- **HTTP Request** — Call any REST API (GET/POST/PUT/PATCH/DELETE)
- **13 integration plugins** loaded dynamically

### 3. AI Assistant (Chat Panel)

The **Chat Panel** in Studio lets you talk to an AI assistant that:

- Answers questions about your workflow
- Suggests next steps and improvements
- Provides **"Add to Canvas"** buttons to insert nodes directly
- Offers **"Run Workflow"** actions to execute from chat
- Streams responses in real-time via SSE

### 4. Workflow Execution Engine

- **Real executor** — runs every node in sequence, handles branching, delays, and retries
- **Sandbox** — executes custom Python or JavaScript code safely in subprocess isolation
- **Job queue** — background execution with worker lease system
- **Execution history** — full timeline with per-step results, duration, and artifacts
- **Pause/Resume** — human tasks and callbacks pause execution until resolved

### 5. Vault (Secrets & Credentials)

Store API keys, connections, and variables securely:

- **AES-GCM encryption** at rest (with XOR-HMAC fallback)
- **Three asset types**: credentials, connections, variables
- **Scoped access**: workspace, staging, production
- **Role-based visibility** — control who can see/use each secret
- **Health checks** — verify connections are valid before using them

### 6. Dashboard

16 pages covering every aspect of the platform:

| Page | Purpose |
|------|---------|
| **Overview** | Real-time stats, charts, recent activity |
| **Workflows** | List, search, create, bulk-delete workflows |
| **Executions** | Full execution history with filters and inspector |
| **Templates** | Pre-built workflow templates, create from template |
| **Integrations** | Browse and configure connected services |
| **Vault** | Manage secrets, credentials, connections |
| **Settings** | Workspace configuration, deployment rules, webhooks |
| **Providers** | Configure LLM providers (Groq, Gemini, Ollama) |
| **Activity** | Audit trail of all actions across the workspace |
| **Notifications** | Real-time alerts for workflow events |

### 7. Deployment & Versioning

- **Workflow versions** — every save creates a numbered version
- **Staging → Production** pipeline with optional approval workflows
- **Import/Export** — download workflows as JSON, import into other workspaces
- **Rollback** — revert to any previous version

### 8. Security

- **Session-based auth** with configurable TTL
- **Role-based access control** — Owner, Admin, Builder, Viewer
- **Rate limiting** — global + per-endpoint limits on sensitive routes
- **Security headers** — HSTS, X-Frame-Options, CSP-adjacent protections
- **Webhook signatures** — HMAC-SHA256 verification with timestamp tolerance
- **Production safety checks** — fail-fast if secrets aren't configured

### 9. API

**151 REST endpoints** covering:

- Workflows CRUD + execution + versioning
- Templates CRUD
- Vault assets CRUD + health + verify
- OAuth2 flows (authorize, callback, refresh)
- Workspace management + member management
- Notifications (create, read, mark-read)
- Global search (workflows, templates, vault, executions)
- SSE streaming for chat + real-time events
- System health, scheduler control, artifact pruning

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| **State** | React Query (TanStack Query v5) |
| **Charts** | Recharts |
| **Build** | Vite with code splitting |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite (dev) / PostgreSQL via Supabase (prod) |
| **AI** | Groq, Google Gemini, Ollama (auto-fallback chain) |
| **Encryption** | AES-GCM + PBKDF2 key derivation |
| **Hosting** | Render (backend + frontend static site) |

---

## Deployment

FlowHolt is configured for **Render** deployment:

1. **Backend** — Python web service with auto-generated secrets
2. **Frontend** — Static site with SPA rewrites
3. **Database** — Supabase PostgreSQL (connection pooled)

Set these environment variables in Render Dashboard:

| Variable | Where to Get It |
|----------|----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string |
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `CORS_ORIGIN` | Your frontend Render URL |
| `PUBLIC_BASE_URL` | Your backend Render URL |
| `VITE_API_BASE_URL` | Your backend Render URL (frontend env) |

`SESSION_SECRET`, `VAULT_ENCRYPTION_KEY`, and `SCHEDULER_SECRET` are auto-generated by Render.

---

## Tests

- **80 tests** across 11 test files — all passing
- **0 TypeScript errors**
- Production build: **~870 KB** gzipped total

---

## What's Next (Future Enhancements)

- **Autonomous Agents** — Let AI plan and build entire workflows from a prompt
- **Multi-step agent loops** — LLM nodes that iterate until a goal is met
- **Live collaboration** — Multiple users editing the same canvas
- **Marketplace** — Share and install community templates
- **Advanced scheduling** — Complex cron patterns, timezone-aware triggers
- **Monitoring dashboard** — SLA tracking, error rate alerts, cost tracking
