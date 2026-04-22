---
title: Control Plane
type: concept
tags: [control-plane, org, team, workspace, roles, hierarchy]
sources: [plan-file-04, plan-file-36]
updated: 2026-04-16
---

# Control Plane

The management layer above individual workflows. Defines who owns what, who can do what, and how assets are scoped.

---

## Hierarchy

```
Organization
    └── Team(s)
            └── Workspace(s)
                    └── Workflows, Agents, Assets
```

[[wiki/entities/make]] has Org → Team (no workspace). [[wiki/entities/flowholt]] adds the **Workspace** layer between Team and Workflows — this is intentional and gives environment-scoped asset isolation.

---

## Roles

### Organization Roles (5)
| Role | Permissions |
|------|-------------|
| Owner | Full control, billing, delete org |
| Admin | Manage teams, members, settings |
| Member | Work within assigned teams |
| Billing | Billing only |
| Guest | Read-only access to shared assets |

### Team Roles (5)
| Role | Permissions |
|------|-------------|
| Admin | Manage workspace, team settings |
| Builder | Create and edit workflows and agents |
| Operator | Trigger and monitor runs |
| Monitor | View executions and logs only |
| Guest | Read-only |

### Effective Role Computation
`effective_role = compute(team_role, org_role_override)`

The session token evolves to include: `org_id`, `team_id`, `org_role`, `team_role`.

---

## Migration Strategy (Non-Breaking)

Current FlowHolt: flat workspace-only model.
Target: org → team → workspace hierarchy.

Migration: each existing workspace gets an implicit default org + default team. Existing roles map cleanly. The `require_workspace_role` helper computes effective role from both.

---

## Settings Inheritance

Settings flow down: `org → team → workspace → workflow → agent`

**Weakening prevention:** security-sensitive settings set at org level cannot be relaxed downstream. See [[wiki/concepts/settings-catalog]].

---

## Related Pages

- [[wiki/entities/flowholt]] — current implementation state
- [[wiki/entities/make]] — Make's org/team model (pattern source)
- [[wiki/concepts/settings-catalog]] — 6-level settings inheritance
- [[wiki/concepts/permissions-governance]] — capability system built on top of roles
- [[wiki/sources/flowholt-plans]] — plan files 04, 36
