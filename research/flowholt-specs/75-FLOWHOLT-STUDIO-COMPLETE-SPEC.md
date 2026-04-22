# 75 · FlowHolt: Studio Complete Surface Spec

> **Purpose**: Exhaustive specification for the Studio (workflow editor) — every surface element, state variant, interaction pattern, keyboard shortcut, and edge case. This is the "bible" for the Studio UI.
> **Audience**: Junior AI model implementing any Studio component. Every pixel pre-planned.
> **Sources**: spec 07 (Studio skeleton), spec 11 (anatomy), spec 42 (n8n UI catalog), spec 63 (redesign), spec 69 §4-7 (UI elements).

---

## Cross-Reference Map

| Section | Source |
|---------|--------|
| §1 URL & routing | spec 40, current frontend |
| §2 Top bar | spec 07 §topbar, spec 42 §1.1–1.4 |
| §3 Canvas | spec 07 §canvas, spec 42 §2, spec 11 |
| §4 Nodes panel (left) | spec 07 §nodes-panel, spec 42 §8 |
| §5 Inspector panel (right) | spec 07 §inspector, spec 15, spec 26 |
| §6 Execution mode | spec 42 §6, spec 07 §execution |
| §7 Copilot panel | spec 49 (copilot) |
| §8 Keyboard shortcuts | spec 42 §keyboard, n8n shortcuts |
| §9 Modals | spec 15, spec 23 |
| §10 Studio settings modal | spec 38 §studio |

---

## 1. URL & Routing

**Edit mode**: `/studio/{workflow_id}`  
**New workflow**: `/studio/new` (redirects to `/studio/{generated_id}` after first save)  
**Template preview**: `/studio/template/{template_id}` (read-only)

**Page title** (browser tab): `{workflow_name} — FlowHolt Studio`

---

## 2. Studio Top Bar

**Height**: 48px  
**Background**: `background` (white)  
**Border**: 1px bottom border `border`  
**Position**: fixed top, full width, z-index 100

### 2.1 Left Section

| Element | Description |
|---------|-------------|
| Back button | `← Workflows` — navigates to `/workflows` (with unsaved-changes check) |
| Workflow name | Editable inline input (click to edit, Enter to save, Escape to cancel). Font: medium 14px. Max 80 chars. |
| Status badge | Small pill: Active (green) / Paused (yellow) / Draft (gray). Click opens activation toggle. |

**Unsaved-changes indicator**: Dot bullet after workflow name when there are unsaved changes: `"Send Email •"`

### 2.2 Center Section (hidden below md)

| Element | Description |
|---------|-------------|
| Undo button | `⌘Z` — icon only, tooltip on hover. Disabled when nothing to undo. |
| Redo button | `⌘⇧Z` — icon only, tooltip. |
| Zoom indicator | "100%" — click opens zoom dropdown (50%, 75%, 100%, 125%, 150%). |
| Fit to screen | `⌘⇧F` shortcut — fits all nodes in view |
| Minimap toggle | Map icon — toggles minimap in bottom-right corner |

### 2.3 Right Section

| Element | Width | Description |
|---------|-------|-------------|
| Test/Run panel toggle | icon btn | Opens execution panel at bottom |
| Copilot button | icon btn | Opens AI copilot side panel |
| Save status | auto | "Saving..." / "Saved" / "Save failed" |
| Save button | btn | `⌘S` — saves workflow. Shows spinner while saving. |
| Activate toggle | btn | Toggle: "Activate" (when draft/paused) / "Deactivate" (when active) |
| Settings button | icon btn | Opens workflow settings modal |
| Share button | icon btn | Opens sharing options |
| Run button | green btn | Manual execution trigger |

### 2.4 Save Status States

| State | Display |
|-------|---------|
| No changes | "All changes saved" (gray text) |
| Pending save | "Saving..." (with spinner) |
| Just saved | "Saved" (checkmark, fades after 2s) |
| Save error | "Save failed" (red, with retry button) |
| Auto-save | Saves 3 seconds after last change |

---

## 3. Canvas

**Background**: White with subtle dot grid (CSS dot pattern or SVG)  
**Library**: React Flow (reactflow.dev)  
**Position**: Full width/height below top bar, left of right panel

### 3.1 Canvas Controls (Bottom Left)

```
┌──────────────────┐
│ + │ − │ 🗺 │ ⊡ │
└──────────────────┘
```

| Button | Action | Shortcut |
|--------|--------|---------|
| `+` | Zoom in | `⌘+` or scroll up |
| `−` | Zoom out | `⌘-` or scroll down |
| `🗺` | Toggle minimap | — |
| `⊡` | Fit to screen | `⌘⇧F` |
| Zoom % | Click opens zoom menu | — |

### 3.2 Canvas Interactions

| Interaction | Result |
|-------------|--------|
| Click empty canvas | Deselect all nodes |
| Drag empty canvas | Pan canvas |
| Scroll | Zoom in/out |
| Click node | Select node + open inspector |
| Drag node | Move node |
| Ctrl+Click node | Multi-select |
| Drag selection box | Multi-select nodes in box |
| Double-click empty canvas | Open node picker / Add node |
| Drag from node port | Create new edge (connection) |
| Drop edge on empty space | Open node picker at that position |
| Right-click node | Context menu |
| Right-click canvas | Canvas context menu |

### 3.3 Minimap

**Position**: Bottom-right of canvas  
**Size**: 200×150px  
**Style**: Semi-transparent, rounded, dark background  
**Content**: Shows all nodes as small rectangles, viewport as blue outline  
**Toggle**: Via top bar icon or keyboard shortcut `M`

### 3.4 Node Visual Language

```
┌────────────────────────────────┐
│  [App Logo]  Node Type Label   │   ← header row (color-coded by category)
│  ────────────────────────────  │
│  Node Name (user-editable)     │   ← main label
│                                │
│  ○ Input port (left side)      │   → Output port (right side) ○
└────────────────────────────────┘
```

**Node width**: 200px fixed  
**Node height**: variable (min 60px)  
**Border radius**: 8px  
**Shadow**: `0 2px 8px rgba(0,0,0,0.12)` (rest), `0 4px 16px rgba(0,0,0,0.20)` (selected)  
**Selected state**: Blue border `2px solid #3b82f6`

### 3.5 Node Category Colors (Header)

| Category | Color |
|----------|-------|
| Trigger | Orange `#f97316` |
| Action | Blue `#3b82f6` |
| AI / LLM | Purple `#8b5cf6` |
| Flow Control | Teal `#14b8a6` |
| Data Transform | Pink `#ec4899` |
| Webhook | Red `#ef4444` |
| Utility | Gray `#6b7280` |
| Custom | Indigo `#6366f1` |

### 3.6 Node States

| State | Visual Change |
|-------|--------------|
| Normal | Default shadow, gray border |
| Selected | Blue border 2px |
| Executing | Pulsing blue border animation |
| Success (last run) | Green dot in top-right corner |
| Error (last run) | Red dot in top-right corner, red tooltip on hover |
| Disabled | 40% opacity, gray badge "Disabled" |
| Pinned data | Teal dot in top-right corner |

### 3.7 Edge (Connection Line) Visual

| State | Style |
|-------|-------|
| Normal | Smooth bezier curve, 2px, `#d1d5db` |
| Selected | `#3b82f6` blue, 2px |
| Conditional (IF/Switch) | Dashed line with label ("true"/"false") |
| Executing | Animated particles traveling along edge |
| Error | Red, 2px |

### 3.8 Context Menus

**Node right-click menu**:
- Rename
- Duplicate
- Disable / Enable
- Add note
- Copy
- Cut
- Delete
- ─────────
- Run from here
- Pin output data
- View last execution data

**Canvas right-click menu** (on empty space):
- Paste (if clipboard has nodes)
- Select all
- ─────────
- Add note (sticky note)
- Fit to screen

---

## 4. Left Panel — Nodes & Tools

**Width**: 260px  
**Background**: `surface` (slight gray)  
**Toggleable**: Collapses to 0px when hidden

### 4.1 Panel Sections (Tabs)

```
[Nodes]  [Variables]  [Versions]  [History]
```

### 4.2 Nodes Tab

**Search bar**: `🔍 Search nodes...` — fuzzy search across all node labels.

**Node categories** (collapsible sections):
- Triggers
- Actions (by integration: Gmail, Sheets, Slack, etc.)
- AI & Agents
- Flow Control
- Data Transform
- Utilities
- Custom Nodes
- Community Nodes

**Node item**:
```
┌──────────────────────────────┐
│  [icon]  Node Label          │
│          Category • subcate  │
└──────────────────────────────┘
```

**Add node**: Drag from panel onto canvas. OR single-click when canvas is in "add mode".

**Favorite nodes**: Star icon on hover → starred nodes appear at top of list.

### 4.3 Variables Tab

Shows all workflow variables accessible in expressions:
```
WORKFLOW INPUT
  $json.email     string
  $json.name      string

PREVIOUS NODE OUTPUT  
  $node["Get User"].json.id    number
  $node["Get User"].json.email string

ENVIRONMENT
  $env.API_KEY    secret
  $env.BASE_URL   string
```

Clicking a variable copies `{{$node["Get User"].json.id}}` to clipboard.

### 4.4 Versions Tab

List of saved versions:
```
Current (unsaved)  ← [3 changes]
v12  2024-01-15 14:30  John  "Added error handler"
v11  2024-01-15 10:15  John  
v10  2024-01-14 09:00  Jane  "Updated email template"
...
```

Click version → preview (read-only). Button to restore.

---

## 5. Right Panel — Node Inspector

**Width**: 380px (resizable 300–500px)  
**Opens when**: Node is selected on canvas  
**Closes when**: Empty canvas click, or close button  
**Tabs**: Params / Output / Settings / Docs

### 5.1 Inspector Header

```
┌─────────────────────────────────────────────────────┐
│  [Node icon]  Node Name              [Rename] [✕]   │
│  Category: Action  •  gmail.send_email               │
├─────────────────────────────────────────────────────┤
│  [Params]  [Output]  [Settings]  [Docs]             │
└─────────────────────────────────────────────────────┘
```

### 5.2 Params Tab

Main configuration form. Every node's parameters rendered here.

**Field types**:
| Field type | Component |
|-----------|-----------|
| text | `<Input>` with expression builder toggle |
| number | `<Input type="number">` |
| boolean | `<Switch>` |
| select | `<Select>` dropdown |
| multi-select | `<MultiSelect>` with chips |
| textarea | `<Textarea>` (multi-line) |
| code editor | Monaco editor (inline, expandable) |
| json editor | Monaco with JSON mode |
| credential | `<CredentialPicker>` |
| file | `<FileUpload>` |
| date | `<DatePicker>` |
| color | `<ColorPicker>` |

**Expression toggle**: Every text/number field has a `{ }` icon on the right that toggles between "literal value" and "expression mode" (shows pink/teal background + expression preview).

**Field group**: Related fields can be grouped in a collapsible section.

**Required fields**: Label has `*` suffix. Empty required field = red border + error tooltip.

**Connection picker** (for nodes that need auth):
```
┌─────────────────────────────────────────────────────┐
│ Connection                                          │
│ [john@gmail.com (Gmail) ▼]  [+ Create connection]  │
└─────────────────────────────────────────────────────┘
```

### 5.3 Output Tab

Shows the last execution output of this node (pinned or latest run).

**States**:
- No data yet: "Run this node to see output"
- Has data: JSON tree viewer with expand/collapse
- Error: Red panel with error message + stack trace

**Output actions**:
- `Pin data` — saves this output as the "always-use" test data
- `Copy JSON` — copies output to clipboard
- `View as table` / `View as JSON` / `View as schema` — toggle buttons (no emoji! just text)

**Pin data indicator**: When data is pinned, orange banner: `⚠ Using pinned data — real execution may differ.`

### 5.4 Settings Tab

Per-node settings (error handling, retry, timeout, notes):

```
Error Handling
  On error: [Stop workflow ▼] / Continue / Error output
  Continue on fail: [☐]
  Retry on fail: [☐]
    Max retries: [3]
    Wait between: [1000ms]

Execution
  Execute once: [☐] (only run once, not per input item)
  Always output: [☐] (output even if input is empty)
  Timeout: [10000ms]

Error workflow: [None ▼]  → separate workflow to trigger on failure

Notes
  [Text area for developer notes...]
  Show note in flow: [☐]
```

### 5.5 Docs Tab

Node documentation rendered from markdown. Sections:
- What this node does
- Parameters reference
- Example use cases
- Common errors

---

## 6. Execution Mode (Bottom Panel)

**Toggle**: Click "Run" button or "Test" in top bar

**Height**: 320px (resizable 200–600px)  
**Position**: Slides up from bottom, overlapping canvas partially

### 6.1 Execution Panel Layout

```
┌─ Execution ─────────────────────────────────────────────────────┐
│ [Run ▶]  [Run from selected node ▶]  [Stop ■]  [Clear]        │
│ Status: ✓ Success  •  3.4s  •  8 nodes completed              │
├─ Node timeline (left) ──────────┬─ Output (right) ──────────── │
│                                 │                               │
│ ✓ Schedule Trigger    0ms      │ {                             │
│ ✓ HTTP Request      450ms  ●   │   "userId": 123,             │
│ ✓ IF Condition       12ms  ●   │   "email": "john@..."        │
│ ✓ Send Email        876ms  ●   │ }                            │
│                                 │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

### 6.2 Node Timeline Item

Clicking a node in the timeline:
- Selects it on canvas
- Shows its I/O in the right panel
- Highlights the node with a ring

### 6.3 Execution States

| State | Color | Animation |
|-------|-------|-----------|
| Pending | Gray | — |
| Running | Blue | Spinner |
| Success | Green | Checkmark |
| Failed | Red | X icon |
| Skipped | Gray | Dashed |

---

## 7. Copilot Panel

**Opens from**: Top bar "Copilot" button  
**Width**: 360px  
**Position**: Right side, pushes inspector or overlays

### 7.1 Layout

```
┌─ FlowHolt Copilot ─────────────────────────────┐
│                                         [✕]    │
├─────────────────────────────────────────────────┤
│ "What would you like to build?"                 │
│                                                 │
│ [Suggestions]                                   │
│ ● Add error handling to this node              │
│ ● Explain what this workflow does              │
│ ● Suggest optimizations                        │
│                                                 │
├─ Messages ──────────────────────────────────────┤
│ [AI response stream...]                         │
├─────────────────────────────────────────────────┤
│ [__________________________________] [Send ↵]  │
└─────────────────────────────────────────────────┘
```

---

## 8. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘S` | Save workflow |
| `⌘Z` | Undo |
| `⌘⇧Z` | Redo |
| `⌘C` | Copy selected nodes |
| `⌘X` | Cut selected nodes |
| `⌘V` | Paste nodes |
| `⌘A` | Select all nodes |
| `Delete` / `Backspace` | Delete selected nodes |
| `⌘⇧F` | Fit to screen |
| `⌘+` | Zoom in |
| `⌘-` | Zoom out |
| `⌘0` | Reset zoom to 100% |
| `Escape` | Deselect all / close inspector |
| `F2` | Rename selected node |
| `⌘D` | Duplicate selected nodes |
| `⌘E` | Execute workflow (run) |
| `⌘K` | Open node picker / command palette |
| `M` | Toggle minimap |
| `G` | Toggle grid snap |
| `H` | Hide/show nodes panel |
| `N` | Add sticky note |

---

## 9. Studio Modals

### 9.1 Workflow Settings Modal

Tabs: General / Trigger / Error Handling / MCP / Tags

**General tab**:
- Workflow name
- Description
- Folder (dropdown)
- Tags (multi-tag input)

**Trigger tab** (varies by trigger type):
- Shows trigger node config inline

**Error handling tab**:
- Error workflow (which workflow to trigger on failure)
- Notification email on failure

**MCP tab** (see spec 71 §4.3)

### 9.2 Node Picker Modal

Opens on `⌘K` or double-click canvas:
```
┌─ Add Node ──────────────────────────────────────────┐
│ 🔍 [Search nodes or type a command...]             │
├─────────────────────────────────────────────────────┤
│ FREQUENTLY USED                                     │
│ [HTTP Request] [Code] [If] [Set] [Merge]            │
│                                                     │
│ BY CATEGORY                                         │
│ Triggers  Actions  AI  Flow Control  ...           │
│                                                     │
│ SEARCH RESULTS                                      │
│ ● HTTP Request — Make HTTP calls to any API        │
│ ● Webhook — Receive HTTP requests                  │
│ ● HTML to Markdown — Convert HTML to MD           │
└─────────────────────────────────────────────────────┘
```

### 9.3 Unsaved Changes Dialog

When navigating away with unsaved changes:
```
┌─ Unsaved Changes ───────────────────────────────────┐
│ You have unsaved changes to "Send Email".           │
│ Do you want to save before leaving?                 │
│                                                     │
│ [Don't save]  [Cancel]  [Save and leave]           │
└─────────────────────────────────────────────────────┘
```

---

## 10. Studio Notes (Sticky Notes)

**Type**: `note` node (non-executing)  
**Visual**: Yellow/amber sticky note appearance  
**Size**: Resizable (drag corners)  
**Content**: Plain text or markdown  
**Position**: Below all nodes (z-index lowest)

**Create**: Right-click canvas → "Add note" or `N` shortcut  
**Edit**: Double-click note to enter edit mode  
**Delete**: Select + Delete key

---

## 11. Responsive Behavior

| Viewport | Changes |
|---------|---------|
| > 1280px | All panels visible |
| 1024–1280px | Inspector auto-narrows to 300px |
| 768–1024px | Inspector overlays (not side-by-side) |
| < 768px | Mobile: Studio not available (show message) |

Mobile message: "The Studio editor requires a screen wider than 768px. Please use a desktop browser."
