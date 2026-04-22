# FlowHolt Expression Language and Data Model Specification

> **Status:** New file created 2026-04-16 from n8n Domain 3 research (25 pages)  
> **Direction:** Adopt n8n's item-array model and `{{ }}` expression syntax as foundation. FlowHolt adds drag-to-expression mapping UX.  
> **Vault:** [[wiki/concepts/expression-language]]  
> **Raw sources:**  
> - n8n data model: `research/n8n-docs-export/pages_markdown/data/` (25 pages)  
> - Key pages: `data-structure.md`, `expressions.md`, `data-mapping.md`, `data-pinning.md`, `variables.md`, `luxon.md`, `jmespath.md`, `binary-data.md`  
> **See also:** `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md`

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source path | Key content |
|---------|----------------|-------------|
| §1 Item-Array Model | `research/n8n-docs-export/pages_markdown/data/data-structure.md` | `{json, binary}` item format, why bundles vs items |
| §1 Item-Array Model | `research/n8n-docs-export/pages_markdown/data/binary-data.md` | BinaryData type, database vs S3 modes |
| §2 Expression Syntax | `research/n8n-docs-export/pages_markdown/data/expressions.md` | `{{ }}` delimiters, full JS support, examples |
| §3 Context Variables | `research/n8n-docs-export/pages_markdown/data/expressions.md` | `$json`, `$input`, `$now`, `$vars`, `$workflow`, `$execution` |
| §3 $input methods | `research/n8n-docs-export/pages_markdown/data/data-mapping.md` | `$input.all()`, `.first()`, `.last()`, `.item` |
| §5 DateTime/Luxon | `research/n8n-docs-export/pages_markdown/data/luxon.md` | Full Luxon reference, timezone handling |
| §6 JMESPath | `research/n8n-docs-export/pages_markdown/data/jmespath.md` | `$jmespath()` examples, JMESPath spec |
| §7 $fromAI() | `research/n8n-docs-export/pages_markdown/advanced-ai/examples-and-tutorials/` | $fromAI usage in tool parameters |
| §8 Data Pinning | `research/n8n-docs-export/pages_markdown/data/data-pinning.md` | Pin output, run with pinned data, pin badge |
| §9 Variables | `research/n8n-docs-export/pages_markdown/data/variables.md` | Workspace variables, secret type |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| `FlowItem` type definition | `n8n-master/packages/workflow/src/Interfaces.ts` → `INodeExecutionData` |
| Expression evaluator | `n8n-master/packages/core/src/expression-evaluator.ts` |
| Expression context | `n8n-master/packages/core/src/execution-engine/node-execution-context/` |
| `$fromAI()` implementation | `n8n-master/packages/core/src/execution-engine/node-execution-context/execute-single-context.ts` |
| Pin data store | `n8n-master/packages/editor-ui/src/stores/pinData.store.ts` |
| INPUT panel component | `n8n-master/packages/editor-ui/src/components/NDV/NDVInputPanel.vue` |
| Variable store | `n8n-master/packages/cli/src/controllers/variables.controller.ts` |
| Luxon integration | `n8n-master/packages/workflow/src/expression-evaluator/luxon.ts` |

### Make comparison corpus

| Make feature | Raw source | Key difference |
|-------------|-----------|---------------|
| Make template syntax | `research/make-pdf-full.txt` §Variables | Make uses `{{var}}` without full JS; limited functions |
| Make mapping panel | `research/make-advanced/03-node-insert/` (crawl screenshots) | Make uses click-to-insert pills; n8n/FlowHolt adds drag |
| Make bundles | `research/make-pdf-full.txt` §Bundles | Make calls them bundles; same concept as `FlowItem[]` |
| Make variables | `research/make-help-center-export/pages_markdown/environment-variables.md` | Make has org-level vars; FlowHolt adds workspace scope + secret type |

### This file feeds into

| File | What it informs |
|------|----------------|
| `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` | INPUT panel UX, expression editor design |
| `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Which fields support expressions |
| `05-FLOWHOLT-AI-AGENTS-SKELETON.md` | `$fromAI()` in tool fields |
| `45-FLOWHOLT-DATA-STORE-AND-CUSTOM-FUNCTION-SPEC.md` | Code node JS/Python context injection |
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | All nodes use `FlowItem[]` |
| `39-FLOWHOLT-BACKEND-DOMAIN-MODULE-PLAN.md` | Expression engine as a backend module |
| `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` | Domain 1 expression + data model gaps |
| `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | Domain 3 decisions |

---

## Principle

Every FlowHolt node receives a list of items and outputs a list of items. The expression language is how users access and transform that data. These two systems (data model + expressions) are inseparable — design them together.

---

## 1. The Item-Array Data Model

This is the most fundamental architectural decision in FlowHolt's data pipeline.

### FlowItem Type

```typescript
type FlowItem = {
  json: Record<string, unknown>;       // structured data
  binary?: Record<string, BinaryData>; // named binary files (optional)
};

type BinaryData = {
  data: string;        // base64-encoded file content (database mode) OR S3 key (s3 mode)
  mimeType: string;    // e.g., "image/jpeg", "application/pdf"
  fileName: string;    // original filename
  fileSize?: number;   // bytes
  directory?: string;  // folder path if relevant
};
```

**Every node input is `FlowItem[]`. Every node output is `FlowItem[]`.**

This means:
- A node processing 5 records receives `FlowItem[]` of length 5
- A node that fetches a single HTTP response still returns `FlowItem[]` of length 1
- Binary data (files, images, PDFs) travels alongside JSON data in the same item

### Why This Design (from n8n research)

1. **Consistency** — one mental model for all data, all nodes. No special cases.
2. **Binary + JSON together** — eliminates the need to pass binary data "out of band"
3. **Item-level processing** — nodes can operate on each item independently or process all items at once (configurable)
4. **Array of objects** — matches how developers think about data (table rows, API list responses)

### n8n vs Make Comparison

| | Make | n8n | FlowHolt |
|---|------|-----|----------|
| Data unit | Bundle | Item `{json, binary}` | FlowItem `{json, binary?}` |
| Multiple records | Multiple bundles | Array of items | `FlowItem[]` |
| Binary data | Separate "file" concept | `binary` key in item | `binary?` key in FlowItem |
| Empty output | No bundles | `[]` | `[]` |

---

## 2. Expression Syntax

### Delimiter: `{{ }}`

Double curly braces. Any field in any node can be toggled from "fixed value" mode to "expression mode." In expression mode, the field value is `{{ <expression> }}`.

Examples:
```
{{ $json.email }}
{{ $json.firstName + " " + $json.lastName }}
{{ $now.toISO() }}
{{ $json.price * 1.2 }}
{{ $json.tags.includes("premium") ? "VIP" : "Standard" }}
```

Full JavaScript expressions are supported inside the delimiters. No semicolons — single expression that evaluates to a value.

### Multiline Expressions

For complex logic, the full-screen expression editor supports multiline code blocks. The last expression's value is returned.

```javascript
const parts = $json.fullName.split(" ");
parts.length > 1 ? parts[parts.length - 1] : parts[0]
```

---

## 3. Context Variables

Available inside every expression `{{ }}`:

### Core (MVP — Phase 1)

| Variable | Type | What it is |
|----------|------|-----------|
| `$json` | object | `$input.first().json` — current item's JSON |
| `$input` | InputObject | All input items (see below) |
| `$now` | Luxon DateTime | Current timestamp in workflow timezone |
| `$today` | Luxon DateTime | Today's date at midnight, workflow timezone |
| `$vars` | object | Workspace variables (read-only at expression time) |

### Extended (Phase 2)

| Variable | Type | What it is |
|----------|------|-----------|
| `$workflow` | object | `{id, name, active}` |
| `$execution` | object | `{id, mode, startedAt, resumeUrl}` |
| `$node` | object | `{name, type, parameters}` of current node |
| `$env` | object | Environment variables (allowlisted) |
| `$itemIndex` | number | Index of current item in the loop (0-based) |
| `$runIndex` | number | Which loop iteration this is |
| `$binary` | object | `$input.first().binary` — current item's binary data |

### $input Object Methods

```typescript
$input.all()          // Returns FlowItem[] — all input items
$input.first()        // Returns FlowItem — first item
$input.last()         // Returns FlowItem — last item
$input.item           // Same as $input.first() (shorthand)
$input.item.json      // JSON of first item
$input.item.binary    // Binary of first item
```

---

## 4. Method Library

### String Methods

All standard JavaScript string methods plus FlowHolt helpers:

```
.toUpperCase()          "hello" → "HELLO"
.toLowerCase()          "HELLO" → "hello"
.trim()                 " hello " → "hello"
.trimStart() / .trimEnd()
.split(sep)             "a,b,c".split(",") → ["a","b","c"]
.replace(a, b)          "hello".replace("l","r") → "herlo"
.replaceAll(a, b)       "hello".replaceAll("l","r") → "herro"
.includes(str)          "hello".includes("ell") → true
.startsWith(str)        "hello".startsWith("hel") → true
.endsWith(str)          "hello".endsWith("llo") → true
.indexOf(str)           "hello".indexOf("l") → 2
.slice(start, end)      "hello".slice(1,3) → "el"
.substring(start, end)
.padStart(n, ch)        "5".padStart(3,"0") → "005"
.padEnd(n, ch)
.length                 "hello".length → 5
.toNumber()             "42".toNumber() → 42  [FlowHolt helper]
.toBoolean()            "true".toBoolean() → true  [FlowHolt helper]
.isEmpty()              "".isEmpty() → true  [FlowHolt helper]
.isNotEmpty()
```

### Array Methods

```
.length                 [1,2,3].length → 3
.first()                [1,2,3].first() → 1  [FlowHolt helper]
.last()                 [1,2,3].last() → 3  [FlowHolt helper]
.includes(val)          [1,2,3].includes(2) → true
.indexOf(val)           [1,2,3].indexOf(2) → 1
.join(sep)              [1,2,3].join(",") → "1,2,3"
.map(fn)                [1,2].map(x => x*2) → [2,4]
.filter(fn)             [1,2,3].filter(x => x>1) → [2,3]
.reduce(fn, init)       [1,2,3].reduce((a,b)=>a+b, 0) → 6
.find(fn)               [1,2,3].find(x => x>1) → 2
.some(fn)               [1,2,3].some(x => x>2) → true
.every(fn)              [1,2,3].every(x => x>0) → true
.flat(depth)            [[1],[2,3]].flat() → [1,2,3]
.flatMap(fn)
.sort(fn)
.reverse()
.slice(start, end)
.isEmpty()              [].isEmpty() → true  [FlowHolt helper]
.isNotEmpty()
.unique()               [1,1,2].unique() → [1,2]  [FlowHolt helper]
.sum()                  [1,2,3].sum() → 6  [FlowHolt helper]
.average()              [1,2,4].average() → 2.33  [FlowHolt helper]
.min()                  [1,2,3].min() → 1  [FlowHolt helper]
.max()                  [1,2,3].max() → 3  [FlowHolt helper]
```

### Object Methods

```
Object.keys(obj)        {a:1,b:2} → ["a","b"]
Object.values(obj)      {a:1,b:2} → [1,2]
Object.entries(obj)     {a:1,b:2} → [["a",1],["b",2]]
Object.assign({}, a, b) merge objects
.hasField("key")        {a:1}.hasField("a") → true  [FlowHolt helper]
.isEmpty()              {}.isEmpty() → true  [FlowHolt helper]
JSON.stringify(obj)     serialize to JSON string
JSON.parse(str)         parse JSON string
```

### Number Methods

```
.toString()             (42).toString() → "42"
.toFixed(n)             (3.14159).toFixed(2) → "3.14"
.floor()                (3.7).floor() → 3  [FlowHolt helper]
.ceil()                 (3.2).ceil() → 4  [FlowHolt helper]
.round()                (3.5).round() → 4  [FlowHolt helper]
Math.abs(n)             Math.abs(-5) → 5
Math.max(a,b)           Math.max(3,7) → 7
Math.min(a,b)           Math.min(3,7) → 3
Math.pow(base, exp)     Math.pow(2,8) → 256
Math.sqrt(n)            Math.sqrt(9) → 3
Math.random()           random 0–1
```

---

## 5. DateTime — Luxon

All DateTime operations use [Luxon](https://moment.github.io/luxon/) — timezone-aware, immutable.

### Creating DateTime

```javascript
$now                              // current time in workflow timezone
$today                            // today at midnight
DateTime.now()                    // alias for $now
DateTime.fromISO("2026-04-16")    // parse ISO string
DateTime.fromFormat("16/04/2026", "dd/MM/yyyy")  // parse custom format
DateTime.fromMillis(1713225600000)  // from Unix ms timestamp
DateTime.fromObject({year:2026, month:4, day:16})
```

### Formatting

```javascript
$now.toISO()                      // "2026-04-16T14:32:00.000Z"
$now.toISODate()                  // "2026-04-16"
$now.toFormat("dd/MM/yyyy")       // "16/04/2026"
$now.toFormat("MMMM d, yyyy")     // "April 16, 2026"
$now.toFormat("HH:mm:ss")         // "14:32:00"
$now.toMillis()                   // Unix ms timestamp
$now.toUnixInteger()              // Unix seconds timestamp
$now.toLocaleString(DateTime.DATE_FULL)  // locale-aware
```

### Arithmetic

```javascript
$now.plus({days: 7})              // 7 days from now
$now.minus({months: 1})           // 1 month ago
$now.plus({hours: 2, minutes: 30})
$now.startOf("day")               // midnight today
$now.endOf("month")               // last moment of current month
```

### Timezone

```javascript
$now.setZone("America/New_York")  // convert to NY time
$now.zoneName                     // "America/New_York"
$now.offset                       // offset in minutes
DateTime.fromISO("2026-04-16T14:00:00", {zone: "Europe/London"})
```

### Comparison

```javascript
$now.diff(start, "minutes").minutes   // minutes between two DateTimes
$now.hasSame(other, "day")            // same calendar day?
dateA < dateB                          // comparison (Luxon objects are comparable)
```

### Workflow Timezone

The workflow timezone setting determines the timezone for `$now` and `$today`. Stored in workflow settings. Default: UTC.

---

## 6. JMESPath

For complex nested JSON traversal. Not the primary API — use `$json.field.nested` for simple access. JMESPath for power users and complex cases.

```javascript
$jmespath($json, "items[?status=='active'].name")
$jmespath($json, "users | sort_by(@, &created_at)")
$jmespath($json, "store.books[*].{title: title, price: price}")
```

JMESPath spec: https://jmespath.org/  
Available in all expression fields. Autocomplete shows `$jmespath(` hint.

---

## 7. The $fromAI() Function

For use in AI agent tool parameter fields only.

```javascript
$fromAI("param_name", "description for LLM", "type")
```

| Argument | Type | Description |
|----------|------|-------------|
| `param_name` | string | Machine-readable parameter name |
| `description` | string | Human-readable hint for the LLM |
| `type` | string | `"string"`, `"number"`, `"boolean"`, `"json"` |

Examples:
```javascript
$fromAI("recipient_email", "Email address to send to", "string")
$fromAI("send_immediately", "Whether to send right away or schedule", "boolean")
$fromAI("payload", "JSON body for the API request", "json")
```

At runtime, the LLM proposes a value for each `$fromAI()` field before calling the tool. If HITL is enabled, the reviewer sees these proposed values.

---

## 8. Data Pinning

Data pinning saves a snapshot of a node's output for reuse during development.

### How It Works

1. User runs the workflow (manually, in Studio)
2. Node execution succeeds → output appears in inspector OUTPUT tab
3. User clicks "Pin this output" button in OUTPUT tab
4. FlowHolt saves the `FlowItem[]` as pinned data for that node
5. Node shows a 📌 pin badge on canvas

### Using Pinned Data

When running a workflow in Studio with pinned data:
- Nodes with pinned data are **not executed** — their saved output is used directly
- Downstream nodes receive the pinned items and run normally
- This avoids re-triggering external APIs (webhook, Stripe charge, email send) during development

### Pinned Data Indicators

- Pin badge on canvas node
- "Using pinned data" indicator in run output
- "Clear pins" button in top bar
- Clear all pins before promoting to production (warning if pinned nodes exist during Publish)

### Pin Storage

Pinned data is stored per node per user per workflow draft. Not shared between users. Not included in export. Cleared on workflow delete.

---

## 9. Workspace Variables

Read-only at expression time. Set in Settings → Variables.

```javascript
$vars.API_BASE_URL          // "https://api.example.com"
$vars.COMPANY_NAME          // "Acme Corp"
$vars.SUPPORT_EMAIL         // "support@example.com"
```

**Variable types:**
- `string` — default
- `number` — numeric value
- `boolean` — true/false
- `secret` — value masked in UI, encrypted at rest, not available in expression preview

**Scope:** Workspace-scoped. Promoted to team-scope by admin.

---

## 10. Field Sensitivity Classification

Determines how field values appear in logs and expressions.

| Class | Display | Logged | Expression visible |
|-------|---------|--------|-------------------|
| `public` | Full value | Yes | Yes |
| `template` | Full value | Yes | Yes |
| `reference` | ID/name only | ID only | Yes |
| `secret` | ••••••• masked | Never | Variable name only |
| `binary` | File metadata | Metadata only | Via `$binary` key |

Node field definitions declare their sensitivity class. The expression editor respects this in preview mode.

---

## 11. Implementation Phases

### Phase 1 — Core Expressions (MVP)

- `FlowItem` type in executor + all existing nodes
- `{{ }}` expression parser (use `vm2` or isolated-vm for sandboxed eval)
- Context: `$json`, `$input`, `$now`, `$today`, `$vars`
- String + Array + Number + basic Object methods
- Luxon DateTime: `$now`, `toISO()`, `toFormat()`, `plus()`, `minus()`
- Fixed/expression toggle in inspector fields
- Expression autocomplete in inspector (field names from INPUT panel data)
- Basic validation: syntax errors shown inline

### Phase 2 — Full Context + Data Mapping UI

- Extended context: `$workflow`, `$execution`, `$node`, `$env`, `$itemIndex`
- INPUT panel (Schema/Table/JSON views) in Studio
- Drag-to-expression from INPUT panel → auto-generates `{{$json.fieldName}}`
- Click-to-insert at cursor
- Full-screen expression editor modal
- Live expression preview (using pinned data or last run output)
- Data pinning system

### Phase 3 — Power Features

- JMESPath via `$jmespath()`
- `$fromAI()` function (requires AI agent system)
- Custom method library extensions (user-defined helpers in workspace settings)
- Expression version history (see previous expression on a field)
- Import/export expression snippets

---

## Related Files

- `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` — INPUT panel + expression editor UX
- `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` — which fields support expressions
- `05-FLOWHOLT-AI-AGENTS-SKELETON.md` — `$fromAI()` usage
- `45-FLOWHOLT-DATA-STORE-AND-CUSTOM-FUNCTION-SPEC.md` — custom JS functions in Code node
- [[wiki/concepts/expression-language]] — vault synthesis
- [[wiki/data/node-type-inventory]] — node types and their data output shapes
