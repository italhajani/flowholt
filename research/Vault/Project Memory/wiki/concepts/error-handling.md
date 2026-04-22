---
title: Error Handling and Resilience
type: concept
tags: [error-handling, retry, circuit-breaker, dead-letter, resilience, n8n]
sources: [plan-file-44, make-help-center, make-pdf, n8n-docs]
updated: 2026-04-17
---

# Error Handling and Resilience

How FlowHolt handles failures at every level — node, workflow, and integration.

---

## 5 Error Handlers (from [[wiki/entities/make]])

| Handler | Behavior |
|---------|---------|
| **Rollback** | Default. Undoes ACID-tagged operations, stores as incomplete execution |
| **Break** | Stores as incomplete, enables auto-retry (8 attempts) |
| **Ignore** | Skips the error, continues execution with null output |
| **Resume** | Continues with a user-defined fallback value |
| **Commit** | Commits all successful operations up to error, stops gracefully |

---

## Error Types (17 Total)

**11 from Make:**
- `RuntimeError`, `DataError`, `IncompleteDataError`, `DuplicateDataError`
- `MissingData`, `UnexpectedError`, `ConnectionError`, `InvalidConfiguration`
- `LimitExceededError`, `UserError`, `ServiceUnavailable`

**6 FlowHolt extensions:**
- `VaultConnectionError` — credential or vault asset failure
- `WorkflowValidationError` — schema or contract violation
- `PolicyDeniedError` — capability gate blocked the action
- `CreditLimitError` — workspace credit exhausted
- `StepTimeoutError` — node exceeded timeout setting
- `CircuitOpenError` — integration circuit breaker is open

---

## Step-Level Retry

Already partially implemented in `backend/app/studio_nodes.py`:
- `_retry_on_fail: bool`
- `_retry_count: int`
- `_retry_wait_ms: int`
- `_retry_backoff: str`

Needs: error type filtering, non-retryable exclusion list (e.g. `PolicyDeniedError` should never retry).

---

## Circuit Breakers (FlowHolt-only, no Make equivalent)

Per-integration, per-workspace state machine:
- `closed` → normal operation
- `open` → failing fast, requests rejected immediately
- `half-open` → probe requests to test recovery

Prevents cascade failures when an external API is degraded.

---

## Dead-Letter Items

Created from 3 sources:
1. Job exhaustion (8 auto-retry attempts all failed)
2. Fatal execution errors (non-retryable error type)
3. Rejected webhooks (queue overflow, schema mismatch)

Dead-letter items can be reprocessed manually → new job created.

---

## n8n Approach: Error Workflow Pattern

n8n uses a dedicated "Error Workflow" — a separate workflow that runs when the main workflow fails. This is architecturally different from Make's inline handlers.

**How it works:**
1. Create a workflow that starts with an `Error Trigger` node
2. In the failing workflow's settings, point `error_workflow` to that ID
3. On failure → n8n runs the error workflow with structured error data

**Error data payload** (received by Error Trigger):
```json
{
  "execution": {
    "id": "231",
    "url": "https://instance/execution/231",
    "retryOf": "34",           // only on retries
    "error": { "message": "...", "stack": "..." },
    "lastNodeExecuted": "Node Name",
    "mode": "manual"
  },
  "workflow": { "id": "1", "name": "Workflow Name" }
}
```

**Edge case:** If the error is in the trigger node itself (before execution starts), `execution.id` and `execution.url` are absent, and a `trigger{}` block is present instead.

**FlowHolt implication:** FlowHolt's existing error handler model (Break/Rollback/Ignore/Resume/Commit) handles inline routing. The n8n error workflow is a separate notification layer — FlowHolt should support both:
- Inline handlers (Make-style) per step
- A per-workflow "error notification workflow" setting (n8n-style) for centralized alerting

---

## Node-Level "On Error" Modes (from n8n)

n8n provides three node-level error behaviors (simpler than Make's 5 handlers):

| Mode | Behavior | FlowHolt equivalent |
|------|---------|---------------------|
| **Stop Workflow** | Halt entire execution | Rollback handler |
| **Continue** | Proceed with last valid data | Ignore handler |
| **Continue (error output)** | Pass structured error object to next node | No direct equivalent → **gap** |

The "Continue (error output)" mode is valuable: it lets builders build explicit in-workflow error recovery branches without needing a separate error workflow. Example: send the error object to a Slack node or conditional branch.

**FlowHolt gap:** Add `on_error: "stop" | "continue" | "continue_with_error"` as node-level settings alongside the existing step-level retry fields. The `continue_with_error` mode should pass a typed error object through the normal data channel.

---

## Warning Type Taxonomy (from plan file 48 §3)

Warnings are distinct from errors — a warning keeps the workflow running and does NOT increment the consecutive error counter.

| Warning type | Trigger | Effect |
|---|---|---|
| **ExecutionInterruptedWarning** | Execution duration exceeds plan limit (5 min Free, 40 min standard, up to 120 min Enterprise) | Workflow ends, remaining bundles dropped, scheduling continues |
| **OutOfSpaceWarning** | Data store capacity exceeded OR incomplete execution storage full | Workflow ends, remaining bundles dropped, scheduling continues |

**Studio distinction:** Errors show red badges; warnings show yellow/amber badges + "Run ended with warning" in status bar.

---

## Related Pages

- [[wiki/concepts/execution-model]] — incomplete executions, retry schedule, On Error node settings
- [[wiki/concepts/runtime-operations]] — dead-letter queue management surface
- [[wiki/concepts/webhook-trigger-system]] — webhook rejection → dead-letter
- [[wiki/concepts/expression-language]] — expression error types and context objects in error handlers
- [[wiki/concepts/design-system]] — error badge colors (red), warning badges (amber)
- [[wiki/entities/make]] — source of 5 handlers + 11 error types
- [[wiki/entities/n8n]] — error workflow pattern, Continue (error output) mode
- [[wiki/sources/flowholt-plans]] — plan file 44
