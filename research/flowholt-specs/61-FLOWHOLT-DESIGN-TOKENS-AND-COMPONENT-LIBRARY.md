# FlowHolt Design Tokens And Component Library

> **Status:** New redesign system file created 2026-04-17  
> **Purpose:** Turn the visual direction from file 59 into a full component-level rule system for every repeated UI element in FlowHolt.

---

## 1. Design goals

The component library must produce:

- low-clutter interfaces
- consistent spacing and sizing
- predictable states across pages
- shared primitives between dashboard and Studio
- enough visual discipline that the product can scale without looking patched together

---

## 2. Token system

### Core palette

| Token | Value | Usage |
|---|---|---|
| `bg-page` | `#FFFFFF` | page background |
| `bg-surface` | `#FAFAFA` | secondary surfaces |
| `bg-surface-strong` | `#F4F4F5` | hover / selected quiet surfaces |
| `fg-default` | `#18181B` | primary text |
| `fg-secondary` | `#71717A` | descriptions |
| `fg-muted` | `#A1A1AA` | placeholders |
| `border-default` | `#E4E4E7` | standard borders |
| `border-strong` | `#D4D4D8` | stronger separation |
| `accent-green` | `#34D399` | active dot / success / selected marker |
| `accent-green-soft` | `#D1FAE5` | soft success tint |
| `danger` | `#EF4444` | destructive actions |
| `warning` | `#F59E0B` | warning states |
| `info` | `#3B82F6` | informational states |
| `primary-black` | `#18181B` | main CTAs |
| `primary-black-hover` | `#27272A` | CTA hover |

### Radius

| Token | Value |
|---|---|
| `r-sm` | `4px` |
| `r-md` | `6px` |
| `r-lg` | `8px` |
| `r-xl` | `12px` |
| `r-pill` | `9999px` |

### Shadows

| Token | Value |
|---|---|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` |

### Type scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `text-xs` | 11px | 400/500 | metadata, pills |
| `text-sm` | 13px | 400/500 | labels, filters, list support text |
| `text-base` | 14px | 400/500 | body, form values |
| `text-md` | 15px | 500/600 | section headers |
| `text-lg` | 18px | 600 | page cards |
| `text-xl` | 24px | 600 | page headings |
| `text-2xl` | 30px | 700 | hero stats |
| `text-mono` | 13px | 400 | code, ids, payloads |

---

## 3. Green usage rules

Green is allowed only for:

- active nav indicator dot
- healthy connection dot
- success badge
- published/healthy/workflow running status where appropriate
- positive trend delta
- toggle on-state
- logo marks

Green is not used for:

- primary buttons
- full nav highlights
- large cards
- most icons
- generic links

---

## 4. Base components

### 4.1 Buttons

| Variant | Style | Usage |
|---|---|---|
| Primary | black fill, white text | save, run, publish, create |
| Secondary | white fill, gray border | secondary actions |
| Ghost | transparent, gray hover | toolbar controls |
| Destructive | red fill | delete, revoke |
| Quiet Pill | soft surface, rounded-full | filters and segment toggles |

### 4.2 Icon buttons

- 32x32 default
- 36x36 inside dense toolbars
- ghost by default
- always show visible focus ring

### 4.3 Inputs

- soft silver background
- 1px zinc border
- black focus ring
- inline help text below field
- validation message always occupies dedicated space

### 4.4 Selects and combo fields

- use text input sizing
- trailing icon aligned right
- searchable when option count is high
- for entities, show icon + label + support text

### 4.5 Tabs

Two tab families:

1. **Page tabs** - top-level content switching, active via black text + green dot or underline
2. **Panel tabs** - inspector/runtime tabs, tighter spacing, underline emphasis

### 4.6 Badges and pills

Types:

- status badge
- scope badge
- environment badge
- plan badge
- role badge
- node family chip
- count chip

### 4.7 Cards

Use three card types:

1. **Metric card** - large number + trend + label
2. **Entity card** - title + meta + state + actions
3. **Panel card** - header + body + optional footer

### 4.8 Command and shortcut surfaces

The redesign should make power-user behavior visible, not hidden.

- command palette trigger always visible in shell and Studio
- menus should display shortcut hints where available
- a reusable `KeyboardShortcut` token/component should render combinations consistently
- single-key shortcuts are allowed only when focus is not inside an input/editor
- command groups should follow four buckets: navigation, create, workflow actions, execution actions

---

## 5. App-shell components

### Left rail item

- icon-centered by default
- active state = subtle surface + green dot, not a green fill block
- tooltip on hover when collapsed

### Context pane section

- uppercase micro-label
- stacked nav items with description optional
- selected item gets soft background and stronger text

### Page header

Contains:

- title
- scope breadcrumb
- description
- filter strip or tabs
- right-side actions

### Filter bar

Contains:

- search input
- chips
- segmented controls
- saved views dropdown
- sort control
- optional bulk-action mode

---

## 6. Data-display components

### Tables

- silver header row
- compact zebra-free body
- clear hover state
- sticky first column where useful
- selectable rows on operations-heavy pages

### Status cells

Use a dot + label pattern:

- green = active/healthy
- amber = warning/paused
- red = failed/requires action
- gray = idle/inactive

### Trend cells

- percent delta
- arrow icon
- time-window label

### JSON / payload viewers

- monospace
- collapsible tree view
- copy button
- line wrap toggle
- raw / pretty toggle

### Structured data viewers

- table, JSON, and schema views are first-class and switchable
- HTML / Markdown / binary preview modes exist when output type supports them
- data viewers support in-view search, item pagination, and path/value copy actions

### Log rows

- timestamp
- source
- severity
- message
- context expansion

---

## 7. Feedback components

### Empty states

Every empty state must include:

- clear title
- short explanation
- primary CTA
- secondary CTA or doc link where useful
- optional preview illustration, not decorative clutter

### Loading states

Use:

- skeleton rows for lists
- skeleton cards for overview surfaces
- loading stripe or spinner only for small actions

### Validation

Use three layers:

1. inline field errors
2. section banner for blocking config errors
3. global toast only for save/result feedback

### Toasts

Structure:

- accent stripe on the left
- title
- body
- close action

### Threshold indicators

Use a dedicated threshold pattern for plan, runtime, and usage warnings:

- soft warning state at early threshold
- stronger warning state at high threshold
- hard-stop state when limit is reached
- icon, label, and bar color all change together so the warning is visible in tables, cards, and detail pages

### Banners

For persistent states:

- plan limits
- system degradation
- pending approvals
- expired credentials

---

## 8. Studio-specific components

### Studio header tab

- label
- optional count badge
- active indicator dot or underline
- compact but high-contrast state

### Node tile

Node visuals should use family accents without violating the restrained palette:

| Family | Accent treatment |
|---|---|
| Trigger | green icon well |
| Integration | neutral surface + brand icon |
| Logic | blue icon well |
| Data | teal or cyan-muted well |
| Code | amber icon well |
| Human | rose-muted well |
| AI | black icon well |
| Error | red warning edge |

### Edge labels

- always compact
- use semantic chips for true/false/error
- readable at 100% zoom

### Inspector panel tabs

- Overview
- Input
- Parameters
- Output
- Diagnostics

### Execution badge

- state label
- duration
- item count or token count where relevant

### Pin badge

- visible on node and in inspector
- stale state differs from active pin

### Pin banner

- visible above output when pinned data is active
- explains that pinned data is dev-only
- includes edit / unpin actions where allowed

### Mapping pills

- draggable from input/output viewers into parameter fields
- support copy path, copy value, and insert expression actions
- hover state should show the source node clearly

---

## 9. Form system rules

All forms follow these rules:

1. fields grouped into named sections
2. destructive actions separated from standard actions
3. credential/secret fields visually marked
4. advanced fields collapsed by default where appropriate
5. inheritance from parent scope visibly explained
6. required fields explicit
7. generated values shown as read-only tokens or code blocks

---

## 10. Accessibility baseline

Mandatory:

- visible focus states
- minimum 4.5:1 contrast for body content
- keyboard access for all drawers, menus, filters, and Studio side surfaces
- semantic labels for status-only indicators
- no hover-only critical actions
- overlay close should return focus to the triggering control
- resize handles, pinned-data actions, and sticky-note actions need keyboard-accessible alternatives
- menus, command palette entries, and node actions should expose shortcuts consistently

---

## 11. Responsive density rules

- secondary panes may collapse, but primary actions cannot disappear without an alternate entry point
- shell navigation can collapse by level; Studio should collapse side surfaces before collapsing execution controls
- dense admin tables may reduce chrome on smaller widths, but filters, status, and primary row actions stay visible

---

## 12. Dark mode position

Dark mode is supported, but not a blocker for primary redesign planning. The light system is canonical. Dark tokens must be derived after the light system is stable, not in parallel with first implementation.

---

## 13. Implementation note

This file should guide:

- Tailwind token updates
- shared React UI primitives
- shadcn overrides
- Storybook coverage if adopted later

No page should invent its own button, card, badge, tab, or form style outside this system.
