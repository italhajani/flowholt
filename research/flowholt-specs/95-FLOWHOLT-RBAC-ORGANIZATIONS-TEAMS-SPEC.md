# Spec 95 — FlowHolt RBAC, Organizations & Teams
**Sources:** Make `access-management.md`, `organizations.md`, `teams.md`, `single-sign-on.md`
**Status:** Research Complete — Ready for Implementation
**Priority:** ⭐⭐⭐⭐ High (security, multi-tenancy, enterprise)

---

## 1. Overview

FlowHolt uses a **two-level permission model** matching Make's approach:

1. **Organization role** — org-wide permissions (billing, settings, member management)
2. **Team role** — team-scoped permissions (workflow, connections, data stores within a team)

Both levels are assigned independently — a user can be Team Admin in Team A and Team Member in Team B.

**Key architectural decision:** All platform resources (workflows, connections, webhooks, data stores, keys) belong to a **team**, not to an organization or user. Items cannot be moved between teams.

---

## 2. Organization Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Owner** | Sole account owner (1 per org) | All permissions; can transfer ownership; billing |
| **Admin** | Full management except billing transfer | Members, teams, SSO, settings, apps |
| **Member** | Default role for most users | Work in assigned teams only |
| **Accountant** | Billing/invoice access only | View/pay invoices, no workflow access |
| **App Developer** | App development + on-premise agent | Create/publish team apps |
| **Guest** | Limited cross-team access | Can only access what they're explicitly given |

**Rules:**
- Only one Owner per organization at a time
- Owner can be transferred to another Admin
- Org Owner automatically has Team Admin in all teams
- Admins can manage SSO, on-premise agents, org settings

---

## 3. Team Roles

| Role | Description | Can View | Can Edit | Can Activate/Stop | Can Manage Creds |
|------|-------------|----------|----------|-------------------|-----------------|
| **Team Admin** | Full team control | ✓ | ✓ | ✓ | ✓ |
| **Team Member** | Default role — create/edit workflows | ✓ | ✓ | ✓ | ✓ |
| **Team Monitoring** | Read-only viewer | ✓ | ✗ | ✗ | ✗ |
| **Team Operator** | Can activate/stop workflows only | ✓ | ✗ | ✓ | ✗ |
| **Team RestrictedMember** | Edit workflows but cannot create connections | ✓ | ✓ | ✓ | ✗ |
| **Team Guest** | Credential request only | ✓ | ✗ | ✗ | Request only |

**Plan restrictions:**
- Free/Core: One team per org
- Pro+: Multiple teams
- Enterprise: Unlimited teams + per-team credit limits

---

## 4. Organization Dashboard — UI Spec

### 4.1 Left Sidebar — Org Section
```
[Org Icon] My Organization
  ├── Members
  ├── Teams
  ├── SSO
  ├── On-prem Agents
  ├── Audit Logs
  ├── Settings
  └── Billing
```

### 4.2 Members Tab
- **Table columns:** Name, Email, Org Role, Teams, Last Active, Actions
- **Actions per member:** Change org role, Remove from org, View team memberships
- **Invite flow:** Email input → select org role → optional: select default team(s) → send invite
- **Pending invites section:** Shows email + expiry time + resend/cancel buttons

### 4.3 Teams Tab
- **Team card grid layout:** Team name, member count, scenario count, credits used (Enterprise)
- **Create team button:** Name input → optional description → create
- **Per-team view:** Members list, Resources list (scenarios, connections, webhooks, data stores, keys)
- **Enterprise:** Credit limit field per team (pause execution when exceeded)
- **Items cannot be moved between teams** — enforce this at API level with clear error

### 4.4 Team Members Management (within a team)
- Table: Member, Team Role, Date Added, Actions
- Add member: Search by email/name from org members → assign team role
- Change team role: Inline dropdown
- Remove from team (does not remove from org)

---

## 5. SSO — Enterprise Feature

### 5.1 Protocols Supported
- **OIDC (OAuth 2.0):** Required fields: User Info URL, Client ID, Token URL, Authorize URL, Client Secret, IML Resolve
- **SAML 2.0:** Required fields: SP Certificate, IdP Certificate, IdP Login URL, Login IML Resolve

### 5.2 Supported Identity Providers
- Okta (SAML)
- Microsoft Azure AD (SAML + OIDC)
- Google (SAML)
- Any OIDC-compatible IdP

### 5.3 IML Attribute Mapping
```json
{
  "id": "{{user.name_id}}",
  "email": "{{get(user.attributes.email, 1)}}",
  "name": "{{get(user.attributes.firstName, 1)}} {{get(user.attributes.last, 1)}}"
}
```

### 5.4 SSO Behavior
- **Namespace:** Org-specific slug (lowercase, dashes only) — users enter this on SSO login screen
- **Auto-provisioning:** New SSO users → automatically added to configured default team(s)
- **Email conflict:** If existing user with same email exists → must delete and re-login via SSO
- **Warning:** Saving SSO config immediately logs you out and enables SSO — provide escape link email
- **Domain claim:** Prevent non-SSO signups from claimed email domain (e.g., claim `@company.com`)
- **Disable SSO:** One-time backup link sent to owner email when SSO is enabled

### 5.5 SAML Certificate Rotation
- SP provides certificates; at least one must be active
- Certificate rotation: Add new cert → activate → old cert deactivated
- FlowHolt generates SP certificates; user pastes IdP certificate

### 5.6 SSO Database Schema
```sql
CREATE TABLE org_sso_config (
  org_id          UUID PRIMARY KEY REFERENCES organizations(id),
  sso_type        TEXT NOT NULL CHECK (sso_type IN ('oidc', 'saml')),
  namespace       TEXT UNIQUE NOT NULL,  -- lowercase, dashes only
  enabled         BOOLEAN DEFAULT FALSE,
  config          JSONB NOT NULL,        -- protocol-specific fields
  default_team_ids UUID[],              -- auto-provision new users here
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE org_sso_certificates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID REFERENCES organizations(id),
  cert_type  TEXT NOT NULL CHECK (cert_type IN ('sp', 'idp')),
  pem_data   TEXT NOT NULL,
  active     BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Multi-Tenancy Architecture

### 6.1 Data Model
```sql
-- Organizations (top level)
CREATE TABLE organizations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  plan         TEXT NOT NULL DEFAULT 'free',
  data_center  TEXT NOT NULL CHECK (data_center IN ('us', 'eu')),  -- IMMUTABLE after creation
  owner_id     UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Teams (belong to org)
CREATE TABLE teams (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID REFERENCES organizations(id),
  name         TEXT NOT NULL,
  description  TEXT,
  credit_limit INTEGER,  -- Enterprise: null = unlimited
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Org membership
CREATE TABLE org_members (
  org_id     UUID REFERENCES organizations(id),
  user_id    UUID REFERENCES users(id),
  role       TEXT NOT NULL CHECK (role IN ('owner','admin','member','accountant','app_developer','guest')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Team membership
CREATE TABLE team_members (
  team_id    UUID REFERENCES teams(id),
  user_id    UUID REFERENCES users(id),
  role       TEXT NOT NULL CHECK (role IN ('admin','member','monitoring','operator','restricted_member','guest')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
```

### 6.2 Resource Isolation
- **All resources have team_id**: workflows, connections, webhooks, data_stores, keys, on_prem_agents
- **Row-level security policy** (Supabase RLS):
  - Team members can see/modify team's resources (role permitting)
  - Org Admins/Owner can see all teams' resources
- **Credit tracking**: Per-team credit consumption tracked; Enterprise plan respects per-team limits

### 6.3 Data Center
- Selected at org creation: `us` or `eu`
- **Cannot be changed after creation** — enforce this constraint at API level
- Affects data residency for executions, data stores, audit logs

---

## 7. Audit Logs

**Who can access:** Org Owner + Admin only

**Events logged:**
- Member added/removed/role changed
- Team created/deleted
- Workflow activated/deactivated/deleted
- Credential created/deleted
- SSO enabled/disabled
- Login events (SSO + standard)
- Blueprint exported/imported
- On-prem agent created/deleted
- API key created/revoked

**Retention:**
- Standard plans: 30 days
- Enterprise: 90 days (configurable)

**UI:**
- Table: Timestamp, Actor, Action, Resource, IP Address, Details
- Filters: Date range, actor, action type, resource type
- Export: CSV

**Database Schema:**
```sql
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID REFERENCES organizations(id),
  team_id      UUID REFERENCES teams(id),
  actor_id     UUID REFERENCES users(id),
  actor_name   TEXT NOT NULL,  -- denormalized for logs
  action       TEXT NOT NULL,  -- e.g., 'workflow.activated', 'member.removed'
  resource_id  TEXT,
  resource_type TEXT,
  resource_name TEXT,
  details      JSONB,
  ip_address   INET,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX audit_logs_org_created ON audit_logs(org_id, created_at DESC);
```

---

## 8. Invitation System

### 8.1 Invite Flow
1. Admin enters email + selects org role
2. System sends invite email with unique token (expires 7 days)
3. User clicks link → if no account: signup form → if existing account: login → auto-join org + team(s)
4. Invite marked as accepted

### 8.2 Credential Requests (Team Guest role)
- Team Guest members can **request credentials** from Team Admins
- Use case: External contractors need to connect their own accounts
- Flow: Guest requests → Admin receives notification → Admin approves/denies → connection created under requester's name
- Approval grants temporary or permanent credential access

---

## 9. FlowHolt Decision Summary

| Decision | Chosen Approach | Reason |
|----------|-----------------|--------|
| Org roles | 6 roles (Owner, Admin, Member, Accountant, AppDev, Guest) | Match Make — proven hierarchy |
| Team roles | 6 roles including RestrictedMember | Granular credential control |
| Resource isolation | All resources belong to team | Prevents cross-team data leaks |
| Multi-team access | Pro+ plans | Match Make plan tiers |
| SSO | OIDC + SAML 2.0, Enterprise only | Industry standard; not needed for SMB |
| Data center | US or EU at org creation, immutable | GDPR compliance |
| Credit limits | Per-team (Enterprise) | Prevent runaway costs |
| Domain claim | Enterprise + paid plans | Enforce SSO for all org emails |
