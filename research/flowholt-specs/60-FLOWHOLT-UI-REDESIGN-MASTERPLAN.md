# FlowHolt UI Redesign Masterplan

> **Status:** New master redesign file created 2026-04-17  
> **Purpose:** Define the complete from-scratch UI redesign direction for FlowHolt and tie the existing research corpus to the new implementation-grade planning system.  
> **Primary references:** Make.com help-center export, Make editor crawl, n8n source research, n8n UI catalog, FlowHolt planning files 03, 07, 11, 37, 38, 40, 46, 59.

---

## 1. Why this file exists

FlowHolt already has strong research, but that research is fragmented across many files and was partly written while the current UI still existed as a reference point. The redesign now needs a new source of truth that assumes:

1. The current UI is disposable.
2. The next UI is planned from scratch.
3. Make.com is the primary reference for navigation scale, control-plane framing, and operator visibility.
4. n8n is the primary reference for workflow-building ergonomics, debugging, node detail workflows, and authoring efficiency.
5. FlowHolt must still look and feel like FlowHolt, not like a clone.

This file is the top-level contract for that redesign.

---

## 2. Product UI thesis

FlowHolt should feel like:

- **Make** at the product-shell level: domain-first navigation, operational clarity, visible assets, visible runtime surfaces, visible organization controls.
- **n8n** in the authoring loop: workflow tabs, node detail depth, debug visibility, data mapping, execution-oriented editing.
- **Claude / Cursor / modern agent tools** in visual tone: restrained surfaces, sharp hierarchy, generous spacing, black primary controls, low-noise panels.
- **FlowHolt** in identity: green used as a sparse signal color tied to the logo and system health, not as a generic branding flood.

---

## 3. Non-negotiable redesign rules

1. **Do not preserve current layout assumptions.** Existing page layouts are implementation artifacts, not planning constraints.
2. **Do not flatten the product into one generic dashboard.** FlowHolt is a control plane with multiple operator domains.
3. **Do not hide Vault, runtime, or AI as secondary features.** They are first-class product surfaces.
4. **Do not use green as a dominant fill color.** Green is reserved for activation, healthy state, success, and selected emphasis dots.
5. **Do not force Studio to own everything.** Studio is the authoring surface, not the only place to manage workflows, agents, assets, runtime, or governance.
6. **Do not design pages as one-offs.** Every page must be built from reusable shell, list, detail, drawer, and feedback patterns.
7. **Do not separate visual planning from data/governance planning.** Secrets, approvals, scopes, roles, and execution visibility must shape UI.

---

## 4. Competitor pattern matrix

| Surface | Primary reference | Why |
|---|---|---|
| Global navigation | Make | Better at scale, clearer domain framing |
| Studio tabs | n8n | Clear authoring / execution / evaluation separation |
| Node detail workflow | n8n | Best-in-class debugging and mapping affordances |
| Bottom run bar | Make | Strong persistent execution controls |
| Floating AI affordance | Make | Keeps assistance visible without hijacking the editor |
| Asset and connection visibility | Make | Better operational discoverability |
| Execution inspection | n8n + Make | n8n for node-level debug, Make for operator summaries |
| Organization analytics | Make | Better admin framing and credit visibility |
| Workflow publish/version states | n8n | Stronger draft/publish semantics |
| Design tone | FlowHolt + Claude/Cursor | Cleaner, calmer, more modern than either competitor |

---

## 5. Canonical layout families

The redesign uses seven layout families:

1. **AuthLayout** - login, signup, invite accept, workspace selection
2. **AppShellLayout** - primary signed-in experience with left rail, secondary pane, page header, content
3. **StudioLayout** - full-screen authoring surface
4. **SettingsLayout** - scoped settings pages with inheritance context
5. **EntityDetailLayout** - AI agent detail, connection detail, execution detail, webhook detail
6. **OperationsLayout** - runtime, queues, failures, audit, analytics, system status
7. **PublicTriggerLayout** - public chat, hosted forms, webhook/docs landing pages

Every route must map to one of these layout families.

---

## 6. Canonical product domains

### Workspace-facing domains

1. Home
2. Workflows
3. AI Agents
4. Templates
5. Executions
6. Vault
7. Webhooks
8. Data
9. Providers
10. Operations
11. Environment
12. Help / API

### Tenant-facing domains

1. Organization
2. Team
3. Billing
4. Security
5. Policies

### Studio-facing domains

1. Workflow
2. Executions
3. Evaluation
4. Settings

---

## 7. Core information architecture decisions

### 7.1 Navigation model

FlowHolt adopts a **Make-like domain rail** with a **context pane**:

- a compact first-level icon rail on the far left
- a secondary contextual pane next to it
- a page header/content region on the right

This keeps the product scalable without forcing every page into a flat sidebar list.

### 7.2 Vault model

Vault is a **single domain** with internal tabs:

- Credentials
- Connections
- Variables
- External Secrets
- MCP Servers

The old distinction between `/credentials`, `/connections`, and `/variables` is retained only as compatibility routing during migration.

### 7.3 Executions model

There are two execution scopes:

- **Global executions surface** for workspace/team/operator visibility
- **Studio executions tab** for workflow-specific debugging

These are related, but not the same page.

### 7.4 Settings model

Settings are no longer one page with miscellaneous tabs. They are scoped:

- User
- Organization
- Team
- Workspace
- Environment
- Workflow
- Agent

Each scope shows inheritance from its parent where relevant.

### 7.5 AI model

AI agents are both:

- a product entity managed from the AI Agents domain
- a workflow runtime element represented inside Studio

This dual model is mandatory and should not be collapsed.

---

## 8. Visual identity decisions

### Tone

- white and silver base surfaces
- black primary actions
- quiet gray structure
- green only for meaningful state

### FlowHolt-specific signals

- green dot = active / healthy / current
- green badge = success / completed
- black card or black header chip = AI / powerful / system-level
- no purple as a primary UI system color

### Surface strategy

- page background: white
- raised panels: off-white / zinc-50
- heavy emphasis panels: white with stronger border
- overlays: white with stronger shadow, never translucent neon

---

## 9. What the redesign system must specify

The redesign is not complete unless it fully specifies:

1. app shell
2. navigation
3. layout families
4. route hierarchy
5. page headers
6. filters and list pages
7. tables and cards
8. forms and field groups
9. empty states
10. loading states
11. validation and error states
12. toasts, banners, inbox notifications
13. Studio shell
14. node creator
15. canvas
16. inspector
17. execution drawer
18. bottom run bar
19. Vault and connections
20. webhooks and queue views
21. analytics
22. audit and runtime operations
23. settings scopes
24. AI agent management
25. template gallery
26. providers and models
27. responsive rules
28. accessibility baseline
29. keyboard model
30. rollout order

---

## 10. New redesign file system

| File | Purpose |
|---|---|
| `60-FLOWHOLT-UI-REDESIGN-MASTERPLAN.md` | top-level redesign contract |
| `61-FLOWHOLT-DESIGN-TOKENS-AND-COMPONENT-LIBRARY.md` | all UI primitives and reusable patterns |
| `62-FLOWHOLT-APP-SHELL-AND-NAVIGATION-REDESIGN.md` | global shell, navigation, page chrome |
| `63-FLOWHOLT-STUDIO-REDESIGN-FROM-SCRATCH.md` | full Studio redesign |
| `64-FLOWHOLT-VAULT-CONNECTIONS-AND-VARIABLES-UX.md` | Vault and asset system UX |
| `65-FLOWHOLT-SETTINGS-ADMIN-OBSERVABILITY-UX.md` | settings, admin, runtime, analytics, alerts |
| `66-FLOWHOLT-AI-AGENTS-TEMPLATES-AND-PROVIDERS-UX.md` | AI entity surfaces, templates, providers |
| `67-FLOWHOLT-PAGE-BY-PAGE-REDESIGN-INVENTORY-AND-ROLLOUT.md` | page inventory, route map, execution order |

Where these files conflict with older UI planning notes, the newer 60-67 series wins.

---

## 11. Relationship to existing planning files

Keep these files as research inputs, not as the final redesign system:

- `03-FLOWHOLT-IA-SKELETON.md`
- `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md`
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md`
- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md`
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md`
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md`
- `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md`
- `59-FLOWHOLT-UI-DESIGN-SYSTEM-AND-LAYOUT-SPEC.md`
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md`
- `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`
- `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md`

---

## 12. Immediate planning priorities

### Priority 1

- define reusable design tokens and component rules
- define shell/navigation architecture
- define Studio from scratch
- define Vault / connections from scratch

### Priority 2

- define settings/admin/observability surfaces
- define AI agents / templates / providers surfaces

### Priority 3

- define page-by-page route and rollout map
- convert redesign into implementation phases

---

## 13. Default assumptions for future sessions

Unless a later file overrides them:

1. desktop web is primary
2. dark mode is secondary, not blocker
3. accessibility baseline is WCAG AA
4. route structure may evolve, but shell/domain logic comes first
5. FlowHolt should exceed both competitors in AI, environment governance, and Vault clarity

---

## 14. Exit condition for planning

Planning is complete only when:

- every major surface has a detailed markdown spec
- every repeated element has a reusable component rule
- every page family has a consistent shell
- Studio, Vault, and settings all align with the same design system
- there is a page-by-page rollout map for implementation

Until then, research is still feeding planning.
