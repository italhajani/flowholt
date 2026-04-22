# FlowHolt Studio Redesign From Scratch

> **Status:** New redesign system file created 2026-04-17  
> **Purpose:** Replace all residual current-Studio assumptions with a complete authoring model grounded in Make and n8n, but redesigned for FlowHolt.

---

## 1. Studio thesis

Studio is not a canvas with side panels attached to it. It is FlowHolt's primary authoring operating system.

It must support:

- building
- mapping
- testing
- debugging
- releasing
- collaborating
- attaching assets
- evaluating AI behavior

Studio should feel:

- as scalable as Make
- as data-aware as n8n
- as visually calm as modern AI tooling

---

## 2. Studio layout regions

The final Studio has eight persistent regions:

1. workflow header
2. workflow tab bar
3. left domain rail
4. insert / structure pane
5. main canvas
6. right inspector
7. bottom runtime bar + drawer
8. floating AI assistant

This extends the earlier six-region plan by explicitly separating the tab bar and the insert/structure pane.

---

## 3. Workflow header

### Left

- back to workflows
- workflow name inline edit
- workspace / team / env breadcrumb
- saved state
- lock / collaboration state

### Center

- draft / published / changed state
- environment chip
- version chip

### Right

- save
- share
- compare
- publish
- more actions

The header should remain visible. Unlike n8n, it does not disappear simply because the inspector is open.

---

## 4. Tab model

Studio uses four tabs:

1. **Workflow**
2. **Executions**
3. **Evaluation**
4. **Settings**

### Rules

- Workflow is the authoring surface
- Executions is workflow-scoped runtime history
- Evaluation is test suites, prompts, pinned inputs, and comparison
- Settings is workflow-scoped configuration, not a modal-only affordance

If a workflow has no AI features yet, Evaluation remains visible but shows setup guidance rather than disappearing.

---

## 5. Left side model

Studio uses a two-part left system:

### 5.1 Narrow rail

Icons for:

- Nodes
- Outline
- Connections
- Assets
- Versions
- Notes
- Help

### 5.2 Expandable pane

The pane changes with the selected rail item.

#### Nodes

- search
- recommended
- recent
- family groups
- integration categories

#### Outline

- ordered step list
- branches
- disabled nodes
- quick jump

#### Connections

- edge list
- unresolved branches
- disconnected nodes

#### Assets

- linked credentials
- linked connections
- variables in use
- provider references

#### Versions

- history list
- current draft
- compare entry

#### Notes

- workflow notes
- release notes
- operator annotations

---

## 6. Main canvas

### Canvas behavior

- neutral silver-white background
- subtle dot grid
- zoom controls
- fit view
- tidy up
- minimap toggle
- panning and zooming should feel consistent across mouse, trackpad, and touchpad input

### Node families

| Family | Accent |
|---|---|
| Trigger | green |
| Integration | neutral / provider icon |
| Logic | blue |
| Data | teal |
| Code | amber |
| Human | rose |
| AI | black |
| Error / recovery | red |

### Canvas states

- empty
- draft idle
- selected
- multi-select
- run in progress
- paused / human input required
- error path highlighted
- replay / historical inspection

### Mandatory canvas affordances

- add-node plus handles
- inline run from node
- enable / disable
- duplicate
- rename
- delete
- pin output
- add sticky note

---

## 7. Node creator

The node creator should combine:

- Make's floating insert/search speed
- n8n's category clarity

### Required behaviors

- open from plus button, keyboard `N`, or command palette
- search across node label, app, task, family, and synonyms
- support drag-to-canvas and click-to-insert
- show "recently used", "recommended next steps", and "compatible with selected node"
- when an AI cluster root is selected, offer sub-node categories first

---

## 8. Right inspector

The inspector is no longer a single linear form. It is a structured NDV-style surface.

### Modes

1. workflow mode
2. node mode
3. agent mode
4. execution-step mode

### Node mode layout

The inspector uses a split internal layout:

- **Input / reference panel**
- **Configuration / output / diagnostics panel**

### Node inspector tabs

1. Overview
2. Input
3. Parameters
4. Output
5. Diagnostics

### AI node extra tabs

1. Instructions
2. Tools
3. Knowledge
4. Runtime

### Required inspector features

- drag-to-expression from input data
- JSON / schema / table input views
- HTML / Markdown / binary preview when relevant
- output preview
- step run button
- pin data button
- connection / credential picker
- advanced settings collapse
- diagnostics surface for auth, config, and validation issues
- search within structured data
- item pagination for multi-item outputs
- copy path / copy value actions from inspected data
- pinned-data banner with explicit dev-only messaging
- editable pinned data for scenario testing without live calls

### Manual execution rules

- **Run once** executes the full workflow in manual mode
- **Execute step** runs the selected node and any required predecessors
- pinned or mocked data is honored only in manual development flows
- production executions always ignore pinned data and fetch fresh inputs

---

## 9. Bottom runtime system

The bottom of Studio is persistent and split in two layers:

### 9.1 Run bar

Always visible.

Left group:

- Run once
- Run with pinned data
- Stop
- Schedule state

Middle group:

- Save
- Auto-align
- History
- Notes
- Scenario I/O
- Workflow settings

Right group:

- environment quick switch
- collapse/expand drawers
- explain flow

### 9.2 Runtime drawer

Expandable above the run bar.

Tabs:

1. Output
2. Trace
3. Logs
4. Human tasks
5. Reasoning

This merges Make's persistent run bar with n8n's extended execution/log visibility.

---

## 10. Executions tab

The Executions tab is a workflow-specific runtime cockpit.

Must include:

- recent runs list
- active state
- retry / replay
- branch trace
- per-step output access
- failure summary
- duration and token metrics where relevant
- open-past-execution flow that can feed testing and pinned-data workflows
- partial-execution guidance when a selected node lacks the required trigger/input chain

This is not the same as the global Executions domain page.

---

## 11. Evaluation tab

Evaluation is where FlowHolt goes beyond both competitors.

Include:

- saved test payloads
- pinned-node scenarios
- AI evaluation datasets
- expected-output assertions
- compare runs
- regression snapshots
- cost / latency tracking for AI workflows

This tab is especially important for agents, prompts, structured extraction, and tool-driven flows.

---

## 12. Settings tab

Workflow-scoped configuration lives here, not only in modal form.

Include:

- execution order
- timeout
- save policies
- error workflow
- confidentiality
- sequential processing
- deployment policy
- environment bindings
- linked assets overview

Modal settings can still exist for quick edits, but the tab is the full surface.

---

## 13. Floating AI assistant

Like Make, Studio has a floating AI entry point at bottom-right.

Rules:

- always visible in Workflow tab
- opens assistant drawer or floating panel
- can explain flow, suggest next node, summarize errors, propose fixes
- does not replace the managed AI Agents domain

The assistant is contextual help, not the product's AI inventory.

---

## 14. Context menus and shortcuts

### Node context menu

- Open details
- Rename
- Duplicate
- Disable / enable
- Pin output
- Run this path
- Add note
- Delete

### Canvas context menu

- add node
- add sticky note
- paste
- tidy up
- fit view

### Required shortcuts

- Cmd/Ctrl+K command palette
- Cmd/Ctrl+Enter run workflow
- Cmd/Ctrl+S save
- Cmd/Ctrl+Z undo
- Cmd/Ctrl+Shift+Z redo
- N open node creator
- Delete delete selected
- P pin node output
- Shift+S add sticky note

### Command palette groups

The command palette should adapt to Studio context and expose:

- workflow actions: save, run, tidy up, publish, duplicate, archive
- node actions: add, replace, execute, disable, pin, rename
- resource navigation: workflows, executions, credentials, variables, templates
- help actions: docs, shortcuts, explain flow

---

## 15. Special Studio surfaces

### Sticky notes

- resizable
- draggable
- rich text later
- color variants restrained, not playful

### Version compare

- draft vs published
- version vs version
- node add/remove/change highlighting

### Human task overlays

- pause details
- assignee
- pending choice
- resume/cancel action

### Credential setup prompts

- if workflow uses missing assets, Studio surfaces setup prompts inline

---

## 16. What FlowHolt should exceed

Compared with Make and n8n, Studio should exceed by:

1. tighter Vault integration during node configuration
2. clearer environment and deployment visibility
3. stronger evaluation tooling
4. better AI/agent dual model
5. better confidential-data signaling and redaction awareness

---

## 17. Exit condition

This Studio redesign is complete only when:

- header, tab bar, rail, canvas, inspector, runtime drawer, and floating AI all have clear specs
- data mapping and debug flows are fully planned
- asset binding and evaluation are first-class
- the old current UI is no longer needed as a planning reference
