---
title: Environment and Deployment
type: concept
tags: [environment, deployment, staging, production, approval, rollback, versioning, n8n]
sources: [plan-file-43, n8n-docs]
updated: 2026-04-16
---

# Environment and Deployment

FlowHolt's deployment pipeline is a major competitive advantage over [[wiki/entities/make]]. Make has only 60-day manual version saves. FlowHolt has a full promotion pipeline.

---

## Pipeline

```
Draft
  │  (builder saves version)
  ↓
Staging
  │  (builder requests approval)
  ↓
[Approval Review]  ← admin or publisher role
  │  approve / reject
  ↓
Production
```

---

## Environments

Each workspace has 3 environments:
- **Draft** — active development, unstable
- **Staging** — pre-release testing, stable snapshot
- **Production** — live execution, guarded by approval

**Environment-scoped connections:** each environment can have its own credential bindings. A workflow in production uses production credentials; same workflow in staging uses staging credentials.

---

## Version Comparison

- Select any two versions → step-level diff view
- See exactly which nodes changed, which settings changed
- Useful for approval review and debugging regressions

---

## Instant Rollback

Production can be rolled back to any previous version instantly:
1. Select target version
2. Confirm rollback
3. Active executions drain; new executions use rolled-back version

Deployment audit trail records every promotion, approval, and rollback.

---

## Execution Replay

Uses stored trigger data from any previous execution run against:
- Any workflow version
- Any environment

Use cases: testing, error recovery, data backfill.

---

## Workflow Export / Import

Follows [[wiki/entities/make]]'s blueprint model:
- JSON bundle: nodes + settings (NOT connections — these must be remapped on import)
- Vault reference mapping on import (match connection names to available vault assets)

---

## Clone

| Clone type | Behavior |
|-----------|---------|
| Same-workspace | Preserves connection bindings |
| Cross-workspace | Requires connection remapping |

Option to preserve polling trigger state on clone.

---

## n8n Version Model (for comparison)

n8n uses a simpler two-state model (draft → published) vs FlowHolt's three-environment pipeline:

| Aspect | n8n | FlowHolt |
|--------|-----|---------|
| Environments | 2: draft + production | 3: draft + staging + production |
| Approval gate | None | Admin/publisher approval |
| Version names | UUID by default, custom name on Pro+ | Named versions throughout |
| Version protection | Named versions protected from pruning | All versions retained |
| History retention | 24h (free), 5 days (Pro), unlimited (Enterprise) | Unlimited (per plan design) |
| Publish button states | 6 states (initial/ready/published/has-changes/invalid/error) | Needs design |
| Edit locking | Single editor at a time, lock auto-releases | Not designed yet |
| Sub-workflow executions | Don't count toward quotas | Should be same |

**FlowHolt's Publish Button States** (adopt from n8n, adapted):
- `disabled` — no publishable changes
- `ready` — changes exist, not yet published to any env
- `published` — current, no pending changes  
- `has_changes` — published but local edits pending
- `needs_approval` — submitted for staging/production, awaiting review
- `approval_rejected` — reviewer rejected the promotion
- `error` — changes exist but workflow has validation errors

**Edit locking:** FlowHolt should implement single-editor locking. When User A is editing, User B sees read-only view. Lock releases on inactivity timeout or explicit exit. The current editor's name/avatar shows in the TopBar.

---

## Related Pages

- [[wiki/concepts/execution-model]] — execution replay mechanism
- [[wiki/concepts/control-plane]] — approval roles
- [[wiki/concepts/permissions-governance]] — who can publish, approve, rollback
- [[wiki/concepts/connections-integrations]] — environment-scoped connections
- [[wiki/entities/make]] — Make's weaker version history for comparison
- [[wiki/entities/n8n]] — n8n's simpler two-state publish model
- [[wiki/sources/flowholt-plans]] — plan file 43
