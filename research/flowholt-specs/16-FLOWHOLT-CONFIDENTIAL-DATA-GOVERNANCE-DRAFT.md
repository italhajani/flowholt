# FlowHolt Confidential Data Governance Draft

This file deepens the permissions draft into concrete rules for secrets, execution data, AI traces, human-task payloads, and environment-specific confidentiality.

It is grounded in:
- Make maturity patterns around execution privacy, teams, and operational controls
- current FlowHolt backend models for vault access, workflow policy, workspace settings, trigger exposure, and execution inspection
- current FlowHolt Studio evidence for pinned data, credential overlays, and test payload editing

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| Make data confidentiality | `research/make-help-center-export/pages_markdown/scenario-settings.md` §"Data is confidential" | Confidential execution setting |
| Make credential security | `research/make-help-center-export/pages_markdown/connect-an-application.md` | Credentials never visible to other users |
| Make data security | `research/make-pdf-full.txt` §Data security | AES/PGP/hashing patterns |
| Make audit logs | `research/make-help-center-export/pages_markdown/audit-logs.md` | What gets audit-logged |
| n8n credential encryption | `n8n-master/packages/cli/src/credentials/` | AES-256 encryption with master key |
| n8n execution data | `n8n-master/packages/cli/src/databases/entities/WorkflowExecution.ts` | Execution data storage |
| n8n secret store | `n8n-master/packages/cli/src/external-secrets/` | External secrets integration |
| FlowHolt vault | `backend/app/encryption.py` | Current encryption implementation |
| FlowHolt models | `backend/app/models.py` → `VaultScope`, `VaultAssetAccessPolicy` | Access policies |

### This file feeds into

| File | What it informs |
|------|----------------|
| `17-FLOWHOLT-BACKEND-ENTITY-EVENT-MODEL-DRAFT.md` | `SecretEnvelope`, `SecretAccessPolicy` entities |
| `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` | Credential encryption model |
| `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md` | Data-class visibility per role |
| `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` | Execution data visibility rules |
| `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` | Audit log events |

---

FlowHolt should treat sensitive data as a first-class planning domain, not as a hidden implementation detail.

The product must distinguish between:
- configuration visibility
- secret value visibility
- runtime payload visibility
- AI reasoning visibility
- operational authority

Seeing that an object exists is not the same as being allowed to reveal or export its data.

## Data classification model

Every user-facing sensitive object should carry a classification.

### Class A: public metadata

Examples:
- workflow name
- node names
- provider name
- execution timestamps
- success or failure status

Typical access:
- broadly visible to users who can access the parent object

### Class B: restricted metadata

Examples:
- asset usage counts
- collaborator list
- environment bindings
- webhook endpoint existence

Typical access:
- visible to builders, operators, admins, and monitors within scope

### Class C: confidential content

Examples:
- execution payload bodies
- response bodies
- pinned data
- uploaded documents
- human-task instructions with business data
- knowledge asset excerpts

Typical access:
- visible only with explicit runtime-data permission

### Class D: secret material

Examples:
- API keys
- OAuth tokens
- passwords
- signing secrets
- encryption material

Typical access:
- almost never fully reveal
- use is allowed more often than reveal

### Class E: sensitive reasoning and decision traces

Examples:
- AI reasoning traces
- tool call arguments with hidden fields
- memory state
- moderation or guardrail internals

Typical access:
- most restricted class after raw secrets

## Sensitive object catalog

Objects requiring explicit confidentiality rules:
- vault credentials
- vault variables
- connections
- webhook signing secrets
- execution payloads
- execution artifacts
- error bodies
- replay payload overrides
- pinned data
- chat trigger transcripts
- AI agent memory
- AI tool inputs and outputs
- knowledge retrieval snippets
- human-task responses

## Permission dimensions

For sensitive data, normal `view` is not enough.

FlowHolt should evaluate these separate verbs:
- discover
- view metadata
- use in execution
- test with
- reveal secret
- inspect runtime content
- inspect reasoning
- export
- approve access policy

## Secrets policy

### Secret reveal rules

Default policy:
- credentials and secret variables are masked by default
- builders can attach approved secrets without seeing raw values
- operators can run workflows that use secrets without seeing raw values
- monitors can see that a secret-backed asset was used, but not its content

Only privileged roles should reveal raw secrets, and every reveal must:
- require a deliberate action
- show a warning
- create an audit event
- be rate-limited later if necessary

### Secret creation and editing rules

Allowed actions:
- create secret
- rotate secret
- archive secret
- change visibility
- test secret connectivity

Policy:
- edit does not imply reveal
- rotate does not imply reveal
- reveal does not imply export

### Secret export rules

The platform should avoid raw secret export whenever possible.

Preferred alternatives:
- clone reference
- rotate in place
- generate replacement
- use secret in test without showing it

## Runtime payload governance

Runtime data must be governed independently from workflow edit rights.

### Runtime visibility levels

Each workflow and environment should support a runtime visibility policy:
- full
- redacted
- metadata-only

### Default guidance

Draft environment:
- builders may see more runtime detail for debugging

Staging:
- similar to draft but subject to org policy

Production:
- stricter defaults
- many roles should see only metadata or redacted bodies

## Payload redaction model

The product should support redaction at:
- field level
- artifact level
- step level
- execution level

Redaction sources:
- asset schema marks a field as secret
- node definition marks output as sensitive
- workflow policy marks step as confidential
- environment policy requires redaction

## Execution data redaction — n8n confirmed model (v2.16.0)

n8n's execution data redaction implementation is the closest reference for FlowHolt's redaction design.

### Two independent redaction toggles per workflow

| Toggle | What it controls |
|--------|-----------------|
| `redact_production_execution_data` | Production executions (webhook, schedule, trigger-started) |
| `redact_manual_execution_data` | Manual executions (started from Studio editor) |

These map exactly to the fields already in FlowHolt's workflow settings.

### What redaction does (n8n confirmed)

- Replaces all node input/output data with empty object `{}`
- Removes binary data (files, images)
- Redacts error messages — preserves only error type and HTTP status code
- Execution metadata remains visible: node names, status, timing, workflow structure
- Applied at **API level only** — data is still stored unredacted in the database
- Also applied to log streaming output when enabled

### Reveal mechanism

- `execution:reveal` scope required to temporarily reveal redacted data for a specific execution
- Instance owners and admins have this scope by default
- Custom roles can grant it to others (e.g. a compliance reviewer role)
- Every reveal is audited: `n8n.audit.execution.data.revealed` event

FlowHolt equivalent: `execution_capability.view_payload` with `redaction: "omit"` state → reveal action requires separate capability check, emits audit event.

### Node-level sensitive output fields

n8n allows custom node definitions to declare `sensitiveOutputFields`:
- Always redacted, even for users with reveal access
- Fail-closed: if node type is not found (e.g. community node uninstalled), fully redacts all output

FlowHolt equivalent: node sensitivity class `S2` fields should follow same fail-closed behavior.

### Scope governance

| Scope | Who needs it |
|-------|-------------|
| `workflow:updateRedactionSetting` | Builder or team admin setting redaction policy per workflow |
| `execution:reveal` | Compliance reviewer, ops admin — must be explicitly granted |

### Audit events to add

- `execution.data.revealed` — user, execution ID, workflow ID, timestamp, IP, redaction policy in effect
- `execution.data.reveal_failure` — denied reveal attempt with rejection reason
- `workflow.redaction_policy_changed` — who changed the policy and to what value

## Execution inspector rules

Execution detail pages and Studio runtime drawers must respect confidentiality.

Possible states in the UI:
- visible
- partially redacted
- hidden with permission message
- hidden because data retention expired

Sensitive panels needing separate enforcement:
- input payload
- output payload
- error payload
- artifacts
- reasoning
- human-task response details

## Pinned data policy

Pinned data is particularly risky because it moves runtime data into the authoring context.

Rules:
- pinning should require runtime data visibility permission
- pinned data should inherit confidentiality markers from the source execution
- pinned data should be clearly labeled as non-production sample state
- users without sensitive runtime access should not see pinned payload content
- pinned data should be removable and auditable

## AI governance rules

### Reasoning visibility

Reasoning traces should be a separate permission from normal output inspection.

Policy suggestion:
- builders can view reasoning in draft and staging when enabled
- operators can view reasoning only if explicitly granted
- monitors usually see summary traces, not full chain-of-thought style internals
- production reasoning may default to summary-only or disabled depending on workspace policy

### Tool call governance

Tool calls often contain secret-adjacent payloads.

Rules:
- tool name may be visible
- tool success or failure may be visible
- full arguments or return payloads may be redacted
- secret-bound arguments should never be shown raw by default

### Memory and knowledge governance

AI memory and retrieval systems need explicit visibility rules.

Separate permissions:
- attach memory source
- inspect memory metadata
- inspect memory contents
- attach knowledge source
- inspect retrieval snippets

## Human task governance

Human tasks mix workflow runtime and user collaboration, so they need careful handling.

Rules:
- assignees can view the task content necessary to act
- observers may see task status without full confidential instructions
- decision comments and payloads may require separate inspection rights
- cancellation and completion actions should be audited

## Environment-specific governance

Environment policy must override ordinary object visibility where necessary.

Examples:
- production payloads may always redact secret-tagged fields
- staging may allow broader payload inspection for builders
- production assets may require admin-level attach or reveal rights
- public triggers may require stronger masking in logs and inspector views

Current FlowHolt models already support parts of this through:
- `production_asset_min_role`
- `run_min_role`
- `publish_min_role`
- `redact_execution_payloads`
- approval requirements

## UI signaling rules

The interface should make confidentiality visible without leaking content.

Required UI patterns:
- masked value chips
- redacted payload banners
- secret badge on bound fields
- restricted reasoning badge
- environment sensitivity badge
- permission-explainer empty states

Useful labels:
- `Secret`
- `Redacted`
- `Metadata only`
- `Restricted by environment`
- `Approval required`

## Audit model

The system should audit all important sensitive-data actions.

Must-log events:
- secret created
- secret rotated
- secret reveal requested
- secret revealed
- secret access policy changed
- runtime payload viewed when confidential
- runtime payload exported
- reasoning trace viewed
- pinned data created
- pinned data removed
- human-task content viewed

## Backend enforcement notes

These checks must not live only in the frontend.

The backend should enforce:
- field-level reveal gates
- runtime artifact redaction
- environment-aware policy evaluation
- export filtering
- audit event creation for sensitive access

Suggested enforcement services:
- access control service
- secret and security service
- execution artifact service
- audit service

## Planning decisions for FlowHolt

- Builders should not automatically get full production payload visibility.
- Operators should be able to operate production without inheriting workflow edit rights.
- Secret use should be much more common than secret reveal.
- AI reasoning should be inspectable only through explicit policy.
- Pinned data must be treated as governed runtime content, not harmless editor state.
- Production environment rules must be able to tighten access beyond normal role defaults.

## Remaining work

The final plan still needs:
- exact role-by-class matrix
- field-level masking schema
- export and API token policy
- retention and deletion rules
- customer-facing compliance notes later if needed
