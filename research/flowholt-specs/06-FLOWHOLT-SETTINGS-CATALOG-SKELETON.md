# FlowHolt Settings Catalog Skeleton

This file is the initial checklist for the final settings plan. The final version should enumerate every settings area, panel, tab, dropdown, toggle, and ownership rule.

> **Superseded.** The authoritative settings specification is `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md`. This file is kept as a historical skeleton and planning artifact.

## Cross-Reference Map

### This file is grounded in (raw sources)

- `research/make-help-center-export/pages_markdown/scenario-settings.md` — Make scenario settings: scheduling, data confidentiality flag, incomplete execution storage, sequential processing
- `research/make-help-center-export/pages_markdown/organizations.md` — Make org-level settings: billing, SSO, team limits, data residency options
- `research/make-help-center-export/pages_markdown/user-profile.md` — Make user profile settings: display name, email, timezone, notification preferences
- `research/n8n-docs-export/pages_markdown/workflows__settings.md` — n8n workflow settings panel: timezone, error workflow, saving mode, deduplication key

### Key n8n source code files

- `n8n-master/packages/editor-ui/src/components/WorkflowSettings.vue` — n8n workflow settings panel UI fields
- `n8n-master/packages/cli/src/config/schema.ts` — n8n instance-level configuration schema (env-driven settings)
- `n8n-master/packages/cli/src/controllers/me.controller.ts` — n8n user profile and personal settings endpoints

### n8n/Make comparison

- Make settings cascade from org → team → scenario; billing, SSO, and data residency live at org level; scenario settings cover scheduling, run limits, and data confidentiality
- n8n settings are split between an env-file instance config (no UI for most) and a per-workflow panel (timezone, error handler, saving mode); there is no team-level settings layer
- FlowHolt adopts Make's layered cascade (org → team → workspace → environment → workflow) combined with n8n-style per-workflow overrides; adds environment-scoped publish gates and AI agent settings absent from both references

### This file feeds into

- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` — full specification that supersedes this skeleton

## 1. User settings

Must eventually cover:
- profile identity
- email address
- avatar or display metadata
- email preferences
- notification preferences
- time zone
- API keys
- security and 2FA
- session settings
- account deletion or export

## 2. Organization settings

Must eventually cover:
- organization profile
- billing and subscription
- data residency later
- organization-wide policies
- security requirements
- SSO and domain claim
- org-level limits and consumption
- organization-wide shared assets

## 3. Team settings

Must eventually cover:
- team identity
- members
- team roles
- team consumption visibility
- team-scoped assets
- collaboration rules

## 4. Workspace settings

Must eventually cover:
- workspace identity if retained
- default views
- local collaboration defaults
- naming and conventions
- default runtime preferences

## 5. Environment settings

Must eventually cover:
- staging and production configuration
- publish gates
- approvals
- environment-scoped variables and credentials
- runtime safety checks

## 6. Workflow settings

Must eventually cover:
- schedule
- run limits
- retries and incomplete runs
- confidentiality
- commit or rollback behavior
- cycle limits
- publish metadata

## 7. AI agent settings

Must eventually cover:
- name and description
- model and provider
- instruction policy
- tools
- knowledge
- runtime budgets
- response format
- testing controls

## 8. Asset settings

Must eventually cover:
- credentials
- connection verification
- variable scope
- webhook behavior
- data store options
- knowledge indexing metadata
- template metadata and visibility

## 9. Security settings

Must eventually cover:
- auth policy
- 2FA
- SSO
- session timeout
- audit retention later
- API scopes
- secret visibility rules

## 10. Observability settings

Must eventually cover:
- alert rules
- notification channels
- trace retention later
- error reporting
- analytics visibility

## Required final format

The final settings plan should ultimately be tabular, with columns like:
- setting area
- section
- exact setting name
- control type
- scope
- default
- allowed values
- who can edit
- backend effect
- related UI surfaces
