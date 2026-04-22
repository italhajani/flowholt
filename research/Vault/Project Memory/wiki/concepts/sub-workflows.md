---
title: Sub-Workflows
type: concept
tags: [sub-workflows, modular, reuse, execute-workflow, n8n]
sources: [n8n-docs, plan-file-19]
updated: 2026-04-16
---

# Sub-Workflows

Sub-workflows allow one workflow to call another as a subroutine. This enables modular, reusable automation components — the workflow-as-function pattern.

---

## How It Works (n8n model)

```
Parent Workflow
    │
    └── Execute Sub-workflow node
            │  (sends input items)
            ↓
        Sub-Workflow
            ├── Execute Sub-workflow Trigger  ← entry point
            │        input data modes:
            │        - Define using fields (typed schema)
            │        - Define using JSON example
            │        - Accept all data (untyped)
            │
            ├── ... nodes ...
            │
            └── Last node  ← output returned to parent
                    │
                    ↑ (data flows back)
        Parent Workflow continues
```

---

## Input Data Modes

| Mode | Description | Use when |
|------|-------------|---------|
| **Define using fields** | Declare named + typed input fields | Sub-workflow has a well-known contract |
| **Define using JSON example** | Provide example JSON | Contract defined by example |
| **Accept all data** | No input schema enforcement | Quick/flexible / prototyping |

When the sub-workflow uses typed fields, the parent's Execute Workflow node automatically pulls in the field names — no manual wiring needed.

---

## Key Behaviors

- Sub-workflow executions **do not count toward plan quotas** (make unlimited sub-workflow decomposition viable)
- Errors in sub-workflow prevent the parent from triggering it (sub-workflow must be error-free to be callable)
- Execution navigation: parent → "View sub-execution" link → sub-workflow execution; sub-workflow has back-link too
- Each sub-workflow has a **caller whitelist** setting: which workflows can call it (open, workspace-only, or specific IDs)
- Sub-workflow conversion: select nodes in a workflow → right-click → "Convert to sub-workflow" (automatic refactor)

---

## Sub-Workflow Conversion Rules

When extracting nodes to a sub-workflow:
- Selection must be **continuous** (no gaps)
- Must have **at most one entry node** (one incoming connection from outside selection)
- Must have **at most one exit node** (one outgoing connection to outside selection)
- Must **not include trigger nodes**
- Cannot use IF or Merge nodes as the exit node (multiple output branches not allowed)

---

## FlowHolt Design Implications

### What to adopt
1. **Typed input schema** on sub-workflow entry — enables IDE-like autocomplete in parent when wiring inputs
2. **Sub-workflow executions outside quota** — same as n8n; incentivizes good decomposition
3. **Execute Sub-workflow node** — call by ID, URL, or from a workspace library
4. **Caller whitelist** per sub-workflow — access control without full RBAC overhead
5. **Sub-workflow conversion** UX — select → extract; highly desirable for refactoring
6. **Parent↔child execution navigation** — cross-execution links in Executions view

### New plan file needed
`51-FLOWHOLT-SUB-WORKFLOW-SPEC.md` — full specification for:
- Sub-workflow node UI (how to search/select/configure target)
- Entry trigger UI (field definition interface)
- Typed I/O contract (schema definition, validation, error messages)
- Caller whitelist enforcement
- Quota rules
- Conversion UX

### Open question
Should sub-workflows have their own version lifecycle (Draft→Staging→Production)? n8n treats them as ordinary workflows (same publish flow). Make doesn't have sub-workflows at all. FlowHolt should probably treat them as full first-class workflows with the same environment pipeline — a sub-workflow that's only in Draft cannot be called by a Production workflow.

---

## Related Pages

- [[wiki/concepts/execution-model]] — sub-workflow executions outside quota, execution phases
- [[wiki/concepts/environment-deployment]] — environment-scoped sub-workflow calling
- [[wiki/concepts/permissions-governance]] — caller whitelist, who can create/edit sub-workflows
- [[wiki/concepts/expression-language]] — sub-workflow parameter mapping uses expression syntax
- [[wiki/concepts/runtime-operations]] — sub-workflow execution tracking and dead-letter handling
- [[wiki/data/open-decisions]] — sub-workflow versioning decision
- [[wiki/entities/n8n]] — Execute Workflow + Execute Sub-workflow Trigger nodes
- [[wiki/sources/flowholt-plans]] — plan file 19 (execution model), pending file 51
