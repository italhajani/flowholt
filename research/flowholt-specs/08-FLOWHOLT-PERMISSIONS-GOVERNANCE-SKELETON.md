# FlowHolt Permissions And Governance Skeleton

This file is the first draft of the permission system and governance plan.

> **Superseded.** The authoritative role and permission models are `12-FLOWHOLT-ROLE-AND-PERMISSION-MATRIX.md` and `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md`. This file is kept as a historical planning artifact.

## Cross-Reference Map

### This file is grounded in (raw sources)

- `research/make-help-center-export/pages_markdown/organizations.md` — Make organization role model: admin, member, accountant, app developer
- `research/make-help-center-export/pages_markdown/user-roles-in-organizations.md` — Make per-role capability descriptions and team membership rules
- `research/make-help-center-export/pages_markdown/teams.md` — Make team-level membership and shared asset scoping
- `research/n8n-docs-export/pages_markdown/user-management__rbac.md` — n8n RBAC overview: owner, admin, member scopes and credential/workflow sharing model

### Key n8n source code files

- `n8n-master/packages/cli/src/permissions/` — n8n RBAC enforcement layer: scope definitions, permission checks per resource type
- `n8n-master/packages/cli/src/permissions/hasScope.ts` — core scope-based capability check function used per route handler
- `n8n-master/packages/cli/src/databases/entities/User.ts` — n8n user entity with global role field

### n8n/Make comparison

- Make defines org-level roles (admin, member, accountant, app developer) with team membership; there are no environment-level permission gates and no publish/approve separation
- n8n uses three global instance roles (owner, admin, member) with per-resource sharing; no team hierarchy, no environment-sensitive capabilities, no approval workflow
- FlowHolt adds team-level roles (team admin, builder, operator, monitor, restricted publisher), environment-sensitive capabilities (publish to staging/production, approve promotion), and the publish/approve verb separation absent from both references

### This file feeds into

- `12-FLOWHOLT-ROLE-AND-PERMISSION-MATRIX.md` — full role-to-object permission matrix (supersedes this file)
- `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` — surface-level enforcement rules (supersedes this file)

## Planning principle

Permissions should not be modeled as a flat owner or member split. The platform must distinguish building from operating, observing, administering, and publishing.

## Proposed role families

### Organization-level roles
- owner
- admin
- member
- accountant or billing viewer
- app developer or integration installer
- guest later if needed

### Team-level roles
- team admin
- builder or member
- operator
- monitor
- restricted publisher
- guest or credential-request responder later if needed

### Environment-sensitive capabilities
- publish to staging
- publish to production
- approve promotion
- manage environment assets

## Required permission verbs

The final matrix should cover:
- view
- create
- edit
- configure
- operate
- run
- schedule
- replay
- observe
- publish
- approve
- administer
- share
- delete

## Object families the matrix must cover

### Identity and governance objects
- organization
- team
- member
- role assignment
- billing
- security policy

### Workflow objects
- workflow
- workflow version
- workflow schedule
- workflow execution
- workflow template

### AI objects
- agent
- agent tool
- agent knowledge
- agent test conversation
- agent runtime trace

### Asset objects
- credential
- connection
- variable
- webhook
- data store
- data structure
- knowledge asset
- MCP toolbox

### Operational objects
- environment
- audit log
- analytics
- notifications
- system status

## High-level governance rules

### Separation of concerns

The permission model must separate:
- authoring from operating
- operating from publishing
- publishing from administering
- observing from editing

### Asset governance

The model must answer:
- who can discover an asset
- who can use an asset in a workflow
- who can edit the asset definition
- who can reveal secret values
- who can move or promote the asset across environments

### Agent governance

The model must answer:
- who can create an agent
- who can attach tools
- who can attach knowledge
- who can run tests
- who can expose the agent to production workflows
- who can inspect runtime reasoning and tool traces

### Execution governance

The model must answer:
- who can run a workflow once
- who can stop a running workflow
- who can change schedules
- who can replay old runs
- who can resolve incomplete executions
- who can inspect execution payloads for confidential data

## Required final deliverable shape

The final permissions plan should include:
- a role matrix by object and verb
- UI gating rules
- backend enforcement notes
- audit requirements
- environment-specific overrides

## Current FlowHolt direction

FlowHolt should at minimum evolve toward:
- team-aware scopes
- separate publish permissions
- separate operator permissions
- separate monitoring permissions
- stronger governance around shared assets and agents
