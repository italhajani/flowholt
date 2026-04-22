# FlowHolt Studio Surface Specification

> **Status:** Rebuilt 2026-04-16 from n8n UI element catalog (file 42), n8n expression research (Domain 3), n8n UI crawl, Make UI evidence  
> **Direction:** n8n data mapping UX is the primary model. Make module settings for field configuration maturity.  
> **Vault:** [[wiki/concepts/studio-surface]]  
> **Raw sources:**  
> - n8n UI catalog: `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md`  
> - n8n data model: `research/n8n-docs-export/pages_markdown/data/` (25 pages)  
> - Make UI evidence: `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` + `research/make-advanced/`  
> **See also:** `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | `05-FLOWHOLT-AI-AGENTS-SKELETON.md`

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §1 Canvas | `research/make-advanced/00-baseline/screenshot-full-page.png` | Make canvas visual patterns |
| §1 Canvas | `n8n-master/packages/editor-ui/src/components/NodeView.vue` | n8n canvas root |
| §1 Canvas | `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` §2 | Canvas element inventory |
| §2 INPUT panel | `research/n8n-docs-export/pages_markdown/data/data-mapping.md` | Schema/Table/JSON views + drag-to-map |
| §2 INPUT panel | `n8n-master/packages/editor-ui/src/components/NDV/NDVInputPanel.vue` | n8n INPUT panel source |
| §3 Inspector | `research/make-advanced/04-node-settings/` | Make node configuration inspector |
| §3 Inspector | `n8n-master/packages/editor-ui/src/components/NDV/` | n8n NDV inspector dual-panel |
| §4 Expression editor | `research/n8n-docs-export/pages_markdown/data/expressions.md` | Expression syntax + autocomplete |
| §5 Test/debug | `research/n8n-docs-export/pages_markdown/data/data-pinning.md` | Data pinning for test runs |
| §5 Test/debug | `research/make-help-center-export/pages_markdown/scenario-run-replay.md` | Replay from history |
| §6 Top bar | `research/make-advanced/01-root-exploration/` | 26-element scenario header dropdown |
| §6 Top bar | `n8n-master/packages/editor-ui/src/components/MainHeader/` | Publish button states, per-workflow tabs |
| §7 Nodes panel | `research/make-advanced/03-node-insert/` | App search floating overlay |
| §7 Nodes panel | `n8n-master/packages/editor-ui/src/components/NodePanel/` | n8n node browser |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Canvas root | `n8n-master/packages/editor-ui/src/components/NodeView.vue` |
| NDV (node inspector) | `n8n-master/packages/editor-ui/src/components/NDV/NDV.vue` |
| INPUT panel | `n8n-master/packages/editor-ui/src/components/NDV/NDVInputPanel.vue` |
| Expression editor | `n8n-master/packages/editor-ui/src/components/ExpressionEditorModal/` |
| Pin data store | `n8n-master/packages/editor-ui/src/stores/pinData.store.ts` |
| Canvas context menu | `n8n-master/packages/editor-ui/src/composables/useContextMenu.ts` |
| Keyboard shortcuts | `n8n-master/packages/editor-ui/src/composables/useCanvasKeyboardShortcuts.ts` |
| Per-workflow tabs | `n8n-master/packages/editor-ui/src/components/MainHeader/MainHeader.vue` |
| Publish button states | `n8n-master/packages/editor-ui/src/components/MainHeader/WorkflowHeaderDraftPublishActions.vue` |
| Sticky notes | `n8n-master/packages/editor-ui/src/components/StickyNote/` |
| Collaboration pills | `n8n-master/packages/editor-ui/src/components/CanvasCollaborationPill.vue` |
| Edit lock | `n8n-master/packages/editor-ui/src/composables/useCollaborationState.ts` |

### This file feeds into

| File | What it informs |
|------|----------------|
| `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | Studio layout regions |
| `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` | Inspector modes + overlay inventory |
| `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | INPUT panel + expression editor UX |
| `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Tab states per role |
| `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md` | Publish button and release controls |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Domain 4 Studio UX gaps |

---

Studio is the authoring, testing, and runtime observation surface. It is not just a canvas. It combines:
1. **Canvas** — visual workflow graph
2. **INPUT panel** — upstream data explorer and expression source
3. **Inspector** — node configuration
4. **Expression editor** — `{{ }}` expression authoring with autocomplete
5. **Test/debug surface** — run, observe, pin, replay
6. **Top bar** — workflow identity, version, publish controls
7. **Nodes panel** — node library browser

---

## 1. Canvas

### Node Visual Language

| Node family | Shape | Color | Icon |
|-------------|-------|-------|------|
| Trigger nodes | Rounded rect, left-edge bolt | Green (#22C55E) | Lightning bolt |
| Action nodes | Rounded rect | White / dark in dark mode | Integration icon |
| Flow control (If, Switch, Merge) | Diamond or hexagon | Blue (#3B82F6) | Branch icon |
| AI / Agent cluster root | Rounded rect, larger, connector slot indicators | Purple (#A855F7) | Brain icon |
| AI sub-nodes | Smaller rounded rect, dotted border | Purple tint | Sub-node type icon |
| Code node | Rounded rect | Amber (#F59E0B) | Code brackets |
| Error nodes | Rounded rect, red left-edge | Red (#EF4444) | Warning icon |

### Node State Badges

Each node shows a state badge during run mode:

| State | Badge | Color |
|-------|-------|-------|
| Not run | — | — |
| Running | Spinner | Blue |
| Waiting for approval | Clock + "Awaiting" | Orange |
| Succeeded | Check + item count | Green |
| Failed | X + error preview | Red |
| Skipped | Dash | Gray |
| Disabled | Slash | Gray |

**Item count badge** — on success, shows how many items the node produced. Click to inspect output.

### Edge Styles

| Type | Style |
|------|-------|
| Normal data flow | Solid line |
| Branch (true path) | Solid green |
| Branch (false path) | Solid red |
| Error output path | Dashed red |
| Sub-node connector | Colored by slot type (see AI section) |
| Disabled | Gray dashed |

### Canvas Interactions

- **Click node** → opens inspector panel
- **Double-click node** → opens inspector panel (same as click)
- **Right-click node** → context menu: Open / Rename / Duplicate / Copy / Disable / Delete / Pin output / Add note
- **Click edge** → highlights path
- **Click empty canvas** → deselects all, closes inspector
- **Drag node** → repositions
- **Ctrl+drag** → select multiple nodes
- **Ctrl+C / Ctrl+V** → copy/paste nodes
- **Delete** → delete selected nodes (with confirmation if has connections)
- **Scroll** → zoom
- **Drag canvas background** → pan
- **Fit to screen button** (top-right) → fit all nodes in viewport
- **Mini-map** (bottom-right corner, toggleable)

### Canvas Toolbar (floating top-right of canvas)

- Zoom in / Zoom out / Reset zoom
- Fit to screen
- Toggle mini-map
- Undo / Redo

---

## 2. Top Bar

The top bar is always visible in Studio. It provides workflow identity, state, and primary actions.

### Left Section

| Element | Content |
|---------|---------|
| Back button | Returns to Workflows list (warns if unsaved) |
| Workflow name | Editable inline on click |
| Scope breadcrumb | `Workspace / Team` chip |
| Edit lock indicator | Shows if another user is editing ("Locked by [name]") |

### Center Section

| Element | Content |
|---------|---------|
| Save state | "Saved" / "Saving..." / "Unsaved changes" |
| Version indicator | "v3 (Draft)" / "v3 (Published)" / "v3 (Has changes)" |
| Environment badge | Staging / Production chip (which env is currently shown) |

### Right Section

| Element | Action |
|---------|--------|
| Test button | Runs workflow in test mode (manual trigger) |
| Stop button (during run) | Stops running execution |
| Publish button | Opens publish flow → select environment → confirm |
| Version history button | Opens version drawer |
| Share button | Opens share/collaborate panel |
| Settings cog | Workflow-level settings (timezone, error workflow, timeout, etc.) |

### Publish Button States

| State | Label | Color |
|-------|-------|-------|
| Not published | Publish | Blue |
| Publishing | Publishing... | Blue spinner |
| Published, no changes | Published ✓ | Green |
| Published with unsaved local changes | Save changes | Orange |
| Has unpublished saved changes | Publish changes | Blue |
| Saving | Saving... | Gray |

---

## 3. Nodes Panel (Left Rail)

The node library browser. Opened via the "+" button on canvas or the side rail.

### Structure

```
[Search input — "Search nodes or apps..."]

Recommended / Recently Used
─────────────────────
Triggers
  ├── Manual Trigger
  ├── Webhook Trigger  
  ├── Schedule Trigger
  ├── Form Trigger
  ├── Chat Trigger
  └── Error Trigger

Flow Control
  ├── If
  ├── Switch
  ├── Merge
  ├── Loop (Split in Batches)
  ├── Wait
  └── No-Op

Data
  ├── Set
  ├── Edit Fields
  ├── Filter
  ├── Sort
  ├── Summarize
  ├── Aggregate
  └── Compare Datasets

Code
  ├── Code (JS/Python)
  └── Expression

HTTP
  └── HTTP Request

AI / Agents
  ├── Agent (root)
  ├── LLM Chain (root)
  ├── OpenAI LLM (sub-node)
  ├── Buffer Window Memory (sub-node)
  ├── Workflow Tool (sub-node)
  ├── Code Tool (sub-node)
  ├── HTTP Tool (sub-node)
  ├── MCP Client Tool (sub-node)
  ├── Vector Store Retriever (sub-node)
  ├── PGVector Store (sub-node)
  ├── Document Loader (sub-node)
  └── Text Splitter (sub-node)

Integrations
  └── [All app integrations, searchable]
```

**Search behavior:** Fuzzy search across node name, description, and app name. Shows top 5 results with "Show more" if needed.

**Sub-node visibility:** Sub-nodes (AI cluster) are shown in the AI section but are also visible when an Agent root is selected on canvas — the inspector shows an "Add sub-node" button that opens a filtered panel.

---

## 4. Inspector Panel (Right Rail)

The inspector opens when a node is selected. It has a consistent header + dynamic body.

### Inspector Header

```
[Node icon]  [Node name (editable)]
[Node type label]                    [Enable/Disable toggle]
[Tabs: Parameters | Settings | Notes]
```

### Tab: Parameters

The primary configuration area. Every node field lives here.

#### Field Types

| Type | UI element | Notes |
|------|-----------|-------|
| Text | Single-line input | Toggle to expression mode with `{{ }}` button |
| Long text | Multi-line textarea | Toggle to expression mode |
| Number | Number input + up/down | — |
| Boolean | Toggle switch | — |
| Select/Dropdown | Select input | Options defined by node |
| Multi-select | Tag input | — |
| Credential/Connection | Credential picker | Opens credential selector |
| Collection (key-value pairs) | Repeatable row input | + button to add rows |
| Fixed/Expression toggle | Per-field toggle button | Switches between value input and expression editor |
| Notice | Non-editable info box | Shown for contextual help |

#### Required vs Optional Fields

- Required fields are shown by default, marked with asterisk
- Optional fields are collapsed in an "Optional fields" section (expandable)
- Validation messages shown inline below each field

#### Expression Mode (per-field)

When a field is switched to expression mode:
- Input becomes a code-style monospace editor
- `{{ }}` wrapper shown as static prefix/suffix (user fills interior)
- Autocomplete triggers on `$` character
- Autocomplete suggests: `$json`, `$input`, `$now`, `$vars`, `$workflow`, `$execution`, `$env`, plus Luxon and method chains
- Live preview shows evaluated value using pinned data (if available)
- Syntax error shown inline

### Tab: Settings (per node)

| Setting | Options |
|---------|---------|
| On Error | Stop Workflow / Continue / Continue with Error Output |
| Execute Once | Toggle (run node once regardless of item count) |
| Retry on Fail | Toggle + count + wait |
| Timeout | Seconds |
| Notes | Free text (shown on canvas as tooltip) |
| Always Output Data | Toggle (output empty array on no results instead of nothing) |

### Tab: Notes

Free text notes for this node. Shown as a tooltip balloon on the canvas when the node is hovered.

---

## 5. INPUT Panel (Data Explorer)

The INPUT panel is the primary source of data for expression authoring. It shows the output of the **upstream node** (the node connected to the left of the currently selected node).

**Location:** Appears as a resizable panel below or beside the inspector, or as a modal drawer. Default: split pane with inspector on right.

### Views

#### Schema View (default)

Shows the data structure as a field tree:

```
▼ item [0]
  ├── id          123           (number)
  ├── name        "Alice"       (string)
  ├── email       "alice@..."   (string)
  └── ▼ address
        ├── city  "London"      (string)
        └── zip   "EC1A"        (string)
```

**Drag-to-expression:** Drag any field row → drops `{{$json.fieldName}}` into the focused input field.  
**Click-to-insert:** Click any field row → inserts `{{$json.fieldName}}` at cursor in focused input.  
**Type preview:** Shown inline as gray chip after value.

#### Table View

Shows items as a spreadsheet table:

```
| id  | name    | email           | address.city |
|-----|---------|-----------------|--------------|
| 123 | Alice   | alice@example   | London       |
| 124 | Bob     | bob@example     | Paris        |
```

Row count shown at bottom. Click column header → click-to-insert `{{$json.columnName}}`.

#### JSON View

Raw JSON of the current item. Read-only. Copy button. Useful for deep inspection.

### Item Navigation

When multiple items are present:
- Item counter: "Item 1 of 47"
- Left/right arrows to navigate items
- "All items" toggle to show JSON array of all items

### Data Pinning

On each node, a **pin** button in the run output section saves the actual execution output as pinned data. Pinned data is used in the INPUT panel during subsequent editing without re-running.

- Pin button in the node output header (appears after a run)
- Pinned nodes show a pin icon badge on canvas
- Run with Pinned Data mode: Studio uses pinned data for upstream nodes, skips re-execution
- Clear Pins button on top bar (before promoting to production)

---

## 6. Expression Editor

When a field is in expression mode, the expression editor provides:

1. **Inline editor** in the inspector field — single line, with `{{ }}` visual framing
2. **Full-screen expression editor** (modal, for complex expressions) — multi-line, syntax highlighting, live preview panel

### Autocomplete

Triggered on `$`:

```
$json.         → field names from current item (from INPUT panel Schema view)
$input.        → $input.all(), $input.first(), $input.last(), $input.item
$now.          → Luxon DateTime methods (toISO(), format(), plus(), minus(), etc.)
$vars.         → workspace variable names
$workflow.     → id, name, active
$execution.    → id, mode, startedAt
$env.          → environment variable names
$jmespath(     → JMESPath function signature hint
$fromAI(       → AI-proposed field signature hint
```

String methods shown after `.` on string values:
```
.toUpperCase()   .toLowerCase()   .trim()   .split()   .replace()
.includes()      .startsWith()    .endsWith()   .length   .slice()
```

Array methods:
```
.length          .first()         .last()   .map()   .filter()
.includes()      .join()          .flat()
```

---

## 7. Test and Debug Surface

### Run Controls (top bar)

| Button | Action |
|--------|--------|
| Test | Run workflow manually from trigger node (uses test data if pinned, else prompts for data) |
| Run with existing data | Opens execution picker — re-runs with data from a past execution |
| Stop | Cancels running execution |

### Per-Node Output Inspector

After a run, each node shows:

1. Item count badge (e.g., "3 items")
2. Click node → inspector switches to Output tab showing items
3. OUTPUT tab shows same Schema/Table/JSON views as INPUT panel
4. Error nodes show error message + stack trace

### Execution Trace Drawer

Bottom drawer that opens during / after test run. Shows:

```
▼ Execution #abc123  [47ms total]  [✓ Succeeded]

  ✓  Manual Trigger     1 item    2ms
  ✓  HTTP Request       1 item   38ms
  ✓  If                 2 paths   1ms
    ├─ ✓  Set (true)    1 item    2ms
    └─ ✓  Set (false)   0 items   0ms
```

Click any step to highlight that node on canvas and open its output.

### HITL Pause State

When an agent's tool triggers HITL approval:
1. Canvas shows Agent node with orange "Waiting for approval" badge
2. Execution trace shows "Paused — awaiting approval" row
3. Link to Human Inbox to approve/reject
4. Timeout countdown shown if configured

---

## 8. Workflow-Level Settings

Accessible from the Settings cog in top bar.

| Setting | Options | Default |
|---------|---------|---------|
| Timezone | IANA timezone select | Workspace default |
| Error workflow | Workflow picker | None |
| Max execution timeout | Seconds | 600 (10 min) |
| Save execution data | Always / On error / Never | Always |
| Data redaction rules | List of field patterns to redact in logs | None |
| Time saved per execution | Fixed minutes OR dynamic (sum of node values) | None |
| Retry failed executions | Toggle + count + backoff | Off |

---

## 9. Edit Locking

Only one user can edit a workflow at a time.

| State | What happens |
|-------|-------------|
| User A opens for edit | Lock acquired. Lock token stored with user session. |
| User B opens same workflow | Read-only mode. Banner: "Being edited by [User A]. Request access." |
| User A inactive for 5 min | Lock auto-released. |
| User B clicks "Request access" | User A receives notification. User A can release lock or ignore. |
| Lock released | First waiting user gets edit access. |

Lock state shown in top bar left section.

---

## 10. Version History Drawer

Opens from top bar Version History button.

```
[Search versions...]

v7  Published  Today 14:32  by Alice     [Restore]  [Compare with current]
v6  Published  Today 11:05  by Alice     [Restore]  [Compare]
v5  Published  Yesterday    by Bob       [Restore]  [Compare]
v4  Draft                               (current working draft)
v3  Published  3 days ago   by Alice     [Restore]  [Compare]
```

**Version diff view:**
- Canvas with visual diff: Added = green "N" badge, Modified = orange "M" badge, Deleted = red "D" badge
- Click any modified node → parameter-level diff panel (before/after values side by side)
- Restore button: creates a new draft from selected version (does not overwrite published state)

---

## 11. Canvas Annotations (Notes)

Sticky notes can be placed on the canvas:

- Right-click canvas → "Add note"
- Text box that stays on canvas
- Repositionable, resizable
- Background color options (yellow, blue, green, red, gray)
- Notes included in workflow export/import

---

## Studio Planning Checklist — Complete

- [x] Canvas visual language (nodes, edges, states, badges)
- [x] Canvas interactions (click, drag, right-click, zoom)
- [x] Top bar (all elements, publish states, version indicator)
- [x] Nodes panel (library browser, search, AI cluster sub-nodes)
- [x] Inspector header + tabs (Parameters, Settings, Notes)
- [x] Field types (all variants, required/optional, expression mode)
- [x] INPUT panel (Schema/Table/JSON views, drag-to-expression)
- [x] Expression editor (autocomplete, `$json`, `$input`, `$now`, Luxon)
- [x] Data pinning (pin output, run with pinned data, clear pins)
- [x] Test/debug surface (run controls, per-node output, execution trace)
- [x] HITL pause state on canvas
- [x] Workflow-level settings
- [x] Edit locking
- [x] Version history + visual diff
- [x] Canvas annotations

---

## Related Files

- `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` — full expression spec
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — panel anatomy breakdown
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` — modal inventory
- `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` — tab × role states
- `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` — node family exceptions
- `05-FLOWHOLT-AI-AGENTS-SKELETON.md` — Agent cluster node canvas behavior
- `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` — raw n8n UI reference
- [[wiki/concepts/studio-surface]] — vault synthesis
- [[wiki/concepts/expression-language]] — expression vault page
