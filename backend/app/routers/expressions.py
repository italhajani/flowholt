"""Expression testing endpoints."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..expression_engine import (
    build_expression_context,
    evaluate_expression,
    render_template,
    make_flow_item,
)

router = APIRouter(prefix="/api/expressions", tags=["expressions"])


class ExpressionTestRequest(BaseModel):
    expression: str
    context_data: dict[str, Any] | None = None
    mode: str = "template"  # "template" ({{ }}) or "raw"


class ExpressionTestResponse(BaseModel):
    success: bool
    result: Any = None
    result_type: str | None = None
    error: str | None = None


@router.post("/test", response_model=ExpressionTestResponse)
def test_expression(payload: ExpressionTestRequest):
    """Evaluate an expression against sample data and return the result."""
    sample = payload.context_data or {"name": "John", "age": 30, "items": [1, 2, 3]}
    items = [make_flow_item(sample)]
    ctx = build_expression_context(items)

    try:
        if payload.mode == "template":
            result = render_template(payload.expression, ctx)
        else:
            result = evaluate_expression(payload.expression, ctx)

        return ExpressionTestResponse(
            success=True,
            result=result,
            result_type=type(result).__name__,
        )
    except Exception as e:
        return ExpressionTestResponse(
            success=False,
            error=str(e),
        )


@router.get("/variables")
def list_expression_variables():
    """Return available expression context variables for autocomplete."""
    return {
        "variables": [
            {"name": "$json", "type": "object", "description": "Current item's JSON data"},
            {"name": "$input", "type": "FlowItems", "description": "All input items", "methods": ["first()", "last()", "all()", "item(n)"]},
            {"name": "$now", "type": "DateTime", "description": "Current UTC datetime", "methods": ["toISO()", "toFormat(fmt)", "plus({days:1})", "minus({hours:2})", "startOf(unit)", "endOf(unit)"]},
            {"name": "$today", "type": "DateTime", "description": "Today's date at midnight UTC"},
            {"name": "$vars", "type": "object", "description": "Workspace variables"},
            {"name": "$workflow", "type": "object", "description": "Workflow metadata (id, name)"},
            {"name": "$execution", "type": "object", "description": "Execution metadata (id, mode)"},
            {"name": "$itemIndex", "type": "number", "description": "Current item index"},
            {"name": "$runIndex", "type": "number", "description": "Current run index"},
        ],
        "functions": [
            {"name": "$if(cond, then, else)", "description": "Conditional expression"},
            {"name": "$ifEmpty(val, fallback)", "description": "Return fallback if value is empty"},
            {"name": "$jmespath(expr, data)", "description": "JMESPath query on data"},
            {"name": "$lookup(arr, key, val)", "description": "Find item in array by key=val"},
            {"name": "$parseDate(str, fmt?)", "description": "Parse date string"},
            {"name": "$min(...vals)", "description": "Minimum value"},
            {"name": "$max(...vals)", "description": "Maximum value"},
            {"name": "$sum(...vals)", "description": "Sum of values"},
            {"name": "$average(...vals)", "description": "Average of values"},
            {"name": "$randomInt(lo, hi)", "description": "Random integer in range"},
            {"name": "$not(val)", "description": "Boolean negation"},
        ],
        "methods": {
            "string": ["isEmpty()", "isEmail()", "isUrl()", "hash(algo)", "base64Encode()", "base64Decode()", "removeTags()", "extractEmail()", "extractUrl()", "toTitleCase()", "replaceSpecialChars()"],
            "array": ["first()", "last()", "unique()", "sum()", "average()", "min()", "max()", "compact()", "pluck(key)", "smartJoin(sep)"],
            "number": ["floor()", "ceil()", "round(dp)", "abs()", "isEven()", "isOdd()", "toCurrency(cur)", "toFixed(dp)"],
            "datetime": ["toISO()", "toFormat(fmt)", "plus(dur)", "minus(dur)", "startOf(unit)", "endOf(unit)", "diff(other, unit)", "setZone(tz)"],
        },
    }
