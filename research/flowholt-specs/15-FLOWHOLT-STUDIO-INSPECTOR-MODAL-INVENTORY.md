# FlowHolt Studio Inspector And Modal Inventory

This file turns the Studio anatomy draft into a more exact inventory of tabs, drawers, overlays, quick actions, and object-specific inspectors.

It is grounded in:
- Make help-center references
- local Make screenshots captured in the scraped corpus
- current FlowHolt Studio code, especially:
  - `src/components/studio/TopBar.tsx`
  - `src/components/studio/NodeConfigPanel.tsx`
  - `src/components/studio/StatusBar.tsx`
  - `src/components/studio/StudioCommandBar.tsx`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| Make editor UI crawl | `research/make-advanced/` | §All inspectors and modal inventory |
| Make crawl — scenario header | `research/make-advanced/01-root-exploration/` | 26-element scenario header dropdown |
| Make crawl — bottom toolbar | `research/make-advanced/02-bottom-toolbar/` | 11-button toolbar detail |
| Make crawl — node insert | `research/make-advanced/03-node-insert/` | App search overlay |
| Make crawl — node settings | `research/make-advanced/04-node-settings/` | Node configuration inspector |
| Make crawl — AI copilot | `research/make-advanced/08-ai-copilot/` | AI assistant panel |
| Make screenshot — AI agent | `research/make-help-center-export/assets/images/FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png` | AI node inspector tabs |
| Make enhanced notes | `research/make-help-center-export/pages_markdown/enhanced-notes-and-team-level-operations-management.md` | Notes modal |
| n8n NDV inspector | `n8n-master/packages/editor-ui/src/components/NDV/` | Input/Output dual-panel |
| n8n keybindings | `n8n-master/packages/editor-ui/src/composables/useCanvasKeyboardShortcuts.ts` | Canvas keyboard shortcuts |
| n8n context menu | `n8n-master/packages/editor-ui/src/composables/useContextMenu.ts` | Right-click context menu items |
| n8n node panel | `n8n-master/packages/editor-ui/src/components/NodePanel/` | Node type picker panel |

### n8n inspector comparison

| Inspector element | n8n | FlowHolt |
|------------------|-----|----------|
| Node config panel | NDV with Input / Output dual tabs | Adapt: per-object inspector with Output tab |
| Input panel | Schema / Table / JSON views in NDV | Adopt all 3 views |
| Output panel | Same 3 views | Adopt |
| Node settings tab | Settings tab in NDV | Promote to persistent tab |
| Evaluation tab | Evaluation tab for AI nodes | Add for agent workflows |
| Canvas context menu | Right-click: Duplicate/Delete/Disable/Pin/Rename | Adopt all items |
| Node search panel | `n8n-master/packages/editor-ui/src/components/NodePanel/` | Adopt: search overlay on `+` button |

### This file feeds into

| File | What it informs |
|------|----------------|
| `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | Anatomy → inspector modes |
| `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | Surface spec |
| `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Tab states per role |
| `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` | Node family tab exceptions |
| `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | Studio route components |

---

The final Studio should feel like one coordinated operating environment, not a canvas plus random popups.

Every control must belong clearly to one of these layers:
- workflow-wide controls
- canvas authoring controls
- selected-object controls
- runtime inspection controls
- release and environment controls

## Persistent Studio surfaces

### 1. Top header

Current FlowHolt evidence already includes:
- workflow breadcrumb
- workflow rename
- workflow status pill
- workspace chip
- saved or saving state
- `Editor` and `Runs` tabs
- export and import
- workflow settings
- command bar
- assistant entry
- share action
- notifications
- collaborator avatars
- profile menu

Planned final header groups:

Left group:
- workspace or team breadcrumb
- workflow name
- workflow type badge
- draft or published state
- environment chip

Center group:
- editor and runs switch
- branch or version selector later
- comparison mode entry later

Right group:
- save state
- command palette
- workflow settings
- assistant
- share
- notifications
- collaborators
- profile

Do not place dangerous runtime actions in the top header if they belong in the bottom run bar.

### 2. Left build rail

The left-side build rail should be compact by default and expandable.

It should expose:
- add node
- search nodes
- recent nodes
- AI nodes
- integrations
- templates and snippets
- variables and data structures
- managed agents
- toolboxes and MCP tools

Interaction model:
- single-click opens an insertion drawer
- drag-drop is optional but not required for first maturity pass
- keyboard insertion must remain first-class through command palette

### 3. Main canvas

The canvas remains the primary graph surface.

It should include:
- clear trigger entry point
- branch labels
- node state rings
- selected path highlighting
- inline add buttons between steps
- zoom controls
- fit-to-screen
- mini-map later if graph scale demands it

### 4. Right inspector panel

The right inspector is the main selected-object authoring surface.

It must support these object modes:
- workflow
- standard node
- AI node
- branch or edge
- execution step
- agent attachment
- asset binding

### 5. Bottom operation bar

The bottom bar should stay visible in empty, editing, and runtime states.

**Make crawl evidence** (from `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md`):
Make's bottom bar (`<imt-toolbar>`, test ID `inspector-toolbar`) has exactly 11 buttons:

| Button | Make test ID | FlowHolt equivalent |
|---|---|---|
| Run once | `btn-inspector-run-once` | Run once (primary CTA) |
| Run with existing data | `btn-inspector-run-with-existing-data` | Replay with pinned data |
| Scheduling | `btn-inspector-scheduling` | Schedule state pill |
| Explain flow (AI) | `btn-inspector-explain-flow` | AI explain (new, adopt) |
| Save | `btn-inspector-save` | Save version |
| Auto-align | `btn-inspector-autoalign` | Auto-arrange nodes |
| History | `btn-inspector-history` | Version history |
| Notes | `btn-inspector-notes` | Workflow notes |
| Scenario I/O | `btn-inspector-scenario-io` | Workflow I/O config |
| Scenario settings | `btn-inspector-scenario-settings` | Workflow settings |
| Add to favorites | `inspector-add-favorites` | Favorite workflow |

Additionally, the scheduling area contains a toggle switch (`i-inspector-scheduling-switch`) and description text (`scheduling-description`), displaying "Every 15 minutes" inline.

Primary controls (FlowHolt plan, informed by Make evidence):
- `Run once`
- run with sample or pinned data
- stop current run
- replay menu
- schedule state (inline toggle + description)
- explain flow (AI) — new, inspired by Make

Secondary controls:
- version save
- publish or request promotion
- workflow settings shortcut
- workflow I/O configuration
- auto-align nodes
- test data tools
- notes
- comments later
- history
- favorites
- undo and redo
- environment quick switch

### 6. Runtime drawer

The runtime drawer should open from the bottom or side depending on screen width.

Primary tabs:
- Runs
- Trace
- Output
- Logs
- Reasoning

This drawer should never replace the whole Studio unless the user deliberately switches to a full execution page.

## Inspector modes

## Workflow inspector

Purpose:
- configure workflow-wide behavior without leaving Studio

Tabs:
- Overview
- Trigger
- Runtime
- Release
- Observability

### Workflow inspector: Overview

Fields:
- workflow name
- description
- category
- ownership scope
- tags
- template lineage

### Workflow inspector: Trigger

Fields:
- trigger type
- trigger exposure
- schedule summary
- webhook or chat endpoint summary
- test trigger tools

### Workflow inspector: Runtime

Fields:
- execution order
- timeout
- caller policy
- save failed executions
- save successful executions
- save manual executions
- save progress
- payload redaction policy
- concurrency policy later

This is strongly supported by current FlowHolt `WorkflowSettings` and workspace settings models.

### Workflow inspector: Release

Fields:
- current draft version
- last published version
- staging status
- production status
- compare changes
- request approval
- publish
- rollback later

### Workflow inspector: Observability

Fields:
- recent run summary
- success rate
- average duration
- recent failures
- linked alerts
- audit events for this workflow

## Standard node inspector

Current FlowHolt evidence already uses:
- `Parameters`
- `Settings`
- `Test`

That is a strong base and should be retained.

### Parameters tab

Purpose:
- node-specific business configuration

Expected section behaviors:
- required fields are always visible
- advanced sections are collapsible
- bindable fields support fixed, mapped, or expression values
- dynamic fields load from provider schema
- empty required state is unmistakable

### Settings tab

Purpose:
- editor and execution behavior for the selected node

Sections:
- node settings from schema
- branch or connection settings
- move and reorder
- duplicate
- disable or bypass later
- delete

### Test tab

Purpose:
- isolated validation and preview

Capabilities already suggested by current FlowHolt code:
- test payload editor
- run test
- pinned data
- output viewer
- validation state
- preview source indicator

Planned additions:
- replay latest upstream payload
- choose environment for test
- compare output against schema later

## AI node inspector

AI node types should extend the standard inspector, not create a totally separate editing model.

Required tabs for `ai_agent` and nearby AI nodes:
- Parameters
- Tools
- Knowledge
- Runtime
- Test

### AI Parameters

Fields:
- instructions
- system policy
- prompt inputs
- model attachment
- output mode
- guardrails later

### Tools

Fields:
- attached tools list
- required versus optional tools
- tool permissions
- fallback behavior
- tool timeout later

### Knowledge

Fields:
- attached knowledge sources
- retrieval mode
- chunking strategy later
- memory binding
- freshness policy later

### Runtime

Fields:
- reasoning visibility policy
- structured output schema
- token or cost guardrails later
- conversation binding
- retry behavior

### AI Test

Fields:
- test prompt
- sample context
- tool trace
- reasoning trace if allowed
- final response
- structured output preview

## Edge and branch inspector

Selecting an edge should open a lightweight inspector instead of doing nothing.

Fields:
- branch label
- branch description
- condition summary
- routing priority later
- branch notes later

This matters because Make screenshots show branch labels doing real explanatory work.

## Execution-step inspector

Selecting a run step from the runtime drawer should open an execution-aware inspector.

Tabs:
- Summary
- Input
- Output
- Events
- Artifacts

Fields:
- status
- start and finish time
- duration
- environment
- payload redaction state
- pinned data source if relevant
- replay entry

## Overlay and modal inventory

These overlays should exist as planned product objects, not ad hoc popups.

**Make crawl evidence**: Make uses Angular CDK's overlay system (`cdk-overlay-container`, `cdk-overlay-pane`, `cdk-overlay-popover`) for all floating content. FlowHolt uses Radix UI primitives which are more composable — no change needed, but the overlay stacking pattern (`data-overlay-group`) from Make is worth adopting for complex multi-level overlays.

**Make toast system** (discovered by crawl): test IDs `toast-message-1`, `toast-message-body`, `toast-message-close-btn`, `toast-message-content`, `toast-message-icon`, `toast-message-title`. Structure: icon + title + body + close button. FlowHolt should adopt this same toast structure.

### 1. Node insertion drawer

**Make crawl evidence**: Make has an `app-search-floating-overlay` that floats over the canvas for module search. This is separate from the left rail — it's a search-first overlay triggered by the add-module action.

Contains:
- search
- grouped categories
- AI cluster block
- recent items
- favorites later

### 2. Workflow settings modal

Current FlowHolt already hints at this.

Contains:
- runtime defaults
- trigger policies
- data retention
- observability switches
- release rules

### 3. Credential picker

Contains:
- available credentials
- scope badge
- visibility badge
- health state
- test status
- create new

### 4. Credential create overlay

Current FlowHolt already has this pattern.

Contains:
- provider selection
- auth fields
- validation or verify
- save with visibility policy

### 5. Expression builder dialog

Current FlowHolt already has this pattern.

Contains:
- searchable data references
- output preview
- validation hints
- expression mode and literal mode switch

### 6. Data viewer drawer

Contains:
- input payload
- output payload
- pinned data
- redact or reveal markers

### 7. Replay dialog

Contains:
- replay mode
- same version versus current draft versus latest published
- payload override
- environment target
- queue now versus open review later

Current backend models already support replay mode planning directly.

### 8. Publish or promotion modal

Contains:
- target environment
- version summary
- diff summary
- approval status
- warnings
- confirm or request approval

### 9. Share modal

Current FlowHolt already has this, but it must mature.

Contains:
- internal link
- role suggestions
- environment or draft visibility
- copy link
- audit note later

### 10. Command palette

Current FlowHolt already has a grouped command bar.

Final command groups should include:
- navigation
- workflow actions
- insert nodes
- run and replay
- selection actions
- environment and release
- observability

### 11. Floating AI assistant panel

**Make crawl evidence** (new discovery): Make has a floating AI copilot button (`<ai-copilot-button>` → `<ai-resources-button>` → `button#resources-button`) at bottom-right of the editor. This opens an AI resource panel that is separate from the toolbar "Explain flow" button and from the AI Agent node inspector. It is a persistent, always-available AI entry point.

Contains:
- AI chat interface
- resource suggestions
- contextual help
- flow explanation
- potential AI-assisted module configuration

FlowHolt should plan this as a persistent Studio overlay accessible via floating button, integrating with the existing assistant/chat panel.

### 12. Help dropdown overlay

**Make crawl evidence** (audit gap): `help-dropdown-button` triggers an overlay with 29 new elements and 4 nested overlays. Includes:
- Documentation links (`fa-book-open`)
- Make Academy link
- Community forum link
- Changelog / release notes
- Keyboard shortcuts reference
- Chameleon helpbar trigger (`data-chmln-helpbar-trigger-attached`)
- Support / contact links

FlowHolt should plan a Help dropdown overlay in the top-right header containing:
- Documentation (external link)
- Keyboard shortcuts (opens shortcuts dialog)
- Community / support links
- Changelog (external link)
- Version info

### 13. Notifications overlay

**Make crawl evidence** (audit gap): `notifications-link` with `fa-bell` icon triggers a dropdown overlay with 33 new elements and 3 nested overlays. Shows:
- Unread notification count badge
- Notification list (fetched from `GET /api/v2/notifications`)
- Per-team notifications (fetched from `GET /api/v2/users/user-team-notifications/:id`)
- Mark-as-read action
- Notification preferences link

FlowHolt should plan a Notifications overlay containing:
- Unread count badge on bell icon
- Scrollable notification list with read/unread state
- Notification type icons (execution failure, deployment, team invite, etc.)
- "Mark all as read" action
- Link to full notification settings page

### 14. Profile dropdown overlay

**Make crawl evidence** (audit gap): `profile-dropdown-button` (shows user initials "TJ") triggers an overlay with 11 new elements, 4 nested overlays, and 3 tooltips. Contains:
- User display name and email
- Theme toggle (light/dark)
- Language / locale selector
- Notification preferences link
- Billing / subscription link
- Organization settings link
- Logout action

FlowHolt should plan a Profile dropdown overlay containing:
- Avatar / initials + display name + email
- Theme toggle
- Language / locale selector
- Link to user settings page
- Link to workspace settings
- Logout action

## Context menus

Studio should have right-click or secondary-action menus for:
- canvas
- node
- edge
- run step
- asset reference

Node context actions:
- rename
- duplicate
- disable later
- run from here where valid
- inspect latest output
- delete

## Empty-state rules

The Studio empty state must still show:
- top header
- build rail
- bottom run bar
- command palette access
- add-first-node call to action

It should feel like the same product mode as a populated workflow, not a landing page.

## Current FlowHolt alignment summary

FlowHolt already has strong foundations for this final plan:
- a structured top header
- a command palette
- a rich node inspector
- expression builder and credential overlays
- pinned data and node test patterns
- a status bar and run-aware surfaces

The main planning job now is to normalize these into a deliberate Studio contract with clear object types, predictable overlays, and release-aware runtime behavior.

---

## n8n NDV cross-reference (from `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`)

### NDV (Node Detail View) — n8n's inspector paradigm

n8n's NDV is the most distinctive UI pattern to adopt. It uses **side-by-side input/output panels** while editing node parameters. Structure:

```
NDVDraggablePanels (resizable left/right split)
├── Left: InputPanel
│   ├── InputNodeSelect — pick which upstream node's output to preview
│   ├── Data table/JSON/schema views of incoming data
│   └── TriggerPanel — special panel for trigger nodes
├── Right: OutputPanel
│   ├── Data table/JSON/schema views of execution result
│   └── Run-to-see-output placeholder before execution
├── Center/overlay: Parameter form
│   ├── ParameterInputList — main parameter form
│   ├── ExpressionParameterInput — inline expression editor
│   └── ResourceLocator — resource picker with search
└── Floating: NDVFloatingNodes, NDVSubConnections (AI tool sub-graph)
```

### FlowHolt adoption plan

FlowHolt's `NodeConfigPanel` should evolve toward the NDV dual-panel pattern:
1. **Phase 1**: Keep current single-panel inspector but add an "Input" tab showing upstream node output
2. **Phase 2**: Split into resizable left (input) / right (output) panels with center parameter overlay
3. **Phase 3**: Add floating sub-connection panel for AI agent cluster nodes

### n8n modal inventory comparison

n8n has 47 modal keys. Key ones FlowHolt should plan:

| n8n modal | FlowHolt equivalent | Status |
|---|---|---|
| `workflowSettings` | Workflow settings dialog | ✅ Exists as dialog, plan to promote to tab |
| `workflowShare` | Share workflow dialog | 🟡 Planned |
| `workflowDiff` | Workflow diff viewer | 🟡 Planned in deployment flow |
| `workflowDescription` | Workflow description editor | 🔴 New — add to plan |
| `workflowPublish` | Deployment confirmation | 🟡 Planned |
| `importWorkflowUrl` | Import from URL | 🔴 New — add to plan |
| `importCurl` | Import cURL as HTTP node | 🔴 New — useful for HTTP nodes |
| `chatEmbed` | Chat embed config | 🔴 New — for AI agent chat embedding |
| `duplicate` | Duplicate workflow | 🟡 Planned |
| `fromAiParameters` | AI-generated parameters | 🔴 New — AI fills in node params |
| `npsSurvey` | NPS feedback collection | 🔴 New — consider for post-launch |
| `activation` | Workflow activation confirmation | 🟡 Planned |
| `aiBuilderDiff` | AI workflow builder diff | 🔴 New — shows AI-generated changes |
| `binaryDataView` | Binary data viewer | 🔴 New — for file/image preview |
| `credentialResolverEdit` | Dynamic credential resolver | 🔴 New — enterprise feature |
| `stopManyExecutions` | Bulk stop running executions | 🔴 New — add to execution management |
| `workflowExtractionName` | Extract sub-workflow | 🔴 New — refactoring tool |
| `whatsNew` | What's new announcements | 🔴 New — version update comms |

### New modals to add to FlowHolt plan

Priority additions from n8n:
1. **Workflow description modal** — rich text description for documentation
2. **Import from URL** — paste a workflow URL to import
3. **Import cURL** — paste cURL command to create HTTP request node
4. **AI parameter fill** (`fromAiParameters`) — AI suggests parameter values
5. **Binary data viewer** — preview files, images, PDFs inline
6. **Extract sub-workflow** — select nodes and extract into a reusable sub-workflow
7. **Chat embed config** — generate embed code for AI agent chat widget
8. **AI builder diff** — show what the AI workflow builder changed

### n8n FocusPanel pattern

n8n has a `FocusPanel` component (22KB) that manages which panel has keyboard focus. The `focusPanel.store.ts` (7KB) tracks:
- Which panel is active (input, output, parameters, logs)
- Panel visibility state
- Panel transition animations

FlowHolt should implement a similar focus management system for keyboard navigation between inspector panels.
