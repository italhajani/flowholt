# CLAUDE.md — FlowHolt Knowledge Vault Schema

This is the operating constitution for the FlowHolt knowledge vault.
Every Claude session MUST read this file first before doing anything else.

---

## What This Vault Is

This is an LLM-maintained knowledge wiki for the FlowHolt project — an automation workflow platform being built to compete with Make.com and n8n. The vault follows the Karpathy LLM Wiki pattern: Claude maintains all wiki content, the user directs sourcing and questions.

**The vault is Claude's persistent memory.** It replaces the need to re-explain context across sessions. When you read this vault at the start of a session, you know everything.

---

## How to Orient in a New Session

### For IMPLEMENTATION sessions (building features):
1. Read `research/_INDEX.md` — central navigation map (start here)
2. Read `research/planning/IMPLEMENTATION-MASTER.md` — the master checklist
3. Go to its §CURRENT SPRINT — see what to build next
4. Read the linked spec file(s) for that sprint (in `research/flowholt-specs/`)
5. Read the target source files before making changes
6. Build. Check off tasks when done.

### For RESEARCH / PLANNING sessions (extending the knowledge base):
1. Read `CLAUDE.md` (this file) — understand the system
2. Read `index.md` — scan the full page catalog to know what exists
3. Read `overview.md` — absorb the master FlowHolt synthesis
4. Read `log.md` (last 10 entries) — understand what was done recently
5. You are now oriented. Answer the user's first question or begin the task.

Do NOT read all wiki pages or spec files at session start. Use `index.md` or the IMPLEMENTATION-MASTER navigation index to find relevant pages on demand.

---

## Vault Structure

```
research/Vault/Project Memory/        ← Obsidian vault root (you are here)
├── CLAUDE.md                         ← This file. Read first.
├── index.md                          ← Full page catalog. Read second.
├── log.md                            ← Chronological ingest/query log.
├── overview.md                       ← Master synthesis. Read third.
│
└── wiki/
    ├── analyses/     ← Comparisons, gap matrices, decisions, trade-offs
    ├── concepts/     ← Core product concepts (execution model, Studio, permissions, etc.)
    ├── entities/     ← Platform entities (FlowHolt, Make, n8n)
    ├── sources/      ← Per-source summary pages (what each raw source contains)
    └── data/         ← Tables, matrices, catalogs, open decisions
```

---

## Raw Sources (Do Not Modify)

These are immutable source documents. Claude reads from them; never writes to them.

| Source | Location | Size | Status |
|--------|----------|------|--------|
| Make.com help center | `research/competitor-data/make/pages_markdown/` | 324 pages | Complete |
| Make.com UI crawl | `research/competitor-data/make-ui/` | JSON + screenshots | Complete |
| Make.com PDF (full) | `research/competitor-data/make-pdf-full.txt` | ~31K lines | Complete |
| Make.com PDF (extracted) | `research/competitor-data/make-pdf-extracted.txt` | 8KB key extracts | Complete |
| Make.com domain index | `research/competitor-data/make-domain-index.md` | Route/domain map | Complete |
| n8n documentation | `research/competitor-data/n8n/pages_markdown/` | 1499 pages | Complete |
| n8n UI element catalog | `research/flowholt-specs/42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` | Full catalog | Complete |
| n8n source code research | `research/flowholt-specs/41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` | Full findings | Complete |
| FlowHolt planning specs | `research/flowholt-specs/` | 00–67 spec files | Complete |
| FlowHolt source code | `src/` + `backend/` | Full codebase | Live (check git) |

---

## Operations

### Ingest (adding a new source)
1. Read the source
2. Discuss key takeaways if user wants to
3. Write a summary page in `wiki/sources/`
4. Update `index.md` with the new page
5. Update any entity or concept pages that this source touches
6. Add entry to `log.md`: `## [YYYY-MM-DD] ingest | Source Title`

### Query (answering a question)
1. Read `index.md` to find relevant pages
2. Read those pages + follow [[wikilinks]] to related pages
3. Synthesize the answer
4. If the answer is valuable, write it back as a new wiki page in `wiki/analyses/` or `wiki/data/`
5. Add entry to `log.md`: `## [YYYY-MM-DD] query | Question summary`

### Lint (health-checking the vault)
Ask Claude to periodically check for:
- Contradictions between pages
- Stale claims superseded by newer sources
- Orphan pages with no inbound links
- Important concepts mentioned but lacking their own page
- Missing cross-references
- Log: `## [YYYY-MM-DD] lint | Summary of issues found/fixed`

---

## Link Conventions

- Use `[[page-name]]` Obsidian wikilinks for all internal references
- Use `[[page-name|display text]]` when the display text should differ
- Every wiki page should have at least 2 outbound wikilinks
- Entity pages link to every concept page that involves them
- Concept pages link back to their entity pages and source pages

---

## Frontmatter Convention

Every wiki page should have:
```yaml
---
title: Page Title
type: concept | entity | analysis | source | data
tags: [flowholt, make, n8n, studio, permissions, ...]
sources: [plan-file-XX, make-help-center, n8n-docs, ...]
updated: YYYY-MM-DD
---
```

---

## Naming Conventions

| Folder | File naming | Example |
|--------|------------|---------|
| `wiki/concepts/` | kebab-case noun phrase | `execution-model.md` |
| `wiki/entities/` | single noun | `make.md`, `n8n.md`, `flowholt.md` |
| `wiki/analyses/` | verb-noun phrase | `make-vs-flowholt-gap.md` |
| `wiki/sources/` | source-name | `make-help-center.md` |
| `wiki/data/` | noun catalog | `open-decisions.md` |

---

## Current Project State (as of 2026-04-17)

### Research phases complete
- **Make.com corpus** — fully absorbed. All 324 help center pages + full PDF read. 52 planning files drafted covering every major product domain.
- **n8n research** — 1499 documentation pages scraped. All 10 priority domains deep-read and integrated into vault. **COMPLETE as of 2026-04-16.**
- **FlowHolt codebase** — Studio, backend, routes, node registry all read and cross-referenced in planning files. Working tree contains 25K+ lines of uncommitted features (see git diff HEAD).

### What has been designed (files 01–58) + n8n vault additions
1. Information architecture and navigation
2. Control plane (org → team → workspace hierarchy, 5+5 roles)
3. Studio surface (canvas, inspector, panels, tabs, node families)
4. AI agents (dual nature + [[wiki/concepts/ai-agents]]: cluster nodes, Tools Agent, memory/tool/RAG, HITL per-tool, MCP)
5. Settings catalog (6 scope levels, inheritance chain)
6. Permissions and governance (capability objects, denial contracts)
7. Backend architecture ([[wiki/concepts/backend-architecture]]: 13 domain modules + n8n scaling topology)
8. Runtime operations (queue, workers, dead-letter, alerts)
9. Observability and analytics ([[wiki/concepts/observability-analytics]]: credit model, insights, log streaming)
10. Webhooks and triggers (6 trigger types, queue limits)
11. Environment and deployment (draft→staging→production, approval flows, auto-save recovery)
12. Error handling and resilience (5 handlers, 17 error types, warning taxonomy, circuit breakers)
13. Data stores and custom functions (ACID, 8 module types, ES6 functions, type coercion)
14. Connections and integrations (vault model, OAuth2, credential requests)
15. Automation map (org-level dependency map, 4 layers)
16. Frontend routes (22 current + 19+ planned pages, workflow sharing, org properties)
17. Expression language ([[wiki/concepts/expression-language]]: `{{ }}` syntax, data model, drag-to-expression UI)
18. Node type inventory ([[wiki/data/node-type-inventory]]: 40+ node types with FlowHolt status + gaps)
19. Sub-workflows ([[wiki/concepts/sub-workflows]]: typed I/O, caller whitelist, conversion UX)
20. n8n integration synthesis (50+ design decisions across 10 domains → file 49)
21. Competitive gap matrix (Make + n8n dual gap analysis → file 52)
22. Expression engine implementation (sandbox architecture, 191+ methods, security model → file 53)
23. Notification and alerting (100+ event taxonomy, log streaming, audit log → file 54)
24. Form system (Form Trigger, mid-flow forms, multi-step wizard → file 55)
25. Testing and QA (data pinning, evaluation framework, metric scoring → file 56)
26. Billing and plan management (credit system, 5 plan tiers, team allocation → file 57)
27. Template system and marketplace (templates, wizard, community nodes → file 58)
28. UI design system ([[wiki/concepts/design-system]]: color tokens, component patterns, layout architecture, node visuals → file 59)

### What is NOT yet designed
- Git/source control integration specification
- Marketplace / community nodes specification (partially covered in file 58 §10)
- 3 unresolved planning decisions (business/pricing — see `wiki/data/open-decisions.md`)

### Design direction
> Make gives maturity patterns for control plane, settings, collaboration, and runtime.
> n8n influences FlowHolt's logic style, expression language, AI-agent orchestration, and node ecosystem. **Research COMPLETE.**
> FlowHolt must NOT copy Make or n8n directly — it merges mature control-plane design with strong automation and agent logic.

### Non-negotiable principles
- The editor is not the whole product
- Workflows, agents, assets, environments, teams, runtime operations must all have explicit places
- AI agents exist both as managed product objects AND as runtime authoring components
- Permissions must separate editing, operating, scheduling, observing, and publishing

---

## What Claude Should Never Do in This Vault

- Modify files in `research/make-help-center-export/`, `research/n8n-docs-export/`, `research/make-advanced/`, or any raw text files
- Overwrite the planning direction with a fresh shallow summary
- Treat the 48 plan files as redundant — they are the authoritative research layer
- Restart the plan from scratch — always extend what exists
- Lose the 25 open planning decisions (tracked in `wiki/data/open-decisions.md`)
