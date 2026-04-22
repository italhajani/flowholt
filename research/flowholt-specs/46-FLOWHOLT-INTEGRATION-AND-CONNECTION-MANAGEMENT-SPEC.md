# FlowHolt Integration And Connection Management Specification

This file defines the connection model, OAuth flows, credential requests, dynamic connections, connection health, integration registry, and on-premise agent support for FlowHolt.

It is grounded in:
- Make corpus: `research/make-help-center-export/pages_markdown/connect-an-application.md` — standard connections created in Scenario Builder, per-team scope, reusable across scenarios, manage via Credentials sidebar (edit, verify, reauthorize, delete), connection shows which scenarios use it, filter (All / My connections)
- Make corpus: `research/make-help-center-export/pages_markdown/connections.md` — overview page listing 9 connection subtopics: OAuth 2.0 HTTP, OAuth 2.0 any service, Google custom OAuth, replace connections across modules, credential requests, dynamic connections, on-premise agent, devices, keys and certificates
- Make corpus: `research/make-help-center-export/pages_markdown/credential-requests.md` — Enterprise/Partner feature, requester sends link, recipient authorizes within Make, credentials never exposed, scope per-module, statuses (Authorized, Partially authorized, Incomplete, Invalid, Declined), revoke/reauthorize flow, audit log tracking
- Make corpus: `research/make-help-center-export/pages_markdown/dynamic-connections.md` — Enterprise feature, variable containing connection, build-time value + default value, selectable per-run via scenario inputs, supports scheduled runs with default
- Make corpus: `research/make-help-center-export/pages_markdown/scenarios-and-connections.md` — links to connect an app, schedule, clone, active/inactive, execution flow, history, blueprints, templates, sharing
- Make corpus: `research/make-help-center-export/pages_markdown/variables.md` — custom variables at org/team level (relevant for dynamic connection selection)
- `backend/app/models.py` — existing `VaultAssetKind` ("connection", "credential", "variable"), `VaultScope` ("workspace", "staging", "production"), `VaultAssetHealthCheck`, `VaultAssetHealthResponse`, `VaultAssetVerifyResponse`, `VaultAssetAccessUpdate`, `VaultAssetAccessResponse`, `VaultConnectionSummary`, `VaultCredentialSummary`, `VaultVariableSummary`, `VaultOverviewResponse`, `VaultAssetCreate`, `VaultAssetUpdate`, `NodeBindingReference`, `StudioStepAssetBinding`
- `backend/app/main.py` — vault CRUD endpoints, health check, verify, access management
- `backend/app/integration_registry.py` — integration metadata and registration
- `backend/app/plugin_loader.py` — dynamic plugin loading for integrations
- `backend/app/oauth2.py` — existing OAuth2 flow support

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §1 Connection model | `research/make-help-center-export/pages_markdown/connect-an-application.md` | Team scope, reuse, manage via Credentials sidebar |
| §2 OAuth flows | `research/make-help-center-export/pages_markdown/connections.md` §OAuth2 | OAuth 2.0 HTTP + any-service patterns |
| §3 Credential requests | `research/make-help-center-export/pages_markdown/credential-requests.md` | Requester→recipient flow, 5 statuses, audit |
| §4 Dynamic connections | `research/make-help-center-export/pages_markdown/dynamic-connections.md` | Variable-based connection selection per run |
| §5 MCP connections | `research/make-help-center-export/pages_markdown/mcp-toolboxes.md` | MCP toolbox management |
| §5 MCP connections | `research/n8n-docs-export/pages_markdown/advanced-ai/mcp/` | n8n MCP client + server spec |
| §6 On-premise agent | `research/make-help-center-export/pages_markdown/on-premise-agent.md` | On-premise agent for internal system access |
| §7 Health check | `research/make-help-center-export/pages_markdown/connections.md` §Verify | Connection verify/health check flow |
| §15 External secrets | `research/n8n-docs-export/pages_markdown/external-secrets.md` | 5 vault providers, scope model, project-level access |
| §All | `research/n8n-docs-export/pages_markdown/credentials/` | n8n credential model |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Credential entity | `n8n-master/packages/cli/src/databases/entities/Credentials.ts` |
| Credential controller | `n8n-master/packages/cli/src/controllers/credentials.controller.ts` |
| OAuth2 flow | `n8n-master/packages/cli/src/controllers/oauth/oAuth2Credential.api.ts` |
| Credential sharing | `n8n-master/packages/cli/src/controllers/credentialsSharing.controller.ts` |
| MCP Client Tool node | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpClientTool.node.ts` |
| MCP Server Trigger | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpTrigger.node.ts` |
| External secrets | `n8n-master/packages/cli/src/external-secrets/` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Credential model | Project-scoped, shareable across projects | Vault-based, workspace-scoped, environment-aware |
| OAuth2 | Built-in OAuth2 flow via credential type | Same (via `backend/app/oauth2.py`) |
| Credential sharing | Project-to-project sharing by admin | Cross-workspace sharing by admin (planned) |
| MCP connections | Yes — MCP Client Tool + MCP Server Trigger | Same + Connections page section for External MCP Servers |
| On-premise agent | No equivalent | Planned: Make-pattern on-premise agent |
| Dynamic connections | No equivalent | Planned: Enterprise — variable-based connection |

### Make comparison

| Feature | Make | FlowHolt |
|---------|------|----------|
| Credentials scope | Team-scoped | Workspace-scoped + cross-workspace share by admin |
| Credential requests | Enterprise — share link pattern | Planned: same flow |
| Dynamic connections | Enterprise — variable selects connection per run | Planned: Enterprise |
| Keys & certificates | Separate credential types | Covered by vault `credential` kind |
| On-premise agent | Yes — for internal systems | Planned |

### This file feeds into

| File | What it informs |
|------|----------------|
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | `Credential`, `Connection`, `SecretEnvelope` entities |
| `16-FLOWHOLT-CONFIDENTIAL-DATA-GOVERNANCE-DRAFT.md` | Credential encryption, vault access policies |
| `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` | MCP toolbox connections |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Vault/connections domain module |
| `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | `/dashboard/connections`, `/dashboard/mcp-toolboxes` routes |

---

### Make's connection model

- Created in Scenario Builder when adding a module
- Scoped to a team (all team members can use)
- Can have multiple connections per app
- Stored securely — credentials never visible to other users
- Manage via Credentials sidebar: edit, verify, reauthorize, delete
- Shows which scenarios use a connection
- Connection types: standard and dynamic

### FlowHolt connection model (existing)

FlowHolt already has a vault-based connection system:

```python
# From models.py
VaultAssetKind = Literal["connection", "credential", "variable"]
VaultScope = Literal["workspace", "staging", "production"]

class VaultConnectionSummary(BaseModel):
    id: str
    kind: Literal["connection"] = "connection"
    name: str
    app: str
    subtitle: str
    state: Literal["ready", "warning", "missing"]
    scope: VaultScope

class VaultAssetCreate(BaseModel):
    kind: VaultAssetKind
    name: str
    app: str | None = None
    subtitle: str | None = None
    scope: VaultScope = "workspace"
    visibility: VaultVisibility = "workspace"
    secret: dict[str, Any] = {}
```

### Connection entity (extended)

```python
class Connection(BaseModel):
    id: str
    workspace_id: str
    name: str
    app: str                            # integration slug (e.g. "gmail", "slack")
    app_version: str | None = None      # integration version if applicable
    auth_type: Literal["oauth2", "api_key", "basic", "custom", "none"]
    scope: VaultScope = "workspace"
    visibility: VaultVisibility = "workspace"
    state: Literal["ready", "warning", "expired", "missing", "revoked"]
    
    # OAuth2-specific fields
    oauth2_access_token: str | None = None       # encrypted
    oauth2_refresh_token: str | None = None      # encrypted
    oauth2_expires_at: str | None = None
    oauth2_scopes: list[str] = []
    
    # API key / custom auth
    secret_fields: dict[str, Any] = {}           # encrypted at rest
    
    # Metadata
    created_by: str
    created_at: str
    updated_at: str
    last_verified_at: str | None = None
    last_used_at: str | None = None
    used_by_workflows: list[str] = []            # workflow IDs using this connection
```

---

## 2. Connection lifecycle

### Create

1. User adds a module in the Studio
2. Click "Create a connection" or "Add"
3. For OAuth2: redirected to third-party authorization
4. For API key: enter key in the connection form
5. For custom auth: fill in the form defined by the integration
6. Connection stored encrypted in the vault
7. Connection is immediately available in all modules of the same app

### Verify

1. Click "Verify" on the connection in the Credentials sidebar
2. System makes a lightweight test request to the third-party API
3. Returns pass/fail with diagnostic checks

Existing model:

```python
class VaultAssetHealthCheck(BaseModel):
    code: str                   # e.g. "auth_valid", "scope_check"
    label: str
    passed: bool
    severity: str               # "info", "warning", "error"
    message: str

class VaultAssetHealthResponse(BaseModel):
    asset_id: str
    workspace_id: str
    name: str
    kind: VaultAssetKind
    app: str | None = None
    healthy: bool
    checks: list[VaultAssetHealthCheck]
```

### Reauthorize

1. OAuth2 connections may expire when refresh token is invalidated
2. User clicks "Reauthorize" → redirected to OAuth flow
3. New access/refresh tokens stored, replacing old ones
4. All modules using this connection automatically get the updated token

### Edit

1. User clicks "Edit" on connection
2. Form shows editable fields (API key, scopes, custom params)
3. Original credentials are NOT shown — user must re-enter all required fields
4. Save replaces stored credentials
5. All modules using this connection automatically use updated credentials

### Delete

1. User clicks "Delete" on connection
2. If connection is used by workflows: show warning with list of affected workflows
3. If connection has webhook: must delete webhook first
4. On confirm: connection removed from vault, affected workflows will fail on next run

---

## 3. OAuth2 flow

### Existing implementation

FlowHolt has `backend/app/oauth2.py` for OAuth2 support.

### OAuth2 flow (standard)

```
1. User clicks "Create connection" for OAuth2 app
2. Frontend generates state token, stores in session
3. Redirect to: {auth_url}?client_id={id}&redirect_uri={callback}&scope={scopes}&state={state}
4. User authorizes on third-party site
5. Third party redirects to: {callback}?code={auth_code}&state={state}
6. Backend verifies state, exchanges code for access+refresh tokens
7. Tokens encrypted and stored in vault
8. Connection state set to "ready"
```

### Token refresh

```
1. Before each API call, check if access_token is expired
2. If expired and refresh_token exists:
   a. Call token endpoint with refresh_token
   b. Store new access_token (and optionally new refresh_token)
   c. Update oauth2_expires_at
3. If refresh_token fails: set connection state to "expired"
4. On "expired" state: execution fails with AccountValidationError
5. User must reauthorize
```

### Custom OAuth client

Like Make's "Connect to Google services using a custom OAuth client":
1. User provides their own Client ID and Client Secret
2. Stored in the connection's secret_fields
3. Used instead of FlowHolt's default OAuth client
4. Useful for organizations that need their own Google Cloud project

---

## 4. Connection scope and environment binding

### Make's model

- Connections scoped to team
- No environment-based isolation (same connection used in all runs)

### FlowHolt's model (extension)

FlowHolt adds environment-aware connections through the existing vault scope system:

| Scope | Description |
|---|---|
| **workspace** | Available in all environments (draft, staging, production) |
| **staging** | Only available in staging executions |
| **production** | Only available in production executions |

### Per-step connection binding

From existing models:

```python
class StudioStepAssetBinding(BaseModel):
    kind: Literal["connection", "credential", "variable"]
    name: str
    editable: bool
    testable: bool
    scope: VaultScope
```

Workflow steps bind to connections by name. At execution time, the runtime resolves the binding:
1. Check if a connection with the binding name exists in the execution's environment scope
2. If not found in environment scope, fall back to workspace scope
3. If not found: raise `VaultConnectionError`

This enables environment-specific connections (e.g., sandbox API key for staging, production API key for production) without changing the workflow definition.

---

## 5. Credential requests

### Make's model

- Enterprise/Partner feature
- Requester specifies which app+modules need credentials
- Generates a secure link sent to recipient
- External recipient invited to org with Guest role
- Recipient authorizes by entering credentials directly in Make
- Credentials never exposed to requester
- Statuses: Authorized, Partially authorized, Incomplete, Invalid, Declined
- Revoke/reauthorize/delete at any time
- Audit log tracking

### FlowHolt credential request model

```python
class CredentialRequest(BaseModel):
    id: str
    workspace_id: str
    requester_id: str
    recipient_email: str
    recipient_name: str | None = None
    recipient_user_id: str | None = None     # set after recipient joins
    description: str | None = None
    status: Literal["pending", "authorized", "partially_authorized", "incomplete", "invalid", "declined"]
    items: list[CredentialRequestItem]
    created_at: str
    updated_at: str

class CredentialRequestItem(BaseModel):
    app: str
    app_version: str | None = None
    modules: list[str]                       # specific module types needed
    note: str | None = None
    connection_name: str                      # name for resulting connection
    status: Literal["pending", "authorized", "declined", "revoked"]
    connection_id: str | None = None         # set after authorization
    declined_reason: str | None = None
```

### Credential request flow

```
1. Requester creates request (app, modules, recipient)
2. System generates secure link, sends email to recipient
3. If external recipient: invite to workspace with Guest role
4. Recipient opens link → sees request details (requester, modules, notes)
5. Recipient clicks "Authorize" → standard connection creation flow
6. Connection created and shared with requester's team
7. Requester can now use the connection in workflows
```

### Roles and permissions

| Role | Can request from |
|---|---|
| Builder | Anyone in their workspace |
| Admin | Anyone in their organization |
| Owner | Anyone in org + external people |

### Endpoints

```
POST   /api/workspaces/{id}/credential-requests                      # create
GET    /api/workspaces/{id}/credential-requests                      # list (sent)
GET    /api/workspaces/{id}/credential-requests/received             # list (received)
GET    /api/workspaces/{id}/credential-requests/{cr_id}              # detail
DELETE /api/workspaces/{id}/credential-requests/{cr_id}              # delete
POST   /api/workspaces/{id}/credential-requests/{cr_id}/authorize    # authorize item
POST   /api/workspaces/{id}/credential-requests/{cr_id}/decline      # decline item
POST   /api/workspaces/{id}/credential-requests/{cr_id}/revoke       # revoke access
POST   /api/workspaces/{id}/credential-requests/{cr_id}/reauthorize  # request reauthorization
```

### Plan gating

| Plan | Credential requests |
|---|---|
| Free | No |
| Starter | No |
| Pro | No |
| Teams | Yes |
| Enterprise | Yes |

---

## 6. Dynamic connections

### Make's model

- Enterprise feature
- A variable containing a connection reference
- Has a "build-time value" (used for scenario building/testing)
- Has an optional "default value" (used for scheduled runs)
- Can be overridden per-run via scenario inputs
- Allows single scenario to work with different accounts without routing

### FlowHolt dynamic connection model

```python
class DynamicConnection(BaseModel):
    id: str
    workflow_id: str
    workspace_id: str
    name: str                            # variable name used in module binding
    app: str                             # which app this dynamic connection is for
    build_time_connection_id: str        # connection used during editing/testing
    default_connection_id: str | None    # connection used for scheduled runs
    description: str | None = None
    created_at: str
    updated_at: str
```

### Dynamic connection resolution

At execution time:
1. Check if a value was provided in the execution inputs for this dynamic connection
2. If not, use `default_connection_id`
3. If no default: fail with error (unless on-demand execution, where inputs are required)

### Integration with scenario inputs

Dynamic connections appear in the "Scenario Inputs" panel alongside other input parameters:
- Listed as connection-type inputs with a dropdown of compatible connections
- For scheduled runs: default value is required
- For on-demand runs: user selects connection at run time

### Plan gating

| Plan | Dynamic connections |
|---|---|
| Free | No |
| Starter | No |
| Pro | No |
| Teams | Up to 5 per workflow |
| Enterprise | Unlimited |

---

## 7. Connection health monitoring

### Existing implementation

FlowHolt already has health check models:

```python
class VaultAssetHealthCheck(BaseModel):
    code: str
    label: str
    passed: bool
    severity: str
    message: str

class VaultAssetVerifyResponse(BaseModel):
    asset_id: str
    workspace_id: str
    verified: bool
    mode: Literal["static", "runtime"]
    checks: list[VaultAssetHealthCheck]
    sample_request: dict[str, Any]
    next_steps: list[str]
```

### Planned health monitoring

1. **Periodic health checks** — background job tests connections on a schedule
   - Frequency: every 24 hours for active connections
   - Tests basic auth validity (token not expired, API key valid)
   - Updates `state` field on connection

2. **Pre-execution check** — verify connection before workflow execution
   - If connection state is "expired" or "revoked": fail fast before execution starts
   - If connection state is "warning": log warning but proceed

3. **Health dashboard** — Credentials sidebar shows connection health
   - Green: verified, last check passed
   - Yellow: warning (expiring soon, degraded)
   - Red: expired, revoked, or failed verification
   - Gray: never verified

### Connection health states

| State | Meaning | Action |
|---|---|---|
| `ready` | Connection verified and working | None |
| `warning` | Token expiring soon or degraded | Reauthorize recommended |
| `expired` | OAuth token expired, refresh failed | Reauthorize required |
| `missing` | Connection reference exists but vault asset deleted | Recreate connection |
| `revoked` | Credential request recipient revoked access | Contact recipient |

---

## 8. Integration registry

### Existing implementation

FlowHolt has `backend/app/integration_registry.py` and `backend/app/plugin_loader.py` for managing integrations.

### Integration metadata

```python
class IntegrationMetadata(BaseModel):
    slug: str                            # unique identifier (e.g. "gmail")
    name: str                            # display name
    icon: str | None = None              # icon URL
    description: str | None = None
    category: str | None = None          # e.g. "Communication", "CRM", "Storage"
    auth_types: list[str]                # supported auth methods
    modules: list[IntegrationModule]
    connection_fields: list[ConnectionField]  # fields needed to create a connection
    supports_custom_oauth: bool = False
    supports_dynamic_connection: bool = True
    supports_transactions: bool = False  # ACID support
    rate_limit: IntegrationRateLimit | None = None
    docs_url: str | None = None

class IntegrationModule(BaseModel):
    key: str                             # e.g. "send_email"
    label: str
    description: str | None = None
    type: Literal["action", "trigger", "search", "aggregator"]
    fields: list[NodeFieldDefinition]
    required_scopes: list[str] = []      # OAuth scopes needed for this module

class ConnectionField(BaseModel):
    key: str
    label: str
    type: Literal["text", "password", "select", "boolean"]
    required: bool = True
    help: str | None = None
    placeholder: str | None = None

class IntegrationRateLimit(BaseModel):
    requests_per_minute: int | None = None
    requests_per_hour: int | None = None
    concurrent_limit: int | None = None
```

### Plugin system

FlowHolt loads integrations dynamically from `backend/app/integrations/`:
- Each integration is a Python package with an `__init__.py`
- Defines connection fields, module definitions, and execution logic
- Registered via `integration_registry.py`
- Currently implemented: HTTP Request, GitHub, Notion, Airtable, Gmail, Google Sheets, Jira, Linear, SendGrid, Twilio, Discord, Stripe, Telegram

---

## 9. Replace connections across modules

### Make's model

- Bulk replace a connection across multiple modules in one or many scenarios
- Useful when switching accounts or rotating credentials

### FlowHolt connection replacement

```
POST /api/workspaces/{id}/connections/bulk-replace
Body:
{
    "old_connection_id": "conn_123",
    "new_connection_id": "conn_456",
    "workflow_ids": ["wf_1", "wf_2"],   // optional: limit to specific workflows
    "dry_run": true                      // preview changes without applying
}
Response:
{
    "affected_workflows": [...],
    "affected_steps": [...],
    "status": "preview" | "applied"
}
```

---

## 10. Connection access control

### Existing implementation

FlowHolt has access control models:

```python
class VaultAssetAccessUpdate(BaseModel):
    visibility: VaultVisibility = "workspace"
    allowed_roles: list[WorkspaceRole] = []
    allowed_user_ids: list[str] = []

class VaultAssetAccessResponse(BaseModel):
    asset_id: str
    workspace_id: str
    name: str
    kind: VaultAssetKind
    visibility: VaultVisibility
    owner_user_id: str | None = None
    allowed_roles: list[WorkspaceRole] = []
    allowed_user_ids: list[str] = []
```

### Access levels

| Visibility | Who can use |
|---|---|
| `workspace` | All workspace members |
| `restricted` | Only allowed roles or specific users |
| `private` | Only the owner |

### Production-scoped connections

Connections with `scope = "production"` require a minimum role to use in workflows:
- `production_asset_min_role` setting (from workspace policy, default: "admin")
- Enforced at workflow publish time (file 43)

---

## 11. On-premise agent

### Make's model

- Software agent installed on customer's network
- Enables connections to local databases, internal APIs, file systems
- Securely tunnels traffic through Make's cloud

### FlowHolt on-premise agent (planned)

```python
class OnPremiseAgent(BaseModel):
    id: str
    workspace_id: str
    name: str
    hostname: str | None = None
    status: Literal["online", "offline", "degraded"]
    version: str
    last_heartbeat_at: str | None = None
    allowed_integrations: list[str] = []    # which integrations can use this agent
    created_at: str
```

On-premise agent is planned for Enterprise tier only and is out of scope for initial rollout.

---

## 12. Keys and certificates

### Make's model

- Manage SSL/TLS keys and certificates for mutual TLS authentication
- Used by HTTP modules and custom integrations

### FlowHolt keys and certificates (planned)

Stored in the vault as credential assets:

```python
class VaultCertificate(BaseModel):
    id: str
    workspace_id: str
    name: str
    type: Literal["client_cert", "ca_cert", "private_key", "pfx"]
    content: str                         # encrypted at rest
    expires_at: str | None = None
    created_at: str
```

Certificates can be referenced by HTTP Request modules for mutual TLS.

---

## 13. Sidebar navigation

Following file 40, connection management appears in the dashboard sidebar:

**Credentials section:**
- Connections → `/dashboard/connections`
- Credential Requests → `/dashboard/credential-requests`
- Keys & Certificates → `/dashboard/certificates`

---

## 14. Rollout phases

### Phase 1: Core connections (complete)
- ✅ Vault-based connection storage with encryption
- ✅ OAuth2 flow with token refresh
- ✅ API key and custom auth connections
- ✅ Connection health checks and verification
- ✅ Connection access control (visibility, roles)
- ✅ Environment-scoped connections (workspace, staging, production)
- ✅ Integration plugin system with 13+ integrations

### Phase 2: Connection management UI
- Connection list view with health indicators
- Connection detail view with usage (which workflows)
- Edit, verify, reauthorize, delete actions
- Bulk replace connections across workflows
- Connection filter (all / mine)

### Phase 3: Credential requests
- Credential request creation and sending
- External recipient invitation with Guest role
- Authorization flow from recipient's perspective
- Revoke, reauthorize, decline flows
- Audit log integration
- Gate to Teams/Enterprise

### Phase 4: Dynamic connections
- Dynamic connection variable creation in Studio
- Build-time value and default value configuration
- Scenario inputs integration for per-run selection
- Scheduled run support with default connection
- Gate to Teams/Enterprise

### Phase 5: Advanced connection features
- Periodic background health checks (every 24 hours)
- Token expiration warnings (7 days before)
- Connection usage analytics
- Bulk connection management (rotate keys across all integrations)

### Phase 6: On-premise agent
- Agent installation package
- Secure tunnel setup
- Heartbeat monitoring
- Integration routing through agent
- Gate to Enterprise

### Phase 7: External Secrets Vault Integration (NEW — n8n-discovered pattern)

Raw source: `research/n8n-docs-export/pages_markdown/external-secrets.md`

External secrets allow credential field values to be sourced from an external vault rather than stored in FlowHolt's encrypted database. The value is loaded at runtime from the vault provider.

**Supported vault providers (n8n's model — adopt for FlowHolt):**

| Provider | How it connects |
|----------|----------------|
| **HashiCorp Vault** | Vault URL + Token/AppRole/Userpass auth + optional namespace |
| **AWS Secrets Manager** | Access key + secret + region, IAM policy with `secretsmanager:*` permissions |
| **Azure Key Vault** | Vault name + tenant ID + client ID + client secret |
| **GCP Secrets Manager** | Service account JSON key with Secret Manager roles |
| **1Password** | Connect Server URL + Access Token (requires 1Password Connect Server, not standard account) |

**Reference syntax in credentials:**
```
{{ $secrets.<vault-name>.<secret-name> }}
```

For 1Password with sub-fields:
```
{{ $secrets.<vault-name>.<item-title>.<field-label> }}
```

**Vault scoping:**
- **Global vault**: Accessible to all projects/workspaces on the instance
- **Project-scoped vault**: Only that project's credentials can reference its secrets (from n8n v2.11.0+)

**Access control for vault:**
- Instance admins: create, edit, delete, assign global or project vaults
- Project admins: create/edit project-scoped vaults (when `enable_external_secrets_for_project_roles=true`)
- Project editors: use secrets in credentials (when enabled)

**Environment benefit:** Connect each environment (dev/staging/prod) to a different vault or vault namespace. Enables per-environment credential values without duplicating credential records. This is the recommended pattern for environments (`source-control-environments` use case).

**FlowHolt vault model implementation:**

```python
class ExternalSecretsProvider(BaseModel):
    id: str
    name: str                     # vault name — used in $secrets.<vault-name>...
    provider_type: Literal["hashicorp_vault", "aws_secrets_manager", 
                            "azure_key_vault", "gcp_secrets_manager", "1password"]
    scope: Literal["global", "project"]
    project_id: str | None = None # populated if scope == "project"
    config: dict                  # provider-specific config (encrypted)
    enabled: bool = True
    last_synced_at: str | None = None

class ExternalSecretRef(BaseModel):
    vault_name: str
    secret_path: str              # e.g. "database/password" or "item-title.field-label"
```

**API endpoints:**

| Action | Method | Path | Min role |
|--------|--------|------|----------|
| List vault providers | GET | `/api/settings/external-secrets` | `instance_admin` |
| Create vault provider | POST | `/api/settings/external-secrets` | `instance_admin` |
| Update vault provider | PUT | `/api/settings/external-secrets/{id}` | `instance_admin` |
| Delete vault provider | DELETE | `/api/settings/external-secrets/{id}` | `instance_admin` |
| Reload vault | POST | `/api/settings/external-secrets/{id}/reload` | `instance_admin` |
| Enable for project roles | PUT | `/api/settings/external-secrets/project-access` | `instance_admin` |
| List project vault vaults | GET | `/api/projects/{id}/secrets-vaults` | `project_admin` |
| Create project vault | POST | `/api/projects/{id}/secrets-vaults` | `project_admin` |

**Gate:** Enterprise plan only.

**Security note:** The vault connection itself stores credentials (vault token, access key, etc.) encrypted in FlowHolt's database. The vault secrets (the actual sensitive values) never touch FlowHolt's database — they are fetched at runtime and used directly.

**Feeds into:**
- `16-FLOWHOLT-CONFIDENTIAL-DATA-GOVERNANCE-DRAFT.md` — external secrets as a governance layer
- `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` — Settings → External Secrets section
- `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` — per-project vault access controls
- `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` — per-environment vault binding
