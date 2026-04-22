# FlowHolt Permissions Matrix Draft

This file turns the governance skeleton into a first role-by-object matrix draft.

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Source | Location | What it informs |
|--------|----------|----------------|
| Make org roles | `research/make-help-center-export/pages_markdown/user-roles.md` | 5 org roles: Owner/Admin/Member/Accountant/Guest |
| Make team roles | `research/make-help-center-export/pages_markdown/teams.md` §Roles | Team-level roles |
| n8n project roles | `research/n8n-docs-export/pages_markdown/user-management/` | 3 project roles: Admin/Editor/Viewer |
| n8n workflow:publish scope | `n8n-master/packages/cli/src/permissions/global.roles.ts` | Separate publish vs edit permission |
| n8n project permissions | `n8n-master/packages/cli/src/permissions/project.roles.ts` | Project-level role caps |
| n8n RBAC middleware | `n8n-master/packages/cli/src/decorators/requires-global-scope.decorator.ts` | How permissions are enforced |

### This file feeds into

| File | What it informs |
|------|----------------|
| `08-FLOWHOLT-PERMISSIONS-GOVERNANCE-SKELETON.md` | Governance decisions |
| `18-FLOWHOLT-ROLE-BY-SURFACE-ENFORCEMENT-MATRIX.md` | Role enforcement per UI surface |
| `21-FLOWHOLT-ROUTE-AND-API-AUTHORIZATION-MAP.md` | Route-level role requirements |
| `28-FLOWHOLT-CAPABILITY-OBJECT-AND-AUTH-HELPERS.md` | Capability object model |
| `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` | Role definitions per entity |

### n8n comparison

| Role concept | n8n | FlowHolt |
|-------------|-----|----------|
| Admin at project | Project Admin | Team Admin + Workspace Admin |
| Editor at project | Project Editor = can edit but NOT publish | Builder role |
| Viewer at project | Project Viewer | Monitor role |
| Publish permission | `workflow:publish` — separate from edit | `can_publish` capability (separate from `can_edit`) |
| Owner at instance | Instance Owner | Org Owner |
| chatUser role | Can chat but not access UI | Needed for Chat Trigger public users |

---

- Org Owner
- Org Admin
- Team Admin
- Builder
- Operator
- Monitor
- Restricted Publisher

## Permission verbs

- view
- create
- edit
- run
- schedule
- publish
- observe
- administer

## Identity and governance objects

| Object | Org Owner | Org Admin | Team Admin | Builder | Operator | Monitor | Restricted Publisher |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Organization profile | view/edit/administer | view/edit | view | view | view | view | view |
| Team definition | view/create/edit/administer | view/create/edit | view/edit/administer | view | view | view | view |
| Members and role assignment | administer | administer | team-only administer | view | view | view | view |
| Billing and plan | view/edit/administer | view/edit | view | no | no | no | no |
| Security policies | administer | edit | view | no | no | no | no |

## Workflow objects

| Object | Org Owner | Org Admin | Team Admin | Builder | Operator | Monitor | Restricted Publisher |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Workflow inventory | view | view | view | view/create | view | view | view |
| Workflow definition | view/edit | view/edit | view/edit | view/create/edit | view | view | view/edit |
| Workflow execution | observe/run | observe/run | observe/run | observe/run | observe/run | observe | observe/run |
| Workflow schedules | administer | administer | administer | edit | run/schedule | view | run |
| Workflow publish | administer | administer | administer | no | no | no | publish |
| Workflow replay | observe/run | observe/run | observe/run | observe/run | observe/run | observe | observe/run |

## AI agent objects

| Object | Org Owner | Org Admin | Team Admin | Builder | Operator | Monitor | Restricted Publisher |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Agent inventory | view | view | view | view/create | view | view | view |
| Agent definition | view/edit | view/edit | view/edit | view/create/edit | view | view | view/edit |
| Agent tools and knowledge | administer | administer | administer | edit | view | view | edit |
| Agent testing | observe/run | observe/run | observe/run | observe/run | observe/run | observe | observe/run |
| Agent production use | administer | administer | administer | no | no | no | publish |
| Agent traces | observe | observe | observe | observe | observe | observe-limited | observe |

## Asset objects

| Object | Org Owner | Org Admin | Team Admin | Builder | Operator | Monitor | Restricted Publisher |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Credentials and connections | administer | administer | team-only administer | use/request edit | use | view-metadata | use |
| Variables | administer | administer | team-only administer | view/edit | view | view | view/edit |
| Webhooks | administer | administer | team-only administer | create/edit | run | observe | run |
| Data stores and structures | administer | administer | team-only administer | create/edit/use | use | observe | use |
| Templates | administer | administer | team-only administer | create/edit | view | view | publish |
| Knowledge assets | administer | administer | team-only administer | create/edit/use | use | view-metadata | use |
| MCP toolboxes | administer | administer | team-only administer | attach/use | use | view-metadata | use |

## Observability objects

| Object | Org Owner | Org Admin | Team Admin | Builder | Operator | Monitor | Restricted Publisher |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Audit log | observe | observe | team-only observe | no | limited observe | observe | limited observe |
| Analytics | observe | observe | team-only observe | limited observe | observe | observe | observe |
| System status | observe | observe | observe | observe | observe | observe | observe |
| Notifications | administer | administer | team-only administer | manage personal | manage personal | manage personal | manage personal |

## Environment objects

| Object | Org Owner | Org Admin | Team Admin | Builder | Operator | Monitor | Restricted Publisher |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Environment config | administer | administer | limited administer | view | view | view | view |
| Environment-scoped assets | administer | administer | team-only administer | limited use | use | view | use |
| Promotion approvals | administer | administer | limited approve | no | no | no | publish-request |

## Draft governance rules

- Builders can create and edit workflows and agents but should not automatically have production publish rights.
- Operators can run, stop, replay, and schedule but should not edit business logic by default.
- Monitors should have rich read access and low write access.
- Restricted Publisher exists to separate release authority from general editing authority.
- Team Admin should govern team-scoped resources without replacing Org-level governance.

## Remaining work

The final permissions matrix still needs:
- confidential data visibility rules
- environment-specific overrides
- UI gating examples
- backend enforcement notes
- credential secret reveal rules
- approval workflow details

---

## n8n RBAC cross-reference (from `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`)

### n8n scope system — `resource:operation` pattern

n8n uses a **scope-based** permission system instead of a role-by-object matrix. Each permission is a `resource:operation` string (e.g., `workflow:create`, `credential:share`, `execution:retry`).

n8n has 64 resources with specific operations defined in `@n8n/permissions/src/constants.ee.ts`. Key resources:

| Resource | Operations |
|---|---|
| `workflow` | create, read, update, delete, list, share, unshare, execute, execute-chat, move, activate, deactivate, publish, unpublish, updateRedactionSetting |
| `credential` | create, read, update, delete, list, share, unshare, shareGlobally, move |
| `project` | CRUD + list |
| `folder` | CRUD + list + move |
| `execution` | delete, read, retry, list, get, reveal |
| `user` | CRUD + list + resetPassword, changeRole, enforceMfa, generateInviteLink |
| `tag` / `variable` | CRUD + list |
| `chatHub` | manage, message |
| `mcp` | manage, oauth |
| `instanceAi` | message, manage, gateway |
| `insights` | list, read |
| `role` | manage |

### Scope resolution levels

n8n resolves scopes at three levels:
1. **Global** — from the user's global role (owner, admin, member)
2. **Project** — from the user's project role (personalOwner, admin, editor, viewer, chatUser)
3. **Resource** — from resource-specific sharing roles

The final permission set is the **union** of all three levels, with masking for sharing restrictions.

### FlowHolt adoption recommendation

FlowHolt should migrate from the current verb-based matrix to n8n's `resource:operation` scope pattern:

| FlowHolt verb | n8n scope equivalent |
|---|---|
| `view` | `resource:read` + `resource:list` |
| `create` | `resource:create` |
| `edit` | `resource:update` |
| `run` | `workflow:execute` |
| `schedule` | `workflow:activate` |
| `publish` | `workflow:publish` |
| `observe` | `execution:read` + `execution:list` |
| `administer` | `resource:*` (wildcard) |

### Role mapping (FlowHolt → n8n equivalent)

| FlowHolt role | n8n equivalent | Scope level |
|---|---|---|
| Org Owner | `global:owner` | Global |
| Org Admin | `global:admin` | Global |
| Team Admin | `project:admin` | Project |
| Builder | `project:editor` | Project |
| Operator | Custom role (execute + read, no update) | Project |
| Monitor | `project:viewer` | Project |
| Restricted Publisher | Custom role (publish only) | Project |

### Key addition: n8n custom roles

n8n supports **custom roles** (enterprise feature) via the `Role` entity with dynamic `Scope` assignments. This means roles are not hard-coded — admins can create custom roles with specific scope combinations.

FlowHolt should plan:
1. **Phase 1**: Built-in roles (Owner, Admin, Editor, Viewer) matching n8n defaults
2. **Phase 2**: Add Operator and Monitor as FlowHolt-specific roles
3. **Phase 3**: Custom roles with admin-configurable scope assignments (enterprise)

### n8n project roles with permissions

| n8n project role | Key scopes |
|---|---|
| `project:personalOwner` | All scopes (owner of personal space) |
| `project:admin` | All project scopes including share, manage |
| `project:editor` | CRUD workflows/credentials, execute, but no share/manage |
| `project:viewer` | Read-only access to workflows, credentials, executions |
| `project:chatUser` | `chatHub:message` only — can interact with chat agents |

### Extended scope reference (from n8n custom roles docs, v1.122.0+)

The full n8n custom roles scope list with exact strings (Enterprise feature, from `user-management__rbac__custom-roles.md`):

| Resource | Key scopes |
|----------|-----------|
| `workflow` | `workflow:create`, `workflow:read`, `workflow:update`, `workflow:publish`, `workflow:unpublish`, `workflow:delete`, `workflow:list`, `workflow:execute-chat`, `workflow:move`, `workflow:share`, `workflow:updateRedactionSetting` |
| `execution` | `execution:reveal` (reveal redacted execution data) |
| `credential` | `credential:create`, `credential:read`, `credential:update`, `credential:delete`, `credential:list`, `credential:move`, `credential:share` |
| `project` | `project:list`, `project:read`, `project:update`, `project:delete` |
| `folder` | `folder:create`, `folder:read`, `folder:update`, `folder:delete`, `folder:list`, `folder:move` |
| `dataTable` | `dataTable:create`, `dataTable:read`, `dataTable:update`, `dataTable:delete`, `dataTable:listProject`, `dataTable:readRow`, `dataTable:writeRow` |
| `projectVariable` | `projectVariable:list`, `projectVariable:read`, `projectVariable:create`, `projectVariable:update`, `projectVariable:delete` |
| `secretsVaults` | `secretsVaults:view`, `secretsVaults:create`, `secretsVaults:edit`, `secretsVaults:delete`, `secretsVaults:sync` (reload vault) |
| `secrets` | `secrets:list` (use secrets in credentials, not reveal raw values) |
| `sourceControl` | `sourceControl:push` |

Key scope design notes:
- `workflow:publish` and `workflow:unpublish` are separate (can grant publish-only without unpublish)
- `workflow:execute-chat` is separate from `workflow:execute` (chat access can be isolated)
- `workflow:updateRedactionSetting` — controls who can change payload redaction policy per workflow
- `execution:reveal` — dedicated scope for revealing redacted execution data (separate from read)
- `secretsVaults:sync` — reloads secrets from vault; sensitive operation that should be audited
- `secrets:list` — grants ability to use secrets in credential expressions (does not grant read of raw values)

### FlowHolt-specific additions beyond n8n

n8n lacks these concepts that FlowHolt needs:
1. **Environment scoping** — n8n has no dev/staging/prod separation. FlowHolt's `workflow:publish` should be environment-aware.
2. **Approval workflows** — n8n's publish is direct. FlowHolt should add `deployment:approve` scope.
3. **Workspace-level roles** — n8n has global + project. FlowHolt has global + org + team + workspace.
4. **Confidential data reveal** — n8n has `execution:reveal` for redacted data. FlowHolt should expand this to credential secrets too.
5. **Vault reveal scope** — n8n's `secrets:list` allows using secrets but not revealing them. FlowHolt should have a separate `vault:reveal` scope mirroring `execution:reveal`.
