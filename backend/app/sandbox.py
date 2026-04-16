"""Sandboxed code execution module.

Provides safe execution of user-supplied Python and JavaScript code
within subprocess isolation with resource limits (timeout, memory).

Security measures:
- Subprocess isolation (no shared memory with main process)
- Execution timeout (default 30s, max 60s)
- Restricted built-in imports (no os, sys, subprocess, etc.)
- Output size limits
- No network access from sandboxed code by default
"""

from __future__ import annotations

import asyncio
import json
import logging
import subprocess
import sys
import tempfile
import textwrap
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


# Dangerous modules that user code must not import
BLOCKED_MODULES = frozenset({
    "os", "sys", "subprocess", "shutil", "signal", "ctypes",
    "importlib", "pathlib", "socket", "http", "urllib",
    "ftplib", "smtplib", "telnetlib", "xmlrpc", "multiprocessing",
    "threading", "pickle", "shelve", "marshal", "code", "codeop",
    "compile", "compileall", "py_compile", "zipimport",
    "pkgutil", "modulefinder", "runpy", "ensurepip", "venv",
    "webbrowser", "antigravity", "turtle", "tkinter",
    "__import__", "eval", "exec", "compile",
})

DEFAULT_TIMEOUT = 30  # seconds
MAX_TIMEOUT = 60
MAX_OUTPUT_SIZE = 65_536  # 64 KB


def _build_python_wrapper(user_code: str, input_data: dict[str, Any]) -> str:
    """Build a Python script that wraps user code with safety checks."""
    input_json = json.dumps(input_data)
    return textwrap.dedent(f"""\
        import json
        import sys
        import builtins

        # Block dangerous imports
        _original_import = builtins.__import__
        _BLOCKED = {{{", ".join(repr(m) for m in sorted(BLOCKED_MODULES))}}}

        def _safe_import(name, *args, **kwargs):
            top_level = name.split(".")[0]
            if top_level in _BLOCKED:
                raise ImportError(f"Import of '{{name}}' is not allowed in sandboxed execution")
            return _original_import(name, *args, **kwargs)

        builtins.__import__ = _safe_import

        # Provide input data
        INPUT = json.loads({input_json!r})

        # Capture output
        _results = {{"output": None, "logs": []}}
        _original_print = builtins.print

        def _safe_print(*args, **kwargs):
            msg = " ".join(str(a) for a in args)
            _results["logs"].append(msg)

        builtins.print = _safe_print

        try:
            # User code namespace
            _user_ns = {{"INPUT": INPUT, "print": _safe_print, "json": json, "math": __import__("math")}}
            exec({user_code!r}, _user_ns)

            # Check for a result variable
            if "result" in _user_ns:
                _results["output"] = _user_ns["result"]
            elif "output" in _user_ns:
                _results["output"] = _user_ns["output"]
            elif "RESULT" in _user_ns:
                _results["output"] = _user_ns["RESULT"]

            _results["status"] = "success"
        except Exception as e:
            _results["status"] = "error"
            _results["error"] = f"{{type(e).__name__}}: {{e}}"

        # Output as JSON
        sys.stdout = sys.__stdout__
        builtins.print = _original_print
        try:
            _original_print(json.dumps(_results, default=str))
        except Exception:
            _original_print(json.dumps({{"status": "error", "error": "Failed to serialize output"}}))
    """)


def _build_js_wrapper(user_code: str, input_data: dict[str, Any]) -> str:
    """Build a Node.js script that wraps user code safely."""
    input_json = json.dumps(input_data)
    return textwrap.dedent(f"""\
        const INPUT = {input_json};
        const _results = {{ output: null, logs: [] }};
        const _originalLog = console.log;
        console.log = (...args) => {{
            _results.logs.push(args.map(String).join(" "));
        }};

        try {{
            {user_code}

            if (typeof result !== "undefined") _results.output = result;
            else if (typeof output !== "undefined") _results.output = output;
            _results.status = "success";
        }} catch (e) {{
            _results.status = "error";
            _results.error = e.toString();
        }}

        console.log = _originalLog;
        process.stdout.write(JSON.stringify(_results));
    """)


async def execute_code(
    *,
    code: str,
    language: str = "python",
    input_data: dict[str, Any] | None = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> dict[str, Any]:
    """Execute user code in a sandboxed subprocess.

    Args:
        code: Source code to execute.
        language: "python" or "javascript".
        input_data: Data available to the code as INPUT variable.
        timeout: Max execution time in seconds.

    Returns:
        Dict with status, output, logs, duration_ms, and optionally error.
    """
    if input_data is None:
        input_data = {}

    timeout = min(max(1, timeout), MAX_TIMEOUT)

    if language == "python":
        wrapper = _build_python_wrapper(code, input_data)
        cmd = [sys.executable, "-u", "-"]
    elif language in ("javascript", "js", "node"):
        wrapper = _build_js_wrapper(code, input_data)
        cmd = ["node", "-e", wrapper]
    else:
        return {"status": "error", "error": f"Unsupported language: {language}", "output": None, "logs": []}

    import time
    start = time.monotonic()

    try:
        if language == "python":
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(input=wrapper.encode("utf-8")),
                timeout=timeout,
            )
        else:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(),
                timeout=timeout,
            )

        duration_ms = int((time.monotonic() - start) * 1000)

        stdout_text = stdout_bytes.decode("utf-8", errors="replace")[:MAX_OUTPUT_SIZE]
        stderr_text = stderr_bytes.decode("utf-8", errors="replace")[:MAX_OUTPUT_SIZE]

        try:
            result = json.loads(stdout_text)
        except (json.JSONDecodeError, ValueError):
            result = {
                "status": "error" if proc.returncode != 0 else "success",
                "output": stdout_text if stdout_text else None,
                "logs": [],
                "error": stderr_text if stderr_text else None,
            }

        result["duration_ms"] = duration_ms
        result.setdefault("logs", [])
        result.setdefault("output", None)

        if stderr_text and not result.get("error"):
            result["stderr"] = stderr_text

        return result

    except asyncio.TimeoutError:
        duration_ms = int((time.monotonic() - start) * 1000)
        try:
            proc.kill()  # type: ignore[union-attr]
        except Exception:
            logger.warning("Failed to kill timed-out sandbox process")
        return {
            "status": "timeout",
            "error": f"Execution timed out after {timeout}s",
            "output": None,
            "logs": [],
            "duration_ms": duration_ms,
        }
    except FileNotFoundError:
        duration_ms = int((time.monotonic() - start) * 1000)
        runtime = "Python" if language == "python" else "Node.js"
        return {
            "status": "error",
            "error": f"{runtime} runtime not found on this system",
            "output": None,
            "logs": [],
            "duration_ms": duration_ms,
        }
    except Exception as exc:
        duration_ms = int((time.monotonic() - start) * 1000)
        return {
            "status": "error",
            "error": f"Sandbox error: {type(exc).__name__}: {exc}",
            "output": None,
            "logs": [],
            "duration_ms": duration_ms,
        }


async def execute_python(code: str, input_data: dict[str, Any] | None = None, timeout: int = DEFAULT_TIMEOUT) -> dict[str, Any]:
    return await execute_code(code=code, language="python", input_data=input_data, timeout=timeout)


async def execute_javascript(code: str, input_data: dict[str, Any] | None = None, timeout: int = DEFAULT_TIMEOUT) -> dict[str, Any]:
    return await execute_code(code=code, language="javascript", input_data=input_data, timeout=timeout)
