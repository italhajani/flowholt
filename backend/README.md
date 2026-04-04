# FlowHolt Backend

Zero-budget backend foundation for FlowHolt.

## Why this stack

- `FastAPI`: free, fast, production-capable Python API framework.
- `sqlite3`: built into Python, no hosted database bill while validating the product.
- `psycopg`: ready for the Supabase/Postgres migration when you go online.
- `Ollama` optional: local model runtime for zero recurring model spend.
- `HTTPX`: lets us call local or remote model/tool endpoints later.

## Run locally

1. Create a virtual environment.
2. Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

3. Copy env values:

```powershell
Copy-Item backend/.env.example backend/.env
```

4. Start the API:

```powershell
python -m uvicorn backend.app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `POST /api/auth/dev-login`
- `GET /api/session`
- `GET /api/workspaces`
- `GET /api/workspaces/current`
- `GET /api/workspaces/current/settings`
- `PUT /api/workspaces/current/settings`
- `GET /api/workspaces/current/members`
- `GET /api/templates`
- `GET /api/workflows`
- `POST /api/workflows`
- `GET /api/workflows/{workflow_id}/versions`
- `GET /api/workflows/{workflow_id}/versions/{version_id}`
- `POST /api/workflows/{workflow_id}/versions`
- `POST /api/workflows/{workflow_id}/publish`
- `POST /api/workflows/{workflow_id}/queue-run`
- `GET /api/vault`
- `GET /api/vault/connections`
- `GET /api/vault/credentials`
- `GET /api/vault/variables`
- `POST /api/vault/assets`
- `PUT /api/vault/assets/{asset_id}`
- `GET /api/executions`
- `GET /api/jobs`
- `POST /api/workflows/{workflow_id}/run`
- `GET /api/workflows/{workflow_id}/trigger-details`
- `POST /api/triggers/webhook/{workflow_id}`
- `POST /api/system/run-scheduled`
- `POST /api/system/process-jobs`
- `GET /api/system/setup-report`

## Vault token syntax

Use Vault assets inside workflow configs with runtime tokens:

- `{{vault.variable.OPENAI_MODEL_PRIMARY}}`
- `{{vault.credential.OpenAI Production.api_key}}`
- `{{vault.connection.Support escalation connection.channel}}`

## Recommended zero-budget path

- Start local-first with SQLite.
- Move database/auth to Supabase free tier when you need multi-user cloud access.
- Keep model execution on `LLM_MODE=mock` for development and switch to `LLM_MODE=ollama` for local open-source models.
- Add a lightweight worker layer next when webhook and scheduled volume outgrows direct in-process execution.

## Current auth mode

- Local development can still use `x-flowholt-user-id` and `x-flowholt-workspace-id` headers.
- You can now also request a signed bearer token through `POST /api/auth/dev-login`.
- When you go online, replace dev-login usage with real Supabase Auth on the frontend and pass the bearer token to the backend.
- If `SUPABASE_URL` and `SUPABASE_JWT_SECRET` are configured, the backend can verify Supabase-style bearer tokens and map them to internal users by email automatically.
- If only `SUPABASE_URL` is configured, the backend can use Supabase JWKS mode for modern signing keys.
- `GET /api/auth/preflight` tells you which auth mode is currently active.

## Database modes

- Local default: leave `DATABASE_URL` empty and use `DATABASE_PATH`.
- Hosted mode: set `DATABASE_URL` to a Postgres connection string and the backend will switch to the Postgres driver path automatically.
- `GET /health` now reports the active `database_backend`.
- `GET /api/system/setup-report` gives a plain readiness checklist for the current workspace.

## Moving local data to Supabase

When you are ready to copy your local SQLite data into hosted Postgres:

```powershell
npm run backend:migrate-postgres
```

That reads from `DATABASE_PATH` and writes into `DATABASE_URL`.

## Webhook and scheduler security

- Each workspace can now store a public base URL and webhook-signing behavior through `PUT /api/workspaces/current/settings`.
- Webhook routes can require:
  - `x-flowholt-timestamp`
  - `x-flowholt-signature`
- The scheduler endpoint can be protected with `SCHEDULER_SECRET` and the `x-flowholt-scheduler-secret` header.
- Keep signature enforcement off during local exploration if needed, then enable it before public rollout.

## Queue and worker mode

- Use `POST /api/workflows/{workflow_id}/queue-run` to queue a workflow for background processing.
- Use `POST /api/system/process-jobs` to claim and execute queued jobs.
- `GET /api/jobs` lets you inspect the recent queued job states for the current workspace.
- This gives you a cheap worker model now, even before adding Redis or a full queue service.
