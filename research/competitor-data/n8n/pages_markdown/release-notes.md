# Release notes | n8n Docs

Source: https://docs.n8n.io/release-notes
Lastmod: 2026-04-14
Description: Release notes detailing new features and bug fixes for n8n.
changelog
release
release notes

# Release notes[#](#release-notes)

New features and bug fixes for n8n.

You can also view the [Releases](https://github.com/n8n-io/n8n/releases) in the GitHub repository.

Stable and Beta versions

n8n releases a new minor version most weeks. The `stable` version is for production use. `beta` is the most recent release. The `beta` version may be unstable. To report issues, use the [forum](https://community.n8n.io/c/questions/12).

Current `stable`: 2.15.0
Current `beta`: 2.16.0

## How to update n8n[#](#how-to-update-n8n)

The steps to update your n8n depend on which n8n platform you use. Refer to the documentation for your n8n:

* [Cloud](../manage-cloud/update-cloud-version/)
* Self-hosted options:
  + [npm](../hosting/installation/npm/)
  + [Docker](../hosting/installation/docker/)

## Semantic versioning in n8n[#](#semantic-versioning-in-n8n)

n8n uses [semantic versioning](https://semver.org/). All version numbers are in the format `MAJOR.MINOR.PATCH`. Version numbers increment as follows:

* MAJOR version when making incompatible changes which can require user action.
* MINOR version when adding functionality in a backward-compatible manner.
* PATCH version when making backward-compatible bug fixes.

Older versions

You can find the release notes for older versions of n8n: [1.x](1-x/) and [0.x](0-x/)

## n8n@2.16.0[#](#n8n2160)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.15.0...n8n@2.16.0) for this version.
**Release date:** 2026-04-07

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.15.0[#](#n8n2150)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.14.0...n8n@2.15.0) for this version.
**Release date:** 2026-03-30

This release contains bug fixes.

### Contributors[#](#contributors)

[manusjs](https://github.com/manusjs)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.14.2[#](#n8n2142)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.14.1...n8n@2.14.2) for this version.
**Release date:** 2026-03-26

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.14.1[#](#n8n2141)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.14.0...n8n@2.14.1) for this version.
**Release date:** 2026-03-25

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.14.0[#](#n8n2140)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.13.2...n8n@2.14.0) for this version.
**Release date:** 2026-03-24

This release contains bug fixes.

### Contributors[#](#contributors_1)

[pkaya89](https://github.com/pkaya89)
[kesku](https://github.com/kesku)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.13.4[#](#n8n2134)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.13.3...n8n@2.13.4) for this version.
**Release date:** 2026-03-26

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.13.3[#](#n8n2133)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.13.2...n8n@2.13.3) for this version.
**Release date:** 2026-03-25

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.13.2[#](#n8n2132)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.13.1...n8n@2.13.2) for this version.
**Release date:** 2026-03-20

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.13.1[#](#n8n2131)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.13.0...n8n@2.13.1) for this version.
**Release date:** 2026-03-18

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.13.0[#](#n8n2130)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.12.0...n8n@2.13.0) for this version.
**Release date:** 2026-03-16

This release contains bug fixes and features.

### Visual diff comes to version history[#](#visual-diff-comes-to-version-history)

Open version history, click **Compare changes**, pick any two versions, and the canvas renders both side by side with changed nodes highlighted. A change count badge on each version helps you spot significant edits at a glance.

Visual diff is available on Cloud Pro and above.

### Project-scoped external secrets: full team access (Enterprise)[#](#project-scoped-external-secrets-full-team-access-enterprise)

What's new:

* Project admins manage their own vault connections from project settings.
* Project editors can use project-scoped secrets in credentials once the instance admin enables access.
* [Custom roles](../user-management/rbac/custom-roles/) now include five secrets scopes: list, read, create, update, and delete.
* Instance admins/owners no longer need to be project members for secrets to resolve.

**For instance admins:** go to **Settings > External Secrets** and enable the **System Roles** toggle, or use custom roles for more granular control.

**For project admins:** go to **Project Settings > External Secrets** to create and manage project-level connections. Instance-level connections shared with you appear as read-only.

Refer to [External secrets](../external-secrets/) for more information. Project-scoped external secrets are available on n8n Enterprise.

### Folder-based filtering in the push and pull dialog (Enterprise)[#](#folder-based-filtering-in-the-push-and-pull-dialog-enterprise)

The push and pull dialogs now include a **Folder** filter alongside Status and Owner. Selecting a folder scopes the list to workflows in that folder and its subfolders, shown as a hierarchical tree with folder-level checkboxes. Text search also matches folder names.

Folder-based filtering is available on n8n Enterprise (requires [Environments](../source-control-environments/setup/) configured).

### Contributors[#](#contributors_2)

[tbigby-kristin](https://github.com/tbigby-kristin)
[ajuijas](https://github.com/ajuijas)
[ByteEVM](https://github.com/ByteEVM)
[mjain](https://github.com/mjain)
[bram2w](https://github.com/bram2w)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.12.2[#](#n8n2122)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.12.1...n8n@2.12.2) for this version.
**Release date:** 2026-03-13

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.12.1[#](#n8n2121)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.12.0...n8n@2.12.1) for this version.
**Release date:** 2026-03-11

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.12.0[#](#n8n2120)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.11.0...n8n@2.12.0) for this version.
**Release date:** 2026-03-09

This release contains bug fixes and features.

### 1Password is now available as an external secrets provider (Enterprise)[#](#1password-is-now-available-as-an-external-secrets-provider-enterprise)

n8n now supports 1Password Connect Server as an [external secrets](../external-secrets/) provider, alongside HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, and GCP Secret Manager.

Secrets are fetched at runtime and never stored in n8n: 1Password stays the single source of truth. Multi-field items are available as structured sub-paths: `$secrets.<vault>.<item>.<field>`.

#### How to connect[#](#how-to-connect)

1. Deploy a 1Password Connect Server and create an access token scoped to the vaults n8n should read.
2. In n8n, go to **Settings > External Secrets**, select **1Password**, and enter your Connect Server URL and token.

Requires self-hosted 1Password Connect Server with read-only access. 1Password as an external secrets provider is available on n8n Enterprise.

### Contributors[#](#contributors_3)

`github-actions[bot]`
[amenk](https://github.com/amenk)
[bpk9](https://github.com/bpk9)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.11.4[#](#n8n2114)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.11.3...n8n@2.11.4) for this version.
**Release date:** 2026-03-13

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.11.3[#](#n8n2113)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.11.2...n8n@2.11.3) for this version.
**Release date:** 2026-03-13

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.11.2[#](#n8n2112)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.11.1...n8n@2.11.2) for this version.
**Release date:** 2026-03-06

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.11.1[#](#n8n2111)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.11.0...n8n@2.11.1) for this version.
**Release date:** 2026-03-04

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.11.0[#](#n8n2110)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.10.0...n8n@2.11.0) for this version.
**Release date:** 2026-03-02

This release contains bug fixes and features.

### Easier credential setup on Cloud[#](#easier-credential-setup-on-cloud)

Setting up credentials on n8n Cloud is now much simpler. For supported services, just click the **Connect** button, authenticate with the service, and you're ready to go. Skip the manual setup for Slack, Firecrawl, HubSpot, GitHub, Google Calendar, PagerDuty, Apify, and more.

[![Managed OAuth credential setup for Slack on n8n Cloud](../_images/release-notes/quick_connect_slack.png)](https://docs.n8n.io/_images/release-notes/quick_connect_slack.png)

Setting up Slack credentials with managed OAuth.

#### Things to keep in mind[#](#things-to-keep-in-mind)

* If you prefer to use your own OAuth configuration, you can still switch to manual setup from the auth mode dropdown at any time.
* This feature is only available on n8n Cloud, where n8n manages the OAuth apps on your behalf.

### Custom roles: Assignments tab (Enterprise)[#](#custom-roles-assignments-tab-enterprise)

Instance admins now have a dedicated **Assignments** tab on each [custom role](../user-management/rbac/custom-roles/) showing every user assigned to that role, which project they're in, and a direct link to manage them — no more navigating project by project.

Custom roles are available on n8n Enterprise.

### Project-scoped external secrets: instance admin setup (Enterprise)[#](#project-scoped-external-secrets-instance-admin-setup-enterprise)

Instance admins can now create vault connections scoped to a specific project. Secrets from that connection appear only within that project's credentials, not across the instance. Instance-level connections are unaffected.

Refer to [External secrets](../external-secrets/) for more information. Project-scoped external secrets are available on n8n Enterprise.

### Workflow execute as a separate permission scope (Enterprise)[#](#workflow-execute-as-a-separate-permission-scope-enterprise)

`workflow:execute` is now a distinct scope in [custom project roles](../user-management/rbac/custom-roles/), separate from editing and publishing. Users can be granted run access without being able to modify the workflow, which is a common compliance requirement for sensitive workflows.

This scope is available on n8n Enterprise.

### Contributors[#](#contributors_4)

[ByteEVM](https://github.com/ByteEVM)
[onyxraven](https://github.com/onyxraven)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.10.4[#](#n8n2104)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.10.3...n8n@2.10.4) for this version.
**Release date:** 2026-03-06

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.10.3[#](#n8n2103)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.10.2...n8n@2.10.3) for this version.
**Release date:** 2026-03-04

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.10.2[#](#n8n2102)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.10.1...n8n@2.10.2) for this version.
**Release date:** 2026-02-27

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.10.1[#](#n8n2101)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.10.0...n8n@2.10.1) for this version.
**Release date:** 2026-02-25

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.10.0[#](#n8n2100)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.9.0...n8n@2.10.0) for this version.
**Release date:** 2026-02-23

This release contains bug fixes and features.

### Multiple connections per external secrets provider[#](#multiple-connections-per-external-secrets-provider)

You can now set up more than one connection for a single [external secrets](../external-secrets/) provider. The updated UI makes it easier to configure and manage multiple connections under the same provider type.

### Performance improvements for large workflow and credential volumes[#](#performance-improvements-for-large-workflow-and-credential-volumes)

Improved the reliability of the workflows and credentials listing pages for large-scale instances, reducing loading times by 30% to 80%.

### Contributors[#](#contributors_5)

[peteawood](https://github.com/peteawood)
[horiyee](https://github.com/horiyee)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.9.4[#](#n8n294)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.9.3...n8n@2.9.4) for this version.
**Release date:** 2026-02-25

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.9.4-exp.0[#](#n8n294-exp0)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.9.4...n8n@2.9.4-exp.0) for this version.
**Release date:** 2026-02-27

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.9.3[#](#n8n293)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.9.2...n8n@2.9.3) for this version.
**Release date:** 2026-02-25

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.9.3-exp.0[#](#n8n293-exp0)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.9.3...n8n@2.9.3-exp.0) for this version.
**Release date:** 2026-02-25

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.9.2[#](#n8n292)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.9.1...n8n@2.9.2) for this version.
**Release date:** 2026-02-23

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.9.1[#](#n8n291)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.9.0...n8n@2.9.1) for this version.
**Release date:** 2026-02-18

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.9.0[#](#n8n290)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.8.0...n8n@2.9.0) for this version.
**Release date:** 2026-02-16

This release contains bug fixes.

### Contributors[#](#contributors_6)

[ByteEVM](https://github.com/ByteEVM)
[LudwigGerdes](https://github.com/LudwigGerdes)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.8.4[#](#n8n284)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.8.3...n8n@2.8.4) for this version.
**Release date:** 2026-02-23

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.8.3[#](#n8n283)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.8.2...n8n@2.8.3) for this version.
**Release date:** 2026-02-13

This release contains a bug fix and features.

### Personal space policies (Enterprise)[#](#personal-space-policies-enterprise)

A new **Security & policies** settings section provides a central place for enforcing security requirements on your instance. In addition to the existing two-factor authentication enforcement, admins can now control what users can do in their personal spaces.

Available policies include:

* **Sharing**: control whether users can share workflows and credentials from their personal space.
* **Workflow publishing**: control whether users can publish workflows from their personal space.

This release builds on the recent updates to the permissions model, including [custom project roles](../user-management/rbac/custom-roles/), to better support policy-driven governance.

Personal space policies are available on n8n Enterprise.

[![Security and policies settings](../_images/release-notes/personal_space_policies.png)](https://docs.n8n.io/_images/release-notes/personal_space_policies.png)

The new Security & policies settings section.

### Custom roles: improved discoverability and permission visibility (Enterprise)[#](#custom-roles-improved-discoverability-and-permission-visibility-enterprise)

The project role selector now separates built-in system roles and custom roles into distinct sections, making it easier to find and choose the right role. Hovering over a role shows a summary of its configured permissions, with an option to view the full permission details.

[![Custom roles selector](../_images/release-notes/custom_roles_selector.png)](https://docs.n8n.io/_images/release-notes/custom_roles_selector.png)

System roles and custom roles are now displayed in separate sections.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.8.2[#](#n8n282)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.8.1...n8n@2.8.2) for this version.
**Release date:** 2026-02-12

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.8.1[#](#n8n281)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.8.0...n8n@2.8.1) for this version.
**Release date:** 2026-02-11

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.7.5[#](#n8n275)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.7.4...n8n@2.7.5) for this version.
**Release date:** 2026-02-13

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.7.4[#](#n8n274)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.7.3...n8n@2.7.4) for this version.
**Release date:** 2026-02-11

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.7.3[#](#n8n273)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.7.2...n8n@2.7.3) for this version.
**Release date:** 2026-02-09

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.6.4[#](#n8n264)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.6.3...n8n@2.6.4) for this version.
**Release date:** 2026-02-06

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.8.0[#](#n8n280)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.7.0...n8n@2.8.0) for this version.
**Release date:** 2026-02-09

This release contains bug fixes and features.

### Stronger external secrets validation (Enterprise)[#](#stronger-external-secrets-validation-enterprise)

n8n now verifies that the current user has access to the referenced vaults before allowing a credential that uses **$secrets...** expressions to be saved. If access is missing, the save operation fails. This prevents secret values from being exposed through guessed secret paths.

### Improved API auditability (Enterprise)[#](#improved-api-auditability-enterprise)

API endpoints have been expanded to provide clearer visibility into project membership and credentials:

* `GET /projects/{projectId}/users` returns all members of a project including their assigned role.
* `GET /credentials` returns a paginated list of all credentials across the instance, including the project they belong to.

This makes it easier to audit who has access to which projects and credentials without manually reviewing each one in the UI.

### More granular workflow permissions[#](#more-granular-workflow-permissions)

Workflow publishing permissions for [custom roles](../user-management/rbac/custom-roles/) have been split into two separate scopes: **workflow:publish** and **workflow:unpublish**. This enables more precise access control in governance scenarios where unpublishing needs to be managed independently.

### Performance and stability improvements[#](#performance-and-stability-improvements)

* Improved performance for instances with very large user counts, reducing slowdowns caused by user-related operations.
* Fixed a high-memory issue that could cause crashes during Source Control push flows in large deployments with many workflows and credentials.

### Minor fixes[#](#minor-fixes)

* Canvas: improved node repositioning on insertion to reduce overlaps and spacing issues.
* Log streaming: fixed proxy configuration handling for webhook destinations so requests work reliably when a proxy is configured.

### Deprecated nodes[#](#deprecated-nodes)

#### Motorhead node[#](#motorhead-node)

The [Motorhead](../integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorymotorhead/) memory node is now deprecated because the Motorhead project is no longer maintained. The node is hidden from the nodes panel for new selections, but existing workflows using this node will continue to work.

### Contributors[#](#contributors_7)

[AmitAnveri](https://github.com/AmitAnveri)
[derandreas-dt](https://github.com/derandreas-dt)
[ongdisheng](https://github.com/ongdisheng)
[vCaisim](https://github.com/vCaisim)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.7.2[#](#n8n272)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.7.1...n8n@2.7.2) for this version.
**Release date:** 2026-02-04

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.7.1[#](#n8n271)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.7.0...n8n@2.7.1) for this version.
**Release date:** 2026-02-03

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.7.0[#](#n8n270)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.6.0...n8n@2.7.0) for this version.
**Release date:** 2026-02-02

This release contains bug fixes.

### Contributors[#](#contributors_8)

[LostInBrittany](https://github.com/LostInBrittany)
[adriencohen](https://github.com/adriencohen)
[ibex088](https://github.com/ibex088)
[rutgere-indeed](https://github.com/rutgere-indeed)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.7-exp.0[#](#n8n247-exp0)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.7...n8n@2.4.7-exp.0) for this version.
**Release date:** 2026-01-29

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.6.3[#](#n8n263)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.6.2...n8n@2.6.3) for this version.
**Release date:** 2026-02-02

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.8[#](#n8n248)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.7...n8n@2.4.8) for this version.
**Release date:** 2026-01-29

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.6.2[#](#n8n262)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.6.1...n8n@2.6.2) for this version.
**Release date:** 2026-01-28

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.7[#](#n8n247)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.6...n8n@2.4.7) for this version.
**Release date:** 2026-01-28

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.5.2[#](#n8n252)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.5.1...n8n@2.5.2) for this version.
**Release date:** 2026-01-23

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.6[#](#n8n246)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.5...n8n@2.4.6) for this version.
**Release date:** 2026-01-23

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.5[#](#n8n245)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.4...n8n@2.4.5) for this version.
**Release date:** 2026-01-22

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.6.0[#](#n8n260)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.5.0...n8n@2.6.0) for this version.
**Release date:** 2026-01-26

This release contains bug fixes.

### Human-in-the-loop for AI tool calls[#](#human-in-the-loop-for-ai-tool-calls)

You can now require explicit human approval before an AI Agent executes specific tools.

Human-in-the-loop (HITL) for AI tool calls enforces review directly at the tool level. A gated tool cannot execute unless a human explicitly approves the action, giving you deterministic control over high-impact operations like deleting records, writing to production systems, or sending high-impact emails. This removes the uncertainty of prompt-based safeguards and insulates you from probabilistic agent behavior.

Because the review step is implemented using standard n8n integrations, approvals are not limited to a single user or interface. Decisions can be routed across people and systems, enforcing approval from the right person using the channels they already work in.

#### What you can do[#](#what-you-can-do)

* Require explicit human approval for any tool the agent can call, including the MCP Client tool or sub-workflows exposed as tools
* Apply approval selectively, so some tools execute autonomously while others require review
* Route approvals across users and channels (for example, send a Slack-initiated action for approval by another user via email)
* Add safety checks for high-impact or potentially destructive operations without complex workflow patterns or brittle prompt logic.

#### How to use it[#](#how-to-use-it)

Start with a workflow where an AI Agent is connected to one or more tools.

1. On the connection from the AI Agent to the tool you want to gate, click the **+** icon and choose **Add human review step** (hovering over the icon shows the tooltip).
2. The **Tools panel** opens with nodes you can use to handle the review step. Select the one you want to use.
3. Configure the approval step in the added node’s parameters. Depending on the integration, you can define the approver, the message they receive, the available actions (for example, approve or deny), and the associated buttons.

[](/_video/release-notes/HITLToolCalls.webm)

Get precise control over where human judgment is required, without limiting what your agent can do. Learn more [here](../advanced-ai/human-in-the-loop-tools/).

### Contributors[#](#contributors_9)

[ibex088](https://github.com/ibex088)
[johnlinp](https://github.com/johnlinp)
[loganaden](https://github.com/loganaden)
[Jameswlepage](https://github.com/Jameswlepage)
[cesars-gh](https://github.com/cesars-gh)
[antman1p](https://github.com/antman1p)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.5.0[#](#n8n250)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.0...n8n@2.5.0) for this version.
**Release date:** 2026-01-20

This release contains bug fixes.

### Chat node: human-in-the-loop actions[#](#chat-node-human-in-the-loop-actions)

The **Chat** node now includes two new Actions for human-in-the-loop interactions in agentic workflows:

* **Send a message**: send a message to the user and continue the workflow
* **Send a message and wait for response**: send a message and pause execution until the user replies. Users can respond with free text in the Chat or by clicking inline approval buttons, as defined in the node’s configuration.

These Actions can be used as deterministic workflow steps or as tools for an **AI Agent**, enabling multi-turn human interaction within a single execution when using the **Chat Trigger**.

When used as an agent tool, the agent can ask for clarification before proceeding, helping it better interpret user intent and follow instructions. Agents can also send updates during long-running workflows using these Actions.

#### How to[#](#how-to)

1. Trigger your workflow with the **Chat Trigger** node. In the node parameters, add the *Response Mode* option and set it to *Using Response Nodes*.
2. Add a **Chat** node later in the workflow, or add it as a tool for an **AI Agent**. Select one of the following operations: *Send a message* or *Send a message and wait for response*.

#### Keep in mind[#](#keep-in-mind)

* If you want an AI Agent to choose between sending a message or waiting for input, add two **Chat** tool nodes, one for each action.
* For AI Agents triggered by the **Chat Trigger** node, adding **Send a message and wait for response** is recommended so the agent can request clarification when needed.

Learn more in the [Chat node documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.chat/#operation).

[](/_video/release-notes/ChatHITL.webm)

### Contributors[#](#contributors_10)

[AbdulTawabJuly](https://github.com/AbdulTawabJuly)
[ByteEVM](https://github.com/ByteEVM)
[sudarshan12s](https://github.com/sudarshan12s)
[KaanAydinli](https://github.com/KaanAydinli)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.3[#](#n8n243)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.2...n8n@2.4.3) for this version.
**Release date:** 2026-01-15

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.3.6[#](#n8n236)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.3.5...n8n@2.3.6) for this version.
**Release date:** 2026-01-16

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.4[#](#n8n244)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.3...n8n@2.4.4) for this version.
**Release date:** 2026-01-16

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.3.5[#](#n8n235)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.3.4...n8n@2.3.5) for this version.
**Release date:** 2026-01-14

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.1[#](#n8n241)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.4.0...n8n@2.4.1) for this version.
**Release date:** 2026-01-13

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.3.2[#](#n8n232)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.3.1...n8n@2.3.2) for this version.
**Release date:** 2026-01-09

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.4.0[#](#n8n240)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.3.0...n8n@2.4.0) for this version.
**Release date:** 2026-01-12

This release contains bug fixes.

### TLS support for Syslog log streaming[#](#tls-support-for-syslog-log-streaming)

The Syslog log streaming destination now supports TLS over TCP for encrypted connections. This enables secure log streaming to enterprise SIEM and observability platforms that require encrypted transport. With this release, log streaming is now compatible with a broader range of enterprise SIEM platforms.

### Update credentials via API[#](#update-credentials-via-api)

n8n's public API now supports updating existing credentials by ID via a new *PATCH /credentials/:id* endpoint. Previously, credentials could only be created through the API so any changes required deleting and recreating the credential.

When updating, you can either replace all credential data at once (useful for bulk updates) or set *isPartialData: true* to merge changes with existing data. Ideal for automated secret rotation or fixing individual values without losing your configuration.

### Contributors[#](#contributors_11)

[JonLaliberte](https://github.com/JonLaliberte)
[davidpanic](https://github.com/davidpanic)
[TomTom101](https://github.com/TomTom101)
[garritfra](https://github.com/garritfra)
[maximepvrt](https://github.com/maximepvrt)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.3.3[#](#n8n233)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.3.2...n8n@2.3.3) for this version.
**Release date:** 2026-01-13

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.3.4[#](#n8n234)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.3.3...n8n@2.3.4) for this version.
**Release date:** 2026-01-13

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.3.1[#](#n8n231)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.3.0...n8n@2.3.1) for this version.
**Release date:** 2026-01-07

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.2.5[#](#n8n225)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.2.4...n8n@2.2.5) for this version.
**Release date:** 2026-01-08

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.2.4[#](#n8n224)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.2.3...n8n@2.2.4) for this version.
**Release date:** 2026-01-06

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.3.0[#](#n8n230)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.2.0...n8n@2.3.0) for this version.
**Release date:** 2026-01-05

This release contains bug fixes.

### Contributors[#](#contributors_12)

[Shashwat-06](https://github.com/Shashwat-06)
[ByteEVM](https://github.com/ByteEVM)
[mithredate](https://github.com/mithredate)
[belyas](https://github.com/belyas)
[saurabhssonkar](https://github.com/saurabhssonkar)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.2.3[#](#n8n223)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.2.2...n8n@2.2.3) for this version.
**Release date:** 2026-01-05

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.2.2[#](#n8n222)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.2.1...n8n@2.2.2) for this version.
**Release date:** 2025-12-30

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.1.5[#](#n8n215)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.1.4...n8n@2.1.5) for this version.
**Release date:** 2025-12-30

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.1.4[#](#n8n214)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.1.3...n8n@2.1.4) for this version.
**Release date:** 2025-12-23

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.1.3[#](#n8n213)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.1.2...n8n@2.1.3) for this version.
**Release date:** 2025-12-23

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.2.1[#](#n8n221)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.2.0...n8n@2.2.1) for this version.
**Release date:** 2025-12-23

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.2.0[#](#n8n220)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.1.0...n8n@2.2.0) for this version.

**Release date:** 2025-12-22

This release contains bug fixes.

### More granular workflow permissions within Custom Project Roles (Enterprise)[#](#more-granular-workflow-permissions-within-custom-project-roles-enterprise)

Custom Project Roles allow you to define fine-grained permissions at the project level. With this release, workflow permissions have been further refined by separating workflow editing from workflow publishing.

This change makes it easier to align access controls with internal processes where building workflows and publishing them are handled by different users or teams.

[![Custom Project Roles](../_images/release-notes/WorkflowEditor.png)](https://docs.n8n.io/_images/release-notes/WorkflowEditor.png)

Custom Project Roles

### Log streaming: More audit events for improved observability[#](#log-streaming-more-audit-events-for-improved-observability)

Log streaming now includes additional audit events to improve visibility into operational and security-relevant changes.

This update adds events for manual workflow cancellations and workflow activation/deactivation (publish/unpublish), variable lifecycle events (create/update/delete), and user management actions (including enabling/disabling 2FA).

Workflow settings updates are also logged with the specific parameters that changed (for example, selecting a new error workflow), instead of a generic “updated” event.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.1.2[#](#n8n212)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.1.1...n8n@2.1.2) for this version.
**Release date:** 2025-12-22

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.1.1[#](#n8n211)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.1.0...n8n@2.1.1) for this version.
**Release date:** 2025-12-17

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.3[#](#n8n203)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.2...n8n@2.0.3) for this version.
**Release date:** 2025-12-17

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.1.0[#](#n8n210)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.0...n8n@2.1.0) for this version.
**Release date:** 2025-12-16

This release contains bug fixes and features.

### **Time Saved node**[#](#time-saved-node)

Previously, teams could only track a single fixed time saved value for each workflow regardless of which path an execution takes. The new Time Saved node enables more precise time savings calculations where different execution paths will save different amounts of time.

With this release you can now:

* **Choose fixed value or dynamic time tracking**: Use fixed time saved for simple workflows, or use one or many time saved nodes to calculate savings dynamically based on the actual execution path taken
* **Configure per-item calculations**: When using the Time Saved node, choose whether to calculate time saved once for all items or multiply by the number of items processed

The new Time Saved node provides increased accuracy for complex workflows where different execution paths save different amounts of time.

[![time saved node example](../_images/release-notes/time_saved_node_1.png)](https://docs.n8n.io/_images/release-notes/time_saved_node_1.png)

n8n automatically totals the time from all Time Saved nodes executed during each workflow run and reports it within the insights dashboard.

[![insights dashboard](../_images/release-notes/time_saved_node_2.png)](https://docs.n8n.io/_images/release-notes/time_saved_node_2.png)

### Contributors[#](#contributors_13)

[Akcthecoder200](https://github.com/Akcthecoder200)
[rishiraj-58](https://github.com/rishiraj-58)
[rlafferty](https://github.com/rlafferty)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.2[#](#n8n202)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.1...n8n@2.0.2) for this version.
**Release date:** 2025-12-12

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.1[#](#n8n201)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.0...n8n@2.0.1) for this version.
**Release date:** 2025-12-10

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.0[#](#n8n200)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.0-rc.3...n8n@2.0.0) for this version.
**Release date:** 2025-12-05

### Major Version Change[#](#major-version-change)

n8n 2.0.0 is a hardening release, not a feature release. It strengthens n8n's position as an enterprise-grade platform with secure-by-default execution, removal of legacy options that caused edge-case bugs, and better performance under load. The goal is a more predictable foundation you can rely on for mission-critical workflows.

This release is currently in **beta**. There's no urgency to upgrade immediately — take time to review the breaking changes and assess your workflows using the migration tool before upgrading.

For the full story behind 2.0, read our [announcement blog post](https://blog.n8n.io/introducing-n8n-2-0/).

### Breaking changes[#](#breaking-changes)

Version 2.0 includes breaking changes across security defaults, data handling, and configuration. Key changes include:

* Task runners enabled by default (Code node executions now run in isolated environments)
* Environment variable access blocked from Code nodes by default
* ExecuteCommand and LocalFileTrigger nodes disabled by default
* In-memory binary data mode removed

Review the complete list and migration guidance in the [v2.0 breaking changes docs.](https://docs.n8n.io/2-0-breaking-changes/)

### Before you upgrade[#](#before-you-upgrade)

Use the **Migration Report** tool to identify workflow-level and instance-level issues that need attention before upgrading.

See the [v2.0 migration tool docs](https://docs.n8n.io/migration-tool-v2/) for details.

### Product updates[#](#product-updates)

**Publish / Save workflow paradigm**

n8n 2.0 introduces a safer approach to updating live workflows. The `Save` button now preserves your edits without changing production. A new `Publish` button lets you explicitly push changes live when ready. See [Publish workflows](https://docs.n8n.io/workflows/publish/) for details.

**Canvas and navigation improvements**

Subtle refinements to the workflow editor canvas and reorganized sidebar navigation.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.0-rc.4[#](#n8n200-rc4)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.0-rc.3...n8n@2.0.0-rc.4) for this version.
**Release date:** 2025-12-05

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.0-rc.3[#](#n8n200-rc3)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.0-rc.2...n8n@2.0.0-rc.3) for this version.
**Release date:** 2025-12-04

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.0-rc.2[#](#n8n200-rc2)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.0-rc.1...n8n@2.0.0-rc.2) for this version.
**Release date:** 2025-12-04

This release contains a bug fix.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.0-rc.1[#](#n8n200-rc1)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@2.0.0-rc.0...n8n@2.0.0-rc.1) for this version.
**Release date:** 2025-12-04

This release contains bug fixes.

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

## n8n@2.0.0-rc.0[#](#n8n200-rc0)

View the [commits](https://github.com/n8n-io/n8n/compare/n8n@1.122.0...n8n@2.0.0-rc.0) for this version.
**Release date:** 2025-12-02

This release contains bug fixes.

### Contributors[#](#contributors_14)

[farzad528](https://github.com/farzad528)

For full release details, refer to [Releases](https://github.com/n8n-io/n8n/releases) on GitHub.

Older versions

You can find the release notes for older versions of n8n: [1.x](1-x/) and [0.x](0-x/)

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
