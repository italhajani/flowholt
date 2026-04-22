# SPEC-82: FlowHolt Node Builder Architecture Deep Spec
## Source: n8n Documentation Deep Research — Node Building Complete Reference

**Created:** Sprint 88 Research Session
**Status:** Research Complete — Ready for Implementation Reference
**Scope:** Node definition, UI elements, UX guidelines, credential files, node versioning, programmatic vs declarative styles

---

## 1. Overview

The **Custom Node Builder** allows users and developers to create their own FlowHolt nodes that integrate with any third-party service. Understanding the full node architecture is critical both for building the node builder UI and for creating FlowHolt's built-in node library correctly.

---

## 2. Node File Structure

A complete node package contains:
```
my-node/
├── package.json                    # npm package metadata
├── nodes/
│   └── MyService/
│       ├── MyService.node.ts       # Main node definition
│       ├── MyService.node.json     # Node icons/metadata (optional)
│       ├── myServiceIcon.svg       # Node icon (60x60 for PNG, SVG preferred)
│       └── actions/               # (for programmatic style only)
│           ├── resource1/
│           │   ├── get.operation.ts
│           │   └── create.operation.ts
│           └── index.ts
└── credentials/
    └── MyServiceApi.credentials.ts  # Authentication definition
```

---

## 3. Standard Node Parameters (Complete Reference)

### 3.1 Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `displayName` | String | Label shown to users in GUI |
| `name` | String | Internal camelCase identifier (e.g., `"myService"`) |
| `icon` | String or Object | Icon reference — `"file:icon.svg"` or `{light, dark}` object |
| `group` | String[] | Node behavior hints: `["trigger"]`, `["schedule"]`, or `[]` |
| `description` | String | Short description shown in node picker |
| `defaults` | Object | `{ name: "DisplayName", color: "#hexcode" }` |
| `inputs` | String[] | Input connector names, usually `["main"]` |
| `outputs` | String[] | Output connector names, usually `["main"]` |
| `credentials` | Object[] | Auth definitions (see section 8) |
| `properties` | Object[] | All UI form fields (see section 4) |

### 3.2 Optional Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `version` | Number or Number[] | Node version(s). Array = supports multiple. Default 1 |
| `subtitle` | String | Dynamic subtitle shown on canvas node card (expression) |
| `requestDefaults` | Object | `{ baseURL, headers }` for declarative HTTP nodes |
| `forceInputNodeExecution` | Boolean | Force ALL input branches to complete before running |
| `requiredInputs` | Int or Int[] | Which input ports MUST have data before node runs |
| `polling` | Boolean | Whether this node can be used as a polling trigger |
| `triggerPanel` | Object | Config panel for trigger nodes |
| `codex` | Object | Search/category metadata for node picker |
| `usableAsTool` | Boolean | Whether this node can be used as AI tool sub-node |

### 3.3 Node Groups Explained
```typescript
group: ["trigger"]   // Node waits for external event (webhooks, etc.)
group: ["schedule"]  // Node waits for timer to fire
group: []            // Regular processing node (default)
// Note: "input", "output", "transform" exist but have no current effect
```

### 3.4 Subtitle Expression
The `subtitle` field can reference node parameters dynamically:
```typescript
subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}'
// Shows: "Get: Contact" on the canvas node card
```

---

## 4. UI Element Types (Complete Reference)

### 4.1 String
```typescript
{
  type: "string",
  displayName: "Email",
  name: "email",
  default: "",
  placeholder: "e.g. user@example.com",  // shows grayed-out example text
  description: "The recipient email address",
  typeOptions: {
    password: true,      // Masks input (for API keys, tokens)
    rows: 4,             // Multi-line textarea (> 1 = textarea)
    maxLength: 500,      // Character limit
    minLength: 1,        // Minimum length
  }
}
```

### 4.2 Number
```typescript
{
  type: "number",
  displayName: "Timeout",
  name: "timeout",
  default: 30,
  typeOptions: {
    minValue: 0,
    maxValue: 300,
    numberPrecision: 0,   // 0 = integer, 2 = float with 2 decimals
    numberStepSize: 1,    // Increment step for +/- buttons
  }
}
```

### 4.3 Boolean
```typescript
{
  type: "boolean",
  displayName: "Return All",
  name: "returnAll",
  default: false,
  description: "Whether to return all results or only the first N"
}
```

### 4.4 Options (Dropdown — Single Select)
```typescript
{
  type: "options",
  displayName: "Method",
  name: "method",
  noDataExpression: true,  // true = no expression toggle (static dropdown)
  options: [
    { name: "GET", value: "GET", description: "Read data" },
    { name: "POST", value: "POST", description: "Create data" },
    { name: "PUT", value: "PUT", description: "Replace data" },
    { name: "DELETE", value: "DELETE", description: "Remove data" },
  ],
  default: "GET"
}
```

### 4.5 MultiOptions (Dropdown — Multi Select / Checkboxes)
```typescript
{
  type: "multiOptions",
  displayName: "Fields",
  name: "fields",
  options: [
    { name: "ID", value: "id" },
    { name: "Name", value: "name" },
    { name: "Email", value: "email" },
  ],
  default: ["id", "name"]
}
```

### 4.6 Collection (Grouped Optional Fields)
Shows as an expandable "Add Field" button:
```typescript
{
  type: "collection",
  displayName: "Additional Fields",
  name: "additionalFields",
  placeholder: "Add Field",
  default: {},
  options: [
    // Any field type inside here
    { type: "string", name: "customHeader", displayName: "Custom Header" },
    { type: "number", name: "pageSize", displayName: "Page Size", default: 25 },
  ]
}
```

### 4.7 Fixed Collection (Always-Present Groups)
Used when a group of related fields should always appear together:
```typescript
{
  type: "fixedCollection",
  displayName: "Sorting",
  name: "sort",
  placeholder: "Add Sort Rule",
  typeOptions: { multipleValues: true },  // Allows adding multiple instances
  default: {},
  options: [
    {
      name: "rules",
      displayName: "Sort Rules",
      values: [
        { type: "string", name: "field", displayName: "Field" },
        { type: "options", name: "direction", displayName: "Direction",
          options: [
            { name: "Ascending", value: "asc" },
            { name: "Descending", value: "desc" },
          ], default: "asc" }
      ]
    }
  ]
}
```

### 4.8 DateTime
```typescript
{
  type: "dateTime",
  displayName: "Date",
  name: "date",
  default: "",
  description: "ISO 8601 date/time (e.g. 2024-01-15T14:30:00Z)"
}
// Renders as a date+time picker with timezone selector
```

### 4.9 Color
```typescript
{
  type: "color",
  displayName: "Color",
  name: "color",
  default: "#ff6900"
}
// Renders as a color picker with hex input
```

### 4.10 Filter (Query Builder)
Advanced visual condition builder:
```typescript
{
  type: "filter",
  displayName: "Conditions",
  name: "conditions",
  typeOptions: {
    filter: {
      caseSensitive: "={{ !$parameter.options.ignoreCase }}",
      leftValue: "",
      allowedCombinators: ["and", "or"],  // AND / OR logic
      conditions: []
    }
  }
}
// Renders as a visual "Add Condition" builder with left/operator/right columns
```

### 4.11 Assignment Collection (Drag-Drop Field Mapper)
Used for data mapping (like Set node):
```typescript
{
  type: "assignmentCollection",
  displayName: "Fields to Set",
  name: "assignments",
  typeOptions: {
    assignment: {
      // Auto-suggests available fields from previous node output
    }
  }
}
// Renders as a list of field-value pairs with drag-drop reordering
// Shows field names from input data as autocomplete suggestions
```

### 4.12 Resource Locator (Multi-Mode ID Input)
Most important UI element for third-party integrations:
```typescript
{
  type: "resourceLocator",
  displayName: "Spreadsheet",
  name: "spreadsheetId",
  default: { mode: "list", value: "" },
  modes: [
    {
      displayName: "From List",   // Dropdown from API
      name: "list",
      type: "list",
      placeholder: "Select a spreadsheet",
      typeOptions: {
        searchListMethod: "getSpreadsheets",  // Function that fetches options
        searchFilterRequired: false,
        searchable: true,
      }
    },
    {
      displayName: "By URL",     // Paste a URL, extract ID automatically
      name: "url",
      type: "string",
      placeholder: "https://docs.google.com/spreadsheets/d/...",
      extractValue: {
        type: "regex",
        regex: "https:\\/\\/docs\\.google\\.com\\/spreadsheets\\/d\\/([\\w-]*)"
      },
      validation: [
        { type: "regex", properties: { regex: "https:\\/\\/docs\\.google\\.com\\/.*" } }
      ]
    },
    {
      displayName: "By ID",      // Direct ID input
      name: "id",
      type: "string",
      placeholder: "e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
      validation: []
    }
  ]
}
// Default should be "From List" when API list endpoint is available
```

### 4.13 Resource Mapper (Dynamic Schema Mapping)
For nodes that map to external data schemas (like database columns):
```typescript
{
  type: "resourceMapper",
  displayName: "Mapping Column",
  name: "columns",
  typeOptions: {
    resourceMapper: {
      resourceMapperMethod: "getMappingColumns",  // Fetches schema from API
      mode: "map",  // "map" | "add" | "update" | "upsert"
      fieldWords: { singular: "column", plural: "columns" },
      addAllFields: true,
      multiKeyMatch: false,
    }
  }
}
// Renders as a dynamic column-to-field mapper
// Fetches available columns from the external service at runtime
```

---

## 5. Conditional Field Display

### 5.1 displayOptions — Show/Hide Based on Other Fields
```typescript
{
  displayName: "Max Results",
  name: "maxResults",
  type: "number",
  displayOptions: {
    show: {
      operation: ["getMany", "search"],  // Only show when operation is getMany or search
      resource: ["contact"],             // AND resource is contact
    }
  }
}
```

```typescript
{
  displayOptions: {
    hide: {
      returnAll: [true],   // Hide when "Return All" is true
    }
  }
}
```

### 5.2 noDataExpression
```typescript
noDataExpression: true
// Prevents the expression toggle from appearing on this field
// Use for: dropdowns that define the node's behavior (resource, operation)
// These should never be expressions as they affect node rendering
```

---

## 6. Node Routing (Declarative Style)

For simple HTTP API nodes, use declarative routing instead of writing `execute()`:
```typescript
{
  name: "Create Contact",
  value: "createContact",
  action: "Create a contact",
  routing: {
    request: {
      method: "POST",
      url: "/contacts",
      body: {
        name: "={{ $parameter.name }}",
        email: "={{ $parameter.email }}",
      }
    },
    output: {
      postReceive: [
        {
          type: "rootProperty",
          properties: { property: "data" }  // Extract from response.data
        }
      ]
    }
  }
}
```

**Declarative vs Programmatic:**
| | Declarative | Programmatic |
|--|-------------|--------------|
| Use when | Simple CRUD REST API | Complex logic, multiple API calls, auth handling |
| Code needed | Mostly JSON config | Full TypeScript `execute()` method |
| Flexibility | Lower | Full |
| Maintainability | Higher (JSON = readable) | Higher (TypeScript = type-safe) |

---

## 7. UX Standards and Copy Guidelines

### 7.1 Text Case Rules (MUST follow)
| Element | Case | Example |
|---------|------|---------|
| Node `name` (picker label) | Title Case | "Google Sheets" |
| Parameter display names (labels) | Title Case | "Sheet Name" |
| Dropdown option names | Title Case | "Get Many" |
| Operation `action` names | Sentence case | "Get many rows" |
| Node descriptions | Sentence case | "Send an email using Gmail" |
| Parameter descriptions (tooltips) | Sentence case | "The email address to send to" |
| Hints | Sentence case | "This field accepts expressions" |
| Placeholder text | Sentence case with "e.g." | "e.g. user@example.com" |

### 7.2 Terminology Rules
- Use the **third-party service's own terminology** (e.g., Notion "Blocks", Trello "Archive" not "Delete")
- Use **UI terminology** not API terminology (what user sees in the app, not what API docs say)
- No **tech jargon** — "field" not "key", "connect" not "authenticate", "settings" not "configuration"
- Be **consistent** — pick one term and stick to it throughout the node (don't mix "folder" and "directory")

### 7.3 Placeholder Guidelines
Always start with "e.g." and use camelCase for the demo content:
```
email: "e.g. nathan@example.com"
URL: "e.g. https://example.com/image.png"
search: "e.g. automation"
name: "e.g. Nathan Smith"
user handle: "e.g. n8n"
```

### 7.4 Operations Structure (Standard Pattern)
Every node operation should follow:
- **Name**: Title Case, shown in select dropdown (e.g., "Get Many")
- **Action**: Sentence case, includes resource (e.g., "Get many contacts")
- **Description**: Sentence case, adds context (e.g., "Retrieve a list of contacts from the CRM")

**Standard CRUD operations to support:**
- Create
- Create or Update (Upsert) — important for sync workflows
- Delete
- Get (single)
- Get Many (with optional search/filter)
- Update

### 7.5 Help and Documentation Elements (5 Types)

**1. Inline info box** (blue info banner):
```typescript
{
  type: "notice",
  name: "notice",
  displayName: "Note: This requires a Business plan or higher",
  typeOptions: { noticeTheme: "info" }
}
```

**2. Hint text** (gray helper below field):
```typescript
description: "Learn more at https://docs.example.com"  // regular description
hint: "Use expressions to make this dynamic"            // smaller hint text
```

**3. Node hint** (yellow hint card on canvas):
Defined in node-level `hints` array, appears as a callout on the node.

**4. Tooltip** (? icon next to field label):
Standard `description` field — shown as tooltip on hover.

**5. Placeholder** (grayed input example):
`placeholder: "e.g. value"` — shown inside the input field when empty.

### 7.6 Field Ordering Convention
Order fields in this priority:
1. Resource selector (what type of data)
2. Operation selector (what to do with it)
3. Required fields (must have to run)
4. Most commonly used optional fields
5. "Additional Fields" collection (rarely used optional fields)

### 7.7 Delete Operation Output
When a node deletes an item, always return:
```typescript
return [{ json: { deleted: true, id: deletedId } }]
// This signals success and allows downstream nodes to react
```

### 7.8 Simplify Parameter (for responses > 10 fields)
When API returns many fields, add:
```typescript
{
  displayName: "Simplify",
  name: "simplify",
  type: "boolean",
  default: true,
  description: "Whether to return a simplified version of the response instead of the raw data"
}
// In execute(): if (simplify) { return [{ json: pickTopFields(response) }] }
```

---

## 8. Credentials (Authentication) File

### 8.1 Basic API Key Credential
```typescript
export class MyServiceApi implements ICredentialType {
  name = "myServiceApi";
  displayName = "My Service API";
  documentationUrl = "https://docs.myservice.com/api";
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },  // ALWAYS password for keys/tokens
      default: "",
    },
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://api.myservice.com",
    }
  ];
  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: { "X-API-Key": "={{ $credentials.apiKey }}" }
    }
  };
}
```

### 8.2 OAuth2 Credential
```typescript
{
  extends: ["oAuth2Api"],
  name: "myServiceOAuth2Api",
  displayName: "My Service OAuth2",
  properties: [
    {
      displayName: "Grant Type",
      name: "grantType",
      type: "hidden",
      default: "authorizationCode"
    },
    {
      displayName: "Authorization URL",
      name: "authUrl",
      type: "hidden",
      default: "https://myservice.com/oauth/authorize"
    },
    {
      displayName: "Access Token URL",
      name: "accessTokenUrl",
      type: "hidden",
      default: "https://myservice.com/oauth/token"
    },
    {
      displayName: "Scope",
      name: "scope",
      type: "hidden",
      default: "read write"
    }
  ]
}
```

### 8.3 Credential Test
Always include a test method to verify credentials are valid:
```typescript
test: ICredentialTestRequest = {
  request: {
    baseURL: "={{ $credentials.baseUrl }}",
    url: "/me",  // A lightweight endpoint that validates the token
  }
}
```

---

## 9. Node Versioning

### 9.1 Why Version Nodes
- Breaking changes require a new version
- Old workflows continue to use the version they were created with
- New workflows get the latest version by default

### 9.2 Version Definition
```typescript
// Single version node:
version: 2

// Multi-version node (supports both v1 and v2):
version: [1, 2]
defaultVersion: 2  // New nodes use v2

// In properties: use displayOptions to show v2-only fields
{
  displayOptions: {
    show: { "@version": [2] }  // Only show in version 2
  }
}
```

### 9.3 Version Migration Pattern
When migrating from v1 to v2:
- Keep v1 logic in separate class file
- Main node file extends base class with version routing
- Existing workflows with `version: 1` continue to work

---

## 10. usableAsTool — AI Tool Exposure

Any node can be exposed as an AI agent tool:
```typescript
usableAsTool: true
// When true, the node can be used as a sub-node under AI Agent's "Tools" connector
// The AI can call this node with dynamic parameters via $fromAI()
// A description is required for the AI to know when to use the tool
```

---

## 11. Resource Locator Best Practices

**Always use Resource Locator** when the user needs to select a single item from an external service:
- Default mode should be "From List" (dropdown populated via API)
- Also include "By URL" and/or "By ID" modes as fallbacks
- "By URL" mode should use regex to extract the ID from the URL automatically

**When NOT to use Resource Locator:**
- Input comes from previous node (use expression instead)
- Multiple items can be selected (use MultiOptions)
- It's a user-entered value (use string with placeholder)

---

## 12. FlowHolt Node Builder — UI Component Checklist

### Field Types to Support:
- [x] String (plain + password + multirow)
- [x] Number (with min/max/step)
- [x] Boolean (toggle)
- [x] Options (single-select dropdown)
- [x] MultiOptions (multi-select)
- [x] Collection (expandable optional fields)
- [x] Fixed Collection (grouped fields)
- [x] DateTime (date-time picker)
- [ ] Color (color picker)
- [ ] Filter (visual condition builder) ← MAJOR FEATURE
- [ ] Assignment Collection (drag-drop field mapper) ← MAJOR FEATURE
- [ ] Resource Locator (multi-mode ID input) ← IMPORTANT
- [ ] Resource Mapper (dynamic schema mapper) ← IMPORTANT

### UX Features:
- [ ] Expression toggle on every field (except `noDataExpression`)
- [ ] Conditional display (displayOptions show/hide)
- [ ] Field ordering drag-drop (fixedCollection with multipleValues)
- [ ] Credential type selector with test button
- [ ] "Simplify" boolean parameter pattern
- [ ] Node hints system (canvas callout cards)
- [ ] 5 help element types (info box, hint, node hint, tooltip, placeholder)

### Node Architecture:
- [ ] Version selector in node builder
- [ ] Declarative routing builder (for simple HTTP nodes)
- [ ] usableAsTool toggle
- [ ] Subtitle expression builder
- [ ] Icon upload (SVG preferred, PNG fallback)
- [ ] Node credential association
