# FlowHolt Studio Tab Role States And Mapping

This file extends the node inventory into exact tab behavior, role-state rules, and mapping-mode interaction design.

It is grounded in:
- `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md`
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md`
- `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md`
- current Studio inspector behavior in `src/components/studio/NodeConfigPanel.tsx`
- local Make UI evidence, especially:
  - `research/make-help-center-export/assets/images/E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png`
  - `research/make-help-center-export/assets/images/FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Node inspector behavior | `research/make-help-center-export/pages_markdown/module-settings.md` | Standard vs advanced field display, required/optional, read-only state |
| Workflow-level confidentiality | `research/make-help-center-export/pages_markdown/scenario-settings.md` | Data is confidential setting, incomplete execution behavior |
| AI agent inspector fields | `research/make-help-center-export/pages_markdown/ai-agents-configuration.md` | System prompt, context, MCP tool visibility |
| Execution data pinning | `research/n8n-docs-export/pages_markdown/workflows__executions__manual-partial-and-production-executions.md` | Pinning output data, partial execution, debug in editor |
| Role-by-surface rules | `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` | Which roles see/edit which Studio surfaces |
| Node field inventory | `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Field keys, sensitivity classes M0–S2 per node family |
| Studio inspector modal | `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` | Panel and modal structure |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Node settings panel | `n8n-master/packages/editor-ui/src/components/NodeSettings.vue` |
| Parameter input rendering | `n8n-master/packages/editor-ui/src/components/ParameterInputFull.vue` |
| Display conditions | `n8n-master/packages/workflow/src/NodeHelpers.ts` → `displayParameterPath` |
| Credential field rendering | `n8n-master/packages/editor-ui/src/components/CredentialsSelect.vue` |
| Pinned data handling | `n8n-master/packages/editor-ui/src/composables/usePinnedData.ts` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Tab model | Parameters / Settings / (no separate Test tab — uses inline run) | Parameters / Settings / Test (explicit test tab with pinned data) |
| Field visibility per role | No role-gated fields in open source; Enterprise adds field-level RBAC | M0–S2 sensitivity classes with per-role visibility rules |
| Credential field display | Dropdown select with OAuth connect button | Vault asset reference chip (never reveals raw secret) |
| Pinned data | Per-node pinned output data, affects downstream testing | Same pattern; affects editor previews, test runs, and manual draft runs |
| Mapping mode | Drag-from-output-panel to field | Expression editor with output panel reference |

### This file feeds into

| File | What it informs |
|------|----------------|
| `33-FLOWHOLT-STUDIO-NODE-FAMILY-TAB-EXCEPTIONS.md` | Per-family deviations from the baseline tab-state model |
| `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` | Tab-state capability bundle fields |
| `26-FLOWHOLT-STUDIO-OBJECT-FIELD-CATALOG-DRAFT.md` | Field group definitions per object type |

---

## Goal

Define how the Studio inspector should behave when:
- the selected node has sensitive fields
- the user can view but not edit
- mapping expressions are being authored
- test and pinned-data features are available but governed

## Current baseline from the repo

Current Studio evidence is already strong:
- node tabs are `Parameters`, `Settings`, and `Test`
- validation and preview are live
- test payload, preview output, and pinned data already exist
- pinned data is already described in-product as affecting editor previews, test runs, and manual draft runs

The plan should preserve this baseline and tighten the access and interaction rules around it.

## 1. Global tab-state model

Every selected node should resolve tab state independently for:
- visibility
- editability
- data redaction
- save eligibility

## Standard tab-state outcomes

- `hidden`: tab does not render
- `visible_readonly`: tab renders but fields cannot change
- `visible_masked`: tab renders, some fields are masked or summarized
- `visible_actionable`: tab renders and supports mutation
- `visible_actionable_limited`: tab renders and permits only non-sensitive changes

## 2. Parameters tab rules

### Purpose

The `Parameters` tab is for business logic, primary node config, and expression mapping.

### Viewer state

- can view `M0` and `M1` fields in readonly mode
- can view `M2` fields only if object visibility permits them
- sees `S1` fields as asset references only
- never sees `S2` raw values
- can open mapping references in readonly mode but cannot insert expressions

### Builder state

- can edit all draft-safe fields
- can bind to connections, credentials, variables, and member references
- can author expressions
- can save expression-bearing changes only if validation passes

### Publisher or admin state

- same as builder for draft-safe edits
- gains access to public-trigger exposure fields and production-adjacent controls only when workflow policy allows

## Parameters-tab field rendering rules

- `M0`: normal field control
- `M1`: normal field control with policy hints where relevant
- `M2`: standard control in edit mode, summarized or masked in restricted read mode
- `S1`: bound asset chip with scope, access, and health metadata
- `S2`: write-only masked control with rotate or replace affordance later
- `R1`: summary only in Parameters; deep runtime content belongs in Test or execution surfaces

## 3. Settings tab rules

### Purpose

The `Settings` tab is for advanced execution behavior, retry, branch metadata, and operational knobs.

### Viewer state

- visible in readonly mode
- policy-sensitive toggles show current value and a denial reason when not editable

### Builder state

- can edit non-release operational fields
- can configure retry and timeout behavior
- cannot bypass environment or publish policy through node-local settings

### Publisher or admin state

- can edit release-adjacent node settings if workflow capabilities allow them
- can change trigger exposure and policy-affected advanced settings only when policy explicitly permits

## Settings-tab planning rule

The `Settings` tab should be the main location for:
- retry and timeout
- branch labels and output keys
- exposure, response, and retention toggles
- advanced AI runtime options

It should not become a dumping ground for secrets or execution payloads.

## 4. Test tab rules

### Purpose

The `Test` tab is the bridge between authoring and runtime.

### Contents

- test payload editor
- run-test action
- validation status
- test output
- sample output preview
- pinned-data controls

### Viewer state

- may see status summary
- may see sample output only if execution visibility rules allow it
- cannot run tests
- cannot pin or unpin runtime data

### Builder state

- can run tests when `workflow.test` is allowed
- can see preview and test output subject to execution redaction rules
- can pin latest data only with `workflow.pinRuntimeData`

### Restricted execution visibility state

Even when the user can edit the node:
- preview output may render as redacted summary
- pinned data may be represented as “stored runtime sample exists” without full body
- raw test output may be hidden while success or failure metadata remains visible

## 5. Pinned-data rules

Pinned data is currently surfaced inside `Test`. That is correct, but it needs stronger policy.

### Allowed actions

- `pin latest output`
- `save pinned JSON`
- `replace pinned JSON`
- `unpin`

### Policy model

- requires `workflow.pinRuntimeData`
- also requires payload visibility compatible with the source data
- production-linked workflows may require stronger permission than normal draft nodes

### UI behavior

- no permission: hide pin and unpin actions, show readonly provenance summary
- partial permission: allow existing pinned-data presence indicator but mask body
- full permission: full pinned-data editor and viewer

## 6. Mapping-mode interaction

### Current repo evidence

The current inspector already has:
- expression builder support
- field-level expression validation
- searchable data references
- previews for expression templates

The plan should formalize this into a stable mapping mode.

## Mapping-mode behaviors

### Entering mapping mode

A field enters mapping mode when:
- the field supports expressions
- the user clicks an expression affordance
- or the current value already contains expression syntax

### Mapping-side panel contents

- upstream node data references
- input namespace
- recent runtime preview fields
- asset and member bindings where valid
- search and filter

### Insertion rules

- insert by click for simple paths
- insert with explicit preview for structured expressions
- keep the raw template visible in the field itself

### Validation rules

- invalid expressions block save
- warnings do not block save
- errors should automatically return focus to the first invalid field in `Parameters`

## 7. Per-node family tab rules

### Trigger nodes

- `Parameters`: always visible
- `Settings`: visible for advanced trigger behavior
- `Test`: visible only for draft preview and sample payload inspection, not for public trigger activation

### Data and logic nodes

- all three tabs visible
- `Test` is usually the main place for payload inspection

### Pause-producing nodes

- `Parameters`: visible
- `Settings`: visible with timeout and escalation controls
- `Test`: visible, but include a pause-impact banner explaining that test runs create simulated pause behavior only

### AI nodes

- `Parameters`: visible
- `Settings`: visible
- `Test`: visible with extra trace summary blocks

Planning note:
- AI nodes should not get a separate top-level tab family. Extend the baseline with AI sections and trace summaries.

## 8. Footer action rules

Current repo evidence shows:
- `Run test` in the footer when `Test` is active
- `Save` in the footer otherwise

This should stay, with policy-aware variations:
- `Save` when editable
- `Save disabled` with reason when denied
- `Run test` when allowed
- `Run test disabled` with reason when policy blocks testing
- no footer mutation buttons for view-only users

## 9. Build priorities

Implement these next:
- field-level sensitivity metadata in the node editor response
- tab-level capability resolution in Studio
- pinned-data masking states
- stable mapping-mode entry, preview, and error focus behavior

## Remaining work

The final plan still needs:
- exact response fields to carry per-field sensitivity and per-tab capability
- AI trace summary versus raw reasoning rendering rules
- workflow-level overrides that affect node test visibility
