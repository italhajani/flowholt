# 69 · FlowHolt: UI Element Complete Inventory

> **Purpose**: Exhaustive inventory of every UI element across every surface of FlowHolt Studio and the platform shell. No element left unplanned. Used by AI models to implement specific UI components correctly.
> **Audience**: Junior AI model implementing any FlowHolt screen. Assumes no prior knowledge of Make or n8n UI patterns.
> **Sources**: Make.com UI crawl findings (spec 40), n8n exhaustive catalog (spec 42), FlowHolt design system (spec 59), FlowHolt studio specs (07, 11, 15), FlowHolt page inventory (40-frontend).
> **Design System**: White/zinc backgrounds, black primary, emerald green accent. React + Radix UI + Tailwind. NOT dark mode — it's light mode professional.

---

## Cross-Reference Map

| Section | Primary Source |
|---------|---------------|
| §1 Shell / Nav | spec 40 §2a, spec 59 §3, spec 40-frontend |
| §2 Dashboard | spec 40-frontend §2, spec 59 §4 |
| §3 Workflows List | spec 40-frontend §3, spec 42 §1 |
| §4 Studio Header | spec 42 §1.1–1.4, spec 40 §2b |
| §5 Studio Canvas | spec 42 §2, spec 40 §2c–2e, spec 11 |
| §6 Node Inspector | spec 42 §5, spec 15, spec 26 |
| §7 Execution Log | spec 42 §6, spec 40 §5 |
| §8 Left Rail Panels | spec 42 §8, spec 40 §2f |
| §9 Modals | spec 42 §9, spec 15 |

---

## 1. App Shell — Global Navigation

### 1.1 Top Header Bar

**Component**: `<AppHeader>` — fixed, full-width, height 48px, background `--background`, border-bottom `--border`

**Left section** (left-to-right):
| Element | Type | Description | Width |
|---------|------|-------------|-------|
| FlowHolt logo | `<img>` | Logo mark (f-shaped SVG) with wordmark "FlowHolt" | 140px |
| Org switcher | `<DropdownMenu>` | Shows current org name + down-caret. Opens org list. | 180px |
| Team switcher | `<DropdownMenu>` | Shows current team name. Context-sensitive. | 160px |

**Center section** (hidden below md breakpoint):
| Element | Type | Description |
|---------|------|-------------|
| Global search | `<Command>` dialog trigger | `⌘K` shortcut, "Search workflows, nodes, templates..." placeholder, magnifying glass icon |

**Right section** (left-to-right):
| Element | Type | Description | Visible |
|---------|------|-------------|---------|
| Notifications bell | `<Button variant="ghost">` | Badge with unread count (max 99+) | Always |
| Help/docs | `<DropdownMenu>` | `?` icon → Documentation, Changelog, Community, Support | Always |
| User avatar | `<DropdownMenu>` | User photo/initials → Profile, Settings, Sign out | Always |

**Org Switcher Dropdown Contents**:
- Search orgs input (if more than 5 orgs)
- Org list items (logo + name + plan badge)
- "+ Create Organization" at bottom
- Current org marked with checkmark

**Team Switcher Dropdown Contents**:
- Team list for current org
- "+ Create Team" at bottom

---

### 1.2 Left Sidebar Navigation

**Component**: `<Sidebar>` — fixed left, width 240px (collapsed: 60px), full viewport height below header, background `--surface`

**Toggle**: Expand/collapse button at bottom (left arrow icon when expanded, right arrow when collapsed). State persisted to localStorage.

**Navigation sections** (top to bottom):

#### Primary Nav Items (always shown)

| Item | Icon | Route | Badge |
|------|------|-------|-------|
| Home / Dashboard | `House` | `/` | — |
| Workflows | `GitBranch` | `/workflows` | Count of active workflows |
| Executions | `Play` | `/executions` | Count of failed runs (red badge) |
| AI Agents | `Bot` | `/agents` | "New" badge (first 30 days) |
| Templates | `Layout` | `/templates` | — |

#### Workspace Resources (below divider)

| Item | Icon | Route |
|------|------|-------|
| Credentials | `KeyRound` | `/credentials` |
| Webhooks | `Webhook` | `/webhooks` |
| Data Stores | `Database` | `/data-stores` |
| Variables | `Variable` | `/variables` |
| Custom Functions | `Code2` | `/functions` |

#### Bottom Nav Items (pinned to bottom)

| Item | Icon | Route |
|------|------|-------|
| Settings | `Settings` | `/settings` |
| Help & Docs | `HelpCircle` | External docs URL |

**Collapsed state**: Shows only icons, tooltips on hover showing label.

**Active state**: Current item has `bg-zinc-100 font-medium text-zinc-900`. All others `text-zinc-600`.

**Empty state per nav item**: When user navigates to a section with no content, show inline empty state (see §3).

---

### 1.3 Breadcrumb Component

**Component**: `<Breadcrumb>` — shown in page header area, below the app header (not in Studio — Studio has its own).

**Structure**: `Home / Workflows / My Project / My Workflow`

| Element | Behavior |
|---------|----------|
| Each crumb | Clickable link, `text-zinc-500 hover:text-zinc-900` |
| Last crumb | Not clickable, `text-zinc-900 font-medium` |
| Separator | `/` character, `text-zinc-400` |
| Overflow (>4 levels) | Middle items collapse to `...` with tooltip on hover |

---

## 2. Dashboard Page (`/`)

**Layout**: Full-width content area with 4-column grid for stat cards, then recent items sections.

### 2.1 Stat Cards Row

4 cards in a row (2 on mobile), each:

| Stat | Icon | Color | Value type |
|------|------|-------|-----------|
| Total Workflows | `GitBranch` | zinc | Count |
| Active Workflows | `PlayCircle` | green | Count |
| Executions This Month | `BarChart3` | blue | Count |
| Errors This Month | `AlertCircle` | red | Count |

**Each card structure**:
- Background: `--surface`, border `--border`, border-radius 8px, padding 20px
- Icon: 24px, left-aligned in header row
- Metric value: `text-2xl font-semibold text-zinc-900`
- Label: `text-sm text-zinc-500`
- Trend delta: `+12%` in green or `-5%` in red, `text-xs`

### 2.2 Recent Workflows Section

**Title**: "Recent Workflows" with "View All →" link right-aligned.

**Table** (last 5 workflows):
| Column | Content |
|--------|---------|
| Name | Workflow name (clickable, opens Studio) |
| Status | Active (green dot) / Inactive (gray dot) |
| Last Run | Relative time ("2 hours ago") |
| Next Run | For scheduled: "in 15 minutes". For webhook: "On trigger" |
| Runs (7d) | Sparkline chart (mini bar chart) |

### 2.3 Recent Executions Section

**Title**: "Recent Executions" with "View All →" link.

**Table** (last 10 executions):
| Column | Content |
|--------|---------|
| Workflow | Name + small icon |
| Status | Colored badge: Success (green), Error (red), Running (blue spinner), Pending (gray) |
| Trigger | Manual / Schedule / Webhook / MCP |
| Duration | "1.2s", "45ms" |
| Time | "3 minutes ago" |

### 2.4 Quick Actions Row

Below stats, a row of action buttons:

| Button | Icon | Action |
|--------|------|--------|
| New Workflow | `+` | Opens New Workflow modal |
| Browse Templates | `Layout` | Navigates to Templates |
| Import Workflow | `Upload` | Opens file picker for JSON import |
| View Docs | `ExternalLink` | Opens docs in new tab |

### 2.5 Dashboard Empty State

When user has no workflows at all:
- Large centered area
- Illustration SVG (workflow graph sketch)
- Heading: "Welcome to FlowHolt"
- Subtext: "Build your first automation workflow in minutes."
- Two CTAs: "Create Workflow" (primary black button) and "Browse Templates" (secondary)

---

## 3. Workflows List Page (`/workflows`)

### 3.1 Page Header

| Element | Description |
|---------|-------------|
| Title | "Workflows" `h1 text-xl font-semibold` |
| Subtitle | "N workflows across M folders" |
| New Workflow button | Black primary button, `+` icon, top-right |
| Import button | Secondary button, `Upload` icon |

### 3.2 Filter/Search Bar

Horizontal row below page header:

| Element | Type | Behavior |
|---------|------|----------|
| Search input | `<Input>` | Debounced 300ms, searches name, description, tags |
| Status filter | `<Select>` | All / Active / Inactive / Draft / Archived |
| Folder filter | `<Select>` | All folders / specific folder |
| Tag filter | `<MultiSelect>` | Pick 1+ tags |
| Sort by | `<Select>` | Modified (default) / Created / Name / Runs |
| Sort direction | Icon toggle | Ascending / Descending |
| View toggle | Icon buttons | List view / Grid view |
| Clear filters | Text link | Appears when any filter active |

### 3.3 Folder Tree (Left mini-panel, 200px wide)

| Element | Description |
|---------|-------------|
| "All Workflows" | Root item, shows total count |
| Folder items | Indented, expandable, with count badge |
| + New Folder | Text button at bottom |
| Drag-to-reorder | Drag folder to reorder |
| Right-click menu | Rename, Delete, Move |

### 3.4 Workflow List Table (List View)

Columns:

| Column | Type | Width | Sortable |
|--------|------|-------|---------|
| Checkbox | Select all | 40px | No |
| Status dot | Active/inactive | 32px | No |
| Name | Text + folder path | flex | Yes |
| Tags | Pill badges | 120px | No |
| Last modified | Relative time | 120px | Yes |
| Last run | Relative time + status icon | 140px | Yes |
| Run count (30d) | Number + sparkline | 100px | Yes |
| Actions | `...` menu | 40px | No |

**Row hover state**: Background `--surface-raised`, show action buttons.

**Row right-click (context menu)**:
- Open
- Edit
- Duplicate
- Rename
- Move to Folder →
- Export as JSON
- Archive
- Delete (shows confirmation inline)

**Row action button `...` menu**: Same as context menu but triggered by button.

### 3.5 Workflow Grid View (Grid View)

Cards in 3-column responsive grid.

**Each card**:
- Background: `--surface`, border, 12px radius, padding 16px
- Top: Status dot (left) + `...` menu (right)
- Center: Workflow name `font-medium`
- Tags row (small pills)
- Footer: "Last run: 2h ago • 45 runs"
- Hover: border darkens, subtle elevation

### 3.6 Bulk Actions Bar

Appears at bottom of page when 1+ rows selected:

| Element | Description |
|---------|-------------|
| Count | "3 selected" |
| Activate | Enable selected workflows |
| Deactivate | Disable selected |
| Move to... | Folder picker |
| Export | Download as JSON zip |
| Archive | Archive selected |
| Delete | Delete with confirmation modal |
| Deselect | "✕ Clear selection" |

### 3.7 Workflow List Empty State

**No workflows exist**:
- Heading: "No workflows yet"
- Subtext: "Automate your first task with a workflow."
- CTA: "Create Workflow" (primary) + "Browse Templates" (secondary)
- Illustration: SVG of a node graph

**Search returned no results**:
- Icon: magnifying glass
- Heading: "No workflows match your search"
- Subtext: "Try clearing your filters or searching for something else."
- CTA: "Clear filters"

---

## 4. Studio — Header Bar

**Component**: `<StudioHeader>` — fixed, height 56px, full-width, background `--background`, border-bottom `--border`

### 4.1 Left Section

| Element | Type | Behavior |
|---------|------|----------|
| Back arrow | Icon button | Navigate back to workflow list (with unsaved-changes guard) |
| Folder breadcrumb | Small text | "My Project /" (clickable, navigates to folder) |
| Workflow name | Inline editable text | Click to edit, Enter to confirm, Esc to cancel. Max 128 chars. On blur saves. |
| Unsaved indicator | `*` suffix | Appended to name when unsaved changes exist |
| Tags | Tag pills | Click to edit tags. `+ Add tag` link when empty |

### 4.2 Center Section (Tab Bar)

3 tabs, permanently visible:

| Tab | Label | Route | Keyboard |
|-----|-------|-------|---------|
| Editor | `Code2` icon + "Editor" | `/workflows/{id}` | `Ctrl+1` |
| Executions | `Play` icon + "Runs" | `/workflows/{id}/runs` | `Ctrl+2` |
| Settings | `Settings` icon + "Settings" | `/workflows/{id}/settings` | `Ctrl+3` |

Active tab: `border-b-2 border-zinc-900 text-zinc-900`. Inactive: `text-zinc-500`.

### 4.3 Right Section

| Element | Type | Behavior |
|---------|------|----------|
| Auto-save text | Small text | "Saved 2 min ago" / "Saving..." / "Unsaved changes" |
| Collaboration avatars | Stacked avatars | Other users viewing (up to 3, then "+2 more") |
| Run workflow | Split button (primary black) | Left: "Run" triggers manual execution. Right: dropdown to pick trigger. Keyboard: `Ctrl+Enter` |
| Stop button | Red button (replaces Run during run) | Stops current execution |
| Publish | Button (secondary, border) | Publishes workflow. State machine: see §4.4 |
| `⋮` Actions menu | Dropdown | 12+ actions (see §4.5) |

### 4.4 Publish Button States

| State | Button text | Color/style | Enabled |
|-------|-------------|-------------|---------|
| No triggers | "Publish" | ghost/disabled | No |
| Has errors | "Publish" | ghost/disabled | No |
| Not published | "Publish" | secondary border | Yes |
| Published, up-to-date | "Published" | green text, check icon | No (already done) |
| Published, has changes | "Publish changes" | secondary border, yellow dot | Yes |
| Published, now has errors | "Fix issues" | red text, error icon | No — opens validator |

### 4.5 Actions Dropdown (⋮ menu)

| Action | Icon | Condition | Keyboard |
|--------|------|-----------|---------|
| Edit description | `PenLine` | Not archived | — |
| Rename | `Pencil` | Not archived | `F2` |
| Duplicate | `Copy` | Not archived | `Ctrl+Shift+D` |
| Download JSON | `Download` | Always | — |
| Import from file | `Upload` | Not archived | — |
| Import from URL | `Link` | Not archived | — |
| Move to folder | `FolderOpen` | Not archived | — |
| View version history | `Clock` | Always | — |
| Export as template | `BookTemplate` | Not archived | — |
| Share | `Share2` | Has share permission | — |
| Archive | `Archive` | Can delete, not archived | — |
| Unarchive | `ArchiveRestore` | Is archived | — |
| Delete | `Trash2` | Can delete, is archived | `Del` |

---

## 5. Studio Canvas

### 5.1 Canvas Layout Structure

The canvas is the main editing area. It occupies all space not taken by the header or panels.

```
┌─────────────────────────────────────────────────────┐
│  StudioHeader (56px)                                │
├──────────────────────────────────────────────────────┤
│  ┌──────────┐                               ┌─────┐  │
│  │ Left     │                               │ NDV │  │
│  │ Rail     │   CANVAS (React Flow)         │Panel│  │
│  │ (240px   │                               │(380│  │
│  │ when     │                               │px) │  │
│  │ open)    │                               │     │  │
│  └──────────┘                               └─────┘  │
│  [Canvas Toolbar — bottom row, height 48px]          │
└─────────────────────────────────────────────────────┘
```

### 5.2 Canvas Toolbar (Bottom Bar)

**Component**: `<CanvasToolbar>` — fixed at bottom of canvas area, height 48px, background `--background`, border-top `--border`

**Left section**:
| Button | Icon | Tooltip | Keyboard |
|--------|------|---------|---------|
| Zoom out | `ZoomOut` | "Zoom out" | `-` |
| Zoom level | Text button | "100%" — click to reset to 100% | `Ctrl+0` |
| Zoom in | `ZoomIn` | "Zoom in" | `+` |
| Fit to screen | `Maximize2` | "Fit canvas to screen" | `Ctrl+Shift+F` |
| Lock/unlock | `Lock` / `Unlock` | "Lock canvas" | — |

**Center section**:
| Button | Icon | Tooltip | Keyboard |
|--------|------|---------|---------|
| Run workflow | `Play` (large) | "Run workflow (Ctrl+Enter)" | `Ctrl+Enter` |
| Stop execution | `Square` (appears during run) | "Stop" | `Ctrl+.` |

**Right section**:
| Button | Icon | Tooltip | Active state |
|--------|------|---------|-------------|
| Variables panel | `Variable` | "Variables & Env" | Background highlight |
| Connections panel | `Plug` | "Connections" | Background highlight |
| Versions panel | `Clock` | "Version History" | Background highlight |
| Notes panel | `StickyNote` | "Notes" | Background highlight |
| Debug panel | `Bug` | "Debug" | Background highlight |
| Logs panel | `FileText` | "Execution Logs" | Background highlight |

### 5.3 Canvas Mini-Map

**Component**: `<MiniMap>` — bottom-right corner of canvas (if enabled), 200×140px, background `rgba(255,255,255,0.9)`, border `--border`, border-radius 6px.

- Shows nodes as colored rectangles (node color = integration color)
- Shows current viewport as blue rectangle
- Drag viewport rectangle to pan
- Toggle: `Ctrl+M`
- Collapsed by default. State saved to localStorage.

### 5.4 Canvas Keyboard Shortcuts

Full keyboard shortcut table for canvas:

| Shortcut | Action | Context |
|----------|--------|---------|
| `N` | Add node (open Node Creator) | Canvas focus |
| `Ctrl+Enter` | Run workflow | Canvas focus |
| `Ctrl+.` | Stop execution | During run |
| `Ctrl+S` | Save workflow | Always |
| `Ctrl+Z` | Undo | Canvas focus |
| `Ctrl+Shift+Z` | Redo | Canvas focus |
| `Ctrl+A` | Select all nodes | Canvas focus |
| `Escape` | Deselect all / Close panel | Canvas focus |
| `Delete` / `Backspace` | Delete selected node(s) | Node(s) selected |
| `Ctrl+C` | Copy selected node(s) | Node(s) selected |
| `Ctrl+V` | Paste | Canvas focus |
| `Ctrl+X` | Cut selected | Node(s) selected |
| `Ctrl+D` | Duplicate selected node(s) | Node(s) selected |
| `Enter` | Open NDV for selected node | Single node selected |
| `Space` | Rename selected node | Single node selected |
| `D` | Disable/enable selected node(s) | Node(s) selected |
| `P` | Pin/unpin data on selected node | Single node selected |
| `R` | Replace node | Single node selected |
| `Shift+S` | Add sticky note | Canvas focus |
| `Ctrl+Shift+F` | Fit canvas to screen | Canvas focus |
| `Ctrl+0` | Reset zoom to 100% | Canvas focus |
| `+` | Zoom in | Canvas focus |
| `-` | Zoom out | Canvas focus |
| `Ctrl+M` | Toggle mini-map | Canvas focus |
| `Shift+Alt+T` | Auto-layout nodes (tidy up) | Canvas focus |
| `Ctrl+K` | Open global search | Always |
| `Ctrl+1` | Switch to Editor tab | Studio |
| `Ctrl+2` | Switch to Runs tab | Studio |
| `Ctrl+3` | Switch to Settings tab | Studio |

### 5.5 Canvas Context Menu (Right-Click)

#### When clicking on empty canvas area:

| Action | Icon | Shortcut |
|--------|------|---------|
| Add node | `Plus` | `N` |
| Add sticky note | `StickyNote` | `Shift+S` |
| Select all | `CheckSquare` | `Ctrl+A` |
| Auto-layout | `LayoutGrid` | `Shift+Alt+T` |
| Paste | `Clipboard` | `Ctrl+V` |

#### When single node selected:

| Action | Icon | Shortcut | Condition |
|--------|------|---------|----------|
| Open / Edit | `ExternalLink` | `Enter` | Always |
| Run this node | `Play` | — | Not webhook trigger |
| Copy test URL | `Copy` | `Shift+Alt+U` | Webhook nodes only |
| Copy production URL | `Copy` | `Alt+U` | Webhook nodes only |
| Rename | `Pencil` | `Space` | Not read-only |
| Replace node | `ArrowLeftRight` | `R` | Not read-only |
| Open sub-workflow | `ExternalLink` | `Ctrl+Shift+O` | Sub-workflow nodes |
| Enable / Disable | `ToggleLeft` | `D` | Not read-only |
| Pin / Unpin data | `Pin` | `P` | Not read-only |
| Copy | `Copy` | `Ctrl+C` | Always |
| Duplicate | `CopyPlus` | `Ctrl+D` | Not read-only |
| Extract to sub-workflow | `Scissors` | `Alt+X` | Not read-only |
| Auto-layout | `LayoutGrid` | `Shift+Alt+T` | Not read-only |
| Select all | `CheckSquare` | `Ctrl+A` | Always |
| Delete | `Trash2` | `Delete` | Not read-only |
| ─── | Divider | — | — |
| Add note | `StickyNote` | — | Not read-only |

#### When multiple nodes selected:

Same as single node except: no `Open`, no `Run this node`, no `Rename`, no `Replace`, no sub-workflow. Labels become plural ("Copy 3 nodes", "Delete 3 nodes").

#### When right-clicking on an edge (connection):

| Action | Icon |
|--------|------|
| Add node between | `Plus` |
| Delete connection | `Trash2` |

### 5.6 Node Cards on Canvas

**Node card structure** (80px wide, variable height):

```
┌──────────────────────────────┐
│ ● [Integration Icon] [Name]  │  ← Title row (bg = integration color, 32px)
│ [Status icon if disabled]    │
├──────────────────────────────┤
│   Subtitle (node action)     │  ← Subtitle row, bg white, 24px
└──────────────────────────────┘
```

**Node states**:

| State | Visual |
|-------|--------|
| Default | Standard card |
| Selected | Blue border ring |
| Disabled | Gray overlay, opacity 50% |
| Error | Red border |
| Running | Blue pulsing border animation |
| Success (after run) | Green checkmark badge top-right |
| Error (after run) | Red X badge top-right + error count |
| Pinned data | Blue pin icon top-right |
| Has issues | Yellow warning icon top-right |

**Node connection handles**:
- Input: Left center, circle, gray bg, green on hover
- Output: Right center, circle, gray bg, green on hover
- Multiple outputs: Stacked vertically on right side, each labeled

### 5.7 Edge (Connection) Styles

| State | Style |
|-------|-------|
| Default | Thin gray line (1px) |
| Selected | Blue thick line (2px) |
| Hover | Darker gray |
| Active during run | Animated blue dashes |
| Error path | Red |
| Disabled | Dashed gray |

### 5.8 Sticky Notes

**Component**: `<StickyNote>` — draggable, resizable rectangle on canvas.

| Property | Value |
|----------|-------|
| Default size | 200×150px |
| Min size | 100×80px |
| Colors | Yellow (default), pink, blue, green, purple, gray |
| Content | Rich text (bold, italic, list, link) |
| Font | `text-sm`, system font |
| Z-index | Below nodes by default |
| Edit mode | Double-click to enter edit |
| Selection | Single click selects, shows resize handles |
| Context menu | Edit, Change color, Duplicate, Delete |
| Keyboard `Shift+S` | Creates new sticky at center of viewport |

### 5.9 Canvas Empty States

**New workflow (no nodes)**:
- Large `+` button in center (64px circle, border-dashed)
- Text: "Add your first node"
- Subtext: "Press N or click to browse integrations"
- When AI builder is available: Add a second option "Build with AI" below

**Selection box (marquee select)**:
- Blue semi-transparent rectangle while dragging
- `background: rgba(59, 130, 246, 0.1)`, `border: 1px solid #3B82F6`

---

## 6. Node Inspector (NDV — Node Details View)

**Component**: `<NodeInspector>` — slides in from right side of canvas. Width: 380px. Height: full canvas height. Background: `--background`. Border-left: `--border`. Resizable: drag left edge to resize (min 320px, max 600px).

### 6.1 NDV Header

| Element | Description |
|---------|-------------|
| Node icon | 32px integration icon, colored |
| Node name | Inline editable, click to rename |
| Node type label | Small text below name, e.g. "HTTP Request" |
| Close button | `X` icon, top-right, closes NDV |
| Expand button | `Expand` icon — expands NDV to full-width overlay |
| Disable toggle | `ToggleLeft` — enable/disable node inline |

### 6.2 NDV Tab Bar

5 tabs (not all tabs visible for all node types):

| Tab | Icon | Content | Always shown |
|-----|------|---------|-------------|
| Parameters | `Settings2` | Node configuration | Yes |
| Input | `ArrowRight` | Incoming data from previous node | After first run |
| Output | `ArrowLeft` | Data produced by this node | After first run |
| Settings | `SlidersHorizontal` | Execution settings (retry, etc.) | Yes |
| Docs | `BookOpen` | Integration documentation inline | Yes (if docs available) |

For AI nodes, an additional tab:
| Tab | Icon | Content |
|-----|------|---------|
| AI | `Sparkles` | `$fromAI()` auto-fill fields |

### 6.3 Parameters Tab — Input Types

Full inventory of all parameter input types FlowHolt must implement:

#### String / Text Input
| Property | Value |
|----------|-------|
| Component | `<Input>` with optional expression toggle |
| Expression toggle | Toggle button on right side of input. When active: shows expression editor with Monaco |
| Pill display | When expression has references to previous nodes, they show as colored pills (e.g., `{{ node1.email }}`) |
| Drag-to-map | Can drag fields from Input/Output panels onto this field |

#### Number Input
| Property | Value |
|----------|-------|
| Component | `<Input type="number">` |
| Min/max | Enforced if specified in node definition |
| Expression toggle | Yes |

#### Boolean / Toggle
| Property | Value |
|----------|-------|
| Component | `<Switch>` |
| Expression toggle | No (options are true/false only) |

#### Dropdown / Select
| Property | Value |
|----------|-------|
| Component | `<Select>` with search |
| Static options | From node definition |
| Dynamic options | `loadOptions` API call populates list |
| Expression toggle | Yes (allows mapping a variable to the field) |

#### Multi-Select
| Property | Value |
|----------|-------|
| Component | `<MultiSelect>` (Combobox) |
| Display | Selected items show as pills with X to remove |
| Search | Filterable list |

#### Code Editor
| Property | Value |
|----------|-------|
| Component | Monaco Editor (embedded) |
| Languages | JavaScript, Python, JSON, HTML, CSS |
| Height | Expandable (min 120px, max 400px) |
| Features | Syntax highlighting, bracket matching, autocomplete for FlowHolt context variables |
| Theme | Light |
| Full-screen | Expand button opens full-screen Monaco overlay |

#### JSON Input
| Property | Value |
|----------|-------|
| Component | Code editor with JSON mode |
| Validation | Real-time JSON syntax validation |
| Parse error | Red underline + error message |

#### Date / DateTime
| Property | Value |
|----------|-------|
| Component | `<DatePicker>` |
| Format | ISO 8601 stored internally |
| Display | Locale-formatted |
| Expression toggle | Yes |

#### Color Picker
| Property | Value |
|----------|-------|
| Component | Color swatch click → color picker popover |
| Output | Hex string |

#### Collection (Object builder)
| Property | Value |
|----------|-------|
| Component | `<CollectionInput>` — key-value pairs |
| Add button | "+ Add item" at bottom |
| Each row | Key input (string) + Value input (any type) |
| Remove | `X` icon on each row |

#### Fixed Collection (Named Object)
| Property | Value |
|----------|-------|
| Component | `<FixedCollection>` — pre-defined keys, values filled by user |
| Structure | Keys are fixed (from node definition), values are inputs |

#### Array
| Property | Value |
|----------|-------|
| Component | `<ArrayInput>` — list of same-type items |
| Add button | "+ Add item" |
| Each item | Single type input (matches element type) |
| Remove | `X` per item |
| Reorder | Drag handles |

#### Credential Select
| Property | Value |
|----------|-------|
| Component | `<CredentialSelect>` |
| Display | Dropdown of available credentials for this type |
| Add new | "Connect new {service}" link at bottom of dropdown |
| Edit | Pencil icon to edit selected credential |
| Status | Green dot (valid) / Red dot (invalid / needs reauth) |

#### File / Binary
| Property | Value |
|----------|-------|
| Component | File picker or expression field |
| Types | Can accept binary from previous nodes |

#### Password / Secret
| Property | Value |
|----------|-------|
| Component | `<Input type="password">` with show/hide toggle |
| Storage | Never shown in output, masked in logs |

#### Resource Locator (URL + Mode switcher)
| Property | Value |
|----------|-------|
| Component | Mode dropdown (URL / ID / Name) + value input |
| Modes | Predefined by node definition |
| Search mode | Autocomplete from API |

### 6.4 Expression Editor

When expression toggle is activated on any input:

| Element | Description |
|---------|-------------|
| Expression toggle | Button with `{{ }}` icon. Active = blue ring |
| Input area | Monaco editor (single-line or multi-line depending on field) |
| Pill rendering | References like `{{ $node["HTTP Request"].json.email }}` render as colored pills in preview mode |
| Autocomplete | Opens on `$` or `{{` — suggests: `$json`, `$node["name"]`, `$input`, `$runIndex`, `$now`, `$today`, `$jmespath()`, `$if()`, `$isEmpty()`, `$mergeObjects()` |
| Syntax reference | `?` link opens docs sidebar |
| Error state | Red border + error description below if expression is invalid |
| Result preview | Shows evaluated result below input if data is available |

### 6.5 Drag-to-Map (From Input/Output Panels)

| Behavior | Detail |
|----------|--------|
| Drag source | Any field row in Input or Output panel |
| Drop target | Any expression-enabled parameter field |
| Visual | Ghost pill appears while dragging |
| On drop | Inserts `{{ $node["NodeName"].json.fieldName }}` into field |
| Multiple fields | Can drag and drop multiple fields to build expression |

### 6.6 Input Tab

Shows data flowing INTO the current node from the previous node.

**Display modes** (toggle buttons at top):

| Mode | Icon | Description |
|------|------|-------------|
| Table | `Table2` | Structured table view of item fields |
| JSON | `Braces` | Raw JSON of item(s) |
| Schema | `List` | Field names + types only (no values) |

**Controls**:
| Element | Description |
|---------|-------------|
| Item selector | "Item 1 of N" with prev/next arrows (for array items) |
| Search fields | Filter field names |
| Pin button | Pin this data so it's used even when node is re-run |
| Run button | "Fetch input data" when no data loaded |
| Expand | Full-height view |

**Pinned data indicator**: Blue "PINNED" badge when data is pinned. "Using pinned data" warning bar below controls.

### 6.7 Output Tab

Shows data produced BY the current node.

Same display modes as Input tab (Table / JSON / Schema).

**Additional controls**:
| Element | Description |
|---------|-------------|
| Run node button | "Test step" — runs just this one node |
| Clear output | Clears current output |
| Item count | "3 items" shown below run button |

**Error state**: When node ran with error, shows red error card with:
- Error type badge
- Error message text
- Stack trace (collapsible)
- "Retry" button

### 6.8 Settings Tab

Node-level execution settings (all optional):

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Retry on fail | Switch | Off | Enable retry |
| Max retries | Number input | 3 | Max retry attempts (shown when retry enabled) |
| Retry interval | Number + unit | 1s | Wait between retries |
| Backoff factor | Number | 2 | Exponential backoff multiplier |
| Continue on fail | Switch | Off | Continue workflow even if this node errors |
| Timeout | Number + unit | None | Max execution time for this node |
| Execute once | Switch | Off | Execute only for first input item, ignore rest |
| Error workflow | Credential-like select | None | Workflow to call when this node errors |
| Notes | Textarea | — | Developer notes for this node |
| Display note | Switch | Off | Show note as badge on node in canvas |
| Node color | Color picker | Default | Custom color for node card header |

### 6.9 Docs Tab

Inline documentation for the integration:
- Integration name + logo
- Description paragraph
- Link to full docs (opens in new tab)
- Credential setup instructions
- Common use cases
- API reference link

### 6.10 AI Tab (for AI nodes only)

For nodes with `$fromAI()` parameter support:

| Element | Description |
|---------|-------------|
| `$fromAI()` fields list | Shows all parameters that can be auto-filled by AI |
| Each field | Field name + description textarea + example value |
| Description override | User can override the auto-generated field description for better AI comprehension |
| "How it works" info | Explains that the AI agent will fill these values at runtime |

---

## 7. Execution Log Panel

**Component**: `<ExecutionLogPanel>` — slides up from bottom of canvas. Or: shown in "Runs" tab in Studio.

### 7.1 Runs List

**Panel header**:
| Element | Description |
|---------|-------------|
| Title | "Execution History" |
| Filter | Status filter: All / Success / Error / Running |
| Date range | "Last 7 days" (dropdown: Today / 7d / 30d / Custom) |
| Refresh | Auto-refresh toggle + manual refresh button |

**Each execution row**:
| Column | Content |
|--------|---------|
| Status icon | ✅ success / ❌ error / ⚠️ warning / 🔵 running |
| Run ID | Short truncated ID (hover for full) |
| Trigger | Manual / Schedule / Webhook / MCP |
| Started | Relative time ("3 min ago") |
| Duration | "1.2s" |
| Items processed | "42 items" |
| Operations | "5 ops" |
| Actions | Retry button, Delete button |

**Row expand** (click to expand):
- Shows per-node execution tree
- Each node: name, status chip, items in/out, duration
- Error node: red background, error message shown

**Row actions**:
| Action | Description |
|--------|-------------|
| View detail | Opens Execution Detail modal |
| Retry | Re-runs from scratch |
| Resume | Re-runs from error point (if incomplete execution saved) |
| Delete | Removes log entry |

### 7.2 Execution Detail Modal

Full-screen modal showing:
- Left panel: Node list (run tree)
- Right panel: Node detail (input/output for selected node)
- Top: Run metadata (ID, status, duration, trigger, started/ended)
- Node list colors: green (success), red (error), gray (not executed), yellow (warning)

---

## 8. Left Rail Panels (Studio)

Panels opened via canvas toolbar buttons. Each slides in from the left, 280px wide, does not overlap canvas (canvas shifts right).

### 8.1 Variables Panel

**Header**: "Variables" + "+" New button

**Content**:
| Element | Description |
|---------|-------------|
| Env group | "Environment Variables" section |
| Var list | Each var: Name / Value preview (masked if secret) |
| Add variable | Name input + value input + secret toggle |
| Edit variable | Click var to expand + edit inline |
| Delete | `Trash2` icon on hover |
| Search | Filter input at top |

**Info box**: "Variables are available in all nodes as `$vars.variableName`"

### 8.2 Credentials Panel

**Header**: "Credentials" + "+" New button

**Content**:
| Element | Description |
|---------|-------------|
| Search | Filter by name or integration type |
| Credential list | Integration icon + name + type + status dot |
| Status | Valid (green) / Invalid (red, click to fix) / Expiring (yellow) |
| Click credential | Opens Credential Detail modal |
| "Add credential" | Opens Credential creation modal |

### 8.3 Versions Panel

**Header**: "Version History"

**Content**:
| Element | Description |
|---------|-------------|
| Version list | Each: version number + timestamp + author |
| Current version | Highlighted at top with "Current" badge |
| Named versions | Optional name label (enterprise feature) |
| Restore button | Opens confirmation modal |
| View diff | Shows visual diff overlay on canvas |

### 8.4 Notes Panel

**Header**: "Workflow Notes"

**Content**:
- Rich text editor (bold, italic, lists, links, headings)
- Notes auto-save on change (debounced 500ms)
- Note is visible to all workspace members with access

### 8.5 Debug Panel

**Header**: "Debug Console"

**Content**:
| Element | Description |
|---------|-------------|
| Log stream | Timestamped log lines from last execution |
| Log levels | Error (red), Warning (yellow), Info (blue), Debug (gray) |
| Clear button | Clears log display |
| Copy button | Copies all logs to clipboard |
| Filter | By log level |

### 8.6 MCP Tools Panel

**Header**: "MCP Tools" + Settings link

**Content**:
- List of external MCP servers configured
- Each: server name + URL + connection status
- Tools list (expandable): each tool from each server
- "Add MCP Server" button → opens config modal

---

## 9. Modals Inventory

### 9.1 New Workflow Modal

**Trigger**: "+ New Workflow" button anywhere

| Element | Description |
|---------|-------------|
| Title | "Create Workflow" |
| Name field | Required. Placeholder: "Untitled Workflow". Max 128 chars |
| Folder select | Optional. Dropdown of folders. "+ Create folder" option |
| Tags | Optional. Tag picker |
| Description | Optional textarea |
| Start from template | Toggle switch — if on, shows template gallery below |
| Template gallery | Scrollable grid of templates filtered by popular |
| Cancel | Secondary button |
| Create | Primary black button. Navigates to Studio after creation |

### 9.2 Duplicate Workflow Modal

| Element | Description |
|---------|-------------|
| Title | "Duplicate Workflow" |
| New name | Pre-filled "{name} (copy)". Editable |
| Destination folder | Dropdown |
| Copy credentials? | Checkbox — whether to copy credential associations |
| Cancel | Secondary |
| Duplicate | Primary |

### 9.3 Share Workflow Modal

| Section | Elements |
|---------|----------|
| Share link | Toggle: "Anyone with link can view" |
| URL | Copy button, URL display |
| Team members | Table: member / role / remove |
| Invite | Email input + role dropdown + "Invite" button |
| Permissions | View / Edit / Admin — per person |
| Public template | Toggle: "Publish as template" |
| Close | Primary button |

### 9.4 Export Workflow Modal

| Element | Description |
|---------|-------------|
| Format | JSON (default) |
| Include credentials | Checkbox (unchecked by default for security) |
| Include execution history | Checkbox |
| Download button | Primary |

### 9.5 Import Workflow Modal

| Element | Description |
|---------|-------------|
| Drag-drop area | Drop zone for JSON file |
| Browse button | File picker |
| Import from URL | URL input field |
| Preview | Shows workflow name and node count after file selected |
| Import button | Primary. Creates workflow and navigates to Studio |

### 9.6 Credential Create/Edit Modal

**Two views**: Simple (API key / basic auth) and OAuth2 (with button flow).

| Element | Description |
|---------|-------------|
| Title | "Connect {ServiceName}" |
| Integration logo | 48px logo |
| Auth type indicator | "OAuth 2.0" or "API Key" badge |
| Fields | Depends on credential type (API key field, Username + Password, OAuth2 scopes, etc.) |
| "Connect" / "Authorize" | For OAuth2: opens popup window to provider's auth page |
| Test connection | Button: "Test connection" — shows success/failure feedback |
| Save | Primary. Closes modal and returns credential to caller |

**OAuth2 flow**:
1. Modal shows "Click 'Connect' to authorize {Service}"
2. Click → popup opens to OAuth2 provider
3. User grants permission
4. Popup closes, modal shows "✅ Connected as {email/username}"
5. Save button enabled

### 9.7 Error Detail Modal

| Element | Description |
|---------|-------------|
| Title | "Execution Error" |
| Error type | Badge |
| Error message | Full error text |
| Node | Which node failed |
| Stack trace | Collapsible code block |
| Input data | Collapsible — shows what data triggered the error |
| Retry | Retry execution from beginning |
| Close | Close modal |

### 9.8 Execution Detail Modal

| Section | Description |
|---------|-------------|
| Header | Run ID, status badge, trigger type, duration, time |
| Node tree | Left column: all nodes with status icons |
| Node detail | Right column: input/output data for selected node |
| Data views | Table / JSON toggle |
| Timeline | Visual timeline of node execution order |
| Export | Download execution log as JSON |

### 9.9 Node Details / Configuration Modal (full-screen NDV)

When user expands NDV to full screen, it becomes a modal covering the full viewport. Same content as the side-panel NDV but with more horizontal space. Input and Output panels shown side-by-side.

### 9.10 Delete Confirmation Modal (Inline)

Appears inline (not separate modal) below the triggering button:

| Element | Description |
|---------|-------------|
| Warning text | "This action cannot be undone. {Resource} will be permanently deleted." |
| Confirm input | Type "{name}" to confirm (for destructive operations) |
| Delete button | Red destructive button |
| Cancel | Text "Cancel" link |

### 9.11 Settings Modal (Workflow Settings)

| Tab | Content |
|-----|---------|
| General | Name, description, tags, folder |
| Schedule | Schedule editor (cron expression or interval) |
| Error handling | On error: stop / continue / call error workflow |
| Security | Execution timeout, max retries global |
| MCP | "Expose as MCP tool" toggle + input/output schema |
| Advanced | Execution mode: regular / single-item |

### 9.12 Node Creator (Add Node Panel)

**Component**: `<NodeCreator>` — slides in from right when user presses `N` or drops a connection.

**Structure**:
| Section | Description |
|---------|-------------|
| Search input | Autofocused, searches node name + category + integration name |
| Category tabs | All / Triggers / Actions / AI / Data / Logic / Utility |
| Recent | Shows last 5 used nodes at top |
| Integration grid | Cards: icon + name. Clicking shows node types for that integration |
| Empty state | "No integrations match '{query}'" with suggestion to browse all |
| Keyboard navigation | Arrow keys to navigate list, Enter to select |

**Node result card**:
- Integration icon (32px)
- Integration name + node action subtitle
- Category badge (Trigger / Action / etc.)
- Click → adds node to canvas at cursor position / end of last connection

### 9.13 Version History Modal

| Element | Description |
|---------|-------------|
| Title | "Version History" |
| List | Versions with: number, timestamp, author, optional name label |
| Current badge | "Current" badge on active version |
| Preview | Click version → shows preview overlay on canvas (read-only) |
| Restore | Button → confirmation → restores version |
| Name version | Enterprise only — add label to version |
| Close | Button |

### 9.14 Invite Member Modal

| Element | Description |
|---------|-------------|
| Title | "Invite Member" |
| Email input | Single email or multiple (comma-separated) |
| Role select | Owner / Admin / Member / Viewer |
| Message | Optional personal message |
| Send invites button | Primary |

### 9.15 Template Browser Modal

| Element | Description |
|---------|-------------|
| Search | Search templates by name or app |
| Category filter | By app (Gmail, Slack, etc.) or use case |
| Template cards | Name + apps used + description preview + "Use template" |
| Template detail | Opens drawer: full description + node preview + setup guide |
| Use template | Creates workflow from template + opens Studio |

---

## 10. Settings Pages

### 10.1 Settings Navigation (Left sidebar within settings)

| Section | Items |
|---------|-------|
| **Account** | Profile, Security, Notifications |
| **Organization** | General, Members, Billing, Audit Logs |
| **Team** | General, Members, Permissions |
| **Developer** | API Tokens, MCP Server, Webhooks Config |
| **Advanced** | Custom Domain, SSO, SCIM |

### 10.2 Profile Settings Page

| Field | Type |
|-------|------|
| Avatar | Upload image |
| Display name | Text input |
| Email | Read-only (managed by auth) |
| Timezone | Select (IANA list) |
| Language | Select |
| Password change | Button → opens change password form |
| 2FA | Enable/disable TOTP |
| Delete account | Danger zone button |

### 10.3 API Tokens Settings Page

| Element | Description |
|---------|-------------|
| Tokens table | Name / Scopes / Created / Last used / Expires |
| Generate token | Button → modal: name + scope checkboxes |
| Token display | Shown once after creation with copy button |
| Revoke | Per-token revoke button |
| Scopes reference | Link to scope documentation |

### 10.4 MCP Server Settings Page

| Element | Description |
|---------|-------------|
| Status | Enabled/Disabled toggle |
| Server URL | Display (read-only): `https://api.flowholt.com/mcp/{orgSlug}` |
| Auth method | Token / OAuth2 |
| Active tools | List of workflows exposed as MCP tools |
| Token management | Generate MCP-specific token |
| Test connection | Button to test with curl example |
| Claude config | Copy button for Claude Desktop config JSON |
| Cursor config | Copy button for Cursor settings JSON |

### 10.5 Organization Settings Page

| Section | Fields |
|---------|--------|
| General | Org name, slug, country, timezone |
| Branding | Logo upload, accent color, app name |
| Plan & Billing | Plan name, operations used, upgrade CTA |
| Danger zone | Delete organization button |

---

## 11. Global UI Patterns

### 11.1 Loading States

| Context | Pattern |
|---------|---------|
| Full page load | Skeleton screens (gray animated bars) |
| Data tables | Skeleton rows (5 rows with random widths) |
| Button action | Spinner replaces icon, button disabled during action |
| Canvas load | Canvas shows skeleton overlay |
| Node run | Node border pulses blue |
| Async fetch | Skeleton in data area |

### 11.2 Error States

| Context | Pattern |
|---------|---------|
| Form field | Red border + error text below field |
| API error | Toast notification (top-right, auto-dismiss 5s) |
| Critical error | Banner at top of page (persistent until dismissed) |
| Empty node output | Gray "No data" text in output panel |
| 404 page | Centered: "Page not found" + link home |
| 500 page | Centered: "Something went wrong" + reload button |

### 11.3 Toast Notifications

**Component**: `<Toast>` — top-right, stacked, auto-dismiss after 5s.

| Property | Value |
|----------|-------|
| Position | Top-right, 16px from edges |
| Width | 360px max |
| Stack | Up to 3 visible, older ones push up |
| Structure | Left color stripe + icon + title + message + close `×` |
| Success | Green stripe, checkmark icon |
| Error | Red stripe, `×` icon |
| Warning | Yellow stripe, `!` icon |
| Info | Blue stripe, `i` icon |
| Dismiss | Click `×` or wait 5s |
| Action | Optional link button (e.g., "View execution") |

### 11.4 Confirmation Pattern

Three levels:
1. **Low risk** (e.g., archive): Confirm button turns to "Are you sure? Click again." State lasts 3s.
2. **Medium risk** (e.g., delete workflow): Inline confirmation with "Cancel" and "Delete" buttons.
3. **High risk** (e.g., delete organization): Full modal with typed confirmation.

### 11.5 Data Table Patterns

Standard table behaviors:
- Sort: Click column header, arrow indicates direction
- Resize: Drag column border to resize
- Select: Checkbox per row + select-all in header
- Paginate: 25 / 50 / 100 per page, prev/next buttons, total count
- Loading: Show last data while refetching (no flash)
- Empty: Section-specific empty state

### 11.6 Form Patterns

| Pattern | Implementation |
|---------|---------------|
| Validation | Real-time (on change) + on submit |
| Required fields | Asterisk (*) in label |
| Error messages | Below field, `text-red-600 text-xs` |
| Save state | "Save changes" button disabled when no changes; active when dirty |
| Auto-save | Where applicable: debounced 500ms + "Saved" indicator |
| Unsaved guard | Navigation away triggers "You have unsaved changes. Leave?" dialog |
