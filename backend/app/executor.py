from __future__ import annotations

import time
from string import Template
from typing import Any

import httpx

from .config import get_settings


def execute_workflow_definition(definition: dict[str, Any], payload: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    context: dict[str, Any] = {"payload": payload}
    step_results: list[dict[str, Any]] = []

    for step in definition.get("steps", []):
        started = time.perf_counter()
        output: dict[str, Any] | None = None
        status = "success"

        try:
            step_type = step["type"]
            config = step.get("config", {})

            if step_type == "trigger":
                output = {"received": True}
            elif step_type == "transform":
                output = {"message": _render_template(config.get("template", ""), payload)}
                context.update(output)
            elif step_type == "condition":
                field = config.get("field", "")
                expected = config.get("equals")
                actual = payload.get(field) or context.get(field)
                output = {"matched": actual == expected, "priority": actual}
                context.update(output)
            elif step_type == "llm":
                prompt = config.get("prompt", "Summarize the payload")
                output = {"text": _run_llm(prompt=prompt, payload=payload)}
                priority = "high" if "urgent" in output["text"].lower() or "high" in output["text"].lower() else "normal"
                output["priority"] = priority
                context.update(output)
            elif step_type == "output":
                output = {
                    "channel": config.get("channel", "default"),
                    "message": context.get("message") or context.get("text") or "Workflow completed",
                }
            else:
                output = {"note": f"Unsupported step type '{step_type}' skipped."}
                status = "skipped"
        except Exception as exc:  # noqa: BLE001
            status = "failed"
            output = {"error": str(exc)}

        duration_ms = int((time.perf_counter() - started) * 1000)
        step_results.append(
            {
                "name": step["name"],
                "status": status,
                "duration_ms": duration_ms,
                "output": output,
            }
        )

        if status == "failed":
            raise RuntimeError(output["error"])

    result = {
        "summary": context.get("text") or context.get("message") or "Workflow completed successfully.",
        "context": context,
    }
    return step_results, result


def _render_template(template: str, payload: dict[str, Any]) -> str:
    normalized = template.replace("{{", "${").replace("}}", "}")
    return Template(normalized).safe_substitute(**payload)


def _run_llm(*, prompt: str, payload: dict[str, Any]) -> str:
    settings = get_settings()
    if settings.llm_mode == "ollama":
        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": f"{prompt}\n\nPayload:\n{payload}",
                    "stream": False,
                },
            )
            response.raise_for_status()
            return response.json().get("response", "").strip() or "Model returned no text."

    subject = payload.get("message") or payload.get("subject") or payload.get("name") or "the request"
    return f"Mock local summary for {subject}. Priority is high if the payload contains urgency or escalation signals."
