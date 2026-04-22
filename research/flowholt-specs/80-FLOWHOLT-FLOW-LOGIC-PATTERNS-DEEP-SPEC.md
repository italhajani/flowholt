# SPEC-80: FlowHolt Flow Logic & Execution Patterns Deep Spec
## Source: n8n Documentation Deep Research — Flow Logic Complete Reference

**Created:** Sprint 88 Research Session
**Status:** Research Complete — Ready for Implementation Reference
**Scope:** Error handling, looping, merging, subworkflows, execution modes, workflow publishing

---

## 1. Overview

Flow logic patterns define how data moves through a workflow — how errors are caught, how loops iterate, how branches merge back together, how sub-workflows are composed, and how executions are scoped. This spec covers every pattern FlowHolt needs to support at full depth.

---

## 2. Execution Model Deep Dive

### 2.1 How Nodes Execute (n8n v1 model)
FlowHolt uses **branch-by-branch, top-to-bottom** execution:
1. Trigger node fires → produces `FlowItem[]`
2. Each connected node runs **in topological order** (no depth-first, pure breadth)
3. If a branch splits (IF node), each branch runs independently
4. Merged branches re-join data at a Merge node

**Execution Order v0 (legacy) vs v1:**
| Setting | v0 Behavior | v1 Behavior |
|---------|-------------|-------------|
| Default | All branches run in depth-first order | Branch-by-branch, top-to-bottom |
| Recommended | Legacy only | Default for new workflows |
| Impact | Can cause unexpected ordering | Predictable, linear execution |

**FlowHolt default:** Always use v1 (branch-by-branch). No legacy mode needed.

### 2.2 Item Pairing
When multiple nodes process the same data stream, items are **paired by position**:
- Input item 0 → Output item 0
- Input item 1 → Output item 1
- If a node outputs fewer items, trailing items have no pair (may cause merge issues)

Item pairing can be **disabled per-node** — the node's output items will not be linked to input items. Use when the output has a different cardinality.

### 2.3 Run Index
When a node runs multiple times (inside a loop or retry), `$runIndex` tracks which run:
- First run: `$runIndex === 0`
- Second run (retry or loop iteration): `$runIndex === 1`
- Use `$runIndex` to implement pagination offsets: `offset = $runIndex * 50`

---

## 3. Error Handling System (Complete)

### 3.1 Error Handling Modes Per Node
Every node in FlowHolt has an **Error Handling** section with these settings:

| Setting | Default | Description |
|---------|---------|-------------|
| **On Error** | `Stop Workflow` | What to do if this node errors |
| **Continue on Error** | Off | Output error as data item instead of stopping |
| **Retry on Fail** | Off | Auto-retry when node fails |
| **Retry Count** | 3 | Number of retry attempts |
| **Retry Wait** | 1000ms | Wait between retries (exponential backoff option) |
| **Timeout (ms)** | 10000 | Max execution time for this node |
| **Execute Once** | Off | Run once for all items instead of per-item |
| **Always Output Data** | Off | Output empty item even if node produces nothing |
| **Notes** | — | Developer notes visible in canvas |
| **Display Note in Flow** | Off | Show notes on canvas node card |

### 3.2 On Error Options
```
stop_workflow  → halt entire workflow, mark execution as failed
continue       → pass error data to next node as $json.error
error_output   → send to a dedicated error output branch
```

**Error output branch:** When "On Error" is set to `error_output`, the node gets a second output connector (red). This lets the workflow handle errors gracefully with a separate path.

### 3.3 Continue on Error — Error Data Shape
When `continue_on_error = true`, error items passed to next node have this structure:
```typescript
{
  json: {
    error: string;           // Error message
    statusCode?: number;     // HTTP status (if HTTP error)
    nodeType?: string;       // Node type that threw
    nodeName?: string;       // Node name that threw
    stack?: string;          // Stack trace (dev mode only)
  }
}
```

### 3.4 Retry with Exponential Backoff
When retry is enabled:
- Attempt 1 fails → wait `retry_wait` ms
- Attempt 2 fails → wait `retry_wait * 2` ms
- Attempt 3 fails → wait `retry_wait * 4` ms
- After all retries exhausted → apply `on_error` behavior

### 3.5 Error Workflow Pattern
An **Error Workflow** is a separate workflow that triggers when the current workflow fails:

**Setup:**
1. Create a separate workflow with **Error Trigger** as the first node
2. In the failed workflow's settings → set `error_workflow` to that workflow's ID
3. When the main workflow fails, FlowHolt calls the error workflow with failure context

**Error Trigger output data:**
```typescript
{
  json: {
    workflow: {
      id: string;
      name: string;
    };
    execution: {
      id: string;
      url: string;          // Link to failed execution in UI
      retryOf?: string;     // If this was a retry
      error: {
        message: string;
        stack: string;
        name: string;       // Error class name
      };
      lastNodeExecuted: string;  // Name of node that failed
    };
  }
}
```

**Error workflow use cases:**
- Send Slack notification when workflow fails
- Create Jira ticket for failed execution
- Save failed data to database for retry
- Alert on-call rotation

### 3.6 Stop and Error Node
**Stop and Error** is a special utility node that:
- **Explicitly halts** the workflow
- Sets execution status to **failed**
- Shows a **custom error message** in the execution log
- Triggers the error workflow if configured

**When to use:**
- Data validation failure (required field missing)
- Business rule violation
- Rate limit exceeded gracefully
- Explicit guard conditions

**Node config:**
```typescript
{
  errorType: "Error Message" | "Error Object",
  errorMessage: string,   // Custom message (errorType = "Error Message")
  errorObject: string,    // JSON object expression (errorType = "Error Object")
}
```

---

## 4. Looping Patterns

### 4.1 Auto-Iteration (Default)
Every node auto-iterates over input items:
```
Input: [{json: {name: "A"}}, {json: {name: "B"}}, {json: {name: "C"}}]
Node runs 3 times → outputs 3 items (one per input)
```

**This is invisible to the user** — the node just "processes all items."

### 4.2 Execute Once Toggle
When **Execute Once** is enabled, the node:
- Runs exactly **once** regardless of how many input items there are
- Receives only the **first item** as `$json`
- All other items are discarded for that node
- Output is a single item

**Use cases:**
- Setting a header that doesn't depend on item data
- Fetching config/lookup data once at the start
- Nodes where the request is the same for all items

### 4.3 Loop Over Items Node (Explicit Batching)
When you need to **process items in batches** or with **controlled iteration**:

**Loop Over Items node:**
- Input: any number of items
- Config: `batchSize` (how many items per loop)
- Output 1 (loop): `batchSize` items — connects to nodes inside the loop
- Output 2 (done): all items after loop completes

```
[A, B, C, D, E, F, G, H, I, J]  (10 items, batchSize=3)
Loop iteration 1: [A, B, C]
Loop iteration 2: [D, E, F]
Loop iteration 3: [G, H, I]
Loop iteration 4: [J]           ← partial last batch
Done output: all original 10 items
```

**Usage pattern:**
```
Loop Over Items (batchSize=10)
    → HTTP Request (processes 10 items)
    → back to Loop Over Items
Done output → next step
```

### 4.4 Wait and Resume Pattern
For long-running loops or human-in-loop scenarios:
1. **Wait node** — pauses workflow execution
2. Resume via webhook, timer, or external trigger
3. `$execution.resumeUrl` — the URL to POST to resume

**Wait node modes:**
- `On Time Interval` — resume after X minutes/hours/days
- `On Date/Time` — resume at a specific datetime
- `On Webhook Call` — resume when someone calls a URL
- `On Chat Message` — resume when user sends chat message
- `On Form Submission` — resume when form is submitted

---

## 5. Branching and Merging Patterns

### 5.1 IF Node
**Condition evaluation with two outputs:**
- Output 1 (true): items where condition passes
- Output 2 (false): items where condition fails

**Condition types:**
| Operator | Type | Description |
|----------|------|-------------|
| `equals` | string/number | Exact match |
| `not equals` | string/number | Not exact match |
| `contains` | string | Substring check |
| `not contains` | string | No substring match |
| `starts with` | string | Prefix check |
| `ends with` | string | Suffix check |
| `matches regex` | string | Regex test |
| `greater than` | number/date | Numeric/date comparison |
| `less than` | number/date | Numeric/date comparison |
| `is empty` | any | null/undefined/""/[] check |
| `is not empty` | any | Non-null/empty check |
| `is true` | boolean | Truthy check |
| `is false` | boolean | Falsy check |

Multiple conditions with AND / OR combinator.

### 5.2 Switch Node
**Route items to different branches based on a value:**
- Up to N output branches (configurable)
- Each branch has a matching rule (equals, contains, regex, etc.)
- **Fallback output** for items matching no rule
- **Mode**: Route to first match OR route to all matches

**Config:**
```typescript
{
  mode: "rules" | "expression",
  rules: Array<{
    outputIndex: number;
    conditions: Condition[];
  }>;
  fallbackOutputIndex: number;  // -1 to discard unmatched
}
```

### 5.3 Merge Node — Complete Modes

**Append** (simplest):
- Combines all input items into one list
- No matching, no pairing — just concatenation
- Input 1: [A, B] + Input 2: [C, D] → [A, B, C, D]

**Combine — Matching Fields**:
- Match items from input 1 with items from input 2 based on field values
- Like a SQL JOIN
- 5 output types:
  - **Keep Matches** (inner join) — only matched pairs
  - **Keep All Input 1** (left join) — all from input 1 + matched from 2
  - **Keep All Input 2** (right join) — all from input 2 + matched from 1
  - **Keep Everything** (full outer join) — all from both, null for non-matches
  - **Enrich Input 1** — input 1 items enriched with matching input 2 data

**Combine — By Position**:
- Pair item 0 from input 1 with item 0 from input 2 (by index)
- Shorter array determines count (or optionally pad with empties)

**Combine — All Possible Combinations** (cross join):
- Every item in input 1 × every item in input 2
- 3 items × 4 items = 12 output items

**SQL Query** (AlaSQL):
- Write SQL queries to merge/join/filter inputs
- Table names: `input1`, `input2`
- Example: `SELECT * FROM input1 JOIN input2 ON input1.id = input2.userId`
- Full SQL support: WHERE, GROUP BY, ORDER BY, LIMIT, etc.

**Choose Branch**:
- Wait for both inputs, then output only one branch's data
- Use when you want to "discard" one path's data after branching

### 5.4 Compare Datasets Node
Specialized merge for data comparison:
- Takes two datasets and shows Added / Removed / Changed / Unchanged items
- Useful for sync workflows, change detection, diff reporting

---

## 6. Sub-Workflows (Execute Sub-Workflow Node)

### 6.1 When to Use Sub-Workflows
- **Code reuse**: Same logic needed in multiple workflows
- **Complexity management**: Break large workflow into smaller focused ones
- **Different triggers**: A scheduled workflow calling a manually-triggerable one
- **Access control**: Limit who can edit core logic vs who can build on it

### 6.2 Execute Sub-Workflow Node — Config
```typescript
{
  workflowId: string;           // Target workflow UUID
  mode: "define" | "once";     // "define" = run for each input item; "once" = run once
  waitForResult: boolean;       // Block until sub-workflow completes
  inputDataMode:                // How to pass data
    "passInputData" |           // Pass current node's input items
    "defineBelow" |             // Define custom fields to pass
    "noData";                   // Don't pass any data
}
```

### 6.3 Sub-Workflow Communication

**Parent → Sub-Workflow:**
- Data is passed via the trigger node of the sub-workflow
- If sub-workflow uses **Execute Workflow Trigger** — it receives the parent's data
- If sub-workflow uses a different trigger — only `workflowId` matters

**Sub-Workflow → Parent:**
- Sub-workflow's final node output is returned to parent
- Parent receives as FlowItems from Execute Sub-Workflow node
- If `waitForResult = false` — parent gets `{ executionId }` only

### 6.4 Execution Linking
When a sub-workflow is called:
- Sub-workflow execution gets `parentExecutionId` metadata
- Both show in execution log as linked executions
- Sub-workflow failure can optionally fail parent (configurable)

### 6.5 Three Input Data Modes
1. **Pass Input Data**: The sub-workflow receives exactly what this node received
2. **Define Below**: Manually define key-value pairs to send (mix of fixed values + expressions)
3. **No Data**: Sub-workflow trigger receives empty item `{json: {}}`

---

## 7. Workflow Publishing System

### 7.1 Draft vs Published States
**Two-state model:**
- **Draft**: What you're editing. Never affects production triggers.
- **Published**: What runs in production. Locked to a specific version.

**Key rule:** Production executions ALWAYS run the published version, even if you have unsaved/unpublished changes in draft.

### 7.2 Publish Button States
| State | Button | Behavior |
|-------|--------|----------|
| No trigger, no changes | Disabled | Nothing to publish |
| Has changes, not published | Active | "Publish" |
| Published, no new changes | Disabled | "Published" indicator |
| Published, has new changes | Active | "Publish changes" |
| Published, has invalid changes | Disabled with warning | Fix errors first |
| Published, has errors | Active with warning | Shows error indicator |

### 7.3 Publish Modal
When user clicks Publish:
1. Modal appears with **version name** (auto-generated UUID by default)
2. User can customize name (max 128 chars)
3. User can add description (max 255 chars, 1-2 sentences)
4. Click Publish → goes live immediately

**Shortcut:** `Shift+P` to publish

**Named versions** (Pro/Enterprise only):
- Dropdown next to Publish button → "Name version" option
- Named versions are protected from automatic pruning
- Visible in version history with name

### 7.4 Unpublish Workflow
Unpublish removes the workflow from production:
- Webhook/form triggers stop responding
- Scheduled executions stop
- Workflow returns to draft-only state

**Where to unpublish:**
- Dropdown next to Publish button in canvas header
- From workflow list page
- From version history page

**Shortcut:** `Ctrl/Cmd+U`

### 7.5 Auto-save Behavior
- Changes save automatically within 1–5 seconds of editing
- Auto-save creates a new version entry in version history
- These draft versions are subject to automatic pruning (keep last 24h / 5 days / unlimited based on plan)
- **Manual "Name version" protects from pruning**

### 7.6 Collaboration / Edit Locking
- Only **one user** can edit a workflow at a time
- Other users see **read-only mode** with "being edited by" indicator
- Edit lock **auto-releases** when editor stops editing or becomes inactive
- Next user can **take over** editing after lock releases

---

## 8. Workflow Settings (Complete Reference)

All settings accessible via Canvas header → three-dot menu → Settings:

| Setting | Type | Description | Plan |
|---------|------|-------------|------|
| **Workflow name** | String | Display name | All |
| **Execution order** | Enum | v0 (legacy) or v1 (recommended) | All |
| **Error Workflow** | Workflow selector | Trigger when workflow fails | All |
| **Timezone** | Timezone selector | Affects cron/schedule expressions | All |
| **Save failed executions** | Boolean | Save production failed executions | All |
| **Save successful executions** | Boolean | Save production success executions | All |
| **Save manual executions** | Boolean | Save manual test executions | All |
| **Save execution progress** | Boolean | Save after each node (enables resume-from-failure) | All |
| **Timeout Workflow** | Duration | Max workflow run time | All |
| **Redact production execution data** | Boolean | Hide payload in execution viewer | Enterprise |
| **Redact manual execution data** | Boolean | Hide payload for manual runs too | Enterprise |
| **Estimated time saved** | Duration | For Insights analytics reporting | Pro/Enterprise |
| **Caller policy** | Enum | "Any workflow", "Specific workflows", "No workflows" | All |

**Caller policy** controls which workflows can call this one as a sub-workflow:
- `Any workflow`: Any other workflow can call this
- `Specific workflows`: Only specified workflow IDs can call it
- `No workflows`: Cannot be used as a sub-workflow

---

## 9. Execution Data Redaction (Enterprise)

### 9.1 What Gets Redacted
When redaction is enabled:
- ✅ Visible: Node names, execution status, timing info, workflow structure
- ❌ Hidden: Input/output data for every node, replaced with `"[REDACTED]"` placeholder
- ❌ Hidden: Binary data (files, images)
- ❌ Hidden: Error messages → only error type + HTTP status preserved

### 9.2 When to Use
- GDPR / SOC2 / HIPAA compliance workflows processing PII
- Cross-department workflows where builder shouldn't see data
- Least-privilege principle enforcement

### 9.3 Required Permission
User needs `workflow:updateRedactionSetting` scope to toggle redaction.

---

## 10. Execution Modes

### 10.1 Manual Execution (Test)
- Triggered by "Execute Workflow" button in Studio
- Uses draft version of workflow
- Supports **data pinning** (pin specific node output for testing)
- Can be partial — **Execute Step** runs just up to a selected node
- Respects `save_manual_executions` setting

### 10.2 Production Execution
- Triggered by active triggers (webhook, schedule, event)
- Always runs **published** version
- Respects `save_production_executions` settings
- Subject to timeout and rate limit settings

### 10.3 Partial Execution
- User right-clicks a node → "Execute Until Here"
- Useful for debugging — test just part of a workflow
- Uses pinned data for nodes before selection

### 10.4 Retry
- Failed production executions can be retried from execution log
- Retry runs the same published version with same input data
- `$execution.retryOf` contains original execution ID

---

## 11. FlowHolt Implementation Checklist

### Error Handling:
- [x] `on_error` setting per node (stop/continue/error_output)
- [x] `continue_on_error` toggle
- [x] `retry_enabled` + `retry_count`
- [ ] Error output branch on canvas (second output connector, red)
- [ ] `error_workflow` trigger when workflow fails
- [x] `Stop and Error` node implementation
- [ ] `timeout_ms` per node enforcement

### Looping:
- [x] Auto-iteration over items (default)
- [x] `execute_once` toggle
- [ ] `Loop Over Items` node (batching with loop-back connector)
- [ ] `$runIndex` injection in expression engine

### Merging:
- [x] IF node with true/false outputs
- [x] Switch node (multi-branch)
- [ ] Merge node — full mode implementation:
  - [x] Append mode
  - [ ] Combine by matching fields (all 5 join types)
  - [ ] Combine by position
  - [ ] All possible combinations (cross-join)
  - [ ] SQL Query mode (AlaSQL)
  - [ ] Choose Branch mode
- [ ] Compare Datasets node

### Sub-Workflows:
- [x] Execute Sub-Workflow node (basic)
- [ ] Execute Workflow Trigger node
- [ ] Execution linking in UI (parent ↔ sub links)
- [ ] Caller policy enforcement

### Publishing:
- [x] Draft/published state
- [x] Publish button with state indicators
- [ ] Publish modal with version name/description
- [ ] Named versions (protected from pruning)
- [ ] Unpublish workflow
- [x] Auto-save behavior
- [ ] Edit lock / collaboration indicator

### Workflow Settings:
- [x] Execution order (v1 default)
- [x] Error workflow selector
- [x] Timezone selector
- [x] Save execution toggles
- [ ] Save execution progress toggle
- [ ] Timeout setting
- [ ] Redact production/manual data (Enterprise)
- [ ] Estimated time saved
- [x] Caller policy
