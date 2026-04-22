# Spec 90 — FlowHolt Error Handlers Deep Spec
**Source research:** Make.com 5 error handlers, n8n Error Trigger / Stop-and-Error nodes
**Status:** Final specification

---

## 1. Overview

FlowHolt adopts the **Make.com per-module error handler model** plus the **n8n Error Workflow (Error Trigger)** concept, giving users both per-step granular control and workflow-level catch-all supervision.

The two levels are:
1. **Per-node error handlers** — attached to individual nodes on the canvas; triggered when THAT node fails
2. **Workflow error handler** — a separate workflow triggered if the whole workflow errors (n8n Error Workflow concept)

---

## 2. Make Error Handlers: All 5 Types (Full Research)

### 2.1 Ignore Handler
**What it does:** Removes the erroring bundle from the flow; the next bundle continues as normal.
- The scenario run is marked as **SUCCESS** even though errors occurred
- Keeps workflow on its scheduled execution (doesn't disable)
- **Best for:** Expected "bad data" that can safely be skipped (e.g. optional API calls, non-critical enrichments)

**FlowHolt UX:**
- Right-click node → "Add error handler" → "Ignore"
- No configuration required — one-click
- Canvas shows a small shield icon on the node edge

### 2.2 Break Handler
**What it does:** Removes the erroring bundle from flow; stores remaining execution state as an **Incomplete Execution** (a saved checkpoint in the DB).
- Other bundles in the batch **continue** processing
- ConnectionError and RateLimitError are auto-retried by default even WITHOUT Break (if incomplete executions are enabled)
- Break handler adds configurable retry: N attempts + delay (seconds) between them
- **Best for:** Transient errors (rate limits, network failures) where the same data should be retried later

**FlowHolt UX:**
- Right-click node → "Add error handler" → "Break"
- Configuration dialog:
  - Enable auto-retry: Yes/No
  - Max retry attempts (1–10)
  - Retry delay (seconds)
- Incomplete executions appear in "Executions → Incomplete" tab
- Manual resolve button per entry

### 2.3 Resume Handler
**What it does:** When the node errors, substitutes the output with **custom fallback data** you define. Execution continues with the substitute data.
- The rest of the workflow receives the substitute bundle as if the node succeeded
- Can be used to add a `{ "status": "skipped" }` marker for post-processing
- **Best for:** When a fallback default value makes the workflow safe to continue

**FlowHolt UX:**
- Right-click node → "Add error handler" → "Resume"
- Configuration shows the same output fields as the node itself, pre-filled
- User enters fallback values (or expressions) for each field
- Resume path is shown as a dashed line from the node's error port

### 2.4 Commit Handler
**What it does:** Stops the workflow execution when error occurs; **saves (commits)** all changes made in ACID-capable nodes so far.
- The erroring bundle does NOT continue; remaining unprocessed bundles are dropped
- Non-ACID node changes (like sent emails) cannot be undone — only DB/DataStore changes are committed
- **Best for:** "Stop and preserve partial progress" use case in transactional flows

**FlowHolt UX:**
- Right-click node → "Add error handler" → "Commit"
- Optional: workflow setting "Auto-commit transactions" ON/OFF (default ON)
  - If OFF: all ACID changes from current bundle are committed
  - If ON: only the erroring module's uncommitted changes are committed

**ACID-enabled node types in FlowHolt:**
- DataStore nodes
- MySQL / PostgreSQL / SQLite connector nodes (future)
- Supabase Table nodes (future)

### 2.5 Rollback Handler
**What it does:** Stops the workflow; **reverts (rolls back)** changes made by ACID-capable nodes.
- Depends on Auto-commit setting:
  - Auto-commit OFF → ALL changes from the entire batch for that bundle are reverted
  - Auto-commit ON → only the erroring module's uncommitted changes are reverted (prior modules already committed and cannot be rolled back)
- Non-ACID changes (emails sent, Slack messages) cannot be undone
- **Best for:** All-or-nothing transactional flows where partial writes are worse than no writes

**FlowHolt UX:**
- Right-click node → "Add error handler" → "Rollback"
- Warning shown if non-ACID nodes are upstream

---

## 3. Handler Comparison Table

| Handler    | Erroring Bundle | Other Bundles | ACID Modules | Run Status | Retry Support |
|------------|----------------|---------------|--------------|------------|---------------|
| **Ignore** | Dropped        | Continue      | No change    | SUCCESS    | No            |
| **Break**  | Saved as incomplete | Continue | No change | Warning / Error | Yes (N attempts + delay) |
| **Resume** | Replaced with substitute | Continue | No change | SUCCESS | No |
| **Commit** | Dropped        | Dropped       | Committed    | Error      | No            |
| **Rollback**| Dropped       | Dropped       | Reverted     | Error      | No            |

---

## 4. n8n Patterns Adopted

### 4.1 Error Workflow (Error Trigger)
- A separate FlowHolt workflow designated as the "error handler workflow" for another workflow
- Contains an **Error Trigger** node as its entry point
- Error Trigger receives: `workflow.id`, `workflow.name`, `execution.id`, `execution.url`, `error.message`, `error.stack`
- Can send Slack/email/webhook notifications about failures
- Rules:
  - A workflow can only have ONE designated error workflow
  - The same error workflow can serve multiple parent workflows
  - Error workflow runs automatically only for production (non-manual) executions
  - Error workflows are NOT manually testable (Error Trigger only fires on real failures)

**FlowHolt setting location:** Workflow Settings panel → "Error Workflow" dropdown

### 4.2 Stop and Error Node
- A terminal node that throws a deliberate exception
- Can only be placed as the LAST node in a branch
- Types:
  - **Error Message** (string): human-readable description
  - **Error Object** (object): structured error with `name`, `message`, `cause` fields
- Use cases: data validation (wrong type/missing field), early termination on bad data

---

## 5. Incomplete Executions System

### 5.1 What it stores
When Break handler triggers or execution fails, FlowHolt saves:
- Error message + stack trace
- Current node ID + step index
- All mapped values at time of failure
- Remaining nodes in the execution path
- Input data for the failed bundle

### 5.2 UI Location
- **Executions → Incomplete** tab (left rail)
- Per-entry fields: workflow name, node name, error type, timestamp, bundle data preview
- Actions per entry:
  - **Resolve** — mark as handled (removes from list without re-running)
  - **Retry** — re-run from the failed step with the saved data
  - **Delete** — discard permanently
  - **View detail** — shows full error + data inspector

### 5.3 Configuration
- Per-workflow toggle: "Store incomplete executions" (default OFF)
- Plan limits:
  - Free: max 100 stored incomplete executions
  - Pro: max 1,000
  - Enterprise: max 10,000

### 5.4 Auto-retry behavior
| Error type | Auto-retry default |
|------------|--------------------|
| ConnectionError | Yes (up to 3 attempts, 60s delay) |
| RateLimitError  | Yes (respects Retry-After header) |
| BundleValidationError | No (needs Break handler to retry) |
| Custom errors | Only if Break handler with retry enabled |

---

## 6. FlowHolt Error Handling Priority Order

When an error occurs on a node, FlowHolt checks in this order:
1. Does the node have a per-node error handler attached?
   - Yes → use that handler (Ignore / Break / Resume / Commit / Rollback)
   - No → continue to step 2
2. Does the workflow have a workflow-level "on_error" setting?
   - `continue_on_error: true` → equivalent to Ignore behavior
   - `stop_on_error: true` (default) → halt execution, mark as failed
3. Does the workflow have a designated Error Workflow?
   - Yes → trigger the Error Workflow with error context
4. Mark execution as FAILED, notify via system error log

---

## 7. Error Handler UI/UX Spec

### 7.1 Canvas representation
- Nodes with error handlers show a **colored dot** on bottom-right:
  - Gray = Ignore
  - Yellow = Break
  - Green = Resume
  - Blue = Commit
  - Red = Rollback
- Error handler config panel opens inline from the dot

### 7.2 Adding an error handler
1. Right-click node on canvas → "Add error handler"
2. Select type from dropdown
3. Configure options in inline panel
4. Handler saves automatically with workflow auto-save

### 7.3 Removing an error handler
- Right-click node → "Remove error handler" (or click X in handler panel)

### 7.4 Error handler chain limitation
- Only ONE error handler allowed per node at a time
- Cannot chain error handlers (n8n doesn't allow this either)

---

## 8. Node Inspector: Error Handling Tab

The **Settings** tab in the node inspector already exists in FlowHolt. Add subsections:

```
Settings Tab
├── Error Handling
│   ├── Continue on error (toggle) [legacy simple mode]
│   ├── Error Handler Type [dropdown: None / Ignore / Break / Resume / Commit / Rollback]
│   ├── [conditional] Break: Auto-retry (toggle), Max attempts (1-10), Delay (seconds)
│   ├── [conditional] Resume: Fallback output fields [dynamic form matching node outputs]
│   └── Error Workflow [workflow picker, for workflow-level setting only]
├── Retry (separate from error handler)
│   ├── Retry on fail (toggle)
│   ├── Max tries (1-10)
│   └── Wait between retries (ms)
└── Notes
    ├── Note text
    └── Show note on canvas (toggle)
```

---

## 9. FlowHolt Decisions vs Competitors

| Feature | n8n | Make | FlowHolt Decision |
|---------|-----|------|-------------------|
| Error handlers per node | continue_on_error only | 5 full handler types | **Adopt Make's 5 types** |
| Error Workflow | Yes (Error Trigger node) | No | **Keep n8n Error Workflow concept** |
| Incomplete executions | No | Yes (Break handler) | **Adopt Make's incomplete executions** |
| ACID / transaction support | No | Yes (ACID label on modules) | **Plan for DataStore + DB nodes** |
| Stop and Error node | Yes | No (errors auto-propagate) | **Keep n8n Stop and Error node** |
| Retry behavior | Per-node retry count | Per-handler (Break) | **Both: per-node retry + Break handler** |
| Error status visibility | Execution view (read-only) | Incomplete executions tab | **Both: execution detail + incomplete tab** |

---

## 10. Backend Schema for Error Handlers

```python
# Stored in workflow step config
error_handling: {
  handler_type: "none" | "ignore" | "break" | "resume" | "commit" | "rollback",
  
  # For 'break'
  auto_retry: bool,
  max_retry_attempts: int,  # 1-10
  retry_delay_seconds: int,  # 0-3600

  # For 'resume'
  resume_output: dict,  # field_name -> value/expression

  # Legacy simple mode
  continue_on_error: bool,
  retry_on_fail: bool,
  retry_count: int,
  timeout_ms: int,
}

# Incomplete execution record
{
  id: str,
  workflow_id: str,
  execution_id: str,
  step_id: str,
  step_name: str,
  error_type: str,
  error_message: str,
  error_stack: str,
  bundle_data: dict,
  remaining_steps: list[str],
  mappings_snapshot: dict,
  created_at: datetime,
  status: "pending" | "resolved" | "retrying",
  retry_count: int,
  last_retry_at: datetime | None,
}
```

---

## Summary of New Requirements Added to FlowHolt

1. **5 error handler types** per node (Ignore, Break, Resume, Commit, Rollback) — not just continue_on_error
2. **Incomplete Executions** system: storage, listing UI, manual retry, auto-retry for transient errors
3. **Error Workflow**: separate workflow with Error Trigger node for workflow-level catch-all notifications
4. **Stop and Error node**: terminal node that deliberately throws exceptions for validation
5. **ACID transaction markers**: label DB-capable nodes, respect auto-commit setting for Commit/Rollback
6. **Error handler canvas visualization**: colored dots on nodes showing handler type at a glance
