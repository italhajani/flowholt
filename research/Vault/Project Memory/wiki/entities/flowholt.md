---
title: FlowHolt
type: entity
tags: [flowholt, product, platform, automation]
sources: [flowholt-plans, flowholt-codebase]
updated: 2026-04-17
---

# FlowHolt

The product being built. An automation workflow platform targeting the same market as [[make]] and [[n8n]].

---

## Current State

**Stack:**
- Frontend: React + TypeScript + Vite + Tailwind
- Backend: FastAPI (Python), modular `main.py` + `helpers.py` + 13 router modules
- Database: SQLite by default, PostgreSQL supported via `DATABASE_URL`
- Auth: JWT tokens, role-based
- Deployment: Render (configured in render.yaml)

**What exists today:**
- Working Studio (canvas-based workflow editor)
- Node registry with multiple node families
- Execution engine with retry fields
- Vault asset system (credentials, connections)
- Role system (workspace-level only, pre-org/team hierarchy)
- OAuth2 support
- Webhook infrastructure
- Scheduler infrastructure
- Human task inbox / pause-resume flows
- Environment pipeline and deployment approval reviews
- Dashboard surfaces for workflows, executions, credentials, integrations, AI agents, environment, and audit

**What is planned but not yet built:**
- Org → Team → Workspace hierarchy (currently flat workspace-only)
- Full AI agent management surface
- Runtime operations dashboard (queue, workers, dead-letter)
- Analytics and credit tracking surfaces
- Automation map (org-level dependency view)

---

## Architecture Overview

```
Frontend (React)
    │
    └── src/
        ├── components/studio/     ← WorkflowStudio, canvas, panels
        ├── components/dashboard/  ← layout, sidebar, header
        ├── pages/dashboard/       ← all page components
        └── lib/api.ts             ← API client contracts

Backend (FastAPI)
    │
    └── backend/app/
        ├── main.py                ← app setup, middleware, startup, router registration
        ├── helpers.py             ← shared business logic
        ├── routers/               ← 13 domain modules
        ├── models.py              ← request/response + persistence models
        ├── executor.py            ← workflow execution engine
        ├── expression_engine.py   ← {{ }} template evaluator
        ├── node_registry.py       ← node type registry
        ├── integration_registry.py← integration metadata
        ├── repository.py          ← data access layer
        ├── db.py                  ← SQLite/Postgres backend adapter
        ├── auth.py                ← JWT + roles
        ├── deps.py                ← session / RBAC / audit dependencies
        ├── errors.py              ← error taxonomy + execution handlers
        ├── scheduler.py           ← trigger scheduling
        └── seeds.py               ← seed data
```

---

## Node Families

| Family | Description |
|--------|-------------|
| trigger | Manual, webhook, schedule, chat, event, polling |
| data/logic | Transform, filter, branch, merge, iterator |
| output/integration | HTTP, app connectors |
| pause/human | Pause node, human inbox |
| core AI | AI agent node, LLM call |
| AI specialist | Embedder, chunker, vector search |

---

## Related Pages

- [[overview]] — master synthesis and design direction
- [[make]] — primary competitor and pattern source
- [[n8n]] — secondary competitor
- [[wiki/concepts/studio-anatomy]] — Studio surface design
- [[wiki/concepts/backend-architecture]] — 13-domain module plan
- [[wiki/concepts/control-plane]] — org/team/workspace hierarchy
- [[wiki/concepts/execution-model]] — how runs work
- [[wiki/sources/flowholt-plans]] — 48 planning files
