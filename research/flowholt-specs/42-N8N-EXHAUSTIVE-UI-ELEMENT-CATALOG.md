# n8n Exhaustive UI Element Catalog for FlowHolt

This file catalogs **every single UI element, component, interaction, keybinding, context menu item, modal, panel, button, and design system primitive** discovered in the n8n source code. It serves as the definitive reference for FlowHolt UI planning.

Source: `n8n-master` (v2.16.0, April 2026)

---

## Cross-Reference Map

### Raw source paths (n8n-master) — key files per section
- **Section 1 (Header)**: `n8n-master/packages/frontend/editor-ui/src/app/components/MainHeader/`
  - `TabBar.vue` — 3 tabs (Workflow/Executions/Evaluation)
  - `WorkflowDetails.vue` — breadcrumbs, inline name, tags, actions
  - `WorkflowHeaderDraftPublishActions.vue` (19KB) — 6 publish states
  - `ActionsDropdownMenu.vue` (13KB) — 17 workflow actions
- **Section 2 (Canvas)**: `n8n-master/packages/frontend/editor-ui/src/app/views/NodeView.vue` (58KB)
  - Canvas: `n8n-master/packages/frontend/editor-ui/src/features/canvas/`
  - Floating UI: `CanvasRunWorkflowButton.vue`, `CanvasChatButton.vue`, `SetupWorkflowCredentialsButton.vue`
- **Section 3 (Context menu)**: `n8n-master/packages/frontend/editor-ui/src/composables/useContextMenu.ts`
- **Section 4 (Keybindings)**: `n8n-master/packages/frontend/editor-ui/src/composables/useKeybindings.ts`
- **Section 5 (NDV)**: `n8n-master/packages/frontend/editor-ui/src/features/ndv/`
  - `NodeDetailsViewV2.vue` — main NDV container
  - `NDVDraggablePanels.vue` — resizable 3-column layout
  - `InputPanel.vue` / `OutputPanel.vue` — data display
  - `parameters/components/ParameterInput.vue` (66KB!) — core input component
  - `NDVSubConnections.vue` — AI tool sub-connections
- **Section 6 (Logs panel)**: `n8n-master/packages/frontend/editor-ui/src/features/logs/`
- **Section 7 (Node creator)**: `n8n-master/packages/frontend/editor-ui/src/features/nodeCreator/`
- **Section 8 (Sidebar)**: `n8n-master/packages/frontend/editor-ui/src/app/components/MainSidebar/`
- **Section 9 (Modals)**: `n8n-master/packages/frontend/editor-ui/src/components/` (47 modals)
- **Design system**: `n8n-master/packages/frontend/@n8n/design-system/src/components/` (100+ N8n-prefixed components)

### Peer research files
- `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` — Make visual patterns (compare each element here to Make's version)
- `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — Make test IDs, DOM structure, network (compare Make patterns to n8n patterns here)
- `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` — n8n architecture overview (this file is the detailed UI companion)

### FlowHolt planning files fed by this catalog
| Section | FlowHolt file |
|---|---|
| §1 Header, publish states, actions dropdown | `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md`, `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md` |
| §2 Canvas, floating buttons, empty state | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md`, `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` |
| §3 Context menu (21 actions) | `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md`, `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` |
| §4 Keyboard shortcuts (25 bindings) | `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` |
| §5 NDV (dual-panel, parameter input tree) | `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md`, `26-FLOWHOLT-STUDIO-OBJECT-FIELD-CATALOG-DRAFT.md` |
| §6 Logs panel | `25-FLOWHOLT-QUEUE-DASHBOARD-AND-RUNBOOKS.md` |
| §7 Node creator | `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` |
| §8 Sidebar structure | `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` §6 |
| §9 Modals (47 total) | `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md` |

### FlowHolt adoption legend (used throughout this file)
- ✅ Already planned in a FlowHolt planning file
- 🔴 New — not yet in any FlowHolt plan file (needs to be added)
- 🟡 Phase 2 — planned for later
- ❌ Not applicable to FlowHolt

---


## 1. Main Header — per-workflow header bar

### 1.1 Tab bar (`MainHeader/TabBar.vue`)

3 tabs, always visible on workflow pages:

| Tab | Label key | Routes mapped | FlowHolt adoption |
|---|---|---|---|
| `WORKFLOW` | `generic.editor` | `WORKFLOW`, `NEW_WORKFLOW`, `EXECUTION_DEBUG` | ✅ Editor tab |
| `EXECUTIONS` | `generic.executions` | `EXECUTION_HOME`, `WORKFLOW_EXECUTIONS`, `EXECUTION_PREVIEW` | ✅ Runs tab |
| `EVALUATION` | `generic.tests` | `EVALUATION_EDIT`, `EVALUATION_RUNS_DETAIL` | 🔴 New — AI test runs tab |

Behavior details:
- Ctrl/Cmd+click opens tab in new browser tab
- Tab state persists during navigation (remembers which workflow/execution to return to)
- Header is hidden when NDV is open (unless it's a sticky note)
- `isCanvasOnly` mode hides entire header (for embedded previews)
- `floating` mode renders tab bar as overlay (canvas-only mode)

### 1.2 Workflow details bar (`MainHeader/WorkflowDetails.vue`)

Left-to-right layout:

1. **Folder breadcrumbs** (`FolderBreadcrumbs`) — project → folder → workflow navigation
2. **Workflow name** (`N8nInlineTextEdit`) — inline editable, max 128 chars, responsive width breakpoints (XS:150px, SM:200px, MD:250px, LG:500px, XL:1000px)
3. **Tags section** — `WorkflowTagsContainer` (display mode) or `WorkflowTagsDropdown` (edit mode), clickable "+ Add tag" link when empty
4. **Archived badge** (`N8nBadge`, theme: `tertiary`, bold) — shown when `isArchived`
5. **Connection tracker** (`ConnectionTracker`) — wraps action buttons
6. **Production checklist** (`WorkflowProductionChecklist`) — pre-publish validation
7. **Draft/Publish actions** (`WorkflowHeaderDraftPublishActions`) — the primary action area

Event bus listeners on mount:
- `importWorkflowFromFile` → triggers file input
- `archiveWorkflow` → archive flow
- `unarchiveWorkflow` → unarchive flow
- `deleteWorkflow` → delete flow with confirmation
- `renameWorkflow` → focus name input
- `addTag` → enable tag editing

### 1.3 Draft/Publish actions (`WorkflowHeaderDraftPublishActions.vue`, 19KB)

**6 workflow publish states:**

| State | Condition | Button text | Indicator | Enabled |
|---|---|---|---|---|
| `not-published-not-eligible` | No triggers or has errors | "Publish" | none | No |
| `not-published-eligible` | Has triggers, no errors | "Publish" | none | Yes |
| `published-no-changes` | Published, up to date | "Published" | 🟢 green | No |
| `published-with-changes` | Published, has changes | "Publish" | 🟡 yellow | Yes |
| `published-node-issues` | Published, has errors | "Publish" | 🔴 red | No |
| `published-invalid-trigger` | Published, no triggers | "Publish" | 🟡 yellow | No |

Additional elements in this area:
- **Collaboration pane** (`CollaborationPane`) — user avatars showing who's viewing
- **Auto-save indicator** (`TimeAgo`) — "Saved X minutes ago"
- **Workflow history button** (`WorkflowHistoryButton`) — opens version history
- **Named versions** (enterprise) — `generateVersionLabelFromId`, version labeling modal

Keybinding registered: `Ctrl+S` (via `useKeybindings`)

### 1.4 Actions dropdown menu (`ActionsDropdownMenu.vue`, 13KB)

**17 workflow menu actions (in order of appearance):**

| Action ID | Label | Condition | FlowHolt |
|---|---|---|---|
| `EDIT_DESCRIPTION` | Edit Description | Can update, not archived | ✅ Plan |
| `DUPLICATE` | Duplicate | Can update, not archived | ✅ Plan |
| `DOWNLOAD` | Download | Always (on workflow page) | ✅ Plan |
| `SHARE` | Share | Enterprise sharing + share permission | ✅ Plan |
| `CHANGE_OWNER` | Change Owner | Move permission + team projects | 🔴 New |
| `RENAME` | Rename | Can update, not archived | ✅ Plan |
| `IMPORT_FROM_URL` | Import from URL | Can update, not on executions tab | 🔴 New |
| `IMPORT_FROM_FILE` | Import from File | Can update, not on executions tab | ✅ Plan |
| `PUSH` | Push (Source Control) | `sourceControl:push` scope | 🟡 Phase 2 |
| `SETTINGS` | Settings | Not new workflow | ✅ Plan |
| `ARCHIVE` | Archive | Can delete, not archived | ✅ Plan |
| `UNARCHIVE` | Unarchive | Can delete, is archived | ✅ Plan |
| `DELETE` | Delete | Can delete, is archived (appears after unarchive) | ✅ Plan |

File import: Hidden `<input type="file">` for JSON workflow import, reads file via `FileReader`.

Download: Exports workflow as JSON blob via `file-saver` (`saveAs`), sanitizes filename.

---

## 2. Canvas Editor (`NodeView.vue`, 58KB + `WorkflowCanvas.vue`)

### 2.1 Stores used (22 stores!)

| Store | Purpose | FlowHolt equivalent |
|---|---|---|
| `nodeTypesStore` | Node type definitions | Node registry store |
| `uiStore` | UI state, dirty tracking, modals | UI store |
| `workflowsStore` | Workflow data, execution state | Workflow store |
| `workflowsListStore` | Workflow list/fetch | Workflow list store |
| `sourceControlStore` | Git branch read-only state | Source control store |
| `nodeCreatorStore` | Node creator panel state | Node creator store |
| `credentialsStore` | Credential loading | Credentials store |
| `environmentsStore` | Variables | Variables store |
| `canvasStore` | Canvas-specific state | Canvas store |
| `npsSurveyStore` | NPS survey triggering | Analytics store |
| `projectsStore` | Project navigation | Projects store |
| `usersStore` | User info | Users store |
| `tagsStore` | Tags | Tags store |
| `ndvStore` | NDV active node, push ref | NDV store |
| `focusPanelStore` | Focus panel toggle | Focus panel store |
| `builderStore` | AI builder streaming state | AI builder store |
| `agentRequestStore` | Agent input requests | Agent request store |
| `logsStore` | Logs panel open/close | Logs store |
| `experimentalNdvStore` | Experimental NDV flags | Feature flag store |
| `collaborationStore` | Write access, current writer | Collaboration store |
| `emptyStateBuilderPromptStore` | AI empty state prompt | Experiment store |
| `chatPanelStore` | AI assistant chat panel | Chat panel store |
| `chatHubPanelStore` | Chat hub panel (agent chat) | Chat hub store |

### 2.2 Canvas events (44 distinct events emitted to WorkflowCanvas)

| Event | Handler | Purpose |
|---|---|---|
| `update:nodes:position` | `onUpdateNodesPosition` | Batch node move |
| `update:node:position` | `onUpdateNodePosition` | Single node move |
| `update:node:activated` | `onSetNodeActivated` | Double-click to open NDV |
| `update:node:deactivated` | `onSetNodeDeactivated` | Close NDV |
| `update:node:selected` | `onSetNodeSelected` | Single/multi select |
| `update:node:enabled` | `onToggleNodeDisabled` | Enable/disable node |
| `update:node:name` | `onOpenRenameNodeModal` | Rename node |
| `update:node:parameters` | `onUpdateNodeParameters` | Parameter change |
| `update:node:inputs` | `onUpdateNodeInputs` | Input revalidation |
| `update:node:outputs` | `onUpdateNodeOutputs` | Output revalidation |
| `update:logs-open` | `logsStore.toggleOpen` | Toggle logs panel |
| `update:logs:input-open` | `logsStore.toggleInputOpen` | Toggle input log |
| `update:logs:output-open` | `logsStore.toggleOutputOpen` | Toggle output log |
| `update:has-range-selection` | `canvasStore.setHasRangeSelection` | Box selection state |
| `open:sub-workflow` | `onOpenSubWorkflow` | Open sub-workflow in new tab |
| `click:node` | `onClickNode` | Node click (set last position) |
| `click:node:add` | `onClickNodeAdd` | Plus endpoint click |
| `run:node` | `onRunWorkflowToNode` | Execute to specific node |
| `copy:production:url` | `onCopyProductionUrl` | Copy webhook URL |
| `copy:test:url` | `onCopyTestUrl` | Copy test webhook URL |
| `delete:node` | `onDeleteNode` | Delete single node |
| `create:connection` | `onCreateConnection` | New edge |
| `create:connection:cancelled` | `onCreateConnectionCancelled` | Dropped connection → open node creator |
| `delete:connection` | `onDeleteConnection` | Remove edge |
| `click:connection:add` | `onClickConnectionAdd` | Connection add button |
| `click:pane` | `onClickPane` | Canvas background click |
| `create:node` | `onOpenNodeCreatorFromCanvas` | Open node creator |
| `create:sticky` | `onCreateSticky` | Add sticky note |
| `delete:nodes` | `onDeleteNodes` | Multi-node delete |
| `update:nodes:enabled` | `onToggleNodesDisabled` | Multi-node enable/disable |
| `update:nodes:pin` | `onPinNodes` | Multi-node pin/unpin |
| `duplicate:nodes` | `onDuplicateNodes` | Multi-node duplicate |
| `copy:nodes` | `onCopyNodes` | Multi-node copy to clipboard |
| `cut:nodes` | `onCutNodes` | Multi-node cut |
| `replace:node` | `onClickReplaceNode` | Replace node type |
| `run:workflow` | `runEntireWorkflow('main')` | Run entire workflow |
| `create:workflow` | `onCreateWorkflow` | New workflow |
| `viewport:change` | `onViewportChange` | Pan/zoom change |
| `selection:end` | `onSelectionEnd` | Box selection complete |
| `drag-and-drop` | `onDragAndDrop` | Drop node from creator |
| `tidy-up` | `onTidyUp` | Auto-layout |
| `toggle:focus-panel` | `onToggleFocusPanel` | Toggle focus sidebar |
| `extract-workflow` | `onExtractWorkflow` | Extract sub-workflow |
| `start-chat` | `onToggleChat` | Open/toggle chat panel |

### 2.3 Canvas floating UI elements (positioned absolutely)

| Element | Position | Condition | FlowHolt |
|---|---|---|---|
| `SetupWorkflowCredentialsButton` | Top-left | Not read-only | 🔴 New — credential setup prompt |
| `CanvasRunWorkflowButton` | Bottom-center | Has triggers, not chat-only | ✅ Run button |
| `CanvasChatButton` (open) | Bottom-center (next to run) | Has chat trigger, not pinned | 🔴 New — chat toggle |
| `CanvasChatButton` (hide) | Bottom-center | Chat panel is open | 🔴 New — chat hide |
| `CanvasStopCurrentExecutionButton` | Bottom-center | Execution running | ✅ Stop button |
| `CanvasStopWaitingForWebhookButton` | Bottom-center | Waiting for webhook | ✅ Stop waiting button |
| `N8nCallout` (read-only env) | Bottom-center | Source control read-only | 🟡 Phase 2 |
| `N8nCanvasCollaborationPill` | Center | Another user has write access | 🔴 New — collaboration |
| `N8nCanvasThinkingPill` | Center | AI builder is streaming | 🔴 New — AI building indicator |
| `NodeCreation` (Suspense) | Right panel | Not read-only | ✅ Node creator |
| `NodeDetailsView` / `NodeDetailsViewV2` (Suspense) | Right panel | Node active | ✅ NDV |
| `FocusSidebar` | Right side | Not loading | 🔴 New — focus sidebar |

### 2.4 Canvas read-only conditions (6 conditions, any true = read-only)

1. `isDemoRoute` — demo/preview mode
2. `isReadOnlyEnvironment` — source control branch is read-only
3. `collaborationStore.shouldBeReadOnly` — another user has write lock
4. No `workflow.update` permission
5. `editableWorkflow.isArchived` — archived workflow
6. `builderStore.streaming && !builderStore.isHelpStreaming` — AI builder modifying nodes

### 2.5 Canvas buttons detail

**CanvasRunWorkflowButton:**
- Split button when multiple selectable trigger nodes (dropdown to pick trigger)
- Disabled when: no triggers, all triggers disabled, or chat-only triggers without pinned data
- `@mouseenter`/`@mouseleave` events broadcast via `nodeViewEventBus` (for highlighting trigger paths)
- Keyboard shortcut tooltip wrapper

**CanvasChatButton:**
- Two variants: `solid` (primary) and `subtle` (secondary)
- Priority: If `isChatHubAvailable` → open chat hub panel; else → `startChat('main')` (logs panel)
- Chat hub available when: `chatHubPanelStore.isFloatingChatEnabled` AND `chatTriggerNode.parameters.availableInChat === true`

### 2.6 Fallback nodes (empty canvas)

When canvas has 0 nodes and is not read-only:
- If AI builder enabled: Shows `ChoicePrompt` fallback node (choose between manual/AI build)
- If AI builder disabled: Shows `AddNodes` fallback node (+ button to trigger node creator)

---

## 3. Context Menu — right-click actions on canvas

### 3.1 Canvas context menu actions (21 actions)

**When no nodes selected (canvas right-click):**

| Action | Shortcut | Purpose | FlowHolt |
|---|---|---|---|
| `add_node` | `N` | Open node creator | ✅ |
| `add_sticky` | `Shift+S` | Add sticky note | 🔴 New |
| `tidy_up` | `Shift+Alt+T` | Auto-layout all nodes | ✅ |
| `select_all` | `Ctrl+A` | Select all nodes | ✅ |
| `deselect_all` | — | Deselect all | ✅ |

**When single node selected:**

| Action | Shortcut | Purpose | FlowHolt |
|---|---|---|---|
| `open` | `Enter` | Open NDV | ✅ |
| `execute` | — | Test/run this node | ✅ |
| `copy_test_url` | `Shift+Alt+U` | Copy test webhook URL (webhook nodes) | 🔴 New |
| `copy_production_url` | `Alt+U` | Copy production webhook URL (webhook nodes) | 🔴 New |
| `rename` | `Space` | Rename node | ✅ |
| `replace` | `R` | Replace node type | 🔴 New |
| `open_sub_workflow` | `Shift+Ctrl+O` | Open sub-workflow in new tab | 🔴 New |
| `toggle_activation` | `D` | Enable/disable node | ✅ |
| `toggle_pin` | `P` | Pin/unpin node data | ✅ |
| `copy` | `Ctrl+C` | Copy node | ✅ |
| `duplicate` | `Ctrl+D` | Duplicate node | ✅ |
| `tidy_up` | `Shift+Alt+T` | Auto-layout | ✅ |
| `extract_sub_workflow` | `Alt+X` | Extract to sub-workflow | 🔴 New |
| `focus_ai_on_selected` | `Alt+I` | Focus AI assistant on node | 🔴 New |
| `select_all` | `Ctrl+A` | Select all | ✅ |
| `delete` | `Del` | Delete node | ✅ |

**When single sticky note selected:**

| Action | Shortcut | Purpose |
|---|---|---|
| `open` / `editSticky` | `Enter` | Edit sticky content |
| `change_color` | — | Change sticky color |

**Multi-node selection:** Same as single minus `open`, `execute`, `rename`, `replace`, webhook URLs, sub-workflow. Labels adjust for plural ("Delete 3 nodes").

### 3.2 Context menu conditions

- `isReadOnly` disables: all mutating actions
- `NOT_DUPLICATABLE_NODE_TYPES` prevents duplication of certain nodes
- `maxNodes` on node types prevents exceeding instance limits
- `canPinNode()` validates pin eligibility
- `isExecutable()` checks if node can be run
- `isWebhookNode()` enables webhook URL copy
- `isNodeWithWorkflowSelector()` enables sub-workflow open
- `focusedNodesStore.isFeatureEnabled` gates AI focus action

---

## 4. Keyboard Shortcuts System (`useKeybindings.ts`)

### 4.1 Architecture

- Composable: `useKeybindings(keymap, options)`
- Supports `ctrl`, `alt`, `shift` modifiers
- Multi-shortcut: `'ctrl+b|ctrl+c'` for alternate bindings
- Keyboard Layout Map API support for non-QWERTY layouts
- Resolution: `byKey` → `byLayout` → `byCode` (with Latin/non-Latin detection)
- Ignores keypress when: active element is input/textarea/contenteditable, or `isDisabled`
- Pop-out window support via inject

### 4.2 Registered keybindings (from NodeView + canvas)

| Shortcut | Action | Context |
|---|---|---|
| `Ctrl+Alt+O` | Open About modal | NodeView global |
| `Ctrl+S` | Save workflow | WorkflowHeaderDraftPublishActions |
| `N` | Open node creator | Context menu |
| `Shift+S` | Add sticky note | Context menu |
| `D` | Toggle node enabled | Context menu / canvas |
| `P` | Pin/unpin node | Context menu |
| `R` | Replace node | Context menu |
| `Space` | Rename node | Context menu |
| `Enter` | Open NDV | Context menu |
| `Del` / `Backspace` | Delete node(s) | Context menu / canvas |
| `Ctrl+A` | Select all | Context menu |
| `Ctrl+C` | Copy | Context menu |
| `Ctrl+D` | Duplicate | Context menu |
| `Ctrl+V` | Paste (clipboard) | NodeView |
| `Ctrl+Z` | Undo | Canvas |
| `Ctrl+Shift+Z` | Redo | Canvas |
| `Alt+X` | Extract sub-workflow | Context menu |
| `Alt+I` | Focus AI on selected | Context menu |
| `Alt+U` | Copy production URL | Context menu |
| `Shift+Alt+U` | Copy test URL | Context menu |
| `Shift+Alt+T` | Tidy up | Context menu |
| `Shift+Ctrl+O` | Open sub-workflow | Context menu |
| `C` | Open/toggle chat | Canvas chat button |
| `Ctrl+Cmd+DoubleClick` | Open sub-workflow in new tab | Node double-click |

---

## 5. NDV (Node Detail View) — complete component tree

### 5.1 NDV V2 component hierarchy

```
NodeDetailsViewV2.vue (main NDV container)
├── NDVHeader.vue
│   ├── Node icon + name (inline editable)
│   ├── Node description tooltip
│   ├── Run count indicator
│   ├── Close button (X)
│   └── NDV tabs (Parameters / Settings / etc.)
├── NDVDraggablePanels.vue (resizable left/right/center split)
│   ├── Left: InputPanel.vue
│   │   ├── InputNodeSelect.vue — dropdown to pick upstream node
│   │   ├── RunData.vue — data display component
│   │   │   ├── RunDataDisplayModeSelect.vue (Table / JSON / Schema / HTML)
│   │   │   ├── RunDataTable.vue — tabular data display
│   │   │   ├── RunDataJson.vue — JSON tree display
│   │   │   │   └── RunDataJsonActions.vue — copy/download actions
│   │   │   ├── RunDataHtml.vue — rendered HTML preview
│   │   │   ├── RunDataMarkdown.vue — rendered Markdown
│   │   │   ├── RunDataBinary.vue — binary file display
│   │   │   │   └── BinaryDataDisplay.vue / BinaryDataDisplayEmbed.vue
│   │   │   ├── RunDataParsedAiContent.vue — AI response formatting
│   │   │   ├── RunDataSearch.vue — search within data
│   │   │   ├── RunDataPaginationBar.vue — item pagination
│   │   │   ├── RunDataItemCount.vue — "X items" indicator
│   │   │   └── RunDataPinButton.vue — pin this data
│   │   ├── TriggerPanel.vue — special panel for trigger nodes
│   │   └── WireMeUp.vue — "connect a node" empty state
│   ├── Right: OutputPanel.vue
│   │   ├── RunData.vue (same component tree as input)
│   │   ├── RunInfo.vue — execution timing, status, retry info
│   │   └── RedactedDataState.vue — "data redacted" message
│   ├── Center: NodeSettings.vue (parameter form)
│   │   ├── NodeSettingsHeader.vue — node type info
│   │   ├── NodeSettingsTabs.vue — Parameters / Settings tabs
│   │   ├── NodeSettingsHint.vue — contextual hints
│   │   ├── NodeSettingsInvalidNodeWarning.vue — invalid node alert
│   │   ├── NodeWebhooks.vue — webhook URL display (test + production)
│   │   └── ParameterInputList.vue — the actual parameter form
│   │       ├── ParameterInputFull.vue — full-width parameter row
│   │       │   ├── ParameterInputWrapper.vue — handles expressions/fixed toggle
│   │       │   │   ├── ParameterInput.vue (66KB!) — the core input component
│   │       │   │   │   ├── Text input / textarea
│   │       │   │   │   ├── Number input
│   │       │   │   │   ├── Boolean toggle
│   │       │   │   │   ├── Select / multi-select
│   │       │   │   │   ├── Color picker
│   │       │   │   │   ├── Date picker
│   │       │   │   │   ├── Credential picker
│   │       │   │   │   ├── Resource locator (search + URL + ID modes)
│   │       │   │   │   ├── HTML editor (CodeMirror)
│   │       │   │   │   ├── SQL editor (CodeMirror)
│   │       │   │   │   ├── JSON editor (CodeMirror)
│   │       │   │   │   └── Code editor (JavaScript/Python)
│   │       │   │   └── ExpressionParameterInput.vue — inline expression editing
│   │       │   ├── ParameterInputHint.vue — helper text below input
│   │       │   └── ParameterIssues.vue — validation error display
│   │       ├── ParameterInputExpanded.vue — expanded parameter view
│   │       ├── CollectionParameter.vue — grouped parameter sets
│   │       ├── MultipleParameter.vue — repeatable parameter rows
│   │       ├── AssignmentCollection.vue — key=value assignment UI
│   │       │   ├── Assignment.vue — single assignment row
│   │       │   └── TypeSelect.vue — type picker for assignments
│   │       ├── FilterConditions/ — condition builder UI
│   │       │   └── CombinatorSelect.vue — AND/OR selector
│   │       ├── FixedCollection/ — fixed parameter groups
│   │       ├── InputTriple/ — triple-input parameters
│   │       ├── ButtonParameter.vue — clickable button parameter
│   │       ├── ImportCurlParameter.vue — "Import cURL" button
│   │       └── ImportCurlModal.vue — cURL paste/parse dialog
│   └── PanelDragButton.vue / PanelDragButtonV2.vue — resize handle
├── NDVFloatingNodes.vue — floating mini-nodes for AI sub-connections
├── NDVSubConnections.vue — AI tool/memory/output parser connections
└── NDVEmptyState.vue — "run to see output" placeholder
```

### 5.2 Run data display modes (5 modes)

| Mode | Component | Purpose | FlowHolt |
|---|---|---|---|
| Table | `RunDataTable.vue` | Spreadsheet-like data view | ✅ Plan |
| JSON | `RunDataJson.vue` | JSON tree with collapse/expand | ✅ Plan |
| Schema | Schema preview (via `schemaPreview.store.ts`) | Data shape/type display | 🔴 New |
| HTML | `RunDataHtml.vue` | Rendered HTML output | 🔴 New |
| Binary | `RunDataBinary.vue` | File/image preview | 🔴 New |

Additional:
- `RunDataMarkdown.vue` — rendered markdown
- `RunDataParsedAiContent.vue` — AI-specific response formatting
- `TextWithHighlights.vue` — search result highlighting

### 5.3 Binary data components

| Component | Purpose | FlowHolt |
|---|---|---|
| `BinaryDataDisplay.vue` | Display binary data (images, files) | 🔴 New |
| `BinaryDataDisplayEmbed.vue` | Embedded binary preview | 🔴 New |
| `BinaryDataViewModal.vue` | Full-screen binary viewer | 🔴 New |
| `BinaryEntryDataTable.vue` | Binary metadata table | 🔴 New |
| `MappingPill.vue` | Draggable data mapping pill | 🔴 New |

### 5.4 NDV settings tabs (`NodeSettingsTabs.vue`)

The NDV has internal tabs for each node:
- **Parameters** — the main parameter form
- **Settings** — node-level settings (retry, timeout, notes, etc.)

### 5.5 Expression editor

| Component | Purpose | FlowHolt |
|---|---|---|
| `ExpressionParameterInput.vue` | Inline expression editing in parameter fields | ✅ Plan (expression builder) |
| `ExpressionEditModal.vue` | Full-screen expression editor modal | ✅ Plan |
| `ExpressionEditorModalInput.vue` | CodeMirror-based expression input | ✅ Plan |
| `ExpressionFunctionIcon.vue` | Function icon indicator | ✅ Plan |

### 5.6 Parameter input overrides (`ParameterInputOverrides/`)

Custom parameter rendering for specific node types, allowing nodes to override the default input UI.

---

## 6. Design System — complete component catalog (91 exports)

### 6.1 Core primitives

| Component | Purpose | FlowHolt equivalent |
|---|---|---|
| `N8nButton` | Primary button component | `Button` |
| `N8nIconButton` | Icon-only button | `IconButton` |
| `N8nIcon` | Icon component (custom icon set) | `Icon` (Lucide) |
| `N8nText` | Typography component | `Text` |
| `N8nHeading` | Heading component | `Heading` |
| `N8nLink` | Link component | `Link` |
| `N8nExternalLink` | External link (opens in new tab) | `ExternalLink` |
| `N8nLogo` | Brand logo | `Logo` |
| `N8nSpinner` | Loading spinner | `Spinner` |
| `N8nCircleLoader` | Circular progress | `CircleLoader` |
| `N8nLoading` | Skeleton loading | `Skeleton` |
| `N8nPulse` | Pulsing animation wrapper | `Pulse` |
| `N8nBlockUi` | Full-screen overlay blocker | `BlockUI` |

### 6.2 Form components

| Component | Purpose | FlowHolt equivalent |
|---|---|---|
| `N8nInput` | Text input (2 variants) | `Input` |
| `N8nInputNumber` | Number input | `NumberInput` |
| `N8nInputLabel` | Input label with optional tooltip | `InputLabel` |
| `N8nSelect` | Select/dropdown | `Select` |
| `N8nOption` | Select option | `Option` |
| `N8nDropdown` | Generic dropdown | `Dropdown` |
| `N8nRadioButtons` | Radio button group | `RadioGroup` |
| `N8nColorPicker` | Color picker | `ColorPicker` |
| `N8nFormBox` | Form container with submit | `FormBox` |
| `N8nFormInput` | Single form field with validation | `FormField` |
| `N8nFormInputs` | Auto-generated form from schema | `FormInputs` |
| `N8nInlineTextEdit` | Inline editable text | `InlineTextEdit` |
| `N8nPromptInput` | AI prompt input (multiline) | `PromptInput` |
| `N8nPromptInputSuggestions` | Prompt input with suggestions | `PromptInputSuggestions` |

### 6.3 Navigation components

| Component | Purpose | FlowHolt equivalent |
|---|---|---|
| `N8nMenuItem` | Sidebar menu item | `MenuItem` |
| `N8nNavigationDropdown` | Navigation dropdown menu | `NavigationDropdown` |
| `N8nTabs` | Tab bar | `Tabs` |
| `N8nBreadcrumbs` | Breadcrumb navigation | `Breadcrumbs` |
| `N8nRoute` | Route link wrapper | `RouteLink` |
| `N8nCommandBar` | Cmd+K command palette | `CommandBar` |
| `N8nHeaderAction` | Header action button | `HeaderAction` |

### 6.4 Data display components

| Component | Purpose | FlowHolt equivalent |
|---|---|---|
| `N8nDatatable` | Client-side data table | `DataTable` |
| `N8nDataTableServer` | Server-side paginated data table | `DataTableServer` |
| `N8nTableBase` | Base table primitive | `TableBase` |
| `N8nTableHeaderControlsButton` | Table header action buttons | `TableHeaderControls` |
| `N8nTree` | Tree view component | `TreeView` |
| `N8nMarkdown` | Markdown renderer | `Markdown` |
| `N8nInfoAccordion` | Expandable info panel | `Accordion` |
| `N8nTag` | Single tag pill | `Tag` |
| `N8nTags` | Tag collection | `Tags` |
| `N8nBadge` | Status badge | `Badge` |
| `N8nAvatar` | User avatar | `Avatar` |
| `N8nUserStack` | Stacked user avatars | `UserStack` |
| `N8nUserInfo` | User name + email | `UserInfo` |
| `N8nUserSelect` | User picker | `UserSelect` |
| `N8nUsersList` | User list | `UsersList` |
| `N8nNodeIcon` | Node type icon | `NodeIcon` |
| `N8nNodeCreatorNode` | Node in creator panel | `NodeCreatorNode` |
| `N8nIconPicker` | Icon selection picker | `IconPicker` |

### 6.5 Overlay / feedback components

| Component | Purpose | FlowHolt equivalent |
|---|---|---|
| `N8nDialog` (14 exports!) | Modal dialog | `Dialog` |
| `N8nAlertDialog` | Confirm/alert dialog | `AlertDialog` |
| `N8nCallout` | Banner/callout message | `Callout` |
| `N8nAlert` | Alert notification | `Alert` |
| `N8nNotice` | Notice banner | `Notice` |
| `N8nInfoTip` | Info tooltip | `InfoTip` |
| `N8nTooltip` | Tooltip wrapper | `Tooltip` |
| `N8nPopover` | Popover | `Popover` |
| `N8nFloatingWindow` | Floating window (for AI chat) | `FloatingWindow` |
| `N8nKeyboardShortcut` | Keyboard shortcut display | `KeyboardShortcut` |

### 6.6 Layout components

| Component | Purpose | FlowHolt equivalent |
|---|---|---|
| `N8nCard` | Card container | `Card` |
| `N8nActionBox` | Action card with icon + text + button | `ActionBox` |
| `N8nActionDropdown` | Dropdown with action items | `ActionDropdown` |
| `N8nActionToggle` | Toggle-style action | `ActionToggle` |
| `N8nActionPill` | Pill-shaped action button | `ActionPill` |
| `N8nCollapsiblePanel` | Collapsible section | `CollapsiblePanel` |
| `N8nSectionHeader` | Section header with optional actions | `SectionHeader` |
| `N8nResizeWrapper` | Resizable container | `ResizeWrapper` |
| `N8nResizeableSticky` | Resizable sticky note | `ResizeableSticky` |
| `N8nSticky` | Non-resizable sticky | `Sticky` |
| `N8nRecycleScroller` | Virtual scroll list | `VirtualScroller` |
| `N8nScrollArea` | Custom scrollbar area | `ScrollArea` |
| `N8nResizeObserver` | Resize observer wrapper | `ResizeObserver` |
| `N8nSelectableList` | List with checkboxes | `SelectableList` |
| `ConditionalRouterLink` | Conditional link wrapper | `ConditionalLink` |

### 6.7 AI-specific components

| Component | Purpose | FlowHolt equivalent |
|---|---|---|
| `N8nAskAssistantButton` | Floating AI assistant trigger | `AiAssistantButton` |
| `N8nAskAssistantChat` | AI chat interface | `AiAssistantChat` |
| `N8nAssistantIcon` | AI icon | `AiIcon` |
| `N8nAssistantAvatar` | AI avatar | `AiAvatar` |
| `N8nAssistantText` | AI text formatting | `AiText` |
| `N8nInlineAskAssistantButton` | Inline AI help in form fields | `InlineAiButton` |
| `N8nCanvasThinkingPill` | AI building indicator on canvas | `CanvasThinkingPill` |
| `N8nCanvasCollaborationPill` | Collaboration indicator on canvas | `CanvasCollaborationPill` |
| `N8nSuggestedActions` | AI suggested action buttons | `SuggestedActions` |
| `N8nSendStopButton` | Send/stop toggle for AI chat | `SendStopButton` |
| `MessageWrapper` | Chat message container | `ChatMessageWrapper` |
| `ThinkingMessage` | AI thinking indicator | `ThinkingMessage` |
| `N8nMessageRating` | Message quality rating | `MessageRating` |
| `BlinkingCursor` | Typing indicator | `BlinkingCursor` |
| `N8nPreviewTag` | Preview/beta tag | `PreviewTag` |
| `BetaTag` | Beta feature tag | `BetaTag` |

### 6.8 Specialized components

| Component | Purpose | FlowHolt equivalent |
|---|---|---|
| `N8nCanvasPill` | Generic canvas overlay pill | `CanvasPill` |
| `CodeDiff` | Code diff viewer | `CodeDiff` |
| `DateRangePicker` (4 exports) | Date range selection | `DateRangePicker` |
| `IconTextButton` | Icon + text button variant | `IconTextButton` |

---

## 7. Canvas Element Components

### 7.1 Canvas background

| Component | Purpose | FlowHolt |
|---|---|---|
| `CanvasBackground.vue` | Canvas background pattern | ✅ (React Flow default) |
| `CanvasBackgroundStripedPattern.vue` | Striped pattern variant | 🔴 New |

### 7.2 Canvas buttons

| Component | Purpose | FlowHolt |
|---|---|---|
| `CanvasChatButton.vue` | Open/toggle chat | 🔴 New |
| `CanvasClearExecutionDataButton.vue` | Clear execution data | ✅ Plan |
| `CanvasControlButtons.vue` | Zoom controls (fit, zoom in/out, reset) | ✅ (React Flow controls) |
| `CanvasRunWorkflowButton.vue` | Run workflow (split button variant) | ✅ Plan |
| `CanvasStopCurrentExecutionButton.vue` | Stop execution | ✅ Plan |
| `CanvasStopWaitingForWebhookButton.vue` | Stop waiting for webhook | ✅ Plan |

### 7.3 Canvas edges

| Component | Purpose | FlowHolt |
|---|---|---|
| `CanvasArrowHeadMarker.vue` | SVG arrow head for edges | ✅ (React Flow default) |
| `CanvasConnectionLine.vue` | Temporary connection line (dragging) | ✅ (React Flow default) |
| `CanvasEdge.vue` | Edge (connection) component | ✅ Custom edge |
| `CanvasEdgeToolbar.vue` | Toolbar on edge hover (+ button) | 🔴 New — add node on edge |

### 7.4 Canvas nodes (in `elements/nodes/`)

Separate node components per render type, likely including:
- Default node
- Trigger node
- Sticky note node
- Add nodes placeholder
- AI agent cluster node
- Choice prompt node (AI builder empty state)

---

## 8. Undo/Redo History System

### 8.1 History events (8 event types via `historyBus`)

| Event | Handler | Purpose |
|---|---|---|
| `nodeMove` | `onRevertNodePosition` | Undo node position change |
| `revertAddNode` | `onRevertAddNode` | Undo node addition |
| `revertRemoveNode` | `onRevertDeleteNode` | Undo node deletion |
| `revertAddConnection` | `onRevertCreateConnection` | Undo connection creation |
| `revertRemoveConnection` | `onRevertDeleteConnection` | Undo connection deletion |
| `revertRenameNode` | `onRevertRenameNode` | Undo node rename |
| `revertReplaceNodeParameters` | `onRevertReplaceNodeParameters` | Undo parameter change |
| `enableNodeToggle` | `onRevertToggleNodeDisabled` | Undo enable/disable |

---

## 9. Collaboration System UI

### 9.1 Write access model

- `collaborationStore.shouldBeReadOnly` — true when another tab/user has write lock
- `collaborationStore.isCurrentUserWriter` — current user is the writer
- `collaborationStore.isCurrentTabWriter` — this specific tab is the writer
- `collaborationStore.currentWriter` — the user object who has write access
- `collaborationStore.requestWriteAccess()` — request write lock (on first edit)
- `collaborationStore.requestWriteAccessForce()` — force acquire (take over)
- `useActivityDetection()` — heartbeat for write access keepalive

### 9.2 Collaboration UI elements

| Element | When shown | Purpose |
|---|---|---|
| `N8nCanvasCollaborationPill` | Another user/tab has write lock | Shows writer's name + "Acquire" button |
| `CollaborationPane` | Always in workflow header | Shows user avatars of active viewers |
| Read-only toast | User tries to edit without write access | "Read-only" notification |

---

## 10. Auto-save System

### 10.1 Auto-save states (`AutoSaveState`)

- `Idle` — no pending save
- `Scheduled` — debounced save is queued
- `InProgress` — save is in flight

### 10.2 Auto-save triggers

- `dirtyStateSetCount` watcher — any edit triggers auto-save (debounced)
- AI builder streaming end — triggers auto-save when builder finishes
- Skipped during: AI builder streaming, collaboration read-only, demo mode

### 10.3 Save-before-publish flow

1. If auto-save in progress → wait for it
2. If auto-save scheduled → cancel and save immediately
3. If not saved → save immediately
4. Then open publish modal

---

## 11. Document Title System (`useDocumentTitle`)

Title states:
- `IDLE` — workflow name only
- `AI_BUILDING` — "[AI] workflow name"
- Reset on unmount/delete

---

## 12. Route Query Actions

When navigating to `/workflow/:id?action=X`:

| Action | Effect |
|---|---|
| `addEvaluationTrigger` | Opens node creator for evaluation trigger nodes |
| `addEvaluationNode` | Opens node creator for evaluation nodes |
| `executeEvaluation` | Runs the evaluation trigger node |
| `settings` (query param) | Opens workflow settings modal |

---

## 13. Event Bus Architecture

### 13.1 `nodeViewEventBus` (cross-component communication)

| Event | Purpose |
|---|---|
| `importWorkflowData` | Import workflow JSON data |
| `importWorkflowUrl` | Import workflow from URL |
| `importWorkflowFromFile` | Trigger file import input |
| `openChat` | Open chat panel |
| `archiveWorkflow` | Archive workflow |
| `unarchiveWorkflow` | Unarchive workflow |
| `deleteWorkflow` | Delete workflow |
| `renameWorkflow` | Focus rename input |
| `addTag` | Enable tag editing |
| `runWorkflowButton:mouseenter` | Run button hover (highlight triggers) |
| `runWorkflowButton:mouseleave` | Run button leave |

### 13.2 `canvasEventBus` (canvas-specific events)

| Event | Purpose |
|---|---|
| `saved:workflow` | Workflow saved successfully |
| `open:execution` | Execution opened (show errors/warnings) |
| `create:sticky` | Create sticky note |
| `tidyUp` | Auto-layout nodes |
| `nodes:select` | Programmatic node selection |

### 13.3 `sourceControlEventBus`

| Event | Purpose |
|---|---|
| `pull` | Source control pull completed (refresh data) |

---

## 14. Composables Used in NodeView (19 composables)

| Composable | Purpose | FlowHolt equivalent |
|---|---|---|
| `useRunWorkflow` | Execute workflow, stop execution | `useRunWorkflow` |
| `useGlobalLinkActions` | Register/unregister custom actions | `useGlobalActions` |
| `useCanvasOperations` | Node/connection CRUD, import, reset | `useCanvasOperations` |
| `useWorkflowExtraction` | Extract sub-workflow | `useWorkflowExtraction` |
| `useKeybindings` | Keyboard shortcuts | `useKeybindings` |
| `useNodeHelpers` | Node issue checking | `useNodeHelpers` |
| `useClipboard` | Copy/paste | `useClipboard` |
| `useBeforeUnload` | Unsaved changes warning | `useBeforeUnload` |
| `useWorkflowSaving` | Save, auto-save, prompt save | `useWorkflowSaving` |
| `useToast` | Toast notifications | `useToast` |
| `useMessage` | Confirm/prompt dialogs | `useMessage` |
| `useDocumentTitle` | Browser tab title | `useDocumentTitle` |
| `useTelemetry` | Event tracking | `useTelemetry` |
| `useExternalHooks` | External hook system | N/A |
| `useI18n` | Internationalization | `useI18n` |
| `usePinnedData` | Pin data management | `usePinnedData` |
| `useWorkflowHelpers` | Workflow data utilities | `useWorkflowHelpers` |
| `useActivityDetection` | Collaboration heartbeat | `useActivityDetection` |
| `useWorkflowActivate` | Activate/deactivate workflow | `useWorkflowActivate` |

---

## Summary — new UI elements FlowHolt should plan

### Critical (Phase 1)
1. Per-workflow tab bar (Editor / Runs / Tests)
2. Inline workflow name editing with breadcrumbs
3. Workflow tags system
4. 6-state publish button with indicators
5. Auto-save with collaboration write locking
6. 21 context menu actions with keyboard shortcuts
7. NDV V2 dual-panel inspector
8. 5 data display modes (Table, JSON, Schema, HTML, Binary)
9. Expression editor (inline + modal)
10. Parameter input system (15+ input types)

### High (Phase 1-2)
11. Canvas collaboration pill + thinking pill
12. AI chat button on canvas
13. Focus sidebar panel
14. Undo/redo history (8 event types)
15. Node creator with replacement mode
16. Import cURL modal
17. Binary data viewer
18. Canvas edge toolbar (add node on connection)
19. Canvas control buttons (zoom, fit, reset)
20. Workflow history button + named versions

### Medium (Phase 2-3)
21. Sub-workflow extraction modal
22. AI focus on selected nodes
23. AI empty state builder prompt
24. Production checklist validation
25. Source control push action
26. Change owner action
27. Schema preview API
28. Mapping pills (drag data references)
29. Run info panel (timing, retries)
30. Redacted data state display

---

## 15. Workflows List View (`WorkflowsView.vue`, 2293 lines)

### 15.1 Stores used (17 stores)

| Store | Purpose |
|---|---|
| `sourceControlStore` | Read-only env detection, pull refresh |
| `usersStore` | Current user, personalization survey |
| `workflowsStore` | Workflow CRUD (archive, unarchive, update) |
| `workflowsListStore` | Paginated workflow fetching, active workflows, delete |
| `settingsStore` | Feature flags (folders, tags, enterprise, MCP) |
| `projectsStore` | Current project, available projects |
| `uiStore` | Modals, node view state |
| `tagsStore` | Tag fetching/lookup |
| `foldersStore` | Folder CRUD, breadcrumbs cache, drag state |
| `usageStore` | License info |
| `insightsStore` | Weekly execution insights summary |
| `aiStarterTemplatesStore` | AI starter workflow collection experiment |
| `personalizedTemplatesStore` | Personalized template suggestions experiment |
| `readyToRunWorkflowsStore` | Ready-to-run workflows experiment |
| `personalizedTemplatesV2Store` | Template recommendations V2 experiment |
| `personalizedTemplatesV3Store` | Template recommendations V3 experiment |
| `readyToRunStore` | Ready-to-run simplified layout experiment |

### 15.2 Filters system

**Filter model (`Filters` interface):**

| Filter | Type | Default | Query string param | FlowHolt |
|---|---|---|---|---|
| `search` | `string` | `''` | `?search=...` | ✅ Plan |
| `homeProject` | `string` | `''` | `?homeProject=...` | ✅ Plan |
| `status` | `string \| boolean` | `StatusFilter.ALL` | `?status=true/false` | ✅ Plan |
| `showArchived` | `boolean` | `false` | `?showArchived=true` | ✅ Plan |
| `tags` | `string[]` | `[]` | `?tags=id1,id2` | ✅ Plan |

**Status filter options:**
- `ALL` → `''` — show all workflows
- `ACTIVE` → `'active'` — only published/active
- `DEACTIVATED` → `'deactivated'` — only deactivated

**Filter persistence:**
- All filters are synced to URL query string (bidirectional)
- Sort and page size persisted to `localStorage` via `useN8nLocalStorage`

### 15.3 Sorting system

| Sort key (UI) | API sort value | FlowHolt |
|---|---|---|
| `lastUpdated` | `updatedAt:desc` | ✅ Plan |
| `lastCreated` | `createdAt:desc` | ✅ Plan |
| `nameAsc` | `name:asc` | ✅ Plan |
| `nameDesc` | `name:desc` | ✅ Plan |

### 15.4 Pagination

- Server-side pagination (`type: 'list-paginated'`)
- Default page size: `DEFAULT_WORKFLOW_PAGE_SIZE` (likely 25)
- Available sizes: `[10, 25, 50, 100]`
- `ElPagination` component from Element Plus
- Page, sort, and pageSize changes emit `update:pagination-and-sort`

### 15.5 Folder system

**6 folder actions (`FOLDER_LIST_ITEM_ACTIONS`):**

| Action | Label | Condition | Available on |
|---|---|---|---|
| `OPEN` | Open | Always | Card only |
| `CREATE` | Create folder | Not read-only, has create permission | Both |
| `CREATE_WORKFLOW` | Create workflow | Not read-only, has create permission | Both |
| `RENAME` | Rename | Not read-only, has update permission | Both |
| `MOVE` | Move to folder | Not read-only, has update permission | Both |
| `DELETE` | Delete | Not read-only, has delete permission | Both |

**Folder display conditions:**
- Folders shown when: `foldersEnabled && !isOverviewSubPage && !isSharedSubPage`
- Folders hidden when: tag filters active OR status filter active (folders can't be filtered by these)

**Folder breadcrumbs:**
- `FolderBreadcrumbs` component with parent path
- Current folder name inline-editable (`N8nInlineTextEdit`)
- Drag-and-drop onto breadcrumb items to move resources
- Lazy-load hidden breadcrumb items on tooltip hover

**Folder creation flow:**
1. `message.prompt()` → modal with folder name input
2. Validates name via `folderHelpers.validateFolderName`
3. Creates via `foldersStore.createFolder()`
4. Shows success toast with link to new folder
5. Optionally navigates or refreshes list

**Folder deletion flow:**
- Empty folder → direct delete via `foldersStore.deleteFolder()`
- Non-empty folder → opens `DeleteFolderModal` via `uiStore.openDeleteFolderModal()`
- On delete: navigates to parent folder if current folder was deleted

**Folder move flow:**
- Opens `MoveToFolderModal` via `uiStore.openMoveToFolderModal()`
- Shows success toast with link to destination
- Auto-navigates if current folder was moved

### 15.6 Drag and drop system

**Architecture:**
- `Draggable` wrapper component around each card
- `useAutoScrollOnDrag` composable for auto-scrolling container
- `foldersStore.draggedElement` tracks what's being dragged
- `foldersStore.activeDropTarget` tracks hover target
- Drop targets: folder cards, breadcrumb items, project root

**Drag types:**
- Folders → can be dropped onto other folders or project root
- Workflows → can be dropped onto folders or project root

**Visual states:**
- `.drag-active` → cursor: grabbing on all children
- `.dragging` → opacity: 0.3, dashed border, pointer-events: none
- `.drop-active` → border: secondary color, background highlight

**Permissions:**
- Drag-and-drop disabled when: read-only env OR no folder update permission

### 15.7 Workflow card actions (11 actions)

| Action | Label | Condition | FlowHolt |
|---|---|---|---|
| `OPEN` | Open | Always | ✅ |
| `SHARE` | Share | Has share permission | ✅ Plan |
| `DUPLICATE` | Duplicate | Has read + create permission, not archived | ✅ Plan |
| `MOVE_TO_FOLDER` | Move to folder | Has update/move permission, folders enabled | ✅ Plan |
| `ARCHIVE` | Archive | Has delete permission, not archived | ✅ Plan |
| `DELETE` | Delete | Has delete permission, IS archived | ✅ Plan |
| `UNARCHIVE` | Unarchive | Has delete permission, IS archived | ✅ Plan |
| `UNPUBLISH` | Unpublish | Has unpublish permission, is published, not archived | 🔴 New |
| `ENABLE_MCP_ACCESS` | Enable MCP Access | MCP enabled, has update, not in MCP | 🔴 New |
| `REMOVE_MCP_ACCESS` | Remove MCP Access | MCP enabled, has update, already in MCP | 🔴 New |

### 15.8 Workflow card UI elements

**Card layout (`WorkflowCard.vue`, 874 lines):**

| Element | Position | Content | FlowHolt |
|---|---|---|---|
| **Name heading** | Top-left | Bold workflow name (`h2`) | ✅ |
| **Read-only badge** | After name | "Read only" tertiary badge | ✅ Plan |
| **Dynamic credentials badge** | After name | Key icon + "Dynamic" with tooltip | 🔴 New |
| **Resolver missing badge** | After name | Warning badge when resolver not set | 🔴 New |
| **Updated time** | Bottom-left | "Updated X ago" via `TimeAgo` | ✅ Plan |
| **Created date** | Bottom-left | "Created D Month" | ✅ Plan |
| **MCP icon** | Bottom-left | MCP icon with tooltip | 🔴 New |
| **Tags** | Bottom-left | Tag pills, truncated at 3 | ✅ Plan |
| **Dependency pill** | Right side | `DependencyPill` showing dependency count | 🔴 New |
| **Project badge** | Right side | `ProjectCardBadge` with ownership info | ✅ Plan |
| **Folder breadcrumbs** | Right side (inside badge) | Mini breadcrumbs showing folder path | ✅ Plan |
| **Archived label** | Right side | "Archived" text (when archived) | ✅ Plan |
| **Published indicator** | Right side | Green dot + "Published" (when published) | ✅ Plan |
| **Action toggle** | Far right | Three-dot menu with actions | ✅ |

**Card interactions:**
- Click → navigate to workflow editor
- Ctrl/Cmd+click → open in new tab
- Tag click → add tag to filters
- Card is draggable when folders + permissions enabled

### 15.9 ResourcesListLayout component (shared layout)

**Template slots (7 slots):**

| Slot | Purpose | Used for |
|---|---|---|
| `header` | Above list, full width | `ProjectHeader` + `InsightsSummary` |
| `add-button` | Next to search bar | Folder creation button |
| `callout` | Below header, above list | AI starter callout, personalized templates, ready-to-run callout |
| `breadcrumbs` | Below callout | `FolderBreadcrumbs` with inline edit |
| `item` | Each list item | `WorkflowCard` / `FolderCard` wrapped in `Draggable` |
| `empty` | No results state | Empty state cards, recommended templates |
| `filters` | Filter dropdown content | Tags dropdown, status select, archived checkbox |
| `postamble` | After list items | Empty folder action box, archived-only hint |

**Built-in UI features:**
- Search input with `Ctrl+F` hotkey capture
- Sort dropdown (`lastUpdated`, `lastCreated`, `nameAsc`, `nameDesc`)
- Filter dropdown (`ResourceFiltersDropdown`)
- Pagination with page size selector
- Loading skeleton state
- "No results" with filter reset option
- Virtual scrolling (`N8nRecycleScroller`) for full list mode

### 15.10 Empty states

**5 empty state variants:**

| Variant | Condition | UI | FlowHolt |
|---|---|---|---|
| **Simplified layout** | `readyToRunStore.getSimplifiedLayoutVisibility` | `EmptyStateLayout` with single "Add" button | 🔴 New (experiment) |
| **Shared section** | Shared sub-page + personal project | `EmptySharedSectionActionBox` | ✅ Plan |
| **Recommended templates inline** | Template recommendations enabled | `RecommendedTemplatesSection` | 🔴 New |
| **Start from scratch card** | No templates, can create | Card with file icon, "Start from scratch" | ✅ Plan |
| **Empty folder** | In a folder with 0 items | `N8nActionBox` with "Create workflow" button | ✅ Plan |

**Archived-only hint:**
- Shown when: 0 visible results, no filters, but `totalWorkflowCount > 0`
- Shows `N8nInfoTip` with "Show archived" link

### 15.11 Callout experiments (3 callout types)

| Callout | Condition | UI | FlowHolt |
|---|---|---|---|
| **AI Starter Collection** | Feature enabled, not dismissed, has permissions | Gift icon callout + "Start Now" button + dismiss X | 🔴 New |
| **Personalized Templates** | Feature enabled | `SuggestedWorkflows` with `SuggestedWorkflowCard` list | 🔴 New |
| **Ready-to-Run Workflows** | Feature enabled, not dismissed, has permissions | Bolt icon callout + "Start Now" button + dismiss X | 🔴 New |

### 15.12 Template recommendation experiments (3 variants)

| Variant | Store | Component | FlowHolt |
|---|---|---|---|
| V1 (inline) | `personalizedTemplatesStore` | `SuggestedWorkflows` | 🔴 Experiment |
| V2 | `personalizedTemplatesV2Store` | `TemplateRecommendationV2` | 🔴 Experiment |
| V3 | `personalizedTemplatesV3Store` | `TemplateRecommendationV3` | 🔴 Experiment |

### 15.13 Event bus (`workflowListEventBus`)

| Event | Handler | Purpose |
|---|---|---|
| `resource-moved` | `fetchWorkflows` | Refresh after any resource move |
| `workflow-duplicated` | `fetchWorkflows` | Refresh after duplication |
| `folder-deleted` | `onFolderDeleted` | Handle folder deletion with navigation |
| `folder-moved` | `moveFolder` | Handle folder move with toast + refresh |
| `folder-transferred` | `onFolderTransferred` | Handle cross-project folder transfer |
| `workflow-moved` | `onWorkflowMoved` | Handle workflow move to folder |
| `workflow-transferred` | `onWorkflowTransferred` | Handle cross-project workflow transfer |

### 15.14 Insights summary

- `InsightsSummary` component shown on overview sub-page
- Data from `insightsStore.weeklySummary`
- Displays weekly execution metrics
- Loading skeleton while fetching

### 15.15 Community Plus enrollment CTA

- Shown for self-hosted deployments without folders enabled
- User must have `community.register` permission
- Opens `COMMUNITY_PLUS_ENROLLMENT_MODAL` when clicking folder creation
- Custom heading for folder context

---

## 16. Workflow Card Badges & Indicators

### 16.1 Published state indicator

| State | Visual | Displayed |
|---|---|---|
| Not published | Nothing shown | - |
| Published (`activeVersionId !== null`) | Green dot + "Published" text | Right side of card |
| Archived | "Archived" text (light color) | Right side of card |

### 16.2 Permission badges

| Badge | Condition | Style |
|---|---|---|
| Read-only | `!workflowPermissions.update` | Tertiary badge |
| Dynamic credentials | `isDynamicCredentialsEnabled && hasResolvableCredentials` | Tertiary badge with key icon |
| Resolver missing | Dynamic credentials but no `credentialResolverId` | Warning badge |

### 16.3 Ownership display

| Element | Condition | Content |
|---|---|---|
| `ProjectCardBadge` | `showOwnershipBadge` | Project name/avatar |
| Folder breadcrumbs | `showOwnershipBadge && !isSomeoneElsesWorkflow && cardBreadcrumbs.length` | Mini path display |

---

## 17. Key Composables Used in WorkflowsView

| Composable | Purpose | FlowHolt equivalent |
|---|---|---|
| `useAutoScrollOnDrag` | Auto-scroll container during drag | `useAutoScrollOnDrag` |
| `useDebounce` | Debounced function calls | `useDebounce` |
| `useDocumentTitle` | Browser tab title management | `useDocumentTitle` |
| `useLatestFetch` | Race condition prevention for async fetches | `useLatestFetch` |
| `useDependencies` | Workflow dependency count fetching | `useDependencies` |
| `useFolders` | Folder name validation, drag helpers | `useFolders` |
| `useMessage` | Confirm/prompt dialogs | `useMessage` |
| `useProjectPages` | Page type detection (overview/shared) | `useProjectPages` |
| `useTelemetry` | Analytics tracking | `useTelemetry` |
| `useToast` | Toast notifications | `useToast` |
| `useWorkflowsEmptyState` | Empty state text and conditions | `useWorkflowsEmptyState` |
| `useWorkflowActivate` | Activate/deactivate/unpublish | `useWorkflowActivate` |
| `useMcp` | MCP access toggle tracking | N/A |
| `useDynamicCredentials` | Dynamic credential resolver detection | N/A |

---

## 18. Workflow Settings Modal (`WorkflowSettings.vue`, 1750 lines)

### 18.1 Modal structure

- **Key:** `WORKFLOW_SETTINGS_MODAL_KEY`
- **Width:** 65%, max-height 80%, scrollable
- **Title:** "Settings for {workflowName} ({workflowId})"
- **Layout:** `ElRow`/`ElCol` grid (10:14 ratio per row) inside `Modal` component
- **Footer:** Single "Save" button (disabled when read-only or no update permission)

### 18.2 Stores used (12 stores)

| Store | Purpose |
|---|---|
| `rootStore` | Execution timeout defaults, timezone |
| `settingsStore` | Default save options, enterprise features, module flags |
| `sourceControlStore` | Read-only env detection |
| `collaborationStore` | Collaboration read-only state |
| `workflowsStore` | Workflow ID, save state, update workflow |
| `workflowsListStore` | Fetch workflow details, search workflows |
| `workflowDocumentStore` | Settings snapshot, version ID, checksum |
| `workflowsEEStore` | Workflow owner name |
| `nodeCreatorStore` | Open node creator for Time Saved node |
| `posthogStore` | Feature flag for execution logic v2 experiment |
| `usePostHog` | PostHog experiment variant checks |

### 18.3 All settings fields (14 settings)

| # | Setting | Type | Control | Options | Condition | FlowHolt |
|---|---|---|---|---|---|---|
| 1 | **Execution Logic** | `executionOrder` + `binaryMode` | `N8nSelect` | v0 (Legacy), v1 (Default), v2 (Combined binary) | Always; v2 gated by experiment | ✅ Plan |
| 2 | **Error Workflow** | `errorWorkflow` | `N8nSelect` (remote filterable) | Workflows with errorTrigger node + "No workflow" | Always | ✅ Plan |
| 3 | **Credential Resolver** | `credentialResolverId` | `N8nSelect` (clearable, filterable) + edit button + "Create new" footer | List of credential resolvers | `isCredentialResolverEnabled` | 🔴 New |
| 4 | **Caller Policy** | `callerPolicy` | `N8nSelect` | none / sameOwner / fromAList / any | `isSharingEnabled` | ✅ Plan |
| 5 | **Caller IDs** | `callerIds` | `N8nInput` (text) | Free text (validated alphanumeric+comma) | `callerPolicy === 'workflowsFromAList'` | ✅ Plan |
| 6 | **Timezone** | `timezone` | `N8nSelect` (filterable) | All IANA timezones + DEFAULT | Always | ✅ Plan |
| 7 | **Save Failed Executions** | `saveDataErrorExecution` | `N8nSelect` | DEFAULT / Save / Don't save | Always | ✅ Plan |
| 8 | **Save Successful Executions** | `saveDataSuccessExecution` | `N8nSelect` | DEFAULT / Save / Don't save | Always | ✅ Plan |
| 9 | **Save Manual Executions** | `saveManualExecutions` | `N8nSelect` | DEFAULT / Save / Don't save | Always | ✅ Plan |
| 10 | **Save Execution Progress** | `saveExecutionProgress` | `N8nSelect` | DEFAULT / Save / Don't save | Always | ✅ Plan |
| 11 | **Redact Production Data** | `redactionPolicy` (computed) | `N8nSelect` | Default / Redact | `isRedactionSettingVisible` (module active + licensed or unlicensed) | 🔴 Enterprise |
| 12 | **Redact Manual Data** | `redactionPolicy` (computed) | `N8nSelect` | Default / Redact | `isRedactionSettingVisible` | 🔴 Enterprise |
| 13 | **Execution Timeout** | `executionTimeout` | `ElSwitch` toggle + 3× `N8nInput` (H/M/S) | Toggle on/off, then hours/minutes/seconds | Always | ✅ Plan |
| 14 | **Available in MCP** | `availableInMCP` | `ElSwitch` | On / Off | `isMCPEnabled` | 🔴 New |
| 15 | **Time Saved Per Execution** | `timeSavedPerExecution` + `timeSavedMode` | `N8nSelect` (fixed/dynamic) + `N8nInputNumber` | Fixed: number input; Dynamic: node detection | Always | 🔴 New |

### 18.4 Redaction policy mapping

The UI shows two separate toggles (Production / Manual) but they map to a single `redactionPolicy` field:

| Production toggle | Manual toggle | → `redactionPolicy` |
|---|---|---|
| default | default | `none` |
| redact | redact | `all` |
| redact | default | `non-manual` |
| default | redact | `manual-only` |

**Special case:** When workflow has dynamic credentials (`credentialResolverId` set), production redaction is forced to "redact" and the select is disabled.

### 18.5 Execution Logic options

| Key | Label | Binary mode | Execution order | Condition |
|---|---|---|---|---|
| `v0` | Legacy | `BINARY_MODE_SEPARATE` | `v0` | Always |
| `v1` | Default | `BINARY_MODE_SEPARATE` | `v1` | Always |
| `v2` | Combined binary | `BINARY_MODE_COMBINED` | `v1` | Experiment flag or already on v2 |

When switching to v2 and saving, a persistent warning toast is shown about the binary data change with a link to docs.

### 18.6 Error workflow selector

- Remote filterable `N8nSelect` searching for workflows with `n8n-nodes-base.errorTrigger` node
- Debounced search (300ms) via `debouncedLoadWorkflows`
- Inactive workflows shown but disabled with warning icon tooltip
- "No workflow" option prepended as default

### 18.7 Credential Resolver section

**Conditions:**
- Only shown when `isCredentialResolverEnabled` is true
- Requires `credentialResolver:list` permission to see options

**UI elements:**
- Filterable, clearable `N8nSelect` with resolver list
- "Create new" button in select footer (requires `credentialResolver:create`)
- Edit icon button next to select (shown when selected resolver has editable options + `credentialResolver:update`)
- Stale resolver auto-cleanup on mount if resolver was deleted externally

### 18.8 Caller Policy section

**Conditions:** Only shown when sharing is enabled (enterprise feature)

**Options:**
- `none` — No workflow can call this one
- `workflowsFromSameOwner` — Label dynamically shows personal/team project name
- `workflowsFromAList` — Shows additional `callerIds` text input (comma-separated workflow IDs)
- `any` — Any workflow can call

### 18.9 Execution Timeout

- Toggle `ElSwitch`: `-1` (disabled) ↔ `0` (enabled, awaiting input)
- When enabled: 3 `N8nInput` fields for hours, minutes, seconds
- Validation: timeout must be > 0 and ≤ `maxExecutionTimeout`
- On validation failure: error toast with max timeout in H:M:S format

### 18.10 Time Saved Per Execution

**Mode selector (`timeSavedMode`):**
- `fixed` — Manual number input (`N8nInputNumber`, min 0)
- `dynamic` — Detects `TIME_SAVED_NODE_TYPE` nodes in the workflow

**Dynamic mode states:**
- **Nodes detected:** Shows clock icon, count of detected nodes, "Add more" link
- **No nodes:** Shows "No nodes detected" with hint text
- "Add more" link → registers custom action `openSavedTimeNodeCreator` that closes modal and opens node creator

**Fixed mode with existing dynamic nodes:** Shows warning that dynamic nodes exist with link to open node creator

### 18.11 Save flow

1. Converts HMS timeout to total seconds
2. Validates timeout > 0 (if enabled) and ≤ max
3. Sends `workflowsStore.updateWorkflow()` with `versionId` and `expectedChecksum` for optimistic concurrency
4. Filters out `'DEFAULT'` values from local settings snapshot
5. Updates `workflowDocumentStore` settings
6. Shows success toast and closes modal
7. Tracks telemetry: `User updated workflow settings` with `workflow_id`, `time_saved`, `error_workflow`
8. If MCP enabled and toggled on, tracks MCP access
9. If binary mode changed, shows persistent warning toast

### 18.12 Permission gates

Every setting control uses this pattern:
```
:disabled="readOnlyEnv || !workflowPermissions.update"
```

Special cases:
- Redaction settings: also check `workflowPermissions.updateRedactionSetting`
- Redaction unlicensed: shows "Upgrade" badge linking to upgrade page
- MCP toggle: custom `mcpToggleDisabled` computed
- Credential resolver: additional `canListCredentialResolvers` / `canCreateCredentialResolver` / `canUpdateCredentialResolver`

### 18.13 Design system components used

| Component | Usage |
|---|---|
| `Modal` | Wrapper with content/footer slots |
| `N8nSelect` + `N8nOption` | All dropdown settings |
| `N8nInput` | Caller IDs, timeout fields |
| `N8nInputNumber` | Time saved per execution |
| `N8nButton` | Save button |
| `N8nIconButton` | Edit credential resolver |
| `N8nBadge` | "Upgrade" badge for unlicensed features |
| `N8nTooltip` | Help text tooltips on every setting |
| `N8nIcon` | Help icons, warning icons |
| `N8nText` | Dynamic credentials hint |
| `N8nLink` | Learn more link (rendered via `h()`) |
| `ElRow` / `ElCol` | Grid layout |
| `ElSwitch` | Timeout toggle, MCP toggle |

---

## 19. NDV Parameter System Deep-Dive

### 19.1 Component hierarchy

```
ParameterInputList (982 lines)
  └─ ParameterInputFull (650 lines)
       ├─ ParameterOptions (289 lines)        ← Fixed/Expression toggle, action menu
       ├─ ParameterInputWrapper (239 lines)    ← Expression resolution layer
       │    ├─ ParameterInput (2279 lines)     ← THE core input renderer
       │    └─ ParameterInputHint              ← Resolved expression preview
       ├─ FromAiOverrideButton                 ← AI override toggle
       ├─ FromAiOverrideField                  ← AI override pill display
       └─ ParameterOverrideSelectableList      ← AI override selectable list
  └─ MultipleParameter                        ← Array values handler
  └─ ImportCurlParameter                      ← cURL import UI
  └─ ResourceMapper                           ← Schema-aware field mapper
  └─ FilterConditions                         ← Condition builder UI
  └─ AssignmentCollection                     ← Key=value assignment builder
  └─ ButtonParameter                          ← Action button parameter
  └─ LazyCollectionParameter (async)          ← Optional params group
  └─ LazyFixedCollectionParameter (async)     ← Fixed-schema group
```

Also: `ParameterInputExpanded` (273 lines) — credential-specific variant of `ParameterInputFull`.

### 19.2 ParameterInputList (`ParameterInputList.vue`, 982 lines)

**Purpose:** Renders all node parameters for the NDV panel. Orchestrates which parameter type component to render.

**Stores:** `nodeTypesStore`, `ndvStore`, `workflowDocumentStore`

**Key patterns:**
- Uses `throttledWatch` (200ms) on `[parameters, nodeValues, node]` to compute `parameterItems[]` 
- Pre-calculates disabled states, display checks, and dependent parameter values
- Filters parameters through `shouldDisplayNodeParameter()` (async, uses expressions)
- Node-specific parameter transformations for Form Trigger, Form Node, and Wait Node
- Handles cleanup of removed parameters (emits `valueChanged` with `undefined`)
- Credential slot positioning: finds correct index to inject credentials UI

**Parameter type → Component mapping:**

| Parameter type | Component | Notes |
|---|---|---|
| `multipleValues: true` | `MultipleParameter` | Array of values |
| `curlImport` | `ImportCurlParameter` | |
| `notice` | `N8nNotice` | Read-only notice text |
| `callout` | `N8nCallout` | Dismissable, with optional action link |
| `button` | `ButtonParameter` | |
| `collection` | `LazyCollectionParameter` | Async-loaded, with Suspense |
| `fixedCollection` | `LazyFixedCollectionParameter` | Async-loaded, with Suspense |
| `resourceMapper` | `ResourceMapper` | Schema-aware mapping |
| `filter` | `FilterConditions` | Condition builder |
| `assignmentCollection` | `AssignmentCollection` | Key=value builder |
| `credentials` | Slot (injected externally) | |
| All others | `ParameterInputFull` | Default handler |

**Design system components:** `N8nNotice`, `N8nCallout`, `N8nInputLabel`, `N8nTooltip`, `N8nIcon`, `N8nIconButton`, `N8nLink`, `N8nText`

### 19.3 ParameterInputFull (`ParameterInputFull.vue`, 650 lines)

**Purpose:** Wraps `ParameterInputWrapper` with label, options menu, drag-and-drop, and "From AI" override support.

**Key features:**
- **Inline switch layout** — Boolean parameters render as inline toggle + label (when collection overhaul enabled)
- **DraggableTarget** — Every parameter field is a drop target for expression mapping
- **ParameterOptions** — Positioned at top, bottom, or top-absolute
- **From AI override** — `FromAiOverrideButton` + `FromAiOverrideField` for AI-powered parameter filling
- **Expression selector visibility** — Hidden for resource locators with only list mode, or when AI-overridden

**Events:** `blur`, `update`, `hover`, `drop`

**Drop handling (`onDrop`):**
- Uses `getMappedResult()` to compute mapped expression value
- Special handling for ResourceLocator values (mode switching from list → id)
- Shows onboarding toast for first-time mapping
- Tracks mapping telemetry with dest_node_type, parameter, mode, and success

### 19.4 ParameterInputWrapper (`ParameterInputWrapper.vue`, 239 lines)

**Purpose:** Thin wrapper that resolves expressions and passes them to `ParameterInput`.

**Key additions over raw ParameterInput:**
- Resolves expression via `useResolvedExpression()` composable
- Injects `$vars` (environment variables) and `$secrets` (external secrets) into expression context
- Binary data access tooltip via `useBinaryDataAccessTooltip()`
- Hint computation from parameter definition or resource locator mode
- Exposes `isSingleLineInput`, `displaysIssues`, `focusInput()`, `selectInput()`

### 19.5 ParameterInput (`ParameterInput.vue`, 2279 lines) — THE CORE

**Purpose:** The monolithic input renderer that handles ALL parameter types. This is the most important component in the NDV.

**Stores (14 stores):**

| Store | Purpose |
|---|---|
| `credentialsStore` | Credential type lookup |
| `ndvStore` | Active node, mappable input focus, input data state |
| `workflowsStore` | Workflow ID, execution data |
| `workflowsListStore` | Archived workflow detection |
| `workflowDocumentStore` | Node property updates |
| `settingsStore` | Cloud deployment check |
| `nodeTypesStore` | Node type info, parameter options loading |
| `uiStore` | Active credential type |
| `focusPanelStore` | Focus panel parameter tracking |
| `experimentalNdvStore` | Experimental NDV feature flag |
| `projectsStore` | Current project ID |
| `builderStore` | AI builder placeholder tracking |

**Props (22 props):**

| Prop | Type | Purpose |
|---|---|---|
| `parameter` | `INodeProperties` | Parameter definition |
| `path` | `string` | Parameter path in node |
| `modelValue` | `NodeParameterValueType` | Current value |
| `expressionEvaluated` | `unknown` | Pre-resolved expression result |
| `isReadOnly` | `boolean` | Disable editing |
| `isAssignment` | `boolean` | Assignment collection context |
| `droppable` / `activeDrop` | `boolean` | Drag-and-drop states |
| `forceShowExpression` | `boolean` | Force expression editor visible |
| `hideIssues` | `boolean` | Suppress issue indicators |
| `errorHighlight` | `boolean` | Red border on error |
| `isForCredential` | `boolean` | Credential context (affects placeholders) |
| `canBeOverridden` | `boolean` | AI override eligible |
| `hideLabel` | `boolean` | Hide parameter label |

**Parameter type rendering (template):**

| Priority | Condition | Renders |
|---|---|---|
| 1 | `type === 'resourceLocator'` | `ResourceLocator` |
| 2 | `type === 'workflowSelector'` | `WorkflowSelectorParameterInput` |
| 3 | `type === 'icon'` (not expression) | `N8nIconPicker` |
| 4 | Expression mode active | `ExpressionParameterInput` |
| 5 | `type in ['json', 'string']` | Various editors or `N8nInput` |
| 6 | `type === 'color'` | `ElColorPicker` + `N8nInput` |
| 7 | `type === 'dateTime'` | `ElDatePicker` |
| 8 | `type === 'number'` | `N8nInputNumber` |
| 9 | `type === 'credentialsSelect'` | `CredentialsSelect` |
| 10 | `type === 'options'` | `N8nSelect` (filterable, single) |
| 11 | `type === 'multiOptions'` | `N8nSelect` (filterable, multiple) |
| 12 | `type === 'boolean'` | `N8nSwitch2` or `ElSwitch` (experiment) |

**Editor sub-types (for string/json type):**

| Editor type | Component | Notes |
|---|---|---|
| `codeNodeEditor` | `CodeNodeEditor` | JS/Python, with AI button on cloud |
| `htmlEditor` | `HtmlEditor` | Expression coloring for HTML node |
| `cssEditor` | `CssEditor` | |
| `sqlEditor` | `SqlEditor` | Dialect-aware |
| `jsEditor` | `JsEditor` | PostHog capture for AI Transform |
| `json` (default) | `JsonEditor` | Custom auth redaction handling |
| None | `N8nInput` (text/textarea/password) | Fallback |

All editors have:
- Inline mode (in NDV) with fullscreen button
- Fullscreen mode (in `ElDialog`)
- Debounced value updates

**Key methods:**
- `loadRemoteParameterOptions()` — Fetches options from server via `nodeTypesStore.getNodeParameterOptions()`
- `valueChanged()` — Main value update handler with expression detection, color conversion, telemetry
- `optionSelected()` — Handles addExpression/removeExpression/resetValue/refreshOptions/formatHtml/focus
- `setFocus()` — Complex focus management with mode-switch protection

**Watchers (7 watchers):**
- Credentials change → reload remote options
- Dependent parameters change → reload remote options
- Model value change → update temp display value
- Remote options loading → update display
- Expression mode toggle → refocus input
- Invalid parameter options → Sentry capture
- onUpdated → external hooks for remote parameter DOM

### 19.6 ParameterOptions (`ParameterOptions.vue`, 289 lines)

**Purpose:** The Fixed/Expression toggle and action menu for each parameter.

**UI structure:**
1. **Focus panel button** (`N8nIconButton` icon="panel-right") — Opens parameter in focus/detail panel
2. **Action menu** (`N8nActionToggle`) — Reset value, refresh list, format HTML
3. **Expression selector** (`N8nRadioButtons`) — Fixed ↔ Expression toggle
4. **Delete button** (`N8nIconButton` icon="trash-2") — Delete from collection

**Action menu items:**
- **Reset value** — Resets to default (disabled when already default)
- **Refresh list** — For remote-method parameters and resource locators in list mode
- **Format HTML** — For htmlEditor type parameters

**Visibility rules:**
- Expression selector hidden in Chat Hub Tool context, when `noDataExpression`, or read-only
- Options menu hidden for `collection`, `credentialsSelect`, `codeNodeEditor`, `sqlEditor` types
- Focus panel hidden for node settings, read-only, AI-overridden, or Chat Hub context

### 19.7 ResourceLocator (`ResourceLocator.vue`, 1208 lines)

**Purpose:** Smart input for selecting external resources (e.g., Google Sheets, Notion pages) with multiple modes.

**Modes:**
- **list** — Dropdown with server-loaded resources (searchable, paginated)
- **id** — Direct ID input
- **url** — URL input with link preview

**Key features:**
- **Mode selector** — `N8nSelect` dropdown when multiple modes available
- **Resource dropdown** — `ResourceLocatorDropdown` with search, pagination, loading states
- **Credential error detection** — Detects 401/403 errors and shows credential fix links
- **New resource creation** — "Create new" button via `allowNewResource` mode option
- **Slow load notice** — Timer-based notice for long API calls
- **Cache** — `cachedResponses` keyed by serialized request params
- **URL resolution** — Computes clickable URLs from templates (`{{$value}}` substitution)
- **From AI override** — Full `FromAiOverrideButton`/`FromAiOverrideField` support
- **DraggableTarget** — Drag-and-drop mapping (switches from list mode to id mode)
- **Expression mode** — Renders `ExpressionParameterInput` when in expression mode

**Error handling:**
- Credential-related error messages de-duplicated via regex
- Shows "Create new credential" or "Check credentials" links based on error type
- Stack trace analysis for auth-related errors

**Stores:** `nodeTypesStore`, `ndvStore`, `rootStore`, `uiStore`, `workflowsStore`, `projectsStore`, `workflowDocumentStore`

### 19.8 Expression Editor Composable (`useExpressionEditor.ts`, 545 lines)

**Purpose:** CodeMirror-based expression editing engine shared by inline and modal expression editors.

**Architecture:**
- Creates a CodeMirror `EditorView` with custom extensions
- Parses expression syntax tree into `Segment[]` (Resolvable | Plaintext)
- Resolves resolvable segments against workflow context
- Color-highlights resolvable segments based on resolution state

**Key inputs:**
- `editorRef` — DOM element to mount editor in
- `editorValue` — Reactive expression string
- `extensions` — Additional CodeMirror extensions
- `additionalData` — Extra expression context (`$vars`, `$secrets`)
- `autocompleteTelemetry` — Autocomplete usage tracking

**Resolution contexts (3 strategies):**
1. **Expression local resolve** — For embedded/sub-workflow contexts
2. **Credentials modal** — `Expression.resolveWithoutWorkflow()` (no workflow needed)
3. **Normal NDV** — Full workflow resolution with target item, input node, run/branch index

**Outputs:**
- `editor` — CodeMirror EditorView ref
- `hasFocus` — Focus state
- `segments.all/html/display/plaintext/resolvable` — Parsed and resolved segments
- `setCursorPosition()` / `select()` / `selectAll()` / `focus()`

**Key behaviors:**
- Debounced segment update (200ms)
- Generation counter prevents stale async resolution
- Grammarly disabled via `data-gramm="false"`
- Click-outside blur handler
- Ctrl+F suppression in inline editor mode

### 19.9 ParameterInputExpanded (`ParameterInputExpanded.vue`, 273 lines)

**Purpose:** Credential-specific variant of `ParameterInputFull`. Used in credential modals.

**Differences from ParameterInputFull:**
- Uses `i18n.credText()` instead of `i18n.nodeText()` for labels/placeholders/hints
- Shows validation errors for required fields after blur
- Supports `fixedCollection` type with `LazyFixedCollectionParameter`
- Tracks credential docs link clicks via telemetry
- Uses `N8nInputLabel` with `required` indicator
- No drag-and-drop support
- No "From AI" override

### 19.10 Complete parameter type catalog

| Parameter type | Input control | Supports expression | Notes |
|---|---|---|---|
| `string` | `N8nInput` (text/textarea/password) | ✅ | Editor subtypes: code, html, css, sql, js, json |
| `number` | `N8nInputNumber` | ✅ (via paste) | Min/max/precision from typeOptions |
| `boolean` | `N8nSwitch2` / `ElSwitch` | ✅ | Inline layout with collection overhaul |
| `options` | `N8nSelect` (filterable, single) | ✅ | Remote options via `loadOptionsMethod` |
| `multiOptions` | `N8nSelect` (filterable, multiple) | ✅ | |
| `color` | `ElColorPicker` + `N8nInput` | ✅ | RGBA↔Hex conversion, alpha support |
| `dateTime` | `ElDatePicker` | ✅ | Date-only or datetime mode |
| `json` | `JsonEditor` | ✅ | Fullscreen dialog, custom auth redaction |
| `credentialsSelect` | `CredentialsSelect` | ❌ | Special credential type picker |
| `resourceLocator` | `ResourceLocator` | ✅ | Multi-mode: list/id/url |
| `workflowSelector` | `WorkflowSelectorParameterInput` | ✅ | Archived workflow detection |
| `icon` | `N8nIconPicker` | ✅ | Emoji and icon selection |
| `collection` | `CollectionParameter` (async) | N/A | Group of optional params |
| `fixedCollection` | `FixedCollectionParameter` (async) | N/A | Fixed-schema group |
| `resourceMapper` | `ResourceMapper` | N/A | Schema-aware field mapping |
| `filter` | `FilterConditions` | N/A | Condition builder |
| `assignmentCollection` | `AssignmentCollection` | N/A | Key=value assignment |
| `button` | `ButtonParameter` | ❌ | Action trigger |
| `curlImport` | `ImportCurlParameter` | ❌ | cURL import |
| `notice` | `N8nNotice` | ❌ | Read-only notice |
| `callout` | `N8nCallout` | ❌ | Dismissable info callout |
| `credentials` | Slot (external) | N/A | Injected at computed index |

### 19.11 Design system components used across parameter system

| Component | Used in | Purpose |
|---|---|---|
| `N8nInput` | ParameterInput, ResourceLocator | Text/textarea/password fields |
| `N8nInputNumber` | ParameterInput | Number fields |
| `N8nSelect` + `N8nOption` | ParameterInput, ResourceLocator | Dropdown selects |
| `N8nSwitch2` | ParameterInput | Boolean toggle (new) |
| `N8nIconPicker` | ParameterInput | Icon/emoji picker |
| `N8nInputLabel` | ParameterInputFull, ParameterInputExpanded, ParameterInputList | Label + tooltip + options slot |
| `N8nRadioButtons` | ParameterOptions | Fixed/Expression toggle |
| `N8nActionToggle` | ParameterOptions | Action menu (reset, refresh, format) |
| `N8nIconButton` | ParameterOptions, ParameterInputList | Focus panel, delete, edit |
| `N8nIcon` | ParameterInput, ResourceLocator, ParameterInputList | Icons throughout |
| `N8nTooltip` | ParameterInputWrapper, ParameterInputList | Contextual tooltips |
| `N8nCallout` | ParameterInputList | Callout parameter type |
| `N8nNotice` | ParameterInputList, ResourceLocator | Notice parameter type, error notices |
| `N8nText` | ParameterOptions, ParameterInputList, ResourceLocator | Text labels |
| `N8nLink` | ParameterInputList, ResourceLocator | Action links |
| `ElColorPicker` | ParameterInput | Color parameter type |
| `ElDatePicker` | ParameterInput | DateTime parameter type |
| `ElSwitch` | ParameterInput | Boolean toggle (legacy) |
| `ElDialog` | ParameterInput | Fullscreen editor modal |

### 19.12 Composables used

| Composable | Component | Purpose |
|---|---|---|
| `useExpressionEditor` | InlineExpressionEditorInput, ExpressionEditorModalInput | CodeMirror expression editor |
| `useResolvedExpression` | ParameterInputWrapper | Resolve expressions to display |
| `useNodeHelpers` | ParameterInput | Credential issue updates |
| `useWorkflowHelpers` | ParameterInput, ResourceLocator, useExpressionEditor | Expression resolution, parameter resolution |
| `useNodeSettingsParameters` | ParameterInput, ParameterInputList | Focus panel, display checks |
| `useDebounce` | ParameterInput, ResourceLocator | Debounced actions |
| `useCollectionOverhaul` | ParameterInput, ParameterInputFull, ParameterInputList | Boolean inline switch experiment |
| `useBinaryDataAccessTooltip` | ParameterInputWrapper | Binary data tooltip text |
| `useCalloutHelpers` | ParameterInputList | Callout dismiss, sample workflow |
| `useAutocompleteTelemetry` | useExpressionEditor | Autocomplete tracking |

### 19.13 FlowHolt relevance summary

| Area | FlowHolt status | Notes |
|---|---|---|
| All basic parameter types | ✅ Must implement | Core NDV functionality |
| Expression editor (inline + modal) | ✅ Must implement | CodeMirror-based with resolvable highlighting |
| ResourceLocator | ✅ Must implement | Multi-mode resource picker |
| Remote options loading | ✅ Must implement | Server-side parameter option fetching |
| From AI override | 🔴 New feature | AI-powered parameter filling |
| Focus panel | 🔴 Experimental | Open parameter in side panel |
| Collection overhaul | 🔴 Experimental | Boolean inline switch layout |
| Drag-and-drop mapping | ✅ Must implement | Expression mapping from input panel |
| WorkflowSelector | ✅ Must implement | Workflow picker with archive detection |
| ResourceMapper | ✅ Must implement | Schema-aware field mapping |
| FilterConditions | ✅ Must implement | Condition builder |
| AssignmentCollection | ✅ Must implement | Key=value assignment builder |

---

## 20. Execution Views Deep-Dive

### 20.1 Architecture overview

Two execution view contexts:

1. **Global executions page** (`/executions`) — shows ALL executions across workflows
2. **Workflow-scoped executions** (`/workflow/:id/executions/:executionId`) — sidebar + preview for a specific workflow

Plus the **Logs panel** (bottom panel on canvas) and **Insights dashboard** (analytics).

```
ExecutionsView (global page, 115 lines)
  └─ GlobalExecutionsList (502 lines)
       ├─ ConcurrentExecutionsHeader
       ├─ ExecutionsFilter (632 lines)
       ├─ ExecutionStopAllText
       └─ GlobalExecutionsListItem (345 lines)
            └─ GlobalExecutionsListItemQueuedTooltip

WorkflowExecutionsView (workflow-scoped, 349 lines)
  └─ WorkflowExecutionsList (128 lines)
       ├─ WorkflowExecutionsSidebar (336 lines)
       │    ├─ WorkflowExecutionsCard (353 lines)
       │    ├─ WorkflowExecutionsInfoAccordion
       │    ├─ ExecutionsFilter
       │    └─ ConcurrentExecutionsHeader
       └─ WorkflowExecutionsPreview (559 lines)  ← via RouterView
            ├─ WorkflowPreview (canvas replay)
            ├─ WorkflowExecutionAnnotationPanel.ee
            ├─ WorkflowExecutionAnnotationTags.ee
            └─ VoteButtons

LogsPanel (canvas bottom panel)
  ├─ ChatMessagesPanel
  ├─ LogsOverviewPanel
  │    ├─ LogsOverviewRows
  │    │    └─ LogsOverviewRow
  │    ├─ LogsViewExecutionSummary
  │    └─ LogsPanelHeader
  └─ LogDetailsPanel
       ├─ LogsViewRunData (input/output)
       ├─ LogsPanelHeader
       └─ RedactedDataState

InsightsDashboard
  ├─ InsightsSummary
  ├─ InsightsChartTotal / Failed / FailureRate / AverageRuntime / TimeSaved
  ├─ InsightsTableWorkflows
  ├─ InsightsDataRangePicker
  └─ InsightsPaywall / InsightsUpgradeModal
```

### 20.2 Executions Store (`executions.store.ts`, 380 lines)

**State:**
- `executionsById` — Completed/stopped executions map
- `currentExecutionsById` — Running/new executions map
- `activeExecution` — Currently selected execution
- `filters` — Active filter state
- `executionsCount` / `executionsCountEstimated` / `concurrentExecutionsCount`
- `autoRefresh` / `autoRefreshTimeout` / `autoRefreshDelay` (4s interval)

**API methods:**

| Method | Endpoint | Purpose |
|---|---|---|
| `fetchExecutions()` | `GET /executions` | List with filter/pagination |
| `fetchExecution(id)` | `GET /executions/:id` | Single execution detail |
| `stopCurrentExecution(id)` | `POST /executions/:id/stop` | Stop running execution |
| `stopManyExecutions(filter)` | `POST /executions/stopMany` | Bulk stop |
| `retryExecution(id, loadWorkflow)` | `POST /executions/:id/retry` | Retry failed execution |
| `deleteExecutions(filter)` | `POST /executions/delete` | Bulk delete |
| `annotateExecution(id, data)` | `PATCH /executions/:id` | Vote/tag annotation |

**Key computed:**
- `allExecutions` — `[...currentExecutions, ...executions]`
- `executionsByWorkflowId` / `currentExecutionsByWorkflowId` — Grouped by workflow
- Sort: running > new > by startedAt (when concurrency enabled)

### 20.3 Global Executions Page

**ExecutionsView** (115 lines) — Entry point. Loads workflows, initializes store, manages auto-refresh on visibility change.

**GlobalExecutionsList** (502 lines) — Full table view:
- **Table columns:** Checkbox | Workflow | Status | Started At | Run Time | ID | Mode | Stop/Actions
- **Selection system:** `selectedItems` map, select all visible, select all existing
- **Bulk operations:** Delete selected (with confirmation dialog, annotation warning)
- **Auto-refresh toggle** — `N8nCheckbox` controlling 4s polling
- **Infinite scroll** — `useIntersectionObserver` on load-more button
- **Concurrency header** — Shows running/cap count (enterprise)
- **Stop all text** — `ExecutionStopAllText` component

**GlobalExecutionsListItem** (345 lines) — Single table row:
- Status icon dictionary mapping `ExecutionStatus` → icon + color
- Row background: red tint for error/crashed
- Workflow name as RouterLink to execution preview
- Running time: live `ExecutionsTime` component for active, formatted duration for stopped
- Mode icons: flask (manual), messages (chat)
- Actions dropdown: retry (saved/original), delete
- Stop button for running executions
- Queued tooltip for indefinite wait / new status

### 20.4 Workflow-Scoped Execution Views

**WorkflowExecutionsView** (349 lines) — Manages workflow-specific execution data:
- Watches `workflowId` and `executionId` route params
- Initializes store with workflow filter
- Auto-redirect to first execution on EXECUTION_HOME
- Handles stop, delete (navigates to next execution), retry
- Debounced load-more

**WorkflowExecutionsList** (128 lines) — Layout container:
- Sidebar + preview content area
- `onBeforeRouteLeave` — prompts save unsaved workflow changes
- `temporaryExecution` — execution not yet in list (just fetched)

**WorkflowExecutionsSidebar** (336 lines) — Scrollable card list:
- `N8nHeading` "Executions" title
- Auto-refresh checkbox + filter button
- `ConcurrentExecutionsHeader` (enterprise)
- `TransitionGroup` animated card list
- Auto-scroll to active execution card
- Intersection observer for infinite scroll
- `WorkflowExecutionsInfoAccordion` at bottom

**WorkflowExecutionsCard** (353 lines) — Individual execution card:
- RouterLink to `VIEWS.EXECUTION_PREVIEW`
- Status-colored left border (running=warning, success=green, error=red, waiting=secondary)
- Start time, status label, running time
- Retry action dropdown (`N8nActionDropdown`)
- Mode icon (manual flask, evaluation check-check)
- Annotation display: vote thumbs-up/down icon + `N8nTags`

**WorkflowExecutionsPreview** (559 lines) — Execution detail panel:
- Status-specific views: new (stop button), running (spinner + stop), completed (full preview)
- `WorkflowPreview` — Canvas replay of execution
- Execution metadata: start time, running time, ID, workflow version link
- **Debug button** — "Copy to editor" / "Debug in editor"
- **Retry dropdown** — Current workflow / original workflow
- **Delete button** with annotation confirmation
- **Vote buttons** (thumbs up/down) for annotation
- **Annotation tags** display and editing
- Workflow version link → workflow history

### 20.5 ExecutionsFilter (`ExecutionsFilter.vue`, 632 lines)

**Purpose:** Popover-based filter form for execution lists.

**Filter fields:**

| Field | Control | Notes |
|---|---|---|
| Workflow | `N8nSelect` (filterable) | Global page only |
| Tags | `WorkflowTagsDropdown` | Hidden by default |
| Status | `N8nSelect` | all/error/canceled/new/running/success/waiting |
| Start date range | `ElDatePicker` × 2 | Debounced emit (500ms) |
| Annotation tags | `AnnotationTagsDropdown` | Enterprise only |
| Workflow version | `N8nSelect` | Per-workflow, lazy-loaded from API |
| Vote | `N8nSelect` | all/up/down (enterprise) |
| Custom metadata | `N8nInput` × 2 (key/value) | Enterprise, debounced |

**UI:** `N8nPopover` with filter count `N8nBadge` on trigger button. Reset button clears all filters.

### 20.6 Execution Composables

**`useExecutionHelpers`** — UI formatting:
- `getUIDetails(execution)` → `IExecutionUIData` (name, label, startTime, runningTime, tags)
- `isExecutionRetriable()` — crashed/error without retry success
- `formatDate()`, `openExecutionInNewTab()`, `resolveRelatedExecutionUrl()`

**`useExecutionDebugging`** — Debug-in-editor feature:
- `applyExecutionData(executionId)` — Loads execution, pins root node data, shows missing node warnings
- Handles pinned data conflicts (confirm overwrite)
- Enterprise paywall check with `DebugPaywallModal`
- Telemetry tracking for debug button clicks

**`useExecutionData`** — Execution data resolution:
- Unflatten and store execution data for logs
- Sub-execution loading and workflow resolution

**`useExecutionRedaction`** — Data redaction for sensitive credentials

### 20.7 Logs Panel System

**LogsPanel** — Canvas bottom panel with three sections:
- **ChatMessagesPanel** — Chat interaction replay (when workflow has chat nodes)
- **LogsOverviewPanel** — Tree view of execution nodes
- **LogDetailsPanel** — Input/output data for selected node

**Keyboard shortcuts:** `j`/`k` (up/down), `Space` (toggle expand), `Enter` (open NDV), `Escape` (deselect), `i`/`o` (toggle input/output in pop-out)

**Key composables:**
- `useLogsPanelLayout` — Resize, pop-out window, panel state management
- `useLogsExecutionData` — Creates `LogEntry[]` tree from execution data, loads sub-executions
- `useLogsSelection` — Selection state, next/prev navigation
- `useLogsTreeExpand` — Expand/collapse tree nodes
- `useChatState` / `useChatMessaging` — Chat replay state

**LogEntry type:**
```typescript
type LogEntry = {
  parent?: LogEntry;
  node: INodeUi;
  id: string;
  children: LogEntry[];
  runIndex: number;
  runData: ITaskData | undefined;
  consumedTokens: LlmTokenUsageData;
  workflow: Workflow;
  executionId: string;
  execution: IRunExecutionData;
  isSubExecution: boolean;
};
```

**LogsOverviewPanel** — Renders:
- Execution summary (status, tokens, time)
- Tree rows with expand/collapse, node icons, status icons, timing
- Overview ↔ Details radio toggle
- Clear execution data button

**LogsOverviewRow** — Single row with:
- Tree indent connectors (curved/straight)
- Node icon + name
- Status + time took
- Started-at timestamp
- Consumed tokens count
- Open NDV button, partial execution button, expand toggle

**LogDetailsPanel** — Split input/output view:
- Input/output toggle buttons with keyboard shortcuts
- `LogsViewRunData` for each pane
- Resizable split (`N8nResizeWrapper`)
- Redacted data overlay for credentials

### 20.8 Insights Dashboard

**Purpose:** Analytics for execution performance (enterprise feature).

**Components:**
- `InsightsDashboard` — Main container with date range picker
- `InsightsSummary` — Quick stats bar (shown on project overview)
- **Charts** (Chart.js): Total, Failed, Failure Rate, Average Runtime, Time Saved
- `InsightsTableWorkflows` — Workflow performance table
- `InsightsPaywall` / `InsightsUpgradeModal` — Upgrade prompts

### 20.9 Design system components used

| Component | Used in | Purpose |
|---|---|---|
| `N8nTableBase` | GlobalExecutionsList | HTML table wrapper |
| `N8nCheckbox` | GlobalExecutionsList, Sidebar, Filter | Selection, auto-refresh, exact match |
| `N8nButton` | GlobalExecutionsList, ListItem, Preview | Stop, load-more, debug, filter trigger |
| `N8nIconButton` | ListItem, Preview, LogsOverviewRow | Actions, retry, open NDV |
| `N8nActionDropdown` | WorkflowExecutionsCard | Retry dropdown |
| `N8nActionToggle` | — | Not used in executions (used in params) |
| `N8nText` | Cards, ListItem, Preview, Sidebar, Logs | Status labels, timestamps, messages |
| `N8nIcon` | ListItem, Card, Filter, Logs | Status icons, mode icons |
| `N8nSpinner` | Card, Preview | Running indicator |
| `N8nTooltip` | ListItem, Card, Filter | Queued, waiting, mode tooltips |
| `N8nTags` | Card | Annotation tags |
| `N8nHeading` | Sidebar | "Executions" title |
| `N8nLoading` | Sidebar | Skeleton loader |
| `N8nSelect` / `N8nOption` | Filter | Workflow, status, version, vote |
| `N8nPopover` | Filter | Filter popover container |
| `N8nBadge` | Filter | Active filter count |
| `N8nInput` | Filter | Custom metadata key/value |
| `N8nRadioButtons` | LogsOverviewPanel | Overview/Details toggle |
| `N8nResizeWrapper` | LogsPanel, LogDetailsPanel | Panel resizing |
| `ElDatePicker` | Filter | Date range |
| `ElDropdown` / `ElDropdownMenu` / `ElDropdownItem` | ListItem, Preview | Action menus |
| `ElSkeletonItem` | GlobalExecutionsList | Loading skeleton |
| `SelectedItemsInfo` | GlobalExecutionsList | Bulk actions bar |

### 20.10 Execution status visual mapping

| Status | Icon | Color | Card border | Row bg |
|---|---|---|---|---|
| `success` | `status-completed` | success (green) | green | default |
| `error` | `status-error` | danger (red) | red | red tint |
| `crashed` | `status-error` | danger (red) | — | red tint |
| `running` | `spinner` (animated) | secondary | warning (yellow) | default |
| `waiting` | `status-waiting` | secondary | secondary | default |
| `new` | `status-new` | foreground-xdark | waiting | default |
| `canceled` | `status-canceled` | foreground-xdark | — | default |
| `unknown` | `status-unknown` | foreground-xdark | unknown | default |

### 20.11 FlowHolt relevance summary

| Area | FlowHolt status | Notes |
|---|---|---|
| Global executions list | ✅ Must implement | Table with filters, bulk ops, infinite scroll |
| Workflow execution sidebar | ✅ Must implement | Card list with auto-refresh |
| Execution preview | ✅ Must implement | Canvas replay + metadata |
| Execution filter | ✅ Must implement | Status, date, workflow filters |
| Execution store + API | ✅ Must implement | CRUD + real-time polling |
| Retry execution | ✅ Must implement | Current/original workflow retry |
| Debug in editor | 🟡 Enterprise | Copy execution data to editor |
| Annotation (vote/tags) | 🟡 Enterprise | Execution rating system |
| Logs panel | ✅ Must implement | Tree view + input/output detail |
| Chat replay | ✅ Must implement | Chat node execution replay |
| Pop-out window | 🟡 Nice-to-have | Logs panel pop-out |
| Insights dashboard | 🟡 Enterprise | Chart.js analytics |
| Concurrency header | 🟡 Enterprise | Running/cap count display |
| Stop all executions | ✅ Must implement | Bulk stop running |

---

## 21. AI Features Deep-Dive

### 21.1 Architecture overview

Six major AI feature modules under `features/ai/`:

1. **assistant** — AI Assistant (ask mode: error/support chat) + AI Builder (build mode: workflow generation)
2. **chatHub** — Multi-model chat hub (LLM providers, agents, sessions, canvas chat)
3. **evaluation.ee** — Test run evaluation system (enterprise)
4. **gateway** — AI Gateway settings and usage tracking (cloud)
5. **instanceAi** — Instance-level AI agent (n8n Agent, threads, artifacts, confirmations)
6. **mcpAccess** — MCP (Model Context Protocol) server settings and workflow exposure
7. **shared** — Shared chat input base and wizard navigation

```
assistant/
  ├─ assistant.store.ts — Ask mode (error/support chat) state
  ├─ builder.store.ts — Build mode (workflow generation) state
  ├─ chatPanel.store.ts — Panel layout state
  ├─ chatPanelState.store.ts — Panel open/closed/mode state
  ├─ focusedNodes.store.ts — Node mention/focus tracking
  ├─ assistant.api.ts — API calls to AI backend
  ├─ assistant.types.ts — Message types, plan mode, version cards, web fetch
  ├─ builder.utils.ts — Payload creation, version extraction
  ├─ components/
  │   ├─ Chat/ — Ask mode components
  │   │   ├─ AskAssistantChat.vue — Wraps N8nAskAssistantChat
  │   │   ├─ AskAssistantFloatingButton.vue
  │   │   ├─ AskModeEmptyState.vue
  │   │   └─ NewAssistantSessionModal.vue
  │   ├─ Agent/ — Build mode components
  │   │   ├─ AskAssistantBuild.vue — Main build mode chat
  │   │   ├─ AIBuilderDiffModal.vue — Code diff review
  │   │   ├─ BuildModeEmptyState.vue
  │   │   ├─ BuilderNodeGroupCard.vue
  │   │   ├─ BuilderSetupCard.vue / BuilderSetupWizard.vue
  │   │   ├─ ChatVersionCard.vue — Version snapshot cards
  │   │   ├─ CollapsedMessagesGroup.vue
  │   │   ├─ CredentialsSetupCard.vue
  │   │   ├─ CreditWarningBanner.vue / CreditsSettingsDropdown.vue
  │   │   ├─ ExecuteMessage.vue
  │   │   ├─ NodeIssueItem.vue
  │   │   ├─ NotificationPermissionBanner.vue
  │   │   ├─ PlanDisplayMessage.vue / PlanModeSelector.vue
  │   │   ├─ PlanQuestionsMessage.vue / UserAnswersMessage.vue
  │   │   ├─ ReviewChangesBanner.vue
  │   │   └─ WebFetchApprovalMessage.vue
  │   ├─ FocusedNodes/ — Node mention system
  │   │   ├─ ChatInputWithMention.vue
  │   │   ├─ FocusedNodeChip.vue
  │   │   ├─ MessageFocusedNodesChips.vue
  │   │   └─ NodeMentionDropdown.vue
  │   ├─ AssistantsHub.vue — Hub selector (ask vs build)
  │   └─ AskModeCoachmark.vue

chatHub/
  ├─ chat.store.ts — Full chat state (sessions, messages, agents, models, streaming)
  ├─ chatHubPanel.store.ts — Canvas floating chat panel state
  ├─ chat.api.ts — REST + SSE API calls
  ├─ chat.types.ts — Message, conversation, streaming types
  ├─ ChatView.vue — Main standalone chat page
  ├─ ChatPersonalAgentsView.vue — Personal agent management
  ├─ ChatWorkflowAgentsView.vue — Workflow-based agent management
  ├─ ChatSemanticSearchSettings.vue — Vector store configuration
  ├─ SettingsChatHubView.vue — Admin chat hub settings
  ├─ components/ (34 Vue components)
  │   ├─ ChatLayout.vue — Main layout with sidebar
  │   ├─ ChatSidebar.vue / ChatSidebarContent.vue — Session list
  │   ├─ ChatMessage.vue / ChatMessageActions.vue — Message rendering
  │   ├─ ChatPrompt.vue / ChatPromptFull.vue / ChatPromptCompact.vue — Input
  │   ├─ ChatGreetings.vue / ChatStarter.vue / ChatSuggestedPrompts.vue
  │   ├─ ChatConversationHeader.vue — Session header
  │   ├─ ChatAgentCard.vue / ChatAgentAvatar.vue — Agent display
  │   ├─ ChatProvidersTable.vue / ChatProviderAvatar.vue — Provider config
  │   ├─ ChatArtifactViewer.vue — Artifact preview
  │   ├─ AgentEditorModal.vue — Agent CRUD
  │   ├─ CredentialSelectorModal.vue
  │   ├─ CanvasChatFloatingMenu.vue / CanvasChatFloatingWindow.vue
  │   ├─ CanvasChatHubPanel.vue / CanvasChatOverlay.vue
  │   ├─ CanvasChatSessionDropdown.vue
  │   └─ ChatMarkdownChunk.vue / ChatTypingIndicator.vue / CopyButton.vue

evaluation.ee/
  ├─ evaluation.store.ts — Test runs, case executions, polling
  ├─ evaluation.api.ts — CRUD for test runs/cases
  ├─ views/
  │   ├─ EvaluationsRootView.vue — Container
  │   ├─ EvaluationsView.vue — List of test runs
  │   └─ TestRunDetailView.vue — Individual run detail
  ├─ components/
  │   ├─ ListRuns/ — TestRunsTable, RunsSection, MetricsChart
  │   ├─ SetupWizard/ — Step-by-step evaluation setup
  │   ├─ Paywall/ — EvaluationsPaywall
  │   └─ shared/ — StepHeader, StepIndicator, TableCell, TableStatusCell, TestTableBase

gateway/
  ├─ views/SettingsAiGatewayView.vue — Usage table with credits
  └─ components/AiGatewayTopUpModal.vue — Credit top-up

instanceAi/
  ├─ InstanceAiView.vue — Main n8n Agent page (threads, messages, previews)
  ├─ instanceAi.store.ts / instanceAiSettings.store.ts
  ├─ instanceAi.api.ts / instanceAi.memory.api.ts
  ├─ components/ (20+ components)
  │   ├─ InstanceAiMessage.vue / InstanceAiInput.vue / InstanceAiEmptyState.vue
  │   ├─ InstanceAiThreadList.vue / InstanceAiStatusBar.vue
  │   ├─ InstanceAiDebugPanel.vue / InstanceAiArtifactsPanel.vue
  │   ├─ InstanceAiConfirmationPanel.vue / InstanceAiCredentialSetup.vue
  │   ├─ InstanceAiDataTablePreview.vue / InstanceAiWorkflowPreview.vue
  │   ├─ InstanceAiPreviewTabBar.vue / InstanceAiMarkdown.vue / InstanceAiQuestions.vue
  │   ├─ AgentSection.vue / AgentTimeline.vue / AgentActivityTree.vue
  │   ├─ ArtifactCard.vue / AttachmentPreview.vue / DataSection.vue
  │   ├─ DelegateCard.vue / DomainAccessApproval.vue / GatewayResourceDecision.vue
  │   ├─ ConfirmationFooter.vue / ConfirmationPreview.vue / ButtonLike.vue
  │   └─ AnsweredQuestions.vue

mcpAccess/
  ├─ SettingsMCPView.vue — MCP server settings page
  ├─ mcp.store.ts / mcp.api.ts / mcp.constants.ts
  ├─ components/
  │   ├─ MCPEmptyState.vue / MCPWorkflowsSelect.vue / WorkflowLocation.vue
  │   ├─ header/ — MCPHeaderActions, McpAccessToggle, McpConnectPopover
  │   ├─ header/connectPopover/ — ConnectionParameter, MCPAccessTokenPopoverTab, MCPOAuthPopoverTab
  │   └─ tabs/ — OAuthClientsTable, WorkflowsTable
  └─ modals/MCPConnectWorkflowsModal.vue

shared/
  ├─ components/ChatInputBase.vue — Shared chat input component
  ├─ components/WizardNavigationFooter.vue — Shared wizard footer
  └─ composables/useWizardNavigation.ts
```

### 21.2 Assistant Store (`assistant.store.ts`)

**Purpose:** Manages the "Ask" mode — error debugging and support chat sessions.

**Key state:**
- `chatMessages` — `ChatUI.AssistantMessage[]` array
- `currentSessionId` / `currentSessionWorkflowId`
- `chatSessionError` / `chatSessionCredType` / `chatSessionTask`
- `streaming` / `streamingAbortController`
- `assistantThinkingMessage` — Intermediate step display
- `nodeExecutionStatus` — Track if user executed after fix
- `workflowDataStale` / `workflowExecutionDataStale`

**Key actions:**
- `initSupportChat(workflowId, question)` — Start error/support session
- `sendMessage(workflowId, payload)` — Send user message
- `applyCodeDiff(workflowId, index)` — Apply code suggestion
- `undoCodeDiff(workflowId, index)` — Revert code suggestion
- `abortStreaming()` — Cancel streaming response

**Message types:** text, code-diff, block, event (end-session), agent-suggestion, intermediate-step, summary, workflow-updated, tool

### 21.3 Builder Store (`builder.store.ts`)

**Purpose:** Manages "Build" mode — AI-powered workflow generation.

**Key features:**
- Communicates with builder API via streaming SSE
- Manages workflow versions and version cards
- Tracks workflow-modifying tools: `add_nodes`, `remove_nodes`, `connect_nodes`, `disconnect_nodes`, `update_node_parameters`, `generate_workflow`
- Plan mode: questions → plan → implementation
- Web fetch approval workflow
- Credit tracking (builder credits)
- Browser notifications for generation completion
- Review changes with diff display
- Auto-save state management during generation
- Focused nodes tracking for targeted modifications

**Builder-specific message types:**
- `PlanMode.QuestionsMessage` — Clarifying questions
- `PlanMode.PlanMessage` — Generated plan with steps
- `PlanMode.UserAnswersMessage` — User responses
- `VersionCardMessage` — Workflow version snapshots
- `CollapsedGroupMessage` — Collapsed old messages
- `WebFetchApproval.Message` — URL fetch permission request

**Telemetry events:** Comprehensive tracking including `WorkflowBuilderJourneyEventType` (20+ event types)

### 21.4 Chat Hub System

**Purpose:** Multi-model LLM chat hub for interacting with various AI providers.

**chat.store.ts** — Massive store handling:
- **Sessions:** CRUD, pagination, grouping by date
- **Messages:** Send, edit, regenerate, streaming, branching (alternatives)
- **Agents:** CRUD, file upload, personal vs workflow agents
- **Models:** Provider models, dynamic credentials
- **Settings:** Admin chat settings, provider settings
- **Tools:** Custom tool CRUD
- **Semantic search:** Vector store configuration

**API methods (40+):** `sendMessageApi`, `editMessageApi`, `regenerateMessageApi`, `reconnectToSessionApi`, `fetchSessionsApi`, `fetchMessagesApi`, `stopGenerationApi`, `createAgentApi`, `updateAgentApi`, `deleteAgentApi`, `uploadAgentFilesApi`, `fetchToolsApi`, etc.

**Messaging states:** `idle` | `waitingFirstChunk` | `receiving` | `missingCredentials` | `missingDynamicCredentials` | `missingAgent` | `waitingForApproval`

**Views:**
- `ChatView.vue` — Main chat page with session list + message area
- `ChatPersonalAgentsView.vue` — Manage personal agents
- `ChatWorkflowAgentsView.vue` — Manage workflow-based agents
- `SettingsChatHubView.vue` — Admin settings
- `ChatSemanticSearchSettings.vue` — Vector store setup

**Canvas integration:**
- `CanvasChatFloatingMenu.vue` — Trigger menu button on canvas
- `CanvasChatFloatingWindow.vue` — Floating chat window
- `CanvasChatHubPanel.vue` — Panel in logs area
- `CanvasChatOverlay.vue` — Full overlay chat

### 21.5 Evaluation System (Enterprise)

**Purpose:** Run test cases against workflows to evaluate AI agent performance.

**evaluation.store.ts:**
- `testRunsById` / `testCaseExecutionsById` — State maps
- `pollingTimeouts` — Active polling for running tests
- Test run CRUD via API
- Checks for evaluation trigger/node existence in workflow

**Views:**
- `EvaluationsRootView.vue` → `EvaluationsView.vue` (list) → `TestRunDetailView.vue` (detail)
- `SetupWizard.vue` — Step-by-step evaluation configuration
- `EvaluationsPaywall.vue` — Enterprise upgrade prompt

**Components:** `TestRunsTable`, `RunsSection`, `MetricsChart`, `StepHeader`, `StepIndicator`, `TableCell`, `TableStatusCell`

### 21.6 AI Gateway (Cloud)

**SettingsAiGatewayView.vue:**
- Usage table (`N8nDataTableServer`) with columns: date, provider, model, input/output tokens, credits
- Credits remaining display with badge
- Load-more pagination
- Top-up modal (`AiGatewayTopUpModal.vue`)

### 21.7 Instance AI (n8n Agent)

**Purpose:** Instance-level AI agent that can build workflows, access data, and perform tasks.

**InstanceAiView.vue** — Main view with:
- Thread list sidebar
- Message area with streaming
- Preview panels: workflow canvas, data table, artifacts
- Confirmation panel for workflow execution approval
- Debug panel for execution inspection
- Status bar with agent activity
- Credit warning and settings

**Components (20+):**
- Message handling: `InstanceAiMessage`, `InstanceAiInput`, `InstanceAiMarkdown`
- Thread management: `InstanceAiThreadList`, `InstanceAiEmptyState`
- Previews: `InstanceAiWorkflowPreview`, `InstanceAiDataTablePreview`, `InstanceAiArtifactsPanel`
- Agent activity: `AgentSection`, `AgentTimeline`, `AgentActivityTree`
- Approval flow: `InstanceAiConfirmationPanel`, `ConfirmationFooter`, `ConfirmationPreview`
- Credentials: `InstanceAiCredentialSetup`, `InstanceAiCredentialSetupModal`
- Misc: `DelegateCard`, `DomainAccessApproval`, `GatewayResourceDecision`, `ArtifactCard`, `AttachmentPreview`

### 21.8 MCP Access

**Purpose:** Expose n8n workflows as MCP (Model Context Protocol) tools for external AI agents.

**SettingsMCPView.vue** — Settings page with:
- MCP access toggle
- Connection parameters (token, OAuth)
- Workflows table (exposed workflows)
- OAuth clients table

**Components:** `MCPEmptyState`, `MCPWorkflowsSelect`, `WorkflowLocation`, `MCPHeaderActions`, `McpAccessToggle`, `McpConnectPopover`, `ConnectionParameter`, `MCPAccessTokenPopoverTab`, `MCPOAuthPopoverTab`, `OAuthClientsTable`, `WorkflowsTable`, `MCPConnectWorkflowsModal`

### 21.9 Design system components used across AI features

| Component | Used in | Purpose |
|---|---|---|
| `N8nAskAssistantChat` | AskAssistantChat, AskAssistantBuild | Main chat UI component |
| `N8nInfoTip` | AskAssistantChat | Warning notices |
| `N8nHeading` | InstanceAiView, SettingsAiGatewayView | Section titles |
| `N8nText` | Multiple | Text display |
| `N8nButton` | Multiple | Actions |
| `N8nIconButton` | InstanceAiView, ChatHub | Icon actions |
| `N8nResizeWrapper` | InstanceAiView | Panel resizing |
| `N8nScrollArea` | InstanceAiView | Scrollable content |
| `N8nCallout` | InstanceAiView | Warnings/info |
| `N8nDataTableServer` | SettingsAiGatewayView | Server-paginated table |
| `N8nActionBox` | SettingsAiGatewayView | Action container |
| `N8nActionPill` | SettingsAiGatewayView | Pill actions |
| `N8nTooltip` | SettingsAiGatewayView | Tooltips |
| `N8nLoading` | SettingsAiGatewayView | Loading skeletons |

### 21.10 FlowHolt relevance summary

| Area | FlowHolt status | Notes |
|---|---|---|
| AI Assistant (ask mode) | 🟡 Cloud/Enterprise | Error debugging chat — cloud backend required |
| AI Builder (build mode) | 🟡 Cloud/Enterprise | Workflow generation — cloud backend required |
| Chat Hub | 🟡 Cloud/Enterprise | Multi-model chat — requires cloud AI backend |
| Canvas chat (floating) | 🟡 Cloud/Enterprise | Chat on canvas — depends on chat hub |
| Evaluation system | 🟡 Enterprise | Test run framework — enterprise feature |
| AI Gateway | 🟡 Cloud | Token usage/credits — cloud-only |
| Instance AI (n8n Agent) | 🟡 Cloud/Enterprise | Full AI agent — requires cloud infrastructure |
| MCP Access | 🟡 Enterprise | MCP server settings — enterprise feature |
| Shared chat input | ✅ Could reuse | Base input component if building any chat |
| Wizard navigation | ✅ Could reuse | Step-by-step wizard pattern |
| Code diff review | 🟡 Nice-to-have | Diff modal for code changes |
| Credit system | 🟡 Cloud | Credit tracking/top-up — cloud-only |
| Focused nodes | 🟡 Nice-to-have | Node mention/selection system |

---

## 22. Collaboration, Projects & Credentials Deep-Dive

### 22.1 Architecture overview

Three interconnected subsystems under `features/collaboration/` and `features/credentials/`:

```
collaboration/
  ├─ collaboration/
  │   ├─ collaboration.store.ts (439 lines) — Real-time collaboration + write locks
  │   └─ components/CollaborationPane.vue — User stack avatar display
  └─ projects/
       ├─ projects.store.ts (365 lines) — Projects CRUD, members, navigation
       ├─ projects.api.ts / projects.types.ts / projects.constants.ts / projects.routes.ts
       ├─ components/ (20+ components)
       │   ├─ ProjectNavigation.vue — Sidebar nav (home, personal, shared, team projects)
       │   ├─ ProjectHeader.vue — Project page header
       │   ├─ ProjectTabs.vue — Workflows/Credentials/DataTables tabs
       │   ├─ ProjectSharing.vue — Share resource with projects/users
       │   ├─ ProjectSharingInfo.vue — Display sharing info
       │   ├─ ProjectMembersTable.vue / ProjectMembersRoleCell.vue / ProjectMembersActionsCell.vue
       │   ├─ ProjectCreateResource.vue — Create workflow/credential in project
       │   ├─ ProjectDeleteDialog.vue — Delete confirmation with transfer
       │   ├─ ProjectMoveResourceModal.vue / ProjectMoveResourceModalCredentialsList.vue
       │   ├─ ProjectMoveSuccessToastMessage.vue
       │   ├─ ProjectCardBadge.vue / ProjectIcon.vue
       │   ├─ ProjectExternalSecrets.vue — External secrets per project
       │   ├─ ProjectCustomRolesUpgradeModal.vue / ProjectRoleUpgradeDialog.vue
       │   ├─ ProjectRoleContactAdminModal.vue
       │   └─ RoleHoverPopover.vue
       └─ composables/
            ├─ useProjectPages.ts — Project page helpers
            └─ useMoveResourceToProjectToast.ts

credentials/
  ├─ credentials.store.ts (564 lines) — Credential types + credentials CRUD
  ├─ credentials.api.ts / credentials.ee.api.ts / credentials.types.ts / credentials.constants.ts
  ├─ views/CredentialsView.vue (433 lines) — Credentials list page
  ├─ components/
  │   ├─ CredentialEdit/
  │   │   ├─ CredentialEdit.vue (1597 lines) — Main credential edit modal
  │   │   ├─ CredentialConfig.vue — Connection configuration form
  │   │   ├─ CredentialInfo.vue — Credential metadata display
  │   │   ├─ CredentialInputs.vue — Parameter inputs for credential fields
  │   │   ├─ CredentialModeSelector.vue — OAuth vs API key mode toggle
  │   │   ├─ CredentialSharing.ee.vue — Sharing tab (enterprise)
  │   │   └─ GoogleAuthButton.vue — Google OAuth one-click
  │   ├─ CredentialCard.vue — Card in credentials list
  │   ├─ CredentialIcon.vue — Credential type icon
  │   ├─ CredentialPicker/
  │   │   ├─ CredentialPicker.vue — Credential selection UI
  │   │   └─ CredentialsDropdown.vue — Dropdown for credential selection
  │   ├─ CredentialsSelect.vue — Credential selector in NDV
  │   ├─ CredentialsSelectModal.vue — Modal for selecting credential type
  │   ├─ NodeCredentials.vue — Credentials section in NDV
  │   └─ ScopesNotice.vue — OAuth scopes display
  ├─ quickConnect/
  │   ├─ components/QuickConnectBanner.vue / QuickConnectButton.vue
  │   ├─ composables/useQuickConnect.ts
  │   └─ quickConnect.api.ts
  └─ composables/
       ├─ useCredentialOAuth.ts — OAuth flow handling
       └─ useNodeCredentialOptions.ts

project-roles/
  ├─ ProjectRolesView.vue — Role management list
  ├─ ProjectRoleView.vue — Single role detail
  ├─ RoleAssignmentsTab.vue — Role assignments
  ├─ RoleProjectMembersModal.vue — Member assignment modal
  └─ projectRoleScopes.ts — Role scope definitions
```

### 22.2 Collaboration Store (`collaboration.store.ts`, 439 lines)

**Purpose:** Real-time multi-user collaboration on workflows via WebSocket push messages.

**Key state:**
- `collaborators` — `Collaborator[]` (users currently viewing the workflow)
- `currentWriterLock` — `{ userId, clientId } | null` (single-write lock)
- `lastActivityTime` — Inactivity tracking for auto-release

**Write-lock system:**
- Single-writer model: only one user can edit at a time
- `requestWriteAccess()` / `requestWriteAccessForce()` / `releaseWriteAccess()`
- Auto-release after 20s inactivity (except during AI Builder streaming)
- Heartbeat every 30s for lock, 5min for presence
- Lock state polling every 20s for read-only viewers

**Push events handled:**
- `collaboratorsChanged` — Update collaborator list
- `writeAccessAcquired` — Lock granted
- `writeAccessReleased` — Lock released
- `workflowUpdated` — Refresh canvas for read-only viewers

**Push events sent:**
- `workflowOpened` / `workflowClosed` — Presence
- `writeAccessRequested` / `writeAccessReleaseRequested` — Lock requests
- `writeAccessHeartbeat` — Keep lock alive

**CollaborationPane.vue** — Displays `N8nUserStack` with sorted collaborator avatars. Current user shown first.

### 22.3 Projects Store (`projects.store.ts`, 365 lines)

**Purpose:** Manage team/personal projects — folders for organizing workflows and credentials.

**Key state:**
- `projects` / `myProjects` — All vs user's projects
- `personalProject` / `currentProject` — Active project context
- `projectsCount` — `{ personal, team, public }` counts
- `projectNavActiveId` — Active sidebar nav item

**Project types:** `personal` | `team` | `public`

**Key actions:**

| Action | Purpose |
|---|---|
| `getAllProjects()` / `getMyProjects()` | Fetch project lists |
| `getPersonalProject()` | Fetch user's personal project |
| `searchProjects(params)` | Search with pagination |
| `createProject(data)` | Create new team project |
| `updateProject(id, data)` | Update name/icon/description |
| `addMember(projectId, { userId, role })` | Add member |
| `updateMemberRole(projectId, userId, role)` | Change member role |
| `removeMember(projectId, userId)` | Remove member |
| `deleteProject(projectId, transferId?)` | Delete with optional resource transfer |
| `moveResourceToProject(type, id, projectId)` | Move workflow/credential between projects |
| `getResourceCounts(projectId)` | Count workflows/credentials/dataTables |
| `getProjectSecretProviders(projectId)` | External secrets per project |

**Computed permissions:** `canCreateProjects`, `hasPermissionToCreateProjects`, `canViewProjects`, `isTeamProjectFeatureEnabled`, `isTeamProjectLimitExceeded`

### 22.4 Project Navigation (`ProjectNavigation.vue`)

**Menu items:**
- **Home** (overview) — `VIEWS.HOMEPAGE`
- **Personal** — `VIEWS.PROJECTS_WORKFLOWS` (personal project)
- **Shared** — `VIEWS.SHARED_WITH_ME` (shown when multiple users)
- **Instance AI** — `INSTANCE_AI_VIEW` (when module active)
- **Chat** — `CHAT_VIEW` (when chat feature enabled)
- **Team projects** — Dynamic list from `displayProjects`

Uses `N8nMenuItem` for each item with compact/collapsed mode support.

### 22.5 Project Sharing (`ProjectSharing.vue`)

**Purpose:** Share resources (workflows/credentials) with projects/users.

**Features:**
- Debounced search with `searchFn` prop
- Single-select or multi-select mode
- Filter out home project and already-selected
- "Share with all users" global option
- Role-based sharing with role dropdown per shared project
- Project icons (emoji or icon type)
- `ProjectSharingInfo.vue` — Displays sharing status information

### 22.6 Credentials Store (`credentials.store.ts`, 564 lines)

**Purpose:** Manage credential types and credential instances.

**Key state:**
- `credentialTypes` — `ICredentialTypeMap` (type definitions)
- `credentials` — `ICredentialMap` (credential instances)
- `credentialTestResults` — Test status per credential

**Key computed:**
- `allCredentialTypes` / `allCredentials` — Sorted lists
- `allCredentialsByType` / `allUsableCredentialsByType` — Grouped by type
- `allUsableCredentialsForNode(node)` — Credentials matching node type
- `getCredentialTypeByName(type)` / `getCredentialById(id)`
- `getNodesWithAccess(credTypeName)` — Nodes using credential type
- `getScopesByCredentialType(name)` — OAuth scopes
- `httpOnlyCredentialTypes` — Types with HTTP request support

**Key actions:**
- `fetchCredentialTypes(forceFetch)` — Load all credential type definitions
- `fetchAllCredentials(options)` — Load credential instances with project/scope filters
- `createNewCredential(data)` / `updateCredential(params)` / `deleteCredential(id)`
- `oAuth1Authorize(id)` / `oAuth2Authorize(id)` — OAuth flow initiation
- `testCredential(data)` — Test credential connection
- `getNewCredentialName(params)` — Generate unique credential name

### 22.7 Credential Edit Modal (`CredentialEdit.vue`, 1597 lines)

**Purpose:** Full credential creation/editing modal — the largest credential component.

**Tabs:**
- **Connection** — `CredentialConfig.vue` (main configuration)
- **Sharing** — `CredentialSharing.ee.vue` (enterprise sharing)
- **Details** — `CredentialInfo.vue` (metadata)

**Key features:**
- Mode selector: managed OAuth, custom OAuth, API key
- Google Auth one-click button
- Quick Connect integration
- Credential testing with inline results
- Auto-naming based on credential type
- Save button with validation warnings
- Delete confirmation
- Inline name editing (`N8nInlineTextEdit`)
- Auth type switching with data caching
- Dynamic credentials support (expression-based)
- External secrets integration

**Design system components:** `Modal`, `SaveButton`, `N8nIcon`, `N8nIconButton`, `N8nInlineTextEdit`, `N8nMenuItem`, `N8nTag`, `N8nText`

### 22.8 Credentials View (`CredentialsView.vue`, 433 lines)

**Purpose:** Credentials list page with filtering and cards.

**Uses:** `ResourcesListLayout` (shared layout component) with:
- `CredentialCard` per credential
- Filters: type, setup needed, external secrets store
- Project header with scoped permissions
- Source control read-only detection
- Insights summary (enterprise)
- Credential creation via route (`/create`)

### 22.9 Project Roles (`project-roles/`)

**Enterprise feature** for custom role management:
- `ProjectRolesView.vue` — List of all custom roles
- `ProjectRoleView.vue` — Individual role editing
- `RoleAssignmentsTab.vue` — Assign roles to users
- `RoleProjectMembersModal.vue` — Member assignment dialog
- `projectRoleScopes.ts` — Scope definitions for roles

### 22.10 FlowHolt relevance summary

| Area | FlowHolt status | Notes |
|---|---|---|
| Real-time collaboration | 🟡 Nice-to-have | WebSocket presence + write locks |
| Collaboration pane | 🟡 Nice-to-have | User avatars on canvas |
| Projects (personal/team) | ✅ Must implement | Core organizational structure |
| Project navigation | ✅ Must implement | Sidebar nav with projects |
| Project sharing | ✅ Must implement | Resource sharing between users/projects |
| Project members | ✅ Must implement | Add/remove members, roles |
| Move resource | ✅ Must implement | Move workflows/credentials between projects |
| Project delete + transfer | ✅ Must implement | Delete with resource transfer |
| Credentials store | ✅ Must implement | Credential CRUD + type management |
| Credential edit modal | ✅ Must implement | Full credential configuration UI |
| Credentials list view | ✅ Must implement | List page with filters |
| OAuth flows | ✅ Must implement | OAuth1/2 authorization |
| Credential testing | ✅ Must implement | Test connection functionality |
| Quick Connect | 🟡 Cloud | One-click cloud credential setup |
| Credential sharing | 🟡 Enterprise | Share credentials across projects |
| Custom project roles | 🟡 Enterprise | Custom role RBAC |
| External secrets | 🟡 Enterprise | External secret providers per project |

---

## 23. App initialization, routing, keybindings, events, and modal shell

Grounding files:

```text
app/
  main.ts — Vue bootstrap, plugins, Pinia, router mount
  App.vue — top-level shell composition
  init.ts — initializeCore + initializeAuthenticatedFeatures
  router.ts — all main routes, route guards, telemetry hooks
  stores/ui.store.ts — global shell state, modal stack, sidebar state
  constants/
    navigation.ts — VIEWS enum, editable canvas views, main workflow tabs
    modals.ts — canonical modal keys
    actions.ts — workflow menu action IDs
    events.ts — mouse button constants
  event-bus/
    index.ts — bus exports
    node-view.ts — workflow canvas commands
    code-node-editor.ts — code editor actions
    data-pinning.ts — pin/unpin events
    html-editor.ts — HTML formatting event
    import-curl.ts — cURL import handoff
    global-link-actions.ts — dynamic link action registration
  moduleInitializer/
    modalRegistry.ts — dynamic modal registration API
  components/app/
    AppModals.vue — modal mount point
    AppCommandBar.vue — global command palette shell
  composables/
    useKeybindings.ts — layout-aware keyboard shortcut engine
features/shared/commandBar/
  composables/useCommandBar.ts — command group assembly per view
```

### 23.1 Bootstrap flow (`main.ts`, `App.vue`, `init.ts`)

**Bootstrap order in `main.ts`:**
- Create Vue app + Pinia
- Register Sentry
- Register module routes before mount so deep links to module pages work
- Register telemetry, global components, global directives, router, i18n, charts
- Optionally enable `z-vue-scan` in development
- Mount `App.vue`

**Top-level shell in `App.vue`:**
- `BaseLayout` is the app frame
- `AppBanners` mounts global banners
- `AppLayout` renders routed content
- `AppModals` mounts the global modal layer
- `AppCommandBar` mounts the command palette globally
- `AppChatPanel` mounts the assistant/chat side panel in the `aside` slot
- `CODEMIRROR_TOOLTIP_CONTAINER_ELEMENT_ID` reserves a dedicated tooltip portal container

**Early app initialization behavior from `init.ts`:**
- `initializeCore()` runs once before first route resolution
- Loads settings, initializes auth-related hooks, initializes users, configures SSO
- Runs external hook `app.mount`
- `initializeAuthenticatedFeatures()` runs after user presence is known
- Loads projects, personal project, project counts, roles, source-control preferences, version notifications, module resources, module tabs, module modals, module settings pages
- Optionally initializes the run-data worker and preloads node types into it

**Planning insight:** n8n treats the shell as an always-on product runtime, not a thin route wrapper. Initialization is split into:
- core boot
- authenticated feature boot
- module-level registration boot

FlowHolt should copy that staged startup model instead of doing all initialization inside the first page load.

### 23.2 Router and route taxonomy (`router.ts`, `navigation.ts`)

**Purpose:** Central route map, middleware enforcement, telemetry page tracking, and route-level layout selection.

**Key route groups:**
- Canvas/editor: `WORKFLOW`, `NEW_WORKFLOW`, `EXECUTION_DEBUG`
- Workflow tabs: `WORKFLOW_EXECUTIONS`, `EXECUTION_PREVIEW`, `EVALUATION`, `WORKFLOW_HISTORY`
- Lists: `WORKFLOWS`, `CREDENTIALS`, `EXECUTIONS`, `PROJECTS_*`
- Settings: usage, users, security, AI, AI Gateway, resolvers, source control, secrets, SSO, LDAP, workers, community nodes
- Special pages: templates, resource center, auth pages, entity-not-found, entity-unauthorized

**Important constants from `navigation.ts`:**
- `VIEWS` enum is the canonical route/view namespace
- `EDITABLE_CANVAS_VIEWS` = `WORKFLOW`, `NEW_WORKFLOW`, `EXECUTION_DEBUG`
- `MAIN_HEADER_TABS` = `workflow`, `executions`, `settings`, `evaluation`

**Router mechanics:**
- Uses `createWebHistory`
- Marks every route with `readOnlyCanvas` meta via `withCanvasReadOnlyMeta()`
- Runs `initializeCore()` and `initializeAuthenticatedFeatures()` in `beforeEach`
- Applies ordered middleware per route: `authenticated`, `guest`, `rbac`, `enterprise`, `custom`, etc.
- Handles special MFA redirect flow via `MfaRequiredError`
- Tracks current view and telemetry in `afterEach`
- Updates recent-resources tracking on navigation

**Key layout idea:**
- Each route carries layout metadata such as `layout: 'workflow' | 'settings' | 'auth' | 'demo'`
- Workflow routes can also opt into `layoutProps: { logs: true }`

This is one of n8n's strongest structural patterns: route definition doubles as the product capability map.

### 23.3 Global UI store (`ui.store.ts`)

**Purpose:** Shell-level state manager for modals, sidebar, dirty state, notifications, tabs, theme, and canvas interaction leftovers.

**Important state clusters:**

| Cluster | Examples |
|---|---|
| Shell chrome | `sidebarMenuCollapsed`, `sidebarWidth`, `currentView`, `theme` |
| Modal system | `modalsById`, `modalStack`, `isAnyModalOpen` |
| Workflow dirty state | `stateIsDirty`, `hasUnsavedWorkflowChanges`, `dirtyStateSetCount` |
| Notifications | `pendingNotificationsForViews`, `areNotificationsSuppressed` |
| Canvas last interaction | `lastInteractedWithNodeConnection`, `lastInteractedWithNodeHandle`, `lastInteractedWithNodeId`, `lastCancelledConnectionPosition` |
| Extensibility | `moduleTabs`, `registeredSettingsPages` |

**Important methods:**
- `openModal()`, `openModalWithData()`, `closeModal()`
- `openExistingCredential()`, `openNewCredential()`
- `toggleSidebarMenuCollapse()`
- `markStateDirty()` / `markStateClean()`
- `registerCustomTabs()` for module-added project header tabs
- `registerSettingsPages()` for module-added settings items
- `registerModal()` / `unregisterModal()` / `initializeModalsFromRegistry()`

**Other useful behaviors:**
- Theme persists via local storage
- Sidebar width persists via local storage
- Modal changes can be observed via `listenForModalChanges()`
- `contextBasedTranslationKeys` adjusts text keys depending on deployment context such as cloud

Planning implication for FlowHolt:
- keep one global shell store for modals, sidebar, and dirty state
- allow product modules to extend the shell through registries rather than hardcoding everything in the sidebar and modal switchboard

### 23.4 Modal system (`modals.ts`, `AppModals.vue`, `modalRegistry.ts`)

**Purpose:** Central modal key registry plus a global modal stack with support for module-provided modals.

**Base modal result constants:**
- `MODAL_CANCEL`
- `MODAL_CONFIRM`
- `MODAL_CLOSE`

**Built-in modal key families from `modals.ts`:**
- Workflow: settings, share, activation, publish, description, diff, extraction name, history restore/unpublish/publish/diff
- Auth/security: change password, confirm password, MFA setup, prompt MFA
- Import/export: import URL, import cURL, duplicate
- AI: new assistant session, AI builder diff, from-AI parameters, AI Gateway top-up, instance AI credential setup
- Ops/system: stop many executions, versions, what's new, binary data view
- Integrations/secrets: external secrets provider, secrets provider connection, delete secrets provider, credential resolver edit

**Architecture details:**
- `AppModals.vue` only provides the root mount target
- `ui.store.ts` owns modal state and stack order
- `modalRegistry.ts` lets modules register modals dynamically at runtime
- `initializeModalsFromRegistry()` syncs dynamic definitions into the UI store

**Why this matters:**
n8n avoids making the modal layer purely static. Core modals are predefined, but feature modules can extend the modal surface without rewriting the root app shell.

### 23.5 Event bus inventory (`app/event-bus/*`)

**Purpose:** Lightweight typed command/event channels for cross-component coordination where props or stores would be awkward.

**Event buses found:**

| Bus | Purpose | Key events |
|---|---|---|
| `nodeViewEventBus` | Canvas/editor actions | `newWorkflow`, `openChat`, `importWorkflowData`, `importWorkflowUrl`, `tidyUp`, `archiveWorkflow`, `renameWorkflow`, `publishWorkflow`, `unpublishWorkflow` |
| `codeNodeEditorEventBus` | Code node editor actions | `codeDiffApplied`, `highlightLine` |
| `dataPinningEventBus` | Pin-data UX | `data-pinning-discovery`, `pin-data`, `unpin-data` |
| `htmlEditorEventBus` | HTML editor action | `format-html` |
| `importCurlEventBus` | cURL import handoff | `setHttpNodeParameters` |
| `globalLinkActionsEventBus` | Dynamic deep-link actions | `registerGlobalLinkAction` |

**Pattern to notice:**
- buses are typed
- they are narrow in scope
- they complement stores instead of replacing them

For FlowHolt this is a good middle layer for editor-local actions like:
- open inspector tab
- focus node
- open release compare modal
- paste imported API request config

### 23.6 Keybinding engine (`useKeybindings.ts`)

**Purpose:** Global shortcut binding composable with layout-aware handling and pop-out window support.

**Important capabilities:**
- Accepts a `KeyMap` from shortcut string to handler
- Supports multi-shortcut aliases like `ctrl+b|ctrl+c`
- Normalizes shortcut strings before matching
- Handles logical key matching and physical code matching separately
- Uses Keyboard Layout Map API when available to support non-QWERTY layouts better
- Injects `PopOutWindowKey` so shortcuts also work inside pop-out windows
- Uses `shouldIgnoreCanvasShortcut()` to suppress shortcuts while typing in inputs/editors
- Prevents default + stops propagation when a handler matches

**Why it is notable:**
n8n clearly invested in international keyboard correctness. The composable tries:
1. `event.key`
2. layout-aware mapping
3. `event.code` fallback only when safe

This is more mature than the usual shortcut implementation.

FlowHolt should preserve this exact design principle, especially if the product will have:
- command palette
- canvas shortcuts
- code editor shortcuts
- detached inspectors or pop-out panels

### 23.7 Command bar shell (`AppCommandBar.vue`, `useCommandBar.ts`)

**Purpose:** Global command palette that changes available actions depending on the current route.

**Shell behavior:**
- `AppCommandBar.vue` mounts `N8nCommandBar` globally
- Hidden in demo mode
- Only shown for authenticated users
- Initializes lazily when visible

**Command groups assembled by view:**
- Node commands
- Workflow commands
- Execution commands
- Workflow navigation
- Data table navigation
- Credential navigation
- Project navigation
- Generic commands
- Recent resources
- Chat Hub commands
- Instance AI commands

**Context-sensitive routing:**
- Workflow editor shows node + workflow actions
- Execution pages show execution + navigation actions
- List pages show navigation-heavy groups
- Chat pages get chat-specific groups

**Telemetry integration:**
- Every command execution is wrapped with telemetry
- Parent/child command relationships are tracked

**Planning implication:** FlowHolt should not treat command palette as a thin "search routes" layer. n8n treats it as a full operating surface that can:
- navigate
- create
- execute
- jump to recent resources
- trigger context-specific editor actions

### 23.8 Shell constants worth copying

**`actions.ts`**
- `WORKFLOW_MENU_ACTIONS` includes `duplicate`, `download`, `import-from-url`, `push`, `edit-description`, `settings`, `delete`, `archive`, `rename`, `share`, `unpublish`
- Useful because workflow menu action IDs are centralized instead of repeated as raw strings

**`events.ts`**
- Centralized `MOUSE_EVENT_BUTTON` and `MOUSE_EVENT_BUTTONS`
- Small detail, but it keeps editor interaction logic readable and consistent

**Design lesson:** seemingly small constants files reduce editor-shell drift. FlowHolt should centralize:
- action IDs
- view IDs
- modal keys
- event button constants
- main header tab IDs

### 23.9 FlowHolt relevance summary

| Area | FlowHolt status | Notes |
|---|---|---|
| Staged app bootstrap | ✅ Must implement | Split core boot, authenticated boot, module boot |
| Route-level layout metadata | ✅ Must implement | Workflow/settings/auth/demo shell selection |
| Route middleware map | ✅ Must implement | Auth, RBAC, enterprise, custom policy gates |
| Canonical view enum | ✅ Must implement | Stable page IDs for routing + telemetry |
| Global UI store | ✅ Must implement | Sidebar, dirty state, modal stack, shell state |
| Modal key registry | ✅ Must implement | Central modal IDs |
| Dynamic module modal registration | 🟡 Strongly recommended | Lets future product modules extend shell safely |
| Typed event buses | 🟡 Strongly recommended | Best for editor-local commands and cross-panel actions |
| Layout-aware keybinding engine | ✅ Must implement | Important for canvas-heavy UX and global shortcuts |
| Global command palette | ✅ Must implement | Treat as an operating surface, not just navigation |
| Persistent shell banners | 🟡 Strongly recommended | License, quota, trial, environment warnings |
| Pop-out-window shortcut support | 🟡 Nice-to-have | Valuable for detached inspectors or ops panels |

---

## 24. Settings views and settings information architecture

Grounding files:

```text
app/layouts/SettingsLayout.vue — settings page shell
app/components/SettingsSidebar.vue — settings navigation rail
app/composables/useSettingsItems.ts — computed settings menu registry

features/settings/
  usage/views/SettingsUsageAndPlan.vue
  users/views/SettingsUsersView.vue
  security/SecuritySettings.vue
  sso/views/SettingsSso.vue
  sso/views/SettingsLdapView.vue
  apiKeys/views/SettingsApiView.vue
  communityNodes/views/SettingsCommunityNodesView.vue
  orchestration.ee/views/WorkerView.vue

features/ai/
  assistant/views/SettingsAIView.vue
  gateway/views/SettingsAiGatewayView.vue

features/resolvers/ResolversView.vue
```

### 24.1 Settings shell (`SettingsLayout.vue`, `SettingsSidebar.vue`)

**Settings layout behavior:**
- Uses `BaseLayout`
- Mounts `SettingsSidebar` into the sidebar slot
- Main content is centered inside a max-width container
- Keeps a "return" action that goes back to the previous non-settings page, otherwise falls back to `HOMEPAGE`

**Settings sidebar behavior:**
- Top "back" row with arrow-left icon and `settings` label
- Renders `N8nMenuItem` entries from `useSettingsItems()`
- Shows current CLI version as a clickable footer link
- Clicking version opens the About modal

This is a full sub-navigation system, not just a list of settings links dropped into the main sidebar.

### 24.2 Settings item registry (`useSettingsItems.ts`)

**Purpose:** Centralize which settings pages appear, with permission and feature gating.

**Core built-in items:**
- Usage and plan
- Personal
- Users
- AI
- n8n Connect / AI Gateway
- Project roles
- API
- External secrets
- Credential resolvers
- Source control
- SSO
- Security
- LDAP
- Workers
- Log streaming
- Community nodes
- Migration report

**Important traits:**
- Every item is permission-checked via `canUserAccessRouteByName()`
- Some items depend on feature flags or deployment settings
- AI Gateway can show a credits badge directly in the sidebar item
- Module-registered settings pages are appended afterward from `uiStore.settingsSidebarItems`

This makes the settings IA extensible without requiring the base shell to know every future feature page.

### 24.3 Settings page taxonomy

| Page | Main purpose | Notable UI pattern |
|---|---|---|
| `SettingsUsageAndPlan` | License, plan, billing/upgrade, activation key | Plan badges, activation dialogs, upgrade CTAs |
| `SettingsUsersView` | User management | Search, server-side table, role controls, invite/delete modals |
| `SecuritySettings` | Enforce MFA, personal-space policy | Licensed feature toggles + confirmation dialogs |
| `SettingsSso` | SAML/OIDC config | Protocol switcher, full forms, unsaved-changes dialog |
| `SettingsLdapView` | LDAP config | Enterprise auth settings form |
| `SettingsAIView` | AI data-sharing policy | Checkbox policy page with confirmation |
| `SettingsAiGatewayView` | Gateway credits and usage | Credits badge + usage table + top-up modal |
| `SettingsApiView` | Public API keys | Card list + create/edit modal + docs links |
| `SettingsCommunityNodesView` | Install/manage community packages | Empty-state action box + package cards + push updates |
| `WorkerView` | Queue worker monitoring | Licensed worker list or upgrade action box |
| `ResolversView` | Dynamic credential resolvers | Card list + action toggle + create/edit/delete flow |

### 24.4 Representative settings view behaviors

**Usage & Plan (`SettingsUsageAndPlan.vue`):**
- Handles license activation via modal flow
- Supports EULA-acceptance branch during activation
- Shows plan/edition info, management links, and upgrade actions
- Uses query-param activation key bootstrapping

**Users (`SettingsUsersView.vue`):**
- Search + sortable paginated table
- Per-user action menu: invite link, reinvite, delete, reset-password link, SSO manual login override
- Role dropdown includes `Member`, `ChatUser`, `Admin`
- Uses invite and delete modals for mutating actions
- Includes user-role provisioning hooks tied to SSO

**Security (`SecuritySettings.vue`):**
- Enforce MFA toggle
- Personal-space publishing toggle
- Personal-space sharing toggle
- Enterprise-gated switches show upgrade fallback tooltips
- Disabling publishing/sharing requires confirmation dialogs

**SSO (`SettingsSso.vue`):**
- Protocol selector between SAML and OIDC
- If unlicensed, shows upgrade `N8nActionBox`
- If licensed, renders `SamlSettingsForm` or `OidcSettingsForm`
- Prevents accidental navigation with unsaved changes dialog

**AI Settings (`SettingsAIView.vue`):**
- Simple governance page focused on what can be sent to AI systems
- `allowSendingSchema` is shown but disabled
- `allowSendingParameterValues` is editable, with confirmation before disabling
- Ends with a privacy note and docs link

**AI Gateway (`SettingsAiGatewayView.vue`):**
- Header shows live credits badge
- Top-up button opens `AI_GATEWAY_TOP_UP_MODAL_KEY`
- Usage section is a server-style table of provider, model, tokens, and deducted credits
- Refresh + load-more behavior built into the page

**API Keys (`SettingsApiView.vue`):**
- Card list of API keys
- Create/edit uses `API_KEY_CREATE_OR_EDIT_MODAL_KEY`
- Delete uses confirmation dialog
- Links to docs and API playground or endpoint docs depending on Swagger availability

**Community Nodes (`SettingsCommunityNodesView.vue`):**
- Uses push connection so node-type install/update/remove events refresh the page
- Empty state explains package availability and links to docs
- Non-empty state renders package cards with install/update flows

**Workers (`WorkerView.vue`):**
- Binary licensed/unlicensed page
- If queue mode + worker view are available: render `WorkerList`
- Otherwise show upgrade action box

**Resolvers (`ResolversView.vue`):**
- Credential resolver inventory page
- Empty state explains dynamic identity-based credential resolution
- Non-empty state renders cards with edit/delete actions

### 24.5 Settings design patterns n8n uses well

- Every settings page has a clear single responsibility
- Settings pages frequently use `N8nActionBox` for empty, upgrade, or unlicensed states
- Licensing and RBAC are visible in the page UX, not hidden only in backend responses
- Destructive or policy-changing actions usually require confirm dialogs
- Settings pages often mix static explanatory copy with one focused interactive surface instead of packing dozens of unrelated fields into one form

### 24.6 FlowHolt relevance summary

| Area | FlowHolt status | Notes |
|---|---|---|
| Dedicated settings layout | ✅ Must implement | Separate settings shell with its own sidebar |
| Central settings item registry | ✅ Must implement | Permission-aware navigation generation |
| Module-extensible settings sidebar | 🟡 Strongly recommended | Supports future product modules |
| Single-purpose settings pages | ✅ Must implement | Avoid giant catch-all settings pages |
| Upgrade/unlicensed action boxes | 🟡 Strongly recommended | Make plan gating explicit in the UI |
| User management page | ✅ Must implement | Search, role changes, invites, access actions |
| Security policy page | ✅ Must implement | MFA, workspace-sharing, publishing policy |
| API keys page | ✅ Must implement | Key creation, rotation, deletion, scopes |
| AI governance settings | ✅ Must implement | Data-sharing and privacy controls |
| Worker/runtime settings surface | 🟡 Strongly recommended | Needed as platform maturity grows |
| Resolver-like dynamic credentials page | 🔴 Optional/advanced | Valuable if FlowHolt adopts user-aware credential routing |
