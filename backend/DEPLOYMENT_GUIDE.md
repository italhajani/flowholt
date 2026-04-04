# FlowHolt Online Setup Guide

## When you should move online

Move from local-only mode to hosted mode when one of these becomes true:

- you want public webhook URLs
- you want the app to work from multiple devices
- you want teammates to log in
- you want scheduled runs to continue even when your laptop is off

Until then, local SQLite plus local dev-login is enough.

## Cheapest practical rollout order

1. Keep building locally with:
   - `SQLite`
   - `ALLOW_DEV_LOGIN=true`
   - `LLM_MODE=mock` or `LLM_MODE=ollama`
2. Deploy the FastAPI backend to a public host.
3. Move the database from local SQLite to hosted Postgres.
4. Put a real session secret in env.
5. Replace dev-login with Supabase Auth tokens on the frontend.
6. Add a free cron service for scheduled workflows and queued job processing.
7. Add real provider secrets in Vault.

## Recommended zero-budget-ish online stack

- Backend API: FastAPI
- Database/Auth: Supabase
- Hosting: Render, Fly.io, or Railway depending on your comfort and pricing tolerance
- Scheduler trigger: GitHub Actions cron, Cron-job.org, or another free cron caller
- Models: Ollama on your own machine/VPS first, hosted APIs later only if needed

## Minimum environment changes before going public

- `APP_ENV=production`
- `SESSION_SECRET=<strong-random-secret>`
- `ALLOW_DEV_LOGIN=false`
- `CORS_ORIGIN=<your-frontend-domain>`
- `PUBLIC_BASE_URL=<your-public-backend-url>`
- `SCHEDULER_SECRET=<strong-random-secret>`
- `DATABASE_PATH` replaced by your hosted DB config once Postgres support is added
- `DATABASE_URL=<your-supabase-postgres-connection-string>`

## Workspace settings to configure before public webhooks

After the app is online, open workspace settings in the API and set:

- `public_base_url`
- `require_webhook_signature=true`
- `webhook_signing_secret=<strong-random-secret>`

Those are the first manual steps you will do yourself when you want real inbound webhooks safely.

## How to move your current local data

After you set `DATABASE_URL`, run:

```powershell
npm run backend:migrate-postgres
```

That copies your current local SQLite data into hosted Postgres.

## Important note for this codebase today

The current backend is production-shaped, but it is still SQLite-first.
That is perfect for zero-budget build stage.
The next infrastructure migration after local validation is:

1. set `DATABASE_URL` to Supabase Postgres
2. set `SUPABASE_URL`
3. if your project exposes a legacy/shared JWT secret, also set `SUPABASE_JWT_SECRET`
4. if it does not, the backend can use JWKS mode automatically from `SUPABASE_URL`
5. point the frontend to the hosted backend

Do not pay for hosted model APIs first.
Your first online spend should be:

1. public backend hosting
2. hosted database/auth
3. only then model/runtime upgrades if traffic proves the need

## Cheap background processing pattern

When you go online, use two protected calls from a free cron service:

- `POST /api/system/run-scheduled`
- `POST /api/system/process-jobs`

Both should send:

- `x-flowholt-scheduler-secret: <your secret>`

That gives you a simple zero-budget worker loop before you ever add Redis, Celery, or managed queues.
