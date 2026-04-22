# SPEC-79: FlowHolt Complete Expression Language Deep Spec
## Source: n8n Documentation Deep Research — Expression Engine Complete Reference

**Created:** Sprint 88 Research Session
**Status:** Research Complete — Ready for Implementation Reference
**Scope:** Full expression language, context variables, data model, and template engine

---

## 1. Overview — Why Expressions Matter

Expressions are the glue of any automation platform. They allow users to reference data from previous nodes, manipulate it inline, and conditionally branch logic — all without writing full code. n8n's expression system is the gold standard for automation platforms and is directly applicable to FlowHolt.

### 1.1 Expression Syntax
All FlowHolt expressions use `{{ ... }}` double-curly-brace syntax (same as n8n and Liquid).
- In code strings: `"Hello {{ $json.firstName }}"`
- In number fields: `{{ $json.count * 2 }}`
- In boolean fields: `{{ $json.active === true }}`

---

## 2. FlowHolt Data Model (confirmed from n8n source)

### 2.1 Core Data Structure
Every node in FlowHolt produces an **array of FlowItems**:
```typescript
type FlowItem = {
  json: Record<string, any>;   // The main data payload
  binary?: Record<string, BinaryData>;  // File/binary data
  pairedItem?: { item: number; input?: number }; // Links back to input item
};
```

**Key rules:**
1. A node always outputs `FlowItem[]` — even a single result is `[{ json: { ... } }]`
2. Nodes **auto-iterate** — if the input has 3 items, the node runs 3 times (once per item)
3. The **Execute Once** toggle bypasses auto-iteration (node runs once for all input)
4. `$json` is shorthand for `$input.item.json` — always refers to current item's data
5. `$binary` is shorthand for `$input.item.binary`

### 2.2 Data Types in FlowHolt
- **String**: `"hello"` — most common, all API data starts as strings
- **Number**: `42`, `3.14` — use `Number()` or `parseInt()` to coerce
- **Boolean**: `true`, `false` — expressions evaluate truthiness
- **Object**: `{ key: "val" }` — nested access with dot notation
- **Array**: `[1, 2, 3]` — use `.length`, `.map()`, `.filter()`, etc.
- **null / undefined**: handle with `??` operator or `$ifEmpty()`
- **DateTime**: ISO 8601 strings — use Luxon library via `$now`, `$today`, `.toFormat()`

### 2.3 Binary Data
Binary fields (files, images) stored in `item.binary`:
```typescript
type BinaryData = {
  data: string;       // Base64-encoded content
  mimeType: string;   // "image/png", "application/pdf", etc.
  fileName?: string;  // Original filename
  fileSize?: string;  // Human-readable size
  fileExtension?: string;
  directory?: string;
};
```

---

## 3. Complete Context Variable Reference

### 3.1 Input / Current Item Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$json` | Object | Current item's `.json` data (shorthand for `$input.item.json`) |
| `$binary` | Object | Current item's binary data map |
| `$input` | Object | Full input object: `.item`, `.items`, `.first()`, `.last()`, `.all()` |
| `$itemIndex` | Number | 0-based index of the current item being processed |

**`$input` methods:**
```javascript
$input.item           // Current item being processed
$input.items          // All items in the batch (array)
$input.first()        // First item's json
$input.last()         // Last item's json
$input.all()          // All items (same as $input.items)
```

### 3.2 Node Reference Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$(nodeName)` | NodeProxy | Reference to a specific named node's output |
| `$('<Node Name>').item` | FlowItem | Access a specific named node's current matched item |
| `$('<Node Name>').items` | FlowItem[] | All output items from that node |
| `$('<Node Name>').first()` | Object | First item's json from named node |
| `$('<Node Name>').last()` | Object | Last item's json from named node |
| `$('<Node Name>').all()` | FlowItem[] | All items from named node |
| `$('<Node Name>').params` | Object | Named node's configured parameters |

**Usage pattern:**
```javascript
// Get email from node named "Get User"
{{ $('Get User').first().email }}

// Get all items from "Filter" node
{{ $('Filter').all().length }}
```

### 3.3 Workflow Context Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$workflow.id` | String | Workflow UUID |
| `$workflow.name` | String | Workflow display name |
| `$workflow.active` | Boolean | Whether workflow is published/active |
| `$execution.id` | String | Current execution UUID |
| `$execution.mode` | String | `"manual"` or `"production"` |
| `$execution.resumeUrl` | String | URL to resume a waiting workflow |
| `$execution.customData` | Object | Custom metadata attached to execution |

### 3.4 Node Execution State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$runIndex` | Number | 0-based index of the current node run (loops) |
| `$nodeVersion` | String | Current node's version string |
| `$parameter` | Object | Current node's entire configuration parameter map |
| `$prevNode.name` | String | Name of the node that sent current input |
| `$prevNode.outputIndex` | Number | Which output branch of the previous node |
| `$prevNode.runIndex` | Number | Which run of the previous node |

### 3.5 Date/Time Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$now` | DateTime (Luxon) | Current datetime in workflow timezone |
| `$today` | DateTime (Luxon) | Today's date at midnight in workflow timezone |

**Luxon methods (key subset):**
```javascript
$now.toISO()                    // "2024-01-15T14:30:00.000Z"
$now.toFormat('yyyy-MM-dd')     // "2024-01-15"
$now.plus({ days: 7 })          // One week from now
$now.minus({ hours: 2 })        // 2 hours ago
$now.diff($today, 'days').days   // Days since start of today
$now.toMillis()                 // Unix timestamp in ms
$today.weekday                  // 1 (Monday) through 7 (Sunday)
```

### 3.6 HTTP Request Node Variables (Node-Specific)
Only available inside HTTP Request node expressions:

| Variable | Type | Description |
|----------|------|-------------|
| `$request` | Object | The outgoing HTTP request object |
| `$response` | Object | The HTTP response from the previous pagination request |
| `$pageCount` | Number | Number of pagination pages fetched so far |

### 3.7 Secrets Variable

| Variable | Type | Description |
|----------|------|-------------|
| `$secrets.<vault>.<key>` | String | Read from external secrets vault (credential fields only) |

**Note:** `$secrets` is only available in credential configuration fields, not in node parameter expressions. Prevents exposure of secrets in workflow data.

### 3.8 Platform Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$vars.<key>` | Any | Workflow-level variables (set in Variables panel) |
| `$env.<key>` | String | Instance-level environment variables (admin-set) |

---

## 4. Built-In Expression Functions

### 4.1 Conditional Functions

```javascript
// Inline ternary — cleaner than JS ternary for simple cases
$if(condition, trueValue, falseValue)
// Example:
{{ $if($json.age >= 18, "adult", "minor") }}

// Null-coalescing — returns fallback when value is null/undefined/empty string
$ifEmpty(value, fallback)
// Example:
{{ $ifEmpty($json.nickname, $json.firstName) }}
```

### 4.2 Type Conversion Functions

```javascript
// Type checking (returns boolean)
$json.value.isNumeric()        // "42" → true, "abc" → false
$json.value.isEmail()          // validates email format
$json.value.isUrl()            // validates URL format

// Type conversion
parseInt($json.count)          // "5" → 5
parseFloat($json.price)        // "9.99" → 9.99
String($json.id)               // 123 → "123"
Boolean($json.active)          // "true" → true, 0 → false
```

### 4.3 Math Functions

```javascript
$max(n1, n2, n3, ...)     // Returns maximum of arguments
$min(n1, n2, n3, ...)     // Returns minimum of arguments
Math.abs(n)               // Absolute value
Math.round(n)             // Round to nearest integer
Math.floor(n)             // Round down
Math.ceil(n)              // Round up
Math.random()             // Random float 0–1
```

### 4.4 Data Transformation Functions

```javascript
// JMESPath — query JSON with path expressions
$jmespath(obj, expression)
// Examples:
$jmespath($json, "users[?age > `18`].name")
$jmespath($json.data, "results[0].id")

// fromAI — AI-filled parameter (used in AI tool nodes)
$fromAI('parameterName', 'description', 'string')
// Tells AI agent to fill this field when calling tool

// Array utilities
$json.items.length           // Array length
$json.items.includes(val)    // Contains check
$json.items.join(', ')       // Join to string
$json.items.slice(0, 10)     // Take first 10
```

---

## 5. String Methods Reference (Complete)

```javascript
// Case transformation
$json.name.toUpperCase()        // "HELLO"
$json.name.toLowerCase()        // "hello"
$json.name.toCamelCase()        // "helloWorld" (n8n extension)
$json.name.toSnakeCase()        // "hello_world" (n8n extension)
$json.name.capitalize()         // "Hello world" — first letter only
$json.name.titleCase()          // "Hello World" — each word

// Trimming
$json.text.trim()               // Remove leading/trailing whitespace
$json.text.trimLeft()           // Remove leading whitespace only
$json.text.trimRight()          // Remove trailing whitespace only

// Checking
$json.email.includes('@')       // true/false contains check
$json.url.startsWith('https')   // starts with check
$json.name.endsWith('.pdf')     // ends with check
$json.text.isEmpty()            // true if "" or null/undefined

// Extraction
$json.text.slice(0, 100)        // First 100 characters
$json.csv.split(',')            // Split to array
$json.url.extractUrl()          // Extract URL from text
$json.text.extractEmail()       // Extract email from text
$json.html.extractHtml()        // Strip HTML tags

// Transformation
$json.text.replace('foo', 'bar')     // Replace first occurrence
$json.text.replaceAll('foo', 'bar')  // Replace all occurrences
$json.text.removeTags()              // Remove HTML/XML tags
$json.url.base64Encode()             // Base64 encode
$json.encoded.base64Decode()         // Base64 decode
$json.text.hash('sha256')            // Hash the string
$json.text.urlDecode()               // Decode URL-encoded string
$json.text.urlEncode()               // URL-encode the string
```

---

## 6. Array Methods Reference (Complete)

```javascript
// Filtering and searching
$json.items.filter(item => item.active)         // Filter items
$json.items.find(item => item.id === 5)         // Find first match
$json.items.findIndex(item => item.id === 5)    // Index of first match
$json.items.includes(value)                     // Contains value

// Transformation
$json.items.map(item => item.name)              // Transform each
$json.items.flatMap(item => item.tags)          // Flatten one level
$json.items.reduce((acc, item) => acc + item.price, 0)  // Accumulate

// Sorting
$json.items.sort((a, b) => a.name.localeCompare(b.name))  // Sort

// Aggregation
$json.prices.sum()           // Sum all numbers (n8n extension)
$json.prices.average()       // Average (n8n extension)
$json.prices.min()           // Minimum value (n8n extension)
$json.prices.max()           // Maximum value (n8n extension)
$json.items.unique()         // Remove duplicates (n8n extension)
$json.items.compact()        // Remove null/undefined (n8n extension)
$json.items.union(otherArr)  // Merge arrays, remove duplicates

// Slicing
$json.items.slice(0, 5)      // First 5 items
$json.items.first()          // First item (n8n extension)
$json.items.last()           // Last item (n8n extension)
$json.items.chunk(10)        // Split into groups of 10

// Checking
$json.items.isEmpty()        // true if empty array
$json.items.every(i => i.active)   // All satisfy condition
$json.items.some(i => i.active)    // Any satisfy condition
```

---

## 7. Object/JSON Methods

```javascript
// Access
Object.keys($json)           // Array of key names
Object.values($json)         // Array of values
Object.entries($json)        // Array of [key, value] pairs

// Merging
{ ...$json, newKey: "val" }  // Spread merge
Object.assign({}, $json, {newKey: "val"})  // Assign merge

// Checking
$json.hasOwnProperty('key')  // Has own property
$json.key !== undefined       // Key exists check

// JSON operations
JSON.stringify($json)         // Serialize to JSON string
JSON.parse($json.rawStr)      // Parse JSON string
```

---

## 8. Expression Usage Guide (When to Use What)

### 8.1 Decision Matrix

| Need | Use |
|------|-----|
| Reference data from previous nodes | Expression (`{{ }}`) |
| Simple inline transformation | Expression (`{{ }}`) |
| Multiple transformations, reuse data | Code node (JavaScript/Python) |
| AI-driven transformation | AI Transform node |
| Schema-based field mapping | Data Mapping / Item Lists node |
| Complex merge logic | Code node |
| Filter items by condition | Filter node (with expression support) |

### 8.2 Expression vs Code Node
**Expressions** are best for:
- Single-value transformations
- Simple string interpolation
- Accessing node output data
- Math operations on a single value

**Code node** is best for:
- Loops over items with complex logic
- Multiple API calls in sequence
- Generating multiple output items from one input
- External npm module usage
- Complex error handling

### 8.3 Common Patterns

```javascript
// Pattern 1: Safe nested access
{{ $json?.user?.profile?.name ?? "Anonymous" }}

// Pattern 2: Conditional value
{{ $if($json.status === "active", "✅ Active", "⏸ Inactive") }}

// Pattern 3: Date formatting
{{ $now.toFormat('MMMM d, yyyy') }}  // "January 15, 2024"

// Pattern 4: Array to string
{{ $json.tags.join(', ') }}  // "tag1, tag2, tag3"

// Pattern 5: String building
{{ `Hello ${$json.firstName}, your order ${$json.orderId} is ready!` }}

// Pattern 6: Math with units
{{ `${Math.round($json.fileSize / 1024 / 1024)} MB` }}

// Pattern 7: JMESPath deep query
{{ $jmespath($json, "orders[?status == 'pending'].id") }}

// Pattern 8: Null-safe with fallback
{{ $ifEmpty($json.preferredName, $json.firstName + " " + $json.lastName) }}
```

---

## 9. Python Code Node Reference

### 9.1 Available Variables (Native Python via Task Runners)
```python
# All input items
items = _items  # List of dicts: [{"json": {...}, "binary": {...}}]

# Current item (in "run once per item" mode)
item = _item    # Dict: {"json": {...}, "binary": {...}}
```

**Key restrictions (native Python):**
- NO dot notation — use bracket notation: `item["json"]["field"]`, NOT `item.json.field`
- NO `$json`, `$input`, etc. — those are expression-only
- NO file system access — must use dedicated nodes
- NO HTTP calls — must use dedicated nodes
- NO npm/pip imports — only Python stdlib available
- `console.log()` does NOT work — use `print()` but output is not shown to user

### 9.2 Python Code Node Patterns
```python
# Pattern 1: Transform each item
for item in _items:
    item["json"]["fullName"] = item["json"]["firstName"] + " " + item["json"]["lastName"]
return _items

# Pattern 2: Filter items
filtered = [item for item in _items if item["json"]["score"] > 50]
return filtered

# Pattern 3: Create multiple output items
results = []
for name in ["Alice", "Bob", "Carol"]:
    results.append({"json": {"name": name}})
return results

# Pattern 4: Aggregate
total = sum(item["json"]["amount"] for item in _items)
return [{"json": {"total": total, "count": len(_items)}}]
```

---

## 10. Expression Engine Implementation Notes

### 10.1 FlowHolt Expression Engine (from spec 78)
FlowHolt uses `tmpl` (Handlebars-like) + `vm2` for sandboxed evaluation.

**Required additions based on n8n research:**
1. Add `$if(cond, t, f)` as built-in function (currently missing)
2. Add `$ifEmpty(val, fallback)` as built-in function
3. Add `$max(...nums)` and `$min(...nums)` utilities
4. Add `$nodeVersion` injection (from executor context)
5. Add `$parameter` injection (current node's config)
6. Add `$prevNode` injection (previous node name/output info)
7. Add `$runIndex` injection (current loop iteration)
8. Add `$secrets` proxy (credential fields only)
9. Add `$pageCount` for HTTP Request node pagination context
10. Extend String prototype with FlowHolt-specific methods:
    - `.toCamelCase()`, `.toSnakeCase()`, `.capitalize()`, `.titleCase()`
    - `.isEmpty()`, `.extractUrl()`, `.extractEmail()`, `.extractHtml()`
    - `.base64Encode()`, `.base64Decode()`, `.hash(algorithm)`
    - `.urlEncode()`, `.urlDecode()`, `.removeTags()`
11. Extend Array prototype with FlowHolt-specific methods:
    - `.sum()`, `.average()`, `.unique()`, `.compact()`
    - `.first()`, `.last()`, `.chunk(size)`, `.union(other)`
    - `.isEmpty()`

### 10.2 Safety & Sandboxing
- Expressions run in sandboxed VM — no file system, no network
- `$secrets` accessible only in credential fields, not workflow expressions
- Infinite loop protection via timeout (5s default)
- Error in expression shows inline — does not crash workflow

---

## 11. UI/UX for Expressions in FlowHolt

### 11.1 Toggle Between Fixed and Expression Mode
Every parameter field should have:
- **Fixed mode**: Plain text/number/boolean input
- **Expression mode**: Toggle to expression editor with syntax highlighting

Visual indicator: `{{ }}` button or lightning bolt icon to activate expression mode.

### 11.2 Expression Preview
When user is typing an expression:
- Show live preview of evaluated result using the most recent execution data
- Show "No data" placeholder if no execution data available
- Show error message inline if expression is invalid

### 11.3 Node Reference Autocomplete
In expression mode, when user types `$('...`)`:
- Show dropdown of all upstream node names
- After selecting node: show available fields from that node's output

### 11.4 Variable Autocomplete
When user types `$`:
- Show all available context variables: `$json`, `$now`, `$today`, `$workflow`, `$execution`, `$vars`, etc.
- Filter as user types

---

## 12. JMESPath Reference (Key Patterns)

```javascript
// Basic field access
$jmespath($json, "name")                        // Simple field
$jmespath($json, "user.profile.email")          // Nested field

// Array indexing
$jmespath($json, "items[0]")                    // First item
$jmespath($json, "items[-1]")                   // Last item
$jmespath($json, "items[0:3]")                  // Slice

// Projection (extract field from all items)
$jmespath($json, "items[*].name")               // All names

// Filter projection
$jmespath($json, "items[?status == 'active']")  // Filter active
$jmespath($json, "items[?age > `18`].name")     // Filter by number

// Multi-select
$jmespath($json, "items[*].{id: id, name: name}")  // Select specific fields

// Functions
$jmespath($json, "length(items)")               // Array length
$jmespath($json, "sort_by(items, &name)")       // Sort by field
$jmespath($json, "min_by(items, &price)")       // Minimum by field
$jmespath($json, "max_by(items, &price)")       // Maximum by field
$jmespath($json, "contains(tags, 'featured')")  // Contains check
$jmespath($json, "join(', ', names)")           // Join array
```

---

## 13. Gap Analysis vs Current FlowHolt Implementation

| Feature | Status | Priority |
|---------|--------|----------|
| `$if()` function | ❌ Missing | HIGH |
| `$ifEmpty()` function | ❌ Missing | HIGH |
| `$max()` / `$min()` | ❌ Missing | MEDIUM |
| `$nodeVersion` context var | ❌ Missing | LOW |
| `$parameter` context var | ❌ Missing | MEDIUM |
| `$prevNode` context var | ❌ Missing | MEDIUM |
| `$runIndex` context var | ❌ Missing | MEDIUM |
| `$secrets` proxy (creds only) | ❌ Missing | HIGH |
| String prototype extensions | ⚠️ Partial | HIGH |
| Array prototype extensions | ⚠️ Partial | HIGH |
| JMESPath built-in | ✅ Exists | — |
| Expression toggle per field | ⚠️ Partial | HIGH |
| Live expression preview | ⚠️ Partial | HIGH |
| Autocomplete for `$()` nodes | ❌ Missing | MEDIUM |
