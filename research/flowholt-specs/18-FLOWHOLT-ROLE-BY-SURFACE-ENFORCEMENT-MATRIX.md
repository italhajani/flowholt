# FlowHolt Role By Surface Enforcement Matrix

This file converts the permissions and confidentiality drafts into a concrete UI-surface enforcement plan.

It is grounded in:
- `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md`
- `15-FLOWHOLT-STUDIO-INSPECTOR-MODAL-INVENTORY.md`
- `16-FLOWHOLT-CONFIDENTIAL-DATA-GOVERNANCE-DRAFT.md`
- current FlowHolt backend policy and redaction controls in:
  - `backend/app/models.py`
  - `backend/app/main.py`
  - `backend/app/repository.py`

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| Make role model | `research/make-help-center-export/pages_markdown/user-roles.md` | 5 org roles and their surface access |
| Make scenario access | `research/make-help-center-export/pages_markdown/scenarios.md` §Access | Who can view/edit scenarios |
| n8n workflow:publish scope | `n8n-master/packages/cli/src/permissions/global.roles.ts` | Publish as separate permission |
| n8n project role caps | `n8n-master/packages/cli/src/permissions/project.roles.ts` | Role enforcement per endpoint |
| n8n RBAC decorators | `n8n-master/packages/cli/src/decorators/requires-global-scope.decorator.ts` | How n8n enforces roles on routes |
| n8n execution access | `n8n-master/packages/cli/src/controllers/executions.controller.ts` | Execution data visibility |

### n8n comparison (enforcement patterns)

| Pattern | n8n | FlowHolt |
|---------|-----|----------|
| Route-level enforcement | `@RequiresGlobalScope()` decorator | `require_workspace_role()` middleware |
| Field-level masking | Credential value never returned | `redaction_policy` in execution responses |
| Publish permission | `workflow:publish` separate scope | `can_publish` capability |
| Read-only mode | Project Viewer = read-only | Monitor role = read-only |
| Execution data | Scoped by project membership | Scoped by workspace + confidentiality setting |

### This file feeds into

| File | What it informs |
|------|----------------|
| `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md` | Route-level role mapping |
| `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` | Capability object design |
| `31-FLOWHOLT-CAPABILITY-API-SHAPES-AND-ROLLOUT.md` | Capability API shapes |
| `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` | Capability denial responses |

---

FlowHolt should not enforce access only at the route level.

Every important surface must define:
- who can enter
- which actions are enabled
- which data classes are visible
- which fields are masked, redacted, or hidden
- which actions require approval or elevation

## Role set used here

- Org Owner
- Org Admin
- Team Admin
- Builder
- Operator
- Monitor
- Restricted Publisher

## Surface-state vocabulary

- visible
- visible with masked fields
- visible with metadata only
- visible read-only
- action disabled
- action hidden
- approval required

## 1. Workflow inventory surfaces

### Workflow list

Org Owner:
- visible
- can create, edit, run, publish, archive

Org Admin:
- visible
- can create, edit, run, publish within policy

Team Admin:
- visible for team scope
- can create, edit, run, publish within team policy

Builder:
- visible
- can create and edit
- run actions visible if workspace run policy allows
- publish action visible only if role and policy allow

Operator:
- visible
- edit hidden or disabled
- run and replay visible

Monitor:
- visible
- metadata and status visible
- edit and run hidden

Restricted Publisher:
- visible
- publish and promote visible where allowed
- general editing minimized

## 2. Studio top header

Controls in scope:
- workflow rename
- save state
- editor or runs switch
- workflow settings
- assist
- share

Builder:
- rename enabled
- save enabled
- workflow settings visible

Operator:
- rename disabled
- save hidden or disabled
- runs switch visible
- workflow settings visible read-only if needed

Monitor:
- rename hidden
- save hidden
- runs switch visible

Restricted Publisher:
- rename optional read-only
- release actions visible

## 3. Studio node inspector

Current FlowHolt already has a rich node inspector with `Parameters`, `Settings`, and `Test`.

### Parameters tab

Builder:
- visible and editable
- bindable fields visible
- secret-backed bindings shown as masked references

Operator:
- visible read-only
- no field editing
- no secret reveal

Monitor:
- visible metadata-only where needed
- sensitive field values may be hidden

Restricted Publisher:
- usually read-only
- enough visibility to review release impact

### Settings tab

Builder:
- move, duplicate, and delete enabled

Operator:
- action controls hidden

Monitor:
- actions hidden

### Test tab

Builder:
- run test enabled in draft and staging
- pinned data visible only if runtime-content rights allow

Operator:
- run test only if explicitly allowed by policy
- pinned data content often hidden

Monitor:
- test disabled
- prior test metadata only

## 4. Studio bottom run bar

Visual reference basis:
- Make screenshots in `14-MAKE-VISUAL-UI-EVIDENCE-NOTES.md` show a persistent run bar with strong run CTA, replay entry, and schedule visibility.

Surface rules:

Builder:
- `Run once` visible
- replay visible for accessible executions
- schedule visibility visible

Operator:
- `Run once` visible if `run_min_role` allows
- stop, replay, and schedule controls emphasized
- save and edit-affecting controls hidden

Monitor:
- run hidden or disabled
- schedule state visible
- runtime summary visible

Restricted Publisher:
- run optional
- environment and release controls visible

## 5. Runtime drawer and execution inspectors

Panels in scope:
- run list
- trace
- output
- logs
- reasoning

### Run list

Builder:
- visible
- can open run detail

Operator:
- visible
- can open run detail
- can replay where allowed

Monitor:
- visible
- metadata always visible

### Output and trace panels

Builder:
- full in draft and staging
- production depends on runtime payload policy

Operator:
- usually visible
- subject to redaction policy

Monitor:
- metadata-only or redacted by default

### Reasoning panel

Builder:
- visible only when reasoning policy allows

Operator:
- hidden by default unless explicitly granted

Monitor:
- summary-only or hidden

Restricted Publisher:
- summary visibility useful for release review, not full raw reasoning by default

## 6. Vault and secret surfaces

### Vault list

Builder:
- visible
- can use assets
- can see metadata
- raw secret values masked

Operator:
- visible
- can use approved assets in runs
- cannot edit most secret definitions

Monitor:
- metadata-only
- no secret material

### Credential detail

Org Owner and Org Admin:
- reveal action available with audit logging

Team Admin:
- reveal only for team-scoped assets when policy allows

Builder:
- no reveal by default
- rotate or update may be allowed without reveal

Operator:
- no reveal

Monitor:
- no reveal

### Credential create or edit overlay

Builder:
- allowed for workspace-scoped assets if policy permits

Operator:
- hidden

Monitor:
- hidden

## 7. Execution detail page

Surface sections:
- overview
- input payload
- output payload
- artifacts
- pause or human task state
- replay

### Payload visibility

Draft:
- Builders usually full
- Operators usually full or redacted
- Monitors usually redacted

Production:
- Builders not automatically full
- Operators limited by workspace policy
- Monitors metadata-only or redacted

### Replay control

Builder:
- visible for accessible executions

Operator:
- visible if run policy allows

Monitor:
- hidden

Restricted Publisher:
- visible when useful for validating release effects

## 8. Pinned data surfaces

Pinned data appears in authoring context but originates from runtime context.

Rules:
- visible only to users who may inspect the underlying runtime content class
- must show source execution and environment
- should indicate if content is redacted

Builder:
- can pin in draft and staging when allowed

Operator:
- generally no pin creation from Studio authoring mode

Monitor:
- no pin creation

## 9. Publish, promote, and approval surfaces

### Publish modal

Builder:
- visible only when `publish_min_role` allows and production asset policy passes

Operator:
- hidden

Monitor:
- hidden

Restricted Publisher:
- visible and primary

### Approval request modal

Builder:
- visible when direct publish is blocked but approval path exists

Restricted Publisher:
- may request or complete depending on workspace policy

### Approval review surface

Org Owner and Org Admin:
- visible
- approve or reject if role threshold met

Team Admin:
- visible for team-controlled scopes when allowed

Builder:
- usually request-only, not approve

Operator:
- usually hidden

Monitor:
- metadata-only

## 10. Public trigger configuration surfaces

Surfaces:
- webhook exposure
- public chat trigger exposure
- allowed origins
- signature controls

Builder:
- can configure in draft
- publish blocked if workspace policy disallows public exposure

Operator:
- read-only

Monitor:
- metadata-only

Restricted Publisher:
- release impact visible

## 11. AI agent surfaces

### Agent inventory

Builder:
- visible
- create and edit

Operator:
- visible
- use and test where allowed

Monitor:
- visible metadata-only

### Agent reasoning and tool trace

Builder:
- visible in draft and staging if allowed

Operator:
- visible only with explicit reasoning permission

Monitor:
- summary-only or hidden

### Knowledge attachment panels

Builder:
- attach and configure

Operator:
- view bindings, usually not edit

Monitor:
- metadata-only

## 12. Enforcement implementation model

Frontend must enforce affordance rules:
- hide forbidden destructive actions
- show masked values instead of blanking everything
- show policy explanations when actions are disabled

Backend must enforce real authorization:
- route-level checks
- field-level reveal checks
- environment-aware runtime redaction
- replay permission checks
- publish and approval checks

## Key decisions for FlowHolt

- `view workflow` must not imply `view production payload`.
- `use secret` must not imply `reveal secret`.
- `edit workflow` must not imply `publish workflow`.
- `observe execution` must not imply `view reasoning`.
- `run workflow` must not imply `pin confidential runtime data`.

## Remaining work

The final plan still needs:
- a compact matrix table version for implementation teams
- per-route API authorization notes
- explicit UI component states for disabled, masked, and approval-required actions
