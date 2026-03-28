# Future Platform Checklist

This is the living checklist to reach the finalized premium FlowHolt platform.

## Current status snapshot

- Backend core progress: **about 99%**
- Frontend/UI progress: **about 99%**
- Production hardening progress: **about 96%**
- Agent/tool architecture groundwork: **about 98%**

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
- [x] Usage snapshot aggregation (runs, tokens, schedules, queued jobs)
- [x] Workspace usage limits foundation (`workspace_usage_limits` + enforcement helpers)
- [x] Audit trail foundation for sensitive workspace actions
- [x] Request rate-limit foundation for public/internal endpoints
- [x] Webhook idempotency receipt foundation

## Remaining backend (high priority)

- [x] Durable async run worker as a separate always-on process
- [x] Run cancellation endpoint and cooperative stop support in engine
- [x] Real-time run streaming (SSE/WebSocket for node-by-node updates)
- [x] Chat session storage for composer sidebar (threads/messages tables)
- [x] Node-level execution metrics (duration, token estimate, error class)
- [x] Multi-workspace membership and role-based access (owner/admin/member)
- [x] First billing-style counters and workspace limits (runs, tokens, seats, schedules, tool-call count)
- [x] Secret rotation flow (replace integration secrets safely)
- [x] Rate limiting and abuse guardrails on public endpoints
- [x] Billing subscriptions, plan switching, and draft invoice foundation
- [ ] Full billing engine (plan upgrades, invoices, payment hooks, usage overage rules)
- [x] Export/import workflow package endpoint (JSON schema with versioning)

## Remaining backend (medium priority)

- [x] Revision compare endpoint (before vs after graph diff summary)
- [x] Batch scheduler claiming with stronger lease renewal
- [x] Webhook idempotency key support
- [x] Draft run simulation endpoint (no external calls, dry-run validation)
- [x] Connection test endpoint per provider
- [x] Audit log table for sensitive actions (restore, delete, secret update)
- [x] External event bus trigger foundation
- [x] Remaining advanced trigger types (email intake)

## Agent/tool architecture stage

- [x] Shared tool capability registry for planner + Studio presets
- [x] Connection-aware tool runtime contracts (map presets to real providers cleanly)
- [x] Agent memory/tool permission model per workflow step
- [x] Tool result normalization contracts for planner, monitor, and chat sidebar groundwork
- [x] Multi-tool agent orchestration rules (single, read_then_write, fan_out, permission enforcement)
- [x] Tool marketplace/resources model with provider-specific kits and readiness states
- [x] Provider-specific tool packs beyond starter HTTP/Groq/webhook kits
- [x] Vendor-aware profile detection for resources and integrations
- [x] Resource-driven assistant composition hints from featured workflow packs
- [x] Pack-aware workflow generation rules for featured resource packs
- [x] Premium resources sidebar redesign using this marketplace model

## Before full UI redesign

- [x] Design-system token groundwork and in-app survey board
- [x] Pause for your design survey before visual redesign starts
- [x] Define final color system, spacing, typography, and editor shell rules
- [x] Redesign Studio layout to premium multi-panel editor inspired by modern workflow tools
- [ ] Finish redesigning runs, integrations, workflow library, and the remaining app surfaces into one consistent product system

## Frontend to unlock premium experience

- [x] Clean chat sidebar with reasoning timeline
- [x] Composer controls in Studio: Preview, Apply, Undo
- [x] Revisions panel with one-click restore and compare view
- [x] Workspace switcher with active workspace state
- [x] Live run monitor page with streamed logs/status`r`n- [x] Retry and rerun controls from runs UI and live run page
- [x] Live node timeline with duration and token estimates
- [x] Schedule builder UI (no API manual calls)
- [x] Schedule builder presets (interval, daily, weekdays)
- [x] Human-readable node config forms (hide raw JSON by default)
- [x] Integrations setup UI with inline connection tests
- [x] Studio flow preview summary (human-readable simulation)
- [x] Settings plan-and-usage card for workspace limits
- [x] Settings audit trail card for security events
- [x] Mobile-friendly responsive editor shell
- [x] Tool preset selector with capability/auth/output hints
- [x] Connection-aware tool guidance in Studio
- [x] Agent tool-access controls in Studio
- [x] Agent tool-strategy controls in Studio
- [x] Tool output contract hints in Studio
- [x] Studio resources panel with marketplace kits and readiness states
- [x] Studio resources panel with workflow-ready packs and richer resource guidance
- [x] Integrations page recommended packs card tied to Studio resources
- [x] Vendor quick-start guidance for integration setup
- [x] One-click assistant pack suggestions in Studio sidebar
- [x] Design survey board and shell token groundwork for the upcoming premium redesign
- [x] Resources sidebar quick actions that prefill or auto-preview pack-based workflow ideas

## Production and reliability

- [x] First backend unit tests for validation, simulation, revision compare, and correlation helpers
- [x] Add backend tests for scheduler, queueing, validation, revisions, and graph save normalization
- [x] Add backend tests for composer preview/apply flows and live streaming endpoints
- [x] Add migration runner process for deploy environments
- [x] Add structured logging and correlation IDs across web + engine
- [x] Add monitoring dashboards (error rate, run latency, queue depth)
- [x] Add backup and restore procedure for workflow data
- [x] Security pass: secret handling, endpoint auth, dependency audit foundation
- [x] Deploy hardening: response security headers + webhook auth review
- [x] Tool registry tests for planner-facing capability context
- [x] Connection/runtime contract tests for preset-based integrations
- [x] Agent tool-access normalization tests
- [x] Tool result contract normalization tests
- [x] Multi-tool orchestration planning tests
- [x] Tool marketplace/resource kit tests
- [x] Pack-aware workflow generator tests for featured resource packs

## Suggested execution order (practical)

- [x] Phase 1: queue-adjacent controls, run cancellation, streaming monitor
- [x] Phase 2: chat session storage, revisions, validation, simulation foundation
- [x] Phase 3: durable queue table, node metrics, worker endpoint, timeline groundwork
- [x] Phase 4: first premium Studio assistant controls and revision UX
- [x] Phase 5: human-friendly node forms replacing raw JSON as the main editing surface
- [x] Phase 6: responsive editor shell groundwork
- [x] Phase 7: billing hardening, responsive polish, and final pre-architecture cleanup
- [x] Phase 8: start agent/tool integration architecture groundwork
- [x] Phase 9: add connection-aware runtime contracts for preset-based tools
- [x] Phase 10: add agent tool-access groundwork for future orchestration
- [x] Phase 11: add normalized tool result contracts and agent tool-strategy groundwork
- [x] Phase 12: add real multi-tool orchestration behavior in the engine
- [x] Phase 13: add shared marketplace/resource kits for the future premium sidebar
- [x] Phase 14: add provider packs and workflow packs that bridge from connections to complete solution patterns
- [x] Phase 15: add vendor-aware resource detection so packs feel closer to real products, not only generic providers
- [x] Phase 16: turn featured resource packs into one-click assistant workflow suggestions
- [x] Phase 17: make the generator follow selected resource-pack patterns more intentionally
- [x] Phase 18: turn the resources panel into a cleaner premium pack launcher tied directly to the assistant
- [x] Phase 19: add upgrade-ready billing foundations with plans, subscriptions, and draft invoices

## Definition of "finalized platform" (what done means)

- [x] Non-technical user can type a task and get a clear, editable flow
- [ ] User can run, monitor, cancel, and retry without touching JSON
- [ ] User can schedule automations and trust reliability/recovery behavior
- [ ] User can view reasoning, history, and restore prior versions instantly
- [ ] Team can operate safely in production with metrics, alerts, RBAC, usage controls, audit history, abuse protection, and idempotent triggers
- [ ] Agent can understand available tools, choose the right tool shape, and explain that choice in a human-readable way

