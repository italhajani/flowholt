"""
FlowHolt Expression Engine
==========================
Evaluates {{ }} expression templates against the FlowItem data model.

Data model:
    FlowItem = {"json": dict, "binary": dict | None}
    FlowItems = list[FlowItem]

Context variables available in expressions:
    $json        - current item's json (= $input.first().json)
    $input       - all input items (FlowItems list with .first()/.last()/.all())
    $now         - current UTC datetime (ISO string helper)
    $today       - today's date (ISO date string)
    $vars        - workspace variables dict
    $workflow    - workflow metadata dict
    $execution   - execution metadata dict
    $itemIndex   - index of current item in loop
    $runIndex    - current loop run index

Syntax: {{ expression }}
- Dot navigation:    {{ $json.user.email }}
- Array index:       {{ $json.items[0].name }}
- Arithmetic:        {{ $json.price * 1.2 }}
- Ternary:           {{ $json.count > 0 ? "yes" : "no" }}
- String concat:     {{ $json.first + " " + $json.last }}

For complex JS that Python can't evaluate, falls back gracefully.
"""
from __future__ import annotations

import json
import re
import operator as _op
from datetime import datetime, timezone, date
from typing import Any

EXPRESSION_PATTERN = re.compile(r"\{\{\s*(.+?)\s*\}\}")


# ── FlowItem helpers ──────────────────────────────────────────────────────────

def make_flow_item(json_data: dict[str, Any], binary: dict[str, Any] | None = None) -> dict[str, Any]:
    """Create a FlowItem from a plain dict."""
    item: dict[str, Any] = {"json": json_data}
    if binary:
        item["binary"] = binary
    return item


def ensure_flow_items(data: Any) -> list[dict[str, Any]]:
    """Normalize any data format into FlowItems list."""
    if isinstance(data, list):
        normalized = []
        for item in data:
            if isinstance(item, dict) and "json" in item:
                normalized.append(item)
            elif isinstance(item, dict):
                normalized.append(make_flow_item(item))
            else:
                normalized.append(make_flow_item({"value": item}))
        return normalized
    if isinstance(data, dict):
        if "json" in data:
            return [data]
        return [make_flow_item(data)]
    return [make_flow_item({"value": data})]


# ── $input helper object ─────────────────────────────────────────────────────

class _InputAccessor:
    """Provides $input.first(), $input.last(), $input.all(), $input.item semantics."""

    def __init__(self, items: list[dict[str, Any]]) -> None:
        self._items = items

    def all(self) -> list[dict[str, Any]]:  # noqa: A003
        return self._items

    def first(self) -> dict[str, Any]:
        return self._items[0] if self._items else {"json": {}}

    def last(self) -> dict[str, Any]:
        return self._items[-1] if self._items else {"json": {}}

    @property
    def item(self) -> dict[str, Any]:
        return self.first()

    def __len__(self) -> int:
        return len(self._items)

    def __getitem__(self, index: int) -> dict[str, Any]:
        return self._items[index]


# ── DateTime helpers ──────────────────────────────────────────────────────────

class _DateTimeHelper:
    """Provides $now context variable with Luxon-inspired methods."""

    def __init__(self, dt: datetime | None = None) -> None:
        self._dt = dt or datetime.now(timezone.utc)

    def toISO(self) -> str:  # noqa: N802
        return self._dt.isoformat()

    def toISODate(self) -> str:  # noqa: N802
        return self._dt.date().isoformat()

    def toFormat(self, fmt: str) -> str:  # noqa: N802
        # Map Luxon format tokens to Python strftime tokens
        _token_map = [
            ("yyyy", "%Y"), ("yy", "%y"),
            ("MMMM", "%B"), ("MMM", "%b"), ("MM", "%m"), ("M", "%-m"),
            ("dd", "%d"), ("d", "%-d"),
            ("HH", "%H"), ("H", "%-H"),
            ("hh", "%I"), ("h", "%-I"),
            ("mm", "%M"), ("ss", "%S"),
            ("a", "%p"),
        ]
        py_fmt = fmt
        for luxon_tok, py_tok in _token_map:
            py_fmt = py_fmt.replace(luxon_tok, py_tok)
        return self._dt.strftime(py_fmt)

    def toMillis(self) -> int:  # noqa: N802
        return int(self._dt.timestamp() * 1000)

    def toUnixInteger(self) -> int:  # noqa: N802
        return int(self._dt.timestamp())

    def plus(self, **kwargs: int) -> "_DateTimeHelper":
        from datetime import timedelta
        days = kwargs.get("days", 0)
        hours = kwargs.get("hours", 0)
        minutes = kwargs.get("minutes", 0)
        seconds = kwargs.get("seconds", 0)
        weeks = kwargs.get("weeks", 0)
        return _DateTimeHelper(self._dt + timedelta(days=days + weeks * 7, hours=hours, minutes=minutes, seconds=seconds))

    def minus(self, **kwargs: int) -> "_DateTimeHelper":
        neg = {k: -v for k, v in kwargs.items()}
        return self.plus(**neg)

    def startOf(self, unit: str) -> "_DateTimeHelper":  # noqa: N802
        dt = self._dt
        if unit == "day":
            dt = dt.replace(hour=0, minute=0, second=0, microsecond=0)
        elif unit == "month":
            dt = dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif unit == "year":
            dt = dt.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        elif unit == "hour":
            dt = dt.replace(minute=0, second=0, microsecond=0)
        return _DateTimeHelper(dt)

    def endOf(self, unit: str) -> "_DateTimeHelper":  # noqa: N802
        import calendar
        dt = self._dt
        if unit == "day":
            dt = dt.replace(hour=23, minute=59, second=59, microsecond=999999)
        elif unit == "month":
            last_day = calendar.monthrange(dt.year, dt.month)[1]
            dt = dt.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)
        elif unit == "year":
            dt = dt.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
        return _DateTimeHelper(dt)

    def setZone(self, tz_name: str) -> "_DateTimeHelper":  # noqa: N802
        try:
            from zoneinfo import ZoneInfo
            return _DateTimeHelper(self._dt.astimezone(ZoneInfo(tz_name)))
        except Exception:
            return self

    @property
    def zoneName(self) -> str:  # noqa: N802
        return str(self._dt.tzname() or "UTC")

    def __str__(self) -> str:
        return self.toISO()

    def __repr__(self) -> str:
        return f"DateTime({self.toISO()})"

    def __lt__(self, other: "_DateTimeHelper") -> bool:
        return self._dt < other._dt

    def __le__(self, other: "_DateTimeHelper") -> bool:
        return self._dt <= other._dt

    def __gt__(self, other: "_DateTimeHelper") -> bool:
        return self._dt > other._dt

    def __ge__(self, other: "_DateTimeHelper") -> bool:
        return self._dt >= other._dt


# ── Context builder ───────────────────────────────────────────────────────────

def build_expression_context(
    items: list[dict[str, Any]],
    *,
    item_index: int = 0,
    workspace_vars: dict[str, Any] | None = None,
    workflow_meta: dict[str, Any] | None = None,
    execution_meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build the full expression context for evaluating {{ }} expressions.

    Returns a dict with all $ context variables ready for eval().
    """
    flow_items = ensure_flow_items(items) if items else [make_flow_item({})]
    current_item = flow_items[item_index] if 0 <= item_index < len(flow_items) else flow_items[0]

    now = _DateTimeHelper()

    ctx: dict[str, Any] = {
        # Core context variables — dicts wrapped for dot-access in expressions
        "$json": _wrap(current_item.get("json", {})),
        "$binary": _wrap(current_item.get("binary", {})),
        "$input": _InputAccessor(flow_items),
        "$now": now,
        "$today": _DateTimeHelper(datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)),
        "$vars": _wrap(workspace_vars or {}),
        "$itemIndex": item_index,
        "$runIndex": item_index,

        # Workflow / execution meta
        "$workflow": _wrap(workflow_meta or {}),
        "$execution": _wrap(execution_meta or {}),

        # Legacy / convenience aliases
        "json": _wrap(current_item.get("json", {})),
        "payload": current_item.get("json", {}),

        # Built-in helpers
        "DateTime": _DateTimeHelper,
        "JSON": _JSONHelper(),
        "Math": _MathHelper(),
    }

    return ctx


class _AttrDict:
    """Dict wrapper that allows both d['key'] and d.key access, like JS objects."""

    def __init__(self, data: Any) -> None:
        object.__setattr__(self, "_data", data if isinstance(data, dict) else {})

    def __getattr__(self, key: str) -> Any:
        data = object.__getattribute__(self, "_data")
        val = data.get(key)
        return _wrap(val)

    def __getitem__(self, key: Any) -> Any:
        data = object.__getattribute__(self, "_data")
        val = data[key]
        return _wrap(val)

    def get(self, key: str, default: Any = None) -> Any:
        data = object.__getattribute__(self, "_data")
        return _wrap(data.get(key, default))

    def keys(self) -> Any:
        return object.__getattribute__(self, "_data").keys()

    def values(self) -> Any:
        return object.__getattribute__(self, "_data").values()

    def items(self) -> Any:
        return object.__getattribute__(self, "_data").items()

    def __contains__(self, key: Any) -> bool:
        return key in object.__getattribute__(self, "_data")

    def __iter__(self) -> Any:
        return iter(object.__getattribute__(self, "_data"))

    def __len__(self) -> int:
        return len(object.__getattribute__(self, "_data"))

    def __repr__(self) -> str:
        return repr(object.__getattribute__(self, "_data"))

    def __eq__(self, other: Any) -> bool:
        data = object.__getattribute__(self, "_data")
        if isinstance(other, _AttrDict):
            return data == object.__getattribute__(other, "_data")
        return data == other

    def _raw(self) -> dict:
        return object.__getattribute__(self, "_data")


class _AttrList:
    """List wrapper that wraps nested dicts as _AttrDict for dot access."""

    def __init__(self, data: list) -> None:
        self._data = data

    def __getitem__(self, index: int) -> Any:
        return _wrap(self._data[index])

    def __len__(self) -> int:
        return len(self._data)

    def __iter__(self) -> Any:
        return (_wrap(item) for item in self._data)

    def __contains__(self, item: Any) -> bool:
        return item in self._data

    def __repr__(self) -> str:
        return repr(self._data)

    def includes(self, value: Any) -> bool:
        return value in self._data

    def join(self, sep: str = ",") -> str:
        return sep.join(str(x) for x in self._data)

    @property
    def length(self) -> int:
        return len(self._data)


def _wrap(value: Any) -> Any:
    """Wrap dicts and lists in attribute-access proxies; leave other values as-is."""
    if isinstance(value, dict):
        return _AttrDict(value)
    if isinstance(value, list):
        return _AttrList(value)
    return value


class _JSONHelper:
    """Provides JSON.stringify() and JSON.parse() in expression context."""

    def stringify(self, value: Any, *args: Any) -> str:
        return json.dumps(value)

    def parse(self, text: str) -> Any:
        return json.loads(text)


class _MathHelper:
    """Provides Math.* functions in expression context."""
    abs = staticmethod(abs)
    max = staticmethod(max)
    min = staticmethod(min)
    pow = staticmethod(pow)
    sqrt = staticmethod(lambda x: x ** 0.5)
    floor = staticmethod(lambda x: int(x) if x >= 0 else int(x) - 1)
    ceil = staticmethod(lambda x: int(x) + (1 if x != int(x) else 0))
    round = staticmethod(round)
    random = staticmethod(__import__("random").random)
    pi = 3.141592653589793
    e = 2.718281828459045


# ── Expression evaluator ──────────────────────────────────────────────────────

_SAFE_BUILTINS: dict[str, Any] = {
    "__builtins__": {},
    "len": len,
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "list": list,
    "dict": dict,
    "tuple": tuple,
    "set": set,
    "abs": abs,
    "round": round,
    "min": min,
    "max": max,
    "sum": sum,
    "sorted": sorted,
    "reversed": reversed,
    "enumerate": enumerate,
    "zip": zip,
    "isinstance": isinstance,
    "range": range,
    "None": None,
    "True": True,
    "False": False,
}


def _preprocess_expression(expr: str) -> str:
    """Transform JS-style expressions into Python-compatible ones."""
    # Map $ context variables to Python-safe identifiers FIRST
    # Replace $json, $input, etc. before any other transforms
    _dollar_map = [
        ("$json", "_json"),
        ("$input", "_input"),
        ("$now", "_now"),
        ("$today", "_today"),
        ("$vars", "_vars"),
        ("$workflow", "_workflow"),
        ("$execution", "_execution"),
        ("$itemIndex", "_itemIndex"),
        ("$runIndex", "_runIndex"),
        ("$binary", "_binary"),
        ("$fromAI", "_fromAI"),
        ("$jmespath", "_jmespath"),
    ]
    for dollar_var, py_var in _dollar_map:
        expr = expr.replace(dollar_var, py_var)

    # Ternary: a ? b : c → b if a else c
    ternary = re.match(r"^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$", expr, re.DOTALL)
    if ternary:
        cond, true_val, false_val = ternary.groups()
        expr = f"({true_val.strip()}) if ({cond.strip()}) else ({false_val.strip()})"

    # null → None, undefined → None, true → True, false → False
    expr = re.sub(r"\bnull\b", "None", expr)
    expr = re.sub(r"\bundefined\b", "None", expr)
    expr = re.sub(r"\btrue\b", "True", expr)
    expr = re.sub(r"\bfalse\b", "False", expr)

    # typeof x === "string" → isinstance(x, str)
    expr = re.sub(r'typeof\s+(\w+)\s*===\s*"string"', r'isinstance(\1, str)', expr)
    expr = re.sub(r'typeof\s+(\w+)\s*===\s*"number"', r'isinstance(\1, (int, float))', expr)
    expr = re.sub(r'typeof\s+(\w+)\s*===\s*"boolean"', r'isinstance(\1, bool)', expr)

    # === → ==, !== → !=
    expr = expr.replace("===", "==").replace("!==", "!=")

    # &&  → and, || → or
    expr = re.sub(r"\s*&&\s*", " and ", expr)
    expr = re.sub(r"\s*\|\|\s*", " or ", expr)

    return expr


def evaluate_expression(expr: str, context: dict[str, Any]) -> Any:
    """Evaluate a single expression string (without {{ }}) against context."""
    expr = _preprocess_expression(expr.strip())
    if not expr:
        return ""

    # Build eval locals: both original $-keys and _ aliases for preprocessed expressions
    local_vars: dict[str, Any] = {**_SAFE_BUILTINS}
    for k, v in context.items():
        local_vars[k] = v
        # Add _-prefixed alias for every $-variable
        if k.startswith("$"):
            local_vars["_" + k[1:]] = v

    try:
        return eval(expr, {"__builtins__": {}}, local_vars)  # noqa: S307
    except Exception:
        # Attempt dot-navigation fallback for simple $json.path.to.field expressions
        return _navigate_path(expr, context)


def _navigate_path(expr: str, context: dict[str, Any]) -> Any:
    """Fallback: simple dot-notation path navigation for $json.a.b.c patterns."""
    expr = expr.strip()
    if not expr.startswith("$"):
        return ""

    # Remove leading $
    path_str = expr[1:]

    # Map known root aliases
    if path_str == "json" or path_str.startswith("json.") or path_str.startswith("json["):
        root_key = "$json"
        sub = path_str[4:].lstrip(".")
    elif path_str == "input" or path_str.startswith("input."):
        root_key = "$input"
        sub = path_str[6:].lstrip(".")
    elif path_str == "now" or path_str.startswith("now."):
        root_key = "$now"
        sub = path_str[3:].lstrip(".")
    elif path_str == "vars" or path_str.startswith("vars."):
        root_key = "$vars"
        sub = path_str[4:].lstrip(".")
    else:
        return ""

    current: Any = context.get(root_key, "")
    if not sub:
        return current

    # Walk path tokens
    tokens = _tokenize_path(sub)
    for token in tokens:
        if current is None:
            return ""
        if isinstance(current, dict):
            current = current.get(token)
        elif isinstance(current, list) and isinstance(token, int):
            current = current[token] if 0 <= token < len(current) else None
        elif hasattr(current, token):
            val = getattr(current, token)
            current = val() if callable(val) and token not in {"json", "binary"} else val
        else:
            return ""
    return current


def _tokenize_path(path: str) -> list[str | int]:
    """Split 'a.b[0].c' into ['a', 'b', 0, 'c']."""
    tokens: list[str | int] = []
    for segment in re.split(r"\.(?![^\[]*\])", path):
        # Handle array access in segment: foo[0]
        bracket_match = re.match(r"^([^\[]+)\[(\d+)\](.*)$", segment)
        if bracket_match:
            key, idx, rest = bracket_match.groups()
            if key:
                tokens.append(key)
            tokens.append(int(idx))
            if rest:
                tokens.extend(_tokenize_path(rest.lstrip(".")))
        else:
            if segment:
                tokens.append(segment)
    return tokens


# ── Template renderer ─────────────────────────────────────────────────────────

def render_template(template: Any, context: dict[str, Any]) -> Any:
    """Render a template string containing {{ }} expressions.

    If the template is not a string, returns it unchanged.
    If it contains a single expression (the whole string), returns the raw value.
    If it contains expressions mixed with text, returns a rendered string.
    """
    if not isinstance(template, str) or "{{" not in template:
        return template

    matches = list(EXPRESSION_PATTERN.finditer(template))
    if not matches:
        return template

    # Single expression that fills the entire template → return raw value (not string)
    if len(matches) == 1 and matches[0].span() == (0, len(template)):
        return evaluate_expression(matches[0].group(1), context)

    # Multiple expressions / mixed text → stringify all and interpolate
    result = EXPRESSION_PATTERN.sub(
        lambda m: _stringify_value(evaluate_expression(m.group(1), context)),
        template,
    )
    return result


def render_node_config(config: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    """Recursively render all string fields in a node config dict."""
    if not isinstance(config, dict):
        return config
    return {k: _render_value(v, context) for k, v in config.items()}


def _render_value(value: Any, context: dict[str, Any]) -> Any:
    if isinstance(value, str):
        return render_template(value, context)
    if isinstance(value, dict):
        return {k: _render_value(v, context) for k, v in value.items()}
    if isinstance(value, list):
        return [_render_value(item, context) for item in value]
    return value


def _stringify_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (dict, list)):
        return json.dumps(value)
    return str(value)


# ── Backwards-compatible shims for executor.py ────────────────────────────────

def build_expression_scope(payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    """Backwards-compatible wrapper used by executor._build_expression_scope."""
    scope = {**context, **payload}
    scope["payload"] = payload
    scope["json"] = payload
    scope["$json"] = _wrap(payload)
    scope.setdefault("steps", dict(context.get("steps") or {}))
    now = _DateTimeHelper()
    scope["$now"] = now
    scope["$today"] = _DateTimeHelper(datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    ))
    scope["Math"] = _MathHelper()
    scope["JSON"] = _JSONHelper()
    return scope
