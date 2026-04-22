# 74 · FlowHolt: Dashboard Pages Deep Spec

> **Purpose**: Exhaustive specification for every dashboard page — Home, Workflows List, Executions List, Templates, AI Agents, Analytics, Connections — covering every UI element, layout, data source, action, state variant, and empty state.
> **Audience**: Junior AI model implementing individual dashboard pages. Every page fully pre-planned.
> **Sources**: spec 40 (frontend route inventory), spec 69 (UI element inventory), Make.com UI crawl, n8n dashboard patterns.

---

## Cross-Reference Map

| Section | Source |
|---------|--------|
| §1 Home/Dashboard | spec 40, spec 69 §2, Make home |
| §2 Workflows List | spec 69 §3, spec 40, n8n workflows page |
| §3 Executions List | spec 40 §executions, n8n executions |
| §4 Templates | spec 66, n8n templates |
| §5 AI Agents | spec 37, spec 66, n8n agents |
| §6 Analytics | spec 41, Make analytics |
| §7 Connections/Credentials | spec 46, Make connections |
| §8 Data Stores | spec 45, Make data stores |
| §9 Variables | spec 40 §variables |

---

## 1. Home / Dashboard

**Route**: `/` or `/dashboard`  
**File**: `src/pages/DashboardPage.tsx`

### 1.1 Page Layout

```
┌─ Header (48px) ────────────────────────────────────┐
│ [FlowHolt] [Org ▼] [Team ▼]  [🔍 ⌘K] [🔔] [👤]  │
├─ Sidebar (240px) ─────────────────────────────────┤
│                    ┌─ Main Content ───────────────┐ │
│ Home ←             │ Good morning, John! ·       │ │
│ Workflows          │ Thursday, Jan 15             │ │
│ Executions         │                              │ │
│ AI Agents          │ [STAT CARDS ROW]             │ │
│ Templates          │                              │ │
│ ─────────          │ [QUICK ACTIONS]              │ │
│ Connections        │                              │ │
│ Variables          │ [RECENT WORKFLOWS]           │ │
│ Data Stores        │                              │ │
│ ─────────          │ [RECENT EXECUTIONS]          │ │
│ Settings           │                              │ │
│                    └──────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### 1.2 Stat Cards Row

4 stat cards in a grid (`grid-cols-4` desktop, `grid-cols-2` tablet, `grid-cols-1` mobile):

| Card | Icon | Value | Sub-label |
|------|------|-------|-----------|
| Active Workflows | `GitBranch` (green) | Count | "+3 this week" |
| Total Executions (today) | `Play` (blue) | Count | "+12% from yesterday" |
| Failed Executions | `AlertCircle` (red) | Count | "3 need attention" |
| AI Operations Used | `Bot` (purple) | "320 / 500" | "Resets in 16 days" |

Card component:
```tsx
<Card className="p-4">
  <div className="flex items-center justify-between">
    <p className="text-sm text-muted-foreground">{label}</p>
    <Icon className={`h-4 w-4 ${iconColor}`} />
  </div>
  <p className="text-2xl font-bold mt-1">{value}</p>
  <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>
</Card>
```

### 1.3 Quick Actions

Row of 4 buttons:
- **New Workflow** → navigates to Studio with blank workflow
- **Browse Templates** → navigates to `/templates`
- **Add Connection** → opens credential creation modal
- **Invite Team Member** → opens invite modal

```tsx
<div className="grid grid-cols-4 gap-3">
  <Button variant="outline" onClick={() => navigate('/workflows/new')}>
    <Plus className="mr-2 h-4 w-4" /> New Workflow
  </Button>
  ...
</div>
```

### 1.4 Recent Workflows

Section heading: "Recent Workflows"  
Right side: "View all →" link

Table with 5 rows:
| Column | Content |
|--------|---------|
| Name | Workflow name (clickable → Studio) |
| Status | Badge: Active (green) / Paused (yellow) / Draft (gray) |
| Last run | Relative time (e.g., "2 minutes ago") |
| Success rate | "94%" with mini sparkline (7-day) |
| Actions | ⋮ menu: Edit, Run now, Pause/Resume, Duplicate, Delete |

### 1.5 Recent Executions

Section heading: "Recent Executions" + status filter chips: All / Success / Failed / Running

Table with 8 rows:
| Column | Content |
|--------|---------|
| Workflow | Name (clickable → execution detail) |
| Status | Icon + text: ✓ Success / ✗ Failed / ⟳ Running / ⏸ Waiting |
| Started | Absolute time (hover: relative) |
| Duration | "1.2s" / "45.3s" |
| Trigger | Badge: "webhook" / "schedule" / "manual" |

### 1.6 Empty State (New User)

When user has no workflows:
```
┌───────────────────────────────────────────┐
│          ╭──────────────╮                 │
│          │   🔀          │                 │
│          │ Your workflows│                 │
│          │ will appear   │                 │
│          │ here          │                 │
│          ╰──────────────╯                 │
│                                           │
│   Build your first automation             │
│   Connect your apps and automate          │
│   repetitive tasks in minutes.            │
│                                           │
│   [Start from scratch]  [Browse Templates]│
└───────────────────────────────────────────┘
```

---

## 2. Workflows List Page

**Route**: `/workflows`  
**File**: `src/pages/WorkflowsPage.tsx`

### 2.1 Page Layout

```
┌─ Page Header ────────────────────────────────────────────────────┐
│ Workflows                                   [+ New Workflow]      │
├─ Toolbar ────────────────────────────────────────────────────────┤
│ [🔍 Search...]  [Status: All ▼]  [Folder: All ▼]  [🗂 ≡]      │
├─ Content ────────────────────────────────────────────────────────┤
│ [Table or Card Grid depending on view mode]                      │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 View Modes

**Table view** (default):
| Column | Width | Sortable | Description |
|--------|-------|---------|-------------|
| ☐ (checkbox) | 40px | No | Multi-select for bulk actions |
| Name | flexible | Yes | Workflow name + folder path below |
| Status | 100px | Yes | Text only: Active / Paused / Draft (no badge) |
| Last run | 140px | Yes | Relative time |
| Created | 140px | Yes | Date |
| Actions | 80px | No | ⋮ menu |

**Card view**:
- 3 columns desktop, 2 tablet, 1 mobile
- Each card: workflow icon (colored), name, status dot, last run time, ⋮ menu

### 2.3 Status Labels (Text Only — No Badges)

This was a prior bug (Sprint 86 fix). Status column shows ONLY text:
- "Active" — no badge, no green color
- "Paused" — no badge
- "Draft" — no badge
- "Error" — red text only

### 2.4 Toolbar Controls

**Search**: filters by workflow name, real-time as user types (debounce 300ms).

**Status filter** (dropdown):
- All
- Active
- Paused
- Draft
- Error

**Folder filter** (dropdown):
- All Folders
- (list of folder names)
- Uncategorized

**View toggle**: Table icon / Grid icon (state persisted to localStorage `wf_view_mode`)

### 2.5 Multi-Select Bulk Actions

When ≥1 checkbox selected:
```
[3 selected]  [Activate]  [Pause]  [Move to folder ▼]  [Delete]  [✕ Clear]
```

### 2.6 Row Actions (⋮ Menu)

- Edit (→ Studio)
- Run now (trigger manual execution)
- Pause / Resume (toggle)
- Duplicate
- Move to folder
- Export as JSON
- Delete (confirmation dialog)

### 2.7 Folder Management

Folders appear as collapsible sections in left sidebar (within the Workflows page, not main nav):
```
FOLDERS
├── Marketing (12)
├── Finance (5)
└── [+ New Folder]
```

Drag-and-drop workflows between folders (via react-dnd or @dnd-kit).

### 2.8 Empty State

When no workflows match filter:
```
No workflows found
Try adjusting your search or filters.
[Clear filters]  or  [+ New Workflow]
```

---

## 3. Executions List Page

**Route**: `/executions`  
**File**: `src/pages/ExecutionsPage.tsx`

### 3.1 Page Layout

```
┌─ Page Header ─────────────────────────────────────────────────────┐
│ Executions                                  [Filter ▼]  [Export]  │
├─ Filter Bar ──────────────────────────────────────────────────────┤
│ Status: [All ▼]  Workflow: [All ▼]  Date: [Last 7 days ▼]        │
│ Trigger: [All ▼]                                                  │
├─ Table ───────────────────────────────────────────────────────────┤
│ Rows (see below)                                                  │
│ ← Prev  1 2 3 ... 10  Next →  (25 per page)                      │
└───────────────────────────────────────────────────────────────────┘
```

### 3.2 Table Columns

| Column | Width | Description |
|--------|-------|-------------|
| Status icon | 40px | ✓ (green) / ✗ (red) / ⟳ (blue spinning) / ⏸ (yellow) |
| Workflow | flexible | Name, clickable → workflow execution detail |
| Trigger | 100px | webhook / schedule / manual / api |
| Started | 140px | Datetime (hover: exact timestamp) |
| Duration | 80px | e.g. "1.2s" or "—" if still running |
| Steps | 80px | "7 / 9 completed" |

Row click → `/executions/{execution_id}` detail page.

### 3.3 Execution Detail Page

**Route**: `/executions/{id}`

```
┌─ Back to Executions ──────────────────────────────────────────────┐
│ ✓ Success  |  Send Weekly Report  |  Started 2 min ago  |  2.3s  │
├─ Timeline ────────────────────────────────────────────────────────┤
│ Node steps listed vertically:                                     │
│ ✓  Schedule Trigger         0ms                                   │
│ ✓  Get CRM Data            450ms   [View Data ▼]                 │
│ ✓  Format Email             12ms   [View Data ▼]                 │
│ ✓  Send Email             1234ms   [View Data ▼]                 │
├─ Right Panel ─────────────────────────────────────────────────────┤
│ EXECUTION INFO                                                    │
│ ID: abc-123                                                       │
│ Workflow: Send Weekly Report                                      │
│ Triggered by: Schedule                                            │
│ Total: 2.3s                                                       │
│ Status: Success                                                   │
│                                                                   │
│ [Re-run]  [Debug mode]                                           │
└───────────────────────────────────────────────────────────────────┘
```

### 3.4 Failed Execution Banner

If any executions failed in last 24h, show banner at top of executions list:
```
⚠ 3 workflows failed in the last 24 hours.  [View failed →]
```

---

## 4. Templates Page

**Route**: `/templates`  
**File**: `src/pages/TemplatesPage.tsx`

### 4.1 Layout

```
┌─ Header ──────────────────────────────────────────────────────────┐
│ Templates                                                         │
│ Pre-built workflows to help you get started fast                  │
├─ Filter Bar ──────────────────────────────────────────────────────┤
│ [🔍 Search templates...]  Category: [All ▼]  Apps: [All ▼]       │
├─ Featured (horizontal scroll) ────────────────────────────────────┤
│ [Card] [Card] [Card] [Card] [Card] →                              │
├─ All Templates (grid) ────────────────────────────────────────────┤
│ [Card] [Card] [Card]                                              │
│ [Card] [Card] [Card]                                              │
└───────────────────────────────────────────────────────────────────┘
```

### 4.2 Template Card

```
┌─────────────────────────────┐
│ [App logos row: 📧 → 📊]   │
│                             │
│ Email to Spreadsheet        │
│ When email arrives with     │
│ attachment, add row to...   │
│                             │
│ ●Email  ●Sheets  🔖 Data   │
│                             │
│ [Use Template]              │
└─────────────────────────────┘
```

Fields:
- App logos (2-4 apps involved)
- Template name
- Description (2 lines max)
- Category chips (e.g., "Email", "Data")
- "Use Template" button → opens confirm modal

### 4.3 Use Template Modal

```
┌─ Use Template ──────────────────────────────────────────┐
│ Email to Google Sheets                                  │
│                                                         │
│ This template will create a new workflow with:          │
│ • Gmail trigger (new email)                            │
│ • Google Sheets action (add row)                       │
│                                                         │
│ Workflow name: [Email to Google Sheets (copy)]         │
│ Folder: [None ▼]                                        │
│                                                         │
│ [Cancel]  [Create Workflow]                             │
└─────────────────────────────────────────────────────────┘
```

On create → navigate to Studio with template workflow loaded.

---

## 5. AI Agents Page

**Route**: `/agents`  
**File**: `src/pages/AgentsPage.tsx`

### 5.1 Layout

```
┌─ Header ────────────────────────────────────────────────────────┐
│ AI Agents                                    [+ New Agent]      │
├─ Tabs ──────────────────────────────────────────────────────────┤
│ [My Agents]  [Templates]  [Playground]                          │
├─ Agent List ────────────────────────────────────────────────────┤
│ Card grid (like workflows, 3-col)                               │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Agent Card

```
┌──────────────────────────────┐
│ 🤖 Customer Support Bot      │
│                              │
│ Model: gpt-4o                │
│ Tools: 3 connected           │
│ Status: ● Active             │
│ Last used: 2h ago            │
│                              │
│ [Chat]  [Edit]  [⋮]         │
└──────────────────────────────┘
```

### 5.3 Agent Chat (Playground)

Full-page chat interface:
```
┌─ Agent: Customer Support Bot ─────────────────────┐
│ Model: gpt-4o  Memory: enabled  Tools: 3          │
├─ Chat Area ───────────────────────────────────────┤
│                                                   │
│  [User]: How do I reset my password?             │
│                                                   │
│  [Bot]: To reset your password, go to...         │
│         [Used tool: search_kb] ←expand           │
│                                                   │
├─ Input ───────────────────────────────────────────┤
│ [_______________________________] [Send ↵]       │
└───────────────────────────────────────────────────┘
```

---

## 6. Analytics Page

**Route**: `/analytics`  
**File**: `src/pages/AnalyticsPage.tsx`

### 6.1 Layout

```
┌─ Header ──────────────────────────────────────────────────────────┐
│ Analytics                           Date: [Last 30 days ▼]       │
├─ KPI Row ─────────────────────────────────────────────────────────┤
│ [Total Runs] [Success Rate] [Avg Duration] [Failed Runs]         │
├─ Charts ──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐  │
│ │ Executions Over Time (line) │ │ Success vs Failed (bar)     │  │
│ └─────────────────────────────┘ └─────────────────────────────┘  │
├─ Tables ──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐  │
│ │ Top Workflows by Runs       │ │ Error Frequency by Node     │  │
│ └─────────────────────────────┘ └─────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### 6.2 KPI Cards

| Metric | Description |
|--------|-------------|
| Total Executions | Count in period |
| Success Rate | "94.2%" with trend arrow |
| Avg Duration | "1.4s" with trend arrow |
| Operations Used | "8,450 / 10,000" (vs plan limit) |

### 6.3 Charts (using Recharts)

**Executions Over Time**: Line chart, daily granularity, color-coded (green=success, red=failed)

**Top Workflows**: Horizontal bar chart — top 10 workflows by execution count

**Error Frequency**: Table — top 5 error messages with count and affected workflow

---

## 7. Connections / Credentials Page

**Route**: `/connections`  
**File**: `src/pages/VaultPage.tsx` or `ConnectionsPage.tsx`

### 7.1 Layout

```
┌─ Header ────────────────────────────────────────────────────────┐
│ Connections                               [+ Add Connection]    │
├─ Filter ────────────────────────────────────────────────────────┤
│ [Search...]  Type: [All ▼]  Status: [All ▼]                    │
├─ Grid ──────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│ │ [Gmail logo] │ │ [Sheets logo]│ │ [Slack logo] │             │
│ │ Gmail        │ │ Google Sheets│ │ Slack        │             │
│ │ john@co.com  │ │ Work Account │ │ workspace    │             │
│ │ ✓ Connected  │ │ ✓ Connected  │ │ ✓ Connected  │             │
│ │ Used in 3 wf │ │ Used in 5 wf │ │ Used in 1 wf │             │
│ │ [Edit] [✗]  │ │ [Edit] [✗]  │ │ [Edit] [✗]  │             │
│ └──────────────┘ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Connection Card States

- **Connected** (green dot): OAuth token valid or API key saved
- **Expired** (yellow dot): OAuth token expired, needs re-auth
- **Error** (red dot): Last test failed
- **Untested** (gray dot): Newly added, not yet verified

### 7.3 Add Connection Modal

Steps:
1. **Choose app** — searchable grid of available integrations
2. **Auth form** — fields depend on connection type (API key, OAuth button, etc.)
3. **Test** — verify connection works
4. **Name** — give connection a label

---

## 8. Data Stores Page

**Route**: `/data-stores`  
**File**: `src/pages/DataPage.tsx`

### 8.1 Layout

```
┌─ Header ────────────────────────────────────────────────────────┐
│ Data Stores                                   [+ New Store]     │
├─ List ──────────────────────────────────────────────────────────┤
│ Name            Records  Size      Last modified   Actions      │
│ ──────────────────────────────────────────────────────────────  │
│ User Cache      1,240    42 KB     2h ago         [View] [⋮]   │
│ Product DB      8,340   340 KB     1d ago         [View] [⋮]   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Data Store Detail (Table View)

```
┌─ User Cache ────────────────────────────────────────────────────┐
│ [← Back]  1,240 records  [Search...]  [+ Add row]  [Export]    │
├─ Table ─────────────────────────────────────────────────────────┤
│ key (string)  | value (any)     | expires_at | created_at      │
│ ─────────────────────────────────────────────────────────────── │
│ user:123      | {name:"John"..} | 2024-02-01 | 2024-01-15     │
│ user:456      | {name:"Jane"..} | 2024-02-01 | 2024-01-15     │
│ [Edit] [Delete] per row                                         │
│ ← 1 2 3 ... Next →                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Variables Page

**Route**: `/variables`  
**File**: `src/pages/VariablesPage.tsx`

### 9.1 Layout

```
┌─ Header ────────────────────────────────────────────────────────┐
│ Variables                                 [+ New Variable]      │
├─ Scope Tabs ────────────────────────────────────────────────────┤
│ [Team (12)]  [Personal (3)]                                     │
├─ Table ─────────────────────────────────────────────────────────┤
│ ☐  Name          Value         Type     Created     Actions     │
│ ─────────────────────────────────────────────────────────────── │
│ ☐  API_BASE_URL  https://...   string   2d ago      [Edit][✗]  │
│ ☐  MAX_RETRIES   3             number   1w ago      [Edit][✗]  │
│ ☐  DEBUG_MODE    (hidden)      secret   3d ago      [Edit][✗]  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Variable Types

| Type | Description | Display |
|------|-------------|---------|
| `string` | Plain text | Full value shown |
| `number` | Integer or float | Full value shown |
| `boolean` | true/false | Toggle shown |
| `secret` | Encrypted | "••••••••" shown, [Reveal] button |
| `json` | JSON object/array | Collapsed `{...}` with expand |

### 9.3 Create Variable Modal

```
┌─ New Variable ──────────────────────────────┐
│ Name:  [MY_VARIABLE_NAME]                  │
│ Value: [_____________________________]     │
│ Type:  [string ▼]                          │
│ Scope: ○ Team  ○ Personal                  │
│ Note:  [Optional description...]           │
│                                             │
│ [Cancel]  [Create Variable]                 │
└─────────────────────────────────────────────┘
```

Variables are referenced in workflows as `{{$env.MY_VARIABLE_NAME}}`.
