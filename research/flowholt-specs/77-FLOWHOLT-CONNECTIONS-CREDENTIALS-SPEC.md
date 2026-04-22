# 77 · FlowHolt: Connections & Credentials Spec

> **Purpose**: Complete specification for FlowHolt's credential and connection management system — Vault storage, encryption, OAuth flows, per-node credential selection, API key management, and credential sharing.
> **Audience**: Junior AI model implementing the credentials system. All concepts explained.
> **Sources**: spec 46 (integration/connection management), spec 64 (vault/connections UX), `research/competitor-data/make-docs/api-reference/connections.md`, `api-reference/keys.md`, spec 16 (data governance).

---

## Cross-Reference Map

| Section | Source |
|---------|--------|
| §1 Concepts | spec 46, Make connections overview |
| §2 Credential types | spec 46, Make connections.md |
| §3 Vault storage | spec 16, `backend/app/encryption.py` |
| §4 OAuth flows | spec 46 §oauth, Make connections |
| §5 Credential API | `api-reference/connections.md`, `keys.md` |
| §6 Per-node credential picker | spec 15, spec 76 §2.9 |
| §7 Sharing model | spec 46, Make connection sharing |
| §8 UI surfaces | spec 64, spec 74 §7 |
| §9 Backend implementation | `backend/app/` codebase |

---

## 1. Core Concepts

### 1.1 What Is a Credential?

A **credential** (called "Connection" in Make, "Credential" in n8n) stores authentication data for an external service. Examples:
- Gmail OAuth tokens
- Stripe API key
- MySQL database password
- Slack bot token

Credentials are **encrypted at rest** in the database and **never returned in plaintext** to the frontend. The backend decrypts them only during workflow execution.

### 1.2 Credential vs Connection

FlowHolt uses both terms:
- **Credential** = the stored auth data (abstract, in vault)
- **Connection** = when a node uses a credential (the association)

When a user configures an HTTP Request node and selects "john's Gmail account", that's a connection using the Gmail credential.

### 1.3 Credential Scope

Credentials belong to either:
- **Personal** — only the creator can use them
- **Team** — all team members can use them
- **Org** — all org members can use them (admin-created)

**Default**: Team scope (most practical for shared workflows).

---

## 2. Credential Types

### 2.1 API Key (Generic)

**Used for**: Services with simple API key header.

Fields:
| Field | Label | Type | Notes |
|-------|-------|------|-------|
| `api_key` | API Key | password | Hidden, encrypted |
| `header_name` | Header Name | string | Default: `X-API-Key` |

**Inject**: `{header_name}: {api_key}` on every HTTP call.

### 2.2 Bearer Token

Fields:
| Field | Label | Type |
|-------|-------|------|
| `token` | Token | password |

**Inject**: `Authorization: Bearer {token}`

### 2.3 Basic Auth

Fields:
| Field | Label | Type |
|-------|-------|------|
| `username` | Username | text |
| `password` | Password | password |

**Inject**: Base64 of `username:password` in `Authorization: Basic` header.

### 2.4 OAuth 2.0 (Authorization Code)

This is the most complex but most common for SaaS integrations.

Stored fields (post-authorization):
| Field | Description |
|-------|-------------|
| `access_token` | Current access token (encrypted) |
| `refresh_token` | Refresh token for renewal (encrypted) |
| `token_expiry` | When access token expires |
| `scope` | Granted scopes |
| `token_type` | Usually "Bearer" |

Config fields (not secret):
| Field | Description |
|-------|-------------|
| `client_id` | OAuth app client ID |
| `client_secret` | OAuth app secret (encrypted) |
| `auth_url` | Authorization endpoint |
| `token_url` | Token exchange endpoint |
| `scopes` | Required scopes |

### 2.5 OAuth 2.0 (Client Credentials — Machine-to-Machine)

No user authorization step. Just client_id + client_secret → access token.

Fields:
| Field | Label | Type |
|-------|-------|------|
| `client_id` | Client ID | text |
| `client_secret` | Client Secret | password |
| `token_url` | Token URL | text |
| `scope` | Scope | text |

### 2.6 JWT (JSON Web Token)

For services accepting JWT-authenticated requests:

Fields:
| Field | Label | Type |
|-------|-------|------|
| `private_key` | Private Key (PEM) | password textarea |
| `key_id` | Key ID (kid) | text |
| `algorithm` | Algorithm | select (RS256, HS256) |
| `issuer` | Issuer (iss) | text |
| `audience` | Audience (aud) | text |
| `expiry_seconds` | Token TTL | number |

### 2.7 SSH Key

For server/Git connections:

Fields:
| Field | Label | Type |
|-------|-------|------|
| `host` | Host | text |
| `port` | Port | number (default 22) |
| `username` | Username | text |
| `private_key` | Private Key | password textarea |
| `passphrase` | Passphrase (optional) | password |

### 2.8 Database Credentials

For database connections (MySQL, PostgreSQL, MongoDB):

| Field | Label | Type |
|-------|-------|------|
| `host` | Host | text |
| `port` | Port | number |
| `database` | Database | text |
| `username` | Username | text |
| `password` | Password | password |
| `ssl` | Use SSL | boolean |
| `ssl_cert` | SSL Certificate | password textarea |

### 2.9 SMTP (Email)

| Field | Label | Type |
|-------|-------|------|
| `host` | SMTP Host | text |
| `port` | Port | number (default 587) |
| `username` | Username | text |
| `password` | Password | password |
| `from_email` | From Email | email |
| `from_name` | From Name | text |
| `use_tls` | Use TLS | boolean |

### 2.10 Service Account (JSON)

For Google Cloud services:

| Field | Label | Type |
|-------|-------|------|
| `service_account_json` | Service Account JSON | password textarea |

---

## 3. Vault Storage & Encryption

### 3.1 Encryption Approach

**Algorithm**: AES-256-GCM (authenticated encryption)  
**Key management**: Single master key stored in environment (`CREDENTIAL_ENCRYPTION_KEY`)  
**Key derivation**: PBKDF2 with SHA-256, 100,000 iterations  
**IV**: Random 12-byte IV per encryption operation (stored with ciphertext)  
**Auth tag**: 16-byte GCM tag (stored with ciphertext)

**Storage format**:
```
iv:authTag:ciphertext (base64 encoded, colon-separated)
```

### 3.2 What Gets Encrypted

Per credential, each field marked `type: "password"` is individually encrypted. Non-secret fields (host, username, client_id) stored as plaintext.

```python
# backend/app/encryption.py
class CredentialVault:
    def encrypt_field(self, value: str) -> str:
        """Returns base64(iv:tag:ciphertext)"""
        
    def decrypt_field(self, encrypted: str) -> str:
        """Decrypts and returns plaintext"""
        
    def encrypt_credential(self, cred_data: dict, secret_fields: list) -> dict:
        """Encrypts only the secret fields, returns mixed dict"""
        
    def decrypt_credential(self, cred_data: dict, secret_fields: list) -> dict:
        """Decrypts secret fields for use in execution"""
```

### 3.3 API Exposure Rules

| API endpoint | Returns secret fields? |
|-------------|----------------------|
| `GET /credentials` | ❌ Never (list view) |
| `GET /credentials/{id}` | ❌ Never (except test endpoint) |
| `POST /credentials` | ❌ Returns masked version |
| `PUT /credentials/{id}` | ❌ Returns masked version |
| Internal executor | ✅ Yes (in-process only, never logged) |

Secret field masking in API responses:
```json
{
  "id": "abc-123",
  "name": "My Gmail",
  "type": "oauth2",
  "data": {
    "access_token": "•••••••••••",
    "refresh_token": "•••••••••••",
    "scope": "email profile"
  }
}
```

---

## 4. OAuth 2.0 Flows

### 4.1 Authorization Code Flow

**Step 1**: User clicks "Connect [Service]" in Connections page

**Step 2**: Backend creates OAuth state token:
```python
state = create_oauth_state(user_id, credential_id, redirect_url)
# Stores state in DB with 10-min expiry
```

**Step 3**: Frontend redirects to authorization URL:
```
https://accounts.google.com/oauth/authorize?
  client_id={client_id}
  &redirect_uri=https://flowholt.com/auth/oauth/callback
  &scope=email profile
  &state={state}
  &response_type=code
  &access_type=offline
```

**Step 4**: User approves in third-party service

**Step 5**: Service redirects back:
```
https://flowholt.com/auth/oauth/callback?code={code}&state={state}
```

**Step 6**: Backend exchanges code for tokens:
```python
tokens = await exchange_code_for_tokens(
    token_url=service.token_url,
    code=code,
    client_id=client_id,
    client_secret=decrypt(client_secret),
    redirect_uri=REDIRECT_URI
)
await store_encrypted_tokens(credential_id, tokens)
```

**Step 7**: Redirect user back to credentials page with success message.

### 4.2 Token Refresh

When executing a workflow with an expired OAuth token:
1. Check `token_expiry` vs current time
2. If expired (or within 60s of expiry): call refresh endpoint
3. Store new access_token + updated expiry
4. If refresh fails (token revoked): mark credential as `status: "expired"`, fail execution with message "Credential expired — please reconnect"

### 4.3 Token Refresh Flow

```python
async def get_valid_access_token(credential_id: UUID) -> str:
    cred = await decrypt_credential(credential_id)
    
    if not is_expired(cred['token_expiry']):
        return cred['access_token']
    
    # Try refresh
    new_tokens = await refresh_oauth_token(
        token_url=cred['token_url'],
        refresh_token=cred['refresh_token'],
        client_id=cred['client_id'],
        client_secret=cred['client_secret']
    )
    
    await store_encrypted_tokens(credential_id, new_tokens)
    return new_tokens['access_token']
```

### 4.4 OAuth Callback Route

```
GET /auth/oauth/callback?code={code}&state={state}
```

Error cases:
- State not found / expired → redirect to `/connections?error=oauth_state_expired`
- Code exchange failed → redirect to `/connections?error=oauth_exchange_failed`  
- Access denied by user → redirect to `/connections?error=oauth_denied`

---

## 5. Credential API

### 5.1 CRUD Endpoints

```
GET    /api/v1/credentials                    List credentials (no secret data)
POST   /api/v1/credentials                    Create credential
GET    /api/v1/credentials/{id}               Get credential (no secret data)
PUT    /api/v1/credentials/{id}               Update credential
DELETE /api/v1/credentials/{id}               Delete credential
POST   /api/v1/credentials/{id}/test          Test credential (returns pass/fail)
GET    /api/v1/credentials/{id}/usage         List workflows using this credential
POST   /api/v1/credentials/oauth/{type}/init  Start OAuth flow
GET    /auth/oauth/callback                   OAuth callback (not versioned)
```

### 5.2 Create Credential Request

```json
POST /api/v1/credentials
{
  "name": "My Gmail Account",
  "type": "google_oauth2",
  "scope": "team",
  "data": {
    "client_id": "xxxx.apps.googleusercontent.com",
    "client_secret": "GOCSPX-..."
  }
}
```

Response (200):
```json
{
  "id": "cred-abc-123",
  "name": "My Gmail Account",
  "type": "google_oauth2",
  "scope": "team",
  "status": "pending_oauth",
  "oauth_connect_url": "https://flowholt.com/auth/oauth/init?state=...",
  "created_at": "2024-01-15T14:30:00Z"
}
```

Frontend opens `oauth_connect_url` in new window to complete OAuth.

### 5.3 Credential Status Values

| Status | Description |
|--------|-------------|
| `pending_oauth` | Created, waiting for OAuth authorization |
| `connected` | Valid, ready to use |
| `expired` | OAuth token expired, needs re-authorization |
| `error` | Last test failed |
| `untested` | API key type, not yet tested |

### 5.4 Test Credential

```
POST /api/v1/credentials/{id}/test
```

Response:
```json
{
  "success": true,
  "message": "Connected as john@gmail.com",
  "latency_ms": 234
}
```

Or on failure:
```json
{
  "success": false,
  "error": "401 Unauthorized: Invalid API key",
  "latency_ms": 120
}
```

Each credential type has a test function:
```python
CREDENTIAL_TEST_FUNCTIONS = {
    "google_oauth2": test_google_oauth,  # calls /userinfo
    "stripe": test_stripe,               # calls /v1/balance
    "openai": test_openai,               # calls /models
    "generic_api_key": test_generic_http,  # calls baseUrl/test or /
}
```

---

## 6. Per-Node Credential Picker

### 6.1 How Nodes Use Credentials

Each node type declares which credential type it needs:
```python
# In node definition
class GmailSendEmailNode:
    credential_type = "google_oauth2"
    credential_required = True
```

The inspector renders a `CredentialPickerField` that only shows credentials of type `google_oauth2`.

### 6.2 Credential Picker UI

```
Connection *
┌─────────────────────────────────────────────────────────┐
│ [john@gmail.com (Google OAuth) ▼]  [+ Create]  [Test ✓] │
└─────────────────────────────────────────────────────────┘
```

Dropdown options:
```
── Team credentials ──────────────
✓ john@gmail.com (Connected)
✓ marketing@company.com (Connected)
⚠ jane@gmail.com (Expired)
── My credentials ────────────────
✓ personal-gmail (Connected)
── Org credentials ───────────────
(none)
```

**Status indicators in dropdown**:
- ✓ Connected (green)
- ⚠ Expired (yellow)
- ✗ Error (red)
- ○ Untested (gray)

### 6.3 Quick Re-auth from Inspector

When selected credential is expired:
```
Connection *
[jane@gmail.com ▼] [+ Create]
⚠ This connection is expired.
[Reconnect →]
```

"Reconnect →" opens OAuth flow in new tab/window.

---

## 7. Credential Sharing Model

### 7.1 Visibility Rules

| Scope | Who can use | Who can edit | Who can delete |
|-------|-------------|--------------|----------------|
| Personal | Creator only | Creator only | Creator only |
| Team | All team members | Creator + admins | Creator + admins |
| Org | All org members | Org admins only | Org admins only |

### 7.2 Sharing Controls

On credential edit modal:
```
Visibility
● Personal (only you)
○ Team (all team members can use in workflows)
○ Organization (all org members can use)
```

**Important**: Changing from Team → Personal is blocked if other users' workflows use the credential. Must first transfer ownership or disconnect from workflows.

### 7.3 Credential Usage Page

```
GET /api/v1/credentials/{id}/usage
```

Returns list of workflows using this credential:
```json
[
  {"workflow_id": "wf-1", "workflow_name": "Send Weekly Report", "owner": "jane@co.com"},
  {"workflow_id": "wf-2", "workflow_name": "Sync CRM", "owner": "john@co.com"}
]
```

Shown in UI as "Used by N workflows" link that opens detail panel.

---

## 8. UI Surfaces

### 8.1 Connections Page (`/connections`)

See spec 74 §7 for full layout. Key interactions:

**Add Connection button** → opens 3-step modal:

**Step 1 — Choose app**:
```
┌─ Choose a service ────────────────────────────────────────┐
│ [🔍 Search services...]                                  │
│                                                           │
│ POPULAR                                                   │
│ [Gmail] [Slack] [Google Sheets] [Notion] [Stripe] [...]  │
│                                                           │
│ ALL SERVICES (A-Z)                                        │
│ [Airtable] [Asana] [AWS] [Azure] ...                     │
└───────────────────────────────────────────────────────────┘
```

**Step 2 — Configure auth** (varies by type):
```
┌─ Connect Gmail ─────────────────────────────────────────┐
│ [Gmail logo]                                            │
│                                                         │
│ Name: [john@gmail.com]                                  │
│                                                         │
│ [Connect with Google]                                   │
│   ↑ Opens Google OAuth flow                            │
│                                                         │
│ ─── OR configure manually ────────────────────────────  │
│ Client ID: [_______________________________]            │
│ Client Secret: [____________________________]           │
└─────────────────────────────────────────────────────────┘
```

**Step 3 — Test & save**:
```
┌─ Connection ready ──────────────────────────────────────┐
│ ✓ Connected as john@gmail.com                          │
│                                                         │
│ Name: [john@gmail.com]                                  │
│ Scope: ● Team  ○ Personal                              │
│                                                         │
│ [Done]                                                  │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Connection Card Actions (⋮ Menu)

- Edit (rename, change scope)
- Reconnect (re-run OAuth)
- Test connection
- View usage (which workflows use this)
- Transfer to another team member
- Delete (with confirmation if in use)

### 8.3 Credential Detail Page (`/connections/{id}`)

```
┌─ john@gmail.com ────────────────────────────────────────┐
│ [Gmail logo]  Google OAuth 2.0  ✓ Connected            │
│                                                         │
│ [Test Connection]  [Reconnect]  [Delete]               │
│                                                         │
│ DETAILS                                                 │
│ Name:       john@gmail.com                              │
│ Type:       Google OAuth 2.0                            │
│ Scope:      Team                                        │
│ Created by: John Smith                                  │
│ Created:    2024-01-10                                  │
│ Last used:  2 hours ago                                 │
│                                                         │
│ USED BY (5 workflows)                                   │
│ ● Send Weekly Report  (John)                           │
│ ● Email Notifications  (Jane)                          │
│ ...                                                     │
│                                                         │
│ AUTH DETAILS (masked)                                   │
│ Token scope: email profile calendar.readonly           │
│ Expires:     2024-02-15 (auto-refreshed)               │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Backend Implementation

### 9.1 Database Schema

```sql
CREATE TABLE credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,       -- "google_oauth2", "api_key", etc.
    scope VARCHAR(20) DEFAULT 'team', -- "personal" | "team" | "org"
    status VARCHAR(20) DEFAULT 'untested', -- "connected" | "expired" | "error" | "untested"
    data JSONB NOT NULL DEFAULT '{}', -- encrypted secret fields mixed with plain fields
    metadata JSONB DEFAULT '{}',      -- non-secret: token_expiry, scope, etc.
    last_tested_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credentials_workspace ON credentials(workspace_id);
CREATE INDEX idx_credentials_type ON credentials(type);
```

### 9.2 Credential Registry

```python
# backend/app/credential_registry.py

CREDENTIAL_TYPES = {
    "google_oauth2": {
        "label": "Google OAuth 2.0",
        "category": "Google",
        "logo": "google",
        "auth_type": "oauth2",
        "secret_fields": ["access_token", "refresh_token", "client_secret"],
        "required_fields": ["client_id", "client_secret"],
        "oauth_config": {
            "auth_url": "https://accounts.google.com/oauth/authorize",
            "token_url": "https://oauth2.googleapis.com/token",
            "scopes": ["email", "profile"],
        },
        "test_fn": "test_google_oauth2",
    },
    "api_key_header": {
        "label": "API Key (Header)",
        "category": "Generic",
        "auth_type": "api_key",
        "secret_fields": ["api_key"],
        "required_fields": ["api_key", "header_name"],
        "test_fn": None,  # user tests manually
    },
    # ... 50+ more
}
```

### 9.3 Executor Integration

```python
# backend/app/executor.py

async def execute_node(node: WorkflowNode, inputs: dict) -> dict:
    if node.credential_id:
        # Get decrypted credential
        cred = await credential_vault.decrypt_credential(node.credential_id)
        
        # If OAuth, ensure token is fresh
        if cred['type'].endswith('_oauth2'):
            cred = await refresh_if_needed(cred)
        
        # Inject auth into node context
        node_context = build_node_context(node, cred)
    else:
        node_context = build_node_context(node, None)
    
    return await NODE_HANDLERS[node.type](node_context, inputs)
```

---

## 10. Security Considerations

### 10.1 Credential Access Logging

Every time a credential is used in execution:
```python
await audit_log({
    "event": "credential.used",
    "credential_id": cred_id,
    "workflow_id": wf_id,
    "execution_id": exec_id,
    "user_id": None  # system, not user action
})
```

### 10.2 Credential Deletion Guard

Before deleting a credential, check if any active workflows use it:
```python
if await credential_has_active_users(credential_id):
    raise HTTPException(409, {
        "error": "credential_in_use",
        "message": "This credential is used by active workflows. Deactivate them first.",
        "workflows": [...] 
    })
```

### 10.3 Credential Rotation

No automatic rotation (complexity). User must:
1. Create new credential
2. Update workflows to use new credential
3. Delete old credential

Future feature: bulk "replace credential" in all workflows at once.

### 10.4 Key Rotation (Encryption Key)

If `CREDENTIAL_ENCRYPTION_KEY` needs to be rotated:
1. Run `python backend/scripts/rotate_encryption_key.py --old-key OLD --new-key NEW`
2. Script re-encrypts all secret fields with new key
3. Update env var, redeploy

The rotation script must be available but not automatically triggered.
