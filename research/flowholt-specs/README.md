# FlowHolt Ultimate Plan Workspace

This folder is the working planning system for the FlowHolt automation platform. It converts competitor research from Make.com (324 help pages + full PDF) and n8n (1499 documentation pages, all 10 domains) into a concrete product blueprint that FlowHolt can implement.

**FlowHolt exceeds both. n8n is the primary pattern source. Make provides control-plane maturity.**

---

## Design Direction

| Source | Primary contribution |
|--------|---------------------|
| **n8n** (1499 pages, all domains complete) | Execution model, expression language, AI agent cluster nodes, node ecosystem, data model, scaling architecture |
| **Make.com** (324 help pages + PDF) | Control plane (org/team/workspace), settings catalog, credit model, UI polish, collaboration, error handling |
| **FlowHolt** | Built-in deployment pipeline (no Git required), agent entities as product objects, per-tool HITL, MCP bidirectionality, team budget management |

---

## Raw Research Sources (Do Not Modify)

| Source | Location | Status |
|--------|----------|--------|
| Make.com help center (324 pages) | `research/make-help-center-export/pages_markdown/` | Complete |
| Make.com full PDF | `research/make-pdf-full.txt` | Complete |
| Make.com UI crawl | `research/make-advanced/` | Complete |
| n8n documentation (1499 pages) | `research/n8n-docs-export/pages_markdown/` | **Complete** |
| n8n source code research | `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` | Complete |
| n8n UI element catalog | `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` | Complete |
| FlowHolt codebase | `src/` + `backend/` | Live (git) |

---

## Plan File Registry

### Orientation and Meta

| File | Purpose |
|------|---------|
| `README.md` | **This file** — folder orientation and navigation |
| `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` | Master direction, file registry, design direction by domain |
| `00-MAKE-SYNTHESIS-WORKFLOW.md` | How Make research was processed |
| `02-MAKE-INITIAL-SYNTHESIS.md` | First synthesis from Make corpus |
| `make-domain-index.md` | Make help-center corpus organized by domain |
| `99-SESSION-HANDOFF.md` | Prior session checkpoint |
| `98-NEXT-SESSION-PROMPT.md` | Continuation prompt |

### Core Domain Plans (Rebuilt with n8n research)

| File | Domain | Research basis |
|------|--------|----------------|
| `05-FLOWHOLT-AI-AGENTS-SKELETON.md` | AI Agents — cluster nodes, HITL, MCP, RAG | n8n Domain 1 (~50 pages) |
| `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | Studio surface — canvas, inspector, INPUT panel, expressions | n8n UI catalog + Domain 3 |
| `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` | Backend — 13 domain modules, topology, health, S3 | n8n Domain 8 (10 pages) |
| `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | ⭐ NEW — Expression language + FlowItem data model | n8n Domain 3 (25 pages) |
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | ⭐ NEW — Node catalog with FlowHolt status + gaps | n8n Domain 7 (28 pages) |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | ⭐ NEW — Make + n8n dual gap matrix | All domains |
| `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | ⭐ NEW — n8n→master plan decision register | All 10 n8n domains |

### Control Plane and Permissions

| File | Domain |
|------|--------|
| `03-FLOWHOLT-IA-SKELETON.md` | Information architecture |
| `04-FLOWHOLT-CONTROL-PLANE-SKELETON.md` | Org/team/workspace model |
| `06-FLOWHOLT-SETTINGS-CATALOG-SKELETON.md` | Settings 6-scope catalog |
| `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md` | Permissions matrix |
| `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md` | Role-by-object matrix |
| `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` | Role×Surface enforcement |
| `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md` | Route authorization |
| `24-FLOWHOLT-COMPACT-AUTH-IMPLEMENTATION-MATRIX.md` | Auth implementation matrix |
| `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` | Capability object model |
| `31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md` | Capability API shapes |
| `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` | Capability bundle payloads |
| `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` | Org/team detail design |

### Studio Deep Dives

| File | Domain |
|------|--------|
| `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | Studio panel anatomy |
| `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` | Inspector/modal inventory |
| `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md` | Release actions (publish, version) |
| `26-FLOWHOLT-STUDIO-OBJECT-FIELD-CATALOG-DRAFT.md` | Field catalog by object type |
| `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Per-node field detail |
| `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Tab×role states + mapping rules |
| `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` | Node family exceptions |

### Runtime and Backend

| File | Domain |
|------|--------|
| `13-FLOWHOLT-BACKEND-SERVICE-MAP-DRAFT.md` | Backend service map |
| `16-FLOWHOLT-CONFIDENTIAL-DATA-GOVERNANCE-DRAFT.md` | Data governance |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | Entity + event model |
| `19-FLOWHOLT-RUNTIME-QUEUE-RETENTION-DRAFT.md` | Queue + retention |
| `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` | Worker topology |
| `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md` | Queue dashboard + runbooks |
| `29-FLOWHOLT-QUEUE-DASHBOARD-WIREFRAME-AND-ALERTS.md` | Queue dashboard wireframe |
| `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` | Runtime ops routes |
| `35-FLOWHOLT-RUNTIME-API-CONTRACTS-AND-PERMISSIONS.md` | Runtime API contracts |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Backend 13-module plan |

### Product Domain Specs

| File | Domain |
|------|--------|
| `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` | AI agent entity + knowledge |
| `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` | Settings full spec |
| `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | Frontend routes (22+19 pages) |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Observability + analytics |
| `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md` | Webhook + trigger system |
| `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` | Deployment pipeline |
| `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` | Error handling |
| `45-FLOWHOLT-DATA-STORE-AND-CUSTOM-FUNCTION-SPEC.md` | Data stores + custom functions |
| `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` | Integration management |
| `47-FLOWHOLT-AUTOMATION-MAP-SPEC.md` | Automation map |
| `48-FLOWHOLT-REMAINING-MAKE-CORPUS-GAPS.md` | Remaining Make corpus gaps |

### Make Research Files

| File | Purpose |
|------|---------|
| `10-MAKE-TO-FLOWHOLT-GAP-MATRIX.md` | Original Make-only gap matrix (superseded by file 52) |
| `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` | Make UI screenshot evidence |
| `20-MAKE-FLATTENED-PDF-REFERENCE-NOTES.md` | Make PDF extraction notes |
| `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` | Make editor UI crawl (raw) |

### n8n Research Files (Do Not Modify)

| File | Purpose |
|------|---------|
| `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` | n8n source code research |
| `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` | n8n UI element catalog |

### New Synthesis Specs (Make Docs Sprint — Files 60–78)

| # | File | Content |
|---|------|---------|
| 60 | `60-FLOWHOLT-UI-REDESIGN-MASTERPLAN.md` | UI redesign masterplan |
| 61 | `61-FLOWHOLT-DESIGN-TOKENS-AND-COMPONENT-LIBRARY.md` | Design tokens + Radix/Tailwind component library |
| 62 | `62-FLOWHOLT-APP-SHELL-AND-NAVIGATION-REDESIGN.md` | App shell, sidebar, header redesign |
| 63 | `63-FLOWHOLT-STUDIO-REDESIGN-FROM-SCRATCH.md` | Studio redesign spec |
| 64 | `64-FLOWHOLT-VAULT-CONNECTIONS-AND-VARIABLES-UX.md` | Vault, connections, variables UX |
| 65 | `65-FLOWHOLT-SETTINGS-ADMIN-OBSERVABILITY-UX.md` | Settings, admin, observability UX |
| 66 | `66-FLOWHOLT-AI-AGENTS-TEMPLATES-AND-PROVIDERS-UX.md` | AI agents, templates, providers UX |
| 67 | `67-FLOWHOLT-PAGE-BY-PAGE-REDESIGN-INVENTORY-AND-ROLLOUT.md` | Full page redesign rollout plan |
| 68 | `68-FLOWHOLT-MAKE-API-COMPLETE-MODEL.md` | ⭐ Make API entity model → FlowHolt design decisions |
| 69 | `69-FLOWHOLT-UI-ELEMENT-COMPLETE-INVENTORY.md` | ⭐ Every UI element across every surface |
| 70 | `70-FLOWHOLT-FREE-TIER-EXECUTION-ARCHITECTURE.md` | ⭐ $0/month execution architecture + upgrade path |
| 71 | `71-FLOWHOLT-MCP-SERVER-INTEGRATION-SPEC.md` | ⭐ MCP server: workflows as tools + MCP client node |
| 72 | `72-FLOWHOLT-CUSTOM-NODE-BUILDER-SPEC.md` | ⭐ Custom node builder (6 module types, param system) |
| 73 | `73-FLOWHOLT-ENTERPRISE-AND-WHITE-LABEL-SPEC.md` | ⭐ Enterprise: SSO, 2FA, audit logs, branding |
| 74 | `74-FLOWHOLT-DASHBOARD-PAGES-DEEP-SPEC.md` | ⭐ Every dashboard page spec (Home, Workflows, etc.) |
| 75 | `75-FLOWHOLT-STUDIO-COMPLETE-SPEC.md` | ⭐ Studio complete: canvas, nodes, inspector, execution |
| 76 | `76-FLOWHOLT-NODE-INSPECTOR-DEEP-SPEC.md` | ⭐ Node inspector: every field type, every node's params |
| 77 | `77-FLOWHOLT-CONNECTIONS-CREDENTIALS-SPEC.md` | ⭐ Credentials: encryption, OAuth, sharing, API |
| 78 | `78-FLOWHOLT-EXPRESSION-ENGINE-COMPLETE-SPEC.md` | ⭐ Expression engine: syntax, evaluator, UI, code node |

**Files 68–78 were produced from Make Developer Hub raw docs (API reference, Custom Apps SDK, White Label docs, MCP Server docs). These represent the deepest level of FlowHolt planning — implementation-ready specs.**

---

## Research Completion Status

| Domain | Make | n8n |
|--------|------|-----|
| AI Agents + Cluster Nodes | ✅ | ✅ Complete (Domain 1, ~50 pages) |
| Flow Logic + Lifecycle | ✅ | ✅ Complete (Domains 2+4, ~25 pages) |
| Data Model + Expressions | ✅ | ✅ Complete (Domain 3, 25 pages) |
| Studio UX | ✅ | ✅ Complete (UI catalog file 42) |
| Environments + Source Control | ✅ | ✅ Complete (Domain 5) |
| User Management + RBAC | ✅ | ✅ Complete (Domain 6) |
| Core Node Types | ✅ | ✅ Complete (Domain 7, 28 pages) |
| Backend Scaling Architecture | ✅ | ✅ Complete (Domain 8, 10 pages) |
| Analytics + Insights | ✅ | ✅ Complete (Domain 9, 4 pages) |
| Community Nodes + Security | N/A | ✅ Complete (Domain 10, 6 pages) |

**Both research phases complete. All plan files grounded in raw source material.**

---

## Key Reading Order

For a new session, read in this order:

1. `research/Vault/Project Memory/CLAUDE.md` — vault constitution
2. `research/Vault/Project Memory/overview.md` — master synthesis
3. `01-FLOWHOLT-ULTIMATE-PLAN-STRUCTURE.md` — plan orientation
4. `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` — n8n decision register
5. `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` — where FlowHolt stands

Then read domain-specific files as needed.

---

## Vault Connections

All plan files connect to the Obsidian vault at `research/Vault/Project Memory/`.

Key vault pages:
- [[wiki/concepts/ai-agents]] — AI agent system
- [[wiki/concepts/expression-language]] — expression language spec
- [[wiki/concepts/backend-architecture]] — backend architecture
- [[wiki/concepts/studio-surface]] — Studio surface
- [[wiki/data/node-type-inventory]] — node type catalog
- [[wiki/data/open-decisions]] — 25 unresolved product decisions
- [[wiki/analyses/make-vs-flowholt-gap]] — gap analysis synthesis
- [[wiki/entities/n8n]] — n8n entity page (research complete)
- [[wiki/entities/make]] — Make entity page
