---
title: Make vs FlowHolt Gap Analysis
type: analysis
tags: [gap, make, flowholt, comparison, domains]
sources: [plan-file-10, plan-file-48]
updated: 2026-04-16
---

# Make vs FlowHolt Gap Analysis

12-domain comparison between [[wiki/entities/make]] and [[wiki/entities/flowholt]]. Grounded in the Make help center corpus (324 pages) and PDF (~31K lines).

---

## Summary

FlowHolt has a working foundation. The gaps are real but well-mapped. Every gap has a design decision in the planning files.

| Domain | Make maturity | FlowHolt current | Gap size |
|--------|--------------|-----------------|---------|
| [[wiki/concepts/studio-anatomy]] | High | Medium | Medium |
| [[wiki/concepts/control-plane]] | High | Low | Large |
| [[wiki/concepts/execution-model]] | High | Medium | Medium |
| [[wiki/concepts/error-handling]] | High | Low | Large |
| [[wiki/concepts/webhook-trigger-system]] | High | Medium | Medium |
| [[wiki/concepts/environment-deployment]] | Low | Designed | FlowHolt LEADS |
| [[wiki/concepts/ai-agents]] | Medium | Low | Large |
| [[wiki/concepts/data-store-functions]] | High | Low | Large |
| [[wiki/concepts/connections-integrations]] | High | Medium | Medium |
| [[wiki/concepts/observability-analytics]] | High | Low | Large |
| [[wiki/concepts/settings-catalog]] | High | Low | Large |
| [[wiki/concepts/runtime-operations]] | Medium | Low | Large |

---

## Where FlowHolt Leads (see [[wiki/analyses/flowholt-advantages]])

1. Environment pipeline (draft/staging/production)
2. Deployment approval flows
3. Workflow versioning and comparison
4. Human tasks / pause-inbox
5. Typed execution artifacts
6. Capability system
7. Circuit breakers

---

## Remaining Gaps NOT Yet Designed

From plan file 48:

| Gap | Status |
|-----|--------|
| If-else node (explicit, like n8n) | Partially designed in file 33 |
| Merge/converge node | Open decision #20 |
| Warning taxonomy | Partially in file 44 |
| Data type system + coercion | Partially in file 45 |
| Custom workflow properties | Open decision #22 |
| Canvas annotations / notes | Open decision #23 |
| Scenario recovery UX | Partially in file 43 |
| Sharing / public workflow pages | Partially in file 40 |
| Developer mode (in-app) | Not yet designed |
| n8n patterns (sub-workflows, expressions) | NOT YET STARTED |
| Testing / QA spec | NOT YET STARTED |
| Notifications spec | NOT YET STARTED |
| Billing / plan management spec | NOT YET STARTED |

---

## Related Pages

- [[wiki/entities/make]] — Make entity profile
- [[wiki/entities/flowholt]] — FlowHolt entity profile
- [[wiki/analyses/flowholt-advantages]] — where FlowHolt exceeds Make
- [[wiki/data/open-decisions]] — 25 unresolved decisions
- [[wiki/sources/flowholt-plans]] — plan files 10, 48
