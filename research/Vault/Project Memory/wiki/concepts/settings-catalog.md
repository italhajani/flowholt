---
title: Settings Catalog
type: concept
tags: [settings, inheritance, scopes, configuration]
sources: [plan-file-06, plan-file-38]
updated: 2026-04-16
---

# Settings Catalog

FlowHolt has 6 scope levels for settings, each inheriting from the level above.

---

## 6 Scope Levels (top → bottom)

```
User
  └── Organization
          └── Team
                  └── Workspace
                          └── Workflow
                                  └── Agent
```

Settings flow DOWN. Security-sensitive settings set at org level **cannot be weakened downstream** — this is enforced at the backend, not just UI.

---

## Key Setting Groups per Scope

### User
- UI preferences (theme, language, timezone)
- Notification preferences
- Session/auth controls

### Organization
- SSO/SAML configuration
- 2FA enforcement
- IP allowlist
- Data retention policies
- Audit log settings
- Credit allocation model

### Team
- Credit limits and thresholds (75/90/100% notifications)
- Default workspace settings
- Team-level feature flags

### Workspace
- Environment configuration (draft/staging/production)
- Execution concurrency limits
- Webhook queue size
- Default error handler
- Confidential data policy

### Workflow
- Sequential processing on/off
- Auto-commit on/off
- Max cycles
- Consecutive error threshold
- Confidential data override (if org allows)

### Agent
- Model and provider selection
- Temperature and token limits
- Memory type and TTL
- Tool call policy

---

## Weakening Prevention

Example chain:
- Org sets `require_2fa: true` → Team/Workspace/Workflow cannot override to `false`
- Org sets `data_retention: 30_days` → Workspace cannot extend to 90 days
- Org sets `confidential_data: true` → Workflow cannot disable

---

## Related Pages

- [[wiki/concepts/control-plane]] — org/team hierarchy that scopes settings
- [[wiki/concepts/permissions-governance]] — who can change settings at each level
- [[wiki/concepts/environment-deployment]] — workspace-level environment settings
- [[wiki/entities/make]] — Make's settings model (pattern source)
- [[wiki/sources/flowholt-plans]] — plan files 06, 38
