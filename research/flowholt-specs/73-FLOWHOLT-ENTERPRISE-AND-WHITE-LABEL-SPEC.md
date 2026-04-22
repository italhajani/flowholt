# 73 · FlowHolt: Enterprise & White-Label Spec

> **Purpose**: Complete specification for FlowHolt's enterprise features and white-label customization — Admin interface, SSO, 2FA enforcement, branding, audit logs, maintenance mode, and third-party integrations.
> **Audience**: Junior AI model implementing enterprise features. All concepts explained.
> **Sources**: `research/competitor-data/make-docs/white-label-documentation/` (139 files), Make enterprise docs, spec 36 (org/team), spec 38 (settings catalog).

---

## Cross-Reference Map

| Section | Source |
|---------|--------|
| §1 Overview | Make white-label overview |
| §2 Admin interface | `customize-your-instance.md` |
| §3 Branding | `customize-your-instance.md` §rebranding |
| §4 SSO & 2FA | `customize-your-instance.md` §access |
| §5 Feature flags | White-label feature flags docs |
| §6 Maintenance mode | White-label access control |
| §7 Third-party integrations | `customize-your-instance.md` §integrations |
| §8 Audit logs | `api-reference/audit-logs.md` |
| §9 License management | `api-reference/organizations.md` §license |
| §10 FlowHolt design decisions | Adaptation decisions |
| §11 UI surfaces | Admin panel wireframes |

---

## 1. Overview

**White-label** means an enterprise customer can rebrand FlowHolt as their own product. They deploy FlowHolt, configure their logo/colors/domain, and give access to their users — who see a fully branded "Acme Automation Platform" instead of "FlowHolt".

**Enterprise** means large organizations need:
- Single Sign-On (SSO) — employees log in with their company identity
- Two-factor authentication enforcement
- Centralized user management
- Audit logs for compliance
- Fine-grained feature flags
- License quotas

**Make calls this "White Label"**. FlowHolt calls it **"Enterprise"** in Phase 1, with optional full white-label mode in Phase 2.

---

## 2. Admin Interface

### 2.1 Access

The Admin interface is accessible to users with `role: "admin"` or `role: "owner"` at the organization level.

**Entry point**: Left sidebar → "Admin" section (only visible to org admins)

Or: `Settings → Organization → Administration`

### 2.2 Admin Panel Structure

```
Admin
├── System Settings
│   ├── Branding
│   ├── Language & Locale
│   └── Help & Support Links
├── Access & Security
│   ├── Two-Factor Authentication
│   ├── SSO Configuration
│   ├── Feature Flags
│   └── Maintenance Mode
├── Users & Teams
│   ├── All Users
│   ├── Teams
│   ├── Pending Invitations
│   └── Roles & Permissions
├── Audit Logs
├── License & Usage
│   ├── Current Plan
│   ├── Usage Metrics
│   └── API Rate Limits
└── Integrations
    ├── Analytics (Google Analytics, Rudderstack)
    ├── Error Tracking (TrackJS)
    ├── Product Tours (Userflow, Candu)
    └── Domain Verification
```

---

## 3. Branding (White-Label)

### 3.1 Customizable Brand Elements

| Element | Where used | Format | Notes |
|---------|-----------|--------|-------|
| Instance name | Browser tab, emails, error pages | String (max 50 chars) | Default: "FlowHolt" |
| Logo (light mode) | App header, login page | SVG or PNG, max 400×80px | Used on white backgrounds |
| Logo (dark mode) | Dark header variant | SVG or PNG, max 400×80px | Optional (falls back to light) |
| Favicon | Browser tab | ICO or PNG, 32×32px | |
| Primary color | Buttons, links, highlights | Hex color | Default: emerald #10b981 |
| Login page background | Login/signup pages | Image URL or gradient | |
| App name (short) | Mobile homescreen | String (max 12 chars) | |

### 3.2 Help & Support Links

Replace FlowHolt's built-in help links with custom URLs:

| Setting | Default | Description |
|---------|---------|-------------|
| Documentation URL | flowholt.com/docs | Link in Help menu |
| Support URL | flowholt.com/support | Link in error states |
| Community URL | community.flowholt.com | Link in Help menu |
| Changelog URL | flowholt.com/changelog | "What's new" link |
| Status page URL | status.flowholt.com | Linked from "Status" in footer |

### 3.3 Language Settings

| Setting | Options |
|---------|---------|
| Default language | en, de, fr, es, pt, ja, zh (more in Phase 2) |
| Force language | If set, users cannot change their language |
| Date format | ISO / US (MM/DD/YYYY) / EU (DD/MM/YYYY) |
| Time format | 12h / 24h |
| Timezone | Force specific timezone or user-controlled |

### 3.4 UI — Branding Settings Page

```
┌─ Branding ──────────────────────────────────────────┐
│                                                     │
│ Instance Name                                       │
│ [FlowHolt_______________________]                  │
│                                                     │
│ Primary Logo                          Preview       │
│ [Upload logo (SVG/PNG)]               ┌──────────┐  │
│ Max 400×80px                          │ [LOGO]   │  │
│ [Remove]                              └──────────┘  │
│                                                     │
│ Dark Mode Logo (optional)                           │
│ [Upload logo]                                       │
│                                                     │
│ Favicon                                             │
│ [Upload favicon (ICO/PNG 32×32)]      [🌐] Tab     │
│                                                     │
│ Brand Color                                         │
│ [#10b981] [████] ← color swatch                    │
│                                                     │
│ [Save Branding]                                     │
└─────────────────────────────────────────────────────┘
```

---

## 4. SSO & Two-Factor Authentication

### 4.1 SSO (Single Sign-On)

FlowHolt supports SAML 2.0 and OIDC (OpenID Connect) for enterprise SSO.

**SAML 2.0 setup**:
```
FlowHolt acts as: Service Provider (SP)
Customer IdP: Okta / Azure AD / Google Workspace / custom SAML IdP

SP Metadata URL: https://flowholt.com/auth/saml/metadata
SP ACS URL: https://flowholt.com/auth/saml/callback
Entity ID: https://flowholt.com/auth/saml
```

**OIDC setup**:
```
Discovery URL: customer's IdP discovery endpoint
Client ID: [from IdP]
Client Secret: [from IdP]
Redirect URI: https://flowholt.com/auth/oidc/callback
```

**SSO Config UI**:
```
┌─ SSO Configuration ─────────────────────────────────┐
│ Status: ○ Disabled  ● SAML 2.0  ○ OIDC             │
│                                                     │
│ SAML 2.0 Settings:                                  │
│ IdP Metadata URL: [https://idp.company.com/metadata] │
│ OR Upload IdP XML: [Choose file]                    │
│                                                     │
│ Attribute Mapping:                                  │
│   Email attribute: [email________________]          │
│   First name: [firstName_____________]              │
│   Last name: [lastName_______________]              │
│   Role attribute: [role______________] (optional)  │
│                                                     │
│ SP Information (read-only):                         │
│   ACS URL: https://flowholt.com/auth/saml/callback  │
│   Entity ID: https://flowholt.com/auth/saml         │
│   [Download SP Metadata XML]                        │
│                                                     │
│ Behavior:                                           │
│   ☐ Force SSO (disable password login)             │
│   ☐ Auto-provision new users                       │
│   ☐ Sync roles from IdP attribute                  │
│   Default role for new SSO users: [Member ▼]       │
│                                                     │
│ [Test SSO]  [Save]                                  │
└─────────────────────────────────────────────────────┘
```

### 4.2 Two-Factor Authentication (2FA)

| Setting | Description |
|---------|-------------|
| Require 2FA for all users | Organization-wide enforcement |
| Require 2FA for admins only | Only admin/owner roles must set up 2FA |
| Grace period | Days before 2FA becomes mandatory after joining |
| Allowed 2FA methods | TOTP (Authenticator app) / SMS / Email OTP |

**Enforcement behavior**:
- If 2FA required and user hasn't set it up → redirect to 2FA setup page after login.
- User cannot access any page until 2FA is enrolled.
- Admins can temporarily bypass for a specific user (audit logged).

**2FA enforcement UI**:
```
┌─ Two-Factor Authentication ─────────────────────────┐
│                                                     │
│ ○ Not required (users choose)                       │
│ ● Required for all users                            │
│ ○ Required for admin roles only                     │
│                                                     │
│ Grace period: [7] days after joining               │
│                                                     │
│ Allowed methods:                                    │
│   ☑ Authenticator app (TOTP)                       │
│   ☑ Email OTP                                      │
│   ☐ SMS OTP (requires Twilio integration)          │
│                                                     │
│ [Save]                                              │
└─────────────────────────────────────────────────────┘
```

---

## 5. Feature Flags

Feature flags let admins enable/disable specific platform features org-wide.

### 5.1 Available Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `community_nodes` | on | Users can install community nodes |
| `custom_node_builder` | on | Users can build custom nodes |
| `ai_copilot` | on | AI copilot in Studio |
| `mcp_server` | on | MCP server endpoints |
| `public_workflows` | on | Workflows can be exposed as public HTTP |
| `data_stores` | on | Data Stores feature |
| `source_control` | off | Git-based source control (Phase 2) |
| `white_label_branding` | off | Custom branding (enterprise plan only) |
| `sso` | off | SSO login (enterprise plan only) |
| `audit_logs` | off | Detailed audit log (enterprise plan only) |

### 5.2 Feature Flag UI

```
┌─ Features ──────────────────────────────────────────┐
│                                                     │
│ Core Features                                       │
│ ⣿⣿ AI Copilot           [Enabled ●]   [Disable]   │
│ ⣿⣿ Custom Nodes         [Enabled ●]   [Disable]   │
│ ⣿⣿ Data Stores          [Enabled ●]   [Disable]   │
│ ⣿⣿ MCP Server           [Enabled ●]   [Disable]   │
│                                                     │
│ Advanced (requires upgrade)                         │
│ 🔒 SSO                  [Upgrade →]                │
│ 🔒 Audit Logs           [Upgrade →]                │
│ 🔒 White Label          [Upgrade →]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 6. Maintenance Mode

When maintenance mode is active:
- All non-admin users see a maintenance page instead of the app.
- Admins can still access the platform to complete work.
- Running workflows complete (or timeout) but no new executions start.
- Login page shows maintenance message.

**Maintenance Mode UI**:
```
┌─ Maintenance Mode ──────────────────────────────────┐
│                                                     │
│ Status: ○ Normal  ● Maintenance                    │
│                                                     │
│ Maintenance message (shown to users):               │
│ [We're performing scheduled maintenance.            │
│  Back soon! — The FlowHolt Team        ]           │
│                                                     │
│ Expected end time: [2024-01-15 18:00] (optional)   │
│ Timezone: [UTC ▼]                                  │
│                                                     │
│ ⚠ Enabling maintenance mode will block all         │
│ non-admin users immediately.                        │
│                                                     │
│ [Cancel]  [Enable Maintenance Mode]                 │
└─────────────────────────────────────────────────────┘
```

---

## 7. Third-Party Analytics & Integrations

Enterprise admins can connect third-party services to enhance the platform.

### 7.1 Error Tracking (TrackJS / Sentry)

```
┌─ Error Tracking ────────────────────────────────────┐
│ Provider: [Sentry ▼]  / [TrackJS]                  │
│ DSN/Token: [https://...@sentry.io/...]             │
│ Environment: [production]                           │
│ [Test]  [Save]                                      │
└─────────────────────────────────────────────────────┘
```

### 7.2 Analytics (Google Analytics / Rudderstack)

```
┌─ Analytics ─────────────────────────────────────────┐
│ Google Analytics 4                                  │
│   Measurement ID: [G-XXXXXXXXXX]                   │
│   ☐ Track page views  ☐ Track events               │
│                                                     │
│ Rudderstack                                         │
│   Write Key: [____________________________]         │
│   Data Plane URL: [https://...]                     │
└─────────────────────────────────────────────────────┘
```

### 7.3 Product Tours (Userflow / Candu)

```
┌─ Product Tours ─────────────────────────────────────┐
│ Provider: [None ▼] / [Userflow] / [Candu]           │
│ Token: [____________________________]               │
│ ☐ Enable onboarding tours for new users            │
└─────────────────────────────────────────────────────┘
```

### 7.4 Domain Verification

For custom domains (white-label):
```
┌─ Domain Verification ───────────────────────────────┐
│ Custom Domain: [automation.yourcompany.com]         │
│                                                     │
│ DNS Record (add to your DNS):                       │
│ Type: CNAME                                         │
│ Name: automation.yourcompany.com                    │
│ Value: custom.flowholt.com                          │
│                                                     │
│ Status: ⏳ Pending verification                     │
│ [Verify Now]                                        │
└─────────────────────────────────────────────────────┘
```

---

## 8. Audit Logs

Comprehensive event trail for compliance (SOC 2, GDPR, HIPAA requirements).

### 8.1 Logged Events

| Category | Events |
|----------|--------|
| Auth | `user.login`, `user.logout`, `user.login_failed`, `user.2fa_enrolled`, `user.password_changed` |
| Workflows | `workflow.created`, `workflow.updated`, `workflow.deleted`, `workflow.activated`, `workflow.deactivated`, `workflow.executed` |
| Users | `user.invited`, `user.joined`, `user.role_changed`, `user.removed` |
| Credentials | `credential.created`, `credential.updated`, `credential.deleted`, `credential.used` |
| Data Stores | `datastore.created`, `datastore.cleared`, `datastore.deleted` |
| Admin | `admin.sso_configured`, `admin.2fa_enforced`, `admin.maintenance_enabled`, `admin.feature_flag_changed` |
| MCP | `mcp.token_created`, `mcp.token_revoked`, `mcp.tool_called` |
| API | `api_token.created`, `api_token.revoked` |

### 8.2 Audit Log Entry Format

```json
{
  "id": "uuid",
  "event": "workflow.executed",
  "triggered_at": "2024-01-15T14:30:00Z",
  "user_id": "uuid",
  "user_email": "user@company.com",
  "org_id": "uuid",
  "team_id": "uuid",
  "resource_type": "workflow",
  "resource_id": "uuid",
  "resource_name": "Send Weekly Report",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "execution_id": "uuid",
    "status": "success",
    "duration_ms": 1234
  }
}
```

### 8.3 Audit Log UI

```
┌─ Audit Logs ──────────────────────────────────────────────────────┐
│ [Export CSV]  Date: [Last 7 days ▼]  User: [All ▼]  [Search...] │
│                                                                   │
│ Time                 User              Event               Status │
│ ─────────────────────────────────────────────────────────────────│
│ 2024-01-15 14:30:42  john@co.com       workflow.executed   ✓     │
│ 2024-01-15 14:28:10  admin@co.com      user.role_changed   ✓     │
│ 2024-01-15 14:15:33  jane@co.com       credential.created  ✓     │
│ 2024-01-15 13:55:12  unknown           user.login_failed   ✗     │
│                                                                   │
│ ← 1 2 3 ... 10 →                       Showing 1-25 of 1,240    │
└───────────────────────────────────────────────────────────────────┘
```

Click row to expand:
```
┌─ Event Detail ────────────────────────────────────┐
│ Event: workflow.executed                          │
│ Time: 2024-01-15 14:30:42 UTC                    │
│ User: john@company.com (ID: abc-123)             │
│ IP: 203.0.113.42                                  │
│ Resource: Workflow "Send Weekly Report" (def-456) │
│ Metadata:                                         │
│   execution_id: ghi-789                           │
│   status: success                                 │
│   duration_ms: 1234                               │
└───────────────────────────────────────────────────┘
```

**Filters**:
- Date range (today / last 7 days / last 30 days / custom)
- User (all / specific user)
- Event category (all / auth / workflow / users / credentials / admin)
- Status (all / success / failure)
- Team

**Export**: CSV download. Future: webhook delivery to SIEM systems.

### 8.4 Retention

| Plan | Retention |
|------|-----------|
| Free | 7 days |
| Pro | 30 days |
| Enterprise | 1 year |
| Enterprise+ | Unlimited (with storage cost) |

---

## 9. License & Usage

### 9.1 License Object

```json
{
  "plan": "pro",
  "users": {"used": 12, "limit": 50},
  "teams": {"used": 3, "limit": 10},
  "active_workflows": {"used": 45, "limit": 100},
  "executions_per_month": {"used": 8450, "limit": 10000},
  "data_transfer_mb": {"used": 234, "limit": 1000},
  "data_store_records": {"used": 1200, "limit": 10000},
  "custom_nodes": {"used": 5, "limit": 20},
  "ai_operations": {"used": 320, "limit": 500},
  "api_requests": {"used": 12400, "limit": 50000},
  "reset_at": "2024-02-01T00:00:00Z"
}
```

### 9.2 License Usage UI

```
┌─ Usage This Month ──────────────────────────────────┐
│                                     Reset Feb 1     │
│                                                     │
│ Executions      ██████████░░  8,450 / 10,000       │
│ AI Operations   ████░░░░░░░░    320 / 500    ⚠ 64% │
│ API Requests    ██░░░░░░░░░░ 12,400 / 50,000        │
│ Data Transfer   ███░░░░░░░░░    234 MB / 1 GB       │
│ Active Workflows ████░░░░░░░     45 / 100           │
│ Users            ██░░░░░░░░░     12 / 50            │
│                                                     │
│ [Upgrade Plan →]                                    │
└─────────────────────────────────────────────────────┘
```

Usage bars: green < 70%, yellow 70-89%, red 90%+.

---

## 10. Backend Implementation

### 10.1 Data Models

```python
class OrgSettings(BaseModel):
    org_id: UUID
    # Branding
    instance_name: str = "FlowHolt"
    logo_url: Optional[str] = None
    logo_dark_url: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: str = "#10b981"
    # Auth
    sso_enabled: bool = False
    sso_type: Optional[str] = None  # "saml" | "oidc"
    sso_config: Optional[dict] = None
    require_2fa: str = "optional"  # "optional" | "all" | "admins"
    two_fa_grace_days: int = 7
    # Features
    features: dict = {}  # feature_flag: bool
    # Misc
    maintenance_mode: bool = False
    maintenance_message: Optional[str] = None
    default_language: str = "en"
```

### 10.2 Audit Log Middleware

```python
# backend/app/middleware/audit.py

async def audit_log_middleware(request: Request, call_next):
    response = await call_next(request)
    
    # After successful write operations, log event
    if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        await create_audit_event(
            event=determine_event(request.url.path, request.method),
            user_id=request.state.user_id,
            resource_type=determine_resource_type(request.url.path),
            resource_id=extract_resource_id(request.url.path),
            ip_address=request.client.host,
            metadata={}
        )
    return response
```

### 10.3 Feature Flag Check

```python
# Decorator for feature-flag-gated routes
def require_feature(flag: str):
    async def dependency(org: OrgSettings = Depends(get_org_settings)):
        if not org.features.get(flag, True):
            raise HTTPException(403, f"Feature '{flag}' is not enabled for your organization")
    return Depends(dependency)

# Usage:
@router.post("/custom-nodes", dependencies=[require_feature("custom_node_builder")])
async def create_custom_node(...):
    ...
```

---

## 11. FlowHolt Phase Rollout

| Feature | Phase 1 (MVP) | Phase 2 | Phase 3 |
|---------|--------------|---------|---------|
| Audit logs (7-day) | ✅ | — | — |
| 2FA enforcement | ✅ | — | — |
| Feature flags (basic) | ✅ | — | — |
| SSO (SAML) | — | ✅ | — |
| SSO (OIDC) | — | ✅ | — |
| White-label branding | — | ✅ | — |
| Custom domain | — | ✅ | — |
| Audit log export (CSV) | — | ✅ | — |
| Audit log extended retention | — | — | ✅ |
| Audit log webhook delivery | — | — | ✅ |
| Analytics integrations | — | ✅ | — |
| Maintenance mode | ✅ | — | — |
| License tracking | ✅ | — | — |
