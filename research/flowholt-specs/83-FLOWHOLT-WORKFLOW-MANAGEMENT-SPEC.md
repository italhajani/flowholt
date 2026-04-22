# SPEC-83: FlowHolt Workflow Management Complete Spec
## Source: n8n Documentation Deep Research — Workflow Lifecycle, Settings, History, Sharing

**Created:** Sprint 88 Research Session
**Status:** Research Complete — Ready for Implementation Reference
**Scope:** Workflow lifecycle, publishing, settings, version history, sharing, collaboration, executions management

---

## 1. Workflow Lifecycle States

### 1.1 State Diagram
```
DRAFT (no trigger)
    ↓ add trigger
DRAFT (with trigger)
    ↓ publish
PUBLISHED (active, production-ready)
    ↓ make edits
PUBLISHED + DRAFT CHANGES
    ↓ publish again
PUBLISHED (new version live)
    ↓ unpublish
UNPUBLISHED (has versions in history)
```

### 1.2 Key State Properties

| Property | Values | Description |
|----------|--------|-------------|
| `active` | true / false | Whether workflow is published and running in production |
| `versionId` | UUID | Current draft version ID |
| `publishedVersionId` | UUID | Currently published version ID (may differ from draft) |
| `hasDraftChanges` | boolean | Whether draft has unsaved changes vs published |
| `isArchived` | boolean | Soft-deleted, hidden from main list |

### 1.3 Workflow Status in Lists
On the Workflows page, each workflow card shows one of:
- **Active** (green dot): Published, production triggers running
- **Inactive** / **Paused**: Published but triggers deactivated
- **Draft** (gray): Has never been published

---

## 2. Workflow Publishing System (Complete)

### 2.1 Publish Button States Reference
Implement these exact states in the Studio header:

| State | Button Text | Enabled | Description |
|-------|-------------|---------|-------------|
| `no-trigger-no-changes` | "Publish" | Disabled | Nothing to publish |
| `has-changes-not-published` | "Publish" | Enabled | First publish |
| `published-no-changes` | "Published ✓" | Disabled | Up to date |
| `published-has-changes` | "Publish changes" | Enabled | Updates to push |
| `published-invalid-changes` | "Publish" | Disabled + warning | Fix errors first |
| `published-error` | "Publish" | Enabled + error | Has errors, can still try |

### 2.2 Publish Modal Fields
When user clicks Publish (or presses `Shift+P`):
```typescript
{
  versionName: string;       // Default: auto-generated UUID, user can rename
  description: string;       // Optional, max 255 chars, 1-2 sentences
}
```

After confirmation: workflow goes live immediately.

**Named versions** (Pro/Enterprise):
- Dropdown arrow next to Publish → "Name version"
- Or from version history: Options → "Name version"
- Named versions protected from automatic pruning
- Appear with custom name in version history

### 2.3 Publish Shortcuts
- `Shift+P` — open publish modal
- `Ctrl/Cmd+S` — open "Name version" dropdown (NOT publish — it names)
- `Ctrl/Cmd+U` — unpublish current workflow

### 2.4 Unpublish Effects
When workflow is unpublished:
- Webhook triggers stop responding (return 404 or 410)
- Schedule triggers stop running
- Form triggers become inaccessible
- Production URL for chat/forms goes dead
- Workflow shows as "Inactive" in list

### 2.5 Auto-Save Behavior
- Every edit auto-saves within 1–5 seconds
- Auto-save creates a new version entry in history
- Draft versions are pruned based on plan tier
- **Named versions** survive pruning forever
- No "Unsaved changes" warning needed — always auto-saved

---

## 3. Version History System

### 3.1 Version History Page
Accessible from: Studio header → clock/history icon

**Version list shows:**
- Timestamp of creation
- Created by (user display name)
- Version name (if named, otherwise "Version 1.2.3")
- Published indicator (which version is currently live)

### 3.2 Actions on Each Version
| Action | Description |
|--------|-------------|
| **Restore** | Load this version into draft (does NOT auto-publish) |
| **Publish** | Make this specific version the live version |
| **Clone** | Create new workflow based on this version |
| **Download** | Export version as JSON |
| **Name version** | Add a custom name + description (Pro/Enterprise) |
| **Compare** | Diff view against current draft (n8n feature) |

### 3.3 History Retention Tiers

| Plan | History Retention |
|------|-------------------|
| Free | Last 24 hours only |
| Pro | Last 5 days |
| Enterprise | Unlimited |
| (Named versions) | Unlimited, regardless of plan |

### 3.4 Version JSON Format
```typescript
{
  id: string;                    // Version UUID
  workflowId: string;
  createdAt: string;             // ISO timestamp
  authors: string;               // Comma-separated user names
  description?: string;          // User-provided description
  versionId: string;             // Which workflow version this is
  nodes: WorkflowNode[];         // Snapshot of nodes at this version
  connections: Connection[];      // Snapshot of connections
  settings: WorkflowSettings;    // Snapshot of settings
}
```

---

## 4. Workflow Sharing and Permissions

### 4.1 Creator and Editor Roles

| Role | Description |
|------|-------------|
| **Creator** | User who created the workflow. Has full control. |
| **Editor** | Added collaborator. Can edit but not delete or change sharing. |

### 4.2 Credential Sharing Behavior
Credentials are NOT automatically shared with workflow editors:
- When an editor opens a workflow with credentials they don't own → credential shows as "missing"
- The creator must explicitly share credentials with the editor
- Or: editor must add their own credentials to replace the creator's

**This is a key UX moment to design:** 
- Show a clear "You don't have access to credential X" message
- Offer option to add own credentials or request access

### 4.3 Project-Based Sharing
In Pro/Enterprise, workflows exist within **Projects**:
- Project members inherit access to all workflows in the project
- Project roles: Admin, Editor, Viewer
- Personal project: only the user, not shareable (on lower plans)

---

## 5. Complete Workflow Settings Reference

### 5.1 Settings Modal Location
Canvas header → `⋯` three-dot menu → "Settings"

### 5.2 All Settings (Complete)

#### General Settings
```typescript
{
  // Workflow name
  name: string;              // Editable in settings or in-canvas header

  // Execution behavior
  executionOrder: "v0" | "v1";   // v1 = recommended (branch-by-branch)
  timezone: string;              // Default: instance timezone. Used for cron/schedule
  callerPolicy:
    "workflowsFromSameOwner" |   // Only workflows by same user
    "workflowsFromAList" |       // Specific workflow IDs
    "any" |                      // Any workflow
    "none";                      // Cannot be called as sub-workflow
  callerIds?: string;            // Comma-separated workflow IDs (when callerPolicy="workflowsFromAList")
}
```

#### Error Handling Settings
```typescript
{
  errorWorkflowId?: string;      // Workflow to trigger on failure
}
```

#### Save / Storage Settings
```typescript
{
  saveFailedExecutions: "all" | "none";         // Save failed production execs
  saveSuccessfulExecutions: "all" | "none";      // Save successful production execs
  saveManualExecutions: "all" | "none";          // Save manual test execs
  saveExecutionProgress: boolean;                // Save after each node (resume-from-failure)
  // Note: saveExecutionProgress = true increases execution time (more DB writes)
}
```

#### Timeout Settings
```typescript
{
  timeout: boolean;              // Enable/disable timeout
  executionTimeout: number;      // Seconds. -1 = instance default
}
```

#### Redaction Settings (Enterprise)
```typescript
{
  executionDataSaveMode: {
    production: "none" | "noMetaData" | "full";
    manual: "none" | "noMetaData" | "full";
  }
  // "none" = don't save
  // "noMetaData" = save without payload (redacted)
  // "full" = save everything
}
```

#### Analytics Settings (Pro/Enterprise)
```typescript
{
  stats: {
    estimatedSavedTime?: number;   // Minutes saved per execution (for Insights dashboard)
    timeSaved?: {
      unit: "minutes" | "hours";
      value: number;
    }
  }
}
```

### 5.3 Settings Change Impact
| Setting Changed | Impact |
|----------------|--------|
| Execution order | Takes effect on next execution |
| Timezone | Takes effect on next scheduled run |
| Error workflow | Takes effect immediately |
| Save settings | Takes effect immediately |
| Timeout | Takes effect immediately |
| Caller policy | Takes effect immediately for new calls |

---

## 6. Execution Management

### 6.1 Executions List Page
Show list of executions for a workflow with these columns:
- **Status**: Success ✓ / Failed ✗ / Running ⟳ / Waiting ⏸
- **Started**: Relative timestamp ("2 minutes ago")
- **Duration**: How long execution took
- **Mode**: Manual / Production / Retry
- **ID**: Execution UUID (truncated, click to copy)

**Filters:**
- Status filter (All / Success / Failed / Running / Waiting)
- Date range picker
- Triggered by (trigger type / user)

### 6.2 Execution Detail View
When user clicks an execution:
- Shows full node execution timeline
- Click any node to see its Input / Output data
- Status: green (success) / red (fail) / gray (skipped) per node
- Timing bar shows relative duration per node
- Error details for failed nodes

### 6.3 Execution Actions
| Action | Available When |
|--------|----------------|
| **Retry** | Failed executions |
| **Delete** | Any completed execution |
| **Stop** | Running/waiting executions |

### 6.4 Manual vs Partial vs Production Executions

| Type | Trigger | Uses Version | Saves? |
|------|---------|-------------|--------|
| Manual | "Execute Workflow" button | Draft | If `saveManualExecutions = true` |
| Partial | "Execute Until Here" | Draft (up to selected node) | If `saveManualExecutions = true` |
| Production | Active trigger | Published | If `saveSuccessfulExecutions / saveFailedExecutions` |
| Retry | User action | Published (same as original) | Yes, marks as retry |

### 6.5 Pinned Data
Users can **pin** the output of any node for testing:
- Pinned data is used instead of real execution during manual tests
- Shows a "pin" indicator on the node
- Allows testing downstream logic without re-running upstream nodes
- Pinned data is stored per-workflow (not per-execution)
- Pin data can be cleared node-by-node

**Implementation:**
```typescript
pinnedData: {
  [nodeId: string]: FlowItem[]   // Pinned output for each node
}
```

### 6.6 Execution Context Data
Can be attached to executions for filtering/debugging:
```typescript
$execution.customData.set('orderId', '12345')    // Set in expression
$execution.customData.get('orderId')              // Get in another node
$execution.customData.getAll()                    // Get all custom data
```
Custom data appears in execution list for easy filtering.

---

## 7. Collaboration Features

### 7.1 Edit Lock System
Only one user can edit a workflow at a time:

**Lock acquisition:**
- Automatic when user opens workflow in Studio
- Lock token stored per-workflow (who has it, when acquired)
- Displayed to other users: "Currently being edited by [User Name]"

**Lock release:**
- User closes tab / navigates away
- User is inactive for > N minutes (configurable timeout)
- User explicitly releases lock (future feature)

**Lock takeover:**
- If editor appears inactive, other users can "Take Over Editing"
- Previous editor's unsaved changes are preserved (auto-save ensures this)

**UI:**
- Read-only mode shows "View Only" banner at top of Studio
- Shows avatar/name of current editor
- "Take over" button appears if editor is inactive

### 7.2 Real-Time Collaboration (Future)
Eventually support cursor presence and multi-user editing:
- Colored cursors per user
- Node selection highlighting (which user has what selected)
- Conflict resolution for simultaneous edits
- This is a significant engineering effort — deprioritized

---

## 8. Workflow Archive System

### 8.1 Archiving vs Deleting
**Archive** = soft delete:
- Workflow is hidden from main list
- Still accessible via "Archived" filter
- Executions history preserved
- Can be unarchived

**Delete** = hard delete:
- Workflow is permanently removed
- Execution history is deleted
- Cannot be recovered

### 8.2 Archive UI
In workflow list:
- Three-dot menu on workflow card → "Archive"
- "Archived" filter in workflow list header
- Archived workflows shown with muted styling
- "Unarchive" option in archived workflow three-dot menu

---

## 9. Workflow Templates System

### 9.1 Templates Page
A browsable library of pre-built workflows:
- Browse by category (Marketing, DevOps, AI, Finance, etc.)
- Search by name, node, integration
- Each template has: name, description, node list, preview image

### 9.2 Template Detail Page
- Shows: name, description, creator, used count, node icons
- "Use this template" button → creates new workflow from template
- Template workflows start in draft state

### 9.3 Save Workflow as Template
- From workflow settings or three-dot menu → "Share as template"
- Fill: name, description, category tags, cover image
- Option to submit to public template library

### 9.4 Template Data Format
```typescript
{
  id: string;
  name: string;
  description: string;
  totalViews: number;
  categories: string[];
  nodes: Array<{
    displayName: string;
    iconUrl?: string;
  }>;
  workflowInfo: {
    nodeCount: number;
    triggerCount: number;
  };
  image: string;   // Cover image URL
  workflow: WorkflowJSON;  // The actual workflow definition
}
```

---

## 10. Import / Export System

### 10.1 Export Workflow as JSON
- From workflow list: three-dot menu → "Export"
- From Studio: three-dot menu → "Export"
- Exported as: `workflow-name.json`

**Exported JSON contains:**
- All node configurations
- All connections
- Workflow settings
- Node positions
- Pinned data (optional)
- Does NOT include: actual credentials (only credential type references)

### 10.2 Import Workflow JSON
- From workflows list: "Import" button
- Drag-and-drop JSON file OR paste JSON
- After import: workflow is in draft state
- Credential references shown as "missing" — user must reconnect

### 10.3 Cross-Instance Portability
Workflows exported from n8n/FlowHolt can be imported into any FlowHolt instance because:
- Node types are identified by `type` string (e.g., `"n8n-nodes-base.httpRequest"`)
- No instance-specific data in workflow JSON (except credential type references)
- Users replace credentials for their instance after import

---

## 11. Workflow Discovery and Organization

### 11.1 Workflow List Page Features
- **Search**: Real-time filter by workflow name
- **Folders**: Hierarchical folder structure (Pro/Enterprise)
- **Tags**: Color-coded labels for categorization
- **Filters**: Active/Inactive, Created by, Modified date, Tags
- **Sort**: Last modified, Name, Created date, Last executed

### 11.2 Folders System (Pro/Enterprise)
```typescript
{
  id: string;
  name: string;
  projectId: string;
  parentFolderId?: string;   // Nested folders
  createdAt: string;
  updatedAt: string;
}
```

- Folders shown in left sidebar of Workflows page
- Drag-and-drop workflows into folders
- Folder breadcrumb navigation
- Folder sharing inherits project role

### 11.3 Tags System
- Up to 10 tags per workflow
- Tags are instance-wide (shared across all users)
- Color-coded labels
- Filter workflows by tag
- Tag management in Settings → Tags

---

## 12. FlowHolt Implementation Status

### Publishing System:
- [x] Draft/published state model
- [x] Publish button in Studio header
- [ ] All 6 Publish button states (visual states)
- [ ] Publish modal with name/description
- [ ] Named versions (Pro/Enterprise)
- [x] Unpublish workflow
- [x] Auto-save behavior
- [ ] Keyboard shortcuts (Shift+P, Ctrl+S, Ctrl+U)

### Version History:
- [ ] Version history page (full)
- [ ] Restore, Publish from history, Clone, Download actions
- [ ] 3-tier retention enforcement (24h/5d/unlimited)
- [ ] Named version protection from pruning
- [ ] Diff view (compare versions)

### Collaboration:
- [ ] Edit lock system (per-workflow, per-session)
- [ ] "Read-only" mode when workflow is locked
- [ ] "Editing by [user]" indicator in Studio
- [ ] Lock takeover mechanism
- [ ] Lock auto-release on inactivity

### Settings:
- [x] Workflow name
- [x] Execution order (v1)
- [x] Error workflow
- [x] Timezone
- [x] Caller policy
- [x] Save execution toggles
- [ ] Save execution progress toggle
- [ ] Workflow timeout setting
- [ ] Redact execution data (Enterprise)
- [ ] Estimated time saved

### Executions:
- [x] Executions list page
- [x] Execution detail view
- [x] Retry failed executions
- [x] Node input/output viewer
- [ ] Execution status filtering
- [ ] Date range filter
- [ ] Execution custom data API
- [ ] "Execute Until Here" (partial execution)

### Organization:
- [x] Workflow list with search
- [x] Tags system
- [ ] Folders (Pro/Enterprise)
- [x] Archive/delete workflows
- [ ] Import/export JSON
- [ ] Templates library
- [ ] "Save as template" from workflow
