# FlowHolt Information Architecture Skeleton

This is the initial Make-based information architecture skeleton for FlowHolt. It will evolve further when n8n research is added.

## Cross-Reference Map

### This file is grounded in (raw sources)

- `research/make-help-center-export/pages_markdown/scenarios.md` — Make top-level Scenarios list: filtering, folder structure, team scope
- `research/make-help-center-export/pages_markdown/organizations.md` — Make org-level navigation: Teams, Members, Billing, Settings entry points
- `research/make-help-center-export/pages_markdown/templates.md` — Make Templates catalog: search, tags, preview, install flow
- `research/make-help-center-export/pages_markdown/connections.md` — Make Connections surface: list, test, ownership

### Key n8n source code files

- `n8n-master/packages/editor-ui/src/components/MainSidebar.vue` — n8n flat sidebar navigation: Canvas, Executions, Templates, Credentials, Variables, Settings menu items
- `n8n-master/packages/editor-ui/src/router/index.ts` — n8n frontend route definitions tied to sidebar sections
- `n8n-master/packages/editor-ui/src/views/WorkflowsView.vue` — n8n Workflows list view structure

### n8n/Make comparison

- Make uses domain-grouped navigation: Home dashboard → Scenarios → Templates → Connections → Data Stores → Teams → Organization; each domain has its own list and detail surfaces
- n8n uses a flat sidebar with minimal separation: Canvas (single workflow view), Executions, Templates, Credentials, Variables, Settings; there is no team or org navigation layer in the UI
- FlowHolt adopts Make-style domain grouping (Home, Workflows, Studio, AI Agents, Templates, Vault, Operations, Settings) while inheriting the n8n canvas as the Studio surface; adds AI Agents as a first-class domain absent from both references

### This file feeds into

- `11-FLOWHOLT-FRONTEND-ARCHITECTURE.md` — frontend navigation component structure
- `30-FLOWHOLT-ROUTE-PLANNING.md` — full frontend route tree
- `40-FLOWHOLT-FRONTEND-ROUTES-IMPLEMENTATION.md` — route implementation and guard wiring

## Design principle

FlowHolt should not be organized as a flat collection of pages. It should be organized as a mature control plane with clear operational domains.

## Proposed top-level navigation

### 1. Home

Purpose:
- organization or workspace overview
- usage snapshot
- recent execution health
- onboarding and recommendations

Expected sections:
- usage summary cards
- active workflows and agents
- alerts and degraded systems
- credits or quota state
- adoption prompts and setup progress

### 2. Workflows

Purpose:
- workflow inventory and lifecycle management

Expected sections:
- list and filters
- ownership and scope
- status and schedule
- last run and health
- template provenance
- bulk actions

### 3. Studio

Purpose:
- workflow and agent authoring surface

Expected sections:
- canvas
- node picker
- inspector panel
- mapping panel
- run controls
- execution trace drawer
- publish and environment status

### 4. AI Agents

Purpose:
- top-level agent inventory and governance

Expected sections:
- agent list
- agent create and duplicate
- connection and provider model
- instructions and policy
- knowledge and context
- tools and MCP access
- testing and training
- usage and ownership

### 5. Templates

Purpose:
- reusable automation entry points

Expected sections:
- catalog
- search and tags
- preview
- source metadata
- audience scope
- create-from-template flow

### 6. Executions

Purpose:
- runtime history and debugging

Expected sections:
- execution list
- filters
- replay and rerun
- incomplete runs
- detailed trace
- errors and retry visibility

### 7. Assets

Purpose:
- reusable resources and shared infrastructure

Suggested subsections:
- credentials
- connections
- variables
- webhooks
- data stores
- data structures
- knowledge assets
- MCP toolboxes

### 8. Integrations

Purpose:
- discover external apps and integration capabilities

Expected sections:
- app catalog
- verified versus community apps
- deprecated or upgraded modules
- onboarding guidance

### 9. Providers

Purpose:
- configure AI and model infrastructure

Expected sections:
- provider inventory
- connection health
- available models
- cost and capability notes
- provider policy

### 10. Environment

Purpose:
- runtime and publish boundary management

Expected sections:
- staging and production
- publish state
- approval state
- runtime safety checks
- environment-specific assets

### 11. Org and Team

Purpose:
- tenancy and collaboration management

Suggested subsections:
- organizations
- teams
- members
- roles
- access policies
- consumption visibility

### 12. Observability

Purpose:
- platform-wide operations and trust surfaces

Suggested subsections:
- audit log
- activity log
- notifications
- system status
- usage analytics

### 13. Billing

Purpose:
- commercial and quota management

Suggested subsections:
- plan
- credit or usage model
- invoices
- payment methods
- consumption by scope

### 14. Help and API

Purpose:
- self-service learning and developer access

Suggested subsections:
- help center
- API playground
- docs and examples
- changelog or release notes

### 15. Settings

Purpose:
- global configuration entry

Suggested subsections:
- profile settings
- notifications
- security
- API access
- org settings
- workspace settings
- environment settings

## Important placement rules

- AI Agents must stay visible in primary navigation, not buried under Studio only.
- Assets should be grouped as a reusable governance layer, not scattered across random pages.
- Environment and publish state should be visible from both Settings and Studio.
- Workflows and Executions should be separate surfaces.
- Billing and usage should be top-level enough to be discoverable by operators and admins.
- Teams and roles must live above individual workflows.

## Likely FlowHolt-specific divergence

FlowHolt should probably lean more than Make toward:
- stronger AI-agent centrality
- clearer environment and publish boundaries
- more explicit tool and knowledge governance
- a future n8n-like focus on flexible automation logic combined with stronger agent orchestration
