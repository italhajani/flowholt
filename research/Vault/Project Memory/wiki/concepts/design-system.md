---
title: Design System
type: concept
tags: [design, ui, tokens, components, layout, theme, tailwind]
sources: [plan-file-59, plan-file-07, plan-file-11, plan-file-15, plan-file-26, plan-file-30, plan-file-33, plan-file-40, plan-file-56]
updated: 2026-04-17
---

# Design System

The visual language, component patterns, and layout architecture for [[wiki/entities/flowholt]]. Replaces the original purple theme with a clean, modern aesthetic inspired by agentic/AI interfaces (Claude, Cursor, GPT, Lovable).

---

## Core Identity

- **Background:** `#FFFFFF` (pure white) + `#FAFAFA` (silver-white surfaces)
- **Foreground:** `#18181B` (zinc-900 black) — headings, primary buttons, icons
- **Accent:** `#34D399` (emerald-400 green) — used sparingly: active indicators, success states, logo mark
- **Secondary text:** `#71717A` (zinc-500)
- **Borders:** `#E4E4E7` (zinc-200)
- **No purple.** The previous `hsl(258 60% 52%)` theme is fully retired.

---

## Design Tokens

| Category | Key Values |
|----------|-----------|
| Typography | Inter font, 8-size scale (11px–30px), weights: 400/500/600/700 |
| Spacing | 4px base grid, 12 tokens (2px–48px) |
| Radii | `sm` 4px, `md` 6px, `lg` 8px, `xl` 12px, `full` 9999px |
| Shadows | 5 levels (xs→lg), subtle and flat |
| Motion | Max 400ms, ease-out-expo for panels, reduce-motion respected |

---

## Component Patterns

| Component | Pattern |
|-----------|---------|
| **Primary Button** | Black bg (`#18181B`), white text, `rounded-md`, 36px height |
| **Secondary Button** | White bg, zinc-200 border, black text |
| **Ghost Button** | Transparent, hover: zinc-100 |
| **Destructive Button** | Red-600 bg, white text |
| **Inputs** | White bg, zinc-200 border, zinc-500 placeholder, focus: zinc-900 ring |
| **Cards** | White bg, zinc-200 border, `shadow-xs`, 8px radius |
| **Badges** | Muted: zinc-100 bg, zinc-600 text. Success: emerald-50 bg, emerald-700 text |
| **Toasts** | Bottom-right, zinc-900 bg, white text (or white bg with colored left border) |
| **Modal** | White bg, backdrop blur, max-width 480px, zinc-200 divider |

---

## Layout Architecture

### Dashboard Layout

```
┌──────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Content Area (flex-1)       │
│                   │                              │
│  [Workspace ▾]    │  Page Header                 │
│  ─────────────    │  ─────────────               │
│  OVERVIEW         │                              │
│  • Dashboard      │  Page Content                │
│  BUILD            │                              │
│  • Workflows      │                              │
│  • Agents         │                              │
│  DATA             │                              │
│  • Credentials    │                              │
│  TOOLS            │                              │
│  • Integrations   │                              │
│  SYSTEM           │                              │
│  • Settings       │                              │
│  ─────────────    │                              │
│  [User avatar]    │                              │
└──────────────────────────────────────────────────┘
```

- Sidebar: White bg, zinc-200 right border, section labels uppercase zinc-400
- Active item: Green dot (`#34D399`) indicator, zinc-100 bg
- Workspace switcher at top, user avatar at bottom

### Studio Layout

```
┌──────────────────────────────────────────────────────┐
│  TopBar (48px) — workflow name, state, [Run] button   │
├──────────┬──────────────────────────────┬─────────────┤
│  Node    │  Canvas (#FAFAFA + dot grid) │  Inspector  │
│  Panel   │                              │  Panel      │
│  (280px) │                              │  (360px)    │
├──────────┴──────────────────────────────┴─────────────┤
│  StatusBar (36px)                                      │
└──────────────────────────────────────────────────────┘
```

- TopBar: White bg, zinc-200 bottom border, black [Run ▸] button
- Canvas: Silver-white `#FAFAFA` with subtle dot grid (zinc-200 dots, 20px gap)
- Inspector: 3 underline tabs (Parameters / Settings / Test)

---

## Node Family Visual System

| Family | Icon BG | Border | Examples |
|--------|---------|--------|----------|
| Trigger | emerald-50 | emerald-200 | Manual, Webhook, Schedule, Form |
| Logic | zinc-50 | zinc-200 | Filter, Branch, Merge, Loop |
| Data | blue-50 | blue-200 | Transform, Aggregate, Split Out |
| AI | zinc-900 (dark) | zinc-700 | AI Agent, LLM Call, Summarize |
| Integration | white | zinc-200 | HTTP, Slack, GitHub (use app icon) |
| Code | amber-50 | amber-200 | Code (JS/Python), Execute Workflow |
| Error | red-50 | red-200 | Error Trigger, error handlers |
| Human | violet-50 | violet-200 | Human Task, Wait, Form (mid-flow) |

---

## Dark Mode (Phase 2)

Defined in spec file 59 §15. Surface: `#09090B`, cards: `#18181B`, borders: `#27272A`, green accent unchanged.

---

## Spec File Cross-References

The design system touches every UI-related spec:

| Spec | What it governs |
|------|----------------|
| 59 — UI Design System (PRIMARY) | Complete token definitions, all layouts, all components |
| 07 — Studio Surface | Canvas layout, panel structure |
| 11 — Studio Anatomy | Inspector tabs, node families |
| 15 — Inspector Modal Inventory | Field patterns, modal structure |
| 26 — Studio Object Field Catalog | Field component types |
| 30 — Studio Tab Role States | Tab visibility rules per role |
| 33 — Node Family Tab Exceptions | Per-family inspector overrides |
| 40 — Frontend Route Inventory | Page list, sidebar sections |
| 56 — Testing & QA | Debug mode UI, data pin indicators |

---

## Related Pages

- [[wiki/concepts/studio-anatomy]] — Studio layout, panels, tabs
- [[wiki/concepts/information-architecture]] — Page structure, sidebar evolution
- [[wiki/entities/flowholt]] — Current implementation state
- [[wiki/concepts/permissions-governance]] — Role-based UI visibility rules
- [[wiki/concepts/execution-model]] — Run/replay button placement
- [[wiki/concepts/environment-deployment]] — State badge and publish actions
- [[wiki/data/node-type-inventory]] — Node types and their visual families
- [[wiki/sources/flowholt-plans]] — Spec file 59 (primary), plus 07, 11, 15, 26, 30, 33, 40, 56
