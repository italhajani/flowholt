# Workflow Composer API Quickstart

This backend endpoint lets chat messages generate or apply workflow graph changes.

## Endpoint

- `GET /api/workflows/{workflowId}/compose`
- `POST /api/workflows/{workflowId}/compose`

Authentication uses the existing Supabase session cookie.

## Preview a proposal

```bash
curl -X POST "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/compose" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"message":"Add a qualification condition and send email only for high score","mode":"preview"}'
```

Response includes:

- `proposal.graph` with generated nodes/edges
- `proposal.reasoning` for sidebar thinking text
- `proposal.changes` for explicit add/update/remove items
- `proposal.summary` counts (nodes, edges, tools, conditions)

## Apply proposal to workflow

```bash
curl -X POST "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/compose" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"message":"Switch trigger to webhook and add CRM update step","mode":"apply"}'
```

When `mode` is `apply`, the workflow row is updated with:

- new `name`, `description`, and `graph`
- `settings.composer.last_plan`
- `settings.composer_history` (rolling latest 25 entries)

## Read composer context for sidebar chat

```bash
curl "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/compose" -b "your-auth-cookie"
```

Use this to preload last plan and history when you build the chat sidebar UI.

## Notes

- Uses `generateWorkflowRevision()` with provider order: Groq -> Hugging Face -> local fallback.
- Fallback mode still returns `reasoning` and `changes` so the UI can stay consistent.
