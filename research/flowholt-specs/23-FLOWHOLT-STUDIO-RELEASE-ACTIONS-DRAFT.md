# FlowHolt Studio Release Actions Draft

This file makes the Studio plan more release-aware by defining where run, replay, save version, compare, publish, and approval actions should live.

It is grounded in:
- `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md`
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md`
- `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md`
- local Make UI evidence in:
  - `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md`
  - `research/make-help-center-export/assets/images/FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png`
  - `research/make-help-center-export/assets/images/E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png`
  - `research/make-help-center-export/assets/images/Zusz0Qbp3EP67xJ3qK7cl-20251003-145143__30f711290366.png`
- the flattened PDF reference note in `20-MAKE-FLATTENED-PDF-REFERENCE-NOTES.md`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| Make bottom toolbar | `research/make-advanced/02-bottom-toolbar/` | 11 exact button IDs + purposes |
| Make scenario header | `research/make-advanced/01-root-exploration/` | Scenario title + actions dropdown |
| Make run bar screenshot | `research/make-help-center-export/assets/images/E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png` | Run bar visual pattern |
| Make version history | `research/make-help-center-export/pages_markdown/restore-and-recover-scenario.md` | Manual save → version entry |
| n8n publish button states | `n8n-master/packages/editor-ui/src/components/MainHeader/WorkflowHeaderDraftPublishActions.vue` | 6 publish button states |
| n8n workflow details header | `n8n-master/packages/editor-ui/src/components/MainHeader/WorkflowDetails.vue` | Draft/Published state display |
| n8n tabs | `n8n-master/packages/editor-ui/src/components/MainHeader/MainHeader.vue` | Per-workflow tabs (Workflow/Executions/Settings/Evaluation) |

### n8n comparison (publish states)

| n8n publish state | FlowHolt equivalent |
|------------------|---------------------|
| `Publish` (button label) | Publish button (default) |
| `Save` | Save version button |
| `Publishing...` | Publishing... (spinner) |
| `Saving...` | Saving... (spinner) |
| `Published` | Published (green) |
| `Saved` | Saved (gray) |
| Unsaved changes indicator | "Has unsaved changes" dot |

FlowHolt adds: **Promote to Staging** and **Request Production Approval** as additional states in the publish button dropdown (not present in n8n).

### This file feeds into

| File | What it informs |
|------|----------------|
| `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` | Studio-side deployment actions |
| `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` | Bottom run bar button layout |
| `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Tab states per role |
| `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | Studio route button behaviors |

---

Prevent release and runtime actions from being scattered across unrelated places in Studio.

The user should always know:
- how to test
- what version they are editing
- what environment they are targeting
- whether they can publish directly
- where replay lives

## Core release-aware Studio principle

Studio is not only an authoring surface.

It is also the place where a builder or publisher understands the relationship between:
- draft state
- runtime behavior
- release readiness
- environment deployment

## Control placement model

## 1. Top header: identity and release context

The top header should carry:
- workflow name
- draft or active badge
- environment chip
- current version reference
- compare entry
- publish-state summary

Do not make the header the primary place for `Run once`.

Reason:
- Make’s UI evidence is stronger around persistent lower run controls than top-bar run actions
- top header should explain state more than trigger runtime operations

## 2. Bottom bar: run and near-run actions

The bottom bar should carry:
- `Run once`
- replay menu
- schedule state
- stop
- save version
- workflow settings shortcut

Why:
- Make screenshots consistently show the run bar as a persistent operating strip
- replay belongs adjacent to run, not buried in history only

## 3. Right-side workflow inspector: release detail

When no node is selected, the workflow inspector should expose:
- draft summary
- last staged version
- last published version
- compare changes
- promotion history
- approval requirements

This prevents users from leaving Studio just to answer “what am I editing relative to production?”

## Action groups

## Group A: Draft authoring actions

Actions:
- save
- save version
- compare with staging
- compare with production
- rename
- edit workflow settings

Primary home:
- header for save state
- bottom bar for save version
- workflow inspector for compare entries

## Group B: Runtime actions

Actions:
- run once
- stop
- replay
- run using current draft
- run with existing data later

Primary home:
- bottom bar
- runtime drawer for advanced replay context

## Group C: Release actions

Actions:
- request staging promotion
- request production approval
- publish directly when allowed
- rollback view entry

Primary home:
- workflow inspector `Release` tab
- promotion modal

Secondary visibility:
- header chip may show blocked or approval-required state

## Group D: Review actions

Actions:
- compare versions
- inspect deployment warnings
- inspect policy blockers
- open approval review queue

Primary home:
- workflow inspector
- environment drawer or modal later

## State model

Studio should visually distinguish these states:
- draft with unpublished changes
- draft aligned with latest saved version
- staged but not production
- production current
- production blocked by approval
- policy blocked due to assets or public trigger rules

## Suggested header chips

- `Draft`
- `Staged vN`
- `Production vN`
- `Approval Required`
- `Policy Blocked`

## Suggested bottom bar control logic

### Builder with draft rights

Visible:
- Run once
- Replay
- Save version
- Schedule state
- Workflow settings

Conditional:
- `Request promotion` appears if direct release is not available

### Restricted Publisher

Visible:
- Run once optional
- Replay
- Save version read-only or hidden
- Request promotion
- Publish if permitted

### Operator

Visible:
- Run once if allowed
- Replay
- Schedule state
- runtime drawer shortcuts

Hidden:
- Save version
- publish or compare authoring actions unless explicitly needed

## Compare flow

Studio should support compare from the workflow inspector:
- current draft vs staging
- current draft vs production
- staging vs production later

Compare should summarize:
- steps added
- steps removed
- steps changed
- edges changed
- policy-impacting differences later

## Approval flow in Studio

If approval is required:
- publish button becomes `Request approval`
- release tab shows current approval policy
- modal explains reviewer threshold and self-approval rule

If blocked by public trigger policy or production-asset policy:
- action remains visible but disabled with explanation

## Replay flow in Studio

Replay should be accessible from two places:
- bottom bar quick menu
- runtime drawer on a selected execution

Replay choices:
- same version
- latest published
- current draft

Why:
- current backend already supports these replay modes
- exposing them clearly creates a mature operating model rather than a hidden debug trick

## Visual cues from Make evidence

Observed and preserved:
- persistent operation strip at bottom
- replay close to run controls
- schedule visibility close to runtime controls
- AI-heavy nodes can coexist with strong runtime affordances without cluttering the header

## Planning decisions for FlowHolt

- Keep run and replay low in the layout, not buried in menus or moved fully into the header.
- Keep release status high in the layout, near workflow identity.
- Keep approval and policy blockers explicit in Studio, not only on separate environment pages.
- Keep compare and deployment context accessible without leaving the editor.

## Workflow version history

n8n's workflow history model is the closest reference for FlowHolt's version history feature.

### n8n version creation triggers (confirmed from docs)

n8n creates a new version when:
- User saves the workflow (manual save)
- User restores a previous version (n8n saves current before restoring)
- Pull from a Git repository via source control

n8n does **not** create a new version when workflow settings change — only structural/node changes.

### Version history plan-tier model (n8n reference)

| Tier | History available |
|------|------------------|
| Enterprise | Unlimited history |
| Pro / Business | Last 5 days |
| All users | Last 24 hours |
| FlowHolt | Per-workspace setting (env: `WORKFLOW_HISTORY_PRUNE_HOURS`, default -1 = unlimited) |

n8n env var: `N8N_WORKFLOW_HISTORY_PRUNE_TIME` (hours, default `-1` = keep forever).

### Version actions (n8n confirmed)

Each saved version should support:
- **Restore version** — replace current workflow with this version; saves current before restoring
- **Clone to new workflow** — creates a new workflow from this version
- **Open in new tab** — readonly preview for diffing
- **Download as JSON** — raw export
- **Name version** — add name + description; named versions are protected from automatic pruning

### FlowHolt additions

FlowHolt should extend this with:
- Named versions protected from pruning (same as n8n)
- Version notes on publish or promotion (not just save)
- Version comparison integrated into the Studio Release inspector tab

## Remaining work

The final plan still needs:
- exact modal copy model
- detailed compare drawer spec
- staging and production chip behavior
- interaction wireframe for blocked publish versus approval-request flows
