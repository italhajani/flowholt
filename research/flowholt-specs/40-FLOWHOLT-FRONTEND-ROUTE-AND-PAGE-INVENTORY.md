# FlowHolt Frontend Route And Page Inventory

This file documents every current and planned page in the FlowHolt frontend, the route structure, sidebar navigation hierarchy, layout rules, and page-level data loading.

It is grounded in:
- `src/App.tsx` — current route definitions (22 routes: 1 auth, 1 public chat, 18 dashboard, 1 studio, 1 404)
- `src/components/dashboard/DashboardSidebar.tsx` — current sidebar navigation (4 sections, 14 nav items)
- `src/components/dashboard/DashboardLayout.tsx` — dashboard shell
- `src/components/studio/WorkflowStudio.tsx` — studio shell
- Make corpus: `research/make-help-center-export/pages_markdown/explore-make-grid-gui.md` (Make Grid UI)
- Make corpus: `research/make-help-center-export/pages_markdown/credits-and-operations.md` (credit tracking surfaces)
- Make corpus: `research/make-help-center-export/pages_markdown/analytics-dashboard.md`
- Make corpus: `research/make-help-center-export/pages_markdown/audit-logs.md`
- Make corpus: `research/make-help-center-export/pages_markdown/new-navigation-now-live-for-all-users.md` — nav revamp rationale
- Make corpus: `research/make-help-center-export/pages_markdown/make-grid-public-beta-is-now-live.md` — Grid view
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — org/team navigation and URL structure
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — Make crawl: left nav rail (11 items), org nav menus (§2, §3)
- `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §2` — n8n route map (75 named views), layout system
- `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md §8` — n8n sidebar structure

---

## Cross-Reference Map

### This file feeds into
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — Studio layout details
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — org/team/workspace route structure
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` — settings page inventory
- `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` — analytics pages (§3 `/org/consumption`)
- `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` — deployment route

### This file is informed by
- **Make left nav rail** (11 items from crawl): `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §2a`
  - Key insight: Make elevated Webhooks, Data Stores, Data Structures, AI Agents, and MCP Toolboxes to first-level nav → FlowHolt should do the same
- **Make org navigation** (3 groups): `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §3`
  - Key insight: org nav has 3 groups (Organization, My Plan, Utilities) with 8 items total
- **Make nav revamp**: `research/make-help-center-export/pages_markdown/new-navigation-now-live-for-all-users.md`
  - Explains why Make moved entities to top-level nav
- **n8n 75 views**: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §2` — n8n has 75 named views; FlowHolt currently has 41 planned pages
- **n8n layout system**: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §2` — 7 layout types (DefaultLayout, WorkflowLayout, SettingsLayout, AuthLayout, DemoLayout, ChatLayout, InstanceAiLayout)
- **n8n per-workflow tabs**: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md §1.1` — WORKFLOW / EXECUTIONS / EVALUATION tabs; FlowHolt should adopt this 3-tab model per workflow

### Corrections and gaps from research
1. **Data Stores missing from sidebar** — Make has Data Stores as first-level nav. FlowHolt §12 marks it Priority 2. **Should be Priority 1** — add `/dashboard/data-stores`.
2. **Data Structures not planned** — Make has a "Data Structures (UDTs)" first-level nav item. n8n has `Variables` as a project-scoped entity. FlowHolt should plan `/dashboard/schemas` for JSON schema/UDT management.
3. **Grid view underweighted** — Make's Grid is a first-level nav item. FlowHolt marks it Priority 3. Consider promoting to Priority 2 → connects to `47-FLOWHOLT-AUTOMATION-MAP-SPEC.md`.
4. **Per-workflow tabs missing** — n8n has WORKFLOW / EXECUTIONS / EVALUATION tabs per workflow. FlowHolt's Studio does not have these tabs yet. Add to `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md`.
5. **MCP Toolboxes route** — Make has MCP Toolboxes as a first-level nav item (test ID `first-level-navigation-main-vhosts`). FlowHolt has no planned route for this. Add `/dashboard/mcp-toolboxes` as Phase 2.

---


## 1. Current route inventory

### Public routes (no auth required)

| Route | Component | Purpose |
|---|---|---|
| `/` | `AuthPage` | Login / signup |
| `/chat/:workspaceId/:workflowId` | `PublicChatPage` | Public-facing chat trigger interface |

### Protected dashboard routes (`/dashboard/*`)

Layout: `DashboardLayout` (sidebar + header + content area)

| Route | Component | Sidebar section | Nav label |
|---|---|---|---|
| `/dashboard` | Redirects → `/dashboard/workflows` | — | — |
| `/dashboard/overview` | `OverviewPage` | Overview | Overview |
| `/dashboard/chat` | `ChatPage` | Overview | Chat |
| `/dashboard/ai-agents` | `AIAgentsPage` | Overview | AI Agents |
| `/dashboard/ai-agents/:workflowId/:nodeId` | `AIAgentDetailPage` | Overview | — (detail) |
| `/dashboard/workflows` | `WorkflowsPage` | Overview | Workflows |
| `/dashboard/templates` | `TemplatesPage` | Overview | Templates |
| `/dashboard/executions` | `ExecutionsPage` | Overview | Executions |
| `/dashboard/executions/:executionId` | `ExecutionDetailPage` | Overview | — (detail) |
| `/dashboard/credentials` | `CredentialsPage` | Data & Assets | Vault |
| `/dashboard/vault` | Redirects → `/dashboard/credentials` | — | — |
| `/dashboard/connections` | Redirects → `/dashboard/credentials` | — | — |
| `/dashboard/variables` | Redirects → `/dashboard/credentials` | — | — |
| `/dashboard/environment` | `EnvironmentPage` | Data & Assets | Environments |
| `/dashboard/webhooks` | `WebhooksPage` | Tools | Webhooks |
| `/dashboard/api` | `ApiPlaygroundPage` | Tools | API Playground |
| `/dashboard/system` | `SystemStatusPage` | Account | System Status |
| `/dashboard/audit` | `AuditLogPage` | Account | Audit Log |
| `/dashboard/settings` | `SettingsPage` | Account | Settings |
| `/dashboard/help` | `HelpCenterPage` | Account | Help Center |
| `/dashboard/providers` | `ProvidersPage` | — (hidden) | — |
| `/dashboard/integrations` | `IntegrationsPage` | — (hidden) | — |

### Studio route

| Route | Component | Layout |
|---|---|---|
| `/studio/:id` | `WorkflowStudio` | Full-screen (no sidebar) |

### Error route

| Route | Component |
|---|---|
| `*` | `NotFound` (404) |

---

## 2. Current sidebar structure

```
OVERVIEW
├── Overview          /dashboard/overview
├── Chat              /dashboard/chat
├── AI Agents         /dashboard/ai-agents
├── Workflows         /dashboard/workflows
├── Templates         /dashboard/templates
└── Executions        /dashboard/executions

DATA & ASSETS
├── Vault             /dashboard/credentials
└── Environments      /dashboard/environment

TOOLS
├── Webhooks          /dashboard/webhooks
└── API Playground    /dashboard/api

ACCOUNT
├── System Status     /dashboard/system
├── Audit Log         /dashboard/audit
├── Settings          /dashboard/settings
└── Help Center       /dashboard/help
```

---

## 3. Planned routes: organization and team (from file 36)

### Organization routes (`/org/*`)

These routes use a new `OrgLayout` (sidebar with org-specific navigation).

| Route | Component | Purpose |
|---|---|---|
| `/org/:orgSlug` | `OrgDashboardPage` | Org overview with credit usage, team list, key metrics |
| `/org/:orgSlug/settings` | `OrgSettingsPage` | General, security, defaults (file 38 §3) |
| `/org/:orgSlug/members` | `OrgMembersPage` | Invite, role management, status |
| `/org/:orgSlug/teams` | `OrgTeamsPage` | Team list, create team, credit allocation |
| `/org/:orgSlug/billing` | `OrgBillingPage` | Plan, subscription, credit purchase, invoices |
| `/org/:orgSlug/consumption` | `OrgConsumptionPage` | Analytics dashboard (file 41) |
| `/org/:orgSlug/credit-usage` | `OrgCreditUsagePage` | Per-run credit history (mirrors Make's "Credit usage") |
| `/org/:orgSlug/audit` | `OrgAuditLogPage` | Org-level audit logs |

### Team routes (`/team/*`)

These routes use a `TeamLayout`.

| Route | Component | Purpose |
|---|---|---|
| `/team/:teamSlug` | `TeamDashboardPage` | Team overview, workspace list, member summary |
| `/team/:teamSlug/members` | `TeamMembersPage` | Team member management, role assignment |
| `/team/:teamSlug/workspaces` | `TeamWorkspacesPage` | Workspace list, create workspace |
| `/team/:teamSlug/settings` | `TeamSettingsPage` | Team settings (file 38 §4) |
| `/team/:teamSlug/audit` | `TeamAuditLogPage` | Team-level audit logs |

### Make evidence for org/team pages

Make structures its left sidebar as:
- **Org** section: Dashboard (credit usage, usage trends), Subscription, Credit Usage, Teams, Org Audit Logs
- **Team** section: Team Dashboard, Team Audit Logs
- **Scenarios** — scenario list (workspace-level in FlowHolt)

Source: `how-to-track-credits.md` ("Dashboard tracks total and daily credit usage... go to **Org** in the left sidebar"), `analytics-dashboard.md` (Enterprise analytics at org level), `audit-logs.md` (org and team audit log tabs), `credits-per-team-management.md` (teams tab with credit limits and usage bars).

---

## 4. Planned routes: runtime operations (from file 35)

| Route | Component | Purpose |
|---|---|---|
| `/dashboard/runtime` | `RuntimeOverviewPage` | Runtime summary, queue stats, failure trends, worker health |
| `/dashboard/runtime/jobs` | `RuntimeJobsPage` | Active, queued, failed jobs |
| `/dashboard/runtime/pauses` | `RuntimePausesPage` | Human tasks, confirmation pauses |
| `/dashboard/runtime/failures` | `RuntimeFailuresPage` | Recent failures, dead-letter items |
| `/dashboard/runtime/alerts` | `RuntimeAlertsPage` | Alert rules, active alerts |

---

## 5. Planned routes: managed agents (from file 37)

Currently agents are accessed via `/dashboard/ai-agents` (list) and `/dashboard/ai-agents/:workflowId/:nodeId` (detail, keyed by workflow + node).

After managed agent entity (file 37):

| Route | Component | Purpose |
|---|---|---|
| `/dashboard/ai-agents` | `AIAgentsPage` (updated) | Managed agent list + workflow-derived agent list |
| `/dashboard/ai-agents/:agentId` | `AIAgentDetailPage` (updated) | Managed agent detail: overview, instructions, tools, knowledge, testing |
| `/dashboard/ai-agents/:agentId/test` | `AIAgentTestPage` | Full-screen testing & training chat |
| `/dashboard/ai-agents/:agentId/knowledge` | `AIAgentKnowledgePage` | Knowledge file management |

The old `/dashboard/ai-agents/:workflowId/:nodeId` route is preserved for inline (non-managed) agent viewing.

---

## 6. Planned sidebar evolution

### Phase 1 sidebar (current + runtime)

```
OVERVIEW
├── Overview
├── Chat
├── AI Agents
├── Workflows
├── Templates
└── Executions

RUNTIME                               ← NEW section
└── Runtime Ops                       ← link to /dashboard/runtime

DATA & ASSETS
├── Vault
└── Environments

TOOLS
├── Webhooks
└── API Playground

ACCOUNT
├── System Status
├── Audit Log
├── Settings
└── Help Center
```

### Phase 2 sidebar (with org/team switchers)

```
[Org Switcher]                        ← dropdown at top
  [Team Switcher]                     ← dropdown below org
    [Workspace Switcher]              ← dropdown below team

OVERVIEW
├── Overview
├── Chat
├── AI Agents
├── Workflows
├── Templates
└── Executions

RUNTIME
└── Runtime Ops

DATA & ASSETS
├── Vault
└── Environments

TOOLS
├── Webhooks
└── API Playground

ORG                                   ← NEW section (when org is selected)
├── Org Dashboard
├── Members
├── Teams
├── Consumption
├── Billing
└── Audit Log

ACCOUNT
├── System Status
├── Settings
└── Help Center
```

### Make sidebar evidence

Make's sidebar structure (from corpus):
- **Scenarios** (list view, folders)
- **Templates** 
- **Connections**
- **Webhooks**
- **Keys** / **Devices**
- **Data stores**
- **Custom functions**
- **Org** (Dashboard, Subscription, Credit Usage, Teams, Audit Logs)
- **Team** (Dashboard, Audit Logs)

Raw corpus sources:
- `research/make-help-center-export/pages_markdown/new-navigation-now-live-for-all-users.md` — nav revamp announcement ("go to **Org** in the left sidebar"), explains why items were elevated
- `research/make-help-center-export/pages_markdown/audit-logs.md` ("Click **Org** in the left sidebar")
- `research/make-help-center-export/pages_markdown/credits-and-operations.md` ("go to **Org** in the left sidebar")
- `research/make-help-center-export/pages_markdown/webhooks.md` ("In the left sidebar, click **Webhooks**")
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §2a` — confirmed 11 first-level nav items with exact test IDs

n8n sidebar (for comparison): `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §2` — n8n sidebar: Main header (logo/collapse), Project navigation (workflows/credentials/executions/variables), Bottom menu (help/templates/insights/settings), Source control status. n8n sidebar is project-scoped, Make's is workspace-scoped. FlowHolt should follow Make's model with workspace-scoped sidebar.

---

## 7. Layout system

### Layout types

| Layout | Shell | Use case |
|---|---|---|
| `AuthLayout` | Centered card, no navigation | `/`, password reset |
| `DashboardLayout` | Sidebar + header + content area | All `/dashboard/*` routes |
| `OrgLayout` | Sidebar with org navigation + content | All `/org/*` routes |
| `TeamLayout` | Sidebar with team navigation + content | All `/team/*` routes |
| `StudioLayout` | Full-screen canvas, no sidebar | `/studio/:id` |
| `PublicLayout` | Minimal branding, no sidebar | `/chat/:workspaceId/:workflowId` |

### Header behavior

The dashboard header contains:
- **Breadcrumb** — shows current page path
- **Global search** — workspace-scoped search
- **Notifications bell** — unread notification count
- **Profile menu** — user settings, org/team switcher, logout

### Responsive behavior

- Sidebar collapses to icon-only mode on narrow viewports
- On mobile (< 768px), sidebar becomes a slide-out drawer
- Studio uses its own responsive layout with collapsible panels

---

## 8. Page-level data loading

Each dashboard page loads data through React Query hooks. The loading sequence follows:

```
1. Auth check (ProtectedRoute)
2. Session resolution (workspace context)
3. Page-specific data fetch(es)
4. Render page with data
```

### Current data loading per page

| Page | Primary query | Secondary queries |
|---|---|---|
| OverviewPage | `/api/stats/overview` | Recent executions, recent workflows |
| WorkflowsPage | `/api/workflows` | Workflow policies per row |
| TemplatesPage | `/api/templates` | — |
| ExecutionsPage | `/api/executions` | Execution stats |
| ExecutionDetailPage | `/api/executions/:id/inspector` | Step data, artifacts |
| AIAgentsPage | Derived from `/api/workflows` | Agent entries per workflow |
| AIAgentDetailPage | `/api/workflows/:id` | Agent operational status |
| CredentialsPage | `/api/vault/overview` | Connections, credentials, variables |
| EnvironmentPage | `/api/environments` | — |
| WebhooksPage | `/api/webhooks` | Queue counts per webhook |
| SettingsPage | `/api/workspaces/current/settings` | Member list |
| SystemStatusPage | `/api/system/status` | — |
| AuditLogPage | `/api/audit-log` | — |
| ChatPage | `/api/chat/sessions` | Messages per session |
| ApiPlaygroundPage | — | Uses forms to issue API calls |
| HelpCenterPage | `/api/help/articles` | — |

### Planned data loading additions

| Page | Primary query | Notes |
|---|---|---|
| RuntimeOverviewPage | `/api/runtime/overview` | From file 35 |
| OrgDashboardPage | `/api/organizations/:id` | + credit usage summary |
| OrgMembersPage | `/api/organizations/:id/members` | — |
| OrgTeamsPage | `/api/organizations/:id/teams` | + credit per team |
| OrgConsumptionPage | `/api/organizations/:id/analytics` | From file 41 |
| OrgCreditUsagePage | `/api/organizations/:id/credit-usage` | Per-run history |
| OrgBillingPage | `/api/organizations/:id/billing` | Plan details |
| TeamDashboardPage | `/api/teams/:id` | + workspace list |
| TeamMembersPage | `/api/teams/:id/members` | — |
| AIAgentDetailPage (managed) | `/api/agents/:id` | + tools, knowledge, test sessions |

---

## 9. Navigation rules

### Active state rules

1. A nav item is **active** when `location.pathname.startsWith(item.path)`.
2. Detail pages (e.g., `/dashboard/executions/:id`) activate the parent nav item (`Executions`).
3. Redirected routes (e.g., `/dashboard/vault`) do not appear in navigation.

### Permission-based visibility

Nav items should be hidden or disabled based on workspace capabilities:

| Nav item | Minimum capability | Behavior when denied |
|---|---|---|
| Workflows | `workspace.view` | Hidden |
| AI Agents | `workspace.view` | Hidden |
| Executions | `workspace.view` | Hidden |
| Settings | `workspace.edit_settings` | Visible but read-only |
| Audit Log | `workspace.view_audit` | Hidden (enterprise only) |
| Billing | `org.view_billing` | Hidden |
| Members | `org.manage_members` or `team.manage_members` | View-only without manage role |

### Org/team/workspace switching

1. **Org switcher** — lists all orgs the user belongs to. Switching org reloads session with new `org_id`. Navigates to `/org/:orgSlug`.
2. **Team switcher** — lists teams within current org. Switching team updates `team_id`. Navigates to `/team/:teamSlug`.
3. **Workspace switcher** — lists workspaces within current team. Switching workspace updates session `workspace_id`. Navigates to `/dashboard/workflows`.
4. Each switch issues a new session token (from file 36 §5).

---

## 10. Page inventory: complete table

### Current pages (22 total)

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Auth | `/` | Implemented |
| 2 | Public Chat | `/chat/:wId/:wfId` | Implemented |
| 3 | Overview | `/dashboard/overview` | Implemented |
| 4 | Chat | `/dashboard/chat` | Implemented |
| 5 | AI Agents | `/dashboard/ai-agents` | Implemented |
| 6 | AI Agent Detail | `/dashboard/ai-agents/:wfId/:nId` | Implemented |
| 7 | Workflows | `/dashboard/workflows` | Implemented |
| 8 | Templates | `/dashboard/templates` | Implemented |
| 9 | Executions | `/dashboard/executions` | Implemented |
| 10 | Execution Detail | `/dashboard/executions/:eId` | Implemented |
| 11 | Vault (Credentials) | `/dashboard/credentials` | Implemented |
| 12 | Environments | `/dashboard/environment` | Implemented |
| 13 | Webhooks | `/dashboard/webhooks` | Implemented |
| 14 | API Playground | `/dashboard/api` | Implemented |
| 15 | System Status | `/dashboard/system` | Implemented |
| 16 | Audit Log | `/dashboard/audit` | Implemented |
| 17 | Settings | `/dashboard/settings` | Implemented |
| 18 | Help Center | `/dashboard/help` | Implemented |
| 19 | Providers | `/dashboard/providers` | Implemented (hidden) |
| 20 | Integrations | `/dashboard/integrations` | Implemented (hidden) |
| 21 | Studio | `/studio/:id` | Implemented |
| 22 | 404 | `*` | Implemented |

### Planned pages (19 new)

| # | Page | Route | Planning source |
|---|---|---|---|
| 23 | Runtime Overview | `/dashboard/runtime` | File 35 |
| 24 | Runtime Jobs | `/dashboard/runtime/jobs` | File 35 |
| 25 | Runtime Pauses | `/dashboard/runtime/pauses` | File 35 |
| 26 | Runtime Failures | `/dashboard/runtime/failures` | File 35 |
| 27 | Runtime Alerts | `/dashboard/runtime/alerts` | File 35 |
| 28 | Managed Agent Detail | `/dashboard/ai-agents/:agentId` | File 37 |
| 29 | Agent Test | `/dashboard/ai-agents/:agentId/test` | File 37 |
| 30 | Agent Knowledge | `/dashboard/ai-agents/:agentId/knowledge` | File 37 |
| 31 | Org Dashboard | `/org/:orgSlug` | File 36 |
| 32 | Org Settings | `/org/:orgSlug/settings` | File 38 |
| 33 | Org Members | `/org/:orgSlug/members` | File 36 |
| 34 | Org Teams | `/org/:orgSlug/teams` | File 36 |
| 35 | Org Billing | `/org/:orgSlug/billing` | File 36 |
| 36 | Org Consumption | `/org/:orgSlug/consumption` | File 41 |
| 37 | Org Credit Usage | `/org/:orgSlug/credit-usage` | File 41 |
| 38 | Org Audit Log | `/org/:orgSlug/audit` | File 36 |
| 39 | Team Dashboard | `/team/:teamSlug` | File 36 |
| 40 | Team Members | `/team/:teamSlug/members` | File 36 |
| 41 | Team Settings | `/team/:teamSlug/settings` | File 38 |

### Total: 41 pages (22 current + 19 planned)

---

## 11. Make comparison: pages FlowHolt has that Make lacks

| FlowHolt page | Make equivalent | FlowHolt advantage |
|---|---|---|
| Runtime Operations | None (executions only) | Dedicated queue/failure/alert dashboard |
| Environments | None | Per-environment deployment management |
| API Playground | API reference docs only | Interactive API testing |
| Studio (visual graph editor) | Scenario Builder | Similar, but with versioning/deployment integration |
| Managed Agent Detail | AI Agents config tab | Standalone agent entity with knowledge/testing |
| Agent Test page | Testing & Training (inline) | Full-screen testing with trace visibility |

## 12. Make pages FlowHolt should add later

| Make page | Make path | FlowHolt equivalent | Priority |
|---|---|---|---|
| Data Stores | Sidebar → Data Stores | `/dashboard/data-stores` | P2 |
| Custom Functions | Sidebar → Functions | `/dashboard/functions` | P3 |
| Keys / Devices | Sidebar → Keys | Part of Vault | Already covered |
| Make Grid | Top-level view | `/dashboard/grid` (automation landscape view) | P3 |
| Scenario Folders | Scenario list folders | Workflow folders/categories | P2 |
| Incomplete Executions | Scenario → Incomplete | Part of Runtime Failures | Already planned |
| Connection management | Sidebar → Connections | Part of Vault | Already covered |
| Credential Requests | Team → Credential requests | Part of Vault | P2 |

---

## 13. Workflow sharing — public pages (from file 48 §8)

### New public route

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/w/:workflow_share_id` | `PublicWorkflowPage` | PublicLayout | None required (view); Login required to clone |

### Public workflow page contents

1. Title (can differ from workflow name, max 40 chars)
2. Description (max 260 chars)
3. Interactive workflow preview (view-only canvas rendering)
4. Additional information (max 2,000 chars; setup instructions)
5. Author name + avatar (initials v1, image upload v2)
6. "+Use this workflow" button → creates clone in viewer's workspace (login required)

### Studio integration

New action in Studio TopBar: **"Share"** button → opens Share dialog:
- Toggle share link on/off (toggling off deactivates link immediately)
- If re-enabled, same link is restored (permanent per workflow)
- Blue "Shared" badge in builder when active
- Orange "Shared" badge when unsaved changes exist

### What is included/excluded in shared view

| Included | Not included |
|---|---|
| Node configuration + mapped values | API keys, passwords, credentials |
| Workflow metadata (name, description) | Connection objects |
| Node layout, canvas annotations | Sub-workflows (appear as empty nodes) |
| | AI agents (appear as empty nodes) |
| | Data stores (empty) |

### Social sharing

Direct sharing to LinkedIn, Facebook, X, Email from the Share dialog. Open Graph meta tags on public page for proper social share cards.

### Priority: Phase 2–3 (after core stability)

---

## 14. Org Workflow Properties page (from file 48 §6)

| Route | Component | Layout | Access |
|---|---|---|---|
| `/org/:org_id/settings/workflow-properties` | `OrgWorkflowPropertiesPage` | OrgLayout | org_owner, org_admin |

This page allows org admins to define custom metadata fields (short text, long text, number, boolean, date, dropdown, multichoice) that appear as columns in the Workflow List table view. See file 38 § Custom Workflow Properties for the entity model.

### Priority: P2 (Teams/Enterprise feature)
