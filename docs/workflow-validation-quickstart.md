# Workflow Validation Quickstart

FlowHolt now validates workflow graphs before critical actions.

## What is added

- Validation API endpoint: `GET/POST /api/workflows/{workflowId}/validate`
- Composer apply guard: invalid AI-generated graphs are rejected
- Run-time guard: invalid saved workflow graph is blocked before engine execution

## 1. Validate saved workflow graph

```bash
curl "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/validate" -b "your-auth-cookie"
```

## 2. Validate a draft graph before save/apply

```bash
curl -X POST "http://localhost:3000/api/workflows/YOUR_WORKFLOW_ID/validate" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"graph":{"nodes":[],"edges":[]}}'
```

## Response highlights

- `report.valid` true/false
- `report.score` from 0 to 100
- `report.issues[]` with `error` / `warn`
- `report.summary` with counts and cycle/unreachable signals

## Common checks included

- duplicate node ids
- missing output node
- invalid edges
- graph cycles
- unreachable nodes
- weak condition branching
