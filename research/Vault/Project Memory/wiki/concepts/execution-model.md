---
title: Execution Model
type: concept
tags: [execution, runtime, cycles, acid, incomplete, retry, n8n]
sources: [plan-file-19, plan-file-44, make-pdf, n8n-docs]
updated: 2026-04-16
---

# Execution Model

How a workflow run is structured from trigger to completion. Adopted from [[wiki/entities/make]]'s proven model with FlowHolt extensions.

---

## Execution Phases

```
Initialization
    │
    └── Cycle 1
    │       └── Operation (each node)
    │               └── Commit  ← success
    │                   Rollback ← error (if handler says so)
    │
    └── Cycle 2 ... N
    │
Finalization
```

- Each **operation** = one node execution = one credit
- **Commit** persists side effects (data store writes, API calls)
- **Rollback** undoes ACID-tagged operations (data store, database nodes)
- `supports_acid: bool` on `NodeTypeDefinition` — only data store and DB connectors get rollback

---

## Execution Limits (from Make PDF)

| Limit | Value |
|-------|-------|
| Max duration | 40 minutes |
| Max data per step | 5 MB |
| Max objects per search | 3200 |

---

## Incomplete Executions

When execution fails mid-run, an **Incomplete Execution** record is stored.

| Plan | Storage limit |
|------|--------------|
| Free | 10 |
| Pro | 100 |
| Teams | 1,000 |
| Enterprise | 10,000 |

**Auto-retry schedule** (Break handler or system-initiated):
`1m → 10m → 10m → 30m → 30m → 30m → 3h → 3h` (8 attempts, 3 parallel retries max)

---

## Execution States

- `running` — currently executing
- `success` — completed, all operations committed
- `error` — completed with error, handler decided outcome
- `incomplete` — paused for retry or human resume
- `paused` — waiting at a Pause/Human node
- `dead_letter` — exhausted all retries

---

## Run Types

| Type | Trigger | Context |
|------|---------|---------|
| Interactive | Manual from Studio | Test mode, data visible |
| Scheduled | Scheduler / cron | Background, silent |
| Event-driven | Webhook, internal event | Background |
| Resume | Human inbox completion | Continues paused run |
| Replay | User initiates from history | Uses stored trigger data |

---

## Branch Execution Order

Two models (from n8n research — FlowHolt must choose one):

| Model | Behavior | n8n term |
|-------|---------|---------|
| **Depth-first** (recommended) | Complete one branch fully before starting the next. Top-to-bottom, then left-to-right. | v1 (default for new workflows) |
| **Breadth-first** (legacy) | Execute first node of each branch, then second node of each branch, etc. | v0 (pre-1.0 legacy) |

**FlowHolt decision:** Use depth-first as the single execution model (no legacy toggle needed). This is the more intuitive mental model — "follow one path to completion" matches how users reason about conditional flows.

---

## Node-Level Execution Controls

These are per-node settings (from n8n `workflows__components__nodes.md`):

| Setting | Behavior |
|---------|---------|
| **Execute Once** | Run only for the first input item, ignore the rest. Useful when downstream is a single-action node. |
| **Always Output Data** | Emit an empty item if the node produces no output. Prevents downstream null starvation. Dangerous on IF nodes (infinite loop risk). |
| **Retry On Fail** | Auto-retry failed node before escalating to error handler. |
| **On Error: Stop** | Halt entire workflow when this node errors (default). |
| **On Error: Continue** | Pass the last valid data to the next node, skip the error. |
| **On Error: Continue (error output)** | Pass a structured error object to the next node for in-workflow handling. |

**FlowHolt implication:** The "Continue (error output)" mode is a design win — it lets builders construct inline error recovery paths without needing a separate error workflow. This is additive over Make's 5 handlers. Should be added to FlowHolt's node settings design.

---

## Auto-Save vs Publish

From n8n research — critical lifecycle distinction:

- **Auto-save**: every edit saves to a draft within ~1-5 seconds
- **Publish**: locks to a version and makes it live in production
- **Edit lock**: only one user edits at a time; lock releases on inactivity
- **Quota rule**: only production executions count (manual/interactive are free)
- **Sub-workflow executions**: do NOT count toward plan quotas

**FlowHolt already has** Draft→Staging→Production pipeline. Key alignment: interactive (test) runs should not consume workflow execution credits.

---

## Workflow-Level Settings (per workflow)

From n8n `workflows__settings.md` — settings FlowHolt should expose per workflow:

| Setting | n8n has it | FlowHolt status |
|---------|-----------|----------------|
| Error workflow (notification) | ✅ | Planned (error handler) |
| Execution timeout | ✅ | In plan files |
| Timezone | ✅ | Not designed yet |
| Save failed/successful/manual executions | ✅ | Not designed yet |
| Save execution progress (resume on crash) | ✅ | Not designed yet |
| Data redaction per workflow | ✅ | Not designed yet |
| Estimated time saved (for analytics) | ✅ | Not designed yet |
| Caller whitelist (sub-workflow access) | ✅ | Not designed yet |
| Branch execution order | ✅ | Not needed (single model) |

**Key gap:** FlowHolt's settings catalog (`wiki/concepts/settings-catalog.md`) needs a workflow-level scope with these settings. The "save execution progress / resume on crash" setting is particularly powerful for long-running workflows.

---

## Related Pages

- [[wiki/concepts/error-handling]] — what happens when a node fails
- [[wiki/concepts/runtime-operations]] — queue, workers, dead-letter
- [[wiki/concepts/studio-anatomy]] — where Run and Replay buttons live
- [[wiki/concepts/expression-language]] — execution context variables ($json, $input, $now)
- [[wiki/concepts/environment-deployment]] — execution replay across environments
- [[wiki/concepts/settings-catalog]] — workflow-level settings scope
- [[wiki/entities/make]] — source of execution model pattern
- [[wiki/entities/n8n]] — branch execution order, node-level controls
- [[wiki/sources/flowholt-plans]] — plan files 19, 44
