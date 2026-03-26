# Platform Readiness Check

FlowHolt now includes a readiness check so you can quickly verify missing credentials and backend health.

## Where to view

- In app: `/app/settings` under **Platform readiness**
- API: `GET /api/platform/readiness` (authenticated)

## What it checks

- Supabase URL and publishable key
- `SUPABASE_SERVICE_ROLE_KEY` for admin APIs
- `FLOWHOLT_SCHEDULER_KEY` for scheduler tick security
- Engine URL + `/health` reachability
- AI provider key availability (Groq/Hugging Face)
- Supabase query health (user client + admin client)

## Important for your current setup

If `SUPABASE_SERVICE_ROLE_KEY` is missing in `flowholt-web/.env.local`, webhook/scheduler/admin-backed endpoints will fail even if login works.
