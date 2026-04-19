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

# Save builtins before they get shadowed by class methods
builtins_round = round
builtins_abs = abs
builtins_sum = sum
builtins_min = min
builtins_max = max


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
        "Object": _ObjectHelper(),

        # Root-level helper functions (spec 53 §4.7)
        "$if": lambda cond, then, else_val=None: then if cond else else_val,
        "$ifEmpty": lambda val, fallback: fallback if val is None or val == "" or val == [] or val == {} else val,
        "$min": lambda *vals: builtins_min(vals),
        "$max": lambda *vals: builtins_max(vals),
        "$sum": lambda *vals: builtins_sum(vals),
        "$average": lambda *vals: builtins_sum(vals) / len(vals) if vals else 0,
        "$randomInt": lambda lo, hi: __import__("random").randint(lo, hi),
        "$parseDate": lambda s, fmt=None: _DateTimeHelper(datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)) if fmt else _DateTimeHelper(datetime.fromisoformat(s.replace("Z", "+00:00"))),
        "$lookup": lambda arr, key, val: next((item for item in (arr._data if isinstance(arr, _AttrList) else arr) if (item.get(key) if isinstance(item, dict) else getattr(item, key, None)) == val), None),
        "$not": lambda val: not val,
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

    # FlowHolt object extension methods (spec 53 §4.5)
    def hasField(self, key: str) -> bool:  # noqa: N802
        return key in object.__getattribute__(self, "_data")

    def isEmpty(self) -> bool:  # noqa: N802
        return len(object.__getattribute__(self, "_data")) == 0

    def isNotEmpty(self) -> bool:  # noqa: N802
        return len(object.__getattribute__(self, "_data")) > 0

    def removeField(self, key: str) -> "_AttrDict":  # noqa: N802
        data = dict(object.__getattribute__(self, "_data"))
        data.pop(key, None)
        return _AttrDict(data)

    def removeFieldsContaining(self, substr: str) -> "_AttrDict":  # noqa: N802
        data = object.__getattribute__(self, "_data")
        return _AttrDict({k: v for k, v in data.items() if substr not in k})


class _AttrList:
    """List wrapper that wraps nested dicts as _AttrDict for dot access, with FlowHolt extensions."""

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

    # Native JS array methods
    def includes(self, value: Any) -> bool:
        return value in self._data

    def join(self, sep: str = ",") -> str:
        return sep.join(str(x) for x in self._data)

    def indexOf(self, value: Any, from_index: int = 0) -> int:  # noqa: N802
        try:
            return self._data.index(value, from_index)
        except ValueError:
            return -1

    def lastIndexOf(self, value: Any) -> int:  # noqa: N802
        for i in range(len(self._data) - 1, -1, -1):
            if self._data[i] == value:
                return i
        return -1

    def concat(self, *arrays: list) -> "_AttrList":
        result = list(self._data)
        for arr in arrays:
            result.extend(arr._data if isinstance(arr, _AttrList) else arr)
        return _AttrList(result)

    def slice(self, start: int = 0, end: int | None = None) -> "_AttrList":
        return _AttrList(self._data[start:end])

    def reverse(self) -> "_AttrList":
        return _AttrList(list(reversed(self._data)))

    def flat(self, depth: int = 1) -> "_AttrList":
        def _flatten(lst: list, d: int) -> list:
            result = []
            for item in lst:
                if isinstance(item, list | _AttrList) and d > 0:
                    data = item._data if isinstance(item, _AttrList) else item
                    result.extend(_flatten(data, d - 1))
                else:
                    result.append(item)
            return result
        return _AttrList(_flatten(self._data, depth))

    # FlowHolt extension methods
    def first(self) -> Any:
        if not self._data:
            raise IndexError("Cannot get first element of empty array")
        return _wrap(self._data[0])

    def last(self) -> Any:
        if not self._data:
            raise IndexError("Cannot get last element of empty array")
        return _wrap(self._data[-1])

    def isEmpty(self) -> bool:  # noqa: N802
        return len(self._data) == 0

    def isNotEmpty(self) -> bool:  # noqa: N802
        return len(self._data) > 0

    def unique(self) -> "_AttrList":
        seen: list = []
        for item in self._data:
            if item not in seen:
                seen.append(item)
        return _AttrList(seen)

    def sum(self) -> int | float:
        return builtins_sum(x for x in self._data if isinstance(x, int | float))

    def average(self) -> float:
        nums = [x for x in self._data if isinstance(x, int | float)]
        return builtins_sum(nums) / len(nums) if nums else 0.0

    def min(self) -> int | float:
        nums = [x for x in self._data if isinstance(x, int | float)]
        return builtins_min(nums) if nums else 0

    def max(self) -> int | float:
        nums = [x for x in self._data if isinstance(x, int | float)]
        return builtins_max(nums) if nums else 0

    def compact(self) -> "_AttrList":
        return _AttrList([x for x in self._data if x is not None and x != ""])

    def chunk(self, size: int) -> "_AttrList":
        return _AttrList([self._data[i:i + size] for i in range(0, len(self._data), size)])

    def toJsonString(self) -> str:  # noqa: N802
        return json.dumps(self._data)

    def pluck(self, key: str) -> "_AttrList":
        return _AttrList([item.get(key) if isinstance(item, dict) else getattr(item, key, None) for item in self._data])

    def smartJoin(self, sep: str = ", ", last_sep: str | None = None) -> str:  # noqa: N802
        items = [str(x) for x in self._data]
        if len(items) <= 1:
            return items[0] if items else ""
        if last_sep is None:
            return sep.join(items)
        return sep.join(items[:-1]) + last_sep + items[-1]

    @property
    def length(self) -> int:
        return len(self._data)


# ── FlowHolt String extensions ───────────────────────────────────────────────

class _FlowStr(str):
    """String subclass with FlowHolt extension methods (spec 53 §4.1)."""

    @property
    def length(self) -> int:
        return len(self)

    def toNumber(self) -> int | float:  # noqa: N802
        s = self.strip()
        try:
            return int(s) if "." not in s else float(s)
        except ValueError:
            raise ValueError(f"Cannot convert '{self}' to number") from None

    def toBoolean(self) -> bool:  # noqa: N802
        return self.lower().strip() in {"true", "1", "yes"}

    def toDateTime(self, fmt: str | None = None) -> "_DateTimeHelper":  # noqa: N802
        from datetime import datetime as _dt, timezone as _tz
        if fmt:
            return _DateTimeHelper(_dt.strptime(self, fmt).replace(tzinfo=_tz.utc))
        return _DateTimeHelper(_dt.fromisoformat(self.replace("Z", "+00:00")))

    def isEmpty(self) -> bool:  # noqa: N802
        return len(self.strip()) == 0

    def isNotEmpty(self) -> bool:  # noqa: N802
        return len(self.strip()) > 0

    def isEmail(self) -> bool:  # noqa: N802
        return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", self))

    def isUrl(self) -> bool:  # noqa: N802
        return bool(re.match(r"^https?://\S+$", self, re.I))

    def isNumeric(self) -> bool:  # noqa: N802
        try:
            float(self)
            return True
        except ValueError:
            return False

    def hash(self, algo: str = "sha256") -> str:
        import hashlib
        h = hashlib.new(algo)
        h.update(self.encode())
        return h.hexdigest()

    def urlEncode(self) -> str:  # noqa: N802
        from urllib.parse import quote
        return quote(self, safe="")

    def urlDecode(self) -> str:  # noqa: N802
        from urllib.parse import unquote
        return unquote(self)

    def base64Encode(self) -> str:  # noqa: N802
        import base64
        return base64.b64encode(self.encode()).decode()

    def base64Decode(self) -> str:  # noqa: N802
        import base64
        return base64.b64decode(self.encode()).decode()

    def removeTags(self) -> str:  # noqa: N802
        return re.sub(r"<[^>]+>", "", self)

    def removeMarkdown(self) -> str:  # noqa: N802
        text = re.sub(r"\*\*(.+?)\*\*", r"\1", self)
        text = re.sub(r"\*(.+?)\*", r"\1", text)
        text = re.sub(r"__(.+?)__", r"\1", text)
        text = re.sub(r"_(.+?)_", r"\1", text)
        text = re.sub(r"~~(.+?)~~", r"\1", text)
        text = re.sub(r"`(.+?)`", r"\1", text)
        text = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)
        text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.M)
        text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text)
        return text

    def escapeHtml(self) -> str:  # noqa: N802
        import html
        return html.escape(self)

    def extractEmail(self) -> str:  # noqa: N802
        m = re.search(r"[^@\s]+@[^@\s]+\.[^@\s]+", self)
        return m.group(0) if m else ""

    def extractUrl(self) -> str:  # noqa: N802
        m = re.search(r"https?://\S+", self)
        return m.group(0) if m else ""

    def quote(self) -> str:
        return f'"{self}"'


# ── FlowHolt Number extensions ──────────────────────────────────────────────

class _FlowNum:
    """Number wrapper with FlowHolt extension methods (spec 53 §4.3)."""

    def __init__(self, value: int | float) -> None:
        self._value = value

    # Arithmetic operators — return raw numbers to avoid wrapping chains
    def __add__(self, other: Any) -> int | float:
        return self._value + (other._value if isinstance(other, _FlowNum) else other)
    def __radd__(self, other: Any) -> int | float:
        return (other._value if isinstance(other, _FlowNum) else other) + self._value
    def __sub__(self, other: Any) -> int | float:
        return self._value - (other._value if isinstance(other, _FlowNum) else other)
    def __rsub__(self, other: Any) -> int | float:
        return (other._value if isinstance(other, _FlowNum) else other) - self._value
    def __mul__(self, other: Any) -> int | float:
        return self._value * (other._value if isinstance(other, _FlowNum) else other)
    def __rmul__(self, other: Any) -> int | float:
        return (other._value if isinstance(other, _FlowNum) else other) * self._value
    def __truediv__(self, other: Any) -> float:
        return self._value / (other._value if isinstance(other, _FlowNum) else other)
    def __rtruediv__(self, other: Any) -> float:
        return (other._value if isinstance(other, _FlowNum) else other) / self._value
    def __floordiv__(self, other: Any) -> int:
        return self._value // (other._value if isinstance(other, _FlowNum) else other)
    def __mod__(self, other: Any) -> int | float:
        return self._value % (other._value if isinstance(other, _FlowNum) else other)
    def __pow__(self, other: Any) -> int | float:
        return self._value ** (other._value if isinstance(other, _FlowNum) else other)
    def __neg__(self) -> int | float:
        return -self._value
    def __pos__(self) -> int | float:
        return +self._value

    # Comparison
    def __eq__(self, other: Any) -> bool:
        return self._value == (other._value if isinstance(other, _FlowNum) else other)
    def __ne__(self, other: Any) -> bool:
        return self._value != (other._value if isinstance(other, _FlowNum) else other)
    def __lt__(self, other: Any) -> bool:
        return self._value < (other._value if isinstance(other, _FlowNum) else other)
    def __le__(self, other: Any) -> bool:
        return self._value <= (other._value if isinstance(other, _FlowNum) else other)
    def __gt__(self, other: Any) -> bool:
        return self._value > (other._value if isinstance(other, _FlowNum) else other)
    def __ge__(self, other: Any) -> bool:
        return self._value >= (other._value if isinstance(other, _FlowNum) else other)

    # Conversion
    def __int__(self) -> int:
        return int(self._value)
    def __float__(self) -> float:
        return float(self._value)
    def __bool__(self) -> bool:
        return bool(self._value)
    def __repr__(self) -> str:
        return repr(self._value)
    def __str__(self) -> str:
        return str(self._value)
    def __hash__(self) -> int:
        return hash(self._value)
    def __index__(self) -> int:
        return int(self._value)

    # FlowHolt extension methods
    def floor(self) -> int:
        import math
        return math.floor(self._value)

    def ceil(self) -> int:
        import math
        return math.ceil(self._value)

    def round(self, decimals: int = 0) -> int | float:
        return builtins_round(float(self._value), decimals) if decimals else builtins_round(float(self._value))

    def abs(self) -> int | float:
        return builtins_abs(self._value)

    def isEven(self) -> bool:  # noqa: N802
        return int(self._value) % 2 == 0

    def isOdd(self) -> bool:  # noqa: N802
        return int(self._value) % 2 != 0

    def toBoolean(self) -> bool:  # noqa: N802
        return self._value != 0

    def toDateTime(self) -> "_DateTimeHelper":  # noqa: N802
        from datetime import datetime as _dt, timezone as _tz
        return _DateTimeHelper(_dt.fromtimestamp(float(self._value), tz=_tz.utc))

    def toCurrency(self, locale: str = "en-US", currency: str = "USD") -> str:  # noqa: N802
        return f"${float(self._value):,.2f}"

    def format(self, locale: str | None = None) -> str:
        return f"{float(self._value):,.2f}" if isinstance(self._value, float) else f"{int(self._value):,}"

    def isEmpty(self) -> bool:  # noqa: N802
        return False

    def toFixed(self, digits: int = 0) -> str:  # noqa: N802
        return f"{float(self._value):.{digits}f}"

    @property
    def length(self) -> None:
        return None


# ── FlowHolt Boolean extensions ─────────────────────────────────────────────

class _FlowBool:
    """Boolean wrapper with FlowHolt extension methods (spec 53 §4.4)."""

    def __init__(self, value: bool) -> None:
        self._value = bool(value)

    def toNumber(self) -> int:  # noqa: N802
        return 1 if self._value else 0

    def toString(self) -> str:  # noqa: N802
        return "true" if self._value else "false"

    def isEmpty(self) -> bool:  # noqa: N802
        return False

    def __bool__(self) -> bool:
        return self._value

    def __eq__(self, other: Any) -> bool:
        if isinstance(other, _FlowBool):
            return self._value == other._value
        return self._value == other

    def __repr__(self) -> str:
        return "true" if self._value else "false"

    def __str__(self) -> str:
        return "true" if self._value else "false"

    def __hash__(self) -> int:
        return hash(self._value)


def _wrap(value: Any) -> Any:
    """Wrap dicts, lists, strings, and numbers in proxies with extension methods."""
    if isinstance(value, _AttrDict | _AttrList | _FlowStr | _FlowNum | _FlowBool):
        return value  # already wrapped
    if isinstance(value, dict):
        return _AttrDict(value)
    if isinstance(value, list):
        return _AttrList(value)
    if isinstance(value, bool):
        return _FlowBool(value)
    if isinstance(value, str):
        return _FlowStr(value)
    if isinstance(value, int | float):
        return _FlowNum(value)
    return value


class _JSONHelper:
    """Provides JSON.stringify() and JSON.parse() in expression context."""

    def stringify(self, value: Any, *args: Any) -> str:
        return json.dumps(value)

    def parse(self, text: str) -> Any:
        return json.loads(text)


class _MathHelper:
    """Provides Math.* functions in expression context."""
    abs = staticmethod(builtins_abs)
    max = staticmethod(builtins_max)
    min = staticmethod(builtins_min)
    pow = staticmethod(pow)
    sqrt = staticmethod(lambda x: x ** 0.5)
    floor = staticmethod(lambda x: int(x) if x >= 0 else int(x) - 1)
    ceil = staticmethod(lambda x: int(x) + (1 if x != int(x) else 0))
    round = staticmethod(builtins_round)
    random = staticmethod(__import__("random").random)
    pi = 3.141592653589793
    e = 2.718281828459045


class _ObjectHelper:
    """Provides Object.keys/values/entries/assign/fromEntries in expression context."""

    @staticmethod
    def keys(obj: Any) -> list:
        if isinstance(obj, _AttrDict):
            return list(object.__getattribute__(obj, "_data").keys())
        return list(obj.keys()) if isinstance(obj, dict) else []

    @staticmethod
    def values(obj: Any) -> list:
        if isinstance(obj, _AttrDict):
            return list(object.__getattribute__(obj, "_data").values())
        return list(obj.values()) if isinstance(obj, dict) else []

    @staticmethod
    def entries(obj: Any) -> list:
        if isinstance(obj, _AttrDict):
            return list(object.__getattribute__(obj, "_data").items())
        return list(obj.items()) if isinstance(obj, dict) else []

    @staticmethod
    def assign(target: dict, *sources: dict) -> dict:
        result = dict(target)
        for src in sources:
            if isinstance(src, _AttrDict):
                result.update(object.__getattribute__(src, "_data"))
            elif isinstance(src, dict):
                result.update(src)
        return result

    @staticmethod
    def fromEntries(entries: list) -> dict:  # noqa: N802
        return dict(entries)


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
        ("$if", "_if"),
        ("$ifEmpty", "_ifEmpty"),
        ("$min", "_min"),
        ("$max", "_max"),
        ("$sum", "_sum"),
        ("$average", "_average"),
        ("$randomInt", "_randomInt"),
        ("$parseDate", "_parseDate"),
        ("$lookup", "_lookup"),
        ("$not", "_not"),
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
    from .errors import (
        ExpressionReferenceError,
        ExpressionSecurityError,
        ExpressionSyntaxError,
    )

    raw_expr = expr.strip()
    if not raw_expr:
        return ""

    # Security lint: block dangerous patterns before eval
    _FORBIDDEN = ("__proto__", "__import__", "constructor", "prototype", "process.",
                  "require(", "eval(", "exec(", "compile(", "globals(", "locals(",
                  "getattr(", "setattr(", "delattr(", "open(", "import ")
    expr_lower = raw_expr.lower()
    for forbidden in _FORBIDDEN:
        if forbidden in expr_lower:
            raise ExpressionSecurityError(
                f"Expression contains forbidden construct: '{forbidden}'",
                expression=raw_expr,
            )

    expr = _preprocess_expression(raw_expr)
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
    except SyntaxError as e:
        raise ExpressionSyntaxError(
            f"Expression syntax error: {e}",
            expression=raw_expr,
        ) from e
    except NameError as e:
        raise ExpressionReferenceError(
            str(e),
            expression=raw_expr,
        ) from e
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
