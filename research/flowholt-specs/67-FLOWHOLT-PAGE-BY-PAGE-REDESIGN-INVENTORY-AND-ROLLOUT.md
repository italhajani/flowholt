# FlowHolt Page-By-Page Redesign Inventory And Rollout

> **Status:** New redesign system file created 2026-04-17  
> **Purpose:** Convert the redesign strategy into a page inventory and phased implementation order for future sessions.

---

## 1. How to use this file

This file is the execution map for the redesign. It answers:

- what pages exist in the target product
- which layout family each page uses
- which spec file governs it
- what should be implemented first

Use this file with 60-66 when planning implementation sessions.

---

## 2. Layout family legend

| Layout | Meaning |
|---|---|
| AuthLayout | login/signup/invite/select workspace |
| AppShellLayout | main signed-in shell |
| StudioLayout | workflow authoring surface |
| SettingsLayout | scoped settings |
| EntityDetailLayout | focused detail page |
| OperationsLayout | runtime/analytics/admin operations |
| PublicTriggerLayout | public chat/forms/webhook landing |

---

## 3. Canonical route and page inventory

| Domain | Canonical route | Primary page | Layout | Governing file |
|---|---|---|---|---|
| Auth | `/auth/login` | login | AuthLayout | 60, 62 |
| Auth | `/auth/signup` | signup | AuthLayout | 60, 62 |
| Auth | `/auth/invite/:token` | invite accept | AuthLayout | 60, 62 |
| Auth | `/select-workspace` | workspace selector | AuthLayout | 60, 62 |
| Home | `/workspace/:workspace/home` | home overview | AppShellLayout | 62 |
| Workflows | `/workspace/:workspace/workflows` | workflow inventory | AppShellLayout | 62 |
| Workflows | `/studio/:workflowId` | workflow studio | StudioLayout | 63 |
| Workflows | `/workspace/:workspace/workflows/:id/versions` | workflow version history | EntityDetailLayout | 63, 65 |
| AI Agents | `/workspace/:workspace/ai-agents` | agent inventory | AppShellLayout | 66 |
| AI Agents | `/workspace/:workspace/ai-agents/:id` | agent detail | EntityDetailLayout | 66 |
| Templates | `/workspace/:workspace/templates` | template gallery | AppShellLayout | 66 |
| Templates | `/workspace/:workspace/templates/:id` | template detail | EntityDetailLayout | 66 |
| Executions | `/workspace/:workspace/executions` | execution inventory | AppShellLayout | 62, 65 |
| Executions | `/workspace/:workspace/executions/:id` | execution detail | EntityDetailLayout | 63, 65 |
| Executions | `/workspace/:workspace/human-tasks` | paused task inbox | AppShellLayout | 63, 65 |
| Vault | `/workspace/:workspace/vault/credentials` | credentials inventory | AppShellLayout | 64 |
| Vault | `/workspace/:workspace/vault/credentials/:id` | credential detail | EntityDetailLayout | 64 |
| Vault | `/workspace/:workspace/vault/connections` | connections inventory | AppShellLayout | 64 |
| Vault | `/workspace/:workspace/vault/connections/:id` | connection detail | EntityDetailLayout | 64 |
| Vault | `/workspace/:workspace/vault/variables` | variables inventory | AppShellLayout | 64 |
| Vault | `/workspace/:workspace/vault/external-secrets` | external secrets inventory | AppShellLayout | 64 |
| Vault | `/workspace/:workspace/vault/mcp-servers` | MCP server inventory | AppShellLayout | 64 |
| Webhooks | `/workspace/:workspace/webhooks` | webhooks inventory | AppShellLayout | 62, 65 |
| Webhooks | `/workspace/:workspace/webhooks/:id` | webhook detail | EntityDetailLayout | 65 |
| Webhooks | `/workspace/:workspace/webhooks/:id/deliveries` | delivery history | EntityDetailLayout | 65 |
| Data | `/workspace/:workspace/data-stores` | data stores inventory | AppShellLayout | 62 |
| Data | `/workspace/:workspace/schemas` | schema inventory | AppShellLayout | 62 |
| Data | `/workspace/:workspace/knowledge` | knowledge inventory | AppShellLayout | 62, 66 |
| Data | `/workspace/:workspace/mcp-servers` | MCP inventory shortcut | AppShellLayout | 64, 66 |
| Providers | `/workspace/:workspace/providers` | provider inventory | AppShellLayout | 66 |
| Providers | `/workspace/:workspace/providers/:id` | provider detail | EntityDetailLayout | 66 |
| Providers | `/workspace/:workspace/models` | model directory | AppShellLayout | 66 |
| Operations | `/workspace/:workspace/operations/runtime` | runtime overview | OperationsLayout | 65 |
| Operations | `/workspace/:workspace/operations/queues` | queues | OperationsLayout | 65 |
| Operations | `/workspace/:workspace/operations/failures` | failures | OperationsLayout | 65 |
| Operations | `/workspace/:workspace/operations/analytics` | analytics | OperationsLayout | 65 |
| Operations | `/workspace/:workspace/operations/audit` | audit log | OperationsLayout | 65 |
| Operations | `/workspace/:workspace/operations/alerts` | alert center | OperationsLayout | 65 |
| Environment | `/workspace/:workspace/environment` | environment overview | AppShellLayout | 65 |
| Environment | `/workspace/:workspace/environment/approvals` | approval inbox | AppShellLayout | 65 |
| Environment | `/workspace/:workspace/environment/compare` | environment compare | EntityDetailLayout | 65 |
| Settings | `/user/settings` | user settings | SettingsLayout | 65 |
| Settings | `/org/:org/settings` | organization settings | SettingsLayout | 65 |
| Settings | `/team/:team/settings` | team settings | SettingsLayout | 65 |
| Settings | `/workspace/:workspace/settings` | workspace settings | SettingsLayout | 65 |
| Settings | `/workspace/:workspace/workflows/:id/settings` | workflow settings | SettingsLayout | 63, 65 |
| Settings | `/workspace/:workspace/ai-agents/:id/settings` | agent settings | SettingsLayout | 65, 66 |
| Help | `/workspace/:workspace/help` | help center | AppShellLayout | 62 |
| Help | `/workspace/:workspace/api` | API playground/docs | AppShellLayout | 62 |
| Public | `/public/chat/:id` | public chat | PublicTriggerLayout | 62 |
| Public | `/public/form/:id` | hosted form | PublicTriggerLayout | 62 |

---

## 4. Shared micro-surfaces that must also be redesigned

The redesign is not just routes. These cross-cutting surfaces must be rebuilt under the new system:

1. command palette
2. notifications inbox
3. create-entity modals
4. confirm dialogs
5. asset pickers
6. share dialogs
7. invite flows
8. approval dialogs
9. empty states
10. toasts and banners
11. loading skeletons
12. inline help panels

---

## 5. Recommended rollout order

### Phase A - foundation

- shared tokens
- buttons, badges, tabs, filters, tables, forms
- command palette
- shell primitives

### Phase B - global shell

- domain rail
- context pane
- page header
- home/workflows/executions shell migration

### Phase C - Studio core

- Studio header
- tab bar
- left rail and insert pane
- canvas controls
- inspector
- runtime bar and drawer

### Phase D - Vault and providers

- Vault tabs
- connection detail
- credential creation
- variable management
- provider inventory/detail

### Phase E - operations and settings

- runtime overview
- analytics
- audit
- notifications
- settings scopes
- environment approvals

### Phase F - AI and templates

- AI agent inventory/detail
- evaluation surfaces
- templates gallery/detail
- model directory

---

## 6. First implementation slices after planning

The strongest slices after this planning phase are:

1. shared shell/tokens
2. full dashboard navigation reset
3. Studio left rail + inspector redesign
4. Vault connections redesign

That order gives the product visible progress without forcing a full rewrite in one step.

---

## 7. Migration guidance

During implementation:

- old routes may temporarily redirect to new routes
- old pages may temporarily reuse data hooks
- shell migration should happen before most page-level cosmetic rewrites
- Studio and Vault can move faster once the shell and tokens are stable

---

## 8. Exit condition

This inventory is complete only when future sessions can point to any major FlowHolt page and immediately answer:

- what layout it uses
- what spec governs it
- where it sits in rollout order

That is the standard this file establishes.
