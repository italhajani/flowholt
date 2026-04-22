---
title: Implementation Roadmap
type: data
tags: [roadmap, phases, delivery, priorities]
sources: [plan-file-99, plan-file-00, plan-file-52]
updated: 2026-04-17
---

# Implementation Roadmap

What to build in what order. Based on dependency order, maturity priorities, and the competitive gap matrix (file 52).

---

## Phase 0 — Foundation (current)

**Goal:** Validate the core execution loop.

- [x] Working Studio (canvas editor)
- [x] Node execution engine
- [x] Basic workflow CRUD
- [x] JWT auth with workspace-level roles
- [x] Vault asset system (credentials)
- [x] OAuth2 support
- [x] Webhook infrastructure
- [x] Scheduler infrastructure
- [x] Basic dashboard pages

---

## Phase 1 — Runtime Maturity + Core Node Gaps

**Goal:** Production-ready execution, observability, and critical missing nodes.

- [ ] Error handlers (Rollback + Break + Ignore first, then Resume + Commit)
- [ ] Warning type taxonomy (ExecutionInterruptedWarning, OutOfSpaceWarning)
- [ ] Incomplete executions with auto-retry
- [ ] Dead-letter queue
- [ ] Runtime operations dashboard (queue, workers, failures)
- [ ] Consecutive error tracking → auto-deactivation
- [ ] Execution replay
- [ ] Webhook queue management with plan limits
- [ ] `{{ }}` expression engine with `$json`, `$input`, `$now`, `$vars` context
- [ ] Form Trigger node
- [ ] Error Trigger node (n8n pattern)
- [ ] Wait node (pause mid-execution)
- [ ] Execute Workflow node (sub-workflows)
- [ ] Aggregate + Split Out nodes
- [ ] `continue_with_error` On Error mode
- [ ] `/health/ready` endpoint

**Key concept pages:** [[wiki/concepts/execution-model]], [[wiki/concepts/error-handling]], [[wiki/concepts/runtime-operations]], [[wiki/concepts/webhook-trigger-system]], [[wiki/concepts/expression-language]]

---

## Phase 2 — Control Plane + Studio Polish

**Goal:** Multi-team organization management and Studio maturity.

- [ ] Org → Team → Workspace hierarchy
- [ ] 5 org roles + 5 team roles
- [ ] Settings inheritance chain (6 levels)
- [ ] Team credit management
- [ ] Workspace environment pipeline (draft/staging/production)
- [ ] Deployment approval flows
- [ ] Instant rollback
- [ ] Chat Trigger node
- [ ] Merge node (5 strategies: Append, Combine by field, Combine by position, Cross-product, SQL)
- [ ] Summarize + Compare Datasets nodes
- [ ] HTTP pagination (3 modes)
- [ ] Switch node Expression mode
- [ ] Edit locking (single editor at a time)
- [ ] Visual diff (green/orange/red node highlighting)
- [ ] Data pinning (save test output, reuse without re-execution)
- [ ] INPUT panel with drag-to-expression
- [ ] Prometheus metrics endpoint
- [ ] Log streaming (Syslog, webhook, Sentry)

**Key concept pages:** [[wiki/concepts/control-plane]], [[wiki/concepts/settings-catalog]], [[wiki/concepts/environment-deployment]], [[wiki/concepts/studio-anatomy]]

---

## Phase 3 — Capability System + AI + Advanced

**Goal:** Explicit permission model, managed AI agents, and advanced features.

- [ ] Capability objects (Workflow, Node, Execution, VaultAsset)
- [ ] Backend capability builders
- [ ] Frontend `can*` objects in API responses
- [ ] Denial response contracts
- [ ] Field sensitivity classes on node inspector
- [ ] Agent inventory page + managed agent entity
- [ ] Agent cluster nodes (root + sub-nodes with typed connector slots)
- [ ] Module tools (Workflow Tool, Code Tool, HTTP Tool)
- [ ] Knowledge/RAG system (file upload → chunk → embed → retrieve)
- [ ] MCP Client + MCP Server (bidirectional)
- [ ] Custom roles (Enterprise)
- [ ] SSO (SAML/OIDC/LDAP)
- [ ] S3 binary data storage
- [ ] Marketplace / community node system

**Key concept pages:** [[wiki/concepts/permissions-governance]], [[wiki/concepts/ai-agents]]

---

## Phase 4 — Analytics, Automation Map, and Polish

**Goal:** Enterprise-grade usage tracking and org-level visibility.

- [ ] Credit/operation tracking per run
- [ ] Analytics dashboard (7 surfaces)
- [ ] Audit log (full event taxonomy)
- [ ] Automation map (Phase 1: static graph; Phase 2: operational layers)
- [ ] Workflow sharing (public pages)
- [ ] Custom workflow properties (Enterprise)
- [ ] Template system
- [ ] Scenario recovery UX (auto-save + recovery dialog)

**Key concept pages:** [[wiki/concepts/observability-analytics]], [[wiki/concepts/automation-map]]

---

## Missing Specs (need creation before implementation)

All major specs have been created (files 00–58). Remaining gaps:

| Spec | Blocks Phase | Notes |
|------|-------------|-------|
| Git/source control integration | Phase 3+ | Low priority |

---

## Related Pages

- [[overview]] — master synthesis with design direction
- [[wiki/data/open-decisions]] — 27 decisions (24 resolved, 3 unresolved)
- [[wiki/sources/flowholt-plans]] — plan file 99 (session handoff with next steps)
- `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` — gap-driven phase priorities
