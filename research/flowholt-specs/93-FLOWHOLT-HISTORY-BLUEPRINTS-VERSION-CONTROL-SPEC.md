# Spec 93 — FlowHolt Workflow History, Blueprints & Version Control Deep Spec
**Source research:** Make.com Scenario History, Make Blueprints, n8n Workflow History (covered in prior sprint), Make Scenario Settings, Make Subscenarios
**Status:** Final specification

---

## 1. Overview

FlowHolt needs two complementary systems:
1. **Execution History** — a log of past runs (when they ran, success/failure, credits used, details)
2. **Version History** — saves of the workflow definition itself (blueprint snapshots, rollback, restore)

**n8n approach:** In-editor version history sidebar (last 24h all plans, Pro=5 days, Enterprise=full), named versions, Git source control integration, download JSON
**Make approach:** Separate "History" tab in scenario list view. Shows run entries + change log entries. Details panel to see bundles processed. Export to CSV. Blueprints = JSON export/import (separate from history).

**FlowHolt decision:** Combine both. History tab for execution runs. In-editor Version sidebar for blueprint history. Export as JSON blueprint. Git integration for Enterprise.

---

## 2. Execution History

### 2.1 Location
- **Workflow List view**: Click a workflow → "History" tab (alongside Overview, Settings)
- **Studio editor**: Right rail "Executions" panel with recent run list

### 2.2 Run Entry Data
Each execution history entry displays:
| Field | Description |
|-------|-------------|
| **Date / Time** | When the execution started |
| **Run name** | Auto-generated (or custom if configured) |
| **Trigger type** | Scheduled / Webhook / Manual / Sub-workflow / API |
| **Status** | Success ✓ / Warning ⚠ / Error ✗ |
| **Duration** | Total execution time |
| **Steps run** | Number of nodes that executed |
| **Credits used** | Credit cost of the run |
| **Data transferred** | Size of all input/output bundles in KB/MB |
| **Source run** | Link to parent execution (if triggered by another workflow) |

### 2.3 Change Log Entries
Mixed into the execution history (togglable):
- Scheduling changes
- Workflow edits (with which user made the change)
- Activation / Deactivation
- Version restored

**Toggle options:**
- "Hide check runs" — hide scheduled runs with no new data (empty trigger polls)
- "Hide change log" — show only execution runs, not edit history

### 2.4 Details Drill-Down
Click **Details** on any execution entry → opens Details panel:
1. **Module outputs panel**: Click any node in the execution trace → see its exact output bundles
2. **General info**: Start time, end time, credits, trigger, status
3. **Log view**: Switch between "Simple log" (plain messages) and "Advanced log" (raw bundle data)
4. **Error info**: If errored — which step, which error type, what error message

### 2.5 Column Configuration
User can hide/show columns in History list:
- Credits consumed
- Data transferred
- Source run
- Trigger type

### 2.6 Fulltext Search (Pro+ only)
Search across all execution data for a term:
- Searches within module output bundle values
- Returns matching execution entries with context
- Useful for "did customer X's data pass through this workflow?"

### 2.7 Export History
- Export to CSV button → downloads CSV file
- CSV includes: status, timestamp, user/trigger, step count, credits, duration, link to details

### 2.8 History Retention (by plan)
| Plan | Execution history retention |
|------|-----------------------------|
| Free | 24 hours |
| Pro | 5 days |
| Business | 30 days |
| Enterprise | Configurable (default 1 year) |

Execution details (bundle data) follow the same retention. After expiry, entries remain but "Details" shows "No data available."

---

## 3. Workflow Version History

### 3.1 What is a version?
A version is a saved snapshot of the workflow definition (all nodes, edges, settings, metadata). Equivalent to Make's Blueprint but stored as in-editor history.

### 3.2 When versions are created
Versions are automatically created when:
- User explicitly clicks **Save** (Ctrl+S)
- User **restores** an old version (creates a new version first before restoring)
- User **imports** a blueprint JSON (old version saved before import)
- Git pull overwrites the workflow (Enterprise only)

### 3.3 Version Entry Data
Each version entry shows:
| Field | Description |
|-------|-------------|
| Timestamp | When it was saved |
| Saved by | User who saved |
| Label | Auto-label ("Saved", "Restored from v12") or custom user label |
| Named | Boolean — is this a named/pinned version? |
| Action | Restore / Download / Clone |

### 3.4 Named Versions (Pro+)
- User can "pin" any version with a name (e.g., "Before payment integration")
- Named versions are protected from auto-pruning
- Free plan: no named versions
- Named versions appear with a bookmark icon in the version list

### 3.5 Version History Retention (by plan)
| Plan | Version retention |
|------|------------------|
| Free | Last 3 saves |
| Pro | Last 7 days |
| Business | Last 30 days |
| Enterprise | Full history, unlimited |

### 3.6 Version Actions
| Action | Description |
|--------|-------------|
| **Restore** | Replace current canvas with this version (auto-saves current first) |
| **Download** | Download this version as JSON blueprint file |
| **Clone** | Create a new workflow pre-populated with this version |
| **Compare** | Diff view — what changed between this version and current (Pro+) |
| **Delete** | Remove version (not available for named versions) |

### 3.7 UI Location in Studio
- Right rail panel → "Versions" tab
- Shows version list (newest at top)
- Clicking a version → preview it in "ghost mode" (read-only, original canvas still shown)
- Click "Restore" → replaces canvas, saves current as new version first

---

## 4. Blueprints (JSON Export/Import)

### 4.1 What is a Blueprint
A JSON file containing the complete workflow definition:
- All nodes with their configs (but NOT credential values — only credential references)
- All edges/connections
- Workflow settings (schedule, error handling settings, etc.)
- Metadata (name, description, tags)

### 4.2 Export
- Studio → File menu → "Export as Blueprint"
- OR: Workflow list → ... menu → "Export Blueprint"
- OR: History → any version → "Download"
- Exports as `.flowholt.json` file
- Max export size: **10 MB** (blueprint only; larger workflows may need splitting)

### 4.3 Import
- Workflow list → "Import Blueprint" button (or drag JSON file onto list)
- OR: Studio → File menu → "Import Blueprint"
- Creates a NEW workflow pre-populated from the blueprint
- User must reconnect credentials (credential IDs from source workspace don't exist in target)
- Import warnings shown for: unknown node types, missing integration connections

### 4.4 Clipboard Paste
- Blueprint can be copied to clipboard as JSON text
- Paste into any text editor to share with others or into an LLM for AI assistance
- Import also accepts pasting JSON text directly (not just file upload)
- Make equivalent: documented as useful for "share with LLM to analyze"

### 4.5 Import/Export Use Cases
1. Move workflow from dev to prod workspace
2. Share workflow with community
3. Template system (pre-built workflows as blueprint JSON files)
4. Backup/restore
5. AI assistance (paste blueprint → ask AI to analyze or modify it)
6. Copy workflow across organizations (credentials not included for security)

---

## 5. Scenario Settings (Workflow-Level Config)

Accessible via: Studio → Settings (gear icon) → "Workflow Settings" modal

### 5.1 Sequential Processing
- Default: **OFF** (webhooks + scheduled runs execute in parallel)
- If **ON**: Wait for one execution to complete before starting next
- Applies to webhook-triggered workflows especially (prevents parallel processing)
- Use case: workflows that must process events in order (e.g., financial transactions)

### 5.2 Data Privacy (Confidential Mode)
- Default: **OFF** (execution data stored for debugging/history)
- If **ON**: No execution data stored after run completes (no details panel)
- Trade-off: Cannot debug failures after the fact
- Required for: HIPAA/PCI compliance use cases

### 5.3 Store Incomplete Executions
- Default: **OFF** (on error → rollback)
- If **ON**: On error → execution paused in "Incomplete Executions" folder
- Required for Break error handler functionality
- Data counts toward storage limits

### 5.4 Enable Data Loss
- Default: **OFF** (if incomplete execution can't be saved, execution fails)
- If **ON**: If incomplete execution can't be saved (storage full), drop data and continue
- Use case: continuous streaming workflows where throughput > data retention

### 5.5 Auto Commit (ACID Transactions)
- Default: **ON** (commit changes module-by-module immediately)
- If **OFF**: All changes held until entire execution completes, then committed
- Only affects ACID-capable nodes (Data Store, etc.)
- OFF mode: full rollback possible if any module fails

### 5.6 Commit Trigger Last
- Default: **ON** (trigger module commits last after all others)
- Prevents duplicate processing: trigger marks item as "done" only after workflow success
- If **OFF**: trigger commits in normal sequence order

### 5.7 Max Cycles
- Default: **1**
- How many "batches" of data to process per scheduled run
- Higher values: process more records per scheduled interval (fewer API trigger calls)
- When manually running, always 1 cycle regardless of setting

### 5.8 Consecutive Errors Before Deactivation
- Default: **3** (for scheduled scenarios)
- After N consecutive failing executions: auto-deactivate the workflow
- Instant/webhook triggers: always deactivated immediately after first error
- Rollback handler: auto-stops scheduling after N rollbacks in a row
- User gets notification email when workflow deactivated due to errors

---

## 6. Error Types Reference

All error types FlowHolt must recognize, display, and handle:

| Error Type | Origin | Auto-Retry | HTTP Code |
|-----------|--------|-----------|-----------|
| **AccountValidationError** | Auth failure | No | 401, 403 |
| **BundleValidationError** | Data type mismatch in node config | No | — |
| **ConnectionError** | External service unavailable | Yes (exponential backoff) | 502, 503, 504 |
| **DataError** | Data rejected by third party | No | — |
| **DataSizeLimitExceededError** | Over data transfer quota | No (fatal, disables immediately) | — |
| **DuplicateDataError** | Duplicate record rejected | No | — |
| **IncompleteDataError** | Partial data (upload in progress) | Yes (retry after 20 min) | — |
| **InconsistencyError** | Rollback conflict (concurrent edits) | No (fatal, disables immediately) | — |
| **MaxFileSizeExceededError** | File too large for plan | No | — |
| **ModuleTimeoutError** | Node timeout (40–60 sec window) | Yes (Break handler or incomplete exec) | — |
| **OperationsLimitExceededError** | Out of credits | No (fatal, disables immediately) | — |
| **RateLimitError** | Too many API calls | Yes (exponential backoff) | 429 |
| **RuntimeError** | All other errors from third party | No | — |

### 6.1 Automatic Retry Schedule (for ConnectionError, RateLimitError, ModuleTimeoutError)
1. +1 minute
2. +10 minutes (11 total)
3. +10 minutes (21 total)
4. +30 minutes (51 total)
5. +30 minutes (81 total)
6. +30 minutes (111 total)
7. +3 hours (4h 51m total)
8. +3 hours (7h 51m total)

After all retries fail: mark incomplete execution as **Unresolved** (requires manual intervention).

### 6.2 Fatal Errors (Auto-Deactivate Immediately)
- `DataSizeLimitExceededError`
- `InconsistencyError`
- `OperationsLimitExceededError`

---

## 7. Subscenarios / Sub-Workflows

### 7.1 What they are
- A workflow called FROM another workflow during execution
- Parent workflow calls child workflow via "Execute Workflow" node
- Similar to n8n's "Execute Workflow" node / "Call n8n Workflow" feature

### 7.2 Calling Modes
**Synchronous (default):**
- Parent pauses until child completes
- Child returns outputs to parent
- Parent continues with child's output data
- Use case: data lookup, validation, transformation sub-routines

**Asynchronous:**
- Parent fires child and continues immediately
- Parent receives only the execution ID (not the child's data)
- Child runs independently in background
- Use case: fire-and-forget notifications, background processing

### 7.3 Benefits of Sub-Workflows
1. **Reusability**: Same logic used across multiple parent workflows
2. **Simplicity**: Break large complex workflows into readable pieces
3. **AI Tool exposure**: Sub-workflow can be exposed as a tool for AI Agents to call
4. **Free execution**: FlowHolt sub-workflow calls have reduced/zero credit overhead vs webhook calls

### 7.4 Limitations
- Can only call workflows in the same workspace (for cross-workspace: use webhook trigger)
- Execution depth limit: max 10 levels of nesting (prevent infinite loops)
- Sub-workflow execution NOT counted in parent's Insights metrics (tracked separately)

### 7.5 Execute Workflow Node Config
```
Parameters:
  - workflow: picker (workspace workflows with "subscenario trigger" start node)
  - execution_mode: "synchronous" | "asynchronous"
  - inputs: { key: value mappings }
  - wait_for_completion: boolean (only for async)
  - timeout_ms: number (default: 300000 = 5 minutes)

Output (synchronous): workflow output values
Output (asynchronous): { execution_id: "xxx" }
```

---

## 8. FlowHolt Decision Summary

| Feature | n8n | Make | FlowHolt |
|---------|-----|------|---------|
| Execution history | History panel in workflow | Separate History tab | **Both: editor panel + separate tab** |
| History run details | Click → see node outputs | Click Details → bundle view | **Adopt Make's Details panel (bundles per node)** |
| Fulltext execution search | No | Pro+ only | **Pro+ fulltext search** |
| Export history | — | CSV export | **Adopt CSV export** |
| Version history | In-editor sidebar | No in-editor history | **Adopt n8n in-editor sidebar** |
| Named versions | Yes (Pro+) | No | **Adopt n8n named versions (Pro+)** |
| Download as JSON | Yes | Blueprints (.json) | **Adopt both: in-editor download + blueprint import/export** |
| Git integration | Enterprise (Source Control) | No | **Enterprise Git integration** |
| Sequential processing | "Sequential" webhook option | Scenario setting | **Adopt as workflow setting** |
| Data confidential mode | No | "Data is confidential" setting | **Adopt as privacy/compliance mode** |
| Auto-commit | — | Scenario setting (default ON) | **Adopt as workflow setting (default ON)** |
| Max cycles | — | Scenario setting | **Adopt as workflow setting** |
| Consecutive errors → deactivate | — | Scenario setting (default 3) | **Adopt: configurable, default 3 for scheduled, 1 for instant** |
| Error types taxonomy | Limited | 13 named types | **Adopt Make's 13 error types with FlowHolt equivalents** |
| Sub-workflows | Execute Workflow node | Subscenarios app | **Native sub-workflow support, sync + async** |
