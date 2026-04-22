---
title: Expression Language
type: concept
tags: [expressions, data-model, data-mapping, variables, jmespath, luxon, n8n, transform]
sources: [n8n-docs, n8n-domain-3-deep-read]
updated: 2026-04-16
---

# Expression Language

FlowHolt's expression language is how users reference and transform data inside node parameter fields. Based on deep research into n8n's proven expression system.

---

## Data Model Foundation

All data in FlowHolt flows as a **standardized array-of-objects**:

```json
[
  { "json": { "name": "Alice", "score": 95 } },
  { "json": { "name": "Bob", "score": 87 } }
]
```

Each item in the array has:
- **`json`** — primary data (arbitrary nested object)
- **`binary`** — file data (base64 encoded + metadata: mimeType, fileName, fileExtension)

Nodes process arrays by **iterating over items**. Users write expressions for "the current item" — the array loop is invisible.

---

## Expression Syntax

Expressions use Handlebars-style delimiters:

```
{{ $json.fieldName }}
{{ $json.name.toUpperCase() }}
{{ $now.plus(7, 'days').toISO() }}
```

- Static text in a parameter field = literal string
- `{{ ... }}` = evaluated expression
- Expressions are **single-line** by default
- Multi-line logic requires IIFE: `{{ (() => { ... return result; })() }}`

---

## Context Variables

Available in all expressions:

| Variable | What it gives you |
|----------|------------------|
| `$json` | JSON data of current input item |
| `$binary` | Binary data of current input item |
| `$input.item` | Full current item (json + binary) |
| `$input.all()` | All input items as array |
| `$input.first()` | First input item |
| `$input.last()` | Last input item |
| `$input.params` | Config params of previous node |
| `$("NodeName").item` | Linked item from named node |
| `$("NodeName").all()` | All items from named node |
| `$("NodeName").first()` | First item from named node |
| `$("NodeName").last()` | Last item from named node |
| `$now` | Current moment (Luxon DateTime) |
| `$today` | Today at midnight (Luxon DateTime) |
| `$workflow.id` | Workflow ID |
| `$workflow.name` | Workflow name |
| `$workflow.active` | Is workflow activated |
| `$exec.id` | Execution ID |
| `$exec.mode` | `test` / `production` / `evaluation` |
| `$exec.resumeUrl` | Resume URL (for callback triggers) |
| `$vars.myVar` | Custom workspace variable |
| `$itemIndex` | Position of current item in input array |
| `$runIndex` | Current loop run index |
| `$if(cond, t, f)` | Inline conditional |
| `$ifEmpty(val, default)` | Null-safe fallback |
| `$jmespath(obj, expr)` | JMESPath query |
| `$max(...nums)` / `$min(...nums)` | Number comparison helpers |
| `$fromAI(key, desc, type)` | AI-proposed parameter value |

---

## Method Library

Methods are called on typed values with dot notation. All are chainable.

### Strings
```javascript
"hello world".toUpperCase()        // "HELLO WORLD"
"hello world".toTitleCase()        // "Hello World"
"hello world".toSnakeCase()        // "hello_world"
"user@example.com".isEmail()       // true
"https://example.com".extractDomain() // "example.com"
"raw text".hash("SHA256")          // hex hash
"aGVsbG8=".base64Decode()          // "hello"
"hello world".split(" ")           // ["hello", "world"]
"  trim me  ".trim()               // "trim me"
"src text".replace("src", "dst")   // "dst text"
```

Key string methods: `toUpperCase`, `toLowerCase`, `toTitleCase`, `toSentenceCase`, `toSnakeCase`, `extractEmail`, `extractUrl`, `extractDomain`, `isEmail`, `isUrl`, `isNumeric`, `parseJson`, `toDateTime`, `toNumber`, `toBoolean`, `replace`, `replaceAll`, `split`, `trim`, `includes`, `startsWith`, `hash`, `base64Encode`, `base64Decode`, `urlEncode`, `urlDecode`, `quote`, `slice`, `match`

### Arrays
```javascript
[1, 2, 2, 3].removeDuplicates()    // [1, 2, 3]
["a", "b", "c"].join(", ")         // "a, b, c"
[10, 20, 30].sum()                 // 60
[10, 20, 30].average()             // 20
[{name:"a"},{name:"b"}].pluck("name") // ["a", "b"]
[[1,2],[3,4]].chunk(2)             // [[1,2],[3,4]]
[3,1,2].sort()                     // [1,2,3]
[1,2,3].union([2,3,4])             // [1,2,3,4]
```

Key array methods: `filter`, `find`, `map`, `pluck`, `compact`, `removeDuplicates`, `union`, `intersection`, `difference`, `join`, `reduce`, `sum`, `average`, `min`, `max`, `slice`, `chunk`, `append`, `concat`, `reverse`, `sort`, `first`, `last`, `randomItem`, `isEmpty`, `length`

### Objects
```javascript
{a:1, b:2}.keys()                  // ["a", "b"]
{a:1, b:null}.compact()            // {a:1}
{a:1}.merge({b:2})                 // {a:1, b:2}
{a:1, b:2}.removeField("b")        // {a:1}
{a:1, b:2}.hasField("a")           // true
```

Key object methods: `keys`, `values`, `hasField`, `merge`, `compact`, `removeField`, `keepFieldsContaining`, `removeFieldsContaining`, `toJsonString`, `isEmpty`

### DateTime (Luxon-based)
```javascript
$now                               // Current DateTime
$now.plus(7, 'days')               // Add 7 days
$now.minus(1, 'month')             // Subtract 1 month
$now.toFormat('dd/MM/yyyy')        // Custom format string
$now.toRelative()                  // "3 hours ago"
$now.diff($past, 'days')           // Days difference
$now.startOf('month')              // First moment of month
$now.setZone('America/New_York')   // Convert timezone
"2024-01-15".toDateTime()          // Parse string → DateTime
```

Key DateTime fields: `year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`, `quarter`, `weekday`, `weekNumber`, `locale`, `zone`, `monthLong`, `weekdayShort`

Key DateTime methods: `plus`, `minus`, `diff`, `diffToNow`, `set`, `startOf`, `endOf`, `toISO`, `toFormat`, `toLocaleString`, `toRelative`, `setZone`, `toUTC`, `equals`, `isBetween`

### Numbers
```javascript
3.7.round()                        // 4
-5.abs()                           // 5
42.toLocaleString('de-DE')         // "42"
3.14.isInteger()                   // false
```

Key number methods: `round`, `ceil`, `floor`, `abs`, `toString`, `toBoolean`, `toLocaleString`, `format`, `isInteger`, `isEven`, `isOdd`

---

## Data Mapping UI

The visual panel for building expressions without typing:

### INPUT Panel (Previous node's output)
Three views:
1. **Schema** — simplified structure from first item only; collapsed by default
2. **Table** — full dataset in rows/columns; good for quick inspection
3. **JSON** — raw JSON tree; expandable nested fields

**Drag and drop:** Drag any field from INPUT panel → node parameter field → expression auto-generated: `{{ $json.fieldName }}`

**Copy as expression:** Right-click any field → "Copy Item Path" → pastes `$json.path.to.field`

### Expression Editor
- Handlebars syntax with syntax highlighting
- Real-time error detection
- Autocomplete for context variables and methods
- Shows resolved preview value as you type

### FlowHolt design requirements
- **INPUT panel must show both Schema and Table views** — different users prefer different views
- **Drag-to-expression is non-negotiable** — it's the primary UX for non-technical users
- **Real-time preview** in expression editor is critical for debugging
- Copy-as-expression accelerates power users

---

## Data Pinning

Save node output and reuse it across test executions — avoids hitting external APIs repeatedly during development.

**How it works:**
1. Run the workflow in test mode
2. Click "Pin" on any node's output panel
3. All future test runs use the pinned data instead of executing that node
4. Pinned data is editable (for edge case testing)
5. Unpin to resume live execution

**Constraints:**
- Dev/test only — never applies to production executions
- Cannot pin binary data
- Pinned data is per-workflow, per-node

**Why it matters:** Without data pinning, users must trigger external webhooks / make API calls every time they test a workflow. Pinning turns iterative development from painful to fast.

---

## Variables

### Custom Variables
Workspace-level key-value pairs set through the UI:

```javascript
$vars.apiEndpoint     // "https://api.example.com"
$vars.retryLimit      // "3"  ← always a string; parse with .toNumber()
```

**Scoping:**
- **Workspace-level**: Available across all workflows in a workspace
- **Project-level** (if FlowHolt adds multi-project): Available within project only
- Read-only — can't be set at runtime (use execution context for mutable state)

**Naming rules:** A-Z, a-z, 0-9, underscore. Max 50 chars key, 1000 chars value.

### Context Variables
Auto-provided by FlowHolt at execution time. Not editable. See full table above.

---

## JMESPath

Query language for extracting data from complex JSON. Alternative to chained array methods for deeply nested structures.

```javascript
$jmespath($json, "people[*].first")          // all first names
$jmespath($json, "people[?age > `18`]")      // adults only
$jmespath($json, "dogs.*.age")               // all dog ages (from object)
$jmespath($json, "people[].[first, last]")   // name pairs
```

**Expose as power feature.** For common operations, the array method API is more intuitive. JMESPath shines for:
- Complex nested object traversal
- Multi-level filtering in a single expression
- Data that requires projection + filtering together

---

## Luxon and Timezones

All DateTime operations use Luxon. Timezone handling is automatic based on workspace configuration.

**Workspace timezone setting:** Applies to all workflow executions. Individual workflows can override.

**Common patterns:**
```javascript
// Current time in specific zone
$now.setZone('Europe/London')

// Parse an ISO string
"2024-01-15T10:30:00Z".toDateTime()

// Format for display
$now.toFormat('dd/MM/yyyy HH:mm')

// Relative time (for UX)
pastDate.toRelative()   // "2 days ago"

// Business logic
$now.startOf('week')    // Monday 00:00:00
$now.endOf('month')     // Last moment of month
```

---

## FlowHolt Implementation Plan

### Phase 1 (MVP)
- `{{ }}` delimiter
- Context variables: `$json`, `$input`, `$now`, `$today`, `$workflow`, `$vars`, `$exec`
- String methods: top 15 most-used
- Array methods: top 15 most-used
- Object methods: top 8 most-used
- Number + Boolean methods
- DateTime (Luxon): full support
- Data Mapping UI: Schema + JSON views, drag-to-expression
- Expression editor with real-time preview

### Phase 2
- Data pinning
- JMESPath support via `$jmespath()`
- `$fromAI()` for AI-proposed parameter values
- Full method library (200+ methods)
- Table view in mapping UI
- Copy-as-expression from field right-click

### Phase 3
- Custom expression functions (user-defined)
- Expression autocomplete with type inference
- Expression testing sandbox in inspector

---

## Related Pages

- [[wiki/concepts/studio-anatomy]] — expression editor in node inspector
- [[wiki/concepts/ai-agents]] — `$fromAI()` in tool parameters
- [[wiki/concepts/data-store-functions]] — variables and data tables
- [[wiki/concepts/execution-model]] — execution context variables
- [[wiki/concepts/error-handling]] — expression error types and error context objects
- [[wiki/entities/n8n]] — n8n's expression language source
- [[wiki/sources/flowholt-plans]] — plan files 50, 53
