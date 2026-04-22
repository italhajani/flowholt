---
title: Webhook and Trigger System
type: concept
tags: [webhooks, triggers, scheduling, polling, events]
sources: [plan-file-42, make-pdf]
updated: 2026-04-16
---

# Webhook and Trigger System

How workflows are activated. FlowHolt has 6 trigger types — more than [[wiki/entities/make]]'s 2 (polling + instant).

---

## 6 Trigger Types

| Type | Description | Make equivalent |
|------|-------------|----------------|
| **Manual** | User clicks Run from Studio | Manual trigger |
| **Webhook** | External HTTP POST to webhook URL | Instant trigger |
| **Schedule** | Cron-based recurring execution | Polling trigger (time-based) |
| **Chat** | Message from a conversational interface | — (FlowHolt-only) |
| **Event** | Internal FlowHolt platform event | — (FlowHolt-only) |
| **Polling** | Periodic check of external source for new data | Polling trigger |

---

## Webhook Infrastructure

| Parameter | Value |
|-----------|-------|
| Rate limit | 300 requests / 10 seconds |
| Queue max | 10,000 items |
| Queue formula | 667 items per 10,000 credits |
| Inactive expiry | 5 days (webhook auto-deactivates) |
| Processing modes | Parallel or sequential |

**Webhook → Dead-letter:** rejected webhooks (queue overflow, schema mismatch) go to dead-letter. See [[wiki/concepts/error-handling]].

---

## Auto-Retry of Incomplete Executions

Triggered by the **Break** error handler. Matches Make's exact schedule:
`1m → 10m → 10m → 30m → 30m → 30m → 3h → 3h` (8 attempts, 3 parallel retries max)

---

## Consecutive Error Tracking

FlowHolt tracks consecutive failures per workflow:
- Threshold exceeded → workflow auto-deactivated
- Webhook-triggered workflows: **instant** deactivation on first consecutive error
- Scheduled/polling: threshold-based (configurable)

User notification sent on deactivation.

---

## Related Pages

- [[wiki/concepts/execution-model]] — what happens after trigger fires
- [[wiki/concepts/runtime-operations]] — queue and worker management
- [[wiki/concepts/error-handling]] — Break handler initiates auto-retry
- [[wiki/concepts/observability-analytics]] — webhook event tracking and throughput metrics
- [[wiki/entities/make]] — webhook specs and rate limits (source values)
- [[wiki/sources/flowholt-plans]] — plan file 42
