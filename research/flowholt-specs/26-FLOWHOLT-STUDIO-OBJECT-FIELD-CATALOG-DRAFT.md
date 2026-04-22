# FlowHolt Studio Object Field Catalog Draft

This file turns the Studio planning work into object-by-object field group catalogs.

It is grounded in:
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md`
- `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md`
- current FlowHolt Studio code in:
  - `src/components/studio/NodeConfigPanel.tsx`
  - `src/components/studio/WorkflowSettingsModal.tsx`
  - `src/components/studio/WorkflowStudio.tsx`
- Make UI evidence from the local image corpus and flattened PDF reference note

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Node inspector fields | `research/make-help-center-export/pages_markdown/module-settings.md` | Standard vs advanced fields, required vs optional, data types |
| Workflow settings fields | `research/make-help-center-export/pages_markdown/scenario-settings.md` | All workflow-level settings field names |
| AI agent fields | `research/make-help-center-export/pages_markdown/ai-agents-configuration.md` | Agent-specific field catalog (system prompt, context, MCP, tools) |
| Bottom toolbar evidence | `research/make-advanced/02-bottom-toolbar/` | Button layout, visible/hidden states per role |
| Node parameter types | `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_set.md` | Field type definitions in practice |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Node parameter types | `n8n-master/packages/workflow/src/Interfaces.ts` → `INodeProperties`, `INodePropertyTypes` |
| Display conditions | `n8n-master/packages/workflow/src/NodeHelpers.ts` → `displayParameterPath` |
| Node settings UI | `n8n-master/packages/editor-ui/src/components/NodeSettings.vue` |
| Parameter component map | `n8n-master/packages/editor-ui/src/components/ParameterInputFull.vue` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Field grouping | `displayOptions.show/hide` conditional display | Visibility rules in node registry |
| Field types | `string`, `number`, `options`, `collection`, `fixedCollection`, `multiOptions`, `boolean`, `color`, `json`, etc. | Subset in current `node_registry.py` |
| Credential field | `credentialsSelect` type | Vault asset binding (`S1` sensitivity class) |
| Sensitivity tagging | No built-in sensitivity classes | FlowHolt adds M0/M1/M2/S1/S2/R1 classification |
| Required fields | `required: true` per parameter | Same |

### This file feeds into

| File | What it informs |
|------|----------------|
| `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Per-node field definitions (field-level detail) |
| `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Tab behavior based on field groups |
| `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` | Inspector modal structure |
| `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` | Per-family exceptions to default field layout |

---

## Goal

Move from “which panels exist” to “which object types expose which field groups.”

## Catalog model

Each object should define:
- primary tabs
- field groups
- special actions
- sensitive fields
- release or runtime relevance

## 1. Workflow object

### Tabs
- Overview
- Trigger
- Runtime
- Release
- Observability

### Overview field groups
- identity: name, description, category, tags
- ownership: scope, team, workspace later
- lineage: template source, created from AI later

### Trigger field groups
- trigger type
- public exposure
- webhook or chat summary
- schedule summary
- authentication and allowed origins later

### Runtime field groups

Current FlowHolt evidence from `WorkflowSettingsModal.tsx`:
- execution order
- caller policy
- timezone
- timeout
- error workflow id
- save failed executions
- save successful executions
- save manual executions
- save execution progress
- estimated time saved

Planned additions:
- concurrency later
- retention override later
- payload redaction override later

### Release field groups
- current draft version
- staged version
- production version
- compare actions
- approval policy summary
- publish or request promotion

### Observability field groups
- success rate
- average duration
- recent runs
- recent failures
- queue pressure later

## 2. Standard node object

### Tabs
- Parameters
- Settings
- Test

This is already the real current FlowHolt pattern.

### Parameters field groups
- primary business parameters
- required fields
- provider-driven dynamic props
- expression or mapping references
- credential or variable bindings

### Settings field groups
- node-specific advanced settings
- branch and connection targets
- action controls: move, duplicate, delete

### Test field groups
- payload editor
- test result
- output viewer
- pinned data editor
- pinned-data source info

## 3. Condition and branch-capable nodes

### Additional field groups
- true branch target
- false branch target
- compare field
- compare value
- branch labels and descriptions later

## 4. HTTP and integration nodes

### Parameter field groups
- app or provider operation
- resource
- method
- URL or endpoint
- headers
- query params
- body
- auth binding

### Settings field groups
- response handling
- retry later
- error behavior later

### Sensitive fields
- auth secrets
- request body fields marked secret
- response bodies with confidential payloads

## 5. AI agent root node

Current repo evidence already supports cluster-style AI attachments.

### Tabs
- Parameters
- Tools
- Knowledge
- Runtime
- Test

### Parameters field groups
- instructions
- provider
- model
- output mode
- system policy

### Tools field groups
- attached tools
- required vs optional tools
- tool permissions later
- tool timeout later

### Knowledge field groups
- attached knowledge sources
- memory binding
- retrieval mode later

### Runtime field groups
- conversation binding
- structured output schema
- reasoning visibility policy
- retry or fallback later

### Test field groups
- prompt input
- tool trace
- reasoning summary
- structured output preview

## 6. AI attachment nodes

### AI model node

Field groups:
- provider
- model id
- temperature later
- token limits later
- credential binding

### AI memory node

Field groups:
- memory type
- context window
- session key
- retention later

### AI tool node

Field groups:
- tool name
- tool type
- operation config
- auth or access binding

### AI output parser node

Field groups:
- parser type
- strict mode
- schema reference

## 7. Human, callback, and delay nodes

### Delay node

Field groups:
- delay type
- duration
- resume time summary

### Human node

Field groups:
- title
- instructions
- assignee
- choices
- priority
- due time

### Callback node

Field groups:
- instructions
- expected fields
- callback mode
- choices if applicable

These nodes are operationally important because they generate pause state rather than immediate completion.

## 8. Execution-step object

### Tabs
- Summary
- Input
- Output
- Events
- Artifacts

### Field groups
- execution metadata
- status and duration
- payload visibility state
- step output
- error details
- replay action

## 9. Workflow settings modal as current evidence

Current FlowHolt `WorkflowSettingsModal.tsx` already shows a workable grouping model:

Section A:
- execution defaults

Section B:
- execution data persistence

This should be preserved and expanded rather than replaced with a generic settings form.

## 10. Action placement by object

### Workflow object actions
- save
- save version
- compare
- publish or request approval
- run once

### Node object actions
- save changes
- run test
- duplicate
- delete
- move

### Execution-step actions
- replay source execution
- inspect artifacts
- load output into editor later

## Sensitive field classes

Objects with likely sensitive fields:
- workflow trigger exposure settings
- HTTP auth config
- credential bindings
- pinned data
- AI reasoning
- human-task instructions and payloads

## Planning decisions for FlowHolt

- Keep `Parameters`, `Settings`, and `Test` as the standard node baseline.
- Extend AI nodes through added field groups and tabs, not through a fully separate editing paradigm.
- Keep workflow settings grouped by runtime and persistence because the current modal already aligns with a mature model.
- Treat pause-producing nodes as first-class operational objects in the catalog.

## Remaining work

The final field catalog still needs:
- exact field lists per concrete node type
- per-field sensitivity tags
- per-tab role-state rules
- mapping-mode interaction details
