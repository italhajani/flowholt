# FlowHolt Control-Plane Skeleton

This file defines the first draft of the object model above the editor.

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| Make org model | `research/make-help-center-export/pages_markdown/organizations.md` | Org entity, billing boundary |
| Make teams | `research/make-help-center-export/pages_markdown/teams.md` | Team entity, collaboration boundary |
| Make roles | `research/make-help-center-export/pages_markdown/user-roles.md` | 5 org roles |
| Make plans | `research/make-help-center-export/pages_markdown/credits-and-operations.md` | Plan quotas, credits |
| n8n project model | `research/n8n-docs-export/pages_markdown/user-management/` | Projects (workspace equivalent), 3 roles |
| n8n project entity | `n8n-master/packages/cli/src/databases/entities/Project.ts` | n8n project DB entity |

### This file feeds into

| File | What it informs |
|------|----------------|
| `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` | Detailed entity model (supersedes this skeleton) |
| `38-FLOWHOLT-SETTINGS-CATALOG-SPECIFICATION.md` | Settings scope hierarchy |
| `12-FLOWHOLT-PERMISSIONS-MATRIX-DRAFT.md` | Role definitions |

---

## Core principle

The canvas is not the top-level product object. The control plane is.

## Proposed scope hierarchy

### User

Owns:
- profile
- personal preferences
- security state
- API keys
- notification preferences
- personal identity metadata

### Organization

Owns:
- billing relationship
- regional or residency boundary later
- top-level security and governance policies
- organization-wide assets
- organization-wide analytics
- teams

### Team

Owns:
- collaboration boundary for operators and builders
- team-scoped workflows and agents
- team-shared credentials and connections where allowed
- team consumption visibility
- team roles

### Workspace or operational space

Purpose:
- working container for day-to-day automation authoring if FlowHolt keeps a workspace concept

May own:
- local settings
- working drafts
- environment references
- collaboration context

### Environment

Owns:
- runtime and publish boundary
- deployable versions
- environment-scoped assets
- approvals and release policy

### Workflow

Owns:
- graph logic
- versions
- run configuration
- schedule
- template provenance

### AI Agent

Owns:
- model policy
- instructions
- knowledge attachments
- tool inventory
- testing history
- runtime constraints

### Shared asset

Categories:
- credential
- connection
- variable
- webhook
- data store
- data structure
- template
- knowledge asset
- MCP toolbox

## Required role model

The role model should eventually support at least:
- organization admin
- team admin
- builder
- operator
- monitor
- restricted publisher

## Required permission verbs

Every major object should support some combination of:
- view
- create
- edit
- operate
- schedule
- publish
- administer
- share
- delete

## Key design requirements

### Asset scoping

Every shared asset must answer:
- who owns it
- who can view it
- who can use it
- who can edit it
- which scope it belongs to
- whether it can be promoted across environments

### Runtime governance

The control plane must distinguish:
- editing a workflow
- running a workflow
- scheduling a workflow
- publishing a workflow
- observing a workflow

### Agent governance

Agent objects must support:
- inventory ownership
- team sharing
- provider and model policy
- tool policy
- knowledge access rules
- test versus production usage

### Settings separation

The model must keep separate:
- user settings
- organization settings
- team settings
- workspace settings
- environment settings

## Immediate planning consequence

All later FlowHolt page and backend plans should be validated against this control-plane model. If a feature cannot be placed clearly in this hierarchy, the product structure is still immature.
