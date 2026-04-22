# 48 — FlowHolt Remaining Make Corpus Gaps Synthesis

Source: Make corpus pages not yet absorbed in planning files 01–47:
- `research/make-help-center-export/pages_markdown/if-else-and-merge.md`
- `research/make-help-center-export/pages_markdown/converger.md`
- `research/make-help-center-export/pages_markdown/types-of-warnings.md`
- Make PDF pages 215–222 (item data types)
- Make PDF pages 223–228 (type coercion)
- `research/make-help-center-export/pages_markdown/scenario-notes.md`
- `research/make-help-center-export/pages_markdown/custom-scenario-properties.md`
- `research/make-help-center-export/pages_markdown/restore-and-recover-scenario.md` (Scenario recovery section)
- `research/make-help-center-export/pages_markdown/scenario-sharing.md`
- `research/make-help-center-export/pages_markdown/make-devtool.md`
- Make PDF pages 212–213 (select-the-first-bundle-to-process)

Status: initial synthesis — these gaps fill in the remaining spaces not covered by files 01–47

---

## Cross-Reference Map

### This file is grounded in (raw sources per section)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| §1 If-else and Merge | `research/make-help-center-export/pages_markdown/if-else-and-merge.md` | First-true semantics, Else route required, Merge reconnects |
| §1 If-else | `research/make-help-center-export/pages_markdown/new-feature-if-else-and-merge.md` | Release note, 2025 open beta |
| §2 Type coercion | `research/make-pdf-full.txt` pages 223–228 | Implicit type conversion rules |
| §3 Item data types | `research/make-pdf-full.txt` pages 215–222 | Make's data type system |
| §4 Scenario notes | `research/make-help-center-export/pages_markdown/scenario-notes.md` | Notes panel in editor |
| §5 Custom properties | `research/make-help-center-export/pages_markdown/custom-scenario-properties.md` | Custom metadata fields on scenarios |
| §6 Scenario sharing | `research/make-help-center-export/pages_markdown/scenario-sharing.md` | Share to team/template |
| §7 DevTool | `research/make-help-center-export/pages_markdown/make-devtool.md` | Browser devtool for debugging |
| §8 Warnings | `research/make-help-center-export/pages_markdown/types-of-warnings.md` | Warning types (non-fatal) |

### n8n comparison

| Feature | n8n | FlowHolt (from this file) |
|---------|-----|--------------------------|
| If-else node | Standard If node (2 branches) | Adopt Make's If-else semantics for Switch: first-true routing + Else route required |
| Merge | Merge node (5 strategies) | Merge node already planned — add "active route only" mode (Make pattern) |
| Type coercion | Explicit JS type conversion in expressions | Plan coercion helpers: `toNumber()`, `toBoolean()`, `toString()` |
| Custom scenario properties | No equivalent | Custom metadata fields on workflow (tags, properties dict) |
| DevTool | No built-in devtool | Plan: FlowHolt Studio debug mode (output inspector + expression evaluator) |

### This file feeds into

| File | What it informs |
|------|----------------|
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | If-else semantics → Switch node improvement |
| `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` | Type coercion helpers |
| `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | Scenario notes panel → Canvas annotations |
| `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Item data types → field type system |

---

Source: Make corpus `if-else-and-merge.md` (2025 Open Beta → now production); release note `new-feature-if-else-and-merge.md`

### 1.1 Background

Make originally had only a **Router** for conditional routing — split into multiple routes, each with a filter condition, and all routes run in defined order. Routes cannot be reconnected after the Router.

In 2025 Make introduced **If-else** as a fundamentally different routing mechanism:

| Feature | If-else module | Router module |
|---|---|---|
| Runs which routes | First condition that is true | All routes in defined order |
| Else route | Required (always present) | None |
| Routes can be merged | Yes — via Merge module | No |
| Nested routing | Forbidden (no Router/If-else after If-else) | Allowed |
| Credit usage | Uses operations, no credits | Uses operations, no credits |

### 1.2 If-else module semantics

- Splits the scenario flow into conditional paths
- Conditions are evaluated **top to bottom**, first true condition wins; if none match, the **Else** route runs
- Must have exactly **one condition route** and **one else route** at minimum — these cannot be deleted
- Additional condition routes can be added (no documented limit)
- Conditions labeled by the user (e.g. "Above $100 limit")
- Condition structure: value / operator / value (same operator model as filters)
- The If-else module itself uses operations but does **not** consume credits

### 1.3 Merge module semantics

- Reconnects the output of all If-else routes into a single flow
- Passes data from the **active route only** to subsequent steps
- One output per condition (If 1st condition is true → Output value; Else → Output value)
- If a condition route has no modules, Make inserts a **Do Nothing** module — data still passes through
- Merge can only be added **after** an If-else module is configured
- Merge module also uses operations but does **not** consume credits

### 1.4 Restrictions

- You **cannot** add a Router module or another If-else module after an If-else module (before the Merge)
- The last module on each route **cannot** be deleted (prevents broken graph)
- The Merge module is not available until an If-else flow is fully set up

### 1.5 FlowHolt design implications

#### 1.5.1 New node types to add to `flow_control` family

Two new node types need to be added to the node registry (extend file 27 and file 33):

**`if_else` node**
```
Family: flow_control
Sub-type: conditional_split
Fields:
  - conditions: list[{ label: str, rules: FilterRuleList }]  M1
  - else_label: str  (optional label for else route)  M2
Behavior:
  - Emits exactly one output bundle per execution (the first matching route)
  - Route count ≥ 2 (condition + else)
  - Cannot have Router/if_else as direct downstream (validation rule)
Credit usage: 0 (same as Make)
```

**`route_merge` node** (distinct from the existing `merge` data-join node in file 27)
```
Family: flow_control
Sub-type: route_converger
Fields:
  - outputs: list[{ condition_label: str, output_name: str, value_mapping: Expression }]  M1
Behavior:
  - Can only be placed as a downstream node of an if_else node's routes
  - Reconnects all if_else routes into a single downstream flow
  - Emits one bundle per execution (the data from the active route)
  - Graph validation ensures every if_else route connects to the same route_merge node
Credit usage: 0
```

Note: FlowHolt's existing `merge` node (a data-join node) is a **different node** from `route_merge`. The naming should be clearly differentiated in the Studio node picker.

#### 1.5.2 Studio canvas rendering

The `if_else` node renders as a fan-out (like Router) but with:
- A numbered condition label on each route edge
- An "Else" label on the final route
- A visual indicator that routes reconnect (dashed-line suggestion toward the `route_merge` node)

The `route_merge` node renders as a fan-in — converging multiple incoming route edges into a single outgoing edge.

#### 1.5.3 Tab exceptions (extend file 33)

`if_else` and `route_merge` nodes:
- **Parameters tab**: shows condition rows / output mappings
- **Settings tab**: minimal — error behavior only
- **Test tab**: shows which condition was true on last test run; shows the output bundle passed through

---

## 2. Converger pattern — native solutions

Source: Make corpus `converger.md`

### 2.1 Make's position

Make **has no native Converger module**. The Converger is a concept requested by users: a module that accepts data from multiple routes and passes it as a single output, the counterpart to a Router. Make's `converger.md` documents three workarounds:

1. **Data store workaround**: each route writes its data to a data store record; an extra filter-free route reads it back at the start of the common sequence
2. **JSON + variable workaround**: serialize data as JSON, store in a `set_variable`, read back with `get_variable` + `parse_json`
3. **Set variable shortcut**: for single scalar values, just use `set_variable` / `get_variable`
4. **Webhook subscenario**: put the common sequence in a separate scenario, call it via HTTP + Webhook at the end of each route

### 2.2 FlowHolt design implications

#### 2.2.1 If-else + route_merge solves Make's main use case

With the new `if_else` + `route_merge` node pair (section 1 above), FlowHolt provides a **native converger** for conditional flows. This is a direct improvement over Make.

#### 2.2.2 Router convergence still has no native solution

For the **Router** (which runs all routes), convergence is still needed when the common sequence should run once after all routes complete. Options for FlowHolt:

**Option A (Make-compatible workaround)**: Document variables and data stores as the official workaround pattern. No new node type needed.

**Option B (FlowHolt extension)**: Add a `route_barrier` or `join` node type that waits for all upstream router branches to complete before emitting a single merged bundle. This is closer to n8n's "Merge" behavior (all-paths wait). This is a Phase 2+ enhancement.

#### 2.2.3 Planning decision: native join node

**Open decision #20**: Should FlowHolt add a `route_barrier` / `join` node that waits for all Router routes to complete? This would differentiate FlowHolt from Make (which never had a native converger) and align with n8n's merge patterns. Flag for n8n research phase.

---

## 3. Types of warnings — official warning taxonomy

Source: Make corpus `types-of-warnings.md`

### 3.1 Warnings vs. errors — the conceptual distinction

In Make (and FlowHolt), a **warning** is an execution outcome that is distinct from an error:

| Attribute | Error | Warning |
|---|---|---|
| Increments consecutive error counter | Yes | **No** |
| Disables scenario scheduling | Yes (at threshold) | **No** |
| Creates incomplete execution | Depends on handler | Depends (Break creates IE as warning) |
| Visual indicator on module | Red error badge | Yellow/orange warning badge |
| Origin | Unhandled exception | Handled exception, or platform limit hit |

The key rule: **a warning keeps the scenario running/scheduled**. Errors threaten scheduling continuity; warnings do not.

### 3.2 How warnings are produced

A warning is produced when:
1. **An error handler activates** — the Break handler activates and stores an incomplete execution. The original error is "handled" and becomes a warning on the module.
2. **A platform execution limit is hit** — the scenario runs too long or storage fills up.

### 3.3 Warning types

Make defines exactly **2 official warning types**:

#### ExecutionInterruptedError (as warning)
- Triggered when a scenario run exceeds the **40-minute execution time limit** (5 minutes on Free plan)
- The module currently processing data emits the warning
- The scenario **ends with a warning** — remaining unprocessed bundles are dropped
- Scheduling **continues** (next scheduled run will still fire)
- Fix strategies: split the scenario, reduce Limit on search modules, use batch API endpoints

#### OutOfSpaceError (as warning)
- Triggered by data store modules when Make cannot store more data (data store capacity exceeded)
- Also triggered when **incomplete execution storage** is full
- The scenario **ends with a warning** — remaining bundles are dropped
- Scheduling **continues**
- Fix strategies: use a backup data store with Resume handler, clear old data store records, review plan limits

### 3.4 File 44 extension — add warnings section to error handling spec

File 44 (Error Handling and Resilience Spec) mentions warnings briefly (warning does not count toward consecutive errors) but does not define the warning taxonomy. The following additions are needed in file 44:

#### Additions to file 44, Section: Warning taxonomy

```
## Warning type taxonomy

### ExecutionInterruptedWarning
- ID: ExecutionInterruptedError (treated as warning, not error)
- Trigger: execution duration > 40 min (5 min on Free plan)
- Effect: scenario ends, remaining bundles dropped, scheduling continues
- FlowHolt mapping: same limits apply. Duration tracked by executor.
  - Free plan: 5-min steps limit (matches Make)
  - Growth/Teams/Enterprise: 40-min limit (matches Make)
  - Open decision #21: Should Enterprise orgs get configurable timeout up to 60 min?

### OutOfSpaceWarning
- ID: OutOfSpaceError (treated as warning in some contexts)
- Trigger: data store capacity exceeded OR incomplete execution storage full
- Effect: scenario ends, remaining bundles dropped, scheduling continues
- FlowHolt mapping:
  - Data store capacity limits defined in file 45 (per-plan limits apply)
  - Incomplete execution storage limits defined in file 44 (10–10,000 per plan)
  - Resume handler with backup data store is the recommended mitigation
```

### 3.5 Visual distinction in FlowHolt Studio

Studio execution results should display warnings differently from errors:
- **Error state**: red module border + red badge + "Run ended with error" in status bar
- **Warning state**: yellow/amber module border + amber badge + "Run ended with warning" in status bar
- Warning runs **do NOT increment the consecutive error counter** (already specified in file 44 Section 8 — confirmed consistent)

---

## 4. Item data types and type coercion

Source: Make PDF pages 215–228; `item-data-types.md`, `type-coercion.md`

### 4.1 The 7 Make data types

Make defines 7 primitive/compound data types used by module fields:

| Type | Description | Notes |
|---|---|---|
| `text` (string) | Letters, numbers, special chars; names, emails, prompts | Length-validated |
| `number` | Numerical characters; quantities, prices, phone, ages | Range-validated by field; must be explicit or may be treated as text |
| `boolean` | Yes/No; two possible values only | Rendered as yes/no radio or toggle |
| `date` | Date or datetime in ISO 8601; locale/tz from user profile | Calendar picker in module settings |
| `buffer` | Binary data; file content, images, video | Automatically converts text↔binary |
| `collection` | Key-value pairs; nested objects | Represented as JSON object |
| `array` | Ordered list of items; can contain primitives or collections | Rendered with index bracket notation |

Note: `buffer` is the FlowHolt/Make equivalent of binary/file data — it is NOT a separate "file" type in the expression system; it IS the file content representation.

### 4.2 Data validation rules

- Make validates that mapped values match the field's expected type
- If validation fails → `DataError` (a system error, halts the module, can be handled with Resume handler)
- Common validation failures:
  - Text where Number expected ("100 units" → number field)
  - Array mapped to a text field (without coercion)
  - Improperly-formatted date string
- Before validation fails, Make tries **type coercion** (automatic conversion)

### 4.3 Type coercion rules

Type coercion is Make's automatic data type conversion when the expected and received types do not match. Complete coercion table:

#### When Array is expected:
| Received | Behavior |
|---|---|
| array | Passed unchanged |
| other (any) | Wrapped as single-element array `[value]` |

#### When Boolean is expected:
| Received | Behavior |
|---|---|
| boolean | Passed unchanged |
| number | Converted to `true` (even if 0) |
| text | `"false"` or empty string → `false`; anything else → `true` |
| other | `true` if value exists (not null) |

#### When Buffer is expected:
| Received | Behavior |
|---|---|
| buffer | Passed unchanged (if same codepage); otherwise transcoded |
| boolean | Converted to text (`"true"`/`"false"`) then to binary |
| date | Converted to ISO 8601 text then to binary |
| number | Converted to text then to binary |
| text | Encoded to binary (default: utf8) |
| other | Validation error |

#### When Collection is expected:
| Received | Behavior |
|---|---|
| collection | Passed unchanged |
| other | Validation error |

#### When Date is expected:
| Received | Behavior |
|---|---|
| date | Passed unchanged |
| text | Attempted parse; error if fails; must include day/month/year |
| number | Treated as milliseconds since Jan 1, 1970 UTC |
| other | Validation error |

#### When Number is expected:
| Received | Behavior |
|---|---|
| number | Passed unchanged |
| text | Attempted parse; error if fails |
| other | Validation error |

#### When Text is expected:
| Received | Behavior |
|---|---|
| text | Passed unchanged |
| array | Converted if array supports text conversion; else validation error |
| collection | Converted to JSON string (arrays of collections → comma-separated) |
| boolean | `"true"` or `"false"` |
| buffer | Converted to text if encoding is specified; else validation error |
| date | Converted to ISO 8601 text |
| number | Converted to string |

#### Accepted date text formats (from Make corpus):
```
2016-06-20T17:26:44.356Z
2016-06-20 19:26:44 GMT+02:00
2016-06-20 17:26:44
2016-06-20
2016/06/20 17:26:44
06/20/2016 17:26:44
20.6.2016 17:26:44
```

### 4.4 FlowHolt expression language type system (extend file 45)

File 45 defines FlowHolt's expression language as using `{{ }}` templates with 7 function categories. The following additions are needed:

**The FlowHolt expression evaluator must implement Make-compatible type coercion** as the default behavior when mapping between node fields. This ensures:
1. Scenarios imported from Make-compatible blueprints behave identically
2. Users familiar with Make behavior face no surprises

FlowHolt should also expose the type of each field and each output value in the Studio inspector, following Make's behavior (hovering a field shows its type label).

**`DataError`** should be part of FlowHolt's error taxonomy (already partially in file 44 as `WorkflowValidationError`) — specifically for type validation failures at the node field level during execution.

**ISO 8601 date display**: Date values should be rendered in ISO 8601 when hovering/inspecting output bundles in the Test tab, matching Make's behavior.

### 4.5 Select first bundle — trigger start position

Source: Make PDF Section 2.3.6

When a trigger module is configured, a panel auto-appears after first save (or right-click → "Select first bundle") with options:

| Option | Description |
|---|---|
| From now on (default) | Process only new bundles from this moment forward |
| Since specific date | Process all bundles after a specified date/time |
| With ID ≥ N | Process all bundles with ID ≥ a specified value |
| All bundles | Process all available bundles |
| Select first bundle | Manually pick the starting bundle from a list |

**FlowHolt design**: Trigger node settings (Parameters tab, at node level) should include a **"Process from"** configuration section with these options. The default is "From now on." This is relevant to the `trigger` node family tab exceptions in file 33.

---

## 5. Scenario notes — Studio canvas annotations

Source: Make corpus `scenario-notes.md`

### 5.1 What scenario notes are

Scenario notes are rich-text annotations that can be attached to:
- **Individual modules** (any node on the canvas)
- **Route connectors** (edges between nodes)

They serve as documentation, inline instructions, or context for collaborators.

### 5.2 Limits and format

- Up to **200 notes per module** or per route
- Each note: up to **10,000 characters**
- Format: HTML (Make stores notes as HTML; extra formatting consumes more characters)
- Supported formatting: bold, italic, links, emojis via formatting toolbar
- Notes are **NOT included** when a workflow is:
  - Cloned (confirmed by Make corpus)
  - Shared via a public link (confirmed)
  - Exported as a blueprint (confirmed)

Notes are deliberately excluded from sharing to prevent accidental leakage of internal documentation.

### 5.3 Interaction model

| Action | Visual result |
|---|---|
| Hover over note marker | Preview tooltip |
| Single click on note marker | Full note content (scrollable) |
| Click sticky-note icon in toolbar | Notes panel showing all note previews |
| Right-click module → "Add a note" | Creates new note attached to module |
| Click note → 3-dot menu → Edit | Edit note in-place |

When a note is attached:
- A **note marker badge** (sticky-note icon) appears on the module corner
- On routes, a **small indicator** appears on the route edge

### 5.4 FlowHolt Studio design implications

#### 5.4.1 Note storage model
Notes are per-workflow and attached to specific node IDs or edge IDs within the workflow graph. Storage:
```
WorkflowNote
  - id
  - workflow_id
  - node_id | edge_id (one of the two)
  - content: str (HTML, max 10,000 chars)
  - created_by: user_id
  - created_at
  - updated_at
```
A `WorkflowNote` is part of the **workflow content** (included in the blueprint / version save) but **excluded from clone and share operations** by explicit policy.

#### 5.4.2 Studio canvas rendering
- Node note markers: small sticky-note icon in the top corner of the node card
- Route note markers: indicator dot on the edge line
- Note panel (toolbar icon): slide-in/overlay panel listing all notes in the workflow with their attached node/route label

#### 5.4.3 Relationship to Studio component files
- `WorkflowStudio.tsx` needs a "notes panel" toggle state
- `NodeConfigPanel.tsx` shows a "Notes" section at the bottom (list of notes on this node) OR notes live entirely on the canvas (not inside the config panel) — Make keeps notes on the canvas, not inside the inspection panel
- A dedicated `WorkflowNotesPanel.tsx` component for the notes sidebar

---

## 6. Custom scenario properties — org-level workflow metadata

Source: Make corpus `custom-scenario-properties.md`

### 6.1 What custom scenario properties are

Custom scenario properties (Make's term) / **custom workflow properties** (FlowHolt term) are admin-defined metadata fields that all organization members can apply to workflows and use to filter and sort the workflow list.

This is an **Enterprise-tier** feature in Make. FlowHolt should gate it at Teams or Enterprise.

### 6.2 Field types supported

| Field type | Description |
|---|---|
| Short text | Up to 200 characters; good for email, URLs |
| Long text | Up to 1,000 characters; multi-line |
| Number | Integer values |
| Boolean | Yes/No (radio buttons in UI) |
| Date | Date and time (ISO 8601) |
| Dropdown | Single-select list |
| Multichoice | Multi-select list |

### 6.3 Property definition fields

Each property definition has:
- **Name** — unique internal identifier (org-scoped, not shown to users applying the property)
- **Label** — display name shown in the workflow list table and detail page
- **Hint text** — short helper message for org members
- **Field type** — one of the 7 above
- **Required** — if Yes, org members must fill this field when applying properties

### 6.4 Where it lives

Properties are **created and managed** at:
- Org Dashboard → "Workflow properties" tab
- Only org owners and admins can create/manage properties

Properties are **applied and edited** at:
- Workflow list → 3-dot menu → "Edit properties"
- Workflow detail page

### 6.5 Workflow list table integration

When custom properties are defined:
- The workflow list switches between **List view** and **Table view**
- In Table view, custom property columns appear in sortable column headers
- Filters can be applied by custom property values
- Default sort: name (alphabetical), active workflows first

### 6.6 FlowHolt design implications

#### 6.6.1 Extend settings catalog (file 38)
Custom workflow properties are a settings-catalog item at org scope. Add to file 38:
```
Scope: org
Feature gate: Teams+
Entity: WorkflowPropertyDefinition
  - id, org_id, name, label, hint_text, field_type, required, options (for dropdown/multichoice)

Entity: WorkflowPropertyValue
  - workflow_id, property_definition_id, value (polymorphic by field_type)
```

#### 6.6.2 Extend frontend route inventory (file 40)
Org Dashboard needs a "Workflow Properties" tab/section. Add to file 40:
- Route: `/org/:org_id/settings/workflow-properties` or as a tab on the Org admin page
- Access: org_owner, org_admin only

#### 6.6.3 Workflow list page
The Workflow List page (file 40) needs:
- List / Table view toggle
- Custom property column rendering in Table view
- Filter by custom property value
- Sort by custom property column

---

## 7. Scenario recovery — background autosave + recovery UX

Source: Make corpus `restore-and-recover-scenario.md`, PDF pages 405-408; release note `introducing-scenario-recovery.md`

### 7.1 Version history vs. Scenario recovery — distinction

Make distinguishes two separate restoration mechanisms:

| Feature | Version history | Scenario recovery |
|---|---|---|
| When saved | Manually by user | Automatically, continuously in background |
| Retention | Up to 60 days | Until next manual save overwrites it |
| Purpose | Revert to stable known-good version | Recover work lost to session interruption |
| How to access | Version history menu | Auto-prompted on scenario reopen |
| Can be saved permanently | Yes (click "Restore" then Save) | Only if user clicks "Recover" then saves |

### 7.2 Scenario recovery flow

1. While user is editing a scenario in the builder, Make **continuously auto-saves a blueprint** in the background (not visible to user)
2. User's session is interrupted (browser crash, network disconnect, power outage, tab close)
3. User reopens the scenario
4. Make compares the **latest auto-saved blueprint** to the **latest manually-saved version**
5. If they differ: a **recovery dialog** appears showing:
   - List of changes detected
   - Scenario preview
   - Date/time of the latest auto-save
6. User can click **"Recover"** (applies the auto-saved blueprint) or **"Not now"** (dismisses the dialog)
7. Recovery does **NOT auto-save** — user must still manually save after recovering

### 7.3 After recovery

- Recovered version is accessible in Version history as **"Recovered"** entry
- If user dismisses the dialog ("Not now"), the recovered blueprint remains temporarily in version history
- The recovered blueprint is **permanently deleted** when the user next manually saves a new version
- If another session interruption occurs before saving, a new auto-save overwrites the previous recovered blueprint

### 7.4 FlowHolt design implications

File 43 (Environment and Deployment Lifecycle) covers auto-save in the context of draft state but not the specific recovery UX. This section extends that.

#### 7.4.1 Auto-save blueprint (backend)
- A `WorkflowAutosave` or `WorkflowDraftBlueprint` record stores the auto-saved graph state per workflow per user
- Auto-save triggers: after each node change (debounced 3–5 seconds), on session heartbeat, on explicit blur events
- Auto-save is **workspace-local** (not a published version) and does not appear in the public version history unless "Recovered"
- Auto-saves are scoped per `(workflow_id, user_id)` to avoid one user's draft overwriting another's

#### 7.4.2 Recovery detection logic
On Studio open:
```python
autosave = get_autosave(workflow_id, current_user)
latest_version = get_latest_saved_version(workflow_id)
if autosave and autosave.blueprint_hash != latest_version.blueprint_hash:
    show_recovery_dialog(autosave)
```

#### 7.4.3 Recovery dialog UI
- `WorkflowRecoveryDialog.tsx` shown as an overlay on Studio open when unsaved draft exists
- Shows: list of detected changes (node additions/deletions, edge changes), timestamp, mini-preview
- Actions: "Recover" (load auto-save into canvas) / "Not now" (dismiss, but auto-save retained in version history temporarily)

#### 7.4.4 Auto-save and version history coexistence
- Auto-saved blueprints are NOT shown in the main version history list by default
- After recovery, they appear as a "Recovered" entry
- After manual save post-recovery, the "Recovered" entry is superseded

---

## 8. Scenario sharing — public workflow pages

Source: Make corpus `scenario-sharing.md`; release note `introducing-scenario-sharing.md`

### 8.1 What scenario sharing is

Make scenario sharing creates a **public read-only workflow page** accessible by anyone with the link — no Make account required to view, though a Make account is required to copy.

Key properties:
- The link is **dynamic**: always shows the latest manually-saved version of the workflow
- Sharing is toggled on/off; toggling off deactivates the link immediately
- If re-enabled, the **same link** is restored (link is permanent per workflow)
- A blue "Shared" badge appears in the builder when the workflow is shared
- An orange "Shared" badge appears when the workflow has unsaved changes that are not yet visible in the public view

### 8.2 What is included in a shared workflow

| Included | Not included |
|---|---|
| Module configuration + mapped values | API keys, passwords, connection credentials |
| Scenario metadata (name, description) | Connection objects themselves |
| Module layout | Subscenarios (appear as empty modules) |
| Notes (via blueprint) | AI agents (appear as empty modules) |
| | Data stores/structures (empty) |
| | Custom and Community apps (may not display) |

### 8.3 Public scenario page contents

1. Title (can be different from workflow name, max 40 chars)
2. Description (max 260 chars)
3. Interactive scenario preview (view-only)
4. Additional information (max 2,000 chars; for setup instructions)
5. Author name (the last person who saved the scenario)
6. Author avatar (from Gravatar by registered email)
7. "+Use the scenario" button → creates a copy in the viewer's account (login required)

### 8.4 Social sharing

From the Share dialog, direct sharing to:
- LinkedIn
- Facebook
- X (Twitter)
- Email

Shared post auto-includes: thumbnail, title, description (if set).

Thumbnail is **not automatically updated** when the workflow changes — must be manually refreshed via the Share dialog.

### 8.5 Affiliate integration

If the org owner is an affiliate partner: new Make signups from shared scenario links earn **35% commission for 1 year**. This is Make-specific and does not translate directly to FlowHolt.

### 8.6 "What to do if scenario includes X" warnings

When sharing a scenario that includes subscenarios, AI agents, data stores, or custom apps, a warning prompt appears: "Continue sharing" → shares as-is with empty placeholders.

The public page recipient must:
- Create their own connections and credentials
- Create subscenarios manually
- Create their own AI agents
- Recreate data stores/structures

### 8.7 FlowHolt design implications

#### 8.7.1 Workflow sharing as a distinct feature

Scenario sharing is a **community/marketplace** adjacent feature, not a core runtime feature. FlowHolt should plan it as a Phase 2–3 feature after core stability.

Key design choices:
- **Public page** — requires a public-facing route family outside the authenticated dashboard
- **Thumbnail generation** — server-side canvas rendering of the workflow graph as a PNG
- **"Use this workflow"** action — creates a clone in the logged-in user's workspace, with connection-mapping wizard
- **Social preview metadata** — Open Graph tags on the public page for proper social share cards

#### 8.7.2 Add to frontend routes (extend file 40)
New route: `/w/:workflow_share_id` — public workflow page (unauthenticated-accessible)

New action in Studio TopBar: "Share" button → opens Share dialog → generates/toggles share link

#### 8.7.3 Blueprint export vs. share link
Make distinguishes:
- **Blueprints** (file 43) — explicit manual JSON export
- **Sharing via link** — dynamic public page, always current

FlowHolt should maintain this distinction. The share link uses the workflow's latest saved version as the source of truth, not a pinned export.

---

## 9. Make DevTool — debugging and developer surface

Source: Make corpus `make-devtool.md`

### 9.1 What Make DevTool is

Make DevTool is a **Chrome browser extension** that adds a new tab to Chrome Developer Tools called "Make." It provides three capabilities:
1. **Live Stream** — real-time inspection of API calls made during a manual run
2. **Scenario Debugger** — inspection of past manual and scheduled runs
3. **Tools** — utilities like the "Copy filter" tool

It is **not in-app** — it requires installing a separate Chrome extension.

### 9.2 Live Stream

Shows, for each module in a running scenario:
- Request Headers (API endpoint URL, HTTP method, time/date, headers, query string)
- Request Body
- Response Headers
- Response Body

Features:
- Search in logs (filter by text string)
- Clear logs
- Enable/disable console logging (green = enabled, gray = disabled)
- Retrieve request as raw JSON or cURL command (for reproducing calls externally)

### 9.3 Scenario Debugger

- Inspect runs (manual and scheduled)
- View per-module operations
- See exactly which module/operation/response caused an error

### 9.4 Tools within DevTool

- **Copy filter tool**: copy a filter from one position to another in the scenario
  - Set: Source Module (module after the filter to copy)
  - Set: Target Module (module before which to paste the filter)
  - Run

### 9.5 FlowHolt design implications

#### 9.5.1 In-app developer mode (no extension required)

FlowHolt should NOT require a third-party browser extension for debugging. Instead, a **Developer Panel** should be built as a first-party in-app feature, accessible in Studio.

#### 9.5.2 InspectorPanel extension — "HTTP Trace" tab

For nodes that make HTTP calls (HTTP request node, integration connectors), the Test tab (or a dedicated Debug tab) should show:
- Request URL, method, headers, body
- Response status code, headers, body
- Latency (ms)
- Timestamp

This provides Live Stream equivalent behavior without leaving the Studio inspector.

#### 9.5.3 Execution trace drawer

On any execution record (in Execution History), a **"Trace" view** should show per-step request/response payloads for HTTP-capable steps. Access-gated:
- **Viewer role**: sees step outputs only (no raw HTTP traces)
- **Builder role**: sees full HTTP traces
- **Confidential data mode**: traces are redacted per `data_is_confidential` setting

#### 9.5.4 Copy filter utility

The Copy Filter tool from Make DevTool is a useful Studio utility. FlowHolt equivalent:
- Right-click on a filter/condition edge → "Copy filter" context menu
- Then right-click on another edge → "Paste filter"
- This is a canvas interaction, not a separate devtool panel

Note: FlowHolt already references `StudioCommandBar.tsx` for actions — filter cut/copy/paste operations could be added to the canvas context menu.

#### 9.5.5 Developer mode toggle

A "Developer mode" toggle in user settings (or Studio toolbar) that enables:
- HTTP trace visibility on HTTP-capable nodes in Test tab
- Verbose step output display (raw bundle structure, not formatted)
- Copy input/output as JSON action on node test panels

This keeps advanced debugging capability visible and discoverable without cluttering the default Studio experience.

---

## 10. Summary of gaps resolved and open decisions added

### Gaps resolved by files 47 and 48

| Make corpus section | Planning file |
|---|---|
| Make Grid (Section 7) | **File 47** (new) |
| If-else and Merge | File 48, Section 1 |
| Converger | File 48, Section 2 |
| Types of warnings | File 48, Section 3 (extend into file 44) |
| Item data types + Type coercion | File 48, Section 4 (extend into file 45) |
| Select first bundle | File 48, Section 4.5 (extend into file 33) |
| Scenario notes | File 48, Section 5 |
| Custom scenario properties | File 48, Section 6 (extend into file 38) |
| Scenario recovery | File 48, Section 7 (extend into file 43) |
| Scenario sharing | File 48, Section 8 (extend into file 40) |
| Make DevTool | File 48, Section 9 |

### New open planning decisions

**#20**: Should FlowHolt add a `route_barrier` / `join` node that waits for all Router routes to complete (n8n-style all-paths merge)?

**#21**: Should Enterprise orgs get a configurable execution time limit beyond 40 minutes?

**#22**: Should custom workflow properties be Teams-gated or Enterprise-only? (Make gates it to Enterprise.)

**#23**: Should scenario notes be excluded from blueprint exports (matching Make) or included? FlowHolt's version-aware system could make notes part of the versioned blueprint.

**#24**: Should FlowHolt's "workflow sharing" feature include a Gravatar-based author avatar (as Make does) or use FlowHolt's own profile picture system?

**#25**: What is the FlowHolt equivalent of Make's affiliate commission model for shared workflow attribution?

### Make corpus coverage status (updated)

All major sections of the Make PDF TOC and help center export are now absorbed into planning files. Remaining sections that are intentionally deferred:

- Section 1 (Get started) — step-by-step tutorials, not design inputs
- Section 2 (partial) — `mapping.md`, `filtering.md`, `mapping-arrays.md`, `working-with-files.md` — detailed mapping UX, lower priority
- Section 3 (partial) — individual function references (general, math, text, date, array) — these are reference content for the expression language, catalogued in file 45
- Section 10 (Release notes) — absorbed selectively where relevant features appeared
- Section 3.7.1 full DevTool reference — above absorption is sufficient for planning purposes
- App-specific module references (Google, Slack, etc.) — integration catalog, deferred to integration spec (file 46)

**The Make corpus research phase is now comprehensively complete.** All design-impacting sections have been absorbed into planning files 01–48.
