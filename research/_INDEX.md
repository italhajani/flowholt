# FlowHolt Research — Central Navigation Index

> This file is the **entry point for any AI reading this repository**.
> Read this first. It maps every folder and key file in this research workspace.

---

## Quick-Start for AI (Claude / Copilot)

1. **Where are we in implementation?** → `planning/IMPLEMENTATION-MASTER.md`
2. **What's the product vision / roadmap?** → `planning/ROADMAP.md`
3. **What was done last session?** → `planning/SESSION-LOG.md` + `planning/SESSION-CHECKPOINT.md`
4. **What's the full platform spec?** → `flowholt-specs/` (68 numbered files, 00–67)
5. **Competitor reference (n8n / Make)?** → `competitor-data/`
6. **Deep knowledge base (concepts, entities)?** → `Vault/Project Memory/`

---

## Folder Map

```
research/
  _INDEX.md                   ← YOU ARE HERE
  planning/                   ← Active AI-readable session & planning files
  flowholt-specs/             ← Full platform design specifications (00–67)
  competitor-data/            ← Raw competitor data (Make.com + n8n)
  Vault/                      ← Obsidian knowledge base (concepts, entities, wiki)
  assets/                     ← Logo and static assets
```

---

## `planning/` — Active Session Files

| File | Purpose |
|------|---------|
| `IMPLEMENTATION-MASTER.md` | **Master implementation tracker** — phases, tasks, completion status |
| `ROADMAP.md` | Product roadmap — what's built, what's next, future phases |
| `SESSION-LOG.md` | Running log of all sessions — what was done each sprint |
| `SESSION-CHECKPOINT.md` | Latest session checkpoint for cross-session continuity |
| `PLATFORM_GUIDE.md` | Quick-reference platform guide — stack, ports, commands |
| `98-NEXT-SESSION-PROMPT.md` | Prompt for starting a new session (continuity instructions) |
| `99-SESSION-HANDOFF.md` | Handoff notes between sessions |

---

## `flowholt-specs/` — Design Specification Files (95 files)

These are the deep design documents synthesized from competitor research.
Numbered 00–94 for ordered reading. Key files:

| # | File | Content |
|---|------|---------|
| 00 | `00-MAKE-SYNTHESIS-WORKFLOW.md` | Make.com synthesis approach |
| 01 | `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` | Overall plan structure |
| 07 | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | Studio surface (canvas, inspector, panels) |
| 11 | `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | Studio UI anatomy |
| 39 | `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Backend module plan |
| 40 | `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | All frontend routes |
| 49 | `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | n8n integration synthesis |
| 50 | `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | Expression language + FlowItem data model |
| 52 | `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Gap analysis vs Make/n8n |
| 59 | `59-FLOWHOLT-UI-DESIGN-SYSTEM-AND-LAYOUT-SPEC.md` | Design system spec |
| 60 | `60-FLOWHOLT-UI-REDESIGN-MASTERPLAN.md` | UI redesign master plan |
| 63 | `63-FLOWHOLT-STUDIO-REDESIGN-FROM-SCRATCH.md` | Studio redesign spec |
| 67 | `67-FLOWHOLT-PAGE-BY-PAGE-REDESIGN-INVENTORY-AND-ROLLOUT.md` | Page-by-page redesign |
| **68** | **`68-FLOWHOLT-MAKE-API-COMPLETE-MODEL.md`** | **⭐ Make API entities → FlowHolt design decisions** |
| **69** | **`69-FLOWHOLT-UI-ELEMENT-COMPLETE-INVENTORY.md`** | **⭐ Every UI element across every surface** |
| **70** | **`70-FLOWHOLT-FREE-TIER-EXECUTION-ARCHITECTURE.md`** | **⭐ $0/month execution architecture** |
| **71** | **`71-FLOWHOLT-MCP-SERVER-INTEGRATION-SPEC.md`** | **⭐ MCP server (workflows as tools) + MCP client node** |
| **72** | **`72-FLOWHOLT-CUSTOM-NODE-BUILDER-SPEC.md`** | **⭐ Custom node builder (Make SDK adaptation)** |
| **73** | **`73-FLOWHOLT-ENTERPRISE-AND-WHITE-LABEL-SPEC.md`** | **⭐ Enterprise: SSO, 2FA, audit logs, branding** |
| **74** | **`74-FLOWHOLT-DASHBOARD-PAGES-DEEP-SPEC.md`** | **⭐ Every dashboard page — every element pre-planned** |
| **75** | **`75-FLOWHOLT-STUDIO-COMPLETE-SPEC.md`** | **⭐ Studio complete: top bar, canvas, panels, shortcuts** |
| **76** | **`76-FLOWHOLT-NODE-INSPECTOR-DEEP-SPEC.md`** | **⭐ Node inspector: all field types, all nodes' params** |
| **77** | **`77-FLOWHOLT-CONNECTIONS-CREDENTIALS-SPEC.md`** | **⭐ Credentials: encryption, OAuth, sharing, types** |
| **78** | **`78-FLOWHOLT-EXPRESSION-ENGINE-COMPLETE-SPEC.md`** | **⭐ Expression engine: syntax, evaluator, UI, sandbox** |
| **79** | **`79-FLOWHOLT-EXPRESSION-LANGUAGE-DEEP-SPEC.md`** | **⭐⭐ Complete expression language: all vars, string/array methods, JMESPath, Python Code node** |
| **80** | **`80-FLOWHOLT-FLOW-LOGIC-PATTERNS-DEEP-SPEC.md`** | **⭐⭐ Flow logic: error handling, looping, merging, subworkflows, publishing, settings** |
| **81** | **`81-FLOWHOLT-AI-LANGCHAIN-ARCHITECTURE-SPEC.md`** | **⭐⭐ AI architecture: all LangChain nodes, RAG, HITL, MCP tools (18+), cluster nodes** |
| **82** | **`82-FLOWHOLT-NODE-BUILDER-ARCHITECTURE-SPEC.md`** | **⭐⭐ Node builder: all 14 UI element types, UX standards, credentials, versioning** |
| **83** | **`83-FLOWHOLT-WORKFLOW-MANAGEMENT-SPEC.md`** | **⭐⭐ Workflow lifecycle: publishing, version history, settings, collaboration, templates** |
| **84** | **`84-FLOWHOLT-USER-MANAGEMENT-RBAC-SSO-SPEC.md`** | **⭐⭐ User management: RBAC scopes (45+), SAML/OIDC JIT, custom roles, projects** |
| **85** | **`85-FLOWHOLT-SCALING-HOSTING-ARCHITECTURE-SPEC.md`** | **⭐⭐ Scaling: queue mode, BullMQ, task runners, Redis, S3 storage, webhooks** |
| **86** | **`86-FLOWHOLT-EXPRESSION-METHODS-COMPLETE-SPEC.md`** | **⭐⭐ Complete method catalog: String (17+), Array (18+), Number (11), Object (11), DateTime (Luxon), all built-in vars** |
| **87** | **`87-FLOWHOLT-DATA-MANAGEMENT-DEEP-SPEC.md`** | **⭐⭐ Data pinning, Data Tables, binary data, item linking, custom execution data, n8n DB structure** |
| **88** | **`88-FLOWHOLT-AI-EVALUATION-CHAT-HUB-SPEC.md`** | **⭐⭐ Evaluation system (light + metric), Chat Hub, $fromAI(), streaming, templates API, agents/chains/memory** |
| **89** | **`89-FLOWHOLT-N8N-MAKE-CROSS-PLATFORM-SYNTHESIS-SPEC.md`** | **⭐⭐⭐ n8n vs Make full synthesis: expressions, routing, iterators, aggregators, error handlers, forms, webhooks, custom functions, gap matrix** |
| **90** | **`90-FLOWHOLT-ERROR-HANDLERS-DEEP-SPEC.md`** | **⭐⭐ Error handlers: all 5 Make types (Break/Rollback/Commit/Resume/Ignore) + n8n Error Workflow + Incomplete Executions + Stop and Error node + canvas visualization** |
| **91** | **`91-FLOWHOLT-ANALYTICS-INSIGHTS-DEEP-SPEC.md`** | **⭐⭐ Insights system: summary banner, dashboard, Time Saved (Fixed + Dynamic), per-plan tiers, credits usage chart, fulltext execution search, drill-down** |
| **92** | **`92-FLOWHOLT-DATA-STORES-VARIABLES-DEEP-SPEC.md`** | **⭐⭐ Data Stores + Variables: 3-tier var system (workflow/workspace/org), Data Store CRUD (7 modules), Data Structures (schema), converger patterns, incremental vars** |
| **93** | **`93-FLOWHOLT-HISTORY-BLUEPRINTS-VERSION-CONTROL-SPEC.md`** | **⭐⭐ History & versions: execution history, version snapshots, named versions, blueprint export/import, scenario settings (sequential, confidential, auto-commit, consecutive errors), error types taxonomy, sub-workflows** |
| **94** | **`94-FLOWHOLT-AI-AGENTS-DEEP-SPEC.md`** | **⭐⭐ AI Agents: Run AI Agent node, AI providers (built-in + custom), Knowledge/RAG system, 3 tool types (module/workflow/MCP), conversation memory, response format, reasoning output, cost controls** |

---

## `competitor-data/` — Competitor Reference Material

| Path | Content | Size |
|------|---------|------|
| `make/` | Make.com help center full export (HTML + markdown) | ~626 MB |
| `make-ui/` | Make.com UI crawl — network logs, UI taxonomy, transitions | ~37 MB |
| `make-docs/` | Make.com API/CLI/MCP docs | ~2 MB |
| `n8n/` | n8n docs full export (HTML + markdown + assets) | ~1.2 GB |
| `make-domain-index.md` | Make.com domain/route index (synthesized) | reference |
| `make-domain-index.json` | Make.com domain index (machine-readable) | reference |
| `make-pdf-full.txt` | Make.com help PDF full extracted text | ~1 MB |
| `make-pdf-extracted.txt` | Make.com PDF key sections | ~8 KB |
| `make-ui-crawler-guide.md` | How to use the Make.com UI crawler | guide |

---

## `Vault/Project Memory/` — Obsidian Knowledge Base

The Vault is the curated, AI-navigable knowledge base. Key files:

| File | Content |
|------|---------|
| `CLAUDE.md` | Claude-specific navigation notes |
| `index.md` | Vault index |
| `overview.md` | Platform overview |
| `log.md` | Research log |
| `wiki/concepts/` | Core concepts: execution model, expression language, permissions, etc. |
| `wiki/entities/` | Entity docs: flowholt.md, make.md, n8n.md |
| `wiki/analyses/` | Gap analysis, advantages, research findings |
| `wiki/data/` | Implementation roadmap, node inventory, open decisions |
| `wiki/sources/` | Source index: make-domain-index, n8n-docs, etc. |

---

## `assets/`

| File | Content |
|------|---------|
| `flowholt-logo.jpg` | FlowHolt logo |

---

## Also in repo root (not in research/)

| File | Purpose |
|------|---------|
| `README.md` | Public-facing project readme |
| `backend/` | FastAPI backend (Python) |
| `src/` | React/Vite frontend |
| `n8n-master/` | n8n source code reference |

---

*Last updated: Sprint 86 — April 2026*
