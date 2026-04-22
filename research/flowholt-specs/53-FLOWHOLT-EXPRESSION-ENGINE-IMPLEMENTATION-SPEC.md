# FlowHolt Expression Engine — Implementation Specification

> **Status:** New file created 2026-04-17  
> **Depends on:** `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` (design spec)  
> **Direction:** File 50 defines WHAT the expression engine does. This file defines HOW to build it — sandbox architecture, security model, parser pipeline, complete method reference, error handling, and performance constraints.  
> **Vault:** [[wiki/concepts/expression-language]]  
> **Raw sources:**  
> - n8n expression evaluator: `n8n-master/packages/core/src/expression-evaluator.ts`  
> - n8n built-in methods: `n8n-master/packages/workflow/src/Extensions/` (StringExtensions, ArrayExtensions, NumberExtensions, ObjectExtensions, DateExtensions, BooleanExtensions)  
> - n8n expression docs: `research/n8n-docs-export/pages_markdown/data/expressions.md`  
> - Make template functions: `research/make-pdf-full.txt` §Functions  

---

## 1. Architecture Overview

### Expression Pipeline

```
User types expression → Parser → AST → Security Lint → Sandbox Eval → Result
```

**Stages:**

| Stage | Input | Output | Purpose |
|-------|-------|--------|---------|
| 1. Tokenizer | Raw field value string | Template segments | Split `{{ expr }}` from literal text |
| 2. Parser | Expression string | JavaScript AST | Parse JS expression using Acorn |
| 3. Security Lint | AST | Pass / Reject | Block forbidden constructs |
| 4. Context Injection | AST + workflow state | Scoped context object | Build `$json`, `$input`, `$now`, etc. |
| 5. Sandbox Eval | AST + context | Result value | Execute in isolated sandbox |
| 6. Type Coercion | Raw result | Field-typed result | Coerce to target field type |

### Where It Runs

| Context | Engine | Reason |
|---------|--------|--------|
| **Backend executor** | `isolated-vm` (V8 isolate) | Production execution — must be sandboxed, memory-limited, CPU-limited |
| **Studio preview** | Browser `Function()` with proxy trap | Live preview while editing — instant feedback, no server round-trip |
| **Validation** | Acorn parse only (no eval) | Syntax check without execution |

---

## 2. Sandbox Security Model

### Threat Model

Expressions are user-authored JavaScript running inside the platform. They MUST NOT:
- Access the filesystem, network, or process
- Read environment variables not explicitly allowlisted
- Access other workflows' data or other users' data
- Execute infinite loops or consume unbounded memory
- Import/require modules
- Access `globalThis`, `window`, `process`, `require`, `eval`, `Function`

### Backend: `isolated-vm` Configuration

```python
# Python backend uses subprocess to call Node.js expression evaluator
# OR: use a Python-native JS engine (QuickJS via quickjs-emscripten)

# Recommended: Node.js sidecar with isolated-vm
EXPRESSION_ENGINE_CONFIG = {
    "memory_limit_mb": 16,          # per-expression memory limit
    "timeout_ms": 3000,              # per-expression CPU timeout
    "max_expression_length": 10000,  # characters
    "max_output_size_bytes": 1048576, # 1 MB result limit
}
```

### Forbidden AST Patterns (Security Lint)

The security lint pass walks the AST and rejects expressions containing:

| Forbidden Pattern | Reason |
|-------------------|--------|
| `ImportExpression` | No dynamic imports |
| `AwaitExpression` | No async — expressions are synchronous |
| `AssignmentExpression` to global | No side effects on globals |
| `MemberExpression` accessing `__proto__`, `constructor`, `prototype` | Prototype pollution |
| `CallExpression` to `eval`, `Function`, `setTimeout`, `setInterval` | Code injection |
| `MemberExpression` on `process`, `require`, `globalThis`, `window` | Sandbox escape |
| `ForStatement`, `WhileStatement`, `DoWhileStatement` | Loop bombs (only in single-expression mode) |
| `TemplateLiteral` with expressions containing `${}` nesting | Double-evaluation |

### Allowlisted Globals in Sandbox

```javascript
const SANDBOX_GLOBALS = {
    // Math
    Math, Number, parseInt, parseFloat, isNaN, isFinite, Infinity, NaN,
    // String/Array/Object
    String, Array, Object, JSON, RegExp, Map, Set,
    // Date/Time (Luxon only — not native Date)
    DateTime: luxon.DateTime, Duration: luxon.Duration, Interval: luxon.Interval,
    // FlowHolt helpers
    $jmespath: jmespathSearch,
    $fromAI: fromAIPlaceholder,  // only active in agent tool context
    // Type checking
    typeof: undefined,  // operator, not a function — always available
    undefined, null, true, false,
};
```

### Studio Preview: Browser Sandbox

```typescript
function evaluatePreview(expression: string, context: Record<string, unknown>): unknown {
    const fn = new Function(...Object.keys(context), `"use strict"; return (${expression});`);
    return fn(...Object.values(context));
}
```

Studio preview is best-effort — it uses the last execution output or pinned data as context. Preview errors show inline but don't block saving.

---

## 3. Template Tokenizer

Splits a field value into literal and expression segments.

### Grammar

```
field_value = (literal | expression)*
literal     = any text not containing "{{"
expression  = "{{" whitespace? js_expression whitespace? "}}"
```

### Examples

| Field Value | Segments |
|-------------|----------|
| `Hello world` | `[{type: "literal", value: "Hello world"}]` |
| `{{ $json.name }}` | `[{type: "expression", value: "$json.name"}]` |
| `Hi {{ $json.name }}, your order #{{ $json.orderId }}` | `[literal, expression, literal, expression]` |

### Edge Cases

- Nested `{{ }}` inside strings: `{{ "{{not a template}}" }}` → the inner `{{` is a string literal
- Escaped braces: `\{\{` → literal `{{` (not an expression)
- Empty expression: `{{ }}` → error: empty expression
- Unclosed: `{{ $json.name` → error: unclosed expression delimiter

### Tokenizer Output

After evaluation, segments are concatenated:
- If all segments are literals → return as string
- If single expression segment → return typed result (number, boolean, object, array)
- If mixed literal + expression → all coerced to string, concatenated

---

## 4. Complete Built-In Method Reference

### 4.1 String Methods (45 methods)

#### Native JavaScript String Methods

| Method | Signature | Return | Example |
|--------|-----------|--------|---------|
| `length` | property | number | `"hello".length` → `5` |
| `charAt(index)` | `(number) → string` | string | `"hello".charAt(1)` → `"e"` |
| `charCodeAt(index)` | `(number) → number` | number | `"A".charCodeAt(0)` → `65` |
| `concat(...strings)` | `(...string) → string` | string | `"a".concat("b","c")` → `"abc"` |
| `endsWith(search, length?)` | `(string, number?) → boolean` | boolean | `"hello".endsWith("lo")` → `true` |
| `includes(search, pos?)` | `(string, number?) → boolean` | boolean | `"hello".includes("ell")` → `true` |
| `indexOf(search, pos?)` | `(string, number?) → number` | number | `"hello".indexOf("l")` → `2` |
| `lastIndexOf(search, pos?)` | `(string, number?) → number` | number | `"hello".lastIndexOf("l")` → `3` |
| `match(regex)` | `(RegExp) → array\|null` | array\|null | `"a1b2".match(/\d+/g)` → `["1","2"]` |
| `matchAll(regex)` | `(RegExp) → iterator` | iterator | Full match objects |
| `normalize(form?)` | `(string?) → string` | string | Unicode normalization |
| `padEnd(length, fill?)` | `(number, string?) → string` | string | `"5".padEnd(3,"0")` → `"500"` |
| `padStart(length, fill?)` | `(number, string?) → string` | string | `"5".padStart(3,"0")` → `"005"` |
| `repeat(count)` | `(number) → string` | string | `"ab".repeat(3)` → `"ababab"` |
| `replace(search, replacement)` | `(string\|RegExp, string) → string` | string | First match only |
| `replaceAll(search, replacement)` | `(string, string) → string` | string | All matches |
| `search(regex)` | `(RegExp) → number` | number | Index of first match, or -1 |
| `slice(start, end?)` | `(number, number?) → string` | string | `"hello".slice(1,3)` → `"el"` |
| `split(sep, limit?)` | `(string\|RegExp, number?) → string[]` | array | `"a,b,c".split(",")` → `["a","b","c"]` |
| `startsWith(search, pos?)` | `(string, number?) → boolean` | boolean | `"hello".startsWith("hel")` → `true` |
| `substring(start, end?)` | `(number, number?) → string` | string | Like slice but no negatives |
| `toLowerCase()` | `() → string` | string | `"HELLO".toLowerCase()` → `"hello"` |
| `toUpperCase()` | `() → string` | string | `"hello".toUpperCase()` → `"HELLO"` |
| `trim()` | `() → string` | string | `" hi ".trim()` → `"hi"` |
| `trimStart()` | `() → string` | string | Left trim |
| `trimEnd()` | `() → string` | string | Right trim |
| `at(index)` | `(number) → string` | string | `"hello".at(-1)` → `"o"` |

#### FlowHolt Extension Methods (String)

| Method | Signature | Return | Description |
|--------|-----------|--------|-------------|
| `toNumber()` | `() → number` | number | Parse string to number. Throws on non-numeric. |
| `toBoolean()` | `() → boolean` | boolean | `"true"/"1"/"yes"` → true, `"false"/"0"/"no"` → false |
| `toDateTime(format?)` | `(string?) → DateTime` | DateTime | Parse to Luxon DateTime. Optional format string. |
| `isEmpty()` | `() → boolean` | boolean | True if `""` or whitespace-only |
| `isNotEmpty()` | `() → boolean` | boolean | Inverse of isEmpty |
| `isEmail()` | `() → boolean` | boolean | RFC 5322 email validation |
| `isUrl()` | `() → boolean` | boolean | Valid URL check |
| `isNumeric()` | `() → boolean` | boolean | Can be parsed as number |
| `hash(algo)` | `(string) → string` | string | `"text".hash("md5")` → hex digest. Algos: md5, sha1, sha256, sha512 |
| `urlEncode()` | `() → string` | string | `encodeURIComponent` |
| `urlDecode()` | `() → string` | string | `decodeURIComponent` |
| `base64Encode()` | `() → string` | string | Base64 encode |
| `base64Decode()` | `() → string` | string | Base64 decode |
| `removeTags()` | `() → string` | string | Strip HTML/XML tags |
| `removeMarkdown()` | `() → string` | string | Strip Markdown formatting |
| `escapeHtml()` | `() → string` | string | Escape `<>&"'` |
| `extractEmail()` | `() → string` | string | Extract first email from text |
| `extractUrl()` | `() → string` | string | Extract first URL from text |
| `quote()` | `() → string` | string | Wrap in double quotes |

### 4.2 Array Methods (36 methods)

#### Native JavaScript Array Methods

| Method | Signature | Return |
|--------|-----------|--------|
| `length` | property | number |
| `at(index)` | `(number) → T` | element |
| `concat(...arrays)` | `(...T[]) → T[]` | array |
| `every(fn)` | `(fn: T → boolean) → boolean` | boolean |
| `filter(fn)` | `(fn: T → boolean) → T[]` | array |
| `find(fn)` | `(fn: T → boolean) → T\|undefined` | element |
| `findIndex(fn)` | `(fn: T → boolean) → number` | number |
| `flat(depth?)` | `(number?) → T[]` | array |
| `flatMap(fn)` | `(fn: T → U[]) → U[]` | array |
| `forEach(fn)` | `(fn: T → void) → void` | void |
| `includes(val, fromIndex?)` | `(T, number?) → boolean` | boolean |
| `indexOf(val, fromIndex?)` | `(T, number?) → number` | number |
| `join(sep?)` | `(string?) → string` | string |
| `lastIndexOf(val, fromIndex?)` | `(T, number?) → number` | number |
| `map(fn)` | `(fn: T → U) → U[]` | array |
| `reduce(fn, init?)` | `(fn, T?) → T` | value |
| `reduceRight(fn, init?)` | `(fn, T?) → T` | value |
| `reverse()` | `() → T[]` | array |
| `slice(start?, end?)` | `(number?, number?) → T[]` | array |
| `some(fn)` | `(fn: T → boolean) → boolean` | boolean |
| `sort(fn?)` | `(fn?) → T[]` | array |
| `splice(start, count, ...items)` | `(number, number?, ...T) → T[]` | removed |

#### FlowHolt Extension Methods (Array)

| Method | Signature | Return | Description |
|--------|-----------|--------|-------------|
| `first()` | `() → T` | element | First element. Throws on empty. |
| `last()` | `() → T` | element | Last element. Throws on empty. |
| `isEmpty()` | `() → boolean` | boolean | `length === 0` |
| `isNotEmpty()` | `() → boolean` | boolean | `length > 0` |
| `unique()` | `() → T[]` | array | Deduplicate (shallow equality) |
| `sum()` | `() → number` | number | Sum of numeric elements |
| `average()` | `() → number` | number | Mean of numeric elements |
| `min()` | `() → number` | number | Minimum numeric value |
| `max()` | `() → number` | number | Maximum numeric value |
| `compact()` | `() → T[]` | array | Remove null, undefined, empty string |
| `chunk(size)` | `(number) → T[][]` | array of arrays | Split into chunks of N |
| `toJsonString()` | `() → string` | string | `JSON.stringify()` |
| `pluck(key)` | `(string) → any[]` | array | Extract field from array of objects |
| `smartJoin(sep, lastSep?)` | `(string, string?) → string` | string | `["a","b","c"].smartJoin(", ", " and ")` → `"a, b and c"` |

### 4.3 Number Methods (14 methods)

#### Native

| Method | Signature | Return |
|--------|-----------|--------|
| `toFixed(digits?)` | `(number?) → string` | string |
| `toPrecision(precision?)` | `(number?) → string` | string |
| `toString(radix?)` | `(number?) → string` | string |

#### FlowHolt Extensions

| Method | Signature | Return | Description |
|--------|-----------|--------|-------------|
| `floor()` | `() → number` | number | `Math.floor(this)` |
| `ceil()` | `() → number` | number | `Math.ceil(this)` |
| `round(decimals?)` | `(number?) → number` | number | Round to N decimal places |
| `abs()` | `() → number` | number | Absolute value |
| `isEven()` | `() → boolean` | boolean | `this % 2 === 0` |
| `isOdd()` | `() → boolean` | boolean | `this % 2 !== 0` |
| `toBoolean()` | `() → boolean` | boolean | `0` → false, everything else → true |
| `toDateTime()` | `() → DateTime` | DateTime | Treat as Unix timestamp (seconds) |
| `toCurrency(locale?, currency?)` | `(string?, string?) → string` | string | `(1234.5).toCurrency("en-US","USD")` → `"$1,234.50"` |
| `format(locale?)` | `(string?) → string` | string | Locale-formatted number string |
| `isEmpty()` | `() → boolean` | boolean | Always false for numbers |

### 4.4 Boolean Methods (3 methods)

| Method | Signature | Return | Description |
|--------|-----------|--------|-------------|
| `toNumber()` | `() → number` | number | `true` → 1, `false` → 0 |
| `toString()` | `() → string` | string | `"true"` or `"false"` |
| `isEmpty()` | `() → boolean` | boolean | Always false for booleans |

### 4.5 Object Methods (12 methods)

#### Native (via Object global)

| Method | Signature | Return |
|--------|-----------|--------|
| `Object.keys(obj)` | `(object) → string[]` | array |
| `Object.values(obj)` | `(object) → any[]` | array |
| `Object.entries(obj)` | `(object) → [string, any][]` | array |
| `Object.assign(target, ...sources)` | `(object, ...object) → object` | object |
| `Object.fromEntries(entries)` | `([string, any][]) → object` | object |
| `JSON.stringify(obj, replacer?, space?)` | `(any, any?, number?) → string` | string |
| `JSON.parse(str)` | `(string) → any` | any |

#### FlowHolt Extensions

| Method | Signature | Return | Description |
|--------|-----------|--------|-------------|
| `hasField(key)` | `(string) → boolean` | boolean | `Object.hasOwnProperty(key)` |
| `isEmpty()` | `() → boolean` | boolean | `Object.keys(this).length === 0` |
| `isNotEmpty()` | `() → boolean` | boolean | Has at least one key |
| `removeField(key)` | `(string) → object` | object | Returns new object without the key |
| `removeFieldsContaining(str)` | `(string) → object` | object | Remove keys containing substring |

### 4.6 DateTime Methods (60+ via Luxon)

See file 50, §5 for the full Luxon reference. Key implementation notes:

- Luxon `DateTime` is injected as a global in the sandbox
- `$now` is created fresh per-expression evaluation (not per-workflow — so two nodes in the same run may have slightly different `$now`)
- `$today` is `$now.startOf('day')`
- Workflow timezone setting determines the zone for `$now` and `$today`
- All FlowHolt date serialization uses ISO 8601

### 4.7 Root-Level Functions (26 total)

| Function | Signature | Category | Description |
|----------|-----------|----------|-------------|
| `$json` | context variable | Core | Alias for `$input.first().json` |
| `$input` | InputObject | Core | All input items |
| `$now` | DateTime | Core | Current timestamp (workflow TZ) |
| `$today` | DateTime | Core | Midnight today (workflow TZ) |
| `$vars` | object | Core | Workspace variables |
| `$workflow` | object | Extended | `{id, name, active}` |
| `$execution` | object | Extended | `{id, mode, startedAt, resumeUrl, customData}` |
| `$node` | object | Extended | Current node metadata |
| `$env` | object | Extended | Allowlisted environment variables |
| `$itemIndex` | number | Extended | Current item index (0-based) |
| `$runIndex` | number | Extended | Current loop iteration |
| `$binary` | object | Extended | `$input.first().binary` |
| `$prevNode` | object | Extended | Previous node's metadata |
| `$parameter` | object | Extended | Current node's parameters |
| `$jmespath(data, expr)` | function | Power | JMESPath query |
| `$fromAI(name, desc, type)` | function | AI | LLM parameter placeholder |
| `$if(cond, then, else)` | function | Helper | Ternary shorthand |
| `$ifEmpty(val, fallback)` | function | Helper | Null/undefined/empty coalescing |
| `$min(...vals)` | function | Helper | Minimum of values |
| `$max(...vals)` | function | Helper | Maximum of values |
| `$sum(...vals)` | function | Helper | Sum of values |
| `$average(...vals)` | function | Helper | Mean of values |
| `$randomInt(min, max)` | function | Helper | Random integer in range |
| `$parseDate(str, format?)` | function | Helper | Parse date string → DateTime |
| `$lookup(array, key, val)` | function | Helper | Find object in array by key match |
| `$not(val)` | function | Helper | Boolean negation |

---

## 5. Expression Errors

### Error Types

| Error | When | User Message |
|-------|------|-------------|
| `ExpressionSyntaxError` | Acorn parse fails | "Expression syntax error at position N: unexpected token" |
| `ExpressionSecurityError` | Forbidden AST pattern | "Expression contains forbidden construct: [pattern]" |
| `ExpressionTimeoutError` | Exceeds 3s CPU time | "Expression timed out after 3 seconds" |
| `ExpressionMemoryError` | Exceeds 16MB memory | "Expression exceeded memory limit" |
| `ExpressionReferenceError` | Accessing undefined variable | "Cannot read property 'X' of undefined" |
| `ExpressionTypeError` | Invalid method on type | "'toNumber' is not a function on type Array" |
| `ExpressionResultTooLarge` | Result > 1MB | "Expression result exceeds maximum size" |

### Error Handling Modes

| Mode | Behavior | When |
|------|----------|------|
| **Strict (production)** | Expression error → node fails with `DataError` | Default for production runs |
| **Lenient (preview)** | Expression error → show error inline, don't fail | Studio live preview |
| **Fallback** | Expression error → use fallback value | Configurable per-field (Phase 2) |

---

## 6. Performance Constraints

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Max expression length | 10,000 chars | Prevent abuse |
| Max evaluation time | 3,000 ms | Per-expression, not per-node |
| Max memory per eval | 16 MB | isolated-vm isolate limit |
| Max result size | 1 MB | Prevent giant string returns |
| Max expressions per node | 100 | Fields × items matrix |
| Max total expression time per node | 30,000 ms | Sum of all field evaluations |
| Expression cache TTL | Duration of single execution | Cache repeated `$json.X` access |

### Item-Level Evaluation

When a node has N input items and M expression fields:
- Total evaluations = N × M
- Each evaluation gets its own `$json` context (the current item)
- `$input.all()` is shared across evaluations (not recomputed)
- `$now` is computed once per node execution, shared across items

---

## 7. Autocomplete Engine

### Data Sources for Autocomplete

| Source | What It Provides | When Available |
|--------|-----------------|----------------|
| **Last execution output** | Previous node's `FlowItem[]` | After first manual run |
| **Pinned data** | Saved `FlowItem[]` | After user pins output |
| **Schema inference** | Inferred JSON shape | Always (from node type definition) |
| **Context variables** | `$json`, `$input`, `$now`, etc. | Always |
| **Method catalog** | Extension methods per type | Always |

### Autocomplete Behavior

1. User types `$` → show all context variables
2. User types `$json.` → show keys from last execution / pinned data / inferred schema
3. User types `$json.name.` → show String methods (infer type from data)
4. User types `$now.` → show DateTime methods
5. User types `$input.` → show `all()`, `first()`, `last()`, `item`

### Autocomplete UI

- Dropdown with icons per type (string 📝, number #, boolean ✓, array [], object {}, DateTime 📅)
- Method signature shown on hover
- Live preview of expression result shown below input field
- Tab to accept, Escape to dismiss

---

## 8. Backend Module Structure

### Python Backend Integration

The FlowHolt backend is Python (FastAPI). The expression engine needs JavaScript evaluation. Options:

**Option A: Node.js Sidecar (Recommended)**

```
FastAPI backend ──HTTP──► Node.js expression service
                          ├── isolated-vm sandbox
                          ├── Luxon
                          ├── JMESPath
                          └── FlowHolt extension methods
```

- Separate Node.js process running an HTTP/gRPC expression evaluation service
- FastAPI sends `{expression, context, config}` → receives `{result, errors}`
- Horizontal scaling: multiple expression service instances
- Startup: launched alongside FastAPI in Docker Compose

**Option B: QuickJS via Python**

```
FastAPI backend ──inline──► quickjs-emscripten
                            ├── Luxon (bundled)
                            ├── JMESPath (bundled)
                            └── FlowHolt extensions
```

- Embed QuickJS JavaScript engine directly in Python process
- Simpler deployment, no sidecar
- Limited to QuickJS's JS engine capabilities (ES2020)
- May have performance limitations for complex expressions

**Recommendation:** Start with Option B (QuickJS) for simplicity in Phase 1. Migrate to Option A (Node.js sidecar) in Phase 2 when performance requirements increase.

### Expression Evaluation API (internal)

```python
# backend/app/expression_engine.py

class ExpressionEngine:
    def evaluate(
        self,
        expression: str,
        context: dict,          # $json, $input, $vars, $workflow, etc.
        field_type: str = "string",  # target type for coercion
        timeout_ms: int = 3000,
        mode: str = "strict",   # strict | lenient | fallback
        fallback_value: Any = None,
    ) -> ExpressionResult:
        ...

class ExpressionResult:
    value: Any
    type: str               # "string" | "number" | "boolean" | "object" | "array" | "datetime" | "null"
    errors: list[ExpressionError]
    evaluation_time_ms: float
```

### Integration with Executor

```python
# In executor.py, per-node execution:

async def resolve_node_parameters(node, input_items: list[FlowItem]) -> list[dict]:
    """Resolve all expression fields for all input items."""
    resolved = []
    for item in input_items:
        context = build_expression_context(item, input_items, workflow_state)
        params = {}
        for field_name, field_value in node.parameters.items():
            if is_expression(field_value):
                result = expression_engine.evaluate(
                    expression=extract_expression(field_value),
                    context=context,
                    field_type=node.field_types.get(field_name, "string"),
                )
                if result.errors and mode == "strict":
                    raise DataError(f"Expression error in {field_name}: {result.errors[0].message}")
                params[field_name] = result.value
            else:
                params[field_name] = field_value
        resolved.append(params)
    return resolved
```

---

## 9. Type Coercion Rules

When an expression result doesn't match the target field type:

| Result Type → | Target: string | Target: number | Target: boolean | Target: array | Target: object |
|---------------|---------------|---------------|----------------|--------------|---------------|
| **string** | identity | `parseFloat()` or error | `"true"/"1"/"yes"` → true | `JSON.parse()` if valid | `JSON.parse()` if valid |
| **number** | `String(n)` | identity | `0` → false, else → true | `[n]` | error |
| **boolean** | `"true"/"false"` | `1/0` | identity | `[b]` | error |
| **array** | `JSON.stringify()` | error | `length > 0` | identity | error |
| **object** | `JSON.stringify()` | error | `!isEmpty()` | `Object.values()` | identity |
| **null/undefined** | `""` | `0` | `false` | `[]` | `{}` |
| **DateTime** | `.toISO()` | `.toMillis()` | `true` | error | `.toObject()` |

---

## 10. Implementation Phases

### Phase 1 — Core Expression Engine

- [ ] Template tokenizer (`{{ }}` splitting)
- [ ] Acorn parser integration
- [ ] Security lint pass (forbidden patterns)
- [ ] QuickJS sandbox with memory/CPU limits
- [ ] Context injection: `$json`, `$input`, `$now`, `$today`, `$vars`
- [ ] String extension methods (19 FlowHolt extensions)
- [ ] Array extension methods (14 FlowHolt extensions)
- [ ] Number extension methods (11 FlowHolt extensions)
- [ ] Object extension methods (5 FlowHolt extensions)
- [ ] Boolean extension methods (3 FlowHolt extensions)
- [ ] Luxon DateTime integration
- [ ] `ExpressionEngine.evaluate()` API
- [ ] Executor integration (resolve_node_parameters)
- [ ] Expression error types and error messages
- [ ] Fixed/expression toggle in Studio inspector fields
- [ ] Basic autocomplete (context variables only)

### Phase 2 — Full Feature Set

- [ ] Extended context variables ($workflow, $execution, $node, $env, $itemIndex)
- [ ] Root-level helper functions ($if, $ifEmpty, $min, $max, etc.)
- [ ] JMESPath integration via `$jmespath()`
- [ ] Full autocomplete engine (data-aware, type-aware)
- [ ] Live expression preview in Studio
- [ ] Full-screen expression editor modal
- [ ] INPUT panel with drag-to-expression
- [ ] Type coercion with field-type awareness
- [ ] Expression validation endpoint (syntax-only, no eval)

### Phase 3 — Advanced

- [ ] Node.js sidecar migration (if performance requires)
- [ ] `$fromAI()` integration with AI agent system
- [ ] Expression cache (per-execution)
- [ ] Expression profiling (time per field in execution log)
- [ ] Custom user-defined helper functions (workspace-level)

---

## Related Files

- `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` — design spec (what, not how)
- `45-FLOWHOLT-DATA-STORE-AND-CUSTOM-FUNCTION-SPEC.md` — Code node JS/Python evaluation
- `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` — expression editor UX
- `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` — which fields are expressible
- `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` — DataError from expression failures
- [[wiki/concepts/expression-language]] — vault synthesis
