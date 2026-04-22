# 68 · FlowHolt: Make API Complete Entity Model & FlowHolt Design Decisions

> **Purpose**: Synthesize the complete Make.com API entity model from raw API reference docs and map every entity to FlowHolt design decisions. This is the definitive API model reference for FlowHolt implementation.
> **Audience**: Junior AI model implementing FlowHolt — assume reader knows nothing about Make.com internals. Every term is explained.
> **Source**: Make Developer Hub API reference (scraped April 2026). Direct source files are in `research/competitor-data/make-docs/api-documentation/api-reference/`.
> **Last updated**: 2026 (generated from source scan)

---

## Cross-Reference Map

| Section | Source File | Notes |
|---------|------------|-------|
| §2 Scenario | `api-reference/scenarios.md` | 700+ lines, all CRUD + special ops |
| §3 Blueprint | `api-reference/scenarios/blueprints.md` (dir) | Blueprint get/update |
| §4 Execution Log | `api-reference/scenarios/logs.md` (dir) | Scenario run history |
| §5 Connection | `api-reference/connections.md` | Auth + scope model |
| §6 Data Store | `api-reference/data-stores.md` | Store CRUD |
| §7 Data Store Record | `api-reference/data-stores/data.md` | Record CRUD |
| §8 Hook (Webhook) | `api-reference/hooks.md` | Webhook management |
| §9 Hook Incoming | `api-reference/hooks/incomings.md` | Incoming webhook data queue |
| §10 Incomplete Execution | `api-reference/incomplete-executions.md` | DLQ (dead-letter queue) |
| §11 Organization | `api-reference/organizations.md` | Org CRUD, license |
| §12 Team | `api-reference/teams.md` | Team CRUD + team variables |
| §13 User | `api-reference/users.md` | User management |
| §14 Custom Function | `api-reference/custom-functions.md` | JS functions for expressions |
| §15 Key | `api-reference/keys.md` | API keys / credentials |
| §16 Template | `api-reference/templates.md` | Scenario templates |
| §17 AI Agent | `api-reference/ai-agents.md` | Make AI agents (beta) |
| §18 Audit Log | `api-reference/audit-logs.md` | Event audit trail |
| §19 Credential Request | `api-reference/credential-requests.md` | OAuth credential requests |
| §20 Notification | `api-reference/notifications.md` | User notifications |
| §21 Analytics | `api-reference/analytics.md` | Usage analytics |
| §22 SDK App | `api-reference/sdk-apps.md` | Custom app installs |
| §23 Enums | `api-reference/enums.md` | Lookup values |
| §24 Custom Property | `api-reference/custom-properties.md` | Custom metadata fields |

---

## 1. API Overview

### 1.1 Authentication Model

Make's API uses **token-based authentication**. Every API call must include:

```
Authorization: Token your-api-token
```

- Tokens are created in the user's profile under "API access" tab.
- Each token has **scopes** — a list of permissions that control what the token can do.
- Tokens can be created with specific scopes (e.g., `scenarios:read`, `teams:write`).
- There is also an **MCP token** (special token for MCP server connections with `mcp:use` scope).
- White-label instances also support **JWT authorization** from external IdPs.

**FlowHolt Decision**: Use the same `Authorization: Token <token>` pattern. Token scopes map to FlowHolt's permission model. Add a separate `mcp:use` scope for MCP server access.

### 1.2 Base URL

Make uses zone-based URLs: `https://<MAKE_ZONE>/api/v2/` (e.g., `https://eu1.make.com/api/v2/`).

**FlowHolt Decision**: Use `https://api.flowholt.com/api/v1/` or `/api/v1/` for self-hosted. No zone system — single deployment. Version in URL path (v1 initially).

### 1.3 Pagination, Sorting, Filtering

All list endpoints support:

| Parameter | Type | Description |
|-----------|------|-------------|
| `pg[offset]` | integer | Number of records to skip |
| `pg[limit]` | integer | Max records to return (default varies per endpoint) |
| `pg[sortBy]` | string | Column to sort by |
| `pg[sortDir]` | enum | `asc` or `desc` |
| `cols[]` | string[] | Columns to include in response (column selection) |

**FlowHolt Decision**: Adopt same pattern. Map to FastAPI query params: `offset`, `limit`, `sort_by`, `sort_dir`. Use `fields[]` instead of `cols[]` for clarity.

### 1.4 Permission Scopes Overview

Make uses **resource:action** scopes. Every API operation requires a specific scope. Scopes are assigned when creating an API token.

Complete scope taxonomy from Make API:

| Scope | Grants Access To |
|-------|----------------|
| `scenarios:read` | List, get scenario details, get trigger details |
| `scenarios:write` | Create, update, delete, clone, activate/deactivate, run scenario |
| `connections:read` | List, get connections |
| `connections:write` | Create, update, delete, test connections |
| `hooks:read` | List, get webhooks |
| `hooks:write` | Create, update, delete, enable/disable webhooks |
| `datastores:read` | List, get data stores and records |
| `datastores:write` | Create, update, delete data stores and records |
| `dlqs:read` | List incomplete executions |
| `dlqs:write` | Delete, retry incomplete executions |
| `organizations:read` | List user organizations |
| `organizations:write` | Create organizations (admin) |
| `teams:read` | List, get teams |
| `teams:write` | Create, update, delete teams |
| `team-variables:read` | List team variables |
| `team-variables:write` | Create, update, delete team variables |
| `users:read` | List, get users |
| `users:write` | Invite, update, remove users |
| `function:read` | List custom functions |
| `functions:write` | Create, update, delete custom functions |
| `templates:read` | List, get templates |
| `templates:write` | Create, update, delete templates |
| `ai-agents:read` | List, get AI agents |
| `ai-agents:write` | Create, update, delete, run AI agents |
| `notifications:read` | List notifications |
| `notifications:write` | Mark read, delete notifications |
| `organization:read` | Get organization details, audit logs |
| `admin:write` | Admin-only operations (create org, etc.) |
| `mcp:use` | Use MCP server (run scenarios as tools) |

**FlowHolt Decision**: Adopt same resource:action scope model. Map to FlowHolt entities (scenarios → workflows, hooks → webhooks, dlqs → incomplete_executions, datastores → data_stores). Add `mcp:use`, `agent:read/write`, `vault:read/write`.

---

## 2. Entity: Scenario

### 2.1 Make Model Overview

A **Scenario** in Make is equivalent to a **Workflow** in FlowHolt. It is the primary automation unit: a series of modules (nodes) that process data.

### 2.2 Scenario Fields

| Field | Type | Description | Nullable |
|-------|------|-------------|----------|
| `id` | integer | Unique scenario ID | No |
| `name` | string | Scenario name (not unique, max 120 chars) | No |
| `teamId` | integer | Owning team ID | No |
| `folderId` | integer | Folder the scenario lives in | Yes |
| `isActive` | boolean | Whether scenario is enabled (scheduled runs happen) | No |
| `isLinked` | boolean | Whether scenario is linked to another | No |
| `isInvalid` | boolean | Whether scenario has configuration errors | No |
| `isLocked` | boolean | Whether scenario is locked for editing | No |
| `isConcept` | boolean | Whether this is a draft/concept scenario | No |
| `blueprint` | string (JSON serialized) | Full node graph + settings definition | Yes (not in list response) |
| `scheduling` | string (JSON serialized) | When/how scenario runs (schedule config) | Yes |
| `lastEdit` | ISO datetime | Last modification timestamp | Yes |
| `created` | ISO datetime | Creation timestamp | No |
| `createdByUserName` | string | Username of creator | Yes |
| `updatedByUserName` | string | Username of last editor | Yes |
| `usedPackages` | string[] | App integrations used in scenario | No |
| `type` | enum | `scenario` or `tool` | No |
| `nextExec` | ISO datetime | Next scheduled execution time | Yes |
| `description` | string | User-provided description | Yes |
| `inputs` | object | MCP/tool input parameter definitions | Yes |
| `outputs` | object | MCP/tool output definitions | Yes |
| `organizationId` | integer | Organization ID (via team) | No |

### 2.3 Scenario Operations

| Operation | HTTP Method | Path | Scope Required | Key Params |
|-----------|------------|------|---------------|-----------|
| List scenarios | GET | `/scenarios` | `scenarios:read` | `teamId` OR `organizationId`, `folderId`, `isActive`, `isConcept`, `type` |
| Create scenario | POST | `/scenarios` | `scenarios:write` | `blueprint` (string), `teamId`, `scheduling` (string), `folderId`, `templateId` |
| Get scenario | GET | `/scenarios/{scenarioId}` | `scenarios:read` | `scenarioId`, optional `cols[]` |
| Update scenario | PATCH | `/scenarios/{scenarioId}` | `scenarios:write` | `blueprint` (string), `scheduling` (string), `folderId`, `name` |
| Delete scenario | DELETE | `/scenarios/{scenarioId}` | `scenarios:write` | `scenarioId` |
| Clone scenario | POST | `/scenarios/{scenarioId}/clone` | `scenarios:write` | `teamId`, `name`, `connections[]`, `hooks[]`, `dataStores[]`, `notAnalyze`, `confirmed` |
| Activate scenario | POST | `/scenarios/{scenarioId}/activate` | `scenarios:write` | None (sets isActive=true) |
| Deactivate scenario | POST | `/scenarios/{scenarioId}/deactivate` | `scenarios:write` | None (sets isActive=false) |
| Run scenario | POST | `/scenarios/{scenarioId}/run` | `scenarios:write` | `data` (input payload) |
| Get trigger details | GET | `/scenarios/{scenarioId}/trigger` | `scenarios:read` | Returns trigger module config |
| Check module data | GET | `/scenarios/{scenarioId}/module-data` | `scenarios:write` | `moduleId` |
| List scenario folders | GET | `/scenarios-folders` | `scenarios:read` | `teamId` |
| Create scenario folder | POST | `/scenarios-folders` | `scenarios:write` | `name`, `teamId` |

### 2.4 FlowHolt Design Decision

**Mapping**: Scenario → `Workflow` in FlowHolt.

| Make Field | FlowHolt Field | Change |
|-----------|---------------|--------|
| `id` (integer) | `id` (UUID) | Use UUIDs for global uniqueness |
| `teamId` | `workspace_id` | FlowHolt uses Workspace as lowest container |
| `folderId` | `folder_id` | Same concept |
| `isActive` | `is_active` | Same |
| `isLocked` | `is_locked` | Same |
| `blueprint` | `definition` | Store as JSONB in PostgreSQL (not string) |
| `scheduling` | `schedule` | Store as JSONB |
| `isConcept` | `is_draft` | Rename for clarity |
| `type: 'tool'` | `is_mcp_tool: boolean` | Explicit boolean for MCP tool designation |
| `inputs`/`outputs` | `mcp_inputs`/`mcp_outputs` | MCP tool I/O schema |
| `usedPackages` | `used_integrations` | Derived field |
| N/A | `version` | FlowHolt tracks version history |
| N/A | `tags` | FlowHolt adds tagging |
| N/A | `org_id` | FlowHolt stores org_id directly |

**Additional FlowHolt Operations**:
- `GET /workflows/{id}/versions` — Version history
- `POST /workflows/{id}/versions/{versionId}/restore` — Restore version
- `POST /workflows/{id}/duplicate` — Duplicate within same workspace
- `GET /workflows/{id}/diff/{versionId}` — Visual diff between versions
- `PUT /workflows/{id}/publish` — Publish/deploy workflow
- `GET /workflows/{id}/stats` — Execution statistics

---

## 3. Entity: Scenario Blueprint

### 3.1 Make Model

A **Blueprint** is the full definition of a scenario's node graph — all modules, their configurations, connections between them, and execution order.

Key facts:
- Retrieved separately from scenario list (not included in list for performance)
- Stored as a **string** in Make API (JSON serialized, not a nested object) to save bandwidth
- Contains: modules array, routes (connections between modules), metadata
- Can be imported/exported for backup or cross-team cloning

### 3.2 Blueprint Operations

| Operation | HTTP Method | Path | Scope | Notes |
|-----------|------------|------|-------|-------|
| Get blueprint | GET | `/scenarios/{scenarioId}/blueprint` | `scenarios:read` | Returns blueprint as string |
| Update blueprint | PUT | `/scenarios/{scenarioId}/blueprint` | `scenarios:write` | Full blueprint replacement |

### 3.3 Blueprint Schema (Simplified)

```json
{
  "name": "My Scenario",
  "modules": [
    {
      "id": 1,
      "module": "gateway:CustomWebHook",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": { "x": 0, "y": 0 }
      }
    },
    {
      "id": 2,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {
        "url": "https://example.com/api",
        "method": "POST"
      },
      "mapper": {
        "body": "{{1.data}}"
      },
      "metadata": {
        "designer": { "x": 200, "y": 0 }
      }
    }
  ],
  "routes": [
    { "id": 1, "flow": [2] }
  ],
  "metadata": {
    "version": 1,
    "scenario": { "roundtrips": 1, "maxErrors": 3, "autoCommit": true }
  }
}
```

### 3.4 FlowHolt Design Decision

**Mapping**: Blueprint → `WorkflowDefinition` (JSONB column in `workflows` table).

- FlowHolt stores the definition **as JSONB** (not a string) directly in the workflow record
- Node coordinates (`x`, `y`) stored in `definition.nodes[].position`
- FlowHolt uses **n8n-style node schema** (not Make's module schema) for better expression support
- Separate `workflow_versions` table stores historical blueprints as snapshots

---

## 4. Entity: Scenario Execution Log

### 4.1 Make Model

Execution logs record each run of a scenario. Also called "history" or "runs".

### 4.2 Execution Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Execution ID |
| `scenarioId` | integer | Parent scenario ID |
| `status` | enum | `success`, `error`, `warning`, `incomplete` |
| `duration` | number | Execution time in milliseconds |
| `operations` | integer | Number of Make operations consumed |
| `transfer` | integer | Data transferred in bytes |
| `startedAt` | ISO datetime | Execution start time |
| `finishedAt` | ISO datetime | Execution end time |
| `moduleItems` | object[] | Per-module input/output items |

### 4.3 Execution Log Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List scenario logs | GET | `/scenarios/{scenarioId}/logs` | `scenarios:read` |
| Get execution detail | GET | `/scenarios/{scenarioId}/logs/{executionId}` | `scenarios:read` |

### 4.4 FlowHolt Design Decision

**Mapping**: Execution Log → `ExecutionRun` entity.

```sql
CREATE TABLE execution_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    workspace_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending','running','success','error','warning','incomplete','cancelled')),
    trigger_type TEXT, -- manual, schedule, webhook, mcp_tool
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    duration_ms INTEGER,
    operations_used INTEGER DEFAULT 0,
    data_transferred_bytes BIGINT DEFAULT 0,
    error_message TEXT,
    error_node_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE execution_node_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_run_id UUID NOT NULL REFERENCES execution_runs(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    node_name TEXT,
    status TEXT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    input_items JSONB,
    output_items JSONB,
    error JSONB,
    retry_count INTEGER DEFAULT 0
);
```

---

## 5. Entity: Connection

### 5.1 Make Model

A **Connection** in Make is a stored credential/auth config for a third-party service. Every app module that requires auth uses a connection.

### 5.2 Connection Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Connection ID |
| `name` | string | Display name (max 128 chars) |
| `accountName` | string | Connection type identifier (app code, e.g., `airtable2`) |
| `accountLabel` | string | Human-readable app name |
| `packageName` | string | App package identifier |
| `teamId` | integer | Owning team |
| `organizationId` | integer | Owning organization |
| `expire` | ISO datetime | Token expiry (for OAuth) |
| `metadata` | object | Auth-specific metadata |
| `theme` | string | App color theme |
| `upgradeable` | boolean | Whether connection can have scopes upgraded |
| `scopesCnt` | integer | Number of granted OAuth scopes |
| `scoped` | boolean | Whether scope check passed (from query param) |
| `accountType` | string | Auth type |
| `editable` | boolean | Whether connection params can be edited |
| `uid` | string | Unique identifier string |
| `connectedSystemId` | integer | External system ID |

### 5.3 Connection Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List connections | GET | `/connections` | `connections:read` |
| Create connection | POST | `/connections` | `connections:write` |
| Get connection | GET | `/connections/{connectionId}` | `connections:read` |
| Update connection | PATCH | `/connections/{connectionId}` | `connections:write` |
| Delete connection | DELETE | `/connections/{connectionId}` | `connections:write` |
| List updatable params | GET | `/connections/{connectionId}/parameters` | `connections:read` |
| Update connection data | POST | `/connections/{connectionId}/set-data` | `connections:write` |
| Test connection | POST | `/connections/{connectionId}/test` | `connections:read` |
| Verify connection | GET | `/connections/{connectionId}/verify` | `connections:read` |

### 5.4 FlowHolt Design Decision

**Mapping**: Connection → `Credential` in FlowHolt.

| Make Concept | FlowHolt Concept | Notes |
|-------------|-----------------|-------|
| Connection | Credential | Same concept; FlowHolt name = "credential" |
| `accountName` | `integration_type` | Which integration this credential is for |
| `accountLabel` | `integration_name` | Display name |
| `teamId` | `workspace_id` | Team → Workspace mapping |
| `metadata` | `encrypted_data` | Store encrypted using Supabase Vault or AES-256-GCM |
| `expire` | `expires_at` | OAuth token expiry for refresh |
| `upgradeable` | `needs_reauth` | Prompt user to reconnect |

**Additional FlowHolt fields**:
- `credential_type` — enum: `oauth2`, `api_key`, `basic_auth`, `jwt`, `custom`
- `is_shared` — boolean: shared across workspace
- `created_by` — UUID reference to user

**FlowHolt API endpoints**:
```
GET    /credentials                 -- list (workspace scoped)
POST   /credentials                 -- create
GET    /credentials/{id}            -- get details
PATCH  /credentials/{id}            -- update
DELETE /credentials/{id}            -- delete
POST   /credentials/{id}/test       -- test connectivity
POST   /credentials/oauth2/authorize -- initiate OAuth2 flow
GET    /credentials/oauth2/callback  -- OAuth2 callback
POST   /credentials/{id}/refresh    -- refresh OAuth2 token
```

---

## 6. Entity: Data Store

### 6.1 Make Model

A **Data Store** is a built-in database per team. It stores structured data between scenario runs. Think of it as a simple key-value + table store.

### 6.2 Data Store Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Data store ID |
| `name` | string | Display name (max 128 chars) |
| `teamId` | integer | Owning team |
| `records` | integer | Current record count |
| `size` | number | Current storage size in bytes |
| `maxSize` | number | Maximum size limit in MB |
| `datastructureId` | integer | Linked data structure ID (schema definition) |

### 6.3 Data Store Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List data stores | GET | `/data-stores` | `datastores:read` |
| Create data store | POST | `/data-stores` | `datastores:write` |
| Get data store | GET | `/data-stores/{dataStoreId}` | `datastores:read` |
| Delete data stores | DELETE | `/data-stores` (batch) | `datastores:write` |
| Update data store | PATCH | `/data-stores/{dataStoreId}` | `datastores:write` |

### 6.4 FlowHolt Design Decision

**Mapping**: Data Store → `DataStore` in FlowHolt.

```sql
CREATE TABLE data_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    name TEXT NOT NULL,
    description TEXT,
    max_size_mb INTEGER DEFAULT 10,
    current_size_bytes BIGINT DEFAULT 0,
    record_count INTEGER DEFAULT 0,
    schema_definition JSONB,  -- data structure / schema
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Entity: Data Store Record

### 7.1 Make Model

Records are the individual rows in a data store.

### 7.2 Data Store Record Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List records | GET | `/data-stores/{dataStoreId}/data` | `datastores:read` |
| Add record | POST | `/data-stores/{dataStoreId}/data` | `datastores:write` |
| Get record | GET | `/data-stores/{dataStoreId}/data/{key}` | `datastores:read` |
| Update record | PUT | `/data-stores/{dataStoreId}/data/{key}` | `datastores:write` |
| Delete record | DELETE | `/data-stores/{dataStoreId}/data/{key}` | `datastores:write` |
| Delete all records | DELETE | `/data-stores/{dataStoreId}/data` | `datastores:write` |

### 7.3 Record Schema

```json
{
  "key": "user_123",
  "data": {
    "email": "user@example.com",
    "count": 42,
    "tags": ["premium", "active"]
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### 7.4 FlowHolt Design Decision

```sql
CREATE TABLE data_store_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_store_id UUID NOT NULL REFERENCES data_stores(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(data_store_id, key)
);
CREATE INDEX idx_data_store_records_key ON data_store_records(data_store_id, key);
```

---

## 8. Entity: Hook (Webhook)

### 8.1 Make Model

**Hooks** in Make = webhooks + mailhooks. They are URL endpoints that receive incoming HTTP requests or emails and trigger a scenario.

Two native types:
- `gateway-webhook` — HTTP webhook endpoint
- `gateway-mailhook` — Email-based trigger

### 8.2 Hook Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Hook ID |
| `name` | string | Display name (max 128 chars) |
| `teamId` | integer | Owning team |
| `type` | string | Hook type (e.g., `gateway-webhook`) |
| `url` | string | The webhook URL to call |
| `scenarioId` | integer | Assigned scenario (null if unassigned) |
| `connectionId` | integer | Associated connection (for app webhooks) |
| `formId` | integer | Associated form ID |
| `method` | boolean | Whether to include HTTP method in body |
| `headers` | boolean | Whether to include headers in body |
| `stringify` | boolean | Whether to stringify JSON payloads |
| `isActive` | boolean | Whether hook is enabled |
| `theme` | string | App color |
| `packageName` | string | App identifier |

### 8.3 Hook Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List hooks | GET | `/hooks` | `hooks:read` |
| Create hook | POST | `/hooks` | `hooks:write` |
| Get hook | GET | `/hooks/{hookId}` | `hooks:read` |
| Update hook | PATCH | `/hooks/{hookId}` | `hooks:write` |
| Delete hook | DELETE | `/hooks/{hookId}` | `hooks:write` |
| Enable hook | POST | `/hooks/{hookId}/enable` | `hooks:write` |
| Disable hook | POST | `/hooks/{hookId}/disable` | `hooks:write` |
| Ping hook | POST | `/hooks/{hookId}/ping` | `hooks:write` |

### 8.4 FlowHolt Design Decision

**Mapping**: Hook → `WebhookEndpoint` in FlowHolt.

```sql
CREATE TABLE webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    workflow_id UUID REFERENCES workflows(id),
    name TEXT NOT NULL,
    url_path TEXT NOT NULL UNIQUE,  -- random slug
    full_url TEXT NOT NULL,         -- computed: base_url + url_path
    type TEXT DEFAULT 'http',       -- http, email, form
    is_active BOOLEAN DEFAULT TRUE,
    include_method BOOLEAN DEFAULT FALSE,
    include_headers BOOLEAN DEFAULT FALSE,
    stringify_payload BOOLEAN DEFAULT FALSE,
    credential_id UUID REFERENCES credentials(id),
    secret_key TEXT,               -- HMAC secret
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Entity: Hook Incoming Data (Webhook Queue)

### 9.1 Make Model

When a webhook receives data before a scenario processes it, Make queues the incoming payloads. These are listed via the "incomings" endpoint.

### 9.2 Incomings Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List incoming data | GET | `/hooks/{hookId}/incomings` | `hooks:read` |
| Delete incoming items | DELETE | `/hooks/{hookId}/incomings` | `hooks:write` |

### 9.3 FlowHolt Design Decision

**Mapping**: Hook Incomings → `WebhookQueue` entries in FlowHolt.

```sql
CREATE TABLE webhook_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id),
    received_at TIMESTAMPTZ DEFAULT NOW(),
    http_method TEXT,
    headers JSONB,
    query_params JSONB,
    body JSONB,
    status TEXT DEFAULT 'pending',  -- pending, processing, processed, failed
    processed_at TIMESTAMPTZ,
    execution_run_id UUID REFERENCES execution_runs(id)
);
```

---

## 10. Entity: Incomplete Execution

### 10.1 Make Model

When a scenario errors out, Make can (optionally) save the failed execution as an "incomplete execution" (stored in what is internally called DLQ = dead-letter queue). Users can then retry or skip these.

The feature must be enabled per-scenario in settings.

### 10.2 Incomplete Execution Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Incomplete execution ID |
| `scenarioId` | integer | Parent scenario |
| `data` | object | The data at the point of failure |
| `reason` | string | Error message / failure reason |
| `attemptedAt` | ISO datetime | When it failed |
| `moduleId` | integer | Which module failed |

### 10.3 Incomplete Execution Operations

| Operation | HTTP Method | Path | Scope | Notes |
|-----------|------------|------|-------|-------|
| List incomplete | GET | `/scenarios/{scenarioId}/incomplete-executions` (GET `/dlqs/?scenarioId=`) | `dlqs:read` | |
| Delete incomplete | DELETE | `/dlqs/{scenarioId}` | `dlqs:write` | Can delete specific IDs, or all with `"all":true` + `confirmed=true` |
| Retry incomplete | POST | `/dlqs/{incompleteId}/retry` | `dlqs:write` | Retry from failure point |

### 10.4 FlowHolt Design Decision

```sql
CREATE TABLE incomplete_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    workspace_id UUID NOT NULL,
    failed_at TIMESTAMPTZ NOT NULL,
    failed_node_id TEXT,
    failure_reason TEXT,
    execution_state JSONB,  -- full execution context at time of failure
    status TEXT DEFAULT 'waiting',  -- waiting, retrying, resolved, discarded
    retry_count INTEGER DEFAULT 0,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. Entity: Organization

### 11.1 Make Model

An **Organization** is the top-level container in Make. It contains teams, which contain scenarios. Each organization has a license (plan) attached.

### 11.2 Organization Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Organization ID |
| `name` | string | Org name (only letters, numbers, select special chars) |
| `countryId` | integer | Country (from /enums/countries) |
| `timezoneId` | integer | Timezone |
| `zone` | string | Make hosting zone (e.g., `eu1`) |
| `license` | object | Plan/license details including feature flags |
| `serviceName` | string | Custom branding name (white-label) |
| `isPaused` | boolean | Whether org is paused (billing issue) |
| `externalId` | string | External ID for white-label |
| `teams` | object[] | Embedded team list |
| `tfaEnforced` | boolean | Whether 2FA is required for all users |
| `productName` | string | White-label product name |

**License object fields** (from `GET /organizations/{id}` with `cols[]=license`):
- `customFunctions: boolean` — Access to custom functions feature
- `customVariables: boolean` — Access to team variables feature
- `operations: integer` — Monthly operation limit
- `transfer: integer` — Monthly data transfer limit (bytes)
- `users: integer` — Max users
- `teams: integer` — Max teams
- `scenarios: integer` — Max scenarios

### 11.3 Organization Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List user orgs | GET | `/organizations` | `organizations:read` |
| Create org | POST | `/organizations` | `admin:write` + `organizations:write` |
| Get org | GET | `/organizations/{organizationId}` | `organizations:read` |
| Update org | PATCH | `/organizations/{organizationId}` | `organizations:write` |
| Delete org | DELETE | `/organizations/{organizationId}` | `organizations:write` |
| List org users | GET | `/organizations/{organizationId}/users` | `users:read` |
| Invite org user | POST | `/organizations/{organizationId}/users` | `users:write` |
| Remove org user | DELETE | `/organizations/{organizationId}/users/{userId}` | `users:write` |
| Update org user role | PATCH | `/organizations/{organizationId}/users/{userId}` | `users:write` |

### 11.4 FlowHolt Design Decision

**Mapping**: Organization → `Organization` in FlowHolt (same concept).

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    country_code TEXT,
    timezone TEXT DEFAULT 'UTC',
    plan_id UUID REFERENCES plans(id),
    is_paused BOOLEAN DEFAULT FALSE,
    tfa_enforced BOOLEAN DEFAULT FALSE,
    external_id TEXT,              -- for white-label
    branding JSONB,                -- logo, colors, custom domain
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**FlowHolt adds**: `slug` (URL-safe name), `branding` (white-label config), `settings` (feature flags).

---

## 12. Entity: Team

### 12.1 Make Model

A **Team** is a container within an Organization. Teams hold scenarios, connections, data stores, webhooks, and team-level variables.

### 12.2 Team Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Team ID |
| `name` | string | Team name |
| `organizationId` | integer | Parent org |
| `activeScenarios` | integer | Count of active scenarios |
| `activeApps` | integer | Count of apps in use |
| `operations` | integer | Operations used this period |
| `transfer` | integer | Data transferred this period |
| `centicredits` | integer | Credits used |
| `operationsLimit` | integer | Team-level operation limit |
| `transferLimit` | integer | Team-level transfer limit |
| `consumedOperations` | integer | Total consumed operations |
| `consumedTransfer` | integer | Total consumed transfer |
| `isPaused` | boolean | Team paused (hit limit) |
| `consumedCenticredits` | integer | Credits consumed |

### 12.3 Team Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List teams | GET | `/teams` | `teams:read` |
| Create team | POST | `/teams` | `teams:write` |
| Get team | GET | `/teams/{teamId}` | `teams:read` |
| Delete team | DELETE | `/teams/{teamId}` | `teams:write` |
| Update team | PATCH | `/teams/{teamId}` | `teams:write` |
| List team variables | GET | `/teams/{teamId}/variables` | `team-variables:read` |
| Create team variable | POST | `/teams/{teamId}/variables` | `team-variables:write` |
| Update team variable | PATCH | `/teams/{teamId}/variables/{variableId}` | `team-variables:write` |
| Delete team variable | DELETE | `/teams/{teamId}/variables/{variableId}` | `team-variables:write` |
| List team users | GET | `/teams/{teamId}/users` | `users:read` |
| Invite team user | POST | `/teams/{teamId}/users` | `users:write` |
| Remove team user | DELETE | `/teams/{teamId}/users/{userId}` | `users:write` |

### 12.4 Team Variable Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Variable ID |
| `name` | string | Variable name |
| `value` | any | Variable value (can be any scalar) |
| `teamId` | integer | Owning team |
| `description` | string | Optional description |

**Note**: Team variables require `customVariables: true` in the org license to create custom ones. Otherwise only system variables are available.

### 12.5 FlowHolt Design Decision

**Mapping**: Team → `Team` + `Workspace` split.

FlowHolt uses a more granular hierarchy: **Org → Team → Workspace**. The Team is a grouping unit; Workspace is where actual workflows live. This is closer to how modern tools work (e.g., Notion workspaces within teams).

```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    operations_limit INTEGER,  -- null = inherit org limit
    is_paused BOOLEAN DEFAULT FALSE,
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id),
    name TEXT NOT NULL,
    value JSONB,
    is_secret BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, name)
);
```

---

## 13. Entity: User

### 13.1 Make Model

Users in Make belong to organizations and teams with specific roles.

### 13.2 User Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `name` | string | Display name |
| `email` | string | Email address |
| `organizationRole` | enum | `admin`, `member`, `owner` |
| `teamRole` | enum | `admin`, `member` |
| `locale` | string | User locale code |
| `timezone` | string | User timezone |
| `avatar` | string | Avatar URL |
| `createdAt` | ISO datetime | Account creation |
| `lastLoginAt` | ISO datetime | Last login |
| `tfaEnabled` | boolean | 2FA enabled |

### 13.3 User Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| Get current user | GET | `/users/me` | (any valid token) |
| Get user | GET | `/users/{userId}` | `users:read` |
| Update user | PATCH | `/users/{userId}` | `users:write` |
| List org users | GET | `/organizations/{orgId}/users` | `users:read` |
| Invite user to org | POST | `/organizations/{orgId}/users` | `users:write` |
| Update org user role | PATCH | `/organizations/{orgId}/users/{userId}` | `users:write` |
| Remove org user | DELETE | `/organizations/{orgId}/users/{userId}` | `users:write` |
| List team users | GET | `/teams/{teamId}/users` | `users:read` |
| Invite user to team | POST | `/teams/{teamId}/users` | `users:write` |
| Update team user role | PATCH | `/teams/{teamId}/users/{userId}` | `users:write` |
| Remove team user | DELETE | `/teams/{teamId}/users/{userId}` | `users:write` |

### 13.4 FlowHolt Design Decision

FlowHolt uses Supabase Auth for user identity. The `users` table syncs with Supabase Auth.

```sql
-- Managed by Supabase Auth, extended by:
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    display_name TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    tfa_enabled BOOLEAN DEFAULT FALSE,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE org_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    UNIQUE(org_id, user_id)
);

CREATE TABLE team_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    UNIQUE(team_id, user_id)
);
```

---

## 14. Entity: Custom Function

### 14.1 Make Model

Custom Functions in Make are user-defined JavaScript functions that can be called in expressions (like `{{myFunction(value)}}`). They live at the team level.

### 14.2 Custom Function Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Function ID |
| `name` | string | Function name (no JS reserved words) |
| `description` | string | What the function does |
| `code` | string | JavaScript function code |
| `teamId` | integer | Owning team |
| `history` | object[] | Version history of the function |

### 14.3 Custom Function Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List custom functions | GET | `/custom-functions` | `function:read` |
| Create custom function | POST | `/custom-functions` | `functions:write` |
| Get custom function | GET | `/custom-functions/{functionId}` | `function:read` |
| Update custom function | PATCH | `/custom-functions/{functionId}` | `functions:write` |
| Delete custom function | DELETE | `/custom-functions/{functionId}` | `functions:write` |
| Evaluate function | POST | `/custom-functions/{functionId}/evaluate` | `function:read` |
| Check function code | POST | `/custom-functions/validate` | `function:read` |
| Get version history | GET | `/custom-functions/{functionId}/history` | `function:read` |

**Note**: Requires `customFunctions: true` in org license.

### 14.4 FlowHolt Design Decision

```sql
CREATE TABLE custom_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id),
    name TEXT NOT NULL,
    description TEXT,
    language TEXT DEFAULT 'javascript',  -- javascript or python
    code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, name)
);

CREATE TABLE custom_function_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_id UUID NOT NULL REFERENCES custom_functions(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    code TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**FlowHolt extends**: Supports both JavaScript AND Python custom functions. Python functions useful for data science operations.

---

## 15. Entity: Key (API Key / Credential Key)

### 15.1 Make Model

**Keys** in Make refer to API keys and credentials stored at the team level for use in app connections that require API keys (as opposed to OAuth). Not to be confused with user API tokens.

### 15.2 Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Key ID |
| `name` | string | Key display name |
| `teamId` | integer | Owning team |
| `value` | string | The key value (masked after creation) |
| `type` | string | Key type (e.g., `keyText`) |

### 15.3 Key Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List keys | GET | `/keys` | (team access) |
| Create key | POST | `/keys` | (team write) |
| Get key | GET | `/keys/{keyId}` | (team access) |
| Update key | PATCH | `/keys/{keyId}` | (team write) |
| Delete key | DELETE | `/keys/{keyId}` | (team write) |

### 15.4 FlowHolt Design Decision

FlowHolt merges Keys into the Credentials system. A `Credential` with `type = 'api_key'` covers this use case. No separate `/keys` endpoint needed — use `/credentials?type=api_key`.

---

## 16. Entity: Template

### 16.1 Make Model

Templates are pre-built scenario blueprints that users can use as starting points. Make offers hundreds of public templates.

### 16.2 Template Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Template ID |
| `name` | string | Template name |
| `teamId` | integer | Created in team |
| `language` | string | Language code (determines visibility) |
| `blueprint` | string | Full scenario blueprint |
| `scheduling` | string | Schedule config |
| `controller` | object | Wizard instructions per module |
| `isPublic` | boolean | Published and available to all |
| `apps` | string[] | App text IDs used in template |

### 16.3 Template Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List templates | GET | `/templates` | `templates:read` |
| Create template | POST | `/templates` | `templates:write` |
| Get template | GET | `/templates/{templateId}` | `templates:read` |
| Update template | PATCH | `/templates/{templateId}` | `templates:write` |
| Delete template | DELETE | `/templates/{templateId}` | `templates:write` |
| Use template | POST | `/templates/{templateId}/use` | `scenarios:write` |

### 16.4 FlowHolt Design Decision

See `58-FLOWHOLT-TEMPLATE-SYSTEM-AND-MARKETPLACE-SPEC.md` for full template system design. Key decisions:

```sql
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,  -- workflow blueprint
    category TEXT,
    tags TEXT[],
    apps TEXT[],                -- integrations used
    author_id UUID REFERENCES auth.users(id),
    org_id UUID REFERENCES organizations(id),  -- null = public
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 17. Entity: AI Agent

### 17.1 Make Model

AI Agents in Make are a newer (beta) feature allowing AI-driven automation. They can be created, modified, deleted, and run via API. They support SSE streaming output.

### 17.2 AI Agent Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List agents | GET | `/ai-agents` | `ai-agents:read` |
| Create agent | POST | `/ai-agents` | `ai-agents:write` |
| Get agent | GET | `/ai-agents/{agentId}` | `ai-agents:read` |
| Update agent | PATCH | `/ai-agents/{agentId}` | `ai-agents:write` |
| Delete agent | DELETE | `/ai-agents/{agentId}` | `ai-agents:write` |
| Run agent | POST | `/ai-agents/{agentId}/run` | `ai-agents:write` |
| Run agent (SSE) | POST | `/ai-agents/{agentId}/run/stream` | `ai-agents:write` |

### 17.3 AI Agent Request Body (Run)

```json
{
  "input": "Summarize the latest emails from my inbox",
  "conversationId": "a64d23ed-2580-43e4-a898-e97193d7fd5e",
  "parameters": {}
}
```

### 17.4 FlowHolt Design Decision

FlowHolt's AI Agent system is designed in `05-FLOWHOLT-AI-AGENTS-SKELETON.md` and `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md`. Key points:

```sql
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT,
    model_provider TEXT DEFAULT 'groq',  -- groq, gemini, openai
    model_name TEXT DEFAULT 'llama-3.1-8b-instant',
    temperature FLOAT DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2048,
    tools JSONB,           -- list of tool configs
    memory_config JSONB,   -- memory type and settings
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id),
    user_id UUID,
    messages JSONB DEFAULT '[]',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 18. Entity: Audit Log

### 18.1 Make Model

Audit logs record all significant actions taken in Make by users. Available at org level and team level.

### 18.2 Audit Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Log entry ID |
| `eventName` | string | Event type (e.g., `key_created`, `webhook_disabled`) |
| `triggeredAt` | ISO datetime | When the event occurred |
| `organization` | object | Org context |
| `team` | object | Team context |
| `actor` | object | Who performed the action |
| `targetId` | integer/string | ID of the affected resource |
| `details` | object | Event-specific details |

### 18.3 Audit Log Events (Sample)

Events known from Make API:
- `key_created`, `key_deleted`, `key_updated`
- `connection_created`, `connection_deleted`, `connection_updated`
- `webhook_created`, `webhook_disabled`, `webhook_updated`, `webhook_deleted`
- `scenario_created`, `scenario_deleted`, `scenario_activated`, `scenario_deactivated`
- `user_invited`, `user_removed`, `user_role_changed`
- `team_created`, `team_deleted`
- `organization_settings_changed`

### 18.4 Audit Log Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List org audit logs | GET | `/audit-logs/organization/{orgId}` | `organization:read` |
| Get org audit log filters | GET | `/audit-logs/organization/{orgId}/filters` | `organization:read` |
| List team audit logs | GET | `/audit-logs/team/{teamId}` | `organization:read` |
| Get team audit log filters | GET | `/audit-logs/team/{teamId}/filters` | `organization:read` |

**Filters supported**: `team[]`, `dateFrom`, `dateTo`, `event[]`, `user[]`
**Sorting**: by `triggeredAt`, `createdAt`, `eventName`, `organization`, `team`, `actor`, `targetId`
**Pagination**: `offset`, `limit`, `cursor` (via `pg[afterKey]`)

### 18.5 FlowHolt Design Decision

Full audit log design in `73-FLOWHOLT-ENTERPRISE-AND-WHITE-LABEL-SPEC.md`.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    team_id UUID REFERENCES teams(id),
    actor_id UUID REFERENCES auth.users(id),
    actor_email TEXT,
    event_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_logs_event ON audit_logs(event_type);
```

---

## 19. Entity: Credential Request

### 19.1 Make Model

Credential Requests are used in scenarios where a module needs a connection that doesn't exist yet. The scenario "requests" a credential from the user.

### 19.2 Credential Request Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List credential requests | GET | `/credential-requests` | `connections:read` |
| Create credential request | POST | `/credential-requests` | `connections:write` |
| Fulfill credential request | POST | `/credential-requests/{id}/fulfill` | `connections:write` |
| Delete credential request | DELETE | `/credential-requests/{id}` | `connections:write` |

### 19.3 FlowHolt Design Decision

FlowHolt implements this as a **"Connection Required" workflow state**. When a workflow is shared or deployed and lacks credentials, FlowHolt shows a credential setup wizard. No separate `/credential-requests` endpoint needed — handled via workflow activation flow and the credential picker UI.

---

## 20. Entity: Notification

### 20.1 Make Model

Notifications inform users about issues in their scenarios (errors, warnings) or platform updates.

### 20.2 Notification Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | BigInt (as string) | Notification ID (BigInt!) |
| `title` | string | Short notification title |
| `message` | string | Full notification content |
| `type` | enum | Type of notification |
| `isRead` | boolean | Whether user has read it |
| `createdAt` | ISO datetime | When created |
| `link` | string | Deep link to relevant page |

### 20.3 Notification Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List notifications | GET | `/notifications` | `notifications:read` |
| Get notification | GET | `/notifications/{notificationId}` | `notifications:read` |
| Delete notifications | DELETE | `/notifications` (batch) | `notifications:write` |
| Mark as read | POST | `/notifications/read` | `notifications:write` |

**Query params**: `unread=true`, `imtZoneId` (for Make zones), `pg[sortBy]=id`, `pg[sortDir]`, offset, limit

### 20.4 FlowHolt Design Decision

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    org_id UUID,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',  -- info, warning, error, success
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

---

## 21. Entity: Analytics

### 21.1 Make Model

Make provides analytics endpoints for tracking usage — operations consumed, data transfer, scenario run counts.

### 21.2 Analytics Operations

| Operation | HTTP Method | Path | Scope | Notes |
|-----------|------------|------|-------|-------|
| Get org analytics | GET | `/analytics/organizations/{orgId}` | `organization:read` | Operations, transfer over time |
| Get team analytics | GET | `/analytics/teams/{teamId}` | `teams:read` | Per-team usage |
| Get scenario analytics | GET | `/analytics/scenarios/{scenarioId}` | `scenarios:read` | Per-scenario run stats |

**Query params**: `dateFrom`, `dateTo`, `interval` (day/week/month)

### 21.3 FlowHolt Design Decision

Analytics is tracked via the `execution_runs` table. Aggregations are computed on demand or via materialized views.

```sql
-- Analytics query example:
SELECT 
    DATE_TRUNC('day', started_at) as date,
    COUNT(*) as total_runs,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed,
    SUM(operations_used) as operations,
    AVG(duration_ms) as avg_duration_ms
FROM execution_runs
WHERE workspace_id = $1 AND started_at >= $2 AND started_at <= $3
GROUP BY 1 ORDER BY 1;
```

FlowHolt API: `GET /analytics/orgs/{orgId}?from=2024-01-01&to=2024-01-31&interval=day`

---

## 22. Entity: SDK App

### 22.1 Make Model

SDK Apps are custom apps built using Make's App Development Kit. When installed to a team, they appear as modules users can add to scenarios.

### 22.2 SDK App Operations

| Operation | HTTP Method | Path | Scope | Notes |
|-----------|------------|------|-------|-------|
| List installed apps | GET | `/sdk-apps` | `scenarios:read` | List apps available in team |
| Install app | POST | `/sdk-apps` | `scenarios:write` | Install from marketplace or private |
| Get app details | GET | `/sdk-apps/{appId}` | `scenarios:read` | App version, modules list |
| Uninstall app | DELETE | `/sdk-apps/{appId}` | `scenarios:write` | Remove from team |

### 22.3 FlowHolt Design Decision

SDK Apps map to FlowHolt's **Custom Node** system (Spec 72). Managed via:

```
GET    /integrations                     -- list available integrations
POST   /integrations/{id}/install        -- install to workspace
DELETE /integrations/{id}/uninstall      -- uninstall from workspace
GET    /custom-nodes                     -- list custom nodes
POST   /custom-nodes                     -- create custom node
GET    /custom-nodes/{id}                -- get node definition
PATCH  /custom-nodes/{id}               -- update node
DELETE /custom-nodes/{id}               -- delete node
POST   /custom-nodes/{id}/publish       -- publish to community
```

---

## 23. Enum Reference

### 23.1 Enum Endpoints

| Enum | HTTP Method | Path | Returns |
|------|------------|------|---------|
| Module types | GET | `/enums/module-types` | Module type ID → name |
| Timezones | GET | `/enums/timezones` | timezoneId → name, IANA code |
| Countries | GET | `/enums/countries` | countryId → name, ISO code |
| Locales | GET | `/enums/locales` | localeId → locale code |
| Languages | GET | `/enums/languages` | language code → name |
| User features | GET | `/enums/user-features` | Feature name → description |
| IMT zones | GET | `/enums/imt-zones` | zoneId → zone URL |

### 23.2 Module Types (from Make)

| Type ID | Name | Description |
|---------|------|-------------|
| 1 | Trigger | Polls for new data |
| 2 | Action | Performs an action |
| 4 | Search | Searches for records |
| 9 | Aggregator | Aggregates bundles |
| 11 | Iterator | Splits array into bundles |
| 12 | Instant Trigger | Webhook-based trigger (real-time) |
| 23 | Universal Webhook | Generic HTTP webhook |

**FlowHolt Equivalent Node Types**:

| FlowHolt Node Type | Description |
|-------------------|-------------|
| `trigger.schedule` | Cron/interval-based trigger |
| `trigger.webhook` | HTTP webhook trigger |
| `trigger.manual` | Manual run |
| `trigger.chat` | Chat message trigger |
| `action` | Performs operation, returns output |
| `transform` | Data transformation (filter, map, aggregate) |
| `condition` | Branching logic (if/else) |
| `loop` | Iterate over array items |
| `merge` | Merge branches back together |
| `code` | Execute custom code (Python/JS) |
| `ai_agent` | AI-powered processing node |
| `sub_workflow` | Call another workflow |
| `mcp_tool` | Call external MCP tool |

---

## 24. Entity: Custom Property

### 24.1 Make Model

Custom Properties allow organizations to attach custom metadata fields to scenarios (and other entities). Enterprise feature.

### 24.2 Custom Property Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Property ID |
| `name` | string | Property name |
| `type` | enum | Data type (`text`, `number`, `boolean`, `select`, `multiselect`, `date`) |
| `options` | object[] | For select types, the available options |
| `organizationId` | integer | Owning org |
| `entityType` | string | What entity this applies to (e.g., `scenario`) |
| `isRequired` | boolean | Whether required |

### 24.3 Custom Property Operations

| Operation | HTTP Method | Path | Scope |
|-----------|------------|------|-------|
| List custom properties | GET | `/custom-properties` | `organization:read` |
| Create custom property | POST | `/custom-properties` | `organizations:write` |
| Update custom property | PATCH | `/custom-properties/{id}` | `organizations:write` |
| Delete custom property | DELETE | `/custom-properties/{id}` | `organizations:write` |
| Set entity property value | POST | `/custom-properties/{id}/values` | (entity write scope) |

### 24.4 FlowHolt Design Decision

```sql
CREATE TABLE custom_property_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    entity_type TEXT NOT NULL,  -- 'workflow', 'team', 'workspace'
    data_type TEXT NOT NULL,    -- 'text', 'number', 'boolean', 'select', 'date'
    options JSONB,              -- for select types
    is_required BOOLEAN DEFAULT FALSE,
    UNIQUE(org_id, entity_type, name)
);

CREATE TABLE custom_property_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES custom_property_definitions(id),
    entity_id UUID NOT NULL,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 25. Permission Scopes Master List

Complete table of all Make scopes and FlowHolt equivalents:

| Make Scope | Action | FlowHolt Equivalent |
|-----------|--------|-------------------|
| `scenarios:read` | View scenarios | `workflows:read` |
| `scenarios:write` | Create/edit/delete/run scenarios | `workflows:write` |
| `connections:read` | View connections | `credentials:read` |
| `connections:write` | Manage connections | `credentials:write` |
| `hooks:read` | View webhooks | `webhooks:read` |
| `hooks:write` | Manage webhooks | `webhooks:write` |
| `datastores:read` | View data stores | `data_stores:read` |
| `datastores:write` | Manage data stores | `data_stores:write` |
| `dlqs:read` | View incomplete executions | `incomplete_executions:read` |
| `dlqs:write` | Manage incomplete executions | `incomplete_executions:write` |
| `organizations:read` | View orgs | `orgs:read` |
| `organizations:write` | Manage orgs | `orgs:write` |
| `teams:read` | View teams | `teams:read` |
| `teams:write` | Manage teams | `teams:write` |
| `team-variables:read` | View team vars | `variables:read` |
| `team-variables:write` | Manage team vars | `variables:write` |
| `users:read` | View users | `users:read` |
| `users:write` | Manage users | `users:write` |
| `function:read` | View custom functions | `functions:read` |
| `functions:write` | Manage custom functions | `functions:write` |
| `templates:read` | View templates | `templates:read` |
| `templates:write` | Manage templates | `templates:write` |
| `ai-agents:read` | View AI agents | `agents:read` |
| `ai-agents:write` | Manage/run AI agents | `agents:write` |
| `notifications:read` | View notifications | `notifications:read` |
| `notifications:write` | Manage notifications | `notifications:write` |
| `organization:read` | Read org + audit logs | `audit_logs:read` |
| `admin:write` | Admin operations | `admin:write` |
| `mcp:use` | Use MCP server tools | `mcp:use` |
| N/A (FlowHolt adds) | Manage custom nodes | `custom_nodes:read/write` |
| N/A (FlowHolt adds) | Manage executions | `executions:read/write` |
| N/A (FlowHolt adds) | Manage analytics | `analytics:read` |
| N/A (FlowHolt adds) | Vault management | `vault:read/write` |

---

## 26. Entity Relationship Diagram (Text)

```
PLATFORM (SuperAdmin)
    └── ORGANIZATION
            ├── license (plan features, limits)
            ├── branding (white-label config)
            ├── sso_config
            ├── TEAM (multiple per org)
            │       ├── team_variables
            │       ├── WORKSPACE (multiple per team)
            │       │       ├── WORKFLOW (scenarios)
            │       │       │       ├── workflow_definition (blueprint)
            │       │       │       ├── workflow_versions
            │       │       │       ├── workflow_schedules
            │       │       │       └── workflow_triggers (webhooks)
            │       │       ├── EXECUTION_RUNS
            │       │       │       └── execution_node_runs
            │       │       ├── INCOMPLETE_EXECUTIONS
            │       │       ├── WEBHOOK_ENDPOINTS
            │       │       ├── DATA_STORES
            │       │       │       └── data_store_records
            │       │       └── CREDENTIALS
            │       │
            │       ├── CUSTOM_FUNCTIONS
            │       └── WORKFLOW_TEMPLATES
            │
            ├── USERS (org_memberships)
            │       └── team_memberships
            │
            ├── AUDIT_LOGS
            ├── AI_AGENTS
            ├── CUSTOM_PROPERTIES
            └── NOTIFICATIONS (per user)
```

---

## 27. FlowHolt API Design Decisions Summary

| Make Entity | FlowHolt Entity | Key Differences | Priority |
|------------|----------------|-----------------|---------|
| Scenario | Workflow | UUID IDs, JSONB blueprint, version history, tags, MCP tool flag | P0 |
| Scenario Blueprint | WorkflowDefinition | Inline JSONB, not separate API | P0 |
| Execution Log | ExecutionRun + NodeRun | More granular per-node tracking | P0 |
| Connection | Credential | Better encryption (Supabase Vault), credential types explicit | P0 |
| Data Store | DataStore + DataStoreRecord | Same structure, JSONB schema, PostgreSQL backend | P1 |
| Hook | WebhookEndpoint | Add HMAC secret, queue table | P0 |
| Hook Incomings | WebhookQueue | Add status tracking | P1 |
| Incomplete Execution | IncompleteExecution | Add resume checkpoint support | P1 |
| Organization | Organization | Add slug, branding, SSO config | P0 |
| Team | Team + Workspace | Split into two levels for granularity | P0 |
| User | UserProfile + memberships | Supabase Auth integration | P0 |
| Custom Function | CustomFunction | Add Python support, version history | P2 |
| Key | merged into Credential | No separate entity | P1 |
| Template | WorkflowTemplate | Add categories, thumbnails, use count | P1 |
| AI Agent | AiAgent + AgentConversation | Add memory, streaming, tool configs | P1 |
| Audit Log | AuditLog | More event types, cursor pagination | P1 |
| Credential Request | Workflow activation flow | Handled via UI, not API entity | P2 |
| Notification | Notification | Same, add BigInt → UUID migration | P1 |
| Analytics | Derived from ExecutionRuns | Aggregation queries, no separate table | P1 |
| SDK App | CustomNode | Full node builder system (Spec 72) | P2 |
| Enum | Enum APIs | Same pattern, FlowHolt-specific values | P1 |
| Custom Property | CustomPropertyDefinition | Same concept, extend to more entities | P2 |

---

## 28. Missing Entities in Make API

Entities that FlowHolt needs but Make doesn't provide (or hides internally):

| FlowHolt Entity | Why Needed | Notes |
|----------------|-----------|-------|
| WorkflowVersion | Git-like history for workflows | n8n has this; Make hides it |
| WorkflowFolder | Make has folders but limited API | FlowHolt needs full folder CRUD |
| WorkspaceSettings | Per-workspace config | FlowHolt adds Workspace layer |
| PlanUsage | Real-time usage counter | For enforcement and dashboards |
| ApiToken | User's own API tokens | Make has tokens but sparse API |
| MCP Tool Config | Per-workflow MCP settings | Make has this via scenario inputs/outputs |
| AgentMemory | Persistent conversation memory | Make doesn't have memory API |
| NodeRegistry | List of available node types | Make uses marketplace; FlowHolt needs own |
| ExecutionCheckpoint | Resume points in long workflows | FlowHolt addition for resilience |
| AlertRule | Threshold-based alerts | FlowHolt addition for ops monitoring |

---

## 29. FlowHolt API Route Plan

Complete list of proposed FastAPI routes derived from Make model + FlowHolt additions:

```
# Auth
POST   /auth/signup
POST   /auth/signin
POST   /auth/signout
POST   /auth/refresh
POST   /auth/magic-link
GET    /auth/sso/{provider}/authorize
GET    /auth/sso/callback

# Users
GET    /users/me
PATCH  /users/me
GET    /users/{userId}

# API Tokens
GET    /api-tokens
POST   /api-tokens
DELETE /api-tokens/{tokenId}

# Organizations
GET    /orgs
POST   /orgs
GET    /orgs/{orgId}
PATCH  /orgs/{orgId}
DELETE /orgs/{orgId}
GET    /orgs/{orgId}/members
POST   /orgs/{orgId}/members/invite
PATCH  /orgs/{orgId}/members/{userId}
DELETE /orgs/{orgId}/members/{userId}
GET    /orgs/{orgId}/usage
GET    /orgs/{orgId}/audit-logs
GET    /orgs/{orgId}/branding
PATCH  /orgs/{orgId}/branding

# Teams
GET    /teams
POST   /teams
GET    /teams/{teamId}
PATCH  /teams/{teamId}
DELETE /teams/{teamId}
GET    /teams/{teamId}/members
POST   /teams/{teamId}/members/invite
PATCH  /teams/{teamId}/members/{userId}
DELETE /teams/{teamId}/members/{userId}
GET    /teams/{teamId}/variables
POST   /teams/{teamId}/variables
PATCH  /teams/{teamId}/variables/{varId}
DELETE /teams/{teamId}/variables/{varId}

# Workspaces
GET    /workspaces
POST   /workspaces
GET    /workspaces/{workspaceId}
PATCH  /workspaces/{workspaceId}
DELETE /workspaces/{workspaceId}

# Workflows
GET    /workflows
POST   /workflows
GET    /workflows/{workflowId}
PATCH  /workflows/{workflowId}
DELETE /workflows/{workflowId}
POST   /workflows/{workflowId}/activate
POST   /workflows/{workflowId}/deactivate
POST   /workflows/{workflowId}/run
POST   /workflows/{workflowId}/duplicate
POST   /workflows/{workflowId}/export
GET    /workflows/{workflowId}/versions
POST   /workflows/{workflowId}/versions/{versionId}/restore

# Workflow Folders
GET    /workflow-folders
POST   /workflow-folders
PATCH  /workflow-folders/{folderId}
DELETE /workflow-folders/{folderId}

# Executions
GET    /executions
GET    /executions/{executionId}
DELETE /executions/{executionId}
POST   /executions/{executionId}/retry
GET    /executions/{executionId}/nodes

# Incomplete Executions
GET    /incomplete-executions
DELETE /incomplete-executions/{id}
POST   /incomplete-executions/{id}/retry
POST   /incomplete-executions/{id}/resolve

# Credentials
GET    /credentials
POST   /credentials
GET    /credentials/{credentialId}
PATCH  /credentials/{credentialId}
DELETE /credentials/{credentialId}
POST   /credentials/{credentialId}/test
POST   /credentials/oauth2/authorize
GET    /credentials/oauth2/callback

# Webhooks
GET    /webhooks
POST   /webhooks
GET    /webhooks/{webhookId}
PATCH  /webhooks/{webhookId}
DELETE /webhooks/{webhookId}
POST   /webhooks/{webhookId}/enable
POST   /webhooks/{webhookId}/disable
GET    /webhooks/{webhookId}/queue

# Data Stores
GET    /data-stores
POST   /data-stores
GET    /data-stores/{dataStoreId}
PATCH  /data-stores/{dataStoreId}
DELETE /data-stores/{dataStoreId}
GET    /data-stores/{dataStoreId}/records
POST   /data-stores/{dataStoreId}/records
GET    /data-stores/{dataStoreId}/records/{key}
PUT    /data-stores/{dataStoreId}/records/{key}
DELETE /data-stores/{dataStoreId}/records/{key}
DELETE /data-stores/{dataStoreId}/records

# Variables (Vault)
GET    /variables
POST   /variables
GET    /variables/{variableId}
PATCH  /variables/{variableId}
DELETE /variables/{variableId}

# Custom Functions
GET    /custom-functions
POST   /custom-functions
GET    /custom-functions/{functionId}
PATCH  /custom-functions/{functionId}
DELETE /custom-functions/{functionId}
POST   /custom-functions/{functionId}/evaluate
GET    /custom-functions/{functionId}/versions

# Templates
GET    /templates
POST   /templates
GET    /templates/{templateId}
PATCH  /templates/{templateId}
DELETE /templates/{templateId}
POST   /templates/{templateId}/use

# AI Agents
GET    /agents
POST   /agents
GET    /agents/{agentId}
PATCH  /agents/{agentId}
DELETE /agents/{agentId}
POST   /agents/{agentId}/run
POST   /agents/{agentId}/run/stream  (SSE)
GET    /agents/{agentId}/conversations
POST   /agents/{agentId}/conversations
GET    /agents/{agentId}/conversations/{conversationId}

# MCP Server
GET    /mcp/tools
POST   /mcp/tools/{toolId}/call
GET    /mcp/.well-known/mcp-configuration

# Notifications
GET    /notifications
GET    /notifications/{notificationId}
DELETE /notifications
POST   /notifications/read

# Analytics
GET    /analytics/orgs/{orgId}
GET    /analytics/teams/{teamId}
GET    /analytics/workflows/{workflowId}

# Audit Logs
GET    /audit-logs/orgs/{orgId}
GET    /audit-logs/teams/{teamId}
GET    /audit-logs/orgs/{orgId}/filters
GET    /audit-logs/teams/{teamId}/filters

# Enums
GET    /enums/timezones
GET    /enums/countries
GET    /enums/languages
GET    /enums/node-types
GET    /enums/integration-types

# System
GET    /health
GET    /health/ready
GET    /metrics
GET    /version
```

---

## 30. Key Gaps Between Make API and FlowHolt Needs

| Gap | Make API | FlowHolt Solution |
|-----|---------|------------------|
| Version control | No version API | Full `workflow_versions` table + restore endpoint |
| Workspace layer | No workspace concept (team is lowest) | Add Workspace between Team and Workflow |
| Real-time execution | No SSE for workflow runs | Add SSE endpoint for live execution streaming |
| Tag system | No tags | Add `tags TEXT[]` to workflows, templates |
| Execution checkpoints | No checkpoint API | Add `execution_checkpoints` for long-running workflows |
| Formula/expression API | No expression test endpoint | Add `/expressions/evaluate` for formula testing |
| Node registry | App catalog via SDK, not pure API | Add `/node-types` catalog endpoint |
| Alert rules | No alert system API | Add `/alert-rules` for threshold-based alerts |
| Custom domains | White-label admin only | `/orgs/{id}/custom-domain` endpoint |
| Plan management | Limited via license object | Full `/plans`, `/subscriptions` endpoints |
