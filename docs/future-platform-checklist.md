# Future Platform Checklist

This is the living checklist to reach the finalized premium FlowHolt platform.

## Current status snapshot

- Backend core progress: **about 76%**
- Frontend/UI progress: **about 45%**
- Production hardening progress: **about 30%**

## Backend foundations

- [x] Workflow schema and run logging (`workflows`, `workflow_runs`, `run_logs`)
- [x] Integration connections (provider configs + secrets)
- [x] Reliable run runner with error handling and run status updates
- [x] Webhook trigger endpoint with key validation
- [x] Recurring scheduler API + scheduler tick orchestration
- [x] AI composer API (preview/apply from user message)
- [x] Workflow revisions history + restore API
- [x] Platform readiness checks (env + backend health)
- [x] Graph validation module + validation endpoint

## Remaining backend (high priority)

- [ ] Durable async run queue (worker process + retry queue + dead-letter handling)
- [ ] Run cancellation endpoint and cooperative stop support in engine
- [ ] Real-time run streaming (SSE/WebSocket for node-by-node updates)
- [ ] Chat session storage for composer sidebar (threads/messages tables)
- [ ] Node-level execution metrics (duration, token estimate, error class)
- [ ] Multi-workspace membership and role-based access (owner/admin/member)
- [ ] Secret rotation flow (replace integration secrets safely)
- [ ] Rate limiting and abuse guardrails on public endpoints
- [ ] Usage and billing counters (runs, tokens, tool calls, workspace limits)
- [ ] Export/import workflow package endpoint (JSON schema with versioning)

## Remaining backend (medium priority)

- [ ] Revision compare endpoint (before vs after graph diff summary)
- [ ] Batch scheduler claiming with stronger lease renewal
- [ ] Webhook idempotency key support
- [ ] Draft run simulation endpoint (no external calls, dry-run validation)
- [ ] Connection test endpoint per provider
- [ ] Audit log table for sensitive actions (restore, delete, secret update)
- [ ] Advanced trigger types (email, cron presets, external event bus)

## Frontend to unlock premium experience

- [ ] Clean chat sidebar with reasoning timeline
- [ ] Composer controls in Studio: Preview, Apply, Undo
- [ ] Revisions panel with one-click restore and compare view
- [ ] Live run timeline UI (node statuses, durations, logs)
- [ ] Schedule builder UI (no API manual calls)
- [ ] Human-readable node config forms (hide raw JSON by default)
- [ ] Integrations setup wizard with inline connection tests
- [ ] Mobile-friendly responsive editor shell

## Production and reliability

- [ ] Add backend tests for scheduler, composer, validation, revisions
- [ ] Add migration runner process for deploy environments
- [ ] Add structured logging and correlation IDs across web + engine
- [ ] Add monitoring dashboards (error rate, run latency, queue depth)
- [ ] Add backup and restore procedure for workflow data
- [ ] Security pass: secret handling, endpoint auth, dependency audit

## Suggested execution order (practical)

- [ ] Phase 1: queue worker + run cancellation + streaming events
- [ ] Phase 2: chat session storage + composer UI actions + revisions panel
- [ ] Phase 3: schedule UI + integration test endpoints + idempotency
- [ ] Phase 4: RBAC + usage/billing + monitoring + security hardening

## Definition of "finalized platform" (what done means)

- [ ] Non-technical user can type a task and get a clear, editable flow
- [ ] User can run, monitor, pause, and retry without touching JSON
- [ ] User can schedule automations and trust reliability/recovery behavior
- [ ] User can view reasoning, history, and restore prior versions instantly
- [ ] Team can operate safely in production with metrics, alerts, and RBAC
