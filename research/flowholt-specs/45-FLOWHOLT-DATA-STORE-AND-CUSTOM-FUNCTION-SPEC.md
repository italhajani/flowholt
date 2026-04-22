# FlowHolt Data Store And Custom Function Specification

This file defines the data store system, data structures, variable types, and custom function capabilities for FlowHolt workflows.

It is grounded in:
- Make corpus: `research/make-help-center-export/pages_markdown/data-stores.md` — data stores as simple databases, storage allowance (1 MB per 1,000 credits, min 1 MB, max 1,000 stores per org), modules (Add/Replace, Check Existence, Count, Delete All, Delete, Get, Search, Update), ACID transaction support, record size limit (15 MB), backup via scenario
- Make corpus: `research/make-help-center-export/pages_markdown/data-structures.md` — schema definition for data stores, generator from sample data, strict mode, field types, usage tracking (which stores and scenarios use a structure)
- Make corpus: `research/make-help-center-export/pages_markdown/variables.md` — 4 variable types: system variables (built-in, read-only), scenario variables (Set Variable module, per-run), custom variables (org/team level, cross-scenario, Pro+), incremental variables (counters persisted across runs)
- Make corpus: `research/make-help-center-export/pages_markdown/custom-functions.md` — Enterprise feature, JavaScript ES6, 300ms execution limit, 5000 char limit, synchronous only, no HTTP requests, no recursion, no calling other custom functions, version history, debug console, can call built-in functions via `iml` object, team-scoped (Team Admin to create, Team Member to use)
- Make corpus: `research/make-help-center-export/pages_markdown/flow-control.md` — Repeater (generates N bundles), Iterator (array → bundles), Array Aggregator (bundles → array)
- `backend/app/models.py` — existing `VaultAssetKind` includes "variable", `VaultScope`, `VaultVariableSummary`

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §1 Data stores | `research/make-help-center-export/pages_markdown/data-stores.md` | 8 CRUD modules, 1MB/1000 credits, 15MB record limit, ACID |
| §2 Data structures | `research/make-help-center-export/pages_markdown/data-structures.md` | Schema definition, strict mode, field types, usage tracking |
| §3 Variables | `research/make-help-center-export/pages_markdown/variables.md` | 4 variable types: system/scenario/custom/incremental |
| §4 Custom functions | `research/make-help-center-export/pages_markdown/custom-functions.md` | JS ES6, 300ms limit, 5000 char, Enterprise, `iml` object |
| §5 n8n equivalents | `research/n8n-docs-export/pages_markdown/data/` | n8n data tables, variables |
| §5 n8n data tables | `research/n8n-docs-export/pages_markdown/data/n8n-data-tables.md` | n8n's equivalent to data stores |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Data tables (n8n equiv) | `n8n-master/packages/nodes-base/nodes/Spreadsheet/` |
| Variables controller | `n8n-master/packages/cli/src/controllers/variables.controller.ts` |
| Variables entity | `n8n-master/packages/cli/src/databases/entities/Variables.ts` |
| Code node sandbox | `n8n-master/packages/nodes-base/nodes/Code/Code.node.ts` |
| Code execution context | `n8n-master/packages/core/src/execution-engine/node-execution-context/` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Data stores | n8n Data Tables (recent, native DB tables) | Make-style data stores + n8n table query capabilities |
| Variables | Instance-global workspace variables | Workspace-scoped, team-promotable, secret type |
| Custom functions | No equivalent (use Code node) | Custom functions as Enterprise feature (Make pattern) |
| Code node | JS + Python, run-once-for-all or once-per-item | Same + allowlisted npm modules |

### This file feeds into

| File | What it informs |
|------|----------------|
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | `DataStore`, `DataStructure` entities |
| `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | Workspace variables (`$vars`) |
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | Data store node types |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Data stores as backend domain module |
| `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | `/dashboard/data-stores`, `/dashboard/functions` routes |

---

## 1. Data store system

### Make's data store model

Make's data stores are simple key-value databases scoped to a team:
- Storage allocated from credits (1 MB per 1,000 credits)
- Maximum 1,000 data stores per organization
- Minimum 1 MB per data store
- Record max size: 15 MB
- ACID transaction support (commit/rollback)
- 8 modules for CRUD operations
- Data structure defines the schema

### FlowHolt data store model

FlowHolt extends Make's model with workspace scoping, environment isolation, and richer query capabilities.

```python
class DataStore(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: str | None = None
    data_structure_id: str | None = None    # null = key-only store
    size_mb: int = 1                        # allocated size
    used_bytes: int = 0
    record_count: int = 0
    environment: Literal["shared", "staging", "production"] = "shared"
    created_by: str | None = None
    created_at: str
    updated_at: str

class DataStoreRecord(BaseModel):
    key: str                                # unique primary key
    data: dict[str, Any]                    # record fields
    created_at: str
    updated_at: str
```

### Data store scoping

| Scope | Visibility | Use case |
|---|---|---|
| **Shared** | All environments (draft, staging, production) | Lookup tables, configuration |
| **Staging** | Staging executions only | Test data isolation |
| **Production** | Production executions only | Live operational data |

### Storage allowance

Following Make's formula:

| Plan | Credits/month | Data storage | Max stores |
|---|---|---|---|
| Free | 1,000 | 1 MB | 5 |
| Starter | 10,000 | 10 MB | 50 |
| Pro | 25,000 | 25 MB | 200 |
| Teams | 100,000 | 100 MB | 500 |
| Enterprise | Custom | Custom | 1,000 |

### Data store modules (Studio nodes)

FlowHolt implements data store operations as Studio node types:

| Node type | Description | ACID |
|---|---|---|
| `data_store_add` | Add or replace a record | Yes |
| `data_store_get` | Get a record by key | No |
| `data_store_update` | Update a record (with optional upsert) | Yes |
| `data_store_delete` | Delete a record by key | Yes |
| `data_store_delete_all` | Delete all records | Yes |
| `data_store_search` | Search records with filters | No |
| `data_store_count` | Count records | No |
| `data_store_exists` | Check if a key exists | No |

### CRUD endpoints

```
POST   /api/workspaces/{id}/data-stores                          # create store
GET    /api/workspaces/{id}/data-stores                          # list stores
GET    /api/workspaces/{id}/data-stores/{ds_id}                  # get store details
PATCH  /api/workspaces/{id}/data-stores/{ds_id}                  # update store settings
DELETE /api/workspaces/{id}/data-stores/{ds_id}                  # delete store

GET    /api/workspaces/{id}/data-stores/{ds_id}/records          # list/search records
POST   /api/workspaces/{id}/data-stores/{ds_id}/records          # add record
GET    /api/workspaces/{id}/data-stores/{ds_id}/records/{key}    # get record
PUT    /api/workspaces/{id}/data-stores/{ds_id}/records/{key}    # update record
DELETE /api/workspaces/{id}/data-stores/{ds_id}/records/{key}    # delete record
DELETE /api/workspaces/{id}/data-stores/{ds_id}/records          # delete all records
```

### Transaction support

Data store modules are ACID-compatible:
- With `auto_commit` enabled (default): each data store operation commits immediately
- With `auto_commit` disabled: operations are held until the execution cycle ends
- Rollback handler reverts all uncommitted data store changes
- Commit handler commits all pending data store changes
- `InconsistencyError` if concurrent workflows modify the same record during rollback

---

## 2. Data structures

### Make's data structure model

- Schema definition with field name, type, and optional constraints
- Generator: paste sample JSON → auto-generate structure
- Strict mode: reject payloads with extra fields
- Supported types: text, number, boolean, date, collection (nested object), array
- Used by data stores, JSON modules, webhook definitions

### FlowHolt data structure model

```python
class DataStructure(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: str | None = None
    fields: list[DataStructureField]
    strict: bool = False                # reject extra fields
    created_by: str | None = None
    created_at: str
    updated_at: str

class DataStructureField(BaseModel):
    key: str                            # unique field identifier (immutable)
    label: str                          # display label (mutable)
    type: Literal["text", "number", "boolean", "date", "datetime", "collection", "array", "json"]
    required: bool = False
    default: Any | None = None
    nested_fields: list["DataStructureField"] | None = None  # for collection/array types
```

### Data structure generator

Following Make:
1. User pastes sample JSON
2. System infers field types and structure
3. User reviews and adjusts
4. Structure is created

### CRUD endpoints

```
POST   /api/workspaces/{id}/data-structures                     # create
GET    /api/workspaces/{id}/data-structures                     # list
GET    /api/workspaces/{id}/data-structures/{ds_id}             # get
PATCH  /api/workspaces/{id}/data-structures/{ds_id}             # update
DELETE /api/workspaces/{id}/data-structures/{ds_id}             # delete
GET    /api/workspaces/{id}/data-structures/{ds_id}/usage       # which stores/workflows use this
```

---

## 3. Variable types

### Make's variable model

Make has 4 variable types:

1. **System variables** — built-in, read-only, available everywhere
2. **Scenario variables** — set via Set Variable module, exist only during execution
3. **Custom variables** — org or team level, persist across executions and scenarios (Pro+)
4. **Incremental variables** — counters that persist across runs, scoped to a scenario

### FlowHolt variable model

FlowHolt maps these to its existing vault system plus new concepts:

#### System variables

Built-in, read-only variables available in all expressions:

| Variable | Description |
|---|---|
| `$execution.id` | Current execution ID |
| `$execution.start_time` | Execution start timestamp |
| `$execution.environment` | "draft", "staging", or "production" |
| `$workflow.id` | Current workflow ID |
| `$workflow.name` | Current workflow name |
| `$workflow.version` | Current version number |
| `$workspace.id` | Current workspace ID |
| `$workspace.name` | Current workspace name |
| `$user.id` | Triggering user ID (if applicable) |
| `$user.email` | Triggering user email |
| `$step.index` | Current step position in execution |
| `$step.id` | Current step ID |
| `$trigger.type` | Trigger type (manual, webhook, schedule, etc.) |
| `$trigger.data` | Raw trigger input data |

#### Workflow variables (scenario variables)

Set within a workflow execution, exist only for that run:

```python
# Set Variable node config
class SetVariableConfig(BaseModel):
    variable_name: str
    value: Any                          # can use expressions

# Set Multiple Variables node config
class SetMultipleVariablesConfig(BaseModel):
    variables: dict[str, Any]           # name → value
```

These are implemented as Studio nodes in the "Tools" category.

#### Custom variables (workspace/org/team)

Persist across executions and workflows:

```python
class CustomVariable(BaseModel):
    id: str
    scope: Literal["organization", "team", "workspace"]
    scope_id: str                       # org_id, team_id, or workspace_id
    name: str
    value: Any
    description: str | None = None
    created_by: str | None = None
    created_at: str
    updated_at: str
```

**Rules (matching Make):**
- Org-level custom variables are visible in all scenarios across the org
- Team-level custom variables are visible in all scenarios within that team
- Workspace-level custom variables are visible in all workflows within that workspace
- Can be read in expressions and modified via the "Update Custom Variable" module
- **Important:** If a custom variable is modified during a running execution, the current execution continues using the old value. The new value is only available in the next execution start.

#### Incremental variables

Counters scoped to a workflow that persist across executions:

```python
class IncrementalVariable(BaseModel):
    id: str
    workflow_id: str
    name: str
    value: int = 0
    reset_on_execution: bool = False    # true = resets each run; false = persists
```

Implemented as "Increment Function" in the Tools module.

### Variable management endpoints

```
GET    /api/workspaces/{id}/variables                           # list workspace variables
POST   /api/workspaces/{id}/variables                           # create
PATCH  /api/workspaces/{id}/variables/{var_id}                  # update
DELETE /api/workspaces/{id}/variables/{var_id}                  # delete

GET    /api/organizations/{id}/variables                        # list org variables
POST   /api/organizations/{id}/variables                        # create (admin only)
PATCH  /api/organizations/{id}/variables/{var_id}               # update (admin only)
DELETE /api/organizations/{id}/variables/{var_id}               # delete (admin only)

GET    /api/teams/{id}/variables                                # list team variables
POST   /api/teams/{id}/variables                                # create (team admin only)
PATCH  /api/teams/{id}/variables/{var_id}                       # update (team admin only)
DELETE /api/teams/{id}/variables/{var_id}                       # delete (team admin only)
```

---

## 4. Custom functions

### Make's custom function model

- Enterprise feature
- JavaScript ES6
- Created at team level (Team Admin to create, Team Member to use)
- Constraints: 300ms max execution, 5000 chars max, synchronous only, no HTTP, no recursion, no calling other custom functions
- Version history with restore
- Debug console
- Can call built-in functions via `iml` object

### FlowHolt custom function model

```python
class CustomFunction(BaseModel):
    id: str
    scope: Literal["team", "workspace"]
    scope_id: str
    name: str                           # function name (used in expressions)
    description: str | None = None
    code: str                           # JavaScript ES6 body
    parameters: list[FunctionParameter]
    return_type: str | None = None      # hint for mapping panel
    version: int = 1
    created_by: str | None = None
    created_at: str
    updated_at: str

class FunctionParameter(BaseModel):
    name: str
    type: str | None = None             # type hint
    description: str | None = None
    required: bool = True
    default: Any | None = None
```

### Constraints (matching Make)

| Constraint | Limit |
|---|---|
| Max execution time | 300 ms |
| Max code length | 5,000 characters |
| Async code | Not allowed |
| HTTP requests | Not allowed |
| Call other custom functions | Not allowed |
| Recursion | Not allowed |
| Language | JavaScript ES6 |
| 3rd party libraries | Not supported |

### Built-in function access

Custom functions can call FlowHolt's built-in functions via the `fh` object:

```javascript
function myCustomFunction(text) {
    return fh.length(text);     // calls built-in length function
}
```

### Version history

Every save creates a new version:
- Compare consecutive versions
- Restore to any previous version (creates new version with restored content)
- Version retention follows the same plan-based schedule as workflow versions

### Function management endpoints

```
POST   /api/workspaces/{id}/functions                           # create
GET    /api/workspaces/{id}/functions                           # list
GET    /api/workspaces/{id}/functions/{fn_id}                   # get
PATCH  /api/workspaces/{id}/functions/{fn_id}                   # update (saves new version)
DELETE /api/workspaces/{id}/functions/{fn_id}                   # delete
GET    /api/workspaces/{id}/functions/{fn_id}/versions          # list versions
GET    /api/workspaces/{id}/functions/{fn_id}/versions/{v}      # get specific version
POST   /api/workspaces/{id}/functions/{fn_id}/versions/{v}/restore  # restore version
POST   /api/workspaces/{id}/functions/{fn_id}/test              # execute in debug sandbox
GET    /api/workspaces/{id}/functions/{fn_id}/usage             # which workflows use this
```

### Plan gating

| Plan | Custom functions |
|---|---|
| Free | Not available |
| Starter | Not available |
| Pro | Not available |
| Teams | Up to 50 |
| Enterprise | Unlimited |

---

## 5. Flow control nodes

### Make's flow control tools

Make provides: Repeater, Iterator, Array Aggregator. FlowHolt extends with additional flow control.

### FlowHolt flow control node types

| Node type | Description | Make equivalent |
|---|---|---|
| `iterator` | Splits array into individual items | Iterator |
| `aggregator` | Merges items back into array | Array Aggregator |
| `repeater` | Generates N items with counter | Repeater |
| `router` | Conditional branching | Router |
| `filter` | Conditional pass-through | Filter |
| `converger` | Merge multiple branches | Converger |
| `set_variable` | Set a workflow variable | Set Variable |
| `set_multiple_variables` | Set multiple variables | Set Multiple Variables |
| `increment` | Increment a counter variable | Increment Function |
| `sleep` | Pause execution for duration | — (FlowHolt addition) |
| `throw_error` | Conditionally raise an error | — (FlowHolt addition) |

---

## 6. Expression language

### Make's expression system

Make uses a mapping panel with drag-and-drop from previous module outputs. Functions are available in categories: String, Math, Date/Time, Array, General. Custom functions appear alongside built-in ones.

### FlowHolt expression system

FlowHolt uses a similar approach with template expressions:

```
{{ steps.step_1.output.email }}
{{ fh.upper(steps.step_1.output.name) }}
{{ $execution.environment }}
{{ variables.my_counter }}
{{ myCustomFunction(steps.step_1.output.text) }}
```

### Built-in function categories

| Category | Examples |
|---|---|
| String | `length`, `upper`, `lower`, `trim`, `substring`, `replace`, `split`, `join`, `contains`, `startsWith`, `endsWith`, `md5`, `sha256`, `base64Encode`, `base64Decode` |
| Math | `abs`, `ceil`, `floor`, `round`, `min`, `max`, `sum`, `average`, `random` |
| Date/Time | `now`, `parseDate`, `formatDate`, `addDays`, `addHours`, `dateDiff`, `startOfDay`, `endOfDay` |
| Array | `length`, `first`, `last`, `slice`, `map`, `filter`, `sort`, `reverse`, `unique`, `flatten`, `merge` |
| Object | `keys`, `values`, `entries`, `get`, `set`, `merge`, `pick`, `omit` |
| Type | `toString`, `toNumber`, `toBoolean`, `toDate`, `isNull`, `isEmpty`, `typeOf` |
| General | `ifEmpty`, `coalesce`, `switch`, `uuid`, `json.parse`, `json.stringify` |

---

## 7. Sidebar navigation

Following file 40, data stores and functions appear in the dashboard sidebar:

**Data & Assets section:**
- Data Stores → `/dashboard/data-stores`
- Data Structures → `/dashboard/data-structures`
- Functions → `/dashboard/functions`
- Variables → `/dashboard/variables`

---

## 8. Rollout phases

### Phase 1: Variables
- Implement system variables in expression engine
- Implement Set Variable and Set Multiple Variables nodes
- Implement workflow-scoped variables (per-execution)

### Phase 2: Data structures
- Implement data structure CRUD
- Implement data structure generator from JSON sample
- Implement strict mode validation

### Phase 3: Data stores
- Implement data store CRUD with storage allocation
- Implement 8 data store node types
- Implement ACID transaction support
- Implement data store UI (browse, add, edit, delete records)

### Phase 4: Custom variables
- Implement workspace, team, and org-level custom variables
- Implement Update Custom Variable node
- Implement variable management UI and API

### Phase 5: Custom functions
- Implement custom function editor with syntax highlighting
- Implement JavaScript ES6 sandbox with constraints
- Implement built-in function bridge (`fh` object)
- Implement version history and restore
- Implement debug console
- Gate to Teams/Enterprise plans

### Phase 6: Flow control enhancements
- Implement Iterator and Aggregator nodes
- Implement Repeater node
- Implement Sleep node
- Implement Throw Error node
- Implement Increment Function node

---

## 12. Item data types and type coercion (from file 48 §4)

### The 7 FlowHolt data types (aligned with Make)

| Type | Description | Notes |
|---|---|---|
| `text` (string) | Letters, numbers, special chars | Length-validated |
| `number` | Numerical characters | Range-validated by field |
| `boolean` | Yes/No | Rendered as toggle |
| `date` | Date or datetime in ISO 8601 | Calendar picker; Luxon-based |
| `buffer` | Binary data (file content, images) | Auto-converts text↔binary |
| `collection` | Key-value pairs (nested objects) | JSON object |
| `array` | Ordered list of items | Bracket notation |

### Type coercion rules

The expression evaluator must implement Make-compatible type coercion as the default behavior when mapping between node fields.

#### When Array expected:
- array → passed unchanged; other → wrapped as `[value]`

#### When Boolean expected:
- boolean → unchanged; number → `true` (even if 0); text → `"false"` or empty → `false`, else `true`; other → `true` if not null

#### When Buffer expected:
- buffer → unchanged (transcoded if different codepage); boolean/date/number → converted to text then binary; text → utf8 binary; other → validation error

#### When Collection expected:
- collection → unchanged; other → validation error

#### When Date expected:
- date → unchanged; text → attempted parse (must include day/month/year); number → ms since epoch; other → validation error

#### When Number expected:
- number → unchanged; text → attempted parse; other → validation error

#### When Text expected:
- text → unchanged; collection → JSON string; boolean → `"true"`/`"false"`; buffer → text if encoding specified; date → ISO 8601; number → string; array → converted if supports text

### DataError

`DataError` is part of the error taxonomy (file 44) for type validation failures at the node field level during execution. When coercion fails, the step emits a `DataError` that can be caught by error handlers.

### Studio type display

- Each field and output value should display its type label on hover in the inspector
- Date values rendered in ISO 8601 when inspecting output bundles in the Test tab
