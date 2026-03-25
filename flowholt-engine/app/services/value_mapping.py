import json
import re
from typing import Any

TEMPLATE_PATTERN = re.compile(r"{{\s*([^{}]+?)\s*}}")


def _resolve_path(data: Any, path: str) -> Any:
    current = data
    for part in path.split("."):
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return ""
    return current


def _stringify(value: Any) -> str:
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    if value is None:
        return ""
    return str(value)


def resolve_templates(value: Any, runtime_context: dict[str, Any]) -> Any:
    if isinstance(value, dict):
        return {key: resolve_templates(item, runtime_context) for key, item in value.items()}

    if isinstance(value, list):
        return [resolve_templates(item, runtime_context) for item in value]

    if not isinstance(value, str):
        return value

    matches = list(TEMPLATE_PATTERN.finditer(value))
    if not matches:
        return value

    if len(matches) == 1 and matches[0].span() == (0, len(value)):
        return _resolve_path(runtime_context, matches[0].group(1).strip())

    result = value
    for match in matches:
        resolved = _resolve_path(runtime_context, match.group(1).strip())
        result = result.replace(match.group(0), _stringify(resolved))

    return result
