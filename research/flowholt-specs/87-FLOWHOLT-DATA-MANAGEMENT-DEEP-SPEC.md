# FLOWHOLT SPEC 87 — Data Management Deep Spec
> Source: n8n docs `data/` (pinning, tables, binary, item-linking, variables, custom-execution-data, referencing, expressions)
> Sprint: 89 | Status: Research Complete

---

## 1. Overview

This spec covers all data-management subsystems that make workflows powerful for data engineering tasks: pinning for dev/test, data tables for structured storage, binary file handling, item linking for multi-item tracking, variables, and custom execution metadata.

---

## 2. Data Pinning

### 2.1 What Is Data Pinning?

Data pinning saves the output of a node so that future executions in the **editor** use the saved (pinned) data instead of re-running the node. This enables:
- Testing downstream nodes without re-triggering sources (webhooks, schedules, API calls)
- Editing pinned data to test edge cases
- Using production execution data as test data

**Critical limitation: Pinned data is only used during test executions in the editor. Production executions NEVER use pinned data.**

### 2.2 Pinning Rules & Constraints

| Constraint | Detail |
|-----------|--------|
| Binary data nodes | Cannot pin (binary data too large/complex) |
| Multiple main outputs | Cannot pin (e.g. IF node — must test each branch) |
| Max item count | No documented limit but large datasets slow the editor |
| Storage | Pinned data stored in workflow JSON definition |
| Production | Pinned data is ignored entirely |

### 2.3 Pinning User Interaction Flow

```
Node runs in editor
    └─ Hover node → pin icon appears
    └─ Click pin → data is pinned (node turns gray + pin indicator)

Pinned state:
    └─ Node shows pin badge
    └─ "Edit" → opens JSON editor to modify pinned data
    └─ "Unpin" → removes pinned data, node will re-execute

Re-run with different data:
    └─ Edit pinned data to add edge cases
    └─ e.g. missing fields, wrong types, empty arrays
```

### 2.4 Combining Pinning with Mocking

Data mocking (via Code node, Set node, or Customer Datastore node) + pinning:
- Use mocking to generate synthetic data in a sub-workflow
- Pin the mock output to use it for downstream testing without running the mock sub-workflow

```
[Customer Datastore node]  →  [pin icon]
       ↓
  Pinned mock data fed into all downstream nodes
```

### 2.5 Using Past Execution Data as Pinned Data

```
Executions panel → select past execution
  └─ Click on node in execution
  └─ "Copy output data"
  └─ Return to editor → Edit pinned data → paste
```

This allows replicating production edge cases in development.

### 2.6 FlowHolt Implementation Plan

```
UI:
- Pin icon on node hover (top-right corner)
- Gray overlay + pin icon badge on pinned nodes
- "Pinned data" tooltip on hover
- JSON editor for pinned data (Monaco with JSON schema validation)
- "Unpin" button in editor
- Clear visual diff between pinned and live data

Backend:
- Store pinned data in workflow definition JSON (`steps[n].pinnedData`)
- API to get/set pinned data per step
- Executor: if step has pinnedData and mode=test → skip execution, use pinned data
- Production execution: ignore pinnedData entirely

Rules enforcement:
- Disallow pinning on nodes with binary output
- Disallow pinning on nodes with multiple outputs (IF, Switch)
```

---

## 3. Data Tables

### 3.1 What Are Data Tables?

Data Tables are **project-scoped** structured storage tables — similar to a simple database. Data Tables allow workflows to create, read, update, delete rows of structured data without needing an external database.

They are the n8n alternative to spreadsheets for workflow data persistence.

### 3.2 Data Tables Limits

| Limit | Value |
|-------|-------|
| Storage per instance | 50MB default |
| Override env var | `N8N_DATA_TABLES_MAX_SIZE_BYTES` |
| Warning threshold | 80% capacity → warning shown |
| Disable threshold | 100% → inserts disabled |
| Not accessible from | Code node (no built-in API) |

### 3.3 Data Tables Scoping

| Scope | Visibility |
|-------|-----------|
| Personal space | Only the creator |
| Project | All project members |
| Global | ❌ Not supported |

### 3.4 Data Tables CRUD

**Access Methods:**
1. **Data Table node** in workflow canvas
2. **n8n REST API** `/datatables` endpoint
3. **UI table view** in project sidebar

**Operations:**
- Create table (define columns + types)
- Insert row
- Update row
- Delete row
- Get row(s) with optional filter
- Import CSV → table
- Export table → CSV

### 3.5 Data Tables vs Variables vs Static Data

| Feature | Data Tables | `$vars` | `$getWorkflowStaticData()` |
|---------|-------------|---------|--------------------------|
| Structure | Row-column | Key-value | Key-value |
| Scope | Project | Instance/project | Workflow |
| Writable in workflow | ✅ | ❌ | ✅ |
| Persists after execution | ✅ | ✅ | ✅ |
| Accessible from Code | ❌ | ✅ | ✅ |
| Best for | Large structured datasets | Config/flags | Per-workflow state |

### 3.6 FlowHolt Implementation Plan

```
Database:
- `data_tables` table: id, project_id, name, columns (JSON schema), created_at
- `data_table_rows` table: id, table_id, data (JSONB), created_at, updated_at
- Storage accounting: calculate JSON size, enforce limits

API endpoints:
- GET    /api/data-tables                   (list project tables)
- POST   /api/data-tables                   (create table)
- GET    /api/data-tables/:id/rows          (query rows with filter)
- POST   /api/data-tables/:id/rows          (insert row)
- PUT    /api/data-tables/:id/rows/:rowId   (update row)
- DELETE /api/data-tables/:id/rows/:rowId   (delete row)
- POST   /api/data-tables/:id/import-csv    (bulk import)
- GET    /api/data-tables/:id/export-csv    (export)

Node: "FlowHolt Data Store" node with operations:
  - Get Row, Get All Rows, Insert Row, Update Row, Delete Row, Count Rows
  - Filter support: field, operator (=, !=, >, <, contains, starts_with), value

UI:
- Project sidebar → Data Tables tab
- Create table modal (name + column definitions: name, type)
- Table view with inline editing
- Import/Export CSV buttons
- Storage usage indicator (% of 50MB)
```

---

## 4. Binary Data Handling

### 4.1 Binary Data Architecture

Binary data (files, images, PDFs) in n8n flows through the `$binary` item property alongside `$json`. Each binary output is a separate named key in the binary object:

```javascript
$binary.data        // main binary output (common default)
$binary.attachment1 // named binary streams
$binary.thumbnail   // can have multiple
```

### 4.2 Binary Data Nodes Catalog

| Node | Direction | Self-hosted? | Description |
|------|-----------|-------------|-------------|
| **Convert to File** | JSON → File | ✅ Cloud & SH | Convert JSON/text → file (CSV, TXT, HTML, etc.) |
| **Extract From File** | File → JSON | ✅ Cloud & SH | Extract content from file to JSON |
| **Read/Write Files from Disk** | Both | ❌ Self-hosted only | Read/write local filesystem |
| **XML node** | JSON ↔ XML | ✅ | Convert between JSON and XML |
| **HTML node** | HTML → JSON | ✅ | Parse HTML, extract data |
| **Compression** | Files → Archive | ✅ | Zip/unzip files |
| **Edit Image** | Image → Image | ✅ | Resize, crop, convert, annotate images |
| **FTP** | Files ↔ FTP | ✅ | Upload/download from FTP/SFTP |
| **S3** | Files ↔ S3 | ✅ | AWS S3 file operations |
| **Google Drive** | Files ↔ Drive | ✅ | Google Drive file operations |

### 4.3 Binary Data Constraints

- **Cannot pin binary data nodes** — pinning is text/JSON only
- **File paths in Docker**: use `/tmp/` prefix for Read/Write nodes
- **Cloud limitation**: Read/Write Files from Disk not available on n8n Cloud
- **MIME type required**: binary items must include `mimeType` field

### 4.4 Binary Data Environment Configuration

```bash
# Store binary data on filesystem instead of DB (required for large files/scaling)
N8N_DEFAULT_BINARY_DATA_MODE=filesystem

# Path for binary data
N8N_BINARY_DATA_STORAGE_PATH=/home/user/.n8n/binaryData
```

### 4.5 FlowHolt Binary Data Plan

```
Storage:
- Small files (< 5MB): store as base64 in DB (execution_data JSONB)
- Large files (> 5MB): write to disk/S3, store reference URL
- Configurable via FLOWHOLT_BINARY_DATA_MODE = "database" | "filesystem" | "s3"

Nodes to implement (priority order):
1. Convert to File (high demand)
2. Extract From File (high demand)
3. XML node (many API integrations use XML)
4. HTML Extract (web scraping)
5. Compression (batch workflows)
6. Edit Image (marketing/content automation)
7. Read/Write Disk (self-hosted only mode)

API:
- Binary data uploads: multipart POST
- Binary data downloads: stream response with Content-Type
- Temp storage for execution pipeline
```

---

## 5. Item Linking

### 5.1 What Is Item Linking?

Every output item is **linked** to the input item(s) that caused it. This linkage powers:
- `$("<node>").item` — access the specific input item linked to current processing
- Proper data merging downstream
- Error reporting pointing to specific items

### 5.2 Automatic Item Linking Rules

| Scenario | Rule | Example |
|----------|------|---------|
| 1 input → 1 output | Auto-linked 1:1 | Pass-through node |
| 1 input → N outputs | All N outputs link to that 1 input | Split string → multiple parts |
| N inputs = N outputs (same count) | Linked positionally (1→1, 2→2) | Map operation |
| N inputs ≠ N outputs (different count) | **Error** — must handle manually | Complex aggregation |
| Items created from scratch | No input link | Start node, trigger |

### 5.3 Error Case: Mismatched Item Counts

When a node receives N inputs and produces M outputs where N≠M and items aren't derivable:
```
Error: "The 'Link to previous item' couldn't be set. 
       The item output count doesn't match the input count."
```

**Resolution patterns:**
1. Use `pairedItem` to manually specify which input each output relates to
2. Use a Merge node downstream to re-link items
3. Restructure the node to produce exactly N outputs

### 5.4 `pairedItem` in Code Node

```javascript
// Manual item linking in Code node
const inputItems = $input.all();
return inputItems.map((item, index) => ({
  json: { 
    ...item.json, 
    processed: true 
  },
  pairedItem: { item: index }  // explicitly links to input item
}));

// Link to a different item
return [{
  json: { result: "summary" },
  pairedItem: { item: 0 }  // always links to first input item
}];
```

### 5.5 `$("<node>").itemMatching()`

```javascript
// In Code node: get the input item linked to the current item
// This is how you trace back to source data
const sourceItem = $("HTTP Request").itemMatching($itemIndex);
```

### 5.6 FlowHolt Implementation Plan

```
Data model:
- Each item in executor output carries: { json, binary, pairedItem }
- pairedItem: { item: number } | { node: string, item: number }
- Executor resolves item.pairedItem to trace lineage

Tracking:
- Maintain item lineage map during execution
- Items without pairedItem → linked to all input items (n8n default)
- Items with pairedItem → linked to specified input

UI indicators:
- Show item count per node
- Show "linked item" visualization in input/output panel
- Error highlighting when item counts mismatch

Error handling:
- When node produces different item count than expected:
  - Show warning in inspector: "Item count mismatch — pairedItem required"
  - Link to docs
```

---

## 6. Custom Execution Data

### 6.1 What Is Custom Execution Data?

Execution metadata that you can write from within a workflow and then use to filter/search the executions list afterward.

Example: Set `customData.orderId` → search executions by order ID → find exactly which execution processed a specific order.

### 6.2 API Reference

All methods are on `$execution.customData` (Code node only):

```javascript
// Set a single key
$execution.customData.set("orderId", "ORD-12345");

// Set multiple at once
$execution.customData.setAll({
  orderId: "ORD-12345",
  userId: "USR-789",
  region: "EU"
});

// Get a value within same execution
const orderId = $execution.customData.get("orderId");

// Get all values
const allData = $execution.customData.getAll();
```

### 6.3 Limits

| Constraint | Value |
|-----------|-------|
| Max items | 10 |
| Key max length | 50 characters |
| Value max length | 255 characters |
| Data types | Strings only (no objects/arrays) |
| Availability | Pro/Enterprise Cloud; Enterprise/registered Community self-hosted |

### 6.4 Use Cases

| Use case | Pattern |
|----------|---------|
| Track which customer triggered workflow | `set("customerId", $json.customerId)` |
| Search executions by order | `set("orderId", $json.orderId)` |
| Track processing status | `set("status", "payment_processed")` |
| Debug: mark data source | `set("source", "stripe_webhook")` |

### 6.5 FlowHolt Implementation Plan

```
Database:
- execution_metadata table: execution_id, key, value (indexed)
- API: GET /api/executions?customData.orderId=ORD-12345

Runtime:
- $execution.customData writes buffer during execution
- On execution complete → flush to execution_metadata table
- set() / setAll() writes to local buffer
- get() / getAll() reads from local buffer (not DB during run)

Limits enforcement:
- Max 10 keys: throw on 11th set()
- Key max 50 chars: throw immediately
- Value max 255 chars: throw immediately
- Non-string values: coerce to string with warning

Plan:
- Availability: Enterprise plan only (gate behind feature flag)
- UI: Executions list → filter by custom data
- Search: filter input → "Custom Data Key" + "Value" fields
```

---

## 7. Data Referencing — Complete Reference

### 7.1 Item Access in Expressions

```javascript
// Current item (auto-resolved in expressions)
$json.fieldName              // shorthand for $input.item.json.fieldName
$binary.filename             // binary data shorthand

// Explicit item access
$input.item.json.fieldName
$input.item.binary.data

// All items from previous node
$input.all()                 // returns ItemArray
$input.first().json          // first item's JSON
$input.last().json           // last item's JSON
```

### 7.2 Cross-Node References

```javascript
// All items from a specific node
$("Node Name").all()          // all items
$("Node Name").first().json   // first item
$("Node Name").last().json    // last item
$("Node Name").item.json      // linked item (use with item linking)

// With branch and run index
$("Switch").all(1)            // items from branch 1 (0-indexed)
$("Loop").all(0, 2)           // items from branch 0, run index 2

// Check if node has run
$("Webhook").isExecuted       // returns boolean
```

### 7.3 Parameters

```javascript
// Access a node's query parameters
$("HTTP Request").params      // query params, headers etc
$input.params.query           // current node's query
```

### 7.4 Loop Context

```javascript
// Inside Loop Over Items
$input.context.noItemsLeft    // true when loop is on last item
```

---

## 8. n8n Database Structure — Reference for FlowHolt DB Design

### 8.1 n8n Database Tables (all 24)

| Table | Purpose | FlowHolt Equivalent |
|-------|---------|---------------------|
| `auth_identity` | OAuth identity provider records | `auth_providers` |
| `auth_provider_sync_history` | OAuth sync events | `auth_sync_log` |
| `credentials_entity` | Encrypted credential storage | `vault_credentials` |
| `event_destinations` | Webhook/event forwarding targets | `event_destinations` |
| `execution_data` | Execution input/output data (large) | `execution_data` |
| `execution_entity` | Execution metadata (status, timing) | `executions` |
| `execution_metadata` | Custom execution data (key-value) | `execution_metadata` |
| `installed_nodes` | Community node packages | `community_nodes` |
| `installed_packages` | npm package registry | `installed_packages` |
| `migrations` | DB migration history | `migrations` |
| `project` | Workspace/project units | `projects` |
| `project_relation` | User-to-project membership + role | `project_members` |
| `role` | Role definitions (future) | `roles` |
| `settings` | Instance-level settings | `instance_settings` |
| `shared_credentials` | Credential access sharing | `credential_shares` |
| `shared_workflow` | Workflow access per project/user | `workflow_shares` |
| `tag_entity` | Workflow tags | `tags` |
| `user` | User accounts | `users` |
| `variables` | Instance/project-scoped variables | `variables` |
| `webhook_entity` | Active webhook registrations | `webhook_registrations` |
| `workflow_entity` | Workflow definitions (JSON) | `workflows` |
| `workflow_history` | Workflow version snapshots | `workflow_versions` |
| `workflow_statistics` | Execution counts and timing | `workflow_stats` |
| `workflows_tags` | Many-to-many workflow↔tag | `workflow_tags` |

### 8.2 Key Design Implications for FlowHolt

```sql
-- Execution data should be separate table (can be very large)
CREATE TABLE execution_data (
  execution_id UUID PRIMARY KEY REFERENCES executions(id) ON DELETE CASCADE,
  data JSONB,  -- input/output for all nodes
  created_at TIMESTAMP DEFAULT NOW()
);

-- Metadata for search/filter (separate from large data)
CREATE TABLE execution_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project-scoped variables with scope enum
CREATE TABLE variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) NOT NULL,
  value VARCHAR(1000) NOT NULL,
  scope VARCHAR(20) DEFAULT 'global',  -- 'global' | 'project'
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(key, project_id)
);

-- Workflow versions (every save = new version)
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  definition JSONB NOT NULL,  -- full workflow JSON snapshot
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Tag many-to-many
CREATE TABLE workflow_tags (
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (workflow_id, tag_id)
);
```

### 8.3 Critical Separation: execution_entity vs execution_data

n8n separates execution metadata from execution data for performance:
- **`execution_entity`**: status, start_time, end_time, mode, workflow_id, triggered_by — fast to query
- **`execution_data`**: full node input/output JSON — large, slow, rarely needed

This allows the executions list to load quickly without fetching megabytes of execution data.

**FlowHolt must do the same.**

---

## 9. FlowHolt Data Architecture Summary

```
Workflow Data Flow:
─────────────────────────────────────────────────────────
Trigger fires → Executor creates execution record
  → Nodes run sequentially
  → Each node gets input items from previous node output
  → Item linking maintained (pairedItem tracking)
  → Binary data stored per FLOWHOLT_BINARY_DATA_MODE
  → $execution.customData buffer accumulates
  → On completion: flush metadata to execution_metadata
  → Write final execution_data snapshot
  → Update execution status (success/error/timeout)

Development mode (editor):
  → If node has pinnedData → skip execution, return pinned
  → Mode = "test" → always show output in editor
  → Can edit pinned data and re-run

Storage layers:
  → Supabase (Postgres) — primary: workflows, executions, users, creds
  → Redis (optional) — queuing, pub/sub for real-time status
  → S3/filesystem (optional) — binary data storage
  → In-memory — active execution state during run
```
