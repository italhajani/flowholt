# Workspace Roles Quickstart

This is the first real team-access layer in FlowHolt.

## What it does

- lets one workspace have multiple users
- gives each user a role: `owner`, `admin`, or `member`
- lets you switch the active workspace from the Settings page
- makes the rest of the app use that active workspace

## Role meanings

- `owner`: full control over workspace and team access
- `admin`: can manage members, integrations, and schedules
- `member`: can build workflows, run them, and inspect activity

## How to turn it on

1. Open Supabase SQL editor
2. Make a **new query**
3. Run `supabase/migrations/20260326_0007_workspace_memberships.sql`
4. Then run `supabase/migrations/20260326_0008_workspace_policy_fix.sql`
5. Do not replace old SQL queries; these are new migrations on top of the previous ones

## How to see it in the app

1. Start `flowholt-web` with `npm run dev`
2. Open `/app/settings`
3. You will now see:
   - an `Active workspace` switcher
   - a `Team access` panel
   - role badges for workspace members
4. If you have more than one workspace, switch it here and then open Dashboard or Workflows again

## Current limitation

For now, adding a teammate uses their Supabase auth user id instead of email invite. We can make this email-based later.