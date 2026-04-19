"""
FlowHolt error type taxonomy and error handler models.

17 error types (11 Make-aligned + 6 FlowHolt extensions) plus handler
configuration models used by the executor.
"""
from __future__ import annotations

from typing import Any, Literal


# ---------------------------------------------------------------------------
# Error types
# ---------------------------------------------------------------------------

#: Make-aligned error types
MAKE_ERROR_TYPES: frozenset[str] = frozenset({
    "AccountValidationError",
    "BundleValidationError",
    "ConnectionError",
    "DataError",
    "DataSizeLimitExceededError",
    "DuplicateDataError",
    "IncompleteDataError",
    "InconsistencyError",
    "MaxFileSizeExceededError",
    "ModuleTimeoutError",
    "RateLimitError",
    "RuntimeError",
})

#: FlowHolt-specific extensions
FLOWHOLT_ERROR_TYPES: frozenset[str] = frozenset({
    "VaultConnectionError",
    "WorkflowValidationError",
    "PolicyDeniedError",
    "CreditLimitError",
    "StepTimeoutError",
    "CircuitOpenError",
})

ALL_ERROR_TYPES: frozenset[str] = MAKE_ERROR_TYPES | FLOWHOLT_ERROR_TYPES

#: Which error types are immediately fatal (auto-deactivate, no retry)
FATAL_ERROR_TYPES: frozenset[str] = frozenset({
    "AccountValidationError",
    "DataSizeLimitExceededError",
    "InconsistencyError",
    "OperationsLimitExceededError",
    "CreditLimitError",
    "PolicyDeniedError",
    "WorkflowValidationError",
})

#: Which error types are retryable by default
RETRYABLE_ERROR_TYPES: frozenset[str] = frozenset({
    "ConnectionError",
    "IncompleteDataError",
    "ModuleTimeoutError",
    "RateLimitError",
    "StepTimeoutError",
    "CircuitOpenError",
    "VaultConnectionError",
})

#: Warning types (non-fatal, annotate execution status)
WARNING_TYPES: frozenset[str] = frozenset({
    "ExecutionInterruptedWarning",  # execution duration exceeds plan limit
    "OutOfSpaceWarning",            # data store or incomplete execution storage full
})


# ---------------------------------------------------------------------------
# Expression error types (spec 53 §5)
# ---------------------------------------------------------------------------

class ExpressionError(Exception):
    """Base class for all expression evaluation errors."""

    def __init__(self, message: str, *, expression: str = "", position: int | None = None) -> None:
        super().__init__(message)
        self.expression = expression
        self.position = position


class ExpressionSyntaxError(ExpressionError):
    """Expression has invalid syntax."""


class ExpressionSecurityError(ExpressionError):
    """Expression contains a forbidden construct (e.g. __proto__, eval, import)."""


class ExpressionTimeoutError(ExpressionError):
    """Expression exceeded the CPU time limit."""


class ExpressionMemoryError(ExpressionError):
    """Expression exceeded memory limit."""


class ExpressionReferenceError(ExpressionError):
    """Expression references an undefined variable."""


class ExpressionTypeError(ExpressionError):
    """Expression invokes a method on an incompatible type."""


class ExpressionResultTooLarge(ExpressionError):
    """Expression result exceeds the maximum allowed size."""


EXPRESSION_ERROR_TYPES: frozenset[str] = frozenset({
    "ExpressionSyntaxError",
    "ExpressionSecurityError",
    "ExpressionTimeoutError",
    "ExpressionMemoryError",
    "ExpressionReferenceError",
    "ExpressionTypeError",
    "ExpressionResultTooLarge",
})


def classify_error(error_type: str) -> dict[str, bool]:
    """Return classification flags for a given error type."""
    return {
        "retryable": error_type in RETRYABLE_ERROR_TYPES,
        "fatal": error_type in FATAL_ERROR_TYPES,
        "is_warning": error_type in WARNING_TYPES,
    }


# ---------------------------------------------------------------------------
# Execution error model
# ---------------------------------------------------------------------------

class ExecutionError:
    """Structured error produced by the executor for a failed step."""

    __slots__ = (
        "error_type",
        "error_code",
        "message",
        "step_id",
        "step_label",
        "node_type",
        "retryable",
        "fatal",
        "timestamp",
        "context",
    )

    def __init__(
        self,
        *,
        error_type: str = "RuntimeError",
        message: str,
        error_code: str | None = None,
        step_id: str | None = None,
        step_label: str | None = None,
        node_type: str | None = None,
        retryable: bool | None = None,
        fatal: bool | None = None,
        timestamp: str | None = None,
        context: dict[str, Any] | None = None,
    ) -> None:
        from datetime import UTC, datetime  # local import to keep module lightweight

        self.error_type = error_type
        self.error_code = error_code
        self.message = message
        self.step_id = step_id
        self.step_label = step_label
        self.node_type = node_type
        flags = classify_error(error_type)
        self.retryable = retryable if retryable is not None else flags["retryable"]
        self.fatal = fatal if fatal is not None else flags["fatal"]
        self.timestamp = timestamp or datetime.now(UTC).isoformat()
        self.context = context or {}

    def to_dict(self) -> dict[str, Any]:
        return {
            "error_type": self.error_type,
            "error_code": self.error_code,
            "message": self.message,
            "step_id": self.step_id,
            "step_label": self.step_label,
            "node_type": self.node_type,
            "retryable": self.retryable,
            "fatal": self.fatal,
            "timestamp": self.timestamp,
            "context": self.context,
        }


# ---------------------------------------------------------------------------
# Warning model
# ---------------------------------------------------------------------------

class ExecutionWarning:
    """Non-fatal execution condition that annotates the run but does not stop it."""

    __slots__ = ("warning_type", "message", "step_id", "timestamp")

    def __init__(
        self,
        *,
        warning_type: str,
        message: str,
        step_id: str | None = None,
        timestamp: str | None = None,
    ) -> None:
        from datetime import UTC, datetime

        self.warning_type = warning_type
        self.message = message
        self.step_id = step_id
        self.timestamp = timestamp or datetime.now(UTC).isoformat()

    def to_dict(self) -> dict[str, Any]:
        return {
            "warning_type": self.warning_type,
            "message": self.message,
            "step_id": self.step_id,
            "timestamp": self.timestamp,
        }


# ---------------------------------------------------------------------------
# Error handler configuration models
# ---------------------------------------------------------------------------

ErrorHandlerType = Literal["ignore", "resume", "commit", "rollback", "break"]

OnErrorMode = Literal["stop", "continue", "continue_with_error"]


class ErrorFilter:
    """Optional filter that restricts which error types an error handler applies to."""

    def __init__(
        self,
        *,
        error_types: list[str] | None = None,
        match_mode: Literal["include", "exclude"] = "include",
    ) -> None:
        self.error_types: list[str] = error_types or []
        self.match_mode = match_mode

    def matches(self, error_type: str) -> bool:
        if not self.error_types:
            return True  # no filter → matches everything
        present = error_type in self.error_types
        return present if self.match_mode == "include" else not present

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> "ErrorFilter | None":
        if not data:
            return None
        return cls(
            error_types=data.get("error_types") or [],
            match_mode=data.get("match_mode", "include"),
        )


class StepErrorHandler:
    """Per-step error handler configuration attached in the node inspector Settings tab."""

    def __init__(
        self,
        *,
        handler_type: ErrorHandlerType,
        error_filter: ErrorFilter | None = None,
        resume_mapping: dict[str, Any] | None = None,
        break_auto_retry: bool = False,
        break_max_attempts: int = 3,
        break_retry_delays: list[int] | None = None,
    ) -> None:
        self.handler_type = handler_type
        self.error_filter = error_filter
        self.resume_mapping = resume_mapping or {}
        self.break_auto_retry = break_auto_retry
        self.break_max_attempts = break_max_attempts
        self.break_retry_delays = break_retry_delays or [300, 600, 900]

    @classmethod
    def from_config(cls, config: dict[str, Any] | None) -> "StepErrorHandler | None":
        """Parse a node config dict into a StepErrorHandler, or return None if absent."""
        if not config:
            return None
        handler_type = config.get("_error_handler")
        if not handler_type:
            return None
        return cls(
            handler_type=handler_type,
            error_filter=ErrorFilter.from_dict(config.get("_error_filter")),
            resume_mapping=config.get("_resume_mapping"),
            break_auto_retry=bool(config.get("_break_auto_retry", False)),
            break_max_attempts=int(config.get("_break_max_attempts") or 3),
            break_retry_delays=config.get("_break_retry_delays") or [300, 600, 900],
        )


# ---------------------------------------------------------------------------
# Result produced by error handler application
# ---------------------------------------------------------------------------

class ErrorHandlerResult:
    """
    What the executor should do after applying an error handler.

    outcome:
      "continue"        — execution continues to the next step (Ignore/Resume)
      "stop_success"    — execution stops, status = "success" (Commit)
      "stop_error"      — execution stops, status = "error"  (Rollback/unhandled)
      "break"           — execution stops for this item, stored as incomplete (Break)
      "continue_error"  — passes error object downstream (continue_with_error mode)
    """

    def __init__(
        self,
        *,
        outcome: Literal["continue", "stop_success", "stop_error", "break", "continue_error"],
        substitute_output: dict[str, Any] | None = None,
        error: ExecutionError | None = None,
        commit_acid: bool = False,
        rollback_acid: bool = False,
    ) -> None:
        self.outcome = outcome
        self.substitute_output = substitute_output
        self.error = error
        self.commit_acid = commit_acid
        self.rollback_acid = rollback_acid


# ---------------------------------------------------------------------------
# Error handler application logic
# ---------------------------------------------------------------------------

def apply_error_handler(
    handler: StepErrorHandler | None,
    on_error_mode: OnErrorMode,
    error: ExecutionError,
) -> ErrorHandlerResult:
    """
    Apply the error handler (or on_error_mode) and return what the executor should do.

    Priority:
      1. If StepErrorHandler configured and filter matches → apply handler
      2. Else fall back to on_error_mode
      3. Else default (Rollback / stop_error)
    """
    # ── step-level error handler ─────────────────────────────────────────────
    if handler is not None:
        if handler.error_filter is None or handler.error_filter.matches(error.error_type):
            return _apply_step_handler(handler, error)

    # ── node-level on_error mode (n8n pattern) ──────────────────────────────
    if on_error_mode == "continue":
        # Skip error, continue with null output — equivalent to Ignore
        return ErrorHandlerResult(
            outcome="continue",
            substitute_output={"skipped": True, "error_ignored": error.to_dict()},
        )
    if on_error_mode == "continue_with_error":
        # Pass structured error object downstream
        return ErrorHandlerResult(
            outcome="continue_error",
            substitute_output={"error": error.to_dict()},
            error=error,
        )

    # ── default: stop with error (implicit Rollback) ─────────────────────────
    return ErrorHandlerResult(
        outcome="stop_error",
        error=error,
        rollback_acid=True,
    )


def _apply_step_handler(
    handler: StepErrorHandler,
    error: ExecutionError,
) -> ErrorHandlerResult:
    t = handler.handler_type

    if t == "ignore":
        return ErrorHandlerResult(
            outcome="continue",
            substitute_output={"skipped": True, "error_ignored": error.to_dict()},
        )

    if t == "resume":
        substitute = dict(handler.resume_mapping) if handler.resume_mapping else {}
        substitute.setdefault("_resumed_from_error", error.to_dict())
        return ErrorHandlerResult(
            outcome="continue",
            substitute_output=substitute,
        )

    if t == "commit":
        return ErrorHandlerResult(
            outcome="stop_success",
            error=error,
            commit_acid=True,
        )

    if t == "rollback":
        return ErrorHandlerResult(
            outcome="stop_error",
            error=error,
            rollback_acid=True,
        )

    if t == "break":
        return ErrorHandlerResult(
            outcome="break",
            error=error,
        )

    # fallback
    return ErrorHandlerResult(outcome="stop_error", error=error, rollback_acid=True)
