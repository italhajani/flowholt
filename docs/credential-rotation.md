# Credential Rotation Map

When you rotate keys later, replace them only in these local files and later in hosted deployment settings.

## Frontend

File:
- `flowholt-web/.env.local`

Replace these values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Keep these unchanged unless your app URL or engine URL changes:
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ENGINE_URL`

## Backend

File:
- `flowholt-engine/.env`

Replace these values:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Replace this only if your database password or connection string changes later:
- any future `DATABASE_URL` or Postgres connection variable you add

## Hosted envs later

After rotation, also replace the same values in:
- Vercel project environment variables for `flowholt-web`
- Render service environment variables for `flowholt-engine`

## What does not need code changes

You do not need to edit TypeScript or Python source files when keys rotate.
Only update env files and deployment environment variables.
