# FlowHolt UI Design System and Layout Specification

> **Status:** New file created 2026-04-17  
> **Direction:** Complete visual redesign. Inspired by Claude, Cursor, GPT, and Lovable web interfaces — clean, minimal, modern agentic aesthetic. White/silver backgrounds, black primary UI, green accent from brand logo used sparingly.  
> **Vault:** [[wiki/concepts/design-system]], [[wiki/concepts/studio-anatomy]], [[wiki/concepts/information-architecture]]  
> **See also:** `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md`

---

## 1. Brand Identity

### Logo

The FlowHolt logo is a stylized "f" formed by black pipeline/connection shapes with two green circles:
- Large filled green circle (representing a node/connection point)
- Small green ring (representing a data point/trigger)
- Black pipe shapes (representing workflow connections/data flow)

### Brand Personality

| Trait | Expression |
|-------|-----------|
| **Professional** | Clean typography, generous whitespace, no visual clutter |
| **Precise** | Sharp corners on functional elements, consistent spacing grid |
| **Modern** | Flat design, no gradients on surfaces, subtle shadows only |
| **Trustworthy** | Muted palette, black primary UI conveys solidity |
| **Technical** | Monospace accents for data/code, structured layouts |

---

## 2. Color System

### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#FFFFFF` | Page background, main content areas |
| `--surface` | `#FAFAFA` | Cards, panels, sidebar, secondary surfaces |
| `--surface-raised` | `#F4F4F5` | Hover states on surfaces, table header bg, input bg |
| `--foreground` | `#18181B` | Primary text, headings, icons (zinc-900) |
| `--foreground-secondary` | `#71717A` | Secondary text, descriptions, metadata (zinc-500) |
| `--foreground-muted` | `#A1A1AA` | Placeholder text, disabled states (zinc-400) |
| `--border` | `#E4E4E7` | Default borders, dividers (zinc-200) |
| `--border-strong` | `#D4D4D8` | Focused input borders, emphasized dividers (zinc-300) |
| `--ring` | `#18181B` | Focus ring (black, 2px, offset 2px) |

### Brand Green (Accent — Use Sparingly)

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#34D399` | Active indicators, success states, logo mark (emerald-400) |
| `--accent-light` | `#D1FAE5` | Success badge background, subtle highlights (emerald-100) |
| `--accent-dark` | `#059669` | Accent text on white backgrounds (emerald-600) |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--destructive` | `#EF4444` | Error states, delete actions (red-500) |
| `--destructive-light` | `#FEF2F2` | Error badge background (red-50) |
| `--warning` | `#F59E0B` | Warning states (amber-500) |
| `--warning-light` | `#FFFBEB` | Warning badge background (amber-50) |
| `--info` | `#3B82F6` | Informational states (blue-500) |
| `--info-light` | `#EFF6FF` | Info badge background (blue-50) |

### Primary Actions (Black)

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#18181B` | Primary buttons, strong CTAs (black) |
| `--primary-hover` | `#27272A` | Primary button hover (zinc-800) |
| `--primary-foreground` | `#FFFFFF` | Text on primary buttons (white) |

### Secondary Actions

| Token | Value | Usage |
|-------|-------|-------|
| `--secondary` | `#FFFFFF` | Secondary buttons (white with border) |
| `--secondary-hover` | `#FAFAFA` | Secondary button hover |
| `--secondary-foreground` | `#18181B` | Text on secondary buttons |

### Where Green IS Used (intentionally limited)

- Active sidebar navigation indicator (small green dot, not full highlight)
- Success/completed execution badge
- Toggle switch "on" state
- "Active" workflow status dot
- Logo in header
- Positive metric deltas (+12% in green)
- Toast success accent stripe

### Where Green is NOT Used

- Buttons (use black primary or white secondary)
- Links (use foreground color, underline on hover)
- Headers or section titles
- Backgrounds or large surface areas
- Icons (use foreground/muted colors)
- Charts (use multi-color palette, green only for "success" series)

---

## 3. Typography

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
```

### Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|------------|-------|
| `--text-xs` | 11px | 400 | 16px | Badges, metadata labels |
| `--text-sm` | 13px | 400 | 20px | Secondary text, table cells, form labels |
| `--text-base` | 14px | 400 | 22px | Body text, input values |
| `--text-md` | 15px | 500 | 24px | Section headers, sidebar items |
| `--text-lg` | 18px | 600 | 28px | Page titles, card headers |
| `--text-xl` | 24px | 600 | 32px | Page headings |
| `--text-2xl` | 30px | 700 | 38px | Hero numbers, stats |
| `--text-mono` | 13px | 400 | 20px | Code, expressions, IDs, monospace data |

### Font Weight Rules

- **400 (Regular):** Body text, descriptions, form values
- **500 (Medium):** Sidebar items, table headers, card titles, button text
- **600 (Semibold):** Page titles, section headers, stat values
- **700 (Bold):** Hero numbers, emphasis (rare)

---

## 4. Spacing and Layout Grid

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0.5` | 2px | Tight icon gaps |
| `--space-1` | 4px | Inner padding on compact elements |
| `--space-2` | 8px | Icon-to-label gap, badge padding |
| `--space-3` | 12px | Small section gaps, input padding-x |
| `--space-4` | 16px | Standard content padding, card padding |
| `--space-5` | 20px | Sidebar item padding, form field gap |
| `--space-6` | 24px | Section gap, page content padding |
| `--space-8` | 32px | Large section gap, card gap |
| `--space-10` | 40px | Page header margin |
| `--space-12` | 48px | Major section separator |

### Content Width

| Context | Max Width | Alignment |
|---------|-----------|-----------|
| Dashboard content | `1200px` | Left-aligned with sidebar |
| Settings pages | `720px` | Centered within content |
| Modal dialogs | `480px` (small), `640px` (medium), `800px` (large) | Centered |
| Full-width tables | `100%` | Fill available |

---

## 5. Shadows, Borders, and Radii

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Cards, subtle elevation |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Dropdowns, popovers |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` | Modals, elevated panels |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)` | Command palette |
| `--shadow-none` | `none` | Flat elements, active states |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Badges, small chips |
| `--radius-md` | `6px` | Inputs, buttons, small cards |
| `--radius-lg` | `8px` | Cards, panels, modals |
| `--radius-xl` | `12px` | Large cards, page sections |
| `--radius-full` | `9999px` | Avatar circles, pills |

### Border

- Default: `1px solid var(--border)` — zinc-200
- Focused: `1px solid var(--border-strong)` with `box-shadow: 0 0 0 2px var(--ring)`
- No double borders — use gap between adjacent bordered elements

---

## 6. Component Patterns

### Buttons

```
┌─ Primary (Black) ──────────────────────┐
│  bg: #18181B  text: white  radius: 6px │
│  hover: #27272A  active: #09090B       │
│  height: 36px  padding: 0 16px         │
│  font: 14px/500                        │
└────────────────────────────────────────┘

┌─ Secondary (White + Border) ───────────┐
│  bg: white  text: #18181B  border: 1px │
│  hover: #FAFAFA  active: #F4F4F5       │
│  height: 36px  padding: 0 16px         │
└────────────────────────────────────────┘

┌─ Ghost (No Background) ───────────────┐
│  bg: transparent  text: #71717A        │
│  hover: #F4F4F5  active: #E4E4E7       │
│  height: 36px  padding: 0 12px         │
└────────────────────────────────────────┘

┌─ Destructive (Red) ───────────────────┐
│  bg: #EF4444  text: white              │
│  hover: #DC2626  Only for delete/danger│
└────────────────────────────────────────┘

┌─ Icon Button ─────────────────────────┐
│  bg: transparent  hover: #F4F4F5       │
│  size: 32x32px  icon: 16px            │
│  radius: 6px                           │
└────────────────────────────────────────┘
```

**Button sizes:** `sm` (28px), `default` (36px), `lg` (40px)

### Inputs

```
┌─ Text Input ──────────────────────────┐
│  bg: #FAFAFA  border: 1px #E4E4E7     │
│  focus: border #D4D4D8 + ring 2px     │
│  height: 36px  padding: 0 12px        │
│  font: 14px  placeholder: #A1A1AA     │
│  radius: 6px                           │
└────────────────────────────────────────┘
```

### Cards

```
┌─ Card ────────────────────────────────┐
│  bg: white  border: 1px #E4E4E7       │
│  shadow: --shadow-xs                   │
│  padding: 16px  radius: 8px           │
│  hover (if clickable): shadow-sm       │
└────────────────────────────────────────┘
```

### Badges / Status Chips

| Variant | Background | Text | Dot Color |
|---------|-----------|------|-----------|
| Success / Active | `#D1FAE5` | `#059669` | `#34D399` |
| Error / Failed | `#FEF2F2` | `#DC2626` | `#EF4444` |
| Warning | `#FFFBEB` | `#D97706` | `#F59E0B` |
| Info | `#EFF6FF` | `#2563EB` | `#3B82F6` |
| Neutral / Draft | `#F4F4F5` | `#71717A` | `#A1A1AA` |

### Tables

| Element | Style |
|---------|-------|
| Header row | `bg: #FAFAFA`, `font: 13px/500`, `text: #71717A`, `border-bottom: 1px #E4E4E7` |
| Body row | `bg: white`, `font: 14px/400`, `border-bottom: 1px #F4F4F5` |
| Row hover | `bg: #FAFAFA` |
| Row selected | `bg: #F4F4F5` |
| Pagination | Bottom-right, ghost buttons |

### Modals / Dialogs

- Overlay: `rgba(0,0,0,0.4)` with `backdrop-filter: blur(4px)`
- Container: `bg: white`, `radius: 12px`, `shadow: --shadow-md`
- Header: Title (18px/600) + close icon button
- Body: `padding: 24px`, standard spacing
- Footer: Right-aligned buttons (secondary left, primary right)

### Toasts

- Position: bottom-right
- Style: `bg: white`, `border: 1px #E4E4E7`, `shadow: --shadow-sm`, `radius: 8px`
- Accent stripe (left 3px): green (success), red (error), amber (warning), blue (info)
- Auto-dismiss: 4 seconds

---

## 7. Dashboard Layout

### Overall Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Content Area (flex-1)                  │
│                   │                                          │
│  ┌─────────────┐  │  ┌─────────────────────────────────────┐│
│  │ Logo        │  │  │ Page Header                         ││
│  │ FlowHolt    │  │  │ Title + Description + Actions       ││
│  ├─────────────┤  │  ├─────────────────────────────────────┤│
│  │ Workspace   │  │  │                                     ││
│  │ Switcher    │  │  │ Page Content                        ││
│  ├─────────────┤  │  │ (scrollable)                        ││
│  │             │  │  │                                     ││
│  │ Nav Items   │  │  │                                     ││
│  │             │  │  │                                     ││
│  │             │  │  │                                     ││
│  ├─────────────┤  │  │                                     ││
│  │ User Menu   │  │  │                                     ││
│  └─────────────┘  │  └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Sidebar Design

```
┌─────────────────────┐
│  [Logo] FlowHolt    │  ← Logo mark + wordmark, 18px/600
│─────────────────────│
│  [▾] My Workspace   │  ← Workspace switcher dropdown
│─────────────────────│
│                     │
│  OVERVIEW           │  ← Section label: 11px/500, #A1A1AA, uppercase, tracking wider
│  • Overview         │  ← Active: #18181B text, #F4F4F5 bg, green dot (4px) left
│    Workflows        │  ← Inactive: #71717A text
│    Executions       │
│    Templates        │
│                     │
│  BUILD              │
│    AI Agents        │
│    Integrations     │
│                     │
│  DATA               │
│    Vault            │
│    Environments     │
│    Webhooks         │
│                     │
│  TOOLS              │
│    API Playground   │
│                     │
│─────────────────────│
│  SYSTEM             │  ← Bottom section (fixed)
│    Audit Log        │
│    Settings         │
│    Help             │
│─────────────────────│
│  ┌───┐              │
│  │ GA │  Gouhar Ali  │  ← Avatar initials + name
│  └───┘  gouhar@...   │     Click → user menu popover
└─────────────────────┘
```

**Sidebar specs:**
- Width: 240px (expanded), 60px (collapsed — icon only)
- Background: `#FAFAFA`
- Right border: `1px solid #E4E4E7`
- Nav item height: 36px
- Nav item padding: `0 12px`
- Active indicator: Small green dot (`#34D399`, 6px circle) flush-left, background `#F4F4F5`
- Hover: `bg: #F4F4F5`
- Collapse toggle: Chevron icon button at bottom of sidebar
- Section labels: `11px`, `500`, `#A1A1AA`, `letter-spacing: 0.05em`, uppercase

### Page Header Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Workflows                              [+ New Workflow]     │
│  Manage and monitor your automation workflows                │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [Search...]              [Status ▾]  [Sort ▾]  [⊞ ≡]  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

- Title: `24px/600`, `#18181B`
- Description: `14px/400`, `#71717A`
- Primary action: Black button, top-right
- Toolbar: Below title, flex row, search + filters + view toggles

### Empty States

```
┌─────────────────────────────────────┐
│                                     │
│         [Illustration/Icon]         │  ← 48px icon, #A1A1AA
│                                     │
│     No workflows yet                │  ← 18px/600, #18181B
│     Create your first workflow to   │  ← 14px/400, #71717A
│     start automating.               │
│                                     │
│     [+ Create Workflow]             │  ← Black primary button
│                                     │
└─────────────────────────────────────┘
```

---

## 8. Studio Layout

### Overall Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ TopBar                                                            │
│ [← Back] [Logo] Workflow Name  [Draft ▾]  [Saved ✓] [...] [Run] │
├──────────┬───────────────────────────────────────┬───────────────┤
│          │                                       │               │
│  Node    │           Canvas                      │  Inspector    │
│  Panel   │                                       │  Panel        │
│  (280px) │      ┌─────┐     ┌─────┐            │  (360px)      │
│          │      │ Trig│────▶│ HTTP│            │               │
│  Search  │      └─────┘     └─────┘            │  [Params]     │
│  ───────│                      │               │  [Settings]   │
│  Triggers│                   ┌─────┐            │  [Test]       │
│  Logic   │                   │ Out │            │               │
│  Data    │                   └─────┘            │               │
│  AI      │                                       │               │
│  Code    │                                       │               │
│  Integr. │  [Zoom: - 100% +] [Fit] [Minimap]   │               │
│          │                                       │               │
├──────────┴───────────────────────────────────────┴───────────────┤
│ StatusBar  [● Connected]  [Credits: 1,234]  [Last run: 2s ago]  │
└──────────────────────────────────────────────────────────────────┘
```

### TopBar

- Height: `48px`
- Background: `#FFFFFF`
- Bottom border: `1px solid #E4E4E7`
- Left: Back arrow (icon button) + FlowHolt logo mark (small) + Workflow name (editable, `15px/500`)
- Center: Environment badge (pill: "Draft" neutral, "Staging" amber, "Production" green)
- Center-right: Save state ("Saved" with check / "Unsaved" with dot / "Saving...")
- Right: Settings (icon button) + More menu (icon button) + **Run** button (black primary, `#18181B`)

### Node Panel (Left)

- Width: `280px` (collapsible to 0)
- Background: `#FFFFFF`
- Right border: `1px solid #E4E4E7`
- Top: Search input (`#FAFAFA` bg, full width)
- Categories: Accordion sections (Triggers, Logic, Data, AI & Agents, Code, Integrations)
- Node items: `36px` height, icon (16px) + name (`13px/400`) + drag handle on hover
- Hover: `bg: #F4F4F5`

### Canvas

- Background: `#FAFAFA` with subtle dot grid (`#E4E4E7`, 20px spacing, 1px dots)
- No canvas color tint — neutral silver-white
- Controls (bottom-left): Zoom in/out, fit view, minimap toggle — ghost icon buttons

### Node Visuals on Canvas

```
┌─────────────────────────────┐
│ [Icon]  Node Name      [●]  │  ← 160px wide, height auto
│                              │
│  [Status badge]              │  ← Only when executed
└─────────────────────────────┘
```

| Node Family | Icon BG | Border Accent | Icon Color |
|------------|---------|---------------|------------|
| Trigger | `#D1FAE5` (green-100) | `#34D399` (green) | `#059669` |
| Logic (If, Switch, Merge) | `#F4F4F5` (zinc-100) | `#D4D4D8` (zinc-300) | `#18181B` |
| Data (Transform, Filter, Aggregate) | `#EFF6FF` (blue-50) | `#93C5FD` (blue-300) | `#2563EB` |
| HTTP / Integration | `#F4F4F5` (zinc-100) | `#D4D4D8` (zinc-300) | `#18181B` |
| AI / Agent | `#F3F4F6` (gray-100) | `#18181B` (black) | `#18181B` |
| Code | `#FFFBEB` (amber-50) | `#FCD34D` (amber-300) | `#D97706` |
| Error | `#FEF2F2` (red-50) | `#FCA5A5` (red-300) | `#DC2626` |
| Output | `#F4F4F5` (zinc-100) | `#D4D4D8` (zinc-300) | `#71717A` |

**Node card specs:**
- Background: `#FFFFFF`
- Border: `1px solid` (family accent color)
- Radius: `8px`
- Shadow: `--shadow-xs`
- Selected: `border: 2px solid #18181B` + `shadow: --shadow-sm`
- Running: Subtle pulse animation on border
- Icon container: `28px` circle with family background color
- Name: `13px/500`, `#18181B`
- Execution badge: Small pill below name — "3 items" green, "Error" red

**Edge/Connection styles:**
- Default: `1.5px solid #D4D4D8` (zinc-300)
- Active (running data): `2px solid #34D399` with animated dash
- Error branch: `1.5px solid #FCA5A5` (red-300)
- Selected: `2px solid #18181B`

### Inspector Panel (Right)

- Width: `360px` (collapsible to 0, resizable 280-480px)
- Background: `#FFFFFF`
- Left border: `1px solid #E4E4E7`
- Header: Node icon + name (`15px/600`) + close button
- Tabs: `[Parameters]  [Settings]  [Test]` — underline style, `13px/500`
- Active tab: `#18181B` text + `2px` underline + black
- Inactive tab: `#71717A` text
- Content: Standard form fields with `--space-4` gaps

### Status Bar (Bottom)

- Height: `36px`
- Background: `#FAFAFA`
- Top border: `1px solid #E4E4E7`
- Left: Connection status dot (green `#34D399` = connected, red = disconnected) + text
- Center: Credit usage (if applicable)
- Right: Last execution time, keyboard shortcut hints

---

## 9. Dashboard Pages — Redesigned

### Workflows Page

```
┌──────────────────────────────────────────────────────────────┐
│  Workflows                              [+ New Workflow]      │
│  23 workflows in this workspace                               │
│                                                               │
│  [🔍 Search workflows...]  [All ▾] [Active ▾] [Sort: Recent]│
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ● Sync Shopify Orders       Active    12 runs   2m ago│  │
│  │   Shopify → Google Sheets   ●●●●○                     │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ ○ Process Refunds           Draft      0 runs    —   │  │
│  │   Stripe → Slack            ●○○○○                     │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ ● Customer Onboarding       Active    45 runs   5m ago│  │
│  │   Webhook → Gmail → CRM     ●●●●●                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Showing 1-10 of 23                       [◀ 1 2 3 ▶]       │
└──────────────────────────────────────────────────────────────┘
```

- Status dot: Green (`#34D399`) for active, gray (`#A1A1AA`) for draft
- Row layout: Name + integration icons + status badge + run count + last run time
- Health bar: 5-segment mini bar (green/red based on recent success rate)
- Click row → navigate to Studio

### Overview Page

```
┌──────────────────────────────────────────────────────────────┐
│  Overview                                                     │
│  Your workspace at a glance                                   │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 1,234    │ │ 98.2%    │ │ 23       │ │ 456      │       │
│  │ Runs     │ │ Success  │ │ Active   │ │ Credits  │       │
│  │ +12% ↑   │ │ -0.3% ↓  │ │ +2 new   │ │ of 10K   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                               │
│  ┌─── Execution Trends (7d) ────────────────────────────┐   │
│  │  [Area chart — #18181B line, #F4F4F5 fill]            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Recent Executions                                [View all →]│
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Sync Shopify   ✓ Completed   1.2s   2 min ago       │  │
│  │  Process Pay    ✗ Failed      0.8s   5 min ago       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- Stat cards: White bg, subtle border, large number (`30px/700`), label (`13px/400, #71717A`), delta (green/red)
- Charts: Black line/area, no fancy gradients. Grid lines `#F4F4F5`.
- Chart fill: `rgba(24, 24, 27, 0.04)` — barely visible zinc tint

### Execution Detail Page

- Left: Execution timeline (vertical node list with status icons)
- Right: Selected node's input/output (JSON viewer with syntax highlighting)
- Top: Execution metadata bar (ID, duration, trigger, status badge)

### Vault / Credentials Page

- Card grid of connections/credentials
- Each card: Integration icon + name + type (OAuth/API Key) + last used
- Status: Green dot (valid), amber (expiring), red (expired)

---

## 10. Animations and Transitions

### Principles

- Animations are **functional**, not decorative
- Max duration: `200ms` for hover/focus, `300ms` for open/close, `400ms` for page transitions
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) for panels; `ease-out` for hover

### Specific Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Button hover | `background-color` transition | `150ms ease` |
| Sidebar collapse | Width from 240px → 60px | `200ms ease-out` |
| Inspector panel open | Slide in from right | `250ms ease-out-expo` |
| Node panel open | Slide in from left | `250ms ease-out-expo` |
| Modal open | Fade in + scale from 0.95 | `200ms ease-out` |
| Toast appear | Slide up + fade in | `300ms ease-out` |
| Canvas node add | Scale from 0.8 + fade in | `300ms ease-out-expo` |
| Execution running | Border pulse on active node | `1.5s ease-in-out infinite` |
| Page transition | Fade in + slight upward slide | `200ms ease-out` |
| Dropdown open | Scale Y from 0.95 + fade in | `150ms ease-out` |

---

## 11. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Desktop | ≥1280px | Full layout: sidebar + content |
| Laptop | 1024-1279px | Sidebar auto-collapses to icons |
| Tablet | 768-1023px | Sidebar becomes drawer (hamburger toggle) |
| Mobile | <768px | Stack layout, bottom nav tabs, no Studio (redirect to dashboard) |

### Studio Responsive

- Below 1024px: Node panel collapses, inspector becomes bottom sheet
- Below 768px: Studio not supported — show "Open on desktop" message

---

## 12. Dark Mode (Phase 2)

Tokens for dark mode (not building in Phase 1, but tokens defined):

| Token | Dark Value |
|-------|-----------|
| `--background` | `#09090B` |
| `--surface` | `#18181B` |
| `--surface-raised` | `#27272A` |
| `--foreground` | `#FAFAFA` |
| `--foreground-secondary` | `#A1A1AA` |
| `--border` | `#27272A` |
| `--border-strong` | `#3F3F46` |
| `--accent` | `#34D399` (same green) |
| `--primary` | `#FAFAFA` (inverted — white buttons on dark) |
| `--primary-foreground` | `#09090B` |

---

## 13. Iconography

### Icon Library: Lucide React

- Size: `16px` (default), `20px` (sidebar/emphasis), `24px` (page headers)
- Stroke width: `1.5px` (default), `2px` (active state)
- Color: Inherit from text color (`currentColor`)
- Never colorize icons with brand green unless it's an active/success indicator

### Custom Icons

- FlowHolt logo mark (SVG, used in sidebar header and favicon)
- Node family icons (per node type, used on canvas and in node panel)
- Integration logos (per integration, used in integration cards and node details)

---

## 14. Implementation Tasks

These tasks should be added to IMPLEMENTATION-MASTER.md as a new "0B: UI Redesign" sprint:

| # | Task | Size |
|---|------|------|
| 0B.1 | Replace color tokens in `index.css` and `tailwind.config.ts` (remove purple, add new palette) | M |
| 0B.2 | Redesign DashboardSidebar (new layout, section labels, green active dot, workspace switcher) | L |
| 0B.3 | Redesign page headers (title + description + action pattern, consistent across all pages) | M |
| 0B.4 | Update button component (black primary, white secondary, ghost, destructive variants) | M |
| 0B.5 | Update input/form components (silver bg, clean borders, focus rings) | M |
| 0B.6 | Redesign WorkflowsPage (new table layout, status dots, health bars) | L |
| 0B.7 | Redesign OverviewPage (stat cards, clean charts, recent executions) | L |
| 0B.8 | Update card component (subtle shadow, clean borders) | S |
| 0B.9 | Update badge/status chip component (semantic colors) | S |
| 0B.10 | Update table component (silver header, clean rows, hover states) | M |
| 0B.11 | Redesign Studio TopBar (back button, env badge, black Run button) | M |
| 0B.12 | Redesign Studio Node Panel (clean search, accordion categories) | M |
| 0B.13 | Update canvas node visuals (family-colored icon containers, clean borders) | L |
| 0B.14 | Redesign Studio Inspector Panel (underline tabs, clean forms) | M |
| 0B.15 | Update Studio StatusBar (minimal, green connection dot) | S |
| 0B.16 | Redesign canvas (silver-white bg, dot grid, clean edges) | M |
| 0B.17 | Update modal/dialog component (blur backdrop, clean header/footer) | M |
| 0B.18 | Update toast component (accent stripe, clean layout) | S |
| 0B.19 | Redesign AuthPage (centered card, logo, minimal) | M |
| 0B.20 | Polish all remaining dashboard pages to match new design system | L |

---

## 15. Tailwind Config Changes

```javascript
// tailwind.config.ts — key changes needed
{
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#FAFAFA',
        'surface-raised': '#F4F4F5',
        foreground: '#18181B',
        'foreground-secondary': '#71717A',
        'foreground-muted': '#A1A1AA',
        border: '#E4E4E7',
        'border-strong': '#D4D4D8',
        accent: '#34D399',
        'accent-light': '#D1FAE5',
        'accent-dark': '#059669',
        primary: { DEFAULT: '#18181B', hover: '#27272A', foreground: '#FFFFFF' },
        destructive: { DEFAULT: '#EF4444', light: '#FEF2F2' },
        warning: { DEFAULT: '#F59E0B', light: '#FFFBEB' },
        info: { DEFAULT: '#3B82F6', light: '#EFF6FF' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '4px', md: '6px', lg: '8px', xl: '12px',
      },
    },
  },
}
```

---

## Related Files

- `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` — Studio zones and panels
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` — Studio detail spec
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` — Inspector panel fields
- `26-FLOWHOLT-STUDIO-OBJECT-FIELD-CATALOG-DRAFT.md` — Field catalog
- `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` — Tab states
- `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` — Node family exceptions
- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` — All routes and pages
- `56-FLOWHOLT-TESTING-AND-QA-SPEC.md` — Testing UX (data pinning, partial execution)
- [[wiki/concepts/design-system]] — Vault synthesis page
- [[wiki/concepts/studio-anatomy]] — Studio layout reference
- [[wiki/concepts/information-architecture]] — Navigation and page hierarchy
