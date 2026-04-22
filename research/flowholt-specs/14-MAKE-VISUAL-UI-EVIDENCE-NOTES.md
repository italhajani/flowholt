# Make Visual UI Evidence Notes

This file records image-based observations from local screenshots in the scraped Make corpus, and dynamic UI observations from automated Playwright crawls. It is the primary **visual grounding layer** for FlowHolt Studio planning.

---

## Cross-Reference Map

### This file feeds into
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — Studio layout, toolbar, canvas structure
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` — every modal and overlay
- `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` — per-tab state
- `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` — node family exceptions
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` — page and route planning

### Peer research files (always read together)
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — full DOM/network/test-ID crawl analysis (2026-04-14)
- `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` — n8n architecture and feature deep dive
- `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` — n8n UI element-by-element catalog

### Raw source data
- **Make screenshots**: `research/make-help-center-export/assets/images/` — embedded product images from help articles
- **Make crawl data**: `research/make-advanced/` — Playwright interaction tree, DOM snapshots, screenshots per interaction step
  - `research/make-advanced/00-baseline/` — initial load state
  - `research/make-advanced/01-root-exploration/` — baseline + first-level interactions (button states, overlays)
  - Aggregate files: `research/make-advanced/catalog.json`, `network-summary.json`, `ui-taxonomy-aggregate.json`, `websocket-log.json`, `transitions.json`
- **Make help articles**:
  - `research/make-help-center-export/pages_markdown/key-concepts.md` — module types, bundles, operations
  - `research/make-help-center-export/pages_markdown/apps-and-modules.md` — app/module structure
  - `research/make-help-center-export/pages_markdown/scenario-execution-flow.md` — execution flow model
  - `research/make-help-center-export/pages_markdown/router.md` — router module UI and branching
  - `research/make-help-center-export/pages_markdown/make-grid-public-beta-is-now-live.md` — Make Grid view
  - `research/make-help-center-export/pages_markdown/new-navigation-now-live-for-all-users.md` — navigation revamp

---

## 1. Screenshot evidence from Make corpus

### 1.1 AI Agent node and run bar view

**Image**: `research/make-help-center-export/assets/images/FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png`

**Source article**: `research/make-help-center-export/pages_markdown/make-ai-agents-the-next-step-in-automation.md`

**Observed layout details**:
- AI Agent node has a **distinct purple visual identity** — separate color class from standard module nodes (which are blue/grey)
- Downstream tools are connected by **dotted semantic lines**, not solid connection lines — visual distinction between "tool chain" and "data flow"
- Branch labels are **short natural-language action descriptions** (e.g., "Get customer data", "Send notification") not generic boolean labels
- Bottom bar is **persistent across canvas states** — visible even when AI agent is the only node
- AI Agent node body shows the agent's name prominently, with a subtle "AI" badge

**Direct cross-reference to crawl data**:
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §6` — AI module package structure (`ai-local-agent`, `ai-tools`, etc.)
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §2e` — AI copilot button position (1532, 936)

**FlowHolt planning implications**:
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — AI nodes need a separate visual class (distinct color + icon style)
- `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` — AI node family should break standard tab structure
- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` — agent-as-node vs managed-agent distinction
- FlowHolt should use **dashed/dotted edges** for AI tool connections vs solid edges for data-flow connections
- Business-readable route labels should be supported (not just "true/false" or numeric labels)
- n8n comparison: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md §5 NDVSubConnections` — n8n renders AI tool sub-connections differently from standard node connections

---

### 1.2 Replay and standard workflow run bar view

**Image**: `research/make-help-center-export/assets/images/E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png`

**Source article**: `research/make-help-center-export/pages_markdown/scenario-run-replay-and-naming-capabilities-now-available.md`

**Observed layout details**:
- `Run once` is the **primary CTA** — largest button, leftmost position, solid background color
- Replay is a **small dropdown arrow** next to the Run button — not a separate major button
- Schedule state is **visible inline** immediately adjacent to the run controls — "Every 15 min" text + toggle switch
- Utility icons (Save, History, Notes, I/O, Settings, Favorites) live in the same persistent bar, smaller and to the right
- The bar has a **visual separator** between execution controls (left) and utility actions (right)
- Scheduling toggle switch is immediate — no modal required to enable/disable scheduling

**Direct cross-reference to crawl data**:
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §2d` — toolbar test IDs: `btn-inspector-run-once`, `btn-inspector-run-with-existing-data`, `btn-inspector-scheduling`, `i-inspector-scheduling-switch`
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §11a` — `btn-inspector-run-once` confirmed in plan files 11, 14, 15, 40

**FlowHolt planning implications**:
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — run bar ordering: **Run > Replay > Schedule** (left group), **Save > History > Notes > I/O > Settings > Favorites** (right group)
- The replay button must be a **split-button** (primary Run action + dropdown for replay), not a separate full button
- The schedule toggle must be **visible inline** in the toolbar, not only in a scheduling modal
- n8n comparison: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md §2.5` — n8n's `CanvasRunWorkflowButton` is a split button (trigger picker when multiple triggers exist); FlowHolt should adopt this

---

### 1.3 Minimal builder empty-state view

**Image**: `research/make-help-center-export/assets/images/Zusz0Qbp3EP67xJ3qK7cl-20251003-145143__30f711290366.png`

**Source article**: `research/make-help-center-export/pages_markdown/create-your-first-scenario.md`

**Observed layout details**:
- Empty canvas state retains the **full bottom utility bar** — identical to populated state
- Central **large plus button** with text "Add a trigger module" is the only canvas element
- The plus button is styled as a rounded card, not a floating action button
- Scheduling controls (toggle, description) are visible and greyed-out in the toolbar — not hidden when no modules exist
- Settings and other utility controls remain accessible even with zero nodes

**Direct cross-reference to crawl data**:
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §2c` — canvas in blank state shows `<imt-inspector-designer-blank-cmp>`
- Crawl URL: `https://eu1.make.com/1467385/scenarios/add` — specifically the blank scenario state

**FlowHolt planning implications**:
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — toolbar must be rendered in **both empty and populated states** without layout shifts
- Empty state canvas node: should say "Add a trigger to get started" (not generic empty state)
- n8n comparison: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md §2.6` — n8n has two empty-state fallback nodes: `ChoicePrompt` (AI builder) and `AddNodes` (standard); FlowHolt should do similarly
- DO NOT hide or collapse the toolbar in empty state — this would break the UX continuity

---

### 1.4 Team management view

**Image**: `research/make-help-center-export/assets/images/4mSSL57quEGYfR0D7Re6S-20251003-084705__3d89fb62bdb2.png`

**Source article**: `research/make-help-center-export/pages_markdown/administration.md`

**Observed layout details**:
- Left rail shows **Org, Grid, Team** as top-level navigation entities — they are co-equal, not hierarchical sub-items
- Content area uses a **tab-like secondary navigation** within the Org section (Teams, Users, Settings tabs within Org)
- `Create scenario` button remains **globally accessible** even while in the Org/Team management area — always in the header
- `Add team` is a **contextual action** within the Teams tab, not in the global header
- Team rows show team name, member count, operations used, credit usage bar — all inline in the table

**Direct cross-reference to crawl data**:
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §3` — navigation menu structure: navigation-menu-0 (Org), navigation-menu-1 (My Plan), navigation-menu-2 (Utilities)
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §3` test IDs: `navigation-menu-0-header`, `tree-menu-item-0-0` through `tree-menu-item-2-3`

**Raw corpus cross-reference**:
- `research/make-help-center-export/pages_markdown/administration.md` — org management documentation
- `research/make-help-center-export/pages_markdown/access-management.md` — role/permission management
- `research/make-help-center-export/pages_markdown/credits-per-team-management.md` — team credit limits, usage bars

**FlowHolt planning implications**:
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — Org and Team sections must be first-level navigation, not sub-items of a generic Settings
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md §3` — `/org/:orgSlug` and `/team/:teamSlug` routes already planned; correct approach
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` — team credit usage bars must appear inline in the team list (not only in a separate analytics page)
- n8n comparison: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §9` — n8n has team/project-level org but uses flat "Project" model; FlowHolt's Org > Team > Workspace hierarchy is richer and closer to Make

---

### 1.5 Make Grid view

**Source article**: `research/make-help-center-export/pages_markdown/make-grid-public-beta-is-now-live.md`

**Observed layout details** (from article text and embedded images):
- Grid is a **landscape/bird's-eye view** of all automation connections — workflows shown as nodes in a network graph
- Connections between workflows are shown — the automation **ecosystem map** at org level
- Each node (scenario) shows: name, status icon (active/inactive), recent execution count
- Zoom and pan supported — identical interaction model to Studio canvas
- Filters: by team, by tag, by status

**Raw corpus cross-reference**:
- `research/make-help-center-export/pages_markdown/make-grid-workspace-navigation-and-interaction-updates.md` — interaction updates
- `research/make-help-center-export/pages_markdown/new-navigation-now-live-for-all-users.md` — navigation update that promoted Grid to first-level

**FlowHolt planning implications**:
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md §12` — `/dashboard/grid` is listed as Priority 3; should be promoted to Priority 2 (Make has it as a first-level nav item)
- The Grid view is conceptually separate from the Workflow list — it's a network/relationship view, not a table
- This is the "automation map" concept → `47-FLOWHOLT-AUTOMATION-MAP-SPEC.md`

---

### 1.6 Scenario recovery view

**Source article**: `research/make-help-center-export/pages_markdown/introducing-scenario-recovery.md`

**Observed**:
- Scenario recovery is a **separate modal** from version history
- Shows "unsaved changes" since last save — autosave snapshots
- Recovery restores the scenario to a previous autosave point (crash recovery)
- API: `GET/PUT/DELETE /api/v2/scenarios/:id/recovery` (confirmed in `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §5`)

**FlowHolt planning implications**:
- `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md` — needs a separate "crash recovery" concept alongside version history
- The recovery API should be distinct from deployment history — it's for **unsaved change recovery**, not version rollback

---

### 1.7 Enhanced Notes view

**Source article**: `research/make-help-center-export/pages_markdown/enhanced-notes-and-team-level-operations-management.md`

**Observed**:
- Notes are per-scenario, accessed via `btn-inspector-notes` in the toolbar
- Notes support **markdown formatting** — headers, lists, bold/italic
- Notes are visible to all team members with access to the scenario

**FlowHolt planning implications**:
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — Notes button in Studio toolbar should open a markdown-capable sidebar panel
- n8n equivalent: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` — n8n has `N8nSticky` for canvas notes (sticky notes on the canvas itself, not a side panel)
- FlowHolt should support **both** — workflow notes (sidebar, markdown) AND sticky notes on the canvas

---

## 2. Dynamic UI crawl evidence (2026-04-14)

**Full analysis**: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md`

**Crawl source**: Playwright-based automated crawl of `https://eu1.make.com/1467385/scenarios/add`
- 200 interactions, 84 baseline elements, 1302 network requests, 2 WebSocket connections
- Raw data: `research/make-advanced/` directory tree (per-interaction screenshots, DOM snapshots, element catalogs)

### 2.1 Editor bottom toolbar (confirmed by crawl)

The bottom toolbar (`<imt-toolbar>`, test ID `inspector-toolbar`) is **persistent and fully specified**:

| Button | Test ID | Icon | Role mapping |
|---|---|---|---|
| Run once | `btn-inspector-run-once` | `fa-play` | Primary execution CTA |
| Run with existing data | `btn-inspector-run-with-existing-data` | custom | Replay shortcut |
| Scheduling | `btn-inspector-scheduling` | `fa-clock-rotate-left` | Schedule modal + inline toggle |
| Explain flow (AI) | `btn-inspector-explain-flow` | `fa-sparkles` | AI analysis action |
| Save | `btn-inspector-save` | `fa-save` | Save to draft |
| Auto-align | `btn-inspector-autoalign` | custom | Canvas layout |
| History | `btn-inspector-history` | `fa-clock-rotate-left` | Version history |
| Notes | `btn-inspector-notes` | `fa-sticky-note` | Notes panel |
| Scenario I/O | `btn-inspector-scenario-io` | `fa-split` | Input/output config |
| Scenario settings | `btn-inspector-scenario-settings` | `fa-cog` | Settings modal |
| Add to favorites | `inspector-add-favorites` | `fa-star` | Favorites |

**n8n comparison**: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md §1.3` — n8n's equivalent is the `ActionsDropdownMenu` (17 workflow menu actions) plus the `CanvasRunWorkflowButton` floating on canvas. n8n does NOT have a persistent bottom toolbar — its run controls float on the canvas. **FlowHolt should use Make's persistent toolbar model** (better for discoverability) combined with n8n's split-button run control.

**Planning status**: `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` covers this toolbar. Confirmed correct.

---

### 2.2 Left navigation rail (confirmed by crawl)

80px wide, full height. 11 first-level items:

| Item | Test ID | Elevated from settings? |
|---|---|---|
| Organization | `first-level-navigation-main-organization` | Yes |
| Scenarios | `first-level-navigation-main-scenarios` | N/A (core) |
| AI Agents | `first-level-navigation-main-agents` | Yes (+ Beta pill) |
| Credentials | `first-level-navigation-main-credentials` | Yes |
| Webhooks | `first-level-navigation-main-hooks` | Yes |
| MCP Toolboxes | `first-level-navigation-main-vhosts` | Yes (new) |
| Templates | `first-level-navigation-main-templates` | N/A |
| Data stores | `first-level-navigation-main-data-stores` | Yes |
| Devices | `first-level-navigation-main-devices` | Yes |
| Data structures | `first-level-navigation-main-udts` | Yes |
| Custom Apps | `first-level-navigation-main-apps` | Yes |

**Critical insight**: Make elevated **AI Agents, Webhooks, Data Stores, Data Structures, MCP Toolboxes** to first-level navigation. These are NOT sub-items of Settings. The navigation revamp announcement (`new-navigation-now-live-for-all-users.md`) specifically explains this decision.

**n8n comparison**: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §2` — n8n's sidebar groups items under project navigation. n8n does not separate Data Structures from Data Stores at nav level. Make's approach is more discoverable.

**FlowHolt planning implications**:
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md §6` — FlowHolt sidebar should promote **Webhooks, Data Stores, and Data Structures** to first-level nav items (currently Webhooks is in Tools section — correct; Data Stores is listed as Priority 2 — should be Priority 1)
- MCP Toolboxes → should appear in Phase 2 sidebar as a first-level item

---

### 2.3 AI copilot button (discovered by crawl)

**Position**: (1532, 936) — bottom-right floating, 40×40px

**Component**: `<ai-copilot-button>` → `<ai-resources-button>` → `button#resources-button`

This is **separate from** `btn-inspector-explain-flow` (toolbar AI button). It's a persistent floating entry point to an AI resource panel (templates, suggestions, chat).

**Raw data**: `research/make-advanced/00-baseline/ui-taxonomy.json` — lists `ai-copilot-button` as a separate component class from the toolbar

**n8n comparison**: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md §2.3` — n8n has a `FocusSidebar` as a right-side panel, plus `AskAssistantButton` components. The AI entry points are similar in concept.

**FlowHolt planning implications**:
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — Add a **floating AI assistant button** (bottom-right) separate from any AI-specific toolbar button
- This should open an AI assistant panel (ask questions about the workflow, get suggestions, generate steps)
- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` — this floating button is the entry to the workflow-scoped AI assistant, not agent management

---

### 2.4 Scenario header (confirmed by crawl)

**Component**: `<imt-header>`, test ID `scenario-header`

Contains:
- `input#editable-scenario-title` — inline editable title (no modal required)
- `_goBackButton_14qxl_82` — back to scenarios list
- `button#header-dropdown-button` — scenario menu (26 items via dropdown)
- Share section (test ID: `header-toolbar`) — right side

**26 dropdown items** from header: This is larger than documented in earlier plan files. The dropdown contains: rename, duplicate, clone, export, import, share, notes, settings, history, I/O config, favorites, scheduling, recovery, tags, and other scenario-level actions.

**n8n comparison**: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md §1.4` — n8n's `ActionsDropdownMenu` has 17 workflow actions (edit description, duplicate, download, share, change owner, rename, import URL, import file, push/source control, settings, archive, unarchive, delete). n8n has **fewer** dropdown items but a more structured action model (publish states are in a separate component).

**FlowHolt planning implications**:
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` — needs to catalog all 26 dropdown items from the Make header
- FlowHolt's Studio header dropdown should target **~15–20 items** — more structured than Make but covering all Make's critical actions
- Publish/deployment state should be a **separate component** (following n8n's `WorkflowHeaderDraftPublishActions` pattern) from the dropdown menu

---

### 2.5 Feature flags (confirmed by crawl)

**Endpoint**: `/api/server/features` — called **32 times** during the crawl session

This endpoint is fetched on every page load and possibly on component mount. Make uses server-side feature flags extensively.

**Raw data**: `research/make-advanced/` network logs — see `network-summary.json`

**n8n comparison**: `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md §3` — n8n uses PostHog for feature flags (`posthog.store`). The `settings.store` also holds enterprise feature flags.

**FlowHolt planning implications**:
- `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` — feature flag system is not optional; it should be implemented from day one
- The feature flag endpoint should return a flat dict: `{"feature_name": boolean, ...}` resolved per workspace plan
- Consider PostHog (like n8n) or a simple DB-backed flag system for v1

---

## 3. Key visual patterns — consolidated for Studio planning

| Pattern | Make evidence | n8n evidence | FlowHolt decision |
|---|---|---|---|
| Persistent bottom toolbar | ✅ `inspector-toolbar` (11 buttons) | ❌ (run button floats on canvas) | **Use Make's model** — persistent toolbar |
| Split run button (trigger picker) | ✅ (Run + replay dropdown) | ✅ `CanvasRunWorkflowButton` (trigger selector) | Adopt from both |
| AI nodes distinct visual class | ✅ (purple, dotted connections) | ✅ (AI sub-connections panel in NDV) | Distinct color + edge style |
| Inline editable workflow title | ✅ `input#editable-scenario-title` | ✅ `N8nInlineTextEdit` (128 char max) | **Inline edit, no modal** |
| First-level nav for data entities | ✅ (11 items, Data stores/structures/webhooks at top level) | ❌ (project-scoped, fewer top-level items) | **Follow Make's model** |
| Floating AI assistant button | ✅ (`ai-copilot-button`, bottom-right) | ✅ (`AskAssistantButton` components) | Floating button, separate from toolbar |
| Canvas sticky notes | ❌ (notes in sidebar only) | ✅ (`N8nResizeableSticky`) | Support both patterns |
| Empty state retains toolbar | ✅ (toolbar visible on blank canvas) | ✅ (`AddNodes` fallback, toolbar present) | Toolbar always visible |
| Server-side feature flags | ✅ (32 calls to `/api/server/features`) | ✅ (PostHog via `posthog.store`) | Implement from v1 |
| Org settings 3-group nav | ✅ (Organization / My Plan / Utilities) | N/A (different model) | Follow Make's grouping |

---

## 4. Gaps confirmed by visual evidence (not yet in plan files)

### Gap A: Header help dropdown overlay
- **Evidence**: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §11c` — 29 elements, 4 overlays
- **Contents**: Documentation link, Academy, Community, Changelog, Keyboard shortcuts, Chameleon helpbar
- **FlowHolt action**: Add to `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` as Overlay #12

### Gap B: Header notifications overlay
- **Evidence**: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §11c` — 33 elements, 3 overlays
- **Contents**: Notification list, unread badge, team notifications, notification settings link
- **FlowHolt action**: Add to `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` as Overlay #13

### Gap C: Profile dropdown overlay
- **Evidence**: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §11c` — 11 elements, 4 overlays, 3 tooltips
- **Contents**: User info, theme toggle, language selector, notification preferences, billing link, logout
- **FlowHolt action**: Add to `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` as Overlay #14

### Gap D: Workspace/org/team context switcher
- **Evidence**: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §11e` — `navigation-picker-trigger` test IDs
- **FlowHolt action**: `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` needs a UI spec for the context switcher component

### Gap E: Loading/skeleton states
- **Evidence**: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §11g` — `dmo-animate-skeleton`, `loader-*` classes
- **FlowHolt action**: Add loading state patterns to design system documentation

### Gap F: Plan comparison page
- **Evidence**: `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md §11f` — 5 product cards, comparison table, billing-switch
- **FlowHolt action**: `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` needs billing UI spec
