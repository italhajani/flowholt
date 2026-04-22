# FlowHolt Ultimate Plan — Master Structure and Direction

> **Last rebuilt:** 2026-04-16  
> **Direction:** n8n is the primary pattern source. Make.com is the control-plane and UX-maturity reference. FlowHolt must exceed both.  
> **Vault link:** [[wiki/entities/flowholt]] | [[overview]]

---

## Cross-Reference Map

### Raw Source Data (what this file is grounded in)

| Source | Location | What it provides |
|--------|----------|-----------------|
| Make.com help center | `research/make-help-center-export/pages_markdown/` | 324 articles — org model, settings, billing, analytics, integrations |
| Make.com full PDF | `research/make-pdf-full.txt` | Complete Make product documentation |
| Make.com UI crawl | `research/make-advanced/` | Playwright-based live editor screenshots, DOM snapshots, element catalogs, network logs |
| n8n documentation | `research/n8n-docs-export/pages_markdown/` | 1499 pages across 10 domains |
| n8n source code | `n8n-master/` | v2.16.0 full repository — packages, controllers, entities |

### Key Make corpus articles driving design decisions

| Topic | File |
|-------|------|
| Org model | `research/make-help-center-export/pages_markdown/organizations.md` |
| Analytics dashboard | `research/make-help-center-export/pages_markdown/analytics-dashboard.md` |
| Credits and operations | `research/make-help-center-export/pages_markdown/credits-and-operations.md` |
| Teams | `research/make-help-center-export/pages_markdown/teams.md` |
| Audit logs | `research/make-help-center-export/pages_markdown/audit-logs.md` |
| MCP toolboxes | `research/make-help-center-export/pages_markdown/mcp-toolboxes.md` |
| Incomplete executions | `research/make-help-center-export/pages_markdown/manage-incomplete-executions.md` |
| Scenario recovery | `research/make-help-center-export/pages_markdown/introducing-scenario-recovery.md` |
| Environment variables | `research/make-help-center-export/pages_markdown/environment-variables.md` |

### Key n8n source files driving design decisions

| Topic | Source path |
|-------|------------|
| Monorepo structure | `n8n-master/turbo.json`, `n8n-master/pnpm-workspace.yaml` |
| Workflow engine | `n8n-master/packages/core/src/execution-engine/` |
| Database entities | `n8n-master/packages/cli/src/databases/entities/` |
| RBAC permissions | `n8n-master/packages/cli/src/permissions/` |
| Frontend design system | `n8n-master/packages/design-system/src/` |
| Frontend editor | `n8n-master/packages/editor-ui/src/` |
| AI/Langchain nodes | `n8n-master/packages/@n8n/n8n-nodes-langchain/` |
| Insights module | `n8n-master/packages/cli/src/modules/insights/` |
| CRDT collaboration | `n8n-master/packages/editor-ui/src/composables/useCollaborationState.ts` |

### This file feeds into

Every planning file in this folder — this is the master index and orientation document.

### Peer research files

| File | Purpose |
|------|---------|
| `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` | Live Make editor UI evidence (crawl data) |
| `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` | n8n source code findings |
| `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` | n8n UI element catalog |
| `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` | Make visual UI screenshots + evidence |
| `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | n8n→FlowHolt decision register |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Dual competitive gap matrix |

---

## Design Philosophy

FlowHolt is not a Make clone or an n8n clone. It synthesizes:

- **From n8n:** execution logic, expression language, AI agent cluster architecture, node ecosystem depth, developer-friendly data model, open-source extensibility spirit
- **From Make:** control-plane maturity (org/team/workspace), settings inheritance, credit/operations model, UI polish, environment-aware publishing, collaboration
- **FlowHolt adds:** first-class deployment pipeline (Draft→Staging→Production), unified AI agent management surface, MCP bidirectionality, per-tool HITL, expression drag-to-map UX

> Raw evidence: n8n docs — `research/n8n-docs-export/pages_markdown/`  
> Raw evidence: Make corpus — `research/make-pdf-full.txt`, `research/make-help-center-export/pages_markdown/`  
> Synthesis: [[wiki/analyses/make-vs-flowholt-gap]] | [[wiki/analyses/n8n-research-findings]]

---

## Research Status

| Corpus | Status | Location |
|--------|--------|----------|
| Make.com (324 help pages + full PDF) | **COMPLETE** | `research/make-help-center-export/` + `research/make-pdf-full.txt` |
| n8n documentation (1499 pages, 10 domains) | **COMPLETE** | `research/n8n-docs-export/pages_markdown/` |
| n8n UI element catalog | **COMPLETE** | `41-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` (in this folder) |
| n8n source code research | **COMPLETE** | `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` (in this folder) |
| FlowHolt codebase | **LIVE** | `src/` + `backend/` — check `git diff HEAD` |

---

## Plan File Registry

### Foundation Files (this folder root)

| File | Contents | Status |
|------|----------|--------|
| `00-MAKE-SYNTHESIS-WORKFLOW.md` | How Make research was processed | Reference |
| `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` | **This file** — master orientation | Live |
| `02-MAKE-INITIAL-SYNTHESIS.md` | First synthesis from Make corpus | Superseded by vault |
| `README.md` | Folder purpose and navigation | Live |

### Domain Planning Files (01–48)

| # | File | Domain | n8n Primary Ref | Vault Page |
|---|------|--------|-----------------|------------|
| 03 | `03-FLOWHOLT-IA-SKELETON.md` | Information architecture | n8n-docs: `user-interface/` | [[wiki/concepts/control-plane]] |
| 04 | `04-FLOWHOLT-CONTROL-PLANE-SKELETON.md` | Org/team/workspace model | Make PDF § Org | [[wiki/concepts/control-plane]] |
| 05 | `05-FLOWHOLT-AI-AGENTS-SKELETON.md` | AI agents full spec | n8n-docs: `advanced-ai/` (~50 pages) | [[wiki/concepts/ai-agents]] |
| 06 | `06-FLOWHOLT-SETTINGS-CATALOG-SKELETON.md` | Settings 6-scope catalog | Make help: settings/* | [[wiki/concepts/settings]] |
| 07 | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | Studio canvas + inspector + mapping | n8n UI catalog (file 42) | [[wiki/concepts/studio-surface]] |
| 08 | `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md` | Permissions matrix | n8n: `user-management/` | [[wiki/concepts/permissions-governance]] |
| 09 | `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` | Backend 13-domain module plan | n8n-docs: `hosting/scaling/` | [[wiki/concepts/backend-architecture]] |
| 10 | `10-MAKE-TO-FLOWHOLT-GAP-MATRIX.md` | Competitive gaps vs Make | Make PDF full | [[wiki/analyses/make-vs-flowholt-gap]] |
| 11 | `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | Studio panel anatomy | n8n UI catalog | [[wiki/concepts/studio-surface]] |
| 12 | `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md` | Permissions full matrix | n8n scopes | [[wiki/concepts/permissions-governance]] |
| 13 | `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` | Backend service map | n8n topology | [[wiki/concepts/backend-architecture]] |
| 14 | `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` | Make UI evidence | Make UI crawl | [[wiki/entities/make]] |
| 15 | `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` | Inspector/modal inventory | n8n UI catalog | [[wiki/concepts/studio-surface]] |
| 16 | `16-FLOWHOLT-CONFIDENTIAL-DATA-GOVERNANCE-DRAFT.md` | Data governance | Make + n8n | [[wiki/concepts/permissions-governance]] |
| 17 | `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | Entity + event model | n8n event bus | [[wiki/concepts/backend-architecture]] |
| 18 | `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` | Role×Surface matrix | n8n project roles | [[wiki/concepts/permissions-governance]] |
| 19 | `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` | Queue + retention | n8n scaling (Domain 8) | [[wiki/concepts/runtime-operations]] |
| 20 | `20-MAKE-FLATTENED-PDF-REFERENCE-NOTES.md` | Make PDF key extracts | `research/make-pdf-full.txt` | [[wiki/entities/make]] |
| 21 | `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md` | Route authorization | n8n scopes | [[wiki/concepts/permissions-governance]] |
| 22 | `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` | Worker topology | n8n scaling (Domain 8) | [[wiki/concepts/runtime-operations]] |
| 23 | `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md` | Studio release actions | n8n publish states | [[wiki/concepts/environment-deployment]] |
| 24 | `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md` | Auth implementation | Make + n8n | [[wiki/concepts/permissions-governance]] |
| 25 | `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md` | Queue dashboard | n8n health endpoints | [[wiki/concepts/runtime-operations]] |
| 26 | `26-FLOWHOLT-STUDIO-OBJECT-FIELD-CATALOG-DRAFT.md` | Studio field catalog | n8n field types | [[wiki/concepts/studio-surface]] |
| 27 | `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Node field inventory | n8n core nodes (Domain 7) | [[wiki/data/node-type-inventory]] |
| 28 | `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` | Capability object model | n8n scopes | [[wiki/concepts/permissions-governance]] |
| 29 | `29-FLOWHOLT-QUEUE-DASHBOARD-WIREFRAME-AND-ALERTS.md` | Queue dashboard wireframe | n8n /metrics | [[wiki/concepts/runtime-operations]] |
| 30 | `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Studio tab×role states | n8n UI catalog | [[wiki/concepts/studio-surface]] |
| 31 | `31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md` | Capability API shapes | — | [[wiki/concepts/permissions-governance]] |
| 32 | `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` | Runtime ops routes | n8n worker API | [[wiki/concepts/runtime-operations]] |
| 33 | `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` | Node family exceptions | n8n cluster nodes | [[wiki/concepts/studio-surface]] |
| 34 | `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` | Capability bundles | — | [[wiki/concepts/permissions-governance]] |
| 35 | `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | Runtime API contracts | n8n webhook ingress | [[wiki/concepts/webhooks-triggers]] |
| 36 | `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` | Control plane org/team | Make org model | [[wiki/concepts/control-plane]] |
| 37 | `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` | AI agent entity + knowledge | n8n advanced-ai | [[wiki/concepts/ai-agents]] |
| 38 | `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` | Settings full spec | Make settings catalog | [[wiki/concepts/settings]] |
| 39 | `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Backend 13 modules | n8n topology | [[wiki/concepts/backend-architecture]] |
| 40 | `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | Frontend 22+19 routes | — | [[wiki/concepts/information-architecture]] |
| 41 | `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Observability + analytics | n8n insights (Domain 9) | [[wiki/concepts/observability-analytics]] |
| 42 | `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md` | Webhook + trigger system | n8n triggers | [[wiki/concepts/webhooks-triggers]] |
| 43 | `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` | Deployment pipeline | n8n source control (Domain 5) | [[wiki/concepts/environment-deployment]] |
| 44 | `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` | Error handling | n8n On Error modes | [[wiki/concepts/error-handling]] |
| 45 | `45-FLOWHOLT-DATA-STORE-AND-CUSTOM-FUNCTION-SPEC.md` | Data stores + functions | n8n data tables | [[wiki/concepts/data-stores]] |
| 46 | `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` | Integration management | n8n credential model | [[wiki/concepts/connections-integrations]] |
| 47 | `47-FLOWHOLT-AUTOMATION-MAP-SPEC.md` | Automation map (org view) | — | [[wiki/entities/flowholt]] |
| 48 | `48-FLOWHOLT-REMAINING-MAKE-CORPUS-GAPS.md` | Remaining Make gaps | Make PDF | [[wiki/entities/make]] |

### New Files (49+) — n8n Integration and Deep Specs

| # | File | Domain | Status |
|---|------|--------|--------|
| 49 | `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | n8n→master plan synthesis | New |
| 50 | `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | Expression language + data model | New |
| 51 | `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | Node type catalog with status | New |
| 52 | `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Make + n8n dual gap matrix | New |

### Raw Research Files (do not modify)

| File | Source | Size |
|------|--------|------|
| `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` | Make UI crawl | — |
| `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` | n8n source code | Full |
| `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` | n8n UI elements | Full |
| `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` | Make visual UI | — |
| `20-MAKE-FLATTENED-PDF-REFERENCE-NOTES.md` | Make PDF | — |

---

## Design Direction by Domain

### 1. Expression Language and Data Model

**Primary source:** n8n Domain 3 (25 pages)  
**Key decision:** Adopt n8n's item-array data model `[{json:{...}, binary:{...}}]` and `{{ }}` expression syntax  
**FlowHolt exceeds both by:** drag-to-expression mapping (confirmed as killer UX), first-class JMESPath + Luxon, visual INPUT panel with Schema/Table/JSON views  
**Vault:** [[wiki/concepts/expression-language]]  
**Plan file:** `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md`

### 2. AI Agents and Cluster Nodes

**Primary source:** n8n Domain 1 (~50 pages)  
**Key decision:** Adopt cluster node architecture (typed connector slots, not sequential piping). Single unified Agent node (Tools Agent standard, post-Feb 2025).  
**FlowHolt exceeds both by:** per-tool HITL gates (not just workflow-level), agent entities as first-class product objects (not just runtime nodes), evaluation framework in inspector, MCP bidirectionality  
**Vault:** [[wiki/concepts/ai-agents]]  
**Plan file:** `05-FLOWHOLT-AI-AGENTS-SKELETON.md`

### 3. Node Type Ecosystem

**Primary source:** n8n Domain 7 (28 pages)  
**Key decision:** Build full trigger diversity (Webhook, Schedule, Form, Chat, Email, Error), plus core flow control (If, Switch, Merge, Loop, Code)  
**FlowHolt exceeds both by:** all node types with FlowHolt-grade configuration UX, not community workarounds  
**Vault:** [[wiki/data/node-type-inventory]]  
**Plan file:** `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`

### 4. Studio Surface

**Primary source:** n8n UI catalog (file 42), n8n UI crawl  
**Key decision:** Canvas + Inspector + INPUT panel (Schema/Table/JSON views) + Expression editor. Data pinning. Auto-save + explicit publish.  
**FlowHolt exceeds both by:** unified agent inspector (cluster sub-node attachment in inspector UI), edit lock, visual diff on publish  
**Vault:** [[wiki/concepts/studio-surface]]  
**Plan file:** `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md`

### 5. Backend Architecture

**Primary source:** n8n Domain 8 (10 pages)  
**Key decision:** Postgres-as-queue validated (Windmill pattern). Workers as separate processes. 13 domain modules.  
**FlowHolt exceeds both by:** zero Redis dependency at start (cost), health readiness checks, S3 binary data plan, Prometheus `/metrics`  
**Vault:** [[wiki/concepts/backend-architecture]]  
**Plan file:** `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md`

### 6. Control Plane

**Primary source:** Make.com org model (PDF §Org, help-center/organization/)  
**n8n contribution:** project role system, global variables/tags, instance-level account types  
**Key decision:** Keep FlowHolt's org→team→workspace hierarchy; adopt n8n's `workflow:publish` as separate scope from `workflow:update`  
**Vault:** [[wiki/concepts/control-plane]] | [[wiki/concepts/permissions-governance]]  
**Plan files:** `04-FLOWHOLT-CONTROL-PLANE-SKELETON.md`, `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md`

### 7. Environment and Deployment

**Primary source:** n8n Domain 5 (git-branch model as contrast)  
**Key decision:** FlowHolt's Draft→Staging→Production pipeline is a major competitive advantage. n8n requires Git; FlowHolt is fully managed.  
**FlowHolt exceeds both by:** built-in promotion approvals, visual diff UX (green/orange/red node highlighting + per-node JSON diff on click)  
**Vault:** [[wiki/concepts/environment-deployment]]  
**Plan file:** `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md`

### 8. Observability

**Primary source:** n8n Domain 9 (4 pages — insights + health)  
**Key decision:** Only production executions count in analytics. "Time saved" is the ROI metric. 45+ log streaming event types.  
**FlowHolt exceeds both by:** credit model + time saved combined, Prometheus endpoint, health readiness check  
**Vault:** [[wiki/concepts/observability-analytics]]  
**Plan file:** `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md`

### 9. Error Handling

**Primary source:** n8n Domain 2 (On Error node modes)  
**Key decision:** Add `on_error: continue_with_error` (n8n's "Continue (error output)" mode) as third error mode alongside Stop and Continue  
**FlowHolt exceeds both by:** 5 structured handlers (Make) + inline recovery path (n8n) + circuit breakers  
**Vault:** [[wiki/concepts/error-handling]]  
**Plan file:** `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md`

---

## Open Decisions (25 unresolved)

See [[wiki/data/open-decisions.md]] for full list.  
Key decisions now answerable with complete n8n research:

| # | Decision | Answer from n8n research |
|---|---------|--------------------------|
| 10 | Agent tool type phasing | Module tools → Workflow tools → MCP (n8n pattern confirmed) |
| 13 | Memory node persistence | Buffer Window Memory for v1; add Postgres/Redis in v2 |
| 19 | Subscenario equivalent | Implement as Workflow Tool node immediately (n8n Call Workflow pattern) |
| 20 | route_barrier join node | Merge node with 5 strategies (Append/Combine by field/Combine by position/Cross-product/SQL) |

---

## Non-Negotiable Principles

1. **The editor is not the whole product.** Workflows, agents, assets, environments, teams, runtime operations all have explicit places.
2. **AI agents exist at two levels:** as managed product objects (Agents inventory page) AND as runtime cluster nodes inside Studio.
3. **Permissions must separate:** editing, operating, scheduling, observing, and publishing (5 separate concerns).
4. **n8n first, Make for maturity.** When n8n and Make disagree on execution model or agent logic, default to n8n. When they disagree on control plane or settings structure, default to Make.
5. **FlowHolt exceeds both.** Features inherited from n8n or Make must be improved, not copied verbatim.

---

## Related Files

- [[overview]] — master FlowHolt synthesis
- [[wiki/data/open-decisions]] — 25 unresolved product decisions
- [[wiki/data/implementation-roadmap]] — delivery phases
- `99-SESSION-HANDOFF.md` — previous session state
