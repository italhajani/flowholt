# SPEC-84: FlowHolt User Management, RBAC & SSO Deep Spec
## Source: n8n Documentation Deep Research — User Management Complete Reference

**Created:** Sprint 88 Research Session
**Status:** Research Complete — Ready for Implementation Reference
**Scope:** User management, RBAC roles, custom roles, SAML, OIDC, invitations, projects

---

## 1. User Role Architecture

### 1.1 Two-Level Role System

**Level 1: Instance Roles** (global, affects all platform access)
```
Owner      → Created the instance, has all permissions including billing
Admin      → Can manage all users, credentials, workflows, settings
Member     → Regular user, access controlled by project roles
```

**Level 2: Project Roles** (scoped to a specific project)
```
Admin   → Full control over project (manage members, delete project)
Editor  → Create/edit/delete workflows and credentials in project
Viewer  → Read-only access to workflows in project
```

**Custom Roles** (Enterprise only):
- Granular permissions at the scope level
- See section 5 for complete scope list

### 1.2 How Roles Interact
```
Instance Owner = instance Admin + can change billing
Instance Admin = override all project roles (can manage everything)
Instance Member = their permissions come from project roles

In project X:
  Project Admin   = full control of project X
  Project Editor  = can edit workflows in project X
  Project Viewer  = can only view (not run) workflows in project X
```

### 1.3 Personal vs Shared Projects
- **Personal project**: Every user has one. Only they can access it. Cannot be shared on lower plans.
- **Team project**: Created explicitly. Members added with roles. (Pro/Enterprise)

---

## 2. Complete Permission Matrix

### 2.1 Instance-Level Permissions

| Permission | Owner | Admin | Member |
|------------|-------|-------|--------|
| Manage instance settings | ✅ | ✅ | ❌ |
| Manage users (invite/remove) | ✅ | ✅ | ❌ |
| View all workflows | ✅ | ✅ | ❌ |
| Manage all credentials | ✅ | ✅ | ❌ |
| Manage source control | ✅ | ✅ | ❌ |
| Manage secrets vault | ✅ | ✅ | ❌ |
| Manage tags | ✅ | ✅ | ❌ |
| View execution data | ✅ | ✅ | ❌ |
| Change billing | ✅ | ❌ | ❌ |
| Delete instance | ✅ | ❌ | ❌ |

### 2.2 Project-Level Permissions

| Permission | Project Admin | Project Editor | Project Viewer |
|------------|--------------|----------------|----------------|
| View workflows in project | ✅ | ✅ | ✅ |
| Execute workflows | ✅ | ✅ | ✅ |
| Create workflows | ✅ | ✅ | ❌ |
| Edit workflows | ✅ | ✅ | ❌ |
| Delete workflows | ✅ | ❌ | ❌ |
| Publish/activate workflows | ✅ | ✅ | ❌ |
| View credentials | ✅ | ✅ | ❌ |
| Create/edit credentials | ✅ | ✅ | ❌ |
| Delete credentials | ✅ | ❌ | ❌ |
| Manage project members | ✅ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ |
| Create folders | ✅ | ✅ | ❌ |

---

## 3. User Invitation System

### 3.1 Invitation Flow
1. Admin goes to Settings → Users → "Invite user"
2. Enters email + selects instance role (Admin or Member)
3. System sends invitation email with one-time link
4. User clicks link → lands on invitation acceptance page
5. If already has FlowHolt account: logs in and joins
6. If new: fills in name + password → account created

### 3.2 Invitation Acceptance Page
URL: `/invitations/accept?token=<uuid>&inviterId=<userId>`

**UI Elements:**
- FlowHolt logo + welcome message
- If email matches existing account: "Accept invitation" button (logs in)
- If new user: registration form (first name, last name, password, confirm password)
- Terms of service checkbox

### 3.3 Invitation State Machine
```
PENDING    → Invitation sent, user hasn't accepted
ACCEPTED   → User clicked link and joined
EXPIRED    → Invitation link expired (default: 48 hours)
REVOKED    → Admin cancelled the invitation
```

### 3.4 Invitation Management (Admin View)
In Settings → Users:
- List of all users (active + pending invitations)
- Pending invitations shown with "Pending" badge
- "Resend invitation" for pending invites
- "Revoke invitation" for pending invites
- Change user role for active users
- Deactivate user (keeps data, blocks login)
- Delete user (removes account, reassigns owned workflows)

---

## 4. SAML Single Sign-On (Enterprise)

### 4.1 SAML Setup Flow
1. Settings → Single Sign-On → SAML → Enable SAML
2. Download the FlowHolt Service Provider (SP) metadata XML
3. Upload SP metadata to Identity Provider (Okta, Azure AD, etc.)
4. Copy IdP metadata URL from your identity provider
5. Paste IdP metadata URL into FlowHolt SAML config
6. Configure attribute mappings (see 4.2)
7. Test the connection
8. Optionally: enforce SSO for all users

### 4.2 Required SAML Attribute Mappings

| FlowHolt Field | SAML Attribute | Notes |
|----------------|---------------|-------|
| `email` | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email` | Required |
| `firstName` | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname` | Required |
| `lastName` | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname` | Required |
| `instance_role` | `n8n_instance_role` | Optional — auto-provision role |
| `projects` | `n8n_projects` | Optional — auto-provision project membership |

### 4.3 Role Provisioning via SAML

**Instance role provisioning:**
```xml
<!-- In IdP attribute mapping: -->
<Attribute Name="n8n_instance_role">
  <AttributeValue>admin</AttributeValue>
  <!-- or "member" -->
</Attribute>
```

**Project membership provisioning:**
```xml
<Attribute Name="n8n_projects">
  <!-- Format: projectId:role (comma-separated for multiple projects) -->
  <AttributeValue>abc123:admin,def456:editor,ghi789:viewer</AttributeValue>
</Attribute>
```

### 4.4 JIT (Just-in-Time) Provisioning
With SAML JIT enabled:
- New users are automatically created when they first log in via SSO
- User data populated from SAML attributes
- Role auto-assigned from `n8n_instance_role` attribute
- Project membership auto-assigned from `n8n_projects` attribute

### 4.5 Enforce SSO
When "Enforce SAML SSO" is enabled:
- Password-based login is disabled for all users
- All users MUST log in via SAML identity provider
- Exception: the instance Owner can still use password (emergency access)
- Existing user passwords are not deleted (re-enabled if SSO turned off)

---

## 5. OIDC Single Sign-On (Enterprise)

### 5.1 OIDC Setup Flow
1. Settings → Single Sign-On → OIDC → Enable OIDC
2. Create OAuth2 app in identity provider (Okta, Auth0, etc.)
3. Copy **Client ID** and **Client Secret** from IdP
4. Enter IdP **Discovery URL** (OpenID Connect metadata endpoint)
5. Add FlowHolt redirect URI to IdP allowed list
6. Configure claim mappings
7. Test connection

### 5.2 Discovery URL Patterns (Common Providers)

| Provider | Discovery URL Pattern |
|----------|----------------------|
| Okta | `https://<domain>.okta.com/oauth2/default/.well-known/openid-configuration` |
| Auth0 | `https://<domain>.auth0.com/.well-known/openid-configuration` |
| Azure AD | `https://login.microsoftonline.com/<tenant-id>/v2.0/.well-known/openid-configuration` |
| Google | `https://accounts.google.com/.well-known/openid-configuration` |
| Keycloak | `https://<domain>/realms/<realm>/.well-known/openid-configuration` |

### 5.3 OIDC Scopes Required
```
openid profile email
```
Optional for role provisioning:
```
groups roles
```

### 5.4 OIDC Claim Mappings
| FlowHolt Field | Default OIDC Claim |
|----------------|-------------------|
| `email` | `email` |
| `firstName` | `given_name` |
| `lastName` | `family_name` |
| Instance role | `n8n_instance_role` (custom claim) |
| Projects | `n8n_projects` (custom claim) |

---

## 6. Custom Roles (Enterprise)

### 6.1 Custom Role Architecture
Custom roles allow granular permission assignment at the scope level. Each scope is a `resource:action` pair.

### 6.2 Complete Permission Scope List

**Workflow Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `workflow:create` | Create new workflows |
| `workflow:read` | View workflow config |
| `workflow:update` | Edit workflow config |
| `workflow:delete` | Delete workflows |
| `workflow:activate` | Activate (publish) workflows |
| `workflow:deactivate` | Deactivate (unpublish) workflows |
| `workflow:list` | List workflows in project |
| `workflow:execute` | Manually execute workflows |
| `workflow:moveToFolder` | Move workflow to folder |
| `workflow:share` | Share workflow with other users |
| `workflow:updateRedactionSetting` | Change execution data redaction |

**Execution Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `execution:list` | View execution history list |
| `execution:read` | View execution details and data |
| `execution:delete` | Delete execution records |
| `execution:stop` | Stop running executions |

**Credential Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `credential:create` | Create new credentials |
| `credential:read` | View credential metadata (not secret values) |
| `credential:update` | Edit credentials |
| `credential:delete` | Delete credentials |
| `credential:list` | List credentials |
| `credential:share` | Share credentials with other users |
| `credential:overwrite` | Allow overwriting existing credential |

**Project Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `project:create` | Create new projects |
| `project:read` | View project details |
| `project:update` | Edit project settings |
| `project:delete` | Delete project |

**Folder Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `folder:create` | Create folders |
| `folder:read` | View folders |
| `folder:update` | Rename/move folders |
| `folder:delete` | Delete folders |
| `folder:list` | List folder contents |
| `folder:moveContent` | Move workflows between folders |

**Data Table Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `dataTable:create` | Create data tables |
| `dataTable:read` | Query data table rows |
| `dataTable:update` | Update rows in data table |
| `dataTable:delete` | Delete data table rows |
| `dataTable:list` | List data tables |
| `dataTable:truncate` | Clear all data table rows |
| `dataTable:deleteTable` | Delete the entire data table |

**Project Variable Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `projectVariable:create` | Create project variables |
| `projectVariable:read` | Read project variable values |
| `projectVariable:update` | Update project variables |
| `projectVariable:delete` | Delete project variables |
| `projectVariable:list` | List project variables |

**Secrets Vault Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `secretsVault:create` | Configure new secrets vault |
| `secretsVault:read` | View vault configuration |
| `secretsVault:update` | Update vault settings |
| `secretsVault:delete` | Remove vault connection |
| `secretsVault:list` | List connected vaults |
| `secretsVault:provision` | Provision secrets from vault |

**Source Control Scopes:**
| Scope | Action Permitted |
|-------|-----------------|
| `sourceControl:pull` | Pull latest from git repository |

### 6.3 Custom Role Management UI
In Settings → Roles (Enterprise):
- List of custom roles with permission summary
- "Create custom role" button
- Role editor: checkbox matrix per scope group
- Assign custom roles to users or projects

---

## 7. Two-Factor Authentication (2FA)

### 7.1 2FA Support
- TOTP-based 2FA (Google Authenticator, Authy, etc.)
- Users enable from: Settings → Security → Two-Factor Authentication

### 7.2 2FA Enrollment Flow
1. User clicks "Enable 2FA"
2. Show QR code + manual entry key
3. User scans with authenticator app
4. Enter verification code to confirm enrollment
5. Show backup codes (user must save these)
6. 2FA active

### 7.3 Admin Controls
- Admins can see which users have 2FA enabled
- Admins can revoke 2FA for a user (emergency recovery)
- Can enforce 2FA for all users via Settings → Security

---

## 8. User Profile and Settings

### 8.1 User Profile Page
Accessible from: user avatar → "Personal Settings"

**Profile fields:**
- First name, Last name
- Email address (change requires re-verification)
- Password change (old + new + confirm)
- Profile photo / avatar upload

### 8.2 Preferences
- **Theme**: Light / Dark / System
- **Language**: UI language (available translations)
- **Date format**: Regional format preferences
- **Notification settings**: Email notifications preferences

### 8.3 API Keys (Personal Access Tokens)
- Generate API keys for personal use (not tied to instance)
- Labeled with creation date and description
- One-time display of full key on creation
- Can be revoked individually

---

## 9. Projects System (Pro/Enterprise)

### 9.1 Project Structure
```
FlowHolt Instance
├── Personal Project (every user, private)
│   └── My workflows...
├── Team Project "Marketing" 
│   ├── Members: Alice (Admin), Bob (Editor), Carol (Viewer)
│   ├── Workflows...
│   └── Credentials...
└── Team Project "DevOps"
    ├── Members: Dave (Admin), Eve (Editor)
    └── Workflows...
```

### 9.2 Creating and Managing Projects
- "New Project" button in left sidebar
- Project settings: name, description, icon/color
- Members tab: invite users with roles
- Credentials tab: project-scoped credentials

### 9.3 Project Switching
- Left sidebar shows all projects user has access to
- Click project → see its workflows, credentials, executions
- Personal project always at top

### 9.4 Cross-Project Actions
- Workflows cannot move between projects (copy only)
- Credentials can be shared across projects explicitly
- Executions are scoped to the project where workflow lives

---

## 10. FlowHolt Implementation Status

### User Management:
- [x] User registration / login
- [x] JWT-based auth
- [x] Admin user CRUD
- [ ] Invitation flow (email + token + acceptance page)
- [ ] Pending invitation management
- [ ] User deactivation (block login, keep data)
- [ ] Instance role assignment (admin/member)
- [ ] 2FA (TOTP-based)

### RBAC:
- [ ] Instance role enforcement middleware
- [ ] Project role model in DB
- [ ] Project-level permission checks
- [ ] Custom roles (Enterprise tier)
- [ ] Full scope permission matrix enforcement
- [ ] `workflow:updateRedactionSetting` scope

### SSO:
- [ ] SAML 2.0 integration
- [ ] OIDC integration
- [ ] JIT provisioning from SAML/OIDC
- [ ] Role provisioning via `n8n_instance_role` + `n8n_projects` claims
- [ ] Enforce SSO option

### Projects:
- [x] Personal project (implicit, single)
- [ ] Team projects (create/manage)
- [ ] Project member management
- [ ] Project-scoped credentials
- [ ] Project switching in UI

### User Profile:
- [x] Profile page (name, email)
- [x] Password change
- [ ] Profile photo upload
- [x] Theme preference
- [x] API key generation
