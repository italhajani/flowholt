from __future__ import annotations

import json
import re
import time
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx

from .config import get_settings
from .integration_registry import execute_integration_operation, normalize_integration_config
from .llm_router import LLMProvider, get_llm_router


VAULT_TOKEN_PATTERN = re.compile(r"\{\{\s*vault\.(variable|credential|connection)\.([A-Za-z0-9_\- ]+?)(?:\.([A-Za-z0-9_\-]+))?\s*\}\}")
EXPRESSION_PATTERN = re.compile(r"\{\{\s*(.+?)\s*\}\}")


def execute_workflow_definition(
    definition: dict[str, Any],
    payload: dict[str, Any],
    vault_context: dict[str, dict[str, Any]] | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    outcome = run_workflow_definition(definition, payload, vault_context=vault_context)
    if outcome["status"] != "completed":
        raise RuntimeError("Workflow paused before completion.")
    return outcome["step_results"], outcome["result"]


def run_workflow_definition(
    definition: dict[str, Any],
    payload: dict[str, Any],
    *,
    vault_context: dict[str, dict[str, Any]] | None = None,
    state: dict[str, Any] | None = None,
    resume_payload: dict[str, Any] | None = None,
    resume_decision: str | None = None,
    use_pinned_data: bool = False,
    workflow_timeout_seconds: int | None = None,
) -> dict[str, Any]:
    context: dict[str, Any] = dict((state or {}).get("context") or {"payload": payload})
    context.setdefault("payload", payload)
    context.setdefault("steps", {})
    step_results: list[dict[str, Any]] = list((state or {}).get("step_results") or [])
    steps = definition.get("steps", [])
    edges = definition.get("edges", [])
    step_lookup = {step["id"]: step for step in steps}
    outgoing: dict[str, list[dict[str, Any]]] = {}
    incoming: dict[str, list[dict[str, Any]]] = {}

    for edge in edges:
        outgoing.setdefault(edge["source"], []).append(edge)
        incoming.setdefault(edge["target"], []).append(edge)

    if steps and not edges:
        for index in range(len(steps) - 1):
            edge = {"source": steps[index]["id"], "target": steps[index + 1]["id"], "label": None}
            outgoing.setdefault(edge["source"], []).append(edge)
            incoming.setdefault(edge["target"], []).append(edge)

    if state and state.get("next_step_id"):
        current_step = step_lookup.get(str(state["next_step_id"]))
    else:
        current_step = next((step for step in steps if not incoming.get(step["id"])), steps[0] if steps else None)

    visited: set[str] = set((state or {}).get("visited") or [])
    pending_label = str((state or {}).get("pending_label") or "") or None
    if resume_decision:
        pending_label = resume_decision.lower()
        context["human_decision"] = pending_label
    if resume_payload:
        context.setdefault("resume_payload", {}).update(resume_payload)
        context.update(resume_payload)
    workflow_started = time.perf_counter()

    while current_step is not None:
        if workflow_timeout_seconds is not None and (time.perf_counter() - workflow_started) >= workflow_timeout_seconds:
            raise RuntimeError(f"Workflow exceeded configured timeout of {workflow_timeout_seconds} seconds.")
        step = current_step
        if step["id"] in visited:
            break
        visited.add(step["id"])
        started = time.perf_counter()
        output: dict[str, Any] | None = None
        status = "success"
        next_label: str | None = pending_label
        pending_label = None
        pinned_data_used = False

        try:
            step_type = step["type"]
            config = _resolve_runtime_value(step.get("config", {}), vault_context or {})
            config = _enrich_config_with_bindings(step_type, config, vault_context or {})
            config = normalize_integration_config(step_type, config)
            expression_scope = _build_expression_scope(payload, context)

            if config.get("_enabled") is False:
                output = {"skipped": True, "reason": "step_disabled"}
                status = "skipped"

            elif use_pinned_data and "_pinned_data" in config:
                pinned_value = config.get("_pinned_data")
                output = pinned_value if isinstance(pinned_value, dict) else {"value": pinned_value}
                pinned_data_used = True
                if step_type == "condition":
                    branch_value = str(output.get("branch") or "").lower() if isinstance(output, dict) else ""
                    if branch_value in {"true", "false"}:
                        next_label = branch_value
                    else:
                        next_label = "true" if bool(output.get("matched")) else "false"
                if isinstance(output, dict):
                    context.update(output)
                else:
                    context["pinned_value"] = output
            elif step_type == "trigger":
                output = execute_integration_operation(step_type, config, payload=payload, context=context) or {"received": True}
            elif step_type == "transform":
                output = {"message": _render_template(config.get("template", ""), expression_scope)}
                context.update(output)
            elif step_type == "condition":
                field = config.get("field", "")
                expected = config.get("equals")
                actual = payload.get(field) or context.get(field)
                matched = actual == expected
                output = {"matched": matched, "priority": actual}
                next_label = "true" if matched else "false"
                context.update(output)
            elif step_type == "llm":
                prompt = _render_template(str(config.get("prompt", "Summarize the payload")), expression_scope)
                llm_text = _run_llm(prompt=prompt, payload=payload, config=config)
                output = execute_integration_operation(step_type, config, payload=payload, context=context, llm_text=llm_text) or {"text": llm_text}
                priority = "high" if str(output.get("text") or "").lower().find("urgent") != -1 or str(output.get("text") or "").lower().find("high") != -1 else "normal"
                output["priority"] = priority
                context.update(output)
            elif step_type == "output":
                output = execute_integration_operation(step_type, config, payload=payload, context=context) or {
                    "channel": config.get("channel", "default"),
                    "message": context.get("message") or context.get("text") or "Workflow completed",
                }
                if config.get("webhook_url"):
                    output["webhook_url"] = config.get("webhook_url")
            elif step_type == "delay":
                resume_after = _compute_resume_after(config)
                output = {"wait_type": "delay", "resume_after": resume_after}
                status = "paused"
            elif step_type == "human":
                choices = config.get("choices") or ["approved", "rejected"]
                output = {
                    "wait_type": "human",
                    "instructions": config.get("instructions") or config.get("prompt") or "Awaiting human decision.",
                    "choices": choices,
                    "title": config.get("title") or step["name"],
                    "priority": config.get("priority") or "normal",
                    "assignee_user_id": config.get("assignee_user_id"),
                    "assignee_email": config.get("assignee_email"),
                    "assignee_role": config.get("assignee_role"),
                    "due_hours": config.get("due_hours"),
                }
                status = "paused"
            elif step_type == "callback":
                output = execute_integration_operation(step_type, config, payload=payload, context=context) or {
                    "wait_type": "callback",
                    "instructions": config.get("instructions") or "Waiting for external callback payload.",
                    "expected_fields": config.get("expected_fields") or [],
                    "mode": config.get("mode") or "payload",
                }
                if config.get("choices") and "choices" not in output:
                    output["choices"] = config.get("choices")
                status = "paused"

            # ── Loop / Iterator node ────────────────────────────────
            elif step_type == "loop":
                items_expr = config.get("items", "")
                # Resolve items: can be a context key, a JSON array literal, or payload field
                items: list[Any] = []
                if isinstance(items_expr, list):
                    items = items_expr
                elif isinstance(items_expr, str):
                    # Try context/payload lookup first
                    resolved = context.get(items_expr) or payload.get(items_expr)
                    if isinstance(resolved, list):
                        items = resolved
                    elif items_expr.strip().startswith("["):
                        try:
                            items = json.loads(items_expr)
                        except (json.JSONDecodeError, ValueError):
                            items = []

                item_var = config.get("item_variable", "item")
                index_var = config.get("index_variable", "index")
                sub_prompt = config.get("sub_prompt", "")
                sub_template = config.get("sub_template", "")
                max_iterations = int(config.get("max_iterations") or 1000)
                batch_results: list[Any] = []

                for idx, item in enumerate(items[:max_iterations]):
                    iter_context = {item_var: item, index_var: idx}
                    if sub_prompt:
                        # Run LLM for each item
                        iter_payload = _build_expression_scope(payload, {**context, **iter_context})
                        rendered_prompt = _render_template(sub_prompt, iter_payload)
                        llm_result = _run_llm(prompt=rendered_prompt, payload=iter_payload, config=config)
                        iter_context["result"] = llm_result
                    elif sub_template:
                        iter_payload = _build_expression_scope(payload, {**context, **iter_context})
                        iter_context["result"] = _render_template(sub_template, iter_payload)
                    batch_results.append(iter_context)

                output = {
                    "items_count": len(items),
                    "processed": len(batch_results),
                    "results": batch_results,
                }
                context["loop_results"] = batch_results
                context.update(output)

            # ── Code / Script node ──────────────────────────────────
            elif step_type == "code":
                script = config.get("script", "")
                language = config.get("language", "python")
                timeout_sec = min(int(config.get("timeout") or 30), 60)

                if language in ("python", "py"):
                    # Sandboxed Python execution with restricted builtins
                    import math as _math

                    safe_builtins = {
                        "abs": abs, "all": all, "any": any, "bool": bool,
                        "dict": dict, "enumerate": enumerate, "filter": filter,
                        "float": float, "int": int, "isinstance": isinstance,
                        "len": len, "list": list, "map": map, "max": max,
                        "min": min, "print": print, "range": range, "round": round,
                        "set": set, "sorted": sorted, "str": str, "sum": sum,
                        "tuple": tuple, "type": type, "zip": zip,
                        "True": True, "False": False, "None": None,
                    }
                    sandbox_globals: dict[str, Any] = {
                        "__builtins__": safe_builtins,
                        "json": json,
                        "math": _math,
                        "payload": dict(payload),
                        "context": dict(context),
                        "items": context.get("loop_results", []),
                    }
                    sandbox_locals: dict[str, Any] = {}

                    try:
                        exec(compile(script, "<workflow_code>", "exec"), sandbox_globals, sandbox_locals)  # noqa: S102
                        # Collect output: user should set `result` variable
                        code_result = sandbox_locals.get("result", sandbox_locals.get("output", {}))
                        if isinstance(code_result, dict):
                            output = code_result
                        else:
                            output = {"result": code_result}
                    except Exception as code_exc:
                        output = {"error": f"Code execution failed: {code_exc}"}
                        status = "failed"
                elif language in ("javascript", "js"):
                    output = {"error": "JavaScript execution requires Node.js runtime (not available in current deployment)."}
                    status = "failed"
                else:
                    output = {"error": f"Unsupported language: {language}"}
                    status = "failed"

                if status != "failed":
                    context.update(output)

            # ── HTTP Request node ───────────────────────────────────
            elif step_type == "http_request":
                method = str(config.get("method", "GET")).upper()
                url = config.get("url", "")
                headers = config.get("headers") or {}
                body = config.get("body")
                query_params = config.get("query_params") or {}
                timeout_sec = min(int(config.get("timeout") or 30), 120)
                auth_type = config.get("auth_type", "")

                # Render URL template with payload vars
                if "{{" in url or "${" in url:
                    url = _render_template(url, expression_scope)

                # Build auth headers
                if auth_type == "bearer" and config.get("token"):
                    headers.setdefault("Authorization", f"Bearer {config['token']}")
                elif auth_type == "api_key" and config.get("api_key_header") and config.get("api_key_value"):
                    headers.setdefault(config["api_key_header"], config["api_key_value"])

                if isinstance(body, str) and body.strip().startswith("{"):
                    try:
                        body = json.loads(body)
                    except (json.JSONDecodeError, ValueError):
                        pass

                # Render body templates
                if isinstance(body, dict):
                    body = _resolve_runtime_value(body, vault_context or {})
                    body = {k: _render_template(str(v), expression_scope) if isinstance(v, str) else v for k, v in body.items()}

                try:
                    with httpx.Client(timeout=timeout_sec) as client:
                        resp = client.request(method, url, headers=headers, json=body if isinstance(body, dict) else None, content=body if isinstance(body, str) else None, params=query_params)
                    try:
                        resp_data = resp.json()
                    except Exception:
                        resp_data = resp.text
                    output = {
                        "status_code": resp.status_code,
                        "data": resp_data,
                        "headers": dict(resp.headers),
                    }
                    if resp.status_code >= 400:
                        output["error"] = f"HTTP {resp.status_code}: {resp.reason_phrase}"
                except Exception as http_exc:
                    output = {"error": f"HTTP request failed: {http_exc}"}
                    status = "failed"

                if status != "failed":
                    context["http_response"] = output
                    context.update(output)

            # ── Filter node ─────────────────────────────────────────
            elif step_type == "filter":
                items_expr = config.get("items", "")
                field = config.get("field", "")
                operator = config.get("operator", "equals")
                compare_value = config.get("value", "")

                # Resolve items
                filter_items: list[Any] = []
                if isinstance(items_expr, list):
                    filter_items = items_expr
                elif isinstance(items_expr, str):
                    resolved = context.get(items_expr) or payload.get(items_expr)
                    if isinstance(resolved, list):
                        filter_items = resolved

                filtered: list[Any] = []
                for item in filter_items:
                    actual = item.get(field) if isinstance(item, dict) else item
                    if operator == "equals" and str(actual) == str(compare_value):
                        filtered.append(item)
                    elif operator == "not_equals" and str(actual) != str(compare_value):
                        filtered.append(item)
                    elif operator == "contains" and str(compare_value) in str(actual):
                        filtered.append(item)
                    elif operator == "gt" and float(actual or 0) > float(compare_value or 0):
                        filtered.append(item)
                    elif operator == "lt" and float(actual or 0) < float(compare_value or 0):
                        filtered.append(item)
                    elif operator == "exists" and actual is not None:
                        filtered.append(item)

                output = {"original_count": len(filter_items), "filtered_count": len(filtered), "items": filtered}
                context["filtered"] = filtered
                context.update(output)

            # ── Merge / Aggregate node ──────────────────────────────
            elif step_type == "merge":
                mode = config.get("mode", "append")
                sources = config.get("sources") or []
                merged: list[Any] = []
                for src in sources:
                    resolved = context.get(src) or payload.get(src)
                    if isinstance(resolved, list):
                        merged.extend(resolved)
                    elif resolved is not None:
                        merged.append(resolved)

                if mode == "object":
                    # Merge dicts instead of appending
                    merged_obj: dict[str, Any] = {}
                    for src in sources:
                        resolved = context.get(src) or payload.get(src)
                        if isinstance(resolved, dict):
                            merged_obj.update(resolved)
                    output = merged_obj
                else:
                    output = {"items": merged, "count": len(merged)}

                context["merged"] = output
                context.update(output if isinstance(output, dict) else {"merged": output})
            else:
                output = {"note": f"Unsupported step type '{step_type}' skipped."}
                status = "skipped"
        except Exception as exc:  # noqa: BLE001
            status = "failed"
            output = {"error": str(exc)}

        duration_ms = int((time.perf_counter() - started) * 1000)
        if output is not None:
            context.setdefault("steps", {})[step["name"]] = output
            context["steps"][step["id"]] = output
        step_results.append(
            {
                "step_id": step["id"],
                "step_type": step["type"],
                "name": step["name"],
                "status": status,
                "duration_ms": duration_ms,
                "output": output,
                "pinned_data_used": pinned_data_used,
            }
        )

        if status == "failed":
            raise RuntimeError(output["error"])

        next_step = _resolve_next_step(step["id"], step_lookup, outgoing, next_label)
        if status == "paused":
            return {
                "status": "paused",
                "step_results": step_results,
                "context": context,
                "pause": {
                    "step_id": step["id"],
                    "step_name": step["name"],
                    "wait_type": output["wait_type"],
                    "resume_after": output.get("resume_after"),
                    "metadata": output,
                },
                "state": {
                    "context": context,
                    "step_results": step_results,
                    "visited": list(visited),
                    "next_step_id": next_step["id"] if next_step else None,
                    "pending_label": None,
                },
            }

        current_step = next_step

    result = {
        "summary": context.get("text") or context.get("message") or "Workflow completed successfully.",
        "context": context,
    }
    return {
        "status": "completed",
        "step_results": step_results,
        "result": result,
        "context": context,
    }


def _resolve_next_step(
    step_id: str,
    step_lookup: dict[str, dict[str, Any]],
    outgoing: dict[str, list[dict[str, Any]]],
    preferred_label: str | None,
) -> dict[str, Any] | None:
    candidates = outgoing.get(step_id, [])
    if not candidates:
        return None

    if preferred_label is not None:
        for edge in candidates:
            if str(edge.get("label", "")).lower() == preferred_label:
                return step_lookup.get(edge["target"])

    return step_lookup.get(candidates[0]["target"])


def _build_expression_scope(payload: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    scope = {**context, **payload}
    scope["payload"] = payload
    scope["json"] = payload
    scope.setdefault("steps", dict(context.get("steps") or {}))
    return scope


def _tokenize_expression(expression: str) -> list[str | int]:
    tokens: list[str | int] = []
    index = 0
    while index < len(expression):
        char = expression[index]
        if char == ".":
            index += 1
            continue
        if char == "[":
            end_index = expression.find("]", index)
            if end_index == -1:
                break
            segment = expression[index + 1:end_index].strip()
            if segment.startswith(('"', "'")) and segment.endswith(('"', "'")):
                tokens.append(segment[1:-1])
            elif segment.isdigit():
                tokens.append(int(segment))
            else:
                tokens.append(segment)
            index = end_index + 1
            continue
        end_index = index
        while end_index < len(expression) and expression[end_index] not in ".[":
            end_index += 1
        tokens.append(expression[index:end_index])
        index = end_index
    return [token for token in tokens if token not in {"", "$"}]


def _resolve_expression_value(expression: str, scope: dict[str, Any]) -> Any:
    expr = expression.strip()
    if expr.startswith("$"):
        expr = expr[1:]
    if expr == "json":
        expr = "payload"
    elif expr.startswith("json."):
        expr = f"payload.{expr[5:]}"

    tokens = _tokenize_expression(expr)
    if not tokens:
        return ""

    current: Any = scope
    for token in tokens:
        if isinstance(current, dict):
            current = current.get(token)
        elif isinstance(current, list) and isinstance(token, int) and 0 <= token < len(current):
            current = current[token]
        else:
            return ""
    return current


def _stringify_expression_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value)
    return str(value)


def _render_template(template: str, payload: dict[str, Any]) -> str:
    if not isinstance(template, str) or "{{" not in template:
        return template
    matches = list(EXPRESSION_PATTERN.finditer(template))
    if len(matches) == 1 and matches[0].span() == (0, len(template)):
        return _stringify_expression_value(_resolve_expression_value(matches[0].group(1), payload))
    return EXPRESSION_PATTERN.sub(lambda match: _stringify_expression_value(_resolve_expression_value(match.group(1), payload)), template)


def _run_llm(*, prompt: str, payload: dict[str, Any], config: dict[str, Any] | None = None) -> str:
    """Route LLM calls — supports per-step provider/model/api_key overrides from Vault."""
    router = get_llm_router()
    full_prompt = f"{prompt}\n\nPayload:\n{json.dumps(payload, default=str)}"
    cfg = config or {}

    # Per-step provider override: user can specify provider + api_key in step config
    step_provider = str(cfg.get("provider") or "").lower()
    step_api_key = str(cfg.get("api_key") or "")
    step_model = str(cfg.get("model") or "")
    step_base_url = str(cfg.get("base_url") or "")
    temperature = float(cfg.get("temperature") or 0.7)
    max_tokens = int(cfg.get("max_tokens") or 2048)

    # If user provided their own API key, create an ad-hoc provider
    if step_api_key and step_provider:
        from .llm_router import (
            AnthropicProvider,
            GeminiProvider,
            GroqProvider,
            OpenAICompatibleProvider,
        )

        adhoc: LLMProvider | None = None
        if step_provider == "anthropic":
            adhoc = AnthropicProvider(step_api_key, step_model or "claude-sonnet-4-20250514")
        elif step_provider == "gemini":
            adhoc = GeminiProvider(step_api_key, step_model or "gemini-2.5-flash")
        elif step_provider == "groq":
            adhoc = GroqProvider(step_api_key, step_model or "llama-3.3-70b-versatile")
        elif step_provider in ("openai", "deepseek", "xai", "together", "fireworks"):
            base_urls = {
                "openai": "https://api.openai.com/v1",
                "deepseek": "https://api.deepseek.com/v1",
                "xai": "https://api.x.ai/v1",
                "together": "https://api.together.xyz/v1",
                "fireworks": "https://api.fireworks.ai/inference/v1",
            }
            adhoc = OpenAICompatibleProvider(
                name=step_provider,
                api_key=step_api_key,
                model=step_model or "gpt-4o",
                base_url=step_base_url or base_urls.get(step_provider, "https://api.openai.com/v1"),
            )
        elif step_provider == "custom" and step_base_url:
            adhoc = OpenAICompatibleProvider(
                name="custom",
                api_key=step_api_key,
                model=step_model or "default",
                base_url=step_base_url,
            )

        if adhoc:
            try:
                return adhoc.generate(full_prompt, system="You are a workflow automation assistant. Analyze the payload and respond concisely.", temperature=temperature, max_tokens=max_tokens)
            except Exception as exc:
                import logging
                logging.getLogger(__name__).warning("Ad-hoc LLM provider %s failed: %s, falling back to router", step_provider, exc)

    try:
        return router.generate(full_prompt, system="You are a workflow automation assistant. Analyze the payload and respond concisely.", provider=step_provider or None, temperature=temperature, max_tokens=max_tokens)
    except RuntimeError:
        # Final fallback if all providers fail
        subject = payload.get("message") or payload.get("subject") or payload.get("name") or "the request"
        return f"LLM unavailable. Fallback summary for {subject}."


def _compute_resume_after(config: dict[str, Any]) -> str:
    total_seconds = 0
    for key, multiplier in (("seconds", 1), ("minutes", 60), ("hours", 3600)):
        value = config.get(key)
        if value is not None:
            total_seconds += int(value) * multiplier
    if total_seconds <= 0:
        total_seconds = int(config.get("delay_seconds") or 60)
    return (datetime.now(UTC) + timedelta(seconds=total_seconds)).isoformat()


def _resolve_runtime_value(value: Any, vault_context: dict[str, dict[str, Any]]) -> Any:
    if isinstance(value, dict):
        return {key: _resolve_runtime_value(item, vault_context) for key, item in value.items()}
    if isinstance(value, list):
        return [_resolve_runtime_value(item, vault_context) for item in value]
    if not isinstance(value, str):
        return value

    exact_match = VAULT_TOKEN_PATTERN.fullmatch(value.strip())
    if exact_match is not None:
        return _lookup_vault_token(exact_match, vault_context)

    def replace_match(match: re.Match[str]) -> str:
        resolved = _lookup_vault_token(match, vault_context)
        if isinstance(resolved, (dict, list)):
            return str(resolved)
        return "" if resolved is None else str(resolved)

    return VAULT_TOKEN_PATTERN.sub(replace_match, value)


def _lookup_vault_token(match: re.Match[str], vault_context: dict[str, dict[str, Any]]) -> Any:
    asset_type, asset_name, field_name = match.groups()

    if asset_type == "variable":
        return vault_context.get("variables", {}).get(asset_name)

    if asset_type == "credential":
        credential = vault_context.get("credentials", {}).get(asset_name, {})
        if field_name:
            return credential.get(field_name)
        return credential

    connection = vault_context.get("connections", {}).get(asset_name, {})
    if field_name:
        return connection.get(field_name)
    return connection


def _enrich_config_with_bindings(
    step_type: str,
    config: dict[str, Any],
    vault_context: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    enriched = dict(config)
    connection_name = enriched.get("connection_name")
    credential_name = (
        enriched.get("credential_name")
        or enriched.get("credential_id")
        or enriched.get("credential")
        or enriched.get("email_credential")
    )
    model_variable_name = enriched.get("model_variable_name")
    webhook_variable_name = enriched.get("webhook_variable_name")

    if isinstance(connection_name, str) and connection_name:
        connection = dict(vault_context.get("connections", {}).get(connection_name) or {})
        if connection:
            enriched.setdefault("connection", connection)
            for key in ("channel", "webhook_url", "base_url", "model", "workspace", "api_key", "bot_token"):
                if key not in enriched and key in connection:
                    enriched[key] = connection[key]

    if isinstance(credential_name, str) and credential_name:
        credential = dict(vault_context.get("credentials", {}).get(credential_name) or {})
        if credential:
            enriched.setdefault("credential_name", credential_name)
            enriched.setdefault("credential", credential)
            for key, value in credential.items():
                enriched.setdefault(key, value)

    if isinstance(model_variable_name, str) and model_variable_name:
        model_value = vault_context.get("variables", {}).get(model_variable_name)
        if model_value:
            enriched["model"] = model_value

    if isinstance(webhook_variable_name, str) and webhook_variable_name:
        webhook_value = vault_context.get("variables", {}).get(webhook_variable_name)
        if webhook_value:
            enriched["webhook_url"] = webhook_value

    if step_type == "llm" and "provider" in enriched and isinstance(enriched["provider"], str):
        enriched["provider"] = enriched["provider"].lower()

    return enriched
