---
title: Make.com Domain Index
type: source
tags: [make, domains, index, corpus]
sources: [make-help-center, make-pdf, make-advanced]
updated: 2026-04-17
---

# Make.com Domain Index

Maps every Make.com research domain to its raw source locations, plan file references, and vault pages. Parity with [[wiki/sources/n8n-domain-index]].

---

## Raw Source Inventory

| Source | Location | Content |
|--------|----------|---------|
| Help Center (324 pages) | `research/make-help-center-export/pages_markdown/` | Feature docs, tutorials, how-tos |
| Full PDF (~31K lines) | `research/make-pdf-full.txt` | Complete Make documentation as text |
| Extracted PDF (key sections) | `research/make-pdf-extracted.txt` | 8KB of highest-signal extracts |
| UI Crawl (JSON + screenshots) | `research/make-advanced/` | Node insert panel, scenario editor, settings |
| UI Analysis (138KB) | `plan-introductionToMakeUi.prompt.md` | Detailed UI walkthrough and analysis |

---

## Domain Map

### Domain 1: Scenario Editor (Canvas)

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `scenarios.md`, `scenario-editor.md`, `modules.md`, `mapping.md`, `mapping-panel.md` |
| PDF | §Scenarios, §Modules, §Mapping |
| UI Crawl | `research/make-advanced/01-scenario-editor/`, `03-node-insert/` |
| Plan Files | `07`, `11`, `15`, `23`, `26`, `27`, `30`, `33` |
| Vault | [[wiki/concepts/studio-anatomy]] |

### Domain 2: Data Model and Bundles

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `data-types.md`, `bundles.md`, `items.md`, `collections.md`, `arrays.md` |
| PDF | §Data Types, §Bundles, §Collections |
| Plan Files | `50` (FlowItem model comparison) |
| Vault | [[wiki/concepts/expression-language]] |

### Domain 3: Functions and Expressions

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `functions/` (all function category pages), `variables.md` |
| PDF | §Functions, §Variables, §Formulas |
| Plan Files | `50`, `53` |
| Vault | [[wiki/concepts/expression-language]] |

### Domain 4: Control Plane (Organizations, Teams, Roles)

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `organizations.md`, `teams.md`, `users.md`, `roles.md`, `team-roles.md` |
| PDF | §Organizations, §Teams, §Roles |
| Plan Files | `04`, `36` |
| Vault | [[wiki/concepts/control-plane]] |

### Domain 5: Permissions and Governance

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `permissions.md`, `sharing.md`, `access-rights.md` |
| PDF | §Permissions, §Access Rights |
| Plan Files | `08`, `12`, `18`, `24`, `28`, `31`, `34`, `35` |
| Vault | [[wiki/concepts/permissions-governance]] |

### Domain 6: Settings and Configuration

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `organization-settings.md`, `team-settings.md`, `user-settings.md`, `scenario-settings.md` |
| PDF | §Settings |
| UI Crawl | `research/make-advanced/04-settings/` |
| Plan Files | `06`, `38` |
| Vault | [[wiki/concepts/settings-catalog]] |

### Domain 7: Error Handling and Resilience

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `error-handling.md`, `error-types.md`, `incomplete-executions.md`, `break.md`, `rollback.md`, `ignore.md`, `resume.md`, `commit.md` |
| PDF | §Error Handling, §Incomplete Executions |
| Plan Files | `44` |
| Vault | [[wiki/concepts/error-handling]] |

### Domain 8: Runtime Operations

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `execution-history.md`, `scheduling.md`, `queue.md`, `webhooks.md` |
| PDF | §Scheduling, §Queue, §Webhooks, §Execution History |
| Plan Files | `19`, `22`, `25`, `29`, `32`, `35`, `42` |
| Vault | [[wiki/concepts/runtime-operations]], [[wiki/concepts/webhook-trigger-system]] |

### Domain 9: Connections and Integrations

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `connections.md`, `connection-types.md`, `oauth.md`, `api-key.md`, `webhooks.md` |
| PDF | §Connections, §OAuth |
| UI Crawl | `research/make-advanced/02-connections/` |
| Plan Files | `46` |
| Vault | [[wiki/concepts/connections-integrations]] |

### Domain 10: Data Stores and Custom Functions

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `data-stores.md`, `data-store-modules.md`, `keys.md` |
| PDF | §Data Stores |
| Plan Files | `45` |
| Vault | [[wiki/concepts/data-store-functions]] |

### Domain 11: Observability and Analytics

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `operations.md`, `data-transfer.md`, `usage.md` |
| PDF | §Operations, §Usage, §Pricing |
| Plan Files | `41` |
| Vault | [[wiki/concepts/observability-analytics]] |

### Domain 12: Billing and Pricing

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `billing.md`, `pricing.md`, `operations.md`, `plans.md` |
| PDF | §Pricing, §Plans, §Credits, §Teams (credit allocation) |
| Plan Files | `57` |
| Vault | (planned: billing concept page) |

### Domain 13: Notifications and Emails

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `email-notifications.md`, `notification-settings.md` |
| PDF | §Notifications |
| Plan Files | `54` |
| Vault | (covered in [[wiki/concepts/runtime-operations]]) |

### Domain 14: Templates and Marketplace

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `templates.md`, `marketplace.md`, `publishing.md` |
| PDF | §Templates |
| Plan Files | (planned) |
| Vault | (not yet created) |

### Domain 15: AI Features

| Source | Key Pages/Sections |
|--------|-------------------|
| Help Center | `ai.md` (limited — Make AI features are newer and less documented) |
| PDF | §AI (minimal) |
| Plan Files | `05`, `37` (primarily n8n-influenced) |
| Vault | [[wiki/concepts/ai-agents]] |

---

## Gap Coverage Summary

| Domain | Raw Source Coverage | Plan File Coverage | Vault Coverage |
|--------|-------------------|-------------------|----------------|
| 1. Scenario Editor | ✅ Complete | ✅ 8 files | ✅ |
| 2. Data Model | ✅ Complete | ✅ file 50 | ✅ |
| 3. Functions/Expressions | ✅ Complete | ✅ files 50, 53 | ✅ |
| 4. Control Plane | ✅ Complete | ✅ files 04, 36 | ✅ |
| 5. Permissions | ✅ Complete | ✅ 8 files | ✅ |
| 6. Settings | ✅ Complete | ✅ files 06, 38 | ✅ |
| 7. Error Handling | ✅ Complete | ✅ file 44 | ✅ |
| 8. Runtime Operations | ✅ Complete | ✅ 7 files | ✅ |
| 9. Connections | ✅ Complete | ✅ file 46 | ✅ |
| 10. Data Stores | ✅ Complete | ✅ file 45 | ✅ |
| 11. Observability | ✅ Complete | ✅ file 41 | ✅ |
| 12. Billing | ✅ Complete | ✅ file 57 | ⬜ Needs vault page |
| 13. Notifications | ✅ Complete | ✅ file 54 | ✅ (in runtime-ops) |
| 14. Templates/Marketplace | ⚠️ Partial | ⬜ Not yet | ⬜ Not yet |
| 15. AI Features | ⚠️ Limited | ✅ files 05, 37 | ✅ |

---

## Related Pages

- [[wiki/sources/n8n-domain-index]] — n8n equivalent of this page
- [[wiki/sources/make-help-center]] — Make help center source summary
- [[wiki/entities/make]] — Make competitor profile
- [[wiki/analyses/make-vs-flowholt-gap]] — gap analysis
- `48-FLOWHOLT-REMAINING-MAKE-CORPUS-GAPS.md` — what was missing from Make corpus
- `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` — dual competitive gap matrix
