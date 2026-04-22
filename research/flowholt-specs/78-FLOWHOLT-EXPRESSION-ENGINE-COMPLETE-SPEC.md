# 78 · FlowHolt: Expression Engine — Complete Implementation Spec

> **Purpose**: Complete implementation-ready specification for the FlowHolt expression engine — the system that evaluates `{{expressions}}` in node parameters. Covers syntax, all built-in variables, all helper functions, the expression evaluator backend, expression preview UI, and the variable picker.
> **Audience**: Junior AI model implementing the expression engine. This file is self-contained.
> **Sources**: spec 50 (base expression spec), `n8n-master/packages/core/src/expression-evaluator.ts`, Make expression syntax docs, FlowHolt `backend/app/expression_engine.py`.

---

## Cross-Reference Map

| Section | Source |
|---------|--------|
| §1 Data model | spec 50 §1 (FlowItem) |
| §2 Syntax | spec 50 §2, n8n expressions.md |
| §3 Context variables | spec 50 §3, n8n expressions.md |
| §4 Built-in functions | spec 50 §5-6, n8n luxon.md, jmespath.md |
| §5 $fromAI() | spec 50 §7, n8n advanced-ai |
| §6 Backend evaluator | `backend/app/expression_engine.py` |
| §7 Frontend preview | spec 76 §3, spec 07 §expression-panel |
| §8 Variable picker UI | spec 76 §3.2 |
| §9 Code node context | spec 45 §code-node, spec 27 |
| §10 Validation | spec 76 §9 |

---

## 1. FlowItem Data Model

Every node in FlowHolt passes data as `FlowItem[]` arrays.

### 1.1 FlowItem Type

```typescript
type FlowItem = {
  json: Record<string, unknown>;        // main structured data
  binary?: Record<string, BinaryData>;  // named binary files (optional)
  pairedItem?: { item: number };         // tracks which input item produced this output
};

type BinaryData = {
  data: string;        // base64 (db mode) or storage key (s3/supabase mode)
  mimeType: string;    // "image/jpeg", "application/pdf", etc.
  fileName: string;    // "report.pdf"
  fileSize?: number;   // bytes
  fileExtension?: string;  // "pdf"
};
```

**Rule**: Every node receives `FlowItem[]` and must output `FlowItem[]`. This is non-negotiable — all data flows through this type.

### 1.2 Python FlowItem (Backend)

```python
# backend/app/models.py

@dataclass
class BinaryData:
    data: str          # base64 or storage key
    mime_type: str
    file_name: str
    file_size: Optional[int] = None

@dataclass
class FlowItem:
    json: dict                                    # main JSON payload
    binary: Optional[dict[str, BinaryData]] = None
    paired_item: Optional[dict] = None

FlowItemList = list[FlowItem]
```

### 1.3 Item Processing Modes

Each node operates in one of two modes:

| Mode | When to use | How it works |
|------|-------------|--------------|
| **Once per item** | Default for most nodes | Node runs N times for N input items |
| **Once for all items** | Aggregate/merge nodes | Node runs once, receives all items |

The Code node's "Execution mode" setting controls this. Other nodes use the node type's default.

---

## 2. Expression Syntax

### 2.1 Delimiters

```
{{ expression }}
```

Double curly braces. Content between them is evaluated as JavaScript.

**No spaces required** but conventional style includes spaces: `{{ $json.name }}`

### 2.2 JavaScript Support

Full JavaScript ES6+ is supported inside `{{ }}`. The expression must be a single expression (one value, no statements). Examples:

```javascript
// Property access
{{ $json.user.email }}

// Method calls  
{{ $json.name.toUpperCase() }}
{{ $json.tags.join(', ') }}
{{ $json.price.toFixed(2) }}

// Arithmetic
{{ $json.subtotal * 1.1 }}

// Ternary
{{ $json.active ? 'Active' : 'Inactive' }}

// Template literals
{{ `Hello ${$json.name}, you have ${$json.count} items` }}

// Optional chaining (safe access)
{{ $json.user?.address?.city ?? 'Unknown' }}

// Array operations
{{ $json.items.filter(i => i.active).length }}
{{ $json.items.map(i => i.name).join(', ') }}

// Date formatting  
{{ $now.toFormat('yyyy-MM-dd') }}

// String operations
{{ $json.email.split('@')[0] }}
{{ $json.html.replace(/<[^>]*>/g, '') }}
```

### 2.3 Multi-Expression in a Field

A field can contain multiple expressions mixed with literal text:

```
Hello {{ $json.firstName }} {{ $json.lastName }}, your order #{{ $json.orderId }} is ready.
```

Each `{{ }}` block is evaluated separately and the results are concatenated.

### 2.4 Complex Expressions (Full-Screen Editor)

For multi-line logic, the full-screen expression editor supports:
```javascript
const name = $json.firstName + ' ' + $json.lastName;
const greeting = name.length > 20 ? name.split(' ')[0] : name;
greeting.toUpperCase()
// Last line evaluated as return value
```

Uses Monaco Editor in the full-screen modal (same as code node but for a single value).

---

## 3. Context Variables (Complete Reference)

All variables available inside `{{ }}` expressions:

### 3.1 `$json` — Current Item Data

Shorthand for the current FlowItem's `.json` object.

```javascript
$json.email           // → "john@example.com"
$json.user.name       // → "John Smith"  
$json.items[0].price  // → 29.99
$json["field-name"]   // bracket notation for fields with hyphens
```

**When processing multiple items**: `$json` refers to the current item being processed.

### 3.2 `$input` — Input Control

Access the full input array:

```javascript
$input.first()        // → FlowItem (first item's full object)
$input.last()         // → FlowItem (last item)
$input.all()          // → FlowItem[] (all items)
$input.item           // → FlowItem (current item, same as { json: $json, binary: $binary })
$input.itemMatching(0) // → FlowItem at index 0
```

`$input.all()` returns full FlowItems: `[{ json: {...}, binary: {...} }, ...]`

### 3.3 `$binary` — Current Item Binary Data

Access binary data of current item:
```javascript
$binary.file.mimeType  // → "image/jpeg"
$binary.file.fileName  // → "photo.jpg"
$binary.file.data      // → base64 string
```

### 3.4 `$node["Name"]` — Access Any Node's Output

Access output data from any upstream node by name:

```javascript
$node["Get User"].json.id           // field from "Get User" node output
$node["Get User"].json.email        // another field
$node["HTTP Request"].json.data[0]  // array access
```

**Rule**: Only upstream nodes (before the current node in the flow) are accessible.

Alternative syntax: `$("Node Name").item.json.field`

### 3.5 `$now` — Current Timestamp (Luxon)

A Luxon DateTime object representing the current time:

```javascript
$now                              // Luxon DateTime object
$now.toISO()                      // → "2024-01-15T14:30:00.000Z"
$now.toFormat('yyyy-MM-dd')       // → "2024-01-15"
$now.toFormat('HH:mm')            // → "14:30"
$now.toUnixInteger()              // → 1705327800
$now.plus({ days: 7 }).toISO()    // → 7 days from now
$now.minus({ hours: 1 }).toISO()  // → 1 hour ago
$now.startOf('month').toISO()     // → start of current month
$now.setZone('America/New_York')  // → convert to timezone
$now.weekday                      // → 1 (Monday) to 7 (Sunday)
$now.toFormat('d MMMM yyyy')      // → "15 January 2024"
```

### 3.6 `$today` — Today's Date (Start of Day)

```javascript
$today                             // Luxon DateTime at midnight today
$today.toISO()                     // → "2024-01-15T00:00:00.000Z"
$today.toFormat('yyyy-MM-dd')      // → "2024-01-15"
```

### 3.7 `$env` — Workspace Variables

Access workflow variables (from Variables page):
```javascript
$env.API_BASE_URL     // → "https://api.example.com"
$env.MAX_RETRIES      // → "3"
$env.DEBUG_MODE       // → "true"
```

Note: All env vars are strings. Cast as needed: `Number($env.MAX_RETRIES)`.

### 3.8 `$vars` — Workflow-Level Variables (Static)

For variables defined directly in the workflow settings (not in the Variables page):
```javascript
$vars.myLocalVar      // → value set in workflow settings
```

### 3.9 `$workflow` — Workflow Metadata

```javascript
$workflow.id          // → "wf-abc-123"
$workflow.name        // → "Send Weekly Report"
$workflow.active      // → true | false
```

### 3.10 `$execution` — Execution Metadata

```javascript
$execution.id         // → "exec-def-456"
$execution.mode       // → "trigger" | "manual" | "retry"
$execution.resumeUrl  // → URL for Wait node webhook resume
```

### 3.11 `$fromAI()` — AI Parameter Extraction

Used in AI agent tool nodes. Tells the AI to fill this field:

```javascript
$fromAI('email', 'The recipient email address')
$fromAI('count', 'How many records to fetch', 'number')
$fromAI('includeArchived', 'Include archived records', 'boolean', false)
```

**Signature**: `$fromAI(name: string, description: string, type?: string, defaultValue?: any)`

**Types**: `'string'` (default) | `'number'` | `'boolean'` | `'json'`

When the AI agent calls a tool, it extracts values for `$fromAI()` fields from the conversation context.

### 3.12 `$jmespath()` — JMESPath Queries

For complex JSON querying:

```javascript
$jmespath($json.orders, '[?status==`active`].total')
// → sum of total fields where status is "active"

$jmespath($json.data, 'users[*].{name: name, email: email}')
// → array of {name, email} objects

$jmespath($json.results, 'length(@)')
// → count of results
```

### 3.13 `$runIndex` — Current Execution Loop Index

When a node runs in a loop (e.g., processing one item at a time):
```javascript
$runIndex  // → 0, 1, 2, ... (0-based index of current run)
```

---

## 4. Built-in Helper Functions

### 4.1 DateTime — Luxon Methods (Full Reference)

All `$now` and `$today` methods. Also available as `DateTime` from the Luxon library:

**Creation**:
```javascript
$now                                    // current datetime
DateTime.fromISO("2024-01-15")         // from ISO string
DateTime.fromMillis(1705327800000)      // from epoch ms
DateTime.fromFormat("15/01/2024", "dd/MM/yyyy")  // custom format
```

**Formatting**:
| Format token | Output |
|-------------|--------|
| `yyyy` | 2024 |
| `MM` | 01 (padded month) |
| `M` | 1 (unpadded month) |
| `MMMM` | January |
| `dd` | 15 (padded day) |
| `d` | 15 |
| `HH` | 14 (24h hour) |
| `hh` | 02 (12h hour) |
| `mm` | 30 (minutes) |
| `ss` | 45 (seconds) |
| `a` | PM |
| `X` | Unix timestamp (seconds) |

**Arithmetic**:
```javascript
$now.plus({ years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6 })
$now.minus({ days: 7 })
$now.startOf('week')    // Monday midnight
$now.endOf('month')     // Last second of month
$now.diff($now.minus({days: 1}), 'hours').hours  // → 24
```

**Querying**:
```javascript
$now.year      // 2024
$now.month     // 1
$now.day       // 15
$now.hour      // 14
$now.minute    // 30
$now.weekday   // 1=Mon, 7=Sun
$now.isWeekend // false
$now.isValid   // true
$now.zone.name // "UTC"
```

**Timezones**:
```javascript
$now.setZone('America/New_York')
$now.setZone('Europe/London')
$now.toUTC()
$now.toLocal()
```

### 4.2 JMESPath — `$jmespath(data, query)`

Full JMESPath 1.0 spec supported.

**Common patterns**:
```javascript
// Filter array
$jmespath(data, '[?age > `18`]')

// Project fields
$jmespath(data, 'users[*].{id: id, name: name}')

// Functions
$jmespath(data, 'length(items)')
$jmespath(data, 'max(prices)')
$jmespath(data, 'min(prices)')
$jmespath(data, 'sum(quantities)')
$jmespath(data, 'avg(scores)')
$jmespath(data, 'sort(@)')
$jmespath(data, 'reverse(@)')
$jmespath(data, 'keys(@)')
$jmespath(data, 'values(@)')
$jmespath(data, 'contains(names, `john`)')
$jmespath(data, 'starts_with(email, `user`)')
$jmespath(data, 'join(`, `, names)')
$jmespath(data, 'to_number(price_string)')
$jmespath(data, 'to_string(id)')
$jmespath(data, 'not_null(@, `default`)')
$jmespath(data, 'floor(price)')
$jmespath(data, 'ceil(price)')
$jmespath(data, 'abs(delta)')
```

### 4.3 String Helpers

Built-in JavaScript string methods (always available):
```javascript
$json.name.toLowerCase()
$json.name.toUpperCase()
$json.email.trim()
$json.text.replace(/\s+/g, ' ')
$json.slug.split('-').join(' ')
$json.csv.split(',').map(s => s.trim())
$json.html.match(/<title>(.*?)<\/title>/)?.[1]
JSON.stringify($json.object)
JSON.parse($json.jsonString)
encodeURIComponent($json.url)
decodeURIComponent($json.encoded)
btoa($json.text)  // base64 encode
atob($json.base64) // base64 decode
```

### 4.4 Math Helpers

```javascript
Math.round(4.7)         // 5
Math.floor(4.7)         // 4
Math.ceil(4.2)          // 5
Math.abs(-10)           // 10
Math.max(1, 2, 3)       // 3
Math.min(1, 2, 3)       // 1
Math.random()           // 0.0-1.0 random float
Math.pow(2, 10)         // 1024
Math.sqrt(16)           // 4
Number($json.str)       // parse string to number
parseInt($json.str)     // integer
parseFloat($json.str)   // float
```

---

## 5. Expression Evaluator (Backend)

### 5.1 Python Implementation

```python
# backend/app/expression_engine.py

import re
import json
import duktape  # lightweight JS engine (or use Node.js subprocess)
from datetime import datetime
from typing import Any

EXPRESSION_PATTERN = re.compile(r'\{\{(.*?)\}\}', re.DOTALL)

class ExpressionEngine:
    """
    Evaluates FlowHolt expressions within a node execution context.
    """
    
    def evaluate_field(self, template: str, context: ExpressionContext) -> Any:
        """
        Evaluate a field value that may contain {{expressions}}.
        
        - Plain value: return as-is
        - Single expression {{ }}: return evaluated JS value (any type)
        - Mixed text+expressions: return concatenated string
        """
        expressions = EXPRESSION_PATTERN.findall(template)
        
        if not expressions:
            return template  # plain value, no evaluation
        
        # Single expression taking up entire field → return typed result
        if template.strip() == template and len(expressions) == 1:
            full_match = EXPRESSION_PATTERN.fullmatch(template.strip())
            if full_match:
                return self._eval_js(expressions[0], context)
        
        # Mixed text + expressions → concatenate as string
        def replace_expr(match):
            result = self._eval_js(match.group(1), context)
            return str(result) if result is not None else ''
        
        return EXPRESSION_PATTERN.sub(replace_expr, template)
    
    def _eval_js(self, expression: str, context: ExpressionContext) -> Any:
        """
        Execute a single JS expression with FlowHolt context variables.
        Uses Duktape (embeddable JS engine) for sandboxed evaluation.
        """
        js_globals = self._build_js_globals(context)
        try:
            result = self.js_engine.eval_with_globals(
                expression.strip(), 
                js_globals,
                timeout_ms=1000
            )
            return result
        except JsTimeoutError:
            raise ExpressionError(f"Expression timed out: {expression[:50]}")
        except JsError as e:
            raise ExpressionError(f"Expression error: {e.message}")
    
    def _build_js_globals(self, ctx: ExpressionContext) -> dict:
        now = datetime.utcnow()
        return {
            "$json": ctx.current_item.json,
            "$binary": ctx.current_item.binary or {},
            "$input": {
                "all": lambda: [i.to_js() for i in ctx.all_items],
                "first": lambda: ctx.all_items[0].to_js() if ctx.all_items else None,
                "last": lambda: ctx.all_items[-1].to_js() if ctx.all_items else None,
                "item": ctx.current_item.to_js(),
            },
            "$node": {name: {"json": items[0].json if items else {}} 
                     for name, items in ctx.node_outputs.items()},
            "$now": build_luxon_datetime(now),
            "$today": build_luxon_datetime(now.replace(hour=0, minute=0, second=0, microsecond=0)),
            "$env": ctx.env_vars,
            "$vars": ctx.workflow_vars,
            "$workflow": {
                "id": str(ctx.workflow_id),
                "name": ctx.workflow_name,
                "active": ctx.workflow_active,
            },
            "$execution": {
                "id": str(ctx.execution_id),
                "mode": ctx.execution_mode,
            },
            "$runIndex": ctx.run_index,
            "$jmespath": js_jmespath_function,
            "$fromAI": js_from_ai_function,  # no-op during normal execution
        }
```

### 5.2 ExpressionContext

```python
@dataclass
class ExpressionContext:
    current_item: FlowItem
    all_items: list[FlowItem]
    node_outputs: dict[str, list[FlowItem]]  # node_name → items
    env_vars: dict[str, str]
    workflow_vars: dict[str, Any]
    workflow_id: UUID
    workflow_name: str
    workflow_active: bool
    execution_id: UUID
    execution_mode: str  # "trigger" | "manual" | "retry"
    run_index: int = 0
```

### 5.3 Node Parameter Evaluation

```python
def evaluate_node_params(node: WorkflowNode, ctx: ExpressionContext) -> dict:
    """
    Recursively evaluate all expression fields in a node's config.
    Handles nested dicts, arrays, and primitive types.
    """
    engine = ExpressionEngine()
    return deep_evaluate(node.config, engine, ctx)

def deep_evaluate(obj: Any, engine: ExpressionEngine, ctx: ExpressionContext) -> Any:
    if isinstance(obj, str):
        return engine.evaluate_field(obj, ctx)
    elif isinstance(obj, dict):
        return {k: deep_evaluate(v, engine, ctx) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [deep_evaluate(item, engine, ctx) for item in obj]
    else:
        return obj  # number, bool, None — return as-is
```

### 5.4 JavaScript Engine Choice

**Option A: Duktape** (embedded Python C extension)
- Pro: No subprocess overhead, same process
- Con: ES5 only (no arrow functions, no template literals in old versions)
- Use: `dukpy` Python package

**Option B: Node.js subprocess**
- Pro: Full ES2022+ support, exact match with frontend
- Con: Process spawn overhead (~50ms)
- Use: For complex expressions

**FlowHolt decision**: Use `dukpy` for simple expressions. Fall back to Node.js subprocess for expressions containing `$now` (Luxon), arrow functions, or template literals.

**Option C: `py_mini_racer`** (V8 in Python)
- Pro: Full ES6+ via V8
- Con: Larger binary (~30MB)
- Use if `dukpy` proves insufficient

### 5.5 Expression API Endpoint

For expression preview (frontend → backend):

```
POST /api/v1/expressions/evaluate
{
  "expression": "{{ $json.firstName + ' ' + $json.lastName }}",
  "context": {
    "json": {"firstName": "John", "lastName": "Smith"},
    "env": {"API_URL": "https://api.example.com"}
  }
}

Response:
{
  "result": "John Smith",
  "type": "string",
  "error": null
}
```

Rate limited: 30 req/s per user (expression preview is called on every keystroke).

---

## 6. Frontend Expression Preview

### 6.1 Expression Preview Component

Shown below any field in expression mode:

```tsx
// src/components/studio/ExpressionPreview.tsx

<div className="mt-1 text-xs">
  <span className="text-muted-foreground">= </span>
  {isLoading ? (
    <span className="text-muted-foreground">Evaluating...</span>
  ) : error ? (
    <span className="text-orange-500">⚠ {error.message}</span>
  ) : (
    <span className="font-mono bg-green-50 text-green-800 px-1 rounded">
      {formatPreviewValue(result)}
    </span>
  )}
</div>
```

**formatPreviewValue** rules:
- string → show with quotes if contains spaces, otherwise bare
- number → show as-is
- boolean → `true` / `false`
- array → `[3 items]` or `[...]` if >3
- object → `{id: 123, ...}` abbreviated
- null → `null` (gray)
- undefined → `(no data)`

### 6.2 Expression Preview Debouncing

```typescript
// Debounce: evaluate 400ms after user stops typing
const debouncedExpression = useDebounce(expressionValue, 400);

useEffect(() => {
  if (!debouncedExpression.includes('{{')) return;
  evaluateExpression(debouncedExpression);
}, [debouncedExpression]);
```

---

## 7. Variable Picker UI

### 7.1 Trigger (Insert Variable)

Available on every expression-enabled field:
- `{{ }}` button click
- Typing `{{` in the field
- ⌘+I keyboard shortcut

### 7.2 Variable Tree Structure

```
┌─ Insert Variable ─────────────────────────────────────────┐
│ 🔍 [Search variables...]                                  │
│                                                           │
│ ▶ TRIGGER INPUT ($json)                                   │
│   email          string   "john@example.com"             │
│   name           string   "John Smith"                   │
│   amount         number   299.99                         │
│   active         boolean  true                           │
│   items          array    [3 items]                      │
│   ▶ user         object                                  │
│     ├── id       number   42                             │
│     └── role     string   "admin"                        │
│                                                           │
│ ▶ NODE OUTPUTS                                            │
│   ▶ HTTP Request                                          │
│     body.users   array    [5 items]                      │
│     statusCode   number   200                            │
│   ▶ Set Fields                                            │
│     fullName     string   "John Smith"                   │
│                                                           │
│ ▶ ENVIRONMENT ($env)                                      │
│   API_BASE_URL   string   "https://api..."               │
│   MAX_RETRIES    string   "3"                            │
│                                                           │
│ ▶ SYSTEM ($now, $workflow, $execution)                    │
│   $now           datetime "2024-01-15T14:30..."          │
│   $workflow.id   string   "wf-abc-123"                   │
│   $execution.id  string   "exec-def-456"                 │
└───────────────────────────────────────────────────────────┘
```

### 7.3 Inserting Variables

Click any variable row → inserts `{{$json.email}}` at cursor in the active field.

**Insertion format by variable type**:
| Variable | Inserted expression |
|----------|-------------------|
| `$json.email` | `{{ $json.email }}` |
| Node output field | `{{ $node["HTTP Request"].json.data }}` |
| `$env.API_URL` | `{{ $env.API_URL }}` |
| `$now` | `{{ $now.toISO() }}` |
| Nested: `$json.user.id` | `{{ $json.user.id }}` |

---

## 8. Code Node Expression Context

### 8.1 JavaScript Code Node

The code node receives a different API (no `{{ }}` — it's plain JS):

```javascript
// Available globals in code node (JavaScript)
const items = $input.all();      // FlowItem[] - all input items
const firstItem = $input.first(); // FlowItem - first item
const item = $input.item;         // FlowItem - current item (in "once per item" mode)

// $json is available when processing one item at a time
const email = $json.email;

// Node outputs
const prevData = $node["Get User"].json;

// Built-ins
const now = $now;    // Luxon DateTime
const env = $env;    // workspace variables

// Return: array of FlowItems or plain objects (auto-wrapped)
return items.map(item => ({
  json: {
    ...item.json,
    processed: true,
    timestamp: $now.toISO()
  }
}));
```

### 8.2 Python Code Node

```python
# Available in Python code node
items = _input.all()    # list of FlowItem
item = _input.first()   # first FlowItem

# Access JSON
email = item['json']['email']

# Return: list of dicts (auto-wrapped into FlowItems)
return [
  {'json': {**i['json'], 'processed': True}}
  for i in items
]
```

### 8.3 Security Sandbox

Code nodes run in a subprocess or sandboxed environment:

**JavaScript**: Node.js child_process with `--experimental-vm-modules`, blocked globals:
- No `require` / `import`
- No `process.exit`
- No `fs` filesystem access
- No network: `fetch`, `http`, `https` — use HTTP Request node instead
- Allowed: `Math`, `JSON`, `Date`, `Array`, `Object`, `String`, `RegExp`, `Map`, `Set`, `Promise`

**Python**: `exec()` in a restricted `__builtins__` environment:
- No `import` (pre-import only `json`, `re`, `math`, `datetime`)
- No `open()` file access
- No `subprocess`
- Memory limit: 64MB
- CPU timeout: 30 seconds

---

## 9. Expression Validation

### 9.1 Syntax Check (Client-Side)

Before sending to server for preview:
1. Check `{{ }}` are balanced (no unclosed brackets)
2. Check for obvious syntax errors via `new Function(expr)` test

### 9.2 Runtime Errors

| Error type | Display |
|-----------|---------|
| `TypeError: Cannot read property 'x' of undefined` | "⚠ Property access on undefined — check if field exists" |
| `SyntaxError: Unexpected token` | "⚠ Syntax error in expression" |
| `ReferenceError: $node is not defined` | "⚠ Unknown variable: $node" |
| Timeout (>1s) | "⚠ Expression took too long" |

### 9.3 Safe Access Patterns

Encourage users to use optional chaining:
```javascript
{{ $json.user?.address?.city ?? 'Unknown' }}
// Instead of:
{{ $json.user.address.city }}  // ← will error if user or address is null
```

Auto-suggest optional chaining in the variable picker when nested access is inserted.

---

## 10. Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Expression delimiter | `{{ }}` double curly | Industry standard (Jinja, Handlebars, n8n, Make) |
| JS vs custom language | Full JavaScript | Power, familiarity, no custom parser needed |
| JS engine (backend) | dukpy + Node.js fallback | Balance of speed and feature support |
| Luxon for dates | Yes | Best-in-class JS datetime library, already in n8n |
| JMESPath | `$jmespath()` function | JSON query standard, more powerful than lodash get |
| Preview evaluation | Server-side API | Consistent with execution; avoids browser engine differences |
| Preview debounce | 400ms | Fast enough, won't hammer API |
| Code node sandbox | Subprocess isolation | Security; malicious code can't affect backend process |
| `$fromAI()` | Returns default in non-agent context | Allows templates to work in both agent and regular workflows |
