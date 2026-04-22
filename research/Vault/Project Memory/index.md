# Index

Page catalog for the FlowHolt Knowledge Vault. Updated on every ingest.
Read this after `CLAUDE.md` to orient before answering any query.

---

## Meta

| Page | Type | Description |
|------|------|-------------|
| [[CLAUDE]] | schema | Vault constitution — how this vault works, raw sources, current project state |
| [[overview]] | synthesis | Master FlowHolt synthesis — what we're building and why |
| [[log]] | log | Chronological record of ingests, queries, and lint passes |
| `IMPLEMENTATION-MASTER.md` | tracker | **Master implementation checklist** — read first for building sessions (`research/flowholt-ultimate-plan/IMPLEMENTATION-MASTER.md`) |

---

## Entities

| Page | Type | Description |
|------|------|-------------|
| [[wiki/entities/flowholt]] | entity | FlowHolt — the product being built, current state, design direction |
| [[wiki/entities/make]] | entity | Make.com — primary competitor, pattern source for control plane and runtime |
| [[wiki/entities/n8n]] | entity | n8n — secondary competitor, pattern source for logic and AI-agent orchestration |

---

## Concepts

| Page | Type | Description |
|------|------|-------------|
| [[wiki/concepts/information-architecture]] | concept | Navigation surfaces, page inventory, sidebar evolution |
| [[wiki/concepts/control-plane]] | concept | Org → Team → Workspace hierarchy, roles (5+5), session token |
| [[wiki/concepts/studio-anatomy]] | concept | Canvas, inspector, panels, tabs, node families, release actions |
| [[wiki/concepts/ai-agents]] | concept | Dual nature (managed entity + studio node), RAG/knowledge, tool types |
| [[wiki/concepts/settings-catalog]] | concept | 6 scope levels, inheritance chain, weakening prevention |
| [[wiki/concepts/permissions-governance]] | concept | Capability objects, denial contracts, role-by-surface enforcement, n8n scope reference |
| [[wiki/concepts/backend-architecture]] | concept | 13 domain modules, migration from monolithic main.py |
| [[wiki/concepts/runtime-operations]] | concept | Queue, workers, dead-letter, alerts, dashboard |
| [[wiki/concepts/observability-analytics]] | concept | Credit model, 7 consumption surfaces, analytics dashboard |
| [[wiki/concepts/webhook-trigger-system]] | concept | 6 trigger types, queue limits, auto-retry, deactivation |
| [[wiki/concepts/environment-deployment]] | concept | Draft→staging→production pipeline, approval flows, rollback, version diff UX |
| [[wiki/concepts/error-handling]] | concept | 5 handlers, 17 error types, step-level retry, circuit breakers, n8n error workflow |
| [[wiki/concepts/data-store-functions]] | concept | Key-value stores (ACID), data structures, custom JS functions, variables |
| [[wiki/concepts/connections-integrations]] | concept | Vault model, OAuth2, credential requests, dynamic connections |
| [[wiki/concepts/automation-map]] | concept | Org-level dependency map, 4 layers, entity relationships |
| [[wiki/concepts/execution-model]] | concept | Initialization→Cycles→Finalization, ACID, step states, branch execution order, node controls |
| [[wiki/concepts/sub-workflows]] | concept | Sub-workflow pattern, typed I/O, caller whitelist, conversion UX (from n8n) |
| [[wiki/concepts/expression-language]] | concept | `{{ }}` expressions, data model (item-array), data mapping UI, Luxon, JMESPath, variables |
| [[wiki/concepts/design-system]] | concept | Visual tokens, color palette, component patterns, layout architecture, node family visuals |

---

## Analyses

| Page | Type | Description |
|------|------|-------------|
| [[wiki/analyses/make-vs-flowholt-gap]] | analysis | 12-domain gap matrix between Make and FlowHolt |
| [[wiki/analyses/flowholt-advantages]] | analysis | Where FlowHolt intentionally exceeds Make (deployment, versioning, AI, environments) |
| [[wiki/analyses/open-decisions]] | analysis | 25 unresolved planning decisions requiring product choices |
| [[wiki/analyses/n8n-research-findings]] | analysis | Key n8n source code and UI findings relevant to FlowHolt |
| [[wiki/analyses/make-ui-evidence]] | analysis | Make UI visual evidence notes from crawl and screenshots |

---

## Sources

| Page | Type | Description |
|------|------|-------------|
| [[wiki/sources/make-help-center]] | source | Summary of Make.com help center (324 pages, fully absorbed) |
| [[wiki/sources/make-pdf]] | source | Summary of Make.com documentation PDF (~31K lines, fully absorbed) |
| [[wiki/sources/make-advanced-ui]] | source | Make.com UI crawl data — network log, transitions, element catalog |
| [[wiki/sources/n8n-docs]] | source | Summary of n8n documentation (1499 pages, scrape complete, deep integration pending) |
| [[wiki/sources/flowholt-plans]] | source | The 59 planning files in research/flowholt-ultimate-plan/ |
| [[wiki/sources/make-domain-index]] | source | Make corpus indexed by 15 planning domains |
| [[wiki/sources/n8n-domain-index]] | source | n8n docs indexed by 11 planning domains |

---

## Data

| Page | Type | Description |
|------|------|-------------|
| [[wiki/data/open-decisions]] | data | All 27 open planning decisions with context |
| [[wiki/data/node-type-inventory]] | data | All node families, types, field sensitivity classes |
| [[wiki/data/implementation-roadmap]] | data | Phased delivery order, what to build first |
