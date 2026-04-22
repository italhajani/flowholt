---
title: Information Architecture
type: concept
tags: [information-architecture, navigation, routes, pages, sidebar]
sources: [plan-file-01, plan-file-03, plan-file-40]
updated: 2026-04-16
---

# Information Architecture

All the pages, navigation surfaces, and routes that make up FlowHolt's product surface.

---

## Current Routes (22)

Existing routes in `src/App.tsx` — dashboard, workflows, executions, credentials, integrations, settings, Studio, and auth routes.

## Planned New Pages (19)

Key additions across 2 phases:

### Phase 1 — Runtime Section in Sidebar
- Runtime Overview
- Jobs board
- Pauses / Human inbox
- Dead-letter queue
- Worker health

### Phase 2 — Org / Team Navigation
- Organization dashboard
- Team management
- Member management
- Credit management
- Audit logs
- Analytics dashboard
- Automation map

---

## Sidebar Evolution

**Phase 1 sidebar:**
```
Workflows
Agents
Credentials
Integrations
──────────
Runtime         ← NEW
  Overview
  Jobs
  Pauses
──────────
Settings
```

**Phase 2 sidebar:**
```
[Org/Team/Workspace switcher]  ← NEW
──────────
Workflows
Agents
Automation Map  ← NEW
──────────
Runtime
──────────
Org             ← NEW
  Analytics
  Credits
  Members
  Audit Log
──────────
Settings
```

---

## 6 Layout Types

| Type | Used for |
|------|---------|
| Auth | Login, register, forgot password |
| Dashboard | Main product layouts |
| Org | Organization management pages |
| Team | Team management pages |
| Studio | Full-screen workflow editor |
| Public | Public workflow pages (sharing) |

---

## Related Pages

- [[wiki/concepts/design-system]] — visual tokens, sidebar styling, layout wireframes, component patterns
- [[wiki/entities/flowholt]] — current route implementation
- [[wiki/concepts/control-plane]] — org/team switcher
- [[wiki/concepts/studio-anatomy]] — Studio layout (separate from dashboard layout)
- [[wiki/concepts/automation-map]] — new org-level page
- [[wiki/concepts/runtime-operations]] — Runtime section pages
- [[wiki/concepts/observability-analytics]] — Analytics and Audit pages
- [[wiki/concepts/ai-agents]] — Agent management page
- [[wiki/sources/flowholt-plans]] — plan files 01, 03, 40, 59
