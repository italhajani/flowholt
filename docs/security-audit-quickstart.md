# Security Audit Quickstart

FlowHolt now has a first real security and operations layer.

## What is new

You can now:

- rotate saved integration secrets from the Integrations page
- see secret rotations, integration deletes, member changes, and workflow restores in the Settings audit trail

## What to run in Supabase

Open Supabase SQL editor and run this as a **new query**:

- `supabase/migrations/20260327_0011_audit_logs_and_secret_rotation.sql`

Do not replace older SQL. This is one more migration on top.

## How to see it in the app

1. Restart `flowholt-web`
2. Open `/app/integrations`
3. Pick any saved connection
4. Paste new secrets JSON into `Rotate secrets`
5. Submit it
6. Open `/app/settings`
7. Look at the new `Audit trail` card

## What gets logged now

- integration created
- integration deleted
- integration secret rotated
- workspace member added
- workspace member role changed
- workspace member removed
- workflow revision restored

## Easy mental model

- Integrations page = where credentials are managed
- Settings page = where security history is visible
- Audit trail = your workspace memory for sensitive actions
