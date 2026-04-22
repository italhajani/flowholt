---
title: FlowHolt — Master Overview
type: synthesis
tags: [flowholt, overview, vision, direction]
updated: 2026-04-17
---

# FlowHolt — Master Overview

The single top-level synthesis of what FlowHolt is, what it's trying to become, and the non-negotiable design principles behind every decision.

---

## What FlowHolt Is

FlowHolt is an automation workflow platform — a product that lets users build, deploy, and monitor automated workflows connecting applications, APIs, data, and AI agents. It competes directly with [[wiki/entities/make]] and [[wiki/entities/n8n]].

**Current state (2026-04-16):** A working Studio (canvas-based workflow editor) with a FastAPI backend, React frontend, and live deployment. The foundation is credible. The gap to Make/n8n maturity is large but well-mapped.

**Target state:** A platform where:
- Workflows are not the whole product — agents, environments, teams, and runtime operations all have explicit, mature surfaces
- AI agents exist both as managed product objects (inventory, versioned, tested) and as runtime authoring components inside the Studio
- The control plane rivals Make's org/team/workspace model, not a flat single-workspace system
- Runtime operations (queue, workers, dead-letter, alerts) are first-class product surfaces
- The deployment pipeline exceeds Make's capabilities: draft → staging → production with formal approval flows, instant rollback, and execution replay

---

## Design Direction

> **Make gives us maturity patterns.** Control plane depth, settings hierarchy, collaboration model, runtime observability, and structured AI-agent management all follow Make's battle-tested patterns.

> **n8n influences FlowHolt's logic and AI-agent orchestration.** Sub-workflow design, expression language richness (`{{ }}` syntax + full JS), node ecosystem diversity, cluster node architecture, and agent-orchestration flexibility all draw from n8n. **n8n research COMPLETE as of 2026-04-16.** See files 49-52.

> **FlowHolt must not copy either.** It merges mature control-plane design (Make-inspired) with strong automation and agent logic (n8n-inspired) into something that exceeds both.

---

## What Has Been Designed (Research Complete)

The [[wiki/sources/flowholt-plans]] contains 59 implementation-grade planning files. These cover:

| Domain | Plan Files | Status |
|--------|-----------|--------|
| [[wiki/concepts/information-architecture]] | 01, 03, 40 | Complete |
| [[wiki/concepts/control-plane]] | 04, 36 | Complete |
| [[wiki/concepts/studio-anatomy]] | 07, 11, 15, 23, 26, 27, 30, 33 | Complete |
| [[wiki/concepts/ai-agents]] | 05, 37 | Complete |
| [[wiki/concepts/settings-catalog]] | 06, 38 | Complete |
| [[wiki/concepts/permissions-governance]] | 08, 12, 18, 24, 28, 31, 34, 35 | Complete |
| [[wiki/concepts/backend-architecture]] | 09, 13, 17, 39 | Complete |
| [[wiki/concepts/runtime-operations]] | 19, 22, 25, 29, 32 | Complete |
| [[wiki/concepts/observability-analytics]] | 41 | Complete |
| [[wiki/concepts/webhook-trigger-system]] | 42 | Complete |
| [[wiki/concepts/environment-deployment]] | 43 | Complete |
| [[wiki/concepts/error-handling]] | 44 | Complete |
| [[wiki/concepts/data-store-functions]] | 45 | Complete |
| [[wiki/concepts/connections-integrations]] | 46 | Complete |
| [[wiki/concepts/automation-map]] | 47 | Complete |
| [[wiki/analyses/make-vs-flowholt-gap]] | 10, 48 | Complete |
| [[wiki/concepts/expression-language]] | 50, 53 | Complete |
| [[wiki/concepts/sub-workflows]] | 51 | Complete |
| n8n integration synthesis | 49 | Complete |
| Competitive gap matrix | 52 | Complete |
| Notification and alerting | 54 | Complete |
| Form system | 55 | Complete |
| Testing and QA | 56 | Complete |
| Billing and plan management | 57 | Complete |
| Template system and marketplace | 58 | Complete |
| [[wiki/concepts/design-system]] | 59 | Complete |

---

## What Has NOT Been Designed Yet

| Gap | Priority |
|-----|----------|
| Git/source control integration spec | Low (Phase 3+) |
| Marketplace / community nodes spec (partially in file 58) | Low (Phase 3+) |
| 3 open planning decisions (business) | See [[wiki/data/open-decisions]] |

---

## FlowHolt's Intentional Advantages Over Make

See [[wiki/analyses/flowholt-advantages]] for full detail. Key differentiators:

1. **Environment separation** — draft/staging/production with scoped connections. Make has only version history.
2. **Deployment approval flows** — formal review with role-based gates. Make has none.
3. **Workflow versioning** — compare, replay, rollback across versions. Make saves 60-day manual copies.
4. **Human tasks** — pause-producing nodes with inbox/resume flows. Make has no equivalent.
5. **Typed execution artifacts** — structured output contracts. Make has unstructured bundles.
6. **Capability system** — frontend `can*` objects + backend capability builders. Make has implicit hard-coded gates.
7. **Circuit breakers** — per-integration, per-workspace state machine. Make has no equivalent.

---

## Non-Negotiable Design Principles

These must not be violated by any implementation decision:

- The editor is not the whole product
- Workflows, agents, assets, environments, teams, and runtime operations all need explicit places
- User / org / team / workspace / environment settings must stay separate scope levels
- AI agents must exist both as managed product objects AND as runtime authoring components
- Shared assets (credentials, connections, variables, webhooks, data stores) must have explicit ownership and scope
- Permissions must separate: editing, operating, scheduling, observing, and publishing
- Security-sensitive settings set at org level cannot be weakened downstream

---

## Key Numbers to Remember

| Metric | Value | Source |
|--------|-------|--------|
| Max execution duration | 40 minutes | Make PDF |
| Max data per step | 5 MB | Make PDF |
| Max objects per search module | 3200 | Make PDF |
| Webhook rate limit | 300 req/10s | Make PDF |
| Webhook queue max | 10,000 items | Make PDF |
| Auto-retry attempts | 8 (exponential: 1m→10m→10m→30m→30m→30m→3h→3h) | Make PDF |
| Error handler types | 5 (Ignore/Resume/Commit/Rollback/Break) | Make PDF |
| FlowHolt error types total | 17 (11 Make + 6 FlowHolt) | Plan file 44 |
| Org roles | 5 (owner/admin/member/billing/guest) | Plan file 36 |
| Team roles | 5 (admin/builder/operator/monitor/guest) | Plan file 36 |
| Backend domains (target) | 13 modules from monolithic main.py | Plan file 39 |
| Current frontend routes | 22 | Plan file 40 |
| Planned new pages | 19 | Plan file 40 |
| Open planning decisions | 27 (24 resolved, 3 unresolved) | Files 37, 47, 48 |

---

## Related Pages

- [[CLAUDE]] — vault schema and operating rules
- [[index]] — full page catalog
- [[wiki/entities/flowholt]] — FlowHolt product entity
- [[wiki/entities/make]] — Make.com competitor profile
- [[wiki/entities/n8n]] — n8n competitor profile
- [[wiki/analyses/make-vs-flowholt-gap]] — gap analysis
- [[wiki/data/open-decisions]] — 25 unresolved decisions
