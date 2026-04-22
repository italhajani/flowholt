# FLOWHOLT SPEC 86 — Complete Expression Method Reference
> Source: n8n docs `data/expression-reference/` (string, array, number, object, datetime, root)
> Sprint: 89 | Status: Research Complete

---

## 1. Overview

n8n extends JavaScript primitives with chainable methods via a custom runtime patch. These are callable inline inside `{{ }}` template expressions AND in the Code node. FlowHolt must implement the same method surface so users migrating from n8n have zero friction.

All methods are side-effect free (they return new values, never mutate). The expressions runtime evaluates `{{ }}` blocks, reduces them to values, and passes them to node parameters.

---

## 2. String Methods — Complete Catalog

### 2.1 Custom n8n String Methods (must implement)

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `base64Decode()` | `String.base64Decode()` | String | Decodes base64 → plain text. `"aGVsbG8=".base64Decode()` → `"hello"` |
| `base64Encode()` | `String.base64Encode()` | String | Encodes plain text → base64. `"hello".base64Encode()` → `"aGVsbG8="` |
| `extractDomain()` | `String.extractDomain()` | String\|undefined | Extracts domain from email or URL. `"me@example.com".extractDomain()` → `"example.com"` |
| `extractEmail()` | `String.extractEmail()` | String\|undefined | Finds first email in string. Returns `undefined` if none. |
| `extractUrl()` | `String.extractUrl()` | String\|undefined | Finds first URL (must start with `http`). Returns `undefined` if none. |
| `extractUrlPath()` | `String.extractUrlPath()` | String\|undefined | Returns path after domain. `"http://n8n.io/workflows".extractUrlPath()` → `"/workflows"` |
| `hash(algo?)` | `String.hash("md5"\|"base64"\|"sha1"\|"sha224"\|"sha256"\|"sha384"\|"sha512"\|"sha3"\|"ripemd160")` | String | Hashes string. Default: `md5` |
| `isDomain()` | `String.isDomain()` | Boolean | True only if pure domain (no http://). `"n8n.io"` → true, `"http://n8n.io"` → false |
| `isEmail()` | `String.isEmail()` | Boolean | True if whole string is an email |
| `isEmpty()` | `String.isEmpty()` | Boolean | True if empty string or null |
| `isNotEmpty()` | `String.isNotEmpty()` | Boolean | True if at least 1 character |
| `isNumeric()` | `String.isNumeric()` | Boolean | True if string represents a number (including scientific notation) |
| `isUrl()` | `String.isUrl()` | Boolean | True if valid URL (must include protocol) |
| `parseJson()` | `String.parseJson()` | any\|undefined | Parses JSON string → JS value. Single-quoted JSON → `undefined` |
| `quote(mark?)` | `String.quote()` | String | Wraps in double-quotes, escapes internal quotes |
| `removeMarkdown()` | `String.removeMarkdown()` | String | Strips Markdown formatting and HTML tags |
| `removeTags()` | `String.removeTags()` | String | Strips HTML/XML tags only |
| `replaceSpecialChars()` | `String.replaceSpecialChars()` | String | Replaces non-ASCII with closest ASCII. `"déjà"` → `"deja"` |

### 2.2 JavaScript Native String Methods (pass-through)

| Method | Signature | Returns |
|--------|-----------|---------|
| `concat()` | `String.concat(s1, s2?, ...)` | String |
| `endsWith()` | `String.endsWith(str, end?)` | Boolean |
| `includes()` | `String.includes(str, start?)` | Boolean |
| `indexOf()` | `String.indexOf(str, start?)` | Number (-1 if not found) |
| `length` | `String.length` | Number (property) |
| `match()` | `String.match(regexp)` | Array\|null |
| `replace()` | `String.replace(pattern, replacement)` | String (first match only) |
| `replaceAll()` | `String.replaceAll(pattern, replacement\|fn)` | String (all matches) |
| `search()` | `String.search(regexp)` | Number (-1 if not found) |
| `slice()` | `String.slice(start, end?)` | String |
| `split()` | `String.split(separator?, limit?)` | Array |
| `startsWith()` | `String.startsWith(str, start?)` | Boolean |
| `substring()` | `String.substring(start, end?)` | String |
| `toLowerCase()` | `String.toLowerCase()` | String |
| `toUpperCase()` | `String.toUpperCase()` | String |
| `trim()` | `String.trim()` | String |
| `trimEnd()` | `String.trimEnd()` | String |
| `trimStart()` | `String.trimStart()` | String |

### 2.3 String Method Chaining Patterns

```javascript
// URL extraction then domain
"Check out http://n8n.io".extractUrl().extractDomain()  //=> 'n8n.io'

// Email validation pipeline
$json.email.isEmail()  //=> true/false

// Safe JSON parse with fallback
$json.payload.parseJson() ?? {}

// Hash a value
$json.password.hash("sha256")

// ASCII-safe slug
$json.title.toLowerCase().replaceSpecialChars().replaceAll(/[^a-z0-9]/g, '-')
```

---

## 3. Array Methods — Complete Catalog

### 3.1 Custom n8n Array Methods (must implement)

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `append()` | `Array.append(e1, e2?, ...)` | Array | Adds elements to end (returns new array unlike push) |
| `average()` | `Array.average()` | Number | Average of numbers. Throws if non-numbers present |
| `chunk(length)` | `Array.chunk(n)` | Array | Splits into sub-arrays of size n. `[1,2,3,4].chunk(2)` → `[[1,2],[3,4]]` |
| `compact()` | `Array.compact()` | Array | Removes null, "", undefined |
| `difference(other)` | `Array.difference(arr)` | Array | Elements in base not in other |
| `first()` | `Array.first()` | any | First element |
| `intersection(other)` | `Array.intersection(arr)` | Array | Elements in both arrays |
| `isEmpty()` | `Array.isEmpty()` | Boolean | True if empty or null |
| `isNotEmpty()` | `Array.isNotEmpty()` | Boolean | True if at least 1 element |
| `last()` | `Array.last()` | any | Last element |
| `max()` | `Array.max()` | Number | Largest number (throws if non-numbers) |
| `min()` | `Array.min()` | Number | Smallest number (throws if non-numbers) |
| `pluck(f1?, f2?, ...)` | `Array.pluck("name")` | Array | Extract field values from array of objects |
| `randomItem()` | `Array.randomItem()` | any | Random element |
| `removeDuplicates(keys?)` | `Array.removeDuplicates("key1,key2")` | Array | Dedupes. For objects, can restrict to specific keys |
| `renameKeys(from, to)` | `Array.renameKeys("old", "new")` | Array | Renames key in each object element |
| `smartJoin(keyF, valF)` | `Array.smartJoin("key", "value")` | Object | Converts `[{key:"a",value:1}]` → `{a:1}` |
| `sum()` | `Array.sum()` | Number | Sum of all numbers |
| `toObject(keyF, valF)` | `Array.toObject("id", "name")` | Object | Builds object from array of objects |
| `union(other)` | `Array.union(arr)` | Array | Unique elements from both arrays |

### 3.2 JavaScript Native Array Methods (pass-through)

| Method | Description |
|--------|-------------|
| `concat(arr2, ...)` | Join arrays |
| `every(fn)` | True if all elements pass test |
| `filter(fn)` | Elements passing test |
| `find(fn)` | First element passing test |
| `findIndex(fn)` | Index of first match |
| `flat(depth?)` | Flatten nested arrays |
| `flatMap(fn)` | Map + flatten |
| `forEach(fn)` | Iterate (no return) |
| `includes(elem, start?)` | Contains element |
| `indexOf(elem, start?)` | Index of element |
| `join(sep?)` | Join to string |
| `length` | Count |
| `map(fn)` | Transform each element |
| `reduce(fn, init)` | Fold to single value |
| `reverse()` | Reverse order |
| `slice(start, end?)` | Sub-array |
| `some(fn)` | True if any element passes test |
| `sort(fn?)` | Sort (mutates but returns new in n8n context) |
| `splice()` | Modify array |

### 3.3 Array Method Chaining Patterns

```javascript
// Pluck names, remove duplicates, sort
$json.users.pluck("name").removeDuplicates().sort()

// Find max value
$json.scores.max()

// Chunk and process
$json.records.chunk(50)  // batches of 50

// Extract and join
$json.tags.pluck("name").join(", ")

// Find user by email
$json.users.find(u => u.email === $json.email)
```

---

## 4. Number Methods — Complete Catalog

### 4.1 Custom n8n Number Methods

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `abs()` | `Number.abs()` | Number | Absolute value |
| `ceil()` | `Number.ceil()` | Number | Round up |
| `floor()` | `Number.floor()` | Number | Round down |
| `format(locale?, opts?)` | `Number.format("de-DE", {style:"currency", currency:"EUR"})` | String | Intl.NumberFormat wrapper |
| `isEmpty()` | `Number.isEmpty()` | Boolean | True only for null (0 → false) |
| `isEven()` | `Number.isEven()` | Boolean | Even integer only |
| `isInteger()` | `Number.isInteger()` | Boolean | Whole number |
| `isOdd()` | `Number.isOdd()` | Boolean | Odd integer only |
| `round(places?)` | `Number.round(2)` | Number | Round to n decimal places |
| `toBoolean()` | `Number.toBoolean()` | Boolean | 0 → false, else → true |
| `toDateTime(fmt?)` | `Number.toDateTime("s"\|"ms"\|"excel")` | DateTime | Convert timestamp to DateTime |

### 4.2 JavaScript Native Number Methods

| Method | Description |
|--------|-------------|
| `toFixed(digits)` | Fixed decimal string |
| `toLocaleString(locale?, opts?)` | Locale-aware string |
| `toString(radix?)` | String in base N (2=binary, 16=hex) |

### 4.3 Number Examples

```javascript
// Currency format
(1234567.89).format("en-US", {style: "currency", currency: "USD"})
//=> "$1,234,567.89"

// Unix timestamp → DateTime
(1708695471).toDateTime("s").format("yyyy-MM-dd")
//=> "2024-02-23"

// Excel date → DateTime
(45345).toDateTime("excel")
//=> 2024-02-23T01:00:00+01:00

// Round to 2 decimal places
(3.14159).round(2)  //=> 3.14
```

---

## 5. Object Methods — Complete Catalog

### 5.1 Custom n8n Object Methods

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `compact()` | `Object.compact()` | Object | Remove fields where value is null or "" |
| `hasField(name)` | `Object.hasField("key")` | Boolean | Check if top-level key exists (case-sensitive) |
| `isEmpty()` | `Object.isEmpty()` | Boolean | True if no keys or null |
| `isNotEmpty()` | `Object.isNotEmpty()` | Boolean | True if at least 1 key |
| `keepFieldsContaining(val)` | `Object.keepFieldsContaining("Nathan")` | Object | Keep only string fields containing value (case-sensitive) |
| `keys()` | `Object.keys()` | Array | All field names (like Object.keys()) |
| `merge(other)` | `Object.merge(other)` | Object | Merge two objects. **First object's values WIN on conflict** |
| `removeField(key)` | `Object.removeField("name")` | Object | Delete a field |
| `removeFieldsContaining(val)` | `Object.removeFieldsContaining("secret")` | Object | Remove fields whose string values contain val |
| `toJsonString()` | `Object.toJsonString()` | String | JSON.stringify equivalent |
| `urlEncode()` | `Object.urlEncode()` | String | Converts to query string: `name=Mr+Nathan&city=hanoi` |
| `values()` | `Object.values()` | Array | All values (like Object.values()) |

### 5.2 Object Method Patterns

```javascript
// Clean and convert to query string
$json.params.compact().urlEncode()

// Merge defaults with incoming
$json.config.merge({timeout: 5000, retries: 3})
// NOTE: $json.config values override the defaults on conflict

// Safe field access pattern
$json.user.hasField("email") ? $json.user.email : "unknown@example.com"

// Pick only fields containing "active"
$json.flags.keepFieldsContaining("active")
```

---

## 6. DateTime Methods — Complete Catalog

DateTime uses the **Luxon** library. Dates are Luxon `DateTime` objects. Convert strings with `.toDateTime()`.

### 6.1 String → DateTime Conversion

```javascript
"2024-03-30T18:49".toDateTime()        // ISO string
"2024-03-30".toDateTime()              // Date only
(1708695471).toDateTime("s")           // Unix seconds
(1708695471000).toDateTime("ms")       // Unix milliseconds
(45345).toDateTime("excel")            // Excel date serial
```

### 6.2 DateTime Properties (Luxon)

| Property | Returns | Description |
|----------|---------|-------------|
| `.year` | Number | 4-digit year |
| `.month` | Number | 1-12 |
| `.day` | Number | 1-31 |
| `.hour` | Number | 0-23 |
| `.minute` | Number | 0-59 |
| `.second` | Number | 0-59 |
| `.millisecond` | Number | 0-999 |
| `.weekday` | Number | 1=Mon, 7=Sun |
| `.monthLong` | String | "March" |
| `.monthShort` | String | "Mar" |
| `.locale` | String | e.g. "en-US" |
| `.isInDST` | Boolean | In daylight saving time |
| `.isValid` | Boolean | Valid DateTime |

### 6.3 Custom n8n DateTime Methods

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `diffTo(other, unit)` | `dt.diffTo("2025-01-01", "days")` | Number | Difference in given unit. `unit` can be array for multi-unit |
| `diffToNow(unit)` | `dt.diffToNow("days")` | Number | Difference from now |
| `endOf(unit)` | `dt.endOf("month")` | DateTime | Round to end of unit |
| `equals(other)` | `dt.equals(dt2)` | Boolean | Strict equality (same moment AND timezone) |
| `extract(unit)` | `dt.extract("month")` | Number | Extract numeric part |
| `format(fmt)` | `dt.format("dd/LL/yyyy")` | String | Luxon format tokens |
| `hasSame(other, unit)` | `dt.hasSame(dt2, "month")` | Boolean | Same unit (ignores timezone) |
| `isBetween(d1, d2)` | `dt.isBetween("2020-01-01", "2025-01-01")` | Boolean | Is dt between two moments |
| `minus(n, unit)` | `dt.minus(7, "days")` | DateTime | Subtract time |
| `plus(n, unit)` | `dt.plus(1, "month")` | DateTime | Add time |
| `setLocale(locale)` | `dt.setLocale("de-DE")` | DateTime | Set locale for formatting |
| `startOf(unit)` | `dt.startOf("month")` | DateTime | Round to start of unit |
| `toISO()` | `dt.toISO()` | String | ISO 8601 string |
| `toLocaleString()` | `dt.toLocaleString()` | String | Human-readable locale string |
| `toMillis()` | `dt.toMillis()` | Number | Unix timestamp in ms |
| `toRelative()` | `dt.toRelative()` | String | "3 hours ago" / "in 2 days" |
| `toSQL()` | `dt.toSQL()` | String | SQL datetime string |
| `toUTC()` | `dt.toUTC()` | DateTime | Convert to UTC timezone |
| `ts` | Number (property) | Unix ms timestamp |

### 6.4 DateTime Format Tokens (Luxon)

```
yyyy = 4-digit year      yy = 2-digit year
LL = 2-digit month       L = month number no pad
MMM = short month name   MMMM = full month name
dd = 2-digit day         d = day no pad
HH = 24h hour            hh = 12h hour
mm = minutes             ss = seconds
a = am/pm                ZZ = timezone offset
```

### 6.5 DateTime Examples

```javascript
// Format for display
$now.format("dd LLL yyyy HH:mm")  //=> "30 Apr 2024 18:49"

// Days until deadline
$json.deadline.toDateTime().diffToNow("days")  //=> -14.5 (past)

// Start of current week
$now.startOf("week")

// Add 30 days for expiry
$json.created_at.toDateTime().plus(30, "days").toISO()

// Check if event was this month
$json.event_date.toDateTime().hasSame($now, "month")

// Locale-specific month name
$now.setLocale("fr-FR").format("MMMM yyyy")  //=> "avril 2024"
```

---

## 7. Global Variables (All Contexts)

### 7.1 Time Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$now` | DateTime | Current UTC DateTime (Luxon) |
| `$today` | DateTime | Start of today at midnight |

### 7.2 Data Variables

| Variable | Description | Code node? |
|----------|-------------|-----------|
| `$json` | `$input.item.json` shorthand | ✅ (once-each mode) |
| `$binary` | `$input.item.binary` shorthand | ❌ |
| `$input.item` | Current input item | ✅ |
| `$input.all()` | All input items | ✅ |
| `$input.first()` | First input item | ✅ |
| `$input.last()` | Last input item | ✅ |
| `$input.params` | Previous node's query settings | ✅ |
| `$input.context.noItemsLeft` | Loop Over Items: true when loop ends | ✅ |

### 7.3 Node Reference Methods

| Method | Description |
|--------|-------------|
| `$("<node>").all(branch?, run?)` | All items from node |
| `$("<node>").first(branch?, run?)` | First item from node |
| `$("<node>").last(branch?, run?)` | Last item from node |
| `$("<node>").item` | Linked item (for item linking) |
| `$("<node>").params` | Node's query params |
| `$("<node>").isExecuted` | Has node run yet |
| `$("<node>").itemMatching(idx)` | Trace item in Code node |

### 7.4 Workflow & Execution Variables

| Variable | Description |
|----------|-------------|
| `$workflow.id` | Workflow ID |
| `$workflow.name` | Workflow name |
| `$workflow.active` | Is workflow active |
| `$execution.id` | Unique execution ID |
| `$execution.mode` | "test" or "production" |
| `$execution.resumeUrl` | Webhook URL to resume Wait node |
| `$execution.customData.set(key, val)` | Set custom execution data |
| `$execution.customData.get(key)` | Get custom execution data |
| `$execution.customData.setAll(obj)` | Set all custom data |
| `$execution.customData.getAll()` | Get all custom data |

### 7.5 Node Metadata

| Variable | Description | Code node? |
|----------|-------------|-----------|
| `$nodeVersion` | Current node version | ✅ |
| `$prevNode.name` | Name of previous node | ✅ |
| `$prevNode.outputIndex` | Which output of previous node | ✅ |
| `$prevNode.runIndex` | Run iteration of previous node | ✅ |
| `$runIndex` | 0-based run count of current node | ✅ |
| `$itemIndex` | Position of current item | ❌ |
| `$pageCount` | HTTP Request pagination count | ❌ |
| `$parameter` | Current node's parameter values | ✅ |

### 7.6 Instance & Secrets Variables

| Variable | Description | Code node? |
|----------|-------------|-----------|
| `$env` | Instance environment variables | ✅ |
| `$vars` | Custom variables (global + project) | ✅ |
| `$secrets` | External secrets | ❌ |
| `$getWorkflowStaticData(type)` | Persistent per-workflow storage | ✅ |

---

## 8. Custom Variables — Spec Details

### 8.1 Variable Rules

- **Global scope**: visible to all projects in instance
- **Project scope**: visible only within one project (scoped vars override same-key globals)
- Only instance owners and admins can create/edit variables
- All values are strings (no other types)
- Max key length: 50 chars — only `A-Z a-z 0-9 _`
- Max value length: 1,000 chars
- Read-only in workflows (no write from Code node)
- Access via `$vars.myVariableName`

### 8.2 Variable UI Location

```
Overview page → Variables tab → Add Variable
  └─ Key, Value, Scope (Global | Project) fields

Project page → Variables tab → Add Variable
  └─ Scope auto-set to that project
```

### 8.3 vs Custom Execution Data

| Feature | `$vars` | `$execution.customData` |
|---------|---------|------------------------|
| Scope | Instance/project | Single execution |
| Writable in workflow | ❌ | ✅ |
| Persists between executions | ✅ | ✅ (saved in DB) |
| Filter executions list | ❌ | ✅ |
| Max items | Unlimited | 10 |
| Max value length | 1,000 chars | 255 chars |

---

## 9. Workflow Static Data

```javascript
// Get shared static data across all executions of this workflow
const staticData = $getWorkflowStaticData("global");

// Get node-specific static data (isolated per-node)
const nodeData = $getWorkflowStaticData("node");

// Write a value
staticData.lastRunCount = (staticData.lastRunCount || 0) + 1;
```

**Important**: Static data only persists when workflow is active and triggered (not in test mode).

---

## 10. IIFE Pattern for Complex Expressions

```javascript
// Multi-statement expression using IIFE
{{(()=>{
  let end = DateTime.fromISO('2025-01-01');
  let start = $now;
  let diff = end.diff(start, 'days');
  return Math.round(diff.days);
})()}}
```

---

## 11. FlowHolt Expression Engine Implementation Notes

### 11.1 What FlowHolt must implement

The expression engine must support all methods in Sections 2–7. Implementation approach:

1. **String prototype extension**: Add custom methods to String prototype in isolated sandbox
2. **Array prototype extension**: Add custom n8n methods to Array prototype
3. **Number prototype extension**: Add custom methods to Number prototype
4. **Object extension**: Special handling (can't extend Object.prototype safely) — implement as chained helper
5. **DateTime wrapper**: Luxon DateTime class extended with custom methods
6. **Global vars injection**: `$now`, `$today`, `$json`, `$input`, `$execution`, `$workflow`, `$env`, `$vars`, `$secrets`, `$nodeVersion`, `$prevNode`, `$runIndex`, `$itemIndex`, `$parameter`, `$pageCount`

### 11.2 Expression Sandbox Security

- Expressions run in isolated context
- No access to: `process`, `require`, `fs`, `eval`, `Function`
- `$secrets` NOT available in expressions (only Code node)
- `$env` only available in Code node

### 11.3 Error Handling in Expressions

Common expression errors and messages:
- `"Can't get data for expression"` — Referenced node hasn't executed yet
- `"Referenced node is unexecuted: '<node-name>'"` — Node not in execution path
- `"Invalid syntax"` — JS syntax error in expression
- `"The 'JSON Output' in item 0 contains invalid JSON"` — JSON mode with non-JSON

---

## 12. Gap Analysis: FlowHolt vs n8n

| Feature | n8n | FlowHolt Status |
|---------|-----|-----------------|
| All string methods | ✅ 17 custom + JS native | ⚠️ Partial |
| All array methods | ✅ 18 custom + JS native | ⚠️ Partial |
| All number methods | ✅ 11 custom | ⚠️ Partial |
| All object methods | ✅ 11 custom | ⚠️ Partial |
| DateTime via Luxon | ✅ | ❌ Need to add |
| `$vars` with scope | ✅ | ⚠️ Basic |
| `$execution.customData` | ✅ | ⚠️ Partial |
| `$getWorkflowStaticData` | ✅ | ❌ Not implemented |
| `$fromAI()` | ✅ | ❌ Not implemented |
| `$prevNode.*` | ✅ | ❌ Not implemented |
| `$pageCount` | ✅ | ❌ Not implemented |
| IIFE expressions | ✅ | ⚠️ Untested |
| Expressions in credentials | ✅ | ❌ Not implemented |

**Priority implementation order for FlowHolt**:
1. Luxon DateTime wrapper + `$now`, `$today`, `toDateTime()`
2. All string custom methods (extractDomain/Email/URL, hash, isEmail, isUrl, etc.)
3. Array custom methods (chunk, compact, first, last, pluck, removeDuplicates, etc.)
4. Number/Object custom methods
5. `$getWorkflowStaticData()`
6. `$fromAI()` (AI tool node context only)
7. Expressions in credential fields
