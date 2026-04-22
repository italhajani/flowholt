# FlowHolt Studio Anatomy Draft

This file deepens the Studio skeleton into a more exact surface plan using:
- Make help-center references
- current FlowHolt Studio code structure
- local Make UI screenshots captured in the scraped asset set
- **Make editor UI crawl** (2026-04-14): automated Playwright crawl of live Make editor — see `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it provides |
|--------|----------|-----------------|
| Make UI crawl baseline | `research/make-advanced/00-baseline/` | Full editor screenshots: `screenshot-full-page.png`, DOM: `dom-snapshot.html`, element inventory: `element-inventory.json`, network log |
| Make UI crawl interactions | `research/make-advanced/01-root-exploration/` through `09-*/` | Per-interaction screenshots, DOM snapshots, discovered elements |
| Make crawl element catalog | `research/make-advanced/06-aggregate-element-catalog/element-catalog.json` | All 1000+ distinct element types found |
| Make UI screenshot — AI agent view | `research/make-help-center-export/assets/images/FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png` | AI agent node in Make editor canvas |
| Make UI screenshot — Run bar | `research/make-help-center-export/assets/images/E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png` | Bottom run bar detail |
| Make UI screenshot — Empty state | `research/make-help-center-export/assets/images/Zusz0Qbp3EP67xJ3qK7cl-20251003-145143__30f711290366.png` | Empty canvas state |
| Make help: enhanced notes | `research/make-help-center-export/pages_markdown/enhanced-notes-and-team-level-operations-management.md` | Notes panel, scenario IO |
| n8n UI element catalog | `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` | All n8n canvas/inspector elements with source Vue file paths |
| n8n source: tab bar | `n8n-master/packages/editor-ui/src/components/MainHeader/MainHeader.vue` | Per-workflow tabs: Workflow / Executions / Settings / Evaluation |
| n8n source: NDV panels | `n8n-master/packages/editor-ui/src/components/NDV/` | Input/Output dual-panel inspector |
| n8n source: canvas | `n8n-master/packages/editor-ui/src/components/NodeView.vue` | Canvas root component |
| n8n source: sidebar | `n8n-master/packages/editor-ui/src/components/MainSidebar.vue` | Resizable sidebar |
| n8n source: collaboration | `n8n-master/packages/editor-ui/src/composables/useCollaborationState.ts` | Edit lock, presence indicators |
| n8n source: pin data | `n8n-master/packages/editor-ui/src/stores/pinData.store.ts` | Data pinning store |
| n8n source: sticky notes | `n8n-master/packages/editor-ui/src/components/StickyNote/` | Canvas sticky notes |

### This file feeds into

| File | What it informs |
|------|----------------|
| `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | Canvas architecture, inspector design |
| `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` | Inspector modes + modal inventory |
| `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Tab states and role visibility |
| `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` | Node family tab exceptions |
| `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | Studio route `/studio/:id` spec |
| `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | INPUT panel drag-to-expression UX |

### n8n comparison sources

| n8n pattern | Source file | FlowHolt decision |
|-------------|------------|------------------|
| Per-workflow tabs (4 tabs) | `n8n-master/packages/editor-ui/src/components/MainHeader/MainHeader.vue` | Adopt: Workflow / Executions / Settings / Evaluation |
| NDV dual input/output panel | `n8n-master/packages/editor-ui/src/components/NDV/` | Adopt dual-panel inspector |
| Resizable sidebar | `n8n-master/packages/editor-ui/src/components/MainSidebar.vue` | Adopt: resizable 200–500px, persist to localStorage |
| Collaboration pills on canvas | `n8n-master/packages/editor-ui/src/components/CanvasCollaborationPill.vue` | Adopt: presence indicators in edit lock mode |
| Sticky notes | `n8n-master/packages/editor-ui/src/components/StickyNote/` | Adopt: resizable sticky notes on canvas |
| 7 layout types | `n8n-master/packages/editor-ui/src/router/index.ts` | Plan: `DefaultLayout`, `StudioLayout`, `SettingsLayout`, `AuthLayout` |

### Make comparison sources (from crawl)

| Make pattern | Crawl evidence | FlowHolt decision |
|-------------|----------------|------------------|
| Left nav rail (80px, 11 items) | `research/make-advanced/00-baseline/dom-snapshot.html` → `<dmo-first-level-navigation>` | Adapt: resizable sidebar with workspace nav |
| Bottom toolbar (11 buttons) | `research/make-advanced/02-bottom-toolbar/` | Adopt: persistent bottom run bar |
| Floating AI copilot | `research/make-advanced/08-ai-copilot/` | Adopt: floating AI assistant panel |
| App search overlay | `research/make-advanced/03-node-insert/` | Adopt: `Cmd+K` node search overlay |
| Scenario header dropdown (26 elements) | `research/make-advanced/01-root-exploration/` | Adapt: workflow actions menu |
| Socket.IO real-time | `research/make-advanced/*/network-log*.json` | Decision: use WebSocket for execution state streaming |

---

- `D:\My work\flowholt3 - Copy\research\make-help-center-export\assets\images\FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png`
- `D:\My work\flowholt3 - Copy\research\make-help-center-export\assets\images\E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png`
- `D:\My work\flowholt3 - Copy\research\make-help-center-export\assets\images\Zusz0Qbp3EP67xJ3qK7cl-20251003-145143__30f711290366.png`

## Studio layout model

The final Studio should be planned as six persistent layout regions:

1. Global header
2. Insert and navigation rail
3. Main canvas
4. Context inspector
5. Runtime and trace drawer
6. Bottom run bar
7. Floating AI assistant (new — confirmed by Make crawl)

**Make crawl validation**: The live Make editor has exactly these regions: left nav rail (80px), scenario header, main canvas (`div#diagram.i-inspector.i-designer`), right slide-in sidebar (`<imt-sidebar-animate>`), bottom toolbar (`<imt-toolbar>`), and a floating AI copilot button.

## 1. Global header

Purpose:
- hold workflow identity, collaboration state, and workflow-level actions

Must eventually include:
- workflow name
- scope badge
- environment badge
- dirty or saved state
- version or draft state
- share action
- alternate view action
- open related assets action

Expected control groups:
- left: breadcrumb, workflow title, scope
- center: optional environment or version chips
- right: save, share, publish, replay, view switch

## 2. Insert and navigation rail

Purpose:
- give fast access to building blocks without leaving Studio

**Make crawl evidence**: Make's left navigation (`<dmo-first-level-navigation>`, 80px wide, full height) contains 11 first-level items:
- Organization, Scenarios, AI Agents (Beta), Credentials, Webhooks, MCP Toolboxes, Templates, Data stores, Devices, Data structures, Custom Apps

Note: In Make, this is workspace-level navigation, not node insertion. Node insertion uses a separate floating `app-search-floating-overlay`. FlowHolt should split these concerns similarly.

Must eventually support:
- node or module search (via floating overlay, like Make's `app-search-floating-overlay`)
- AI node insertion
- recently used modules
- templates or snippets later
- asset references
- command bar entry

Design direction:
- keep it compact by default
- allow expansion into a searchable panel
- support keyboard-first insertion

## 3. Main canvas

Purpose:
- act as the main automation map

Must eventually support:
- clear trigger start state
- readable branch labels
- distinct node visual language by function
- empty-state add affordance
- easy pan and zoom
- compact runtime highlights

Visual planning rules from Make screenshots:
- AI-capable nodes should be visually distinct from ordinary app modules
- action labels on edges help users understand business intent
- node numbers, step references, and states should stay readable without opening the inspector

## 4. Context inspector

Purpose:
- configure the selected object without replacing the canvas

Inspector modes should include:
- workflow mode
- node mode
- agent mode
- execution step mode

Inspector structure should eventually be tabbed:
- Overview
- Inputs
- Advanced
- Output
- Diagnostics

For AI-capable nodes, add:
- Instructions
- Tools
- Knowledge
- Runtime

## 5. Runtime and trace drawer

Purpose:
- let users inspect runs without leaving Studio

Must eventually support:
- run list
- active run state
- replay entry
- step-by-step trace
- branch visibility
- output and error payloads
- agent reasoning or tool timeline where allowed

Primary tabs should likely be:
- Output
- Trace
- Reasoning
- Logs

## 6. Bottom run bar

This is one of the clearest UI patterns from both screenshots and the live crawl.

Observed in screenshots:
- a strong primary `Run once` button on the left
- a compact schedule state pill next to it
- a horizontal strip of utility icons in the middle
- a colored quick-action cluster on the right

**Make crawl evidence** (exact button inventory, 11 buttons discovered):
`btn-inspector-run-once`, `btn-inspector-run-with-existing-data`, `btn-inspector-scheduling` (with `i-inspector-scheduling-switch` toggle + `scheduling-description`), `btn-inspector-explain-flow` (AI sparkles icon), `btn-inspector-save`, `btn-inspector-autoalign`, `btn-inspector-history`, `btn-inspector-notes`, `btn-inspector-scenario-io`, `btn-inspector-scenario-settings`, `inspector-add-favorites`.

Key discovery: **Explain flow (AI)** is a toolbar-level action, meaning Make treats AI explanation as a first-class editing tool, not a hidden feature.

Planning direction for FlowHolt:
- keep a persistent bottom run bar in Studio
- make `Run once` the dominant test action
- keep schedule visibility always present
- place workflow utilities close to run actions, not hidden in random menus

### Proposed bottom bar groups

Left group:
- Run once
- Run with existing data
- Stop
- Schedule state

Middle group:
- save version
- workflow settings
- replay entry
- test data tools
- comments or notes later
- undo and redo

Right group:
- environment quick switch
- asset quick access
- notifications
- quick add
- collapse or expand side surfaces

## Node interaction model

### Default click
- select node
- open inspector
- highlight incoming and outgoing edges

### Secondary actions
- duplicate
- delete
- disable or bypass later
- run this node only where valid
- inspect previous output

### Runtime node states
- idle
- ready
- running
- waiting
- succeeded
- failed
- paused
- skipped
- replayed

## Workflow-level actions

FlowHolt Studio should eventually support:
- run once
- run with existing data
- open history
- replay a run
- view current draft
- compare with published
- publish to environment
- duplicate workflow
- start from template

## Mapping interaction model

Inspired by Make module settings and mapping UX:
- every eligible field can be fixed, mapped, or AI-decided where relevant
- required fields must stay visually prominent
- advanced fields must collapse cleanly
- field data types must be explainable on hover or inline
- mapping should not force users to leave context

## Agent authoring inside Studio

For AI-heavy flows, Studio should support:
- selecting a managed agent from inventory
- opening agent policy in the inspector
- exposing attached tools and knowledge
- showing conversation ID or memory binding
- choosing text versus structured output
- viewing reasoning and tool traces after a test run

## Planned modal and overlay set

The final Studio plan should expect these overlays:
- workflow settings modal
- node insert panel
- connection create dialog
- credential picker
- expression builder
- output schema builder
- replay selection dialog
- publish confirmation modal
- environment promotion modal

## 7. Floating AI assistant

**Make crawl evidence** (new discovery): A floating AI copilot button (`<ai-copilot-button>`, `button#resources-button`) lives at bottom-right (1532, 936) of the editor, always visible. This is separate from both the toolbar "Explain flow" button and the AI Agent node inspector. It opens an AI resource panel for contextual assistance.

FlowHolt should plan a persistent floating AI entry point in Studio that connects to the existing assistant/chat panel.

## Current FlowHolt alignment

Current repo evidence already supports this direction:
- top bar exists
- nodes panel exists
- workflow canvas exists
- node config panel exists
- chat panel exists (maps to Make's AI copilot panel)
- status bar exists
- workflow settings modal exists
- command bar exists

The planning task now is to make those surfaces intentional, complete, and role-aware.

## Crawl-informed additions to plan

The Make editor crawl confirms and adds:
1. **Bottom bar is exactly 11 buttons** — FlowHolt should target a similar density, not more.
2. **AI has 3 entry points in Make**: copilot button, explain flow, AI agent nodes. FlowHolt should plan equivalent coverage.
3. **Left navigation has 11 first-level items** — all major entity types are top-level, not buried.
4. **Inline scenario title editing** — confirmed as the right pattern (not a modal rename).
5. **Scenario header dropdown** yields 26 new elements — a rich actions menu. FlowHolt should plan a similar workflow actions menu.
6. **Feature flags** are fetched on every page load — FlowHolt should build feature flags from the start.
7. **Real-time via Socket.IO** — FlowHolt should plan WebSocket streaming for execution state.
8. **Header-bar has 3 persistent controls** (from audit): notifications bell (`notifications-link`), help dropdown (`help-dropdown-button`), profile dropdown (`profile-dropdown-button`). These are top-right and visible on every page. FlowHolt should include all three — see file 15 overlays #12–14.
9. **Workspace switcher** (`navigation-picker-trigger`) sits at top of the left nav rail — see file 36 section 13 for spec.
10. **Page title H1** (`page-title-h1`) is a consistent pattern on every list/settings page.

## List page contract (from audit)

Scenario and asset list pages (Scenarios, AI Agents, Credentials, Webhooks, MCP Toolboxes, Templates, Data stores, Devices, Data structures, Custom Apps) share a common UI pattern:

### Page header
- `ui-header` with `page-title-h1` (page title)
- `ui-header-tabs` for optional sub-tabs (e.g., Diagram / History / Incomplete)
- `btn-create-scenario` or equivalent create action

### Filtering and sorting
- **Filter control**: `btn-filter-by` (`fa-bars-filter`) opens a filter panel (`scenario-filtering`, `_filter-panel_laeu6_2`)
- **Filter list**: `_filter-list_laeu6_12` with individual `_filter-item_laeu6_17` items, selected state `_selected_laeu6_35`
- **Sort control**: `btn-sort` (`fa-arrow-down-arrow-up`)

### Table / list display
- CDK table wrapper (`table-wrapper`, `cdk-table`)
- Column headers: `cdk-header-row` → `cdk-header-cell` with `table-column-*` test IDs (name, createdAt, credits, transfer, type)
- Data rows: `cdk-row` → `cdk-cell`
- **Virtual scroll** for large lists: `cdk-virtual-scroll-viewport` with `cdk-virtual-scroll-content-wrapper` and `cdk-virtual-scroll-spacer`
- **Drag-and-drop** support: `cdk-drag`, `cdk-drop-list` — for tree navigation and entity ordering

### Empty state
- `ui-list-empty-content` with `no-data-text` — shows a "no items yet" message with a call-to-action button
- Example (Data structures): "You haven't created any data structures yet"
- Example (MCP Toolboxes): "No toolboxes yet" + "Create toolbox" + "Learn more about MCP toolboxes"

### Content area routing
Each nav section renders into a scoped content area. Make uses `content-*` classes:
- `content-scenarios`, `content-agents`, `content-connections`, `content-hooks`, `content-vhosts`, `content-data-stores`, `content-devices`, `content-udts`, `content-notifications`, `content-dashboard`

### FlowHolt implementation plan
FlowHolt should implement a shared `<EntityListPage>` component with:
- Page header with title, create button, and optional tabs
- Filter bar with configurable filter fields
- Sort dropdown
- Virtual-scrolled data table with configurable columns
- Empty state slot
- Optional drag-and-drop for ordering

---

## n8n cross-reference (from `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`)

### Per-workflow tab bar

n8n has a 4-tab header per workflow: **Workflow | Executions | Settings | Evaluation**. This is a significant UX pattern absent from Make.

FlowHolt should adopt this:
| Tab | FlowHolt equivalent | n8n source |
|---|---|---|
| Workflow | Editor (already exists) | `MAIN_HEADER_TABS.WORKFLOW` |
| Executions | Runs tab (already exists) | `MAIN_HEADER_TABS.EXECUTIONS` |
| Settings | Workflow settings (currently modal) | `MAIN_HEADER_TABS.SETTINGS` |
| Evaluation | New — AI test runs | `MAIN_HEADER_TABS.EVALUATION` |

Decision: FlowHolt should promote Workflow Settings from a modal to a persistent tab when in workflow context. Evaluation tab should appear only for AI agent workflows.

### Resizable sidebar

n8n's sidebar is user-resizable (200–500px) using `N8nResizeWrapper` with drag handle. FlowHolt's sidebar should be resizable with persist-to-localStorage.

### Command bar (Cmd+K)

n8n triggers the command bar via `Cmd+K` from the sidebar header. The `N8nCommandBar` design system component handles this. FlowHolt's `StudioCommandBar` already exists — confirm it uses the same keyboard shortcut.

### Layout layers (n8n vs Make vs FlowHolt)

| Region | n8n | Make | FlowHolt plan |
|---|---|---|---|
| Left sidebar | Resizable, collapsible, project navigation | Fixed 80px nav rail | Resizable sidebar with project navigation |
| Header | Per-workflow tabs (4 tabs) | Scenario name + breadcrumb | Per-workflow tabs (adopt from n8n) |
| Canvas | Custom Vue canvas | Custom Angular canvas (`#diagram`) | @xyflow/react canvas |
| Right panel | NDV (dual input/output panels) | CDK slide-in sidebar | Node inspector (adopt dual-panel from n8n) |
| Bottom | — (no toolbar) | Bottom toolbar (10 buttons) | Bottom run bar |
| Floating | AI assistant chat panel | AI copilot button | Floating AI assistant panel |

### n8n layout constants

n8n uses 7 layout types: `DefaultLayout`, `WorkflowLayout`, `SettingsLayout`, `AuthLayout`, `DemoLayout`, `ChatLayout`, `InstanceAiLayout`. FlowHolt should plan at minimum: `DefaultLayout` (list pages), `StudioLayout` (canvas), `SettingsLayout`, `AuthLayout`.

### Collaboration indicators

n8n shows collaboration pills on the canvas (`CanvasCollaborationPill`) and thinking pills (`CanvasThinkingPill`). FlowHolt should plan similar presence indicators for multi-user editing.

### Sticky notes on canvas

n8n supports `N8nResizeableSticky` — resizable sticky notes on the canvas for annotations. FlowHolt should add this to the canvas plan.
