# Spec 92 — FlowHolt Data Stores & Variables System Deep Spec
**Source research:** Make.com Data Stores, Make Scenario Variables, Make Custom Variables, n8n global vars
**Status:** Final specification

---

## 1. Overview

FlowHolt needs a three-tier variable/data system:

1. **Workflow Variables** — temporary, single workflow run (Make: Scenario Variables)
2. **Workspace Variables** — persistent across runs, shared within a workspace (Make: Custom Variables / n8n: $vars global vars)
3. **Data Stores** — structured key-value database with optional schema (Make: Data Stores)

These three layers cover every data-passing need without requiring external databases for common use cases.

---

## 2. Tier 1: Workflow Variables (Run-Scoped)

### 2.1 What they are
- Temporary values that exist only during a single workflow execution
- Set by "Set Variable" node, accessed by "Get Variable" node (or `{{$vars.name}}` in expressions)
- Lifetime: "One cycle" (available only in current branch iteration) OR "One execution" (available anywhere in the execution)

### 2.2 Why they exist
- Pass data between branches of a Router (Make calls this cross-route sharing)
- Avoid repeating the same computation multiple times
- Create counters or flags within a single run

### 2.3 Node Types

**Set Variable node**
```
Parameters:
  - variable_name: string (required, alphanumeric + _ + $)
  - variable_value: any (expression supported)
  - lifetime: "one_cycle" | "one_execution" (default: "one_execution")
```

**Set Multiple Variables node**
```
Parameters:
  - variables: array of { name, value, lifetime }
```

**Get Variable node**
```
Parameters:
  - variable_name: string
Output: { value: <any> }
```

**Get Multiple Variables node**
```
Parameters:
  - variable_names: array of string
Output: { name1: value1, name2: value2, ... }
```

### 2.4 Expression Access
In any expression field, workflow variables can be referenced as:
- `{{$vars.myVar}}` — shorthand
- `{{$execution.variables.myVar}}` — full path (n8n-style)

### 2.5 Lifetime clarification
- **One cycle**: For Iterator/LoopOverItems nodes — variable resets each iteration. Useful for per-item accumulators.
- **One execution**: Lives for the entire execution, accessible anywhere after it was set (even in different router branches via Get Variable).

---

## 3. Tier 2: Workspace Variables (Custom Variables / Global Variables)

### 3.1 What they are
- Persistent key-value pairs stored in the database
- Survive across multiple workflow runs
- Scoped to Workspace (equivalent to Make's "Team" scope) or Organization
- Available to ALL workflows in the scope

### 3.2 Types
| Type | Description |
|------|-------------|
| `text` | String value, max 4KB |
| `number` | Numeric (integer or decimal) |
| `boolean` | true / false |
| `date` | ISO 8601 date string |

### 3.3 Use Cases
- Feature flags: `TestMode = true/false` — route workflow differently
- Global config: `API_BASE_URL = "https://api.example.com"` — change in one place, update all workflows
- Counters: `EmailsSentThisWeek = 247` — increment across runs
- Shared secrets alternative (non-sensitive only — NOT encrypted, stored as plain text)

> **Security note:** Workspace Variables are NOT encrypted. Do NOT store passwords, API keys, or PII. Use Vault/Connections for secrets.

### 3.4 CRUD Operations
| Operation | UI Location | Access |
|-----------|------------|--------|
| Create | Settings → Variables → "+ Add Variable" | Admin/Owner |
| Edit | Settings → Variables → Edit button | Admin/Owner |
| Delete | Settings → Variables → Delete (shows impacted workflows) | Admin/Owner |
| View | Settings → Variables (list) | All members |
| History | Settings → Variables → History dropdown | Admin/Owner |

### 3.5 Variable naming rules
- Max 128 characters
- Only letters, digits, `$`, `_`
- Cannot start with a digit
- Name is PERMANENT once saved (cannot be renamed — changing it breaks references)
- Label (display name) CAN be changed at any time

### 3.6 Update behavior
- A workflow can READ and WRITE workspace variables during execution
- Write (update) takes effect only AFTER the execution completes
- Other concurrent executions see the OLD value during the run
- This prevents race conditions in simultaneous executions

### 3.7 Scoping
| Scope | Description | Who can edit |
|-------|-------------|--------------|
| Organization | Available to all teams in the org | Org Owner/Admin |
| Workspace/Team | Available to all workflows in the team | Team Admin/Member |

### 3.8 Access in expressions
```
{{$workspace.variables.myVar}}     // workspace-scoped
{{$org.variables.myVar}}           // org-scoped (enterprise)
{{$env.MY_VAR}}                    // environment variable (self-hosted)
```

### 3.9 History Tracking
Every change to a workspace variable is logged:
- Who changed it (user name + email)
- When (timestamp)
- Previous value → new value
- Available in Settings → Variables → "Show history"
- Retained for 12 months

### 3.10 Permission Matrix
| Role | Read | Create | Edit | Delete |
|------|------|--------|------|--------|
| Owner | ✓ | ✓ | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ |
| Member | ✓ | ✓ (team only) | ✓ (team only) | ✓ (team only) |
| Viewer | ✓ | — | — | — |
| Billing | — | — | — | — |

---

## 4. Tier 3: Data Stores (Persistent Structured Database)

### 4.1 What they are
- A simple key-value database with optional typed schema
- Persist data between workflow runs and across scenarios
- Visible in the UI with table view, CRUD capabilities
- Can be used from multiple workflows simultaneously

### 4.2 Storage limits (by plan)
| Plan | Storage per 1k credits | Max stores |
|------|------------------------|------------|
| Free | 1 MB (1 data store minimum) | 1 |
| Pro | 1 MB per 1,000 credits | 100 |
| Business | 1 MB per 1,000 credits | 500 |
| Enterprise | Negotiated | 1,000 |

Minimum data store size: **1 MB**
Maximum record size: **15 MB** per record
Storage is shared across all stores in the organization.

### 4.3 Data Store Modules (CRUD node types)

**Add / Replace Record**
```
Parameters:
  - data_store: picker
  - key: string (auto-generated UUID if blank)
  - overwrite_existing: boolean
  - record: object (fields matching data structure)
Behavior: Create or overwrite by key
```

**Check Existence**
```
Parameters:
  - data_store: picker
  - key: string
Output: { exists: boolean }
```

**Count Records**
```
Parameters:
  - data_store: picker
Output: { count: number }
```

**Delete Record**
```
Parameters:
  - data_store: picker
  - key: string
```

**Delete All Records**
```
Parameters:
  - data_store: picker
Warning: irreversible
```

**Get Record**
```
Parameters:
  - data_store: picker
  - key: string
  - return_wrapped: boolean (wrap output same as Search Records)
Output: { key, fields... }
```

**Search Records**
```
Parameters:
  - data_store: picker
  - filter: [ { column, operator, value }, ... ]
  - sort: { column, order: "asc" | "desc" }
  - limit: number (default 10)
  - continue_if_empty: boolean
Output: array of matched records
```

**Update Record**
```
Parameters:
  - data_store: picker
  - key: string
  - insert_if_missing: boolean (upsert behavior)
  - record: object (partial update of fields)
```

### 4.4 Data Structures (Schema System)
Data stores can optionally have a typed schema called a **Data Structure**.

**What it defines:**
- Column names and types for each field
- Columns: Text, Number, Boolean, Date, Time, Date+Time, Array, Object

**How to create:**
1. When creating a Data Store → click "Create data structure"
2. OR drag a JSON sample into the Data Structure generator → auto-creates columns

**Schema generator:**
```json
// Sample JSON input:
{ "name": "John", "age": 30, "phone": { "mobile": "555-1234" } }

// Auto-generated structure:
- name: Text
- age: Number
- phone.mobile: Text (nested using dot notation)
```

**Strict mode:** If enabled, records with extra fields not in schema are rejected.

**Important schema rules:**
- Field **names** are permanent identifiers (cannot be renamed without data loss)
- Field **labels** can be changed freely
- Renaming a field makes old data inaccessible (key mismatch)
- To rename safely: create new field → copy data → empty old field → delete old field

### 4.5 Data Store UI (Settings → Data Stores)
- Table view of all records with inline editing
- Add row button (new record, highlighted green)
- Delete rows (checkbox selection → delete button)
- Edit cell by hovering → click edit icon
- Save / Discard changes buttons
- "Scenarios using this store" icon → see which workflows use it

### 4.6 Backup Strategy
To back up a data store (no native export):
1. Create a "backup" data store with same structure
2. Build a workflow: Search Records (source) → Add/Replace Record (backup)
3. Run the backup workflow manually or on schedule

### 4.7 Data Store vs Variables: When to use which

| Requirement | Use |
|-------------|-----|
| Share value between modules in same run | Workflow Variable |
| Share value between different router branches | Workflow Variable (Get Variable) |
| Pass config that rarely changes | Workspace Variable |
| Feature flag (TestMode) | Workspace Variable |
| Store arbitrary records (like a database) | Data Store |
| Cache API responses between runs | Data Store |
| Count items across multiple runs | Data Store (or Workspace Variable) |
| Store sensitive credentials | Vault / Connections (NOT Variables/DataStore) |

---

## 5. Converger Pattern (No Native Module)

Make explicitly documents that **there is no converger module**. n8n uses the Merge node. FlowHolt follows n8n's approach with a native Merge node, but also supports Make's variable-based workarounds.

### 5.1 FlowHolt native solution: Merge Node
Already exists in FlowHolt (Sprint 27/28). Supports:
- Append
- Combine by field matching (SQL inner join behavior)
- Combine by position
- Combine all combinations (cross join)
- Choose branch (wait for both inputs, pass only one)

### 5.2 Variable-based converger (Make workaround, also supported)
For cases where Merge Node can't be used:
1. Set Variable at end of each router branch (save data to `outputBundle`)
2. Add extra filter-free route that uses Get Variable to retrieve and process data
3. Or: use Data Store as intermediary (store data → retrieve in common sequence)

---

## 6. Incremental Variables (Make-specific feature adopted)

Make has "Incremental Variables" — a special variable that auto-increments per execution.

FlowHolt adopts this as a workspace variable with `auto_increment: true` flag:
- Initial value: 1
- On each execution that reads/writes it, automatically increments by 1
- No locking needed (DB-level atomic increment)
- Use case: `invoice_number`, `order_id`, sequential counters

```
In expression: {{$workspace.variables.invoiceNumber.next()}}
// Returns current value AND increments atomically
```

---

## 7. Backend Schema

### 7.1 Workflow Variables (runtime, not persisted)
- Stored in execution context (in-memory or Redis during execution)
- Key: `{execution_id}:{variable_name}:{lifetime}`
- Flushed on execution completion

### 7.2 Workspace Variables (database)
```sql
CREATE TABLE workspace_variables (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  scope TEXT DEFAULT 'workspace',  -- 'workspace' | 'organization'
  name TEXT NOT NULL,               -- permanent identifier
  label TEXT,                       -- display name, changeable
  data_type TEXT NOT NULL,          -- 'text' | 'number' | 'boolean' | 'date'
  value TEXT,                       -- stored as text, cast on read
  auto_increment BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, scope, name)
);

CREATE TABLE workspace_variable_history (
  id UUID PRIMARY KEY,
  variable_id UUID REFERENCES workspace_variables(id),
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  previous_value TEXT,
  new_value TEXT
);
```

### 7.3 Data Stores (database)
```sql
CREATE TABLE data_stores (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,
  data_structure_id UUID REFERENCES data_structures(id) NULLABLE,
  storage_mb INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_structures (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,  -- permanent identifier
  label TEXT,
  strict BOOLEAN DEFAULT FALSE,
  fields JSONB,  -- [{name, type, required}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_store_records (
  id UUID PRIMARY KEY,
  data_store_id UUID REFERENCES data_stores(id),
  key TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_store_id, key)
);
```

---

## 8. UI Location for All Three Tiers

```
Left Rail:
├── Variables (combined section)
│   ├── Workflow Variables (read-only in UI, set during execution)
│   ├── Workspace Variables → CRUD table
│   └── Organization Variables → CRUD table (enterprise)
│
├── Data Stores (separate section)
│   ├── [list of stores with storage used]
│   └── [+ Create Data Store] button
│
├── Data Structures (separate section, under Data Stores)
│   └── [list of schemas]
```

In workflow settings panel (per workflow):
```
Variables tab:
├── Workflow variable definitions (optional pre-declarations for documentation)
└── "View live values during execution" (execution context inspector)
```

---

## 9. FlowHolt Decision Summary

| Feature | n8n | Make | FlowHolt |
|---------|-----|------|---------|
| Workflow-scoped vars | `$execution.vars`, Set node | Scenario vars (Set/Get) | **Adopt Make's Set/Get nodes + expression access** |
| Global/persistent vars | `$vars` global (Pro+) | Custom variables (Pro+) | **Adopt Make model: workspace + org scoping** |
| Variable history log | No | Yes | **Adopt Make's history log** |
| Data Stores | No native (use external DB) | Full Data Store system | **Adopt Make's full Data Store system** |
| Schema/Data Structures | No native | Data Structures | **Adopt Make's Data Structure system** |
| Incremental variables | No | Yes | **Adopt as special workspace variable type** |
| Converger | Merge Node (native) | Workarounds only | **Keep Merge Node + also support variable workarounds** |
| Variable types | string/number/boolean | text/number/boolean/date | **Adopt Make's 4 types + add array/object** |
