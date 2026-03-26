# Workflow Revisions Quickstart

This adds backend version history for workflow graph changes, including restore/undo.

## 1. Run migration

Execute this file in Supabase SQL editor:

- `supabase/migrations/20260326_0004_workflow_revisions.sql`

## 2. List revisions

```bash
curl "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/revisions?limit=20" -b "your-auth-cookie"
```

## 3. Create a revision entry automatically

Call composer apply mode. It now writes a revision row with before/after graph snapshots.

```bash
curl -X POST "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/compose" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"message":"Add validation and approval branch","mode":"apply"}'
```

Response includes `revision_saved` and `revision_id`.

## 4. Restore a workflow to a previous state

```bash
curl -X POST "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/revisions/YOUR_REVISION_ID/restore" \
  -b "your-auth-cookie"
```

This restores the workflow to the `before_*` snapshot of that revision and logs a restore revision entry.

## Why this matters

- Safe AI edits (you can always roll back)
- Strong foundation for sidebar "Undo" and "Version history" UI
- Better trust for non-technical users
