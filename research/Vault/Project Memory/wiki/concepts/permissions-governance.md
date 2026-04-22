---
title: Permissions and Governance
type: concept
tags: [permissions, capabilities, roles, enforcement, frontend, backend, n8n]
sources: [plan-file-08, plan-file-12, plan-file-18, plan-file-24, plan-file-28, plan-file-31, plan-file-34, plan-file-35, n8n-docs]
updated: 2026-04-16
---

# Permissions and Governance

How FlowHolt enforces who can do what — at the UI level and the API level.

---

## Capability Objects

The frontend receives typed capability objects per entity. These replace hardcoded UI gates.

### 4 Capability Levels

| Object | Capabilities |
|--------|-------------|
| `WorkflowCapabilities` | 12 capabilities (edit, publish, approve, run, replay, rollback, delete, ...) |
| `NodeCapabilities` | 5 capabilities (edit_parameters, edit_settings, run_test, view_output, pin_data) |
| `ExecutionCapabilities` | 8 capabilities (view, replay, stop, view_logs, view_data, view_ai_trace, ...) |
| `VaultAssetCapabilities` | 7 capabilities (view, use, edit, delete, share, rotate, audit) |

### Frontend Usage
```typescript
// Instead of hardcoded role checks:
if (userRole === 'builder') { ... }

// Use capability objects:
if (workflow.capabilities.can_publish) { ... }
```

---

## Denial Response Contract

When a capability-gated endpoint is called without permission:

```json
{
  "error": "PolicyDeniedError",
  "capability": "can_publish",
  "reason_code": "insufficient_role",
  "required_role": "builder",
  "current_role": "operator",
  "upgrade_path": "contact_team_admin"
}
```

---

## Role-by-Surface Enforcement Matrix

| Surface | Builder | Operator | Monitor | Guest |
|---------|---------|---------|---------|-------|
| Canvas edit | ✓ | — | — | — |
| Inspector parameters | ✓ | read | masked | — |
| Run workflow | ✓ | ✓ | — | — |
| Replay execution | ✓ | ✓ | — | — |
| Publish to staging | ✓ | — | — | — |
| Approve deployment | admin | — | — | — |
| View AI trace | ✓ | ✓ | — | — |
| View raw reasoning | ✓ | — | — | — |
| View vault assets | ✓ | ✓ | read | — |

---

## Backend Enforcement

Route-level capability check order:
1. Authenticate (JWT → session token with org/team roles)
2. Load workspace context
3. Preload capabilities for requested object
4. Check capability gate before mutation
5. Return `CapabilityDenialResponse` if denied

**Capability bundles are computed at workspace level**, not per-workflow, for performance.

---

## 4-Phase Migration Plan

1. Add capability fields to existing API responses (non-breaking)
2. Frontend reads capabilities (stops using hardcoded role checks)
3. Backend enforces via capability checks (not just role strings)
4. Retire legacy role-based hardcoded gates

---

## n8n Permission Scope Reference

n8n's custom roles (Enterprise) expose the full granular scope system. This is the most complete published reference for what scopes an automation platform needs. FlowHolt's capability system should cover at minimum everything here.

### Workflow scopes (n8n)
`create` | `read` | `update` | `publish` | `unpublish` | `delete` | `list` | `execute-chat` | `move` | `share` | `updateRedactionSetting`

**FlowHolt gap:** `workflow:publish` and `workflow:unpublish` are separate scopes from `workflow:update` in n8n. FlowHolt's capability objects already have `can_publish` — confirm it is separate from `can_edit`.

### Execution scopes (n8n)
`reveal` — specifically to reveal redacted execution data. 

**FlowHolt gap:** Execution data redaction is a per-workflow setting in n8n. FlowHolt has credit/observability model but needs a `can_reveal_execution_data` capability.

### Credential scopes (n8n)
`create` | `read` | `update` | `delete` | `list` | `move` | `share`

**FlowHolt equivalent:** Vault asset capabilities already cover most of these.

### Folder scopes (n8n)
`create` | `read` | `update` | `delete` | `list` | `move`

**FlowHolt gap:** Folder/collection organization not yet designed. When FlowHolt adds workflow folders, it needs these scopes.

### Data table scopes (n8n)
`create` | `read` | `update` | `delete` | `listProject` | `readRow` | `writeRow`

**FlowHolt alignment:** The `readRow` / `writeRow` separation from schema operations is important — readers vs writers of live data.

### Secret vault scopes (n8n)
`view` | `create` | `edit` | `delete` | `sync` (reload) | `secrets:list` (use in credentials)

**FlowHolt alignment:** `sync` = "reload vault" action. The `secrets:list` scope gates whether a user can _use_ secrets inside credentials even if they can't view the vault directly.

### Source control scopes (n8n)
`sourceControl:push` — project-admins can push, not pull (only instance owners/admins can pull)

---

## Key Architecture Insight: Two-Tier RBAC (from n8n)

n8n has a clean two-tier model:

| Tier | Scope | Roles |
|------|-------|-------|
| **Account type** (instance-wide) | Entire n8n instance | Owner, Admin, Member |
| **Project role** (project-scoped) | Within a project | Admin, Editor, Viewer, Custom |

A user has one account type but can have different project roles in different projects.

**FlowHolt's model** (Org→Team→Workspace) is richer than n8n's two-tier model, but n8n's scope naming system is the most granular reference available for what the capability atoms should be.

**Important n8n rule:** Variables and Tags are **global** — not project-scoped. They're available across all projects on the instance. FlowHolt should decide: are Variables (data stores) workspace-scoped or org-scoped?

---

## Related Pages

- [[wiki/concepts/control-plane]] — roles that feed the capability system
- [[wiki/concepts/studio-anatomy]] — tab-level role-state rules
- [[wiki/concepts/backend-architecture]] — where capability builders live
- [[wiki/entities/n8n]] — n8n's RBAC two-tier model and scope reference
- [[wiki/sources/flowholt-plans]] — plan files 08, 12, 18, 24, 28, 31, 34, 35
