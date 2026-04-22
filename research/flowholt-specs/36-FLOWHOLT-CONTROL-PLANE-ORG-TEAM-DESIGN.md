# FlowHolt Control-Plane: Organization And Team Entity Design

This file turns the control-plane skeleton (`04-FLOWHOLT-CONTROL-PLANE-SKELETON.md`) into a concrete entity model for organizations, teams, and multi-workspace support, with exact data shapes, role hierarchies, and migration path from the current workspace-only model.

It is grounded in:
- `backend/app/models.py` — current `WorkspaceRole`, `WorkspaceSummary`, `WorkspaceMemberSummary`, `SessionResponse`
- `backend/app/auth.py` — current session token structure (`sub`, `workspace_id`, `role`)
- `backend/app/main.py` — current workspace/member endpoints, `get_session_context`, `require_workspace_role`
- Make corpus: `research/make-help-center-export/pages_markdown/organizations.md`, `research/make-help-center-export/pages_markdown/teams.md`, `research/make-help-center-export/pages_markdown/organizations-and-teams.md`
- `04-FLOWHOLT-CONTROL-PLANE-SKELETON.md` — proposed scope hierarchy
- `10-MAKE-TO-FLOWHOLT-GAP-MATRIX.md` — gap analysis for control-plane domain
- `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` — capability state patterns
- **Make editor UI crawl** (2026-04-14): `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — live API endpoint inventory, org settings navigation, team/user role endpoints

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §1 Entity hierarchy | `research/make-help-center-export/pages_markdown/organizations.md` | Org structure, owner/admin roles |
| §1 Entity hierarchy | `research/make-help-center-export/pages_markdown/teams.md` | Team structure, team roles |
| §1 Entity hierarchy | `research/make-help-center-export/pages_markdown/organizations-and-teams.md` | Combined org/team relationships |
| §2 Org roles | `research/make-help-center-export/pages_markdown/user-roles.md` | 5 org roles (Owner/Admin/Member/Accountant/Guest) |
| §3 Team roles | `research/make-help-center-export/pages_markdown/teams.md` §Roles | Team-level roles |
| §4 Plan quotas | `research/make-help-center-export/pages_markdown/credits-and-operations.md` | Credits model, plan limits |
| §5 Team credit limits | `research/make-help-center-export/pages_markdown/credits-per-team-management.md` | Per-team credit allocation |
| §6 Workspace settings | `research/make-help-center-export/pages_markdown/scenario-settings.md` | Scenario-level settings |
| §7 Members + invites | `research/make-help-center-export/pages_markdown/invitations.md` | Invite flow |
| §8 Org settings | `research/make-help-center-export/pages_markdown/organization-settings.md` | Org-level settings |
| §All API patterns | `research/make-advanced/*/network-log*.json` | Live Make API endpoints (org, team, member, role) |
| §All | `research/n8n-docs-export/pages_markdown/user-management/` | n8n's project role system (3 roles) |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Project entity | `n8n-master/packages/cli/src/databases/entities/Project.ts` |
| Project relations (roles) | `n8n-master/packages/cli/src/databases/entities/ProjectRelation.ts` |
| User entity | `n8n-master/packages/cli/src/databases/entities/User.ts` |
| Global roles | `n8n-master/packages/cli/src/permissions/global.roles.ts` |
| Project roles | `n8n-master/packages/cli/src/permissions/project.roles.ts` |
| Members controller | `n8n-master/packages/cli/src/controllers/project.controller.ts` |

### n8n comparison

| Feature | n8n | FlowHolt | Note |
|---------|-----|----------|------|
| Top-level container | Instance = single org | Organization | FlowHolt is multi-tenant |
| Project | Project (workspace equivalent) | Workspace | n8n has no teams |
| Roles | 3 project roles: Admin/Editor/Viewer | 5 org roles + 5 workspace roles | FlowHolt more granular 🏆 |
| Teams | None | Team layer between org and workspace | FlowHolt-unique 🏆 |
| Credit allocation | No credits model | Team credit limits + org plan quota | FlowHolt-unique 🏆 |
| `chatUser` role | `chatUser` — can send messages but cannot access n8n UI | Similar role needed for Chat Trigger public users | Action: add `chatUser` equivalent |

### Make comparison

| Feature | Make | FlowHolt |
|---------|------|----------|
| Organization | Top-level billing + admin container | Same |
| Teams | Collaboration boundary with team roles | Same |
| Workspace | No workspace layer (flat) | Added: workspace within team |
| 5 org roles | Owner, Admin, Member, Accountant, Guest | Same role names |
| Environments per team | None | Draft/Staging/Production per workspace 🏆 |

### This file feeds into

| File | What it informs |
|------|----------------|
| `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md` | Role definitions and capabilities |
| `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md` | Full role × resource matrix |
| `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` | Role enforcement per UI surface |
| `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` | Settings scope hierarchy (org/team/workspace) |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Team credit limits, org analytics |
| `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md` | Org/team/workspace route authorization |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Org/team/workspace as separate domain modules |
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | §1 Identity and membership entities |

---

```
User
  └── belongs to → Organization(s)
        ├── owns → Teams
        │     ├── owns → Workspaces
        │     │     ├── owns → Workflows
        │     │     ├── owns → Vault Assets
        │     │     ├── owns → Executions
        │     │     ├── owns → AI Agents (managed)
        │     │     └── owns → Workspace Settings
        │     ├── has → Team Members (with team roles)
        │     └── has → Team Settings
        ├── has → Org Members (with org roles)
        ├── owns → Org Settings
        └── owns → Billing / Plan
```

### Key design decisions

1. **Organization is the billing boundary.** All plan limits, quotas, and billing are scoped to the organization.
2. **Team is the collaboration boundary.** All workflows, agents, vault assets, and executions belong to a team through their workspace.
3. **Workspace is the operational boundary.** A workspace is an isolated working container within a team, with its own settings, environments, and deployment policies.
4. **Users have roles at both org and team levels.** Org roles govern administrative actions; team/workspace roles govern operational actions.

### Make comparison

| Concept | Make | FlowHolt |
|---|---|---|
| Top-level container | Organization | Organization |
| Collaboration boundary | Team | Team |
| Working container | Team (flat) | Workspace (within team) |
| Asset ownership | Team owns all assets directly | Workspace owns assets; workspace belongs to team |
| Environments | None | Draft/staging/production per workspace |
| Deployment governance | None | Workspace-level deployment policies |

FlowHolt adds the **workspace** layer that Make lacks. This enables:
- Multiple isolated working environments within a team
- Per-workspace deployment policies and environment separation
- Workspace-level settings that don't affect sibling workspaces

---

## 2. Organization entity

### Backend model

```python
OrganizationPlan = Literal["free", "starter", "pro", "teams", "enterprise"]

class OrganizationSummary(BaseModel):
    id: str
    name: str
    slug: str
    plan: OrganizationPlan
    region: str                         # "us", "eu"
    timezone: str
    owner_user_id: str
    teams_count: int
    members_count: int
    created_at: str

class OrganizationDetail(OrganizationSummary):
    billing_email: str | None = None
    domain_claim: str | None = None     # e.g., "example.com" for SSO
    sso_enabled: bool = False
    max_teams: int                      # plan-determined
    max_members_per_team: int           # plan-determined
    max_workspaces_per_team: int        # plan-determined
    max_operations_per_month: int       # plan-determined
    current_operations_this_month: int
    max_storage_bytes: int
    current_storage_bytes: int
    updated_at: str
```

### Frontend interface

```typescript
type ApiOrganizationPlan = "free" | "starter" | "pro" | "teams" | "enterprise";

interface ApiOrganizationSummary {
  id: string;
  name: string;
  slug: string;
  plan: ApiOrganizationPlan;
  region: string;
  timezone: string;
  owner_user_id: string;
  teams_count: number;
  members_count: number;
  created_at: string;
}

interface ApiOrganizationDetail extends ApiOrganizationSummary {
  billing_email: string | null;
  domain_claim: string | null;
  sso_enabled: boolean;
  max_teams: number;
  max_members_per_team: number;
  max_workspaces_per_team: number;
  max_operations_per_month: number;
  current_operations_this_month: number;
  max_storage_bytes: number;
  current_storage_bytes: number;
  updated_at: string;
}
```

### Organization roles

Derived from Make's 6-role model, adapted for FlowHolt:

| Role | Code | Permissions |
|---|---|---|
| **Owner** | `org_owner` | Full control: billing, plan, SSO, delete org, transfer ownership, manage all teams and members |
| **Admin** | `org_admin` | Organization management: invite/remove members, create/delete teams, install apps, view billing |
| **Member** | `org_member` | View org details; access teams they're assigned to |
| **Billing** | `org_billing` | View org details, view/manage billing and payments |
| **Guest** | `org_guest` | Login only; access specific teams they're invited to with limited scope |

```python
OrganizationRole = Literal["org_owner", "org_admin", "org_member", "org_billing", "org_guest"]
```

### Organization member model

```python
class OrganizationMemberSummary(BaseModel):
    user_id: str
    name: str
    email: str
    avatar_initials: str
    org_role: OrganizationRole
    status: Literal["active", "invited", "suspended"]
    teams: list[str]                    # team IDs this user belongs to
    joined_at: str
```

### CRUD endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| List user's organizations | GET | `/api/organizations` | any authenticated |
| Create organization | POST | `/api/organizations` | any authenticated |
| Get organization details | GET | `/api/organizations/{org_id}` | `org_member` |
| Update organization | PUT | `/api/organizations/{org_id}` | `org_admin` |
| Delete organization | DELETE | `/api/organizations/{org_id}` | `org_owner` |
| Transfer ownership | POST | `/api/organizations/{org_id}/transfer-ownership` | `org_owner` |
| List org members | GET | `/api/organizations/{org_id}/members` | `org_member` |
| Invite org member | POST | `/api/organizations/{org_id}/members/invite` | `org_admin` |
| Update org member role | PATCH | `/api/organizations/{org_id}/members/{user_id}` | `org_admin` |
| Remove org member | DELETE | `/api/organizations/{org_id}/members/{user_id}` | `org_admin` |

---

## 3. Team entity

### Backend model

```python
class TeamSummary(BaseModel):
    id: str
    organization_id: str
    name: str
    slug: str
    members_count: int
    workspaces_count: int
    credit_limit: int | None = None     # null = unlimited (org pool)
    credits_used_this_month: int = 0
    created_at: str

class TeamDetail(TeamSummary):
    description: str | None = None
    notification_settings: TeamNotificationSettings
    updated_at: str

class TeamNotificationSettings(BaseModel):
    notify_on_scenario_error: bool = True
    notify_on_scenario_warning: bool = True
    notify_on_credit_threshold: bool = True
    credit_threshold_percent: int = 80
```

### Frontend interface

```typescript
interface ApiTeamSummary {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  members_count: number;
  workspaces_count: number;
  credit_limit: number | null;
  credits_used_this_month: number;
  created_at: string;
}
```

### Team roles

Derived from Make's 6-role model, adapted with FlowHolt's builder/viewer split:

| Role | Code | Permissions |
|---|---|---|
| **Team Admin** | `team_admin` | Full team access: manage members, manage workspaces, manage all assets, create custom functions |
| **Team Builder** | `team_builder` | Full access to team data: create/edit workflows, agents, vault assets; cannot manage team members or delete team |
| **Team Operator** | `team_operator` | Read access to all team data; can activate/pause workflows, manage schedules, run executions |
| **Team Monitor** | `team_monitor` | Read-only access: view workflows, executions, agents; cannot modify anything |
| **Team Guest** | `team_guest` | Limited access: credential requests, specific invited scope only |

```python
TeamRole = Literal["team_admin", "team_builder", "team_operator", "team_monitor", "team_guest"]
```

### Team member model

```python
class TeamMemberSummary(BaseModel):
    user_id: str
    name: str
    email: str
    avatar_initials: str
    team_role: TeamRole
    status: Literal["active", "invited"]
    joined_at: str
```

### Team role → workspace role mapping

When a user accesses a workspace within a team, their effective workspace role is derived from their team role:

| Team role | Effective workspace role | Rationale |
|---|---|---|
| `team_admin` | `owner` | Full workspace control |
| `team_builder` | `builder` | Create and edit |
| `team_operator` | `builder` (restricted: run/schedule only) | Operate but not design |
| `team_monitor` | `viewer` | Read-only |
| `team_guest` | `viewer` (restricted) | Minimal access |

**Org role override:** If a user has `org_owner` or `org_admin`, they always get `owner` access to any workspace in the org, regardless of team role.

### CRUD endpoints

| Action | Method | Path | Min role |
|---|---|---|---|
| List org teams | GET | `/api/organizations/{org_id}/teams` | `org_member` |
| Create team | POST | `/api/organizations/{org_id}/teams` | `org_admin` |
| Get team details | GET | `/api/teams/{team_id}` | `team_monitor` |
| Update team | PUT | `/api/teams/{team_id}` | `team_admin` |
| Delete team | DELETE | `/api/teams/{team_id}` | `org_admin` |
| List team members | GET | `/api/teams/{team_id}/members` | `team_monitor` |
| Add team member | POST | `/api/teams/{team_id}/members` | `team_admin` |
| Update team member role | PATCH | `/api/teams/{team_id}/members/{user_id}` | `team_admin` |
| Remove team member | DELETE | `/api/teams/{team_id}/members/{user_id}` | `team_admin` |
| List team workspaces | GET | `/api/teams/{team_id}/workspaces` | `team_monitor` |
| Create workspace in team | POST | `/api/teams/{team_id}/workspaces` | `team_admin` |

### Asset ownership

Following Make's model: all assets within a workspace belong to the team through that workspace. A user cannot move assets between teams.

| Asset type | Owned by | Visible to |
|---|---|---|
| Workflow | Workspace (→ team) | All team members with workspace access |
| Vault connection | Workspace (→ team) | All team members with workspace access |
| Vault credential | Workspace (→ team) | Governed by VaultVisibility |
| Vault variable | Workspace (→ team) | All team members with workspace access |
| AI Agent (managed) | Workspace (→ team) | All team members with workspace access |
| Execution | Workspace (→ team) | All team members with workspace access |
| Template | Workspace (→ team) | Optionally shared org-wide |

---

## 4. Workspace entity (evolved)

### Current state

The current `WorkspaceSummary` model:
```python
class WorkspaceSummary(BaseModel):
    id: str
    name: str
    slug: str
    plan: str           # currently flat plan string
    role: WorkspaceRole # currently the user's role
    members_count: int
```

### Evolved model

```python
class WorkspaceSummary(BaseModel):
    id: str
    name: str
    slug: str
    team_id: str                        # NEW — links to team
    organization_id: str                # NEW — links to org
    plan: str                           # inherited from org plan
    role: WorkspaceRole                 # effective role for current user
    members_count: int
    created_at: str
```

The workspace retains its current identity and all existing workspace-scoped data. The key change is adding `team_id` and `organization_id` foreign keys.

### Workspace settings inheritance

Workspace settings can inherit from team or org defaults:

```
Organization defaults
  └── overridden by → Team defaults
        └── overridden by → Workspace settings
```

Each setting in `WorkspaceSettingsResponse` gains an optional `inherited_from` field:

```python
class SettingSource(BaseModel):
    value: Any
    source: Literal["workspace", "team", "organization", "default"]
```

This allows the UI to show "Inherited from organization" or "Overridden at workspace level" indicators.

---

## 5. Session token evolution

### Current session token payload

```python
payload = {
    "sub": user_id,
    "workspace_id": workspace_id,
    "role": role,               # workspace role
    "iat": issued_at,
    "exp": expires_at,
    "iss": "flowholt-backend",
    "aud": "flowholt-app",
}
```

### Evolved session token payload

```python
payload = {
    "sub": user_id,
    "org_id": organization_id,          # NEW
    "team_id": team_id,                 # NEW
    "workspace_id": workspace_id,
    "org_role": org_role,               # NEW
    "team_role": team_role,             # NEW
    "role": effective_workspace_role,   # computed from team role + org role
    "iat": issued_at,
    "exp": expires_at,
    "iss": "flowholt-backend",
    "aud": "flowholt-app",
}
```

### Session response evolution

```python
class SessionResponse(BaseModel):
    user: UserSummary
    organization: OrganizationSummary       # NEW
    team: TeamSummary                       # NEW
    workspace: WorkspaceSummary
```

### Context switching

The frontend must support:
1. **Organization switcher** — switch active org (top-right profile menu)
2. **Team switcher** — switch active team within org (sidebar or top-bar)
3. **Workspace switcher** — switch active workspace within team (sidebar)

Each switch issues a new session token with updated scope.

---

## 6. Capability integration

The capability system from file 34 extends to org and team scopes:

### Organization capabilities

```python
class OrganizationCapabilities(BaseModel):
    view: CapabilityState
    edit: CapabilityState
    manage_billing: CapabilityState
    manage_members: CapabilityState
    create_team: CapabilityState
    delete_team: CapabilityState
    transfer_ownership: CapabilityState
    configure_sso: CapabilityState
    delete_organization: CapabilityState
```

### Team capabilities

```python
class TeamCapabilities(BaseModel):
    view: CapabilityState
    edit: CapabilityState
    manage_members: CapabilityState
    create_workspace: CapabilityState
    delete_workspace: CapabilityState
    view_consumption: CapabilityState
    manage_notifications: CapabilityState
    delete_team: CapabilityState
```

### Computation rules

Organization capabilities are computed from `org_role`:

| Capability | org_owner | org_admin | org_member | org_billing | org_guest |
|---|---|---|---|---|---|
| view | ✓ | ✓ | ✓ | ✓ | ✓ |
| edit | ✓ | ✓ | ✗ | ✗ | ✗ |
| manage_billing | ✓ | ✓ | ✗ | ✓ | ✗ |
| manage_members | ✓ | ✓ | ✗ | ✗ | ✗ |
| create_team | ✓ | ✓ | ✗ | ✗ | ✗ |
| delete_team | ✓ | ✓ | ✗ | ✗ | ✗ |
| transfer_ownership | ✓ | ✗ | ✗ | ✗ | ✗ |
| configure_sso | ✓ | ✓ | ✗ | ✗ | ✗ |
| delete_organization | ✓ | ✗ | ✗ | ✗ | ✗ |

Team capabilities are computed from `team_role`:

| Capability | team_admin | team_builder | team_operator | team_monitor | team_guest |
|---|---|---|---|---|---|
| view | ✓ | ✓ | ✓ | ✓ | ✓ |
| edit | ✓ | ✗ | ✗ | ✗ | ✗ |
| manage_members | ✓ | ✗ | ✗ | ✗ | ✗ |
| create_workspace | ✓ | ✗ | ✗ | ✗ | ✗ |
| delete_workspace | ✓ | ✗ | ✗ | ✗ | ✗ |
| view_consumption | ✓ | ✓ | ✓ | ✓ | ✗ |
| manage_notifications | ✓ | ✗ | ✗ | ✗ | ✗ |
| delete_team | ✗ | ✗ | ✗ | ✗ | ✗ |

(`delete_team` requires `org_admin` — it's an org-level action)

---

## 7. Plan-level quotas

Quotas are enforced at the organization level and can be allocated per team:

```python
class PlanQuotas(BaseModel):
    max_teams: int
    max_members_per_team: int
    max_workspaces_per_team: int
    max_workflows_per_workspace: int
    max_operations_per_month: int       # execution step operations
    max_storage_bytes: int              # total org storage
    max_ai_agent_context_files: int     # per agent
    max_ai_agent_context_bytes: int     # per agent
    max_concurrent_executions: int      # per workspace
    max_execution_timeout_seconds: int
    features: PlanFeatures

class PlanFeatures(BaseModel):
    environments_enabled: bool          # staging/production
    deployment_approval_enabled: bool
    sso_enabled: bool
    audit_log_enabled: bool
    custom_functions_enabled: bool
    mcp_enabled: bool
    data_stores_enabled: bool
    api_access_enabled: bool
```

### Quota enforcement

Quota checks happen at:
1. **Workspace creation** — check `max_workspaces_per_team`
2. **Workflow creation** — check `max_workflows_per_workspace`
3. **Execution start** — check `max_operations_per_month` and `max_concurrent_executions`
4. **Agent context upload** — check `max_ai_agent_context_files` and `max_ai_agent_context_bytes`
5. **Member invite** — check `max_members_per_team`

Quota exceeded returns a `CapabilityDenialResponse` with reason `quota_exceeded`.

---

## 8. Navigation changes

### Sidebar evolution

```
[Org Switcher]                          ← top of sidebar
  [Team Switcher]
    [Workspace Switcher]

Dashboard
├── Overview
├── Chat
├── AI Agents
├── Workflows
├── Templates
├── Executions
├── Runtime                             ← from file 35
├── Vault
├── Environments
├── Webhooks
├── API Playground
├── System Status
├── Audit Log
├── Settings                            ← workspace settings
└── Help

Org                                     ← separate nav section
├── Org Settings
├── Org Users
├── Teams
├── Billing
└── Consumption
```

### URL structure

```
/org/{org_slug}                         → org dashboard
/org/{org_slug}/settings                → org settings
/org/{org_slug}/members                 → org members
/org/{org_slug}/teams                   → team list
/org/{org_slug}/billing                 → billing
/org/{org_slug}/consumption             → consumption analytics

/team/{team_slug}                       → team dashboard
/team/{team_slug}/members               → team members
/team/{team_slug}/workspaces            → workspace list
/team/{team_slug}/settings              → team settings

/dashboard/...                          → workspace-scoped pages (existing)
/studio/...                             → Studio (workspace-scoped, existing)
```

---

## 9. Migration from current model

### Phase 1: Implicit org and team (non-breaking)

Every existing workspace is automatically wrapped:
1. Create a default organization for each existing workspace
2. Create a default team ("My Team") in each organization
3. Link existing workspace to the default team
4. Map existing workspace members to org members + team members
5. Session token still works with just `workspace_id` — backend resolves org/team from workspace

Role mapping for existing users:

| Current workspace role | → Org role | → Team role |
|---|---|---|
| `owner` | `org_owner` | `team_admin` |
| `admin` | `org_admin` | `team_admin` |
| `builder` | `org_member` | `team_builder` |
| `viewer` | `org_member` | `team_monitor` |

### Phase 2: Org/team UI

- Add org settings pages
- Add team management pages
- Add org/team switchers to sidebar
- Session token evolves to include `org_id`, `team_id`, `org_role`, `team_role`
- `require_workspace_role` still works (uses effective workspace role)
- Add `require_org_role` and `require_team_role` helpers

### Phase 3: Multi-workspace and multi-team

- Allow creating additional teams within an org
- Allow creating additional workspaces within a team
- Enable asset sharing across workspaces within the same team
- Enable template sharing across teams within the same org
- Add consumption tracking per team

### Phase 4: Enterprise features

- SSO/SAML integration
- Domain claim (auto-assign users from @example.com to org)
- Custom org-level security policies
- Cross-team analytics
- Advanced quota management (per-team credit limits)

---

## 10. Database schema direction

### New tables

```sql
-- organizations
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free',
    region TEXT NOT NULL DEFAULT 'us',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    owner_user_id TEXT NOT NULL REFERENCES users(id),
    billing_email TEXT,
    domain_claim TEXT,
    sso_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- teams
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    credit_limit INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(organization_id, slug)
);

-- organization_members
CREATE TABLE organization_members (
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'org_member',
    status TEXT NOT NULL DEFAULT 'invited',
    joined_at TEXT NOT NULL,
    PRIMARY KEY (organization_id, user_id)
);

-- team_members
CREATE TABLE team_members (
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'team_builder',
    status TEXT NOT NULL DEFAULT 'active',
    joined_at TEXT NOT NULL,
    PRIMARY KEY (team_id, user_id)
);
```

### Evolved workspaces table

```sql
ALTER TABLE workspaces ADD COLUMN team_id TEXT REFERENCES teams(id);
ALTER TABLE workspaces ADD COLUMN organization_id TEXT REFERENCES organizations(id);
```

---

## 11. `require_workspace_role` compatibility

The existing `require_workspace_role` function continues to work because the session always contains an effective `role` field. The role computation chain is:

```
1. Load org membership → org_role
2. Load team membership → team_role
3. If org_role in (org_owner, org_admin) → effective_workspace_role = "owner"
4. Else map team_role → effective_workspace_role (see table in section 3)
5. Store effective_workspace_role as "role" in session
```

This means:
- **Zero changes** to existing `require_workspace_role` calls
- **Zero changes** to existing capability computations
- New `require_org_role` and `require_team_role` are additive

---

## 12. Planning decisions still open

1. **Workspace-to-team relationship**: Should a workspace belong to exactly one team, or could a workspace be shared across teams? Recommend: exactly one team owns each workspace. Cross-team access is handled by org-admin override.

2. **Team operator vs builder distinction**: Make separates "operator" (can run/schedule but not edit) from "member" (can edit). FlowHolt's `team_operator` maps to a restricted builder. Should the workspace-level `builder` role be split into `editor` and `operator`? Recommend: defer this split; use capability-based restrictions instead (file 34 already supports this through `WorkflowCapabilities.edit` vs `WorkflowCapabilities.run`).

3. **Template sharing scope**: Should templates be workspace-scoped, team-scoped, or org-scoped? Recommend: workspace-scoped by default, with optional promotion to team-scoped or org-scoped sharing.

4. **Agent sharing scope**: Make shares agents at team level. FlowHolt's managed agents could be workspace-scoped (default) or team-scoped (shared). Recommend: workspace-scoped by default, with team-sharing flag.

5. **Invitation flow**: Email-based invitation with 7-day expiry (matching Make) or instant link-based invitation? Recommend: email-based for production, link-based for dev mode.

6. **Single-workspace backward compatibility**: For users who never create an org explicitly, the default org + default team + single workspace should be completely transparent. The user should never see org/team UI unless they choose to expand.

---

## 13. Make control-plane API surface (from editor crawl)

The automated UI crawl intercepted 1302 network requests, revealing Make's live API surface for control-plane entities.

### Organization API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/organizations` | List organizations |
| GET | `/api/v2/organizations/:id` | Organization details |
| GET | `/api/v2/organizations/:id/usage` | Organization usage/consumption |
| GET | `/api/v2/organizations/:id/subscription` | Subscription details |
| GET | `/api/v2/organizations/:id/subscription/customer` | Billing customer info |
| GET | `/api/v2/organizations/:id/user-organization-roles` | Org member roles |
| GET | `/api/v2/organizations/:id/variables` | Org-level variables |

### Team API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/teams` | List teams |
| GET | `/api/v2/teams/:id` | Team details |
| GET | `/api/v2/teams/:id/variables` | Team-level variables |

### User / role API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/users/me` | Current user profile |
| GET | `/api/v2/users/roles` | User's global roles |
| GET | `/api/v2/users/:id/user-organization-roles` | User's org-level roles |
| GET | `/api/v2/users/:id/user-team-roles` | User's team-level roles |
| GET | `/api/v2/users/unread-notifications` | Unread notification count |
| GET | `/api/v2/notifications` | Notification list |
| GET | `/api/v2/users/user-team-notifications/:id` | Team-specific notifications |

### Session context

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/imt/active-organization-team` | Currently active org + team context |

Key insight: Make maintains a **server-side active org/team context** — the server knows which organization and team the user is currently operating in. FlowHolt should adopt this pattern, storing `active_workspace_id` (which implies org + team) in the session.

### Billing API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v2/cashier/products` | Available products/plans |
| GET | `/api/v2/consumptions/reports/:id` | Consumption report |
| GET | `/api/v2/scenarios/consumptions` | Per-scenario credit usage |

### Enum endpoints (centralized lookups)

| Endpoint | Purpose |
|---|---|
| `/api/v2/enums/countries` | Country list |
| `/api/v2/enums/locales` | Locale list |
| `/api/v2/enums/timezones` | Timezone list |
| `/api/v2/enums/imt-zones` | Infrastructure zones |
| `/api/v2/enums/variable-types` | Variable type options |
| `/api/v2/enums/user-email-notifications` | Email notification type options |

Planning implication: FlowHolt should centralize lookup data as `/api/enums/*` endpoints rather than embedding them in application code.

### Org settings navigation (from crawl)

Make's Organization page uses a **three-group navigation** pattern:

| Group | Test ID | Items |
|---|---|---|
| Organization | `navigation-menu-0` | Dashboard, Teams, Users |
| My Plan | `navigation-menu-1` | Subscription (Free pill), Credit usage, Payments |
| Utilities | `navigation-menu-2` | Installed apps, Variables, Scenario properties, Notification options |

Action buttons discovered:
- `btn-change-details` — Edit organization details
- `btn-organization-menu-expand` — Expand org menu
- `btn-change-payment-method` — Change payment method
- `btn-buy-credits` — Purchase credits
- `btn-buy-plan` — Upgrade plan
- `btn-redeem-coupon` — Redeem coupon
- `card-btn-upgrade` — Upgrade CTA card
- `billing-switch` — Monthly/annual toggle
- `btn-create-scenario` — Available even inside org settings

FlowHolt should adopt this navigation structure, replacing "Utilities" with "Workspace Settings" to reflect FlowHolt's workspace layer.

### Feature flags

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/server/features` | Feature flags (called 32 times during crawl) |

Make uses server-side feature flags extensively — fetched on every page navigation. FlowHolt should implement a feature flag system from Phase 1.

### Org/team context switcher (audit gap)

**Make crawl evidence**: The `navigation-picker-trigger` is a persistent UI element in the left navigation rail that displays the currently active organization and team. It contains:
- `navigation-picker-trigger-group-name` — shows "Organization" or "Team" group label
- `navigation-picker-trigger-item-name` — shows the selected org/team name (e.g., "My Organization", "My Team")

When clicked, it opens a picker dropdown allowing users to switch between their organizations and teams. The active context is maintained server-side via `GET /api/v2/imt/active-organization-team`.

**FlowHolt workspace switcher specification**:

FlowHolt should implement a workspace context switcher in the left navigation rail:
- **Position**: top of the navigation rail, above the first-level nav items
- **Display**: shows current workspace name (which implies org + team)
- **Picker UI**: dropdown listing all workspaces the user has access to, grouped by organization → team → workspace
- **State management**: switching workspaces calls `PUT /api/workspaces/active` and updates the session's `active_workspace_id`
- **Single-workspace mode**: when the user has only one workspace (default case), the switcher is hidden or collapsed to a non-interactive label
- **Organization expansion**: when the user has multiple orgs, show org name as a group header above their workspaces

The switcher should be planned for the same Phase as file 36's Phase 1 (organization and team entities), since it depends on the org/team hierarchy existing.
