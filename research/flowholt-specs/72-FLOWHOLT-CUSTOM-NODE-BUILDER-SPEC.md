# 72 · FlowHolt: Custom Node Builder Spec

> **Purpose**: Complete specification for FlowHolt's custom node builder — a UI and SDK that allows users to create their own integration nodes without writing Python backend code, by configuring app components in the Studio.
> **Audience**: Junior AI model implementing the custom node builder. All concepts explained.
> **Sources**: `research/competitor-data/make-docs/custom-apps-documentation/` (198 files), Make Custom Apps SDK, FlowHolt node_registry.py.

---

## Cross-Reference Map

| Section | Source |
|---------|--------|
| §1 Overview | Make custom apps overview |
| §2 Module types | `app-components/modules.md` |
| §3 Parameter types | `app-components/parameters.md` |
| §4 Base component | `app-components/base.md` |
| §5 Connection types | `app-components/connections.md` |
| §6 IML (expression lang) | `iml/` folder |
| §7 App lifecycle | `app-visibility.md` |
| §8 FlowHolt adaptation | FlowHolt design decisions |
| §9 UI surfaces | Studio node builder UI |
| §10 Backend implementation | node_registry + executor |

---

## 1. What Is the Custom Node Builder?

In FlowHolt (like Make.com), a **Custom Node** is a user-defined integration node that talks to an HTTP API. Instead of every user writing Python code, the platform provides a JSON/visual config approach.

**Use cases**:
- Connect to an internal company API
- Build an integration for a niche service not in the built-in library
- Wrap an existing webhook service with a friendly node interface

**Key concept**: A custom node is backed by one or more **modules**. Each module = one node type in the Studio palette. Multiple modules sharing the same `baseUrl` and `headers` are grouped into one **app** (integration).

---

## 2. Module Types

There are 6 module types (from Make's model, adopted by FlowHolt):

### 2.1 Action

**Use when**: API returns a single item in response.

**Examples**: "Create Contact", "Update Record", "Delete Item", "Get User"

**Behavior**:
- Sends one HTTP request.
- Returns one JSON object (or null).
- Executes once per workflow run.

**Config required**: HTTP method, URL, request body schema, response mapping.

### 2.2 Search

**Use when**: API returns a list of items.

**Examples**: "List Contacts", "Find Orders", "Search Records"

**Behavior**:
- Sends one HTTP request.
- Returns an array of items.
- Each item is processed by the next node in the workflow (automatic iteration).

**Config required**: Same as Action, but response is array and user can configure iterator behavior.

### 2.3 Trigger (Polling)

**Use when**: API does not have webhooks; you need to periodically check for changes.

**Examples**: "Watch New Emails", "Watch RSS Feed", "Watch Database Changes"

**Behavior**:
- FlowHolt's scheduler calls this module on a configured interval.
- Module fetches latest items.
- Compares with last-seen state (deduplication by `id` field or custom key).
- Only passes new/changed items downstream.

**Config required**: URL, sort/filter params, ID field for dedup, initial state (since_epoch or item_count).

### 2.4 Instant Trigger (Webhook)

**Use when**: API supports webhooks (push notifications).

**Examples**: "Watch New Order (Webhook)", "Watch Payment Event"

**Behavior**:
- FlowHolt creates a unique webhook URL for the workflow.
- User registers this URL in the third-party service.
- When the service sends a POST to the URL, the workflow is triggered immediately.
- Much faster than polling; no rate limit concerns.

**Config required**: Webhook payload schema (for field mapping UI), optional verification (HMAC or challenge-response).

### 2.5 Universal

**Use when**: You want to expose the full API to the user — they configure the method/URL themselves.

**Examples**: "Make an API Call", "Execute GraphQL Query"

**Behavior**:
- User configures method, URL path, headers, body at workflow-design time.
- Most flexible; least guided.

**Config required**: Minimal — just base URL and auth. User provides the rest.

### 2.6 Responder

**Use when**: Workflow is triggered by a webhook and needs to send a custom response back to the caller.

**Examples**: "Respond to Webhook", "Return 200 OK", "Return JSON Data"

**Behavior**:
- Must be the **last node** in a webhook-triggered workflow.
- Sends HTTP response back to the original webhook caller.
- Controls: HTTP status code, response headers, response body.

**Config required**: Status code (default 200), content-type, body template.

---

## 3. Parameter Types

Parameters are the input fields of a module (what the user configures in the node inspector).

### 3.1 Primitive Types

| Type | JSON | Description | Example |
|------|------|-------------|---------|
| `text` | string | Single-line text | "Hello {name}" |
| `number` | number | Integer or float | 42 |
| `boolean` | boolean | True/false | true |
| `date` | string (ISO) | Date picker | "2024-01-15" |
| `time` | string | Time picker | "14:30" |
| `timestamp` | number | Unix epoch | 1705320600 |
| `color` | string (hex) | Color picker | "#FF0000" |
| `file` | object | File upload | {name, data, mime} |
| `buffer` | binary | Raw binary data | — |

### 3.2 Composite Types

| Type | JSON | Description |
|------|------|-------------|
| `select` | string | Dropdown from options list (static) |
| `multiple-select` | string[] | Multi-select dropdown |
| `dynamic-select` | string | Dropdown loaded from API call |
| `dynamic-multiple-select` | string[] | Multi-select loaded from API |
| `url` | string | URL field with validation |
| `email` | string | Email field with validation |
| `password` | string | Masked text input |
| `uinteger` | number | Non-negative integer |
| `integer` | number | Integer (positive or negative) |
| `currency` | number | Formatted as currency |
| `array` | array | Repeatable item list |
| `collection` | object | Key-value group |
| `any` | any | Accepts any JSON value |

### 3.3 IML Types (Expression-Aware)

IML = **Integrated Markup Language** (Make's expression syntax, similar to FlowHolt's `{{expression}}`).

| Type | Description | Example value |
|------|-------------|---------------|
| IML string | Text with `{{expr}}` interpolation | `"Hello {{user.name}}"` |
| IML flat object | Object where values can be IML | `{"key": "{{value}}"}` |
| IML object | Nested object with IML values | — |
| IML array | Array with IML elements | — |

**FlowHolt implementation**: All "text" fields in custom nodes support `{{expression}}` syntax by default. Explicitly typed IML fields get the expression builder button.

### 3.4 Parameter Config Object

Each parameter is defined as:
```json
{
  "name": "email",
  "label": "Email Address",
  "type": "email",
  "required": true,
  "help": "The recipient's email address",
  "placeholder": "user@example.com",
  "default": null,
  "options": null,
  "validate": {
    "pattern": "^[^@]+@[^@]+\\.[^@]+$",
    "min": null,
    "max": null
  },
  "condition": "{{method}} == 'POST'"
}
```

**`condition`**: Show/hide this field based on another field's value. Uses IML expression.

---

## 4. Base Component (Shared App Config)

The **Base Component** is the shared configuration inherited by all modules in an app.

```json
{
  "baseUrl": "https://api.example.com/v1",
  "headers": {
    "Authorization": "Bearer {{connection.apiKey}}",
    "Content-Type": "application/json"
  },
  "qs": {
    "api_version": "2024-01"
  },
  "response": {
    "output": "{{body}}",
    "error": {
      "message": "{{body.error.message}}",
      "type": "{{body.error.type}}"
    }
  },
  "log": {
    "sanitize": ["request.headers.Authorization", "response.body.token"]
  }
}
```

**Fields**:
| Field | Description |
|-------|-------------|
| `baseUrl` | All modules prepend this to their `url` field |
| `headers` | HTTP headers added to every request |
| `qs` | Query string params added to every request |
| `body` | Body params merged into every request body |
| `response.output` | Default IML path for extracting output from response |
| `response.error.message` | IML to extract error message from error response |
| `log.sanitize` | Field paths to mask in execution logs (for secrets) |
| `oauth` | OAuth configuration if app uses OAuth connection |

---

## 5. Connection Types

A **Connection** defines how the app authenticates. Every app has one connection type.

### 5.1 API Key (Header)

```json
{
  "type": "apikey_header",
  "label": "API Key in Header",
  "params": [
    {"name": "apiKey", "label": "API Key", "type": "password"}
  ],
  "inject": {
    "header_name": "X-API-Key",
    "header_value": "{{connection.apiKey}}"
  }
}
```

### 5.2 API Key (Query String)

```json
{
  "type": "apikey_qs",
  "params": [{"name": "apiKey", "label": "API Key", "type": "password"}],
  "inject": {"qs_key": "api_key", "qs_value": "{{connection.apiKey}}"}
}
```

### 5.3 Bearer Token

```json
{
  "type": "bearer",
  "params": [{"name": "token", "label": "Bearer Token", "type": "password"}],
  "inject": {"header": "Authorization", "value": "Bearer {{connection.token}}"}
}
```

### 5.4 Basic Auth

```json
{
  "type": "basic",
  "params": [
    {"name": "username", "label": "Username", "type": "text"},
    {"name": "password", "label": "Password", "type": "password"}
  ]
}
```

### 5.5 OAuth 2.0

```json
{
  "type": "oauth2",
  "authorize_url": "https://accounts.example.com/oauth/authorize",
  "token_url": "https://accounts.example.com/oauth/token",
  "scopes": ["read", "write"],
  "params": [
    {"name": "client_id", "label": "Client ID", "type": "text"},
    {"name": "client_secret", "label": "Client Secret", "type": "password"}
  ]
}
```

### 5.6 Custom (IML-based)

For complex auth flows (session-based, multi-step, signature-based):
```json
{
  "type": "custom",
  "params": [...],
  "acquireTokenUrl": "https://api.example.com/auth/token",
  "injectToken": {"header": "Authorization", "value": "Token {{connection.token}}"}
}
```

---

## 6. App Lifecycle and Visibility

### 6.1 States

| State | Visible to | Editable | Deletable |
|-------|-----------|---------|----------|
| Draft | Creator only | Yes | Yes |
| Private | Org members (if shared) | Yes | Yes |
| Public (invite-link) | Anyone with link | No (structure) | Yes (if no users) |
| Approved | All FlowHolt users | No | No |

**FlowHolt v1 supports**: Draft + Private only (no public marketplace initially).

### 6.2 Module Immutability

Once a module is used in a live workflow:
- Cannot delete the module.
- Cannot change parameter names (breaks saved configs).
- Can add new optional parameters.
- Can update `label`, `help`, `placeholder` safely.

### 6.3 Publishing Flow

```
Draft → Test in personal workflow → Share with team (Private) → Submit for review → Approved (future)
```

---

## 7. FlowHolt Adaptation Decisions

| Make SDK feature | FlowHolt decision |
|-----------------|-------------------|
| IML language | Map to FlowHolt `{{expr}}` expression syntax |
| JSON config in Make DevHub | JSON editor + visual form builder in Studio |
| Python-backend-only team | Custom nodes run via FlowHolt's HTTP executor node (no Python needed) |
| Module types | Support all 6 types |
| Connections stored separately | Connections = FlowHolt Vault credentials |
| App versioning | Version field on custom node definition (not full version history in v1) |
| Dynamic selects (RPC calls) | HTTP calls to API to populate dropdown options |

---

## 8. UI Surfaces — Custom Node Builder

### 8.1 Entry Point

**Settings → Custom Nodes** (left nav under Team section)

Page layout:
```
┌─ Custom Nodes ─────────────────────────────────────┐
│ [+ Create Node]          [Search nodes...]          │
│                                                     │
│ MY NODES (3)                                        │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🟦 Stripe Custom  v1.2  ●Private  3 modules   │  │
│ │ Used in 5 workflows    [Edit] [Manage] [...]   │  │
│ └────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🟩 Internal CRM  v0.9  ◐Draft    1 module     │  │
│ │ Not used yet          [Edit] [...]             │  │
│ └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### 8.2 Node Builder — Edit View

Full-page editor with three panels:

```
┌─ Left: Structure ──┬─ Center: Module Editor ─┬─ Right: Preview ─┐
│ APP                │ Action: "Create Contact"  │ Studio preview    │
│ ├── Base Config    │                           │ of node           │
│ ├── Connection     │ [General] [Params] [HTTP] │                   │
│ └── MODULES        │                           │  ┌──────────┐    │
│     ├── Create     │ General tab:              │  │📮Create  │    │
│     ├── Update     │  Name: [Create Contact]   │  │ Contact  │    │
│     ├── Delete     │  Type: [Action ▼]         │  └──────────┘    │
│     └── + Add      │  Icon: [emoji picker]     │                   │
│                    │  Color: [color picker]     │  Params preview   │
│ [Test Connection]  │  Description: [...]        │  ┌────────────┐  │
│                    │                            │  │ Email *    │  │
│                    │ Params tab:                │  │ Name       │  │
│                    │  [+ Add param]             │  │ Phone      │  │
│                    │  [email] text req          │  └────────────┘  │
│                    │  [name]  text opt          │                   │
│                    │  [phone] text opt          │                   │
└────────────────────┴───────────────────────────┴───────────────────┘
```

### 8.3 HTTP Configuration Tab

Per-module HTTP settings:
```
Method: [GET ▼]  URL: [/contacts {{method == 'POST' ? '' : '/' + id}}]

Request Body:
[JSON editor with IML support]
{
  "email": "{{params.email}}",
  "name": "{{params.name}}"
}

Response Mapping:
Output: [{{body.contact}}]
Error message: [{{body.error.message}}]

[Test request →]  → Preview response
```

### 8.4 Connection Editor

```
┌─ Connection: Stripe Custom ─────────────────┐
│ Auth type: [API Key in Header ▼]            │
│                                             │
│ Parameters:                                 │
│   API Key  [password field]                 │
│   [+ Add parameter]                         │
│                                             │
│ Inject into:                                │
│   Header name: [Authorization]              │
│   Header value: [Bearer {{connection.apiKey}}]│
│                                             │
│ Test connection: [Test ▶]  ✓ Connected      │
└─────────────────────────────────────────────┘
```

---

## 9. Backend Implementation

### 9.1 Data Model

```python
class CustomNode(BaseModel):
    id: UUID
    workspace_id: UUID
    name: str                    # "Stripe Custom"
    description: str
    version: str                 # "1.0.0"
    icon: str                    # emoji or URL
    color: str                   # hex
    base_url: str
    base_headers: dict
    base_qs: dict
    base_response_config: dict
    connection_type: dict        # connection definition JSON
    modules: List[CustomModule]
    visibility: str              # "draft" | "private" | "public"
    created_at: datetime
    updated_at: datetime

class CustomModule(BaseModel):
    id: UUID
    custom_node_id: UUID
    module_type: str             # "action" | "search" | "trigger" | "instant_trigger" | "universal" | "responder"
    name: str
    label: str
    description: str
    icon: str
    params: List[dict]           # parameter definition list
    http_method: str
    http_url: str
    request_body_template: str   # IML template
    response_output_path: str    # IML path
    response_error_config: dict
```

### 9.2 Custom Module Executor

```python
async def execute_custom_module(node_config: dict, inputs: dict, connection: dict) -> dict:
    module_def = await get_custom_module(node_config["module_id"])
    app_def = await get_custom_node(module_def.custom_node_id)
    
    # Build URL
    url = app_def.base_url + evaluate_iml(module_def.http_url, inputs)
    
    # Build headers
    headers = {**app_def.base_headers}
    inject_connection_auth(headers, app_def.connection_type, connection)
    
    # Build body
    body = evaluate_iml(module_def.request_body_template, inputs)
    
    # Make HTTP call
    response = await http_client.request(
        method=module_def.http_method,
        url=url,
        headers=headers,
        json=body
    )
    
    # Extract output
    output = evaluate_iml(module_def.response_output_path, {"body": response.json()})
    return output
```

### 9.3 Node Registry Integration

Custom modules appear in the Studio node palette automatically:
```python
def get_available_nodes(workspace_id: UUID) -> List[NodeDefinition]:
    # Built-in nodes
    nodes = list(BUILT_IN_NODES.values())
    
    # Custom nodes for this workspace
    custom_modules = db.query(CustomModule).filter(
        CustomModule.workspace_id == workspace_id,
        CustomModule.visibility.in_(["private", "public"])
    ).all()
    
    for module in custom_modules:
        nodes.append(NodeDefinition(
            node_type=f"custom__{module.id}",
            label=module.label,
            category="Custom",
            icon=module.icon,
            params=module.params
        ))
    
    return nodes
```

---

## 10. Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Storage format | JSON in Postgres | Flexible, queryable, no extra service |
| IML vs FlowHolt expr | FlowHolt `{{expr}}` syntax | Consistent with rest of platform |
| Module types | All 6 supported | Feature parity with Make |
| Visual vs code | Visual builder + JSON toggle | Accessible to non-devs, precise for devs |
| Connection types | API Key (header/QS), Bearer, Basic, OAuth 2.0, Custom | Covers 95% of real APIs |
| Dynamic selects | HTTP RPC call to API | Same as Make; enables real autocomplete |
| Testing | "Test request" button per module | Essential for builder UX |
| Versioning | Semver string field | Simple; full version history in Phase 2 |
