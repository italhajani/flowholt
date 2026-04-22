# 89 — FlowHolt: n8n vs Make.com Cross-Platform Synthesis Spec

> **Status:** Research complete — synthesis from n8n + Make.com documentation deep-read  
> **Session:** 89/90 — research sprint  
> **Purpose:** Resolve every n8n vs Make difference, choose the FlowHolt approach for each, and identify gaps in current specs 79–88.

---

## 0. Key Principle

FlowHolt should **combine the best of both** platforms and **eliminate their respective limitations**:

- n8n's strength: rich expression language, excellent AI/LangChain integration, developer-first power
- Make's strength: visual clarity, explicit flow control, enterprise error handling patterns
- FlowHolt goal: power-user depth with visual accessibility, never sacrificing either

---

## 1. Expression Syntax — Fundamental Comparison

### Side-by-Side

| Dimension | n8n | Make | FlowHolt Decision |
|-----------|-----|------|-------------------|
| Template delimiters | `{{ }}` | Inline pill/mapping | `{{ }}` (like n8n, more readable) |
| Method access | JS method chaining: `"hello".toUpperCase()` | Function-call with semicolons: `ascii(text; true)` | Support BOTH styles |
| Argument separator | Comma: `$if(a, b, c)` | Semicolon: `if(a; b; c)` | Comma-primary, semicolon accepted |
| Array indexing | 0-based: `arr[0]` | 1-based: `first()` or `item[1]` | 0-based JS-native, provide `first()`, `last()` helpers |
| Function namespace | `$` prefix for globals: `$json`, `$if()` | No prefix: `json`, `if()` | `$` prefix (clearer source attribution) |
| Built-in functions exposed | As string/array/number prototypes | As global function names | Both: methods on primitives + top-level aliases |

### FlowHolt Expression Engine Design

```
Primary:   {{ $json.name.toUpperCase() }}   ← n8n style (default)
Alias:     {{ upper($json.name) }}           ← Make-style top-level functions
Globals:   {{ $if(condition, a, b) }}
           {{ if(condition; a; b) }}         ← both accepted
```

FlowHolt expression engine must normalize both calling conventions. Parse `{{ }}` blocks, detect if calling style is method-chain or function-call, route accordingly.

---

## 2. Global Variables & Functions — Complete Comparison

### 2a. Global Variable Reference

| Variable | n8n | Make equivalent | FlowHolt |
|----------|-----|-----------------|----------|
| Current item JSON | `$json` | Direct mapping pills | `$json` |
| Input from previous node | `$input.item`, `$input.all()` | Upstream module outputs | `$input` with `.item`, `.all()`, `.first()`, `.last()` |
| Node output reference | `$('NodeName').item` | `{{N.field}}` pill references | `$('NodeName')` shorthand |
| Binary data | `$binary` | Not exposed in expressions | `$binary` |
| Execution context | `$execution.id`, `.resumeUrl`, `.mode` | N/A (no expression access) | `$execution` object |
| Workflow metadata | `$workflow.id`, `.name`, `.active` | `{{scenarioID}}` (limited) | `$workflow` object |
| Current time | `$now` (ISO string context-dependent) | `now` (always current) | `$now` returns Luxon DateTime |
| Today (date only) | `$today` (midnight in workflow TZ) | N/A | `$today` |
| Environment vars | `$env.VAR_NAME` | N/A | `$env` (blocked by default in cloud) |
| Workflow variables | `$vars.name` | Scenario-level variables | `$vars` |
| Secrets/credentials | `$secrets.vault.key` | Handled by credential system | `$secrets` |
| Item index | `$itemIndex` (0-based) | N/A | `$itemIndex` |
| Run index | `$runIndex` | N/A | `$runIndex` |
| Previous node info | `$prevNode.name`, `.outputIndex`, `.runIndex` | N/A | `$prevNode` |
| Page count (paginator) | `$pageCount` | N/A | `$pageCount` |
| Node version | `$nodeVersion` | N/A | Internal only |
| Request/response (webhook) | `$request`, `$response` | N/A | `$request`, `$response` |

**⚠️ FlowHolt Note:** `$now` behavior in n8n is a known gotcha — returns ISO string in display context but Unix timestamp in string concatenation. FlowHolt should always return a Luxon DateTime object and call `.toISO()` / `.toMillis()` explicitly.

### 2b. Global Function Reference

| Function | n8n syntax | Make equivalent | FlowHolt |
|----------|-----------|-----------------|---------|
| Conditional | `$if(cond, trueVal, falseVal)` | `if(expr; val1; val2)` | `$if()` primary, `if()` alias |
| Fallback on empty | `$ifEmpty(val, fallback)` | `ifempty(val1; val2)` | `$ifEmpty()` primary, `ifempty()` alias |
| Max of values | `$max(a, b, c, ...)` | `max(a; b; c; ...)` | Both |
| Min of values | `$min(a, b, c, ...)` | `min(a; b; c; ...)` | Both |
| JMESPath query | `$jmespath(obj, expr)` ⚠️ reversed params | N/A (uses `get(obj; path)`) | `$jmespath(obj, expr)` — document the reversal |
| Multi-case switch | Switch node (no expression-level switch) | `switch(expr; val1; res1; ...)` | `$switch(expr, val1, res1, ...)` NEW — add this |
| Object path access | `$json.deeply.nested` | `get(collection; path)` | Both: dot-notation + `$get(obj, 'path')` |
| Pick keys from object | No direct function | `pick(collection; key1; key2)` | `$pick(obj, ...keys)` NEW — add this |
| Omit keys from object | No direct function | `omit(collection; key1; key2)` | `$omit(obj, ...keys)` NEW — add this |
| Node output ref | `$('NodeName').item.json` | N/A | `$('NodeName').item.json` |
| AI param placeholder | `$fromAI('param', 'description', 'type')` | N/A | `$fromAI()` |

**⚠️ JMESPath param order warning:** n8n JavaScript library reverses the canonical order. The JMESPath spec says `search(expression, object)` but n8n's library implements `$jmespath(object, expression)`. FlowHolt must document this prominently and use the n8n convention (object-first).

---

## 3. String Functions — Comparison

### n8n (method chaining on String prototype)
```js
"hello world".toUpperCase()      // HELLO WORLD
"hello".includes("ell")          // true
"  hello  ".trim()               // "hello"
"abc".padStart(5, "0")           // "00abc"
"hello".hash("sha256")           // hex hash
"abc".base64Encode()             // encoded
"abc".base64Decode()             // decoded
"hello world".extractUrl()       // URL extraction
"text".extractEmail()            // email extraction
"text".extractDomain()           // domain extraction
"text".extractPhone()            // phone extraction
"2024-01-01".toDate()            // DateTime object
```

### Make (function-call style)
```
uppercase(text)
lowercase(text)
capitalize(text)
trim(text)
trimStart(text) / trimEnd(text)
ascii(text; true)                // strip non-ASCII
base64(text)                     // encode
toString(anything)               // convert to string
length(text)                     // character count
sha256(text)                     // hash (under text-binary tab)
contains(text; search)           // boolean
replace(text; search; replace)
replaceAll(text; search; replace)
startsWith(text; prefix)
endsWith(text; suffix)
indexOf(text; search)
substring(text; start; end)
split(text; separator)
```

### FlowHolt String Method Catalog (Unified)

All n8n methods retained + Make-only additions:

| Method | Source | FlowHolt name |
|--------|--------|---------------|
| `.toUpperCase()` | Both | ✅ retained |
| `.toLowerCase()` | Both | ✅ retained |
| `.capitalize()` | Make | `capitalize()` top-level + `.capitalize()` method |
| `.trim()`, `.trimStart()`, `.trimEnd()` | Both | ✅ retained |
| `.ascii(stripNonAscii?)` | Make | `.ascii()` method |
| `.base64Encode()`, `.base64Decode()` | n8n | ✅ retained |
| `.hash(algo)` | n8n | ✅ retained |
| `.includes()`, `.startsWith()`, `.endsWith()` | Both | ✅ retained |
| `.replace()`, `.replaceAll()` | Both | ✅ retained |
| `.indexOf()` | Both | ✅ retained |
| `.split(sep)` | Both | ✅ retained |
| `.padStart()`, `.padEnd()` | n8n | ✅ retained |
| `.extractUrl()`, `.extractEmail()` | n8n | ✅ retained |
| `.toDate()` | n8n | ✅ retained (returns Luxon) |
| `toString(val)` | Make | `$string(val)` top-level alias |

---

## 4. Array Functions — Detailed Comparison

### n8n Array Extensions (on Array prototype)
```js
arr.first()             // first item
arr.last()              // last item
arr.includes(val)       // boolean
arr.pluck('field')      // extract field from objects
arr.compact()           // remove null/undefined
arr.filter(fn)          // standard JS filter
arr.map(fn)             // standard JS map
arr.sort(fn)            // standard JS sort
arr.flat()              // flatten one level
arr.flatten()           // flatten all levels
arr.intersection(arr2)  // common elements
arr.union(arr2)         // merged unique elements
arr.difference(arr2)    // elements in arr but not arr2
arr.removeDuplicates()  // unique by value
arr.smartJoin(key, val) // [{k:x,v:y}] → object
arr.randomItem()        // random element
arr.toObject(key)       // array → object keyed by field
arr.append(item)        // add item
arr.prepend(item)       // add to front
arr.chunk(size)         // split into subarrays
arr.sum()               // sum of numbers
arr.average()           // average of numbers
arr.min()               // smallest value
arr.max()               // largest value
```

### Make Array Functions
```
add(array; value)                     // append
contains(array; value)                // boolean
deduplicate(array)                    // unique values
distinct(array; key)                  // unique by property ⭐ powerful
first(array)                          // first item
flatten(array)                        // flatten nested
join(array; separator)                // → string
keys(collection)                      // get object keys
last(array)                           // last item
length(array)                         // count
map(array; key)                       // pluck field
map(array; key; filterKey; filterVals) // pluck+filter ⭐ powerful
merge(array1; array2; ...)            // combine arrays
remove(array; item)                   // remove by value
reverse(array)                        // flip order
shuffle(array)                        // random order ⭐ n8n gap
slice(array; start; end)              // subset
sort(array; order; key)               // with 'asc ci'/'desc ci' ⭐ case-insensitive
toArray(collection)                   // object → array
toCollection(array; key; value)       // [{k,v}] → object
```

### FlowHolt — Gap Analysis (What Make Has That n8n Doesn't)

| Feature | Make | n8n | FlowHolt Action |
|---------|------|-----|-----------------|
| `distinct(arr, key)` — deduplicate by property | ✅ | `removeDuplicates()` (value-only) | Add `.distinct(key)` method |
| `shuffle(arr)` — random reorder | ✅ | `randomItem()` only | Add `.shuffle()` method |
| `sort(arr, 'asc ci', key)` — case-insensitive sort | ✅ | Standard `.sort()` only | Add `'ci'` flag to `.sort()` |
| `map(arr, key, filterKey, filterVals)` — combined pluck+filter | ✅ | Need `.filter().pluck()` chain | Add `.pluckWhere(field, filterKey, vals)` |
| `toCollection(arr, key, val)` — key-value pairs → object | ✅ | `.smartJoin()` | Keep `.smartJoin()`, add `toCollection()` alias |
| `remove(arr, item)` — remove by value | ✅ | Filter-only | Add `.remove(val)` |
| `reverse(arr)` — flip | ✅ | Standard `.reverse()` | Already in JS, document |
| `keys(collection)` — object keys | ✅ | `Object.keys()` | Add `.keys()` on object type |

**⚠️ Array Indexing:** Make uses 1-based indexing in UI (`item[1]` = first item). n8n uses 0-based. FlowHolt: 0-based in code/expressions, but provide `first()` / `last()` / `nth(n)` helpers (1-based in `.nth()` for user-friendliness).

---

## 5. Date / Time Functions — Detailed Comparison

### n8n — Luxon DateTime Library

Luxon is the primary date library. All date operations return Luxon DateTime objects.

**Token format (ISO-derived):**
```
yyyy = 4-digit year
MM   = 2-digit month
dd   = 2-digit day
HH   = 24h hour
mm   = minutes
ss   = seconds
```

**Key operations:**
```js
$now                              // Current DateTime (Luxon)
$today                            // Today at midnight in workflow TZ

// Parsing
DateTime.fromISO('2024-01-15')
DateTime.fromFormat('01/15/2024', 'MM/dd/yyyy')
DateTime.fromJSDate(new Date())

// Manipulation
$now.plus({ days: 1, hours: 2 })
$now.minus({ months: 1 })
$now.startOf('month')
$now.endOf('week')

// Formatting
$now.toFormat('yyyy-MM-dd')
$now.toLocaleString()
$now.toISO()
$now.toMillis()

// Comparison
$now.diff(otherDate, 'days').days
date1 < date2                     // comparison
```

**Timezone:**
- `GENERIC_TIMEZONE` env var sets default
- `.setZone('America/New_York')` — convert zone
- Python Code node: CANNOT use Luxon methods (no `.minus()`, `.format()` etc.)

### Make — moment.js-style Tokens

**Token format (different from n8n!):**
```
YYYY = 4-digit year     (n8n: yyyy)
MM   = 2-digit month    (same)
DD   = 2-digit day      (n8n: dd)
HH   = 24h hour         (same)
mm   = minutes          (same)
ss   = seconds          (same)
```

**Top-level date functions:**
```
formatDate(date; format; timezone?)       // → string
parseDate(text; format; timezone?)        // → Date
addDays(date; n)                          // add/subtract days
addHours(date; n)                         // add/subtract hours
addMinutes(date; n)                       // add/subtract minutes
addMonths(date; n)                        // add/subtract months
addSeconds(date; n)                       // add/subtract seconds
addYears(date; n)                         // add/subtract years
dateDifference(date1; date2; unit)        // difference in unit
now                                       // current date/time
today                                     // current date
setDay(date; dayOfWeek)                   // set day of week
setHour(date; hour)                       // set hour
setMinute(date; minute)                   // set minute
setMonth(date; month)                     // set month
setSecond(date; second)                   // set second
```

### FlowHolt — Unified Date Approach

**Decision:** Use Luxon as the underlying engine (matches n8n). Expose both Luxon method-chaining AND Make-style top-level functions.

```js
// Primary (Luxon-style, n8n compatible)
$now.plus({ days: 3 }).toFormat('yyyy-MM-dd')

// Make-style aliases (also supported)
formatDate($now, 'YYYY-MM-DD')           // converts tokens internally
addDays($now, 3)                         // wraps .plus({ days: n })
parseDate('01/15/2024', 'MM/DD/YYYY')   // wraps DateTime.fromFormat()
dateDifference(date1, date2, 'days')    // wraps .diff()
```

**Token normalization:** FlowHolt expression engine converts Make tokens (`YYYY`, `DD`) to Luxon tokens (`yyyy`, `dd`) automatically when a top-level date function is used. Method chains always use Luxon tokens.

**FlowHolt-exclusive additions (gaps from both):**
- `$now.businessDaysAdd(n)` — skip weekends
- `$now.toRelative()` — "3 days ago", "in 2 hours" (Luxon feature, not in Make)
- `dateDifference(d1, d2, 'business_days')` — count working days

---

## 6. Math Functions — Complete Comparison

### n8n Math (on Number prototype)
```js
(3.7).round()           // 4
(3.7).floor()           // 3
(3.2).ceil()            // 4
(3.14159).toFixed(2)    // "3.14"
Math.abs(-5)            // 5 (standard JS)
Math.sqrt(16)           // 4 (standard JS)
Math.pow(2, 3)          // 8 (standard JS)
Math.random()           // 0-1 (standard JS)
$min(a, b, c)           // global min function
$max(a, b, c)           // global max function
```

### Make Math Functions
```
abs(number)             // absolute value
average(array)          // mean of values
ceil(number)            // ceiling
floor(number)           // floor
max(a; b; c)            // maximum
min(a; b; c)            // minimum
round(number; precision) // round to decimal places ← Make adds precision param!
sum(array)              // sum of array values
parseNumber(text; dec)  // parse with decimal separator
formatNumber(n; dec; thousands; decimal) // locale-aware formatting ⭐
sqrt(number)            // square root
power(base; exp)        // exponent
```

### FlowHolt Math Gaps

| Feature | Make | n8n | FlowHolt Action |
|---------|------|-----|-----------------|
| `round(n, precision)` with precision | ✅ | `.toFixed(n)` (string) | `.round(precision)` returning Number |
| `average(array)` | ✅ | `.average()` array method | Both: `average(arr)` global + `.average()` method |
| `sum(array)` | ✅ | `.sum()` array method | Both: `sum(arr)` global + `.sum()` method |
| `parseNumber(text, decSeparator)` | ✅ | `Number()` or `parseInt()` | `parseNumber(text, sep)` for locale support |
| `formatNumber(n, dec, thousands, decimal)` | ✅ | `.toLocaleString()` | `formatNumber()` — locale-aware number display |
| `power(base, exp)` | ✅ | `Math.pow()` | `power(base, exp)` alias |
| `sqrt(n)` | ✅ | `Math.sqrt()` | `sqrt(n)` alias |

---

## 7. Hash / Cryptography Functions

### Both Platforms Support
| Algorithm | n8n syntax | Make syntax | FlowHolt |
|-----------|-----------|-------------|---------|
| SHA-1 | `"text".hash("sha1")` | `sha1(text)` | Both |
| SHA-256 | `"text".hash("sha256")` | `sha256(text)` | Both |
| SHA-512 | `"text".hash("sha512")` | `sha512(text)` | Both |
| MD5 | `"text".hash("md5")` | `md5(text)` | Both |
| HMAC-SHA256 | `"text".hmac("sha256", "secret")` | N/A | `"text".hmac("sha256", key)` |

**FlowHolt addition:** Also expose as top-level functions for Make-compat: `sha256(text)`, `md5(text)`, `sha1(text)`.

---

## 8. Router / Branching — Critical Architecture Difference

### n8n — Parallel Execution (Default)

```
IF Node:     2 outputs → True branch / False branch
Switch Node: N outputs → runs in parallel
             Each branch executed simultaneously
             "Output All Items" mode available
```

- All branches of an IF/Switch fire simultaneously
- No concept of "fallback route" — both branches either match or not
- Route order is visual only, no execution priority

### Make — Sequential Execution with Fallback

```
Router Module: N routes → processed ONE BY ONE in order
               Route 1 complete → then Route 2 starts
               Fallback route: runs when NO other route matches
               "Order routes" UI to rearrange priority
```

- Sequential: route 1 must fully complete before route 2 starts
- Explicit fallback route concept (like `else` in switch)
- "Select whole branch" to select all downstream modules

### FlowHolt Decision — Support Both Modes

**Router node with execution mode toggle:**

```
Router settings:
  □ Execution mode: [Parallel ▾]
    • Parallel     — all matching routes fire simultaneously (n8n default)
    • Sequential   — routes processed in order, stop at first match (Make default)
    • Sequential (all) — all routes process sequentially even if multiple match
  
  □ Fallback route: enabled/disabled
    — When enabled, last route activates only when no other route matches
  
  □ Route order: drag to reorder (matters in Sequential mode)
```

**Implementation:**
- IF node: always parallel (2 outputs, no ordering concern)
- Switch node: parallel by default, Sequential option in settings
- Router node (dedicated): sequential by default with fallback support

---

## 9. Iterator + Aggregator Pattern

### Make — Explicit Iterator → Aggregator

```
[Source] → [Iterator] → [Module A] → [Module B] → [Aggregator] → [Next]
                ↑                                        ↑
         Splits array                            Merges back
         into bundles                            into one bundle
```

- Iterator: splits array → individual bundles (one per item)
- Aggregator: merges multiple bundles → single bundle with array
- Array Aggregator: generic merge
- Specialized aggregators (e.g. Archive > Create ZIP)
- "Group by" field: split aggregation output into groups by key
- "Stop processing after empty aggregation" option

### n8n — Auto-Iteration + Loop Over Items

```
Auto-iteration (invisible):
  Any node receiving multiple items → automatically runs N times
  No explicit Iterator node needed

Loop Over Items (explicit loop):
  [Start] → [Loop Over Items] → [Process] → [back to Loop] → [Done]
  Supports: Batch size, Max iterations, Item index
```

- Auto-iteration is n8n's default — nearly invisible to user
- `Loop Over Items` node for explicit loops with batching
- Item Linking tracks pairedItem for reverse-mapping
- No built-in Array Aggregator node (use Merge node in "Combine" mode)

### FlowHolt Decision

**Support both patterns:**

1. **Auto-iteration** (n8n-style, default) — any node with multi-item input auto-iterates
2. **Iterator node** (Make-style explicit) — visual split for clarity
3. **Array Aggregator node** (Make-style) — explicit merge back
4. **Loop Over Items node** (n8n-style) — for complex loops with batching, break conditions

**Aggregator spec:**
```
Array Aggregator node settings:
  Source Module: [dropdown of upstream nodes]
  Group by: [expression field] (optional)
  Stop if empty: [toggle]
  Output format: [Array | Object with key]
```

---

## 10. Webhooks — Detailed Comparison

### n8n Webhooks
```
Test URL:       Different per session (changes each time you open workflow)
Production URL: Stable, workflow must be active
Registration:   Per-workflow, per-node
Queue:          Executions queue in DB when workflow is executing
Processing:     Sequential per execution (one execution at a time)
Auth:           Basic, Header, JWT, None
Response modes: Immediately / On last node / Using response node
```

### Make Webhooks
```
Queue capacity:  10,000 items max
Parallel:        Toggle between sequential and parallel processing
Rate limit:      300 requests per 10 seconds
Auto-deactivation: After 5 days of inactivity → returns 410 Gone
Logs:            3 days (standard), 30 days (Enterprise)
Webhook URL:     Stable per scenario
Instant vs scheduled: Webhooks are "instant" triggers (vs scheduled)
```

### FlowHolt Webhook Spec

| Feature | Spec |
|---------|------|
| **URL types** | Test URL (session-scoped, resets on close) + Production URL (stable) |
| **Queue size** | 10,000 items default; configurable per webhook |
| **Processing mode** | Toggle: Parallel (default) / Sequential |
| **Rate limiting** | 300 req/10s default; adjustable per plan |
| **Auto-deactivation** | After N days of inactivity (configurable, default 7 days); returns 410 Gone |
| **Log retention** | 3 days (free), 30 days (pro), 90 days (enterprise) |
| **Authentication** | None / Basic Auth / API Key (header) / JWT / Custom |
| **Response options** | Immediately (200 OK) / Last node output / Respond node |
| **Webhook management UI** | List all webhooks, see last triggered, toggle active, view recent payloads |

**UI panel — Webhook Logs:**
```
Webhook: POST /hooks/uuid-xxx
Status: Active | Last triggered: 2 mins ago | Queue: 0 items

[Recent Requests]
  ✓ 2024-01-15 14:23:11 | 200 | 12ms  | View payload
  ✓ 2024-01-15 14:22:05 | 200 | 8ms   | View payload
  ✗ 2024-01-15 14:20:00 | 429 | --    | Rate limited

[Settings]
  Processing: ● Parallel  ○ Sequential
  Rate limit: 300 req/10s
  Auto-deactivate after: [7 days ▾]
  Response: [Immediately ▾]
```

---

## 11. Form Trigger — n8n Feature (No Make Equivalent)

Make.com has no built-in form builder. n8n's Form Trigger is a powerful embedded feature.

### n8n Form Trigger Spec

**12 field types:**
1. Text (single line)
2. Textarea (multi-line)
3. Number
4. Email
5. Password (masked input)
6. Date
7. Dropdown (select from list)
8. Radio Buttons
9. Checkboxes
10. File (upload)
11. Hidden Field (pre-set value, not shown)
12. Custom HTML (arbitrary HTML block)

**URL types:**
- Test URL: only works when workflow open in editor
- Production URL: stable, requires workflow to be active

**Key features:**
- Query parameters: pre-fill fields (production only)
- Respond When: "Form is submitted" / "After last node" / "Using Respond to Webhook"
- Custom CSS styling option
- HTML security: sanitization with configurable allowed-tag list
- "Append n8n Attribution" toggle

### FlowHolt Form Trigger Spec

All 12 n8n field types supported + additional:
- **Rating** (star selector 1-5) ← FlowHolt exclusive
- **Signature** (canvas draw) ← FlowHolt exclusive
- **Address** (structured: street, city, country) ← FlowHolt exclusive

**URL pattern:** Same as n8n — Test URL (session-scoped) + Production URL

**Enhanced features over n8n:**
- Multi-step forms (wizard pages)
- Conditional field visibility (show/hide based on other answers)
- Form themes (match org branding)
- Response confirmation page customization
- Email receipt option on submission

---

## 12. Wait Node — n8n Feature

### n8n Wait Node — 4 Resume Modes

| Mode | Description |
|------|-------------|
| After Time Interval | Wait N seconds/minutes/hours/days, then auto-resume |
| At Specified Time | Wait until specific DateTime, then auto-resume |
| On Webhook Call | Pause, resume when `$execution.resumeUrl` is POSTed to |
| On Form Submitted | Pause, resume when embedded form is submitted |

**Key implementation notes:**
- `$execution.resumeUrl` — unique per execution, changes after partial executions
- Webhook Suffix needed when multiple Wait nodes in same workflow (distinguish which to resume)
- `<65 seconds` = stays in memory (no DB write); `≥65 seconds` = offloads to persistent DB
- Auth options on webhook resume: Basic Auth / Header Auth / JWT / None
- "Limit Wait Time" option — max duration before auto-failing

### FlowHolt Wait Node Spec

All 4 n8n modes + additions:

| Mode | FlowHolt |
|------|---------|
| After Time Interval | ✅ |
| At Specified Time | ✅ |
| On Webhook Call | ✅ with same `$execution.resumeUrl` pattern |
| On Form Submitted | ✅ |
| **On Approval** | ✅ NEW — pause until human approves in HumanTasks panel |
| **On AI Decision** | ✅ NEW — pause until AI evaluation completes |

**`$execution.resumeUrl`** — FlowHolt exposes as `$resumeUrl` (shorthand) in addition to full path.

**Performance note:** Same <65s / ≥65s optimization as n8n — short waits stay in memory.

---

## 13. Error Handling — Comprehensive Comparison

### n8n Error Handling (Per-Node)

Node-level settings:
```
On Error:
  □ Stop Workflow — default, throw and halt
  □ Continue (using data of last execution)
  □ Continue (using data of error output)
  □ Retry on fail (N times, N second delay)

Error Workflow:
  □ Assign a separate workflow to trigger on error
  (receives: $execution, $node, $workflow context)

Timeout: per-node timeout in ms
```

Node output options:
- "Always output data" — emit even on error
- "Execute Once" — single run regardless of input count

### Make Error Handling (Per-Module + Route-based)

5 error handler types attached as route branches:

| Handler | Behavior | Scenario status |
|---------|----------|-----------------|
| **Break** | Store as incomplete execution; retry-able | Warning |
| **Commit** | Stop + save processed changes | Success |
| **Ignore** | Skip failed bundle, continue others | Success |
| **Resume** | Provide substitute mapping, continue | Success |
| **Rollback** | Stop + revert all transactional changes; auto-disable after N consecutive | Error |

Default (no handler set): Rollback behavior.

**Incomplete Executions** (Make's "Break" pattern):
- Failed execution stored in queue
- Can be retried manually or with auto-retry
- User resolves queue from Operations panel

### FlowHolt Error Handling Spec — Best of Both

**Per-node settings** (n8n-style UI):
```
Error handling tab in node inspector:
  On Error: [Stop Workflow ▾]
    • Stop Workflow (default)
    • Continue with last execution data
    • Continue with error output data  
    • Retry (N times, every N seconds)
    • Break → Incomplete Execution queue ← Make pattern
    • Commit → Save progress + stop ← Make pattern
    • Ignore → Skip this item, continue ← Make pattern
    • Resume → Substitute data [mapping field] ← Make pattern
    • Rollback → Revert transactional changes + stop ← Make pattern
  
  Error Workflow: [Select workflow ▾]  ← n8n pattern
  Timeout: [___ ms]
  Execute Once: [toggle]
  Always Output Data: [toggle]
```

**Error route branches** (Make-style visual):
- Right-click node → "Add error handler" → choose handler type
- Error route visualized as red dashed edge on canvas

**Incomplete Executions queue** (Make-style):
- Visible in Operations panel
- Shows: workflow, node, error message, failed at timestamp
- Actions: Retry, Resolve manually, View data

---

## 14. Custom Functions — Make Enterprise Feature

### Make Custom Functions

```
Location:     Left sidebar → Functions
Availability: Enterprise plan only
Language:     JavaScript ES6 (no 3rd party libraries)
Limits:
  • 300ms max execution time
  • 5,000 character code limit  
  • Must be synchronous (no async/await)
  • Cannot make HTTP requests
  • Cannot call other custom functions
  • Cannot use recursion
  • Cannot use browser-only APIs

Access built-ins: via `iml` object → `iml.length(text)`
Version history: Every save = new version; compare + restore
Team scoping: All team members can use; only Team Admin can create/edit
Debug: Inline debug console under code editor
```

### n8n Equivalent

n8n has no "custom functions" feature — users write code in the Code node (JS/Python) instead. The Code node is more powerful (no limits, HTTP allowed, any npm-style code) but runs as a full node, not as an expression-level function.

### FlowHolt Custom Functions Spec

**Tiered approach:**

| Tier | Name | Availability | Limits |
|------|------|-------------|--------|
| **Snippet** | Expression snippets | All plans | Single-line expressions saved as named shortcuts |
| **Function** | Custom functions | Pro+ | JS/Python, 500ms max, 10KB limit, no HTTP |
| **Code Node** | Full code block | All plans | Full JS/Python, can make HTTP, no limit |
| **Lambda** | Cloud function | Enterprise | Full Node.js/Python, HTTP allowed, separate container |

**Custom Function UI:**
```
Team Settings → Custom Functions
  [+ New Function]
  
  Name: myCalculation
  Description: Calculate compound interest
  Language: [JavaScript ▾]
  
  function myCalculation(principal, rate, years) {
    return principal * Math.pow(1 + rate, years);
  }
  
  [Test console]  [History]  [Scenarios using this]
  [Save]
```

---

## 15. Data Structures — Make vs FlowHolt

### Make Data Structures

Make has explicit "Data Structures" for defining schemas:
- Define fields, types, validation
- Used to parse/validate module inputs and outputs
- Can be shared across scenarios
- Types: text, number, boolean, date, array, collection, buffer

### n8n Equivalent

No explicit data structure definition. JSON schema inferred from node outputs. Input validation per-parameter.

### FlowHolt Decision

**Flexible schemas with optional strict mode:**

```
Data Structure (optional):
  Define named schemas in workspace settings
  Available as type hints in expression editor
  Strict mode: validate data against schema at runtime
  
Example schema (JSON Schema format):
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" },
    "tags": { "type": "array", "items": { "type": "string" } }
  }
}
```

---

## 16. Execution Model — Full Comparison

### n8n Execution Flow

```
Trigger fires → all items collected → execution begins
Each node: receives ALL items → processes all → passes all downstream
"Run Once": single execution per batch
"Execute Once": process only first item (skip rest)
Item linking: track which output came from which input (pairedItem)
Partial execution: re-run from a specific node (dev feature)
```

### Make Execution Flow

```
Trigger fires → each record = one bundle
Each module: receives ONE bundle → processes → passes one downstream
Router: sequential (default) route evaluation
Aggregator: collect N bundles → emit one
"Operations": each module run = 1 operation (billing unit)
Concurrent executions: toggle sequential/parallel per scenario
```

### Key Difference

- **n8n**: batch-first — all items flow through together, processed N×M
- **Make**: bundle-first — one item flows all the way through, then next item

FlowHolt decision: **n8n-style batch processing** (more efficient for large datasets) with explicit Iterator node for Make-compatible one-at-a-time processing.

---

## 17. Gap Analysis — Current Specs Need These Updates

### Spec 86 (Expression Methods) — Missing

Add section on Make-style top-level function aliases:
- `formatDate()`, `parseDate()`, `addDays()`, etc. (See section 5)
- `if()`, `ifempty()`, `switch()`, `pick()`, `omit()` (See section 2b)
- `formatNumber()`, `parseNumber()` (See section 6)
- `sha256()`, `md5()`, `sha1()` top-level hash functions (See section 7)
- `shuffle()`, `distinct(key)`, `reverse()`, `remove()` for arrays (See section 4)

### Spec 80 (Flow Logic Patterns) — Missing

Add sections:
- Make Router sequential mode (Section 8 above)
- Make error handlers: Break/Commit/Ignore/Resume/Rollback (Section 13)
- Incomplete Executions queue UI (Section 13)
- Aggregator node pattern (Section 9)

### Spec 82 (Node Builder) — Missing

Add:
- Aggregator node type definition
- Iterator node type definition
- Custom function node type

### All Specs — Make Token Compatibility Note

Every spec mentioning dates should note: FlowHolt accepts both Luxon tokens (`yyyy`, `dd`) and moment.js tokens (`YYYY`, `DD`) — normalized automatically.

---

## 18. FlowHolt-Exclusive Features (Neither Platform Has)

From synthesizing both platforms, these gaps exist in both that FlowHolt can fill:

| Feature | Why Needed |
|---------|-----------|
| `$now.businessDaysAdd(n)` | Neither platform has built-in business day arithmetic |
| `dateDifference(d1, d2, 'business_days')` | Count working days between dates |
| Case-insensitive sort with locale | Make has 'asc ci' but no locale-aware sort |
| Form field: Rating (stars) | n8n form builder lacks this; common UX pattern |
| Form field: Signature | Legal/approval workflows need it |
| Multi-step form wizard | Neither has multi-page form support |
| Wait mode: On Approval | Human approval task queue integration |
| Router: sequential-all mode | Process all routes in order (not just first match) |
| `$switch()` expression function | Make has switch() but n8n lacks expression-level switch |
| `$pick()`, `$omit()` object functions | Clean object subset/exclusion |
| Custom function: Lambda tier | Full container with HTTP allowed (neither offers free-tier HTTP in expressions) |
| Webhook queue UI | Make has logs but no visual queue management |

---

## 19. Implementation Priority Matrix

| Feature | Priority | Effort | Spec Reference |
|---------|----------|--------|----------------|
| Make-style top-level function aliases | High | Low | Spec 86 update |
| `shuffle()`, `distinct(key)` array methods | High | Low | Spec 86 update |
| Router sequential mode | High | Medium | Spec 80 update |
| Make error handlers (Break/Commit/Ignore/Resume/Rollback) | High | High | Spec 80 update |
| Aggregator node | Medium | Medium | Spec 82 update |
| `$switch()` expression function | Medium | Low | Spec 86 update |
| `$pick()`, `$omit()` | Medium | Low | Spec 86 update |
| `formatNumber()`, `parseNumber()` | Medium | Low | Spec 86 update |
| Date token normalization (YYYY→yyyy) | Medium | Medium | Expression engine |
| Form field: Rating, Signature | Low | Medium | New spec |
| Multi-step form wizard | Low | High | New spec |
| Custom functions (team-scoped JS) | Low | High | New spec |
| Business day date arithmetic | Low | Low | Spec 86 update |

---

## 20. Summary Table — Platform Feature Matrix

| Feature | n8n | Make | FlowHolt |
|---------|-----|------|---------|
| Expression syntax | `{{ }}` + method chaining | Pills + function calls | Both |
| Array indexing | 0-based | 1-based | 0-based + helpers |
| Parallel routing | ✅ default | ❌ sequential default | Both modes |
| Fallback routes | ❌ | ✅ | ✅ |
| Explicit Iterator | ❌ (auto) | ✅ | Both |
| Array Aggregator | ❌ (Merge node) | ✅ | ✅ |
| Form Trigger | ✅ (12 types) | ❌ | ✅ (15 types) |
| Wait node | ✅ (4 modes) | ❌ | ✅ (6 modes) |
| Error handlers (5 types) | ❌ (2 modes) | ✅ | ✅ |
| Custom functions | ❌ | ✅ Enterprise | ✅ Pro+ |
| Custom functions: HTTP | ✅ (Code node) | ❌ | ✅ (Lambda tier) |
| Webhook queue UI | Limited | ✅ | ✅ |
| Sequential webhook processing | ✅ | ✅ | ✅ |
| Date library | Luxon | moment.js-style | Luxon + Make aliases |
| JMESPath | ✅ (param reversed) | ❌ | ✅ (documented) |
| AI/LangChain | ✅ deep | Limited | ✅ (from spec 81) |
| `$switch()` in expressions | ❌ | ✅ | ✅ |
| `$pick()`, `$omit()` | ❌ | ✅ | ✅ |
| Case-insensitive sort | ❌ | ✅ | ✅ |
| `shuffle()` | ❌ | ✅ | ✅ |
| `formatNumber()` locale | ❌ | ✅ | ✅ |

---

*Spec 89 — Written: Sprint 90 research session*  
*Sources: n8n expression docs, n8n Form Trigger docs, n8n Wait node docs, Make general functions, array functions, date functions, math functions, hash functions, router, iterator, aggregator, webhooks, error handlers, custom functions*
