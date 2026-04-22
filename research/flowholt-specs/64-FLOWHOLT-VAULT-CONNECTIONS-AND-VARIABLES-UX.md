# FlowHolt Vault, Connections, And Variables UX

> **Status:** New redesign system file created 2026-04-17  
> **Purpose:** Redesign Vault from scratch as a first-class product domain rather than a scattered set of asset pages.

---

## 1. Vault thesis

Vault is where FlowHolt wins trust.

It should not feel like a leftover credentials page. It should feel like a secure operating system for:

- credentials
- verified connections
- variables
- external secret references
- MCP server access

The user explicitly asked to strengthen Vault and connections. This file makes Vault clearer, deeper, and more operational than the current UI.

---

## 2. Mental model

### Credential

A secret or auth material:

- API key
- OAuth token set
- username/password
- certificate

### Connection

A verified, scoped, reusable binding between FlowHolt and an external system. A connection may reference one or more credentials plus runtime metadata like:

- account name
- workspace/project scope
- environment
- owner
- last verification
- permission scope

### Variable

A named value usable in workflows or environment configuration. Variables may be:

- plain
- secret
- environment-scoped
- team-scoped
- workspace-scoped

### External secret

A pointer to a managed secret outside FlowHolt, such as a vault provider.

### MCP server

A registered capability endpoint that agents or workflows can access through policy.

---

## 3. Vault information architecture

Vault becomes one domain with five tabs:

1. Credentials
2. Connections
3. Variables
4. External Secrets
5. MCP Servers

Each tab supports:

- inventory view
- detail view
- create flow
- health / usage / audit visibility

---

## 4. Vault shell

The Vault page uses the standard AppShell inventory layout:

- page header
- tab bar
- summary cards
- search / scope / health filters
- table or card list
- detail drawer or full detail page

### Header actions

- New credential
- New connection
- Import variables
- Verify all stale

### Summary cards

- total assets
- healthy connections
- expiring soon
- requires reauth

---

## 5. Credentials tab

### Inventory columns

- name
- provider / app
- type
- scope
- linked connections
- last used
- last rotated
- owner
- status

### Detail page

Sections:

1. Overview
2. Secret policy
3. Usage
4. Audit trail
5. Rotation history

### Required states

- active
- never used
- expiring soon
- revoked
- missing permissions
- archived

The user should never need to guess whether a credential is safe to use.

---

## 6. Connections tab

Connections are the center of Vault.

### Why connections matter

A credential proves identity. A connection proves usable access.

### Inventory columns

- connection name
- provider
- linked account/workspace
- environment
- scope
- health
- last verified
- owner
- used by

### Connection detail

Sections:

1. Overview
2. Authentication
3. Permissions and scopes
4. Usage map
5. Health timeline
6. Audit trail
7. Advanced settings

### Health states

- healthy
- degraded
- reauthorization required
- insufficient permissions
- rate limited
- disabled by policy

### Detail actions

- Verify now
- Reauthorize
- Rotate credential
- Change scope
- Disable
- Archive

This should feel closer to an infrastructure control page than a simple settings form.

---

## 7. Variables tab

Variables must support:

- key/value list
- masking
- secret designation
- scope inheritance
- environment overrides
- usage visibility

### Inventory columns

- key
- scope
- type
- secret
- used by
- updated
- owner

### Detail behavior

- show current effective value state
- show parent inherited value
- show overridden value history
- show usage references

---

## 8. External secrets tab

Purpose:

- show external providers
- mapped secret paths
- access policy
- sync state
- last fetch

This tab matters once enterprise-grade secret management is added and should be designed now to avoid future UI drift.

---

## 9. MCP servers tab

MCP servers are managed assets, not hidden agent config.

Inventory should show:

- name
- server type
- owner
- scopes
- auth mode
- health
- tool count
- last used

Detail should show:

- connection/auth configuration
- exposed tools
- allowed agents/workflows
- audit history

---

## 10. Creation flows

### Credential creation

Flow:

1. choose provider/type
2. choose scope
3. enter secret data
4. set ownership/policy
5. save

### Connection creation

Flow:

1. select provider
2. select or create credential
3. authenticate / authorize
4. choose remote account/workspace
5. verify
6. name and save

### Variable creation

Flow:

1. enter key
2. choose type
3. choose scope
4. choose secret/non-secret
5. set value
6. review usage implications

---

## 11. Studio integration

Vault must be directly usable from Studio.

### Required Studio behaviors

- node config panels can open Vault pickers inline
- missing connection prompts appear in inspector
- new connection flow can complete without leaving Studio
- health warnings appear before run
- pinned workflow assets visible in Assets pane

### Asset picker requirements

- search by provider, connection, credential, or scope
- show health state inline
- show "used by this workflow"
- show "create new"

---

## 12. Governance and security UI

Vault is also a governance surface.

Must support:

- role-aware visibility
- masked values by default
- reveal confirmation
- audit trail per asset
- ownership transfer
- scope restrictions
- approval requirement for sensitive providers

---

## 13. Notification patterns

Vault should generate visible product notifications for:

- token expiring soon
- connection verification failed
- provider permission changed
- variable override conflict
- external secret fetch failure

These notifications should link directly into the affected asset detail page.

---

## 14. Make and n8n takeaways

### From Make

- stronger operational visibility for connections
- first-class webhook/provider administration framing

### From n8n

- stronger inline asset usage during node editing
- fast credential selection inside the authoring flow

### FlowHolt should improve by

- separating credential from connection clearly
- surfacing health and governance more explicitly
- including variables, external secrets, and MCP in one coherent domain

---

## 15. Exit condition

Vault redesign is complete only when:

- connections feel first-class, not secondary to credentials
- users can understand health, scope, and usage at a glance
- Studio can create and attach assets without broken context switching
- variables and external secrets fit the same mental model
