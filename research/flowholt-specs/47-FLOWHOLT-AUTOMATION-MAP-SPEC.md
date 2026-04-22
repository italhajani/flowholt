# 47 — FlowHolt Automation Map Specification

Source: Make Grid (Section 7) — `research/make-help-center-export/pages_markdown/introduction-to-make-grid.md`, `research/make-help-center-export/pages_markdown/explore-make-grid-gui.md`, `research/make-help-center-export/pages_markdown/how-to-use-make-grid.md`, `research/make-help-center-export/pages_markdown/best-practices-to-use-make-grid.md`, `research/make-help-center-export/pages_markdown/access-make-grid.md`, `research/make-help-center-export/pages_markdown/tutorial-how-to-replace-a-dependency.md`

Status: initial draft — first full synthesis of Make Grid into FlowHolt design language

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | Key content |
|--------|----------|-------------|
| Make Grid introduction | `research/make-help-center-export/pages_markdown/introduction-to-make-grid.md` | Grid as dependency map, org-level view, near real-time |
| Make Grid GUI | `research/make-help-center-export/pages_markdown/explore-make-grid-gui.md` | GUI elements: filter sidebar, canvas, detail panel |
| Make Grid how-to | `research/make-help-center-export/pages_markdown/how-to-use-make-grid.md` | Interaction patterns, zoom, filter, click to drill down |
| Make Grid best practices | `research/make-help-center-export/pages_markdown/best-practices-to-use-make-grid.md` | Naming conventions, tag strategy for grid readability |
| Make Grid access | `research/make-help-center-export/pages_markdown/access-make-grid.md` | Who can access Grid, plan requirements |
| Make Grid tutorial | `research/make-help-center-export/pages_markdown/tutorial-how-to-replace-a-dependency.md` | Replace dependency workflow using Grid |
| n8n no equivalent | `research/n8n-docs-export/pages_markdown/` | n8n has no automation map surface |
| FlowHolt runtime ops | `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` | Runtime ops route (feeds into map) |
| FlowHolt analytics | `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Credit/ops data for map overlays |

### n8n comparison

n8n has **no equivalent surface** to Make Grid. This is an area where FlowHolt follows Make's pattern and adds the advantage of tighter integration with the org/team/workspace hierarchy.

### This file feeds into

| File | What it informs |
|------|----------------|
| `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | `/org/:orgSlug/automation-map` route |
| `32-FLOWHOLT-RUNTIME-OPS-ROUTE-SPEC.md` | Runtime ops data feeds map |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Credit/ops overlays on map nodes |
| `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` | Org/team scoping for map view |

---

Make Grid is a dependency map that helps businesses visually manage and optimize their entire automation and AI ecosystem. It functions like a simulation of the automation infrastructure — a near real-time, auto-generated map that shows how scenarios, apps, data stores, and AI-powered components are connected.

Make Grid is a **separate product surface** from the Scenario Builder. It operates at organization/team scope, not at the individual scenario level. It was released in public beta in 2025 and received significant updates in early 2026.

FlowHolt has no equivalent surface yet. This document defines what the FlowHolt Automation Map should be — absorbing Make Grid's design strengths, correcting its limitations, and grounding decisions in FlowHolt's own entity hierarchy (Organization → Team → Workspace → Workflow).

---

## 2. FlowHolt Automation Map — concept and purpose

The **FlowHolt Automation Map** is an org-level, read-mostly visualization surface that shows the full dependency graph of a team or workspace. It is NOT a builder or editor — it is an operations and governance surface that answers questions like:

- Which workflows depend on this connection / data store / webhook?
- Where is an error spreading through my automation infrastructure?
- Which workflows are consuming the most credits or operations?
- Who on my team is currently editing what?
- If I change this database column, which workflows break?
- Which HTTP integrations are calling which external endpoints?

The Automation Map complements the existing runtime operations route (from file 32) and the dashboard sidebar's workflow list. It provides the systems-map view that no list or detail page can provide.

---

## 3. Scope and access

### 3.1 Organization-level default
The Automation Map operates at org scope by default — showing all teams and workspaces the current user has access to. It is NOT scoped to a single workspace.

### 3.2 Team and workspace scoping
Users can scope the view using filters:
- Filter to a single team
- Filter to a single workspace
- Filter by workflow status (active / inactive / draft / archived)
- Filter by folder / tag
- Filter by integration used (e.g. "show all workflows using Slack")
- Filter by creator or last-editor

### 3.3 Access control
- Any org member can view the Automation Map filtered to what they have access to.
- Only users with at least `monitor` team-role (or equivalent org role) see team-level views.
- The Map is read-only for non-editors — clicking through to edit a workflow still requires builder or higher role.
- Enterprise feature: presence cursors and real-time collaboration indicators require Teams or Enterprise plan.

### 3.4 Navigation entry point
New sidebar section under the org or team scope:
```
Sidebar
└── Org section
    └── Automation Map
```
Also accessible via the team dashboard as a "Map" tab alongside "Workflows", "Runtime", etc.

---

## 4. Entity types shown on the Map

The Automation Map renders the following entity types as nodes:

| Entity type | Icon shape | Description |
|---|---|---|
| Workflow | Rounded rectangle | A workflow automation (active = colored, inactive = gray, draft = dashed) |
| Webhook trigger | Antenna/plug icon | A webhook that triggers one or more workflows |
| Schedule trigger | Clock icon | A scheduled trigger |
| Connection (Vault) | Key icon | A vault-stored integration connection |
| Data store | Stack icon | A data store used by workflows |
| AI Agent | Brain / chip icon | A managed AI agent entity |
| External asset | Hexagon | Generic 3rd-party object (sheets, forms, channels, etc.) |
| Subscenario | Nested workflow icon | A workflow used as a subscenario tool |
| HTTP endpoint | Globe icon | An external API endpoint called by an HTTP node |

### 4.1 Shared asset indicator
When a connection, data store, or webhook is shared across multiple workflows or workspaces, a "Shared" badge is displayed on the entity node.

### 4.2 AI agent indicator
Workflows containing an AI agent node show the AI chip badge on the workflow icon.

---

## 5. Link and arrow types

| Link type | Visual | Meaning |
|---|---|---|
| Trigger link | Purple arrow | One entity triggers another (webhook → workflow, schedule → workflow) |
| Data link | Violet line | One workflow reads from or writes to another entity |
| Subscenario link | Dashed line | A workflow calls another workflow as a tool |
| Dependency shared | Thick line | Multiple workflows share the same entity |

Hovering over a link shows the module name and direction (read vs. write).

---

## 6. Layout and navigation

### 6.1 Islands (folders/workspaces)
Each workspace (or folder within a workspace) is represented as an **island** — a bounded region on the canvas. Workflows within that workspace appear inside their island.

Teams are rendered as higher-level groupings that contain multiple islands.

At org zoom level: islands appear as clusters. Zooming in reveals individual nodes.

### 6.2 Pan and zoom
- Right-click + drag to pan the canvas
- Scroll wheel / pinch-to-zoom
- `+` / `-` controls
- "Fit all" button to zoom to show full org
- Snap to island / snap to workflow options

### 6.3 Edit Layout mode
A separate **Edit Layout** mode allows org admins and team admins to:
- Reposition islands
- Resize folder regions
- Apply "Compact folder layout" to remove empty space (destructive operation — confirmation required)
- The layout is persisted per-org as a stored layout preference

---

## 7. Layers

The Automation Map has selectable **layers** that overlay analytical data on top of the dependency graph:

| Layer | What it shows | Time range |
|---|---|---|
| Explore (default) | Dependencies and connections only | N/A |
| Credits | Credits consumed per workflow/folder/team | Last 30 days |
| Operations | Operations completed per workflow/folder/team | Last 30 days |
| Data Transfer | Data transferred per workflow/folder/team | Last 30 days |

### 7.1 Credit layer details
- Each workflow appears as a circle; size = credit consumption (larger = more)
- Data transformers (iterators, aggregators) consumed credits appear in the workflow circle total but are not attributed to individual dependencies — this is a known display limitation (same as Make Grid)
- Clicking a workflow in credit layer opens a side panel with a credit breakdown

### 7.2 Operations layer details
- Similar circle-sizing pattern to credits layer
- Shows completed execution count overlaid on workflow node

### 7.3 Switch layer effect
Selecting a layer shows a **Usage Status** strip below the toolbar with org-wide totals for the selected metric.

---

## 8. Attention and error indicators

### 8.1 "Needs attention" widget
A persistent widget in the top corner of the canvas surfaces:
- Workflows with recent errors
- Connections with failing health checks
- Webhook queue backlogs (warn threshold)
- Incomplete executions over threshold per workspace
- Data stores nearing capacity limit

Clicking the widget zooms to the affected entity.

### 8.2 Per-node error flag
Workflows with unresolved errors display a red flag indicator on their node. Clicking the flag opens:
- Most recent error reason
- Quick link to Execution History for that workflow
- Quick link to Runtime Operations queue view

### 8.3 Error indicator filtering
The "Need your attention" toggle in the toolbar can show/hide the error indicators to reduce noise during planning/governance views.

---

## 9. Interaction and actions from the Map

### 9.1 Select any entity → side panel opens
Clicking any entity node opens a right-side detail panel with:
- Name, status, last modified, owner
- Direct link to edit (if user has editor access)
- Link-type tabs: "Links" (dependencies), "Attributes" (field-level)

### 9.2 Dependency tracing
Clicking a data store, connection, or external asset shows:
- Which workflows READ from it
- Which workflows WRITE to it
- The data flow direction (trigger link vs. data link)

Hovering a specific link opens a tooltip with the module name and field path.

### 9.3 Attribute-level dependency view
For structured assets (databases, data stores, spreadsheets), clicking the **Attributes** tab in the side panel shows:
- All columns/fields of the asset
- Which workflows reference each field
- This enables safe impact analysis before modifying or deprecating a field

### 9.4 Open dependency in place
For specific integrations (Google Sheets, Google Docs, etc.), the Map allows opening and editing the linked asset directly from the side panel — avoiding tab-switching. This is a **premium feature** (Teams/Enterprise) requiring the relevant connection to have sufficient permission scope.

### 9.5 Open workflow from Map
Clicking a workflow node shows a mini-card with:
- Workflow name, status
- Last run time and result
- "Open in Studio" button
- "Open Execution History" button

### 9.6 Search (Find anything)
A global search bar on the Map canvas allows searching by:
- Workflow name
- App / integration name
- Data store name
- URL / endpoint fragment
- Column/field name (for structured assets)

Search results highlight matching entities and draw all their dependencies, dimming others.

---

## 10. Collaboration features

### 10.1 Presence indicator
When multiple users are viewing the Automation Map simultaneously:
- Each user's cursor appears on the canvas at their current position
- A **presence widget** in the toolbar shows avatar icons of all active viewers
- Cursor identities are shown by username on hover
- **"Show Cursors" toggle** to enable/disable cursor visibility

### 10.2 Real-time updates
The Map auto-refreshes as changes occur in the underlying workflow infrastructure. A **"Last update" indicator** (cloud icon) shows elapsed time since the last data synchronization — so users know how fresh the view is.

### 10.3 Snapshot / export
A **Take Snapshot** button captures the current canvas view as an image (PNG), automatically downloaded — for use in documentation, incident reports, or architecture review.

---

## 11. 2D / 3D view

The Map supports switching between:
- **2D view** (default): flat graph layout
- **3D view**: a perspective/isometric rendering of the same graph for spatial navigation in very large orgs

Dark/light mode toggle applies independently of the 2D/3D choice.

---

## 12. Use cases for FlowHolt Automation Map

### 12.1 Pre-migration dependency check (critical use case)
Before replacing a database connection, deprecating a column, or retiring a workflow:
1. Find the asset in the Map
2. Click "Attributes" → see which workflows reference each field
3. Note all impacted workflows
4. Open each → update before making the change
This replaces the current manual process of checking each workflow individually.

### 12.2 Credit and operations cost management
Use the Credits or Operations layer to:
- Find top-consuming workflows
- Identify bottlenecks (large circle = high consumption)
- Spot optimization candidates before plan limit is reached
- Verify credit reduction after applying iterator/aggregator changes

### 12.3 Error investigation and spread detection
When an error occurs in a shared connection or data store:
1. Locate the error flag on the Map
2. See which downstream workflows it affects
3. Prioritize which to fix first based on dependency depth

### 12.4 Onboarding and team handoff
New team member or org audit:
- Open the Map to understand "what exists and how it's connected" without reading any code
- Filter by folder or creator to focus on a specific domain
- See credential/connection sharing across workflows

### 12.5 Governance and compliance review
Admins reviewing data access:
- Which workflows write to external systems?
- Which workflows consume AI agent credits?
- Which connections are shared and potentially over-permissioned?

---

## 13. FlowHolt-specific design decisions

### 13.1 Islands = Workspaces (not folders)
In Make Grid, islands represent folders. FlowHolt's entity hierarchy uses **Workspaces** as the primary subdivision within a team. FlowHolt Automation Map islands should represent **workspaces**, with workflows appearing inside their workspace island.

If folders exist within workspaces in a future phase, sub-islands can be added.

### 13.2 Team scope at top level
Teams in FlowHolt are the primary grouping above workspaces. The Automation Map should render **teams** as the highest visible grouping (like Make Grid's team grouping), containing workspace islands.

### 13.3 Capability gating
Access to the full Automation Map (including org-wide view, credit/ops layers, presence cursors, and attribute-level dependency tracing) is gated:

| Feature | Min Plan | Min Role |
|---|---|---|
| Basic Map view (own team) | Free | member |
| Credit / ops layers | Growth | member |
| Attribute-level dependency view | Teams | monitor |
| Presence cursors | Teams | member |
| Edit Layout mode | Teams | team-admin |
| Cross-team/org Map view | Enterprise | org-admin |
| Open-in-place for Google assets | Teams | member + vault access |

### 13.4 No third-party Chrome extension needed
Unlike Make's DevTool (a Chrome extension), FlowHolt's Automation Map is a **first-party, in-app** surface. There is no browser extension dependency.

### 13.5 Automation Map vs. Monitor page distinction
The Automation Map is NOT the same as the Runtime Operations monitor (file 32). Distinction:

| Automation Map | Runtime Operations |
|---|---|
| Dependency graph — static entities and their connections | Live run queue — job processing and error states |
| Governance / architecture view | Operational health view |
| Primarily org/team-scoped | Primarily workspace-scoped |
| Read-mostly, rarely acted upon directly | Actively operated (retry, cancel, replay) |

Both surfaces are additive — they solve different user jobs.

### 13.6 Workflow entity on the Map has real-time status
The Map shows each workflow's current status (active / paused / error / draft) in near-real-time, drawing from the same execution-state model documented in file 17 and file 19.

---

## 14. Backend requirements

### 14.1 Dependency graph storage
A `workflow_dependency` or `workflow_asset_link` table needs to track:
```
workflow_id → asset_type (connection | data_store | webhook | agent | external_url) → asset_id → direction (read | write | trigger)
```
This can be populated at workflow-save time by scanning the node configuration for vault asset bindings (already in `StudioStepAssetBinding` model in models.py) and external URLs.

### 14.2 Credit/ops aggregation
The Credits and Operations layers require aggregated usage data grouped by workflow, workspace, and team over a rolling 30-day window. This should be precomputed and cached (e.g. hourly refresh materialized view) to avoid expensive real-time joins on execution event tables.

### 14.3 Real-time presence
Presence cursors require a lightweight pub/sub channel per Map session. A WebSocket room keyed on `map:org_id` where clients publish cursor position events at ~100ms intervals. Presence auto-expires on disconnect (TTL = 30s with heartbeat renewal).

### 14.4 External asset tracking
For HTTP node endpoints and external URL dependencies, the node config scanner should extract the base URL of each HTTP request node and link it to a `ExternalEndpoint` entity on the Map. This does NOT require calling the external service — it only parses the stored node configuration.

---

## 15. Phased delivery

### Phase 1 — Core dependency graph (MVP)
- Render workflows, connections, data stores, webhooks, AI agents as nodes
- Show trigger and data links between them
- Basic filter (status)
- "Open in Studio" action from node
- Read-only for all roles

### Phase 2 — Operational layers
- Credit / Operations / Data Transfer layers
- Error flag indicators
- "Needs attention" widget
- Scope filter (team, workspace, creator)

### Phase 3 — Attribute-level dependency and collaboration
- Field/column attribute mapping
- Presence cursors
- Edit Layout mode
- 2D / 3D view toggle
- Take Snapshot

### Phase 4 — Advanced interaction
- Search (Find anything)
- Open-in-place for supported asset types
- HTTP endpoint tracing
- Cross-team view for org admins

---

## 16. Open planning decisions

1. **Name**: "Automation Map" vs. "FlowHolt Grid" vs. "Dependency Map" — what is the product surface name? Make Grid chose a distinctive product name.
2. **Folder vs. Workspace as island**: Should FlowHolt support folder structure within workspaces? If yes, folders become sub-islands.
3. **Refresh rate**: Near-real-time updates require WebSocket or long-polling on the Map — what is the acceptable staleness? Make Grid shows "last update" time — should FlowHolt do the same?
4. **3D view priority**: Is the 3D view essential for launch or Phase 3+?
5. **Open-in-place scope**: Which asset types support open-in-place editing? Only Google Workspace, or any asset with a web URL?
6. **Presence cursor scope**: Is real-time cursor presence valuable enough to engineer a WebSocket room per Map session, or should collaboration be deferred to a later phase?
7. **Attribution of data transformer credits**: Make Grid explicitly doesn't attribute iterator/aggregator credits to dependency nodes. Should FlowHolt be more precise?
