---
title: Observability and Analytics
type: concept
tags: [observability, analytics, credits, operations, audit-log, metrics]
sources: [plan-file-41, make-help-center]
updated: 2026-04-16
---

# Observability and Analytics

How FlowHolt tracks usage, surfaces operational data, and provides the analytics surfaces that enterprise customers need.

---

## Credit / Operation Model

Follows [[wiki/entities/make]]'s model:
- 1 operation = 1 credit (standard nodes)
- AI nodes: dynamic credits based on token consumption
- Make Code: 2 credits/second

---

## 7 Consumption Tracking Surfaces

| Surface | What it shows |
|---------|--------------|
| Workflow detail | Operations used per run |
| Execution history | Per-run credit cost |
| Workspace dashboard | Total operations this period |
| Team credit management | Credits allocated vs. used |
| Analytics dashboard | Operations by workflow, by team, over time |
| Alerts | Threshold notifications (75/90/100%) |
| Audit log | Event-by-event record |

---

## Analytics Dashboard (Make-aligned)

| Metric | Breakdown |
|--------|----------|
| Total operations | By time period |
| Operations by team | Per-team bar chart |
| Operations by workflow | Top workflows by usage |
| Error rate | Errors / total runs |
| Execution count | Runs over time |
| Time filter | Last 24h / 7d / 30d / custom |

---

## Team Credit Management (Teams/Enterprise)

- Credit allocation per team (admin sets)
- Threshold notifications: 75% → warning, 90% → alert, 100% → pause workflows
- Manual top-up by admin
- Credit usage history

---

## Audit Log Event Taxonomy

Key event families:
- `workflow.*` — created, edited, published, deleted, rolled_back
- `execution.*` — started, completed, failed, replayed
- `vault.*` — credential_created, credential_rotated, connection_used
- `team.*` — member_added, role_changed, credit_allocated
- `agent.*` — created, invoked, knowledge_updated
- `auth.*` — login, logout, 2fa_enrolled, token_revoked

---

## Related Pages

- [[wiki/concepts/execution-model]] — what generates operation counts
- [[wiki/concepts/runtime-operations]] — system health metrics
- [[wiki/concepts/error-handling]] — error rate breakdowns and consecutive error tracking
- [[wiki/concepts/control-plane]] — team credit management
- [[wiki/entities/make]] — source of analytics dashboard structure
- [[wiki/entities/n8n]] — insights + log streaming patterns
- [[wiki/sources/flowholt-plans]] — plan file 41

---

## n8n Insights and Monitoring (Domain 9 Deep Read)

> Research complete 2026-04-16. Key findings for FlowHolt's observability design.

### n8n Insights System

- Tracks only **production executions** (not manual, not sub-workflow)
- Metrics: total executions, failed executions, failure rate, average run time, time saved
- **Time saved calculation**: Fixed (one value per execution) OR Dynamic (sum of "Time Saved" node values, optionally × item count)
- Dashboard data ranges by plan: all plans = 7d; Pro = 14d; Business = 30d; Enterprise = 1 year

**FlowHolt signal:** The Overview dashboard's "time saved" metric is a key ROI selling point. Design both fixed and dynamic calculation modes. Only count production executions in analytics.

### n8n Log Streaming (Enterprise feature)

Routes 45+ event types to external destinations:
- **Destination types:** Syslog, generic webhook, Sentry
- **Event families tracked:** workflow lifecycle, node execution, audit actions, worker lifecycle, AI node ops, queue job lifecycle
- **Per-destination filtering:** choose which event types go where

### Health Endpoints

| Endpoint | Returns | Use for |
|----------|---------|---------|
| `/healthz` | 200 if instance reachable | Basic liveness |
| `/healthz/readiness` | 200 if DB connected + migrated | Kubernetes readiness probe |
| `/metrics` | Prometheus format | Infrastructure monitoring |

**FlowHolt action:** Ensure `/health/ready` endpoint checks DB connectivity + migration state, not just process liveness. Add `/metrics` Prometheus endpoint.

### Logging Configuration

- Log levels: silent, error, warn, info (default), debug
- Output: console and/or rotating file (16MB per file, 100 files max by default)
- Structured logging with execution/workflow metadata in all log lines

### Community Nodes Security (Domain 10)

Community nodes (n8n's npm plugin system) have full system access — filesystem, network, env vars. Key security implications for FlowHolt:

**If FlowHolt adds a plugin/community node system:**
- Default to allowlisting (disable community nodes unless explicitly enabled per environment)
- Verified nodes only in production (n8n vets for security, no runtime dependencies)
- Code execution isolation (task runner sidecar) applies to plugin-installed nodes too
- Supply chain risk: npm package compromise → malicious code execution
- Maintain an internal blocklist; provide a reporting mechanism

**n8n's verification requirement (from May 2026):** GitHub Actions publishing with npm provenance statement — ensures package was built from the stated source code.
