# Migration Runner Quickstart

This adds a safer deploy-time migration flow for FlowHolt.

## What this means

Instead of opening Supabase SQL editor and clicking each migration manually for every environment, you can now let FlowHolt:

- check which local SQL files are still pending
- track which migrations were already applied
- apply pending migrations in order

## Setup

You need one database connection string and the PostgreSQL `psql` client.

Use one of these env vars:

- `FLOWHOLT_DATABASE_URL`
- `SUPABASE_DB_URL`
- `DATABASE_URL`

Optional:

- `FLOWHOLT_PSQL_PATH`
  Use this if `psql` is installed in a custom location on your machine or server.

## Commands

From `flowholt-web`:

1. Check migration status:
   `npm run migrations:status`
2. Apply pending migrations:
   `npm run migrations:apply`

## How to see output

This step is mostly terminal/deploy output, not a new page in the app.

What you will see in terminal:

- how many migrations are already applied
- which migrations are still pending
- each migration name while it is being applied
- `All pending migrations applied.` when done

## Easy meaning

- local SQL files = what exists in your repo
- applied migrations = what your database already has
- migration runner = the bridge that keeps those two in sync during deployment
