# Future Platform Checklist

This is the living checklist to reach the finalized premium FlowHolt platform.

## Current status snapshot

- Backend core progress: **about 92%**
- Frontend/UI progress: **about 76%**
- Production hardening progress: **about 35%**

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
- [x] Draft/saved workflow simulation endpoint
- [x] Connection test endpoint per provider
- [x] Run streaming endpoint for live monitoring
- [x] Durable run job queue table + worker endpoint
- [x] Node-level execution metrics storage

## Remaining backend (high priority)

- [ ] Durable async run worker as a separate always-on process
- [x] Run cancellation endpoint and cooperative stop support in engine
- [x] Real-time run streaming (SSE/WebSocket for node-by-node updates)
- [x] Chat session storage for composer sidebar (threads/messages tables)
- [x] Node-level execution metrics (duration, token estimate, error class)
- [ ] Multi-workspace membership and role-based access (owner/admin/member)
- [ ] Secret rotation flow (replace integration secrets safely)
- [ ] Rate limiting and abuse guardrails on public endpoints
- [ ] Usage and billing counters (runs, tokens, tool calls, workspace limits)
- [ ] Export/import workflow package endpoint (JSON schema with versioning)

## Remaining backend (medium priority)

- [ ] Revision compare endpoint (before vs after graph diff summary)
- [ ] Batch scheduler claiming with stronger lease renewal
- [ ] Webhook idempotency key support
- [x] Draft run simulation endpoint (no external calls, dry-run validation)
- [x] Connection test endpoint per provider
- [ ] Audit log table for sensitive actions (restore, delete, secret update)
- [ ] Advanced trigger types (email, cron presets, external event bus)

## Frontend to unlock premium experience

- [ ] Clean chat sidebar with reasoning timeline
- [x] Composer controls in Studio: Preview, Apply, Undo
- [x] Revisions panel with one-click restore and compare view
- [x] Live run monitor page with streamed logs/status
- [x] Live node timeline with duration and token estimates
- [x] Schedule builder UI (no API manual calls)
- [x] Human-readable node config forms (hide raw JSON by default)
- [x] Integrations setup UI with inline connection tests
- [x] Studio flow preview summary (human-readable simulation)
- [ ] Mobile-friendly responsive editor shell

## Production and reliability

- [ ] Add backend tests for scheduler, queueing, composer, validation, revisions, streaming
- [ ] Add migration runner process for deploy environments
- [ ] Add structured logging and correlation IDs across web + engine
- [ ] Add monitoring dashboards (error rate, run latency, queue depth)
- [ ] Add backup and restore procedure for workflow data
- [ ] Security pass: secret handling, endpoint auth, dependency audit

## Suggested execution order (practical)

- [x] Phase 1: queue-adjacent controls, run cancellation, streaming monitor
- [x] Phase 2: chat session storage, revisions, validation, simulation foundation
- [x] Phase 3: durable queue table, node metrics, worker endpoint, timeline groundwork
- [x] Phase 4: first premium Studio assistant controls and revision UX
- [x] Phase 5: human-friendly node forms replacing raw JSON as the main editing surface
- [ ] Phase 6: responsive polish and reasoning-first chat sidebar
- [ ] Phase 7: RBAC, billing, monitoring, security hardening

## Definition of "finalized platform" (what done means)

- [ ] Non-technical user can type a task and get a clear, editable flow
- [ ] User can run, monitor, pause, and retry without touching JSON
- [ ] User can schedule automations and trust reliability/recovery behavior
- [ ] User can view reasoning, history, and restore prior versions instantly
- [ ] Team can operate safely in production with metrics, alerts, and RBAC

