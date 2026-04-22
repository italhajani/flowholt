# Spec 96 — FlowHolt Credentials, Connections & Dynamic Connections
**Sources:** Make `connections.md`, `dynamic-connections.md`, `on-premise-agent.md`, `replace-connections-across-multiple-modules.md`, `credential-requests.md`
**Status:** Research Complete — Ready for Implementation
**Priority:** ⭐⭐⭐⭐ High (core platform — every integration needs credentials)

---

## 1. Overview

FlowHolt manages credentials via a **Credential/Connection** system. Connections are OAuth tokens or API keys needed to call external services. All connections belong to a **team** — the team owns and shares them.

Three main credential types:
1. **Standard connections** — OAuth 2.0, API key, Basic Auth, custom auth
2. **Dynamic connections** — Enterprise: runtime variable holding a connection (parameterized)
3. **On-premise agent** — Enterprise: local network access without firewall changes

---

## 2. Standard Connections

### 2.1 Connection Types
| Type | How It Works | Example |
|------|-------------|---------|
| OAuth 2.0 | Make completes OAuth flow in popup | Google, Slack, Salesforce |
| API Key | User pastes key → stored encrypted | OpenAI, Stripe |
| Basic Auth | Username + password → stored encrypted | Legacy systems |
| Custom Auth | Configurable fields (headers, params, tokens) | Internal APIs |
| Service Account | JSON key file upload | Google Cloud |

### 2.2 Connection Lifecycle
```
Create → Test → Active
                  ↓
            Re-authenticate (token expired)
                  ↓
            Revoke (user deletes)
```

### 2.3 Connection UI — Credentials Page (`/credentials`)

**List view:**
```
[Search] [Filter: App ▾] [Filter: Status ▾]  [+ Add Credential]

Name              App         Status    Created    Last Used   Actions
──────────────────────────────────────────────────────────────────────
Gmail (Work)      Gmail       ● Active  Jan 12     2 hours ago  ···
Slack (Sales)     Slack       ● Active  Feb 3      5 min ago    ···
HubSpot API       HubSpot     ⚠ Expired Mar 1      Never        ···
```

**Status indicators:**
- ● Green: Active
- ⚠ Yellow: Needs re-authentication
- ✕ Red: Revoked / error

**Credential detail panel (right slide-over):**
- App icon + name
- Connected account name/email
- Status + last verified
- Scopes granted (for OAuth)
- Used in N workflows (clickable list)
- [Re-authenticate] [Delete] [Replace in workflows...]

### 2.4 Creating a Connection
1. Click **+ Add Credential** → App picker modal
2. Select app → Connection form appears:
   - OAuth: Redirect to provider → popup returns token
   - API Key: Input field(s) → [Test Connection] button → stores if success
3. Name the connection (default: `{App} - {account_email}`)
4. Connection saved under team

### 2.5 Replace Connections Across Workflows
**Single workflow:** Replace old connection with new in all modules of same app
- UI: Credential detail → "Replace in workflows..." → modal lists affected workflows → confirm
- API: `PATCH /api/workflows/{id}/replace-connection` `{ old_credential_id, new_credential_id }`

**Multiple workflows:**
- UI: "Replace across all workflows" → select old connection → select new connection → preview affected count → confirm
- API: `POST /api/credentials/bulk-replace` `{ old_id, new_id, team_id, dry_run: true }`
- Dry-run mode shows count before committing

---

## 3. Dynamic Connections — Enterprise Feature

### 3.1 What They Are
A **dynamic connection** is a workflow variable that holds a connection at runtime. Instead of hardcoding which Gmail account a workflow uses, you parameterize it.

**Use cases:**
- Multiple team members' email accounts → route by sender
- Region-based routing → US customers use US account, EU customers use EU account
- White-label: Same workflow runs for different client accounts

### 3.2 How It Works
```
Module Config:
  Connection field → [Create dynamic connection]
                           ↓
  Dynamic Connection is created with:
    - Variable name (for expression reference)
    - Build-time value (used in canvas editor for testing)
    - Default value (used for scheduled/automatic runs)
    - Optional: workflow input parameter (override per-run)
```

**Build-time vs. Default value:**
- Build-time: Always used when running from canvas editor
- Default: Used when scenario runs on schedule automatically
- **Without default value set:** Workflow can only run on-demand (not scheduled)

### 3.3 Dynamic Connection in Canvas
```
Module node shows: 🔀 Dynamic · gmail-account-var
  ↑
  Hovering shows: "Build-time: Gmail (Work) | Default: Gmail (US-East)"
```

### 3.4 Database Schema
```sql
CREATE TABLE dynamic_connections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id      UUID REFERENCES workflows(id) ON DELETE CASCADE,
  variable_name    TEXT NOT NULL,
  build_time_id    UUID REFERENCES credentials(id),  -- for canvas testing
  default_id       UUID REFERENCES credentials(id),  -- for scheduled runs
  app_type         TEXT NOT NULL,                    -- app this connection is for
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workflow_id, variable_name)
);
```

### 3.5 Runtime Behavior
```python
def resolve_connection(module_config, run_context):
    if module_config.get('dynamic_connection_var'):
        var = module_config['dynamic_connection_var']
        # Check if run_context has an override (on-demand run with input)
        if var in run_context.inputs:
            return get_credential(run_context.inputs[var])
        # Use default for scheduled runs
        dyn_conn = get_dynamic_connection(module_config['dynamic_connection_id'])
        if run_context.is_scheduled and dyn_conn.default_id:
            return get_credential(dyn_conn.default_id)
        # Fallback to build-time
        return get_credential(dyn_conn.build_time_id)
    else:
        return get_credential(module_config['credential_id'])
```

---

## 4. On-Premise Agent — Enterprise Feature

### 4.1 What It Is
A small agent (Java-based, runs as system service) installed on customer's local network. Allows FlowHolt workflows to call internal APIs/databases without opening firewall ports.

**Architecture:**
```
[FlowHolt Cloud] ←——HTTPS outbound——→ [On-prem Agent] ←——local LAN——→ [Internal Database/API]
```
- Agent polls FlowHolt for tasks (outbound only from agent's perspective)
- No inbound ports need to be opened on customer firewall
- Agent installed: Windows, macOS, Linux (Java 11+)

### 4.2 UI in FlowHolt — Org > On-prem Agents Tab
```
On-prem Agents                                              [+ Create on-prem agent]

Name              Status        Systems Connected    Created
──────────────────────────────────────────────────────────────────────────────────
Office LAN Agent  ● Active      3 systems           Jan 12
DB Server Agent   ⚠ Not responding  1 system        Feb 8
                                                    Last ping: 4 min ago
```

**Status types:**
| Status | Meaning | Action |
|--------|---------|--------|
| Active | Connected, polling | Normal use |
| Not responding | Missed heartbeat (4 min check) | Check network/firewall |
| Registered | Created but not yet installed | Complete installation |
| Stopped | Manually stopped | Restart agent service |

### 4.3 Agent Creation Flow
1. Admin clicks **+ Create on-prem agent** → Name input → Create
2. System generates: Client ID + Secret + Base URL (shown ONCE — must save immediately)
3. Admin downloads installer for their OS (Win/Mac/Linux)
4. Admin installs agent (configure `application-local.yml` with credentials)
5. Agent connects → status changes to **Active**

### 4.4 Connected Systems
Each on-prem agent can connect to multiple systems:
- **HTTP Agent** app: Custom API endpoints on local network
- System URL format: `http://localhost:PORT/api` or `http://192.168.x.x:PORT/api`

### 4.5 Database Schema
```sql
CREATE TABLE on_prem_agents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  name          TEXT NOT NULL,
  client_id     TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,  -- hashed
  base_url      TEXT NOT NULL,
  status        TEXT DEFAULT 'registered' CHECK (status IN ('active','not_responding','registered','stopped')),
  last_ping     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE on_prem_agent_systems (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      UUID REFERENCES on_prem_agents(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  app_type      TEXT NOT NULL DEFAULT 'http',
  base_url      TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Keys & API Access

### 5.1 Personal API Keys (Existing — in Settings)
- User-scoped API keys for programmatic workflow triggering
- Scopes: `workflows:read`, `workflows:write`, `executions:read`, `webhooks:write`, etc.
- Stored hashed; shown once at creation

### 5.2 Team Keys (Enterprise extension)
- Team-scoped API keys (not tied to one user)
- Used for service accounts / CI-CD pipelines
- Scopes align with team permissions
- Managed in Team Settings → API Keys tab

---

## 6. Credential Requests (Team Guest Role)

### 6.1 Purpose
Allows external contractors (Team Guests) to request credentials from Team Admins without admins sharing sensitive tokens.

### 6.2 Flow
```
1. Guest clicks "Request credential" for an app
2. Request form: App name, Why needed, Expected duration
3. Admin receives notification → views request → Approve/Deny
4. If Approved: Guest gets read-only access to use the connection (cannot see the actual secret)
5. Credential shows as "Shared by Admin [Name]" in guest's workflow
6. Admin can revoke at any time
```

### 6.3 UI
**Guest sees (in Credentials):**
```
[My Credentials]    [Requested]    [+ Request access]
──────────────────────────────────────────────
Gmail (Admin)    Shared by Admin  ● Active  Used in: Email Notifier
Slack            Pending          ⏳ Waiting approval
```

**Admin sees (in Credentials → Requests tab):**
```
Pending requests (2)
──────────────────────────────────────────
John (Guest) requested access to Slack   [View] [Approve] [Deny]
Jane (Guest) requested access to Gmail   [View] [Approve] [Deny]
```

---

## 7. Credential Security

### 7.1 Storage
- All credentials encrypted at rest using AES-256
- Encryption key managed by platform (KMS-backed in Enterprise)
- Never stored in plaintext; never logged
- OAuth tokens automatically refreshed before expiry

### 7.2 Scopes Display
For OAuth connections, show:
- Granted scopes in plain English (not raw OAuth scopes)
- Highlight if scope is broader than needed (optional future: scope minimization suggestions)

### 7.3 Re-authentication
- System monitors token expiry; sets credential status to `needs_reauth` 7 days before expiry
- User notified via in-app notification + optional email
- One-click re-auth from notification or credential detail panel

---

## 8. FlowHolt Decision Summary

| Decision | Chosen Approach | Reason |
|----------|-----------------|--------|
| Connection ownership | Team-scoped | Shared credentials; prevent duplication |
| Dynamic connections | Enterprise only | High complexity; SMB doesn't need it |
| On-prem agent | Enterprise only | Infra requirement; SMB uses cloud apps |
| Replace connection | Both single + bulk replace | Saves admin time |
| Credential requests | Available to Guest role on any plan | Enables contractor workflows |
| Storage encryption | AES-256 at rest | Security baseline |
| OAuth re-auth UX | 7-day warning + one-click | Prevent workflow downtime |
