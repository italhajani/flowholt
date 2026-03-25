# Supabase Migration Step

Run this before expecting FlowHolt to save workspaces or workflows.

## In Supabase

1. Open SQL Editor.
2. Create a new query.
3. Paste the full contents of:
   - `supabase/migrations/20260325_0001_flowholt_core.sql`
4. Run it.

## What this creates

- `workspaces`
- `workflows`
- `workflow_runs`
- `run_logs`
- indexes
- RLS policies
- updated_at triggers

## After running it

1. Sign up or sign in to FlowHolt.
2. Open `/app/dashboard`.
3. Create your first workspace.
4. Click `Create starter workflow`.
5. Open the workflow in Studio.
