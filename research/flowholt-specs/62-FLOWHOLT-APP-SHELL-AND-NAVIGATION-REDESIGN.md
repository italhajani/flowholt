# FlowHolt App Shell And Navigation Redesign

> **Status:** New redesign system file created 2026-04-17  
> **Purpose:** Define the signed-in shell, tenancy navigation, dashboard chrome, and global route behavior from scratch.

---

## 1. Shell thesis

FlowHolt should no longer use a single conventional dashboard sidebar. It should use a hybrid shell:

- **Make-like first-level rail** for top-level domains
- **n8n-like contextual second pane** for fast in-domain navigation
- **clean page header and content canvas** for the active surface

This gives FlowHolt better scale than the current flat sidebar while keeping navigation faster than Make's deeper menu transitions.

---

## 2. Primary shell structure

```
[Tenant switcher + first-level rail] [Context pane] [Page header + content]
```

### Region A: Tenant + domain rail

Contains:

- org switcher
- team switcher
- workspace switcher
- compact domain icons
- bottom utility icons

### Region B: Context pane

Changes based on the active domain:

- list of subpages
- recent entities
- pinned views
- quick filters
- create action

### Region C: Main content

Contains:

- page header
- page tabs where needed
- primary actions
- filter/search strip
- body layout

---

## 3. First-level domains

| Domain | Purpose |
|---|---|
| Home | workspace overview and guidance |
| Workflows | inventory and lifecycle |
| AI Agents | managed agents and evaluation |
| Templates | browse and install |
| Executions | run history and replay |
| Vault | credentials, connections, variables |
| Webhooks | endpoint inventory and queue views |
| Data | data stores, schemas, knowledge assets, MCP servers |
| Providers | AI and integration providers |
| Operations | runtime, analytics, failures, audit |
| Environment | deployment and approvals |
| Help | docs, changelog, API, support |

Settings is accessed from utilities and from scoped pages, not as a top-level domain icon.

---

## 4. Tenant switcher model

The top of the shell contains a stack:

1. Organization switcher
2. Team switcher
3. Workspace switcher

Rules:

- org switch changes the control plane
- team switch refines scope within the org
- workspace switch changes operational context
- last-used selection persists
- switchers show name, plan/role, and current state

---

## 5. Context pane behavior by domain

### Home

- Overview
- Setup checklist
- Alerts
- Recent work

### Workflows

- All workflows
- Drafts
- Active
- Paused
- Archived
- Folders / tags / saved views

### AI Agents

- All agents
- Draft
- Active
- Needs credentials
- Needs knowledge
- Evaluation runs

### Templates

- Installed
- Recommended
- Team templates
- Marketplace

### Executions

- All executions
- Running
- Failed
- Paused
- Human tasks

### Vault

- Credentials
- Connections
- Variables
- External secrets

### Webhooks

- All webhooks
- Queue health
- Failed deliveries
- Public endpoints

### Data

- Data stores
- Schemas
- Knowledge
- MCP servers

### Providers

- AI providers
- Integration providers
- Billing / usage

### Operations

- Runtime overview
- Queues
- Failures
- Analytics
- Audit log
- System status

### Environment

- Draft
- Staging
- Production
- Approval inbox
- Version compare

### Help

- Help center
- API playground
- Changelog
- Contact support

---

## 6. Top-right global utilities

Always visible:

- notifications bell
- global search / command palette trigger
- resources/help
- user/profile menu

Conditionally visible:

- billing usage chip
- environment indicator
- pending approvals badge

This area should absorb utility clutter that previously lived in the left navigation. Make's newer navigation is correct here: profile, notifications, help, and discovery belong in the top-right utility zone.

---

## 7. Page header contract

Every primary page gets:

1. title
2. optional breadcrumb
3. short contextual description
4. state or scope chips
5. right-side actions
6. tabs where needed

Examples:

- Workflows: title + create workflow + import + filters
- Vault: title + create asset + scope filter + tabs
- Operations: title + time range + export + saved views

---

## 8. Canonical page templates

### 8.1 Inventory page

Used by:

- Workflows
- AI Agents
- Templates
- Executions
- Vault tabs
- Webhooks

Structure:

- page header
- search and filters
- optional summary cards
- table or card list
- bulk action bar when rows selected

### 8.2 Detail page

Used by:

- execution detail
- connection detail
- agent detail
- webhook detail

Structure:

- entity header
- overview strip
- tabs
- primary content + secondary detail rail

### 8.3 Operations page

Used by:

- runtime dashboard
- analytics
- failures
- audit

Structure:

- summary metrics
- filters
- live table / chart grid
- event stream or incident drawer

### 8.4 Settings page

Used by all settings scopes.

Structure:

- scope header
- inheritance notice
- section nav
- grouped forms
- sticky action footer

### 8.5 Organization admin navigation

Organization and team administration should use grouped navigation rather than a flat list.

Required groups:

- **Organization** - dashboard, teams, users
- **My Plan** - subscription, usage, billing
- **Utilities** - variables, notification options, installed apps/providers, feature controls

---

## 9. Auth and public surfaces

### Auth

Auth should be re-planned as:

- centered card layout
- concise trust language
- black CTA
- workspace/tenant context shown only after auth
- signup and login on the same frame with segment switch

### Public trigger surfaces

Public chat, hosted forms, or webhook docs pages use a lighter shell:

- compact brand header
- clear trust / security notes
- focused content column
- no dashboard chrome

---

## 10. Navigation behavior rules

1. first-level domain change updates the context pane, not just content
2. context pane items can be pinned or reordered later
3. active item state uses subtle surface + green dot
4. routes must remain deep-linkable
5. command palette can jump to any page, entity, or action
6. empty domains still show meaningful entry states and setup CTAs
7. shell should keep mouse and trackpad navigation conventions predictable across canvas and non-canvas views
8. collapsed or migrated navigation items should still be discoverable through command palette and recent-items affordances

---

## 11. Search and command palette

Global command palette supports:

- open page
- open workflow / execution / agent / credential
- create entity
- run action
- jump to settings scope
- open docs / help

Search results grouped by:

- Pages
- Entities
- Actions
- Recent

---

## 12. Responsive rules

Desktop first:

- full rail + full context pane at large widths
- compact rail + collapsible context pane on medium widths
- temporary drawer context pane on tablet
- no full Studio authoring support on narrow mobile widths in phase one

Public and settings pages may support smaller widths earlier than Studio.

---

## 13. Route direction

The long-term route model should be scope-aware:

### Control plane

- `/org/:orgSlug/...`
- `/team/:teamSlug/...`
- `/workspace/:workspaceSlug/...`

### Studio

- `/studio/:workflowId`

### Public

- `/public/chat/...`
- `/public/form/...`

Migration can preserve `/dashboard/*` temporarily, but the redesign should plan against the scope-aware route model.

---

## 14. Shell-specific Make and n8n takeaways

### Keep from Make

- domain-first left rail
- top-right resources and profile area
- organization/team switching visibility
- visible operational domains

### Keep from n8n

- fast command palette
- simpler contextual navigation structure
- direct workflow access and recent items

### Improve beyond both

- better Vault visibility
- explicit environment domain
- clearer AI/agent product framing
- tighter integration between navigation and runtime health

---

## 15. Exit condition

This shell redesign is complete only when:

- every major domain is placed in the shell
- every page family has a template
- scope switchers and route model are settled
- the shell works for both operators and builders

Until then, no implementation should treat the current dashboard sidebar as canonical.
