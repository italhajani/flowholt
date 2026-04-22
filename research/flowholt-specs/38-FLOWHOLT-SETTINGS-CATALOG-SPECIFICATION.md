# FlowHolt Settings Catalog Specification

This file defines every settings group in the FlowHolt product, with exact field definitions, scope ownership, inheritance rules, and UI placement.

It is grounded in:
- `backend/app/models.py` — current `WorkspaceSettingsResponse` (30+ fields), `WorkflowSettings` (10 fields), `WorkflowPolicyResponse`
- Make corpus: `research/make-help-center-export/pages_markdown/scenario-settings.md`, `research/make-help-center-export/pages_markdown/module-settings.md`, `research/make-help-center-export/pages_markdown/manage-ai-agents.md`, `research/make-help-center-export/pages_markdown/organizations.md`, `research/make-help-center-export/pages_markdown/teams.md`
- `06-FLOWHOLT-SETTINGS-CATALOG-SKELETON.md` — initial skeleton
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — org/team entity model
- `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` — agent settings
- **Make editor UI crawl** (2026-04-14): `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — feature flags endpoint, enum endpoints, org settings navigation, notification settings

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §2 User settings | `research/make-help-center-export/pages_markdown/profile.md` | User profile fields, timezone, locale |
| §3 Organization settings | `research/make-help-center-export/pages_markdown/organizations.md` | Org settings: 2FA, SSO, billing, notifications |
| §3 Org security | `research/make-help-center-export/pages_markdown/two-factor-authentication.md` | 2FA enforcement settings |
| §4 Team settings | `research/make-help-center-export/pages_markdown/teams.md` | Team settings: operations limit, notifications |
| §5 Workspace settings | `research/make-help-center-export/pages_markdown/scenario-settings.md` | Sequential processing, confidential data, consecutive errors, incomplete executions |
| §6 Workflow settings | `research/make-help-center-export/pages_markdown/scenario-settings.md` | Per-scenario: timeout, auto commit, max cycles |
| §7 Agent settings | `research/make-help-center-export/pages_markdown/ai-agents-configuration.md` | Model, temperature, instructions, output format |
| §8 Notification settings | `research/make-help-center-export/pages_markdown/notifications.md` | Notification types, channels, thresholds |
| §All feature flags | `research/make-advanced/*/network-log*.json` | Feature flags endpoint (`/api/features`) confirmed in crawl |
| §All | `research/n8n-docs-export/pages_markdown/user-management/` | n8n global settings (instance-level) |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Settings entity | `n8n-master/packages/cli/src/databases/entities/Settings.ts` |
| Settings controller | `n8n-master/packages/cli/src/controllers/settings.controller.ts` |
| User settings | `n8n-master/packages/cli/src/controllers/me.controller.ts` |
| Feature flags | `n8n-master/packages/cli/src/commands/start.ts` (feature flag env vars) |
| Workflow settings | `n8n-master/packages/cli/src/databases/entities/Workflow.ts` → `settings` field |

### n8n comparison (settings model)

| Setting | n8n | FlowHolt |
|---------|-----|----------|
| Timezone | Instance-global | Per-user (display) + per-workflow (execution) |
| Feature flags | Environment variables | Database-backed feature flags (plan/role gated) |
| Instance settings | Single Settings entity | Multi-scope: user/org/team/workspace/workflow |
| User preferences | In user profile | Same |
| Security (2FA/SSO) | Enterprise env vars | UI-configurable per org |
| Workflow timeout | `EXECUTIONS_TIMEOUT` env var | Per-workflow setting (inherits from workspace default) |

### This file feeds into

| File | What it informs |
|------|----------------|
| `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` | Settings scope hierarchy |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | Settings storage (which entity owns which setting) |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Settings as a backend domain module |
| `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | All settings routes |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Credit notification thresholds (org settings) |
| `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` | Workflow deployment policies (workspace settings) |

---

```
User Settings (personal, follows the user)
  Organization Settings (billing boundary)
    Team Settings (collaboration boundary)
      Workspace Settings (operational boundary)
        Workflow Settings (per-workflow)
          Agent Settings (per-agent, within workflow or managed)
```

Each scope can inherit defaults from its parent, with explicit overrides.

---

## 2. User settings

**Scope**: Per-user, persisted in user record.
**UI location**: Profile page (top-right menu → Profile).
**Endpoint**: `GET/PUT /api/user/settings`

| Field | Type | Default | Description |
|---|---|---|---|
| `display_name` | string | from signup | User's display name |
| `email` | string | from signup | User's email (read-only after verification) |
| `avatar_initials` | string | derived | Two-letter initials for avatar |
| `timezone` | string | "UTC" | User's preferred timezone (display purposes) |
| `locale` | string | "en" | UI language preference |
| `theme` | "light" \| "dark" \| "system" | "system" | UI theme preference |
| `date_format` | "relative" \| "absolute" \| "iso" | "relative" | Timestamp display format |
| `notifications_email` | boolean | true | Receive email notifications |
| `notifications_in_app` | boolean | true | Receive in-app notifications |
| `notification_digest` | "instant" \| "hourly" \| "daily" \| "none" | "instant" | Email notification frequency |
| `default_organization_id` | string \| null | first org | Which org to load on login |
| `default_workspace_id` | string \| null | first workspace | Which workspace to load on login |
| `studio_layout_preference` | "auto" \| "horizontal" \| "vertical" | "auto" | Studio panel layout |
| `studio_minimap` | boolean | true | Show canvas minimap |
| `studio_snap_to_grid` | boolean | true | Snap nodes to grid |

---

## 3. Organization settings

**Scope**: Per-organization, managed by org_owner/org_admin.
**UI location**: Org → Org Settings page.
**Endpoint**: `GET/PUT /api/organizations/{org_id}/settings`

### 3.1 General

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | string | required | Organization name |
| `slug` | string | derived | URL-safe identifier |
| `region` | string | "us" | Data center region (immutable after creation) |
| `timezone` | string | "UTC" | Default timezone for scheduling |
| `country` | string \| null | null | Physical location (informational) |

### 3.2 Security

| Field | Type | Default | Description |
|---|---|---|---|
| `sso_enabled` | boolean | false | Enable SSO/SAML (enterprise) |
| `sso_provider_url` | string \| null | null | SSO provider endpoint |
| `domain_claim` | string \| null | null | Auto-assign users from this domain |
| `require_2fa` | boolean | false | Require 2FA for all members |
| `session_ttl_hours` | int | 24 | Session expiration time |
| `ip_allowlist` | string[] | [] | Restrict login to specific IPs |

### 3.3 Defaults (inherited by teams/workspaces)

| Field | Type | Default | Description |
|---|---|---|---|
| `default_execution_timeout_seconds` | int | 3600 | Default timeout for new workspaces |
| `default_save_execution_data` | boolean | true | Default data saving policy |
| `default_redact_execution_payloads` | boolean | false | Default confidentiality policy |
| `default_max_concurrent_executions` | int | 10 | Default concurrency per workspace |
| `default_require_staging_before_production` | boolean | false | Default deployment governance |
| `default_require_staging_approval` | boolean | false | Default staging approval |
| `default_require_production_approval` | boolean | false | Default production approval |

### 3.4 Billing (read-only for non-billing roles)

| Field | Type | Default | Description |
|---|---|---|---|
| `plan` | OrganizationPlan | "free" | Current plan |
| `billing_email` | string \| null | null | Billing contact |
| `operations_this_month` | int | 0 | Current usage (read-only) |
| `operations_limit` | int | plan-based | Monthly limit (read-only) |
| `storage_used_bytes` | int | 0 | Current storage (read-only) |
| `storage_limit_bytes` | int | plan-based | Storage limit (read-only) |

---

## 4. Team settings

**Scope**: Per-team, managed by team_admin or org_admin.
**UI location**: Org → Teams → [Team] → Settings tab.
**Endpoint**: `GET/PUT /api/teams/{team_id}/settings`

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | string | required | Team name |
| `description` | string \| null | null | Team description |
| `credit_limit` | int \| null | null | Max credits per month (null = org pool) |
| `credit_threshold_percent` | int | 80 | Alert when usage reaches this % |
| `notify_on_scenario_error` | boolean | true | Email team admins on workflow failure |
| `notify_on_scenario_warning` | boolean | true | Email team admins on warnings |
| `notify_on_credit_threshold` | boolean | true | Alert when approaching credit limit |
| `default_workspace_timezone` | string \| null | null | Override org timezone for new workspaces |

---

## 5. Workspace settings

**Scope**: Per-workspace, managed by workspace owner/admin.
**UI location**: Dashboard → Settings page.
**Endpoint**: `GET/PUT /api/workspaces/current/settings` (existing)

The current `WorkspaceSettingsResponse` is already comprehensive. Organized into groups:

### 5.1 General

| Field | Type | Current? | Description |
|---|---|---|---|
| `timezone` | string | ✓ | Workspace timezone |
| `public_base_url` | string \| null | ✓ | Base URL for public triggers |
| `log_level` | LogLevel | ✓ | Logging verbosity |

### 5.2 Webhooks and triggers

| Field | Type | Current? | Description |
|---|---|---|---|
| `require_webhook_signature` | boolean | ✓ | Require HMAC signature on webhooks |
| `webhook_secret_configured` | boolean | ✓ | Whether signing secret is set (read-only) |
| `allow_public_webhooks` | boolean | ✓ | Allow public webhook URLs |
| `allow_public_chat_triggers` | boolean | ✓ | Allow public chat trigger URLs |

### 5.3 Execution and runtime

| Field | Type | Current? | Description |
|---|---|---|---|
| `execution_timeout_seconds` | int | ✓ | Default execution timeout |
| `save_execution_data` | boolean | ✓ | Store execution data for inspection |
| `save_failed_executions` | ExecutionSaveMode | ✓ | Which failed executions to save |
| `save_successful_executions` | ExecutionSaveMode | ✓ | Which successful executions to save |
| `save_manual_executions` | boolean | ✓ | Save manual/test executions |
| `save_execution_progress` | boolean | ✓ | Save intermediate step progress |
| `execution_data_retention_days` | int | ✓ | Days to retain execution data |
| `max_concurrent_executions` | int | ✓ | Maximum parallel executions |
| `redact_execution_payloads` | boolean | ✓ | Mask execution data in UI |

### 5.4 Deployment and governance

| Field | Type | Current? | Description |
|---|---|---|---|
| `staging_min_role` | WorkspaceRole | ✓ | Minimum role to promote to staging |
| `publish_min_role` | WorkspaceRole | ✓ | Minimum role to publish to production |
| `run_min_role` | WorkspaceRole | ✓ | Minimum role to run workflows |
| `production_asset_min_role` | WorkspaceRole | ✓ | Minimum role for production vault assets |
| `require_staging_before_production` | boolean | ✓ | Must pass staging before production |
| `require_staging_approval` | boolean | ✓ | Require approval for staging promotion |
| `require_production_approval` | boolean | ✓ | Require approval for production publish |
| `deployment_approval_min_role` | WorkspaceRole | ✓ | Minimum role to approve deployments |
| `allow_self_approval` | boolean | ✓ | Can the requester approve their own request |

### 5.5 Notifications

| Field | Type | Current? | Description |
|---|---|---|---|
| `email_notifications_enabled` | boolean | ✓ | Master email notification toggle |
| `notify_on_failure` | boolean | ✓ | Email on execution failure |
| `notify_on_success` | boolean | ✓ | Email on execution success |
| `notify_on_approval_requests` | boolean | ✓ | Email on deployment approval requests |

### 5.6 Proposed additions

| Field | Type | Description |
|---|---|---|
| `sequential_processing` | boolean | Block new executions until incompletes resolve (from Make) |
| `data_is_confidential` | boolean | Prevent execution data storage entirely (from Make) |
| `consecutive_error_threshold` | int \| null | Auto-deactivate workflow after N consecutive failures (from Make) |
| `auto_retry_incomplete` | boolean | Automatically retry failed executions |
| `auto_retry_backoff_seconds` | int | Base backoff interval for auto-retry |
| `auto_retry_max_attempts` | int | Maximum auto-retry attempts |
| `dead_letter_retention_days` | int | Days to retain dead-letter items |
| `alert_on_queue_backlog` | boolean | Trigger alert when queue exceeds threshold |
| `alert_queue_backlog_threshold` | int | Number of pending jobs to trigger alert |

---

## 6. Workflow settings

**Scope**: Per-workflow, managed by builders.
**UI location**: Studio → Workflow Settings modal.
**Endpoint**: Embedded in workflow definition via `WorkflowSettings`

### 6.1 Current fields

Raw source: `research/n8n-docs-export/pages_markdown/workflows__settings.md` (confirmed all fields below exist in n8n production)

| Field | Type | Description | n8n confirmed |
|---|---|---|---|
| `execution_order` | "v1" \| "legacy" | v1 (recommended): complete one branch before starting another, top-to-bottom order. v0 (legacy): run first node of all branches, then second, etc. | ✅ n8n `v1` is default |
| `error_workflow_id` | string \| null | Workflow to trigger on error. n8n name: "Error Workflow". | ✅ |
| `caller_policy` | "any" \| "whitelist" \| "none" | Which workflows can call this as sub-workflow. n8n field: "This workflow can be called by". | ✅ |
| `caller_whitelist` | string[] | Workflow IDs allowed to call this workflow (when `caller_policy = "whitelist"`). | ✅ |
| `timezone` | string | Workflow-specific timezone. Falls back to workspace timezone → server timezone. Default: EDT (New York). | ✅ |
| `save_failed_executions` | "all" \| "none" | Save failed production executions. Override workspace setting. | ✅ |
| `save_successful_executions` | "all" \| "none" | Save successful production executions. Override workspace setting. | ✅ |
| `save_manual_executions` | boolean | Save manual/test executions. Override workspace setting. | ✅ |
| `save_execution_progress` | boolean | Save intermediate step progress (checkpoint mode). Enables resume from error. May increase latency. | ✅ |
| `timeout_seconds` | int | Hard execution timeout. On Cloud plans: max enforced per plan tier. | ✅ |
| `redact_production_execution_data` | boolean | Hide input/output data of each node in production executions. | ✅ n8n "Redact production execution data" |
| `redact_manual_execution_data` | boolean | Hide input/output data of each node in manual executions. | ✅ n8n "Redact manual execution data" |
| `time_saved_minutes` | int | Estimated time saved per execution (for Insights analytics). | ✅ n8n "Estimated time saved" |

### 6.2 Proposed additions (grounded in Make's scenario settings)

| Field | Type | Default | Make equivalent | Description |
|---|---|---|---|---|
| `sequential_processing` | boolean | false | "Sequential processing" | Block new runs until incompletes resolve |
| `data_is_confidential` | boolean | false | "Data is confidential" | Prevent storing execution data for this workflow |
| `store_incomplete_executions` | boolean | true | "Store incomplete executions" | Whether to create dead-letter items on failure |
| `consecutive_error_threshold` | int \| null | null | "Number of consecutive errors" | Auto-deactivate after N consecutive failures |
| `max_cycles` | int | 1 | "Max number of cycles" | Max polling trigger iterations per execution |
| `description` | string \| null | null | Scenario description | Workflow-level description (for docs and agent tools) |
| `inputs_schema` | dict \| null | null | "Scenario inputs" | Formal input schema (for workflow-as-tool) |
| `outputs_schema` | dict \| null | null | "Scenario outputs" | Formal output schema (for workflow-as-tool) |
| `allow_tool_invocation` | boolean | false | — | Allow this workflow to be used as an agent tool |
| `notes` | string \| null | null | "Scenario notes" | Freeform notes attached to the workflow |

---

## 7. Agent settings

**Scope**: Per-managed-agent, managed by builders.
**UI location**: AI Agents → [Agent] → detail page.
**Endpoint**: Embedded in `ManagedAgentDetail` (see file 37)

| Field | Type | Default | Make equivalent | Description |
|---|---|---|---|---|
| `provider` | string | "openai" | AI provider | LLM provider |
| `model` | string | "" | Model | Model identifier |
| `temperature` | float | 0.7 | — | Sampling temperature |
| `max_tokens` | int \| null | null | "Maximum tokens" | Max response tokens |
| `max_steps` | int | 25 | "Maximum steps" | Max tool-use iterations |
| `max_history` | int | 50 | "Maximum history" | Conversation turns retained |
| `output_format` | "text" \| "json" \| "structured" | "text" | — | Response format |
| `output_schema` | dict \| null | null | — | JSON schema for structured output |
| `timeout_seconds` | int | 300 | — | Per-agent execution timeout |
| `retry_on_tool_failure` | bool | true | — | Retry failed tool calls |
| `max_tool_retries` | int | 2 | — | Max retry attempts per tool call |
| `shared_with_team` | bool | false | "Shared across team" | Team visibility |

---

## 8. Settings inheritance and override rules

### Override chain

```
Organization defaults → Team defaults → Workspace settings → Workflow settings
```

### Override semantics

1. **Organization defaults** set the floor for all workspaces in the org. Example: if org sets `default_require_staging_before_production: true`, new workspaces inherit this.

2. **Team defaults** can narrow org defaults but not weaken them. Example: if org requires staging approval, team cannot disable it.

3. **Workspace settings** are the primary operational configuration. Can override team defaults within org-allowed bounds.

4. **Workflow settings** can override workspace settings for specific fields (execution save modes, timeout, timezone). Cannot weaken security settings.

### Non-overridable settings

These settings can only be set at a specific scope and cannot be overridden downstream:

| Setting | Locked at scope | Rationale |
|---|---|---|
| `region` | Organization | Data residency cannot change per-team |
| `sso_enabled` | Organization | Security policy is org-wide |
| `require_2fa` | Organization | Security policy is org-wide |
| `plan` | Organization | Billing boundary |
| `credit_limit` | Team | Budget control |
| `deployment_approval_min_role` | Workspace | Deployment governance |

### Weakening prevention

If the organization sets `default_redact_execution_payloads: true`, a workspace can keep it `true` but cannot set it to `false`. This prevents downstream scopes from weakening security policies.

Implementation: settings that are security-sensitive have a `min_scope` flag:

```python
class SettingPolicy(BaseModel):
    key: str
    value: Any
    source: Literal["default", "organization", "team", "workspace", "workflow"]
    can_weaken: bool                     # false for security settings
    inherited_value: Any | None = None   # value from parent scope
```

---

## 9. Settings UI specification

### Dashboard Settings page (workspace scope)

```
┌──────────────────────────────────────────────────────┐
│ Workspace Settings                                   │
├──────────────────────────────────────────────────────┤
│ [General] [Webhooks] [Execution] [Deployment]        │
│ [Notifications] [Advanced]                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ General                                              │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Timezone          [UTC ▼]                        │ │
│ │ Public base URL   [https://...]                  │ │
│ │ Log level         [info ▼]                       │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ Execution & Runtime                                  │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Execution timeout      [3600] seconds            │ │
│ │ Max concurrent         [10]                      │ │
│ │ Save failed execs      [All ▼]                   │ │
│ │ Save successful execs  [All ▼]                   │ │
│ │ Save manual execs      [✓]                       │ │
│ │ Save progress          [✗]                       │ │
│ │ Retention days         [14]                      │ │
│ │ Redact payloads        [✗]    🔒 Org: inherited  │ │
│ │ Sequential processing  [✗]                       │ │
│ │ Data is confidential   [✗]                       │ │
│ │ Error threshold        [—] (disabled)            │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│                                    [Save Changes]    │
└──────────────────────────────────────────────────────┘
```

The `🔒 Org: inherited` indicator shows when a setting is locked by a parent scope.

### Workflow Settings modal

The existing `WorkflowSettingsModal.tsx` already organizes settings into groups. Additions should follow the same pattern:

- **Execution** group: add `sequential_processing`, `data_is_confidential`, `store_incomplete_executions`, `consecutive_error_threshold`, `max_cycles`
- **Integration** group: add `inputs_schema`, `outputs_schema`, `allow_tool_invocation`
- **Documentation** group: add `description`, `notes`

---

## 10. Settings capability model

```python
class SettingsCapabilities(BaseModel):
    view_user_settings: CapabilityState
    edit_user_settings: CapabilityState
    view_org_settings: CapabilityState
    edit_org_settings: CapabilityState
    view_org_billing: CapabilityState
    edit_org_billing: CapabilityState
    view_team_settings: CapabilityState
    edit_team_settings: CapabilityState
    view_workspace_settings: CapabilityState
    edit_workspace_settings: CapabilityState
```

| Capability | org_owner | org_admin | org_member/builder | viewer |
|---|---|---|---|---|
| view_user_settings | ✓ | ✓ | ✓ | ✓ |
| edit_user_settings | ✓ | ✓ | ✓ | ✓ |
| view_org_settings | ✓ | ✓ | ✓ | ✓ |
| edit_org_settings | ✓ | ✓ | ✗ | ✗ |
| view_org_billing | ✓ | ✓ | ✗ | ✗ |
| edit_org_billing | ✓ | ✓ | ✗ | ✗ |
| view_team_settings | ✓ | ✓ | ✓ | ✓ |
| edit_team_settings | ✓ | ✓ | ✗ | ✗ |
| view_workspace_settings | ✓ | ✓ | ✓ | ✓ |
| edit_workspace_settings | ✓ | ✓ | ✗ | ✗ |

---

## 11. Rollout phases

### Phase 1: Workspace settings expansion

- Add proposed workspace settings fields (`sequential_processing`, `data_is_confidential`, etc.)
- Add proposed workflow settings fields (`sequential_processing`, `inputs_schema`, etc.)
- Expand Settings page UI with new sections

### Phase 2: User settings

- Create user settings model and endpoint
- Add Profile → Settings page
- Implement theme, locale, and notification preferences

### Phase 3: Organization and team settings

- Create org and team settings models (depends on file 36 implementation)
- Add Org → Org Settings page
- Add Org → Teams → Settings pages
- Implement inheritance chain

### Phase 4: Inheritance and policy

- Implement settings inheritance resolver
- Add "Inherited from" indicators in UI
- Implement weakening prevention logic
- Add org-level security policy enforcement

---

## 12. Planning decisions still open

1. **Settings API format**: Should settings be a flat object (current) or a categorized structure with groups? Recommend: keep flat for backend API, group in frontend UI only.

2. **Settings history/audit**: Should settings changes be audited? Recommend: yes, log settings changes as audit events with before/after values.

3. **Settings export/import**: Should settings be exportable as a configuration bundle? Recommend: defer, but design the API to support it later.

4. **Environment-specific settings**: Some settings (like `max_concurrent_executions`) may need environment-specific values (higher in production). Recommend: add optional `staging_override` and `production_override` fields in Phase 3.

5. **Settings migration tool**: When org/team settings are introduced, existing workspace settings should be preserved. The migration should create default org/team with settings matching current workspace values. Aligned with file 36 Phase 1 migration.

---

## 13. Make settings patterns (from editor crawl)

### Feature flags

Make fetches feature flags from `/api/server/features` on every page load (32 calls during a single session crawl). This is a server-side feature flag system, not embedded in settings.

FlowHolt should implement a dedicated feature flag service from Phase 1:
- **Endpoint**: `GET /api/server/features`
- **Scope**: Global (affects all users) and per-org/per-workspace overrides
- **Caching**: Frontend should cache with short TTL (5 minutes)
- **Use cases**: Beta feature gates (e.g., AI Agents "Beta" pill), plan-tier gating, rollout percentages

### Enum centralization

Make centralizes all lookup data as `/api/v2/enums/*`:
- `/enums/countries` — country list
- `/enums/locales` — locale list
- `/enums/timezones` — timezone list
- `/enums/imt-zones` — infrastructure zone list
- `/enums/variable-types` — variable type options
- `/enums/user-email-notifications` — email notification type options

FlowHolt should adopt this pattern. Planned enum endpoints:
- `/api/enums/countries`
- `/api/enums/locales`
- `/api/enums/timezones`
- `/api/enums/variable-types`
- `/api/enums/notification-types`
- `/api/enums/plan-tiers`

### Notification options (from crawl)

Make has "Notification options" as a distinct settings page under the Utilities group (test ID `tree-menu-item-2-3`). This is separate from the "Notifications" dropdown in the top bar.

FlowHolt should plan notification settings as:
- **User-level**: Which notification types to receive (email, in-app, digest frequency) — already in User Settings (section 2)
- **Workspace-level**: Which events trigger notifications (execution failures, agent errors, quota warnings) — add to Workspace Settings
- **Scenario-level**: Per-workflow notification overrides (override workspace defaults) — add to Workflow Settings

### Settings page navigation

Make's organization settings page uses 3 navigation groups (see file 36, section 13):
- Organization: Dashboard, Teams, Users
- My Plan: Subscription, Credit usage, Payments
- Utilities: Installed apps, Variables, Scenario properties, Notification options

FlowHolt should adopt a similar 3-group pattern for workspace settings:
- Workspace: Overview, Members, Roles
- Plan & Usage: Subscription, Credit usage, Billing
- Configuration: Connections, Variables, Workflow defaults, Notification options

---

## n8n settings cross-reference (from `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`)

### n8n FrontendSettings delivery pattern

n8n delivers all client configuration in a single `FrontendSettings` object (309 lines of types). This avoids multiple roundtrips on app init. Key setting groups:

| Group | Settings | FlowHolt equivalent |
|---|---|---|
| Instance | `instanceId`, `versionCli`, `nodeJsVersion`, `databaseType`, `executionMode` | Workspace overview |
| Auth | `userManagement`, `sso` (SAML, OIDC, LDAP), `mfa` | User + Org settings |
| Enterprise | `sharing`, `advancedPermissions`, `sourceControl`, `externalSecrets`, `customRoles`, `dataRedaction`, `workflowDiffs`, `namedVersions` | Feature flags per plan |
| AI | `aiAssistant`, `askAi`, `aiBuilder`, `aiCredits`, `aiGateway`, `ai.allowSendingParameterValues` | AI settings |
| Modules | `activeModules`, module-specific settings (insights, mcp, chat-hub, instance-ai, external-secrets, quick-connect) | Module settings |
| Templates | `templates.enabled`, `templates.host` | Resource center settings |
| Telemetry | `telemetry`, `posthog` | Analytics settings |
| Endpoints | `endpointWebhook`, `endpointForm`, `endpointMcp` | Webhook/MCP config |
| Limits | `executionTimeout`, `maxExecutionTimeout`, `concurrency` | Workspace quota settings |
| Security | `security.blockFileAccessToN8nFiles`, `binaryDataMode` | Security settings |

### n8n settings pages (routes)

| Route | n8n view | FlowHolt mapping |
|---|---|---|
| `/settings/usage` | Usage & plan | Plan & billing |
| `/settings/personal` | Personal settings | User settings |
| `/settings/security` | Security settings | Org security |
| `/settings/users` | User management | Org members |
| `/settings/ai` | AI assistant config | AI settings |
| `/settings/n8n-connect` | AI gateway | AI gateway settings |
| `/settings/resolvers` | Dynamic credentials | Enterprise credential config |
| `/settings/project-roles` | Custom role management | Role management (enterprise) |
| `/settings/api` | API key management | API keys |
| `/settings/environments` | Source control (Git) | Source control |
| `/settings/external-secrets` | External secrets | Vault integration |
| `/settings/sso` | SAML/OIDC SSO | SSO configuration |
| `/settings/ldap` | LDAP configuration | LDAP configuration |
| `/settings/log-streaming` | Log streaming destinations | Log streaming |
| `/settings/workers` | Worker view | Worker/queue management |
| `/settings/community-nodes` | Community node packages | Custom node packages |
| `/settings/migration-report` | Breaking changes report | Migration report |

### Key patterns to adopt

1. **Single settings endpoint** — FlowHolt should serve all client settings via `GET /api/settings` at app init, not piecemeal.

2. **Module settings** — n8n's `FrontendModuleSettings` type allows each backend module to contribute its own client-side settings. FlowHolt should adopt this extensible pattern.

3. **Enterprise feature flags as settings** — n8n's `IEnterpriseSettings` interface exposes 20+ boolean flags for enterprise features. FlowHolt should mirror this for plan-gating.

4. **Settings page RBAC** — Every n8n settings route has `middleware: ['authenticated', 'rbac']` with specific scope requirements. FlowHolt should gate every settings page with corresponding scopes.

5. **Env feature flags** — n8n has `N8nEnvFeatFlags` for environment-variable-based feature flags (`N8N_ENV_FEAT_*`). FlowHolt should support similar environment-based overrides for development/testing.

---

## Custom Workflow Properties (from file 48 §6 — Enterprise/Teams feature)

Admin-defined metadata fields that org members can apply to workflows and use to filter/sort the workflow list. Gated to Teams+ (Make gates to Enterprise).

### Entity model

```python
class WorkflowPropertyDefinition(BaseModel):
    id: str
    org_id: str
    name: str           # unique internal identifier (org-scoped)
    label: str          # display name in workflow list table
    hint_text: str | None = None
    field_type: Literal["short_text", "long_text", "number", "boolean", "date", "dropdown", "multichoice"]
    required: bool = False
    options: list[str] | None = None  # for dropdown/multichoice

class WorkflowPropertyValue(BaseModel):
    workflow_id: str
    property_definition_id: str
    value: Any          # polymorphic by field_type
```

### Field types supported

| Field type | Description |
|---|---|
| Short text | Up to 200 characters |
| Long text | Up to 1,000 characters; multi-line |
| Number | Integer values |
| Boolean | Yes/No (radio buttons in UI) |
| Date | Date and time (ISO 8601) |
| Dropdown | Single-select list |
| Multichoice | Multi-select list |

### Management location

- **Created/managed at**: Org Dashboard → "Workflow Properties" tab (org owners and admins only)
- **Applied/edited at**: Workflow list → 3-dot menu → "Edit properties"; Workflow detail page

### Workflow list table integration

When custom properties are defined:
- Workflow list switches between **List view** and **Table view**
- Table view shows custom property columns as sortable column headers
- Filters can be applied by custom property values
